// R7-D Phase 3.2: the SSCTR-P31-F02 witness (phase31/reviews/ssctr/probes/p4-newer-replaces.mjs, p4b-correction-ends-kept.mjs), run on a
// runtime root. Weeks 0-1 executed. Break A covers weeks 2-3 (14 days, holiday), break B week 4 (7 days, work trip, contiguous with A).
//   W1  A declared with a fatigue report (asked, kept), B with a local-fatigue report (asked), then a plain weekly review.
//   W2  A declared with a fatigue report, then a weekly review that states B itself.
//   W3  comparator: the whole 21-day stop declared once by a return report.
//   W4  p4b: A applied by a return report; weeks 4-5 executed; break C (week 6) kept; a return report corrects A (episodeId); a plain review.
// RED (the defect): W1 or W2 re-enters from B alone (SHORT, 7 days) with the older break gone from the decision, or W4 loses C.
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only.
//   node f02-witness.mjs <root holding CoachingCore> [--label <name>]
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(process.argv[2]??'.'),label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:root;
const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=L;
const GEN={id:'p32-f02',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const trained=weeks=>{const t={p:program(GEN),ledger:[],ref:null};for(const w of weeks)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});return t;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const A={startDate:s2,endDate:addDays(s2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const B={startDate:addDays(s2,14),endDate:addDays(s2,20),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
const AB={startDate:s2,endDate:addDays(s2,20),days:21,reasonCategory:'VACATION',reason:'Holiday then work trip',nonclinical:true};
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`);
const lastReturn=p=>p.decisions.filter(d=>d.action==='REESTABLISH').at(-1)??null;
function view(r,t,w,day){
 const ret=r.action==='REESTABLISH'?lastReturn(t.p).interruption:null,ahead=runsAhead(t.p,w,addDays(t.p.weeks[w].startDate,day));
 return {status:r.status,action:r.action,validity:r.planValidity?.status,missing:r.missingInputs,question:r.question?.kind??null,
  ...(ret?{returnClass:ret.class,returnDays:ret.days,returnStart:ret.startDate,returnEnd:ret.endDate,separateBreaks:ret.separateBreaks??null}:{}),
  runsAhead:ahead,qualityAhead:ahead.some(x=>QUALITY.some(q=>x.startsWith(q+':'))),declaredRows:t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length};
}
const out={probe:'R7D-P32-F02-WITNESS',runtime:label,cases:{}};
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A});step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:B});const r=step(t,5,{day:1,hour:'07:00:00'});out.cases.W1=view(r,t,5,1);}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A});const r=step(t,5,{day:1,hour:'07:00:00',interruption:B});out.cases.W2=view(r,t,5,1);}
{const t=copy(base);const r=step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:AB});out.cases.W3=view(r,t,5,1);}
{const t=trained([0,1]);step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A,event:{id:'p32-w4-A',kind:'RETURN_AFTER_PAUSE'}});
 for(const w of [4,5])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 const s6=t.p.weeks[6].startDate,C={startDate:s6,endDate:addDays(s6,6),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:C,event:{id:'p32-w4-C',kind:'SYSTEMIC_FATIGUE'}});
 const corr=step(t,7,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,endDate:addDays(s2,12),days:13,episodeId:'p32-w4-A'}});
 const r=step(t,7,{day:2,hour:'07:00:00'});
 const returns=t.p.decisions.filter(d=>d.action==='REESTABLISH').map(d=>`${d.interruption.episode} ${d.interruption.startDate}..${d.interruption.endDate}`);
 out.cases.W4={correction:{status:corr.status,action:corr.action},plainAfter:{status:r.status,action:r.action,validity:r.planValidity?.status},returns,keptBreakApplied:returns.some(x=>x.startsWith('p32-w4-C '))};}
// The verdict: the older break disappears from the decision (W1/W2 resolve to B alone; W4 never applies C).
const dropped=c=>c.action==='REESTABLISH'&&c.returnStart===B.startDate&&c.returnDays===7;
out.verdict={W1_olderBreakDropped:dropped(out.cases.W1),W2_olderBreakDropped:dropped(out.cases.W2),W4_keptBreakLost:!out.cases.W4.keptBreakApplied,comparatorClass:out.cases.W3.returnClass};
out.verdict.RED=out.verdict.W1_olderBreakDropped||out.verdict.W2_olderBreakDropped||out.verdict.W4_keptBreakLost;
console.log(JSON.stringify(out,null,1));
