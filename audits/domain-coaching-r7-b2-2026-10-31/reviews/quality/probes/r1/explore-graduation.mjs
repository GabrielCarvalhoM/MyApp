// R7B2-QUALITY-r1 exploratory probe: programs that graduate to run quality (B0-C01) and keep the graduation through a short nonclinical return,
// so a later correction of a qualifying week makes graduationWithdrawal propose (the second source of a factual proposal that withFactualReplan
// attaches to a FREEZE-2 question). Searches intake variants with and without strength (staleReturn reads the strength state only).
// Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node explore-graduation.mjs
import {NOW,PRED,BAD,correctionOf,apply,write,full} from './qr1.mjs';
const base={goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const VARIANTS={
 GRAD:base,
 GRAD_S_GENERAL:{...base,goals:{run:'PERFORMANCE',strength:'GENERAL'},recent:{...base.recent,strengthDaysPerWeek:2},schedule:{strengthDays:[0,4],runMinutes:45},equipment:['DUMBBELLS','BENCH']},
 GRAD_S_GENERAL_D25:{...base,goals:{run:'PERFORMANCE',strength:'GENERAL'},recent:{...base.recent,strengthDaysPerWeek:2},schedule:{strengthDays:[2,5],runMinutes:45},equipment:['DUMBBELLS','BENCH']},
 GRAD_S_MAINTAIN:{...base,goals:{run:'PERFORMANCE',strength:'MAINTAIN'},recent:{...base.recent,strengthDaysPerWeek:2},schedule:{strengthDays:[0,4],runMinutes:45},equipment:['DUMBBELLS','BENCH']},
 GRAD_S_ONEDAY:{...base,goals:{run:'PERFORMANCE',strength:'GENERAL'},recent:{...base.recent,strengthDaysPerWeek:1},schedule:{strengthDays:[2],runMinutes:45},equipment:['DUMBBELLS','BENCH']},
};
function probe(rt,name,o){
 const {program,weekly,review,evaluateProgram,opts,addDays}=rt.H,out={};
 let t;try{t={p:program({id:'q-'+name.toLowerCase(),...o}),ledger:[]};}catch(e){return {error:'intake: '+e.message.slice(0,160)};}
 for(let w=0;w<3;w++)weekly(t,w);
 const g=weekly(t,3);out.week3={action:g.action,graduated:!!t.p.canonical.athlete.runGraduation,qualifyingWeeks:t.p.canonical.athlete.runGraduation?.qualifyingWeeks?.map(q=>q.week)??null,strengthSessions:t.p.weeks[4].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).length};
 if(!out.week3.graduated)return out;
 const rep=addDays(t.p.weeks[4].startDate,3);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,4,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[4].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 out.ret={action:ret.action,stillGraduated:!!t.p.canonical.athlete.runGraduation,fromWeek:t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1)?.fromWeek};
 const longObs=t.ledger.filter(o=>!o.superseded&&t.p.weeks[3].sessions.some(s=>s.id===o.sessionId&&s.role==='LONG'))[0];
 const fix=correctionOf(longObs,structuredClone(longObs.actual),`${addDays(rep,1)}T05:00:00Z`,BAD);
 const r=full(rt,evaluateProgram(t.p,{...review(t.p,4,{day:4,hour:'06:00:00',observations:[fix]}),actualLedger:t.ledger},opts));
 out.correctionInReentryWeek={status:r.status,proposal:r.proposal,proposalAction:r.proposalAction,disclosureIds:r.disclosureIds,reason:String(r.reason).slice(0,140)};
 return out;
}
const res={};
for(const [label,rt] of [['freeze2',PRED],['r7b2',NOW]]){res[label]={};for(const [n,o] of Object.entries(VARIANTS))res[label][n]=probe(rt,n,o);}
write('explore-graduation',res);
for(const k of ['freeze2','r7b2'])for(const [n,v] of Object.entries(res[k]))console.log(k,n,JSON.stringify(v));
