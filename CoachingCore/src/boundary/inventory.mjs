// V1 Coaching Integration Boundary: the data inventory and the egress rule (Security C4, C5; SEC-V1CP-01, -09, -16, -17, -18). Every field the boundary
// keeps is classed; health-derived fields stay inside custody (the athlete's own views) and never reach logs, analytics, crash reports, push text,
// the lock screen or shares. This is an engineering inventory for Security and G07; it makes no legal claim.
export const CLASSES=Object.freeze({HEALTH:'HEALTH',HEALTH_DERIVED:'HEALTH_DERIVED',TRAINING:'TRAINING',PERSONAL:'PERSONAL',OPERATIONAL:'OPERATIONAL',INTEGRITY:'INTEGRITY'});
const C=CLASSES;
export const DATA_INVENTORY=Object.freeze([
 {field:'review.wellbeing (condition, warningSigns, intent, days, sports, region, returnSpeed)',class:C.HEALTH,purpose:'HEALTH_SIGNALS',egress:'NONE'},
 {field:'review.wellbeingCheck (warningSigns, exerciseResponse, improved)',class:C.HEALTH,purpose:'HEALTH_SIGNALS',egress:'NONE'},
 {field:'review.readiness (declaredRecovered, warningSigns, sports, restrictions)',class:C.HEALTH,purpose:'HEALTH_SIGNALS',egress:'NONE'},
 {field:'review.eligibility (six clinical flags, status, assessedAt)',class:C.HEALTH,purpose:'COACHING',egress:'NONE'},
 {field:'review.interruption (dates, reasonCategory, reason)',class:C.HEALTH_DERIVED,purpose:'COACHING',egress:'NONE',note:'a reason may be clinical; free text is screened, never forwarded'},
 {field:'review.substitution.pain / injury',class:C.HEALTH,purpose:'COACHING',egress:'NONE'},
 {field:'record F08 rows (WELLBEING_DECLARED, WELLBEING_CHECKED, READINESS_DECLARED, CLINICAL_HOLD, ERASED_F08)',class:C.HEALTH,purpose:'HEALTH_SIGNALS',egress:'NONE'},
 {field:'record INTERRUPTION_DECLARED rows',class:C.HEALTH_DERIVED,purpose:'COACHING',egress:'NONE'},
 {field:'decision.guidance (level, wordingStatus), decision.warningSigns',class:C.HEALTH_DERIVED,purpose:'HEALTH_SIGNALS',egress:'NONE',note:'kept as the closed names in the custody decision log (C8)'},
 {field:'decision.reason, decision.question, referenceState.pending.reason',class:C.HEALTH_DERIVED,purpose:'COACHING',egress:'NONE',note:'may name a condition; shown only to the athlete'},
 {field:'decision.wellbeing (plans per sport), readinessRestart',class:C.HEALTH_DERIVED,purpose:'HEALTH_SIGNALS',egress:'NONE'},
 {field:'program.weeks[].adaptations WELLBEING_REDUCTION, SPORT_HELD, STRENGTH_RESTRICTION, RACE_IN_RETURN, RETURN_HOLD',class:C.HEALTH_DERIVED,purpose:'COACHING',egress:'NONE'},
 {field:'session.ownEvent, session.coachRecommendation',class:C.HEALTH_DERIVED,purpose:'COACHING',egress:'NONE'},
 {field:'observations (actual, response, loads, RIR)',class:C.TRAINING,purpose:'COACHING',egress:'NONE'},
 {field:'athlete.sex, heightCm, weightKg, ageYears, knownExercises, goals, schedule',class:C.PERSONAL,purpose:'COACHING',egress:'NONE'},
 {field:'inputHash, rowHash, referenceState.hash, program.hash',class:C.INTEGRITY,purpose:'COACHING',egress:'NONE',note:'C5: keyless digests are payload, never proof; the custody HMAC chain and seal are the integrity mechanism'},
 {field:'custody version, decisionId, eventId (opaque, server-assigned), state, operation name, error code',class:C.OPERATIONAL,purpose:'OPERATIONS',egress:'LOGS_AND_TELEMETRY'}
]);
/** The only decision categories telemetry may carry: a status class, never an action name (WELLBEING_REDUCTION or READINESS_RESTART reveal health), and
 * a clinical hold reads as any change of plan (its status is health-derived). */
const CATEGORY={MODIFY:'PLAN_CHANGED',KEEP:'PLAN_KEPT',ASK:'INPUT_NEEDED',HOLD:'NOT_DECIDED',UNSUPPORTED:'NOT_DECIDED',CLINICAL_HUMAN_REQUIRED:'PLAN_CHANGED'};
/** The operation names telemetry may carry: neutral classes (an operation such as "not feeling 100" or "readiness" would itself reveal health). */
const OPS={onboard:'onboard',plan:'read',sessions:'read',history:'read',status:'read',decision:'read',accept:'adoption',decline:'adoption',restart:'restart',setConsent:'consent',eraseHealthFacts:'erasure',eraseAccount:'erasure'};
/** A telemetry or log record of an operation: operational fields only (opaque ids, a neutral operation class, a status class, an error code). */
export function telemetryOf(op,result){
 return {op:OPS[op]??'review',ok:result?.ok!==false,...(result?.error?{code:result.error.code}:{}),...(Number.isInteger(result?.version)?{version:result.version}:{}),...(result?.status?{category:CATEGORY[result.status]??'OTHER'}:{}),...(result?.decisionId?{decisionId:result.decisionId}:{})};
}
/** Push and lock-screen text: neutral, the same for every reason (SEC-V1CP-17). Portuguese reference strings for the design owner to replace. */
export const PUSH_TEXT=Object.freeze({PLAN_CHANGED:'Seu plano foi ajustado',INPUT_NEEDED:'Há uma pergunta sobre o seu plano',PLAN_KEPT:null,NOT_DECIDED:'Abra o app para ver seu plano',OTHER:null});
export const pushTextOf=result=>PUSH_TEXT[CATEGORY[result?.status]??'OTHER']??null;
/** The health-derived words that must never appear in an outbound record (the canary list the tests use). */
export const NEVER_OUTBOUND=Object.freeze(['WELLBEING','READINESS','CLINICAL','HOLD_ON_RECORD','URGENT','PROFESSIONAL_ASSESSMENT','MILD_ILLNESS','MILD_INDISPOSITION','UNUSUAL_FATIGUE','MINOR_DISCOMFORT','NEED_REST','swelling','fever','chest','breathless','faint','injury','pain','illness']);
