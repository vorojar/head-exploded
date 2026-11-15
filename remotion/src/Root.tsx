import React from 'react';
import {Composition} from 'remotion';
import {SkullVideo} from './SkullVideo';
import {SkullVideo2} from './SkullVideo2';
import {SkullVideo3} from './SkullVideo3';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeadExploded"
        component={SkullVideo}
        durationInFrames={2758}
        fps={24}
        width={1280}
        height={720}
      />
      <Composition
        id="HeadExploded2"
        component={SkullVideo2}
        durationInFrames={4482}
        fps={24}
        width={1280}
        height={720}
      />
      <Composition
        id="HeadExploded3"
        component={SkullVideo3}
        durationInFrames={5499}
        fps={24}
        width={1280}
        height={720}
      />
    </>
  );
};
