// V1 Run Workout Structure, Athlete Data Foundation (gap G1): the dated run distances an athlete brings, as history. The acceptance cases H1 to
// H6 of the data contract (H8 is in v1rws-execution.test.mjs; H7 and H9 belong to the Race Forecast phase), the sources of L30 and the comparable
// long run, and one run counted once whatever brought it. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,DEV,VALUES,hash,timeline,runner,result,sixteen,paced,addDays} from './v1rws-helpers.mjs';
import {runHistory,L30,comparableLongRun,latestClassRun,factsFromIntake,appendHistory,distanceFacts,historyReference,RUN_HISTORY_FACT} from '../src/v1-run-history.mjs';

const AS_OF='2026-11-07',START='2026-11-09';
const hk=(i,daysBefore,minutes,km,x={})=>({startedAt:addDays(AS_OF,-daysBefore)+'T10:00:00Z',sport:'RUN',durationMinutes:minutes,...(km!==null?{distanceKm:km}:{}),canonicalActivityId:'hk-'+i,provider:'HEALTHKIT',completeness:'COMPLETE',measurement:'GPS',...x});
/** Scenario C of the data contract: four weeks of imported runs, one of them imported twice. */
const HISTORY=[hk(1,2,45,8),hk(2,4,40,7.2),hk(3,6,75,13),hk(4,9,45,8.1),hk(5,11,40,7),hk(6,13,70,12.5),hk(7,16,45,8),hk(8,18,40,7.1),hk(9,20,65,11.5),hk(10,23,45,8),hk(11,25,40,7),hk(12,27,60,10.5),hk(3,6,75,13,{provider:'VILUMO_APP'})];
const importer=(history,athlete={})=>runner({id:'rw-h',weeks:8,athlete:{history,wearableCapabilities:{activityAvailable:true,completeness:'FULL',provider:'HEALTHKIT',historyWeeks:4},...athlete}});
const runsOf=(t,ledger=t.ledger)=>runHistory({ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180},VALUES);
const week=(t,w)=>{const weekStart=addDays(t.p.startDate,7*w);return {cutoff:weekStart,weekStart};};
const core=p=>hash({weeks:p.weeks,capability:p.capability,stateTrace:p.stateTrace,phases:p.phases});

test('H1: imported runs with their distances are kept as history, the duplicate once; L30 is the longest of them; the engine plans exactly as without the distances',()=>{
 const t=timeline(importer(HISTORY)),bare=timeline(importer(HISTORY.map(({distanceKm,measurement,...h})=>h)));
 assert.deepEqual([t.hist.length,t.state.history.duplicates.length,t.hist.every(r=>r.fact===RUN_HISTORY_FACT&&r.run.origin==='IMPORT')],[12,1,true]);
 assert.equal(L30(runsOf(t).runs,{cutoff:addDays(AS_OF,1),weekStart:START},VALUES).km,13);
 assert.equal(core(t.p),core(bare.p),'the engine reads the minutes and nothing else');assert.equal(bare.hist.length,0,'minutes alone are never a distance');
 assert.match(t.p.canonical.athlete.recentRun.basis,/WEARABLE/,'the engine read the import as it always does');assert.ok(!JSON.stringify(t.p.canonical.athlete.historySummary).includes('distanceKm'));
});
test('H2: the same activity sent again during the plan, outside any session, is still one run',()=>{
 const t=timeline(importer(HISTORY));const before=runsOf(t).runs.length;
 t.step(0,2,'WEEKLY_REVIEW',{observations:[{eventId:'rw-h-again',athleteId:t.p.athleteId,canonicalActivityId:'hk-3',source:{provider:'HEALTHKIT',activityId:'hk-3'},occurrenceDate:addDays(AS_OF,-6),actual:{completed:true,minutes:75,distanceKm:13,measurement:'GPS',sport:'RUN'}}]});
 const now=runsOf(t).runs;assert.equal(now.length,before,'one run, once');assert.equal(now.filter(r=>r.activityIds.includes('hk-3')).length,1);assert.equal(now.find(r=>r.activityIds.includes('hk-3')).origin,'LEDGER_UNPLANNED','the engine\'s row is the one read');
 assert.equal(L30(now,week(t,1),VALUES).km,13);assert.equal(t.hist.length,12,'the record of imports is append-only and unchanged by a review');
 // Two runs on one day with different identities are two runs: nothing is merged by date.
 t.step(0,3,'WEEKLY_REVIEW',{observations:[{eventId:'rw-h-other',athleteId:t.p.athleteId,canonicalActivityId:'hk-99',source:{provider:'HEALTHKIT',activityId:'hk-99'},occurrenceDate:addDays(AS_OF,-6),actual:{completed:true,minutes:20,distanceKm:3,measurement:'GPS',sport:'RUN'}}]});
 assert.equal(runsOf(t).runs.filter(r=>r.date===addDays(AS_OF,-6)).length,2);
});
test('H3: a declared recent longest run with a distance and its own date counts for L30 only: never a comparable long run, never seen by the engine',()=>{
 const declared={distanceKm:15,minutes:85,date:addDays(AS_OF,-12),measurement:'GPS'},t=timeline(runner({id:'rw-h3',weeks:8,athlete:{recentLongestRun:declared}})),bare=timeline(runner({id:'rw-h3',weeks:8}));
 assert.equal(hash(t.p),hash(bare.p),'the key is taken off before the engine reads the intake');assert.equal(t.g.inputHash,bare.g.inputHash);
 const runs=runsOf(t).runs;assert.deepEqual([runs.length,runs[0].origin,runs[0].measuredKm,runs[0].declaredKm,runs[0].referenceKm],[1,'INTAKE_DECLARED',null,15,15],'the athlete\'s word, never a measurement');
 assert.equal(L30(runs,week(t,1),VALUES).km,15);assert.equal(comparableLongRun(runs,{...week(t,1),minutes:60},VALUES),null,'an intake declaration is no executed run in the record');
 // Without its date, or without its distance, it is no fact at all (never minutes turned into kilometres).
 for(const bad of [{distanceKm:15,minutes:85},{minutes:85,date:addDays(AS_OF,-12)},{distanceKm:15,date:addDays(AS_OF,3)}]){const u=timeline(runner({id:'rw-h3',weeks:8,athlete:{recentLongestRun:bad}}));assert.equal(u.hist.length,0);assert.deepEqual(u.state.history.skipped.map(x=>x.reason),['DISTANCE_AND_RUN_DATE_REQUIRED']);}
});
test('H4, G2: a run outside the plan that does not state its sport is no run; one that states RUN is history and nothing else',()=>{
 const t=timeline(sixteen()),loose=(id,actual)=>({eventId:id,athleteId:t.p.athleteId,canonicalActivityId:id,source:{provider:'HEALTHKIT',activityId:id},occurrenceDate:t.day(0,2),actual:{completed:true,minutes:110,distanceKm:19,measurement:'GPS',...actual}});
 const r=t.step(0,3,'WEEKLY_REVIEW',{observations:[loose('hk-nosport',{}),loose('hk-run',{sport:'RUN'}),loose('hk-bike',{sport:'CYCLING'})]});
 const runs=runsOf(t).runs;assert.deepEqual(runs.map(x=>x.activityIds[0]),['hk-run']);assert.equal(L30(runs,week(t,1),VALUES).km,19);
 // Inert for the engine (PD-2 is not decided here): no credit, no load, no pace; the decision is the one made without them.
 const plain=timeline(sixteen());const p=plain.step(0,3,'WEEKLY_REVIEW');assert.equal(r.action,p.action);assert.equal(hash(t.p),hash(plain.p));assert.equal(hash(r.runCalibration.paceBands),hash(p.runCalibration.paceBands));
 // As an executed run in the record it can be the comparable long run of the next long session (R3A A2 ii), with its own pace as S2.
 const c=comparableLongRun(runs,{...week(t,1),minutes:100},VALUES);assert.deepEqual([c.origin,c.referenceKm,Math.round(c.secondsPerKm)],['LEDGER_UNPLANNED',19,347]);
 assert.equal(latestClassRun(runs,{...week(t,1),family:'LONG'},VALUES),null,'a run outside the plan has no class: never S3');
});
test('H5: an imported treadmill run counts for L30 and can be the comparable long run, and gives no pace',()=>{
 const t=timeline(importer([hk(1,3,100,16.2,{measurement:'TREADMILL'}),hk(2,5,45,8)])),runs=runsOf(t).runs;
 assert.equal(L30(runs,{cutoff:addDays(AS_OF,1),weekStart:START},VALUES).km,16.2);
 const c=comparableLongRun(runs,{cutoff:addDays(AS_OF,1),weekStart:START,minutes:100},VALUES);assert.deepEqual([c.referenceKm,c.secondsPerKm],[16.2,null],'the treadmill is never a pace for sizing');
 assert.equal(t.cal.paceBands.EASY.status,'UNAVAILABLE','and the calibration reads no imported run at all');
});
test('H6: a measurement the device flagged as poor, with no declaration, is no history; with a declaration the smaller figure is',()=>{
 const t=timeline(importer([hk(1,3,95,16.4,{gpsQuality:'POOR'}),hk(2,5,45,8)])),runs=runsOf(t).runs;
 assert.equal(runs.find(r=>r.activityIds[0]==='hk-1').referenceKm,null);assert.equal(L30(runs,{cutoff:addDays(AS_OF,1),weekStart:START},VALUES).km,8);
 assert.equal(comparableLongRun(runs,{cutoff:addDays(AS_OF,1),weekStart:START,minutes:95},VALUES),null,'a device-poor run with no declaration does not qualify');
 const f=a=>historyReference(distanceFacts(a,VALUES));
 assert.deepEqual([f({distanceKm:16.4,measurement:'GPS',gpsQuality:'POOR'}),f({distanceKm:16.4,measurement:'GPS',gpsQuality:'POOR',declared:{distanceKm:16}}),f({distanceKm:15.52,measurement:'GPS',declared:{distanceKm:16,reason:'SIGNAL_LOSS'}}),f({declared:{distanceKm:16}}),f({minutes:95}),f({distanceKm:12,measurement:'MANUAL'})],[null,16,15.52,16,null,12]);
});
test('T15: L30 reads every source once, the engine\'s row first; the record of imports is append-only and an altered row is named and never read',()=>{
 const t=timeline(importer(HISTORY));t.week(0,paced);
 const runs=runsOf(t),origins=new Set(runs.runs.map(r=>r.origin));assert.ok(origins.has('IMPORT')&&origins.has('LEDGER'));
 assert.equal(L30(runs.runs,week(t,1),VALUES).km,13,'imports and the plan\'s own runs, the longest in 30 days');
 assert.equal(L30(runs.runs,{cutoff:addDays(START,70),weekStart:addDays(START,70)},VALUES),null,'nothing dated in the 30 days before: unknown, never a longer window');
 // A session of the plan and the device activity bound to it are one run.
 const s=t.runsOf(1,x=>x.role==='LONG')[0];t.step(1,6,'WEEKLY_REVIEW',{observations:[{eventId:'rw-bound',athleteId:t.p.athleteId,sessionId:s.id,source:{provider:'HEALTHKIT',activityId:'hk-bound',quality:'WEARABLE_FULL'},occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes,distanceKm:10.1}}]});
 const bound=runsOf(t).runs.filter(r=>r.sessionId===s.id);assert.deepEqual([bound.length,bound[0].measuredKm,bound[0].source,bound[0].quality],[1,10.1,'GPS','UNKNOWN'],'a device activity with no stated source is device distance of unknown quality');
 // Append-only, and integrity: a row altered in transit is unreadable.
 const again=appendHistory(t.hist,factsFromIntake(importer([...HISTORY,hk(40,1,50,9)]),VALUES).facts,{athleteId:t.p.athleteId,recordedAt:AS_OF});assert.deepEqual([again.added,again.duplicates.length,hash(again.record.slice(0,12))],[['import:hk-40'],13,hash(t.hist)]);
 const forged=t.hist.map((r,i)=>i===0?{...r,run:{...r.run,measuredKm:42}}:r),read=runHistory({ledger:[],record:forged,athleteId:t.p.athleteId,tz:-180},VALUES);
 assert.deepEqual([read.unreadable,read.runs.some(r=>r.measuredKm===42)],[[t.hist[0].eventId],false]);
 assert.equal(runHistory({ledger:[],record:t.hist,athleteId:'someone-else',tz:-180},VALUES).runs.length,0,'another athlete\'s rows are never read');
});
test('The imported long run is what makes the first long run by distance possible: with it 16 km, without it the same 100 minutes by time',()=>{
 const imported=hk(50,4,100,16.4),run=history=>{const t=timeline(sixteen({athlete:{history}}));t.week(0,s=>s.role==='LONG'?false:paced(s));const long=t.runsOf(1,s=>s.role==='LONG')[0];return {t,long,run:t.runs[long.id]};};
 const withIt=run([imported]),without=run([]);
 assert.equal(withIt.long.prescription.durationMinutes,without.long.prescription.durationMinutes,'the dose is the engine\'s either way');
 assert.deepEqual([withIt.run.expression,withIt.run.blocks[0].steps[0].target],['NATIVE',{type:'DISTANCE',metres:16000}]);
 assert.deepEqual([without.run.expression,without.run.unavailable.native],['TIME','LONG_HISTORY_NOT_COMPARABLE']);
 assert.equal(hash(withIt.t.p.weeks),hash(without.t.p.weeks),'the import changes the expression only');
});
test('The restart keeps the records and adds the runs a new intake brings',()=>{
 const t=timeline(importer(HISTORY));t.week(0,paced);
 const intake={...importer([...HISTORY,hk(60,1,50,9.2)]),asOf:t.day(1,0),startDate:t.day(1,1)};
 const r=F.restartProgram({intake,record:t.ledger,referenceState:t.ref,asOf:`${t.day(1,0)}T10:00:00-03:00`,athleteId:t.p.athleteId,runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist},DEV);
 assert.ok(['PROPOSED','ASK','HOLD','CLINICAL_HUMAN_REQUIRED','INVALID_INPUT','UNSUPPORTED'].includes(r.status),r.status);
 assert.equal(hash(r.runHistoryRecord.slice(0,t.hist.length)),hash(t.hist));assert.equal(hash(r.runFormatRecord.slice(0,t.fmt.length)),hash(t.fmt));
 if(r.program)assert.ok(r.runHistoryRecord.some(x=>x.eventId==='import:hk-60'));
});
