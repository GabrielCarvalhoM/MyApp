// V1 Run Workout Structure, post-freeze patch of QRE-RWS-E-01 (Founder mission of 2026-11-15, after COACHINGCORE-V1-RUN-FORMAT-FREEZE-1).
// The finding, as the Quality judge of the lineage round stated it (QRE_V1RWS_LINEAGE_R5, E-01) and the SSCTR bound it (the enabling record's
// condition): on a row that carries no distance, a reason of the row whole (REPORT_NOT_CARRIED, REPORTS_UNREADABLE) was hidden when the row's
// own reports gave a reason of the distance (SEVERAL_RECORDINGS, CORRECTED_MEASUREMENT, DURATION_REQUIRED, DISTANCE_DISPUTED). The reading
// gave one word, the reason of the distance first; a reason of the distance withholds nothing where there is no distance; so the row went to
// the readers of pace whole, with its work pace, though a report still in force for its session was none of the reports it was made of.
// The rule is not changed here (SSCTR lineage items L1 and L2, the precedence of the one word, the frozen calibration): the reading now gives
// the reason of the row whole apart (`wholeRow`), and a row with no distance is withheld by it, whatever its own reports say of a distance.
// Every scenario is a conforming client of the composed entry point unless it says it builds or alters a record. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,DEV,FORMATS_OFF,VALUES as V,ELIG,hash,report,timeline,atSixteen,sixteen,nativeReport,weekWith,asPrescribed,live,raceTen} from './v1rws-helpers.mjs';
import {runCalibrationOf as frozenCalibration} from '../src/v1-run-calibration.mjs';
import {readReportFacts,reportsReading,reportsVerdict,reportFactOf,appendReportFacts,sourcesOf,executionOf,RUN_REPORT_RECEIVED} from '../src/v1-run-format.mjs';
import {distanceFacts,runHistory,latestClassRun,PACE_WITHHELD,WHOLE_ROW_WITHHELD} from '../src/v1-run-history.mjs';
import {utcTimestamp} from '../src/r6-provenance.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const NOT_CARRIED='REPORT_NOT_CARRIED',UNREADABLE='REPORTS_UNREADABLE',SEVERAL='SEVERAL_RECORDINGS',CORRECTED='CORRECTED_MEASUREMENT';
const isReport=r=>r?.fact===RUN_REPORT_RECEIVED;
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const edges=cal=>Object.fromEntries(Object.entries(cal.paceBands).map(([k,b])=>[k,[b.status,b.fastSecondsPerKm??null,b.slowSecondsPerKm??null]]));
const withheldOf=(r,ids)=>(r.runFormat.paceEvidenceWithheld??[]).filter(x=>ids.includes(x.sessionId)).map(x=>x.reason);
const shuffled=a=>{const b=[...a];for(let i=b.length-1,seed=7;i>0;i--){seed=(seed*1103515245+12345)%2147483648;const j=seed%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
const device=(t,q,actual,id='dev-'+q.id,activity='hk-'+q.id)=>({eventId:id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:activity,source:{provider:'HEALTHKIT',activityId:activity,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,...actual},response:UNKNOWN});

// ---------- the athlete of the judge's probe (q5-workpace2) ----------
const STATE=['p','ledger','ref','ev','fmt','hist','runs','cal','state','n'];
let BASE=null;
/** The experienced runner after weeks 0 to 2 as prescribed: a client that restores what it stored, through JSON. */
function base(){
 if(!BASE){const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));BASE=JSON.stringify(Object.fromEntries(STATE.map(k=>[k,t[k]])));}
 const t=timeline(sixteen());Object.assign(t,JSON.parse(BASE));return t;
}
/** What the athlete's correction of their own report adds: nothing, a further recording, a declaration with a listed failure reason, both. */
const EXTRA={plain:{},lists:{segments:[{distanceKm:4,measurement:'GPS'}]},declares:{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}},'lists and declares':{segments:[{distanceKm:4,measurement:'GPS'}],declared:{distanceKm:9,reason:'SIGNAL_LOSS'}}};
const MASKED=[['lists',SEVERAL],['declares',CORRECTED],['lists and declares',SEVERAL]],PACE=255,POOR={distanceKm:9,measurement:'GPS',gpsQuality:'POOR'};
const ORDERS=['one review','one review, the import listed first','the app, then the import','the import, then the app'];
/**
 * The harder session of weeks 3 to 6: the athlete reports its work pace (255 s/km, effort 7: faster than the band at an effort inside the cue)
 * and the watch import of the same session brings `watch` (by default a distance its GPS flagged POOR). `how` is what the athlete's correction
 * of their own report adds (null: no correction). `late`: each correction arrives in the middle of the following week. `laps`: a native
 * session is reported by its laps. `watch: null`: no import, the athlete alone. `first`: what the athlete's first report states beside.
 * `more(t,q)`: one more report of the session, sent after the two. `holdLast`: the correction of week 6 is not sent, and is returned
 * (`held`). Then every week to `until` as prescribed.
 */
function quality(how,{order='one review',late=false,laps=false,watch=POOR,first={},more=null,holdLast=false,until=7}={}){
 const t=base(),seen=[],pending=[];let held=null;
 const flush=w=>{if(pending.length)t.step(w,2,'WEEKLY_REVIEW',{observations:pending.splice(0).map(o=>({...o,correctedAt:`${t.day(w,2)}T09:00:00-03:00`}))},'10:00');};
 for(const w of [3,4,5,6]){
  flush(w);
  const q=t.runsOf(w,s=>s.role==='QUALITY')[0],run=t.runs[q.id],rest=t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==q.id).map(s=>plain(t,s)),day=t.day(w,6);
  const said=laps&&run.expression==='NATIVE'?nativeReport(t,q,{rpe:7,actual:{work:{paceSecondsPerKm:PACE}}}):(b=>({...b,actual:{...b.actual,formatHash:run.timeFormatHash}}))(report(t.p,q,{workPace:PACE,rpe:7}));
  const a1={...said,eventId:'app-'+q.id,actual:{...said.actual,...first}},d1=watch?device(t,q,watch):null;
  if(!d1||order==='one review')t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,a1,...(d1?[d1]:[])]},'18:00');
  else if(order==='one review, the import listed first')t.step(w,6,'WEEKLY_REVIEW',{observations:[d1,...rest,a1]},'18:00');
  else if(order==='the app, then the import'){t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,a1]},'17:00');t.step(w,6,'WEEKLY_REVIEW',{observations:[d1]},'18:00');}
  else{t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,d1]},'17:00');t.step(w,6,'WEEKLY_REVIEW',{observations:[a1]},'18:00');}
  if(how!==null){const a2={...a1,eventId:a1.eventId+'-v2',actual:{...a1.actual,...EXTRA[how]},correctionOf:a1.eventId,correctedAt:`${day}T19:30:00-03:00`};if(holdLast&&w===6)held=a2;else if(late)pending.push(a2);else t.step(w,6,'WEEKLY_REVIEW',{observations:[a2]},'20:00');}
  if(more)t.step(w,6,'WEEKLY_REVIEW',{observations:[more(t,q)]},'21:00');
  seen.push(q.id);
 }
 let r=null;for(let w=7;w<=until;w++){flush(w);r=t.week(w,weekWith(t,w,null,null));}
 return {t,r,seen,until,held};
}
/** The frozen calibration with the arguments v1-run-index.mjs gives it for the weekly review of week `w`, over the record given. */
const frozenOver=(m,ledger,w=m.until)=>frozenCalibration({program:m.t.p,ledger,evidenceRecord:m.r.runEvidenceRecord,asOf:utcTimestamp(`${m.t.day(w,6)}T20:00:00-03:00`),weekIndex:w,hold:false,engineStatus:m.r.status,eligibility:ELIG(m.t.day(w,6))},DEV);
const factsOf=m=>readReportFacts(m.r.runFormatRecord,m.t.p.athleteId,V,m.r.actualLedger);
const liveRow=(m,id)=>m.r.actualLedger.find(o=>!o.fact&&!o.superseded&&o.sessionId===id);
const planOf=m=>hash(m.t.p.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.plannedPrescriptionHash,s.prescription?.durationMinutes??null])));
const THRESHOLD='THRESHOLD_CONTROLLED',CONTROL={};
const control=(key='7',o={})=>CONTROL[key]??=quality(null,o);

test('QRE-RWS-E-01 reproduced and closed: a row with no distance whose own report gives a reason of the distance is still withheld when a report in force is not on it, and its work pace no longer moves the threshold band',()=>{
 const merged=control(),plainly=quality('plain');
 // The control and the half the frozen candidate already closed: merged, the row is the watch's flag and the athlete's work pace, not comparable;
 // corrected with nothing more, the row is the correction alone and is withheld.
 assert.deepEqual([withheldOf(merged.r,merged.seen),edges(merged.r.runCalibration)[THRESHOLD],merged.r.runCalibration.capacity.trainingFactors],[[],['AVAILABLE',300,335],{}]);
 assert.deepEqual([withheldOf(plainly.r,plainly.seen),plainly.r.runCalibration.hash],[Array(4).fill(NOT_CARRIED),merged.r.runCalibration.hash]);
 for(const [how,word] of MASKED){
  const m=quality(how),facts=factsOf(m);
  for(const id of m.seen){
   const row=liveRow(m,id),reading=reportsReading(row,facts,V);
   // The record, as the judge found it: the frozen engine retired the merged row whole; the row in force is the athlete's correction alone,
   // with a work pace, no distance and no flag. The watch's report still stands and is none of the reports the row was made of.
   assert.deepEqual([row.eventId,'distanceKm' in row.actual,row.actual.gpsQuality??null,row.actual.work,sourcesOf(row),[...facts.inForce(id).ids].sort()],[`app-${id}-v2`,false,null,{paceSecondsPerKm:PACE},[`app-${id}-v2`],[`app-${id}-v2`,`dev-${id}`]],how);
   // The one word is the reason of the distance, as before; the reason of the row whole is given apart, and it is the one that withholds.
   assert.deepEqual([reading.withheld,reading.wholeRow,distanceFacts(row.actual,V,{reports:reading}).paceWithheld,distanceFacts(row.actual,V,{reports:reading.withheld}).paceWithheld],[word,NOT_CARRIED,NOT_CARRIED,null],how+': the word alone is what hid it');
  }
  // The defect, still there for a reader of the bare record: the frozen calibration reads the work pace of the two last sessions as comparable
  // and takes a training step up, 10 s/km faster at threshold (the finding).
  const bare=frozenOver(m,m.r.actualLedger);
  assert.deepEqual([edges(bare)[THRESHOLD],bare.capacity.trainingFactors[THRESHOLD].fraction,bare.capacity.trainingFactors[THRESHOLD].sessions.map(s=>[s.eventId,s.secondsPerKm,s.rpe])],[['AVAILABLE',290,325],0.03,[5,6].map(w=>[`app-w${w}-run-d1-v2`,PACE,7])],how+': the bare record moves the frozen calibration');
  // Closed: the four rows are withheld, by the reason of the row whole, and the calibration is the control's, byte for byte.
  assert.deepEqual([withheldOf(m.r,m.seen),m.r.runCalibration.hash,edges(m.r.runCalibration),m.r.runCalibration.capacity.trainingFactors],[Array(4).fill(NOT_CARRIED),merged.r.runCalibration.hash,edges(merged.r.runCalibration),{}],how);
  // The calibration is the frozen one, over the record as admitted: no reader of it was changed. What is handed keeps the work pace and is
  // marked POOR, without its distance (there is none); the record the caller keeps is not rewritten.
  const adm=F.admitted(m.r.actualLedger,{athleteId:m.t.p.athleteId,facts},V),handed=adm.ledger.find(o=>o.eventId===`app-${m.seen[0]}-v2`),kept=liveRow(m,m.seen[0]);
  assert.deepEqual([m.r.runCalibration.hash,handed.actual.gpsQuality,handed.actual.work,kept.actual.gpsQuality??null,handed===kept],[frozenOver(m,adm.ledger).hash,'POOR',{paceSecondsPerKm:PACE},null,false],how);
  // The session is what the engine made of it: complete, credited as before, the plan the control's. Only its pace evidence is withheld.
  assert.deepEqual([m.seen.map(id=>{const e=m.r.runSessions[id].execution;return [e.completed,e.status,e.paceWithheld];}),planOf(m),m.r.status],[Array(4).fill([true,'TIME',NOT_CARRIED]),planOf(merged),merged.r.status],how);
 }
});

test('E-01, the rule on records built by hand: whatever reason of the distance the row\'s own reports give, a reason of the row whole withholds a row with no distance; a row with a distance reads as before',()=>{
 const A='a',AT=h=>`2026-12-01T${String(h).padStart(2,'0')}:00:00.000Z`;
 const said=(eventId,x={})=>({eventId,sessionId:'s',...(x.device?{source:{provider:'HEALTHKIT',activityId:x.device,quality:'WEARABLE_FULL'}}:{}),actual:{completed:true,minutes:45,...(x.actual??{})}});
 const record=(...steps)=>steps.reduce((rec,[hour,...os])=>appendReportFacts(rec,os.map(o=>reportFactOf(o,V,{fromDevice:!!o.source})),{athleteId:A,recordedAt:AT(hour)},V).record,[]);
 const line=(eventId,x={})=>({eventId,athleteId:A,sessionId:'s',localDate:'2026-12-01',partial:false,actual:{completed:true,minutes:45,...(x.actual??{})},response:UNKNOWN,context:{sport:'RUN',family:'THRESHOLD',mode:'EASY',sessionId:'s'},provenance:{sourceQuality:x.wearable?'WEARABLE_FULL':'MANUAL',...(x.merged?{mergedSourceIds:x.merged}:{})},...(x.by?{superseded:true,supersededBy:x.by}:{})});
 const work={work:{paceSecondsPerKm:270},rpe:7},watch=said('d1',{device:'hk-1',actual:{distanceKm:9,measurement:'GPS',gpsQuality:'POOR'}});
 const read=(rec,ledger,id)=>{const facts=readReportFacts(rec,A,V,ledger),row=ledger.find(o=>o.eventId===id),reading=reportsReading(row,facts,V),adm=F.admitted(ledger,{athleteId:A,facts},V),handed=adm.ledger.find(o=>o.eventId===id);
  return [reading.withheld,reading.wholeRow,adm.withheld.map(w=>w.reason),handed.actual.gpsQuality??null,handed.actual.work??null,adm.ledger===ledger];};
 // The row in force is the athlete's correction alone, with no distance; the watch's report is in force and not on it. Each reason of the
 // distance the correction can state of itself: it lists a recording; it declares with a listed failure reason; it states two figures of its
 // own that dispute. And with none (the half the frozen candidate closed).
 const mergedRow=line('a1',{merged:['a1','d1'],by:'a2',wearable:true,actual:{distanceKm:9,measurement:'GPS',gpsQuality:'POOR',...work}});
 for(const [what,extra,word] of [['plain',{},NOT_CARRIED],['lists',{segments:[{distanceKm:4,measurement:'GPS'}]},SEVERAL],['declares',{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}},CORRECTED],['two figures of its own',{declared:{distanceKm:9}},NOT_CARRIED]]){
  const a1=said('a1',{actual:work}),a2=said('a2',{actual:{...work,...extra}}),ledger=[mergedRow,line('a2',{actual:{...work,...extra}})];
  assert.deepEqual(read(record([10,a1,watch],[11,a2]),ledger,'a2'),[word,NOT_CARRIED,[NOT_CARRIED],'POOR',work.work,false],what);
 }
 // A merged row with no distance, made of two reports whose own figures dispute (10 km and 5 km, neither measured), or of a report that
 // measured a distance with no duration of its own, and a third report the engine refused: the same.
 const third=said('g1',{device:'gar-1',actual:{minutes:70}});
 const disputing=[said('a1',{actual:{...work,declared:{distanceKm:10}}}),said('m1',{actual:{declared:{distanceKm:5}}})],both=line('a1',{merged:['a1','m1'],actual:{...work,declared:{distanceKm:10}}});
 assert.deepEqual(read(record([10,...disputing,third]),[both],'a1'),['DISTANCE_DISPUTED',NOT_CARRIED,[NOT_CARRIED],'POOR',work.work,false]);
 const untimed={eventId:'u1',sessionId:'s',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,distanceKm:9,measurement:'GPS'}},lost=line('a1',{merged:['a1','u1'],actual:work});
 assert.deepEqual(read(record([10,said('a1',{actual:work}),untimed,third]),[lost],'a1'),['DURATION_REQUIRED',NOT_CARRIED,[NOT_CARRIED],'POOR',work.work,false]);
 // The record of reports that cannot be read whole is the other reason of the row: it is not hidden either.
 const listing=said('a1',{actual:{...work,segments:[{distanceKm:4,measurement:'GPS'}]}}),alone=[line('a1',{actual:{...work,segments:[{distanceKm:4,measurement:'GPS'}]}})],broken=[...record([10,listing]),{fact:RUN_REPORT_RECEIVED,eventId:'x',athleteId:A}];
 assert.deepEqual(read(broken,alone,'a1'),[SEVERAL,UNREADABLE,[UNREADABLE],'POOR',work.work,false]);
 // Both reasons of the row at once: the one that is shown is the report not carried, as it was on a row with a distance.
 assert.deepEqual(read([...record([10,listing,watch]),broken.at(-1)],alone,'a1').slice(0,3),[SEVERAL,NOT_CARRIED,[NOT_CARRIED]]);
 assert.deepEqual(read([...record([10,said('a1',{actual:work}),watch]),broken.at(-1)],[line('a1',{actual:work})],'a1').slice(0,3),[NOT_CARRIED,NOT_CARRIED,[NOT_CARRIED]]);
 // Legitimate evidence is kept: a row with no distance that carries every report in force is handed over as it is, whatever its own report
 // says of a distance (a reason of the distance withholds a distance, and there is none); the record itself is returned.
 assert.deepEqual(read(record([10,listing]),alone,'a1'),[SEVERAL,null,[],null,work.work,true]);
 assert.deepEqual(read(record([10,said('a1',{actual:work}),said('d1',{device:'hk-1',actual:{}})]),[line('a1',{merged:['a1','d1'],actual:work})],'a1'),[null,null,[],null,work.work,true]);
 // A row with a distance reads as it did: its own reasons first, any reason withholds it, and the word shown is the one it was.
 const far=line('a1',{merged:['a1','d1'],wearable:true,actual:{distanceKm:9,measurement:'GPS',segments:[{distanceKm:4,measurement:'GPS'}],...work}}),a3=said('a3',{actual:work});
 assert.deepEqual(read(record([10,listing,said('d1',{device:'hk-1',actual:{distanceKm:9,measurement:'GPS'}})],[11,a3]),[far],'a1').slice(0,4),[SEVERAL,NOT_CARRIED,[SEVERAL],'POOR']);
 // The reader of the row: the reason of the row is read from `wholeRow`, or from the word when it is one; a word that is a reason of the
 // distance says nothing of the row whole; a reading built with the word alone reads as before.
 const none={completed:true,minutes:45,...work},pw=(actual,reports)=>distanceFacts(actual,V,{reports}).paceWithheld,has={...none,distanceKm:9,measurement:'GPS'};
 assert.deepEqual([pw(none,{withheld:SEVERAL,wholeRow:NOT_CARRIED}),pw(none,{withheld:CORRECTED,wholeRow:UNREADABLE}),pw(none,{withheld:NOT_CARRIED}),pw(none,NOT_CARRIED),pw(none,UNREADABLE),pw(none,SEVERAL),pw(none,{withheld:SEVERAL,wholeRow:null}),pw(none,{withheld:SEVERAL,wholeRow:SEVERAL}),pw(none,{withheld:null,wholeRow:'ANYTHING'}),pw(none,null)],
  [NOT_CARRIED,UNREADABLE,NOT_CARRIED,NOT_CARRIED,UNREADABLE,null,null,null,null,null]);
 assert.deepEqual([pw(has,{withheld:SEVERAL,wholeRow:NOT_CARRIED}),pw(has,{withheld:NOT_CARRIED,wholeRow:NOT_CARRIED}),pw(has,{withheld:null,wholeRow:NOT_CARRIED}),pw(has,SEVERAL),pw(has,null),pw({...has,segments:[{distanceKm:1,measurement:'GPS'}]},{withheld:NOT_CARRIED,wholeRow:NOT_CARRIED})],[SEVERAL,NOT_CARRIED,NOT_CARRIED,SEVERAL,null,SEVERAL]);
 assert.deepEqual([[...WHOLE_ROW_WITHHELD],[...PACE_WITHHELD]],[[NOT_CARRIED,UNREADABLE],[SEVERAL,CORRECTED,'DURATION_REQUIRED','DISTANCE_DISPUTED',NOT_CARRIED,UNREADABLE]],'no reason was added, removed or reordered');
});

test('E-01 in every order of arrival, with a late correction, and on a merged row that does not carry a report the engine refused',()=>{
 const merged=control();
 // The app's report and the import in one review (either listed first) or in two, in both orders; then the athlete's correction.
 for(const order of ORDERS){
  const m=quality('lists',{order});
  assert.deepEqual([withheldOf(m.r,m.seen),edges(m.r.runCalibration),m.r.runCalibration.capacity.trainingFactors,edges(frozenOver(m,m.r.actualLedger))[THRESHOLD]],[Array(4).fill(NOT_CARRIED),edges(merged.r.runCalibration),{},['AVAILABLE',290,325]],order);
 }
 // The correction arrives in the middle of the following week: withheld from that review on, the week it comes into force and after.
 const late=quality('declares',{late:true,until:8}),on=control('8',{until:8}),bare=frozenOver(late,late.r.actualLedger);
 assert.deepEqual([withheldOf(late.r,late.seen),edges(late.r.runCalibration),late.r.runCalibration.hash,edges(bare)[THRESHOLD],bare.capacity.trainingFactors[THRESHOLD]?.fraction],[Array(4).fill(NOT_CARRIED),edges(on.r.runCalibration),on.r.runCalibration.hash,['AVAILABLE',290,325],0.03]);
 // A merged row that is not all that was said: the athlete's report (a work pace, a further recording listed, no distance) and a watch
 // import with minutes only merge into one row with no distance. The import then sends a correction the engine refuses (dated before the
 // session): it stays in force, on no row. The row's own report lists a recording, which hid it.
 const watch={},first={segments:[{distanceKm:4,measurement:'GPS'}]},refused=(t,q)=>({...device(t,q,{},`dev-${q.id}-v2`),correctionOf:`dev-${q.id}`,correctedAt:`${q.date}T05:00:00-03:00`});
 const whole=quality(null,{watch,first}),partial=quality(null,{watch,first,more:refused}),id=partial.seen[0],row=liveRow(partial,id),facts=factsOf(partial),reading=reportsReading(row,facts,V);
 assert.deepEqual([row.eventId,sourcesOf(row),'distanceKm' in row.actual,row.conflicted===true,[...facts.inForce(id).ids].sort(),reading.withheld,reading.wholeRow],[`app-${id}`,[`app-${id}`,`dev-${id}`],false,false,[`app-${id}`,`dev-${id}`,`dev-${id}-v2`],SEVERAL,NOT_CARRIED]);
 assert.deepEqual([withheldOf(partial.r,partial.seen),edges(partial.r.runCalibration),partial.r.runCalibration.hash,edges(frozenOver(partial,partial.r.actualLedger))[THRESHOLD]],[Array(4).fill(NOT_CARRIED),edges(merged.r.runCalibration),merged.r.runCalibration.hash,['AVAILABLE',290,325]]);
 // The same row when it carries every report in force is legitimate evidence, and stays so: nothing is withheld, the work pace is read, and
 // the calibration is the frozen one over the record as it is, byte for byte. The patch disables nothing.
 assert.deepEqual([withheldOf(whole.r,whole.seen),edges(whole.r.runCalibration)[THRESHOLD],whole.r.runCalibration.hash,reportsReading(liveRow(whole,whole.seen[0]),factsOf(whole),V).wholeRow],[[],['AVAILABLE',290,325],frozenOver(whole,whole.r.actualLedger).hash,null]);
 // One speaker alone, correcting their own report with a list or a declaration, has replaced what they said: nothing else is in force.
 for(const how of ['lists','declares']){
  const one=quality(how,{watch:null});
  assert.deepEqual([withheldOf(one.r,one.seen),edges(one.r.runCalibration)[THRESHOLD],one.r.runCalibration.hash],[[],['AVAILABLE',290,325],frozenOver(one,one.r.actualLedger).hash],how+': one speaker');
 }
});

test('E-01 on the other readers of the row: the laps of a native session are no pace evidence, and the run is no sizing source of a later run',()=>{
 // The harder sessions reported by their laps (native from week 4 on), the watch flagging POOR, the athlete correcting with a declaration.
 const merged=control('laps',{laps:true}),m=quality('declares',{laps:true}),facts=factsOf(m);
 const natives=m.seen.filter(id=>m.r.runSessions[id].execution.expression==='NATIVE');assert.equal(natives.length,3);
 for(const id of natives){
  const e=m.r.runSessions[id].execution,row=liveRow(m,id),format=m.t.fmt.find(r=>r.fact==='RUN_FORMAT_EMITTED'&&r.sessionId===id&&r.format?.formatHash===row.actual.formatHash)?.format??null;
  assert.deepEqual([e.status,e.basis,e.completed,e.paceEvidence,e.paceWithheld],['DISTANCE','LAP',true,false,NOT_CARRIED],id);
  // By the one word alone the same laps read as pace evidence: what the reading hid.
  if(format){const boutMinutes=m.t.p.weeks.flatMap(w=>w.sessions).find(s=>s.id===id).prescription.work.workMinutes,by=reports=>executionOf(row,format,V,{boutMinutes,reports});
   assert.deepEqual([by(reportsReading(row,facts,V)).paceEvidence,by(reportsVerdict(row,facts,V)).paceEvidence,by(reportsVerdict(row,facts,V)).paceWithheld],[false,true,null],id+': by the whole reading, and by the word alone');}
 }
 // Every session is delivered as in the control (the same formats, the same plan): the band did not move.
 const delivered=x=>x.seen.map(id=>{const s=x.r.runSessions[id];return [s.expression,s.pattern,s.formatHash];});
 assert.deepEqual([delivered(m),withheldOf(m.r,m.seen),m.r.runCalibration.hash,planOf(m)],[delivered(merged),Array(4).fill(NOT_CARRIED),merged.r.runCalibration.hash,planOf(merged)]);

 // The latest easy run of week 3, by time with no measured distance; the watch import flags its GPS POOR; the athlete then corrects their own
 // report, declaring 8 km. With a listed failure reason the declaration is a reason of the distance, which hid that the watch's report is not
 // on the row: the run (59 minutes over the declared 8 km) was the latest run of its class, and sized the easy runs of the week after.
 const easy=how=>{
  const t=base(),s=t.runsOf(3,q=>q.role==='EASY').at(-1),run=t.runs[s.id],min=Math.round(run.estimate.durationMinutes.low),rest=t.p.weeks[3].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
  const app=(actual,eventId='app-x')=>{const r={...nativeReport(t,s,{minutes:min,rpe:3,actual}),eventId};r.actual.formatHash=run.timeFormatHash;return r;};
  t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,app({}),{...device(t,s,{minutes:min,distanceKm:8,measurement:'GPS',gpsQuality:'POOR'},'dev-x','hk-1')}]},'18:00');
  const r=t.step(3,6,'WEEKLY_REVIEW',{observations:[{...app({declared:{distanceKm:8,...(how==='declares'?{reason:'SIGNAL_LOSS'}:{})}},'app-x-v2'),correctionOf:'app-x',correctedAt:`${t.day(3,6)}T19:30:00-03:00`}]},'20:00');
  const f=readReportFacts(r.runFormatRecord,t.p.athleteId,V,r.actualLedger),runs=reportsOf=>runHistory({ledger:r.actualLedger,record:r.runHistoryRecord,athleteId:t.p.athleteId,tz:-180,reportsOf},V).runs,at={cutoff:t.day(4,0),weekStart:t.day(4,0),family:'EASY'};
  const next=t.runsOf(4,q=>q.role==='EASY').map(q=>{const x=r.runSessions[q.id];return [x.expression,x.pattern,x.dose?.sizing?.sources??null,x.unavailable?.native??null];});
  return {s,r,row:t.row(s.id),next,latest:latestClassRun(runs(o=>reportsReading(o,f,V)),at,V),byTheWord:latestClassRun(runs(o=>reportsVerdict(o,f,V)),at,V),e:r.runSessions[s.id].execution};
 };
 const plainly=easy('plain'),declared=easy('declares');
 assert.deepEqual([withheldOf(plainly.r,[plainly.s.id]),withheldOf(declared.r,[declared.s.id]),declared.row.eventId,'distanceKm' in declared.row.actual],[[NOT_CARRIED],[NOT_CARRIED],'app-x-v2',false]);
 // The run is not the sizing source: the latest measured easy run is, as when the correction gives no reason; the sessions of the week after
 // are the same in both. By the one word alone the withheld run was the source, at 442.5 s/km.
 assert.deepEqual([declared.latest,declared.next,declared.byTheWord.runId,declared.byTheWord.secondsPerKm],[plainly.latest,plainly.next,'ledger:app-x-v2',442.5]);assert.notEqual(declared.latest.runId,'ledger:app-x-v2');
 // What the run is to the rest is unchanged: complete, by time, and its history reference is the athlete's declaration (L4 lowers, never adds).
 assert.deepEqual([declared.e.completed,declared.e.status,declared.e.extentKm,declared.e.paceWithheld],[true,'TIME',8,NOT_CARRIED]);
});

test('E-01 from stored records, in another order, by the exported calibration, on a rebuilt history, after a restart and in an answer that delivers no session; with the boundary off nothing is changed',()=>{
 const merged=control(),m=quality('lists'),t=m.t,athleteId=t.p.athleteId,ids=m.seen;
 // The records as a store holds them: through JSON, each in another order. The same reading, and the same calibration by the exported reader.
 const stored=JSON.parse(JSON.stringify({l:m.r.actualLedger,f:m.r.runFormatRecord})),again=readReportFacts(shuffled(stored.f),athleteId,V,shuffled(stored.l)),facts=factsOf(m);
 for(const id of ids){const row=liveRow(m,id),twin=stored.l.find(o=>o.eventId===row.eventId);assert.deepEqual(reportsReading(twin,again,V),reportsReading(row,facts,V),id);assert.equal(reportsReading(twin,again,V).wholeRow,NOT_CARRIED);}
 const args={program:t.p,evidenceRecord:m.r.runEvidenceRecord,asOf:utcTimestamp(`${t.day(7,6)}T20:00:00-03:00`),weekIndex:7,hold:false,engineStatus:m.r.status,eligibility:ELIG(t.day(7,6))};
 const exported=(ledger,record)=>F.runCalibrationOf({...args,ledger,runFormatRecord:record},DEV);
 assert.deepEqual([exported(m.r.actualLedger,m.r.runFormatRecord).hash,exported(shuffled(stored.l),shuffled(stored.f)).hash,edges(exported(stored.l,stored.f))[THRESHOLD]],[m.r.runCalibration.hash,m.r.runCalibration.hash,['AVAILABLE',300,335]]);
 // A record that lost lineage evidence withholds more, never less: without the fact of the correction, of the watch's report, or the replaced row.
 const row=liveRow(m,ids[0]),drop=id=>m.r.runFormatRecord.filter(r=>!(isReport(r)&&r.report.reportId===id)),wholeRow=(rec,ledger=m.r.actualLedger)=>reportsReading(row,readReportFacts(rec,athleteId,V,ledger),V).wholeRow;
 assert.deepEqual([wholeRow(drop(`app-${ids[0]}-v2`)),wholeRow(drop(`dev-${ids[0]}`)),wholeRow(m.r.runFormatRecord,m.r.actualLedger.filter(o=>!o.superseded))],[NOT_CARRIED,NOT_CARRIED,NOT_CARRIED]);
 // The historical state of the record is the engine's own, read with the same completion reader: the admission is no part of it.
 const state=(ledger,fmt)=>{const h=F.historicalStateOf(t.p,{asOf:m.r.runFormat.asOf,actualLedger:ledger,runFormatRecord:fmt},DEV);return hash({run:h.run,strength:h.strength,state:h.state,week:h.week});};
 assert.equal(state(m.r.actualLedger,m.r.runFormatRecord),state(stored.l,stored.f));assert.equal(state(m.r.actualLedger,m.r.runFormatRecord),state(m.r.actualLedger,m.r.runFormatRecord.filter(r=>!isReport(r))));
 // The calibration of an earlier week, made again from the record as it is now: withheld then as now (week 6 reads weeks 3 to 5).
 assert.deepEqual(edges(F.runCalibrationOf({...args,ledger:m.r.actualLedger,runFormatRecord:m.r.runFormatRecord,asOf:utcTimestamp(`${t.day(6,6)}T20:00:00-03:00`),weekIndex:6},DEV)),edges(F.runCalibrationOf({...args,ledger:merged.r.actualLedger,runFormatRecord:merged.r.runFormatRecord,evidenceRecord:merged.r.runEvidenceRecord,asOf:utcTimestamp(`${t.day(6,6)}T20:00:00-03:00`),weekIndex:6},DEV)));
 // A new plan from the stored records: the four sessions are still withheld, and every band of the new plan is the control's.
 const fresh={...sixteen({asOf:t.day(8,0),start:t.day(8,1)}),athlete:{...sixteen({asOf:t.day(8,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const restart=u=>{const s=JSON.parse(JSON.stringify({ledger:u.ledger,fmt:u.fmt,ev:u.ev,hist:u.hist,ref:u.ref}));return F.restartProgram({intake:fresh,record:s.ledger,referenceState:s.ref,asOf:`${t.day(8,0)}T10:00:00-03:00`,athleteId:u.p.athleteId,runEvidenceRecord:s.ev,runFormatRecord:s.fmt,runHistoryRecord:s.hist},DEV);};
 const g=restart(t),c=restart(merged.t);
 assert.deepEqual([g.status,c.status,withheldOf(g,ids),withheldOf(c,ids),edges(g.runCalibration),g.runCalibration.hash],['PROPOSED','PROPOSED',Array(4).fill(NOT_CARRIED),[],edges(c.runCalibration),c.runCalibration.hash]);
 // An answer that delivers no session reads the record the same way. A review the engine refuses (no instant it can read): the rows are named.
 const refused=F.evaluateProgram(t.p,{...t.review(8,0,'WEEKLY_REVIEW',{observations:[]}),asOf:'never'},DEV);
 assert.deepEqual([refused.runFormat.status,refused.runFormat.reason,refused.runSessions,withheldOf(refused,ids)],['NOT_APPLICABLE','NO_DECISION',{},Array(4).fill(NOT_CARRIED)]);
 // A queued review, earlier than the record, that brings the athlete's correction of the last session: withheld in that very answer, with the
 // frozen calibration over the record as admitted, and not the one over the bare record.
 {
  // Sunday of week 6. 18:00: the week, with the harder session in two reports (merged). 22:00: a report that cites a format nobody holds
  // declares a stop (an ASK; the stop is kept under 22:00). Then the review of 20:00, queued offline, arrives with the athlete's correction.
  const u=quality('lists',{holdLast:true,until:6}),v=u.t,last=u.seen.at(-1),other=v.runsOf(7)[0];
  v.take(F.evaluateProgram(v.p,v.review(6,6,'WEEKLY_REVIEW',{observations:[{...report(v.p,other,{}),eventId:'unk',actual:{completed:false,minutes:20,formatHash:'f'.repeat(64),stop:{reason:'FATIGUE'}}}]},'22:00'),DEV));
  const review=v.review(6,6,'WEEKLY_REVIEW',{observations:[u.held]},'20:00'),queued=v.take(F.evaluateProgram(v.p,review,DEV)),row6=v.row(last);
  assert.deepEqual([['KEEP','MODIFY'].includes(queued.status),queued.runFormat.status,queued.runFormat.reason,queued.runSessions,row6.eventId,'distanceKm' in row6.actual],[true,'NOT_APPLICABLE','REVIEW_BEFORE_THE_RECORD',{},`app-${last}-v2`,false]);
  const over=ledger=>frozenCalibration({program:v.p,ledger,evidenceRecord:queued.runEvidenceRecord,asOf:utcTimestamp(review.asOf),weekIndex:6,hold:false,engineStatus:queued.status,eligibility:review.eligibility},DEV);
  const handed=F.admitted(queued.actualLedger,{athleteId:v.p.athleteId,facts:readReportFacts(queued.runFormatRecord,v.p.athleteId,V,queued.actualLedger)},V);
  assert.deepEqual([withheldOf(queued,u.seen),queued.runCalibration.hash],[Array(4).fill(NOT_CARRIED),over(handed.ledger).hash]);
  // The week after: the bare record takes the step (the finding); the entry point's calibration is the control's.
  const end=v.week(7,weekWith(v,7,null,null)),bare=frozenCalibration({program:v.p,ledger:end.actualLedger,evidenceRecord:end.runEvidenceRecord,asOf:utcTimestamp(`${v.day(7,6)}T20:00:00-03:00`),weekIndex:7,hold:false,engineStatus:end.status,eligibility:ELIG(v.day(7,6))},DEV);
  assert.deepEqual([withheldOf(end,u.seen),edges(end.runCalibration)[THRESHOLD],edges(bare)[THRESHOLD]],[Array(4).fill(NOT_CARRIED),['AVAILABLE',300,335],['AVAILABLE',290,325]]);
 }
 // With the boundary off every added key is inert, nothing is recorded, and the calibration is the frozen one over the bare record, as it
 // always was (the legacy behaviour is not this extension's to change).
 const off=F.evaluateProgram(t.p,{...t.review(8,6,'WEEKLY_REVIEW',{observations:[]})},FORMATS_OFF);
 assert.deepEqual([off.runFormat.status,hash(off.runFormatRecord),off.runFormat.paceEvidenceWithheld??null,edges(off.runCalibration)[THRESHOLD]],['DISABLED',hash(t.fmt),null,['AVAILABLE',290,325]]);
});

test('E-01 and a race: a row with no distance is never a race result, and a row with a distance that is not all that was said is still withheld under the word it had',()=>{
 const results=cal=>cal.evidence.filter(e=>String(e.id).startsWith('plan-race:')).map(e=>[e.id,e.distanceKm,e.seconds]);
 const p=timeline(raceTen()).p,r=p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),day=r.date,ctx={sessionId:r.id,sport:'RUN',role:'RACE',family:'RACE',mode:'EASY',weekIndex:r.weekIndex};
 const row=(id,actual,extra={})=>({eventId:id,athleteId:p.athleteId,sessionId:r.id,localDate:day,observedAt:`${day}T15:00:00.000Z`,partial:false,actual:{completed:true,minutes:50,...actual},response:UNKNOWN,provenance:{sourceQuality:'MANUAL'},context:ctx,...extra});
 const lists={segments:[{distanceKm:4,measurement:'GPS'}]},heart={rpe:9};
 const obs={app:{eventId:'app-race',sessionId:r.id,actual:{completed:true,minutes:50,...heart}},dev:{eventId:'dev-race',sessionId:r.id,source:{activityId:'hk'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK'}},v2:{eventId:'app-race-v2',sessionId:r.id,actual:{completed:true,minutes:50,...heart,...lists}},v3:{eventId:'app-race-v3',sessionId:r.id,actual:{completed:true,minutes:50,distanceKm:10,measurement:'GPS',...heart,...lists}}};
 const at=h=>`${day}T${h}:00:00.000Z`,kept=appendReportFacts([],[reportFactOf(obs.app,V),reportFactOf(obs.dev,V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:at(16)},V).record;
 const read=(ledger,fmt,fn=F.runCalibrationOf)=>results(fn({program:p,ledger,evidenceRecord:[],asOf:`${day}T23:00:00.000Z`,weekIndex:r.weekIndex,engineStatus:'KEEP',eligibility:ELIG(day),...(fmt?{runFormatRecord:fmt}:{})},DEV));
 const mergedRow=row('app-race',{distanceKm:6,measurement:'GPS',gpsQuality:'OK',...heart},{provenance:{sourceQuality:'WEARABLE_FULL',mergedSourceIds:['app-race','dev-race']}});
 const admittedOf=(ledger,fmt)=>F.admitted(ledger,{athleteId:p.athleteId,facts:readReportFacts(fmt,p.athleteId,V,ledger)},V).withheld.map(w=>w.reason);
 // The athlete corrects their own report, listing a recording and giving no distance: the row in force has no distance. It was never a race
 // result (a race is read with its distance); it is now named as withheld.
 const withV2=appendReportFacts(kept,[reportFactOf(obs.v2,V)],{athleteId:p.athleteId,recordedAt:at(18)},V).record,none=[{...mergedRow,superseded:true,supersededBy:'app-race-v2'},row('app-race-v2',{...heart,...lists},{correctionOf:'app-race'})];
 assert.deepEqual([read(none,null,frozenCalibration),read(none,withV2),admittedOf(none,withV2)],[[],[],[NOT_CARRIED]]);
 // The athlete corrects with the whole distance and a list: the row has a distance, and reads as before: withheld under the word of its own
 // report (the first of the two reasons), and no race result; the bare record gives the frozen calibration 10 km in 3000 s.
 const withV3=appendReportFacts(kept,[reportFactOf(obs.v3,V)],{athleteId:p.athleteId,recordedAt:at(18)},V).record,far=[{...mergedRow,superseded:true,supersededBy:'app-race-v3'},row('app-race-v3',{distanceKm:10,measurement:'GPS',...heart,...lists},{correctionOf:'app-race'})];
 assert.deepEqual([read(far,null,frozenCalibration),read(far,withV3),admittedOf(far,withV3)],[[['plan-race:app-race-v3',10,3000]],[],[SEVERAL]]);
 // The control: one speaker, the race measured whole, is a race result.
 const whole={eventId:'app-race',sessionId:r.id,actual:{completed:true,minutes:50,distanceKm:10,measurement:'GPS',...heart}},one=appendReportFacts([],[reportFactOf(whole,V)],{athleteId:p.athleteId,recordedAt:at(16)},V).record;
 assert.deepEqual([read([row('app-race',{distanceKm:10,measurement:'GPS',...heart})],one),admittedOf([row('app-race',{distanceKm:10,measurement:'GPS',...heart})],one)],[[['plan-race:app-race',10,3000]],[]]);
});
