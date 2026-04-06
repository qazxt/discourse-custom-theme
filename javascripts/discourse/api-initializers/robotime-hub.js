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

  /** preview.html-style menu icons (20×20); SVG data URIs so no theme asset URL is required. */
  const RSB_ICON_SVGS = {
    topics:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="16" y2="18"/></svg>',
    posts:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><circle cx="12" cy="8" r="3.5"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/></svg>',
    messages:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M3 7l9 5 9-5"/></svg>',
    invite:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M5 20v-1a4 4 0 0 1 4-4h1"/><path d="M16 11v6M13 14h6"/></svg>',
    more:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000"><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/></svg>',
  };

  function robotimeSidebarIconDataUrl(key) {
    const svg = RSB_ICON_SVGS[key];
    return svg ? `data:image/svg+xml,${encodeURIComponent(svg)}` : null;
  }

  function robotimeSidebarIconKey(el) {
    const href = (el.getAttribute("href") || "").split(/[?#]/)[0].toLowerCase();
    const linkName = (el.dataset.linkName || "").toLowerCase();
    const text = (el.textContent || "").trim().toLowerCase();

    if (linkName.includes("more") || text === "more" || text === "更多") {
      return "more";
    }
    if (/invite|invitation/i.test(href) || linkName.includes("invite")) {
      return "invite";
    }
    // Avoid matching /chat/search as inbox — do not use a bare "/chat/" segment test.
    if (
      /\/my\/messages|private-message|\/u\/[^/]+\/messages(\/|$)/i.test(href) ||
      (linkName.includes("message") && linkName !== "chat-search")
    ) {
      return "messages";
    }
    if (
      /\/activity|\/drafts|\/u\/[^/]+\/(activity|summary)(\/|$)/i.test(href) ||
      linkName === "user-posts" ||
      linkName === "my-posts" ||
      linkName === "my-threads"
    ) {
      return "posts";
    }
    if (/\/bookmarks(\/|$)/i.test(href) || linkName.includes("bookmark")) {
      return "posts";
    }
    if (
      /\/(latest|new|unread|top|read|posted|hot)(\/|$)/i.test(href) ||
      linkName === "topics" ||
      linkName === "everything" ||
      linkName.startsWith("topics-") ||
      linkName === "unread" ||
      linkName === "new" ||
      linkName === "top"
    ) {
      return "topics";
    }

    return null;
  }

  function injectRobotimeSidebarMenuIcons() {
    document
      .querySelectorAll(
        ".sidebar-wrapper .sidebar-section-link-wrapper a.sidebar-section-link, .sidebar-wrapper .sidebar-section-link-wrapper button.sidebar-section-link"
      )
      .forEach((el) => {
        const key = robotimeSidebarIconKey(el);
        if (!key) {
          return;
        }
        const prefix = el.querySelector(".sidebar-section-link-prefix");
        if (!prefix) {
          return;
        }
        const dataUrl = robotimeSidebarIconDataUrl(key);
        if (!dataUrl) {
          return;
        }

        const existing = prefix.querySelector(".robotime-sidebar-menu-icon");
        if (el.dataset.robotimeSidebarIcon === key && existing) {
          return;
        }

        el.dataset.robotimeSidebarIcon = key;
        prefix.classList.add("robotime-sidebar-link-prefix--robotime-icon");
        if (existing) {
          existing.remove();
        }

        const img = document.createElement("img");
        img.className = "robotime-sidebar-menu-icon";
        img.alt = "";
        img.decoding = "async";
        img.src = dataUrl;
        prefix.appendChild(img);
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

  /**
   * Topic list cover: intrinsic w/h > this → 1:1 crop, else 3:4 (AGENTS.md / design).
   * No image / load error → square placeholder.
   */
  const ROBOTIME_THUMB_WH_RATIO_SPLIT = 0.85;

  let robotimeThumbApplyTimer = null;

  function scheduleRobotimeTopicThumbnails() {
    if (robotimeThumbApplyTimer) {
      clearTimeout(robotimeThumbApplyTimer);
    }
    robotimeThumbApplyTimer = setTimeout(() => {
      robotimeThumbApplyTimer = null;
      applyRobotimeTopicListThumbnails();
    }, 80);
  }

  function robotimeClearThumbCellDataset(cell) {
    cell.removeAttribute("data-robotime-thumb-ratio");
    cell.removeAttribute("data-robotime-thumb-state");
  }

  function robotimeSetTopicThumbPlaceholder(cell, ratioMode = "square") {
    cell.setAttribute("data-robotime-thumb-state", "placeholder");
    cell.setAttribute("data-robotime-thumb-ratio", ratioMode);
  }

  function robotimeApplyTopicThumbRatio(cell, naturalWidth, naturalHeight) {
    if (!naturalWidth || !naturalHeight) {
      robotimeSetTopicThumbPlaceholder(cell, "square");
      return;
    }
    cell.removeAttribute("data-robotime-thumb-state");
    const r = naturalWidth / naturalHeight;
    cell.setAttribute(
      "data-robotime-thumb-ratio",
      r > ROBOTIME_THUMB_WH_RATIO_SPLIT ? "square" : "portrait"
    );
  }

  function robotimeProcessThumbnailCell(cell) {
    robotimeClearThumbCellDataset(cell);
    const img = cell.querySelector("img");
    if (!img) {
      robotimeSetTopicThumbPlaceholder(cell, "square");
      return;
    }
    const src = (img.getAttribute("src") || "").trim();
    if (!src) {
      robotimeSetTopicThumbPlaceholder(cell, "square");
      return;
    }

    const finalize = () => {
      if (img.naturalWidth === 0 && img.naturalHeight === 0) {
        robotimeSetTopicThumbPlaceholder(cell, "square");
        return;
      }
      robotimeApplyTopicThumbRatio(cell, img.naturalWidth, img.naturalHeight);
    };

    if (img.complete) {
      finalize();
    } else {
      img.addEventListener("load", finalize, { once: true });
      img.addEventListener(
        "error",
        () => {
          robotimeSetTopicThumbPlaceholder(cell, "square");
        },
        { once: true }
      );
    }
  }

  function robotimeProcessCustomTopicThumb(wrap) {
    robotimeClearThumbCellDataset(wrap);
    const img = wrap.querySelector("img");
    if (!img || !(img.getAttribute("src") || "").trim()) {
      robotimeSetTopicThumbPlaceholder(wrap, "square");
      return;
    }
    const done = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        robotimeSetTopicThumbPlaceholder(wrap, "square");
        return;
      }
      wrap.removeAttribute("data-robotime-thumb-state");
      const r = img.naturalWidth / img.naturalHeight;
      wrap.setAttribute(
        "data-robotime-thumb-ratio",
        r > ROBOTIME_THUMB_WH_RATIO_SPLIT ? "square" : "portrait"
      );
    };
    if (img.complete) {
      done();
    } else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener(
        "error",
        () => {
          robotimeSetTopicThumbPlaceholder(wrap, "square");
        },
        { once: true }
      );
    }
  }

  function markRobotimeTopicRowCoverLayout() {
    document.querySelectorAll("tr.topic-list-item").forEach((row) => {
      if (row.querySelector("td.topic-thumbnails")) {
        row.setAttribute("data-robotime-topic-row", "has-thumb");
      } else {
        row.setAttribute("data-robotime-topic-row", "no-cover");
      }
    });
  }

  function applyRobotimeTopicListThumbnails() {
    document.querySelectorAll("tr.topic-list-item td.topic-thumbnails").forEach((cell) => {
      robotimeProcessThumbnailCell(cell);
    });
    document.querySelectorAll(".robotime-topic-card__thumbnail").forEach((wrap) => {
      robotimeProcessCustomTopicThumb(wrap);
    });
    markRobotimeTopicRowCoverLayout();
  }

  function setupRobotimeTopicThumbnailObserverOnce() {
    if (window.__robotimeTopicThumbObserver) {
      return;
    }
    window.__robotimeTopicThumbObserver = true;
    const root = document.querySelector("#main") || document.body;
    const mo = new MutationObserver(() => scheduleRobotimeTopicThumbnails());
    mo.observe(root, { childList: true, subtree: true });
  }

  api.onPageChange(() => {
    requestAnimationFrame(() => {
      relocateNativeHeaderTools();
      setupRobotimeHeaderOffsetObserverOnce();
      setupRobotimeTopicThumbnailObserverOnce();
      updateRobotimeHeaderOffset();
      ensureSidebarNewTopicLabel();
      injectRobotimeSidebarMenuIcons();
      scheduleRobotimeTopicThumbnails();
      requestAnimationFrame(() => {
        relocateNativeHeaderTools();
        updateRobotimeHeaderOffset();
        ensureSidebarNewTopicLabel();
        injectRobotimeSidebarMenuIcons();
        scheduleRobotimeTopicThumbnails();
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
