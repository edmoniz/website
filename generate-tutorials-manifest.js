/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: generate-tutorials-manifest.js

  Scans the Tutorials/ folder and writes tutorials-manifest.json, which
  tutorials.js reads at page load to build the vertical tutorials menu.

  Use this for a static deployment (e.g. the live Caddy file_server, which
  has no Node runtime to compute the manifest itself). Run it any time a
  tutorial folder is added, removed, or renamed:
    node generate-tutorials-manifest.js

  For local development, dev-server.js computes this manifest fresh on
  every request instead, so no rebuild step is needed.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const { buildManifest } = require('./manifest-lib');

const tutorialsDir = path.join(__dirname, 'Tutorials');
const outputFile = path.join(__dirname, 'tutorials-manifest.json');

const entries = buildManifest(tutorialsDir);

fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2) + '\n');
console.log(`Wrote ${entries.length} tutorial entr${entries.length === 1 ? 'y' : 'ies'} to ${path.basename(outputFile)}:`);
entries.forEach(e => console.log(`  - ${e.title} (${e.folder}/${e.file})`));
