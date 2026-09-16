# Website-automated- : Gallery Automation

This project is a development sandbox for automating the gallery menu on
Ed Moniz's photography website. The live site itself lives elsewhere on
the NAS (`/volume1/software_projects/Web Site EdmonizPhotograhy/website`);
this folder is where the automation gets built and proven out before being
merged into that live site.

## What problem this solves

`galleries.html` has a horizontal "Galleries" menu item and a vertical
left-side menu listing individual galleries (e.g. "Black and White
Gallery", "PPOC Salon Submissions"). Originally the vertical menu was a
hardcoded array of filenames/titles inside `galleries.js`. Adding a new
gallery meant editing JavaScript by hand.

Now the vertical menu is built automatically from the folder structure
under `Galleries/`. Adding a gallery means adding a folder — no code
changes.

## Folder convention

```
Galleries/
  Black and White Favourites/
    black_white_fav.html
  PPOC Salons/
    ppocSalon.html
```

To add a new gallery:

1. Create a new folder under `Galleries/` (the folder name doesn't need
   to match the menu title — see below).
2. Put exactly one `.html` file in it containing the gallery's markup,
   starting with an `<h2>Menu Title Goes Here</h2>` — that heading text
   becomes both the vertical menu label and the `<h2>` shown at the top
   of the gallery content.
3. Any images the gallery references should use paths relative to the
   site root (e.g. `Galleries/My New Gallery/photo1.jpg`), the same way
   the existing two galleries do — the HTML fragment gets injected into
   `galleries.html`'s `<article>`, so relative paths resolve from there,
   not from the gallery's own subfolder.

That's it. If no `.html` file is found in a folder, it's silently
skipped (with a warning logged when using the static generator below).

## How the automation works

- **`manifest-lib.js`** — shared logic. Scans `Galleries/`, and for each
  subfolder finds its `.html` file and extracts the title from its
  `<h2>` tag (falling back to the folder name if there isn't one).
  Returns an array like:
  ```json
  [
    { "folder": "Black and White Favourites", "file": "black_white_fav.html", "title": "Black and White Gallery" },
    { "folder": "PPOC Salons", "file": "ppocSalon.html", "title": "PPOC Salon Submissions" }
  ]
  ```
- **`galleries.js`** — on page load, fetches `galleries-manifest.json`
  and builds the vertical `<nav>` menu from it. Clicking a menu item
  fetches that gallery's HTML file and swaps it into `#articleContainer`,
  exactly as before.
- **`generate-gallery-manifest.js`** — a one-shot script for **static
  hosting** (the live site, served by Caddy with no backend/runtime).
  Run it and it writes `galleries-manifest.json` to disk:
  ```
  node generate-gallery-manifest.js
  ```
  Re-run it any time you add, remove, or rename a gallery folder on the
  live site, since Caddy has no way to compute it on its own.
- **`dev-server.js`** — a small dependency-free Node HTTP server for
  **local development**. It serves the project as static files, but
  computes `/galleries-manifest.json` fresh from `Galleries/` on every
  single request instead of reading a file. That means on the dev
  server, adding/removing/renaming a gallery folder shows up on the next
  page refresh — no rebuild step, no restart needed.

## Dev server setup on the NAS

The dev server runs as a Docker container on the NAS (`DXP4800PLUS-RIN`),
alongside the other `_edmoniz`-suffixed containers (Caddy, Cloudflare
Tunnel, Portainer, etc.), managed the same way — as a Compose project
Portainer can see and control.

| | |
|---|---|
| Container name | `gallery-dev_edmoniz` |
| Compose file | `/volume1/docker/gallery-dev_edmoniz/docker-compose.yml` |
| Image | `node:18-alpine` |
| Source mount | `/volume1/software_projects/Website Projects/Website-automated-` → `/srv` (read-only) |
| Port | `8189` (host and container) |
| URL | `http://DXP4800PLUS-RIN:8189/galleries.html` (also reachable over Tailscale) |

**Common tasks (via SSH: `ssh edmoniz@DXP4800PLUS-RIN`, or via Portainer's UI):**

```
# Restart after editing dev-server.js or manifest-lib.js (image code isn't
# rebuilt — it's just running node against the mounted folder — but a
# restart re-runs the entrypoint if you've changed the compose file itself)
docker restart gallery-dev_edmoniz

# View logs
docker logs -f gallery-dev_edmoniz

# Stop / start
cd /volume1/docker/gallery-dev_edmoniz
docker compose down
docker compose up -d
```

You do **not** need to restart the container just to see a new gallery
folder — that's the whole point of `dev-server.js` computing the
manifest live. You only need to restart it if you edit `dev-server.js`
or `manifest-lib.js` themselves (the running Node process needs to be
relaunched to pick up code changes).

## Eventually merging into the live site

The live site is served by a separate Caddy container (`caddy_edmoniz`)
pointed at `/volume1/software_projects/Web Site EdmonizPhotograhy/website`,
which is a **pure static file server** — no Node runtime, no way to
compute anything on request. When this automation work is ready to go
live:

1. Copy the finished `galleries.html`, `galleries.js`, `galleries.css`,
   `Galleries/`, `manifest-lib.js`, and `generate-gallery-manifest.js`
   into the live site's folder.
2. Run `node generate-gallery-manifest.js` there once to produce
   `galleries-manifest.json`.
3. From then on, re-run that script (manually, or via a git hook /
   CI step) any time a gallery folder changes on the live site, since it
   has no dev server to compute it automatically.

## Known gaps (pre-existing, not caused by this work)

- `lightbox.js` doesn't exist in this project yet — `galleries.js`
  guards the call so it won't throw, but images won't open in a
  lightbox until that file is added.
- There's no `index.html`, `articles.html`, `resources.html`,
  `tutorials.html`, `about.html`, or `form.html` in this dev folder yet
  — the nav bar links to them, but they'll be brought over from the live
  site along with everything else mentioned above.
