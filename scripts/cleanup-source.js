#!/usr/bin/env node

/**
 * Cleans up BrighterScript (.bs) source files by:
 * - Removing comments (both single-line ' and multi-line REM)
 * - Removing unnecessary whitespace and blank lines
 * - Preserving string literals and their contents
 */

const fs = require('fs');
const path = require('path');

function minifyBrighterScript(content) {
    let result = '';
    let i = 0;
    const len = content.length;

    // Track if we're inside a string literal
    let inString = false;
    let stringChar = null;

    while (i < len) {
        const char = content[i];
        const nextChar = i + 1 < len ? content[i + 1] : null;
        const restOfLine = content.substring(i);

        // Handle string literals (preserve everything inside)
        if (!inString && (char === '"' || char === "'")) {
            inString = true;
            stringChar = char;
            result += char;
            i++;
            continue;
        }

        if (inString) {
            result += char;
            if (char === stringChar && content[i - 1] !== '\\') {
                inString = false;
                stringChar = null;
            }
            i++;
            continue;
        }

        // Skip single-line comments (')
        if (char === "'" && !inString) {
            // Skip until end of line
            while (i < len && content[i] !== '\n') {
                i++;
            }
            continue;
        }

        // Skip REM comments (case insensitive)
        if (!inString && restOfLine.match(/^rem\s/i)) {
            // Skip until end of line
            while (i < len && content[i] !== '\n') {
                i++;
            }
            continue;
        }

        // Handle whitespace
        if (char === ' ' || char === '\t') {
            // Collapse multiple spaces to single space
            if (result[result.length - 1] !== ' ') {
                result += ' ';
            }
            i++;
            continue;
        }

        // Handle newlines - keep only one if previous content exists
        if (char === '\n' || char === '\r') {
            // Skip carriage returns
            if (char === '\r') {
                i++;
                continue;
            }

            // Remove trailing whitespace from current line
            result = result.trimEnd();

            // Add newline only if there's content and previous char isn't already newline
            if (result.length > 0 && result[result.length - 1] !== '\n') {
                result += '\n';
            }
            i++;
            continue;
        }

        // Regular character
        result += char;
        i++;
    }

    // Final cleanup: remove blank lines (multiple consecutive newlines)
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 1 blank line
    result = result.replace(/\n\s*\n/g, '\n'); // Remove all blank lines
    result = result.trim() + '\n'; // Ensure single trailing newline

    return result;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.name.endsWith('.bs')) {
            // Skip test files
            if (file.name.endsWith('.spec.bs')) {
                continue;
            }

            console.log(`Cleaning up: ${fullPath}`);
            const content = fs.readFileSync(fullPath, 'utf8');
            const minified = minifyBrighterScript(content);

            // Calculate size reduction
            const originalSize = Buffer.byteLength(content, 'utf8');
            const minifiedSize = Buffer.byteLength(minified, 'utf8');
            const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

            console.log(`  ${originalSize} → ${minifiedSize} bytes (-${reduction}%)`);

            fs.writeFileSync(fullPath, minified, 'utf8');
        }
    }
}

// Main execution
const targetDir = process.argv[2];

if (!targetDir) {
    console.error('Usage: node cleanup-source.js <directory>');
    process.exit(1);
}

if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
}

console.log(`Starting cleanup in: ${targetDir}\n`);
processDirectory(targetDir);
console.log('\nCleanup complete!');
