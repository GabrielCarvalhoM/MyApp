// R7B1-ENG-r1 judge observation J4c: a reason-based substitution of a capped (strength-NONE, four-day) athlete re-chooses the capped arrangement,
// so the full and core sessions change days, from the decision's own week, while the decision states only the exercise change. Read-only;
// PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,apply,LABEL} from './lib.mjs';
const o={id:'j4c-novice',strengthExperience:'NONE',equipment:['DUMBBELLS','BENCH'],goals:{run:'REGULAR',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4,5]}};
const days=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>`d${s.day}:${s.templateType}`).join(' ');
guard('J4c','arrangement',()=>{
 const t=reviewed(o,1),before={w1:days(t.p,1),w2:days(t.p,2)};
 const r=apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'front-plank',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts));
 const after={w1:days(t.p,1),w2:days(t.p,2)};weekly(t,1);
 record('J4c','observation: a substitution re-chooses the capped arrangement',before.w1===after.w1&&before.w2===after.w2,'a reason-based substitution changes the exercise it names and keeps the days of the full and core sessions',{label:LABEL,decision:{status:r.status,reason:r.reason,arrangementTrace:r.proposal?.decisions.at(-1)?.arrangement??null},before,after,week2AfterNextReview:days(t.p,2)});
});
done('j4c-capped-arrangement-obs');
