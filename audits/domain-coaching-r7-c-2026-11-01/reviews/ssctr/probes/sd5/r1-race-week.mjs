// SSCTR semantic re-disposition (R7-C Phase 5), probe R1R: residual R1 in the race context. R10K, gap from the start (g=0), RV; a known stop
// (every gap run not done) answered on day 4 or day 6 of the taper week (week 10) after taper runs elapsed (B), against A (facts at week 9's
// review). Race week's projection right after the answer, then the first race-week decision (day 0) with week 10 reviewed or not and the taper
// sessions from the answer on executed (elapsed ones unreported). Read-only on the working tree; prints JSON.
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H;
const R10K={id:'sd5-r1r-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const notDone=(p,s)=>({eventId:`sd5-r1r-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
function step(t,w,x={}){const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const day=(p,b,d)=>H.addDays(p.weeks[b].startDate,d);
const runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.strides?'+S':''}`).join('/');
const brief=r=>`${r.status}/${r.action??''}/${r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status}${r.question?'/'+r.question.kind:''}`;
const out={check:'SSCTR-SD5-R1-RACE-WEEK',cases:{}};
const t={p:H.program(R10K),ledger:[],ref:null};for(let w=0;w<9;w++)step(t,w,{observations:strengthOf(t.p,w)});
const facts=t.p.weeks.slice(0,10).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN')).map(s=>notDone(t.p,s)),A0=copy(t),B0=copy(t);
step(A0,9,{observations:[...strengthOf(t.p,9),...facts]});step(B0,9,{observations:strengthOf(t.p,9)});
for(const d of [4,6]){
 const B=copy(B0),A=copy(A0),ans=step(B,10,{day:d,hour:'07:00:00',observations:facts});
 const c={answer:brief(ans),elapsedTaperRunsB:B.p.weeks[10].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date<day(B.p,10,d)).map(s=>`${s.role}:${s.prescription.durationMinutes}`),raceWeekAfterAnswerB:runs(B.p,11),raceWeekA:runs(A.p,11),next:{}};
 const rest=P=>P.weeks[10].sessions.filter(s=>H.live(s)&&s.date>=day(P,10,d)).map(s=>H.obs(P,s));
 for(const rev of ['REVIEW','NOREVIEW'])for(const [k,x] of Object.entries({WEEKLY_REVIEW_DAY0:{},SCHEDULE_CHANGE:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},EQUIPMENT_CHANGE:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}},SYSTEMIC_FATIGUE:{kind:'SYSTEMIC_FATIGUE'}})){
  const b=copy(B),a=copy(A);if(rev==='REVIEW'){step(b,10,{observations:rest(b.p)});step(a,10,{observations:rest(a.p)});}
  const rb=step(b,11,{day:0,hour:'07:00:00',...x,observations:rev==='NOREVIEW'?rest(B.p):[]}),ra=step(a,11,{day:0,hour:'07:00:00',...x,observations:rev==='NOREVIEW'?rest(A.p):[]});
  c.next[`${rev} ${k}`]={B:brief(rb),raceWeekB:runs(rb.proposal??b.p,11),A:brief(ra),raceWeekA:runs(ra.proposal??a.p,11),same:runs(rb.proposal??b.p,11)===runs(ra.proposal??a.p,11)};
 }
 out.cases[`answer day ${d}`]=c;
}
console.log(JSON.stringify(out,null,1));
