// QE re-check probe P7 (R7A-QE-r2, FREEZE-2).
// 7a (QE-R7A-13 "a date-only record counts from the latest instant of its day, as observations do"): the intake lead reads a date-only
//    record at T23:59:59Z, while observations use the athlete's local day (timezoneOffsetMinutes). Athlete at UTC+5: a date-only record of
//    2026-10-29 (24 kg) and a timestamped record 2026-10-30T01:00:00+05:00 (local 30 October, 20 kg).
// 7b (SSCTR D55 addition, engineering reading only): exercises first set up in a return step week (permanent move to machines on the
//    Monday of step week 7). For each week, the projected next-week state versus the reviewed one for an as-prescribed execution.
// Synthetic data, DEV_TEST_ONLY authority.
import {cur,opts,intake,review,obs,addDays,out,SQUAT} from './qe-lib.mjs';
const res={};
// ---------- 7a ----------
{
 const rec=(load,observedAt)=>({...SQUAT,load:{value:load,unit:'KG',convention:'TOTAL'},observedAt});
 const variants={
  dateOnlyFirst:[rec(24,'2026-10-29'),rec(20,'2026-10-30T01:00:00+05:00')],
  timestampFirst:[rec(20,'2026-10-30T01:00:00+05:00'),rec(24,'2026-10-29')]
 };
 const o={};
 for(const [k,list] of Object.entries(variants)){
  const g=cur.generateProgram(intake({id:'qe-rc-P7a-'+k,timezoneOffsetMinutes:300,athlete:{knownExercises:list,exerciseRotationPreference:'FIXED'}}),opts);
  const ex=g.program?.canonical?.athlete?.knownExercises?.find(e=>e.id==='back-squat');
  const row=g.program?.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id==='back-squat');
  o[k]={status:g.status,leadObservedAt:ex?.observedAt??null,leadLoad:ex?.dose?.load?.value??ex?.load?.value??null,week0Squat:row?`${row.sets}x${row.reps} ${row.load.mode} ${row.load.value??''}`:null};
 }
 res['7a_intakeLocalDay']={timezoneOffsetMinutes:300,note:'local 30 Oct (timestamped, 20 kg) is later than local 29 Oct (date-only, 24 kg)',variants:o,laterLocalDayLeads:Object.values(o).every(v=>v.week0Squat?.endsWith('20'))};
}
// ---------- 7b ----------
{
 let p=cur.generateProgram(intake({id:'qe-rc-P7b',weeks:16,athlete:{exerciseRotationPreference:'FIXED',goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}}}),opts).program,ledger=[];const log=[];
 const step=(w,extra={},list=null)=>{const r=cur.evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
 for(let w=0;w<4;w++)step(w);step(4,{},[]);step(5,{},[]);
 step(6,{day:0,hour:'06',kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[6].startDate,-16),endDate:addDays(p.weeks[6].startDate,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
 step(6);
 step(7,{day:0,hour:'05',kind:'EQUIPMENT_CHANGE',changes:{equipment:['MACHINES']}},[]);
 const F=['returnStep','returnInBlock','regainCap','setCap','setCeiling','lastExecutedSets','blocksDone','sets'],pick=e=>e?Object.fromEntries(F.map(k=>[k,e[k]??null])):null;
 const diffs=[];let compared=0;const fresh=new Set();
 for(let w=7;w<14;w++){
  const before=structuredClone(p.stateTrace[w+1].strength.exercises);const r=step(w);const after=p.stateTrace[w+1].strength.exercises;
  for(const [id,e] of Object.entries(after)){if(!p.stateTrace[7].strength.exercises[id])fresh.add(id);const b=before[id];if(!b)continue;compared++;if(JSON.stringify(pick(b))!==JSON.stringify(pick(e)))diffs.push({week:w,id,decision:`${r.status}/${r.action}`,projected:pick(b),reviewed:pick(e)});}
 }
 res['7b_d55ProjectionVsReview']={log:log.join(' '),exercisesFirstSetUpDuringReturn:[...fresh],stateEntriesCompared:compared,differences:diffs.length,examples:diffs.slice(0,4),
  freshStatesWeek9:Object.fromEntries([...fresh].map(id=>[id,pick(p.stateTrace[9]?.strength?.exercises?.[id])]))};
}
out('P7',res);
