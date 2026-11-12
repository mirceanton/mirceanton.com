---
title: About
layout: about
menu:
  main:
    name: About
    weight: 6
    pre: fa-info-circle

description: DevOps engineer from Bucharest. Platform engineering by day, an over-engineered homelab by night, and videos about both.
banner: img/banner-2026.png # under assets/
heading: Hi, I'm Mircea 👋
lede: DevOps engineer from Bucharest, Romania. I automate infrastructure for a living, then go home and automate some more, mostly to find out what breaks.

facts:
  - { k: Based in, v: "Bucharest, Romania" }
  - { k: Day job, v: "Platform team, Raiffeisen Bank" }
  - { k: Certified, v: "Kubestronaut" }
  - { k: Speaking, v: "CloudNativeDays Romania 2026, OmniOpenCon 2025" }
  - { k: Homelab, v: "Proxmox + Ceph, Talos, MikroTik" }

links:
  - { icon: youtube, url: "https://www.youtube.com/@mirceanton", label: "@mirceanton" }
  - { icon: github, url: "https://github.com/mirceanton", label: "mirceanton" }
  - { icon: linkedin, url: "https://www.linkedin.com/in/mirceanton", label: "in/mirceanton" }
  - { icon: link, url: "https://links.mirceanton.com", label: "links.mirceanton.com" }
  - { icon: mail, url: "mailto:mircea@mirceanton.com", label: "mircea@mirceanton.com" }

resume: /docs/Resume.pdf
---

## The day job

I'm on the platform team at Raiffeisen Bank. There are four of us, and we run 75+ production apps across five Kubernetes clusters. A team that small only keeps up by automating nearly everything, from "I need a repo" to "my app is in production and keeps itself up to date". I told the whole story at [CloudNativeDays Romania 2026](/talks/cloud-native-days-romania-2026/).

## The homelab

It started with "computers are interesting" and got slightly out of hand. Custom-built servers, Raspberry Pi clusters, a DIY OPNsense router that lost its job to a MikroTik RB5009, and now a three-node Proxmox cluster running [Ceph](/posts/setting-up-ceph-in-my-proxmox-cluster/), because one NAS is a single point of failure and I'm done pretending otherwise.

Kubernetes runs on [Talos Linux](/posts/the-best-os-for-kubernetes/), the network is [managed with Terraform](/posts/mikrotik-terraform-getting-started/), and the secrets live in Git, [encrypted](/posts/doing-secrets-the-gitops-way/). Is it overkill for a home network? Absolutely. That's the fun part.

## Videos and this blog

I make [videos](https://www.youtube.com/@mirceanton) about all of it: the wins, the failures, and the late nights in between. This blog is the companion. It has the full configs, the details that didn't fit in a video, and posts that get updated when a new release fixes (or breaks) something.

## Say hi

Spotted a mistake, have a question, or want to compare homelabs? My inbox is open, and so are the YouTube comments.
