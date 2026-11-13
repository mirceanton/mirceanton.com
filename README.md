# mirceanton.com

My personal website, built with Hugo and hosted on GitHub pages.

## Tech Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) (extended)
- **Theme**: `mirceanton`, a custom theme in [`themes/mirceanton/`](themes/mirceanton/) built on the channel's brand kit
- **Styling**: Plain CSS, bundled and fingerprinted by Hugo Pipes (no Sass, no Node)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Prerequisites

This project uses [mise](https://mise.jdx.dev/) for tool version management. Install mise and run:

```bash
mise install
```

For image conversion scripts:

```bash
sudo apt install -y imagemagick webp
```

## Local Development

```bash
# Start the development server (mise pins Hugo, so use the pinned version)
mise exec -- hugo server -D

# Build for production
mise exec -- hugo --minify
```

## Project Structure

```text
.
├── assets/img/          # Site-wide assets (favicons, banner, icon)
├── content/
│   ├── about/           # About page
│   ├── post/            # Blog posts
│   ├── tags/            # Tags taxonomy
│   └── categories/      # Categories taxonomy
├── resume/              # Resume source (.docx); not published
├── static/docs/         # Published documents (Resume PDF, talk slides)
├── themes/mirceanton/   # The site's theme (layouts, CSS, JS, fonts)
└── hugo.yaml            # Hugo configuration
```

## Writing Content

### Blog Posts

Blog posts are located in `content/post/`. Each post is a directory with:

- `index.md` - Post content
- `featured.webp` - Featured image (1200x630 recommended)
- `img/` - Additional images for the post

### Markdown extras

- Callouts: end a blockquote with `{.prompt-info}`, `{.prompt-tip}`, `{.prompt-warning}` or `{.prompt-danger}`, or use GitHub alerts (`> [!NOTE]`, `> [!TIP]`, ...)
- Code blocks: ` ```routeros {file="1. interfaces"} ` shows a file label in the block header
- Image captions: an _italic line_ directly below an image, or `{caption="..."}`
- Cover image: `image.path` in front matter (a page-bundle file)

### Image Guidelines

- Featured images should be **1200x630** pixels
- Use `.webp` format for optimal performance

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions:

- **On push to `main`**: Automatically builds and deploys
- **Manual trigger**: Available via workflow dispatch with optional dry-run mode

## License

See [LICENSE](LICENSE) for details.
