// V1 Run Workout Structure, T13: the worked examples of SSCTR-RWS-R2-DECISION, SSCTR-RWS-R3-DECISION and SSCTR-RWS-R3A-AMENDMENT as the oracle.
// They are read from the three records, never copied here. A divergence is a finding, never an adjustment (preflight S7): the two examples this
// implementation does not reproduce are named below with what it produces and why, and the test fails if any other example diverges.
import test from 'node:test';
import assert from 'node:assert/strict';
import {R2,R3,R3A,VALUES,session,input,select,line} from './v1rws-helpers.mjs';
import {repetitionCandidate,sizeContinuous,readCompletion,executionOf,pausedUntil,suppressionOf} from '../src/v1-run-format.mjs';
import {distanceFacts,historyReference,comparableLongRun,onDate} from '../src/v1-run-history.mjs';

const near=(a,b,eps=0.011)=>Math.abs(a-b)<=eps;
const candidateOf=(e,entry)=>{
 const s=session({family:e.family,step:e.step??e.taperStep,ladderStep:e.ladderStep??1,event:e.event??null}),p=s.prescription,C=VALUES.catalog[e.family];
 const band={fastSecondsPerKm:e.bandFastSecondsPerKm,slowSecondsPerKm:e.bandSlowSecondsPerKm},recoveryBand=e.recoveryBandFastSecondsPerKm?{fastSecondsPerKm:e.recoveryBandFastSecondsPerKm,slowSecondsPerKm:e.recoveryBandSlowSecondsPerKm}:null;
 return repetitionCandidate(entry,{step:p.work,band,recoveryBand,familyMinRepetitionMinutes:C.familyMinRepetitionMinutes??p.work.workMinutes,warmupMinutes:p.warmupMinutes,cooldownMinutes:p.cooldownMinutes,budgetMinutes:240,canonicalDurationMinutes:p.durationMinutes},VALUES);
};
const works=c=>{const d=c.works.filter(w=>w.metres!==undefined).map(w=>w.metres),t=c.works.filter(w=>w.minutes!==undefined);
 return (d.every(x=>x===d[0])?`${d.length} x ${d[0]} m`:d.join('-')+' m')+(t.length?` + ${t.length} x ${t[0].minutes} min`:'')+(c.recovery.metres?`, ${c.recovery.metres} m easy jog between`:`, ${c.recovery.minutes} min walk-or-jog between`);};
const selectOf=(e,extra={})=>select(input({s:session({family:e.family,step:e.step??e.taperStep??null,minutes:e.canonicalMinutes??null,ladderStep:e.ladderStep??1,firstExposure:e.ladderStep===0,event:e.event??null}),fast:e.bandFastSecondsPerKm,slow:e.bandSlowSecondsPerKm,experience:e.experience,phase:e.phase,eventKind:e.event??null,
 recovery:e.recoveryBandFastSecondsPerKm?[e.recoveryBandFastSecondsPerKm,e.recoveryBandSlowSecondsPerKm]:null,...extra}));

// ---------- R2: repetitions (the continuous examples of R2 rest on RWS-N4, which the Founder rejected and R3 replaced) ----------
const R2_SUPERSEDED_BY_R3=['WE-08','WE-10','WE-11','WE-12','WE-20','WE-30','WE-31','WE-32'];
/** The examples this implementation does not reproduce, each a finding for the SSCTR judge of the candidate. */
const FINDINGS={
 'WE-17':{produces:'1 x 2600 m + 1 x 15 min, 3 min walk-or-jog between',why:'values.candidateOrder.MIXED ("distance unit coarsest first; then longer distance first") reaches 2600 m (a multiple of 200) before 2700 m (a multiple of 100 only); both pass E1-E3. The record\'s own example gives 2700 m. The rule as written is implemented; every other example is the same under either order.'},
 'WE-25':{produces:'TIME, NO_FORMAT_WITHIN_ENVELOPE',why:'The EQUIVALENT conversion (SSCTR-RWS-DECISION-r1, boundary V1X-RUN-DISTANCE) is optional in the handoff (section 7) and is not part of this extension: where the catalog would fall back to it, the session is the TIME expression, which RWS-N8 names as the fallback when EQUIVALENT is not available.'},
};
test('T13 R2: every repetition example gives the format, the work and the duration the record states; the two findings are named',()=>{
 const diverged=[];
 for(const e of R2.workedExamples){
  if(R2_SUPERSEDED_BY_R3.includes(e.id))continue;const x=e.expected;
  if(e.rotationEntry&&(e.step||e.taperStep)){
   const c=candidateOf(e,e.rotationEntry),said=c?works(c):'none',wanted=x.format.replace(/ progressive inside [^(,]*(\([^)]*\))?/,'');
   const same=said===wanted&&(!x.workMinutes||near(c.work.low,x.workMinutes[0])&&near(c.work.high,x.workMinutes[1]))&&(!x.durationMinutes||near(c.duration.low,x.durationMinutes[0])&&near(c.duration.high,x.durationMinutes[1]));
   if(!same)diverged.push({id:e.id,said});
   continue;
  }
  if(e.id==='WE-15'){const c=candidateOf(e,'EVEN_REPEATS');assert.equal(works(c),x.expressionIfEntryEVEN);assert.ok(near(c.work.low,x.workMinutes[0])&&near(c.duration.high,x.durationMinutes[1]));
   assert.ok(!VALUES.eligibility.phase.SPECIFIC.includes('PYRAMID'),'a pyramid is no rotation entry in SPECIFIC');continue;}
  if(e.id==='WE-26'){const r=selectOf(e,{prior:{evenOnly:false,peakMetres:1000}});assert.equal(line(r),x.format);assert.equal(r.dose.keptFromPeak,true);assert.ok(near(r.estimate.durationMinutes.low,x.durationMinutes[0])&&near(r.estimate.durationMinutes.high,x.durationMinutes[1]));continue;}
  if(e.id==='WE-33'){const r=selectOf({...e,canonicalMinutes:30,bandFastSecondsPerKm:375,bandSlowSecondsPerKm:450},{mode:e.mode});assert.deepEqual([r.expression,r.unavailable.native],[x.expression,x.reason]);continue;}
  if(e.id==='WE-34'){const r=selectOf({...e,step:{repetitions:3,workMinutes:15,recoveryMinutes:3},bandFastSecondsPerKm:500,bandSlowSecondsPerKm:520},{marathonEstimate:{status:'AVAILABLE',centralSeconds:6*3600+600}});assert.deepEqual([r.expression,r.unavailable.native],[x.expression,x.reason]);continue;}
  if(e.id==='WE-09'){const r=selectOf(e);assert.deepEqual([r.expression,r.unavailable.native],[x.expression,x.reason]);continue;}
  const r=selectOf(e),got=r.expression==='NATIVE'?line(r):`${r.expression}, ${r.unavailable.native}`,want=x.format??`${x.expression}, ${x.reason}`;
  if(got!==want)diverged.push({id:e.id,said:got});
 }
 assert.deepEqual(diverged.map(d=>d.id).sort(),Object.keys(FINDINGS).sort(),'only the named findings diverge: '+JSON.stringify(diverged));
 for(const d of diverged)assert.equal(d.said,FINDINGS[d.id].produces,d.id+': '+FINDINGS[d.id].why);
});
test('T13 R2: the two continuous families R3 took out of the catalog are by time, and a novice continuous run is by time',()=>{
 for(const id of ['WE-31','WE-32']){const e=R2.workedExamples.find(x=>x.id===id),r=selectOf(e);assert.deepEqual([r.expression,r.unavailable.native],['TIME','NOT_A_NATIVE_FAMILY'],id+' (R3 values.catalog)');}
});

// ---------- R3: continuous sizing, statuses, stops (athlete A) ----------
const P1={fastSecondsPerKm:340,slowSecondsPerKm:370},LONG=[345,420],EASY=[340,405],we3=id=>R3.workedExamples.find(e=>e.id===id).expected,we3a=id=>R3A.workedExamples.find(e=>e.id===id).expected;
const longA=(extra={},minutes=100)=>select(input({s:session({family:'LONG',minutes}),fast:LONG[0],slow:LONG[1],available:120,history:{p1:P1,l30:{km:15.5},comparable:{secondsPerKm:95*60/15.5},latest:null,pausedUntil:null,...extra}}));
const easyA=(extra={},minutes=50)=>select(input({s:session({family:'EASY',minutes}),fast:EASY[0],slow:EASY[1],available:60,history:{p1:P1,l30:{km:15.5},comparable:null,latest:{secondsPerKm:360},pausedUntil:null,...extra}}));
const km=r=>r.blocks[0].steps[0].target.metres/1000;
const read=(format,actual,wearable=false)=>readCompletion(actual,format,VALUES,{wearable});
const exec=(format,actual)=>executionOf({eventId:'e',actual,partial:false,provenance:{sourceQuality:'MANUAL'}},format,VALUES);
test('T13 R3: WE3-01 the 16 km long run of athlete A, sized at the athlete\'s own slow pace; WE3-18 the 8 km easy run',()=>{
 const long=longA();assert.equal(long.expression,'NATIVE');assert.equal(km(long),16);
 assert.ok(near(long.estimate.durationMinutes.low,92)&&near(long.estimate.durationMinutes.high,98.67));assert.deepEqual([long.dose.sizing.pTyp,long.dose.sizing.pSize],[345,370]);
 assert.match(we3('WE3-01').format,/^16 km long run/);assert.equal(long.blocks[0].steps[0].target.type,'DISTANCE');
 assert.ok(!JSON.stringify(long.blocks).includes('ceiling')&&long.blocks.length===1,'no time ceiling on a native distance step');
 const easy=easyA();assert.equal(km(easy),8);assert.ok(near(easy.estimate.durationMinutes.low,45.33)&&near(easy.estimate.durationMinutes.high,49.33));assert.match(we3('WE3-18').format,/^8 km easy/);
});
test('T13 R3: WE3-02 to WE3-05 sixteen kilometres done are DISTANCE whatever the minutes; slower than the estimate is flagged, never failed',()=>{
 const f=longA(),at=minutes=>read(f,{completed:true,minutes,distanceKm:16,measurement:'GPS'});
 for(const [id,minutes,flag] of [['WE3-02',89.33,false],['WE3-03',96,false],['WE3-04',108,true],['WE3-05',116,true]]){const r=at(minutes);assert.equal(r.status,we3(id).status,id);assert.equal(r.basis,'MEASURED');assert.equal(r.exposure.aboveEstimate,flag,id);}
 assert.ok(near(1.015*f.estimate.durationMinutes.high,100.15),'the flag starts above 100.15 min');
 // The next long run after 108 min (6:45 per km enters the sizing as S3): no distance passes at M 105, so it is by time.
 const next=longA({latest:{secondsPerKm:108*60/16},comparable:{secondsPerKm:108*60/16},l30:{km:16}},105);assert.deepEqual([next.expression,next.unavailable.native],['TIME','NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE']);
 const after=longA({latest:{secondsPerKm:116*60/16},comparable:{secondsPerKm:116*60/16},l30:{km:16}},105);assert.equal(after.expression,'TIME');
});
test('T13 R3: WE3-06 a stop at 12 km for fatigue is STOPPED, and the next long run is 16 km again; WE3-13, WE3-14 symptom stops',()=>{
 const f=longA(),r=read(f,{completed:false,minutes:75,distanceKm:12,measurement:'GPS',stop:{reason:'FATIGUE',metres:12000}});
 assert.deepEqual([r.status,r.stop.reason],['STOPPED','FATIGUE']);
 const again=longA({latest:{secondsPerKm:75*60/12}});assert.equal(km(again),16);assert.ok(near(again.estimate.durationMinutes.high,100));
 const reps=select(input({s:session({family:'TEN_K_SPECIFIC',step:{repetitions:6,workMinutes:4,recoveryMinutes:2},ladderStep:3}),fast:290,slow:300})),lap=(n,x={})=>({completed:true,minutes:40,steps:Array.from({length:n},(_,i)=>({block:1,rep:i,kind:'WORK',targetMet:true})),...x});
 assert.equal(line(reps),'6 x 800 m, 2 min walk-or-jog between');
 assert.equal(read(reps,lap(6)).status,'DISTANCE');
 const five=read(reps,{...lap(5),steps:[...lap(5).steps,{block:1,rep:5,kind:'WORK',targetMet:false}]});assert.equal(five.status,we3('WE3-12').status);assert.deepEqual([five.stepsMet,five.stepsPlanned],[5,6]);
 const symptom=read(reps,lap(3,{stop:{reason:'SYMPTOM'}}));assert.deepEqual([symptom.status,symptom.stop.reason],['STOPPED','SYMPTOM']);
 const silent=read(reps,lap(4,{stop:{}}));assert.deepEqual([silent.status,silent.stop.reason,silent.stop.stated],['STOPPED','SYMPTOM',false],'a stop with no reason is read as a symptom');
 assert.equal(read(reps,lap(4)).status,'UNKNOWN','a repetition with no lap and no confirmation is unknown, never met');
});
test('T13 R3: WE3-10 a declared run with no device, WE3-11 no evidence, WE3-23 a treadmill',()=>{
 const f=longA(),e=easyA();
 const declared=exec(f,{completed:true,minutes:97,declared:{distanceKm:16}});assert.deepEqual([declared.status,declared.basis,declared.paceEvidence],['DISTANCE','DECLARED',false]);
 const none=exec(f,{completed:true,minutes:97});assert.equal(none.status,we3('WE3-11').status);
 const treadmill=exec(e,{completed:true,minutes:48,distanceKm:8,measurement:'TREADMILL'});assert.deepEqual([treadmill.status,treadmill.basis,treadmill.tier,treadmill.paceEvidence],['DISTANCE','MEASURED','TREADMILL',false]);
});
test('T13 R3: WE3-15 to WE3-17, WE3-20, WE3-22 who gets time; WE3-19 the marathon long run at the cap',()=>{
 const novice=select(input({s:session({family:'EASY',minutes:30}),fast:EASY[0],slow:EASY[1],experience:'NOVICE'}));assert.deepEqual([novice.expression,novice.unavailable.native],['TIME',we3('WE3-15').reason]);
 for(const family of ['EASY','LONG'])assert.equal(select(input({s:session({family,minutes:40}),fast:345,slow:420,mode:'RETURN',history:{p1:P1,l30:{km:15.5},comparable:{secondsPerKm:368}}})).unavailable.native,'MODE_WALK_JOG_RESTART_RETURN');
 assert.equal(select(input({s:session({family:'THRESHOLD',step:{repetitions:4,workMinutes:5,recoveryMinutes:2}}),fast:310,slow:330,mode:'RETURN'})).unavailable.native,'MODE_WALK_JOG_RESTART_RETURN');
 // After the return: the threshold band is back, the observed easy range is not yet.
 assert.equal(select(input({s:session({family:'THRESHOLD',step:{repetitions:4,workMinutes:5,recoveryMinutes:2}}),fast:310,slow:330})).expression,'NATIVE');
 assert.equal(longA({p1:null}).unavailable.native,'CONTINUOUS_PACE_UNOBSERVED');assert.equal(easyA({p1:null}).unavailable.native,'CONTINUOUS_PACE_UNOBSERVED');
 const runs=[{id:'ledger:a',date:'2026-11-20',recordedOn:'2026-11-20',minutes:80,referenceKm:13,origin:'LEDGER',source:'GPS',conditions:[]}];
 assert.equal(comparableLongRun(runs,{cutoff:'2026-12-01',weekStart:'2026-12-01',minutes:100},VALUES),null,'80 min is less than M - 5');
 assert.equal(longA({comparable:null}).unavailable.native,'LONG_HISTORY_NOT_COMPARABLE');
 assert.equal(select(input({s:session({family:'RECOVERY_EASY',minutes:25}),fast:400,slow:490})).unavailable.native,we3('WE3-22').reason);
 const C={minutes:180,availableMinutes:240,bandFast:330,bandSlow:415,p1:{fastSecondsPerKm:335,slowSecondsPerKm:365},comparablePace:175*60/29,l30Km:29};
 assert.equal(sizeContinuous({...C,atMarathonCap:true},VALUES).distanceKm,null,'WE3-19: with the LONG slow edge no distance passes');
 const free=sizeContinuous({...C,atMarathonCap:false},VALUES);assert.equal(free.distanceKm,29.5);assert.ok(near(free.estimate.low,164.71)&&near(free.estimate.high,179.46));
});
test('T13 R3: WE3-21 two easy distance runs in a row above the estimate pause the class for 28 days',()=>{
 const f=easyA(),row=(date,minutes)=>({date,actual:{completed:true,minutes,distanceKm:8,measurement:'GPS'},execution:exec(f,{completed:true,minutes,distanceKm:8,measurement:'GPS'})});
 assert.equal(pausedUntil([row('2026-12-01',53),row('2026-12-03',52.5)],VALUES,onDate),'2026-12-31');
 assert.equal(pausedUntil([row('2026-12-01',53)],VALUES,onDate),null);
 assert.equal(pausedUntil([row('2026-12-01',53),row('2026-12-03',47),row('2026-12-05',53)],VALUES,onDate),null,'a run inside its estimate starts the count again');
 assert.equal(easyA({pausedUntil:'2026-12-31'}).unavailable.native,'CONTINUOUS_FORMAT_PAUSED');
});

// ---------- R3A: the evidence of the distance, and the history reference ----------
test('T13 R3A: WE3A-01 to WE3A-06 and WE3A-09 to WE3A-11: status, basis and the distance kept as history',()=>{
 const f=longA(),G={completed:true,minutes:97,measurement:'GPS'},ref=a=>historyReference(distanceFacts(a,VALUES));
 const cases=[
  ['WE3A-01',{...G,distanceKm:15.52,gpsQuality:'OK'},'PARTIAL',null,15.52],
  ['WE3A-02',{...G,distanceKm:15.52,gpsQuality:'POOR',deviceGpsQuality:'OK',declared:{distanceKm:16,reason:'SIGNAL_LOSS'}},'DISTANCE','CONFIRMED_CORRECTION',15.52],
  ['WE3A-03',{...G,distanceKm:15.52,gpsQuality:'OK',declared:{distanceKm:16}},'UNKNOWN',null,15.52],
  ['WE3A-04 without a reason',{...G,distanceKm:14,gpsQuality:'OK',declared:{distanceKm:16}},'UNKNOWN',null,14],
  ['WE3A-04 with a reason',{...G,distanceKm:14,gpsQuality:'POOR',deviceGpsQuality:'OK',declared:{distanceKm:16,reason:'OBSTRUCTED_SKY'}},'UNKNOWN',null,14],
  ['WE3A-05',{completed:true,minutes:97,declared:{distanceKm:16}},'DISTANCE','DECLARED',16],
  ['WE3A-06',{completed:true,minutes:97,distanceKm:16,measurement:'TRACK'},'DISTANCE','MEASURED',16],
  ['WE3A-09 no declaration',{...G,distanceKm:16.4,gpsQuality:'POOR'},'UNKNOWN',null,null],
  ['WE3A-09 declared',{...G,distanceKm:16.4,gpsQuality:'POOR',declared:{distanceKm:16}},'DISTANCE','CONFIRMED_CORRECTION',16],
  ['WE3A-10',{...G,distanceKm:14,gpsQuality:'POOR',deviceGpsQuality:null,segments:[{distanceKm:2.1,measurement:'GPS',reason:'DEVICE_RESTART'}]},'DISTANCE','MEASURED',16.1],
  ['WE3A-11',{...G,distanceKm:16.3,gpsQuality:'OK',declared:{distanceKm:15}},'PARTIAL',null,15],
 ];
 for(const [id,actual,status,basis,reference] of cases){const r=read(f,actual);assert.deepEqual([r.status,r.basis],[status,basis],id);assert.equal(ref(actual),reference,id+' history reference');assert.equal(actual.distanceKm,cases.find(c=>c[0]===id)[1].distanceKm,'the measured value is never rewritten');}
 assert.ok(near(VALUES.tied.correctionFloorFraction*16,14.56));
 assert.deepEqual([read(f,cases[2][1]).flag,read(f,cases[3][1]).flag,read(f,cases[4][1]).ask],['MEASUREMENT_CONFLICT','MEASUREMENT_CONFLICT','MEASURE_THE_MISSING_PART']);
 assert.equal(read(f,cases[0][1]).countsForPause,false,'WE3A-01: a usable measurement a little short neither counts for the pause nor resets it');
 assert.equal(read(f,cases[10][1]).countsForPause,true,'WE3A-11: the shortfall is the athlete\'s own answer');
 assert.equal(we3a('WE3A-01').expected?.status??we3a('WE3A-01').status,'PARTIAL');assert.equal(we3a('WE3A-05').basis,'DECLARED');assert.equal(we3a('WE3A-10').historyReferenceKm,16.1);assert.equal(we3a('WE3A-11').historyReferenceKm,15);
 // A run in several files is read as one only as the entry point records it (marked POOR, so the calibration never reads the first file alone).
 const twoFiles=read(f,{...G,distanceKm:14,segments:[{distanceKm:2.1,measurement:'GPS'}]});assert.deepEqual([twoFiles.status,twoFiles.flag],['UNKNOWN','SEGMENTS_NOT_MARKED_POOR']);
 // No tolerance ever meets a target: every measurement below 16 km without a correction is not DISTANCE.
 for(const d of [15.99,15.9,15.6,15.52])assert.notEqual(read(f,{...G,distanceKm:d}).status,'DISTANCE');
});
test('T13 R3A: WE3A-07 the distance reference changes only the expression; WE3A-08 an empty window is by time',()=>{
 const B={minutes:60,availableMinutes:60,bandFast:345,bandSlow:420,p1:{fastSecondsPerKm:345,slowSecondsPerKm:370}};
 const withDate=sizeContinuous({...B,l30Km:15},VALUES);assert.equal(withDate.distanceKm,9.5);assert.ok(near(withDate.estimate.low,54.63)&&near(withDate.estimate.high,58.58));
 assert.equal(sizeContinuous({...B,l30Km:8},VALUES).distanceKm,null,'with 8 km as the reference no distance keeps the dose floor: time, same 60 minutes');
 const x=input({s:session({family:'EASY',minutes:60}),fast:345,slow:420,available:60,history:{p1:null,l30:null,comparable:null,latest:null,pausedUntil:null}});
 assert.equal(suppressionOf(x,VALUES).reason,'CONTINUOUS_PACE_UNOBSERVED','the first reason in order when the window is empty');
 assert.equal(suppressionOf({...x,history:{...x.history,p1:B.p1}},VALUES).reason,'DISTANCE_HISTORY_UNKNOWN');
 assert.equal(suppressionOf({...x,phase:'POST_EVENT'},VALUES).reason,'PHASE_NOT_ELIGIBLE');assert.equal(suppressionOf({...x,mode:'RESTART'},VALUES).reason,'MODE_WALK_JOG_RESTART_RETURN');
});
