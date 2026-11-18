type WebKitVideo = HTMLVideoElement & {
  webkitSetPresentationMode?: (mode: 'inline' | 'picture-in-picture') => void;
  webkitPresentationMode?: string;
};
export type PictureInPictureSession = {
  close: () => Promise<void>;
  playback: (playing: boolean) => void;
  position: (seconds: number, playbackRate: number) => void;
  volume: (muted: boolean) => void;
};
export const canPictureInPicture = () =>
  typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
  (document.pictureInPictureEnabled || 'webkitSetPresentationMode' in HTMLVideoElement.prototype);

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    if (line && ctx.measureText(line + char).width > width) {lines.push(line.trim()); line = '';}
    line += char;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

/** Local live stream only: no recording, upload, video download or extra model. */
export async function openPictureInPicture(options: {
  stage: HTMLElement;
  render: () => void;
  play: () => void;
  pause: () => void;
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  duration: number;
  seek: (seconds: number) => void;
  onClose: () => void;
}): Promise<PictureInPictureSession> {
  const source = options.stage.querySelector('canvas');
  if (!source) throw new Error('三维画面尚未准备好');
  const composite = document.createElement('canvas');
  composite.width = 960; composite.height = 540;
  const ctx = composite.getContext('2d');
  if (!ctx) throw new Error('当前浏览器无法创建小窗画面');
  const stream = composite.captureStream(24);
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
  const video = document.createElement('video') as WebKitVideo;
  video.width = 960; video.height = 540;
  video.muted = options.isMuted();
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.className = 'pip-stream';
  video.srcObject = stream;
  document.body.append(video);
  let closed = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  const media = navigator.mediaSession;
  const previousPlayback = media?.playbackState;
  const registeredActions: MediaSessionAction[] = [];
  let positionPublished = false;
  const position = (seconds: number, playbackRate: number) => {
    if (closed || typeof media?.setPositionState !== 'function') return;
    media.setPositionState({
      duration: options.duration,
      position: Math.max(0, Math.min(options.duration, seconds)),
      playbackRate,
    });
    positionPublished = true;
  };
  const playFromVideo = () => {
    if (!closed && !video.paused) options.play();
  };
  const pauseFromVideo = () => {
    if (!closed && video.paused) options.pause();
  };
  // The bridge carries the picture; its native mute control drives the lesson audio.
  const volumeFromVideo = () => {
    const muted = video.muted || video.volume === 0;
    if (!closed && muted !== options.isMuted()) options.setMuted(muted);
  };
  const volume = (muted: boolean) => {
    if (closed) return;
    video.muted = muted;
    if (!muted && video.volume === 0) video.volume = 1;
  };
  const draw = () => {
    // Background tabs stop RAF. Render explicitly before copying the WebGL
    // buffer, so capture neither freezes nor needs preserveDrawingBuffer.
    options.render();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 960, 540);
    const scale = Math.min(960 / source.width, 540 / source.height);
    const width = source.width * scale, height = source.height * scale;
    ctx.drawImage(source, (960 - width) / 2, (540 - height) / 2, width, height);
    ctx.save(); ctx.scale(960 / 1280, 540 / 720);
    options.stage.querySelectorAll<SVGGElement>('svg[aria-hidden="true"] g').forEach(group => {
      const line = group.querySelector('line'), circle = group.querySelector('circle'), text = group.querySelector('text');
      if (!circle || !text) return;
      ctx.globalAlpha=Number(group.getAttribute('opacity')??1);
      const n = (el: Element, key: string) => Number(el.getAttribute(key));
      if (line) {
        ctx.beginPath(); ctx.moveTo(n(line, 'x1'), n(line, 'y1')); ctx.lineTo(n(line, 'x2'), n(line, 'y2'));
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4;
        ctx.setLineDash((line.getAttribute('stroke-dasharray')??'').split(/[ ,]+/).map(Number).filter(n=>n>0));ctx.stroke();ctx.setLineDash([]);
      }
      ctx.beginPath(); ctx.arc(n(circle, 'cx'), n(circle, 'cy'), n(circle, 'r'), 0, Math.PI * 2);
      if(circle.getAttribute('fill')!=='none'){ctx.fillStyle = '#103e3a'; ctx.fill();} ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
      ctx.font = '700 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.strokeText(text.textContent ?? '', n(text, 'x'), n(text, 'y'));
      ctx.fillText(text.textContent ?? '', n(text, 'x'), n(text, 'y'));
    });
    ctx.globalAlpha=1;
    options.stage.querySelectorAll<SVGPathElement>('path[data-schematic-fracture]').forEach(path=>{
      const length=path.getTotalLength(),progress=Number(path.dataset.progress??0),end=length*progress;
      const start=path.getPointAtLength(0);ctx.beginPath();ctx.moveTo(start.x,start.y);
      for(let i=1;i<=80;i++){const p=path.getPointAtLength(end*i/80);ctx.lineTo(p.x,p.y);}
      ctx.strokeStyle=path.getAttribute('stroke')??'#dc3c3c';ctx.lineWidth=5;ctx.setLineDash([14,10]);ctx.stroke();ctx.setLineDash([]);
    });
    const orientation=options.stage.querySelector('svg[data-orientation]');
    orientation?.querySelectorAll('line').forEach(line=>{ctx.beginPath();ctx.moveTo(Number(line.getAttribute('x1')),Number(line.getAttribute('y1')));ctx.lineTo(Number(line.getAttribute('x2')),Number(line.getAttribute('y2')));ctx.strokeStyle=line.getAttribute('stroke')??'#a7bdb4';ctx.globalAlpha=Number(line.getAttribute('opacity')??1);ctx.lineWidth=2;ctx.stroke();});
    ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';
    orientation?.querySelectorAll('text').forEach(text=>{ctx.font=`600 ${text.getAttribute('font-size')??23}px sans-serif`;ctx.textAlign=text.hasAttribute('data-schematic-legend')?'left':'center';ctx.fillStyle=text.getAttribute('fill')??'#fff';ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.strokeText(text.textContent??'',Number(text.getAttribute('x')),Number(text.getAttribute('y')));ctx.fillText(text.textContent??'',Number(text.getAttribute('x')),Number(text.getAttribute('y')));});
    ctx.restore(); ctx.globalAlpha=1;
    const captions = [...options.stage.querySelectorAll<HTMLElement>('.subtitle-box p')];
    const rows = captions.flatMap((el, i) => {
      const font = i === 0 ? '600 32px sans-serif' : '26px sans-serif';
      ctx.font = font;
      return wrap(ctx, el.textContent ?? '', 900).map(text => ({text, font, height:i === 0 ? 38 : 32}));
    });
    let y = 522 - rows.reduce((sum, row) => sum + row.height, 0);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
    for (const row of rows) {ctx.font = row.font; ctx.fillText(row.text, 480, y); y += row.height;}
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.textBaseline = 'alphabetic';
    track.requestFrame?.();
  };
  const cleanup = () => {
    if (closed) return;
    closed = true; clearInterval(timer);
    video.removeEventListener('play', playFromVideo);
    video.removeEventListener('pause', pauseFromVideo);
    video.removeEventListener('volumechange', volumeFromVideo);
    stream.getTracks().forEach(t => t.stop());
    video.pause(); video.srcObject = null; video.remove();
    if (positionPublished) media?.setPositionState();
    if (media && registeredActions.length > 0) {
      for (const action of registeredActions) media.setActionHandler(action, null);
      media.playbackState = previousPlayback ?? 'none';
    }
    options.onClose();
  };
  const playback = (playing: boolean) => {
    if (closed) return;
    if (media && registeredActions.length > 0) {
      media.playbackState = playing ? 'playing' : 'paused';
    }
    if (playing && video.paused) {
      void video.play().catch(() => {
        // If the browser refuses to resume the small window, keep the lesson paused too.
        if (!closed && video.paused) options.pause();
      });
    } else if (!playing && !video.paused) {
      video.pause();
    }
  };
  const closedBySystem = () => {
    if (document.hidden) options.pause();
    cleanup();
  };
  video.addEventListener('leavepictureinpicture', closedBySystem);
  video.addEventListener('webkitpresentationmodechanged', () => {
    if (video.webkitPresentationMode === 'inline') closedBySystem();
  });
  try {
    draw(); timer = setInterval(draw, 1000 / 24);
    await video.play();
    if (document.pictureInPictureEnabled && video.requestPictureInPicture) await video.requestPictureInPicture();
    else if (video.webkitSetPresentationMode) {
      video.webkitSetPresentationMode('picture-in-picture');
      if (video.webkitPresentationMode !== 'picture-in-picture') throw new Error('当前浏览器不支持实时画面的画中画');
    }
    else throw new Error('当前浏览器暂不支持系统小窗');
    // Some systems act on the video directly instead of sending Media Session actions.
    video.addEventListener('play', playFromVideo);
    video.addEventListener('pause', pauseFromVideo);
    video.addEventListener('volumechange', volumeFromVideo);
    if (media) {
      const actions: [MediaSessionAction, MediaSessionActionHandler][] = [
        ['play', options.play],
        ['pause', options.pause],
        ['seekto', ({seekTime}) => {
          if (seekTime !== undefined && Number.isFinite(seekTime)) options.seek(seekTime);
        }],
      ];
      for (const [action, handler] of actions) {
        try {
          media.setActionHandler(action, handler);
          registeredActions.push(action);
        } catch {
          // Native video events still work if a platform omits a Media Session action.
        }
      }
    }
  } catch (error) {cleanup(); throw error;}
  return {playback, position, volume, close: async () => {
    try {
      if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
      else if (video.webkitPresentationMode === 'picture-in-picture') video.webkitSetPresentationMode?.('inline');
    } finally {cleanup();}
  }};
}
