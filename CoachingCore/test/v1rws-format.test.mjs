// V1 Run Workout Structure: the format selector as a pure function. The pinned values against the three SSCTR records, the boundary fail closed,
// T4 (the Founder's examples and who is not eligible), T5 (each envelope check alone), T9 (each suppression reason and the order), T11
// (determinism and rotation), T12 (the values are load-bearing: a mutated value changes an outcome a test names).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {R2,R3,R3A,VALUES,session,input,select,line,hash} from './v1rws-helpers.mjs';
import * as M from '../src/v1-run-format.mjs';

const sha=f=>createHash('sha256').update(fs.readFileSync(new URL('../../'+f,import.meta.url))).digest('hex');
const plain=s=>String(s).replace(/\s*\(.*$/,'');
test('values: the file is the pinned bytes, binds the three records by hash, and every number and list is the records\' own',()=>{
 assert.equal(M.FORMAT_VALUES_FILE_SHA256,M.FORMAT_VALUES_SHA256);assert.ok(M.RUN_FORMATS);
 for(const d of VALUES.decisionRecords)assert.equal(sha(d.file),d.sha256,d.file);
 const a=R2.values,b=R3.values,c=R3A.values,T=VALUES.tied;
 assert.deepEqual([T.onBandFraction,T.qualityWarmupMinutes,T.qualityCooldownMinutes,T.calibrationBoutMinutesMin],[a.tiedValues.onBandFraction.value,a.tiedValues.qualityWarmupMinutes.value,a.tiedValues.qualityCooldownMinutes.value,a.tiedValues.calibrationBoutMinutesMin.value]);
 assert.deepEqual([T.doseFloor,T.windowDays,T.longRunStepMinutes,T.consecutiveSessions,T.paceRoundUpSeconds,T.marathonLongRunCapMinutes],[b.tiedValues.doseFloor.value,b.tiedValues.windowDays.value,b.tiedValues.longRunStepMinutes.value,b.tiedValues.consecutiveSessions.value,b.tiedValues.paceRoundUpSeconds.value,b.tiedValues.marathonLongRunCapMinutes.value]);
 assert.deepEqual([T.correctionFloorFraction,T.distanceReferenceDays,T.distanceReferenceMaxFraction],[c.tiedValues.correctionFloorFraction.value,c.tiedValues.distanceReferenceDays.value,c.tiedValues.distanceReferenceMaxFraction.value]);
 assert.ok(!('gpsMetFraction' in T),'no automatic GPS completion (R3A removed it)');assert.equal(T.marathonEstimateCentralMaxSeconds,6*3600);
 assert.deepEqual(VALUES.distances.repetitionMetres,a.distances.repetitionMetres);assert.deepEqual(VALUES.distances.candidateUnitPreferenceCoarsestFirst,a.distances.candidateUnitPreferenceCoarsestFirst);
 assert.deepEqual([VALUES.distances.recoveryUnitMetres,VALUES.distances.continuousKmUnitsCoarsestFirst],[a.distances.recoveryUnitMetres,a.distances.continuousKmUnitsCoarsestFirst]);
 assert.deepEqual([VALUES.envelope.E1.workHighMaxFractionOfStepWork,VALUES.envelope.E1.workLowMinFractionOfStepWork,VALUES.envelope.E2.repetitionHighMaxFractionOfStepRepetition,VALUES.envelope.E2.repetitionLowMinFraction],[a.envelope.E1.workHighMaxFractionOfStepWork,a.envelope.E1.workLowMinFractionOfStepWork,a.envelope.E2.repetitionHighMaxFractionOfStepRepetition,a.envelope.E2.repetitionLowMinFraction]);
 for(const f of ['THRESHOLD','FIVE_K_SPECIFIC','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','MARATHON_SPECIFIC']){const mine=VALUES.catalog[f],theirs=a.catalog[f];
  assert.deepEqual([mine.domain,mine.familyMinRepetitionMinutes,mine.rotationEntries,mine.equivalentFallback],[theirs.domain,theirs.familyMinRepetitionMinutes,theirs.rotationEntries,theirs.equivalentFallback],f);}
 assert.deepEqual(VALUES.catalog.RACE_TOUCH.rotationEntries,a.catalog.RACE_TOUCH.rotationEntries);assert.deepEqual([VALUES.catalog.EASY.rotationEntries,VALUES.catalog.LONG.rotationEntries],[a.catalog.EASY.rotationEntries,a.catalog.LONG.rotationEntries]);
 assert.deepEqual([VALUES.catalog.RECOVERY_EASY.rotationEntries,VALUES.catalog.SHAKEOUT.rotationEntries,VALUES.catalog.TIME_ONLY_FAMILIES],[b.catalog.RECOVERY_EASY.rotationEntries,b.catalog.SHAKEOUT.rotationEntries,b.catalog.TIME_ONLY_FAMILIES]);
 assert.deepEqual([VALUES.patterns.PYRAMID.flankStepMetres,VALUES.patterns.PYRAMID.shapesInOrder],[a.patterns.PYRAMID.flankStepMetres,a.patterns.PYRAMID.shapesInOrder]);
 assert.deepEqual([VALUES.patterns.EVEN_REPEATS.minRepetitions,VALUES.patterns.MIXED.minRepetitions,VALUES.patterns.PROGRESSIVE_REPEATS.minRepetitions,VALUES.patterns.PROGRESSIVE_REPEATS.families,VALUES.patterns.PROGRESSIVE_EASY.families],[a.patterns.EVEN_REPEATS.minRepetitions,a.patterns.MIXED.minRepetitions,a.patterns.PROGRESSIVE_REPEATS.minRepetitions,a.patterns.PROGRESSIVE_REPEATS.families,a.patterns.PROGRESSIVE_EASY.families]);
 assert.deepEqual(VALUES.patterns.EVEN_REPEATS.repetitionCountOffsets.map(o=>o===0?'n':o<0?'n-1':'n+1'),a.patterns.EVEN_REPEATS.repetitionCountCandidates);
 assert.deepEqual([VALUES.recoveryByDistance.experience,VALUES.recoveryByDistance.families,VALUES.recoveryByDistance.phases],[a.recoveryByDistance.experience,a.recoveryByDistance.families,a.recoveryByDistance.phases]);
 for(const [phase,theirs] of Object.entries(a.eligibility.phase))assert.deepEqual(VALUES.eligibility.phase[phase],Array.isArray(theirs)?theirs.map(plain):[],phase);
 assert.deepEqual(VALUES.eligibility.noviceRotationEntries,a.eligibility.experience.NOVICE.rotationEntries);assert.deepEqual([VALUES.eligibility.continuous.experience,VALUES.eligibility.continuous.mode,VALUES.eligibility.continuous.families],[b.eligibility.continuous.experience,b.eligibility.continuous.mode,b.continuous.families]);
 assert.deepEqual(VALUES.suppression.order,b.suppression.order);assert.deepEqual([VALUES.stops.reasons,VALUES.statuses.values],[b.stops.reasons,b.statuses.values]);assert.equal(VALUES.stops.missingReasonReadAs,plain(b.stops.missingReasonReadAs));
 assert.deepEqual(VALUES.runFacts.declaredFailureReasons,c.runFacts.declared.failureReasons.map(plain));assert.deepEqual(VALUES.runFacts.bases,c.runFacts.targetMet.bases);assert.deepEqual(VALUES.runFacts.quality,c.runFacts.reliability.quality);
});
test('authority: off without an independent record bound to the pinned bytes; a record of the author, of other bytes or without sources enables nothing',()=>{
 assert.equal(M.allowsFormat(M.runFormatAuthority()),false,'no enabling record exists yet: fail closed');
 const rec=x=>({records:[{boundaryId:'V1X-RUN-NATIVE',extensionSha256:M.FORMAT_VALUES_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['SRC-1'],...x}]});
 assert.equal(M.allowsFormat(M.runFormatAuthority({runFormatRecords:rec({})})),true);
 for(const bad of [{independent:false},{extensionSha256:'0'.repeat(64)},{sourceIds:[]},{disposition:'REJECT'},{evidenceStatus:'INSUFFICIENT_EVIDENCE'},{boundaryId:'V1X-RUN-DISTANCE'}])assert.equal(M.allowsFormat(M.runFormatAuthority({runFormatRecords:rec(bad)})),false,JSON.stringify(bad));
 const off=select(input({s:session({family:'THRESHOLD',step:{repetitions:5,workMinutes:5,recoveryMinutes:2},ladderStep:2}),fast:290,slow:300,enabled:false}));assert.deepEqual([off.expression,off.unavailable.native],['TIME','EXTENSION_NOT_ENABLED']);
});

const T5=(step,fast,slow)=>({step,band:{fastSecondsPerKm:fast,slowSecondsPerKm:slow},recoveryBand:{fastSecondsPerKm:350,slowSecondsPerKm:440},familyMinRepetitionMinutes:3,warmupMinutes:10,cooldownMinutes:5,budgetMinutes:240,canonicalDurationMinutes:10+5+step.repetitions*step.workMinutes+(step.repetitions-1)*step.recoveryMinutes});
const reps=(n,metres)=>Array.from({length:n},()=>({metres}));
test('T5: each envelope check rejects a candidate alone, with its own name; no native format gives time with the reason; a claim in a text gives time',()=>{
 const S={repetitions:6,workMinutes:4,recoveryMinutes:2},time={minutes:2};
 assert.equal(M.checkRepetitions(reps(6,800),time,T5(S,290,300),VALUES).ok,true);
 assert.equal(M.checkRepetitions(reps(6,800),time,T5(S,305,320),VALUES).failed,'E2','800 m at 5:20 is longer than 1.015 of the 4-minute repetition');
 assert.equal(M.checkRepetitions(reps(6,650),time,T5(S,290,300),VALUES).failed,'E2','650 m at 4:50 is shorter than 0.9 of it');
 assert.equal(M.checkRepetitions(reps(5,800),time,T5(S,290,300),VALUES).failed,'E1','five repetitions of the right length are less than 0.9 of the work');
 assert.equal(M.checkRepetitions(reps(7,800),time,T5(S,290,300),VALUES).failed,'E1','seven are more than 1.015 of it');
 assert.equal(M.checkRepetitions(reps(6,800),{metres:350},T5(S,290,300),VALUES).failed,'E3','five 350 m jogs take the session past one extra recovery interval');
 assert.equal(M.checkRepetitions(reps(6,800),time,{...T5(S,290,300),budgetMinutes:48},VALUES).failed,'E3','the session budget');
 // E4 is not applied to a native session (R3 C6): no candidate is rejected for its low duration.
 assert.ok(!JSON.stringify(M.checkRepetitions(reps(6,800),time,T5(S,290,300),VALUES).checks).includes('E4'));
 const none=select(input({s:session({family:'FIVE_K_SPECIFIC',step:{repetitions:8,workMinutes:2,recoveryMinutes:2}}),fast:290,slow:305,phase:'SPECIFIC'}));
 assert.deepEqual([none.expression,none.unavailable.native,none.unavailable.detail],['TIME','NO_FORMAT_WITHIN_ENVELOPE',undefined],'WE-05; a 5K family has no EQUIVALENT fallback');
 const wide=select(input({s:session({family:'THRESHOLD',step:{repetitions:4,workMinutes:5,recoveryMinutes:2}}),fast:395,slow:445,phase:'BUILD'}));
 assert.deepEqual([wide.expression,wide.unavailable.native,wide.unavailable.detail],['TIME','NO_FORMAT_WITHIN_ENVELOPE','EQUIVALENT_MODE_NOT_PART_OF_THIS_EXTENSION']);
 const s=session({family:'THRESHOLD',step:{repetitions:5,workMinutes:5,recoveryMinutes:2},ladderStep:2}),claim={...s,prescription:{...s.prescription,effort:'Run at your lactate threshold'}};
 assert.deepEqual([select(input({s:claim,fast:290,slow:300})).unavailable.native,select(input({s,fast:290,slow:300})).expression],['TEXT_CHECK_FAILED','NATIVE'],'E5');
 // The time expression is the canonical prescription: its own duration, and its own planned hash untouched.
 assert.equal(none.estimate.durationMinutes.high,45);assert.equal(none.planning.plannedPrescriptionHash,none.plannedPrescriptionHash);
});

// ---------- T9: every state that gives time, and the order ----------
const P1={fastSecondsPerKm:340,slowSecondsPerKm:370},H={p1:P1,l30:{km:15.5},comparable:{secondsPerKm:368},latest:null,pausedUntil:null};
const baseLong=(sx={},ix={})=>input({s:session({family:'LONG',minutes:100,...sx}),fast:345,slow:420,available:120,history:H,...ix});
const STATES={
 EXTENSION_NOT_ENABLED:[{},{enabled:false}],HOLD_NO_PRESCRIPTION:[{},{engineStatus:'HOLD'}],CLINICAL_ROUTE:[{},{engineStatus:'CLINICAL_HUMAN_REQUIRED'}],WARNING_SIGN_SCREEN_REQUIRED:[{},{screenRequired:true}],
 MODE_WALK_JOG_RESTART_RETURN:[{},{mode:'RESTART'}],ENGINE_CONVERTED_TO_EASY:[{converted:'BUDGET'},{}],TEST_ALREADY_DONE_THIS_WEEK:[{},{guidance:{pace:{status:'UNAVAILABLE',reason:'TEST_ALREADY_DONE_THIS_WEEK'}}}],
 PHASE_NOT_ELIGIBLE:[{},{phase:'POST_EVENT'}],EXPRESSION_PREFERENCE_TIME:[{},{preference:'TIME'}],EXPERIENCE_NOT_ELIGIBLE:[{},{experience:'NOVICE'}],BAND_UNAVAILABLE:[{},{guidance:{pace:{status:'UNAVAILABLE',reason:'NO_QUALIFYING_EVIDENCE'}}}],
 CONTINUOUS_PACE_UNOBSERVED:[{},{history:{...H,p1:null}}],LONG_HISTORY_NOT_COMPARABLE:[{},{history:{...H,comparable:null}}],DISTANCE_HISTORY_UNKNOWN:[{},{history:{...H,l30:null}}],CONTINUOUS_FORMAT_PAUSED:[{},{history:{...H,pausedUntil:'2027-01-01'}}],
};
test('T9: each state gives the time expression with its own reason, and of two states the earlier in the catalog\'s order is the one reported',()=>{
 assert.equal(select(baseLong()).expression,'NATIVE');
 const order=VALUES.suppression.order,names=Object.keys(STATES);
 for(const n of names){const [sx,ix]=STATES[n],r=select(baseLong(sx,ix));assert.deepEqual([r.expression,r.unavailable.native],['TIME',n]);assert.ok(order.includes(n));}
 for(const a of names)for(const b of names){
  if(order.indexOf(a)>=order.indexOf(b))continue;const [sa,ia]=STATES[a],[sb,ib]=STATES[b];
  // Two states that set the same input are one state; the history states are composed field by field.
  const merged={...ia,...ib,...(ia.history&&ib.history?{history:{...H,...Object.fromEntries(Object.entries(ia.history).filter(([k,v])=>v!==H[k])),...Object.fromEntries(Object.entries(ib.history).filter(([k,v])=>v!==H[k]))}}:{})};
  if(ia.guidance&&ib.guidance||ia.engineStatus&&ib.engineStatus)continue;
  assert.equal(select(baseLong({...sa,...sb},merged)).unavailable.native,a,`${a} before ${b}`);
 }
 // The states a long run cannot show.
 assert.equal(select(input({s:session({family:'RECOVERY_EASY',minutes:25}),fast:400,slow:490})).unavailable.native,'NOT_A_NATIVE_FAMILY');
 for(const family of VALUES.catalog.TIME_ONLY_FAMILIES.filter(f=>['RECOVERY_EASY','SHAKEOUT'].includes(f)))assert.equal(select(input({s:session({family,minutes:20}),fast:400,slow:490})).expression,'TIME');
 const T={repetitions:4,workMinutes:5,recoveryMinutes:2};
 assert.equal(select(input({s:session({family:'THRESHOLD',step:T,firstExposure:true,ladderStep:0}),fast:310,slow:330})).unavailable.native,'FIRST_EXPOSURE');
 assert.equal(select(input({s:session({family:'THRESHOLD',step:T,firstExposure:true,ladderStep:0}),fast:310,slow:330,phase:'ESTABLISHMENT'})).unavailable.native,'PHASE_NOT_ELIGIBLE','the phase before the first exposure');
 const mar={s:session({family:'MARATHON_SPECIFIC',step:{repetitions:3,workMinutes:15,recoveryMinutes:3}}),fast:500,slow:520,experience:'EXPERIENCED',phase:'SPECIFIC'};
 assert.equal(select(input({...mar,marathonEstimate:{status:'AVAILABLE',centralSeconds:21601}})).unavailable.native,'MARATHON_ESTIMATE_ABOVE_360_MIN');
 assert.notEqual(select(input({...mar,marathonEstimate:{status:'AVAILABLE',centralSeconds:21600}})).unavailable?.native,'MARATHON_ESTIMATE_ABOVE_360_MIN','exactly six hours is not above it');
 // Under any of them the session is whole: the canonical prescription in steps, never an empty session.
 for(const n of names){const [sx,ix]=STATES[n],r=select(baseLong(sx,ix));assert.ok(Math.abs(M.stepsMinutes(r.blocks)-100)<1e-9,n);}
});

test('T4: the Founder\'s examples are produced where the record admits them, and never for who is not eligible',()=>{
 const q=(family,step,fast,slow,x={})=>select(input({s:session({family,step,ladderStep:2}),fast,slow,weekIndex:0,...x}));
 assert.equal(line(q('TEN_K_SPECIFIC',{repetitions:6,workMinutes:4,recoveryMinutes:2},290,300)),'6 x 800 m, 2 min walk-or-jog between');
 assert.equal(line(q('TEN_K_SPECIFIC',{repetitions:6,workMinutes:4,recoveryMinutes:2},305,320)),'6 x 750 m, 2 min walk-or-jog between');
 assert.equal(line(q('FIVE_K_SPECIFIC',{repetitions:8,workMinutes:2,recoveryMinutes:2},290,300,{phase:'SPECIFIC'})),'8 x 400 m, 2 min walk-or-jog between');
 assert.equal(line(q('THRESHOLD',{repetitions:5,workMinutes:5,recoveryMinutes:2},290,300)),'5 x 1000 m, 2 min walk-or-jog between');
 assert.equal(line(q('TEN_K_SPECIFIC',{repetitions:5,workMinutes:4,recoveryMinutes:2},230,240,{experience:'EXPERIENCED'})),'5 x 1000 m, 2 min walk-or-jog between');
 // A distance repetition never ends by time: its target is the distance alone and the time is an estimate.
 const w=M.flatSteps(q('THRESHOLD',{repetitions:5,workMinutes:5,recoveryMinutes:2},290,300).blocks).find(s=>s.kind==='WORK');assert.deepEqual([w.target,w.estimate],[{type:'DISTANCE',metres:1000},{seconds:{low:290,high:300}}]);
 // A novice: even repetitions with time recoveries only, whatever the week; never a continuous distance.
 for(let week=0;week<6;week++){const r=q('THRESHOLD',{repetitions:4,workMinutes:5,recoveryMinutes:2},310,330,{experience:'NOVICE',weekIndex:week,recovery:[400,490]});assert.deepEqual([r.pattern,line(r)],['EVEN_REPEATS','4 x 900 m, 2 min walk-or-jog between']);}
 assert.equal(select(input({s:session({family:'EASY',minutes:50}),fast:340,slow:405,experience:'NOVICE',history:H})).unavailable.native,'EXPERIENCE_NOT_ELIGIBLE');
 assert.equal(select(input({s:session({family:'EASY',minutes:50}),fast:340,slow:405,experience:null,history:H})).unavailable.native,'EXPERIENCE_NOT_ELIGIBLE','unknown experience is the engine\'s novice');
});
test('T11: the same input gives the same format; the rotation moves only with the week\'s index, and returns to even repetitions after a partial session',()=>{
 const S={repetitions:5,workMinutes:5,recoveryMinutes:2},at=(week,x={})=>select(input({s:session({family:'THRESHOLD',step:S,ladderStep:2}),fast:290,slow:300,recovery:[400,490],weekIndex:week,...x}));
 assert.equal(hash(at(3)),hash(at(3)));assert.equal(at(3).formatHash,at(3).formatHash);
 const seen=[0,1,2,3,4,5,6,7].map(w=>at(w).pattern),cycle=['EVEN_REPEATS','EVEN_REPEATS_DISTANCE_RECOVERY','MIXED','PROGRESSIVE_REPEATS'];
 assert.deepEqual(seen,[...cycle,...cycle],'a pyramid needs a repetition longer than the family\'s shortest; the four entries that pass rotate');
 assert.deepEqual([1,2,3].map(w=>at(w,{prior:{evenOnly:true,peakMetres:null}}).pattern),['EVEN_REPEATS','EVEN_REPEATS','EVEN_REPEATS']);
 assert.deepEqual([0,1,2,3].map(w=>at(w,{phase:'CONSOLIDATION'}).pattern),Array(4).fill('EVEN_REPEATS'),'consolidation: even repetitions only');
 assert.ok(!['PYRAMID'].includes(at(2,{phase:'SPECIFIC'}).pattern));
 // The dose is the engine's: no format changes the planned prescription, its hash or the step.
 for(const w of [0,1,2,3])assert.deepEqual([at(w).planning.plannedPrescriptionHash,at(w).planning.workMinutes,at(w).planning.durationMinutes],[at(0).plannedPrescriptionHash,25,48]);
 // A different band is a different format (a report is read against the one it cites).
 assert.notEqual(at(0).formatHash,select(input({s:session({family:'THRESHOLD',step:S,ladderStep:2}),fast:295,slow:305,weekIndex:0})).formatHash);
});
test('T12: every value is load-bearing: a mutated envelope, unit, rounding or sizing value changes an outcome',()=>{
 const mutate=f=>{const v=JSON.parse(JSON.stringify(VALUES));f(v);return v;},ten={repetitions:6,workMinutes:4,recoveryMinutes:2},c=T5(ten,305,320);
 const even=V=>M.repetitionCandidate('EVEN_REPEATS',c,V)?.works[0].metres??null;
 assert.equal(even(VALUES),750);
 const eight=V=>M.checkRepetitions(reps(6,800),{minutes:2},c,V).failed;assert.equal(eight(VALUES),'E2');assert.equal(eight(mutate(v=>{v.envelope.E2.repetitionHighMaxFractionOfStepRepetition=1.07;})),'E1','E2 high: 800 m then passes E2 and is stopped by E1');
 assert.equal(even(mutate(v=>{v.envelope.E2.repetitionHighMaxFractionOfStepRepetition=1.07;v.envelope.E1.workHighMaxFractionOfStepWork=1.07;})),800,'E1 high');
 assert.equal(even(mutate(v=>{v.envelope.E2.repetitionLowMinFraction=0.96;})),null,'E2 low');
 const pyramid=V=>M.repetitionCandidate('PYRAMID',T5(ten,290,300),V)?.works.map(w=>w.metres).join('-')??null;
 assert.equal(pyramid(VALUES),'700-800-800-800-800-700');assert.notEqual(pyramid(mutate(v=>{v.envelope.E1.workLowMinFractionOfStepWork=0.94;})),'700-800-800-800-800-700','E1 low');
 assert.equal(M.repetitionCandidate('PYRAMID',{...T5(ten,290,300),familyMinRepetitionMinutes:3.9},VALUES),null,'a flank is held to 0.9 of the shortest ladder repetition of its family');
 assert.equal(M.repetitionCandidate('PYRAMID',T5(ten,290,300),mutate(v=>{v.patterns.PYRAMID.shapesInOrder=v.patterns.PYRAMID.shapesInOrder.slice(0,3);})),null,'the shapes');
 const jogs=V=>M.checkRepetitions(reps(6,800),{metres:350},T5(ten,290,300),V);assert.equal(jogs(VALUES).failed,'E3');assert.equal(jogs(mutate(v=>{v.envelope.E3.extraRecoveryIntervalsOfTheStep=2;})).ok,true,'E3');
 const five=V=>M.repetitionCandidate('EVEN_REPEATS',T5({repetitions:5,workMinutes:5,recoveryMinutes:2},285,300),V)?.works[0].metres;
 assert.equal(five(VALUES),1000);assert.equal(five(mutate(v=>{v.distances.candidateUnitPreferenceCoarsestFirst=[50];})),1000);
 const order=V=>M.repetitionCandidate('MIXED',T5({repetitions:2,workMinutes:15,recoveryMinutes:3},320,330),V).works[0].metres;
 assert.equal(order(VALUES),2600);assert.equal(order(mutate(v=>{v.distances.candidateUnitPreferenceCoarsestFirst=[50];})),2700,'the unit preference decides between 2600 m and 2700 m (the WE-17 finding)');
 assert.equal(M.recoveryMetres(2,{fastSecondsPerKm:350},VALUES),350);assert.equal(M.recoveryMetres(2,{fastSecondsPerKm:350},mutate(v=>{v.distances.recoveryUnitMetres=100;})),400,'the recovery rounds up');
 const B={minutes:60,availableMinutes:60,bandFast:345,bandSlow:420,p1:{fastSecondsPerKm:345,slowSecondsPerKm:370},l30Km:15},size=V=>M.sizeContinuous(B,V).distanceKm;
 assert.equal(size(VALUES),9.5);assert.equal(size(mutate(v=>{v.distances.continuousKmUnitsCoarsestFirst=[1];})),null,'the half-kilometre unit');
 assert.equal(size(mutate(v=>{v.tied.doseFloor=0.8;})),9,'CT-2');assert.equal(M.sizeContinuous({...B,l30Km:8.5},mutate(v=>{v.tied.distanceReferenceMaxFraction=1.2;})).distanceKm,9.5,'CT-3');assert.equal(M.sizeContinuous({...B,l30Km:8.5},VALUES).distanceKm,null);
 assert.equal(M.sizeContinuous({...B,latestPace:371},VALUES).pSize,375);assert.equal(M.sizeContinuous({...B,latestPace:371},mutate(v=>{v.tied.paceRoundUpSeconds=1;})).pSize,371,'paces round up to 5 s');
 assert.equal(M.sizeContinuous({...B,availableMinutes:50},VALUES).distanceKm,null,'CT-1 reads the athlete\'s available minutes');
});
