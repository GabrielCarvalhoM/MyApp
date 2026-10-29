// P06 (reviewer-owned, Property C on strength): independent sweep of the resolved dose after a goal change, under ADVANCE and HOLD weeks.
// For every ordered pair of strength goals (G1 -> G2): weeks 0-3 trained and reviewed under G1; a GOAL_CHANGE to G2 on week 4's Monday; week 4
// executed and reviewed as ADV (as prescribed) or HOLD (every strength log without reps in reserve: the dose holds); week 5's rows checked:
//  (a) RANGE: a row of an exercise with a known load never prescribes repetitions above G2's range (first establishments excepted);
//  (b) LOAD: no KNOWN row's load is above HistoricalState's load for that exercise at week 5's start (no projected step);
//  (c) HOLD: under HOLD, every exercise's week-5 KNOWN dose (load, reps) equals its week-4 KNOWN dose, reps cut to G2's range at most.
import * as L from './qe-r7asc-lib.mjs';
const GOALS=['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT','MAINTAIN'],GD=L.opts.authority.policy.operational.strength.goalDoses;
const out={probe:'qe-r7asc-P06-strength-dose-sweep',root:L.ROOT_USED,ranges:Object.fromEntries(GOALS.map(g=>[g,GD[g]?.repRange])),cases:[],violations:{range:[],load:[],hold:[]}};
for(const g1 of GOALS)for(const g2 of GOALS){if(g1===g2)continue;for(const shape of ['ADV','HOLD']){
 L.resetIds();const gen=L.R.generateProgram(L.intake({id:`qe-p06-${g1}-${g2}`,athlete:{goals:{run:'PERFORMANCE',strength:g1}}}),L.opts);if(!gen.program){out.cases.push({g1,g2,shape,error:gen.status});continue;}
 const t={p:gen.program,ledger:[]};for(let w=0;w<4;w++)L.weekly(t,w);
 const gc=L.step(t,{...L.at(t.p,4,0,'06:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:g2}}},{allow:true});
 const known4=Object.fromEntries(L.rowsOf(t,4,s=>s.sport==='STRENGTH').filter(r=>r.mode==='KNOWN').map(r=>[r.id,r]));
 L.weekly(t,4,()=>true,shape==='HOLD'?(s=>s.sport==='STRENGTH'?{set:(id,x)=>({load:x.load,reps:x.reps})}:{}):{});
 const H=L.history(t,5,0),[lo,hi]=GD[g2].repRange,rows=L.rowsOf(t,5,s=>s.sport==='STRENGTH');
 for(const r of rows){
  const h=H.state.strength.exercises[r.id],known=!!h&&h.mode!=='BODYWEIGHT'&&(h.mode==='KNOWN'||Number.isFinite(h.load)||Number.isFinite(h.ceiling));
  if(known&&!['FIRST_ESTABLISH','REESTABLISH','PRACTICE','BODYWEIGHT'].includes(r.kind)&&r.reps>hi)out.violations.range.push({g1,g2,shape,row:L.fmtRow(r),hi});
  // History's resumable state undoes a step the evidence released but the athlete has not lifted yet (stepEarned); one smallest increment
  // above it is that earned step (EarnedProgress), anything more is a projected step.
  const pub=L.hex(H,r.id),inc=L.opts.authority.policy.operational.strength.smallestIncrement[h?.convention]??0,allowed=h&&Number.isFinite(h.load)?h.load+(pub?.earnedProgress?.stepEarned?inc:0):null;
  if(r.mode==='KNOWN'&&allowed!==null&&r.value>allowed+1e-9)out.violations.load.push({g1,g2,shape,row:L.fmtRow(r),historyLoad:h.load,stepEarned:!!pub?.earnedProgress?.stepEarned});
  if(r.mode==='KNOWN'&&allowed!==null&&r.value>h.load+1e-9&&pub?.earnedProgress?.stepEarned)out.earnedSteps=(out.earnedSteps??0)+1;
  if(shape==='HOLD'&&r.mode==='KNOWN'&&known4[r.id]){const k=known4[r.id];if(r.value!==k.value||r.reps!==Math.min(k.reps,hi))out.violations.hold.push({g1,g2,shape,week4:L.fmtRow(k),week5:L.fmtRow(r),hi});}
 }
 out.cases.push({g1,g2,shape,goalChange:gc.action,rows:rows.length});
}}
out.summary={cases:out.cases.length,range:out.violations.range.length,load:out.violations.load.length,hold:out.violations.hold.length};
console.log(JSON.stringify(out,null,1));
