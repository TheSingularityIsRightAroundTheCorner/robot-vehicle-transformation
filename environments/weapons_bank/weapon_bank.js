(function(g){'use strict';
const T=THREE,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),clamp=T.MathUtils.clamp;
function build(name){
 const profile=WeaponProfiles[name];if(!profile)throw Error('Unknown weapon');
 const scene=new T.Scene(),root=new T.Group();scene.add(root);
 const solids=new T.Group(),effects=new T.Group(),guides=new T.Group();root.add(solids,effects,guides);
 solids.name='SolidProps';effects.name='Effects';guides.name='ScaleGuides';
 scene.add(new T.HemisphereLight(0xf4f7ff,0x526077,1.5));
 const key=new T.DirectionalLight(0xffffff,2);key.position.set(-3,5,6);scene.add(key);
 const rim=new T.DirectionalLight(0xabc9ed,.9);rim.position.set(4,2,-3);scene.add(rim);
 const materials=[],outlines=[],guideMat=new T.MeshBasicMaterial({color:0x636f7d,transparent:true,opacity:.32,depthWrite:false});
 let layer='beauty',outline=true,flat=false,showGuide=true,beamColor='blue',emblem=true,state=profile.defaultState,time=.65;
 function mat(color,metal=.15){const physical=new T.MeshStandardMaterial({color,metalness:metal,roughness:.47});physical.userData.flat=new T.MeshBasicMaterial({color});materials.push(physical);return physical;}
 const shell=mat(profile.colors.shell,.25),dark=mat(profile.colors.dark,.15),metal=mat(profile.colors.metal,.65),ivory=mat('#ecf2f0',.25),black=mat('#131b25'),accent=mat('#56c6ff');
 const lineMat=new T.LineBasicMaterial({color:0x17212d,transparent:true,opacity:.83});
 function mesh(parent,geometry,material,position=[0,0,0],edge=true){const m=new T.Mesh(geometry,material);m.position.set(...position);m.userData.original=material;parent.add(m);if(edge){const lines=new T.LineSegments(new T.EdgesGeometry(geometry,28),lineMat);lines.userData.outline=true;m.add(lines);outlines.push(lines);}return m;}
 function box(parent,size,material,position=[0,0,0],edge=true){return mesh(parent,new T.BoxGeometry(...size),material,position,edge);}
 function cylinder(parent,r0,r1,length,material,position=[0,0,0],segments=24){return mesh(parent,new T.CylinderGeometry(r0,r1,length,segments),material,position);}
 function poly(parent,points,depth,material,z=0,bevel=.005){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,steps:1,curveSegments:16});return mesh(parent,geo,material,[0,0,z]);}
 function tube(parent,points,r,material,closed=false,edge=false){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(24,points.length*8),r,6,closed),material,[0,0,0],edge);}
 function segment(parent,a,b,r,material,edge=false){const d=b.clone().sub(a);const m=mesh(parent,new T.CylinderGeometry(r,r,1,8),material,a.clone().add(b).multiplyScalar(.5).toArray(),edge);m.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());m.scale.y=d.length();return m;}
 function guide(parent,pos=[0,0,0]){const group=new T.Group();parent.add(group);group.position.set(...pos);const arm=mesh(group,new T.CylinderGeometry(.037,.05,.28,12),guideMat,[0,-.20,0],false);const palm=mesh(group,new T.SphereGeometry(1,16,12),guideMat,[0,-.005,0],false);palm.scale.set(.047,.075,.027);for(let i=0;i<4;i++){const finger=mesh(group,new T.CapsuleGeometry(.011,.04,3,6),guideMat,[(i-1.5)*.022,.052,.006],false);finger.rotation.x=1.0;}const thumb=mesh(group,new T.CapsuleGeometry(.014,.045,3,6),guideMat,[-.045,.002,.012],false);thumb.rotation.z=-.6;return group;}
 function effectMat(color,opacity=1){return new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide});}
 function glowPoint(parent,pos,color,r=.025){const core=mesh(parent,new T.SphereGeometry(r,12,8),effectMat(color),pos,false);mesh(core,new T.SphereGeometry(r*2.2,12,8),effectMat(color,.12),[0,0,0],false);return core;}
 const dynamic={};let sampler,framing;
 if(name==='gemini'){
  const bladeGroups=[],grips=[],hands=[];
  const beamSkin=effectMat(profile.beamColors.blue,.48),beamHalo=effectMat(profile.beamColors.blue,.12);
  function sword(index){const solid=new T.Group(),fx=new T.Group();solids.add(solid);effects.add(fx);grips.push(solid);bladeGroups.push(fx);
   // Black grip and pommel; retain the silver sleeve with one recessed sparkle.
   const gripProfile=[new T.Vector2(0,.020),new T.Vector2(.022,.020)];
   for(let i=0;i<6;i++){const y=.030+i*.022;gripProfile.push(new T.Vector2(.022,y),new T.Vector2(.0205,y+.002),new T.Vector2(.0205,y+.004),new T.Vector2(.022,y+.006));}
   gripProfile.push(new T.Vector2(.022,.171),new T.Vector2(0,.171));mesh(solid,new T.LatheGeometry(gripProfile,32),black,[0,0,0],false);
   cylinder(solid,.025,.025,.025,black,[0,.012,0]);
   // Leave a front opening in the silver upper sleeve for a cut face and floor.
   mesh(solid,new T.CylinderGeometry(.030,.030,.072,32,1,false,.62,Math.PI*2-1.24),metal,[0,.205,0],false);
   const half=.030*Math.sin(.62),faceZ=.030*Math.cos(.62),face=new T.Shape();face.moveTo(-half,-.036);face.lineTo(half,-.036);face.lineTo(half,.036);face.lineTo(-half,.036);face.closePath();
   const sparkle=new T.Path();sparkle.moveTo(0,.023);sparkle.quadraticCurveTo(.002,.003,.012,0);sparkle.quadraticCurveTo(.002,-.003,0,-.023);sparkle.quadraticCurveTo(-.002,-.003,-.012,0);sparkle.quadraticCurveTo(-.002,.003,0,.023);sparkle.closePath();face.holes.push(sparkle);
   const front=mesh(solid,new T.ExtrudeGeometry(face,{depth:.002,bevelEnabled:true,bevelSize:.0004,bevelThickness:.0004,bevelSegments:1,curveSegments:10}),metal,[0,.205,faceZ-.002],false);front.name='SparkleCutFace';
   const floor=mesh(solid,new T.PlaneGeometry(half*2,.072),mat('#65717e',.4),[0,.205,faceZ-.0048],false);floor.name='SparkleRecessFloor';
   cylinder(solid,.031,.030,.008,metal,[0,.243,0]);
   cylinder(solid,.014,.014,.004,black,[0,.249,0]);
   const core=cylinder(fx,.006,.010,.925,effectMat('#f3ffff'),[0,.715,0],24);core.userData.beam=true;
   const skin=cylinder(fx,.015,.015,.925,beamSkin,[0,.715,0],24);
   const halo=cylinder(fx,.027,.027,.925,beamHalo,[0,.715,0],24);
   const tip=mesh(fx,new T.SphereGeometry(.015,16,8),beamSkin,[0,1.178,0],false);tip.scale.y=1.8;
   fx.userData.segments=[skin,halo,tip];
   hands.push(guide(guides,[index? .19:-.19,.11,-.035]));
  }sword(0);sword(1);
  sampler=(s,t)=>{const docked=s==='docked';for(let i=0;i<2;i++){const sign=i?1:-1,position=docked?V():V(sign*.19,-.56,0),rot=docked?(i?Math.PI:0):sign*-.07;grips[i].position.copy(position);grips[i].rotation.z=rot;bladeGroups[i].position.copy(position);bladeGroups[i].rotation.z=rot;bladeGroups[i].visible=s!=='hilts';hands[i].visible=!docked;hands[i].position.set(sign*.19,-.46,-.055);const col=profile.beamColors[beamColor]||profile.beamColors.blue;bladeGroups[i].userData.segments.forEach(m=>m.material.color.set(col));}return {target:s==='hilts'?[0,-.46,0]:[0,0,0],span:s==='hilts'?.85:docked?2.75:1.7};};
 }
 if(name==='claude'){
  // A hollow forearm-length case. Full-length claws slide through three real ports.
  const cowl=new T.Group();cowl.name='ForearmCage';solids.add(cowl);
  box(cowl,[.19,.47,.022],shell,[0,-.035,.140]);
  box(cowl,[.190,.47,.012],dark,[0,-.035,.033]);
  for(const x of [-.087,.087]){
   box(cowl,[.018,.47,.104],shell,[x,-.035,.087]);
   box(cowl,[.014,.47,.012],dark,[x,-.035,.151]);
   box(cowl,[.015,.47,.016],dark,[x,-.035,.029]);
  }
  box(cowl,[.19,.018,.122],dark,[0,-.269,.089]);
  // Project the same angular port profiles forward; keep their rear seat fixed.
  const portFront=.212+profile.dimensions.portProjection,portDepth=.025+profile.dimensions.portProjection;
  const clawLength=profile.dimensions.claw,clawHome=.187-clawLength,clawTravel=portFront-clawHome;
  for(const x of [-.061,0,.061]){
   const shape=new T.Shape();const outer=[[-.031,-.049],[.031,-.049],[.031,.032],[.021,.045],[-.021,.045],[-.031,.032]];
   outer.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();
   const hole=new T.Path();[[-.024,-.033],[.024,-.033],[.024,.020],[.017,.029],[-.017,.029],[-.024,.020]].forEach(([a,b],i)=>i?hole.lineTo(a,b):hole.moveTo(a,b));hole.closePath();shape.holes.push(hole);
   const port=mesh(cowl,new T.ExtrudeGeometry(shape,{depth:portDepth,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1}),dark,[x,portFront,.09]);port.rotation.x=Math.PI/2;port.name='ClawExitPort';
  }
  // Three independent straps: wrist, middle forearm and rear forearm.
  const straps=new T.Group();straps.name='ThreeForearmStraps';cowl.add(straps);
  for(const y of [.055,-.090,-.235]){
   const strap=new T.Group();straps.add(strap);strap.position.y=y;
   for(const x of [-.067,.067])box(strap,[.014,.032,.125],black,[x,0,-.026]);
   box(strap,[.148,.032,.013],black,[0,0,-.087]);
   box(strap,[.148,.032,.014],black,[0,0,.035]);
   box(strap,[.009,.043,.041],metal,[.078,0,-.031]);
   box(strap,[.011,.023,.022],dark,[.084,0,-.031]);
  }
  // Rigid palm crossbar: the load is carried by the cage and all three straps.
  for(const x of [-.073,.073])box(cowl,[.015,.028,.095],dark,[x,.161,-.005]);
  const grip=cylinder(cowl,.015,.015,.146,black,[0,.161,-.049],12);grip.rotation.z=Math.PI/2;grip.name='PalmGrip';
  for(const x of [-.05,-.025,0,.025,.05]){const ring=cylinder(cowl,.0155,.0155,.003,dark,[x,.161,-.049],12);ring.rotation.z=Math.PI/2;}
  // Small gauge on the side so the red top stays broad and heavy.
  box(cowl,[.006,.255,.034],black,[.100,-.060,.080]);const cells=[];
  for(let i=0;i<10;i++)cells.push(box(cowl,[.004,.018,.022],mat('#e7e6d9'),[.105,.045-i*.023,.080],false));
  const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=48;const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#e7eef2';ctx.font='bold 25px sans-serif';ctx.textAlign='center';ctx.fillText('SESSION LIMIT',128,34);
  const label=mesh(cowl,new T.PlaneGeometry(.10,.017),new T.MeshBasicMaterial({map:new T.CanvasTexture(labelCanvas),transparent:true,depthWrite:false}),[.102,-.06,.113],false);label.rotation.set(0,Math.PI/2,Math.PI/2);
  const blades=[],glows=[],bladeMat=mat('#f4f9ff',.5);
  for(const x of [-.061,0,.061]){
   const positions=[],idx=[],rings=[[0,.020,.008,0],[.23,.020,.007,0],[.30,.013,.006,-.005],[.36,.0005,.0005,-.022]];
   rings.forEach(([baseY,w,d,z],i)=>{const y=baseY*clawLength/.36;positions.push(-w,y,z,0,y,z+d,w,y,z,0,y,z-d);if(i)for(let k=0;k<4;k++){const a=(i-1)*4+k,b=(i-1)*4+(k+1)%4;idx.push(a,b,a+4,b,b+4,a+4);}});idx.push(0,2,1,0,3,2,12,13,14,12,14,15);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(idx);geo.computeVertexNormals();
   const m=mesh(solids,geo,bladeMat,[x,portFront,.09]);m.name='SlidingClaw';blades.push(m);
   const glow=mesh(effects,geo,effectMat('#f4f9ff',.12),[x,portFront,.09],false);glow.scale.set(1.16,1,1.16);glows.push(glow);
  }
  guide(guides,[0,.12,-.033]);
  sampler=(s,t)=>{const extension=s==='retracted'?0:clamp(t/.28,0,1),y=clawHome+extension*clawTravel;
   const color='#f4f9ff';bladeMat.color.set(color);bladeMat.userData.flat.color.set(color);
   blades.forEach((m,i)=>{m.position.y=y;glows[i].position.y=y;glows[i].visible=extension>0;glows[i].material.color.set(color);});
   const filled=s==='complete'?10:s==='drawn'?7:2;cells.forEach((m,i)=>{const col=i<filled?(s==='complete'?'#f5f4ed':i<7?'#f8b455':'#e6574b'):'#343f49';m.userData.original.color.set(col);m.userData.original.userData.flat.color.set(col);});
   return {target:[0,.15,.015],span:1.24};};
 }
 if(name==='gpt'){
  const carrier=new T.Group(),fxCarrier=new T.Group();solids.add(carrier);effects.add(fxCarrier);
  const hex=[[0,.55],[.30,.36],[.30,-.36],[0,-.55],[-.30,-.36],[-.30,.36]];
  poly(carrier,hex,.045,metal,-.022,.012);
  poly(carrier,hex.map(([x,y])=>[x*.88,y*.90]),.006,dark,-.032,.003);
  const motif=new T.Group();carrier.add(motif);dynamic.motif=motif;
  // Real recessed cuts: a front plate with a symbol-shaped hole and raised islands.
  // The recessed floor and bevel walls sit below the unchanged metal face plane.
  const loops=ShieldEngravingContours.map(loop=>loop.map(([x,y])=>[x*.415,y*.51]));
  const area=pts=>Math.abs(pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p[0]*q[1]-q[0]*p[1];},0));loops.sort((a,b)=>area(b)-area(a));
  function pathShape(points,curved=false){const shape=new T.Shape();if(curved){const pts=points.slice(0,-1);const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];shape.moveTo(...mid(pts[pts.length-1],pts[0]));for(let i=0;i<pts.length;i++){const p=pts[i],q=mid(p,pts[(i+1)%pts.length]);shape.quadraticCurveTo(...p,...q);}}else points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return shape;}
  function plate(shape){const geo=new T.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:true,bevelSize:.0013,bevelThickness:.0013,bevelSegments:2,curveSegments:3,steps:1});return mesh(motif,geo,shell,[0,0,.036],false);}
  const outer=hex.map(([x,y])=>[x*.90,y*.92]),slotOuter=hex.map(([x,y])=>[x*.809,y*.849]),slotInner=hex.map(([x,y])=>[x*.791,y*.831]);
  const grooveFloor=mat('#4e5968',.25);mesh(motif,new T.ShapeGeometry(pathShape(outer)),grooveFloor,[0,0,.0354],false);
  const rimShape=pathShape(outer);rimShape.holes.push(pathShape(slotOuter));plate(rimShape);
  const mainFace=pathShape(slotInner);mainFace.holes.push(pathShape(loops[0],true));plate(mainFace);
  for(const island of loops.slice(1))plate(pathShape(island,true));
  dynamic.grooveDepth=.0089;
  for(const x of [-.10,.10])tube(carrier,[V(x,-.12,-.036),V(x,-.10,-.105),V(x,.10,-.105),V(x,.12,-.036)],.013,dark);
  for(const x of [-.10,.10])for(const y of [-.12,.12])box(carrier,[.050,.030,.012],metal,[x,y,-.039]);
  const hand=guide(guides,[0,.02,-.13]);hand.rotation.z=-.25;
  const path=[V(-1.30,-.40,0),V(-.75,.67,-.04),V(-.10,.22,.12),V(.63,.74,0),V(1.30,-.28,.06),V(.40,-.60,0)];
  const constellation=new T.Group();effects.add(constellation);path.forEach(p=>glowPoint(constellation,p.toArray(),'#fcf5bf',.025));
  const trails=[];for(let i=0;i<path.length-1;i++){const a=segment(constellation,path[i],path[i+1],.006,effectMat('#e8ffea'));const halo=segment(constellation,path[i],path[i+1],.022,effectMat('#91ebbf',.14));trails.push([a,halo]);}
  const tilesGroup=new T.Group();solids.add(tilesGroup);const tileEffects=new T.Group();effects.add(tileEffects);
  const axes=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)axes.push([q,r]);
  const tileRadius=.18,points=Array.from({length:6},(_,i)=>[Math.sin(i*Math.PI/3)*tileRadius,Math.cos(i*Math.PI/3)*tileRadius]);
  const tileShape=new T.Shape();points.forEach(([x,y],i)=>i?tileShape.lineTo(x,y):tileShape.moveTo(x,y));tileShape.closePath();
  const tileGeo=new T.ExtrudeGeometry(tileShape,{depth:.025,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1});
  const tiles=new T.InstancedMesh(tileGeo,metal,axes.length),insets=new T.InstancedMesh(tileGeo,shell,axes.length);tiles.userData.original=metal;insets.userData.original=shell;tilesGroup.add(tiles,insets);
  const tileEdges=axes.map(()=>{const l=new T.LineSegments(new T.EdgesGeometry(tileGeo,25),lineMat);l.userData.outline=true;tilesGroup.add(l);outlines.push(l);return l;});
  const sphereField=mesh(tileEffects,new T.SphereGeometry(.53,40,24),effectMat('#c7e9fb',.13),[0,0,0],false);
  const markers=new T.Group();guides.add(markers);for(let i=0;i<4;i++){const ball=mesh(markers,new T.SphereGeometry(.08,12,8),guideMat,[Math.cos(i*2.4)*.20,Math.sin(i*2.4)*.20,Math.sin(i)*.12],false);}
  const targetQ=new T.Quaternion(),identity=new T.Quaternion(),dummy=new T.Object3D();
  sampler=(s,t)=>{carrier.visible=s==='held'||s==='thrown';constellation.visible=s==='thrown';tilesGroup.visible=s==='wall'||s==='sphere';tileEffects.visible=s==='sphere';hand.visible=s==='held';markers.visible=s==='sphere';motif.visible=emblem;
   carrier.position.set(0,0,0);carrier.rotation.set(0,0,0);
   if(s==='thrown'){const u=clamp(t,0,.999999)*(path.length-1),i=Math.floor(u),f=u-i;carrier.position.lerpVectors(path[i],path[i+1],f);carrier.rotation.set(.1*Math.sin(t*12),.16*Math.sin(t*8),t*Math.PI*10);trails.forEach(([line,halo],k)=>{const fraction=clamp(u-k,0,1),a=path[k],b=path[k+1],end=a.clone().lerp(b,fraction);for(const m of [line,halo]){m.visible=fraction>0;m.position.copy(a).add(end).multiplyScalar(.5);m.scale.y=Math.max(.00001,a.distanceTo(end));}});}
   const fold=s==='sphere'?T.MathUtils.smoothstep(t,0,1):0;
   axes.forEach(([q,r],i)=>{const wall=V(Math.sqrt(3)*tileRadius*(q+r/2),1.5*tileRadius*r,0),y=1-2*(i+.5)/axes.length,a=i*Math.PI*(3-Math.sqrt(5)),rad=Math.sqrt(1-y*y),normal=V(Math.cos(a)*rad,y,Math.sin(a)*rad),orb=normal.clone().multiplyScalar(.54);targetQ.setFromUnitVectors(V(0,0,1),normal);dummy.position.copy(wall).lerp(orb,fold);dummy.quaternion.copy(identity).slerp(targetQ,fold);dummy.scale.set(1,1,1);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);tileEdges[i].position.copy(dummy.position);tileEdges[i].quaternion.copy(dummy.quaternion);dummy.position.addScaledVector(V(0,0,1).applyQuaternion(dummy.quaternion),.031);dummy.scale.set(.86,.86,.20);dummy.updateMatrix();insets.setMatrixAt(i,dummy.matrix);});tiles.instanceMatrix.needsUpdate=true;insets.instanceMatrix.needsUpdate=true;sphereField.scale.setScalar(Math.max(.02,fold));return {target:[0,0,0],span:s==='thrown'?3.7:s==='wall'||(s==='sphere'&&t<.85)?2.65:s==='sphere'?1.55:1.6};};
 }
 function applyDisplay(){solids.visible=layer!=='guide';effects.visible=layer==='beauty'||layer==='effects';guides.visible=showGuide&&(layer==='beauty'||layer==='guide');solids.traverse(o=>{if(!o.isMesh)return;const original=o.userData.original;if(!original)return;o.material=flat&&original.userData.flat?original.userData.flat:original;o.material.colorWrite=layer!=='effects';o.renderOrder=layer==='effects'?-10:0;});for(const l of outlines){let inEffects=false;for(let p=l.parent;p;p=p.parent)if(p===effects)inEffects=true;l.visible=outline&&layer!=='effects'&&!inEffects;}}
 function sample(nextState=state,progress=time){if(!profile.states.includes(nextState))throw Error('Unknown state');state=nextState;time=clamp(progress,0,1);framing=sampler(state,time);applyDisplay();return framing;}
 sample();
 return {scene,root,solids,effects,guides,profile,sample,getFrame:()=>framing,getState:()=>state,
 setLayer:v=>{if(!['beauty','solid','effects','guide'].includes(v))throw Error('Unknown layer');layer=v;applyDisplay();},
 setOutline:v=>{outline=v;applyDisplay();},setFlat:v=>{flat=v;applyDisplay();},setGuide:v=>{showGuide=v;applyDisplay();},
 setBeamColor:v=>{beamColor=v;sample();},setEmblem:v=>{emblem=v;sample();},
 getLayer:()=>layer};
}
g.WeaponsBank={build};
})(window);
