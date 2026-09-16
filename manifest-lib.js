/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: manifest-lib.js

  Shared logic for scanning Galleries/ into a manifest array. Used by
  generate-gallery-manifest.js (static build output) and dev-server.js
  (computed fresh on every request).
*/

'use strict';

const fs = require('fs');
const path = require('path');

function extractTitle(html, fallback) {
  const match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!match) return fallback;
  return match[1].replace(/<[^>]+>/g, '').trim() || fallback;
}

function buildGalleryManifest(galleriesDir) {
  if (!fs.existsSync(galleriesDir)) return [];

  return fs.readdirSync(galleriesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const folderName = entry.name;
      const folderPath = path.join(galleriesDir, folderName);
      const htmlFile = fs.readdirSync(folderPath)
        .find(fileName => fileName.toLowerCase().endsWith('.html'));

      if (!htmlFile) return null;

      const html = fs.readFileSync(path.join(folderPath, htmlFile), 'utf8');
      const title = extractTitle(html, folderName);

      return { folder: folderName, file: htmlFile, title };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

module.exports = { buildGalleryManifest };
