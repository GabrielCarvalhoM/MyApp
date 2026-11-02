// SSCTR semantic disposition, SD9: the exact fixture of test/r7c-phase4.test.mjs:85 ("late reports of the runs (done or not done) answer it"),
// reproduced read-only. The test asserts history (weeks 0-6) and next week (week 8). This prints the week-7 run sessions still ahead after the
// answer and the decision's plan validity, which the test does not assert. Prints JSON.
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H;
const BASE={id:'r7c-p4',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const notDone=(p,s)=>({eventId:`r7c-p4-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const facts=(p,w,V)=>p.weeks[w].sessions.filter(H.live).flatMap(s=>s.sport!=='RUN'?[H.obs(p,s)]:V==='EXEC'?[H.obs(p,s)]:V==='MISS'?[notDone(p,s)]:[]);
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const decide=(t,w,x={})=>rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger},rt.opts);
const timeline=(o,{g,b,V})=>{const t={p:H.program(o),ledger:[]};for(let w=0;w<g;w++)H.weekly(t,w);for(let w=g;w<b;w++)apply(t,decide(t,w,{observations:facts(t.p,w,V)}));return t;};
const runsOf=(P,w,after=null)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&(!after||s.date>after)).map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}`);
const out={check:'SSCTR-SD9-TEST-FIXTURE-WEEK7',fixture:'test/r7c-phase4.test.mjs:85'};
for(const V of ['EXEC','MISS']){
 const t=timeline(BASE,{g:2,b:7,V:'UNREP'}),gapRuns=t.p.weeks.slice(2,7).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
 const r=decide(t,7,{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:gapRuns.map(s=>V==='EXEC'?H.obs(t.p,s):notDone(t.p,s))});
 const P=r.proposal??t.p,answerDate=t.p.weeks[7].startDate;
 // Reference: the same weeks reviewed with the runs reported not done each week (the timely known-miss path).
 const k=timeline(BASE,{g:2,b:7,V});
 out[V]={status:r.status,action:r.action,validity:r.planValidity?.status,week7AheadInForce:runsOf(P,7,answerDate),week8:runsOf(P,8),timelyWeek7:runsOf(k.p,7)};
}
console.log(JSON.stringify(out,null,1));
