---
name: frontend-design
description: 'Frontend design principles, patterns, and best practices for web developers. Use when: designing UI layouts, styling websites, choosing color palettes, working with typography, implementing responsive design, ensuring accessibility, creating design systems, evaluating visual hierarchy, or making any frontend design decision.'
argument-hint: '[design topic or pattern]'
---

# Frontend Design for Web Developers

Comprehensive design knowledge for developers building web interfaces. Covers visual design fundamentals, UX patterns, responsive layouts, accessibility, design systems, and modern design trends.

## When to Use

- Designing or redesigning a website/page layout
- Choosing colors, fonts, or spacing for a UI
- Making a site responsive across devices
- Ensuring accessibility compliance (WCAG)
- Creating or contributing to a design system
- Evaluating whether a design "looks good" and why
- Implementing design briefs or Figma mockups
- Adding common UI patterns (cards, modals, navigation, forms)
- Optimizing visual hierarchy and user flow

---

## 1. Visual Design Fundamentals

### 1.1 Visual Hierarchy
Arrange elements to guide the user's eye through content in order of importance.

| Technique | Implementation |
|-----------|---------------|
| **Size** | Larger elements draw attention first. Use `font-size`, `width`, `height`. |
| **Color & Contrast** | High-contrast elements stand out. Use bold/accent colors sparingly. |
| **Whitespace** | Generous padding/margin around important elements isolates and emphasizes them. |
| **Position** | Top-left to bottom-right scanning (F-pattern for text, Z-pattern for landing pages). |
| **Repetition** | Consistent styling of similar elements creates rhythm and predictability. |

**F-Pattern** (content-heavy pages): Users scan in an F shape — left vertical stripe, then rightward horizontal stripes.
**Z-Pattern** (landing pages): Eye moves top-left → top-right → bottom-left → bottom-right.

### 1.2 Contrast
Contrast creates distinction between elements. Aim for WCAG AA minimum: **4.5:1** for normal text, **3:1** for large text (18px+ bold or 24px+ regular).

- **Color contrast**: Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or browser DevTools.
- **Size contrast**: Headline vs. body — make the difference obvious (e.g., 2rem vs 1rem, not 1.2rem vs 1rem).
- **Weight contrast**: Pair bold headings with regular body text. Use font-weight strategically (300, 400, 600, 700).
- **Style contrast**: Serif headings with sans-serif body, or vice versa.

### 1.3 Alignment
Nothing should feel "randomly placed." Every element should align to something.

- **Text**: Left-aligned for LTR languages (optimal readability). Centered sparingly for short content only.
- **Grid systems**: Use CSS Grid or Flexbox with consistent gap values.
- **Edge alignment**: Align elements to a common left/right edge. Inconsistent indentation looks broken.
- **Baseline alignment**: Text in adjacent columns should share the same baseline.

### 1.4 Whitespace (Negative Space)
Whitespace is not wasted space — it's a design tool.

- **Macro whitespace**: Space between major sections (typically 80-160px).
- **Micro whitespace**: Space between lines, list items, labels and inputs (typically 8-24px).
- **Rule of proximity**: Related items should be closer together; unrelated items further apart.
- **Generous padding**: When in doubt, add more. Crowded UIs feel stressful.

### 1.5 Scale & Proportion
Use a consistent scale for sizing and spacing.

- **Typographic scale**: Powers of 1.25 (Major Third), 1.333 (Perfect Fourth), or 1.5 (Perfect Fifth). Example using 1.25: `12px → 16px → 20px → 25px → 31px → 39px → 48px`.
- **Spacing scale**: 4px-based system: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`.
- **8pt grid**: All spacing and sizing in multiples of 8px (or 4px for fine detail). Reduces decision fatigue.

---

## 2. Color Theory

### 2.1 Color Schemes

| Scheme | Description | Use Case |
|--------|-------------|----------|
| **Monochromatic** | Single hue, varying saturation/lightness | Clean, minimalist, single-focus |
| **Analogous** | Adjacent hues on color wheel (e.g., blue, teal, green) | Harmonious, natural feel |
| **Complementary** | Opposite hues (e.g., blue + orange) | High contrast, call-to-action |
| **Split-Complementary** | Base + two adjacent to complement | Vibrant but less jarring than complementary |
| **Triadic** | Three evenly spaced hues | Playful, balanced, brands |

### 2.2 The 60-30-10 Rule
- **60%** dominant/neutral color (backgrounds)
- **30%** secondary color (main UI elements, sections)
- **10%** accent color (CTAs, highlights, links)

### 2.3 Practical Color Tips
- Use **HSL** instead of hex for programmatic manipulation: `hsl(210, 80%, 55%)`.
- Define CSS custom properties: `--color-primary`, `--color-bg`, `--color-text`, `--color-accent`.
- **Never use pure black** (`#000`) on white — it causes eye strain. Use `#121212` or `hsl(0, 0%, 7%)`.
- Limit your palette to 5-7 colors max (excluding neutrals).
- Test for color blindness: deuteranopia, protanopia, tritanopia. Tools: [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/).

---

## 3. Typography

### 3.1 Font Selection

| Type | Characteristics | Best For |
|------|----------------|----------|
| **Serif** | Decorative strokes, traditional feel | Long-form reading, editorial, luxury brands |
| **Sans-serif** | Clean, modern, no strokes | UI text, headings, tech, modern brands |
| **Monospace** | Fixed-width characters | Code, data tables, terminal aesthetics |

**Rule of thumb**: Max 2 font families per site (one for headings, one for body). Each additional font adds download weight and cognitive noise.

### 3.2 Readability Metrics
- **Line length**: 45-75 characters per line (ideal: ~65). Use `max-width: 65ch` on text containers.
- **Line height**: 1.5-1.75 for body text; 1.1-1.3 for headings.
- **Font size**: Minimum 16px for body text on desktop; don't go below 12px anywhere.
- **Paragraph spacing**: Margin-bottom on paragraphs should be roughly equal to line-height.

### 3.3 Web Typography Best Practices
```css
body {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 1rem;          /* 16px default */
  line-height: 1.6;
  max-width: 65ch;           /* optimal reading width */
  color: hsl(0, 0%, 15%);
}

h1, h2, h3 {
  line-height: 1.2;
  font-weight: 700;
}
```

### 3.4 Fluid Typography
Use `clamp()` for responsive type that scales with viewport:
```css
h1 { font-size: clamp(1.75rem, 4vw + 1rem, 3rem); }
p  { font-size: clamp(1rem, 0.5vw + 0.875rem, 1.25rem); }
```

---

## 4. Responsive Design

### 4.1 Core Principles
- **Mobile-first**: Start styles at the smallest breakpoint, add complexity with `min-width` media queries.
- **Fluid layouts**: Use relative units (`%`, `vw`, `fr`, `clamp()`) instead of fixed pixels.
- **Content decides breakpoints**: Add breakpoints where the content breaks, not at arbitrary device widths.

### 4.2 Common Breakpoints
```css
/* Mobile-first approach */
/* Base: 0-639px (no query needed) */
@media (min-width: 640px)  { /* Tablet portrait */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Wide desktop */ }
```

### 4.3 Layout Patterns

| Pattern | CSS Technique | When to Use |
|---------|--------------|-------------|
| **Stack** | `flex-direction: column` | Mobile: everything stacks vertically |
| **Sidebar + Main** | `grid-template-columns: 250px 1fr` | Persistent navigation |
| **Card Grid** | `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` | Galleries, products, blog lists |
| **Holy Grail** | `grid-template-areas: "header header" "nav main" "footer footer"` | Classic page layout |
| **Centered Content** | `max-width: 65ch; margin-inline: auto` | Articles, blog posts |

### 4.4 Responsive Images
```html
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  src="fallback.jpg"
  alt="Description"
  loading="lazy"
>
```

---

## 5. Accessibility (A11y)

### 5.1 WCAG Quick Reference (Level AA)

| Category | Requirement |
|----------|-------------|
| **Color contrast** | 4.5:1 for text, 3:1 for large text |
| **Keyboard** | All interactive elements reachable and operable via keyboard |
| **Focus indicators** | Visible focus ring on all interactive elements (never `outline: none` without replacement) |
| **Alt text** | Meaningful `alt` on all `<img>`; empty `alt=""` for decorative images |
| **Heading hierarchy** | One `<h1>`, followed by `<h2>` → `<h3>` (no skipping levels) |
| **Labels** | Every form input has an associated `<label>` |
| **ARIA** | Use native HTML elements first; add ARIA only when necessary |

### 5.2 Accessibility Checklist
- [ ] All images have `alt` attributes
- [ ] Color is never the sole indicator of meaning
- [ ] Page has a `lang` attribute on `<html>`
- [ ] `prefers-reduced-motion` media query respected
- [ ] Focus order is logical and visible
- [ ] Forms have clear error messages and labels
- [ ] Touch targets are at least 44×44px (WCAG 2.5.5)
- [ ] Semantic HTML used: `<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>`

### 5.3 `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Common UI Patterns

### 6.1 Navigation
- **Breadcrumbs**: `Home > Section > Page` for deep hierarchies
- **Hamburger menu**: Only on mobile; test visibility and discoverability
- **Sticky header**: Keep `position: sticky; top: 0` with a `z-index`
- **Active states**: Highlight the current page/link clearly

### 6.2 Cards
```css
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.06);
}
```

### 6.3 Forms
- Single-column layout (faster to scan than multi-column)
- Labels above inputs (not beside) for best readability
- Inline validation: validate on blur, not just on submit
- Clear error messages: state what's wrong and how to fix it
- Progress indication for multi-step forms

### 6.4 Modal Dialogs
- Use `<dialog>` element for native accessibility
- Trap focus inside modal when open
- Close on Escape key and backdrop click
- Prevent body scroll when open (`overflow: hidden`)

### 6.5 Dark Mode
```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-text: #f0f0f0;
  }
}

/* Or toggle manually with [data-theme="dark"] */
```

---

## 7. Design Systems

### 7.1 Design Tokens
Define design decisions as named values. Start small:

```css
:root {
  /* Colors */
  --color-primary: hsl(210, 100%, 50%);
  --color-primary-hover: hsl(210, 100%, 40%);
  --color-bg: hsl(0, 0%, 100%);
  --color-surface: hsl(0, 0%, 97%);
  --color-text: hsl(0, 0%, 10%);
  --color-text-muted: hsl(0, 0%, 40%);
  --color-border: hsl(0, 0%, 85%);

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 5rem;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

### 7.2 Component Thinking
- **Consistency over creativity**: A single button style is better than three "creative" variations.
- **Start with primitives**: Button, Input, Card, Badge, Avatar. Build from there.
- **State management**: Every interactive component needs: `default`, `hover`, `focus`, `active`, `disabled`, `loading`.

---

## 8. Performance & Design

- **Largest Contentful Paint (LCP)**: Hero images/text. Optimize with `loading="lazy"`, `fetchpriority="high"` for hero, proper sizing.
- **Cumulative Layout Shift (CLS)**: Always set `width` and `height` on images. Reserve space for async content.
- **Font loading**: Use `font-display: swap` to show fallback text while fonts load.
- **CSS containment**: `contain: layout style paint` for off-screen or independent components.

---

## 9. Modern Design Trends (2026)

| Trend | Key Idea |
|-------|----------|
| **Accessibility-first** | Accessibility is an operational capability, not a post-launch checklist |
| **AI-ready design systems** | Design tokens and components structured for AI tool consumption |
| **Cognitive inclusion** | Design for users with cognitive disabilities — reduce clutter, use plain language |
| **Probabilistic design** | Accept uncertainty in AI-generated content; design flexible containers |
| **Seamless integration** | Users want fewer tools, not more — design for interoperability |
| **Intent-based interfaces** | Match UI modality (chat, form, visual) to user intent, not the other way around |

---

## 10. Quick Evaluation Checklist

When reviewing a design or implementing a new UI, ask:

1. **Hierarchy**: What do you notice first? Is that the most important thing?
2. **Contrast**: Is text readable against its background? (Check 4.5:1)
3. **Alignment**: Does everything align to something else?
4. **Spacing**: Is there enough room to breathe? Is related content grouped?
5. **Consistency**: Are similar elements styled the same way?
6. **Typography**: Is the font readable? Is the line length 45-75 characters?
7. **Color**: Does the palette have a clear 60-30-10 distribution?
8. **Responsive**: Does it work at 320px, 768px, and 1440px?
9. **Accessible**: Can you navigate entirely by keyboard? Are images described?
10. **Performance**: Are images optimized? Is the layout stable on load?

---

## References

- [MDN: Design for Developers](https://developer.mozilla.org/en-US/curriculum/core/design-for-developers/)
- [web.dev: Learn Responsive Design](https://web.dev/learn/design/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [Practical Typography](https://practicaltypography.com/)
- [Visual Design Rules](https://anthonyhobday.com/sideprojects/saferules/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.info/)
