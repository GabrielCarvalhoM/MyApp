// R7-C Phase 3, step 5 (companion): the "third plan" shape of the G01 grid. Every week reviewed, strength reported done, runs never reported; the
// R7-C reviews ask (UNREPORTED_TRAINING) and leave the stored plan as projected. Then a decision that keeps this week's doses re-plans at day 0 of
// week 7. Question: does a valid proposal carry this week's projected run doses (credit for weeks with no reported run) and the next week the entry
// (zero), with no question? Run on R7-C and on R7B2-FREEZE-1, for the decision kinds that plan from the current week. Read-only; prints JSON.
import {REPO,R7B2_FREEZE_1,extract,load} from './phase3-lib.mjs';
const x=extract(R7B2_FREEZE_1);
const NOW=await load(REPO),B2=await load(x.root);
const PROG={id:'adv-cw',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}};
const runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.family&&s.prescription.family!=='EASY'?':'+s.prescription.family:''}`).join('/');
function run(rt,kindName,make){
 const {H}=rt,t={p:H.program(PROG),ledger:[]},trail=[];
 for(let w=0;w<7;w++){const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,{observations:t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport!=='RUN').map(s=>H.obs(t.p,s))}),actualLedger:t.ledger},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;trail.push(`${w}:${r.status}${r.question?'/'+r.question.kind:''}`);}
 const stored=runs(t.p,7),r=rt.evaluateProgram(t.p,{...H.review(t.p,7,{day:0,hour:'07:00:00',...make(t)}),actualLedger:t.ledger},rt.opts);
 const h=rt.historicalStateOf(t.p,{asOf:`${t.p.weeks[7].startDate}T06:00:00Z`,actualLedger:t.ledger},rt.opts);
 return {weeklyTrail:trail.join(' '),storedWeek7:stored,decision:`${r.status}/${r.action}${r.question?'/'+r.question.kind:''}`,validity:r.planValidity?.status,week7:r.proposal?runs(r.proposal,7):null,week8:r.proposal?runs(r.proposal,8):null,history:{runMode:h.run.mode,achieved:h.run.achieved,qualityStep:h.state.run.qualityStep,runLedger:t.ledger.filter(o=>o.context?.sport==='RUN').length}};
}
const KINDS={SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),UNAVAILABLE_DAY:t=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[t.p.weeks[7].sessions.find(s=>s.sport==='STRENGTH'&&s.prescription).date]}}),GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),WEEKLY_REVIEW_DAY0:()=>({})};
const out={baseline:{freeze:'R7B2-FREEZE-1',commit:x.commit},cases:{}};
for(const [k,make] of Object.entries(KINDS)){const o={};for(const [n,rt] of [['B2',B2],['R7C',NOW]]){try{o[n]=run(rt,k,make);}catch(e){o[n]={error:String(e.message).slice(0,240)};}}out.cases[k]=o;}
x.cleanup();
console.log(JSON.stringify(out,null,1));
