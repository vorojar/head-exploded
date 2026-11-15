import React from 'react';
import poster from './poster-asset.json';
export function BrandPoster({ready=false}:{ready?:boolean}){
  return <div className="brand-poster" aria-busy={!ready}>
    <div className="brand-poster-content">
      <img className="brand-poster-logo" src={poster.src} width={poster.width} height={poster.height} alt="易哈佛" loading="eager" decoding="async"/>
      {!ready&&<p className="brand-poster-status" role="status">正在加载中</p>}
    </div>
  </div>;
}
