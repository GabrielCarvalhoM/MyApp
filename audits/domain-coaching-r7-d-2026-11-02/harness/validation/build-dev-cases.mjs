// Development cases for validating the R7-D harness only (R7D-HARNESS-VALIDATION). They are written by the harness author, who has read the
// runtime: CONTAMINATED BY CONSTRUCTION, never fresh or generalization evidence. Some reproduce documented R7-C defects on superseded freezes
// (sensitivity witnesses); others exercise every client path and oracle on R7C-FREEZE-4 (no false block).
// Usage: node build-dev-cases.mjs <out.json>
import fs from 'node:fs';
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const LOADS={SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0};
const intake=(id,{weeks=12,startDate='2026-11-02',asOf='2026-11-01',goals={run:'PERFORMANCE',strength:'GENERAL'},equipment=['DUMBBELLS','BENCH'],recent={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},knownExercises=[],schedule={},athlete={},...rest}={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
 athlete:{id,ageEligible:true,eligibility:elig(asOf),goals,runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent,equipment,knownExercises,exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:90,...schedule}});
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const allDone=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
const strengthOnly=w=>[{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
const review=(w,observations,x={})=>({stepId:`w${w}r`,at:{week:w,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations,...x});
const assess=s=>({rationale:s,preferredCoachingBehavior:s,acceptableAlternatives:[],concerns:[]});
const GEN=intake('dev-gen',{equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]});
const cases=[];
// DEV-01: timely path, 6 weeks reviewed, everything done.
cases.push({caseId:'DEV-01',authorIntent:'Timely reporter, every session done as prescribed for six weeks',coverageTags:['COLD_START','BALANCED_HYBRID','H12'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[0,1,2,3,4,5].map(w=>review(w,allDone(w))),expectedDomainProperties:[{expectationId:'E1',atStep:'w5r',oracleClass:'DOMAIN_ORACLE',assert:{type:'VALIDITY_IS',value:'VALID_WITHIN_CURRENT_BOUNDED_SCOPE'},rationale:'all reported'}],metamorphicRelations:[],independentAssessment:assess('progress gradually'),domainNotes:''});
// DEV-02: QE-R7C-10 reproduction shape (GEN, gap from week 2, weeks reviewed with strength only, answer at 60 % in week 7 day 2, plain review day 3).
const gapTimeline=[review(0,allDone(0)),review(1,allDone(1)),...[2,3,4,5,6].map(w=>review(w,strengthOnly(w))),
 {stepId:'w7d2',at:{week:7,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},answer:{report:{completed:true,fraction:0.6,response:OK}}},
 {stepId:'w7d3',at:{week:7,day:3,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}}];
cases.push({caseId:'DEV-02',authorIntent:'Runs unreported from week 2, the coach asks; the answer (every gap run done at 60 %) arrives mid-week 7',coverageTags:['UNREPORTED_WEEKS','LATE_ANSWER','SHORTENED_RUNS'],oracleClass:'METAMORPHIC_ORACLE',intake:GEN,timeline:gapTimeline,
 expectedDomainProperties:[{expectationId:'E1',atStep:'w6r',oracleClass:'DOMAIN_ORACLE',assert:{type:'QUESTION_KIND_IS',value:'UNREPORTED_TRAINING'},rationale:'runs unknown for five weeks'}],metamorphicRelations:[{relation:'CARRIER_CLINICAL',atStep:'w7d2'}],independentAssessment:assess('ask, then plan from the shortened runs'),domainNotes:''});
// DEV-03: clinical substitution, clearance, continue.
cases.push({caseId:'DEV-03',authorIntent:'Pain with an exercise routes to a human; after qualified clearance the plan continues',coverageTags:['SUBSTITUTION_PAIN_CLEARANCE','CLINICAL_SIGNAL'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[review(0,allDone(0)),{stepId:'w1d1',at:{week:1,day:1,time:'12:00'},event:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseRef:{week:1,day:0},reason:'SKILL_MISMATCH',pain:true}}},
  review(1,allDone(1)),{...review(2,allDone(2)),clearance:'QUALIFIED_CLEARANCE'},review(3,allDone(3))],
 expectedDomainProperties:[{expectationId:'E1',atStep:'w1d1',oracleClass:'INVARIANT_ORACLE',assert:{type:'STATUS_IN',oneOf:['CLINICAL_HUMAN_REQUIRED']},rationale:'pain'},{expectationId:'E2',atStep:'w1r',oracleClass:'INVARIANT_ORACLE',assert:{type:'NO_PRESCRIPTION'},rationale:'route stands'}],metamorphicRelations:[],independentAssessment:assess('route, then resume'),domainNotes:''});
// DEV-04: 10K race, build to race, taper, race week, everything reported; non-Monday start.
const r10=intake('dev-10k',{startDate:'2026-11-04',asOf:'2026-11-03',weeks:8,goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[0,2,5],strengthDays:[1,4],longRunDay:5,runMinutes:60,longRunMinutes:100}});
cases.push({caseId:'DEV-04',authorIntent:'10K build, taper and race week with every session reported on time',coverageTags:['RACE_10K','TAPER','RACE_WEEK','START_NON_MONDAY','H8'],oracleClass:'DOMAIN_ORACLE',intake:r10,
 timeline:[0,1,2,3,4,5,6].map(w=>review(w,allDone(w))),expectedDomainProperties:[{expectationId:'E1',atStep:'w5r',oracleClass:'DOMAIN_ORACLE',assert:{type:'ROLE_PRESENT',weeks:[7],sport:'RUN',roles:['RACE']},rationale:'race kept'}],metamorphicRelations:[],independentAssessment:assess('taper then race'),domainNotes:''});
// DEV-05: return after a moderate nonclinical break, with a demonstration.
cases.push({caseId:'DEV-05',authorIntent:'Three weeks away for work, then a return report with a current demonstration',coverageTags:['RETURN_MODERATE'],oracleClass:'DOMAIN_ORACLE',intake:GEN,
 timeline:[review(0,allDone(0)),review(1,allDone(1)),review(2,allDone(2)),
  {stepId:'ret',at:{week:6,day:0,time:'08:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{startDate:'2026-11-23',endDate:'2026-12-13',reasonCategory:'WORK',nonclinical:true},currentDemonstration:{observedAt:'2026-12-14T07:00:00Z',sport:'RUN',family:'EASY',minutes:25,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'}}},
  review(6,allDone(6)),review(7,allDone(7))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('re-enter below prior dose'),domainNotes:''});
// DEV-06: duplicate phone + watch, a correction, a late report (reportedAt), out of order, adverse response, schedule change, unavailable day.
cases.push({caseId:'DEV-06',authorIntent:'Messy data: second source, correction, late report, adverse long run, schedule and availability changes',coverageTags:['DUPLICATE_SOURCES','CORRECTION','OUT_OF_ORDER','ADVERSE_RESPONSE','SCHEDULE_CHANGE','UNAVAILABLE_DAY'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[review(0,allDone(0)),
  {stepId:'w1r',at:{week:1,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:[{each:{weeks:[1],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK},
   {ref:{week:1,sport:'RUN',day:1},completed:true,asPrescribed:true,response:OK,source:{provider:'PHONE',quality:'MANUAL'}},
   {ref:{week:1,sport:'RUN',day:1},completed:true,asPrescribed:true,response:OK,eventId:'dev06-watch-1',source:{provider:'WATCH',activityId:'a-1',quality:'WEARABLE_FULL'}},
   {ref:{week:1,sport:'RUN',day:3},completed:true,minutes:30,response:OK,eventId:'dev06-w1d3'},
   {ref:{week:1,sport:'RUN',role:'LONG'},completed:true,asPrescribed:true,response:BAD}]},
  {stepId:'w2d1',at:{week:2,day:1,time:'20:00'},event:{kind:'WEEKLY_REVIEW'},observations:[{ref:{week:1,sport:'RUN',day:3},completed:true,asPrescribed:true,response:OK,eventId:'dev06-w1d3-fix',correctionOf:'dev06-w1d3',correctedAt:'2026-11-17T19:00:00Z'}]},
  {stepId:'w2d2',at:{week:2,day:2,time:'09:00'},event:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,5]}}},
  {stepId:'w2d3',at:{week:2,day:3,time:'09:00'},event:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:['2026-11-22']}}},
  review(2,allDone(2)),review(3,allDone(3))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('one fact per execution'),domainNotes:''});
// DEV-07: eligibility unknown and an out-of-scope marathon (generation only).
cases.push({caseId:'DEV-07',authorIntent:'Unknown eligibility',coverageTags:['ELIGIBILITY_UNKNOWN'],oracleClass:'INVARIANT_ORACLE',intake:{...intake('dev-unk'),athlete:{...intake('dev-unk').athlete,eligibility:{status:'UNKNOWN',assessedAt:'2026-11-01'}}},timeline:[],expectedDomainProperties:[{expectationId:'E1',atStep:'GENERATE',oracleClass:'INVARIANT_ORACLE',assert:{type:'STATUS_IN',oneOf:['ASK']},rationale:'unknown'}],metamorphicRelations:[],independentAssessment:assess('ask'),domainNotes:''});
cases.push({caseId:'DEV-08',authorIntent:'Marathon request',coverageTags:['OUT_OF_SCOPE'],oracleClass:'INVARIANT_ORACLE',intake:intake('dev-mar',{weeks:16,goals:{run:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-14'}},strength:'MAINTAIN'}}),timeline:[],expectedDomainProperties:[{expectationId:'E1',atStep:'GENERATE',oracleClass:'INVARIANT_ORACLE',assert:{type:'STATUS_IN',oneOf:['UNSUPPORTED']},rationale:'scope'}],metamorphicRelations:[],independentAssessment:assess('unsupported'),domainNotes:''});
// DEV-09: no consent learning, with a dumbbell known load (convention relation) and a pain flag mid-program.
cases.push({caseId:'DEV-09',authorIntent:'No learning consent; a pain flag appears at a review',coverageTags:['NO_CONSENT','CLINICAL_SIGNAL'],oracleClass:'INVARIANT_ORACLE',intake:{...intake('dev-nc',{knownExercises:[K('db-bench-press',3,10,18,'PER_HAND'),K('goblet-squat',3,10,24,'SINGLE_IMPLEMENT')]}),learningConsent:false},
 timeline:[review(0,allDone(0)),review(1,allDone(1)),{...review(2,allDone(2)),eligibility:{...elig('2026-11-22'),pain:true}},review(3,allDone(3))],
 expectedDomainProperties:[{expectationId:'E1',atStep:'w2r',oracleClass:'INVARIANT_ORACLE',assert:{type:'STATUS_IN',oneOf:['CLINICAL_HUMAN_REQUIRED']},rationale:'pain'}],metamorphicRelations:[],independentAssessment:assess('route'),domainNotes:''});
// DEV-02b: the documented QE-R7C-10 reproduction shape with the gap from week 0 (every week reviewed with strength only).
cases.push({...cases.find(c=>c.caseId==='DEV-02'),caseId:'DEV-02b',timeline:[...[0,1,2,3,4,5,6].map(w=>review(w,strengthOnly(w))),gapTimeline.at(-2),gapTimeline.at(-1)]});
// DEV-10 (R7C-G01 witness on R7B2-FREEZE-1): weekly reviews with nothing reported for seven weeks.
cases.push({caseId:'DEV-10',authorIntent:'Never reports anything; every weekly review is empty',coverageTags:['UNREPORTED_WEEKS','EMPTY_REVIEW'],oracleClass:'INVARIANT_ORACLE',intake:GEN,timeline:[0,1,2,3,4,5,6].map(w=>review(w,[])),expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('no credit; ask'),domainNotes:''});
// DEV-11 (D54 witness on the pre-R7A source): 10K, strength reported not done from week 2 until race week, runs done.
const r10b=intake('dev-10k-b',{weeks:8,goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-25'}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}});
const notDoneStrength=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{each:{weeks:[w],sport:'STRENGTH'},completed:false}];
cases.push({caseId:'DEV-11',authorIntent:'Strength not done for five weeks before a 10K race week; runs done',coverageTags:['RACE_10K','RACE_WEEK','TAPER'],oracleClass:'INVARIANT_ORACLE',intake:r10b,timeline:[review(0,allDone(0)),review(1,allDone(1)),...[2,3,4,5,6].map(w=>review(w,notDoneStrength(w)))],expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('race-week strength stays minimal'),domainNotes:''});
// ---------- R7D-HARNESS-2 (Phase 3): witnesses of the four diagnostic blockers on R7C-FREEZE-4, and P05 carrier coverage ----------
// DEV-12 (DX-01): the long run reported the same day with day precision (no clock), then a plain review: the row must stay in the record.
cases.push({caseId:'DEV-12',authorIntent:'Same-day report with day precision only, then the next weekly review',coverageTags:['SAME_DAY_REPORT','DAY_PRECISION'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[{...review(0,[{each:{weeks:[0],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:0,sport:'RUN',day:1},asPrescribed:true,response:OK},{ref:{week:0,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:0,sport:'RUN',role:'LONG'},asPrescribed:true,response:BAD,reportedAt:'2026-11-08T09:00:00Z',eventId:'dev12-long0'}])},
  {...review(1,[{each:{weeks:[1],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:1,sport:'RUN',day:1},asPrescribed:true,response:OK},{ref:{week:1,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:1,sport:'RUN',role:'LONG'},asPrescribed:true,response:BAD}])},review(2,allDone(2))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('two adverse long runs step the long run back'),domainNotes:''});
// DEV-13 (DX-02): a 14-day vacation declared inside a mid-week weekly review, no question pending.
const VAC={startDate:'2026-11-23',endDate:'2026-12-06',days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true};
cases.push({caseId:'DEV-13',authorIntent:'Two weeks of vacation declared in a weekly review with no question pending',coverageTags:['DECLARED_BREAK_NO_QUESTION','RETURN_MODERATE'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[review(0,allDone(0)),review(1,allDone(1)),review(2,allDone(2)),{stepId:'brk',at:{week:5,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:VAC}},review(5,allDone(5)),review(6,allDone(6))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('re-enter from what was executed before the break'),domainNotes:''});
// DEV-14 (F04): the only long run of week 0 confounded (heat) with an adverse recovery and an impaired next day.
cases.push({caseId:'DEV-14',authorIntent:'Hot long run: confounded, recovery adverse and next day impaired',coverageTags:['CONFOUNDED','ADVERSE_RESPONSE'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[review(0,[{each:{weeks:[0],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:0,sport:'RUN',day:1},asPrescribed:true,response:OK},{ref:{week:0,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:0,sport:'RUN',role:'LONG'},asPrescribed:true,confounded:true,response:{performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'IMPAIRED'}}]),review(1,allDone(1))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('hold the long run'),domainNotes:''});
// DEV-15 (F03): machine lifts only, every set logged exactly as the plan prescribes it; the next setting, when the plan asks for one, is logged
// with the athlete's own value (loadsByPattern).
const MACH=intake('dev-machine',{goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS','BENCH'],recent:{strengthDaysPerWeek:3},knownExercises:[K('leg-press',3,10,140,'MACHINE_STACK'),K('machine-chest-press',3,10,50,'MACHINE_STACK'),K('seated-cable-row',3,12,50,'MACHINE_STACK')],schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}});
const MLOADS={SQUAT:150,PUSH:55,PULL:55,HINGE:20,LUNGE:12,CALF:30,TRUNK:0,KNEE_FLEXION:30,KNEE_EXTENSION:30,HIP_ABDUCTION:30,ELBOW_EXTENSION:15};
cases.push({caseId:'DEV-15',authorIntent:'Machine lifts logged exactly as prescribed for eight weeks',coverageTags:['MACHINES','LOAD_LOGGING'],oracleClass:'INVARIANT_ORACLE',intake:MACH,
 timeline:[0,1,2,3,4,5,6,7].map(w=>review(w,[{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:MLOADS,response:OK}])),expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('read every log; never an impossible setting'),domainNotes:''});
// DEV-16 (P05 coverage, R4 HOLD carrier): an 8-week program, runs unreported from week 2; the coach asks in the last week and the answer arrives there.
const G8=intake('dev-gen8',{weeks:8,equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]});
cases.push({caseId:'DEV-16',authorIntent:'Silence of five weeks on runs; asked and answered in the program\'s last week',coverageTags:['UNREPORTED_WEEKS','LONG_SILENCE','LATE_ANSWER'],oracleClass:'METAMORPHIC_ORACLE',intake:G8,
 timeline:[review(0,allDone(0)),review(1,allDone(1)),...[2,3,4,5,6].map(w=>review(w,strengthOnly(w))),{stepId:'w7d0',at:{week:7,day:0,time:'06:00'},event:{kind:'WEEKLY_REVIEW'}},
  {stepId:'w7d2',at:{week:7,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},answer:{report:{completed:true,asPrescribed:true,response:OK}}},{stepId:'w7d3',at:{week:7,day:3,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[{expectationId:'E1',atStep:'w7d0',oracleClass:'DOMAIN_ORACLE',assert:{type:'QUESTION_KIND_IS',value:'UNREPORTED_TRAINING'},rationale:'runs unknown for five weeks'}],metamorphicRelations:[{relation:'CARRIER_HOLD',atStep:'w7d2'}],independentAssessment:assess('ask, then plan from the answer'),domainNotes:''});
// DEV-17 (P05 coverage, break answer): five weeks with no review and no report at all; the coach asks; the answer is a declared work break in a
// plain weekly review (no training in those weeks, so nothing recorded contradicts it).
cases.push({caseId:'DEV-17',authorIntent:'Silence of five weeks; the answer is a declared break with its reason',coverageTags:['UNREPORTED_WEEKS','LONG_SILENCE','DECLARED_BREAK_ANSWER'],oracleClass:'METAMORPHIC_ORACLE',intake:GEN,
 timeline:[review(0,allDone(0)),review(1,allDone(1)),{stepId:'w7d0',at:{week:7,day:0,time:'06:00'},event:{kind:'WEEKLY_REVIEW'}},
  {stepId:'w7d2',at:{week:7,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},answer:{declareBreak:{startDate:'2026-11-16',endDate:'2026-12-20',reasonCategory:'WORK',reason:'Work project, no training',nonclinical:true}}},
  {stepId:'w7d3',at:{week:7,day:3,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},review(7,allDone(7))],
 expectedDomainProperties:[],metamorphicRelations:[{relation:'CARRIER_CLINICAL',atStep:'w7d2'}],independentAssessment:assess('the declared break re-enters by the return recipe'),domainNotes:''});
// DEV-17b (finding P3-F01 witness): the same answer delivered as a return report, the carrier R7C-FREEZE-4 already read; its clinical-carrier
// variant shows whether a declared break recorded by a clinical route is retained across qualified clearance on each runtime.
{const c=cases.find(x=>x.caseId==='DEV-17');cases.push({...c,caseId:'DEV-17b',authorIntent:c.authorIntent+' (answer as a return report)',timeline:c.timeline.map(s=>s.stepId==='w7d2'?{...s,event:{kind:'RETURN_AFTER_PAUSE'}}:s)});}
// R7D-HARNESS-DEV-3 (Phase 3.1, P17): a two-week holiday (weeks 3-4, no training, nothing reported) declared in week 5 through routes that do not
// apply it, then reviews that do not state it again.
const HOLIDAY={startDate:'2026-11-23',endDate:'2026-12-06',days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true};
const firstWeeks=[review(0,allDone(0)),review(1,allDone(1)),review(2,allDone(2))];
// DEV-18 (QE-R7D-P3-01(a)): the holiday declared with a schedule change; the next review does not repeat it.
cases.push({caseId:'DEV-18',authorIntent:'A two-week holiday declared together with a schedule change; the next review does not repeat it',coverageTags:['DECLARED_BREAK','BREAK_WITH_OTHER_EVENT'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...firstWeeks,{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:HOLIDAY}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},review(5,allDone(5))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the holiday re-enters at the next review; the schedule change is sent again later'),domainNotes:''});
// DEV-19 (QE-R7D-P3-01(b)): the holiday declared while ill (clinical flag); qualified clearance; the next review does not repeat it.
cases.push({caseId:'DEV-19',authorIntent:'A two-week holiday declared while ill; after qualified clearance the next review does not repeat it',coverageTags:['DECLARED_BREAK','CLINICAL_SIGNAL','CLEARANCE'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...firstWeeks,{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:HOLIDAY},eligibility:{...elig('2026-12-08'),illness:true}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},clearance:'QUALIFIED_CLEARANCE'},review(5,allDone(5))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('clinical first; after clearance the holiday re-enters'),domainNotes:''});
// DEV-20 (QE-R7D-P3-01(a)): the holiday declared with a fatigue report, a second event of another kind, then a plain review.
cases.push({caseId:'DEV-20',authorIntent:'A two-week holiday declared with a fatigue report; a local-fatigue report and a plain review follow without it',coverageTags:['DECLARED_BREAK','BREAK_WITH_OTHER_EVENT'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...firstWeeks,{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:HOLIDAY}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'LOCAL_FATIGUE'}},{stepId:'w5d3',at:{week:5,day:3,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},review(5,allDone(5))],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('asked until a review applies the holiday'),domainNotes:''});
// DEV-21 (F08 boundary): a two-week injury break; clearance twice; plain reviews never repeat it.
cases.push({caseId:'DEV-21',authorIntent:'A two-week break for an injury; qualified clearance; plain reviews follow without restating it',coverageTags:['DECLARED_BREAK','CLINICAL_BREAK','CLEARANCE'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...firstWeeks,{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...HOLIDAY,reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false}}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},clearance:'QUALIFIED_CLEARANCE'},{stepId:'w5d3',at:{week:5,day:3,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},clearance:'QUALIFIED_CLEARANCE'}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('routes to a human; never the pre-break plan'),domainNotes:''});
// R7D-HARNESS-DEV-4 (Phase 3.2, P18; SSCTR-P31-F02): weeks 0-1 trained and reviewed; a 14-day holiday (weeks 2-3) declared with a fatigue report on
// week 4 day 0 and kept; a newer break declared with a local-fatigue report on week 5 day 0. The holiday's identity is its report's event id.
const twoWeeks=[review(0,allDone(0)),review(1,allDone(1))];
const VAC14={startDate:'2026-11-16',endDate:'2026-11-29',days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true};
const TRIP7={startDate:'2026-11-30',endDate:'2026-12-06',days:7,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const TRIP4={startDate:'2026-12-03',endDate:'2026-12-06',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const kept=(newer)=>[...twoWeeks,{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14}},{stepId:'w5d0',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:newer}}];
// DEV-22 (F02 witness): the plain review asks how the trip relates to the holiday; answered "a separate break" (its own episodeId).
cases.push({caseId:'DEV-22',authorIntent:'A kept two-week holiday, then a one-week work trip right after it; the plain review must not re-enter from the trip alone; the trip is a separate break',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','BREAK_RELATION'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...kept(TRIP7),{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:{...TRIP7,episodeId:'DEV-22-w5d0'}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('asked first; separate breaks with no training between: the whole three weeks are the stop'),domainNotes:''});
// DEV-23: the same, answered "the trip corrects the holiday" (the holiday's episodeId with the trip's facts).
cases.push({caseId:'DEV-23',authorIntent:'A kept two-week holiday, then a one-week trip; asked; the athlete says the trip corrects the holiday',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','BREAK_CORRECTION'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...kept(TRIP7),{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:{...TRIP7,episodeId:'DEV-23-w4d0'}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the corrected facts are the break: one week'),domainNotes:''});
// DEV-24: a separate four-day trip with three days between the breaks and nothing reported there: asked; answered "not done".
cases.push({caseId:'DEV-24',authorIntent:'A kept two-week holiday and a separate four-day trip; nothing reported in the three days between',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','UNREPORTED_BETWEEN_BREAKS'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...kept(TRIP4),{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:{...TRIP4,episodeId:'DEV-24-w5d0'}}},{stepId:'w5d2',at:{week:5,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},answer:{report:{completed:false}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the sessions between are asked; reported not done, the stop runs from the holiday'),domainNotes:''});
// DEV-25: the older break is an injury: clinical first, whatever the newer break, before and after clearance.
cases.push({caseId:'DEV-25',authorIntent:'A two-week break for an injury, then a one-week trip reported with a return; clearance',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','CLINICAL_BREAK','CLEARANCE'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:{...VAC14,reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false}}},{stepId:'w5d0',at:{week:5,day:0,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:TRIP7},clearance:'QUALIFIED_CLEARANCE'},{stepId:'w5d1',at:{week:5,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},clearance:'QUALIFIED_CLEARANCE'}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('routes to a human; the trip never relabels the injury break'),domainNotes:''});
// DEV-26 (after the Phase 3.2 engineering check, QE-R7D-P32-01; the QE-FB-2 form): the holiday applied by a return report, weeks 4-5 trained and
// reviewed, a one-week trip in week 6 kept with a fatigue report, then a correction of the applied holiday (its episodeId), then a plain review.
cases.push({caseId:'DEV-26',authorIntent:'A holiday applied, two trained weeks, a trip kept with a fatigue report, then a correction of the holiday\'s dates and a plain review',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','CORRECTION_ACROSS_KEPT_BREAK'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:VAC14}},review(4,allDone(4)),review(5,allDone(5)),
  {stepId:'w7d0',at:{week:7,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:{startDate:'2026-12-14',endDate:'2026-12-20',days:7,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true}}},
  {stepId:'w7d1',at:{week:7,day:1,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...VAC14,endDate:'2026-11-28',days:13,episodeId:'DEV-26-w4d0'}}},
  {stepId:'w7d2',at:{week:7,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the kept trip is applied first; the correction of the earlier, applied holiday is asked when sent and not read while the trip is kept'),domainNotes:''});
// R7D-HARNESS-DEV-5 (Phase 3.3, P18(a) re-entry week; SSCTR-P32-F01): the holiday kept as above, a separate break later, named on its own, and the
// training between them reported with that later break's declaration (no review between); then a plain review.
const VAC30={startDate:'2026-11-16',endDate:'2026-12-15',days:30,reasonCategory:'VACATION',reason:'Long holiday, no training at all',nonclinical:true};
const TRIP4b={startDate:'2026-12-07',endDate:'2026-12-10',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const TRIP4c={startDate:'2026-12-19',endDate:'2026-12-22',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const separateLater=(caseId,keptStep,newer,at,observations,plainAt)=>[...twoWeeks,keptStep,{stepId:'brk2',at,event:{kind:'LOCAL_FATIGUE',interruption:{...newer,episodeId:`${caseId}-brk2`}},observations},{stepId:'plain',at:plainAt,event:{kind:'WEEKLY_REVIEW'}}];
const keptHoliday={stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14}};
const gapRun=extra=>[{ref:{week:4,sport:'STRENGTH',day:0},completed:false},{ref:{week:4,sport:'RUN',day:1},response:OK,...extra}];
// DEV-27 (F01 witness): one easy run in the three days between a kept two-week holiday and a separate four-day trip.
cases.push({caseId:'DEV-27',authorIntent:'A kept two-week holiday, one easy run, then a separate four-day trip; the one run must not make the holiday disappear',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-27',keptHoliday,TRIP4,{week:5,day:0,time:'07:00'},gapRun({asPrescribed:true}),{week:5,day:1,time:'07:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('one session re-enters nothing: the whole three weeks are the stop'),domainNotes:''});
// DEV-28: the same with a five-minute aborted run.
cases.push({caseId:'DEV-28',authorIntent:'A kept two-week holiday, a run aborted after five minutes, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS','PARTIAL'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-28',keptHoliday,TRIP4,{week:5,day:0,time:'07:00'},gapRun({completed:false,minutes:5}),{week:5,day:1,time:'07:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('an aborted run re-enters nothing: the whole three weeks are the stop'),domainNotes:''});
// DEV-29: a thirty-day break, one run, a separate four-day trip.
cases.push({caseId:'DEV-29',authorIntent:'A kept thirty-day holiday, one run, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS','RETURN_LONG'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-29',{stepId:'w6d2',at:{week:6,day:2,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC30}},TRIP4c,{week:7,day:2,time:'07:00'},[{ref:{week:6,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:6,sport:'STRENGTH',day:4},completed:false}],{week:7,day:3,time:'07:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('one run re-enters nothing: the 37 days are the stop, a restart'),domainNotes:''});
// DEV-30 (no false block): a whole week executed in full between the holiday and a trip: the athlete re-entered.
cases.push({caseId:'DEV-30',authorIntent:'A kept two-week holiday, a whole week executed in full, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS','REENTRY_WEEK'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-30',keptHoliday,TRIP4b,{week:5,day:4,time:'07:00'},allDone(4),{week:5,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the week re-entered the athlete: the trip alone, from what was executed'),domainNotes:''});
// DEV-31: the same week with its Friday strength session not done: no whole week was executed.
cases.push({caseId:'DEV-31',authorIntent:'A kept two-week holiday, a week with every run done but the Friday strength session missed, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-31',keptHoliday,TRIP4b,{week:5,day:4,time:'07:00'},[{each:{weeks:[4],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:4,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:4,sport:'STRENGTH',day:4},completed:false}],{week:5,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('since R7D-HARNESS-DEV-6 (Phase 3.4, direction A): running executed the whole week, strength did not: the holiday is read as its own return and the trip by its own days; R7D-FREEZE-4 ran the stop from the holiday'),domainNotes:''});
// R7D-HARNESS-DEV-6 (Phase 3.4: SSCTR-P33-F01 under direction A; the re-entry week contract, QE-R7D-P33-01; P18(d); R-F08-1).
// DEV-32, DEV-33 (QH-1, QH-2 of the Phase 3.3 quality check; no false block): a plan with two optional brisk walks a week, week 4 executed in full
// except the walks, unreported or reported not done.
const WALKS=intake('dev-walks',{goals:{run:'GENERAL',strength:'GENERAL'},recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{runDays:[1,2,3,5,6]},equipment:FULL});
const gatedWeek=w=>[{each:{weeks:[w],sport:'RUN',roles:['EASY','LONG','QUALITY','WALK_JOG']},asPrescribed:true,response:OK},{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
cases.push({caseId:'DEV-32',authorIntent:'A kept holiday, a week executed in full except its optional walks (unreported), then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','OPTIONAL_SESSIONS'],oracleClass:'INVARIANT_ORACLE',intake:WALKS,
 timeline:separateLater('DEV-32',keptHoliday,TRIP4b,{week:5,day:4,time:'07:00'},gatedWeek(4),{week:5,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('optional walks never decide a re-entry week: the trip alone'),domainNotes:''});
cases.push({caseId:'DEV-33',authorIntent:'The same with the optional walks reported not done',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','OPTIONAL_SESSIONS'],oracleClass:'INVARIANT_ORACLE',intake:WALKS,
 timeline:separateLater('DEV-33',keptHoliday,TRIP4b,{week:5,day:4,time:'07:00'},[...gatedWeek(4),{each:{weeks:[4],sport:'RUN',roles:['WALK']},completed:false}],{week:5,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('optional walks never decide a re-entry week: the trip alone'),domainNotes:''});
// DEV-34 (the Founder's case): weeks 4-5 with every run done and the Friday strength session missed each week, a Mon-Thu wk6 trip.
const TRIP4d={startDate:'2026-12-14',endDate:'2026-12-17',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const runsDoneFriMissed=weeks=>weeks.flatMap(w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:w,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'STRENGTH',day:4},completed:false}]);
cases.push({caseId:'DEV-34',authorIntent:'A kept 14-day holiday, two weeks with every run done and one strength session missed each week, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS','PARTIAL_REENTRY'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-34',keptHoliday,TRIP4d,{week:6,day:4,time:'07:00'},runsDoneFriMissed([4,5]),{week:6,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('never a restart: the holiday is its own return, the trip by its own days; running resumes its executed doses, strength steps nothing'),domainNotes:''});
// DEV-35: weeks 4-5 with strength in full and the Tuesday easy run missed each week.
cases.push({caseId:'DEV-35',authorIntent:'A kept holiday, two weeks with strength in full and an easy run missed each week, then a separate trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS','PARTIAL_REENTRY'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-35',keptHoliday,TRIP4d,{week:6,day:4,time:'07:00'},[4,5].flatMap(w=>[{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'RUN',day:1},completed:false},{ref:{week:w,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:w,sport:'RUN',day:6},asPrescribed:true,response:OK}]),{week:6,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('strength resumes its executed doses; running continues from the holiday\'s own return'),domainNotes:''});
// DEV-36 (the disclosed residual): both sports partial each week.
cases.push({caseId:'DEV-36',authorIntent:'A kept holiday, two weeks with an easy run and a strength session missed each week, then a separate trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-36',keptHoliday,TRIP4d,{week:6,day:4,time:'07:00'},[4,5].flatMap(w=>[{ref:{week:w,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'STRENGTH',day:4},completed:false},{ref:{week:w,sport:'RUN',day:1},completed:false},{ref:{week:w,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:w,sport:'RUN',day:6},asPrescribed:true,response:OK}]),{week:6,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('no week complete in any sport: the stop runs from the holiday (a disclosed residual)'),domainNotes:''});
// DEV-37 (P18(d) sensitivity): the DEV-27 shape, then a named correction of the trip (one day longer) by a return report.
cases.push({caseId:'DEV-37',authorIntent:'A kept holiday, one easy run, a separate trip, its return, then a correction of the trip by name',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','TRAINING_BETWEEN_BREAKS','CORRECTION'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...separateLater('DEV-37',keptHoliday,TRIP4,{week:5,day:0,time:'07:00'},gapRun({asPrescribed:true}),{week:5,day:1,time:'07:00'}),{stepId:'corr',at:{week:5,day:1,time:'09:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...TRIP4,endDate:'2026-12-07',days:5,episodeId:'DEV-37-brk2'}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the correction re-reads the holiday: the stop still runs from it'),domainNotes:''});
// DEV-38: DEV-34, a plain review the next day, then a named correction of the trip.
cases.push({caseId:'DEV-38',authorIntent:'The Founder\'s case, a review the next day, then a correction of the trip by name',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','PARTIAL_REENTRY','CORRECTION','LATE_EVIDENCE'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...separateLater('DEV-38',keptHoliday,TRIP4d,{week:6,day:4,time:'07:00'},runsDoneFriMissed([4,5]),{week:6,day:4,time:'08:00'}),{stepId:'sat',at:{week:6,day:5,time:'09:00'},event:{kind:'WEEKLY_REVIEW'}},{stepId:'corr',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...TRIP4d,endDate:'2026-12-18',days:5,episodeId:'DEV-38-brk2'}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('no question again the next day; the correction keeps the holiday\'s own return'),domainNotes:''});
// DEV-39, DEV-40 (R-F08-1): a clinical-cause break restated by name as a holiday, after a clearance, and before any clinical route (eligibility asked).
const INJ14={...VAC14,reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false};
cases.push({caseId:'DEV-39',authorIntent:'An injury break, then the same break restated as a holiday by name, a qualified clearance, a plain review',coverageTags:['DECLARED_BREAK','CLINICAL_BREAK','CLEARANCE','CORRECTION'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:INJ14}},{stepId:'w4d1',at:{week:4,day:1,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...VAC14,episodeId:'DEV-39-w4d0'}}},{stepId:'w4d2',at:{week:4,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'},clearance:'QUALIFIED_CLEARANCE'},{stepId:'w4d3',at:{week:4,day:3,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...VAC14,episodeId:'DEV-39-w4d0'}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the injury stays clinical: the restatement is the athlete\'s statement; no nonclinical return'),domainNotes:''});
cases.push({caseId:'DEV-40',authorIntent:'An injury break stated while eligibility is asked, then restated as a holiday by name with eligibility confirmed',coverageTags:['DECLARED_BREAK','CLINICAL_BREAK','CORRECTION','ELIGIBILITY_UNKNOWN'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'WEEKLY_REVIEW',interruption:INJ14},eligibility:{status:'UNKNOWN'}},{stepId:'w4d1',at:{week:4,day:1,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...VAC14,episodeId:'DEV-40-w4d0'}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the injury stays clinical once stated: no nonclinical return by a restatement'),domainNotes:''});
// DEV-41 (P06(b), SSCTR-P34-F01): weeks 2-3 not done, a 21-day holiday (weeks 4-6), a return reported on Wednesday of week 7 with that week's
// elapsed sessions unreported: the weeks after it are planned from the runs completed, never from those elapsed sessions.
const notDoneWeek=w=>[{each:{weeks:[w],sport:'RUN'},completed:false},{each:{weeks:[w],sport:'STRENGTH'},completed:false}];
cases.push({caseId:'DEV-41',authorIntent:'Two weeks not done, a three-week holiday, then a return reported mid-week with the elapsed sessions of that week unreported',coverageTags:['RETURN_MODERATE','RETURN_MID_WEEK'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,review(2,notDoneWeek(2)),review(3,notDoneWeek(3)),{stepId:'ret',at:{week:7,day:2,time:'21:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{startDate:'2026-11-30',endDate:'2026-12-20',days:21,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true}}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the weeks after the return start from the entry dose, as a Monday report would'),domainNotes:''});
// R7D-HARNESS-DEV-6, false-block controls of SSCTR CF-P34-05 (added after the candidate's first validation 6, before any review; instrument only).
// DEV-42: a race week between the breaks with its race touch missed: it never re-enters running; strength re-enters by its own week.
const RACE10=intake('dev-race10',{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]});
const VAC14r={startDate:'2026-12-07',endDate:'2026-12-20',days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true};
const TRIP4r={startDate:'2026-12-28',endDate:'2026-12-31',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
cases.push({caseId:'DEV-42',authorIntent:'Five weeks executed, a kept two-week holiday, a race week with everything done except the race touch, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','RACE_WEEK','PARTIAL_REENTRY'],oracleClass:'INVARIANT_ORACLE',intake:RACE10,
 timeline:[...[0,1,2,3,4].map(w=>review(w,allDone(w))),{stepId:'w7d0',at:{week:7,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14r}},
  {stepId:'brk2',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...TRIP4r,episodeId:'DEV-42-brk2'}},observations:[{each:{weeks:[7],sport:'RUN',roles:['EASY','LONG','QUALITY','WALK_JOG','RACE']},asPrescribed:true,response:OK},{each:{weeks:[7],sport:'RUN',roles:['RACE_TOUCH']},completed:false},{each:{weeks:[7],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}]},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the race touch missed: the race week never re-enters running; strength re-enters by its own week (the holiday is its own return)'),domainNotes:''});
// DEV-43: the DEV-30 week executed in full with every strength set logged without reps in reserve: the missing strength data holds strength only.
const noRir=rows=>rows.map(([id,sets,reps,load])=>({id,sets:Array.from({length:sets},()=>({reps,load}))}));
const PH=v=>({value:v,unit:'KG',convention:'PER_HAND'}),BW={value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'};
cases.push({caseId:'DEV-43',authorIntent:'A kept holiday, a week executed in full with strength logged without reps in reserve, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','PARTIAL_REENTRY','MISSING_STRENGTH_DATA'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-43',keptHoliday,TRIP4b,{week:5,day:4,time:'07:00'},[{each:{weeks:[4],sport:'RUN'},asPrescribed:true,response:OK},
  {ref:{week:4,sport:'STRENGTH',day:0},completed:true,minutes:41,exercises:noRir([['back-squat',3,11,{value:82.5,unit:'KG',convention:'TOTAL'}],['db-bench-press',3,10,PH(16)],['db-row',3,10,PH(16)],['standing-calf-raise',2,16,BW],['dead-bug',2,16,BW]]),response:OK},
  {ref:{week:4,sport:'STRENGTH',day:4},completed:true,minutes:40,exercises:noRir([['db-rdl',3,8,PH(22)],['db-row',3,10,PH(16)],['db-bench-press',3,10,PH(16)],['db-split-squat',2,10,PH(14)],['dead-bug',2,16,BW]]),response:OK}],{week:5,day:4,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('running re-enters by its whole week; strength, logged without reps in reserve, continues from the holiday\'s own return'),domainNotes:''});
// DEV-44, DEV-45 (S1, S2; SSCTR BR-Q5): the DEV-30 week executed in full, the trip starting on its Sunday with a stated start time; the Sunday long
// run reported at 08:00. S1: the trip starts at 18:00, so the week counts. S2: it starts at 07:00, so the run falls inside the trip and the week does not.
const TRIPsun=startedAt=>({startDate:'2026-12-06',endDate:'2026-12-09',days:4,startedAt,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true});
const sundayWeek=[{each:{weeks:[4],sport:'RUN',roles:['EASY','QUALITY']},asPrescribed:true,response:OK},{ref:{week:4,sport:'RUN',day:6},asPrescribed:true,response:OK,observedAt:'2026-12-06T08:00:00Z'},{each:{weeks:[4],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
cases.push({caseId:'DEV-44',authorIntent:'A kept holiday, a week executed in full, a trip starting at 18:00 on its Sunday after the long run at 08:00',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','SAME_DAY_START'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-44',keptHoliday,TRIPsun('2026-12-06T18:00:00Z'),{week:5,day:3,time:'07:00'},sundayWeek,{week:5,day:3,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the long run was done before the trip started: the week re-entered the athlete; the trip alone'),domainNotes:''});
cases.push({caseId:'DEV-45',authorIntent:'The same with the trip starting at 07:00, before the long run reported at 08:00',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','SAME_DAY_START'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:separateLater('DEV-45',keptHoliday,TRIPsun('2026-12-06T07:00:00Z'),{week:5,day:3,time:'07:00'},sundayWeek,{week:5,day:3,time:'08:00'}),
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the long run falls inside the trip: that week is not a whole week between the breaks; running re-enters nothing by it'),domainNotes:''});
// R7D-HARNESS-DEV-6 r2 (the bounded cycle, before the rechecks; instrument only).
// DEV-46 (SSCTR CFR-05, SSCTR-P34R-F02): a run-only 10K plan, a kept holiday, a race week with the easy run and the race done and the race touch
// completed at half its minutes (partial by the completion rule), then a separate trip: running never re-enters by that week.
const RACE10o=intake('dev-race10o',{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'NONE'},equipment:FULL,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:0},schedule:{strengthDays:[]}});
cases.push({caseId:'DEV-46',authorIntent:'Five weeks executed, a kept two-week holiday, a race week with the race touch done at half its minutes, then a separate four-day trip (run-only plan)',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','RACE_WEEK','PARTIAL_SESSION'],oracleClass:'INVARIANT_ORACLE',intake:RACE10o,
 timeline:[...[0,1,2,3,4].map(w=>review(w,[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK}])),{stepId:'w7d0',at:{week:7,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14r}},
  {stepId:'brk2',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...TRIP4r,episodeId:'DEV-46-brk2'}},observations:[{each:{weeks:[7],sport:'RUN',roles:['EASY','RACE']},asPrescribed:true,response:OK},{each:{weeks:[7],sport:'RUN',roles:['RACE_TOUCH']},completed:true,fraction:0.5,response:OK}]},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('a half-length race touch is no race touch done as prescribed: the race week re-enters nothing and the stop runs from the holiday'),domainNotes:''});
// DEV-47 (QRE-P34-02, its probe QH1; no false block): four separate unapplied breaks, a run-complete week (the Friday strength missed) between
// each pair: the trip's return reads x as its own return, y inside x's own stop and z inside y's (a two-level chain).
const W7=w=>{const d=new Date(Date.parse('2026-11-02T00:00:00Z')+7*w*864e5);return d.toISOString().slice(0,10);};
const brkW=(w,days,x={})=>({startDate:W7(w),endDate:new Date(Date.parse(W7(w)+'T00:00:00Z')+(days-1)*864e5).toISOString().slice(0,10),days,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true,...x});
const runWeekFriMissed=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:w,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'STRENGTH',day:4},completed:false}];
cases.push({caseId:'DEV-47',authorIntent:'Four separate breaks with a run-complete week between each pair (a two-level chain of own returns)',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','PARTIAL_REENTRY','NESTED_OWN_RETURN'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,{stepId:'z',at:{week:3,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brkW(2,7,{reasonCategory:'VACATION',reason:'Holiday'})}},
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brkW(4,7,{episodeId:'DEV-47-y'})},observations:runWeekFriMissed(3)},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brkW(6,7,{episodeId:'DEV-47-x'})},observations:runWeekFriMissed(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brkW(8,4,{episodeId:'DEV-47-h'})},observations:runWeekFriMissed(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('each break is its own return in turn; the trip by its own days; running resumes what it executed'),domainNotes:''});
// R7D-HARNESS-7 (Phase 3.5, R7D-PREREG-6 Δ26-Δ28). DEV-48 (SSCTR-P34R2-F01, SY1; P18(e) sensitivity on 46934a0, and the P18(c) false-block control
// that found the systemic gap): a hybrid 10K plan whose race week holds no gated run (the race touch Thu, an optional shakeout Sat, the race Sun);
// a kept holiday; the race week with the strength session and the shakeout reported with an adverse recovery (converging across sports); then a
// separate four-day trip. The systemic rule holds both sports: no sport re-enters by the race week, the stop runs from the holiday.
const RACE10sy=intake('dev-race10sy',{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],schedule:{runDays:[3,5,6],longRunDay:6}});
const ADVr={...OK,recovery:'ADVERSE'};
cases.push({caseId:'DEV-48',authorIntent:'Five weeks executed, a kept two-week holiday, a race week without a gated run whose strength session and optional shakeout carry an adverse recovery, then a separate four-day trip',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','REENTRY_WEEK','RACE_WEEK','SYSTEMIC_SIGNAL'],oracleClass:'INVARIANT_ORACLE',intake:RACE10sy,
 timeline:[...[0,1,2,3,4].map(w=>review(w,allDone(w))),{stepId:'w7d0',at:{week:7,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14r}},
  {stepId:'brk2',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...TRIP4r,episodeId:'DEV-48-brk2'}},observations:[{each:{weeks:[7],sport:'RUN',roles:['RACE_TOUCH','RACE']},asPrescribed:true,response:OK},{each:{weeks:[7],sport:'RUN',roles:['SHAKEOUT']},asPrescribed:true,response:ADVr},{each:{weeks:[7],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:ADVr}]},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('converging adverse responses across sports hold the race week: no sport re-enters by it and the stop runs from the holiday'),domainNotes:''});
// DEV-49 (SSCTR-P34R2-F02, CU3; P18(f) sensitivity on 46934a0): a kept holiday; week 4 with the Tuesday run and the Friday lift not done; week 5 with
// its runs done but the Sunday long run, which lies inside the trip as first reported (Sun wk5 - Thu wk6), and the Friday lift not done; the trip
// applied; then corrected by name to Mon-Thu wk6, the Sunday long run left unreported (asked); then that long run reported done (the answer).
const TRIPsun5={startDate:'2026-12-13',endDate:'2026-12-17',days:5,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const TRIPmon6={startDate:'2026-12-14',endDate:'2026-12-17',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const lift=(w,d)=>({ref:{week:w,sport:'STRENGTH',day:d},asPrescribed:true,loadsByPattern:LOADS,response:OK}),ran=(w,d)=>({ref:{week:w,sport:'RUN',day:d},asPrescribed:true,response:OK}),skipped=(w,sport,d)=>({ref:{week:w,sport,day:d},completed:false});
cases.push({caseId:'DEV-49',authorIntent:'A kept holiday, two weeks short of complete, a trip applied, then corrected by name so that the Sunday long run before it, never reported, lies between the breaks; then that run reported done',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','PARTIAL_REENTRY','CORRECTION','UNREPORTED_TRAINING'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,keptHoliday,
  {stepId:'brk2',at:{week:6,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...TRIPsun5,episodeId:'DEV-49-brk2'}},observations:[lift(4,0),skipped(4,'RUN',1),ran(4,3),skipped(4,'STRENGTH',4),ran(4,6),lift(5,0),ran(5,1),ran(5,3),skipped(5,'STRENGTH',4)]},
  {stepId:'plain',at:{week:6,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}},
  {stepId:'corr',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...TRIPmon6,episodeId:'DEV-49-brk2'}}},
  {stepId:'ans',at:{week:6,day:5,time:'11:00'},event:{kind:'WEEKLY_REVIEW'},observations:[ran(5,6)]}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('the correction uncovers the Sunday long run: it is asked first; answered done, the running week counts and the holiday is its own return'),domainNotes:''});
// DEV-50 (QRE2-P34-02, the QRE probe QH4; no false block): the DEV-47 chain with its first break (ten days from Monday of week 2) overlapping the
// second (week 3): the inner own return reads a stop that merges them; P18(a) leaves the first break not evaluable, as in the disjoint chain.
cases.push({caseId:'DEV-50',authorIntent:'Four separate breaks, the first overlapping the second, with a run-complete week between the others (a two-level chain of own returns)',coverageTags:['DECLARED_BREAK','MULTIPLE_BREAKS','PARTIAL_REENTRY','NESTED_OWN_RETURN'],oracleClass:'INVARIANT_ORACLE',intake:GEN,
 timeline:[...twoWeeks,{stepId:'z',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brkW(2,10,{reasonCategory:'VACATION',reason:'Holiday'})}},
  {stepId:'y',at:{week:4,day:0,time:'08:00'},event:{kind:'LOCAL_FATIGUE',interruption:brkW(3,7,{episodeId:'DEV-50-y'})}},
  {stepId:'x',at:{week:6,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brkW(5,7,{episodeId:'DEV-50-x'})},observations:runWeekFriMissed(4)},
  {stepId:'h',at:{week:7,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brkW(7,4,{episodeId:'DEV-50-h'})},observations:runWeekFriMissed(6)},
  {stepId:'plain',at:{week:7,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],
 expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:assess('each break is its own return in turn, the first two read as one stop; the trip by its own days'),domainNotes:''});
fs.writeFileSync(process.argv[2],JSON.stringify({corpusRevision:'R7D-HARNESS-DEV-7',contaminated:true,cases},null,1)+'\n');
console.log('dev cases',cases.length);
