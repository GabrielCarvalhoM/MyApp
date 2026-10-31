// R7B1-QUALITY q07: the two options of NO_NEW_EXERCISE_IN_EVENT_WEEKS. "Keep this plan" = apply the proposal. "Keep X until after the event instead:
// make this change after the post-event week" = do not apply it, run the weeks through the post-event week with X, then send the same substitution in
// the first week after it. Checks the second option has an effect (MODIFY, the selected exercise replaces X from then on, no event-week disclosure),
// and what happens when the program ends with the post-event week (no week after it).
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const out=[];
for(const [name,event,weeks] of [['10K16',{kind:'10K',date:'2027-01-24'},16],['10K12',{kind:'10K',date:'2027-01-17'},12]])for(const [X,reason] of [['db-rdl','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'],['goblet-squat','SKILL_MISMATCH']]){
 const sub={exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})};
 const t=reviewed({id:'q07',goals:{run:'RACE',strength:'GENERAL'},event,weeks,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'},0);
 const ph=t.p.phases.phases,taper=ph.indexOf('TAPER'),post=ph.indexOf('POST_EVENT');for(let w=0;w<taper;w++)weekly(t,w);
 const r=evaluateProgram(t.p,{...review(t.p,taper,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
 const d=r.disclosures?.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');
 const row={program:name,X,reason,decision:r.status,selected:r.substitutions?.[0]?.selected??null,options:d?.options??null,detail:d?.detail??null};
 // Option 2: decline; weeks through POST_EVENT with X; then the same request in the first week after POST_EVENT.
 for(let w=taper;w<=post;w++)weekly(t,w);
 if(post+1<t.p.weeks.length){
  const later=evaluateProgram(t.p,{...review(t.p,post+1,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
  const ids=later.proposal?[...new Set(later.proposal.weeks.slice(post+1).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))))]:[];
  row.option2={status:later.status,selected:later.substitutions?.[0]?.selected??null,eventDisclosure:!!later.disclosures?.some(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'),XGone:!ids.includes(X),selectedPrescribed:ids.includes(later.substitutions?.[0]?.selected)};
 }else{
  // No week after POST_EVENT: the request on the last day of the program.
  const last=evaluateProgram(t.p,{...review(t.p,post,{day:6,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
  row.option2={noWeekAfterPostEvent:true,requestOnLastDay:{status:last.status,reason:(last.reason??'').slice(0,160)}};
 }
 out.push(row);
}
fs.writeFileSync(new URL('./out/q07-event-option-effect.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
