// SSCTR Phase 3.3 recheck probes: shared helpers (pattern of phase32/reviews/ssctr/probes/common.mjs and phase33/probes/f01-witness.mjs).
// Synthetic development fixtures (CoachingCore/r7/b/fixtures/helpers.mjs): engineering evidence only, never gate, quality or generalization
// evidence. Run on a scratch root holding CoachingCore, never on the repository. Read-only: nothing here writes a file.
// Usage: node <probe>.mjs <root holding CoachingCore> [--label <name>]
// The fixture plans strength Mon (day 0) and Fri (4), runs Tue (1) and Thu (3), the long run Sun (6); Wed (2) and Sat (5) are rest days.
// Day n below counts from Mon of week 2 (day 0); week k starts on day 7*(k-2).
import {pathToFileURL} from 'node:url';
import path from 'node:path';
export async function setup(){
 const root=path.resolve(process.argv[2]??'.'),label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:root;
 const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
 const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram,elig}=L;
 const GEN={id:'ssctr-p33',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
 const QUALITY=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'];
 const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
 const fresh=()=>({p:program(GEN),ledger:[],ref:null}),copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
 const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
 const weekObs=(p,w,f=(q,s)=>obs(q,s))=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
 const trained=weeks=>{const t=fresh();for(const w of weeks)step(t,w,{observations:weekObs(t.p,w)});return t;};
 const base0=trained([0,1]);
 const base=()=>copy(base0),s2=base0.p.weeks[2].startDate,day=n=>addDays(s2,n);
 const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
 const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
 const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
 /** Live sessions planned on days [from, to] (inclusive), any week. */
 const sessionsIn=(p,from,to)=>p.weeks.flatMap(x=>x.sessions).filter(s=>live(s)&&s.date>=day(from)&&s.date<=day(to));
 const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`);
 const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
 /** A compact view of a decision: status, question, the return it applied and the doses ahead from day `d` of week `w`. */
 function view(r,t,w,d){
  const ret=r.action==='REESTABLISH'?returns(t.p).at(-1).interruption:null,from=addDays(t.p.weeks[w].startDate,d),ahead=runsAhead(t.p,w,from);
  return {status:r.status,action:r.action,validity:r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status,question:r.question?.kind??null,
   ...(r.question?.unreported?{unreported:r.question.unreported.sessionIds.length}:{}),reason:(r.reason??'').slice(0,240),
   ...(ret?{ret:`${ret.class} ${ret.days}d ${ret.startDate}..${ret.endDate}`,runMode:ret.entry?.run?.mode??null,separateBreaks:ret.separateBreaks?.map(b=>`${b.episode} ${b.startDate}..${b.endDate} ${b.stop}${b.reentryWeek?' reentry '+b.reentryWeek:''}`)??null}:{}),
   runsAhead:ahead.join(' '),qualityAhead:ahead.some(x=>QUALITY.some(q=>x.startsWith(q+':'))),maxRunAhead:Math.max(0,...ahead.map(x=>Number(x.split(':').at(-1)))),
   strengthAhead:strengthAhead(t.p,w,from).slice(0,3).join(' '),returnsApplied:returns(t.p).length};
 }
 /** The comparator: one break from day `from` to day `to` declared once by a return report on day `d` of week `w`. */
 function once(from,to,w,d){const t=base(),r=step(t,w,{day:d,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(from,to,{reason:'Holiday then work trip'})});return {t,r};}
 /** A strength report without reps in reserve logged (every set's rir removed): an execution the gate cannot read as a met target. */
 const noRir=(p,s)=>{const o=obs(p,s);if(o.actual.exercises)o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(({rir,...x})=>x)}));return o;};
 const out={runtime:label,cases:{}};
 return {L,opts,obs,live,addDays,elig,evaluateProgram,GEN,step,fresh,copy,notDone,weekObs,base,day,brk,trip,returns,sessionsIn,runsAhead,view,once,noRir,out};
}
