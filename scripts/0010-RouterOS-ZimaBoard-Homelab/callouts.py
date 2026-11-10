"""Full-frame screenshots with zoom callouts for the blog post.

The frame is dimmed, each source region is outlined and re-lit, and a magnified
copy of it (an inset) is placed over a low-value part of the screen with a
connector line back to the source. Insets are scaled pixels of the same frame.

    python callouts.py <frames-dir> <out-dir>

Expects in <frames-dir> (make_images.sh extracts them):
    iperf.png    firewall-test.mov @ 49 s
    stress.png   stress-test.mov @ 51 s
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ACCENT = (255, 216, 77)     # brand amber, #FFD84D
DIM = 0.38                  # brightness of everything outside the callouts
BORDER = 4
SHADOW = 18

# name -> list of (source box, zoom, inset top-left)
SPECS = {
    "routing-iperf-test": ("iperf.png", [
        # iperf3 client on the Mac: header + first rows, Bitrate column
        ((0, 650, 445, 722), 2.4, (24, 96)),
        # WinBox interfaces: br0 / ether1 / ether2, Tx and Rx
        ((1146, 145, 1730, 237), 2.0, (712, 300)),
        # status bar CPU
        ((1745, 1013, 1822, 1045), 3.0, (1600, 840)),
    ]),
    "everything-at-once-winbox": ("stress.png", [
        # interfaces: br0 / ether1 / ether2, Name..Rx
        ((192, 145, 760, 237), 1.9, (800, 400)),
        # status bar: CPU and memory
        ((915, 1043, 1290, 1078), 2.4, (980, 760)),
    ]),
}


def box_edge_point(box, toward):
    """Point on box's edge closest to the centre of `toward` (another box)."""
    x0, y0, x1, y1 = box
    tx = (toward[0] + toward[2]) / 2
    ty = (toward[1] + toward[3]) / 2
    return (min(max(tx, x0), x1), min(max(ty, y0), y1))


def render(frame: Image.Image, callouts) -> Image.Image:
    out = ImageEnhance.Brightness(frame).enhance(DIM)
    draw = ImageDraw.Draw(out)
    placed = []
    for src, zoom, (ix, iy) in callouts:
        out.paste(frame.crop(src), src[:2])                       # re-light the source
        w, h = src[2] - src[0], src[3] - src[1]
        inset = frame.crop(src).resize((round(w * zoom), round(h * zoom)), Image.LANCZOS)
        dst = (ix, iy, ix + inset.width, iy + inset.height)
        placed.append((src, dst, inset))

    # connectors first, so insets sit on top of them
    for src, dst, _ in placed:
        a = box_edge_point(src, dst)
        b = box_edge_point(dst, src)
        draw.line([a, b], fill=ACCENT, width=3)

    for src, dst, inset in placed:
        draw.rectangle([src[0] - 3, src[1] - 3, src[2] + 3, src[3] + 3], outline=ACCENT, width=3)
        shadow = Image.new("RGBA", out.size, (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rectangle(
            [dst[0] - BORDER + 6, dst[1] - BORDER + 8, dst[2] + BORDER + 6, dst[3] + BORDER + 8],
            fill=(0, 0, 0, 170))
        shadow = shadow.filter(ImageFilter.GaussianBlur(SHADOW))
        out = Image.alpha_composite(out.convert("RGBA"), shadow).convert("RGB")
        draw = ImageDraw.Draw(out)
        draw.rectangle([dst[0] - BORDER, dst[1] - BORDER, dst[2] + BORDER - 1, dst[3] + BORDER - 1], fill=ACCENT)
        out.paste(inset, dst[:2])
    return out


def main(src: Path, out: Path) -> None:
    for name, (frame_file, callouts) in SPECS.items():
        frame = Image.open(src / frame_file).convert("RGB")
        img = render(frame, callouts)
        f = out / f"{name}.webp"
        img.save(f, "WEBP", lossless=True, method=6)
        print(name, img.size, f.stat().st_size)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
