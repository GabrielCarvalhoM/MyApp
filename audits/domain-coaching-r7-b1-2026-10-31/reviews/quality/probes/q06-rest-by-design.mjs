// R7B1-QUALITY q06: the rest-by-design text of an event-week strength session whose rows are all left out ("No new exercise in the taper, race or
// post-event weeks: the exercises of this session start after the post-event week"). Reached by successive reason-based substitutions in the TAPER
// week of every MAIN exercise of the race-week session (each decision applied). Checks: the session becomes rest by design only when every row is
// left out; the last decision discloses it (omittedSessions); the text is true (the substitutes are prescribed after the post-event week, or the
// program ends there); a 16-week (weeks after the event) and a 12-week (ends at POST_EVENT) program.
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const out=[];
for(const [name,event,weeks] of [['10K16',{kind:'10K',date:'2027-01-24'},16],['10K12',{kind:'10K',date:'2027-01-17'},12]])for(const reason of ['NONCLINICAL_DISCOMFORT_OR_PREFERENCE','SKILL_MISMATCH']){
 const t=reviewed({id:'q06',goals:{run:'RACE',strength:'GENERAL'},event,weeks,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'},0);
 const ph=t.p.phases.phases,taper=ph.indexOf('TAPER'),race=ph.indexOf('RACE_WEEK'),post=ph.indexOf('POST_EVENT');for(let w=0;w<taper;w++)weekly(t,w);
 const raceSession=t.p.weeks[race].sessions.find(s=>live(s)&&s.sport==='STRENGTH'),mains=raceSession.prescription.exercises.filter(e=>e.role==='MAIN').map(e=>e.id);
 const steps=[];let hour=6;
 for(const X of mains){
  const r=evaluateProgram(t.p,{...review(t.p,taper,{day:0,hour:String(hour++).padStart(2,'0')+':00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),actualLedger:t.ledger},opts);
  const d=r.disclosures?.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');
  steps.push({X,status:r.status,selected:r.substitutions?.[0]?.selected??null,standIns:d?.standIns??null,omitted:d?.omittedSessions??null,detail:d?.detail??(r.status!=='MODIFY'?r.reason?.slice(0,200):null)});
  if(r.status==='MODIFY')apply(t,r);
 }
 const now=t.p.weeks[race].sessions.find(s=>s.id===raceSession.id);
 const selected=steps.filter(s=>s.selected).map(s=>s.selected);
 const after=t.p.weeks.slice(post+1).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)));
 const textTrue=/start after the post-event week/.test(now.explanation??'')?(after.length?selected.every(id=>after.includes(id)):'program ends at POST_EVENT: nothing starts after it in this program'):null;
 out.push({program:name,reason,raceSession:raceSession.id,mainsBefore:mains,steps,raceSessionNow:{role:now.role,prescription:now.prescription?now.prescription.exercises.map(e=>e.id):null,explanation:now.explanation??null,eventStandIns:now.eventStandIns??null},lastDecisionListsIt:steps.at(-1)?.omitted?.includes(raceSession.id)??false,weeksAfterPost:t.p.weeks.length-1-post,textTrue});
}
fs.writeFileSync(new URL('./out/q06-rest-by-design.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
