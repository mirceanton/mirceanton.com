#!/usr/bin/env bash
# Rebuild the theme's web fonts from the brand kit's originals.
#
# The brand kit (mirceanton YouTube workspace, brand/fonts/) holds full Inter OTFs and
# DejaVu Sans Mono Bold, about 600 KB each. This keeps Latin, Latin Extended-A and the
# Romanian comma-below letters (ș ț), plus common punctuation and arrows, and writes
# woff2 files of about 30 KB into assets/fonts/.
#
# Usage: scripts/subset-fonts.sh /path/to/brand/fonts
# Needs uv (https://docs.astral.sh/uv/); fonttools is fetched on the fly.
set -euo pipefail

src="${1:?usage: $0 /path/to/brand/fonts}"
out="$(cd "$(dirname "$0")/.." && pwd)/assets/fonts"
unicodes="U+0000-00FF,U+0100-017F,U+0218-021B,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2264-2265,U+25A0-25FF,U+2713-2717"
subset() { uvx --from 'fonttools[woff]' pyftsubset "$@" --unicodes="$unicodes" --flavor=woff2; }

for weight in Regular Bold ExtraBold Black; do
  subset "$src/Inter-$weight.otf" --layout-features='kern,liga,calt,tnum,case,ss01,cv11' \
    --output-file="$out/Inter-$weight.woff2"
done
subset "$src/DejaVuSansMono-Bold.ttf" --output-file="$out/DejaVuSansMono-Bold.woff2"
ls -la "$out"
