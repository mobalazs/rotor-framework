#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, '..', 'coverage.lcov');

console.log('Reading coverage file:', coverageFile);

// Read the coverage file
const lines = fs.readFileSync(coverageFile, 'utf8').split('\n');

console.log(`Total lines: ${lines.length}`);

let currentRecord = [];
const processedRecords = [];
let skippedCount = 0;
let processedCount = 0;

for (let line of lines) {
  // Remove any carriage returns (Windows line endings)
  line = line.replace(/\r/g, '');

  currentRecord.push(line);

  // Check if we reached the end of a record
  if (line.trim() === 'end_of_record') {
    // Check if this record is for a generated file
    const recordText = currentRecord.join('\n');
    const isGenerated = recordText.includes('/generated/');

    if (isGenerated) {
      skippedCount++;
    } else {
      // Replace .brs with .bs in the record
      const processedRecord = currentRecord.map(recordLine => {
        if (recordLine.startsWith('SF:')) {
          return recordLine.replace(/\.brs$/, '.bs');
        }
        return recordLine;
      });

      processedRecords.push(...processedRecord);
      processedCount++;
    }

    // Reset for next record
    currentRecord = [];
  }
}

console.log(`Skipped ${skippedCount} generated file records`);
console.log(`Processed ${processedCount} records`);

// Write the processed coverage file
const outputContent = processedRecords.join('\n');
fs.writeFileSync(coverageFile, outputContent, 'utf8');

console.log('Coverage file updated successfully!');
