#!/usr/bin/env python3
"""English overlay for the head exploded video: bone-name pills with leader lines
+ bottom subtitle band (narration text, word-for-word). No title card.
Usage: python3 head_overlay_en.py <frames_dir> <out_dir> [workers]
Reads timeline.json + projections.json + narration.json from <frames_dir>'s parent
(head_video dir) — pass the head_video dir as --base if different.
Multiprocessed: frames are independent.
"""
import json
import os
import sys
import textwrap
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
INK = (17, 20, 26)
GRAY = (105, 112, 122)
BAND = (26, 29, 36)
WHITE = (255, 255, 255)
RED = (220, 60, 60)


def _load_font(bold, size):
    cands = [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else
         "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 0),
        (r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc", 0),
        (r"C:\Windows\Fonts\msyh.ttc", 1 if bold else 0),
    ]
    for path, idx in cands:
        try:
            return ImageFont.truetype(path, size, index=idx)
        except Exception:
            continue
    return ImageFont.load_default()


F_LABEL = _load_font(True, 26)
F_SUB = _load_font(False, 26)
F_LEGEND = _load_font(True, 18)
F_NUM = _load_font(True, 16)

NAMES_22 = ["Frontal bone", "Parietal bone (L)", "Parietal bone (R)",
            "Temporal bone (L)", "Temporal bone (R)", "Occipital bone",
            "Sphenoid bone", "Ethmoid bone", "Nasal bone (L)", "Nasal bone (R)",
            "Maxilla (L)", "Maxilla (R)", "Zygomatic bone (L)", "Zygomatic bone (R)",
            "Mandible", "Lacrimal bone (L)", "Lacrimal bone (R)",
            "Palatine bone (L)", "Palatine bone (R)",
            "Inferior nasal concha (L)", "Inferior nasal concha (R)", "Vomer"]

BASE = None
TIMELINE = None
PROJ = None
NARR = None


def init(base):
    global BASE, TIMELINE, PROJ, NARR
    BASE = base
    TIMELINE = json.load(open(os.path.join(base, "frames", "timeline.json")))["timeline"]
    PROJ = json.load(open(os.path.join(base, "frames", "projections.json")))
    NARR = {s["id"]: s for s in json.load(open(os.path.join(base, "narration.json")))}


def segment_at(frame):
    for t in TIMELINE:
        if t["start"] <= frame < t["end"]:
            return t
    return TIMELINE[-1]


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def draw_pill(d, cx, cy, text):
    pad_x, pad_y = 12, 7
    w = d.textlength(text, font=F_LABEL)
    x0, y0 = cx - w / 2 - pad_x, cy - 13 - pad_y
    x1, y1 = cx + w / 2 + pad_x, cy + 13 + pad_y
    d.rounded_rectangle([x0, y0, x1, y1], radius=14, fill=WHITE,
                        outline=(180, 185, 192), width=2)
    d.text((cx - w / 2, cy - 13), text, font=F_LABEL, fill=INK)
    return (x0, y0, x1, y1)


def process(args):
    frames_dir, out_dir, fn = args
    num = int(fn[6:-4])
    img = Image.open(os.path.join(frames_dir, fn)).convert("RGB")
    seg = segment_at(num)
    if num < 24:
        a = ease(num / 24)
        img = Image.blend(Image.new("RGB", (W, H), WHITE), img, a)
    d = ImageDraw.Draw(img)
    # Labels: bone segment -> name pills; allout -> numbered dots + side legend
    if seg["id"] not in ("intro", "back", "end"):
        if seg["labels"] == "all":
            # Numbered dots on the bones + two-column legend at the frame edges.
            proj = PROJ.get(str(num), {})
            dots = {}
            for bnum in range(1, 23):
                p = proj.get(str(bnum))
                if p and p[2] > 0 and 0 <= p[0] < W and 0 <= p[1] < 600:
                    dots[bnum] = (p[0], p[1])
            line_h = 27
            y_top = 170
            # left column: bones 1-11; right column: bones 12-22
            for col, bnums in ((0, range(1, 12)), (1, range(12, 23))):
                for i, bnum in enumerate(bnums):
                    entry = f"{bnum}  {NAMES_22[bnum - 1]}"
                    y = y_top + i * line_h
                    tw = d.textlength(entry, font=F_LEGEND)
                    if col == 0:
                        x = 10
                        d.text((x, y), entry, font=F_LEGEND, fill=INK)
                        anchor = (x + tw + 6, y + 9)
                    else:
                        x = W - 10 - tw
                        d.text((x, y), entry, font=F_LEGEND, fill=INK)
                        anchor = (x - 6, y + 9)
                    if bnum in dots:
                        bx, by = dots[bnum]
                        d.line([anchor, (bx, by)], fill=(120, 125, 135), width=1)
            for bnum, (bx, by) in dots.items():
                d.ellipse([bx - 12, by - 12, bx + 12, by + 12], fill=WHITE,
                          outline=INK, width=2)
                t = str(bnum)
                tw = d.textlength(t, font=F_NUM)
                d.text((bx - tw / 2, by - 8), t, font=F_NUM, fill=INK)
        else:
            labels = list(zip(seg["bones"], seg["labels"]))
            placements = []
            for bnum, name in labels:
                p = PROJ.get(str(num), {}).get(str(bnum))
                if not p or p[2] <= 0:
                    continue
                bx, by = p[0], p[1]
                dx, dy = bx - W / 2, by - H / 2
                norm = max((dx * dx + dy * dy) ** 0.5, 1)
                lx = min(max(bx + dx / norm * 95, 90), W - 90)
                ly = min(max(by + dy / norm * 95, 40), 600)
                placements.append([bx, by, lx, ly, name])
            for _ in range(3):
                moved = False
                for i in range(len(placements)):
                    for j in range(i + 1, len(placements)):
                        a, b = placements[i], placements[j]
                        wa = d.textlength(a[4], font=F_LABEL) + 24
                        wb = d.textlength(b[4], font=F_LABEL) + 24
                        if abs(a[2] - b[2]) < (wa + wb) / 2 + 8 and abs(a[3] - b[3]) < 42:
                            overlap = (wa + wb) / 2 + 8 - abs(a[2] - b[2])
                            shift = overlap / 2 + 4
                            if a[2] <= b[2]:
                                a[2] = max(90, a[2] - shift)
                                b[2] = min(W - 90, b[2] + shift)
                            else:
                                a[2] = min(W - 90, a[2] + shift)
                                b[2] = max(90, b[2] - shift)
                            if abs(a[2] - b[2]) < (wa + wb) / 2 + 8:
                                a[3] = min(max(a[3] - 24, 40), 600)
                                b[3] = min(max(b[3] + 24, 40), 600)
                            moved = True
                if not moved:
                    break
            for bx, by, lx, ly, name in placements:
                d.line([(bx, by), (lx, ly)], fill=(120, 125, 135), width=2)
                d.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill=RED)
                draw_pill(d, lx, ly, name)
    # Subtitle band (narration text, word-for-word; up to 3 lines, never truncated)
    lines = textwrap.wrap(seg["text"], width=60)[:3]
    line_h = 34
    band_h = len(lines) * line_h + 22
    y0 = H - band_h
    d.rectangle([0, y0, W, H], fill=BAND)
    for k, ln in enumerate(lines):
        w = d.textlength(ln, font=F_SUB)
        d.text(((W - w) / 2, y0 + 10 + k * line_h), ln, font=F_SUB, fill=WHITE)
    img.save(os.path.join(out_dir, fn))
    return fn


def main():
    frames_dir, out_dir = sys.argv[1], sys.argv[2]
    workers = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    base = sys.argv[4] if len(sys.argv) > 4 else os.path.dirname(frames_dir)
    init(base)
    os.makedirs(out_dir, exist_ok=True)
    frames = sorted(fn for fn in os.listdir(frames_dir)
                    if fn.startswith("frame_") and fn.endswith(".png"))
    print(f"overlay: {len(frames)} frames, {workers} workers")
    with Pool(workers, initializer=init, initargs=(base,)) as pool:
        for i, fn in enumerate(pool.imap_unordered(process, [(frames_dir, out_dir, f) for f in frames], chunksize=8)):
            if i % 200 == 0:
                print(f"  {i}/{len(frames)} {fn}")
    print(f"overlay done: {len(frames)} frames -> {out_dir}")


if __name__ == "__main__":
    main()
