document.addEventListener("DOMContentLoaded", () => {
  /* ─── Loader ─── */

  let loadCount = 0;
  const loader = document.getElementById("loader");

  function loaderDone() {
    loadCount++;
    if (loadCount === 2) loader.classList.add("hidden");
  }

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
  /* contributed repos displayed alongside owned ones */
  const CONTRIBUTED_REPOS = ["terarush/ping-uptime", "cnp-plus/pplg"];

  /* ─── sessionStorage cache ─── */
  const CACHE_PREFIX = "gh-cache-";
  const CACHE_TTL = 300000; /* 5 minutes */

  function getCacheKey(type) {
    return CACHE_PREFIX + type;
  }

  function getFromCache(type) {
    try {
      const entry = JSON.parse(sessionStorage.getItem(getCacheKey(type)));
      if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
      }
    } catch {}
    return null;
  }

  function setInCache(type, data) {
    try {
      const entry = { timestamp: Date.now(), data };
      sessionStorage.setItem(getCacheKey(type), JSON.stringify(entry));
    } catch {}
  }

  async function fetchGitHubStats() {
    const reposEl = document.getElementById("gh-repos");
    const followersEl = document.getElementById("gh-followers");
    const followingEl = document.getElementById("gh-following");

    try {
      const cached = getFromCache("stats");
      if (cached) {
        reposEl.textContent = cached.public_repos;
        followersEl.textContent = cached.followers;
        followingEl.textContent = cached.following;
        return;
      }

      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
      if (!res.ok) throw new Error("GitHub API error");
      const data = await res.json();

      reposEl.textContent = data.public_repos;
      followersEl.textContent = data.followers;
      followingEl.textContent = data.following;
      setInCache("stats", data);
    } catch {
      reposEl.textContent = "—";
      followersEl.textContent = "—";
      followingEl.textContent = "—";
    } finally {
      loaderDone();
    }
  }

  Promise.allSettled([fetchGitHubStats(), fetchGitHubRepos()]);

  /* ─── GitHub Repos ─── */

  let allRepos = [];
  let currentSort = "popular";
  let currentPage = 1;
  function getPerPage() {
    return window.innerWidth <= 768 ? 3 : 6;
  }

  async function fetchContributedRepos() {
    const cached = getFromCache("contributed");
    if (cached) return cached;

    const results = await Promise.allSettled(
      CONTRIBUTED_REPOS.map((fullName) =>
        fetch(`https://api.github.com/repos/${fullName}`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${fullName}`);
          return res.json();
        }),
      ),
    );
    const repos = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const r = result.value;
        if (!r.fork && r.description) repos.push(r);
      } else {
        console.warn("Contributed repo fetch failed:", result.reason);
      }
    });
    setInCache("contributed", repos);
    return repos;
  }

  async function fetchGitHubRepos() {
    const grid = document.getElementById("project-grid");
    try {
      const [ownedResult, contributedResult] = await Promise.allSettled([
        (async () => {
          const cached = getFromCache("repos");
          if (cached) return cached;
          const res = await fetch(
            `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=50`,
          );
          if (!res.ok) throw new Error("GitHub API error");
          const repos = await res.json();
          const filtered = repos.filter((r) => !r.fork && r.description);
          setInCache("repos", filtered);
          return filtered;
        })(),
        fetchContributedRepos().catch((e) => {
          console.warn("Contributed repos failed:", e);
          return [];
        }),
      ]);

      if (ownedResult.status === "fulfilled") {
        allRepos = ownedResult.value;
      }
      if (contributedResult.status === "fulfilled") {
        contributedResult.value.forEach((r) => {
          if (
            !allRepos.some(
              (x) => x.id === r.id || x.full_name === r.full_name,
            )
          ) {
            allRepos.push(r);
          }
        });
      }

      if (allRepos.length === 0) {
        grid.innerHTML =
          '<p class="loading-repos">Gagal memuat repositori. Coba reload.</p>';
        document.getElementById("pagination").style.display = "none";
      } else {
        currentPage = 1;
        renderRepos();
      }
    } finally {
      loaderDone();
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
          ? `<p class="repo-topics">${repo.topics
              .map((t) => `<span class="topic-pill">${t}</span>`)
              .join(" ")}</p>`
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
            <a href="${repo.html_url}" class="repo-link" target="_blank" rel="noopener">
              <img src="https://cdn.simpleicons.org/github/181717" alt="GitHub" width="16" height="16" />
              visit the repo
            </a>
          </div>`;
      })
      .join("");

    const cards = grid.querySelectorAll(".project-card");
    cards.forEach((card, idx) => card.style.setProperty("--i", idx));

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

  function escapeHtmlAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getRepoIcon(language) {
    const iconMap = {
      HTML: "repo-html",
      CSS: "repo-css",
      JavaScript: "repo-javascript",
      TypeScript: "repo-typescript",
      Python: "repo-python",
      Java: "repo-java",
      Kotlin: "repo-kotlin",
      Vue: "repo-vue",
      QML: "repo-qml",
      Dart: "repo-dart",
      Swift: "repo-swift",
      PHP: "repo-php",
      Ruby: "repo-ruby",
      Shell: "repo-shell",
      Lua: "repo-lua",
      C: "repo-c",
      "C++": "repo-cpp",
      Rust: "repo-rust",
      Go: "repo-go",
    };

    const symbol = iconMap[language] || "repo-default";
    const label = language || "Unknown";
    return `<svg class="repo-icon" viewBox="0 0 24 24" width="22" height="22" role="img" aria-label="${escapeHtmlAttr(label)}"><use href="assets/icons.svg#${symbol}"/></svg>`;
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

  window.addEventListener("scroll", updateActiveLink, { passive: true });
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

  /* ─── Motion ─── */

  const hero = document.querySelector(".hero-content");

  /* Parallax (rAF throttled) */
  if (hero) {
    let parallaxTick = false;
    window.addEventListener("scroll", () => {
      if (parallaxTick) return;
      parallaxTick = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          hero.style.transform = `translateY(${scrolled * 0.15}px)`;
          hero.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
        }
        parallaxTick = false;
      });
    }, { passive: true });
  }

  /* Mouse tilt (desktop only) */
  const canTilt =
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Project-card tilt — deferred to idle (non-critical interactivity) */
  function setupProjectCardTilt() {
    document.querySelectorAll(".project-card").forEach((card) => {
      let ticking = false;
      card.addEventListener("mousemove", (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const rotateY = (e.clientX - centerX) / 12;
          const rotateX = (centerY - e.clientY) / 14;
          card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-4px)`;
          ticking = false;
        });
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  if (canTilt) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => setupProjectCardTilt(), { timeout: 1500 });
    } else {
      setupProjectCardTilt();
    }

    /* Hero avatar tilt (lighter) — kept eager */
    const avatar = document.querySelector(".hero-side .img-wrapper");
    if (avatar) {
      let ticking = false;
      avatar.addEventListener("mousemove", (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = avatar.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const rotateY = (e.clientX - centerX) / 25;
          const rotateX = (centerY - e.clientY) / 30;
          avatar.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
          ticking = false;
        });
      });
      avatar.addEventListener("mouseleave", () => {
        avatar.style.transform = "";
      });
    }
  }

});
