import React from 'react';
export function PlayerPlaceholder(){
  return <div className="learning-layout">
    <div className="playback-shell" aria-busy="true"><div className="scene-wrap"><div className="loading" role="status">正在加载三维颅骨…</div></div></div>
    <aside className="annotation-panel" data-empty="true" aria-hidden="true"/>
  </div>;
}
