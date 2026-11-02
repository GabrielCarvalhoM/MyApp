// SSCTR semantic re-disposition (R7-C Phase 5), probe LV: whether the UNREPORTED and ANSWERED_KNOWN_STOP variants this record asks of the legacy
// fixtures hold on the committed runtime (KNOWN_MISS is covered by probes/phase3-suite-dispositions.mjs, re-run here by the reviewer). Fixtures:
//  D18   test/r6-ssctr-revision.test.mjs:51   (A_RUN_FIRST_HALF_MARATHON, week 6, nothing ever reported)
//  F3    test/r7asc-state-consumer.test.mjs:232 (holdout R6-H25: goal change to MAINTAIN at week 2, event date change at week 6)
//  S19   test/r7b-hybrid-program.test.mjs:85  (every session of weeks 0-4 unreported; block review at week 4)
//  FIFTH test/r6-adaptation.test.mjs:140      (6-day WORK break at week 5 on A_RUN_FIRST_HALF_MARATHON)
// Read-only on the working tree; prints JSON.
import {REPO,load,brief} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,{hash,clone}=rt,POL=rt.opts.authority.policy.operational,ENTRY=POL.return.entryRunMinutes;
const UNREPORTED='observations.unreportedSessions|interruption';
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const notDone=(p,s)=>({eventId:`lv-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const rv=(p,w,{date,time='21:00:00',kind='WEEKLY_REVIEW',id,...x})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${date}T${time}Z`,weekIndex:w,event:{id:id??`lv-${kind}-${w}-${date}-${time}`,kind},eligibility:elig(date),observations:[],...x});
function step(t,review){const r=rt.evaluateProgram(t.p,{...review,...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const runsFrom=(P,w,day)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.id}:${s.role}:${s.prescription.durationMinutes}`);
const typed=r=>({status:r.status,question:r.question?.kind??null,missing:r.missingInputs??[],proposal:!!r.proposal,validity:r.planValidity?.status??null,pending:r.referenceState?.pending?.status??null});
const past=(P,w,day)=>hash(P.weeks.slice(0,w+1).flatMap(x=>x.sessions).filter(s=>s.date<day).map(s=>[s.id,s.prescription??null]));
const out={check:'SSCTR-SD5-LEGACY-VARIANTS',entry:ENTRY};

// ---------- D18 ----------
{
 const gen=()=>rt.generateProgram(rt.PROFILES.A_RUN_FIRST_HALF_MARATHON,rt.opts).program,w=6;
 const last=P=>P.weeks[w].sessions.at(-1).date;
 const runsUpTo=(P,day)=>P.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s)&&s.date<day);
 // UNREPORTED, never reviewed (the fixture) and reviewed empty.
 const nr={p:gen(),ledger:[],ref:null},q=step(nr,rv(nr.p,w,{date:last(nr.p),id:'empty'}));
 const re={p:gen(),ledger:[],ref:null};for(let k=0;k<w;k++)step(re,rv(re.p,k,{date:re.p.weeks[k].sessions.at(-1).date}));const qe=step(re,rv(re.p,w,{date:last(re.p),id:'empty'}));
 // KNOWN_MISS at the week-6 review; then week 7 reported not done at its review.
 const km={p:gen(),ledger:[],ref:null},k6=step(km,rv(km.p,w,{date:last(km.p),observations:runsUpTo(km.p,'9999').filter(s=>s.weekIndex<=w).map(s=>notDone(km.p,s))}));
 const kmW7=runsFrom(km.p,7,km.p.weeks[7].startDate),k7=step(km,rv(km.p,7,{date:last(km.p).replace(/.*/,km.p.weeks[7].sessions.at(-1).date),observations:km.p.weeks[7].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>notDone(km.p,s))})),kmW8=runsFrom(km.p,8,km.p.weeks[8].startDate);
 // ANSWERED_KNOWN_STOP: the week-6 review asks; the answer on day 0 or day 2 of week 7 (every run dated before the answer day, not done).
 const ans={};
 for(const d of [0,2]){
  const t={p:nr.p,ledger:[...nr.ledger],ref:nr.ref},day=H.addDays(t.p.weeks[7].startDate,d),before=t.p;
  const r=step(t,rv(t.p,7,{date:day,time:'07:00:00',observations:runsUpTo(t.p,day).map(s=>notDone(t.p,s))}));
  const ahead=runsFrom(t.p,7,day),kmAhead=kmW7.filter(x=>ahead.some(y=>y.split(':')[0]===x.split(':')[0]));
  const end=step(t,rv(t.p,7,{date:t.p.weeks[7].sessions.at(-1).date,observations:t.p.weeks[7].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>notDone(t.p,s))}));
  ans['day'+d]={...typed(r),action:r.action??null,ahead,aheadAtOrBelowEntry:ahead.every(x=>Number(x.split(':')[2])<=ENTRY&&!/QUALITY|RACE_TOUCH/.test(x)),equalsKnownMissAhead:JSON.stringify(ahead)===JSON.stringify(kmAhead),historyIntact:past(t.p,7,day)===past(before,7,day),week8AfterWeek7Review:runsFrom(t.p,8,t.p.weeks[8].startDate),week8EqualsKnownMiss:JSON.stringify(runsFrom(t.p,8,t.p.weeks[8].startDate))===JSON.stringify(kmW8),week7Review:typed(end)};
 }
 out.D18={UNREPORTED_neverReviewed:{...typed(q),unreported:q.question?.unreported?.sessionIds?.length??0},UNREPORTED_reviewedEmpty:{...typed(qe),unreported:qe.question?.unreported?.sessionIds?.length??0,sameSessionsAsNeverReviewed:JSON.stringify(qe.question?.unreported?.sessionIds)===JSON.stringify(q.question?.unreported?.sessionIds)},KNOWN_MISS:{week6Review:typed(k6),week7:kmW7,week7AtOrBelowEntry:kmW7.every(x=>Number(x.split(':')[2])<=ENTRY),week8:kmW8},ANSWERED_KNOWN_STOP:ans};
}

// ---------- F3 (R6-H25) ----------
{
 const item=clone(rt.corpus.cases.find(c=>c.caseId==='R6-H25')),hi=POL.strength.goalDoses.MAINTAIN.repRange[1];
 const f3=P=>{if(!P)return {proposal:false};const rows=P.weeks.slice(7).flatMap(w=>w.sessions.filter(live).filter(s=>s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>['bench-press','lat-pulldown'].includes(e.id)).map(e=>({reps:e.reps,mode:e.load.mode,value:e.load.value??null}))));return {proposal:true,goal:P.goal.strength.kind,rows:rows.length,repsWithinMaintain:rows.every(x=>x.reps<=hi),neverAbove70:rows.every(x=>x.mode!=='KNOWN'||x.value<=70)};};
 const base=rt.evaluateHoldoutCase(clone(item),rt.opts),S1=base.steps[0],S2=base.steps[1];
 const P1=item.steps[0].adoptProposal===true&&S1.result.proposal?S1.result.proposal:base.generation.program;
 const t0={p:P1,ledger:S2.result.actualLedger??[],ref:S2.result.referenceState??null},asOf=S2.review.asOf,day=new Date(Date.parse(asOf)).toISOString().slice(0,10);
 const gapRuns=P=>P.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s)&&s.date<day).map(s=>notDone(P,s));
 const later=(h)=>new Date(Date.parse(asOf)+h*3600e3).toISOString().replace('.000Z','Z');
 const resub=step(copy(t0),{...clone(S2.review),asOf:later(1),event:{id:'lv-h25-resub',kind:'EVENT_DATE_CHANGE'},observations:gapRuns(t0.p),actualLedger:undefined,referenceState:undefined});
 const t1=copy(t0),plain=step(t1,{...clone(S2.review),asOf:later(1),event:{id:'lv-h25-plain',kind:'WEEKLY_REVIEW'},changes:undefined,observations:gapRuns(t1.p),actualLedger:undefined,referenceState:undefined});
 const thenEvent=step(t1,{...clone(S2.review),asOf:later(2),event:{id:'lv-h25-event',kind:'EVENT_DATE_CHANGE'},observations:[],actualLedger:undefined,referenceState:undefined});
 out.F3={adoptStep1:item.steps[0].adoptProposal===true,UNREPORTED:{S1:{...typed(S1.result),f3:f3(S1.result.proposal)},S2:typed(S2.result)},ANSWERED_resubmittedEvent:{...typed(resub),action:resub.action??null,f3:f3(resub.proposal)},ANSWERED_plainReviewThenEvent:{plain:{...typed(plain),action:plain.action??null},event:{...typed(thenEvent),action:thenEvent.action??null,f3:f3(thenEvent.proposal)}}};
}

// ---------- S19 ----------
{
 const o={id:'h-prog-missed',goals:{run:'PERFORMANCE',strength:'GENERAL'},weeks:12},ex={id:'h-prog',goals:{run:'PERFORMANCE',strength:'GENERAL'},weeks:12};
 const longOf=(p,w)=>H.runs(p,w).find(s=>s.role==='LONG')?.prescription.durationMinutes;
 const t=H.reviewed(ex,0);for(let w=0;w<5;w++)H.weekly(t,w);
 const unrep={p:H.program(o),ledger:[],ref:null};let r4;for(let w=0;w<5;w++)r4=step(unrep,H.review(unrep.p,w,{}));
 const block=r=>(r.disclosures??[]).find(d=>d.id==='BLOCK_REVIEW')?.held??null;
 // KNOWN_MISS: every session of each week reported not done at its review.
 const km={p:H.program(o),ledger:[],ref:null};let k4;for(let w=0;w<5;w++)k4=step(km,H.review(km.p,w,{observations:km.p.weeks[w].sessions.filter(live).map(s=>notDone(km.p,s))}));
 // ANSWERED at the week-4 review (re-submitted an hour later with every session of weeks 0-4 not done), and on day 2 of week 5.
 const all=(P,day)=>P.weeks.flatMap(x=>x.sessions).filter(s=>live(s)&&s.date<day).map(s=>notDone(P,s));
 const a1=copy(unrep),end4=H.addDays(a1.p.weeks[4].startDate,7),r4b=step(a1,H.review(a1.p,4,{hour:'22:00:00',observations:all(a1.p,end4)}));
 const a2=copy(unrep),d2=H.addDays(a2.p.weeks[5].startDate,2),r5=step(a2,H.review(a2.p,5,{day:2,hour:'07:00:00',observations:all(a2.p,d2)}));
 const kmWeek5=runsFrom(km.p,5,km.p.weeks[5].startDate);
 out.S19={executedLong1:longOf(t.p,1),executedState1Long:t.p.stateTrace[1].run.long,
  UNREPORTED:{week4:typed(r4),long5Stored:longOf(unrep.p,5),long1:longOf(unrep.p,1),state5Long:unrep.p.stateTrace[5].run.long,blockReview:block(r4)},
  KNOWN_MISS:{week4:typed(k4),long5:longOf(km.p,5),state5Long:km.p.stateTrace[5].run.long,blockReview:block(k4),week5:kmWeek5},
  ANSWERED_endOfWeek4:{...typed(r4b),action:r4b.action??null,long5:longOf(a1.p,5),state5Long:a1.p.stateTrace[5].run.long,blockReview:block(r4b),week5:runsFrom(a1.p,5,a1.p.weeks[5].startDate),week5EqualsKnownMiss:JSON.stringify(runsFrom(a1.p,5,a1.p.weeks[5].startDate))===JSON.stringify(kmWeek5)},
  ANSWERED_day2Week5:{...typed(r5),action:r5.action??null,ahead:runsFrom(a2.p,5,d2),aheadAtOrBelowEntry:runsFrom(a2.p,5,d2).every(x=>Number(x.split(':')[2])<=ENTRY&&!/QUALITY/.test(x)),blockReview:block(r5)}};
}

// ---------- FIFTH (short break) ----------
{
 const gen=()=>rt.generateProgram(rt.PROFILES.A_RUN_FIRST_HALF_MARATHON,rt.opts).program,w=5,lastDay=(p,k)=>p.weeks[k].sessions.at(-1).date;
 const ret=(t,extra={})=>step(t,rv(t.p,w,{date:lastDay(t.p,w),kind:'RETURN_AFTER_PAUSE',interruption:{days:6,reasonCategory:'WORK'},...extra}));
 const quality=(P)=>P?P.weeks[w+1].sessions.filter(s=>s.role==='QUALITY'&&live(s)).length:null;
 const runs6=P=>P?runsFrom(P,w+1,P.weeks[w+1].startDate):null;
 // UNREPORTED: the original fixture (fresh program, nothing reported).
 const u={p:gen(),ledger:[],ref:null},ru=ret(u);
 // EXECUTED (the Phase 2 edit): weeks 0-2 executed and reviewed.
 const e={p:gen(),ledger:[],ref:null};for(let k=0;k<3;k++)step(e,rv(e.p,k,{date:lastDay(e.p,k),observations:e.p.weeks[k].sessions.filter(s=>s.prescription).map(s=>H.obs(e.p,s))}));const re_=ret(e);
 // KNOWN_MISS: weeks 0-4 reviewed, strength executed, runs reported not done; then the break.
 const k={p:gen(),ledger:[],ref:null};for(let j=0;j<w;j++)step(k,rv(k.p,j,{date:lastDay(k.p,j),observations:k.p.weeks[j].sessions.filter(s=>s.prescription).map(s=>s.sport==='RUN'?notDone(k.p,s):H.obs(k.p,s))}));// The run dated on the return review's own day lies outside the declared 6 days: reported not done too.
 const onDay=P=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date===lastDay(P,w)).map(s=>notDone(P,s));
 const rk=ret(k,{observations:onDay(k.p)});
 // ANSWERED_KNOWN_STOP: the fixture's return asks; the return re-submitted an hour later with every run before the break start not done.
 const a=copy(u),brk=H.addDays(lastDay(a.p,w),-5),facts=a.p.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s)&&(s.date<brk||s.date===lastDay(a.p,w))).map(s=>notDone(a.p,s));
 const ra=step(a,rv(a.p,w,{date:lastDay(a.p,w),time:'22:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:6,reasonCategory:'WORK'},observations:facts}));
 out.FIFTH={UNREPORTED:{...typed(ru),action:ru.action??null,reason:String(ru.reason??'').slice(0,160)},EXECUTED_phase2Edit:{...typed(re_),action:re_.action??null,qualityNextWeek:quality(re_.proposal),runsNextWeek:runs6(re_.proposal)},KNOWN_MISS:{...typed(rk),action:rk.action??null,qualityNextWeek:quality(rk.proposal),runsNextWeek:runs6(rk.proposal),atOrBelowEntry:(runs6(rk.proposal)??[]).every(x=>Number(x.split(':')[2])<=ENTRY)},ANSWERED_KNOWN_STOP:{...typed(ra),action:ra.action??null,qualityNextWeek:quality(ra.proposal),runsNextWeek:runs6(ra.proposal),atOrBelowEntry:(runs6(ra.proposal)??[]).every(x=>Number(x.split(':')[2])<=ENTRY),factsReported:facts.length,reason:String(ra.reason??'').slice(0,200)}};
}
console.log(JSON.stringify(out,null,1));
