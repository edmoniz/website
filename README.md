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
  Egyptian Collection Folio/      <- folio (no .html, name has "Folio")
    Egyptian-1.jpg ... Egyptian-14.jpg
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

A folder works one of three ways:

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
replaced by a space) is used as a last-resort caption. That caption
appears both under each thumbnail and in the lightbox/loupe view. An
optional `description.txt` in the folder supplies the `<h3>` subtitle
line, shown between the `<h2>` heading and the image grid; omit it and
no subtitle is shown.

**Folio (Galleries/ only) — no `.html`, folder name contains "Folio".**
Same shape as images-only (just image files plus an optional
`description.txt`), but a folio is a complete, pre-sequenced
presentation rather than a set of individually-captioned photos, so no
caption is generated for any image — not under the thumbnail, and not
in the lightbox/loupe view. What makes a folder a folio (instead of a
plain images-only gallery) is the word "Folio" appearing anywhere in
the folder name, e.g. `Coastal Collection Folio` or `Egyptian Collection
Folio` — that's the only signal; there's no separate marker file. The
`<h2>` (folder name) and optional `<h3>` (`description.txt`) work
exactly as in images-only mode. Because there are no per-image titles to
keep images in order, folio image filenames should be numbered (e.g.
`Egyptian-1.jpg`, `Egyptian-2.jpg`, ...) — the manifest sorts filenames
numeric-aware, so `Egyptian-2.jpg` sorts before `Egyptian-10.jpg`.

For any of the three modes, an empty folder (no `.html` and no images)
is silently skipped (with a warning logged when using the static
generator below). A folder whose name starts with `backup` (e.g.
`backup Coastal Collection`) is also skipped entirely, regardless of
its contents — this is the convention for keeping a retired
hand-written `.html` folio around for reference after converting that
gallery to the images-only/folio convention, without it showing up as a
menu item.

## How the automation works

- **`manifest-lib.js`** — shared logic.
  - `buildManifest(contentDir)` scans a content folder (`Galleries/`,
    `Articles/`, or `Tutorials/`), skipping any subfolder whose name
    starts with `backup`, and for each remaining subfolder uses the
    folder name itself as the title (verbatim — no `<h2>` scraping). If
    the folder has an `.html` file, that's `file` and `type: "html"`; if
    it has no `.html` but does have images, `file` is `null` and `type`
    is `"folio"` when the folder name contains the word "Folio", or
    `"images"` otherwise. Returns an array like:
    ```json
    [
      { "folder": "Black and White Gallery", "file": null, "title": "Black and White Gallery", "type": "images" },
      { "folder": "Egyptian Collection Folio", "file": null, "title": "Egyptian Collection Folio", "type": "folio" },
      { "folder": "PPOC Salons", "file": "ppocSalon.html", "title": "PPOC Salons", "type": "html" }
    ]
    ```
  - `buildGalleryImages(folderPath, { folio })` scans an images-only or
    folio gallery folder and returns its subtitle plus one entry per
    image, sorted by filename (numeric-aware, so `Egyptian-2.jpg` sorts
    before `Egyptian-10.jpg`). For an images-only gallery (`folio`
    omitted or `false`) each entry also gets a caption read from that
    image's metadata (`.xmp` sidecar, or XMP embedded in the file
    itself, falling back to a filename-derived caption); for a folio
    (`folio: true`) captions are skipped entirely:
    ```json
    {
      "description": "Favourite black and white images captured over the years.",
      "images": [
        { "file": "Heritage+Acres-1.webp", "caption": "Heritage Acres Gate" }
      ]
    }
    ```
    ```json
    {
      "description": "Welcome to the great artifacts of ancient Egypt.",
      "images": [
        { "file": "Egyptian-1.jpg" }
      ]
    }
    ```
- **`scripts/galleries.js`**, **`scripts/articles.js`**,
  **`scripts/tutorials.js`** — on page load, each fetches its own
  manifest (`galleries-manifest.json`, `articles-manifest.json`, or
  `tutorials-manifest.json`) and builds the vertical `<nav>` menu from
  it. Clicking a legacy item (`file` set) fetches that item's HTML file
  and swaps it into `#articleContainer`. Clicking an images-only or
  folio gallery (`file: null`) instead fetches
  `Galleries/<folder>/images.json` and builds the `<h2>`, optional
  `<h3>`, and all `<figure>` markup directly in `#articleContainer` —
  there's no HTML fragment for that folder at all. For an images-only
  gallery each `<figure>` also gets a `<figcaption>` and the image's
  `alt` is set from its caption, used both under the thumbnail and as
  the caption text in the lightbox/loupe view; for a folio, neither is
  added — no caption appears anywhere for that gallery's images.
- **`generate-gallery-manifest.js`**, **`generate-articles-manifest.js`**,
  **`generate-tutorials-manifest.js`**, **`generate-gallery-images.js`**
  — one-shot scripts for **static hosting** (the live site, served by
  Caddy with no backend/runtime). Run the relevant one(s) and they write
  the matching `*-manifest.json` (or, for `generate-gallery-images.js`,
  an `images.json` inside each images-only or folio gallery folder) to
  disk:
  ```
  node generate-gallery-manifest.js
  node generate-articles-manifest.js
  node generate-tutorials-manifest.js
  node generate-gallery-images.js
  ```
  Re-run the relevant script any time you add, remove, or rename a
  folder under `Galleries/`, `Articles/`, or `Tutorials/` on the live
  site (or add/retitle images in an images-only or folio gallery), since
  Caddy has no way to compute it on its own. **All existing galleries
  need `node generate-gallery-manifest.js && node generate-gallery-images.js`
  re-run any time this folio routine (or any other change to
  `manifest-lib.js`) ships** — every gallery's manifest entry and
  `images.json` are regenerated from scratch, so a stale copy on disk
  would otherwise keep serving the old shape.
- **`dev-server.js`** — a small dependency-free Node HTTP server for
  **local development**. It serves the project as static files, but
  computes `/galleries-manifest.json`, `/articles-manifest.json`,
  `/tutorials-manifest.json`, and each images-only or folio gallery's
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
   `generate-gallery-images.js`, an `images.json` in every images-only or
   folio gallery folder):
   ```
   node generate-gallery-manifest.js
   node generate-articles-manifest.js
   node generate-tutorials-manifest.js
   node generate-gallery-images.js
   ```
3. From then on, re-run the relevant script (manually, or via a git hook
   / CI step) any time a gallery, article, or tutorial folder changes on
   the live site, or an image is added/retitled in an images-only or
   folio gallery, since it has no dev server to compute it automatically.

## Known gaps (pre-existing, not caused by this work)

- There's no `resources.html`, `about.html`, or `form.html` in this dev
  folder yet — the nav bar links to them, but they'll be brought over
  from the live site along with everything else mentioned above.
