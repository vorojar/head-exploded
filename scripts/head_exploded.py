#!/usr/bin/env python3
"""Head exploded diagram (static plate): full 22-bone skull, BodyParts3D real meshes.
Usage:
  blender -b -P head_exploded.py -- <obj_dir> <out_dir>
Renders ONE still (1920x1080, Eevee) with the 22 bones exploded radially,
each bone its own colour (paired bones: same hue family, different shade),
plus projections.json with the exploded centroid screen position of every bone
for the PIL label/legend overlay.
Bone identity verified from each OBJ header (# English name / Concept ID / FMA).
No brain: the 'Brain' whole-organ part is not in this BodyParts3D subset
(only white-matter hemispheres / midbrain exist), so it is NOT invented.
"""
import bpy
import json
import os
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
OBJ_DIR, OUT_DIR = argv[0], argv[1]
W, H = 1920, 1080

# (number, English label, FJ file, RGB colour, explode distance, explicit dir or None)
# Paired bones share a hue family; left = darker, right = lighter.
PARTS = [
    (1,  "Frontal bone",               "FJ3200.obj", (0.12, 0.30, 0.62, 1.0), 0.28, None),
    (2,  "Parietal bone (L)",          "FJ3274.obj", (0.02, 0.42, 0.42, 1.0), 0.30, None),
    (3,  "Parietal bone (R)",          "FJ3380.obj", (0.16, 0.62, 0.60, 1.0), 0.30, None),
    (4,  "Temporal bone (L)",          "FJ3281.obj", (0.38, 0.20, 0.58, 1.0), 0.30, None),
    (5,  "Temporal bone (R)",          "FJ3386.obj", (0.58, 0.38, 0.76, 1.0), 0.30, None),
    (6,  "Occipital bone",             "FJ3309.obj", (0.66, 0.12, 0.16, 1.0), 0.28, None),
    (7,  "Sphenoid bone",              "FJ3394.obj", (0.78, 0.44, 0.04, 1.0), 0.31, (0.0, 0.25, -1.0)),
    (8,  "Ethmoid bone",               "FJ3199.obj", (0.42, 0.52, 0.10, 1.0), 0.66, (0.0, -1.0, 0.30)),
    (9,  "Nasal bone (L)",             "FJ3272.obj", (0.05, 0.48, 0.72, 1.0), 0.69, (-0.25, -1.0, 0.25)),
    (10, "Nasal bone (R)",             "FJ3378.obj", (0.30, 0.66, 0.85, 1.0), 0.69, (0.25, -1.0, 0.25)),
    (11, "Maxilla (L)",                "FJ3269.obj", (0.06, 0.48, 0.22, 1.0), 0.32, None),
    (12, "Maxilla (R)",                "FJ3375.obj", (0.20, 0.66, 0.34, 1.0), 0.32, None),
    (13, "Zygomatic bone (L)",         "FJ3287.obj", (0.80, 0.38, 0.05, 1.0), 0.33, None),
    (14, "Zygomatic bone (R)",         "FJ3392.obj", (0.95, 0.58, 0.22, 1.0), 0.33, None),
    (15, "Mandible",                   "FJ3289.obj", (0.48, 0.30, 0.14, 1.0), 0.38, (0.0, -0.25, -1.0)),
    (16, "Lacrimal bone (L)",          "FJ3265.obj", (0.78, 0.30, 0.48, 1.0), 0.75, (-0.60, -0.90, 0.20)),
    (17, "Lacrimal bone (R)",          "FJ3371.obj", (0.92, 0.55, 0.68, 1.0), 0.75, (0.60, -0.90, 0.20)),
    (18, "Palatine bone (L)",          "FJ3273.obj", (0.22, 0.28, 0.38, 1.0), 0.72, (-0.40, -0.50, -0.80)),
    (19, "Palatine bone (R)",          "FJ3379.obj", (0.42, 0.50, 0.62, 1.0), 0.72, (0.40, -0.50, -0.80)),
    (20, "Inferior nasal concha (L)",  "FJ3263.obj", (0.02, 0.58, 0.66, 1.0), 0.74, (-0.50, -0.90, -0.20)),
    (21, "Inferior nasal concha (R)",  "FJ3369.obj", (0.25, 0.76, 0.82, 1.0), 0.74, (0.50, -0.90, -0.20)),
    (22, "Vomer",                      "FJ3395.obj", (0.55, 0.16, 0.45, 1.0), 0.69, (0.0, -0.60, -0.80)),
]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.images):
        for x in list(coll):
            try:
                coll.remove(x)
            except Exception:
                pass


def world_bbox_center(obj):
    bpy.context.view_layer.update()
    mw = obj.matrix_world
    pts = [mw @ Vector(c) for c in obj.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return (mn + mx) / 2, (mx - mn)


def look_at(obj, target):
    d = target - obj.location
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def main():
    clear_scene()
    objs = []
    for num, name, fname, color, dist, edir in PARTS:
        path = os.path.join(OBJ_DIR, fname)
        assert os.path.exists(path), f"missing {name}: {path}"
        bpy.ops.wm.obj_import(filepath=path)
        imported = [o for o in bpy.context.selected_objects if o.type == "MESH"]
        assert imported, f"import empty: {path}"
        bpy.ops.object.select_all(action="DESELECT")
        for o in imported:
            o.select_set(True)
        bpy.context.view_layer.objects.active = imported[0]
        if len(imported) > 1:
            bpy.ops.object.join()
        obj = bpy.context.view_layer.objects.active
        obj.name = f"{num:02d} {name}"
        obj.rotation_euler = (0, 0, 0)
        mesh = obj.data
        if len(mesh.polygons) > 200000:
            ratio = 200000 / len(mesh.polygons)
            mod = obj.modifiers.new("decimate", "DECIMATE")
            mod.ratio = ratio
            bpy.ops.object.modifier_apply(modifier=mod.name)
        mat = bpy.data.materials.new(name=f"mat_{num:02d}")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.5
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        objs.append((num, name, obj, dist, edir))
        print(f"imported {num:02d} {name}: {len(obj.data.polygons)} faces")

    # Normalise: whole skull max edge -> 2.6 units, centre at origin
    all_min, all_max = None, None
    for _, _, o, _, _ in objs:
        c, s = world_bbox_center(o)
        mn, mx = c - s / 2, c + s / 2
        all_min = mn if all_min is None else Vector((min(all_min.x, mn.x), min(all_min.y, mn.y), min(all_min.z, mn.z)))
        all_max = mx if all_max is None else Vector((max(all_max.x, mx.x), max(all_max.y, mx.y), max(all_max.z, mx.z)))
    center = (all_min + all_max) / 2
    size = max(all_max.x - all_min.x, all_max.y - all_min.y, all_max.z - all_min.z)
    scale = 2.6 / size
    for _, _, o, _, _ in objs:
        o.scale = (scale, scale, scale)
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for _, _, o, _, _ in objs:
        o.location -= center * scale
    bpy.context.view_layer.update()

    # Explode: radial from origin, small central bones use explicit directions
    skull_r = 1.3  # half of normalised size
    for num, name, o, dist, edir in objs:
        c, _s = world_bbox_center(o)
        if edir is not None:
            d = Vector(edir).normalized()
        else:
            d = c.normalized() if c.length > 1e-6 else Vector((0, 1, 0))
        o.location += d * dist
        print(f"exploded {num:02d} {name}: dir=({d.x:.2f},{d.y:.2f},{d.z:.2f}) dist={dist}")
    bpy.context.view_layer.update()

    # Lights + white background (textbook plate)
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (1.0, 1.0, 1.0, 1.0)
    world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    bpy.context.scene.world = world

    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 4.0
    sun_obj = bpy.data.objects.new("sun", sun)
    bpy.context.collection.objects.link(sun_obj)
    sun_obj.location = (-2.5, -3.0, 4.0)
    look_at(sun_obj, Vector((0, 0, 0)))

    area = bpy.data.lights.new("fill", "AREA")
    area.energy = 200.0
    area.size = 6.0
    area_obj = bpy.data.objects.new("fill", area)
    bpy.context.collection.objects.link(area_obj)
    area_obj.location = (3.0, -2.0, 1.5)
    look_at(area_obj, Vector((0, 0, 0)))

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = W
    scene.render.resolution_y = H
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.view_settings.view_transform = "Standard"
    scene.eevee.use_soft_shadows = True
    scene.eevee.taa_render_samples = 64

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 40
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam_dir = Vector((-2.4, -3.2, 1.7)).normalized()
    cam.location = cam_dir * 8.4
    look_at(cam, Vector((0, 0, 0)))
    scene.camera = cam

    os.makedirs(OUT_DIR, exist_ok=True)
    scene.render.filepath = os.path.join(OUT_DIR, "head-exploded.png")
    bpy.ops.render.render(write_still=True)
    print("rendered head-exploded.png")

    # Projected centroids for labels
    from bpy_extras.object_utils import world_to_camera_view
    proj = {}
    for num, name, o, _, _ in objs:
        c, _s = world_bbox_center(o)
        v = world_to_camera_view(scene, cam, c)
        proj[str(num)] = {"name": name, "x": round(v.x * W), "y": round((1 - v.y) * H), "z": round(v.z, 4)}
    with open(os.path.join(OUT_DIR, "projections.json"), "w") as f:
        json.dump(proj, f, indent=1)
    print("wrote projections.json")


main()
