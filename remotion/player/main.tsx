import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {SkullVideo} from '../src/SkullVideo';
import {SkullVideo2} from '../src/SkullVideo2';
import {SkullVideo3} from '../src/SkullVideo3';

// staticFile('mixed.wav') returns '/mixed.wav' (domain root) by default.
// This page lives at /head-exploded/, so point both audio files at siblings.
(window as unknown as {
  remotion_staticFiles: {name: string; src: string}[];
}).remotion_staticFiles = [
  {name: 'mixed.wav', src: './mixed.wav'},
  {name: 'mixed2.wav', src: './mixed2.wav'},
  {name: 'mixed3.wav', src: './mixed3.wav'},
];

const EPISODES = [
  {
    id: 'ep1',
    tab: '第一集 · 22 块颅骨',
    title: '头部爆炸图 · 22 块颅骨讲解',
    desc: '纯代码生成 · Remotion + Three.js · 真实 BodyParts3D 网格 · 英文旁白',
    component: SkullVideo,
    durationInFrames: 2758,
    durationLabel: '1 分 55 秒',
  },
  {
    id: 'ep2',
    tab: '第二集 · 缝与孔',
    title: '缝、孔与临床要点',
    desc: '颅缝 · 颅底孔裂 · 骨折与出血的临床锚点 · 英文旁白',
    component: SkullVideo2,
    durationInFrames: 4482,
    durationLabel: '3 分 07 秒',
  },
  {
    id: 'ep3',
    tab: '第三集 · 系统与临床',
    title: '系统与临床：神经总表 · 眼眶 · 下颌关节 · 骨折',
    desc: '脑神经–孔洞总表 · 眼眶四壁 · TMJ · Le Fort 骨折 · 颅底骨折体征 · 英文旁白',
    component: SkullVideo3,
    durationInFrames: 5499,
    durationLabel: '3 分 49 秒',
  },
] as const;

const page: React.CSSProperties = {
  margin: 0,
  minHeight: '100vh',
  background: '#0e0f12',
  color: '#f2f3f5',
  fontFamily: 'sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 12px 40px',
  boxSizing: 'border-box',
};

function App() {
  const [ep, setEp] = useState(0);
  const cur = EPISODES[ep];
  return (
    <div style={page}>
      <h1 style={{fontSize: 22, margin: '0 0 6px', textAlign: 'center'}}>{cur.title}</h1>
      <p style={{fontSize: 14, color: '#9aa0a8', margin: '0 0 16px', textAlign: 'center'}}>
        {cur.desc} · {cur.durationLabel}
      </p>
      <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
        {EPISODES.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setEp(i)}
            style={{
              fontSize: 15,
              padding: '8px 18px',
              borderRadius: 20,
              border: i === ep ? '2px solid #f2f3f5' : '2px solid #3a3f46',
              background: i === ep ? '#f2f3f5' : 'transparent',
              color: i === ep ? '#0e0f12' : '#c8ccd2',
              cursor: 'pointer',
              fontWeight: i === ep ? 700 : 400,
            }}
          >
            {e.tab}
          </button>
        ))}
      </div>
      <Player
        key={cur.id}
        component={cur.component}
        durationInFrames={cur.durationInFrames}
        fps={24}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        loop
        clickToPlay
        acknowledgeRemotionLicense
        style={{
          width: '100%',
          maxWidth: 1280,
          aspectRatio: '16 / 9',
          backgroundColor: '#000',
        }}
      />
      <p style={{fontSize: 13, color: '#7c828b', margin: '16px 0 0', textAlign: 'center'}}>
        点画面开始播放 · 可拖进度条 · 数据来源：BodyParts3D, © Database Center for Life Science, CC BY-SA 2.1 JP
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
