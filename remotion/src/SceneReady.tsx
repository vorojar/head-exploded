import {useEffect,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
/** Signal readiness only after the committed scene has drawn its first frame. */
export function SceneReady({onReady}:{onReady?:()=>void}){
  const reported=useRef(false),pending=useRef<number>();
  useFrame(()=>{
    if(reported.current)return;
    reported.current=true;
    pending.current=requestAnimationFrame(()=>onReady?.());
  });
  useEffect(()=>()=>{if(pending.current!==undefined)cancelAnimationFrame(pending.current);},[]);
  return null;
}
