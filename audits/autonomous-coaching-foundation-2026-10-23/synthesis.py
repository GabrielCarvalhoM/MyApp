"""Build the bounded scientific synthesis. No policy approval or product runtime."""
import json
from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'product/candidates/autonomous-coaching-foundation/1.0.0'
OUT.mkdir(parents=True, exist_ok=True)
BASE = ROOT / 'reviews/sports-domain-closure/2026-10-23/scientific/LITERATURE_SNAPSHOT.json'
baseline = json.loads(BASE.read_text(encoding='utf-8-sig'))
sources = baseline['sources']
byid = {s['source_id']: s for s in sources}
byid['L04']['year'] = 2024  # issue year; online October 2023
byid['L05'].update(
    url='https://pmc.ncbi.nlm.nih.gov/articles/PMC4789708/', access='FULL_TEXT',
    prescriptive_support_eligible=True,
    population_design_dose='Systematic descriptive synthesis of 56 studies in training athletes; established self-report instruments compared with concurrent objective measures. Competition periods excluded.',
    findings='Subjective well-being was responsive to training changes; subjective and objective measures were not consistently associated. Supports monitoring, not a validated decision algorithm.',
    locator='Methods: selection, extraction, descriptive synthesis; Results/Tables 6-7; Practical considerations and Limitations, PMC lines 106-195, 361-422, 519-545.',
    limitations=['Search through May 2014; heterogeneous timeframes and sampling; small samples and selective reporting.', 'Review excluded sRPE as well-being; bespoke single-item product questions are not automatically equivalent to validated instruments.'],
    counterevidence=['Total scores can dilute subscale changes; biomarker disagreement is possible.', 'No universal readiness cutoff, reduction dose or clinical diagnosis established.'])
byid['L08']['findings']='Strength and size recovered during retraining after detraining; no statistically significant between-group difference in final studied adaptations was detected. This is not proof of equivalence and does not test catch-up volume.'

def add(i,title,authors,year,url,doi,pmid,kind,access,pop,findings,locator,limits,counter,eligible=None):
    sources.append(dict(source_id=f'L{i:02}', title=title, authors=authors, year=year,
        url=url, doi=doi, pmid=pmid, source_type=kind, access=access,
        accessed_on='2026-10-23', verified=True,
        prescriptive_support_eligible=(access=='FULL_TEXT' if eligible is None else eligible),
        population_design_dose=pop, findings=findings, locator=locator,
        limitations=limits,counterevidence=counter))

add(12,"Effect of Strength Training Programs in Middle- and Long-Distance Runners' Economy at Different Running Speeds: A Systematic Review with Meta-analysis",
    'Llanos-Lagos C, Ramirez-Campillo R, Moran J, Sáez de Villarreal E',2024,
    'https://link.springer.com/article/10.1007/s40279-023-01978-y','10.1007/s40279-023-01978-y','38165636','META_ANALYSIS','FULL_TEXT',
    'Moderately to highly trained runners; strength interventions 6-24 weeks, 1-4 sessions/week. Economy assessed at heterogeneous speeds.',
    'Heavy-load, plyometric and combined methods can improve economy; magnitude and applicability depend on tested method, speed and population.',
    'Methods 2.3-2.4; Results 3.5; Discussion 4.1-4.3 and Conclusions.',
    ['Sparse female/highly trained subgroup evidence; mostly absolute testing speeds.','Economy outcome does not prove injury prevention or exact session necessity.'],
    ['Submaximal/isometric methods had no significant main improvement; not proof of ineffectiveness for every goal.','Benefits of chronic training coexist with L02 acute burden.'])
add(13,'Which Training Intensity Distribution Intervention will Produce the Greatest Improvements in Maximal Oxygen Uptake and Time-Trial Performance in Endurance Athletes? A Systematic Review and Network Meta-analysis of Individual Participant Data',
    'Rosenblat MA et al.',2025,'https://link.springer.com/article/10.1007/s40279-024-02149-3','10.1007/s40279-024-02149-3','39888556','META_ANALYSIS','ABSTRACT_ONLY',
    '13 studies, 348 trained endurance athletes across sports; 296 men/52 women. Abstract; search through February 2024.',
    'No statistically significant overall POL-PYR difference reported for VO2max or time trial; performance-level subgroup results differ.',
    'Publisher Abstract Methods/Results, lines 50-68; explicit subscription preview.',
    ['Full methods/results unavailable; auxiliary only.','Mixed sports; overlapping trials with L19.'],
    ['Does not justify universal POL superiority or universal recreational PYR prescription.','No significant difference is not equivalence.'])
add(14,'Heart Rate Variability-Guided Training for Enhancing Cardiac-Vagal Modulation, Aerobic Fitness, and Endurance Performance: A Methodological Systematic Review with Meta-Analysis',
    'Manresa-Rocamora A, Sarabia JM, Javaloyes A, Flatt AA, Moya-Ramón M',2021,
    'https://pubmed.ncbi.nlm.nih.gov/34639599/','10.3390/ijerph181910299','34639599','META_ANALYSIS','ABSTRACT_ONLY',
    'Healthy sedentary to endurance-trained adults; HRV-guided versus predefined programs; abstract and discovery excerpts only.',
    'Small uncertain fitness/performance advantages reported; HRV methods and reference values require further study.',
    'PubMed Abstract Methods/Results/Conclusion; PMC challenge and publisher 429 prevented full-text appraisal.',
    ['Not sole prescriptive support; no autonomous HRV algorithm validated.','Overlaps Düking 2021 and earlier HRV reviews.'],
    ['A changed HRV value does not itself decide a plan mutation.','No significant group advantage does not prove equivalence.'])
add(15,'A Systematic Review Examining the Approaches Used to Estimate Interindividual Differences in Trainability and Classify Individual Responses to Exercise Training',
    'Bonafiglia JT, Preobrazenski N, Gurd BJ',2021,
    'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2021.665044/full','10.3389/fphys.2021.665044','34819869','SYSTEMATIC_REVIEW','FULL_TEXT',
    '149 studies across aerobic, resistance and clinical literature; methodological review, not an athlete coaching trial.',
    'Observed response variation cannot automatically be attributed to trainability; measurement error, within-person variation and meaningful change require consideration.',
    'Methods classification; Results/Table 3; Discussion and Limitations, publisher lines 455-573.',
    ['Mixed outcomes/populations; most studies had unclear-high risk of bias.','Does not validate a personalization algorithm or required observation count.'],
    ['Few studies tested response-guided later prescription; stable responder labels can mislead.','Better observation does not establish causal lower-before-run intolerance.'])
add(16,'The accuracy of fixed intensity anchors to estimate lactate thresholds in recreational runners',
    'Nuuttila O-P, Kaikkonen P, Sievänen H, Vasankari T, Kyröläinen H',2025,
    'https://link.springer.com/article/10.1007/s00421-025-05748-8','10.1007/s00421-025-05748-8','40088270','OTHER_OBSERVATIONAL','FULL_TEXT',
    'Pooled baseline treadmill tests in 165 recreational runners (64 women/101 men), accustomed to running; incremental lactate measurements.',
    'Fixed relative anchors have individual error; estimated maximal values worsened accuracy. RPE was the least accurate tested threshold estimator.',
    'Methods Participants/Incremental test/Lactate assessment; Results Tables 3-5; Discussion, publisher lines 97-176.',
    ['Cross-sectional laboratory association, not chronic prescription trial.','Specific lactate method/protocol; cannot certify field thresholds or universal sex rules.'],
    ['RPE remains usable for effort intent; it cannot be renamed a measured physiological threshold.','Measured maxima reduce some error but do not eliminate individual uncertainty.'])
add(17,'How much running is too much? Identifying high-risk running sessions in a 5200-person cohort study',
    'Frandsen JSB et al.',2025,'https://pubmed.ncbi.nlm.nih.gov/40623829/','10.1136/bjsports-2024-109380','40623829','PROSPECTIVE_COHORT','ABSTRACT_ONLY',
    '18-month observational cohort, 5205 adult Garmin users, mean age 45.8 years, 22% women; self-reported overuse injury.',
    'Single-session distance spikes relative to recent longest run were associated with injury; no week-to-week association reported.',
    'PubMed abstract Methods/Results; PMC header initially accessible, later challenge; full methods/limitations not appraised.',
    ['Observational association; self-report and selection/confounding require full-text appraisal.','Not sole prescriptive support or a validated injury forecast.'],
    ['Does not validate a universally safe 10% increase.','Session-distance exposure differs from weekly progression and ignores strength dose.'])
add(18,'Prevention, diagnosis, and treatment of the overtraining syndrome: joint consensus statement of the European College of Sport Science and the American College of Sports Medicine',
    'Meeusen R, Duclos M, Foster C, Fry A, Gleeson M, Nieman D, Raglin J, Rietjens G, Steinacker J, Urhausen A',2013,
    'https://pubmed.ncbi.nlm.nih.gov/23247672/','10.1249/MSS.0b013e318279a10a','23247672','CONSENSUS_POSITION_STAND','ABSTRACT_ONLY',
    'Consensus on overtraining/overreaching and exclusion diagnosis; no product or individual assessment.',
    'No single accepted diagnostic marker; persistent maladaptation requires differential assessment beyond routine fatigue adjustment.',
    'PubMed abstract; full consensus not read in this instance.',
    ['Historical and abstract-only; auxiliary boundary context.','No software diagnosis, biomarker clearance or recovery-day count supported.'],
    ['Short performance decrement alone is not OTS.','Prolonged unexplained decline cannot be relabeled benign fatigue.'])
add(19,"Comparison of Polarized Versus Other Types of Endurance Training Intensity Distribution on Athletes' Endurance Performance: A Systematic Review with Meta-analysis",
    'Silva Oliveira P, Boppre G, Fonseca H',2024,
    'https://link.springer.com/article/10.1007/s40279-024-02034-z','10.1007/s40279-024-02034-z','38717713','META_ANALYSIS','FULL_TEXT',
    '17 controlled studies, 437 participants; >=4 weeks, >=3 endurance sessions/week; mixed sports/training levels.',
    'Small VO2peak advantage for POL; other performance endpoints did not show superiority. Training level and duration were entangled.',
    'Methods 2.1-2.3; Results; Discussion and limitations lines 295-308.',
    ['Some actual intensity distributions and program variables underreported.','Not direct hybrid-plan optimization; overlap with L13.'],
    ['Cannot infer universal 80/20 ratio or novice applicability.','Null endpoint differences are not equivalence.'])
add(20,'No effect of a graded training program on the number of running-related injuries in novice runners: a randomized controlled trial',
    'Buist I, Bredeweg SW, van Mechelen W, Lemmink KAPM, Pepping G-J, Diercks RL',2008,
    'https://pubmed.ncbi.nlm.nih.gov/17940147/','10.1177/0363546507307505','17940147','RCT','ABSTRACT_ONLY',
    '532 novice runners preparing for 4 miles; 13-week 10%-rule program versus standard 8-week program.',
    'No significant preventive effect detected for the graded program on running-related injury.',
    'PubMed Abstract Methods/Results/Conclusions; protocol is a separate paper and not outcome evidence.',
    ['Abstract-only; auxiliary counterevidence.','Different durations and complete programs, not isolated percentage comparison.'],
    ['Does not establish equivalent injury risk or show that faster progression is safe.','Refutes assuming a 10%-rule injury-prevention guarantee.'])
add(21,'Effects of Short-Term Concurrent Training Cessation on the Energy Cost of Running and Neuromuscular Performances in Middle-Distance Runners',
    'Berryman N, Mujika I, Bosquet L',2020,
    'https://pmc.ncbi.nlm.nih.gov/articles/PMC7821917/','10.3390/sports9010001','33374897','OTHER_OBSERVATIONAL','FULL_TEXT',
    'Descriptive follow-up: 8 well-trained male runners novice to strength; 8 weeks combined training, then 4 weeks strength cessation while running continued; no completing control.',
    'Economy benefits were largely maintained in the small follow-up; individual deterioration also occurred.',
    'Methods 2.1-2.4; Results 3; Discussion 4, PMC lines 104-111, 147-204.',
    ['High dropout selection, n=8 and no control; weak auxiliary evidence.','Strength-only interruption is not whole-training cessation.'],
    ['Does not validate combined taper dose or automatic full strength removal.','Cannot prescribe exact re-entry after a nonclinical pause.'],False)
add(22,'Impact of weekly frequency of high-intensity interval training on cardiorespiratory, metabolic, and performance measures in recreational runners – An exploratory study',
    'Lenk M, Matzka M, Lauber L, Kunz P, Sperlich B',2025,
    'https://pmc.ncbi.nlm.nih.gov/articles/PMC12451023/','10.14814/phy2.70573','40976973','RCT','FULL_TEXT',
    '26 of 44 young recreationally active participants completed; randomly assigned 1/2/3 weekly 4x4-min sessions for 6 weeks; baseline-calibrated treadmill targets and 3-min active rest.',
    'Provides a concrete studied interval structure; exploratory outcomes do not establish a universally optimal frequency.',
    'Methods 2.1-2.5; Results/Table 1; Discussion 4.1, PMC lines 111-179, 203-211.',
    ['Small samples, high attrition, no a priori power; imprecise effects and no significant frequency interaction.','Not novice or concurrent-program dose validation.'],
    ['No significant between-group difference does not justify prescribing 2-3 HIIT sessions/week universally.','Tested fixed anchors still require L16 calibration caveats.'])
add(23,'Run Clever - No difference in risk of injury when comparing progression in running volume and running intensity in recreational runners: A randomised trial',
    'Ramskov D, Rasmussen S, Sørensen H, Parner ET, Lind M, Nielsen RO',2018,
    'https://pubmed.ncbi.nlm.nih.gov/29527322/','10.1136/bmjsem-2017-000333','29527322','RCT','ABSTRACT_ONLY',
    '839 initially enrolled healthy recreational runners; 447 after 8-week preconditioning entered 16-week intensity- versus volume-focus progression.',
    'No significant difference in injury proportion detected; broad risk-difference intervals allow important uncertainty.',
    'PubMed Abstract Methods/Results; PMC challenge/BMJ403 in this instance.',
    ['Not direct novice-program dose evidence or equivalence.','Preconditioning attrition; no full-method appraisal here.'],
    ['Related Run Clever injury reports are overlapping participants, not independent trials.','No universal preference for intensity- or volume-first progression established.'])
add(24,"The Measurement and Application of Critical Speed and D′ in Running: A Scoping Review",
    'Anderson M, Sabapathy S, Arnold B, Bellenger C, Kolodziej F, Bellinger P',2026,
    'https://link.springer.com/article/10.1007/s40279-026-02410-x','10.1007/s40279-026-02410-x','41931241','SYSTEMATIC_REVIEW','FULL_TEXT',
    'Scoping review with systematic search through December 2025; running CS/D-prime measurement, modelling and training application. Not effectiveness meta-analysis.',
    'Protocol/model choices affect estimates; CS and other threshold estimates cannot be used interchangeably. Longitudinal D-prime-balance training evidence is absent in the review.',
    'Methods 2.1-2.3; Results 3.1/3.3; Discussion 4.1/4.3; Crossmark current on accessed record.',
    ['Descriptive scoping design; abstract/full-text study counts differ (124/132), not resolved here.','Field/environment variation and D-prime reconstitution uncertainty remain.'],
    ['Same percent of CS can impose different cost across athletes.','No universal interval or exact threshold dose derived.'])

access = []
for s in sources:
    access.append(dict(source_id=s['source_id'],date='2026-10-23', access=s['access'],
        current_url=s['url'], read_depth=s['locator'],
        provenance='BASELINE_REOPENED' if int(s['source_id'][1:]) <= 11 else 'NEW_TO_ACF_SNAPSHOT',
        verified_meaning='Bibliographic identity and stated accessed content checked; not independent scientific approval.'))

queries = [
('site.pubmed.ncbi.nlm.nih.gov running training intensity distribution systematic review meta analysis 2025 recreational runners interval threshold','Web/PubMed discovery','TID/current running programming','L13/L19; mixed or indirect papers not exact recipes.'),
('site.pmc.ncbi.nlm.nih.gov strength training running economy systematic review meta analysis 2024 2025','Web/PMC discovery','Strength support for runners','L12 publisher full text selected.'),
('site.pmc.ncbi.nlm.nih.gov heart rate variability guided training systematic review meta analysis 2024 2025','Web/PMC discovery','Readiness currency','General HRV-change papers excluded as wrong question; L14 located by refinement.'),
('site.pmc.ncbi.nlm.nih.gov endurance training individual response repeated measurements variability response intervention consensus','Web/PMC discovery','Learning versus noise','L15 chosen; unreviewed and general summaries excluded.'),
('"Heart Rate Variability-Guided" "systematic review" meta-analysis','PubMed/PMC/Springer filter','HRV counterevidence','L14 and Düking2021 overlap; no paper vote count.'),
('"Which Training Intensity Distribution Intervention" 2025','PubMed/Springer filter','Newer counterevidence to universal POL','L13 subscription preview only.'),
('"intensity" "threshold" "prescription" critical speed exercise domains review','PMC/Springer filter','Calibration boundary','L16/L24; cardiac-rehabilitation material excluded from V1 prescription.'),
('"novice runners" randomized trial progression "10%"','PubMed/PMC filter','Novice applicability/counterevidence','L20; obesity-specific trial not transferred to general novice.'),
('"HRV-guided" training systematic review meta-analysis full text 2022 2023','PMC/Frontiers filter','Full-text and current limitations','L14 access failed; no unsupported upgrade.'),
('"Prevention diagnosis and treatment" "overtraining syndrome" consensus full text','PubMed/BJSM/LWW filter','Persistent unexplained decline boundary','L18 abstract; no clinical policy.'),
('"A Systematic Review Examining the Approaches Used" Bonafiglia doi','Frontiers/PubMed filter','Identity/full text','L15 DOI verified; initially wrong candidate URL failed and was corrected via discovery.'),
('"Heart Rate Variability-Guided Training for Enhancing" doi','MDPI/PubMed filter','Identity/full text','L14 PMID/DOI verified; PMC challenge, MDPI429.'),
('"10.1007/s40279-023-01978-y" PMID','PubMed filter','Identifier','L12 PMID38165636 verified.'),
('"10.1007/s00421-025-05748-8" PMID','PubMed filter','Identifier','L16 PMID40088270 verified.'),
('"10.1136/bjsports-2024-109380" PMID','PubMed filter','Identifier/current progression','L17 PMID40623829 verified; later full-text access failed.'),
('"Comparison of Polarized Versus Other Types" "2024"','PubMed/Springer filter','Accessible TID synthesis','L19 full text read.'),
('"PMC5841490" Run Clever doi','PubMed/BMJ filter','Author-suggested novice evidence check','L23 recreational, not true novice dose authority; own access abstract only.'),
('"Monitoring the athlete training response" "full"','PMC/BJSM filter','Baseline L05 full-text retry','BJSM403; subsequently located PMC4789708 and read full text.'),
('"taper" "concurrent" strength endurance systematic review','PubMed/PMC filter','Directed combined-taper evidence gap','L21 descriptive tiny follow-up; strength and endurance taper papers cannot prove joint recipe.'),
('"return" "detraining" "running" systematic review 2025','PubMed/PMC filter','Direct nonclinical re-entry recipe','Master case study and clinical football excluded; no direct exact hybrid return dose admitted.'),
('"running" "interval" "4 × 4" randomized full text threshold','PMC/Frontiers filter','Concrete interval structure','L22 exploratory trial selected; clinical/older populations and soccer not transferred.'),
('"novice runners" "graded training" randomized 2008 Buist PMID','PubMed filter','10%-rule counterevidence','L20; protocol distinguished from completed outcome trial.'),
('"The Measurement and Application of Critical Speed" DOI PMID','PubMed/Springer filter','2026 calibration currency','L24 DOI/PMID verified; publisher full text read.'),
('"Effects of Short-Term Concurrent Training Cessation" DOI PMID','PubMed filter','Combined-taper source identity','L21 is case-report style descriptive follow-up, not an independent taper RCT.'),
('"Impact of weekly frequency" "70573" PMID','PubMed filter','Interval source identity','L22 PMID40976973; abstract describes exploratory study.'),
('"10.14814/phy2.70573" "PMID"','PubMed filter','Identity cross-check','L22 verified.'),
('"10.1007/s40279-026-02410-x" correction retraction','Web DOI status search','Correction/status','Crossmark says document current; abstract/full-text count discrepancy retained.'),
('"10.1007/s00421-025-05748-8" correction retraction','Web DOI status search','Correction/status','No relevant notice observed; unrelated cycling correction excluded.'),
('"10.3389/fphys.2021.665044" correction retraction','Web DOI status search','Correction/status','No relevant notice observed; not an exhaustive integrity audit.'),
('"How much running is too much" "Results" "Conclusion"','PubMed filter','Accessed abstract after full-text failure','L17 full abstract read; cohort association does not prove safe cutoff.'),
('"Run Clever" "Methods" "Results" 2018','PubMed filter','Accessed abstract and overlap','L23 plus same-cohort reports; not independent replications.'),
('"Monitoring the athlete training response" "PMC"','PMC/PubMed filter','Final full-text location','L05 PMC4789708 full methods/results/limitations read.'),
('"Heart Rate Variability-Guided Training for Enhancing" "mdpi-res"','Web discovery','Publisher full-text fallback','No admitted new full-text access; L14 remains abstract-only.'),
]
searches=[dict(query=q,site=site,searched_on='2026-10-23',purpose=p,result_notes=n) for q,site,p,n in queries]

snapshot=dict(document_version='ACF-SCI-1.0.0-r1',artifact_type='LITERATURE_SNAPSHOT',
    status='SCIENTIFIC_SYNTHESIS_SUBMISSION_NOT_APPROVAL',as_of='2026-10-23',
    reviewer_instance='/root/ssctr_synthesis',native_role_available=False,
    execution_adapter='FRESH_DEFAULT_INSTANCE_EXPLICITLY_LOADED_SSCTR_1.0.0',
    authority='PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY',independent_approval=False,
    foundation_status='CANDIDATE / NON-AUTHORITATIVE',human_validation=False,
    empirical_product_validation=False,clinical_clearance=False,
    baseline=dict(path=BASE.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(BASE.read_bytes()).hexdigest(),
        ids_preserved='L01-L11',new_independent_trials_inferred=False),
    sources=sources,access_audit=access,searches=searches,
    counterevidence_search='Directed TID/POL, fixed calibration, noise/response, novice10%, acute-vs-chronic interference, combined taper and return searches. Negative result means no applicable source admitted here, not proof none exists.',
    fulltext_read_depth='Selected actual methods, results, discussion and limits at locators; no supplement/raw-study reanalysis.',
    formal_GRADE_performed=False,systematic_review_claimed=False,
    correction_status='No relevant notice observed on accessed decisive records; L24 Crossmark current. Non-exhaustive. Baseline corrected Zhao2026 excluded; no correction text independently read.',
    stopping_reason='Decision-relevant frameworks and limits identified; additional generic studies would not determine individual dose, safe progression, combined taper or exact re-entry. Owned gaps retained.')

def claim(i,text,status,epistemic,ids,consumers,not_support,gap):
    return dict(claim_id=f'ACF-SCI-C{i:02}',claim=text,evidence_status=status,
        epistemic_label=epistemic,source_ids=ids,consumers=consumers,
        applicability='Bounded nonclinical healthy-adult V1; source-specific population and measurement limits apply.',
        does_not_support=not_support,research_gap=gap,
        confidence='MODERATE' if status in ('WELL_SUPPORTED','SUPPORTED_WITH_LIMITS') else 'LOW',
        confidence_rationale='Qualitative applicability and access appraisal; no formal GRADE or probability calibration.',
        disposition='NOT_ISSUED_BY_SYNTHESIZER')

claims=[
claim(1,'Individualized RT can use multiple effective configurations; goal, competence, effort and exposure matter.','SUPPORTED_WITH_LIMITS','INFERRED',['L03','L07'],['B','D:progression','D:exercise_substitution','D:within_envelope_autoregulation'],['Exact load increment or every substitution equivalent.'],'Recipe review must check actual configuration and history.'),
claim(2,'Chronic concurrent compatibility depends on endpoint and population; acute task cost remains separate.','SUPPORTED_WITH_LIMITS','INFERRED',['L01','L02','L04'],['C','D:double_session','D:interference','F'],['Universal no-interference or fixed minimum spacing.'],'Exact candidate acute cost cannot be calculated from labels.'),
claim(3,'Strength support may improve running economy under studied methods.','SUPPORTED_WITH_LIMITS','INFERRED',['L12','L02'],['B:running_specific_support','C'],['Injury prevention, exact transfer gain or immediate readiness.'],'Novel exercise introduction and competence remain recipe-specific.'),
claim(4,'No single intensity distribution is compelled for every V1 athlete.','SUPPORTED_WITH_LIMITS','INFERRED',['L19','L13'],['A','C','D:intensity_tolerance'],['Universal80/20 or automatic POL/PYR selection.'],'Hybrid program dose and novice applicability need bounded review.'),
claim(5,'Calibration must retain method, uncertainty and protocol; effort intent differs from measured threshold.','SUPPORTED_WITH_LIMITS','INFERRED',['L16','L24'],['A','E','D:run_session_substitution'],['RPE/HR/power/CS/LT2 interchangeable or universal zones.'],'Running power vendor calibration is not established by these sources.'),
claim(6,'Concrete interval formats have been studied, without proving universally optimal session frequency.','SUPPORTED_WITH_LIMITS','OBSERVED',['L22','L24'],['A:VO2_style_intervals','A:short_intervals'],['Direct3x8min threshold or universal2-3HIIT/week proof.'],'Each fixture dose remains a contextual candidate design.'),
claim(7,'Repeated well-being reports can inform recovery interpretation with historical context.','SUPPORTED_WITH_LIMITS','INFERRED',['L05','L06'],['E','F','D:local_fatigue','D:systemic_fatigue','D:adherence'],['Mandatory score, validated arbitrary flag count or guaranteed performance benefit.'],'Product items/timeframes need measurement semantics and validation.'),
claim(8,'HRV alone does not establish superiority or decide the plan.','SUPPORTED_WITH_LIMITS','INFERRED',['L05','L14'],['F','G'],['Clinical clearance or a universal HRV mutation threshold.'],'L14 full-text access unresolved; not decisive positive prescriptive support.'),
claim(9,'Observed variability needs error/context handling before being called athlete-specific response.','SUPPORTED_WITH_LIMITS','INFERRED',['L15','L05'],['E','D:underperformance','D:overperformance'],['A causal pattern from one event or validated Bayesian weights.'],'Learning promotion/expiry is candidate engineering design requiring empirical validation.'),
claim(10,'Taper can improve studied endurance performance; combined strength-run dose remains unresolved.','SUPPORTED_WITH_LIMITS','INFERRED',['L09','L21'],['A:taper','C','D:taper','D:race_week'],['Universal reduction percentage or exact combined taper recipe.'],'Exact joint recipe needs selective review and individual response.'),
claim(11,'Nonclinical pause/retraining evidence does not determine a universal exact restart dose.','INSUFFICIENT_EVIDENCE','INFERRED',['L08','L21'],['A:return','B:return','D:return_after_interruption'],['Catch-up volume, 14-day exact reset or clinical return.'],'Contextual re-entry recipe/eligibility needed; default ASK/HOLD dependent dose.'),
claim(12,'A universal safe run-progression percentage is not established by admitted evidence.','SUPPORTED_WITH_LIMITS','INFERRED',['L17','L20','L23'],['A:novice','D:progression','D:volume_tolerance'],['10% safety guarantee or equivalence of programs.'],'All three are auxiliary abstract-only in this instance; direct recipe approval needs eligible support.'),
claim(13,'Exact missed-session make-up, deload dose and arbitrary adherence thresholds are not established here.','INSUFFICIENT_EVIDENCE','INFERRED',['L03','L08','L05'],['D:missed_session','D:deload','D:adherence'],['Automatic cumulative workload debt or universal deload calendar.'],'Treat intent preservation and no catch-up default as explicit design choices, not proven physiological optimum.'),
claim(14,'Movement metadata, actual prescription and context must remain distinct from measured fatigue response.','SUPPORTED_WITH_LIMITS','INFERRED',['L02','L03','L07'],['B:demand_estimate','F:local_states'],['Universal fatigue score per exercise or guaranteed recovery time.'],'Demand estimate requires uncertainty and prospective empirical calibration.'),
claim(15,'Authority levels and MEC action order are product control decisions, not research effect estimates.','INSUFFICIENT_EVIDENCE','DECIDED',[],['G','D:outside_envelope_mutation','D:in_session_adaptation'],['Literature validates AUTO_EXECUTE authority or MEC numeric efficacy.'],'Governance/agency review and runtime tests own authorization; sporting consequences still require review.'),
claim(16,'Persistent unexplained decline or clinical symptoms are outside routine nonclinical autonomy.','OUT_OF_SCOPE_CLINICAL','INFERRED',['L18'],['F','G'],['Diagnosis, clearance or clinical management.'],'Qualified human clinical assessment when triggered; eligibility unknown alone stays ASK.'),
claim(17,'Population-supported frameworks can bound concrete candidate recipes; fixture selection does not prove individual efficacy.','SUPPORTED_WITH_LIMITS','DECIDED',['L03','L16','L24'],['A','B','C','D','E','F','G'],['Promotion of exact numerical choices to universal scientific facts.'],'Independent SSCTR must distinguish framework support, dose applicability and any unsupported physiological predictions.'),
]

families=[
('progression',['L03','L15','L19','L17','L20','L23'],['ACF-SCI-C01','ACF-SCI-C04','ACF-SCI-C09','ACF-SCI-C12']),
('underperformance',['L02','L05','L07','L15','L18'],['ACF-SCI-C07','ACF-SCI-C09','ACF-SCI-C16']),
('overperformance',['L03','L07','L15'],['ACF-SCI-C01','ACF-SCI-C09']),
('missed_session',['L03','L08'],['ACF-SCI-C13']),
('local_fatigue',['L02','L03','L05'],['ACF-SCI-C07','ACF-SCI-C14']),
('systemic_fatigue',['L05','L06','L14','L18'],['ACF-SCI-C07','ACF-SCI-C08','ACF-SCI-C16']),
('double_session',['L01','L02','L04','L10'],['ACF-SCI-C02']),
('interference',['L01','L02','L04','L12'],['ACF-SCI-C02','ACF-SCI-C03']),
('exercise_substitution',['L03','L07','L12'],['ACF-SCI-C01','ACF-SCI-C03','ACF-SCI-C14']),
('run_session_substitution',['L16','L19','L22','L24'],['ACF-SCI-C04','ACF-SCI-C05','ACF-SCI-C06']),
('return_after_interruption',['L08','L21'],['ACF-SCI-C11']),
('deload',['L03','L05','L07'],['ACF-SCI-C07','ACF-SCI-C13']),
('taper',['L09','L02','L21'],['ACF-SCI-C10']),
('race_week',['L09','L02','L21'],['ACF-SCI-C10']),
('adherence',['L03','L05','L08'],['ACF-SCI-C07','ACF-SCI-C13']),
('volume_tolerance',['L03','L15','L17','L20','L23'],['ACF-SCI-C09','ACF-SCI-C12','ACF-SCI-C14']),
('intensity_tolerance',['L07','L15','L16','L19','L24'],['ACF-SCI-C04','ACF-SCI-C05','ACF-SCI-C09']),
('within_envelope_autoregulation',['L03','L07','L16'],['ACF-SCI-C01','ACF-SCI-C05','ACF-SCI-C15']),
('outside_envelope_mutation',['L02','L05','L07'],['ACF-SCI-C14','ACF-SCI-C15']),
('in_session_adaptation',['L02','L07','L16','L24'],['ACF-SCI-C05','ACF-SCI-C14','ACF-SCI-C15']),
]
consumer_map=[]
for n,(name,ids,cids) in enumerate(families,1):
    consumer_map.append(dict(prompt_family_number=n,family=name,source_ids=ids,claim_ids=cids,
        decisive_eligible_source_ids=[i for i in ids if next(s for s in sources if s['source_id']==i)['prescriptive_support_eligible']],
        source_role='Framework/context/counterevidence as declared in claims; not automatic action/dose support.',
        ssctr_disposition='PENDING_SEPARATE_REVIEW',
        exact_fixture_dose_status='DECIDED_CONTEXTUAL_CANDIDATE_REQUIRES_REVIEW'))
claimmap=dict(revision='ACF-SCI-1.0.0-r1',status='SYNTHESIS_NOT_APPROVAL',claims=claims,policy_consumers=consumer_map,
    evidence_status_vocabulary=['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS','PLAUSIBLE_BUT_UNCERTAIN','INSUFFICIENT_EVIDENCE','CONFLICTING_EVIDENCE','OUT_OF_SCOPE_CLINICAL'],
    distinction='Status appraises the bounded written claim. A gap claim may be supported while the dependent positive dose remains insufficient. No item approval is issued by this artifact.')

for name,obj in [('LITERATURE_SNAPSHOT.json',snapshot),('SCIENTIFIC_CLAIM_MAP.json',claimmap)]:
    (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

log='''# Search and access log — ACF scientific synthesis

ACF-SCI-1.0.0-r1 · 2026-10-23 · /root/ssctr_synthesis · **SYNTHESIS SUBMISSION; NO APPROVAL**.

Applied sports-science-review and evidence-synthesis. Native SSCTR type unavailable; fresh default instance explicitly loaded SSCTR constitution/protocol. Web search and actual publisher/PMC retrieval available; no subscriptions, athlete observations, clinical assessment or empirical product validation. This is focused decision support, not a systematic review; no formal GRADE/AMSTAR performed.

Population: bounded nonclinical adult Run + Strength V1. Questions: which frameworks support concrete prescription, which measurements can distinguish response from noise, and where do exact dose/autonomy claims exceed evidence? Exact fixtures are synthetic DECIDED design selections; evidence of a framework never establishes a unique optimal dose.

The 11-source SDC snapshot was read and its URLs reopened. L01-L11 IDs persist; reuse is not a new independent replication. L05 access upgraded to FULL_TEXT after actual PMC methods/results/limitations reading. L04 uses 2024 issue year, online 2023. L08 wording avoids equivalence from nonsignificance.

## Executed searches

All dates below are 2026-10-23. Domain filter/site is recorded; exact query strings follow.

'''
for n,s in enumerate(searches,1):
    log+=f"{n}. `{s['query']}` — {s['site']}; purpose: {s['purpose']}. Result/limit: {s['result_notes']}\n\n"
log+='## Access and read depth\n\n'
for s in sources:
    log+=f"- **{s['source_id']} — {s['access']}**: [{s['title']}]({s['url']}). Read: {s['locator']} Eligible for bounded support: {str(s['prescriptive_support_eligible']).lower()}.\n\n"
log+='''## Failures, exclusions and stop

PMC challenges affected several pages (including L14/L15/L17/L23/L24); actual publisher resolved L15/L24. BJSM/BMJ403 prevented L05 PDF and L17/L23 publisher access; correct L05 PMC later resolved. MDPI429/failed PDF/EuropePMC403 left L14 abstract-only. Wrong candidate URLs during discovery and one mistyped PMC hostname failed; they provided no evidence and were not admitted. No challenge, authentication or paywall bypass was performed. Search snippets are discovery; FULL_TEXT admission requires actual methods/results/limitations reading. Author-reported access is not automatically inherited.

Excluded from positive policy support: commercial blogs/social posts; clinical rehabilitation/return; unrelated swimming/cycling/football as direct V1 dose authority; GRONORUN protocol as outcome evidence; separate Run Clever reports as independent replications; preprints; corrected Zhao2026 until correction is read. L21 is a tiny descriptive follow-up, retained as auxiliary countercontext only. L17/L20/L23 cannot be decisive prescriptive sources in this instance because access is abstract-only.

Directed counterevidence: concurrent endpoint differences (L04), acute versus chronic cost (L02/L01), no universal autoregulation superiority (L07/L11), non-universal intensity distribution (L19/L13), fixed-anchor error (L16/L24), response misclassification (L15), 10%-rule limits (L20/L17), sparse combined taper and return (L21/L08/L09). Reviews share underlying trials; no vote count or pooled synthesis was newly computed.

Status searches for L16/L24/L15 showed no relevant correction/retraction notice; L24 Crossmark listed document current. This is not an exhaustive integrity audit. L24's abstract and body count different studies; record the discrepancy, avoid count-based inference. Earlier source status provenance remains in the baseline log.

Stop: available evidence bounds the framework/measurement decisions. Additional general papers cannot prove exact fatigue restoration, combined taper or restart dose. Full-text gaps, dose applicability, specialist validation and empirical learning-model validation remain explicit owners for separate SSCTR/runtime gates. No policy is approved by this log.
'''
(OUT/'SEARCH_LOG.md').write_text(log,encoding='utf-8')

synthesis='''# Scientific synthesis — Autonomous Coaching Foundation

ACF-SCI-1.0.0-r1 · 2026-10-23 · **CANDIDATE / NON-AUTHORITATIVE · SYNTHESIS ONLY**.

Separate scientific-synthesis instance /root/ssctr_synthesis, honest default fallback loading SSCTR-1.0.0 / SSCTR-CONST-1.0.0 / SSCTR-EP-1.0.0. This instance neither authors training policies nor approves its synthesis. Independent adversarial source and governance reviews remain required. No human credentials, empirical validation, clinical clearance, runtime authority or Product Truth promotion is claimed.

## What can become concrete

A concrete candidate session is possible without pretending literature identifies a unique optimum. It must connect an eligible athlete's supplied capacity/history and calibration to a supported programming framework, state a complete executable dose, and label the particular selection **DECIDED**. Independent review then tests applicability, trade-offs and unsupported physiological claims. A hypothetical history is a fixture fact, never real observation or empirical proof.

For strength, [L03](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/) supports broad goal-dependent programming, including novice participation; [L07](https://link.springer.com/article/10.1186/s40798-021-00404-9) supports bounded autoregulation while exposing RIR/velocity limitations. Neither validates an arbitrary increment, exercise fatigue score or every candidate envelope.

For running, [L16](https://link.springer.com/article/10.1007/s00421-025-05748-8) and [L24](https://link.springer.com/article/10.1007/s40279-026-02410-x) require target provenance. RPE-guided intent can be usable while physiological threshold remains unknown. CS, LT2 and other thresholds cannot silently substitute. [L22](https://pmc.ncbi.nlm.nih.gov/articles/PMC12451023/) gives an actual studied interval format; its exploratory frequency findings cannot become a default HIIT quota. [L19](https://link.springer.com/article/10.1007/s40279-024-02034-z) plus auxiliary L13 prevents universal polarized/80-20 doctrine.

Hybrid planning can protect both goals and model priority without assuming overlap means interference. [L01](https://link.springer.com/article/10.1007/s40279-021-01587-7), [L04](https://link.springer.com/article/10.1007/s40279-023-01943-9) and [L02](https://link.springer.com/article/10.1186/s40798-022-00497-w) concern distinct chronic endpoints and acute tasks. Balanced weighting, acceptable movement windows and commitment costs are explicit product design; the literature does not rank every feasible calendar. [L12](https://link.springer.com/article/10.1007/s40279-023-01978-y) supports running-specific strength intent without promising exact transfer.

## Response and recovery

[L05](https://pmc.ncbi.nlm.nih.gov/articles/PMC4789708/) is now full-text eligible for well-being monitoring. A low-data athlete can provide useful contextual self-report. Validated instrument findings cannot be transferred automatically to bespoke single-item scores; sRPE and well-being are distinct. Wearable richness is data availability, not authority. L14 remains abstract-only; HRV cannot be the sole mutation trigger.

[L15](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2021.665044/full) requires noise/context handling before interpreting individual response. Repeated comparable observations, contradictory examples, measurement quality and confounding must govern pattern promotion. Specific hysteresis states, minimum episode logic and prior weighting are **DECIDED candidate algorithms**, requiring empirical validation; this review supplies no magic observation count or proof that learned lower-before-run causation is identified.

Recovery state → session-specific readiness → plan adequacy decision is a defensible candidate separation. Sources support contextual interpretation; the three-stage software contract itself is a design decision. Readiness is never an automatic plan mutation or clinical clearance.

## Limits that remain material

- [L09](https://pmc.ncbi.nlm.nih.gov/articles/PMC10171681/) supports endurance taper framework, not an exact combined run-strength taper. Auxiliary [L21](https://pmc.ncbi.nlm.nih.gov/articles/PMC7821917/) has eight selected men and no completing control; it cannot close that dose gap.
- [L08](https://onlinelibrary.wiley.com/doi/full/10.1111/sms.14739) concerns untrained resistance detraining/retraining, not an exact trained-hybrid restart after 14 days. Explain interruption, reassess context and review a bounded recipe; clinical reasons require a qualified human.
- L17/L20/L23 counter universal progression shortcuts but are abstract-only here. No universal safe percentage or proof that all progression designs are equivalent follows.
- Missed-session catch-up, fixed deload timing, substitution equivalence, exact adaptation dose and in-session physiological restoration remain recipe-level questions. Explicit candidate design with preserved intent is inspectable; calling it proven is not.
- Autonomy A–E and MEC ordering are governance/control design. Sporting consequences need review; no scientific study here approves AUTO_EXECUTE authority or validates product coverage.

## Review handoff

`SCIENTIFIC_CLAIM_MAP.json` maps 17 bounded claims and all 20 requested policy families to source IDs, decisive-source eligibility and limits. Status labels appraise each written claim, not the opposite positive prescription. A supported statement that no universal dose is established does not close that dose's gate. Claim statuses use the six SSCTR values; no approval/disposition is issued here.

`LITERATURE_SNAPSHOT.json` preserves baseline IDs, source-schema fields, current access audit, actual searches and overlap caveats. `SEARCH_LOG.md` records exact queries, failures and what was read. Selective independent SSCTR approval must identify current policy/recipe revision and hash, actual population/conditions, all material supporting claims, dose status, and funded-human queue dependency. More generic references are not a substitute for that bounded decision.

Re-review triggers: material recipe/population/goal/calibration change; relevant new consensus/review or correction; adverse or inconsistent real response; changed measurement provenance; future human maintain/change/revoke decision. Owner of this scientific handoff: SSCTR; Chief owns routing and consolidation. The whole foundation remains candidate.
'''
(OUT/'SCIENTIFIC_SYNTHESIS.md').write_text(synthesis,encoding='utf-8')

print(json.dumps({'written':['LITERATURE_SNAPSHOT.json','SEARCH_LOG.md','SCIENTIFIC_SYNTHESIS.md','SCIENTIFIC_CLAIM_MAP.json'],
    'sources':len(sources),'full_text':sum(s['access']=='FULL_TEXT' for s in sources),
    'eligible':sum(s['prescriptive_support_eligible'] for s in sources),'claims':len(claims),'policy_consumers':len(consumer_map)},indent=2))
