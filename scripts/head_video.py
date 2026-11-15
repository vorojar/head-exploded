#!/usr/bin/env python3
"""Head exploded video (English): 22-bone skull, BodyParts3D real meshes, Blender Eevee.
Usage:
  blender -b -P head_video.py -- <obj_dir> <out_dir> <mode>
  mode=test  renders 3 test frames (assembled / one focus / fully exploded)
  mode=full  renders the whole animation + per-frame projections.json
Timeline is built from measured narration durations (durations.json):
each segment window = narration + 0.6s (the user's teaching-video rule).
Paired bones share one segment, separate together, highlight together.
No title card (anatomy-series rule). White background, Standard view transform
so colours stay true. Focus dimming = non-focus bones at 45% of their own colour.
"""
import bpy
import json
import math
import os
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
OBJ_DIR, OUT_DIR, MODE = argv[0], argv[1], argv[2] if len(argv) > 2 else "test"
# BASE holds narration.json + durations.json. Resolution order: env var, then the
# script's own dir (4090 layout), then script dir + /head_video, then the VM path.
def _find_base():
    if os.environ.get("HEAD_VIDEO_BASE"):
        return os.environ["HEAD_VIDEO_BASE"]
    here = os.path.dirname(os.path.abspath(__file__))
    for cand in (here, os.path.join(here, "head_video"),
                 os.path.expanduser("~/workspace/skull3d/head_video")):
        if os.path.exists(os.path.join(cand, "narration.json")):
            return cand
    return os.path.expanduser("~/workspace/skull3d/head_video")


BASE = _find_base()
FPS = 24
W, H = 1280, 720

# (num, English label, FJ file, RGBA colour, explode dist, explicit dir or None)
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
BY_NUM = {p[0]: p for p in PARTS}


def build_timeline():
    segs = json.load(open(os.path.join(BASE, "narration.json")))
    durs = json.load(open(os.path.join(BASE, "durations.json")))
    timeline = []
    f = 0
    for s in segs:
        dur = durs[s["id"]]
        win = int(math.ceil((dur + 0.6) * FPS))
        if s["id"] == "back":
            win = max(win, 120)  # reassembly must be visible
        timeline.append({"id": s["id"], "start": f, "end": f + win,
                         "bones": s.get("bones", []), "labels": s.get("labels", []),
                         "text": s["text"]})
        f += win
    return timeline, f


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
    timeline, total_frames = build_timeline()
    print(f"TIMELINE total={total_frames} frames ({total_frames / FPS:.1f}s)")
    for t in timeline:
        print(f"  {t['id']:10s} {t['start']:5d}-{t['end']:5d} bones={t['bones']}")
    clear_scene()
    objs = {}
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
        objs[num] = (obj, mat, color, dist, edir)
        print(f"imported {num:02d} {name}: {len(obj.data.polygons)} faces")

    # Normalise whole skull to max edge 2.6, centre at origin
    all_min, all_max = None, None
    for num, (o, _m, _c, _d, _e) in objs.items():
        c, s = world_bbox_center(o)
        mn, mx = c - s / 2, c + s / 2
        all_min = mn if all_min is None else Vector((min(all_min.x, mn.x), min(all_min.y, mn.y), min(all_min.z, mn.z)))
        all_max = mx if all_max is None else Vector((max(all_max.x, mx.x), max(all_max.y, mx.y), max(all_max.z, mx.z)))
    center = (all_min + all_max) / 2
    size = max(all_max.x - all_min.x, all_max.y - all_min.y, all_max.z - all_min.z)
    scale = 2.6 / size
    for num, (o, _m, _c, _d, _e) in objs.items():
        o.scale = (scale, scale, scale)
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for num, (o, _m, _c, _d, _e) in objs.items():
        o.location -= center * scale
    bpy.context.view_layer.update()

    # Explosion vectors (radial; small central bones use explicit directions)
    base_loc, explode_vec, centers = {}, {}, {}
    skull_r = 1.3
    for num, (o, _m, _c, dist, edir) in objs.items():
        c, _s = world_bbox_center(o)
        centers[num] = c
        base_loc[num] = o.location.copy()
        if edir is not None:
            d = Vector(edir).normalized()
        else:
            d = c.normalized() if c.length > 1e-6 else Vector((0, 1, 0))
        explode_vec[num] = d * dist

    # Lights + white background
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
    scene.render.fps = FPS
    scene.render.image_settings.file_format = "PNG"
    scene.render.use_overwrite = False  # resumable
    scene.view_settings.view_transform = "Standard"
    scene.eevee.use_soft_shadows = True
    scene.eevee.taa_render_samples = 64

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 40
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam_dir = Vector((-2.4, -3.2, 1.7)).normalized()
    cam_close = cam_dir * 6.5
    cam_far = cam_dir * 8.4
    cam.location = cam_close
    look_at(cam, Vector((0, 0, 0)))
    scene.camera = cam

    bone_segs = [t for t in timeline if t["bones"]]
    allout = next(t for t in timeline if t["id"] == "allout")
    back = next(t for t in timeline if t["id"] == "back")
    end_seg = next(t for t in timeline if t["id"] == "end")

    def set_loc_key(o, frame, loc):
        o.location = loc
        o.keyframe_insert(data_path="location", frame=frame)

    def set_col_key(mat, frame, col):
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = col
        bsdf.inputs["Base Color"].keyframe_insert(data_path="default_value", frame=frame)

    def dimmed(color):
        return (color[0] * 0.45, color[1] * 0.45, color[2] * 0.45, 1.0)

    RAMP = 24
    # Separation + focus keyframes per bone segment
    for t in bone_segs:
        start, end = t["start"], t["end"]
        ramp = min(RAMP, (end - start) // 3)
        for num in t["bones"]:
            o, _m, _c, _d, _e = objs[num]
            set_loc_key(o, start - 1, base_loc[num])
            set_loc_key(o, start + ramp, base_loc[num] + explode_vec[num])
        # focus: non-focus bones dim, focus bones stay full
        for num, (o, mat, color, _d, _e) in objs.items():
            if num in t["bones"]:
                set_col_key(mat, start - 1, color)
            else:
                set_col_key(mat, start - 1, color)
                set_col_key(mat, start + 12, dimmed(color))
                set_col_key(mat, end - 12, dimmed(color))
                set_col_key(mat, end + 1, color)
    # Reassembly in the back segment, reverse order, staggered 4 frames
    for k, t in enumerate(reversed(bone_segs)):
        back_start = back["start"] + 4 * k
        for num in t["bones"]:
            o, _m, _c, _d, _e = objs[num]
            set_loc_key(o, back_start - 1, base_loc[num] + explode_vec[num])
            set_loc_key(o, back_start + RAMP, base_loc[num])
    # Camera: close -> far as bones separate, back to close on reassembly
    cam.location = cam_close
    cam.keyframe_insert(data_path="location", frame=0)
    cam.location = cam_far
    cam.keyframe_insert(data_path="location", frame=allout["end"])
    cam.location = cam_close
    cam.keyframe_insert(data_path="location", frame=back["end"])
    look_at(cam, Vector((0, 0, 0)))

    os.makedirs(OUT_DIR, exist_ok=True)
    # Save timeline for the overlay step
    with open(os.path.join(OUT_DIR, "timeline.json"), "w") as f:
        json.dump({"timeline": timeline, "total_frames": total_frames, "fps": FPS}, f, indent=1)

    if MODE == "test":
        intro = timeline[0]
        focus = bone_segs[1]  # parietal pair
        for frame, tag in ((intro["start"] + 60, "assembled"),
                           (focus["start"] + (focus["end"] - focus["start"]) // 2, "focus"),
                           (allout["start"] + 30, "exploded")):
            scene.frame_set(frame)
            scene.render.filepath = os.path.join(OUT_DIR, f"test-{tag}.png")
            bpy.ops.render.render(write_still=True)
            print(f"rendered test frame {tag} frame={frame}")
    else:
        from bpy_extras.object_utils import world_to_camera_view

        def bbox_center_noupdate(obj):
            mw = obj.matrix_world
            pts = [mw @ Vector(c) for c in obj.bound_box]
            mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
            mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
            return (mn + mx) / 2

        proj = {}
        for frame in range(0, total_frames):
            scene.frame_set(frame)
            bpy.context.view_layer.update()
            row = {}
            for num, (o, _m, _c, _d, _e) in objs.items():
                c = bbox_center_noupdate(o)
                v = world_to_camera_view(scene, cam, c)
                row[str(num)] = [round(v.x * W), round((1 - v.y) * H), round(v.z, 4)]
            proj[str(frame)] = row
            if frame % 400 == 0:
                print(f"projections frame {frame}/{total_frames}")
        with open(os.path.join(OUT_DIR, "projections.json"), "w") as f:
            json.dump(proj, f)
        scene.frame_start = 0
        scene.frame_end = total_frames - 1
        scene.render.filepath = os.path.join(OUT_DIR, "frame_####.png")
        bpy.ops.render.render(animation=True)
        print("full render done")


main()
