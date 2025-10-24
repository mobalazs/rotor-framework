/**
 * BrighterScript plugin that modifies the manifest bs_const value
 * to enable unittest mode for coverage collection.
 *
 * Works with brighterscript 1.0.0-alpha.48
 *
 * Strategy:
 * - Modify src/manifest BEFORE roku-deploy copies files
 * - Restore after build completes
 */

const fs = require('fs');
const path = require('path');

class ManifestModifierPlugin {
  name = 'ManifestModifierPlugin';

  constructor() {
    this.originalManifest = null;
    this.manifestPath = null;
    this.modified = false;
  }

  /**
   * Run EARLY - modify src/manifest before it's loaded
   */
  afterProgramCreate(event) {
    const { program } = event;

    // Get the source manifest path (rootDir is where src files are)
    const rootDir = program.options.rootDir || 'src';
    this.manifestPath = path.resolve(rootDir, 'manifest');

    if (!fs.existsSync(this.manifestPath)) {
      console.log('[ManifestModifierPlugin] Manifest not found at:', this.manifestPath);
      return;
    }

    // Backup original content
    this.originalManifest = fs.readFileSync(this.manifestPath, 'utf8');

    const originalBsConst = (this.originalManifest.match(/^bs_const=(.*)$/m) || [])[1];
    console.log('[ManifestModifierPlugin] Original bs_const:', originalBsConst);

    // Modify bs_const to enable unittest
    const modifiedManifest = this.originalManifest.replace(
      /^bs_const=.*$/m,
      'bs_const=debug=true;unittest=true'
    );

    // Write modified manifest to src/
    fs.writeFileSync(this.manifestPath, modifiedManifest, 'utf8');
    this.modified = true;

    console.log('[ManifestModifierPlugin] ✓ Modified src/manifest (file)');

    // ALSO modify the in-memory manifest that BrighterScript uses
    if (program._manifest) {
      program._manifest.set('bs_const', 'debug=true;unittest=true');
      console.log('[ManifestModifierPlugin] ✓ Modified program._manifest (memory)');
    }

    // Force reload manifest from modified file
    program.loadManifest({ src: this.manifestPath }, true);
    console.log('[ManifestModifierPlugin] ✓ Reloaded manifest into program');
  }

  /**
   * Run AFTER package is created - restore original manifest
   * This is the LAST event before process exits
   */
  afterSerializeProgram() {
    if (this.modified && this.originalManifest && this.manifestPath) {
      // Restore original manifest
      fs.writeFileSync(this.manifestPath, this.originalManifest, 'utf8');
      console.log('[ManifestModifierPlugin] ✓ Restored original src/manifest');

      this.modified = false;
      this.originalManifest = null;
    }
  }
}

module.exports = function() {
  return new ManifestModifierPlugin();
};
