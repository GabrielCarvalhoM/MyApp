import {clone,hash} from './value.mjs';
import {dateValid,daysBetween,validateAvailability} from './r5-contract.mjs';

/** No universal spacing/fatigue threshold: candidate configurations need current combined tolerance. */
export function scheduleCandidates(anchors,availability,options,asOf,{allowOmissions=false,forbiddenPairs=[]}={}){
 return (options??[]).map(option=>{
  const reasons=[...validateAvailability(availability)],seen=new Set(),occupied=new Set(),sessions=[];
  const e=option.evidence;
  if(!e||e.current!==true||e.source!=='SELF_REPORT'||e.combinedRecovery!=='COMPATIBLE'||!dateValid(e.observedAt)||daysBetween(e.observedAt,asOf)<0||daysBetween(e.observedAt,asOf)>28)reasons.push('Current combined configuration response missing');
  if(!option.id||!Array.isArray(option.assignments))reasons.push('Incomplete option');
  for(const assignment of Array.isArray(option.assignments)?option.assignments:[]){
   if(!assignment||reasons.length&&validateAvailability(availability).length){reasons.push('Invalid assignment or availability');continue;}
   const anchor=anchors.find(a=>a.id===assignment.anchorId),day=availability.find(d=>d.day===assignment.day),window=day?.windows?.find(w=>w.id===assignment.windowId);
   if(!anchor||!window||seen.has(assignment.anchorId)||occupied.has(assignment.windowId)){reasons.push('Missing/duplicate anchor or occupied window');continue;}
   seen.add(anchor.id);occupied.add(assignment.windowId);
   if(anchor.prescription.durationMinutes>window.durationMinutes)reasons.push(anchor.id+': duration does not fit');
   if(!anchor.prescription.equipment.every(eq=>window.equipment.includes(eq)))reasons.push(anchor.id+': unavailable equipment');
   sessions.push({anchorId:anchor.id,day:day.day,windowId:window.id,startMinute:window.startMinute,prescription:clone(anchor.prescription),essential:anchor.essential,objective:anchor.objective});
  }
  const omitted=anchors.filter(a=>!seen.has(a.id));
  if(!allowOmissions&&omitted.length)reasons.push('Initial option omits prescribed work');
  for(const pair of forbiddenPairs){
   const first=sessions.find(s=>s.anchorId===pair.before),second=sessions.find(s=>s.anchorId===pair.after);
   if(first&&second&&first.day===second.day&&first.startMinute<second.startMinute)reasons.push('Supplied incompatible arrangement: '+pair.before+' before '+pair.after);
  }
  sessions.sort((a,b)=>a.day-b.day||a.startMinute-b.startMinute||a.anchorId.localeCompare(b.anchorId));
  return {id:option.id,admissible:reasons.length===0,reasons,sessions,omitted:omitted.map(a=>a.id),preservesRun:omitted.filter(a=>a.essential&&a.prescription.modality==='RUN').length===0,preservesStrength:omitted.filter(a=>a.essential&&a.prescription.modality==='STRENGTH').length===0,signature:hash(sessions.map(s=>[s.anchorId,s.day,s.startMinute,s.prescription]))};
 });
}
export function chooseSchedule(candidates,priority='BALANCED'){
 const feasible=candidates.filter(c=>c.admissible),pareto=feasible.filter(c=>!feasible.some(other=>other!==c&&Number(other.preservesRun)>=Number(c.preservesRun)&&Number(other.preservesStrength)>=Number(c.preservesStrength)&&(other.preservesRun!==c.preservesRun||other.preservesStrength!==c.preservesStrength)));
 const both=pareto.filter(c=>c.preservesRun&&c.preservesStrength);
 const eligible=both.length?both:pareto;
 if(priority==='BALANCED'&&!both.length&&new Set(eligible.map(c=>c.preservesRun+':'+c.preservesStrength)).size>1)return {selected:null,tiedIds:eligible.map(c=>c.id),reason:'No dominating solution preserves both essential goals; ask explicit temporary trade-off',paretoIds:pareto.map(c=>c.id)};
 const ordered=[...eligible].sort((a,b)=>{
  if(priority==='RUN_FIRST'&&a.preservesRun!==b.preservesRun)return Number(b.preservesRun)-Number(a.preservesRun);
  if(priority==='STRENGTH_FIRST'&&a.preservesStrength!==b.preservesStrength)return Number(b.preservesStrength)-Number(a.preservesStrength);
  return a.omitted.length-b.omitted.length;
 });
 return {selected:ordered[0]??null,paretoIds:pareto.map(c=>c.id),tiedIds:[],reason:both.length?'A feasible Pareto option preserves essential work in both modalities; priority creates no necessity':'All feasible alternatives lose essential work; stated priority resolves necessary trade-off'};
}
