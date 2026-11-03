// R7-D Phase 3.2 engineering check: the CORRECTION_ACROSS_KEPT_BREAK path when the correction extends the applied break up to the kept one.
// A (weeks 2-3) applied by a return report on week 4 day 0; weeks 4-5 reported NOT done; C (week 6) kept with a fatigue report on week 7 day 0;
// on week 7 day 1 a return report corrects A (episodeId) to have lasted through week 5 (no training at all since week 1); then plain reviews.
// Compared with the same facts stated once (one return report, weeks 2-6 as one stop) and with C alone. Synthetic fixtures: engineering evidence.
//   node qe-p32-correction-across.mjs <root holding CoachingCore>
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(process.argv[2]??'.');
const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=L;
const GEN={id:'qe-p32-ca',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
const S2=t.p.weeks[2].startDate,s6=t.p.weeks[6].startDate;
const A={startDate:S2,endDate:addDays(S2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
const C={startDate:s6,endDate:addDays(s6,6),days:7,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
const v=(r,p)=>{const d=r.action==='REESTABLISH'?p.decisions.filter(x=>x.action==='REESTABLISH').at(-1).interruption:null;return {status:r.status,action:r.action,validity:r.planValidity?.status,q:r.question?.kind??null,missing:r.missingInputs,...(d?{ret:{episode:d.episode,start:d.startDate,end:d.endDate,days:d.days,class:d.class,notApplied:(d.notApplied??[]).map(x=>x.eventId)}}:{}),reason:String(r.reason).slice(0,220)};};
const copy=x=>({p:x.p,ledger:[...x.ledger],ref:x.ref});
const out={probe:'R7D-ENG-P32-CORRECTION-ACROSS',runtime:root,steps:{}};
out.steps.returnA=v(step(t,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A,event:{id:'qe-ca-A',kind:'RETURN_AFTER_PAUSE'}}),t.p);
for(const w of [4,5])out.steps['review'+w]=v(step(t,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date>=addDays(t.p.weeks[w].startDate,0)).map(s=>obs(t.p,s,{actual:{completed:false,minutes:0}}))}),t.p);
const pre=copy(t);
out.steps.keepC=v(step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:C,event:{id:'qe-ca-C',kind:'SYSTEMIC_FATIGUE'}}),t.p);
const Aext={...A,endDate:addDays(s6,-1),days:28,episodeId:'qe-ca-A'};
out.steps.correction=v(step(t,7,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:Aext,event:{id:'qe-ca-corr',kind:'RETURN_AFTER_PAUSE'}}),t.p);
out.steps.plain=v(step(t,7,{day:2,hour:'07:00:00'}),t.p);
out.steps.plainAfter=v(step(t,7,{day:3,hour:'07:00:00'}),t.p);
// Comparators on the record before C: the correction alone first (as if C had not been kept), then C; and C alone.
{const x=copy(pre);out.comparators={correctionFirst:v(step(x,7,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:Aext,event:{id:'qe-ca-corr2',kind:'RETURN_AFTER_PAUSE'}}),x.p)};
 out.comparators.thenC=v(step(x,7,{day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:C,event:{id:'qe-ca-C2',kind:'RETURN_AFTER_PAUSE'}}),x.p);}
{const y=copy(pre);out.comparators.cAlone=v(step(y,7,{day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:C,event:{id:'qe-ca-C3',kind:'RETURN_AFTER_PAUSE'}}),y.p);}
console.log(JSON.stringify(out,null,1));
