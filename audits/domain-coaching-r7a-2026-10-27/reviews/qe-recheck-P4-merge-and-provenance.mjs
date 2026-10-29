// QE re-check probe P4 (R7A-QE-r2, FREEZE-2): the cycle-2 duplicate merge (mergeActual) and carried provenance (inputHashes,
// mergedSourceIds), beyond the reviewer's first-cycle cases.
// 4a (QE-R7A-05 claim "a known value is never replaced by an unknown one"): per exercise mergeActual keeps one whole entry, ranked by
//    the count of known values, then sets, then source rank. A manual log with loads and reps (no RIR) and an agreeing watch log with
//    reps and RIR (no load) tie on known values; the watch entry wins on rank and the squat's loads disappear.
// 4b (claim "arrival order never decides"): three agreeing reports of one run; the merged row keeps the first report's source quality,
//    so the order of M (manual), W (wearable activity) and S (manual) changes the merged minutes.
// 4c (delta: byEvent registration by provenance keys): a NEW report that carries provenance.mergedSourceIds is registered under those
//    event ids, so a later genuine report with one of those ids is rejected as an event-id reuse and its session quarantined.
// Synthetic data, DEV_TEST_ONLY authority. QE_RUNTIME=pre runs the R6 closure runtime.
import {cur,pre,opts,intake,review,obs,out} from './qe-lib.mjs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const norm=tag==='PRE_R7A'?(await import(pathToFileURL(path.join(R.tmp,'CoachingCore/src/r6-provenance.mjs')).href)).normalizeObservations:cur.normalizeObservations;
const p=R.generateProgram(intake({id:'qe-rc-P4',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),run=all.find(s=>s.sport==='RUN');
const sq=str.prescription.exercises.find(e=>e.id==='back-squat');
const at=s=>s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z');
const gatesOf=r=>JSON.stringify(r.gates),logOf=(r,id,sid)=>r.weekEvidence.rows.find(x=>x.sessionId===sid)?.logs?.[id]??null;
const res={runtime:tag};
// ---------- 4a ----------
{
 const base=all.map(s=>obs(p,s));
 const M=base.find(o=>o.sessionId===str.id);
 // Manual: every exercise as prescribed, but the squat logged with load and reps only (no RIR) -- 6 known values.
 M.actual.exercises=M.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets:e.sets.map(({rir,...x})=>x)}:e);
 // Watch: the squat only, three sets with reps and RIR but no load -- 6 known values; declared device activity.
 const W={eventId:'qe-rc-4a-W',athleteId:p.athleteId,sessionId:str.id,observedAt:at(str),reportedAt:str.date+'T20:00:00Z',actual:{completed:true,minutes:str.prescription.durationMinutes,exercises:[{id:'back-squat',sets:Array.from({length:sq.sets},()=>({reps:sq.reps,rir:sq.rir}))}]},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},source:{provider:'APPLE_HEALTH',activityId:'hk-act-1'}};
 const a=R.evaluateProgram(p,review(p,0,{observations:base}),opts),b=R.evaluateProgram(p,review(p,0,{observations:[...base,W]}),opts);
 // What the two reports state together, field by field: the manual report with the watch's RIR added (loads, reps and RIR all known).
 const U=structuredClone(base);U.find(o=>o.sessionId===str.id).actual.exercises=U.find(o=>o.sessionId===str.id).actual.exercises.map(e=>e.id==='back-squat'?{...e,sets:e.sets.map(x=>({...x,rir:sq.rir}))}:e);
 const u=R.evaluateProgram(p,review(p,0,{observations:U}),opts);
 const sqRows=r=>(r.proposal??p).weeks[1].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>`${s.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode} ${e.load.value??''}`));
 res['4a_nextWeekSquat']={manualOnly:sqRows(a),fieldUnionOfBothReports:sqRows(u),mergedByRuntime:sqRows(b),unionDecision:`${u.status}/${u.action}`,unionSquatGate:u.gates?.['back-squat'],mergedEqualsUnion:JSON.stringify(sqRows(u))===JSON.stringify(sqRows(b))&&JSON.stringify((u.proposal??p).stateTrace[1].strength.exercises['back-squat'])===JSON.stringify((b.proposal??p).stateTrace[1].strength.exercises['back-squat']),
  squatStateMerged:(b.proposal??p).stateTrace[1].strength.exercises['back-squat'],squatStateUnion:(u.proposal??p).stateTrace[1].strength.exercises['back-squat']};
 const n=norm([...base,W],{athleteId:p.athleteId,asOf:review(p,0).asOf,maximumAgeDays:36500,loadIncrements:opts.authority.policy.operational.strength.smallestIncrement});
 const merged=n.accepted.find(o=>o.sessionId===str.id)?.actual.exercises.find(e=>e.id==='back-squat');
 res['4a_knownLoadDroppedByWholeEntryMerge']={
  manualOnly:{decision:`${a.status}/${a.action}`,squatLog:logOf(a,'back-squat',str.id),squatNextState:(a.proposal??p).stateTrace[1].strength.exercises['back-squat']?.load},
  withAgreeingWatch:{duplicates:b.provenance.duplicates,conflicts:b.provenance.conflicts.length,decision:`${b.status}/${b.action}`,squatLog:logOf(b,'back-squat',str.id),squatGate:b.gates?.['back-squat'],loadQuestions:(b.loadQuestions??[]).map(q=>`${q.exerciseId}:${q.reason}`)},
  mergedSquatEntry:merged,
  loadLostInMerge:!!merged&&merged.sets.every(s=>s.load===undefined),
  decisionUnchanged:a.status===b.status&&a.action===b.action&&gatesOf(a)===gatesOf(b)&&JSON.stringify((a.proposal??p).stateTrace[1])===JSON.stringify((b.proposal??p).stateTrace[1])};
}
// ---------- 4b ----------
{
 const mk=(id,minutes,source,rep)=>({eventId:id,athleteId:p.athleteId,sessionId:run.id,observedAt:at(run),reportedAt:run.date+rep,actual:{completed:true,minutes},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},...(source?{source}:{})});
 const orders={MWS:['T09:00:00Z','T10:00:00Z','T11:00:00Z'],WMS:['T10:00:00Z','T09:00:00Z','T11:00:00Z'],SWM:['T11:00:00Z','T10:00:00Z','T09:00:00Z']};
 const D=run.prescription.durationMinutes,others=all.filter(s=>s!==run).map(s=>obs(p,s));
 const out4b={};
 // (i) three pairwise-agreeing reports (35, 37, 36 min against a 35-min plan; tolerance max(3, 10%)): merged minutes by arrival order.
 for(const [k,[tm,tw,ts]] of Object.entries(orders)){
  const list=[mk('qe-rc-4b-M',D,null,tm),mk('qe-rc-4b-W',D+2,{provider:'APPLE_HEALTH',activityId:'hk-run-1'},tw),mk('qe-rc-4b-S',D+1,{quality:'SELF_REPORT'},ts)];
  const n=norm(list,{athleteId:p.athleteId,asOf:review(p,0).asOf,maximumAgeDays:36500});
  const row=n.accepted.find(o=>o.sessionId===run.id);
  out4b[k]={mergedMinutes:row?.actual.minutes??null,keptSourceQuality:row?.provenance.sourceQuality??null,duplicates:n.duplicates.map(d=>d.eventId+'>'+d.mergedInto),conflicts:n.conflicts.length};
 }
 // (ii) three same-rank manual reports 35, 38, 41 min: neighbours agree, the ends (35 vs 41) do not. Conflict or merge by arrival order.
 const tri={};
 for(const [k,ts] of Object.entries({A_B_C:['T09:00:00Z','T10:00:00Z','T11:00:00Z'],B_C_A:['T11:00:00Z','T09:00:00Z','T10:00:00Z']})){
  const list=[mk('qe-rc-4b-A',D,null,ts[0]),mk('qe-rc-4b-B',D+3,null,ts[1]),mk('qe-rc-4b-C',D+6,null,ts[2])];
  const r=R.evaluateProgram(p,review(p,0,{observations:[...list,...others]}),opts);
  tri[k]={conflicts:r.provenance.conflicts.map(c=>c.reason),duplicates:r.provenance.duplicates.map(d=>d.eventId+'>'+d.mergedInto),runRow:r.weekEvidence.rows.find(x=>x.sessionId===run.id)?.status,gate:r.gates?.[run.role]??null,decision:`${r.status}/${r.action}`};
 }
 res['4b_threeReportsArrivalOrder']={plannedMinutes:D,agreeingTriple:out4b,sameMergedMinutesInEveryOrder:new Set(Object.values(out4b).map(x=>x.mergedMinutes)).size===1,nonTransitiveTriple:tri,sameDecisionEitherOrder:tri.A_B_C.decision===tri.B_C_A.decision&&tri.A_B_C.runRow===tri.B_C_A.runRow};
}
// ---------- 4c ----------
{
 const runs=all.filter(s=>s.sport==='RUN');
 const X={...obs(p,runs[0],{eventId:'qe-rc-4c-X'}),provenance:{mergedSourceIds:['qe-rc-4c-X','qe-rc-4c-Y']}};
 const Y={...obs(p,runs[1],{eventId:'qe-rc-4c-Y'}),reportedAt:runs[1].date+'T12:00:00Z'};
 const n=norm([X,Y],{athleteId:p.athleteId,asOf:review(p,0).asOf,maximumAgeDays:36500});
 const plain=norm([{...X,provenance:undefined},Y],{athleteId:p.athleteId,asOf:review(p,0).asOf,maximumAgeDays:36500});
 const others=all.filter(s=>s!==runs[0]&&s!==runs[1]).map(s=>obs(p,s));
 const a=R.evaluateProgram(p,review(p,0,{observations:[{...X,provenance:undefined},Y,...others]}),opts),b=R.evaluateProgram(p,review(p,0,{observations:[X,Y,...others]}),opts);
 res['4c_newReportClaimsForeignEventIds']={
  withClientMergeProvenance:{accepted:n.accepted.map(o=>o.eventId),excluded:n.excluded.map(e=>`${e.eventId}:${e.reason}`),conflicts:n.conflicts.map(c=>c.reason),quarantined:n.quarantinedIdentities},
  withoutIt:{accepted:plain.accepted.map(o=>o.eventId),excluded:plain.excluded.map(e=>`${e.eventId}:${e.reason}`)},
  reviewWithout:{decision:`${a.status}/${a.action}`,gates:a.gates},reviewWith:{decision:`${b.status}/${b.action}`,gates:b.gates},
  decisionChanged:gatesOf(a)!==gatesOf(b)||a.action!==b.action};
}
out('P4',res);
