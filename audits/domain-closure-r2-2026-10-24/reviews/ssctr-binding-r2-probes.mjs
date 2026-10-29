// Independent scientific binding checks; not representative evaluation or efficacy evidence.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {evaluateShadow} from '../../../CoachingCore/src/index.mjs';
import {r2Input,r2Requests} from '../../../CoachingCore/src/r2-fixtures.mjs';
import {hash} from '../../../CoachingCore/src/value.mjs';
const root=new URL('../../../',import.meta.url);
const rawHash=p=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex');
const rows=[];
function inspect(name,input,expected,additional=()=>true){
 const before=hash(input),out=evaluateShadow(input),again=evaluateShadow(input),d=out.shadowDecision;
 const checks={expectedDecision:(Array.isArray(expected)?expected:[expected]).includes(d.decisionType),deterministic:hash(out)===hash(again),inputUnchanged:hash(input)===before,officialPlanUnchanged:hash(out.officialPlanState)===hash(input.officialPlanState),appliedStateUnchanged:hash(out.appliedState)===hash(input.officialPlanState),noAppliedEffect:d.applied===false,additional:!!additional(out)};
 rows.push({name,decisionType:d.decisionType,expected,checks,passed:Object.values(checks).every(Boolean),rationale:d.rationale,policyRefs:d.policyRefs,evidenceRefs:d.evidenceRefs,scientificConditionsPresent:!!d.scientificConditions,adjudicatedPremiseNotice:d.sourceFacts?.adjudicatedPremiseNotice??null});
}
for(const request of r2Requests())inspect('Fifteen-policy trace: '+request,r2Input(request),request.startsWith('TAPER')?'HOLD':'MODIFY',o=>request.startsWith('TAPER')||o.shadowDecision.evidenceRefs.length===1&&o.shadowDecision.scientificConditions&&o.shadowDecision.sourceFacts.adjudicatedPremiseNotice);
const controls=[
 ['P01 missing bounded age','ESTABLISH_RUN',i=>delete i.athleteState.ageYears,'ASK'],
 ['P02 missing current load','ESTABLISH_STRENGTH',i=>delete i.event.facts.loadsKg.legPress,'ASK'],
 ['P03 nonuniform all-set response','PROGRESS_STRENGTH',i=>i.event.facts.episodes[0].uniformRepsAcrossAllSets=false,'ASK'],
 ['P05 smaller optional change sufficient','SYSTEMIC_FATIGUE',i=>i.event.facts.optionalRemovalSufficient=true,'ASK'],
 ['P06 essential intent lost','UNDER_TARGET_STRENGTH',i=>i.event.facts.essentialIntentPreserved=false,'HOLD'],
 ['P06 smaller rest sufficient','UNDER_TARGET_STRENGTH',i=>i.event.facts.smallerRestChangeSufficient=true,'ASK'],
 ['P07 smaller rest sufficient','REDUCE_RUN_REPETITION',i=>i.event.facts.smallerRestChangeSufficient=true,'ASK'],
 ['P14 wrong exact tolerated recipe','CALIBRATE_RUN',i=>i.event.facts.toleratedRecipeId='R2-EASY-40','ASK'],
 ['P14 CS construct substitution','CALIBRATE_RUN',i=>i.event.facts.construct='CS','NOT_SUPPORTED_YET'],
 ['P15 one observation','RANK_OPTIONS',i=>i.event.facts.episodes=i.event.facts.episodes.slice(0,1),'ASK'],
 ['Clinical return dominates approval','RETURN_RUN',i=>i.event.facts.reason='INJURY','CLINICAL_HUMAN_REQUIRED'],
 ['Revoked approval','ESTABLISH_RUN',i=>i.policyContext.revokedReviewIds=['SSCTR-R2-P01'],'HOLD'],
 ['Adult flag contradicts age','ESTABLISH_STRENGTH',i=>i.athleteState.ageYears=16,'NOT_SUPPORTED_YET'],
 ['Impossible calendar observation','LOCAL_FATIGUE',i=>i.observation.observedAt='2026-02-30T12:00:00Z','ASK'],
 ['Ignored unrelated session parameter','LOCAL_FATIGUE',i=>i.officialPlanState.sessions.push({session_id:'unrelated',day:'SAT',recipeId:'R2-EASY-20',status:'PLANNED',optional:false,parameters:{paceSecondsPerKm:200}}),'ASK'],
 ['P14 cannot replace concrete Strength','CALIBRATE_RUN',i=>Object.assign(i.officialPlanState.sessions[0],{recipeId:'R2-SQUAT-3X8',parameters:{loadKg:60,targetRir:2}}),'HOLD'],
 ['P14 cannot replace concrete different run stimulus','CALIBRATE_RUN',i=>Object.assign(i.officialPlanState.sessions[0],{recipeId:'R2-RUN-5X3',parameters:{paceSecondsPerKm:300}}),'HOLD'],
 ['P14 identical concrete target is KEEP','CALIBRATE_RUN',i=>i.officialPlanState.sessions[0].recipeId='R2-EASY-20','KEEP']
];
for(const [name,request,mutate,expected] of controls){const i=r2Input(request);mutate(i);inspect(name,i,expected);}
function observedEstablishment(request){
 const i=r2Input(request),d=evaluateShadow(i).shadowDecision;
 const sessions=d.candidate.sessions.map(({session_id,day,recipeId,status,optional,parameters})=>({session_id,day,recipeId,status,optional,parameters}));
 i.officialPlanState={plan_id:'SSCTR-OBSERVED-ESTABLISHMENT',plan_revision:'observed-week1',athlete_id:i.athleteFixtureId,sessions};
 i.evaluatedAt='2026-11-02T12:00:00-03:00';i.observation.observedAt='2026-11-01T12:00:00-03:00';
 i.observedExecutionState.completed=sessions.map((s,n)=>({sessionId:s.session_id,athleteId:i.athleteFixtureId,factId:'SSCTR-ACTUAL-'+n,sourceRef:'SSCTR-SYNTHETIC-WEEK1',sourceRevision:'1',observedAt:'2026-11-01T12:00:00-03:00',recipeId:s.recipeId,parameters:s.parameters,executedRevision:'observed-week1',coverage:'COMPLETE'}));
 return i;
}
for(const request of ['ESTABLISH_RUN','ESTABLISH_STRENGTH']){
 const prefix=request+' observed week → ';
 inspect(prefix+'same-context week-two retention',observedEstablishment(request),'KEEP',o=>!o.shadowDecision.candidate&&o.shadowDecision.modify.length===0);
 const changes=[
  ['missing actual response',i=>i.observedExecutionState.completed=[],'ASK'],
  ['wrong executed revision',i=>i.observedExecutionState.completed[0].executedRevision='other','ASK'],
  ['foreign athlete response',i=>i.observedExecutionState.completed[0].athleteId='other','ASK'],
  ['missing actual parameter',i=>delete i.observedExecutionState.completed[0].parameters,'ASK'],
  ['changed current context',i=>i.recoveryContext.contextChanged=true,'HOLD'],
  ['one-minute current time budget',i=>i.event.facts.timeBudgetMinutes=1,['ASK','HOLD','NOT_SUPPORTED_YET']],
  ['unavailable chosen days',i=>i.event.facts.availableDays=['SUN'],['ASK','HOLD','NOT_SUPPORTED_YET']],
  ['same-day invalid chosen schedule',i=>i.officialPlanState.sessions.forEach(s=>s.day='MON'),['ASK','HOLD','NOT_SUPPORTED_YET']]
 ];
 for(const [name,mutate,expected] of changes){const i=observedEstablishment(request);mutate(i);inspect(prefix+name,i,expected);}
}
const i=r2Input('LOCAL_FATIGUE'),preserved={session_id:'completed-history',day:'MON',recipeId:'R2-EASY-20',status:'COMPLETED',optional:false,parameters:{}};
i.officialPlanState.sessions.push(preserved);
inspect('Unrelated completed prefix is byte-semantically preserved in candidate',i,'MODIFY',o=>hash(o.shadowDecision.candidate.sessions.find(s=>s.session_id===preserved.session_id))===hash(preserved));
const files=['CoachingCore/src/r2-runtime.mjs','CoachingCore/src/runtime.mjs','CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json','CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json','audits/domain-closure-r2-2026-10-24/reviews/ssctr-records.json'];
const result={revision:'SSCTR-BINDING-r2',kind:'TARGETED_INDEPENDENT_SCIENTIFIC_BINDING_NOT_REPRESENTATIVE_EVAL',targetHashes:Object.fromEntries(files.map(p=>[p,rawHash(p)])),passed:rows.every(r=>r.passed),rows};
writeFileSync(new URL('ssctr-binding-r2-probes.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,rows:rows.length,failures:rows.filter(r=>!r.passed).map(r=>({name:r.name,decisionType:r.decisionType,checks:r.checks}))},null,2));
if(!result.passed)process.exitCode=1;
