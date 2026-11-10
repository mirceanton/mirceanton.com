#!/usr/bin/env bash
# Rebuilds the screenshots and the GIF in
# content/post/0010-RouterOS-ZimaBoard-Homelab/img/ from the video's screen
# recordings (1920x1080, 30 fps). The recordings aren't in this repo.
#
#   ./make_images.sh <screen-capture-dir> [output-dir]
#
# output-dir defaults to the post's img/ folder. Needs ffmpeg and uv; Pillow
# does the WebP encoding, since not every ffmpeg build has libwebp. The SMB
# panel labels use macOS's Helvetica Neue (see compose_panels.py).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
cap="${1:?usage: $0 <screen-capture-dir> [output-dir]}"
out="${2:-$here/../../content/post/0010-RouterOS-ZimaBoard-Homelab/img}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"

# name | recording | time (s) | ffmpeg crop ("null" = full 1920x1080 frame)
while IFS='|' read -r name file t crop; do
  ffmpeg -v error -y -ss "$t" -i "$cap/$file" -frames:v 1 -vf "$crop" "$tmp/$name.png"
done <<'LIST'
installer-disk-picker|routeros-install 22.59.40.mov|33|crop=965:88:0:0
installer-packages|routeros-install 22.59.40.mov|56|crop=622:165:0:0
LIST

# PNG -> WebP, lossless (it's all UI and terminal text).
uv run -q --no-project --with pillow python -I - "$tmp" "$out" <<'PY'
import sys, pathlib
from PIL import Image
src, out = map(pathlib.Path, sys.argv[1:3])
for p in sorted(src.glob("*.png")):
    Image.open(p).convert("RGB").save(out / f"{p.stem}.webp", "WEBP", lossless=True, method=6)
    print(p.stem, (out / f"{p.stem}.webp").stat().st_size)
PY

# Tight WinBox panel for the SMB test (write and read side by side).
mkdir -p "$tmp/panels"
ffmpeg -v error -y -ss 25 -i "$cap/nas-test.mov" -frames:v 1 "$tmp/panels/nas-write.png"
ffmpeg -v error -y -ss 75 -i "$cap/nas-test.mov" -frames:v 1 "$tmp/panels/nas-read.png"
uv run -q --no-project --with pillow python -I "$here/compose_panels.py" "$tmp/panels" "$out"

# Full frames with zoom callouts (iperf routing test, combined test).
mkdir -p "$tmp/callouts"
ffmpeg -v error -y -ss 49 -i "$cap/firewall-test.mov" -frames:v 1 "$tmp/callouts/iperf.png"
ffmpeg -v error -y -ss 51 -i "$cap/stress-test.mov"   -frames:v 1 "$tmp/callouts/stress.png"
uv run -q --no-project --with pillow python -I "$here/callouts.py" "$tmp/callouts" "$out"

# WinBox disk wipe: 9.5-32.5 s of nas-setup, top 860 px, sped up 1.5x, 12 fps, 1280 wide.
ffmpeg -v error -y -ss 9.5 -t 23 -i "$cap/nas-setup.mov" \
  -vf "crop=1920:860:0:0,setpts=PTS/1.5,fps=12,scale=1280:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  -loop 0 "$out/nas-winbox-wipe-disks.gif"
ls -la "$out"
