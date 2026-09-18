# Website-automated- : Gallery/Article/Tutorial Automation

This project is a development sandbox for automating the vertical
sub-menus on Ed Moniz's photography website. The live site itself lives
elsewhere on the NAS
(`/volume1/software_projects/Web Site EdmonizPhotograhy/website`); this
folder is where the automation gets built and proven out before being
merged into that live site.

## What problem this solves

`galleries.html`, `articles.html`, and `tutorials.html` each have a
horizontal top menu item and a vertical left-side menu listing individual
items (e.g. "Black and White Gallery", "One Photographer's Journey",
"Banana Flower Tutorial"). Originally each vertical menu was a hardcoded
array of filenames/titles inside its own `.js` file. Adding a new
gallery, article, or tutorial meant editing JavaScript by hand.

Now all three vertical menus are built automatically from the folder
structure under `Galleries/`, `Articles/`, and `Tutorials/` respectively.
Adding an item means adding a folder — no code changes.

## Folder convention

The same convention applies independently to `Galleries/`, `Articles/`,
and `Tutorials/`:

```
Galleries/
  Black and White Gallery/        <- images-only (no .html)
    Heritage+Acres-1.webp
    Heritage+Acres-1.xmp
    description.txt
  PPOC Salons/                    <- legacy (hand-written .html)
    ppocSalon.html

Articles/
  One Photographer's Journey/
    OnePhotoJourney.html

Tutorials/
  Banana Flower Tutorial/
    bananaFlowerTutorial.html
```

A folder works one of two ways:

**Legacy — hand-written `.html`.** Put exactly one `.html` file in the
folder containing the item's markup, starting with an `<h2>` that
repeats the folder name (e.g. a folder named `Coastal Collection` starts
with `<h2>Coastal Collection</h2>`). The manifest doesn't read this
heading — it's kept in sync manually so the page heading matches the
menu label and the folder name. Any images it references should use
paths relative to the site root (e.g. `Galleries/My New Gallery/photo1.jpg`,
or `images/my-photo.jpg` for articles/tutorials that keep their images in
the shared `images/` folder) — the HTML fragment gets injected into the
page's `<article>`, so relative paths resolve from the page
(`galleries.html`, `articles.html`, `tutorials.html`), not from the
item's own subfolder. This is currently the only mode `Articles/` and
`Tutorials/` support.

**Images-only (Galleries/ only) — no `.html` at all.** Put image files
directly in the folder and nothing else is required. The gallery's
`<h2>` is the folder name, generated automatically. Each image's caption
comes from its metadata — the `dc:title` (falling back to
`dc:description`) read from a same-named `.xmp` sidecar (e.g.
`Heritage+Acres-1.webp` + `Heritage+Acres-1.xmp`), or from XMP embedded
directly in the image file itself if there's no sidecar (common for
`.jpg` exports). If an image has neither, its filename (with `+`
replaced by a space) is used as a last-resort caption. Images are
displayed in filename order — use numeric prefixes (`01_`, `02_`, ...)
if you want to control the order. An optional `description.txt` in the
folder supplies the `<h3>` subtitle line; omit it and no subtitle is
shown.

For either mode, an empty folder (no `.html` and no images) is silently
skipped (with a warning logged when using the static generator below).

## How the automation works

- **`manifest-lib.js`** — shared logic.
  - `buildManifest(contentDir)` scans a content folder (`Galleries/`,
    `Articles/`, or `Tutorials/`), and for each subfolder uses the
    folder name itself as the title (verbatim — no `<h2>` scraping). If
    the folder has an `.html` file, that's `file`; if it has no `.html`
    but does have images, `file` is `null` (an images-only gallery).
    Returns an array like:
    ```json
    [
      { "folder": "Black and White Gallery", "file": null, "title": "Black and White Gallery" },
      { "folder": "PPOC Salons", "file": "ppocSalon.html", "title": "PPOC Salons" }
    ]
    ```
  - `buildGalleryImages(folderPath)` scans an images-only gallery folder
    and returns its subtitle plus one entry per image, each with a
    caption read from that image's metadata (`.xmp` sidecar, or XMP
    embedded in the file itself, falling back to a filename-derived
    caption):
    ```json
    {
      "description": "Favourite black and white images captured over the years.",
      "images": [
        { "file": "Heritage+Acres-1.webp", "caption": "Heritage Acres Gate" }
      ]
    }
    ```
- **`scripts/galleries.js`**, **`scripts/articles.js`**,
  **`scripts/tutorials.js`** — on page load, each fetches its own
  manifest (`galleries-manifest.json`, `articles-manifest.json`, or
  `tutorials-manifest.json`) and builds the vertical `<nav>` menu from
  it. Clicking a legacy item (`file` set) fetches that item's HTML file
  and swaps it into `#articleContainer`. Clicking an images-only gallery
  (`file: null`) instead fetches `Galleries/<folder>/images.json` and
  builds the `<h2>`, optional `<h3>`, and all `<figure>` markup directly
  in `#articleContainer` — there's no HTML fragment for that folder at
  all.
- **`generate-gallery-manifest.js`**, **`generate-articles-manifest.js`**,
  **`generate-tutorials-manifest.js`**, **`generate-gallery-images.js`**
  — one-shot scripts for **static hosting** (the live site, served by
  Caddy with no backend/runtime). Run the relevant one(s) and they write
  the matching `*-manifest.json` (or, for `generate-gallery-images.js`,
  an `images.json` inside each images-only gallery folder) to disk:
  ```
  node generate-gallery-manifest.js
  node generate-articles-manifest.js
  node generate-tutorials-manifest.js
  node generate-gallery-images.js
  ```
  Re-run the relevant script any time you add, remove, or rename a
  folder under `Galleries/`, `Articles/`, or `Tutorials/` on the live
  site (or add/retitle images in an images-only gallery), since Caddy
  has no way to compute it on its own.
- **`dev-server.js`** — a small dependency-free Node HTTP server for
  **local development**. It serves the project as static files, but
  computes `/galleries-manifest.json`, `/articles-manifest.json`,
  `/tutorials-manifest.json`, and each images-only gallery's
  `Galleries/<folder>/images.json` fresh from their respective folders
  on every single request instead of reading a file. That means on the
  dev server, adding/removing/renaming a folder — or adding/retitling an
  image in an images-only gallery — shows up on the next page refresh —
  no rebuild step, no restart needed.

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

You do **not** need to restart the container just to see a new gallery,
article, or tutorial folder — that's the whole point of `dev-server.js`
computing the manifests live. You only need to restart it if you edit
`dev-server.js` or `manifest-lib.js` themselves (the running Node
process needs to be relaunched to pick up code changes).

## Eventually merging into the live site

The live site is served by a separate Caddy container (`caddy_edmoniz`)
pointed at `/volume1/software_projects/Web Site EdmonizPhotograhy/website`,
which is a **pure static file server** — no Node runtime, no way to
compute anything on request. When this automation work is ready to go
live:

1. Copy the finished `galleries.html`, `articles.html`, `tutorials.html`,
   `scripts/galleries.js`, `scripts/articles.js`, `scripts/tutorials.js`,
   `css_files/`, `Galleries/`, `Articles/`, `Tutorials/`,
   `manifest-lib.js`, and the four `generate-*.js` scripts into the live
   site's folder.
2. Run each generator there once to produce its manifest (and, for
   `generate-gallery-images.js`, an `images.json` in every images-only
   gallery folder):
   ```
   node generate-gallery-manifest.js
   node generate-articles-manifest.js
   node generate-tutorials-manifest.js
   node generate-gallery-images.js
   ```
3. From then on, re-run the relevant script (manually, or via a git hook
   / CI step) any time a gallery, article, or tutorial folder changes on
   the live site, or an image is added/retitled in an images-only
   gallery, since it has no dev server to compute it automatically.

## Known gaps (pre-existing, not caused by this work)

- There's no `resources.html`, `about.html`, or `form.html` in this dev
  folder yet — the nav bar links to them, but they'll be brought over
  from the live site along with everything else mentioned above.
