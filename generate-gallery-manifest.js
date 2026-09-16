/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: generate-gallery-manifest.js

  Scans the Galleries/ folder and writes galleries-manifest.json, which
  galleries.js reads at page load to build the vertical gallery menu.

  Run this any time a gallery folder is added, removed, or renamed:
    node generate-gallery-manifest.js
*/

'use strict';

const fs = require('fs');
const path = require('path');

const galleriesDir = path.join(__dirname, 'Galleries');
const outputFile = path.join(__dirname, 'galleries-manifest.json');

function extractTitle(html, fallback) {
  const match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!match) return fallback;
  return match[1].replace(/<[^>]+>/g, '').trim() || fallback;
}

function buildManifest() {
  const entries = fs.readdirSync(galleriesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const folderName = entry.name;
      const folderPath = path.join(galleriesDir, folderName);
      const htmlFile = fs.readdirSync(folderPath)
        .find(fileName => fileName.toLowerCase().endsWith('.html'));

      if (!htmlFile) {
        console.warn(`Skipping "${folderName}": no .html file found inside it.`);
        return null;
      }

      const html = fs.readFileSync(path.join(folderPath, htmlFile), 'utf8');
      const title = extractTitle(html, folderName);

      return { folder: folderName, file: htmlFile, title };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));

  fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2) + '\n');
  console.log(`Wrote ${entries.length} gallery entr${entries.length === 1 ? 'y' : 'ies'} to ${path.basename(outputFile)}:`);
  entries.forEach(e => console.log(`  - ${e.title} (${e.folder}/${e.file})`));
}

buildManifest();
