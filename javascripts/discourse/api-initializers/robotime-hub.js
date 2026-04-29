import { apiInitializer } from "discourse/lib/api";
import I18n from "discourse-i18n";
import RobotimeCoreHeaderNav from "../components/robotime-core-header-nav";

/* global settings — injected by Discourse when compiling theme JS from settings.yml */
export default apiInitializer((api) => {
  api.renderInOutlet("before-header-panel", RobotimeCoreHeaderNav);
  /** Sidebar nav rows: #d-sidebar is the real container; .sidebar-wrapper kept for older layouts. */
  const ROBOTIME_SIDEBAR_MENU_LINKS =
    "#d-sidebar .sidebar-section-link-wrapper :is(a, button).sidebar-section-link, " +
    ".sidebar-wrapper .sidebar-section-link-wrapper :is(a, button).sidebar-section-link";

  function getThemeSettings() {
    try {
      // `settings` is injected by Discourse when building theme JS from settings.yml
      // eslint-disable-next-line no-undef
      if (typeof settings !== "undefined" && settings) {
        // eslint-disable-next-line no-undef
        return settings;
      }
    } catch (e) {
      /* theme compiled without settings */
    }
    return {};
  }

  function parseRobotimeFilterQuickTagsJson(raw) {
    const s = String(raw || "").trim();
    if (!s) {
      return [];
    }
    try {
      const data = JSON.parse(s);
      return Array.isArray(data) ? data.filter((t) => t && t.url) : [];
    } catch (e) {
      console.warn(
        "[Robotime Theme] robotime_filter_quick_tags must be a JSON array string."
      );
      return [];
    }
  }

  /** Values from Admin → Themes → Theme settings (settings.yml). Authoritative for nav, tags, logo, sidebar copy. */
  function buildRobotimeThemeConfig() {
    const ts = getThemeSettings();
    const carouselEnabled =
      ts.robotime_carousel_enabled !== false &&
      ts.robotime_carousel_enabled !== "false" &&
      ts.robotime_carousel_enabled !== 0;

    const sidebarTitle = String(ts.robotime_sidebar_section_title ?? "").trim();
    const viewLabel = String(ts.robotime_sidebar_view_all_label ?? "").trim();
    const viewUrl = String(ts.robotime_sidebar_view_all_url ?? "").trim();

    return {
      filter_quick_tags: parseRobotimeFilterQuickTagsJson(ts.robotime_filter_quick_tags),
      sidebar_section_title: sidebarTitle,
      sidebar_view_all: viewUrl
        ? {
            label: viewLabel || "View All Events",
            url: viewUrl,
            is_external: /^https?:\/\//i.test(viewUrl),
          }
        : undefined,
      _robotime_carousel_enabled: carouselEnabled,
    };
  }

  /**
   * Remote JSON supplies hero_banners + sidebar_widgets only.
   * Theme settings override: filter_quick_tags, sidebar_section_title, sidebar_view_all, carousel toggle.
   * (Nav uses robotime_nav_links via RobotimeCoreHeaderNav in before-header-panel.)
   */
  function mergeHubWithTheme(remote, themeCfg) {
    const r = remote && typeof remote === "object" ? remote : {};
    const t = themeCfg && typeof themeCfg === "object" ? themeCfg : {};
    return {
      filter_quick_tags: Array.isArray(t.filter_quick_tags) ? t.filter_quick_tags : [],
      hero_banners: r.hero_banners,
      sidebar_widgets: r.sidebar_widgets,
      sidebar_section_title: t.sidebar_section_title || "",
      sidebar_view_all: t.sidebar_view_all,
      _robotime_carousel_enabled: t._robotime_carousel_enabled !== false,
    };
  }

  function applyRobotimeHeaderLogo() {
    const url = String(getThemeSettings().robotime_logo_url || "").trim();
    if (!url) {
      return;
    }
    document.querySelectorAll(".d-header .title > a").forEach((a) => {
      a.replaceChildren();
      const img = document.createElement("img");
      img.className = "robotime-header__logo-img";
      img.src = url;
      img.alt = "";
      img.decoding = "async";
      a.appendChild(img);
    });
  }

  function setRobotimeCarouselThemeVisibility(enabled) {
    const el =
      document.querySelector(".robotime-carousel") ||
      document.getElementById("robotime-carousel");
    if (!el) {
      return;
    }
    if (enabled === false) {
      el.classList.add("robotime-carousel--theme-disabled");
      el.style.setProperty("display", "none", "important");
      const track = document.getElementById("carousel-track");
      if (track) {
        track.innerHTML = "";
        track._robotimeCarousel = null;
      }
    } else {
      el.classList.remove("robotime-carousel--theme-disabled");
      el.style.removeProperty("display");
    }
    requestAnimationFrame(() => updateRobotimeHeaderOffset());
  }

  /** Last applied offset; skip identical writes to avoid reflow / scrollbar gutter oscillation. */
  let lastRobotimeStackOffsetPx = null;

  function updateRobotimeHeaderOffset() {
    let h = 0;
    const headerWrap = document.querySelector(".d-header-wrap");
    if (headerWrap) {
      h += headerWrap.getBoundingClientRect().height;
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
      const headerWrap = document.querySelector(".d-header-wrap");
      const carousel = document.getElementById("robotime-carousel");
      if (headerWrap) {
        ro.observe(headerWrap);
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

  function renderCarousel(track, heroBanners) {
    if (!track || !heroBanners) return;
    track.innerHTML = "";

    function isCurrentPageLink(rawUrl) {
      const s = String(rawUrl || "").trim();
      if (!s || s === "#") {
        return false;
      }
      try {
        const u = new URL(s, window.location.origin);
        if (u.origin !== window.location.origin) {
          return false;
        }
        const herePath = window.location.pathname.replace(/\/$/, "") || "/";
        const therePath = u.pathname.replace(/\/$/, "") || "/";
        const hereQs = window.location.search || "";
        const thereQs = u.search || "";
        return herePath === therePath && hereQs === thereQs;
      } catch (e) {
        return false;
      }
    }

    function isDark(hex) {
      const c = String(hex || "").replace("#", "");
      if (c.length !== 6) return false;
      const r = parseInt(c.slice(0, 2), 16);
      const g = parseInt(c.slice(2, 4), 16);
      const b = parseInt(c.slice(4, 6), 16);
      return r * 0.299 + g * 0.587 + b * 0.114 < 160;
    }

    function normalizeCarouselTextColor(raw) {
      const s = String(raw || "").trim();
      if (!s) {
        return null;
      }
      // Allow common safe CSS color formats only.
      if (
        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) ||
        /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.test(
          s
        ) ||
        /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.test(
          s
        )
      ) {
        return s;
      }
      return null;
    }

    heroBanners.forEach((card) => {
      const el = document.createElement("a");
      el.href = card.link_url || "#";
      el.className = "robotime-carousel__card";
      if (isCurrentPageLink(card.link_url)) {
        el.classList.add("robotime-carousel__card--active");
      }
      const bgClass = isDark(card.bg_color || "#f6ebe3")
        ? "dark-bg"
        : "light-bg";
      const normalBg = card.bg_color || "#f6ebe3";
      const labelColor = normalizeCarouselTextColor(
        card.text_color || card.title_color || card.label_color || card.font_color
      );
      const labelStyle = labelColor ? ` style="color: ${labelColor}"` : "";
      el.innerHTML = `
      <div class="robotime-carousel__card-body" style="--robotime-card-bg: ${normalBg}">
        <div class="robotime-carousel__card-img" style="background-image: url('${card.image_url}')"></div>
        <div class="robotime-carousel__card-label ${bgClass}"${labelStyle}>${card.title}</div>
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

    const viewport = document.createElement("div");
    viewport.className = "robotime-sidebar-widget__viewport";
    carousel.appendChild(viewport);

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
      viewport.appendChild(buildCard(widgets[0]));
    } else {
      let idx = 0;
      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className =
        "robotime-sidebar-widget__arrow robotime-sidebar-widget__arrow--prev";
      prevBtn.setAttribute("aria-label", "Previous event");
      prevBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 4.5a1 1 0 0 1 0 1.4L9.4 12l6.1 6.1a1 1 0 1 1-1.4 1.4l-6.8-6.8a1 1 0 0 1 0-1.4l6.8-6.8a1 1 0 0 1 1.4 0z"></path>
        </svg>`;

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className =
        "robotime-sidebar-widget__arrow robotime-sidebar-widget__arrow--next";
      nextBtn.setAttribute("aria-label", "Next event");
      nextBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.5 4.5a1 1 0 0 1 1.4 0l6.8 6.8a1 1 0 0 1 0 1.4l-6.8 6.8a1 1 0 1 1-1.4-1.4l6.1-6.1-6.1-6.1a1 1 0 0 1 0-1.4z"></path>
        </svg>`;

      const renderMulti = () => {
        viewport.innerHTML = "";
        viewport.appendChild(buildCard(widgets[idx]));
        const oldDots = carousel.querySelector(".robotime-sidebar-widget__dots");
        if (oldDots) {
          oldDots.remove();
        }
        carousel.appendChild(buildDots(idx));
      };
      renderMulti();

      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);

      const goPrev = () => {
        idx = (idx - 1 + widgets.length) % widgets.length;
        renderMulti();
      };
      const goNext = () => {
        idx = (idx + 1) % widgets.length;
        renderMulti();
      };
      prevBtn.addEventListener("click", goPrev);
      nextBtn.addEventListener("click", goNext);

      window.__robotimeSidebarInterval = setInterval(() => {
        goNext();
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
    const carouselTrack = document.getElementById("carousel-track");
    const sidebarSlot = document.querySelector(".robotime-sidebar-widget-slot");

    const carouselOn = config._robotime_carousel_enabled !== false;
    setRobotimeCarouselThemeVisibility(carouselOn);
    if (carouselOn && config.hero_banners && config.hero_banners.length) {
      renderCarousel(carouselTrack, config.hero_banners);
    } else if (carouselTrack) {
      carouselTrack.innerHTML = "";
      carouselTrack._robotimeCarousel = null;
    }
    if (config.sidebar_widgets && config.sidebar_widgets.length) {
      renderSidebarWidgets(sidebarSlot, config.sidebar_widgets, {
        section_title: config.sidebar_section_title,
        view_all: config.sidebar_view_all,
      });
    } else if (sidebarSlot) {
      sidebarSlot.innerHTML = "";
      if (window.__robotimeSidebarInterval) {
        clearInterval(window.__robotimeSidebarInterval);
        window.__robotimeSidebarInterval = null;
      }
    }
    renderFilterQuickTags(
      config.filter_quick_tags && config.filter_quick_tags.length
        ? config.filter_quick_tags
        : null
    );
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

  function robotimeSidebarIconKey(el) {
    const href = (el.getAttribute("href") || "").split(/[?#]/)[0].toLowerCase();
    const linkName = (el.dataset.linkName || "").toLowerCase();
    const text = (el.textContent || "").trim().toLowerCase();

    if (linkName.includes("more") || text === "more" || text === "更多") {
      return null;
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
    document.querySelectorAll(ROBOTIME_SIDEBAR_MENU_LINKS).forEach((el) => {
      const key = robotimeSidebarIconKey(el);
      const prefix = el.querySelector(".sidebar-section-link-prefix");
      if (!prefix) {
        return;
      }
      const existing = prefix.querySelector(".robotime-sidebar-menu-icon");
      if (!key) {
        if (existing) {
          existing.remove();
        }
        prefix.classList.remove("robotime-sidebar-link-prefix--robotime-icon");
        el.removeAttribute("data-robotime-sidebar-icon");
        return;
      }
      if (el.dataset.robotimeSidebarIcon === key && existing) {
        return;
      }

      el.dataset.robotimeSidebarIcon = key;
      prefix.classList.add("robotime-sidebar-link-prefix--robotime-icon");
      if (existing) {
        existing.remove();
      }

      const icon = document.createElement("span");
      icon.className = `robotime-sidebar-menu-icon robotime-sidebar-menu-icon--${key}`;
      icon.setAttribute("aria-hidden", "true");
      prefix.appendChild(icon);
    });
  }

  function applyRobotimeSidebarCategoryVisibility() {
    const isAdmin = !!api.getCurrentUser?.()?.admin;
    const selectors = [
      "#d-sidebar .sidebar-sections > [data-section-name='categories']",
      ".sidebar-wrapper .sidebar-sections > [data-section-name='categories']",
      ".sidebar-custom-sections .sidebar-section[data-section-name='categories']",
    ];

    document.querySelectorAll(selectors.join(", ")).forEach((el) => {
      if (isAdmin) {
        el.style.removeProperty("display");
      } else {
        el.style.setProperty("display", "none", "important");
      }
    });
  }

  const ROBOTIME_TOPIC_LIST_NAV_PILLS =
    ".list-controls .navigation-container .nav-pills";

  let robotimeNavPillsEnhanceTimer = null;

  function scheduleRobotimeNavPillsEnhance() {
    if (robotimeNavPillsEnhanceTimer) {
      clearTimeout(robotimeNavPillsEnhanceTimer);
    }
    robotimeNavPillsEnhanceTimer = setTimeout(() => {
      robotimeNavPillsEnhanceTimer = null;
      robotimeEnhanceTopicListNavPills();
    }, 60);
  }

  function robotimeNavHrefIsNew(href) {
    const path = (href || "").split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
    return /(^|\/)new$/i.test(path);
  }

  function robotimeNavHrefIsBookmarks(href) {
    const path = (href || "").split(/[?#]/)[0].toLowerCase();
    return /(^|\/)bookmarks(\/|$)/i.test(path);
  }

  function resolveNewTopicsCountFromTracker() {
    try {
      const tts = api.container?.lookup?.("service:topic-tracking-state");
      if (!tts) {
        return null;
      }
      if (typeof tts.newTopicsCount === "number") {
        return tts.newTopicsCount;
      }
      if (typeof tts.newTopicsCount === "function") {
        const n = tts.newTopicsCount();
        return typeof n === "number" ? n : null;
      }
      if (typeof tts.countNew === "function") {
        const n = tts.countNew();
        return typeof n === "number" ? n : null;
      }
      const inner = tts.topicTrackingState;
      if (inner && typeof inner.newTopicsCount === "function") {
        const n = inner.newTopicsCount();
        return typeof n === "number" ? n : null;
      }
      if (inner && typeof inner.countNew === "function") {
        const n = inner.countNew();
        return typeof n === "number" ? n : null;
      }
    } catch (e) {
      /* topic-tracking-state API differs by Discourse version */
    }
    return null;
  }

  function parseCountFromCoreNavBadge(link) {
    const badge = link.querySelector(
      ".badge-notification, .badge-notification--new, .badge-new"
    );
    if (!badge) {
      return null;
    }
    const raw = (badge.textContent || "").replace(/[^\d]/g, "");
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }

  function robotimeBookmarksNavLabel() {
    try {
      return I18n.t("filters.bookmarks.title");
    } catch (e) {
      const lang = (document.documentElement.lang || "").toLowerCase();
      return lang.startsWith("zh") ? "书签" : "Bookmarks";
    }
  }

  function robotimeEnsureBookmarksNavItem(ul) {
    if ([...ul.querySelectorAll("li > a")].some((a) => robotimeNavHrefIsBookmarks(a.getAttribute("href")))) {
      return;
    }
    if (!api.getCurrentUser?.()) {
      return;
    }

    let li = ul.querySelector('li[data-robotime-nav="bookmarks"]');
    if (!li) {
      li = document.createElement("li");
      li.setAttribute("data-robotime-nav", "bookmarks");
      const a = document.createElement("a");
      a.href = "/bookmarks";
      a.textContent = robotimeBookmarksNavLabel();
      li.appendChild(a);
      ul.appendChild(li);
    }

    const path = window.location.pathname;
    const active = path === "/bookmarks" || path.startsWith("/bookmarks/");
    li.classList.toggle("active", active);
  }

  function robotimeFormatNewNavCount(ul) {
    const newLink = [...ul.querySelectorAll("li > a")].find((a) =>
      robotimeNavHrefIsNew(a.getAttribute("href"))
    );
    if (!newLink) {
      return;
    }

    newLink.querySelectorAll(".robotime-nav-pill__count").forEach((el) => el.remove());

    const user = api.getCurrentUser?.();
    if (!user) {
      return;
    }

    // Some Discourse versions/themes already render "New (N)" in the label text.
    // If we append another count span, it becomes duplicated: "New (N)(N)".
    const linkText = (newLink.textContent || "").replace(/\s+/g, " ").trim();
    if (/\(\d+\)\s*$/.test(linkText)) {
      return;
    }

    let count = resolveNewTopicsCountFromTracker();
    if (count === null) {
      count = parseCountFromCoreNavBadge(newLink);
    }

    if (count === null) {
      return;
    }

    newLink
      .querySelectorAll(
        ".badge-notification, .badge-notification--new, .badge-new"
      )
      .forEach((b) => {
        b.classList.add("robotime-nav-pill__core-badge--hidden");
      });

    if (count > 0) {
      const span = document.createElement("span");
      span.className = "robotime-nav-pill__count";
      span.textContent = ` (${count})`;
      newLink.appendChild(span);
    }
  }

  function robotimeEnhanceTopicListNavPills() {
    const ul = document.querySelector(ROBOTIME_TOPIC_LIST_NAV_PILLS);
    if (!ul) {
      return;
    }
    robotimeEnsureBookmarksNavItem(ul);
    robotimeFormatNewNavCount(ul);
  }

  function setupRobotimeNavPillsMutationObserverOnce() {
    if (window.__robotimeNavPillsMO) {
      return;
    }
    window.__robotimeNavPillsMO = true;
    const root = document.querySelector("#main") || document.body;
    const mo = new MutationObserver(() => scheduleRobotimeNavPillsEnhance());
    mo.observe(root, { childList: true, subtree: true });
  }

  function setupRobotimeNavPillsTrackingHookOnce() {
    if (window.__robotimeNavPillsTrackingHook) {
      return;
    }
    window.__robotimeNavPillsTrackingHook = true;
    try {
      const tts = api.container?.lookup?.("service:topic-tracking-state");
      if (!tts) {
        return;
      }
      const run = () => scheduleRobotimeNavPillsEnhance();
      if (typeof tts.onStateChange === "function") {
        tts.onStateChange(run);
      } else if (typeof tts.addOnStateChangeCallback === "function") {
        tts.addOnStateChangeCallback(run);
      }
    } catch (e) {
      /* optional hook */
    }
  }

  function runRobotimeLayoutPass() {
    applyRobotimeHeaderLogo();
    updateRobotimeHeaderOffset();
    ensureSidebarNewTopicLabel();
    applyRobotimeSidebarCategoryVisibility();
    injectRobotimeSidebarMenuIcons();
    scheduleRobotimeTopicThumbnails();
    scheduleRobotimeTopicMasonry();
    scheduleRobotimeNavPillsEnhance();
  }

  /**
   * Topic list cover: intrinsic w/h > this → 1:1 crop, else 3:4.
   * No image / load error → square placeholder.
   */
  const ROBOTIME_THUMB_WH_RATIO_SPLIT = 0.85;

  let robotimeThumbApplyTimer = null;
  let robotimeMasonryApplyTimer = null;

  function scheduleRobotimeTopicThumbnails() {
    if (robotimeThumbApplyTimer) {
      clearTimeout(robotimeThumbApplyTimer);
    }
    robotimeThumbApplyTimer = setTimeout(() => {
      robotimeThumbApplyTimer = null;
      applyRobotimeTopicListThumbnails();
    }, 80);
  }

  function robotimeMasonryColumns() {
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    if (w < 768) return 1;
    if (w < 1200) return 2;
    return 3;
  }

  function clearRobotimeMasonryStyles(tbody, rows) {
    tbody.classList.remove("robotime-topic-list--js-masonry");
    tbody.style.removeProperty("height");
    rows.forEach((row) => {
      row.style.removeProperty("position");
      row.style.removeProperty("left");
      row.style.removeProperty("top");
      row.style.removeProperty("width");
      row.style.removeProperty("margin");
      row.style.removeProperty("transform");
      row.style.removeProperty("break-inside");
      row.style.removeProperty("page-break-inside");
    });
  }

  function applyRobotimeTopicListMasonry() {
    document.querySelectorAll(".topic-list tbody").forEach((tbody) => {
      const rows = [...tbody.querySelectorAll(":scope > tr.topic-list-item")];
      if (!rows.length) {
        tbody.classList.remove("robotime-topic-list--js-masonry");
        tbody.style.removeProperty("height");
        return;
      }

      const cols = robotimeMasonryColumns();
      if (cols <= 1) {
        clearRobotimeMasonryStyles(tbody, rows);
        return;
      }

      const gap = 20;
      const width = tbody.clientWidth;
      if (!width || width <= gap * (cols - 1)) {
        return;
      }

      const colWidth = (width - gap * (cols - 1)) / cols;
      const colHeights = new Array(cols).fill(0);
      tbody.classList.add("robotime-topic-list--js-masonry");

      rows.forEach((row) => {
        row.style.position = "absolute";
        row.style.left = "0";
        row.style.top = "0";
        row.style.width = `${colWidth}px`;
        row.style.margin = "0";
        row.style.breakInside = "auto";
        row.style.pageBreakInside = "auto";

        let col = 0;
        for (let i = 1; i < cols; i += 1) {
          if (colHeights[i] < colHeights[col]) {
            col = i;
          }
        }

        const x = col * (colWidth + gap);
        const y = colHeights[col];
        row.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        colHeights[col] = y + row.offsetHeight + gap;
      });

      const maxHeight = Math.max(...colHeights, 0);
      tbody.style.height = `${Math.max(0, Math.round(maxHeight - gap))}px`;
    });
  }

  function scheduleRobotimeTopicMasonry() {
    if (robotimeMasonryApplyTimer) {
      clearTimeout(robotimeMasonryApplyTimer);
    }
    robotimeMasonryApplyTimer = setTimeout(() => {
      robotimeMasonryApplyTimer = null;
      applyRobotimeTopicListMasonry();
    }, 90);
  }

  function setupRobotimeMasonryResizeHookOnce() {
    if (window.__robotimeMasonryResizeHook) {
      return;
    }
    window.__robotimeMasonryResizeHook = true;
    window.addEventListener("resize", scheduleRobotimeTopicMasonry, {
      passive: true,
    });
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

  /** Custom list thumbnail `<a>` (direct child of `tr`) — same ratio rules as `td.topic-thumbnails`. */
  function robotimeProcessRobotimeListThumbnailAnchor(anchor) {
    robotimeClearThumbCellDataset(anchor);
    const img = anchor.querySelector("img");
    if (!img) {
      robotimeSetTopicThumbPlaceholder(anchor, "square");
      return;
    }
    const src = (img.getAttribute("src") || "").trim();
    if (!src) {
      robotimeSetTopicThumbPlaceholder(anchor, "square");
      return;
    }

    const finalize = () => {
      if (img.naturalWidth === 0 && img.naturalHeight === 0) {
        robotimeSetTopicThumbPlaceholder(anchor, "square");
        return;
      }
      robotimeApplyTopicThumbRatio(anchor, img.naturalWidth, img.naturalHeight);
    };

    if (img.complete) {
      finalize();
    } else {
      img.addEventListener("load", finalize, { once: true });
      img.addEventListener(
        "error",
        () => {
          robotimeSetTopicThumbPlaceholder(anchor, "square");
        },
        { once: true }
      );
    }
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

  /** Stable pastel index from topic id (0..ROBOTIME_COVER_TINT_COUNT-1). */
  const ROBOTIME_COVER_TINT_COUNT = 8;

  function robotimeTopicCoverTintFromId(topicId) {
    const id = parseInt(String(topicId || ""), 10);
    if (!Number.isFinite(id) || id < 1) {
      return 0;
    }
    return Math.abs(id) % ROBOTIME_COVER_TINT_COUNT;
  }

  function markRobotimeTopicRowCoverLayout() {
    document.querySelectorAll("tr.topic-list-item").forEach((row) => {
      const topicId = row.getAttribute("data-topic-id");
      row.setAttribute(
        "data-robotime-cover-tint",
        String(robotimeTopicCoverTintFromId(topicId))
      );

      const titleEl = row.querySelector(
        ".main-link .link-top-line .title, .main-link a.title, .main-link .topic-link"
      );
      const titleText = (titleEl?.textContent || "").trim();
      if (titleText) {
        row.setAttribute("data-robotime-topic-title", titleText);
      } else {
        row.removeAttribute("data-robotime-topic-title");
      }

      row
        .querySelectorAll(
          'td.topic-thumbnails[data-robotime-thumb-state="placeholder"], ' +
            'a.robotime-topic-list-thumbnail-link[data-robotime-thumb-state="placeholder"]'
        )
        .forEach((el) => {
          if (titleText) {
            el.setAttribute("data-robotime-topic-title", titleText);
          } else {
            el.removeAttribute("data-robotime-topic-title");
          }
        });

      if (
        row.querySelector("td.topic-thumbnails") ||
        row.querySelector(":scope > .robotime-topic-list-thumbnail-link")
      ) {
        row.setAttribute("data-robotime-topic-row", "has-thumb");
      } else {
        row.setAttribute("data-robotime-topic-row", "no-cover");
      }
    });
  }

  function decorateRobotimeTopicCardThumbnails() {
    document.querySelectorAll(".robotime-topic-card__thumbnail").forEach((wrap) => {
      let topicId = null;
      const row = wrap.closest("tr.topic-list-item");
      if (row) {
        topicId = row.getAttribute("data-topic-id");
      }
      if (!topicId) {
        const host =
          wrap.closest("a.robotime-topic-card") ||
          wrap.closest(".robotime-topic-card") ||
          wrap.closest("[data-topic-id]");
        topicId = host?.getAttribute?.("data-topic-id") || null;
      }
      wrap.setAttribute(
        "data-robotime-cover-tint",
        String(robotimeTopicCoverTintFromId(topicId))
      );

      if (wrap.getAttribute("data-robotime-thumb-state") === "placeholder") {
        let t = "";
        const card = wrap.closest("a.robotime-topic-card, .robotime-topic-card");
        const titleEl = card?.querySelector?.(".robotime-topic-card__title");
        t = (titleEl?.textContent || "").trim();
        if (!t && row) {
          t = (
            row.querySelector(
              ".main-link .link-top-line .title, .main-link a.title, .main-link .raw-topic-link"
            )?.textContent || ""
          ).trim();
        }
        if (t) {
          wrap.setAttribute("data-robotime-topic-title", t);
        } else {
          wrap.removeAttribute("data-robotime-topic-title");
        }
      } else {
        wrap.removeAttribute("data-robotime-topic-title");
      }
    });
  }

  function applyRobotimeTopicListThumbnails() {
    document.querySelectorAll("tr.topic-list-item td.topic-thumbnails").forEach((cell) => {
      robotimeProcessThumbnailCell(cell);
    });
    document
      .querySelectorAll("tr.topic-list-item > a.robotime-topic-list-thumbnail-link")
      .forEach((anchor) => {
        robotimeProcessRobotimeListThumbnailAnchor(anchor);
      });
    document.querySelectorAll(".robotime-topic-card__thumbnail").forEach((wrap) => {
      robotimeProcessCustomTopicThumb(wrap);
    });
    markRobotimeTopicRowCoverLayout();
    decorateRobotimeTopicCardThumbnails();
    applyRobotimeMobileTopicCards();
    scheduleRobotimeTopicMasonry();
  }

  function isMobileViewport() {
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    return w < 768;
  }

  function extractMobileTopicImage(root) {
    const img = root.querySelector(
      [
        "td.topic-thumbnails img",
        "img.topic-list-thumbnail",
        "img.topic-thumbnail",
        ".topic-thumbnail img",
        ".cooked img",
        "img[data-original]",
        "img[data-src]",
        "img:not(.avatar):not(.emoji):not(.d-icon):not([class*='avatar'])"
      ].join(",")
    );
    const src = (
      img?.getAttribute("src") ||
      img?.getAttribute("data-src") ||
      img?.getAttribute("data-original") ||
      img?.currentSrc ||
      ""
    ).trim();
    if (src) {
      return src;
    }

    // Fallback: some mobile lists render cover as background-image.
    const bgHost =
      root.querySelector("td.topic-thumbnails a, td.topic-thumbnails .topic-thumbnail") ||
      root.querySelector(".topic-thumbnail, .topic-list-thumbnail");
    if (bgHost) {
      const bg = window.getComputedStyle(bgHost).backgroundImage || "";
      const m = bg.match(/url\((['"]?)(.*?)\1\)/i);
      if (m?.[2]) {
        return m[2].trim();
      }
    }
    return src || "";
  }

  function extractMobileTopicLink(cell) {
    const a = cell.querySelector(
      "a.title, a.raw-topic-link, .link-top-line a, a[href*='/t/']"
    );
    return (a?.getAttribute("href") || "").trim();
  }

  function extractMobileTopicTitle(cell) {
    const t = cell.querySelector(".title, .raw-topic-link, .link-top-line a");
    return (t?.textContent || "").trim();
  }

  function extractMobileTopicId(cell, href) {
    const row = cell.closest("tr");
    const fromRow = parseInt(row?.getAttribute("data-topic-id") || "", 10);
    if (Number.isFinite(fromRow) && fromRow > 0) {
      return fromRow;
    }
    const m = String(href || "").match(/\/t\/[^/]*\/(\d+)/);
    const fromHref = parseInt(m?.[1] || "", 10);
    if (Number.isFinite(fromHref) && fromHref > 0) {
      return fromHref;
    }
    return 0;
  }

  function applyRobotimeMobileTopicCards() {
    if (!isMobileViewport()) {
      return;
    }

    document.querySelectorAll("tr").forEach((row) => {
      const cell = row.querySelector("td.topic-list-data, td.main-link");
      if (!cell || !cell.querySelector(".title, .raw-topic-link, .link-top-line a")) {
        return;
      }

      const href = extractMobileTopicLink(cell);
      if (!href) {
        return;
      }

      row.classList.add("robotime-mobile-topic-row-card");
      const title = extractMobileTopicTitle(cell);
      const img = extractMobileTopicImage(row);
      const topicId = extractMobileTopicId(cell, href);
      const hasThumbCell = !!row.querySelector("td.topic-thumbnails");

      let cover = cell.querySelector(".robotime-mobile-topic-card__cover");
      if (!cover) {
        cover = document.createElement("a");
        cover.className = "robotime-mobile-topic-card__cover";
        cover.setAttribute("aria-hidden", "true");
        cell.prepend(cover);
      }

      cover.setAttribute("href", href);
      if (img && hasThumbCell) {
        // Row already has native thumbnail cell: keep it as the real cover.
        cover.remove();
        return;
      }

      if (img) {
        cover.style.setProperty("background-image", `url('${img}')`);
        cover.classList.remove("is-placeholder");
        cover.style.removeProperty("--robotime-mobile-cover-bg");
        cover.style.removeProperty("--robotime-mobile-cover-fg");
      } else {
        cover.style.removeProperty("background-image");
        cover.classList.add("is-placeholder");
        const tint = robotimeTopicCoverTintFromId(topicId);
        cover.setAttribute("data-robotime-cover-tint", String(tint));
        const palette = [
          ["#ede7f6", "#4a4459"],
          ["#e3f2fd", "#37474f"],
          ["#e8f5e9", "#2e4a32"],
          ["#fff3e0", "#5d4037"],
          ["#fce4ec", "#6a1b3d"],
          ["#e0f7fa", "#006064"],
          ["#f3e5f5", "#4a148c"],
          ["#efebe9", "#3e2723"],
        ];
        const pair = palette[tint] || palette[0];
        cover.style.setProperty("--robotime-mobile-cover-bg", pair[0]);
        cover.style.setProperty("--robotime-mobile-cover-fg", pair[1]);
        if (title) {
          cover.setAttribute("data-robotime-topic-title", title);
        } else {
          cover.removeAttribute("data-robotime-topic-title");
        }
      }
    });
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
      setupRobotimeHeaderOffsetObserverOnce();
      setupRobotimeTopicThumbnailObserverOnce();
      setupRobotimeMasonryResizeHookOnce();
      setupRobotimeNavPillsMutationObserverOnce();
      setupRobotimeNavPillsTrackingHookOnce();
      runRobotimeLayoutPass();
      requestAnimationFrame(runRobotimeLayoutPass);

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

      const themeCfg = buildRobotimeThemeConfig();
      applyHubConfig(mergeHubWithTheme({}, themeCfg));

      fetch("/hub-config.json")
        .then((r) => {
          if (!r.ok) {
            throw new Error(String(r.status));
          }
          return r.json();
        })
        .then((remote) => {
          applyHubConfig(mergeHubWithTheme(remote || {}, themeCfg));
        })
        .catch(() => {
          console.warn(
            "[Robotime Theme] hub-config.json not available — using theme settings only for nav, tags, sidebar copy; carousel/widgets empty."
          );
          ensureSidebarNewTopicLabel();
        });
    });
  });
});
