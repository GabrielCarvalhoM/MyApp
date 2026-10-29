// R7-A class probes: reproduce or refute each structural inconsistency class of the task contract (C03-C18) on a runtime.
// R7A_RUNTIME=pre runs the R6 closure runtime copied in ../pre-r7a-source; anything else runs the current CoachingCore runtime.
// Engineering instruments with a DEV_TEST_ONLY authority bound to the current policy hash; never quality or generalization evidence.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const PRE=process.env.R7A_RUNTIME==='pre';
const base=PRE?path.resolve(import.meta.dirname,'../pre-r7a-source/CoachingCore'):path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(base,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs');
const {devAuthority}=await load('r6/fixtures/dev-authority.mjs');
const {normalizeObservations}=await load('src/r6-provenance.mjs');
const {canonicalizeIntake}=await load('src/r6-intake.mjs');
const opts={authority:devAuthority()},POL=opts.authority.policy,OP=POL.operational;
if(opts.authority.policyHash!=='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c')throw Error('policy hash changed');
const out={probe:'R7A-CLASS-PROBES',runtime:PRE?'PRE_R7A (R6 closure snapshot)':'CURRENT',policyHash:opts.authority.policyHash,sections:{}};
const guard=(name,fn)=>{try{out.sections[name]=fn();}catch(e){out.sections[name]={error:String(e?.stack??e).slice(0,1500)};}};

// ---------- helpers ----------
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake({id,asOf='2026-11-01',startDate='2026-11-02',weeks=12,athlete={},schedule={},...rest}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
let N=0;
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',tag='x',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`r7a-${tag}-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
/** An execution report as prescribed; over[id] = {load, reps, rir, noRir, noReps} per exercise. */
function obs(p,s,{over={},eventId=null,source=null,minutes=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:minutes??pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{};const ld=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},()=>{const set={load:ld};if(!o.noReps)set.reps=o.reps??e.reps;if(!o.noRir)set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`r7a-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK},...(source?{source}:{})};
}
/** Weekly-reviewed timeline. act(p,w,s) -> 'EXEC' | 'MISS'; reviewed(w) false skips the week's review; extra[w](p,ctx) adds a review. */
function timeline(ia,{weeks=12,act=()=>'EXEC',over=()=>({}),reviewed=()=>true,until=null,extra={}}={}){
 const g=generateProgram(intake({weeks,...ia}),opts);if(!g.program)return {status:g.status,reason:g.reason,errors:g.errors};
 let p=g.program,ledger=[],ref=null;const log=[],results=[];
 for(let w=0;w<(until??p.weeks.length-1);w++){
  if(extra[w]){const r=evaluateProgram(p,{...extra[w](p),actualLedger:ledger,...(ref?{referenceState:ref}:{})},opts);log.push(`${w}+:${r.status}/${r.action}`);results.push({w,extra:true,r});ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;}
  if(!reviewed(w)){log.push(`${w}:NO_REVIEW`);continue;}
  const list=p.weeks[w].sessions.filter(s=>s.prescription&&act(p,w,s)!=='MISS').map(s=>obs(p,s,{over:over(p,w,s)}));
  const r=evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger,...(ref?{referenceState:ref}:{})}),opts);
  log.push(`${w}:${r.status}/${r.action}`);results.push({w,r});ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;
 }
 return {P0:g.program,P:p,log,ledger,ref,results};
}
const strRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(z=>z.sport==='STRENGTH'&&z.prescription).flatMap(z=>z.prescription.exercises.map(e=>({session:z.id,date:z.date,id:e.id,role:e.role,mode:e.load.mode,value:e.load.value??null,convention:e.load.convention??null,sets:e.sets,reps:e.reps,rir:e.rir,note:(e.instructions??[]).find(t=>/^(Not done|No usable load|Return entry|Return step)/.test(t))??null,instructions:e.instructions??[]})));
const dose=r=>`${r.sets}x${r.reps}@${r.rir} ${r.mode}${r.value!=null?' '+r.value+(r.convention==='PER_HAND'?'/h':''):''}`;
/** The decision without provenance bookkeeping, so equivalent inputs can be compared. */
const decisionKey=r=>JSON.stringify({status:r.status,action:r.action,gates:r.gates??null,weeks:r.proposal?r.proposal.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.prescription??null])):null,loadQuestions:(r.loadQuestions??[]).map(q=>[q.exerciseId,q.reason])});

// ---------- C03 / C17: every strength row in a reduced day phase stays inside the declared phase dose ----------
// Absolute bounds from operational.event: race window and post-event rows are main lifts at raceWeekStrengthSets / postEventStrengthSets
// sets and at least raceWeekStrengthMinimumRir in reserve; taper rows keep at least 3 in reserve. Covers every row kind the grid reaches.
guard('C03_phaseBoundsAllRowKinds',()=>{
 const E=OP.event,viol=[],kinds={};let rows=0;
 // Strength missed for the five weeks before week `until` (12: taper, 13: race week, 14: post-event), or a moderate return declared
 // at the end of week 11 (return entry in the taper, return step 2 in race week), or nothing missed.
 const scenarios=[['none',null],['missBeforeTaper',12],['missBeforeRaceWeek',13],['missBeforePostEvent',14],['returnBeforeTaper','RETURN']];
 for(const kind of ['10K','HALF_MARATHON'])for(const goal of ['STRENGTH','RUNNING_SUPPORT','GENERAL'])for(const [label,until] of scenarios)for(const known of ['known','none']){
  const ia={id:`c03-${kind}-${goal}-${label}-${known}`,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',13*7+6)}},strength:goal},knownExercises:known==='known'?[SQUAT,BENCH]:[],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
  const extra=until==='RETURN'?{11:p=>review(p,11,{day:6,kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[11].startDate,-9),endDate:addDays(p.weeks[11].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'},observations:[]})}:{};
  const t=timeline(ia,{weeks:16,extra,reviewed:w=>until!=='RETURN'||w!==11,act:(p,w,s)=>s.sport==='STRENGTH'&&Number.isInteger(until)&&w>=until-5&&w<until?'MISS':'EXEC'});if(!t.P)continue;
  const race=addDays(t.P.startDate,t.P.phases.raceWeek*7+t.P.phases.raceDay);
  for(let w=9;w<t.P.weeks.length;w++)for(const r of strRows(t.P,w)){
   rows++;const b=gap(r.date,race),dayPhase=b>=1&&b<=E.raceWindowDays?'RACE_WINDOW':b<0&&t.P.phases.phases[w]==='POST_EVENT'?'POST_EVENT':b>E.raceWindowDays&&b<=E.raceWindowDays+7?'TAPER':null;if(!dayPhase)continue;
   const k=(r.note??r.mode).split(':')[0].slice(0,24);kinds[dayPhase+' '+k]=(kinds[dayPhase+' '+k]??0)+1;
   const cap=dayPhase==='RACE_WINDOW'?E.raceWeekStrengthSets:dayPhase==='POST_EVENT'?E.postEventStrengthSets:null,rirMin=dayPhase==='TAPER'?3:E.raceWeekStrengthMinimumRir;
   if(cap!==null&&r.sets>cap||r.rir<rirMin||dayPhase!=='TAPER'&&r.role!=='MAIN')viol.push(`${ia.id} w${w} ${r.date} ${dayPhase} ${r.id}: ${dose(r)}${r.note?' | '+r.note.slice(0,40):''}`);
  }
 }
 return {reproduced:viol.length>0,rowsChecked:rows,rowKindsInReducedDays:kinds,violations:viol.length,examples:viol.slice(0,12)};
});

// ---------- C04: the transition follows the executed exposure (SSCTR R19) ----------
// The SSCTR dossier-Q4 design: an exercise X prescribed in several sessions a week; in week 1 only its first session is performed,
// weeks 2-4 carry no strength, so in week 5 its first exposure is 28 days later (known row) and the later ones are outside the window
// (re-establishment rows). The athlete performs the first week-5 session (known load, logged) and misses the later ones.
guard('C04_splitWeekExecutedExposure',()=>{
 const ia={id:'c04',athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
 const P0=generateProgram(intake({weeks:12,...ia}),opts).program;if(!P0)return {error:'no program'};
 const by={};for(const r of strRows(P0,1))(by[r.id]??=[]).push(r);
 const X=Object.entries(by).filter(([,l])=>l.length>=2&&l.every(r=>r.mode==='KNOWN')).sort((a,b)=>b[1].length-a[1].length)[0]?.[0]??null;if(!X)return {error:'no known exercise prescribed twice'};
 const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
 const t=timeline(ia,{weeks:12,until:7,act:(P,w,s)=>{if(s.sport!=='STRENGTH')return 'EXEC';if(w===1)return s.id===sessX(P,1)[0]?.id?'EXEC':'MISS';if(w>=2&&w<=4)return 'MISS';if(w===5)return s.id===sessX(P,5)[0]?.id?'EXEC':'MISS';return 'EXEC';}});
 const st=e=>e?{mode:e.mode,load:e.load??null,ceiling:e.ceiling??null,sets:e.sets??null,priorSets:e.priorSets??null,regainCap:e.regainCap??null,lastPerformed:e.lastPerformed??null,source:e.source??null}:null;
 const before=st(t.P.stateTrace[5].strength.exercises[X]),after=st(t.P.stateTrace[6].strength.exercises[X]);
 const w5=strRows(t.P,5).filter(r=>r.id===X),w6=strRows(t.P,6).filter(r=>r.id===X);
 // The executed exposure was the known row at the known load: the state should stay KNOWN at that load and count.
 const reproduced=after?.mode!=='KNOWN'||w6.some(r=>r.mode!=='KNOWN'||r.sets<w5[0].sets);
 return {reproduced,exercise:X,log:t.log.join(' '),stateBeforeWeek5:before,week5:w5.map(r=>`${r.date} ${dose(r)}${r.note?' | '+r.note.slice(0,30):''}`),executedInWeek5:w5[0]?`${w5[0].date} ${dose(w5[0])}`:null,stateAfterWeek5:after,week6:w6.map(dose)};
});

// ---------- C05 / C07: intake strength records: representation, unknown fields and merge order ----------
guard('C05_C07_intakeStrengthRecords',()=>{
 const asOf='2026-11-01',rowsOf=c=>Object.fromEntries(c.canonical.athlete.knownExercises.map(e=>[e.id,{dose:e.dose?{sets:e.dose.sets,reps:e.dose.reps,rir:e.dose.rir,load:e.dose.load}:null,source:e.source}]));
 const self={id:'goblet-squat',sets:3,reps:10,load:{value:20,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'};
 const wear={provider:'GENERIC_WATCH',activityAvailable:true,heartRateAvailable:true,exerciseIdentityAvailable:true,setsRepsLoadAvailable:true,subjectiveEffortAvailable:false,completeness:'FULL',historyWeeks:4};
 const hist=[{activityId:'h1',sport:'STRENGTH',startedAt:'2026-10-30T18:00:00Z',durationMinutes:40,exercises:[{id:'goblet-squat',sets:3,reps:10,loadKg:20}]}];
 const mk=(athlete,extra={})=>canonicalizeIntake(intake({id:'c05',athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],...athlete},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50},...extra}));
 const a=mk({knownExercises:[self]}),b=mk({knownExercises:[self],wearableCapabilities:wear,history:hist});
 const bare=mk({knownExercises:[{...self,load:20}]});
 const dupComplete=mk({knownExercises:[self,{...self,rir:undefined}]}),dupSwapped=mk({knownExercises:[{...self,rir:undefined},self]});
 const known=c=>rowsOf(c)['goblet-squat']??null;
 const displaced=!!known(a)?.dose&&!known(b)?.dose,relabelled=known(b)?.dose?.load?.convention&&known(b).dose.load.convention!==self.load.convention;
 const orderDependent=JSON.stringify(known(dupComplete))!==JSON.stringify(known(dupSwapped));
 return {reproduced:displaced||relabelled||orderDependent,selfReportOnly:known(a),withWearableRecord:known(b),wearableRecordDisplacesSelfReport:displaced,conventionRelabelled:!!relabelled,bareNumberLoad:known(bare)?.dose?.load??null,duplicateSelfReportsOrderDependent:orderDependent,completeThenIncomplete:known(dupComplete),incompleteThenComplete:known(dupSwapped)};
});

// ---------- C06: a source label alone never changes the decision ----------
guard('C06_provenanceLabelEquivalence',()=>{
 const g=generateProgram(intake({id:'c06',weeks:8}),opts),p=g.program,list=src=>p.weeks[0].sessions.filter(s=>s.prescription).map((s,i)=>obs(p,s,{eventId:`c06-${i}`,...(src?{source:{provider:src}}:{})}));
 const keys=Object.fromEntries([null,'MANUAL','APPLE_HEALTH','GARMIN','SELF_REPORT'].map(src=>[src??'none',decisionKey(evaluateProgram(p,review(p,0,{observations:list(src)}),opts))]));
 const hist=prov=>canonicalizeIntake(intake({id:'c06h',athlete:{recent:{runDaysPerWeek:3},wearableCapabilities:{provider:prov,activityAvailable:true,completeness:'FULL',historyWeeks:4},history:[1,3,5,8,10,12,15,17,19,22,24,26].map((d,i)=>({activityId:'a'+i,sport:'RUN',startedAt:addDays('2026-10-04',d)+'T07:00:00Z',durationMinutes:40}))}})).canonical.athlete.recentRun;
 const intakeKeys=Object.fromEntries(['APPLE_HEALTH','GARMIN','MANUAL_IMPORT'].map(v=>[v,JSON.stringify(hist(v))]));
 return {reproduced:new Set(Object.values(keys)).size>1||new Set(Object.values(intakeKeys)).size>1,reviewDecisionVariants:new Set(Object.values(keys)).size,intakeExposureVariants:new Set(Object.values(intakeKeys)).size,intakeExposure:hist('APPLE_HEALTH')};
});

// ---------- C08 / C09: duplicates and contradictory duplicates ----------
guard('C08_C09_duplicatesAndContradictions',()=>{
 const g=generateProgram(intake({id:'c08',weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[]}}),opts),p=g.program;
 const base=p.weeks[0].sessions.filter(s=>s.prescription).map((s,i)=>obs(p,s,{eventId:'c08-'+i}));
 const k0=decisionKey(evaluateProgram(p,review(p,0,{observations:base}),opts));
 const replay=decisionKey(evaluateProgram(p,review(p,0,{observations:[...base,...base.map(o=>structuredClone(o))]}),opts));
 const str=p.weeks[0].sessions.find(s=>s.sport==='STRENGTH'&&s.prescription),i=p.weeks[0].sessions.filter(s=>s.prescription).indexOf(str);
 const second={...structuredClone(base[i]),eventId:'c08-second-source'};
 const sameExecution=decisionKey(evaluateProgram(p,review(p,0,{observations:[...base,second]}),opts));
 // Contradiction: a second report of the same session agrees on completion and minutes but logs other loads.
 const heavy=structuredClone(base[i]);heavy.eventId='c08-heavy';for(const e of heavy.actual.exercises)for(const s of e.sets)if(s.load?.unit==='KG')s.load={...s.load,value:40};
 const ab=evaluateProgram(p,review(p,0,{observations:[...base,heavy]}),opts),ba=evaluateProgram(p,review(p,0,{observations:[heavy,...base.map((o,j)=>j===i?{...o,observedAt:o.observedAt.replace(/T\d\d/,'T20')}:o)]}),opts);
 const pend=r=>Object.fromEntries(Object.entries((r.proposal??p).stateTrace[1].strength.exercises).filter(([,e])=>Number.isFinite(e.pendingLoad)).map(([id,e])=>[id,e.pendingLoad]));
 return {reproduced:replay!==k0||sameExecution!==k0||JSON.stringify(pend(ab))!==JSON.stringify(pend(ba))||!ab.provenance.conflicts.length,exactReplayInvariant:replay===k0,sameExecutionSecondSourceInvariant:sameExecution===k0,contradictoryLogs:{orderAB:{conflicts:ab.provenance.conflicts.length,duplicates:ab.provenance.duplicates.map(d=>d.reason),pendingLoads:pend(ab)},orderBA:{conflicts:ba.provenance.conflicts.length,duplicates:ba.provenance.duplicates.map(d=>d.reason),pendingLoads:pend(ba)}}};
});

// ---------- C10: a correction survives the carried ledger (normalization is idempotent) ----------
guard('C10_correctionIdempotence',()=>{
 const asOf='2026-11-10T21:00:00Z',o1={eventId:'e1',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',actual:{completed:true,minutes:30},response:{...OK}};
 const c1={eventId:'e2',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',correctionOf:'e1',correctedAt:'2026-11-10T09:00:00Z',actual:{completed:true,minutes:45},response:{...OK}};
 // The carried record is what a review hands to the next one: its accepted facts plus whatever the normalizer keeps as history.
 const first=normalizeObservations([o1,c1],{athleteId:'a',asOf,maximumAgeDays:36500});
 const again=normalizeObservations([],{athleteId:'a',asOf:'2026-11-17T21:00:00Z',maximumAgeDays:36500,prior:[...first.accepted,...(first.supersededRows??[])]});
 const live=n=>n.accepted.filter(o=>o.sessionId==='s1').map(o=>[o.eventId,o.actual.minutes]);
 // End to end: a run reported, corrected in the same week's review, then the next week's review with the carried ledger.
 const g=generateProgram(intake({id:'c10',weeks:8}),opts),p=g.program,run=p.weeks[0].sessions.find(s=>s.sport==='RUN'&&s.prescription);
 const a0=obs(p,run,{eventId:'c10-a',minutes:20}),corr={...obs(p,run,{eventId:'c10-b',minutes:run.prescription.durationMinutes}),correctionOf:'c10-a',correctedAt:addDays(p.weeks[0].startDate,6)+'T20:00:00Z'};
 const r0=evaluateProgram(p,review(p,0,{observations:[a0,corr]}),opts),P1=r0.proposal??p;
 const r1=evaluateProgram(P1,review(P1,1,{observations:P1.weeks[1].sessions.filter(s=>s.prescription).map(s=>obs(P1,s)),actualLedger:r0.actualLedger}),opts);
 const sessionFacts=r=>r.actualLedger.filter(o=>o.sessionId===run.id&&!o.superseded).map(o=>[o.eventId,o.actual.minutes]);
 const lost=JSON.stringify(sessionFacts(r0))!==JSON.stringify(sessionFacts(r1));
 return {reproduced:JSON.stringify(live(first))!==JSON.stringify(live(again))||lost,firstReview:{accepted:live(first),superseded:first.superseded.map(s=>s.eventId)},carriedLedgerReview:{accepted:live(again),excluded:again.excluded.map(x=>x.eventId+':'+x.reason)},endToEnd:{week0Facts:sessionFacts(r0),week1Facts:sessionFacts(r1),week1Excluded:r1.provenance?.excluded?.map(x=>x.eventId+':'+x.reason)??null}};
});

// ---------- C11: an inactive exercise's return step must not keep an entry week alive ----------
// A moderate return, then in its step-2 week a temporary equipment window brings a substitute; an exercise rotated out before the break
// never advances its return step. What dose does a new exercise get once every exercise in use has left the entry step?
guard('C11_inactiveExerciseReturnStep',()=>{
 const ia={id:'c11',athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'EVERY_2_WEEKS'},schedule:{strengthDays:[0,4]}};
 const g=generateProgram(intake({weeks:16,...ia}),opts);let p=g.program;if(!p)return {status:g.status};
 let ledger=[];const step=(w,extra={},list=null)=>{const r=evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
 const used=w=>[...new Set(strRows(p,w).map(r=>r.id))];
 // Rotation: accessories B replace A in week w1, and A come back in week w2, so B is in the state but not in use from w2 on.
 let w1=null,w2=null;for(let w=1;w<p.weeks.length-6&&w1===null;w++)if(used(w).some(id=>!used(0).includes(id)))w1=w;
 if(w1===null)return {error:'no rotation turn found'};
 const B=used(w1).filter(id=>!used(0).includes(id));for(let w=w1+1;w<p.weeks.length-5&&w2===null;w++)if(!used(w).some(id=>B.includes(id)))w2=w;
 if(w2===null)return {error:'rotated-in accessories never leave'};
 for(let w=0;w<=w2;w++)step(w);
 // A 16-day break that starts in week w2 and ends with the review at the end of week w2+1.
 const ret=step(w2+1,{kind:'RETURN_AFTER_PAUSE',day:6,interruption:{days:16,startDate:addDays(p.weeks[w2+1].startDate,-9),endDate:addDays(p.weeks[w2+1].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
 const e1=w2+2,st=w=>Object.fromEntries(Object.entries(p.stateTrace[w].strength.exercises).map(([id,e])=>[id,e.returnStep??null]));
 const s2=e1+1,inactiveAtEntry=Object.entries(p.stateTrace[s2]?.strength?.exercises??{}).filter(([id,e])=>e.returnStep===0&&!used(s2).includes(id)).map(([id])=>id);
 // A temporary window without the barbell brings substitutes for the exercises in use during return step 2.
 // The change is reported at the end of the entry week, so return step 2 (the next week) is the first one it re-projects.
 const eq=evaluateProgram(p,review(p,e1,{day:6,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[s2].startDate,to:addDays(p.weeks[s2].startDate,13)},actualLedger:ledger}),opts);
 const subRows=eq.proposal?strRows(eq.proposal,s2).filter(r=>!(p.stateTrace[s2].strength.exercises[r.id])).map(r=>`${r.id} ${dose(r)}${r.note?' | '+r.note.slice(0,24):''}`):[];
 return {reproduced:inactiveAtEntry.length>0&&subRows.some(x=>/Return entry/.test(x)),rotation:{w1,w2,rotatedIn:B},returnReview:`${ret.status}/${ret.action}`,entryWeek:{w:e1,returnSteps:st(e1),inUse:used(e1)},step2Week:{w:s2,returnSteps:st(s2),inUse:used(s2)},inactiveExercisesStillAtEntryStepInStep2:inactiveAtEntry,newExerciseRowsInStep2:subRows,step2RowsAfterSubstitution:eq.proposal?strRows(eq.proposal,s2).map(r=>`${r.date} ${r.id} ${dose(r)}${r.note?' | '+r.note.slice(0,20):''}`):null,substitution:`${eq.status}/${eq.action}`};
});

// ---------- C12: bodyweight repetitions after gated reviews (CQ-R6-11) and sets logged without reps ----------
guard('C12_bodyweightRepetitions',()=>{
 const ia={id:'c12',athlete:{goals:{run:'NONE',strength:'GENERAL'},strengthExperience:'NOVICE',knownExercises:[],equipment:['BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthMinutes:30,longRunDay:null}};
 const run=over=>{const t=timeline(ia,{weeks:8,over});if(!t.P)return {status:t.status};const ids=[...new Set(strRows(t.P,0).map(r=>r.id))];return {log:t.log.join(' '),reps:Object.fromEntries(ids.map(id=>[id,t.P.weeks.map((_,w)=>strRows(t.P,w).find(r=>r.id===id)?.reps??null)]))};};
 const asPrescribed=run(()=>({})),noReps=run((p,w,s)=>Object.fromEntries(s.prescription.exercises.map(e=>[e.id,{noReps:true}])));
 const fell=x=>Object.values(x.reps??{}).some(list=>list.some((v,i)=>i>0&&v!==null&&list[i-1]!==null&&v<list[i-1]));
 // The same for a known-load lifter: sets logged at the planned load with RIR but without a repetition count.
 const t=timeline({id:'c12k',athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}},{weeks:8,over:(p,w,s)=>Object.fromEntries((s.prescription.exercises??[]).map(e=>[e.id,{noReps:true}]))});
 const loads=id=>t.P.weeks.map((_,w)=>strRows(t.P,w).find(r=>r.id===id)).map(r=>r?`${r.value??'-'}x${r.reps}`:null);
 const knownDrop=['back-squat','db-bench-press'].some(id=>{const v=t.P.weeks.map((_,w)=>strRows(t.P,w).find(r=>r.id===id)?.value??null).filter(x=>x!==null);return v.some((x,i)=>i>0&&x<v[i-1]);});
 return {reproduced:fell(asPrescribed)||fell(noReps)||knownDrop,asPrescribedRepsFall:fell(asPrescribed),setsWithoutRepsRepsFall:fell(noReps),knownLoadFallsWhenRepsUnlogged:knownDrop,asPrescribed,setsWithoutReps:noReps,knownLifterWithoutReps:{log:t.log.join(' '),backSquat:loads('back-squat'),bench:loads('db-bench-press')}};
});

// ---------- C14: a late report of an old session does not change the current decision ----------
guard('C14_staleLateReport',()=>{
 // Week 0's first run is missed (never reported); its report arrives six weeks later with the week-6 review.
 const P0=generateProgram(intake({id:'c14',weeks:12}),opts).program,oldId=P0.weeks[0].sessions.find(s=>s.sport==='RUN'&&s.prescription).id;
 const t=timeline({id:'c14'},{weeks:12,until:6,act:(p,w,s)=>s.id===oldId?'MISS':'EXEC'});const p=t.P,w=6;
 const list=p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s));
 const old=p.weeks[0].sessions.find(s=>s.id===oldId),late={...obs(p,old,{eventId:'c14-late',minutes:old.prescription.durationMinutes+10}),reportedAt:addDays(p.weeks[w].startDate,6)+'T20:00:00Z'};
 const a=evaluateProgram(p,review(p,w,{observations:list,actualLedger:t.ledger}),opts),b=evaluateProgram(p,review(p,w,{observations:[...list,late],actualLedger:t.ledger}),opts);
 return {reproduced:decisionKey(a)!==decisionKey(b),same:decisionKey(a)===decisionKey(b),lateReportOutcome:b.provenance.conflicts.length?'CONFLICT':b.provenance.duplicates.length?'DUPLICATE':'ACCEPTED'};
});

// ---------- C15: unreviewed weeks: projection credit (R18) against a zero reading in a replan (CQ-R6-04) ----------
guard('C15_unreviewedWeeks',()=>{
 const ia={id:'c15',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},knownExercises:[SQUAT],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const t=timeline(ia,{weeks:12,until:8,reviewed:w=>w<3});if(!t.P)return {status:t.status};
 const runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
 const weekly=evaluateProgram(t.P,review(t.P,7,{observations:t.P.weeks[7].sessions.filter(s=>s.prescription).map(s=>obs(t.P,s)),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})}),opts);
 const sched=evaluateProgram(t.P,review(t.P,7,{day:0,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})}),opts);
 const P1=weekly.proposal??t.P,P2=sched.proposal??t.P;
 return {reproduced:true,reviewedWeeks:'0-2 only',projectionStateWeek7:{long:t.P.stateTrace[7].run.long,easy:t.P.stateTrace[7].run.easy},weeklyReviewWeek7:`${weekly.status}/${weekly.action}`,week8AfterWeekly:runs(P1,8),scheduleChangeWeek7:`${sched.status}/${sched.action}`,week8AfterScheduleChange:runs(P2,8),week9AfterScheduleChange:P2.weeks[9]?runs(P2,9):null};
});

// ---------- C16: a dated one-day turn change persists (CQ-R6-03) ----------
guard('C16_scopedScheduleChange',()=>{
 const ia={id:'c16',athlete:{goals:{run:'PERFORMANCE',strength:'GENERAL'}},schedule:{runDays:[1,3,6],strengthDays:[1,4],runTurn:'AM',strengthTurn:'PM',temporaryPreference:'RUN'}};
 const g=generateProgram(intake({weeks:8,...ia}),opts),p=g.program;if(!p)return {status:g.status,reason:g.reason};
 const day=p.weeks[1].sessions.find(s=>s.sport==='STRENGTH'&&s.day===1&&s.prescription)?.date;
 const r=evaluateProgram(p,review(p,1,{day:0,kind:'DOUBLE_CONFLICT',changes:{strengthTurn:'AM',sameTurnConfirmed:false,from:day,to:day}}),opts);
 const turns=(P,w)=>P.weeks[w].sessions.filter(s=>s.prescription&&s.day===1).map(s=>`${s.sport}:${s.turn}`);
 const P=r.proposal??p;
 return {reproduced:!!r.proposal&&[2,3,4].some(w=>turns(P,w).join()!==turns(p,w).join()),change:`${r.status}/${r.action}`,conflictDate:day,week1Day1:turns(P,1),week2Day1:turns(P,2),week4Day1:turns(P,4),canonicalStrengthTurnAfter:P.canonical.schedule.strengthTurn};
});

// ---------- C18: a race finished faster than its window ----------
guard('C18_raceCompletion',()=>{
 const ia={id:'c18',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7+6)}},strength:'MAINTAIN'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const g=generateProgram(intake({weeks:12,...ia}),opts),p=g.program;if(!p)return {status:g.status};
 const rw=p.phases.raceWeek,race=p.weeks[rw].sessions.find(s=>s.role==='RACE');
 const r=evaluateProgram(p,review(p,rw,{observations:[obs(p,race,{minutes:52})]}),opts);
 const row=r.weekEvidence?.rows?.find(x=>x.sessionId===race.id),led=r.actualLedger.find(o=>o.sessionId===race.id);
 return {reproduced:row?.status==='PARTIAL'||led?.partial===true,raceWindowMinutes:race.prescription.durationMinutes,reportedMinutes:52,evidenceStatus:row?.status??null,ledgerPartial:led?.partial??null,comparable:led?.comparable??null};
});

const file=path.join(import.meta.dirname,process.env.R7A_PROBE_OUT??'r7a-class-probes.out.json');
fs.writeFileSync(file,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(out.sections).map(([k,v])=>[k,v.error?'ERROR':v.reproduced===undefined?'-':v.reproduced?'REPRODUCED':'NOT_REPRODUCED']))));
