// COACHING CORE — STATE MODEL CLOSURE mutation check (Founder §24): each mutation removes or weakens one piece of the separation between
// HistoricalState and PlanningProjection in a temporary copy of the current runtime (never in CoachingCore/) and runs this mission's tests with
// the earlier state, interruption and adaptation suites there. Only this semantics is mutated: the Founder's §24 list and the pieces it rests on.
// A mutation is caught when at least one test fails; a survivor is documented with its reason or reported. Author check, not a gate.
// Usage: node mutation-check-r7asm.mjs (writes mutation-check-r7asm.out.json next to this file, or MUT_OUT).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore');
const TESTS=['test/r7asm-state-model.test.mjs','test/r7ase-state-evidence.test.mjs','test/r7ab-week-start-authority.test.mjs','test/r7af-episode-identity.test.mjs','test/r7a2-interruption.test.mjs','test/r7a1-composition.test.mjs','test/r7a-cycle2.test.mjs','test/r6-adaptation.test.mjs','test/r6-ssctr-r10-fixes.test.mjs'];
const A='src/r6-adaptation.mjs',P='src/r6-program.mjs',C='src/r6-composition.mjs';
const MUTATIONS=[
 // §24: planner writes history.
 ['§24 planner writes history: a planning transition records the executed doses too, so a projected step becomes a fact',P," if(dev)ss.devCount++;\n if(evidenceMode)ss.facts=facts;"," if(dev)ss.devCount++;\n ss.facts=facts??{...(ss0.facts??executedDosesOf(ss0))};"],
 ['§24 planner writes history: the executed dose is recorded after the step, not as the evidence settled it',P,"  if(g.mode==='LOAD'){ex.loadTick=(ex.loadTick??0)+1;if(k==='EARNED'||ex.loadTick%2===0){ex.load=Math.round((ex.load+step)*10)/10;ex.loadTick=0;}}","  if(g.mode==='LOAD'){ex.loadTick=(ex.loadTick??0)+1;if(k==='EARNED'||ex.loadTick%2===0){ex.load=Math.round((ex.load+step)*10)/10;ex.loadTick=0;}if(evidenceMode&&on&&log)facts[id]=executedDose(ex,log,on);}"],
 // §24: historical consumer reads projection.
 ['§24 historical consumer reads projection: the reducer starts each week from the stored start',A,"   const j=k-1,P=at(j),week=program.weeks[j],skj=skOf(j),skn=skj;","   const j=k-1,P={...at(j),state:program.stateTrace[j]},week=program.weeks[j],skj=skOf(j),skn=skj;"],
 ['§24 historical consumer reads projection: the state at a break is the stored start',A,"const at=evidenceState(ctx,{cut,day:start,ledger:all,ret:R?.entry?{entry:R.entry,day:R.day,asOf:R.asOf,eventId:R.eventId,late,inForce:inForce(R)}:null,p}),H=at(p);","const at=evidenceState(ctx,{cut,day:start,ledger:all,ret:R?.entry?{entry:R.entry,day:R.day,asOf:R.asOf,eventId:R.eventId,late,inForce:inForce(R)}:null,p}),H={...at(p),state:weekOf(p).startBeforeReturn??program.stateTrace[p]};"],
 ['§24 historical consumer reads projection: the public HistoricalState reports the planning record',A,"const H=E(k+1),strength=H.state.strength,facts=strength.facts??{},resumable=historicalStrength(strength);","const H=E(k+1),strength={...program.stateTrace[k].strength,facts:H.state.strength.facts},facts=strength.facts??{},resumable=historicalStrength(strength);"],
 ['§24 historical consumer reads projection: the view hands the planner the projection\'s history atoms',A," for(const k of HISTORY_ATOMS){if(k in h)v[k]=clone(h[k]);else delete v[k];}",""],
 // §24: load execution copies tick.
 ['§24 load execution copies tick: a lift at a load above the evidence state keeps the projection\'s count',P," if(!(Number.isFinite(before)&&Number.isFinite(uLog?.value)&&uLog.value>before+1e-9&&Math.abs(ex.load-before)>1e-9))return;\n ex.loadTick=0;"," if(!(Number.isFinite(before)&&Number.isFinite(uLog?.value)&&uLog.value>before+1e-9&&Math.abs(ex.load-before)>1e-9))return;"],
 ['§24 load execution copies tick: the repetition target of the earlier load travels to the new one',P," const reps=Number.isFinite(log?.reps)?log.reps:uLog.reps;\n if(Number.isFinite(reps))ex.reps=reps;",""],
 ['§24 load execution copies tick: the view takes the tick from the projection at any load',A,"  v.loadTick=Math.abs(v.load-h.load)<1e-9?h.loadTick??0:0;",""],
 // §24: planned date populates lastPerformed.
 ['§24 planned date populates lastPerformed: the view keeps the plan\'s date',A,"const HISTORY_ATOMS=['lastPerformed','returnStep'","const HISTORY_ATOMS=['returnStep'"],
 ['§24 planned date populates lastPerformed: a projected transition dates an exercise it only planned',P,"  if(on&&!(ex.lastPerformed>=on))ex.lastPerformed=on;","  if(!(ex.lastPerformed>=(on??u.date)))ex.lastPerformed=on??u.date;"],
 // §24: week review promotes target.
 ['§24 week review promotes target: the review\'s rule is applied to the stored start instead of the decision\'s view',A,"const nextState=rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:evidenceStart(ctx,{week:program.weeks[w],start:ctx.base},skn,{gates});","const nextState=rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:evidenceStart(ctx,{week:program.weeks[w],start:program.stateTrace[w]},skn,{gates});"],
 ['§24 week review promotes target: the reducer treats every week as closed',A," const closed=(j,sport)=>!!closedBy(j,sport);"," const closed=()=>true;"],
 ['§24 week review promotes target: a week counts as complete whatever its gates',A,"   const complete=sport=>{const keys=sport==='RUN'","   const complete=()=>true;const unusedComplete=sport=>{const keys=sport==='RUN'"],
 // §24: week boundary promotes target.
 ['§24 week boundary promotes target: the public reader takes the next week\'s start when the cut crosses it',A,"const H=E(k+1),strength=H.state.strength","const H=E(k+2),strength=H.state.strength"],
 ['§24 week boundary promotes target: a week\'s gates are read at the cut instead of at its own clock',A,"   const clock=clockOf(j),vj={...v,decisions:view.decisions.filter(d=>Date.parse(d.asOf)<Date.parse(clock))};","   const clock=cut,vj=v;"],
 // §24: partial evidence fills projection.
 ['§24 partial evidence fills projection: an unreadable load takes the row\'s planned load',P,"  if(ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else delete ex.unlogged;\n  const whole=wholeCounts(done,planned[id]);","  if(!log&&u.mode==='KNOWN'&&Number.isFinite(u.value))ex.load=u.value;\n  if(ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else delete ex.unlogged;\n  const whole=wholeCounts(done,planned[id]);"],
 ['§24 partial evidence fills projection: a week with an unusable log still counts as complete',A,"&&(sport==='RUN'||!!logs[x]));};","&&true);};"],
 ['§24 partial evidence fills projection: the view keeps a load above the evidence-gated one',A,"  if(p.load>h.load+1e-9){v.load=h.load;if('reps' in h)v.reps=h.reps;else delete v.reps;}",""],
 // §24: cross-exercise and cross-sport promotion.
 ['§24 cross-exercise promotion: an exercise with no history of its own takes another exercise\'s',A," for(const id of new Set([...Object.keys(P.strength.exercises),...Object.keys(H.strength.exercises)])){const v=planningExercise(P.strength.exercises[id],H.strength.exercises[id]);if(v)exercises[id]=v;}"," const any=Object.values(H.strength.exercises)[0];for(const id of new Set([...Object.keys(P.strength.exercises),...Object.keys(H.strength.exercises)])){const v=planningExercise(P.strength.exercises[id],H.strength.exercises[id]??any);if(v)exercises[id]=v;}"],
 ['§24 cross-sport promotion: one sport\'s evidence closes the other',A,"   const hr=how('RUN'),hs=how('STRENGTH');","   const hr=how('RUN')??how('STRENGTH'),hs=how('STRENGTH')??how('RUN');"],
 // The pieces the list rests on.
 ['the return reads the released step instead of the dose last executed (T13)',A,"  return {strength:historicalStrength(strengthAtBreak(skj,H.state.strength,usedInWeek(v0.weeks[p]),{ALL:'HOLD',...gates},{performed,logged,evidenceMode:true})),performed};","  return {strength:strengthAtBreak(skj,H.state.strength,usedInWeek(v0.weeks[p]),{ALL:'HOLD',...gates},{performed,logged,evidenceMode:true}),performed};"],
 ['the reducer judges a past week under the latest plan instead of the one it was executed under',A,"const skOf=j=>ctx.sk.at?.(j)??ctx.sk","const skOf=j=>ctx.sk"],
 ['a re-planned week keeps the stored start of the decision\'s own week',C," const st0=w===ctx.w&&ctx.base?ctx.base:next.stateTrace[w],"," const st0=next.stateTrace[w],"],
 ['the re-establishment threshold of a move is measured from the stored start',C,"st=(env.base??program.stateTrace[w])?.strength?.exercises??{}","st=program.stateTrace[w]?.strength?.exercises??{}"],
 ['the gates of a decision read the stored start',A," const start=base??program.stateTrace[w];"," const start=program.stateTrace[w];"],
 ['a week start records the values it carried, and history reads them again',P,"export const anchoredStart=(provenance,{eventId=null,asOf=null}={})=>startAuthority(Object.fromEntries(START_SPORTS.map(x=>[x,{provenance,eventId,evidenceThrough:asOf}])));","export const anchoredStart=(provenance,{eventId=null,asOf=null,projectedBase=null}={})=>startAuthority(Object.fromEntries(START_SPORTS.map(x=>[x,{provenance,eventId,evidenceThrough:asOf,projectedBase}])));"],
 ['past contexts are dropped, so a later change rewrites what an earlier week earned',C," const top=out.at(-1).context,kept=out.slice(0,-1).map(s=>({untilWeek:s.until,...s.context}));"," const live=out.filter(s=>s.until>ctx.w),top=live.at(-1).context,kept=live.slice(0,-1).map(s=>({untilWeek:s.until,...s.context}));"],
 ['an exercise the evidence never established is handed to the planner anyway',A," if(!h)return null;"," if(!h)return clone(p);"]
];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7asm-mut-')),out=[];
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
 const caught=out.filter(r=>r.caught).length,result={revision:'R7ASM-MUTATION-1',generatedAt:new Date().toISOString(),node:process.version,tests:TESTS,clean,total:out.length,caught,results:out};
 fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7asm.out.json'),JSON.stringify(result,null,1)+'\n');
 console.log(JSON.stringify({total:out.length,caught,notApplied:out.filter(r=>!r.applied).map(r=>[r.mutation,r.occurrences]),survivors:out.filter(r=>r.applied&&!r.caught).map(r=>r.mutation)},null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
