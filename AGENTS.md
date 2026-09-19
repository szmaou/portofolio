# AGENTS.md

## Stack
Vanilla HTML / CSS / JS only. No build, bundler, `package.json`, tests/lint/typecheck, or `opencode.json`. Static via `nginx:alpine` (`COPY . /usr/share/nginx/html`).

## Run
```bash
./run.sh --docker          # docker compose up -d --build, 80:80 (PORT arg ignored by compose)
./run.sh --python [port]   # python3 -m http.server (default 8080)
./run.sh --npx [port]      # npx live-server --port --no-browser
```
`PORT` only affects the echo + `--python`/`--npx` modes. No `.github/` or CI.

## Structure
- `index.html` — single page `#home`/`#about`/`#project`/`#contact`, no templating. Importmap `three@0.185.1`. CSS load order matters: `variables.css` → `base.css` → `navbar.css` → `home.css` → `about.css` → `project.css` → `contact.css` → `responsive.css`.
- `css/variables.css` — all custom props (`--bg`, `--text`, `--accent`, `--accent-rgb`, glass/shadows) + `[data-theme="light"]` overrides.
- `js/script.js` — main `DOMContentLoaded`, no modules. `js/slime-viewer.js` (`rimuru_slime.glb` 2.3M) + `js/particles.js` lazy via `requestIdleCallback`, must never call `loaderDone()`.
- `assets/` — no icon sprite (brand icons via `https://cdn.simpleicons.org/<slug>/<hex>` as `<img>`, `sun`/`moon`/`location` inlined in `index.html`), `slime.webp` (preload + favicon + video `poster`), `saber.webp` (`loading="lazy"`, hero image ≤1024px), `saber.mp4` + `saber-720p.webm` (preferred) hero video desktop, `rimuru_slime.glb`. Extra root: `CNAME`, `robots.txt`, `sitemap.xml`, `LICENSE`.

## Hero & Responsive
- `.hero-bg` holds both `<video>` and `<img class="hero-bg-img">` sharing `object-fit:cover; opacity:0.15; mix-blend-mode:screen` (light `0.2`/`multiply`). Desktop: `img{display:none}`; `≤1024px` (`responsive.css`): `video{display:none}` + `img{display:block}` (lazy, no autoplay cost).
- `.hero-grid` 2-col desktop, 1-col `≤768px`. At `≤768px` `hero-side{order:-1}` (avatar/stats) above `hero-text{order:1}` (title/tagline/CTA). Keep `.hero-content` intact — parallax (`translateY` + `opacity`, rAF throttled) targets it.
- Breakpoints all in `css/responsive.css`: `1024px`, `768px`, `480px`. `clamp()` typography, touch targets ≥44px.
- `≤1024px`: `#slime-mount{display:none}` + `index.html` skips `import("./js/slime-viewer.js")` + `slime-viewer.js` guard (`matchMedia(max-width:1024px)` + `webglAvailable()` defense-in-depth).
- `prefers-reduced-motion:reduce` hides `video` only (image stays), disables aurora/avatar/slime animations; `particles.js` early-returns with `display:none`.

## JS Gotchas
- Loader hides after **2** fetches (`loadCount===2`: `fetchGitHubStats()` + `fetchGitHubRepos()` via `Promise.allSettled` at `script.js:98`). Removing one without fixing `loaderDone()` stalls loader. Cached in `sessionStorage` `gh-cache-*` 5min.
- GitHub user hardcoded `const GITHUB_USER="szmaou"` in `js/script.js`. APIs `users/${GITHUB_USER}` and `/repos?sort=updated&per_page=50` filtered `!fork && description`. `CONTRIBUTED_REPOS=["terarush/ping-uptime"]` + `CONTRIBUTED_ORGS=["cnp-plus"]` (`/orgs/${org}/repos?per_page=100`) merged `Promise.allSettled`, dedup `id/full_name`.
- Stat IDs `gh-repos`/`gh-followers`/`gh-following` + `#github-stats` — JS selects by ID, don't rename.
- Repo pagination `getPerPage()` 3 `≤768px` else 6; `resize` resets to page 1 when crossing breakpoint (`prevPerPage`).
- Active nav `offsetTop -120` + `scroll-padding-top:70px`.
- Particles viewport-aware `computeConfig()`: mobile `≤768px` `MAX 25 / LINK 90 / SPEED 0.3 / DOT 1.4` vs desktop `60/110/0.4/1.6`, `COUNT=min(MAX, floor(innerWidth/24))`; recomputed on `resize`. Only `prefers-reduced-motion` blocks loop.
- Shared classes `about.css` `.about-side-block`/`.github-stats` reused in hero — changes affect both.

## Editing Rules
- Keep HTML well-formed; verify referenced classes exist across the 8 CSS files after moves.
- Prefer existing CSS variables over new colors; match GitHub-dark aesthetic.
- Comments only `/* ─── Section ─── */` style.
