// COACHING CORE — STATE EVIDENCE MODEL mutation check (Founder request §23): each mutation removes or weakens one piece of the value-scoped
// authority model in a temporary copy of the current runtime (never in CoachingCore/) and runs this mission's tests with the R7-A boundary,
// R7-A final, R7-A.2 and R6 adaptation tests there. Only this semantics is mutated: the Founder's §23 examples and the pieces they rest on.
// A mutation is caught when at least one test fails; a survivor is documented here with its reason or reported. Author check, not a gate.
// Usage: node mutation-check-r7ase.mjs (writes mutation-check-r7ase.out.json next to this file, or MUT_OUT).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore');
const TESTS=['test/r7ase-state-evidence.test.mjs','test/r7ab-week-start-authority.test.mjs','test/r7af-episode-identity.test.mjs','test/r7a2-interruption.test.mjs','test/r6-adaptation.test.mjs'];
const A='src/r6-adaptation.mjs',P='src/r6-program.mjs';
const MUTATIONS=[
 // §23 examples.
 ['§23 projected treated as historical: a projection holds whatever its base was',A,"else if(projected(rp)&&held(prev().values.RUN)&&runAsAssumed(k-1,recorded?rp.premise:undefined))","else if(projected(rp))"],
 ['§23 projected treated as historical (strength): a strength projection holds whatever its base and execution',A,"if(id in se.exercises&&executedAsAssumed&&baseHeld(id)){","if(id in se.exercises&&projected(sp)){"],
 ['§23 week review promotes untouched values: an evidence start holds every value (strength)',A,"if(reviewed(sp)&&[...new Set(","if(false&&[...new Set("],
 ['§23 week review promotes untouched values: an evidence start holds the run',A,"if(reviewed(rp)&&!held(prev().values.RUN)){","if(false){"],
 ['§23 irrelevant evidence promotes value: an exercise counts as executed as assumed whatever its own rows, gate and log',A,"const exerciseAsAssumed=(j,id,premise)=>{","const exerciseAsAssumed=(j,id,premise)=>{return true;"],
 ['§23 irrelevant evidence promotes value: the run counts as executed whatever its gates',A,"return Object.entries(r.gates).every(([key,g])=>!runKeys.has(key)||['ADVANCE','EARNED'].includes(g));};","return true;};"],
 ['§23 planner reads historical when it needs projection: the review builds next week on the historical base',A,"return {runState:advanceRun(skn,program.stateTrace[w].run,w,evidenceGates),strengthState:advanceStrength(skn,program.stateTrace[w].strength,","const hb=historicalView(ctx,{cut:ctx.asOf,day:ctx.asOfLocal,ledger:ctx.fullLedger??ctx.ledger,program})(w).state;return {runState:advanceRun(skn,{...hb.run,planned:program.stateTrace[w].run.planned},w,evidenceGates),strengthState:advanceStrength(skn,{...hb.strength,planned:program.stateTrace[w].strength.planned,entryWeek:program.stateTrace[w].strength.entryWeek},"],
 ['§23 historical consumer reads projection: the state point is the stored start',A,"const base=read(false),alt=","H.state=(weekOf(p).startBeforeReturn??program.stateTrace[p]);const base=read(false),alt="],
 ['§23 partial evidence fills missing field from target: an unreadable load takes the row\'s planned load',P,"  if(ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else delete ex.unlogged;\n  const whole=wholeCounts(done,planned[id]);","  if(!log&&u.mode==='KNOWN'&&Number.isFinite(u.value))ex.load=u.value;\n  if(ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else delete ex.unlogged;\n  const whole=wholeCounts(done,planned[id]);"],
 ['§23 execution ignored during promotion: an executed load is not a fact',P,"if(d.adopted)ex.load=d.value;}","}"],
 ['§23 execution ignored during promotion: only a lighter executed load is a fact',P,"if(d.adopted)ex.load=d.value;}","if(d.adopted&&d.value<ex.load)ex.load=d.value;}"],
 // The pieces they rest on.
 ['base check removed (strength): a projection holds when the week before executed it, whatever its base',A,"const baseHeld=id=>held(P.values.STRENGTH[id])||","const baseHeld=id=>true||"],
 ['base check removed (evidence starts): a value a review carried counts as held',A,"const heldBefore=id=>held(prev().values.STRENGTH[id])||","const heldBefore=id=>true||"],
 ['per-exercise premise ignored',A,"if(premise!==undefined&&premise!==exercisePremiseOf(r.week,id))return false;",""],
 ['an exercise\'s own gate ignored',A,"if(r.gates[id]!==undefined&&!['ADVANCE','EARNED'].includes(r.gates[id]))return false;",""],
 ['load check removed',A,"return !(d.adopted&&assumed!==null&&d.value<assumed-1e-9);\n };","return true;\n };"],
 ['exercises a later adaptation removed are not checked',A,",assumed=recorded&&sp.values?Object.keys(sp.values):[];",",assumed=[];"],
 ['promotion per exercise instead of per sport (a partial week verifies its executed exercises)',A,"if(id in se.exercises&&executedAsAssumed&&baseHeld(id)){","if(id in se.exercises&&projected(sp)&&sportPremise&&baseHeld(id)&&exerciseAsAssumed(k-1,id,premise(id))){"],
 ['executed date ignored: a verified projection keeps its planned date',A,"exercises[id]=lp===ex.lastPerformed||lp===undefined?ex:{...ex,lastPerformed:lp};","exercises[id]=ex;"],
 ['a lifted projected dose ignored: a tick counted at the earlier load is carried onto the lifted one',A,"   ex[id]={...h,load:s.load,reps:s.reps,loadTick:s.loadTick};moved=true;}","   moved=moved;}"],
 ['a rebuilt value counted as held: a later projection built on the carried value can verify',A,"const held=v=>v?.week===k-1&&!v.rebuilt;","const held=v=>v?.week===k-1;"],
 ['an unreadable load verifies a projection',A,"const log=r.logs[id];if(!log)return r.gates[id]===undefined;","const log=r.logs[id];if(!log)return true;"],
 ['the record of carried values dropped',A,"projectedBase:projectedBaseOf(ctx,program)};","projectedBase:null};"]
];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ase-mut-')),out=[];
const copyTree=(from,to)=>{for(const e of fs.readdirSync(from,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='r7')continue;const a=path.join(from,e.name),b=path.join(to,e.name);if(e.isDirectory()){fs.mkdirSync(b,{recursive:true});copyTree(a,b);}else fs.copyFileSync(a,b);}};
try{
 fs.mkdirSync(path.join(tmp,'CoachingCore'),{recursive:true});copyTree(cc,path.join(tmp,'CoachingCore'));
 fs.symlinkSync(path.join(cc,'node_modules'),path.join(tmp,'CoachingCore','node_modules'),'junction');
 const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024});const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),fail:n('fail'),failing:[...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i&&x!=='failing tests:').slice(0,6)};};
 const clean=run();if(clean.fail!==0)throw Error('The unmutated copy fails: '+JSON.stringify(clean));
 for(const [name,file,from,to] of MUTATIONS){
  const f=path.join(tmp,'CoachingCore',file),src=fs.readFileSync(f,'utf8'),n=src.split(from).length-1;
  if(n!==1){out.push({mutation:name,file,applied:false,occurrences:n});continue;}
  fs.writeFileSync(f,src.replace(from,()=>to));const r=run();fs.writeFileSync(f,src);
  out.push({mutation:name,file,applied:true,caught:r.fail>0,tests:r.tests,fail:r.fail,failing:r.failing});
 }
 const caught=out.filter(r=>r.caught).length,result={revision:'R7ASE-MUTATION-1',generatedAt:new Date().toISOString(),node:process.version,tests:TESTS,clean,total:out.length,caught,documentedSurvivors:0,results:out};
 fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7ase.out.json'),JSON.stringify(result,null,1)+'\n');
 console.log(JSON.stringify({total:out.length,caught,notApplied:out.filter(r=>!r.applied).map(r=>r.mutation),survivors:out.filter(r=>r.applied&&!r.caught).map(r=>r.mutation)},null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
