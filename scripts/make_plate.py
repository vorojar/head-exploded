#!/usr/bin/env python3
"""Composite the Blender exploded render into a textbook plate:
title + numbered markers (with leader lines where centroids collide)
+ two-column colour legend + source footer. Output: 1920x2680 PNG.
Colours and names are parsed from head_exploded.py PARTS (single source of truth).
"""
import json
import math
import re
from PIL import Image, ImageDraw, ImageFont

BASE = "/home/hatch/workspace/skull3d"
RENDER = f"{BASE}/head_exploded/head-exploded.png"
PROJ = f"{BASE}/head_exploded/projections.json"
OUT = "/home/hatch/workspace/your_files/head-exploded-22-bones.png"

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

parts = []
for line in open(f"{BASE}/head_exploded.py"):
    m = re.match(r'\s+\((\d+),\s+"([^"]+)",\s+"(FJ\d+\.obj)",\s+\(([\d\.]+),\s+([\d\.]+),\s+([\d\.]+), 1\.0\),', line)
    if m:
        num = int(m.group(1))
        rgb = tuple(int(round(float(m.group(i)) * 255)) for i in (4, 5, 6))
        parts.append((num, m.group(2), rgb))
parts.sort()
assert len(parts) == 22, len(parts)

proj = json.load(open(PROJ))
W, H = 1920, 1080
TOP = 180
CW, CH = 1920, 2680

img = Image.new("RGB", (CW, CH), "white")
d = ImageDraw.Draw(img)
render = Image.open(RENDER).convert("RGB")
img.paste(render, (0, TOP))

def font(path, size):
    return ImageFont.truetype(path, size)

# Title block
d.text((80, 42), "The Human Skull \u2014 Exploded View", fill=(20, 20, 20), font=font(FONTB, 64))
d.text((80, 122), "22 bones  \u00b7  Neurocranium (8)  \u00b7  Viscerocranium (14)  \u00b7  Three-quarter view",
       fill=(90, 90, 90), font=font(FONT, 32))

# Manual anchor: #4 Temporal bone (L) is mostly hidden behind the vault in this
# 3/4 view; its projected centroid lands on the frontal bone. Its only visible
# part is the dark-purple sliver under the frontal dome's lower edge, verified
# in a 3x crop of the render at render coords (1250, 590). Pin the number there.
MANUAL_ANCHOR = {4: (1250, 590)}

# Numbered markers on the render (de-collide with leader lines)
placed = []
CX, CY = W / 2, TOP + H / 2
for num, name, rgb in parts:
    p = proj[str(num)]
    tx, ty = p["x"], TOP + p["y"]
    # direction away from plate centre for nudging
    vx, vy = tx - CX, ty - CY
    L = math.hypot(vx, vy) or 1.0
    ux, uy = vx / L, vy / L
    mx, my = tx, ty
    if num in MANUAL_ANCHOR:
        mx, my = MANUAL_ANCHOR[num][0], TOP + MANUAL_ANCHOR[num][1]
    for _ in range(5):
        if num in MANUAL_ANCHOR:
            break
        if all(math.hypot(mx - px, my - py) >= 40 for px, py in placed):
            break
        mx += ux * 46
        my += uy * 46
    placed.append((mx, my))
    if (mx, my) != (tx, ty):
        d.line([(tx, ty), (mx, my)], fill=(120, 120, 120), width=2)
        d.ellipse([tx - 4, ty - 4, tx + 4, ty + 4], fill=(60, 60, 60))
    r = 18
    d.ellipse([mx - r, my - r, mx + r, my + r], fill="white", outline=(30, 30, 30), width=3)
    f = font(FONTB, 24 if num < 10 else 21)
    tb = d.textbbox((0, 0), str(num), font=f)
    d.text((mx - (tb[2] - tb[0]) / 2 - tb[0], my - (tb[3] - tb[1]) / 2 - tb[1]),
           str(num), fill=(20, 20, 20), font=f)

# Legend
ly = TOP + H + 36
d.text((80, ly), "Legend", fill=(20, 20, 20), font=font(FONTB, 44))
ly += 70
d.line([(80, ly), (CW - 80, ly)], fill=(200, 200, 200), width=2)
ly += 22
# Two columns: 1-11 left, 12-22 right; group headers inline as first rows
cols = [(80, parts[:11]), (1000, parts[11:])]
row_h = 68
for cx0, col in cols:
    y = ly
    for num, name, rgb in col:
        group = None
        if num == 1:
            group = "Neurocranium (1\u20138)"
        elif num == 9:
            group = "Viscerocranium (9\u201322)"
        if group and num in (1, 9):
            pass  # group shown via the numbering itself; keep rows uniform
        d.rounded_rectangle([cx0, y + 8, cx0 + 44, y + 52], radius=8, fill=rgb, outline=(60, 60, 60), width=1)
        d.text((cx0 + 60, y + 6), f"{num:2d}.  {name}", fill=(25, 25, 25), font=font(FONT, 33))
        y += row_h

fy = ly + 11 * row_h + 30
d.line([(80, fy), (CW - 80, fy)], fill=(200, 200, 200), width=2)
fy += 24
d.text((80, fy), "Each bone is a real anatomical mesh; paired bones share a hue family (left darker, right lighter).",
       fill=(90, 90, 90), font=font(FONT, 28))
fy += 44
d.text((80, fy), "Source: BodyParts3D, \u00a9 Database Center for Life Science, CC BY-SA 2.1 JP.",
       fill=(90, 90, 90), font=font(FONT, 28))
fy += 44
d.text((80, fy), "Rendered with Blender (Eevee). Exploded-view method after /anatomy-reveal; staging after motion-design-skill.",
       fill=(90, 90, 90), font=font(FONT, 28))

img.save(OUT)
print(f"saved {OUT} {img.size}")
