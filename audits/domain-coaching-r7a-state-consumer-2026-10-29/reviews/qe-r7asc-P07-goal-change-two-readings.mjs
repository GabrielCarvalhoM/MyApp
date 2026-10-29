// P07 (reviewer-owned, Property C, goal change): the evidence reducer judges a week under that week's own goal context (sk.at(j)); the planner's
// weekly review applies the NEXT week's context (evidenceStart with skn = sk.at(w+1)). After a GOAL_CHANGE stated for next week, the same
// executed week then yields two "earned" doses: HistoricalState's (old goal's rule) and the prescription the closing review writes (new goal's
// rule). Shape (P06's case, every ordered goal pair): weeks 0-3 trained and reviewed under G1; GOAL_CHANGE to G2 on week 4's Monday (from week 5);
// week 4 executed as prescribed and reviewed. Then, in cell PLAN nothing else happens; in cell EQUIP an equipment statement on week 5's Monday
// 06:00 adds an item that changes no exercise (the decision re-composes week 5's strength from the PlanningView). Identical record in both cells.
// Reported per exercise: history's earned state (reducer), week 5's KNOWN rows in PLAN and in EQUIP.
import * as L from './qe-r7asc-lib.mjs';
const GOALS=['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT','MAINTAIN'];
const out={probe:'qe-r7asc-P07-goal-change-two-readings',root:L.ROOT_USED,pairs:[]};
const rowsBy=(t,w)=>{const m={};for(const r of L.rowsOf(t,w,s=>s.sport==='STRENGTH')){(m[r.id]??=[]).push(`${r.kind} ${r.mode}${r.value??''} ${r.sets}x${r.reps}`);}return Object.fromEntries(Object.entries(m).map(([k,v])=>[k,[...new Set(v)].join(' | ')]));};
for(const g1 of GOALS)for(const g2 of GOALS){if(g1===g2)continue;
 const cells={};
 for(const cell of ['PLAN','EQUIP']){
  L.resetIds();const gen=L.R.generateProgram(L.intake({id:`qe-p07-${g1}-${g2}`,athlete:{goals:{run:'PERFORMANCE',strength:g1}}}),L.opts),t={p:gen.program,ledger:[]};
  for(let w=0;w<4;w++)L.weekly(t,w);
  L.step(t,{...L.at(t.p,4,0,'06:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:g2}}},{allow:true});
  L.weekly(t,4);
  let eq=null;if(cell==='EQUIP'){const e=L.step(t,{...L.at(t.p,5,0,'06:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...t.p.canonical.athlete.equipment,'BANDS']}},{allow:true});eq={action:e.action,status:e.status,instantiationOnly:e.instantiationOnly};}
  const H=L.history(t,5,0,'12:00:00');
  cells[cell]={equipment:eq,ledger:L.V.hash(L.recordOf(t)),history:Object.fromEntries(Object.entries(H.state.strength.exercises).map(([id,e])=>[id,`${e.mode}${e.load??''} x${e.reps}`])),reducerFacts:Object.fromEntries(Object.entries(H.strength.exercises).map(([id,e])=>[id,{lastExecuted:`${e.lastExecutedLoad}x${e.lastExecutedReps}`,stepEarned:e.earnedProgress.stepEarned}])),rows5:rowsBy(t,5)};
 }
 const diff=Object.keys(cells.PLAN.rows5).filter(id=>cells.PLAN.rows5[id]!==cells.EQUIP.rows5[id]);
 out.pairs.push({g1,g2,identicalRecord:cells.PLAN.ledger===cells.EQUIP.ledger,equipment:cells.EQUIP.equipment,exercisesWhoseWeek5DoseDependsOnTheEquipmentStatement:diff.map(id=>({id,history:cells.PLAN.history[id],facts:cells.PLAN.reducerFacts[id],PLAN:cells.PLAN.rows5[id],EQUIP:cells.EQUIP.rows5[id]}))});
}
out.summary={pairs:out.pairs.length,pairsWithDivergence:out.pairs.filter(p=>p.exercisesWhoseWeek5DoseDependsOnTheEquipmentStatement.length).map(p=>`${p.g1}->${p.g2}`)};
console.log(JSON.stringify(out,null,1));
