// Author probe (R7-A DECISION AUTHORITY, Founder request §33): bounded mutation of the contracts this mission adds. Each mutant is one exact
// source replacement (it must occur once). The mutated tree is a temporary copy of CoachingCore; the live tree is never written. A mutant is
// killed by this mission's test file first, else by the full suite (a test counts only if it passes on the unmutated copy); a survivor is run
// through the self-challenge (r7ada-self-challenge.mjs) so the classes that see it are named. Prints JSON only. Usage: node r7ada-mutation.mjs
// [mutantId ...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),core=path.join(root,'CoachingCore');
const MUTANTS=[
 // FACTUAL AUTHORITY
 {id:'F1',contract:'FACTUAL_AUTHORITY',what:'a planned KNOWN row is the reference whatever history holds (prescribed load establishes history)',file:'src/r6-program.mjs',from:"export const heldKnownLoad=ex=>ex?.mode==='KNOWN'&&Number.isFinite(ex.load);",to:'export const heldKnownLoad=ex=>true;'},
 {id:'F2',contract:'FACTUAL_AUTHORITY',what:'facts-only reading of a week no review closed adopts the planned KNOWN row',file:'src/r6-program.mjs',from:'const list=heldKnownLoad(ss0.exercises[id])?rows:rows.map(asEstablishment);',to:'const list=rows;'},
 {id:'F3',contract:'FACTUAL_AUTHORITY',what:'the evidence transition adopts the planned KNOWN row',file:'src/r6-program.mjs',from:'const list=assumeLogged||heldKnownLoad(ss0.exercises[id])?rows:rows.map(asEstablishment);',to:'const list=rows;'},
 {id:'F4',contract:'FACTUAL_AUTHORITY',what:'load questions judge a log against the planned KNOWN row',file:'src/r6-adaptation.mjs',from:'u=heldKnownLoad(state[id])?row0:asEstablishment(row0)',to:'u=row0'},
 {id:'F5',contract:'FACTUAL_AUTHORITY',what:'a correction or retraction of an earlier week never re-plans the rows ahead',file:'src/r6-adaptation.mjs',from:'function viewMovedBy(ctx){',to:'function viewMovedBy(ctx){return false;'},
 // COHERENT DECISION CONTEXT
 {id:'C1',contract:'COHERENT_DECISION_CONTEXT',what:'the planning reading judges a transition under the old week context (old and new goal mixed)',file:'src/r6-adaptation.mjs',from:'skn=plan?skOf(k):skj',to:'skn=skj'},
 {id:'C2',contract:'COHERENT_DECISION_CONTEXT',what:'a return week is read without its pre-return rows by the planner (E7 dropped)',file:'src/r6-adaptation.mjs',from:'const R=plan&&P.since?read(week.sessions,program.stateTrace[j],program.stateTrace[j]?.strength?.entryWeek):C5;',to:'const R=C5;'},
 {id:'C3',contract:'COHERENT_DECISION_CONTEXT',what:'a re-plan of this week keeps the PlanningView computed under the context it replaces',file:'src/r6-adaptation.mjs',from:'const own=fromWeek===ctx.w?{...ctx,program:next,sk,evidence:undefined}:ctx;',to:'const own=ctx;'},
 {id:'C4',contract:'COHERENT_DECISION_CONTEXT',what:'the decision reads the history reading instead of the planning reading',file:'src/r6-adaptation.mjs',from:"ret:returnInForce(ctx.program),reading:'PLAN'",to:"ret:returnInForce(ctx.program),reading:'HISTORY'"},
 // EVIDENCE-BASED PROGRESSION AUTHORITY
 {id:'P1',contract:'PROGRESSION_AUTHORITY',what:'the run view takes the projection (planner target treated as earned; E10 restored)',file:'src/r6-adaptation.mjs',from:'const run={...clone(V.run),planned:clone(P.run.planned)}',to:'const run={...clone(P.run)}'},
 {id:'P2',contract:'PROGRESSION_AUTHORITY',what:'a week neither closed nor complete advances in the planning reading (calendar progression)',file:'src/r6-adaptation.mjs',from:"plan?advanceRun(skn,{...P.state.run,planned:R.plannedRun},j,{ALL:'HOLD'})",to:"plan?advanceRun(skn,{...P.state.run,planned:R.plannedRun},j,{ALL:'ADVANCE'})"},
 {id:'P3',contract:'PROGRESSION_AUTHORITY',what:'gate resolution is last-writer-wins',file:'src/r6-adaptation.mjs',from:'if(!(key in gates)||GATE_ORDER[value]>GATE_ORDER[gates[key]])gates[key]=value;',to:'gates[key]=value;'},
 {id:'P4',contract:'PROGRESSION_AUTHORITY',what:'a run not yet due (future session) no longer holds its gate',file:'src/r6-adaptation.mjs',from:"rows.some(x=>['MISSED','NOT_REPORTED','PARTIAL','CONFLICTED','PENDING'].includes(x.status))",to:"rows.some(x=>['MISSED','NOT_REPORTED','PARTIAL','CONFLICTED'].includes(x.status))"},
 {id:'P5',contract:'PROGRESSION_AUTHORITY',what:'a missed long run still advances the long-run target',file:'src/r6-program.mjs',from:'if(st.long!==null&&st.long<target&&done(\'LONG\'))',to:'if(st.long!==null&&st.long<target)'},
 // WALK/JOG RETURN CEILING
 {id:'W1',contract:'WALK_JOG_CEILING',what:'HOLD and consolidation keep a walk/jog step above the one the week ran',file:'src/r6-program.mjs',from:'from=!eventHold&&Number.isInteger(P.walkStep)?Math.min(st.walkStep,P.walkStep):st.walkStep',to:'from=st.walkStep'},
 {id:'W2',contract:'WALK_JOG_CEILING',what:'a return ignores the step last run (tolerated ceiling)',file:'src/r6-adaptation.mjs',from:'run:historicalRun(clone(H.state.run),stepsRun.at(-1)??null)',to:'run:clone(H.state.run)'},
];
const only=process.argv.slice(2),list=only.length?MUTANTS.filter(m=>only.includes(m.id)):MUTANTS;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ada-mut-')),tree=path.join(tmp,'CoachingCore');
const tap=(cwd,files,ignore=[])=>{const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd,encoding:'utf8',maxBuffer:512*1024*1024});const t=[...r.stdout.matchAll(/^\s*(not ok|ok) \d+ - (.+)$/gm)].map(m=>({name:m[2].trim(),pass:m[1]==='ok'})).filter(x=>!/\.test\.mjs$/.test(x.name));return {total:t.length,failing:t.filter(x=>!x.pass&&!ignore.includes(x.name)).map(x=>x.name)};};
const out={probe:'r7ada-mutation',mutants:[]};
try{
 fs.cpSync(core,tree,{recursive:true});
 out.baseline={r7adaTestFile:tap(tree,['test/r7ada-decision-authority.test.mjs']),fullSuite:tap(tree,[])};
 if(out.baseline.r7adaTestFile.failing.length)throw Error('the unmutated copy fails its own test file');
 for(const m of list){
  const file=path.join(tree,m.file),src=fs.readFileSync(file,'utf8'),n=src.split(m.from).length-1;
  if(n!==1){out.mutants.push({...m,applied:false,occurrences:n});continue;}
  fs.writeFileSync(file,src.replace(m.from,m.to));
  try{
   let stage='r7ada-test-file',r=tap(tree,['test/r7ada-decision-authority.test.mjs']);
   if(!r.failing.length){stage='full-suite';r=tap(tree,[],out.baseline.fullSuite.failing);}
   const rec={id:m.id,contract:m.contract,what:m.what,file:m.file,applied:true,killed:r.failing.length>0,stage:r.failing.length?stage:null,testsRun:r.total,failing:r.failing.length,killingTests:r.failing.slice(0,8)};
   if(!rec.killed){const s=spawnSync(process.execPath,[path.join(import.meta.dirname,'r7ada-self-challenge.mjs')],{env:{...process.env,R7ADA_ROOT:tree},encoding:'utf8',maxBuffer:256*1024*1024});
    try{const j=JSON.parse(s.stdout);rec.selfChallenge=Object.fromEntries(Object.entries(j.classes).filter(([,c])=>c.violations).map(([k,c])=>[k,c.violations]));}catch{rec.selfChallenge={error:s.stderr.slice(-400)};}}
   out.mutants.push(rec);
  }finally{fs.writeFileSync(file,src);}
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
out.summary={mutants:out.mutants.length,applied:out.mutants.filter(m=>m.applied).length,killedByTests:out.mutants.filter(m=>m.killed).length,survivors:out.mutants.filter(m=>m.applied&&!m.killed).map(m=>({id:m.id,selfChallenge:m.selfChallenge}))};
console.log(JSON.stringify(out,null,1));
