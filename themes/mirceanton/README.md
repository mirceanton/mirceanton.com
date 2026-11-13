# mirceanton theme

The site's own Hugo theme, built from the mirceanton channel brand kit (Inter + DejaVu Sans Mono Bold, Ink/Sky/Mint palette, 2px outlines and hard offset shadows). It replaced the Chirpy fork. Needs Hugo extended ≥ 0.146 (new template layout); the site pins the exact version in `.mise.toml`.

## Layout

- **Sidebar** (Ink): avatar, wordmark, terminal tagline, `menus.main`, social links. Collapses to an icon rail on desktop and becomes a drawer below 860px.
- **Home**: the newest post as a large featured card, then the rest as cards (text left, thumbnail right), with a Recently Updated / Trending Tags panel on the right.
- **Post**: one sheet with title, meta, cover, content, tags, older/newer links and giscus. A collapsible Contents panel sits on the right (an inline dropdown under 1100px). On phones the post is full screen with no sheet.
- Sidebar, contents and theme (light/dark) state are kept in `localStorage` and applied before first paint.

## Files

| Path | What |
| --- | --- |
| `layouts/` | Templates (`baseof`, `home`, `page`, `section`, `taxonomy`, `term`, `archives`, `404`, `home.json` search index) |
| `layouts/_partials/` | Sidebar, bars, cards, panel, head/SEO, icons, cover image helper |
| `layouts/_markup/` | Render hooks: code blocks (terminal window + copy + `file=` label), blockquotes (callouts), headings (anchors), images (bundle/assets lookup, captions), tables |
| `assets/css/main.css` | All styles; tokens at the top. Run through `ExecuteAsTemplate` for font URLs |
| `assets/js/main.js` | Theme, sidebar, contents, scroll-spy, copy, search, lightbox |
| `assets/fonts/` | Subset woff2 fonts |
| `scripts/subset-fonts.sh` | Rebuilds the fonts from the brand kit's TTFs |

## Site params it reads

`params.mainSections`, `params.description`, `params.avatar`, `params.tagline`, `params.images`, `params.toc`, `params.search.enable` / `params.search.maxResults`, `params.social.*`, `params.comments` (giscus, with `theme` / `theme_dark`, `mapping` and `strict`; a post can pin its thread with `discussion: <number>` in front matter, or turn comments off with `comments: false`), `params.analytics.umami.*`, `menus.main` (with Font Awesome names in `pre`, mapped to built-in SVG icons in `_partials/icon.html`).

## Fonts

```bash
themes/mirceanton/scripts/subset-fonts.sh /path/to/YouTube/brand/fonts
```

Subsets to Latin + Latin Extended-A (Romanian ș/ț included). Needs `uvx` (fontTools).
