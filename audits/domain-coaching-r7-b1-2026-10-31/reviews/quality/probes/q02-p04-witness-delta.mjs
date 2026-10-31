// R7B1-QUALITY q02: the p04 reachability delta. On FREEZE-2, p04 reached dead-bug and push-up through a substitution (witnesses below); on R7-B.1 no
// substitution of the p04 grid selects them. Is that only the intended change (QE-R7B-R2-04: the first candidate was already in a session with the
// replaced exercise, so it could not take every slot; the next candidate is selected)? Re-creates the p04 witness state (week-2 substitution after the
// weekly reviews of weeks 0 and 1) and reports, per witness: the R7-B.1 selection, and whether the FREEZE-2 selection sits in a session with X.
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const EQ={FULL,BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],DB:['DUMBBELLS'],BANDS:['BANDS'],DB_BENCH:['DUMBBELLS','BENCH']};
const W=[
 {freeze2Selected:'dead-bug',eq:'FULL',sg:'GENERAL',nd:4,exp:'NOVICE',reason:'SKILL_MISMATCH',X:'front-plank'},
 {freeze2Selected:'push-up',eq:'BANDS_AND_BAR',sg:'GENERAL',nd:4,exp:'INTERMEDIATE',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',X:'incline-push-up'},
 {freeze2Selected:'db-row',eq:'FULL',sg:'GENERAL',nd:4,exp:'INTERMEDIATE',reason:'SKILL_MISMATCH',X:'one-arm-db-row'},
 {freeze2Selected:'band-face-pull',eq:'BANDS_AND_BAR',sg:'STRENGTH',nd:4,exp:'INTERMEDIATE',reason:'SKILL_MISMATCH',X:'band-row'},
 {freeze2Selected:'prone-ytw-raise',eq:'BANDS',sg:'GENERAL',nd:4,exp:'INTERMEDIATE',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',X:'band-face-pull'},
 {freeze2Selected:'pike-push-up',eq:'DB',sg:'STRENGTH',nd:4,exp:'INTERMEDIATE',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',X:'db-overhead-press'},
];
const step=(t,w)=>{const observations=t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s));const r=evaluateProgram(t.p,{...review(t.p,w,{observations}),actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const rows=[];
for(const x of W){
 const t={p:program({id:'p04',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:x.sg},strengthExperience:x.exp,equipment:EQ[x.eq],schedule:{strengthDays:x.nd===2?[0,4]:[0,2,4,5]}}),ledger:[]};
 step(t,0);step(t,1);
 const sub={exerciseId:x.X,reason:x.reason,...(x.reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})};
 const r=evaluateProgram(t.p,{...review(t.p,2,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
 const withX=t.p.weeks.slice(2).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===x.X)));
 const f2InSessionWithX=withX.filter(s=>s.prescription.exercises.some(e=>e.id===x.freeze2Selected)).map(s=>s.id);
 const sel=r.substitutions?.[0]?.selected??null;
 // Does the named FREEZE-2 choice still work as an explicit athlete choice? (expected: ASK, it is in a session with X)
 const named=evaluateProgram(t.p,{...review(t.p,2,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{...sub,to:x.freeze2Selected}}),actualLedger:t.ledger},opts);
 const after=r.proposal?r.proposal.weeks.slice(2).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH')):[];
 const dup=after.filter(s=>{const ids=s.prescription.exercises.map(e=>e.id);return new Set(ids).size!==ids.length;}).map(s=>s.id);
 const selEverywhere=withX.every(s=>after.find(y=>y.id===s.id)?.prescription.exercises.some(e=>e.id===sel));
 rows.push({...x,r7b1:{status:r.status,selected:sel,selectedEverywhereXWas:selEverywhere,duplicateSessions:dup},freeze2SelectionSharesASessionWithX:f2InSessionWithX.length>0,sessionsWithXHoldingFreeze2Selection:f2InSessionWithX.slice(0,4),namedFreeze2Selection:{status:named.status,reason:named.reason?.slice(0,160)}});
}
fs.writeFileSync(new URL('./out/q02-p04-witness-delta.json',import.meta.url),JSON.stringify(rows,null,1));
console.log(JSON.stringify(rows,null,1));
