document.addEventListener("DOMContentLoaded", () => {
  /* ─── Theme Toggle ─── */

  const themeToggle = document.getElementById("theme-toggle");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  setTheme(getPreferredTheme());

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  /* ─── GitHub Stats ─── */

  const GITHUB_USER = "szmaou";

  async function fetchGitHubStats() {
    const reposEl = document.getElementById("gh-repos");
    const followersEl = document.getElementById("gh-followers");
    const followingEl = document.getElementById("gh-following");

    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
      if (!res.ok) throw new Error("GitHub API error");
      const data = await res.json();

      reposEl.textContent = data.public_repos;
      followersEl.textContent = data.followers;
      followingEl.textContent = data.following;
    } catch {
      reposEl.textContent = "—";
      followersEl.textContent = "—";
      followingEl.textContent = "—";
    }
  }

  fetchGitHubStats();
  fetchGitHubRepos();

  /* ─── GitHub Repos ─── */

  let allRepos = [];
  let currentSort = "popular";
  let currentPage = 1;
  function getPerPage() {
    return window.innerWidth <= 768 ? 3 : 6;
  }

  async function fetchGitHubRepos() {
    const grid = document.getElementById("project-grid");
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=50`,
      );
      if (!res.ok) throw new Error("GitHub API error");
      const repos = await res.json();
      allRepos = repos.filter((r) => !r.fork && r.description);
      currentPage = 1;
      renderRepos();
    } catch {
      grid.innerHTML =
        '<p class="loading-repos">Gagal memuat repositori. Coba reload.</p>';
      document.getElementById("pagination").style.display = "none";
    }
  }

  function renderRepos() {
    const grid = document.getElementById("project-grid");
    const pagination = document.getElementById("pagination");

    if (allRepos.length === 0) {
      grid.innerHTML =
        '<p class="loading-repos">Belum ada repo yang ditampilkan.</p>';
      pagination.style.display = "none";
      return;
    }

    const sorted = [...allRepos].sort((a, b) => {
      if (currentSort === "popular")
        return b.stargazers_count - a.stargazers_count;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    const totalPages = Math.ceil(sorted.length / getPerPage());
    const start = (currentPage - 1) * getPerPage();
    const end = start + getPerPage();
    const pageRepos = sorted.slice(start, end);

    pagination.style.display = sorted.length > getPerPage() ? "flex" : "none";

    grid.innerHTML = pageRepos
      .map((repo) => {
        const icon = getRepoIcon(repo.language);
        const topics = repo.topics?.length
          ? `<div class="repo-topics">${repo.topics
              .map((t) => `<span class="tech-item">${t}</span>`)
              .join("")}</div>`
          : "";
        const stars =
          repo.stargazers_count > 0
            ? `<span class="repo-stars">★ ${repo.stargazers_count}</span>`
            : "";

        return `
          <div class="project-card">
            <div class="card-header">
              <div class="card-icon">${icon}</div>
              <h3>${repo.name}</h3>
              ${stars}
            </div>
            <p>${repo.description}</p>
            ${topics}
            <p class="tech-note">— ${repo.language || "Various"}</p>
            <a href="${repo.html_url}" class="repo-link" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><use href="img/icons.svg#github"/></svg>
              visit the repo
            </a>
          </div>`;
      })
      .join("");

    updatePagination(totalPages);
  }

  function updatePagination(totalPages) {
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    const info = document.getElementById("page-info");

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    info.textContent = `${currentPage} / ${totalPages}`;
  }

  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderRepos();
      document.getElementById("project").scrollIntoView({ block: "nearest" });
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    currentPage++;
    renderRepos();
    document.getElementById("project").scrollIntoView({ block: "nearest" });
  });

  let prevPerPage;
  window.addEventListener("resize", () => {
    const newPerPage = getPerPage();
    if (prevPerPage && prevPerPage !== newPerPage) {
      currentPage = 1;
      renderRepos();
    }
    prevPerPage = newPerPage;
  });

  function getRepoIcon(language) {
    const iconMap = {
      HTML: 'html',
      CSS: 'css',
      JavaScript: 'javascript',
      TypeScript: 'typescript',
      Python: 'python',
      Java: 'java',
      Shell: 'shell',
      Lua: 'lua',
      C: 'c',
      'C++': 'cpp',
      Rust: 'rust',
      Go: 'go',
    };
    const key = iconMap[language] || 'default';
    return `<svg width="22" height="22"><use href="img/icons.svg#repo-${key}"/></svg>`;
  }

  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sort-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSort = btn.dataset.sort;
      currentPage = 1;
      renderRepos();
      document.getElementById("project").scrollIntoView({ block: "nearest" });
    });
  });

  /* ─── Hamburger ─── */

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach((link, i) => {
    link.style.setProperty("--i", i);
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  /* ─── Active Nav on Scroll ─── */

  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".nav-link");

  function updateActiveLink() {
    let current = "";
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink();

  /* ─── Scroll Reveal ─── */

  const revealElements = document.querySelectorAll(".section:not(.hero)");

  revealElements.forEach((el) => el.classList.add("section-hidden"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("section-hidden");
            entry.target.classList.add("section-visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.remove("section-hidden"));
  }

  /* ─── Parallax Hero ─── */

  const hero = document.querySelector(".hero-content");

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.15}px)`;
      hero.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
    }
  });

});
