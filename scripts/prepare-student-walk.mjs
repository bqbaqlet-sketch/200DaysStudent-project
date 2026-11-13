import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(project,'assets/characters/students');fs.mkdirSync(out,{recursive:true});
const asset=JSON.parse(fs.readFileSync(path.join(project,'assets/characters/nvp-teacher/nvp-asset.json'),'utf8'));
const root=new THREE.Group(),objects=asset.nodes.map(n=>{const o=new THREE.Bone();o.name=n.name;if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
asset.nodes.forEach((n,i)=>n.children?.forEach(c=>objects[i].add(objects[c])));asset.roots.forEach(i=>root.add(objects[i]));root.updateMatrixWorld(true);
const decode=s=>new Float32Array(Uint8Array.from(Buffer.from(s,'base64')).buffer),inverses=decode(asset.inverseBind);
const skeleton=new THREE.Skeleton(asset.skin.joints.map(i=>objects[i]),asset.skin.joints.map((_,i)=>new THREE.Matrix4().fromArray(inverses,i*16)));skeleton.pose();root.updateMatrixWorld(true);
const names=Object.fromEntries(asset.skin.joints.map(i=>[asset.nodes[i].name,objects[i]])),base=objects.map(o=>({position:o.position.clone(),quaternion:o.quaternion.clone(),scale:o.scale.clone()}));
const bind=Object.fromEntries(Object.entries(names).map(([n,o])=>[n,{position:o.getWorldPosition(new THREE.Vector3()),quaternion:o.getWorldQuaternion(new THREE.Quaternion())}]));
const source=asset.animations[1],samplers=source.tracks.map(t=>({node:objects[t.node],path:t.path,interpolant:(t.path==='rotation'?new THREE.QuaternionKeyframeTrack('a',decode(t.times),decode(t.values)):new THREE.VectorKeyframeTrack('a',decode(t.times),decode(t.values))).createInterpolant()}));
const hipTrack=samplers.find(t=>t.node===names.Hips&&t.path==='translation'),first=hipTrack.interpolant.evaluate(0)[2],last=hipTrack.interpolant.evaluate(source.duration)[2],stride=last-first;
const sides=['Right','Left']; // Native Right is negative X, matching the legacy L limb.
const relative=(child,parent)=>parent.clone().invert().multiply(child);
const spineBind=relative(bind.Spine2.quaternion,bind.Hips.quaternion),headBind=relative(bind.Head.quaternion,bind.Spine2.quaternion);
const records=[],footMin=[Infinity,Infinity],footMean=[0,0],frames=64;
for(let f=0;f<=frames;f++){
 objects.forEach((o,i)=>{o.position.copy(base[i].position);o.quaternion.copy(base[i].quaternion);o.scale.copy(base[i].scale);});
 for(const s of samplers){const value=s.interpolant.evaluate(f/frames*source.duration);if(s.path==='rotation')s.node.quaternion.fromArray(value);else if(s.path==='translation')s.node.position.fromArray(value);else s.node.scale.fromArray(value);}
 names.Hips.position.z-=f/frames*stride;root.updateMatrixWorld(true);
 const hip=names.Hips.getWorldPosition(new THREE.Vector3()),hq=names.Hips.getWorldQuaternion(new THREE.Quaternion()),sq=names.Spine2.getWorldQuaternion(new THREE.Quaternion()),headq=names.Head.getWorldQuaternion(new THREE.Quaternion());
 const record=[...hip.toArray(),...hq.clone().multiply(bind.Hips.quaternion.clone().invert()).toArray(),...relative(sq,hq).multiply(spineBind.clone().invert()).toArray(),...relative(headq,sq).multiply(headBind.clone().invert()).toArray()];
 sides.forEach((side,i)=>{
  const foot=names[side+'Foot'].getWorldPosition(new THREE.Vector3()),q=names[side+'Foot'].getWorldQuaternion(new THREE.Quaternion()).multiply(bind[side+'Foot'].quaternion.clone().invert());
  record.push(...foot.toArray(),...q.toArray());footMin[i]=Math.min(footMin[i],foot.y);footMean[i]+=foot.z/(frames+1);
 });
 sides.forEach(side=>record.push(...names[side+'Hand'].getWorldPosition(new THREE.Vector3()).sub(names[side+'Arm'].getWorldPosition(new THREE.Vector3())).toArray()));
 records.push(...record);
}
const reference=sides.map((side,i)=>({footMin:footMin[i],footZ:footMean[i],footX:bind[side+'Foot'].position.x,thighY:bind[side+'UpLeg'].position.y-bind.Hips.position.y,legLength:names[side+'Leg'].position.length()+names[side+'Foot'].position.length(),armLength:names[side+'ForeArm'].position.length()+names[side+'Hand'].position.length()}));
const data=Float32Array.from(records),motion={source:'../nvp-teacher/source/base_basic_pbr.glb',sourceClip:source.sourceName,duration:source.duration,stride,frames,channels:35,reference,samples:Buffer.from(data.buffer).toString('base64')};
fs.writeFileSync(path.join(out,'natural-walk.json'),JSON.stringify(motion));
const main=path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html'))),html=fs.readFileSync(main,'utf8'),begin='// BEGIN STUDENT_LOCOMOTION',end='// END STUDENT_LOCOMOTION',nl=html.includes('\r\n')?'\r\n':'\n';
const runtime=fs.readFileSync(path.join(out,'student-locomotion.js'),'utf8')+'\n'+fs.readFileSync(path.join(out,'classroom-traffic.js'),'utf8');
const block=(begin+'\nconst studentWalkMotion='+JSON.stringify(motion)+';\n'+runtime+'\n'+end+'\n').replace(/\r?\n/g,nl);
let updated;if(html.includes(begin)){const start=html.indexOf(begin),finish=html.indexOf(end,start);if(finish<0)throw Error('Missing student locomotion block end');updated=html.slice(0,start)+block+html.slice(finish+end.length).replace(/^\r?\n/,'');}else updated=html.replace('function buildClassroomCharacter(',block+nl+'function buildClassroomCharacter(');
fs.writeFileSync(main,updated);
console.log(JSON.stringify({...motion,samples:undefined},null,2));
