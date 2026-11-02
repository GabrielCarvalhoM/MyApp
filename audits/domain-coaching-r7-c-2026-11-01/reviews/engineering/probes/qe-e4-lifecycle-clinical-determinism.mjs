// QE probe E4: pending lifecycle (raised, repeated verbatim, kept beside a change, partial, answered), clinical-first over the gap / the answer /
// a held signal for every decision kind, determinism and batch independence of the answer, and planValidity == (pending === null) on every decision.
// Read-only. node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e4-lifecycle-clinical-determinism.mjs
import {GEN,R10K,fork,step,copy,AT,fromDay,brief,hash,live,elig,addDays,review,evaluateProgram,opts} from './qe-lib.mjs';
const out={probe:'QE-E4 lifecycle, clinical-first, determinism',checks:[],violations:[]};
const all=[];const rec=(label,r)=>{all.push({label,r});return r;};
const check=(id,ok,detail=null)=>{out.checks.push({id,result:ok?'PASS':'FAIL',...(detail?{detail}:{})});if(!ok)out.violations.push(id);};
const KINDS={
 WEEKLY_REVIEW:()=>({}),
 SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
 SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
 LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
 UNAVAILABLE_DAY:p=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(p.weeks[7].startDate,4)]}}),
 EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
 GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
 UNDERPERFORMANCE:p=>({kind:'UNDERPERFORMANCE',targetSessionId:p.weeks[7].sessions.find(s=>live(s)&&s.sport==='STRENGTH').id}),
 MISSED_SESSION:p=>({kind:'MISSED_SESSION',targetSessionId:p.weeks[7].sessions.find(s=>live(s)&&s.sport==='STRENGTH').id})
};
for(const V of ['MISS','EXEC']){
 const {A,B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V});
 // Lifecycle: repeated verbatim within the week.
 const t=copy(B),q1=rec('q1',step(t,7,{day:1,hour:'07:00:00'})),q2=rec('q2',step(t,7,{day:3,hour:'07:00:00'}));
 check(`${V} question repeated verbatim mid-week`,q1.question&&hash(q1.question)===hash(q2.question),{q1:q1.question?.unreported,q2:q2.question?.unreported});
 // Clinical-first for every kind: pain eligibility, with the answer, with and without a held signal.
 const h=copy(B);rec('hold',step(h,7,{...AT(0),kind:'SYSTEMIC_FATIGUE'}));
 for(const [k,make] of Object.entries(KINDS))for(const [tl,base] of [['gap',B],['held',h]])for(const withAnswer of [false,true]){
  const u=copy(base),day=addDays(u.p.weeks[7].startDate,2),r=rec(`clin ${k}`,step(u,7,{...AT(2),...make(u.p),...(withAnswer?{observations:facts}:{}),eligibility:{...elig(day),pain:true}}));
  check(`${V} clinical-first ${k} ${tl} answer=${withAnswer}`,r.status==='CLINICAL_HUMAN_REQUIRED'&&r.proposal===null&&(r.question??null)===null&&r.referenceState.pending?.status==='CLINICAL_HUMAN_REQUIRED'&&r.referenceState.pending?.signal===undefined,brief(r));
 }
 // Batch independence of the answer: one batch on day 2; half on day 0 + rest on day 2; half in a plain review day 0 + rest inside a schedule change
 // day 2 vs the same schedule change with the whole answer on day 2 (both compared from day 2 on).
 const half=facts.filter((x,i)=>i%2===0),rest=facts.filter((x,i)=>i%2===1);
 const one=copy(B);rec('one',step(one,7,{...AT(2),observations:facts}));
 const two=copy(B);rec('two-a',step(two,7,{...AT(0),observations:half}));rec('two-b',step(two,7,{...AT(2),observations:rest}));
 check(`${V} batch independence (one batch vs partial then rest)`,JSON.stringify(fromDay(one.p,7,2))===JSON.stringify(fromDay(two.p,7,2)));
 const sc1=copy(B);const r1=rec('sc-one',step(sc1,7,{...AT(2),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts}));
 const sc2=copy(B);rec('sc-two-a',step(sc2,7,{...AT(0),observations:half}));const r2=rec('sc-two-b',step(sc2,7,{...AT(2),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:rest}));
 check(`${V} batch independence through a schedule change`,JSON.stringify(fromDay(sc1.p,7,2,2))===JSON.stringify(fromDay(sc2.p,7,2,2))&&r1.planValidity.status===r2.planValidity.status,{one:brief(r1),two:brief(r2)});
 // Determinism: same review twice gives the same hash.
 const rv={...review(B.p,7,{...AT(2),observations:facts}),actualLedger:B.ledger,referenceState:B.ref};
 check(`${V} determinism`,hash(evaluateProgram(B.p,rv,opts))===hash(evaluateProgram(B.p,rv,opts)));
}
// planValidity == (pending === null) on every decision made here.
const bad=all.filter(({r})=>(r.planValidity.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE')!==(r.referenceState.pending===null));
check('planValidity VALID exactly when nothing is pending (all decisions in this probe)',!bad.length,{decisions:all.length,bad:bad.map(x=>x.label)});
out.summary={checks:out.checks.length,failed:out.violations.length};
console.log(JSON.stringify(out,null,1));
