// V1 Run Workout Structure: executions through the composed entry point, week by week. T6 and T17 (distance completes; slower is flagged, never
// failed), T7, I3 and I4 (measured, corrected and declared distances, and what each may never become), T8 (a report is read against the format it
// cites), T10 (no second count), T14 (stops and partials), T15 (the pause of a class, the symptom screen), T20 and I6 (the contract a later Race
// Forecast reads; UNKNOWN is neither done nor failed). Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,DEV,VALUES,ELIG,hash,timeline,atSixteen,sixteen,paced,nativeReport,weekWith,asPrescribed,raceTen,flatSteps,line,live} from './v1rws-helpers.mjs';

const km=run=>run.blocks[0].steps[0].target.metres/1000;
const longOf=(t,w)=>t.runsOf(w,s=>s.role==='LONG')[0];
const exec=(t,id)=>t.runs[id].execution;
/** The long run of week 1 (16 km, estimate about 95 to 99 minutes) reported one way, in the weekly review of week 1. */
function sixteenDone(actual,{minutes=96,km:d=16,measurement='GPS',completed=true}={}){
 const t=atSixteen(),o=nativeReport(t,t.long,{minutes,km:d,measurement,rpe:4,completed,actual});
 t.review1=t.week(1,weekWith(t,1,t.long.id,o));return t;
}
test('T6, T17: 16 km done slower than the estimate is done: flagged above the estimate, the real minutes on record, the next long run sized by it',()=>{
 for(const minutes of [108,116]){
  const t=sixteenDone({},{minutes}),row=t.row(t.long.id),e=exec(t,t.long.id);
  assert.deepEqual([row.partial,row.actual.minutes,row.actual.distanceKm],[false,minutes,16],'complete, with the minutes it really took');
  assert.deepEqual([e.status,e.basis,e.aboveEstimate,e.completed,e.actualMinutes],['DISTANCE','MEASURED',true,true,minutes]);
  assert.equal(t.review1.weekEvidence.rows.find(x=>x.sessionId===t.long.id).status,'COMPLETED');
  // X-1: the pace of that run sizes the next long run; here no distance keeps the dose, so it is by time. The dose itself is the engine's.
  const next=longOf(t,2),run=t.runs[next.id];assert.equal(next.prescription.durationMinutes,100,'the planned minutes are the engine\'s, unchanged');
  assert.deepEqual([run.expression,run.unavailable?.native],['TIME','NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE']);
  // The completion already recorded never changes with what follows.
  t.week(2,weekWith(t,2,null,null));assert.equal(t.row(t.long.id).partial,false);assert.equal(exec(t,t.long.id).status,'DISTANCE');
 }
 const inside=sixteenDone({},{minutes:96});assert.equal(exec(inside,inside.long.id).aboveEstimate,false);assert.equal(km(inside.runs[longOf(inside,2).id]),16,'inside the estimate the next long run is 16 km again');
});
test('T14: a stop at 12 km for fatigue is STOPPED with what was really run, the long run holds, and the next one is 16 km again',()=>{
 const t=sixteenDone({stop:{reason:'FATIGUE',metres:12000}},{minutes:75,km:12,completed:false}),row=t.row(t.long.id),e=exec(t,t.long.id);
 assert.deepEqual([row.partial,row.actual.minutes,row.actual.distanceKm],[true,75,12]);
 assert.deepEqual([e.status,e.stop.reason,e.completed,e.extentKm,e.targetKm,e.steps[0].targetMet,e.steps[0].extentFraction],['STOPPED','FATIGUE',false,12,16,false,0.75]);
 assert.deepEqual(t.state.offers.map(o=>o.kind),['SYSTEMIC_FATIGUE_REVIEW']);assert.equal(t.state.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION');
 const next=longOf(t,2);assert.equal(next.prescription.durationMinutes,100,'the step holds');assert.equal(km(t.runs[next.id]),16);
});
test('T14, R3 C4: a stop for a symptom, or with no stated reason, keeps every run by time until the warning-sign screen is answered after it',()=>{
 for(const stop of [{reason:'SYMPTOM'},{}]){
  const t=sixteenDone({stop},{minutes:60,km:10,completed:false});
  assert.deepEqual([exec(t,t.long.id).status,exec(t,t.long.id).stop.reason],['STOPPED','SYMPTOM']);
  assert.deepEqual([t.state.warningSignScreen.status,t.state.warningSignScreen.sessionIds,t.state.warningSignScreen.decidedByThisExtension],['REQUIRED',[t.long.id],false]);
  for(const s of t.runsOf(2))assert.deepEqual([t.runs[s.id].expression,t.runs[s.id].unavailable.native],['TIME','WARNING_SIGN_SCREEN_REQUIRED']);
  // The same evening, the same screen: still required. A screen answered on a later day, every item no: the distance returns.
  t.step(1,6,'WEEKLY_REVIEW',{},'21:00');assert.equal(t.state.warningSignScreen.status,'REQUIRED');
  t.step(2,0,'WEEKLY_REVIEW');assert.equal(t.state.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION');assert.ok(t.runsOf(2).some(s=>t.runs[s.id].expression==='NATIVE'));
 }
 // Any yes on the screen is the engine's clinical route, and under it nothing native is given.
 const c=sixteenDone({stop:{reason:'SYMPTOM'}},{minutes:60,km:10,completed:false});const r=c.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(c.day(2,0),{pain:true})});
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');for(const s of c.runsOf(2))assert.equal(c.runs[s.id].unavailable.native,'CLINICAL_ROUTE');
});
test('T7, T20: the evidence of the distance through the engine: a short reading is partial and asks, a correction with a listed reason completes, the measured value never changes',()=>{
 const short=sixteenDone({gpsQuality:'OK'},{km:15.52}),row=short.row(short.long.id),e=exec(short,short.long.id);
 assert.deepEqual([row.partial,e.status,e.basis,e.ask,e.extentKm,e.countsForPause],[true,'PARTIAL',null,'STOP_REASON_OR_CORRECTION_OR_RAN_LESS',15.52,false]);
 assert.deepEqual(short.state.asks.map(a=>[a.sessionId,a.status,a.blocking]),[[short.long.id,'PARTIAL',false]]);
 // The athlete answers the next day: the measurement failed (signal loss) and the distance was run. A correction row, never an edit.
 const fix={...nativeReport(short,short.long,{minutes:96,km:15.52,rpe:4,eventId:'rw-fix',actual:{gpsQuality:'OK',declared:{distanceKm:16,reason:'SIGNAL_LOSS',confirmedAt:short.day(2,0)}}}),correctionOf:row.eventId,correctedAt:`${short.day(2,0)}T09:00:00-03:00`};
 short.step(2,0,'WEEKLY_REVIEW',{observations:[fix]});const now=short.row(short.long.id),old=short.ledger.find(o=>o.eventId===row.eventId);
 assert.deepEqual([now.eventId,now.partial,now.actual.distanceKm,now.actual.gpsQuality,'deviceGpsQuality' in now.actual,now.actual.declared.distanceKm],['rw-fix',false,15.52,'OK',false,16],'the measurement and its quality stay as the device reported them');
 assert.equal(exec(short,short.long.id).reliability,'POOR','POOR by the athlete\'s reason (WE3A-02), read from the facts of the row');
 assert.deepEqual([old.superseded,old.actual.distanceKm,old.actual.gpsQuality],[true,15.52,'OK'],'the corrected row stays, with the value first measured');
 assert.deepEqual([exec(short,short.long.id).status,exec(short,short.long.id).basis,exec(short,short.long.id).paceEvidence,exec(short,short.long.id).extentKm],['DISTANCE','CONFIRMED_CORRECTION',false,15.52],'history keeps the smaller distance');
 // A declaration with no listed reason against a usable measurement is a conflict: neither done nor failed.
 const conflict=sixteenDone({gpsQuality:'OK',declared:{distanceKm:16}},{km:15.52});
 assert.deepEqual([conflict.row(conflict.long.id).partial,exec(conflict,conflict.long.id).status,exec(conflict,conflict.long.id).flag],[true,'UNKNOWN','MEASUREMENT_CONFLICT']);
 // More than nine per cent short cannot be bridged by a word; the missing part measured can.
 const far=sixteenDone({gpsQuality:'OK',declared:{distanceKm:16,reason:'DEVICE_RESTART'}},{km:14});assert.deepEqual([exec(far,far.long.id).status,exec(far,far.long.id).ask],['UNKNOWN','MEASURE_THE_MISSING_PART']);
 const second=sixteenDone({segments:[{distanceKm:2.1,measurement:'GPS',reason:'DEVICE_RESTART'}]},{km:14});
 assert.deepEqual([exec(second,second.long.id).status,exec(second,second.long.id).basis,exec(second,second.long.id).measuredKm,second.row(second.long.id).actual.distanceKm],['DISTANCE','MEASURED',16.1,14]);
});
test('I3, H8: 16 km declared with no device is done for adherence, at the lowest tier, and is never pace evidence, a record or an improvement',()=>{
 const t=atSixteen(),before=t.cal,o=nativeReport(t,t.long,{minutes:96,rpe:4,actual:{declared:{distanceKm:16}}});
 const r=t.week(1,weekWith(t,1,t.long.id,o)),row=t.row(t.long.id),e=exec(t,t.long.id);
 assert.deepEqual([row.partial,row.actual.distanceKm,e.status,e.basis,e.tier,e.completed,e.paceEvidence,e.measuredKm,e.declaredKm],[false,undefined,'DISTANCE','DECLARED','DECLARED',true,false,null,16]);
 // The same week with the long run by time gives the same calibration: capacity, bands, estimates, results (the declaration moved nothing).
 const time=atSixteen();const rt=time.week(1,weekWith(time,1,time.long.id,paced(time.long)));
 for(const k of ['capacity','paceBands','estimates','actualResults','historicalBest','projection'])assert.equal(hash(r.runCalibration[k]),hash(rt.runCalibration[k]),k);
 assert.equal(hash(r.runCalibration.nextWeek.paceBands),hash(rt.runCalibration.nextWeek.paceBands));assert.ok(before.capacity.status==='CALIBRATED');
});
test('I3, I4, SC-3: of three easy runs by distance, only the measured one is an easy-pace observation; a declared and a corrected one never are',()=>{
 const count=t=>t.cal.nextWeek?.paceBands?.EASY&&t.cal.assessment.progress.easyRuns.count;
 const run=kinds=>{const t=atSixteen(),easy=t.runsOf(1,s=>s.role==='EASY');
  const how=s=>{const i=easy.indexOf(s),k=kinds[i],run=t.runs[s.id],d=run?.expression==='NATIVE'?km(run):null;if(i<0||!d)return asPrescribed(t,s);
   return k==='MEASURED'?nativeReport(t,s,{minutes:62,km:d,rpe:4}):k==='DECLARED'?nativeReport(t,s,{minutes:62,rpe:4,actual:{declared:{distanceKm:d}}}):nativeReport(t,s,{minutes:62,km:d-0.4,rpe:4,actual:{gpsQuality:'OK',declared:{distanceKm:d,reason:'AUTO_PAUSE'}}});};
  t.week(1,how);t.week(2,weekWith(t,2,null,null));return {t,easy};};
 const all=run(['MEASURED','MEASURED','MEASURED']),mixed=run(['MEASURED','DECLARED','CORRECTED']);
 for(const [i,basis] of [['0','MEASURED'],['1','DECLARED'],['2','CONFIRMED_CORRECTION']]){const s=mixed.easy[Number(i)],e=exec(mixed.t,s.id);assert.deepEqual([e.status,e.basis,e.completed,e.paceEvidence],['DISTANCE',basis,true,basis==='MEASURED'],s.id);}
 // V1RC reads the easy runs of the last 28 days: every measured one is there, the declared and the corrected one are not (its own rules, unchanged).
 // What V1RC is handed is the record as admitted: the corrected run's distance is withheld there, and its row in the record is untouched.
 const handed=t=>F.admitted(t.ledger,{athleteId:t.p.athleteId},VALUES).ledger;
 const obs=t=>t.cal.paceBands.EASY.sessions?.length??null,used=t=>new Set(handed(t).filter(o=>!o.fact&&!o.superseded&&o.context?.family==='EASY'&&o.partial!==true&&o.actual.rpe<=4&&Number.isFinite(o.actual.distanceKm)&&o.actual.gpsQuality!=='POOR').map(o=>o.sessionId));
 assert.deepEqual(mixed.t.state.paceEvidenceWithheld.map(x=>[x.sessionId,x.reason]),[[mixed.easy[2].id,'CORRECTED_MEASUREMENT']]);assert.deepEqual(all.t.state.paceEvidenceWithheld,[]);
 assert.ok(mixed.t.row(mixed.easy[2].id).actual.distanceKm>0&&mixed.t.row(mixed.easy[2].id).actual.gpsQuality==='OK');
 assert.equal(used(all.t).has(all.easy[1].id)&&used(all.t).has(all.easy[2].id),true);assert.equal(used(mixed.t).has(mixed.easy[1].id)||used(mixed.t).has(mixed.easy[2].id),false);
 assert.ok(count(all.t)>=count(mixed.t));assert.equal(obs(all.t),obs(mixed.t),'the band shown is derived either way');
});
test('I6, T20: with no measurement and no declaration the run is UNKNOWN: not done, not failed, not pace evidence; a later declaration reclassifies it',()=>{
 const t=atSixteen(),o=nativeReport(t,t.long,{minutes:96,rpe:4});t.week(1,weekWith(t,1,t.long.id,o));
 const row=t.row(t.long.id),e=exec(t,t.long.id);
 assert.deepEqual([row.partial,e.status,e.completed,e.paceEvidence,e.extentKm,e.ask,e.countsForPause],[true,'UNKNOWN',false,false,null,'CONFIRM_OR_MEASURE',false],'no distance and no minutes are turned into a completion');
 assert.equal(row.response.recovery,'COMPATIBLE');assert.equal(t.state.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION','never read as a symptom');
 const fix={...nativeReport(t,t.long,{minutes:96,rpe:4,eventId:'rw-said',actual:{declared:{distanceKm:16}}}),correctionOf:row.eventId,correctedAt:`${t.day(2,1)}T09:00:00-03:00`};
 t.step(2,1,'WEEKLY_REVIEW',{observations:[fix]});assert.deepEqual([t.row(t.long.id).partial,exec(t,t.long.id).status,exec(t,t.long.id).basis],[false,'DISTANCE','DECLARED']);
});
test('T8, I4: a report is read against the format it cites; the format of a week is fixed once delivered; a late correction changes no format on record',()=>{
 const t=atSixteen(),provisional=t.runs[t.long.id];assert.equal(provisional.provisional,true);
 const monday=t.step(1,0,'WEEKLY_REVIEW'),settled=t.runs[t.long.id];
 assert.deepEqual([settled.provisional,settled.formatHash],[false,provisional.formatHash]);assert.ok(t.fmt.some(r=>r.sessionId===t.long.id&&r.settled===true));
 // Mid-week reports of the week's easy runs, much slower than usual: the long run of this week is the one already delivered.
 const easy=t.runsOf(1,s=>s.role==='EASY');t.step(1,3,'WEEKLY_REVIEW',{observations:easy.slice(0,2).map(s=>nativeReport(t,s,{minutes:75,km:km(t.runs[s.id]),rpe:4}))});
 assert.equal(t.runs[t.long.id].formatHash,settled.formatHash,'fixed for its week');
 // The 16 km is run against the format cited. Next week the sizing has moved; this week's report still resolves, and reads DISTANCE.
 t.week(1,s=>s.id===t.long.id?nativeReport(t,s,{minutes:96,km:16,rpe:4}):easy.slice(0,2).includes(s)?nativeReport(t,s,{minutes:75,km:km(t.runs[s.id]),rpe:4}):asPrescribed(t,s));
 assert.equal(exec(t,t.long.id).status,'DISTANCE');const rows=hash(t.fmt.filter(r=>r.week<=1)),state=F.historicalStateOf(t.p,{asOf:t.review(2,0,'WEEKLY_REVIEW').asOf,actualLedger:t.ledger,runFormatRecord:t.fmt},DEV).state.run;
 // A late correction of one of those easy runs (its effort, not its completion): the formats of week 1 are byte-identical, every execution of
 // week 1 reads as it did, and the state of the week is the same.
 const old=t.row(easy[0].id),fix={...nativeReport(t,easy[0],{minutes:75,km:km(t.runs[easy[0].id]),rpe:3,eventId:'rw-late'}),correctionOf:old.eventId,correctedAt:`${t.day(2,2)}T09:00:00-03:00`};
 const before=Object.fromEntries(t.runsOf(1).map(s=>[s.id,[exec(t,s.id).status,exec(t,s.id).formatHash]]));
 t.step(2,2,'WEEKLY_REVIEW',{observations:[fix]});
 assert.equal(hash(t.fmt.filter(r=>r.week<=1)),rows,'append-only');for(const s of t.runsOf(1))assert.deepEqual([exec(t,s.id).status,exec(t,s.id).formatHash],before[s.id],s.id);
 assert.deepEqual(F.historicalStateOf(t.p,{asOf:t.review(2,0,'WEEKLY_REVIEW').asOf,actualLedger:t.ledger,runFormatRecord:t.fmt},DEV).state.run,state);assert.ok(monday.status!=='HOLD');
});
test('T15: two easy runs by distance in a row above their estimate put easy runs by time for 28 days; long runs keep their distance',()=>{
 const t=atSixteen(),easy=t.runsOf(1,s=>s.role==='EASY'),slow=s=>nativeReport(t,s,{minutes:Math.ceil(1.015*t.runs[s.id].estimate.durationMinutes.high)+2,km:km(t.runs[s.id]),rpe:4});
 t.week(1,s=>easy.slice(0,2).includes(s)?slow(s):asPrescribed(t,s));
 for(const s of easy.slice(0,2))assert.deepEqual([exec(t,s.id).status,exec(t,s.id).aboveEstimate,t.row(s.id).partial],['DISTANCE',true,false],'done, and flagged');
 const until=t.state.pausedContinuous.EASY;assert.equal(until,new Date(Date.parse(easy[1].date+'T00:00:00Z')+28*864e5).toISOString().slice(0,10));
 for(const s of t.runsOf(2,x=>x.role==='EASY'))assert.deepEqual([t.runs[s.id].expression,t.runs[s.id].unavailable.native],['TIME','CONTINUOUS_FORMAT_PAUSED']);
 assert.equal(t.state.pausedContinuous.LONG,undefined);assert.notEqual(t.runs[longOf(t,2).id].unavailable?.native,'CONTINUOUS_FORMAT_PAUSED','long runs are not paused by easy runs');
});
test('T14, R2 N10: repetitions not all done are PARTIAL, the engine holds the step, and the next session at that step is even repetitions',()=>{
 const plan=()=>{const t=timeline(sixteen());for(let w=0;w<5;w++)t.week(w,weekWith(t,w,null,null));return t;};
 const t=plan(),q=t.runsOf(5,s=>s.role==='QUALITY')[0],run=t.runs[q.id];assert.deepEqual([q.prescription.work.repetitions,run.pattern],[4,'EVEN_REPEATS_DISTANCE_RECOVERY'],'week 5 is the second of four entries that pass at this step: the rotation is in effect');
 const r=t.week(5,weekWith(t,5,q.id,nativeReport(t,q,{met:x=>x.rep<3})));
 assert.deepEqual([t.row(q.id).partial,exec(t,q.id).status,exec(t,q.id).steps.map(s=>s.targetMet),r.gates.QUALITY],[true,'PARTIAL',[true,true,true,false],'HOLD']);
 const again=t.runsOf(6,s=>s.role==='QUALITY')[0];assert.deepEqual(again.prescription.work,q.prescription.work,'the engine holds the step');assert.equal(t.runs[again.id].pattern,'EVEN_REPEATS','week 6 would be the third entry (mixed): after a partial session it is the first');
 const done=plan(),q2=done.runsOf(5,s=>s.role==='QUALITY')[0];done.week(5,weekWith(done,5,q2.id,nativeReport(done,q2,{})));
 const next=done.runsOf(6,s=>s.role==='QUALITY')[0];assert.deepEqual([done.row(q2.id).partial,exec(done,q2.id).status,exec(done,q2.id).basis],[false,'DISTANCE','LAP']);
 assert.equal(next.prescription.work.repetitions,5,'done, the step moves: '+line(done.runs[next.id]));
});
test('R2 N9, N3: a 10 km race plan through taper and race week: even repetitions in the taper, the touch that fits no distance by time, nothing native after the race',()=>{
 const t=timeline(raceTen()),kinds=new Set();
 for(let w=0;w<11;w++){t.week(w,weekWith(t,w,null,null));for(const s of t.runsOf(Math.min(w+1,11)))kinds.add(t.p.weeks[s.weekIndex].phase+':'+s.role+':'+t.runs[s.id].expression+':'+t.runs[s.id].pattern+(t.runs[s.id].unavailable?':'+t.runs[s.id].unavailable.native:''));}
 const has=p=>[...kinds].some(k=>k.startsWith(p));
 assert.ok(has('TAPER:QUALITY:NATIVE:EVEN_REPEATS'),[...kinds].join(' '));assert.ok(has('RACE_WEEK:RACE_TOUCH:NATIVE:EVEN_REPEATS')||has('RACE_WEEK:RACE_TOUCH:TIME:TIME:NO_FORMAT_WITHIN_ENVELOPE'),'the touch: even repetitions or time');assert.ok(has('RACE_WEEK:RACE:TIME:TIME:NOT_A_NATIVE_FAMILY'));assert.ok(has('POST_EVENT:RECOVERY_EASY:TIME:TIME:NOT_A_NATIVE_FAMILY'));
 assert.ok(![...kinds].some(k=>/^(TAPER|RACE_WEEK):(QUALITY|RACE_TOUCH):NATIVE:(MIXED|PYRAMID|PROGRESSIVE_REPEATS|EVEN_REPEATS_DISTANCE_RECOVERY)/.test(k)),'no other pattern in taper or race week');
 assert.ok(![...kinds].some(k=>/^(ESTABLISHMENT|POST_EVENT):.*:NATIVE/.test(k)));assert.ok(has('SPECIFIC:QUALITY:NATIVE'));assert.ok(![...kinds].some(k=>/^SPECIFIC:QUALITY:NATIVE:PYRAMID/.test(k)));
});
test('T10: nothing of a format enters a decision twice: longer measured distances, other estimates and the time preference leave every plan and gate the same',()=>{
 const plain=sixteenDone({},{minutes:96,km:16}),more=sixteenDone({},{minutes:96,km:17.4});
 assert.equal(hash(plain.p),hash(more.p));assert.deepEqual(plain.review1.gates,more.review1.gates);assert.deepEqual([exec(more,more.long.id).status,exec(more,more.long.id).measuredKm],['DISTANCE',17.4]);
 // The athlete who prefers every run by time gets the same plan, the same decisions and the same record of executions.
 const byTime=timeline(sixteen({runExpression:'TIME'}));assert.equal(hash(byTime.p),hash(timeline(sixteen()).p),'the preference never reaches the engine');
 for(const s of byTime.runsOf(1))assert.equal(byTime.runs[s.id].expression,'TIME');
 byTime.week(0,paced,{runExpression:'TIME'});assert.ok(byTime.runsOf(1).every(s=>byTime.runs[s.id].unavailable.native==='EXPRESSION_PREFERENCE_TIME'||byTime.runs[s.id].unavailable.native==='PHASE_NOT_ELIGIBLE'));
 const native=atSixteen();assert.equal(hash(native.p),hash(byTime.p));assert.equal(hash(native.ledger),hash(byTime.ledger));
 // A native session always carries its time version, and the planned prescription is the engine's own.
 const run=native.runs[native.long.id];assert.equal(run.timeVersion.durationMinutes,100);assert.equal(run.plannedPrescriptionHash,native.long.plannedPrescriptionHash);
 assert.ok(run.instructions.some(x=>/time version/.test(x))&&run.instructions.some(x=>/stop at any time/.test(x))&&!run.instructions.some(x=>/speed up to reach|must|at any cost/i.test(x.replace('do not speed up to reach the distance',''))));
 assert.ok(flatSteps(run.blocks).every(s=>s.effortGoverns===true)&&live(native.long));
});
