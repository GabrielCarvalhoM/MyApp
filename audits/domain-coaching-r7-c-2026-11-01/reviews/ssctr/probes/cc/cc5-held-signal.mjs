// SSCTR CC recheck, probe CC5 (item 5: SSCTR-SD5-02 / C8 after QE-R7C-03). A reactive signal held by the open UNREPORTED_TRAINING question on
// day 0 of week 7 (SYSTEMIC_FATIGUE, LOCAL_FATIGUE, UNDERPERFORMANCE of a week-6 strength session); on day 1 a change of another kind kept beside
// the open question (or none); on day 2 the answer (MISS or EXEC) delivered as a plain review, as the signal's own kind re-submitted, or inside a
// non-review kind. A: the same signal, change and second event with the facts known at week 6's review. Per cell: whether the signal still
// travels after the kept change, whether the answer re-evaluates it (reason), the plan in force from day 2 against A, validity, and pending.
// Plus the week guard: a signal held at day 6 22:00 of week 7 (after a kept change) and the answer on day 0 of week 8.
// Read-only; prints JSON. Usage: node cc5-held-signal.mjs [--base]
import {runtimes,kit,GEN,VALID,FREEZE_1} from './cc-lib.mjs';
const withBase=process.argv.includes('--base');
const {rt,cleanup}=await runtimes(withBase?[['F1',FREEZE_1]]:[]);
const out={check:'SSCTR-CC5-HELD-SIGNAL',runtimes:Object.keys(rt),grid:{}};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H,res={cells:0,travelsAfterKept:0,keptCells:0,reEvaluated:0,sameAsA:0,dropped:[],notSame:[],guard:[],byRoute:{}};
 const lastStrength=p=>p.weeks[6].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').at(-1);
 const SIGNALS={SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),UNDERPERFORMANCE:p=>({kind:'UNDERPERFORMANCE',targetSessionId:lastStrength(p).id})};
 const CHANGES={NONE:()=>null,UNAVAILABLE_STRENGTH_DAY:(p)=>{const s=p.weeks[7].sessions.find(x=>H.live(x)&&x.sport==='STRENGTH'&&x.date>K.day(p,7,3));return s?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[s.date]}}:null;},EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),DOUBLE_CONFLICT:()=>({kind:'DOUBLE_CONFLICT',changes:{strengthTurn:'AM'}})};
 const ANSWERS={PLAIN:()=>({}),OWN_KIND:(p,sig)=>sig,SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}})};
 const fromDay=(P,b,d)=>{const day=K.day(P,b,d);return P.weeks[b].sessions.filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${R.hash(s.prescription??null)}`);};
 for(const V of ['MISS','EXEC'])for(const mode of ['RV','NR']){
  const f=K.fork(GEN(H),{g:0,b:7,mode,V});
  for(const [sk,sm] of Object.entries(SIGNALS))for(const [ck,cm] of Object.entries(CHANGES))for(const [ak,am] of Object.entries(ANSWERS)){
   const sig=sm(f.B.p),ch=cm(f.B.p),ans=am(f.B.p,sig);if(ck!=='NONE'&&!ch)continue;
   const B=K.copy(f.B),A=K.copy(f.A),key=`${V} ${mode} ${sk} kept ${ck} answer ${ak}`;
   const held=K.step(B,7,{day:0,hour:'07:00:00',...sig});K.step(A,7,{day:0,hour:'07:00:00',...sig});
   if(held.status!=='ASK'||held.referenceState?.pending?.signal?.kind!==sig.kind){res.dropped.push({key,stage:'hold',held:K.brief(held)});continue;}
   let kept=null;
   if(ch){kept=K.step(B,7,{day:1,hour:'07:00:00',...ch});K.step(A,7,{day:1,hour:'07:00:00',...ch});res.keptCells++;if(kept.referenceState?.pending?.signal?.kind===sig.kind)res.travelsAfterKept++;}
   const rb=K.step(B,7,{day:2,hour:'07:00:00',...ans,observations:f.facts}),ra=K.step(A,7,{day:2,hour:'07:00:00',...ans});
   const re=/re-evaluated with the answer/.test(rb.reason??''),same=JSON.stringify(fromDay(B.p,7,2))===JSON.stringify(fromDay(A.p,7,2));
   res.cells++;if(re)res.reEvaluated++;if(same)res.sameAsA++;
   const route=`kept ${ck==='NONE'?'none':'change'} / answer ${ak}`,br=res.byRoute[route]??={cells:0,reEvaluated:0,sameAsA:0,validNotSame:0};br.cells++;if(re)br.reEvaluated++;if(same)br.sameAsA++;
   if(!same&&rb.planValidity?.status===VALID){br.validNotSame++;res.notSame.push({key,kept:kept?K.brief(kept):null,keptSignal:kept?.referenceState?.pending?.signal?.kind??null,B:K.brief(rb),A:K.brief(ra),runsB:K.runsOf(B.p,7,2),runsA:K.runsOf(A.p,7,2),pendingAfter:rb.referenceState?.pending?.status??null});}
  }
  // Week guard: held at the end of week 7, a kept change, then the answer on day 0 of week 8.
  for(const [ck,cm] of Object.entries({NONE:()=>null,EQUIPMENT_CHANGE:CHANGES.EQUIPMENT_CHANGE})){
   const B=K.copy(f.B),h=K.step(B,7,{day:6,hour:'20:00:00',kind:'SYSTEMIC_FATIGUE'});const ch=cm(B.p);if(ch)K.step(B,7,{day:6,hour:'22:00:00',...ch});
   const r=K.step(B,8,{day:0,hour:'07:00:00',observations:[...f.facts,...K.runSessions(B.p,7,8).map(s=>K.notDone(B.p,s))]});
   res.guard.push({key:`${V} ${mode} guard kept ${ck}`,held:K.brief(h),answer:K.brief(r),replayed:/re-evaluated with the answer/.test(r.reason??''),pending:r.referenceState?.pending?.status??null});
  }
 }
 out.grid[label]={cells:res.cells,keptCells:res.keptCells,travelsAfterKept:res.travelsAfterKept,reEvaluated:res.reEvaluated,sameAsA:res.sameAsA,byRoute:res.byRoute,guardReplayed:res.guard.filter(z=>z.replayed).length,guard:res.guard.length,dropped:res.dropped.length};
 out[label]={notSame:res.notSame.slice(0,60),guard:res.guard,dropped:res.dropped.slice(0,10)};
}
cleanup();
console.log(JSON.stringify(out,null,1));
