# R5 structural interface — no implementation, results or expected behavior

Public functions: `generateProgram(input)`; `evaluateProgram(program,review)`; `stimulusOf(prescription)`; `sessionContext(program,session)`. Node24 ES modules, import from CoachingCore/src/r5-index.mjs. Do not read source, tests, policies, development cases, simulator/results, reviews or earlier holdouts when independently authoring the holdout. This document describes field representation only.

Corpus shape: `{revision, cases:[{caseId,family,scenario,operation:'GENERATE'|'REVIEW'|'SEQUENCE',programInput,review?,observationFacts?,historicalFacts?,target?,steps?,independentAssessment}]}`. Assessment is author's separate qualitative expectation, never input to runtime. Author may use separate data-building script and standard hashing; never import case fixtures. For REVIEW, runner first generates programInput. `target:{weekIndex,anchorId}` resolves a session ID. `observationFacts` rows specify `{weekIndex,anchorId,performance,recovery,effort,completed,actualMinutes?,actualStimulus?,comparable,confounded}`. Author explicitly declares actual stimulus. A row can use `actualStimulus:'AS_PRESCRIBED'` to declare a synthetic complete physical execution; the runner expands the matching prescribed physical target. It does not predict outcomes. Explicit actualStimulus object supplies contrary/partial work. Review `observations` may also contain complete actual objects; no conversion of unknown to compatible is allowed. SEQUENCE uses `steps:[{review,observationFacts?,historicalFacts?,target?,adoptProposal:boolean}]`; the runner carries returned model/ledger/referenceState between steps and adopts a SHADOW proposal only when explicitly requested. `historicalFacts` has the observation fields plus `{id,anchorId,date,phase,arrangement,priority?,prescription?}`; its complete historical task is retained as the observation source.

Program input:

```
{version:'R5-INPUT-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'YYYY-MM-DD',startDate:'YYYY-MM-DD',weeks:4|8|12|16,learningConsent:boolean,
 athlete:{id,ageYears,participation:'RECREATIONAL_HYBRID',runExperience:'NOVICE'|'INTERMEDIATE',strengthExperience:'NOVICE'|'INTERMEDIATE',
 eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'YYYY-MM-DD',pain:boolean,persistentPain:boolean,injury:boolean,illness:boolean,functionalLimitation:boolean,clinicalConcern:boolean},
 goal:{kind:'HALF_MARATHON'|'STRENGTH'|'BALANCED'|'GENERAL_FITNESS',priority:'RUN_FIRST'|'STRENGTH_FIRST'|'BALANCED',secondary?:string,eventDate?:'YYYY-MM-DD'},
 anchors:[{id,objective,essential:boolean,current:boolean,familiar:boolean,tolerated:boolean,observedAt:'YYYY-MM-DD',prescription,alternatives?:[{id,purpose:'PROGRESS'|'REGRESS'|'RECOVERY'|'SUBSTITUTE',prescription,familiar:boolean,tolerated:boolean,observedAt,weeklyContext?:{source:'SELF_REPORT',recovery:'COMPATIBLE'|'ADVERSE'|'UNKNOWN',observedAt,baselineHash,proposedHash}}]}],
 weeklyTolerance:{current:boolean,observedAt,source:'SELF_REPORT',anchorIds:[id],recovery:'COMPATIBLE'|'ADVERSE'|'UNKNOWN'}},
 availability:[{day:0..6,windows:[{id,startMinute:0..1439,durationMinutes,equipment:[string]}]}],
 scheduleOptions:[{id,assignments:[{anchorId,day,windowId}],evidence:{current:boolean,observedAt,source:'SELF_REPORT',combinedRecovery:'COMPATIBLE'|'ADVERSE'|'UNKNOWN'}}],
 constraints?:{forbiddenPairs:[{before:anchorId,after:anchorId}]},officialPlanState?:JSON,completedWork?:[JSON],
 eventWeek?:{goalKind,eventDate,baselineHash,anchors,weeklyTolerance,scheduleOptions}}
```

`day=0` is startDate's first day, then offsets within the reference week. This offline reference uses UTC synthetic clock, not a real athlete timezone integration. Windows describe complete session time. Equipment names are arbitrary matching strings.

Running prescription: `{modality:'RUN',family:'EASY'|'LONG'|'CRUISE'|'FASTER'|'HILLS'|'STRIDES'|'EVENT_SPECIFIC'|'WALK_JOG',durationMinutes,effortDomain:'EASY_CONVERSATIONAL'|'CONTROLLED_CURRENT'|'FAMILIAR_FASTER',effort:string,warmupMinutes,cooldownMinutes,equipment:[string],calibration?:{basis:'CURRENT_TASK',current:boolean},work?:{repetitions,workMinutes,recoveryMinutes}}`.

Strength prescription: `{modality:'STRENGTH',family:'FULL_BODY'|'LOWER'|'UPPER'|'PRACTICE',durationMinutes,equipment:[string],exercises:[{id,pattern,sets,reps,load:{value,unit:'KG'|'BODYWEIGHT',convention:'TOTAL'|'PER_HAND'|'BODYWEIGHT'},rir,restSeconds,preparationMinutes}]}`.

Hash convention: SHA256 of recursive key-sorted JSON; arrays preserve order. Configuration hashes use `anchors.map(a=>({id:a.id,prescription:a.prescription})).sort(byId)` before canonical hashing. `weeklyContext.baselineHash` hashes current complete anchors, `proposedHash` replaces that anchor's prescription with the alternative before hashing. Hashes describe supplied facts and source integrity, not external authenticity.

Review: `{version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'YYYY-MM-DDTHH:mm:ssZ',weekIndex,event:{id,kind},eligibility,observations:[],actualLedger?:[],learningConsent:boolean,targetSessionId?:id,athleteModel?:object,scheduleOptions?:[],availability?:[],affectedSessionIds?:[],forbiddenPairs?:[],interruption?:{reason,clinicalReason:boolean},currentCapacityConfirmed?:boolean,currentDemonstration?:{current:boolean,observedAt,response,ordinaryFunction,prescription},historicalSessions?:[]}`.

Event kinds: REVIEW, MISSED_ESSENTIAL, MISSED_OPTIONAL, UNDERPERFORMANCE, OVERPERFORMANCE, LOCAL_FATIGUE, SYSTEMIC_FATIGUE, SCHEDULE_CHANGE, TRAVEL, DOUBLE_INFEASIBLE, SESSION_MOVED, PROGRESSION_NOT_TOLERATED, PROGRESSION_TOO_EASY, RETURN, EVENT_NEAR, CONFLICT, GOAL_CHANGE, EQUIPMENT_CHANGE, RECOVERED.

Actual observation: `{eventId,athleteId,sessionId,observedAt,origin:'ACTUAL_EXECUTION',sourceHash,plannedPrescriptionHash,actual:{completed,minutes?,sets?,reps?,loadKg?,stimulus},response:{performance:'COMPATIBLE'|'UNDER'|'OVER'|'UNKNOWN',recovery:'COMPATIBLE'|'ADVERSE'|'UNKNOWN',effort:'ON_TARGET'|'EASIER'|'HARDER'|'UNKNOWN'},context:{family,modality,phase,arrangement,doseKey,equipment:[string],priority},comparable:boolean,confounded:boolean}`. Physical RUN stimulus includes modality/family/duration/preparation/work/effortDomain/equipment; STRENGTH stimulus includes modality/family/equipment and each id/pattern/sets/reps/load/rest. Unknown remains explicit. Historical task shape: `{id,athleteId,origin:'HISTORICAL_ACTUAL_TASK',date,phase,arrangement,priority,prescription}`.

Review may carry returned `referenceState` and `reconciliation:{source:'CURRENT_SELF_REPORT',ordinaryFunction,recovery,observedAt,prescriptionHashes:[hash],programSourceInputHash?}`. These are explicit current facts, not inferred clearance. The corpus author supplies clinical and chronology facts explicitly. Do not run or inspect runtime outputs before sealing the corpus; record inspected files and corpus raw SHA256 in an independence manifest.
