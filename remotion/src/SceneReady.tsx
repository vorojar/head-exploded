import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
/** Wait for a completed scene frame, then notify directly on the next frame.
 * No one-shot RAF remains that an effect cleanup can cancel permanently. */
export function SceneReady({onReady,onRenderer}:{onReady?:()=>void;onRenderer?:(render:(()=>void)|null)=>void}){
  const frames=useRef(0),reported=useRef(false);
  const gl=useThree(state=>state.gl);
  const scene=useThree(state=>state.scene),camera=useThree(state=>state.camera);
  useEffect(()=>{onRenderer?.(()=>gl.render(scene,camera));return()=>onRenderer?.(null);},[gl,scene,camera,onRenderer]);
  useFrame(()=>{
    if(reported.current||!onReady||gl.getContext().isContextLost())return;
    if(++frames.current<2)return;
    reported.current=true;
    onReady();
  });
  return null;
}
