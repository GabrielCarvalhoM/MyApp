// SSCTR semantic disposition, SD8: controls for SD7 and the B3 substitution case. Read-only on the working tree (R7-C); prints JSON.
//  C1  SD7's reviewed cell with the not-done reports observed at the answer time (not at the session dates): same outcome?
//  C2  The exposure window: after the mid-week KEEP, the athlete reports week b's runs not done too; what does the week-b review plan for b+1?
//  C3  B3: EXERCISE_SUBSTITUTION (nonclinical reason) while the question is open, and with pain (clinical first).
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H;
const GEN={id:'sd8-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}};
const notDone=(p,s,at=null)=>({eventId:`sd8-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:at??`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
const decide=(t,w,y={})=>rt.evaluateProgram(t.p,{...H.review(t.p,w,y),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);
const runPlan=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}`).join('/');
const strengthOnly=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const b=7,out={check:'SSCTR-SD8-CONTROLS'};
const gap=()=>{const t={p:H.program(GEN),ledger:[],ref:null};for(let w=0;w<b;w++)apply(t,decide(t,w,{observations:strengthOnly(t.p,w)}));return t;};
{const t=gap(),at=`${t.p.weeks[b].startDate}T07:00:00Z`;const late=Array.from({length:b},(_,w)=>w).flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>notDone(t.p,s,at)));
 const r=decide(t,b,{day:0,hour:'07:00:00',observations:late});out.C1_observedAtAnswerTime={status:r.status,action:r.action,validity:r.planValidity?.status,weekB:runPlan(r.proposal??t.p,b),accepted:(r.actualLedger??[]).filter(o=>o.actual?.completed===false).length,reported:late.length};}
{const t=gap();const late=Array.from({length:b},(_,w)=>w).flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>notDone(t.p,s)));
 const mid=apply(t,decide(t,b,{day:0,hour:'07:00:00',observations:late}));
 const wk=[...strengthOnly(t.p,b),...t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>notDone(t.p,s))];
 const end=apply(t,decide(t,b,{observations:wk}));
 out.C2_exposureWindow={midweek:{status:mid.status,validity:mid.planValidity?.status,weekB:runPlan(t.p,b)},weekBReview:{status:end.status,action:end.action,validity:end.planValidity?.status,nextWeek:runPlan(end.proposal??t.p,b+1)}};}
{const t=gap();const X=t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const non=decide(t,b,{day:0,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}});
 const pain=decide(t,b,{day:0,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}});
 const eq=decide(t,b,{day:0,hour:'07:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}});
 const brief=r=>({status:r.status,action:r.action,question:r.question?.kind??null,proposal:!!r.proposal,validity:r.planValidity?.status??null,reason:String(r.reason??'').slice(0,160)});
 out.C3_B3_substitution={exercise:X,nonclinical:brief(non),withPain:brief(pain),equipmentChange:brief(eq)};}
console.log(JSON.stringify(out,null,1));
