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
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
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
    const icons = {
      HTML: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0z" fill="#E34F26"/></svg>`,
      CSS: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0z" fill="#1572B6"/></svg>`,
      JavaScript: `<svg viewBox="0 0 24 24" width="22" height="22"><rect x="2" y="2" width="20" height="20" rx="3" fill="#F7DF1E"/></svg>`,
      TypeScript: `<svg viewBox="0 0 24 24" width="22" height="22"><rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6"/></svg>`,
      Python: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#3776AB"/><path d="M9 11l6-3v5l-6 3v-5z" fill="#FFD43B"/></svg>`,
      Java: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#007396"/></svg>`,
      Shell: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13l-2-2 3-3-3-3 2-2 5 5-5 5z" fill="#4EAA25"/></svg>`,
      Lua: `<svg viewBox="0 0 128 128" width="22" height="22"><circle cx="64" cy="64" r="49" fill="#000080"/><circle cx="113" cy="15" r="14.3" fill="#000080"/><circle cx="84" cy="43.7" r="14.3" fill="#000080"/></svg>`,
      C: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#00599C"/></svg>`,
      "C++": `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#00599C"/></svg>`,
      Rust: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#DEA584"/></svg>`,
      Go: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#00ADD8"/></svg>`,
    };
    return (
      icons[language] ||
      `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#888"/></svg>`
    );
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

  /* ─── Contact Form ─── */

  const form = document.getElementById("contact-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Harap isi semua field!");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("Email tidak valid!");
      return;
    }

    alert(`Terima kasih ${name}! Pesanmu sudah terkirim.`);
    form.reset();
  });
});
