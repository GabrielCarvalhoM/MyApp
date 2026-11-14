// V1 Run Workout Structure, phase A fix-forward (Founder mission of 2026-11-14). The two blockers the recheck on d6381bb named, reproduced as their
// judges found them and closed, and the runtime conditions of the closure:
// - QRE-RWS-B-01: one run reported by the app and by a device import is one row of the engine's record. Whatever each report brought, and in
//   whatever order, a run whose distance is not one whole checked measurement never reaches the calibration as pace evidence.
// - SSCTR-RWS-B-01: a stop for a symptom is a safety signal apart from the evidence of execution. A contradiction between sources, a refused
//   report, a merge or a correction never removes it; only the warning-sign screen answered after it does.
// - QRE-RWS-B-02 (no pace, measurement or history without a duration), SSCTR-RWS-B-02 (the engine asks for the eligibility: by time),
//   QRE-RWS-B-05 (the three tests that passed for the wrong reason, now through the entry point).
// Every scenario is a conforming client of the composed entry point (the timeline of v1rws-helpers.mjs). Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,X,DEV,FORMATS_OFF,VALUES,ELIG,hash,report,timeline,atSixteen,sixteen,paced,nativeReport,weekWith,asPrescribed,live,raceTen,session,input,select,flatSteps} from './v1rws-helpers.mjs';
import {runCalibrationOf as frozenCalibration} from '../src/v1-run-calibration.mjs';
import {readCompletion,executionOf,readReportFacts,reportsVerdict,reportFactOf,appendReportFacts,RUN_REPORT_RECEIVED,RUN_FORMAT_EMITTED} from '../src/v1-run-format.mjs';
import {distanceFacts,historyReference,factsFromIntake,runHistory,latestClassRun,PACE_WITHHELD} from '../src/v1-run-history.mjs';
import {utcTimestamp} from '../src/r6-provenance.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
/** A device import of a session (Apple Health): its own event, bound to the session, a whole recording. */
const device=(t,s,actual,id='hk-'+s.id)=>({eventId:'dev-'+id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:id,source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},actual,response:UNKNOWN});
/** The other sessions of week w, each reported as prescribed. */
const others=(t,w,id)=>t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==id).map(s=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});});
const edges=cal=>Object.fromEntries(Object.entries(cal.paceBands).map(([k,b])=>[k,[b.status,b.fastSecondsPerKm??null,b.slowSecondsPerKm??null]]));
const withheld=r=>r.runFormat.paceEvidenceWithheld.map(x=>[x.sessionId,x.reason]);
const isReport=r=>r.fact===RUN_REPORT_RECEIVED;
const ahead=r=>Object.values(r.runSessions).filter(s=>!s.past);
/** The three orders two reports of one run can come in. `review(observations,time)` is one review of the day. */
const ORDERS={
 'one review':(review,a,b)=>review([a,b]),
 'the app, then the import':(review,a,b)=>{review([a],'18:00');review([b],'21:00');},
 'the import, then the app':(review,a,b)=>{review([b],'18:00');review([a],'21:00');}};

// ---------- QRE-RWS-B-01 ----------
/**
 * The athlete of the judge's probe: week 3 holds a native easy run of `km` kilometres (11 km, about 63 minutes). `send(x)` reports that run with
 * `x.review` (the rest of the week goes with the first review); week 4 is then reviewed as prescribed. `after` is that review: the calibration of
 * the week that follows. `frozen` is the frozen calibration over the same record, bare: what v1-run-index.mjs alone would show.
 */
function easyWeek(send){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],km=run.blocks[0].steps[0].target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 const x={t,easy,run,km,min,first:Math.round(km*0.6*100)/100,second:Math.round(km*0.4*100)/100};let rest=others(t,3,easy.id);
 x.review=(observations,time='20:00')=>{const r=t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,...observations]},time);rest=[];return r;};
 send(x);x.reported=t.results.at(-1);x.row=t.row(easy.id);x.exec=x.reported.runSessions[easy.id].execution;
 const asOf=`${t.day(4,6)}T20:00:00-03:00`;x.after=t.week(4,weekWith(t,4,null,null));
 x.frozen=frozenCalibration({program:t.p,ledger:x.after.actualLedger,evidenceRecord:x.after.runEvidenceRecord,asOf:utcTimestamp(asOf),weekIndex:4,hold:false,engineStatus:x.after.status,eligibility:ELIG(t.day(4,6))},DEV);
 return x;
}
/** The app's report of that run: `cite` is the format it cites (the native one, its time version, or none). */
const app=(x,cite,actual={})=>{const o={...nativeReport(x.t,x.easy,{minutes:x.min,rpe:3,actual}),eventId:'app-easy'};if(cite==='TIME')o.actual.formatHash=x.run.timeFormatHash;if(cite==='NONE'){delete o.actual.formatHash;delete o.actual.steps;}return o;};
const firstFile=(x,actual={})=>device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',...actual});
/** The control: the same run measured whole, in one file. And the input already accepted: both files in one report. */
const oneFile=()=>easyWeek(x=>x.review([app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'})]));
const twoFilesOneReport=cite=>easyWeek(x=>x.review([app(x,cite,{distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:[{distanceKm:x.second,measurement:'GPS'}]})]));

test('QRE-RWS-B-01 reproduced and closed: a run split between the app (the second file) and Apple Health (the first) never moves the easy band, in the three orders and the three expressions',()=>{
 const one=oneFile();
 assert.deepEqual([one.km,one.min,one.first,one.second],[11,63,6.6,4.4],'the judge\'s run: 11 km in about 63 minutes, files of 6.6 and 4.4 km');
 assert.deepEqual(edges(one.after.runCalibration).EASY,['AVAILABLE',345,420]);assert.deepEqual(withheld(one.after),[]);
 assert.equal(one.after.runCalibration.hash,one.frozen.hash,'with nothing withheld the calibration is the frozen one over the same record, byte for byte');
 for(const cite of ['TIME','NATIVE','NONE']){
  const accepted=twoFilesOneReport(cite);
  for(const [name,order] of Object.entries(ORDERS)){
   const m=easyWeek(x=>order(x.review,app(x,cite,{segments:[{distanceKm:x.second,measurement:'GPS'}]}),firstFile(x))),id=`${cite}; ${name}`;
   // The record: the one merged row as the engine made it, the first file's distance over the whole minutes, nothing of it rewritten.
   assert.deepEqual([m.row.actual.distanceKm,m.row.actual.minutes,m.row.actual.gpsQuality,m.row.actual.segments.length,[...m.row.provenance.mergedSourceIds].sort(),'deviceGpsQuality' in m.row.actual],[6.6,63,'OK',1,['app-easy','dev-hk-'+m.easy.id],false],id);
   // The defect, still there for a reader of the bare record: 6.6 km over 63 minutes is 573 s/km, and the frozen calibration widens the band.
   assert.deepEqual(edges(m.frozen).EASY,['AVAILABLE',345,575],id+': the bare record moves the frozen calibration (the finding)');
   // Closed: the calibration is handed the record as admitted.
   assert.deepEqual(edges(m.after.runCalibration),edges(one.after.runCalibration),id+': every band has the edges of the control in one file');
   assert.deepEqual(withheld(m.after),[[m.easy.id,'SEVERAL_RECORDINGS']],id);
   assert.equal(m.after.runCalibration.hash,accepted.after.runCalibration.hash,id+': the calibration is the one of the same two files sent in one report');
   assert.notEqual(m.after.runCalibration.hash,m.frozen.hash,id+': and not the one the bare record gives');
   // The execution reads the same as the accepted input does: the two files together are the run (R3A WE3A-10), never pace evidence.
   assert.deepEqual([m.exec.status,m.exec.basis,m.exec.paceEvidence,m.exec.reliability,m.exec.paceWithheld,m.row.partial],[accepted.exec.status,accepted.exec.basis,accepted.exec.paceEvidence,accepted.exec.reliability,accepted.exec.paceWithheld,accepted.row.partial],id);
   if(cite==='NATIVE')assert.deepEqual([m.exec.status,m.exec.basis,m.exec.paceEvidence,m.exec.measuredKm,m.exec.reliability,m.row.partial],['DISTANCE','MEASURED',false,11,'POOR',false],id);
   else assert.deepEqual([m.exec.status,m.exec.paceEvidence,m.exec.paceWithheld,m.row.partial],['TIME',null,'SEVERAL_RECORDINGS',false],id);
  }
 }
});

test('QRE-RWS-B-01: a duplicate, a late correction and a later re-reading leave the calibration where the facts of the run put it',()=>{
 const one=oneFile(),segments=x=>[{distanceKm:x.second,measurement:'GPS'}],at=(x,time)=>`${x.t.day(3,6)}T${time}:00-03:00`;
 // Duplicate: both reports sent again. Nothing changes, and the record of report facts holds each report once.
 const dup=easyWeek(x=>{const a=app(x,'TIME',{segments:segments(x)}),d=firstFile(x);x.review([a],'18:00');x.review([d],'19:00');const before=x.t.fmt.filter(isReport).length;
  const again=x.review([a,d],'21:00');x.replay=[again.provenance.duplicates.map(y=>y.reason).sort(),x.t.fmt.filter(isReport).length-before];});
 assert.deepEqual(dup.replay,[['EXACT_REPLAY','EXACT_REPLAY'],0]);assert.deepEqual([edges(dup.after.runCalibration),withheld(dup.after)],[edges(one.after.runCalibration),[[dup.easy.id,'SEVERAL_RECORDINGS']]]);
 // Late correction: the first file alone was a short run; the correction adds the second file. The same row, read by its facts.
 const late=easyWeek(x=>{const o=app(x,'NATIVE',{distanceKm:x.first,measurement:'GPS',gpsQuality:'OK'});x.review([o],'18:00');x.before=[x.t.row(x.easy.id).partial,x.t.results.at(-1).runSessions[x.easy.id].execution.status];
  x.review([{...o,eventId:'corr-easy',correctionOf:o.eventId,correctedAt:at(x,'20:30'),actual:{...o.actual,segments:segments(x)}}],'21:00');});
 assert.deepEqual([late.before,late.exec.status,late.exec.basis,late.exec.paceEvidence,late.row.partial,late.row.actual.gpsQuality],[[true,'PARTIAL'],'DISTANCE','MEASURED',false,false,'OK']);
 assert.deepEqual([edges(late.after.runCalibration),withheld(late.after)],[edges(one.after.runCalibration),[[late.easy.id,'SEVERAL_RECORDINGS']]]);
 // Late correction of the merged row to one whole measurement: the run is pace evidence again, as the control is.
 const whole=easyWeek(x=>{x.review([app(x,'NATIVE',{segments:segments(x)})],'18:00');x.review([firstFile(x)],'19:00');x.merged=withheld(x.t.results.at(-1));
  x.review([{...app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'}),eventId:'corr-easy',correctionOf:'app-easy',correctedAt:at(x,'20:30')}],'21:00');});
 assert.deepEqual([whole.merged,withheld(whole.after),whole.exec.paceEvidence,whole.exec.paceWithheld,whole.row.eventId],[[[whole.easy.id,'SEVERAL_RECORDINGS']],[],true,null,'corr-easy']);
 assert.deepEqual(edges(whole.after.runCalibration),edges(one.after.runCalibration));assert.equal(whole.after.runCalibration.hash,whole.frozen.hash);
 // A later re-reading of the whole record (two more weeks, and the same record through JSON as a store would hold it): still the control's edges.
 const m=easyWeek(x=>ORDERS['the import, then the app'](x.review,app(x,'TIME',{segments:segments(x)}),firstFile(x))),stored=JSON.parse(JSON.stringify({ledger:m.t.ledger,fmt:m.t.fmt,ev:m.t.ev,hist:m.t.hist,ref:m.t.ref,p:m.t.p}));
 Object.assign(m.t,stored);const five=m.t.week(5,weekWith(m.t,5,null,null)),control5=one.t.week(5,weekWith(one.t,5,null,null));
 assert.deepEqual([edges(five.runCalibration),withheld(five)],[edges(control5.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']]]);
 // No stored row is rewritten by a later review: every row the record held comes back byte for byte (the custody's own rule on the engine's rows).
 const before=new Map(m.t.ledger.map(o=>[o.fact?`f:${o.fact}:${o.eventId}`:`o:${o.eventId}`,hash(o)])),six=m.t.week(6,weekWith(m.t,6,null,null));
 for(const o of six.actualLedger){const k=o.fact?`f:${o.fact}:${o.eventId}`:`o:${o.eventId}`;if(before.has(k))assert.equal(hash(o),before.get(k),k);}
 assert.ok(before.size>20&&[...before.keys()].every(k=>six.actualLedger.some(o=>(o.fact?`f:${o.fact}:${o.eventId}`:`o:${o.eventId}`)===k)));
});

test('QRE-RWS-B-01: a distance another source disputes, or one with no duration of its own, is never pace evidence, whichever value the record kept',()=>{
 const one=oneFile();
 const cases=[
  // The athlete types the whole distance in the app (kept beside as their own figure); the import measured only the first file.
  ['the athlete\'s typed figure against the import','DISTANCE_DISPUTED',x=>app(x,'TIME',{distanceKm:x.km}),x=>firstFile(x)],
  // The athlete declares the whole distance with no listed reason; the import measured only the first file.
  ['a declaration with no reason against the import','DISTANCE_DISPUTED',x=>app(x,'TIME',{declared:{distanceKm:x.km}}),x=>firstFile(x)],
  // The phone measured the whole run; the watch import holds only the first file. The engine keeps the better-ranked source: the watch.
  ['the phone\'s measurement against the watch\'s','DISTANCE_DISPUTED',x=>app(x,'TIME',{distanceKm:x.km,measurement:'GPS'}),x=>firstFile(x)],
  // Two device activities of one session: the engine keeps the smaller distance.
  ['two device recordings','DISTANCE_DISPUTED',x=>({...device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:x.km,measurement:'GPS',rpe:3},'hk-b'),eventId:'app-easy'}),x=>firstFile(x)],
  // The import carries a distance and no duration: the minutes of the row are the app's, so its pace is of no single recording.
  ['an import with no duration','DURATION_REQUIRED',x=>app(x,'TIME',{}),x=>{const d=firstFile(x);delete d.actual.minutes;return d;}],
 ];
 for(const [what,reason,a,b] of cases)for(const [name,order] of Object.entries(ORDERS)){
  const m=easyWeek(x=>order(x.review,a(x),b(x))),id=`${what}; ${name}`;
  assert.deepEqual([m.row.actual.distanceKm,m.row.partial,m.row.conflicted===true],[6.6,false,false],id+': the record holds the first file\'s distance, whole minutes, one row');
  assert.deepEqual(edges(m.frozen).EASY,['AVAILABLE',345,575],id+': the bare record would move the frozen calibration');
  assert.deepEqual([edges(m.after.runCalibration),withheld(m.after)],[edges(one.after.runCalibration),[[m.easy.id,reason]]],id);
  assert.deepEqual([m.exec.paceWithheld,m.exec.paceEvidence===true],[reason,false],id);
 }
 // The watch measured the whole run and the phone only a part of it: the engine keeps the watch's distance, and the run is complete by it; the
 // dispute between the two still keeps it out of every pace reader.
 for(const [name,order] of Object.entries(ORDERS)){
  const m=easyWeek(x=>order(x.review,app(x,'NATIVE',{distanceKm:x.first,measurement:'GPS'}),device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'})));
  assert.deepEqual([m.row.actual.distanceKm,m.exec.status,m.exec.basis,m.exec.paceEvidence,m.exec.paceWithheld,m.row.partial,withheld(m.after)],[11,'DISTANCE','MEASURED',false,'DISTANCE_DISPUTED',false,[[m.easy.id,'DISTANCE_DISPUTED']]],name);
  assert.deepEqual(edges(m.after.runCalibration),edges(one.after.runCalibration),name);
 }
 // The athlete's own figure disputes the measurement in either direction, beyond the tolerance only; a disputed run never sizes a later one.
 const own=a=>distanceFacts({completed:true,minutes:60,measurement:'GPS',...a},VALUES);
 assert.deepEqual([own({distanceKm:11,manualDistanceKm:6}).paceWithheld,own({distanceKm:6,manualDistanceKm:11}).paceWithheld,own({distanceKm:10,manualDistanceKm:9.1}).paceWithheld,own({distanceKm:10,declared:{distanceKm:9}}).paceWithheld,own({distanceKm:10,declared:{distanceKm:9.2}}).paceWithheld,own({manualDistanceKm:9}).paceWithheld],
  ['DISTANCE_DISPUTED','DISTANCE_DISPUTED',null,'DISTANCE_DISPUTED',null,null]);
 // The source's own flag is still what it was: a measurement the device flagged is POOR, and repetitions run under it are never pace evidence.
 assert.deepEqual([own({distanceKm:10,gpsQuality:'POOR'}).quality,own({distanceKm:10,gpsQuality:'POOR'}).markedPoor,own({distanceKm:10,gpsQuality:'OK'}).quality,own({distanceKm:10}).quality,own({distanceKm:10,gpsQuality:'POOR'}).paceWithheld],['POOR',true,'OK','UNKNOWN',null]);
 const reps=select(input({s:session({family:'THRESHOLD',step:{repetitions:5,workMinutes:5,recoveryMinutes:2},ladderStep:2}),fast:290,slow:300,weekIndex:0})),laps=flatSteps(reps.blocks).filter(s=>s.kind==='WORK').map(s=>({block:s.block,rep:s.rep,kind:'WORK',targetMet:true}));
 const lapped=actual=>executionOf({eventId:'e',partial:false,provenance:{sourceQuality:'MANUAL'},actual:{completed:true,minutes:45,measurement:'GPS',steps:laps,...actual}},reps,VALUES,{boutMinutes:5});
 assert.deepEqual([lapped({}).basis,lapped({}).paceEvidence,lapped({gpsQuality:'POOR'}).paceEvidence,lapped({gpsQuality:'POOR'}).reliability,lapped({measurement:'TREADMILL'}).paceEvidence],['LAP',true,false,null,false]);
 const sizing=row=>latestClassRun(runHistory({ledger:[row],record:[],athleteId:'a',tz:0},VALUES).runs,{cutoff:'2026-12-08',weekStart:'2026-12-08',family:'EASY'},VALUES);
 const easyRow=actual=>({eventId:'e1',athleteId:'a',sessionId:'s1',localDate:'2026-12-01',partial:false,actual:{completed:true,minutes:60,measurement:'GPS',...actual},provenance:{sourceQuality:'MANUAL',firstRecordedAt:'2026-12-01T20:00:00.000Z'},context:{sport:'RUN',family:'EASY',mode:'EASY',sessionId:'s1'}});
 assert.deepEqual([sizing(easyRow({distanceKm:10}))?.secondsPerKm,sizing(easyRow({distanceKm:10,manualDistanceKm:6})),sizing(easyRow({distanceKm:10,segments:[{distanceKm:1,measurement:'GPS'}]}))],[360,null,null]);
 // Two measurements that agree within what a working device reads (the tied 0.91) are one run: nothing is withheld and the run is observed.
 for(const [name,order] of Object.entries(ORDERS)){
  const m=easyWeek(x=>order(x.review,app(x,'TIME',{distanceKm:x.km,measurement:'GPS'}),device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:10.4,measurement:'GPS',gpsQuality:'OK'})));
  assert.deepEqual([withheld(m.after),m.row.actual.distanceKm,m.exec.paceWithheld],[[],10.4,null],name);assert.equal(m.after.runCalibration.hash,m.frozen.hash,name+': the frozen calibration over the record as it is');
 }
 // The verdict of the reports, by itself: order of the facts, a report of another session, and the edge of the tolerance.
 const fact=(reportId,distanceKm,timed=true,sessionId='s')=>({sessionId,reportId,stop:null,distanceKm,timed}),rec=facts=>readReportFacts(appendReportFacts([],facts,{athleteId:'a',recordedAt:'2026-12-01T10:00:00.000Z'}).record,'a',VALUES);
 const row={eventId:'r1',sessionId:'s',provenance:{mergedSourceIds:['r1','r2']}},verdict=facts=>reportsVerdict(row,rec(facts),VALUES);
 assert.equal(VALUES.tied.correctionFloorFraction,0.91);
 assert.deepEqual([verdict([fact('r1',10),fact('r2',9.1)]),verdict([fact('r1',10),fact('r2',9.09)]),verdict([fact('r2',9.09),fact('r1',10)]),verdict([fact('r1',10),fact('r2',6,false)]),verdict([fact('r1',10),fact('r3',2)]),verdict([fact('r1',10),fact('r2',2,true,'other')]),verdict([fact('r1',10)]),reportsVerdict(row,null,VALUES)],
  [null,'DISTANCE_DISPUTED','DISTANCE_DISPUTED','DURATION_REQUIRED',null,null,null,null]);
 assert.deepEqual([...PACE_WITHHELD],['SEVERAL_RECORDINGS','CORRECTED_MEASUREMENT','DURATION_REQUIRED','DISTANCE_DISPUTED']);
});

test('QRE-RWS-B-01: every reader of pace and capacity reads the admitted record: the sizing source, the exported calibration, a restart, the historical state and a race',()=>{
 const one=oneFile(),m=easyWeek(x=>ORDERS['the import, then the app'](x.review,app(x,'TIME',{segments:[{distanceKm:x.second,measurement:'GPS'}]}),firstFile(x))),t=m.t,asOf=m.after.runFormat.asOf;
 // S3 (the latest run of the class): a run withheld from pace never sizes a later one; the control's does.
 const facts=readReportFacts(t.fmt,t.p.athleteId,VALUES),runs=x=>runHistory({ledger:x.t.ledger,record:x.t.hist,athleteId:x.t.p.athleteId,tz:-180,reportsOf:o=>reportsVerdict(o,readReportFacts(x.t.fmt,x.t.p.athleteId,VALUES),VALUES)},VALUES).runs;
 const week4=t.p.weeks[4].startDate,s3=x=>latestClassRun(runs(x).filter(r=>r.sessionId===x.easy.id),{cutoff:week4,weekStart:week4,family:'EASY'},VALUES);
 assert.deepEqual([s3(one)?.runId,s3(m)],['ledger:'+one.row.eventId,null],'the control\'s run may size a later one; the run in two files never does');
 assert.deepEqual([runs(m).find(r=>r.sessionId===m.easy.id).referenceKm,runs(m).find(r=>r.sessionId===m.easy.id).paceWithheld],[11,'SEVERAL_RECORDINGS'],'as history it is the run it was: the two files summed (R3A)');
 assert.ok(facts.size>0&&facts.unreadable.length===0);
 // The calibration this entry point exports is V1RC's over the admitted record; V1RC's own, over the bare record, is the finding.
 const input={program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf,weekIndex:4,hold:false,engineStatus:m.after.status,eligibility:ELIG(t.day(4,6))};
 assert.equal(F.runCalibrationOf({...input,runFormatRecord:t.fmt},DEV).hash,m.after.runCalibration.hash);assert.equal(frozenCalibration(input,DEV).paceBands.EASY.slowSecondsPerKm,575);
 assert.equal(F.runCalibrationOf(input,FORMATS_OFF).hash,frozenCalibration(input,FORMATS_OFF).hash,'with the boundary off it is V1RC\'s as it is');
 // The same wiring as v1-run-index.mjs: the frozen entry point, given the admitted record as its record, makes the calibration this one returns.
 const handed=F.admitted(t.ledger,{athleteId:t.p.athleteId,facts},VALUES),review=t.review(5,0,'WEEKLY_REVIEW'),mine=F.evaluateProgram(t.p,review,DEV),{runFormatRecord,runHistoryRecord,...plain}=review,theirs=X.evaluateProgram(t.p,{...plain,actualLedger:handed.ledger},FORMATS_OFF);
 assert.deepEqual(handed.withheld,[{sessionId:m.easy.id,eventId:m.row.eventId,reason:'SEVERAL_RECORDINGS'}]);assert.equal(mine.runCalibration.hash,theirs.runCalibration.hash);assert.deepEqual(withheld(mine),[[m.easy.id,'SEVERAL_RECORDINGS']]);
 // And under a clinical route, where the calibration withholds every guidance: the same wiring (the hold is passed on).
 const signed={...review,eligibility:ELIG(t.day(5,0),{pain:true})},{runFormatRecord:_f,runHistoryRecord:_h,...signedPlain}=signed,held=F.evaluateProgram(t.p,signed,DEV),heldTheirs=X.evaluateProgram(t.p,{...signedPlain,actualLedger:handed.ledger},FORMATS_OFF);
 assert.deepEqual([held.status,held.runCalibration.status,withheld(held)],['CLINICAL_HUMAN_REQUIRED','WITHHELD_HOLD',[[m.easy.id,'SEVERAL_RECORDINGS']]]);assert.equal(held.runCalibration.hash,heldTheirs.runCalibration.hash);
 // A new plan from the record: its calibration is made over the admitted record too.
 const fresh=x=>({...sixteen({asOf:x.t.day(5,0),start:x.t.day(5,1)}),athlete:{...sixteen({asOf:x.t.day(5,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}});
 const again=x=>F.restartProgram({intake:fresh(x),record:x.t.ledger,referenceState:x.t.ref,asOf:`${x.t.day(5,0)}T10:00:00-03:00`,athleteId:x.t.p.athleteId,runEvidenceRecord:x.t.ev,runFormatRecord:x.t.fmt,runHistoryRecord:x.t.hist},DEV);
 const r=again(m),c=again(one);assert.deepEqual([r.status,c.status],['PROPOSED','PROPOSED']);assert.deepEqual([edges(r.runCalibration),withheld(r),withheld(c)],[edges(c.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']],[]]);
 // The restart's wiring too: the frozen calibration with v1-run-index.mjs's own arguments, over the admitted record, is the one returned.
 const restarted=ledger=>frozenCalibration({program:r.program,ledger,evidenceRecord:t.ev,asOf:r.program.canonical.asOf,weekIndex:0,engineStatus:r.status,eligibility:fresh(m).athlete.eligibility},DEV);
 assert.equal(r.runCalibration.hash,restarted(handed.ledger).hash);assert.equal(c.runCalibration.hash,frozenCalibration({program:c.program,ledger:one.t.ledger,evidenceRecord:one.t.ev,asOf:c.program.canonical.asOf,weekIndex:0,engineStatus:c.status,eligibility:fresh(one).athlete.eligibility},DEV).hash);
 assert.equal(hash(r.runFormatRecord.slice(0,t.fmt.length)),hash(t.fmt),'the record of formats and report facts is carried whole');
 // The historical state of the record (the engine's reducer through this entry point's reader): the native run in two files is the completed
 // session it is, in the three orders, exactly as the same two files sent in one report.
 const state=x=>{const h=F.historicalStateOf(x.t.p,{asOf:x.after.runFormat.asOf,actualLedger:x.t.ledger,runFormatRecord:x.t.fmt},DEV);return hash({run:h.run,strength:h.strength,state:h.state,week:h.week});};
 const accepted=twoFilesOneReport('NATIVE');
 for(const [name,order] of Object.entries(ORDERS)){const n=easyWeek(x=>order(x.review,app(x,'NATIVE',{segments:[{distanceKm:x.second,measurement:'GPS'}]}),firstFile(x)));assert.equal(state(n),state(accepted),name);assert.equal(n.row.partial,false,name);}
 // A race in two files: its first file over the race's whole time is no race result (the bare record gives the frozen calibration one).
 const p=timeline(raceTen()).p,race=p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),day=race.date;
 const raced=actual=>({eventId:'race-1',athleteId:p.athleteId,sessionId:race.id,localDate:day,observedAt:`${day}T15:00:00.000Z`,partial:false,actual:{completed:true,minutes:50,measurement:'GPS',...actual},response:UNKNOWN,provenance:{sourceQuality:'MANUAL'},context:{sessionId:race.id,sport:'RUN',role:'RACE',family:'RACE',mode:'EASY',weekIndex:race.weekIndex}});
 const results=(ledger,calibrate)=>calibrate({program:p,ledger,evidenceRecord:[],asOf:`${day}T23:00:00.000Z`,weekIndex:race.weekIndex,engineStatus:'KEEP',eligibility:ELIG(day)},DEV).evidence.filter(e=>e.id==='plan-race:race-1').map(e=>e.distanceKm);
 assert.deepEqual([results([raced({distanceKm:10})],frozenCalibration),results([raced({distanceKm:10})],F.runCalibrationOf)],[[10],[10]],'a race measured whole is the result it is');
 assert.deepEqual([results([raced({distanceKm:6,segments:[{distanceKm:4,measurement:'GPS'}]})],frozenCalibration),results([raced({distanceKm:6,segments:[{distanceKm:4,measurement:'GPS'}]})],F.runCalibrationOf)],[[6],[]],'6 km in the race\'s 50 minutes is never read as a result');
});

test('QRE-RWS-B-01: with no race result the easy band is the athlete\'s own observed range, and it too is read from the admitted record',()=>{
 // Each run of some weeks comes in two parts, 60% and 40% of its distance, in one report: the first file's distance over the whole minutes.
 const halves=o=>{const d=o.actual.distanceKm;return {...o,actual:{...o.actual,distanceKm:Math.round(d*0.6*100)/100,gpsQuality:'OK',segments:[{distanceKm:Math.round(d*0.4*100)/100,measurement:'GPS'}]}};};
 const band=c=>[c.paceBands.EASY.status,c.paceBands.EASY.basis??null,c.paceBands.EASY.fastSecondsPerKm??null,c.paceBands.EASY.slowSecondsPerKm??null];
 // (a) An experienced runner with no result: the EASY band is the median of their own easy runs, 5:40 per km in week 0.
 const build=split=>{const t=timeline(sixteen({id:'rw-observed',anchors:undefined}));for(let w=0;w<4;w++)t.week(w,s=>split&&w>=1&&s.role==='EASY'?halves(report(t.p,s,paced(s))):paced(s));return t;};
 const control=build(false),two=build(true),last=two.results.at(-1);
 assert.deepEqual(band(control.cal),['AVAILABLE','OBSERVED_AT_EFFORT',340,370]);
 const bare=frozenCalibration({program:two.p,ledger:two.ledger,evidenceRecord:two.ev,asOf:last.runFormat.asOf,weekIndex:3,hold:false,engineStatus:last.status,eligibility:ELIG(two.day(3,6))},DEV);
 assert.deepEqual(band(bare),['AVAILABLE','OBSERVED_AT_EFFORT',570,600],'the bare record gives the frozen calibration an easy band of 9:30 to 10:00 per km (the finding)');
 assert.deepEqual([band(two.cal),band(two.cal.nextWeek)],[band(control.cal),band(control.cal.nextWeek)],'through the entry point the band is the one of the runs measured whole');
 assert.equal(last.runFormat.paceEvidenceWithheld.length,[1,2,3].reduce((n,w)=>n+two.runsOf(w,s=>s.role==='EASY').length,0));assert.ok(last.runFormat.paceEvidenceWithheld.every(x=>x.reason==='SEVERAL_RECORDINGS'));
 // (b) The athlete with a result: the observed range (P1) sizes every native continuous run. For two weeks every continuous run comes in two
 // parts; the runs of the weeks after are still sized from the paces of whole measurements, never from 9:30 per km.
 const sizingOf=r=>ahead(r).filter(x=>x.expression==='NATIVE'&&x.dose.sizing).map(x=>[x.sessionId,x.dose.sizing.pTyp,x.dose.sizing.pSize,x.dose.sizing.sources.S1,x.dose.sizing.sources.S3??null]);
 const parts=(()=>{const t=atSixteen();t.week(1,weekWith(t,1,null,null));for(const w of [2,3])t.week(w,s=>{const o=asPrescribed(t,s);return ['EASY','LONG'].includes(s.role)&&o.actual?.distanceKm?halves(o):o;});return t.week(4,weekWith(t,4,null,null));})();
 assert.ok(parts.runFormat.paceEvidenceWithheld.length>=4&&parts.runFormat.paceEvidenceWithheld.every(x=>x.reason==='SEVERAL_RECORDINGS'),'the native continuous runs of the two weeks');
 assert.ok(sizingOf(parts).length>=3,'native continuous runs are still delivered, sized from the record');
 for(const [id,pTyp,pSize,S1,S3] of sizingOf(parts))assert.ok(pTyp<400&&pSize<420&&S1<420&&(S3===null||S3<420),`${id}: sized at ${pTyp} to ${pSize} seconds per km`);
 // (c) The same when the two parts are two reports the record merged: for two weeks the phone measured each easy and long run whole (by time) and
 // the watch import holds 60% of it. The record keeps the watch's distance over the whole minutes (9:30 per km); the dispute between the two
 // reports keeps it out of the observed range and out of the sizing (the latest run of the class, S3), and it never pauses the class.
 const merged=(()=>{const t=atSixteen();t.week(1,weekWith(t,1,null,null));
  for(const w of [2,3])t.step(w,6,'WEEKLY_REVIEW',{observations:t.p.weeks[w].sessions.filter(live).flatMap(s=>{if(!['EASY','LONG'].includes(s.role)){const o=s.sport==='RUN'?asPrescribed(t,s):{};return [o?.eventId?o:report(t.p,s,o??{})];}
   const phone=report(t.p,s,paced(s));return [phone,device(t,s,{completed:true,minutes:phone.actual.minutes,distanceKm:Math.round(phone.actual.distanceKm*0.6*100)/100,measurement:'GPS',gpsQuality:'OK'})];})});
  return {t,r:t.week(4,weekWith(t,4,null,null))};})();
 const rows=merged.t.ledger.filter(o=>!o.fact&&[2,3].includes(o.context?.weekIndex)&&['EASY','LONG'].includes(o.context?.family));
 assert.ok(rows.length>=6&&rows.every(o=>o.partial===false&&o.provenance.mergedSourceIds.length===2&&o.actual.minutes*60/o.actual.distanceKm>560),'each row: the watch\'s distance over the whole minutes');
 assert.deepEqual(merged.r.runFormat.paceEvidenceWithheld.map(x=>x.reason),rows.map(()=>'DISTANCE_DISPUTED'));assert.deepEqual(merged.r.runFormat.pausedContinuous,{});
 // The easy runs of the week that follows those two weeks are delivered by distance, sized with the latest easy run that is a whole
 // measurement (5:45 per km): were a disputed run read as the latest of its class, they would be sized at 9:30 per km and fit no distance.
 const next=merged.t.runsOf(4,s=>s.role==='EASY').map(s=>merged.r.runSessions[s.id]);
 assert.deepEqual(next.map(x=>[x.expression,x.dose?.sizing?.sources?.S3??null,x.dose?.sizing?.pSize<420]),next.map(()=>['NATIVE',345,true]));assert.ok(next.length>=2);
 for(const [id,pTyp,pSize,S1,S3] of sizingOf(merged.r))assert.ok(pTyp<400&&pSize<420&&S1<420&&(S3===null||S3<420),`${id}: sized at ${pTyp} to ${pSize} seconds per km (S3 ${S3})`);
});

// ---------- SSCTR-RWS-B-01 ----------
/** The athlete at the 16 km long run of week 1: the app says the run was stopped (`stop`), the device import says what `imported` says. */
function stopped({order='the app, then the import',cite='TIME',stop={reason:'SYMPTOM'},imported={completed:true,minutes:30,distanceKm:5,measurement:'GPS'},entry=F,opts=DEV}={}){
 const t=entry===F?atSixteen():(u=>{u.week(0,paced);u.long=u.runsOf(1,s=>s.role==='LONG')[0];return u;})(timeline(sixteen(),{entry,opts}));
 const s=t.long,fmt=t.runs[s.id],cited=cite==='NATIVE'?{formatHash:fmt.formatHash}:{};
 const said={...report(t.p,s,{}),eventId:'app-stop',actual:{completed:false,minutes:30,stop,...cited}},dev=device(t,s,{...imported,...cited},'hk-long-1');
 let rest=others(t,1,s.id);const review=(observations,time='20:00',extra={})=>{const r=t.step(1,6,'WEEKLY_REVIEW',{...extra,observations:[...rest,...observations]},time);rest=[];return r;};
 ORDERS[order](review,said,dev);
 return {t,s,said,dev,review,last:t.results.at(-1),stopDay:t.day(1,6)};
}
const screen=r=>[r.runFormat.warningSignScreen.status,r.runFormat.warningSignScreen.sessionIds??null,r.runFormat.native,ahead(r).every(s=>s.expression==='TIME'&&s.unavailable.native==='WARNING_SIGN_SCREEN_REQUIRED')];

test('SSCTR-RWS-B-01 reproduced and closed: a symptom stop the watch import contradicts still asks for the screen and withdraws every native session, in the three orders and both expressions',()=>{
 for(const cite of ['TIME','NATIVE'])for(const order of Object.keys(ORDERS)){
  const {t,s,last}=stopped({order,cite}),id=`${cite}; ${order}`,rows=t.ledger.filter(o=>!o.fact&&o.sessionId===s.id&&!o.superseded);
  // The engine's record, as the judge found it: one row in conflict, the other report refused; when the import came first the stop is on no row.
  assert.deepEqual([rows.length,rows[0].conflicted,rows[0].actual.stop?.reason??null],[1,true,order==='the import, then the app'?null:'SYMPTOM'],id);
  // Closed: the screen is asked for and nothing native is delivered.
  assert.deepEqual(screen(last),['REQUIRED',[s.id],0,true],id);assert.ok(ahead(last).length>=8,id);
  assert.deepEqual([last.runFormat.warningSignScreen.reason,last.runFormat.warningSignScreen.decidedByThisExtension],['RUN_STOPPED_FOR_A_SYMPTOM',false],id);
  // The signal is safety only: no execution credit, no pause count, no history, no sizing from the contradicted run.
  const x=last.runSessions[s.id].execution,runs=runHistory({ledger:t.ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180},VALUES).runs;
  assert.deepEqual([x.completed,last.runFormat.pausedContinuous,runs.some(r=>r.sessionId===s.id),last.weekEvidence.rows.find(r=>r.sessionId===s.id).status],[false,{},false,'CONFLICTED'],id);
  // The stop is kept as a fact of the extension's record, with the closed word it is read as and nothing else of the report.
  const kept=t.fmt.filter(r=>isReport(r)&&r.report.stop);assert.deepEqual(kept.map(r=>[r.sessionId,r.report.reportId,r.report.stop,Object.keys(r.report).sort()]),[[s.id,'app-stop',{reason:'SYMPTOM',stated:true},['distanceKm','reportId','sessionId','stop','timed']]],id);
 }
 // Before the fix (the finding): the extension read stops only on unconflicted rows. The engine's own answer is unchanged by the extension:
 // the same reports through the frozen entry point give the same decision and the same rows.
 for(const order of Object.keys(ORDERS)){
  const mine=stopped({order}),frozen=stopped({order,entry:X,opts:FORMATS_OFF}),engine=x=>hash({status:x.last.status,action:x.last.action,proposal:x.last.proposal?.hash??null,rows:x.last.actualLedger.filter(o=>!o.fact&&o.sessionId===x.s.id)});
  assert.equal(engine(mine),engine(frozen),order);assert.equal(frozen.last.runFormat,undefined,order);
 }
});

test('SSCTR-RWS-B-01: the signal survives time, duplicates, updates and corrections; only the screen answered after the stop clears it',()=>{
 for(const order of Object.keys(ORDERS)){
  const {t,s,said,stopDay}=stopped({order}),stale={eligibility:ELIG(stopDay)},facts=()=>t.fmt.filter(r=>isReport(r)&&r.report.stop).length;
  // The screen answered on the day of the stop (as the review that brought the stop carried) is not an answer after it.
  assert.equal(t.results.at(-1).runFormat.warningSignScreen.status,'REQUIRED',order);
  // Later reviews that carry that same earlier screen: still required, days later, and through a store (the records as JSON).
  assert.deepEqual(screen(t.step(2,1,'WEEKLY_REVIEW',stale)),['REQUIRED',[s.id],0,true],order);
  Object.assign(t,JSON.parse(JSON.stringify({ledger:t.ledger,fmt:t.fmt,ev:t.ev,hist:t.hist,ref:t.ref,p:t.p})));
  // Duplicate: the stop report sent again adds no second fact and changes nothing.
  const before=facts();assert.deepEqual([screen(t.step(2,2,'WEEKLY_REVIEW',{...stale,observations:[said]})),facts()-before],[['REQUIRED',[s.id],0,true],0],order);
  // Correction: the athlete now says the run was completed with no stop. The conflict is resolved; the symptom that was reported is not unsaid.
  const fixed=t.step(2,3,'WEEKLY_REVIEW',{...stale,observations:[{...said,eventId:'app-fix',correctionOf:order==='the import, then the app'?'dev-hk-long-1':'app-stop',correctedAt:`${t.day(2,3)}T19:00:00-03:00`,actual:{completed:true,minutes:100}}]});
  const live_=t.ledger.filter(o=>!o.fact&&o.sessionId===s.id&&!o.superseded);
  assert.deepEqual([live_.length,live_[0].eventId,live_[0].conflicted===true,live_[0].actual.stop??null,screen(fixed)],[1,'app-fix',false,null,['REQUIRED',[s.id],0,true]],order);
  // Answered after the stop: cleared, and the sessions are delivered again as the plan and the record allow.
  const answered=t.step(2,4,'WEEKLY_REVIEW');assert.equal(answered.runFormat.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION',order);
  assert.ok(ahead(answered).every(x=>x.unavailable?.native!=='WARNING_SIGN_SCREEN_REQUIRED'),order);
 }
 // A record kept before the report facts existed holds none: a stop on a row in conflict is read from the row itself. And the facts alone hold
 // the stop of a report the engine refused: with the import first, no row of the engine's record has it.
 const legacy=stopped({order:'the app, then the import'}),bare=legacy.t.fmt.filter(r=>!isReport(r));
 assert.deepEqual(screen(F.evaluateProgram(legacy.t.p,{...legacy.t.review(2,1,'WEEKLY_REVIEW',{eligibility:ELIG(legacy.stopDay)}),runFormatRecord:bare},DEV)),['REQUIRED',[legacy.s.id],0,true]);
 // The same record after a correction that withdraws the stop: the replaced row is still a row of the record, and the stop is read on it.
 legacy.t.fmt=bare;const corrected=legacy.t.step(2,2,'WEEKLY_REVIEW',{eligibility:ELIG(legacy.stopDay),observations:[{...legacy.said,eventId:'app-fix',correctionOf:'app-stop',correctedAt:`${legacy.t.day(2,2)}T19:00:00-03:00`,actual:{completed:true,minutes:100}}]});
 assert.deepEqual([legacy.t.ledger.filter(o=>o.sessionId===legacy.s.id&&o.superseded===true&&o.actual.stop).length,legacy.t.fmt.filter(r=>isReport(r)&&r.report.stop).length,screen(corrected)],[1,0,['REQUIRED',[legacy.s.id],0,true]]);
 // A carried row with no fact beside it (a record older than the facts), whatever binding it carries: the engine binds every row again to the
 // plan in force, and a stop on a row it binds to a run session is read. A row of a session the plan does not name is bound to none: its stop
 // is read from the report fact, which names no plan (a record carried into a new plan keeps its facts).
 const plan=atSixteen(),base=plan.ledger.find(o=>!o.fact&&o.context?.sport==='RUN'),when=`${plan.day(1,1)}T12:00:00.000Z`,lone=(sessionId,context)=>({...base,eventId:'lone-'+sessionId,sessionId,context,actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}},provenance:{...base.provenance,firstRecordedAt:when,inputHashes:{}}});
 const withRow=(row,fmt=plan.fmt)=>F.evaluateProgram(plan.p,{...plan.review(1,2,'WEEKLY_REVIEW',{eligibility:ELIG(plan.day(1,1))}),actualLedger:[...plan.ledger,row],runFormatRecord:fmt},DEV).runFormat.warningSignScreen;
 const elsewhere=lone('a-session-of-another-plan',{...base.context,sessionId:'a-session-of-another-plan'}),itsFact=appendReportFacts(plan.fmt,[reportFactOf(elsewhere,VALUES)],{athleteId:plan.p.athleteId,recordedAt:when}).record;
 assert.deepEqual([withRow(lone(plan.long.id,{sessionType:'UNPLANNED'})).sessionIds,withRow(lone(plan.long.id,base.context)).sessionIds,withRow({...lone(plan.long.id,base.context),athleteId:'someone-else'}).status,withRow(elsewhere).status,withRow(elsewhere,itsFact).sessionIds],
  [[plan.long.id],[plan.long.id],'NOT_RAISED_BY_THIS_EXTENSION','NOT_RAISED_BY_THIS_EXTENSION',['a-session-of-another-plan']]);
 const refusedFirst=stopped({order:'the import, then the app'});assert.ok(refusedFirst.t.ledger.every(o=>!o.actual?.stop),'no row of the engine\'s record holds the stop');
 assert.equal(F.evaluateProgram(refusedFirst.t.p,{...refusedFirst.t.review(2,1,'WEEKLY_REVIEW',{eligibility:ELIG(refusedFirst.stopDay)}),runFormatRecord:refusedFirst.t.fmt.filter(r=>!isReport(r))},DEV).runFormat.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION','without the facts it is on no record at all: they are what keeps it');
 // A correction that only changes the stated reason does not unsay the symptom either.
 const c=stopped(),stale={eligibility:ELIG(c.stopDay)};
 const fatigue=c.t.step(2,1,'WEEKLY_REVIEW',{...stale,observations:[{...c.said,eventId:'app-fatigue',correctionOf:'app-stop',correctedAt:`${c.t.day(2,1)}T19:00:00-03:00`,actual:{completed:false,minutes:30,stop:{reason:'FATIGUE'}}}]});
 assert.deepEqual(screen(fatigue),['REQUIRED',[c.s.id],0,true]);
 // Update: a later import that agrees with the app (not completed) merges into the row; the stop stands on it.
 const u=stopped({order:'the app, then the import',imported:{completed:false,minutes:30,distanceKm:5,measurement:'GPS'}}),row=u.t.row(u.s.id);
 assert.deepEqual([row.conflicted===true,row.actual.stop.reason,row.actual.distanceKm,screen(u.last)],[false,'SYMPTOM',5,['REQUIRED',[u.s.id],0,true]]);
 // An exact instant after the stop clears it; one before it does not (the custody sends the screen's own instant in the plan's offset).
 const e=stopped(),at=time=>`${e.t.day(2,0)}T${time}:00-03:00`;
 assert.equal(e.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(`${e.stopDay}T17:00:00-03:00`)},'09:00').runFormat.warningSignScreen.status,'REQUIRED','answered before the report was received');
 assert.equal(e.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(at('09:30'))},'10:00').runFormat.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION');
 // A new plan from the record: the screen is still asked for until the new intake's screen is dated after the stop.
 const again=(x,screened)=>F.restartProgram({intake:{...sixteen({asOf:x.t.day(2,2),start:x.t.day(2,3)}),athlete:{...sixteen({asOf:x.t.day(2,2)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'},eligibility:ELIG(screened)}},record:x.t.ledger,referenceState:x.t.ref,asOf:`${x.t.day(2,2)}T10:00:00-03:00`,athleteId:x.t.p.athleteId,runEvidenceRecord:x.t.ev,runFormatRecord:x.t.fmt,runHistoryRecord:x.t.hist},DEV);
 for(const order of Object.keys(ORDERS)){const x=stopped({order}),kept=again(x,x.stopDay),cleared=again(x,x.t.day(2,2));
  assert.deepEqual([kept.status,kept.runFormat.warningSignScreen.status,kept.runFormat.native,cleared.status,cleared.runFormat.warningSignScreen.status,cleared.runFormat.native>0],['PROPOSED','REQUIRED',0,'PROPOSED','NOT_RAISED_BY_THIS_EXTENSION',true],order);}
});

test('SSCTR-RWS-B-01: what is and is not a signal: the reason as it is read, the athlete it is about, a report the engine cannot read, and nothing but the screen',()=>{
 // No stated reason, and a reason outside the list, are read as a symptom (V1RC R-01); the other reasons never ask for the screen.
 for(const [stop,status] of [[{},'REQUIRED'],[{reason:'something else'},'REQUIRED'],[{reason:'symptom'},'REQUIRED'],[{reason:'FATIGUE'},'NOT_RAISED_BY_THIS_EXTENSION'],[{reason:'PACING'},'NOT_RAISED_BY_THIS_EXTENSION'],[{reason:'CHOICE'},'NOT_RAISED_BY_THIS_EXTENSION'],[{reason:'TIME'},'NOT_RAISED_BY_THIS_EXTENSION']])
  for(const order of Object.keys(ORDERS))assert.equal(stopped({order,stop}).last.runFormat.warningSignScreen.status,status,JSON.stringify(stop)+'; '+order);
 // No free text is kept: a reason outside the list is kept as the closed word it is read as.
 const odd=stopped({stop:{reason:'<b>knee</b>'}});assert.deepEqual(odd.t.fmt.filter(r=>isReport(r)&&r.report.stop).map(r=>r.report.stop),[{reason:'SYMPTOM',stated:false}]);assert.ok(!JSON.stringify(odd.t.fmt).includes('knee'));
 // A report that names another athlete is not this athlete's symptom; one that carries no completion is refused by the engine and still read.
 const t=atSixteen(),s=t.long,stop={...report(t.p,s,{}),eventId:'x-stop',actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}};
 const other=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW',{observations:[{...stop,athleteId:'someone-else'}]}),DEV);
 assert.deepEqual([other.runFormat.warningSignScreen.status,other.runFormatRecord.filter(r=>isReport(r)&&r.report.stop).length,other.provenance.excluded.map(x=>x.reason)],['NOT_RAISED_BY_THIS_EXTENSION',0,['ATHLETE_MISMATCH']]);
 const incomplete=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW',{observations:[{...stop,actual:{minutes:30,stop:{reason:'SYMPTOM'}}}]}),DEV);
 assert.deepEqual([incomplete.provenance.excluded.map(x=>x.reason),incomplete.actualLedger.some(o=>o.sessionId===s.id),screen(incomplete)],[['ACTUAL_COMPLETION_REQUIRED'],false,['REQUIRED',[s.id],0,true]]);
 const {eventId:_id,...unnamed}=stop,nameless=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW',{observations:[unnamed]}),DEV),keptNameless=nameless.runFormatRecord.filter(r=>isReport(r)&&r.report.stop);
 assert.deepEqual([nameless.provenance.excluded.map(x=>x.reason),screen(nameless),keptNameless.length,/^unidentified:[0-9a-f]{16}$/.test(keptNameless[0].report.reportId)],[['EVENT_ID_REQUIRED'],['REQUIRED',[s.id],0,true],1,true],'a report with no id is refused by the engine; its stop is kept, named by its content');
 // A report that cites a format the record does not hold is not recorded as an execution and the review is asked again (as before); the stop it
 // declares is kept and named at once, and the next review still asks for the screen.
 const unread=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW',{observations:[{...stop,actual:{...stop.actual,formatHash:'0'.repeat(64)}}]}),DEV),added=unread.runFormatRecord.slice(t.fmt.length);
 assert.deepEqual([unread.status,unread.question.kind,unread.actualLedger,unread.runFormat.status,unread.runFormat.warningSignScreen.status,unread.runFormat.warningSignScreen.sessionIds],['ASK','UNKNOWN_RUN_FORMAT',undefined,'NOT_APPLICABLE','REQUIRED',[s.id]]);
 assert.deepEqual([hash(unread.runFormatRecord.slice(0,t.fmt.length)),added.map(r=>[r.fact,r.report.reportId,r.report.stop.reason,r.report.distanceKm])],[hash(t.fmt),[[RUN_REPORT_RECEIVED,'x-stop','SYMPTOM',null]]]);
 t.fmt=unread.runFormatRecord;assert.deepEqual(screen(t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(1,6))})),['REQUIRED',[s.id],0,true]);
 // Nothing is kept under an instant the engine did not accept (a malformed review, a review earlier than the record), or when the records sent
 // do not hold together; the stop is still named in the answer, from the request alone.
 const u=atSixteen(),unreadStop={...stop,athleteId:u.p.athleteId,actual:{...stop.actual,formatHash:'0'.repeat(64)}},named=r=>[r.runFormat.status,hash(r.runFormatRecord),r.runFormat.warningSignScreen?.status??null,r.runFormat.warningSignScreen?.sessionIds??null];
 const notATime=F.evaluateProgram(u.p,{...u.review(1,6,'WEEKLY_REVIEW',{observations:[unreadStop]}),asOf:'not a time'},DEV),malformed=F.evaluateProgram(u.p,{...u.review(1,6,'WEEKLY_REVIEW',{observations:[stop]}),version:'R0'},DEV);
 const {referenceState:_r,...backdated}=u.review(0,5,'WEEKLY_REVIEW',{observations:[stop]}),before=F.evaluateProgram(u.p,backdated,DEV),beforeUnread=F.evaluateProgram(u.p,{...backdated,observations:[unreadStop]},DEV);
 assert.deepEqual([named(notATime),named(malformed),named(before),named(beforeUnread)],[['NOT_APPLICABLE',hash(u.fmt),'REQUIRED',[s.id]],['NOT_APPLICABLE',hash(u.fmt),'REQUIRED',[s.id]],['NOT_APPLICABLE',hash(u.fmt),'REQUIRED',[s.id]],['NOT_APPLICABLE',hash(u.fmt),'REQUIRED',[s.id]]]);
 assert.ok(['HOLD','INVALID_INPUT','UNSUPPORTED'].includes(malformed.status)&&malformed.runFormat.reason==='NO_DECISION'&&['REVIEW_BEFORE_THE_RECORD','NO_DECISION'].includes(before.runFormat.reason));
 u.week(1,weekWith(u,1,null,null));const lostFormats=F.evaluateProgram(u.p,{...u.review(2,6,'WEEKLY_REVIEW',{observations:[{...stop,athleteId:u.p.athleteId,sessionId:u.runsOf(2)[0].id,occurrenceDate:u.runsOf(2)[0].date}]}),runFormatRecord:[]},DEV);
 assert.deepEqual([lostFormats.status,lostFormats.errors,lostFormats.runFormatRecord,lostFormats.runFormat.warningSignScreen.sessionIds],['HOLD',['runFormatRecord.missingFormat'],[],[u.runsOf(2)[0].id]]);
 // A report id past the bound is named by its content, never kept as sent.
 const v=atSixteen(),longId=F.evaluateProgram(v.p,v.review(1,6,'WEEKLY_REVIEW',{observations:[{...stop,athleteId:v.p.athleteId,eventId:'x'.repeat(5000)}]}),DEV).runFormatRecord.filter(r=>isReport(r)&&r.report.stop);
 assert.ok(longId.length===1&&/^unidentified:[0-9a-f]{16}$/.test(longId[0].report.reportId)&&JSON.stringify(longId).length<700);
 // A forged or altered fact row is unreadable, named, and never read; a readable one cannot carry anything but the closed structure.
 const f=reportFactOf({eventId:'e1',sessionId:'s',actual:{completed:false,stop:{reason:'SYMPTOM'}}},VALUES),rec=appendReportFacts([],[f],{athleteId:'a',recordedAt:'2026-12-01T10:00:00.000Z'}).record,row=rec[0];
 const read=r=>{const x=readReportFacts(r,'a',VALUES);return [x.stops.length,x.unreadable.length];};
 assert.deepEqual([read([{...row,report:{...row.report,stop:{reason:'FATIGUE',stated:true}}}]),read([{...row,eventId:'report|e1|0000000000000000'}]),read([{...row,sessionId:'other'}])],[[0,1],[0,1],[0,1]],'a row whose content, key or session was changed');
 // A row made self-consistent again by a client (it can recompute every hash) still cannot carry anything beside the five closed fields.
 const remade=report=>{const inputHash=hash(report);return {...row,report,inputHash,eventId:`report|${report.reportId}|${inputHash.slice(0,16)}`};};
 assert.deepEqual([read([remade({...row.report})]),read([remade({...row.report,note:'<b>knee</b>'})]),read([remade({...row.report,reportId:'x'.repeat(200)})]),read([remade({...row.report,timed:'yes'})]),read([remade({...row.report,stop:null,distanceKm:null})]),read([remade({...row.report,distanceKm:1e9})])],[[1,0],[0,1],[0,1],[0,1],[0,1],[0,1]]);
 assert.deepEqual([read(rec),read([{...row,report:{...row.report,stop:null}}]),read([{...row,athleteId:'b'}]),read([{...row,report:{...row.report,stop:{reason:'<x>',stated:true}},inputHash:hash({...row.report,stop:{reason:'<x>',stated:true}}),eventId:`report|e1|${hash({...row.report,stop:{reason:'<x>',stated:true}}).slice(0,16)}`}]),read([{...row,recordedAt:'never'}]),readReportFacts(rec,'b',VALUES).stops.length],
  [[1,0],[0,1],[0,1],[0,1],[0,1],0]);
 assert.equal(reportFactOf({eventId:'e2',sessionId:'s',actual:{completed:true,minutes:40}},VALUES),null,'a report that states neither a stop nor a measured distance leaves no fact');
 assert.deepEqual(reportFactOf({eventId:'e3',sessionId:'s',actual:{completed:true,minutes:40,distanceKm:7}},VALUES,{fromDevice:true}),{sessionId:'s',reportId:'e3',stop:null,distanceKm:7,timed:true});
 assert.equal(reportFactOf({eventId:'e4',sessionId:'s',actual:{completed:true,minutes:40,distanceKm:7}},VALUES),null,'a typed figure is no measured distance of a report');
});

// ---------- QRE-RWS-B-02 ----------
test('QRE-RWS-B-02: a measured distance with no duration is no usable measurement: not met as measured, not pace evidence, not history',()=>{
 const t=atSixteen(),s=t.runsOf(1,x=>x.role==='EASY')[0],o=nativeReport(t,s,{km:40,rpe:4});delete o.actual.minutes;
 t.week(1,weekWith(t,1,s.id,o));const e=t.runs[s.id].execution;
 assert.deepEqual([e.status,e.flag,e.ask,e.paceEvidence,e.extentKm,e.paceWithheld,t.row(s.id).partial],['UNKNOWN','DURATION_REQUIRED','SEND_THE_DURATION_OF_THE_RUN',false,null,'DURATION_REQUIRED',true]);
 const long=t.runs[t.runsOf(2,x=>x.role==='LONG')[0].id];assert.equal(long.expression,'NATIVE');assert.ok(long.dose.checks['CT-3'].max<20,'the 40 km with no duration is no reference for the next long run');
 // The reader by itself: the same distance with its duration stands; with none it is never MEASURED, on any target.
 const f=t.fmt.find(r=>r.sessionId===s.id&&r.format?.expression==='NATIVE').format,target=f.blocks[0].steps[0].target.metres/1000,read=a=>readCompletion({completed:true,measurement:'GPS',...a},f,VALUES);
 assert.deepEqual([read({distanceKm:target,minutes:target*6}).status,read({distanceKm:target}).status,read({distanceKm:target}).flag,read({distanceKm:target,seconds:target*360}).status,read({distanceKm:target-1}).status],['DISTANCE','UNKNOWN','DURATION_REQUIRED','DISTANCE','UNKNOWN']);
 // A correction still completes it (its own basis, never MEASURED), and the history then reads the smaller figure.
 const fixed=read({distanceKm:target,declared:{distanceKm:target,reason:'DEVICE_RESTART'}});assert.deepEqual([fixed.status,fixed.basis],['DISTANCE','CONFIRMED_CORRECTION']);
 // A measurement the athlete corrected with a listed reason is never MEASURED, whatever it reads, timed or not: its reliability is POOR.
 const over=read({distanceKm:target+0.2,minutes:(target+0.2)*6,gpsQuality:'OK',declared:{distanceKm:target,reason:'SIGNAL_LOSS'}});assert.deepEqual([over.status,over.basis],['DISTANCE','CONFIRMED_CORRECTION']);
 const ref=a=>historyReference(distanceFacts(a,VALUES));
 assert.deepEqual([ref({distanceKm:40,measurement:'GPS'}),ref({distanceKm:40,measurement:'GPS',minutes:240}),ref({distanceKm:40,measurement:'GPS',declared:{distanceKm:16}}),distanceFacts({distanceKm:40,measurement:'GPS'},VALUES).untimed,distanceFacts({distanceKm:40},VALUES).untimed],[null,40,16,true,false]);
 assert.deepEqual([distanceFacts({distanceKm:40,measurement:'GPS'},VALUES).paceWithheld,distanceFacts({distanceKm:40,measurement:'GPS',minutes:240},VALUES).paceWithheld,distanceFacts({distanceKm:40,measurement:'GPS',seconds:14400},VALUES).paceWithheld],['DURATION_REQUIRED',null,null],'by the row\'s own facts, with no report fact at hand');
 // An imported history row with a distance and no duration is a run with no reference (the judge's 40 km line).
 const intake=h=>factsFromIntake({asOf:'2026-11-07',history:[{sport:'RUN',startedAt:'2026-11-01T08:00:00-03:00',distanceKm:40,measurement:'GPS',...h}]},VALUES).facts.map(x=>historyReference(x));
 assert.deepEqual([intake({}),intake({durationMinutes:240})],[[null],[40]]);
});

// ---------- SSCTR-RWS-B-02 ----------
test('SSCTR-RWS-B-02: while the engine asks for the current eligibility every run session is by time and nothing is prescribing; another question changes no expression',()=>{
 const t=atSixteen(),plain=t.step(1,1,'WEEKLY_REVIEW');assert.ok(plain.runFormat.native>=4&&plain.runFormat.prescribing===true);
 const without=k=>{const {[k]:_,...rest}=t.review(1,2,'WEEKLY_REVIEW');return rest;};
 for(const [what,review] of [['no eligibility',without('eligibility')],['null',{...t.review(1,2,'WEEKLY_REVIEW'),eligibility:null}],['not assessed',{...t.review(1,2,'WEEKLY_REVIEW'),eligibility:{status:'UNKNOWN'}}],['assessed twenty days ago',{...t.review(1,2,'WEEKLY_REVIEW'),eligibility:ELIG(t.day(-2,3))}]]){
  const r=F.evaluateProgram(t.p,review,DEV);
  assert.deepEqual([r.status,r.missingInputs,r.proposal,r.runFormat.prescribing,r.runFormat.native,r.runFormat.warningSignScreen.status],['ASK',['eligibility.currentAssessment'],null,false,0,'NOT_RAISED_BY_THIS_EXTENSION'],what);
  assert.ok(ahead(r).length>=8&&ahead(r).every(s=>s.expression==='TIME'&&s.unavailable.native==='WARNING_SIGN_SCREEN_REQUIRED'&&s.unavailable.detail==='ENGINE_ASKS_CURRENT_ELIGIBILITY'),what);
  assert.deepEqual([r.runCalibration.assessment.status,r.runCalibration.assessment.reasons],['NOT_OFFERED',['ELIGIBILITY_NOT_CURRENT']],what+': V1RC\'s own reading of the same answer');
 }
 // An ASK for something else: the expressions stand as they were; `prescribing` still follows V1RC's reading (an ASK prescribes nothing).
 const other=F.evaluateProgram(t.p,{...t.review(1,2,'WEEKLY_REVIEW'),choices:[{type:'NOT_A_CHOICE'}]},DEV);
 assert.deepEqual([other.status,other.missingInputs,other.runFormat.native,other.runFormat.prescribing],['ASK',['choices'],plain.runFormat.native,false]);
 // Answered: native again, and prescribing.
 const answered=t.step(1,2,'WEEKLY_REVIEW');assert.deepEqual([answered.runFormat.native,answered.runFormat.prescribing],[plain.runFormat.native,true]);
 // A screen with a sign answered yes is the engine's clinical route: nothing prescribed, as before.
 const sign=F.evaluateProgram(t.p,t.review(1,3,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(1,3),{illness:true})}),DEV);assert.deepEqual([sign.status,sign.runFormat.prescribing,ahead(sign).every(s=>s.prescribed===false)],['CLINICAL_HUMAN_REQUIRED',false,true]);
});

// ---------- QRE-RWS-B-05 ----------
/** A row of the format record altered and made self-consistent again (a client can recompute every hash a row carries). */
const forge=(row,change,settled=row.settled)=>{const format={...row.format,...change};format.formatHash=hash({sessionId:format.sessionId,plannedPrescriptionHash:format.plannedPrescriptionHash,expression:format.expression,pattern:format.pattern,blocks:format.blocks});
 return {...row,settled,formatHash:format.formatHash,eventId:`${row.sessionId}|${format.formatHash}|${settled?'W':'P'}`,format,inputHash:hash(format)};};

test('QRE-RWS-B-05 (M04): a native format that says it expresses another dose credits nothing by distance: the forged row is the native one',()=>{
 const u=atSixteen(),real=u.fmt.find(r=>r.fact===RUN_FORMAT_EMITTED&&r.sessionId===u.long.id&&r.format.expression==='NATIVE'),other=forge(real,{plannedPrescriptionHash:'f'.repeat(64)});
 assert.deepEqual([real.format.expression,real.format.blocks[0].steps[0].target,other.format.expression,other.formatHash!==real.formatHash],['NATIVE',{type:'DISTANCE',metres:16000},'NATIVE',true],'the row forged is the 16 km native format, not its time version');
 // 16 km in 85 of the 100 planned minutes: by its distance it would be complete; by the minutes the engine reads, it is not.
 u.fmt=[...u.fmt,other];u.week(1,weekWith(u,1,u.long.id,nativeReport(u,u.long,{minutes:85,km:16,rpe:4,actual:{formatHash:other.formatHash}})));
 assert.deepEqual([u.row(u.long.id).partial,u.runs[u.long.id].execution.status,u.runs[u.long.id].execution.expression],[true,'TIME','TIME'],'no credit by distance for a dose the session does not plan');
 const same=atSixteen();same.week(1,weekWith(same,1,same.long.id,nativeReport(same,same.long,{minutes:85,km:16,rpe:4})));
 assert.deepEqual([same.row(same.long.id).partial,same.runs[same.long.id].execution.status],[false,'DISTANCE'],'the real format of the same session, the same report: complete by its distance');
});

test('QRE-RWS-B-05 (M08a, M18), through the entry point: a session reported late does not change this week\'s formats; a format delivered for the week is kept, not selected again',()=>{
 // M18: the long run of week 1 is delivered as 16 km on Monday. On Wednesday a new selection would give another distance (the same session,
 // the same plan, a faster comparable long run on record); the week's format is kept.
 const t=atSixteen();t.step(1,0,'WEEKLY_REVIEW');const monday=t.runs[t.long.id],settled=t.fmt.find(r=>r.fact===RUN_FORMAT_EMITTED&&r.sessionId===t.long.id&&r.settled===true);
 assert.deepEqual([monday.expression,monday.blocks[0].steps[0].target.metres,settled.formatHash],['NATIVE',16000,monday.formatHash]);
 // The record without the settled row is the same review with a free selection: it shows what a new selection gives today.
 const wednesday=t.review(1,2,'WEEKLY_REVIEW'),kept=F.evaluateProgram(t.p,wednesday,DEV).runSessions[t.long.id];
 assert.deepEqual([kept.formatHash,kept.blocks[0].steps[0].target.metres],[monday.formatHash,16000],'kept as delivered');
 // A structure that is not today's first choice is still the week's: with 15.5 km settled (a distance that passes today's three checks), the
 // week keeps 15.5 km where a new selection gives 16 km. A settled 15 km passes no more (the dose floor): a new selection, 16 km.
 const settledAt=metres=>{const row=forge(settled,{blocks:[{...settled.format.blocks[0],steps:[{...settled.format.blocks[0].steps[0],target:{type:'DISTANCE',metres}}]},...settled.format.blocks.slice(1)]});
  return F.evaluateProgram(t.p,{...wednesday,runFormatRecord:t.fmt.map(r=>r===settled?row:r)},DEV).runSessions[t.long.id];};
 assert.deepEqual([settledAt(15500).expression,settledAt(15500).blocks[0].steps[0].target.metres,settledAt(15000).blocks[0].steps[0].target.metres],['NATIVE',15500,16000],'the week\'s structure is built again from the settled one (M18: a selection would give 16 km)');
 assert.ok(!JSON.stringify(settledAt(15500)).includes(settled.formatHash)&&settledAt(15500).dose.checks['CT-2'].value>=90,'built with today\'s inputs, never delivered as stored');
 // M08a: what a week reads of the earlier session at its step is what the record held when the week began (R2 N10). A 16-week plan: the
 // threshold session of week 13 is at the step of week 11's. With week 11's on record before week 13 began, done as prescribed, the week's
 // rotation gives the recovery by distance. With that same report first recorded on the Tuesday of week 13, the week reads what its Monday
 // found (that session not yet reported: even repetitions, recovery by time), exactly as if the report were not on record at all.
 const q=timeline(sixteen({weeks:16}));for(let k=0;k<13;k++)q.week(k,weekWith(q,k,null,null));
 const quality=k=>q.runsOf(k,s=>s.role==='QUALITY')[0],now=quality(13),earlier=quality(11),row=q.ledger.find(o=>o.sessionId===earlier.id&&!o.fact&&!o.superseded),review=q.review(13,2,'WEEKLY_REVIEW');
 assert.deepEqual([hash(now.progression),now.prescription.family,row.partial],[hash(earlier.progression),earlier.prescription.family,false],'the same step, two weeks apart, the earlier one done');
 const given=ledger=>{const r=F.evaluateProgram(q.p,{...review,actualLedger:ledger},DEV);assert.deepEqual([r.status,r.proposal],['KEEP',null]);const x=r.runSessions[now.id];return [x.expression,x.pattern,x.blocks[1].steps[1].target.type];};
 const onTime=given(q.ledger),late=given(q.ledger.map(o=>o===row?{...o,provenance:{...o.provenance,firstRecordedAt:`${q.day(13,1)}T12:00:00.000Z`}}:o)),absent=given(q.ledger.filter(o=>o!==row));
 assert.deepEqual([onTime,late,absent],[['NATIVE','EVEN_REPEATS_DISTANCE_RECOVERY','DISTANCE'],['NATIVE','EVEN_REPEATS','TIME'],['NATIVE','EVEN_REPEATS','TIME']],'a report that joined the record inside the week changes nothing this week');
});

test('QRE-RWS-B-06 (N02, N35): a race keeps its own evidence rules; a row the record already holds is never normalized again',()=>{
 // N02: the race of a 10 km plan, its distance typed by the athlete with no source. On any other run the figure is kept beside; on the race it
 // stays where V1RC reads it by its own rules (a result with no stated measurement is refused there, never read as measured).
 const t=timeline(raceTen());for(let k=0;k<10;k++)t.week(k,weekWith(t,k,null,null));
 const race=t.runsOf(10,s=>s.prescription.family==='RACE')[0],easy=t.runsOf(10,s=>s.role==='EASY'||s.prescription.family==='SHAKEOUT'||s.prescription.family==='RECOVERY_EASY')[0],typed=s=>({...report(t.p,s,{rpe:s===race?9:3}),actual:{completed:true,minutes:s===race?50:s.prescription.durationMinutes,distanceKm:s===race?10:4,rpe:s===race?9:3}});
 t.step(10,6,'WEEKLY_REVIEW',{observations:t.p.weeks[10].sessions.filter(live).map(s=>s===race||s===easy?typed(s):report(t.p,s,s.sport==='RUN'?paced(s):{}))});
 const raceRow=t.row(race.id),easyRow=t.row(easy.id);
 assert.deepEqual([raceRow.actual.distanceKm,'manualDistanceKm' in raceRow.actual,easyRow.actual.distanceKm,easyRow.actual.manualDistanceKm],[10,false,undefined,4]);
 assert.ok(t.cal.refusedEvidence.some(e=>e.id==='plan-race:'+raceRow.eventId)||t.cal.evidence.some(e=>e.id==='plan-race:'+raceRow.eventId),'the race result is V1RC\'s to read or refuse');
 // N35: a carried row with an unsourced figure in the measured slot (as an older record, or another entry point, would hold it) comes back
 // byte for byte: only a new report is recorded with its figure kept beside.
 const u=atSixteen(),kept=u.ledger.find(o=>!o.fact&&o.context?.family==='EASY'),older={...kept,actual:{completed:true,minutes:kept.actual.minutes,rpe:4,distanceKm:9}},ledger=u.ledger.map(o=>o===kept?older:o);
 const back=F.evaluateProgram(u.p,{...u.review(1,1,'WEEKLY_REVIEW'),actualLedger:ledger},DEV).actualLedger.find(o=>o.eventId===older.eventId);
 assert.deepEqual([back.actual.distanceKm,'manualDistanceKm' in back.actual,hash(back.actual)],[9,false,hash(older.actual)]);
});
