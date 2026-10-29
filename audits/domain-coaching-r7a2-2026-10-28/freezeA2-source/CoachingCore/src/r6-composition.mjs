import {clone,hash} from './value.mjs';
import {skeletonOf,projectWeeks,advanceRun,advanceStrength,projectionGates,plannedOf,plannedStrengthOf,runMinutesOf,dayPhaseOf,needsReestablishment,weekSummary} from './r6-program.mjs';
import {interferenceCosts,SEVERITY} from './r6-balanced.mjs';
import {easyPrescription,strengthPrescription} from './r6-prescription.mjs';
import {localDate} from './r6-provenance.mjs';
import {onDate} from './r6-intake.mjs';

// Week composition (R7-A.1, audits/domain-coaching-r7a1-2026-10-27/WEEK_COMPOSITION_CONTRACT.md): one way to re-plan weeks, one way to
// adapt this week and one way to change the context, so every handler keeps the same history, next-week start, adaptations and context scope.
export const SPORTS=['RUN','STRENGTH'];
export const rank=s=>SEVERITY.indexOf(s??'NONE');
export const counter=(id,action,admissible,reason,extra={})=>({id,action,admissible,reason,selected:false,reversible:true,...extra});
/** Lexicographic choice: admissible → safety → H3 essential → H2 → H1 interference → change cost. No summed score. */
export function choose(cands){
 const ok=cands.filter(c=>c.admissible);
 const key=c=>[c.clinical?1:0,c.h3Loss??0,c.h2Loss??0,rank(c.h1Worst??'NONE'),c.h0Loss??0,c.changeCount??0,c.order??0];
 const best=[...ok].sort((a,b)=>{const x=key(a),y=key(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;})[0]??null;
 for(const c of cands){c.selected=c===best;if(!c.selected&&!c.whyLost)c.whyLost=!c.admissible?c.reason:'Ranked lower on essential-stimulus preservation, interference or change cost'}
 return best;
}
/** Local hour of an instant for the program's fixed synthetic offset. */
const localHour=(iso,offset=0)=>new Date(Date.parse(iso)+offset*60000).getUTCHours();
/**
 * C1: a session still ahead of a review is dated after it, or dated that day with no execution report yet while its shift is not over: the
 * plan knows only the athlete's chosen shift, and a morning session is over at noon local time (R7-A; R7-A.1 QE-R7A-02, QE-R7A-23). An
 * afternoon or unspecified shift stays ahead until the day ends. One test for every handler.
 */
export const aheadOf=ctx=>{const reported=new Set((ctx.fullLedger??ctx.ledger??[]).map(o=>o.sessionId)),pastNoon=localHour(ctx.asOf,ctx.program?.timezoneOffsetMinutes??0)>=12;return s=>!!s&&(s.date>ctx.asOfLocal||s.date===ctx.asOfLocal&&!reported.has(s.id)&&!(s.turn==='AM'&&pastNoon));};
/** The week's prescribed strength exposures as their rows state them: kind and counts from the row's exposure (R7-A), and the session. */
export function usedInWeek(week){return week.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>({id:e.id,mode:e.load.mode,value:e.load.value??null,convention:e.load.convention,reps:e.reps,sets:e.sets,rir:e.rir,practice:e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE',date:s.date,session:s.id,...(e.exposure?{kind:e.exposure.kind,baseSets:e.exposure.baseSets??null,normalSets:e.exposure.normalSets??null,phasedSets:e.exposure.phasedSets??null}:{})})));}
/** A return decided in week w that re-plans from w+1 is the start of week w+1: every later change of week w keeps it (R7-A; C3). */
export const rebasedNext=(program,w)=>{const d=[...program.decisions].reverse().find(x=>x.action==='REESTABLISH');return d&&d.fromWeek===w+1?program.stateTrace[w+1]??null:null;};
/** The latest return reported in week w, if any: its local day and its instant (C5). */
export function returnOf(program,w){
 const start=program.weeks[w]?.startDate,d=[...program.decisions].reverse().find(x=>x.action==='REESTABLISH');if(!start||!d)return null;
 const day=localDate(d.asOf,program.timezoneOffsetMinutes??0);return day>=start&&day<=onDate(start,6)?{day,asOf:d.asOf}:null;
}
/**
 * C5: a session of the plan before the break is one dated before the return report, or dated that day and already past at it (C1 at the
 * report's clock). It is never moved into the re-entry and never counts as done in next week's conditional plan.
 */
export const beforeReturn=(program,ret)=>s=>!!ret&&(s.date<ret.day||s.date===ret.day&&!aheadOf({program,asOf:ret.asOf,asOfLocal:ret.day,fullLedger:[]})(s));
const bySlot=(a,b)=>a.day-b.day||(a.backToBackOrder??0)-(b.backToBackOrder??0);
const withWeek=(program,w,sessions)=>({...program,weeks:program.weeks.map((x,i)=>i===w?{...x,sessions}:x)});
// ---------- adaptations (C4): each changes only sessions still ahead of the review that applies it ----------
const easyRun=(sk,s,explanation)=>{const p=easyPrescription(Math.min(s.prescription.durationMinutes,sk.c.schedule.runMinutes),{cue:sk.op.run.effortCues.EASY_CONVERSATIONAL});return {...s,role:'EASY',key:false,prescription:p,plannedPrescriptionHash:hash(p),explanation};};
/**
 * Same-week rearrangement among chosen days of the same sport: the coach reallocates content, never the athlete's days. A session keeps its
 * meaning where it moves: never into a day with another phase (taper or race-window days), nor to a date where one of its exercises falls
 * outside the re-establishment window its row was written for (R7-A), nor past a return of this week when it was planned before it (C5), nor
 * into a slot whose session was skipped (an unavailable or event-conflict date), nor to a date where its rows need equipment the athlete
 * has not got then (R7-A.1, QE-R7A1-01). A slot is any session still ahead by the one C1 test; the interference of a move is weighed
 * among the sessions dated after the review, as before.
 */
export function moveCandidates(env,target){
 const {program,asOfLocal,w,sk}=env,week=program.weeks[w],phaseOf=s=>dayPhaseOf(sk,w,s.day),st=program.stateTrace[w]?.strength?.exercises??{};
 const fits=date=>{const have=new Set([...(sk.equipmentForDate?.(date)??sk.c.athlete.equipment),'BODYWEIGHT']);return (target.prescription?.exercises??[]).every(e=>(e.equipment??[]).every(q=>have.has(q)));};
 if(beforeReturn(program,env.returned)(target))return [];
 const sameKind=date=>target.sport!=='STRENGTH'||(target.prescription?.exercises??[]).every(e=>e.role==='PRACTICE'||e.load.mode==='BODYWEIGHT'||needsReestablishment(sk.op,st[e.id],{loading:'EXTERNAL'},date)===(e.exposure?.kind?e.exposure.kind==='REESTABLISH':needsReestablishment(sk.op,st[e.id],{loading:'EXTERNAL'},target.date)));
 const later=week.sessions.filter(s=>s.sport===target.sport&&s.id!==target.id&&env.ahead(s)&&s.prescription&&s.status!=='SKIPPED'&&!s.key&&!['RACE','REST_BY_DESIGN'].includes(s.role)&&phaseOf(s)===phaseOf(target)&&sameKind(s.date)&&fits(s.date));
 return later.map(slot=>{
  const sessions=week.sessions.map(s=>s.id===slot.id?{...clone(target),id:slot.id,day:slot.day,date:slot.date,turn:slot.turn,backToBackOrder:slot.backToBackOrder,moved:{from:target.id}}:s.id===target.id?{...s,status:'SKIPPED',movedTo:slot.id}:s);
  const hybrid=env.authority.policy.operational.hybrid,before=interferenceCosts(week.sessions.filter(s=>s.prescription&&s.date>asOfLocal||s.id===target.id),{wrap:true,hybrid}),after=interferenceCosts(sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&(s.date>asOfLocal||s.id===slot.id)),{wrap:true,hybrid});
  const worst=list=>list.reduce((m,c)=>rank(c.severity)>rank(m)?c.severity:m,'NONE');
  return {slot,sessions,addedCost:rank(worst(after))>rank(worst(before))?worst(after):'NONE',costs:after};
 });
}
/** Fatigue: the remaining hard runs become easy and strength keeps its main lifts at fewer sets (systemic), or the affected region's optional accessories go (local). */
export function fatigueSessions(env,sessions,{systemic,region}){
 const {sk}=env;
 return sessions.map(s=>{
  if(!(s.prescription&&env.ahead(s)))return s;
  if(systemic&&s.sport==='RUN'&&['QUALITY','RACE_TOUCH'].includes(s.role))return easyRun(sk,s,'Converging fatigue: the remaining hard run becomes easy');
  if(s.sport==='STRENGTH'){const ex=s.prescription.exercises.filter(e=>systemic?e.role==='MAIN':!(e.role!=='MAIN'&&(e.region===region||region==='ALL'))).map(e=>systemic?{...e,sets:Math.max(1,e.sets-1),rir:Math.max(e.rir,4),...(e.exposure?{exposure:{...e.exposure,phasedSets:Math.min(e.exposure.phasedSets??e.sets,Math.max(1,e.sets-1))}}:{})}:e);if(!ex.length||hash(ex)===hash(s.prescription.exercises))return s;const p=strengthPrescription(s.prescription.family,ex,{budget:sk.c.schedule.strengthMinutes,warmup:s.prescription.warmupMinutes,cooldown:s.prescription.cooldownMinutes,secondsPerRep:s.prescription.secondsPerRep,goalMode:s.prescription.goalMode,instructions:[systemic?'Converging fatigue: main lifts only, fewer sets, more reps in reserve':'Local fatigue: optional accessories for the affected region removed']});return {...s,prescription:p,plannedPrescriptionHash:hash(p)};}
  return s;
 });
}
/** Unavailable dates: their sessions move to a later chosen day of the same sport when that adds no interference, otherwise they are skipped without debt. */
export function unavailableSessions(env,sessions,dates){
 const hit=sessions.filter(s=>dates.has(s.date)&&s.prescription&&env.ahead(s));
 if(hit.some(s=>s.role==='RACE'))return {race:true,hit,sessions,cands:[]};
 let out=clone(sessions);const cands=[];
 for(const target of hit){
  const skip=counter('SKIP_'+target.id,'SKIP',true,'Skip without debt; the next comparable session repeats the last executed dose',{h2Loss:target.key?1:0,order:0});
  const moves=target.key?moveCandidates({...env,program:withWeek(env.program,env.w,out)},target).filter(m=>!dates.has(m.slot.date)).map(m=>counter('MOVE_'+target.id+'_TO_'+m.slot.id,'MOVE',m.addedCost==='NONE',m.addedCost==='NONE'?'Same session on a later chosen day of the same sport, replacing an easy session':'Added interference '+m.addedCost,{h1Worst:m.addedCost,changeCount:2,order:1,proposalSessions:m.sessions})):[];
  const best=choose([skip,...moves]);cands.push(skip,...moves);
  out=best.proposalSessions??out.map(s=>s.id===target.id?{...s,status:'SKIPPED',explanation:'Unavailable date; skipped without debt'}:s);
 }
 return {race:false,hit,sessions:out,cands};
}
/** A missed key session: moved to a later chosen day of the same sport when that adds no interference, otherwise recorded as zero without debt. */
export function missedMove(env,sessions,target){
 const phase=env.sk.plan.phases[env.w],eventLate=['TAPER','RACE_WEEK'].includes(phase);
 const skip=counter('SKIP_NO_DEBT','KEEP',true,'Record zero work; the next comparable session repeats the last executed dose',{h3Loss:target.key&&phase==='SPECIFIC'?1:0,h2Loss:target.key?1:0,changeCount:0,order:0});
 const cands=[skip];
 if(target.key&&!eventLate)for(const m of moveCandidates({...env,program:withWeek(env.program,env.w,sessions)},target)){
  const admissible=m.addedCost==='NONE'&&!['RACE_TOUCH','SHAKEOUT'].includes(target.role);
  cands.push(counter('MOVE_TO_'+m.slot.id,'MOVE',admissible,admissible?`Do the missed ${target.role.toLowerCase().replace('strength_','')} on ${m.slot.date} instead of the ${m.slot.role.toLowerCase().replace('strength_','')} session planned there; no new day, no added interference`:`Moving would add ${m.addedCost} interference`,{h3Loss:0,h2Loss:0,h1Worst:m.addedCost,changeCount:2,order:1,proposalSessions:m.sessions}));
 }
 cands.push(counter('STACK_OR_CATCH_UP','CATCH_UP',false,'Stacking missed work or adding it to next week creates load debt; never selected',{order:9}));
 return {best:choose(cands),cands};
}
/** Event-period unavailable dates: the affected sessions are skipped and nothing is added elsewhere; a day with no session has nothing to skip. */
export const conflictSessions=(env,sessions,dates)=>sessions.map(s=>dates.has(s.date)&&s.prescription&&s.role!=='RACE'&&env.ahead(s)?{...s,status:'SKIPPED',explanation:'Unavailable in the event period: skipped; nothing is added elsewhere'}:s);
/** Ahead at a return report (C1 at its clock): dated after it, or on its day and not among the sessions already past then. */
const aheadAt=a=>s=>s.date>a.asOfLocal||s.date===a.asOfLocal&&!(a.past??[]).includes(s.id);
/** A return that re-plans from next week: every session still ahead of its report waits, the race excepted, so nothing after the break keeps the earlier dose. */
export const waitSessions=(env,sessions,a)=>{const ahead=aheadAt(a);return sessions.map(s=>s.prescription&&ahead(s)&&env.ahead(s)&&s.role!=='RACE'?{...(({status,movedTo,...row})=>row)(s),role:'REST_BY_DESIGN',key:false,essential:false,optional:true,prescription:null,progression:null,plannedPrescriptionHash:null,explanation:'Re-entry after the break starts next week; this session waits so that nothing after the break keeps the earlier dose'}:s);};
/**
 * A short return: its slot is the one it already made easy, else the first quality slot still ahead of its report in the week as it stands
 * (SSCTR R27, D58). The slot runs easy while it is ahead; once it is history nothing else changes. No slot: the week holds none (D58).
 */
const EASY_SLOT='First quality slot after a short break runs easy';
export function shortReturnEasy(env,sessions,a){const ahead=aheadAt(a),q=sessions.find(s=>s.explanation===EASY_SLOT)??sessions.find(s=>s.role==='QUALITY'&&s.prescription&&s.status!=='SKIPPED'&&ahead(s));return {slot:q??null,sessions:q?.role==='QUALITY'&&env.ahead(q)?sessions.map(s=>s===q?easyRun(env.sk,s,EASY_SLOT):s):sessions};}
/** Applies a recorded adaptation again to a re-planned week, with its own clock (C4); {ask} when the new plan contradicts it. */
function reapply(env,sessions,a){
 const own=aheadAt(a),e={...env,asOfLocal:a.asOfLocal,ahead:s=>env.ahead(s)&&own(s)};
 if(a.kind==='SYSTEMIC_FATIGUE'||a.kind==='LOCAL_FATIGUE')return {sessions:fatigueSessions(e,sessions,{systemic:a.kind==='SYSTEMIC_FATIGUE',region:a.region})};
 if(a.kind==='UNAVAILABLE_DAY'){const r=unavailableSessions(e,sessions,new Set(a.dates));return r.race?{ask:'The race now falls on a date marked unavailable; confirm whether the race still happens on that date or the new date',missingInputs:['event.date']}:{sessions:r.sessions};}
 if(a.kind==='EVENT_WEEK_CONFLICT')return {sessions:conflictSessions(e,sessions,new Set(a.dates))};
 if(a.kind==='RETURN_WAIT')return {sessions:waitSessions(e,sessions,a)};
 if(a.kind==='SHORT_RETURN_EASY')return shortReturnEasy(e,sessions,a);
 if(a.kind==='MISSED_SESSION'){
  // A move whose slot is already history was done there: it is consumed, never repeated elsewhere.
  const target=sessions.find(s=>s.id===a.sessionId),slot=sessions.find(s=>s.id===a.slotId);if(!target||!slot||!env.ahead(slot))return {sessions};
  const unmoved={...target,status:'PLANNED'};delete unmoved.movedTo;
  const others=sessions.map(s=>s.id===target.id?unmoved:s),{best}=missedMove(e,others,unmoved);
  return {sessions:best?.action==='MOVE'?best.proposalSessions:others};
 }
 return {sessions};
}
/** C4: a same-week change that only alters this week's rows, applied to the week as it stands and recorded on it; nothing else changes (I2).
 * Content it moves into a slot keeps every earlier adaptation of the week (a fatigue report, a short return's easy slot, a wait), applied
 * again to that slot with its own clock; a move is never applied again. The week's totals keep describing its plan (as before R7-A.1). */
export function adaptThisWeek(ctx,program,w,sessions,fact){
 const was=new Map(program.weeks[w].sessions.map(s=>[s.id,s.moved?.from??null])),moved=new Set(sessions.filter(s=>s.moved&&was.get(s.id)!==s.moved.from).map(s=>s.id));let out=sessions;
 for(const a of moved.size?program.weeks[w].adaptations??[]:[]){if(a.kind==='MISSED_SESSION')continue;const r=reapply({...ctx,program:withWeek(program,w,out),sk:ctx.skw??ctx.sk,w,ahead:s=>moved.has(s.id)&&ctx.ahead(s)},out,a);if(!r.ask)out=r.sessions;}
 return {weeks:program.weeks.map((x,i)=>i!==w?x:{...clone(x),sessions:out,adaptations:[...(x.adaptations??[]),fact]}),stateTrace:program.stateTrace};
}
/** The fact an adaptation records: its kind, its review, its clock, the sessions of its day already past then, and what it needs to apply again. */
export const adaptation=(ctx,kind,facts={})=>({kind,eventId:ctx.review.event.id,asOf:ctx.asOf,asOfLocal:ctx.asOfLocal,past:(ctx.program.weeks[ctx.w]?.sessions??[]).filter(s=>s.date===ctx.asOfLocal&&!ctx.ahead(s)).map(s=>s.id),...facts});
// ---------- context (C2) ----------
const CONTEXT=['canonical','goal','phases','blocks','templates','arrangementSessions'];
const contextOf=x=>Object.fromEntries(CONTEXT.map(k=>[k,x[k]]));
/**
 * C2: a change of the context from week j. Every context in force from j on gets it (`apply(context, firstWeek, j)`, which may return {ask});
 * the part of an earlier context before j stays in force before j (`contextBefore`). Contexts that only cover past weeks are dropped.
 */
export function withContextChange(ctx,program,j,apply){
 const before=program.contextBefore??[],segments=[...before.map((e,i)=>({from:i?before[i-1].untilWeek:0,until:e.untilWeek,context:contextOf(e)})),{from:before.at(-1)?.untilWeek??0,until:Infinity,context:contextOf(program)}],out=[];
 for(const s of segments){
  if(s.until<=j){out.push(s);continue;}
  if(s.from<j)out.push({...s,until:j});
  const changed=apply(s.context,Math.max(s.from,j),j);if(changed?.ask)return changed;
  out.push({from:Math.max(s.from,j),until:s.until,context:changed});
 }
 const live=out.filter(s=>s.until>ctx.w),top=live.at(-1).context,kept=live.slice(0,-1).map(s=>({untilWeek:s.until,...s.context}));
 const next={...program,...top,schedule:clone(top.canonical.schedule)};
 if(kept.length)next.contextBefore=kept;else delete next.contextBefore;
 return {program:next};
}
// ---------- composition (C1–C6) ----------
const runsOf=week=>week.sessions.map(s=>({date:s.date,minutes:runMinutesOf(s)})).filter(x=>x.minutes);
/**
 * Week i as now planned (C1, C6): its history and the rows of other sports as they stand, the rest from the new plan; before adaptations.
 * Rows of one slot keep the new plan's order, whichever sports the change re-planned.
 */
const mergeRows=(ctx,next,i,rows,sports)=>{const ahead=aheadOf(ctx),keep=s=>!ahead(s)||!sports.includes(s.sport),kept=next.weeks[i].sessions.filter(keep),ids=new Set(kept.map(s=>s.id)),at=new Map(rows.map((s,k)=>[s.id,k])),order=s=>at.get(s.id)??rows.length;return [...kept,...rows.filter(s=>!ids.has(s.id)&&!keep(s))].sort((a,b)=>bySlot(a,b)||order(a)-order(b));};
/** Week w as now planned, with its start: the plan of the week from its start state under its context, merged with what it keeps (C1, C2, C6). */
export function weekAsPlanned(ctx,next,w,{start=null,sports=SPORTS,completedRuns=ctx.completedRuns??[]}={}){
 const sk=skeletonOf(next,ctx.authority),st0=next.stateTrace[w],base=projectWeeks(sk,w,start??{runState:st0.run,strengthState:st0.strength},next.weeks.slice(0,w),{completedRuns,toWeek:w+1});
 const week={...base.weeks[0],sessions:mergeRows(ctx,next,w,base.weeks[0].sessions,sports)};
 // The week's planned counts are those before the time fit, as the projection records them (one reading of the week, QE-R7A-14).
 return {week,state:{run:{...base.states[0].run,planned:plannedOf(week)},strength:{...base.states[0].strength,planned:plannedStrengthOf(usedInWeek(week).map(u=>({...u,sets:u.phasedSets??u.sets})))}}};
}
/**
 * The conditional start of the week after w (planning, not prediction): the week as planned, assumed executed as prescribed, except the sessions
 * dated before a return reported this week: they belong to the plan before the break, which the return replaced (C3, C5).
 */
export function conditionalNext(ctx,skn,w,{week,state},ret=returnOf(ctx.program,w)){
 const before=beforeReturn(ctx.program,ret),done={...week,sessions:week.sessions.filter(s=>!before(s))};
 const run={...state.run,planned:plannedOf(done)},strength={...state.strength,planned:plannedStrengthOf(usedInWeek(done).map(u=>({...u,sets:u.phasedSets??u.sets})))};
 return {runState:advanceRun(skn,run,w,projectionGates(done,run.mode)),strengthState:advanceStrength(skn,strength,w,usedInWeek(done),{},{},{assumeLogged:true})};
}
/**
 * The one way any change re-plans weeks from `fromWeek` (this week or later). `next` carries the new context; `start` is the start of fromWeek
 * when the change sets it (a return that re-plans this week; the next-week start of a review or a re-plan from next week).
 * - C1/C6: history and the sports outside `sports` keep their rows and states;
 * - C2: each week is built under the context in force for it (the projection reads `sk.at`);
 * - C3: next week's start follows one rule for every handler: a return's re-base is kept; otherwise this week's transition, from its
 *   evidence once the week is complete (`evidence`, the weekly review's rule) and, while it is under way, the conditional plan of the week as
 *   now planned (as every later week is planned);
 * - C4: each re-planned week's recorded adaptations apply again, in order, with their own clocks, to its new rows only; a short return's easy
 *   slot moves on to the first later week that still holds a quality slot, also when a later change of its week skipped it (D58).
 *   The start a return replaced (startBeforeReturn) is kept with the week, so a newer report of the same break starts from it (C5).
 * The week's totals describe its rows as planned, before same-week adaptations; a strength-only re-plan keeps the running totals and rest days.
 */
export function composeWeeks(ctx,next,{fromWeek,start=null,sports=SPORTS,completedRuns=ctx.completedRuns??[],returnDay=null,evidence=null}){
 const {w,authority}=ctx,ahead=aheadOf(ctx),sk=skeletonOf(next,authority),at=i=>sk.at(i)??sk,N=sk.c.weeks,inScope=s=>sports.includes(s.sport),all=sports.length===SPORTS.length,fresh=s=>ahead(s)&&inScope(s);
 // A short return's easy slot not found in its week, carried to the next week placed (D58). So is one that the week before the first week
 // placed, this week or later, no longer holds (a later change of that week skipped or replaced it); it leaves that week.
 const prior=fromWeek>w?next.weeks[fromWeek-1]:null,held=prior?.adaptations?.find(a=>a.kind==='SHORT_RETURN_EASY');
 let carry=held&&!shortReturnEasy({ahead:()=>false},prior.sessions,held).slot?held:null;
 // The return of a week: the one this composition re-plans for (its own clock), else one recorded earlier (C5).
 const returned=i=>i===w&&returnDay?{day:returnDay,asOf:ctx.asOf}:returnOf(next,i);
 // The weeks between next week and a later fromWeek stay as planned: earlier weeks of the conditional plan count as executed for the run
 // ceiling, as a projection from next week counts them (policy run.singleRunCeiling; C3), and fromWeek starts from the week before it as
 // planned, its transition under fromWeek's own context (C2: the transition into a week follows that week's context).
 const executedOr=i=>[...completedRuns,...next.weeks.slice(w+1,Math.max(w+1,i)).flatMap(runsOf)];
 if(!start&&fromWeek>w+1)start=conditionalNext(ctx,at(fromWeek),fromWeek-1,weekAsPlanned(ctx,next,fromWeek-1,{sports,completedRuns:executedOr(fromWeek-1)}),null);
 completedRuns=executedOr(fromWeek);
 const own=(i,state)=>all?state:{run:sports.includes('RUN')?state.run:next.stateTrace[i].run,strength:sports.includes('STRENGTH')?state.strength:next.stateTrace[i].strength};
 const totals=(i,sessions)=>{const t=weekSummary(sessions);return all?t:{...t,plannedRunMinutes:next.weeks[i].plannedRunMinutes,restDays:next.weeks[i].restDays};};
 const weeks=next.weeks.slice(0,fromWeek),stateTrace=next.stateTrace.slice(0,fromWeek);
 if(carry){const left=prior.adaptations.filter(a=>a!==held);weeks[fromWeek-1]={...prior};if(left.length)weeks[fromWeek-1].adaptations=left;else delete weeks[fromWeek-1].adaptations;}
 // Places week i: its rows as planned, then its recorded adaptations applied again; {ask} when the new plan contradicts one.
 const place=(i,rows,state)=>{
  const merged=mergeRows(ctx,next,i,rows,sports),planned={...weeks[i]??{},sessions:merged,...totals(i,merged)};weeks[i]=planned;stateTrace[i]=own(i,state);
  const list=[];let sessions=merged;
  for(const a of [...(next.weeks[i].adaptations??[]),...(carry?[carry]:[])]){
   const env={program:{...next,weeks:weeks.map((x,k)=>k===i?{...x,sessions}:x),stateTrace},sk:at(i),w:i,ahead:fresh,authority,returned:returned(i)},r=reapply(env,sessions,a);if(r.ask)return r;
   // A short return's easy slot that this week does not hold moves on to the next week placed (SSCTR D58).
   if(a.kind==='SHORT_RETURN_EASY'){if(a===carry)carry=null;if(!r.slot){carry=a;continue;}}
   list.push(a);sessions=r.sessions;
  }
  if(list.length)weeks[i]={...planned,sessions,adaptations:clone(list)};else if(next.weeks[i].adaptations)weeks[i]={...planned,sessions};
  if(next.weeks[i].startBeforeReturn)weeks[i]={...weeks[i],startBeforeReturn:clone(next.weeks[i].startBeforeReturn)};
  return {};
 };
 const first=weekAsPlanned(ctx,next,fromWeek,{start,sports,completedRuns});
 weeks[fromWeek]=first.week;const p0=place(fromWeek,first.week.sessions,first.state);if(p0.ask)return p0;
 if(fromWeek+1>=N)return {weeks,stateTrace,sk};
 const skn=at(fromWeek+1),rebased=fromWeek===w&&!start?rebasedNext(next,w):null;
 const nextStart=rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:fromWeek===w&&!ctx.ev?.pending&&evidence?evidence({...next,weeks,stateTrace},skn):conditionalNext(ctx,skn,fromWeek,first,returned(fromWeek));
 const rest=projectWeeks(sk,fromWeek+1,nextStart,[...next.weeks.slice(0,fromWeek),first.week],{completedRuns:[...completedRuns,...runsOf(first.week)]});
 for(const [k,wk] of rest.weeks.entries()){weeks[fromWeek+1+k]=wk;const r=place(fromWeek+1+k,wk.sessions,rest.states[k]);if(r.ask)return r;}
 return {weeks,stateTrace,sk};
}
