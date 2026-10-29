// SSCTR R7A-SSCTR-r2 single narrow re-check probe (DOMAIN_COACHING_R7-A; runtime R7A-FREEZE-2, source digest f56ae974...; policy R6-POLICY-5,
// canonical hash 18ec48f3..., unchanged). Reviewer-authored, read-only. Three runtimes:
//   f2  = CoachingCore/ (R7A-FREEZE-2; every bound file is checked against RUNTIME_FREEZE_R7A_2.json before anything is loaded);
//   f1  = a scratch reconstruction of R7A-FREEZE-1 (the FREEZE-2 tree with dossier/RUNTIME_DELTA_R7A_CYCLE2.diff reverse-applied), given as the
//         first argument; every file is checked against RUNTIME_FREEZE_R7A_1.json and the probe aborts on any mismatch;
//   pre = ../pre-r7a-source/CoachingCore (the R6 closure runtime SSCTR round 12 reviewed), checked against its manifest.
// DEV_TEST_ONLY devAuthority() of each runtime, bound to the unchanged policy hash; never the real authority. Synthetic and offline;
// observations only, not quality evidence. Nothing under CoachingCore/ is written.
// Composition: this header; a byte copy of lines 31-150 of ssctr-r7a-delta-probe.mjs (my R7A-SSCTR-r1 harness and regain audit; between
// the HARNESS markers); then the re-check sections. Sections: D55 (S1), S2 (HOLD/REGRESS repetition target), S3 (return later the same
// day; a session that waits), S4 (event change reaching this week), S5 (moves keep their date's dose), S6 (time fit, fatigue reduction,
// return ceiling: split weeks, FR2, fitted regain and return grids with and without a later budget increase), S7 (entry week kept through a
// rebuild), ITEM8 (moves across day phases, my R7A-SSCTR-r1 MV section), D56 (minimal timelines for the time-fit finding of S6).
// Usage: node ssctr-r7a-recheck-probe.mjs <F1_BASE> [SECTION,...]   (output: ssctr-r7a-recheck-probe.out.json, or .<sections>.out.json)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const HERE=import.meta.dirname,ROOT=path.resolve(HERE,'../../..'),CC=path.join(ROOT,'CoachingCore');
if(!process.argv[2])throw new Error('usage: node ssctr-r7a-recheck-probe.mjs <F1_BASE> [SECTION,...]');
const F1=path.resolve(process.argv[2],'CoachingCore'),PRE=path.resolve(HERE,'../pre-r7a-source/CoachingCore'),ONLY=process.argv[3]?new Set(process.argv[3].split(',')):null;
const EXPECTED='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c';
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const FR2=JSON.parse(fs.readFileSync(path.join(CC,'r7/RUNTIME_FREEZE_R7A_2.json'),'utf8')),FR1=JSON.parse(fs.readFileSync(path.join(CC,'r7/RUNTIME_FREEZE_R7A_1.json'),'utf8'));
const PREM=JSON.parse(fs.readFileSync(path.resolve(HERE,'../pre-r7a-source/MANIFEST.json'),'utf8')).files;
const bad=(base,files)=>Object.entries(files).filter(([f,h])=>!fs.existsSync(path.join(base,f))||sha(path.join(base,f))!==h).map(([f])=>f);
const BIND={freeze2:{revision:FR2.revision,sourceDigest:FR2.sourceDigest,files:Object.keys(FR2.files).length,mismatches:bad(CC,FR2.files)},freeze1Reconstruction:{revision:FR1.revision,sourceDigest:FR1.sourceDigest,files:Object.keys(FR1.files).length,mismatches:bad(F1,FR1.files)},preSnapshot:{files:Object.keys(PREM).length,mismatches:bad(path.resolve(HERE,'../pre-r7a-source'),PREM)}};
if(BIND.freeze2.mismatches.length||FR2.sourceDigest!=='f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c'||BIND.freeze1Reconstruction.mismatches.length||BIND.preSnapshot.mismatches.length)throw new Error('binding failed: '+JSON.stringify(BIND));
async function loadRt(name,base){
 const L=rel=>import(pathToFileURL(path.join(base,rel)).href);
 const idx=await L('src/r6-index.mjs'),dev=await L('r6/fixtures/dev-authority.mjs');
 const auth=dev.devAuthority();if(auth.policyHash!==EXPECTED)throw new Error(name+': policy hash '+auth.policyHash);
 return {name,gen:idx.generateProgram,ev:idx.evaluateProgram,auth,opts:{authority:auth}};
}
const RTS={f2:await loadRt('f2',CC),f1:await loadRt('f1',F1),pre:await loadRt('pre',PRE)};
const POL=RTS.f2.auth.policy,OP=POL.operational,E=OP.event,ST=OP.strength,RET=OP.return,GD=ST.goalDoses;
const out={probe:'R7A-SSCTR-r2-recheck-probe',bind:BIND,policyHash:RTS.f2.auth.policyHash,authorityUsed:'DEV_TEST_ONLY devAuthority() of each runtime, bound to the unchanged policy hash',node:process.version,sections:{}};
const guard=(name,fn)=>{if(ONLY&&!ONLY.has(name))return;const t0=Date.now();try{out.sections[name]=fn();}catch(e){out.sections[name]={error:String(e?.stack??e).slice(0,1500)};}out.sections[name].ms=Date.now()-t0;};
// ==================================================================== HARNESS (byte copy of ssctr-r7a-delta-probe.mjs lines 31-150)
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
// ==================================================================== END HARNESS
// ---------------------------------------------------------------- re-check helpers (new)
/** A review at a stated hour (UTC; the synthetic athletes have no offset). */
const rvAt=(p,w,{day=6,hour='21',kind='WEEKLY_REVIEW',tag='rc',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`ssctr7a2-${tag}-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
/** A reviewed program: step(w, review fields, observations) reviews week w (as prescribed when no list is given). */
function stepper(rt,p0,tag){
 const t={p:p0,ledger:[],log:[]};
 t.step=(w,extra={},list=null)=>{const r=rt.ev(t.p,rvAt(t.p,w,{tag,observations:list??t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(t.p,s)),actualLedger:t.ledger,...extra}),rt.opts);t.log.push(`${w}:${r.status}/${r.action}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
 return t;
}
const travel=(p,w,day,days=16)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:addDays(p.weeks[w].startDate,day-days),endDate:addDays(p.weeks[w].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'}});
const sessDesc=s=>`${s.id} ${s.date} d${s.day} ${s.sport} ${s.role??''}${s.status?' '+s.status:''}: `+(!s.prescription?'none':s.prescription.modality==='RUN'?`${s.prescription.family} ${s.prescription.durationMinutes}min`+(s.prescription.work?` ${s.prescription.work.repetitions}x${s.prescription.work.workMinutes}`:''):s.prescription.exercises.map(e=>`${e.id}(${e.role}) ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''}${e.exposure?' '+e.exposure.kind:''}`).join('; '));
/** One weekly-reviewed timeline with an optional extra review after the weekly review of week w (post[w](P) -> review fields). */
function runX(rt,{tag,ia,weeks=16,act=()=>'EXEC',post=null}){
 const g=rt.gen(intake({id:'rc-'+tag,weeks,...ia}),rt.opts);let p=g.program;if(!p)return {tag,status:g.status??'NO_PROGRAM'};
 let ledger=[];const done={},logged={},G={},extras=[],log=[];
 for(let w=0;w<p.weeks.length-1;w++){
  const list=[];
  for(const z of p.weeks[w].sessions.filter(z=>z.prescription&&z.status!=='SKIPPED')){const a=act(p,w,z)??'EXEC';if(a==='MISS')continue;const o=obs(p,z);if(z.sport==='STRENGTH')for(const e of o.actual.exercises){(done[e.id]??=[]).push(z.date);(logged[e.id]??=[]).push(z.date);}list.push(o);}
  const r=rt.ev(p,rv(p,w,{tag,observations:list,actualLedger:ledger}),rt.opts);G[w]={status:r.status,action:r.action,gates:r.gates??null};log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
  if(post?.[w]){const x=post[w](p);const r2=rt.ev(p,rv(p,w,{tag:tag+'-post',...x,actualLedger:ledger}),rt.opts);extras.push(`${w}:${x.kind}:${r2.status}/${r2.action}`);ledger=r2.actualLedger??ledger;if(r2.proposal)p=r2.proposal;}
 }
 return {tag,P:p,done,logged,G,extras,log};
}
/** Weeks where a regain or return cap rose although every executed row of the exercise that week was fitted below its count. */
function fittedRises(t){
 const f=[];
 for(let w=0;w<t.P.weeks.length-1;w++){const rs=rowsOf(t.P,w);for(const id of new Set(rs.map(r=>r.id))){
  const s0=t.P.stateTrace[w].strength.exercises[id],s1=t.P.stateTrace[w+1]?.strength?.exercises?.[id];if(!s0||!s1)continue;
  for(const k of ['regainCap','setCap']){if(!Number.isInteger(s0[k]))continue;const rose=(Number.isInteger(s1[k])?s1[k]:99)>s0[k],ex=rs.filter(r=>r.id===id&&(t.done[id]??[]).includes(r.date));
   if(rose&&ex.length&&ex.every(r=>Number.isInteger(r.exposure?.baseSets)&&r.sets<r.exposure.baseSets&&(r.exposure.phasedSets??r.sets)===r.exposure.baseSets))f.push(`${t.tag} ${id} w${w} ${k} ${s0[k]}->${s1[k]??'ended'} executed ${ex.map(r=>r.sets+'/'+r.exposure.phasedSets+'/'+r.exposure.baseSets).join('+')}`);}
 }}
 return f;
}
/** From week `from` for `span` weeks: a prescribed count more than one set above every count of that exercise executed since `from`. */
function execJumps(t,from,span=7){
 const flags=[],ids=new Set();for(let w=from;w<Math.min(t.P.weeks.length,from+span);w++)for(const r of rowsOf(t.P,w))ids.add(r.id);
 for(const id of ids){let maxExec=0;for(let w=from;w<Math.min(t.P.weeks.length-1,from+span);w++){const rs=rowsOf(t.P,w).filter(r=>r.id===id);if(!rs.length)continue;const pres=Math.max(...rs.map(r=>r.sets));
  if(maxExec>=1&&pres>maxExec+1)flags.push(`${t.tag} ${id} w${w} ${t.P.phases.phases[w].slice(0,5)} ${pres} > ${maxExec}+1 [${rs.map(r=>r.sets+'/'+(r.exposure?.phasedSets??'?')+'/'+(r.exposure?.baseSets??'?')+' '+kindOf(r)).join(' + ')}]`);
  for(const r of rs)if((t.done[id]??[]).includes(r.date))maxExec=Math.max(maxExec,r.sets);}}
 return flags;
}
/** Event bounds for the strength rows of week w by my own day-phase reading (operational.event; proximitySemantics). */
function eventRowChecks(P,w){
 const v=[],windowSessions=[];if(!Number.isInteger(P.phases.raceWeek))return {violations:v,windowSessions};
 const race=addDays(P.startDate,P.phases.raceWeek*7+P.phases.raceDay);
 for(const s of P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED')){
  const dp=dayPhaseIndep(P,w,s.date),b=gap(s.date,race);if(dp==='RACE_WEEK')windowSessions.push(s.id);
  if(dp==='RACE_WEEK'&&b<E.raceWeekStrengthMinDaysBeforeRace)v.push(`${s.id} ${b} days before the race`);
  for(const e of s.prescription.exercises){
   if(['RACE_WEEK','POST_EVENT'].includes(dp)&&(e.role!=='MAIN'||e.sets>(dp==='RACE_WEEK'?E.raceWeekStrengthSets:E.postEventStrengthSets)||e.rir<E.raceWeekStrengthMinimumRir))v.push(`${s.id} ${dp} ${e.id}(${e.role}) ${e.sets}@${e.rir}`);
   if(['SPECIFIC','TAPER'].includes(dp)&&e.rir<3)v.push(`${s.id} ${dp} ${e.id} RIR ${e.rir}`);
   if(Number.isInteger(e.exposure?.phaseBasis)&&e.sets>phasedIndep(e.exposure.phaseBasis,dp))v.push(`${s.id} ${dp} ${e.id} ${e.sets} > phase dose of ${e.exposure.phaseBasis}`);
  }
 }
 if(windowSessions.length>1)v.push('more than one race-window strength session: '+windowSessions.join(','));
 return {violations:v,windowSessions};
}
const rotationTurn=(p,used)=>{let w1=null,w2=null;for(let w=1;w<p.weeks.length-6&&w1===null;w++)if(used(w).some(id=>!used(0).includes(id)))w1=w;const B=w1===null?[]:used(w1).filter(id=>!used(0).includes(id));for(let w=(w1??0)+1;w<p.weeks.length-5&&w2===null;w++)if(!used(w).some(id=>B.includes(id)))w2=w;return w2;};

// ---------------------------------------------------------------- D55 (S1): an exercise first set up while the exercises in use are in the return steps
// My RS2 setup through the real review path (16-day TRAVEL break; entry week executed; substitution from return step 2), extended to
// s2+4 and to two more variants: the break one week later (windowShift1: return step 2 no longer in the same block position) and a permanent
// move to a gym without a barbell at return step 2 (permanentMachines: new main lifts first set up in return step 2). For every exercise
// first set up in s2: blocksDone after s2, the week-to-week rise and the rise above the largest count executed since s2; plus the rows of
// the exercises in use and of the replaced back squat (R23).
guard('D55',()=>{
 const res={},summary={};
 for(const rtName of ['f2','f1','pre'])for(const pref of ['EVERY_2_WEEKS','FIXED'])for(const goal of ['HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'])for(const variant of ['window','windowShift1','permanentMachines']){
  const rt=RTS[rtName],key=`${rtName}|${pref}|${goal}|${variant}`,ia={athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:pref},schedule:{strengthDays:[0,4]}};
  const g=rt.gen(intake({id:'rc-d55',weeks:16,...ia}),rt.opts);if(!g.program){res[key]={status:g.status};continue;}
  const t=stepper(rt,g.program,'d55'+key),used=w=>[...new Set(rowsOf(t.p,w).map(r=>r.id))];
  let w2=pref==='FIXED'?4:rotationTurn(t.p,used);if(w2===null){res[key]={error:'no rotation turn'};continue;}if(variant==='windowShift1')w2++;
  for(let w=0;w<=w2;w++)t.step(w);
  const ret=t.step(w2+1,{day:6,interruption:{days:16,startDate:addDays(t.p.weeks[w2+1].startDate,-9),endDate:addDays(t.p.weeks[w2+1].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'},kind:'RETURN_AFTER_PAUSE'},[]);
  const e1=w2+2,s2=e1+1;t.step(e1);
  const changes=variant==='permanentMachines'?{equipment:['MACHINES','DUMBBELLS','BENCH']}:{equipment:['DUMBBELLS','BENCH'],from:t.p.weeks[s2].startDate,to:addDays(t.p.weeks[s2].startDate,13)};
  const eq=rt.ev(t.p,rvAt(t.p,e1,{day:6,kind:'EQUIPMENT_CHANGE',tag:'d55eq'+key,changes,actualLedger:t.ledger}),rt.opts);if(eq.proposal)t.p=eq.proposal;
  const inUse=used(s2).filter(id=>Number.isInteger(t.p.stateTrace[s2].strength.exercises[id]?.returnStep));
  const fresh=used(s2).filter(id=>!t.p.stateTrace[s2].strength.exercises[id]);
  const last=Math.min(t.p.weeks.length-2,s2+4);for(let w=s2;w<=last;w++)t.step(w);
  const most=(w,id)=>Math.max(0,...rowsOf(t.p,w).filter(r=>r.id===id).map(r=>r.sets));
  const traj=id=>Array.from({length:last-e1+1},(_,i)=>e1+i).map(w=>`w${w} ${t.p.phases.phases[w].slice(0,5)} `+(rowsOf(t.p,w).filter(r=>r.id===id).map(r=>doseOf(r)+' '+kindOf(r)).join(' + ')||'-'));
  const st=(w,id)=>{const e=t.p.stateTrace[w]?.strength?.exercises?.[id];return e?{blocksDone:e.blocksDone??0,returnStep:e.returnStep??null,returnInBlock:e.returnInBlock??null,regainCap:e.regainCap??null,setCap:e.setCap??null}:null;};
  const freshChecks=fresh.map(id=>{const ws=[];for(let w=s2;w<=last;w++)ws.push(most(w,id));let maxRise=0,aboveExec=0,ex=0;for(let i=0;i<ws.length;i++){if(ws[i]&&ex)aboveExec=Math.max(aboveExec,ws[i]-ex);if(i&&ws[i]&&ws[i-1])maxRise=Math.max(maxRise,ws[i]-ws[i-1]);ex=Math.max(ex,ws[i]);}
   return {id,setsByWeekFromS2:ws,maxWeekToWeekRise:maxRise,maxAboveLargestExecuted:aboveExec,state:[s2+1,s2+2,s2+3].map(w=>st(w,id))};});
  const blockEnds=t.p.blocks.map(b=>b.endWeekExclusive-1);
  res[key]={returnReview:`${ret.status}/${ret.action}`,equipment:`${eq.status}/${eq.action}`,entryWeek:e1,step2Week:s2,step2IsBlockEnd:blockEnds.includes(s2),phases:t.p.phases.phases.slice(e1,last+1).join(','),inUse,fresh:freshChecks,rows:Object.fromEntries([...new Set([...fresh,...inUse.slice(0,3),'back-squat'])].map(id=>[id,traj(id)])),backSquatAboveLargestExecutedSinceEntry:(()=>{let ex=0,above=0;for(let w=e1;w<=last;w++){const n=most(w,'back-squat');if(n&&ex)above=Math.max(above,n-ex);ex=Math.max(ex,n);}return above;})(),reviews:t.log.slice(-(last-s2+1)).join(' ')};
  const s=summary[rtName]??={configs:0,freshExercises:0,blockSetAfterS2:0,weekToWeekRiseAboveOne:0,aboveLargestExecutedPlusOne:0,freshAboveInUseInS2:0,backSquatAboveExecutedPlusOne:0};
  s.configs++;if(res[key].backSquatAboveLargestExecutedSinceEntry>1)s.backSquatAboveExecutedPlusOne++;
  for(const f of freshChecks){s.freshExercises++;if(f.state.some(x=>(x?.blocksDone??0)>0))s.blockSetAfterS2++;if(f.maxWeekToWeekRise>1)s.weekToWeekRiseAboveOne++;if(f.maxAboveLargestExecuted>1)s.aboveLargestExecutedPlusOne++;if(inUse.length&&f.setsByWeekFromS2[0]>Math.max(...inUse.map(id=>most(s2,id))))s.freshAboveInUseInS2++;}
 }
 return {summary,res};
});

// ---------------------------------------------------------------- S2: HOLD and REGRESS repeat the repetition target (QE-R7A-12)
// (a) my MR2 cases; (b) shortfalls at the known load repeated in weeks 0-3 (one short set, all short, last set short, all short with a low
// reserve), STRENGTH and HYPERTROPHY; (c) a log at a lower load with fewer repetitions (residual check, not a cycle-2 change); (d) my SW
// "secondOnly" re-establishment logged at the earlier load with two repetitions fewer than its row, and as prescribed.
guard('S2',()=>{
 const res={mr2:{},shortfall:{},lowerLoad:{},reestablishShort:{}};
 for(const rtName of ['f2','f1'])for(const [name,o] of [['noReps',{noReps:true}],['noRepsNoRir',{noReps:true,noRir:true}],['repsBelowTarget',{reps:-2}],['noRepsLowRir',{noReps:true,rir:-2}]]){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}};
  const t=run(rt,{tag:`rc-mr2-${rtName}-${name}`,ia,weeks:8,until:5,loads:(P,w,z)=>z.sport==='STRENGTH'&&w>=1&&w<=2?Object.fromEntries(z.prescription.exercises.map(e=>[e.id,{...(o.noReps?{noReps:true}:{}),...(o.noRir?{noRir:true}:{}),...(o.reps?{reps:e.reps+o.reps}:{}),...(o.rir?{rir:e.rir+o.rir}:{})}])):{}});
  if(!t.P){res.mr2[`${rtName}-${name}`]={status:t.status};continue;}
  const sq=w=>rowsOf(t.P,w).filter(r=>r.id==='back-squat').map(doseOf).join(' + ');
  res.mr2[`${rtName}-${name}`]={gatesWeeks1to3:[1,2,3].map(w=>gateFor(t.G,w,'back-squat')),squatWeeks1to4:[1,2,3,4].map(sq),stateRepsAfterWeeks1to3:[2,3,4].map(w=>t.P.stateTrace[w].strength.exercises['back-squat']?.reps??null),stateLoadAfterWeeks1to3:[2,3,4].map(w=>t.P.stateTrace[w].strength.exercises['back-squat']?.load??null)};
 }
 const patterns={oneShortSet:(r,n,i)=>i===1?r-2:r,allShort:r=>r-2,lastSetShort:(r,n,i)=>i===n-1?r-3:r-1,allShortLowRir:r=>r-2};
 const squatLog=(o,fn,{rirDelta=0,loadDelta=0}={})=>{o.actual.exercises=o.actual.exercises.map(e=>{if(e.id!=='back-squat')return e;const n=e.sets.length;return {...e,sets:e.sets.map((s,i)=>({...s,reps:fn(s.reps,n,i),...(rirDelta?{rir:s.rir+rirDelta}:{}),...(loadDelta&&s.load?{load:{...s.load,value:s.load.value+loadDelta}}:{})}))};});return o;};
 for(const rtName of ['f2','f1'])for(const goal of ['STRENGTH','HYPERTROPHY'])for(const [pname,fn] of Object.entries(patterns)){
  const rt=RTS[rtName],g=rt.gen(intake({id:'rc-s2',weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}}),rt.opts);if(!g.program){res.shortfall[`${rtName}|${goal}|${pname}`]={status:g.status};continue;}
  const t=stepper(rt,g.program,'s2'+rtName+goal+pname),gates=[];
  for(let w=0;w<4;w++){const list=t.p.weeks[w].sessions.filter(s=>s.prescription).map(s=>{const o=obs(t.p,s);return s.sport==='STRENGTH'?squatLog(o,fn,{rirDelta:pname==='allShortLowRir'?-2:0}):o;});const r=t.step(w,{},list);gates.push(r.gates?.['back-squat']??r.gates?.STRENGTH??null);}
  const range=(GD[goal]??GD.GENERAL).repRange;
  res.shortfall[`${rtName}|${goal}|${pname}`]={goalRepRange:range,gatesWeeks0to3:gates,squatWeeks0to4:[0,1,2,3,4].map(w=>rowsOf(t.p,w).filter(r=>r.id==='back-squat').map(doseOf).join(' + ')),stateRepsAfterWeeks0to3:[1,2,3,4].map(w=>t.p.stateTrace[w].strength.exercises['back-squat']?.reps??null),repTargetBelowGoalRange:[1,2,3,4].some(w=>rowsOf(t.p,w).some(r=>r.id==='back-squat'&&r.reps<range[0]))};
 }
 for(const rtName of ['f2','f1'])for(const [name,opt] of [['lowerLoadFewerReps',{loadDelta:-5,fn:r=>r-2}],['lowerLoadTargetMet',{loadDelta:-5,fn:r=>r}]]){
  const rt=RTS[rtName],g=rt.gen(intake({id:'rc-s2l',weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}}),rt.opts),t=stepper(rt,g.program,'s2l'+rtName+name);
  const list=t.p.weeks[0].sessions.filter(s=>s.prescription).map(s=>{const o=obs(t.p,s);return s.sport==='STRENGTH'?squatLog(o,opt.fn,{loadDelta:opt.loadDelta}):o;});const r=t.step(0,{},list);t.step(1);
  res.lowerLoad[`${rtName}|${name}`]={gate:r.gates?.['back-squat']??null,action:r.action,squatWeeks0to2:[0,1,2].map(w=>rowsOf(t.p,w).filter(x=>x.id==='back-squat').map(doseOf).join(' + ')),stateAfterWeek0:(({reps,load})=>({reps,load}))(t.p.stateTrace[1].strength.exercises['back-squat']??{})};
 }
 for(const rtName of ['f2','f1'])for(const [name,dr] of [['twoRepsShortAtEarlierLoad',-2],['asPrescribedAtEarlierLoad',0]]){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
  const P0=rt.gen(intake({id:'rc-s2re',weeks:12,...ia}),rt.opts).program,X='db-bench-press';
  const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X)).map(s=>s.id);
  const t=stepper(rt,P0,'s2re'+rtName+name);let reRow=null;
  for(let w=0;w<8;w++){const sx=sessX(t.p,w);const list=t.p.weeks[w].sessions.filter(s=>s.prescription&&(s.sport!=='STRENGTH'||w===0||w===1&&s.id===sx[0]||w===5&&s.id===sx[1]||w>=6)).map(s=>{const o=obs(t.p,s);if(w===5&&s.id===sx[1]){reRow=s.prescription.exercises.find(e=>e.id===X);o.actual.exercises=o.actual.exercises.map(e=>e.id===X?{...e,sets:e.sets.map(z=>({...z,load:{value:18,unit:'KG',convention:'PER_HAND'},reps:reRow.reps+dr}))}:e);}return o;});t.step(w,{},list);}
  const st=t.p.stateTrace[6].strength.exercises[X];
  res.reestablishShort[`${rtName}|${name}`]={reestablishmentRow:reRow?`${reRow.sets}x${reRow.reps}@${reRow.rir} ${reRow.load.mode} ${reRow.exposure?.kind??''}`:null,week5Log:t.log[5],stateAfterWeek5:st?{mode:st.mode,load:st.load,reps:st.reps,regainCap:st.regainCap??null}:null,benchWeek6:rowsOf(t.p,6).filter(r=>r.id===X).map(doseOf),repRange:GD.HYPERTROPHY.repRange};
 }
 return res;
});

// ---------------------------------------------------------------- S3: a return re-plans what is still ahead the same day; a session that waits
// HYPERTROPHY, known squat and bench, runs Tue/Thu/Sun AM, strength Mon/Thu PM. Weeks before the break executed and reviewed, weeks inside
// it reviewed with nothing executed, the return reported in week 5 at the stated hour with what was done before the break (and, where
// stated, the same-day sessions already done). Every session of week 5 from the review day, against its pre-return prescription.
guard('S3',()=>{
 const res={};
 const cases=[['moderate17_thu0700_unreported',17,2,3,'07',false],['moderate17_thu2100_reported',17,2,3,'21',true],['moderate17_sun0700_oneAhead',17,5,6,'07',false],['moderate17_sat2100_oneAhead',17,4,5,'21',true],['short5_sun0700_oneAhead',5,5,6,'07',false],['short5_thu0700_unreported',5,2,3,'07',false]];
 for(const rtName of ['f2','f1'])for(const [name,days,endDay,reviewDay,hour,reportSameDay] of cases){
  const rt=RTS[rtName],W=5,ia={athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{runDays:[1,3,6],strengthDays:[0,3],runTurn:'AM',strengthTurn:'PM',longRunDay:6}};
  const g=rt.gen(intake({id:'rc-s3',weeks:12,...ia}),rt.opts);if(!g.program){res[`${rtName}|${name}`]={status:g.status};continue;}
  const t=stepper(rt,g.program,'s3'+rtName+name),end=addDays(t.p.weeks[W].startDate,endDay),startD=addDays(end,-(days-1));
  for(let w=0;w<W;w++)t.step(w,{},t.p.weeks[w].sessions.filter(s=>s.prescription&&s.date<startD).map(s=>obs(t.p,s)));
  const before=new Map(t.p.weeks[W].sessions.map(s=>[s.id,JSON.stringify(s.prescription)])),revDate=addDays(t.p.weeks[W].startDate,reviewDay);
  const list=t.p.weeks[W].sessions.filter(s=>s.prescription&&(s.date<startD||reportSameDay&&s.date===revDate&&(s.turn==='AM'||hour>='20'))).map(s=>obs(t.p,s));
  const r=t.step(W,{day:reviewDay,hour,kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:startD,endDate:end,reasonCategory:'TRAVEL',reason:'Travel'}},list);
  const P=t.p,d=P.decisions?.at(-1);
  res[`${rtName}|${name}`]={review:`${r.status}/${r.action}`,returnClass:r.decision?.returnClass??d?.returnClass??null,fromWeek:d?.fromWeek??null,reported:list.map(o=>o.sessionId),week5FromReviewDay:P.weeks[W].sessions.filter(s=>s.day>=reviewDay).map(s=>sessDesc(s)+(before.get(s.id)===JSON.stringify(s.prescription)?' [unchanged]':' [re-planned]')),week6FirstSessions:P.weeks[W+1].sessions.filter(s=>s.prescription).slice(0,3).map(sessDesc)};
 }
 return res;
});

// ---------------------------------------------------------------- S4: an event change that reaches this week (QE-R7A-03)
// RUNNING_SUPPORT 10K athlete, runs Tue/Thu/Sat (long Saturday), strength Mon/Thu. (a) Race on Sunday of week 13 moved, on Monday of week 6 at
// 07:00 (before Monday's strength), to Monday of week 7. (b) In race week (Monday of week 13, 07:00) the race is postponed to Sunday of week 14.
// The re-planned week against my own day-phase reading of proximitySemantics and against a twin program generated with the new date.
guard('S4',()=>{
 const res={},start='2026-11-02';
 const ia=date=>({athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date}},strength:'RUNNING_SUPPORT'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,5],strengthDays:[0,3],longRunDay:5,runMinutes:60,longRunMinutes:100,strengthMinutes:50}});
 for(const [name,raceDate,W,newDate] of [['movedCloser',addDays(start,13*7+6),6,addDays(start,7*7)],['postponedInRaceWeek',addDays(start,13*7+6),13,addDays(start,14*7+6)]])for(const rtName of ['f2','f1']){
  const rt=RTS[rtName],g=rt.gen(intake({id:'rc-s4',weeks:16,...ia(raceDate)}),rt.opts);if(!g.program){res[`${rtName}|${name}`]={status:g.status};continue;}
  const t=stepper(rt,g.program,'s4'+rtName+name);for(let w=0;w<W;w++)t.step(w);
  const beforeW=t.p.weeks[W].sessions.map(sessDesc);
  const r=t.step(W,{day:0,hour:'07',kind:'EVENT_DATE_CHANGE',changes:{eventDate:newDate}},[]);
  const P=t.p,twin=rt.gen(intake({id:'rc-s4',weeks:16,...ia(newDate)}),rt.opts).program;
  const roles=x=>x.weeks[W].sessions.map(s=>`d${s.day} ${s.sport} ${s.role??''} ${s.prescription?.modality==='RUN'?s.prescription.family:s.prescription?s.prescription.exercises.map(e=>e.sets+'@'+e.rir+(e.role==='MAIN'?'M':'A')).join(','):'-'}`);
  res[`${rtName}|${name}`]={review:`${r.status}/${r.action}`,reason:r.reason??null,fromWeek:P.decisions?.at(-1)?.fromWeek??null,newRaceWeek:P.phases.raceWeek,newPhasesFromW:P.phases.phases.slice(W,W+3).join(','),weekBefore:beforeW,weekAfter:P.weeks[W].sessions.map(s=>sessDesc(s)+' ['+dayPhaseIndep(P,W,s.date)+']'),raceSessionsInWeek:P.weeks[W].sessions.filter(s=>s.role==='RACE').map(s=>s.id+' '+s.date),eventRowChecks:eventRowChecks(P,W),nextWeek:P.weeks[W+1].sessions.map(s=>sessDesc(s)+' ['+dayPhaseIndep(P,W+1,s.date)+']'),twinWeekRoles:twin?roles(twin):null,reviewedWeekRoles:roles(P),rolesEqualTwin:twin?JSON.stringify(roles(twin))===JSON.stringify(roles(P)):null};
 }
 return res;
});

// ---------------------------------------------------------------- S5: moves keep the dose their new date allows (QE-R7A-10; R24)
// STRENGTH, known squat and bench, strength Mon/Wed/Fri, runs Tue/Thu/Sat. Week 0: one strength session executed (Monday: the exercises
// cross the 28-day window between Monday and Wednesday of week 4; Friday: control, they do not); weeks 1-3: strength missed; week 4: the
// Monday strength session is missed and reported that evening.
guard('S5',()=>{
 const res={};
 for(const rtName of ['f2','f1'])for(const [name,keepDay] of [['crossesWindow',0],['control',4]]){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,3,5],longRunDay:5}};
  const g=rt.gen(intake({id:'rc-s5',weeks:12,...ia}),rt.opts);if(!g.program){res[`${rtName}|${name}`]={status:g.status};continue;}
  const t=stepper(rt,g.program,'s5'+rtName+name);
  for(let w=0;w<4;w++)t.step(w,{},t.p.weeks[w].sessions.filter(s=>s.prescription&&(s.sport!=='STRENGTH'||w===0&&s.day===keepDay)).map(s=>obs(t.p,s)));
  const week=t.p.weeks[4],target=week.sessions.find(s=>s.sport==='STRENGTH'&&s.day===0&&s.prescription);
  const st=t.p.stateTrace[4].strength.exercises;
  const r=rt.ev(t.p,{...rvAt(t.p,4,{day:0,hour:'21',kind:'MISSED_SESSION',tag:'s5m'+rtName+name}),targetSessionId:target.id,observations:[],actualLedger:t.ledger},rt.opts);
  const Q=r.proposal,moved=Q?Q.weeks[4].sessions.filter(s=>s.moved).map(sessDesc):[];
  res[`${rtName}|${name}`]={target:sessDesc(target),targetKey:!!target.key,lastPerformed:Object.fromEntries(target.prescription.exercises.map(e=>[e.id,st[e.id]?.lastPerformed??null])),daysFromLastPerformedToWedFri:Object.fromEntries(target.prescription.exercises.map(e=>[e.id,st[e.id]?.lastPerformed?[2,4].map(d=>gap(st[e.id].lastPerformed,addDays(week.startDate,d))):null])),laterStrengthSessions:week.sessions.filter(s=>s.sport==='STRENGTH'&&s.day>0).map(sessDesc),decision:`${r.status}/${r.action}`,moveCandidates:(r.counterfactuals??[]).filter(c=>/^MOVE_TO_/.test(c.id)).map(c=>`${c.id} admissible ${c.admissible} selected ${!!c.selected}`),counterfactuals:(r.counterfactuals??[]).map(c=>`${c.id} ${c.admissible} ${!!c.selected}`),moved,debt:r.proposal?.weeks?.[4]?.sessions?.filter(s=>s.debt||s.makeUp).map(s=>s.id)??[]};
 }
 return res;
});

// ---------------------------------------------------------------- S6: time fit, fatigue reduction and the return ceiling (QE-R7A-14; R20)
// (a) my SW split weeks (R7A-SSCTR-r1, Q3) with the return ceiling (lastExecutedSets) and the regain cap; (b) my FR2 fatigue-reduced week;
// (c) re-establishments under tight time budgets (one or two strength days, 25-35 min): my regain audit, fully fitted cap rises and
// executed jumps; (d) the same timelines with the budget raised to 75 min after the week following the re-establishment; (e) 16-day returns
// under the same budgets, with and without a budget raised to 75 min after the week after the entry: executed jumps over seven weeks.
guard('S6',()=>{
 const res={splitWeeks:{},fatigue:{},fittedRegain:{},fittedReturn:{}};
 for(const rtName of ['f2','f1']){
  const rt=RTS[rtName],ia={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
  const P0=rt.gen(intake({id:'sw-probe',weeks:12,...ia}),rt.opts).program;
  const by={};for(const r of rowsOf(P0,1))(by[r.id]??=[]).push(r);
  const X=Object.entries(by).filter(([,l])=>l.length>=2&&l.every(r=>r.mode==='KNOWN')).sort((a,b)=>b[1].length-a[1].length)[0]?.[0];
  const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X)).map(s=>s.id);
  const st=e=>e?{mode:e.mode,load:e.load??null,ceiling:e.ceiling??null,reps:e.reps??null,sets:e.sets??null,priorSets:e.priorSets??null,regainCap:e.regainCap??null,lastExecutedSets:e.lastExecutedSets??null}:null;
  res.splitWeeks[rtName]={exercise:X};
  for(const [name,pick] of [['firstOnly',l=>l.slice(0,1)],['secondOnly',l=>l.slice(1,2)],['both',l=>l.slice(0,2)],['neither',()=>[]]]){
   const t=run(rt,{tag:`rc-sw-${rtName}-${name}`,ia,weeks:12,until:8,act:(P,w,s)=>{if(s.sport!=='STRENGTH')return 'EXEC';const sx=sessX(P,w);if(w===1)return s.id===sx[0]?'EXEC':'MISS';if(w>=2&&w<=4)return 'MISS';if(w===5)return pick(sx).includes(s.id)?'EXEC':'MISS';return 'EXEC';}});
   if(!t.P){res.splitWeeks[rtName][name]={status:t.status};continue;}
   const row=k=>rowsOf(t.P,k).filter(r=>r.id===X).map(r=>`${r.date} ${doseOf(r)}${kindOf(r)==='REESTABLISH'?' RE':''}`);
   res.splitWeeks[rtName][name]={week5:row(5),stateAfterWeek5:st(t.P.stateTrace[6].strength.exercises[X]),week6:row(6),week7:row(7)};
  }
  for(const fatigue of [false,true]){
   const ia2={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,RDL,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}};
   const pre=fatigue?{6:(p)=>({review:{...rv(p,6,{day:1,kind:'SYSTEMIC_FATIGUE',tag:'rcfr2'+rtName}),signals:{region:'ALL'},observations:p.weeks[6].sessions.filter(s=>s.prescription&&s.day<=1).map(s=>obs(p,s))},observe:null})}:null;
   const key=fatigue?'fatigue':'twin',t=run(rt,{tag:'rc-fr2-'+rtName+key,ia:ia2,weeks:12,until:10,pre,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=1&&w<=4?'MISS':'EXEC'});
   if(!t.P){res.fatigue[`${rtName}|${key}`]={status:t.status};continue;}
   const thu=t.P.weeks[6].sessions.find(s=>s.sport==='STRENGTH'&&s.day===3&&s.prescription);const ids=thu?thu.prescription.exercises.filter(e=>e.role==='MAIN').map(e=>e.id):[];
   res.fatigue[`${rtName}|${key}`]={extras:t.extras.map(x=>x.w+':'+x.status+'/'+x.action),rows:Object.fromEntries(ids.map(id=>[id,[5,6,7,8,9].map(w=>'w'+w+' '+rowsOf(t.P,w).filter(r=>r.id===id).map(r=>doseOf(r)+(r.exposure?' ['+r.exposure.kind+' '+r.exposure.baseSets+'/'+(r.exposure.phasedSets??'-')+']':'')).join(' + '))])),regainCapAfterWeeks5to8:Object.fromEntries(ids.map(id=>[id,[6,7,8,9].map(w=>t.P.stateTrace[w]?.strength?.exercises?.[id]?.regainCap??null)]))};
  }
 }
 const GRID=[];for(const days of [[0],[0,3]])for(const mins of [25,30,35])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL'])for(const [kl,known] of [['known',[SQUAT,RDL,BENCH]],['none',[]]])for(const from of [2,4])GRID.push({days,mins,goal,kl,known,from,len:5});
 const iaG=x=>({athlete:{goals:{run:'PERFORMANCE',strength:x.goal},strengthExperience:'INTERMEDIATE',knownExercises:x.known,exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:x.days.length}},schedule:{strengthDays:x.days,runDays:[1,4,6],longRunDay:6,strengthMinutes:x.mins}});
 for(const rtName of ['f2','f1'])for(const raise of [false,true]){
  const audits=[],fr=[],np=[];
  for(const x of GRID){const tag=`rcfit-${rtName}-${raise?'raise':'flat'}-${x.days.join('')}-${x.mins}-${x.goal}-${x.kl}-${x.from}`,re=x.from+x.len;
   const t=runX(RTS[rtName],{tag,ia:iaG(x),act:(P,w,z)=>z.sport==='STRENGTH'&&w>=x.from&&w<re?'MISS':'EXEC',post:raise?{[re+1]:()=>({kind:'SCHEDULE_CHANGE',day:6,changes:{strengthMinutes:75}})}:null});
   if(!t.P){np.push(tag+' '+t.status);continue;}audits.push(regainAudit(t,tag));fr.push(...fittedRises(t));}
  const m=summRA(mergeRA(audits),6);
  res.fittedRegain[`${rtName}|${raise?'budgetRaisedAfterReestablishment':'constantBudget'}`]={noProgram:np,timelines:m.timelines,reestablishments:m.reestablishments,violationsReadingA_lastExecutedRow:m.violationsReadingA,executedJumpsAboveOneSet:m.executedJumpsAboveOneSet,fullyFittedCapRises:fr.length,examplesFullyFitted:fr.slice(0,6),examplesA:m.examplesA.slice(0,4),examplesExecutedJump:m.examplesExecutedJump};
 }
 const RGRID=[];for(const days of [[0],[0,3]])for(const mins of [25,30])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL'])for(const [kl,known] of [['known',[SQUAT,RDL,BENCH]],['none',[]]])RGRID.push({days,mins,goal,kl,known});
 for(const rtName of ['f2','f1'])for(const raise of [false,true]){
  const jumps=[],fr=[];let n=0;
  for(const x of RGRID){const rt=RTS[rtName],tag=`rcret-${rtName}-${raise?'raise':'flat'}-${x.days.join('')}-${x.mins}-${x.goal}-${x.kl}`;
   const g=rt.gen(intake({id:'rc-ret',weeks:16,...iaG(x)}),rt.opts);if(!g.program)continue;
   const t=stepper(rt,g.program,tag),done={};const exec=(w,keep=()=>true)=>{const list=t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&keep(s)).map(s=>obs(t.p,s));for(const o of list){const s=t.p.weeks[w].sessions.find(z=>z.id===o.sessionId);if(s.sport==='STRENGTH')for(const e of o.actual.exercises)(done[e.id]??=[]).push(s.date);}return list;};
   const brk=travel(t.p,4,7),startD=brk.interruption.startDate;for(let w=0;w<4;w++)t.step(w,{},exec(w,s=>s.date<startD));
   t.step(4,{day:6,...brk},[]);const e1=5;
   for(let w=e1;w<e1+8&&w<t.p.weeks.length-1;w++){t.step(w,{},exec(w));if(raise&&w===e1+1){const r2=RTS[rtName].ev(t.p,rvAt(t.p,w,{day:6,kind:'SCHEDULE_CHANGE',tag:tag+'-sc',changes:{strengthMinutes:75},actualLedger:t.ledger}),RTS[rtName].opts);t.ledger=r2.actualLedger??t.ledger;if(r2.proposal)t.p=r2.proposal;}}
   const tt={tag,P:t.p,done};n++;jumps.push(...execJumps(tt,e1,7));fr.push(...fittedRises(tt));}
  res.fittedReturn[`${rtName}|${raise?'budgetRaisedAfterStep2':'constantBudget'}`]={timelines:n,executedJumpsAboveOneSet:jumps.length,examples:jumps.slice(0,6),fullyFittedCapRises:fr.length,examplesFullyFitted:fr.slice(0,6)};
 }
 return res;
});

// ---------------------------------------------------------------- S7: the entry week kept through a mid-week rebuild (QE-R7A-15)
// HYPERTROPHY, FIXED; weeks 0-2 executed, 3-4 nothing; a 16-day TRAVEL return reported on Monday of week 5 at 05:00 and, at 06:00, a
// permanent move to a machines-only gym. Budgets 30, 45 and 60 minutes. The new exercises in week 5 and in week 6.
guard('S7',()=>{
 const res={};
 for(const rtName of ['f2','f1'])for(const mins of [30,45,60]){
  const rt=RTS[rtName],g=rt.gen(intake({id:'rc-s7',weeks:12,athlete:{exerciseRotationPreference:'FIXED',goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}},schedule:{strengthMinutes:mins}}),rt.opts);if(!g.program){res[`${rtName}|${mins}`]={status:g.status};continue;}
  const t=stepper(rt,g.program,'s7'+rtName+mins);for(let w=0;w<3;w++)t.step(w);t.step(3,{},[]);t.step(4,{},[]);
  const W=5,a=t.step(W,{day:0,hour:'05',...travel(t.p,W,0)},[]),b=t.step(W,{day:0,hour:'06',kind:'EQUIPMENT_CHANGE',changes:{equipment:['MACHINES']}},[]);
  const fresh=rowsOf(t.p,W).filter(r=>!t.p.stateTrace[W].strength.exercises[r.id]);
  const inUse=rowsOf(t.p,W).filter(r=>t.p.stateTrace[W].strength.exercises[r.id]);
  t.step(W);const ids=new Set(fresh.map(r=>r.id));
  res[`${rtName}|${mins}`]={reviews:[`${a.status}/${a.action}`,`${b.status}/${b.action}`],freshWeek5:fresh.map(r=>`${r.date} ${r.id}(${r.role}) ${doseOf(r)} ${kindOf(r)}`),inUseWeek5:inUse.map(r=>`${r.date} ${r.id} ${doseOf(r)} ${kindOf(r)}`),freshWeek6:rowsOf(t.p,W+1).filter(r=>ids.has(r.id)).map(r=>`${r.date} ${r.id} ${doseOf(r)} ${kindOf(r)}`),allFreshWeek5AtEntryDose:fresh.length>0&&fresh.every(r=>kindOf(r)==='RETURN_ENTRY'&&r.sets<=RET.strengthEntrySets&&r.rir>=RET.strengthEntryMinimumRir)};
 }
 return res;
});

// ---------------------------------------------------------------- ITEM8: moves across day phases (my R7A-SSCTR-r1 MV section, unchanged logic)
guard('ITEM8',()=>{
 const res={};
 for(const rtName of ['f2','f1'])for(const ev of ['10K','HALF_MARATHON']){
  const rt=RTS[rtName],race=addDays('2026-11-02',13*7+2);
  const ia={athlete:{goals:{run:{kind:'RACE',event:{kind:ev,date:race}},strength:'RUNNING_SUPPORT'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,5],strengthDays:[0,4],longRunDay:5,runMinutes:60,longRunMinutes:100,strengthMinutes:50}};
  const g=rt.gen(intake({id:'mv-probe',weeks:16,...ia}),rt.opts);let p=g.program;if(!p){res[`${rtName}-${ev}`]={status:g.status};continue;}
  const ph=p.phases.phases,wS=ph.lastIndexOf('SPECIFIC');let ledger=[];
  for(let w=0;w<wS;w++){const r=rt.ev(p,rv(p,w,{tag:'rcmv'+rtName+ev,observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),rt.opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;}
  const week=p.weeks[wS],keys=week.sessions.filter(s=>s.key&&s.prescription).sort((a,b)=>a.day-b.day),target=keys[0];
  if(!target){res[`${rtName}-${ev}`]={error:'no key session'};continue;}
  const r=rt.ev(p,{...rv(p,wS,{day:target.day,kind:'MISSED_SESSION',tag:'rcmv-miss'+rtName+ev}),targetSessionId:target.id,observations:week.sessions.filter(s=>s.prescription&&s.day<target.day).map(s=>obs(p,s)),actualLedger:ledger},rt.opts);
  res[`${rtName}-${ev}`]={target:`${target.id} ${target.role} d${target.day} ${dayPhaseIndep(p,wS,target.date)}`,decision:`${r.status}/${r.action}`,moveCandidates:(r.counterfactuals??[]).filter(c=>/^MOVE_TO_/.test(c.id)).map(c=>`${c.id} admissible ${c.admissible} selected ${!!c.selected}`)};
 }
 return res;
});

// ---------------------------------------------------------------- D56: a time-fitted week releases the regain (or return) cap
// Minimal timelines for the S6 finding. (a) Regain: STRENGTH, known squat, RDL and bench, one strength day (Monday) of 25 minutes, strength
// missed in weeks 2-6, re-established in week 7 (consolidation); the budget raised to 75 minutes by a schedule change after the weekly review
// of week 8, or never (twin). (b) Return: the same athlete with 60 minutes, a 16-day TRAVEL return reported at the end of week 4, the budget
// lowered to 25 minutes after that review and raised to 75 minutes after the review of week 7, or kept at 25 (twin). Rows, the counts each
// row carries (sets / before the fit / before the phase reduction), and the regain or return cap at the start of each week.
guard('D56',()=>{
 const res={},ids=['back-squat','barbell-rdl','db-bench-press'];
 const ia=mins=>({athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,RDL,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1}},schedule:{strengthDays:[0],runDays:[1,4,6],longRunDay:6,strengthMinutes:mins}});
 const sched=(rt,t,w,m)=>{const r=rt.ev(t.p,rvAt(t.p,w,{day:6,kind:'SCHEDULE_CHANGE',tag:'d56sc'+w+m+N,changes:{strengthMinutes:m},actualLedger:t.ledger}),rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return `${w}:${r.status}/${r.action}`;};
 const view=(t,from,to,cap)=>Object.fromEntries(ids.map(id=>[id,Array.from({length:to-from+1},(_,i)=>from+i).map(w=>`w${w} ${t.p.phases.phases[w].slice(0,5)} `+(rowsOf(t.p,w).filter(r=>r.id===id).map(r=>`${r.sets}x${r.reps}@${r.rir} ${r.mode} [${r.sets}/${r.exposure?.phasedSets??'-'}/${r.exposure?.baseSets??'-'} ${kindOf(r)}]`).join(' + ')||'-')+` ${cap}=${t.p.stateTrace[w]?.strength?.exercises?.[id]?.[cap]??'-'}`)]));
 for(const rtName of ['f2','f1'])for(const raise of [true,false]){
  const rt=RTS[rtName],g=rt.gen(intake({id:'rc-d56',weeks:16,...ia(25)}),rt.opts),t=stepper(rt,g.program,'d56r'+rtName+raise),extra=[];
  for(let w=0;w<12;w++){t.step(w,{},t.p.weeks[w].sessions.filter(s=>s.prescription&&!(s.sport==='STRENGTH'&&w>=2&&w<=6)).map(s=>obs(t.p,s)));if(raise&&w===8)extra.push(sched(rt,t,w,75));}
  res[`regain|${rtName}|${raise?'budgetRaisedAfterWeek8':'constant25'}`]={schedule:extra,rows:view(t,6,11,'regainCap')};
 }
 for(const rtName of ['f2','f1'])for(const raise of [true,false]){
  const rt=RTS[rtName],g=rt.gen(intake({id:'rc-d56b',weeks:16,...ia(60)}),rt.opts),t=stepper(rt,g.program,'d56b'+rtName+raise),extra=[];
  const brk=travel(t.p,4,7),startD=brk.interruption.startDate;
  for(let w=0;w<4;w++)t.step(w,{},t.p.weeks[w].sessions.filter(s=>s.prescription&&s.date<startD).map(s=>obs(t.p,s)));
  t.step(4,{day:6,...brk},[]);extra.push(sched(rt,t,4,25));
  for(let w=5;w<12;w++){t.step(w);if(raise&&w===7)extra.push(sched(rt,t,w,75));}
  res[`return|${rtName}|${raise?'budgetRaisedAfterWeek7':'constant25'}`]={schedule:extra,rows:view(t,3,11,'setCap'),ceiling:Object.fromEntries(ids.map(id=>[id,[5,6,7,8].map(w=>t.p.stateTrace[w]?.strength?.exercises?.[id]?.setCeiling??null)]))};
 }
 return res;
});

const OUT=path.join(HERE,ONLY?`ssctr-r7a-recheck-probe.${[...ONLY].join('-')}.out.json`:'ssctr-r7a-recheck-probe.out.json');
fs.writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(out.sections).map(([k,v])=>[k,v.error?'ERROR '+v.error.slice(0,400):'ok '+v.ms+'ms']))));
