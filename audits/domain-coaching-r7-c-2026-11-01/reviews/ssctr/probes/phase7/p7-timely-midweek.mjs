// SSCTR Phase 7 recheck, probe P7-T (item 5, C11): the Phase 6 timely mid-week grid (P6-T) on R7C-FREEZE-4 (HEAD) against R7C-FREEZE-3 (F3),
// extended with the on-time reporting styles Phase 7's per-report reading could touch. Weeks [0,b) reviewed at day 6 21:00 with every session
// reported, the runs as STYLE gives them: FULL (as prescribed), SHORT70 (every run at 70 % of its minutes, on time), ADV (long runs adverse, on
// time), LATE1 (as prescribed, but week b-1's long run reported only on day 1 of week b, after that week's review). In week b nothing of this
// week is reported (NONE) or only strength (STR). A decision on day d (2, 3, 5) of week b of kind PLAIN, SYSTEMIC_FATIGUE, SCHEDULE_CHANGE or
// EQUIPMENT_CHANGE; then the week's review with every session as prescribed, and the first decision of week b+1. Compared HEAD vs F3: the
// mid-week decision and the plan in force after the review. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,FREEZE_3} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([['F3',FREEZE_3]]);
const plan=(K,P,b,d)=>{const day=K.day(P,b,d);return P.weeks.slice(b,b+2).flatMap(x=>x.sessions).filter(s=>K.H.live(s)&&s.date>=day).map(s=>s.sport==='RUN'?`${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})`:''}`:`${s.date.slice(5)} S:${s.prescription.exercises.filter(e=>e.load?.mode==='KNOWN').map(e=>e.id+'@'+e.load.value).join(',')}`);};
const out={check:'SSCTR-P7-TIMELY-MIDWEEK',cells:[],summary:{}};
const KINDS={PLAIN:()=>({}),FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),SCHED:(p,b)=>b===p.weeks.length-1?null:({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),EQUIP:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}})};
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
for(const style of ['FULL','SHORT70','ADV','LATE1'])for(const [name,mk,bs] of [['GEN',GEN,[4,6,8,10]],['R10K',R10K,[6,8,9,10,11]]])for(const b of bs)for(const d of [2,3,5])for(const [kind,mkK] of Object.entries(KINDS))for(const rep of ['NONE','STR']){
 if(style!=='FULL'&&rep==='STR')continue;
 const cell={case:`${style} ${name} b=${b} d=${d} ${kind} ${rep}`};
 try{
  const res={};
  for(const [label,R] of Object.entries(rt)){
   const K=kit(R),H=K.H,t={p:H.program(mk(H)),ledger:[],ref:null};
   const run=(p,s)=>style==='SHORT70'?H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.7))}):style==='ADV'&&s.role==='LONG'?H.obs(p,s,{response:BAD}):H.obs(p,s);
   let late=[];
   for(let w=0;w<b;w++){
    const ss=t.p.weeks[w].sessions.filter(H.live),lateS=style==='LATE1'&&w===b-1?ss.find(s=>s.sport==='RUN'&&s.role==='LONG'):null;
    if(lateS)late=[run(t.p,lateS)];
    K.step(t,w,{observations:ss.filter(s=>s!==lateS).map(s=>s.sport==='RUN'?run(t.p,s):H.obs(t.p,s))});
   }
   const x=mkK(t.p,b);if(!x){res.skip=true;break;}
   if(late.length)K.step(t,b,{day:1,hour:'07:00:00',observations:late});
   const obs=rep==='STR'?t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.day<d).map(s=>H.obs(t.p,s)):[];
   const stored=plan(K,t.p,b,d),r=K.step(t,b,{day:d,hour:'07:00:00',...x,observations:obs});
   const mid={status:r.status,action:r.action??null,validity:r.planValidity?.status??null,q:r.question?.kind??null,recorded:/whichever decision recorded them/.test(r.reason??''),plan:plan(K,t.p,b,d)};
   const rest=t.p.weeks[b].sessions.filter(s=>H.live(s)&&!(rep==='STR'&&s.sport==='STRENGTH'&&s.day<d)).map(s=>H.obs(t.p,s));
   const rv=b+1<t.p.weeks.length?K.step(t,b,{day:6,hour:'21:00:00',observations:rest}):null;
   const nx=b+1<t.p.weeks.length?K.step(t,b+1,{day:0,hour:'07:00:00'}):null;
   res[label]={stored,mid,review:rv?{status:rv.status,action:rv.action??null}:null,next:nx?{status:nx.status,action:nx.action??null,validity:nx.planValidity?.status??null}:null,after:b+1<t.p.weeks.length?plan(K,t.p,b+1,0):null};
  }
  if(res.skip)continue;
  Object.assign(cell,{head:res.HEAD,f3:res.F3,midDiffers:JSON.stringify(res.HEAD.mid)!==JSON.stringify(res.F3.mid),afterDiffers:JSON.stringify(res.HEAD.after)!==JSON.stringify(res.F3.after)||JSON.stringify(res.HEAD.next)!==JSON.stringify(res.F3.next)});
 }catch(e){cell.error=String(e?.stack??e).slice(0,300);}
 out.cells.push(cell);
}
const C=out.cells.filter(c=>c.head);
const by=s=>{const X=C.filter(c=>c.case.startsWith(s+' '));return {cells:X.length,midDiffersVsF3:X.filter(c=>c.midDiffers).length,afterDiffersVsF3:X.filter(c=>c.afterDiffers).length,recordedFiresMidHEAD:X.filter(c=>c.head.mid.recorded).length,recordedFiresMidF3:X.filter(c=>c.f3.mid.recorded).length,midChangesStoredHEAD:X.filter(c=>JSON.stringify(c.head.mid.plan)!==JSON.stringify(c.head.stored)).length,notValidMidHEAD:X.filter(c=>c.head.mid.validity!=='VALID_WITHIN_CURRENT_BOUNDED_SCOPE').length};};
out.summary={cells:C.length,errors:out.cells.filter(c=>c.error).length,byStyle:Object.fromEntries(['FULL','SHORT70','ADV','LATE1'].map(s=>[s,by(s)])),differing:C.filter(c=>c.midDiffers||c.afterDiffers).map(c=>c.case)};
cleanup();
console.log(JSON.stringify(out,null,1));
