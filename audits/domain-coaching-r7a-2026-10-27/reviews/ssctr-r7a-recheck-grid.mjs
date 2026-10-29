// SSCTR R7A-SSCTR-r2 (single narrow re-check) grid probe: my R7A-SSCTR-r1 phase grid (PG: D54, Q2) and regain-readings grid (RA: D53, Q1)
// re-run on R7A-FREEZE-2 only (CoachingCore/, source digest f56ae974...), to re-bind records R7A-SSCTR-REESTABLISH-PHASE and
// R7A-SSCTR-REGAIN-BASE. Their FREEZE-1 results are the "cur" entries of ssctr-r7a-delta-probe.out.json. Reviewer-authored, read-only;
// DEV_TEST_ONLY devAuthority() bound to the unchanged policy hash 18ec48f3...; synthetic and offline; nothing under CoachingCore/ is written.
// Composition: this header; then a byte copy of lines 31-150 of ssctr-r7a-delta-probe.mjs (harness and regain audit); then lines 161-217
// of the same file (sections PG and RA) with only the runtime list changed from ['cur','pre'] to ['f2']; then the output line.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const HERE=import.meta.dirname,ROOT=path.resolve(HERE,'../../..');
const EXPECTED='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c',CC=path.join(ROOT,'CoachingCore');
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const FR2=JSON.parse(fs.readFileSync(path.join(CC,'r7/RUNTIME_FREEZE_R7A_2.json'),'utf8')),BAD=Object.entries(FR2.files).filter(([f,h])=>sha(path.join(CC,f))!==h).map(([f])=>f);
if(BAD.length||FR2.sourceDigest!=='f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c')throw new Error('R7A-FREEZE-2 does not verify: '+BAD.join(','));
async function loadRt(name,base){const L=rel=>import(pathToFileURL(path.join(base,rel)).href);const idx=await L('src/r6-index.mjs'),dev=await L('r6/fixtures/dev-authority.mjs');const auth=dev.devAuthority();if(auth.policyHash!==EXPECTED)throw new Error(name+': policy hash '+auth.policyHash);return {name,gen:idx.generateProgram,ev:idx.evaluateProgram,auth,opts:{authority:auth}};}
const RTS={f2:await loadRt('f2',CC)};
const POL=RTS.f2.auth.policy,OP=POL.operational,E=OP.event,ST=OP.strength,RET=OP.return,GD=ST.goalDoses;
const out={probe:'R7A-SSCTR-r2-recheck-grid',freeze:'R7A-FREEZE-2',sourceDigest:FR2.sourceDigest,freezeFilesVerified:Object.keys(FR2.files).length,policyHash:RTS.f2.auth.policyHash,authorityUsed:'DEV_TEST_ONLY devAuthority(), bound to the unchanged policy hash',node:process.version,sections:{}};
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
// ---------------------------------------------------------------- PG. re-establishment rows in every phase (D54, item 2b, Q2)
// Race programs (10K, half marathon; race on Sunday of week 13) and no-event programs; goals STRENGTH, HYPERTROPHY, RUNNING_SUPPORT,
// GENERAL and MAINTAIN; a known squat, RDL and bench, no known exercise (logs as prescribed) or no known exercise with noisy logs
// (pending establishment logs, D45); strength on Monday/Thursday or Monday/Wednesday/Friday. For each phase X (first week of X from
// week 6; BUILD/DEVELOPMENT included) strength is missed in the five weeks before it. Every re-establishment row in weeks wX and wX+1 is
// checked against the declared bounds (race window / post-event: main lifts only, at most 1 set, RIR >= 4; specific / taper RIR >= 3),
// against min(goal sets for the role, 2), against my own phase reduction of the count it states (current runtime), and against the twin
// executed throughout (same exercise, same date). The regain afterwards is audited with regainAudit.
const PG_RESULTS={};
for(const rtName of ['f2']){
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
 for(const rtName of ['f2']){
  const rt=RTS[rtName],plain=[],noisy=[],noProgram=[];
  for(const x of AI_GRID){const tag=`ra-${rtName}-${x.pref}-${x.goal}-${x.kl}-${x.days.join('')}-${x.from}-${x.len}`;const t=run(rt,{tag,ia:aiIntake(x),act:(P,w,z)=>z.sport==='STRENGTH'&&w>=x.from&&w<x.from+x.len?'MISS':'EXEC'});if(!t.P){noProgram.push(tag);continue;}plain.push(regainAudit(t,tag));}
  for(const x of AI_GRID.filter(x=>x.len===5)){const tag=`ra-${rtName}-noisy-${x.pref}-${x.goal}-${x.kl}-${x.days.join('')}-${x.from}`;const t=run(rt,{tag,ia:aiIntake(x),loads:noisyLoads(x.known),act:(P,w,z)=>z.sport==='STRENGTH'&&w>=x.from&&w<x.from+x.len?'MISS':'EXEC'});if(!t.P){noProgram.push(tag);continue;}noisy.push(regainAudit(t,tag));}
  res[rtName]={noProgram,asPrescribed:summRA(mergeRA(plain)),noisyLogs:summRA(mergeRA(noisy))};
 }
 return res;
});

fs.writeFileSync(path.join(HERE,'ssctr-r7a-recheck-grid.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(out.sections).map(([k,v])=>[k,v.error?'ERROR '+v.error.slice(0,300):'ok '+v.ms+'ms']))));
