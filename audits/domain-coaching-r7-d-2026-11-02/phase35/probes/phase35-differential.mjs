// R7-D Phase 3.5 differential (CFR2-03: nothing else changes): every case of the diagnostic corpus (regression only), the generated diagnostic sample
// and the HARNESS-7 development cases, run through the same client on candidate 46934a0 and on the working-tree candidate. Decisions are compared step
// by step on the canonical decision and plan view (canonical.mjs: ids, free text and the record excluded). A differing case is explained only by one
// of the phase's own triggers, read on the 46934a0 run, at or before its first difference:
//  - SYSTEMIC (SSCTR-P34R2-F01): a return reading separate breaks re-enters a sport (TRAINING_AFTER, or OWN_RETURN with a re-entered sport) through a
//    week whose reports could converge adversely (performance UNDER, recovery ADVERSE, effort HARDER or next day IMPAIRED in two sports or three
//    sessions: a superset of the runtime's systemic rule);
//  - CORRECTION (SSCTR-P34R2-F02): a newer report (SAME_BREAK) of an interruption whose return read separate breaks, applied or asked;
//  - RESTATEMENT (QRE2-P34-01): a review stating a break that names an earlier break the latest return listed (its episode or report event id).
// Anything else is UNEXPLAINED and fails. The report records runtime labels, never local paths.
//   node phase35-differential.mjs --c46 <46934a0 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';
import {createHash} from 'node:crypto';
const srcOf=cc=>Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')]));

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const c46=arg('--c46'),out=arg('--out');if(!c46||!out)throw Error('--c46 <root> --out <file>');
const B=await loadRuntime(path.join(c46,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_7','harness/validation/DEV_CASES_R7D_7.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const added=s=>s.adopted?(s.planAfter.decisions??[]).slice((s.planBefore.decisions??[]).length):[];
const live=s=>!!s.prescription&&s.status!=='SKIPPED';
const mayBeAdverse=r=>!!r&&(r.response?.performance==='UNDER'||r.response?.recovery==='ADVERSE'||r.response?.effort==='HARDER'||r.response?.nextDayFunction==='IMPAIRED');
/** On the 46934a0 run: the steps where a trigger of this phase applies. */
function triggers(t){
 const out=[];
 t.steps.forEach((s,i)=>{
  const ledger=s.result.actualLedger??s.ledgerBefore??[],latest=x=>ledger.filter(o=>o.sessionId===x.id&&!o.superseded&&!o.conflicted).at(-1);
  // RESTATEMENT: the review states a break naming an earlier break the latest return (before this step) listed.
  const i0=s.review.interruption,name=typeof i0?.episodeId==='string'?i0.episodeId:null;
  const eps=(s.planBefore.decisions??[]).filter(d=>d.action==='REESTABLISH'),last=eps.at(-1)?.interruption;
  if(name&&(last?.separateBreaks??[]).some(b=>b.stop!=='LATEST'&&(b.episode===name||b.eventId===name)))out.push({i,id:s.stepId,kind:'RESTATEMENT'});
  // CORRECTION (asked or applied): a named report of the latest interruption whose return read separate breaks.
  if(name&&last&&(last.separateBreaks??[]).length>1&&(last.episode===name||eps.at(-1).eventId===name))out.push({i,id:s.stepId,kind:'CORRECTION'});
  const dec=added(s).filter(d=>d.action==='REESTABLISH').at(-1),ret=dec?.interruption;if(!ret?.separateBreaks)return;
  if(ret.relation==='SAME_BREAK'&&ret.supersedes)out.push({i,id:s.stepId,kind:'CORRECTION'});
  for(const b of ret.separateBreaks){
   const weeks=b.stop==='TRAINING_AFTER'?[b.reentryWeek]:b.stop==='OWN_RETURN'?[b.ownReturn?.reentered?.RUN,b.ownReturn?.reentered?.STRENGTH]:[];
   for(const ws of weeks.filter(x=>typeof x==='string')){const wk=(s.planBefore.weeks??[]).find(w=>w.startDate===ws);if(!wk)continue;
    const adv=wk.sessions.filter(live).flatMap(x=>mayBeAdverse(latest(x))?[x.sport]:[]);if(new Set(adv).size>1||adv.length>=3)out.push({i,id:s.stepId,kind:'SYSTEMIC',week:ws});}
  }
 });
 return out;
}
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(B,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null,firstIndex=-1;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen)){first='GENERATE';firstIndex=-1;}
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;firstIndex=i;break;}
  const trig=triggers(a),trigger=first&&firstIndex>=0?trig.find(x=>x.i<=firstIndex)??null:null,kinds=first&&firstIndex>=0?[...new Set(trig.filter(x=>x.i<=firstIndex).map(x=>x.kind))]:[];
  rows.push({corpus:label,caseId:kase.caseId,same:!first,firstDifference:first,trigger:trigger?{at:trigger.id,kind:trigger.kind}:null,triggers:trig.map(x=>({at:x.id,kind:x.kind})),kindsAtOrBeforeFirst:kinds,explained:!first||!!trigger,
   atFirst:first&&firstIndex>=0?{c46:va.steps[firstIndex]?.decision??null,candidate:vb.steps[firstIndex]?.decision??null}:null});
 }
}
const differing=rows.filter(r=>!r.same),unexplained=rows.filter(r=>!r.explained||r.error);
const report={probe:'R7D-PHASE35-DIFFERENTIAL-1',candidateSource:srcOf(path.join(REPO,'CoachingCore')),baselineSource:srcOf(path.join(c46,'CoachingCore')),baseline:'46934a0 (the Phase 3.4 candidate; never frozen)',candidate:'the working tree runtime',cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,unexplained:unexplained.map(r=>r.caseId),
 differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.firstDifference,trigger:r.trigger,kinds:r.kindsAtOrBeforeFirst})),
 byTrigger:Object.fromEntries(['SYSTEMIC','CORRECTION','RESTATEMENT'].map(k=>[k,differing.filter(r=>r.kindsAtOrBeforeFirst?.includes(k)).map(r=>r.caseId)])),rows};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,unexplained:report.unexplained,byTrigger:report.byTrigger},null,1));
process.exitCode=unexplained.length?1:0;
