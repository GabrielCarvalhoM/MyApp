// Extracted generator from q6-envelope.mjs for debugging (same seed semantics).
import {prng,pick,subset,elig,addDays,loadR6Policy} from './qlib.mjs';
export const CAT=['back-squat','goblet-squat','kb-goblet-squat','leg-press','barbell-rdl','db-rdl','kb-deadlift','hip-thrust-db','db-split-squat','db-step-up','db-calf-raise','bench-press','db-bench-press','db-floor-press','machine-chest-press','db-overhead-press','one-arm-db-row','db-row','barbell-row','lat-pulldown','seated-cable-row','pull-up','push-up'];
const PER_HAND=new Set(['goblet-squat','kb-goblet-squat','db-rdl','kb-deadlift','hip-thrust-db','db-split-squat','db-step-up','db-calf-raise','db-bench-press','db-floor-press','db-overhead-press','one-arm-db-row','db-row']);
const EQUIP=['BODYWEIGHT','DUMBBELLS','BARBELL','RACK','BENCH','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const NONCLIN=['TRAVEL','WORK','FAMILY','SCHEDULE','VACATION','WEATHER','EQUIPMENT','MOTIVATION','STUDY','MOVING','OTHER_NONCLINICAL'];
export function athlete(r,i){
 const asOf=addDays('2026-11-01',Math.floor(r()*60)),startDate=addDays(asOf,1+Math.floor(r()*6)),weeks=pick(r,[4,8,12,16]);
 let runGoal=pick(r,['RACE','PERFORMANCE','REGULAR','GENERAL','NONE','PERFORMANCE','REGULAR']),strengthGoal=pick(r,['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','MAINTAIN','GENERAL','NONE']);
 if(runGoal==='NONE'&&strengthGoal==='NONE')strengthGoal='GENERAL';
 if(runGoal==='RACE'&&weeks<8)runGoal='PERFORMANCE';
 const goals={run:runGoal,strength:strengthGoal};
 if(runGoal==='RACE'){const kind=pick(r,['10K','HALF_MARATHON']),wk=2+Math.floor(r()*(weeks-3));goals.run={kind:'RACE',event:{kind,date:addDays(startDate,wk*7+Math.floor(r()*7)),...(r()<0.5?{timeGoalMinutes:kind==='10K'?50+Math.floor(r()*20):110+Math.floor(r()*30)}:{})}};}
 const runDays=runGoal==='NONE'?undefined:subset(r,[0,1,2,3,4,5,6],1,6),strengthDays=strengthGoal==='NONE'?undefined:subset(r,[0,1,2,3,4,5,6],1,4);
 const runMinutesPerWeek=pick(r,[undefined,0,10,20,30,45,60,90,120,150,180,240,300]);
 const recent={...(r()<0.85?{runDaysPerWeek:runMinutesPerWeek===0?0:pick(r,[1,2,3,4,5,6])}:{}),...(runMinutesPerWeek!==undefined?{runMinutesPerWeek}:{}),...(r()<0.75&&runMinutesPerWeek?{longestRunMinutes:Math.max(5,Math.min(150,Math.round(runMinutesPerWeek*(0.2+r()*0.6)/5)*5))}:{}),...(r()<0.6?{strengthDaysPerWeek:pick(r,[0,1,2,3])}:{})};
 const equipment=['BODYWEIGHT',...subset(r,EQUIP.slice(1),0,6).map(i=>i)];
 const known=r()<0.55?subset(r,CAT.map((_,k)=>k),0,4).map(k=>CAT[k]).map(id=>({id,sets:2+Math.floor(r()*4),reps:3+Math.floor(r()*10),load:{value:PER_HAND.has(id)?6+2*Math.floor(r()*12):20+2.5*Math.floor(r()*40),unit:'KG',convention:PER_HAND.has(id)?'PER_HAND':id.includes('machine')||['leg-press','lat-pulldown','seated-cable-row'].includes(id)?'MACHINE_STACK':'TOTAL'},rir:1+Math.floor(r()*4),current:true,familiar:true,tolerated:true,observedAt:addDays(asOf,-Math.floor(r()*20))})):[];
 const knownRuns=r()<0.25?[(()=>{const reps=3+Math.floor(r()*3),wm=4+Math.floor(r()*5);return {prescription:{modality:'RUN',family:pick(r,['THRESHOLD','THRESHOLD','TEN_K_SPECIFIC']),durationMinutes:10+5+reps*wm+(reps-1)*2,warmupMinutes:10,cooldownMinutes:5,work:{repetitions:reps,workMinutes:wm,recoveryMinutes:2}},current:true,familiar:true,tolerated:true,observedAt:addDays(asOf,-Math.floor(r()*14))};})()]:[];
 const runMinutes=pick(r,[20,30,40,45,50,60,75,90,120]),longRunDay=runDays&&runDays.length>=2&&r()<0.7?pick(r,runDays):undefined;
 const a={id:'g'+i,ageEligible:true,eligibility:elig(asOf),goals,runExperience:pick(r,[undefined,'NONE','NOVICE','INTERMEDIATE','EXPERIENCED','INTERMEDIATE']),strengthExperience:pick(r,[undefined,'NONE','NOVICE','INTERMEDIATE','EXPERIENCED']),recent,equipment,knownExercises:known,knownRuns,strengthPreferences:{rotation:pick(r,['COACH_DECIDES','EVERY_6_WEEKS','EVERY_2_WEEKS','FIXED']),emphasis:subset(r,[0,1,2,3,4,5,6],0,2).map(k=>['SQUAT','HINGE','LUNGE','CALF','PUSH','PULL','TRUNK'][k])},sex:pick(r,['F','M',undefined]),heightCm:150+Math.floor(r()*40),weightKg:50+Math.floor(r()*50)};
 if(r()<0.12)a.pause={nonclinical:true,weeks:1+Math.floor(r()*10),reasonCategory:pick(r,NONCLIN)};
 const schedule={...(runDays?{runDays}:{}),...(strengthDays?{strengthDays}:{}),runTurn:pick(r,['AM','PM',undefined]),strengthTurn:pick(r,['AM','PM',undefined]),runMinutes,strengthMinutes:pick(r,[20,30,40,45,60,75,90]),...(longRunDay!==undefined?{longRunDay}:{}),...(r()<0.6?{longRunMinutes:runMinutes+pick(r,[0,15,30,60])}:{}),...(r()<0.3?{sameTurnConfirmed:true}:{}),...(r()<0.2?{temporaryPreference:pick(r,['RUN','STRENGTH'])}:{})};
 const input={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:r()<0.8,timezoneOffsetMinutes:pick(r,[0,-180,60,330,-300]),athlete:a,schedule};
 if(r()<0.2){input.athlete.wearableCapabilities={provider:'W',activityAvailable:true,heartRateAvailable:true,exerciseIdentityAvailable:false,setsRepsLoadAvailable:false,subjectiveEffortAvailable:false,completeness:pick(r,['FULL','PARTIAL']),historyWeeks:4};input.history=Array.from({length:2+Math.floor(r()*8)},(_,k)=>({activityId:'h'+k,provider:'W',sport:'RUN',startedAt:addDays(asOf,-1-Math.floor(r()*27))+'T07:00:00-03:00',durationMinutes:15+Math.floor(r()*60)}));}
 return input;
}
