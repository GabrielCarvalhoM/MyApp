import {clone,hash} from './value.mjs';
import {skeletonOf,projectWeeks,advanceRun,advanceStrength,projectionGates,plannedOf,plannedStrengthOf,runMinutesOf,dayPhaseOf,needsReestablishment,weekSummary,startAuthority,anchoredStart,projectedStart,WEEK_START} from './r6-program.mjs';
import {interferenceCosts,SEVERITY} from './r6-balanced.mjs';
import {easyPrescription,strengthPrescription,walkPrescription,restrictStrengthSession} from './r6-prescription.mjs';
import {localDate} from './r6-provenance.mjs';
import {onDate,dayGap} from './r6-intake.mjs';

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
export function usedInWeek(week){return week.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>({id:e.id,mode:e.load.mode,value:e.load.value??null,convention:e.load.convention,reps:e.reps,sets:e.sets,rir:e.rir,practice:e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE',date:s.date,session:s.id,...(e.exposure?{kind:e.exposure.kind,baseSets:e.exposure.baseSets??null,normalSets:e.exposure.normalSets??null,phasedSets:e.exposure.phasedSets??null}:{}),...(e.load.nextSetting?{nextSetting:{...e.load.nextSetting}}:{})})));}
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
const easyRun=(sk,s,explanation,extra={})=>{const p=easyPrescription(Math.min(s.prescription.durationMinutes,sk.c.schedule.runMinutes),{cue:sk.op.run.effortCues.EASY_CONVERSATIONAL});return {...s,role:'EASY',key:false,prescription:p,plannedPrescriptionHash:hash(p),explanation,...extra};};
/**
 * Same-week rearrangement among chosen days of the same sport: the coach reallocates content, never the athlete's days. A session keeps its
 * meaning where it moves: never into a day with another phase (taper or race-window days), nor to a date where one of its exercises falls
 * outside the re-establishment window its row was written for (R7-A), nor past a return of this week when it was planned before it (C5), nor
 * into a slot whose session was skipped (an unavailable or event-conflict date), nor to a date where its rows need equipment the athlete
 * has not got then (R7-A.1, QE-R7A1-01). A slot is any session still ahead by the one C1 test; the interference of a move is weighed
 * among the sessions dated after the review, as before.
 */
export function moveCandidates(env,target){
 // D52 is measured from the start the decision plans from (its PlanningView, `base`: the last executed dates), else the week's own start.
 const {program,asOfLocal,w,sk}=env,week=program.weeks[w],phaseOf=s=>dayPhaseOf(sk,w,s.day),st=(env.base??program.stateTrace[w])?.strength?.exercises??{};
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
 * A short return: its slot is the one its break already made easy, else the first quality slot still ahead of its report in the week as it
 * stands (SSCTR R27, D58). The slot runs easy while it is ahead; once it is history nothing else changes. No slot: the week holds none (D58).
 * The slot belongs to its break (R7-A.2 I9): it carries the break's identity, so a newer report of the same break keeps it and a separate
 * break never adopts it. A slot or a fact recorded before R7-A.2 carries none, and the two are read together as before.
 */
const EASY_SLOT='First quality slot after a short break runs easy';
export function shortReturnEasy(env,sessions,a){const ahead=aheadAt(a),own=s=>s.explanation===EASY_SLOT&&(s.easedFor??null)===(a.episode??null),q=sessions.find(own)??sessions.find(s=>s.role==='QUALITY'&&s.prescription&&s.status!=='SKIPPED'&&ahead(s));return {slot:q??null,sessions:q?.role==='QUALITY'&&env.ahead(q)?sessions.map(s=>s===q?easyRun(env.sk,s,EASY_SLOT,a.episode?{easedFor:a.episode}:{}):s):sessions};}
// ---------- V1CP F08 (DR-148): Situation 1 rungs, a sport held and a strength restriction, recorded on the weeks they cover ----------
const restRow=(s,explanation)=>({...(({status,movedTo,...row})=>row)(s),role:'REST_BY_DESIGN',key:false,essential:false,optional:true,prescription:null,progression:null,plannedPrescriptionHash:null,explanation});
const asEasy=(env,s,minutes,explanation)=>{const p=easyPrescription(minutes,{cue:env.sk.op.run.effortCues.EASY_CONVERSATIONAL});return {...s,role:'EASY',key:false,prescription:p,plannedPrescriptionHash:hash(p),explanation};};
const noStrides=(env,s,explanation)=>s.prescription?.strides?asEasy(env,s,s.prescription.durationMinutes,explanation):s;
/** The week's easy-run duration (returnLadder R2, R3): the shortest easy run the week plans, else the easy minutes of its start; never below the
 * minimum session and never above the session it replaces. */
const weekEasy=(env,s,week)=>{const R=env.sk.op.run,easy=week.filter(x=>x.sport==='RUN'&&x.role==='EASY'&&x.prescription).map(x=>x.prescription.durationMinutes),st=env.program?.stateTrace?.[s.weekIndex]?.run?.easy;return Math.min(s.prescription.durationMinutes,Math.max(R.minimumSessionMinutes,easy.length?Math.min(...easy):Number.isFinite(st)?st:R.minimumSessionMinutes));};
const WAIT_TEXT='Waiting for your check: tell us how you are, and your return starts from that day';
/** The operation of each rung on a run (SSCTR-V1CP returnLadder): only existing doses. R4 runs the held doses; its first quality slot runs easy
 * through SHORT_RETURN_EASY (SSCTR R27), recorded with the ladder. The race is never changed here (its handler asks). */
const RUN_RUNGS={
 R0:(env,s)=>restRow(s,'Rest while you are not 100%: no session today, without debt'),
 R1:(env,s)=>{const m=Math.min(env.sk.c.schedule.runMinutes,env.sk.op.establishment.walkSessionMinutes[0]),p=walkPrescription(m,{reason:'Light activity only: an easy walk if you feel like it, while you are not 100%'});return {...s,role:'WALK',key:false,essential:false,optional:true,prescription:p,plannedPrescriptionHash:hash(p),explanation:'Light activity only while you are not 100%: an optional easy walk, never counted as a run'};},
 R2:(env,s,week)=>['QUALITY','RACE_TOUCH','LONG'].includes(s.role)?asEasy(env,s,weekEasy(env,s,week),'Much lighter: an easy run at your easy-run length, no hard work'):noStrides(env,s,'Much lighter: easy effort, no strides'),
 R3:(env,s,week)=>{
  if(['QUALITY','RACE_TOUCH'].includes(s.role))return asEasy(env,s,weekEasy(env,s,week),'Easier: an easy run instead of the harder session');
  if(s.role!=='LONG')return noStrides(env,s,'Easier: easy effort, no strides');
  const R=env.sk.op.run,long=s.prescription.durationMinutes,m=Math.min(long,Math.max(R.minimumSessionMinutes,weekEasy(env,s,week),long-R.consolidationLongRunReductionSteps*R.longRunStepMinutes));
  if(m===long&&!s.prescription.strides)return s;
  const p=easyPrescription(m,{family:s.prescription.family,cue:env.sk.op.run.effortCues.EASY_CONVERSATIONAL});return {...s,prescription:p,plannedPrescriptionHash:hash(p),explanation:'Easier: the long run at its consolidation length, easy effort'};
 },
 R4:(env,s)=>s,
 WAIT:(env,s)=>restRow(s,WAIT_TEXT)
};
const strengthRows=(env,s,rows,instructions)=>{if(!rows.length)return restRow(s,'Nothing of this session fits what you reported; rest without debt');const p=strengthPrescription(s.prescription.family,rows,{budget:env.sk.c.schedule.strengthMinutes,warmup:s.prescription.warmupMinutes,cooldown:s.prescription.cooldownMinutes,secondsPerRep:s.prescription.secondsPerRep,goalMode:s.prescription.goalMode,instructions});return {...s,prescription:p,plannedPrescriptionHash:hash(p)};};
const withExposure=(e,sets)=>({...e,sets,...(e.exposure?{exposure:{...e.exposure,phasedSets:Math.min(e.exposure.phasedSets??e.sets,sets)}}:{})});
const rungWeek=(week,episode)=>(week?.adaptations??[]).some(x=>x.kind==='WELLBEING_REDUCTION'&&x.episode===episode&&['R2','R3','R4'].includes(x.rungs?.STRENGTH));
const EXECUTED=new WeakMap();
const executedBySession=record=>{if(!Array.isArray(record))return new Map();let m=EXECUTED.get(record);if(!m){m=new Map();for(const o of record)if(o&&o.sessionId&&!o.conflicted&&!o.fact)m.set(o.sessionId,o);EXECUTED.set(record,m);}return m;};
/** V1CP Fix-Forward NB-6 (SSCTR-V1CPR-03, QRE-V1CPR-04): the sets of exercise `id` that week `week` executed. A session already history counts
 * what the record shows (its logged sets; the prescribed sets when it is reported done without a per-exercise log; none when not done); a session
 * still ahead counts its prescription, as the conditional plan assumes it executed. An unexecuted prescription is never a step. */
function setsExecutedIn(env,week,id){
 const by=executedBySession(env.fullLedger);let n=0;
 for(const x of week?.sessions??[]){
  if(x.sport!=='STRENGTH'||!x.prescription||x.status==='SKIPPED')continue;
  const row=(x.prescription.exercises??[]).find(e=>e.id===id);if(!row)continue;
  if(!env.elapsed?.(x)){n=Math.max(n,row.sets);continue;}
  const o=by.get(x.id);if(!o||!(o.actual?.completed===true||Number(o.actual?.minutes)>0))continue;
  const logged=(Array.isArray(o.actual?.exercises)?o.actual.exercises:[]).find(e=>e&&e.id===id);
  n=Math.max(n,logged?(Array.isArray(logged.sets)?logged.sets.filter(z=>z&&typeof z==='object').length:0):row.sets);
 }
 return n;
}
/** NB-6: the last count of exercise `id` executed in the episode's rung weeks before week i, scanning back while the weeks are its rungs; null if none. */
function lastExecutedSets(env,weeks,i,id,episode){for(let k=i-1;k>=0&&rungWeek(weeks[k],episode);k--){const n=setsExecutedIn(env,weeks[k],id);if(n>0)return n;}return null;}
/** D49 on every rung (returnLadder.transitionRule): an exercise's sets rise at most one above the last count executed at a rung of the same episode. */
function ladderCap(env,s,a,id){
 const weeks=env.program?.weeks??[],prev=weeks[s.weekIndex-1],m=(prev?.adaptations??[]).some(x=>x.kind==='WELLBEING_REDUCTION'&&x.episode===a.episode&&['R2','R3','R4'].includes(x.rungs?.STRENGTH));
 if(!m)return Infinity;
 const last=lastExecutedSets(env,weeks,s.weekIndex,id,a.episode);
 return last!==null?last+1:Infinity;
}
const ceilingOf=e=>e.load?.mode==='KNOWN'?`never above ${e.load.value} ${String(e.load.unit??'kg').toLowerCase()}, the load you used before`:e.load?.mode==='BODYWEIGHT'?'bodyweight only':'never above the load you used last time';
/** Strength rows at a rung (returnLadder): R2 the return-entry rows (one set, at least the entry reserve, load by effort never above the current
 * one); R3 the consolidation set count at the entry reserve, no step; R4 the held rows; every rung within the D49 cap. */
const STRENGTH_RUNGS={
 R2:(env,s,a,rows)=>rows.map(e=>{const R=env.sk.op.return,rir=Math.max(e.rir,R.strengthEntryMinimumRir);return {...withExposure(e,Math.min(R.strengthEntrySets,ladderCap(env,s,a,e.id))),rir,instructions:[`Much lighter: choose the load by effort, leaving at least ${rir} reps in reserve; ${ceilingOf(e)}`,'Stop the set if technique or how you feel changes']};}),
 R3:(env,s,a,rows)=>rows.map(e=>{const R=env.sk.op.return,S=env.sk.op.strength,rir=Math.max(e.rir,R.strengthEntryMinimumRir);return {...withExposure(e,Math.min(ladderCap(env,s,a,e.id),Math.max(1,e.sets-S.consolidationSetReduction))),rir,instructions:[`Easier: choose the load by effort, leaving at least ${rir} reps in reserve; ${ceilingOf(e)}; no increase this week`,'Stop the set if technique or how you feel changes']};}),
 // R4: the held rows within the D49 cap; reps in reserve never below the goal's start (D1 HIGHER waits until the return completes, C-Q12-2).
 R4:(env,s,a,rows)=>rows.map(e=>{const cap=ladderCap(env,s,a,e.id),start=env.sk.op.strength.goalDoses?.[env.sk.goal?.strength?.kind]?.startRir,rir=Number.isFinite(start)&&Number.isFinite(e.rir)?Math.max(e.rir,start):e.rir,x=cap<e.sets?withExposure(e,cap):e;return rir!==e.rir?{...x,rir}:x;})
};
const RUNG_TEXT={R2:'Much lighter while you get back: fewer sets, more reps in reserve',R3:'Easier while you get back: fewer sets, more reps in reserve, no increase',R4:'Your usual doses again; sets come back one at a time'};
/**
 * V1CP Fix-Forward NB-2 (Founder D3; SSCTR-FF-Q2 (b), C-FF2-1, -2): a race inside a Situation 1 reduction or return that holds running, or inside a
 * readiness restart while running is still returning, stays on the calendar as the athlete's own event: its identity and date are kept, taking part is
 * the athlete's decision, and the coach's recommendation for that day is the rung's operation on a hard session: no session (R0, the wait, or a date
 * that is not one of the run days), the optional walk (R1), an easy run at the week's easy duration (R2, R3, R4, a recipe step, a restart week). Never
 * at race effort and never as a completion.
 */
function raceAsOwnEvent(env,s,rung,week,unwell){
 const runDay=(env.sk?.c?.schedule?.runDays??[]).includes(s.day),why=unwell?'The coach does not plan a race while you are unwell':'During your return the coach plans no racing effort',own='the race stays on your calendar as your own event, and taking part is your decision';
 if(rung==='R0'||rung==='WAIT'||!runDay)return {...s,key:false,essential:false,optional:true,prescription:null,progression:null,plannedPrescriptionHash:null,ownEvent:true,coachRecommendation:'NO_SESSION',explanation:`${why}: ${own}; the coach plans no session that day`};
 if(rung==='R1'){const m=Math.min(env.sk.c.schedule.runMinutes,env.sk.op.establishment.walkSessionMinutes[0]),p=walkPrescription(m,{reason:'Light activity only: an easy walk if you feel like it'});return {...s,key:false,essential:false,optional:true,prescription:p,progression:null,plannedPrescriptionHash:hash(p),ownEvent:true,coachRecommendation:'OPTIONAL_WALK',explanation:`${why}: ${own}; the coach recommends an optional easy walk that day`};}
 const R=env.sk.op.run,easy=week.filter(x=>x.sport==='RUN'&&x.role==='EASY'&&x.prescription).map(x=>x.prescription.durationMinutes),st=env.program?.stateTrace?.[s.weekIndex]?.run?.easy;
 const p=easyPrescription(Math.max(R.minimumSessionMinutes,easy.length?Math.min(...easy):Number.isFinite(st)?st:R.minimumSessionMinutes),{cue:R.effortCues.EASY_CONVERSATIONAL});
 return {...s,key:false,prescription:p,progression:null,plannedPrescriptionHash:hash(p),ownEvent:true,coachRecommendation:'EASY_RUN',explanation:`${why}: ${own}; the coach recommends an easy run at your easy-run length that day`};
}
/** NB-2 (SSCTR-FF-Q2 (b)): the race of `sessions` the marker or restart `a` holds running on that day, if it is still ahead. */
const raceHeld=(env,sessions,from,to)=>sessions.find(s=>s.role==='RACE'&&s.prescription&&s.status!=='SKIPPED'&&env.ahead(s)&&s.date>=from&&(!to||s.date<=to))??null;
/** V1CP F08 Situation 1: the sessions of the affected sports dated inside a marker's days (a window, the wait for the window-end check, a week of
 * the return ladder), by the rung it records for each sport. A region (UPPER or LOWER) limits the strength rung to that region's rows. A race on a
 * day the marker holds running for is the athlete's own event (raceAsOwnEvent); that day keeps no strength, and the race-week touch runs easy. */
export function wellbeingSessions(env,sessions,a){
 const inRange=s=>s.prescription&&s.status!=='SKIPPED'&&env.ahead(s)&&s.role!=='RACE'&&s.date>=a.startDate&&(!a.endDate||s.date<=a.endDate)&&!!a.rungs?.[s.sport];
 const race=a.rungs?.RUN?raceHeld(env,sessions,a.startDate,a.endDate):null;
 return sessions.map(s=>{
  if(race&&s===race)return raceAsOwnEvent(env,s,a.rungs.RUN,sessions,!!a.unwell);
  if(race&&s.sport==='STRENGTH'&&s.date===race.date&&s.prescription&&s.status!=='SKIPPED'&&env.ahead(s))return restRow(s,'Race day keeps no strength while your return holds running');
  if(!inRange(s))return s;
  const rung=a.rungs[s.sport];
  if(s.sport==='RUN'&&s.role==='RACE_TOUCH'&&(rung==='R4'||rung==='M'))return asEasy(env,s,weekEasy(env,s,sessions),'During your return the race-week touch runs easy');
  if(s.sport==='RUN')return RUN_RUNGS[rung]?.(env,s,sessions)??s;
  const all=s.prescription.exercises??[],hit=a.region?all.filter(e=>e.region===a.region):all;
  if(!hit.length)return s;
  if(['R0','R1','WAIT'].includes(rung)){const text=rung==='WAIT'?WAIT_TEXT:'Rest while you are not 100%: no session today, without debt';return hit.length===all.length?restRow(s,text):strengthRows(env,s,all.filter(e=>!hit.includes(e)),[rung==='WAIT'?'Rows of the region you reported wait for your check':'Rows of the region you reported rest while you are not 100%']);}
  const changed=STRENGTH_RUNGS[rung]?.(env,s,a,hit);if(!changed)return s;
  const by=new Map(changed.map(e=>[e.id,e])),rows=all.map(e=>by.get(e.id)??e);
  return hash(rows)===hash(all)?s:strengthRows(env,s,rows,[RUNG_TEXT[rung]]);
 });
}
/** The starts F08 markers fix for week i, per sport in `sports` (returnLadder; SSCTR-V1CP Q07 holds): FIXED (the held pre-window state, or a
 * return recipe's entry, stored with the marker) or REPEAT (the start of the week before). Null when the week fixes none. */
/** SSCTR-V1CPI-02 (I-14 as modified): a fixed strength start keeps the held doses and takes the execution facts (when each exercise was last
 * performed) from the current state, so the clock of D52 moves with the exposures the return weeks hold. */
export function withExecutionFacts(fixed,current){
 const out=clone(fixed);for(const [id,e] of Object.entries(out.exercises??{})){const lp=[e.lastPerformed,current?.exercises?.[id]?.lastPerformed].filter(x=>typeof x==='string').sort().at(-1);if(lp)e.lastPerformed=lp;}
 return out;
}
export function fixedStartOf(weeks,stateTrace,i,sports){
 const out={};
 // V1CP Fix-Forward NB-2 (SSCTR-FF-Q2 (d), I-17): nothing of a pre-race held start passes the race: a week that starts after the race day takes no
 // fixed or repeated start of a reduction, return or restart that began before it; it starts from the plan's own post-race start, the rung's
 // operation still applying to its sessions.
 const race=weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.status!=='SKIPPED');
 const began=ep=>weeks.flatMap(x=>(x.adaptations??[]).filter(z=>['WELLBEING_REDUCTION','RETURN_HOLD'].includes(z.kind)&&z.episode===ep).map(z=>z.startDate??x.startDate)).sort()[0];
 const passed=a=>!!race&&!!weeks[i]&&race.date<weeks[i].startDate&&(began(a.episode)??weeks[i].startDate)<=race.date;
 for(const a of weeks[i]?.adaptations??[])if(['WELLBEING_REDUCTION','RETURN_HOLD'].includes(a.kind)&&a.starts&&!a.endedBy&&!passed(a))for(const [s,rule] of Object.entries(a.starts)){
  if(!sports.includes(s))continue;
  if(rule==='FIXED'&&a.fixed?.[s])out[s]={state:s==='STRENGTH'?withExecutionFacts(a.fixed[s],stateTrace[i]?.strength):clone(a.fixed[s]),a};
  else if(rule==='REPEAT'&&i>0&&stateTrace[i-1])out[s]={state:clone(stateTrace[i-1][s==='RUN'?'run':'strength']),a};
 }
 return Object.keys(out).length?out:null;
}
const stillReturning=(state,s,ref)=>s==='RUN'?state?.run?.mode==='RETURN'||state?.run?.mode==='WALK_JOG'&&Number.isInteger(ref?.walkStep)&&state.run.walkStep<ref.walkStep:state?.strength?.returnEntry===true||Object.values(state?.strength?.exercises??{}).some(e=>Number.isInteger(e.returnStep));
/** V1CP F08 (SSCTR-V1CP Q06: CONSERVATIVE after an 11-14 day window of rest or light activity): each step of the return recipe is held one more
 * executed week while the sport is still returning: after a repeated week, week i is a step week and week i+1 repeats its start. Returns the
 * weeks with those markers added, or null. */
function eachHold(weeks,stateTrace,i,sports){
 if(i+1>=weeks.length)return null;
 const prev=(weeks[i-1]?.adaptations??[]).find(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&a.each&&!a.endedBy);if(!prev)return null;
 let out=weeks;
 const mine=(k,s)=>(out[k].adaptations??[]).find(a=>a.kind==='WELLBEING_REDUCTION'&&a.episode===prev.episode&&a.phase==='LADDER'&&(!s||a.rungs?.[s]));
 const add=sports.filter(s=>prev.starts?.[s]==='REPEAT'&&prev.rungs?.[s]==='M'&&!mine(i,s)&&stillReturning(stateTrace[i],s,prev.ref));
 if(!add.length)return null;
 out=weeks.map(x=>x);
 const put=(k,s,start)=>{const x=out[k],m=mine(k,null),base=m?clone(m):(({starts,fixed,...p})=>({...clone(p),startDate:x.startDate,endDate:onDate(x.startDate,6),rungs:{},hold:{},step:(prev.step??0)+(k-i+1)}))(prev);
  const n={...clone(base),rungs:{...base.rungs,[s]:'M'},hold:{...base.hold,[s]:!start},...(start?{starts:{...(base.starts??{}),[s]:start}}:{})};out[k]={...x,adaptations:[...(x.adaptations??[]).filter(a=>a!==m),n]};};
 for(const s of add){put(i,s,null);put(i+1,s,'REPEAT');}
 return out;
}
/** V1CP F08 (SSCTR-V1CP returnLadder.transitionRule, QRE-V1CP-05): strength sets come back at most one set per executed week whatever the rung, so
 * when week i, after an episode's last held strength week (R4), would add more than one set to an exercise, week i is one more held week (the
 * R4 cap applies again). Returns the weeks with that marker, or null. */
function d49Hold(weeks,i,sports,env={}){
 if(!sports.includes('STRENGTH'))return null;
 const prev=(weeks[i-1]?.adaptations??[]).find(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy&&a.rungs?.STRENGTH==='R4'&&a.fixed?.STRENGTH);if(!prev)return null;
 if((weeks[i].adaptations??[]).some(a=>a.kind==='WELLBEING_REDUCTION'&&a.episode===prev.episode&&!a.endedBy&&a.rungs?.STRENGTH))return null;
 const sets=w=>{const o={};for(const s of w.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription&&x.status!=='SKIPPED'))for(const e of s.prescription.exercises??[])o[e.id]=Math.max(o[e.id]??0,e.sets);return o;};
 // NB-6: compared with the last count executed at a rung of the episode (the record), the plan only for weeks still ahead.
 const a=sets(weeks[i-1]),b=sets(weeks[i]);if(!Object.keys(b).some(id=>{const last=lastExecutedSets(env,weeks,i,id,prev.episode)??a[id];return last!==undefined&&b[id]>last+1;}))return null;
 const out=weeks.map(x=>x),x=out[i],m=(x.adaptations??[]).find(z=>z.kind==='WELLBEING_REDUCTION'&&z.episode===prev.episode&&z.phase==='LADDER'&&!z.endedBy);
 const base=m?clone(m):(({starts,fixed,each,ref,...p})=>({...clone(p),startDate:x.startDate,endDate:onDate(x.startDate,6),rungs:{},hold:{},step:(prev.step??0)+1}))(prev);
 const n={...base,rungs:{...base.rungs,STRENGTH:'R4'},hold:{...base.hold,STRENGTH:false},starts:{...(base.starts??{}),STRENGTH:'FIXED'},fixed:{...(base.fixed??{}),STRENGTH:clone(prev.fixed.STRENGTH)},d49:true};
 out[i]={...x,adaptations:[...(x.adaptations??[]).filter(z=>z!==m),n]};
 out[i-1]={...out[i-1],adaptations:out[i-1].adaptations.map(z=>z===prev?{...z,hold:{...z.hold,STRENGTH:true}}:z)};
 return out;
}
/** The authority of a fixed start: a return's entry, by the decision that recorded the marker; a sport it does not fix keeps its own. */
const fixedAuthority=(f,other)=>startAuthority(Object.fromEntries(SPORTS.map(x=>[x,f[x]?{provenance:WEEK_START.RETURN_ENTRY,eventId:f[x].a.eventId??null,evidenceThrough:f[x].a.asOf??null}:other?.[x]??null])));
/** V1CP Fix-Forward NB-2 (SSCTR-FF-Q2 (a), (b)): inside a readiness restart while running is still returning (run mode RETURN or RESTART), the race
 * is the athlete's own event and the coach's recommendation is an easy run at the restart week's easy duration; the race-week touch runs easy and race
 * day keeps no strength. Outside the restart's running return the race follows the event rules. */
function restartRaceSessions(env,sessions,a){
 if(!['RETURN','RESTART'].includes(env.program?.stateTrace?.[env.w]?.run?.mode))return sessions;
 const live=s=>s.prescription&&s.status!=='SKIPPED'&&env.ahead(s)&&s.date>=a.from&&(!a.endDate||s.date<=a.endDate),race=raceHeld(env,sessions.filter(live),a.from,a.endDate);
 return sessions.map(s=>{
  if(race&&s===race)return raceAsOwnEvent(env,s,'RESTART',sessions,false);
  if(race&&s.sport==='STRENGTH'&&s.date===race.date&&live(s))return restRow(s,'Race day keeps no strength while running is restarting');
  if(s.sport==='RUN'&&s.role==='RACE_TOUCH'&&live(s))return asEasy(env,s,weekEasy(env,s,sessions),'While running is restarting the race-week touch runs easy');
  return s;
 });
}
/** V1CP F08 Situation 2: a sport the athlete has not declared ready stays held: its sessions from the decision on are rest, without debt. */
export const heldSportSessions=(env,sessions,a)=>sessions.map(s=>s.prescription&&s.status!=='SKIPPED'&&env.ahead(s)&&s.sport===a.sport&&s.role!=='RACE'&&s.date>=a.from?restRow(s,'Held: you have not told us you are ready for this sport yet; tell us when you are'):s);
/** V1CP F08 Situation 2: a restriction from the closed vocabulary is a hard cap: strength rows of the restricted region are left out, never
 * replaced by a load from another exercise (RC-09). A session left with no row is rest. */
export const restrictedSessions=(env,sessions,a)=>sessions.map(s=>s.prescription&&s.status!=='SKIPPED'&&env.ahead(s)&&s.sport==='STRENGTH'&&s.date>=a.from?restrictStrengthSession(s,a.regions??[],{budget:env.sk.c.schedule.strengthMinutes}):s);
/** Applies a recorded adaptation again to a re-planned week, with its own clock (C4); {ask} when the new plan contradicts it. */
function reapply(env,sessions,a){
 const own=aheadAt(a),e={...env,asOfLocal:a.asOfLocal,ahead:s=>env.ahead(s)&&own(s)};
 if(a.kind==='WELLBEING_REDUCTION')return {sessions:wellbeingSessions(e,sessions,a)};
 if(a.kind==='RACE_IN_RETURN')return {sessions:restartRaceSessions(e,sessions,a)};
 if(a.kind==='SPORT_HELD')return {sessions:heldSportSessions(e,sessions,a)};
 if(a.kind==='STRENGTH_RESTRICTION')return {sessions:restrictedSessions(e,sessions,a)};
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
 for(const a of moved.size?program.weeks[w].adaptations??[]:[]){if(a.kind==='MISSED_SESSION')continue;const r=reapply({...ctx,program:withWeek(program,w,out),sk:ctx.skw??ctx.sk,w,ahead:s=>moved.has(s.id)&&ctx.ahead(s),elapsed:s=>!ctx.ahead(s)},out,a);if(!r.ask)out=r.sessions;}
 return {weeks:program.weeks.map((x,i)=>i!==w?x:{...clone(x),sessions:out,adaptations:[...(x.adaptations??[]),fact]}),stateTrace:program.stateTrace};
}
/** The fact an adaptation records: its kind, its review, its clock, the sessions of its day already past then, and what it needs to apply again. */
export const adaptation=(ctx,kind,facts={})=>({kind,eventId:ctx.review.event.id,asOf:ctx.asOf,asOfLocal:ctx.asOfLocal,past:(ctx.program.weeks[ctx.w]?.sessions??[]).filter(s=>s.date===ctx.asOfLocal&&!ctx.ahead(s)).map(s=>s.id),...facts});
// ---------- context (C2) ----------
const CONTEXT=['canonical','goal','phases','blocks','templates','noviceTemplates','arrangementSessions'];
const contextOf=x=>Object.fromEntries(CONTEXT.map(k=>[k,x[k]]));
/**
 * C2: a change of the context from week j. Every context in force from j on gets it (`apply(context, firstWeek, j)`, which may return {ask});
 * the part of an earlier context before j stays in force before j (`contextBefore`). Contexts that only cover past weeks are kept too (state
 * model): they are the plan those weeks were executed under, by which the evidence reducer judges their evidence, so no later change rewrites
 * what an earlier week earned (I1, P3). The planner never reads them: it never re-plans a past week.
 */
export function withContextChange(ctx,program,j,apply){
 const before=program.contextBefore??[],segments=[...before.map((e,i)=>({from:i?before[i-1].untilWeek:0,until:e.untilWeek,context:contextOf(e)})),{from:before.at(-1)?.untilWeek??0,until:Infinity,context:contextOf(program)}],out=[];
 for(const s of segments){
  if(s.until<=j){out.push(s);continue;}
  if(s.from<j)out.push({...s,until:j});
  const changed=apply(s.context,Math.max(s.from,j),j);if(changed?.ask)return changed;
  out.push({from:Math.max(s.from,j),until:s.until,context:changed});
 }
 const top=out.at(-1).context,kept=out.slice(0,-1).map(s=>({untilWeek:s.until,...s.context}));
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
/** Week w as now planned, with its start: the plan of the week from its start state under its context, merged with what it keeps (C1, C2, C6).
 * The decision's own week starts from the decision's PlanningView (`ctx.base`, state model), never from the stored projection's start. */
export function weekAsPlanned(ctx,next,w,{start=null,sports=SPORTS,completedRuns=ctx.completedRuns??[]}={}){
 const st0=w===ctx.w&&ctx.base?ctx.base:next.stateTrace[w],sk=skeletonOf(next,ctx.authority),base=projectWeeks(sk,w,start??{runState:st0.run,strengthState:st0.strength},next.weeks.slice(0,w),{completedRuns,toWeek:w+1});
 const week={...base.weeks[0],sessions:mergeRows(ctx,next,w,base.weeks[0].sessions,sports)};
 // The week's planned counts are those before the time fit, as the projection records them (one reading of the week, QE-R7A-14).
 return {week,state:{run:{...base.states[0].run,planned:plannedOf(week)},strength:{...base.states[0].strength,planned:plannedStrengthOf(usedInWeek(week).map(u=>({...u,sets:u.phasedSets??u.sets})))}}};
}
/**
 * Declared interruptions in force (each episode's latest report; a superseded report's days are not the athlete's statement any more), with their
 * days read as the return engine reads them: a report recorded without dates ended the day before it and lasted its stated days (breakOf).
 */
function declaredPauses(next){
 const tz=next.timezoneOffsetMinutes??0,reports=next.decisions.filter(d=>d.action==='REESTABLISH'),gone=new Set(reports.map(d=>d.interruption?.supersedes).filter(Boolean));
 const daysOf=d=>{const i=d.interruption??{},end=i.endDate??onDate(localDate(d.asOf,tz),-1);return {start:i.startDate??onDate(end,-((i.days??1)-1)),end};};
 return reports.filter(d=>!gone.has(d.eventId)).map(daysOf);
}
/**
 * R7-C G01, unknown is neither executed-success nor executed-failure. The first week a decision plans takes its single-run ceiling from the runs
 * completed in the window before it (policy run.singleRunCeiling); with none known there, the policy's reviewed entry is the ceiling. That entry
 * reads a known stop (every run session there reported as not done, or inside a declared interruption) correctly, but it reads training that is
 * only unreported as zero (CQ-R6-04, SSCTR R18 run side). So when the entry would trim a run the start plans, and an elapsed run session of the
 * window has no report at all (whether or not a review closed its week) outside a declared interruption, the decision cannot be made safely: it
 * asks (typed and neutral about G03: the athlete's report of the sessions, or of the break and its reason, decides) and plans nothing, neither
 * the entry dose (a zero reading) nor a projected dose (credit). `declared` are interruptions the deciding review itself declares. Null otherwise.
 */
function unknownRunWindow(ctx,next,fromWeek,{first,completedRuns,start,sports,declared=[]}){
 const startDate=next.weeks[fromWeek]?.startDate,C=ctx.authority.policy.operational.run.singleRunCeiling;
 // A return, restart or walk/jog start re-enters from the reviewed entry by its own recipe (R6-NONCLINICAL-RETURN, the ladder): there the entry
 // ceiling only confirms that recipe. Easy running resumes or continues earlier doses, which the entry would collapse.
 if(!startDate||!sports.includes('RUN')||first.state.run.mode!=='EASY')return null;
 const inWindow=d=>dayGap(d,startDate)>0&&dayGap(d,startDate)<=C.windowDays;
 if(completedRuns.some(h=>inWindow(h.date)))return null;
 const pauses=[...declaredPauses(next),...declared];
 const record=ctx.fullLedger??ctx.ledger??[],reported=new Set(record.map(o=>o.sessionId)),ahead=aheadOf(ctx);
 const unknown=ctx.program.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&inWindow(s.date)&&!ahead(s)&&!reported.has(s.id)&&!pauses.some(p=>s.date>=p.start&&s.date<=p.end)).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
 if(!unknown.length)return null;
 // Whether the dose depends on them. (1) The entry trims a run: the same week planned with no ceiling binding (a reference beyond any run)
 // against the week as planned. (2) R7-C P3-01: taper and race-window runs are derived from the executed peaks (`achieved`), not from the
 // ceiling, so with the window unreported an empty peak plans them as never run (the minimum easy run, no long run, quality or touch) and the
 // entry trims nothing; the same week planned with the window's unreported sessions counted as run as prescribed shows whether they decide it.
 // A run whose prescription the peaks do not change (the days after the race, say) does not depend on them and is not asked about.
 // (3) R7-D (QRE-P4-F01): the progression state, see creditDecides.
 const free=weekAsPlanned(ctx,next,fromWeek,{start,sports,completedRuns:[...completedRuns,{date:onDate(startDate,-1),minutes:Infinity}]});
 const minutes=wk=>new Map(wk.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>[s.id,runMinutesOf(s)]));
 const capped=minutes(first.week),uncapped=minutes(free.week);
 if(![...capped].some(([id,m])=>m<(uncapped.get(id)??m))&&!peaksDecide(ctx,next,fromWeek,{free,start,sports,completedRuns,unknown,startDate})&&!creditDecides(ctx,next,fromWeek,{capped,sports,completedRuns,unknown}))return null;
 const ran=record.filter(o=>!o.conflicted&&o.context?.sport==='RUN'&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)).sort((a,b)=>a.localDate<b.localDate?-1:a.localDate>b.localDate?1:0).at(-1);
 const from=unknown[0].date,through=unknown.at(-1).date,n=unknown.length;
 return {ask:`No run is recorded in the ${C.windowDays} days before ${startDate}, the reference for the runs planned from then, and ${n} planned run session${n>1?'s':''} from ${from} to ${through} ha${n>1?'ve':'s'} no report: say what was done (report the sessions) or that training stopped (the break and its reason) before runs are planned; training that is only unreported counts neither as done nor as not done`,
  missingInputs:['observations.unreportedSessions|interruption'],
  question:{kind:'UNREPORTED_TRAINING',dependentScope:'RUN_DOSE',fromWeek,referenceWindow:{from:onDate(startDate,-C.windowDays),through:onDate(startDate,-1)},unreported:{from,through,sessionIds:unknown.map(s=>s.id)},lastRecordedRun:ran?{date:ran.localDate,sessionId:ran.sessionId}:null}};
}
/**
 * R7-D (QRE-P4-F01): whether the week's runs depend on the window's unreported run sessions through the progression state. The start the facts give
 * holds an unreported week at its dose (no step without executed evidence): the zero reading of unknown training, already inside both readings of
 * test (1). The plan's projection, every planned session assumed executed, is the credit reading. The same week planned from the start the
 * projection holds for it, with the window's unreported runs counted as run as prescribed (they set its ceiling), against the week as planned
 * now: when that week plans any run longer, the dose depends on what the athlete did, whatever the week's phase or dose. A consolidation, deload or
 * event week that its phase plans short in the zero reading no longer hides the dependence (an entry that trims nothing); a week both readings plan
 * alike does not depend on the unknown and is not asked about. Only a projected start (CONDITIONAL_PLAN) is that credit: a start a decision anchored
 * on evidence (the intake, a review's week evidence, a return's entry on its interruption's facts and current demonstration, which the record does
 * not keep) assumed nothing about the unreported sessions. A projection held in another mode is not a credit of easy running and is not read.
 */
function creditDecides(ctx,next,fromWeek,{capped,sports,completedRuns,unknown}){
 const st=next.stateTrace[fromWeek];if(next.weeks[fromWeek]?.startAuthority?.RUN?.provenance!==WEEK_START.CONDITIONAL_PLAN||st?.run?.mode!=='EASY'||!st.strength)return false;
 const counted=[...completedRuns,...unknown.map(s=>({date:s.date,minutes:runMinutesOf(s)})).filter(x=>x.minutes>0)];
 const credit=weekAsPlanned(ctx,next,fromWeek,{start:{runState:st.run,strengthState:st.strength},sports,completedRuns:counted});
 return credit.week.sessions.some(s=>s.sport==='RUN'&&s.prescription&&capped.has(s.id)&&capped.get(s.id)<runMinutesOf(s));
}
/**
 * R7-C P3-01: whether the week's runs derived from the executed peaks depend on the window's unreported run sessions. The peaks are counted as the
 * evidence reducer counts an executed week (advanceRun): a long run its minutes, an easy run its minutes and strides, a quality session (never
 * the familiar bouts) its work, the latest one standing. Both readings plan the week with no ceiling binding (`free`: run sessions would also
 * have set the ceiling), so the comparison isolates the peaks. Only the event-week rules read the peaks, so any other week is unchanged by them.
 */
function peaksDecide(ctx,next,fromWeek,{free,start,sports,completedRuns,unknown,startDate}){
 const st0=fromWeek===ctx.w&&ctx.base?ctx.base:next.stateTrace[fromWeek],s0=start??{runState:st0.run,strengthState:st0.strength};
 const peaks=clone(s0.runState.achieved??{long:null,easy:null,quality:null,strides:0});
 for(const s of unknown){
  const p=s.prescription;
  if(s.role==='LONG')peaks.long=Math.max(peaks.long??0,p.durationMinutes);
  else if(s.role==='EASY'){peaks.easy=Math.max(peaks.easy??0,p.durationMinutes);peaks.strides=Math.max(peaks.strides??0,p.strides?.repetitions??0);}
  else if(s.role==='QUALITY'&&p.work&&p.family!=='FAMILIAR_REPEATED_BOUTS')peaks.quality={family:p.family,work:clone(p.work)};
 }
 const run=wk=>new Map(wk.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>[s.id,hash(s.prescription)]));
 const counted=weekAsPlanned(ctx,next,fromWeek,{start:{...s0,runState:{...s0.runState,achieved:peaks}},sports,completedRuns:[...completedRuns,{date:onDate(startDate,-1),minutes:Infinity}]});
 const was=run(free.week);
 return [...run(counted.week)].some(([id,h])=>was.has(id)&&was.get(id)!==h);
}
/**
 * R7-C P3-02: the unreported training in force at a decision, read on the canonical factual state before any handler decides. The decision's own
 * week, planned from its PlanningView with its run sessions still ahead: when unknownRunWindow asks for them, no run dose still ahead can be kept
 * or planned from the facts. The stored doses were planned on execution assumed for sessions that have no report (a projection: credit), and the
 * facts alone read that window as zero. The question is the one the weekly review asks for this week. Null when this week has no run session
 * still ahead, when the facts decide its doses, or when nothing is unreported.
 */
export function runGapInForce(ctx){
 const {program,w}=ctx;if(!program.weeks[w])return null;
 const first=weekAsPlanned(ctx,program,w);
 return unknownRunWindow(ctx,program,w,{first,completedRuns:ctx.completedRuns??[],start:null,sports:SPORTS});
}
/**
 * R7-C QE-R7C-01: the run sessions still ahead in the decision's week whose dose exceeds the single-run ceiling the facts allow (policy
 * run.singleRunCeiling: the longest run completed in the window before the week plus the step, or the reviewed entry when none is), read on the
 * completed-work record as it stands, whichever decision recorded it, when that excess can only rest on credit: the window holds run sessions of
 * this plan with no executed report (unreported, or reported not done) outside a declared interruption, which a projection counted as executed.
 * The scope is the unknown window's (unknownRunWindow): easy running; a return, restart or walk/jog week follows its own re-entry recipe; a return
 * report decides its own re-entry from the break it declares (a known stop the record does not hold yet; the gap guard lets it through too). A week
 * whose run start is a return's entry is not read here either: it stands on the interruption's facts with its current demonstration, which the
 * record does not keep. (The first week, on the intake, has no session of this plan before it, so nothing there was credited.) Null when every
 * dose ahead fits; the race is outside the ceiling.
 */
export function aboveFactsCeiling(ctx){
 const {program,w}=ctx,week=program.weeks[w];if(!week)return null;
 if(ctx.kind==='RETURN_AFTER_PAUSE'||week.startAuthority?.RUN?.provenance===WEEK_START.RETURN_ENTRY||(ctx.base??program.stateTrace[w])?.run?.mode!=='EASY')return null;
 const op=ctx.authority.policy.operational,C=op.run.singleRunCeiling,start=week.startDate,ahead=aheadOf(ctx),inWindow=d=>dayGap(d,start)>0&&dayGap(d,start)<=C.windowDays;
 const recent=(ctx.completedRuns??[]).filter(h=>inWindow(h.date)).map(h=>h.minutes);
 const ceiling=recent.length?Math.max(...recent)+C.stepMinutes:op.return.entryRunMinutes;
 const over=week.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&ahead(s)&&runMinutesOf(s)>ceiling);
 if(!over.length)return null;
 const executed=new Set((ctx.fullLedger??ctx.ledger??[]).filter(o=>!o.conflicted&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)).map(o=>o.sessionId)),pauses=declaredPauses(program);
 const credited=program.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&s.status!=='SKIPPED'&&runMinutesOf(s)>0&&inWindow(s.date)&&!ahead(s)&&!executed.has(s.id)&&!pauses.some(p=>s.date>=p.start&&s.date<=p.end));
 return credited.length?{ceiling,sessionIds:over.map(s=>s.id),credited:credited.map(s=>s.id)}:null;
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
 * Each placed week records the authority of its start (R7-A boundary closure; state evidence, historicalView): a start the caller sets carries
 * its own (`startAuthority`); a start kept keeps its own; the next week's start from this week's evidence is WEEK_EVIDENCE, by this decision,
 * naming the values it carried from a projection (`projectedBase`); every conditional transition is CONDITIONAL_PLAN, with the rows it
 * assumed executed, per sport and per strength exercise; a sport outside `sports` keeps the authority of its part.
 */
export function composeWeeks(ctx,next,options){
 const placed=composeFrom(ctx,next,options);if(placed.ask)return placed;
 // V1CP F08 (SSCTR-V1CP returnLadder, Q07): a later week whose start a Situation 1 return or a readiness restart's hold fixes, for a sport in scope,
 // is placed again from that start, so no projection carries a step into it (every handler re-plans through here, so every re-plan keeps it).
 const sports=options.sports??SPORTS,N=placed.weeks.length;
 const record={fullLedger:ctx.fullLedger??ctx.ledger??[],elapsed:(a=>s=>!a(s))(aheadOf(ctx))};
 for(let i=options.fromWeek+1;i<N;i++){const ext=eachHold(placed.weeks,placed.stateTrace,i,sports)??d49Hold(placed.weeks,i,sports,record);if(ext)placed.weeks=ext;const f=fixedStartOf(placed.weeks,placed.stateTrace,i,sports);if(!f)continue;
  const s0=placed.stateTrace[i],by={eventId:ctx.review?.event?.id??null,asOf:ctx.asOf??null};
  return composeWeeks(ctx,{...next,weeks:placed.weeks,stateTrace:placed.stateTrace},{...options,fromWeek:i,start:{runState:f.RUN?.state??clone(s0.run),strengthState:f.STRENGTH?.state??clone(s0.strength)},startAuthority:fixedAuthority(f,projectedStart(placed.weeks[i-1],by)),returnDay:null,evidence:null,uncredited:[],ownStart:true});}
 return placed;
}
function composeFrom(ctx,next,{fromWeek,start=null,startAuthority:startAuth=null,sports=SPORTS,completedRuns=ctx.completedRuns??[],returnDay=null,evidence=null,declared=[],uncredited=[],ownStart=false}){
 // V1CP F08: this week's own fixed start (a weekly review's evidence start, a re-plan's PlanningView) gives way to the start a marker fixes for it.
 const f0=!ownStart&&fromWeek>=ctx.w?fixedStartOf(next.weeks,next.stateTrace,fromWeek,sports):null;
 if(f0){const s0=start??{runState:clone(next.stateTrace[fromWeek].run),strengthState:clone(next.stateTrace[fromWeek].strength)};start={runState:f0.RUN?.state??s0.runState,strengthState:f0.STRENGTH?.state??s0.strengthState};startAuth=fixedAuthority(f0,startAuth??next.weeks[fromWeek].startAuthority);}
 const {w,authority}=ctx,ahead=aheadOf(ctx),sk=skeletonOf(next,authority),at=i=>sk.at(i)??sk,N=sk.c.weeks,inScope=s=>sports.includes(s.sport),all=sports.length===SPORTS.length,fresh=s=>ahead(s)&&inScope(s);
 // A short return's easy slot not found in its week, carried to the next week placed (D58), each with its own break (R7-A.2 I9). So is one
 // that the week before the first week placed, this week or later, no longer holds (a later change of that week skipped or replaced it); it
 // leaves that week.
 const prior=fromWeek>w?next.weeks[fromWeek-1]:null,held=(prior?.adaptations??[]).filter(a=>a.kind==='SHORT_RETURN_EASY'&&!shortReturnEasy({ahead:()=>false},prior.sessions,a).slot);
 let carry=[...held];
 // The return of a week: the one this composition re-plans for (its own clock), else one recorded earlier (C5).
 const returned=i=>i===w&&returnDay?{day:returnDay,asOf:ctx.asOf}:returnOf(next,i);
 // The weeks between next week and a later fromWeek stay as planned: earlier weeks of the conditional plan count as executed for the run
 // ceiling, as a projection from next week counts them (policy run.singleRunCeiling; C3), and fromWeek starts from the week before it as
 // planned, its transition under fromWeek's own context (C2: the transition into a week follows that week's context).
 const executedOr=i=>[...completedRuns,...next.weeks.slice(w+1,Math.max(w+1,i)).flatMap(runsOf)];
 const by={eventId:ctx.review?.event?.id??null,asOf:ctx.asOf??null};
 // A later fromWeek starts from this week's PlanningView carried through the weeks between as planned (each assumed executed: a projection of
 // the future), so no stored start made before this decision's facts is read (state model).
 if(!start&&fromWeek>w+1){let s=null,before=null;for(let k=w;k<fromWeek;k++){before=weekAsPlanned(ctx,next,k,{start:s,sports,completedRuns:executedOr(k)});s=conditionalNext(ctx,at(k+1),k,before,k===w?returnOf(next,k):null);}start=s;startAuth=projectedStart(before.week,by);}
 completedRuns=executedOr(fromWeek);
 const own=(i,state)=>all?state:{run:sports.includes('RUN')?state.run:next.stateTrace[i].run,strength:sports.includes('STRENGTH')?state.strength:next.stateTrace[i].strength};
 const ownAuthority=(i,auth)=>all?auth:startAuthority({RUN:sports.includes('RUN')?auth?.RUN:next.weeks[i].startAuthority?.RUN,STRENGTH:sports.includes('STRENGTH')?auth?.STRENGTH:next.weeks[i].startAuthority?.STRENGTH});
 const totals=(i,sessions)=>{const t=weekSummary(sessions);return all?t:{...t,plannedRunMinutes:next.weeks[i].plannedRunMinutes,restDays:next.weeks[i].restDays};};
 const weeks=next.weeks.slice(0,fromWeek),stateTrace=next.stateTrace.slice(0,fromWeek);
 if(held.length){const left=prior.adaptations.filter(a=>!held.includes(a));weeks[fromWeek-1]={...prior};if(left.length)weeks[fromWeek-1].adaptations=left;else delete weeks[fromWeek-1].adaptations;}
 // Places week i: its rows as planned, then its recorded adaptations applied again; {ask} when the new plan contradicts one.
 const place=(i,rows,state,auth)=>{
  const merged=mergeRows(ctx,next,i,rows,sports),planned={...weeks[i]??{},sessions:merged,...totals(i,merged),startAuthority:ownAuthority(i,auth)};weeks[i]=planned;stateTrace[i]=own(i,state);
  const list=[];let sessions=merged;
  for(const a of [...(next.weeks[i].adaptations??[]),...carry]){
   const env={program:{...next,weeks:weeks.map((x,k)=>k===i?{...x,sessions}:x),stateTrace},sk:at(i),w:i,ahead:fresh,authority,returned:returned(i),fullLedger:ctx.fullLedger??ctx.ledger??[],elapsed:s=>!ahead(s)},r=reapply(env,sessions,a);if(r.ask)return r;
   // A short return's easy slot that this week does not hold moves on to the next week placed (SSCTR D58).
   if(a.kind==='SHORT_RETURN_EASY'){carry=carry.filter(x=>x!==a);if(!r.slot){carry.push(a);continue;}}
   list.push(a);sessions=r.sessions;
  }
  if(list.length)weeks[i]={...planned,sessions,adaptations:clone(list)};else if(next.weeks[i].adaptations)weeks[i]={...planned,sessions};
  if(next.weeks[i].startBeforeReturn)weeks[i]={...weeks[i],startBeforeReturn:clone(next.weeks[i].startBeforeReturn),...('startBeforeReturnAuthority' in next.weeks[i]?{startBeforeReturnAuthority:clone(next.weeks[i].startBeforeReturnAuthority)}:{})};
  return {};
 };
 const first=weekAsPlanned(ctx,next,fromWeek,{start,sports,completedRuns});
 const unknown=unknownRunWindow(ctx,next,fromWeek,{first,completedRuns,start,sports,declared});if(unknown)return unknown;
 weeks[fromWeek]=first.week;const p0=place(fromWeek,first.week.sessions,first.state,start?startAuth:next.weeks[fromWeek].startAuthority);if(p0.ask)return p0;
 if(fromWeek+1>=N)return {weeks,stateTrace,sk};
 const skn=at(fromWeek+1),rebased=fromWeek===w&&!start?rebasedNext(next,w):null,fromEvidence=!rebased&&fromWeek===w&&!ctx.ev?.pending&&!!evidence;
 // R7-C SSCTR-SD5-01 / QE-R7C-02 (C9): sessions of this week that elapsed with no report (`uncredited`, from a factual re-plan) are unknown: the
 // conditional plan of the weeks after it never counts them as executed, for the transition or for the single-run ceiling.
 const credited=uncredited.length?{...first,week:{...first.week,sessions:first.week.sessions.filter(s=>!uncredited.includes(s.id))}}:first;
 const nextStart=rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:fromEvidence?evidence({...next,weeks,stateTrace},skn):conditionalNext(ctx,skn,fromWeek,credited,returned(fromWeek));
 const nextAuthority=rebased?next.weeks[fromWeek+1].startAuthority:fromEvidence?anchoredStart(WEEK_START.WEEK_EVIDENCE,by):projectedStart(first.week,by);
 // R7-D Phase 3.4 (SSCTR-P34-F01): the single-run ceiling of the weeks after a return's own week counts that week's runs as the conditional plan
 // counts them for the transition (conditionalNext; C3, C5): the sessions dated before the return belong to the plan before the break and are no
 // projection, so they never count as executed (policy run.singleRunCeiling: completed runs, and earlier projected weeks); the ones the athlete
 // executed are in the completed-work ledger already.
 const beforeRet=beforeReturn(next,returned(fromWeek)),projected={...credited.week,sessions:credited.week.sessions.filter(s=>!beforeRet(s))};
 const rest=projectWeeks(sk,fromWeek+1,nextStart,[...next.weeks.slice(0,fromWeek),first.week],{completedRuns:[...completedRuns,...runsOf(projected)]});
 for(const [k,wk] of rest.weeks.entries()){weeks[fromWeek+1+k]=wk;const r=place(fromWeek+1+k,wk.sessions,rest.states[k],k===0?nextAuthority:projectedStart(rest.weeks[k-1],by));if(r.ask)return r;}
 return {weeks,stateTrace,sk};
}
