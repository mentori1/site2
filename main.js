/* ═══════════════════════════════════════════════════════════════
   MENTRA · main.js
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
  if (!prefersReducedMotion) {
    const tiltEls = document.querySelectorAll("[data-tilt]");
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (isFinePointer) {
      // ДЕСКТОП: tilt по mouse position
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
          const phase = ((elapsed + i * 600) % 7000) / 7000;
          const rx = Math.sin(phase * Math.PI * 2) * 1.4;
          const ry = Math.cos(phase * Math.PI * 2) * 1.8;
          child.style.transform = `perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
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
          child.style.transform = `perspective(2400px) rotateX(${-y}deg) rotateY(${x}deg)`;
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
  if (!prefersReducedMotion && window.VANTA && window.VANTA.NET) {
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

  /* ─── 14. CONTACT FORM ─────────────────────────────────── */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
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
