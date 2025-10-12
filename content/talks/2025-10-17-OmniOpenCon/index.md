---
icon: hammer
title: From Zero to Website in 100 Minutes
slug: omniopencon-2025
date: "2025-10-17"
event: "OmniOpenCon"
location: Bucharest, Romania
duration: 100min
level: Beginner

image: { path: featured.webp }
toc: true

description: |
  In this workshop, we'll go from zero to a fully functional personal site using Hugo and GitHub Pages. Together, we'll explore how static site generators work, how to automate deployment with GitHub Actions, and how to publisih your content online for free.
---

Welcome to **From Zero to Website in 100 Minutes**! In this workshop, you'll learn how to build a modern static website with Hugo and deploy it automatically using GitHub Actions and GitHub Pages.

**What you'll build:** A live website with your own content, automatically deployed whenever you push code to GitHub.

**Prerequisites:** Just a GitHub account. We'll do everything in the browser!

---

## Part 1: Introduction to Static Sites and Hugo

### What is a Static Site?

A **static site** is a website made up of pre-built HTML, CSS, and JavaScript files. Unlike dynamic sites (like WordPress) that generate pages on-the-fly from a database, static sites are just files served directly to the browser.

Conceptually, they're similar to opening up a PDF in your browser to view it. All of the content is already there, no server has to do any processing to generate it.

**Advantages:**

- ⚡ **Fast** - No database or server-side processing
- 🔒 **Secure** - No backend to hack
- 💰 **Cheap/Free** - Easy to host (GitHub Pages is free!)
- 📈 **Scalable** - Can handle huge traffic easily
- 🎯 **Simple** - Just files, easy to version control

### Why Use a Static Site Generator?

Writing HTML by hand is tedious. Static site generators let you:

- Write content in **Markdown** (simple text format)
- Use **templates** for consistent design
- Generate all HTML automatically
- Focus on content, not code

### Popular Static Site Generators

- **Hugo** (Go) - What we're using today! Super fast, single binary
- **Jekyll** (Ruby) - GitHub's original choice, very popular but requires setting up ruby
- **Gatsby**, **Next.js**, **Eleventy** (JavaScript) - Fairly simple but all are Javascript based so they need NodeJs setup locally.

### What is Hugo?

Hugo is a **fast** and **flexible** static site generator written in Go.

**Key Features:**

- ⚡ **Blazing fast** - Builds thousands of pages in seconds
- 🔧 **Single binary** - No dependencies to install
- 🎨 **Rich theme ecosystem** - Hundreds of free themes
- 📝 **Markdown support** - Write in plain text
- 🔄 **Live reload** - See changes instantly
- 🌐 **Multilingual** - Built-in i18n support

**Who uses Hugo?**

- [Kubernetes documentation](https://kubernetes.io/) - [Repo](https://github.com/kubernetes/website)
- [Let's Encrypt documentation](https://letsencrypt.org/) - [Repo](https://github.com/letsencrypt/website)
- [This very website!](https://mirceanton.com) - [Repo](https://github.com/mirceanton/mirceanton.com)
- And thousands more!

---

## Part 2: Build Your Hugo Site in Codespaces

Let's build your site! We'll use GitHub Codespaces so everyone has the same environment.

**What are GitHub Codespaces?**

GitHub Codespaces is a cloud-based development environment that runs directly in your browser. Think of it as a complete computer in the cloud, pre-configured with everything you need. Instead of installing tools on your laptop, GitHub creates a ready-to-use development environment for you. It's like having a fully set up workshop that appears instantly - no downloads, no installations, no "it works on my machine" problems!

**Benefits for this workshop:**

- Everyone has identical setup
- No local installation needed
- Works on any device with a browser
- Free tier includes 60 hours per month

### Step 1: Create a New GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Fill in the details:
   - **Repository name:** `my-hugo-site` (or your choice)
   - **Description:** "My personal website built with Hugo"
   - **Public** (required for free GitHub Pages)
   - ✅ **Add a README file**
4. Click **"Create repository"**

### Step 2: Add Devcontainer Configuration

We need to tell Codespaces how to set up our development environment.

1. In your repository, click **"Add file"** → **"Create new file"**
2. Name it: `.devcontainer/devcontainer.json`
3. Paste this configuration:

   ```json {file=".devcontainer/devcontainer.json"}
   {
     "name": "Hugo Development Environment",
     "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
     "remoteUser": "vscode",

     "features": {
       "ghcr.io/devcontainers/features/git:1": {},
       "ghcr.io/devcontainers/features/github-cli:1": {},
       "ghcr.io/devcontainers/features/hugo:1": {
         "extended": true,
         "version": "latest"
       }
     }
   }
   ```

4. Click **"Commit changes"** → **"Commit directly to the main branch"**

**What does this do?**

- Sets up an Ubuntu base layer
- Installs the Git and GitHub CLI
- Installs Hugo (extended version with all features)

### Step 3: Open in GitHub Codespaces

1. Click the green **"Code"** button
2. Select the **"Codespaces"** tab
3. Click **"Create codespace on main"**

Wait 1-2 minutes while Codespaces:

- Creates your container
- Installs Hugo and tools
- Sets up VS Code in your browser

**What's a container?**

A container is like a lightweight, isolated virtual machine. Think of it as a sealed box with everything your application needs to run - the operating system, tools, libraries, and your code. Containers ensure that your development environment works exactly the same way every time, regardless of what computer you're using. When you open a Codespace, GitHub creates a fresh container just for you, configured exactly as specified in the devcontainer.json file. This means everyone in the workshop has identical environments - no version conflicts or missing dependencies!

You'll see a VS Code interface when it's ready!

### Step 4: Verify Hugo Installation

In the terminal at the bottom of Codespaces, run:

```bash
hugo version
```

You should see something like: `hugo v0.148.0`

### Step 5: Initialize Your Hugo Site

```bash
hugo new site . --force
```

The `--force` flag allows Hugo to initialize in a non-empty directory (we have a README).

**What was created?**

```bash
my-hugo-site/
├── archetypes/      # Content templates
├── assets/          # Assets to be processed
├── content/         # Your content goes here!
├── data/            # Data files
├── i18n/            # Translations
├── layouts/         # HTML templates
├── static/          # Static files (images, etc.)
├── themes/          # Themes directory
└── hugo.toml        # Site configuration
```

**Directory purposes:**

- **archetypes/** - Template files for new content (defines default frontmatter for posts, pages, etc.)
- **assets/** - Files to be processed by Hugo Pipes (SCSS, JS, images that need optimization)
- **content/** - Your actual content written in Markdown - this is where your blog posts and pages live
- **data/** - Data files (JSON, YAML, TOML) that can be used in templates
- **i18n/** - Translation files for multilingual sites
- **layouts/** - HTML templates that define how your content is rendered
- **static/** - Files served as-is without processing (images, PDFs, CSS/JS that doesn't need processing)
- **themes/** - Directory where themes are installed
- **hugo.toml** - Main configuration file for your site

### Step 6: Test Hugo Server

Let's see if Hugo works (it won't show much yet, but we're testing):

```bash
hugo server
```

You should see Hugo start, but the site will be empty. Press `Ctrl+C` to stop the server for now.

### Step 7: Set Up .gitignore

Create a `.gitignore` file to keep your repo clean:

1. Create new file: `.gitignore`
2. Add this content:

   ```txt {file=".gitignore"}
   ### Hugo ###
   # Generated files by hugo
   /public/
   /resources/_gen/
   /assets/jsconfig.json
   hugo_stats.json

   # Temporary lock file while building
   /.hugo_build.lock
   ```

3. Commit the changes:

   ```bash
   git add .
   git commit -m "setup new hugo site"
   git push origin main
   ```

### Step 8: Add a Theme

Hugo needs a theme to know how to display your content. We'll use the **PaperMod** theme for this demo.

> **What's a git submodule?**
> A git submodule is a way to include one Git repository inside another as a subdirectory. Think of it as a bookmark to a specific version of another repository. When you add a theme as a submodule, you're not copying all the theme's files into your repo - instead, you're storing a reference to the theme's repository. This keeps your repo clean and makes it easy to update the theme later. The `--depth=1` flag means we only download the latest version without the full history, saving space and time.
>
> **Alternative: Hugo Modules**
>
> Hugo also supports Go modules for managing themes, which is more modern but requires Go to be installed. For this workshop, we're using submodules because they're simpler and don't require additional setup. If you continue with Hugo, consider exploring Hugo Modules as they offer more flexibility and better dependency management!
> {.prompt-info}

```bash
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

Commit the theme:

```bash
git add .
git commit -m "add PaperMod theme"
git push origin main
```

### Step 9: Configure Your Site

Time to configure Hugo! When we added the new theme, new settings became available to configure it. Personally, I am not a huge fan of `toml` for configuration files, so we'll replace `hugo.toml` with `hugo.yaml`

1. **Delete** the existing `hugo.toml` file
2. **Create** a new file called `hugo.yaml`
3. Add this configuration (customize with your info):

   ```yaml {file="hugo.yaml"}
   baseURL: "https://YOUR-GITHUB-USERNAME.github.io/YOUR-GITHUB-REPO-NAME/"
   languageCode: "en-us"
   title: "Your Name"
   theme: "PaperMod"

   params:
     socialIcons:
       - name: GitHub
         url: https://github.com/YOUR-USERNAME
       - name: LinkedIn
         url: https://linkedin.com/in/YOUR-PROFILE

     profileMode:
       enabled: true
       title: Your Name
       subtitle: Welcome to my blog!
       imageUrl: https://avatars.githubusercontent.com/u/YOUR-USER-ID?v=4
   ```

   **Important:** Replace:

   - `YOUR-USERNAME` with your GitHub username
   - `YOUR-PROFILE` with your LinkedIn username (if you have one)
   - `YOUR-USER-ID` with your GitHub user ID (or use any image URL)
   - `title` and `subtitle` with your preferences

4. Commit the changes:

   ```bash
   git add .
   git commit -m "update hugo config"
   git push origin main
   ```

### Step 10: Test Your Site with Proper URL

In Codespaces, we need to use a special command to make the site work correctly with forwarded ports:

```bash
hugo server -D --appendPort=false --baseURL https://$CODESPACE_NAME-1313.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
```

**What does this command do?**

- `hugo server` - Starts the development server for hugo
- `-D` - Shows draft content
- `--appendPort=false` - Don't add port to URLs -> this is due to using codespaces and how they handle the port forwarding by embedding it in the url
- `--baseURL` - Use the Codespaces forwarded URL (note that it is the port forwarding domain)

Press `Ctrl+C` to stop the server.

### Step 11: Create a Makefile (Quality of Life)

That command is too long to type every time! Let's create a Makefile:

Create a file called `Makefile`:

<!-- markdownlint-disable MD010 -->
```makefile
dev:
	hugo server -D --appendPort=false --baseURL https://$(CODESPACE_NAME)-1313.$(GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)
```
<!-- markdownlint-enable MD010 -->

**Important:** The indentation before `hugo server` MUST be a TAB, not spaces!

Commit it:

```bash
git add .
git commit -m "add makefile for hugo dev"
git push origin main
```

Now you can start the dev server with just:

```bash
make dev
```

Much easier! 🎉

### Step 12: Create Your First Post

```bash
hugo new content/posts/my-first-post.md
```

This creates a new file at `content/posts/my-first-post.md`. Open it and edit:

```markdown
+++
title = 'My First Post'
date = 2025-01-12T12:47:44Z
draft = true
+++

## Hello, World!

This is my first blog post on my new Hugo site. I built this during a workshop and learned:

1. How static site generators work
2. How to use Hugo
3. How to deploy with GitHub Pages
4. How to automate everything with GitHub Actions

Stay tuned for more posts!
```

### Step 13: Add a Posts Button to Homepage

Update your `hugo.yaml` to add a button linking to your posts:

```yaml {file="hugo.yaml"}
baseURL: "https://YOUR-GITHUB-USERNAME.github.io/YOUR-GITHUB-REPO-NAME/"
languageCode: "en-us"
title: "Your Name"
theme: "PaperMod"

params:
  socialIcons:
    - name: GitHub
      url: https://github.com/YOUR-USERNAME
    - name: LinkedIn
      url: https://linkedin.com/in/YOUR-PROFILE

  profileMode:
    enabled: true
    title: Your Name
    subtitle: Welcome to my blog!
    imageUrl: https://avatars.githubusercontent.com/u/YOUR-USER-ID?v=4
    buttons:
      - name: Posts
        url: "posts"
```

Commit your changes:

```bash
git add .
git commit -m "add first post"
git push origin main
```

### Step 14: Test Everything Locally

Start the dev server:

```bash
make dev
```

Check out your site:

1. Click the link in the command output
2. You should see your profile page with a "Posts" button
3. Click it to see your first blog post!

**Congratulations!** Your site is built! Now let's deploy it. 🚀

---

## Part 3: CI/CD, GitHub Actions, and GitHub Pages

Before we deploy, let's understand the tools we're using.

### What is CI/CD?

**CI/CD** stands for **Continuous Integration / Continuous Deployment**.

- **Continuous Integration (CI):** Automatically test code when changes are pushed
- **Continuous Deployment (CD):** Automatically deploy code when tests pass

**Benefits:**

- 🤖 Automation - No manual deployment steps
- 🐛 Catch bugs early - Tests run automatically
- ⚡ Fast feedback - Know immediately if something breaks
- 📦 Consistent deployments - Same process every time

### What are GitHub Actions?

**GitHub Actions** is GitHub's built-in CI/CD platform.

**How it works:**

1. You define workflows in YAML files
2. GitHub runs workflows when triggered (push, pull request, schedule, etc.)
3. Workflows run in isolated containers
4. Can do anything: test, build, deploy, etc.

**Use cases:**

- Run tests on every pull request
- Build and deploy applications
- Automate releases
- Send notifications
- And much more!

### What are GitHub Pages?

**GitHub Pages** is free static site hosting from GitHub.

**Features:**

- 🆓 **Free** for public repositories
- 🌐 **Custom domains** supported
- 🔒 **HTTPS** enabled by default
- ⚡ **CDN** - Fast globally
- 🤖 **Integrates with Actions** - Auto-deploy

**Perfect for:**

- Personal websites and blogs
- Project documentation
- Portfolio sites
- Landing pages

---

## Part 4: Deploy to GitHub Pages with GitHub Actions

Let's set up automatic deployment!

### Step 15: Configure GitHub Actions Workflow

1. Go to your repository on GitHub.com
2. Click **"Settings"** → **"Pages"** (in the left sidebar)
3. Under "Build and deployment":
   - **Source:** Select **"GitHub Actions"**
4. You'll see suggested workflows - click **"Browse all workflows"**
5. Search for **"hugo"**
6. Click **"Configure"** on the "Hugo" workflow

### Step 16: Review and Fix the Workflow

GitHub shows you a workflow file. This is what will build and deploy your site!

**Key parts of the workflow:**

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write
```

**What this means:**

- **name:** Friendly name for the workflow
- **on:** Triggers (runs on push to main, or manually)
- **permissions:** What the workflow can do

**Build job:**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive # Important! Gets our theme
```

**Important fix:** Find this section in the workflow:

```yaml
- name: Setup Hugo
  uses: peaceiris/actions-hugo@v2
  with:
    hugo-version: "latest"
```

Change `latest` to a specific version like `0.148.0` for reliability:

```yaml
- name: Setup Hugo
  uses: peaceiris/actions-hugo@v3
  with:
    hugo-version: "0.148.0"
    extended: true
```

### Step 17: Commit the Workflow

Click **"Commit changes"** → **"Commit directly to the main branch"**

This creates the file `.github/workflows/hugo.yml` in your repository.

### Step 18: Watch It Deploy

1. Go to the **"Actions"** tab in your repository
2. You'll see the "Deploy Hugo site to Pages" workflow running
3. Click on it to see detailed logs
4. Watch it:
   - Check out code
   - Set up Hugo
   - Build the site
   - Deploy to Pages

This usually takes 1-2 minutes.

### Step 19: View Your Live Site

<!-- markdownlint-disable MD034 -->
1. Once the workflow shows a green checkmark ✅
2. Go back to **"Settings"** → **"Pages"**
3. You should see: **"Your site is live at https://YOUR-USERNAME.github.io/my-hugo-site/"**
4. Click the link!
<!-- markdownlint-enable MD034 -->

**🎉 Congratulations!** Your site is live on the internet!

But wait, something is wrong... Your blog post is not showing up! Let's fix that.

### Step 20: Push Updates to the Site

Make a change to test automatic deployment:

1. Go back to the repository page
2. Edit `content/posts/my-first-post.md` -> change `draft: true` to `draft: false`
3. Commit and push:

   ```bash
   git add .
   git commit -m "update post"
   git push origin main
   ```

4. Go to the **Actions** tab on GitHub
5. Watch the workflow run automatically
6. Once complete, refresh your live site - you'll see the changes!

**This is the magic of CI/CD!** Every push automatically deploys your site.

---

## Part 5: Recap and Next Steps

### What We Accomplished Today

✅ Learned about static sites and Hugo  
✅ Set up a development environment with Codespaces  
✅ Built a Hugo site with a professional theme  
✅ Created content (homepage and blog post)  
✅ Set up CI/CD with GitHub Actions  
✅ Deployed to GitHub Pages  
✅ Configured automatic deployments

**You now have:**

- A live website: `https://YOUR-USERNAME.github.io/my-hugo-site/`
- Source code in GitHub
- Automatic deployments on every push
- A foundation to build upon

### Next Steps to Explore

#### 1. Customize Your Site

The PaperMod theme has tons of features:

- [PaperMod Documentation](https://github.com/adityatelange/hugo-PaperMod/wiki)
- [Example Site](https://adityatelange.github.io/hugo-PaperMod/)

Try adding:

- Dark mode toggle
- Search functionality
- Tags and categories
- Social share buttons
- Comments (using external services)

#### 2. Add More Content

```bash
# Create a new post
hugo new content/posts/second-post.md

# Create an about page
hugo new content/about.md

# Create a projects page
hugo new content/projects.md
```

Add images to `static/images/` and reference them:

```markdown
![My Image](/images/photo.jpg)
```

#### 3. Set Up a Custom Domain

Want `yourname.com` instead of `username.github.io`?

1. Buy a domain (I am personally using CloudFlare) for ~10$ a year
2. Configure DNS to point to GitHub Pages
3. Add custom domain in GitHub Pages settings
4. [Follow GitHub's guide](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)

#### 4. Explore More Hugo Features

- **Taxonomies:** Tags, categories, series
- **Shortcodes:** Reusable content snippets
- **Data files:** Store data in JSON/YAML
- **Multilingual:** Support multiple languages
- **Image processing:** Resize and optimize images
- **Related content:** Suggest similar posts

#### 5. Try Other Themes

Browse hundreds of themes at [themes.gohugo.io](https://themes.gohugo.io/)

To change themes:

1. Remove old theme submodule
2. Add new theme submodule
3. Update `theme:` in `hugo.yaml`
4. Follow new theme's documentation

---

## Useful Resources

### Hugo

- [Official Documentation](https://gohugo.io/documentation/)
- [Hugo Discourse Forum](https://discourse.gohugo.io/)
- [Hugo Themes](https://themes.gohugo.io/)

### PaperMod Theme

- [Documentation](https://github.com/adityatelange/hugo-PaperMod/wiki)
- [Features](https://github.com/adityatelange/hugo-PaperMod/wiki/Features)
- [FAQs](https://github.com/adityatelange/hugo-PaperMod/wiki/FAQs)

### GitHub

- [GitHub Actions Docs](https://docs.github.com/actions)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Codespaces Docs](https://docs.github.com/codespaces)

---
