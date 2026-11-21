---
title: Keycloak Kept Logging Me Out Every 30 Minutes
slug: keycloak-logout-every-30-minutes
date: "2026-11-21"
image: { path: featured.webp }
draft: false

categories: [Blog Post]
tags:
  - Keycloak
  - OIDC
  - OAuth
  - SSO
  - Hermes
  - GitOps
  - Homelab

description: |
  Every app behind my Keycloak realm forgot me after half an hour of idle,
  on every device. The token refresh was working fine — the refresh tokens
  were dying with the SSO session. Here's how the audit log proved it, and
  the one OAuth scope that fixed it.
---

Every web app in my homelab logs in through Keycloak, and for months they all had the same habit: leave a tab alone for half an hour, come back, and I'm looking at the login screen again. The browser did it, the desktop app did it, and on the phone it was worse — some days the Android app would spend hours quietly retrying a dead token without ever asking me to log in.

I was fairly sure the token refresh in my dashboard was broken. So I went to prove it from the logs, and the logs said the opposite.

## The refresh was working

The dashboard runs on [Hermes](https://hermes-agent.nousresearch.com), which writes an audit event for every auth decision to a JSONL log. I parsed the log going back to July and bucketed the events.

While I was actively using an app, refresh worked exactly as designed: 5,736 silent refreshes, roughly one every five minutes, which is the access token's lifetime. Tokens were rotating in the background without me noticing anything.

Every forced re-login had the same shape. A last successful refresh, then a long quiet stretch, then a refresh attempt that Keycloak rejected with `invalid_grant`. There were 163 expired-refresh failures in total, 161 of them with gaps I could measure. Of those, 127 came after idle gaps longer than 30 minutes — the median gap was 91 minutes, and the longest was ten days. The short-gap exceptions were most likely stale tokens from other tabs and devices, which is what you get when the audit log has no session IDs and you measure gaps across all of them. The desktop and Android apps had racked up 23,009 failed refreshes on the same theme, most of them retry storms where the app kept presenting a token that had died while the device slept.

So the client was doing its job. Something server-side was killing tokens on a schedule, and 30 minutes was a suspiciously round number.

## Refresh tokens don't have a lifetime of their own

And it was exactly that round: a default I'd never looked at. My Keycloak realm is managed by an operator from a Git repository, and the realm definition in Git sets exactly one thing: the realm's name. No timeout overrides, so Keycloak's defaults apply — SSO session idle timeout of 30 minutes, SSO session max lifespan of 10 hours, access tokens valid for 5 minutes.

The part I hadn't internalized is that in Keycloak, a refresh token has no independent lifetime. It's bound to the SSO session and dies when that session dies. Leave everything idle for 30 minutes and the session is invalidated server-side. The refresh token in my cookie was still sitting there looking perfectly valid, but the next time it was presented, Keycloak said `invalid_grant`. The client can't know the token is dead until it tries to use it, which is exactly why the phone apps kept retrying.

> In Keycloak, an ordinary refresh token lives and dies with the SSO session. Idle past the session timeout and the token is revoked server-side, no matter what the client thinks it still holds.
{.prompt-info}

There was a second half to this. At login, Hermes requested the scopes `openid profile email`. That gets you an _online_ token, bound to the session. Keycloak has a whole parallel mechanism for long-lived sessions, and I wasn't asking for it.

One more dead end worth knowing about: Keycloak does have per-client session timeout overrides, but they can only shorten a session, never extend it past the realm's SSO values. "Just raise the timeout for this one client" — my first idea — is not a fix.

## One scope, one client

There were two real options. Raise the realm's SSO idle and max timeouts, which fixes every app at once but loosens the whole realm. Or request the `offline_access` scope, which is Keycloak's mechanism for sessions that outlive the SSO session: an offline refresh token gets its own offline session, idle timeout of 30 days by default, and it keeps working after the browser session is long gone.

I went with the second, scoped to the Hermes client only. The GitOps change was ten lines across three files:

- The shared `keycloak-client` component gained an `optionalClientScopes` field, fed by a variable that defaults to `null`. The operator treats an explicit null as "leave the scope assignments alone", so every other app using the component was untouched.
- Hermes sets that variable to `["offline_access"]`, and its OIDC scopes env var becomes `openid profile email offline_access`. One env var covers the web dashboard, desktop and Android, because the same login code builds both the browser redirect and the native app flow.

The operator detail that surprised me: when it reconciled, the logs showed it _removing_ four optional scopes the client didn't need (`organization`, `microprofile-jwt`, `address`, `phone`) — and no line about adding `offline_access`. Keycloak assigns `offline_access` as a default optional scope when a client is created. It had been sitting on the client the whole time, available. Hermes had just never requested it, so it was never granted.

One caveat if you run Keycloak from Git like this: changes made in the admin UI get reverted on the next reconcile. The fix has to land in the repo, which is where it landed — a small PR, reviewed and merged like everything else.

The thing I had to actually decide is that an offline token is a longer-lived credential by design. It survives the browser session, which is the whole point, and that also means revoking it isn't a matter of closing a tab — it's an offline session you go kill in Keycloak. I'm treating that as a temporary trade-off. Anyone with a user in Keycloak can log in to Hermes today, and limiting that by group is a task I've been putting off. What makes it acceptable for now is that the whole setup sits behind a VPN with a small set of users, so realistically I'm the only one logging in. The group restriction is planned, and until it lands I'd think a lot harder about offline tokens on anything with real users.

## Six days later

The rollout itself was uneventful. The PR merged, Flux applied it, the client CR reported synchronized, and the new pod came up with the scopes in its environment. Existing sessions kept their online tokens until those died, so each device needed one last re-login, and then everything was on offline tokens.

The audit log since the merge: 952 silent refreshes, zero expired-refresh failures, zero native retry storms. Thirty-nine of those refreshes happened after idle gaps longer than 30 minutes — the old kill threshold. The longest gap between two successful silent refreshes was about 39 hours. I left things alone for a day and a half, came back, and the dashboard just worked.

The access tokens still expire every five minutes and still rotate in the background. What changed is that the thing doing the rotating no longer dies when I step away from the keyboard.
