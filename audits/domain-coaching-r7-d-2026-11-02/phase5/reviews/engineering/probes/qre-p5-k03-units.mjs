// QRE-R7D-PHASE5-REVIEW-r1 K03 unit accounting (read-only, development cases only): for every DEV_CASES_R7D_9 case on a runtime copy, read P03, P06
// (and the two carriers) with R7D-HARNESS-8 and R7D-HARNESS-9 on the same runs, and count:
//  - results and units under both;
//  - P06 own-week units that HARNESS-9 drops without listing them NOT_EVALUABLE (a session of the decision's own day that the record reports, while
//    other runs of that week are still ahead): the silent drops;
//  - any unit HARNESS-8 counted as a violation that HARNESS-9 neither counts nor lists.
//   node qre-p5-k03-units.mjs --root <extracted root> [--cases DEV-01,DEV-02]
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ROOT=arg('--root'),HERE=import.meta.dirname,AUD=path.resolve(HERE,'../../../..'),H=p=>pathToFileURL(path.join(AUD,'harness',p)).href;
const c8=await import(H('lib/client.mjs')),c9=await import(H('lib/client-9.mjs')),p8=await import(H('lib/properties-8.mjs')),p9=await import(H('lib/properties-9.mjs')),m8=await import(H('lib/metamorphic.mjs')),m9=await import(H('lib/metamorphic-9.mjs')),u=await import(H('lib/util.mjs'));
const dev=JSON.parse(fs.readFileSync(path.join(AUD,'harness/validation/DEV_CASES_R7D_9.json'),'utf8')),only=arg('--cases')?.split(',');
const cc=path.join(ROOT,'CoachingCore'),rt=await c9.loadRuntime(cc),ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const live=s=>!!s?.prescription&&s.status!=='SKIPPED',capped=s=>live(s)&&s.sport==='RUN'&&s.role!=='RACE'&&!['WALK','WALK_JOG'].includes(s.prescription?.family)&&Number.isFinite(s.prescription?.durationMinutes);
const rows=[];let silent=0,lostViolations=0;
for(const k of dev.cases.filter(c=>!only||only.includes(c.caseId))){
 const b8=c8.runCase(rt,k),b9=c9.runCase(rt,k),same=u.digestOf(b8.steps.map(s=>s.result))===u.digestOf(b9.steps.map(s=>s.result));
 const P8=p8.evaluateProperties(b8,ctx),P9=p9.evaluateProperties(b9,ctx);
 const R8=m8.runRelations(rt,k,b8,ctx,{only:['CARRIER_CLINICAL','CARRIER_HOLD']}),R9=m9.runRelations(rt,k,b9,ctx,{only:['CARRIER_CLINICAL','CARRIER_HOLD']});
 // Silent P06 drops on the HARNESS-9 run.
 const drops=[];
 b9.steps.forEach((s,i)=>{if(s.result.planValidity?.status!=='VALID_WITHIN_CURRENT_BOUNDED_SCOPE')return;const w=s.planAfter.weeks[s.weekIndex];if(!w)return;
  const L=(s.result.actualLedger??s.ledgerBefore??[]),rep=new Set(L.map(r=>r.sessionId));
  const today=w.sessions.filter(x=>capped(x)&&x.date>=s.asOfLocal&&rep.has(x.id)),rest=w.sessions.filter(x=>capped(x)&&x.date>=s.asOfLocal&&!rep.has(x.id));
  if(today.length&&rest.length)drops.push({at:s.stepId,sessions:today.map(x=>x.id),dates:today.map(x=>x.date),asOfLocal:s.asOfLocal});});
 silent+=drops.reduce((n,d)=>n+d.sessions.length,0);
 const v8=new Set([...P8.P03.violations,...P8.P06.violations].map(v=>`${v.at}|${v.week}|${v.sessionId??''}`)),v9=new Set([...P9.P03.violations,...P9.P06.violations].map(v=>`${v.at}|${v.week}|${v.sessionId??''}`));
 const ne9=new Set([...P9.P03.notEvaluable,...P9.P06.notEvaluable].map(x=>`${x.at}|${x.week}`));
 const lost=[...v8].filter(x=>!v9.has(x)&&!ne9.has(x.split('|').slice(0,2).join('|')));lostViolations+=lost.length;
 const pr=(P,R)=>({P03:`${P.P03.result}/${P.P03.units}/ne${P.P03.notEvaluable.length}`,P06:`${P.P06.result}/${P.P06.units}/ne${P.P06.notEvaluable.length}`,CC:`${(R.CARRIER_CLINICAL?.violations??[]).length?'FAIL':R.CARRIER_CLINICAL?.units?'PASS':'NE'}/${R.CARRIER_CLINICAL?.units??0}`,CH:`${(R.CARRIER_HOLD?.violations??[]).length?'FAIL':R.CARRIER_HOLD?.units?'PASS':'NE'}/${R.CARRIER_HOLD?.units??0}`});
 const a=pr(P8,R8),b=pr(P9,R9);
 rows.push({caseId:k.caseId,sameRuntimeOutputs:same,h8:a,h9:b,changed:JSON.stringify(a)!==JSON.stringify(b),silentP06Drops:drops,lostViolationsUnlisted:lost});
}
const changed=rows.filter(r=>r.changed);
console.log(JSON.stringify({cases:rows.length,allSameRuntimeOutputs:rows.every(r=>r.sameRuntimeOutputs),runtimeOutputsDiffer:rows.filter(r=>!r.sameRuntimeOutputs).map(r=>r.caseId),changedReadings:changed.map(r=>({caseId:r.caseId,h8:r.h8,h9:r.h9})),silentP06DropSessions:silent,casesWithSilentDrops:rows.filter(r=>r.silentP06Drops.length).map(r=>({caseId:r.caseId,drops:r.silentP06Drops})),lostViolationsUnlisted:lostViolations,lost:rows.filter(r=>r.lostViolationsUnlisted.length).map(r=>({caseId:r.caseId,lost:r.lostViolationsUnlisted}))},null,1));
