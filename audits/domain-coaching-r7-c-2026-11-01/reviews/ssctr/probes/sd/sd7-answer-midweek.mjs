// SSCTR semantic disposition, SD7: the athlete answers UNREPORTED_TRAINING with a known stop (every run session of the window reported not done)
// in the week after the question, before that week's review. Does the decision plan the current week's runs from the known stop (the reviewed
// entry, as the end-of-week answer and the timely known-miss timeline do), or does it keep and validate the stored projection (credit)?
// Read-only on the working tree (R7-C) and on R7B2-FREEZE-1 extracted from git; prints JSON. The reference state is chained between decisions.
import {REPO,R7B2_FREEZE_1,extract,load} from '../../../../probes/phase3-lib.mjs';
const NOW=await load(REPO),x=extract(R7B2_FREEZE_1),B2=await load(x.root);
const H=NOW.H;
const PROGS={
 GEN:{id:'sd7-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}},
 R10K:{id:'sd7-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}}
};
const notDone=(p,s)=>({eventId:`sd7-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
const decide=(R,t,w,y={})=>R.evaluateProgram(t.p,{...R.H.review(t.p,w,y),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.opts);
const runPlan=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}${s.prescription.strides?':S':''}`).join('/');
const strengthOnly=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const out={check:'SSCTR-SD7-ANSWER-MIDWEEK',baseline:x.commit,rows:[]};
for(const [pname,prog] of Object.entries(PROGS))for(const g of [0,2])for(const mode of ['RV','NR'])for(const day of [0,2])for(const kind of ['WEEKLY_REVIEW','SCHEDULE_CHANGE']){
 const b=7,row={program:pname,g,mode,answerDay:day,answerKind:kind};
 for(const [name,R] of [['R7C',NOW],['B2',B2]]){
  const t={p:R.H.program(prog),ledger:[],ref:null};
  for(let w=0;w<g;w++)R.H.weekly(t,w);
  // RV: every gap week reviewed with strength reported and runs unreported (R7-C asks there; B.2 reads them as missed). NR: no review at all.
  let lastGap=null;if(mode==='RV')for(let w=g;w<b;w++)lastGap=apply(t,decide(R,t,w,{observations:strengthOnly(t.p,w)}));
  const stored=runPlan(t.p,b);
  // The answer, in week b before its review: every run session of weeks g..b-1 reported not done (and, for NR, strength reported executed).
  const late=Array.from({length:b-g},(_,i)=>g+i).flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&(s.sport==='RUN'||mode==='NR')).map(s=>s.sport==='RUN'?notDone(t.p,s):R.H.obs(t.p,s)));
  // Runs ahead in week b at the answer: sessions dated after the answer day.
  const y=kind==='WEEKLY_REVIEW'?{day,hour:'07:00:00',observations:late}:{day,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:late};
  const r=decide(R,t,b,y),P=r.proposal??t.p;
  const answerDate=H.addDays(t.p.weeks[b].startDate,day);
  const ahead=P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&s.date>answerDate).map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}`);
  // Timely known-miss reference: the same weeks reviewed with the runs reported not done each week (B.2 = R7-C there).
  const k={p:R.H.program(prog),ledger:[],ref:null};for(let w=0;w<g;w++)R.H.weekly(k,w);for(let w=g;w<b;w++)apply(k,decide(R,k,w,{observations:[...strengthOnly(k.p,w),...k.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>notDone(k.p,s))]}));
  row[name]={lastGapReview:lastGap?`${lastGap.status}/${lastGap.action}/${lastGap.question?.kind??''}`:null,storedWeekB:stored,answer:{status:r.status,action:r.action??null,question:r.question?.kind??null,validity:r.planValidity?.status??null,reason:String(r.reason??'').slice(0,200)},runsAheadInForce:ahead,weekBInForce:runPlan(P,b),timelyKnownMissWeekB:runPlan(k.p,b)};
 }
 const R7=row.R7C;
 row.verdict=R7.answer.validity==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&R7.weekBInForce!==R7.timelyKnownMissWeekB&&/QUALITY|LONG:([3-9]\d|\d{3})/.test(R7.runsAheadInForce.join('/'))?'KNOWN_STOP_CREDITED':R7.answer.validity==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&R7.weekBInForce===R7.timelyKnownMissWeekB?'KNOWN_STOP_ENTRY':`OTHER:${R7.answer.status}/${R7.answer.validity}`;
 row.B2verdict=row.B2.answer.validity==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'&&row.B2.weekBInForce!==row.B2.timelyKnownMissWeekB&&/QUALITY|LONG:([3-9]\d|\d{3})/.test(row.B2.runsAheadInForce.join('/'))?'KNOWN_STOP_CREDITED':row.B2.weekBInForce===row.B2.timelyKnownMissWeekB?'KNOWN_STOP_ENTRY':`OTHER:${row.B2.answer.status}/${row.B2.answer.validity}`;
 out.rows.push(row);
}
const count=(k)=>{const v={};for(const r of out.rows){const key=`${r.mode}:${r[k]}`;v[key]=(v[key]??0)+1;}return v;};
out.summary={R7C:count('verdict'),B2:count('B2verdict')};
x.cleanup();
console.log(JSON.stringify(out,null,1));
