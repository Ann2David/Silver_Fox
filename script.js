/* =====================================================
   ANN DAVID | SILVER FOX
   script.js — merged (your structure + new animations)
   ===================================================== */

/* ─────────────────────────────────────────────────────
   LOADING SCREEN
   Matches your existing: window.addEventListener('load')
   Added: eyebrow typing, scroll line draw, parallax init
───────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    // Your original calls
    animateSection(document.getElementById('home'));
    showScrollIndicator();

    // New: start eyebrow typing after load
    startEyebrowTyping();

    // New: animate scroll line drawing downward
    const shLine = document.querySelector('.sh-line');
    if (shLine) {
      shLine.animate(
        [{ height: '0px', opacity: 0 }, { height: '48px', opacity: 1 }],
        { duration: 1000, delay: 400, fill: 'forwards', easing: 'ease-out' }
      );
    }

    // New: init parallax (needs DOM ready + load)
    initParallax();

  }, 800);
});

/* ─────────────────────────────────────────────────────
   BURGER / MENU  (your IDs: burgerBtn, menuOverlay, menuClose)
   Added: circle reveal clip-path, stagger links + socials in
───────────────────────────────────────────────────── */
const overlay = document.getElementById('menuOverlay');
const burgerBtn = document.getElementById('burgerBtn');

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    burgerBtn.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Stagger menu links in after circle opens (~300ms)
    overlay.querySelectorAll('.menu-link').forEach((link, i) => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(20px)';
      setTimeout(() => {
        link.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      }, 300 + i * 80);
    });

    // Stagger socials
    overlay.querySelectorAll('.menu-socials a, .menu-social').forEach((a, i) => {
      a.style.opacity = '0';
      setTimeout(() => {
        a.style.transition = 'opacity 0.4s ease';
        a.style.opacity = '1';
      }, 600 + i * 60);
    });
  });
}

const menuClose = document.getElementById('menuClose');
if (menuClose) menuClose.addEventListener('click', closeMenu);

// Close on overlay background click
if (overlay) {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeMenu();
  });
}

function closeMenu() {
  overlay.classList.remove('open');
  if (burgerBtn) burgerBtn.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────
   NAVIGATION — scroll to section
   Your original goTo(), works for both menu links and
   sidebar .sidebar-btn[data-section] clicks
───────────────────────────────────────────────────── */
function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  closeMenu();

  // New: re-trigger [data-anim] elements in the target section
  const target = document.getElementById(id);
  if (target) {
    setTimeout(() => {
      target.querySelectorAll('[data-anim]').forEach((el, i) => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), i * 120 + 100);
      });
    }, 500);
  }
}

// Wire up sidebar buttons that use data-section (dot-btn or sidebar-btn)
document.querySelectorAll('[data-section]').forEach(btn => {
  btn.addEventListener('click', () => goTo(btn.dataset.section));
});

/* ─────────────────────────────────────────────────────
   SIDEBAR ACTIVE STATE
   Your original IntersectionObserver pattern — kept intact.
   Supports both .sidebar-btn[data-section] and .dot-btn[data-section]
───────────────────────────────────────────────────── */
const sectionIds = ['home', 'about', 'services', 'projects', 'experience', 'contact'];

const ioActive = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      sectionIds.forEach(id => {
        // Support both your class (.sidebar-btn) and new class (.dot-btn)
        document.querySelectorAll(`[data-section="${id}"]`).forEach(btn => {
          btn.classList.toggle('active', id === e.target.id);
        });
      });
    }
  });
}, { threshold: 0.4 });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) ioActive.observe(el);
});

/* ─────────────────────────────────────────────────────
   SCROLL INDICATOR
   Your original showScrollIndicator() — kept intact.
   Works with both .scroll-hint and #scrollIndicator
───────────────────────────────────────────────────── */
function showScrollIndicator() {
  // Support both ID and class selector
  const ind = document.getElementById('scrollIndicator') || document.querySelector('.scroll-hint');
  if (!ind) return;

  ind.classList.add('visible');

  window.addEventListener('scroll', () => {
    ind.classList.toggle('visible', window.scrollY < 100);
    // Also handle inline opacity for .scroll-hint variant
    if (ind.classList.contains('scroll-hint')) {
      ind.style.opacity = window.scrollY > 80 ? '0' : '1';
      ind.style.transition = 'opacity 0.4s ease';
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────
   SECTION ENTER ANIMATIONS  (your animateSection pattern)
   Your class: .anim-in on .section
   Also adds .visible to all [data-anim] children inside
   (left-slide text + right-slide image — Alvalens effect)
───────────────────────────────────────────────────── */
function animateSection(el) {
  if (!el || el.classList.contains('anim-in')) return;
  el.classList.add('anim-in');

  // New: also trigger [data-anim] children with stagger
  el.querySelectorAll('[data-anim]').forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
    // Small rAF so delay is applied before class
    requestAnimationFrame(() => child.classList.add('visible'));
  });
}

// Your original ioAnim observer — unchanged
const ioAnim = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) animateSection(e.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section').forEach(s => ioAnim.observe(s));

/* ─────────────────────────────────────────────────────
   NAV SCROLL — backdrop blur on scroll
───────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();
}

/* ─────────────────────────────────────────────────────
   EYEBROW TYPING  "ANN DAVID" types in character by character
───────────────────────────────────────────────────── */
function startEyebrowTyping() {
  const eyebrow = document.querySelector('.eyebrow');
  if (!eyebrow) return;

  const text = eyebrow.textContent.trim();
  eyebrow.textContent = '';
  eyebrow.style.borderRight = '2px solid #777';
  eyebrow.style.display = 'inline-block';

  let i = 0;
  const type = () => {
    if (i < text.length) {
      eyebrow.textContent += text[i++];
      setTimeout(type, 80);
    } else {
      setTimeout(() => { eyebrow.style.borderRight = 'none'; }, 800);
    }
  };
  setTimeout(type, 300);
}

/* ─────────────────────────────────────────────────────
   PARALLAX — subtle vertical shift on panel images
───────────────────────────────────────────────────── */
function initParallax() {
  const panels = document.querySelectorAll('.panel-img img');
  if (!panels.length) return;

  const update = () => {
    panels.forEach(img => {
      const wrap = img.closest('.panel-img');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * 0.07;
      img.style.transform = `translateY(${offset}px) scale(1.05)`;
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────────────
   SKILL CATEGORY TABS
───────────────────────────────────────────────────── */
document.querySelectorAll('.sk-cat').forEach(cat => {
  cat.addEventListener('click', () => {
    document.querySelectorAll('.sk-cat').forEach(c => c.classList.remove('active'));
    cat.classList.add('active');
  });
});

/* ─────────────────────────────────────────────────────
   PROJECT FILTER — fade + slide cards in/out
───────────────────────────────────────────────────── */
document.querySelectorAll('.fbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.f;
    document.querySelectorAll('.pc').forEach((card, idx) => {
      const tags = card.dataset.t || '';
      const show = filter === 'all' || tags.includes(filter);

      if (show) {
        card.style.display = '';
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        // Stagger each visible card
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, idx * 60 + 20);
        });
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });
  });
});

/* ─────────────────────────────────────────────────────
   SERVICE ITEMS — stagger slide-in from left
───────────────────────────────────────────────────── */
const svcObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.svc-item').forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-24px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, i * 100);
    });
    svcObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

const svcList = document.querySelector('.svc-list');
if (svcList) svcObserver.observe(svcList);

/* ─────────────────────────────────────────────────────
   TIMELINE — stagger entries in
───────────────────────────────────────────────────── */
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.tl-entry').forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(32px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, i * 200);
    });
    tlObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

const tlEl = document.querySelector('.timeline');
if (tlEl) tlObserver.observe(tlEl);

/* ─────────────────────────────────────────────────────
   DIVIDER LINES — draw scaleX(0 → 1) from left
───────────────────────────────────────────────────── */
const dividerObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('span').forEach((line, i) => {
      line.style.transform = 'scaleX(0)';
      line.style.transformOrigin = 'left';
      line.style.transition = `transform 0.6s ease ${i * 0.15}s`;
      requestAnimationFrame(() => {
        setTimeout(() => { line.style.transform = 'scaleX(1)'; }, 30);
      });
    });
    dividerObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.dividers').forEach(d => dividerObserver.observe(d));

/* ─────────────────────────────────────────────────────
   IMAGE HOVER — scale on mouseenter (grayscale handled by CSS)
───────────────────────────────────────────────────── */
document.querySelectorAll('.panel-img, .pf-big, .pf-sm, .pf-sm2, .pc-img').forEach(wrap => {
  wrap.addEventListener('mouseenter', () => {
    const img = wrap.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1.04)';
      img.style.transition = 'filter 0.5s ease, transform 0.5s ease';
    }
  });
  wrap.addEventListener('mouseleave', () => {
    const img = wrap.querySelector('img');
    if (img) img.style.transform = '';
  });
});

/* ─────────────────────────────────────────────────────
   PROJECT CARD TILT — 3D perspective tilt on mousemove
───────────────────────────────────────────────────── */
document.querySelectorAll('.pc:not(.pc--wip)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
  });
});

/* ─────────────────────────────────────────────────────
   CTA HOVER UNDERLINE
───────────────────────────────────────────────────── */
const ctaBig = document.querySelector('.cta-big');
if (ctaBig && ctaBig.parentElement) {
  ctaBig.parentElement.addEventListener('mouseenter', () => {
    ctaBig.style.textDecoration = 'underline';
    ctaBig.style.textDecorationThickness = '2px';
    ctaBig.style.textUnderlineOffset = '4px';
  });
  ctaBig.parentElement.addEventListener('mouseleave', () => {
    ctaBig.style.textDecoration = 'none';
  });
}