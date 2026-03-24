# AGENTS.md

## Cursor Cloud specific instructions

### Repository overview

This is a **Discourse custom theme** repository ("Robotime Community Theme") for Discourse v3.x+. It follows the standard Discourse theme file structure:

- `about.json` — Theme metadata and Robotime color scheme definition
- `settings.yml` — Configurable theme settings (logo URL, nav links, carousel toggle, events category)
- `locales/en.yml` — English translations
- `common/common.scss` — Shared SCSS styles for all viewports (header, carousel, sidebar, topic cards, filter bar)
- `common/header.html` — Custom Handlebars template for the header navigation bar
- `common/after_header.html` — Category carousel Handlebars template
- `common/head_tag.html` — JavaScript: carousel logic, mobile menu, image ratio detection
- `desktop/desktop.scss` — Desktop and tablet layout overrides
- `mobile/mobile.scss` — Mobile responsive styles (<768px, hamburger menu, single-column layout)
- `preview.html` — Standalone preview page for visual testing without a Discourse instance
- `design-rule/` — JPG design mockups with annotated measurements
- `Icon/` — PNG icon assets (sidebar, like/comment/view icons)

### Verifying SCSS

SCSS files can be compiled and validated using Dart Sass:

```bash
sass common/common.scss /tmp/common_test.css
sass desktop/desktop.scss /tmp/desktop_test.css
sass mobile/mobile.scss /tmp/mobile_test.css
```

### Running the preview

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/preview.html` for the interactive theme preview.

### Theme architecture notes

- The theme is a **sub-theme** that depends on a Discourse base theme (e.g. `discourse-corporate`).
- SCSS variables are centralized at the top of `common/common.scss`.
- Image aspect ratio handling: images with w/h ratio > 0.85 get 1:1 cropping, otherwise 3:4.
- Carousel cards have per-card rotation rules (cards 1, 2, 5, 8 rotate 5deg on hover).
- To test on a real Discourse instance, install via Admin > Customize > Themes > Import from Git.

### Known caveats

- The original `针对顶部板块导航栏参考样式.html` uses WebGL (Principle export); it won't render in environments without GPU acceleration.
- Fonts rely on Google Fonts CDN (`Noto Sans` in preview, `Google Sans Flex` specified in design). The `Google Sans Flex` font is proprietary and not publicly available on Google Fonts; the preview uses `Noto Sans` as a close substitute.
