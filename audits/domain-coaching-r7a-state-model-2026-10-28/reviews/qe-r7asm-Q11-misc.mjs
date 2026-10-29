// Q11 (reviewer-owned), three smaller classes.
// (a) Week-0 re-plans rewrite stateTrace[0], the one stored start the reducer reads (the intake): history before/after must be equal.
// (b) Late evidence for a week a review already closed (the Saturday lift reported on Monday after the review): history follows the fact; the
//     plan made before it is not history.
// (c) REPS_THEN_LOAD goal (HYPERTROPHY): the planning view takes the repetition target from the projection at the same load (contract §4 row 2).
//     With identical ledgers, does an unreviewed incomplete week carry a projected rep step into a decision made after the facts?
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q11-misc',root:L.ROOT_USED};
// (a)
{const res=[];for(const h of [{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:45}},{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}]){
 const g=L.R.generateProgram(L.intake({id:'qe-q11a'}),L.opts),t={p:g.program,ledger:[]};
 L.step(t,L.at(t.p,0,1,'21:00:00',{observations:t.p.weeks[0].sessions.filter(s=>L.live(s)&&s.day<=1).map(s=>L.obs(t.p,s))}));
 const before=L.V.hash(L.history(t,0,2,'12:00:00')),st0=L.V.hash(t.p.stateTrace[0]);
 const r=L.step(t,L.at(t.p,0,2,'07:00:00',h),{allow:true});
 res.push({handler:h.kind,status:`${r.status}/${r.action}`,stateTrace0Rewritten:L.V.hash(t.p.stateTrace[0])!==st0,historyEqual:L.V.hash(L.history(t,0,2,'12:00:00'))===before});}
 out.a_week0Replans=res;}
// (b)
{const t=L.start('qe-q11b',3),sat=t.p.weeks[3].sessions.find(L.SAT);
 L.weekly(t,3,s=>!L.SAT(s)); // review closes week 3 with Saturday missing
 const planned4=L.rowsOf(t,4,L.SAT,['db-rdl','db-split-squat']).map(r=>`${r.mode}${r.value??''}`);
 const before=L.hex(L.history(t,4,1),'db-rdl');
 L.step(t,L.at(t.p,4,0,'09:00:00',{observations:[{...L.obs(t.p,sat),eventId:'q11b-late-sat'}]})); // the Saturday lift reported late
 const after=L.hex(L.history(t,4,1),'db-rdl');
 out.b_lateEvidence={week4RowsPlannedBeforeFact:planned4,historyBefore:{load:before.lastExecutedLoad,lp:before.lastPerformedAt,tick:before.earnedProgress.loadTick},historyAfter:{load:after.lastExecutedLoad,lp:after.lastPerformedAt,tick:after.earnedProgress.loadTick},lastPerformedFollowsFact:after.lastPerformedAt===sat.date};}
// (c)
{const res={};for(const cell of ['U','R']){
 const g=L.R.generateProgram(L.intake({id:'qe-q11c',athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}}}),L.opts),t={p:g.program,ledger:[]};
 for(let w=0;w<4;w++)L.weekly(t,w);
 if(cell==='U')L.perDay(t,4,s=>!L.SAT(s));else L.weekly(t,4,s=>!L.SAT(s));
 L.weekly(t,5,s=>!L.SAT(s));
 const ids=[...new Set(t.p.weeks[6].sessions.filter(L.SAT).flatMap(s=>s.prescription.exercises.map(e=>e.id)))].filter(id=>!t.p.weeks[6].sessions.some(s=>L.WED(s)&&s.prescription.exercises.some(e=>e.id===id)));
 const H=L.history(t,6,0);
 res[cell]={phases:t.p.phases.phases.slice(3,7),satOnly:ids,ledgerHash:L.V.hash(t.ledger.filter(o=>!o.superseded).map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt}))),
  history:Object.fromEntries(ids.map(id=>[id,(e=>`${e.mode}${e.load??''} x${e.reps}`)(H.state.strength.exercises[id])])),
  plan6:Object.fromEntries(ids.map(id=>[id,(e=>`${e.mode}${e.load??''} x${e.reps}`)(t.p.stateTrace[6].strength.exercises[id])])),
  rows6:L.rowsOf(t,6,L.SAT,ids).map(r=>`${r.id} ${r.mode}${r.value??''} x${r.reps}`)};}
 res.identicalLedgers=res.U.ledgerHash===res.R.ledgerHash;res.rowsDiffer=JSON.stringify(res.U.rows6)!==JSON.stringify(res.R.rows6);res.historyEqual=JSON.stringify(res.U.history)===JSON.stringify(res.R.history);
 out.c_repsTarget=res;}
console.log(JSON.stringify(out,null,1));
