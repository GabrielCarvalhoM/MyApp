// SSCTR semantic disposition (R7-C Phase 4, Etapa F): reviewer's own read-only probe on the working tree (39115ed runtime) and, where named,
// on the R7B2-FREEZE-1 bytes extracted from git into a temporary directory. It writes nothing in the repository; prints JSON.
// Questions it answers, which the coordinator's probes do not:
//  SD1  A reactive signal (SYSTEMIC_FATIGUE) reported while UNREPORTED_TRAINING is open: what is decided, what the stored plan still holds,
//       and whether the signal survives the athlete's answer, (a) re-submitted with the answer, (b) answered through a plain weekly review.
//  SD2  O1 exposure: in the never-reporting simulator fixture of QRE-R6-04, are the stored hard sessions ever in a VALID plan?
//  SD3  B2: a taper with a known long run and unreported easy runs; doses and the words of the reason (no "not done" claim).
//  SD4  B5: an athlete who never reports: how many decisions repeat the question, and is the payload verbatim inside one gap week.
//  SD5  D1: R6-H19 on both runtimes, step by step, and whether the next weekly review regresses quality.
//  SD6  Answer paths after the question: reported not done (known miss) -> entry; declared break with a reason -> return recipe; executed -> plan.
import {REPO,R7B2_FREEZE_1,extract,load} from '../../../../probes/phase3-lib.mjs';
const NOW=await load(REPO),{H}=NOW,rt=NOW;
const x=extract(R7B2_FREEZE_1),B2=await load(x.root);
const out={check:'SSCTR-SD-R7C',runtime:'working tree',baseline:{freeze:'R7B2-FREEZE-1',commit:x.commit}};
const guard=(k,f)=>{try{out[k]=f();}catch(e){out[k]={error:String(e?.stack??e).slice(0,800)};}};
const GEN={id:'sd-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}};
const R10K={id:'sd-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const notDone=(p,s)=>({eventId:`sd-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const factsOf=(p,w,V,{only=null}={})=>p.weeks[w].sessions.filter(H.live).flatMap(s=>s.sport!=='RUN'?[H.obs(p,s)]:only?.(s)?[H.obs(p,s)]:V==='EXEC'?[H.obs(p,s)]:V==='MISS'?[notDone(p,s)]:[]);
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
const decide=(R,t,w,x={})=>R.evaluateProgram(t.p,{...R.H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.opts);
const runPlan=(P,ws)=>ws.filter(k=>P.weeks[k]).map(k=>P.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}${s.prescription.strides?':S':''}`).join('/')).join(' | ');
const brief=(r,P,ws)=>({status:r.status,action:r.action??null,question:r.question?.kind??null,proposal:!!r.proposal,validity:r.planValidity?.status??null,pending:r.referenceState?.pending?{status:r.referenceState.pending.status,eventKind:r.referenceState.pending.eventKind}:null,plan:runPlan(r.proposal??P,ws),reason:String(r.reason??'').slice(0,320)});
const gapTimeline=(R,prog,{g,b,V,mode='RV'})=>{const t={p:R.H.program(prog),ledger:[],ref:null};for(let w=0;w<g;w++)R.H.weekly(t,w);if(mode==='RV')for(let w=g;w<b;w++)apply(t,decide(R,t,w,{observations:factsOf(t.p,w,V)}));return t;};

// ---------- SD1: systemic fatigue during the gap ----------
guard('SD1_systemicFatigueDuringGap',()=>{
 const o={};
 for(const [label,prog,b] of [['GEN',GEN,7],['R10K',R10K,7]]){
  const at={day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'};
  const row={};
  for(const V of ['EXEC','MISS','UNREP']){const t=gapTimeline(rt,prog,{g:0,b,V});const r=decide(rt,t,b,at);row[V]=brief(r,t.p,[b]);}
  // The stored plan while the question is open: the hard work still in it this week.
  const tU=gapTimeline(rt,prog,{g:0,b,V:'UNREP'}),ask=apply(tU,decide(rt,tU,b,at));
  row.storedWhilePending={plan:runPlan(tU.p,[b]),hardAhead:tU.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&['QUALITY','LONG','RACE_TOUCH'].includes(s.role)).map(s=>`${s.role}:${s.prescription.durationMinutes}`),validity:ask.planValidity?.status,pendingKind:ask.referenceState?.pending?.eventKind};
  // (a) The answer re-submitted with the pending event's kind: late reports of the gap weeks as executed, or as not done.
  const late=(t,V)=>Array.from({length:b},(_,w)=>w).flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>V==='EXEC'?H.obs(t.p,s):notDone(t.p,s)));
  for(const V of ['EXEC','MISS']){const t=gapTimeline(rt,prog,{g:0,b,V:'UNREP'});apply(t,decide(rt,t,b,at));const r=decide(rt,t,b,{...at,hour:'08:00:00',observations:late(t,V)});row['answerResubmitted_'+V]=brief(r,t.p,[b]);}
  // (b) The answer through a plain weekly review the same morning (no fatigue signal restated).
  for(const V of ['EXEC','MISS']){const t=gapTimeline(rt,prog,{g:0,b,V:'UNREP'});apply(t,decide(rt,t,b,at));const r=decide(rt,t,b,{day:0,hour:'08:00:00',observations:late(t,V)});row['answerPlainReview_'+V]=brief(r,t.p,[b]);}
  // B.2 on the same UNREP input, for the comparison.
  {const t=gapTimeline(B2,prog,{g:0,b,V:'UNREP'});const r=decide(B2,t,b,at);row.B2_UNREP=brief(r,t.p,[b]);}
  o[label]=row;
 }
 return o;
});

// ---------- SD2: O1 exposure in the QRE-R6-04 fixture ----------
guard('SD2_storedPlanNeverValid',()=>{
 // The fixture of test/r6-engineering-fixes.test.mjs:94, rebuilt with its own intake helper semantics through the simulator.
 const elig=d=>H.elig(d);
 const input={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:12,learningConsent:true,
  athlete:{id:'sd-gate',ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-07'}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:4,runMinutesPerWeek:160,longestRunMinutes:60,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],
   knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]},
  schedule:{runDays:[1,3,5,6],strengthDays:[2],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80}};
 const sim=rt.simulateProgram(input,{default:{missed:[{sport:'RUN'}]}},rt.opts);
 const decisions=(sim.timeline??sim.steps??sim.decisions??[]);
 const keys=Object.keys(sim);
 const intense=sim.finalProgram.weeks.flatMap(w=>w.sessions).filter(s=>s.weekIndex>0&&s.prescription&&(s.role==='QUALITY'||s.role==='RACE_TOUCH'||s.prescription.strides)).map(s=>s.id);
 const fv=sim.finalValidity??sim.planValidity??sim.finalResult?.planValidity??null;
 const steps=Array.isArray(decisions)?decisions.map(d=>({w:d.weekIndex??d.week??null,status:d.status??d.result?.status,action:d.action??d.result?.action,question:(d.question??d.result?.question)?.kind??null,validity:(d.planValidity??d.result?.planValidity)?.status??null})):null;
 return {simKeys:keys,runReports:sim.actualLedger.filter(o=>o.context?.sport==='RUN').length,intenseInStoredFinal:intense,finalValidity:fv,steps};
});

// ---------- SD3: B2, taper with a known long run and unreported easy runs ----------
guard('SD3_B2_taperKnownLongUnreportedEasy',()=>{
 const o={};
 const phases=rt.H.program(R10K).phases.phases,taper=phases.indexOf('TAPER');
 for(const R of [['R7C',rt],['B2',B2]]){
  const [name,RT]=R,t={p:RT.H.program(R10K),ledger:[],ref:null};
  // Every week: strength and the long run reported executed, easy and quality runs with no report at all.
  for(let w=0;w<taper;w++){const only=s=>s.role==='LONG';const r=decide(RT,t,w,{observations:factsOf(t.p,w,'UNREP',{only})});apply(t,r);if(w===taper-1)o[name]={lastReview:brief(r,t.p,[taper,taper+1])};}
  // And with the easy runs reported not done instead (a known stop of the easy dimension).
  const k={p:RT.H.program(R10K),ledger:[],ref:null};
  for(let w=0;w<taper;w++){const only=s=>s.role==='LONG';const obs=k.p.weeks[w].sessions.filter(H.live).flatMap(s=>s.sport!=='RUN'||only(s)?[RT.H.obs(k.p,s)]:[notDone(k.p,s)]);const r=decide(RT,k,w,{observations:obs});apply(k,r);if(w===taper-1)o[name].knownMissEasy=brief(r,k.p,[taper,taper+1]);}
  const e={p:RT.H.program(R10K),ledger:[],ref:null};for(let w=0;w<taper;w++)RT.H.weekly(e,w);o[name].allExecuted=runPlan(e.p,[taper,taper+1]);
 }
 o.reasonClaimsNotDone=/not done|missed|skipped/i.test(o.R7C?.lastReview?.reason??'');
 return o;
});

// ---------- SD4: B5, never reporting ----------
guard('SD4_B5_askingCost',()=>{
 const t={p:rt.H.program(GEN),ledger:[],ref:null};for(let w=0;w<2;w++)rt.H.weekly(t,w);
 const asked=[];
 for(let w=2;w<12;w++){
  // A weekly review with only strength reported; mid-week, one schedule-neutral decision (an unavailable strength day).
  const mid=decide(rt,t,w,{day:2,hour:'07:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[H.addDays(t.p.weeks[w].startDate,4)]}});
  const end=decide(rt,t,w,{observations:factsOf(t.p,w,'UNREP')});
  asked.push({w,mid:{status:mid.status,action:mid.action,q:mid.question?.kind??null,qWeek:mid.question?.fromWeek??null,qHash:mid.question?rt.hash(mid.question):null},end:{status:end.status,action:end.action,q:end.question?.kind??null,qWeek:end.question?.fromWeek??null,qHash:end.question?rt.hash(end.question):null}});
  apply(t,end);
 }
 const sameWeekVerbatim=asked.filter(a=>a.mid.q&&a.end.q&&a.mid.qWeek===a.end.qWeek).map(a=>a.mid.qHash===a.end.qHash);
 return {firstAskWeek:asked.find(a=>a.end.q)?.w??null,questionsRaised:asked.reduce((n,a)=>n+(a.mid.q?1:0)+(a.end.q?1:0),0),decisions:asked.length*2,validAfterFirstAsk:asked.filter(a=>a.end.q===null&&a.w>=(asked.find(z=>z.end.q)?.w??99)).map(a=>a.w),sameWeekVerbatim,rows:asked};
});

// ---------- SD5: D1, R6-H19 on both runtimes ----------
guard('SD5_D1_H19',()=>{
 const run=RT=>{const c=RT.clone(RT.corpus.cases.find(k=>k.caseId==='R6-H19'));const r=RT.evaluateHoldoutCase(c,RT.opts);
  return r.steps.map((s,i)=>{const res=s.result,P=res.proposal;const w=c.steps[i].review.weekIndex;return {step:'S'+(i+1),kind:c.steps[i].review.event.kind,week:w,status:res.status,action:res.action??null,question:res.question?.kind??null,gates:res.gates??null,next:P?runPlan(P,[w,w+1]):null,planHash:P?RT.hash(P.weeks.map(x=>x.sessions.map(z=>[z.id,z.prescription??null]))):null,reason:String(res.reason??'').slice(0,240)};});};
 const a=run(B2),b=run(rt);
 return {B2:a,R7C:b,sameFromS2:a.slice(1).every((s,i)=>s.status===b[i+1].status&&s.action===b[i+1].action&&s.planHash===b[i+1].planHash),S1:{B2:a[0].status+'/'+a[0].action,R7C:b[0].status+'/'+b[0].action+'/'+b[0].question}};
});

// ---------- SD6: answer paths after the question ----------
guard('SD6_answerPaths',()=>{
 const b=7,o={};
 const base=()=>{const t=gapTimeline(rt,GEN,{g:2,b,V:'UNREP'});const ask=apply(t,decide(rt,t,b-1,{hour:'21:30:00',observations:[]}));return {t,ask};};
 {const {t,ask}=base();o.ask=brief(ask,t.p,[b]);}
 // Known miss: the sessions of the window reported not done.
 {const {t}=base();const late=Array.from({length:b-2},(_,i)=>i+2).flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>notDone(t.p,s)));const r=decide(rt,t,b-1,{hour:'22:00:00',observations:late});o.reportedNotDone=brief(r,t.p,[b,b+1]);}
 // Declared break with a nonclinical reason covering the window.
 {const {t}=base();const end=H.addDays(t.p.weeks[b].startDate,-1),start=t.p.weeks[2].startDate;const r=decide(rt,t,b,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,reasonCategory:'WORK',reason:'work travel',nonclinical:true}});o.declaredBreak=brief(r,t.p,[b,b+1]);o.declaredBreak.class=r.proposal?.decisions?.at(-1)?.interruption?.class??null;}
 // Declared break with a clinical reason.
 {const {t}=base();const r=decide(rt,t,b,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:35,reasonCategory:'ILLNESS',reason:'flu'}});o.declaredClinicalBreak=brief(r,t.p,[b]);}
 // Executed: the sessions reported done.
 {const {t}=base();const late=Array.from({length:b-2},(_,i)=>i+2).flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>H.obs(t.p,s)));const r=decide(rt,t,b-1,{hour:'22:00:00',observations:late});o.reportedExecuted=brief(r,t.p,[b,b+1]);}
 return o;
});

x.cleanup();
console.log(JSON.stringify(out,null,1));
