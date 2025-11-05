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
const outputFile = path.join(projectRoot, 'coverage.lcov');
const debugLogFile = path.join(projectRoot, 'debug.log');

// Flag to track if we're inside the coverage section
let isCapturing = false;

// Array to store coverage lines
const coverageLines = [];

// Array to store all terminal output for debug log
const debugLog = [];

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

    // Store all output for debug log
    debugLog.push(output);

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
        // Skip Rooibos debug messages
        if (!line.includes('Generating')) {
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

function fixCoveragePaths() {
  console.log('\nFixing coverage file paths...');

  const keepSrcPrefix = false;
  const raw = fs.readFileSync(outputFile, 'utf8');
  const lines = raw.replace(/\r/g, '').split('\n');

  let records = [];
  let rec = [];

  for (const line of lines) {
    rec.push(line);
    if (line.trim() === 'end_of_record') {
      records.push(rec);
      rec = [];
    }
  }

  if (rec.length > 0) {
    console.warn('⚠️  Trailing partial record ignored (missing end_of_record).');
  }

  let out = [];
  let skippedGenerated = 0;
  let total = 0;
  let processed = 0;

  let stats = {
    absTrimmed: 0,
    srcStripped: 0,
    brsToBs: 0,
    unchanged: 0
  };

  function rewriteSfLine(line) {
    let p = line.slice(3).trim();
    p = p.replace(/\\/g, '/');

    if (p.includes('/generated/')) {
      return { drop: true };
    }

    let newPath = p;

    const idxSrc = newPath.indexOf('/src/');
    const idxComponents = newPath.indexOf('/components/');
    const idxSource = newPath.indexOf('/source/');

    if (idxSrc >= 0) {
      newPath = newPath.substring(idxSrc + (keepSrcPrefix ? 1 : 5));
      if (!keepSrcPrefix) stats.srcStripped++;
      else stats.absTrimmed++;
    } else {
      let cutIdx = -1;
      if (idxComponents >= 0) cutIdx = idxComponents + 1;
      else if (idxSource >= 0) cutIdx = idxSource + 1;

      if (cutIdx > 0) {
        stats.absTrimmed++;
        newPath = newPath.substring(cutIdx);
      } else {
        const m = newPath.match(/[/]?(components|source)\/.*/);
        if (m) {
          stats.absTrimmed++;
          newPath = m[0].replace(/^\/+/, '');
        }
      }
    }

    if (/\.brs$/i.test(newPath)) {
      newPath = newPath.replace(/\.brs$/i, '.bs');
      stats.brsToBs++;
    }

    if (('SF:' + p) === ('SF:' + newPath)) {
      stats.unchanged++;
    }

    return { line: 'SF:' + newPath, drop: false };
  }

  for (const record of records) {
    total++;

    const sfIdx = record.findIndex(l => l.startsWith('SF:'));
    if (sfIdx === -1) {
      out.push(...record);
      processed++;
      continue;
    }

    const sfLine = record[sfIdx];
    const res = rewriteSfLine(sfLine);

    if (res.drop) {
      skippedGenerated++;
      continue;
    }

    const newRec = record.slice();
    newRec[sfIdx] = res.line;

    out.push(...newRec);
    processed++;
  }

  const output = out.join('\n') + '\n';
  fs.writeFileSync(outputFile, output, 'utf8');

  console.log(`Processed records: ${processed}/${total}`);
  console.log(`Skipped generated: ${skippedGenerated}`);
  console.log(`Path trims (abs/src): ${stats.absTrimmed}${keepSrcPrefix ? '' : `, src stripped: ${stats.srcStripped}`}`);
  console.log(`.brs → .bs changes: ${stats.brsToBs}`);
  console.log(`Unchanged SF lines: ${stats.unchanged}`);
  console.log('Coverage file paths fixed successfully!');
}

function writeCoverageAndExit(telnetClient) {
  if (telnetClient) {
    telnetClient.end();
  }

  // Write full debug log to debug.log
  if (debugLog.length > 0) {
    const debugLogContent = debugLog.join('');
    fs.writeFileSync(debugLogFile, debugLogContent, 'utf8');
    console.log(`\nFull debug log written to: ${debugLogFile}`);
  }

  // Write captured coverage lines to coverage.lcov
  if (coverageLines.length > 0) {
    const lcovContent = coverageLines.join('\n') + '\n';

    fs.writeFileSync(outputFile, lcovContent, 'utf8');
    console.log(`Coverage data written to: ${outputFile}`);
    console.log(`Total lines captured: ${coverageLines.length}`);

    // Fix coverage file paths
    fixCoveragePaths();

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
