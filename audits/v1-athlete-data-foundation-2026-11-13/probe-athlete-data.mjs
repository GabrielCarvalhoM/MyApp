// Athlete Data Foundation (2026-11-13): read-only probe of the four onboarding scenarios (A-D) on the CURRENT composed-entry base,
// v1-run-index.mjs (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1, c8104c1), with the options integration passes: none.
// It edits nothing and writes nothing. Each check prints PASS/FAIL against the diagnosis in ATHLETE_DATA_FOUNDATION.md section 1.
// Run from the repository root: node audits/v1-athlete-data-foundation-2026-11-13/probe-athlete-data.mjs
import * as X from '../../CoachingCore/src/v1-run-index.mjs';

const AS_OF='2026-11-13',START='2026-11-16';
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const ELIG={status:'NONCLINICAL_CONFIRMED',assessedAt:AS_OF,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false};
const intake=(athlete,schedule={},extra={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:AS_OF,startDate:START,weeks:12,timezoneOffsetMinutes:-180,
 athlete:{id:'adf-athlete',ageYears:34,eligibility:ELIG,equipment:['BODYWEIGHT','DUMBBELLS','BENCH','BARBELL','RACK'],...athlete},schedule,...extra});
const run=input=>X.generateProgram(input);
const results=[];
const check=(scenario,claim,ok,observed)=>{results.push({scenario,claim,ok:!!ok,observed});};
const est=r=>Object.fromEntries(Object.entries(r.runCalibration?.estimates??{}).map(([k,v])=>[k,v.status==='AVAILABLE'?`${v.lowSeconds}-${v.highSeconds}`:v.reason]));

// ---------- A. Absolute beginner, no history ----------
{
 const r=run(intake({runTrainingMonths:0,strengthTrainingMonths:0,goals:{run:'GENERAL',strength:'GENERAL'}},{runDays:[1,4],strengthDays:[2],runMinutes:30,strengthMinutes:40}));
 const cap=r.program?.capability;
 check('A','plan generated',r.status!=='ASK'&&!!r.program,r.status);
 check('A','run class WALK_JOG (experience NONE)',cap?.run.class==='WALK_JOG',cap?.run.class);
 check('A','strength class NONE (effort-guided establishment)',cap?.strength.class==='NONE',cap?.strength.class);
 check('A','calibration effort only, no estimate',r.runCalibration.status==='EFFORT_ONLY'&&Object.values(r.runCalibration.estimates).every(e=>e.status!=='AVAILABLE'),{status:r.runCalibration.status,estimates:est(r)});
}

// ---------- B. Declared runner, no imports ----------
const B={runTrainingMonths:36,strengthTrainingMonths:0,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80},goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,70),timeGoalMinutes:42}},strength:'NONE'}};
const BS={runDays:[1,3,5,6],runMinutes:50,longRunMinutes:90,longRunDay:6};
{
 // B1: only an undated personal best (what a typical "your best 10K" field gives).
 const r=run(intake({...B,performanceAnchors:[{sport:'RUN',kind:'PERSONAL_BEST',distance:'10K',time:'45:00',measurement:'OFFICIAL',tolerated:true}]},BS));
 const cap=r.program?.capability,c=r.runCalibration;
 check('B1','plan generated',!!r.program,r.status);
 check('B1','run class EASY_CURRENT (not beginner)',cap?.run.class==='EASY_CURRENT',cap?.run.class);
 check('B1','experience derived from months (INTERMEDIATE+), basis kept',r.program?.canonical.athlete.runExperience==='EXPERIENCED'&&r.program?.canonical.athlete.experienceBasis?.run?.months===36,r.program?.canonical.athlete.experienceBasis);
 check('B1','undated PB is history, never capacity',c.capacity.status==='NONE'&&c.historicalBest.some(h=>h.kind==='PERSONAL_BEST'&&h.isCurrentCapacity===false),{capacity:c.capacity.status,historicalBest:c.historicalBest.map(h=>h.reasons)});
 check('B1','time goal is never evidence: no estimate, relation NO_CURRENT_ESTIMATE',c.goal?.relation==='NO_CURRENT_ESTIMATE'&&c.goal?.isPrediction===false&&c.goal?.usedForPace===false,c.goal);
 check('B1','pace bands unavailable at week 0 (no P1 before plan runs)',c.paceBands.EASY.status==='UNAVAILABLE',c.paceBands.EASY);
}
{
 // B2: a dated official 10K, 30 days old, with measurement, effort and tolerance.
 const r=run(intake({...B,performanceAnchors:[{id:'b2-10k',sport:'RUN',kind:'RACE_RESULT',distance:'10K',time:'46:30',date:addDays(AS_OF,-30),measurement:'OFFICIAL',rpe:9,completed:true,tolerated:true}]},BS));
 const c=r.runCalibration;
 check('B2','dated official result calibrates capacity',c.capacity.status==='CALIBRATED',{status:c.capacity.status,confidence:c.capacity.confidence});
 check('B2','10K estimate available; goal positioned, never used for pace',c.estimates['10K'].status==='AVAILABLE'&&c.goal?.relation&&c.goal.relation!=='NO_CURRENT_ESTIMATE'&&c.goal.usedForPace===false,{estimates:est(r),goal:c.goal?.relation});
}
{
 // B3: the same race as a minimal form would send it: no measurement, no tolerance, no effort.
 const r=run(intake({...B,performanceAnchors:[{id:'b3-10k',kind:'RACE_RESULT',distance:'10K',time:'46:30',date:addDays(AS_OF,-30)}]},BS));
 const c=r.runCalibration,e=c.evidence.find(x=>x.id==='b3-10k');
 check('B3','minimal race entry is REJECTED (measurement and tolerance missing)',e?.use==='REJECTED'&&e.reasons.includes('MEASUREMENT_UNKNOWN')&&e.reasons.includes('TOLERANCE_NOT_REPORTED'),e&&{use:e.use,reasons:e.reasons});
 check('B3','so capacity stays NONE',c.capacity.status==='NONE',c.capacity.status);
}
{
 // B4: a recent race without sport:'RUN' does not reach the intake's longest-run reading (longestFromRace); with it, it does.
 const anchor={kind:'RACE_RESULT',distance:'10K',distanceKm:10,durationMinutes:46.5,date:addDays(AS_OF,-10),measurement:'OFFICIAL',completed:true,tolerated:true,rpe:9};
 const noSport=run(intake({...B,recent:{runDaysPerWeek:4,runMinutesPerWeek:200},performanceAnchors:[anchor]},BS)).program?.canonical.athlete.recentRun;
 const withSport=run(intake({...B,recent:{runDaysPerWeek:4,runMinutesPerWeek:200},performanceAnchors:[{...anchor,sport:'RUN'}]},BS)).program?.canonical.athlete.recentRun;
 check('B4','anchor needs sport RUN to count as the recent longest run',noSport&&noSport.longestFromRace===undefined&&withSport?.longestFromRace===46,{noSport:noSport?.longestFromRace??null,withSport:withSport?.longestFromRace??null});
}

// ---------- C. Runner with recent Apple Health history (onboarding import) ----------
const hk=(i,day,min,km,x={})=>({startedAt:addDays(AS_OF,-day)+'T10:00:00Z',sport:'RUN',durationMinutes:min,distanceKm:km,canonicalActivityId:'hk-'+i,provider:'HEALTHKIT',completeness:'COMPLETE',...x});
const history=[hk(1,2,45,8),hk(2,4,40,7.2),hk(3,6,75,13),hk(4,9,45,8.1),hk(5,11,40,7),hk(6,13,70,12.5),hk(7,16,45,8),hk(8,18,40,7.1),hk(9,20,65,11.5),hk(10,23,45,8),hk(11,25,40,7),hk(12,27,60,10.5),
 hk(3,6,75,13,{provider:'VILUMO_APP'})]; // the same run twice (same canonicalActivityId)
const C={runTrainingMonths:18,goals:{run:'PERFORMANCE',strength:'NONE'},wearableCapabilities:{activityAvailable:true,completeness:'FULL',provider:'HEALTHKIT',historyWeeks:4}};
const CS={runDays:[1,3,6],runMinutes:50,longRunMinutes:80,longRunDay:6};
{
 const r=run(intake({...C,history},CS)),a=r.program?.canonical.athlete,c=r.runCalibration;
 check('C','history read as wearable exposure',a?.recentRun.basis==='WEARABLE_FULL'&&a.recentRun.runMinutesPerWeek===Math.round((45+40+75+45+40+70+45+40+65+45+40+60)/4),a?.recentRun);
 check('C','same activity counted once',a?.historySummary.duplicatesRemoved===1,a?.historySummary.duplicatesRemoved);
 check('C','run class from imported minutes (not beginner)',r.program?.capability.run.class==='EASY_CURRENT',r.program?.capability.run.class);
 check('C','imported distances are dropped by the intake (no km anywhere in the canonical history)',!JSON.stringify(a?.historySummary).includes('distanceKm')&&!JSON.stringify(a?.recentRun).includes('Km'),Object.keys(a?.historySummary??{}));
 check('C','imported runs give no pace: capacity NONE, EASY band unavailable with 0 observed runs',c.capacity.status==='NONE'&&c.paceBands.EASY.status==='UNAVAILABLE'&&c.paceBands.EASY.observed?.count===0,{capacity:c.capacity.status,easy:c.paceBands.EASY});
}
{
 // C2: import of only 10 days without historyWeeks: the intake divides by 4 weeks and under-reads the weekly minutes.
 const short=history.slice(0,5);
 const r4=run(intake({...C,wearableCapabilities:{...C.wearableCapabilities,historyWeeks:undefined},history:short},CS)).program?.canonical.athlete.recentRun;
 const r2=run(intake({...C,wearableCapabilities:{...C.wearableCapabilities,historyWeeks:2},history:short},CS)).program?.canonical.athlete.recentRun;
 check('C2','weeks covered must be sent: 10 days of import read as 4 weeks unless historyWeeks says 2',r4?.runMinutesPerWeek<r2?.runMinutesPerWeek,{assumed4:r4?.runMinutesPerWeek,declared2:r2?.runMinutesPerWeek});
}

// ---------- D. Hybrid athlete: run + strength experience, records, availability ----------
const D={runTrainingMonths:30,strengthTrainingMonths:48,recent:{runDaysPerWeek:4,runMinutesPerWeek:220,longestRunMinutes:95,strengthDaysPerWeek:3},
 goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays(START,77),timeGoalMinutes:100}},strength:'STRENGTH'},
 knownExercises:[{id:'back-squat',sets:3,reps:5,rir:2,load:{value:100,unit:'KG',convention:'TOTAL'},current:true,familiar:true,tolerated:true,observedAt:addDays(AS_OF,-5)},
  {id:'bench-press',sets:3,reps:6,rir:2,load:{value:70,unit:'KG',convention:'TOTAL'},current:true,familiar:true,tolerated:true,observedAt:addDays(AS_OF,-4)}],
 performanceAnchors:[{id:'d-half',sport:'RUN',kind:'RACE_RESULT',distance:'HALF_MARATHON',time:'1:44:00',date:addDays(AS_OF,-45),measurement:'OFFICIAL',rpe:8,completed:true,tolerated:true},
  {id:'d-5k-pb',sport:'RUN',kind:'PERSONAL_BEST',distance:'5K',time:'21:30',measurement:'OFFICIAL',tolerated:true}],
 sex:'MALE',heightCm:180,weightKg:78};
const DS={runDays:[1,3,5,6],strengthDays:[1,3,4],runTurn:'AM',strengthTurn:'PM',runMinutes:55,strengthMinutes:50,longRunMinutes:110,longRunDay:6};
{
 const r=run(intake(D,DS)),p=r.program,c=r.runCalibration;
 check('D','plan generated',!!p,r.status);
 check('D','run not beginner; strength KNOWN_LOAD from current working sets',p?.capability.run.class==='EASY_CURRENT'&&p?.capability.strength.class==='KNOWN_LOAD',{run:p?.capability.run.class,strength:p?.capability.strength.class});
 check('D','same-day run+strength on different shifts: no shift negotiation',JSON.stringify(p?.canonical.schedule.sharedDays)==='[1,3]'&&!(r.negotiation??[]).some(n=>['SHARED_DAY_TURN_UNKNOWN','BACK_TO_BACK_CONFIRMATION'].includes(n.id)),{shared:p?.canonical.schedule.sharedDays,negotiation:r.negotiation});
 check('D','dated half (45 d) calibrates; undated 5K PB is history',c.capacity.status==='CALIBRATED'&&c.historicalBest.some(h=>h.id==='d-5k-pb'),{capacity:c.capacity.status,confidence:c.capacity.confidence,historical:c.historicalBest.map(h=>h.id)});
 check('D','half estimate available; goal positioned only',c.estimates.HALF_MARATHON.status==='AVAILABLE'&&c.goal?.isPrediction===false,{estimates:est(r),goal:c.goal?.relation});
 check('D','body data kept as context, never a dose input',p?.canonical.athlete.profileContext.doseConsumer===false&&p?.canonical.athlete.profileContext.weightKg===78,p?.canonical.athlete.profileContext);
}
{
 // D2: a stated category plus months: the canonical intake keeps the category and drops the months (V1RC P3 reads experienceBasis.run.months).
 const r=run(intake({...D,runExperience:'EXPERIENCED'},DS));
 check('D2','stated run category drops the run months from the canonical intake',r.program?.canonical.athlete.experienceBasis?.run===undefined&&r.program?.canonical.athlete.runExperience==='EXPERIENCED',r.program?.canonical.athlete.experienceBasis??null);
}

{
 // U: experience not given at all: the canonical intake writes NOVICE; only experienceDeclared/experienceBasis tell that it was unknown (RFC G).
 const {runTrainingMonths:_m,...noExp}=B,a=run(intake({...noExp,performanceAnchors:[]},BS)).program?.canonical.athlete;
 check('U','unknown run experience is stored as NOVICE, distinguishable only by experienceDeclared/experienceBasis',a?.runExperience==='NOVICE'&&a.experienceDeclared.run===false&&a.experienceBasis?.run===undefined,{runExperience:a?.runExperience,declared:a?.experienceDeclared,basis:a?.experienceBasis??null});
}

// ---------- E. In the plan: one run reported by the app and by Apple Health ----------
{
 const g=run(intake({...B,performanceAnchors:[]},BS)),p=g.program,s=p.weeks[0].sessions.find(x=>x.sport==='RUN'&&x.prescription&&x.status!=='SKIPPED');
 const day=s.date,m=s.prescription.durationMinutes;
 const review=(id,observations)=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:addDays(p.startDate,6)+'T20:00:00-03:00',weekIndex:0,event:{id,kind:'WEEKLY_REVIEW'},eligibility:{...ELIG,assessedAt:addDays(p.startDate,6)},observations});
 const app={eventId:'app-1',athleteId:p.athleteId,sessionId:s.id,occurrenceDate:day,actual:{completed:true,minutes:m,distanceKm:9,measurement:'GPS',rpe:3}};
 const hkBound={eventId:'hk-evt-1',athleteId:p.athleteId,sessionId:s.id,occurrenceDate:day,source:{provider:'HEALTHKIT',activityId:'hk-x'},actual:{completed:true,minutes:m+1,distanceKm:9.05,measurement:'GPS'}};
 const r1=X.evaluateProgram(p,review('e1',[app,hkBound])),rows1=(r1.actualLedger??[]).filter(o=>o.context?.sessionId===s.id);
 check('E1','app + Apple Health of one planned run (same session) merge into one row',rows1.length===1&&rows1[0].provenance?.mergedSourceIds?.length===2,{rows:rows1.length,merged:rows1[0]?.provenance?.mergedSourceIds});
 const hkLoose={eventId:'hk-evt-2',athleteId:p.athleteId,occurrenceDate:day,source:{provider:'HEALTHKIT',activityId:'hk-y'},actual:{completed:true,minutes:40,distanceKm:7,measurement:'GPS'}};
 const r2=X.evaluateProgram(p,review('e2',[app,hkLoose])),loose=(r2.actualLedger??[]).find(o=>o.eventId==='hk-evt-2');
 check('E2','an unmatched import is kept as UNPLANNED and is inert (no sport context: no load, credit or pace)',loose?.context?.sessionType==='UNPLANNED'&&loose?.context?.sport===undefined,loose?.context);
 const hkTwice={...hkBound,eventId:'hk-evt-3',sessionId:undefined};
 const r3=X.evaluateProgram(p,review('e3',[hkBound,hkTwice]));
 const conflicted=(r3.actualLedger??[]).some(o=>o.conflicted===true&&o.provenance?.conflict==='ACTIVITY_BOUND_TO_TWO_SESSIONS');
 check('E3','one Apple Health workout sent both bound and unbound is a conflict that quarantines the session',conflicted,{status:r3.status,conflicted});
}

const failed=results.filter(x=>!x.ok);
for(const x of results)console.log(`${x.ok?'PASS':'FAIL'}  ${x.scenario.padEnd(3)} ${x.claim}${x.ok?'':'  observed: '+JSON.stringify(x.observed)}`);
console.log(`\n${results.length-failed.length}/${results.length} checks match the diagnosis; engine ${X.V1_RUN_ENGINE}`);
if(process.argv.includes('--json'))console.log(JSON.stringify(results,null,1));
process.exitCode=failed.length?1:0;
