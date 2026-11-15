# Head Exploded — 颅骨课堂

A code-generated 3D anatomy teaching series built with **Remotion + Three.js** and real **BodyParts3D** bone meshes. The web player renders the scene in the learner's browser, so updates do not require an MP4 export.

**Live:** https://xiaomi.bibidu.com/head-exploded/
**What changed:** [Changelog](CHANGELOG.md) · [Medical content revision / 医学审校记录](docs/medical-review.md)

## Three episodes

| Episode | Content | Length |
|---|---|---|
| 1 | 22 cranial and facial bones, separated and reassembled | 1:55 |
| 2 | Sutures, selected foramina, nerves and vessels | 3:07 |
| 3 | Cranial nerve routes, orbit, TMJ, Le Fort patterns and skull-base injury signs | 3:49 |

The three episodes contain **50 chapters and 136 bilingual caption cues**. Narration is English; captions are Chinese and English. The mobile player places readable subtitles and annotation legends outside the scaled scene. Small screens use numbered anchors instead of tiny text labels. Chapters, a seek slider, pause/play, playback speed and fullscreen all follow the same Remotion frame clock.

## Run and check

Requirements: Node.js 22+, npm, Python 3 and ffmpeg/ffprobe for content verification. No GPU render is needed for the web build.

```bash
cd remotion
npm ci
npm run player:dev   # standalone web player; URL printed by Vite
npm run verify       # strict TypeScript + all chapter/caption/audio checks
npm run build        # remotion/player/dist; assets/audio use content hashes
npm run start        # Remotion Studio, all three compositions
```

`npm run render` still exports Episode 1 if an MP4 is explicitly needed. For Episodes 2/3 use `npx remotion render HeadExploded2 ...` / `HeadExploded3 ...`. The headless software-WebGL settings live in `remotion.config.ts`.

## Edit narration and subtitles

1. Edit the bilingual phrase units in `remotion/src/lesson-copy.json`. The generator updates the matching English text in `timeline*.json`. Change camera timings only when changing the visual staging.
2. Regenerate narration locally. Kokoro `bm_george` replaces the original Helio recordings, maintaining one voice across all corrected content. The generator measures each phrase, fits it to its visual window with pitch-preserving `atempo`, and writes exact final phrase intervals to `captions.json`.

   ```bash
   uv venv --python 3.12 .venv-audio
   uv pip install --python .venv-audio/bin/python kokoro==0.9.4 soundfile
   # First run downloads public model/voice files and the English language model.
   VIRTUAL_ENV="$PWD/.venv-audio" PATH="$PWD/.venv-audio/bin:$PATH" \
     .venv-audio/bin/python scripts/generate-narration.py --device cpu
   # Apple Silicon can use --device mps.
   ```

3. Run `npm run verify` and `npm run build` in `remotion`, then inspect playback. The audio generator retains phrase WAVs in ignored `work/narration-cache/` for fast regeneration. It never sends source text or audio to a synthesis API.

The four orbit-wall phrases and two-view nerve/orbit segments are fitted to their actual highlight/view windows. Caption timing is measured from audio, not estimated by character count. Gaps remain blank rather than showing the next phrase early. `EmbeddedCaption` uses the same cues for Studio/video; the web player presents them at native CSS sizes.

## Xiaomi 15 Pro deployment

**Automatic deployment is enabled for `main`.** GitHub Actions verifies and builds each update, then publishes a checksum manifest and static package to the `deploy-phone` branch. A runit service on the phone checks once per minute, downloads only a build matching the latest `main`, verifies it and switches the served release. Build/download/health-check failures retain the previous site. No GitHub SSH secrets or incoming management endpoint is needed.

The workflow is [Verify and publish phone build](https://github.com/vorojar/head-exploded/actions/workflows/verify.yml). Phone status is `~/server/apps/head-exploded/auto-status.json`; logs are `$PREFIX/var/log/hub-app-head-exploded-auto/`. The worker joins the existing `hub-app-*` boot recovery list.

For manual publishing, existing SSH authorization and the verified `xiaomi-server` alias are required. Commit and push to `origin/main` first.

```bash
./scripts/deploy-ep3.sh --dry-run  # verify/build and inspect the release locally
./scripts/deploy-ep3.sh            # verify/build/upload/check/switch
python3 scripts/rollback-phone.py # return to the previous release
```

The deployment checks that `HEAD` equals remote `main`, uploads only the built site, compares all SHA-256 hashes, retains content-addressed assets and switches the entry through an atomic symlink. Releases live in `~/server/apps/head-exploded/releases/<commit>/`; `current`, `previous` and shared `assets/` belong only to this site. `version.json` identifies the served commit. Existing legacy WAV URLs remain available to already-open pages.

Only the `/head-exploded/` Nginx locations receive the CSP required for Remotion style injection and silent `data:` audio. Scripts remain restricted to `'self'`; shared site routes and their policies are unchanged. The existing Nginx/runit/tunnel startup chain serves the static site; no extra background service is introduced. The first route installation validates and gracefully reloads Nginx, subsequent releases only switch the symlink.

## Source layout

- `remotion/src/skullMath*.ts` — pure frame math: bone separation, highlighting, cameras and clinical overlays.
- `remotion/src/SkullVideo*.tsx`, `Overlay*.tsx`, `LearningOverlay.tsx` — 3D scenes, projected annotations and shared embedded captions.
- `remotion/src/lessons.ts` — chapter titles, numbered annotation metadata, cue lookup and lazy scene loaders.
- `remotion/src/lesson-copy.json`, `captions.json`, `timeline*.json` — bilingual source, measured cue timing and visual staging.
- `remotion/public/skull.json` — 22 bone meshes; `narration*.mp3` — compressed narration, imported once into the player with hashed URLs.
- `remotion/player/` — responsive standalone learning interface.
- `scripts/verify-lessons.mjs` — continuous timelines, complete bilingual phrase coverage, ordered cue intervals, visual beat alignment and actual audio duration checks.
- `.github/workflows/verify.yml` — checks and web build for pushes and PRs.
- `docs/ep*-script*.md` — historical research drafts, superseded by the current source and medical revision record.

## Data and accuracy

Meshes are from **BodyParts3D**, © Database Center for Life Science, under **CC BY-SA 2.1 JP**; code is MIT. See [LICENSE](LICENSE). Local Kokoro synthesis uses the public `hexgrad/Kokoro-82M` model and `bm_george` voice.

The surface mesh does not display internal sinus cavities, nerves, vessels, a TMJ disc or soft tissue. Custom foramen markers are approximate regions, particularly foramen ovale/spinosum. Le Fort lines are anterior-view schematics and do not display the complete posterior pterygoid path. These limits are shown beside the player. The medical revision record documents reference-based corrections; a clinical expert has not signed off this version.
