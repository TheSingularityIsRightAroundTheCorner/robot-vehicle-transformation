/* Reusable, deterministic cel-style sea split. Positions are in the scene's world units. */
(function(global){'use strict';const T=global.THREE,MAX=32;
function addSeaSplitWake(scene,path,options={}){
 const params=Object.assign({speed:1,width:90,depth:14,sprayHeight:26,trailSeconds:2.1,waterLevel:0},options);
 const root=new T.Group();root.name='SeaSplitWake';scene.add(root);
 const points=Array.from({length:MAX},()=>new T.Vector3(0,0,0));
 const materials={floor:new T.MeshBasicMaterial({color:0x07506a,side:T.DoubleSide}),wall:new T.MeshBasicMaterial({color:0x4eb6c4,side:T.DoubleSide}),foam:new T.MeshBasicMaterial({color:0xd8faf2,side:T.DoubleSide}),crest:new T.MeshBasicMaterial({color:0x8fe2e1,side:T.DoubleSide})};
 const geometries=[];
 function ribbon(material){const g=new T.BufferGeometry();const a=new Float32Array((MAX-1)*6*3);g.setAttribute('position',new T.BufferAttribute(a,3));const mesh=new T.Mesh(g,material);mesh.frustumCulled=false;root.add(mesh);geometries.push(g);return mesh;}
 const floor=ribbon(materials.floor),walls=[ribbon(materials.wall),ribbon(materials.wall)],foam=[ribbon(materials.foam),ribbon(materials.foam)],inner=[ribbon(materials.crest),ribbon(materials.crest)];
 const shardGeo=new T.BufferGeometry();shardGeo.setAttribute('position',new T.Float32BufferAttribute([-.5,0,0,.5,0,0,.1,1,0],3));
 const shards=new T.InstancedMesh(shardGeo,materials.foam,72);shards.frustumCulled=false;root.add(shards);const matrix=new T.Matrix4(),quat=new T.Quaternion();
 const uniforms={wakePoints:{value:points},wakeWidth:{value:params.width},wakeOn:{value:0}};
 let visible=true,lastMetrics={},boundWater=null,originalWaterShader=null;
 function bindWater(water){
  if(boundWater)throw Error('Wake already bound to water');boundWater=water;originalWaterShader=water.material.fragmentShader;
  Object.assign(water.material.uniforms,uniforms);
  water.material.fragmentShader=water.material.fragmentShader.replace('void main(){',`uniform vec3 wakePoints[${MAX}];uniform float wakeWidth,wakeOn;void main(){`);
  water.material.fragmentShader=water.material.fragmentShader.replace('gl_FragColor=vec4(c,1.);',`float gap=100000.;for(int i=0;i<${MAX-1};i++){vec3 a=wakePoints[i],b=wakePoints[i+1];vec2 ab=b.xy-a.xy;float raw=dot(world.xz-a.xy,ab)/max(dot(ab,ab),.001);float u=clamp(raw,0.,1.);float strength=mix(a.z,b.z,u);float age=(float(i)+u)/float(${MAX-1});float width=wakeWidth*.5*strength*(.76+.24*age)*.72;gap=min(gap,(raw>=0.&&raw<=1.)?length(world.xz-mix(a.xy,b.xy,u))-width:100000.);}if(wakeOn>.5&&gap<0.)discard;gl_FragColor=vec4(c,1.);`);
  water.material.needsUpdate=true;
 }
 const clamp=x=>T.MathUtils.clamp(x,0,1),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 function update(seconds,enabled=true){
  const time=seconds*params.speed,rows=[];let active=0;
  for(let i=0;i<MAX;i++){
   const age=i/(MAX-1),t=Math.max(0,time-age*params.trailSeconds),p=path(t),next=path(t+.02),d=next.position.clone().sub(p.position);d.y=0;if(d.lengthSq()<.001)d.set(0,0,1);d.normalize();const side=new T.Vector3(d.z,0,-d.x);
   const height=p.clearance===undefined?p.position.y:p.clearance;
   const strength=(1-ease((height-20)/50))*ease(t/.22)*(1-ease((age-.76)/.24));
   points[i].set(p.position.x,p.position.z,strength);if(strength>.03)active++;
   rows.push({p:p.position,side,age,strength,width:params.width*.5*strength*(.76+.24*age)});
  }
  function edge(row,side,kind,outer=false){const s=row.strength,half=row.width;let offset=half,y=params.waterLevel;
   if(kind==='floor'){y-=params.depth*s;offset*=.72;}
   if(kind==='wall'){if(outer){offset+=params.width*.10*s;y+=params.sprayHeight*s*(.62+.38*Math.sin(row.age*25-time*6+side)**2);}else{offset*=.72;y-=params.depth*s;}}
   if(kind==='foam'){offset+=(outer?params.width*.18:params.width*.10)*s;y+=params.sprayHeight*s*(.62+.38*Math.sin(row.age*25-time*6+side)**2)+(outer?-.7:.2);}
   if(kind==='inner'){offset+=(outer?4:0)*s;y+=.4;}
   return new T.Vector3(row.p.x+row.side.x*offset*side,y,row.p.z+row.side.z*offset*side);
  }
  function fill(mesh,left,right){const a=mesh.geometry.attributes.position;let n=0;for(let i=0;i<MAX-1;i++){const verts=[left(rows[i]),right(rows[i]),left(rows[i+1]),right(rows[i]),right(rows[i+1]),left(rows[i+1])];for(const v of verts)a.setXYZ(n++,v.x,v.y,v.z);}a.needsUpdate=true;}
  fill(floor,r=>edge(r,-1,'floor'),r=>edge(r,1,'floor'));
  [-1,1].forEach((side,k)=>{fill(walls[k],r=>edge(r,side,'wall'),r=>edge(r,side,'wall',true));fill(foam[k],r=>edge(r,side,'foam'),r=>edge(r,side,'foam',true));fill(inner[k],r=>edge(r,side,'inner'),r=>edge(r,side,'inner',true));});
  for(let i=0;i<72;i++){
   const side=i%2?1:-1,cycle=((i*.61803398875+time*.67)%1+1)%1,row=rows[Math.min(MAX-1,Math.floor(cycle*(MAX-1)))];
   const p=edge(row,side,'wall',true);p.y+=Math.sin(cycle*Math.PI)*params.sprayHeight*.65*row.strength;p.addScaledVector(row.side,side*cycle*8*row.strength);
   quat.setFromEuler(new T.Euler(0,Math.atan2(row.side.x,row.side.z),side*.5));const size=(2+((i*7)%5))*row.strength;matrix.compose(p,quat,new T.Vector3(size,size*2.4,1));shards.setMatrixAt(i,matrix);
  }shards.instanceMatrix.needsUpdate=true;root.visible=visible&&enabled&&active>1;uniforms.wakeWidth.value=params.width;uniforms.wakeOn.value=enabled&&active>1?1:0;
  lastMetrics={enabled,activeSamples:active,time,width:params.width,depth:params.depth,sprayHeight:params.sprayHeight};return lastMetrics;
 }
 function setParams(next){for(const k of ['speed','width','depth','sprayHeight','trailSeconds'])if(next[k]!==undefined){if(!Number.isFinite(next[k])||next[k]<0||(['speed','trailSeconds'].includes(k)&&next[k]===0))throw Error('Invalid wake parameter '+k);params[k]=next[k];}}
 return {root,params,uniforms,bindWater,update,setParams,setVisible:on=>{visible=on;root.visible=on;},metrics:()=>lastMetrics,dispose:()=>{uniforms.wakeOn.value=0;if(boundWater){boundWater.material.fragmentShader=originalWaterShader;for(const key of Object.keys(uniforms))delete boundWater.material.uniforms[key];boundWater.material.needsUpdate=true;}root.removeFromParent();geometries.forEach(g=>g.dispose());shardGeo.dispose();Object.values(materials).forEach(m=>m.dispose());}};
}
global.addSeaSplitWake=addSeaSplitWake;
})(window);
