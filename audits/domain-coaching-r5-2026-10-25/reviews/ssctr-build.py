"""Independent SSCTR records for bounded R5 policy; never edits policy/runtime/queue."""
from pathlib import Path
import copy
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'audits/domain-coaching-r5-2026-10-25/reviews'
NODE = Path('C:/Users/carva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
POLICY = 'CoachingCore/r5/PROGRAM_POLICY_R5.json'
QUEUE = 'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'
policy = json.loads((ROOT / POLICY).read_text(encoding='utf-8-sig'))
sha = hashlib.sha256((ROOT / POLICY).read_bytes()).hexdigest()
canonical_hash = subprocess.check_output([str(NODE), '--input-type=module', '-e',
    "import fs from 'node:fs'; import { hash } from './CoachingCore/src/value.mjs'; console.log(hash(JSON.parse(fs.readFileSync('CoachingCore/r5/PROGRAM_POLICY_R5.json','utf8'))))"], cwd=ROOT, text=True).strip()
old = json.loads((ROOT / 'audits/domain-closure-r4-2026-10-25/evidence/SCIENTIFIC_EVIDENCE_SNAPSHOT_R4.json').read_text(encoding='utf-8'))
sources = {s['source_id']: copy.deepcopy(s) for s in old['sources']}
sources['R5-S01'] = {
    'source_id': 'R5-S01',
    'title': 'Individualized Endurance Training Based on Recovery and Training Status in Recreational Runners',
    'authors': 'Nuuttila OP, Nummela A, Korhonen E, Hakkinen K, Kyrolainen H',
    'year': 2022,
    'url': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9473708/',
    'doi': '10.1249/MSS.0000000000002968', 'pmid': '35975912',
    'source_type': 'RCT', 'access': 'FULL_TEXT', 'accessed_on': '2026-10-25',
    'verified': True, 'prescriptive_support_eligible': True,
    'population_design_dose': '30 recreational runners analyzed after randomization; three preparation weeks followed by six volume and six interval weeks; individualized versus predefined running.',
    'findings': 'Both programs improved running performance; the individualized group improved the 10-km outcome more.',
    'locator': 'PMC9473708 full text: Methods/Participants, Study protocol, Training; Discussion and Limitations; Europe PMC XML saved locally.',
    'limitations': ['Small analyzed sample; attrition and per-protocol exclusions; limited additional strength exposure; no direct validation of this software or its observation thresholds.'],
    'counterevidence': ['The predefined group also improved; the study cannot establish necessity of changing every plan, hybrid superiority or causal athlete traits.']
}

# Current session retrieval, not an unsupported assertion that old access was repeated.
retrieved = {
    'R4-S01': 'PMC12965823', 'R4-S02': 'PMC8891239', 'R4-S03': 'PMC9474354',
    'R4-S05': 'PMC8606564', 'R4-S06': 'PMC4789708', 'R5-S01': 'PMC9473708'
}
for sid, pmc in retrieved.items():
    sources[sid]['accessed_on'] = '2026-10-25'
    sources[sid]['locator'] += '; independently retrieved/read for R5: reviews/ssctr-evidence/' + pmc + '.xml'

searches = [
    {'query': 'R4 verified source reuse: ACSM2026 PMC12965823; concurrent PMC8891239/PMC9474354; response-methodology PMC8606564; monitoring PMC4789708',
     'site': 'Publisher/PMC/Europe PMC fullTextXML', 'searched_on': '2026-10-25',
     'purpose': 'Recheck applicable principles and counterevidence before extending conditional program orchestration.',
     'result_notes': 'Web PMC challenged several pages; Europe PMC XML retrieval succeeded. Methods and relevant discussion/limitations read; no new physiological constants adopted.'},
    {'query': 'individualized running training program perceived recovery randomized trial recreational runners autoregulation',
     'site': 'Web discovery; PMC9473708 and Europe PMC full text', 'searched_on': '2026-10-25',
     'purpose': 'Test direct evidence for longitudinal response-informed running rather than isolated-session extrapolation.',
     'result_notes': 'Selected Nuuttila et al. 2022 RCT, PMID35975912; full text read. Protocol, population and attrition limit transfer; no imported numerical adjustment algorithm.'},
    {'query': 'resistance training repetitions in reserve autoregulation fixed prescription randomized trial 2024 2025',
     'site': 'Web discovery/publisher records', 'searched_on': '2026-10-25',
     'purpose': 'Directed counterevidence to universal superiority of autoregulation or calendar RIR variation.',
     'result_notes': 'Located 2025 trials/acute comparisons; not adopted as new prescriptive evidence because full texts not audited. Current ACSM stand retained; no exact RIR progression authority inferred.'},
    {'query': 'concurrent running strength training sequence randomized trial individual recovery programme 2025',
     'site': 'Web discovery/publisher records', 'searched_on': '2026-10-25',
     'purpose': 'Challenge blanket sequence/spacing and hybrid optimality claims.',
     'result_notes': 'New obese/clinical-population and acute-sequence reports do not establish ordinary hybrid trajectory optimality. No new spacing rule adopted; R4 endpoint-specific counterevidence remains.'},
    {'query': 'Effects of tapering on performance in endurance athletes DOI10.1371/journal.pone.0282838',
     'site': 'PLOS publisher full text', 'searched_on': '2026-10-25',
     'purpose': 'Confirm that endurance taper evidence does not close complete combined hybrid taper policy.',
     'result_notes': 'Full text rechecked. Heterogeneous endurance-only protocols do not authorize a new combined running/strength race-week recipe.'}
]

common = [
    'Offline synthetic Node24 proposals only. Explicit current adult recreational nonclinical eligibility; no elite, pregnancy/postpartum, frailty, rehabilitation or clinical-clearance extrapolation.',
    'Validate complete current prescriptions, task competence, relevant current function/recovery, comparable conditions, equipment and actual local scheduling windows. Missing eligibility is ASK; clinical signals route to CLINICAL_HUMAN_REQUIRED without a substitute dose.',
    'Future sessions, weeks and phases are conditional proposals. Actual execution and response remain distinct from planned work; no predicted fitness gain, guaranteed readiness or elapsed-calendar dose authority.',
    'Preserve completed actuals and official plan bytes. Compare KEEP and relevant smaller reversible changes; priority alone never establishes interference or necessity.',
    'Bind exact current R5 policy, current independent review, source integrity and funded-human queue. Material policy/selector/context/population/evidence changes invalidate affected binding.'
]

definitions = [
    {
      'id': 'R5-WHOLE-PROGRAM',
      'question': 'Can the engine compile a conditional multilevel program from current complete familiar prescriptions and a currently tolerated combined weekly configuration?',
      'sourceIds': ['R4-S01', 'R4-S02', 'R4-S03', 'R4-S04', 'R5-S01'],
      'claim': 'Program organization may be individualized to goals and observed response; no unique optimal phase structure is established for every recreational hybrid athlete.',
      'conditions': [
        'Require current provenance-bearing combined weekly tolerance covering all included anchor identities and recovery. Separate familiarity of individual sessions cannot establish tolerance of their combined frequency, sequence or doubles.',
        'Use complete feasible schedule options whose current weekly configuration has compatible exposure. The compiler may expose choices and intent; it must not manufacture a new high-demand combination from individually familiar ingredients.',
        'Blocks/phases carry goals, protected stimuli, flexible elements and response-gated entry/exit criteria. Calendar labels alone must not imply achieved adaptation or permit a new dose.',
        'Novice modality without a full current repertoire receives only the existing reviewed establishment scope and subsequent observation; it cannot be advertised as a complete event-performance program.',
        'A complete athlete-supplied familiar event week must match event goal/date, current baseline and recovery, and feasible combined work. Otherwise the event transition is explicitly unsupported; familiarity alone is not proof of an optimal taper.'
      ],
      'limitations': ['Approves bounded orchestration, not independent invention of a competent 12-16-week performance program.', 'No exact optimal running/strength distribution, periodization, maintenance minimum or race-week effectiveness is established.'],
      'action': 'Compile a conditional familiar program or expose scoped ASK/unsupported; do not invent missing sporting semantics.'
    },
    {
      'id': 'R5-EARNED-TRAJECTORY',
      'question': 'Can repeated comparable execution and compatible recovery choose a complete familiar next or lower dose while preserving goal and future-week feasibility?',
      'sourceIds': ['R4-S01', 'R4-S05', 'R4-S06', 'R5-S01'],
      'claim': 'Training progression and regression can use repeated comparable performance and recovery observations, with uncertainty retained rather than automatic calendar escalation.',
      'conditions': [
        'Only complete supplied currently relevant previously tolerated alternatives; one material prescription dimension changes at a time, including the total weekly consequence. No new hard-intensity calibration, frequency, hill/interval/race task from easy-run exposure.',
        'Require repeated comparable actual exposure at the current dose plus compatible current/next-day recovery before progression. A planned completion, one noisy result or repeated duplicate event never earns a progression.',
        'Choose the smallest known supported increment among alternatives when a smaller option meets the need; preserve rest, movement, equipment/load basis, intensity and relevant contextual constraints unless separately reviewed.',
        'Repeated underperformance can select a familiar lower dose only where the observation identifies a material mismatch and KEEP/smaller options do not suffice. Clinical signs override this rule; do not diagnose fatigue or prescribe rehabilitation.',
        'Observation counts, recency cutoffs and hysteresis are auditable operational safeguards, not physiological laws or validated response classifications. New context/stale data/contradiction weakens evidence.',
        'At most the response-supported near-term change is earned. Later weeks remain conditional and must not accumulate a ladder of inferred progressions without new actual evidence.'
      ],
      'limitations': ['No precise RIR or universal response threshold validated.', 'Familiar self-report is a bounded input, not an empirical demonstration that returning to that dose produces desired adaptations.'],
      'action': 'Progress, regress or KEEP within a current familiar option set; observe the next comparable response.'
    },
    {
      'id': 'R5-HORIZON-ADAPTATION',
      'question': 'Can prospective minimum-effective adaptations preserve essential goals across session, week, phase and event without creating missed-load debt?',
      'sourceIds': ['R4-S02', 'R4-S03', 'R4-S06', 'R4-S07', 'R5-S01'],
      'claim': 'Goal, recovery and subsequent training context can inform prospective plan validity; the smallest adequate change may preserve more goal-relevant work.',
      'conditions': [
        'Material decisions explicitly inspect H0 session, H1 week, H2 phase and H3 goal/event, including the next key stimulus and cross-week effects. Recording labels without constraining the candidate is insufficient.',
        'Use only independently admissible options. Missed optional work may be discarded; missed essential work requires evaluating future essential stimulus and event feasibility. Never compress, stack or double load merely to repay a miss.',
        'Try feasible same-dose Pareto arrangements preserving both modalities first. Run-first/Strength-first order necessary trade-offs only after no dominating feasible solution; Balanced must not default to protecting running.',
        'Move/substitute/reduce only where current compatibility and alternative completeness are established. A local reduction may be preferable to moving a conflict into the next week; essential outcomes removed must be reported as unmet.',
        'Return after interruption requires a known nonclinical reason, current ordinary function/eligibility and applicable reviewed re-establishment or demonstrated easy scope. Time away does not restore former capacity.',
        'Event transition never invents a combined taper. Matching complete current familiar event-week proposal is required; if absent retain event-specific unsupported status rather than a general week mislabeled event-ready.'
      ],
      'limitations': ['No universal hour-spacing, injury-risk reduction or guaranteed event-trajectory preservation.', 'Specific option optimality remains a separate independent coaching-quality judgment; science boundary review is not BEST_SUPPORTED scoring.'],
      'action': 'KEEP or the smallest admissible prospective adjustment; ASK/unsupported/clinical route when the future trajectory cannot be justified.'
    },
    {
      'id': 'R5-LEARNED-SCHEDULE',
      'question': 'Can comparable athlete observations change soft preference among independently admissible identical-dose familiar arrangements without claiming causation?',
      'sourceIds': ['R4-S02', 'R4-S03', 'R4-S05', 'R4-S06'],
      'claim': 'Repeated observations can inform uncertain scheduling preference; observed associations cannot establish causal athlete traits or approve a new dose.',
      'conditions': [
        'Every competing arrangement must first pass independent admissibility, complete-prescription identity/equal-dose, actual windows/equipment, current combined-week tolerance and future-horizon checks. Self-declared admissible:true is not evidence.',
        'Learn only from provenance-bearing actual observations with comparable prescription, context, phase and recovery. Planned outcomes and synthetic response fixtures never become real athlete evidence.',
        'Retain recency, comparability, consistency, uncertainty and hysteresis. Single events cannot create hard scheduling rules; duplicates cannot amplify evidence; conflicting or stale observations weaken preference.',
        'Population-informed prior/context and existing adequate arrangement dominate at low information. Stronger comparable repeated evidence may progressively affect ranking, not clinical clearance or unsupported physiological inference.',
        'Rank only same-dose familiar arrangements. No new intensity, sets/reps/load/duration or universal lower-before-run/run-before-strength prohibition is learned.',
        'Record the selected arrangement, evidence provenance, remaining confounders and reversible next observation. Words such as cause, intolerance trait or optimal physiology are not justified by this associative loop.'
      ],
      'limitations': ['No validated causal personalization algorithm or efficacy gain established.', 'A preference justified within a supplied option set does not prove a globally best program or overcome an unreviewed option.'],
      'action': 'Use a reversible soft same-dose schedule preference with uncertainty, or retain prior/KEEP when history is weak or noncomparable.'
    }
]

records = []
compact = []
queue_items = []
for d in definitions:
    rid = d['id'].replace('R5-', 'R5-SSCTR-', 1)
    qid = d['id'].replace('R5-', 'HQ-R5-', 1)
    conditions = common + d['conditions']
    target = {'project':'MyApp / Vilumo Fit','artifact':POLICY,'artifact_revision':policy['revision'], 'sha256':sha,'rule_ids':[d['id']]}
    answers = [
        'Adequacy is assessed against explicit goal, phase, current combined tolerance and protected future stimuli, not inferred from a phase name.',
        'Only supplied current or provenance-bearing actual evidence counts; simulation fixtures remain synthetic and unknowns remain unknown.',
        'KEEP is a required comparator when current context is adequate; missing eligibility, clinical signals or unresolved mismatch cannot be called normal.',
        'Change requires a material mismatch or earned progression within the admitted options; priority and elapsed calendar alone do not establish necessity.',
        d['action'],
        'Trace why KEEP, optional omission, same-dose movement and other relevant smaller changes do or do not satisfy the protected outcomes.',
        'Seek a feasible solution preserving both modalities; priority resolves necessary residual trade-offs, with explicit accepted cost and future review.',
        'Evidence supports bounded principles plus independently reviewed R4 recipes; exact prescriptions remain familiar complete inputs and conditional coaching selections.',
        'Uncertain response, self-report error, context confounding, unvalidated thresholds, incomplete repertoire and global optimality remain explicit.',
        'Missing relevant facts -> ASK; scientifically unsupported trajectory -> scoped unsupported/HOLD; clinical dependence -> CLINICAL_HUMAN_REQUIRED without a dose.'
    ]
    rec = {
      'schema_version':'1.0.0','review_id':rid,'review_revision':'r1','review_date':'2026-10-25',
      'agent_version':'SSCTR-1.0.0','constitution_revision':'SSCTR-CONST-1.0.0','protocol_revision':'SSCTR-EP-1.0.0',
      'reviewer':{'actor_type':'AI_AGENT','instance_id':'/root/ssctr (fresh R5 fallback)','human_credentials_claimed':False,'independent_of_target_author':True},
      'target':target,'question':d['question'],
      'population_context':{'population':policy['population'],'eligibility_status':'SCOPE_DEFINITION_ONLY','facts':['Policy supplied by implementation author; reviewer did not author policy/runtime.','Offline synthetic Node24 only; hypothetical trajectories are not human outcomes.'],'unknowns':['Individual future physiological response, real-world efficacy, broad repertoire coverage and global optimality.']},
      'scope':{'gate':'G02','item_ids':[d['id']],'prescriptive_impact':True,'whole_gate_closure':False},
      'literature_snapshot':{'as_of':'2026-10-25','searches':searches,'sources':[sources[s] for s in d['sourceIds']],
        'counterevidence_search':'Explicitly challenged automatic periodization, single-signal learning, universal spacing, lack-of-interference and joint-taper extrapolation. R4 sources reused after scoped recheck; R5-S01 is the sole new decisive primary trial. No source-level vote counting or universal numerical rule.'},
      'claims':[{'claim_id':d['id']+'-PRINCIPLE','statement':d['claim'],'basis':'INFERRED','role':'DECISION_SUPPORT','evidence_status':'SUPPORTED_WITH_LIMITS','source_ids':d['sourceIds'],'applicability':'Only the complete conditions below, not broad autonomous coaching.','limitations':d['limitations'],'counterevidence':['Endpoint-specific concurrent evidence, study-specific adjustment protocols and within-person variability prevent unqualified optimality/causality claims.']}],
      'evidence_status':'SUPPORTED_WITH_LIMITS','applicability':'Bounded conditional familiar-option orchestration only; no broad V1 performance-program or clinical authority.',
      'disposition':'APPROVE_WITH_CONDITIONS','proposed_action':'CONDITIONAL_OPTIONS',
      'decision':{'rationale':d['claim']+' Approval is conditional on executable enforcement and does not certify the runtime before separate binding review.','preserve':['Clinical/eligibility boundaries, current scientific envelopes, actual provenance, athlete agency, completed work and official-plan immutability.'],'modify':['Only prospective conditional proposals or same-dose option preference under all listed conditions.'],'mec_change_level':'Existing contextual MEC only; no new universal numeric score.','trade_off':'Protect the stated goal and future essential stimuli while exposing necessary modality costs; no guarantee of physiological optimum.','must_not':['Invent prescription authority from familiar labels, calendar position, observations, priority or synthetic outcomes.','Claim human/empirical/clinical validation, production readiness or broad autonomous coaching closure.'],'conditions':conditions},
      'confidence':{'level':'MODERATE','rationale':'Applicable principles and a direct longitudinal running trial support the bounded approach; hybrid implementation, self-report and thresholds remain unvalidated.'},
      'limitations':d['limitations']+['Conditional scientific boundary judgment only; independent runtime binding and coaching-quality review remain required.'],
      'ae_review':{'applicable':True,'answers':[{'question_number':i+1,'answer':a} for i,a in enumerate(answers)],'not_applicable_reason':None},
      'governance':{'gate_status':'NOT_CLOSED_BY_THIS_RECORD','publication_status':'NOT_PUBLISHED','human_validation':False,'empirical_product_validation':False,'clinical_clearance':False,'next_owner':'Chief / Engineering / independent Quality','next_action':'Bind all conditions to exact current source hashes and adversarial probes; append approved reusable rules to the single funded-human queue; report broad gaps honestly.'},
      'expiry':{'owner':'SSCTR / Chief','review_by':None,'event_based_expiry':'Immediate on material policy/runtime/authority/input-population change; otherwise re-review with relevant evidence or actual adverse response.','triggers':['Changed policy, selector, context, envelope or population.','Relevant new/corrected/retracted source, adverse response or contrary comparable observations.','Founder funding declaration and qualified-human revalidation.']},
      'human_revalidation':{'state':'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION','queue_ref':QUEUE+'#'+qid,'human_review':None},
      'supersedes':None,'dependent_items':['R5 conditional program compiler and relevant boundary binding; no old R4 approval silently widened.']
    }
    records.append(rec)
    compact.append({'boundaryId':d['id'],'policyHash':canonical_hash,'disposition':rec['disposition'],'evidenceStatus':rec['evidence_status'],'independent':True,'sourceIds':d['sourceIds'],'reviewId':rid,'reviewRevision':'r1','conditions':conditions,'limitations':rec['limitations'],'runtimeBindingStatus':'PENDING_CURRENT_INDEPENDENT_REVIEW'})
    queue_items.append({'queue_id':qid,'decision_id':rid,'decision_revision':'r1','target':target,'approved_scope':'Reusable '+d['id']+' boundary only under every listed condition; no exact-generated-workout queue row.','conditions':conditions,'approval_date':'2026-10-25','state':'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION','owner':'Chief / Founder','human_review':None,'re_review_triggers':rec['expiry']['triggers']})

def write(name, data):
    (BASE/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

write('ssctr-records.json',{'revision':'R5-SSCTR-RECORDS-r1','records':records})
write('ssctr-proposed-queue-items.json',{'revision':'R5-SSCTR-QUEUE-PROPOSAL-r1','destination':QUEUE,'preserveAllHistoricalEntries':True,'fundingState':'NOT_DECLARED','items':queue_items})
reviewed_paths = [POLICY,'CoachingCore/src/value.mjs','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-binding-review.json','audits/domain-closure-r4-2026-10-25/evidence/SCIENTIFIC_EVIDENCE_SNAPSHOT_R4.json']
write('ssctr-policy-review.json',{'revision':'R5-SSCTR-POLICY-r1','reviewDate':'2026-10-25','reviewer':'/root/ssctr','reviewerRole':'Fresh default fallback loading SSCTR1.0.0; native type unavailable; not policy/runtime author.','independent':True,'humanValidation':False,'empiricalProductValidation':False,'clinicalClearance':False,'scope':'Conditional familiar-option boundaries only, not broad coaching or runtime binding approval.','policyHash':canonical_hash,'hashSemantics':'CoachingCore/src/value.mjs hash(policy), recursive sorted canonical JSON SHA-256.','records':compact,'reviewedFiles':[{'path':p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()} for p in reviewed_paths],'blockingBeforeRuntimeApproval':['Executable enforcement and current source-hash binding still required.','Queue proposal must be merged into single authoritative historical queue before activation.'],'retainedBroadGaps':['No independent invention of full event-performance trajectories from limited/no repertoire.','No new combined taper, universal periodization, intensity calibration or causal athlete-learning authority.','No human/empirical product validation, clinical clearance, production, UI/Figma/KMP or real-athlete plan effects.']})
write('ssctr-evidence-manifest.json',{'revision':'R5-SSCTR-EVIDENCE-r1','asOf':'2026-10-25','sources':[sources[s] for s in ['R4-S01','R4-S02','R4-S03','R4-S04','R4-S05','R4-S06','R4-S07','R5-S01']],'searches':searches,'accessFailures':['Web PMC/Europe PMC parser failed/challenged some sources; direct Europe PMC fullTextXML retrieval succeeded.','System python command was a Windows Store alias; bundled Python executed subsequent source retrieval and validation.'],'retrievedFiles':[{'path':str(p.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted((BASE/'ssctr-evidence').glob('*.xml'))],'newPrimarySource':'R5-S01','method':'Targeted source reappraisal, not systematic search, independent source-fidelity gate, human or empirical validation.'})
print(json.dumps({'policyHash':canonical_hash,'policyFileSha256':sha,'records':len(records),'queueProposalEntries':len(queue_items)},indent=2))
