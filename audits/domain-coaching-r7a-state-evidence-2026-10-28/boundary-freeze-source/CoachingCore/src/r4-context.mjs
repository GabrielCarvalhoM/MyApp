/** Controlled narrative interpretation. Adverse/negated cues always precede positive words. */
export function favorable(value){
 const text=String(value??'');
 if(/\b(?:unknown|uncertain|not tested|not established|not supplied|incompatible|abnormal|unusual|worse|deteriorat\w*|limited|under target)\b/i.test(text))return false;
 if(/\b(?:not|no longer|never|isn't|is not)\s+(?:\w+\s+){0,3}(?:compatible|comfortable|usual|normal|stable|good)\b/i.test(text))return false;
 return /\b(?:compatible|comfortable|usual|normal|stable|good|full sentences)\b/i.test(text);
}
export function comparable(value){
 const text=String(value??'');
 return !/unknown|uncertain|different|changed|not comparable|not same|not the same/i.test(text)&&/same|comparable|similar/i.test(text);
}
export function nonmaximal(value){
 const text=String(value??'').replace(/\bnot\s+(?:all[- ]?out|maximal|maximum)\b/gi,'nonmaximal');
 return !/\b(?:all[- ]?out|maximal|maximum|sprint|unsustainable)\b/i.test(text)&&/controlled|relaxed|nonmaximal|conversational|comfortable|easy/i.test(text);
}
const num=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;
const minute=v=>{const m=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(v));return m?Number(m[1])*60+Number(m[2]):null;};
/** Multiple explicitly supplied constraints intersect; an absent window is never fabricated. */
export function availabilityLimit(source){
 const groups=[source.availability,source.onboarding?.availability,source.currentDemand?.availability],caps=[];
 if(num(source.currentDemand?.availabilityMinutes))caps.push(source.currentDemand.availabilityMinutes);
 for(const group of groups){
  if(!group)continue;
  const capacities=[];
  if(Array.isArray(group))for(const item of group){if(source.currentDemand?.day&&item.day!==source.currentDemand.day)continue;if(num(item.minutes))capacities.push(item.minutes);else if(minute(item.start)!==null&&minute(item.end)>minute(item.start))capacities.push(minute(item.end)-minute(item.start));}
  else for(const [day,windows] of Object.entries(group)){if(source.currentDemand?.day&&day!==source.currentDemand.day)continue;for(const w of Array.isArray(windows)?windows:[])if(minute(w[0])!==null&&minute(w[1])>minute(w[0]))capacities.push(minute(w[1])-minute(w[0]));}
  if(capacities.length)caps.push(Math.max(...capacities));else caps.push(0);
 }
 return caps.length?Math.min(...caps):null;
}
/** Scheduling reservations only. No required cadence, physiological threshold or guarantee. */
export function planningMinutes(recipe){
 if(!recipe||typeof recipe!=='object')return null;
 if(num(recipe.totalMinutes))return recipe.totalMinutes;
 if(num(recipe.minutes))return recipe.minutes;
 if(num(recipe.maximumMinutes))return recipe.maximumMinutes;
 if(recipe.work&&recipe.warmup&&recipe.cooldown){
  const w=recipe.work,prep=recipe.warmup.minutes+recipe.cooldown.minutes;
  if(num(w.workMinutes))return prep+w.workMinutes;
  if(num(w.repetitions)&&num(w.workMinutesEach)&&typeof w.recoveryMinutes==='number')return prep+w.repetitions*w.workMinutesEach+(w.repetitions-1)*w.recoveryMinutes;
  if(num(w.repetitions)&&num(w.secondsEach))return {minimum:prep+w.repetitions*w.secondsEach/60,unknownRecovery:true};
 }
 const exercises=recipe.exercises??(recipe.exercise?[recipe]:null);
 if(exercises){let minutes=5;for(const e of exercises){const sets=e.sets??e.setsEach,reps=e.reps;if(!num(sets)||!num(reps))return null;const rest=typeof e.restSeconds==='number'?e.restSeconds/60:2;minutes+=sets*reps*10/60+Math.max(0,sets-1)*rest;}return minutes;}
 return null;
}
export function sourceEquipmentAllows(recipe,source){
 const equipment=source.equipment??source.currentDemand?.equipment??source.onboarding?.equipment??source.constraints?.equipment;
 if(!equipment)return true;
 if(Array.isArray(equipment)){
  const text=equipment.filter(x=>typeof x==='string').join('; ');
  for(const e of recipe.exercises??(recipe.exercise?[recipe]:[])){
   const loaded=typeof e.loadKg==='number'&&e.loadKg>0||typeof e.loadKgPerHand==='number'&&e.loadKgPerHand>0;
   if(/\bbodyweight only\b/i.test(text)&&(loaded||/dumbbell|barbell|goblet|supported row/i.test(e.exercise??'')))return false;
   if(/\bno dumbbells\b/i.test(text)&&(e.loadKgPerHand!==undefined||/dumbbell/i.test(e.exercise??'')))return false;
   if(/\bno barbell\b/i.test(text)&&/barbell/i.test(e.exercise??''))return false;
  }
  const restrictive=equipment.some(x=>typeof x==='string'&&/\bonly\b/i.test(x));
  if(restrictive)for(const e of recipe.exercises??(recipe.exercise?[recipe]:[]))for(const key of ['loadKg','loadKgPerHand'])if(typeof e[key]==='number'&&e[key]!==source.currentDemand?.base?.[key])return false;
  return true;
 }
 for(const e of recipe.exercises??(recipe.exercise?[recipe]:[]))for(const [key,listKey] of [['loadKg','availableLoadsKg'],['loadKgPerHand','availableLoadsKgPerHand']]){
  const list=equipment[listKey]??source.constraints?.[listKey];
  if(typeof e[key]==='number'&&Array.isArray(list)&&!list.includes(e[key]))return false;
 }
 return true;
}
export function enforcePracticalConstraints(proposal,source){
 if(!proposal?.candidates)return proposal;
 const cap=availabilityLimit(source);
 // Placement is validated against its own day/window, not reduced to one session's cap.
 if(proposal.envelopeId==='R4-SCHEDULE')return proposal;
 for(const candidate of proposal.candidates){
  if(!candidate.admissible||!candidate.recipe)continue;
  if(!sourceEquipmentAllows(candidate.recipe,source)){candidate.admissible=false;candidate.reason='Candidate load is unavailable in the supplied equipment choices';continue;}
  if(candidate.recipe.sessions){
   for(const slot of candidate.recipe.sessions){const duration=planningMinutes(slot.session),limit=slot.capacityMinutes;if(typeof duration==='number'&&num(limit)&&duration>limit){candidate.admissible=false;candidate.reason='Complete proposed session including preparation/work/rest does not fit its actual day capacity';}}
   continue;
  }
  if(cap===null)continue;
  const minutes=planningMinutes(candidate.recipe);
  if(minutes===null){candidate.admissible=false;candidate.reason='Actual window is supplied but complete task timing cannot be established';}
  else if(typeof minutes==='object'){candidate.admissible=false;candidate.reason=cap<minutes.minimum?'Preparation and work alone exceed the actual available window':'Self-paced recovery duration is unknown; obtain a familiar recovery planning budget before claiming this full task fits';}
  else if(minutes>cap){candidate.admissible=false;candidate.reason='Full task with preparation/work/recovery planning reservation exceeds actual availability';}
  else candidate.planning={reservedMinutes:minutes,availableMinutes:cap,basis:'Operational planning estimate (strength: 5min preparation, 10sec/rep, explicit rest or 2min reservation); never forced cadence or a physiological threshold. Stop/reassess if actual time or technique no longer permits remaining work.'};
 }
 return proposal;
}
