import * as THREE from 'three';
import {BONES, type Vec3} from './skullMath';

type View = {camPos:Vec3;camTarget:Vec3;camUp?:Vec3;points?:unknown[]};
// BodyParts3D's reviewed left/right pairs establish +X as anatomical left.
const left = Math.sign(BONES.find(b=>b.num===2)!.center[0]-BONES.find(b=>b.num===3)!.center[0]);
export function orientationDirections(view:View) {
  const forward=new THREE.Vector3(...view.camTarget).sub(new THREE.Vector3(...view.camPos)).normalize();
  const right=forward.clone().cross(new THREE.Vector3(...(view.camUp??[0,1,0]))).normalize();
  const up=right.clone().cross(forward).normalize();
  const axes:[string,Vec3][]=[['左',[left,0,0]],['右',[-left,0,0]],['前',[0,0,1]],['后',[0,0,-1]],['上',[0,1,0]],['下',[0,-1,0]]];
  return axes.map(([label,axis])=>{const v=new THREE.Vector3(...axis);const x=v.dot(right),y=-v.dot(up),depth=v.dot(forward);return {label,x,y,depth,visible:Math.hypot(x,y)>.22||depth<0};});
}
export function OrientationCue({view,compact=false}:{view:View;compact?:boolean}) {
  const cx=compact?110:82,cy=compact?390:530,r=compact?68:46,font=compact?30:23;
  const directions=orientationDirections(view).sort((a,b)=>b.depth-a.depth);
  return <svg data-orientation="true" width={1280} height={720} role="img" aria-label="解剖方向：前后、左右、上下" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    {directions.filter(d=>d.visible).map(d=><g key={d.label}>
      <line x1={cx} y1={cy} x2={cx+d.x*r*.72} y2={cy+d.y*r*.72} stroke="#a7bdb4" strokeWidth={2} opacity={d.depth>0?.35:.8}/>
      <text x={cx+d.x*r} y={cy+d.y*r} fill={d.depth>0?'#a7bdb4':'#f3f6f4'} stroke="#000" strokeWidth={2} paintOrder="stroke" fontSize={font} fontWeight={600} textAnchor="middle" dominantBaseline="central">{d.label}</text>
    </g>)}
    {!!view.points?.length&&<text data-schematic-legend="true" x={compact?26:22} y={cy+r+font+10} fill="#bdcbc5" fontSize={compact?25:18}>○ 虚线为示意定位</text>}
  </svg>;
}
