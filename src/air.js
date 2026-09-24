import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const stage=document.querySelector('.air-stage');
const hero=document.querySelector('.air-hero');
const copy=document.querySelector('.air-copy');
const skip=document.querySelector('.air-skip');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=THREE.MathUtils.clamp;
const phase=(x,a,b)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const visitKey='mentori_air_intro_v3';
let visited=false;
try{visited=sessionStorage.getItem(visitKey)==='done';}catch{}
let settled=visited||reduced.matches||!!location.hash||scrollY>80;
let finishScene=()=>{};
const remember=()=>{try{sessionStorage.setItem(visitKey,'done');}catch{}};
const release=()=>{
  document.body.classList.remove('air-intro-playing');
  hero.classList.remove('is-playing');
  skip.hidden=true;copy.inert=false;
};
const settle=()=>{settled=true;remember();release();finishScene();};
const announceReady=()=>{hero.dataset.sceneReady='true';dispatchEvent(new Event('mentori:scene-ready'));};
const fail=error=>{
  settle();stage.classList.remove('ready');stage.classList.add('failed');
  hero.classList.add('is-static');hero.dataset.introState='fallback';announceReady();
  if(error)console.warn('3D unavailable; static interface remains visible.',error);
};
skip?.addEventListener('click',settle);
addEventListener('keydown',event=>{if(event.key==='Escape')settle();});
addEventListener('pagehide',settle);
reduced.addEventListener('change',()=>{if(reduced.matches)settle();});

async function init(){
  const canvas=stage.querySelector('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x0b0b0a,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.05,100);
  const environment=await new RGBELoader().loadAsync('/assets/hero/studio.hdr');
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromEquirectangular(environment).texture;
  environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x242424,.7));
  const light=new THREE.DirectionalLight(0xffffff,1.3);
  light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);
  Object.assign(light.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:30});
  light.shadow.bias=-.001;scene.add(light);
  const gltf=await new GLTFLoader().loadAsync('/assets/hero/macbook-air-13.glb');
  const laptop=new THREE.Group();scene.add(laptop);laptop.add(gltf.scene);
  const lid=gltf.scene.getObjectByName('lid'),screen=gltf.scene.getObjectByName('NSKTMOGjgWSbJNs');
  const texture=await new THREE.TextureLoader().loadAsync('/assets/hero/mentori-crm-contrast.jpg');
  texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  screen.material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  screen.geometry.computeBoundingBox();screen.geometry.computeVertexNormals();
  const screenLocalCenter=screen.geometry.boundingBox.getCenter(new THREE.Vector3());
  const screenSize=screen.geometry.boundingBox.getSize(new THREE.Vector3());
  const baseY=new THREE.Box3().setFromObject(gltf.scene).min.y;
  // The support shares the laptop's ground plane at every viewport size.
  const pedestal=new THREE.Mesh(new RoundedBoxGeometry(6.1,5,4.8,3,.07),new THREE.MeshStandardMaterial({color:0x101010,roughness:1,metalness:0,envMapIntensity:.04}));
  pedestal.position.set(0,baseY-2.51,0);pedestal.receiveShadow=true;pedestal.castShadow=true;scene.add(pedestal);
  gltf.scene.traverse(obj=>{
    if(!obj.isMesh)return;
    obj.castShadow=true;
    if(obj.name==='wQOVRkdOgftfomH')obj.material=new THREE.MeshBasicMaterial({color:0x101012});
    if(obj.name==='AnVlXWmPvAUVDnT')obj.material=new THREE.MeshBasicMaterial({color:0xeeeeee});
    if(['PpxnsKHjbvrELBq','LglRXaoinRxJbVe'].includes(obj.name))obj.visible=false;
    if(obj.material.map)obj.material.map.anisotropy=renderer.capabilities.getMaxAnisotropy();
    if(obj.material.emissiveMap)obj.material.emissiveMap.anisotropy=8;
  });
  const outside=new THREE.Vector3(),inside=new THREE.Vector3(),screenCenter=new THREE.Vector3(),normal=new THREE.Vector3(),look=new THREE.Vector3();
  const outsideLook=new THREE.Vector3(0,.1,0);
  let frame=0,startTime=0,progress=settled?1:0,playing=false,lost=false,width=1,height=1,copyBottom=0,inViewport=true,started=false;
  const draw=now=>{
    frame=0;if(lost||document.hidden||!inViewport)return;
    if(playing){
      progress=clamp((now-startTime)/3400,0,1);
      if(progress===1){playing=false;settled=true;remember();release();}
    }
    const dive=1-phase(progress,.04,.62),close=phase(progress,.61,.92),reveal=phase(progress,.72,1);
    const mobile=innerWidth<=1000;
    laptop.rotation.y=.48*(1-dive);lid.rotation.x=1.92*close;laptop.updateMatrixWorld(true);
    const top=mobile?copyBottom+12:110,bottom=mobile?94:106;
    const sceneHeight=Math.max(180,height-top-bottom),sceneWidth=mobile?width:width*.52;
    const distance=Math.max(8.5,8/(sceneWidth/sceneHeight))*height/sceneHeight;
    outside.set(0,.1+distance*.5,distance);
    screenCenter.copy(screenLocalCenter).applyMatrix4(screen.matrixWorld);
    normal.fromBufferAttribute(screen.geometry.attributes.normal,0).transformDirection(screen.matrixWorld);
    if(normal.dot(outside.clone().sub(screenCenter))<0)normal.negate();
    const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const fitDistance=Math.min(Math.hypot(screenSize.y,screenSize.z)/(2*tan),screenSize.x/(2*tan*camera.aspect));
    inside.copy(screenCenter).addScaledVector(normal,fitDistance*.73);
    camera.position.lerpVectors(outside,inside,dive);
    look.lerpVectors(outsideLook,screenCenter,dive);camera.lookAt(look);
    const shiftX=mobile?0:width*.255,shiftY=top+sceneHeight/2-height/2;
    camera.setViewOffset(width,height,-shiftX*(1-dive),-shiftY*(1-dive),width,height);
    hero.style.setProperty('--copy-opacity',String(reveal));hero.style.setProperty('--copy-shift',`${18*(1-reveal)}px`);
    hero.dataset.introState=playing?'playing':settled?'complete':'ready';
    renderer.render(scene,camera);
    if(playing)frame=requestAnimationFrame(draw);
  };
  const invalidate=()=>{if(!frame&&!lost)frame=requestAnimationFrame(draw);};
  finishScene=()=>{playing=false;progress=1;invalidate();};
  const begin=()=>{
    if(started)return;
    started=true;
    if(settled||hero.dataset.bootFinished==='skip'||scrollY>80){settle();return;}
    playing=true;startTime=performance.now()+500;progress=0;
    hero.classList.add('is-playing');document.body.classList.add('air-intro-playing');
    copy.inert=true;skip.hidden=false;invalidate();
  };
  const resize=()=>{
    const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;
    if(width<=0||height<=0)return;
    copyBottom=copy.offsetTop+copy.offsetHeight;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();invalidate();
  };
  new ResizeObserver(resize).observe(stage);new ResizeObserver(resize).observe(copy);
  new IntersectionObserver(([entry])=>{inViewport=entry.isIntersecting;if(!inViewport&&playing)settle();if(inViewport)invalidate();}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)settle();else invalidate();});
  canvas.addEventListener('webglcontextlost',()=>{lost=true;fail();});
  addEventListener('mentori:boot-finished',begin,{once:true});
  resize();stage.classList.add('ready');announceReady();
  if(hero.dataset.bootFinished||!document.getElementById('brandIntro'))begin();
}
if(stage){
  const watchdog=setTimeout(()=>{if(!stage.classList.contains('ready'))fail();},12000);
  init().catch(fail).finally(()=>clearTimeout(watchdog));
}
