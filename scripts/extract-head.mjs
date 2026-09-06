import fs from 'node:fs';
import path from 'node:path';
const source=path.resolve(process.argv[2]);
const atlas=JSON.parse(fs.readFileSync(path.join(source,'atlas.json'),'utf8'));
const part=atlas.parts.find(p=>p.name==='Skin');
const bytes=fs.readFileSync(path.join(source,`body-${part.chunk}.bin`));
const positions=new Float32Array(bytes.buffer,bytes.byteOffset+part.positions,part.vertexCount*3);
const indices=new Uint32Array(bytes.buffer,bytes.byteOffset+part.indices,part.indexCount);
const remap=new Map(),vertices=[],faces=[];
for(let i=0;i<indices.length;i+=3){
 const face=Array.from(indices.slice(i,i+3));
 if(face.some(v=>positions[v*3+1]<1.515))continue;
 for(const v of face){if(!remap.has(v)){remap.set(v,vertices.length/3);vertices.push(...positions.slice(v*3,v*3+3));}faces.push(remap.get(v));}
}
if(vertices.length<300||faces.length<300)throw Error('Head extraction is incomplete');
fs.writeFileSync('public/models/head.json',JSON.stringify({positions:vertices,indices:faces}));
console.log(`Extracted ${vertices.length/3} head vertices and ${faces.length/3} triangles from BodyParts3D skin surface.`);
