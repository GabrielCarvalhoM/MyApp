import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {hash} from '../../../CoachingCore/src/value.mjs';
const root=new URL('../../../',import.meta.url),here=new URL('./',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(new URL(p,root))).digest('hex');
const probes=read('audits/domain-coaching-r5-2026-10-25/reviews/ssctr-binding-probes.json');
if(!probes.passed||probes.reviewedFiles.some(f=>f.sha256!==sha(f.path)))throw new Error('Current passing independent scientific probes required; source changed or probes failed');
const policy=read('CoachingCore/r5/PROGRAM_POLICY_R5.json'),review=read('audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json');
const validation=read('audits/domain-coaching-r5-2026-10-25/reviews/ssctr-schema-validation.json');
if(!validation.passed||review.policyHash!==hash(policy))throw new Error('Current policy/record consistency required');
const freezePath='CoachingCore/r5/RUNTIME_FREEZE_R5.json',runtimeFreeze=read(freezePath);
if(runtimeFreeze.sourceDigest!==hash(runtimeFreeze.entries)||runtimeFreeze.entries.some(f=>sha(f.path)!==f.sha256)||probes.reviewedFiles.some(f=>!runtimeFreeze.entries.some(e=>e.path===f.path&&e.sha256===f.sha256)))throw new Error('Final frozen digest/current source/probe overlap mismatch');
if(!validation.actualGlobalQueueMergeObserved||validation.totalAuthoritativeQueueEntries!==114)throw new Error('Actual four-rule merge into existing authoritative queue must be observed');
const extra=['CoachingCore/src/value.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r5/fixtures/canonical.mjs',freezePath,'audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-records.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-proposed-queue-items.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-schema-validation.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-binding-probes.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-evidence-manifest.json','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'];
const reviewedFiles=[...probes.reviewedFiles,...extra.map(path=>({path,sha256:sha(path)}))];
const groups=[
 ['R5-SSCTR-B01','Dose direction, minimum within-dimension magnitude and weekly accumulation',['progress-direction','regression-direction','minimum-work-magnitude','one-prospective-week-dose-budget']],
 ['R5-SSCTR-B02','Actual physical dose and imported-model source binding',['actual-dose-comparability','strength-actual-load-comparability','imported-model-actual-rebinding','hard-run-work-comparability','complete-strength-positive-control','clinical-observation-not-tolerance-learning']],
 ['R5-SSCTR-B03','Complete future feasibility, same-dose movement and constraint persistence',['progression-window-fit','same-dose-move-after-regression','original-constraints-persist','review-week-clock-consistency']],
 ['R5-SSCTR-B04','Horizon/event, nonclinical return, population and familiar-task scope',['earned-dose-does-not-overwrite-event','unknown-return-reason','excluded-population-context','maximal-easy-anchor','unambiguous-strength-load-basis','alternative-combined-context-required']],
 ['R5-SSCTR-B05','Persistent plan validity, bounded nonclinical reconciliation and clinical isolation',['missed-essential-alone-stability','pending-clinical-never-clears','unknown-return-not-generically-reconciled','current-combined-nonclinical-reconciliation','simulator-clinical-state-no-auto-execution','prior-clinical-dependency-not-tolerance-learning']]
];
const result={revision:'R5-SSCTR-BINDING-r5-FROZEN',reviewDate:'2026-10-26',reviewer:'/root/ssctr',reviewerRole:'Fresh default fallback explicitly loading SSCTR1.0.0; native specialist unavailable; independent of policy/runtime authorship.',independent:true,independentOfRuntimeAndPolicyAuthors:true,humanValidation:false,empiricalProductValidation:false,clinicalClearance:false,verdict:'PASS_WITH_CONDITIONS',finalFrozenRuntimeReview:true,
 scope:'Current frozen scientific-boundary/runtime binding only; no broad coaching-quality, whole-V1, clinical, production or empirical approval.',policyHash:hash(policy),sourceDigest:runtimeFreeze.sourceDigest,runtimeSourceDigest:hash(probes.reviewedFiles),reviewedFiles,
 freezeAttestation:{artifact:freezePath,sourceDigest:runtimeFreeze.sourceDigest,entries:runtimeFreeze.entries.length,allCurrentEntriesMatch:true,allReviewedRuntimeSourcesInFreeze:true,semanticScope:'Scientific boundary/runtime modules reviewed; other freeze entries hash-verified for integrity, not an assertion of independent semantic review of the unseen evaluation harness.'},
 findings:groups.map(([id,title,proofProbes])=>({id,title,status:'CLOSED_BY_VERIFIED_FIX_OR_CURRENT_CONTROL',blocking:false,proofProbes})),
 boundaryBindings:review.records.map(r=>({boundaryId:r.boundaryId,policyHash:r.policyHash,reviewId:r.reviewId,reviewRevision:r.reviewRevision,disposition:r.disposition,conditionsRetained:r.conditions,sourceIds:r.sourceIds})),
 conditions:[
  'Only complete current familiar-option programs for explicitly eligible nonclinical recreational adults, with current self-reported combined weekly configurations. No physiology predicted; no exact-dose paper or separate queue row per generated workout.',
  'Retain physical-stimulus/planned/actual binding for new and imported observations; local hashes preserve payload integrity rather than authenticating an external human source. Different work/load remains actual history without earning tolerance of the planned dose.',
  'Keep one material prospective dose dimension, compatible current response, exact combined alternative context, complete windows/equipment and protected event/review phases. Same-dose scheduling must use the actual current future-week dose and retained incompatibility constraints.',
  'Scheduling history remains contextual association with uncertainty and hysteresis. No causal athlete traits, unsupported intensity calibration or universal spacing, RIR, weekly growth, maintenance or taper law.',
  'Current combined-task/function/recovery self-report may reconcile a bounded nonclinical validity dependency only. It cannot clear a clinical dependency, unknown return reason, missing re-establishment path or changed-goal/input dependency; no new training dose or physiological readiness conclusion follows.',
  `All ${probes.total} targeted scientific probes pass for the exact reviewed source hashes. A material source/selector/policy/input-population change invalidates this binding and requires proportional fresh review.`,
  'Four reusable R5 approvals are now matched to the single authoritative114-entry queue, funding NOT_DECLARED. Retain all historical entries and conditions; no per-generated-workout queue expansion or automatic clinical/human clearance.'
 ],
 proof:{scientificBoundaryProbes:{artifact:'audits/domain-coaching-r5-2026-10-25/reviews/ssctr-binding-probes.json',total:probes.total,passing:probes.passing,passed:probes.passed},recordConsistency:{records:validation.records,passed:validation.passed,queueProposalConsistent:validation.queueProposalConsistent,actualGlobalQueueMergeObserved:validation.actualGlobalQueueMergeObserved,totalAuthoritativeQueueEntries:validation.totalAuthoritativeQueueEntries},failureHistory:['audits/domain-coaching-r5-2026-10-25/reviews/ssctr-binding-probes-r1-before-fixes.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-binding-probes-r2-before-actual-completeness-fix.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-binding-probes-r4-before-validity-fix.json'],harnessMethod:'Reviewer-authored adversarial probes use synthetic canonical witnesses and explicit bindFixtureAlternatives fact updates. Positive controls require real expected dose/action; this is designed-case review, not the independent unseen holdout.'},
 retainedLimitations:[
  'Conditional repetition/composition of familiar complete work does not demonstrate invention of broad competent event-performance programs or physiologically optimal phases.',
  'No new complete combined taper invented. Event proposals depend on supplied matching current familiar complete configuration; otherwise unsupported remains explicit.',
  'R5 inference/count/recency/hysteresis thresholds are operational bookkeeping with no validated individual-response classification or outcome prediction.',
  'Return approval remains limited to current demonstrated bounded easy re-establishment after known nonclinical logistics interruption; clinical return/clearance is never provided.',
  'Synthetic fixture outcomes are not physiological simulations. Full coaching-quality classification and domain breadth require the separate independent quality review; this review does not label BEST_SUPPORTED.',
  'R4 and historical regression checks, conformance, unseen-holdout quality and complete mission deliverables remain Chief/Quality proof responsibilities.'
 ],
 expiry:'Immediate for material change to reviewed runtime/policy/authority, relevant source correction/adverse response, or population/context expansion; funded-human revalidation follows actual Founder declaration.'};
fs.writeFileSync(new URL('ssctr-binding-review.json',here),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(new URL('ssctr-binding-review-r5-frozen.json',here),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({verdict:result.verdict,sourceDigest:result.sourceDigest,reviewedFiles:reviewedFiles.length,probes:probes.total,queueMerged:validation.actualGlobalQueueMergeObserved,finalFrozenRuntimeReview:result.finalFrozenRuntimeReview},null,2));
