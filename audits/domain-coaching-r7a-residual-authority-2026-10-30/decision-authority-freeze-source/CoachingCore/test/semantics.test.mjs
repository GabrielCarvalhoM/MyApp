import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileExposure, compareDimension, routeBoundary } from '../src/semantics.mjs';

const observed = (overrides = {}) => ({
  canonicalFactId: 'synthetic:strength-A', revision: 'r1', segment: 'work-set-1',
  state: 'OBSERVED', coverage: 'KNOWN', value: 60, unit: 'kg-total',
  provenance: { sourceId: 'synthetic:manual', observedAt: '2026-10-20T10:00:00-03:00' },
  ...overrides,
});
const dimension = (overrides = {}) => ({
  construct: 'external-load', unit: 'kg-total', method: 'declared-external-load-r1',
  configuration: 'synthetic:barbell-squat', targetRevision: 'synthetic:target@r1',
  value: 60, ...overrides,
});
const completed = (overrides = {}) => ({
  ...dimension(), targetRevision: undefined, executedTargetRevision: 'synthetic:target@r1',
  state: 'COMPLETED', ...overrides,
});
const nonclinical = (overrides = {}) => ({
  eligibilityStatus: 'NONCLINICAL_CONFIRMED', eligibilityCurrent: true,
  clinicalFlags: [], interrupted: false, ...overrides,
});

test('G03-W05 confirmed mirrors and replay count one segment, retaining each provenance', () => {
  const a = observed({ deliveryId: 'delivery-A' });
  const b = observed({ deliveryId: 'delivery-B', sourceId: 'synthetic:mirror', provenance: { mirrorOf: 'delivery-A', verifiedLineage: true } });
  const result = reconcileExposure([a, b, a]);
  assert.equal(result.exposureCount, 1);
  assert.equal(result.decisionType, 'KEEP');
  assert.equal(result.activeFacts[0].sourceFacts.length, 2);
  assert.deepEqual(result.activeFacts[0].sourceFacts.find(x => x.deliveryId === 'delivery-B').provenance, b.provenance);
  assert.deepEqual(reconcileExposure([b, a]), reconcileExposure([a, b]));
});

test('G03-W06 distinct canonical executions remain distinct despite identical metrics', () => {
  const result = reconcileExposure([observed(), observed({ canonicalFactId: 'synthetic:strength-B' })]);
  assert.equal(result.exposureCount, 2);
});

test('G03-W07 ambiguous identity preserves alternatives and blocks dependent total', () => {
  const result = reconcileExposure([observed({ identityStatus: 'AMBIGUOUS' }), observed({ canonicalFactId: 'synthetic:maybe-same' })]);
  assert.equal(result.decisionType, 'ASK');
  assert.equal(result.exposureCount, null);
  assert.ok(result.conflicts.some(x => x.reason === 'IDENTITY_UNRESOLVED'));
});

test('G03-W08/W09 verified correction replaces old segment regardless receipt/replay order', () => {
  const r1 = observed({ receivedAt: '2026-10-22T10:00:00-03:00' });
  const r2 = observed({ revision: 'r2', value: 50, supersedes: 'r1', correctionVerified: true, receivedAt: '2026-10-21T10:00:00-03:00' });
  const before = structuredClone([r1, r2]);
  const result = reconcileExposure([r2, r1, r1]);
  assert.equal(result.exposureCount, 1);
  assert.equal(result.activeFacts[0].value, 50);
  assert.equal(result.activeFacts[0].revision, 'r2');
  assert.deepEqual(reconcileExposure([r1, r2]), reconcileExposure([r2, r1]));
  assert.deepEqual([r1, r2], before);
});

test('correction scope cannot supersede a different set and correction cycles fail closed', () => {
  const result = reconcileExposure([observed(), observed({ segment: 'work-set-2', revision: 'r2', value: 50, supersedes: 'r1', correctionVerified: true })]);
  assert.equal(result.exposureCount, 2);
  const cycle = reconcileExposure([
    observed({ supersedes: 'r2', correctionVerified: true }),
    observed({ revision: 'r2', supersedes: 'r1', correctionVerified: true }),
  ]);
  assert.equal(cycle.decisionType, 'ASK');
  assert.equal(cycle.exposureCount, null);
  const disconnectedCycle = reconcileExposure([
    observed({ supersedes: 'r2', correctionVerified: true }),
    observed({ revision: 'r2', supersedes: 'r1', correctionVerified: true }),
    observed({ revision: 'r3' }),
  ]);
  assert.equal(disconnectedCycle.decisionType, 'ASK');
  assert.equal(disconnectedCycle.exposureCount, null);
});

test('G03-W19 opaque revisions or conflicting deliveries never select latest/average', () => {
  for (const observations of [
    [observed(), observed({ revision: 'r2', value: 75, receivedAt: '2099-01-01' })],
    [observed(), observed({ value: 75, receivedAt: '2099-01-01' })],
    [observed(), observed({ revision: 'r2', value: 75, supersedes: 'r1', correctionVerified: false })],
  ]) {
    const result = reconcileExposure(observations);
    assert.equal(result.decisionType, 'ASK');
    assert.equal(result.exposureCount, null);
    assert.equal(result.activeFacts.length, 0);
    assert.ok(result.conflicts.length > 0);
  }
});

test('G03-W19 explicit suppression tombstone survives correction and provider replay', () => {
  const marker = { canonicalFactId: 'synthetic:strength-A', segment: '*', state: 'SUPPRESSED', suppressionVerified: true, provenance: { controlRef: 'synthetic:suppression-control' } };
  const input = [observed(), marker, observed({ revision: 'r2', value: 50, supersedes: 'r1', correctionVerified: true })];
  const result = reconcileExposure(input);
  assert.equal(result.activeFacts.length, 0);
  assert.equal(result.exposureCount, 0);
  assert.ok(result.unknownRemainders.some(x => x.reason === 'SUPPRESSED'));
  assert.deepEqual(result, reconcileExposure([...input, observed()]));
});

test('G03-W03/W04 zero is observed; missing coverage is unknown rather than omitted work', () => {
  const zero = reconcileExposure([observed({ value: 0 })]);
  assert.equal(zero.activeFacts[0].value, 0);
  assert.equal(zero.decisionType, 'KEEP');
  const unknown = reconcileExposure([observed({ coverage: 'COVERAGE_UNKNOWN' })]);
  assert.equal(unknown.decisionType, 'ASK');
  assert.equal(unknown.activeFacts[0].value, 60);
  assert.ok(unknown.unknownRemainders.some(x => x.reason === 'COVERAGE_UNKNOWN'));
  assert.notEqual(unknown.exposureCount, 0);
});

test('G03-W17/W18 planned/projected/inferred data never adds observed exposure', () => {
  const result = reconcileExposure([
    observed({ value: 3000, unit: 'm', segment: 'observed-prefix' }),
    observed({ value: 2000, unit: 'm', segment: 'future', state: 'PROJECTED' }),
    observed({ value: 5000, unit: 'm', segment: 'whole-plan', state: 'PLANNED' }),
    observed({ segment: 'quadriceps-model', state: 'INFERRED' }),
  ]);
  assert.equal(result.exposureCount, 1);
  assert.equal(result.activeFacts[0].value, 3000);
  assert.equal(result.activeFacts[0].state, 'OBSERVED');
  assert.equal(result.unknownRemainders.length, 3);
});

test('missing identity/state never defaults to a confirmed completed fact', () => {
  for (const row of [{ value: 0 }, { ...observed(), state: undefined }, { ...observed(), segment: undefined }, { ...observed(), provenance: undefined }]) {
    const result = reconcileExposure([row]);
    assert.equal(result.decisionType, 'ASK');
    assert.equal(result.activeFacts.length, 0);
    assert.equal(result.exposureCount, null);
  }
});

test('ambiguous association cannot become an observed total through canonical identity alone', () => {
  const result = reconcileExposure([observed({ associationStatus: 'UNRESOLVED' })]);
  assert.equal(result.decisionType, 'ASK');
  assert.equal(result.exposureCount, null);
});

test('G03-W01 exact/ranged comparisons do not supply tolerance or physiological conclusions', () => {
  assert.equal(compareDimension({ planned: dimension(), completed: completed() }).classification, 'WITHIN_TARGET');
  const below = compareDimension({ planned: dimension(), completed: completed({ value: 59.999 }) });
  assert.equal(below.classification, 'BELOW');
  assert.equal(below.physiologicalConclusion, 'NOT_ASSESSED');
  assert.equal(compareDimension({ planned: dimension({ value: undefined, target: { min: 55, max: 65 } }), completed: completed({ value: 65 }) }).classification, 'WITHIN_TARGET');
  assert.equal(compareDimension({ planned: dimension(), completed: completed({ value: 61 }) }).classification, 'ABOVE');
  assert.equal(compareDimension({ planned: dimension({ value: 0 }), completed: completed({ value: 0 }) }).classification, 'WITHIN_TARGET');
});

test('G03-W11/W12/W14 mismatched constructs/units/methods/configuration/target revisions remain unclassified', () => {
  for (const changes of [
    { unit: 'kg-per-hand' }, { construct: 'session-rpe' }, { method: 'different-calibration' },
    { configuration: 'different-machine' }, { executedTargetRevision: 'synthetic:target@r2' },
    { unit: undefined }, { value: undefined }, { value: NaN }, { state: 'PLANNED' },
    { calibrationRevision: 'not-in-original-target' },
  ]) {
    const result = compareDimension({ planned: dimension(), completed: completed(changes) });
    assert.equal(result.classification, 'UNCLASSIFIED');
    assert.equal(result.physiologicalConclusion, 'NOT_ASSESSED');
    assert.ok(result.missingInputs.length > 0);
  }
});

test('G03-W16 accepted remainder target preserves executed prefix revision', () => {
  const prefix = completed();
  const original = structuredClone(prefix);
  const reduced = dimension({ targetRevision: 'synthetic:target@r2', value: 50 });
  assert.equal(compareDimension({ planned: reduced, completed: prefix }).classification, 'UNCLASSIFIED');
  assert.equal(compareDimension({ planned: reduced, completed: completed({ executedTargetRevision: 'synthetic:target@r2', value: 50 }) }).classification, 'WITHIN_TARGET');
  assert.deepEqual(prefix, original);
});

test('G03-W13 explicit source conflict blocks comparison, even if numeric value matches', () => {
  assert.equal(compareDimension({ planned: dimension(), completed: completed({ conflict: true }) }).knowledgeStatus, 'CONFLICT');
  assert.equal(compareDimension({ planned: dimension({ target: { min: 65, max: 55 }, value: undefined }), completed: completed() }).classification, 'UNCLASSIFIED');
});

test('G04 unknown eligibility is ASK; supplied clinical dependencies always require human', () => {
  assert.equal(routeBoundary({ interrupted: false }).decisionType, 'ASK');
  assert.equal(routeBoundary(nonclinical({ eligibilityCurrent: false })).decisionType, 'ASK');
  for (const clinical of [
    { clinicalFlags: ['persistent-pain'] }, { clinicalFlags: { injury: true } },
    { clinicalDependency: true }, { clearanceRequired: true }, { illness: true },
    { clinicalFlags: 'persistent-pain' }, { eligibilityStatus: 'CLINICAL_HUMAN_REQUIRED' },
  ]) {
    const result = routeBoundary(nonclinical(clinical));
    assert.equal(result.decisionType, 'CLINICAL_HUMAN_REQUIRED');
    assert.equal(result.autonomyLevel, 'CLINICAL_HUMAN_REQUIRED');
  }
  assert.equal(routeBoundary(nonclinical()), null);
  assert.equal(routeBoundary(null).decisionType, 'ASK');
  assert.equal(compareDimension(null).classification, 'UNCLASSIFIED');
});

test('G04-W01/W02/W04/W06 no duration-to-dose or old-load restoration follows a pause', () => {
  assert.equal(routeBoundary(nonclinical({ interrupted: true })).decisionType, 'ASK');
  for (const pauseDays of [0, 9, 28, 9999]) {
    const result = routeBoundary(nonclinical({ interrupted: true, interruptionReason: 'TRAVEL', actualExposureKnown: true, pauseDays }));
    assert.equal(result.decisionType, 'NOT_SUPPORTED_YET');
    assert.equal(result.unsupportedDependency, 'APPROVED_APPLICABLE_NONCLINICAL_REENTRY_RECIPE');
    assert.equal(result.autonomyLevel, 'ABSTAIN_OR_HOLD');
  }
});

test('an approved return recipe only routes to its separate policy review, never restores old load', () => {
  const result = routeBoundary(nonclinical({
    interrupted: true, interruptionReason: 'AGENDA', actualExposureKnown: true,
    reentryRecipe: { id: 'synthetic:separate-recipe', version: 'r1', approved: true, applicable: true },
  }));
  assert.equal(result.decisionType, 'HOLD');
  assert.equal(result.unsupportedDependency, 'SEPARATE_REENTRY_POLICY_EVALUATION');
  assert.equal('dose' in result, false);
  assert.equal(routeBoundary(nonclinical({ interrupted: true, interruptionReason: 'TRAVEL', actualExposureKnown: false })).decisionType, 'ASK');
});
