---
title: "Mikrotik Terraform"
description: |
  OpenTofu automation for my entire MikroTik-powered home network, applied and orchestrated via Terragrunt.
image: { path: featured.svg, alt: "Mikrotik Terraform hero image" }
github: https://github.com/mirceanton/mikrotik-terraform
languages: [hcl]
stars: 135
weight: 1
---

[OpenTofu](https://opentofu.org/) automation for my entire MikroTik-powered home network, applied and orchestrated via [Terragrunt](https://terragrunt.gruntwork.io/) — a structured, repeatable way to manage MikroTik devices as Infrastructure as Code instead of clicking through WinBox.

## Devices Managed

- **RB5009 router** — main router, firewall, and CAPsMAN server
- **cAP AX access point** — provisioned via CAPsMAN
- **CRS317 switch** — high-performance 10G switch for server connectivity
- **CRS326 switch** — main rack switch
- **Hex switch** — living room switch

## Why Terraform for a Router?

Manual network configuration (ClickOps) doesn't scale and isn't reproducible. Defining VLANs, DHCP, DNS, firewall rules, and WireGuard peers as code means the whole network configuration can be reviewed, versioned, and rebuilt from scratch if a device dies.

Reusable pieces of this setup have been split out into their own modules: [`terraform-modules-routeros`](https://github.com/mirceanton/terraform-modules-routeros), [`terraform-modules-1password`](https://github.com/mirceanton/terraform-modules-1password), and [`terraform-modules-cloudflare`](https://github.com/mirceanton/terraform-modules-cloudflare).
