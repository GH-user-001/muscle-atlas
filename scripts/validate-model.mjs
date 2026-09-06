import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync(new URL('../public/models/atlas.json',import.meta.url)));
const data=gunzipSync(readFileSync(new URL('../public/models/body.bin.gz',import.meta.url)));
assert.equal(data.length,manifest.bytes);
const ids=new Set();let triangles=0;
for(const p of manifest.parts){
 assert(!ids.has(p.id),`Duplicate ID ${p.id}`);ids.add(p.id);
 assert(['muscular','skeletal'].includes(p.system));
 assert(p.vertexCount>0&&p.indexCount>0&&p.indexCount%3===0);
 for(const [key,size] of [['positions',p.vertexCount*12],['normals',p.vertexCount*6],['indices',p.indexCount*4]]){assert.equal(p[key]%4,0);assert(p[key]+size<=data.length);}
 for(let i=0;i<p.vertexCount*3;i++){assert(Number.isFinite(data.readFloatLE(p.positions+i*4)));}
 for(let i=0;i<p.indexCount;i++){assert(data.readUInt32LE(p.indices+i*4)<p.vertexCount,`Invalid index in ${p.name}`);}
 triangles+=p.indexCount/3;
}
for(const name of ['biceps brachii','triceps brachii','deltoid','latissimus','vastus','gastrocnemius'])assert(manifest.parts.some(p=>p.name.toLowerCase().includes(name)),`Missing ${name}`);
console.log(`Validated ${ids.size} unique meshes, ${triangles.toLocaleString()} triangles, aligned buffers, finite positions, and all indices.`);
