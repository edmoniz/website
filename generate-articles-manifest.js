/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: generate-articles-manifest.js

  Scans the Articles/ folder and writes articles-manifest.json, which
  articles.js reads at page load to build the vertical articles menu.

  Use this for a static deployment (e.g. the live Caddy file_server, which
  has no Node runtime to compute the manifest itself). Run it any time an
  article folder is added, removed, or renamed:
    node generate-articles-manifest.js

  For local development, dev-server.js computes this manifest fresh on
  every request instead, so no rebuild step is needed.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const { buildManifest } = require('./manifest-lib');

const articlesDir = path.join(__dirname, 'Articles');
const outputFile = path.join(__dirname, 'articles-manifest.json');

const entries = buildManifest(articlesDir);

fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2) + '\n');
console.log(`Wrote ${entries.length} article entr${entries.length === 1 ? 'y' : 'ies'} to ${path.basename(outputFile)}:`);
entries.forEach(e => console.log(`  - ${e.title} (${e.folder}/${e.file})`));
