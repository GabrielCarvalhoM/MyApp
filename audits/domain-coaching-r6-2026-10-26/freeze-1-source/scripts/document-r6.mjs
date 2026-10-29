import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {r6Authority,loadR6Policy} from '../src/r6-authority.mjs';
import {generateProgram} from '../src/r6-program.mjs';
import {hash} from '../src/value.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

/**
 * Evidence-bound topic deliverables (*.json) for R6. Each one names its reviewed boundaries, the runtime that binds them,
 * policy values, and pointers to tests, demonstrations, trajectories, R5 regression cases and fresh-holdout cases with
 * their independent classifications. Narrative belongs to the matching .md; judgment-only files are written by hand.
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),R6='CoachingCore/r6/',REVIEWS='audits/domain-coaching-r6-2026-10-26/reviews/';
const readJson=p=>fs.existsSync(abs(p))?JSON.parse(fs.readFileSync(abs(p),'utf8')):null;
const sha=p=>fs.existsSync(abs(p))?createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'):null;
const testNames=()=>fs.readdirSync(abs('CoachingCore/test')).filter(n=>/^r6-.*\.test\.mjs$/.test(n)).flatMap(n=>[...fs.readFileSync(abs('CoachingCore/test/'+n),'utf8').matchAll(/^test\('([^']+)'/gm)].map(m=>({file:'CoachingCore/test/'+n,name:m[1]})));
const TOPICS={
 BALANCED_HYBRID_R6:{boundaries:['R6-HYBRID-ARRANGEMENT'],policy:['hybrid'],runtime:{'src/r6-balanced.mjs':['interferenceCosts','horizonCosts','chooseBalanced'],'src/r6-program.mjs':['arrangementCandidates'],'src/r6-adaptation.mjs':['rebuild','learnedInterference']},tests:/^Balanced|^Interference model|BALANCED_|UNKNOWN_COMBINED_TOLERANCE|hybrid thresholds/,demonstrations:['C','D','M'],trajectories:['T03_BALANCED12_OVERPERFORMANCE','T07_GENERAL8_SCHEDULE_AND_EQUIPMENT'],r5Cases:['R5-H03','R5-H11','R5-H20','R5-H21'],families:/balanced|hybrid|conflict|arrangement/i},
 COLD_START_ENGINE_R6:{boundaries:['R6-COLD-START','R6-LOAD-ESTABLISHMENT'],policy:['establishment'],runtime:{'src/r6-intake.mjs':['canonicalizeIntake'],'src/r6-program.mjs':['assessCapability','buildGoalModel'],'src/r6-catalogue.mjs':['candidatesFor']},tests:/^R6 intake|^R6 cold start|^Cold start/,demonstrations:['A','B','C'],trajectories:['T06_LOWDATA8_WALKJOG_EARNED','T11_BODYWEIGHT4_ESTABLISHMENT','T12_RESTART8','T14_WALKJOG4_FIVE_DAYS'],r5Cases:['R5-H04','R5-H05','R5-H06'],families:/cold|onboarding|intake|novice|low.?data|wearable|establish/i,profiles:true},
 INITIAL_PROGRAM_GENERATION_R6:{boundaries:['R6-COLD-START','R6-PLANNED-PROGRESSION','R6-HYBRID-ARRANGEMENT','R6-EVENT-TRANSITION'],policy:['establishment','run','strength'],runtime:{'src/r6-program.mjs':['planPhases','blocksFrom','strengthTemplates','arrangementCandidates','projectWeeks','validateWeeks','generateProgram']},tests:/core profiles|week 1 never exceeds|fails closed|without prebuilt/,demonstrations:['A','B','C'],trajectories:['T01_HM16_STRONG_ADHERENCE','T11_BODYWEIGHT4_ESTABLISHMENT'],r5Cases:['R5-H01','R5-H02','R5-H09','R5-H13','R5-H24'],families:/generat|cold|whole.?program|program/i,profiles:true},
 RUN_PROGRAMMING_R6:{boundaries:['R6-PLANNED-PROGRESSION','R6-RUN-QUALITY'],policy:['run'],runtime:{'src/r6-program.mjs':['initialRunState','advanceRun','distributeRun','familiarQualityTask'],'src/r6-prescription.mjs':['walkPrescription','walkJogPrescription','easyPrescription','qualityPrescription','reducedWork']},tests:/run programming|familiar quality|missed long run|missed key run|earn one extra step/,demonstrations:['A','E','I','L'],trajectories:['T01_HM16_STRONG_ADHERENCE','T02_HM16_IRREGULAR_ADHERENCE','T06_LOWDATA8_WALKJOG_EARNED','T10_10K12_SPECIFIC_MISSED_AND_POST_EVENT','T14_WALKJOG4_FIVE_DAYS'],r5Cases:['R5-H08','R5-H10','R5-H12','R5-H14'],families:/run|walk|long|quality|10k|half/i},
 STRENGTH_PROGRAMMING_R6:{boundaries:['R6-LOAD-ESTABLISHMENT','R6-PLANNED-PROGRESSION','R6-ROTATION'],policy:['strength','rotation'],runtime:{'src/r6-program.mjs':['strengthTemplates','strengthDose','advanceStrength'],'src/r6-prescription.mjs':['exerciseRow','fitStrengthSession','strengthPrescription'],'src/r6-catalogue.mjs':['candidatesFor']},tests:/unknown loads|VALIDATION_COUPLED|repeated adverse|strength/i,demonstrations:['B','F','H'],trajectories:['T04_STRENGTH12_REPEATED_UNDERPERFORMANCE','T11_BODYWEIGHT4_ESTABLISHMENT'],r5Cases:['R5-H02','R5-H09','R5-H13'],families:/strength|load|lift|hypertrophy/i},
 HYBRID_PROGRAMMING_R6:{boundaries:['R6-HYBRID-ARRANGEMENT','R6-PLANNED-PROGRESSION'],policy:['hybrid'],runtime:{'src/r6-program.mjs':['buildGoalModel','contextOf','arrangementCandidates'],'src/r6-balanced.mjs':['chooseBalanced']},tests:/static priority|shifts only matter|learned rearrangement/,demonstrations:['C','D','M'],trajectories:['T03_BALANCED12_OVERPERFORMANCE','T07_GENERAL8_SCHEDULE_AND_EQUIPMENT','T13_HM16_FATIGUE_SIGNALS'],r5Cases:['R5-H18','R5-H20','R5-H21'],families:/hybrid|balanced|schedule|double|shift/i},
 SUBSTITUTION_ENGINE_R6:{boundaries:['R6-SUBSTITUTION'],policy:[],runtime:{'src/r6-adaptation.mjs':['equipmentChange'],'src/r6-catalogue.mjs':['substitutesFor'],'src/r6-legacy.mjs':['legacyCandidates']},tests:/substitut|SUBSTITUTION_NOT_SELECTED/i,demonstrations:['J'],trajectories:['T07_GENERAL8_SCHEDULE_AND_EQUIPMENT'],r5Cases:['R5-H19'],families:/substitut|equipment|travel/i},
 RETURN_ENGINE_R6:{boundaries:['R6-NONCLINICAL-RETURN'],policy:['return'],runtime:{'src/r6-adaptation.mjs':['returnAfterPause'],'src/r6-program.mjs':['initialRunState','advanceRun','strengthDose']},tests:/return|RETURN_PREPARATION|clinical/i,demonstrations:['K'],trajectories:['T05_10K8_SHORT_INTERRUPTION','T08_NOVICE8_MODERATE_INTERRUPTION','T12_RESTART8'],r5Cases:['R5-H15','R5-H16','R5-H17'],families:/return|pause|interrupt|restart|clinical/i},
 EVENT_TRANSITION_R6:{boundaries:['R6-EVENT-TRANSITION'],policy:['event'],runtime:{'src/r6-program.mjs':['planPhases','buildWeek'],'src/r6-adaptation.mjs':['goalChange','eventWeekConflict'],'src/r6-legacy.mjs':['eventTransform']},tests:/event transition|Event transition|event date|race/i,demonstrations:['L'],trajectories:['T01_HM16_STRONG_ADHERENCE','T10_10K12_SPECIFIC_MISSED_AND_POST_EVENT'],r5Cases:['R5-H01','R5-H22'],families:/event|race|taper|10k|half/i},
 ADAPTIVE_COACHING_R6:{boundaries:['R6-PLANNED-PROGRESSION','R6-PARTIAL-NOISY-LEARNING','R6-SUBSTITUTION','R6-NONCLINICAL-RETURN','R6-EVENT-TRANSITION','R6-HYBRID-ARRANGEMENT'],policy:['learning'],runtime:{'src/r6-adaptation.mjs':['evaluateProgram','weeklyReview','weeklyGates','missedSession','performanceSignal','fatigue','scheduleChange','unavailableDay','doubleConflict','equipmentChange','goalChange','returnAfterPause','eventWeekConflict'],'src/r6-simulator.mjs':['simulateProgram']},tests:/^Adaptation|^Simulation/,demonstrations:['E','F','G','H','I','J','K','L','M'],trajectories:'ALL',r5Cases:['R5-H07','R5-H08','R5-H10','R5-H11','R5-H12','R5-H13','R5-H14','R5-H16','R5-H18','R5-H19','R5-H20','R5-H23','R5-H24'],families:/./},
 ATHLETE_MODEL_R6:{boundaries:['R6-PARTIAL-NOISY-LEARNING'],policy:['learning'],runtime:{'src/r6-learning.mjs':['createLearningModel','updateLearningModel','evidenceFor','preferredArrangement','classify'],'src/r6-adaptation.mjs':['learnedInterference']},tests:/^Learning|learned rearrangement|earn|repeated adverse/,demonstrations:['G','H','I','M'],trajectories:['T03_BALANCED12_OVERPERFORMANCE','T09_PARTIAL_WEARABLE12_NOISY'],r5Cases:['R5-H08','R5-H12','R5-H14','R5-H21','R5-H23'],families:/learn|history|partial|noisy|wearable|over|under/i},
 PROVENANCE_TIME_R6:{boundaries:['R6-PARTIAL-NOISY-LEARNING'],policy:['learning'],runtime:{'src/r6-provenance.mjs':['utcTimestamp','normalizeObservations','localDate'],'scripts/evaluate-holdout-r6.mjs':['factObservation','nativeObservation']},tests:/^Provenance|ADAPTER_CLOCK|^Adapter|duplicates|chronology|STALE_ALTERNATIVE/,demonstrations:['G'],trajectories:['T09_PARTIAL_WEARABLE12_NOISY'],r5Cases:['R5-H07','R5-H08','R5-H10','R5-H11','R5-H24'],families:/provenance|time|clock|duplicate|stale|timezone|future|wearable/i,coverage:{clockSkew:/clock skew/,timezone:/timezone/i,outOfOrder:/out-of-order/,futureObservation:/future/,duplicates:/duplicat/,staleEvents:/stale/}}
};
const profileOutcomes=options=>Object.entries({...PROFILES,...EDGE_PROFILES}).map(([id,input])=>{const r=generateProgram(input,options);return {profile:id,status:r.status,reason:r.reason,missingInputs:r.missingInputs,capability:r.program?{run:r.program.capability.run.class,strength:r.program.capability.strength.class}:null,weeks:r.program?.weeks.length??null,phases:r.program?.phases.phases??null,weeklyRunMinutes:r.program?.weeks.map(w=>w.plannedRunMinutes)??null,weeklyStrengthSets:r.program?.weeks.map(w=>w.plannedStrengthSets)??null,unknowns:(r.uncertainty??[]).map(u=>({field:u.field,category:u.category}))};});
export function buildTopics(options={},{dev=false}={}){
 const authority=r6Authority(options),policy=loadR6Policy(),tests=testNames();
 const suffix=dev?'.dev.json':'.json',sim=readJson(R6+'SIMULATION_RESULTS_R6'+suffix),demos=readJson(R6+'DEMONSTRATIONS_R6'+suffix),replay=readJson(R6+'R5_HOLDOUT_REPLAY_R6'+suffix);
 const freeze=readJson(R6+'RUNTIME_FREEZE_R6.json'),ssctr=readJson(REVIEWS+'ssctr-policy-review.json'),r5Review=readJson(REVIEWS+'r5-regression-review.json'),holdout=readJson(R6+'holdout/R6_INDEPENDENT_HOLDOUT.json'),coaching=readJson(REVIEWS+'coaching-quality-holdout-review.json');
 const ssctrRecord=id=>(ssctr?.records??ssctr?.boundaries??[]).find(r=>r.boundaryId===id)??null;
 const classOf=(review,caseId)=>review?.cases?.find(c=>c.caseId===caseId)??null;
 const out={};
 for(const [topic,cfg] of Object.entries(TOPICS)){
  const trajectories=sim?(cfg.trajectories==='ALL'?sim.rows:sim.rows.filter(r=>cfg.trajectories.includes(r.id))):[];
  const holdoutCases=holdout?holdout.cases.filter(c=>cfg.families.test(String(c.family??''))||cfg.families.test(String(c.scenario??''))).map(c=>({caseId:c.caseId,family:c.family,classification:classOf(coaching,c.caseId)?.quality??classOf(coaching,c.caseId)?.classification??'PENDING_INDEPENDENT_REVIEW'})):[];
  const doc={revision:'R6-DELIVERABLE-1',topic,generatedAt:new Date().toISOString(),authority:dev?'DEV_TEST_ONLY':'CURRENT_INDEPENDENT_REVIEW',policyHash:hash(policy),sourceDigest:freeze?.sourceDigest??null,
   boundaries:cfg.boundaries.map(id=>({boundaryId:id,enabled:authority.approved?.[id]??null,ssctr:ssctrRecord(id)?{disposition:ssctrRecord(id).disposition,evidence:ssctrRecord(id).evidenceStrength??ssctrRecord(id).evidence??null,conditions:ssctrRecord(id).conditions??null}:null,envelope:policy.boundaries?.[id]??null})),
   policyValues:Object.fromEntries(cfg.policy.map(k=>[k,policy.operational?.[k]??null])),
   runtime:Object.entries(cfg.runtime).map(([file,functions])=>({file:'CoachingCore/'+file,functions,sha256:sha('CoachingCore/'+file)})),
   evidence:{tests:tests.filter(t=>cfg.tests.test(t.name)),demonstrations:(demos?.demonstrations??[]).filter(d=>cfg.demonstrations.includes(d.id)).map(d=>({id:d.id,title:d.title,selected:d.selectedOption?.id??d.selectedOption?.action??null})),
    trajectories:trajectories.map(t=>({id:t.id,horizon:t.horizon,allInvariantsHold:t.allInvariantsHold,actions:t.summary?.actions??null})),
    r5Regression:cfg.r5Cases.map(id=>{const row=replay?.rows.find(r=>r.caseId===id),rev=classOf(r5Review,id);return {caseId:id,r5Classification:row?.r5Classification??null,rootCause:row?.rootCause??null,resultR6:row?.resultR6??null,classificationR6:rev?.classificationR6??rev?.quality??'PENDING_INDEPENDENT_REVIEW'};}),
    freshHoldout:holdoutCases},
   ...(cfg.coverage?{coverage:Object.fromEntries(Object.entries(cfg.coverage).map(([k,re])=>[k,tests.filter(t=>re.test(t.name)).map(t=>t.name)]))}:{}),
   ...(cfg.profiles?{profileOutcomes:profileOutcomes(options)}:{}),
   inputs:{simulation:sim?R6+'SIMULATION_RESULTS_R6'+suffix:null,demonstrations:demos?R6+'DEMONSTRATIONS_R6'+suffix:null,r5Replay:replay?R6+'R5_HOLDOUT_REPLAY_R6'+suffix:null,ssctrReview:ssctr?REVIEWS+'ssctr-policy-review.json':null,r5RegressionReview:r5Review?REVIEWS+'r5-regression-review.json':null,coachingReview:coaching?REVIEWS+'coaching-quality-holdout-review.json':null}};
  out[topic]=doc;
 }
 return out;
}
/** R5 holdout regression deliverable: the raw replay joined with the independent classification. */
export function buildR5Regression({dev=false}={}){
 const replay=readJson(R6+'R5_HOLDOUT_REPLAY_R6'+(dev?'.dev.json':'.json')),review=readJson(REVIEWS+'r5-regression-review.json'),freeze=readJson(R6+'RUNTIME_FREEZE_R6.json');
 if(!replay)return null;
 const rc=id=>review?.cases?.find(c=>c.caseId===id);
 return {revision:'R6-DELIVERABLE-1',topic:'R5_HOLDOUT_REGRESSION_R6',generatedAt:new Date().toISOString(),scope:'Frozen R5 holdout replayed through the frozen R6 runtime with unchanged facts; development regression, never fresh holdout evidence',
  authority:replay.authority,policyHash:replay.policyHash,sourceDigest:freeze?.sourceDigest??null,corpusSha256:replay.corpusSha256,r5FirstRawSha256:replay.r5FirstRawSha256,
  replay:{path:R6+'R5_HOLDOUT_REPLAY_R6.json',sha256:sha(R6+'R5_HOLDOUT_REPLAY_R6.json')},
  review:review?{path:REVIEWS+'r5-regression-review.json',sha256:sha(REVIEWS+'r5-regression-review.json'),evaluator:review.evaluator,independent:review.independent,gate:review.verdict?.regressionGate??null}:null,
  distributionBefore:review?.distributionBefore??null,distributionAfter:review?.distributionAfter??null,
  cases:replay.rows.map(r=>({caseId:r.caseId,r5Classification:r.r5Classification,classificationR6:rc(r.caseId)?.classificationR6??'PENDING_INDEPENDENT_REVIEW',changed:rc(r.caseId)?.changed??null,rootCause:r.rootCause,rootCauseConfirmed:rc(r.caseId)?.rootCauseConfirmed??null,generationR6:r.generationR6?.status??null,stepsR6:r.stepsR6.map(s=>s.status+'/'+s.action),reason:rc(r.caseId)?.reason??null})),
  regressions:review?.regressions??null,findings:review?.findings??null,limitations:review?.limitations??null};
}
const main=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename);
if(main){
 const dev=process.argv.includes('--dev'),options=dev?{authority:devAuthority()}:{},outDir=process.argv.find(a=>a.startsWith('--out='))?.slice(6)??abs(R6);
 const topics=buildTopics(options,{dev});
 for(const [topic,doc] of Object.entries(topics))fs.writeFileSync(path.join(outDir,topic+(dev?'.dev.json':'.json')),JSON.stringify(doc,null,2)+'\n');
 const r5=buildR5Regression({dev});if(r5)fs.writeFileSync(path.join(outDir,'R5_HOLDOUT_REGRESSION_R6'+(dev?'.dev.json':'.json')),JSON.stringify(r5,null,2)+'\n');
 console.log(JSON.stringify({topics:Object.keys(topics),outDir,authority:dev?'DEV_TEST_ONLY':'CURRENT_INDEPENDENT_REVIEW',tests:Object.fromEntries(Object.entries(topics).map(([k,v])=>[k,v.evidence.tests.length]))}));
}
