// R7B1-ENG-r1 judge reproduction J3b (knock-on slot after a SKILL_MISMATCH; the restriction of the R2-03 direction to the replaced exercise's own
// slots). Bodyweight athlete (BANDS, PULL_UP_BAR), three strength days: push-up is reported as not doable with steady technique. Read-only;
// PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,apply,R,LABEL} from './lib.mjs';
const o={id:'j3b-push',equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}};
const show=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>s.id+' '+s.templateType+': '+s.prescription.exercises.map(e=>e.id+'('+e.role[0]+')').join(', '));
guard('J3b','knock-on',()=>{
 const t=reviewed(o,3),before=show(t.p,4);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'push-up',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
 const after=show(t.p,4),newRows=after.join('|').includes('pike-push-up')&&!before.join('|').includes('pike-push-up');
 weekly(t,3);
 record('J3b','knock-on slot after a SKILL_MISMATCH (pre-existing; information for the SSCTR)',!newRows,'no slot takes a configuration above the set-aside one on its ladder after a SKILL_MISMATCH, and the decision states every exercise it changes',{label:LABEL,decision:{status:s.status,reason:s.reason,substitutions:s.substitutions,disclosures:(s.disclosures??[]).map(d=>d.id)},week4Before:before,week4After:after,week5AfterNextReview:show(t.p,5),ladder:{pushUpNext:R.ladderNext('push-up'),pikeSkill:R.configurationOf('pike-push-up').skill,pushUpSkill:R.configurationOf('push-up').skill,inclineSkill:R.configurationOf('incline-push-up').skill,subpatternChange:R.ladderChangesSubpattern('push-up','pike-push-up')}});
});
done('j3b-knockon-repro');
