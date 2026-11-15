import React from 'react';
import poster from './poster-asset.json';
export function BrandPoster({ready=false,onPlay}:{ready?:boolean;onPlay?:()=>void}){
  return <div className="brand-poster" aria-busy={!ready}>
    <div className="brand-poster-content">
      <img className="brand-poster-logo" src={poster.src} width={poster.width} height={poster.height} alt="易哈佛" loading="eager" decoding="async"/>
      {ready?<button className="brand-poster-play" onClick={e=>{e.stopPropagation();onPlay?.();}} aria-label="开始播放">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m8 5 11 7-11 7z" fill="currentColor"/></svg>点击播放
      </button>:<p className="brand-poster-status" role="status">正在加载三维颅骨…</p>}
    </div>
  </div>;
}
