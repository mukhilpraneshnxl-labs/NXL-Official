# NXL — Nexel Labs

> **Engineering what comes next.**

Official website for **Nexel Labs** — a technology company building modern software and security technology focused on privacy, performance, and thoughtful engineering.

**Founder:** Mukhil Pranesh K
**Flagship product:** Nexel Guard — *Smart Protection. Real Security.*

---

## Overview

This repository contains the official Nexel Labs website, built as a fully static site deployable directly via **GitHub Pages**.

The site uses:

- Plain **HTML, CSS, and vanilla JavaScript** — no frameworks, no build step
- **Black + Electric Blue** design language
- Inline **SVG assets** for zero external image dependencies
- **Inter** + **JetBrains Mono** web fonts (loaded from Google Fonts)
- **Reduced-motion** support throughout
- Fully **responsive** layouts (1440px down to 360px)

---

## Repository layout

```
/
├── index.html          ← entry point (served at /)
├── styles.css          ← complete design system
├── script.js           ← interactions & reveal animations
├── README.md
├── .gitattributes
└── assets/
    ├── favicon.svg
    └── images/
        ├── logo-mark.svg
        ├── hero-visual.svg
        ├── product-dashboard.svg
        ├── product-scan.svg
        ├── product-threats.svg
        ├── founder.svg
        ├── og-image.svg
        ├── pattern-grid.svg
        ├── icon-rust.svg
        ├── icon-tauri.svg
        ├── icon-windows.svg
        ├── icon-security.svg
        └── icon-privacy.svg
```

> **GitHub Pages note:** `index.html` lives at the repository root so the site is served immediately without configuration.

---

## Local development

Open `index.html` directly in any modern browser, or serve the directory locally:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

---

## Deployment

This site is designed to be deployed via **GitHub Pages** from the `main` branch.

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `(root)`
4. Save. The site becomes available at `https://<username>.github.io/<repo>/`.

All asset paths in the HTML use **relative paths** (`./styles.css`, `./assets/...`), so the site continues to resolve correctly when hosted under a sub-path.

---

## Design system

### Colors

| Token            | Value      | Use                           |
| ---------------- | ---------- | ----------------------------- |
| `--nxl-black-0`  | `#050505`  | Primary background            |
| `--nxl-black-1`  | `#08090B`  | Alt sections                  |
| `--nxl-black-2`  | `#0B0D10`  | Cards / surfaces              |
| `--nxl-blue`     | `#0066FF`  | Primary accent, CTAs          |
| `--nxl-blue-5`   | `#60A5FA`  | Highlight accent              |
| `--nxl-text`     | `#F5F7FA`  | Primary text                  |
| `--nxl-text-2`   | `#A7ADB7`  | Secondary text                |
| `--nxl-text-muted`| `#6B7280` | Tertiary / metadata           |

### Typography

- **Inter** — body and headings
- **JetBrains Mono** — technical labels, IDs, eyebrows

### Motion

- Subtle fade/translate reveal on scroll
- Subtle mouse-follow parallax on the hero visual
- Pulsing status dots (status indicators)
- Respects `prefers-reduced-motion` (continuous motion disabled)

---

## Accessibility

- Semantic landmarks (`header`, `main`, `section`, `footer`)
- Skip-to-main link
- Visible focus rings
- Color contrast verified for text against backgrounds
- Reduced-motion support
- Mobile menu with proper ARIA attributes
- Keyboard-operable product showcase (arrow keys)
- Decorative SVG images use empty `alt` text

---

## Sections

1. **Hero** — primary brand statement with abstract technical visual
2. **Signal bar** — engineering capability tags
3. **About** — company positioning
4. **Products** — Nexel Guard showcase (interactive tabbed preview)
5. **Technology** — stack grid
6. **Engineering principles** — six core values
7. **Founder** — Mukhil Pranesh K
8. **Vision** — large statement
9. **Final CTA** — contact + secondary CTA
10. **Footer** — navigation + product + contact

---

## License

© 2026 Nexel Labs. All rights reserved.
