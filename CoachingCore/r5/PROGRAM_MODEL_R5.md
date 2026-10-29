# Program model — R5

Program → blocks/phases → weeks → sessions → objectives → prescriptions. Every hierarchy level exposes intent, essential/optional outcomes, protected stimuli, flexible elements, progression/regression/exit criteria and athlete-response inputs. Blocks operationally partition the supplied horizon; labels never assert adaptation achieved.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE. Candidate implementation; not Product Truth, production, clinical or empirical validation.

## hierarchy

- Program
- Blocks
- Weeks
- Sessions
- Prescriptions

## requiredLevelFields

- intent
- essentialOutcomes
- optionalOutcomes
- protectedStimuli
- flexibleElements
- progressionCriteria
- regressionCriteria
- exitCriteria
- athleteResponseInputs

## programFields

- version
- id
- athleteId
- goal
- startDate
- timezone
- proposalOnly
- revision
- sourceInputHash
- policyHash
- baselineHash
- blocks
- weeks
- anchors
- availability
- scheduleOptions
- constraints
- completedWork
- decisions
- gaps
- hash

## phaseSemantics

- FOUNDATION: Establish comparable exposure and stable schedule
- DEVELOPMENT: Earn bounded progress
- SPECIFIC: Consolidate supplied goal-specific tasks
- EVENT: Only a complete current baseline-relative event configuration
- REVIEW: Current post-event assessment required

## conditional

true

## limits

- No autonomous block exit from calendar alone
- Clinical/event gaps can leave an explicit unprescribed week; requestedScopeSatisfied=false
