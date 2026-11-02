// R7-D structural corpus check (R7D-INTERFACE-1 §7–8). Checks shapes, vocabularies, dates and references between steps and expectations.
// It never imports or runs the coach and knows nothing about its rules: a case that passes here can still be a corpus error when a session
// reference matches nothing in the coach's plan. Usage: node check-corpus.mjs <corpus.json>   (exit 1 on any error)
import fs from 'node:fs';

export const WINDOW={from:'2026-11-03',to:'2027-04-30'};
export const ORACLE_CLASSES=['INVARIANT_ORACLE','DOMAIN_ORACLE','METAMORPHIC_ORACLE','NOT_EVALUABLE_DOMAIN'];
export const EVENT_KINDS=['WEEKLY_REVIEW','MISSED_SESSION','PARTIAL_SESSION','UNDERPERFORMANCE','OVERPERFORMANCE','PROGRESSION_NOT_TOLERATED','PROGRESSION_TOO_EASY','LOCAL_FATIGUE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE','UNAVAILABLE_DAY','DOUBLE_CONFLICT','EQUIPMENT_CHANGE','GOAL_CHANGE','EVENT_DATE_CHANGE','EVENT_WEEK_CONFLICT','RETURN_AFTER_PAUSE','EXERCISE_SUBSTITUTION','RECOVERED'];
export const ASSERT_TYPES=['STATUS_IN','VALIDITY_IS','QUESTION_KIND_IS','NO_PRESCRIPTION','ROLE_ABSENT','ROLE_PRESENT','PHASE_IS','ROLE_MINUTES_COMPARE','JUDGED'];
export const RELATIONS=['PERMUTE_OBSERVATIONS','DUPLICATE_SECOND_SOURCE','RENAME_OPAQUE_IDS','LOAD_CONVENTION_EQUIVALENT','RESEND','CARRIER_CLINICAL','CARRIER_HOLD','CONSENT_OFF','CALENDAR_SHIFT','VARIANT'];
export const COVERAGE_TAGS=['COLD_START','RUN_FIRST','STRENGTH_FIRST','BALANCED_HYBRID','RUN_ONLY','STRENGTH_ONLY','GENERAL_FITNESS','RACE_10K','RACE_HALF','NON_RACE','H4','H8','H12','H16','RUN_EXP_NONE','RUN_EXP_NOVICE','RUN_EXP_INTERMEDIATE','RUN_EXP_EXPERIENCED','STR_EXP_NONE','STR_EXP_NOVICE','STR_EXP_INTERMEDIATE','STR_EXP_EXPERIENCED','FREQ_LOW','FREQ_HIGH','SHARED_DAYS','SAME_TURN','TOO_MANY_DAYS','BODYWEIGHT_ONLY','KETTLEBELL','GYM','WEARABLE_PARTIAL','WEARABLE_FULL','LOW_DATA','START_NON_MONDAY','ELIGIBILITY_UNKNOWN','CLINICAL_SIGNAL','CLINICAL_PAUSE','OUT_OF_SCOPE','UNREPORTED_WEEKS','LATE_ANSWER','PARTIAL_ANSWER','SHORTENED_RUNS','MIXED_EXECUTION','ADVERSE_RESPONSE','LATE_REPORTER','SKIPPED_REVIEW','EMPTY_REVIEW','SCHEDULE_CHANGE','UNAVAILABLE_DAY','DOUBLE_CONFLICT','EQUIPMENT_CHANGE','TRAVEL','SUBSTITUTION','SUBSTITUTION_PAIN_CLEARANCE','GOAL_CHANGE','EVENT_DATE_CHANGE','FATIGUE_LOCAL','FATIGUE_SYSTEMIC','REPEATED_SIGNAL','RETURN_SHORT','RETURN_MODERATE','RETURN_LONG','RESTART','WALK_JOG','TAPER','RACE_WEEK','POST_RACE','TAPER_ANSWER','DUPLICATE_SOURCES','CONTRADICTION','CORRECTION','OUT_OF_ORDER','CLOCK_SKEW','TIMEZONE','LEARNING_PATTERN','LEARNING_NOISE','NO_CONSENT','CONSENT_REVOKED','OFFERS','LOAD_CONFIRMATION','SAME_FACTS_DIFFERENT_ORDER'];
const LIBRARY=['back-squat','goblet-squat','kb-goblet-squat','leg-press','box-squat-bodyweight','sit-to-stand','barbell-rdl','db-rdl','kb-deadlift','hip-thrust-db','glute-bridge','hip-hinge-practice','db-split-squat','db-step-up','reverse-lunge','split-squat-bodyweight','standing-calf-raise','db-calf-raise','supported-calf-raise','bench-press','db-bench-press','db-floor-press','machine-chest-press','push-up','incline-push-up','wall-pushup','db-overhead-press','one-arm-db-row','db-row','barbell-row','lat-pulldown','seated-cable-row','pull-up','band-row','prone-row-practice','dead-bug','dead-bug-practice','side-plank','pallof-press'];
const isDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const isTs=v=>typeof v==='string'&&/T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const inWindow=d=>d>=WINDOW.from&&d<=WINDOW.to;

export function checkCorpus(corpus){
 const errors=[],warnings=[],E=(where,msg)=>errors.push(`${where}: ${msg}`),W=(where,msg)=>warnings.push(`${where}: ${msg}`);
 if(!corpus||typeof corpus!=='object')return {errors:['corpus: not an object'],warnings};
 if(typeof corpus.corpusRevision!=='string')E('corpus','corpusRevision is required');
 if(!Array.isArray(corpus.cases)||!corpus.cases.length)return {errors:[...errors,'corpus: cases must be a non-empty list'],warnings};
 const ids=new Set();
 for(const [n,c] of corpus.cases.entries()){
  const at=`case ${c?.caseId??'#'+n}`;
  if(typeof c?.caseId!=='string'||!/^R7D-[A-Z0-9-]+$/.test(c.caseId))E(at,'caseId must look like R7D-…');
  if(ids.has(c?.caseId))E(at,'duplicate caseId');ids.add(c?.caseId);
  for(const k of ['authorIntent','domainNotes'])if(typeof c?.[k]!=='string')E(at,`${k} must be a string`);
  if(!ORACLE_CLASSES.includes(c?.oracleClass))E(at,'oracleClass');
  if(!Array.isArray(c?.coverageTags)||!c.coverageTags.length)E(at,'coverageTags must be a non-empty list');else for(const t of c.coverageTags)if(!COVERAGE_TAGS.includes(t))E(at,'unknown coverage tag '+t);
  const ia=c?.independentAssessment;
  if(!ia||typeof ia.rationale!=='string'||typeof ia.preferredCoachingBehavior!=='string'||!Array.isArray(ia.acceptableAlternatives)||!Array.isArray(ia.concerns))E(at,'independentAssessment {rationale, preferredCoachingBehavior, acceptableAlternatives[], concerns[]}');
  const i=c?.intake;
  if(!i||i.version!=='R6-INTAKE-1'||i.synthetic!==true||i.purpose!=='SHADOW_REFERENCE'){E(at,'intake must be R6-INTAKE-1, synthetic, SHADOW_REFERENCE');continue;}
  if(!isDay(i.asOf)||!isDay(i.startDate))E(at,'intake asOf and startDate must be YYYY-MM-DD');
  else{
   if(!inWindow(i.asOf)||!inWindow(i.startDate))E(at,'intake asOf/startDate outside the date window');
   if(i.asOf>i.startDate)W(at,'intake asOf is after startDate');
  }
  if(![4,8,12,16].includes(i.weeks))E(at,'weeks must be 4, 8, 12 or 16');
  const end=isDay(i.startDate)&&[4,8,12,16].includes(i.weeks)?addDays(i.startDate,i.weeks*7-1):null;
  if(end&&end>WINDOW.to)W(at,`the program ends ${end}, after the window: steps after ${WINDOW.to} would be invalid`);
  const a=i.athlete;
  if(!a||typeof a.id!=='string')E(at,'athlete.id');
  if(a&&!a.goals)E(at,'athlete.goals');
  if(a&&(a.eligibility===undefined||typeof a.eligibility!=='object'))E(at,'athlete.eligibility must be an object (use status UNKNOWN to leave it unknown)');
  const ev=a?.event??(typeof a?.goals?.run==='object'?a.goals.run.event:null);
  if(ev?.date){if(!isDay(ev.date)||!inWindow(ev.date))E(at,'event date outside the window or malformed');else if(isDay(i.startDate)&&end&&(ev.date<i.startDate||ev.date>end))W(at,'event date outside the program');}
  for(const k of a?.knownExercises??[])if(!LIBRARY.includes(k?.id))E(at,'known exercise outside the library: '+k?.id);
  const s=i.schedule;
  if(!s||!Array.isArray(s.runDays)||!Array.isArray(s.strengthDays))E(at,'schedule.runDays and strengthDays must be lists');
  else for(const d of [...s.runDays,...s.strengthDays,...(s.longRunDay!=null?[s.longRunDay]:[])])if(!Number.isInteger(d)||d<0||d>6)E(at,'schedule days are 0–6');
  if(!Array.isArray(c.timeline))E(at,'timeline must be a list (may be empty)');
  const steps=new Set();let prev=null;
  for(const [k,st] of (c.timeline??[]).entries()){
   const w=`${at} step ${st?.stepId??'#'+k}`;
   if(typeof st?.stepId!=='string'||steps.has(st.stepId)||st.stepId==='GENERATE')E(w,'stepId missing or duplicate');steps.add(st?.stepId);
   let clock=null;
   if(typeof st?.at==='string'){if(!isTs(st.at))E(w,'explicit clock needs a timestamp with zone');else clock=st.at;}
   else if(st?.at&&Number.isInteger(st.at.week)&&Number.isInteger(st.at.day)&&st.at.day>=0&&st.at.day<=6&&/^\d{2}:\d{2}$/.test(st.at.time??'')){
    if(st.at.week<0||st.at.week>=i.weeks)E(w,'week outside the program');
    if(isDay(i.startDate)){const d=addDays(i.startDate,st.at.week*7+st.at.day);if(!inWindow(d))E(w,'step date outside the window');const off=i.timezoneOffsetMinutes??0,sg=off<0?'-':'+',ab=Math.abs(off);clock=`${d}T${st.at.time}:00${sg}${String(Math.floor(ab/60)).padStart(2,'0')}:${String(ab%60).padStart(2,'0')}`;}
   }else E(w,'at must be {week, day 0-6, time HH:MM} or a zoned timestamp');
   if(clock&&prev&&Date.parse(clock)<Date.parse(prev))E(w,'steps must be in clock order');if(clock)prev=clock;
   if(!EVENT_KINDS.includes(st?.event?.kind))E(w,'event.kind unknown');
   if(st?.eligibility!==undefined&&st.eligibility!=='REANSWERED_NO_CHANGE'&&typeof st.eligibility!=='object')E(w,'eligibility');
   if(st?.clearance!==undefined&&st.clearance!=='QUALIFIED_CLEARANCE')E(w,'clearance');
   for(const [j,f] of (st?.observations??[]).entries()){
    const fw=`${w} fact ${j}`;
    if(f?.each){if(!['RUN','STRENGTH'].includes(f.each.sport))E(fw,'each.sport');if(!Array.isArray(f.each.weeks)&&!Number.isInteger(f.each.weeks))E(fw,'each.weeks');}
    else if(!f?.ref||!Number.isInteger(f.ref.week)||!['RUN','STRENGTH'].includes(f.ref.sport))E(fw,'ref {week, sport, day?, role?}');
    if(typeof f?.completed!=='boolean'&&f?.asPrescribed!==true)E(fw,'completed:boolean (or asPrescribed:true)');
    for(const k of ['observedAt','reportedAt','correctedAt'])if(f?.[k]!==undefined&&!isTs(f[k]))E(fw,k+' needs a zoned timestamp');
    for(const k of ['observedAt','reportedAt'])if(isTs(f?.[k])&&!inWindow(f[k].slice(0,10)))E(fw,k+' outside the window');
   }
   if(st?.answer!==undefined&&(typeof st.answer!=='object'||(!st.answer.report&&!st.answer.overrides&&!st.answer.declareBreak)))E(w,'answer needs report, overrides or declareBreak');
   if(st?.event?.kind==='EXERCISE_SUBSTITUTION'&&!st.event.substitution?.exerciseRef)E(w,'substitution.exerciseRef {week, day, pattern?}');
  }
  for(const [k,e] of (c.expectedDomainProperties??[]).entries()){
   const w=`${at} expectation ${e?.expectationId??'#'+k}`;
   if(e?.atStep!=='GENERATE'&&!steps.has(e?.atStep))E(w,'atStep must be GENERATE or a stepId of this case');
   if(!ORACLE_CLASSES.includes(e?.oracleClass))E(w,'oracleClass');
   if(!ASSERT_TYPES.includes(e?.assert?.type))E(w,'assert.type');
   if(e?.atStep==='GENERATE'&&e?.assert?.type==='VALIDITY_IS')E(w,'VALIDITY_IS is about a later decision, not onboarding');
  }
  for(const [k,r] of (c.metamorphicRelations??[]).entries()){
   const w=`${at} relation #${k}`;
   if(!RELATIONS.includes(r?.relation))E(w,'unknown relation');
   if(r?.relation==='VARIANT'){if(!r.variant||(!r.variant.intakePatch&&!r.variant.timeline))E(w,'VARIANT needs variant.intakePatch and/or variant.timeline');if(!['SAME_PLAN','NOT_HIGHER_RUN_LOAD','NOT_LOWER_RUN_LOAD'].includes(r.expect))E(w,'VARIANT expect');const vs=new Set((r.variant?.timeline??c.timeline??[]).map(x=>x.stepId));if(!steps.has(r.compareAtStep)||!vs.has(r.compareAtStep))E(w,'compareAtStep must exist in both timelines');}
  }
 }
 return {errors,warnings};
}
const main=process.argv[1]&&import.meta.filename&&process.argv[1].endsWith('check-corpus.mjs');
if(main){
 const corpus=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const {errors,warnings}=checkCorpus(corpus);
 console.log(JSON.stringify({cases:corpus.cases?.length??0,errors,warnings},null,1));
 process.exitCode=errors.length?1:0;
}
