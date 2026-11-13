// mirceanton theme behaviour. Plain browser JS, no dependencies.
// The inline script in head.html applies saved theme, sidebar and contents state before first paint.

const root = document.documentElement;
const mobile = window.matchMedia("(max-width: 860px)");

function store(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch (e) {
    /* storage can be blocked; the toggle still works for this page view */
  }
}

// ------------------------------------------------------------- theme

function currentTheme() {
  return root.dataset.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function setTheme(theme) {
  root.dataset.theme = theme;
  store("theme", theme);
  const frame = document.querySelector("iframe.giscus-frame");
  if (frame) {
    const holder = document.querySelector("[data-giscus-light]");
    const giscusTheme = theme === "dark" ? holder.dataset.giscusDark : holder.dataset.giscusLight;
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme } } }, "https://giscus.app");
  }
}

// ------------------------------------------------------------- sidebar and drawer

const sidebar = document.getElementById("sidebar");
const scrim = document.querySelector(".scrim");
const menuButton = document.querySelector('[data-action="nav-open"]');
const sideToggle = document.querySelector('[data-action="sidebar"]');

function syncSidebarLabels() {
  if (!sideToggle) return;
  const collapsed = root.dataset.sidebar === "collapsed";
  if (mobile.matches) {
    sideToggle.setAttribute("aria-label", "Close menu");
    sideToggle.removeAttribute("aria-expanded");
  } else {
    sideToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    sideToggle.setAttribute("aria-expanded", String(!collapsed));
  }
}

// On phones the open drawer is a modal dialog: the page behind it is inert, so focus and screen
// readers stay inside until it closes.
const behindDrawer = document.querySelectorAll(".main, .skip");

function openNav() {
  root.classList.add("nav-open");
  scrim.hidden = false;
  menuButton?.setAttribute("aria-expanded", "true");
  sidebar.setAttribute("role", "dialog");
  sidebar.setAttribute("aria-modal", "true");
  sidebar.setAttribute("aria-label", "Menu");
  behindDrawer.forEach((el) => (el.inert = true));
  sidebar.querySelector("a, button")?.focus();
}

function closeNav() {
  if (!root.classList.contains("nav-open")) return;
  root.classList.remove("nav-open");
  scrim.hidden = true;
  menuButton?.setAttribute("aria-expanded", "false");
  sidebar.setAttribute("role", "complementary");
  sidebar.removeAttribute("aria-modal");
  sidebar.setAttribute("aria-label", "Site");
  behindDrawer.forEach((el) => (el.inert = false));
  menuButton?.focus();
}

function toggleSidebar() {
  if (mobile.matches) return closeNav();
  const collapsed = root.dataset.sidebar !== "collapsed";
  if (collapsed) root.dataset.sidebar = "collapsed";
  else delete root.dataset.sidebar;
  store("sidebar", collapsed ? "collapsed" : null);
  syncSidebarLabels();
}

mobile.addEventListener("change", () => {
  closeNav();
  syncSidebarLabels();
});
syncSidebarLabels();

// ------------------------------------------------------------- table of contents

function toggleToc() {
  const collapsed = root.dataset.toc !== "collapsed";
  if (collapsed) root.dataset.toc = "collapsed";
  else delete root.dataset.toc;
  store("toc", collapsed ? "collapsed" : null);
  document.querySelectorAll('[data-action="toc"]').forEach((b) => b.setAttribute("aria-expanded", String(!collapsed)));
  const target = document.querySelector(collapsed ? ".toc-reopen" : ".toc-open button");
  target?.focus();
}

// Highlight the section being read in every contents list on the page: the last heading that has
// passed the top third of the screen. Recomputed from positions on scroll, so jumps (Home, End,
// back/forward) can't leave a stale highlight.
(function scrollSpy() {
  const links = [...document.querySelectorAll("#TableOfContents a[href^='#']")];
  if (!links.length) return;
  const byId = new Map();
  links.forEach((a) => {
    const id = decodeURIComponent(a.hash.slice(1));
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(a);
  });
  const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!headings.length) return;
  let active = null;
  let queued = false;
  function update() {
    queued = false;
    const line = window.innerHeight * 0.35;
    let current = headings[0];
    for (const h of headings) {
      if (h.getBoundingClientRect().top > line) break;
      current = h;
    }
    // At the very bottom the last sections may never reach the line
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      const last = headings[headings.length - 1];
      if (last.getBoundingClientRect().top < window.innerHeight) current = last;
    }
    if (current === active) return;
    active = current;
    links.forEach((a) => a.classList.remove("active"));
    (byId.get(current.id) || []).forEach((a) => a.classList.add("active"));
    follow();
  }
  // A long contents panel scrolls on its own; keep the highlighted entry inside it.
  const panel = document.querySelector(".toc-panel");
  function follow() {
    const link = panel?.querySelector("a.active");
    if (!link || panel.scrollHeight <= panel.clientHeight) return;
    const box = panel.getBoundingClientRect();
    const at = link.getBoundingClientRect();
    if (at.top < box.top + 8 || at.bottom > box.bottom - 8) {
      panel.scrollTop += at.top - box.top - (panel.clientHeight - at.height) / 2;
    }
  }
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
})();

// ------------------------------------------------------------- code copy

async function copyCode(button) {
  const block = button.closest(".code");
  const codes = block.querySelectorAll("pre code");
  const code = codes[codes.length - 1];
  const text = code.innerText.replace(/\n$/, "");
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  const label = button.querySelector("span");
  button.classList.add("copied");
  label.textContent = "copied";
  setTimeout(() => {
    button.classList.remove("copied");
    label.textContent = "copy";
  }, 1600);
}

// ------------------------------------------------------------- search

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
let index = null;
let indexPromise = null;
let selected = -1;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(searchInput.dataset.index)
      .then((r) => r.json())
      .then((data) => (index = data))
      .catch(() => (index = []));
  }
  return indexPromise;
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function snippet(text, terms) {
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of terms) {
    at = lower.indexOf(t);
    if (at >= 0) break;
  }
  if (at < 0) return text.slice(0, 140) + (text.length > 140 ? "…" : "");
  const start = Math.max(0, at - 50);
  return (start > 0 ? "…" : "") + text.slice(start, start + 160) + (start + 160 < text.length ? "…" : "");
}

function highlight(text, terms) {
  const safe = escapeHtml(text);
  if (!terms.length) return safe;
  const re = new RegExp("(" + terms.map((t) => escapeRe(escapeHtml(t))).join("|") + ")", "gi");
  return safe.replace(re, "<mark>$1</mark>");
}

function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  selected = -1;
  if (!query) {
    searchResults.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    return;
  }
  const terms = query.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const item of index || []) {
    const title = item.title.toLowerCase();
    const meta = (item.tags || []).concat(item.categories || []).join(" ").toLowerCase();
    const body = (item.description + " " + item.content).toLowerCase();
    let score = 0;
    let all = true;
    for (const t of terms) {
      const inTitle = title.includes(t);
      const inMeta = meta.includes(t);
      const inBody = body.includes(t);
      if (!inTitle && !inMeta && !inBody) {
        all = false;
        break;
      }
      score += (inTitle ? 10 : 0) + (inMeta ? 5 : 0) + (inBody ? 1 : 0);
    }
    if (all) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date));
  const top = scored.slice(0, 8);
  if (!top.length) {
    searchResults.innerHTML = `<li class="r-empty" role="option" aria-disabled="true" aria-selected="false">No posts match “${escapeHtml(searchInput.value.trim())}”.</li>`;
  } else {
    searchResults.innerHTML = top
      .map(
        ({ item }, i) =>
          `<li role="presentation"><a id="sr-${i}" role="option" aria-selected="false" href="${escapeHtml(item.url)}">` +
          `<span class="r-title">${highlight(item.title, terms)}</span>` +
          `<span class="r-snip">${highlight(snippet(item.description || item.content, terms), terms)}</span></a></li>`
      )
      .join("");
  }
  searchResults.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}

function moveSelection(step) {
  const options = [...searchResults.querySelectorAll("a")];
  if (!options.length) return;
  selected = (selected + step + options.length) % options.length;
  options.forEach((o, i) => o.setAttribute("aria-selected", String(i === selected)));
  searchInput.setAttribute("aria-activedescendant", options[selected].id);
  options[selected].scrollIntoView({ block: "nearest" });
}

if (searchInput) {
  searchInput.addEventListener("focus", loadIndex);
  searchInput.addEventListener("input", () => loadIndex().then(runSearch));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === "Enter") {
      const options = searchResults.querySelectorAll("a");
      const target = options[Math.max(selected, 0)];
      if (target) window.location.href = target.href;
    } else if (e.key === "Escape") {
      searchInput.value = "";
      runSearch();
      searchInput.blur();
      setSearchRow(false);
    }
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest(".search")) return;
    searchResults.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    // On phones a tap anywhere else also puts the search row away
    if (!e.target.closest('[data-action^="search"]')) setSearchRow(false);
  });
}

// The search row on phones (the desktop bar always shows it)
function setSearchRow(open) {
  root.classList.toggle("search-open", open);
  document.querySelector('[data-action="search-open"]')?.setAttribute("aria-expanded", String(open));
}

function openSearch() {
  setSearchRow(!root.classList.contains("search-open"));
  // preventScroll: the row is sticky and already in view, so the page must stay where it is
  if (root.classList.contains("search-open")) searchInput.focus({ preventScroll: true });
}

// ------------------------------------------------------------- image zoom

const lightbox = document.querySelector(".lightbox");
function zoom(img) {
  if (!lightbox || typeof lightbox.showModal !== "function") return;
  const big = lightbox.querySelector("img");
  big.src = img.dataset.zoom || img.currentSrc || img.src;
  big.alt = img.alt;
  lightbox.showModal();
}
lightbox?.addEventListener("click", () => lightbox.close());

// Content images open the zoom view from the keyboard too (Enter or Space; Escape closes it)
const zoomable = (img) => !img.closest("a");
document.querySelectorAll(".prose img").forEach((img) => {
  if (!zoomable(img) || !lightbox) return;
  img.tabIndex = 0;
  img.setAttribute("role", "button");
  img.setAttribute("aria-label", img.alt ? `Zoom image: ${img.alt}` : "Zoom image");
});
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".prose img[role='button']")) {
    e.preventDefault();
    zoom(e.target);
  }
});

// ------------------------------------------------------------- sideways scrollers

// Code blocks and tables that overflow can be scrolled with the arrow keys once focused. Only the
// ones that actually overflow become tab stops, so a post full of short snippets adds none.
(function scrollers() {
  const boxes = [...document.querySelectorAll(".code .highlight, .code > pre, .table-wrap")];
  if (!boxes.length) return;
  function sync() {
    boxes.forEach((box) => {
      const overflows = box.scrollWidth > box.clientWidth + 1;
      if (overflows === box.hasAttribute("tabindex")) return;
      if (overflows) {
        const name = box.classList.contains("table-wrap") ? "Table" : `Code: ${box.closest(".code")?.querySelector(".code-label")?.textContent || "snippet"}`;
        box.tabIndex = 0;
        box.setAttribute("role", "group"); // not "region": that is a landmark, and a post can have dozens
        box.setAttribute("aria-label", `${name} (scrolls sideways)`);
      } else {
        box.removeAttribute("tabindex");
        box.removeAttribute("role");
        box.removeAttribute("aria-label");
      }
    });
  }
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(sync, 150);
  });
  window.addEventListener("load", sync);
  sync();
})();

// ------------------------------------------------------------- clips

// Looping clips (the video shortcode) play only while on screen and load nothing before that.
// With reduced motion they stay paused and keep their controls.
(function clips() {
  const videos = document.querySelectorAll("video.clip");
  if (!videos.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.play().catch(() => (e.target.controls = true));
        else e.target.pause();
      });
    },
    { threshold: 0.25 }
  );
  videos.forEach((v) => {
    v.controls = false;
    observer.observe(v);
  });
})();

// ------------------------------------------------------------- image placeholders

// Images carry a tiny blurred copy as a background (data-lqip). Drop it once the real image is in,
// so it never shows through transparent PNGs. Load events don't bubble, hence the capture listener.
const lqipDone = (img) => { if (img.dataset.lqip !== "done" && img.complete && img.naturalWidth) img.dataset.lqip = "done"; };
document.addEventListener("load", (e) => { if (e.target.dataset?.lqip !== undefined) lqipDone(e.target); }, true);
document.querySelectorAll("img[data-lqip]").forEach(lqipDone);

// ------------------------------------------------------------- wiring

document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]");
  if (action) {
    switch (action.dataset.action) {
      case "theme":
        return setTheme(currentTheme() === "dark" ? "light" : "dark");
      case "sidebar":
        return toggleSidebar();
      case "nav-open":
        return openNav();
      case "nav-close":
        return closeNav();
      case "toc":
        return toggleToc();
      case "copy":
        return copyCode(action);
      case "search-open":
        return openSearch();
      case "search-focus":
        e.preventDefault();
        if (mobile.matches) setSearchRow(true);
        return searchInput?.focus({ preventScroll: mobile.matches });
    }
  }
  const img = e.target.closest(".prose img");
  if (img && zoomable(img)) zoom(img);
  if (e.target.closest(".toc-inline #TableOfContents a")) e.target.closest("details").open = false;
  if (mobile.matches && e.target.closest(".sidebar a")) closeNav();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if (e.key === "/" && !typing && searchInput) {
    e.preventDefault();
    if (mobile.matches) setSearchRow(true);
    searchInput.focus({ preventScroll: mobile.matches });
  }
});
