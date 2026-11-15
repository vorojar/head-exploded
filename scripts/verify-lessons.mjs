import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
const read = (p) => JSON.parse(readFileSync(root + p, "utf8"));
const copy = read("remotion/src/lesson-copy.json"),
  captions = read("remotion/src/captions.json");
let total = 0;
for (const ep of ["1", "2", "3"]) {
  const d = read(`remotion/src/timeline${ep === "1" ? "" : ep}.json`),
    segments = d.timeline ?? d.segments,
    cues = captions[ep];
  assert.ok(cues?.length > 0, `Episode ${ep} has no captions`);
  assert.equal(segments[0].start, 0);
  let end = 0,
    lastCueEnd = 0;
  for (const s of segments) {
    assert.equal(s.start, end, `Timeline discontinuity: ${ep}/${s.id}`);
    assert.ok(s.end > s.start);
    end = s.end;
    const expected = copy[ep][s.id];
    assert.ok(expected?.length);
    assert.equal(
      expected.map((c) => c.text).join(" "),
      s.text,
      `Stale narration: ${ep}/${s.id}`,
    );
    const actual = cues.filter((c) => c.segmentId === s.id);
    assert.equal(actual.length, expected.length);
    actual.forEach((c, i) => {
      assert.equal(c.text, expected[i].text);
      assert.equal(c.zh, expected[i].zh);
      assert.ok(Number.isFinite(c.startMs) && Number.isFinite(c.endMs));
      assert.ok(
        c.startMs >= (s.start / 24) * 1000 - 1 &&
          c.endMs <= (s.end / 24) * 1000 + 1,
        `Cue crosses chapter: ${ep}/${s.id}`,
      );
      assert.ok(
        c.startMs >= lastCueEnd && c.endMs > c.startMs,
        `Overlapping/reversed cue: ${ep}/${s.id}`,
      );
      assert.ok(
        c.text.length <= 180 && c.zh.length <= 65,
        `Caption too dense: ${ep}/${s.id}`,
      );
      assert.ok(
        c.endMs - c.startMs >= 600,
        `Caption flashes too quickly: ${ep}/${s.id}`,
      );
      assert.equal(c.timestampMs, null);
      assert.equal(c.confidence, null);
      lastCueEnd = c.endMs;
    });
  }
  assert.equal(end, d.total_frames ?? d.total);
  const path = `${root}remotion/public/narration${ep}.mp3`;
  assert.ok(statSync(path).size > 10000);
  const duration = Number(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        path,
      ],
      { encoding: "utf8" },
    ),
  );
  assert.ok(
    Math.abs(duration - end / 24) < 0.15,
    `Audio duration mismatch ep${ep}: ${duration}`,
  );
  // All four wall descriptions must begin with the matching quarter of the scene.
  if (ep === "3")
    for (const id of ["orbit-walls", "cn-back", "orbit-apex"]) {
      const s = segments.find((s) => s.id === id);
      const c = cues.filter((c) => c.segmentId === id);
      const groups = id === "orbit-walls" ? 4 : 2;
      for (let i = 0; i < groups; i++)
        assert.ok(
          Math.abs(
            c[i * (c.length / groups)].startMs -
              ((s.start + ((s.end - s.start) * i) / groups) / 24) * 1000 -
              80,
          ) <= 2,
          `Visual beat drift: ${id}/${i}`,
        );
    }
  total += segments.length;
  console.log(
    `PASS ep${ep}: ${segments.length} chapters, ${cues.length} bilingual cues, ${duration.toFixed(2)}s audio`,
  );
}
assert.equal(total, 50);
console.log(
  "PASS: all 50 chapters have synchronized narration, captions, and continuous timelines.",
);
