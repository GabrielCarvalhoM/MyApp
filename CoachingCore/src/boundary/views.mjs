// V1 Coaching Integration Boundary: the views the iOS app consumes, derived from the custody document (layout-free: no screen, copy or style is set
// here; the approved design decides how each state looks). The app never recomputes a prescription rule: it shows these states and sessions.
import {readableF08,standingHolds,isF08Fact,ERASED_F08} from '../v1-f08.mjs';

/** The client states (V1CIB contract §3). NOT_SYNCED is the app's own state for reports still in its offline queue; the server never returns it. */
export const CLIENT_STATES=Object.freeze({VALID_PLAN:'VALID_PLAN',PENDING_CONFIRMATION:'PENDING_CONFIRMATION',NEEDS_INPUT:'NEEDS_INPUT',REDUCED:'REDUCED',RETURNING:'RETURNING',
 BLOCKED:'BLOCKED',INTEGRITY_FAILURE:'INTEGRITY_FAILURE',OPERATIONAL_ERROR:'OPERATIONAL_ERROR',NO_DATA:'NO_DATA',NOT_SYNCED:'NOT_SYNCED'});
const S=CLIENT_STATES;
/** V1 Final Closure: the states the V1 server produces. REDUCED belongs to the temporary reduction (F08 Situation 1), which V1 does not offer: it stays
 * in the vocabulary for a later version and is never returned by the V1 engine. NOT_SYNCED is the app's own. */
export const V1_SERVER_STATES=Object.freeze(Object.values(CLIENT_STATES).filter(x=>x!=='NOT_SYNCED'&&x!=='REDUCED'));
/** The client state of a custody error: a technical failure is never shown as a rest day or as an empty plan. */
export function stateOfError(error){
 const code=error?.code;
 if(code==='INTEGRITY_FAILURE'||code==='ENGINE_CONTRACT_VIOLATION')return S.INTEGRITY_FAILURE;
 if(code==='NOT_ENROLLED'||code==='GONE')return S.NO_DATA;
 return S.OPERATIONAL_ERROR;
}
const SPORTS=['RUN','STRENGTH'];
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const weekOf=(program,day)=>Math.max(0,Math.min(program.weeks.length-1,Math.floor((Date.parse(day+'T00:00:00Z')-Date.parse(program.startDate+'T00:00:00Z'))/(7*864e5))));
function localDay(ms,offsetMin){return new Date(ms+offsetMin*60000).toISOString().slice(0,10);}
/** Per sport, what the current week holds: held by the athlete's own declaration, restricted rows, a Situation 1 reduction or wait, or a return. */
function sportState(program,w,day,sport){
 const wk=program.weeks[w],ad=(wk?.adaptations??[]).filter(a=>!a.endedBy),st=program.stateTrace?.[w]??{};
 if(!(sport==='RUN'?program.capability?.run?.programmed:program.capability?.strength?.programmed))return {programmed:false,state:'NOT_PROGRAMMED'};
 if(ad.some(a=>a.kind==='SPORT_HELD'&&a.sport===sport))return {programmed:true,state:'HELD',exit:'READINESS_DECLARATION'};
 const restricted=sport==='STRENGTH'?[...new Set(ad.filter(a=>a.kind==='STRENGTH_RESTRICTION').flatMap(a=>a.regions??[]))].sort():[];
 const marks=ad.filter(a=>a.kind==='WELLBEING_REDUCTION'&&a.rungs?.[sport]&&a.startDate<=addDays(wk.startDate,6)&&(!a.endDate||a.endDate>=day));
 const returning=marks.some(a=>a.phase==='LADDER')||ad.some(a=>a.kind==='RETURN_HOLD'&&(a.starts?.[sport]||a.hold?.[sport]!==undefined))||(sport==='RUN'?['RETURN','RESTART'].includes(st.run?.mode):st.strength?.returnEntry===true);
 const state=marks.some(a=>a.phase==='WINDOW'||a.phase==='WAIT')?'REDUCED':returning?'RETURNING':'ACTIVE';
 return {programmed:true,state,...(restricted.length?{restricted}:{})};
}
/** CCP-79 (#79 item 3; Founder decision on #79, 2026-11-27; SSCTR interim rule until a human clinician decides persistence or decay of an urgent level,
 * CLINICAL_HUMAN_REQUIRED): the guidance level of a standing hold is the highest level of the decisions made since the hold began (`since`, its oldest
 * standing row), and never lower than the level of the latest decision that has one (what the frozen view read). A later decision, whether or not it
 * asked the warning signs again, never lowers it; only a readiness declaration that releases the hold ends it (the hold is then no longer standing). */
const LEVEL_RANK=Object.freeze({PROFESSIONAL_ASSESSMENT:1,URGENT_CARE_ADVISED:2});
function holdGuidance(decisions,since){
 const latest=[...decisions].reverse().find(d=>d.guidance),from=typeof since==='string'?Date.parse(since):NaN;
 const inHold=Number.isFinite(from)?decisions.filter(d=>d.guidance&&Number.isFinite(Date.parse(d.at))&&Date.parse(d.at)>=from):[];
 let best=latest??null;for(const d of inHold)if((LEVEL_RANK[d.guidance.level]??0)>(LEVEL_RANK[best?.guidance?.level]??0))best=d;
 return best?.guidance??{level:'PROFESSIONAL_ASSESSMENT',wordingStatus:'INTERIM_PENDING_G04'};
}
/**
 * The plan view: the top-level state, the per-sport states, the hold (from the record, the source of truth), a change waiting for confirmation, an
 * open question, and the sessions of a week with `executable` (the app may start them) and `projected` (shown for context only). While a hold stands
 * no prescription is returned at all; after a question the later weeks are a projection and nothing is executable.
 */
export function planView(doc,{nowMs,week=null}={}){
 const p=doc.program,tz=p.timezoneOffsetMinutes??0,today=localDay(nowMs,tz),w=week??weekOf(p,today);
 // SEC-BC-R2-01 (final physical validation): an erasure is never read as recovery or readiness. An erasure marker on record is read as in force
 // whatever its instant (one dated ahead of this clock, after an earlier operation ran with the clock set ahead, is not dropped): it can only add a
 // hold, never release one. Every other fact is read as of the clock, as before.
 const rows=doc.rows.filter(r=>r!==null),f08=rows.filter(isF08Fact),asOf=readableF08(f08,{athleteId:doc.athleteId,at:nowMs}),
  ahead=readableF08(f08,{athleteId:doc.athleteId,at:Infinity}).filter(o=>o.fact===ERASED_F08&&!asOf.includes(o)),holds=standingHolds([...asOf,...ahead]).holds;
 const last=[...doc.decisions].reverse().find(d=>d.status)??null,pendingQuestion=doc.reference?.pending&&doc.reference.pending.status!=='CLINICAL_HUMAN_REQUIRED'?doc.reference.pending:null;
 const blocked=holds.length>0||doc.reference?.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 const sports=Object.fromEntries(SPORTS.map(s=>[s,blocked?{programmed:sportState(p,w,today,s).programmed,state:'BLOCKED',exit:'READINESS_DECLARATION'}:sportState(p,w,today,s)]));
 const any=k=>Object.values(sports).some(x=>x.state===k);
 const state=blocked?S.BLOCKED:pendingQuestion?S.NEEDS_INPUT:doc.pending?S.PENDING_CONFIRMATION:any('REDUCED')?S.REDUCED:any('RETURNING')?S.RETURNING:S.VALID_PLAN;
 const wk=p.weeks[w];
 const sessions=(wk?.sessions??[]).map(s=>{
  const ahead=s.date>=today,held=sports[s.sport]?.state==='HELD',canRun=!blocked&&!pendingQuestion&&ahead&&live(s)&&!held;
  return {id:s.id,date:s.date,sport:s.sport,role:s.role,turn:s.turn??null,optional:!!s.optional,status:s.status??(live(s)?'PLANNED':'REST'),executable:canRun,projected:!!pendingQuestion&&ahead,
   prescription:blocked?null:s.prescription??null,explanation:blocked?null:s.explanation??null,...(s.ownEvent?{ownEvent:true,coachRecommendation:s.coachRecommendation??null}:{})};
 });
 const guidance=blocked?holdGuidance(doc.decisions,holds[0]?.declaredAt??null):null;
 return {state,version:doc.version,programHash:p.hash,today,weekIndex:w,weeks:p.weeks.length,sports,
  hold:blocked?{clinical:true,since:holds[0]?.declaredAt??null,guidance,exit:'READINESS_DECLARATION'}:null,
  pending:doc.pending?{decisionId:doc.pending.decisionId,kind:'CHANGE_WAITING_CONFIRMATION',change:doc.pending.kind??'REQUESTED_CHANGE'}:null,
  question:pendingQuestion?{missingInputs:pendingQuestion.missingInputs??[],eventKind:pendingQuestion.eventKind??null,reason:pendingQuestion.reason??null}:null,
  week:wk?{index:w,startDate:wk.startDate,sessions}:null,
  lastDecision:last?{decisionId:last.decisionId,at:last.at,status:last.status,action:last.action,reason:last.reason??null,missingInputs:last.missingInputs??[],...(last.guidance?{guidance:last.guidance}:{})}:null};
}
/** The athlete's persisted history, for their own screens: executed sessions and decisions (the reasons included); F08 rows are summarised by type. */
export function historyView(doc){
 const rows=doc.rows.filter(r=>r!==null);
 return {version:doc.version,sessions:rows.filter(r=>!r.fact&&r.sessionId).map(r=>({eventId:r.eventId,sessionId:r.sessionId,date:r.localDate??String(r.occurrenceDate??r.observedAt??'').slice(0,10),completed:r.actual?.completed===true,minutes:r.actual?.minutes??null})),
  facts:rows.filter(r=>r.fact).map(r=>({fact:r.fact,eventId:r.eventId,at:r.declaredAt??null})),erasedSlots:doc.chain.filter(c=>c.erased).length,
  decisions:doc.decisions.map(d=>({decisionId:d.decisionId,kind:d.kind,at:d.at,status:d.status,action:d.action??null,reason:d.reason??null,...(d.guidance?{guidance:d.guidance}:{})}))};
}
