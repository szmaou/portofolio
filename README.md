# szmaou/portofolio

Personal portfolio website — vanilla HTML, CSS, and JavaScript.

**Live:** https://szmaou.github.io/portofolio/

## Features

- Dark/light theme (system preference + localStorage)
- Responsive layout (desktop & mobile)
- GitHub API integration (repos, stats, sort & pagination)
- Scroll reveal animation
- Hamburger menu
- Hero parallax effect
- Theme toggle with inline SVG sprite
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
│   └── script.js
└── img/
    ├── icons.svg
    ├── rimuru.webp
    ├── screenshot_1.webp
    └── slime.webp
```

## Getting Started

```bash
./run.sh --docker          # default port 8080
./run.sh --python 3000     # custom port
./run.sh --npx
```

## License

MIT
