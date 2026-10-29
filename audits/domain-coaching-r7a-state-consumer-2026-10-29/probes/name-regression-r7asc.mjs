// Author record builder (state model consumer closure, Founder §26): names the class of every regression difference against
// HISTORICAL-PROJECTION-FREEZE-1. Reads the regression (CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json) and the classifier's full listing of
// the prescriptions that changed (probes/runs/r7asc-classify-regression.out.json, bound by EVIDENCE_RUNS_R7ASC.json), assigns each differing
// case to exactly one named class, and refuses to write if any difference has none. Writes CoachingCore/r7/state-consumer/
// REGRESSION_R7ASC_NAMED.json only. Usage: node name-regression-r7asc.mjs
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'../../..'),abs=p=>path.join(repo,p),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8')),sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');
const REG='CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json',CLS='audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/runs/r7asc-classify-regression.out.json';
const reg=json(REG),cls=json(CLS);
const CLASSES=[
 {id:'EARNED_REPETITIONS',finding:'F2; R42',why:'A new load starts with the repetitions its gate allows: ADVANCE the logged repetitions, HOLD and REGRESS the row\'s target, so HOLD repeats the dose it held. The credit restarts at 0 whoever set the higher load (R42)',cases:['R6-H22','R6-H24','R6-H33']},
 {id:'GOAL_RANGE_CUT',finding:'F3',why:'Every row of a known dose carries a repetition target inside the current goal\'s range, as the KNOWN row already did: a goal change to MAINTAIN (8-8) or STRENGTH (4-6) no longer leaves a from-log 10 or 12',cases:['R6-H18','R6-H25','sim:T08_NOVICE8_MODERATE_INTERRUPTION']},
 {id:'HOLD_REPEATS_DOSE',finding:'F2; Property D',why:'Restored to the rows of STATE-EVIDENCE-FREEZE-1: a past week\'s gate counts only the logs up to its own clock, so later short sets no longer regress an earlier week, and a held dose is repeated',cases:['sim:T04_STRENGTH12_REPEATED_UNDERPERFORMANCE','sim:T13_HM16_FATIGUE_SIGNALS']},
 {id:'RETURN_WEEK_SUMMARY',finding:'NF-R7ASM-1; Property A',why:'A return\'s own week is read with the summary of the sessions after the return\'s point: runs planned inside the pause (here pre-return strides) are never credited as run, so the next decision instantiates the logged loads instead of keeping',cases:['sim:T05_10K8_SHORT_INTERRUPTION']},
 {id:'PLANNED_SUMMARY_BOOKKEEPING',finding:'none (record only)',why:'Only the stored prescription summary differs: plannedOf now states the re-entry dose a week prescribed (planned.returnStep / restart / walkStep) so the run steps can read it; no prescription, row or decision changes',cases:[]}
];
const differing=Object.entries(cls.cases).filter(([,v])=>!v.identicalAfterBookkeeping).map(([k])=>k);
const rawDifferent=[...reg.summary.r6FreshHoldout.different,...reg.summary.r5Corpus.different,...reg.summary.profiles.different.map(x=>'profile:'+x),...reg.summary.simulations.different.map(x=>'sim:'+x)];
const named=new Set(CLASSES.flatMap(c=>c.cases));
const bookkeeping=rawDifferent.filter(k=>!differing.includes(k));CLASSES.at(-1).cases=bookkeeping;
const unclassified=differing.filter(k=>!named.has(k)),stale=[...named].filter(k=>!differing.includes(k));
const bookkeepingNotIdentical=bookkeeping.filter(k=>cls.cases[k]&&!cls.cases[k].identicalAfterBookkeeping);
const dose=Object.fromEntries(CLASSES.map(c=>[c.id,{risen:c.cases.flatMap(k=>(cls.cases[k]?.risen??[]).map(r=>({case:k,...r}))),fallen:c.cases.reduce((n,k)=>n+(cls.cases[k]?.fallen?.length??0),0)}]));
const risenTotal=Object.values(dose).reduce((n,d)=>n+d.risen.length,0),fallenTotal=Object.values(dose).reduce((n,d)=>n+d.fallen,0);
const statusChanged=Object.entries(cls.cases).filter(([,v])=>v.status&&v.status.before!==v.status.now).map(([k,v])=>`${k}: ${v.status.before} -> ${v.status.now}`);
const out={revision:'R7ASC-REGRESSION-NAMED-1',generatedAt:new Date().toISOString(),
 source:{regression:{path:REG,sha256:sha(REG)},classifier:{path:CLS,sha256:sha(CLS),prior:cls.prior}},
 summary:reg.summary,againstApprovedFreeze:reg.againstApprovedFreeze.summary,
 classes:CLASSES.map(c=>({...c,risen:dose[c.id].risen.length,fallen:dose[c.id].fallen})),
 unclassified,staleClassEntries:stale,bookkeepingNotIdentical,
 dose:Object.fromEntries(Object.entries(dose).map(([k,v])=>[k,{risen:v.risen,fallen:v.fallen}])),statusChanged,
 verdict:{casesTotal:Object.keys(cls.cases).length,casesDifferentRaw:rawDifferent.length,casesDifferentAfterBookkeeping:differing.length,doseFieldsRisen:risenTotal,doseFieldsFallen:fallenTotal,unclassifiedDifferences:unclassified.length+stale.length+bookkeepingNotIdentical.length}};
if(out.verdict.unclassifiedDifferences)throw Error('Unnamed regression differences: '+JSON.stringify({unclassified,stale,bookkeepingNotIdentical}));
fs.writeFileSync(abs('CoachingCore/r7/state-consumer/REGRESSION_R7ASC_NAMED.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({verdict:out.verdict,classes:out.classes.map(c=>({id:c.id,cases:c.cases.length,risen:c.risen,fallen:c.fallen})),statusChanged},null,1));
