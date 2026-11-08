// R7D-HARNESS-VALIDATION-9 development cases (R7-D Phase 5, R7D-PREREG-8): DEV_CASES_R7D_8.json (never edited) plus ten cases written by the
// instrument owner in the shapes the Phase 4 judgments proved or asked to be reachable:
//   DEV-63 (QRE-P4-H01): an intake whose stated longest run is 0 minutes after a long work pause (P06 read it as a 0-minute run).
//   DEV-64 (QRE-P4-H02): five silent weeks, then a review on week 5's last day reporting that week done, that day's run included (P03(d) read the
//     reported run of the review's own day as a dose still ahead).
//   DEV-65 (QRE-P4-H03): a long silence asked about at a week's last review, answered the same evening with shortened runs and two missed long
//     runs, then the next week reported in bulk as prescribed a week later (CARRIER_CLINICAL compared at that later step, whose facts the two runs
//     resolve against different plans).
//   DEV-66 (CARRIER_HOLD reachable): a long silence asked about on the last week's first evening, with runs still ahead, answered half an hour later,
//     then the last week reported (the recipe of R7D-INTERFACE-8 §5).
//   DEV-67 (QRE-P4-F01, sensitivity on R7D-FREEZE-5): the R7D-F13 athlete silent for seven weeks; the empty week-7 review before a CONSOLIDATION week.
//   DEV-68 (SSCTR-P4-F01, domain-judged): the R7D-F13 timeline (silence, the answer with a long break, the re-entry week executed).
//   DEV-69 (R7D-FC-01): the R7D-F13 athlete with three weeks reported as prescribed (a band row).
//   DEV-70 (R7D-INTERFACE-8 §2, client-9): a substitution named by pattern only, whose pattern the week's first strength session does not hold.
//   DEV-71 (race-week shape reachable, R7D-INTERFACE-8 §4): a 10K runner whose race-week run days are the race, the day before and a day four days
//     before; weeks 0-5 reported as prescribed with their loads.
//   DEV-72 (optional sessions reachable, R7D-INTERFACE-8 §4): a long work break with four run days (a restart keeps the extra day as an optional
//     walk); the re-entry week reported with the walk not done.
// The R7D-F13 athlete is the spent Phase 4 holdout's (synthetic; the Founder's Phase 5 authorization asks the tests to reproduce it; final/ is never
// evaluated again). Development cases only: contaminated by construction, never holdout or generalization evidence.
//   node build-dev-cases-9.mjs <DEV_CASES_R7D_8.json> <out DEV_CASES_R7D_9.json>
import fs from 'node:fs';
const [devFile,outFile]=process.argv.slice(2);
if(!devFile||!outFile)throw Error('usage: <DEV_CASES_R7D_8.json> <out file>');
if(fs.existsSync(outFile))throw Error('refusing to overwrite '+outFile);
const dev=JSON.parse(fs.readFileSync(devFile,'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const byId=id=>{const c=dev.cases.find(x=>x.caseId===id);if(!c)throw Error('missing '+id);return clone(c);};
const E=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const intake=(o)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:o.asOf,startDate:o.startDate,weeks:o.weeks,timezoneOffsetMinutes:o.tz??0,
 athlete:{id:o.id,ageEligible:true,eligibility:E(o.asOf),runExperience:o.run,strengthExperience:o.str,recent:o.recent,goals:o.goals,equipment:o.equipment,...(o.pause?{pause:o.pause}:{})},schedule:o.schedule});
const GEN=id=>{const k=byId('DEV-10').intake;k.athlete.id=id;return k;};
const F13=id=>intake({id,asOf:'2026-11-15',startDate:'2026-11-16',weeks:16,tz:-300,run:'NOVICE',str:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT','BANDS'],schedule:{runDays:[0,2,5],strengthDays:[3],runMinutes:35,strengthMinutes:30,longRunDay:5,longRunMinutes:50}});
const done=(w,extra={})=>[{each:{weeks:[w],sport:'RUN'},completed:true,asPrescribed:true},{each:{weeks:[w],sport:'STRENGTH'},completed:true,asPrescribed:true,...extra}];
const review=(stepId,week,day,time,x={})=>({stepId,at:{week,day,time},event:{kind:'WEEKLY_REVIEW',...(x.interruption?{interruption:x.interruption}:{})},...(x.observations?{observations:x.observations}:{}),...(x.answer?{answer:x.answer}:{})});
const kase=(caseId,authorIntent,intakeObj,timeline,tags)=>({caseId,authorIntent,coverageTags:tags,oracleClass:'INVARIANT_ORACLE',intake:intakeObj,timeline,expectedDomainProperties:[],metamorphicRelations:[],
 independentAssessment:{rationale:'Development case of the instrument owner (R7D-HARNESS-VALIDATION-9).',preferredCoachingBehavior:'As the authorities state.',acceptableAlternatives:[],concerns:[]},domainNotes:'Development case; contaminated by construction.'});
const added=[
 kase('DEV-63','R7D-HARNESS-VALIDATION-9 (QRE-P4-H01): an intermediate runner back from a 14-week nonclinical work pause states a longest run of 0 minutes; an empty first review. A stated 0 is no completed run: P06 has no reference (NOT_EVALUABLE), never a 5-minute ceiling.',
  intake({id:'dev-h01',asOf:'2026-11-08',startDate:'2026-11-09',weeks:12,tz:60,run:'INTERMEDIATE',str:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:0},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT'],pause:{nonclinical:true,weeks:14,reasonCategory:'WORK',reason:'long work project, stopped all training'},schedule:{runDays:[0,2,5],strengthDays:[3],runMinutes:40,strengthMinutes:30,longRunDay:5,longRunMinutes:60}}),
  [review('w0r',0,6,'20:00')],['COLD_START','RESTART','EMPTY_REVIEW']),
 kase('DEV-64','R7D-HARNESS-VALIDATION-9 (QRE-P4-H02): weeks 0-4 never reported; week 5 reported done at its last review, that day\'s long run included. The reported run of the review\'s own day is history, not a dose ahead: P03(d) lists that week NOT_EVALUABLE, never a FAIL.',
  GEN('dev-h02'),[review('w5r',5,6,'21:00',{observations:done(5)})],['UNREPORTED_WEEKS','LATE_REPORTER']),
 kase('DEV-65','R7D-HARNESS-VALIDATION-9 (QRE-P4-H03): five silent weeks; the empty week-4 review asks about them; the same evening the athlete answers: runs shortened to 80 percent, the week-3 and week-4 long runs not done; a week later week 5 reported in bulk as prescribed. CARRIER_CLINICAL compares at a probe one minute after the answer.',
  GEN('dev-h03'),[review('w4r',4,6,'20:00'),review('ans',4,6,'20:30',{answer:{report:{completed:true,fraction:0.8},overrides:[{ref:{week:3,sport:'RUN',role:'LONG'},completed:false},{ref:{week:4,sport:'RUN',role:'LONG'},completed:false}]}}),review('w5r',5,6,'21:00',{observations:done(5)})],['UNREPORTED_WEEKS','LATE_ANSWER','SHORTENED_RUNS']),
 kase('DEV-66','R7D-HARNESS-VALIDATION-9 (CARRIER_HOLD reachable, R7D-INTERFACE-8 §5): eleven silent weeks; the empty review on the last week\'s first evening, with its runs still ahead, asks; half an hour later every listed session is reported done as prescribed; the last week reported at its end.',
  GEN('dev-hold'),[review('w11d0',11,0,'20:00'),review('ans',11,0,'20:30',{answer:{report:{completed:true,asPrescribed:true}}}),review('w11r',11,6,'21:00',{observations:done(11)})],['UNREPORTED_WEEKS','LATE_ANSWER','SCHEDULE_CHANGE']),
 kase('DEV-67','R7D-HARNESS-VALIDATION-9 (QRE-P4-F01, sensitivity on R7D-FREEZE-5): the R7D-F13 novice silent for seven weeks; the empty week-7 review before a low-dose CONSOLIDATION week. R7D-FREEZE-5 trims the doses VALID with no question (P03(d)); the candidate asks.',
  F13('dev-f13q'),[review('w7r',7,6,'20:00')],['UNREPORTED_WEEKS','EMPTY_REVIEW','RUN_EXP_NOVICE']),
 kase('DEV-68','R7D-HARNESS-VALIDATION-9 (SSCTR-P4-F01, domain-judged): the R7D-F13 timeline: the empty week-7 review, the answer with a 47-day work break, the re-entry week executed. Exercises never executed before the break follow the D49 return (P08 strength is DOMAIN_JUDGED): no automated violation expected.',
  F13('dev-f13r'),[review('s1',7,6,'20:00'),review('s2',7,6,'20:40',{observations:[{each:{weeks:[0],sport:'RUN'},completed:true,asPrescribed:true},{each:{weeks:[0],sport:'STRENGTH'},completed:true,asPrescribed:true},{ref:{week:1,sport:'RUN',day:0},completed:true,asPrescribed:true}],answer:{declareBreak:{startDate:'2026-11-24',endDate:'2027-01-09',reasonCategory:'WORK',reason:'night shifts for seven weeks, no training at all',nonclinical:true}}}),review('s3',8,6,'20:00',{observations:done(8)})],['UNREPORTED_WEEKS','LATE_ANSWER','RETURN_LONG','RESTART']),
 kase('DEV-69','R7D-HARNESS-VALIDATION-9 (R7D-FC-01): the R7D-F13 novice with weeks 0-2 reported as prescribed; the band row is evidence and progresses by repetitions. No automated violation expected.',
  F13('dev-f13b'),[0,1,2].map(w=>review('w'+w+'r',w,6,'20:00',{observations:done(w)})),['COLD_START','RUN_EXP_NOVICE','STR_EXP_NOVICE']),
 kase('DEV-70','R7D-HARNESS-VALIDATION-9 (R7D-INTERFACE-8 §2, client-9): a gym hypertrophy athlete whose week-1 first strength session holds no PUSH exercise; a skill-mismatch substitution named by pattern only ({week:1, pattern:PUSH}). The client resolves it to the first session of that week that holds the pattern (the R7D-HARNESS-8 client refused it as a corpus error).',
  intake({id:'dev-subpat',asOf:'2026-11-08',startDate:'2026-11-09',weeks:8,run:'INTERMEDIATE',str:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:90,longestRunMinutes:50,strengthDaysPerWeek:3},goals:{run:'GENERAL',strength:'HYPERTROPHY'},equipment:['BARBELL','RACK','BENCH','DUMBBELLS','MACHINES','PULL_UP_BAR'],schedule:{runDays:[1,5],strengthDays:[0,2,4],runMinutes:45,strengthMinutes:60,longRunDay:5,longRunMinutes:60}}),
  [{stepId:'sub',at:{week:1,day:0,time:'07:00'},event:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseRef:{week:1,pattern:'PUSH'},reason:'SKILL_MISMATCH'}}}],['SUBSTITUTION']),
 kase('DEV-71','R7D-HARNESS-VALIDATION-9 (race-week shape reachable, R7D-INTERFACE-8 §4): a 10K runner with run days Wednesday, Saturday and Sunday and the race on a Sunday; weeks 0-5 reported as prescribed with stated loads. Its race week holds only the race touch, the optional shakeout and the race.',
  intake({id:'dev-race',asOf:'2026-11-08',startDate:'2026-11-09',weeks:8,run:'INTERMEDIATE',str:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'RUNNING_SUPPORT'},equipment:['DUMBBELLS','BENCH','BODYWEIGHT'],schedule:{runDays:[2,5,6],strengthDays:[0,3],runMinutes:60,strengthMinutes:45,longRunDay:6,longRunMinutes:90}}),
  [0,1,2,3,4,5].map(w=>review('w'+w+'r',w,6,'21:00',{observations:done(w,{loadsByPattern:{SQUAT:20,HINGE:20,LUNGE:10,PUSH:12,PULL:14,CALF:16}})})),['RACE_10K','TAPER','RACE_WEEK']),
 kase('DEV-72','R7D-HARNESS-VALIDATION-9 (optional sessions reachable, R7D-INTERFACE-8 §4): a novice with four run days; a five-week work break declared at the week-6 review (a restart: the extra run day stays an optional walk); the re-entry week reported with every session done except the optional walk.',
  intake({id:'dev-walks',asOf:'2026-11-08',startDate:'2026-11-09',weeks:12,run:'NOVICE',str:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:75,longestRunMinutes:30,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT','BANDS'],schedule:{runDays:[0,2,4,6],strengthDays:[3],runMinutes:40,strengthMinutes:30,longRunDay:6,longRunMinutes:50}}),
  [review('w0r',0,6,'21:00',{observations:done(0)}),review('ret',6,6,'21:00',{interruption:{startDate:'2026-11-16',endDate:'2026-12-20',reasonCategory:'WORK',reason:'project deadline',nonclinical:true}}),
   review('w7r',7,6,'21:00',{observations:[{each:{weeks:[7],sport:'RUN',roles:['EASY','LONG','WALK_JOG']},completed:true,asPrescribed:true},{each:{weeks:[7],sport:'RUN',roles:['WALK']},completed:false},{each:{weeks:[7],sport:'STRENGTH'},completed:true,asPrescribed:true}]})],['RETURN_LONG','RESTART','FREQ_HIGH'])
];
const ids=new Set(dev.cases.map(c=>c.caseId));for(const c of added)if(ids.has(c.caseId))throw Error('duplicate id '+c.caseId);
const out={...dev,corpusRevision:'R7D-DEV-9',note:'DEV_CASES_R7D_8 (R7-D Phase 4) plus DEV-63 to DEV-72 (R7-D Phase 5, R7D-PREREG-8). Development cases only, contaminated by construction.',cases:[...dev.cases,...added]};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:out.cases.length,added:added.map(c=>c.caseId)}));
