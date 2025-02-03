---
title: "Terraform: No Backend? No Problem!"
description: |
  Recently, I came across a new tool called `terraform-backend-git`. It’s an interesting approach to managing Terraform state. The tool lets you store your state directly in a Git repository, using SOPS for encryption to ensure your data remains secure. In this post, I'll walk you through how it works and share my thoughts on its potential benefits and limitations.

image:
  path: /assets/img/posts/2025-02-03-terraform-state-git/featured.png
  lqip: ""  # TODO`

categories: ""
tags:
  - Terraform
  - Git
  - Encryption
  - sops
  - age

date: 2025-02-03
---

## Introduction

So I've been terraforming quite a bit lately. Since my post about [migrating from OPNsense to MikroTik](https://mirceanton.com/posts/migrating-from-opnsense-to-mikrotik/), where I began automating my entire network setup, I have actually moved to a new apartment! This has pushed me to rework my **entire** network configuration, and along the way, I started rethinking how I manage Terraform state.

## Traditional State Backends

One issue I've always had with `terraform` was choosing an appropriate state backend. Granted, this could very well just be a skill issue on my side, but it was an issue nonetheless.  
I must (shamefully) admit that most often I'm just using the default `local` backend, which stores the state file in a local directory.

The problem with storing state locally is that it isn't really viable for CI workflows. There's no way to run a `terraform plan` or `terraform apply` in CI since the state file is not accessible. Well, that and the fact that if you accidentally delete or lose that file you need to re-build that entire state 😅

Now, the solution here is simple then, right? Just use a *remote* backend solution. It's not like there aren't plenty of options out there!

Well, most (all) remote backends depend on third-party services. The reason for which I'm stating what might be obvious is that in my view, those external services are still infrastructure, and infrastructure should, ideally, be managed as code. The problem arises since provisioning it as code brings us back to square one, needing some infrastructure for our infrastructure-provisioning code.

This required infrastructure can vary in complexity, from an S3 bucket to store the state file plus DyanamoDB for state locking and IAM for managing access to these resources to a fairly trivial setup with a plain-old Postgres database using the `pg` backend.

I only mention the Postgres backend specifically since that is the one I have used most often when it comes to remote state. While it made things much simpler and it can be self-hosted quite easily, compared to MinIO for example, it is still **extra** infrastructure I have to put in place and maintain.

## Storing State in Git?!

One thing is clear: We need **some** sort of external infrastructure or something that can store this state so that we can access it both locally, from our machine, as well as remotely in CI. 

There's no working around it, so the question really is *how can we make it as simple and as convenient as possible?*

At this point, I got thrown back to my GitLab days. Back then, whenever I had some terraform code in a repo I would just make use of the remote state backend that they graciously provide for us. As far as I understand, it was just an HTTP backend you can communicate with, but still. Why can't we have nice things like that on the GitHub side as well?

My solution, at this point, like any self-respecting engineer is to build something myself. I initially cobbled together a solution for my MikroTik-Terraform project using `Taskfile` and `SOPS`. Instead of running `terraform` commands directly, I ran a custom `task` that:

1. decrypts the state and variable files,
2. executes my terraform command, 
3. re-encrypts everything.

This **technically** works. From a functional point of view, it solves all of my problems:

- my state file is no longer bound to my local machine,
- I can access this state file in CI as well by just cloning the repo (assuming my decryption key is imported in my CI run),
- I don't need to manage any extra infrastructure other than the git repo I'd use for my code anyway.

Now for the drawbacks... They're quite troublesome. First of all, there is **no state locking**. On the bright side, I can run `terraform apply` in CI. On the flip side... I can run `terraform apply` in CI 😓

What if my CI runner applies some code and I also try to apply it locally and make some changes. It'll be a mess...

Also, `sops` is **not** idempotent. This means that each run of my fancy `task` jank modified the encrypted state file, even if nothing changed. This will over time pollute my git history too much for my liking.

These pain points led to me just googling for random state backend solutions, an activity I have done quite a few times at this point.  One thing has changed, apparently, which was my search query. At this point, I am searching for ways to store my state in git.

This new combination of keywords got me to a GitHub page of an interesting project, aptly named [`terraform-backend-git`](https://github.com/plumber-cd/terraform-backend-git). Basically, it's' a lightweight HTTP backend for Terraform that intercepts the HTTP requests for Terraform state operations, stores them in Git, and serves them back.  
It almost sounded too good to be true. So I decided to give it a try.

## Prerequisites

The tools we're going to need are:

- `terraform-backend-git` <-- this is the secret sauce
- `terraform`
- `sops` (optional)

Installing everything is rather easy. All of these tools are written in our lord and savior `go` so you can download precompiled binaries, use `go install`, get them via docker containers, or build from source, just to name a few options.

Lately, I've been trying out [`mise`](https://mise.jdx.dev/) as a package manager, so I'll be edgy and cool and use it to install everything:

```bash
backblaze on  main via 💠 default 
❯ mise use terraform
mise ~/Workspace/terraform/backblaze/mise.toml tools: terraform@1.10.4

backblaze on  main via 💠 default 
❯ mise use sops
mise ~/Workspace/terraform/backblaze/mise.toml tools: sops@3.9.4

backblaze on  main via 💠 default 
❯ mise use aqua:plumber-cd/terraform-backend-git
mise ~/Workspace/terraform/backblaze/mise.toml tools: aqua:plumber-cd/terraform-backend-git@0.1.8
```

These commands generated the following `mise.toml` file:

```toml
[tools]
"aqua:plumber-cd/terraform-backend-git" = "latest"
sops = "latest"
terraform = "latest"
```
{: file="mise.toml" }

`mise` has now configured what is more or less like a python virtual environment for all of the tools I need in this project.

## Configuring Terraform

Anyways, what we need to do now is to configure `terraform` to use our fancy-pants new state backend. To do that, we need to define, obviously, a `backend` block:

```hcl
terraform {
 backend "HTTP" {
 address        = "http://localhost:6061/?type=git&repository=https://github.com/mirceanton/backblaze-terraform&ref=main&state=tfstate.json"
 lock_address   = "http://localhost:6061/?type=git&repository=https://github.com/mirceanton/backblaze-terraform&ref=main&state=tfstate.json"
 unlock_address = "http://localhost:6061/?type=git&repository=https://github.com/mirceanton/backblaze-terraform&ref=main&state=tfstate.json"
 }
}
```
{: file="backend.tf" }

You can see here that the HTTP backend is hosted on `localhost` at port `6061`. These are the default settings for the `terraform-backend-git` server. On top of that, we're also passing in 4 variables:

- `type: git`
- `repository: https://github.com/mirceanton/backblaze-terraform`
- `ref: main`
- `state: tfstate.json`

They're all fairly self-explanatory. We specify the repository where our state file is stored, which branch of the repository we want to use and what's the name of the file containing the state. I don't really get the 'type' variable since it's not like this backend supports multiple types of backends. It's probably just a placeholder for future use? 🤔

One thing that is very important here is the `lock_address` and `unlock_address`. These should both be explicitly defined. If they are not defined - Terraform assumes that the backend implementation does not support locking, so it will never attempt to lock the state.

One side-note here, since I found that quite interesting and I plan to look into it some more in the near future - As far as I understand, you can actually deploy this as a standalone application within your infrastructure and use it for multiple projects with various repositories. You can have an instance of this application running in a separate container or a separate server, and then you can configure multiple Terraform projects to use this backend.

And no, the irony of me proposing a standalone application (infrastructure element) for Terraform state management is not lost on me. 🤣

One practical application of this is that you can probably spin it up as a [service container](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers) in your CI runs and have all your steps talk to it directly instead of manually setting it up and tearing it down for each step.

## Configuring the Backend

Back on topic... So we configured Terraform to use an HTTP backend listening locally on port `6061`. Let's start the backend and see what happens:

```bash
backblaze on  main via 💠 default 
❯ terraform-backend-git 
[terraform-backend-git]: WARNING: HTTP basic auth is disabled, please specify TF_BACKEND_GIT_HTTP_USERNAME and TF_BACKEND_GIT_HTTP_PASSWORD
[terraform-backend-git]: listen on 127.0.0.1:6061
```

We get a warning that HTTP basic auth is disabled, but that's okay. Basically, it is complaining that the HTTP server is simply open for anyone to connect to it without any authentication.

We can fix this by setting those environment variables, but we're not going to bother. The HTTP server itself will only be running while terraform is running. Once terraform stops, we'll stop the HTTP server as well.

Let's try to connect to the HTTP server with terraform and see what happens:

```bash
backblaze on  main via 💠 default 
❯ terraform-backend-git &
[terraform-backend-git]: WARNING: HTTP basic auth is disabled, please specify TF_BACKEND_GIT_HTTP_USERNAME and TF_BACKEND_GIT_HTTP_PASSWORD
[terraform-backend-git]: listen on 127.0.0.1:6061

backblaze on  main via 💠 default 
✦ ❯ terraform init
Initializing the backend...
[terraform-backend-git]: Git protocol was http but username was not set
[terraform-backend-git]: Git protocol was http but username was not set
[terraform-backend-git]: Git protocol was http but username was not set
╷
│ Error: Error refreshing state: Failed to get state: GET http://localhost:6061/?type=git&repository=https://github.com/mirceanton/backblaze-terraform&ref=main&state=tfstate.json giving up after 3 attempt(s)

backblaze on  main via 💠 default
✦ ❯ 
```

Oh, how lovely... An error!

Thankfully, the message is fairly straightforward. We're using the HTTP protocol to interact with git but we have not provided a username for authentication. Believe it or not, we're also going to need a token 😅

If we do a `CTRL+F` for `username` in the [README](https://github.com/mircea-pavel-anton/terraform-backend-git/?tab=readme-ov-file#git-credentials) of the project we do indeed find that we can set our git credentials through environment variables. Now if you ask me, I would've probably mentioned this in the initial "usage" section of the README, but well 😅

Anyway, let's just set our environment variables and try again:

```bash
backblaze on  main via 💠 default
❯ export GIT_USERNAME="mr-borboto [bot]"

backblaze on  main via 💠 default
❯ export GITHUB_TOKEN="put-your-own-token-here ;)"

backblaze on  main via 💠 default 
❯ terraform-backend-git &
[terraform-backend-git]: WARNING: HTTP basic auth is disabled, please specify TF_BACKEND_GIT_HTTP_USERNAME and TF_BACKEND_GIT_HTTP_PASSWORD
[terraform-backend-git]: listen on 127.0.0.1:6061

backblaze on  main via 💠 default 
✦ ❯ terraform init
Initializing the backend...
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: state did not existed
Initializing provider plugins...
- Reusing previous version of hashicorp/random from the dependency lock file
- Using previously-installed hashicorp/random v3.6.3

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

**AHA!** It worked!  
I mean don't get me wrong, we haven't pushed anything to git yet, but hey, we did connect to the backend and we initialized our workspace. *Progress!*

## Dummy Code

Let's add some dummy code to our Terraform configuration so that we can test it. We'll create a simple `random_string` resource. This resource will generate a random string of a set length (duh):

```terraform
resource "random_string" "random" {
 length           = 64
 special          = true
 override_special = "/@£$"
}
```
{: file="main.tf" }

## Creating State

> Note that I do have at this point the HTTP server running in the background

We can now try to plan for it to see what happens:

```bash
backblaze on  main via 💠 default 
✦ ❯ terraform plan
Acquiring state lock. This may take a few moments...
[terraform-backend-git]: Locking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: state did not existed

Terraform used the selected providers to generate the following execution plan. Resource
actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # random_string.random will be created
  + resource "random_string" "random" {
      + id               = (known after apply)
      + length           = 64
      + lower            = true
      + min_lower        = 0
      + min_numeric      = 0
      + min_special      = 0
      + min_upper        = 0
      + number           = true
      + numeric          = true
      + override_special = "/@£$"
      + result           = (known after apply)
      + special          = true
      + upper            = true
 }

Plan: 1 to add, 0 to change, 0 to destroy.

────────────────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take
exactly these actions if you run "terraform apply" now.
[terraform-backend-git]: Unlocking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
Releasing state lock. This may take a few moments...
```

Nice! We still haven't pushed anything to our repo yet, but it at least seems to be doing *something*.  
Let's now try to apply this.

```bash
backblaze on  main via 💠 default
✦ ❯ terraform apply
[terraform-backend-git]: Locking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
Acquiring state lock. This may take a few moments...
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: state did not existed

Terraform used the selected providers to generate the following execution plan. Resource
actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # random_string.random will be created
  + resource "random_string" "random" {
      + id               = (known after apply)
      + length           = 64
      + lower            = true
      + min_lower        = 0
      + min_numeric      = 0
      + min_special      = 0
      + min_upper        = 0
      + number           = true
      + numeric          = true
      + override_special = "/@£$"
      + result           = (known after apply)
      + special          = true
      + upper            = true
 }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: 
```

## State Locking

Now... before I go ahead and approve this action, let's take a quick detour.

I mentioned earlier that this backend also supports state locking. The way it accomplishes this is quite ingenious, if I do say so myself.

Essentially, when you run a `terraform apply`, it creates a new branch in your repo to assume ownership of the lock. If anything else tries to run `terraform` commands to acquire it, it will fail since that branch already exists! This way it can ensure state integrity. After the operation is complete it will delete that branch and it's all back to normal.

At this point, since `terraform` is waiting for our response, the state should be locked so others can't apply things at the same time as us. Let's check it out! I'll open up a new terminal and check out what branches we have:

```bash
backblaze on  main via 💠 default
❯ git pull

backblaze on  main via 💠 default
❯ git branch -r
  origin/HEAD -> origin/main
  origin/feat/create-buckets
  origin/locks/tfstate.json #<-- our state lock
  origin/main
```

We can now see here that it created a new branch: `locks/tfstate.json`. 

Technically, this also allows us to do a monorepo of multiple projects as long as we choose a unique state file per project since the format is `locks/<state-file-name>`.

## State Unlocking

If we now approve the pending `apply` command:

```bash
  Enter a value: yes

random_string.random: Creating...
random_string.random: Creation complete after 0s [id=�hz6Ag@Fxe2VaoV7Hq6KEUpkyMZAs7Ad1OZmx36VAMw7nFO2OmboeEN$$VwkjTPg]
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: state did not existed
[terraform-backend-git]: Saving state to https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: Unlocking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
Releasing state lock. This may take a few moments...

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

We can see here that the command succeeded, that the state was saved to our Git repository and, crucially, the state lock was released.

First of all, we can validate that the "lock" branch has been cleared thus the state lock has indeed been released:

```bash
backblaze on  main [⇣] via 💠 default
✦ ❯ git remote prune origin
Pruning origin
URL: https://github.com/mirceanton/backblaze-terraform
 * [pruned] origin/locks/tfstate.json
```

Now we can `pull` to see a new commit to our repo:

```bash
backblaze on  main [⇣] via 💠 default 
✦ ❯ git pull
Updating 8b6f47e..f78f146
Fast-forward
 tfstate.json | 55 +++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 55 insertions(+)
 create mode 100644 tfstate.json
```

And if we check it out, we can see that it contains the state file:

```json
{
  "version": 4,
  "terraform_version": "1.10.5",
  "serial": 1,
  "lineage": "e8969210-0a8d-7daa-aba4-c7108abcbeb0",
  "outputs": {},
  "resources": [
 {
      "mode": "managed",
      "type": "random_string",
      "name": "random",
      "provider": "provider[\"registry.terraform.io/hashicorp/random\"]",
      "instances": [
 {
          "schema_version": 2,
          "attributes": {
            "id": "�hz6Ag@Fxe2VaoV7Hq6KEUpkyMZAs7Ad1OZmx36VAMw7nFO2OmboeEN$$VwkjTPg",
            "keepers": null,
            "length": 64,
            "lower": true,
            "min_lower": 0,
            "min_numeric": 0,
            "min_special": 0,
            "min_upper": 0,
            "number": true,
            "numeric": true,
            "override_special": "/@£$",
            "result": "�hz6Ag@Fxe2VaoV7Hq6KEUpkyMZAs7Ad1OZmx36VAMw7nFO2OmboeEN$$VwkjTPg",
            "special": true,
            "upper": true
 },
          "sensitive_attributes": []
 }
 ]
 }
 ],
  "check_results": null
}
```
{: file="tfstate.json" }


So that's it, right? It worked! We have a working Terraform configuration and we have a state file stored in git. What more can we possibly want?

Well at this point the file is, as you can see, stored in plaintext. Functionally speaking, we only really gained state locking via branches, but we still have a plaintext state file.

## Encrypting the State File

To encrypt the state file, we need to instruct the HTTP backend server to do so.

For better or worse, this part of the configuration is done via environment variables. Personally, I don't like environment variables and I'd prefer a configuration file or something like that, but they're the only way to do this right now.

Complaining aside, I will be using `sops` to encrypt the state file. If you're not familiar with `sops`, I made a [detailed blog](https://mirceanton.com/posts/doing-secrets-the-gitops-way/) post about what it is and how it works. The TLDR is that it's sort of a meta-tool for encrypting files. 

It can encrypt files using various providers, like `gpg`, `aws-kms`, etc. Normally, I quite like to use `age` as my encryption backend. In this case, though, it seems that `age` is not supported, so I'll be using `gpg` instead.

I'm not gonna cover creating a key with `gpg`, so I'll just assume you have one already. You need a fingerprint and you need your private key in your local keychain.

Once set up, you need to set the pgp fingerprint for sops via an environment variable as well:

```bash
backblaze on  main via 💠 default
❯ export TF_BACKEND_HTTP_ENCRYPTION_PROVIDER=sops

backblaze on  main via 💠 default
❯ export TF_BACKEND_HTTP_SOPS_PGP_FP=<YOUR_PGP_FINGERPRINT_HERE>
```

Now let's restart the backend server to make sure it picked up the new environment variables:

```bash
backblaze on  main via 💠 default 
✦ ❯ terraform-backend-git stop
fish: Job 1, 'terraform-backend-git &' terminated by signal SIGTERM (Polite quit request)

backblaze on  main via 💠 default 
❯ terraform-backend-git &
[terraform-backend-git]: WARNING: HTTP basic auth is disabled, please specify TF_BACKEND_GIT_HTTP_USERNAME and TF_BACKEND_GIT_HTTP_PASSWORD
[terraform-backend-git]: listen on 127.0.0.1:6061
```

At this point, we should technically be all set up and ready to go. Let's modify our random string resource, in order to generate a change to our state file and apply our new code:

```bash
backblaze on  main [!?⇣] via 💠 default 
✦ ❯ cat main.tf
resource "random_string" "random" {
  length           = 20
  special          = true
  override_special = "/@£$"
}

backblaze on  main [!?⇣] via 💠 default 
✦ ❯ terraform apply -auto-approve
Acquiring state lock. This may take a few moments...
[terraform-backend-git]: Locking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: sops metadata not found
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: sops metadata not found
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: sops metadata not found
[terraform-backend-git]: Unlocking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
Releasing state lock. This may take a few moments...
╷
│ Error: error loading state: Failed to get state: GET http://localhost:6061/?type=git&repository=https://github.com/mirceanton/backblaze-terraform&ref=main&state=tfstate.json giving up after 3 attempt(s)

backblaze on  main [!?⇣] via 💠 default
✦ ❯ 
```

While it is unfortunate we get an error, at least it's a good one! It is complaining about the sops metadata not being found in the file.

This is happening because we currently have a plaintext version of our state file pushed to git and we're trying to decrypt it, since we now have sops configured. Obviously, that won't work.

To fix this, we need to remove the plaintext version of our state file from git:

```bash
backblaze on  main via 💠 default 
✦ ❯ rm tfstate.json

backblaze on  main [✘!] via 💠 default 
✦ ❯ git add -A && git commit -m "Remove plaintext state file"
[main b068821] Remove plaintext state file
 2 files changed, 1 insertion(+), 39 deletions(-)
 delete mode 100644 tfstate.json

backblaze on  main [⇡] via 💠 default 
✦ ❯ git push origin main
```

Now, let's apply the Terraform configuration again:

```bash
backblaze on  main via 💠 default 
✦ ❯ terraform apply -auto-approve
Acquiring state lock. This may take a few moments...
[terraform-backend-git]: Locking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: state did not existed

Terraform used the selected providers to generate the following
execution plan. Resource actions are indicated with the
following symbols:
  + create

Terraform will perform the following actions:

  # random_string.random will be created
  + resource "random_string" "random" {
      + id               = (known after apply)
      + length           = 20
      + lower            = true
      + min_lower        = 0
      + min_numeric      = 0
      + min_special      = 0
      + min_upper        = 0
      + number           = true
      + numeric          = true
      + override_special = "/@£$"
      + result           = (known after apply)
      + special          = true
      + upper            = true
 }

Plan: 1 to add, 0 to change, 0 to destroy.
random_string.random: Creating...
random_string.random: Creation complete after 0s [id=gJ//ziVZ7wCOsXWSy3/C]
[terraform-backend-git]: Getting state from https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: state did not existed
[terraform-backend-git]: Saving state to https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
[terraform-backend-git]: Activating "pgp" encryption provider
[PGP]    WARN[0007] Deprecation Warning: GPG key fetching from a keyserver within sops will be removed in a future version of sops. See https://github.com/mozilla/sops/issues/727 for more information. 
[terraform-backend-git]: Unlocking state in https://github.com/mirceanton/backblaze-terraform?ref=main&amend=false//tfstate.json
Releasing state lock. This may take a few moments...

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

We can see here that it saved the state to our git repo and that it "activated the pgp encryption provider". Let's check if it worked:

```bash
backblaze on  main [⇣] via 💠 default
✦ ❯ git pull
Updating b068821..9333dc0
Fast-forward
 tfstate.json | 55 +++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 55 insertions(+)
 create mode 100644 tfstate.json

backblaze on  main via 💠 default 
✦ ❯ cat tfstate.json | jq
{
  "version": "ENC[AES256_GCM,data:Gg==,iv:2rf+RTHRdS2OUMyw+3zljKhz/2MB+MD/5Gm3oSLF0Sg=,tag:QYi3cewvM+RDXYPZowXk1w==,type:float]",
  "terraform_version": "ENC[AES256_GCM,data:y6n5Kklo,iv:x8z9GOoa0CgrN84QJ1aIBxGhT2pMj+V6ryGI3GSoaog=,tag:zzCDRVq1HMCwtpCOSyVa+g==,type:str]",
  "serial": "ENC[AES256_GCM,data:Pg==,iv:BkPb4iZbBTb+ZO2FBa4C3MtxjcAsvDaJg3SdMWTdPQ4=,tag:Mf5FShK+UgrEcll7doH61g==,type:float]",
  "lineage": "ENC[AES256_GCM,data:oXS0t+gZwFBjzHr7UNzOePiV8dwC85utHH5UeRYD00KRYr5b,iv:nvPSTB85NAn1RmagedC7nsZCJfAhHAWlJ2Yeiu8LIlA=,tag:dazLWcz706fF4wK9MPpbpA==,type:str]",
  "outputs": {},
  "resources": [
 {
      "mode": "ENC[AES256_GCM,data:Zd1+607iBQ==,iv:087klqn/rSem8oCHmfdburwLyQ5QkzqIuKTC0vDDc28=,tag:FArcNivKjJPWRrDk8Mti9A==,type:str]",
      "type": "ENC[AES256_GCM,data:NfBDTgFai7TjhgSE5g==,iv:OzwYXJZwlF+QreD3qCJmYs3hGvC4irwDsOCXbOA+dYg=,tag:LS4Ui1aM+lZNcKhuD9m7XA==,type:str]",
      "name": "ENC[AES256_GCM,data:VWSFj9XR,iv:LI8oTF8t0oBfilamPmXYqIXc5BvrszzdnI/X6YLifOk=,tag:7gXod9+QDU6zRrlJNhDtqw==,type:str]",
      "provider": "ENC[AES256_GCM,data:IhX44mqxvVRMI4UCcwP++S3NTAJ5HemetKDE2H5yFCiJIGDB+NBWMTOIDC2GL/v0SmA=,iv:Z1mPqmDZnNyMrp2DfpzpB/Drd6tnAEIDqcR0AfXIaBQ=,tag:HTT1a8MbTXqgO47wHt5F0g==,type:str]",
      "instances": [
 {
          "schema_version": "ENC[AES256_GCM,data:Hg==,iv:3Bpz5rITVkVf+Z2dJSplEw1KtX0TqTpmWKCYWQM5gsk=,tag:znmX9irBKLNxcPC/ohvtdg==,type:float]",
          "attributes": {
            "id": "ENC[AES256_GCM,data:BTVZQH0fNTT+TaO4KOel9OorUJ4=,iv:jmcWOcH1mgNuT120852ZKwVlB30QCptRDa4oElzVgtw=,tag:FNINlOG1GZmgAuln2m7rEA==,type:str]",
            "keepers": null,
            "length": "ENC[AES256_GCM,data:XCI=,iv:iLUmhOJOGK4tsSCTUeEhDV9mfkCsNfgXSkzuzNfbJVk=,tag:iSQjeVMlPwCmiIuZQTwN9g==,type:float]",
            "lower": "ENC[AES256_GCM,data:Wbjdlg==,iv:oUrDqeaqFmczfW+xL8gT2J1gy9ig7ncp/G2W4WGw4a4=,tag:IBEokwyzEc6ekNeEBFqMpQ==,type:bool]",
            "min_lower": "ENC[AES256_GCM,data:Hg==,iv:q1RCCpsc26N9hAuDGlxFRzirobRNeegsFIvdjbzmryA=,tag:r68n2POZ7roaNRX5Ogw89Q==,type:float]",
            "min_numeric": "ENC[AES256_GCM,data:VA==,iv:UR4zdom9SSPxD1d6DEoALlwTeq/NPkPNINM9tNg6pYs=,tag:e2xQTYLKEYeIzhN8UiDYag==,type:float]",
            "min_special": "ENC[AES256_GCM,data:QA==,iv:7UPy4vQ6iv/FcDH1GXV0RfDQY8lim8Wx63zGNj0EaMc=,tag:WIT2pQf3tF1HKGOK1iQ/0A==,type:float]",
            "min_upper": "ENC[AES256_GCM,data:Fw==,iv:EdIwrI7yMbbDcZuyXkbH/ejffptV6Igq1A7ybzdR42w=,tag:l+bYwmMB0TW3kcAapAywCw==,type:float]",
            "number": "ENC[AES256_GCM,data:vGOn7g==,iv:KsuTK61UDx7hB38RIE8uwHl47mdUvgsDi5UhMDyKWvs=,tag:h0Z4Gg3NiSbn0cKOfwJgjQ==,type:bool]",
            "numeric": "ENC[AES256_GCM,data:73wv5A==,iv:dN2DIClELry4Ms0Wx1fzNG4NPH0DT3AAVgg/B1vokbQ=,tag:kDUX2h/2SrJIuStSDj73bQ==,type:bool]",
            "override_special": "ENC[AES256_GCM,data:RX8sy4A=,iv:s9mTo4/lZI6Bw3Wo2/GqDTWDKRN/jUU72irybY52VC0=,tag:GwagRz9JEfKtouzq2f4FzA==,type:str]",
            "result": "ENC[AES256_GCM,data:bqdA4UWlK+KU+agFY4VkZ7u0MCk=,iv:5s1fEmTl5EK/iirMEB9+eZ0Zs9BketugwArCvb/upcA=,tag:SgqQhtvPtSpiMxAAPQlkEw==,type:str]",
            "special": "ENC[AES256_GCM,data:Lbxb/w==,iv:oKPfBfeAt92PjCKXxltgZCBwhJ6TRnn+xs2PQNHCOCA=,tag:H2Kjuy37muZJicDFbq+OgQ==,type:bool]",
            "upper": "ENC[AES256_GCM,data:S9HTpg==,iv:S21jKm38DG3LYrQ6Z7BMZ5LDzOBD08ATFLXDIa7GZfM=,tag:x1uH3BIilsDVU6NalnRQQQ==,type:bool]"
 },
          "sensitive_attributes": []
 }
 ]
 }
 ],
  "check_results": null,
  "sops": {
    "kms": null,
    "gcp_kms": null,
    "azure_kv": null,
    "hc_vault": null,
    "age": null,
    "lastmodified": "2025-02-02T23:16:42Z",
    "mac": "ENC[AES256_GCM,data:dR/UHXzWEjViaIG9ACLBV7/MtfmPiuV+NRxsHwSYk0qevm08CAoWI99czjhZIHdCmlZwjtv3AYkCtB7KRXVVLi/LTpicRfF/vdM6tXV1N/0zfIk7NobpVyGKE7BEsjg5yzBzUZD4Dwjv5f0cOjRA6L0bN7e7i4tF+ZfveCkeJWg=,iv:1vla8dgsICqlP4qlVzBvRo99Wr9fujIiwu4eaaqJg1k=,tag:tabvsumxZBo7XW9S+wNmyw==,type:str]",
    "pgp": [
 {
        "created_at": "2025-02-02T23:16:41Z",
        "enc": "-----BEGIN PGP MESSAGE-----\n\nhQIMA7nq6C1ebm/0ARAAstFAZnU0u3VDB9wxpJqV2f/EpyA4XaDwcNZWfIUew1oz\nBYAOrUfT80prHoiKfjU9gO0Nrll37m8bL/noZ+9fspsAualz8Gz6QG3jr2ygHRih\nA+jipUmmN0sPwr0CyqzRVLTIi0FB5RtLB7hswjQaD15+Orep6fxNabEaf7A5lTdI\ns6EB20NFSx/mfDD4AKrkf4g83yrycItqQTxWTBT/gt539NAoq69I/l/0PzPAwq46\n4RKblBjMCtgDOsSGTKKoMaK5tLEW6xRkelO+vwA0E8igcpg8hvH6YikrIj1MTY9T\npglOJ+WjZvkUiXMkknLfSoXaVlzKiM/MtFNn+/7FJmrrx3r7ulsBmtBky96MlrN+\nrQlyJR4N32YBYmfvzaoTipQrxzNGhkxaXXMtlWT1HRSNkPsLKS93p7jw8TIfFbJQ\nK8Q1VDWbstyRZJi/kJOdKHJ7vg7D/9+eabGhuEx74x0zAPJk0iNGJEo9ejQ/PNED\nxaFRlio0NvIb002Q255z9d1u8Wro56qGPIlJlHxQKJrPxLuVqI+nW9pNmNHRz3Q1\nvAMNqdvAuMOov3urXrGOR4+twqoVNZlEXvNhElaMGAkheES6Abo0S+RSzAoCrfDW\nYxOYApYszGe0lx0UUXM1245v3SnbBfZQiHliiZT4DwAN13r7i0yd1rzrXvg6kWTU\naAEJAhDB3FR6cLlGZ6/tIxNSVZlIbfCoEtQrLENadx/MbOtkBV0VcOjeB5rdwE4L\nYxttl7MYqwEw5Ou8G3dAxqKrSJF108tgCEWBXU6yhu7xDKXZ8xeuaInjHTcSHMHc\niTt1MpR2KCLR\n=A85G\n-----END PGP MESSAGE-----\n",
        "fp": "60A6849DA8C872ED5E3803E3CAE4C9DA0D9FDDC0"
 }
 ],
    "version": "3.7.3"
 }
}
```

There we go! An encrypted state file :teardrop:

## Decrypting the State File

The cool thing about it is, we can just use sops as usual to decrypt it.

We need a sops config to parse the `tfstate.json` file:

```yaml
---
creation_rules:
  # Terraform State
 - path_regex: tfstate.json
    encrypted_regex: ".*"
    pgp: "60A6849DA8C872ED5E3803E3CAE4C9DA0D9FDDC0"
```
{: file='.sops.yaml'}

And then we can just `sops decrypt` the file to get our state:

```bash
backblaze on  main via 💠 default 
✦ ❯ sops decrypt tfstate.json | jq
{
  "version": 4,
  "terraform_version": "1.10.5",
  "serial": 1,
  "lineage": "fed9cdb3-5178-31b4-31a9-d7fcf187aa93",
  "outputs": {},
  "resources": [
 {
      "mode": "managed",
      "type": "random_string",
      "name": "random",
      "provider": "provider[\"registry.terraform.io/hashicorp/random\"]",
      "instances": [
 {
          "schema_version": 2,
          "attributes": {
            "id": "iwiEPb�Nx0�EDBqk2nXSsy/JcKZ@DeRQIU4zumh2wfiGQW9EaA$q7MFvElKBlU@v",
            "keepers": null,
            "length": 20,
            "lower": true,
            "min_lower": 0,
            "min_numeric": 0,
            "min_special": 0,
            "min_upper": 0,
            "number": true,
            "numeric": true,
            "override_special": "/@£$",
            "result": "iwiEPb�Nx0�EDBqk2nXSsy/JcKZ@DeRQIU4zumh2wfiGQW9EaA$q7MFvElKBlU@v",
            "special": true,
            "upper": true
 },
          "sensitive_attributes": []
 }
 ]
 }
 ],
  "check_results": null
}
```

This means that even if at some point we want to move away from this backend and use a different one, we will have no problem doing so. Even if we can't get a hold of the binary to start the server again for whatever reason, we can simply decrypt the file ourselves using `sops` and fall back to the `local` backend configuration. 

## The Good, the Bad, and the Ugly

Now... I don't really like a few things here. Let's take a closer look at the commit that updates the state:

```bash
backblaze on  main via 💠 default 
✦ ❯ git log -n 1
commit f78f14626eb2da480f518ae6f99aee65d689f442 (HEAD -> main, origin/main, origin/HEAD)
Author: Mircea <mircea@mdesktop>
Date:   Sun Feb 2 23:37:11 2025 +0200
    Update tfstate.json
```

Generally, I like my commits conventional. I (try to) follow the [conventional commit specification](https://www.conventionalcommits.org/en/v1.0.0/) as much as possible. Thus, I'd prefer that the commit message be something like `chore: Update tfstate.json` or something like that.

Secondly, the commit author seems to default to `username@hostname`. I do have a GitHub app called `mr-borboto` I configured for my org to interact with my repos, but this does not seem to be possible *yet*.

For the first problem, I opened an [issue](https://github.com/plumber-cd/terraform-backend-git/issues/51) and tried my hand at a [PR](https://github.com/plumber-cd/terraform-backend-git/pull/52) to fix it. I'm not sure if this is the right way to do things or not, but we'll see what happens. 

For the second, I just opened an [issue](https://github.com/plumber-cd/terraform-backend-git/issues/53) for now. I'll see if I have the time and brainpower to also put together a PR, but for now, this will do.

Given what the project is and all it accomplishes, I wouldn't say these are major issues at all. They're definitely things that could be improved upon in future versions of the project, but by no means are they deal-breakers.

## Wrapping Up

That's it for my thoughts on and experience with the `terraform-backend-git` project.  
I hope you found my post helpful! If you have any more questions or need further clarification on anything, feel free to ask. I'm happy to help! 🤗
