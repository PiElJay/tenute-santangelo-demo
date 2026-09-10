'use client';
import { useEffect, useRef, useState } from 'react';
import { imagePath, logo } from '@/lib/catalog';
import type * as THREE from 'three';

export default function ProductScene({kind,sectionId,lang}:{kind:'orange'|'oil';sectionId:string;lang:'it'|'en'}){
 const host=useRef<HTMLDivElement>(null); const [failed,setFailed]=useState(false);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  async function initialize(){
   const T=await import('three'); const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
   if(disposed||!host.current)return;
   const target=host.current,section=document.getElementById(sectionId)!;
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65));renderer.setClearColor(0x000000,0);
   renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=kind==='orange'?1.5:1.2;
   target.appendChild(renderer.domElement);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,50); camera.position.set(0,.1,8.9);
   const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
   scene.add(new T.HemisphereLight(kind==='orange'?0xfff4dc:0xfff6d4,0x3b3019,2));
   const key=new T.DirectionalLight(0xfff5dc,4);key.position.set(-3,5,5);scene.add(key);
   const rim=new T.DirectionalLight(0xffffff,3);rim.position.set(4,3,-2);scene.add(rim);
   const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
   function mesh(geo:THREE.BufferGeometry,mat:THREE.Material){geometries.add(geo);materials.add(mat);return new T.Mesh(geo,mat);}
   let seed=14092;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   function texture(type:'skin'|'flesh'|'bread'){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
    c.fillStyle=type==='skin'?'#ec7809':type==='flesh'?'#f89c27':'#d9a764';c.fillRect(0,0,512,512);
    if(type==='flesh'){
     for(let i=0;i<17000;i++){const x=random()*512,y=random()*512,a=Math.atan2(y-256,x-256),v=random();c.save();c.translate(x,y);c.rotate(a);c.fillStyle=`rgba(${v>.5?'255,218,112':'225,111,9'},${.15+v*.45})`;c.beginPath();c.ellipse(0,0,2+random()*6,.6+random()*1.6,0,0,Math.PI*2);c.fill();c.restore();}
     c.strokeStyle='rgba(255,243,201,.45)';c.lineWidth=2;for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(256,256);c.lineTo(256+Math.cos(a)*350,256+Math.sin(a)*350);c.stroke();}
     c.fillStyle='#fff1c5';c.beginPath();c.ellipse(256,256,8,15,0,0,Math.PI*2);c.fill();
    }else{for(let i=0;i<28000;i++){const v=random();c.fillStyle=type==='skin'?`rgba(${v>.5?'255,183,54':'150,64,0'},${.08+v*.24})`:`rgba(106,65,18,${v*.32})`;c.beginPath();c.arc(random()*512,random()*512,random()*1.6+.25,0,Math.PI*2);c.fill();}}
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;textures.add(tex);return tex;
   }
   function leaf(){const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(.1,.25,.65,.62,1.1,.2);s.bezierCurveTo(.75,-.18,.2,-.2,0,0);const g=new T.ShapeGeometry(s,20);const a=g.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,Math.sin(a.getX(i)*3)*.16);g.computeVertexNormals();const l=mesh(g,new T.MeshPhysicalMaterial({color:0x3c641d,roughness:.46,side:T.DoubleSide,clearcoat:.35}));return l;}
   const root=new T.Group();scene.add(root);let update:(p:number,t:number)=>void;
   if(kind==='orange'){
    const skinTex=texture('skin'),fleshTex=texture('flesh');
    const skin=new T.MeshPhysicalMaterial({map:skinTex,bumpMap:skinTex,bumpScale:.023,roughness:.62,clearcoat:.18,clearcoatRoughness:.5});
    const pith=new T.MeshStandardMaterial({color:0xffeecb,roughness:.85,side:T.DoubleSide});
    const flesh=new T.MeshPhysicalMaterial({map:fleshTex,roughness:.3,clearcoat:.55,side:T.DoubleSide,bumpMap:fleshTex,bumpScale:.012});
    const fruit=new T.Group();root.add(fruit);const wedges:THREE.Group[]=[];const radius=1.4,count=10;
    for(let i=0;i<count;i++){
     const a=i*Math.PI*2/count,b=(i+1)*Math.PI*2/count,w=new T.Group();w.add(mesh(new T.SphereGeometry(radius,24,48,a,b-a,0,Math.PI),skin));
     for(const edge of [a,b]){
      const face=new T.Group();face.rotation.y=Math.PI-edge;
      for(const [r,mat,z] of [[radius-.006,pith,0],[radius-.085,flesh,edge===a?.006:-.006]] as const){const s=new T.Shape();s.moveTo(0,-r);s.absarc(0,0,r,-Math.PI/2,Math.PI/2,false);s.lineTo(0,-r);const g=new T.ShapeGeometry(s,48);const uv=g.attributes.uv,pos=g.attributes.position;for(let j=0;j<uv.count;j++)uv.setXY(j,(pos.getX(j)/r+1)/2,(pos.getY(j)/r+1)/2);const m=mesh(g,mat);m.position.z=z;face.add(m);}w.add(face);
     }
     fruit.add(w);wedges.push(w);
    }
    const stem=mesh(new T.CylinderGeometry(.045,.08,.24,10),new T.MeshStandardMaterial({color:0x544b20}));stem.position.y=1.43;fruit.add(stem);
    const l1=leaf();l1.position.set(0,1.43,0);l1.rotation.set(.2,.2,.2);l1.scale.setScalar(1.12);fruit.add(l1);
    const l2=leaf();l2.position.set(0,1.43,.02);l2.rotation.set(.6,2.8,.1);l2.scale.setScalar(.72);fruit.add(l2);
    const glass=new T.Group();root.add(glass);
    const points=[new T.Vector2(.5,0),new T.Vector2(.54,.08),new T.Vector2(.66,1.7),new T.Vector2(.635,1.73),new T.Vector2(.51,.13),new T.Vector2(0,.13)];
    const glassMat=new T.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.08,transmission:1,thickness:.14,ior:1.45,transparent:true,opacity:1});
    glass.add(mesh(new T.LatheGeometry(points,64),glassMat));const ring=mesh(new T.TorusGeometry(.65,.018,10,64),new T.MeshPhysicalMaterial({color:0xffffff,roughness:.1,metalness:.25}));ring.rotation.x=Math.PI/2;ring.position.y=1.71;glass.add(ring);
    const juice=mesh(new T.CylinderGeometry(.604,.495,1.43,64),new T.MeshPhysicalMaterial({color:0xffb025,roughness:.2,clearcoat:1}));glass.add(juice);
    const drops:THREE.Mesh[]=[];const dropMat=new T.MeshPhysicalMaterial({color:0xffac16,roughness:.14,clearcoat:1,transmission:.16});
    for(let i=0;i<22;i++){const d=mesh(new T.SphereGeometry(.026+random()*.035,10,8),dropMat);d.scale.y=1.6;root.add(d);drops.push(d);}
    update=(p,t)=>{
     const open=T.MathUtils.smoothstep(p,.08,.52),pour=T.MathUtils.smoothstep(p,.54,.94);
     fruit.position.set(0,.25+Math.sin(pour*Math.PI)*.55-pour*1.4,0);fruit.rotation.set(.16+open*.18,-.4+open*.85,-.21+open*.14);
     fruit.scale.setScalar(1-pour*.93);fruit.visible=pour<.995;
     wedges.forEach((w,i)=>{const mid=(i+.5)*Math.PI*2/count,spread=open*(1-pour)*.92;w.position.set(-Math.cos(mid)*spread,-pour*(.3+(i%3)*.15),Math.sin(mid)*spread);w.rotation.set(open*.1*Math.sin(mid),open*.035*(i%2?1:-1),open*.18*Math.cos(mid));});
     stem.visible=pour<.8;l1.visible=pour<.8;l2.visible=pour<.8;
     glass.visible=p>.45;glass.position.set(.05,-4+T.MathUtils.smoothstep(p,.43,.78)*2.15,.2);glass.rotation.z=-.045;
     juice.scale.y=Math.max(.001,pour);juice.position.y=.13+.715*pour;
     drops.forEach((d,i)=>{d.visible=p>.5&&p<.98;const a=i*2.399,rad=(.35+(i%5)*.13)*(1-pour*.3);d.position.set(Math.cos(a)*rad,1.2-((p*5+i*.09)%1)*2.7,Math.sin(a)*rad);d.scale.setScalar((1-pour*.5)*(.7+(i%3)*.2));});
     root.position.y=Math.sin(t*.65)*.035*(1-pour);root.rotation.y=Math.sin(t*.2)*.025;
    };
   }else{
    const bottle=new T.Group();root.add(bottle);
    const points=[new T.Vector2(0,-1.5),new T.Vector2(.49,-1.5),new T.Vector2(.55,-1.43),new T.Vector2(.55,.55),new T.Vector2(.51,.72),new T.Vector2(.24,1.0),new T.Vector2(.19,1.15),new T.Vector2(.19,1.95)];
    bottle.add(mesh(new T.LatheGeometry(points,64),new T.MeshPhysicalMaterial({color:0x263817,metalness:.15,roughness:.17,clearcoat:1,clearcoatRoughness:.12})));
    const cap=mesh(new T.CylinderGeometry(.211,.211,.37,40),new T.MeshStandardMaterial({color:0x242721,metalness:.45,roughness:.32}));cap.position.y=1.82;bottle.add(cap);
    for(let i=0;i<5;i++){const r=mesh(new T.TorusGeometry(.21,.008,6,40),new T.MeshStandardMaterial({color:0x555641,metalness:.6,roughness:.3}));r.rotation.x=Math.PI/2;r.position.y=1.66+i*.06;bottle.add(r);}
    const paper=mesh(new T.CylinderGeometry(.555,.555,1.4,64,1,true),new T.MeshStandardMaterial({color:0xf7f1de,roughness:.9}));paper.position.y=-.3;bottle.add(paper);
    const label=new T.TextureLoader().load(imagePath(logo));label.colorSpace=T.SRGBColorSpace;textures.add(label);
    const panel=mesh(new T.PlaneGeometry(.88,.88),new T.MeshStandardMaterial({map:label,roughness:.85}));panel.position.set(0,-.2,.557);bottle.add(panel);
    const band=mesh(new T.CylinderGeometry(.558,.558,.11,64,1,true),new T.MeshStandardMaterial({color:0xb29e5c,metalness:.4,roughness:.4}));band.position.y=-.89;bottle.add(band);
    const plate=mesh(new T.CylinderGeometry(1.2,.93,.12,64),new T.MeshPhysicalMaterial({color:0xe9e5d2,roughness:.27,clearcoat:.8}));plate.position.set(-.35,-2.07,.2);plate.rotation.x=.25;root.add(plate);
    const oil=mesh(new T.CircleGeometry(.72,64),new T.MeshPhysicalMaterial({color:0xbcb427,roughness:.1,metalness:.3,clearcoat:1}));oil.rotation.x=-Math.PI/2+.25;oil.position.set(-.35,-1.96,.2);root.add(oil);
    const streamMat=new T.MeshPhysicalMaterial({color:0xc5b947,metalness:.18,roughness:.12,transparent:true,opacity:.95,clearcoat:1});
    const stream=mesh(new T.CylinderGeometry(.027,.039,1,16),streamMat);root.add(stream);
    const garnish=leaf();garnish.position.set(.55,-1.9,.4);garnish.rotation.set(-1.25,0,-.5);garnish.scale.setScalar(.7);root.add(garnish);
    const neck=new T.Vector3(),end=new T.Vector3(-.35,-1.93,.2),dir=new T.Vector3(),axis=new T.Vector3(0,1,0);
    update=(p,t)=>{
     const pour=T.MathUtils.smoothstep(p,.15,.85);bottle.rotation.set(.07,-.1,-.16+pour*2.28);bottle.position.set(.22+pour*.55,.18+pour*.72,0);bottle.scale.setScalar(.94-pour*.12);
     cap.visible=pour<.45;plate.visible=p>.18;oil.visible=p>.35;garnish.visible=p>.18;plate.scale.setScalar(.7+pour*.3);oil.scale.setScalar(Math.max(.02,pour*.95));
     bottle.updateMatrixWorld();neck.set(0,1.97,0).applyMatrix4(bottle.matrixWorld);dir.subVectors(neck,end);stream.visible=pour>.6;stream.scale.y=dir.length();stream.position.copy(neck).add(end).multiplyScalar(.5);stream.quaternion.setFromUnitVectors(axis,dir.normalize());root.rotation.y=Math.sin(t*.22)*.015;
    };
   }
   let frame=0,visible=true,progress=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
   const resize=()=>{const w=target.clientWidth,h=target.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w/h<.8?10.4:8.9;camera.updateProjectionMatrix();};
   const observer=new ResizeObserver(resize);observer.observe(target);resize();
   const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:'100px'});io.observe(section);
   const draw=(time:number)=>{if(disposed)return;frame=requestAnimationFrame(draw);if(!visible||document.hidden)return;const rect=section.getBoundingClientRect();const goal=Math.max(0,Math.min(1,-rect.top/(section.offsetHeight-window.innerHeight)));progress+=(goal-progress)*.09;update(reduced.matches?0:progress,reduced.matches?0:time*.001);renderer.render(scene,camera);};draw(0);
   cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();io.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();};
  }
  initialize().catch(()=>{if(!disposed)setFailed(true);});return()=>{disposed=true;cleanup();};
 },[kind,sectionId]);
 return <div ref={host} className={`product-scene ${kind}-scene`} role="img" aria-label={lang==='it'?(kind==='orange'?'Arancia tridimensionale che si apre in spicchi durante lo scorrimento':'Bottiglia di olio che si inclina e versa sul piatto'):(kind==='orange'?'Three-dimensional orange opening into segments as you scroll':'Olive oil bottle tilting to pour onto a plate')}>
 {failed&&<div className="scene-fallback"><img src={imagePath(kind==='oil'?'olio-extravergine-confezione-5l-147563.jpg':'condimento-olio-evo-arancio-147564.jpg')} alt={kind==='oil'?'Olio extravergine':'Condimento all’arancio con agrumi'}/></div>}
 </div>;
}
