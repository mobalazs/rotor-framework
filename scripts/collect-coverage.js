#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');
const http = require('http');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
}

const rokuHost = envVars.ROKU_DEV_TARGET;
const rokuPassword = envVars.ROKU_DEV_PASS;
const TELNET_PORT = 8085;

if (!rokuHost || !rokuPassword) {
  console.error('Error: ROKU_DEV_TARGET and ROKU_DEV_PASS must be set in .env file');
  process.exit(1);
}

// Paths
const projectRoot = path.join(__dirname, '..');
const manifestPath = path.join(projectRoot, 'src', 'manifest');
const outputFile = path.join(projectRoot, 'lcov.info');

// Backup and modify manifest
let originalManifest = '';
let manifestModified = false;

function modifyManifest() {
  console.log('Modifying manifest for unit testing...');

  // Read original manifest
  originalManifest = fs.readFileSync(manifestPath, 'utf8');

  // Modify bs_const to enable unittest
  const modifiedManifest = originalManifest.replace(
    /^bs_const=.*$/m,
    'bs_const=debug=true;unittest=true'
  );

  // Write modified manifest
  fs.writeFileSync(manifestPath, modifiedManifest, 'utf8');
  manifestModified = true;
  console.log('Manifest modified: unittest=true');
}

function restoreManifest() {
  if (manifestModified && originalManifest) {
    console.log('Restoring original manifest...');
    fs.writeFileSync(manifestPath, originalManifest, 'utf8');
    manifestModified = false;
    console.log('Manifest restored');
  }
}

// Flag to track if we're inside the coverage section
let isCapturing = false;

// Array to store coverage lines
const coverageLines = [];

// Modify manifest before building
modifyManifest();

console.log('Starting build and deploy to Roku device...');
console.log(`Target: ${rokuHost}`);

// Spawn the bsc process with deploy options
const buildProcess = spawn('npx', [
  'bsc',
  '--project', 'bsconfig-tests.json',
  '--deploy',
  '--host', rokuHost,
  '--password', rokuPassword
], {
  cwd: projectRoot,
  shell: true
});

// Handle stdout
buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
});

// Handle stderr
buildProcess.stderr.on('data', (data) => {
  const errorOutput = data.toString();
  console.error('STDERR:', errorOutput);
});

// Handle process exit
buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nBuild/Deploy failed with code: ${code}`);
    restoreManifest();
    process.exit(code);
  }

  console.log('\nDeploy successful! Connecting to Roku debug console...');

  // Connect to Roku telnet port to capture console output
  const telnetClient = net.createConnection({ host: rokuHost, port: TELNET_PORT }, () => {
    console.log('Connected to Roku debug console. Waiting for test output...\n');
  });

  let telnetBuffer = '';

  telnetClient.on('data', (data) => {
    const output = data.toString();
    telnetBuffer += output;

    // Split by lines and process each line
    const lines = output.split('\n');

    lines.forEach((line) => {
      // Check for start marker
      if (line.includes('+-=-coverage:start')) {
        isCapturing = true;
        console.log('\n=== Coverage section started ===');
        return;
      }

      // Check for end marker
      if (line.includes('+-=-coverage:end')) {
        isCapturing = false;
        console.log('=== Coverage section ended ===\n');

        // Write coverage data and close connection
        writeCoverageAndExit(telnetClient);
        return;
      }

      // Capture lines between markers (skip unwanted lines)
      if (isCapturing && line.trim() !== '') {
        // Skip Rooibos debug messages and markers
        if (!line.includes('Generating lcov.info file') &&
            !line.includes('end_of_record')) {
          coverageLines.push(line);
        }
      }

      // Print console output
      process.stdout.write(line + '\n');
    });
  });

  telnetClient.on('error', (err) => {
    console.error('Telnet connection error:', err.message);
    restoreManifest();
    process.exit(1);
  });

  telnetClient.on('end', () => {
    console.log('Telnet connection closed by device');
    writeCoverageAndExit(null);
  });

  // Set timeout for coverage collection (5 minutes)
  setTimeout(() => {
    console.log('\nTimeout reached. Closing connection...');
    writeCoverageAndExit(telnetClient);
  }, 300000);
});

// Handle process errors
buildProcess.on('error', (error) => {
  console.error('Failed to start process:', error);
  restoreManifest();
  process.exit(1);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\nTerminating...');
  buildProcess.kill('SIGINT');
  restoreManifest();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating...');
  buildProcess.kill('SIGTERM');
  restoreManifest();
  process.exit(0);
});

function sendExitSignalToDevice() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: rokuHost,
      port: 8060,
      path: '/keypress/Home',
      method: 'POST'
    };

    const req = http.request(options, (res) => {
      console.log('Exit signal sent to device (Home button pressed)');
      resolve();
    });

    req.on('error', (err) => {
      console.error('Failed to send exit signal:', err.message);
      // Don't reject, just resolve to continue with cleanup
      resolve();
    });

    req.end();
  });
}

function writeCoverageAndExit(telnetClient) {
  if (telnetClient) {
    telnetClient.end();
  }

  // Restore manifest first
  restoreManifest();

  // Write captured coverage lines to lcov.info
  if (coverageLines.length > 0) {
    const lcovContent = coverageLines.join('\n') + '\n';

    fs.writeFileSync(outputFile, lcovContent, 'utf8');
    console.log(`\nCoverage data written to: ${outputFile}`);
    console.log(`Total lines captured: ${coverageLines.length}`);

    // Send exit signal to device before exiting
    sendExitSignalToDevice().then(() => {
      process.exit(0);
    });
  } else {
    console.log('\nNo coverage data found between markers.');

    // Send exit signal even if no coverage data was found
    sendExitSignalToDevice().then(() => {
      process.exit(1);
    });
  }
}
