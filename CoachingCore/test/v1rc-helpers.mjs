// V1 Run Calibration Extension (Founder request of 2026-11-11): shared helpers of its directed tests and journeys (not a test file). The timeline is
// a conforming client: it keeps the plan, the engine's record, the reference state and the extension's evidence record that each decision returns.
import * as X from '../src/v1-run-index.mjs';
import * as V1 from '../src/v1-index.mjs';
import {devRunCalibration,RUN_EXTENSION_URL} from '../src/v1-run-calibration.mjs';
import {devEventExtension} from '../src/v1-events.mjs';
import {hash} from '../src/value.mjs';
import fs from 'node:fs';
export {X,V1,hash};
export const VALUES=JSON.parse(fs.readFileSync(RUN_EXTENSION_URL,'utf8'));
/** The development authority (every boundary on, over the file as read): what the tests run under until the independent record exists. */
export const DEV={runCalibration:devRunCalibration(),eventExtension:devEventExtension()};
export const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
export const mmss=s=>s==null?'-':`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
export const hms=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=Math.round(s%60);return (h?h+':':'')+String(m).padStart(h?2:1,'0')+':'+String(x).padStart(2,'0');};
/** A result as an athlete declares it: measured on an official course, run hard and tolerated, unless said otherwise. */
export const result=(distance,seconds,date,x={})=>({kind:'RACE_RESULT',distance,seconds,date,measurement:'OFFICIAL',rpe:9,tolerated:true,...x});
/** An intake: a runner (and lifter) with the facts given; `anchors` are the performance anchors. */
export const runner=({id='rc-runner',asOf='2026-11-07',start='2026-11-09',weeks=12,runExperience='INTERMEDIATE',goal='PERFORMANCE',recent={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:1},anchors,schedule={},athlete={}}={})=>({
 version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate:start,weeks,timezoneOffsetMinutes:-180,
 athlete:{id,ageEligible:true,eligibility:ELIG(asOf),runExperience,strengthExperience:'INTERMEDIATE',recent,goals:{run:goal,strength:'MAINTAIN'},equipment:['BODYWEIGHT','DUMBBELLS','BENCH'],...(anchors?{performanceAnchors:anchors}:{}),...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2],runMinutes:60,strengthMinutes:40,longRunDay:6,longRunMinutes:120,...schedule}});
/** The report of a session done as prescribed; a run takes `pace` (seconds per km over the whole run), `workPace`, `rpe` and any other actual field. */
export function report(p,s,{pace=null,workPace=null,rpe=null,effort='ON_TARGET',response={},actual={},completed=true}={}){
 const x=s.prescription,a={completed,...(completed?{minutes:x.durationMinutes}:{})};
 if(x.modality==='STRENGTH')a.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:{load:{value:10,unit:'KG',convention:e.load.convention}}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));
 else if(completed){if(pace){a.distanceKm=Math.round(x.durationMinutes*60/pace*100)/100;a.measurement='GPS';}if(workPace)a.work={paceSecondsPerKm:workPace};if(rpe!==null)a.rpe=rpe;}
 return {eventId:'rc-done-'+s.id,athleteId:p.athleteId,sessionId:s.id,actual:{...a,...actual},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort,nextDayFunction:'NORMAL',...response},occurrenceDate:s.date};
}
/** The conforming client of the extended entry point. */
export function timeline(input,{opts=DEV,prefix='rc'}={}){
 const g=X.generateProgram(input,opts);
 const t={g,p:g.program,ledger:[],ref:null,ev:g.runEvidenceRecord??[],cal:g.runCalibration,n:0,results:[],opts};
 if(!t.p)return t;
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=t.day(w,d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`${prefix}-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],
  ...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.signals?{signals:extra.signals}:{}),
  ...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(extra.runEvidence?{runEvidence:extra.runEvidence}:{}),runEvidenceRecord:t.ev};};
 // The mirror: the frozen V1 entry point decides every review again, without the extension's keys, on its own plan, record and reference state.
 // `t.same` stays true while its plan, decisions and record are the extended entry point's (`extra.expectWithhold`: the one case where the
 // extension asks the engine to withhold a move, which the mirror asks too).
 const engineOpts=opts.eventExtension?{eventExtension:opts.eventExtension}:{},m={p:V1.generateProgram(input,engineOpts).program,ledger:[],ref:null};
 t.mirror=m;t.same=hash(m.p)===hash(t.p);t.differences=[];
 t.step=(w,d,kind,extra={},time='20:00')=>{const rv=t.review(w,d,kind,extra,time),r=X.evaluateProgram(t.p,rv,t.opts);
  const {runEvidence,runEvidenceRecord,actualLedger,referenceState,...plain}=rv,b=V1.evaluateProgram(m.p,{...plain,...(m.ledger.length?{actualLedger:m.ledger}:{}),...(m.ref?{referenceState:m.ref}:{})},{...engineOpts,...(extra.expectWithhold?{withhold:['MOVE']}:{})});
  m.ledger=b.actualLedger??m.ledger;m.ref=b.referenceState??m.ref;if(b.proposal)m.p=b.proposal;
  t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.ev=r.runEvidenceRecord??t.ev;t.cal=r.runCalibration;t.results.push(r);
  const {runCalibration:_c,runEvidenceRecord:_r,runEvidence:_e,...rest}=r;
  if(hash(rest)!==hash(b)||hash(m.p)!==hash(t.p)||hash(m.ledger)!==hash(t.ledger)){t.same=false;t.differences.push(rv.event.id);}
  return r;};
 /** The weekly review of week w (Sunday evening) with every live session of the week reported; `how(session)` gives the report options of a run, or false to leave a session unreported as not done. */
 t.week=(w,how=()=>({}),extra={})=>{const obs=t.p.weeks[w].sessions.filter(live).map(s=>{const o=s.sport==='RUN'?how(s):{};return o===false?report(t.p,s,{completed:false}):report(t.p,s,o??{});});return t.step(w,6,'WEEKLY_REVIEW',{...extra,observations:obs});};
 return t;
}
/** Every text of a calibration, for the claim check. */
export const textsOf=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(textsOf):v&&typeof v==='object'?Object.values(v).flatMap(textsOf):[];
