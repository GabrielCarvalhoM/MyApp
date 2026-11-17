// The synthetic athlete and the athlete's own reports, built with the CoachingCore test builders (reused, not restated). No training rule here:
// a report says what a synthetic athlete did, as prescribed, and the engine decides what follows.
import {hybrid,report as strengthReport,live,addDays} from '../../../CoachingCore/test/v1str-helpers.mjs';
import {ELIG,result,report as runReport} from '../../../CoachingCore/test/v1rc-helpers.mjs';
import {asPrescribed} from '../../../CoachingCore/test/v1rws-helpers.mjs';
export {ELIG,live,addDays};

/** Athlete A: hybrid, 10 km race at the end of a 12-week plan, RUNNING_SUPPORT strength twice a week, one current official 10 km result. */
export function athleteA({weeks=12,id='aif-athlete-a'}={}){
 const i=hybrid({weeks,id});i.athlete.performanceAnchors=[result('10K',3000,'2026-11-01')];return i;
}
/** The report of one live session as the synthetic athlete did it: a run as prescribed (native by its distance or laps, else by its minutes at an
 * easy effort), a strength session at the prescribed sets, reps and reserve. `tag` keeps event ids unique per plan. */
export function reportOf(env,s,{tag='',response={}}={}){
 const p=env.program,runs=env.presentation?.runSessions??{};
 if(s.sport==='RUN'){const o=asPrescribed({p,runs},s),r=o?.eventId?o:runReport(p,s,o);return {...r,eventId:`aif${tag}-${s.id}`,response:{...r.response,...response}};}
 const r=strengthReport(p,s);return {...r,eventId:`aif${tag}-${s.id}`,response:{...r.response,...response}};
}
export const liveSessions=(env,w)=>env.program.weeks[w].sessions.filter(live);
export const at=(day,time='20:00')=>`${day}T${time}:00-03:00`;
/** The sessions of the plan in force already reported. Session ids repeat across plans (w0-run-d1 in every plan), so "already reported" is
 * scoped to the plan's own dates: a row of an earlier plan never stands for a session of this one (client side; the engine's side is the
 * open Restart gate). */
export const reportedInPlan=env=>new Set(env.actualLedger.filter(o=>!o.fact&&!o.superseded&&String(o.occurrenceDate??'')>=env.program.startDate).map(o=>o.sessionId));
/** The Sunday review of week w: every live session not yet on record reported as done. */
export function weekFacts(env,w,{tag=''}={}){
 const day=addDays(env.program.startDate,w*7+6),onRecord=reportedInPlan(env);
 return {asOf:at(day),facts:{eligibility:ELIG(day),observations:liveSessions(env,w).filter(s=>!onRecord.has(s.id)).map(s=>reportOf(env,s,{tag}))}};
}
const NO_SIGNS={feverOrChills:false,chestPainPressureOrTightness:false,breathlessAtRest:false,palpitationsAtRest:false,faintingOrDizziness:false,painThatChangesMovement:false,swelling:false,injuryFromFallOrImpact:false,
 gettingWorse:false,bodyWideAches:false,exhaustionAtRest:false,vomitingDiarrhoeaNauseaOrAbdominalPain:false,moderateOrSevereCough:false,severeHeadache:false,severeNoseOrThroat:false};
/** "Not 100%" with one warning sign (the V1CIB fixture 13 shape): V1 screens it and holds. */
export const notFeeling100WithSign=day=>({eligibility:ELIG(day),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO_SIGNS,swelling:true},intent:'REST',days:4}});
/** The readiness declaration after a hold (the V1CIB fixture 15 shape). */
export const readiness=day=>({eligibility:ELIG(day),readiness:{declaredRecovered:true,warningSigns:{...NO_SIGNS},sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}});
