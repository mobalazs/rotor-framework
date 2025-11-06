# Release Guide

This document describes the automated release process for Rotor Framework.

## Quick Start

The release process is fully automated. Use one of these commands:

```bash
# Patch release (0.3.5 -> 0.3.6)
npm run release:patch

# Minor release (0.3.5 -> 0.4.0)
npm run release:minor

# Major release (0.3.5 -> 1.0.0)
npm run release:major
```

## What Happens During Release

The automated release script performs the following steps:

1. **Validates Preconditions**
   - Checks you're on the `main` branch
   - Ensures working directory is clean (no uncommitted changes)
   - Verifies local branch is in sync with remote

2. **Bumps Version**
   - Increments version number according to semver
   - Updates version in all files:
     - `package.json`
     - `src/manifest`
     - `src/source/RotorFramework.bs`
     - `src/source/RotorFrameworkTask.bs`
     - `README.md`

3. **Creates Commit**
   - Commits version changes with message: `chore: bump version to X.Y.Z`

4. **Creates Git Tag**
   - Creates an annotated tag: `vX.Y.Z`

5. **Pushes to Remote**
   - Pushes the commit to `main` branch
   - Pushes the tag

6. **Triggers GitHub Workflow**
   - Tag push triggers `.github/workflows/tag-release-workflow.yml`
   - Workflow creates GitHub Release
   - Workflow publishes to npm automatically

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backwards compatible)
- **PATCH** (0.0.X): Bug fixes (backwards compatible)

### When to Use Each Type

**Patch Release** (`npm run release:patch`):
- Bug fixes
- Documentation updates
- Internal refactoring (no API changes)
- Performance improvements

**Minor Release** (`npm run release:minor`):
- New features
- New public APIs
- Deprecation warnings (but not removal)
- Significant documentation additions

**Major Release** (`npm run release:major`):
- Breaking API changes
- Removal of deprecated features
- Major architectural changes
- Incompatible version updates

## Troubleshooting

### "Not on main branch"
```bash
git checkout main
```

### "Git working directory is not clean"
```bash
# Commit your changes
git add .
git commit -m "your message"

# Or stash them
git stash
```

### "Local main branch is not in sync with remote"
```bash
git pull origin main
```

### Manual Rollback

If you need to undo a release (before it's published):

```bash
# Delete local tag
git tag -d vX.Y.Z

# Delete remote tag
git push origin :refs/tags/vX.Y.Z

# Reset commit (if not pushed)
git reset --hard HEAD~1
```

⚠️ **Warning:** Only rollback if the release hasn't been published to npm yet!

## GitHub Workflow

The `.github/workflows/tag-release-workflow.yml` workflow runs when a tag is pushed:

1. **Checkout Code** - Fetches repository with full history
2. **Setup Environment** - Configures Git and Node.js
3. **Install Dependencies** - Runs `npm ci`
4. **Extract Version** - Gets version from tag name
5. **Create Source Package** - Builds ZIP with source files
6. **Create GitHub Release** - Creates release with auto-generated notes
7. **Build npm Package** - Compiles and packages for npm
8. **Publish to npm** - Publishes package to npm registry

## Best Practices

1. **Always release from main branch** - Never release from feature branches
2. **Pull before releasing** - Ensure you have latest changes
3. **Test before releasing** - Run tests with `npm run coverage`
4. **Review changes** - Use `git log` to verify what will be released
5. **One release at a time** - Don't create multiple releases in parallel

## Release Checklist

Before running a release:

- [ ] All tests passing (`npm run coverage`)
- [ ] No uncommitted changes
- [ ] On `main` branch
- [ ] Local `main` synced with remote
- [ ] Reviewed changes since last release
- [ ] Decided correct version bump type (patch/minor/major)

## Examples

### Example 1: Bug Fix Release

```bash
# Current version: 0.3.5
# Fixed a bug in i18n service

npm run release:patch
# Creates version 0.3.6
```

### Example 2: New Feature Release

```bash
# Current version: 0.3.6
# Added new focus navigation features

npm run release:minor
# Creates version 0.4.0
```

### Example 3: Breaking Change Release

```bash
# Current version: 0.4.0
# Changed ViewBuilder API (breaking change)

npm run release:major
# Creates version 1.0.0
```

## Monitoring Releases

After running a release command:

1. **Check GitHub Actions**
   - Go to: `https://github.com/<owner>/<repo>/actions`
   - Verify workflow is running successfully

2. **Check GitHub Releases**
   - Go to: `https://github.com/<owner>/<repo>/releases`
   - Verify release was created with correct version

3. **Check npm**
   - Go to: `https://www.npmjs.com/package/rotor-framework`
   - Verify new version is published (may take a few minutes)

## Getting Help

If you encounter issues:

1. Check this document
2. Review error messages carefully
3. Check GitHub Actions logs
4. Open an issue if needed

## Notes

- Release notes are auto-generated from commit messages
- Tags follow format: `vX.Y.Z` (with 'v' prefix)
- Commit message format: `chore: bump version to X.Y.Z`
- Workflow includes `[skip ci]` to prevent infinite loops (not needed anymore with new approach)
