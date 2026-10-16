---
title: "Home Ops"
description: |
  GitOps repository for my homelab Kubernetes cluster — a bare-metal Talos Linux cluster continuously reconciled by Flux.
image: { path: featured.svg, alt: "Home Ops hero image" }
github: https://github.com/mirceanton/home-ops
languages: [shell]
stars: 119
weight: 3
---

[GitOps](https://opengitops.dev/) repository for my homelab Kubernetes cluster: a bare-metal [Talos Linux](https://www.talos.dev/) cluster, continuously reconciled by [Flux](https://fluxcd.io/).

## Scope

This repo holds everything running on the cluster:

- **OS & node config** — Talos Linux machine configuration, patches, and system extensions
- **Cluster bootstrap** — the minimal, one-time Helmfile bootstrap that gets Flux running
- **Platform components** — CNI, ingress, DNS, TLS, secrets, storage, databases, and observability
- **Application workloads** — everything from AI/LLM tooling to media, home automation, games, and productivity apps
- **Reusable building blocks** — Kustomize components for common patterns like Postgres, Redis-compatible caches, backups, and OIDC clients

## Core Tools

| Category | Tool | Purpose |
| --- | --- | --- |
| OS | [Talos Linux](https://www.talos.dev/) | Immutable, API-managed, minimal Kubernetes OS |
| GitOps engine | [Flux](https://fluxcd.io/) | Continuously reconciles the cluster against this repo |
| Package manager | [Helm](https://helm.sh/) | Templating & lifecycle for every platform/app chart |
| Manifest layering | [Kustomize](https://kustomize.io/) | Composes/patches manifests per app |
| Secrets at rest | [SOPS](https://github.com/getsops/sops) + [age](https://github.com/FiloSottile/age) | Encrypts secrets committed to git |
| Secrets at runtime | [External Secrets Operator](https://external-secrets.io/) + 1Password Connect | Syncs live secrets from 1Password into the cluster |
| Dependency updates | [Renovate](https://docs.renovatebot.com/) | Automated PRs for chart/image/tool version bumps |

View the full repository structure and every platform component on [GitHub](https://github.com/mirceanton/home-ops).
