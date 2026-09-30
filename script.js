(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLinks = nav ? [...nav.querySelectorAll("a[href^='#']")] : [];
  const revealItems = document.querySelectorAll(".reveal");
  const progress = document.querySelector("[data-scroll-progress]");
  const sections = [...document.querySelectorAll("main section[id]")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setHeaderState = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
  };

  const closeNav = () => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const toggleNav = () => {
    if (!navToggle || !nav) return;
    const nextState = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(nextState));
    navToggle.setAttribute("aria-label", nextState ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", nextState);
    document.body.classList.toggle("nav-open", nextState);
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", toggleNav);
    navLinks.forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) closeNav();
    });
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -7% 0px",
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("is-active", href === `#${visible.target.id}`);
        });
      },
      {
        threshold: [0.25, 0.45, 0.65],
        rootMargin: "-18% 0px -52% 0px",
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((target) => {
      const surface = target.classList.contains("hero-visual")
        ? target.querySelector(".visual-shell")
        : target;

      if (!surface) return;

      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 5;
        const rotateX = (0.5 - py) * 5;

        surface.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        surface.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      });

      target.addEventListener("pointerleave", () => {
        surface.style.setProperty("--tilt-x", "0deg");
        surface.style.setProperty("--tilt-y", "0deg");
      });
    });

    document.querySelectorAll(".button").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--btn-x", `${event.clientX - rect.left}px`);
        button.style.setProperty("--btn-y", `${event.clientY - rect.top}px`);
      });
    });
  }
})();
