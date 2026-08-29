/* slime-viewer.js — lazy Three.js viewer for #slime-mount.
   Dynamically imported after requestIdleCallback (see index.html), so it
   never interferes with the hero loader in js/script.js. */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MOUNT = document.getElementById("slime-mount");
const CANVAS = document.getElementById("slime-canvas");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ─── WebGL guard ─── */
function webglAvailable() {
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ||
      probe.getContext("webgl") ||
      probe.getContext("experimental-webgl");
    return !!gl && !!window.WebGLRenderingContext;
  } catch {
    return false;
  }
}

if (!MOUNT || !CANVAS || !webglAvailable()) {
  /* No WebGL → leave .slime-fallback so the poster avatar stays visible. */
  if (MOUNT) MOUNT.classList.add("slime-fallback");
  console.warn(
    "[slime-viewer] WebGL unavailable or mount/canvas missing — fallback preserved.",
  );
} else {
  initViewer();
}

function initViewer() {
  const scene = new THREE.Scene();
  scene.background = null; /* null keeps the glass pedestal visible */

  const renderer = new THREE.WebGLRenderer({
    canvas: CANVAS,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(MOUNT.clientWidth, MOUNT.clientHeight, false);

  const camera = new THREE.PerspectiveCamera(
    35,
    MOUNT.clientWidth / MOUNT.clientHeight,
    0.1,
    100,
  );
  camera.position.set(0, 0.4, 4);

  /* ─── Lighting: soft hemisphere + key + colored rim ─── */
  const hemi = new THREE.HemisphereLight(0xffffff, 1.2);
  scene.add(hemi);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x8ab4ff, 1.0);
  rimLight.position.set(-3, 1, -2);
  scene.add(rimLight);

  /* tilt group wraps the model so spin (child) and tilt (parent) don't fight */
  const tilt = new THREE.Group();
  scene.add(tilt);
  let slime = null;

  const loader = new GLTFLoader();
  loader.load(
    "img/rimuru_slime.glb",
    (gltf) => {
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const center = new THREE.Vector3();
      box.getCenter(center);
      root.position.sub(center); /* center model on the pedestal origin */

      tilt.add(root);
      slime = root;

      /* Reveal the 3D canvas and hide the fallback poster. */
      MOUNT.classList.remove("slime-fallback");
      CANVAS.style.opacity = "1";
      render();
    },
    undefined,
    (err) => {
      /* Load failed → keep .slime-fallback, poster stays visible. */
      console.error("[slime-viewer] GLTF load failed:", err);
    },
  );

  function render() {
    renderer.render(scene, camera);
  }

  /* ─── Resize ─── */
  window.addEventListener("resize", () => {
    const w = MOUNT.clientWidth;
    const h = MOUNT.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  });

  /* ─── Reduced motion: single static frame, no spin, no tilt ─── */
  if (reduceMotion) {
    render();
    return;
  }

  /* ─── Mouse tilt (fine pointer, rAF throttled, subtle ±0.15 rad) ─── */
  if (finePointer) {
    let ticking = false;
    let targetX = 0;
    let targetY = 0;

    MOUNT.addEventListener("mousemove", (e) => {
      const r = MOUNT.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 0.3; /* ±0.15 rad */
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 0.3; /* ±0.15 rad */
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          tilt.rotation.y = targetX;
          tilt.rotation.x = -targetY;
          ticking = false;
        });
      }
    });

    MOUNT.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          tilt.rotation.y = 0;
          tilt.rotation.x = 0;
          ticking = false;
        });
      }
    });
  }

  /* ─── Auto spin ─── */
  function animate() {
    if (slime) slime.rotation.y += 0.005;
    render();
    requestAnimationFrame(animate);
  }
  animate();
}
