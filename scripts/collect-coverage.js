#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');
const http = require('http');

// Load environment variables from .env file (fallback for local development)
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

// Use process.env first (for GitHub Actions), then fall back to .env file
const rokuHost = process.env.ROKU_DEV_TARGET || envVars.ROKU_DEV_TARGET;
const rokuPassword = process.env.ROKU_DEV_PASS || envVars.ROKU_DEV_PASS;
const TELNET_PORT = 8085;

if (!rokuHost || !rokuPassword) {
  console.error('Error: ROKU_DEV_TARGET and ROKU_DEV_PASS must be set (either as environment variables or in .env file)');
  process.exit(1);
}

// Paths
const projectRoot = path.join(__dirname, '..');
const outputFile = path.join(projectRoot, 'lcov.info');

// Flag to track if we're inside the coverage section
let isCapturing = false;

// Array to store coverage lines
const coverageLines = [];

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
  process.exit(1);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\nTerminating...');
  buildProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating...');
  buildProcess.kill('SIGTERM');
  process.exit(0);
});

function sendExitSignalToDevice() {
  return new Promise((resolve) => {
    const options = {
      hostname: rokuHost,
      port: 8060,
      path: '/keypress/Home',
      method: 'POST'
    };

    const req = http.request(options, () => {
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
