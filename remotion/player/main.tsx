import React, { useCallback, useEffect, useRef, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  Player,
  type CallbackListener,
  type PlayerRef,
} from "@remotion/player";
import {
  accuracyNote,
  annotationsAt,
  captionAt,
  captionText,
  chapterTitle,
  lessons,
  segmentAt,
} from "../src/lessons";
import {PageLayout} from "./PageLayout";
import {PlayerPlaceholder} from "./PlayerPlaceholder";
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

type IconName = "play" | "pause" | "volume" | "mute" | "speed" | "fullscreen" | "exit" | "captions";
function Icon({name}:{name:IconName}) {
  const paths:Record<IconName,React.ReactNode>={
    play:<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>,
    pause:<><path d="M8 5v14M16 5v14" strokeWidth={4}/></>,
    volume:<><path d="M11 4 6 8H3v8h3l5 4z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
    mute:<><path d="M11 4 6 8H3v8h3l5 4zM16 9l6 6m0-6-6 6"/></>,
    speed:<><path d="M4 18a9 9 0 1 1 16 0M12 13l5-6"/><circle cx="12" cy="13" r="2"/></>,
    fullscreen:<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    exit:<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>,
    captions:<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M10 9H7v6h3m8-6h-3v6h3"/></>,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function LessonPlayer({ episode }: { episode: number }) {
  const player = useRef<PlayerRef>(null);
  const shell = useRef<HTMLDivElement>(null);
  const knowledgeStrip = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 700px)").matches,
  );
  const [full, setFull] = useState(false);
  const [rotated,setRotated]=useState(false);
  const [sceneReady,setSceneReady]=useState(false);
  const sceneReadyRef=useRef(false);
  const markSceneReady=useCallback(()=>{sceneReadyRef.current=true;setSceneReady(true);},[]);
  useEffect(()=>{
    if(!full){setRotated(false);return;}
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const update=()=>setRotated(matchMedia('(pointer: coarse)').matches&&innerHeight>innerWidth);
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.fullscreenElement)setFull(false);};
    update();window.addEventListener('resize',update);window.addEventListener('keydown',escape);
    return ()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('resize',update);window.removeEventListener('keydown',escape);screen.orientation?.unlock?.();};
  },[full]);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState("");
  const [controlsVisible,setControlsVisible]=useState(true);
  const [captionMode,setCaptionMode]=useState<"both"|"off">("both");
  const hideTimer=useRef<ReturnType<typeof setTimeout>>();
  const revealControls=()=>{
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    if(playing)hideTimer.current=setTimeout(()=>setControlsVisible(false),2500);
  };
  useEffect(()=>{revealControls();return ()=>clearTimeout(hideTimer.current);},[playing]);
  const lesson = lessons[episode]!;
  const segment = segmentAt(episode, frame);
  useEffect(() => {
    const strip = knowledgeStrip.current;
    if (!strip) return;
    const revealCurrent = () => {
      const current = strip.querySelector<HTMLElement>('[aria-current="step"]');
      if (!current) return;
      const left = current.offsetLeft - (strip.clientWidth - current.offsetWidth) / 2;
      strip.scrollTo({
        left: Math.max(0, Math.min(left, strip.scrollWidth - strip.clientWidth)),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    };
    revealCurrent();
    const observer = new ResizeObserver(revealCurrent);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [segment.id]);
  const cue = captionAt(episode, frame);
  const annotations = annotationsAt(episode, frame);
  // Overview and transition chapters have no concise list of teaching points.
  const showAnnotations = annotations.length > 0 && annotations.length <= 6;
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
    const play = () => {if(!sceneReadyRef.current){p.pause();return;}setPlaying(true);},
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
    if(full){
      if(document.fullscreenElement===shell.current)await document.exitFullscreen();
      setFull(false);return;
    }
    try {if(shell.current?.requestFullscreen)await shell.current.requestFullscreen();}
    catch { /* Use the same fitted stage as an in-page fullscreen on restricted browsers. */ }
    setFull(true);
    if(matchMedia('(pointer: coarse)').matches){
      const orientation=screen.orientation as ScreenOrientation & {lock?:(value:string)=>Promise<void>};
      try {await orientation?.lock?.('landscape');}
      catch {setRotated(innerHeight>innerWidth);}
    }
  };

  return (
    <>
      <div className="learning-layout">
        <div className="playback-shell" ref={shell} tabIndex={0} aria-label="视频播放器"
          data-controls-visible={controlsVisible} data-caption-mode={captionMode} data-fullscreen={full} data-rotated={rotated} data-scene-ready={sceneReady}
          onPointerMove={e=>{if(e.pointerType==='mouse')revealControls();}}
          onPointerDownCapture={e=>{if(!(e.target instanceof Element)||!e.target.closest('.scene-wrap'))revealControls();}}
          onFocusCapture={revealControls}>
          <div className="video-stage">
          <div className="scene-wrap" onClick={revealControls}>
            <Player
              ref={player}
              lazyComponent={lesson.load}
              inputProps={{ webPlayer: true, compactLabels: compact, onSceneReady:markSceneReady }}
              durationInFrames={lesson.total}
              fps={24}
              compositionWidth={1280}
              compositionHeight={720}
              controls={false}
              clickToPlay={false}
              spaceKeyToPlayOrPause={sceneReady}
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
            {(!sceneReady || !playing || controlsVisible) && (
              <button
                className="start-overlay"
                disabled={!sceneReady}
                onClick={e => {e.stopPropagation();if(sceneReady)player.current?.toggle();}}
                aria-label={sceneReady?(playing?"暂停":"播放"):"三维画面加载中"}
              >
                {sceneReady?<Icon name={playing?"pause":"play"}/>:<span className="scene-spinner" aria-hidden="true"/>}
              </button>
            )}
          </div>
          <nav className="knowledge-strip" ref={knowledgeStrip} aria-label="知识点章节导航">
            {lesson.segments.map(s=><button className={s.id===segment.id?"knowledge-chip active":"knowledge-chip"} key={s.id} aria-current={s.id===segment.id?"step":undefined} disabled={!sceneReady} onClick={()=>seek(s.start)}>
              <time>{formatTime(s.start)}</time><span>{chapterTitle(s)}</span>
            </button>)}
          </nav>
          {sceneReady && playing && cue && <div
            className="subtitle-box" aria-live="off"
            data-testid="subtitle"
            data-start-ms={cue?.startMs}
            data-end-ms={cue?.endMs}
          >
            <p className="subtitle-zh" lang="zh-CN">
              {captionText(cue.zh)}
            </p>
            <p className="subtitle-en" lang="en">
              {captionText(cue.text)}
            </p>
          </div>}
          <div className="transport" aria-label="播放控制">
            <label className="seek-label">
              <span className="sr-only">播放进度</span>
              <input aria-label="播放进度" type="range" disabled={!sceneReady} min={0} max={lesson.total-1} step={1} value={frame}
                aria-valuetext={formatTime(frame)} onChange={e=>seek(Number(e.target.value))}/>
            </label>
            <div className="transport-main">
              <button title={sceneReady?(playing?"暂停":"播放"):"三维画面加载中"} disabled={!sceneReady} onClick={()=>player.current?.toggle()} aria-label={playing?"暂停":"播放"}>
                <Icon name={playing?"pause":"play"}/>
              </button>
              <button title={muted?"取消静音":"静音"} aria-label={muted?"取消静音":"静音"} onClick={()=>{const p=player.current;if(p){if(p.isMuted())p.unmute();else p.mute();}}}>
                <Icon name={muted?"mute":"volume"}/>
              </button>
              <output aria-label="播放时间" aria-live="off">{formatTime(frame)} / {formatTime(lesson.total)}</output>
              <div className="control-spacer"/>
              <button className="cc-control" title={captionMode==="off"?"字幕已关闭":"中英双语字幕"}
                aria-label={captionMode==="off"?"开启双语字幕":"关闭字幕"}
                aria-pressed={captionMode!=="off"} onClick={()=>setCaptionMode(captionMode==="both"?"off":"both")}>
                <Icon name="captions"/>
              </button>
              <label className="rate-control" title="播放速度">
                <Icon name="speed"/><span className="rate-value" aria-hidden="true">{speed}×</span>
                <select aria-label="播放速度" value={speed} onChange={e=>{setSpeed(Number(e.target.value));revealControls();}}>
                  {[0.75,1,1.25,1.5].map(v=><option key={v} value={v}>{v}×</option>)}
                </select>
              </label>
              {<button title={full?"退出全屏":"全屏"} onClick={()=>{void toggleFull();}} aria-label={full?"退出全屏":"全屏学习"}>
                <Icon name={full?"exit":"fullscreen"}/>
              </button>}
            </div>
          </div>
          </div>
          {error && (
            <p className="player-error" role="alert">
              播放遇到问题：{error}
            </p>
          )}
        </div>

        <aside className="annotation-panel" aria-label="当前画面标注" data-empty={!showAnnotations} aria-hidden={!showAnnotations}>
          {showAnnotations && <>
          <div className="panel-heading">
            <span className="eyebrow">当前讲解</span>
            <h2>{chapterTitle(segment)}</h2>
          </div>
          {(
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
          )}
          <p className="accuracy-note">{accuracyNote(episode, frame)}</p>
          </>}
        </aside>
      </div>

    </>
  );
}
function App() {
  const [episode,setEpisode]=useState(0);
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  return <PageLayout episode={episode} onEpisodeChange={setEpisode}>{ready?<LessonPlayer key={episode} episode={episode}/>:<PlayerPlaceholder/>}</PageLayout>;
}

hydrateRoot(document.getElementById("root")!, <App />);
