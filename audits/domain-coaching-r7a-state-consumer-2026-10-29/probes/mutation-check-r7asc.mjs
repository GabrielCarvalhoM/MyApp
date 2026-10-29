// COACHING CORE — STATE MODEL CONSUMER CLOSURE mutation check (Founder §25). Each mutation removes or weakens one piece of the consumer closure in
// a temporary copy of the current runtime (never in CoachingCore/) and runs this mission's tests with the earlier state, correction,
// interruption and adaptation suites there. The Founder's §25 list comes first, then the pieces the four fronts rest on. A mutation is caught
// when at least one test fails; a survivor is documented with its reason in MUTATION_SURVIVORS_R7ASC.json, or reported. Author check, not a gate.
// Usage: node mutation-check-r7asc.mjs (writes mutation-check-r7asc.out.json next to this file, or MUT_OUT; MUT_TMP picks the temporary folder).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {hash} from '../../../CoachingCore/src/value.mjs';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore');
const TESTS=['test/r7asc-state-consumer.test.mjs','test/r7asm-state-model.test.mjs','test/r7ase-state-evidence.test.mjs','test/r7ab-week-start-authority.test.mjs','test/r7af-episode-identity.test.mjs','test/r7a2-interruption.test.mjs','test/r7a1-composition.test.mjs','test/r7a1-correction.test.mjs','test/r7a-cycle2.test.mjs','test/r7a-semantic-core.test.mjs','test/r6-adaptation.test.mjs','test/r6-ssctr-r10-fixes.test.mjs'];
const A='src/r6-adaptation.mjs',P='src/r6-program.mjs';
const MUTATIONS=[
 // §25: projection establishes load (Property A; QE-R7ASM-01).
 ['§25 projection establishes load: a KNOWN row\'s load sets up an exercise the start does not hold, in every consumer',P,"export const asEstablishment=u=>u?.mode==='KNOWN'?{...u,mode:'ESTABLISH',value:null}:u;","export const asEstablishment=u=>u;"],
 ['§25 projection establishes load: the facts-only reading (strengthAtBreak) takes the row as executed evidence',P,"  const list=ss0.exercises[id]?rows:rows.map(asEstablishment);","  const list=rows;"],
 ['§25 projection establishes load: the evidence reducer\'s transition (advanceStrength) takes the row as executed evidence',P,"  const list=assumeLogged||ss0.exercises[id]?rows:rows.map(asEstablishment);","  const list=rows;"],
 ['§25 projection establishes load: the load questions judge a first log against the row\'s load',A,"u=state[id]?row0:asEstablishment(row0)","u=row0"],
 ['§25 projection establishes load: the view hands the planner the projection\'s exercise when it holds one',A,"const v=resolveExercisePrescription(h);if(v)exercises[id]=v;}","const v=ctx.program.stateTrace[ctx.w].strength.exercises[id]?clone(ctx.program.stateTrace[ctx.w].strength.exercises[id]):resolveExercisePrescription(h);if(v)exercises[id]=v;}"],
 // §25: retracted evidence remains public; public Historical API reads superseded line (Property B; QE-R7ASM-04).
 ['§25 public Historical API reads superseded line: historicalStateOf reads the carried rows as given',A," const {ledger,quarantined}=canonicalRecord(program,actualLedger,{authority,cut});"," const ledger=Array.isArray(actualLedger)?actualLedger:[],quarantined=[];"],
 ['§25 retracted evidence remains public: the public record drops the corrections, so the line they retract stays factual',A,"asOf:new Date(latest).toISOString(),prior:rows,","asOf:new Date(latest).toISOString(),prior:rows.filter(o=>!o.correctionOf),"],
 ['§25 retracted evidence remains public: the public record is normalized at the cut, so a correction made after it does not apply',A," const latest=rows.reduce((m,o)=>Math.max(m,...[o.correctedAt,o.reportedAt,o.supersededAt,o.observedAt].map(utcTimestamp).filter(Boolean).map(Date.parse)),Date.parse(cut));"," const latest=Date.parse(cut);"],
 // §25: HOLD uses projected reps (Property C; F2).
 ['§25 HOLD uses projected reps: the view takes the projection\'s repetition target',A,"const v=resolveExercisePrescription(h);if(v)exercises[id]=v;}","const v=resolveExercisePrescription(h),q=ctx.program.stateTrace[ctx.w].strength.exercises[id];if(v&&q&&Number.isFinite(q.reps))v.reps=q.reps;if(v)exercises[id]=v;}"],
 ['§25 HOLD uses projected reps: a new load takes the logged repetitions whatever the gate (F2 as found)',P," const reps=advanced&&Number.isFinite(log?.reps)?log.reps:uLog.reps;"," const reps=Number.isFinite(log?.reps)?log.reps:uLog.reps;"],
 // §25: MAINTAIN keeps old projected reps (Property C; F3).
 ['§25 MAINTAIN keeps old projected reps: rows of a known dose are not cut at the current goal\'s range',P,"inRange=r=>knownDose&&Number.isFinite(r)?Math.min(r,hi):r;","inRange=r=>r;"],
 // §25: future session earns return credit (Property D; F1).
 ['§25 future session earns return credit: a strength return step moves from the state, not from the dose executed',P,"const base=Math.min(ex.returnStep,doseStep(done.length?done:list));","const base=ex.returnStep;"],
 ['§25 future session earns return credit: a run return step moves from the state, not from the dose run',P,"base=Number.isInteger(P.returnStep)?Math.min(st.returnStep,P.returnStep):st.returnStep;","base=st.returnStep;"],
 ['§25 future session earns return credit: the walk/jog step moves from the state, not from the step run',P,"from=d>0&&Number.isInteger(P.walkStep)?Math.min(st.walkStep,P.walkStep):st.walkStep;","from=st.walkStep;"],
 ['§25 future session earns return credit: a return\'s own week is read with the whole week\'s planned summary (NF-R7ASM-1)',A,"   const stored=P.since?null:program.stateTrace[j],","   const stored=program.stateTrace[j],"],
 ['§25 future session earns return credit: a past week\'s gate counts logs executed after its clock (Property D)',A,"hist=ledger.filter(o=>o.logs?.[id]&&Date.parse(asOf)-Date.parse(o.observedAt)<=L.repeatedAdverseWindowDays*86400000&&Date.parse(o.observedAt)<=Date.parse(asOf)&&","hist=ledger.filter(o=>o.logs?.[id]&&Date.parse(asOf)-Date.parse(o.observedAt)<=L.repeatedAdverseWindowDays*86400000&&"],
 // §25: RESTART reads projection instead of factual base (Property C; QE-R7ASM-02).
 ['§25 RESTART reads projection instead of factual base: the view takes the projection\'s run in a restart',A,"const REENTRY_MODES=['RETURN','RESTART'];","const REENTRY_MODES=['RETURN'];"],
 ['§25 RESTART reads projection instead of factual base: the view takes the projection\'s run in every re-entry mode',A," if([H.run.mode,P.run.mode].some(m=>REENTRY_MODES.includes(m)))run="," if(false)run="],
 ['§25 RESTART reads projection instead of factual base: the view takes history\'s run only when history itself is in re-entry',A," if([H.run.mode,P.run.mode].some(m=>REENTRY_MODES.includes(m)))run="," if(REENTRY_MODES.includes(H.run.mode))run="],
 ['§25 RESTART reads projection instead of factual base: restart minutes move from the state, not from the minutes run',P,"from=Number.isFinite(P.restart)?Math.min(st.restart,P.restart):st.restart;","from=st.restart;"],
 // The pieces the four fronts rest on.
 ['the prescription summary states no re-entry dose, so the run steps cannot see what the week ran',P,"const reentry=Object.fromEntries([['returnStep','RETURN_STEP'],['restart','RESTART_MINUTES'],['walkStep','WALK_JOG_STEP']].map(([k,dim])=>[k,lowest(dim)]).filter(([,v])=>v!==null));","const reentry={};"],
 ['R42: a credit earned at another load crosses to the new load',P," ex.loadTick=0;\n const reps=advanced"," const reps=advanced"],
 ['R42: the credit restarts only when the athlete lifted the higher load (the predecessor\'s condition)',P," if(!(Number.isFinite(before)&&Number.isFinite(ex.load)&&ex.load>before+1e-9))return;"," if(!(Number.isFinite(before)&&Number.isFinite(uLog?.value)&&uLog.value>before+1e-9&&Math.abs(ex.load-before)>1e-9))return;"],
 ['a new load keeps the repetitions of the earlier load',P," if(Number.isFinite(reps))ex.reps=reps;\n};",";\n};"],
 ['the public reader fails in a program\'s last week while a return is in force',A,"inWeek=(k,d)=>!!d&&!!program.weeks[k]&&d>=","inWeek=(k,d)=>!!d&&d>="],
 ['the goal range cuts only the return entry, not the later rows of a known dose',P,"return {kind:'FROM_LOG',...counts,row:{reps:inRange(ex.reps??reps),","return {kind:'FROM_LOG',...counts,row:{reps:ex.reps??reps,"]
];
const tmpRoot=process.env.MUT_TMP?path.resolve(process.env.MUT_TMP):os.tmpdir();fs.mkdirSync(tmpRoot,{recursive:true});
const tmp=fs.mkdtempSync(path.join(tmpRoot,'r7asc-mut-')),out=[];
const copyTree=(from,to)=>{for(const e of fs.readdirSync(from,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='r7')continue;const a=path.join(from,e.name),b=path.join(to,e.name);if(e.isDirectory()){fs.mkdirSync(b,{recursive:true});copyTree(a,b);}else fs.copyFileSync(a,b);}};
try{
 fs.mkdirSync(path.join(tmp,'CoachingCore'),{recursive:true});copyTree(cc,path.join(tmp,'CoachingCore'));
 fs.symlinkSync(path.join(cc,'node_modules'),path.join(tmp,'CoachingCore','node_modules'),'junction');
 const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024});const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),fail:n('fail'),failing:[...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i&&x!=='failing tests:').slice(0,6)};};
 // The bytes this check ran on: the source digest the freeze records, and the test files it ran, both from the unmutated copy.
 const shaOf=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),copy=path.join(tmp,'CoachingCore');
 const bound={sourceDigest:hash(Object.fromEntries(fs.readdirSync(path.join(copy,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,shaOf(path.join(copy,'src',f))]))),tests:Object.fromEntries(TESTS.map(t=>[t,shaOf(path.join(copy,t))]))};
 const clean=run();if(clean.fail!==0)throw Error('The unmutated copy fails: '+JSON.stringify(clean));
 for(const [name,file,from,to] of MUTATIONS){
  const f=path.join(tmp,'CoachingCore',file),src=fs.readFileSync(f,'utf8'),n=src.split(from).length-1;
  if(n!==1){out.push({mutation:name,file,applied:false,occurrences:n});continue;}
  fs.writeFileSync(f,src.replace(from,()=>to));const r=run();fs.writeFileSync(f,src);
  out.push({mutation:name,file,applied:true,caught:r.fail>0,tests:r.tests,fail:r.fail,failing:r.failing});
 }
 const caught=out.filter(r=>r.caught).length,result={revision:'R7ASC-MUTATION-1',generatedAt:new Date().toISOString(),node:process.version,tests:TESTS,bound,clean,total:out.length,caught,results:out};
 fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7asc.out.json'),JSON.stringify(result,null,1)+'\n');
 console.log(JSON.stringify({total:out.length,caught,notApplied:out.filter(r=>!r.applied).map(r=>[r.mutation,r.occurrences]),survivors:out.filter(r=>r.applied&&!r.caught).map(r=>r.mutation)},null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
