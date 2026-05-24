/* ═══════════════════════════════════════════════════════════════
   MENTORI · main.js
   Lenis smooth scroll + GSAP ScrollTrigger + magnetic + tilt + counters
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // helper: разрешаем reveal-стили только когда JS работает.
  // Это гарантирует, что текст ВИДЕН даже если что-то упадёт в скриптах.
  document.body.classList.add("js-ready");

  /* ─── 1. LENIS SMOOTH SCROLL ─────────────────────────────── */
  let lenis;
  if (!prefersReducedMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -60, duration: 1.6 });
          }
        }
      });
    });
  }

  /* ─── 2. NAV SCROLL STATE ─────────────────────────────── */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ─── 3. INTERSECTION REVEAL ─────────────────────────── */
  const revealEls = document.querySelectorAll("[data-reveal], .timeline, .case");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // лёгкий stagger для соседей в общем родителе
          if (el.parentElement) {
            const siblings = el.parentElement.querySelectorAll(":scope > [data-reveal]");
            if (siblings.length > 1) {
              const idx = Array.from(siblings).indexOf(el);
              if (idx > -1) el.style.transitionDelay = `${idx * 70}ms`;
            }
          }
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  // safety net: если по любой причине IO не сработал за 2 секунды —
  // принудительно показываем все элементы
  setTimeout(() => {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }, 2000);

  /* ─── 5. NUMBER COUNTERS ─────────────────────────────── */
  const counters = document.querySelectorAll("[data-counter]");
  const formatNumber = (n, isDecimal) => {
    if (isDecimal) return n.toFixed(1).replace(".", ",");
    return Math.round(n).toLocaleString("ru-RU");
  };
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const isDecimal = !Number.isInteger(target);
    const duration = 1800;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const current = target * easeOut(t);
      el.textContent = formatNumber(current, isDecimal) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => counterIO.observe(c));

  /* ─── 6. MAGNETIC BUTTONS ────────────────────────────── */
  if (!prefersReducedMotion) {
    const magnets = document.querySelectorAll("[data-magnetic]");
    magnets.forEach((m) => {
      const strength = 0.32;
      const rect = () => m.getBoundingClientRect();
      m.addEventListener("mousemove", (e) => {
        const r = rect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        m.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      m.addEventListener("mouseleave", () => {
        m.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ─── 7. 3D TILT (cards + dashboard) ─────────────────── */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const tiltEls = document.querySelectorAll("[data-tilt]");
    tiltEls.forEach((el) => {
      const max = el.classList.contains("hero__dashboard") ? 6 : 5;
      const child = el.firstElementChild || el;
      let raf = null;
      const update = (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          child.style.transform = `perspective(2400px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`;
        });
      };
      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        child.style.transform = "perspective(2400px) rotateX(0) rotateY(0)";
      };
      el.addEventListener("mousemove", update);
      el.addEventListener("mouseleave", reset);
    });
  }

  /* ─── 8. HERO DASHBOARD INITIAL TILT ──────────────────── */
  const dashWrap = document.querySelector(".hero__dashboard");
  if (dashWrap && !prefersReducedMotion) {
    const dash = dashWrap.querySelector(".dash");
    // приветственный наклон
    dash.style.transform = "perspective(2400px) rotateX(8deg) rotateY(-14deg)";
    requestAnimationFrame(() => {
      dash.style.transition = "transform 1.8s var(--ease-expo)";
      setTimeout(() => {
        dash.style.transform = "perspective(2400px) rotateX(3deg) rotateY(-6deg)";
      }, 200);
    });
    // на hover — выпрямляется
    dashWrap.addEventListener("mouseenter", () => {
      dash.style.transition = "transform 0.8s var(--ease-expo)";
    });
    dashWrap.addEventListener("mouseleave", () => {
      dash.style.transition = "transform 1.6s var(--ease-expo)";
      dash.style.transform = "perspective(2400px) rotateX(3deg) rotateY(-6deg)";
    });
  }

  /* ─── 9. TYPEWRITER ───────────────────────────────────── */
  const tw = document.querySelector("[data-typewriter]");
  if (tw) {
    const phrases = [
      "Уточняю бюджет на проект…",
      "Согласую время встречи на четверг…",
      "Передаю Артёма в отдел продаж…",
      "Проверяю свободные слоты в календаре…",
      "Формирую коммерческое предложение…",
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const tick = () => {
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        tw.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          setTimeout(tick, 2400);
          return;
        }
      } else {
        charIdx--;
        tw.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 24 : 52 + Math.random() * 40);
    };
    setTimeout(tick, 1200);
  }

  /* ─── 10. CURSOR GLOW ─────────────────────────────────── */
  const glow = document.querySelector(".cursor-glow");
  if (glow && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let curX = targetX;
    let curY = targetY;

    document.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const animate = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      glow.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* ─── 11. PARALLAX HERO BG ────────────────────────────── */
  if (!prefersReducedMotion) {
    const heroMeshes = document.querySelectorAll(".hero__mesh");
    const heroDash = document.querySelector(".hero__dashboard");
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y > window.innerHeight) return;
        heroMeshes.forEach((m, i) => {
          const speed = i === 0 ? 0.25 : 0.4;
          m.style.transform = `translateY(${y * speed}px)`;
        });
        if (heroDash) {
          heroDash.style.transform = `translateY(${y * 0.15}px)`;
        }
      },
      { passive: true }
    );
  }

  /* ─── 12. VANTA.NET WebGL HERO BACKGROUND ─────────────── */
  if (!prefersReducedMotion && window.VANTA && window.VANTA.NET) {
    const webglEl = document.getElementById("heroWebgl");
    if (webglEl) {
      try {
        window.__vantaNet = VANTA.NET({
          el: webglEl,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xff5e1a,
          backgroundColor: 0x0a0a0a,
          points: 11.0,
          maxDistance: 22.0,
          spacing: 17.0,
          showDots: false,
        });
      } catch (e) {
        console.warn("Vanta.NET init failed:", e);
      }
    }
  }

  /* ─── 13. STICKY SCROLL-STACK ─────────────────────────── */
  if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const cards = document.querySelectorAll("[data-stack-card]");
    if (cards.length > 1 && window.matchMedia("(min-width: 901px)").matches) {
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top 80%",
            end: "top 20%",
            scrub: 0.5,
          },
        });
      });
    }
  }

  /* ─── 14. CONTACT FORM ─────────────────────────────────── */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      // в продакшене сюда подставить fetch на ваш бэкенд / webhook
      console.log("[Mentori form submit]", data);
      form.style.transition = "opacity 0.5s var(--ease-expo)";
      form.style.opacity = "0";
      setTimeout(() => {
        const fields = form.querySelectorAll(
          ".contact-form__head, .contact-form__field, .contact-form__row, .contact-form__note, button"
        );
        fields.forEach((f) => (f.hidden = true));
        const success = document.getElementById("formSuccess");
        if (success) success.hidden = false;
        form.style.opacity = "1";
      }, 400);
    });
  }

  /* ─── 15. ACCESSIBILITY: focus management ─────────────── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") document.body.classList.add("is-tabbing");
  });
  document.addEventListener("mousedown", () => {
    document.body.classList.remove("is-tabbing");
  });
})();
