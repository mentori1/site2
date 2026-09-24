import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const stage=document.querySelector('.air-stage');
const hero=document.querySelector('.air-hero');
const copy=document.querySelector('.air-copy');
const sticky=document.querySelector('.air-sticky');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=THREE.MathUtils.clamp;
const smooth=x=>x*x*(3-2*x);
const phase=(x,start,end)=>smooth(clamp((x-start)/(end-start),0,1));

async function init(){
  const canvas=stage.querySelector('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x0b0b0a,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.05,100);
  const environment=await new RGBELoader().loadAsync('/assets/hero/studio.hdr');
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromEquirectangular(environment).texture;
  environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x333333,.35));
  const light=new THREE.DirectionalLight(0xffffff,1.3);
  light.position.set(-3,7,5);light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);
  Object.assign(light.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:25});
  light.shadow.bias=-.001;scene.add(light);
  const gltf=await new GLTFLoader().loadAsync('/assets/hero/macbook-air-13.glb');
  const laptop=new THREE.Group();scene.add(laptop);laptop.add(gltf.scene);
  const lid=gltf.scene.getObjectByName('lid');
  const screen=gltf.scene.getObjectByName('NSKTMOGjgWSbJNs');
  const texture=await new THREE.TextureLoader().loadAsync('/assets/hero/mentori-crm-contrast.jpg');
  texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  screen.material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  screen.geometry.computeBoundingBox();screen.geometry.computeVertexNormals();
  const screenLocalCenter=screen.geometry.boundingBox.getCenter(new THREE.Vector3());
  const screenSize=screen.geometry.boundingBox.getSize(new THREE.Vector3());
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.32}));
  floor.rotation.x=-Math.PI/2;
  floor.position.y=new THREE.Box3().setFromObject(gltf.scene).min.y-.02;
  floor.receiveShadow=true;scene.add(floor);
  gltf.scene.traverse(obj=>{
    if(!obj.isMesh)return;
    obj.castShadow=true;
    if(obj.name==='wQOVRkdOgftfomH')obj.material=new THREE.MeshBasicMaterial({color:0x101012});
    if(obj.name==='AnVlXWmPvAUVDnT')obj.material=new THREE.MeshBasicMaterial({color:0xeeeeee});
    if(['PpxnsKHjbvrELBq','LglRXaoinRxJbVe'].includes(obj.name))obj.visible=false;
    if(obj.material.map)obj.material.map.anisotropy=renderer.capabilities.getMaxAnisotropy();
    if(obj.material.emissiveMap)obj.material.emissiveMap.anisotropy=8;
  });
  const startPosition=new THREE.Vector3(),endPosition=new THREE.Vector3();
  const screenCenter=new THREE.Vector3(),normal=new THREE.Vector3(),look=new THREE.Vector3();
  const startLook=new THREE.Vector3(0,.9,0);
  let target=0,current=0,frame=0,inViewport=true,lost=false,width=1,height=1;
  const visible=()=>inViewport&&!document.hidden&&!lost;

  const draw=()=>{
    frame=0;if(!visible())return;
    current+=(target-current)*.16;
    if(Math.abs(target-current)<.001)current=target;
    const open=reduced.matches?1:phase(current,0,.4);
    const dive=reduced.matches?0:phase(current,.43,.88);
    const fade=reduced.matches?0:phase(current,.4,.56);
    const portal=reduced.matches?0:phase(current,.77,.9);
    const mobile=innerWidth<=1000;
    laptop.scale.setScalar(mobile?1:.9);
    laptop.position.y=0;
    laptop.rotation.y=((mobile?.48:2.55)*(1-open)-.16*open)*(1-dive);
    lid.rotation.x=1.92*(1-open);
    laptop.updateMatrixWorld(true);

    const copyBottom=copy.offsetTop+copy.offsetHeight;
    const top=mobile?copyBottom+10:100;
    const bottom=mobile?86:90;
    const sceneHeight=Math.max(170,height-top-bottom);
    const sceneWidth=mobile?width:width*.56;
    const distance=Math.max(9.3,7.1/(sceneWidth/sceneHeight))*height/sceneHeight;
    startPosition.set(0,.9+distance*.37,distance);

    // Approach the screen plane, then hand off to a crisp, responsive dashboard image.
    screenCenter.copy(screenLocalCenter).applyMatrix4(screen.matrixWorld);
    normal.fromBufferAttribute(screen.geometry.attributes.normal,0).transformDirection(screen.matrixWorld);
    if(normal.dot(startPosition.clone().sub(screenCenter))<0)normal.negate();
    const screenHeight=Math.hypot(screenSize.y,screenSize.z)*laptop.scale.x;
    const screenWidth=screenSize.x*laptop.scale.x;
    const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const fitDistance=Math.max(screenHeight/(2*tan),screenWidth/(2*tan*camera.aspect));
    endPosition.copy(screenCenter).addScaledVector(normal,fitDistance*.73);
    camera.position.lerpVectors(startPosition,endPosition,dive);
    look.lerpVectors(startLook,screenCenter,dive);camera.lookAt(look);
    const shiftX=mobile?0:width*.24;
    const shiftY=(top+sceneHeight/2)-height/2;
    camera.setViewOffset(width,height,-shiftX*(1-dive),-shiftY*(1-dive),width,height);
    hero.style.setProperty('--copy-opacity',String(1-fade));
    hero.style.setProperty('--copy-shift',`${-24*fade}px`);
    hero.style.setProperty('--portal-opacity',String(portal));
    hero.style.setProperty('--scene-opacity',String(1-portal));
    copy.inert=fade>.95;
    renderer.render(scene,camera);
    if(current!==target)frame=requestAnimationFrame(draw);
  };
  const invalidate=()=>{if(!frame&&visible())frame=requestAnimationFrame(draw);};
  const scroll=()=>{
    const range=hero.offsetHeight-sticky.offsetHeight;
    target=reduced.matches?0:clamp(-hero.getBoundingClientRect().top/Math.max(range,1),0,1);
    invalidate();
  };
  const resize=()=>{
    const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;
    if(width<=0||height<=0)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    camera.updateProjectionMatrix();scroll();
  };
  new ResizeObserver(resize).observe(stage);
  new ResizeObserver(resize).observe(copy);
  new IntersectionObserver(([entry])=>{inViewport=entry.isIntersecting;if(inViewport){scroll();invalidate();}}).observe(stage);
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',scroll,{passive:true});
  document.addEventListener('visibilitychange',invalidate);
  reduced.addEventListener('change',scroll);
  canvas.addEventListener('webglcontextlost',()=>{lost=true;stage.classList.remove('ready');stage.classList.add('failed');hero.classList.add('is-static');copy.inert=false;});
  resize();stage.classList.add('ready');
}
if(stage)init().catch(error=>{
  stage.classList.remove('ready');stage.classList.add('failed');hero.classList.add('is-static');
  console.warn('3D unavailable; static interface remains visible.',error);
});
