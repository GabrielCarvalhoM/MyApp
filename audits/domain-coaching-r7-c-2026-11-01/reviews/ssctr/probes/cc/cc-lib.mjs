// SSCTR CC recheck (R7-C Phase 5, R7C-FREEZE-2): shared helpers for the probes in this folder. Read-only instrument; never gate evidence alone.
// Loads a CoachingCore runtime through the coordinator's phase3-lib (the working tree, or a commit extracted with git archive into a temporary
// directory outside the repository) and gives timeline helpers built like test/r7c-phase5-cc.test.mjs.
import {REPO,load,extract} from '../../../../probes/phase3-lib.mjs';
export {REPO,load,extract};
export const FREEZE_1='1890f66356455112907d757032a8b1cd2de29c00',R7B2='1a1c7286adc8b08d16f97dea86f4973fe33e5a95';
export const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
/** Runtimes by label: HEAD (working tree, R7C-FREEZE-2 bytes) and any extra commits. */
export async function runtimes(extra=[]){
 const out={HEAD:await load(REPO)},cleanups=[];
 for(const [label,rev] of extra){const x=extract(rev);cleanups.push(x.cleanup);out[label]=await load(x.root);}
 return {rt:out,cleanup:()=>cleanups.forEach(f=>f())};
}
export function kit(rt){
 const H=rt.H,POL=rt.opts.authority.policy.operational,ENTRY=POL.return.entryRunMinutes,C=POL.run.singleRunCeiling;
 const day=(p,b,d)=>H.addDays(p.weeks[b].startDate,d);
 const notDone=(p,s)=>({eventId:`cc-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
 const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
 const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
 const adverse={performance:'WORSE',recovery:'POOR',effort:'HARDER_THAN_TARGET',nextDayFunction:'NORMAL'};
 const factOf=(p,s,V,i)=>V==='MISS'?notDone(p,s):V==='ADVERSE'?H.obs(p,s,{response:adverse}):V==='MIXED'?(i%2?notDone(p,s):H.obs(p,s)):H.obs(p,s);
 const report=(p,from,to,V)=>runSessions(p,from,to).map((s,i)=>factOf(p,s,V,i));
 function step(t,w,x={}){
  const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);
  t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;
 }
 const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
 /** Weeks [0,g) executed and reviewed; [g,b-1) RV reviewed with strength only, NR neither; A's review at the end of week b-1 has the gap's run
  * reports, B's does not. Same construction as the Phase 5 tests. */
 function fork(o,{g,b,mode,V}){
  const t={p:H.program(o),ledger:[],ref:null};
  for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
  const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
  const facts=report(t.p,g,b,V),A=copy(t),B=copy(t);
  step(A,b-1,{observations:[...strength,...facts]});step(B,b-1,{observations:strength});
  return {A,B,facts};
 }
 const runsOf=(P,b,fromDay=0)=>{const cut=day(P,b,fromDay);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date>=cut).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
 /** Policy run.singleRunCeiling for week X on the factual record: the longest completed run in the windowDays before the week's start (ledger,
  * plus the intake-reported longest current run while in the window), plus stepMinutes; the reviewed entry when none is. Independent of the
  * engine's own reading (computed here from the ledger as the policy states it). Return demonstrations are not in the ledger. */
 function factualCeiling(t,X){
  const start=t.p.weeks[X].startDate,gap=d=>(Date.parse(start)-Date.parse(d))/864e5,inW=d=>gap(d)>0&&gap(d)<=C.windowDays,cap=t.p.capability?.run;
  const runs=t.ledger.filter(o=>o.context?.sport==='RUN'&&!o.conflicted&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)).map(o=>({d:o.localDate,m:Number.isFinite(o.actual?.minutes)?o.actual.minutes:o.context.runMinutes}));
  if(['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap?.class)&&Number.isFinite(cap?.longestMinutes))runs.push({d:t.p.canonical.asOf,m:cap.longestMinutes});
  const w=runs.filter(r=>inW(r.d)).map(r=>r.m);
  return w.length?Math.max(...w)+C.stepMinutes:ENTRY;
 }
 const overCeiling=(list,ceil)=>list.filter(x=>!/^RACE:/.test(x)&&Number(x.split(':')[1])>ceil);
 const intense=list=>list.filter(x=>/^(QUALITY|RACE_TOUCH)/.test(x));
 const mins=list=>list.filter(x=>!/^RACE:/.test(x)).map(x=>Number(x.split(':')[1]));
 const intenseRolesNotIn=(b,a)=>['QUALITY','RACE_TOUCH'].filter(r=>b.some(x=>x.startsWith(r+':'))&&!a.some(x=>x.startsWith(r+':')));
 /** B above the reference: a longer non-race run than the reference's longest, or more non-race run minutes in total. */
 const aboveRef=(b,a)=>{const mb=mins(b),ma=mins(a);return (mb.length?Math.max(...mb):0)>(ma.length?Math.max(...ma):0)||mb.reduce((x,y)=>x+y,0)>ma.reduce((x,y)=>x+y,0);};
 const brief=r=>({s:r.status,a:r.action??null,v:r.planValidity?.status??null,q:r.question?.kind??null,reason:String(r.reason??'').slice(0,140)});
 return {mins,intenseRolesNotIn,aboveRef,H,POL,ENTRY,C,day,notDone,strengthOf,runSessions,report,step,copy,fork,runsOf,factualCeiling,overCeiling,intense,brief};
}
export const GEN=H=>({id:'cc-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]});
export const R10K=H=>({id:'cc-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}});
