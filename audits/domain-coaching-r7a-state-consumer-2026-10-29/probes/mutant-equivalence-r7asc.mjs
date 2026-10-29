// Author probe (prints only): the evidence for the one survivor mutation-check-r7asc.mjs documents. The mutant ("the view takes history's run only
// when history itself is in re-entry") and a positive control (the walk/jog step moving from the state, a run re-entry mutant the suite now
// catches) are each applied to a temporary copy of the current runtime (never in CoachingCore/). mutant-search-r7asc.mjs runs its battery of run
// timelines on the live tree and on each copy, and every timeline's run rows and history are compared. The survivor is equivalent on this
// battery if no timeline differs. The control must differ, which shows the battery can see this class. Usage: node mutant-equivalence-r7asc.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),cc=path.join(root,'CoachingCore');
const MUTANTS={
 survivor:['src/r6-adaptation.mjs'," if([H.run.mode,P.run.mode].some(m=>REENTRY_MODES.includes(m)))run="," if(REENTRY_MODES.includes(H.run.mode))run="],
 control:['src/r6-program.mjs',"from=d>0&&Number.isInteger(P.walkStep)?Math.min(st.walkStep,P.walkStep):st.walkStep;","from=st.walkStep;"]};
const battery=tree=>{const r=spawnSync(process.execPath,[path.join(here,'mutant-search-r7asc.mjs')],{cwd:here,encoding:'utf8',maxBuffer:256*1024*1024,env:{...process.env,R7ASC_ROOT:tree}});if(r.status!==0)throw Error(r.stderr.slice(0,400));return JSON.parse(r.stdout).timelines;};
const copyTree=(from,to)=>{for(const e of fs.readdirSync(from,{withFileTypes:true})){if(['node_modules','r7','test','scripts'].includes(e.name))continue;const a=path.join(from,e.name),b=path.join(to,e.name);if(e.isDirectory()){fs.mkdirSync(b,{recursive:true});copyTree(a,b);}else fs.copyFileSync(a,b);}};
const tmp=fs.mkdtempSync(path.join(process.env.MUT_TMP?path.resolve(process.env.MUT_TMP):os.tmpdir(),'r7asc-eq-'));
try{
 const live=battery(cc),ran=Object.values(live).filter(Array.isArray).length,out={probe:'mutant-equivalence-r7asc',timelines:Object.keys(live).length,ran,mutants:{}};
 for(const [name,[file,from,to]] of Object.entries(MUTANTS)){
  const d=path.join(tmp,name,'CoachingCore');fs.mkdirSync(d,{recursive:true});copyTree(cc,d);
  const f=path.join(d,file),src=fs.readFileSync(f,'utf8');if(src.split(from).length!==2)throw Error(name+': the mutation does not apply once');fs.writeFileSync(f,src.replace(from,()=>to));
  const m=battery(d),differ=Object.keys(live).filter(k=>JSON.stringify(live[k])!==JSON.stringify(m[k]));
  out.mutants[name]={file,mutation:to.trim(),differingTimelines:differ.length,examples:differ.slice(0,6)};
 }
 out.survivorEquivalentOnBattery=out.mutants.survivor.differingTimelines===0;out.controlDetected=out.mutants.control.differingTimelines>0;
 console.log(JSON.stringify(out,null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
