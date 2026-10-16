---
title: "talstomize"
description: |
  Like Kustomize, but for Talos Linux machine configuration.
image: { path: featured.svg, alt: "talstomize hero image" }
github: https://github.com/mirceanton/talstomize
languages: [go]
stars: 29
weight: 5
---

Renders per-node [Talos Linux](https://www.talos.dev) machine configuration from a single declarative file: default cluster settings plus a list of nodes, with patches layered on by role (`controlplane`/`worker`) and then by individual node — the same bases-and-overlays mental model as Kustomize, applied to `talosctl gen config` output instead of Kubernetes manifests.

## Install

```shell
brew tap mirceanton/taps
brew install talstomize
```

Precompiled binaries, a Docker image, and `go install` support are also available — see the [GitHub Releases page](https://github.com/mirceanton/talstomize/releases/latest).

## Usage

1. Generate a secrets bundle once per cluster (`talstomize` never generates or rotates secrets itself):

   ```shell
   talosctl gen secrets -o talos-secrets.yaml
   ```

2. Write a `talstomize.yaml` describing the cluster, its nodes, and any patches to layer on — see the [GitHub repo](https://github.com/mirceanton/talstomize) for the full config reference.

`talstomize apply`/`talstomize diff` shell out to `talosctl` (and to `sops`, if the secrets bundle is encrypted), so both need to be on `PATH`.
