// R7B2-QUALITY-r1 Q1/Q2 probe: the class Engineering found (QE-R7B2-01) enumerated in full on both runtimes. A WORK return is recorded in week 3
// (REESTABLISH), weeks 3 and 4 are reviewed, then in week 5 the return report is resent under its own event id with a clinical reason, crossed with
// the factual state of the review (no correction; week 4's strength reports corrected; week 4's long run corrected) and every block-choice shape
// (none, empty, ladder, declined, accepted, main change, unrecognised, null entry, string entry), on day 0 and day 2. Controls on the same grid:
// the same clinical report under a new id (the handler's own route on both), and nonclinical resends (other facts, the same facts, an unclear
// reason) which must be identical. Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node q1-sameid-grid.mjs
import {BAD,correctionOf,apply,write,full,dual,counts,choiceShapes} from './qlib.mjs';

function scenario(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,addDays}=rt.H,rows=[];
 const t=reviewed({id:'qr-s1',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});
 const ret=apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts));if(ret.action!=='REESTABLISH')throw new Error('setup '+rt.label+': '+ret.reason);
 weekly(t,3);weekly(t,4);
 const corrections={
  none:()=>[],
  strengthW4:when=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD)),
  longRunW4:when=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.role==='LONG')).map(o=>correctionOf(o,{...structuredClone(o.actual),minutes:10},when,BAD))
 };
 const facts={
  illnessText:{interruption:{...first,reasonCategory:null,reason:'Flu illness'}},
  injuryCategory:{interruption:{...first,reasonCategory:'INJURY'}},
  clinicalFlag:{interruption:{...first,clinicalReason:true}},
  illnessCategory:{interruption:{...first,reasonCategory:'ILLNESS',reason:'Sick'}},
  aliasRETURN:{kind:'RETURN',interruption:{...first,reasonCategory:null,reason:'Flu illness'}}
 };
 const controls={
  otherFacts:{interruption:{...first,reasonCategory:'FAMILY',reason:'Family visit'}},
  sameFacts:{interruption:first},
  unclearFacts:{interruption:{...first,reasonCategory:null,reason:'Stuff came up'}}
 };
 const run=(name,{kind='RETURN_AFTER_PAUSE',interruption},{day,fix,choices,sameId=true})=>{
  const when=`${addDays(t.p.weeks[5].startDate,day)}T05:00:00Z`;
  const rv=review(t.p,5,{day,hour:'06:00:00',kind,interruption,observations:corrections[fix](when),...(choices===undefined?{}:{choices})});
  const r=evaluateProgram(t.p,{...rv,...(sameId?{event:{...rv.event,id:r0.event.id}}:{}),actualLedger:t.ledger},opts);
  rows.push({name,f:full(rt,r),applied:r.proposal??t.p,meta:{sameId,day,fix,choices:choices===undefined?'none':JSON.stringify(choices)}});
 };
 for(const day of [0,2])for(const fix of Object.keys(corrections))for(const [cn,choices] of Object.entries(choiceShapes)){
  for(const [fn,x] of Object.entries(facts)){run(`clinical:${fn}|fix:${fix}|choice:${cn}|day:${day}`,x,{day,fix,choices});run(`newId:${fn}|fix:${fix}|choice:${cn}|day:${day}`,x,{day,fix,choices,sameId:false});}
  for(const [fn,x] of Object.entries(controls))run(`nonclinical:${fn}|fix:${fix}|choice:${cn}|day:${day}`,x,{day,fix,choices});
 }
 return rows;
}
const rows=dual(scenario);
const group=p=>rows.filter(r=>r.name.startsWith(p));
const summary={clinicalSameId:counts(group('clinical:')),newIdControls:counts(group('newId:')),nonclinicalControls:counts(group('nonclinical:'))};
const s5ii=rows.filter(r=>r.cls==='S5_II'),other=rows.filter(r=>r.cls==='OTHER');
const out=write('q1-sameid-grid',{summary,total:rows.length,
 s5iiRows:s5ii.map(r=>({name:r.name,freeze2:r.freeze2,r7b2:r.r7b2,differs:r.differs,appliedWeeksDiffering:r.appliedWeeksDiffering,ledgerEqual:r.ledgerEqual,modelEqual:r.modelEqual})),
 otherRows:other.map(r=>({name:r.name,freeze2:r.freeze2,r7b2:r.r7b2,differs:r.differs,outsideRoute:r.outsideRoute})),
 changedRowsLedgerOrModelDiffer:rows.filter(r=>r.cls!=='SAME'&&(!r.ledgerEqual||!r.modelEqual)).map(r=>r.name),
 changedRowsDisclosuresDiffer:rows.filter(r=>r.cls!=='SAME'&&JSON.stringify(r.freeze2.disclosureIds)!==JSON.stringify(r.r7b2.disclosureIds)).map(r=>r.name),
 rows});
console.log(JSON.stringify({summary,s5ii:s5ii.length,other:other.map(r=>r.name+' '+r.differs.join(',')),ledgerOrModel:out.changedRowsLedgerOrModelDiffer,disclosures:out.changedRowsDisclosuresDiffer},null,1));
for(const r of s5ii)console.log('S5_II '+r.name+' | F2 '+r.freeze2.status+' '+String(r.freeze2.proposal).slice(0,10)+' | B2 '+r.r7b2.status+' | weeks '+JSON.stringify(r.appliedWeeksDiffering));
