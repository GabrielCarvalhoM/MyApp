// SSCTR Phase 3.2 recheck probes: shared helpers (pattern of phase31/reviews/ssctr/probes/common.mjs). Synthetic development fixtures only
// (engineering evidence, never gate, quality or generalization evidence). Run on a scratch root holding CoachingCore, never on the repository.
// Usage: node <probe>.mjs <root holding CoachingCore>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
export async function load(root){
 const h=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
 return {...h};
}
export function kit(L){
 const {opts,K,FULL,elig,program,review,obs,live,addDays,evaluateProgram}=L;
 const GEN={id:'ssctr-p32',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
 const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
 const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
 const fresh=()=>({p:program(GEN),ledger:[],ref:null});
 const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
 const clear=t=>{t.ref=null;return t;};
 const weekFacts=(p,w,keep=()=>true)=>p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(p,s));
 const trained=weeks=>{const t=fresh();for(const w of weeks)step(t,w,{observations:weekFacts(t.p,w)});return t;};
 const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
 const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
 const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`);
 const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+1).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}/rir${e.rir}`));
 const quality=list=>list.some(x=>QUALITY.some(q=>x.startsWith(q+':')));
 const maxRun=list=>Math.max(0,...list.map(x=>Number(x.split(':').at(-1))));
 const executedRunMax=t=>{const m=t.ledger.filter(x=>x.context?.sport==='RUN'&&x.actual?.completed&&!x.conflicted).map(x=>x.actual.minutes);return m.length?Math.max(...m):null;};
 /** A compact view of a decision: status, question, the return it applied (class, days, stop, separate breaks) and the run doses ahead. */
 const view=(r,t,w,dayOffset)=>{
  const from=addDays(t.p.weeks[w].startDate,dayOffset),ret=r.action==='REESTABLISH'?returns(t.p).at(-1).interruption:null,ahead=runsAhead(t.p,w,from);
  return {status:r.status,action:r.action,validity:r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status,question:r.question?.kind??null,missing:r.missingInputs,
   ...(r.question?.unresolved?{unresolved:r.question.unresolved}:{}),...(r.question?.unreported?{unreported:r.question.unreported}:{}),
   reason:(r.reason??'').slice(0,200),
   ...(ret?{ret:`${ret.class} ${ret.days}d ${ret.startDate}..${ret.endDate}`,episode:ret.episode,separateBreaks:ret.separateBreaks?.map(b=>`${b.episode} ${b.startDate}..${b.endDate} ${b.stop}`)??null,notApplied:ret.notApplied?.map(n=>n.eventId)??null}:{}),
   runsAhead:ahead.join(' '),qualityAhead:quality(ahead),maxRunAhead:maxRun(ahead),declaredRows:t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length,returnsApplied:returns(t.p).length};
 };
 return {GEN,QUALITY,step,fresh,copy,clear,weekFacts,trained,notDone,returns,runsAhead,strengthAhead,quality,maxRun,executedRunMax,view,...L};
}
