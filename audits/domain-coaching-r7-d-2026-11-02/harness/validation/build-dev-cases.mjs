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
fs.writeFileSync(process.argv[2],JSON.stringify({corpusRevision:'R7D-HARNESS-DEV-1',contaminated:true,cases},null,1)+'\n');
console.log('dev cases',cases.length);
