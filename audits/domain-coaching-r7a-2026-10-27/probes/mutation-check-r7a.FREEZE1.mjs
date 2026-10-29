// R7-A mutation check: each mutation reverts one R7-A fix in a temporary copy of the current runtime (never in CoachingCore/) and runs
// test/r7a-semantic-core.test.mjs there. A fix is pinned when at least one R7-A test fails under its mutation. Author check, not a gate.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore');
const MUTATIONS=[
 ['D53 regain only for a known-load state',"src/r6-program.mjs","else if(on&&kind==='REESTABLISH'){","else if(on&&kind==='REESTABLISH'&&ex.mode==='KNOWN'){"],
 ['D54 re-establishment skips the phase reduction',"src/r6-program.mjs","const sets=Math.min(cap,phasedSets),rir=Math.max(c.rirFloor??-Infinity,phasedRir)","const sets=c.kind==='REESTABLISH'?Math.min(cap,c.basis):Math.min(cap,phasedSets),rir=c.kind==='REESTABLISH'?Math.max(c.rirFloor,c.rirBase):Math.max(c.rirFloor??-Infinity,phasedRir)"],
 ['C17 validation without the phase-dose check',"src/r6-program.mjs","if(Number.isInteger(e.exposure?.phaseBasis)&&e.sets>phaseDose(sk.op,P,e.exposure.phaseBasis,e.rir)[0])bad('sets');","/* removed */"],
 ['R19 the last prescribed exposure decides the week',"src/r6-program.mjs","u=done[0]??list.at(-1),uc=","u=list.at(-1),uc="],
 ['Counts from the first executed exposure',"src/r6-program.mjs","uc=done.at(-1)??list.at(-1)","uc=done[0]??list.at(-1)"],
 ['C11 every exercise in the state decides the entry week',"src/r6-program.mjs","const entryWeek=[...inUse].some(id=>ss.exercises[id]?.returnStep===0);","const entryWeek=Object.values(ss.exercises).some(e=>e.returnStep===0);"],
 ['C12 a set without reps counts as zero reps',"src/r6-adaptation.mjs","reps=sets.map(x=>x.reps).filter(x=>Number.isFinite(x)&&x>=0),repsKnown=reps.length===sets.length;","reps=sets.map(x=>Number.isFinite(x.reps)?x.reps:0),repsKnown=true;"],
 ['C16 a dated change is applied from next week',"src/r6-adaptation.mjs","if(isoDay(ch.to))return {action:'ASK'","if(false)return {action:'ASK'"],
 ['C18 a race is complete only near its window',"src/r6-adaptation.mjs","minutesOk=s.sport==='STRENGTH'||s.role==='RACE'||","minutesOk=s.sport==='STRENGTH'||"],
 ['C10 the carried record drops superseded facts',"src/r6-adaptation.mjs","actualLedger:[...ledger,...n.supersededRows],","actualLedger:ledger,"],
 ['C10 normalizer forgets carried history',"src/r6-provenance.mjs","if(o.superseded===true){","if(false){"],
 ['C09 exercise logs ignored when two reports agree on time',"src/r6-provenance.mjs","const ex=exerciseFacts(x),ey=exerciseFacts(y);","const ex={},ey={};"],
 ['C07 last record wins',"src/r6-intake.mjs","byExercise.set(e.id,x?lead(x,e):e);","byExercise.set(e.id,e);"]
];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7a-mut-')),results=[];
try{
 const copyDir=(rel)=>fs.cpSync(path.join(cc,rel),path.join(tmp,'CoachingCore',rel),{recursive:true});
 for(const rel of ['src','r6/fixtures'])copyDir(rel);
 fs.mkdirSync(path.join(tmp,'CoachingCore/test'),{recursive:true});
 fs.copyFileSync(path.join(cc,'test/r7a-semantic-core.test.mjs'),path.join(tmp,'CoachingCore/test/r7a-semantic-core.test.mjs'));
 fs.copyFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),path.join(tmp,'CoachingCore/r6/PROGRAM_POLICY_R6.json'));
 fs.copyFileSync(path.join(cc,'package.json'),path.join(tmp,'CoachingCore/package.json'));
 const run=()=>{const r=spawnSync(process.execPath,['--test','test/r7a-semantic-core.test.mjs'],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024});const failed=[...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter(n=>n!=='failing tests:');return {code:r.status,failed:[...new Set(failed)]};};
 const clean=run();if(clean.code!==0)throw Error('The unmutated copy fails: '+clean.failed.join('; '));
 for(const [name,file,from,to] of MUTATIONS){
  const f=path.join(tmp,'CoachingCore',file),orig=fs.readFileSync(f,'utf8');
  if(orig.split(from).length!==2){results.push({mutation:name,applied:false,reason:'anchor not found exactly once'});continue;}
  fs.writeFileSync(f,orig.replace(from,to));
  const r=run();fs.writeFileSync(f,orig);
  results.push({mutation:name,applied:true,caught:r.code!==0,failingTests:r.failed});
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const out={check:'R7A-MUTATION-1',runAt:new Date().toISOString(),scope:'test/r7a-semantic-core.test.mjs against single-fix reverts in a temporary copy',caught:results.filter(r=>r.caught).length,total:results.length,results};
fs.writeFileSync(path.join(import.meta.dirname,'mutation-check-r7a.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({caught:out.caught,total:out.total,missed:results.filter(r=>!r.caught).map(r=>r.mutation)}));
