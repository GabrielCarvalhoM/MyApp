// Q5/Q8 (clinical first; F08 unchanged; the named-correction characterization). Weeks 0-1 executed. Run on both roots. The reference state
// is cleared after a clinical route (a qualified clearance), as the directed tests do. A = weeks 2-3 (14 days), B = week 4 (7 days).
//  C1 injury kept, newer nonclinical B unnamed            C2 the same, B named on its own (separate)
//  C3 injury kept, a named correction to a holiday (same dates)        C4 a named correction that keeps the injury (shorter dates)
//  C5 a named correction to VACATION whose free text still says pain   C6 nonclinical A kept, newer flu B unnamed; then B named-corrected to WORK
//  C7 three breaks: A holiday, B flu (named separate), C trip (named separate)
//  C8 the relation unresolved and eligibility not assessed: which question first
//  C9 injury kept, then a plain review with four weeks of training reported (the F08 no-plan state)
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,clear,trained,addDays,view,weekFacts,review,evaluateProgram,opts}=L;
const base=trained([0,1]),s2=base.p.weeks[2].startDate;
const brk=(from,to,x={})=>({startDate:addDays(s2,from),endDate:addDays(s2,to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const A=brk(0,13),B=brk(14,20,{reasonCategory:'WORK',reason:'Work trip'}),C=brk(21,24,{reasonCategory:'FAMILY',reason:'Family visit'});
const INJ={...A,reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false},FLU={...B,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false};
const out={root,cases:{}};
const injuryKept=()=>{const t=copy(base);const r=step(t,4,{day:0,hour:'07:00:00',interruption:INJ,event:{id:'c-INJ',kind:'WEEKLY_REVIEW'}});clear(t);return {t,first:r.status};};
{const {t,first}=injuryKept();const b=step(t,5,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:B,event:{id:'c-B',kind:'RETURN_AFTER_PAUSE'}});clear(t);out.cases.C1={first,newer:view(b,t,5,1),plain:view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2)};}
{const {t}=injuryKept();const b=step(t,5,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...B,episodeId:'c-B'},event:{id:'c-B',kind:'RETURN_AFTER_PAUSE'}});clear(t);out.cases.C2={newerNamed:view(b,t,5,1),plain:view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2)};}
{const {t}=injuryKept();out.cases.C3=view(step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,episodeId:'c-INJ'}}),t,5,2);}
{const {t}=injuryKept();out.cases.C4=view(step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...INJ,endDate:addDays(s2,9),days:10,episodeId:'c-INJ'}}),t,5,2);}
{const {t}=injuryKept();out.cases.C5=view(step(t,5,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A,reason:'Holiday, ankle still painful',episodeId:'c-INJ'}}),t,5,2);}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'c-A',kind:'SYSTEMIC_FATIGUE'}});
 const b=step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:FLU,event:{id:'c-FLU',kind:'LOCAL_FATIGUE'}});clear(t);
 const C6={newerFlu:b.status};C6.plain=view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2);clear(t);
 C6.namedCorrectionToWork=view(step(t,5,{day:2,hour:'07:00:00',interruption:{...B,episodeId:'c-FLU'},event:{id:'c-relabel',kind:'WEEKLY_REVIEW'}}),t,5,3);
 out.cases.C6=C6;}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'c-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...FLU,episodeId:'c-FLU'},event:{id:'c-FLU',kind:'LOCAL_FATIGUE'}});clear(t);
 step(t,6,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...C,episodeId:'c-C'},event:{id:'c-C',kind:'LOCAL_FATIGUE'}});clear(t);
 out.cases.C7=view(step(t,6,{day:1,hour:'07:00:00'}),t,6,2);}
{const t=copy(base);step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:'c-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:B,event:{id:'c-B',kind:'LOCAL_FATIGUE'}});
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'07:00:00'}),eligibility:undefined,actualLedger:t.ledger,referenceState:t.ref},opts);
 out.cases.C8={status:r.status,missing:r.missingInputs,question:r.question?.kind??null};}
{const {t}=injuryKept();const res=[];for(const w of [4,5,6,7]){const r=step(t,w,{observations:weekFacts(t.p,w)});res.push(`${w}:${r.status}`);clear(t);}out.cases.C9={weeklyReviewsWithTraining:res};}
console.log(JSON.stringify(out,null,1));
