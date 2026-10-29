// R7-A mutation check: each mutation reverts one R7-A fix in a temporary copy of the current runtime (never in CoachingCore/) and runs
// the R7-A tests there (test/r7a-semantic-core.test.mjs and, from the second cycle, test/r7a-cycle2.test.mjs). A fix is pinned when at
// least one R7-A test fails under its mutation. Author check, not a gate. The FREEZE-1 run is kept as mutation-check-r7a.FREEZE1.*; three
// of its anchors were rewritten by the second cycle and are updated here (C11, the carried-history branch, the intake fold).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore'),TESTS=['test/r7a-semantic-core.test.mjs','test/r7a-cycle2.test.mjs'];
const MUTATIONS=[
 // First cycle (R7A-FREEZE-1).
 ['D53 regain only for a known-load state',"src/r6-program.mjs","else if(on&&kind==='REESTABLISH'){","else if(on&&kind==='REESTABLISH'&&ex.mode==='KNOWN'){"],
 ['D54 re-establishment skips the phase reduction',"src/r6-program.mjs","const sets=Math.min(cap,phasedSets),rir=Math.max(c.rirFloor??-Infinity,phasedRir)","const sets=c.kind==='REESTABLISH'?Math.min(cap,c.basis):Math.min(cap,phasedSets),rir=c.kind==='REESTABLISH'?Math.max(c.rirFloor,c.rirBase):Math.max(c.rirFloor??-Infinity,phasedRir)"],
 ['C17 validation without the phase-dose check',"src/r6-program.mjs","if(Number.isInteger(e.exposure?.phaseBasis)&&e.sets>phaseDose(sk.op,P,e.exposure.phaseBasis,e.rir)[0])bad('sets');","/* removed */"],
 ['R19 the last prescribed exposure decides the week',"src/r6-program.mjs","u=done[0]??list.at(-1),uc=","u=list.at(-1),uc="],
 ['Counts from the first executed exposure',"src/r6-program.mjs","uc=done.at(-1)??list.at(-1)","uc=done[0]??list.at(-1)"],
 ['C11 every exercise in the state decides the entry week',"src/r6-program.mjs","const entryWeek=ss.entryWeek===true||[...inUse].some(id=>ss.exercises[id]?.returnStep===0);","const entryWeek=ss.entryWeek===true||Object.values(ss.exercises).some(e=>e.returnStep===0);"],
 ['C12 a set without reps counts as zero reps',"src/r6-adaptation.mjs","reps=sets.map(x=>x.reps).filter(x=>Number.isFinite(x)&&x>=0),repsKnown=reps.length===sets.length;","reps=sets.map(x=>Number.isFinite(x.reps)?x.reps:0),repsKnown=true;"],
 ['C16 a dated change is applied from next week',"src/r6-adaptation.mjs","if(isoDay(ch.to))return {action:'ASK'","if(false)return {action:'ASK'"],
 ['C18 a race is complete only near its window',"src/r6-adaptation.mjs","minutesOk=s.sport==='STRENGTH'||s.role==='RACE'||","minutesOk=s.sport==='STRENGTH'||"],
 ['C10 the carried record drops superseded facts',"src/r6-adaptation.mjs","actualLedger:[...ledger,...n.supersededRows],","actualLedger:ledger,"],
 ['C10 normalizer forgets carried history',"src/r6-provenance.mjs","if(carried&&o.superseded===true){","if(false){"],
 ['C09 exercise logs ignored when two reports agree on time',"src/r6-provenance.mjs","const ex=exerciseFacts(x),ey=exerciseFacts(y);","const ex={},ey={};"],
 ['C07 last record wins',"src/r6-intake.mjs","const l=lead(x,e),","const l=e,"],
 // Second cycle (engineering review QE-R7A-01..17, SSCTR D55).
 ['QE-01 a same-week review ignores the return stored for next week',"src/r6-adaptation.mjs","const rebasedNext=(program,w)=>{","const rebasedNext=(program,w)=>null&&{"],
 ['QE-02 a session later the same day is not ahead',"src/r6-adaptation.mjs","return s=>!!s&&(s.date>ctx.asOfLocal||s.date===ctx.asOfLocal&&!reported.has(s.id));","return s=>!!s&&s.date>ctx.asOfLocal;"],
 ['QE-03 an event change never reaches this week',"src/r6-adaptation.mjs","const reachesThisWeek=!rebasedNext(program,ctx.w)&&","const reachesThisWeek=false&&"],
 ['QE-04 executed history re-validated against new phases',"src/r6-program.mjs","||history?.has(x.id))continue;",")continue;"],
 ['QE-05 a second report replaces the exercise list',"src/r6-provenance.mjs","previous.actual=mergeActual(","previous.actual=((p,q)=>q.actual)("],
 ['QE-06 repetitions and reserve not compared per exercise',"src/r6-provenance.mjs","for(const k of ['reps','rir'])if(Number.isFinite(f[k])","for(const k of [])if(Number.isFinite(f[k])"],
 ['QE-07 a load in pounds is no load',"src/r6-provenance.mjs","u==='LB'?","u==='__LB'?"],
 ['QE-08 a carried superseded row answers only to its own id',"src/r6-provenance.mjs","for(const id of [o.eventId,...Object.keys(o.provenance?.inputHashes??{}),...(o.provenance?.mergedSourceIds??[])])if(!byEvent.has(id))byEvent.set(id,row);supersededRows.push(row);continue;}","if(!byEvent.has(o.eventId))byEvent.set(o.eventId,row);supersededRows.push(row);continue;}"],
 ['QE-09 an exact replay compared with the merged row',"src/r6-provenance.mjs","(sameEvent.provenance?.inputHashes?.[o.eventId]??sameEvent.inputHash)","sameEvent.inputHash"],
 ['QE-10 a move ignores the dose its new date allows',"src/r6-adaptation.mjs","phaseOf(s)===phaseOf(target)&&sameKind(s.date));","phaseOf(s)===phaseOf(target));"],
 ['QE-11 malformed window dates read as a window',"src/r6-adaptation.mjs","for(const k of ['from','to'])if(ch[k]!==undefined&&ch[k]!==null&&!isoDay(ch[k]))invalid.push('changes.'+k);","/* removed */"],
 ['QE-12 logged repetitions replace the target on any gate',"src/r6-program.mjs","ex.reps=confirms&&!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;","ex.reps=log.reps??ex.reps;"],
 ['QE-12 a newly established load keeps the old repetition target',"src/r6-program.mjs","ex.reps=confirms&&!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;","ex.reps=!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;"],
 ['QE-13 the label breaks a same-date tie',"src/r6-intake.mjs","said(a)!==said(b)?(said(a)<said(b)?a:b):",""],
 ['QE-14 the projection reads the untrimmed count',"src/r6-program.mjs","Number.isInteger(x.fittedSets)?x.fittedSets:x.sets));","x.sets));"],
 ['R20 the ceiling reads the last exposure, not the largest whole count',"src/r6-program.mjs","ex.lastExecutedSets=Math.max(...whole);","ex.lastExecutedSets=whole.at(-1);"],
 ['QE-14 a fatigue reduction is not a reduction',"src/r6-adaptation.mjs",",...(e.exposure?{exposure:{...e.exposure,phasedSets:Math.min(e.exposure.phasedSets??e.sets,Math.max(1,e.sets-1))}}:{})",""],
 ['QE-15 a rebuild forgets the entry week',"src/r6-program.mjs","const entryWeek=ss.entryWeek===true||[...inUse]","const entryWeek=[...inUse]"],
 ['QE-16 a new report can claim to be history',"src/r6-provenance.mjs","if(!carried){delete o.superseded;delete o.supersededBy;delete o.supersededAt;}\n  if(carried&&o.superseded===true){","if(o.superseded===true){"],
 ['QE-17 the review reads a practice row by its role',"src/r6-adaptation.mjs","practice:e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE'","practice:e.role==='PRACTICE'"],
 ['D55 a fresh exercise in a returning week starts outside the return',"src/r6-program.mjs",":returningWeek?{returnInBlock:true,",":false?{returnInBlock:true,"]
];
// A surviving mutant is accepted only with a stated reason and the search that backs it (searched, not proven equivalent).
const DOCUMENTED={'Counts from the first executed exposure':'Not pinned by any R7-A test: a known test gap, not an equivalent mutant. The engineering re-check (QE-R7A-22, R7A-QE-r2) reached it: after a return, a systemic-fatigue reduction in the middle of a set-cap week; R7A-FREEZE-2 keeps the cap there (correct) and the revert releases it. The author\'s reach search (probes/r7a-mutant-reach-search.out.json, A = 0) was too narrow. Pinned in the first cycle (13/13) while the ceiling read the last exposure; carried open and non-blocking'};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7a-mut-')),results=[];
try{
 const copyDir=(rel)=>fs.cpSync(path.join(cc,rel),path.join(tmp,'CoachingCore',rel),{recursive:true});
 for(const rel of ['src','r6/fixtures'])copyDir(rel);
 fs.mkdirSync(path.join(tmp,'CoachingCore/test'),{recursive:true});
 for(const t of TESTS)fs.copyFileSync(path.join(cc,t),path.join(tmp,'CoachingCore',t));
 fs.copyFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),path.join(tmp,'CoachingCore/r6/PROGRAM_POLICY_R6.json'));
 fs.copyFileSync(path.join(cc,'package.json'),path.join(tmp,'CoachingCore/package.json'));
 const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024});const failed=[...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter(n=>n!=='failing tests:');return {code:r.status,failed:[...new Set(failed)]};};
 const clean=run();if(clean.code!==0)throw Error('The unmutated copy fails: '+clean.failed.join('; '));
 for(const [name,file,from,to] of MUTATIONS){
  const f=path.join(tmp,'CoachingCore',file),orig=fs.readFileSync(f,'utf8');
  if(orig.split(from).length!==2){results.push({mutation:name,applied:false,reason:'anchor not found exactly once'});continue;}
  fs.writeFileSync(f,orig.replace(from,()=>to));
  const r=run();fs.writeFileSync(f,orig);
  results.push({mutation:name,applied:true,caught:r.code!==0,failingTests:r.failed,...(r.code===0&&DOCUMENTED[name]?{documented:DOCUMENTED[name]}:{})});
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const out={check:'R7A-MUTATION-2',runAt:new Date().toISOString(),scope:TESTS.join(' + ')+' against single-fix reverts in a temporary copy',caught:results.filter(r=>r.caught).length,total:results.length,documentedSurvivors:results.filter(r=>!r.caught&&r.documented).length,undocumentedSurvivors:results.filter(r=>!r.caught&&!r.documented).map(r=>r.mutation),results};
fs.writeFileSync(path.join(import.meta.dirname,'mutation-check-r7a.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({caught:out.caught,total:out.total,missed:results.filter(r=>!r.caught).map(r=>r.mutation+(r.applied?'':' (not applied)'))}));
