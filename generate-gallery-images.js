/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: generate-gallery-images.js

  Scans every images-only and folio gallery folder under Galleries/ (a
  folder with no .html file, just image files) and writes an images.json
  into it. For an images-only gallery this is built from the image files
  and their .xmp metadata, giving each image a caption; for a folio
  (folder name contains "Folio") captions are skipped entirely. galleries.js
  fetches that file at page load to render the gallery's heading and
  figures with no hand-written HTML at all.

  Use this for a static deployment (e.g. the live Caddy file_server,
  which has no Node runtime to compute this itself). Run it any time
  images are added, removed, or retitled in an images-only or folio
  gallery folder:
    node generate-gallery-images.js

  For local development, dev-server.js computes each folder's
  images.json fresh on every request instead, so no rebuild step is
  needed.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const { buildManifest, buildGalleryImages } = require('./manifest-lib');

const galleriesDir = path.join(__dirname, 'Galleries');

const imagesOnlyEntries = buildManifest(galleriesDir).filter(entry => entry.file === null);

if (imagesOnlyEntries.length === 0) {
  console.log('No images-only or folio gallery folders found under Galleries/.');
} else {
  imagesOnlyEntries.forEach(({ folder, type }) => {
    const folderPath = path.join(galleriesDir, folder);
    const data = buildGalleryImages(folderPath, { folio: type === 'folio' });
    const outputFile = path.join(folderPath, 'images.json');
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2) + '\n');
    console.log(`Wrote ${data.images.length} image entr${data.images.length === 1 ? 'y' : 'ies'} to ${folder}/images.json (${type})`);
  });
}
