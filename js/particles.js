/* ─── Hero Particles ─── */
(() => {
  /* Kill switch: 1024px is the primary gate — no particle loop, animation,
     or listeners on mobile/tablet. Reduced motion bails here too
     (canvas hidden via display:none, no rAF frame loop starts). */
  if (window.matchMedia("(max-width: 1024px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const c = document.getElementById("hero-particles");
    if (c) c.style.display = "none";
    return;
  }

  const canvas = document.getElementById("hero-particles");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ─── Config ─── */
  const LINK = 110;
  const MAX_COUNT = window.innerWidth < 768 ? 40 : 60;
  const COUNT = Math.min(MAX_COUNT, Math.floor(window.innerWidth / 16));
  const DOT_RADIUS = 1.6;
  const SPEED = 0.4;
  const DAMPING = 0.98;
  const REPEL_DIST = 60;
  const REPEL_STRENGTH = -0.6;
  const ATTRACT_STRENGTH = 0.25;

  /* ─── State ─── */
  let particles = [];
  let mouse = null;
  let width = 0;
  let height = 0;
  let canvasRect = { left: 0, top: 0 };
  let frameCount = 0;

  function getAccent() {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#58a6ff"
    );
  }

  function resizeCanvas() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    if (width === 0 || height === 0) return false;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasRect = canvas.getBoundingClientRect();
    return true;
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      });
    }
  }

  /* ─── Mouse field: repel < 60, attract 60..140, falloff 1 - d/140 ─── */
  function applyMouse(p) {
    if (!mouse) return;
    const vx = mouse.x - p.x;
    const vy = mouse.y - p.y;
    const d = Math.hypot(vx, vy);
    if (d === 0 || d > LINK) return;
    const falloff = 1 - d / LINK;
    const strength = d < REPEL_DIST ? REPEL_STRENGTH : ATTRACT_STRENGTH;
    const f = strength * falloff;
    p.vx += (vx / d) * f;
    p.vy += (vy / d) * f;
  }

  /* ─── Animation frame ─── */
  function step() {
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const color = getAccent();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.vx += (Math.random() - 0.5) * SPEED;
      p.vy += (Math.random() - 0.5) * SPEED;
      p.vx *= DAMPING;
      p.vy *= DAMPING;

      applyMouse(p);

      p.x += p.vx;
      p.y += p.vy;

      /* bounce */
      if (p.x < 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx);
      } else if (p.x > width) {
        p.x = width;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < 0) {
        p.y = 0;
        p.vy = Math.abs(p.vy);
      } else if (p.y > height) {
        p.y = height;
        p.vy = -Math.abs(p.vy);
      }
    }

    /* lines: opacity 1 - d/LINK — O(n²), throttled by DPR */
    if (frameCount > 1e6) frameCount = 0;
    if (frameCount % (dpr >= 2 ? 2 : 1) === 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1 / dpr;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          ctx.globalAlpha = 1 - d / LINK;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    /* dots */
    ctx.fillStyle = color;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  /* ─── Reduced motion: static dots, no frame loop ─── */
  function drawStatic() {
    const color = getAccent();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function onResize() {
    if (!resizeCanvas()) return;
    buildParticles();
    if (prefersReduced) drawStatic();
  }

  function init() {
    if (!resizeCanvas()) return;
    buildParticles();

    /* canvas keeps pointer-events: none (CSS), so interact via parent */
    const root = canvas.parentElement;
    root.addEventListener("mousemove", (e) => {
      mouse = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      };
    }, { passive: true });
    root.addEventListener("mouseleave", () => {
      mouse = null;
    }, { passive: true });

    window.addEventListener("resize", onResize, { passive: true });

    if (prefersReduced) {
      drawStatic();
      /* redraw static dots if the theme changes */
      const themeWatcher = new MutationObserver(drawStatic);
      themeWatcher.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return;
    }

    requestAnimationFrame(step);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
