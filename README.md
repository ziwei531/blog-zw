# blog-zw

A personal static site built with [Eleventy](https://www.11ty.dev/) (v3), using [Nunjucks](https://mozilla.github.io/nunjucks/) templates and [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown processing.

**Website:** [ziwei531.github.io/blog-zw](https://ziwei531.github.io/blog-zw/)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (with live reload)
npm start

# Build for production
npm run build
```

The dev server runs at `http://localhost:8081` by default. Production output goes to the `_site/` folder.

## Project Structure

```
├── _data/
│   └── site.js              # Global site data
├── _includes/
│   └── layouts/
│       ├── base.njk         # Base layout (shared shell)
│       └── post.njk         # Blog post layout
├── _site/                   # Build output (gitignored)
├── css/
│   └── style.css            # Styles (dark theme, CSS custom properties)
├── game-corner/             # Browser games (flappy bird, anime runner)
│   ├── flappy-bird/
│   └── anime-runner/
├── images/                  # Image assets
├── js/
│   └── main.js
├── posts/
│   ├── posts.11tydata.js    # Directory data file (layout, tags, draft logic)
│   └── *.md                 # Blog posts written in Markdown
├── .pages.yml               # Pages CMS config (browser-based editing)
├── .github/                 # Agent skills, coding standards, code review
├── eleventy.config.js       # Eleventy configuration (ES module)
├── scripts/
│   └── prepare-pages.py      # Stamps deployed assets with a build version
├── index.html               # Home page with paginated post listing
├── package.json
├── README.md
├── AGENTS.md
└── git-commit-convention.md
```

## Conventions

- JavaScript: see `.github/context/coding-standards/js-coding-standards.md`.
- Git commits: see [`git-commit-convention.md`](./git-commit-convention.md).

## Features

- **Dark theme** — CSS custom properties for consistent, maintainable styling
- **Markdown posts** — Write content in `.md` files with YAML frontmatter (`title`, `date`, `tags`)
- **Paginated home page** — Lists published posts via the `published` collection (5 per page)
- **Drafts** — Set `draft: true` in frontmatter to hide a post from production (still visible on localhost)
- **Browser-based editing** — Optional [Pages CMS](https://pagescms.org/) integration for writing posts in a browser UI
- **Task lists** — Rendered via `markdown-it-task-lists` plugin
- **ES modules** — Project uses `"type": "module"` in package.json for native ES module syntax
- **Passthrough copy** — `css/`, `images/`, `js/`, and per-feature game assets are copied directly to `_site/`
- **Deployment cache busting** — GitHub Pages asset URLs are stamped with the commit SHA on deployment

## How It Works

| Concept | Details |
|---|---|
| **Templates** | Nunjucks (`.njk`) for layouts; `{% raw %}{{ }}{% endraw %}` for data interpolation |
| **Layout chain** | `posts/*.md` → `post.njk` → `base.njk` |
| **Collections** | `writing` grabs all `posts/*.md`; `published` filters out drafts when building for production |
| **Directory data** | `posts.11tydata.js` cascades `layout`, `tags`, and draft-aware permalink logic to every file in `posts/` |

## Drafts

Add `draft: true` to any post's frontmatter to hide it from production builds:

```yaml
---
title: Work in Progress
date: 2026-07-12
tags: posts
draft: true
---
```

| Command | Draft posts |
|---|---|
| `npm start` (localhost) | ✅ Visible in listing and accessible by URL |
| `npm run build` (production) | ❌ Hidden from listing, page not generated |

Drafts are detected by checking for the `--serve` flag in `process.argv` — no extra environment variables needed.

## Pages CMS

This project includes a [`.pages.yml`](./.pages.yml) config for [Pages CMS](https://pagescms.org/), an open-source Git-based CMS. To start editing posts in a browser:

1. Go to [app.pagescms.org](https://app.pagescms.org/) and sign in with GitHub
2. Install the Pages CMS GitHub App when prompted
3. Open this repository — Pages CMS auto-detects `.pages.yml`
4. Edit posts with a rich-text editor, upload images, and toggle draft status
5. Changes are committed directly to the repo and trigger a rebuild
| **Markdown** | Eleventy's built-in markdown-it, extended with `amendLibrary` for plugins |

## License

ISC
