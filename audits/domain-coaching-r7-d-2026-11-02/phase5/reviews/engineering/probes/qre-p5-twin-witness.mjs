// QRE-R7D-PHASE5-REVIEW-r1: witnesses for the H02 P06 twin and H01 (read-only, development cases). On DEV-65, DEV-64 and DEV-01 (candidate copy):
//  (a) at each step where R7D-HARNESS-9 lists P06_SESSION_REPORTED_BY_THIS_DECISION, the same sessions left out of that step's record and inflated
//      to 999 minutes must fail P06 (the twin never excuses an unreported session of the decision's own day);
//  (b) the same sessions kept in the record and inflated must NOT be read (history), the unit stays NOT_EVALUABLE;
//  (c) DEV-63 with longestRunMinutes 0 replaced by absent: identical HARNESS-9 P06 reading (H01 = absent).
//   node qre-p5-twin-witness.mjs --root <extracted root>
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ROOT=arg('--root'),AUD=path.resolve(import.meta.dirname,'../../../..'),H=p=>pathToFileURL(path.join(AUD,'harness',p)).href;
const c9=await import(H('lib/client-9.mjs')),p9=await import(H('lib/properties-9.mjs'));
const dev=JSON.parse(fs.readFileSync(path.join(AUD,'harness/validation/DEV_CASES_R7D_9.json'),'utf8')),byId=id=>dev.cases.find(c=>c.caseId===id);
const cc=path.join(ROOT,'CoachingCore'),rt=await c9.loadRuntime(cc),ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const thaw=x=>JSON.parse(JSON.stringify(x)),out=[];
for(const id of ['DEV-65','DEV-64','DEV-01']){
 const base=c9.runCase(rt,byId(id)),P=p9.evaluateProperties(base,ctx).P06,ne=P.notEvaluable.filter(x=>x.reason==='P06_SESSION_REPORTED_BY_THIS_DECISION');
 for(const n of ne){
  const i=base.steps.findIndex(s=>s.stepId===n.at);
  const mk=(dropRows)=>{const t={...base,steps:base.steps.map(s=>({...s}))},s=t.steps[i],p=thaw(s.planAfter);for(const x of p.weeks[n.week].sessions)if(n.sessions.includes(x.id))x.prescription.durationMinutes=999;s.planAfter=p;
   if(dropRows)s.result={...s.result,actualLedger:(s.result.actualLedger??[]).filter(r=>!n.sessions.includes(r.sessionId))};return p9.evaluateProperties(t,ctx).P06;};
  const a=mk(true),b=mk(false);
  out.push({caseId:id,at:n.at,week:n.week,sessions:n.sessions,unreportedInflated:{result:a.result,fired:a.violations.some(v=>n.sessions.includes(v.sessionId))},reportedInflated:{result:b.result,fired:b.violations.some(v=>n.sessions.includes(v.sessionId)),stillListed:b.notEvaluable.some(x=>x.at===n.at&&x.reason==='P06_SESSION_REPORTED_BY_THIS_DECISION')}});
 }
}
{const k=byId('DEV-63'),k2=thaw(k);delete k2.intake.athlete.recent.longestRunMinutes;const a=p9.evaluateProperties(c9.runCase(rt,k),ctx).P06,b=p9.evaluateProperties(c9.runCase(rt,k2),ctx).P06;
 out.push({caseId:'DEV-63',h01:{zero:{result:a.result,units:a.units,ne:a.notEvaluable.map(x=>x.reason)},absent:{result:b.result,units:b.units,ne:b.notEvaluable.map(x=>x.reason)},same:JSON.stringify([a.result,a.units,a.notEvaluable])===JSON.stringify([b.result,b.units,b.notEvaluable])}});}
console.log(JSON.stringify(out,null,1));
