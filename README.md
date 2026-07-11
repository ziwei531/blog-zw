# eleventy-zw

A personal static site built with [Eleventy](https://www.11ty.dev/) (v3), using [Nunjucks](https://mozilla.github.io/nunjucks/) templates and [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown processing.

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
├── js/
│   └── main.js
├── posts/
│   ├── posts.json           # Directory data file (applies layout & tags to all posts)
│   └── *.md                 # Blog posts written in Markdown
├── eleventy.config.js       # Eleventy configuration
├── index.html               # Home page with paginated post listing
├── package.json
└── README.md
```

## Features

- **Dark theme** — CSS custom properties for consistent, maintainable styling
- **Markdown posts** — Write content in `.md` files with YAML frontmatter (`title`, `date`, `tags`)
- **Paginated home page** — Lists all posts via the `writing` collection (3 per page)
- **Task lists** — Rendered via `markdown-it-task-lists` plugin
- **Passthrough copy** — `css/`, `images/`, and `js/` folders are copied directly to `_site/`

## How It Works

| Concept | Details |
|---|---|
| **Templates** | Nunjucks (`.njk`) for layouts; `{% raw %}{{ }}{% endraw %}` for data interpolation |
| **Layout chain** | `posts/*.md` → `post.njk` → `base.njk` |
| **Collections** | `writing` collection grabs all `posts/*.md` via `addCollection` + `getFilteredByGlob` |
| **Directory data** | `posts.json` cascades `layout` and `tags` to every file in `posts/` |
| **Markdown** | Eleventy's built-in markdown-it, extended with `amendLibrary` for plugins |

## License

ISC
