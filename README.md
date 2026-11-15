# Head Exploded — 22 Skull Bones in 3D

A code-generated, narrated 3D anatomy teaching series: the human skull, exploded bone by bone, built entirely in code with **Remotion + Three.js** and real anatomical meshes from **BodyParts3D**. No Blender, no AI-generated geometry — every bone is a real mesh.

Live demo: https://xiaomi.bibidu.com/head-exploded/

## The three episodes

| Episode | Title | Length | Content |
|---|---|---|---|
| 1 | 22 Skull Bones | 1:55 | All 22 bones, one by one — frontal, parietals, temporals, occipital, sphenoid, ethmoid, nasals, maxillae, zygomatics, mandible, lacrimals, palatines, inferior nasal conchae, vomer. Latin names on every label. |
| 2 | Sutures & Foramina | 3:07 | Coronal / sagittal / lambdoid / squamous sutures, pterion, cranial fossae, and the foramina that matter for exams — cribriform, optic canal, superior orbital fissure, foramen rotundum / ovale / spinosum, internal acoustic meatus, jugular foramen, hypoglossal canal, foramen magnum — each with its contents and a clinical anchor. |
| 3 | Systems & Clinical | 3:49 | The complete cranial-nerve–foramen map (12 nerves, 10 doorways), the orbit as a room (7 bones, 4 walls, apex), TMJ and dislocation, Le Fort I / II / III fractures, and base-of-skull fracture signs (Battle's sign, raccoon eyes, CSF leak). |

Narration is native professional English (Helio TTS), subtitles match the narration word for word, and each segment's window is set from the measured narration duration + 0.6 s.

## How it works

- `remotion/src/skullMath*.ts` — pure per-frame math: cumulative bone separation, focus dimming, and the "protagonist camera" that swings around to frame the bone being taught.
- `remotion/src/SkullVideo*.tsx` — Three.js scene (studio environment lighting, soft shadows) + Remotion Player.
- `remotion/src/Overlay*.tsx` — HTML/SVG labels, leader lines, leader dots, fracture lines, bruise patches, and the subtitle band.
- `remotion/src/timeline*.json` — per-segment staging: camera, look-at, distance, label anchors, bone highlight sets.
- `remotion/public/skull.json` — the 22 BodyParts3D meshes converted to JSON (positions, colors, explosion directions, AABBs precomputed). See `scripts/obj2json.py`.
- `remotion/player/` — the standalone web player (Vite + @remotion/player) with three episode tabs. Build with `vite build` from inside `remotion/player/` using the parent's `node_modules/.bin/vite`.
- `scripts/` — the original Blender pipeline (`head_video.py`, `head_overlay_en.py`) that was superseded by the Remotion rebuild, plus `obj2json.py`, `head_exploded.py`, `make_plate.py`, and the deploy script.
- `docs/` — the researched episode scripts (foramina contents, suture Latin, clinical points verified against StatPearls / TeachMeAnatomy / Kenhub).

## Run it

```bash
cd remotion
npm install
npm run start        # Remotion Studio — preview all three compositions
npm run render       # render Episode 1 to MP4 (needs software WebGL on headless machines)
```

The player:

```bash
cd remotion/player
../node_modules/.bin/vite build   # output in player/dist/
```

Note: on a headless VM without a GPU, Remotion needs software WebGL — see `remotion.config.ts` (`swangle` + `enable-unsafe-swiftshader`).

## Data & license

- The skull meshes come from **BodyParts3D** (Database Center for Life Science), licensed **CC BY-SA 2.1 JP**. Attribution is in the player footer.
- The code in this repository is **MIT**. See `LICENSE`.
- Known limitation: the BodyParts3D meshes are surface-only, so the paranasal sinuses (hollow cavities) and fontanelles (adult skull — already closed) cannot be shown. In Episode 2, the foramen ovale and foramen spinosum markers are approximate region labels — the mesh has no clear opening there.
