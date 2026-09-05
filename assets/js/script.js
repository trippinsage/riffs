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
      if (window.getComputedStyle(menuBtn).display === "none") setMobileMenu(false);
    }, { passive: true });
  }

  /* ==================================================================
     2. SMOOTH SCROLLING
  ================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.getElementById(targetId.slice(1));
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
     8. CONTACT PREVIEW
  ================================================================== */
  const contactDialog = document.getElementById("contact-dialog");
  const contactPanel = contactDialog?.querySelector(".site-dialog-panel");
  let contactReturnFocus = null;

  function openContactDialog(trigger) {
    if (!contactDialog) return;
    contactReturnFocus = trigger;
    contactDialog.hidden = false;
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => contactPanel?.focus());
  }

  function closeContactDialog() {
    if (!contactDialog || contactDialog.hidden) return;
    contactDialog.hidden = true;
    document.body.classList.remove("dialog-open");
    contactReturnFocus?.focus();
  }

  document.querySelectorAll("[data-contact-open]").forEach(trigger => {
    trigger.addEventListener("click", () => openContactDialog(trigger));
  });

  contactDialog?.querySelectorAll("[data-dialog-close]").forEach(trigger => {
    trigger.addEventListener("click", closeContactDialog);
  });

  /* ==================================================================
     9. NEWSLETTER SIGNUP
  ================================================================== */
  const newsletterBtn = document.getElementById("newsletter-signup");
  const newsletterStatus = document.getElementById("newsletter-status");
  const newsletterFallback = document.getElementById("newsletter-fallback");
  const newsletterDialog = document.getElementById("newsletter-dialog");
  const newsletterPanel = newsletterDialog?.querySelector(".site-dialog-panel");
  const newsletterDialogStatus = document.getElementById("newsletter-dialog-status");
  const newsletterDialogFallback = newsletterDialog?.querySelector(".newsletter-dialog-fallback");
  const newsletterLoader = newsletterDialog?.querySelector(".newsletter-loader");

  function setNewsletterDialog(open) {
    if (!newsletterDialog) return;
    newsletterDialog.hidden = !open;
    document.body.classList.toggle("dialog-open", open);
    if (open) requestAnimationFrame(() => newsletterPanel?.focus());
  }

  function setNewsletterDialogMessage(message, showFallback = false) {
    if (newsletterDialogStatus) newsletterDialogStatus.textContent = message;
    if (newsletterDialogFallback) newsletterDialogFallback.hidden = !showFallback;
    if (newsletterLoader) newsletterLoader.hidden = showFallback;
  }

  function findVisibleMailchimpForm() {
    const candidates = document.querySelectorAll(
      "#PopupSignupForm_0, .mc-modal, .mc-banner, iframe[src*='mailchimp'], iframe[src*='form-assets']"
    );
    return Array.from(candidates).find(element => {
      const style = window.getComputedStyle(element);
      return !element.hidden && style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    });
  }

  function waitForMailchimpForm(timeout = 7000) {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (findVisibleMailchimpForm()) {
        window.clearInterval(timer);
        setNewsletterDialog(false);
        if (newsletterStatus) newsletterStatus.textContent = "";
        return;
      }

      if (Date.now() - started >= timeout) {
        window.clearInterval(timer);
        if (newsletterBtn) newsletterBtn.disabled = false;
        const label = newsletterBtn?.querySelector("span");
        if (label) label.textContent = "Sign Up for Deals";

        if (document.querySelector("script[data-mailchimp-loader][data-loaded='true']")) {
          setNewsletterDialog(false);
          if (newsletterStatus) newsletterStatus.textContent = "";
          return;
        }

        if (newsletterStatus) newsletterStatus.textContent = "Signup form could not load.";
        if (newsletterFallback) newsletterFallback.hidden = false;
        setNewsletterDialogMessage("The signup form could not load. You can email Riff's to sign up instead.", true);
      }
    }, 150);
  }

  newsletterDialog?.querySelectorAll("[data-newsletter-close]").forEach(trigger => {
    trigger.addEventListener("click", () => {
      setNewsletterDialog(false);
      newsletterBtn?.focus();
    });
  });

  if (newsletterBtn) {
    const mailchimpSrc = newsletterBtn.dataset.mailchimpSrc;
    const defaultLabel = newsletterBtn.querySelector("span")?.textContent || newsletterBtn.textContent.trim();

    const setNewsletterStatus = message => {
      if (newsletterStatus) newsletterStatus.textContent = message;
    };

    const setNewsletterLoading = loading => {
      newsletterBtn.disabled = loading;
      const label = newsletterBtn.querySelector("span");
      if (label) label.textContent = loading ? "Opening Signup" : defaultLabel;
    };

    const showNewsletterFallback = () => {
      if (newsletterFallback) newsletterFallback.hidden = false;
    };

    newsletterBtn.addEventListener("click", () => {
      setNewsletterDialog(true);
      setNewsletterDialogMessage("Connecting securely to Mailchimp…");

      if (!mailchimpSrc) {
        showNewsletterFallback();
        setNewsletterDialogMessage("Mailchimp is not configured right now. You can email Riff's to sign up.", true);
        return;
      }

      const existingScript = document.querySelector("script[data-mailchimp-loader]");
      if (existingScript) {
        if (findVisibleMailchimpForm()) {
          setNewsletterDialog(false);
          return;
        }

        setNewsletterStatus(existingScript.dataset.loaded === "true" ? "Mailchimp is already loaded." : "Signup form is loading.");
        if (existingScript.dataset.loaded === "true") {
          setNewsletterDialog(false);
          setNewsletterStatus("");
        } else {
          waitForMailchimpForm();
        }
        return;
      }

      setNewsletterLoading(true);
      setNewsletterStatus("Signup form is opening.");
      newsletterFallback?.setAttribute("hidden", "");

      const script = document.createElement("script");
      script.src = mailchimpSrc;
      script.async = true;
      script.dataset.mailchimpLoader = "true";

      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        setNewsletterLoading(false);
        setNewsletterDialog(false);
        setNewsletterStatus("");
      });

      script.addEventListener("error", () => {
        setNewsletterLoading(false);
        setNewsletterStatus("Signup form could not load.");
        showNewsletterFallback();
        setNewsletterDialogMessage("Mailchimp could not load. You can email Riff's to sign up instead.", true);
      });

      document.body.appendChild(script);
      waitForMailchimpForm();
    });
  }

  document.addEventListener("keydown", event => {
    const activeDialog = newsletterDialog && !newsletterDialog.hidden
      ? newsletterDialog
      : (contactDialog && !contactDialog.hidden ? contactDialog : null);

    if (event.key === "Tab" && activeDialog) {
      const focusable = Array.from(activeDialog.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )).filter(element => !element.hidden && element.getClientRects().length > 0);

      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!focusable.includes(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (event.key !== "Escape") return;
    if (newsletterDialog && !newsletterDialog.hidden) {
      setNewsletterDialog(false);
      newsletterBtn?.focus();
      return;
    }
    closeContactDialog();
  });

  /* ==================================================================
     10. SERVICE WORKER
  ================================================================== */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    });
  }
});
