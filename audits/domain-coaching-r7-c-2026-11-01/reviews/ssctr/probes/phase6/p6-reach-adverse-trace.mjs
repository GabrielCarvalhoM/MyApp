// SSCTR Phase 6 recheck, probe P6-RA: trace of the reach's adverse long-run class (P6-R LONG_ADVERSE). GEN b=7 u=5 and P51 b=7 u=5: weeks 0-4
// executed and reviewed, weeks 5-6 reported on time with the long runs followed by an adverse response, no weekly review; the first decision of
// week 7 (plain, day 0). Prints the run doses of weeks 4-8 before and after it on R7C-FREEZE-3 (HEAD) and R7C-FREEZE-2 (F2), the reviewed path,
// and the historical run state at week 7. Read-only; prints JSON.
import {runtimes,kit,GEN} from '../cc/cc-lib.mjs';
const F2='a10cec04071be97e409f11a4f831f13eae0c9769';
const {rt,cleanup}=await runtimes([['F2',F2]]);
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const P51=H=>({id:'ssctr-p6-p51',weeks:16,goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[H.K('back-squat',3,5,80),H.K('db-bench-press',3,8,18,'PER_HAND'),{id:'db-split-squat',familiar:true}],schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
const runs=(K,P,from,to)=>Object.fromEntries(P.weeks.slice(from,to).map(w=>[w.index,w.sessions.filter(s=>K.H.live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`).join(' ')]));
const out={check:'SSCTR-P6-REACH-ADVERSE-TRACE',cases:{}};
for(const [name,mk] of [['GEN',GEN],['P51',P51]])for(const V of ['ASP','LONG_ADVERSE'])for(const [label,R] of Object.entries(rt))for(const path of ['DAILY','REVIEWED']){
 const K=kit(R),H=K.H,t={p:H.program(mk(H)),ledger:[],ref:null},u=5,b=7,res={};
 for(let w=0;w<u;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 let carry=[];const decisions=[];
 for(let w=u;w<b;w++){
  const ss=t.p.weeks[w].sessions.filter(H.live).map(s=>({s,f:H.obs(t.p,s,V==='LONG_ADVERSE'&&s.sport==='RUN'&&s.role==='LONG'?{response:BAD}:{})}));
  if(carry.length){const r=K.step(t,w,{day:0,hour:'06:00:00',observations:carry});decisions.push(`w${w}d0 ${r.status}/${r.action}`);carry=[];}
  for(const d of [0,1,2,3,4,5]){const f=ss.filter(x=>x.s.day===d).map(x=>x.f);if(f.length){const r=K.step(t,w,{day:d,hour:'21:00:00',observations:f});decisions.push(`w${w}d${d} ${r.status}/${r.action}`);}}
  const last=ss.filter(x=>x.s.day===6).map(x=>x.f);
  if(path==='REVIEWED'){const r=K.step(t,w,{day:6,hour:'21:00:00',observations:last});decisions.push(`w${w}d6 ${r.status}/${r.action} gates=${JSON.stringify(r.gates??null)}`);}else carry=last;
 }
 res.before=runs(K,t.p,4,9);
 const r=K.step(t,b,{day:0,hour:'06:00:00',observations:carry});
 res.first={status:r.status,action:r.action,validity:r.planValidity?.status,reason:String(r.reason??'').slice(0,220),gates:r.gates??null};
 res.after=runs(K,t.p,4,9);res.decisions=decisions;
 try{const hs=R.historicalStateOf(t.p,{asOf:`${t.p.weeks[b].startDate}T06:30:00Z`,actualLedger:t.ledger},R.opts);res.history=hs?.run??null;}catch(e){res.history='error '+e.message;}
 out.cases[`${name} ${V} ${label} ${path}`]=res;
}
cleanup();
console.log(JSON.stringify(out,null,1));
