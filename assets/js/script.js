// assets/js/script.js
// Riff's Department Store - Site-wide JavaScript

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==================================================================
     1. MOBILE MENU
  ================================================================== */
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("menu-icon-open");
  const iconClose = document.getElementById("menu-icon-close");

  function setMobileMenu(open) {
    if (!menuBtn || !mobileMenu) return;

    mobileMenu.classList.toggle("hidden", !open);
    iconOpen?.classList.toggle("hidden", open);
    iconClose?.classList.toggle("hidden", !open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      setMobileMenu(mobileMenu.classList.contains("hidden"));
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => setMobileMenu(false));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setMobileMenu(false);
    });

    document.addEventListener("click", event => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileMenu.classList.contains("hidden")) return;
      if (mobileMenu.contains(target) || menuBtn.contains(target)) return;
      setMobileMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) setMobileMenu(false);
    }, { passive: true });
  }

  /* ==================================================================
     2. SMOOTH SCROLLING
  ================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerHeight = document.querySelector("header")?.offsetHeight || 80;
      const scrollY = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({
        top: scrollY,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });

      if (history.pushState) history.pushState(null, "", targetId);
    });
  });

  /* ==================================================================
     3. FADE-IN ON SCROLL
  ================================================================== */
  const fadeElements = document.querySelectorAll(".fade-in");
  if (fadeElements.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    const fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add("visible"));
  }

  /* ==================================================================
     4. HEADER SHADOW ON SCROLL
  ================================================================== */
  const header = document.querySelector("header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ==================================================================
     5. LOCATIONS LIST TOGGLE
  ================================================================== */
  const toggleBtn = document.getElementById("locations-toggle");
  const locationsList = document.getElementById("locations-list");
  const toggleIcon = document.getElementById("toggle-icon");

  function setLocationsList(open) {
    if (!toggleBtn || !locationsList || !toggleIcon) return;

    locationsList.classList.toggle("open", open);
    locationsList.style.maxHeight = open ? `${locationsList.scrollHeight + 40}px` : "0px";
    toggleIcon.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggleBtn && locationsList && toggleIcon) {
    const initializeLocationsList = () => {
      if (locationsList.dataset.initialized === "true" || locationsList.children.length === 0) return;

      locationsList.dataset.initialized = "true";
      setLocationsList(false);

      toggleBtn.addEventListener("click", () => {
        setLocationsList(!locationsList.classList.contains("open"));
      });
    };

    document.addEventListener("riffs:locations-populated", initializeLocationsList);

    const waitForGrid = setInterval(() => {
      initializeLocationsList();
      if (locationsList.dataset.initialized === "true") clearInterval(waitForGrid);
    }, 100);

    setTimeout(() => clearInterval(waitForGrid), 5000);

    window.addEventListener("resize", () => {
      if (locationsList.classList.contains("open")) {
        locationsList.style.maxHeight = `${locationsList.scrollHeight + 40}px`;
      }
    }, { passive: true });
  }

  /* ==================================================================
     6. DEPARTMENT CARDS
  ================================================================== */
  const departmentCards = document.querySelectorAll(".department-card");
  if (departmentCards.length) {
    const syncDepartmentCards = () => {
      const desktop = window.innerWidth >= 1024;
      departmentCards.forEach(card => {
        if (desktop) {
          card.setAttribute("open", "");
        } else {
          card.removeAttribute("open");
        }
      });
    };

    syncDepartmentCards();

    departmentCards.forEach(card => {
      card.querySelector("summary")?.addEventListener("click", event => {
        if (window.innerWidth >= 1024) event.preventDefault();
      });

      card.addEventListener("toggle", () => {
        if (window.innerWidth >= 1024) {
          if (!card.open) requestAnimationFrame(() => card.setAttribute("open", ""));
          return;
        }

        if (!card.open) return;
        departmentCards.forEach(otherCard => {
          if (otherCard !== card) otherCard.removeAttribute("open");
        });
      });
    });

    window.addEventListener("resize", syncDepartmentCards, { passive: true });
  }

  /* ==================================================================
     7. FAQ CARDS
  ================================================================== */
  const faqCards = document.querySelectorAll(".faq-list details");
  if (faqCards.length) {
    const syncFaqCards = () => {
      const desktop = window.innerWidth >= 1024;
      faqCards.forEach(card => {
        if (desktop) {
          card.setAttribute("open", "");
        } else {
          card.removeAttribute("open");
        }
      });
    };

    syncFaqCards();

    faqCards.forEach(card => {
      card.querySelector("summary")?.addEventListener("click", event => {
        if (window.innerWidth >= 1024) event.preventDefault();
      });

      card.addEventListener("toggle", () => {
        if (window.innerWidth >= 1024) {
          if (!card.open) requestAnimationFrame(() => card.setAttribute("open", ""));
          return;
        }

        if (!card.open) return;
        faqCards.forEach(otherCard => {
          if (otherCard !== card) otherCard.removeAttribute("open");
        });
      });
    });

    window.addEventListener("resize", syncFaqCards, { passive: true });
  }

  /* ==================================================================
     8. SHARE CURRENT SALE
  ================================================================== */
  const shareBtn = document.getElementById("share-sale-btn");
  if (shareBtn) {
    const defaultText = shareBtn.textContent;
    const shareData = {
      title: "Riff's Summer Sale | June 5 & 6",
      text: "50% off T-shirts, shorts, and sandals at Riff's on Friday and Saturday, June 5 and 6.",
      url: window.location.origin + window.location.pathname
    };

    const flashButtonText = text => {
      shareBtn.textContent = text;
      window.setTimeout(() => {
        shareBtn.textContent = defaultText;
      }, 1800);
    };

    shareBtn.addEventListener("click", async () => {
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }

        await navigator.clipboard.writeText(shareData.url);
        flashButtonText("Link Copied");
      } catch (error) {
        if (error?.name !== "AbortError") {
          window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)}`;
        }
      }
    });
  }

  /* ==================================================================
     9. SERVICE WORKER
  ================================================================== */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    });
  }
});
