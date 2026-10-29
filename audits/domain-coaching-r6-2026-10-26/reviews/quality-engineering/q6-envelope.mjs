// QRE probe Q6: envelope adherence on generated and adapted programs over a seeded generator of athletes drawn from the
// R6-INTAKE-1 interface vocabulary. Checks are written from the SSCTR conditions and the policy text, independently of the
// runtime's own validators. Real authority (r6Authority() with no override).
// Usage: node q6-envelope.mjs [athletes=400] [simulated=48] [seed=20261026]
import {R6,hash,write,prng,pick,subset,elig,addDays,simulateProgram,loadR6Policy,sessionsOf} from './qlib.mjs';
const N=+(process.argv[2]??400),NS=+(process.argv[3]??48),SEED=+(process.argv[4]??20261026);
const op=loadR6Policy().operational,R=op.run,E=op.event,S=op.strength;
const CAT=['back-squat','goblet-squat','kb-goblet-squat','leg-press','barbell-rdl','db-rdl','kb-deadlift','hip-thrust-db','db-split-squat','db-step-up','db-calf-raise','bench-press','db-bench-press','db-floor-press','machine-chest-press','db-overhead-press','one-arm-db-row','db-row','barbell-row','lat-pulldown','seated-cable-row','pull-up','push-up'];
const PER_HAND=new Set(['goblet-squat','kb-goblet-squat','db-rdl','kb-deadlift','hip-thrust-db','db-split-squat','db-step-up','db-calf-raise','db-bench-press','db-floor-press','db-overhead-press','one-arm-db-row','db-row']);
const EQUIP=['BODYWEIGHT','DUMBBELLS','BARBELL','RACK','BENCH','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const NONCLIN=['TRAVEL','WORK','FAMILY','SCHEDULE','VACATION','WEATHER','EQUIPMENT','MOTIVATION','STUDY','MOVING','OTHER_NONCLINICAL'];
function athlete(r,i){
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
// ---------- independent checks ----------
const runMin=s=>{const p=s.prescription;if(s.sport!=='RUN'||!p||s.role==='RACE'||p.family==='WALK')return 0;return p.family==='WALK_JOG'?Math.round((p.work?.repetitions??0)*(p.work?.workSeconds??0)/60):p.durationMinutes;};
const isRun=s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.prescription.family!=='WALK';
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const EVENTP=['TAPER','RACE_WEEK','POST_EVENT'];
function checkProgram(P,{completed=[],fromWeek=0,cold=true}={}){
 const v=[],cap=P.capability,cls=cap.run.class,W0=cap.run.weeklyMinutes,longest=cap.run.longestMinutes,s=P.schedule;
 const add=(id,detail)=>v.push({id,detail});
 const hist=[...completed];
 if(cold&&['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cls)&&Number.isFinite(longest))hist.push({date:P.canonical.asOf,minutes:longest});
 for(const wk of P.weeks){
  if(wk.index<fromWeek)continue; // weeks before the decision are covered by the completed-work ledger
  const runs=wk.sessions.filter(isRun);
  // Single-run ceiling against completed (and earlier projected) runs of the preceding 30 days.
  const ref=hist.filter(h=>gap(h.date,wk.startDate)>0&&gap(h.date,wk.startDate)<=R.singleRunCeiling.windowDays).map(h=>h.minutes);
  for(const x of runs){if(x.prescription.family==='WALK_JOG')continue;const m=x.prescription.durationMinutes;
   if(ref.length&&m>Math.max(...ref)+R.singleRunCeiling.stepMinutes)add('singleRunCeiling',{week:wk.index,id:x.id,role:x.role,minutes:m,reference:Math.max(...ref)});
   if(!ref.length&&wk.index>fromWeek)add('singleRunCeilingNoReference',{week:wk.index,id:x.id,minutes:m});
   if(!ref.length&&wk.index===fromWeek&&!cold&&m>op.return.entryRunMinutes)add('singleRunCeilingEntry',{week:wk.index,id:x.id,minutes:m});}
  for(const x of wk.sessions){const m=runMin(x);if(m)hist.push({date:x.date,minutes:m});}
  // Structure: at most one quality per week; chosen days and time; RIR >= 2; sets <= 6.
  if(wk.sessions.filter(x=>x.role==='QUALITY'&&x.prescription).length>1)add('moreThanOneQuality',{week:wk.index});
  for(const x of wk.sessions.filter(x=>x.prescription)){
   if(x.role!=='RACE'&&!(x.sport==='RUN'?s.runDays:s.strengthDays).includes(x.day))add('offChosenDay',{id:x.id});
   const lim=x.sport==='RUN'?(x.role==='LONG'?s.longRunMinutes??s.runMinutes:s.runMinutes):s.strengthMinutes;if(x.role!=='RACE'&&x.prescription.durationMinutes>lim)add('exceedsChosenTime',{id:x.id,minutes:x.prescription.durationMinutes,limit:lim});
   if(x.date<wk.startDate||x.date>addDays(wk.startDate,6))add('sessionOutsideWeek',{id:x.id,date:x.date});
   for(const e of x.prescription.exercises??[]){if(e.rir<2||e.sets>6||e.sets<1)add('strengthBounds',{id:x.id,e:e.id,sets:e.sets,rir:e.rir});if(e.load.mode==='ESTABLISH'&&(e.sets>2||e.rir<3))add('establishmentDose',{id:x.id,e:e.id,sets:e.sets,rir:e.rir});}
  }
  // Quality adjacency to the long run when another chosen day could hold it.
  const q=wk.sessions.find(x=>x.role==='QUALITY'),L=wk.sessions.find(x=>x.role==='LONG');
  if(q&&L&&[1,6].includes(Math.abs(q.day-L.day))){const alt=s.runDays.filter(d=>d!==L.day&&![1,6].includes(Math.abs(d-L.day)));if(alt.length)add('qualityAdjacentToLong',{week:wk.index,q:q.day,long:L.day,alternatives:alt});}
  // Long-run share: in weeks with >= 3 running sessions the long run is held, never grown, when above its share.
  if(L&&!EVENTP.includes(wk.phase)&&runs.length>=3){const others=runs.filter(x=>x!==L).reduce((n,x)=>n+x.prescription.durationMinutes,0),share=R.longRunShareOfWeeklyMinutesMax,bound=Math.max(5,Math.floor(others*share/(1-share)/5)*5);
   if(L.prescription.durationMinutes>bound){const prevBuild=[...P.weeks.slice(0,wk.index)].reverse().find(x=>x.phase!=='CONSOLIDATION');const prevLong=prevBuild&&!EVENTP.includes(prevBuild.phase)?prevBuild.sessions.find(x=>x.role==='LONG')?.prescription?.durationMinutes??0:0;const easyMax=Math.max(0,...runs.filter(x=>x.role==='EASY').map(x=>x.prescription.durationMinutes));
    if(L.prescription.durationMinutes>Math.max(prevLong,easyMax))add('longRunShareExceededAndGrown',{week:wk.index,long:L.prescription.durationMinutes,bound,prevLong,easyMax});}}
 }
 // Week 1 (cold start).
 if(cold){const w0=P.weeks[0],runs0=w0.sessions.filter(isRun),tot=runs0.reduce((n,x)=>n+x.prescription.durationMinutes,0);
  if(['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cls)&&Number.isFinite(W0)&&tot>W0)add('week1AboveReportedWeekly',{class:cls,planned:tot,reported:W0,runs:runs0.map(x=>[x.role,x.prescription.durationMinutes])});
  const L0=runs0.find(x=>x.role==='LONG');if(L0&&['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cls)&&Number.isFinite(longest)&&L0.prescription.durationMinutes>longest)add('week1LongAboveLongest',{long:L0.prescription.durationMinutes,longest});
  for(const x of runs0){if(x.role==='QUALITY'&&!(x.prescription.calibration?.basis==='CURRENT_FAMILIAR_TASK'&&x.prescription.durationMinutes<=Math.min(s.runMinutes,longest??Infinity)))add('week1Intensity',{id:x.id,role:x.role});if(x.prescription.strides||x.role==='RACE_TOUCH')add('week1Intensity',{id:x.id,strides:true});}
  if(['EASY_UNKNOWN'].includes(cls))for(const x of runs0)if(x.prescription.family!=='WALK_JOG'&&x.prescription.durationMinutes>op.establishment.unknownExposureEasyMinutes)add('week1UnknownExposureEntry',{id:x.id,minutes:x.prescription.durationMinutes});
  if(cls==='WALK_JOG')for(const x of runs0)if(x.prescription.family==='WALK_JOG'&&x.prescription.calibration?.step!==0)add('week1WalkJogStep',{id:x.id,step:x.prescription.calibration?.step});
  if(cls==='RESTART')for(const x of runs0)if(x.prescription.family!=='WALK_JOG'&&x.prescription.durationMinutes>op.return.entryRunMinutes)add('week1RestartEntry',{id:x.id,minutes:x.prescription.durationMinutes});
  // Known loads only from known doses; first exposure equals the known load.
  const knownIds=new Map(P.canonical.athlete.knownExercises.filter(e=>e.dose).map(e=>[e.id,e.dose.load.value]));
  for(const x of sessionsOf(P).filter(x=>x.sport==='STRENGTH'&&x.prescription&&x.weekIndex===0))for(const e of x.prescription.exercises)if(e.load.mode==='KNOWN'&&knownIds.get(e.id)!==e.load.value)add('fabricatedOrChangedKnownLoad',{id:x.id,e:e.id,value:e.load.value,known:knownIds.get(e.id)});
  if(cap.strength.class==='NONE'){const first=sessionsOf(P).find(x=>x.sport==='STRENGTH'&&x.prescription);if(first&&first.prescription.exercises.some(e=>e.load.mode!=='BODYWEIGHT'))add('noviceFirstStrengthNotPractice',{id:first.id,modes:first.prescription.exercises.map(e=>e.load.mode)});}
 }
 // One step per dimension per week (planned trajectory) from fromWeek on; consolidation/event weeks compare to last build week.
 const BUILD=['ESTABLISHMENT','BUILD','DEVELOPMENT','SPECIFIC','NEXT_BLOCK'];let prev=null;
 for(const wk of P.weeks){if(!BUILD.includes(wk.phase)){if(EVENTP.includes(wk.phase))prev=null;continue;}
  const L=wk.sessions.find(x=>x.role==='LONG')?.prescription?.durationMinutes??null,easy=Math.max(0,...wk.sessions.filter(x=>x.role==='EASY'&&x.prescription).map(x=>x.prescription.durationMinutes)),qs=wk.sessions.find(x=>x.role==='QUALITY');
  if(prev&&wk.index>fromWeek&&!(prev.phase==='NEXT_BLOCK'||wk.phase==='NEXT_BLOCK'&&prev.phase!=='NEXT_BLOCK')){
   if(L!==null&&prev.L!==null&&L>prev.L+R.longRunStepMinutes)add('longStepTooLarge',{week:wk.index,from:prev.L,to:L});
   if(easy&&prev.easy&&easy>prev.easy+R.easyStepMinutes)add('easyStepTooLarge',{week:wk.index,from:prev.easy,to:easy});
   if(L!==null&&prev.L!==null&&L>prev.L&&prev.L<50&&easy>prev.easy&&prev.easy>0)add('smallReferenceStepCombined',{week:wk.index,long:[prev.L,L],easy:[prev.easy,easy]});
   if(qs&&prev.q&&qs.progression?.ladder===prev.q.progression?.ladder&&qs.progression?.value>prev.q.progression?.value+1)add('qualityStepTooLarge',{week:wk.index,from:prev.q.progression.value,to:qs.progression.value});
  }
  prev={phase:wk.phase,L,easy,q:qs};}
 // Strength per exercise: load <= one increment, reps <= one rep step, sets <= +1 between consecutive build-week appearances.
 const last={}; // keyed by template + exercise: the same exercise in two templates is not a progression
 for(const wk of P.weeks){for(const x of wk.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))for(const e of x.prescription.exercises){const key=(x.templateType??x.role)+':'+e.id,p=last[key];
   if(p&&BUILD.includes(wk.phase)&&BUILD.includes(p.phase)&&wk.index>fromWeek&&wk.index-p.week<=1){
    if(e.load.mode==='KNOWN'&&p.mode==='KNOWN'&&e.load.value>p.value+(S.smallestIncrement[e.load.convention]??0)+1e-9)add('loadStepTooLarge',{week:wk.index,e:e.id,from:p.value,to:e.load.value});
    if(e.reps>p.reps+S.repStep&&e.load.mode===p.mode)add('repStepTooLarge',{week:wk.index,e:e.id,from:p.reps,to:e.reps});
    if(e.sets>p.sets+1)add('setStepTooLarge',{week:wk.index,e:e.id,from:p.sets,to:e.sets});}
   last[key]={week:wk.index,phase:wk.phase,mode:e.load.mode,value:e.load.value,reps:e.reps,sets:e.sets};}}
 // Event structure.
 if(P.goal.run.event&&P.phases.raceWeek!==null&&P.phases.raceWeek<P.weeks.length){const rw=P.weeks[P.phases.raceWeek],race=rw.sessions.find(x=>x.role==='RACE');
  if(!race)add('raceMissing',{});else{if(race.date!==P.goal.run.event.date)add('raceDateMismatch',{race:race.date,event:P.goal.run.event.date});
   const all=sessionsOf(P),priorQ=all.some(x=>x.role==='QUALITY'&&x.date<race.date),priorStrides=all.some(x=>x.prescription?.strides&&x.role!=='SHAKEOUT'&&x.date<race.date);
   for(const x of all.filter(x=>x.prescription&&x.sport==='RUN'&&x.role!=='RACE')){const d=gap(race.date,x.date);
    if(x.role==='RACE_TOUCH'&&(!priorQ||-d<E.raceWeekTouchMinDaysBeforeRace))add('raceTouchWithoutExecutedQuality',{id:x.id,priorQ,daysBefore:-d});
    if(x.role==='SHAKEOUT'&&x.prescription.strides&&!priorStrides)add('shakeoutStridesWithoutStrides',{id:x.id});
    if(d>0&&d<E.postEventFirstRunMinDaysAfterRace)add('runTooSoonAfterRace',{id:x.id,daysAfter:d});
    if(EVENTP.includes(P.weeks[x.weekIndex].phase)&&x.role==='QUALITY'&&!priorQ)add('taperQualityWithoutExecutedQuality',{id:x.id});}
   for(const x of all.filter(x=>x.sport==='STRENGTH'&&x.prescription)){const d=gap(race.date,x.date);if(d<0&&-d<E.raceWeekStrengthMinDaysBeforeRace){const lower=x.prescription.exercises.filter(e=>e.region==='LOWER'&&['MODERATE','HEAVY'].includes(e.lowerDemand)&&e.sets>=2);add(lower.length?'lowerStrengthWithin3DaysOfRace':'lightStrengthWithin3DaysOfRace',{id:x.id,phase:P.weeks[x.weekIndex].phase,daysBefore:-d,lower:lower.map(e=>e.id+'x'+e.sets+'/'+e.load.mode)});}}
   for(const x of all.filter(x=>x.sport==='RUN'&&x.prescription&&['LONG','QUALITY','RACE_TOUCH'].includes(x.role))){const d=gap(race.date,x.date);if(d<0&&-d<2)add('keyRunDayBeforeRace',{id:x.id,role:x.role,minutes:x.prescription.durationMinutes,phase:P.weeks[x.weekIndex].phase});}}}
 return v;
}
// ---------- run ----------
const r=prng(SEED),stats={athletes:N,status:{},violations:{},examples:{}},inputs=[];
const note=(v,ctx)=>{for(const x of v){stats.violations[x.id]=(stats.violations[x.id]??0)+1;(stats.examples[x.id]??=[]).length<4&&stats.examples[x.id].push({...ctx,...x.detail});}};
let proposed=[];
for(let i=0;i<N;i++){const input=athlete(r,i);let res;try{res=R6.generateProgram(input);}catch(e){stats.status.THREW=(stats.status.THREW??0)+1;(stats.examples.THREW??=[]).length<4&&stats.examples.THREW.push({i,error:String(e)});continue;}
 stats.status[res.status]=(stats.status[res.status]??0)+1;
 if(res.status==='PROPOSED'){proposed.push({i,input,program:res.program});note(checkProgram(res.program),{athlete:i,phase:'GENERATED',class:res.program.capability.run.class});
  // Profile context and time goal never change dose.
  const alt=structuredClone(input);alt.athlete.sex=input.athlete.sex==='F'?'M':'F';alt.athlete.heightCm+=25;alt.athlete.weightKg+=30;if(alt.athlete.goals.run?.event)alt.athlete.goals.run.event.timeGoalMinutes=(alt.athlete.goals.run.event.timeGoalMinutes??60)+40;
  const ra=R6.generateProgram(alt);if(ra.status!=='PROPOSED'||hash(ra.program.weeks)!==hash(res.program.weeks))note([{id:'profileOrTimeGoalChangedDose',detail:{status:ra.status}}],{athlete:i});}
}
// Adapted programs: scripted adherence through the runtime simulator (proposals adopted), then the same checks on every
// adopted proposal relative to the completed-work ledger at that decision.
const SCRIPTS={perfect:{default:{}},allRunsMissed:{default:{missed:[{sport:'RUN'}]}},qualityMissed:{default:{missed:[{sport:'RUN',role:'QUALITY'}]}},strengthHarder:{default:{responses:[{sport:'STRENGTH',response:'HARDER'}]}},easier:{default:{responses:[{sport:'RUN',response:'EASIER'},{sport:'STRENGTH',response:'EASIER'}]}},noisy:{default:{missingEffort:true,duplicates:[{sport:'RUN'}],partial:[{sport:'RUN',role:'LONG',fraction:0.5}]}}};
const simStats={runs:0,threw:0,decisions:{},invariantFailures:{}};
// The runtime simulator stamps reviews at 21:00Z; east of UTC+3 that is the next local day (see q8 simulator probe), so the
// adaptation sample uses athletes at offsets <= +180 minutes.
const eligibleSim=proposed.filter(x=>(x.input.timezoneOffsetMinutes??0)<=180);const sample=eligibleSim.filter((x,k)=>k%Math.max(1,Math.floor(eligibleSim.length/NS))===0).slice(0,NS);
for(const {i,input} of sample)for(const [sname,script] of Object.entries(SCRIPTS)){
 let sim;try{sim=simulateProgram(input,script);}catch(e){simStats.threw++;(stats.examples.SIM_THREW??=[]).length<4&&stats.examples.SIM_THREW.push({athlete:i,script:sname,error:String(e)});continue;}
 simStats.runs++;for(const d of sim.decisions)simStats.decisions[d.status]=(simStats.decisions[d.status]??0)+1;
 for(const [k,val] of Object.entries(sim.invariants))if(val===false){simStats.invariantFailures[k]=(simStats.invariantFailures[k]??0)+1;(stats.examples['INV_'+k]??=[]).length<3&&stats.examples['INV_'+k].push({athlete:i,script:sname});}
 for(const row of sim.rows)for(const step of [...row.events,...(row.weekly?[row.weekly]:[])]){const res=step.result;if(!res.proposal||!step.adopted)continue;
  const from=res.proposal.decisions.at(-1)?.fromWeek??row.weekIndex;
  const completed=[];const cap=res.proposal.capability;
  if(['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap.run.class)&&Number.isFinite(cap.run.longestMinutes))completed.push({date:res.proposal.canonical.asOf,minutes:cap.run.longestMinutes});
  for(const o of res.actualLedger??[])if(o.context?.sport==='RUN'&&o.context.runMinutes&&(o.actual?.completed===true||o.actual?.minutes>0))completed.push({date:o.localDate,minutes:o.context.family==='WALK_JOG'?o.context.runMinutes:Number.isFinite(o.actual.minutes)?o.actual.minutes:o.context.runMinutes});
  const demo=step.review.currentDemonstration;if(demo)completed.push({date:String(demo.observedAt).slice(0,10),minutes:demo.minutes});
  note(checkProgram(res.proposal,{completed,fromWeek:from,cold:false}),{athlete:i,phase:'ADAPTED',script:sname,action:res.action,fromWeek:from});
  // Strength steps only on logged sets with the prescribed reserve (gate side).
  if(sname==='strengthHarder')for(const [id,g] of Object.entries(res.gates??{}))if(!['LONG','EASY','QUALITY','WALK_JOG','ALL'].includes(id)&&['ADVANCE','EARNED'].includes(g)){const ev=res.weekEvidence?.rows.flatMap(x=>Object.entries(x.logs??{})).find(([k])=>k===id)?.[1];if(ev&&(!ev.repsMet||ev.minRir<ev.plannedRir-1))note([{id:'strengthStepWithoutLoggedReserve',detail:{exercise:id,gate:g,log:ev}}],{athlete:i,script:sname});}
  // No quality/strides in the next week without executed established easy weeks (all runs missed).
  if(sname==='allRunsMissed'){const nx=res.proposal.weeks[row.weekIndex+1];if(nx&&nx.sessions.some(x=>x.role==='QUALITY'||x.prescription?.strides||x.role==='RACE_TOUCH'))note([{id:'intensityWithoutExecutedRuns',detail:{week:row.weekIndex+1}}],{athlete:i,script:sname});}
 }
 if(sname==='qualityMissed'||sname==='allRunsMissed'){const fp=sim.finalProgram;if(sessionsOf(fp).some(x=>x.role==='RACE_TOUCH'||EVENTP.includes(fp.weeks[x.weekIndex]?.phase)&&x.role==='QUALITY'))note([{id:'eventIntensityWithoutExecutedQuality',detail:{}}],{athlete:i,script:sname});}
}
const out={probe:'Q6-envelope',authorityUsed:'REAL r6Authority()',seed:SEED,generated:stats,simulation:{sampleSize:sample.length,...simStats},pass:Object.keys(stats.violations).length===0&&!stats.status.THREW&&!simStats.threw};
write('q6-envelope.out.json',out);
console.log(JSON.stringify({status:stats.status,violations:stats.violations,sim:simStats},null,0));
for(const [k,v] of Object.entries(stats.examples))console.log(k,JSON.stringify(v).slice(0,700));
