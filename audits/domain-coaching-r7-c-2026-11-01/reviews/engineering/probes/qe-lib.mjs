// Engineering judge probe library (R7-C Phase 5, R7C-FREEZE-1). Read-only: imports the frozen runtime and the R7-B synthetic fixtures; writes nothing.
// Timelines mirror test/r7c-phase5.test.mjs (A = facts on time at the review before the answer week; B = the review asks, the facts come later).
// QE_CC (optional) points at another CoachingCore root, e.g. a git archive of R7B2-FREEZE-1 (1a1c728), for the predecessor baseline.
import {pathToFileURL} from 'node:url';
const CC=process.env.QE_CC?pathToFileURL(process.env.QE_CC.endsWith('/')?process.env.QE_CC:process.env.QE_CC+'/').href:new URL('../../../../../CoachingCore/',import.meta.url).href;
export const RUNTIME_ROOT=CC;
const {hash}=await import(CC+'src/value.mjs');
const {opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram}=await import(CC+'r7/b/fixtures/helpers.mjs');
export {hash,opts,K,FULL,elig,program,review,obs,live,runs,addDays,evaluateProgram};
export const ENTRY=opts.authority.policy.operational.return.entryRunMinutes;
export const GEN={id:'qe-r7c',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
export const R10K={id:'qe-r7c-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
export const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
export const notDone=(p,s)=>({eventId:`qe-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
export const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>obs(p,s));
export const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
export const report=(p,from,to,V)=>runSessions(p,from,to).map(s=>V==='MISS'?notDone(p,s):obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{}));
export function step(t,w,x={}){
 const rv={...review(t.p,w,x),actualLedger:t.ledger,...(t.ref&&x.referenceState===undefined?{referenceState:t.ref}:{})};
 if(x.referenceState===null)delete rv.referenceState;
 const r=evaluateProgram(t.p,rv,opts);
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;
}
export const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
export function fork(o,{g,b,mode,V}){
 const t={p:program(o),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
 const facts=report(t.p,g,b,V),A=copy(t),B=copy(t);
 const a=step(A,b-1,{observations:[...strength,...facts]}),q=step(B,b-1,{observations:strength});
 return {A,B,a,q,facts};
}
export const AT=d=>({day:d,hour:'07:00:00'});
export const runsFrom=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
export const weekRuns=(P,b)=>P.weeks[b]?P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`):null;
export const fromDay=(P,b,d,n=1)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+n).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
// A run dose a known stop never plans (SSCTR-SD-R7C-r2: no run above the entry, no quality or race touch); the race itself is excluded.
export const stale=list=>list.some(x=>/^(QUALITY|RACE_TOUCH)/.test(x)||!/^RACE:/.test(x)&&Number(x.split(':')[1])>ENTRY);
/** The approved single-run ceiling for week w as a first planned week (policy run.singleRunCeiling): the longest completed run in the 30 days
 * before the week's start + 5 minutes, or the reviewed entry with none. Never applied to the race. */
export function ceilingAt(t,w){const start=t.p.weeks[w].startDate,from=addDays(start,-30);const m=t.ledger.filter(o=>!o.conflicted&&o.context?.sport==='RUN'&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)&&o.localDate>=from&&o.localDate<start).map(o=>Number(o.actual?.minutes)||0);return m.length?Math.max(...m)+5:ENTRY;}
export const aboveCeiling=(list,c)=>list.some(x=>!/^RACE:/.test(x)&&Number(x.split(':')[1])>c);
export const brief=r=>({status:r.status,action:r.action,validity:r.planValidity?.status,question:r.question?.kind??null,pending:r.referenceState?.pending?{status:r.referenceState.pending.status,eventKind:r.referenceState.pending.eventKind,signal:r.referenceState.pending.signal?.kind??null}:null,reason:(r.reason??'').slice(0,240)});
