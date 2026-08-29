# szmaou/portofolio

Personal portfolio website — vanilla HTML, CSS, and JavaScript.

## Features

- Dark/light theme (system preference + localStorage)
- Responsive layout (desktop & mobile)
- GitHub API integration (repos, stats, sort & pagination)
- Scroll reveal animation
- Hamburger menu
- Hero parallax effect
- Theme toggle with inline SVG sprite
- Video hero (MP4/WebM loop) with slime poster fallback
- 3D slime mascot (Three.js GLB viewer, lazy-loaded)
- Particle network background (canvas)
- Tech marquee (animating tech-stack rail)
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
