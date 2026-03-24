/* =============================================
   JENNA PORTFOLIO — script.js
   Three.js 3D background + all interactions
============================================= */

// ─── 1. THREE.JS HERO CANVAS ────────────────
(function initThreeJS() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.z = 30;

  // ── Spheres ──
  const spheres = [];
  const sphereData = [
    { r: 2.2, x:  12, y:  8, z: -5,  speed: 0.008, col: 0x2ea8ff },
    { r: 1.4, x: -15, y: -6, z: -8,  speed: 0.012, col: 0x2ea8ff },
    { r: 0.9, x:   8, y: -9, z:  2,  speed: 0.018, col: 0x80cfff },
    { r: 3.0, x: -10, y: 12, z: -15, speed: 0.006, col: 0x1a7fc4 },
    { r: 1.1, x:  18, y: -3, z: -3,  speed: 0.015, col: 0x2ea8ff },
    { r: 0.6, x:  -5, y:  6, z:  5,  speed: 0.022, col: 0x60b8ff },
    { r: 1.8, x:   2, y: -14, z: -6, speed: 0.009, col: 0x1a7fc4 },
    { r: 0.7, x: -18, y:  3,  z:  4, speed: 0.020, col: 0x80cfff },
  ];

  sphereData.forEach(d => {
    const geo = new THREE.SphereGeometry(d.r, 32, 32);
    const mat = new THREE.MeshPhongMaterial({
      color: d.col,
      transparent: true,
      opacity: 0.45,
      shininess: 120,
      specular: new THREE.Color(0x88ddff),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(d.x, d.y, d.z);
    mesh._speed  = d.speed;
    mesh._offset = Math.random() * Math.PI * 2;
    scene.add(mesh);
    spheres.push(mesh);
  });

  // ── Particles ──
  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x2ea8ff,
    size: 0.25,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Lights ──
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  const pointLight1 = new THREE.PointLight(0x2ea8ff, 2, 60);
  pointLight1.position.set(15, 10, 10);
  scene.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0x80cfff, 1, 50);
  pointLight2.position.set(-15, -10, 5);
  scene.add(pointLight2);

  // ── Mouse parallax ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ──
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Animate ──
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.01;

    spheres.forEach(s => {
      s.position.y  += Math.sin(clock + s._offset) * s._speed;
      s.position.x  += Math.cos(clock * 0.7 + s._offset) * s._speed * 0.5;
      s.rotation.y  += s._speed * 0.5;
    });

    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    // Subtle parallax
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();


// ─── 2. NAVBAR ──────────────────────────────
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const links   = document.getElementById('navLinks');
  const navAnchors = document.querySelectorAll('.nav-link');

  // Scroll class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Toggle mobile
  toggle && toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close on link click
  navAnchors.forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
})();


// ─── 3. TYPED TEXT ──────────────────────────
(function initTyped() {
  const el    = document.getElementById('typedText');
  if (!el) return;

  const words  = ['DESIGNER', 'CREATOR', 'DEVELOPER', 'INNOVATOR'];
  let wIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const word = words[wIdx];
    if (!deleting) {
      el.textContent = word.slice(0, ++cIdx);
      if (cIdx === word.length) { deleting = true; return setTimeout(type, 1600); }
    } else {
      el.textContent = word.slice(0, --cIdx);
      if (cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; }
    }
    setTimeout(type, deleting ? 60 : 90);
  }
  type();
})();


// ─── 4. SCROLL FADE-IN ──────────────────────
(function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();


// ─── 5. RIPPLE EFFECT ───────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'ripple-effect';
  const size = Math.max(rect.width, rect.height) * 2;
  r.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
  `;
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});


// ─── 6. SMOOTH SCROLL ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// ─── 7. CONTACT FORM ────────────────────────
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.innerHTML;
    btn.innerHTML = '✓ Message Sent!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.innerHTML = origText;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
})();


// ─── 8. COUNTER ANIMATION ───────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.textContent);
      const suffix = el.textContent.replace(/[0-9]/g, '');
      let cur = 0;
      const step = Math.ceil(end / 40);
      const tick = () => {
        cur = Math.min(cur + step, end);
        el.textContent = cur + suffix;
        if (cur < end) requestAnimationFrame(tick);
      };
      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


// ─── 9. SLIDER DOTS ─────────────────────────
(function initSlider() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });
})();


// ─── 10. CURSOR GLOW (desktop only) ─────────
(function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(46,168,255,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: left 0.1s ease, top 0.1s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();
