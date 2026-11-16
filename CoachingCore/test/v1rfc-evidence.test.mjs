// V1 Race Forecast + Pace Insights (phase B): the evidence boundary. Phase B reads the engine's record only through the admitted answer of the
// run formats (COACHINGCORE-V1-RUN-FORMAT-FREEZE-2). Proven here, by outcome, on a conforming client of the composed entry point:
// - adherence, training load, pace evidence and a race result are four different things: a completed session is adherence whether or not its
//   pace may be read; no execution the run formats withhold votes in an insight, moves a band or supports a revision;
// - the trap the closure of the E-01 patch named: a session by time has `paceEvidence: null` even when its row is withheld, and its raw row
//   still carries `work.paceSecondsPerKm`; neither admits it;
// - a stop, a forged completion, a declared distance, an unreadable execution and a conflict between sources, each as the forecast credits it;
// - what race week shows is never shown changed; the pace revision exists only under its own authority and one band source (I8, IC-2);
// - the limits that stay open (QRE-RWS-F-01, the hard gate E-1) are shown as they are, not as met.
// Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {weekAdherence} from '../src/v1-race-forecast.mjs';
import {PACE_REVISION_RESPONSE} from '../src/v1-run-forecast-index.mjs';
import {P,F,DEV,DEV_REVISION,RC,timeline,racePlan,runner,result,report,asPrescribed,nativeReport,flatSteps,hash,addDays,ELIG,START,live,near} from './v1rfc-helpers.mjs';
import {sixteen,paced,DEV as RWS_DEV} from './v1rws-helpers.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},THRESHOLD='THRESHOLD_CONTROLLED',PACE=290;
const RFC_KEYS=['runForecast','paceInsights','paceRevision','paceRevisionRecord'],rest=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!RFC_KEYS.includes(k)));
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const device=(t,q,actual,id='dev-'+q.id,activity='hk-'+q.id)=>({eventId:id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:activity,source:{provider:'HEALTHKIT',activityId:activity,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,...actual},response:UNKNOWN});
const insight=r=>r.paceInsights.domains[THRESHOLD],creditsOf=(r,ids)=>r.runForecast.adherence.weeks.flatMap(k=>k.credits).filter(c=>ids.includes(c.sessionId)).map(c=>[c.c,c.rule]);
const STATE=['p','ledger','ref','ev','fmt','hist','rev','runs','n'];
let BASE=null;
/** A 10 km race plan after weeks 1 to 3 as prescribed (a client that restores what it stored, through JSON). */
function base(){
 if(!BASE){const t=timeline(racePlan({goalMinutes:48}));for(let w=0;w<3;w++)t.week(w,s=>asPrescribed(t,s));BASE=JSON.stringify(Object.fromEntries(STATE.map(k=>[k,t[k]])));}
 const t=timeline(racePlan({goalMinutes:48}));Object.assign(t,JSON.parse(BASE));return t;
}
/**
 * The threshold session of weeks 4 to 7: the athlete reports it by time with its work pace (4:50 per km at effort 7: faster than the band, at
 * an effort inside the cue). `watch`: what a device import of the same session brings (null: none). `more`: what the athlete's correction of
 * their own report adds (undefined: no correction). `resync`: the device then corrects its own report. `first`: what the athlete's report states
 * beside. Then the look of the Monday of week 8.
 */
function harder({watch=null,more,resync=false,first={},response={}}={}){
 const t=base(),seen=[];
 for(const w of [3,4,5,6]){
  const q=t.runsOf(w,s=>s.role==='QUALITY')[0],run=t.runs[q.id],others=t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==q.id).map(s=>plain(t,s)),day=t.day(w,6);
  assert.equal(q.prescription.family,'THRESHOLD');
  const said=report(t.p,q,{workPace:PACE,rpe:7,response}),a1={...said,eventId:'app-'+q.id,actual:{...said.actual,formatHash:run.timeFormatHash,...first}},d1=watch?device(t,q,watch):null;
  t.step(w,6,'WEEKLY_REVIEW',{observations:[...others,a1,...(d1?[d1]:[])]},'18:00');
  if(more!==undefined)t.step(w,6,'WEEKLY_REVIEW',{observations:[{...a1,eventId:a1.eventId+'-v2',actual:{...a1.actual,...more},correctionOf:a1.eventId,correctedAt:`${day}T19:30:00-03:00`}]},'20:00');
  if(resync)t.step(w,6,'WEEKLY_REVIEW',{observations:[{...d1,eventId:d1.eventId+'-v2',correctionOf:d1.eventId,correctedAt:`${day}T20:30:00-03:00`}]},'21:00');
  seen.push(q.id);
 }
 return {t,seen,r:t.look(7)};
}
const POOR={distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},GOOD={distanceKm:6.2,measurement:'GPS',gpsQuality:'OK'};
const CASES={};const of=(key,o)=>CASES[key]??=harder(o);

test('adherence is not pace evidence: a completed session the run formats withhold is credited whole and votes in nothing (E-01)',()=>{
 const alone=of('alone',{}),merged=of('merged',{watch:POOR});
 // The athlete alone: four comparable sessions faster than the band at the target effort. They vote; the insight explains, and changes nothing.
 assert.deepEqual([insight(alone.r).state,insight(alone.r).votes,insight(alone.r).sessions.map(s=>s.class),insight(alone.r).action],['IMPROVING',4,Array(4).fill('FASTER'),'EXPLAIN_ONLY']);
 assert.deepEqual(creditsOf(alone.r,alone.seen),Array(4).fill([1,'COMPLETED']));
 // With the watch's flagged measurement merged into the row, the row is not comparable by the calibration's own rule: it does not vote.
 assert.deepEqual([insight(merged.r).state,insight(merged.r).excluded.map(x=>x.reason)],['INSUFFICIENT_DATA',Array(4).fill('NOT_COMPARABLE')]);
 for(const [how,more,word] of [['plainly',{},'REPORT_NOT_CARRIED'],['listing a recording',{segments:[{distanceKm:4,measurement:'GPS'}]},'REPORT_NOT_CARRIED'],['declaring with a failure reason',{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}},'REPORT_NOT_CARRIED']]){
  const m=of(how,{watch:POOR,more});
  for(const id of m.seen){
   const row=m.t.row(id),e=m.r.runSessions[id].execution;
   // The record, as the run formats closed it: the row in force is the athlete's correction alone, by time, with a work pace and no distance;
   // the watch's report still stands and is not on it. The reading says so in `paceWithheld`; `paceEvidence` says nothing (null).
   assert.deepEqual([row.eventId,'distanceKm' in row.actual,row.actual.work,e.status,e.completed,e.paceEvidence,e.paceWithheld],[`app-${id}-v2`,false,{paceSecondsPerKm:PACE},'TIME',true,null,word],how);
   // The trap: a reader of `paceEvidence !== false`, or of the raw row, would take this session's work pace. It is 6% faster than the band.
   assert.ok(e.paceEvidence!==false&&row.actual.work.paceSecondsPerKm===PACE&&row.actual.completed===true,how);
  }
  assert.deepEqual(m.r.runFormat.paceEvidenceWithheld.filter(x=>m.seen.includes(x.sessionId)).map(x=>x.reason),Array(4).fill(word),how);
  // Phase B: none of them votes, each says why, and the insight has nothing to say. Each is adherence all the same.
  assert.deepEqual([insight(m.r).state,insight(m.r).votes,insight(m.r).sessions,insight(m.r).excluded.map(x=>[x.reason,x.withheld]),insight(m.r).action],['INSUFFICIENT_DATA',0,[],Array(4).fill(['PACE_EVIDENCE_WITHHELD',word]),'INFORMATIVE_ONLY'],how);
  assert.deepEqual(creditsOf(m.r,m.seen),Array(4).fill([1,'COMPLETED']),how);
  // And nothing of the forecast moves with evidence that is withheld: it is the forecast of the merged control, input for input.
  assert.equal(m.r.runForecast.inputDigest,merged.r.runForecast.inputDigest,how);assert.equal(m.r.runCalibration.hash,merged.r.runCalibration.hash,how);
 }
 // The same when the device corrects its own part of a merged row (the shape of QRE-RWS-D-01): the row no longer says what the athlete said.
 const resync=of('resync',{watch:GOOD,resync:true});
 assert.deepEqual([insight(resync.r).votes,insight(resync.r).excluded.map(x=>[x.reason,x.withheld])],[0,Array(4).fill(['PACE_EVIDENCE_WITHHELD','REPORT_NOT_CARRIED'])]);
 assert.deepEqual(creditsOf(resync.r,resync.seen),Array(4).fill([1,'COMPLETED']));
});
test('every answer of the run formats is returned as it is on these records too, and an answer that delivers no session carries no forecast (C-05)',()=>{
 const m=of('listing a recording',{watch:POOR,more:{segments:[{distanceKm:4,measurement:'GPS'}]}}),t=m.t;
 // The same review through the run formats' own entry point: every key they return is the one this entry point returned.
 const review=t.review(7,1,'WEEKLY_REVIEW',{},'08:00'),mine=P.evaluateProgram(t.p,review,DEV),{paceRevisionRecord:_r,...theirs}=review;
 assert.equal(hash(rest(mine)),hash(F.evaluateProgram(t.p,theirs,RWS_DEV)));
 // A review dated before the record it is sent with: the run formats decide nothing on it, and nothing is forecast or read from it.
 const early=P.evaluateProgram(t.p,{...review,asOf:`${t.day(5,1)}T08:00:00-03:00`,weekIndex:5,eligibility:ELIG(t.day(5,1))},DEV);
 assert.notEqual(early.runFormat.status,'ACTIVE');assert.ok(['NO_DECISION','REVIEW_BEFORE_THE_RECORD'].includes(early.runFormat.reason));
 assert.deepEqual([early.runForecast.status,early.runForecast.reason,early.paceInsights.status,early.paceInsights.domains],['UNAVAILABLE','RUN_FORMATS_'+early.runFormat.reason,'UNAVAILABLE',{}]);
 assert.equal(early.runForecast.observedForecast,undefined);assert.equal(early.runForecast.current,undefined);
});

/** The experienced runner whose long run of week 2 is natively 16 km, on a 10 km race plan; `said(t,long,run)` is the report of that long run. */
function longRun(said){
 const t=timeline(sixteen({goal:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-09',83)}}}));t.week(0,paced);
 const long=t.runsOf(1,s=>s.role==='LONG')[0],run=t.runs[long.id];assert.equal(run.expression,'NATIVE');
 const target=flatSteps(run.blocks).find(x=>x.kind==='STEADY').target.metres/1000;
 t.week(1,s=>s.id===long.id?said(t,long,run,target):asPrescribed(t,s));
 const r=t.look(2),week=r.runForecast.adherence.weeks.find(k=>k.week===1);
 return {t,r,long,target,credit:week.credits.find(c=>c.sessionId===long.id),week,execution:r.runSessions[long.id].execution};
}
test('the credit of a session is its extent as the engine reads it: completed is 1 however fast; a stop is never the target; a declaration is adherence only',()=>{
 // I2: 16 km covered in fewer minutes than planned is complete, and credited whole.
 const fast=longRun((t,s,run,km)=>nativeReport(t,s,{minutes:Math.round(run.estimate.durationMinutes.low)-8,km,rpe:4}));
 assert.deepEqual([fast.execution.status,fast.execution.completed,fast.credit.c,fast.credit.rule],['DISTANCE',true,1,'COMPLETED']);assert.equal(fast.week.a,1);
 // I5: stopped at three quarters with `completed: true` and a reading forged on the report: incomplete, credited by the distance covered.
 const stopped=longRun((t,s,run,km)=>nativeReport(t,s,{minutes:run.estimate.durationMinutes.high+2,km:km*0.75,rpe:5,actual:{completed:true,completionRead:'DISTANCE',stop:{reason:'PACING'}}}));
 assert.deepEqual([stopped.execution.status,stopped.execution.completed,stopped.credit.rule],['STOPPED',false,'RWS_STEPS_EXTENT']);assert.ok(near(stopped.credit.c,0.75,1e-9));assert.ok(stopped.week.a<1);
 // The minutes of that run were more than planned: the minutes reading would have credited it whole (AD-1).
 assert.ok(stopped.execution.actualMinutes>=stopped.long.prescription.durationMinutes);
 // `extentFraction` is description only (SSCTR-RWS-E-03): the credit is the smaller usable distance over the target, whatever that field says.
 assert.ok(near(stopped.credit.c,stopped.execution.extentKm/stopped.target,1e-9));
 // I3: declared with no device: complete and credited, and no pace evidence.
 const declared=longRun((t,s,run,km)=>nativeReport(t,s,{minutes:s.prescription.durationMinutes,rpe:4,actual:{declared:{distanceKm:km}}}));
 assert.deepEqual([declared.execution.status,declared.execution.basis,declared.execution.paceEvidence,declared.credit.c,declared.credit.rule],['DISTANCE','DECLARED',false,1,'COMPLETED']);
 // I6: minutes and nothing else on a session by distance: unreadable as an execution. No credit from its minutes; counted with credit 0 (the
 // provisional reading of the one named point; the other reading leaves it out of both sides).
 const unknown=longRun((t,s)=>nativeReport(t,s,{minutes:s.prescription.durationMinutes,rpe:4}));
 assert.deepEqual([unknown.execution.status,unknown.execution.completed,unknown.credit.c,unknown.credit.rule,unknown.credit.counted],['UNKNOWN',false,0,'UNKNOWN_EXECUTION',true]);
 const sessions=[{sessionId:'a',planned:60,reported:true,completed:true},{sessionId:'b',planned:100,reported:true,completed:false,unknown:true,actualMin:100}];
 assert.ok(near(weekAdherence(sessions).a,60/160,1e-12));assert.equal(weekAdherence(sessions,{unknown:'EXCLUDED'}).a,1);assert.equal(weekAdherence(sessions,{unknown:'EXCLUDED'}).plannedMinutes,60);
 // None of the four is another forecast than its own adherence makes: the estimate it starts from is the same.
 for(const x of [stopped,declared,unknown])assert.deepEqual(x.r.runForecast.current,fast.r.runForecast.current);
});
test('a conflict between the app and the device: the session is no execution anyone can read; no credit and no vote, and the forecast says so',()=>{
 const t=base(),w=3,q=t.runsOf(w,s=>s.role==='QUALITY')[0],others=t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==q.id).map(s=>plain(t,s));
 const said=report(t.p,q,{workPace:PACE,rpe:7}),a1={...said,eventId:'app-'+q.id,actual:{...said.actual,formatHash:t.runs[q.id].timeFormatHash}};
 t.step(w,6,'WEEKLY_REVIEW',{observations:[...others,a1,device(t,q,{minutes:12})]},'18:00');
 const row=t.row(q.id);assert.equal(row.conflicted,true);
 const r=t.look(4),credit=r.runForecast.adherence.weeks.find(k=>k.week===3).credits.find(c=>c.sessionId===q.id);
 assert.deepEqual([credit.c,credit.rule],[0,'UNKNOWN_EXECUTION']);assert.equal(insight(r).votes,0);assert.ok(['NOT_COMPLETED','PACE_EVIDENCE_WITHHELD'].includes(insight(r).excluded[0].reason));
});

test('a week\'s forecast does not move inside the week, and what race week shows is never shown changed',()=>{
 // In-week stability: the forecast of the Monday is the forecast of every later day of the week, whatever is reported in between.
 const t=base(),monday=t.look(3),sunday=t.week(3,s=>asPrescribed(t,s));
 assert.equal(sunday.runForecast.inputDigest,monday.runForecast.inputDigest);assert.deepEqual(sunday.runForecast.planScenario.forecastSeconds,monday.runForecast.planScenario.forecastSeconds);
 // A session of last week first reported this week is read from next week, not this one.
 const u=base();u.step(3,6,'WEEKLY_REVIEW',{observations:u.p.weeks[3].sessions.filter(live).filter(s=>s.role!=='LONG').map(s=>plain(u,s))});
 const before=u.look(4),long=u.runsOf(3,s=>s.role==='LONG')[0],late=u.step(4,2,'WEEKLY_REVIEW',{observations:[plain(u,long)]},'09:00');
 assert.equal(late.runForecast.inputDigest,before.runForecast.inputDigest);assert.deepEqual(late.runForecast.adherence.weeks[3].credits.at(-1).rule,'MISSING_REPORT');
 u.week(4,s=>asPrescribed(u,s));assert.equal(u.look(5).runForecast.adherence.weeks[3].credits.at(-1).rule,'COMPLETED');
 // Race week. The whole journey to the Monday of race week, with a 10 km race of week 8 as the reference.
 const whole=(()=>{const x=timeline(racePlan({goalMinutes:48}));for(let w=0;w<15;w++)x.week(w,s=>asPrescribed(x,s),w===7?{runEvidence:[result('10K',2940,'2027-02-28',{id:'tuneup'})]}:{});return JSON.stringify(Object.fromEntries(STATE.map(k=>[k,x[k]])));})();
 const again=()=>{const x=timeline(racePlan({goalMinutes:48}));Object.assign(x,JSON.parse(whole));return x;};
 const frozen=again().look(15).runForecast.raceWeek;assert.deepEqual([frozen.status,frozen.frozenRange],['SHOWN_FROZEN',{lowSeconds:2835,highSeconds:3015,centralShown:false}]);
 // The athlete corrects, in race week, the report of a session of week 12 (fewer minutes than first said): the forecast of the week before
 // read that report. It is not shown again, changed or not.
 const x=again(),old=x.runsOf(11,s=>s.role==='LONG')[0],row=x.row(old.id);
 const corrected=x.step(15,1,'WEEKLY_REVIEW',{observations:[{eventId:row.eventId+'-v2',athleteId:x.p.athleteId,sessionId:old.id,occurrenceDate:row.localDate,actual:{...row.actual,minutes:20,completed:false},response:row.response,correctionOf:row.eventId,correctedAt:`${x.day(15,1)}T07:00:00-03:00`}]},'08:00');
 assert.equal(x.row(old.id).eventId,row.eventId+'-v2');assert.deepEqual([corrected.runForecast.raceWeek.status,corrected.runForecast.raceWeek.reason,corrected.runForecast.raceWeek.frozenRange],['NOT_SHOWN','REPORTS_CHANGED_SINCE_FROZEN',undefined]);
 // A session of the taper week first reported in race week was not read by the frozen forecast: it stands, unchanged.
 const z=(()=>{const k=timeline(racePlan({goalMinutes:48}));for(let w=0;w<15;w++)k.week(w,s=>w===14&&s.role==='LONG'?false:asPrescribed(k,s),w===7?{runEvidence:[result('10K',2940,'2027-02-28',{id:'tuneup'})]}:{});return k;})();
 const first=z.look(15).runForecast.raceWeek;assert.equal(first.status,'SHOWN_FROZEN');
 // A break declared since the frozen week began: not shown.
 const b=again(),broke=b.step(15,1,'WEEKLY_REVIEW',{interruption:{startDate:b.day(14,2),endDate:b.day(14,4),days:3,reasonCategory:'TRAVEL'}},'08:00').runForecast;
 assert.deepEqual([broke.raceWeek.status,broke.raceWeek.reason],['NOT_SHOWN','BREAK_DECLARED_SINCE_FROZEN']);
});

/** A plan with a threshold session every week (no race), each reported on a track at 4:28 per km and effort 7, to the Monday of week `through`+1. */
function thresholds({opts=DEV_REVISION,through=9,work=268,answer=()=>null,how=()=>null}={}){
 const intake=runner({id:'rf-thr',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:'PERFORMANCE',anchors:[result('10K',3000,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:75,longRunMinutes:130,longRunDay:6}});
 const t=timeline(intake,{opts}),looks=[];
 for(let w=0;w<=through;w++){
  const look=t.look(w);looks.push(look);const said=answer(w,look);if(said)looks[w]=t.step(w,1,'WEEKLY_REVIEW',{paceRevisionResponse:said},'09:00');
  if(w<through)t.week(w,s=>how(w,s)??(s.role==='QUALITY'?{pace:330,rpe:7,workPace:work,actual:{measurement:'TRACK'}}:{pace:s.role==='LONG'?365:345,rpe:4}));
 }
 return {t,looks};
}
const band=b=>b?[b.fastSecondsPerKm,b.slowSecondsPerKm]:null,formatBand=(j,w)=>{const q=j.t.p.weeks[w].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY'),x=flatSteps(j.looks[w].runSessions[q.id].blocks).find(s=>s.kind==='WORK');return [x.intensity.pace.fastSecondsPerKm,x.intensity.pace.slowSecondsPerKm];};
const accept=(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null;

test('the threshold band with and without authority: off, the insights only observe; on, an athlete-confirmed step moves one band from the next week, from one source (I8, IC-2)',()=>{
 // Without the pace revision's own enabling record: the same athlete, the same sessions, the same answer sent. Nothing is offered, nothing is
 // recorded, the band is the calibration's, and every key of the run formats is as they return it.
 const off=thresholds({opts:DEV,through:11,answer:(w)=>w===9?{offerId:'anything',response:'ACCEPT'}:null}),on=thresholds({through:11,answer:accept});
 for(const [w,r] of off.looks.entries()){assert.deepEqual([r.paceRevision.status,r.paceRevision.reason,r.paceRevision.offer,r.paceRevision.active,r.paceRevisionRecord],['INERT','PACE_REVISION_BOUNDARY_NOT_ENABLED',null,null,[]],'week '+w);
  assert.deepEqual(band(r.paceRevision.effectivePaceBands[THRESHOLD]),band(r.runCalibration.paceBands[THRESHOLD]));}
 assert.deepEqual([insight(off.looks[9]).state,insight(off.looks[9]).action],['IMPROVING','SUGGEST_REPORTING_A_RACE'],'observational: at the cap, with no test offered, it suggests reporting a race');
 assert.equal(off.looks[9].runCalibration.paceBands[THRESHOLD].trainingFactor,0.045);
 // With it (development authority): offered at the cap, 2% from the athlete's own median margin; confirmed, it is in force from the next week.
 const nine=on.looks[9],ten=on.looks[10],offered=thresholds({through:9}).looks[9];
 assert.deepEqual([offered.paceRevision.status,offered.paceRevision.offer.stepFraction,offered.paceRevision.offer.effectiveFrom,insight(offered).action],['OFFERED',0.02,'2027-03-15','ATHLETE_CONFIRMED_PACE_REVISION']);
 assert.deepEqual([nine.paceRevision.status,nine.paceRevision.response.recorded,nine.paceRevision.active.pending,nine.paceRevision.active.inForceToday,nine.paceRevisionRecord.length],['ACTIVE',true,true,0,1]);
 assert.equal(nine.paceRevisionRecord[0].fact,PACE_REVISION_RESPONSE);
 // Nothing moves inside the week it was confirmed in: the band shown and the band the session of that week was sized by are the calibration's.
 assert.deepEqual(band(nine.paceRevision.effectivePaceBands[THRESHOLD]),band(nine.runCalibration.paceBands[THRESHOLD]));assert.deepEqual(formatBand(on,9),band(off.looks[9].runCalibration.paceBands[THRESHOLD]));
 // From the next week: one band, shown and used. The calibration's own band, factor, capacity and estimates are untouched.
 const v1rc=band(ten.runCalibration.paceBands[THRESHOLD]),effective=band(ten.paceRevision.effectivePaceBands[THRESHOLD]);
 assert.deepEqual([v1rc,effective],[[310,345],[305,340]]);assert.deepEqual(formatBand(on,10),effective,'the selector read the band that is shown');assert.deepEqual(formatBand(off,10),v1rc);
 assert.equal(ten.paceRevision.effectivePaceBands[THRESHOLD].label,'ATHLETE_CONFIRMED_REVISION');assert.deepEqual(ten.paceRevision.effectivePaceBands[THRESHOLD].revision.ofTheV1rcBand,{fastSecondsPerKm:310,slowSecondsPerKm:345});
 assert.equal(ten.runCalibration.hash,off.looks[10].runCalibration.hash);
 // Everything but the format of the threshold sessions is what the run formats return without it: the plan, the decision, the record, every other session.
 const differs=Object.keys(rest(ten)).filter(k=>hash(ten[k])!==hash(off.looks[10][k]));assert.ok(differs.includes('runSessions')&&differs.every(k=>['runFormat','runFormatRecord','runSessions'].includes(k)),differs.join());
 // (the state of the run formats differs only in how many sessions are by distance and by time)
 assert.deepEqual(Object.keys(ten.runFormat).filter(k=>hash(ten.runFormat[k])!==hash(off.looks[10].runFormat[k])).filter(k=>!['native','time'].includes(k)),[]);
 const changed=Object.keys(ten.runSessions).filter(id=>hash(ten.runSessions[id])!==hash(off.looks[10].runSessions[id]));assert.ok(changed.length>0&&changed.every(id=>on.t.p.weeks.flatMap(k=>k.sessions).find(s=>s.id===id).prescription.family==='THRESHOLD'));
 for(const id of changed){const s=on.t.p.weeks.flatMap(k=>k.sessions).find(x=>x.id===id);assert.ok(s.weekIndex>=10);assert.equal(s.plannedPrescriptionHash,off.t.p.weeks.flatMap(k=>k.sessions).find(x=>x.id===id).plannedPrescriptionHash,'the dose is the engine\'s');}
 // 28 days must pass before another step is offered, and the total never passes 3%.
 assert.equal(on.looks[11].paceRevision.offer,null);assert.equal(on.looks[11].paceRevision.active.fraction,0.02);
});
test('the pace revision ends at once, and only the athlete\'s own readable answer to the offer of the week is ever recorded',()=>{
 // One session reported harder than the cue ends it for the sessions not yet started.
 const hard=thresholds({through:11,answer:accept,how:(w,s)=>w===10&&s.role==='QUALITY'?{pace:330,rpe:8,workPace:268,actual:{measurement:'TRACK'}}:null}).looks[11].paceRevision;
 assert.deepEqual([hard.status,hard.ended.reason,band(hard.effectivePaceBands[THRESHOLD])],['ENDED','HARDER_THAN_CUE_EXECUTION',[310,345]]);
 // The athlete revokes it.
 const revoked=thresholds({through:11,answer:(w,look)=>accept(w,look)??(w===10?{offerId:'x',response:'REVOKE'}:null)});
 assert.deepEqual([revoked.looks[10].paceRevision.status,revoked.looks[10].paceRevision.ended.reason,revoked.looks[10].paceRevisionRecord.length,band(revoked.looks[11].paceRevision.effectivePaceBands[THRESHOLD])],['ENDED','REVOKED_BY_THE_ATHLETE',2,[310,345]]);
 // Declined: nothing changes, and the same evidence is not offered again.
 const declined=thresholds({through:10,answer:(w,look)=>w===9&&look.paceRevision.offer?{offerId:look.paceRevision.offer.offerId,response:'DECLINE'}:null});
 assert.deepEqual([declined.looks[9].paceRevision.status,declined.looks[9].paceRevision.offer,declined.looks[9].paceRevisionRecord.length],['NONE',null,1]);
 // An answer that names no offer of the week, one that cannot be read, a revocation of nothing: none is recorded.
 for(const [said,why] of [[{offerId:'not-this-weeks',response:'ACCEPT'},'NO_SUCH_OFFER_THIS_WEEK'],[{offerId:'',response:'ACCEPT'},'RESPONSE_UNREADABLE'],[{response:'ACCEPT'},'RESPONSE_UNREADABLE'],['ACCEPT','RESPONSE_UNREADABLE'],[{offerId:'x',response:'MAYBE'},'RESPONSE_UNREADABLE'],[{offerId:'x',response:'REVOKE'},'NO_REVISION_IN_FORCE']]){
  const r=thresholds({through:9,answer:w=>w===9?said:null}).looks[9];assert.deepEqual([r.paceRevision.response.recorded,r.paceRevision.response.reason,r.paceRevisionRecord,r.paceRevision.status],[false,why,[],'OFFERED'],JSON.stringify(said));
 }
 // A row of the record nobody can read is no acceptance: it is named, and the band is the calibration's.
 const base9=thresholds({through:9}),offer=base9.looks[9].paceRevision.offer,forged={fact:PACE_REVISION_RESPONSE,eventId:`pace-revision|${base9.t.p.id}|${offer.offerId}|ACCEPT`,athleteId:base9.t.p.athleteId,recordedAt:'2027-03-09T12:00:00.000Z',response:{offerId:offer.offerId,planId:base9.t.p.id,response:'ACCEPT'},inputHash:'0'.repeat(64)};
 base9.t.rev=[forged];base9.t.week(9,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:268,actual:{measurement:'TRACK'}}:{pace:345,rpe:4});const after=base9.t.look(10).paceRevision;
 assert.deepEqual([after.status==='ACTIVE',after.unreadableResponses.length,band(after.effectivePaceBands[THRESHOLD])],[false,1,[310,345]]);
 // The same acceptance sent twice is one row.
 const twice=thresholds({through:9,answer:accept}),again=twice.t.step(9,2,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:twice.looks[9].paceRevisionRecord[0].response.offerId,response:'ACCEPT'}},'09:00');
 assert.equal(again.paceRevisionRecord.length,1);assert.equal(again.paceRevision.status,'ACTIVE');
});

test('LIMIT, open (QRE-RWS-F-01): a fact of comparability the athlete states is lost when a device report states another value of the same field; the session then votes',()=>{
 // The athlete says the session was run in the heat; the watch import of the same run carries its own conditions. The frozen engine's merge
 // keeps one value per field, and report facts keep no condition: the row reads as comparable. This is not closed by phase B, which reads the
 // row the run formats admit. It stays a condition of any integration (disjoint fields by author), or a Founder decision on the Core.
 const heat=of('heat alone',{first:{conditions:['HEAT']}}),lost=of('heat lost',{first:{conditions:['HEAT']},watch:{...GOOD,conditions:['RAIN']}});
 assert.deepEqual(insight(heat.r).excluded.map(x=>x.reason),Array(4).fill('NOT_COMPARABLE'),'the athlete alone: the heat is read, the sessions do not vote');
 for(const id of lost.seen)assert.deepEqual(lost.t.row(id).actual.conditions,['RAIN']);
 assert.equal(insight(lost.r).votes,4,'KNOWN LIMIT: with the device report merged the heat is gone and the four sessions vote');
});
test('LIMIT, open (hard gate E-1 of a real integration): a device re-sync sent as a correction erases the athlete\'s answers from the engine\'s row',()=>{
 // The athlete reports an adverse recovery; the device then corrects its own report of the same run. The frozen engine retires the merged row
 // whole: the row in force no longer holds the athlete's answer. The run formats withhold the row's pace evidence (so no insight or revision
 // reads its pace), but nothing gives the answer back: the 7-day rule of a revision offer reads the engine's record and inherits this.
 // Not met by phase B; it is a hard gate of any integration, as the run formats' closure records.
 const m=of('adverse lost',{watch:GOOD,resync:true,response:{recovery:'ADVERSE'}});
 for(const id of m.seen){const row=m.t.row(id);assert.deepEqual([row.eventId,row.response.recovery,m.r.runSessions[id].execution.paceWithheld],[`dev-${id}-v2`,'UNKNOWN','REPORT_NOT_CARRIED']);}
 assert.equal(insight(m.r).votes,0);
});
