// V1 Run Workout Structure: the one corrective cycle after the independent round on bcac30d. One directed test per finding it closes:
// QRE-RWS-A-01, A-03 to A-08 and A-10 (with the mutants of A-06), SSCTR-RWS-A-01 to A-05 and A-09, SEC-RWS-A-02, A-03 and A-05.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,X,V1,DEV,FORMATS_OFF,VALUES,ELIG,hash,report,runner,timeline,atSixteen,sixteen,paced,nativeReport,weekWith,asPrescribed,session,input,select,line,flatSteps} from './v1rws-helpers.mjs';
import {READS_COMPLETION} from '../src/r6-adaptation.mjs';
import {reselectRunSession,readFormatRecord,readCompletion,executionOf,pausedUntil,sizeContinuous} from '../src/v1-run-format.mjs';
import {runHistory,comparableLongRun,L30,onDate} from '../src/v1-run-history.mjs';

const km=run=>run.blocks[0].steps[0].target.metres/1000,exec=(t,id)=>t.runs[id].execution;
/** A row of the format record altered and made self-consistent again (a client can recompute every hash a row carries). */
const forge=(row,change,settled=row.settled)=>{const format={...row.format,...change};format.formatHash=hash({sessionId:format.sessionId,plannedPrescriptionHash:format.plannedPrescriptionHash,expression:format.expression,pattern:format.pattern,blocks:format.blocks});
 return {...row,settled,formatHash:format.formatHash,eventId:`${row.sessionId}|${format.formatHash}|${settled?'W':'P'}`,format,inputHash:hash(format)};};
const steady=(row,metres)=>[{...row.format.blocks[0],steps:[{...row.format.blocks[0].steps[0],target:{type:'DISTANCE',metres}}]}];

test('QRE-RWS-A-01: a run sent in two files never reaches the calibration with the first file\'s distance over the whole minutes',()=>{
 const run=actual=>{const t=atSixteen(),s=t.runsOf(1,x=>x.role==='EASY')[0],d=km(t.runs[s.id]);
  t.week(1,weekWith(t,1,s.id,nativeReport(t,s,{minutes:60,rpe:4,...actual(d)})));t.week(2,weekWith(t,2,null,null));return {t,s,d};};
 const one=run(d=>({km:d})),two=run(d=>({km:Math.round(d*0.6*10)/10,actual:{gpsQuality:'OK',segments:[{distanceKm:Math.round(d*0.4*10)/10,measurement:'GPS'}]}}));
 const row=two.t.row(two.s.id),e=exec(two.t,two.s.id);
 assert.deepEqual([row.actual.gpsQuality,'deviceGpsQuality' in row.actual,row.actual.segments.length,row.partial],['OK',false,1,false],'recorded as it was sent: one run in two files, nothing of it rewritten');
 assert.deepEqual([e.status,e.basis,e.paceEvidence,e.measuredKm,e.reliability,e.paceWithheld],['DISTANCE','MEASURED',false,two.d,'POOR','SEVERAL_RECORDINGS'],'the two files together are the run; never pace evidence');
 assert.deepEqual(two.t.state.paceEvidenceWithheld.map(x=>[x.sessionId,x.reason]),[[two.s.id,'SEVERAL_RECORDINGS']],'the calibration is not handed its distance');
 assert.deepEqual(two.t.cal.paceBands.EASY.slowSecondsPerKm,one.t.cal.paceBands.EASY.slowSecondsPerKm,'the easy band is the one of the same run in one file');
 const edges=t=>Object.fromEntries(Object.entries(t.cal.paceBands).map(([k,b])=>[k,[b.status,b.fastSecondsPerKm??null,b.slowSecondsPerKm??null]]));
 assert.deepEqual(edges(two.t),edges(one.t),'every band has the edges of the control');
 // The same on the time version: a report with several files is withheld from the calibration whatever it cites.
 const t=atSixteen(),s=t.runsOf(1,x=>x.role==='EASY')[0];t.week(1,weekWith(t,1,s.id,{...report(t.p,s,{rpe:4}),actual:{completed:true,minutes:65,distanceKm:6,measurement:'GPS',rpe:4,segments:[{distanceKm:5,measurement:'GPS'}]}}));
 assert.deepEqual([t.row(s.id).actual.distanceKm,'gpsQuality' in t.row(s.id).actual,t.state.paceEvidenceWithheld.map(x=>[x.sessionId,x.reason])],[6,false,[[s.id,'SEVERAL_RECORDINGS']]]);
 t.week(2,weekWith(t,2,null,null));assert.deepEqual(edges(t),edges(one.t),'and every band has the edges of the control');
});
test('QRE-RWS-A-03, SEC-RWS-A-02: a fabricated settled format is never delivered: the week\'s format is built again and must pass today\'s envelope',()=>{
 const t=atSixteen();t.step(1,0,'WEEKLY_REVIEW');const real=t.runs[t.long.id],row=t.fmt.find(r=>r.sessionId===t.long.id&&r.settled===true);
 assert.deepEqual([km(real),real.provisional],[16,false]);
 for(const metres of [42195,1000]){
  const fmt=t.fmt.map(r=>r===row?forge(row,{blocks:steady(row,metres),instructions:['<b>run it all</b>'],formatId:'x'}):r);
  const r=F.evaluateProgram(t.p,{...t.review(1,2,'WEEKLY_REVIEW'),runFormatRecord:fmt},DEV),given=r.runSessions[t.long.id];
  assert.equal(km(given),16,`a forged ${metres} m target is no candidate that passes: a new selection`);assert.ok(!JSON.stringify(given).includes('<b>'),'no text of a stored row is ever delivered');
 }
 // Kept by structure while it passes; given up when it passes no more (the unit of D-4, and mutant M18).
 const P1={fastSecondsPerKm:340,slowSecondsPerKm:350},x=h=>input({s:session({family:'LONG',minutes:100}),fast:340,slow:420,available:120,history:{p1:P1,l30:{km:16},comparable:{secondsPerKm:345},latest:null,pausedUntil:null,...h}});
 const first=select(x({comparable:{secondsPerKm:370}}));assert.equal(km(first),16);
 assert.equal(km(select(x({}))),17,'with today\'s faster inputs a new selection would be 17 km');
 assert.equal(km(reselectRunSession(x({}),first,VALUES)),16,'the distance delivered for the week is kept while it still passes');
 const slower=reselectRunSession(x({latest:{secondsPerKm:405}}),first,VALUES);assert.deepEqual([slower.expression,slower.unavailable.native],['TIME','NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE'],'and gives way when it passes no more');
 assert.equal(reselectRunSession({...x({}),screenRequired:true},first,VALUES).unavailable.native,'WARNING_SIGN_SCREEN_REQUIRED','a protective state still withdraws it at once');
 const T={repetitions:6,workMinutes:4,recoveryMinutes:2},q=(fast,slow)=>input({s:session({family:'TEN_K_SPECIFIC',step:T,ladderStep:3}),fast,slow,weekIndex:0}),six=select(q(290,300));
 assert.equal(line(reselectRunSession(q(292,302),six,VALUES)),'6 x 800 m, 2 min walk-or-jog between');assert.equal(reselectRunSession(q(292,302),six,VALUES).blocks[1].steps[0].intensity.pace.fastSecondsPerKm,292,'with the band of today');
 assert.equal(line(reselectRunSession(q(305,320),six,VALUES)),'6 x 750 m, 2 min walk-or-jog between','800 m passes no more: a new selection');
 const alien={...six,blocks:six.blocks.map((b,i)=>i===1?{...b,steps:[{...b.steps[0],target:{type:'DISTANCE',metres:5000}},b.steps[1]]}:b)};
 assert.equal(line(reselectRunSession(q(290,300),alien,VALUES)),'6 x 800 m, 2 min walk-or-jog between','a structure that is no candidate of the catalog is never built');
});
test('SEC-RWS-A-03: a format row that is not a small closed structure is unreadable, at no cost; the lists of a report are bounded',()=>{
 const t=atSixteen(),row=t.fmt.find(r=>r.sessionId===t.long.id),started=Date.now();
 for(const blocks of [[{repeat:2e6,steps:row.format.blocks[0].steps}],Array.from({length:30},()=>row.format.blocks[0]),[{repeat:1,steps:[{kind:'NAP',target:{type:'TIME',seconds:60}}]}],[{repeat:1,steps:[{kind:'WORK',target:{type:'DISTANCE',metres:1e9}}]}],'x',[]]){
  const read=readFormatRecord([forge(row,{blocks})],t.p.athleteId);assert.deepEqual([read.size,read.unreadable.length],[0,1]);}
 assert.ok(Date.now()-started<500,'no row is expanded before it is known to be small');
 const f=t.runs[t.long.id],many=readCompletion({completed:true,minutes:96,distanceKm:1,measurement:'GPS',segments:Array.from({length:300},()=>({distanceKm:300,measurement:'GPS'}))},f,VALUES);
 assert.notEqual(many.status,'DISTANCE');assert.equal(many.evidence.measuredKm,null,'three hundred files of 300 km are no measurement');
 // QRE-RWS-A-06 (M14, M32): a row whose content hash is wrong, or another athlete's, is never read.
 assert.equal(readFormatRecord([{...row,inputHash:'0'.repeat(64)}],t.p.athleteId).size,0);assert.equal(readFormatRecord([row],'someone-else').size,0);assert.ok(readFormatRecord([row],t.p.athleteId).size>0);
});
test('QRE-RWS-A-04: a measurement that gives an impossible pace is a fault: not a distance run, not pace evidence, not history',()=>{
 const t=atSixteen(),s=t.runsOf(1,x=>x.role==='EASY')[0];
 t.week(1,weekWith(t,1,s.id,nativeReport(t,s,{minutes:60,km:40,rpe:4})));
 const e=exec(t,s.id);assert.deepEqual([e.status,e.flag,e.paceEvidence,e.extentKm,t.row(s.id).partial],['UNKNOWN','MEASUREMENT_IMPLAUSIBLE',false,null,true]);
 const runs=runHistory({ledger:t.ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180},VALUES).runs,weekStart=t.p.weeks[2].startDate;
 assert.ok(L30(runs,{cutoff:weekStart,weekStart},VALUES).km<20,'the 40 km spike is no reference for the next 30 days');
 const long=t.runs[t.runsOf(2,x=>x.role==='LONG')[0].id];if(long.expression==='NATIVE')assert.ok(long.dose.checks['CT-3'].max<20);
 // The calibration's own window, 2:00 to 15:00 per km: inside it a measurement stands.
 assert.deepEqual(VALUES.runFacts.plausiblePaceSecondsPerKm,[120,900]);
 const f=t.fmt.find(r=>r.sessionId===s.id&&r.format.expression==='NATIVE').format,at=(minutes,d)=>readCompletion({completed:true,minutes,distanceKm:d,measurement:'GPS'},f,VALUES).status,target=km(f);
 assert.deepEqual([at(target*2.1,target),at(target*1.9,target),at(target*14.9,target),at(target*15.1,target)],['DISTANCE','UNKNOWN','DISTANCE','UNKNOWN']);
});
test('QRE-RWS-A-05: a review the engine refuses, or one earlier than the record, delivers nothing and adds nothing to the record of formats',()=>{
 const t=atSixteen(),old=t.review(1,6,'WEEKLY_REVIEW',{observations:t.runsOf(1).map(s=>asPrescribed(t,s))});
 t.take(F.evaluateProgram(t.p,old,DEV));t.week(2,weekWith(t,2,null,null));const size=t.fmt.length;
 const stale=F.evaluateProgram(t.p,{...old,actualLedger:t.ledger,referenceState:t.ref,runFormatRecord:t.fmt,runHistoryRecord:t.hist,runEvidenceRecord:t.ev},DEV);
 assert.deepEqual([stale.runFormatRecord.length,Object.keys(stale.runSessions).length,stale.runFormat.status],[size,0,'NOT_APPLICABLE']);assert.equal(hash(stale.runFormatRecord),hash(t.fmt));
 const {referenceState,...backdated}={...t.review(2,0,'WEEKLY_REVIEW')};
 const early=F.evaluateProgram(t.p,backdated,DEV);assert.deepEqual([early.runFormatRecord.length,Object.keys(early.runSessions).length],[size,0]);assert.ok(['REVIEW_BEFORE_THE_RECORD','NO_DECISION'].includes(early.runFormat.reason));
 const malformed=F.evaluateProgram(t.p,{...t.review(3,0,'WEEKLY_REVIEW'),observations:'x'},DEV);assert.deepEqual([malformed.status,malformed.runFormatRecord.length,Object.keys(malformed.runSessions).length],['HOLD',size,0]);
});
test('QRE-RWS-A-06 (M03, M04): a correction merged from two sources is the correction it is, and never pace evidence; a format that expresses another dose credits nothing by distance',()=>{
 // M03: the app report declares 16 km with a listed reason and has no distance; the device import of the same session measured 15.6 km, GPS OK.
 // The engine merges them into one row. It is read by its facts, as the same correction sent in one report (WE3A-02): met as a confirmed
 // correction, its reliability POOR, and the calibration is never handed its distance (fix-forward, QRE-RWS-B-01: no mark has to survive).
 const t=atSixteen(),app=nativeReport(t,t.long,{minutes:96,rpe:4,actual:{declared:{distanceKm:16,reason:'SIGNAL_LOSS'}}});
 const device={eventId:'rw-device',athleteId:t.p.athleteId,sessionId:t.long.id,occurrenceDate:t.long.date,source:{provider:'HEALTHKIT',activityId:'hk-long',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:96,distanceKm:15.6,measurement:'GPS',gpsQuality:'OK'}};
 t.week(1,s=>s.id===t.long.id?app:asPrescribed(t,s),{});t.step(2,0,'WEEKLY_REVIEW',{observations:[device]});
 const row=t.row(t.long.id);assert.deepEqual([row.actual.distanceKm,row.actual.gpsQuality,row.actual.declared.reason],[15.6,'OK','SIGNAL_LOSS'],'one merged row');
 const m=exec(t,t.long.id);assert.deepEqual([m.status,m.basis,m.paceEvidence,m.reliability,m.extentKm,row.partial],['DISTANCE','CONFIRMED_CORRECTION',false,'POOR',15.6,false]);
 assert.deepEqual(t.state.paceEvidenceWithheld.map(x=>[x.sessionId,x.reason]),[[t.long.id,'CORRECTED_MEASUREMENT']]);
 assert.ok(F.admitted(t.ledger,{athleteId:t.p.athleteId},VALUES).ledger.every(o=>o.sessionId!==t.long.id||o.fact||o.superseded||!('distanceKm' in o.actual)&&o.actual.gpsQuality==='POOR'),'what the calibration is handed');
 // Below the floor it is no correction, merged or not (WE3A-04).
 const far=atSixteen(),low={...device,actual:{...device.actual,distanceKm:14}};far.week(1,s=>s.id===far.long.id?nativeReport(far,far.long,{minutes:96,rpe:4,actual:{declared:{distanceKm:16,reason:'SIGNAL_LOSS'}}}):asPrescribed(far,s),{});far.step(2,0,'WEEKLY_REVIEW',{observations:[low]});
 assert.deepEqual([exec(far,far.long.id).status,exec(far,far.long.id).ask,far.row(far.long.id).partial],['UNKNOWN','MEASURE_THE_MISSING_PART',true]);
 // M04: a self-consistent row that says it expresses another planned prescription, cited by a fast 16 km: the minutes read (85 of 100).
 const u=atSixteen(),real=u.fmt.find(r=>r.sessionId===u.long.id),other=forge(real,{plannedPrescriptionHash:'f'.repeat(64)}),o=nativeReport(u,u.long,{minutes:85,km:16,rpe:4,actual:{formatHash:other.formatHash}});
 u.fmt=[...u.fmt,other];u.week(1,weekWith(u,1,u.long.id,o));
 assert.deepEqual([u.row(u.long.id).partial,exec(u,u.long.id).status],[true,'TIME'],'no credit by distance for a dose the session does not plan');
 const same=atSixteen();same.week(1,weekWith(same,1,same.long.id,nativeReport(same,same.long,{minutes:85,km:16,rpe:4})));assert.equal(same.row(same.long.id).partial,false);
});
test('QRE-RWS-A-06 (M08, M17), A-08: a run recorded this week sizes nothing this week; a reader that fails, or says done for a report that says not done, completes nothing',()=>{
 // M08: the long run of week 0 is reported late, on the Wednesday of week 1. Week 1 keeps reading the record as its Monday found it.
 const t=timeline(sixteen()),w0=t.runsOf(0),long0=w0.find(s=>s.role==='LONG');
 t.step(0,6,'WEEKLY_REVIEW',{observations:t.p.weeks[0].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.id!==long0.id).map(s=>report(t.p,s,s.sport==='RUN'?paced(s):{}))});
 const long1=t.runsOf(1,s=>s.role==='LONG')[0];assert.equal(t.runs[long1.id].unavailable.native,'LONG_HISTORY_NOT_COMPARABLE');
 t.step(1,2,'WEEKLY_REVIEW',{observations:[report(t.p,long0,paced(long0))]});
 const runs=runHistory({ledger:t.ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180},VALUES).runs,late=runs.find(r=>r.sessionId===long0.id),week1=t.p.weeks[1].startDate,week2=t.p.weeks[2].startDate;
 assert.ok(late.date<week1&&late.recordedOn>=week1,'dated before the week, recorded inside it');
 assert.equal(comparableLongRun(runs,{cutoff:week1,weekStart:week1,minutes:100},VALUES),null);assert.equal(comparableLongRun(runs,{cutoff:week2,weekStart:week2,minutes:100},VALUES)?.runId,late.id);
 if(t.p.weeks[1].sessions.find(s=>s.id===long1.id)?.plannedPrescriptionHash===long1.plannedPrescriptionHash)assert.notEqual(t.runs[long1.id].expression,'NATIVE','this week reads what its first day found');
 // M17 and A-08, on the frozen entry point with the key (development only): the engine's own guards.
 const v=()=>{const u=timeline(sixteen(),{entry:V1,opts:{eventExtension:DEV.eventExtension}});u.week(0,paced);return u;};
 const a=v(),la=a.p.weeks[1].sessions.find(s=>s.role==='LONG'),onTime={...report(a.p,la,{}),actual:{completed:true,minutes:100}};
 a.opts={eventExtension:DEV.eventExtension,[READS_COMPLETION]:()=>{throw new Error('reader');}};a.step(1,6,'WEEKLY_REVIEW',{observations:[onTime]});
 assert.equal(a.row(la.id).partial,true,'a reader that fails classifies nothing as complete, even a session its minutes would complete');
 const b=v(),lb=b.p.weeks[1].sessions.find(s=>s.role==='LONG');b.opts={eventExtension:DEV.eventExtension,[READS_COMPLETION]:()=>'DISTANCE'};
 b.step(1,6,'WEEKLY_REVIEW',{observations:[{...report(b.p,lb,{}),actual:{completed:false,minutes:100}}]});assert.equal(b.row(lb.id).partial,true,'DISTANCE never completes a report that says not completed');
 const c=v(),lc=c.p.weeks[1].sessions.find(s=>s.role==='LONG');c.opts={eventExtension:DEV.eventExtension,[READS_COMPLETION]:()=>({status:'DISTANCE'})};
 c.step(1,6,'WEEKLY_REVIEW',{observations:[{...report(c.p,lc,{}),actual:{completed:true,minutes:50}}]});assert.equal(c.row(lc.id).partial,true,'anything but a status is no reading: the minutes read');
});
test('QRE-RWS-A-07, A-10: under a clinical route the sessions say they are not prescribed; a malformed development authority turns the boundary off',()=>{
 const t=atSixteen(),r=t.step(1,2,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(1,2),{pain:true})});
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.runFormat.prescribing,false);
 const ahead=Object.values(r.runSessions).filter(s=>!s.past);assert.ok(ahead.length>0&&ahead.every(s=>s.prescribed===false&&s.expression==='TIME'&&s.unavailable.native==='CLINICAL_ROUTE'));
 const ok=atSixteen();assert.ok(Object.values(ok.runs).filter(s=>!s.past).every(s=>s.prescribed===true)&&ok.state.prescribing===true);
 for(const values of [{},{tied:{}},null,'x']){const off=F.evaluateProgram(ok.p,ok.review(1,0,'WEEKLY_REVIEW'),{...DEV,runFormats:{...DEV.runFormats,values}});assert.deepEqual([off.runFormat.status,Object.keys(off.runSessions).length],['DISABLED',0]);assert.ok(off.status);}
});
test('SSCTR-RWS-A-01, SEC-RWS-A-05: a stop for a symptom is read on every run report: by time, or citing a format of another dose, it still asks for the screen',()=>{
 for(const stop of [{reason:'SYMPTOM'},{},{reason:'not on the list'}]){
  const t=atSixteen(),byTime={...report(t.p,t.long,{}),actual:{completed:false,minutes:40,stop}};
  t.week(1,weekWith(t,1,t.long.id,byTime));
  assert.deepEqual([exec(t,t.long.id).status,exec(t,t.long.id).stop.reason,t.state.warningSignScreen.status],['TIME','SYMPTOM','REQUIRED']);
  for(const s of t.runsOf(2))assert.equal(t.runs[s.id].unavailable.native,'WARNING_SIGN_SCREEN_REQUIRED');
 }
 const f=atSixteen(),fatigue={...report(f.p,f.long,{}),actual:{completed:false,minutes:40,stop:{reason:'FATIGUE'}}};f.week(1,weekWith(f,1,f.long.id,fatigue));
 assert.deepEqual([f.state.warningSignScreen.status,f.state.offers.map(o=>o.kind)],['NOT_RAISED_BY_THIS_EXTENSION',['SYSTEMIC_FATIGUE_REVIEW']]);
 // The engine's reading of a session by time is its own, unchanged: only the extension's state reads the stop.
 const plain=timeline(sixteen(),{entry:X,opts:FORMATS_OFF});plain.week(0,paced);const lp=plain.p.weeks[1].sessions.find(s=>s.role==='LONG');
 plain.step(1,6,'WEEKLY_REVIEW',{observations:[{...report(plain.p,lp,{}),actual:{completed:false,minutes:40,stop:{reason:'SYMPTOM'}}}]});
 const mine=atSixteen();mine.step(1,6,'WEEKLY_REVIEW',{observations:[{...report(mine.p,mine.long,{}),actual:{completed:false,minutes:40,stop:{reason:'SYMPTOM'}}}]});
 assert.equal(hash(mine.row(mine.long.id)),hash(plain.row(lp.id)),'byte-identical row');
});
test('SSCTR-RWS-A-02: a distance typed by the athlete on any planned run is never a measurement: no easy-pace observation, no band, no sizing',()=>{
 const intake=runner({id:'rw-typed',weeks:8}),typed=(t,s,x)=>({...report(t.p,s,{rpe:4}),actual:{completed:true,minutes:s.prescription.durationMinutes,rpe:4,distanceKm:Math.round(s.prescription.durationMinutes*60/300*100)/100,...x}});
 const run=(entry,opts,x)=>{const t=timeline(intake,{entry,opts});for(let w=0;w<3;w++)t.week(w,s=>s.role==='EASY'?typed(t,s,x):paced(s));return t;};
 for(const x of [{measurement:'MANUAL'},{}]){
  const frozen=run(X,FORMATS_OFF,x),mine=run(F,DEV,x),row=mine.ledger.find(o=>o.context?.family==='EASY');
  assert.equal(frozen.cal.paceBands.EASY.status,'AVAILABLE','the frozen calibration reads a typed figure as an easy pace (5:00 per km here)');assert.equal(frozen.cal.paceBands.EASY.fastSecondsPerKm,300);
  assert.equal(mine.cal.paceBands.EASY.status,'UNAVAILABLE','through this entry point it is kept beside, and observed by nothing');
  assert.deepEqual([row.actual.distanceKm,row.actual.manualDistanceKm>0,mine.cal.assessment.progress.easyRuns.count],[undefined,true,0]);
  assert.ok(mine.runsOf(3,s=>s.role==='EASY').every(s=>mine.runs[s.id].expression==='TIME'));
  assert.equal(runHistory({ledger:mine.ledger,record:[],athleteId:mine.p.athleteId,tz:-180},VALUES).runs.find(r=>r.eventId===row.eventId).referenceKm,row.actual.manualDistanceKm,'still the athlete\'s own figure as history');
 }
 // A device distance stays a measurement (stated, or carried by a device activity), and so does a race's own result.
 const gps=run(F,DEV,{measurement:'GPS'});assert.equal(gps.cal.paceBands.EASY.status,'AVAILABLE');assert.ok(gps.ledger.find(o=>o.context?.family==='EASY').actual.distanceKm>0);
});
test('SSCTR-RWS-A-03, QRE-RWS-A-06 (M06): the pause counts what the decisions count: an aborted time session and a short reading with no answer neither count nor reset',()=>{
 const f=select(input({s:session({family:'EASY',minutes:50}),fast:340,slow:405,available:60,history:{p1:{fastSecondsPerKm:340,slowSecondsPerKm:370},l30:{km:15.5},comparable:null,latest:null,pausedUntil:null}}));
 const row=(date,actual,format=f,partial=false)=>({date,actual,execution:executionOf({eventId:date,actual,partial,provenance:{sourceQuality:'MANUAL'}},format,VALUES)});
 const above=d=>row(d,{completed:true,minutes:53,distanceKm:8,measurement:'GPS'}),inside=d=>row(d,{completed:true,minutes:47,distanceKm:8,measurement:'GPS'});
 const aborted=d=>row(d,{completed:true,minutes:5},null,true),timeDone=d=>row(d,{completed:true,minutes:50},null,false),timeStopped=d=>row(d,{completed:true,minutes:50,stop:{reason:'CHOICE'}},null,false);
 const short=d=>row(d,{completed:true,minutes:47,distanceKm:7.6,measurement:'GPS'}),cut=d=>row(d,{completed:true,minutes:47,distanceKm:8.1,measurement:'GPS',declared:{distanceKm:7}});
 const until=rows=>pausedUntil(rows,VALUES,onDate);
 assert.equal(until([above('2026-12-01'),aborted('2026-12-03'),above('2026-12-05')]),'2027-01-02','an aborted time session does not start the count again');
 assert.equal(until([above('2026-12-01'),timeStopped('2026-12-03'),above('2026-12-05')]),'2027-01-02','nor one with a declared stop');
 assert.equal(until([above('2026-12-01'),timeDone('2026-12-03'),above('2026-12-05')]),null,'a time session the engine reads as complete does');
 assert.equal(until([above('2026-12-01'),inside('2026-12-03'),above('2026-12-05')]),null);
 assert.deepEqual([short('x').execution.status,short('x').execution.countsForPause,cut('x').execution.countsForPause],['PARTIAL',false,true]);
 assert.equal(until([above('2026-12-01'),short('2026-12-03')]),null,'a short reading with no answer does not count');
 assert.equal(until([above('2026-12-01'),short('2026-12-03'),above('2026-12-05')]),'2027-01-02','and does not reset: the pause dates from the third run');
 assert.equal(until([above('2026-12-01'),cut('2026-12-03')]),'2026-12-31','a shortfall the athlete states does count');
});
test('SSCTR-RWS-A-04, A-05, A-09: repetitions shorter than five minutes are never pace evidence; the repetition texts say what every distance session must',()=>{
 const reps=(family,step,fast,slow,ladderStep)=>select(input({s:session({family,step,ladderStep}),fast,slow,weekIndex:0}));
 const done=(format,boutMinutes)=>executionOf({eventId:'e',partial:false,provenance:{sourceQuality:'MANUAL'},actual:{completed:true,minutes:45,measurement:'GPS',steps:flatSteps(format.blocks).filter(s=>s.kind==='WORK').map(s=>({block:s.block,rep:s.rep,kind:'WORK',targetMet:true}))}},format,VALUES,{boutMinutes});
 const eight=reps('TEN_K_SPECIFIC',{repetitions:6,workMinutes:4,recoveryMinutes:2},290,300,3),thousand=reps('THRESHOLD',{repetitions:5,workMinutes:5,recoveryMinutes:2},290,300,2);
 assert.deepEqual([done(eight,4).status,done(eight,4).basis,done(eight,4).paceEvidence],['DISTANCE','LAP',false],'6 x 800 m at four minutes each');
 assert.deepEqual([done(thousand,5).paceEvidence,done(thousand,null).paceEvidence,VALUES.tied.calibrationBoutMinutesMin],[true,false,5]);
 for(const text of [VALUES.texts.repetitionStop,VALUES.texts.effortGoverns,VALUES.texts.repetitionEstimate,VALUES.texts.timeVersion])assert.ok(eight.instructions.includes(text),text);
 assert.ok(eight.instructions.some(x=>/^Whole session about \d+(-\d+)? min \(estimate\)$/.test(x)),'the estimated duration is said, as an estimate');assert.match(VALUES.texts.repetitionStop,/stop at any time.*recorded.*walking/);
 // A-09: the history reads a stop's reason as the reader does: any reason outside the list is a symptom, and never sizes the next run.
 const t=atSixteen();t.week(1,weekWith(t,1,t.long.id,nativeReport(t,t.long,{minutes:75,km:12,completed:false,actual:{stop:{reason:'whatever'}}})));
 assert.equal(runHistory({ledger:t.ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180},VALUES).runs.find(r=>r.sessionId===t.long.id).stopReason,'SYMPTOM');
});
