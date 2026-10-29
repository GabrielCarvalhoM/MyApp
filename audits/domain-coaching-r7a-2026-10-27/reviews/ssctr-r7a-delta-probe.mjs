// SSCTR R7A-SSCTR-r1 delta probe (DOMAIN_COACHING_R7-A, runtime R7A-FREEZE-1, policy R6-POLICY-5 hash 18ec48f3...).
// Reviewer-authored, read-only use of two runtimes: the frozen candidate (CoachingCore/) and the R6 closure snapshot that SSCTR round 12
// reviewed (../pre-r7a-source/CoachingCore, r6-program.mjs 57973e97...). DEV_TEST_ONLY authority (r6/fixtures/dev-authority.mjs of each
// runtime), bound to the unchanged policy hash; never the real authority. Synthetic and offline; observations only, not quality evidence.
// The harness (intake, review, observation, scripted timelines, noisy logs, the AI grid) is adapted from my round-12 instrument
// (ssctr-probe-runtime-d53-r12.mjs); the audits below are new. Nothing under CoachingCore/ or the snapshot is written.
// Sections: BIND (file hashes), PG (D54 / item 2b / Q2: re-establishment rows in every phase, against bounds and twins), RA (D53 / Q1:
// regain trajectory under reading A = count before the phase reduction and reading B = the reduced count, plus a strict variant and an
// executed-jump check), SW (item 4 / Q3: split weeks, four execution cases), RS (item 5: a substitute during return step 2), MR (item 6:
// sets logged without repetitions), FR (item 7: a fatigue-reduced week after a re-establishment), MV (item 8: moves across day phases).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const HERE=import.meta.dirname,ROOT=path.resolve(HERE,'../../..');
const BASES={cur:path.join(ROOT,'CoachingCore'),pre:path.resolve(HERE,'../pre-r7a-source/CoachingCore')};
const EXPECTED='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c';
async function loadRt(name){
 const base=BASES[name],L=rel=>import(pathToFileURL(path.join(base,rel)).href);
 const idx=await L('src/r6-index.mjs'),dev=await L('r6/fixtures/dev-authority.mjs');
 const auth=dev.devAuthority();if(auth.policyHash!==EXPECTED)throw new Error(name+': policy hash '+auth.policyHash);
 return {name,gen:idx.generateProgram,ev:idx.evaluateProgram,auth,opts:{authority:auth}};
}
const RTS={cur:await loadRt('cur'),pre:await loadRt('pre')};
const POL=RTS.cur.auth.policy,OP=POL.operational,E=OP.event,ST=OP.strength,RET=OP.return,GD=ST.goalDoses;
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const out={probe:'R7A-SSCTR-r1-delta-probe',policyHash:RTS.cur.auth.policyHash,authorityUsed:'DEV_TEST_ONLY devAuthority() of each runtime, bound to the unchanged policy hash',node:process.version,sections:{}};
const guard=(name,fn)=>{const t0=Date.now();try{out.sections[name]=fn();}catch(e){out.sections[name]={error:String(e?.stack??e).slice(0,1500)};}out.sections[name].ms=Date.now()-t0;};

// ---------------------------------------------------------------- harness (adapted from my round-12 instrument)
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake({id,asOf='2026-11-01',startDate='2026-11-02',weeks=16,athlete={},schedule={},...rest}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
let N=0;
const rv=(p,w,{day=6,kind='WEEKLY_REVIEW',tag='x',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`ssctr7a-${tag}-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
/** Execution report as prescribed; over[id] = {load, reps, rir, noRir, noReps, sets}. */
function obs(p,s,{over={},eventId=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{};const load=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:o.sets??e.sets},()=>{const set={load};if(!o.noReps)set.reps=o.reps??e.reps;if(!o.noRir)set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`ssctr7a-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};
}
/**
 * One weekly-reviewed timeline on runtime rt. act(P,w,z) -> 'EXEC' | 'MISS' | 'NODETAIL'; loads(P,w,z) -> per-exercise overrides;
 * pre[w](P,ledger,rt) -> an extra review evaluated before week w's weekly review (its proposal is applied). Records executed dates
 * (done), logged dates (logged) and the gates each weekly review returned (G).
 */
function run(rt,{tag,ia,weeks=16,act=()=>'EXEC',loads=null,pre=null,until=null}){
 const g=rt.gen(intake({id:'ssctr7a-'+tag,weeks,...ia}),rt.opts),P0=g.program;
 if(!P0)return {tag,status:g.status??'NO_PROGRAM',errors:g.errors??g.reason??null};
 let p=P0,ledger=[];const done={},logged={},log=[],G={},extras=[],end=until??p.weeks.length-1;
 const mark=(m,id,d)=>{(m[id]??=[]).push(d);};
 for(let w=0;w<end;w++){
  const list=[];
  if(pre?.[w]){const {review,observe}=pre[w](p,ledger,list);const r=rt.ev(p,{...review,actualLedger:ledger},rt.opts);extras.push({w,status:r.status,action:r.action,counterfactuals:(r.counterfactuals??[]).map(c=>({id:c.id,admissible:c.admissible??null,selected:!!c.selected,reason:c.reason??null}))});log.push(`${w}+:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;if(observe)list.push(...observe);}
  for(const z of p.weeks[w].sessions.filter(z=>z.prescription)){
   if(list.some(o=>o.sessionId===z.id))continue;
   const a=act(p,w,z)??'EXEC';if(a==='MISS')continue;
   const base=obs(p,z,{over:loads?.(p,w,z)??{}});
   if(z.sport==='STRENGTH'){
    if(a==='NODETAIL'){delete base.actual.exercises;for(const e of z.prescription.exercises)mark(done,e.id,z.date);}
    else for(const e of base.actual.exercises){mark(done,e.id,z.date);mark(logged,e.id,z.date);}
   }
   list.push(base);
  }
  const r=rt.ev(p,rv(p,w,{tag,observations:list,actualLedger:ledger}),rt.opts);
  G[w]={status:r.status,action:r.action,gates:r.gates??null};
  log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }
 return {tag,P0,P:p,done,logged,log,G,extras};
}
const rowsOf=(P,w)=>(P.weeks[w]?.sessions??[]).filter(z=>z.sport==='STRENGTH'&&z.prescription).flatMap(z=>z.prescription.exercises.map(e=>({w,session:z.id,day:z.day,date:z.date,id:e.id,role:e.role,mode:e.load.mode,value:e.load.value??null,sets:e.sets,reps:e.reps,rir:e.rir,exposure:e.exposure??null,note:(e.instructions??[]).find(t=>/^(Not done|No usable load|Return entry|Return step)/.test(t))??null})));
const kindOf=r=>r.exposure?.kind??(r.note&&/^Not done for more than/.test(r.note)?'REESTABLISH':r.note&&/^No usable load/.test(r.note)?'UNLOGGED':r.note&&/^Return entry/.test(r.note)?'RETURN_ENTRY':r.note&&/^Return step/.test(r.note)?'RETURN_STEP':r.mode);
const doseOf=r=>`${r.sets}x${r.reps}@${r.rir} ${r.mode}${r.value!=null?' '+r.value:''}`;
const gateFor=(G,w,id)=>{const g=G?.[w]?.gates;if(!g)return G?.[w]?'NO_GATES':'NO_REVIEW';return g[id]??g.STRENGTH??'HOLD';};
const weekOfDate=(P,d)=>P.weeks.findIndex((x,i)=>d>=x.startDate&&(i+1>=P.weeks.length||d<P.weeks[i+1].startDate));
const loggedInWeek=(t,id,w)=>(t.logged[id]??[]).some(d=>weekOfDate(t.P,d)===w);
const REDUCED=['CONSOLIDATION','SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'];
// My own day-phase reading of operational.event.proximitySemantics (days to the race), independent of the runtime's dayPhaseOf.
function dayPhaseIndep(P,w,date){
 const ph=P.phases.phases[w];if(!Number.isInteger(P.phases.raceWeek))return ph;
 const race=addDays(P.startDate,P.phases.raceWeek*7+P.phases.raceDay),b=gap(date,race),taperWeeks=Math.max(0,P.phases.raceWeek-(P.phases.taperStart??P.phases.raceWeek));
 if(b>=1&&b<=E.raceWindowDays)return 'RACE_WEEK';
 if(b>E.raceWindowDays&&b<=E.raceWindowDays+7*taperWeeks&&!['TAPER','RACE_WEEK','POST_EVENT'].includes(ph))return 'TAPER';
 return ph;
}
// My own reading of the phase reduction (operational.strength.consolidationSetReduction, operational.event) on a count n.
const phasedIndep=(n,phase)=>phase==='CONSOLIDATION'?Math.max(1,n-ST.consolidationSetReduction):phase==='SPECIFIC'?Math.max(1,n-1):phase==='TAPER'?Math.max(1,Math.round(Math.max(1,n-1)*E.taperStrengthSetFraction)):phase==='RACE_WEEK'?E.raceWeekStrengthSets:phase==='POST_EVENT'?E.postEventStrengthSets:n;
const phaseMinRir=phase=>['RACE_WEEK','POST_EVENT'].includes(phase)?E.raceWeekStrengthMinimumRir:['SPECIFIC','TAPER'].includes(phase)?3:null;
const noisyLoads=known=>{const n={},knownIds=new Set(known.map(k=>k.id));return (P,w,z)=>{const o={};for(const e of z.prescription?.exercises??[]){if(knownIds.has(e.id)||e.load.mode==='BODYWEIGHT')continue;n[e.id]=(n[e.id]??0)+1;o[e.id]={load:{value:n[e.id]%2?20:40,unit:'KG',convention:e.load.convention}};}return o;};};
const tally=(m,k)=>{m[k]=(m[k]??0)+1;};

/**
 * Regain audit of one timeline (D53, Q1). For every week r0 with a performed re-establishment row of an exercise:
 *  c0A = the count before the phase reduction of the first performed re-establishment row (exposure.baseSets; on the pre runtime the
 *        row was never reduced, so its sets); c0B = the prescribed (reduced) count of the week's last re-establishment row (my round-12 audit).
 *  Allowances rise by one for each week that executed its whole count: logged that week, gate ADVANCE or EARNED, and the last executed
 *  row's sets equal to its count before the phase reduction ("lenient" = the runtime's reading). "strict" also requires that the day phase
 *  of that row is not a reduced phase (consolidation, specific, taper, race window, post-event), i.e. a phase week never moves the count.
 *  Every later week's count before the phase reduction (max over its rows) is compared with the allowances until the exercise reaches
 *  the count it would otherwise have, a return step, the next re-establishment or the end.
 *  executedJump: a later prescribed row more than one set above every exposure executed since the re-establishment.
 */
function regainAudit(t,label){
 const {P}=t,o={reestablishments:0,reducedReestablishments:0,maskedReducedWeeks:0,violationsA:[],violationsAstrict:[],violationsB:[],violationsBnotReducedPattern:[],executedJumps:[],traces:[],stop:{}};
 const by={};for(let w=0;w<P.weeks.length;w++)for(const r of rowsOf(P,w))((by[r.id]??={})[w]??=[]).push(r);
 const done=id=>t.done[id]??[];
 for(const [id,W] of Object.entries(by)){
  const ws=Object.keys(W).map(Number).sort((a,b)=>a-b);
  for(const r0 of ws){
   const re=W[r0].filter(r=>kindOf(r)==='REESTABLISH'&&done(id).includes(r.date)).sort((a,b)=>a.date<b.date?-1:1);if(!re.length)continue;
   o.reestablishments++;
   const first=re[0],c0A=Number.isInteger(first.exposure?.baseSets)?first.exposure.baseSets:first.sets,c0B=W[r0].at(-1).sets,reduced=first.sets<c0A;if(reduced)o.reducedReestablishments++;
   let aA=c0A,aS=c0A,aB=c0B,stop='END',maxExec=Math.max(...re.map(r=>r.sets));
   const step=k=>{const ex=W[k].filter(r=>done(id).includes(r.date)).sort((a,b)=>a.date<b.date?-1:1),last=ex.at(-1);if(!last)return 'notExecuted';
    const base=Number.isInteger(last.exposure?.baseSets)?last.exposure.baseSets:t.P.stateTrace[k].strength.planned?.[id]?.baseSets??last.sets,un=last.sets===base,dp=dayPhaseIndep(P,k,last.date),g=gateFor(t.G,k,id),ok=loggedInWeek(t,id,k)&&['ADVANCE','EARNED'].includes(g);
    if(un&&ok){aA++;aB++;if(!REDUCED.includes(dp))aS++;else o.maskedReducedWeeks++;}
    return `${un?'':'reduced '}${ok?'':g}`;};
   const traj=[`w${r0} RE ${re.map(r=>r.sets+'/'+(r.exposure?.baseSets??r.sets)+' '+dayPhaseIndep(P,r0,r.date).slice(0,5)).join('+')} ${step(r0)}`.trim()];
   for(const k of ws.filter(k=>k>r0)){
    const st=P.stateTrace[k].strength.exercises[id];
    if(st&&Number.isInteger(st.returnStep)){stop='RETURN';break;}
    if(W[k].some(r=>kindOf(r)==='REESTABLISH')){stop='NEXT_REESTABLISHMENT';break;}
    const bases=W[k].map(r=>Number.isInteger(r.exposure?.baseSets)?r.exposure.baseSets:P.stateTrace[k].strength.planned?.[id]?.baseSets??null).filter(Number.isInteger);if(!bases.length){stop='NO_COUNT';break;}
    const base=Math.max(...bases),normal=W[k].map(r=>r.exposure?.normalSets??P.stateTrace[k].strength.planned?.[id]?.normalSets??null).find(Number.isInteger)??null,sets=Math.max(...W[k].map(r=>r.sets));
    const desc=`${label} ${id}: ${traj.join(' | ')} | w${k} ${sets}/${base}/${normal} ${P.phases.phases[k].slice(0,5)}`;
    if(base>aA)o.violationsA.push(`${desc} > A ${aA}`);
    if(base>aS)o.violationsAstrict.push(`${desc} > Astrict ${aS}`);
    if(base>aB){o.violationsB.push(`${desc} > B ${aB}`);if(!reduced)o.violationsBnotReducedPattern.push(`${desc} > B ${aB}`);}
    if(sets>maxExec+1)o.executedJumps.push(`${desc}: ${sets} sets > ${maxExec}+1`);
    for(const r of W[k])if(done(id).includes(r.date))maxExec=Math.max(maxExec,r.sets);
    traj.push(`w${k} ${sets}/${base} ${P.phases.phases[k].slice(0,5)} ${step(k)}`.trim());
    if(normal!==null&&base>=normal){stop='REACHED_NORMAL';break;}
   }
   tally(o.stop,stop);o.traces.push(`${label} ${id}: ${traj.join(' | ')} [${stop}]`);
  }
 }
 return o;
}
const mergeRA=list=>{const m={timelines:list.length,reestablishments:0,reducedReestablishments:0,maskedReducedWeeks:0,violationsA:[],violationsAstrict:[],violationsB:[],violationsBnotReducedPattern:[],executedJumps:[],stop:{},traces:[]};for(const a of list){for(const k of ['reestablishments','reducedReestablishments','maskedReducedWeeks'])m[k]+=a[k];for(const k of ['violationsA','violationsAstrict','violationsB','violationsBnotReducedPattern','executedJumps','traces'])m[k].push(...a[k]);for(const [k,n] of Object.entries(a.stop))m.stop[k]=(m.stop[k]??0)+n;}return m;};
const summRA=(m,keep=8)=>({timelines:m.timelines,reestablishments:m.reestablishments,reducedReestablishments:m.reducedReestablishments,maskedReducedWeeksCountedAsUnreduced:m.maskedReducedWeeks,violationsReadingA:m.violationsA.length,violationsReadingAstrict:m.violationsAstrict.length,violationsReadingB:m.violationsB.length,readingBViolationsNotFromAReducedReestablishment:m.violationsBnotReducedPattern.length,executedJumpsAboveOneSet:m.executedJumps.length,stop:m.stop,examplesA:m.violationsA.slice(0,keep),examplesAstrict:m.violationsAstrict.slice(0,keep),examplesB:m.violationsB.slice(0,4),examplesBnotReduced:m.violationsBnotReducedPattern.slice(0,keep),examplesExecutedJump:m.executedJumps.slice(0,keep),sampleTraces:m.traces.filter(x=>/RE 1\//.test(x)).slice(0,6)});

// ---------------------------------------------------------------- BIND
guard('BIND',()=>{
 const fr=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json'),'utf8'));let mismatch=[];
 for(const [f,h] of Object.entries(fr.files))if(sha(path.join(ROOT,'CoachingCore',f))!==h)mismatch.push(f);
 const pre=JSON.parse(fs.readFileSync(path.resolve(HERE,'../pre-r7a-source/MANIFEST.json'),'utf8'));let preBad=[];
 for(const [f,h] of Object.entries(pre.files))if(sha(path.resolve(HERE,'../pre-r7a-source',f))!==h)preBad.push(f);
 return {freeze:fr.revision,freezeFiles:Object.keys(fr.files).length,freezeMismatches:mismatch,policyFileSha256:sha(path.join(ROOT,'CoachingCore/r6/PROGRAM_POLICY_R6.json')),preSnapshotFiles:Object.keys(pre.files).length,preSnapshotMismatches:preBad,preR6Program:sha(path.resolve(HERE,'../pre-r7a-source/CoachingCore/src/r6-program.mjs'))};
});

// ---------------------------------------------------------------- PG. re-establishment rows in every phase (D54, item 2b, Q2)
// Race programs (10K, half marathon; race on Sunday of week 13) and no-event programs; goals STRENGTH, HYPERTROPHY, RUNNING_SUPPORT,
// GENERAL and MAINTAIN; a known squat, RDL and bench, no known exercise (logs as prescribed) or no known exercise with noisy logs
// (pending establishment logs, D45); strength on Monday/Thursday or Monday/Wednesday/Friday. For each phase X (first week of X from
// week 6; BUILD/DEVELOPMENT included) strength is missed in the five weeks before it. Every re-establishment row in weeks wX and wX+1 is
// checked against the declared bounds (race window / post-event: main lifts only, at most 1 set, RIR >= 4; specific / taper RIR >= 3),
// against min(goal sets for the role, 2), against my own phase reduction of the count it states (current runtime), and against the twin
// executed throughout (same exercise, same date). The regain afterwards is audited with regainAudit.
const PG_RESULTS={};
for(const rtName of ['cur','pre']){
 const rt=RTS[rtName],res={timelines:0,noProgram:[],rows:0,byPhaseDose:{},violations:{bounds:[],aboveGoalCap:[],aboveOwnPhaseDose:[],aboveTwin:[],rirBelowTwinPhaseMinimum:[]},buildRowsAboveTwin:[],twinMissing:0},audits=[];
 for(const kind of ['10K','HALF_MARATHON',null])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','GENERAL','MAINTAIN'])for(const kl of ['known','none','noisy'])for(const days of [[0,3],[0,2,4]]){
  const known=kl==='known'?[SQUAT,RDL,BENCH]:[];
  const ia={athlete:{goals:{run:kind?{kind:'RACE',event:{kind,date:addDays('2026-11-02',13*7+6)}}:'PERFORMANCE',strength:goal},knownExercises:known,exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:days.length}},schedule:{runDays:[1,3,6].filter(d=>!days.includes(d)).concat(days.includes(3)?[5]:[]).sort(),strengthDays:days,longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
  ia.schedule.runDays=days.length===3?[1,3,6]:[1,4,6];ia.schedule.longRunDay=6;
  const label=`pg-${rtName}-${kind??'noEvent'}-${goal}-${kl}-${days.join('')}`,loads=kl==='noisy'?noisyLoads(known):null;
  const twin=run(rt,{tag:label+'-twin',ia,loads});if(!twin.P){res.noProgram.push(label+' '+twin.status);continue;}
  const ph=twin.P.phases.phases,phases=[...new Set(ph)].filter(X=>X!=='ESTABLISHMENT'),gd=GD[goal]??GD.GENERAL;
  for(const X of phases){
   const wX=ph.findIndex((p,i)=>p===X&&i>=6);if(wX<0||wX+1>=ph.length)continue;
   const t=run(rt,{tag:`${label}-${X}`,ia,loads:loads?noisyLoads(known):null,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=wX-5&&w<wX?'MISS':'EXEC'});if(!t.P){res.noProgram.push(`${label}-${X} ${t.status}`);continue;}
   res.timelines++;audits.push(regainAudit(t,`${label}-${X}`));
   for(let k=wX;k<Math.min(t.P.weeks.length,wX+2);k++)for(const r of rowsOf(t.P,k).filter(r=>kindOf(r)==='REESTABLISH')){
    res.rows++;const dp=dayPhaseIndep(t.P,k,r.date),line=`${label} w${k} ${r.date} ${dp} ${r.id} (${r.role}): ${doseOf(r)}`;tally(res.byPhaseDose,`${dp} ${r.role} ${r.sets}@${r.rir}`);
    if(['RACE_WEEK','POST_EVENT'].includes(dp)&&(r.role!=='MAIN'||r.sets>1||r.rir<E.raceWeekStrengthMinimumRir)||phaseMinRir(dp)!==null&&r.rir<phaseMinRir(dp))res.violations.bounds.push(line);
    const cap=Math.min(r.role==='MAIN'?gd.sets:Math.max(1,gd.sets-1),2);if(r.sets>cap)res.violations.aboveGoalCap.push(`${line} > ${cap}`);
    if(Number.isInteger(r.exposure?.phaseBasis)&&r.sets>Math.min(cap,phasedIndep(r.exposure.phaseBasis,dp)))res.violations.aboveOwnPhaseDose.push(`${line} basis ${r.exposure.phaseBasis}`);
    const tw=rowsOf(twin.P,k).find(x=>x.id===r.id&&x.date===r.date);
    if(!tw){res.twinMissing++;continue;}
    if(r.sets>tw.sets){(REDUCED.includes(dp)?res.violations.aboveTwin:res.buildRowsAboveTwin).push(`${line} vs twin ${doseOf(tw)}`);}
    if(phaseMinRir(dp)!==null&&r.rir<phaseMinRir(dp))res.violations.rirBelowTwinPhaseMinimum.push(`${line} vs twin ${doseOf(tw)}`);
   }
  }
 }
 const m=mergeRA(audits);
 PG_RESULTS[rtName]={...res,violationCounts:Object.fromEntries(Object.entries(res.violations).map(([k,v])=>[k,v.length])),violations:Object.fromEntries(Object.entries(res.violations).map(([k,v])=>[k,v.slice(0,10)])),buildRowsAboveTwinCount:res.buildRowsAboveTwin.length,buildRowsAboveTwin:res.buildRowsAboveTwin.slice(0,6),regain:summRA(m)};
}
guard('PG_phaseGrid',()=>PG_RESULTS);

// ---------------------------------------------------------------- RA. the round-12 AI grid under readings A and B (D53, Q1)
// Same grid as my round-12 AI: FIXED, EVERY_2_WEEKS, EVERY_6_WEEKS, COACH_DECIDES; STRENGTH, HYPERTROPHY, GENERAL, RUNNING_SUPPORT;
// a known squat and bench or none; strength on Mon/Fri or Mon/Wed/Fri; strength missed 4 or 5 weeks from week 2, 4 or 6; every week
// reviewed; 16 weeks; logs as prescribed, and a noisy-log variant on the len 5 half (pending establishment logs).
const AI_GRID=[];
for(const pref of ['FIXED','EVERY_2_WEEKS','EVERY_6_WEEKS','COACH_DECIDES'])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [kl,known] of [['known',[SQUAT,BENCH]],['none',[]]])for(const days of [[0,4],[0,2,4]])for(const from of [2,4,6])for(const len of [4,5])AI_GRID.push({pref,goal,kl,known,days,from,len});
const aiIntake=x=>({athlete:{goals:{run:'PERFORMANCE',strength:x.goal},strengthExperience:'INTERMEDIATE',knownExercises:x.known,exerciseRotationPreference:x.pref,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:x.days.length}},schedule:{strengthDays:x.days,runDays:[1,3,6],longRunDay:6}});
guard('RA_regainReadings',()=>{
 const res={};
 for(const rtName of ['cur','pre']){
  const rt=RTS[rtName],plain=[],noisy=[],noProgram=[];
  for(const x of AI_GRID){const tag=`ra-${rtName}-${x.pref}-${x.goal}-${x.kl}-${x.days.join('')}-${x.from}-${x.len}`;const t=run(rt,{tag,ia:aiIntake(x),act:(P,w,z)=>z.sport==='STRENGTH'&&w>=x.from&&w<x.from+x.len?'MISS':'EXEC'});if(!t.P){noProgram.push(tag);continue;}plain.push(regainAudit(t,tag));}
  for(const x of AI_GRID.filter(x=>x.len===5)){const tag=`ra-${rtName}-noisy-${x.pref}-${x.goal}-${x.kl}-${x.days.join('')}-${x.from}`;const t=run(rt,{tag,ia:aiIntake(x),loads:noisyLoads(x.known),act:(P,w,z)=>z.sport==='STRENGTH'&&w>=x.from&&w<x.from+x.len?'MISS':'EXEC'});if(!t.P){noProgram.push(tag);continue;}noisy.push(regainAudit(t,tag));}
  res[rtName]={noProgram,asPrescribed:summRA(mergeRA(plain)),noisyLogs:summRA(mergeRA(noisy))};
 }
 return res;
});

// ---------------------------------------------------------------- SW. split weeks (item 4, Q3)
// HYPERTROPHY, known squat and bench, strength Mon/Wed/Fri, runs Tue/Sat. The exercise prescribed twice in week 1 is performed only in
// its first session of week 1; strength is missed in weeks 2-4; in week 5 its first exposure falls 28 days after the last one (known
// row) and its second more than 28 days after (re-establishment row). Four week-5 cases: first only, second only, both, neither.
guard('SW_splitWeeks',()=>{
 const res={};
 for(const rtName of ['cur','pre']){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
  const P0=rt.gen(intake({id:'sw-probe',weeks:12,...ia}),rt.opts).program;
  const by={};for(const r of rowsOf(P0,1))(by[r.id]??=[]).push(r);
  const X=Object.entries(by).filter(([,l])=>l.length>=2&&l.every(r=>r.mode==='KNOWN')).sort((a,b)=>b[1].length-a[1].length)[0]?.[0];
  const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X)).map(s=>s.id);
  const st=e=>e?{mode:e.mode,load:e.load??null,ceiling:e.ceiling??null,reps:e.reps??null,sets:e.sets??null,priorSets:e.priorSets??null,regainCap:e.regainCap??null,lastExecutedSets:e.lastExecutedSets??null,lastPerformed:e.lastPerformed??null,source:e.source??null}:null;
  res[rtName]={exercise:X};
  for(const [name,pick] of [['firstOnly',l=>l.slice(0,1)],['secondOnly',l=>l.slice(1,2)],['both',l=>l.slice(0,2)],['neither',()=>[]]]){
   const t=run(rt,{tag:`sw-${rtName}-${name}`,ia,weeks:12,until:8,act:(P,w,s)=>{if(s.sport!=='STRENGTH')return 'EXEC';const sx=sessX(P,w);if(w===1)return s.id===sx[0]?'EXEC':'MISS';if(w>=2&&w<=4)return 'MISS';if(w===5)return pick(sx).includes(s.id)?'EXEC':'MISS';return 'EXEC';}});
   if(!t.P){res[rtName][name]={status:t.status};continue;}
   const row=k=>rowsOf(t.P,k).filter(r=>r.id===X).map(r=>`${r.date} ${doseOf(r)}${kindOf(r)==='REESTABLISH'?' RE':''}`);
   res[rtName][name]={log:t.log.slice(4,8).join(' '),week5:row(5),stateAfterWeek5:st(t.P.stateTrace[6].strength.exercises[X]),week6:row(6),week7:row(7),stateAfterWeek6:st(t.P.stateTrace[7].strength.exercises[X])};
  }
 }
 return res;
});

// ---------------------------------------------------------------- RS. a substitute during return step 2 (item 5)
// The author's C11 setup (EVERY_2_WEEKS rotation, a 16-day TRAVEL break after the rotated-in accessories left, an equipment window
// without the barbell from return step 2): the substitute's row against the row of the exercise it replaces in the same week of the
// unchanged program, and the substitute in the following week. Goals HYPERTROPHY and RUNNING_SUPPORT.
guard('RS_returnSubstitute',()=>{
 const res={};
 for(const rtName of ['cur','pre'])for(const goal of ['HYPERTROPHY','RUNNING_SUPPORT','STRENGTH']){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'EVERY_2_WEEKS'},schedule:{strengthDays:[0,4]}};
  const g=rt.gen(intake({id:'rs-probe',weeks:16,...ia}),rt.opts);let p=g.program;if(!p){res[`${rtName}-${goal}`]={status:g.status};continue;}
  let ledger=[];const step=(w,extra={},list=null)=>{const r=rt.ev(p,rv(p,w,{tag:'rs'+rtName+goal,observations:list??p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger,...extra}),rt.opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
  const used=w=>[...new Set(rowsOf(p,w).map(r=>r.id))];
  let w1=null,w2=null;for(let w=1;w<p.weeks.length-6&&w1===null;w++)if(used(w).some(id=>!used(0).includes(id)))w1=w;
  if(w1===null){res[`${rtName}-${goal}`]={error:'no rotation turn'};continue;}
  const B=used(w1).filter(id=>!used(0).includes(id));for(let w=w1+1;w<p.weeks.length-5&&w2===null;w++)if(!used(w).some(id=>B.includes(id)))w2=w;
  if(w2===null){res[`${rtName}-${goal}`]={error:'rotated-in never leave'};continue;}
  for(let w=0;w<=w2;w++)step(w);
  const ret=step(w2+1,{kind:'RETURN_AFTER_PAUSE',day:6,interruption:{days:16,startDate:addDays(p.weeks[w2+1].startDate,-9),endDate:addDays(p.weeks[w2+1].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
  const e1=w2+2,s2=e1+1;step(e1);
  const before=rowsOf(p,s2).map(r=>`${r.date} ${r.id} (${r.role}) ${doseOf(r)} ${kindOf(r)}`);
  const eq=rt.ev(p,rv(p,e1,{day:6,kind:'EQUIPMENT_CHANGE',tag:'rs-eq'+rtName+goal,changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[s2].startDate,to:addDays(p.weeks[s2].startDate,13)},actualLedger:ledger}),rt.opts);
  const Q=eq.proposal;const after=Q?rowsOf(Q,s2).map(r=>`${r.date} ${r.id} (${r.role}) ${doseOf(r)} ${kindOf(r)}`):null;
  const newIds=Q?rowsOf(Q,s2).filter(r=>!p.stateTrace[s2].strength.exercises[r.id]).map(r=>r.id):[];
  res[`${rtName}-${goal}`]={returnReview:`${ret.status}/${ret.action}`,substitution:`${eq.status}/${eq.action}`,step2Week:s2,step2BeforeSubstitution:before,step2AfterSubstitution:after,newExercises:newIds,newExerciseNextWeek:Q?rowsOf(Q,s2+1).filter(r=>newIds.includes(r.id)).map(r=>`${r.date} ${r.id} ${doseOf(r)} ${kindOf(r)}`):null};
 }
 return res;
});

// ---------------------------------------------------------------- MR. sets logged without repetitions (item 6)
// STRENGTH, known squat and bench, Mon/Fri. Weeks 1 and 2: every strength set logged (a) without reps (RIR as prescribed), (b) without
// reps and without RIR, (c) with reps 2 below the target (control: missed reps), (d) without reps and RIR 2 below the prescription.
guard('MR_missingReps',()=>{
 const res={};
 for(const rtName of ['cur','pre'])for(const [name,o] of [['noReps',{noReps:true}],['noRepsNoRir',{noReps:true,noRir:true}],['repsBelowTarget',{reps:-2}],['noRepsLowRir',{noReps:true,rir:-2}]]){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}};
  const t=run(rt,{tag:`mr-${rtName}-${name}`,ia,weeks:8,until:5,loads:(P,w,z)=>w>=1&&w<=2?Object.fromEntries(z.prescription.exercises.map(e=>[e.id,{...(o.noReps?{noReps:true}:{}),...(o.noRir?{noRir:true}:{}),...(o.reps?{reps:e.reps+o.reps}:{}),...(o.rir?{rir:e.rir+o.rir}:{})}])):{}});
  if(!t.P){res[`${rtName}-${name}`]={status:t.status};continue;}
  const sq=w=>rowsOf(t.P,w).filter(r=>r.id==='back-squat').map(doseOf).join(' + ');
  res[`${rtName}-${name}`]={log:t.log.join(' '),gates:[1,2,3].map(w=>gateFor(t.G,w,'back-squat')),squatWeeks2to4:[2,3,4].map(sq),stateReps:[2,3,4].map(w=>t.P.stateTrace[w].strength.exercises['back-squat']?.reps??null)};
 }
 return res;
});

// ---------------------------------------------------------------- FR. a fatigue-reduced week after a re-establishment (item 7)
// STRENGTH, known squat, RDL and bench, Mon/Thu strength, FIXED. Strength missed weeks 1-5; week 6 re-establishes. In week 7 a
// SYSTEMIC_FATIGUE review on Tuesday reduces Thursday's session (main lifts, one set fewer, RIR >= 4); the athlete executes it. Twin: no
// fatigue review. Counts of every exercise in Thursday's session in weeks 6-9.
guard('FR_fatigueReducedWeek',()=>{
 const res={};
 for(const rtName of ['cur','pre'])for(const fatigue of [false,true]){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,RDL,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}};
  const pre=fatigue?{7:(p)=>({review:{...rv(p,7,{day:1,kind:'SYSTEMIC_FATIGUE',tag:'fr'+rtName}),signals:{region:'ALL'},observations:p.weeks[7].sessions.filter(s=>s.prescription&&s.day<=1).map(s=>obs(p,s))},observe:null})}:null;
  const t=run(rt,{tag:`fr-${rtName}-${fatigue}`,ia,weeks:12,until:10,pre,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=1&&w<=5?'MISS':'EXEC'});
  if(!t.P){res[`${rtName}-${fatigue?'fatigue':'twin'}`]={status:t.status};continue;}
  const thu=t.P.weeks[7].sessions.find(s=>s.sport==='STRENGTH'&&s.day===3&&s.prescription);const ids=thu?thu.prescription.exercises.filter(e=>e.role==='MAIN').map(e=>e.id):[];
  res[`${rtName}-${fatigue?'fatigue':'twin'}`]={log:t.log.slice(5,10).join(' '),extras:t.extras.map(x=>`${x.w}:${x.status}/${x.action}`),rows:Object.fromEntries(ids.map(id=>[id,[6,7,8,9].map(w=>`w${w} `+rowsOf(t.P,w).filter(r=>r.id===id).map(r=>doseOf(r)+(r.exposure?` [${r.exposure.kind} ${r.exposure.baseSets}]`:'')).join(' + '))])),regainCap:Object.fromEntries(ids.map(id=>[id,[7,8,9,10].map(w=>t.P.stateTrace[w]?.strength?.exercises?.[id]?.regainCap??null)]))};
 }
 return res;
});

// ---------------------------------------------------------------- MV. moves across day phases (item 8)
// 10K on Wednesday of week 13 (raceDay 2), so the last days of the last specific week are taper days by days to the race. Runs on
// Tue/Thu/Sat, strength Mon/Fri. The key session of the earliest day of the last specific week is missed and reported on that day.
guard('MV_movesAcrossDayPhases',()=>{
 const res={};
 for(const rtName of ['cur','pre'])for(const ev of ['10K','HALF_MARATHON']){
  const rt=RTS[rtName],race=addDays('2026-11-02',13*7+2);
  const ia={athlete:{goals:{run:{kind:'RACE',event:{kind:ev,date:race}},strength:'RUNNING_SUPPORT'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,5],strengthDays:[0,4],longRunDay:5,runMinutes:60,longRunMinutes:100,strengthMinutes:50}};
  const g=rt.gen(intake({id:'mv-probe',weeks:16,...ia}),rt.opts);let p=g.program;if(!p){res[`${rtName}-${ev}`]={status:g.status};continue;}
  const ph=p.phases.phases,wS=ph.lastIndexOf('SPECIFIC');let ledger=[];
  for(let w=0;w<wS;w++){const r=rt.ev(p,rv(p,w,{tag:'mv'+rtName+ev,observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),rt.opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;}
  const week=p.weeks[wS],keys=week.sessions.filter(s=>s.key&&s.prescription).sort((a,b)=>a.day-b.day),target=keys[0];
  if(!target){res[`${rtName}-${ev}`]={error:'no key session',phases:ph.join(',')};continue;}
  const dayPh=week.sessions.map(s=>`d${s.day} ${s.sport} ${s.role} ${dayPhaseIndep(p,wS,s.date)}`);
  const r=rt.ev(p,{...rv(p,wS,{day:target.day,kind:'MISSED_SESSION',tag:'mv-miss'+rtName+ev}),targetSessionId:target.id,observations:week.sessions.filter(s=>s.prescription&&s.day<target.day).map(s=>obs(p,s)),actualLedger:ledger},rt.opts);
  const moved=r.proposal?r.proposal.weeks[wS].sessions.filter(s=>s.moved).map(s=>`${s.id} d${s.day} ${s.role} ${dayPhaseIndep(p,wS,s.date)}`):[];
  res[`${rtName}-${ev}`]={phases:ph.join(','),lastSpecificWeek:wS,target:`${target.id} ${target.role} d${target.day} ${dayPhaseIndep(p,wS,target.date)}`,dayPhases:dayPh,decision:`${r.status}/${r.action}`,moveCandidates:(r.counterfactuals??[]).filter(c=>/^MOVE_TO_/.test(c.id)).map(c=>`${c.id} admissible ${c.admissible} selected ${!!c.selected}`),moved};
 }
 return res;
});

fs.writeFileSync(path.join(HERE,'ssctr-r7a-delta-probe.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(out.sections).map(([k,v])=>[k,v.error?'ERROR '+v.error.slice(0,300):'ok '+v.ms+'ms']))));
