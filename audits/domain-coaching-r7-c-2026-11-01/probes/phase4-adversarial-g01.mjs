// R7-C Phase 4, steps E/H: adversarial properties of R7C-G01 (unknown is neither success nor failure) on the working tree. Read-only; prints JSON.
//
// A. The Phase 3 grid (phase3-adversarial-g01.mjs: programs, b, g, RV/NR, weekly review or schedule change; the same metamorphic property P-UNK and
//    verdicts), with two readings it lacked: a decision that keeps the UNREPORTED_TRAINING question pending beside an independent change is a
//    question (PENDING), and a HOLD (fail-closed refusal) is reported as such, never as the stored plan.
// B. The P3-02 grid: after the gap the reviews asked about (g = 0 or the window entirely unreported), a decision of every kind at day 0 of week b,
//    with the same input in the EXEC, MISS and UNREP timelines. Strict property: when EXEC and MISS leave different run doses in force, UNREP is
//    the question (ASK, or PENDING beside an independent change), never VALID; a dependent decision has no proposal; an independent one plans no
//    run dose (every run prescription still ahead is one the plan had in that week) and its question is the review's own (same payload).
// P1 (refined): every UNREPORTED_TRAINING question raised: as ASK it is typed, has no proposal and names only elapsed run sessions of its window
//    with no report; carried beside an independent change it keeps the plan's run doses unvalidated (REQUIRES_RECONCILIATION, pending ASK).
// Named neighbours as in Phase 3 (N1 one run inside the gap, N2 late answer, N3 pause overlapping the gap, N4 corrected pause, N9 clinical first).
import {REPO,load} from './phase3-lib.mjs';
const NOW=await load(REPO),{H}=NOW,rt=NOW;
const UNREPORTED='observations.unreportedSessions|interruption';
const race=(kind,id,extra={})=>({id,weeks:12,goals:{run:{kind:'RACE',event:{kind,date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:kind==='10K'?100:120},...extra});
const PROGRAMS={GEN:{id:'adv-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}},R10K:race('10K','adv-10k'),RHM:race('HALF_MARATHON','adv-hm',{schedule:{runDays:[1,3,4,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:120}})};
const notDone=(p,s)=>({eventId:`adv-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const factsOf=(p,w,V,{only=null}={})=>p.weeks[w].sessions.filter(H.live).flatMap(s=>s.sport!=='RUN'?[H.obs(p,s)]:only?.(s)?[H.obs(p,s)]:V==='EXEC'?[H.obs(p,s)]:V==='MISS'?[notDone(p,s)]:[]);
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const decide=(t,w,x={})=>rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger},rt.opts);
const runPlan=(P,b)=>[b,b+1].filter(k=>P.weeks[k]).map(k=>P.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}${s.prescription.strides?':S':''}`).join('/')).join(' | ');
const planOf=(t,r,b)=>r.status==='ASK'?'ASK:'+(r.question?.kind??r.missingInputs?.join(',')):r.question?.kind==='UNREPORTED_TRAINING'?'PENDING:UNREPORTED_TRAINING':r.status==='CLINICAL_HUMAN_REQUIRED'?'CLINICAL':r.status==='HOLD'?'HOLD':runPlan(r.proposal??t.p,b);
const asks=u=>u.startsWith('ASK:UNREPORTED_TRAINING')||u==='PENDING:UNREPORTED_TRAINING';
const p1=[],violations=[],unnecessaryAsks=[],rows=[],ENTRY=rt.opts.authority.policy.operational.return.entryRunMinutes;
const collapse=plan=>{if(/^(ASK|PENDING|CLINICAL|HOLD)/.test(plan))return false;const r=(plan.split(' | ')[0]??'').split('/').filter(Boolean).map(z=>{const [role,min]=z.split(':');return {role,min:+min};}).filter(x=>['EASY','LONG'].includes(x.role));return r.length>0&&r.every(x=>x.min<=ENTRY);};
const runRows=(P,from)=>P.weeks.slice(from).map(x=>x.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>rt.hash(s.prescription)).sort());
const noNewRun=(a,b,from)=>{const B=runRows(b,from);return runRows(a,from).every((list,k)=>{const pool=[...B[k]];return list.every(h=>{const i=pool.indexOf(h);if(i<0)return false;pool.splice(i,1);return true;});});};
/** P1 (refined). `w` is the decision's week; `before` the program the decision received. */
function checkP1(label,t,r,w,before=t.p){
 if(r.question?.kind!=='UNREPORTED_TRAINING')return;
 const q=r.question,reported=new Set([...t.ledger,...(r.actualLedger??[])].map(o=>o.sessionId)),all=before.weeks.flatMap(x=>x.sessions),ids=q.unreported.sessionIds;
 const typed=JSON.stringify(r.missingInputs)===JSON.stringify([UNREPORTED])&&q.dependentScope==='RUN_DOSE'&&ids.length>0&&ids.every(id=>{const s=all.find(x=>x.id===id);return s&&s.sport==='RUN'&&s.date>=q.referenceWindow.from&&s.date<=q.referenceWindow.through&&!reported.has(id);})&&r.planValidity?.status==='REQUIRES_RECONCILIATION'&&r.referenceState?.pending?.status==='ASK';
 const form=r.status==='ASK'?r.action==='ASK'&&r.proposal===null:!!r.proposal&&noNewRun(r.proposal,before,w);
 p1.push({label,form:r.status==='ASK'?'ASK':'PENDING',ok:typed&&form});
}
function timeline(prog,{g,b,mode,kind,V}){
 const t={p:H.program(prog),ledger:[]};
 for(let w=0;w<g;w++)H.weekly(t,w);
 if(mode==='RV')for(let w=g;w<b-(kind==='WEEKLY'?1:0);w++){const before=t.p,r=apply(t,decide(t,w,{observations:factsOf(t.p,w,V)}));checkP1(`gap-review w${w}`,t,r,w,before);}
 const late=mode==='NR'?Array.from({length:b-g},(_,i)=>g+i).flatMap(w=>factsOf(t.p,w,V)):[];
 const r=kind==='WEEKLY'?decide(t,b-1,{observations:mode==='RV'?factsOf(t.p,b-1,V):late}):decide(t,b,{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:late});
 return {t,r};
}
function verdict(out){
 const depends=out.EXEC.plan!==out.MISS.plan,u=out.UNREP.plan;
 if(depends)return asks(u)?'OK_ASK':u==='HOLD'?'HOLD_FAIL_CLOSED':u===out.MISS.plan?(collapse(out.MISS.plan)&&!collapse(out.EXEC.plan)?'VIOLATION_ZERO_COLLAPSE':'OK_HOLD_LIKE_REVIEWED_MISS'):u===out.EXEC.plan?'VIOLATION_CREDIT':u.startsWith('ASK')?'OTHER_ASK':'VIOLATION_THIRD_PLAN';
 return u===out.EXEC.plan?'OK_INDEPENDENT':asks(u)?'UNNECESSARY_ASK':'DIVERGENT';
}
// ---------- A: the Phase 3 grid ----------
for(const [pname,prog] of Object.entries(PROGRAMS)){
 const phases=H.program(prog).phases.phases,taper=phases.indexOf('TAPER'),raceWeek=phases.indexOf('RACE_WEEK');
 const bs=[...new Set(pname==='GEN'?[4,7]:[4,taper-1,taper,raceWeek].filter(x=>x>=2))];
 for(const b of bs)for(const g of [...new Set([0,b-1,b-2,b-4].filter(x=>x>=0&&x<b))])for(const mode of ['RV','NR'])for(const kind of ['WEEKLY','SCHEDULE']){
  const out={};
  for(const V of ['EXEC','MISS','UNREP']){try{const {t,r}=timeline(prog,{g,b,mode,kind,V});out[V]={plan:planOf(t,r,b),status:r.status,action:r.action};if(V==='UNREP')checkP1(`${pname} b${b} g${g} ${mode} ${kind}`,t,r,kind==='WEEKLY'?b-1:b);}catch(e){out[V]={error:String(e.message).slice(0,160)};}}
  const label=`${pname} b=${b}(${phases[b]}) g=${g} ${mode} ${kind}`,errors=Object.entries(out).filter(([,v])=>v.error).map(([k,v])=>k+': '+v.error);
  const row={grid:'A',label,EXEC:out.EXEC.plan,MISS:out.MISS.plan,UNREP:out.UNREP.plan,errors,verdict:errors.length?'ERROR':verdict(out)};
  rows.push(row);if(/^VIOLATION|ERROR|DIVERGENT|OTHER_ASK/.test(row.verdict))violations.push(row);if(row.verdict==='UNNECESSARY_ASK')unnecessaryAsks.push(row);
 }
}
// ---------- B: the P3-02 grid ----------
const KINDS={
 SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
 GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
 WEEKLY_REVIEW_MIDWEEK:()=>({}),
 SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
 LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
 UNAVAILABLE_LONG_RUN_DAY:(t,b)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[H.addDays(t.p.weeks[b].startDate,6)]}}),
 UNAVAILABLE_STRENGTH_DAY:(t,b)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[H.addDays(t.p.weeks[b].startDate,4)]}}),
 EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
 MISSED_LONG_RUN:(t,b)=>({day:6,hour:'20:00:00',kind:'MISSED_SESSION',targetSessionId:t.p.weeks[b].sessions.find(s=>s.sport==='RUN'&&H.live(s)&&s.role==='LONG')?.id}),
 UNDERPERFORMANCE_LONG_RUN:(t,b)=>({day:6,hour:'20:00:00',kind:'UNDERPERFORMANCE',targetSessionId:t.p.weeks[b].sessions.find(s=>s.sport==='RUN'&&H.live(s)&&s.role==='LONG')?.id}),
 RECOVERED:()=>({kind:'RECOVERED'})
};
const RACE_KINDS={EVENT_DATE_CHANGE:()=>({kind:'EVENT_DATE_CHANGE',changes:{eventDate:H.addDays('2026-11-02',10*7+6)}})};
const p302=[];
for(const [pname,prog] of Object.entries({GEN:PROGRAMS.GEN,R10K:PROGRAMS.R10K})){
 const b=7;
 for(const g of [0,2]){
  const T={};for(const V of ['EXEC','MISS','UNREP']){const t={p:H.program(prog),ledger:[],reviews:[]};for(let w=0;w<g;w++)H.weekly(t,w);for(let w=g;w<b;w++){const before=t.p,r=apply(t,decide(t,w,{observations:factsOf(t.p,w,V)}));t.reviews.push(r);if(V==='UNREP')checkP1(`P3-02 ${pname} g${g} review w${w}`,t,r,w,before);}T[V]=t;}
  const lastAsk=T.UNREP.reviews.at(-1).question??null;
  for(const [kind,make] of Object.entries({...KINDS,...(pname==='R10K'?RACE_KINDS:{})})){
   const out={},res={};
   for(const V of ['EXEC','MISS','UNREP']){const t=T[V],x=make(t,b),at=x.day!==undefined?{}:{day:0,hour:'07:00:00'};try{const r=decide(t,b,{...at,...x});res[V]=r;out[V]={plan:planOf(t,r,b)};if(V==='UNREP')checkP1(`P3-02 ${pname} g${g} ${kind}`,t,r,b);}catch(e){out[V]={plan:'ERROR',error:String(e.message).slice(0,160)};}}
   const u=res.UNREP,depends=out.EXEC.plan!==out.MISS.plan,dependent=!!u&&u.status==='ASK';
   const row={grid:'B',label:`${pname} g=${g} b=${b} ${kind}`,depends,EXEC:out.EXEC.plan,MISS:out.MISS.plan,UNREP:out.UNREP.plan,validity:u?.planValidity?.status??null,// A decision about the week the reviews asked for repeats their question; one that plans the next week (the week complete) asks its own.
    sameQuestionAsReview:u?.question&&u.question.fromWeek===lastAsk?.fromWeek?JSON.stringify(u.question)===JSON.stringify(lastAsk):null,questionWeek:u?.question?.fromWeek??null,
    form:!u?'ERROR':dependent?(u.proposal===null?'ASK_NO_PROPOSAL':'ASK_WITH_PROPOSAL'):u.question?.kind==='UNREPORTED_TRAINING'?(!u.proposal?'PENDING_NO_PROPOSAL':noNewRun(u.proposal,T.UNREP.p,b)?'PENDING_NO_NEW_RUN_DOSE':'PENDING_NEW_RUN_DOSE'):u.status};
   row.verdict=Object.values(out).some(o=>o.error)?'ERROR':!depends?(asks(out.UNREP.plan)?'INDEPENDENT_ASK':'OK_INDEPENDENT'):asks(out.UNREP.plan)&&row.validity==='REQUIRES_RECONCILIATION'&&['ASK_NO_PROPOSAL','PENDING_NO_NEW_RUN_DOSE'].includes(row.form)&&row.sameQuestionAsReview!==false?'OK_ASK':'VIOLATION';
   p302.push(row);if(row.verdict==='VIOLATION'||row.verdict==='ERROR')violations.push(row);
  }
 }
}
// ---------- named neighbours (Phase 3) ----------
const named={};
const guard=(k,f)=>{try{named[k]=f();}catch(e){named[k]={error:String(e?.stack??e).slice(0,600)};}};
guard('N1_oneRunInsideGap',()=>{const o={};for(const mode of ['RV','NR']){const res={};for(const V of ['UNREP','MISS']){const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);
  const one=t.p.weeks[4].sessions.find(s=>H.live(s)&&s.sport==='RUN'),only=s=>s.id===one.id;
  if(mode==='RV'){for(let w=2;w<6;w++)apply(t,decide(t,w,{observations:factsOf(t.p,w,V,{only})}));}
  const r=decide(t,6,{observations:mode==='RV'?factsOf(t.p,6,V,{only}):[2,3,4,5,6].flatMap(w=>factsOf(t.p,w,V,{only}))});res[V]={plan:planOf(t,r,7),status:r.status};}
  o[mode]={...res,holds:res.UNREP.status!=='ASK'&&res.UNREP.plan===res.MISS.plan};}return o;});
guard('N2_lateAnswer',()=>{const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);
 const ask=decide(t,6,{observations:[2,3,4,5,6].flatMap(w=>factsOf(t.p,w,'UNREP'))});
 const answer=decide(t,6,{hour:'22:00:00',observations:[2,3,4,5,6].flatMap(w=>factsOf(t.p,w,'EXEC'))});
 const past=P=>P.weeks.slice(0,7).map(w=>w.sessions.map(s=>s.id+':'+rt.hash(s.prescription??null)));
 const ref=timeline(PROGRAMS.GEN,{g:2,b:7,mode:'NR',kind:'WEEKLY',V:'EXEC'}),inForce=answer.proposal??t.p;
 return {ask:ask.status+'/'+(ask.question?.kind??''),answer:answer.status+'/'+answer.action,historyUnchanged:JSON.stringify(past(inForce))===JSON.stringify(past(t.p)),sameAsTimelyNR:runPlan(inForce,7)===planOf(ref.t,ref.r,7)};});
guard('N3_pauseOverlappingGap',()=>{const o={};for(const [cls,days] of [['SHORT',6],['MODERATE',14],['LONG',28]]){const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);
  const end=H.addDays(t.p.weeks[6].startDate,-1),start=H.addDays(end,-(days-1));
  const r=decide(t,6,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days,reasonCategory:'WORK',reason:'work',nonclinical:true}});
  o[cls]={status:r.status,action:r.action,question:r.question?.kind??null,cls:r.proposal?.decisions?.at(-1)?.interruption?.class??null,nextRuns:r.proposal?runPlan(r.proposal,6):null};if(r.question)checkP1('N3 '+cls,t,r,6);}return o;});
guard('N4_correctedPause',()=>{const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<4;w++)H.weekly(t,w);
 const s0=t.p.weeks[4].startDate,first=apply(t,decide(t,6,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:s0,endDate:H.addDays(s0,13),days:14,reasonCategory:'WORK',reason:'work',nonclinical:true}}));
 const A=t.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
 const fix=decide(t,6,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:H.addDays(s0,7),endDate:H.addDays(s0,13),days:7,reasonCategory:'WORK',reason:'work',nonclinical:true,episodeId:A?.interruption?.episode}});
 if(fix.question)checkP1('N4 correction',t,fix,6);
 return {first:first.status+'/'+first.action,correction:fix.status+'/'+fix.action,question:fix.question?.kind??null,missing:fix.missingInputs};});
guard('N9_clinicalFirst',()=>{const t={p:H.program(PROGRAMS.R10K),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);const w=6,day=H.addDays(t.p.weeks[w].startDate,6);
 const X=t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const cases={weeklyPain:{eligibility:{...H.elig(day),pain:true}},weeklyIllness:{eligibility:{...H.elig(day),illness:true}},scheduleWithPain:{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},eligibility:{...H.elig(t.p.weeks[w].startDate),pain:true}},returnIllness:{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:21,reasonCategory:'ILLNESS'}},substitutionPain:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}},eventDateWithInjury:{day:0,hour:'07:00:00',kind:'EVENT_DATE_CHANGE',changes:{eventDate:H.addDays('2026-11-02',10*7+6)},eligibility:{...H.elig(t.p.weeks[w].startDate),injury:true}},midweekEquipmentWithPain:{day:0,hour:'07:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']},eligibility:{...H.elig(t.p.weeks[w].startDate),pain:true}}};
 const o={};for(const [k,x] of Object.entries(cases)){const r=decide(t,w,x);o[k]={status:r.status,proposal:!!r.proposal,question:r.question?.kind??null,pending:r.referenceState?.pending?.status??null};}
 o.allClinicalNoProposal=Object.values(o).every(x=>x.status==='CLINICAL_HUMAN_REQUIRED'&&!x.proposal&&x.question===null);return o;});
const count=list=>{const v={};for(const r of list)v[r.verdict]=(v[r.verdict]??0)+1;return v;};
console.log(JSON.stringify({check:'R7C-P4-ADVERSARIAL-G01',runtime:'working tree (R7-C)',gridA:{cases:rows.length,verdicts:count(rows)},gridB:{cases:p302.length,verdicts:count(p302)},violations,unnecessaryAsks:unnecessaryAsks.map(r=>r.label),p1:{questions:p1.length,asked:p1.filter(x=>x.form==='ASK').length,pending:p1.filter(x=>x.form==='PENDING').length,failed:p1.filter(x=>!x.ok).map(x=>x.label)},named,rowsA:rows,rowsB:p302},null,1));
