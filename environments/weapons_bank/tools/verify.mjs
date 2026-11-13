// Dedicated temporary renderer only. No personal browsing sessions.
const mode=Deno.args[0]||'stills',out=Deno.args[1]||'review';await Deno.mkdir(out,{recursive:true});const tabs=await(await fetch('http://127.0.0.1:9237/json')).json(),page=tabs.find(t=>t.type==='page'&&(t.url==='about:blank'||(t.url.startsWith('http://127.0.0.1:8793/helmet_prototype/')||t.url.startsWith('http://127.0.0.1:8793/weapons_bank/'))));if(!page)throw Error('No isolated render tab');const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;let navStamp=Infinity;const pending=new Map(),errors=[];ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown'&&d.params.timestamp>=navStamp)errors.push(d.params);if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params);if(pending.has(d.id)){pending.get(d.id)(d);pending.delete(d.id);}};async function send(method,params={}){const key=++id,p=new Promise(r=>pending.set(key,r));ws.send(JSON.stringify({id:key,method,params}));const d=await p;if(d.error)throw Error(JSON.stringify(d.error));return d.result;}async function ev(expression){const d=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(d.exceptionDetails)throw Error(JSON.stringify(d.exceptionDetails));return d.result.value;}
await send('Runtime.enable');await send('Page.enable');const url='http://127.0.0.1:8793/weapons_bank/index.html?capture='+Date.now();navStamp=Date.now();await send('Page.navigate',{url});let ready=false;for(let i=0;i<100;i++){if(await ev('location.href==='+JSON.stringify(url)+'&&Boolean(window.WeaponsLab)')){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(JSON.stringify(errors));await ev('WeaponsLab.stop()');const records=[];
async function capture(name,config){const result=await ev(`(()=>{const m=WeaponsLab.render(${JSON.stringify(config)});return {metrics:m,png:WeaponsLab.renderer.domElement.toDataURL()};})()`);await Deno.writeFile(out+'/'+name+'.png',Uint8Array.from(atob(result.png.split(',')[1]),c=>c.charCodeAt(0)));records.push({name,...result.metrics});}

const result=await ev(`(()=>{
 const L=WeaponsLab,T=THREE,checks={};
 L.render({weapon:'claude',state:'retracted',progress:0,guide:false,layer:'solid',width:640,height:360,alpha:true});
 const root=L.current.root;root.updateMatrixWorld(true);const claws=[];root.traverse(o=>{if(o.name==='SlidingClaw')claws.push(o)});
 const boxes=claws.map(o=>new T.Box3().setFromObject(o));
 checks.threeStraps=root.getObjectByName('ThreeForearmStraps').children.length===3;
 checks.palmGrip=Boolean(root.getObjectByName('PalmGrip'));
 const ports=[];root.traverse(o=>{if(o.name==='ClawExitPort')ports.push(o);});
 checks.projectedPorts=ports.length===3&&ports.every(o=>{const b=new T.Box3().setFromObject(o);return b.max.y>.25&&b.min.y<.19;});
 checks.clawsStored=boxes.every(b=>b.min.y>-.26&&b.max.y<.19&&b.min.z>.04&&b.max.z<.13&&b.min.x>-.085&&b.max.x<.085);
 const sizes=boxes.map(b=>b.getSize(new T.Vector3()).toArray());L.current.sample('drawn',1);root.updateMatrixWorld(true);
 checks.rigidClaws=claws.every((o,i)=>new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray().every((v,k)=>Math.abs(v-sizes[i][k])<1e-7));
 checks.transparentLayers=[];for(const [weapon,state,layer] of [['gemini','twin','solid'],['gemini','twin','effects'],['gpt','thrown','effects'],['claude','drawn','solid']]){
  L.render({weapon,state,layer,guide:false,progress:.65,width:640,height:360,alpha:true});const gl=L.renderer.getContext(),pixels=new Uint8Array(640*360*4);gl.readPixels(0,0,640,360,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let clear=0,ink=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)clear++;else ink++;}checks.transparentLayers.push({weapon,layer,clear,ink,pass:clear>640*360*.5&&ink>30});
 }
 L.render({weapon:'gemini',state:'hilts',layer:'solid'});const faces=[],floors=[];L.current.root.traverse(o=>{if(o.name==='SparkleCutFace')faces.push(o);if(o.name==='SparkleRecessFloor')floors.push(o);});checks.sparkleRecesses=faces.length===2&&floors.length===2&&floors.every((o,i)=>o.position.z<faces[i].position.z);
 checks.beamModes=[];for(const beam of ['red','yellow','green','blue']){
  L.render({weapon:'gemini',state:'twin',beam,layer:'effects'});const colours=[];L.current.effects.traverse(o=>{if(o.isMesh&&o.material.opacity<1)colours.push(o.material.color.getHexString());});checks.beamModes.push({beam,singleColour:new Set(colours).size===1});
 }
 return checks;
})()`);
if(!result.projectedPorts||!result.sparkleRecesses||!result.threeStraps||!result.palmGrip||!result.clawsStored||!result.rigidClaws||result.transparentLayers.some(x=>!x.pass)||result.beamModes.some(x=>!x.singleColour)||errors.length)throw Error(JSON.stringify({result,errors}));
await Deno.writeTextFile(out+'/design_checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));ws.close();
