(() => {
  function initCollapsibleNav() {
    const sidebar = document.querySelector(".sphinxsidebar");
    if (!sidebar) return;

    // Determine whether this is a full reload. On reload we reset nav state.
    let navType = "navigate";
    try {
      const navEntry = performance.getEntriesByType("navigation")[0];
      if (navEntry && navEntry.type) {
        navType = navEntry.type;
      }
    } catch {
      // ignore if not supported
    }

    const STORAGE_KEY = "cxfel-nav-open";
    let openIds = [];
    if (navType !== "reload") {
      try {
        openIds = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
      } catch {
        openIds = [];
      }
    } else {
      // Hard refresh: reset to default state
      sessionStorage.removeItem(STORAGE_KEY);
    }

    const openSet = new Set(openIds);

    // Add toggle buttons for any <li> that contains a nested <ul>.
    const items = sidebar.querySelectorAll("li");
    for (const li of items) {
      // Avoid :scope selectors for broad browser compatibility.
      const childUl = Array.from(li.children).find((el) => el.tagName === "UL");
      const link = Array.from(li.children).find((el) => el.tagName === "A");
      if (!childUl || !link) continue;

      // Avoid duplicating if Sphinx hot reload re-inserts.
      if (Array.from(li.children).some((el) => el.tagName === "BUTTON" && el.classList.contains("toctree-toggle"))) {
        continue;
      }

      const btn = document.createElement("button");
      btn.className = "toctree-toggle";
      btn.type = "button";
      btn.setAttribute("aria-label", "Toggle section");

      // Use link href (path only) as a stable ID for this branch.
      let navId = null;
      try {
        const url = new URL(link.getAttribute("href"), window.location.href);
        navId = url.pathname.replace(/\/index\.html?$/, "/");
      } catch {
        navId = link.getAttribute("href") || "";
      }

      const hasCurrentDescendant = !!li.querySelector("li.current");
      const isCurrent =
        li.classList.contains("current") ||
        childUl.classList.contains("current");

      // Default expansion rules:
      // - If we have stored state (from previous navigation), respect it.
      // - Always expand the branch for the current page/path.
      const storedOpen = navId && openSet.has(navId);
      const shouldExpand = isCurrent || hasCurrentDescendant || storedOpen;

      // So that "current" stays open when we navigate away, add it to the set and persist later.
      if (shouldExpand && navId) openSet.add(navId);

      li.classList.toggle("is-expanded", shouldExpand);
      li.classList.toggle("is-collapsed", !shouldExpand);
      btn.setAttribute("aria-expanded", shouldExpand ? "true" : "false");

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const collapsed = li.classList.toggle("is-collapsed");
        const nowExpanded = !collapsed;
        li.classList.toggle("is-expanded", nowExpanded);
        btn.setAttribute("aria-expanded", nowExpanded ? "true" : "false");

        // Persist expanded/collapsed state across page navigations (but not reload).
        if (navId) {
          if (nowExpanded) {
            openSet.add(navId);
          } else {
            openSet.delete(navId);
          }
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(openSet)));
          } catch {
            // ignore storage errors
          }
        }
      });

      li.insertBefore(btn, link);
    }

    // Persist the full open set so when user navigates to another tab, previously opened branches stay open.
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(openSet)));
    } catch {
      // ignore storage errors
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCollapsibleNav);
  } else {
    initCollapsibleNav();
  }

  // Belt-and-suspenders: if something delays sidebar rendering.
  window.addEventListener("load", initCollapsibleNav, { once: true });
})();

