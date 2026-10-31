import {clone,hash} from './value.mjs';
import {catalogueEntry} from './r6-catalogue.mjs';
import {noExternalLoad,ordinalResistance} from './r7b-repertoire.mjs';

export const RUN_FAMILIES=['WALK','WALK_JOG','EASY','LONG','THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH','SHAKEOUT','RACE','RECOVERY_EASY','FAMILIAR_REPEATED_BOUTS'];
/** Claims no prescription text may make (B0-C02, B0-C03, B0-C05, B0-C11; safety.productMustNot): prevention, rehabilitation, pain relief, physiological thresholds. */
export const FORBIDDEN_CLAIM=/\bprevent\w*\s+(?:an?\s+)?(?:injur|pain)|injury[- ]?prevention|injury[- ]?proof|rehabilitat|pain relief|relieves? pain|VO2\s?max|\bLT2\b|critical speed|\bMLSS\b|lactate threshold/i;
export const STRENGTH_FAMILIES=['PRACTICE','LOWER','UPPER','FULL_BODY','MAINTENANCE'];
const round5=n=>Math.max(5,Math.round(n/5)*5);
export const roundTo5=round5;
/**
 * Taper work: same effort, less work. The total work minutes of the peak session land inside the range; repetition
 * length is kept when fewer repetitions fit, otherwise repetitions shorten. Never below the declared minimums.
 */
export function reducedWork(work,[lo,hi],{repetitions:minimumRepetitions=2,workMinutes:minimumWorkMinutes=3}={}){
 const total=work.repetitions*work.workMinutes,target=total*(lo+hi)/2,fits=(r,m)=>r*m>=lo*total-1e-9&&r*m<=hi*total+1e-9;
 for(let r=work.repetitions-1;r>=minimumRepetitions;r--)if(fits(r,work.workMinutes))return {...work,repetitions:r};
 let best=null;
 for(let r=minimumRepetitions;r<=work.repetitions;r++)for(let m=minimumWorkMinutes;m<=work.workMinutes;m++)if(fits(r,m)){const d=Math.abs(r*m-target);if(!best||d<best.d||d===best.d&&m>best.m)best={r,m,d};}
 if(best)return {...work,repetitions:best.r,workMinutes:best.m};
 return {...work,repetitions:minimumRepetitions,workMinutes:Math.max(minimumWorkMinutes,Math.floor(hi*total/minimumRepetitions))};
}
const minutesOf=s=>Math.round(s/6)/10;
/** Running prescriptions carry effort cues only; no pace is derived from a goal time or from easy running. */
export function walkPrescription(minutes,{reason='Recovery walk: low-demand aerobic movement that keeps the chosen day without adding running load'}={}){
 return {modality:'RUN',family:'WALK',durationMinutes:minutes,warmupMinutes:0,cooldownMinutes:0,effortDomain:'EASY_CONVERSATIONAL',effort:'Brisk comfortable walking; conversation easy',equipment:[],calibration:{basis:'NOT_REQUIRED'},optionalByDesign:true,instructions:[reason,'Skipping it creates no debt','Stop for pain, dizziness or unusual symptoms']};
}
export function walkJogPrescription(step,ladder,{warmup=5,cooldown=3,budget=240}={}){
 let s={...ladder[Math.max(0,Math.min(step,ladder.length-1))]};
 const length=x=>warmup+cooldown+minutesOf(x.repetitions*(x.jogSeconds+x.walkSeconds));
 while(length(s)>budget&&s.repetitions>1)s={...s,repetitions:s.repetitions-1};
 const duration=Math.ceil(Math.max(20,length(s)));
 if(duration>budget)return null;
 const continuous=s.walkSeconds===0;
 return {modality:'RUN',family:'WALK_JOG',durationMinutes:duration,warmupMinutes:warmup,cooldownMinutes:Math.max(cooldown,duration-warmup-minutesOf(s.repetitions*(s.jogSeconds+s.walkSeconds))),effortDomain:'EASY_CONVERSATIONAL',effort:'Conversational jogging; walking is always allowed',equipment:[],work:{repetitions:s.repetitions,workSeconds:s.jogSeconds,recoverySeconds:s.walkSeconds},calibration:{basis:'ESTABLISHMENT_LADDER',step:Math.min(step,ladder.length-1)},establishment:true,instructions:[`Walk ${warmup} minutes to warm up`,continuous?`Jog continuously for ${Math.round(s.jogSeconds/60)} minutes at conversational effort; walk breaks are allowed`:`Then ${s.repetitions} × (${s.jogSeconds>=60?Math.round(s.jogSeconds/6)/10+' min':s.jogSeconds+' s'} easy jog + ${s.walkSeconds>=60?Math.round(s.walkSeconds/6)/10+' min':s.walkSeconds+' s'} walk)`,'Finish with easy walking','Walking the whole session is valid; stop for pain, dizziness or unusual symptoms','Record minutes, effort and how you feel the next day']};
}
export function easyPrescription(minutes,{family='EASY',strides=null,cue,warmup=null}={}){
 const p={modality:'RUN',family,durationMinutes:minutes,warmupMinutes:warmup??Math.min(5,Math.floor(minutes/4)),cooldownMinutes:Math.min(5,Math.floor(minutes/4)),effortDomain:'EASY_CONVERSATIONAL',effort:cue,equipment:[],calibration:{basis:'CURRENT_EASY_EFFORT'},instructions:['Keep a conversational effort; slow down or walk briefly when needed','Shorten the run if easy effort cannot be maintained','Record actual minutes and effort']};
 if(family==='LONG')p.instructions.unshift('Longer easy run: time on feet, not speed');
 if(strides){p.strides=clone(strides);p.instructions.push(`In the last part, ${strides.repetitions} × ${strides.workSeconds} s relaxed fast strides with ${strides.recoverySeconds} s easy walk/jog between; smooth, never a sprint`);if(strides.optional)p.instructions.push('The strides are optional: the easy run without them is an equal choice');}
 return p;
}
const qualityFamily={THRESHOLD:'THRESHOLD',TEN_K:'TEN_K_SPECIFIC',HALF_MARATHON:'HALF_MARATHON_SPECIFIC',TOUCH:'RACE_TOUCH'};
const qualityCue={THRESHOLD:'THRESHOLD_CONTROLLED',TEN_K:'TEN_K_EFFORT',HALF_MARATHON:'HALF_MARATHON_EFFORT'};
export function qualityPrescription(kind,work,{cues,warmup=10,cooldown=5,budget=240,firstExposure=false,touchCue=null}={}){
 let w={...work};const length=x=>warmup+cooldown+x.repetitions*x.workMinutes+Math.max(0,x.repetitions-1)*x.recoveryMinutes;
 while(length(w)>budget&&w.repetitions>2)w={...w,repetitions:w.repetitions-1};
 if(length(w)>budget)return null;
 const cueKey=kind==='TOUCH'?touchCue:qualityCue[kind],cue=cues[cueKey];
 return {modality:'RUN',family:qualityFamily[kind],durationMinutes:Math.ceil(length(w)),warmupMinutes:warmup,cooldownMinutes:cooldown,effortDomain:cueKey,effort:cue,equipment:[],work:{repetitions:w.repetitions,workMinutes:w.workMinutes,recoveryMinutes:w.recoveryMinutes},calibration:{basis:'EFFORT_ANCHORED',firstExposure,paceFromGoalTime:false,paceFromEasyRuns:false},instructions:[`Warm up ${warmup} minutes easy`,`${w.repetitions} × ${w.workMinutes} min — ${cue}; ${w.recoveryMinutes} min easy jog or walk between`,`Cool down ${cooldown} minutes easy`,...(firstExposure?['First exposure: let effort set the pace and note the pace you observe; there is no pace target']:[]),'Hold form and effort; if effort climbs above the cue, end the hard part early — an easy finish is fine','Record repetitions completed, effort and next-day function']};
}
/**
 * Race day. A completion race (walk/jog, restart or return in race week, or an under-built half marathon) is run at a
 * conversational effort with walk breaks, no strides and nothing to press (SSCTR D43, R9). Warm-up strides appear only
 * after strides were executed in training.
 */
export function racePrescription(event,{cues,raceDay,completion=false,stridesWarmup=false,stridesOptional=false,walkBreaks=null}){
 const tenK=event.kind==='10K',D=raceDay??{windowMinutes:{'10K':75,HALF_MARATHON:150},warmupMinutes:{'10K':12,HALF_MARATHON:8},cooldownMinutes:5};
 const base={modality:'RUN',family:'RACE',durationMinutes:D.windowMinutes[event.kind],warmupMinutes:D.warmupMinutes[event.kind],cooldownMinutes:D.cooldownMinutes,equipment:[],event:{kind:event.kind,date:event.date},windowMinutesIsUpperBound:true};
 if(completion)return {...base,effortDomain:'EASY_CONVERSATIONAL',effort:cues.EASY_CONVERSATIONAL,calibration:{basis:'COMPLETION',timeGoalUsedForPace:false},completion:true,instructions:['Race day: the goal is to complete the distance at a conversational effort',walkBreaks?'Use walk breaks from the start, as in training: '+walkBreaks:'Walk breaks are part of the plan: walk whenever conversation gets hard','Warm up by walking; no strides and no surges, there is nothing to press','No finish time is promised; effort and how you feel govern the pace','Stop for pain, dizziness or unusual symptoms','Afterwards: easy walking; note how you feel today and tomorrow']};
 return {...base,effortDomain:tenK?'TEN_K_EFFORT':'HALF_MARATHON_EFFORT',effort:tenK?cues.TEN_K_EFFORT:cues.HALF_MARATHON_EFFORT,calibration:{basis:'EFFORT_ANCHORED',timeGoalUsedForPace:false},instructions:[stridesWarmup?(stridesOptional?'Race day: easy warm-up; a few relaxed strides are optional, and an easy warm-up alone is just as good':'Race day: easy warm-up with a few relaxed strides'):'Race day: easy warm-up; no strides, as none were done in training','Start controlled; hold '+(tenK?'hard but controlled':'steady-hard')+' effort and decide in the final part whether to press','No finish time is promised; effort and how you feel govern the pace','Stop for pain, dizziness or unusual symptoms','Afterwards: easy walking; note how you feel today and tomorrow']};
}
const INCREMENT_UNITS={TOTAL:'KG',PER_HAND:'KG',SINGLE_IMPLEMENT:'KG',MACHINE_STACK:'STACK_STEP',BODYWEIGHT:'BODYWEIGHT',BAND_TENSION:'LEVEL',ASSISTED_BODYWEIGHT:'LEVEL'};
const CONVENTION_TEXT={SINGLE_IMPLEMENT:'One dumbbell or kettlebell: the load is the mass of that one implement'};
/**
 * One strength exercise row. Load modes: KNOWN (supplied current dose or its planned conditional step),
 * ESTABLISH (effort-guided selection inside the session), FROM_LOG (use the last logged load under the stated rule),
 * BODYWEIGHT (no kilogram value: reps and reserve only, against bodyweight, a band level or an assistance level; B0-C04). A fabricated
 * kilogram never appears outside KNOWN, and never for a band or assistance (their level is ordinal and athlete-reported).
 * The row's role is the role of the slot it fills in this program (DR-134; B0-F03), never a property of the exercise.
 */
export function exerciseRow(entry,{role,sets,reps,rir,mode,value=null,restSeconds,preparationMinutes,convention=null,establishment=false,rule=null,note=null,pending=false,exposure=null}){
 const c=convention??entry.convention??'BODYWEIGHT',ordinal=ordinalResistance(entry);
 const load=noExternalLoad(entry)?{mode:'BODYWEIGHT',unit:ordinal?'LEVEL':'BODYWEIGHT',convention:entry.convention??'BODYWEIGHT'}:mode==='KNOWN'?{mode:'KNOWN',value,unit:INCREMENT_UNITS[c]??'KG',convention:c}:{mode,unit:INCREMENT_UNITS[c]??'KG',convention:c,...(rule?{rule}:{})};
 const rampUp='Ramp up: start with the lightest available load and add the smallest increment between preparatory sets while at least '+rir+' repetitions stay in reserve at '+reps+' repetitions with steady technique; the working load is the heaviest such load';
 // A load waiting for confirmation is chosen by effort, as at establishment; the row never points at the logged value (SSCTR D48).
 const instructions=load.mode==='ESTABLISH'?['Practise the movement with no or minimal load first',rampUp,'Do not reuse a load from another exercise or implement; record the load and its convention']:load.mode==='FROM_LOG'&&pending?[rampUp,rule??'Choose the load by effort','Record the load and its convention']:load.mode==='FROM_LOG'?['Use the load you logged last time for this exercise',rule??'If every set reached the target with the reps in reserve shown, add the smallest available increment; otherwise repeat']:load.mode==='KNOWN'?['Use the stated load only while technique and reps in reserve hold; otherwise reduce it']:ordinal?[`Choose the ${entry.loading==='BAND'?'band':'assistance'} level that leaves at least ${rir} repetitions in reserve at ${reps} repetitions; the level is yours to report and is never turned into kilograms`,'Repetitions progress inside the goal range; changing the level is your choice, confirmed when you report it']:['Bodyweight: keep the reps in reserve shown'];
 if(CONVENTION_TEXT[load.convention]&&load.mode!=='BODYWEIGHT')instructions.push(CONVENTION_TEXT[load.convention]);
 if(entry.unilateral)instructions.push('Repetitions are per side: do each set on both sides; sides are never added together');
 if(entry.subpattern==='BENT_KNEE'&&entry.pattern==='CALF')instructions.push('Bent-knee calf raise: soleus emphasis; a variation, not a better exercise');
 if(entry.id==='scapular-pull-up')instructions.push('Hang from the bar first; if you cannot hang from it, report it and the plan uses a floor pull exercise instead');
 if(note)instructions.push(note);
 // The row states what it prescribes (kind, day phase, the count the phase reduced and the counts before it), so a review reads the
 // prescription itself rather than reconstructing it (R7-A).
 return {id:entry.id,pattern:entry.pattern,subpattern:entry.subpattern??null,region:entry.region,role:role??'ACCESSORY',laterality:entry.laterality??'BILATERAL',sets,reps,rir,restSeconds,preparationMinutes,load,equipment:clone(entry.equipment.filter(e=>e!=='BODYWEIGHT')),lowerDemand:entry.lowerDemand,establishment:establishment||load.mode==='ESTABLISH',instructions,...(exposure?{exposure:clone(exposure)}:{})};
}
export function strengthDuration(exercises,{warmup=5,cooldown=3,secondsPerRep=4}={}){
 return Math.ceil(warmup+cooldown+exercises.reduce((n,e)=>n+e.preparationMinutes+e.sets*e.reps*secondsPerRep/60+Math.max(0,e.sets-1)*e.restSeconds/60,0));
}
/** Fits main work first; accessories are dropped before main lifts lose sets. */
export function fitStrengthSession(rows,{budget,warmup=5,cooldown=3,secondsPerRep=4,maxExercises=5,minimumExercises=2}){
 let chosen=[...rows].slice(0,maxExercises);
 const fits=x=>strengthDuration(x,{warmup,cooldown,secondsPerRep})<=budget;
 while(!fits(chosen)&&chosen.length>minimumExercises&&chosen.some(e=>e.role!=='MAIN'))chosen.splice(chosen.findLastIndex(e=>e.role!=='MAIN'),1);
 while(!fits(chosen)&&chosen.some(e=>e.sets>1))chosen=chosen.map((e,i,a)=>i===a.findLastIndex(x=>x.sets===Math.max(...a.map(y=>y.sets)))?{...e,sets:e.sets-1}:e);
 while(!fits(chosen)&&chosen.length>minimumExercises)chosen.pop();
 return fits(chosen)?chosen:null;
}
export function strengthPrescription(family,exercises,{budget,warmup=5,cooldown=3,secondsPerRep=4,goalMode,instructions=[]}){
 const duration=strengthDuration(exercises,{warmup,cooldown,secondsPerRep});
 return {modality:'STRENGTH',family,durationMinutes:Math.min(budget,duration),warmupMinutes:warmup,cooldownMinutes:cooldown,secondsPerRep,equipment:[...new Set(exercises.flatMap(e=>e.equipment))].sort(),exercises:clone(exercises),goalMode,establishment:exercises.some(e=>e.establishment),instructions:['Warm up with easy movement and lighter ramp-up sets',...instructions,'Stop a set when technique slips; reps in reserve are approximate and technique governs','Log actual sets, reps, load and convention; missing effort does not mean a poor response']};
}
const bad=(errors,key)=>errors.push(key);
export function validateR6Prescription(p){
 const errors=[];if(!p||!['RUN','STRENGTH'].includes(p.modality))return ['modality'];
 if([...(p.instructions??[]),...(p.exercises??[]).flatMap(e=>e.instructions??[]),p.effort??''].some(t=>typeof t==='string'&&FORBIDDEN_CLAIM.test(t)))bad(errors,'claim');
 if(!Number.isFinite(p.durationMinutes)||p.durationMinutes<=0||p.durationMinutes>240)bad(errors,'durationMinutes');
 if(!Array.isArray(p.equipment))bad(errors,'equipment');
 if(p.modality==='RUN'){
  if(!RUN_FAMILIES.includes(p.family))bad(errors,'run.family');
  if(typeof p.effort!=='string'||!p.effort||!p.effortDomain)bad(errors,'run.effort');
  if(/maximal|all.?out|sprint as hard|through.{0,12}pain|ignore.{0,20}symptom/i.test(p.effort??'')&&!/never a sprint/i.test(p.effort))bad(errors,'run.effortBoundary');
  if((p.warmupMinutes??0)+(p.cooldownMinutes??0)>p.durationMinutes)bad(errors,'run.preparation');
  if(p.calibration?.basis==='ASPIRATIONAL_GOAL'||p.calibration?.paceFromGoalTime===true||p.calibration?.paceFromEasyRuns===true)bad(errors,'run.goalOrEasyDerivedPace');
  if(['EASY','LONG','WALK','WALK_JOG','SHAKEOUT','RECOVERY_EASY'].includes(p.family)&&p.effortDomain!=='EASY_CONVERSATIONAL')bad(errors,'run.easyDomain');
  if(['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH','FAMILIAR_REPEATED_BOUTS'].includes(p.family)){
   const w=p.work;if(!w||!Number.isInteger(w.repetitions)||w.repetitions<1||!(w.workMinutes>0)||!(w.recoveryMinutes>=0))bad(errors,'run.work');
   else if(p.warmupMinutes+p.cooldownMinutes+w.repetitions*w.workMinutes+Math.max(0,w.repetitions-1)*w.recoveryMinutes>p.durationMinutes+0.01)bad(errors,'run.workBudget');
   if(p.calibration?.basis!=='EFFORT_ANCHORED'&&p.calibration?.basis!=='CURRENT_FAMILIAR_TASK')bad(errors,'run.calibration');
  }
  // B0-C02: the familiar repeated bouts are the athlete's exact current task, never a de novo or progressed dose.
  if(p.family==='FAMILIAR_REPEATED_BOUTS'&&(p.calibration?.basis!=='CURRENT_FAMILIAR_TASK'||p.progressionAllowed!==false))bad(errors,'run.familiarBouts');
 }else{
  if(!STRENGTH_FAMILIES.includes(p.family))bad(errors,'strength.family');
  if(!Array.isArray(p.exercises)||!p.exercises.length)bad(errors,'strength.exercises');
  for(const e of p.exercises??[]){
   if(!e.id||!e.pattern||!Number.isInteger(e.sets)||e.sets<1||e.sets>6||!Number.isInteger(e.reps)||e.reps<1||e.reps>30||!Number.isFinite(e.rir)||e.rir<2)bad(errors,'strength.exercise');
   if(!['KNOWN','ESTABLISH','FROM_LOG','BODYWEIGHT'].includes(e.load?.mode))bad(errors,'strength.loadMode');
   if(e.load?.mode==='KNOWN'&&(!Number.isFinite(e.load.value)||e.load.value<0||e.load.value>500||e.load.unit==='LB'))bad(errors,'strength.knownLoad');
   if(['ESTABLISH','FROM_LOG','BODYWEIGHT'].includes(e.load?.mode)&&e.load.value!==undefined)bad(errors,'strength.fabricatedLoad');
   const entry=catalogueEntry(e.id);if(entry&&e.load?.mode!=='BODYWEIGHT'&&e.load?.convention!==entry.convention&&e.load?.mode!=='KNOWN')bad(errors,'strength.convention');
   // B0-C04: a band or assistance level is ordinal; it never carries kilograms or a load mode that implies them.
   if(entry&&noExternalLoad(entry)&&(e.load?.mode!=='BODYWEIGHT'||e.load.value!==undefined||e.load.unit==='KG'))bad(errors,'strength.noKilograms');
   // DR-134 / B0-C05: the row's contextual role must be one the configuration admits; an unknown configuration is not in the repertoire.
   if(!entry)bad(errors,'strength.unknownConfiguration');
   else if(!entry.roles.includes(e.role))bad(errors,'strength.roleNotAdmissible');
  }
  if(strengthDuration(p.exercises??[],{warmup:p.warmupMinutes??5,cooldown:p.cooldownMinutes??3,secondsPerRep:p.secondsPerRep??4})>p.durationMinutes+0.01)bad(errors,'strength.timeBudget');
 }
 return [...new Set(errors)];
}
export const prescriptionHash=p=>hash(p);
