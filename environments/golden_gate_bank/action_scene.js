/* Existing robot, new world-space choreography; one scene and one depth buffer. */
(function(global){'use strict';const T=global.THREE,V=(x,y,z)=>new T.Vector3(x,y,z),clamp=x=>T.MathUtils.clamp(x,0,1),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function build(bank){
 const robot=AntigravityKing.build(),rig=MechaMotionRig.build(robot),carrier=new T.Group();carrier.name='RobotFlightCarrier';carrier.rotation.order='YXZ';carrier.add(robot.root);bank.scene.add(carrier);
 const params={robotScale:4,flightLean:45};let lastMetrics={};
 const keys=[{t:0,p:[-380,45,-650]},{t:.9,p:[-250,150,-270]},{t:1.55,p:[-110,128,35]},{t:2.25,p:[-25,21,330]},{t:3.3,p:[190,12,720]},{t:4.5,p:[510,12,1110]},{t:5.25,p:[790,14,1390]},{t:6,p:[1140,38,1730]}];
 // Cubic Hermite with zero Y tangents at low-flight endpoints, no accumulated simulation state.
 function path(time){const t=T.MathUtils.clamp(time,0,6);let i=0;while(i<keys.length-2&&t>keys[i+1].t)i++;const a=keys[i],b=keys[i+1],u=clamp((t-a.t)/(b.t-a.t)),p=V(...a.p).lerp(V(...b.p),u);const before=keys[Math.max(0,i-1)],after=keys[Math.min(keys.length-1,i+2)],dt=b.t-a.t;for(const axis of [0,2]){const ma=(b.p[axis]-before.p[axis])/Math.max(.001,b.t-before.t),mb=(after.p[axis]-a.p[axis])/Math.max(.001,after.t-a.t);p.setComponent(axis,(2*u*u*u-3*u*u+1)*a.p[axis]+(u*u*u-2*u*u+u)*dt*ma+(-2*u*u*u+3*u*u)*b.p[axis]+(u*u*u-u*u)*dt*mb);}p.y=a.p[1]+(b.p[1]-a.p[1])*ease(u);return {position:p,clearance:p.y};}
 const wake=addSeaSplitWake(bank.scene,path,{width:90,depth:14,sprayHeight:26});wake.bindWater(bank.water);
 const jets=new T.Group();carrier.add(jets);const jetMat=new T.MeshBasicMaterial({color:0x85e7ef,transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false});
 for(const x of [-3.4,3.4]){const m=new T.Mesh(new T.ConeGeometry(1.2,8,5),jetMat);m.position.set(x,15,-7);m.rotation.x=Math.PI/2;jets.add(m);}
 const shots={op_final:{duration:6,lighting:'dawn'},hero_hover:{duration:5,lighting:'sunset'}};
 function sample(shot,seconds){
  const c=shots[shot];if(!c)throw Error('Unknown action shot '+shot);const time=T.MathUtils.clamp(seconds,0,c.duration);bank.sample('opening',time);bank.setLighting(c.lighting);carrier.position.set(0,0,0);carrier.rotation.set(0,0,0);carrier.scale.setScalar(1);carrier.updateMatrixWorld(true);rig.cross(4);
  carrier.scale.setScalar(params.robotScale);robot.root.rotation.set(0,0,0);jets.scale.setScalar(1);jets.children.forEach(m=>m.scale.set(1,1,.92+.08*Math.sin(time*17)));
  let w;
  if(shot==='op_final'){
   const motionTime=Math.min(6,time*wake.params.speed),p=path(motionTime),ahead=path(Math.min(6,motionTime+.04)).position.sub(p.position);if(ahead.lengthSq()<.001)ahead.copy(p.position).sub(path(Math.max(0,time*wake.params.speed-.04)).position);carrier.position.copy(p.position);
   carrier.rotation.set(.18+(params.flightLean*Math.PI/180-.18)*ease((motionTime-1.6)/1.35),Math.atan2(ahead.x,ahead.z),-.07*Math.sin(time*1.8));carrier.updateMatrixWorld(true);const low=new T.Box3().setFromObject(robot.root).min.y;if(low<6){carrier.position.y+=6-low;carrier.updateMatrixWorld(true);}
   const cam=V(850,155,1450),target=V(-30,105,0);target.lerp(carrier.position.clone().add(V(0,65,0)),ease((motionTime-3.5)/1.5)*.43);
   const shake=Math.exp(-(((motionTime-5.2)/.25)**2))*2.2;cam.x+=Math.sin(time*81)*shake;cam.y+=Math.sin(time*67)*shake;
   bank.camera.position.copy(cam);bank.camera.fov=43;bank.camera.lookAt(target);w=wake.update(time,true);
  }else{
   carrier.position.set(490,78+Math.sin(time*2)*2.5,110);carrier.rotation.set(.02,-.23,.025*Math.sin(time*1.8));
   bank.camera.position.set(840,205,670);bank.camera.fov=42;bank.camera.lookAt(550,145,0);w=wake.update(time,false);
  }
  bank.camera.updateProjectionMatrix();bank.camera.updateMatrixWorld();bank.water.material.uniforms.eye.value.copy(bank.camera.position);carrier.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(robot.root);lastMetrics={shot,time,robotScale:params.robotScale,flightLean:params.flightLean,robotPitch:carrier.rotation.x,robotPosition:carrier.position.toArray(),bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},wake:w,camera:bank.camera.position.toArray()};return lastMetrics;
 }
 function setLayer(layer){
  if(!['beauty','robot','wake','environment','bridge'].includes(layer))throw Error('Unknown action layer '+layer);
  bank.setLayer(layer==='bridge'?'bridge':layer==='environment'?'environment':'beauty');carrier.visible=layer==='beauty'||layer==='robot';wake.root.visible=(layer==='beauty'||layer==='wake')&&wake.metrics().enabled&&wake.metrics().activeSamples>1;
  if(layer==='robot'||layer==='wake'){bank.set.visible=false;bank.water.visible=false;for(const o of bank.scene.children)if(o!==carrier&&o!==wake.root&&o!==bank.set&&!o.isLight)o.visible=false;}
  else {bank.set.visible=true;for(const o of bank.scene.children)if(o!==carrier&&o!==wake.root&&o!==bank.set&&!o.isLight)o.visible=layer!=='bridge';bank.water.visible=layer!=='bridge';}
 }
 function setParams(next){if(next.flightLean!==undefined){if(!Number.isFinite(next.flightLean)||next.flightLean<0||next.flightLean>85)throw Error('Invalid flight lean');params.flightLean=next.flightLean;}if(next.robotScale!==undefined){if(!Number.isFinite(next.robotScale)||next.robotScale<=0)throw Error('Invalid robot scale');params.robotScale=next.robotScale;}wake.setParams(next);}
 return {robot,rig,carrier,wake,path,shots,params,sample,setLayer,setParams,metrics:()=>lastMetrics};
}
global.GoldenGateAction={build};
})(window);
