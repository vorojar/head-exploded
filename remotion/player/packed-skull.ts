import {readFileSync} from 'node:fs';
import type {Plugin} from 'vite';

// The source mesh is already rounded to four decimal places. Integer delta
// coding represents those existing values exactly; it never simplifies a mesh.
function decodeArray(bytes:Uint8Array,cursor:{offset:number},count:number,stride:number,scale:number,negativeZeros:number[]):number[]{
  const result:number[]=[];
  const previous=new Array<number>(stride).fill(0);
  for(let i=0;i<count;i++){
    let value=0,shift=0,byte=0;
    do {byte=bytes[cursor.offset++];value|=(byte&127)<<shift;shift+=7;}while(byte&128);
    const lane=i%stride;
    const integer=previous[lane]+((value>>>1)^-(value&1));
    previous[lane]=integer;
    result.push(integer/scale);
  }
  for(const index of negativeZeros)result[index]=-0;
  return result;
}
export function packedSkull():Plugin{
  const file=new URL('../public/skull.json',import.meta.url);
  const model=JSON.parse(readFileSync(file,'utf8')) as {bones:Record<string,unknown>[]};
  const bytes:number[]=[];
  const bones=model.bones.map(bone=>{
    const result={...bone};
    for(const key of ['positions','normals','indices']){
      const values=bone[key] as number[];
      const stride=key==='indices'?1:3,scale=key==='indices'?1:10000;
      const previous=new Array<number>(stride).fill(0),negativeZeros:number[]=[];
      const offset=bytes.length;
      values.forEach((value,i)=>{
        const integer=Math.round(value*scale);
        if(!Object.is(integer/scale,value)&&!Object.is(value,-0))throw new Error(`Mesh value cannot be encoded exactly: ${key}/${i}`);
        if(Object.is(value,-0))negativeZeros.push(i);
        const delta=integer-previous[i%stride];previous[i%stride]=integer;
        let zigzag=((delta<<1)^(delta>>31))>>>0;
        while(zigzag>127){bytes.push((zigzag&127)|128);zigzag>>>=7;}
        bytes.push(zigzag);
      });
      // An independent full round trip must preserve every numeric value,
      // including signed zero, before the build can publish this representation.
      const decoded=decodeArray(Uint8Array.from(bytes.slice(offset)),{offset:0},values.length,stride,scale,negativeZeros);
      if(decoded.length!==values.length||decoded.some((v,i)=>!Object.is(v,values[i])))throw new Error(`Mesh round-trip failed: ${key}`);
      result[key]={count:values.length,stride,scale,negativeZeros};
    }
    return result;
  });
  const id='\0ehafo-packed-skull';
  const encoded=Buffer.from(bytes).toString('base64');
  return {
    name:'lossless-skull-delta',enforce:'pre',
    resolveId(source,importer){if(source.endsWith('/public/skull.json')&&importer?.endsWith('/skullMath.ts'))return id;},
    load(source){
      if(source!==id)return;
      return `const decode=${decodeArray.toString()};const bytes=Uint8Array.from(atob(${JSON.stringify(encoded)}),c=>c.charCodeAt(0));const cursor={offset:0};const bones=${JSON.stringify(bones)};for(const bone of bones)for(const key of ['positions','normals','indices']){const p=bone[key];bone[key]=decode(bytes,cursor,p.count,p.stride,p.scale,p.negativeZeros)}export default {bones};`;
    },
    buildStart(){this.info(`Lossless skull: ${model.bones.length} bones, ${bytes.length} packed bytes; every position, normal and index round-trip verified.`);},
  };
}
