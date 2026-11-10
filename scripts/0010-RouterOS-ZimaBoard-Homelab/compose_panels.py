"""Compose tight WinBox panels for the blog post from full 1920x1080 frames.

Each panel stacks only the rows that matter (interface Tx/Rx, the CPU profile's
ksmbd and total rows) on WinBox's own background, under a label.
Rows are cut from the real frame at their real size, nothing is redrawn.

    python compose_panels.py <frames-dir> <out-dir>

Expects these frames in <frames-dir> (make_images.sh extracts them):
    nas-write.png   nas-test.mov @ 25 s
    nas-read.png    nas-test.mov @ 75 s
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BG = (28, 36, 43)          # WinBox window background
LABEL = (205, 211, 217)
DIVIDER = (50, 61, 70)
PAD, GROUP_GAP, PANEL_GAP, LABEL_H = 20, 14, 28, 40
FONT = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 24, index=1)  # bold

# Interfaces table: Name, Tx and Rx columns, header plus br0/ether1/ether2.
NAS_TABLE = (320, 112, 900, 238)
PROFILE_HEADER = (835, 503, 1460, 535)


def panel(frame, label, groups):
    """groups: list of groups; each group is a list of crop boxes stacked flush."""
    blocks = []
    for boxes in groups:
        parts = [frame.crop(b) for b in boxes]
        g = Image.new("RGB", (max(p.width for p in parts), sum(p.height for p in parts)), BG)
        y = 0
        for p in parts:
            g.paste(p, (0, y))
            y += p.height
        blocks.append(g)
    w = max(b.width for b in blocks) + 2 * PAD
    h = LABEL_H + sum(b.height for b in blocks) + GROUP_GAP * (len(blocks) - 1) + 2 * PAD
    out = Image.new("RGB", (w, h), BG)
    ImageDraw.Draw(out).text((PAD, PAD), label, font=FONT, fill=LABEL)
    y = PAD + LABEL_H
    for b in blocks:
        out.paste(b, (PAD, y))
        y += b.height + GROUP_GAP
    return out


def side_by_side(panels):
    w = sum(p.width for p in panels) + PANEL_GAP * (len(panels) - 1)
    h = max(p.height for p in panels)
    out = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(out)
    x = 0
    for i, p in enumerate(panels):
        out.paste(p, (x, 0))
        x += p.width
        if i < len(panels) - 1:
            d.line([(x + PANEL_GAP // 2, PAD), (x + PANEL_GAP // 2, h - PAD)], fill=DIVIDER, width=2)
            x += PANEL_GAP
    return out


def main(src, out):
    write = Image.open(src / "nas-write.png").convert("RGB")
    read = Image.open(src / "nas-read.png").convert("RGB")

    nas = side_by_side([
        panel(write, "Writing to the share", [
            [NAS_TABLE],
            [PROFILE_HEADER, (835, 659, 1460, 721)],                          # ksmbd, total
        ]),
        panel(read, "Reading it back", [
            [NAS_TABLE],
            [PROFILE_HEADER, (835, 720, 1460, 751), (835, 843, 1460, 874)],   # ksmbd / total
        ]),
    ])
    nas.save(out / "nas-smb-test.webp", "WEBP", lossless=True, method=6)

    for n in ("nas-smb-test",):
        f = out / f"{n}.webp"
        print(n, Image.open(f).size, f.stat().st_size)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
