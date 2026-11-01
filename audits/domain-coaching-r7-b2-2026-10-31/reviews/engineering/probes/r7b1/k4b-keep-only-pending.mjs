// R7B1-ENG-r2 judge check K4b (observation): a keep-only exhaustion question is status ASK with no missing input; what does a RECOVERED review
// that carries its reference state get? Read-only; PROBE_ROOT=<tree> for other runtimes.
import {record,guard,done,reviewed,review,evaluateProgram,opts,LABEL} from './lib.mjs';
let out=null;
guard('K4b','keep-only pending',()=>{
 const t=reviewed({id:'k4b',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',equipment:['DUMBBELLS'],schedule:{strengthDays:[0,2,4,5]}},2);
 const q=evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'prone-ytw-raise',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts);
 const rec=evaluateProgram(t.p,{...review(t.p,2,{day:2,hour:'06:00:00',kind:'RECOVERED',referenceState:q.referenceState}),actualLedger:t.ledger},opts);
 const mid=evaluateProgram(t.p,{...review(t.p,2,{day:2,hour:'07:00:00',referenceState:q.referenceState}),actualLedger:t.ledger},opts);
 out={question:{status:q.status,missingInputs:q.missingInputs,options:q.disclosures?.[0]?.options,pending:q.referenceState?.pending,planValidity:q.planValidity?.status},recovered:{status:rec.status,reason:String(rec.reason).slice(0,140),missingInputs:rec.missingInputs},midweek:{status:mid.status,pending:mid.referenceState?.pending??null}};
});
record('K4b','observation: keep-only question pending',true,'information',{label:LABEL,out});
done('k4b-keep-only-pending');
