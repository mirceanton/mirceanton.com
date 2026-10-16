#!/usr/bin/env python3
"""Sync `stars` and `languages` front matter on content/projects/*/index.md
from the GitHub API. Edits only those two front-matter lines in place so
everything else in the file (field order, the description block scalar,
the markdown body) is left byte-for-byte untouched.

Repos that don't resolve (private, renamed, or the REPLACE_ME placeholder
entries) are skipped with a warning rather than failing the run, so one
stale/placeholder project never blocks the others from updating.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

PROJECTS_DIR = Path("content/projects")
TOP_N_LANGUAGES = 3
MIN_LANGUAGE_SHARE = 0.05  # ignore incidental languages (vendored files, a stray Dockerfile, etc.)
API_BASE = "https://api.github.com"


def gh_api(path, token):
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def split_front_matter(text):
    """Return (front_matter_text_with_trailing_newline, body) or (None, text)."""
    m = re.match(r"^---\n(.*?\n)---\n", text, re.S)
    if not m:
        return None, text
    return m.group(1), text[m.end():]


def parse_github_slug(url):
    m = re.search(r"github\.com/([^/\s]+)/([^/\s]+?)/?$", url.strip())
    return (m.group(1), m.group(2)) if m else None


def set_scalar_field(fm_text, key, value_literal):
    """Replace a single-line `key: ...` field, or insert it after `github:`
    if it doesn't exist yet."""
    line_pattern = re.compile(rf"^{re.escape(key)}:.*$", re.M)
    new_line = f"{key}: {value_literal}"
    if line_pattern.search(fm_text):
        return line_pattern.sub(new_line, fm_text, count=1)
    github_line_pattern = re.compile(r"^(github:.*)$", re.M)
    if github_line_pattern.search(fm_text):
        return github_line_pattern.sub(rf"\1\n{new_line}", fm_text, count=1)
    return fm_text.rstrip("\n") + f"\n{new_line}\n"


def main():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("::error::GITHUB_TOKEN env var is required", file=sys.stderr)
        return 1

    project_files = sorted(PROJECTS_DIR.glob("*/index.md"))
    if not project_files:
        print(f"No project files found under {PROJECTS_DIR}/")
        return 0

    any_changed = False

    for path in project_files:
        text = path.read_text(encoding="utf-8")
        fm_text, body = split_front_matter(text)
        if fm_text is None:
            print(f"::warning::{path}: no front matter found, skipping")
            continue

        gh_match = re.search(r"^github:\s*(\S+)\s*$", fm_text, re.M)
        if not gh_match:
            print(f"{path}: no github: field, skipping")
            continue

        slug = parse_github_slug(gh_match.group(1))
        if not slug:
            print(f"::warning::{path}: couldn't parse a github.com owner/repo from {gh_match.group(1)!r}, skipping")
            continue
        owner, repo = slug

        try:
            repo_data = gh_api(f"/repos/{owner}/{repo}", token)
            lang_data = gh_api(f"/repos/{owner}/{repo}/languages", token)
        except urllib.error.HTTPError as e:
            print(f"::warning::{path}: {owner}/{repo} returned {e.code} {e.reason}, skipping")
            continue
        except urllib.error.URLError as e:
            print(f"::warning::{path}: failed to reach GitHub API for {owner}/{repo} ({e.reason}), skipping")
            continue

        stars = repo_data.get("stargazers_count", 0)

        total_bytes = sum(lang_data.values()) or 1
        significant_langs = [
            (name, n) for name, n in lang_data.items()
            if n / total_bytes >= MIN_LANGUAGE_SHARE
        ]
        top_langs = sorted(significant_langs, key=lambda kv: kv[1], reverse=True)[:TOP_N_LANGUAGES]
        lang_keys = [name.lower().replace(" ", "-") for name, _ in top_langs]
        languages_literal = "[" + ", ".join(lang_keys) + "]"

        new_fm = set_scalar_field(fm_text, "stars", str(stars))
        new_fm = set_scalar_field(new_fm, "languages", languages_literal)

        if new_fm != fm_text:
            path.write_text(f"---\n{new_fm}---\n{body}", encoding="utf-8")
            print(f"Updated {path}: stars={stars} languages={lang_keys}")
            any_changed = True
        else:
            print(f"{path}: already up to date (stars={stars} languages={lang_keys})")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as f:
            f.write(f"changed={'true' if any_changed else 'false'}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
