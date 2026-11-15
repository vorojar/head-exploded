import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Player,
  type CallbackListener,
  type PlayerRef,
} from "@remotion/player";
import {
  accuracyNote,
  annotationsAt,
  captionAt,
  chapterTitle,
  lessons,
  segmentAt,
} from "../src/lessons";
import "./style.css";
import audio1 from "../public/narration1.mp3?url";
import audio2 from "../public/narration2.mp3?url";
import audio3 from "../public/narration3.mp3?url";

// Remotion Studio uses /public; the standalone page can live at any subpath.
(
  window as unknown as { remotion_staticFiles: { name: string; src: string }[] }
).remotion_staticFiles = [audio1, audio2, audio3].map((src, i) => ({
  name: `narration${i + 1}.mp3`,
  src,
}));
const formatTime = (frames: number) =>
  `${Math.floor(frames / 24 / 60)}:${String(Math.floor(frames / 24) % 60).padStart(2, "0")}`;

function LessonPlayer({ episode }: { episode: number }) {
  const player = useRef<PlayerRef>(null);
  const shell = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 700px)").matches,
  );
  const [full, setFull] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState("");
  const lesson = lessons[episode]!;
  const segment = segmentAt(episode, frame);
  const cue = captionAt(episode, frame);
  const annotations = annotationsAt(episode, frame);
  useEffect(() => {
    const media = matchMedia("(max-width: 700px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    const fullscreen = () =>
      setFull(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", fullscreen);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("fullscreenchange", fullscreen);
    };
  }, []);
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const sync: CallbackListener<"frameupdate"> = (e) =>
      setFrame(e.detail.frame);
    const play = () => setPlaying(true),
      pause = () => setPlaying(false);
    const mute: CallbackListener<"mutechange"> = (e) => setMuted(e.detail.isMuted);
    const fail: CallbackListener<"error"> = (e) =>
      setError(e.detail.error.message);
    p.addEventListener("frameupdate", sync);
    p.addEventListener("play", play);
    p.addEventListener("pause", pause);
    p.addEventListener("ended", pause);
    p.addEventListener("error", fail);
    p.addEventListener("mutechange", mute);
    return () => {
      p.removeEventListener("frameupdate", sync);
      p.removeEventListener("play", play);
      p.removeEventListener("pause", pause);
      p.removeEventListener("ended", pause);
      p.removeEventListener("error", fail);
      p.removeEventListener("mutechange", mute);
    };
  }, []);
  const seek = (value: number) => {
    player.current?.seekTo(value);
    setFrame(value);
  };
  const toggleFull = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (shell.current?.requestFullscreen)
      await shell.current.requestFullscreen();
  };
  return (
    <>
      <div className="learning-layout">
        <div className="playback-shell" ref={shell}>
          <div className="scene-wrap">
            <Player
              ref={player}
              lazyComponent={lesson.load}
              inputProps={{ webPlayer: true, compactLabels: compact }}
              durationInFrames={lesson.total}
              fps={24}
              compositionWidth={1280}
              compositionHeight={720}
              controls={false}
              clickToPlay
              spaceKeyToPlayOrPause
              acknowledgeRemotionLicense
              numberOfSharedAudioTags={1}
              playbackRate={speed}
              moveToBeginningWhenEnded={false}
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                background: "#fff",
              }}
              renderLoading={() => (
                <div className="loading" role="status">
                  正在加载三维颅骨…
                </div>
              )}
              errorFallback={({ error: e }) => (
                <div className="player-error" role="alert">
                  三维画面无法加载：{e.message}。请使用支持 WebGL 的浏览器。
                </div>
              )}
            />
            {!playing && frame === 0 && (
              <button
                className="start-overlay"
                onClick={() => player.current?.play()}
                aria-label="开始播放"
              >
                ▶ 开始学习
              </button>
            )}
          </div>
          <div
            className="subtitle-box"
            data-testid="subtitle"
            data-start-ms={cue?.startMs}
            data-end-ms={cue?.endMs}
          >
            <p className="subtitle-zh" lang="zh-CN">
              {cue?.zh ?? "\u00a0"}
            </p>
            <p className="subtitle-en" lang="en">
              {cue?.text ?? "\u00a0"}
            </p>
          </div>
          <div className="transport">
            <div className="transport-main">
              <button
                onClick={() => player.current?.toggle()}
                aria-label={playing ? "暂停" : "播放"}
              >
                {playing ? "Ⅱ 暂停" : "▶ 播放"}
              </button>
              <output aria-label="播放时间" aria-live="off">
                {formatTime(frame)} / {formatTime(lesson.total)}
              </output>
              <button aria-label={muted ? "取消静音" : "静音"} onClick={() => { const p=player.current; if(p) { if(p.isMuted())p.unmute();else p.mute(); } }}>{muted ? "开声" : "静音"}</button>
          <label className="rate-control">
                语速{" "}
                <select
                  aria-label="播放速度"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  {[0.75, 1, 1.25, 1.5].map((v) => (
                    <option key={v} value={v}>
                      {v}×
                    </option>
                  ))}
                </select>
              </label>
              {document.fullscreenEnabled && (
                <button
                  onClick={() => {
                    void toggleFull();
                  }}
                  aria-label={full ? "退出全屏" : "全屏学习"}
                >
                  {full ? "退出全屏" : "全屏"}
                </button>
              )}
            </div>
            <label className="seek-label">
              <span className="sr-only">播放进度</span>
              <input
                aria-label="播放进度"
                type="range"
                min={0}
                max={lesson.total - 1}
                step={1}
                value={frame}
                aria-valuetext={formatTime(frame)}
                onChange={(e) => seek(Number(e.target.value))}
              />
            </label>
          </div>
          {error && (
            <p className="player-error" role="alert">
              播放遇到问题：{error}
            </p>
          )}
        </div>
        <aside className="annotation-panel" aria-label="当前画面标注">
          <div className="panel-heading">
            <span className="eyebrow">当前讲解</span>
            <h2>{chapterTitle(segment)}</h2>
          </div>
          {annotations.length > 0 ? (
            <ol className="annotation-list">
              {annotations.map((a) => (
                <li key={`${segment.id}-${a.number}`}>
                  <span className="marker-number">{a.number}</span>
                  <div>
                    <strong>{a.zh}</strong>
                    <span lang="en">{a.name}</span>
                    <small lang="la">{a.latin}</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="annotation-empty">
              结合模型与字幕，认识本节结构及其空间关系。
            </p>
          )}
          <p className="accuracy-note">{accuracyNote(episode, frame)}</p>
        </aside>
      </div>
      <section className="chapters" aria-label="章节导航">
        <div className="section-heading">
          <h2>按知识点学习</h2>
          <span>{lesson.segments.length} 节 · 可直接跳转</span>
        </div>
        <div className="chapter-grid">
          {lesson.segments.map((s) => (
            <button
              key={s.id}
              className={s.id === segment.id ? "chapter active" : "chapter"}
              aria-current={s.id === segment.id ? "step" : undefined}
              onClick={() => seek(s.start)}
            >
              <time>{formatTime(s.start)}</time>
              <span>{chapterTitle(s)}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
function App() {
  const [episode, setEpisode] = useState(0);
  const lesson = lessons[episode]!;
  return (
    <main>
      <header className="page-header">
        <a className="brand" href="./">
          ANATOMY / 颅骨课堂
        </a>
        <span className="edition">医学内容修订 · 2026.11</span>
        <h1>把颅骨，逐层看明白。</h1>
        <p>22 块骨，从空间结构到临床联系。三维讲解 · 中英双语字幕</p>
      </header>
      <nav className="episode-tabs" aria-label="选择课程">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setEpisode(i)}
            aria-pressed={i === episode}
            className={i === episode ? "episode-tab selected" : "episode-tab"}
          >
            <span>0{i + 1}</span>
            {l.title}
            <small>{formatTime(l.total)}</small>
          </button>
        ))}
      </nav>
      <section aria-label={lesson.title}>
        <div className="lesson-heading">
          <h2>{lesson.title}</h2>
          <p>{lesson.description}</p>
        </div>
        <LessonPlayer key={lesson.id} episode={episode} />
      </section>
      <footer>
        <p>
          骨模型：BodyParts3D / © Database Center for Life Science ·{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/2.1/jp/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY-SA 2.1 JP
          </a>
        </p>
        <p>
          模型与标记用于解剖学习。
          <a
            href="https://github.com/vorojar/head-exploded/blob/main/docs/medical-review.md"
            target="_blank"
            rel="noreferrer"
          >
            查看修订依据
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/vorojar/head-exploded/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noreferrer"
          >
            版本变更
          </a>
        </p>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
