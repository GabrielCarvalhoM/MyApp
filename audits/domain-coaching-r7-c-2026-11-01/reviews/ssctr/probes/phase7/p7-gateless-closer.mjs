// SSCTR Phase 7 addendum, probe P7-GC (QE-R7C-15): on R7C-FREEZE-4, a week of the unknown window closed at day 6 21:00 not by its weekly review
// but by a nonclinical exercise substitution (SUB) or a schedule change (SCH), decisions that record no gates; the other gap weeks reviewed with
// strength only; the review closing week b-1 asks. The answer (EXEC, ADVERSE: every gap run adverse, SHORT60) is recorded on day 2 of week b by a
// clinical substitution with pain, cleared (no clinical reference state); next a plain decision on day 3. With the record as the runtime returns it
// (CLOCK) and with every first-recorded clock removed before day 3 (NOCLOCK, a record written before R7C-FREEZE-4 or a clock lost). Reference: the
// same answer by a plain review on day 2, then day 3. GEN b=7 and R10K taper b=10, gap from week 0 or 2. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,VALID} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([]);
const K=kit(rt.HEAD),H=K.H;
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const strip=l=>l.map(o=>{if(!o.provenance?.firstRecordedAt)return o;const {firstRecordedAt,...p}=o.provenance;return {...o,provenance:p};});
const runs=(P,b)=>P.weeks.slice(b,b+2).flatMap(w=>w.sessions).filter(s=>s.sport==='RUN'&&H.live(s)&&s.date>=K.day(P,b,3)).map(s=>`${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}`).join(' ');
const out={check:'SSCTR-P7-GATELESS-CLOSER',cells:[],summary:{CLOCK:{cells:0,notD:0},NOCLOCK:{cells:0,notD:0,staleValid:0}}};
for(const [name,o,b] of [['GEN',GEN,7],['R10K taper',R10K,10]])for(const g of [0,2])for(const closer of ['SUB','SCH']){
 const c=b-4,t={p:H.program(o(H)),ledger:[],ref:null};
 for(let w=0;w<g;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 let closed=null;
 for(let w=g;w<b-1;w++){
  const x={observations:K.strengthOf(t.p,w)};
  if(w!==c){K.step(t,w,x);continue;}
  if(closer==='SUB'){const X=t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];closed=K.step(t,w,{...x,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:false}});}
  else closed=K.step(t,w,{...x,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[2,5]}});
 }
 const q=K.step(t,b-1,{observations:K.strengthOf(t.p,b-1)});
 const a=t.p.weeks[c+1].startAuthority?.RUN,by=t.p.decisions.find(d=>d.eventId===a?.eventId);
 for(const V of ['EXEC','ADVERSE','SHORT60']){
  const facts=K.runSessions(t.p,g,b).map(s=>V==='SHORT60'?H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.6))}):H.obs(t.p,s,V==='ADVERSE'?{response:BAD}:{}));
  const stale=runs(t.p,b);
  const D=K.copy(t);K.step(D,b,{day:2,hour:'07:00:00',observations:facts});const rd=K.step(D,b,{day:3,hour:'07:00:00'}),sD=runs(rd.proposal??D.p,b);
  const X=t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  for(const mode of ['CLOCK','NOCLOCK']){
   const B=K.copy(t),r0=K.step(B,b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});B.ref=null;
   if(mode==='NOCLOCK')B.ledger=strip(B.ledger);
   const r=K.step(B,b,{day:3,hour:'07:00:00'}),sB=runs(r.proposal??B.p,b),valid=r.planValidity?.status===VALID,notD=sB!==sD;
   out.summary[mode].cells++;if(notD)out.summary[mode].notD++;if(mode==='NOCLOCK'&&valid&&notD&&sB===stale)out.summary[mode].staleValid++;
   out.cells.push({cell:`${name} g=${g} close w${c} by ${closer} ${V} ${mode}`,question:q.question?.kind??null,closing:{start:a?.provenance??null,action:by?.action??null,gates:by?.gates??null},carrier:r0.status,decision:{s:r.status,a:r.action,v:r.planValidity?.status??null},B:sB,D:sD,stale,notD});
  }
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
