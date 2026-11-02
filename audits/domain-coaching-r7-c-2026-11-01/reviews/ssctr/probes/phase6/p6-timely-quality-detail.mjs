// SSCTR Phase 6 recheck, probe P6-TQ: the quality prescriptions behind P6-T's mid-week change on the timely path. GEN and R10K, weeks [0,b)
// executed as prescribed and reviewed weekly; week b's sessions not yet reported; a plain decision on day d of week b. Prints the quality
// sessions of weeks b-1..b+1 (family, work structure, minutes) stored, after the mid-week decision, and after week b's review (every session as
// prescribed), on R7C-FREEZE-3 (HEAD) and R7C-FREEZE-2 (F2); plus whether the decision re-planned and with what reason. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K} from '../cc/cc-lib.mjs';
const F2='a10cec04071be97e409f11a4f831f13eae0c9769';
const {rt,cleanup}=await runtimes([['F2',F2]]);
const q=(K,P,from,to)=>P.weeks.slice(from,to).flatMap(w=>w.sessions.filter(s=>K.H.live(s)&&s.sport==='RUN'&&['QUALITY','RACE_TOUCH'].includes(s.role)).map(s=>({week:w.index,date:s.date,role:s.role,family:s.prescription.family??null,minutes:s.prescription.durationMinutes,work:s.prescription.work??s.prescription.structure??s.prescription.intervals??null,step:s.prescription.step??s.prescription.ladderStep??null,keys:Object.keys(s.prescription)})));
const out={check:'SSCTR-P6-TIMELY-QUALITY-DETAIL',cases:{}};
for(const [name,mk,b,d] of [['GEN',GEN,8,5],['GEN',GEN,8,4],['GEN',GEN,6,5],['R10K',R10K,9,5],['R10K',R10K,8,5]])for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H,t={p:H.program(mk(H)),ledger:[],ref:null};
 for(let w=0;w<b;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 const stored=q(K,t.p,b-1,b+2),r=K.step(t,b,{day:d,hour:'07:00:00'}),mid=q(K,t.p,b-1,b+2);
 const rv=K.step(t,b,{day:6,hour:'21:00:00',observations:t.p.weeks[b].sessions.filter(H.live).map(s=>H.obs(t.p,s))}),after=q(K,t.p,b-1,b+2);
 out.cases[`${name} b=${b} d=${d} ${label}`]={decision:{status:r.status,action:r.action,validity:r.planValidity?.status,reason:String(r.reason??'').slice(0,260),horizons:r.horizons??null},stored,mid,review:{status:rv.status,action:rv.action,gates:rv.gates??null},after};
}
cleanup();
console.log(JSON.stringify(out,null,1));
