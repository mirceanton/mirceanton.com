---
title: "ExternalDNS Provider for Mikrotik"
description: |
  An ExternalDNS webhook provider that syncs Kubernetes Ingress/Service DNS records straight into MikroTik RouterOS.
image: { path: featured.svg, alt: "ExternalDNS Provider for Mikrotik hero image" }
github: https://github.com/mirceanton/external-dns-provider-mikrotik
languages: [go]
stars: 131
weight: 2
---

A [webhook provider](https://github.com/kubernetes-sigs/external-dns) for [ExternalDNS](https://github.com/kubernetes-sigs/external-dns) that automates DNS records from a Kubernetes cluster straight into a MikroTik router — no manual record-keeping between the cluster and the router's DNS server.

Supports `A`, `AAAA`, `CNAME`, `MX`, `NS`, `SRV`, and `TXT` record types, configurable either via CRDs or Ingress/Service annotations.

## Requirements

- ExternalDNS `>= v0.15.0` (for `providerSpecific` annotation support)
- MikroTik RouterOS (tested on `7.16` stable)

## Status

Released as `v1.0.0`, but still under active development — issues and feedback are welcome on [GitHub](https://github.com/mirceanton/external-dns-provider-mikrotik).
