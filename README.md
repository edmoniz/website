# EdMonizPhotography website

Portfolio site for Eduardo Moniz. Static HTML / CSS / JavaScript, no build step.

## Repository layout

One repository, two long-lived branches, each checked out into its own folder:

| Folder | Branch | Role |
| --- | --- | --- |
| `S:\Web Site EdmonizPhotograhy\website_dev` | `dev` | Working copy. All edits happen here first. |
| `S:\Web Site EdmonizPhotograhy\website` | `main` | Live copy. This is what gets deployed. |

Both push to `https://github.com/edmoniz/website`.

`website_dev/_originals/` holds pre-optimization backups of images and removed
files. It is git-ignored and never leaves this machine.

## Day-to-day: making changes

Work in `website_dev/` on the `dev` branch.

```sh
cd "S:\Web Site EdmonizPhotograhy\website_dev"

# ...edit files...

# preview locally (a real server is required — the galleries use fetch())
node serve.js            # then open http://localhost:8000
#   or: right-click index.html in VS Code -> "Open with Live Server"

# commit and back up your work
git add -A
git commit -m "Describe the change"
git push                 # pushes the dev branch
```

Commit as often as you like on `dev`. Nothing here is live yet.

## Releasing to the live site

When the `dev` changes are tested and you want them public:

**1. Mirror `website_dev/` into `website/`** (copies changes, deletes files you
removed, skips git internals, the backups folder, and the dev-only server):

```sh
robocopy "S:\Web Site EdmonizPhotograhy\website_dev" "S:\Web Site EdmonizPhotograhy\website" /MIR ^
  /XD "S:\Web Site EdmonizPhotograhy\website_dev\.git" "S:\Web Site EdmonizPhotograhy\website\.git" "S:\Web Site EdmonizPhotograhy\website_dev\_originals" ^
  /XF ".DS_Store" "Thumbs.db" "desktop.ini" "serve.js"
```

(`robocopy` exit codes 0–7 all mean success. `README.md` and `.gitattributes`
are carried over to `main` on purpose; only `serve.js` and the backups folder
stay dev-only.)

**2. Commit and push `main`:**

```sh
cd "S:\Web Site EdmonizPhotograhy\website"
git status              # sanity-check what changed
git add -A
git commit -m "Release: <summary of what went live>"
git push                # pushes the main branch -> deploys
```

## Keeping the branches from drifting

Over time `dev` accumulates commits that `main` does not. That is expected. The
mirror-and-commit step above is the release. If you want `main`'s history to
match `dev` exactly instead of one squashed "Release" commit, you can instead
merge in the `website` folder:

```sh
cd "S:\Web Site EdmonizPhotograhy\website"
git fetch origin
git merge origin/dev          # brings every dev commit onto main
git push
```

Use one approach or the other consistently — not both.

## First-time setup on a new machine

```sh
git clone https://github.com/edmoniz/website.git website        # main
git clone https://github.com/edmoniz/website.git website_dev    # then:
cd website_dev && git checkout dev
```

## Notes

- No secrets live in this repo. The contact form posts to FormSubmit.co with a
  public form token; its `_next` redirect points at the production domain, so the
  post-submit "thank you" hop only works on the live site, not on localhost.
- `.gitattributes` pins line endings to LF so they don't depend on each
  machine's git settings.
