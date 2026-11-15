#!/usr/bin/env python3
"""Convert the 22 BodyParts3D OBJs into one JSON for the Remotion + Three.js build.
Replicates head_video.py exactly:
- union AABB of all 22 meshes -> scale max edge to 2.6, centre at origin
- Blender (x, y, z) -> Three.js (x, z, -y)
- explosion dirs: radial from bone AABB centre, or the explicit dirs from PARTS
- per-bone AABB centre (for label projections), colour, distance
Output: skull.json  {bones: [{num, name, color, dist, dir, center,
positions, normals, indices}]}
"""
import json
import math
import os

SRC = os.path.expanduser("~/workspace/skull3d/bp3d/partof_BP3D_4.0_obj_99")
OUT = os.path.expanduser("~/workspace/skull3d/remotion/public/skull.json")

# (num, name, file, RGB colour, explode dist, explicit dir in Blender coords or None)
PARTS = [
    (1, "Frontal bone", "FJ3200.obj", (0.12, 0.30, 0.62), 0.28, None),
    (2, "Parietal bone (L)", "FJ3274.obj", (0.02, 0.42, 0.42), 0.30, None),
    (3, "Parietal bone (R)", "FJ3380.obj", (0.16, 0.62, 0.60), 0.30, None),
    (4, "Temporal bone (L)", "FJ3281.obj", (0.38, 0.20, 0.58), 0.30, None),
    (5, "Temporal bone (R)", "FJ3386.obj", (0.58, 0.38, 0.76), 0.30, None),
    (6, "Occipital bone", "FJ3309.obj", (0.66, 0.12, 0.16), 0.28, None),
    (7, "Sphenoid bone", "FJ3394.obj", (0.78, 0.44, 0.04), 0.31, (0.0, 0.25, -1.0)),
    (8, "Ethmoid bone", "FJ3199.obj", (0.42, 0.52, 0.10), 0.66, (0.0, -1.0, 0.30)),
    (9, "Nasal bone (L)", "FJ3272.obj", (0.05, 0.48, 0.72), 0.69, (-0.25, -1.0, 0.25)),
    (10, "Nasal bone (R)", "FJ3378.obj", (0.30, 0.66, 0.85), 0.69, (0.25, -1.0, 0.25)),
    (11, "Maxilla (L)", "FJ3269.obj", (0.06, 0.48, 0.22), 0.32, None),
    (12, "Maxilla (R)", "FJ3375.obj", (0.20, 0.66, 0.34), 0.32, None),
    (13, "Zygomatic bone (L)", "FJ3287.obj", (0.80, 0.38, 0.05), 0.33, None),
    (14, "Zygomatic bone (R)", "FJ3392.obj", (0.95, 0.58, 0.22), 0.33, None),
    (15, "Mandible", "FJ3289.obj", (0.48, 0.30, 0.14), 0.38, (0.0, -0.25, -1.0)),
    (16, "Lacrimal bone (L)", "FJ3265.obj", (0.78, 0.30, 0.48), 0.75, (-0.60, -0.90, 0.20)),
    (17, "Lacrimal bone (R)", "FJ3371.obj", (0.92, 0.55, 0.68), 0.75, (0.60, -0.90, 0.20)),
    (18, "Palatine bone (L)", "FJ3273.obj", (0.22, 0.28, 0.38), 0.72, (-0.40, -0.50, -0.80)),
    (19, "Palatine bone (R)", "FJ3379.obj", (0.42, 0.50, 0.62), 0.72, (0.40, -0.50, -0.80)),
    (20, "Inferior nasal concha (L)", "FJ3263.obj", (0.02, 0.58, 0.66), 0.74, (-0.50, -0.90, -0.20)),
    (21, "Inferior nasal concha (R)", "FJ3369.obj", (0.25, 0.76, 0.82), 0.74, (0.50, -0.90, -0.20)),
    (22, "Vomer", "FJ3395.obj", (0.55, 0.16, 0.45), 0.69, (0.0, -0.60, -0.80)),
]


def parse_obj(path):
    vs, vns, idx = [], [], []
    with open(path) as f:
        for line in f:
            if line.startswith("v "):
                vs.append(tuple(float(x) for x in line.split()[1:4]))
            elif line.startswith("vn "):
                vns.append(tuple(float(x) for x in line.split()[1:4]))
            elif line.startswith("f "):
                for tok in line.split()[1:]:
                    vi = int(tok.split("/")[0]) - 1
                    idx.append(vi)
    return vs, vns, idx


def b2t(v):
    """Blender (x, y, z) -> Three.js (x, z, -y)."""
    return (v[0], v[2], -v[1])


def norm(v):
    l = math.sqrt(sum(x * x for x in v)) or 1.0
    return tuple(x / l for x in v)


def r4(x):
    return round(x, 4)


meshes = {}
all_min = [1e9] * 3
all_max = [-1e9] * 3
for num, name, fname, color, dist, edir in PARTS:
    vs, vns, idx = parse_obj(os.path.join(SRC, fname))
    meshes[num] = (vs, vns, idx)
    for v in vs:
        for i in range(3):
            all_min[i] = min(all_min[i], v[i])
            all_max[i] = max(all_max[i], v[i])

center = [(all_min[i] + all_max[i]) / 2 for i in range(3)]
size = max(all_max[i] - all_min[i] for i in range(3))
scale = 2.6 / size
print(f"union bbox size={size:.1f} center={tuple(round(c, 1) for c in center)} scale={scale:.5f}")

bones = []
tot_v = tot_f = 0
for num, name, fname, color, dist, edir in PARTS:
    vs, vns, idx = meshes[num]
    # transform vertices: centre + scale, then Blender -> Three axes
    pos, nor = [], []
    for v in vs:
        t = b2t(tuple((v[i] - center[i]) * scale for i in range(3)))
        pos.extend(r4(x) for x in t)
    for n in vns:
        t = norm(b2t(n))
        nor.extend(r4(x) for x in t)
    # AABB centre in Three coords (for label projections)
    xs = pos[0::3]
    ys = pos[1::3]
    zs = pos[2::3]
    c3 = ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, (min(zs) + max(zs)) / 2)
    if edir is not None:
        d = norm(b2t(edir))
    else:
        d = norm(c3) if math.sqrt(sum(x * x for x in c3)) > 1e-6 else (0.0, 1.0, 0.0)
    bones.append({
        "num": num, "name": name, "color": list(color), "dist": dist,
        "dir": [r4(x) for x in d], "center": [r4(x) for x in c3],
        "positions": pos, "normals": nor, "indices": idx,
    })
    tot_v += len(vs)
    tot_f += len(idx) // 3
    print(f"  {num:02d} {name}: {len(vs)} verts, {len(idx)//3} faces, dir={tuple(round(x,2) for x in d)}")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump({"bones": bones}, f, separators=(",", ":"))
print(f"total verts={tot_v} faces={tot_f} -> {OUT} ({os.path.getsize(OUT)//1024} KB)")
