# AGENTS.md

## Cursor Cloud specific instructions

### Repository overview

This is a **Discourse custom theme design specification** repository ("Robotime Community Theme"). It contains **no application code, no build system, and no dependencies** — only static design assets and documentation:

- `README.md` — Full theme requirements document (in Chinese), covering nav bar, category carousel, sidebar, main content area, and tech stack specs.
- `针对顶部板块导航栏参考样式.html` — An interactive HTML prototype for the top navigation bar (built with Principle, requires WebGL; will show a fallback message in environments without hardware-accelerated WebGL).
- `Icon/` — PNG icon assets (sidebar icons, like/comment/view icons).
- `design-rule/` — JPG design mockups with annotated measurements and specs.

### Running the project

Since this is a static-asset-only repo, the simplest way to browse the content is:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a browser to browse files, view design mockups, and open the HTML prototype.

### Known caveats

- The HTML prototype (`针对顶部板块导航栏参考样式.html`) uses WebGL via Principle's export format. In cloud VM environments without GPU acceleration, it will display "This browser's WebGL isn't hardware accelerated" instead of the interactive content.
- There are no lint, test, or build commands — the repo has no `package.json`, `Makefile`, or any dependency files.
- To develop the actual Discourse theme described in the README, a full Discourse dev environment (Ruby on Rails + PostgreSQL + Redis) would be needed, but that is outside the scope of this design-spec repo.
