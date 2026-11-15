// V1 Run Workout Structure, phase A final integration fix-forward (Founder mission of 2026-11-14). The two blockers the independent round on
// 644cd8e named, reproduced as their judge found them and closed, with the equivalent paths, and the security conditions tied to them:
// - QRE-RWS-C-01: what one source does not say never removes what another said. An import that lists no further recording (`segments: []`) is
//   merged with the app's report of the same run: the run in several recordings is never pace evidence, in any order, and it is still the run
//   it was for completion and for history.
// - QRE-RWS-C-05: every answer reads the record the same way first. An answer that delivers no session (a review earlier than the record, a
//   refused one, an unreadable format) carries the calibration over the record as admitted, or none, and names the screen the record asks for.
// - SEC-RWS-C-06, C-02, C-05 and SSCTR-RWS-C-02: a row of the record of reports that cannot be read fails closed and is never read as a symptom;
//   a stop that cannot be read is a stop; the reader of report facts is linear; a fact row holds exactly its keys under its seal; a screen dated
//   after its own review answers nothing yet.
// Every scenario is a conforming client of the composed entry point unless it says it alters a record. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,X,DEV,VALUES,ELIG,hash,report,result,timeline,atSixteen,sixteen,nativeReport,weekWith,asPrescribed,live,raceTen} from './v1rws-helpers.mjs';
import {runCalibrationOf as frozenCalibration} from '../src/v1-run-calibration.mjs';
import {readCompletion,executionOf,readReportFacts,reportsVerdict,reportFactOf,appendReportFacts,stopOf,stopOnly,sourcesOf,pausedUntil,RUN_REPORT_RECEIVED,RUN_FORMAT_EMITTED} from '../src/v1-run-format.mjs';
import {distanceFacts,recordingsOf,statedStop,runHistory,onDate,PACE_WITHHELD,RUN_HISTORY_FACT} from '../src/v1-run-history.mjs';
import {normalizeObservations,utcTimestamp} from '../src/r6-provenance.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
/** A device import of a session (Apple Health): its own event, bound to the session. */
const device=(t,s,actual,id='hk-'+s.id)=>({eventId:'dev-'+id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:id,source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},actual,response:UNKNOWN});
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
/** The other sessions of week w, each reported as prescribed. */
const others=(t,w,id)=>t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==id).map(s=>plain(t,s));
const edges=cal=>Object.fromEntries(Object.entries(cal.paceBands).map(([k,b])=>[k,[b.status,b.fastSecondsPerKm??null,b.slowSecondsPerKm??null]]));
const withheld=r=>r.runFormat.paceEvidenceWithheld.map(x=>[x.sessionId,x.reason]);
const isReport=r=>r.fact===RUN_REPORT_RECEIVED;
const ahead=r=>Object.values(r.runSessions).filter(s=>!s.past);
const ORDERS={
 'one review':(review,a,b)=>review([a,b]),
 'the app, then the import':(review,a,b)=>{review([a],'18:00');review([b],'21:00');},
 'the import, then the app':(review,a,b)=>{review([b],'18:00');review([a],'21:00');}};
/**
 * The athlete of the judge's probe: week 3 holds a native easy run of 11 km (about 63 minutes). `send(x)` reports that run with `x.review` (the
 * rest of the week goes with the first review); week 4 is then reviewed as prescribed. `after` is that review: the calibration of the week that
 * follows.
 */
function easyWeek(send){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],km=run.blocks[0].steps[0].target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 const x={t,easy,run,km,min,first:Math.round(km*0.6*100)/100,second:Math.round(km*0.4*100)/100};let rest=others(t,3,easy.id);
 x.review=(observations,time='20:00')=>{const r=t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,...observations]},time);rest=[];return r;};
 send(x);x.reported=t.results.at(-1);x.row=t.row(easy.id);x.exec=x.reported.runSessions[easy.id].execution;
 x.after=t.week(4,weekWith(t,4,null,null));
 return x;
}
/** The app's report of that run: `cite` is the format it cites (the native one, its time version, or none). */
const app=(x,cite,actual={},eventId='app-easy')=>{const o={...nativeReport(x.t,x.easy,{minutes:x.min,rpe:3,actual}),eventId};if(cite==='TIME')o.actual.formatHash=x.run.timeFormatHash;if(cite==='NONE'){delete o.actual.formatHash;delete o.actual.steps;}return o;};
const firstFile=(x,actual={})=>device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',...actual});
const list=x=>[{distanceKm:x.second,measurement:'GPS'}];
const oneFile=()=>easyWeek(x=>x.review([app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'})]));
/** The frozen calibration over a record, bare, with the arguments v1-run-index.mjs gives it for the review of week 4. */
const bareCalibration=(x,ledger)=>frozenCalibration({program:x.t.p,ledger,evidenceRecord:x.after.runEvidenceRecord,asOf:x.after.runFormat.asOf,weekIndex:4,hold:false,engineStatus:x.after.status,eligibility:ELIG(x.t.day(4,6))},DEV);
/** The record as the engine's merge alone leaves it when the better source sends an empty list: the row without its list of recordings. */
const emptied=(ledger,eventId)=>ledger.map(o=>o.eventId===eventId&&!o.fact?{...o,actual:{...o.actual,segments:[]}}:o);

// ---------- QRE-RWS-C-01 ----------
test('QRE-RWS-C-01 reproduced and closed: an import that lists no further recording never removes the app\'s list, in the three orders and the three expressions',()=>{
 const one=oneFile();
 assert.deepEqual([one.km,one.min,one.first,one.second],[11,63,6.6,4.4],'the judge\'s run: 11 km in about 63 minutes, files of 6.6 and 4.4 km');
 assert.deepEqual([edges(one.after.runCalibration).EASY,withheld(one.after)],[['AVAILABLE',345,420],[]]);
 for(const cite of ['TIME','NATIVE','NONE'])for(const [name,order] of Object.entries(ORDERS)){
  const id=`${cite}; ${name}`;
  // The same two reports with the import saying nothing of further recordings (the input the round on 644cd8e already accepted).
  const silent=easyWeek(x=>order(x.review,app(x,cite,{segments:list(x)}),firstFile(x)));
  const m=easyWeek(x=>{const a=app(x,cite,{segments:list(x)}),d=firstFile(x,{segments:[]});
   // The defect, where it is made: the engine's merge alone keeps the better source's value, and the empty list replaces the app's.
   x.bare=normalizeObservations([a,d],{athleteId:x.t.p.athleteId,asOf:`${x.t.day(3,6)}T23:30:00.000Z`,timezoneOffsetMinutes:-180}).observations.find(o=>o.sessionId===x.easy.id).actual;
   order(x.review,a,d);});
  assert.deepEqual([m.bare.distanceKm,m.bare.minutes,m.bare.segments],[6.6,63,[]],id+': the bare merge loses the list (the finding)');
  assert.deepEqual(edges(bareCalibration(m,emptied(m.after.actualLedger,m.row.eventId))).EASY,['AVAILABLE',345,575],id+': and the frozen calibration over that row reads the first file over the whole minutes');
  // Closed: the record holds the row with what the app said, and nothing of it rewritten.
  assert.deepEqual([m.row.actual.distanceKm,m.row.actual.minutes,m.row.actual.gpsQuality,m.row.actual.segments,[...m.row.provenance.mergedSourceIds].sort()],[6.6,63,'OK',list(m),['app-easy','dev-hk-'+m.easy.id]],id);
  assert.deepEqual([edges(m.after.runCalibration),withheld(m.after)],[edges(one.after.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']]],id+': every band has the edges of the control in one file');
  // An empty list is the import saying nothing: the whole reading is the one of the same reports without the key.
  assert.equal(hash(m.row.actual),hash(silent.row.actual),id+': the same row');assert.deepEqual(m.exec,silent.exec,id+': the same execution');
  assert.equal(m.after.runCalibration.hash,silent.after.runCalibration.hash,id+': the same calibration');assert.equal(hash(m.after.runSessions),hash(silent.after.runSessions),id+': the same sessions');
  // And it is the run it was: the two files together (R3A WE3A-10), complete by its distance, never pace evidence.
  if(cite==='NATIVE')assert.deepEqual([m.exec.status,m.exec.basis,m.exec.paceEvidence,m.exec.measuredKm,m.exec.extentKm,m.exec.reliability,m.row.partial],['DISTANCE','MEASURED',false,11,11,'POOR',false],id);
  else assert.deepEqual([m.exec.status,m.exec.paceEvidence,m.exec.paceWithheld,m.exec.extentKm,m.row.partial],['TIME',null,'SEVERAL_RECORDINGS',11,false],id);
 }
});

test('QRE-RWS-C-01: two reports of the app itself, one listing no further recording and one listing the second file, in every order',()=>{
 const one=oneFile();
 const first=x=>app(x,'TIME',{distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:[]},'app-1'),second=x=>app(x,'TIME',{segments:list(x)},'app-2');
 for(const [name,order] of Object.entries(ORDERS)){
  const m=easyWeek(x=>order(x.review,first(x),second(x)));
  assert.deepEqual([m.row.actual.distanceKm,m.row.actual.segments,[...m.row.provenance.mergedSourceIds].sort(),m.row.partial],[6.6,list(m),['app-1','app-2'],false],name);
  assert.deepEqual([edges(m.after.runCalibration),withheld(m.after),m.exec.paceWithheld,m.exec.extentKm],[edges(one.after.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']],'SEVERAL_RECORDINGS',11],name);
 }
});

test('QRE-RWS-C-01: whichever source lists the recordings, an empty list, no list and a list with data read as what they state',()=>{
 const one=oneFile(),none=()=>[];
 // [what the app's report carries, what the import carries]: the list is on one side or on both; the other side sends an empty list or no key.
 const SIDES={
  'the import lists it; the app sends an empty list':[x=>({segments:[]}),x=>({segments:list(x)})],
  'the import lists it; the app sends no list':[x=>({}),x=>({segments:list(x)})],
  'both list it':[x=>({segments:list(x)}),x=>({segments:list(x)})]};
 for(const cite of ['TIME','NATIVE'])for(const [what,[a,d]] of Object.entries(SIDES))for(const [name,order] of Object.entries(ORDERS)){
  const m=easyWeek(x=>order(x.review,app(x,cite,a(x)),firstFile(x,d(x)))),id=`${cite}; ${what}; ${name}`;
  assert.deepEqual([m.row.actual.distanceKm,m.row.actual.segments,m.row.partial,m.row.conflicted===true],[6.6,list(m),false,false],id);
  assert.deepEqual([edges(m.after.runCalibration),withheld(m.after),m.exec.paceWithheld,m.exec.extentKm,m.exec.paceEvidence===true],[edges(one.after.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']],'SEVERAL_RECORDINGS',11,false],id);
  if(cite==='NATIVE')assert.deepEqual([m.exec.status,m.exec.basis,m.exec.measuredKm],['DISTANCE','MEASURED',11],id);
 }
 // Nobody lists a further recording (two empty lists, or none): the row states one recording of 6.6 km in the whole minutes, and it is read as
 // it states (the control of the equivalent accepted input; an empty list is never read as "more recordings" either).
 for(const [what,seg] of [['two empty lists',none],['no list at all',()=>undefined]]){
  const m=easyWeek(x=>x.review([app(x,'TIME',seg()?{segments:seg()}:{}),firstFile(x,seg()?{segments:seg()}:{})]));
  assert.deepEqual(['segments' in m.row.actual,m.row.actual.distanceKm,withheld(m.after),edges(m.after.runCalibration).EASY],[false,6.6,[],['AVAILABLE',345,575]],what);
 }
});

test('QRE-RWS-C-01: a duplicate, a late correction, a later re-reading, a stored record and a new plan leave the calibration where the facts of the run put it',()=>{
 const one=oneFile(),at=(x,time)=>`${x.t.day(3,6)}T${time}:00-03:00`,send=x=>[app(x,'TIME',{segments:list(x)}),firstFile(x,{segments:[]})];
 // Duplicate: both reports sent again, the import with its empty list again. Nothing changes, and no report fact is added.
 const dup=easyWeek(x=>{const [a,d]=send(x);x.review([a],'18:00');x.review([d],'19:00');const before=x.t.fmt.filter(isReport).length;
  const again=x.review([a,d],'21:00');x.replay=[again.provenance.duplicates.map(y=>y.reason).sort(),x.t.fmt.filter(isReport).length-before];});
 assert.deepEqual(dup.replay,[['EXACT_REPLAY','EXACT_REPLAY'],0]);assert.deepEqual([edges(dup.after.runCalibration),withheld(dup.after),dup.row.actual.segments],[edges(one.after.runCalibration),[[dup.easy.id,'SEVERAL_RECORDINGS']],list(dup)]);
 // Late correction, the import first: its file alone (with an empty list) reads as a short run; the app's later correction of its own report
 // adds the second file. And the reverse, the merged row corrected by the app to one whole measurement: THE EXPECTED RESULT CHANGED with the
 // evidence lineage fix-forward of 2026-11-15 (SSCTR lineage item L1, SSCTR_RWS_LINEAGE_ITEMS.md section 3). Before, the run was pace evidence
 // again: that rested on the app's correction removing what the import had said (6.6 km over the whole minutes) and on the order of arrival.
 // The import's report is still in force (only the import replaces it) and the row in force, the app's correction alone, does not carry it.
 const late=easyWeek(x=>{const a=app(x,'NATIVE',{}),d=firstFile(x,{segments:[]});x.review([d,a],'18:00');x.before=[x.t.row(x.easy.id).partial,x.t.results.at(-1).runSessions[x.easy.id].execution.status];
  x.review([{...a,eventId:'corr-easy',correctionOf:a.eventId,correctedAt:at(x,'20:30'),actual:{...a.actual,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:list(x)}}],'21:00');});
 assert.deepEqual([late.before,late.exec.status,late.exec.basis,late.exec.paceEvidence,late.row.partial],[[true,'PARTIAL'],'DISTANCE','MEASURED',false,false]);
 assert.deepEqual([edges(late.after.runCalibration),withheld(late.after)],[edges(one.after.runCalibration),[[late.easy.id,'SEVERAL_RECORDINGS']]]);
 const whole=easyWeek(x=>{const [a,d]=send(x);x.review([a],'18:00');x.review([d],'19:00');x.merged=withheld(x.t.results.at(-1));
  x.review([{...app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'}),eventId:'corr-easy',correctionOf:'app-easy',correctedAt:at(x,'20:30')}],'21:00');});
 assert.deepEqual([whole.merged,withheld(whole.after),whole.exec.paceEvidence,whole.exec.paceWithheld,whole.row.eventId],[[[whole.easy.id,'SEVERAL_RECORDINGS']],[[whole.easy.id,'REPORT_NOT_CARRIED']],false,'REPORT_NOT_CARRIED','corr-easy']);
 assert.deepEqual([whole.exec.status,whole.exec.basis,whole.exec.completed,whole.exec.measuredKm,whole.row.partial,edges(whole.after.runCalibration)],['DISTANCE','MEASURED',true,11,false,edges(one.after.runCalibration)],'complete by its distance as before, and every band has the edges of the control');
 // The same statements in the two other orders were withheld before and still are, as a disputed distance: the three orders read the same,
 // with the same edges and the same history reference, the smaller of the two figures in force (L4).
 const importLast=easyWeek(x=>{const [a,d]=send(x);x.review([a],'18:00');x.review([{...app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'}),eventId:'corr-easy',correctionOf:'app-easy',correctedAt:at(x,'18:30')}],'19:00');x.review([d],'21:00');});
 const neverCorrected=easyWeek(x=>{x.review([app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'})],'18:00');x.review([firstFile(x,{segments:[]})],'19:00');});
 for(const [name,m,word] of [['the app corrects itself last',whole,'REPORT_NOT_CARRIED'],['the import arrives last',importLast,'DISTANCE_DISPUTED'],['no correction',neverCorrected,'DISTANCE_DISPUTED']])
  assert.deepEqual([withheld(m.after),m.exec.paceEvidence,m.exec.paceWithheld,m.exec.extentKm,edges(m.after.runCalibration)],[[[m.easy.id,word]],false,word,6.6,edges(one.after.runCalibration)],name);
 // A later re-reading (two more weeks), the same records through JSON as a store holds them, and the history rebuilt at an earlier instant.
 const m=easyWeek(x=>ORDERS['the import, then the app'](x.review,...send(x))),silent=easyWeek(x=>ORDERS['the import, then the app'](x.review,app(x,'TIME',{segments:list(x)}),firstFile(x)));
 const earlier=x=>F.runCalibrationOf({program:x.t.p,ledger:x.t.ledger,evidenceRecord:x.t.ev,asOf:x.reported.runFormat.asOf,weekIndex:3,hold:false,engineStatus:'KEEP',eligibility:ELIG(x.t.day(3,6)),runFormatRecord:x.t.fmt},DEV);
 const state=x=>{const h=F.historicalStateOf(x.t.p,{asOf:x.after.runFormat.asOf,actualLedger:x.t.ledger,runFormatRecord:x.t.fmt},DEV);return hash({run:h.run,strength:h.strength,state:h.state,week:h.week});};
 assert.equal(earlier(m).hash,earlier(silent).hash,'the calibration of the week the run was reported in, made again from the record');assert.notEqual(earlier(m).paceBands.EASY.slowSecondsPerKm,575);assert.equal(state(m),state(silent),'the historical state of the record');
 const stored=JSON.parse(JSON.stringify({ledger:m.t.ledger,fmt:m.t.fmt,ev:m.t.ev,hist:m.t.hist,ref:m.t.ref,p:m.t.p}));Object.assign(m.t,stored);
 const five=m.t.week(5,weekWith(m.t,5,null,null)),control5=one.t.week(5,weekWith(one.t,5,null,null));
 assert.deepEqual([edges(five.runCalibration),withheld(five)],[edges(control5.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']]]);
 // A new plan from the stored record: its calibration is made over the admitted record too.
 const fresh=x=>({...sixteen({asOf:x.t.day(6,0),start:x.t.day(6,1)}),athlete:{...sixteen({asOf:x.t.day(6,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}});
 const again=x=>F.restartProgram({intake:fresh(x),record:x.t.ledger,referenceState:x.t.ref,asOf:`${x.t.day(6,0)}T10:00:00-03:00`,athleteId:x.t.p.athleteId,runEvidenceRecord:x.t.ev,runFormatRecord:x.t.fmt,runHistoryRecord:x.t.hist},DEV);
 const r=again(m),c=again(one);assert.deepEqual([r.status,c.status],['PROPOSED','PROPOSED']);assert.deepEqual([edges(r.runCalibration),withheld(r),withheld(c)],[edges(c.runCalibration),[[m.easy.id,'SEVERAL_RECORDINGS']],[]]);
});

test('QRE-RWS-C-01: what each report said is read on the report, whatever the row kept: a row that lost its list is still no pace evidence',()=>{
 // A record the engine's merge made alone (kept through another entry point, or before this fix): the row holds the first file, the whole
 // minutes and an empty list. The app's report fact says it listed a further recording, and that is read on every path that reads pace.
 const one=oneFile(),m=easyWeek(x=>x.review([app(x,'TIME',{segments:list(x)}),firstFile(x,{segments:[]})])),t=m.t,lost=emptied(t.ledger,m.row.eventId),facts=readReportFacts(t.fmt,t.p.athleteId,VALUES);
 const row=lost.find(o=>o.eventId===m.row.eventId);assert.deepEqual([row.actual.segments,distanceFacts(row.actual,VALUES,{wearable:true}).paceWithheld],[[],null],'the row alone says nothing of it');
 assert.deepEqual([reportsVerdict(row,facts,VALUES),F.admitted(lost,{athleteId:t.p.athleteId,facts},VALUES).withheld],['SEVERAL_RECORDINGS',[{sessionId:m.easy.id,eventId:row.eventId,reason:'SEVERAL_RECORDINGS'}]]);
 const review=()=>({...t.review(5,0,'WEEKLY_REVIEW'),actualLedger:lost}),read=F.evaluateProgram(t.p,review(),DEV);
 assert.deepEqual([read.status,edges(read.runCalibration).EASY,withheld(read),read.runSessions[m.easy.id].execution.paceWithheld],['KEEP',['AVAILABLE',345,420],[[m.easy.id,'SEVERAL_RECORDINGS']],'SEVERAL_RECORDINGS']);
 const input={program:t.p,ledger:lost,evidenceRecord:t.ev,asOf:read.runFormat.asOf,weekIndex:5,hold:false,engineStatus:'KEEP',eligibility:ELIG(t.day(5,0))};
 assert.deepEqual([edges(F.runCalibrationOf({...input,runFormatRecord:t.fmt},DEV)).EASY,edges(frozenCalibration(input,DEV)).EASY],[['AVAILABLE',345,420],['AVAILABLE',345,575]],'the exported calibration, against the frozen one over the bare row');
 // A plan that is not the engine's own (changed after it was made) is calibrated by V1RC all the same: the record is admitted for it too.
 const changed={...input,program:{...t.p,hash:'0'.repeat(64)}};assert.equal(F.validProgram(changed.program),false);
 assert.deepEqual([edges(F.runCalibrationOf({...changed,runFormatRecord:t.fmt},DEV)).EASY,edges(frozenCalibration(changed,DEV)).EASY],[['AVAILABLE',345,420],['AVAILABLE',345,575]]);
 const fresh={...sixteen({asOf:t.day(6,0),start:t.day(6,1)}),athlete:{...sixteen({asOf:t.day(6,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const restarted=F.restartProgram({intake:fresh,record:lost,referenceState:t.ref,asOf:`${t.day(6,0)}T10:00:00-03:00`,athleteId:t.p.athleteId,runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist},DEV);
 assert.deepEqual([restarted.status,withheld(restarted)],['PROPOSED',[[m.easy.id,'SEVERAL_RECORDINGS']]]);
 // The latest run of the class never sizes a later one from it (S3), and as history it is the smaller figure the row still holds.
 const run=runHistory({ledger:lost,record:t.hist,athleteId:t.p.athleteId,tz:-180,reportsOf:o=>reportsVerdict(o,facts,VALUES)},VALUES).runs.find(r=>r.sessionId===m.easy.id);
 assert.deepEqual([run.paceWithheld,run.referenceKm],['SEVERAL_RECORDINGS',6.6]);
 // The limit, stated: a report fact that is not there cannot be read. Only the custody's keyed chain can tell a record that lost a row.
 assert.deepEqual(edges(F.evaluateProgram(t.p,{...review(),runFormatRecord:t.fmt.filter(r=>!isReport(r))},DEV).runCalibration).EASY,['AVAILABLE',345,575]);

 // Each report read alone: every reason a row gives of itself is kept per report and read on every report the row was made of.
 const fact=(reportId,x={})=>({sessionId:'s',reportId,speaker:'ATHLETE',standing:true,stop:null,distanceKm:null,timed:true,several:false,corrected:false,ownKm:null,wholeKm:null,...x}),rec=fs=>readReportFacts(appendReportFacts([],fs,{athleteId:'a',recordedAt:'2026-12-01T10:00:00.000Z'},VALUES).record,'a',VALUES);
 const merged={eventId:'r1',sessionId:'s',provenance:{mergedSourceIds:['r1','r2']}},verdict=fs=>reportsVerdict(merged,rec(fs),VALUES),ten=fact('r1',{distanceKm:10});
 assert.deepEqual([verdict([ten]),verdict([ten,fact('r2',{several:true})]),verdict([fact('r2',{several:true}),ten]),verdict([ten,fact('r2',{corrected:true,ownKm:10.5})]),verdict([ten,fact('r2',{ownKm:11})]),verdict([ten,fact('r2',{ownKm:10.9})]),verdict([fact('r1',{ownKm:11}),fact('r2',{ownKm:6})]),verdict([ten,fact('r2',{distanceKm:9.5,timed:false})])],
  [null,'SEVERAL_RECORDINGS','SEVERAL_RECORDINGS','CORRECTED_MEASUREMENT','DISTANCE_DISPUTED',null,'DISTANCE_DISPUTED','DURATION_REQUIRED']);
 // The order of the reasons is the row's own, a report of another session says nothing of this one, and the same report sent twice with
 // different facts is read with both. A report of this session that the row is not made of (r3) said nothing of the row before; since the
 // evidence lineage fix-forward it is a report in force the row does not carry (SSCTR lineage items L1 and L2): the row is withheld.
 assert.deepEqual([verdict([fact('r1',{distanceKm:10,timed:false}),fact('r2',{several:true,corrected:true,ownKm:5})]),verdict([ten,fact('r2',{corrected:true,ownKm:5}),fact('r1',{distanceKm:9,timed:false})]),verdict([ten,fact('r3',{several:true})]),verdict([ten,fact('r2',{several:true,sessionId:'other'})]),verdict([ten,fact('r1',{distanceKm:10,several:true})])],
  ['SEVERAL_RECORDINGS','CORRECTED_MEASUREMENT','REPORT_NOT_CARRIED',null,'SEVERAL_RECORDINGS']);
 // What a report states, with or without a distance of its own. A report that states nothing of it (an empty list, an empty declaration) left
 // no fact before; every report leaves one since the evidence lineage fix-forward, and that fact states nothing.
 const said=(actual,o={})=>{const f=reportFactOf({eventId:'e',sessionId:'s',actual:{completed:true,minutes:60,...actual}},VALUES,o);return f&&[f.distanceKm,f.several,f.corrected,f.ownKm];};
 assert.deepEqual([said({segments:[{distanceKm:4,measurement:'GPS'}]}),said({segments:[]}),said({segments:'x'}),said({distanceKm:10,measurement:'GPS',declared:{distanceKm:11,reason:'signal loss'}}),said({declared:{distanceKm:11,reason:'felt long'}}),said({declared:{distanceKm:11,reason:'AUTO_PAUSE'}}),said({manualDistanceKm:9}),said({distanceKm:10},{fromDevice:true}),said({declared:{}})],
  [[null,true,false,null],[null,false,false,null],[null,true,false,null],[10,false,true,11],[null,false,false,11],[null,false,true,11],[null,false,false,9],[10,false,false,null],[null,false,false,null]]);
 assert.deepEqual(stopOnly(reportFactOf({eventId:'e',sessionId:'s',actual:{completed:false,minutes:20,distanceKm:4,measurement:'GPS',segments:[{distanceKm:1}],stop:{reason:'SYMPTOM'}}},VALUES)),{sessionId:'s',reportId:'e',speaker:'ATHLETE',standing:false,stop:{reason:'SYMPTOM',stated:true},distanceKm:null,timed:false,several:false,corrected:false,ownKm:null,wholeKm:null});
});

test('QRE-RWS-C-01: a field of a run report that states nothing is not handed to the merge, and reads the same present or absent',()=>{
 // A report alone: an empty list of recordings, of laps or of conditions, and an empty declaration, give the result of the report without them.
 const alone=extra=>{const t=atSixteen(),s=t.long,o=nativeReport(t,s,{minutes:100,km:16,rpe:4,actual:{gpsQuality:'OK',...extra}});return t.week(1,weekWith(t,1,s.id,o));};
 const base=alone({});
 for(const extra of [{segments:[]},{steps:[]},{conditions:[]},{declared:{}},{manualDistanceKm:0},{segments:[],steps:[],conditions:[],declared:{},manualDistanceKm:0}])assert.equal(hash(alone(extra)),hash(base),JSON.stringify(extra));
 // A distance of zero is no distance: the report with it is the report without it (and a zero typed with no source is not kept as a figure).
 const timed=extra=>{const t=atSixteen(),s=t.long,o={...report(t.p,s,{}),eventId:'by-time',actual:{completed:true,minutes:100,rpe:4,...extra}};return t.week(1,weekWith(t,1,s.id,o));};
 assert.equal(hash(timed({distanceKm:0})),hash(timed({})));assert.equal(hash(timed({distanceKm:0,measurement:'GPS'})),hash(timed({measurement:'GPS'})));
 assert.notEqual(hash(alone({conditions:['HEAT']})),hash(base),'a field that states something is kept');
 // Conditions: the app says the run was in the heat; the import sends an empty list of conditions. The row keeps what was said.
 const heat=easyWeek(x=>x.review([app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK',conditions:['HEAT']}),device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:x.km,measurement:'GPS',gpsQuality:'OK',conditions:[]})]));
 assert.deepEqual([heat.row.actual.conditions,heat.row.provenance.mergedSourceIds.length,heat.exec.status,heat.exec.paceEvidence],[['HEAT'],2,'DISTANCE',false]);
 // A distance: the phone measured the run whole; the import of the same run carries a distance of zero. The row keeps the measurement.
 const zero=easyWeek(x=>x.review([app(x,'NATIVE',{distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'}),device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:0})]));
 assert.deepEqual([zero.row.actual.distanceKm,zero.row.provenance.mergedSourceIds.length,zero.exec.status,zero.exec.basis,zero.exec.paceEvidence,withheld(zero.after)],[11,2,'DISTANCE','MEASURED',true,[]]);
 // A declaration: the athlete corrects the watch's 10.2 km to the 11 km run, with a listed reason; the import sends an empty declaration.
 const fix=easyWeek(x=>x.review([app(x,'NATIVE',{declared:{distanceKm:x.km,reason:'SIGNAL_LOSS'}}),device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:10.2,measurement:'GPS',gpsQuality:'OK',declared:{}})]));
 assert.deepEqual([fix.row.actual.declared,fix.row.actual.distanceKm,fix.exec.status,fix.exec.basis,fix.exec.paceEvidence,fix.exec.paceWithheld,withheld(fix.after)],[{distanceKm:11,reason:'SIGNAL_LOSS'},10.2,'DISTANCE','CONFIRMED_CORRECTION',false,'CORRECTED_MEASUREMENT',[[fix.easy.id,'CORRECTED_MEASUREMENT']]]);
 // Laps: the app reports every repetition of a native session met; the import sends an empty list of laps. The row keeps the laps.
 const t=atSixteen();for(const w of [1,2,3])t.week(w,weekWith(t,w,null,null));
 const q=t.runsOf(4,s=>s.role==='QUALITY').find(s=>t.runs[s.id]?.expression==='NATIVE'),laps=nativeReport(t,q,{rpe:7});assert.ok(q&&laps.actual.steps.length>1);
 t.step(4,6,'WEEKLY_REVIEW',{observations:[...others(t,4,q.id),laps,device(t,q,{completed:true,minutes:laps.actual.minutes,steps:[]})]});
 const row=t.row(q.id),exec=t.results.at(-1).runSessions[q.id].execution;
 assert.deepEqual([row.actual.steps.length,row.provenance.mergedSourceIds.length,row.partial,exec.status,exec.basis],[laps.actual.steps.length,2,false,'DISTANCE','LAP']);
 // A list of recordings that is there and is no list cannot be read: the run is not one whole measurement, and is never read as one.
 assert.deepEqual([recordingsOf({}),recordingsOf({segments:null}),recordingsOf({segments:[]}),recordingsOf({segments:'two'}),recordingsOf({segments:{0:{distanceKm:4}}}),recordingsOf({segments:0})],[[],[],[],[null],[null],[null]]);
 const f=distanceFacts({completed:true,minutes:63,distanceKm:6.6,measurement:'GPS',gpsQuality:'OK',segments:{0:{distanceKm:4.4}}},VALUES);
 assert.deepEqual([f.paceWithheld,f.quality,f.markedPoor,f.measuredKm,f.lists],['SEVERAL_RECORDINGS','POOR',true,6.6,true]);
 const fmt={formatHash:'h',expression:'NATIVE',pattern:'CONTINUOUS_DISTANCE',estimate:{durationMinutes:{low:60,high:70}},blocks:[{repeat:1,steps:[{kind:'STEADY',target:{type:'DISTANCE',metres:6000}}]}]};
 assert.deepEqual([readCompletion({completed:true,minutes:63,distanceKm:6.6,measurement:'GPS',segments:'x'},fmt,VALUES).status,readCompletion({completed:true,minutes:63,distanceKm:6.6,measurement:'GPS'},fmt,VALUES).status],['UNKNOWN','DISTANCE']);
});

// ---------- QRE-RWS-C-05 ----------
/**
 * The athlete of the judge's probe, with both things an answer must not lose: week 3 holds the easy run in two files, one report (a row whose
 * distance is withheld from pace readers); and on Tuesday of week 4 a run is reported stopped for a symptom (a stop no screen was answered after).
 * `before` is the engine's record and reference state as they were before that Tuesday's review.
 */
function pending(){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],min=Math.round(run.estimate.durationMinutes.low);
 t.week(3,weekWith(t,3,easy.id,{...nativeReport(t,easy,{minutes:min,km:6.6,rpe:3,actual:{formatHash:run.timeFormatHash,gpsQuality:'OK',segments:[{distanceKm:4.4,measurement:'GPS'}]}}),eventId:'two-files'}));
 const [s0,s1]=t.runsOf(4),before={ledger:t.ledger,ref:t.ref,fmt:t.fmt},stopDay=t.day(4,1);
 const stop=t.step(4,1,'WEEKLY_REVIEW',{observations:[{...report(t.p,s0,{}),eventId:'stopped',actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}}}]});
 return {t,easy,s0,s1,before,stopDay,stop,screened:ELIG(stopDay)};
}
const REQUIRED=id=>({status:'REQUIRED',reason:'RUN_STOPPED_FOR_A_SYMPTOM',sessionIds:[id],decidedByThisExtension:false,note:'Take the athlete to the existing warning-sign screen; run sessions are by time until it is answered after the stop'});
/** The frozen calibration with the arguments v1-run-index.mjs gives it for an answer to `review`, over `ledger`. */
const oracle=(program,r,review,ledger)=>frozenCalibration({program,ledger,evidenceRecord:r.runEvidenceRecord,asOf:utcTimestamp(review.asOf),weekIndex:review.weekIndex,hold:['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(r.status),engineStatus:r.status,eligibility:review.eligibility??null},DEV);

test('QRE-RWS-C-05 reproduced and closed: a queued review that arrives after an unknown-format ASK kept a stop is answered from the record as admitted, with the screen named',()=>{
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],min=Math.round(run.estimate.durationMinutes.low);
 t.week(3,weekWith(t,3,easy.id,{...nativeReport(t,easy,{minutes:min,km:6.6,rpe:3,actual:{formatHash:run.timeFormatHash,gpsQuality:'OK',segments:[{distanceKm:4.4,measurement:'GPS'}]}}),eventId:'two-files'}));
 t.step(4,2,'WEEKLY_REVIEW',{});const s4=t.runsOf(4,s=>s.role==='EASY')[0],fmt=t.fmt;
 // Thursday: a report cites a format nobody holds and declares a stop for a symptom. The engine is asked again; the stop is kept, alone.
 const ask=F.evaluateProgram(t.p,t.review(4,4,'WEEKLY_REVIEW',{observations:[{...report(t.p,s4,{}),eventId:'unk',actual:{completed:false,minutes:20,distanceKm:3,measurement:'GPS',segments:[{distanceKm:1}],formatHash:'f'.repeat(64),stop:{reason:'SYMPTOM'}}}]}),DEV),kept=ask.runFormatRecord;
 assert.deepEqual([ask.status,ask.runFormat.reason,ask.runCalibration.status,ask.runFormat.warningSignScreen,kept.length-fmt.length],['ASK','NO_DECISION','NOT_APPLICABLE',REQUIRED(s4.id),1]);
 assert.deepEqual(kept.at(-1).report,{sessionId:s4.id,reportId:'unk',speaker:'ATHLETE',standing:false,stop:{reason:'SYMPTOM',stated:true},distanceKm:null,timed:false,several:false,corrected:false,ownKm:null,wholeKm:null},'only the stop of a report that is itself not recorded, which is no report in force');
 // The ASK decides nothing, so no report of that review is recorded, the readable ones neither: of another run reported with it (its format
 // held, 5 km measured, stopped for fatigue) only the stop is kept too.
 const s5=t.runsOf(4,s=>s.role==='EASY')[1],two=F.evaluateProgram(t.p,t.review(4,4,'WEEKLY_REVIEW',{observations:[{...report(t.p,s4,{}),eventId:'unk-3',actual:{completed:true,minutes:40,formatHash:'f'.repeat(64)}},{...report(t.p,s5,{}),eventId:'tired',actual:{completed:false,minutes:25,distanceKm:5,measurement:'GPS',stop:{reason:'FATIGUE'}}}]}),DEV);
 assert.deepEqual([two.status,two.actualLedger,two.runFormatRecord.slice(fmt.length).map(r=>r.report)],['ASK',undefined,[{sessionId:s5.id,reportId:'tired',speaker:'ATHLETE',standing:false,stop:{reason:'FATIGUE',stated:true},distanceKm:null,timed:false,several:false,corrected:false,ownKm:null,wholeKm:null}]]);
 // The same report under a clinical route (the athlete answers yes to a warning sign): the engine's route stands, the report is still not
 // recorded, and still only its stop is kept.
 const routed=F.evaluateProgram(t.p,t.review(4,4,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,4),{pain:true}),observations:[{...report(t.p,s4,{}),eventId:'unk',actual:{completed:false,minutes:20,distanceKm:3,measurement:'GPS',segments:[{distanceKm:1}],formatHash:'f'.repeat(64),stop:{reason:'SYMPTOM'}}}]}),DEV);
 assert.deepEqual([routed.status,routed.runFormat.status,routed.runFormat.notRecorded.map(x=>x.eventId),routed.actualLedger.some(o=>o.eventId==='unk'),routed.runFormatRecord.filter(r=>r.fact==='RUN_REPORT_RECEIVED'&&r.report.reportId==='unk').map(r=>r.report)],['CLINICAL_HUMAN_REQUIRED','ACTIVE',['unk'],false,[kept.at(-1).report]]);
 // And an unread report that declares no stop leaves nothing at all: no fact, and no row the record could not read afterwards.
 const quiet=F.evaluateProgram(t.p,t.review(4,4,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,4),{pain:true}),observations:[{...report(t.p,s4,{}),eventId:'unk-2',actual:{completed:true,minutes:40,distanceKm:7,measurement:'GPS',segments:[{distanceKm:1}],formatHash:'f'.repeat(64)}}]}),DEV);
 assert.deepEqual([quiet.status,quiet.runFormat.notRecorded.map(x=>x.eventId),quiet.runFormatRecord.filter(r=>r.fact==='RUN_REPORT_RECEIVED'&&r.report?.reportId==='unk-2').length,quiet.runFormat.unreadableReports,readReportFacts(quiet.runFormatRecord,t.p.athleteId,VALUES).unreadable],['CLINICAL_HUMAN_REQUIRED',['unk-2'],0,[],[]]);
 // Wednesday's review, queued offline, arrives now: later than the last accepted review, earlier than the stop the record holds.
 const review={...t.review(4,3,'WEEKLY_REVIEW',{}),runFormatRecord:kept},queued=F.evaluateProgram(t.p,review,DEV);
 assert.deepEqual([queued.status,queued.runFormat.status,queued.runFormat.reason],['KEEP','NOT_APPLICABLE','REVIEW_BEFORE_THE_RECORD']);
 // The defect: the frozen entry point's calibration of the same review reads the first file over the whole minutes.
 const {runFormatRecord,runHistoryRecord,...bare}=review,frozen=X.evaluateProgram(t.p,bare,DEV);
 assert.deepEqual([frozen.status,edges(frozen.runCalibration).EASY],['KEEP',['AVAILABLE',345,575]],'the calibration over the record not admitted (the finding)');
 // Closed: the calibration is the one over the record as admitted, and the screen the record asks for is named.
 const handed=F.admitted(queued.actualLedger,{athleteId:t.p.athleteId,facts:null},VALUES);
 assert.deepEqual([queued.runCalibration.status,edges(queued.runCalibration).EASY,queued.runFormat.paceEvidenceWithheld,queued.runFormat.warningSignScreen],['CALIBRATED',['AVAILABLE',345,420],[{sessionId:easy.id,eventId:'two-files',reason:'SEVERAL_RECORDINGS'}],REQUIRED(s4.id)]);
 assert.equal(queued.runCalibration.hash,oracle(t.p,queued,review,handed.ledger).hash);assert.notEqual(queued.runCalibration.hash,frozen.runCalibration.hash);
 // It delivers nothing and records nothing of its own: no session, and the record of formats as it was sent.
 assert.deepEqual([queued.runSessions,hash(queued.runFormatRecord),hash(queued.runHistoryRecord)],[{},hash(kept),hash(t.hist)]);
});

test('QRE-RWS-C-05: every answer on a record that holds a withheld distance and a pending symptom stop carries the admitted calibration or none, names the screen, offers nothing undue and is the same after a round trip',()=>{
 const p=pending(),{t,easy,s0,s1,screened}=p,sent=()=>({runFormatRecord:t.fmt,runHistoryRecord:t.hist});
 assert.deepEqual([p.stop.status,p.stop.runFormat.warningSignScreen,p.stop.runFormat.native,withheld(p.stop)],['KEEP',REQUIRED(s0.id),0,[[easy.id,'SEVERAL_RECORDINGS']]]);
 const late={...report(t.p,s0,{}),eventId:'late-corr',correctionOf:'stopped',correctedAt:`${t.day(3,0)}T10:00:00-03:00`,actual:{completed:true,minutes:40}};
 const noEligibility=()=>{const r=t.review(4,2,'WEEKLY_REVIEW',{});delete r.eligibility;return r;};
 // [the review, the engine's status, the extension's status and reason, the calibration's status, native sessions offered or null when none is delivered, rows the answer adds to the record of formats]
 const PATHS={
  'a review earlier than the record':[()=>({...t.review(4,1,'WEEKLY_REVIEW',{eligibility:screened},'12:00'),actualLedger:p.before.ledger,referenceState:p.before.ref}),'KEEP','NOT_APPLICABLE','REVIEW_BEFORE_THE_RECORD','CALIBRATED',null,0],
  'a review the engine refuses (earlier than its reference state)':[()=>t.review(4,0,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,0))}),'HOLD','NOT_APPLICABLE','NO_DECISION','WITHHELD_HOLD',null,0],
  'a review the engine refuses (its observations are no list)':[()=>({...t.review(4,2,'WEEKLY_REVIEW',{eligibility:screened}),observations:'x'}),'HOLD','NOT_APPLICABLE','NO_DECISION','WITHHELD_HOLD',null,0],
  'a report that cites a format the record does not hold':[()=>t.review(4,2,'WEEKLY_REVIEW',{eligibility:screened,observations:[{...report(t.p,s1,{}),eventId:'unk',actual:{completed:true,minutes:40,formatHash:'f'.repeat(64)}}]}),'ASK','NOT_APPLICABLE','NO_DECISION','NOT_APPLICABLE',null,0],
  'a record of formats that lost the formats its reports cite':[()=>({...t.review(4,2,'WEEKLY_REVIEW',{eligibility:screened}),runFormatRecord:t.fmt.filter(r=>r.fact!==RUN_FORMAT_EMITTED)}),'HOLD','NOT_APPLICABLE','NO_DECISION','NOT_APPLICABLE',null,0],
  'the engine asks for the current eligibility':[noEligibility,'ASK','ACTIVE',undefined,'CALIBRATED',0,'some'],
  'a clinical hold':[()=>t.review(4,2,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,2),{pain:true})}),'CLINICAL_HUMAN_REQUIRED','ACTIVE',undefined,'WITHHELD_HOLD',0,'some'],
  'two reports of one session that contradict':[()=>t.review(4,2,'WEEKLY_REVIEW',{eligibility:screened,observations:[{...report(t.p,s1,{}),eventId:'c-1'},{...report(t.p,s1,{completed:false}),eventId:'c-2'}]}),'KEEP','ACTIVE',undefined,'CALIBRATED',0,'some',{reports:['c-1','c-2'],notCarried:s1.id}],
  'a correction outside the window the engine admits':[()=>t.review(4,2,'WEEKLY_REVIEW',{eligibility:screened,observations:[late]}),'KEEP','ACTIVE',undefined,'CALIBRATED',0,'some',{reports:['late-corr'],notCarried:s0.id}]};
 // The last two requests bring a run report the engine refuses (one that contradicts another; a correction outside the window). Since the
 // evidence lineage fix-forward of 2026-11-15 each run report received leaves a report fact, and a report the engine refused is still a report
 // in force its session's row does not carry (SSCTR lineage items L1 and L2): that row is withheld from pace readers too. `lineage` names it.
 for(const [name,[make,status,ext,reason,cal,native,added,lineage={}]] of Object.entries(PATHS)){
  const review={...sent(),...make()},r=F.evaluateProgram(t.p,review,DEV);
  assert.deepEqual([r.status,r.runFormat.status,r.runFormat.reason,r.runCalibration.status],[status,ext,reason,cal],name);
  // 1. The calibration shown is the one over the record as admitted (the frozen calibration with the same arguments), or none.
  const ledger=Array.isArray(r.actualLedger)?r.actualLedger:review.actualLedger,handed=F.admitted(ledger,{athleteId:t.p.athleteId,facts:readReportFacts(r.runFormatRecord,t.p.athleteId,VALUES,ledger)},VALUES);
  assert.deepEqual(handed.withheld.map(x=>[x.sessionId,x.reason]).sort(),[[easy.id,'SEVERAL_RECORDINGS'],...(lineage.notCarried?[[lineage.notCarried,'REPORT_NOT_CARRIED']]:[])].sort(),name);assert.deepEqual(r.runFormat.paceEvidenceWithheld,handed.withheld,name+': the answer says what it withheld');
  if(cal==='NOT_APPLICABLE')assert.deepEqual(r.runCalibration,{status:'NOT_APPLICABLE',reason:'NO_DECISION',sessions:{}},name);
  else{assert.equal(r.runCalibration.hash,oracle(t.p,r,review,handed.ledger).hash,name);if(cal==='CALIBRATED')assert.deepEqual([edges(r.runCalibration).EASY,edges(oracle(t.p,r,review,ledger)).EASY],[['AVAILABLE',345,420],['AVAILABLE',345,575]],name);}
  // 2. The safety signal the record holds is named.
  assert.deepEqual(r.runFormat.warningSignScreen,REQUIRED(s0.id),name);
  // 3. Nothing undue is offered: no session at all, or every run session by time, and none as prescribed under a hold.
  if(native===null)assert.deepEqual(r.runSessions,{},name);
  else{assert.equal(r.runFormat.native,0,name);assert.ok(ahead(r).length>0&&ahead(r).every(s=>s.expression==='TIME'&&s.prescribed===(status!=='CLINICAL_HUMAN_REQUIRED')),name);assert.equal(r.runFormat.prescribing,status==='KEEP',name+': prescribing is the reading the calibration makes of the answer of the engine');}
  // 4. What the answer records: an answer that delivers no session returns the record of formats as it was sent; one that delivers sessions
  //    may add the formats it delivers and one fact for each run report the request brought, and nothing else; none turns a refused report
  //    into an execution.
  const sentRows=review.runFormatRecord.length;
  if(added===0)assert.equal(hash(r.runFormatRecord),hash(review.runFormatRecord),name);else{assert.equal(hash(r.runFormatRecord.slice(0,sentRows)),hash(review.runFormatRecord),name);const more=r.runFormatRecord.slice(sentRows);assert.ok(more.every(x=>x.fact===RUN_FORMAT_EMITTED||isReport(x)&&x.report.standing===true),name);assert.deepEqual(more.filter(isReport).map(x=>x.report.reportId).sort(),lineage.reports??[],name+': one fact for each run report the request brought');}
  assert.equal(hash(r.runHistoryRecord),hash(t.hist),name);
  if(['HOLD','ASK'].includes(status)&&ext==='NOT_APPLICABLE')assert.ok(!Array.isArray(r.actualLedger)||hash(r.actualLedger)===hash(t.ledger),name+': the engine\'s record is as it was sent');
  // 5. The same request after a round trip through a store gives the same answer, byte for byte.
  assert.equal(hash(F.evaluateProgram(JSON.parse(JSON.stringify(t.p)),JSON.parse(JSON.stringify(review)),DEV)),hash(r),name);
 }
 // The report a correction outside the window brought is no execution: the engine excluded it, and the record of the engine holds no row of it.
 const out=F.evaluateProgram(t.p,{...sent(),...PATHS['a correction outside the window the engine admits'][0]()},DEV);
 assert.deepEqual([out.provenance.excluded.map(e=>[e.eventId,e.reason]),out.actualLedger.some(o=>o.eventId==='late-corr')],[[['late-corr','INVALID_CORRECTION_CHAIN']],false]);
 // A stop a refused or early request itself declares is named from the request, and nothing of it is recorded.
 const stopping=F.evaluateProgram(t.p,{...sent(),...t.review(4,0,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,0)),observations:[{...report(t.p,s1,{}),eventId:'said',actual:{completed:false,minutes:10,stop:{}}}]})},DEV);
 assert.deepEqual([stopping.status,stopping.runFormat.warningSignScreen.sessionIds,hash(stopping.runFormatRecord)],['HOLD',[s0.id,s1.id].sort(),hash(t.fmt)]);
 // The screen answered after the stop clears it on every path: the answers above are asked for by the record, not by the path.
 const cleared=F.evaluateProgram(t.p,{...sent(),...t.review(4,2,'WEEKLY_REVIEW',{}),observations:'x'},DEV);
 assert.deepEqual([cleared.status,cleared.runFormat.warningSignScreen,cleared.runFormat.paceEvidenceWithheld.length],['HOLD',undefined,1]);
});

test('QRE-RWS-C-05: a refused review never shows a race result made of the first file, the calibration made again keeps the declared results, and an error of the extension answers from the same reading',()=>{
 // A race in two files on the record, and a review the engine refuses. The frozen entry point lists 6 km in the race's 50 minutes as a result,
 // under the hold as well; this entry point's answer does not.
 const p=timeline(raceTen()).p,race=p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),day=race.date;
 const raced={eventId:'race-1',athleteId:p.athleteId,sessionId:race.id,localDate:day,observedAt:`${day}T15:00:00.000Z`,partial:false,actual:{completed:true,minutes:50,measurement:'GPS',distanceKm:6,segments:[{distanceKm:4,measurement:'GPS'}]},response:UNKNOWN,provenance:{sourceQuality:'MANUAL'},context:{sessionId:race.id,sport:'RUN',role:'RACE',family:'RACE',mode:'EASY',weekIndex:race.weekIndex}};
 const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T20:00:00-03:00`,weekIndex:race.weekIndex,event:{id:'rv-1',kind:'WEEKLY_REVIEW'},eligibility:ELIG(day),observations:'x',actualLedger:[raced],runEvidenceRecord:[]};
 const results=r=>r.runCalibration.evidence.filter(e=>e.id==='plan-race:race-1').map(e=>e.distanceKm),theirs=X.evaluateProgram(p,review,DEV),mine=F.evaluateProgram(p,{...review,runFormatRecord:[],runHistoryRecord:[]},DEV);
 assert.deepEqual([theirs.status,theirs.runCalibration.status,results(theirs)],['HOLD','WITHHELD_HOLD',[6]],'the frozen entry point, under the hold (the finding on this path)');
 assert.deepEqual([mine.status,mine.runFormat.reason,mine.runCalibration.status,results(mine),withheld(mine)],['HOLD','NO_DECISION','WITHHELD_HOLD',[],[[race.id,'SEVERAL_RECORDINGS']]]);
 assert.notEqual(mine.runCalibration.hash,theirs.runCalibration.hash);
 // A declared result on the evidence record is still read when the calibration is made again (the review's own, and a queued one after it).
 const q=pending(),t=q.t,declared=t.step(4,2,'WEEKLY_REVIEW',{eligibility:q.screened,runEvidence:[{id:'declared-10k',...result('10K',44*60,t.day(4,1))}]});
 assert.deepEqual([declared.runEvidence.added,declared.runEvidenceRecord.length,withheld(declared)],[['declared-10k'],1,[[q.easy.id,'SEVERAL_RECORDINGS']]]);
 const mid={ledger:t.ledger,ref:t.ref};t.step(4,3,'WEEKLY_REVIEW',{eligibility:q.screened,observations:[{...report(t.p,q.s1,{}),eventId:'tired',actual:{completed:false,minutes:10,stop:{reason:'FATIGUE'}}}]});
 const early={...t.review(4,3,'WEEKLY_REVIEW',{eligibility:q.screened},'12:00'),actualLedger:mid.ledger,referenceState:mid.ref},again=F.evaluateProgram(t.p,early,DEV);
 const ledger=F.admitted(again.actualLedger,{athleteId:t.p.athleteId,facts:null},VALUES).ledger,withEvidence=oracle(t.p,again,early,ledger),without=frozenCalibration({program:t.p,ledger,evidenceRecord:[],asOf:utcTimestamp(early.asOf),weekIndex:4,hold:false,engineStatus:again.status,eligibility:early.eligibility},DEV);
 assert.deepEqual([again.runFormat.reason,again.runEvidenceRecord.length],['REVIEW_BEFORE_THE_RECORD',1]);assert.equal(again.runCalibration.hash,withEvidence.hash);assert.notEqual(withEvidence.hash,without.hash,'the declared result changes the calibration: made again without it, it would be another');
 // An error inside the extension (here a history row a client forged with a field of the wrong kind, sealed again): the answer delivers no
 // session, and is still read from the record: the admitted calibration, the screen, what was withheld.
 const forged=(run=>({fact:RUN_HISTORY_FACT,eventId:run.id,athleteId:t.p.athleteId,recordedAt:t.p.canonical.asOf,run,inputHash:hash(run)}))({id:'import:forged',activityId:null,date:t.day(4,3),minutes:400,measuredKm:20,source:'GPS',quality:'OK',devicePoor:false,implausible:false,declaredKm:null,conditions:5,origin:'IMPORT'});
 const failing={...t.review(4,4,'WEEKLY_REVIEW',{eligibility:q.screened}),runHistoryRecord:[...t.hist,forged]},failed=F.evaluateProgram(t.p,failing,DEV);
 assert.deepEqual([failed.status,failed.runFormat.status,failed.runFormat.reason,failed.runSessions,failed.runFormat.warningSignScreen,withheld(failed)],['KEEP','UNAVAILABLE','FORMAT_ERROR',{},REQUIRED(q.s0.id),[[q.easy.id,'SEVERAL_RECORDINGS']]]);
 assert.equal(failed.runCalibration.hash,oracle(t.p,failed,failing,F.admitted(failed.actualLedger,{athleteId:t.p.athleteId,facts:null},VALUES).ledger).hash);assert.deepEqual(edges(failed.runCalibration).EASY.slice(0,1),['AVAILABLE']);assert.notEqual(edges(failed.runCalibration).EASY[2],575);
});

test('QRE-RWS-C-05: a queued review the engine accepts keeps what its reports state with the rows the engine keeps of them, and still delivers nothing',()=>{
 // Sunday of week 3. 18:00: the week but one easy run is reviewed. 22:00: a report with a format nobody holds declares a stop (an ASK; the
 // stop is kept under 22:00). Then the review of 20:00, queued offline, arrives: later than the last accepted review, earlier than the record.
 const queuedWith=(observations,then)=>{
  const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
  const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],min=Math.round(run.estimate.durationMinutes.low),x={t,easy,run,min,first:6.6,second:4.4,km:11};
  t.step(3,6,'WEEKLY_REVIEW',{observations:others(t,3,easy.id)},'18:00');const other=t.runsOf(4)[0];
  t.take(F.evaluateProgram(t.p,t.review(3,6,'WEEKLY_REVIEW',{observations:[{...report(t.p,other,{}),eventId:'unk',actual:{completed:false,minutes:20,formatHash:'f'.repeat(64),stop:{reason:'FATIGUE'}}}]},'22:00'),DEV));
  const before=t.fmt,queued=t.step(3,6,'WEEKLY_REVIEW',{observations:observations(x)},'20:00');
  x.queued=queued;x.added=t.fmt.slice(before.length);x.rows=t.ledger.filter(o=>!o.fact&&o.sessionId===easy.id).length;
  if(then)then(x);x.after=t.week(4,weekWith(t,4,null,null));return x;};
 const one=oneFile();
 // The import of the easy run with no duration comes with the queued review; the app's report of its minutes comes with the next one. The
 // engine keeps the import's row at once, so what the import said (a distance with no duration of its own) is kept with it.
 const m=queuedWith(x=>{const d=firstFile(x);delete d.actual.minutes;return [d];},x=>x.t.step(3,6,'WEEKLY_REVIEW',{observations:[app(x,'TIME',{})]},'23:00'));
 assert.deepEqual([['KEEP','MODIFY'].includes(m.queued.status),m.queued.runFormat.status,m.queued.runFormat.reason,m.queued.runSessions,m.rows],[true,'NOT_APPLICABLE','REVIEW_BEFORE_THE_RECORD',{},1],'the engine accepted the review and keeps the row; the extension delivers nothing');
 assert.deepEqual(m.added.map(r=>[r.fact,r.recordedAt,r.report.reportId,r.report.distanceKm,r.report.timed]),[[RUN_REPORT_RECEIVED,utcTimestamp(`${m.t.day(3,6)}T20:00:00-03:00`),'dev-hk-'+m.easy.id,6.6,false]],'one row is added: the report fact, under the instant the engine accepted; no format is');
 const row=m.t.row(m.easy.id);assert.deepEqual([row.actual.distanceKm,row.actual.minutes,row.provenance.mergedSourceIds.length],[6.6,63,2],'the merged row: the import\'s distance over the app\'s minutes');
 assert.deepEqual([edges(bareCalibration(m,m.after.actualLedger)).EASY,edges(m.after.runCalibration),withheld(m.after)],[['AVAILABLE',345,575],edges(one.after.runCalibration),[[m.easy.id,'DURATION_REQUIRED']]]);
 // Both reports come with the queued review: the engine merges them at once, and the answer itself is read with what they state (the
 // distance is withheld in that very answer, before any later review).
 const both=queuedWith(x=>{const d=firstFile(x);delete d.actual.minutes;return [d,app(x,'TIME',{})];});
 assert.deepEqual([both.queued.runFormat.reason,both.queued.runFormat.paceEvidenceWithheld.filter(w=>w.sessionId===both.easy.id).map(w=>w.reason),both.t.row(both.easy.id).actual.minutes,withheld(both.after)],['REVIEW_BEFORE_THE_RECORD',['DURATION_REQUIRED'],63,[[both.easy.id,'DURATION_REQUIRED']]]);
 // A symptom stop the engine refuses as a contradiction, in a queued review: it is on no row, and it is still asked for at the next review.
 const s=queuedWith(x=>[device(x.t,x.easy,{completed:true,minutes:x.min,distanceKm:x.km,measurement:'GPS',gpsQuality:'OK'}),{...report(x.t.p,x.easy,{}),eventId:'z-app-stop',actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}}],x=>{x.next=x.t.step(4,0,'WEEKLY_REVIEW',{eligibility:ELIG(x.t.day(3,6))});});
 assert.deepEqual([s.queued.runFormat.reason,s.queued.runFormat.warningSignScreen.sessionIds,s.t.ledger.some(o=>!o.fact&&o.actual?.stop),s.added.filter(r=>r.report.stop).map(r=>r.report.stop.reason)],['REVIEW_BEFORE_THE_RECORD',[s.easy.id],false,['SYMPTOM']]);
 assert.deepEqual([s.next.runFormat.status,s.next.runFormat.warningSignScreen.status,s.next.runFormat.warningSignScreen.sessionIds,s.next.runFormat.native],['ACTIVE','REQUIRED',[s.easy.id],0]);
});

// ---------- the security conditions tied to the record of reports ----------
test('SEC-RWS-C-06: a row of the record of reports that cannot be read fails closed (screen asked, runs by time, no distance to a pace reader) and is never read as a symptom or as nothing',()=>{
 // The import arrives first and the app's report of the stop is refused as a contradiction: the stop is on no row, only in its report fact.
 const t=atSixteen(),s=t.long,dev=device(t,s,{completed:true,minutes:100,distanceKm:16,measurement:'GPS',gpsQuality:'OK'},'hk-long'),said={...report(t.p,s,{}),eventId:'app-stop',actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}};
 t.step(1,6,'WEEKLY_REVIEW',{observations:[...others(t,1,s.id),dev]},'18:00');const stopped=t.step(1,6,'WEEKLY_REVIEW',{observations:[said]},'21:00');
 const fact=t.fmt.find(r=>isReport(r)&&r.report.stop),at=t.fmt.indexOf(fact),day=t.day(1,6);
 assert.deepEqual([stopped.runFormat.warningSignScreen.status,stopped.runFormat.warningSignScreen.reason,t.ledger.some(o=>!o.fact&&o.actual?.stop)],['REQUIRED','RUN_STOPPED_FOR_A_SYMPTOM',false]);
 // The next day, with the screen of the stop's day (answered before the stop was recorded): read with the record as `fmt` gives it.
 const next=fmt=>F.evaluateProgram(t.p,{...t.review(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(day)}),runFormatRecord:fmt},DEV);
 const shown=r=>[r.runFormat.warningSignScreen.status,r.runFormat.warningSignScreen.reason??null,r.runFormat.warningSignScreen.sessionIds??null,r.runFormat.native,ahead(r).every(x=>x.expression==='TIME'&&x.unavailable.native==='WARNING_SIGN_SCREEN_REQUIRED'),r.runFormat.unreadableReports.length];
 const swap=row=>t.fmt.map((r,i)=>i===at?row:r),resealed=(row,report=row.report,recordedAt=row.recordedAt)=>({...row,report,recordedAt,eventId:`report|${report.reportId}|${hash(report).slice(0,16)}`,inputHash:hash({athleteId:row.athleteId,recordedAt,report})});
 assert.deepEqual(shown(next(t.fmt)),['REQUIRED','RUN_STOPPED_FOR_A_SYMPTOM',[s.id],0,true,0],'the record as kept: the athlete\'s own word');
 assert.deepEqual(next(swap(resealed(fact))).runFormat.warningSignScreen.reason,'RUN_STOPPED_FOR_A_SYMPTOM','a row sealed again as it is stays the row it was');
 const DAMAGED={
  'its reason changed, not sealed again':{...fact,report:{...fact.report,stop:{reason:'FATIGUE',stated:true}}},
  'its instant moved a week back, not sealed again':{...fact,recordedAt:new Date(Date.parse(fact.recordedAt)-7*864e5).toISOString()},
  'an instant no clock gives':{...fact,recordedAt:'never'},
  'another athlete':{...fact,athleteId:'someone-else'},
  'a key added to the row, sealed again':{...resealed(fact),note:'x'},
  'a key added to the report, sealed again':resealed(fact,{...fact.report,note:'<b>knee</b>'}),
  'a key added to the stop, sealed again':resealed(fact,{...fact.report,stop:{...fact.report.stop,detail:'<img>'}}),
  'a reason outside the closed list, sealed again':resealed(fact,{...fact.report,stop:{reason:'<script>',stated:true}}),
  'a key removed':(({inputHash,...r})=>r)(fact),
  'not a row at all':null,
  'a row of no known kind':{fact:'SOMETHING_ELSE',eventId:fact.eventId,athleteId:fact.athleteId}};
 for(const [what,row] of Object.entries(DAMAGED)){
  const r=next(swap(row));
  // Fail closed, and told apart from a symptom: the screen is asked for the record, and no session is named as stopped for a symptom.
  assert.deepEqual(shown(r),['REQUIRED','RUN_REPORT_UNREADABLE',[],0,true,1],what);
  assert.ok(r.runFormat.paceEvidenceWithheld.length>5&&r.runFormat.paceEvidenceWithheld.every(x=>x.reason==='REPORTS_UNREADABLE'),what+': no distance is handed to a pace reader');
  assert.equal(r.runCalibration.hash,oracle(t.p,r,{...t.review(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(day)})},F.admitted(r.actualLedger,{athleteId:t.p.athleteId,facts:readReportFacts(swap(row),t.p.athleteId,VALUES)},VALUES).ledger).hash,what);
  // The damaged row is carried as it was sent (append-only: never rewritten, never dropped), and the screen answered later does not clear it.
  assert.equal(hash(r.runFormatRecord.slice(0,t.fmt.length)),hash(swap(row)),what);
  const later=F.evaluateProgram(t.p,{...t.review(2,1,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(2,1))}),runFormatRecord:swap(row)},DEV);assert.deepEqual(shown(later).slice(0,2),['REQUIRED','RUN_REPORT_UNREADABLE'],what+': until the record is sent as it was kept');
 }
 // Sent again as it was kept, the record is whole: the athlete's stop is read, and the screen answered after it clears it.
 assert.deepEqual([shown(next(t.fmt))[1],F.evaluateProgram(t.p,{...t.review(2,1,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(2,1))})},DEV).runFormat.warningSignScreen.status],['RUN_STOPPED_FOR_A_SYMPTOM','NOT_RAISED_BY_THIS_EXTENSION']);
 // A symptom the record can read is named as one beside the row it cannot: both are asked for, and only the athlete's word names a session.
 const both=next([...t.fmt,null]);assert.deepEqual(shown(both),['REQUIRED','RUN_STOPPED_FOR_A_SYMPTOM',[s.id],0,true,1]);
 // The limit, stated: a row that is not there cannot be told from a report never sent (the client could as well not have sent the stop).
 // Only the custody's keyed chain tells a record that lost a row; this entry point never reads a missing row as a present one.
 assert.deepEqual(shown(next(t.fmt.filter(r=>r!==fact))).slice(0,2),['NOT_RAISED_BY_THIS_EXTENSION',null]);
 // The answers that deliver no session fail closed the same way: a refused review on a record with a row that cannot be read.
 const refused=F.evaluateProgram(t.p,{...t.review(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(day)}),observations:'x',runFormatRecord:swap(null)},DEV);
 assert.deepEqual([refused.status,refused.runFormat.warningSignScreen.reason,refused.runFormat.unreadableReports.length,refused.runFormat.paceEvidenceWithheld.every(x=>x.reason==='REPORTS_UNREADABLE')],['HOLD','RUN_REPORT_UNREADABLE',1,true]);
 // And a report fact is appended beside a row that cannot be read under the same name: the damaged row stands for no report.
 const again=appendReportFacts(swap({...fact,report:{...fact.report,stop:{reason:'FATIGUE',stated:true}}}),[fact.report],{athleteId:t.p.athleteId,recordedAt:fact.recordedAt},VALUES);assert.deepEqual([again.added,readReportFacts(again.record,t.p.athleteId,VALUES).stops.length],[[fact.eventId],1]);
});

test('SEC-RWS-C-06: a stop that cannot be read is a stop, never the absence of one',()=>{
 assert.deepEqual([statedStop({}),statedStop({stop:null}),statedStop({stop:false}),statedStop({stop:{reason:'FATIGUE'}}),statedStop({stop:'SYMPTOM'}),statedStop({stop:true}),statedStop({stop:0}),statedStop({stop:['x']}),statedStop(null)],[null,null,null,{reason:'FATIGUE'},{},{},{},{},null]);
 const reason=stop=>stopOf({completed:false,stop},VALUES)?.reason??null;
 assert.deepEqual([reason(undefined),reason(null),reason(false),reason({reason:'fatigue'}),reason({}),reason({reason:'??'}),reason('FATIGUE'),reason(true),reason(1)],[null,null,null,'FATIGUE','SYMPTOM','SYMPTOM','SYMPTOM','SYMPTOM','SYMPTOM']);
 // It is never the target met, never resets the pause count, and is a stop for the history reader too.
 const fmt={formatHash:'h',expression:'NATIVE',pattern:'CONTINUOUS_DISTANCE',estimate:{durationMinutes:{low:60,high:70}},blocks:[{repeat:1,steps:[{kind:'STEADY',target:{type:'DISTANCE',metres:10000}}]}]},a={completed:true,minutes:62,distanceKm:10.1,measurement:'GPS',gpsQuality:'OK'};
 assert.deepEqual([readCompletion(a,fmt,VALUES).status,readCompletion({...a,stop:'x'},fmt,VALUES).status,readCompletion({...a,stop:false},fmt,VALUES).status],['DISTANCE','STOPPED','DISTANCE']);
 const session=x=>({date:x.date,execution:executionOf({eventId:'e',actual:x.actual},x.format,VALUES),actual:x.actual}),over={...a,minutes:90},time={completed:true,minutes:60};
 const pause=mid=>pausedUntil([session({date:'2026-12-01',actual:over,format:fmt}),session({date:'2026-12-03',actual:mid,format:null}),session({date:'2026-12-05',actual:over,format:fmt})],VALUES,onDate);
 assert.deepEqual([pause(time),pause({...time,stop:{reason:'TIME'}}),pause({...time,stop:'x'})],[null,'2027-01-02','2027-01-02'],'a time session with a stop that cannot be read resets nothing');
 const history=stop=>runHistory({ledger:[{eventId:'h',athleteId:'a',sessionId:'s',localDate:'2026-12-01',context:{sport:'RUN',family:'EASY',mode:'EASY'},actual:{completed:true,minutes:60,distanceKm:10,measurement:'GPS',...(stop===undefined?{}:{stop})},provenance:{}}],record:[],athleteId:'a'},VALUES).runs[0].stopReason;
 assert.deepEqual([history(undefined),history(false),history({reason:'TIME'}),history('x'),history(true)],[null,null,'TIME','SYMPTOM','SYMPTOM'],'and the run is never the latest of its class that sizes a later one');
 // Through the entry point: a report whose stop is no object asks for the screen as one with no stated reason does.
 const t=atSixteen(),s=t.long,r=t.step(1,6,'WEEKLY_REVIEW',{observations:[...others(t,1,s.id),{...report(t.p,s,{}),eventId:'odd-stop',actual:{completed:false,minutes:30,stop:'SYMPTOM'}}]});
 assert.deepEqual([r.runFormat.warningSignScreen.status,r.runFormat.warningSignScreen.sessionIds,r.runFormat.native,t.fmt.find(x=>isReport(x)&&x.report.reportId==='odd-stop').report.stop],['REQUIRED',[s.id],0,{reason:'SYMPTOM',stated:false}]);
});

test('SEC-RWS-C-02, C-05: the reader of report facts is linear in what it is sent, and a fact row holds exactly its keys under its seal',()=>{
 const fact=(reportId,x={})=>({sessionId:'s',reportId,speaker:'ATHLETE',standing:true,stop:null,distanceKm:10,timed:true,several:false,corrected:false,ownKm:null,wholeKm:null,...x}),recordedAt='2026-12-01T10:00:00.000Z',opt={athleteId:'a',recordedAt};
 // A row made of one report named ten thousand times, and ten thousand facts under that one name: each report is looked up once, and what
 // the record said of it was summed when the record was read.
 const n=10000,many=Array.from({length:n},(_,i)=>fact('x',{distanceKm:10+i/1e6})),record=appendReportFacts([],many,opt,VALUES).record;assert.equal(record.length,n);
 const facts=readReportFacts(record,'a',VALUES);let looks=0;const counted={...facts,of:(...k)=>{looks++;return facts.of(...k);}},hostile={eventId:'x',sessionId:'s',provenance:{mergedSourceIds:Array.from({length:n},()=>'x')}};
 assert.deepEqual([sourcesOf(hostile),reportsVerdict(hostile,counted,VALUES),looks,facts.size],[['x'],null,1,1]);
 assert.deepEqual(sourcesOf({eventId:'e',provenance:{mergedSourceIds:['a','b','a',7,null,'b']}}),['a','b']);assert.deepEqual([sourcesOf({eventId:'e'}),sourcesOf({eventId:'e',provenance:{mergedSourceIds:[]}}),sourcesOf({}),sourcesOf(null)],[['e'],['e'],[],[]]);
 // Many rows that all name that report: one look each. Before, each row walked every fact of the name (rows x facts).
 looks=0;for(let i=0;i<n;i++)reportsVerdict({eventId:'r'+i,sessionId:'s',provenance:{mergedSourceIds:['x','x']}},counted,VALUES);assert.equal(looks,n);
 // The whole entry point on a hostile record: 30 000 facts under one name and a row naming it 30 000 times (about 10 MB) is read in a time
 // of the order of its size (the round on 644cd8e measured 23 s for it; a linear control with the same bytes took under 1 s).
 const t=atSixteen(),s=t.long,big=30000,row=t.row(t.runsOf(0)[0].id),name=row.eventId;
 const flood=appendReportFacts(t.fmt,Array.from({length:big},(_,i)=>({sessionId:row.sessionId,reportId:name,speaker:'ATHLETE',standing:true,stop:null,distanceKm:11.47+i/1e7,timed:true,several:false,corrected:false,ownKm:null,wholeKm:null})),{athleteId:t.p.athleteId,recordedAt:utcTimestamp(`${t.day(0,6)}T20:00:00-03:00`)},VALUES).record;
 const ledger=t.ledger.map(o=>o===row?{...o,provenance:{...o.provenance,mergedSourceIds:Array.from({length:big},()=>name)}}:o),started=Date.now();
 const r=F.evaluateProgram(t.p,{...t.review(1,6,'WEEKLY_REVIEW',{observations:t.p.weeks[1].sessions.filter(live).map(x=>plain(t,x))}),actualLedger:ledger,runFormatRecord:flood},DEV),ms=Date.now()-started;
 assert.ok(['KEEP','MODIFY','HOLD'].includes(r.status)&&r.runFormatRecord.length>=flood.length);assert.ok(ms<8000,`read in ${ms} ms`);
 // A fact row is exactly its keys, each of its closed kind, named by its report and sealed with its athlete and its instant.
 const [row1]=appendReportFacts([],[fact('e1',{stop:{reason:'SYMPTOM',stated:true}})],opt,VALUES).record,read=r=>{const x=readReportFacts(r,'a',VALUES);return [x.stops.length,x.unreadable.length];};
 assert.deepEqual([Object.keys(row1).sort(),Object.keys(row1.report).sort(),row1.eventId,row1.inputHash],[['athleteId','eventId','fact','inputHash','recordedAt','report','sessionId'],['corrected','distanceKm','ownKm','reportId','sessionId','several','speaker','standing','stop','timed','wholeKm'],`report|e1|${hash(row1.report).slice(0,16)}`,hash({athleteId:'a',recordedAt,report:row1.report})]);
 const sealed=(report,at=recordedAt,athleteId='a')=>({...row1,athleteId,report,recordedAt:at,eventId:`report|${report.reportId}|${hash(report).slice(0,16)}`,inputHash:hash({athleteId,recordedAt:at,report})});
 assert.deepEqual(read([sealed(row1.report)]),[1,0]);
 const BAD=[{...row1,recordedAt:'2026-11-24T10:00:00.000Z'},{...sealed(row1.report),extra:1},sealed({...row1.report,extra:1}),sealed({...row1.report,stop:{reason:'SYMPTOM',stated:true,extra:1}}),sealed({...row1.report,stop:{reason:'SYMPTOM'}}),sealed({...row1.report,several:'no'}),sealed({...row1.report,corrected:1}),sealed({...row1.report,ownKm:-1}),sealed({...row1.report,ownKm:1e9}),sealed({...row1.report,distanceKm:0}),
  sealed({...row1.report,speaker:'<b>me</b>'}),sealed({...row1.report,speaker:'DEVICE:hk-1'}),sealed({...row1.report,speaker:null}),sealed((({speaker,...report})=>report)(row1.report)),sealed({...row1.report,standing:1}),sealed({...row1.report,standing:false}),sealed({...row1.report,wholeKm:0}),sealed({...row1.report,wholeKm:1e9}),sealed({...row1.report,reportId:''}),sealed({...row1.report,reportId:'x'.repeat(129)}),sealed({...row1.report,sessionId:'other'}),sealed(row1.report,'2026-12-01T07:00:00-03:00'),sealed(row1.report,'2026-12-01'),sealed(row1.report,recordedAt,'b'),{...sealed(row1.report),eventId:'report|e1|0000000000000000'},{...sealed(row1.report),inputHash:hash(row1.report)},(({report,...r})=>r)(row1),(({timed,...report})=>sealed(report))(row1.report)];
 BAD.forEach((row,i)=>assert.deepEqual(read([row]),[0,1],'row '+i));
 // The same report sent again adds nothing, whenever it comes; a report fact with only one of the closed facts is a fact, and so is one with
 // none of them (every report leaves a fact since the evidence lineage fix-forward: before, a row that stated nothing was unreadable). A
 // stop-only row (a report itself not recorded) carries its stop and nothing of a distance.
 assert.deepEqual([read([sealed({...row1.report,stop:null,distanceKm:null})]),read([sealed({...row1.report,standing:false,distanceKm:null,timed:false})]),read([sealed({...row1.report,speaker:'DEVICE_UNIDENTIFIED'})]),read([sealed({...row1.report,speaker:'DEVICE:'+'a'.repeat(32),wholeKm:10})])],[[0,0],[1,0],[1,0],[1,0]]);
 assert.deepEqual([appendReportFacts([row1],[row1.report],{athleteId:'a',recordedAt:'2026-12-09T10:00:00.000Z'},VALUES).added,read([sealed({...row1.report,stop:null,distanceKm:null,several:true})]),read([sealed({...row1.report,stop:null,distanceKm:null,ownKm:9})]),read([sealed({...row1.report,stop:null,distanceKm:null,ownKm:9,corrected:true})]),read([sealed({...row1.report,stop:null,distanceKm:null,corrected:true})]),read([sealed({...row1.report,corrected:true})])],[[],[0,0],[0,0],[0,0],[0,1],[0,1]],'a correction with no figure declared is no fact this module writes');
 assert.deepEqual([...PACE_WITHHELD],['SEVERAL_RECORDINGS','CORRECTED_MEASUREMENT','DURATION_REQUIRED','DISTANCE_DISPUTED','REPORT_NOT_CARRIED','REPORTS_UNREADABLE']);
});

test('SSCTR-RWS-C-02: a screen dated after its own review answers nothing yet, and one answered at the instant of the stop is not after it',()=>{
 const run=()=>{const t=atSixteen(),s=t.long;return {t,s,stop:(eligibility,time='20:00')=>t.step(1,6,'WEEKLY_REVIEW',{eligibility,observations:[...others(t,1,s.id),{...report(t.p,s,{}),eventId:'app-stop',actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}}]},time)};};
 const at=(t,d,time)=>`${t.day(1,d)}T${time}:00-03:00`,status=r=>[['KEEP','MODIFY'].includes(r.status)?'DECIDED':r.status,r.runFormat.warningSignScreen.status];
 // The review that brings the stop at 20:00 carries a screen dated 20:01, 20:04 or 21:00 the same day: the engine accepts the day, and the
 // screen clears nothing in this review (before: it cleared the stop at once).
 for(const time of ['20:01','20:04','21:00']){const x=run(),r=x.stop(ELIG(at(x.t,6,time)));assert.deepEqual(status(r),['DECIDED','REQUIRED'],time);assert.equal(r.runFormat.native,0,time);
  // Read by a later review, at or after its own instant, the same screen is one answered after the stop: it clears it.
  assert.deepEqual(status(x.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(at(x.t,6,time))},'08:00')),['DECIDED','NOT_RAISED_BY_THIS_EXTENSION'],time);}
 // At the instant of the review that records the stop, or before it: not after the stop, on that review and on every later one.
 for(const time of ['20:00','19:55']){const x=run();assert.deepEqual(status(x.stop(ELIG(at(x.t,6,time)))),['DECIDED','REQUIRED'],time);assert.deepEqual(status(x.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(at(x.t,6,time))},'08:00')),['DECIDED','REQUIRED'],time);}
 // A later review, the next morning at 08:00, with a screen dated 09:00 of that morning: after the stop, and after its own review. It clears
 // nothing at 08:00, and clears the stop when a review at or after 09:00 reads it.
 const y=run();y.stop(ELIG(y.t.day(1,6)));const nine=ELIG(`${y.t.day(2,0)}T09:00:00-03:00`);
 assert.deepEqual([status(y.t.step(2,0,'WEEKLY_REVIEW',{eligibility:nine},'08:00')),status(y.t.step(2,0,'WEEKLY_REVIEW',{eligibility:nine},'09:00'))],[['DECIDED','REQUIRED'],['DECIDED','NOT_RAISED_BY_THIS_EXTENSION']]);
 // A screen dated the day after its review: the engine asks for the eligibility again, and the stop is still asked for by name.
 const z=run();z.stop(ELIG(z.t.day(1,6)));const tomorrow=z.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(z.t.day(2,1))});
 assert.deepEqual([tomorrow.status,tomorrow.runFormat.warningSignScreen.status,tomorrow.runFormat.warningSignScreen.sessionIds,tomorrow.runFormat.native],['ASK','REQUIRED',[z.s.id],0]);
 // A screen by its day alone: the day of the stop is not after it; the day after is, read on that day.
 const x=run();assert.deepEqual(status(x.stop(ELIG(x.t.day(1,6)))),['DECIDED','REQUIRED']);assert.deepEqual([status(x.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(x.t.day(1,6))})),status(x.t.step(2,0,'WEEKLY_REVIEW',{eligibility:ELIG(x.t.day(2,0))},'21:00'))],[['DECIDED','REQUIRED'],['DECIDED','NOT_RAISED_BY_THIS_EXTENSION']]);
});
