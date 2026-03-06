(() => {
  function initCollapsibleNav() {
    const sidebar = document.querySelector(".sphinxsidebar");
    if (!sidebar) return;

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

      // Default: collapse everything, but expand the current page path.
      const hasCurrentDescendant = !!li.querySelector("li.current");
      const isCurrent = li.classList.contains("current") || childUl.classList.contains("current");
      const shouldExpand = isCurrent || hasCurrentDescendant;
      li.classList.toggle("is-expanded", shouldExpand);
      li.classList.toggle("is-collapsed", !shouldExpand);
      btn.setAttribute("aria-expanded", shouldExpand ? "true" : "false");

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const collapsed = li.classList.toggle("is-collapsed");
        li.classList.toggle("is-expanded", !collapsed);
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      });

      li.insertBefore(btn, link);
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

