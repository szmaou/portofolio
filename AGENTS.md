# AGENTS.md

## Stack
Vanilla HTML / CSS / JS only. No build, no bundler, no `package.json`, no tests/lint/typecheck. Served as static files via `nginx:alpine` (`COPY . /usr/share/nginx/html`).

## Run
```bash
./run.sh --docker          # docker compose up -d --build, container port 80
./run.sh --python [port]   # python3 -m http.server (default 8080)
./run.sh --npx [port]      # npx live-server --port --no-browser
```
Docker maps `80:80` regardless of `PORT` arg — `PORT` only affects the echo message and `--python`/`--npx` modes.

## Structure
- `index.html` — single page, 4 sections: `#home` (hero), `#about`, `#project`, `#contact`. No templating.
- `css/` — load order in `index.html` matters: `variables.css` → `base.css` → `navbar.css` → `home.css` → `about.css` → `project.css` → `contact.css` → `responsive.css`. `variables.css` defines all CSS custom properties (`--bg`, `--text`, `--accent`, `--accent-rgb`, etc.) and `[data-theme="light"]` overrides.
- `js/` — `script.js` (main `DOMContentLoaded`, no modules), `slime-viewer.js` (Three.js `rimuru_slime.glb` via importmap `three@0.185.1`, idle spin), `particles.js` (vanilla canvas, mouse grab/repel). Both lazy via `requestIdleCallback`, never touch `loaderDone`.
- `assets/` — `icons.svg` (sun/moon/location only, 3 symbols), `slime.webp` (poster), `rimuru.webp`, `saber.mp4` + `saber-720p.webm` (WebM preferred), `rimuru_slime.glb` (2.3M). Hero video + slime both use `<video>`/`<canvas>` with transparent bg.
- No `.github/`, no CI, no `opencode.json`.

## CSS Conventions
- Theme via `document.documentElement.setAttribute("data-theme", ...)` + `localStorage.getItem("theme")` key `"theme"`; fallback `prefers-color-scheme: light`.
- Hero parallax targets `.hero-content` (`translateY` + opacity on scroll) — keep that element intact or parallax breaks.
- Responsive breakpoints: `1024px` (tablet), `768px` and `480px`, all in `css/responsive.css`. Fluid typography via `clamp()`, touch targets ≥44px.
- Hero layout: `.hero-grid` (2-col desktop, 1-col mobile) with `.hero-text` left / `.hero-side` right. GitHub avatar `.img-wrapper` + stats use classes from `about.css` (`.about-side-block`, `.github-stats`) shared across hero — changing those affects both places.

## JS Gotchas
- Loader hides after **2** fetches complete (`loadCount === 2`: `fetchGitHubStats()` + `fetchGitHubRepos()`). Removing either fetch without adjusting `loaderDone()` leaves loader stuck.
- GitHub user hardcoded: `const GITHUB_USER = "szmaou"` in `js/script.js`. API: `https://api.github.com/users/${GITHUB_USER}` and `/repos?sort=updated&per_page=50` (filtered `!r.fork && r.description`).
- Stat IDs `gh-repos` / `gh-followers` / `gh-following` and `#github-stats` — JS selects by ID, don't rename without updating `script.js`.
- Repo pagination: `getPerPage()` = 3 on mobile (≤768px), 6 on desktop; resize resets to page 1 when crossing breakpoint.
- Active nav uses `offsetTop - 120` threshold + `scroll-padding-top: 70px`.
- `js/slime-viewer.js` and `js/particles.js` are lazy via `requestIdleCallback` and must never call `loaderDone()` — loader stays gated on the 2 GitHub fetches.
- Contributed repos: `CONTRIBUTED_REPOS = ["terarush/ping-uptime","cnp-plus/pplg"]` merged into `allRepos` via `Promise.allSettled`, deduplicated by `id/full_name`, filtered `!fork && description`.

## Editing Rules
- Keep HTML well-formed; verify all referenced CSS classes exist across the 8 CSS files after moves.
- Prefer existing CSS variables over new colors; match current GitHub-dark aesthetic.
- No comments in code unless following existing `/* ─── Section ─── */` style.
