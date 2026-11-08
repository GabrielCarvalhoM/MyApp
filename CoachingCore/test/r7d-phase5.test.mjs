// R7-D Phase 5 (the final corrective cycle the Founder authorized after the Phase 4 holdout, option A): directed tests for the two blockers the
// independent judges confirmed on R7D-FREEZE-5 and for one defect on the first one's path.
//   T42, T43 (SSCTR-P4-F01, SSCTR-R7D-P4-FINAL-HOLDOUT-r1 CND-2): after a moderate or long return, a strength exercise planned before the break but
//       never executed follows the return limits the policy already sets (strengthEntryWeek; strengthReturnSets, SSCTR D49): the entry week at
//       strengthEntrySets with at least strengthEntryMinimumRir in reserve, return step 2 at max(1, min(ceiling - 1, strengthEntrySets + 1)) sets with
//       the normal count as the ceiling, then at most one set per executed week, and no block credited for weeks it was never executed. T42 is the
//       shape of holdout case R7D-F13; T43 the judge's witness W-D49-A (another athlete) with its control W-D49-B (week 0 executed, unchanged).
//   T44 (R7D-FC-01, found while correcting SSCTR-P4-F01): a band row carries no kilogram, like a bodyweight row (B0-C04); its readable log is the
//       evidence its repetition progression and its return steps read. Before, no band log was ever evidence, so a band row never progressed and,
//       after a return, would repeat the entry dose for ever.
//   T45, T46 (QRE-P4-F01, QRE-R7D-FINAL-HOLDOUT-r1 K02): after more than a month without any reported run, the coach asks UNREPORTED_TRAINING before
//       planning run doses whatever the next week's phase or dose (R7-C G01; PREREG-1 P03(d); SSCTR-SD-R7C-r2): an empty review before a low-dose
//       CONSOLIDATION week trimmed the doses VALID and asked nothing. T46 keeps the situations where nothing is asked.
//   T47: determinism and idempotence of both corrected paths.
// The shapes are the holdout's own (R7D-F13, R7D-F14, R7D-F25: synthetic athletes; the Founder's Phase 5 authorization asks the tests to reproduce
// F13 and the judges' witnesses; that holdout is spent and is never evaluated again). The real authority is used, as the evaluation client uses it.
// R7D_P5_ROOT=<repository root> runs the same file on another copy (the RED evidence on R7D-FREEZE-5). No number is added anywhere.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.R7D_P5_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {loadR6Policy}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-authority.mjs')).href);
const RT=loadR6Policy().operational.return;

const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const offset=m=>(m<0?'-':'+')+String(Math.floor(Math.abs(m)/60)).padStart(2,'0')+':'+String(Math.abs(m)%60).padStart(2,'0');
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const intake=({id,asOf,startDate,weeks,tz,runExperience,strengthExperience,recent,goals,equipment,schedule})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,timezoneOffsetMinutes:tz,
 athlete:{ageEligible:true,eligibility:ELIG(asOf),id,runExperience,strengthExperience,recent,goals,equipment},schedule});
// R7D-F13: a novice, bodyweight and bands, runs Mon/Wed/Sat, strength Thu, offset -05:00.
const F13=intake({id:'ath-f13-dana',asOf:'2026-11-15',startDate:'2026-11-16',weeks:16,tz:-300,runExperience:'NOVICE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT','BANDS'],schedule:{runDays:[0,2,5],strengthDays:[3],runMinutes:35,strengthMinutes:30,longRunDay:5,longRunMinutes:50}});
// R7D-F14: intermediate runner, novice in strength, dumbbells, bench and bands, offset +01:00.
const F14=intake({id:'ath-f14-chiara',asOf:'2026-12-12',startDate:'2026-12-14',weeks:12,tz:60,runExperience:'INTERMEDIATE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH','BODYWEIGHT','BANDS'],schedule:{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:6,longRunMinutes:80}});
// R7D-F25: a novice, bodyweight, bands and kettlebell, offset +01:00.
const F25=intake({id:'ath-f25-lea',asOf:'2026-12-26',startDate:'2026-12-28',weeks:16,tz:60,runExperience:'NOVICE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'MAINTAIN'},equipment:['BODYWEIGHT','BANDS','KETTLEBELL'],schedule:{runDays:[0,2,5],strengthDays:[1,3],runMinutes:35,strengthMinutes:35,longRunDay:5,longRunMinutes:50}});

/** The report a conforming client sends for a session done as prescribed (the evaluation client's `asPrescribed`): the planned minutes, or every
 * planned set at its reps and reserve; a known load as prescribed, a row without a kilogram as bodyweight, a chosen load left out. */
const asPrescribed=(p,s,{completed=true}={})=>{const x=s.prescription,actual={completed};
 if(completed){actual.minutes=x.durationMinutes;if(x.modality==='STRENGTH')actual.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:e.load.mode==='KNOWN'?{load:{value:e.load.value,unit:e.load.unit??'KG',convention:e.load.convention}}:{}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));}
 return {eventId:`t-${s.id}${completed?'':'-nd'}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'},occurrenceDate:s.date};};
const sessions=(p,w,sport)=>p.weeks[w].sessions.filter(s=>live(s)&&(!sport||s.sport===sport));
/** One timeline, carried as the evaluation client carries it: the record as returned, proposals adopted. */
function timeline(input){
 const g=generateProgram(structuredClone(input));assert.equal(g.status,'PROPOSED',g.reason);
 const t={p:g.program,ledger:[],ref:null,model:null,tz:input.timezoneOffsetMinutes??0,n:0,results:[]};
 t.step=(at,{kind='WEEKLY_REVIEW',observations=[],interruption=null}={})=>{
  const p=t.p,day=addDays(p.startDate,at.week*7+at.day),asOf=`${day}T${at.time}:00${offset(t.tz)}`;
  const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex:Math.floor((at.week*7+at.day)/7),event:{id:`t-${input.athlete.id}-s${++t.n}`,kind},eligibility:ELIG(day),observations:typeof observations==='function'?observations(p):observations,
   ...(interruption?{interruption}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(t.model?{athleteModel:t.model}:{})};
  const r=evaluateProgram(p,review);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;t.model=r.updatedModel??t.model;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 return t;
}
const rows=(p,w)=>sessions(p,w,'STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>({...e,session:s.id})));
const runs=(p,w)=>sessions(p,w,'RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`);
/** Return step 2 with the normal count as the ceiling (policy strengthReturnSets): max(1, min(ceiling - 1, strengthEntrySets + 1)). */
const step2=normal=>Math.max(1,Math.min(normal-1,RT.strengthEntrySets+1));

/** F13: week 0 executed; nothing reported after one run of week 1; the empty week-7 review (s1); the same evening the athlete answers with the
 * break, 2026-11-24 to 2027-01-09, work (s2); the week-8 review with week 8 executed as prescribed (s3). */
function f13({answer=true,s3=true,s4=false}={}){
 const t=timeline(F13);const normal=Object.fromEntries(rows(t.p,1).map(e=>[e.id,e.sets]));
 const s1=t.step({week:7,day:6,time:'20:00'});
 const s2=answer?t.step({week:7,day:6,time:'20:40'},{observations:p=>[...sessions(p,0).map(s=>asPrescribed(p,s)),asPrescribed(p,sessions(p,1,'RUN').find(s=>s.day===0))],interruption:{startDate:'2026-11-24',endDate:'2027-01-09',reasonCategory:'WORK',reason:'night shifts for seven weeks, no training at all',nonclinical:true}}):null;
 const s3r=answer&&s3?t.step({week:8,day:6,time:'20:00'},{observations:p=>sessions(p,8).map(s=>asPrescribed(p,s))}):null;
 // s4: the week-9 review, week 9 executed as prescribed; its start is read from history (the evidence reducer reads the return-entry week).
 const s4r=s3r&&s4?t.step({week:9,day:6,time:'20:00'},{observations:p=>sessions(p,9).map(s=>asPrescribed(p,s))}):null;
 return {t,s1,s2,s3:s3r,s4:s4r,normal};
}

test('R7-D Phase 5 T42 (SSCTR-P4-F01, the R7D-F13 shape): exercises planned before a long break and never executed enter at the return entry, take return step 2 with the normal count as ceiling, then one set per executed week; no block is credited for weeks never executed',()=>{
 const {t,s2,s3,normal}=f13();
 assert.equal(s2.action,'REESTABLISH',s2.reason);assert.equal(s2.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE');
 const P2=s2.proposal,entry=rows(P2,8),ids=Object.keys(normal);
 assert.deepEqual(entry.map(e=>e.id).sort(),[...ids].sort(),'the entry week uses the exercises never executed before the break');
 for(const e of entry){
  assert.equal(e.exposure?.kind,'RETURN_ENTRY',`${e.id}: a return-entry week dose (was a first establishment or bodyweight row at RIR3)`);
  assert.equal(e.sets,RT.strengthEntrySets,`${e.id}: entry sets`);assert.ok(e.rir>=RT.strengthEntryMinimumRir,`${e.id}: entry reserve ${e.rir} < ${RT.strengthEntryMinimumRir}`);
 }
 // Return step 2, planned by the return and again by the review of the executed entry week: the normal count is the ceiling (no executed count).
 for(const [label,P] of [['s2',P2],['s3',t.p]])for(const e of rows(P,9)){
  assert.equal(e.exposure?.kind,'RETURN_STEP',`${label} ${e.id}: return step 2 (was the normal count with a block credited, 3x10/3x10/2x10)`);
  assert.equal(e.sets,step2(normal[e.id]),`${label} ${e.id}: step-2 sets with the normal count ${normal[e.id]} as ceiling`);assert.ok(e.rir>=3,`${label} ${e.id}: step-2 reserve`);
 }
 // After the return steps the count comes back at most one set per executed week, never above the normal count.
 for(const e of rows(t.p,10))assert.ok(e.sets<=Math.min(normal[e.id],step2(normal[e.id])+1),`${e.id}: week 10 ${e.sets} sets`);
 // No block credited for a week never executed: the weeks of the return earn no block-boundary set.
 for(const id of ids){const st=t.p.stateTrace[9].strength.exercises[id];assert.ok(st&&!(st.blocksDone>0),`${id}: no block credited (blocksDone ${st?.blocksDone})`);assert.equal(st.returnStep,1,`${id}: at return step 2 after the executed entry`);}
 assert.equal(s3.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',s3.reason);
 // Running is unchanged by the strength correction (the approved RESTART recipe after a long stop).
 assert.deepEqual([8,9,10].map(w=>runs(P2,w)),[['EASY:15','EASY:15','EASY:15'],['EASY:20','EASY:20','EASY:20'],['EASY:25','EASY:25','EASY:25']]);
 // History keeps the return: after the week-9 review (its start read by the evidence reducer from the executed entry week), the counts still come
 // back at most one set per executed week and no block is credited for the return's weeks.
 const {t:u,s4}=f13({s4:true});assert.equal(s4.planValidity.status,'VALID_WITHIN_CURRENT_BOUNDED_SCOPE',s4.reason);
 const w10=new Map(rows(u.p,10).map(e=>[e.id,e.sets]));
 for(const id of ids){assert.ok(w10.get(id)<=step2(normal[id])+1,`${id}: week 10 at ${w10.get(id)} sets after step 2 (the history reading lost the return steps)`);const st=u.p.stateTrace[10].strength.exercises[id];assert.ok(st&&!(st.blocksDone>0),`${id}: no block credited through the return (blocksDone ${st?.blocksDone})`);}
 for(const e of rows(u.p,11))assert.ok(e.sets<=(w10.get(e.id)??0)+1,`${e.id}: week 11 rises at most one set`);
});

/** W-D49 (SSCTR-R7D-P4-FINAL-HOLDOUT-r1): F14's athlete; a moderate family break declared at the week-3 review, then week 4 executed. Arm A: the break
 * from week 0 day 0, before any strength exposure; control arm B: week 0 executed, the break from 2026-12-21. Both end 2027-01-08. */
function wd49(arm,input=F14){
 const t=timeline(input);
 const r1=t.step({week:3,day:6,time:'20:00'},{observations:arm==='B'?p=>sessions(p,0).map(s=>asPrescribed(p,s)):[],interruption:{startDate:arm==='B'?'2026-12-21':'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 const r2=t.step({week:4,day:6,time:'20:00'},{observations:p=>sessions(p,4).map(s=>asPrescribed(p,s))});
 return {t,r1,r2,P1:r1.proposal};
}
const doses=(P,w)=>rows(P,w).map(e=>`${e.session}:${e.id}:${e.sets}x${e.reps}@${e.rir}`);

test('R7-D Phase 5 T43 (SSCTR-P4-F01, witness W-D49-A and control W-D49-B): a break before any strength exposure enters at the return entry and takes return step 2, and an athlete with an executed week 0 is unchanged',()=>{
 const A=wd49('A');assert.equal(A.r1.action,'REESTABLISH',A.r1.reason);
 for(const e of rows(A.P1,4)){assert.equal(e.sets,RT.strengthEntrySets,`A ${e.id}: entry sets`);assert.ok(e.rir>=RT.strengthEntryMinimumRir,`A ${e.id}: entry reserve ${e.rir} (was RIR3)`);}
 const wk5=rows(A.t.p,5);assert.ok(wk5.length>0);
 for(const e of wk5){assert.ok(e.sets<=RT.strengthEntrySets+1,`A ${e.id}: week 5 at ${e.sets} sets (was up to 4x8)`);assert.ok(e.rir>=3,`A ${e.id}: week 5 reserve`);}
 const by=new Map(wk5.map(e=>[e.session.split('-').at(-1)+':'+e.id,e.sets]));
 for(const e of rows(A.t.p,6)){const k=e.session.split('-').at(-1)+':'+e.id;if(by.has(k))assert.ok(e.sets<=by.get(k)+1,`A ${k}: week 6 rises at most one set`);}
 // The entry week is a return week for every reader: the record labels its strength reports RETURN (learning comparability), and slots do not
 // rotate in it, so the exercises entered are the ones that take return step 2 (rotation applies outside a return, SSCTR D51).
 const modes=[...new Set(A.t.ledger.filter(o=>o.context?.sport==='STRENGTH'&&o.context?.weekIndex===4).map(o=>o.context.mode))];
 assert.deepEqual(modes,['RETURN'],'the entry week\'s strength reports are recorded in the RETURN mode');
 const R=wd49('A',{...F14,athlete:{...F14.athlete,exerciseRotationPreference:'EVERY_2_WEEKS'}}),slots=(P,w)=>rows(P,w).map(e=>e.session.split('-').at(-1)+':'+e.id);
 assert.deepEqual(slots(R.P1,4),slots(R.t.p,5),'with rotation every two weeks the entry week enters the exercises return step 2 continues');

 // Control (W-D49-B, valid history): the outputs the frozen runtime gave, unchanged (SSCTR record; R7D-FREEZE-4 and R7D-FREEZE-5 alike).
 const B=wd49('B');assert.equal(B.r1.action,'REESTABLISH',B.r1.reason);
 assert.deepEqual(doses(B.P1,4),['w4-str-d0:goblet-squat:1x8@4','w4-str-d0:db-floor-press:1x8@4','w4-str-d0:db-row:1x8@4','w4-str-d0:db-calf-raise:1x8@4','w4-str-d0:dead-bug:1x8@4','w4-str-d4:glute-bridge:1x8@4','w4-str-d4:db-row:1x8@4','w4-str-d4:db-floor-press:1x8@4','w4-str-d4:reverse-lunge:1x10@4','w4-str-d4:db-biceps-curl:1x8@4']);
 assert.deepEqual(doses(B.t.p,5),['w5-str-d0:goblet-squat:1x8@4','w5-str-d0:db-floor-press:1x8@4','w5-str-d0:db-row:1x8@4','w5-str-d0:db-calf-raise:1x8@4','w5-str-d0:dead-bug:1x8@3','w5-str-d4:glute-bridge:1x8@3','w5-str-d4:db-row:1x8@4','w5-str-d4:db-floor-press:1x8@4','w5-str-d4:reverse-lunge:1x10@3','w5-str-d4:db-biceps-curl:1x8@4']);
});

test('R7-D Phase 5 T44 (R7D-FC-01): a band row reported as prescribed is evidence: it progresses by repetitions like a bodyweight row, earns its return steps, and is never read as a load',()=>{
 const t=timeline(F13);
 for(const w of [0,1,2])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s))});
 const reps=(P,w,id)=>rows(P,w).find(e=>e.id===id)?.reps;
 assert.ok(reps(t.p,2,'band-row')>reps(t.p,1,'band-row'),`band-row ${reps(t.p,1,'band-row')} -> ${reps(t.p,2,'band-row')} reps after an executed week (it never moved)`);
 assert.ok(reps(t.p,2,'box-squat-bodyweight')>reps(t.p,1,'box-squat-bodyweight'),'the bodyweight row progresses as before');
 assert.ok(rows(t.p,3).filter(e=>e.id==='band-row').every(e=>e.load.mode==='BODYWEIGHT'&&e.load.value===undefined&&e.load.convention==='BAND_TENSION'),'a band row carries no kilogram');
 assert.ok(t.results.every(r=>(r.loadQuestions??[]).every(q=>q.exerciseId!=='band-row')),'a band log is never asked about as a load');
 // After the return of F13, the band row executed at the entry takes return step 2 like the others (was: the entry repeated).
 const {t:u,normal}=f13();
 assert.equal(rows(u.p,9).find(e=>e.id==='band-row')?.exposure?.kind,'RETURN_STEP');assert.equal(rows(u.p,9).find(e=>e.id==='band-row')?.sets,step2(normal['band-row']));
});

const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',RECON='REQUIRES_RECONCILIATION';
const asksUnreported=(r,label)=>{assert.equal(r.status,'ASK',`${label}: ${r.reason}`);assert.equal(r.question?.kind,'UNREPORTED_TRAINING',label);assert.equal(r.proposal??null,null,label+': no plan while asked');assert.equal(r.planValidity.status,RECON,label);assert.ok((r.question.unreported?.sessionIds??[]).length>0,label);};

test('R7-D Phase 5 T45 (QRE-P4-F01, the R7D-F13 shape and the judge\'s witness grid): after more than a month without a reported run the coach asks before a low-dose CONSOLIDATION week as before a DEVELOPMENT week, and plans neither the trim nor the projection',()=>{
 // F13 s1: the empty week-7 review, the next week a CONSOLIDATION week (was MODIFY VALID with EASY 20/20/LONG 15 trimmed to 15/15/15, no question).
 const {s1}=f13({answer:false});asksUnreported(s1,'F13 s1');
 assert.ok(s1.question.unreported.sessionIds.every(id=>/run/.test(id)),'the question lists run sessions');
 // The same silent athlete at other points (QRE-R7D-FINAL-HOLDOUT-r1 witness grid): end of weeks 5 and 6 (DEVELOPMENT next, asked before too), the
 // empty review with week 7's strength reported, and the review on week 8's Monday (REPLAN_FROM_EVIDENCE before).
 for(const [label,at,obs] of [['w5 end',{week:5,day:6,time:'20:00'},null],['w6 end',{week:6,day:6,time:'20:00'},null],['w7 strength reported',{week:7,day:6,time:'20:00'},p=>sessions(p,7,'STRENGTH').map(s=>asPrescribed(p,s))],['w8 Monday',{week:8,day:0,time:'07:00'},null]]){
  const t=timeline(F13);asksUnreported(t.step(at,obs?{observations:obs}:{}),'F13 '+label);
 }
 // Witness on another athlete (R7D-F25's intake): the first planned week a low-dose CONSOLIDATION week.
 {const t=timeline(F25);assert.equal(t.p.weeks[8].phase,'CONSOLIDATION');asksUnreported(t.step({week:7,day:6,time:'20:00'}),'F25 w7 end');}
});

test('R7-D Phase 5 T46 (QRE-P4-F01 controls): what is known is not asked: an answered break, a reported known stop, a reported run in the window, and a restart recipe',()=>{
 // The answer (s2) is a known stop: the return is planned with nothing pending.
 {const {s2}=f13({s3:false});assert.equal(s2.action,'REESTABLISH',s2.reason);assert.equal(s2.question??null,null);assert.equal(s2.planValidity.status,VALID);}
 // Every run of the window reported not done (a known miss): no unreported-training question; the entry is the dose.
 {const t=timeline(F13);const r=t.step({week:7,day:6,time:'20:00'},{observations:p=>p.weeks.slice(0,8).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')).map(s=>asPrescribed(p,s,{completed:false}))});
  assert.notEqual(r.question?.kind,'UNREPORTED_TRAINING',r.reason);assert.equal(r.planValidity.status,VALID,r.reason);}
 // A run reported done in the window: the reference exists; nothing is asked.
 {const t=timeline(F13);const r=t.step({week:7,day:6,time:'20:00'},{observations:p=>[asPrescribed(p,sessions(p,7,'RUN')[0])]});assert.notEqual(r.question?.kind,'UNREPORTED_TRAINING',r.reason);}
 // A week of normal reporting: no question at any review.
 {const t=timeline(F13);for(const w of [0,1,2,3])assert.equal(t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s))}).question??null,null,`week ${w}`);}
});

test('R7-D Phase 5 T47: both corrected paths are deterministic and idempotent: the same timeline gives the same bytes, and the same answer sent again changes nothing',()=>{
 const a=f13(),b=f13();
 assert.deepEqual(a.t.results.map(r=>JSON.stringify(r)),b.t.results.map(r=>JSON.stringify(r)),'the same F13 timeline gives byte-identical decisions');
 // The same answer review sent again (same event id and facts) records nothing new and plans the same.
 const t=timeline(F13);t.step({week:7,day:6,time:'20:00'});
 const ans={observations:p=>[...sessions(p,0).map(s=>asPrescribed(p,s)),asPrescribed(p,sessions(p,1,'RUN').find(s=>s.day===0))],interruption:{startDate:'2026-11-24',endDate:'2027-01-09',reasonCategory:'WORK',reason:'night shifts for seven weeks, no training at all',nonclinical:true}};
 const first=t.step({week:7,day:6,time:'20:40'},ans),plan=JSON.stringify(t.p.weeks.slice(8)),ledger=t.ledger.length;t.n--;
 const again=t.step({week:7,day:6,time:'20:40'},ans);
 assert.equal(first.action,'REESTABLISH');assert.equal(t.ledger.length,ledger,'nothing new is recorded');assert.equal(JSON.stringify((again.proposal??t.p).weeks.slice(8)),plan,'the plan ahead is the same');
});
