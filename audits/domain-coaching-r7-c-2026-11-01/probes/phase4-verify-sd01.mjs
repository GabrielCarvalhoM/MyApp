// Independent reproduction of SSCTR-SD-01 on the working tree (39115ed runtime): after the unreported-training question, the athlete answers
// mid-week with every gap run reported not done (a known stop). Expected under the accepted semantics: the run doses still ahead this week follow
// the facts (no run in 30 days: the reviewed entry). Compared with the same misses reported on time (each weekly review).
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const ROOT=path.resolve(import.meta.dirname,'../../../CoachingCore');
const H=await import(pathToFileURL(path.join(ROOT,'r7/b/fixtures/helpers.mjs')).href),{evaluateProgram,opts}=H;
const BASE={id:'r7c-p4',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const nd=(p,s)=>({eventId:`sd01-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const facts=(p,w,V)=>p.weeks[w].sessions.filter(H.live).flatMap(s=>s.sport!=='RUN'?[H.obs(p,s)]:V==='MISS'?[nd(p,s)]:[]);
const ahead=(P,w,day)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.day>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/');
const out={};
for(const g of [0,2]){
 // On time: runs reported not done at each weekly review.
 const t={p:H.program(BASE),ledger:[]};for(let w=0;w<g;w++)H.weekly(t,w);
 for(let w=g;w<7;w++){const r=evaluateProgram(t.p,{...H.review(t.p,w,{observations:facts(t.p,w,'MISS')}),actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
 // Unreported, then the answer mid-week (day 2): every gap run reported not done.
 const u={p:H.program(BASE),ledger:[]};for(let w=0;w<g;w++)H.weekly(u,w);
 const asked=[];for(let w=g;w<7;w++){const r=evaluateProgram(u.p,{...H.review(u.p,w,{observations:facts(u.p,w,'UNREP')}),actualLedger:u.ledger},opts);u.ledger=r.actualLedger??u.ledger;if(r.proposal)u.p=r.proposal;if(r.question)asked.push(w);}
 const gapRuns=u.p.weeks.slice(g,7).flatMap(x=>x.sessions.filter(s=>s.sport==='RUN'&&H.live(s)));
 const answer=evaluateProgram(u.p,{...H.review(u.p,7,{day:2,hour:'07:00:00',observations:gapRuns.map(s=>nd(u.p,s))}),actualLedger:u.ledger},opts);
 out['g'+g]={onTimeWeek7Ahead:ahead(t.p,7,2),reviewsAsked:asked,storedWeek7Ahead:ahead(u.p,7,2),answer:`${answer.status}/${answer.action}`,validity:answer.planValidity.status,question:answer.question?.kind??null,week7AheadInForce:ahead(answer.proposal??u.p,7,2)};
}
console.log(JSON.stringify(out,null,1));
