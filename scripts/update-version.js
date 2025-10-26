const fs = require('fs');
const path = require('path');

// Get version from command line argument or package.json
const version = process.argv[2] || require('../package.json').version;

// Validate version format (e.g., "0.2.3")
if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('Invalid version format. Expected: X.Y.Z (e.g., 0.2.3)');
    process.exit(1);
}

const [major, minor, build] = version.split('.');

console.log(`Updating version to ${version}...`);

// 1. Update package.json
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = version;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, '\t') + '\n');
console.log('✓ Updated package.json');

// 2. Update manifest
const manifestPath = path.join(__dirname, '../src/manifest');
let manifest = fs.readFileSync(manifestPath, 'utf8');
manifest = manifest.replace(/major_version=\d+/, `major_version=${major}`);
manifest = manifest.replace(/minor_version=\d+/, `minor_version=${minor}`);
manifest = manifest.replace(/build_version=\d+/, `build_version=${build}`);
fs.writeFileSync(manifestPath, manifest);
console.log('✓ Updated manifest');

// 3. Update RotorFramework.bs (2 places: header comment and version variable)
const frameworkPath = path.join(__dirname, '../src/source/rotor/RotorFramework.bs');
let framework = fs.readFileSync(frameworkPath, 'utf8');
// Update header comment
framework = framework.replace(/(' Version )\d+\.\d+\.\d+/, `$1${version}`);
// Update version variable
framework = framework.replace(/(version = ")\d+\.\d+\.\d+(")/, `$1${version}$2`);
fs.writeFileSync(frameworkPath, framework);
console.log('✓ Updated RotorFramework.bs');

// 4. Update RotorFrameworkTask.bs (2 places: header comment and version variable)
const taskPath = path.join(__dirname, '../src/source/rotor/RotorFrameworkTask.bs');
let task = fs.readFileSync(taskPath, 'utf8');
// Update header comment
task = task.replace(/(' Version )\d+\.\d+\.\d+/, `$1${version}`);
// Update version variable
task = task.replace(/(version = ")\d+\.\d+\.\d+(")/, `$1${version}$2`);
fs.writeFileSync(taskPath, task);
console.log('✓ Updated RotorFrameworkTask.bs');

console.log(`\n✅ Successfully updated all version references to ${version}`);
