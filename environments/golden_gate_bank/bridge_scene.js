/* Deterministic procedural set. No external textures or generated artwork. */
(function(global){
'use strict';
const T=global.THREE;
const V=(x,y,z)=>new T.Vector3(x,y,z);
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
function build(){
 const scene=new T.Scene(); scene.fog=new T.FogExp2(0xb2bec0,.00019);
 const set=new T.Group(),bridge=new T.Group(),future=new T.Group();scene.add(set);set.add(bridge,future);
 const mat=(c,rough=.8,metal=.1)=>new T.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});
 const orange=mat(0xb84428),edge=mat(0xe16b3e),recess=mat(0x6e302b),steel=mat(0x26363c),road=mat(0x30383d),concrete=mat(0x849090),white=mat(0xd5cabb);
 const cyan=new T.MeshBasicMaterial({color:0x7be5ef}); const amber=new T.MeshBasicMaterial({color:0xffc685});
 const boxGeo=new T.BoxGeometry(1,1,1),cylGeo=new T.CylinderGeometry(1,1,1,5);
 function box(parent,w,h,d,x,y,z,m){const o=new T.Mesh(boxGeo,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function bar(parent,a,b,r,m){const o=new T.Mesh(cylGeo,m),v=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.set(r,v.length(),r);o.quaternion.setFromUnitVectors(V(0,1,0),v.normalize());parent.add(o);return o;}
 function cableHeight(x){const a=Math.abs(x);return a<=640?88+132*(a/640)**2:220-139*((a-640)/343)**.72;}
 function deckHeight(x){return 75-5*(Math.min(Math.abs(x),983)/983)**2;}
 // Tapered Art Deco towers with recessed vertical ribs, stepped collars and portal beams.
 for(const x of [-640,640]){
  box(bridge,40,10,65,x,3,0,concrete);
  box(bridge,31,5,54,x,10.5,0,concrete);
  for(const z of [-21,21]){
   const levels=[13,74,109,145,180,214,227];
   for(let i=0;i<levels.length-1;i++){
    let low=levels[i],high=levels[i+1],w=12-i*.72,d=14-i*.7;
    box(bridge,w,high-low,d,x,(low+high)/2,z,orange);
    for(const side of [-1,1]){
     box(bridge,.8,high-low-1,d+1.1,x+side*(w/2-.6),(low+high)/2,z,edge);
     box(bridge,w-2.5,high-low-4,.28,x,(low+high)/2,z+side*(d/2+.16),recess);
     box(bridge,.7,high-low-4,.5,x,(low+high)/2,z+side*(d/2+.4),edge);
    }
    box(bridge,w+1.4,1.1,d+1,x,high-.6,z,edge);
   }
   box(bridge,8,2,10,x,228,z,edge);
   box(future,1.3,31,.7,x+6.1,37,z+7.4,cyan);
   box(future,1.3,31,.7,x-6.1,37,z+7.4,cyan);
  }
  for(const y of [101,139,177,216]){
   box(bridge,10,5.5,36,x,y,0,orange);
   box(bridge,11,.7,38,x,y+2.8,0,edge);
   box(bridge,11,.7,38,x,y-2.8,0,recess);
   // Under-beam haunches preserve the stepped tower portal silhouette.
   for(const z of [-1,1])box(bridge,10,3.5,5,x,y-4,z*15,orange);
  }
  for(const z of [-21,21])box(future,2,.6,3,x,230,z,amber);
 }
 // Continuous roadway, underslung Warren truss, rails and paired suspender ropes.
 for(let x=-1184;x<1184;x+=16){
  const y=deckHeight(x);
  box(bridge,16.1,2,27,x+8,y,0,road);
  box(bridge,16.1,1.2,3,x+8,y+1,15,concrete);box(bridge,16.1,1.2,3,x+8,y+1,-15,concrete);
  for(const z of [-17,17]){
   bar(bridge,V(x,y-1,z),V(x+16,deckHeight(x+16)-1,z),.45,orange);
   bar(bridge,V(x,y-7,z),V(x+16,deckHeight(x+16)-7,z),.45,recess);
   bar(bridge,V(x,y-7,z),V(x+8,y-1,z),.32,orange);
   bar(bridge,V(x+8,y-1,z),V(x+16,y-7,z),.32,orange);
   bar(bridge,V(x,y+2,z),V(x+16,y+2,z),.16,edge);
   bar(bridge,V(x,y+1,z),V(x,y+3,z),.12,edge);
   if(Math.abs(x)<980){
    const h=cableHeight(x);
    bar(bridge,V(x,y+1,z),V(x,h,z),.115,orange);
    const nx=Math.min(x+16,983);bar(bridge,V(x,h,z),V(nx,cableHeight(nx),z),.65,edge);
   }
  }
  // Lane markings are instanced later to avoid many tiny road meshes.
  if(x%32===0)for(const z of [-6,0,6])box(bridge,6,.035,.15,x+8,y+1.02,z,white);
 }
 for(const sign of [-1,1]){
  const x=sign*986;
  box(bridge,36,28,54,x,58,concrete);box(bridge,24,8,43,x,76,orange);
  for(let a=1050;a<1190;a+=65)for(const z of [-12,12])box(bridge,8,70,8,sign*a,35,z,concrete);
 }
 for(let x=-944;x<=944;x+=64)for(const z of [-16,16]){
  const y=deckHeight(x);
  bar(bridge,V(x,y,z),V(x,y+7,z),.18,steel);
  bar(bridge,V(x,y+7,z),V(x,y+7,z-Math.sign(z)*3),.15,steel);
  box(bridge,1.8,.3,.9,x,y+6.9,z-Math.sign(z)*3,amber);
  box(future,6,.15,.3,x,y-2.5,z+Math.sign(z)*.5,cyan);
 }
 // The fictional additions are deliberately a separately switchable layer.
 for(const x of [-640,640])for(const z of [-46,46]){
  const p=new T.Group();p.position.set(x,10,z);future.add(p);
  box(p,9,2,16,0,0,0,steel);box(p,3,8,3,0,5,0,steel);
  const ring=new T.Mesh(new T.TorusGeometry(5.5,.12,4,48),cyan);ring.rotation.x=-Math.PI/2;ring.position.y=10;p.add(ring);
 }
 // Batch repeated structural pieces for modest laptops; preserve bridge/SF layer boundaries.
 function instanceStatic(parent){
  const batches=new Map();
  for(const o of [...parent.children])if(o.isMesh&&(o.geometry===boxGeo||o.geometry===cylGeo)){
   const key=o.geometry.uuid+':'+o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);
  }
  for(const objects of batches.values()){
   const mesh=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);
   objects.forEach((o,i)=>{o.updateMatrix();mesh.setMatrixAt(i,o.matrix);parent.remove(o);});parent.add(mesh);
  }
 }
 instanceStatic(bridge);instanceStatic(future);
 // Deterministic coastal terrain; artistic staging rather than a GIS reconstruction.
 function land(cx,cz,rx,rz,height,color,seed){
  const n=44,g=new T.PlaneGeometry(rx*2,rz*2,n,n);g.rotateX(-Math.PI/2);
  const pos=g.attributes.position,colors=[];const c=new T.Color(color);
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i),r=(x/rx)**2+(z/rz)**2;
   const noise=Math.sin(x*.009+seed)*Math.cos(z*.007+seed)*.24+Math.sin(x*.025+z*.019)*.065;
   const h=Math.max(-12,(1-r+noise)*height);pos.setY(i,h);
   const shade=.8+.2*Math.sin(x*.013+z*.015);colors.push(c.r*shade,c.g*shade,c.b*shade);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));m.position.set(cx,-6,cz);set.add(m);
 }
 land(-1660,-220,760,1500,175,0x526960,3);
 land(-2140,-1700,1400,1200,305,0x637a71,5);
 land(1800,-450,820,1750,84,0x71807b,2);
 land(2800,-2600,1600,1000,155,0x849293,8);
 // Presidio and distant city: compact, hazed, outside the flight corridor.
 let seed=713;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 const buildings=new T.InstancedMesh(boxGeo,mat(0x98a7a7),200);let matrix=new T.Matrix4();
 for(let i=0;i<200;i++){
  const x=1450+rand()*1250,z=-900-rand()*2200,h=12+Math.pow(rand(),2)*75;
  matrix.compose(V(x,h/2+18,z),new T.Quaternion(),V(12+rand()*28,h,12+rand()*24));buildings.setMatrixAt(i,matrix);
 }set.add(buildings);
 const pyramid=new T.Mesh(new T.ConeGeometry(19,125,4),mat(0xc2c8bf));pyramid.position.set(2110,80,-1720);pyramid.rotation.y=Math.PI/4;set.add(pyramid);
 // A handful of moving road vehicles provide scale. Their positions are sampled from absolute time.
 const cars=[];
 for(let i=0;i<36;i++){const g=new T.Group(),color=[0xb3bec4,0xddd9c7,0xa97355,0x486c7a][i%4];box(g,4.6,1.4,1.9,0,.9,0,mat(color));box(g,2.4,.7,1.6,-.2,1.8,0,steel);bridge.add(g);cars.push({g,i});}
 const sunDirection=V(-.45,.19,-.87).normalize();
 const ambient=new T.HemisphereLight(0xb2d4e5,0x435b60,1.3);scene.add(ambient);const flood=new T.DirectionalLight(0xffa475,0);flood.position.set(0,350,1200);scene.add(flood);
 const sun=new T.DirectionalLight(0xffce95,2.3);sun.position.copy(sunDirection).multiplyScalar(2000);scene.add(sun);
 // Analytic atmosphere keeps sky and ocean color coordinated without downloaded imagery.
 const sky=new T.Mesh(new T.SphereGeometry(18000,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{sun:{value:sunDirection},top:{value:new T.Color()},horizon:{value:new T.Color()},glow:{value:new T.Color()},disk:{value:new T.Color()},stars:{value:0}},vertexShader:`varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec3 vDir;uniform vec3 sun,top,horizon,glow,disk;uniform float stars;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec3 d=normalize(vDir);float h=max(d.y,0.);vec3 c=mix(horizon,top,pow(h,.42));float s=max(dot(d,sun),0.);c+=glow*pow(s,20.)+disk*smoothstep(.9996,.99985,s);float cloud=sin(d.x*24.+d.z*10.)*.5+.5; c=mix(c,horizon,cloud*.20*exp(-pow((d.y-.14)*16.,2.)));vec2 starUV=vec2(atan(d.z,d.x),asin(d.y))*95.;vec2 cell=floor(starUV);vec2 local=fract(starUV)-.5;float pin=(1.-smoothstep(.025,.065,length(local)))*step(.978,hash(cell))*smoothstep(.07,.3,d.y);c+=vec3(.75,.86,1.)*pin*stars;gl_FragColor=vec4(c,1.);}` }));scene.add(sky);
 const waterMat=new T.ShaderMaterial({uniforms:{time:{value:0},sun:{value:sunDirection},eye:{value:V(0,0,0)},deep:{value:new T.Color()},reflection:{value:new T.Color()},glint:{value:new T.Color()},waterFog:{value:new T.Color()}},vertexShader:`varying vec3 world;uniform float time;void main(){vec3 p=position; p.y+=sin(p.x*.024+p.z*.014+time*.7)*.7+sin(p.z*.05-p.x*.013-time*.9)*.35;world=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`precision highp float; varying vec3 world;uniform float time;uniform vec3 sun,eye,deep,reflection,glint,waterFog;void main(){vec2 p=world.xz;float a=p.x*.024+p.y*.014+time*.7,b=p.y*.05-p.x*.013-time*.9;vec3 n=normalize(vec3(-cos(a)*.7*.024+cos(b)*.35*.013,1.,-cos(a)*.7*.014-cos(b)*.35*.05));n.x+=sin(p.y*.071+p.x*.029+sin(p.y*.014)+time*.8)*.018+sin(p.x*.119-p.y*.087+time*1.1)*.008;n.z+=sin(p.x*.063-p.y*.038+cos(p.x*.017)+time*.7)*.022+sin(p.x*.091+p.y*.106-time*.9)*.009;n=normalize(n);vec3 v=normalize(eye-world);float fres=pow(1.-max(dot(v,n),0.),3.);vec3 c=mix(deep,reflection,fres);float spec=pow(max(dot(reflect(-sun,n),v),0.),105.);c+=glint*spec*.75;float lines=pow(max(sin(p.y*.12+sin(p.x*.052)+time),0.),17.);c+=reflection*lines*.14;float dist=length(eye-world);c=mix(c,waterFog,1.-exp(-dist*.00013));gl_FragColor=vec4(c,1.);}`});
 const waterGeo=new T.PlaneGeometry(22000,22000,140,140);waterGeo.rotateX(-Math.PI/2);const water=new T.Mesh(waterGeo,waterMat);scene.add(water);
 const mist=new T.Mesh(new T.PlaneGeometry(7500,5000),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0},color:{value:new T.Color()}},vertexShader:`varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec2 uvp;uniform float time;uniform vec3 color;void main(){vec2 p=(uvp-.5)*2.;float rim=pow(max(0.,1.-dot(p,p)),2.);float shore=smoothstep(.07,.5,abs(p.x));float drift=.65+.35*sin(p.x*19.+p.y*9.+time*.08);gl_FragColor=vec4(color,rim*shore*drift*.22);}` }));mist.rotation.x=-Math.PI/2;mist.position.set(0,25,-600);scene.add(mist);
 let lighting='sunset';
 function setLighting(name){
  const p=global.BridgeLighting[name];if(!p)throw Error('Unknown lighting '+name);lighting=name;
  sunDirection.fromArray(p.sun).normalize();sun.position.copy(sunDirection).multiplyScalar(2000);sun.color.setHex(p.sunColor);sun.intensity=p.sunPower;ambient.intensity=p.ambient;flood.intensity=p.fill;
  scene.fog.color.setHex(p.fog);scene.fog.density=p.fogDensity;orange.emissive.setHex(p.towerGlow);
  for(const k of ['top','horizon','glow','disk'])sky.material.uniforms[k].value.setRGB(...p[k]);sky.material.uniforms.stars.value=p.stars;
  for(const [u,k] of [['deep','sea'],['reflection','reflection'],['glint','glint'],['waterFog','waterFog']])waterMat.uniforms[u].value.setRGB(...p[k]);
  mist.material.uniforms.color.value.setRGB(...p.mist);
 }
 setLighting('sunset');
 const cameras={
  opening:{from:[1250,330,1660],to:[1080,300,1500],look:[0,92,0],duration:6},
  tower:{from:[710,165,210],to:[680,195,170],look:[640,149,0],duration:5},
  passage:{from:[0,22,-420],to:[0,35,380],look:[0,52,650],duration:6},
  ocean:{from:[0,42,160],to:[0,70,1380],look:[-80,85,3000],duration:6},
  ending:{from:[-1000,260,1560],to:[-1120,300,1750],look:[-90,90,0],duration:6}
 };
 const camera=new T.PerspectiveCamera(43,16/9,1,30000);
 function sample(shot,time){
  if(!cameras[shot])throw Error('Unknown shot '+shot);
  const c=cameras[shot],u=smooth(time/c.duration);camera.position.fromArray(c.from).lerp(V(...c.to),u);camera.lookAt(V(...c.look));camera.updateMatrixWorld();waterMat.uniforms.eye.value.copy(camera.position);waterMat.uniforms.time.value=time;mist.material.uniforms.time.value=time;
  cars.forEach(({g,i})=>{const direction=i%2?1:-1,x=((i*71+time*16*direction+1400)%2800+2800)%2800-1400;g.position.set(x,deckHeight(x)+1.1,(i%3*3+2)*direction);g.rotation.y=direction<0?Math.PI:0;g.visible=Math.abs(x)<1180;});
  return {shot,time,lighting,camera:camera.position.toArray(),target:c.look.slice(),duration:c.duration};
 }
 let scifi=true;
 function setLayer(layer){if(!['beauty','bridge','environment'].includes(layer))throw Error('Unknown layer '+layer);bridge.visible=layer!=='environment';future.visible=scifi&&layer!=='environment';for(const o of set.children)if(o!==bridge&&o!==future)o.visible=layer!=='bridge';for(const o of [sky,water,mist])o.visible=layer!=='bridge';}
 return {scene,set,bridge,future,water,camera,cameras,sample,setLayer,setLighting,dimensions:{mainSpan:1280,towerHeight:227,deckCenterHeight:75,deckWidth:27},setScifi:enabled=>{scifi=enabled;future.visible=enabled;}};
}
global.GoldenGateBank={build};
})(window);
