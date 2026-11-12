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

function openNav() {
  root.classList.add("nav-open");
  scrim.hidden = false;
  menuButton?.setAttribute("aria-expanded", "true");
  sidebar.querySelector("a, button")?.focus();
}

function closeNav() {
  if (!root.classList.contains("nav-open")) return;
  root.classList.remove("nav-open");
  scrim.hidden = true;
  menuButton?.setAttribute("aria-expanded", "false");
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

// Highlight the section being read in every contents list on the page
(function scrollSpy() {
  const links = [...document.querySelectorAll("#TableOfContents a[href^='#']")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map();
  links.forEach((a) => {
    const id = decodeURIComponent(a.hash.slice(1));
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(a);
  });
  const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      let current = headings.find((h) => visible.has(h));
      if (!current) {
        // Between headings: keep the last one above the viewport
        current = [...headings].reverse().find((h) => h.getBoundingClientRect().top < 0) || headings[0];
      }
      links.forEach((a) => a.classList.remove("active"));
      (byId.get(current.id) || []).forEach((a) => a.classList.add("active"));
    },
    { rootMargin: "0px 0px -65% 0px" }
  );
  headings.forEach((h) => observer.observe(h));
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
    searchResults.innerHTML = `<li class="r-empty">No posts match “${escapeHtml(searchInput.value.trim())}”.</li>`;
  } else {
    searchResults.innerHTML = top
      .map(
        ({ item }, i) =>
          `<li><a id="sr-${i}" role="option" aria-selected="false" href="${escapeHtml(item.url)}">` +
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
      root.classList.remove("search-open");
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search")) searchResults.hidden = true;
  });
}

function openSearch() {
  root.classList.toggle("search-open");
  if (root.classList.contains("search-open")) searchInput.focus();
}

// ------------------------------------------------------------- image zoom

const lightbox = document.querySelector(".lightbox");
function zoom(img) {
  if (!lightbox || typeof lightbox.showModal !== "function") return;
  const big = lightbox.querySelector("img");
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  lightbox.showModal();
}
lightbox?.addEventListener("click", () => lightbox.close());

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
    }
  }
  const img = e.target.closest(".prose img");
  if (img && !img.closest("a")) zoom(img);
  if (e.target.closest(".toc-inline #TableOfContents a")) e.target.closest("details").open = false;
  if (mobile.matches && e.target.closest(".sidebar a")) closeNav();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if (e.key === "/" && !typing && searchInput) {
    e.preventDefault();
    if (mobile.matches) root.classList.add("search-open");
    searchInput.focus();
  }
});
