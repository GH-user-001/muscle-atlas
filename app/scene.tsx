'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Exercise,roleFor} from './exercises';
export type View='front'|'back'|'side';
type Props={exercise:Exercise;progress:number;view:View;reset:number;onReady:(ready:boolean)=>void;};
type Part={id:string;name:string;system:string;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:number[][]};
// Surface coordinates remain in the rest pose, so fibers travel with each muscle.
const tissueShader=`
uniform float phase;
uniform float engagement;
varying vec3 vTissue;
float fiberHeight(vec3 p){
 float wave=p.x*2100.+sin(p.y*95.)*.65+sin(p.z*125.)*.35;
 float aa=max(fwidth(wave),.001);
 return sin(wave)*(.5/(1.+aa*aa))+sin(wave*.43)*.16;
}
`;
function setTissueColor(material:T.MeshStandardMaterial,system:string,role:number){
 material.color.set(system==='skeletal'?'#a8b1b5':role===2?'#f39b38':role===1?'#dc7042':'#ad5140');
 material.emissive.set(system==='skeletal'?'#000000':role===2?'#ffac30':role===1?'#ff7130':'#34100b');
 material.emissiveIntensity=system==='skeletal'?0:role===2?.55:role===1?.2:.025;
}
const deform=`
uniform float phase;
uniform float exercise;
uniform float limb;
uniform float activation;
uniform vec3 center;
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rz(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
vec3 pose(vec3 p){
 float q=(1.-cos(phase*6.2831853))*.5;
 float side=sign(limb);float arm=step(.5,abs(limb))*(1.-step(1.5,abs(limb)));
 float leg=step(1.5,abs(limb));
 float bend=0.;float shoulder=0.;float abduction=0.;float elbowSide=0.;
 if(exercise<1.5){bend=-2.15*q;}
 else if(exercise<2.5){shoulder=-2.9;bend=-1.9*(1.-q);}
 else if(exercise<3.5){shoulder=.9;bend=-1.7*(1.-q);}
 else if(exercise<4.5){abduction=1.05+1.7*q;elbowSide=1.8*(1.-q);}
 else if(exercise<5.5){abduction=1.25*q;bend=-.15;}
 else if(exercise<6.5){shoulder=-.65+1.15*q;bend=-1.65*q;}
 else if(exercise<7.5){abduction=2.75-1.6*q;elbowSide=1.8*q;}
 else if(exercise<8.5){shoulder=-1.45;}
 else if(exercise<9.5){shoulder=-.85*q;}
 if(arm>.5){
  vec3 elbow=vec3(side*.224,1.115,-.033);vec3 sh=vec3(side*.162,1.395,-.034);
  if(exercise>.5&&exercise<1.5){vec3 wrist=vec3(side*.26,.92,.0);float grip=1.-smoothstep(.89,1.105,p.y);p=mix(p,ry(p-wrist,side*1.5708)+wrist,grip);}
  float ew=1.-smoothstep(1.085,1.155,p.y);
  vec3 ep=rx(p-elbow,bend);ep=rz(ep,side*elbowSide);p=mix(p,ep+elbow,ew);
  float sw=1.-smoothstep(1.35,1.445,p.y);
  vec3 sp=rx(p-sh,shoulder);sp=rz(sp,side*abduction);p=mix(p,sp+sh,sw);
 }
 if(exercise>7.5&&exercise<8.5){
  float a=.85*q;
  if(leg>.5){vec3 k=vec3(side*.084,.47,-.01);float kw=1.-smoothstep(.43,.51,p.y);p=mix(p,rx(p-k,2.*a)+k,kw);vec3 hip=vec3(side*.09,.9,-.03);p=rx(p-hip,-a)+hip;}
  else {vec3 hip=vec3(0.,.9,-.03);p=rx(p-hip,.3*q)+hip;}
  p.y-=.84*(1.-cos(a));p.z-=.035*q;
 }
 if((exercise>2.5&&exercise<3.5)||(exercise>5.5&&exercise<6.5)||(exercise>8.5&&exercise<9.5)){
  float hinge=exercise>8.5?.85*q:.8;
  float hw=smoothstep(.80,.96,p.y);
  vec3 hip=vec3(0.,.9,-.03);p=mix(p,rx(p-hip,hinge)+hip,hw);p.z-=.10*(exercise>8.5?q:1.);
 }
 if(exercise>9.5){float lift=.065*q;float foot=1.-smoothstep(.075,.15,p.y);p.y+=lift*(1.-foot);p= mix(p,rx(p-vec3(0.,.03,.14),-.30*q)+vec3(0.,.03,.14),foot);}
 return p;
}
vec3 deformPoint(vec3 p){
 float q=(1.-cos(phase*6.2831853))*.5;
 vec3 d=p-center;
 // Small illustrative change in muscle belly thickness; no activation percentages.
 p.x+=d.x*activation*.055*q;p.z+=d.z*activation*.055*q;
 return pose(p);
}
`;
export default function AnatomyScene(props:Props){
 const host=useRef<HTMLDivElement>(null),state=useRef(props),uniforms=useRef<any[]>([]),cameraRef=useRef<T.PerspectiveCamera|null>(null),controlRef=useRef<OrbitControls|null>(null),meshes=useRef<{mesh:T.Mesh;part:Part}[]>([]);
 const [error,setError]=useState(''),[status,setStatus]=useState('Loading anatomy…');
 state.current=props;
 useEffect(()=>{const camera=cameraRef.current,controls=controlRef.current;if(!camera||!controls)return;const v=props.view;camera.position.set(v==='side'?2.8:v==='back'?-.35:.35,1.05,v==='side'?.12:v==='back'?-2.9:2.9);controls.target.set(0,.90,0);controls.update();},[props.view,props.reset]);
 useEffect(()=>{for(const {mesh,part} of meshes.current)setTissueColor(mesh.material as T.MeshStandardMaterial,part.system,roleFor(part.name,props.exercise));},[props.exercise]);
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0;const abort=new AbortController();let renderer:T.WebGLRenderer;
  props.onReady(false);
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setError('3D is unavailable in this browser. Enable WebGL or try another browser. Exercise instructions remain available.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive anatomical model. Drag to rotate; scroll or pinch to zoom.');
  const scene=new T.Scene();const camera=new T.PerspectiveCamera(35,1,.01,20);camera.position.set(.35,1.05,2.9);cameraRef.current=camera;
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.90,0);controls.enableDamping=true;controls.minDistance=1.15;controls.maxDistance=5;controls.maxPolarAngle=Math.PI*.90;controls.minPolarAngle=.1;controls.enablePan=false;controls.update();controlRef.current=controls;
  scene.add(new T.HemisphereLight(0xffffff,0x555b68,.95));const key=new T.DirectionalLight(0xffe8d5,3.2);key.position.set(2,3,4);scene.add(key);const rim=new T.DirectionalLight(0xc9e5ff,2.6);rim.position.set(-2,2,-2);scene.add(rim);
  const ring=new T.Mesh(new T.RingGeometry(.32,.325,90),new T.MeshBasicMaterial({color:0xbfc8ce,transparent:true,opacity:.28,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.018;scene.add(ring);
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  function update(){if(disposed)return;for(const u of uniforms.current){u.phase.value=state.current.progress%1;u.exercise.value=state.current.exercise.motion;const role=roleFor(u.partName,state.current.exercise);u.activation.value=role===2?1:role===1?.35:0;u.engagement.value=role===2?1:role===1?.38:0;}controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(update);}update();
  async function load(){try{
   const manifest=await fetch('/models/atlas.json',{signal:abort.signal});if(!manifest.ok)throw Error('Anatomy manifest could not load.');const atlas=await manifest.json() as {parts:Part[];bytes:number};
   const response=await fetch('/models/body.bin.gz',{signal:abort.signal});if(!response.ok||!response.body)throw Error('Anatomy geometry could not load.');
   const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();if(buffer.byteLength!==atlas.bytes)throw Error('Anatomy download was incomplete.');if(disposed)return;
   for(const p of atlas.parts as Part[]){
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));geometry.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));geometry.computeBoundingSphere();
    const center=new T.Vector3(...p.bounds[0] as [number,number,number]).add(new T.Vector3(...p.bounds[1] as [number,number,number])).multiplyScalar(.5);
    const side=center.x>0?1:-1;
    const arm= center.y>.73&&center.y<1.45&&Math.abs(center.x)>.16 && !/pectoralis|latissimus|serratus|trapezius|rhomboid/.test(p.name.toLowerCase());
    const leg=center.y<.85&&!/sacrum|coccyx|hip bone|pelvis|pubis/.test(p.name.toLowerCase());
    const role=roleFor(p.name,state.current.exercise),isMuscle=p.system!=='skeletal';
    const mat=new T.MeshStandardMaterial({roughness:isMuscle?.38:.8,metalness:0,transparent:!isMuscle,opacity:isMuscle?1:.18,depthWrite:isMuscle});
    setTissueColor(mat,p.system,role);
    // Orient striations along the long axis, with a fan for the chest muscles.
    const size=new T.Vector3(...p.bounds[1] as [number,number,number]).sub(new T.Vector3(...p.bounds[0] as [number,number,number]));
    const fiberAxis=/pectoralis/.test(p.name.toLowerCase())?2:size.x>size.y?1:0;
    const u={phase:{value:0},exercise:{value:state.current.exercise.motion},limb:{value:arm?side:leg?side*2:0},activation:{value:role===2?1:0},engagement:{value:role===2?1:role===1?.38:0},center:{value:center},partName:p.name};uniforms.current.push(u);
    mat.customProgramCacheKey=()=>`tissue-v3-${isMuscle}-${fiberAxis}`;
    mat.onBeforeCompile=shader=>{
     Object.assign(shader.uniforms,{phase:u.phase,exercise:u.exercise,limb:u.limb,activation:u.activation,engagement:u.engagement,center:u.center});
     shader.vertexShader=deform+'\nvarying vec3 vTissue;\n'+shader.vertexShader;
     shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal = normalize(deformPoint(position + normal * .001) - deformPoint(position));');
     const tissuePosition=fiberAxis===2?'vec3(length((position-center).xy)*.65,position.x,position.z)':fiberAxis===1?'position.yxz':'position';
     shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`vTissue = ${tissuePosition}; vec3 transformed = deformPoint(position);`);
     if(isMuscle){
      shader.fragmentShader=tissueShader+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
       float fiber=fiberHeight(vTissue);
       diffuseColor.rgb *= .86 + fiber*.27;
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
       vec3 dpX=dFdx(vViewPosition),dpY=dFdy(vViewPosition);
       vec3 rX=cross(dpY,normal),rY=cross(normal,dpX);
       float det=dot(dpX,rX);
       vec3 grad=sign(det)*(dFdx(fiber)*rX+dFdy(fiber)*rY);
       normal=normalize(abs(det)*normal-.00012*grad);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
       float contraction=(1.-cos(phase*6.2831853))*.5;
       float edge=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.5);
       totalEmissiveRadiance *= .65+contraction*1.25;
       totalEmissiveRadiance += vec3(1.,.36,.045)*engagement*(edge*.6+max(fiber,0.)*.22)*(.45+contraction);
      `);
     }
    };
    const mesh=new T.Mesh(geometry,mat);mesh.frustumCulled=false;scene.add(mesh);meshes.current.push({mesh,part:p});
   }
   setStatus('');state.current.onReady(true);
  }catch(e){if(disposed)return;setError(e instanceof Error?e.message:'The anatomy model could not load.');setStatus('');}}
  void load();
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();meshes.current=[];uniforms.current=[];cameraRef.current=null;controlRef.current=null;};
 },[]);
 return <><div className="scene" ref={host}/>{status&&!error&&<div className="loading" role="status"><span className="loader"/>{status}</div>}{error&&<div className="loading error" role="alert"><p>{error}</p><button onClick={()=>window.location.reload()}>Reload model</button></div>}</>;
}
