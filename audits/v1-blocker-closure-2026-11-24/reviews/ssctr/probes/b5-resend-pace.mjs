// SSCTR BC R1 probe b5 (successor of SSCTR_INT_R2 r2c/r2d): a week-3 run block delivered while the onboarding screen is stale (ASK), the screen
// answered, the same workouts re-sent; against the screen answered first. Pace lineage, calibration, forecast, pace insights, credit, program.
// Variant C: re-sent twice more after recording (replays). Usage: node b5-resend-pace.mjs <CoachingCore root>. Read-only; synthetic.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2];const H=await import(pathToFileURL(path.join(root,'test/v1int-helpers.mjs')).href);
const {athlete,addDays,spy}=H;
const norm=x=>JSON.stringify(x,(k,v)=>typeof v==='string'&&/^(ob|dc|pr|ev)_|^[0-9a-f]{32,}$/.test(v)?'<id>':(/hash|Hash|At$|^at$|eventId|athleteId|decisionId|asOf|reportId|id$/.test(k)&&typeof v==='string'?'<x>':v));
function J(mode){
 const sp=spy(),t=athlete({id:'Q5',engine:sp.engine});t.enroll();const p=t.doc().program,wk=3,runs=p.weeks[wk].sessions.filter(s=>s.sport==='RUN'&&s.prescription),last=runs.at(-1).date;const log=[];
 if(mode==='A'){t.set(last,'20:00');t.weekly(last,[]);t.set(last,'20:05');const r=t.import(runs.map(s=>t.watch(s)));log.push(r.status+':'+r.activities.map(x=>x.outcome[0]).join(''));}
 else{t.set(last,'20:00');const a=t.import(runs.map(s=>t.watch(s)));log.push(a.status+':'+a.activities.map(x=>x.outcome[0]).join(''));
  t.set(last,'20:05');t.weekly(last,[]);t.set(last,'20:10');const b=t.import(runs.map(s=>t.watch(s)));log.push(b.status+':'+b.activities.map(x=>x.outcome[0]).join(''));
  if(mode==='C'){for(const m of ['20:20','20:30']){t.set(last,m);const c=t.import(runs.map(s=>t.watch(s)));log.push((c.duplicate?'DUP':c.status)+':'+(c.activities??[]).map(x=>x.outcome[0]).join(''));}}}
 const sun=addDays(p.weeks[wk].startDate,6);t.set(sun,'21:00');const r=t.weekly(sun,[]);const out=sp.calls.filter(c=>c.op==='evaluate').at(-1).out,rd=t.it.presentation({actor:t.actor}).readings??{};
 const rows=t.rows().filter(o=>!o.fact&&!o.superseded&&runs.some(s=>s.id===o.sessionId)).length;
 return {mode,log,st:r.status,rows,prog:norm(t.doc().program),cal:norm(rd.runCalibration),fc:norm(rd.runForecast),pi:norm(rd.paceInsights),
  notCarried:(JSON.stringify(out).match(/REPORT_NOT_CARRIED/g)??[]).length,facts:t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED').length,standing:t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.report?.standing!==false).length,ev:t.carried().runEvidenceRecord.length,
  calKeys:Object.keys(out.runCalibration??{}).join(','),evidenceUsed:JSON.stringify(out.runCalibration?.evidence??out.runCalibration?.evidenceUsed??null)?.length};
}
const a=J('A'),b=J('B'),c=J('C');
for(const x of [a,b,c])console.log(x.mode,JSON.stringify({log:x.log,status:x.st,rowsCredited:x.rows,reportFacts:x.facts,standing:x.standing,evidenceRecord:x.ev,REPORT_NOT_CARRIED:x.notCarried}));
console.log('B vs A: program',a.prog===b.prog,'calibration',a.cal===b.cal,'forecast',a.fc===b.fc,'paceInsights',a.pi===b.pi);
console.log('C vs A: program',a.prog===c.prog,'calibration',a.cal===c.cal,'forecast',a.fc===c.fc,'paceInsights',a.pi===c.pi);
