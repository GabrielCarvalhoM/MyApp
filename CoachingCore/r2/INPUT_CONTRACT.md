# R2 executable input contract — BSR-INPUT-R2

Versioned extension dispatched by evaluateShadow. BSR-INPUT-1 retains its existing contract. Runtime reads only the policy registry and the frozen independent SSCTR authority bundle, never development expected outputs or representative evaluation cases.

The envelope retains purpose=SYNTHETIC_SHADOW, synthetic=true, evaluatedAt, athleteFixtureId, officialPlanState, observedExecutionState, recoveryContext, policyContext and provenance. R2 athleteState contains athlete_id, adult, priority (RUN_FIRST/STRENGTH_FIRST/BALANCED), runLevel and strengthLevel (NOVICE/INTERMEDIATE), dataMode (NONE/PARTIAL/RICH), history (NONE/LIMITED/KNOWN), movementCompetence (KNOWN/UNKNOWN). Extra keys at every executable level fail closed.

event={event_id,type:R2_REQUEST,request,sessionId:null|string,facts}. Request has an exact request-specific schema; all decision-relevant unknowns are explicit. observation={sourceRef,sourceRevision,observedAt,coverage:COMPLETE|PARTIAL|UNKNOWN,association:CONFIRMED|UNCERTAIN,response:COMPATIBLE|ADVERSE|UNKNOWN,contextComparable:boolean}. Only COMPLETE, confirmed, nonfuture observation facts may establish positive eligibility. These are injected synthetic premises, not measured efficacy.

Plan={plan_id,plan_revision,athlete_id,sessions:[{session_id,day,recipeId,status:PLANNED|COMPLETED,optional:boolean}]}. Each recipe is resolved by the reviewed finite registry. Session changes address PLANNED work only. First prescription uses officialPlanState=null, and the proposed first session/week remains a separate candidate. Return never restores a prior plan by elapsed days. Candidate doses are explicit internal protocol choices, not universal physiological laws.

Positive action classes remain REPLAN/MOVE/REDUCE_VOLUME, with SUGGEST_AND_CONFIRM as a ceiling and no application API. History can rank already admissible options only with purpose allowed and the reviewed comparable observational context. Clinical information precedes schema/eligibility. Unsupported/noisy/missing/revoked/stale/contradictory contexts cannot prescribe.

Policy/recipe details and strict facts are in SHADOW_INPUT_R2_SCHEMA.json and POSITIVE_PRESCRIPTION_REGISTRY.json. A policy is enabled only by an exact independent review/policy hash, sufficient evidence status and current review disposition. SSCTR provisional review is not human or empirical validation. Node is the reference/oracle for a later shared production implementation, probably KMP, in a separate mission.
