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

**Auto (picks the best available method):**
```bash
chmod +x run.sh
./run.sh           # default port 8080
./run.sh 3000      # custom port
```

**Docker:**
```bash
docker compose up -d --build
# → http://localhost:8080
```

**Python:**
```bash
python3 -m http.server 8080
```

**Node:**
```bash
npx http-server -p 8080
```

**Manual:** Open `index.html` directly in your browser.

## License

MIT
