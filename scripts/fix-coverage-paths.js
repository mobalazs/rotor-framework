#!/usr/bin/env node

/**
 * Normalize LCOV paths for Coveralls:
 * - drop generated records
 * - make SF paths repo-relative (strip absolute prefixes)
 * - optionally strip leading `src/` so you can use base-path: src
 * - convert .brs -> .bs
 */

const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, '..', 'coverage.lcov');
const keepSrcPrefix = false; // ha Coveralls-ban base-path: "src", állítsd true-ra és ne vágd le a "src/"-t

console.log('Reading coverage file:', coverageFile);

const raw = fs.readFileSync(coverageFile, 'utf8');
// biztonság kedvéért normalizáljuk a CRLF-et
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
// ha nem zárult le az utolsó rekord, dobjuk
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
  // "SF:<path>"
  let p = line.slice(3).trim();

  // backslash -> slash
  p = p.replace(/\\/g, '/');

  // ha bármelyik "generated" szegmens szerepel, jelezzük a hívónak
  if (p.includes('/generated/')) {
    return { drop: true };
  }

  // próbáljuk repo-relatívvá tenni
  // keresési sorrend: /src/ , /components/ , /source/
  let newPath = p;

  const idxSrc = newPath.indexOf('/src/');
  const idxComponents = newPath.indexOf('/components/');
  const idxSource = newPath.indexOf('/source/');

  if (idxSrc >= 0) {
    newPath = newPath.substring(idxSrc + (keepSrcPrefix ? 1 : 5)); // ha keepSrcPrefix=false, levágjuk a "src/"-t
    if (!keepSrcPrefix) stats.srcStripped++;
    else stats.absTrimmed++;
  } else {
    // ha nincs /src/, akkor próbáljunk a components/source szegmensre vágni
    let cutIdx = -1;
    if (idxComponents >= 0) cutIdx = idxComponents + 1;
    else if (idxSource >= 0) cutIdx = idxSource + 1;

    if (cutIdx > 0) {
      stats.absTrimmed++;
      newPath = newPath.substring(cutIdx);
    } else {
      // ha abszolút út (pl. /Users/... vagy C:/...), próbáljunk az első előforduló "components/" vagy "source/" után vágni
      const m = newPath.match(/[/]?(components|source)\/.*/);
      if (m) {
        stats.absTrimmed++;
        newPath = m[0].replace(/^\/+/, '');
      } else {
        // nem tudtuk repo-relatívvá tenni -> marad
      }
    }
  }

  // kiterjesztés csere .brs -> .bs
  if (/\.brs$/i.test(newPath)) {
    newPath = newPath.replace(/\.brs$/i, '.bs');
    stats.brsToBs++;
  }

  // ha semmit nem változtattunk
  if (('SF:' + p) === ('SF:' + newPath)) {
    stats.unchanged++;
  }

  return { line: 'SF:' + newPath, drop: false };
}

for (const record of records) {
  total++;

  // keresd meg az SF sort
  const sfIdx = record.findIndex(l => l.startsWith('SF:'));
  if (sfIdx === -1) {
    // nincs SF -> hagyjuk változatlanul
    out.push(...record);
    processed++;
    continue;
  }

  const sfLine = record[sfIdx];
  const res = rewriteSfLine(sfLine);

  if (res.drop) {
    skippedGenerated++;
    continue; // teljes rekord eldobása
  }

  // írd vissza az SF sort
  const newRec = record.slice();
  newRec[sfIdx] = res.line;

  out.push(...newRec);
  processed++;
}

const output = out.join('\n') + '\n';
fs.writeFileSync(coverageFile, output, 'utf8');

console.log(`Processed records: ${processed}/${total}`);
console.log(`Skipped generated: ${skippedGenerated}`);
console.log(`Path trims (abs/src): ${stats.absTrimmed}${keepSrcPrefix ? '' : `, src stripped: ${stats.srcStripped}`}`);
console.log(`.brs → .bs changes: ${stats.brsToBs}`);
console.log(`Unchanged SF lines: ${stats.unchanged}`);
console.log('Coverage file updated successfully!');
