# szmaou/portofolio

Live: https://hasan.cnp.my.id / https://szmaou.github.io/portofolio/

Personal portfolio website — vanilla HTML, CSS, and JavaScript.

## Features

- Dark/light theme (system preference + localStorage)
- Responsive layout (desktop & mobile)
- GitHub API integration (repos, stats, sort & pagination, plus `CONTRIBUTED_REPOS` merge)
- Scroll reveal animation
- Hamburger menu
- Hero parallax effect
- Theme toggle (sun/moon sprite + location only)
- Video hero (WebM 720p preferred, MP4 fallback) with particle network background (canvas, mouse grab/repel)
- 3D slime mascot (Three.js GLB viewer, idle spin, transparent)
- Tech marquee (animating SimpleIcons CDN rail, pause on hover)
- SimpleIcons CDN for social & language icons (colored, dark-mode invert for GitHub/Opencode)
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
    ├── icons.svg
    ├── slime.webp
    ├── rimuru.webp
    ├── saber.mp4
    ├── saber-720p.webm
    └── rimuru_slime.glb
```

## Getting Started

```bash
./run.sh --docker          # default port 8080
./run.sh --python 3000     # custom port
./run.sh --npx
```
