---
icon: hammer
image: { path: featured.webp }
title: From Zero to Website in 100 Minutes
slug: omniopencon-2025
date: "2025-10-17"
event: "OmniOpenCon"
location: Bucharest, Romania
duration: 100min
level: Beginner

description: |
  In this workshop, we'll go from zero to a fully functional personal site using Hugo and GitHub Pages. Together, we'll explore how static site generators work, how to automate deployment with GitHub Actions, and how to publisih your content online for free.
---

## Overview

This workshop will guide you through creating, customizing, and deploying your own website using **Hugo** and **GitHub Pages**, all within **GitHub Codespaces**.  
By the end, you will have a fully functional website hosted online, built entirely from your browser.

## Prerequisites

- A **GitHub account** (free)
- No prior web development experience is required

Everything else will be done using GitHub's cloud tools, so you will not need to install anything locally.

---

## Part 1: Introduction to Static Sites and Hugo

### What is a Static Site?

A **static website** consists of web pages with fixed content. Each page is coded in HTML and displays the same information to every visitor. Think of it like a printed brochure; the content is pre-set and doesn't change based on who is viewing it.

When a user visits a static site, the server simply sends the pre-made HTML, CSS, and JavaScript files directly to their browser. Conceptually similar to viewing a PDF inside the browser. There is no backend or server-side processing happening.

Thanks to this simplicity, static sites are:

- ⚡ **Fast**: pages are pre-generated and load instantly.
- 🔒 **Secure**: there is no backend code that can be exploited.
- 💰 **Cheap/Free**: they work perfectly with free hosting options like GitHub Pages or Netlify.

### What is a Dynamic Site?

A dynamic website, on the other hand, can display different content and provide user interaction. The content is generated in real-time based on factors like the user's location, the time of day, or their past actions on the site.

These websites use server-side programming languages (like PHP, Python, or Ruby) and a database. When a user requests a page, the server processes the request, pulls information from the database, and builds a custom HTML page to send to the user's browser. This allows for features like user logins, e-commerce, and personalized content.

The upsides of this complexity are:

- 👥 **User Interactivity**: They allow for interactive features like user accounts, comments, and forums
- ✍️ **Easy Content Management**: Content can be easily updated by non-technical users through a web application called content management system (CMS).
- 👤 **Personalized User Experience**: They can deliver personalized content to each user based on their preferences and past behavior.

### Key Differences

Here's a breakdown of the main differences between static and dynamic websites:

| Feature         | Static Website                                                    | Dynamic Website                                                                    |
| --------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Content**     | Fixed and the same for all users.                                 | Changes based on user interaction and other factors.                               |
| **Technology**  | HTML, CSS, JavaScript.                                            | Server-side languages (PHP, Python, etc.) and a database.                          |
| **Performance** | Generally faster and more efficient.                              | Can be slower due to server-side processing and database queries.                  |
| **Security**    | More secure as there is no database or backend to attack.         | More vulnerable to attacks due to the database and server-side code.               |
| **Flexibility** | Less flexible; content updates require editing the code directly. | Highly flexible; content can be updated through a content management system (CMS). |
| **Use Cases**   | Portfolios, blogs, documentation, brochure websites.              | E-commerce stores, social media platforms, online forums, membership sites.        |

### What is a Static Site Generator?

A **Static Site Generator (SSG)** is a tool that automates the process of creating static HTML files from templates and content files (usually written in Markdown). You write your posts and pages in plain text, and the SSG combines them with your chosen theme to generate a complete website.

This is powerful because we can write content in easy, human-readable formats and we can easily swap out themes for our website without touching the content.

Some popular SSGs include:

- **Hugo** (built with Go)
- **Jekyll** (built with Ruby)
- **Eleventy** (built with JavaScript)

Hugo is one of the fastest and easiest static site generators available. It has several advantages over other alternatives:

- It is distributed as a **single binary file**, so you do not need to install extra dependencies like Node.js or Ruby.
- It is extremely fast. Even large sites can rebuild in seconds.
- It has a rich ecosystem of **themes** that make your site look professional immediately.

## Part 2: Build Your Hugo Site in Codespaces

In this section, you will create a new Hugo site, set it up in a GitHub repository, and run it locally using GitHub Codespaces.

### Step 1: Create a New GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name:** `my-hugo-site` (or your choice)
   - **Description:** "My personal website built with Hugo" (optional)
   - **Public** (required for free GitHub Pages)
   - ✅ **Add a README file**
4. Click **"Create repository"**

This repository will not only contain all of our website files, but also our Hugo theme and our development environment configuration. This way we can easily add changes to our website from anywhere with a browser available!

### Step 2: Configure GitHub Codespaces

The GitHub platform has a handy feature called "GitHub Codespaces". They basically give you a complete development environment in the cloud, making use of a technology called **devcontainers**.

A devcontainer, or development container, is a running Docker container with a well-defined tool and runtime stack that is used as a full-featured, isolated development environment.  
If you haven't heard of Docker or containers yet, then you can conceptually think of this as being similar to having a disposable and easy to reproduce virtual machine you connect to for your development.  
Functionally speaking, it is like having Visual Studio Code running inside your browser in a preconfigured environment.

Speaking of "preconfigured environment", we need to tell Codespaces how to set up our development environment. To do that, we need to create a `.devcontainer.json` file.  
This file is a configuration file that tells your editor, or in this case, Codespaces, how to create and configure this environment, specifying details like the container image to use, which extensions to install, and what ports to forward.

1. In your repository, click **"Add file"** → **"Create new file"**
2. Name it: `.devcontainer/devcontainer.json`
3. Paste this configuration:
   ```json {file=".devcontainer/devcontainer.json"}
   {
     "name": "Hugo Development Environment",
     "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
     "features": {
       "ghcr.io/devcontainers/features/hugo:1": {
         "extended": true,
         "version": "latest"
       }
     }
   }
   ```
4. Click **"Commit changes"** → **"Commit directly to the main branch"**

Here we have configured an Ubuntu based devcontainer image and then we installed the latest version of hugo-extended using the official hugo feature. This basically sets up the Hugo program in our container for us.

### Step 3: Open in GitHub Codespaces

1. Click the green **"Code"** button
2. Select the **"Codespaces"** tab
3. Click **"Create codespace on main"**

Wait 1-2 minutes while Codespaces:

- Creates your container
- Installs Hugo and tools
- Sets up VS Code in your browser

You'll see a VS Code interface when it's ready!

Let's verify our setup. In the terminal at the bottom of Codespaces, run:

```bash
hugo version
```

You should see something like: `hugo v0.148.0`

### Step 4: Initialize Your Hugo Site

Running `hugo new site` scaffolds a new project with a standard directory structure. Since we already have a README and the devcontainer config, we will also need to pass the `--force` flag which allows Hugo to initialize in a non-empty directory:

```bash
hugo new site . --force
```

Here's what each of the generated files and folders is for:

- **`archetypes/`**: This folder contains templates for your content;  
   When you create a new piece of content using the `hugo new` command (e.g., `hugo new posts/my-first-post.md`), Hugo uses the corresponding archetype file (e.g., `archetypes/posts.md`) to pre-populate the new file with default front matter (metadata like title, date, etc.).
- **`assets/`**: This is where you place files that need to be processed by Hugo's asset pipeline, called Hugo Pipes;  
   This is typically used for things like SASS files that need to be compiled into CSS, or for bundling and minifying JavaScript files.
- **`content/`**: This is the folder for your site's content,  
   You'll create your pages, blog posts, and other content here, usually as Markdown (`.md`) files here. The folder structure inside `content/` directly maps to the URL structure of your website.
- **`data/`**: This folder holds structured data files (in TOML, YAML, or JSON format) that you want to use in your templates,  
   This is useful for things like a list of products, team members, or any other data that isn't part of a standard page.
- **`i18n/`**: This folder is for internationalization or creating a multilingual site,  
   It holds translation files (`en.toml`, `fr.toml`, etc.) where you can define strings that can be used in your templates to display text in different languages.
- **`layouts/`**: This folder contains the HTML templates that Hugo uses to render your content into a final website,  
   You can override templates from your theme here or create custom layouts for different content types. It's the core of your site's structure and design.
- **`static/`**: This folder is for all static assets that don't need any processing,  
   Files here (like images, CSS files, JavaScript files, fonts, and PDFs) are copied directly to the final website's root directory exactly as they are.
- **`themes/`**: This is where you can install themes created by others to quickly style your site,  
   A theme is essentially a bundle or package of `assets/` and `layouts/` which customize how your final site will look.
- **`hugo.toml`**: This is the main configuration file for your entire site.
  It contains global settings like your website's `title`, `baseURL`, language settings, menus, and any other site-wide parameters.

For a simple new website, you can safely ignore most of these generated folders because they are meant for more advanced customization. Since we are using a pre-built theme, it will provide all the necessary templates, making the `layouts/` folder unnecessary at the start. Folders like `static`, `i18n`, `data`, and `assets` are also not immediately needed as they handle specific features like custom files, multilingual support, or asset processing that our basic site doesn't require.

We can clean up the folders we don't need and make sure to keep those that we do by running:

```bash
# Clean up unused folders
rm -rf static/ i18n/ data/ assets/ layouts/

# Keep needed ones
touch content/.gitkeep themes/.gitkeep
```

We should be left only with the files we care about:

```bash
.
├── .devcontainer
│   └── .devcontainer.json
├── README.md
├── archetypes
│   └── default.md
├── content
│   └── .gitkeep
├── hugo.toml
└── themes
    └── .gitkeep
```

### Step 5: Test our Hugo Site

Running the `hugo build` command tells the generator to take all your content files, process them using the templates from your layouts directory (or your theme's layouts), and build the complete, ready-to-deploy static website.

```bash
hugo build
```

By default, it places all the final HTML, CSS, and JavaScript files into a new folder named `public/`:

```bash
.
├── .devcontainer
│   └── .devcontainer.json
├── .hugo_build.lock  # <--- this is like the nodejs package.lock
├── README.md
├── archetypes
│   └── default.md
├── content
│   └── .gitkeep
├── hugo.toml
├── public  # <--- here is the built site
│   ├── categories
│   │   └── index.xml
│   ├── index.xml
│   ├── sitemap.xml
│   └── tags
│       └── index.xml
└── themes
    └── .gitkeep
```

While this is great, we don't want to push neither the `public/` directory nor the lock-file to our repository. To make sure we don't accidentally do that, we need to add them to the `.gitignore` file.

A `.gitignore` file is a plain text file that tells Git which files or directories it should intentionally ignore and not track. This is essential for keeping your repository clean by preventing automatically generated folders, like the public/ directory, from being committed.

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

At this point, we have the base for our new Hugo site, so let's go ahead and save our work by commiting it to the main branch:

```bash
git add -A
git commit -m "initialize hugo project"
git push
```

However, since our site has no content and no theme configured yet, running hugo now will simply create an empty public/ directory. Before actually building our site, we'll need to add a theme.

### Step 6: Add a Theme

A Hugo theme is a complete, self-contained package of templates, styles, and assets that dictates the design and layout of your website. Instead of you having to create all the HTML, CSS, and JavaScript from scratch in your project's layouts and static folders, a theme provides a ready-made professional design. You simply add your content, and the theme handles how it's presented.  
 We'll use the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme for this workshop.

Adding a Hugo theme as a git submodule is the recommended way to use themes in Hugo because it keeps your project clean and makes it incredibly easy to update the theme later.

A Git submodule is a feature of Git that allows you to keep a Git repository as a subdirectory within another Git repository. This is a powerful way to manage a project that depends on another project. Instead of copying the theme's code into your project (which would make it hard to get updates), a submodule simply points to a specific commit in the theme's repository, keeping it separate but connected.

```bash
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

This should now generate 2 new files for us:

```bash
@mircea-pavel-anton ➜ /workspaces/omniopencon-2025-demo (main) $ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   .gitmodules
        new file:   themes/PaperMod
```

The `.gitmodules` file keeps track of all of the submodules used in this project. If we take a look at it, it basically tells git to put the contents of the given url at the given path:

```txt {file=".gitmodules"}
[submodule "themes/PaperMod"]
  path = themes/PaperMod
  url = https://github.com/adityatelange/hugo-PaperMod.git
```

With the theme added as a submodule, we need to update our hugo config as well to tell it to use it:

```toml {file="hugo.toml"}
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'My New Hugo Site'
theme = PaperMod
```

At this point, everything should be configured so let's go ahead and commit these changes:

```bash
git add -A
git commit -m "use papermod theme via submodule"
git push
```

### Step 7: Configure Your Site

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
         url: https://github.com/username
       - name: YouTube
         url: https://www.youtube.com/@username
       - name: LinkedIn
         url: https://linkedin.com/in/username

     profileMode:
       enabled: true
       title: Your Name
       subtitle: Welcome to my blog!
       imageUrl: https://...
   ```

This `hugo.yaml` file controls the main settings for both the Hugo engine and your specific theme (PaperMod). It's broken into two main sections:

1. global settings at the top,
2. theme-specific settings under the `params` key.

#### Global Hugo Configuration

These are the standard settings that Hugo itself uses to build your site.

- `baseURL`: This is the most important setting. It's the final web address where your site will live (e.g., `https://my-username.github.io/my-blog/`),
- `languageCode`: This sets the default language of your site, which is important for search engines and user accessibility,
- `title`: This is the main title for your entire website. It will typically appear in the browser tab and in search engine results,
- `theme`: This line simply tells Hugo which theme to use from your `themes/` folder. In this case, it's activating "PaperMod",

#### Theme-Specific Parameters (`params`)

Everything under the `params:` key is a custom setting that is specifically read and used by the **PaperMod theme**. Other themes might have completely different options here, so it is always recommended to check out the official documentation for the specific theme you are using.

In our case, we will be using:

- `socialIcons`: This will create a list of social media icons and links on our homepage
  - The `name:` is used by the PaperMod theme to automatically use the correct icon,
  - The `url:` tell it where to redirect to when the icon is clicked on
- `profileMode`:
  - `enabled: true`: This turns the feature on.
  - `title:` and `subtitle:`: These are the lines of text that will appear in the profile box.
  - `imageUrl`: This is the direct link to the profile picture you want to display.

---

With the site customized, let's go ahead and save our work by commiting it to the `main` branch:

```bash
git add -A
git commit -m "configure hugo"
git push
```

### Step 8: Test Your Site

In Codespaces, we need to use a special command to make the site work correctly with forwarded ports:

```bash
hugo server -D --appendPort=false --baseURL https://$CODESPACE_NAME-1313.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
```

Let's break down each piece of the command:

- **`hugo server`**: This is the standard command to start Hugo's built-in development server  
  It watches for any changes you make to your files and automatically rebuilds your site in memory, so you can see your changes live in the browser.
- **`-D`**: This is a shorthand flag for `--buildDrafts`,  
  It tells the server to include any content you've marked as a draft (by adding `draft: true` to the top of a Markdown file). This is very useful during development, as it allows you to preview your work-in-progress posts without them being included in the final production build.
- **`--baseURL https://...`**: This is the most critical part for Codespaces. It temporarily overrides the `baseURL` from your `hugo.yaml` file.
  - **Why?** Your Codespace is a remote machine in the cloud, and to show you the website running on it, GitHub automatically "forwards" the server's port (1313 by default for Hugo) to a special, public URL.
  - **`$CODESPACE_NAME`** and **`$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN`** are environment variables that Codespaces provides. They automatically insert your unique codespace name and the correct forwarding domain to construct the exact URL you need to access your live preview.
- **`--appendPort=false`**: This flag tells hugo NOT to append the port to the generated url  
  By default, Hugo adds the port number (like `:1313`) to the end of the `baseURL`. However, the special Codespaces URL already has the port `1313` encoded within it (e.g., `your-codespace-name-**1313**.preview.app.github.dev`). This flag tells Hugo _not_ to add the port a second time, which would break the link.

You can press `Ctrl+C` to stop the server.

To simplify the development command, create a file called `Makefile` and add:

<!-- markdownlint-disable MD010 -->

```makefile
dev:
	hugo server -D --appendPort=false --baseURL https://$(CODESPACE_NAME)-1313.$(GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)
```

<!-- markdownlint-enable MD010 -->

**Important:** The indentation before `hugo server` MUST be a TAB, not spaces!

You can now start the local server by simply running:

```bash
make dev
```

Let's commit this new file to git:

```bash
git add -A
git commit -m "add makefile for dev"
git push
```

### Step 9: Create Your First Blog Post

Create a new post using:

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

This is my first blog post on my new Hugo site. I built this at OmniOpenCon! During the workshop I learned:

1. How static site generators work
2. How to use Hugo
3. How to deploy with GitHub Pages
4. How to automate everything with GitHub Actions

Stay tuned for more posts!
```

While we did add a new blog post, if we check out our site using `make dev`, we won't be able to find it anywhere. We need to configure hugo a bit to add some navigation to our blog page:

```yaml {file="hugo.yaml"}
baseURL: "https://YOUR-GITHUB-USERNAME.github.io/YOUR-GITHUB-REPO-NAME/"
languageCode: "en-us"
title: "Your Name"
theme: "PaperMod"

params:
  socialIcons:
    - name: GitHub
      url: https://github.com/username
    - name: YouTube
      url: https://www.youtube.com/@username
    - name: LinkedIn
      url: https://linkedin.com/in/username

  profileMode:
    enabled: true
    title: Your Name
    subtitle: Welcome to my blog!
    imageUrl: https://...

    # --- Add this under profileMode ---
    buttons:
      - name: Posts
        url: "posts"
```

With the blog post added and Hugo configured, I think our brand new site is done! Let's save our work one last time:

```bash
git add .
git commit -m "add first post"
git push origin main
```

**Congratulations!** Your site is built! Now let's deploy it. 🚀

---

## Part 3: CI/CD, GitHub Actions, and GitHub Pages

Now that your site is working "locally" (quotes because we are actually working in the cloud), the next step is to publish it to the web so that anyone can visit it.

The Codespaces preview URL we used earlier runs on a temporary development server. When you close your Codespace, that link disappears. To make your site available permanently, we will use GitHub Pages.

Instead of building the site manually each time you make a change, you can automate the entire process using CI/CD via GitHub Actions. This ensures your site stays up to date automatically whenever you push new content to your repository.

But first...

### What is CI/CD?

**CI/CD** stands for Continuous Integration and Continuous Deployment.

- **Continuous Integration (CI)** means automatically building and testing your code whenever you make changes.
- **Continuous Deployment (CD)** means automatically publishing those changes to your live website when the build succeeds.

In our case, CI will run `hugo build` to build the site in the `public/` directory, and CD will take the `public/` directory and deploy it to GitHub Pages.

While we could technically do all these CI and CD steps manually, foing this automatically instead has quite a few benefits, the most important ones being:
That's an excellent question. You absolutely can manually run hugo build and push the generated files to GitHub Pages, but automating this process with CI/CD offers some powerful advantages that become more valuable over time.

- ⚡**Simplicity and Speed**: With an automated workflow, your only job is to write content and push your changes to the main branch. The CI/CD pipeline takes care of everything else in the background. This saves you from having to run multiple commands every time you want to publish a simple typo fix or a new blog post.
- 📦 **Consistency and Reliability**: Humans make mistakes. You might forget to run the `hugo build` command, or you might accidentally delete a file when moving the `public/` contents. An automated process is a robot that follows the exact same perfect steps every single time, eliminating the risk of human error and ensuring your site always deploys correctly.

### What Are GitHub Actions?

**GitHub Actions** is GitHub's native way of implementing the CI/CD (Continuous Integration/Continuous Deployment) we just discussed.  
Think of it as a programmable robot that lives inside your repository and can perform tasks for you automatically whenever something happens, like you pushing new code.

We will use GitHub Actions to build and deploy our Hugo site whenever we push changes to the main branch.

### What is GitHub Pages?

**GitHub Pages** is a free static web hosting service offered directly by GitHub.

In simple terms, it's a feature that takes the HTML, CSS, and JavaScript files from a repository in your GitHub account and publishes them as a live website that anyone can visit on the internet.

It's the final piece of the puzzle and serves the static files we've been talking about.

The URL for a project site typically follows a standard format: `https://your-username.github.io/your-repository-name`, which is exactly why your Hugo `baseURL` is configured that way.

---

Here is what will happen once everything is set up:

1. You create or edit content in your Hugo site and push the changes to GitHub.
2. GitHub Actions automatically runs a workflow that builds your site with Hugo, generating the final static files.
3. GitHub Pages takes those generated files and publishes them online at a permanent public URL.

---

## Part 4: Deploy to GitHub Pages with GitHub Actions

The final step before your site goes live is to set up a **GitHub Actions workflow** that automatically builds and deploys your Hugo site whenever you push updates to your repository.

### Step 10: Configure GitHub Actions Workflow

GitHub Actions uses a configuration file written in YAML (a structured text format) that describes what should happen and when.  
We’ll place this file in the `.github/workflows/` directory so that GitHub recognizes it as an automated workflow, and we'll call it something suggestive like `gh-pages.yaml`

```yaml {file=".github/workflows/gh-pages.yaml"}
---
name: GitHub Pages

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read # permission to read repository contents
  pages: write # permission to deploy to GitHub Pages
  id-token: write # permission to sign in to GitHub Pages

# Controls when the workflow will run
on:
  # Allows manual triggering of the workflow in the Actions tab
  workflow_dispatch: {}

  # Triggers the workflow on push to the "main" branch
  push:
    branches: ["main"]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # CI job: build the site with Hugo
  build:
    runs-on: ubuntu-latest
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      # equivalent to `git clone --recurse-submodules`
      - uses: actions/checkout@v5
        with:
          submodules: true # Fetch our Hugo theme

      # the equivalent of our devcontainer hugo feature
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "0.148.0" # the output `hugo version` should match this
          extended: true

      - name: Build
        run: hugo build --minify

      # Upload the built site for the deploy job
      - name: Save artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  # CD job: deploy to GitHub Pages
  deploy:
    runs-on: ubuntu-latest
    needs: build #? need to wait for the build job to finish
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Understanding the Workflow

Let’s break this file down section by section so we understand what it does.

##### 1. `name: GitHub Pages`

This simply gives a name to our workflow. It helps us identify it later in the **Actions** tab on GitHub. This is especially handy if we have a lot of workflows to automate various things in our projects.

##### 2. `permissions`

This is security section which controls what the GitHub Actions bot is allowed to do in your repository.

- `contents: read` lets it read our code,
- `pages: write` gives it permission to upload files to GitHub Pages,
- `id-token: write` allows the workflow to authenticate securely with GitHub Pages when deploying.

##### 3. `on`

This section defines **when** the workflow should run.

- `push: branches: ["main"]` means it will run automatically every time you push a commit to your `main` branch.
- `workflow_dispatch` allows you to start the workflow manually from the GitHub Actions interface. You can navigate to the Actions tag, select your workflow on the left and then using the drop-down menu on the right, trigger a new run.

##### 4. `jobs`

Each workflow is made up of one or more **jobs**. Jobs describe what should be done and on what kind of system.

In this case, we have two jobs:

- `build` – generates the site files
- `deploy` – publishes those files to GitHub Pages

##### The `build` Job

The first job handles the process of building our Hugo site.

- `runs-on: ubuntu-latest` tells GitHub to run this job on a Linux virtual machine.
- `concurrency` ensures that only one build runs per branch at a time, preventing overlapping builds.

Inside `steps`, we list the individual actions that make up the build process:

1. **Checkout the repository**
   ```yaml
   - uses: actions/checkout@v5
     with:
       submodules: true
   ```
   This pulls down our code and theme (since Hugo themes are stored as Git submodules).
2. **Set up Hugo**
   ```yaml
   - name: Setup Hugo
     uses: peaceiris/actions-hugo@v3
   ```
   This installs the correct version of Hugo on the runner, similar to how we had it preinstalled in our Codespace.
3. **Build the site**
   ```yaml
   - name: Build
     run: hugo build --minify
   ```
   This runs the Hugo build command, generating our static site into the `public/` directory.
   The `--minify` flag compresses files to make them load faster.
4. **Save the build output**
   ```yaml
   - name: Save artifact
     uses: actions/upload-pages-artifact@v3
   ```
   This packages the generated files as an **artifact** (a saved bundle) that can be passed to the next job.

##### The `deploy` Job

The second job is responsible for actually publishing the site.

- `needs: build` means this job will only start after the `build` job has finished successfully.
- `environment: github-pages` tells GitHub that this deployment targets GitHub Pages.
- The `url` line makes the final site URL available as an output variable.

Inside the steps:

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

This step uses GitHub’s official deployment action to take the built files (the artifact created earlier) and publish them to your repository’s **GitHub Pages** environment.

#### After You Push

Once this file is added, commit and push it to your repository’s `main` branch.

```bash
git add -A
git commit -m "add github pages workflow"
git push
```

Then go to the **Actions** tab on GitHub to watch the workflow in real time.

- The **build job** will install Hugo, build the site, and upload the files.
- The **deploy job** will take those files and push them to GitHub Pages.

<!-- markdownlint-disable-next-line MD034 -->

Once the workflow shows a green checkmark, go back to **"Settings"** → **"Pages"** and you should see: **"Your site is live at https://YOUR-USERNAME.github.io/my-hugo-site/"**

**🎉 Congratulations!** Your site is live on the internet!

But wait, something is wrong... Your blog post is not showing up! Let's fix that.

### Bonus: Push Updates to the Site

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
6. Once complete, refresh your live site.

**This is the magic of CI/CD!** Every push automatically deploys your site.

## Conclusion

Congratulations! You have built and deployed your first static website.

You learned:

- What static and dynamic sites are
- What a static site generator does
- How to use Hugo to build a website
- How to develop in the cloud with GitHub Codespaces
- How to automate builds and deployments with GitHub Actions
- How to host your site for free with GitHub Pages

You now have a live, professional-looking website built entirely with modern developer tools.
From here, you can customize your theme, add new pages, and continue publishing content with ease.

---

## Useful Resources

**DevContainers**: [DevContainers Beginner Guide](https://www.youtube.com/watch?v=X7guekGZM20) | [Docker in 100 seconds](https://www.youtube.com/watch?v=Gjnup-PuquQ) | [Docker in 5 minutes](https://www.youtube.com/watch?v=_dfLOzuIg2o)

**Hugo**: [Official Documentation](https://gohugo.io/documentation/) | [Hugo Forum](https://discourse.gohugo.io/) | [Hugo Themes](https://themes.gohugo.io/) | [Hugo in 100 seconds](https://www.youtube.com/watch?v=0RKpf3rK57I) | [Full Hugo Tutorial Playlist](https://www.youtube.com/playlist?list=PLLAZ4kZ9dFpOnyRlyS-liKL5ReHDcj4G3) 

**PaperMod Theme**: [Documentation](https://github.com/adityatelange/hugo-PaperMod/wiki) | [Features](https://github.com/adityatelange/hugo-PaperMod/wiki/Features) | [FAQs](https://github.com/adityatelange/hugo-PaperMod/wiki/FAQs)

**GitHub**: [GitHub Actions Docs](https://docs.github.com/actions) | [GitHub Pages Docs](https://docs.github.com/pages) | [Codespaces Docs](https://docs.github.com/codespaces)
