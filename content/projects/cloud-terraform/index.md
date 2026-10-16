---
title: "Cloud Terraform"
description: |
  OpenTofu configurations for the cloud services I use outside of the homelab, orchestrated via Terragrunt.
image: { path: featured.svg, alt: "Cloud Terraform hero image" }
github: https://github.com/mirceanton/cloud-terraform
languages: [hcl]
stars: 0
weight: 6
---

[OpenTofu](https://opentofu.org/) configurations for the cloud services I use outside of the homelab, orchestrated via [Terragrunt](https://terragrunt.gruntwork.io/).

## Managed Services

- **[Cloudflare](https://www.cloudflare.com/)** — DNS zones and records for my domains
- **[Backblaze](https://www.backblaze.com/)** — B2 object storage buckets
- **[Migadu](https://www.migadu.com/)** — email hosting configuration

Secrets are injected from 1Password at apply time rather than committed to the repo, and remote state lives in a Backblaze B2 bucket managed by this same configuration.
