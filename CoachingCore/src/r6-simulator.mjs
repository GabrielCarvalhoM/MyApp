import {clone,freeze,hash} from './value.mjs';
import {generateProgram,validateWeeks,skeletonOf,EVENT_PHASES} from './r6-program.mjs';
import {evaluateProgram} from './r6-adaptation.mjs';
import {r6Authority} from './r6-authority.mjs';

/**
 * Whole-program simulation over supplied execution fixtures. Responses, logs and adherence are scripted inputs,
 * never predicted physiology. Every decision is a SHADOW proposal; the scripted athlete adopts proposals.
 */
const DEFAULT_LOADS={'goblet-squat':16,'kb-goblet-squat':16,'db-bench-press':14,'db-floor-press':14,'db-row':16,'one-arm-db-row':18,'db-rdl':20,'kb-deadlift':20,'db-split-squat':10,'db-step-up':8,'db-calf-raise':12,'db-overhead-press':10,'hip-thrust-db':20,'leg-press':60,'machine-chest-press':30,'lat-pulldown':35,'seated-cable-row':35,'back-squat':60,'barbell-rdl':70,'bench-press':50,'barbell-row':40,'band-row':0};
const eligibility=date=>({status:'NONCLINICAL_CONFIRMED',assessedAt:date,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const RESPONSES={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},EASIER:{performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'},HARDER:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'},SINGLE_BAD:{performance:'UNDER',recovery:'COMPATIBLE',effort:'HARDER',nextDayFunction:'NORMAL'},UNKNOWN:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},CONFLICTING:{performance:'OVER',recovery:'ADVERSE',effort:'EASIER',nextDayFunction:'NORMAL'}};
/** A local clock time on a local date, as a UTC instant for the program's fixed offset (QRE-R6-20). */
const localAt=(date,hhmm,offset=0)=>new Date(Date.parse(date+'T'+hhmm+':00Z')-offset*60000).toISOString().replace('.000Z','Z');
const matchRef=(s,ref)=>(!ref.sport||s.sport===ref.sport)&&(!ref.role||s.role===ref.role||ref.role==='KEY'&&s.key)&&(ref.day===undefined||s.day===ref.day);
/** Synthetic actual for one planned session from the week fixture. */
function observationFor(program,s,fixture,w,{counter}){
 const missed=(fixture.missed??[]).some(r=>matchRef(s,r)),partial=(fixture.partial??[]).find(r=>matchRef(s,r));
 if(missed||!s.prescription||['REST_BY_DESIGN'].includes(s.role))return [];
 if(s.optional&&fixture.skipOptional)return [];
 const responseKey=(fixture.responses??[]).find(r=>matchRef(s,r))?.response??fixture.defaultResponse??'COMPATIBLE';
 const response=clone(RESPONSES[responseKey]??RESPONSES.COMPATIBLE);
 if(fixture.missingEffort)response.effort='UNKNOWN';
 const at=localAt(s.date,s.turn==='PM'?'19:00':'08:00',program.timezoneOffsetMinutes??0),p=s.prescription;
 const actual={completed:!partial,minutes:partial?Math.max(5,Math.round(p.durationMinutes*(partial.fraction??0.5))):p.durationMinutes};
 if(p.modality==='STRENGTH'){
  const rirShift=responseKey==='EASIER'?2:responseKey==='HARDER'?-2:0;
  actual.exercises=p.exercises.map(e=>{const value=e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:(fixture.loads?.[e.id]??DEFAULT_LOADS[e.id]??10);const reps=responseKey==='HARDER'?Math.max(1,e.reps-2):e.reps;return {id:e.id,sets:Array.from({length:partial?Math.max(1,e.sets-1):e.sets},()=>({reps,load:{value,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},rir:Math.max(0,e.rir+rirShift)}))};});
 }
 const base={eventId:`sim-${program.athleteId}-${s.id}-${counter.n++}`,athleteId:program.athleteId,sessionId:s.id,observedAt:at,actual,response,source:{provider:fixture.provider??'MANUAL'}};
 const out=[base];
 if((fixture.duplicates??[]).some(r=>matchRef(s,r)))out.push({...clone(base),eventId:base.eventId+'-watch',source:{provider:'WEARABLE:GENERIC',activityId:'act-'+s.id,quality:'WEARABLE_FULL'},actual:{...clone(actual),minutes:actual.minutes+1},response:clone(RESPONSES.UNKNOWN)});
 if((fixture.staleSync??[]).some(r=>matchRef(s,r)))out.push({...clone(base),eventId:base.eventId+'-stale',observedAt:'2025-01-05T08:00:00Z',sessionId:'old-'+s.id});
 if((fixture.futureSkew??[]).some(r=>matchRef(s,r)))out.push({...clone(base),eventId:base.eventId+'-future',observedAt:new Date(Date.parse(at)+40*86400000).toISOString()});
 return out;
}
const review=(program,w,kind,asOfDate,extra={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:localAt(asOfDate,'21:00',program.timezoneOffsetMinutes??0),weekIndex:w,event:{id:`sim-${kind}-w${w}-${asOfDate}`,kind},eligibility:eligibility(asOfDate),...extra});
export function simulateProgram(intake,script={},options={}){
 const initial=generateProgram(intake,options),counter={n:0};
 if(!initial.program)return freeze({status:initial.status,initial,rows:[],summary:{weeksExecuted:0},invariants:{generated:false}});
 const authority=r6Authority(options);
 let program=initial.program,model=null,ledger=[],reference=null;const rows=[],official=clone(initial.officialPlanState);
 const executed=new Map();
 const step=(rv,adopt=true)=>{
  if(model)rv.athleteModel=model;if(ledger.length)rv.actualLedger=ledger;if(reference)rv.referenceState=reference;
  const before=program,result=evaluateProgram(program,rv,options);
  model=result.updatedModel??model;ledger=result.actualLedger??ledger;reference=result.referenceState??reference;
  const adopted=!!(adopt&&result.proposal);
  if(adopted)program=result.proposal;
  return {review:rv,result,adopted,programBefore:before.hash,programAfter:program.hash,programBeforeRef:before};
 };
 for(let w=0;w<program.weeks.length;w++){
  const fixture=script.weeks?.[w]??script.default??{},week=program.weeks[w],events=[];
  for(const e of fixture.events??[]){
   const asOfDate=new Date(Date.parse(week.startDate+'T00:00:00Z')+(e.day??0)*86400000).toISOString().slice(0,10);
   const target=e.target?program.weeks[w].sessions.find(s=>matchRef(s,e.target)):null;
   const obs=program.weeks[w].sessions.filter(s=>s.date<asOfDate&&!executed.has(s.id)).flatMap(s=>{const o=observationFor(program,s,fixture,w,{counter});if(o.length)executed.set(s.id,true);return o;});
   events.push(step(review(program,w,e.kind,asOfDate,{observations:obs,...(target?{targetSessionId:target.id}:{}),...clone(e.review??{})}),e.adopt!==false));
  }
  const lastDate=new Date(Date.parse(program.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
  const obs=fixture.pause?[]:program.weeks[w].sessions.filter(s=>!executed.has(s.id)&&s.date<=lastDate).flatMap(s=>{const o=observationFor(program,s,fixture,w,{counter});if(o.length)executed.set(s.id,true);return o;});
  const weekly=fixture.pause?null:step(review(program,w,'WEEKLY_REVIEW',lastDate,{observations:obs,...clone(fixture.weeklyReview??{})}),true);
  rows.push({weekIndex:w,phase:program.weeks[w].phase,plannedWeek:clone(program.weeks[w]),events,weekly,actualCount:obs.length});
 }
 const decisions=rows.flatMap(r=>[...r.events,...(r.weekly?[r.weekly]:[])]);
 const statuses=decisions.map(d=>d.result.status),asks=decisions.filter(d=>d.result.status==='ASK');
 const runMinutes=program.weeks.map(w=>w.plannedRunMinutes),eventWeek=w=>['RACE_WEEK','POST_EVENT'].includes(w.phase);
 // Week-over-week growth of planned training running; race week and the post-event week follow the event envelope.
 // A consolidation week is a planned reduction (as race week and post-event are): the week after it is compared with the last full week before it,
 // so the rebound to the held dose is not read as progression (R7-B: a graduation introduction week follows a consolidation week, B0-C01).
 const baseOf=i=>{let j=i;while(j>0&&program.weeks[j].phase==='CONSOLIDATION')j--;return j;};
 const increases=program.weeks.slice(1).map((w,i)=>{const b=baseOf(i);return eventWeek(w)||eventWeek(program.weeks[b])?{ratio:1,base:0}:{ratio:runMinutes[b]>0?runMinutes[i+1]/runMinutes[b]:1,base:runMinutes[b],from:b,to:i+1};});
 const sk=skeletonOf(program,authority);
 const invariants={
  generated:true,
  noOfficialEffect:decisions.every(d=>hash(d.result.officialPlanState)===hash(official)&&hash(d.result.appliedState)===hash(official)&&d.result.applied===false),
  completedWorkImmutable:decisions.every(d=>!d.result.errors?.some(e=>/pastSession/.test(e))),
  selectedOptionsAdmissible:decisions.every(d=>(d.result.counterfactuals??[]).filter(c=>c.selected).every(c=>c.admissible===true)),
  noDeadlock:!statuses.length||statuses.some(s=>['KEEP','MODIFY'].includes(s)),
  noPermanentHold:!(statuses.length>=3&&statuses.slice(-3).every(s=>['HOLD','ASK','UNSUPPORTED'].includes(s))),
  noRepeatedUnnecessaryAsk:asks.every((a,i)=>i===0||hash(a.result.missingInputs)!==hash(asks[i-1].result.missingInputs)),
  noAdaptationCascade:rows.every(r=>[...r.events,...(r.weekly?[r.weekly]:[])].filter(d=>d.adopted&&!d.result.instantiationOnly).length<=2),
  noRunawayProgression:increases.every(x=>x.ratio<=1.35||x.base<60),
  noWeeklyTremor:program.weeks.slice(1).every((wk,i)=>wk.arrangementId===program.weeks[i].arrangementId||wk.phase!==program.weeks[i].phase||decisions.some(d=>['REARRANGE_FUTURE_WEEKS','REPLAN_FUTURE_PHASES','LEARNED_REARRANGEMENT'].includes(d.result.action))),
  noPriorityInversion:program.weeks.filter(w=>EVENT_PHASES.includes(w.phase)).every(w=>!w.sessions.some(s=>s.sport==='STRENGTH'&&s.prescription&&s.prescription.exercises.some(e=>e.sets>3))),
  scheduleValid:validateWeeks(sk,program.weeks.filter(w=>w.index>=(program.decisions.filter(d=>['REARRANGE_FUTURE_WEEKS','REPLAN_FUTURE_PHASES','LEARNED_REARRANGEMENT'].includes(d.action)).at(-1)?.fromWeek??0))).length===0,
  raceWeekPresent:!program.goal.run.event||program.weeks.some(w=>w.sessions.some(s=>s.role==='RACE'))
 };
 const summary={weeksExecuted:rows.length,sessionsPlanned:rows.reduce((n,r)=>n+r.plannedWeek.sessions.filter(s=>s.prescription).length,0),actualExecutions:ledger.length,decisions:Object.fromEntries([...new Set(statuses)].map(s=>[s,statuses.filter(x=>x===s).length])),actions:Object.fromEntries([...new Set(decisions.map(d=>d.result.action))].map(a=>[a,decisions.filter(d=>d.result.action===a).length])),adoptedChanges:decisions.filter(d=>d.adopted&&!d.result.instantiationOnly).length,instantiations:decisions.filter(d=>d.adopted&&d.result.instantiationOnly).length,maxWeeklyRunIncrease:Math.max(1,...increases.map(x=>x.ratio)),runMinutes,strengthSets:program.weeks.map(w=>w.plannedStrengthSets),phases:program.weeks.map(w=>w.phase),populationOutcomePrediction:false};
 return freeze({status:'SIMULATED_SYNTHETIC_FIXTURES',initial,finalProgram:program,finalModel:model,actualLedger:ledger,rows,decisions:decisions.map(d=>({kind:d.review.event.kind,asOf:d.review.asOf,weekIndex:d.review.weekIndex,status:d.result.status,action:d.result.action,reason:d.result.reason,gates:d.result.gates??null,adopted:d.adopted,instantiationOnly:!!d.result.instantiationOnly,counterfactuals:d.result.counterfactuals??[],horizons:d.result.horizons??null,excluded:d.result.provenance?.excluded?.map(e=>e.reason)??[],duplicates:d.result.provenance?.duplicates?.length??0,conflicts:d.result.provenance?.conflicts?.length??0})),summary,invariants});
}
