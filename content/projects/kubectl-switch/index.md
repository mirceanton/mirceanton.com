---
title: "kubectl-switch"
description: |
  A CLI tool for managing and switching between multiple kubeconfig files without merging them.
image: { path: featured.svg, alt: "kubectl-switch hero image" }
github: https://github.com/mirceanton/kubectl-switch
languages: [go, shell]
stars: 60
weight: 4
---

A command-line tool for managing and switching between multiple Kubernetes configuration files living in the same directory — dump every `kubeconfig` into one folder and let `kubectl-switch` manage them, with no merging required.

## Why Not `kubectx`/`kubens`/`kubie`?

- `kubectx`/`kubens` assume every context lives in one merged config file — workable with `KUBECONFIG` hackery, but not a workflow I like
- `kubie` spawns a new shell on every context switch, which makes it awkward to script or use from a Taskfile

`kubectl-switch` instead just "physically" swaps the active file into `.kube/config` (or wherever `KUBECONFIG` points), so the change is simple and persists across shells.

## Features

- Manage multiple kubeconfig files in a single directory, unmerged
- Switch contexts *and* namespaces across files
- Interactive and non-interactive modes, with tab completion

## Install

```shell
brew tap mirceanton/taps
brew install kubectl-switch
```

Precompiled binaries, a Docker image, and `go install` support are also available — see the [GitHub Releases page](https://github.com/mirceanton/kubectl-switch/releases/latest).
