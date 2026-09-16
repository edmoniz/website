/*
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: dev-server.js

  Local development server for the gallery automation project. Serves the
  project root as static files, exactly like the live Caddy file_server,
  except requests for galleries-manifest.json are computed fresh from the
  Galleries/ folder on every request instead of being read from a file.
  That means adding, removing, or renaming a gallery folder shows up on
  the next page load with no rebuild step and no server restart.

  Run directly:
    node dev-server.js
  Or via Docker (see docker-compose.yml).
*/

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildGalleryManifest } = require('./manifest-lib');

const rootDir = __dirname;
const galleriesDir = path.join(rootDir, 'Galleries');
const port = process.env.PORT || 8189;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.jfif': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveManifest(res) {
  const entries = buildGalleryManifest(galleriesDir);
  const body = JSON.stringify(entries, null, 2);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function serveStaticFile(req, res) {
  const requestPath = decodeURIComponent(req.url.split('?')[0]);
  const relativePath = requestPath === '/' ? 'galleries.html' : requestPath;
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(rootDir, normalizedPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Not found: ${requestPath}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  const requestPath = req.url.split('?')[0];

  if (requestPath === '/galleries-manifest.json') {
    serveManifest(res);
    return;
  }

  serveStaticFile(req, res);
});

server.listen(port, () => {
  console.log(`Gallery dev server running at http://localhost:${port}`);
  console.log(`Serving ${rootDir}`);
  console.log('galleries-manifest.json is computed live from Galleries/ on every request.');
});
