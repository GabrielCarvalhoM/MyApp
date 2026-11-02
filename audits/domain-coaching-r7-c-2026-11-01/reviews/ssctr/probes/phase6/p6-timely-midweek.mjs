// SSCTR Phase 6 recheck, probe P6-T: does the recorded-answer re-plan reach the timely, weekly-reviewed path (stability, MEC)? Weeks [0,b) executed
// as prescribed and reviewed at day 6 21:00 (a KEEP chain leaves the following starts CONDITIONAL_PLAN). In week b the athlete has not yet
// reported this week's sessions (they will arrive with the week's review). A decision on day d (2..5) of week b, of kind PLAIN, SYSTEMIC_FATIGUE,
// SCHEDULE_CHANGE or EQUIPMENT_CHANGE, with nothing reported this week (NONE), or with only strength reported (STR). Then the week's review with
// every session as prescribed, and the first decision of week b+1. Compared on R7C-FREEZE-3 (HEAD) and R7C-FREEZE-2 (F2): status, action, the
// plan from the decision day through week b+1, and the plan in force after week b's review. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K} from '../cc/cc-lib.mjs';
const F2='a10cec04071be97e409f11a4f831f13eae0c9769';
const {rt,cleanup}=await runtimes([['F2',F2]]);
const plan=(K,P,b,d)=>{const day=K.day(P,b,d);return P.weeks.slice(b,b+2).flatMap(x=>x.sessions).filter(s=>K.H.live(s)&&s.date>=day).map(s=>s.sport==='RUN'?`${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}`:`${s.date.slice(5)} S:${s.prescription.exercises.filter(e=>e.load?.mode==='KNOWN').map(e=>e.id+'@'+e.load.value).join(',')}`);};
const out={check:'SSCTR-P6-TIMELY-MIDWEEK',cells:[],summary:{}};
const KINDS={PLAIN:()=>({}),FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),SCHED:(p,b)=>b===p.weeks.length-1?null:({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),EQUIP:p=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}})};
for(const [name,mk,bs] of [['GEN',GEN,[4,6,8,10]],['R10K',R10K,[6,8,9,10,11]]])for(const b of bs)for(const d of [2,3,5])for(const [kind,mkK] of Object.entries(KINDS))for(const rep of ['NONE','STR']){
 const cell={case:`${name} b=${b} d=${d} ${kind} ${rep}`};
 try{
  const res={};
  for(const [label,R] of Object.entries(rt)){
   const K=kit(R),H=K.H,t={p:H.program(mk(H)),ledger:[],ref:null};
   for(let w=0;w<b;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
   const x=mkK(t.p,b);if(!x){res.skip=true;break;}
   const obs=rep==='STR'?t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.day<d).map(s=>H.obs(t.p,s)):[];
   const stored=plan(K,t.p,b,d),r=K.step(t,b,{day:d,hour:'07:00:00',...x,observations:obs});
   const mid={status:r.status,action:r.action??null,validity:r.planValidity?.status??null,q:r.question?.kind??null,recorded:/whichever decision recorded them/.test(r.reason??''),plan:plan(K,t.p,b,d)};
   const rest=t.p.weeks[b].sessions.filter(s=>H.live(s)&&!(rep==='STR'&&s.sport==='STRENGTH'&&s.day<d)).map(s=>H.obs(t.p,s));
   const rv=b+1<t.p.weeks.length?K.step(t,b,{day:6,hour:'21:00:00',observations:rest}):null;
   const nx=b+1<t.p.weeks.length?K.step(t,b+1,{day:0,hour:'07:00:00'}):null;
   res[label]={stored,mid,review:rv?{status:rv.status,action:rv.action??null}:null,next:nx?{status:nx.status,action:nx.action??null,validity:nx.planValidity?.status??null}:null,after:b+1<t.p.weeks.length?plan(K,t.p,b+1,0):null};
  }
  if(res.skip)continue;
  Object.assign(cell,{head:res.HEAD,f2:res.F2,midDiffers:JSON.stringify(res.HEAD.mid)!==JSON.stringify(res.F2.mid),afterDiffers:JSON.stringify(res.HEAD.after)!==JSON.stringify(res.F2.after)||JSON.stringify(res.HEAD.next)!==JSON.stringify(res.F2.next)});
 }catch(e){cell.error=String(e?.stack??e).slice(0,300);}
 out.cells.push(cell);
}
const C=out.cells.filter(c=>c.head);
out.summary={cells:C.length,errors:out.cells.filter(c=>c.error).length,midDiffers:C.filter(c=>c.midDiffers).length,afterDiffers:C.filter(c=>c.afterDiffers).length,recordedFiresMid:C.filter(c=>c.head.mid.recorded).length,differing:C.filter(c=>c.midDiffers||c.afterDiffers).map(c=>c.case)};
cleanup();
console.log(JSON.stringify(out,null,1));
