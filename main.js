/* ═══════════════════════════════════════════════════════════════
   MENTORI TECHNOLOGIES · main.js
   Lenis smooth scroll + GSAP ScrollTrigger + magnetic + tilt + counters
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchMobile = window.matchMedia("(max-width: 900px)").matches;

  // helper: разрешаем reveal-стили только когда JS работает.
  // Это гарантирует, что текст ВИДЕН даже если что-то упадёт в скриптах.
  document.body.classList.add("js-ready");

  /* ─── 0. COOKIE CONSENT + VISIT ATTRIBUTION ───────────── */
  const METRIKA_COUNTER_ID = 111247225;
  const COOKIE_CONSENT_KEY = "mentori_cookie_consent_v1";
  const VISIT_ATTRIBUTION_KEY = "mentori_visit_attribution_v1";
  const ATTRIBUTION_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "yclid",
  ];

  const createConsentId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `consent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const readStorageJson = (storage, key) => {
    try {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  };

  const captureVisitAttribution = () => {
    const stored = readStorageJson(window.sessionStorage, VISIT_ATTRIBUTION_KEY) || {};
    const params = new URLSearchParams(window.location.search);

    ATTRIBUTION_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) stored[key] = value.slice(0, 500);
    });

    if (!stored.landing_page) stored.landing_page = window.location.href.slice(0, 1000);
    if (!stored.referrer && document.referrer) stored.referrer = document.referrer.slice(0, 1000);

    try {
      window.sessionStorage.setItem(VISIT_ATTRIBUTION_KEY, JSON.stringify(stored));
    } catch (error) {}

    window.__mentoriVisitAttribution = stored;
  };

  const loadMetrika = () => {
    if (window.__mentoriMetrikaLoaded) return;
    window.__mentoriMetrikaLoaded = true;
    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_COUNTER_ID}`;
    document.head.appendChild(script);

    window.ym(METRIKA_COUNTER_ID, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      referrer: document.referrer,
      url: window.location.href,
      accurateTrackBounce: true,
      trackLinks: true,
    });
  };

  const setupCookieConsent = () => {
    const stored = readStorageJson(window.localStorage, COOKIE_CONSENT_KEY);
    if (stored?.accepted && stored.id && stored.acceptedAt) {
      window.__mentoriCookieConsent = stored;
      loadMetrika();
      return;
    }

    const banner = document.createElement("aside");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Использование cookie");
    banner.innerHTML = `
      <div class="cookie-banner__body">
        <p>Используем cookie и Яндекс.Метрику, чтобы улучшать сайт. <a href="privacy.html" data-cookie-policy-link>Политика</a></p>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" data-cookie-accept>Хорошо</button>
      </div>
    `;
    document.body.appendChild(banner);

    requestAnimationFrame(() => banner.classList.add("is-visible"));
    const shownAt = Date.now();
    let accepted = false;

    const cleanup = () => {
      document.removeEventListener("pointerdown", onInteraction, true);
      document.removeEventListener("keydown", onKeyInteraction, true);
      window.removeEventListener("scroll", onScroll);
    };

    const accept = (method) => {
      if (accepted) return;
      accepted = true;
      const consent = {
        accepted: true,
        id: createConsentId(),
        acceptedAt: new Date().toISOString(),
        method,
      };

      try {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
      } catch (error) {}

      window.__mentoriCookieConsent = consent;
      cleanup();
      loadMetrika();
      banner.classList.remove("is-visible");
      window.setTimeout(() => banner.remove(), 420);
    };

    const isPolicyLink = (target) => target.closest?.("[data-cookie-policy-link]");
    function onInteraction(event) {
      if (isPolicyLink(event.target)) return;
      accept(event.target.closest?.("[data-cookie-accept]") ? "button" : "interaction");
    }
    function onKeyInteraction(event) {
      if (!['Enter', ' '].includes(event.key) || isPolicyLink(event.target)) return;
      accept(event.target.closest?.("[data-cookie-accept]") ? "button" : "interaction");
    }
    function onScroll() {
      if (Date.now() - shownAt >= 5000) accept("scroll_after_5s");
    }

    document.addEventListener("pointerdown", onInteraction, true);
    document.addEventListener("keydown", onKeyInteraction, true);
    window.addEventListener("scroll", onScroll, { passive: true });
  };

  captureVisitAttribution();
  setupCookieConsent();

  /* ─── 0.5. YANDEX METRIKA GOALS ───────────────────────── */
  const articlePathPattern = /\/blog-[^/]+\.html$/;
  const currentPath = window.location.pathname;
  const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const reachGoal = (goal, params = {}) => {
    if (typeof window.ym !== "function") return;
    window.ym(METRIKA_COUNTER_ID, "reachGoal", goal, {
      page: currentPath || "/",
      ...params,
    });
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const linkText = cleanText(link.textContent || link.getAttribute("aria-label"));
    const commonParams = { link_text: linkText, target: href.slice(0, 240) };

    if (/^https?:\/\/t\.me\//i.test(href)) {
      reachGoal("click_telegram", commonParams);
    } else if (/^tel:/i.test(href)) {
      reachGoal("click_phone", commonParams);
    } else if (/^mailto:/i.test(href)) {
      reachGoal("click_email", commonParams);
    }

    if (/^blog-[^?#]+\.html(?:[?#].*)?$/i.test(href)) {
      reachGoal("blog_article_open", {
        ...commonParams,
        article: href.split(/[?#]/)[0],
      });
    }

    if (link.matches(".connected-service")) {
      reachGoal("service_click", {
        ...commonParams,
        service: cleanText(link.querySelector("h3, h2")?.textContent || linkText),
      });
    }

    if (/^contact\.html(?:[?#].*)?$/i.test(href) && link.matches(".btn, .nav__cta, .connected-service")) {
      reachGoal("cta_contact", commonParams);
    }

    if (articlePathPattern.test(currentPath) && link.closest(".article-cta")) {
      reachGoal("article_cta", {
        ...commonParams,
        article: currentPath.split("/").pop() || currentPath,
      });
    }
  });

  if (articlePathPattern.test(currentPath)) {
    const reachedDepth = new Set();
    const trackArticleDepth = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

      [50, 90].forEach((threshold) => {
        if (depth < threshold || reachedDepth.has(threshold)) return;
        reachedDepth.add(threshold);
        reachGoal(`article_read_${threshold}`, {
          article: currentPath.split("/").pop() || currentPath,
          depth: threshold,
        });
      });
    };

    window.addEventListener("scroll", trackArticleDepth, { passive: true });
    trackArticleDepth();
  }

  /* ─── DESKTOP CRM BOOT INTRO ────────────────────────────── */
  const mobileBoot = document.getElementById("mobileBoot");
  if (mobileBoot && !prefersReducedMotion) {
    document.body.classList.add("mobile-booting");
    setTimeout(() => {
      mobileBoot.classList.add("is-done");
    }, 1700);
    setTimeout(() => {
      document.body.classList.remove("mobile-booting");
      mobileBoot.remove();
    }, 2400);
  } else if (mobileBoot) {
    mobileBoot.remove();
  }

  /* ─── 1. LENIS SMOOTH SCROLL ─────────────────────────────── */
  let lenis;
  if (!prefersReducedMotion && !isTouchMobile && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
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

  /* ─── 2a. MOBILE MENU ───────────────────────────────── */
  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    const closeMenu = () => {
      burger.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      mobileMenu.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (lenis) lenis.start();
    };
    const toggleMenu = () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      burger.classList.toggle("is-open", isOpen);
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
      if (lenis) (isOpen ? lenis.stop() : lenis.start());
    };
    burger.addEventListener("click", toggleMenu);
    // закрытие при клике по любой ссылке
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });
    // закрытие по Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu();
      }
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
  // На мобиле также включаем reveal для cinema-сцен (на десктопе они управляются pin-логикой)
  const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
  const revealSelector = isMobileViewport
    ? "[data-reveal], .timeline, .case, .cinema__scene"
    : "[data-reveal], .timeline, .case";
  const revealEls = document.querySelectorAll(revealSelector);
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // лёгкий stagger для соседей в общем родителе
            if (el.parentElement) {
              const siblings = Array.from(el.parentElement.children).filter((child) =>
                child.hasAttribute("data-reveal")
              );
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
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

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
  if ("IntersectionObserver" in window) {
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
  } else {
    counters.forEach(animateCounter);
  }

  /* ─── 6. MAGNETIC BUTTONS ────────────────────────────── */
  if (!prefersReducedMotion && !isTouchMobile) {
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
  if (!prefersReducedMotion) {
    const tiltEls = document.querySelectorAll("[data-tilt]");
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (isFinePointer) {
      // ДЕСКТОП: tilt по mouse position
      tiltEls.forEach((el) => {
        const max = el.classList.contains("hero__dashboard") ? 6 : 5;
        const child = el.firstElementChild || el;
        const baseX = Number.parseFloat(el.dataset.tiltBaseX || "0") || 0;
        const baseY = Number.parseFloat(el.dataset.tiltBaseY || "0") || 0;
        let raf = null;
        const update = (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            child.style.transform = `perspective(2400px) rotateX(${baseX - y * max}deg) rotateY(${baseY + x * max}deg) translateZ(0)`;
          });
        };
        const reset = () => {
          if (raf) cancelAnimationFrame(raf);
          child.style.transform = `perspective(2400px) rotateX(${baseX}deg) rotateY(${baseY}deg) translateZ(0)`;
        };
        el.addEventListener("mousemove", update);
        el.addEventListener("mouseleave", reset);
      });
    } else if (tiltEls.length) {
      // МОБАЙЛ: лёгкий 3D tilt по гироскопу + auto-float только для видимых карточек
      const floatTargets = Array.from(tiltEls).filter(
        (el) => !el.classList.contains("hero__dashboard")
      );
      // Отслеживаем, какие элементы реально в viewport, чтобы не крутить rAF впустую
      const visibleSet = new Set();
      if ("IntersectionObserver" in window) {
        const visIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) visibleSet.add(e.target);
              else visibleSet.delete(e.target);
            });
          },
          { threshold: 0.2 }
        );
        floatTargets.forEach((el) => visIO.observe(el));
      } else {
        floatTargets.forEach((el) => visibleSet.add(el));
      }

      const startedAt = performance.now();
      const tick = (t) => {
        const elapsed = t - startedAt;
        floatTargets.forEach((el, i) => {
          if (!visibleSet.has(el)) return;
          const child = el.firstElementChild || el;
          const baseX = Number.parseFloat(el.dataset.tiltBaseX || "0") || 0;
          const baseY = Number.parseFloat(el.dataset.tiltBaseY || "0") || 0;
          const phase = ((elapsed + i * 600) % 7000) / 7000;
          const rx = Math.sin(phase * Math.PI * 2) * 1.4;
          const ry = Math.cos(phase * Math.PI * 2) * 1.8;
          child.style.transform = `perspective(2400px) rotateX(${baseX + rx}deg) rotateY(${baseY + ry}deg)`;
        });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      // гироскоп (если разрешён)
      const handleOrient = (e) => {
        if (e.beta == null || e.gamma == null) return;
        const x = Math.max(-15, Math.min(15, e.gamma)) / 5;
        const y = Math.max(-15, Math.min(15, e.beta - 45)) / 5;
        tiltEls.forEach((el) => {
          const child = el.firstElementChild || el;
          const baseX = Number.parseFloat(el.dataset.tiltBaseX || "0") || 0;
          const baseY = Number.parseFloat(el.dataset.tiltBaseY || "0") || 0;
          child.style.transform = `perspective(2400px) rotateX(${baseX - y}deg) rotateY(${baseY + x}deg)`;
        });
      };
      if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          // iOS 13+ требует user-gesture для разрешения
          document.addEventListener("touchend", function once() {
            DeviceOrientationEvent.requestPermission()
              .then((p) => {
                if (p === "granted")
                  window.addEventListener("deviceorientation", handleOrient);
              })
              .catch(() => {});
            document.removeEventListener("touchend", once);
          }, { once: true });
        } else {
          window.addEventListener("deviceorientation", handleOrient);
        }
      }
    }
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

  /* ─── 8.4. PRICING DECK · колода-степпер 01→02→03 ───── */
  const pkgStage = document.querySelector("[data-pkg-stage]");
  if (pkgStage) {
    const steps = Array.from(pkgStage.querySelectorAll(".pkg__step"));
    const dots = Array.from(pkgStage.querySelectorAll(".pkg__dot"));
    const lines = Array.from(pkgStage.querySelectorAll(".pkg__dot-line"));
    const prevBtn = pkgStage.querySelector("[data-pkg-prev]");
    const nextBtn = pkgStage.querySelector("[data-pkg-next]");
    let cur = 0;

    const render = () => {
      steps.forEach((s, i) => {
        s.classList.toggle("is-active", i === cur);
        s.classList.toggle("is-done", i < cur);
        s.setAttribute("aria-hidden", i === cur ? "false" : "true");
      });
      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === cur);
        d.classList.toggle("is-done", i < cur);
        d.setAttribute("aria-selected", i === cur ? "true" : "false");
        d.setAttribute("tabindex", i === cur ? "0" : "-1");
      });
      lines.forEach((l, i) => {
        // линия после dot i считается пройденной, если cur > i
        l.classList.toggle("is-done", cur > i);
      });
      if (prevBtn) prevBtn.disabled = cur === 0;
      if (nextBtn) nextBtn.disabled = cur === steps.length - 1;
    };

    const goTo = (i) => {
      const next = Math.max(0, Math.min(steps.length - 1, i));
      if (next === cur) return;
      cur = next;
      render();
    };

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(cur - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(cur + 1));
    dots.forEach((d) => {
      const target = parseInt(d.getAttribute("data-pkg-go"), 10);
      d.addEventListener("click", () => goTo(target));
    });

    // клик по заблюренной карточке — открывает её
    steps.forEach((s, i) => {
      s.addEventListener("click", (e) => {
        if (i === cur) return; // активная — не перехватываем (CTA внутри неё работает)
        // если клик пришёл по интерактиву внутри (на всякий случай) — пропускаем
        const t = e.target.closest("a, button");
        if (t && t !== s) return;
        goTo(i);
      });
    });

    // клавиатура — только когда колода в области видимости
    const stageInView = () => {
      const r = pkgStage.getBoundingClientRect();
      return r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
    };
    window.addEventListener("keydown", (e) => {
      if (!stageInView()) return;
      // не перехватываем стрелки, если фокус в инпуте/textarea
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (cur < steps.length - 1) { e.preventDefault(); goTo(cur + 1); }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (cur > 0) { e.preventDefault(); goTo(cur - 1); }
      }
    });

    // свайп на тач-устройствах
    let touchStartX = 0;
    pkgStage.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    pkgStage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 60) return;
      if (dx < 0) goTo(cur + 1);
      else goTo(cur - 1);
    }, { passive: true });

    render();
  }

  /* ─── 8.5. HERO HEADLINE ROTATOR ──────────────────────── */
  const heroRotator = document.querySelector(".hero__rotator");
  if (heroRotator) {
    const lines = Array.from(heroRotator.querySelectorAll(".hero__line"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lines.length > 1 && !reduceMotion) {
      let idx = 0;
      const ROTATE_MS = 5200;
      setInterval(() => {
        lines[idx].classList.remove("is-active");
        idx = (idx + 1) % lines.length;
        lines[idx].classList.add("is-active");
      }, ROTATE_MS);
    }
  }

  /* ─── 9. TYPEWRITER ───────────────────────────────────── */
  const tw = document.querySelector("[data-typewriter]");
  if (tw) {
    const phrases = [
      "Уточняю бюджет на проект…",
      "Согласую время встречи на четверг…",
      "Передаю Артёма ответственному менеджеру…",
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

  /* ─── 11.5. THEME — текущая тема из атрибута data-theme ── */
  const isLightTheme = () =>
    document.documentElement.getAttribute("data-theme") === "light";

  // перекраска Vanta-фона под тему (вызывается при инициализации и при toggle)
  const skinVanta = () => {
    if (!window.__vantaNet) return;
    const light = isLightTheme();
    try {
      window.__vantaNet.setOptions({
        color: light ? 0xea4f10 : 0xff5e1a,
        backgroundColor: light ? 0xfafaf7 : 0x0a0a0a,
      });
    } catch (e) {}
  };
  window.__skinVanta = skinVanta;

  /* ─── 12. VANTA.NET WebGL HERO BACKGROUND ─────────────── */
  if (!prefersReducedMotion && !isTouchMobile && window.VANTA && window.VANTA.NET) {
    const webglEl = document.getElementById("heroWebgl");
    if (webglEl) {
      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      const light = isLightTheme();
      try {
        window.__vantaNet = VANTA.NET({
          el: webglEl,
          mouseControls: !isMobile,
          touchControls: true,
          gyroControls: isMobile, // на мобиле — реагируем на наклон устройства
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 0.7, // на мобиле — пореже сетка, чтобы не тормозить
          color: light ? 0xea4f10 : 0xff5e1a,
          backgroundColor: light ? 0xfafaf7 : 0x0a0a0a,
          points: isMobile ? 7.0 : 11.0,
          maxDistance: isMobile ? 18.0 : 22.0,
          spacing: isMobile ? 20.0 : 17.0,
          showDots: false,
        });
      } catch (e) {
        console.warn("Vanta.NET init failed:", e);
      }
    }
  }

  /* ─── 12.5. THEME TOGGLE — ручной переключатель + системная тема ── */
  (function () {
    const root = document.documentElement;
    const toggle = document.getElementById("themeToggle");
    const metaDark = document.querySelector('meta[name="theme-color"][media*="dark"]');

    const setTheme = (theme, persist) => {
      root.setAttribute("data-theme", theme);
      if (persist) {
        try { localStorage.setItem("mentra-theme", theme); } catch (e) {}
      }
      skinVanta();
    };

    if (toggle) {
      toggle.addEventListener("click", () => {
        setTheme(isLightTheme() ? "dark" : "light", true);
      });
    }

    // если пользователь НЕ выбирал тему вручную — следуем за системной
    const sysMQ = window.matchMedia("(prefers-color-scheme: light)");
    const onSysChange = () => {
      let saved = null;
      try { saved = localStorage.getItem("mentra-theme"); } catch (e) {}
      if (!saved) setTheme(sysMQ.matches ? "light" : "dark", false);
    };
    if (sysMQ.addEventListener) sysMQ.addEventListener("change", onSysChange);
    else if (sysMQ.addListener) sysMQ.addListener(onSysChange);
  })();

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

  /* ─── 13b. MOBILE 3D CAROUSEL ─────────────────────────── */
  const mobileStack = document.querySelector("[data-stack]");
  const mobileStackCards = mobileStack
    ? Array.from(mobileStack.querySelectorAll("[data-stack-card]"))
    : [];

  if (mobileStack && mobileStackCards.length > 1 && isTouchMobile) {
    const controls = mobileStack.querySelector("[data-stack-controls]");
    const prevButton = mobileStack.querySelector("[data-stack-prev]");
    const nextButton = mobileStack.querySelector("[data-stack-next]");
    const counter = mobileStack.querySelector("[data-stack-counter]");
    const dotsRoot = mobileStack.querySelector("[data-stack-dots]");
    const cardCount = mobileStackCards.length;
    let activeCard = 0;
    let autoTimer = 0;
    let carouselVisible = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let resizeTimer = 0;

    mobileStack.classList.add("is-carousel");
    mobileStack.setAttribute("role", "region");
    mobileStack.setAttribute("aria-roledescription", "карусель");
    mobileStack.setAttribute("tabindex", "0");

    const dots = mobileStackCards.map((card, index) => {
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "слайд");
      card.setAttribute("aria-label", `${index + 1} из ${cardCount}`);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "stack-carousel__dot";
      dot.setAttribute("aria-label", `Открыть карточку ${index + 1}`);
      dot.addEventListener("click", () => setActiveCard(index, true));
      dotsRoot?.appendChild(dot);
      return dot;
    });

    const measureCards = () => {
      mobileStack.style.removeProperty("--stack-carousel-card-height");
      requestAnimationFrame(() => {
        const tallestCard = Math.max(...mobileStackCards.map((card) => card.scrollHeight));
        mobileStack.style.setProperty("--stack-carousel-card-height", `${tallestCard}px`);
      });
    };

    const stopAutoplay = () => {
      window.clearTimeout(autoTimer);
      autoTimer = 0;
    };

    const scheduleAutoplay = () => {
      stopAutoplay();
      if (prefersReducedMotion || !carouselVisible || document.hidden) return;
      autoTimer = window.setTimeout(() => {
        setActiveCard(activeCard + 1, false);
      }, 4800);
    };

    const renderCards = () => {
      mobileStackCards.forEach((card, index) => {
        const relativeIndex = (index - activeCard + cardCount) % cardCount;
        const isActive = relativeIndex === 0;
        const isNext = relativeIndex === 1;
        const isPrev = relativeIndex === cardCount - 1;

        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-next", isNext);
        card.classList.toggle("is-prev", isPrev);
        card.classList.toggle("is-far", !isActive && !isNext && !isPrev);
        card.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeCard;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });

      if (counter) {
        counter.textContent = `${String(activeCard + 1).padStart(2, "0")} / ${String(cardCount).padStart(2, "0")}`;
      }
    };

    function setActiveCard(nextIndex, userInitiated = false) {
      activeCard = (nextIndex + cardCount) % cardCount;
      renderCards();
      if (userInitiated) stopAutoplay();
      scheduleAutoplay();
    }

    prevButton?.addEventListener("click", () => setActiveCard(activeCard - 1, true));
    nextButton?.addEventListener("click", () => setActiveCard(activeCard + 1, true));

    mobileStack.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      stopAutoplay();
    });

    mobileStack.addEventListener("pointerup", (event) => {
      if (!pointerStartX && !pointerStartY) return;
      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;
      pointerStartX = 0;
      pointerStartY = 0;

      if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
        setActiveCard(activeCard + (deltaX < 0 ? 1 : -1), true);
      } else {
        scheduleAutoplay();
      }
    });

    mobileStack.addEventListener("pointercancel", () => {
      pointerStartX = 0;
      pointerStartY = 0;
      scheduleAutoplay();
    });

    mobileStack.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveCard(activeCard - 1, true);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveCard(activeCard + 1, true);
      }
    });

    controls?.addEventListener("focusin", stopAutoplay);
    controls?.addEventListener("focusout", scheduleAutoplay);

    const carouselObserver = new IntersectionObserver(
      ([entry]) => {
        carouselVisible = entry.isIntersecting && entry.intersectionRatio > 0.25;
        scheduleAutoplay();
      },
      { threshold: [0, 0.25, 0.6] }
    );
    carouselObserver.observe(mobileStack);

    document.addEventListener("visibilitychange", scheduleAutoplay);
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureCards, 180);
    });

    renderCards();
    measureCards();
    if (document.fonts?.ready) document.fonts.ready.then(measureCards);
  }

  /* ─── 13c. MOBILE SERVICES CAROUSEL ───────────────────── */
  const servicesCarousel = document.querySelector("[data-services-carousel]");
  const servicesTrack = servicesCarousel?.querySelector("[data-services-track]");
  const serviceCards = servicesTrack
    ? Array.from(servicesTrack.querySelectorAll(".srv"))
    : [];

  if (servicesCarousel && servicesTrack && serviceCards.length > 1 && isTouchMobile) {
    const prevService = servicesCarousel.querySelector("[data-services-prev]");
    const nextService = servicesCarousel.querySelector("[data-services-next]");
    const serviceCounter = servicesCarousel.querySelector("[data-services-counter]");
    const serviceDotsRoot = servicesCarousel.querySelector("[data-services-dots]");
    const totalServices = serviceCards.length;
    let activeService = 0;
    let serviceScrollRaf = 0;

    servicesCarousel.setAttribute("role", "region");
    servicesCarousel.setAttribute("aria-roledescription", "карусель");
    servicesTrack.setAttribute("tabindex", "0");

    const serviceDots = serviceCards.map((card, index) => {
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "слайд");
      card.setAttribute("aria-label", `${index + 1} из ${totalServices}`);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "srv-carousel__dot";
      dot.setAttribute("aria-label", `Открыть карточку ${index + 1}`);
      dot.addEventListener("click", () => goToService(index));
      serviceDotsRoot?.appendChild(dot);
      return dot;
    });

    const renderServiceProgress = (index) => {
      activeService = index;
      serviceDots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeService;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
      if (serviceCounter) {
        serviceCounter.textContent = `${String(activeService + 1).padStart(2, "0")} / ${String(totalServices).padStart(2, "0")}`;
      }
    };

    const goToService = (index) => {
      const nextIndex = (index + totalServices) % totalServices;
      const card = serviceCards[nextIndex];
      const left = card.offsetLeft - (servicesTrack.clientWidth - card.clientWidth) / 2;
      servicesTrack.scrollTo({ left, behavior: prefersReducedMotion ? "auto" : "smooth" });
      renderServiceProgress(nextIndex);
    };

    const updateServiceFromScroll = () => {
      window.cancelAnimationFrame(serviceScrollRaf);
      serviceScrollRaf = window.requestAnimationFrame(() => {
        const trackCenter = servicesTrack.scrollLeft + servicesTrack.clientWidth / 2;
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        serviceCards.forEach((card, index) => {
          const cardCenter = card.offsetLeft + card.clientWidth / 2;
          const distance = Math.abs(trackCenter - cardCenter);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        if (nearestIndex !== activeService) renderServiceProgress(nearestIndex);
      });
    };

    prevService?.addEventListener("click", () => goToService(activeService - 1));
    nextService?.addEventListener("click", () => goToService(activeService + 1));
    servicesTrack.addEventListener("scroll", updateServiceFromScroll, { passive: true });
    servicesTrack.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToService(activeService - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToService(activeService + 1);
      }
    });

    renderServiceProgress(0);
  }

  /* ─── 14. CONTACT FORM ─────────────────────────────────── */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const personalConsent = form.querySelector("#personalDataConsent");
      if (!personalConsent?.checked) {
        personalConsent?.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const cookieConsent = window.__mentoriCookieConsent || {};
      const attribution = window.__mentoriVisitAttribution || {};
      const personalConsentAt = new Date().toISOString();

      formData.set("personal_data_consent", "yes");
      formData.set("personal_data_consent_at", personalConsentAt);
      formData.set("cookie_consent_id", cookieConsent.id || "not_recorded");
      formData.set("cookie_consent_at", cookieConsent.acceptedAt || "not_recorded");
      formData.set("cookie_consent_method", cookieConsent.method || "not_recorded");
      formData.set("form_page", window.location.href);
      ATTRIBUTION_KEYS.forEach((key) => {
        if (attribution[key]) formData.set(key, attribution[key]);
      });
      if (attribution.landing_page) formData.set("landing_page", attribution.landing_page);
      if (attribution.referrer) formData.set("referrer", attribution.referrer);

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Form submission failed");
      } catch (error) {
        if (submitButton) submitButton.disabled = false;
        alert("Не удалось отправить заявку. Напишите нам на mentraos@mail.ru или позвоните по номеру +7 911 437-85-85.");
        return;
      }

      reachGoal("form_submit_success", {
        form: form.id || "contactForm",
      });

      form.style.transition = "opacity 0.5s var(--ease-expo)";
      form.style.opacity = "0";
      setTimeout(() => {
        const fields = form.querySelectorAll(
          ".contact-form__head, .contact-form__field, .contact-form__row, .contact-form__note, .contact-form__consent, button"
        );
        fields.forEach((f) => (f.hidden = true));
        const success = document.getElementById("formSuccess");
        if (success) success.hidden = false;
        form.style.opacity = "1";
      }, 400);
    });
  }

  /* ─── 15. CINEMA · pinned scenes ────────────────────── */
  const cinema = document.querySelector(".cinema");
  // На мобиле (≤960px) cinema показывается как обычный stack — pin-эффект не нужен,
  // scroll-handler тоже отключаем, чтобы не было лишней работы.
  if (cinema && !prefersReducedMotion && window.matchMedia("(min-width: 961px)").matches) {
    const scenes = cinema.querySelectorAll(".cinema__scene");
    const total = scenes.length;
    const fill = document.getElementById("cinemaFill");
    const currentLabel = document.getElementById("cinemaCurrent");
    const marks = cinema.querySelectorAll(".cinema__rail-marks span");
    let activeIdx = 0;

    const clamp01 = (n) => Math.min(1, Math.max(0, n));
    const onCinemaScroll = () => {
      const rect = cinema.getBoundingClientRect();
      const total_scroll = cinema.offsetHeight - window.innerHeight;
      if (total_scroll <= 0) return;
      const progress = clamp01(-rect.top / total_scroll);

      // fill bar
      if (fill) fill.style.transform = `scaleY(${progress})`;

      // активная сцена
      // мы делим прогресс на N сегментов, активна — текущий сегмент
      const idx = Math.min(Math.floor(progress * total * 0.9999), total - 1);
      if (idx !== activeIdx) {
        activeIdx = idx;
        scenes.forEach((s, i) => s.classList.toggle("is-active", i === idx));
        if (currentLabel)
          currentLabel.textContent = String(idx + 1).padStart(2, "0");
        marks.forEach((m, i) => m.classList.toggle("is-current", i === idx));
      }
    };

    onCinemaScroll();
    window.addEventListener("scroll", onCinemaScroll, { passive: true });
  }

  /* ─── 16. CASE MODAL ───────────────────────────────────── */
  const openCaseModal = (trigger) => {
    const id = "case-" + trigger.dataset.caseTrigger;
    const modal = document.getElementById(id);
    if (modal && typeof modal.showModal === "function") {
      modal.showModal();
      document.body.style.overflow = "hidden";
      // НЕ останавливаем Lenis — он сам игнорирует элементы с data-lenis-prevent.
      // Внутренний scroll модалки работает через нативный браузерный wheel.
      requestAnimationFrame(() => {
        const closeBtn = modal.querySelector("[data-modal-close]");
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      });
    }
  };
  document.querySelectorAll("[data-case-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      if (e.target.closest("a, button:not([data-case-trigger])")) return;
      openCaseModal(trigger);
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCaseModal(trigger);
      }
    });
  });
  document.querySelectorAll(".case-modal").forEach((modal) => {
    const close = () => {
      modal.close();
      document.body.style.overflow = "";
    };
    modal.querySelectorAll("[data-modal-close]").forEach((btn) =>
      btn.addEventListener("click", close)
    );
    modal.addEventListener("click", (e) => {
      // клик по backdrop (вне content) — закрыть
      const rect = modal.querySelector(".case-modal__shell")?.getBoundingClientRect();
      if (!rect) return;
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        close();
      }
    });
    modal.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
  });

  /* ─── 17. ACCESSIBILITY: focus management ─────────────── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") document.body.classList.add("is-tabbing");
  });
  document.addEventListener("mousedown", () => {
    document.body.classList.remove("is-tabbing");
  });
})();
