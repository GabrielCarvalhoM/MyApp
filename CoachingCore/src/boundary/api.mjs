// V1 Coaching Integration Boundary: the operations the iOS app calls (V1CIB contract §2). Each one is a thin, typed request over custody; the sporting
// authority stays in the engine and the app never reproduces a prescription rule. Every mutating call carries the authenticated actor, an idempotency
// key and the record version the app last saw; every answer is either {ok:true,...,view} or {ok:false,error,state} with a client state (views.mjs).
import {planView,historyView,stateOfError,CLIENT_STATES} from './views.mjs';
import {telemetryOf} from './inventory.mjs';

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
/** A session report in the engine's observation shape (the server assigns its id). */
function observation({sessionId,occurredOn,observedAt,completed,minutes,exercises,response,correctionOf,correctedAt}){
 return {sessionId,occurrenceDate:occurredOn,...(typeof observedAt==='string'?{observedAt}:{}),actual:{completed:completed===true,...(Number.isFinite(minutes)?{minutes}:{}),...(Array.isArray(exercises)?{exercises}:{})},response:isObj(response)?response:{},
  // A correction names the server id of the report it corrects (R7-A); the original stays on record, annotated as superseded.
  ...(typeof correctionOf==='string'?{correctionOf,correctedAt}:{})};
}
/**
 * createBoundary({custody, now, log}) → the app operations. `log` receives operational telemetry only (inventory.telemetryOf): never a health field.
 */
export function createBoundary({custody,now=()=>Date.now(),log=()=>{}}){
 const view=actor=>{const o=custody.read({actor});return o.ok?{ok:true,view:planView(o.doc,{nowMs:now()})}:{ok:false,error:o.error,state:stateOfError(o.error)};};
 const done=(op,r,actor)=>{log(telemetryOf(op,r));if(!r.ok)return {...r,state:stateOfError(r.error)};const v=view(actor);return {...r,...(v.ok?{view:v.view}:{viewError:v.error,state:v.state})};};
 const submit=(op,{actor,clientRequestId,expectedVersion,eligibility},review)=>done(op,custody.submit({actor,clientRequestId,expectedVersion,review:{...review,...(eligibility?{eligibility}:{})}}),actor);
 return {
  CLIENT_STATES,
  /** Onboarding: the athlete's initial data (R6-INTAKE-1 fields) and explicit consents; the first plan. */
  onboard:({actor,intake,consents,clientRequestId})=>done('onboard',custody.enroll({actor,intake,consents,clientRequestId}),actor),
  /** The plan in force and its state; `week` picks a week (default: the current one). */
  plan:({actor,week=null})=>{const o=custody.read({actor});if(!o.ok){log(telemetryOf('plan',o));return {ok:false,error:o.error,state:stateOfError(o.error)};}return {ok:true,view:planView(o.doc,{nowMs:now(),week})};},
  /** Every week's sessions with the same executable/projected flags (a hold returns no prescription). */
  sessions:({actor})=>{const o=custody.read({actor});if(!o.ok)return {ok:false,error:o.error,state:stateOfError(o.error)};return {ok:true,weeks:o.doc.program.weeks.map((_,k)=>planView(o.doc,{nowMs:now(),week:k}).week)};},
  /** A run done (or not): minutes and the athlete's response (performance, recovery, effort, next-day function). */
  // A session not done names itself as the missed one (V1 Final Closure): the coach may then offer to move a key session to a later day of the week,
  // an offer that waits for the athlete (custody OFFERED_ACTIONS); nothing is ever made up or moved on its own.
  logRun:(req)=>submit('logRun',req,{kind:req.completed===false?'MISSED_SESSION':'WEEKLY_REVIEW',observations:[observation(req)],...(req.completed===false&&typeof req.sessionId==='string'?{targetSessionId:req.sessionId}:{})}),
  /** A strength session: exercises with their sets (reps, load {value, unit, convention}, rir). */
  logStrength:(req)=>submit('logStrength',req,{kind:req.completed===false?'MISSED_SESSION':'WEEKLY_REVIEW',observations:[observation(req)],...(req.completed===false&&typeof req.sessionId==='string'?{targetSessionId:req.sessionId}:{})}),
  /** The weekly check-in: the week's remaining reports and, inside a Situation 1 episode, the check. */
  weeklyCheckIn:(req)=>submit('weeklyCheckIn',req,{kind:'WEEKLY_REVIEW',observations:(req.reports??[]).map(observation),...(req.check?{wellbeingCheck:req.check}:{})}),
  /** "Not 100%" (F08 Situation 1) and its check; the readiness declaration after a hold (Situation 2). */
  notFeeling100:(req)=>submit('notFeeling100',req,{kind:'NOT_FEELING_100',wellbeing:req.wellbeing,...(req.reports?{observations:req.reports.map(observation)}:{})}),
  wellbeingCheck:(req)=>submit('wellbeingCheck',req,{kind:'WELLBEING_CHECK',wellbeingCheck:req.check,...(req.reports?{observations:req.reports.map(observation)}:{})}),
  declareReadiness:(req)=>submit('declareReadiness',req,{kind:'READINESS_DECLARATION',readiness:req.readiness,...(req.reports?{observations:req.reports.map(observation)}:{})}),
  /** A break the athlete reports (dates and a reason category; a clinical one routes to a human). */
  reportBreak:(req)=>submit('reportBreak',req,{kind:'RETURN_AFTER_PAUSE',interruption:req.interruption}),
  /** Availability: run and strength days, shifts, minutes (SCHEDULE_CHANGE), or a day unavailable. */
  updateAvailability:(req)=>submit('updateAvailability',req,req.unavailableDates?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:req.unavailableDates}}:{kind:'SCHEDULE_CHANGE',changes:req.changes}),
  /** Volume and difficulty (LOWER, STANDARD, HIGHER, per sport or for both), and the coach profile; from next week. */
  setPreferences:(req)=>submit('setPreferences',req,{kind:'PREFERENCE_CHANGE',changes:{coaching:{...(req.volume?{volume:req.volume}:{}),...(req.difficulty?{difficulty:req.difficulty}:{})}}}),
  setCoach:(req)=>submit('setCoach',req,{kind:'PREFERENCE_CHANGE',changes:{coaching:{profile:req.profile}}}),
  /** A change waiting for the athlete's confirmation (not one that their own report requires). */
  accept:({actor,decisionId,expectedVersion})=>done('accept',custody.accept({actor,decisionId,expectedVersion}),actor),
  decline:({actor,decisionId,expectedVersion})=>done('decline',custody.decline({actor,decisionId,expectedVersion}),actor),
  /** Why the plan changed: one decision, with its reason, what it needs and its guidance level. */
  decision:({actor,decisionId})=>{const o=custody.read({actor});if(!o.ok)return {ok:false,error:o.error,state:stateOfError(o.error)};const d=o.doc.decisions.find(x=>x.decisionId===decisionId);return d?{ok:true,decision:d}:{ok:false,error:{code:'NOT_FOUND',message:'No such decision'},state:CLIENT_STATES.OPERATIONAL_ERROR};},
  history:({actor})=>{const o=custody.read({actor});return o.ok?{ok:true,history:historyView(o.doc)}:{ok:false,error:o.error,state:stateOfError(o.error)};},
  /** The athlete's restrictions and holds, per sport (also part of every plan view). */
  status:({actor})=>{const v=view(actor);return v.ok?{ok:true,state:v.view.state,sports:v.view.sports,hold:v.view.hold,question:v.view.question,pending:v.view.pending}:v;},
  /** A new plan from updated facts (F08 Situation 3 and any restart), the record carried. */
  restart:({actor,intake,expectedVersion})=>done('restart',custody.restart({actor,intake,expectedVersion}),actor),
  /** V1HR5R: the athlete's maximum heart rate and/or custom zone limits (null clears); the five zones of the answer use them. Only over an
   * integration custody (createIntegration); a bare custody has no heart-rate profile. */
  setHeartRateProfile:({actor,clientRequestId,expectedVersion,heartRateProfile})=>typeof custody.setHeartRateProfile==='function'
   ?done('setHeartRateProfile',custody.setHeartRateProfile({actor,clientRequestId,expectedVersion,heartRateProfile}),actor)
   :{ok:false,error:{code:'NOT_SUPPORTED',message:'This custody keeps no heart-rate profile'},state:stateOfError({code:'NOT_SUPPORTED'})},
  setConsent:({actor,purpose,granted,expectedVersion})=>done('setConsent',custody.setConsent({actor,purpose,granted,expectedVersion}),actor),
  eraseHealthFacts:({actor,eventIds,expectedVersion})=>done('eraseHealthFacts',custody.eraseHealthFacts({actor,eventIds,expectedVersion}),actor),
  eraseAccount:({actor})=>{const r=custody.eraseAccount({actor});log(telemetryOf('eraseAccount',r));return r;}
 };
}
