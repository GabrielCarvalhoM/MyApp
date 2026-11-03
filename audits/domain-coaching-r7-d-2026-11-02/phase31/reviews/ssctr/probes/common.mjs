// SSCTR Phase 3.1 recheck probes: shared helpers. Synthetic development fixtures only (engineering evidence, never gate or quality evidence).
// Usage: node <probe>.mjs <root holding CoachingCore>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
export async function load(root){
 const h=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
 const a=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-adaptation.mjs')).href);
 const v=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
 return {...h,adaptation:a,hash:v.hash};
}
export function kit(L){
 const {opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram}=L;
 const GEN={id:'ssctr-p31',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
 const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
 const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
 const fresh=(o=GEN)=>({p:program(o),ledger:[],ref:null});
 const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
 const clear=t=>{t.ref=null;return t;};
 const weekFacts=(p,w,o={})=>p.weeks[w].sessions.filter(live).map(s=>obs(p,s,o));
 const trained=(weeks,o=GEN)=>{const t=fresh(o);for(const w of weeks)step(t,w,{observations:weekFacts(t.p,w)});return t;};
 const executedMax=(t,beforeDay)=>{const m=t.ledger.filter(x=>x.context?.sport==='RUN'&&x.actual?.completed&&(x.localDate??x.observedAt.slice(0,10))<beforeDay).map(x=>x.actual.minutes);return m.length?Math.max(...m):null;};
 const runsAhead=(p,w,fromDay)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=fromDay)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
 const strengthAhead=(p,w,fromDay)=>p.weeks.slice(w,w+1).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=fromDay)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}/rir${e.rir}`));
 const lastReturn=p=>p.decisions.filter(d=>d.action==='REESTABLISH').at(-1)??null;
 const brief=(r,t,w,dayOffset)=>{const from=addDays(t.p.weeks[w].startDate,dayOffset);const ret=r.action==='REESTABLISH'?lastReturn(t.p):null;return {status:r.status,action:r.action,validity:r.planValidity?.status,missing:r.missingInputs,question:r.question?.kind??null,reason:(r.reason??'').slice(0,160),...(ret?{cls:ret.interruption.class,days:ret.interruption.days,start:ret.interruption.startDate,end:ret.interruption.endDate,declaredBy:ret.interruption.declaredBy?.eventKind??null}:{}),runsAhead:runsAhead(t.p,w,from)};};
 const quality=list=>list.some(x=>QUALITY.some(q=>x.includes(':'+q+':')));
 const maxRun=list=>Math.max(0,...list.map(x=>Number(x.split(':').at(-1))));
 return {GEN,QUALITY,step,fresh,copy,clear,weekFacts,trained,executedMax,runsAhead,strengthAhead,lastReturn,brief,quality,maxRun,...L};
}
