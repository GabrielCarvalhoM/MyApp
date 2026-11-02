// SSCTR semantic re-disposition (R7-C Phase 5), probe RH: (1) what a RECOVERED event carrying the answer returns (the kinds grid shows ASK with no
// question where A keeps), compared with RECOVERED before the question and with the same event on R7B2-FREEZE-1 with the facts on time;
// (2) a reactive signal held by the question, then the answer delivered inside other decision kinds: is the signal applied, kept pending or dropped?
// Read-only (R7B2-FREEZE-1 extracted to a temporary directory); prints JSON.
import {REPO,R7B2_FREEZE_1,extract,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,{hash}=rt,x=extract(R7B2_FREEZE_1),B2=await load(x.root);
const GEN={id:'sd5-rh-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const notDone=(p,s)=>({eventId:`sd5-rh-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(R,p,w)=>p.weeks[w].sessions.filter(s=>R.H.live(s)&&s.sport==='STRENGTH').map(s=>R.H.obs(p,s));
const runSessions=(R,p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>R.H.live(s)&&s.sport==='RUN'));
function step(R,t,w,y={}){const r=R.evaluateProgram(t.p,{...R.H.review(t.p,w,y),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const report=(R,p,V)=>runSessions(R,p,0,7).map(s=>V==='MISS'?notDone(p,s):R.H.obs(p,s));
function fork(R,V){const t={p:R.H.program(GEN),ledger:[],ref:null};for(let w=0;w<6;w++)step(R,t,w,{observations:strengthOf(R,t.p,w)});const facts=report(R,t.p,V),A=copy(t),B=copy(t);step(R,A,6,{observations:[...strengthOf(R,t.p,6),...facts]});const q=step(R,B,6,{observations:strengthOf(R,t.p,6)});return {A,B,q,facts};}
const brief=r=>({status:r.status,action:r.action??null,validity:r.planValidity?.status??null,question:r.question?.kind??null,missing:r.missingInputs??[],proposal:!!r.proposal,pending:r.referenceState?.pending?.status??null,signal:r.referenceState?.pending?.signal?.kind??null,reason:String(r.reason??'').slice(0,240)});
const runs=(P,w,from)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date>=from).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const out={check:'SSCTR-SD5-RECOVERED-AND-HELD',RECOVERED:{},HELD:{}};
for(const V of ['MISS','EXEC'])for(const d of [0,3]){
 const f=fork(rt,V);
 out.RECOVERED[`${V} day ${d}`]={B_withAnswer:brief(step(rt,copy(f.B),7,{day:d,hour:'07:00:00',kind:'RECOVERED',observations:f.facts})),A_onTime:brief(step(rt,copy(f.A),7,{day:d,hour:'07:00:00',kind:'RECOVERED'})),B_withoutAnswer:brief(step(rt,copy(f.B),7,{day:d,hour:'07:00:00',kind:'RECOVERED'}))};
}
{const t={p:B2.H.program(GEN),ledger:[],ref:null};for(let w=0;w<7;w++)step(B2,t,w,{observations:[...strengthOf(B2,t.p,w),...runSessions(B2,t.p,w,w+1).map(s=>notDone(t.p,s))]});out.RECOVERED.B2_onTime_MISS_day0=brief(step(B2,copy(t),7,{day:0,hour:'07:00:00',kind:'RECOVERED'}));
 const fresh={p:B2.H.program(GEN),ledger:[],ref:null};out.RECOVERED.B2_freshProgram_week1=brief(step(B2,fresh,1,{day:0,hour:'07:00:00',kind:'RECOVERED'}));
 const freshNow={p:H.program(GEN),ledger:[],ref:null};out.RECOVERED.R7C_freshProgram_week1=brief(step(rt,freshNow,1,{day:0,hour:'07:00:00',kind:'RECOVERED'}));}
const KINDS={SCHEDULE_CHANGE:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},EQUIPMENT_CHANGE:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}},GOAL_CHANGE:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},UNAVAILABLE_DAY:p=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[H.addDays(p.weeks[7].startDate,4)]}}),LOCAL_FATIGUE:{kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}},RECOVERED:{kind:'RECOVERED'},WEEKLY_REVIEW:{}};
for(const V of ['MISS','EXEC']){
 const f=fork(rt,V),B0=copy(f.B),held=step(rt,B0,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'}),A0=copy(f.A),a0=step(rt,A0,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'});
 const day2=H.addDays(B0.p.weeks[7].startDate,2);
 for(const [k,mk] of Object.entries(KINDS)){const y=typeof mk==='function'?mk(B0.p):mk;const B=copy(B0),r=step(rt,B,7,{day:2,hour:'07:00:00',...y,observations:f.facts});const A=copy(A0),ra=step(rt,A,7,{day:2,hour:'07:00:00',...(typeof mk==='function'?mk(A0.p):mk)});
  out.HELD[`${V} ${k}`]={heldOnDay0:held.referenceState?.pending?.signal?.kind??null,B:brief(r),runsAheadB:runs(B.p,7,day2),A_fatigueOnTimeThenSame:{status:ra.status,action:ra.action??null,validity:ra.planValidity?.status??null},runsAheadA:runs(A.p,7,day2),signalOutcome:r.referenceState?.pending?.signal?'KEPT_PENDING':/re-evaluated with the answer/.test(r.reason??'')?'RE_EVALUATED':'DROPPED'};}
}
x.cleanup();
console.log(JSON.stringify(out,null,1));
