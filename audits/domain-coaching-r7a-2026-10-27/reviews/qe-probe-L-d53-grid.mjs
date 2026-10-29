// QE probe L (claim 3, D53 every state mode; adversarial grid): after any performed re-establishment the count before the phase reduction
// rises at most one set per week. Grid: state mode before the gap (KNOWN, pending, unlogged, re-established twice), gap position (mid
// development, block end, consolidation, split week by date with three strength days), execution of the re-establishment and later
// weeks (as prescribed, one set logged per exercise, completed report without exercise details), goals STRENGTH / GENERAL.
// Invariant: for an exercise re-established and performed in week w with base count c0 (first executed row), every row of it in week
// w+k (k = 1..4, until its next re-establishment) has exposure.baseSets <= c0 + k and sets <= c0 + k. Also checks validateWeeks phaseDose.
import {cur,opts,intake,review,obs,rows,addDays,out} from './qe-lib.mjs';
const R=cur;
const modes={
 KNOWN:{athlete:{}},
 PENDING:{athlete:{knownExercises:[]},noisy:true},
 UNLOGGED:{athlete:{knownExercises:[]},unloggedBefore:true},
 TWICE:{athlete:{},twice:true}
};
const gaps={MID:[1,5],BLOCK_END:[2,6],INTO_CONSOLIDATION:[3,7],LATE:[6,10]};
const execs=['AS_PRESCRIBED','ONE_SET','NO_DETAILS'];
const goals=['STRENGTH','GENERAL'];
const days={TWO:[0,4],THREE:[0,2,4]};
let timelines=0,checked=0,reest=0;const violations=[],phaseErrors=[],statuses={};
for(const [mName,m] of Object.entries(modes))for(const [gName,[a,b]] of Object.entries(gaps))for(const ex of execs)for(const goal of goals)for(const [dName,sd] of Object.entries(days)){
 const id=`qe-L-${mName}-${gName}-${ex}-${goal}-${dName}`;
 const g=R.generateProgram(intake({id,weeks:16,athlete:{goals:{run:'PERFORMANCE',strength:goal},exerciseRotationPreference:'FIXED',...m.athlete},schedule:{strengthDays:sd,runDays:[1,3,6],longRunDay:6}}),opts);
 if(!g.program){statuses[g.status]=(statuses[g.status]??0)+1;continue;}
 timelines++;let p=g.program,ledger=[];const count={};
 // A split week by date with three strength days: the gap ends two days later, so the re-establishment falls mid-week.
 const missed=(w,s)=>s.sport==='STRENGTH'&&(w>=a&&w<=b||m.twice&&w>=b+4&&w<=b+8||(dName==='THREE'&&w===b+1&&s.day===0));
 for(let w=0;w<15;w++){
  const list=p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&!missed(w,s)).map(s=>{
   if(s.sport!=='STRENGTH')return obs(p,s);
   const after=w>b;
   if(after&&ex==='NO_DETAILS'){const o=obs(p,s);delete o.actual.exercises;return o;}
   const over={};for(const e of s.prescription.exercises){const o={};if(after&&ex==='ONE_SET')o.sets=1;
    if(!after&&m.noisy&&e.load.mode!=='BODYWEIGHT'&&e.load.mode!=='KNOWN'){count[e.id]=(count[e.id]??0)+1;o.load={value:count[e.id]%2?20:40,unit:'KG',convention:e.load.convention};}
    if(!after&&m.unloggedBefore&&e.load.mode!=='BODYWEIGHT')o.load=null;over[e.id]=o;}
   return obs(p,s,{over});});
  const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);
  statuses[r.status]=(statuses[r.status]??0)+1;ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }
 const sk=cur.skeletonOf(p,opts.authority);for(const e of cur.validateWeeks(sk,p.weeks).filter(x=>x.includes('phaseDose')))phaseErrors.push(id+' '+e);
 for(let w=0;w<p.weeks.length-1;w++){
  const byId={};for(const {s,e} of rows(p,w))if(e.exposure?.kind==='REESTABLISH')(byId[e.id]??=[]).push({s,e});
  for(const [eid,list] of Object.entries(byId)){
   const st=p.stateTrace[w+1]?.strength?.exercises?.[eid];if(!st||!(st.lastPerformed>=p.weeks[w].startDate))continue;
   const done=list.filter(x=>x.s.date<=st.lastPerformed);const c0=(done[0]??list[0]).e.exposure.baseSets;reest++;
   for(let k=1;k<=4&&w+k<p.weeks.length;k++){
    const later=rows(p,w+k).filter(x=>x.e.id===eid);if(later.some(x=>x.e.exposure?.kind==='REESTABLISH'))break;
    for(const {s,e} of later){checked++;if(e.exposure.baseSets>c0+k||e.sets>c0+k)violations.push(`${id} ${eid} re-established w${w} at ${c0}; w${w+k} ${s.date} ${e.sets}x base=${e.exposure.baseSets} kind=${e.exposure.kind}`);}
   }
  }
 }
}
out('L',{timelines,statuses,performedReestablishments:reest,laterRowsChecked:checked,violations:violations.length,examples:violations.slice(0,12),phaseDoseErrors:phaseErrors.length,phaseExamples:phaseErrors.slice(0,6)});
