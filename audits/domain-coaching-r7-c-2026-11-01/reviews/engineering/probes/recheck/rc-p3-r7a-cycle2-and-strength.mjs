// Recheck probe RC-P3 (F2 only unless QE_ROOTS says otherwise):
// (a) test/r7a-cycle2.test.mjs:111 classification. The ASK for a dated equipment change with unusable dates now carries the ceiling re-plan.
//     Is that proposal exactly the ceiling re-plan a plain review at the same clock makes (so nothing of the refused change leaks, in any week),
//     and is it REQUIRES_RECONCILIATION while the date question stands?
// (b) The ceiling re-plan re-composes every sport from the facts. For the never-reported fixture (weeks 0-2 unreported, decision at week 3
//     day 0), compare the strength rows ahead in the stored plan, in the ceiling re-plan, and on the on-time path (each week's review made with
//     nothing reported). Read-only; prints JSON.
import {RUNTIMES,timeline,runsOf,brief,live,addDays} from './rc-lib.mjs';
const out={probe:'RC-P3 r7a-cycle2 classification and the strength part of the ceiling re-plan',runtimes:Object.keys(RUNTIMES),by:{}};
const sessionsFrom=(R,P,w)=>P.weeks.slice(w).map(x=>x.sessions.map(s=>[s.id,s.status??null,R.hash(s.prescription??null)]));
const strengthRows=(P,w)=>P.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>`${s.id}:`+s.prescription.exercises.map(e=>`${e.id}/${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`).join(','));
for(const [name,R] of Object.entries(RUNTIMES)){
 const r={};
 // (a) The r7a-cycle2 fixture.
 {
  // The test file's own intake (r7a-cycle2.test.mjs: longest run 50, back squat and DB bench known, barbell and rack) and review clock (21:00).
  const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
  const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'},BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
  const ia={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:12,learningConsent:true,
   athlete:{id:'t7a2-dates',ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},
   schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80}};
  const p=R.H.generateProgram(ia,R.H.opts).program,W=2,from=p.weeks[3].startDate,rv=x=>R.H.review(p,W,{day:0,hour:'21:00:00',...x});
  const plain=R.H.evaluateProgram(p,rv({}),R.H.opts);
  r.plain={...brief(plain),runsW:plain.proposal?runsOf(plain.proposal,W):runsOf(p,W),storedRunsW:runsOf(p,W)};
  r.asks=[];
  for(const [f,to] of [[from,'soon'],[from,'2026-13-45'],[from,'2026-11-01'],['next week',addDays(from,6)]]){
   const q=R.H.evaluateProgram(p,rv({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:f,to}}),R.H.opts);
   r.asks.push({dates:`${f}..${to}`,...brief(q),hasProposal:!!q.proposal,proposalEqualsPlainCeilingReplan:!!q.proposal&&!!plain.proposal&&JSON.stringify(sessionsFrom(R,q.proposal,W))===JSON.stringify(sessionsFrom(R,plain.proposal,W)),referenceProgramIsProposal:q.referenceState?.programHash===(q.proposal?.hash??null)});
  }
 }
 // (b) Never-reported weeks 0-2, decision at week 3 day 0, against the on-time path (empty reviews of weeks 0-2).
 {
  const o={id:'rc-p3-gen',goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],schedule:{runMinutes:50,strengthMinutes:50,longRunMinutes:80}};
  const t=timeline(R,o),stored=t.p,d=t.step(3,{day:0,hour:'07:00:00'});
  const u=timeline(R,o);for(let w=0;w<3;w++)u.step(w,{});const e=u.step(3,{day:0,hour:'07:00:00'}),onTime=e.proposal??u.p;
  r.neverReported={decision:brief(d),runs:{stored:runsOf(stored,3),ceiling:runsOf(d.proposal??stored,3),onTime:runsOf(onTime,3)},strength:{stored:strengthRows(stored,3),ceiling:strengthRows(d.proposal??stored,3),onTime:strengthRows(onTime,3)}};
  r.neverReported.strengthCeilingEqualsOnTime=JSON.stringify(r.neverReported.strength.ceiling)===JSON.stringify(r.neverReported.strength.onTime);
  r.neverReported.strengthCeilingEqualsStored=JSON.stringify(r.neverReported.strength.ceiling)===JSON.stringify(r.neverReported.strength.stored);
 }
 out.by[name]=r;
}
console.log(JSON.stringify(out,null,1));
