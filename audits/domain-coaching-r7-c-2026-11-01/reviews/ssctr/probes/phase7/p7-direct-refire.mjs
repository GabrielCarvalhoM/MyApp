// SSCTR Phase 7 recheck, probe P7-DR (C9 under QE-R7C-12): after an answer delivered directly early in the answer week, later decisions of the week
// re-plan the following week again (more elapsed run sessions with no report are uncredited). How far can the following week's VALID plan sit above
// the plan the week's own review then makes, on R7C-FREEZE-4 (HEAD) and R7C-FREEZE-3 (F3)? GEN b=7, R10K b=8 (build), b=10 (taper; the following
// week is race week); gap from week 0 or 2; RV. Answers: MISS (known stop), SHORT60 (every gap run at 60 %), EXEC. The answer by a plain review on
// day 1 or 2 at 07:00; plain decisions on days 3, 4, 5 at 07:00 (nothing reported); the week's review on day 6 21:00 with every run session of the
// week reported as prescribed by the plan in force (or not reported: NOREP), then the first decision of week b+1. Flags: a mid-week VALID plan of
// week b+1 with a run longer than the post-review plan's in the same slot, more quality work, or an intense role the post-review plan lacks
// (aboveReview), or above the single-run ceiling of week b+1 on the record at the review (overCeiling). Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,VALID,FREEZE_3} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([['F3',FREEZE_3]]);
const out={check:'SSCTR-P7-DIRECT-REFIRE',cells:0,byRuntime:{},flagged:{HEAD:[],F3:[]},errors:[]};
const INT=r=>['QUALITY','RACE_TOUCH'].includes(r);
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H,bk=out.byRuntime[label]={cells:0,recordedReplansMid:0,validMid:0,aboveReview:0,overCeiling:0};
 const slots=(P,b)=>Object.fromEntries(P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)).map(s=>[s.date,{role:s.role,min:s.prescription.durationMinutes,work:s.prescription.work?(s.prescription.work.repetitions??1)*(s.prescription.work.workMinutes??0):0}]));
 const fmt=o=>Object.values(o).map(x=>`${x.role}:${x.min}${x.work?`(w${x.work})`:''}`).join('/');
 const above=(a,ref)=>Object.entries(a).filter(([d,x])=>x.role!=='RACE'&&(ref[d]?(x.role===ref[d].role&&x.min>ref[d].min||INT(x.role)&&!INT(ref[d].role)||x.role==='QUALITY'&&ref[d].role==='QUALITY'&&x.work>ref[d].work):INT(x.role))).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}`);
 for(const [name,o,b] of [['GEN',GEN,7],['R10K build',R10K,8],['R10K taper',R10K,10]])for(const g of [0,2])for(const V of ['MISS','SHORT60','EXEC'])for(const ad of [1,2])for(const rep of ['REP','NOREP']){
  try{
   const t={p:H.program(o(H)),ledger:[],ref:null};
   for(let w=0;w<g;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
   for(let w=g;w<b;w++)K.step(t,w,{observations:K.strengthOf(t.p,w)});
   const facts=K.runSessions(t.p,g,b).map(s=>V==='MISS'?K.notDone(t.p,s):V==='SHORT60'?H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.6))}):H.obs(t.p,s));
   K.step(t,b,{day:ad,hour:'07:00:00',observations:facts});
   const mids=[];
   for(const d of [3,4,5]){const r=K.step(t,b,{day:d,hour:'07:00:00'});mids.push({d,valid:r.planValidity?.status===VALID,recorded:/whichever decision recorded them/.test(r.reason??''),next:slots(r.proposal??t.p,b+1),action:r.action});}
   const runsB=t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='RUN');
   K.step(t,b,{observations:rep==='REP'?t.p.weeks[b].sessions.filter(H.live).map(s=>H.obs(t.p,s)):K.strengthOf(t.p,b)});
   const ceil=K.factualCeiling(t,b+1);
   const rn=K.step(t,b+1,{day:0,hour:'07:00:00'}),post=slots(rn.proposal??t.p,b+1);
   bk.cells++;if(label==='HEAD')out.cells++;
   for(const m of mids){
    if(m.recorded)bk.recordedReplansMid++;if(!m.valid)continue;bk.validMid++;
    const a=above(m.next,post),oc=Object.values(m.next).filter(x=>x.role!=='RACE'&&x.min>ceil).map(x=>`${x.role}:${x.min}>${ceil}`);
    if(a.length)bk.aboveReview++;if(oc.length)bk.overCeiling++;
    if(a.length||oc.length)out.flagged[label].push({key:`${name} b=${b} g=${g} ${V} answer d${ad} ${rep}`,day:m.d,recorded:m.recorded,midNext:fmt(m.next),postReview:fmt(post),ceilingAtReview:ceil,firstDecisionNextWeek:{action:rn.action,validity:rn.planValidity?.status??null,q:rn.question?.kind??null},above:a,overCeiling:oc});
   }
  }catch(e){out.errors.push(`${label} ${name} b=${b} g=${g} ${V} d${ad} ${rep}: ${e.message}`);}
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
