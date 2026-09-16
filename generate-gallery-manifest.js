/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: generate-gallery-manifest.js

  Scans the Galleries/ folder and writes galleries-manifest.json, which
  galleries.js reads at page load to build the vertical gallery menu.

  Use this for a static deployment (e.g. the live Caddy file_server, which
  has no Node runtime to compute the manifest itself). Run it any time a
  gallery folder is added, removed, or renamed:
    node generate-gallery-manifest.js

  For local development, dev-server.js computes this manifest fresh on
  every request instead, so no rebuild step is needed.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const { buildGalleryManifest } = require('./manifest-lib');

const galleriesDir = path.join(__dirname, 'Galleries');
const outputFile = path.join(__dirname, 'galleries-manifest.json');

const entries = buildGalleryManifest(galleriesDir);

fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2) + '\n');
console.log(`Wrote ${entries.length} gallery entr${entries.length === 1 ? 'y' : 'ies'} to ${path.basename(outputFile)}:`);
entries.forEach(e => console.log(`  - ${e.title} (${e.folder}/${e.file})`));
