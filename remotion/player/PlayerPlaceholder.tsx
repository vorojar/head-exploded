import React from 'react';
import {BrandPoster} from './BrandPoster';
export function PlayerPlaceholder(){
  return <div className="learning-layout">
    <div className="playback-shell" aria-busy="true"><div className="video-stage"><BrandPoster/></div></div>
    <aside className="annotation-panel" data-empty="true" aria-hidden="true"/>
  </div>;
}
