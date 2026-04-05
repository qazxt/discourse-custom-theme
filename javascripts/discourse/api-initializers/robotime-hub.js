import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  /**
   * Move Discourse header actions (search, hamburger, user menu) into the
   * custom bar, then CSS hides .d-header-wrap entirely.
   */
  function relocateNativeHeaderTools() {
    const slot = document.querySelector(".robotime-header__user");
    const header = document.querySelector(".d-header");
    if (!slot || !header) {
      return;
    }

    const tools =
      header.querySelector(".d-header-icons") ||
      header.querySelector(".header-icons") ||
      header.querySelector(".panel") ||
      header.querySelector(".header-buttons");

    if (!tools || slot.contains(tools)) {
      return;
    }

    slot.appendChild(tools);
  }

  /** Last applied offset; skip identical writes to avoid reflow / scrollbar gutter oscillation. */
  let lastRobotimeStackOffsetPx = null;

  function updateRobotimeHeaderOffset() {
    let h = 0;
    const above = document.querySelector(".robotime-above-header");
    if (above) {
      h += above.getBoundingClientRect().height;
    }
    const carousel = document.getElementById("robotime-carousel");
    if (carousel) {
      const ch = carousel.getBoundingClientRect().height;
      if (ch > 0) {
        h += ch;
      }
    }
    const px = `${Math.max(0, Math.round(h))}px`;
    if (px === lastRobotimeStackOffsetPx) {
      return;
    }
    lastRobotimeStackOffsetPx = px;
    // Theme-only name: Discourse core overwrites --header-offset (e.g. to 0); do not fight it.
    document.documentElement.style.setProperty("--robotime-header-offset", px);
    // Keep legacy outlet var for any layout that still reads it from the theme.
    document.documentElement.style.setProperty("--main-outlet-offset", px);
  }

  function setupRobotimeHeaderOffsetObserverOnce() {
    if (window.__robotimeHeaderOffsetObserver) {
      return;
    }
    window.__robotimeHeaderOffsetObserver = true;

    const run = () => {
      requestAnimationFrame(() => updateRobotimeHeaderOffset());
    };

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(run);
      const above = document.querySelector(".robotime-above-header");
      const carousel = document.getElementById("robotime-carousel");
      if (above) {
        ro.observe(above);
      }
      if (carousel) {
        ro.observe(carousel);
      }
    }

    window.addEventListener("resize", run, { passive: true });
    run();
  }

  function setupRobotimeCarouselArrowsOnce() {
    if (window.__robotimeCarouselArrowDelegation) return;
    window.__robotimeCarouselArrowDelegation = true;
    document.body.addEventListener("click", (e) => {
      const prev = e.target.closest("#carousel-prev");
      const next = e.target.closest("#carousel-next");
      if (!prev && !next) return;
      const track = document.getElementById("carousel-track");
      const st = track?._robotimeCarousel;
      if (!st?.heroBanners) return;

      function getStep() {
        const card = track.querySelector(".robotime-carousel__card");
        if (!card) return 290;
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
        return card.getBoundingClientRect().width + gap;
      }
      function getMaxScroll() {
        const step = getStep();
        const visible = Math.floor(track.parentElement.offsetWidth / step);
        return Math.max(
          0,
          (st.heroBanners.length - visible) * step
        );
      }

      if (prev) {
        st.scrollPos = Math.max(0, st.scrollPos - getStep() * 2);
      } else {
        st.scrollPos = Math.min(getMaxScroll(), st.scrollPos + getStep() * 2);
      }
      track.style.transform = `translateX(-${st.scrollPos}px)`;
    });
  }

  function renderNavLinks(desktopContainer, mobileContainer, navItems) {
    if (!navItems) return;
    const fill = (container) => {
      if (!container) return;
      container.innerHTML = "";
      navItems.forEach((item) => {
        const a = document.createElement("a");
        a.href = item.url;
        a.className = "robotime-header__nav-link";
        a.textContent = item.label;
        if (item.is_external) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        container.appendChild(a);
      });
    };
    fill(desktopContainer);
    fill(mobileContainer);
  }

  function renderCarousel(track, heroBanners) {
    if (!track || !heroBanners) return;
    track.innerHTML = "";

    function isDark(hex) {
      const c = String(hex || "").replace("#", "");
      if (c.length !== 6) return false;
      const r = parseInt(c.slice(0, 2), 16);
      const g = parseInt(c.slice(2, 4), 16);
      const b = parseInt(c.slice(4, 6), 16);
      return r * 0.299 + g * 0.587 + b * 0.114 < 160;
    }

    heroBanners.forEach((card) => {
      const el = document.createElement("a");
      el.href = card.link_url || "#";
      el.className = "robotime-carousel__card";
      const bgClass = isDark(card.bg_color || "#f6ebe3")
        ? "dark-bg"
        : "light-bg";
      const normalBg = card.bg_color || "#f6ebe3";
      el.innerHTML = `
      <div class="robotime-carousel__card-body" style="background-color: ${normalBg}">
        <div class="robotime-carousel__card-img" style="background-image: url('${card.image_url}')"></div>
        <div class="robotime-carousel__card-label ${bgClass}">${card.title}</div>
      </div>`;

      el.addEventListener("mousedown", () => el.classList.add("is-pressed"));
      el.addEventListener("mouseup", () => el.classList.remove("is-pressed"));
      el.addEventListener("mouseleave", () =>
        el.classList.remove("is-pressed")
      );

      track.appendChild(el);
    });

    track._robotimeCarousel = { heroBanners, scrollPos: 0 };
    track.style.transform = "translateX(0)";
    setupRobotimeCarouselArrowsOnce();
  }

  function renderSidebarWidgets(container, widgets, panel) {
    if (!container || !widgets || widgets.length === 0) return;

    if (window.__robotimeSidebarInterval) {
      clearInterval(window.__robotimeSidebarInterval);
      window.__robotimeSidebarInterval = null;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "robotime-sidebar-widget";

    const sectionTitle =
      panel && panel.section_title ? String(panel.section_title).trim() : "";
    if (sectionTitle) {
      const heading = document.createElement("div");
      heading.className = "robotime-sidebar-widget__section-title";
      heading.textContent = sectionTitle;
      wrapper.appendChild(heading);
    }

    const carousel = document.createElement("div");
    carousel.className = "robotime-sidebar-widget__carousel";
    wrapper.appendChild(carousel);

    function buildCard(w) {
      const a = document.createElement("a");
      a.href = w.link_url || "#";
      a.className = "robotime-sidebar-widget__card";
      const img = document.createElement("img");
      img.src = w.image_url || "";
      img.alt = w.title || "";
      const titleEl = document.createElement("div");
      titleEl.className = "robotime-sidebar-widget__title";
      titleEl.textContent = w.title || "";
      a.appendChild(img);
      a.appendChild(titleEl);
      return a;
    }

    function buildDots(activeIdx) {
      const dots = document.createElement("div");
      dots.className = "robotime-sidebar-widget__dots";
      widgets.forEach((_, i) => {
        const span = document.createElement("span");
        span.className =
          "robotime-sidebar-widget__dot" + (i === activeIdx ? " active" : "");
        dots.appendChild(span);
      });
      return dots;
    }

    if (widgets.length === 1) {
      carousel.appendChild(buildCard(widgets[0]));
    } else {
      let idx = 0;
      const renderMulti = () => {
        carousel.innerHTML = "";
        carousel.appendChild(buildCard(widgets[idx]));
        carousel.appendChild(buildDots(idx));
      };
      renderMulti();
      window.__robotimeSidebarInterval = setInterval(() => {
        idx = (idx + 1) % widgets.length;
        renderMulti();
      }, 5000);
    }

    const viewAll = panel && panel.view_all;
    const viewAllUrl = viewAll && viewAll.url ? String(viewAll.url).trim() : "";
    if (viewAllUrl) {
      const link = document.createElement("a");
      link.href = viewAllUrl;
      link.className = "robotime-sidebar-widget__view-all";
      link.textContent =
        viewAll && viewAll.label && String(viewAll.label).trim()
          ? String(viewAll.label).trim()
          : "View All Events";
      if (viewAll.is_external) {
        link.target = "_blank";
        link.rel = "noopener";
      }
      wrapper.appendChild(link);
    }

    container.appendChild(wrapper);
  }

  function renderFilterQuickTags(quickTags) {
    document.getElementById("robotime-filter-quick-tags")?.remove();
    if (!quickTags || !quickTags.length) return;

    const nav = document.querySelector(".list-controls .navigation-container");
    if (!nav || !nav.parentNode) return;

    const row = document.createElement("div");
    row.id = "robotime-filter-quick-tags";
    row.className = "robotime-filter-quick-tags";
    row.setAttribute("role", "navigation");
    row.setAttribute("aria-label", "Quick tags");

    const herePath = window.location.pathname.replace(/\/$/, "") || "/";
    const hereQs = window.location.search || "";

    quickTags.forEach((t) => {
      if (!t || !t.url) return;
      const a = document.createElement("a");
      a.href = t.url;
      const raw = (t.label || "").trim();
      const display = raw.startsWith("#") ? raw : `#${raw.replace(/^#/, "")}`;
      a.textContent = display;
      a.className = "robotime-filter-quick-tags__link";
      if (t.is_external) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      try {
        const u = new URL(t.url, window.location.origin);
        const therePath = u.pathname.replace(/\/$/, "") || "/";
        const thereQs = u.search || "";
        if (therePath === herePath && thereQs === hereQs) {
          a.classList.add("is-active");
        }
      } catch (e) {
        /* ignore */
      }
      row.appendChild(a);
    });

    if (!row.children.length) return;
    nav.parentNode.insertBefore(row, nav.nextSibling);
  }

  function applyHubConfig(config) {
    const navDesktop = document.querySelector(".robotime-header__nav");
    const mobileNav = document.querySelector(".robotime-mobile-nav");
    const carouselTrack = document.getElementById("carousel-track");
    const sidebarSlot = document.querySelector(".robotime-sidebar-widget-slot");

    if (config.nav_items) {
      renderNavLinks(navDesktop, mobileNav, config.nav_items);
    }
    if (config.hero_banners) {
      renderCarousel(carouselTrack, config.hero_banners);
    }
    if (config.sidebar_widgets) {
      renderSidebarWidgets(sidebarSlot, config.sidebar_widgets, {
        section_title: config.sidebar_section_title,
        view_all: config.sidebar_view_all,
      });
    }
    renderFilterQuickTags(config.filter_quick_tags);
    requestAnimationFrame(() => updateRobotimeHeaderOffset());
  }

  function sidebarNewTopicLabelText() {
    const lang = (document.documentElement.lang || "").toLowerCase();
    if (lang.startsWith("zh")) {
      return "新建话题";
    }
    return "New topic";
  }

  /** Connector leaves label span empty — avoids theme-i18n failures breaking the sidebar outlet. */
  function ensureSidebarNewTopicLabel() {
    document.querySelectorAll(".robotime-sidebar-new-topic__label").forEach((el) => {
      if (!el.textContent.trim()) {
        el.textContent = sidebarNewTopicLabelText();
      }
    });
  }

  function initMobileMenu() {
    const menuBtn = document.querySelector(".robotime-header__mobile-menu-btn");
    const mobileNav = document.querySelector(".robotime-mobile-nav");
    if (!menuBtn || !mobileNav || menuBtn.dataset.robotimeMenuBound) return;
    menuBtn.dataset.robotimeMenuBound = "1";

    menuBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("robotime-mobile-nav--open");
    });
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        mobileNav.classList.remove("robotime-mobile-nav--open");
      }
    });
  }

  api.onPageChange(() => {
    requestAnimationFrame(() => {
      relocateNativeHeaderTools();
      setupRobotimeHeaderOffsetObserverOnce();
      updateRobotimeHeaderOffset();
      ensureSidebarNewTopicLabel();
      requestAnimationFrame(() => {
        relocateNativeHeaderTools();
        updateRobotimeHeaderOffset();
        ensureSidebarNewTopicLabel();
      });
      initMobileMenu();

      const carouselRoot = document.getElementById("robotime-carousel");

      if (carouselRoot && !window.__robotimeCarouselCollapseInit) {
        window.__robotimeCarouselCollapseInit = true;
        let collapsed = false;
        let scrollRafId = null;
        let offsetSweepTimer = null;

        // Only collapse when the document can scroll meaningfully (short lists: stay expanded, no jitter).
        const SCROLLABLE_MIN_EXTRA = 140;
        const SCROLL_COLLAPSE_AT = 100;
        const SCROLL_EXPAND_AT = 28;

        function pageHasRealScroll() {
          const el = document.documentElement;
          return el.scrollHeight > window.innerHeight + SCROLLABLE_MIN_EXTRA;
        }

        function scheduleHeaderOffsetAfterCollapseChange() {
          updateRobotimeHeaderOffset();
          if (offsetSweepTimer) {
            clearTimeout(offsetSweepTimer);
          }
          offsetSweepTimer = setTimeout(() => {
            offsetSweepTimer = null;
            updateRobotimeHeaderOffset();
          }, 340);
        }

        function runCarouselCollapseUpdate() {
          scrollRafId = null;

          if (!pageHasRealScroll()) {
            if (collapsed) {
              collapsed = false;
              carouselRoot.classList.remove("robotime-carousel--collapsed");
              scheduleHeaderOffsetAfterCollapseChange();
            }
            return;
          }

          const y = window.scrollY;
          let nextCollapsed = collapsed;
          if (!collapsed && y > SCROLL_COLLAPSE_AT) {
            nextCollapsed = true;
          } else if (collapsed && y < SCROLL_EXPAND_AT) {
            nextCollapsed = false;
          }

          if (nextCollapsed === collapsed) {
            return;
          }
          collapsed = nextCollapsed;
          carouselRoot.classList.toggle(
            "robotime-carousel--collapsed",
            collapsed
          );
          scheduleHeaderOffsetAfterCollapseChange();
        }

        function queueCarouselCollapseCheck() {
          if (scrollRafId) {
            return;
          }
          scrollRafId = window.requestAnimationFrame(runCarouselCollapseUpdate);
        }

        window.addEventListener("scroll", queueCarouselCollapseCheck, {
          passive: true,
        });
        window.addEventListener("resize", queueCarouselCollapseCheck, {
          passive: true,
        });

        queueCarouselCollapseCheck();
      }

      fetch("/hub-config.json")
        .then((r) => r.json())
        .then((config) => {
          applyHubConfig(config || {});
        })
        .catch(() => {
          console.warn(
            "[Robotime Theme] hub-config.json not available — plugin may be disabled."
          );
          renderFilterQuickTags(null);
          ensureSidebarNewTopicLabel();
        });
    });
  });
});
