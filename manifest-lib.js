/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: manifest-lib.js

  Shared logic for scanning a content folder (Galleries/, Articles/,
  Tutorials/) into a manifest array. Each subfolder becomes one menu
  entry: the folder name is the menu title.

  A subfolder can work one of two ways:
  - Legacy: it contains a single .html file, which is fetched and
    injected into the page verbatim when the menu item is clicked.
  - Images-only (Galleries/ only, for now): it contains no .html file,
    just image files (optionally with .xmp sidecar metadata) and an
    optional description.txt. buildGalleryImages() reads that folder
    and returns the data needed to render the gallery entirely on the
    client, with no hand-written HTML at all.

  Used by the generate-*-manifest.js scripts (static build output) and
  dev-server.js (computed fresh on every request).
*/

'use strict';

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif', '.svg']);

function isImageFile(fileName) {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function buildManifest(contentDir) {
  if (!fs.existsSync(contentDir)) return [];

  return fs.readdirSync(contentDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const folderName = entry.name;
      const folderPath = path.join(contentDir, folderName);
      const folderFiles = fs.readdirSync(folderPath);
      const htmlFile = folderFiles.find(fileName => fileName.toLowerCase().endsWith('.html'));

      if (htmlFile) {
        return { folder: folderName, file: htmlFile, title: folderName };
      }

      const hasImages = folderFiles.some(isImageFile);
      if (!hasImages) return null;

      // Images-only gallery: no .html partial: the client builds the
      // heading and figures from images.json (see buildGalleryImages).
      return { folder: folderName, file: null, title: folderName };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

// Pulls the text between an XML tag pair, unwrapping the rdf:Alt/rdf:li
// structure Adobe tools write dc:title and dc:description in, e.g.:
//   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">Some Title</rdf:li></rdf:Alt></dc:title>
function extractXmpField(xmpText, tagName) {
  const re = new RegExp(`<${tagName}>[\\s\\S]*?<rdf:li[^>]*>([\\s\\S]*?)</rdf:li>`, 'i');
  const match = xmpText.match(re);
  if (!match) return null;
  return decodeXmlEntities(match[1].trim()) || null;
}

function decodeXmlEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&');
}

// Reads an image's metadata, checking a same-named .xmp sidecar first,
// then falling back to XMP embedded directly in the image file itself
// (common for .jpg exports). Returns { title, description }, either of
// which may be null if not present.
function readImageMetadata(folderPath, imageFileName) {
  const baseName = imageFileName.slice(0, imageFileName.length - path.extname(imageFileName).length);
  const sidecarName = fs.readdirSync(folderPath)
    .find(f => f.toLowerCase() === `${baseName.toLowerCase()}.xmp`);

  let xmpText = null;

  if (sidecarName) {
    xmpText = fs.readFileSync(path.join(folderPath, sidecarName), 'utf8');
  } else {
    const buf = fs.readFileSync(path.join(folderPath, imageFileName));
    const latin1 = buf.toString('latin1');
    const start = latin1.indexOf('<x:xmpmeta');
    const end = start === -1 ? -1 : latin1.indexOf('</x:xmpmeta>', start);
    if (start !== -1 && end !== -1) {
      xmpText = buf.slice(start, end + '</x:xmpmeta>'.length).toString('utf8');
    }
  }

  if (!xmpText) return { title: null, description: null };

  return {
    title: extractXmpField(xmpText, 'dc:title'),
    description: extractXmpField(xmpText, 'dc:description'),
  };
}

function titleFromFileName(fileName) {
  const baseName = fileName.slice(0, fileName.length - path.extname(fileName).length);
  return baseName.replace(/\+/g, ' ').trim();
}

// Scans an images-only gallery folder and returns everything needed to
// render it: an optional subtitle (from description.txt) and one entry
// per image, each with a caption sourced from its metadata (falling
// back to a filename-derived caption when no metadata is present).
function buildGalleryImages(folderPath) {
  if (!fs.existsSync(folderPath)) return { description: null, images: [] };

  const folderFiles = fs.readdirSync(folderPath);

  const descriptionPath = path.join(folderPath, 'description.txt');
  const description = fs.existsSync(descriptionPath)
    ? fs.readFileSync(descriptionPath, 'utf8').trim() || null
    : null;

  const images = folderFiles
    .filter(isImageFile)
    .sort((a, b) => a.localeCompare(b))
    .map(fileName => {
      const { title, description: caption } = readImageMetadata(folderPath, fileName);
      return { file: fileName, caption: title || caption || titleFromFileName(fileName) };
    });

  return { description, images };
}

module.exports = {
  buildManifest,
  buildGalleryImages,
  isImageFile,
  // kept for backward compatibility with existing callers/scripts
  buildGalleryManifest: buildManifest,
};
