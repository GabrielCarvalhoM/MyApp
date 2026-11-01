// R7-C Phase 3, step 5: adversarial properties of R7C-G01 (unknown is neither success nor failure) on the R7-C runtime. Read-only; prints JSON.
//
// Core metamorphic property P-UNK, at a decision D that plans week b after a gap of elapsed weeks [g, b): the gap's run sessions are either
// EXEC (reported done as prescribed), MISS (reported not done) or UNREP (no report at all); strength in the gap is reported done in all three, so
// only the running facts vary. planOf = the run prescriptions of weeks b and b+1 the decision leaves in force (its proposal; the stored plan on
// KEEP), or ASK. If planOf(EXEC) != planOf(MISS), the dose depends on the gap and UNREP must be the typed question with no proposal; an UNREP plan
// equal to EXEC is credit. An UNREP plan equal to MISS is the zero reading only when MISS collapses (every easy and long run of week b at or below
// the reviewed entry while EXEC is above it: VIOLATION_ZERO_COLLAPSE); when MISS holds the last executed dose, UNREP equal to it is the approved
// reviewed-missed hold (SSCTR r12), neither credit nor zero (OK_HOLD_LIKE_REVIEWED_MISS). If EXEC and MISS are equal, the dose does not depend on
// the gap (an UNREP ask there is noted).
// Grid: programs (general, 10K and half marathon with the race in week 11), gap start g (0 = nothing ever reported), b across build, the week
// before the taper, the taper and race week, reviewed gap weeks (RV) or none (NR, the facts arrive at D), and D a weekly review or a schedule change.
// Named neighbours: one run reported inside the gap, late reports answering the question, a declared pause overlapping the gap (and corrected),
// the clinical route before the question, and P1 (the typed question's payload) on every question raised.
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
const planOf=(t,r,b)=>r.status==='ASK'?'ASK:'+(r.question?.kind??r.missingInputs?.join(',')):r.status==='CLINICAL_HUMAN_REQUIRED'?'CLINICAL':runPlan(r.proposal??t.p,b);
const p1=[],violations=[],unnecessaryAsks=[],rows=[],ENTRY=rt.opts.authority.policy.operational.return.entryRunMinutes;
const collapse=plan=>{if(plan.startsWith('ASK')||plan==='CLINICAL')return false;const r=(plan.split(' | ')[0]??'').split('/').filter(Boolean).map(z=>{const [role,min]=z.split(':');return {role,min:+min};}).filter(x=>['EASY','LONG'].includes(x.role));return r.length>0&&r.every(x=>x.min<=ENTRY);};
/** P1: a raised UNREPORTED_TRAINING question is typed, carries no proposal, and names only elapsed run sessions of its window with no report. */
function checkP1(label,t,r){
 if(r.question?.kind!=='UNREPORTED_TRAINING')return;
 const q=r.question,reported=new Set([...t.ledger,...(r.actualLedger??[])].map(o=>o.sessionId)),all=t.p.weeks.flatMap(w=>w.sessions),ids=q.unreported.sessionIds;
 const ok=r.status==='ASK'&&r.action==='ASK'&&r.proposal===null&&JSON.stringify(r.missingInputs)===JSON.stringify([UNREPORTED])&&q.dependentScope==='RUN_DOSE'&&ids.length>0&&ids.every(id=>{const s=all.find(x=>x.id===id);return s&&s.sport==='RUN'&&s.date>=q.referenceWindow.from&&s.date<=q.referenceWindow.through&&!reported.has(id);})&&r.planValidity?.status==='REQUIRES_RECONCILIATION';
 p1.push({label,ok});
}
function timeline(prog,{g,b,mode,kind,V}){
 const t={p:H.program(prog),ledger:[]};
 for(let w=0;w<g;w++)H.weekly(t,w);
 if(mode==='RV')for(let w=g;w<b-(kind==='WEEKLY'?1:0);w++){const r=apply(t,decide(t,w,{observations:factsOf(t.p,w,V)}));checkP1(`gap-review w${w}`,t,r);}
 const late=mode==='NR'?Array.from({length:b-g},(_,i)=>g+i).flatMap(w=>factsOf(t.p,w,V)):[];
 const r=kind==='WEEKLY'?decide(t,b-1,{observations:mode==='RV'?factsOf(t.p,b-1,V):late}):decide(t,b,{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:late});
 return {t,r};
}
for(const [pname,prog] of Object.entries(PROGRAMS)){
 const phases=H.program(prog).phases.phases,taper=phases.indexOf('TAPER'),raceWeek=phases.indexOf('RACE_WEEK');
 const bs=[...new Set(pname==='GEN'?[4,7]:[4,taper-1,taper,raceWeek].filter(x=>x>=2))];
 for(const b of bs)for(const g of [...new Set([0,b-1,b-2,b-4].filter(x=>x>=0&&x<b))])for(const mode of ['RV','NR'])for(const kind of ['WEEKLY','SCHEDULE']){
  const out={};
  for(const V of ['EXEC','MISS','UNREP']){try{const {t,r}=timeline(prog,{g,b,mode,kind,V});out[V]={plan:planOf(t,r,b),status:r.status,action:r.action};if(V==='UNREP')checkP1(`${pname} b${b} g${g} ${mode} ${kind}`,t,r);}catch(e){out[V]={error:String(e.message).slice(0,160)};}}
  const depends=out.EXEC.plan!==out.MISS.plan,u=out.UNREP.plan,label=`${pname} b=${b}(${phases[b]}) g=${g} ${mode} ${kind}`;
  const row={label,depends,EXEC:out.EXEC.plan,MISS:out.MISS.plan,UNREP:u,errors:Object.entries(out).filter(([,v])=>v.error).map(([k,v])=>k+': '+v.error)};
  if(row.errors.length)row.verdict='ERROR';
  else if(depends){row.verdict=u.startsWith('ASK:UNREPORTED_TRAINING')?'OK_ASK':u===out.MISS.plan?(collapse(out.MISS.plan)&&!collapse(out.EXEC.plan)?'VIOLATION_ZERO_COLLAPSE':'OK_HOLD_LIKE_REVIEWED_MISS'):u===out.EXEC.plan?'VIOLATION_CREDIT':u.startsWith('ASK')?'OTHER_ASK':'VIOLATION_THIRD_PLAN';}
  else row.verdict=u===out.EXEC.plan?'OK_INDEPENDENT':u.startsWith('ASK')?'UNNECESSARY_ASK':'DIVERGENT';
  rows.push(row);if(row.verdict.startsWith('VIOLATION')||row.verdict==='ERROR'||row.verdict==='DIVERGENT'||row.verdict==='OTHER_ASK')violations.push(row);if(row.verdict==='UNNECESSARY_ASK')unnecessaryAsks.push(row);
 }
}
// ---------- named neighbours ----------
const named={};
const guard=(k,f)=>{try{named[k]=f();}catch(e){named[k]={error:String(e?.stack??e).slice(0,600)};}};
// N1: one run reported done inside an otherwise unreported gap anchors the window: no question, and the rest reads as reviewed-missed (HOLD).
guard('N1_oneRunInsideGap',()=>{const o={};for(const mode of ['RV','NR']){const res={};for(const V of ['UNREP','MISS']){const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);
  const one=t.p.weeks[4].sessions.find(s=>H.live(s)&&s.sport==='RUN'),only=s=>s.id===one.id;
  if(mode==='RV'){for(let w=2;w<6;w++)apply(t,decide(t,w,{observations:factsOf(t.p,w,V,{only})}));}
  const r=decide(t,6,{observations:mode==='RV'?factsOf(t.p,6,V,{only}):[2,3,4,5,6].flatMap(w=>factsOf(t.p,w,V,{only}))});res[V]={plan:planOf(t,r,7),status:r.status};}
  o[mode]={...res,holds:res.UNREP.status!=='ASK'&&res.UNREP.plan===res.MISS.plan};}return o;});
// N2: late reports answer the question; history (weeks up to the decision) is never rewritten; the answer plans as if reported in time (NR EXEC).
guard('N2_lateAnswer',()=>{const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);
 const ask=decide(t,6,{observations:[2,3,4,5,6].flatMap(w=>factsOf(t.p,w,'UNREP'))});
 const answer=decide(t,6,{hour:'22:00:00',observations:[2,3,4,5,6].flatMap(w=>factsOf(t.p,w,'EXEC'))});
 const past=P=>P.weeks.slice(0,7).map(w=>w.sessions.map(s=>s.id+':'+rt.hash(s.prescription??null)));
 const ref=timeline(PROGRAMS.GEN,{g:2,b:7,mode:'NR',kind:'WEEKLY',V:'EXEC'});
 // The plan in force after the answer: its proposal, or the stored plan when the reported facts are what the plan assumed (KEEP).
 const inForce=answer.proposal??t.p;
 return {ask:ask.status+'/'+(ask.question?.kind??''),answer:answer.status+'/'+answer.action,historyUnchanged:JSON.stringify(past(inForce))===JSON.stringify(past(t.p)),sameAsTimelyNR:runPlan(inForce,7)===planOf(ref.t,ref.r,7)};});
// N3: a declared pause overlapping an unreported gap: the return's own recipe (a short break resumes the last executed doses and asks when those
// rest on unreported sessions outside the pause; a longer break re-enters from the reviewed entry, exempt by design).
guard('N3_pauseOverlappingGap',()=>{const o={};for(const [cls,days] of [['SHORT',6],['MODERATE',14],['LONG',28]]){const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);
  const end=H.addDays(t.p.weeks[6].startDate,-1),start=H.addDays(end,-(days-1));
  const r=decide(t,6,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days,reasonCategory:'WORK',reason:'work',nonclinical:true}});
  const unknownOutside=t.p.weeks.flatMap(w=>w.sessions).filter(s=>s.sport==='RUN'&&H.live(s)&&s.date<start&&s.date>=t.p.weeks[2].startDate).length;
  o[cls]={status:r.status,action:r.action,question:r.question?.kind??null,unreportedRunSessionsBeforePause:unknownOutside,cls:r.proposal?.decisions?.at(-1)?.interruption?.class??null,nextRuns:r.proposal?runPlan(r.proposal,6):null};if(r.question)checkP1('N3 '+cls,t,r);}return o;});
// N4: a corrected pause: the correction (same episode, shorter dates) supersedes the first report; the days it no longer covers are unknown again.
guard('N4_correctedPause',()=>{const t={p:H.program(PROGRAMS.GEN),ledger:[]};for(let w=0;w<4;w++)H.weekly(t,w);
 const s0=t.p.weeks[4].startDate,first=apply(t,decide(t,6,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:s0,endDate:H.addDays(s0,13),days:14,reasonCategory:'WORK',reason:'work',nonclinical:true}}));
 const A=t.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
 const fix=decide(t,6,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:H.addDays(s0,7),endDate:H.addDays(s0,13),days:7,reasonCategory:'WORK',reason:'work',nonclinical:true,episodeId:A?.interruption?.episode}});
 if(fix.question)checkP1('N4 correction',t,fix);
 return {first:first.status+'/'+first.action,correction:fix.status+'/'+fix.action,question:fix.question?.kind??null,missing:fix.missingInputs,reason:String(fix.reason??'').slice(0,240)};});
// N9: the clinical route comes before the unreported-training question, whatever the decision kind; nothing is proposed.
guard('N9_clinicalFirst',()=>{const t={p:H.program(PROGRAMS.R10K),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);const w=6,day=H.addDays(t.p.weeks[w].startDate,6);
 const X=t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const cases={weeklyPain:{eligibility:{...H.elig(day),pain:true}},weeklyIllness:{eligibility:{...H.elig(day),illness:true}},scheduleWithPain:{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},eligibility:{...H.elig(t.p.weeks[w].startDate),pain:true}},returnIllness:{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:21,reasonCategory:'ILLNESS'}},substitutionPain:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}},eventDateWithInjury:{day:0,hour:'07:00:00',kind:'EVENT_DATE_CHANGE',changes:{eventDate:H.addDays('2026-11-02',10*7+6)},eligibility:{...H.elig(t.p.weeks[w].startDate),injury:true}}};
 const o={};for(const [k,x] of Object.entries(cases)){const r=decide(t,w,x);o[k]={status:r.status,proposal:!!r.proposal,question:r.question?.kind??null,pending:r.referenceState?.pending?.status??null};}
 o.allClinicalNoProposal=Object.values(o).every(x=>x.status==='CLINICAL_HUMAN_REQUIRED'&&!x.proposal&&x.question===null);return o;});
const verdicts={};for(const r of rows)verdicts[r.verdict]=(verdicts[r.verdict]??0)+1;
console.log(JSON.stringify({check:'R7C-P3-ADVERSARIAL-G01',runtime:'working tree (R7-C)',grid:{cases:rows.length,verdicts,violations,unnecessaryAsks:unnecessaryAsks.map(r=>r.label)},p1:{questions:p1.length,failed:p1.filter(x=>!x.ok).map(x=>x.label)},named,rows},null,1));
