# AGENTS.md

## Cursor Cloud specific instructions

### Repository overview

This is a **Discourse custom theme** repository ("Robotime Community Theme") for Discourse v3.x+. It follows the standard Discourse theme file structure:

- `about.json` — Theme metadata and Robotime color scheme definition
- `settings.yml` — Configurable theme settings (logo URL, nav links, carousel toggle, events category)
- `locales/en.yml` — English translations
- `common/common.scss` — Shared SCSS styles for all viewports (header, carousel, sidebar, topic cards, filter bar)
- `javascripts/robotime/connectors/above-site-header/robotime-header.hbs` — Custom top bar (Plugin Outlet **above-site-header**; use Plugin Outlet Locations theme to verify)
- `javascripts/robotime/connectors/below-site-header/robotime-carousel.hbs` — Carousel under default header (**below-site-header**)
- `javascripts/robotime/connectors/after-sidebar-sections/robotime-sidebar-slot.hbs` — `.robotime-sidebar-widget-slot` for hub **sidebar_widgets** (**after-sidebar-sections**)
- `javascripts/discourse/api-initializers/robotime-hub.js` — `hub-config.json`, carousel, sidebar widget, quick tags, mobile menu
- `common/header.html`, `common/after_header.html`, `common/head_tag.html` — Legacy placeholders only (no inline `text/x-handlebars` / `discourse-plugin`)
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

- Fonts rely on Google Fonts CDN (`Noto Sans` in preview, `Google Sans Flex` specified in design). The `Google Sans Flex` font is proprietary and not publicly available on Google Fonts; the preview uses `Noto Sans` as a close substitute.
- Carousel cards currently use emoji as placeholder icons; real illustrations from the designer are pending.
- See `DEVELOPMENT.md` for full developer handoff documentation including architecture, icon mapping, animation parameters, and TODO list.
