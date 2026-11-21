---
title: "My AI Agent Had GitHub Credentials And Still Couldn't Open a Pull Request"
slug: github-app-auth-ai-agent
date: "2026-11-20"
draft: true

categories: [Blog Post]
tags:
  - Hermes
  - GitHub
  - GitOps
  - Homelab
  - Kubernetes
  - AI

description: |
  My homelab AI agent had GitHub credentials mounted, seeded and configured — and still couldn't open a pull request. Three separate bugs, one silent parser, and the token flow that finally made it work.
---

So I have this AI agent — [Hermes](https://hermes-agent.nousresearch.com) — running in my homelab Kubernetes cluster, and one of the jobs I gave it is GitOps: every change to the cluster goes through a branch, a commit and a pull request in my `home-ops` repo. Which means it has to act on GitHub as my bot, [Mr. Borboto](https://github.com/apps/mr-borboto) — a GitHub App, not some long-lived personal access token I'd have to remember to rotate.

The private key was mounted. The IDs were configured. The App was installed on the repo. And the agent still couldn't open a pull request.

It took three separate fixes, and not one of them was where I expected it to be. The credentials were fine the whole time.

## Bug 1: YAML keys in a dotenv file

On paper the setup was fine. The App's private key was mounted read-only into the pod, and an init container rendered the profile's `.env` from a template in the repo. And yet, when I asked the agent to validate its GitHub integration, the answer came back: **authenticated as `anonymous`**.

No error. No warning in the agent. Just… anonymous.

The template had been written like this:

```dotenv
GITHUB_APP_ID: "900136"
GITHUB_APP_INSTALLATION_ID: "53131225"
GITHUB_APP_PRIVATE_KEY_PATH: /var/run/secrets/github-app/private_key_pem
```

Looks reasonable — except the rendered file is **dotenv**, not YAML. Both loaders that consume it split lines on `=`: python-dotenv logs a parse warning and moves on, and Hermes' own secret-scope parser silently skips any line without an `=`. Three perfectly good credentials, dropped without a trace.

The diagnosis that cracked it was refusing to eyeball the file and instead running the image's _own_ loader against the rendered `.env` — the exact production code path. It returned every key except those three, and `auth_method()` reported `anonymous`. The fix was one character per line:

```diff
-GITHUB_APP_ID: "900136"
+GITHUB_APP_ID=900136
```

> **Takeaway:** when a config value "isn't arriving", validate it with the actual consumer, not with your eyes. Parsers that fail silently will happily eat your credentials and report nothing.
{.prompt-info}

## Bug 2: credentials that authenticate (almost) nothing

Fixing the syntax made the keys load — and the agent still couldn't open a PR. Two more layers peeled off:

1. **The env vars only feed one consumer.** In the shipped image, `GITHUB_APP_*` authenticates the skills-hub GitHub API client, in-process. That's it. It does not create branches or PRs.
2. **The terminal never sees them.** Hermes deliberately strips credential env keys from _every_ subprocess it spawns — a security boundary, so a shell command (or anything it runs) can't exfiltrate them by reading `env`. `env | grep GITHUB` returning nothing is by design, not a bug.

And the kicker: the same PR that introduced the env-based auth had _removed_ the GitHub MCP server from the agent's profile, betting on native auth. The bet was wrong — the env path authenticated one API client, the terminal path was sealed shut, and the MCP had been the only thing providing branch/PR/issue tooling. The profile had **zero** GitHub write paths.

The fix was to restore the MCP, then delete the now-redundant `GITHUB_APP_*` keys entirely. One credential path, not two half-working ones.

> **Takeaway:** "the credential is present" is not "the tool can authenticate". Enumerate the consumers of a credential — in-process client, subprocess, mounted MCP — and verify each one independently.
{.prompt-info}

## Bug 3: the CI blind spot

With the MCP restored, the agent could branch, push and open PRs. Then a scheduled job tried to read a failed CI job's logs and got `HTTP 403: Job logs need auth`.

The token was fine. The problem was the [github-mcp-server](https://github.com/github/github-mcp-server) itself: started with bare defaults, it only registers its _default_ toolsets — repos, issues, pull requests, users, context. The `actions` toolset (workflow runs, job logs, reruns) is **not** a default, so it simply didn't exist on the server. Check-run pass/fail was readable; _why_ a check failed was not.

One line in the MCP's manifest fixed it:

```diff
-    args: ["http"]
+    args: ["http", "--toolsets", "default,actions"]
```

A few smaller gremlins surfaced on the same path and are worth knowing if you run this setup: the MCP's contents API silently drops a file's trailing newline (enough to fail a prettier CI check), large file reads get truncated by the _client's_ per-result budget rather than the server, and very large pushes are better done by speaking MCP Streamable HTTP straight from a script instead of through the agent's tool-call layer.

## What actually makes it work today

The durable design is a token assembly line with exactly one long-lived secret:

1. The App's **PEM** lives in 1Password. External Secrets Operator syncs it into a Kubernetes Secret, mounted read-only — the only durable credential in the whole flow.
2. An ESO **`GithubAccessToken` generator** uses it to sign a short-lived RS256 JWT and exchanges it at GitHub's API for an **installation token**, valid for one hour.
3. An ExternalSecret re-mints that token **every 55 minutes** — always fresh, with margin — and the GitHub MCP consumes it as its bearer token.

Nothing persists a token, nothing caches one across a rotation, and the agent never handles the PEM itself. Public repos are read with anonymous `git fetch`; every write goes through the MCP as the bot; and every push is proven byte-for-byte (`git hash-object` locally vs the remote blob SHA) before a PR is opened.

Since then I've also dropped the template-seeding mechanism entirely — agent config lives on the PVC, managed by hand, and only the secrets `.env` is re-rendered from the cluster at boot. Fewer moving parts, same credential flow.

Looking back at all three of these, the thing that stands out is that the credentials were fine every single time. What kept breaking was the plumbing around them — a parser that drops a line without telling anyone, a security boundary doing exactly what it was designed to do, a server with half its tools switched off.

I mean… I spent most of that debugging time staring at the secret itself, which was the one part that was never wrong. So these days I validate config with whatever is actually going to consume it, and I check the bytes on the other end instead of assuming a write landed. Not exciting, but it would have saved me two of those three bugs.
