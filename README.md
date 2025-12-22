# mirceanton.com

My personal website, built with Hugo and hosted on GitHub pages.

## Tech Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) (extended)
- **Theme**: [Chirpy](https://github.com/mirceanton/hugo-theme-chirpy)
- **Styling**: Custom CSS with Dart Sass
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
# Start the development server
hugo server -D

# Build for production
hugo --minify
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
├── data/                # Data files (authors.yaml)
├── static/docs/         # Static documents (Resume)
└── hugo.yaml            # Hugo configuration
```

## Writing Content

### Blog Posts

Blog posts are located in `content/post/`. Each post is a directory with:

- `index.md` - Post content
- `featured.webp` - Featured image (1200x630 recommended)
- `img/` - Additional images for the post

### Image Guidelines

- Featured images should be **1200x630** pixels
- Use `.webp` format for optimal performance

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions:

- **On push to `main`**: Automatically builds and deploys
- **Manual trigger**: Available via workflow dispatch with optional dry-run mode

## License

See [LICENSE](LICENSE) for details.
