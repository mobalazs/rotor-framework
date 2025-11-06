#!/usr/bin/env node

/**
 * Automated Release Script
 *
 * This script automates the version bump, commit, tag, and push process.
 *
 * Usage:
 *   npm run release:patch  # 0.3.5 -> 0.3.6
 *   npm run release:minor  # 0.3.5 -> 0.4.0
 *   npm run release:major  # 0.3.5 -> 1.0.0
 *
 * Process:
 *   1. Validates git status (must be clean, on main branch)
 *   2. Bumps version using semver
 *   3. Updates version in all files
 *   4. Commits changes
 *   5. Creates git tag
 *   6. Pushes commit and tag to remote
 *   7. Triggers GitHub workflow for release
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const MAIN_BRANCH = 'main';
const VERSION_FILES = [
  'package.json',
  'src/manifest',
  'src/source/RotorFramework.bs',
  'src/source/RotorFrameworkTask.bs',
  'README.md'
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Execute shell command and return output
 */
function exec(command, silent = false) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    }).trim();
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Execute shell command and return output (allows failure)
 */
function execSafe(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
}

/**
 * Bump version using semver logic
 */
function bumpVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number);
  const [major, minor, patch] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${bumpType}. Use 'major', 'minor', or 'patch'.`);
  }
}

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

/**
 * Check if git working directory is clean
 */
function isGitClean() {
  const status = execSafe('git status --porcelain');
  return status === '';
}

/**
 * Get current git branch
 */
function getCurrentBranch() {
  return execSafe('git rev-parse --abbrev-ref HEAD');
}

/**
 * Check if branch exists on remote
 */
function remoteBranchExists(branch) {
  const result = execSafe(`git ls-remote --heads origin ${branch}`);
  return result !== '';
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate preconditions before release
 */
function validatePreconditions() {
  console.log('🔍 Validating preconditions...\n');

  // Check if we're in a git repository
  if (!fs.existsSync('.git')) {
    console.error('❌ Not in a git repository!');
    process.exit(1);
  }

  // Check if on main branch
  const currentBranch = getCurrentBranch();
  if (currentBranch !== MAIN_BRANCH) {
    console.error(`❌ Not on ${MAIN_BRANCH} branch! Current branch: ${currentBranch}`);
    console.error(`   Please switch to ${MAIN_BRANCH}: git checkout ${MAIN_BRANCH}`);
    process.exit(1);
  }

  // Check if working directory is clean
  if (!isGitClean()) {
    console.error('❌ Git working directory is not clean!');
    console.error('   Please commit or stash your changes first.');
    exec('git status --short', true);
    process.exit(1);
  }

  // Check if main branch is up to date with remote
  console.log('📡 Fetching from remote...');
  exec('git fetch origin', true);

  const localCommit = execSafe('git rev-parse HEAD');
  const remoteCommit = execSafe(`git rev-parse origin/${MAIN_BRANCH}`);

  if (localCommit !== remoteCommit) {
    console.error(`❌ Local ${MAIN_BRANCH} branch is not in sync with remote!`);
    console.error('   Please pull latest changes: git pull origin main');
    process.exit(1);
  }

  console.log('✅ All preconditions validated\n');
}

// ============================================================================
// Release Functions
// ============================================================================

/**
 * Main release function
 */
function release(bumpType) {
  console.log('🚀 Starting automated release process...\n');

  // Validate preconditions
  validatePreconditions();

  // Get versions
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, bumpType);

  console.log(`📦 Version bump: ${currentVersion} -> ${newVersion} (${bumpType})\n`);

  // Confirm with user
  console.log('📋 This will:');
  console.log(`   1. Update version to ${newVersion} in all files`);
  console.log('   2. Commit changes');
  console.log(`   3. Create tag v${newVersion}`);
  console.log('   4. Push commit and tag to remote');
  console.log(`   5. Trigger GitHub release workflow\n`);

  // Update version in all files
  console.log('📝 Updating version in files...');
  exec(`node scripts/update-version.js ${newVersion}`, true);

  // Verify files were updated
  VERSION_FILES.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✓ ${file}`);
    } else {
      console.warn(`   ⚠ ${file} not found`);
    }
  });
  console.log();

  // Stage changes
  console.log('📥 Staging changes...');
  exec(`git add ${VERSION_FILES.join(' ')}`, true);
  console.log();

  // Commit
  const commitMessage = `chore: bump version to ${newVersion}`;
  console.log(`💾 Committing: "${commitMessage}"`);
  exec(`git commit -m "${commitMessage}"`, true);
  console.log();

  // Create tag
  const tagName = `v${newVersion}`;
  console.log(`🏷️  Creating tag: ${tagName}`);
  exec(`git tag ${tagName}`, true);
  console.log();

  // Push commit and tag
  console.log('📤 Pushing to remote...');
  console.log(`   • Pushing commit to ${MAIN_BRANCH}...`);
  exec(`git push origin ${MAIN_BRANCH}`, true);
  console.log(`   • Pushing tag ${tagName}...`);
  exec(`git push origin ${tagName}`, true);
  console.log();

  // Success message
  console.log('✅ Release completed successfully!\n');
  console.log('📦 Next steps:');
  console.log(`   • GitHub workflow will create release for ${tagName}`);
  console.log(`   • Package will be published to npm automatically`);
  console.log(`   • Check workflow status: https://github.com/<owner>/<repo>/actions\n`);

  console.log(`🎉 Version ${newVersion} released!`);
}

// ============================================================================
// Main Script
// ============================================================================

function main() {
  const bumpType = process.argv[2];

  if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('❌ Invalid or missing bump type!');
    console.error('\nUsage:');
    console.error('  npm run release:patch  # 0.3.5 -> 0.3.6');
    console.error('  npm run release:minor  # 0.3.5 -> 0.4.0');
    console.error('  npm run release:major  # 0.3.5 -> 1.0.0');
    process.exit(1);
  }

  try {
    release(bumpType);
  } catch (error) {
    console.error('\n❌ Release failed!');
    console.error(error.message);
    process.exit(1);
  }
}

// Run main function if script is executed directly
if (require.main === module) {
  main();
}

module.exports = { release, bumpVersion };
