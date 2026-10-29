// Classifies every difference the regression found against STATE-EVIDENCE-FREEZE-1 into the named causes of this mission's change, and counts
// whether any prescribed dose rose. Reads CoachingCore/r7/state-model/REGRESSION_R7ASM.json; writes REGRESSION_R7ASM_NAMED.json next to it.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../..');
const R=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r7/state-model/REGRESSION_R7ASM.json'),'utf8'));
const CLASSES=[
 ['NEVER_ESTABLISHED_EXERCISE','An exercise the evidence never established is not in the PlanningView, so its next exposure establishes the load by effort again (SSCTR D52) instead of carrying the projection\'s established state',
  d=>/No usable load was logged last time/.test(String(d.before))||/"mode":"FROM_LOG","load":null/.test(String(d.before))&&String(d.current)==='null'||/\/load\/mode$/.test(d.path)&&/"KNOWN"|"FROM_LOG"/.test(String(d.before))&&d.current==='"ESTABLISH"'||/\/establishment$/.test(d.path)&&d.current==='true'||/\/load\/convention$/.test(d.path)],
 ['RUN_CAPABILITY_FROM_HISTORY','The run\'s achieved peaks and longest continuous run come from HistoricalState, so the taper, race-day completion and redevelopment read what was executed',
  d=>/\/run\/(achieved|longestContinuous)/.test(d.path)||/\/(role|key|essential)$/.test(d.path)&&/LONG|true/.test(String(d.before))||/\/prescription\/(strides|effort|effortDomain|calibration)/.test(d.path)||/\/explanation$/.test(d.path)&&/achieved peak|Taper/.test(String(d.before))],
 ['EARNED_PROGRESS_R42','R42: no progression credit is carried across a load change, in the plan as in history, so a load step can come one successful exposure later',
  d=>/\/load\/value$/.test(d.path)&&Number.isFinite(Number(d.before))&&Number.isFinite(Number(d.current))&&Number(d.current)<Number(d.before)||/loadTick/.test(d.path)],
 ['DECISION_FROM_VIEW','A decision reads the PlanningView instead of the stored projection, so its own week\'s rows, its move admissibility and its counterfactuals follow executed history',
  d=>/counterfactuals|\/proposal$|whyLost|admissible|selected|\/reason$|\/action$|\/status$|instantiationOnly|nextObservation|\/revision$|\/gates\//.test(d.path)],
 ['ROW_SHAPE','The row that follows a changed state: its sets, repetitions, duration, totals, instructions or family, including the simulation\'s row strings',
  d=>/\/(sets|reps|durationMinutes|warmupMinutes|cooldownMinutes|plannedStrengthSets|plannedRunMinutes|instructions|family|rir|rule|role|key|essential)\b/.test(d.path)||/\/exercises\/\d+$/.test(d.path)||/\/progression\/value$/.test(d.path)||/\/finalWeeks\/\d+\/sessions\/\d+$/.test(d.path)||/\/summary\/strengthSets\//.test(d.path)||/\/horizons$/.test(d.path)||/\/resolutions\//.test(d.path)],
 ['STATE_BOOKKEEPING','State atoms that follow from the classes above: the blocks an exercise earned, the week\'s planned counts, the last executed count, the context label an observation carries, and the exercises a state holds',
  d=>/\/(blocksDone|lastExecutedSets|setCap|regainCap|setCeiling|priorSets|devCount|loadTick|unlogged|pendingLoad|source|status)$/.test(d.path)||/\/strength\/planned\//.test(d.path)||/\/strength\/exercises\/[^/]+$/.test(d.path)||/\/actualLedger\/\d+\/context\//.test(d.path)||/\/(achieved|longestContinuous|easyWeeksDone|qualityStep|qualityDone|stridesDone|thresholdDone|specificStep|easy|long|walks|modeHistory)$/.test(d.path)]
];
const num=x=>{const v=Number(String(x).replace(/"/g,''));return Number.isFinite(v)?v:null;};
const DOSE=/\/(sets|reps)$|\/load\/value$|\/durationMinutes$|\/plannedStrengthSets$|\/plannedRunMinutes$/;
const out={revision:'R7ASM-REGRESSION-NAMED-1',generatedAt:new Date().toISOString(),source:'CoachingCore/r7/state-model/REGRESSION_R7ASM.json',
 summary:R.summary,classes:CLASSES.map(([id,why])=>({id,why,cases:[],differences:0})),unclassified:[],dose:{rose:[],fell:0,equal:0}};
const all=[...R.r6FreshHoldout.map(c=>({corpus:'R6 holdout',...c})),...R.r5Corpus.map(c=>({corpus:'R5',...c})),...R.profiles.map(c=>({corpus:'profiles',...c})),...R.simulations.map(c=>({corpus:'simulations',...c}))];
for(const c of all){
 if(c.identical)continue;
 const id=c.caseId??c.label;
 for(const d of c.differences??[]){
  const hit=CLASSES.find(([,,test])=>{try{return test(d);}catch{return false;}});
  if(hit){const e=out.classes.find(x=>x.id===hit[0]);e.differences++;if(!e.cases.includes(id))e.cases.push(id);}
  else out.unclassified.push({case:id,path:d.path,before:String(d.before).slice(0,120),current:String(d.current).slice(0,120)});
  if(DOSE.test(d.path)){const a=num(d.before),b=num(d.current);
   if(a!==null&&b!==null){if(b>a)out.dose.rose.push({case:id,path:d.path,before:a,current:b});else if(b<a)out.dose.fell++;else out.dose.equal++;}}
 }
}
out.statusChanged=all.filter(c=>!c.identical&&c.before!==undefined&&c.before!==c.current).map(c=>({case:c.caseId,before:c.before,current:c.current}));
out.verdict={casesDifferent:all.filter(c=>!c.identical).length,casesTotal:all.length,doseFieldsRisen:out.dose.rose.length,doseFieldsFallen:out.dose.fell,unclassifiedDifferences:out.unclassified.length};
fs.writeFileSync(path.join(root,'CoachingCore/r7/state-model/REGRESSION_R7ASM_NAMED.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({verdict:out.verdict,classes:out.classes.map(c=>({id:c.id,cases:c.cases.length,differences:c.differences})),rose:out.dose.rose.slice(0,12),unclassified:out.unclassified.slice(0,10)},null,1));
