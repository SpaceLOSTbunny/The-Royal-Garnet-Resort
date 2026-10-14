
(() => {
  "use strict";

 
  document.documentElement.classList.add("js-enabled");

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  const backToTopButton = document.querySelector("#back-to-top");
  const yearLabels = document.querySelectorAll("[data-current-year]");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

 
  yearLabels.forEach((label) => {
    label.textContent = String(new Date().getFullYear());
  });

 
  function closeMenu() {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const menuIsOpen = menuButton.getAttribute("aria-expanded") === "true";
      const shouldOpen = !menuIsOpen;

      menuButton.setAttribute("aria-expanded", String(shouldOpen));
      menuButton.setAttribute(
        "aria-label",
        shouldOpen ? "Close navigation" : "Open navigation",
      );
      navigation.classList.toggle("is-open", shouldOpen);
      document.body.classList.toggle("menu-open", shouldOpen);
    });

    
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

   
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  
  function updateScrollElements() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    if (header) {
      header.classList.toggle("scrolled", scrollPosition > 8);
    }

    if (backToTopButton) {
      backToTopButton.classList.toggle("is-visible", scrollPosition > 450);
    }
  }

  window.addEventListener("scroll", updateScrollElements, { passive: true });
  updateScrollElements();

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }


  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -20px 0px",
      },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
   
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("image-unavailable");
        image.style.opacity = "0";
        if (image.parentElement) {
          image.parentElement.classList.add("has-image-fallback");
        }
      },
      { once: true },
    );
  });
})();
