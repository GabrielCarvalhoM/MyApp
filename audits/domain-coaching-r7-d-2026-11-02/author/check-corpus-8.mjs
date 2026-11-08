// R7-D structural corpus check, version 8 (R7D-INTERFACE-8 §2, §7): the unchanged check-corpus.mjs (its errors and warnings, word for word) plus
// advice about references that may not resolve once an adopted decision re-plans a week. It never imports or runs the coach and knows nothing
// about its rules: a warning is advice, never an error, and a case without warnings can still be a corpus error.
//   node check-corpus-8.mjs <corpus.json>   (exit 1 on any error of the base checker)
import fs from 'node:fs';
import {checkCorpus} from './check-corpus.mjs';

// Steps whose adopted decision may re-plan the weeks after it (R7D-INTERFACE-8 §2): a stated break or return, a schedule, equipment or goal change,
// a substitution, a conflict. A plain weekly review keeps the athlete's chosen days, so it starts no advice.
const REPLANS=['RETURN_AFTER_PAUSE','SCHEDULE_CHANGE','EQUIPMENT_CHANGE','GOAL_CHANGE','EVENT_DATE_CHANGE','EXERCISE_SUBSTITUTION','UNAVAILABLE_DAY','DOUBLE_CONFLICT','EVENT_WEEK_CONFLICT'];
const statesBreak=s=>{const i=s?.event?.interruption??s?.answer?.declareBreak;return !!i&&typeof i==='object'&&Object.values(i).some(v=>v!==null&&v!==undefined&&v!=='');};
const weekOfStep=s=>s?.at&&typeof s.at==='object'&&Number.isInteger(s.at.week)?s.at.week:null;

export function adviseCorpus(corpus){
 const warnings=[];
 for(const c of corpus?.cases??[]){
  let replanFrom=null;
  for(const s of c?.timeline??[]){
   const at=`case ${c.caseId} step ${s?.stepId}`,w=weekOfStep(s);
   const refs=[...(s?.observations??[]).filter(f=>f&&f.ref).map(f=>['fact',f.ref]),...(s?.answer?.overrides??[]).filter(o=>o&&o.ref).map(o=>['answer override',o.ref]),...(s?.targetRef?[['targetRef',s.targetRef]]:[])];
   for(const [kind,r] of refs)if(r.day!=null&&replanFrom!==null&&Number.isInteger(r.week)&&r.week>=replanFrom)
    warnings.push(`${at}: ${kind} {week:${r.week}, sport:${r.sport}, day:${r.day}} names a day in a week an earlier adopted decision may have re-planned; prefer {week, sport, role} without a day, or the bulk form (R7D-INTERFACE-8 §2)`);
   const x=s?.event?.substitution?.exerciseRef;
   if(x&&x.day!=null&&x.pattern)warnings.push(`${at}: substitution.exerciseRef gives day ${x.day} and pattern ${x.pattern}: that day's session must hold a ${x.pattern} exercise; omit the day to name the first session of week ${x.week} that holds one (R7D-INTERFACE-8 §2)`);
   // From this step on, later weeks may be re-planned: a stated break, a return or a change, from its own week.
   const kind=s?.event?.kind,own=statesBreak(s)||REPLANS.includes(kind)?w:null;
   if(own!==null)replanFrom=replanFrom===null?own:Math.min(replanFrom,own);
  }
 }
 return warnings;
}
export function checkCorpus8(corpus){const base=checkCorpus(corpus);return {errors:base.errors,warnings:[...base.warnings,...(base.errors.length?[]:adviseCorpus(corpus))]};}

const main=process.argv[1]&&import.meta.filename&&process.argv[1].endsWith('check-corpus-8.mjs');
if(main){
 const corpus=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),r=checkCorpus8(corpus);
 console.log(JSON.stringify({errors:r.errors,warnings:r.warnings},null,1));
 process.exitCode=r.errors.length?1:0;
}
