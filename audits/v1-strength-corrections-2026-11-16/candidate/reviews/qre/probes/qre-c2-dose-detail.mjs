// QRE V1STR R1, probe C2 (read-only): the dose differences of probe C, by exercise; whether the exercise was selected by the rule; sessions over the athlete's strength minutes.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-c2-dose-detail.mjs
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {lifter,hybrid,live,hash,EQUIPMENT,DEV,OFF,only} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const GOALS=['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'],EXP=['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'],DAYS=[[1,4],[1,3,5],[0,2,4,6]];
const plans=new Set(),ids={},setsEx=[],byExp={},persist=[];let overMinutes=0,overMinutesOff=0,sessions=0;
for(const eq of Object.keys(EQUIPMENT))for(const goal of GOALS)for(const experience of EXP)for(const days of DAYS){
 const intake=lifter({goal,experience,equipment:EQUIPMENT[eq],days}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,only('PLANE')).program,d=S.generateProgram(intake,DEV).program;
 const name=`${eq} ${goal} ${experience} ${days.length}d`;
 for(const p of [a,d])for(const w of p.weeks)for(const s of w.sessions.filter(x=>live(x)&&x.sport==='STRENGTH')){sessions++;if(s.prescription.durationMinutes>intake.schedule.strengthMinutes){if(p===d)overMinutes++;else overMinutesOff++;}}
 const tmplA=Object.fromEntries((a.templates??[]).flatMap(t=>t.rows.map(r=>[t.type+':'+r.slot,r.entry.id]))),tmplB=Object.fromEntries((b.templates??[]).flatMap(t=>t.rows.map(r=>[t.type+':'+r.slot,r.entry.id])));
 const ruleChanged=new Set(Object.keys(tmplB).filter(k=>tmplA[k]!==tmplB[k]).map(k=>tmplB[k]));
 for(let w=0;w<a.weeks.length;w++){const sx=a.weeks[w].sessions.filter(x=>live(x)&&x.sport==='STRENGTH'),sy=b.weeks[w].sessions.filter(x=>live(x)&&x.sport==='STRENGTH');
  for(const s of sx){const t=sy.find(z=>z.id===s.id);if(!t)continue;s.prescription.exercises.forEach((e,i)=>{const f=t.prescription.exercises[i];if(!f||f.id!==e.id)return;
   if(hash([e.sets,e.reps,e.rir,e.load])!==hash([f.sets,f.reps,f.rir,f.load])){plans.add(name);byExp[experience]=(byExp[experience]??0)+1;const k=e.id+(ruleChanged.has(e.id)?' (selected by the rule)':' (not selected by the rule)');ids[k]=(ids[k]??0)+1;
    if(e.sets!==f.sets&&setsEx.length<5)setsEx.push({name,w,s:s.id,id:e.id,off:[e.sets,e.reps,e.rir,e.load?.mode,e.load?.value],on:[f.sets,f.reps,f.rir,f.load?.mode,f.load?.value]});
    if(w===a.weeks.length-1&&persist.length<6)persist.push({name,id:e.id,lastWeek:{off:[e.sets,e.reps,e.load?.mode],on:[f.sets,f.reps,f.load?.mode]}});}
  });}
 }
}
console.log(JSON.stringify({plansWithSameExerciseDoseDiff:plans.size,byExperience:byExp,exercises:ids,setsExamples:setsEx,stillDifferentInLastWeek:persist,sessionsOverStrengthMinutes:{withRules:overMinutes,withoutRules:overMinutesOff,of:sessions}},null,1));
