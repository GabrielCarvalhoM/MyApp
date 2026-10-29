// QE probe I (canonical input stability, C06/C07 classes, intake): r6-intake `lead` merges strength records by (complete dose,
// observedAt as a raw string, source === 'SELF_REPORT', hash). I1: on the same date the literal label decides; I2: observedAt strings
// are compared without normalisation (timestamps, offsets); I3: a later record without any load displaces an earlier one that carries
// a load hint, which changes the first-log adoption decision (ESTABLISHMENT_LOG_MATCHES_HINT).
import {cur,opts,intake,review,obs,addDays,out} from './qe-lib.mjs';
const R=cur;
const base={id:'db-row',sets:3,reps:10,current:true,familiar:true,tolerated:true};
const mk=known=>R.canonicalizeIntake(intake({id:'qe-I',athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],knownExercises:known},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50,longRunDay:null}})).canonical.athlete.knownExercises.find(e=>e.id==='db-row');
const pick=e=>({load:e.dose?.load?.value??null,hint:e.loadHint?.value??null,source:e.source,observedAt:e.observedAt});
const A={...base,load:{value:20,unit:'KG',convention:'PER_HAND'},rir:2,observedAt:'2026-10-29'},B={...base,load:{value:24,unit:'KG',convention:'PER_HAND'},rir:2,observedAt:'2026-10-29'};
const I1={selfA_watchB:pick(mk([{...A,source:'SELF_REPORT'},{...B,source:'APPLE_HEALTH'}])),watchA_selfB:pick(mk([{...A,source:'APPLE_HEALTH'},{...B,source:'SELF_REPORT'}])),lowercaseSelfA_watchB:pick(mk([{...A,source:'self_report'},{...B,source:'APPLE_HEALTH'}])),watchA_lowercaseSelfB:pick(mk([{...A,source:'APPLE_HEALTH'},{...B,source:'self_report'}])),manualA_watchB:pick(mk([{...A,source:'MANUAL'},{...B,source:'APPLE_HEALTH'}])),watchA_manualB:pick(mk([{...A,source:'APPLE_HEALTH'},{...B,source:'MANUAL'}]))};
// I2: the same instant 2026-10-29T20:00Z written with two offsets, against a later instant in UTC.
const I2={laterInstantLoses:pick(mk([{...A,observedAt:'2026-10-30T01:00:00+05:00'},{...B,observedAt:'2026-10-29T22:00:00Z'}])),note:'2026-10-30T01:00:00+05:00 is 2026-10-29T20:00Z, earlier than 2026-10-29T22:00Z (B, 24 kg)',sameDayTimestampBeatsSelfReportRule:pick(mk([{...A,source:'SELF_REPORT',observedAt:'2026-10-29'},{...B,source:'APPLE_HEALTH',observedAt:'2026-10-29T06:00:00Z'}]))};
// I3: an earlier record with a load but no RIR (no complete dose: load hint 20 kg per hand) and a later record with no load at all.
const base3={...base,id:'db-rdl',reps:8};const H={...base3,load:{value:20,unit:'KG',convention:'PER_HAND'},rir:undefined,observedAt:'2026-10-27'},L={...base3,load:undefined,rir:undefined,observedAt:'2026-10-30'};
const run=known=>{const g=R.generateProgram(intake({id:'qe-I3',weeks:8,athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],knownExercises:known,exerciseRotationPreference:'FIXED'},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50,longRunDay:null}}),opts);const p=g.program;
 const X='db-rdl',s=p.weeks[0].sessions.find(x=>x.sport==='STRENGTH'&&x.prescription?.exercises.some(e=>e.id===X)),exposures=p.weeks[0].sessions.filter(x=>x.prescription?.exercises?.some(e=>e.id===X)).length;
 const list=p.weeks[0].sessions.filter(x=>x.prescription).map(x=>obs(p,x,{over:{[X]:{load:{value:20,unit:'KG',convention:'PER_HAND'}}}}));
 const r=R.evaluateProgram(p,review(p,0,{observations:list}),opts),st=(r.proposal??p).stateTrace[1].strength.exercises[X];
 return {knownRecord:pick(g.program?R.canonicalizeIntake(intake({id:'x',athlete:{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH'],knownExercises:known},schedule:{runDays:[],strengthDays:[0,3],strengthMinutes:50,longRunDay:null}})).canonical.athlete.knownExercises.find(e=>e.id===X):{}),exposuresWeek0:exposures,week0Row:s.prescription.exercises.find(e=>e.id===X).load.mode,decision:`${r.status}/${r.action}`,stateAfterWeek0:{mode:st?.mode,load:st?.load??null,pendingLoad:st?.pendingLoad??null},questions:(r.loadQuestions??[]).filter(q=>q.exerciseId===X).map(q=>q.reason)};};
const I3={hintOnly:run([H]),hintThenLaterNoLoadRecord:run([H,L]),noLoadRecordOnly:run([L])};
out('I',{I1_sameDateLabelDecides:I1,I2_observedAtStringOrder:I2,I3_laterRecordWithoutLoadDisplacesHint:I3});
