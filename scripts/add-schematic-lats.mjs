// Supplemental illustrative surfaces, not BodyParts3D source meshes.
import * as T from 'three';
import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
const root=new URL('../public/models/',import.meta.url),atlas=JSON.parse(readFileSync(new URL('atlas.json',root)));
if(atlas.parts.some(p=>p.id==='SCHEM_LAT_L'))throw Error('Schematic lats already present; restore the base model before rerunning.');
let buffer=gunzipSync(readFileSync(new URL('body.bin.gz',root)));
const rows=[[.94,.022,.055,-.08],[1.02,.010,.09,-.10],[1.12,.012,.145,-.124],[1.23,.025,.163,-.108],[1.30,.10,.175,-.065],[1.35,.155,.18,-.035]];
for(const side of [-1,1]){
 const pos=[],idx=[],steps=32,across=16;
 for(let layer=0;layer<2;layer++)for(let j=0;j<=steps;j++)for(let i=0;i<=across;i++){
  const t=j/steps*(rows.length-1),k=Math.min(rows.length-2,Math.floor(t)),f=t-k,u=i/across;const row=rows[k].map((v,n)=>T.MathUtils.lerp(v,rows[k+1][n],f));
  const x=T.MathUtils.lerp(row[1],row[2],u),thick=.009*Math.sin(Math.PI*u)*Math.sin(Math.PI*j/steps);
  pos.push(side*x,row[0],row[3]+.025*u*u+(layer?1:-1)*thick);
 }
 const stride=across+1,layerSize=(steps+1)*stride;
 for(let l=0;l<2;l++)for(let j=0;j<steps;j++)for(let i=0;i<across;i++){const a=l*layerSize+j*stride+i,b=a+1,c=a+stride,d=c+1;const face=[a,c,b,b,c,d];idx.push(...((side===1)===(l===0)?face:face.reverse()));}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();geo.computeBoundingBox();
 const p={id:side===1?'SCHEM_LAT_L':'SCHEM_LAT_R',name:`${side===1?'Left':'Right'} latissimus dorsi (schematic)`,system:'muscular',vertexCount:pos.length/3,indexCount:idx.length,bounds:[geo.boundingBox.min.toArray(),geo.boundingBox.max.toArray()],source:'Original schematic surface; not BodyParts3D geometry'};
 const normals=Int16Array.from(geo.attributes.normal.array,v=>Math.round(Math.max(-1,Math.min(1,v))*32767));
 for(const [name,typed] of [['positions',Float32Array.from(pos)],['normals',normals],['indices',Uint32Array.from(idx)]]){if(buffer.length%4)buffer=Buffer.concat([buffer,Buffer.alloc(4-buffer.length%4)]);p[name]=buffer.length;buffer=Buffer.concat([buffer,Buffer.from(typed.buffer)]);}
 atlas.parts.push(p);
}
atlas.bytes=buffer.length;writeFileSync(new URL('atlas.json',root),JSON.stringify(atlas));writeFileSync(new URL('body.bin.gz',root),gzipSync(buffer,{level:9}));
console.log('Added two clearly identified schematic lat surfaces.');
