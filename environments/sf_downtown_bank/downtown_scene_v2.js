/* Reversible procedural city. No image textures, businesses, logos or character models. */
(function(global){'use strict';const T=global.THREE,V=(x,y,z)=>new T.Vector3(x,y,z),clamp=x=>T.MathUtils.clamp(x,0,1),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function build(){
 global.BridgeLighting.battle_haze=Object.assign({},global.BridgeLighting.sunset,{label:'Battle haze',sunPower:1.05,ambient:.72,fill:.3,fog:0x8b8180,fogDensity:.00048,top:[.18,.22,.28],horizon:[.46,.40,.36],waterFog:[.39,.41,.44],mist:[.42,.43,.46]});
 const bank=GoldenGateBank.build(),scene=bank.scene;
 // Keep the distant bridge/headlands, remove the previous generic city and local SF shore.
 for(const o of bank.set.children)if(o.isInstancedMesh||(o.isMesh&&o.position.x>1000))o.visible=false;
 const background=scene.children.filter(o=>!o.isLight),root=new T.Group();root.name='Downtown';root.position.set(1580,0,-1500);root.rotation.y=Math.PI*.75;scene.add(root);
 const city=new T.Group(),debris=new T.Group(),terrain=new T.Group(),markers=new T.Group();root.add(city,debris,terrain,markers);
 const unit=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,8),batches=new Map(),pieces=[],dynamicGroups=[];
 const flat=c=>new T.MeshBasicMaterial({color:c}),mat=c=>new T.MeshStandardMaterial({color:c,roughness:.92,metalness:.03});
 const M={curb:mat(0xc2bdb0),pavement:mat(0x9b9f98),trim:mat(0xe5dfce),wood:mat(0x7d6556),metal:mat(0x536b70),dark:mat(0x23373c),interior:mat(0x273c43),glass:flat(0x8bb8c4),glassEdge:flat(0x465d67),lamp:flat(0xffe0a1),crack:flat(0x243b43),crater:mat(0x394c52),rails:mat(0x8b9a9b),foam:flat(0x9ad4d8)};
 M.crater.side=T.DoubleSide;
 const houseColors=[0x88aaa3,0xbea89b,0xb8b78d,0x94a9bc,0xc59f99,0x8ea5b0];
 const houses=houseColors.map(mat),offices=[0x658490,0x8f9999,0x82939b].map(mat),roofs=[0x586b73,0x697d7a,0x7b7775].map(mat);roofs.forEach(m=>m.side=T.DoubleSide);
 let seed=8261;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 function ground(z){return 60+.17*z-.17*20*Math.tanh((z-80)/20);}
 function height(x,z){return ground(z)-Math.max(0,Math.abs(x)-270)*.12;}
 const zero=new T.Matrix4().makeScale(0,0,0),tempMatrix=new T.Matrix4(),tempP=V(0,0,0),tempQ=new T.Quaternion();
 function batch(parent,geometry,material){const key=parent.uuid+geometry.uuid+material.uuid;if(!batches.has(key))batches.set(key,{parent,geometry,material,items:[]});return batches.get(key);}
 function box(parent,w,h,d,x,y,z,m,rotation=null){const o={position:V(x,y,z),quaternion:new T.Quaternion(),scale:V(w,h,d)};if(rotation)o.quaternion.setFromEuler(new T.Euler(...rotation));batch(parent,unit,m).items.push(o);return o;}
 function bar(parent,a,b,r,m){const d=b.clone().sub(a);const o={position:a.clone().add(b).multiplyScalar(.5),quaternion:new T.Quaternion().setFromUnitVectors(V(0,1,0),d.clone().normalize()),scale:V(r,d.length(),r)};batch(parent,cylinder,m).items.push(o);return o;}
 function breakable(w,h,d,x,y,z,m,threshold=.5,kind='facade',rotation=null,owner=city,fallParent=debris){
  const home={position:V(x,y,z),quaternion:new T.Quaternion(),scale:V(w,h,d)};if(rotation)home.quaternion.setFromEuler(new T.Euler(...rotation));
  const rng=kind==='roof'||kind==='roof_trim'?ruinRand:rand;const sign=x<0?-1:1,crossFace=w>1&&d<.6,tx=kind==='roof'?x+(rng()-.5)*15:crossFace?x+(rng()-.5)*22:sign*(3+rng()*12),tz=crossFace?z+9+rng()*18:z+(rng()-.5)*26;
  const q=new T.Quaternion().setFromEuler(new T.Euler(kind==='roof'||kind==='roof_trim'?(rng()-.5)*.15:Math.PI*.5+(rng()-.5)*.4,rng()*Math.PI*2,(rng()-.5)*.14));
  const r=new T.Matrix4().makeRotationFromQuaternion(q).elements,extent=(Math.abs(r[1])*w+Math.abs(r[5])*h+Math.abs(r[9])*d)*.5;
  const end={position:V(tx,ground(tz)+extent+.06+(pieces.length%4)*.12,tz),quaternion:q,scale:home.scale.clone()};
  if(owner!==city){end.position.x=x+(rng()-.5)*8;end.position.z=z+(rng()-.5)*3;end.position.y=ground(80)+extent+.08;}
  const matrix=new T.Matrix4().compose(home.position,home.quaternion,home.scale);
  const original=Object.freeze({id:pieces.length,kind,position:Object.freeze(home.position.toArray()),quaternion:Object.freeze(home.quaternion.toArray()),scale:Object.freeze(home.scale.toArray()),matrix:Object.freeze(matrix.toArray())});
  const piece={home,end,threshold,kind,original,cityBatch:batch(owner,unit,m),debrisBatch:batch(fallParent,unit,m)};piece.cityBatch.items.push(piece);piece.debrisBatch.items.push(piece);pieces.push(piece);return piece;
 }
 // Separate structural seed preserves the original street architecture and facade sequence.
 let ruinSeed=18473;function ruinRand(){ruinSeed=(ruinSeed*1664525+1013904223)>>>0;return ruinSeed/4294967296;}
 const structures=[],ruinMeshes=[],floorMeshes=[];
 function intactShell(w,h,d,x,y,z,m,parent=city){const o=box(parent,w,h,d,x,y,z,m);o.structural=true;o.baseScale=o.scale.clone();o.basePosition=o.position.clone();structures.push(o);return o;}
 function ruinWall(x,y,z,length,h,axis,m,parent=city){
  const vertices=[],indices=[],steps=9;
  for(let i=0;i<=steps;i++){const t=i/steps,a=length*(t-.5),top=h*(.22+ruinRand()*.51),px=x+(axis==='x'?a:0),pz=z+(axis==='z'?a:0);vertices.push(px,y,pz,px,y+top,pz);if(i<steps){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const material=m.clone();material.side=T.DoubleSide;const mesh=new T.Mesh(geo,material);mesh.userData.baseY=y;parent.add(mesh);ruinMeshes.push(mesh);
 }
 function floorSlab(x,y,z,w,d,side=0,parent=city){
  // Chipped leading edge reveals a different floor depth at each story.
  const shape=new T.Shape(),cuts=7,back=x+(side||1)*w*.5;shape.moveTo(back,z-d*.5);shape.lineTo(back,z+d*.5);
  for(let k=cuts;k>=0;k--){const zz=z-d*.5+d*k/cuts,xx=x-(side||1)*w*(.22+ruinRand()*.28);shape.lineTo(xx,zz);}shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:false});geo.rotateX(Math.PI/2); // Shape Y becomes local Z; extrusion becomes slab thickness.
  // The shape used city-space X/Z; the rotation preserves X and maps Y into Z.
  const mesh=new T.Mesh(geo,M.curb);mesh.position.y=y;parent.add(mesh);floorMeshes.push(mesh);
 }
 const cracks=[];
 function crack(a,b,width=.045,parent=city){const obj=bar(parent,a,b,width,M.crack);obj.baseScale=obj.scale.clone();cracks.push(obj);}
 // Continuous steep street and shoreline. All road geometry uses the same height function.
 const g=new T.PlaneGeometry(1600,1500,64,70);g.rotateX(-Math.PI/2);const pos=g.attributes.position,colors=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,Math.max(-14,height(x,z)-.35));const c=new T.Color(0x6e8178).multiplyScalar(.92+.08*Math.sin(x*.02+z*.04));colors.push(c.r,c.g,c.b);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const terrainMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});terrainMaterial.onBeforeCompile=shader=>{shader.uniforms.damage=roadU.damage;shader.vertexShader='varying vec3 cityPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncityPosition=position;');shader.fragmentShader='varying vec3 cityPosition;uniform float damage;\n'+shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat a=clamp((damage-.43)/.57,0.,1.);a=a*a*(3.-2.*a);if(distance(cityPosition.xz,vec2(-4.,158.))<7.*a||distance(cityPosition.xz,vec2(5.,-62.))<6.*a||distance(cityPosition.xz,vec2(-49.,80.))<8.*a)discard;');};terrain.add(new T.Mesh(g,terrainMaterial));
 const craterDefs=[{x:-4,z:158,r:7},{x:5,z:-62,r:6},{x:-49,z:80,r:8}];
 const roadU={damage:{value:0},roadColor:{value:new T.Color(.13,.19,.21)},fogColor:{value:new T.Color(.65,.74,.77)},eye:{value:V(0,0,0)}};
 const roadMat=new T.ShaderMaterial({side:T.DoubleSide,uniforms:roadU,vertexShader:`varying vec3 p,w;void main(){p=position;vec4 wp=modelMatrix*vec4(position,1.);w=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,fragmentShader:`precision highp float;varying vec3 p,w;uniform float damage;uniform vec3 roadColor,fogColor,eye;void main(){float a=clamp((damage-.43)/.57,0.,1.);a=a*a*(3.-2.*a);if(distance(p.xz,vec2(-4.,158.))<7.*a||distance(p.xz,vec2(5.,-62.))<6.*a||distance(p.xz,vec2(-49.,80.))<8.*a)discard;vec3 c=roadColor*(.96+.04*sin(p.z*3.+p.x*8.));c=mix(c,fogColor,1.-exp(-length(w-eye)*.00016));gl_FragColor=vec4(c,1.);}`});
 function roadStrip(x0,x1,z0,z1,segments){const a=[],indices=[];for(let j=0;j<=segments;j++){const z=z0+(z1-z0)*j/segments;for(const x of [x0,x1])a.push(x,ground(z)+.04,z);}for(let j=0;j<segments;j++){const i=j*2;indices.push(i,i+2,i+1,i+1,i+2,i+3);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(a,3));geo.setIndex(indices);geo.computeVertexNormals();city.add(new T.Mesh(geo,roadMat));}
 roadStrip(-10,10,-305,390,140);roadStrip(-250,250,68,92,12);
 for(let z=-300;z<390;z+=5){const y=(ground(z)+ground(z+5))/2,slope=-Math.atan((ground(z+5)-ground(z))/5);for(const side of [-1,1]){if(Math.abs(z-80)>15){box(city,3,.23,5.05,side*11.5,y+.12,z+2.5,M.pavement,[slope,0,0]);box(city,.22,.36,5.05,side*10,y+.18,z+2.5,M.curb,[slope,0,0]);}const close=craterDefs.some(c=>Math.hypot(c.x-side*1.2,c.z-z)<c.r+3);if(close)breakable(.09,.08,5.1,side*1.2,y+.11,z+2.5,M.rails,.5,'rail',[slope,0,0]);else box(city,.09,.08,5.1,side*1.2,y+.11,z+2.5,M.rails,[slope,0,0]);}if(Math.abs(z-80)>17&&z%20===0)box(city,.15,.02,4,0,y+.09,z,M.trim,[slope,0,0]);}
 for(let x=-240;x<=240;x+=5){if(Math.abs(x)<15)continue;for(const z of [66,94])box(city,5.1,.3,2,x,ground(z)+.1,z,M.pavement);}
 for(const z of [63,98])for(let x=-8;x<=8;x+=2)box(city,1.1,.025,3,x,ground(z)+.08,z,M.trim);
 // Generic Victorian row houses, deliberately varied and not a replicated famous row.
 function gable(front,side,z,y,width,depth,material){
  const half=width/2,slope=Math.atan2(4,half),run=Math.hypot(half,4),segments=5;
  for(let k=0;k<segments;k++)for(const wing of [-1,1])for(let j=0;j<3;j++){
   breakable(depth/segments+.04,.24,run/3+.03,front+side*depth*(k+.5)/segments,y+4-4*(j+.5)/3,z+wing*half*(j+.5)/3,material,.64+ruinRand()*.22,'roof',[wing*slope,0,0]);
  }
 }
 let houseCount=0;
 for(const side of [-1,1])for(let row=0;row<21;row++){
  const z=-263+row*30;if(Math.abs(z-80)<35)continue;const y=ground(z),front=side*15,depth=14+rand()*4,width=21+rand()*3,h=12+rand()*4,body=houses[(row+(side>0?2:0))%houses.length];houseCount++;
  box(city,depth,2,width,front+side*depth/2,y+.5,z,M.curb);intactShell(.55,h,width,front+side*depth,y+h/2+1,z,body);for(const edge of [-1,1]){intactShell(depth,h,.45,front+side*depth/2,y+h/2+1,z+edge*width/2,body);ruinWall(front+side*depth/2,y+1,z+edge*width/2,depth,h,'x',body);}
  ruinWall(front+side*depth,y+1,z,width,h,'z',body);
  for(let l=1;l<=2;l++)floorSlab(front+side*depth*.5,y+1+h*l/3,z,depth,width-.6,side);
  intactShell(.25,h-1,width-.5,front+side*1.2,y+h/2+1,z,M.interior);
  const cols=3,levels=3,cw=width/cols,ch=h/levels;
  for(let l=0;l<levels;l++)for(let col=0;col<cols;col++){
   const cy=y+1+ch*(l+.5),cz=z-width/2+cw*(col+.5),threshold=.50+rand()*.24;
   if(col!==1||l>0){
    const ww=cw*.55,wh=ch*.63,fx=front-side*.12;
    for(const e of [-1,1])breakable(.45,ch,(cw-ww)*.5,front,cy,cz+e*(ww+(cw-ww)*.5)/2,body,threshold,'facade');
    for(const e of [-1,1])breakable(.46,(ch-wh)*.5,ww,front,cy+e*(wh+(ch-wh)*.5)/2,cz,body,threshold,'facade');
    for(const e of [-1,1]){breakable(.65,.16,ww+.35,fx,cy+e*(wh/2+.12),cz,M.trim,threshold,'trim');breakable(.65,wh,.15,fx,cy,cz+e*(ww/2+.12),M.trim,threshold,'trim');}
    for(const a of [-1,1])for(const b of [-1,1])breakable(.035,wh*.48,ww*.48,front-side*.38,cy+a*wh*.25,cz+b*ww*.25,M.glass,.26+rand()*.28,'glass');
    if(l===1&&col===0){const pp=V(front-side*.53,cy+ch*.52,cz-cw*.46);const joint=pp.clone().add(V(0,-ch*.5,cw*.42));crack(pp,joint,.055);crack(joint,joint.clone().add(V(0,-ch*.52,cw*.26)),.055);crack(joint,joint.clone().add(V(0,-ch*.1,-cw*.36)),.045);}
   }else{breakable(.5,ch,cw,front,cy,cz,body,threshold,'facade');breakable(.15,ch*.8,cw*.48,front-side*.31,cy-.15,cz,M.wood,threshold,'door');}
  }
  // Upper oriel bay: faceted, with shallow posts, not a livery or sign.
  const by=y+h*.65;for(const zz of [-1,1])intactShell(1.0,3.3,.14,front-side*.58,by,z+zz*1.6,M.trim);intactShell(1.2,.2,3.5,front-side*.6,by+1.7,z,M.trim);intactShell(1.2,.2,3.5,front-side*.6,by-1.7,z,M.trim);
  gable(front-side*.45,side,z,y+h+1,width+1,depth+1,roofs[row%3]);for(let k=0;k<4;k++)for(let j=0;j<6;j++)breakable((depth+1)/4,.35,(width+1)/6,front+side*(depth+1)*(k+.5)/4,y+h+.8,z-(width+1)/2+(width+1)*(j+.5)/6,M.trim,.63+ruinRand()*.2,'roof_trim');
  for(let j=0;j<3;j++)box(city,.65,.22*(j+1),3.4,front-side*(1.6-j*.55),y+.11*(j+1),z,M.curb);
 }
 // Rectangular office blocks, no signature landmark tower silhouettes.
 for(const side of [-1,1])for(const z of [-230,-100,210,350]){
  const x=side*(65+rand()*20),y=ground(z),w=30+rand()*12,depth=35+rand()*15,h=28+rand()*32,body=offices[Math.floor(rand()*offices.length)],front=x-side*w/2;
  intactShell(w,h,1,x,y+h/2,z-depth/2,body);intactShell(w,h,1,x,y+h/2,z+depth/2,body);intactShell(1,h,depth,x+side*w/2,y+h/2,z,body);intactShell(.2,h,depth,front+side*2,y+h/2,z,M.interior);
  for(const edge of [-1,1])ruinWall(x,y,z+edge*depth/2,w,h,'x',body);ruinWall(x+side*w/2,y,z,depth,h,'z',body);
  for(let k=0;k<6;k++)breakable(w/3,.5,depth/2,x-w/2+w*(k%3+.5)/3,y+h,z-depth/2+depth*(Math.floor(k/3)+.5)/2,roofs[0],.67+ruinRand()*.21,'roof');
  for(let l=4;l<h*.68;l+=4)floorSlab(x,y+l,z,w,depth-.7,side);
  for(let l=0;l<Math.floor(h/4);l++)for(let col=0;col<7;col++){
   const cy=y+2+l*4,cz=z-depth/2+(col+.5)*depth/7;
   breakable(.4,3.8,depth/7-.08,front,cy,cz,body,.64+rand()*.2,'office');
   breakable(.12,2.5,depth/7-.6,front-side*.3,cy,cz,M.glass,.30+rand()*.3,'glass');
  }
  for(let l=0;l<h;l+=4)intactShell(w+.2,.15,depth+.2,x,y+l,z,M.metal);
  intactShell(8,2,6,x-w*.2,y+h+1,z,M.metal);
 }
 // Cross-street frontage behind the orthographic fighting stage; no business text.
 for(const x of [-81,-54,-27]){const y=ground(80),w=24,h=16,front=61,face=houses[(-x/27)%houses.length];box(city,w,7,24,x,y-3.5,49,M.curb);intactShell(w,h,1,x,y+h/2,37,offices[1]);for(const side of [-1,1]){intactShell(.6,h,24,x+side*w/2,y+h/2,49,offices[1]);ruinWall(x+side*w/2,y,49,24,h,'z',face);}ruinWall(x,y,37,w,h,'x',face);intactShell(w-.5,h,.3,x,y+h/2,front-1,M.interior);
  for(let k=0;k<6;k++)breakable(w/3,.5,12.5,x-w/2+w*(k%3+.5)/3,y+h,43+12.5*Math.floor(k/3),roofs[0],.67+ruinRand()*.2,'roof');for(let l=1;l<=2;l++)floorSlab(x,y+l*4.8,49,w,23);
  for(let col=0;col<4;col++)for(let row=0;row<3;row++){const cx=x-w/2+(col+.5)*w/4,cy=y+2.3+row*4.8;breakable(w/4-.1,4.7,.45,cx,cy,front,face,.58+rand()*.15,'cross_facade');breakable(3.25,2.1,.13,cx,cy,front+.3,M.glass,.3+rand()*.18,'glass');for(const side of [-1,1]){breakable(3.6,.16,.35,cx,cy+side*1.15,front+.4,M.trim,.55,'trim');breakable(.17,2.45,.35,cx+side*1.76,cy,front+.4,M.trim,.55,'trim');}}for(let row=0;row<3;row++)intactShell(w+.2,.2,1,x,y+row*4.8,front+.5,M.trim);
 }
 // Outer infill closes the visible empty lots while preserving the main streets.
 for(const side of [-1,1])for(const row of [0,1,2])for(let iz=0;iz<10;iz++){
  const z=-292+iz*60;if(Math.abs(z-80)<28)continue;const x=side*(row===0?44:105+row*38);if(row===0&&[-230,-100,210,350].some(v=>Math.abs(v-z)<39))continue;
  const y=ground(z),w=row===0?15:30,d=row===0?22:32,h=12+ruinRand()*13,body=houses[(iz+row)%houses.length];
  for(const edge of [-1,1]){intactShell(.45,h,d,x+edge*w/2,y+h/2,z,body);ruinWall(x+edge*w/2,y,z,d,h,'z',body);}intactShell(w,h,.45,x,y+h/2,z-d/2,body);ruinWall(x,y,z-d/2,w,h,'x',body);
  for(let k=0;k<4;k++)breakable(w/2,.35,d/2,x+w*((k%2)-.5)/2,y+h,z+d*(Math.floor(k/2)-.5)/2,roofs[iz%3],.65+ruinRand()*.2,'roof');
  for(let l=0;l<3;l++)for(let c=0;c<3;c++){const xx=x-w/2+w*(c+.5)/3,yy=y+(l+.5)*h/3;breakable(w/3-.1,h/3-.1,.4,xx,yy,z+d/2,body,.56+rand()*.2,'cross_facade');breakable(w/3*.6,h/3*.55,.07,xx,yy,z+d/2+.24,M.glass,.3+rand()*.2,'glass');}
  for(let l=1;l<=2;l++)floorSlab(x,y+h*l/3,z,w,d-.5);
 }
 // Falling street lamps retain their full assembled local hierarchy.
 const poleGroups=[];
 for(const side of [-1,1])for(let z=-270;z<360;z+=48){if(Math.abs(z-80)<30)continue;const group=new T.Group(),home=V(side*13.3,ground(z),z);group.position.copy(home);city.add(group);
  const pole=new T.Mesh(new T.CylinderGeometry(.08,.14,6.5,8),M.metal);pole.position.y=3.25;group.add(pole);const arm=new T.Mesh(new T.BoxGeometry(1.5,.1,.12),M.metal);arm.position.set(-side*.65,6.4,0);group.add(arm);const lamp=new T.Mesh(new T.BoxGeometry(.6,.15,.4),M.lamp);lamp.position.set(-side*1.3,6.25,0);group.add(lamp);
  poleGroups.push({group,home,homeQ:group.quaternion.clone(),endQ:new T.Quaternion().setFromEuler(new T.Euler(.08,0,side*(Math.PI/2-.02))),threshold:.58+rand()*.2,kind:'pole'});
 }
 // Original generic open-sided street tram: muted wood/cream, no copied livery or insignia.
 const tram=new T.Group();tram.position.set(0,ground(50)+.4,50);tram.rotation.x=-Math.atan((ground(53)-ground(47))/6);city.add(tram);
 function tramBox(w,h,d,x,y,z,m){const mesh=new T.Mesh(unit,m);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);tram.add(mesh);}
 tramBox(2.6,.55,6.4,0,.45,0,M.wood);tramBox(2.85,.18,6.9,0,2.9,0,M.trim);tramBox(2.6,.8,6.2,0,1.15,0,houses[0]);for(const side of [-1,1])for(const z of [-2.8,-1.4,0,1.4,2.8])tramBox(.10,1.65,.10,side*1.22,2,z,M.wood);for(const z of [-2.8,2.8]){tramBox(2.3,.6,.14,0,1.9,z,M.dark);tramBox(1.5,.16,.5,0,.2,z+Math.sign(z)*.5,M.metal);}for(const x of [-.95,.95])for(const z of [-1.9,1.9]){const wheel=new T.Mesh(new T.CylinderGeometry(.32,.32,.16,12),M.dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.16,z);tram.add(wheel);}const tramRecord={group:tram,home:tram.position.clone(),homeQ:tram.quaternion.clone(),endQ:new T.Quaternion().setFromEuler(new T.Euler(-.17,.12,.40)),threshold:.66,kind:'tram'};dynamicGroups.push(...poleGroups,tramRecord);
 // Crater bowls and radial road cracks. Damage cuts the matching road surface.
 const craterMeshes=[];for(const c of craterDefs){const group=new T.Group();group.position.set(c.x,ground(c.z),c.z);debris.add(group);const bowl=new T.Mesh(new T.ConeGeometry(c.r,3,18,1,true),M.crater);bowl.rotation.x=Math.PI;bowl.position.y=-1.5;group.add(bowl);const base=new T.Mesh(new T.CircleGeometry(c.r*.75,18),M.dark);base.rotation.x=-Math.PI/2;base.position.y=-2.8;group.add(base);craterMeshes.push(group);
  for(let k=0;k<9;k++){const a=k*Math.PI*2/9,r=c.r*(1+rand()*.7),x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;crack(V(c.x,ground(c.z)+.11,c.z),V(x,ground(z)+.11,z),.035+rand()*.025);}
 }
 // Fixed smoke pool, analytic time only; no particles are created while playing.
 const smokeMat=new T.MeshBasicMaterial({color:0x53626a,transparent:true,opacity:.24,depthWrite:false});const smoke=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),smokeMat,48);smoke.frustumCulled=false;debris.add(smoke);const smokeSources=[...craterDefs,{x:63,z:210,r:6}];
 // Marker-only summon paths and giant battle volume placeholders.
 const summonMarkers=new T.Group(),giantMarkers=new T.Group();markers.add(summonMarkers,giantMarkers);
 for(let k=0;k<3;k++){const start=V((k-1)*35,ground(180)+35,180),end=V((k-1)*5,ground(80)+2,80),curve=new T.QuadraticBezierCurve3(start,start.clone().lerp(end,.5).add(V(0,18,0)),end),points=curve.getPoints(36);const geo=new T.BufferGeometry().setFromPoints(points);const line=new T.Line(geo,new T.LineDashedMaterial({color:[0x75b7e1,0xdce0de,0xe17a65][k],dashSize:1.8,gapSize:1.2}));line.computeLineDistances();summonMarkers.add(line);const marker=new T.Mesh(new T.OctahedronGeometry(.6),flat([0x75b7e1,0xdce0de,0xe17a65][k]));marker.position.copy(end);summonMarkers.add(marker);}
 for(const [x,c] of [[-43,0x77c7e0],[43,0xd58c79]]){const geo=new T.EdgesGeometry(new T.BoxGeometry(35,105,30));const line=new T.LineSegments(geo,new T.LineBasicMaterial({color:c,transparent:true,opacity:.55}));line.position.set(x,ground(80)+52.5,80);giantMarkers.add(line);}
 // Orthographic set extension: forced-perspective distant scenery, one shared camera.
 const stage=new T.Group(),nearStage=new T.Group(),midStage=new T.Group(),farStage=new T.Group();stage.name='SideStageParallax';root.add(stage);stage.add(nearStage,midStage,farStage);const nearAssembly=new T.Group(),nearRubble=new T.Group(),midAssembly=new T.Group(),midRubble=new T.Group();nearStage.add(nearAssembly,nearRubble);midStage.add(midAssembly,midRubble);const sy=ground(80);
 const skyMat=new T.ShaderMaterial({depthWrite:false,uniforms:{top:{value:new T.Color()},bottom:{value:new T.Color()}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 top,bottom;void main(){gl_FragColor=vec4(mix(bottom,top,smoothstep(0.,1.,vUv.y)),1.);}'});
 const skyPlane=new T.Mesh(new T.PlaneGeometry(240,130),skyMat);skyPlane.position.set(0,sy+18,-160);farStage.add(skyPlane);
 const bayMat=flat(0x6998a5);box(farStage,180,100,1,0,sy-46,-135,bayMat);
 const farHouse=flat(0x9db1b1),farEdge=flat(0xb7c5bf);box(farStage,180,40,1,0,sy-20,-123,farEdge);for(let k=0;k<24;k++){const x=-50+k*4.4,h=2.8+ruinRand()*5;box(farStage,3.3,h,2,x,sy-1+h/2,-120-(k%3)*2,k%2?farHouse:farEdge);}
 const stageBridge=bank.bridge.clone(true);stageBridge.name='DistantGoldenGate';stageBridge.scale.setScalar(.017);stageBridge.position.set(0,sy+5,-110);farStage.add(stageBridge);for(let k=0;k<20;k++){const x=-35+(k*17.3)%70;box(farStage,1.5+(k%4),.025,.04,x,sy-3+(k%5)*.65,-106,M.foam);}
 // A separate downhill strip leaves a view corridor through the middle buildings.
 box(midAssembly,140,30,65,0,sy-15,0,M.pavement);for(let x=-60;x<=60;x+=4)box(midAssembly,.1,2.4,.1,x,sy+1.2,38,M.metal);box(midAssembly,130,.15,.18,0,sy+2.5,38,M.metal);
 for(const spec of [[-25,18,19,13],[-15,-1,12,8],[18,8,15,10],[29,-16,24,13]]){const [x,z,h,w]=spec,body=houses[Math.abs(Math.floor(x))%houses.length];intactShell(w,h,12,x,sy+h/2,z,body,midAssembly);ruinWall(x,sy,z-5,w,h,'x',body,midAssembly);for(const edge of [-1,1])ruinWall(x+edge*w/2,sy,z,12,h,'z',body,midAssembly);for(let k=0;k<4;k++)breakable(w/2,.4,6.4,x+w*((k%2)-.5)/2,sy+h,z+6.4*(Math.floor(k/2)-.5),roofs[1],.66+ruinRand()*.2,'roof',null,midAssembly,midRubble);for(let l=1;l<=2;l++)floorSlab(x,sy+h*l/3,z,w,11,0,midAssembly);for(let l=0;l<Math.floor(h/3.3);l++)for(let col=0;col<3;col++){const xx=x-w/2+w*(col+.5)/3,yy=sy+2+l*3.3;breakable(w/3*.58,1.75,.1,xx,yy,z+6.08,M.glass,.32+ruinRand()*.18,'glass',null,midAssembly,midRubble);for(const sign of [-1,1])breakable(w/3*.65,.12,.14,xx,yy+sign*.95,z+6.15,M.trim,.56+ruinRand()*.18,'trim',null,midAssembly,midRubble);}}
 // Horizontal foreground contact plane, shallow wall fragments and lamps leave the acting area open.
 box(nearAssembly,140,24,.5,0,sy-12.1,110,M.dark);box(nearAssembly,140,.5,18,0,sy-.3,101,M.dark);box(nearAssembly,140,.22,3,0,sy+.05,92.5,M.pavement);box(nearAssembly,140,.25,.25,0,sy+.12,94,M.curb);
 for(const side of [-1,1]){const x=side*24;for(let row=0;row<3;row++)for(let col=0;col<4;col++)breakable(1.98,7/3-.03,2,x-4+(col+.5)*2,sy+(row+.5)*7/3,96,houses[side<0?2:4],.53+ruinRand()*.21,'cross_facade',null,nearAssembly,nearRubble);for(let col=0;col<4;col++)breakable(2.1,.3,2.4,x-4+(col+.5)*2.1,sy+7,96,M.trim,.57+ruinRand()*.2,'trim',null,nearAssembly,nearRubble);crack(V(x-2,sy+6,97.05),V(x-1.4,sy+4.7,97.05),.04,nearAssembly);crack(V(x-1.4,sy+4.7,97.05),V(x-1.7,sy+3.8,97.05),.04,nearAssembly);for(let k=0;k<5;k++)intactShell(.15,3.5,.15,x-3+k*1.5,sy+8.8,96,M.metal,nearAssembly);intactShell(8,.15,.15,x,sy+10.4,96,M.metal,nearAssembly);bar(nearAssembly,V(side*18,sy,90),V(side*18,sy+8,90),.1,M.metal);box(nearAssembly,1.2,.25,.5,side*18,sy+8,90,M.lamp);}
 const parallaxLayers={parallax_near:nearStage,parallax_mid:midStage,parallax_far:farStage};
 // Allocate each static/debris instance batch once, with immutable source transforms.
 for(const b of batches.values()){b.mesh=new T.InstancedMesh(b.geometry,b.material,b.items.length);b.mesh.frustumCulled=false;b.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);b.parent.add(b.mesh);}
 const perspective=new T.PerspectiveCamera(48,16/9,.1,30000),ortho=new T.OrthographicCamera(-50,50,28,-28,.1,30000);let camera=perspective,lighting='day',damage=0,lastMetrics={},activeShot='hill_street',activeLayer='beauty';
 function world(p){return root.localToWorld(p.clone());}root.updateMatrixWorld(true);
 const shots={hill_street:{from:[0,ground(290)+5,290],to:[.8,ground(265)+5,265],look:[0,ground(-210)+5,-210],duration:6},intersection:{from:[-4,ground(80)+5,88],to:[-3,ground(80)+5.3,84],look:[2,ground(40)+7,40],duration:6},side_stage:{from:[0,ground(80)+11,125],to:[0,ground(80)+11,125],look:[0,ground(80)+9,80],duration:6,orthographic:true},rooftop_summon:{from:[0,ground(185)+23,185],to:[2,ground(177)+23,177],look:[0,ground(-140)+24,-140],duration:6},giant_battle:{from:[0,ground(255)+4,255],to:[1,ground(245)+4,245],look:[0,ground(80)+62,80],duration:6},rollback:{from:[0,ground(185)+8,185],to:[1,ground(177)+8,177],look:[0,ground(35)+3,35],duration:6}};
 function setLighting(name){if(!global.BridgeLighting[name])throw Error('Unknown lighting '+name);bank.setLighting(name);lighting=name;const night=name==='night';M.glass.color.setHex(night?0xc8b88a:0x8bb8c4);M.lamp.color.setHex(night?0xffd48b:0xffe0a1);smokeMat.color.setHex(name==='battle_haze'?0x615653:0x53626a);const p=global.BridgeLighting[name];roadU.roadColor.value.setRGB(...(night?[.045,.075,.11]:name==='battle_haze'?[.13,.14,.15]:[.13,.19,.21]));roadU.fogColor.value.setRGB(...p.waterFog);skyMat.uniforms.top.value.setRGB(...p.top);skyMat.uniforms.bottom.value.setRGB(...p.horizon);bayMat.color.setRGB(...p.waterFog);farHouse.color.setRGB(...p.mist).lerp(new T.Color(0xa0b9b7),.3);farEdge.color.copy(farHouse.color).multiplyScalar(1.13);}
 function setDamage(value){if(!Number.isFinite(value))throw Error('Invalid damage');damage=clamp(value);}
 function sample(shot,time,value=damage){activeShot=shot;const c=shots[shot];if(!c)throw Error('Unknown downtown shot '+shot);const t=T.MathUtils.clamp(time,0,c.duration),d=shot==='rollback'?1-ease(t/c.duration):clamp(value);roadU.damage.value=d;bank.sample('opening',t);
  const phase=new Map();let fallen=0;
  for(const p of pieces){const u=ease((d-p.threshold)/(1-p.threshold));phase.set(p,u);if(u>0)fallen++;}
  for(const o of cracks){o.scale.copy(o.baseScale);o.scale.x*=ease((d-.035)/.145)*2.0;o.scale.z*=ease((d-.035)/.145)*2.0;}
  const structuralPhase=ease((d-.58)/.34);for(const o of structures){o.scale.copy(o.baseScale);o.scale.y*=1-structuralPhase;o.position.copy(o.basePosition);o.position.y-=o.baseScale.y*structuralPhase*.5;}
  for(const o of ruinMeshes){o.visible=structuralPhase>0;o.scale.y=structuralPhase;o.position.y=o.userData.baseY*(1-structuralPhase);}
  for(const o of floorMeshes)o.visible=d>.44;
  for(const b of batches.values()){for(let i=0;i<b.items.length;i++){const item=b.items[i];if(item.home){const u=phase.get(item),falling=u>0,active=(b.parent===item.debrisBatch.parent)===falling;if(!active){b.mesh.setMatrixAt(i,zero);continue;}tempP.copy(item.home.position).lerp(item.end.position,u);tempP.y+=Math.sin(u*Math.PI)*Math.min(8,item.home.position.y-ground(item.home.position.z))*.32;tempQ.copy(item.home.quaternion).slerp(item.end.quaternion,u);tempMatrix.compose(tempP,tempQ,item.home.scale);}else tempMatrix.compose(item.position,item.quaternion,item.scale);b.mesh.setMatrixAt(i,tempMatrix);}b.mesh.instanceMatrix.needsUpdate=true;}
  for(const o of dynamicGroups){const u=ease((d-o.threshold)/(1-o.threshold));o.group.position.copy(o.home);o.group.quaternion.copy(o.homeQ).slerp(o.endQ,u);if(o.kind==='tram')o.group.position.x+=u*3;if(u>0&&o.group.parent!==debris)debris.add(o.group);if(u===0&&o.group.parent!==city)city.add(o.group);}
  const craterPhase=ease((d-.43)/.57);craterMeshes.forEach(o=>{o.scale.setScalar(craterPhase);o.visible=craterPhase>0;});
  const smokePower=ease((d-.55)/.45);for(let i=0;i<48;i++){const s=smokeSources[i%smokeSources.length],age=((i*.618+t*.13)%1+1)%1,size=(2.5+age*4.5)*smokePower;tempP.set(s.x+Math.sin(i*4.1+t*.35)*age*3,ground(s.z)+3+age*30,s.z+Math.cos(i*2.7+t*.22)*age*3);tempQ.setFromEuler(new T.Euler(age*.5,i,age));tempMatrix.compose(tempP,tempQ,V(size,size*.7,size));smoke.setMatrixAt(i,tempMatrix);}smoke.instanceMatrix.needsUpdate=true;smoke.visible=smokePower>0;
  summonMarkers.visible=shot==='rooftop_summon';giantMarkers.visible=shot==='giant_battle';
  camera=c.orthographic?ortho:perspective;camera.position.copy(world(V(...c.from).lerp(V(...c.to),ease(t/c.duration))));camera.up.set(0,1,0);camera.lookAt(world(V(...c.look)));camera.updateMatrixWorld();bank.water.material.uniforms.eye.value.copy(camera.position);roadU.eye.value.copy(camera.position);
  setLayer(activeLayer);lastMetrics={shot,time:t,damage:d,lighting,structuralPhase,ruinWalls:ruinMeshes.length,exposedFloors:floorMeshes.length,pieces:pieces.length,fallingPieces:fallen,houseCount,craterPhase,cameraType:c.orthographic?'orthographic':'perspective'};return lastMetrics;
 }
 function setLayer(layer){if(!['beauty','city','debris','environment',...Object.keys(parallaxLayers)].includes(layer))throw Error('Unknown layer');activeLayer=layer;const side=activeShot==='side_stage',env=layer==='beauty'||layer==='environment';for(const o of background)o.visible=!side&&env;terrain.visible=!side&&env;city.visible=!side&&(layer==='beauty'||layer==='city');debris.visible=!side&&(layer==='beauty'||layer==='debris');markers.visible=!side&&(layer==='beauty'||layer==='city');stage.visible=side;nearStage.visible=layer==='beauty'||layer==='city'||layer==='debris'||layer==='parallax_near';midStage.visible=layer==='beauty'||layer==='city'||layer==='debris'||layer==='parallax_mid';farStage.visible=env||layer==='parallax_far';nearAssembly.visible=midAssembly.visible=layer!=='debris';nearRubble.visible=midRubble.visible=layer!=='city';}
 function setSize(w,h){perspective.aspect=w/h;perspective.updateProjectionMatrix();ortho.left=-13*w/h;ortho.right=13*w/h;ortho.top=13;ortho.bottom=-13;ortho.updateProjectionMatrix();}
 function setParallaxOffset(value=0){if(!Number.isFinite(value))throw Error("Invalid parallax offset");nearStage.position.x=value;midStage.position.x=value*.4;farStage.position.x=value*.12;}
 const originals=pieces.map(p=>p.original).concat(dynamicGroups.map((p,i)=>Object.freeze({id:'group_'+i,kind:p.kind,position:Object.freeze(p.home.toArray()),quaternion:Object.freeze(p.homeQ.toArray()),scale:Object.freeze([1,1,1]),matrix:Object.freeze(new T.Matrix4().compose(p.home,p.homeQ,V(1,1,1)).toArray())})));
 setLighting('day');sample('hill_street',0,0);
 return {scene,root,city,debris,terrain,markers,shots,originalTransforms:Object.freeze(originals),get camera(){return camera;},setLighting,setDamage,setSize,setLayer,sample,metrics:()=>lastMetrics,batches,pieces,ground,stage,parallaxLayers,setParallaxOffset,structures,ruinMeshes,floorMeshes};
}
global.DowntownBankV2={build};
})(window);
