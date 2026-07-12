---
title: Eleventy Markdown Testing
date: 2026-06-15
tags: posts
draft: true
---

First post on this site. Nothing fancy — just getting the words flowing and the ideas out there. Sometimes the hardest part is simply starting.

## Typography & Inline Styling

Here's a paragraph showing **bold text**, *italic text*, and ***bold italic***. You can also ~~strike through~~ things that no longer apply. Inline `code` looks like `const x = 42` and sits naturally within text. You can also use <mark>highlighted text</mark> and <ins>inserted</ins> or <del>deleted</del> content.

A link to [Eleventy](https://www.11ty.dev/) and an auto-linked URL: https://example.com. You can also use reference-style links like [GitHub][1] and refer back to them anywhere in the document.

[1]: https://github.com

Em dashes --- and en dashes -- should render as typographic characters. Ellipsis... should too.

## Blockquotes

> A single-line blockquote. Keep it simple.

> A multi-paragraph blockquote.
>
> This is the second paragraph inside the same blockquote. It should flow naturally with spacing between the paragraphs.

> Nested blockquotes are useful for conversations:
>> "Is this a nested quote?"
>
> "Yes it is."

## Code

Inline `console.log("hello")` sits within a sentence.

A fenced code block with language:

```javascript
function greet(name) {
  // Say hello and return a greeting
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}

greet("World");
```

```css
.post-link {
  color: var(--color-text);
  text-decoration: none;
  transition: color 150ms ease;
}
```

A code block without a language:

```
$ npm install
$ npm run build
```

## Lists

### Unordered

- Item one
- Item two
  - Nested item A
  - Nested item B
    - Deeply nested i
    - Deeply nested ii
- Item three

### Ordered

1. First step
2. Second step
    1. Sub-step a
    2. Sub-step b
3. Third step

### Task List

- [x] Set up the Eleventy project
- [x] Create the base layout
- [ ] Write the first post
- [ ] Deploy to production

### Mixed

1. Open the terminal
   - Run `npm install`
   - Run `npm start`
2. Open your browser
3. You should see the site

## Horizontal Rule

Above the rule.

---

Below the rule.

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Dark mode | Done | Using CSS custom properties |
| Pagination | Done | 3 posts per page |
| RSS feed | Planned | Atom format |
| Search | Not started | Maybe use Pagefind |

Alignment variations:

| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
| Long text here | centered | 12345 |

## Images

![A placeholder image](https://placehold.co/600x200/1c2128/60a5fa?text=Hello+World)

An image with a title:

![Eleventy logo](https://www.11ty.dev/img/logo-github.svg "The Eleventy logo")

## HTML Elements

Sometimes you need raw HTML:

<details>
<summary>Click to expand — this is a details/summary element</summary>

This content is hidden until the user clicks "Click to expand". Useful for FAQs, spoilers, or progressive disclosure.

- It can contain lists
- And other **markdown**

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> to copy. Or press <kbd>⌘</kbd> + <kbd>K</kbd> on Mac.

## Escaping

Literal characters: \*not italic\*, \`not code\`, \# not a heading.

HTML entities: &amp; &lt; &gt; &copy; &rarr;

## That's All

This post covers most Markdown variations you'd use day-to-day. If something looks off, the stylesheet probably needs a rule for it.
