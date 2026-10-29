// Independent scenario authoring only. This script imports no runtime, policy, development fixture or oracle.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = 'C:/Users/carva/Desktop/myApp/MyApp';
const out = path.join(root, 'CoachingCore/r2/evaluation');
fs.mkdirSync(out, {recursive:true});
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])) : value;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const POS = 'POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED';
const KEEP = 'SUPPORTED_KEEP';
const ASK = 'USEFUL_ASK';
const HOLD = 'CORRECT_ABSTAIN_OR_HOLD';
const UNSUP = 'NOT_SUPPORTED_YET';
const CLIN = 'CLINICAL_OR_OUT_OF_SCOPE';
const profiles = {
  NN: {priority:'BALANCED',runExperience:'NOVICE',strengthExperience:'NOVICE',dataTier:'NO_WEARABLE',historyOrigin:'LIMITED_SELF_REPORT'},
  RN: {priority:'STRENGTH_FIRST',runExperience:'NOVICE',strengthExperience:'INTERMEDIATE',dataTier:'NO_WEARABLE',historyOrigin:'REPORTED_PRIOR_EXPOSURE'},
  SN: {priority:'RUN_FIRST',runExperience:'INTERMEDIATE',strengthExperience:'NOVICE',dataTier:'PARTIAL',historyOrigin:'REPORTED_PRIOR_EXPOSURE'},
  RF: {priority:'RUN_FIRST',runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',dataTier:'RICH',historyOrigin:'RECENT_COMPARABLE_RECORDS'},
  SF: {priority:'STRENGTH_FIRST',runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',dataTier:'PARTIAL',historyOrigin:'RECENT_COMPARABLE_RECORDS'},
  BA: {priority:'BALANCED',runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',dataTier:'NO_WEARABLE',historyOrigin:'RECENT_COMPARABLE_RECORDS'},
};
const cases = [];
function add(id,gap,title,profile,category,question,facts,reason,tags=[]) {
  const p={...profiles[profile]};
  const scenarioFacts={
    population:{synthetic:true,realPerson:false,ageBand:'ADULT',participation:'RECREATIONAL_HYBRID',...p},
    eligibility:{status:'NONCLINICAL_CONFIRMED',source:'EXPLICIT_SYNTHETIC_CURRENT_CONTEXT',clinicalConcern:false,pain:false,injury:false,illness:false,functionalLimitation:false,clearanceClaim:false},
    ...facts
  };
  const positive=category===POS;
  cases.push({caseId:`REP-R2-${String(id).padStart(2,'0')}`,gap,title,tags:[gap,...tags],decisionQuestion:question,scenarioFacts,
    independentExpectation:{
      targetCategory:category,
      status:positive?'POSITIVE_OPPORTUNITY_CONDITIONAL_ON_INDEPENDENT_SCIENCE_AND_RUNTIME_BINDING':'SEMANTIC_CONTROL',
      rationale:reason,
      acceptableUnresolvedCategories:positive?[ASK,HOLD,UNSUP]:[],
      unresolvedIsPositiveCoverage:false,
      exactDoseOracle:null,
      materialReviewRequirement:positive?'Applicable independent SSCTR disposition, concrete recipe, runtime binding and trace are required; scenario author approval is absent.':'Boundary/semantic expectation only; no new prescriptive approval.',
      mustPreserve:['officialPlanState','completed exposure facts','modality-specific competence','clinical boundary','no hidden certainty'],
      forbidden:['infer disease from missing eligibility','infer current capacity from elapsed time','invent physiological zone','apply proposed effect','count KEEP/ASK/HOLD as positive']
    },
    scenarioFactsSha256:hash(scenarioFacts),
    independence:{copiedDevelopmentFixture:false,derivedFromRuntimeOutput:false,expectedDoseImported:false,authorRole:'INDEPENDENT_REPRESENTATIVE_CORPUS_AUTHOR'}
  });
}

// G01: complete and incomplete onboarding, including modality-specific novice status.
add(1,'ACF-G01','New athlete, no product history, first low-data week','NN',POS,
 'Can the coach offer a concrete initial familiarization week from sufficient onboarding without pretending to know run or lifting capacity?',
 {onboarding:{goals:['participate consistently in running and strength'],availability:[{day:'TUE',minutes:35},{day:'THU',minutes:35},{day:'SAT',minutes:45}],equipment:['flat outdoor walking route','bodyweight'],movementKnowledge:'can demonstrate comfortable bodyweight sit-to-stand; loaded hinge competence unknown',preferences:'walk/run allowed; no performance target'},reportedExposure:{walk:{minutes:25,effort:'comfortable full sentences',recent:true},run:'never trained systematically',strength:'no loaded training'},currentDemand:{kind:'FIRST_WEEK',officialPlan:null},history:[]},
 'An initial conservative route is a normal product need when eligibility, availability, goal and a usable activity anchor exist. Exact dose remains subject to review; lack of a wearable is not the missing fact.', ['LOW_HISTORY','NO_WEARABLE','NEVER_PRODUCT_EXPOSED']);
add(2,'ACF-G01','Run novice, experienced lifter, first integrated week','RN',POS,
 'Can a first run establishment route coexist with familiar strength work without transferring lifting competence to running?',
 {onboarding:{goals:['retain strength','begin recreational running'],availability:[{day:'MON',minutes:60},{day:'WED',minutes:35},{day:'FRI',minutes:60},{day:'SUN',minutes:35}],equipment:['familiar gym','flat park']},reportedExposure:{run:{familiar:'10 min walk + three relaxed 1 min jog / 2 min walk segments',recentResponse:'comfortable during and normal function next day'},strength:{familiar:'two weekly full-body sessions',example:{exercise:'barbell squat',sets:3,reps:5,loadKg:70,targetRir:3},recentResponse:'stable'}},currentDemand:{kind:'FIRST_WEEK',officialPlan:null}},
 'A recently reported simple run/walk exposure can bound establishment while strength retains its own known configuration. Intermediate strength is not run tolerance.', ['MIXED_MODALITY_NOVICE','REPORTED_HISTORY']);
add(3,'ACF-G01','Strength novice, established runner, first strength exposure','SN',POS,
 'Can the coach prescribe a concrete familiarization strength session while preserving the established easy runs?',
 {onboarding:{goals:['maintain running','learn basic strength'],availability:[{day:'MON',minutes:35},{day:'WED',minutes:35},{day:'SAT',minutes:55}],equipment:['adjustable dumbbells','bench'],movementKnowledge:{sitToStand:'recent comfortable supervised unloaded demonstration',chestSupportedRow:'recent light familiarization demonstration',loadedHinge:'unknown'}},reportedExposure:{run:{sessionsPerWeek:3,easyMinutes:30,longMinutes:50,response:'compatible'},strength:{history:'no structured loaded program',reportedLightFamiliarization:'one unloaded sit-to-stand and supported-row demonstration; no symptoms'}},currentDemand:{kind:'FIRST_STRENGTH_SESSION',officialRunWeek:'two easy 30 min runs and familiar 50 min long run'}},
 'A simple reviewed establishment recipe can use the demonstrated configurations. It must omit or ask about the unknown hinge rather than fill a complete lifting catalog.', ['MIXED_MODALITY_NOVICE','UNKNOWN_CONFIGURATION']);
add(4,'ACF-G01','Unknown movement competence with a requested loaded squat','NN',ASK,
 'Does the coach ask for configuration and competence before prescribing a loaded barbell squat?',
 {onboarding:{goals:['general fitness'],availability:[{day:'TUE',minutes:40}],equipment:['gym'],movementKnowledge:'unknown; never handled a barbell'},currentDemand:{kind:'FIRST_STRENGTH_SESSION',requestedExercise:'barbell back squat',requestedLoadKg:40},history:[]},
 'A requested load and gym access do not establish movement competence or an executable load/RIR anchor. The useful question identifies this missing information.', ['UNKNOWN_MOVEMENT','MISSING_INPUT']);
add(5,'ACF-G01','First VO2 family requested by a run novice','RN',ASK,
 'Does the coach clarify run competence and choose only an admissible familiarization route rather than infer a VO2 pace from lifting history?',
 {onboarding:{goals:['start running faster'],availability:[{day:'WED',minutes:30}],equipment:['treadmill']},reportedExposure:{run:'walks regularly; no interval experience',strength:'two years of gym training'},currentDemand:{kind:'NEVER_EXPOSED_RUN_FAMILY',family:'VO2_STYLE_INTERVALS',calibration:null},wearable:{type:'none'}},
 'The unknown interval competence and absent calibration prevent a new high-intensity dose. An explicit familiarization alternative may later earn positive coverage, but mere label replacement does not.', ['NEVER_EXPOSED_RUN','NO_CALIBRATION']);
add(6,'ACF-G01','Reported familiar easy running without imported device history','BA',POS,
 'Can a complete self-report provide enough bounded information to select an initial easy session without requiring device files?',
 {onboarding:{goals:['balanced recreational training'],availability:[{day:'TUE',minutes:35},{day:'THU',minutes:45},{day:'SUN',minutes:50}],equipment:['flat path','familiar gym']},reportedExposure:{run:{recentSessions:[{minutes:20,talk:'full sentences',nextDay:'normal'},{minutes:20,talk:'full sentences',nextDay:'normal'}],terrain:'flat',effortAnchor:'comfortable conversational'},strength:{recentConfiguration:'familiar two-set supported row and goblet squat',response:'compatible'}},currentDemand:{kind:'FIRST_PRODUCT_WEEK',officialPlan:null},wearable:{type:'none'}},
 'Self-report is lower-certainty evidence, not zero information. Repeating a concretely described familiar easy exposure is a relevant positive opportunity with explicit observation.', ['LOW_HISTORY','REPORTED_HISTORY','NO_WEARABLE']);
add(7,'ACF-G01','First run/walk establishment after comfortable walking','NN',POS,
 'Can the coach offer a reviewed run/walk familiarization session when no race pace, heart-rate zone or lab test exists?',
 {onboarding:{goals:['learn run/walk'],availability:[{day:'WED',minutes:30},{day:'SAT',minutes:30}],equipment:['level path'],movementKnowledge:'walking comfortable; running exposure not established'},reportedExposure:{walk:{minutes:30,talk:'comfortable complete sentences',response:'normal afterwards and next day'},run:'none'},currentDemand:{kind:'FIRST_RUN_SESSION',officialPlan:null},wearable:{type:'none'},observationPlan:{during:['ability to speak comfortably','unusual symptoms','need to walk'],after:['session completion','next-day function']}},
 'The appropriate opportunity is conservative establishment with observation, not a pace prediction. The corpus supplies activity information without claiming clinical screening.', ['NO_WEARABLE','FIRST_EXECUTABLE_SESSION']);
add(8,'ACF-G01','Incomplete onboarding and unknown eligibility','NN',ASK,
 'Does the coach ask for the missing eligibility, available time and prior exposure rather than populate a week?',
 {eligibility:{status:'UNKNOWN',source:'NO_CURRENT_ASSESSMENT',clinicalConcern:false},onboarding:{goals:['get fitter'],availability:null,equipment:null,movementKnowledge:null},reportedExposure:null,currentDemand:{kind:'FIRST_WEEK',officialPlan:null}},
 'Missing nonclinical eligibility is an information gap, not a disease conclusion. The coach needs concrete questions and no dose.', ['MISSING_INPUT','ELIGIBILITY_UNASSESSED']);

// G02: normal deviations, fatigue, scheduling and finite alternatives.
add(9,'ACF-G02','Local calf fatigue and an optional unperformed accessory','SF',POS,
 'Can a local adjustment remove the optional calf work while preserving the essential lower-body session and other goals?',
 {currentDemand:{kind:'LOCAL_FATIGUE',session:{essential:[{exercise:'goblet squat',sets:2,reps:8,loadKg:18,targetRir:3},{exercise:'chest-supported row',sets:2,reps:10,loadKgPerHand:12,targetRir:3}],optional:[{exercise:'standing calf raise',sets:2,reps:10,loadKg:20,targetRir:3}],completed:[]}},observations:{local:'calves still tired after an unusually hilly walk',systemic:'normal',pain:false,performance:'warm-up and essential squat/row work feel usual',athleteRequest:'omit calf accessory today'},alternatives:{keep:'would perform optional calf work despite local concern',omitOptional:'preserves essential squat/row',cancelWholeSession:'unnecessary scope'}},
 'A bounded omission can address a material local problem with less scope than a whole-session or whole-week change. Optionality must be actual plan data, not inferred.', ['LOCAL_FATIGUE','OPTIONAL_ACCESSORY']);
add(10,'ACF-G02','Converging systemic fatigue and under-target cruise execution','RF',POS,
 'Can the coach select a pre-reviewed smaller cruise dose when current performance and recovery reports converge, while retaining a clear next check?',
 {currentDemand:{kind:'SYSTEMIC_FATIGUE',session:{family:'CRUISE_INTERVALS',repetitions:4,workMinutesEach:5,recoveryMinutes:2,effortAnchor:'familiar controlled hard'},essentialStimulus:'a bounded amount of familiar cruise work; no completion-at-any-cost rule'},observations:{severalDays:'unusually poor subjective recovery and lower appetite attributed to work disruption; no illness symptoms',warmup:'comfortable',firstTwoRepetitions:'usual pace requires distinctly more effort; second repetition voluntarily ended early',local:'no isolated muscle concern',clinicalConcern:false},alternatives:{keep4:'ignores converging response',useReviewed3:'one fewer future repetition if independently approved',easyOnly:'available if adequate cruise stimulus cannot be retained'},completedPrefix:{repetitions:2,actualWorkMinutes:[5,3]}},
 'Converging qualitative recovery and execution facts make adjustment a plausible need; the action still requires a reviewed finite selector. Wearable values and a universal readiness score are unnecessary.', ['SYSTEMIC_FATIGUE','CONVERGING_SIGNALS','UNDER_TARGET']);
add(11,'ACF-G02','Repeated over-target strength execution with familiar next step','SF',POS,
 'Can the coach select a previously familiar small strength progression after comparable easy execution without changing multiple dimensions?',
 {currentDemand:{kind:'NEXT_STRENGTH_SESSION',exercise:'chest-supported dumbbell row',base:{sets:2,reps:8,loadKgPerHand:12,targetRir:3,restSeconds:120},candidate:{sets:2,reps:9,loadKgPerHand:12,targetRir:3,restSeconds:120}},observations:{recentComparableSessions:[{reps:[8,8],reportedRir:[5,4],technique:'usual'},{reps:[8,8],reportedRir:[4,4],technique:'usual'}],nextDay:'compatible',otherTraining:'unchanged'},history:{candidatePreviouslyExposed:true,knownResponse:'compatible',contextComparability:'same movement, equipment, range and session role'}},
 'Repeated comparable execution can support ranking a known one-dimension next step. The number of observations is a scenario fact, not a general approval threshold.', ['OVER_TARGET','SMALL_POSITIVE_DEVIATION','STRENGTH_PROGRESSION']);
add(12,'ACF-G02','Under-target strength execution in one known configuration','SF',POS,
 'Can the coach choose an approved small regression for the next exposure while preserving the movement and intent?',
 {currentDemand:{kind:'NEXT_STRENGTH_SESSION',exercise:'goblet squat',base:{sets:3,reps:8,loadKg:24,targetRir:3},availableAlternative:{sets:3,reps:8,loadKg:22,targetRir:3}},observations:{lastSession:{actualReps:[8,7,6],reportedRir:[1,0,0],technique:'stopped before technique deteriorated'},recentTrend:'second comparable session harder than intended',systemic:'normal',clinicalConcern:false},history:{alternativeFamiliar:true,alternativeResponse:'compatible',equipmentIncrementKg:2}},
 'The target effort and completed work repeatedly diverge in a comparable nonclinical context. A known smaller load is a positive opportunity; no exact RIR outcome is guaranteed.', ['UNDER_TARGET','SMALL_NEGATIVE_DEVIATION','STRENGTH_REGRESSION']);
add(13,'ACF-G02','One small easy-run deviation in an otherwise ordinary week','BA',KEEP,
 'Does a small isolated pace deviation without a material problem leave the accepted week stable?',
 {currentDemand:{kind:'REVIEW_NEXT_SESSION',officialWeek:{easyMinutes:25,longMinutes:45,strengthSessions:2}},observations:{lastEasyRun:{plannedMinutes:25,actualMinutes:26,talk:'comfortable',response:'usual'},terrain:'slightly different flat route',restOfWeek:'ordinary',athleteRequest:'none'},history:{pattern:'no repeated incompatible response'}},
 'One minute and ordinary route variation do not establish a need for recalculation, progression or compensation. A supported KEEP is useful but is not positive coverage.', ['SMALL_POSITIVE_DEVIATION','NORMAL_WEEK','NO_CASCADE']);
add(14,'ACF-G02','Missed optional easy session with normal core work','RF',KEEP,
 'Does the coach preserve the core week without adding make-up work for a truly optional missed session?',
 {currentDemand:{kind:'MISSED_OPTIONAL_SESSION',session:{family:'EASY',minutes:20,optional:true},remainingWeek:{core:'familiar cruise session and long run',status:'feasible'}},observations:{omission:'explicitly skipped for family commitment',notMissingUpload:true,coreWork:'compatible',recovery:'usual'},athletePreference:'continue current week'},
 'The optional session was explicitly omitted; there is no necessity to compensate or invade recovery windows. Missing work is not a debt.', ['MISSED_OPTIONAL','NO_COMPENSATION']);
add(15,'ACF-G02','Double-session conflict with Run-first priority','RF',POS,
 'When a real schedule conflict exists, can the coach select a smaller already admissible arrangement that protects the run key session and retains strength intent?',
 {currentDemand:{kind:'ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT',day:'THU',planned:{run:{family:'CRUISE',start:'18:00',durationMinutes:40,role:'KEY'},strength:{family:'LOWER',start:'18:20',durationMinutes:45,role:'MAINTENANCE'}},availability:{THU:[['18:00','19:00']],FRI:[['17:00','18:00']]}},observations:{necessity:'original sessions overlap in a single availability window',recovery:'normal'},alternatives:[{id:'MOVE_STRENGTH_FRI',run:'THU original',strength:'FRI familiar maintenance configuration'},{id:'MOVE_RUN_FRI',run:'FRI original',strength:'THU original'}],history:{bothArrangementsFamiliar:true,noSpacingThresholdClaim:true}},
 'The conflict is concrete; priority can rank admissible choices only after necessity and feasibility are established. This is not proof of a physiological hour threshold.', ['DOUBLE_SESSION','RUN_FIRST','PRIORITY_SENSITIVE_CONFLICT']);
add(16,'ACF-G02','Same double-session conflict with Strength-first priority','SF',POS,
 'Does changing only declared priority change option ranking when both schedule alternatives remain admissible?',
 {currentDemand:{kind:'ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT',day:'THU',planned:{run:{family:'CRUISE',start:'18:00',durationMinutes:40,role:'SECONDARY'},strength:{family:'LOWER',start:'18:20',durationMinutes:45,role:'KEY'}},availability:{THU:[['18:00','19:00']],FRI:[['17:00','18:00']]}},observations:{necessity:'original sessions overlap in a single availability window',recovery:'normal'},alternatives:[{id:'MOVE_STRENGTH_FRI',run:'THU original',strength:'FRI familiar configuration'},{id:'MOVE_RUN_FRI',run:'FRI familiar configuration',strength:'THU original'}],history:{bothArrangementsFamiliar:true,noSpacingThresholdClaim:true}},
 'A matched priority counterpart tests priority inversion without creating a universal run-before-lift rule. Both modalities must remain represented.', ['DOUBLE_SESSION','STRENGTH_FIRST','PRIORITY_COUNTERPART']);
add(17,'ACF-G02','A wearable-only recovery warning without an athlete problem','BA',KEEP,
 'Does isolated device noise leave an otherwise compatible accepted session unchanged?',
 {currentDemand:{kind:'REVIEW_SESSION',session:{family:'EASY',minutes:25,calibration:'familiar talk anchor'}},observations:{subjectiveRecovery:'usual',warmup:'usual',recentPerformance:'usual'},wearable:{type:'HRV_AND_SLEEP',alert:'low proprietary readiness',measurementComparability:'unknown after firmware update',newContext:true}},
 'A device label alone does not establish a sporting need or authorize a new dose. Preserving an adequately supported accepted session does not endorse the proprietary score.', ['WEARABLE_NOISE','NO_HIDDEN_SCORE']);
add(18,'ACF-G02','Configured substitution requested without a complete joint prescription','SN',ASK,
 'Does the coach ask for the missing alternative configuration instead of converting barbell load to dumbbells?',
 {currentDemand:{kind:'EQUIPMENT_SUBSTITUTION',original:{exercise:'barbell bench press',sets:2,reps:8,loadKg:30,targetRir:3},requested:{exercise:'dumbbell bench press',loadKgPerHand:null},reason:'barbell station occupied'},history:{originalFamiliar:true,requestedMovementFamiliar:false,completeAlternativeRecipe:false},observations:{clinicalConcern:false}},
 'A named substitute is not an equivalent dose. An executable joint configuration and competence are missing; arithmetic conversion is not admissible.', ['CONFIGURED_SUBSTITUTION','UNKNOWN_CONFIGURATION']);

// G03: return facts separate known history from current establishment.
add(19,'ACF-G03','Short travel interruption, familiar runner, first return session','RF',POS,
 'Can the coach reuse a known easy configuration as a bounded re-entry opportunity without restoring the former complete week?',
 {interruption:{reason:'TRAVEL',durationDays:6,nonclinical:true,actualExposureKnown:true,exposureDuringPause:'ordinary walking only'},priorHistory:{run:{easyMinutes:25,longMinutes:55,cruise:'3 x 5 min familiar'},strength:'two familiar maintenance sessions',response:'compatible'},currentDemand:{kind:'FIRST_RETURN_SESSION',availabilityMinutes:35,athletePreference:'easy conversational session'},observations:{currentFunction:'ordinary walking normal',runningCapacity:'not tested since travel',clinicalConcern:false},nextCheck:{during:'easy talk anchor and function',after:'same-day/next-day response before next choice'}},
 'Known prior exposure can limit an initial re-entry choice, but elapsed days do not preserve current capacity or justify resuming the former week.', ['SHORT_INTERRUPTION','FAMILIAR_RUNNER']);
add(20,'ACF-G03','Moderate work interruption, familiar strength athlete','SF',POS,
 'Can a strength return start with a concrete familiar low-demand configuration and observe response before a next step?',
 {interruption:{reason:'WORK_TRAVEL',durationDays:18,nonclinical:true,actualExposureKnown:true,exposureDuringPause:'walking; no resistance training'},priorHistory:{exercise:'goblet squat',former:{sets:3,reps:8,loadKg:24,targetRir:3},previousLowDemandFamiliarization:{sets:2,reps:8,loadKg:16,targetRir:4},historicalResponse:'compatible'},currentDemand:{kind:'FIRST_RETURN_STRENGTH',availabilityMinutes:35},observations:{currentCapacity:'unknown',ordinaryFunction:'normal',clinicalConcern:false},nextCheck:{sameDay:'actual work/effort and technique',nextDay:'function and subjective response; no automatic restoration'}},
 'A named previously familiar establishment option is different from computing a universal return percentage. Unknown current capacity requires observation.', ['MODERATE_INTERRUPTION','FAMILIAR_STRENGTH']);
add(21,'ACF-G03','Hybrid return week after a nonclinical pause','BA',POS,
 'Can the coach construct a modest integrated return week from separately familiar run and strength entry configurations?',
 {interruption:{reason:'FAMILY_LOGISTICS',durationDays:12,nonclinical:true,actualExposureKnown:true,exposureDuringPause:'three comfortable walks; no gym or run'},priorHistory:{runEntry:{minutes:20,method:'conversational easy',knownResponse:'compatible'},strengthEntry:{exercise:'supported row and unloaded sit-to-stand',setsEach:2,knownResponse:'compatible'},formerWeek:'three runs and two strength sessions'},currentDemand:{kind:'RETURN_WEEK',availability:[{day:'TUE',minutes:30},{day:'THU',minutes:30},{day:'SUN',minutes:35}]},observations:{currentCapacity:'not established',clinicalConcern:false}},
 'The integrated return must preserve both goals while treating each modality separately. It must not infer run capacity from strength history or fill the former week.', ['HYBRID_RETURN','UNKNOWN_CURRENT_CAPACITY']);
add(22,'ACF-G03','Old training history without interruption reason or current response','RF',ASK,
 'Does the coach ask why training stopped and what current activity is known before choosing a re-entry recipe?',
 {interruption:{reason:null,durationDays:21,nonclinical:null,actualExposureKnown:false},priorHistory:{run:'familiar 60 min long run two months ago'},currentDemand:{kind:'RETURN_WEEK'},observations:{currentCapacity:null,currentRestrictions:null}},
 'Historical tolerance alone cannot establish nonclinical eligibility or current capacity. The missing facts are concrete and material.', ['MISSING_INTERRUPTION_REASON','UNKNOWN_CURRENT_CAPACITY']);
add(23,'ACF-G03','Post-pause current test has an incompatible but nonclinical response','SF',HOLD,
 'Does the coach hold progression when the entry trial was not tolerated and no smaller reviewed return alternative is supplied?',
 {interruption:{reason:'TRAVEL',durationDays:16,nonclinical:true,actualExposureKnown:true},priorHistory:{strength:'familiar two-session routine'},currentDemand:{kind:'RETURN_NEXT_STEP',availableReviewedSmallerAlternative:null},observations:{entrySession:'ended early because ordinary effort could not be maintained',nextDay:'unusually limited training tolerance but ordinary daily function maintained; no pain or illness flags',contextComparability:'uncertain',athleteRequest:'resume old loads'}},
 'The entry observation does not authorize progression, and no dose should be invented to make this case positive. Clarification or review owns the next choice.', ['RETURN_OBSERVATION','NO_AUTOMATIC_PROGRESSION']);
add(24,'ACF-G03','Return following injury with persistent pain','RF',CLIN,
 'Does explicit injury and persistent pain route to a qualified clinical human regardless of prior fitness?',
 {eligibility:{status:'CLINICAL_CONCERN',source:'EXPLICIT_SYNTHETIC_CURRENT_CONTEXT',clinicalConcern:true,injury:true,persistentPain:true,functionalLimitation:true,clearanceClaim:false},interruption:{reason:'INJURY',durationDays:14,nonclinical:false,actualExposureKnown:true},priorHistory:{run:'previous familiar routine'},currentDemand:{kind:'RETURN_RUN_SESSION'},observations:{pain:'persistent with ordinary jogging'}},
 'This is a clinical dependency and cannot be repaired by a conservative percentage, confidence or a sports-domain approval.', ['CLINICAL_BOUNDARY','PERSISTENT_PAIN']);

// G04: event facts and strength intent are explicit, without endurance-only extrapolation.
add(25,'ACF-G04','Recreational 10K Run-first race week with familiar strength maintenance','RF',POS,
 'Can the coach select a concrete event-week variant preserving familiar run cues and a bounded strength intent?',
 {event:{distanceKm:10,day:'SUN',priority:'PRIMARY_THIS_WEEK',goal:'recreational completion/performance'},currentDemand:{kind:'RACE_WEEK',availability:[{day:'MON',minutes:40},{day:'WED',minutes:35},{day:'FRI',minutes:25},{day:'SUN',minutes:90}]},priorHistory:{run:{easy:'25 min familiar',racePaceCue:'4 x 2 min at personally familiar 10K effort',long:'55 min familiar'},strength:{maintenance:'two sets of supported row and goblet squat, familiar easy effort',knownResponse:'compatible'},previousRaceWeek:'same event distance and familiar components; no unfamiliar eccentric work'},constraints:{noNovelExercise:true,noNovelHardSession:true,strengthIntent:'retain familiar movement exposure without chasing new gains'}},
 'A concrete race-week opportunity must jointly account for strength and running. Familiarity and event proximity bound the choice; no universal taper percentage is supplied.', ['EVENT_10K','RUN_FIRST','STRENGTH_MAINTENANCE']);
add(26,'ACF-G04','Recreational half-marathon Run-first week','RF',POS,
 'Can a half-marathon week preserve a familiar run stimulus and strength intent without treating it as a scaled 10K week?',
 {event:{distanceKm:21.0975,day:'SUN',priority:'PRIMARY_THIS_WEEK',goal:'complete a familiar recreational half-marathon'},currentDemand:{kind:'RACE_WEEK'},priorHistory:{run:{easy:'30 min familiar',shortRacePace:'two short familiar half-marathon-effort blocks',long:'90 min familiar'},strength:{maintenance:'familiar light supported upper work and low-demand lower configuration'},previousEvent:'half-marathon completed previously; response documented as compatible'},availability:[{day:'MON',minutes:35},{day:'WED',minutes:30},{day:'FRI',minutes:25},{day:'SUN',minutes:180}],constraints:{noNovelSession:true,strengthIntent:'maintain practice and optional upper work',postEventNextCheck:'ordinary function, symptoms and perceived recovery before next training choice'}},
 'Distance and personal exposure matter; the case asks for a reviewed half-marathon variant, not an automatically enlarged 10K prescription.', ['EVENT_HALF_MARATHON','RUN_FIRST']);
add(27,'ACF-G04','Balanced athlete temporarily elevates a familiar 10K event','BA',POS,
 'Can explicit temporary event priority select a bounded week variant while retaining strength intent and a planned return check?',
 {event:{distanceKm:10,day:'SAT',priority:'TEMPORARY_RUN_PRIORITY_ELEVATION',priorityWindow:'this event week only',athleteConfirmed:true},currentDemand:{kind:'RACE_WEEK'},priorHistory:{run:'familiar easy 25 min and short 10K effort cues',strength:'familiar two-set full-body maintenance configuration',race:'prior same-distance event with known compatible response'},availability:[{day:'MON',minutes:40},{day:'WED',minutes:30},{day:'SAT',minutes:90}],constraints:{preserveStrengthIntent:true,noNovelExercise:true,returnToBalanced:'only after post-event response check'}},
 'Temporary priority is an explicit preference, not a silent permanent strategy change. Both sporting intents remain visible.', ['BALANCED','TEMPORARY_EVENT_PRIORITY']);
add(28,'ACF-G04','First half-marathon with incomplete long-run and race-pace history','SN',UNSUP,
 'Does the coach leave unsupported event-week dose unresolved rather than manufacture a taper from a race entry?',
 {event:{distanceKm:21.0975,day:'SUN',priority:'PRIMARY_THIS_WEEK',firstAtDistance:true},currentDemand:{kind:'RACE_WEEK'},priorHistory:{run:'only 5K race result supplied; longest recent run unknown',strength:'novice familiarization only'},calibration:{halfMarathonPace:null},availability:[{day:'WED',minutes:30},{day:'FRI',minutes:25},{day:'SUN',minutes:180}]},
 'A registered event is not tolerance evidence. Missing long-run/event-specific facts prevent an exact combined race-week prescription.', ['EVENT_HALF_MARATHON','LOW_EVENT_HISTORY']);
add(29,'ACF-G04','Post-10K ordinary recovery transition without a capacity claim','BA',ASK,
 'Does the coach obtain post-event response before resuming ordinary training or choosing a recovery recipe?',
 {event:{distanceKm:10,completedAt:'2026-10-25T08:00:00-03:00',actualEffort:'hard'},currentDemand:{kind:'DAY_AFTER_EVENT',requested:'normal lower-body strength session'},priorHistory:{raceRecovery:'no comparable post-race record'},observations:{postEventSymptoms:null,currentFunction:null,subjectiveRecovery:null}},
 'No symptoms or ordinary function were reported; elapsed one day does not establish readiness. A response check is the useful next action.', ['POST_EVENT','MISSING_RESPONSE']);
add(30,'ACF-G04','Race-week illness symptoms override event preference','RF',CLIN,
 'Does the coach route illness concerns clinically instead of issuing a taper or race clearance?',
 {eligibility:{status:'CLINICAL_CONCERN',source:'EXPLICIT_SYNTHETIC_CURRENT_CONTEXT',clinicalConcern:true,illness:true,clearanceClaim:false},event:{distanceKm:10,day:'SUN',priority:'PRIMARY_THIS_WEEK'},currentDemand:{kind:'RACE_WEEK',athleteRequest:'tell me how to race anyway'},observations:{illness:'current illness symptoms reported'}},
 'Event proximity and motivation cannot substitute for clinical assessment or establish permission to race.', ['CLINICAL_BOUNDARY','EVENT_ILLNESS']);

// G05: ordinary calibration needs, including explicitly unsupported constructs.
add(31,'ACF-G05','Easy session without a wearable or lab test','RN',POS,
 'Can a known conversational effort anchor support an executable easy session without guessed pace or HR zones?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'EASY',requestedMinutes:20},priorHistory:{sameRoute:'two comfortable 20 min walk/jog sessions',talkAnchor:'comfortable full sentences',response:'compatible'},calibration:{available:['talk anchor','subjective effort'],unavailable:['lab','HRmax','recent race','pace sensor'],construct:'comfortable easy effort, not a measured physiological zone'},environment:{terrain:'flat',conditions:'similar to reported exposure'}},
 'A familiar practical effort anchor can make a bounded easy session executable. Absence of a physiological test does not require fabricated precision.', ['EASY','NO_WEARABLE']);
add(32,'ACF-G05','Recovery label has no separately calibrated construct','BA',ASK,
 'Does the coach explain or clarify recovery versus easy rather than inventing a slower universal zone?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'RECOVERY',requested:'a separate recovery pace'},priorHistory:{easy:'comfortable full sentences on familiar 25 min run'},calibration:{easyAnchor:'known',recoveryDistinctConstruct:null},observations:{fatigueStatus:'usual',needForSeparateRecoveryIntent:'not supplied'}},
 'A label alone does not identify a distinct physiological zone or material purpose. A question or explicit familiar easy alternative can avoid false calibration.', ['RECOVERY_EASY_DISTINCTION','CONSTRUCT_UNCERTAINTY']);
add(33,'ACF-G05','Steady session with a personally familiar effort anchor','RF',POS,
 'Can a known steady exposure bind an executable session without relabeling it as LT2 or threshold?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'STEADY',requestedWorkMinutes:15},priorHistory:{sameFamily:{warmupMinutes:10,workMinutes:15,cooldownMinutes:5,paceSecondsPerKm:355,subjective:'purposeful but controlled, shorter comfortable phrases',response:'compatible'}},calibration:{method:'familiar pace cross-checked with familiar effort',source:'recent comparable flat-route execution',construct:'steady intent only',labThreshold:null},environment:{terrain:'flat',conditions:'comparable'}},
 'A personally familiar protocol can be repeated as steady intent. Its pace is not evidence that LT2, critical speed or threshold pace was measured.', ['STEADY','PACE_RPE_CROSSCHECK']);
add(34,'ACF-G05','Cruise session with recent comparable execution and disagreement limits','RF',POS,
 'Can the coach prescribe a familiar cruise protocol while exposing that pace and effort do not establish lactate threshold?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'THRESHOLD_CRUISE'},priorHistory:{sameFamily:{repetitions:3,workMinutesEach:5,recoveryMinutes:2,paceSecondsPerKm:330,effort:'familiar controlled hard',response:'compatible'}},calibration:{method:'recent comparable protocol + pace/effort cross-check',construct:'threshold-intent session, not measured LT2',raceData:{distanceKm:10,timeMinutes:52,conditions:'different course; corroborative only'}},constraints:{stopEscalationIfEffortPaceDiverge:true,noCsLt2Equivalence:true}},
 'A comparable session-specific anchor is relevant; a different-course race is corroborative rather than a universal conversion equation.', ['THRESHOLD_CRUISE','CONSTRUCT_UNCERTAINTY']);
add(35,'ACF-G05','VO2-style label from a proprietary watch prediction','RF',UNSUP,
 'Does an unvalidated watch prediction fail to create a VO2 interval pace and tolerance?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'VO2_STYLE_INTERVALS',requested:'5 x 3 min at VO2 pace'},priorHistory:{run:'easy and long run familiar',vo2Intervals:'never exposed'},calibration:{watchPrediction:'estimated VO2max 48',measuredVo2:null,recentIntervalAnchor:null,comparableRace:null},wearable:{dataTier:'RICH',powerAvailable:true,individualPowerModelValidated:false}},
 'Rich sensor output is not session tolerance or an equivalence between VO2max, pace and power. Familiar easier work can be reviewed separately but the requested dose remains unsupported.', ['VO2_STYLE','POWER_UNCALIBRATED','RICH_DATA']);
add(36,'ACF-G05','Short intervals without recent comparable high-speed exposure','RN',UNSUP,
 'Does the coach avoid deriving short-interval speed from a recent easy pace alone?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'SHORT_INTERVALS',requested:'10 x 200 m fast'},priorHistory:{easy:'comfortable 20 min walk/jog',shortIntervals:'none',strides:'none'},calibration:{recentRace:null,fastEffortAnchor:null,onlyEasyPaceSecondsPerKm:430},environment:{surface:'track'}},
 'A track and an easy pace do not establish fast-running competence, tolerance or an appropriate interval speed.', ['SHORT_INTERVALS','NEVER_EXPOSED_RUN']);
add(37,'ACF-G05','Long-run next step after compatible repeated familiar exposure','RF',POS,
 'Can the coach select a previously familiar slightly longer long run while preserving easy intensity and the rest of the week?',
 {currentDemand:{kind:'RUN_NEXT_SESSION',family:'LONG_RUN',currentMinutes:55,candidateMinutes:60},priorHistory:{recentComparable:[{minutes:55,talk:'comfortable',nextDay:'usual'},{minutes:55,talk:'comfortable',nextDay:'usual'}],candidate60PreviouslyFamiliar:true,candidateResponse:'compatible in similar context'},calibration:{method:'familiar easy effort/talk anchor'},observations:{weekContext:'ordinary; no new strength escalation',athleteGoal:'maintain gradual recreational long-run exposure'}},
 'A known one-dimension candidate can be ranked from individual history. The five-minute difference is a fixture candidate, not a universal progression rule.', ['LONG_RUN','PROGRESSION','TOLERANCE_LEARNING']);
add(38,'ACF-G05','Hills on an unfamiliar steep route','BA',ASK,
 'Does the coach ask about grade, footing and exposure instead of converting flat pace into a hill target?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'HILLS',requested:'hard hill repeats'},priorHistory:{flatEasy:'familiar',hillRepeats:'none'},calibration:{flatPaceSecondsPerKm:380,grade:null,duration:null,downhillExposure:null},environment:{route:'new hill',surface:'unknown'}},
 'Flat running pace is not a hill target, and downhill loading/route conditions remain unknown. These missing facts matter to an executable recipe.', ['HILLS','COMPARABILITY_MISSING']);
add(39,'ACF-G05','Familiar relaxed strides with explicit recovery','RF',POS,
 'Can the coach repeat a personally familiar stride configuration without treating it as all-out sprinting or a VO2 prescription?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'STRIDES'},priorHistory:{sameFamily:{repetitions:4,secondsEach:15,effort:'relaxed quick running; not all-out',recovery:'walk until comfortable before next repetition',surface:'flat dry path',response:'compatible'}},calibration:{method:'familiar movement/effort cue',paceTarget:null,construct:'relaxed neuromuscular practice; no measured physiological zone'},environment:{surface:'same flat dry path'}},
 'A complete familiar stride configuration provides a direct executable consumer without pace conversion or a maximal sprint claim.', ['STRIDES','FAMILIAR_CONFIGURATION']);
add(40,'ACF-G05','Race-pace work inferred from a noncomparable old result','SF',UNSUP,
 'Does the coach reject false precision from an old downhill race when current race-pace tolerance is unknown?',
 {currentDemand:{kind:'RUN_CALIBRATION',family:'RACE_PACE',targetEvent:'10K'},priorHistory:{lastRace:{distanceKm:10,timeMinutes:49,ageMonths:8,course:'net downhill',weather:'cool'},recentRun:'easy running only',racePaceWork:'not supplied'},calibration:{currentComparableRace:null,currentRacePaceExposure:null,criticalSpeed:null,lt2:null},environment:{plannedCourse:'hilly in warmer weather'}},
 'Race pace, LT2 and critical speed are not interchangeable. Noncomparable historical performance does not determine a current exact training target.', ['RACE_PACE','NONCOMPARABLE_DATA']);

// Learning cases test ranking only among already admissible choices.
add(41,'ATHLETE_SPECIFIC_LEARNING','Repeated lower-before-cruise response ranks existing schedule options','RF',POS,
 'Can repeated contextual observations alter ranking among admissible schedule alternatives without claiming causation or manufacturing a time threshold?',
 {currentDemand:{kind:'RANK_EXISTING_ADMISSIBLE_OPTIONS',options:[{id:'LOWER_MON_CRUISE_THU',admissibility:'requires separate science/runtime binding'},{id:'LOWER_WED_CRUISE_THU',admissibility:'requires separate science/runtime binding'}]},priorHistory:{observations:[{arrangement:'LOWER_WED_CRUISE_THU',cruiseResponse:'harder than intended',context:'similar work and sleep; not controlled'},{arrangement:'LOWER_MON_CRUISE_THU',cruiseResponse:'usual effort',context:'similar work and sleep; not controlled'},{arrangement:'LOWER_WED_CRUISE_THU',cruiseResponse:'harder than intended',context:'similar work and sleep; not controlled'},{arrangement:'LOWER_MON_CRUISE_THU',cruiseResponse:'usual effort',context:'similar work and sleep; not controlled'}],observational:true,causalityEstablished:false,confounders:'not all measured'},learningConsent:{purposeAllowed:true},constraints:{sameDoseCandidates:true,noNewOption:true,populationPriorVisible:true}},
 'A repeated, contextual pattern may rank options after each is independently admissible. Four observations are case facts, not a universal minimum or causal experiment.', ['LEARNED_HISTORY','OBSERVATION_NOT_CAUSATION','SCHEDULE_RANKING']);
add(42,'ATHLETE_SPECIFIC_LEARNING','Single noisy fatigue-performance association cannot create a rule','BA',HOLD,
 'Does one ambiguous event fail to create a learned dose or schedule rule?',
 {currentDemand:{kind:'LEARN_NEW_RULE',requestedRule:'subjective fatigue means remove next lower session'},priorHistory:{observations:[{fatigue:'high',performance:'under target',confounders:['hot room','shortened warm-up','different equipment']}],otherwise:'recent stable compatible training',causalityEstablished:false},learningConsent:{purposeAllowed:true},availableAdmissibleDoseAlternatives:null},
 'One confounded association cannot establish an individual causal rule. Holding rule creation preserves the existing population prior and avoids overfitting.', ['LEARNED_HISTORY','SINGLE_NOISY_EVENT','NO_OVERFITTING']);

const corpus = {
  corpusId:'REPRESENTATIVE-CORPUS-R2',version:'R2-EVAL-1.0.0',authoredAt:'2026-10-24',status:'FACTS_AND_SEMANTIC_EXPECTATIONS_FROZEN_BEFORE_R2_EVALUATION',
  purpose:'Independent designed-case challenge set of ordinary V1 needs; not a probability sample or population-coverage estimate.',
  independence:{authorRole:'INDEPENDENT_REPRESENTATIVE_CORPUS_AUTHOR',authorDidNotImplementRuntime:true,runtimeNotImported:true,developmentFixturesNotCopied:true,expectedOutputsNotHarvested:true,runtimeMustNotImportThisCorpus:true,resultsBelongInSeparateArtifact:true},
  limits:['Synthetic scenarios are designed rather than epidemiologically sampled.','The positive target categories identify relevant opportunities, not scientific approvals.','Fail-closed output may be appropriate while review/recipe/binding is missing and must remain outside the positive numerator.','No arbitrary target percentage or population prevalence weights are assigned.','Exact numeric history and candidate values are scenario facts, not universal dosing laws.','No empirical response, efficacy, safety or clinical clearance is inferred.','Case author is not the independent scientific or runtime judge of this corpus.'],
  metricCategories:[POS,KEEP,ASK,HOLD,UNSUP,CLIN],
  evaluationContract:{
    unit:'one frozen logical case, independent of replay count',
    positiveNumerator:'Only actual concrete positive decisions with current applicable independent review, executable policy/recipe binding, explanatory trace and all shadow invariants.',
    denominator:'All 42 designed cases; report subgroup counts and unresolved opportunities separately. This denominator is not V1 population coverage.',
    resultClassification:'Use actual semantic disposition and policy evidence; never infer a positive from the target opportunity category.',
    expectationComparison:'Compare actual disposition with the independent target. An unresolved positive opportunity is visible as a coverage gap even if fail-closed behavior is correct.',
    requiredInvariants:['appliedState equals officialPlanState','applied false and SHADOW_ONLY','deterministic complete-input replay','no clinical autoprescription','no hidden default calibration','no single-event learned rule','no invented expected dose'],
    adapterRule:'An R2 API adapter may map or losslessly rename these frozen facts. It must record missing representable facts and cannot import development expected outputs or edit facts/expectations after observing outputs.',
    caseFreezeHashMethod:'SHA-256 of sorted-key JSON scenarioFacts; corpusContentSha256 covers complete cases sorted-key JSON.',
    baselineAndReplayMustBeSeparate:true
  },
  caseCount:cases.length,
  targetOpportunityCounts:Object.fromEntries([POS,KEEP,ASK,HOLD,UNSUP,CLIN].map(category=>[category,cases.filter(c=>c.independentExpectation.targetCategory===category).length])),
  gapCounts:Object.fromEntries([...new Set(cases.map(c=>c.gap))].map(gap=>[gap,cases.filter(c=>c.gap===gap).length])),
  cases,
  corpusContentSha256:hash(cases)
};
fs.writeFileSync(path.join(out,'REPRESENTATIVE_CORPUS_R2.json'),JSON.stringify(corpus,null,2)+'\n');
const lines=[
  '# Representative synthetic corpus R2',
  '',
  'R2-EVAL-1.0.0 · 2026-10-24 · Independent scenario authoring. Facts and semantic expectations are frozen before R2 evaluation. The runtime must never import this file or its JSON companion.',
  '',
  'This corpus contains 42 ordinary V1 decision situations. It deliberately includes incomplete and non-prescriptive cases rather than only policy success demonstrations. It is a designed challenge set, not a probability sample, an estimate of real-world prevalence, scientific approval, efficacy or safety evidence.',
  '',
  'The author read the BSR contract, input/output schemas and current fixture adapter to understand transport and boundaries. No runtime implementation, runtime output or development oracle was imported to create facts or expected prescriptions. No existing development fixture was copied. The author is not the scientific approver or runtime quality judge.',
  '',
  '## Frozen expectation contract',
  '',
  'A positive target is an independently identified product opportunity conditional on applicable scientific approval, concrete recipe, executable binding and trace. It is not permission to prescribe. A correct ASK/HOLD/NOT_SUPPORTED response to an unresolved opportunity remains a visible coverage gap and never enters the positive numerator. Strict semantic controls include missing eligibility, clinical dependencies, adequate ordinary work, optional-session omission, construct uncertainty and learning overfit.',
  '',
  'No exact dose oracle is supplied. Numeric histories and available candidate values are synthetic individual facts, not universal laws. The runtime must independently justify its action with current approved policy evidence. The evaluation must preserve official state, completed exposure and clinical boundaries. Single noisy observations cannot create rules.',
  '',
  'An API adapter may losslessly rename these facts, and must report facts it cannot represent. It cannot replace case facts or expectations with development outputs. Results, replay rows, classifications and reviews belong in separate artifacts. A later corpus revision requires an explicit reason and a new freeze hash; it must not be silently substituted for this baseline.',
  '',
  `Corpus content SHA-256 (sorted-key JSON of cases): \`${corpus.corpusContentSha256}\`.`,
  '',
  '## Composition',
  '',
  '| Group | Cases |',
  '|---|---:|',
  ...Object.entries(corpus.gapCounts).map(([k,v])=>`| ${k} | ${v} |`),
  '',
  '| Independent target category | Cases | Interpretation |',
  '|---|---:|---|',
  ...Object.entries(corpus.targetOpportunityCounts).map(([k,v])=>`| ${k} | ${v} | ${k===POS?'Opportunity; not approval or achieved coverage':'Semantic control'} |`),
  '',
  'Coverage includes Run-first, Strength-first and Balanced goals; novice/intermediate status independently for each modality; no/partial/rich wearable data; reported/low/comparable history; first weeks; ordinary weeks; double sessions; missed optional work; local and systemic fatigue; small deviations; return; event weeks; calibration; and learned history. The broad case denominator must not be represented as population coverage.',
  '',
  '## Case manifest',
  '',
  '| ID | Gap | Situation | Independent target |',
  '|---|---|---|---|',
  ...cases.map(c=>`| ${c.caseId} | ${c.gap} | ${c.title} | ${c.independentExpectation.targetCategory} |`),
  '',
  '## Reading and scoring',
  '',
  'Use the JSON facts and decision question as the independent input, then classify the actual returned semantics. Report actual positive/KEEP/ASK/HOLD/unsupported/clinical counts separately. Report unresolved positive opportunities by case ID and missing domain/recipe/input/binding dependency. Do not change target categories to match runtime results, double-count a replay, or treat positive opportunity counts as achieved prescriptions.',
  '',
  'For every actual positive result, inspect necessity, essential stimulus, alternatives, chosen action, confidence, next check and shadow invariants. A MODIFY label without concrete proposal and applicable independent review is not positive coverage. Correct failure-closed behavior and positive product coverage are separate judgments.',
  ''
];
fs.writeFileSync(path.join(out,'REPRESENTATIVE_CORPUS_R2.md'),lines.join('\n'));
console.log(JSON.stringify({caseCount:cases.length,hash:corpus.corpusContentSha256,gapCounts:corpus.gapCounts,targets:corpus.targetOpportunityCounts},null,2));
