import {useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
/** Wait for a completed scene frame, then notify directly on the next frame.
 * No one-shot RAF remains that an effect cleanup can cancel permanently. */
export function SceneReady({onReady}:{onReady?:()=>void}){
  const frames=useRef(0),reported=useRef(false);
  const gl=useThree(state=>state.gl);
  useFrame(()=>{
    if(reported.current||!onReady||gl.getContext().isContextLost())return;
    if(++frames.current<2)return;
    reported.current=true;
    onReady();
  });
  return null;
}
