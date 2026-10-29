// Author probe (R7-A DECISION AUTHORITY, Founder request §24, §35): names every difference between the candidate and STATE-MODEL-CONSUMER-FREEZE-1
// on the SSCTR's own regression kit (probes/kit-final against the state consumer closure's kit-final) and on every earlier judge probe
// (probes/judges against that closure's runs). An output is the same when its bytes are, or when only the machine path or the wall clock
// (`root`, `runtime`, `at`) differs; any other difference needs the named cause listed below, with the evidence that names it. Writes
// probes/NAMED_DIFFERENCES_R7ADA.json; exits 1 when a difference has no name.
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),PRIOR='audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/';
const read=p=>{try{return JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));}catch{return null;}};
const strip=x=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['root','runtime','at'].includes(k)).map(([k,v])=>[k,strip(v)])):typeof x==='string'?x.replace(/[A-Z]:[\\/][^"]*?MyApp[\\/]/g,'<repo>/').replace(/\/home\/user\/MyApp\//g,'<repo>/').replace(/\\\\/g,'/'):x;
const NAMED={
 kit:{
  changes:{cause:'RETURN_WEEK_E7 (contract B2) with GATE_ORDER (C3)',evidence:'A_E6, second SHORT break inside a return. The return entries are identical. The review closing the return week holds, and the planner keeps the pre-break tick, so the bench reaches 20 kg after one fully executed week (week 9; the predecessor reached it in week 10, after history spent the tick on a release never lifted). The regain caps persist one more week (2x6 where the predecessor gave 3x6), conservative under D56. Ruling point R3'},
  'holdout-detail':{cause:'RUN_VIEW_FROM_EVIDENCE (C1, C2)',evidence:'Holdout variant: weeks before a case\'s first step are never reported and earn no run progression. Full-record variant: only weeks before the first step\'s week are filled, so the rest stay unreported (R6-H24 week 3). R6-H35 has no week-5 quality session (see regression)'},
  'r12-instrument':{cause:'RUN_VIEW_FROM_EVIDENCE (C1, C2); one section restored',evidence:'V_D47reviews now equals the instrument\'s own round-10/11 record (it differed on the predecessor). AF_skippedReviews (weeks 4-8 unreviewed) runs at the earned dose. The round-11 runtime check fails identically on both trees (its own path guard)'},
  regression:{cause:'RUN_VIEW_FROM_EVIDENCE (C1, C2): R6-H35 runner error',evidence:'R6-H35: the fixture\'s week-5 QUALITY fact matches no session because weeks 0-3 are never reported and QUALITY is not unlocked. CoachingCore/r7/decision-authority/REGRESSION_R7ADA_NAMED.json, ablation: reverting RUN_VIEW_FROM_EVIDENCE alone restores the case'},
  'x-trace-sd':{cause:'GATE_ORDER / RETURN_WEEK_E7: the closing review keeps the stored start',evidence:'Rows identical; only the stored start of week 10 keeps regainCap 3 for db-row and db-bench-press (equal to the sets prescribed), as in kit "changes"'}},
 judges:{
  'qe-r7ab-P40b':{cause:'RUN_VIEW_FROM_EVIDENCE (C1, C2)',evidence:'Cell 8 U: the review after an unreviewed week now instantiates logged loads (its evidence start differs from the stored projection), so the next start is WEEK_EVIDENCE. QE-R7AB-01\'s criterion (a projected load never becomes history) is unchanged'},
  'qe-r7ase-I01':{cause:'RUN_VIEW_FROM_EVIDENCE (C1, C2)',evidence:'U cells (week F unreviewed): the stored run start two weeks on is the earned one (long 65, qualityStep 0, easyWeeksDone 2) instead of the projection\'s (70, 1, 3)'},
  'qe-r7asm-Q3-known-row-setup':{cause:'REPLAN_ON_CORRECTION (A3) / FACTUAL_AUTHORITY (A1)',evidence:'LATE cell: the correction arriving after week 2 was planned re-plans week 2\'s Saturday row from KNOWN 20 into a first establishment, as the EARLY cell already prescribed. QE-R7ASM-01\'s criterion (no KNOWN load becomes history) is unchanged'},
  'qe-r7asm-Q12-robustness':{cause:'FACTUAL_AUTHORITY (A1, A3)',evidence:'a_factsOnly: week 2\'s row for an exercise history holds without a known load is a first establishment, not KNOWN 20'}}};
const compare=(prior,cur,list,named)=>list.map(name=>{const a=read(prior+name+'.out.json'),b=read(cur+name+'.out.json'),ra=fs.existsSync(path.join(repo,prior,name+'.out.json'))?fs.readFileSync(path.join(repo,prior,name+'.out.json')):null,rb=fs.existsSync(path.join(repo,cur,name+'.out.json'))?fs.readFileSync(path.join(repo,cur,name+'.out.json')):null;
 const bytes=ra&&rb&&ra.equals(rb),same=bytes||(a&&b&&JSON.stringify(strip(a))===JSON.stringify(strip(b)));
 return {name,identicalBytes:!!bytes,identicalExceptPathOrClock:!bytes&&!!same,...(same?{}:{named:named[name]??null})};});
const kitPrior=read(PRIOR+'kit-final/RUNS.json'),kitCur=read('audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final/RUNS.json');
const kit=compare(PRIOR+'kit-final/','audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final/',kitCur.runs.map(r=>r.name),NAMED.kit).map(x=>({...x,exit:{predecessor:kitPrior.runs.find(r=>r.name===x.name)?.exit??null,candidate:kitCur.runs.find(r=>r.name===x.name)?.exit??null}}));
const jCur=read('audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/judges/RUNS.json');
const judges=compare(PRIOR+'runs/','audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/judges/',jCur.results.map(r=>r.name),NAMED.judges).map(x=>({...x,exit:jCur.results.find(r=>r.name===x.name)?.exit??null}));
const unnamed=[...kit,...judges].filter(x=>!x.identicalBytes&&!x.identicalExceptPathOrClock&&!x.named).map(x=>x.name);
const out={revision:'R7ADA-NAMED-DIFFERENCES-1',rule:'Same bytes, or the same output once the machine path and wall clock are set aside; otherwise a named cause. Every failing kit instrument is named.',
 kit:{instruments:kit.length,identicalBytes:kit.filter(x=>x.identicalBytes).length,identicalExceptPathOrClock:kit.filter(x=>x.identicalExceptPathOrClock).length,named:kit.filter(x=>x.named).map(x=>x.name),failingOnCandidate:kit.filter(x=>x.exit.candidate!==0).map(x=>x.name),boundTo:[...new Set(kitCur.runs.flatMap(r=>[r.sourceDigestStart,r.sourceDigestEnd]))],items:kit},
 judges:{probes:judges.length,identicalBytes:judges.filter(x=>x.identicalBytes).length,identicalExceptPathOrClock:judges.filter(x=>x.identicalExceptPathOrClock).length,named:judges.filter(x=>x.named).map(x=>x.name),failing:judges.filter(x=>x.exit!==0).map(x=>x.name),items:judges},
 unnamed};
fs.writeFileSync(path.join(here,'NAMED_DIFFERENCES_R7ADA.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({kit:{...out.kit,items:undefined},judges:{...out.judges,items:undefined},unnamed},null,1));
process.exitCode=unnamed.length?1:0;
