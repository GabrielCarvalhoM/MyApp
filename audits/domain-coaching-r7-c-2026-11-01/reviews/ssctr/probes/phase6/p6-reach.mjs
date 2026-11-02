// SSCTR Phase 6 recheck (R7C-FREEZE-3), probe P6-R: the reach of the recorded-answer re-plan (item 7). Read-only; prints JSON.
// A plan resting on projection over its run window: weeks [0,u) executed as prescribed and reviewed weekly; weeks [u,b) reported day by day,
// on time, with no weekly review (the last day's sessions arrive with the first decision of week b, as the P51 history in
// test/r7c-phase6.test.mjs). What the athlete did in [u,b) varies (V). First decision of week b: PLAIN on day 0, SCHED (schedule change, not the
// program's last week) on day 0, FATIGUE (systemic fatigue) on day 0, and a plain decision on day 3 with week b's first sessions reported as
// prescribed (PLAIN3, after PLAIN).
// Comparators, from day 0 of week b (weeks b and b+1): STORED (the plan before the first decision), REVIEWED (the same reports, plus the weekly
// review of every week of [u,b) at day 6 21:00, then the same first decision, on the same runtime), and the DAILY path on R7C-FREEZE-2 (F2).
// Flags per cell: a run longer or a known load heavier than REVIEWED for the same slot (ABOVE_REVIEWED), an intense role (QUALITY, RACE_TOUCH)
// that REVIEWED lacks, and the same against STORED; a run above the factual single-run ceiling; VALID with a question pending.
// Usage: node p6-reach.mjs
import {runtimes,kit,GEN,R10K,VALID} from '../cc/cc-lib.mjs';
const F2='a10cec04071be97e409f11a4f831f13eae0c9769';
const {rt,cleanup}=await runtimes([['F2',F2]]);
const P51=H=>({id:'ssctr-p6-p51',weeks:16,goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[H.K('back-squat',3,5,80),H.K('db-bench-press',3,8,18,'PER_HAND'),{id:'db-split-squat',familiar:true}],schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
const CASES=[['P51 b=7 u=5',P51,5,7],['GEN b=7 u=5',GEN,5,7],['GEN b=7 u=3',GEN,3,7],['R10K b=9 u=7',R10K,7,9],['R10K taper b=10 u=8',R10K,8,10],['R10K race b=11 u=9',R10K,9,11]];
const VARIANTS=['ASP','STRENGTH_UNREP','RUN_SHORT70','RUN_LONG120','LONG_PLUS20','LIFT_PLUS5','LONG_ADVERSE','EASY_MISSED','QUALITY_MISSED','EASY_UNREP'];
const FIRST=['PLAIN','SCHED','FATIGUE'];
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
function factFor(K,p,s,V,wk){
 const H=K.H,pr=s.prescription,isRun=s.sport==='RUN',lastStrength=p.weeks[wk].sessions.filter(x=>H.live(x)&&x.sport==='STRENGTH').at(-1);
 if(V==='STRENGTH_UNREP'&&s===lastStrength)return null;
 if(V==='EASY_UNREP'&&isRun&&s.role==='EASY'&&s===p.weeks[wk].sessions.find(x=>H.live(x)&&x.sport==='RUN'&&x.role==='EASY'))return null;
 if(V==='EASY_MISSED'&&isRun&&s.role==='EASY'&&s===p.weeks[wk].sessions.find(x=>H.live(x)&&x.sport==='RUN'&&x.role==='EASY'))return K.notDone(p,s);
 if(V==='QUALITY_MISSED'&&isRun&&s.role==='QUALITY')return K.notDone(p,s);
 if(V==='RUN_SHORT70'&&isRun)return H.obs(p,s,{minutes:Math.round(pr.durationMinutes*0.7)});
 if(V==='RUN_LONG120'&&isRun)return H.obs(p,s,{minutes:Math.round(pr.durationMinutes*1.2)});
 if(V==='LONG_PLUS20'&&isRun&&s.role==='LONG')return H.obs(p,s,{minutes:pr.durationMinutes+20});
 if(V==='LONG_ADVERSE'&&isRun&&s.role==='LONG')return H.obs(p,s,{response:BAD});
 if(V==='LIFT_PLUS5'&&pr.modality==='STRENGTH'){const o=H.obs(p,s);for(const e of o.actual.exercises){const pe=pr.exercises.find(x=>x.id===e.id);if(pe?.load?.mode==='KNOWN')for(const set of e.sets)set.load={...set.load,value:set.load.value+(pe.load.convention==='PER_HAND'?2.5:5)};}return o;}
 return H.obs(p,s);
}
const key=s=>`${s.date}:${s.sport}:${s.turn??''}`;
function view(K,P,b){
 const H=K.H,day0=P.weeks[b].startDate,out={};
 for(const s of P.weeks.slice(b,b+2).flatMap(x=>x.sessions).filter(s=>H.live(s)&&s.date>=day0)){
  if(s.sport==='RUN')out[key(s)]={sport:'RUN',role:s.role,min:s.prescription.durationMinutes,h:K.H&&JSON.stringify(s.prescription).length};
  else if(s.sport==='STRENGTH')out[key(s)]={sport:'STRENGTH',loads:Object.fromEntries(s.prescription.exercises.filter(e=>e.load?.mode==='KNOWN').map(e=>[e.id,e.load.value])),sets:s.prescription.exercises.reduce((a,e)=>a+e.sets,0)};
 }
 return out;
}
const brief=v=>Object.entries(v).map(([k,x])=>x.sport==='RUN'?`${k.slice(5,10)} ${x.role}:${x.min}`:`${k.slice(5,10)} S:${Object.entries(x.loads).map(([i,l])=>i+'@'+l).join(',')}/${x.sets}`);
const INTENSE=r=>['QUALITY','RACE_TOUCH'].includes(r);
/** Slots where a is above ref: a longer run, a heavier known load, more strength sets, or an intense role ref lacks in that slot. */
function above(a,ref){
 const out=[];
 for(const [k,x] of Object.entries(a)){const y=ref[k];
  if(x.sport==='RUN'){if(!y){if(x.role!=='RACE')out.push(`${k} ${x.role}:${x.min} (none)`);continue;}
   if(x.min>y.min&&x.role!=='RACE')out.push(`${k} ${x.role}:${x.min}>${y.role}:${y.min}`);if(INTENSE(x.role)&&!INTENSE(y.role))out.push(`${k} intense ${x.role} vs ${y.role}`);}
  else{if(!y)continue;for(const [id,l] of Object.entries(x.loads))if(Number.isFinite(y.loads[id])&&l>y.loads[id])out.push(`${k} ${id}@${l}>${y.loads[id]}`);if(x.sets>y.sets)out.push(`${k} sets ${x.sets}>${y.sets}`);}
 }
 return out;
}
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const out={check:'SSCTR-P6-REACH',runtimes:Object.keys(rt),cases:[],summary:{}};
function history(R,o,u,b,V,reviewed){
 const K=kit(R),H=K.H,t={p:H.program(o),ledger:[],ref:null};
 for(let w=0;w<u;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 let carry=[];
 for(let w=u;w<b;w++){
  const sessions=t.p.weeks[w].sessions.filter(H.live).map(s=>({s,f:factFor(K,t.p,s,V,w)}));
  if(carry.length){K.step(t,w,{day:0,hour:'06:00:00',observations:carry});carry=[];}
  for(const d of [0,1,2,3,4,5]){const f=sessions.filter(x=>x.s.day===d&&x.f).map(x=>x.f);if(f.length&&!(d===0&&w>u&&false))K.step(t,w,{day:d,hour:'21:00:00',observations:f});}
  const last=sessions.filter(x=>x.s.day===6&&x.f).map(x=>x.f);
  if(reviewed)K.step(t,w,{day:6,hour:'21:00:00',observations:last});else carry=last;
 }
 return {K,t,carry};
}
function first(K,t,b,F,carry){
 const isLast=b===t.p.weeks.length-1;
 const x=F==='PLAIN'?{day:0,hour:'06:00:00'}:F==='SCHED'?(isLast?null:{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:t.p.canonical?.schedule?.strengthDays?.includes(3)?[0,4]:[0,3]}}):{day:0,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE'};
 if(!x)return null;
 return K.step(t,b,{...x,observations:carry});
}
for(const [name,mk,u,b] of CASES)for(const V of VARIANTS)for(const F of FIRST){
 const cell={case:name,V,F};
 try{
  const res={};
  for(const [label,R] of Object.entries(rt)){
   for(const path of label==='HEAD'?['DAILY','REVIEWED']:['DAILY']){
    const {K,t,carry}=history(R,mk(R.H),u,b,V,path==='REVIEWED');
    const stored=view(K,t.p,b),r=first(K,t,b,F,carry);
    if(!r){res.skip=true;break;}
    const v=view(K,t.p,b),ceil=K.factualCeiling(t,b);
    const r3=K.step(K.copy(t),b,{day:3,hour:'07:00:00',observations:t.p.weeks[b].sessions.filter(s=>K.H.live(s)&&s.day<3).map(s=>K.H.obs(t.p,s))});
    res[label+'.'+path]={status:r.status,action:r.action??null,validity:r.planValidity?.status??null,q:r.question?.kind??null,recorded:/whichever decision recorded them/.test(r.reason??''),ceilingReplan:/exceed what the recorded runs allow/.test(r.reason??''),stored,v,ceil,overCeil:Object.entries(v).filter(([k,x])=>x.sport==='RUN'&&x.role!=='RACE'&&x.min>ceil&&k.slice(0,10)<t.p.weeks[b+1]?.startDate).map(([k,x])=>`${k} ${x.role}:${x.min}>${ceil}`),p3:{status:r3.status,action:r3.action??null,validity:r3.planValidity?.status??null,recorded:/whichever decision recorded them/.test(r3.reason??'')}};
   }
   if(res.skip)break;
  }
  if(res.skip)continue;
  const D=res['HEAD.DAILY'],RV=res['HEAD.REVIEWED'],F2D=res['F2.DAILY'];
  Object.assign(cell,{
   head:{status:D.status,action:D.action,validity:D.validity,q:D.q,recorded:D.recorded,ceilingReplan:D.ceilingReplan,plan:brief(D.v)},
   reviewed:{status:RV.status,action:RV.action,validity:RV.validity,plan:brief(RV.v)},
   f2:{status:F2D.status,action:F2D.action,validity:F2D.validity,plan:brief(F2D.v)},
   stored:brief(D.stored),
   changedVsF2:!eq(D.v,F2D.v)||D.validity!==F2D.validity,
   eqReviewed:eq(D.v,RV.v),
   aboveReviewed:above(D.v,RV.v),
   aboveStored:above(D.v,D.stored),
   f2AboveReviewed:above(F2D.v,RV.v),
   overCeiling:D.overCeil,
   validWithQuestion:D.validity===VALID&&!!D.q,
   day3:{head:D.p3,f2:F2D.p3}
  });
  cell.newAbove=cell.aboveReviewed.length>0&&cell.aboveStored.length>0;
 }catch(e){cell.error=String(e?.stack??e).slice(0,400);}
 out.cases.push(cell);
}
const C=out.cases.filter(c=>!c.error&&c.head);
out.summary={cells:C.length,errors:out.cases.filter(c=>c.error).length,changedVsF2:C.filter(c=>c.changedVsF2).length,recordedFires:C.filter(c=>c.head.recorded).length,
 eqReviewed:C.filter(c=>c.eqReviewed).length,changedAndEqReviewed:C.filter(c=>c.changedVsF2&&c.eqReviewed).length,
 aboveReviewed:C.filter(c=>c.aboveReviewed.length).length,aboveStored:C.filter(c=>c.aboveStored.length).length,newAbove:C.filter(c=>c.newAbove).length,
 f2AboveReviewed:C.filter(c=>c.f2AboveReviewed.length).length,overCeiling:C.filter(c=>c.overCeiling.length).length,validWithQuestion:C.filter(c=>c.validWithQuestion).length,
 byVariant:Object.fromEntries(VARIANTS.map(V=>{const x=C.filter(c=>c.V===V);return [V,{cells:x.length,changedVsF2:x.filter(c=>c.changedVsF2).length,eqReviewed:x.filter(c=>c.eqReviewed).length,aboveReviewed:x.filter(c=>c.aboveReviewed.length).length,aboveStored:x.filter(c=>c.aboveStored.length).length,newAbove:x.filter(c=>c.newAbove).length}];}))};
cleanup();
console.log(JSON.stringify(out,null,1));
