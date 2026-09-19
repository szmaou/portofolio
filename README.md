# szmaou/portofolio

Live: https://hasan.cnp.my.id / https://szmaou.github.io/portofolio/

Personal portfolio website — vanilla HTML, CSS, and JavaScript.

## Features

- Dark/light theme (system preference + localStorage)
- Responsive layout (desktop & mobile)
- GitHub API integration (repos, stats, sort & pagination, plus `CONTRIBUTED_REPOS`/`CONTRIBUTED_ORGS` merge)
- Scroll reveal animation
- Hamburger menu
- Hero parallax effect
- Theme toggle (inline sun/moon icons) + location pin
- Hero: video on desktop (WebM 720p preferred, MP4 fallback), image on mobile/tablet ≤1024px (`saber.webp`, lighter, no autoplay) — reorders on ≤768px (avatar/stats above title + CTAs)
- Particle network background (canvas, mouse grab/repel) — light on mobile ≤768px, rich on desktop; respects `prefers-reduced-motion`
- 3D slime mascot (Three.js GLB viewer, idle spin, transparent — desktop only, disabled ≤1024px)
- Tech Stack in 4 categories (Languages, Frameworks & Mobile, Databases & DevOps, System & Workspace) via SimpleIcons CDN
- SimpleIcons CDN for tech, repo, social & contact icons (colored, dark-mode invert for GitHub/opencode)
- Contact details (WhatsApp, Email, Location)
- Discord card & social links

## File Structure

```
├── index.html
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── navbar.css
│   ├── home.css
│   ├── about.css
│   ├── project.css
│   ├── contact.css
│   └── responsive.css
├── js/
│   ├── script.js
│   ├── slime-viewer.js
│   └── particles.js
└── assets/
     ├── slime.webp
     ├── saber.webp         # hero image on mobile/tablet ≤1024px
     ├── saber.mp4          # hero video on desktop
     ├── saber-720p.webm    # hero video on desktop (preferred)
     └── rimuru_slime.glb   # 3D mascot (desktop only)
```

## Getting Started

```bash
./run.sh --docker          # default port 8080
./run.sh --python 3000     # custom port
./run.sh --npx
```
