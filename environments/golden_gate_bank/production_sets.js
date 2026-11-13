/* Additive environment banks. All geometry and shader patterns are procedural. */
(function(global){'use strict';const T=global.THREE,V=(x,y,z)=>new T.Vector3(x,y,z),ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
function helpers(scene){
 const unit=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,8),materials=[];
 const mat=(c,e=0)=>{const m=new T.MeshStandardMaterial({color:c,roughness:.7,metalness:.25,emissive:e});materials.push(m);return m;};
 function box(parent,w,h,d,x,y,z,m){const o=new T.Mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);parent.add(o);return o;}
 function bar(parent,a,b,r,m){const d=b.clone().sub(a),o=new T.Mesh(cylinder,m);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.set(r,d.length(),r);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());parent.add(o);return o;}
 function batch(parent){const groups=new Map();for(const o of [...parent.children])if(o.isMesh&&(o.geometry===unit||o.geometry===cylinder)){const k=o.geometry.uuid+o.material.uuid;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);}for(const list of groups.values()){const m=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((o,i)=>{o.updateMatrix();m.setMatrixAt(i,o.matrix);parent.remove(o);});parent.add(m);}}
 return {box,bar,mat,batch,unit};
}
function buildSpace(){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(43,16/9,1,40000),root=new T.Group();scene.add(root);scene.background=new T.Color(0x02050d);
 let seed=451;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 const positions=[],colors=[];for(let i=0;i<2800;i++){const y=random()*2-1,a=random()*Math.PI*2,r=12000+random()*3000,k=Math.sqrt(1-y*y);positions.push(Math.cos(a)*k*r,y*r,Math.sin(a)*k*r);const c=.3+random()*.7;colors.push(c*.8,c*.9,c);}
 const starsG=new T.BufferGeometry();starsG.setAttribute('position',new T.Float32BufferAttribute(positions,3));starsG.setAttribute('color',new T.Float32BufferAttribute(colors,3));scene.add(new T.Points(starsG,new T.PointsMaterial({size:13,vertexColors:true,sizeAttenuation:true,depthWrite:false})));
 const globe=new T.Group();globe.position.set(0,-300,-280);root.add(globe);
 const uniforms={light:{value:V(-.7,.4,.65).normalize()},time:{value:0},city:{value:.4}};
 const surface=new T.ShaderMaterial({uniforms,vertexShader:`varying vec3 p,n;void main(){p=position;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec3 p,n;uniform vec3 light;uniform float time,city;float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}float fbm(vec3 p){float a=.5,v=0.;for(int i=0;i<5;i++){v+=noise3(p)*a;p=p*2.03+vec3(13.1,7.3,4.9);a*=.5;}return v;}float field(vec3 q){return fbm(q*3.+vec3(fbm(q*5.)*1.6))-.47;}void main(){vec3 d=normalize(p);float f=field(d);float land=smoothstep(.005,.025,f);vec3 ocean=vec3(.018,.14,.28),ground=mix(vec3(.10,.25,.18),vec3(.34,.36,.22),smoothstep(.025,.18,f));vec3 c=mix(ocean,ground,land);float ice=smoothstep(.78,.94,abs(d.y)+field(d*2.)*.05);c=mix(c,vec3(.72,.83,.88),ice);float lit=max(dot(d,light),0.);c*=.12+.88*lit;float glow=pow(max(sin(d.x*300.+d.z*80.)*sin(d.y*240.-d.x*110.),0.),32.);c+=vec3(.8,.45,.13)*glow*land*(1.-smoothstep(0.,.18,lit))*city;gl_FragColor=vec4(c,1.);}`});
 globe.add(new T.Mesh(new T.SphereGeometry(260,112,72),surface));
 const clouds=new T.Mesh(new T.SphereGeometry(262,96,64),new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec3 p;uniform vec3 light;uniform float time;float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}float fbm(vec3 p){float a=.5,v=0.;for(int i=0;i<5;i++){v+=noise3(p)*a;p=p*2.03+vec3(13.1,7.3,4.9);a*=.5;}return v;}void main(){vec3 d=normalize(p);vec3 w=d*10.+vec3(time*.006,0,0);float warp=fbm(w*.65);float f=fbm(w+vec3(warp*3.,warp,0));float a=smoothstep(.51,.72,f);float l=.3+.7*max(dot(d,light),0.);gl_FragColor=vec4(vec3(.9,.95,1.)*l,a*.72);}` }));globe.add(clouds);
 const atmosphere=new T.Mesh(new T.SphereGeometry(270,96,64),new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.FrontSide,vertexShader:`varying vec3 n,v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);v=-p.xyz;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}`,fragmentShader:`precision highp float;varying vec3 n,v;void main(){float rim=pow(1.-max(dot(normalize(n),normalize(v)),0.),3.8);gl_FragColor=vec4(.10,.40,.85,rim*.75);}`}));globe.add(atmosphere);
 const shots={limb:{from:[0,65,430],to:[35,70,400],look:[0,-80,-230],duration:6},orbit:{from:[390,90,300],to:[330,105,350],look:[0,-100,-280],duration:6},stage:{from:[0,120,500],to:[0,135,475],look:[0,70,-600],duration:6}};let lighting='sunlit';
 function setLighting(name){if(!['sunlit','terminator'].includes(name))throw Error('Unknown space lighting');lighting=name;uniforms.light.value.copy(name==='sunlit'?V(-.7,.4,.65):V(-.9,.08,-.25)).normalize();}
 function sample(shot,time){const c=shots[shot];if(!c)throw Error('Unknown space shot');camera.position.fromArray(c.from).lerp(V(...c.to),ease(time/c.duration));camera.lookAt(V(...c.look));camera.updateMatrixWorld();globe.rotation.y=time*.008;clouds.rotation.y=time*.002;uniforms.time.value=time;return {shot,time,lighting};}
 return {scene,camera,shots,lightingOptions:['sunlit','terminator'],setLighting,sample};
}
function buildDataCenter(){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(54,16/9,.05,250),root=new T.Group();scene.add(root);scene.background=new T.Color(0x07131e);scene.fog=new T.FogExp2(0x0b2232,.025);
 const h=helpers(scene),{box,bar,mat,batch}=h,black=mat(0x111c26),metal=mat(0x344957),edge=mat(0x607582),door=mat(0x142d3d),cyan=new T.MeshBasicMaterial({color:0x70d9ea}),white=new T.MeshBasicMaterial({color:0xc8e6eb}),amber=new T.MeshBasicMaterial({color:0xffac64}),red=new T.MeshBasicMaterial({color:0xff4d3f});
 const ambient=new T.HemisphereLight(0x729eb8,0x162531,.8);scene.add(ambient);const key=new T.PointLight(0x8ce5ff,2.0,45,2);key.position.set(0,4,-3);scene.add(key);const back=new T.PointLight(0xffa26c,3,38,2);back.position.set(0,2.5,-30);scene.add(back);
 box(root,18,.25,52,0,-.2,-18,metal);box(root,18,.4,52,0,5.4,-18,black);
 const leds=[];for(const side of [-1,1]){
  box(root,.4,5.5,52,side*8,2.5,-18,door);
  for(let j=0;j<15;j++){
   const z=4-j*2.8;box(root,1.6,3.4,2.3,side*3.4,1.7,z,black);box(root,.10,3.3,2.45,side*2.55,1.7,z,edge);
   for(let rack=0;rack<9;rack++){
    box(root,.12,.27,2.05,side*2.49,.35+rack*.34,z,door);
    for(let slit=0;slit<5;slit++)box(root,.13,.018,.24,side*2.415,.33+rack*.34,z-.65+slit*.32,metal);
    box(root,.14,.035,.10,side*2.40,.40+rack*.34,z+.78,(rack+j)%5===0?amber:cyan);
   }
   const led=box(root,.14,2.9,.045,side*2.40,1.7,z-1.05,cyan);leds.push(led);
   box(root,1.4,.5,2.25,side*3.4,3.6,z,metal);
  }
  bar(root,V(side*2.0,4.5,7),V(side*2.0,4.5,-43),.13,metal);
  box(root,.7,.2,50,side*4.7,4.65,-18,edge);
 }
 for(let z=5;z>=-41;z-=4){box(root,15,.25,.25,0,4.9,z,metal);for(const x of [-1.5,1.5])box(root,.11,.06,2.6,x,5.05,z,white);for(const x of [-6,6]){bar(root,V(x,4.9,z),V(x,3.8,z),.05,edge);box(root,2.2,.12,1.0,x,3.8,z,black);}}
 for(let z=5;z>-43;z-=1.4)box(root,5,.014,.025,0,-.06,z,edge);
 box(root,5.1,4.7,.3,0,2.35,-43,door);box(root,2.4,3.1,.12,0,1.6,-42.78,black);box(root,.03,2.9,.06,0,1.6,-42.70,cyan);
 const ring=new T.Mesh(new T.TorusGeometry(.4,.025,6,48),cyan);ring.position.set(0,3.8,-42.6);root.add(ring);
 const alertStrips=[];for(const side of [-1,1])alertStrips.push(box(root,.05,.06,46,side*2.2,.02,-18,cyan));
 batch(root);const shots={aisle:{from:[.2,1.75,8],to:[-.1,1.7,2],look:[0,1.8,-25],duration:6},low:{from:[-1.35,.5,4],to:[-.8,.65,-2],look:[.4,2.1,-22],duration:6},crossing:{from:[1.8,2.4,-5],to:[-1.6,2.3,-6],look:[0,1.9,-24],duration:6}};let lighting='normal';
 function setLighting(name){if(!['normal','alert','standby'].includes(name))throw Error('Unknown data-center lighting');lighting=name;const alarm=name==='alert';cyan.color.setHex(alarm?0xff5743:0x70d9ea);scene.fog.color.setHex(alarm?0x301820:0x0b2232);ambient.intensity=name==='standby'?.32:.8;key.color.setHex(alarm?0xff6956:0x8ce5ff);}
 function sample(shot,time){const c=shots[shot];if(!c)throw Error('Unknown data-center shot');camera.position.fromArray(c.from).lerp(V(...c.to),ease(time/c.duration));camera.lookAt(V(...c.look));camera.updateMatrixWorld();key.intensity=(lighting==='alert'?1.7+.4*Math.sin(time*4):2.0);return {shot,time,lighting};}
 return {scene,camera,shots,lightingOptions:['normal','alert','standby'],setLighting,sample};
}
function buildAlcatraz(){
 const bank=GoldenGateBank.build(),{scene,camera}=bank;const root=new T.Group();root.name='AlcatrazSandboxBase';root.position.set(380,0,-1250);bank.set.add(root);
 const {box,bar,mat,batch}=helpers(scene),stone=mat(0x9a9c8d),rock=mat(0x677874),dark=mat(0x223e49),cream=mat(0xb9b7a0),roof=mat(0x6f7a75),steel=mat(0x4e6b75),cyan=new T.MeshBasicMaterial({color:0x70dfea}),black=new T.MeshBasicMaterial({color:0x07151d});
 const g=new T.PlaneGeometry(530,260,44,28);g.rotateX(-Math.PI/2);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=(x/260)**2+(z/125)**2;pos.setY(i,Math.max(-8,24*(1-r)+Math.sin(x*.03)*Math.cos(z*.04)*3));}g.computeVertexNormals();root.add(new T.Mesh(g,new T.MeshStandardMaterial({color:0x6e8075,roughness:1,flatShading:true})));
 box(root,266,9,78,-15,24,8,stone);box(root,228,23,59,-15,40,8,cream);box(root,238,3,66,-15,53,8,roof);
 for(let x=-119;x<=95;x+=10)for(const z of [-22,38])for(const y of [35,43,49])box(root,3,3,.3,x,y,z,black);
 for(let x=-130;x<=100;x+=46){box(root,5,27,63,x,39,8,stone);box(root,11,1,70,x,54.5,8,roof);}
 box(root,54,14,42,135,29,14,cream);box(root,59,2,46,135,37,14,roof);
 // Lighthouse and recognisable water-tower silhouette, with no copied textures or signage.
 const lighthouse=new T.Mesh(new T.CylinderGeometry(3.7,5.3,24,12),cream);lighthouse.position.set(115,49,-41);root.add(lighthouse);box(root,10,2,10,115,61,-41,steel);const beacon=new T.Mesh(new T.CylinderGeometry(3,3,5,12),cyan);beacon.position.set(115,64,-41);root.add(beacon);
 for(const x of [-1,1])for(const z of [-1,1])bar(root,V(-170+x*8,18,42+z*8),V(-170+x*5,59,42+z*5),.65,steel);
 const tank=new T.Mesh(new T.CylinderGeometry(10,10,13,14),cream);tank.position.set(-170,64,42);root.add(tank);const lid=new T.Mesh(new T.ConeGeometry(11,4,14),roof);lid.position.set(-170,72,42);root.add(lid);
 for(let y=25;y<58;y+=10){bar(root,V(-178,y,34),V(-162,y+10,34),.35,steel);bar(root,V(-178,y+10,34),V(-162,y,34),.35,steel);}
 // Fictional sea-level hangar cut into an architectural retaining face.
 box(root,156,34,18,0,13,-101,rock);box(root,93,24,.4,0,12,-110.3,black);box(root,99,2,2,0,25,-112,steel);
 for(const x of [-50,50]){box(root,4,26,4,x,12,-112,steel);box(root,1.0,23,1,x,12,-114.3,cyan);}
 box(root,110,1,46,0,1,-135,steel);for(const x of [-52,52])box(root,1,.2,43,x,1.7,-135,cyan);
 const doors=[box(root,45,23,1,-23,12,-111,steel),box(root,45,23,1,23,12,-111,steel)];
 for(const x of [-1,1])for(let z=-150;z<-114;z+=12)box(root,5,.2,1,x*43,1.8,z,cyan);
 box(root,26,3,100,215,3,-70,stone);box(root,100,3,23,178,3,-130,stone);
 for(let z=-110;z<-20;z+=15)bar(root,V(204,0,z),V(204,12,z),.6,steel);
 // Keep moving gate leaves separate from the static batches.
 doors.forEach(o=>root.remove(o));batch(root);doors.forEach(o=>root.add(o));
 const chamber=new T.Group();chamber.name='UndergroundHangar';chamber.position.set(380,-120,-1250);chamber.visible=false;scene.add(chamber);
 box(chamber,180,3,240,0,0,0,dark);box(chamber,180,3,240,0,138,0,steel);box(chamber,3,140,240,-90,69,0,rock);box(chamber,3,140,240,90,69,0,rock);box(chamber,180,140,3,0,69,120,dark);
 for(const x of [-78,78]){box(chamber,12,2,224,x,62,0,steel);for(let z=-100;z<=100;z+=20){bar(chamber,V(x-6,64,z),V(x-6,67,z),.35,cyan);box(chamber,1,1,10,x,137,z,cyan);box(chamber,8,3,8,x,3,z,steel);}}
 for(let z=-100;z<=100;z+=30){box(chamber,180,4,3,0,133,z,steel);for(const x of [-1,1])bar(chamber,V(x*88,5,z),V(x*88,132,z),1.6,steel);}
 const platform=new T.Mesh(new T.CylinderGeometry(34,37,4,48),steel);platform.position.set(0,3,15);chamber.add(platform);const pad=new T.Mesh(new T.TorusGeometry(32,.45,6,80),cyan);pad.rotation.x=-Math.PI/2;pad.position.set(0,5.2,15);chamber.add(pad);
 for(const x of [-50,0,50]){box(chamber,33,1,24,x,1.8,80,roof);for(const z of [70,90])box(chamber,30,.15,.6,x,2.4,z,cyan);}
 for(const x of [-52,52]){box(chamber,55,96,.8,x,50,118,black);for(const sx of [-1,1])box(chamber,1.2,94,1,x+sx*26,50,117,cyan);for(let y=10;y<94;y+=16)box(chamber,52,.7,1,x,y,116.8,steel);}
 box(chamber,174,7,7,0,113,20,roof);box(chamber,18,10,17,0,105,20,steel);bar(chamber,V(0,101,20),V(0,65,20),.5,steel);const hook=new T.Mesh(new T.TorusGeometry(3,.65,6,16,Math.PI*1.4),steel);hook.position.set(0,63,20);chamber.add(hook);
 for(const x of [-48,48])for(let z=-95;z<40;z+=16)box(chamber,3,.08,7,x,1.8,z,cyan);
 batch(chamber);const roomLight=new T.PointLight(0x80d9ff,1.8,400,1);roomLight.position.set(380,-20,-1300);scene.add(roomLight);roomLight.visible=false;
 const outdoor=scene.children.filter(o=>o!==chamber&&o!==roomLight&&!o.isLight);
 const shots={hangar:{from:[445,-35,-1360],to:[435,-42,-1340],look:[380,-100,-1235],duration:6},island:{from:[1100,240,-2060],to:[1020,220,-1980],look:[360,35,-1150],duration:6},gate:{from:[385,20,-1580],to:[385,16,-1440],look:[380,12,-1350],duration:6},dock:{from:[970,72,-1500],to:[900,60,-1480],look:[450,30,-1240],duration:6}};let lighting='day';
 function setLighting(name){bank.setLighting(name);lighting=name;}
 function sample(shot,time){const c=shots[shot];if(!c)throw Error('Unknown base shot');bank.sample('opening',time);const inside=shot==='hangar';chamber.visible=inside;roomLight.visible=inside;for(const o of outdoor)o.visible=!inside;scene.background=inside?new T.Color(0x06111a):null;camera.position.fromArray(c.from).lerp(V(...c.to),ease(time/c.duration));camera.lookAt(V(...c.look));camera.updateMatrixWorld();bank.water.material.uniforms.eye.value.copy(camera.position);const open=ease((time-1)/3);doors[0].position.x=-23-open*39;doors[1].position.x=23+open*39;return {shot,time,lighting,gateOpen:open};}
 setLighting('day');return {scene,camera,shots,lightingOptions:['day','sunset','night','dawn'],setLighting,sample,root};
}
function build(name){if(name==='space')return buildSpace();if(name==='data_center')return buildDataCenter();if(name==='alcatraz')return buildAlcatraz();throw Error('Unknown production set '+name);}
global.ProductionSets={build};
})(window);
