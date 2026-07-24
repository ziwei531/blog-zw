# AGENTS.md

## Coding Preferences

When writing code, follow the JavaScript coding standards defined in `.github/context/coding-standards/js-coding-standards.md`.

For reviewing code, activate the code agent at `.github/agents/code-review.agent.md`.

## `.github/` Directory Structure

The `.github/` folder contains project context, agent definitions, and CI/CD configuration. All files are excluded from the Eleventy build output via `eleventyConfig.ignores.add( ".github/**" )`.

### `.github/agents/code-review.agent.md`

A code review agent definition. Activate it when reviewing pull requests, auditing code quality, or checking style compliance. The agent reads the coding standards document and checks code against it — covering ES6+ syntax, tab indentation, leading comma pattern, visual alignment, spacing, naming conventions, async/await, ES modules, and error handling.

### `.github/context/coding-standards/js-coding-standards.md`

The full JavaScript coding standards document. Covers:

- **ES6+ first** — `const`/`let` over `var`, arrow functions for callbacks, template literals, destructuring, spread/rest, async/await, ES modules
- **Tabs, not spaces** — every indentation level is one tab character
- **Leading comma pattern** — multi-line arrays, objects, and argument lists use leading commas with two-space prefix on the first item
- **Visual alignment** — align `=`, `:`, `??`, and `from` columns within related blocks
- **Spacing** — spaces around operators, inside parens, after keywords
- **Naming** — camelCase for variables/functions, PascalCase for classes, `_` prefix for private helpers
- **Arrow functions** — preferred for callbacks and expressions; function declarations for top-level named functions
- **`const` by default** — `let` only for reassignment, never `var`
- **Strict equality** — `===`/`!==` always, except `== null` for null+undefined check
- **Braces always** — even for single-statement control flow
- **No `else` after `return`** — no `break` after `return` in switch
- **`for...of`/`forEach()`** over classical `for (;;)`
- **Error handling** — surface errors to the user, not just console
- **Comments** — explain WHY, not WHAT; single-line `//` preferred
- **Pre-commit checklist** — full checklist at the end of the document

Always read this file before writing or modifying JavaScript in this repo.

### `.github/skills/frontend-design/SKILL.md`

A frontend design reference skill covering visual design fundamentals, color theory, typography, responsive design, accessibility (WCAG AA), common UI patterns, design systems/tokens, performance, and modern design trends. Use when designing UI layouts, styling components, choosing color palettes, implementing responsive design, or making any frontend design decision.

### `.github/workflows/deploy.yml`

GitHub Actions workflow for deploying the site to GitHub Pages. Triggers on push to the `stable` branch. Builds with Node.js 24, runs `npm run build:prod`, and deploys the `_site/` output to GitHub Pages. Only one concurrent deployment at a time (queued runs are skipped).