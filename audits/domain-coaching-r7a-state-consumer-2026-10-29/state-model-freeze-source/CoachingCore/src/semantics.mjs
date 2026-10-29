/**
 * Bounded semantic consumers of SDC-G03-r1 / SDC-G04-NC-r1 and the independently
 * accepted G03-W01..W19 / G04-W01..W10 oracles. These functions establish no
 * physiological tolerance, stimulus, readiness, clinical clearance or dose.
 *
 * Inputs are already associated by a trusted integration boundary. A supplied
 * canonicalFactId is not inferred from time/metric similarity. Source identity,
 * permission and correction/suppression controls must be verified upstream.
 */

const clone = value => structuredClone(value);
const present = value => value !== undefined && value !== null && value !== '';
const canonical = value => JSON.stringify(order(value));
function order(value) {
  if (Array.isArray(value)) return value.map(order);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, order(value[k])]));
  }
  return value;
}
const uniqueSorted = values => [...new Set(values)].sort();
function uniqueRows(rows) {
  return [...new Map(rows.map(row => [canonical(row), row])).entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, row]) => clone(row));
}

// Transport/source metadata is preserved in sourceFacts but supplies neither
// correction precedence nor additional physical exposure.
const deliveryFields = new Set([
  'deliveryId', 'sourceId', 'receivedAt', 'provenance', 'sourceRefs', 'retryOf',
  'mirrorOf', 'verifiedLineage', 'supersedes', 'correctionVerified',
]);
function factPayload(row) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !deliveryFields.has(key)));
}

/**
 * @param {Array<object>} observations Reconciled observations, not provider guesses.
 * Required observed fields: canonicalFactId, revision, segment, provenance, state
 * (OBSERVED/COMPLETED), and coverage KNOWN/PARTIAL_KNOWN/COVERAGE_UNKNOWN.
 * A correction names supersedes (revision or revision array) and must have
 * correctionVerified:true. It affects only the same canonicalFactId+segment.
 * A verified SUPPRESSED marker has segment:'*' for the fact or an exact segment;
 * it remains a tombstone throughout replay. Supply it at every replay frontier.
 * exposureCount counts unique active observed segments, not a workload/fatigue
 * sum; null means the dependent total cannot be established. Known portions
 * remain in activeFacts when only the unreported remainder is unknown.
 */
export function reconcileExposure(observations) {
  const activeFacts = [], conflicts = [], unknownRemainders = [], missingInputs = [];
  const rows = Array.isArray(observations) ? uniqueRows(observations) : [];
  let totalUnknown = !Array.isArray(observations);
  if (!Array.isArray(observations)) missingInputs.push('observations');
  const suppressed = new Set(rows.filter(row => row?.state === 'SUPPRESSED' && row.suppressionVerified === true && present(row.canonicalFactId) && present(row.segment))
    .map(row => canonical([row.canonicalFactId, row.segment])));
  const groups = new Map();
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      missingInputs.push(`observations[${index}]`); totalUnknown = true; continue;
    }
    const isSuppressed = suppressed.has(canonical([row.canonicalFactId, '*'])) || suppressed.has(canonical([row.canonicalFactId, row.segment]));
    if (isSuppressed) {
      // The marker, rather than suppressed source contents, is sufficient for
      // the returned projection. Lawful retention remains an upstream concern.
      const marker = { canonicalFactId: row.canonicalFactId, segment: suppressed.has(canonical([row.canonicalFactId, '*'])) ? '*' : row.segment, reason: 'SUPPRESSED' };
      if (!unknownRemainders.some(item => canonical(item) === canonical(marker))) unknownRemainders.push(marker);
      continue;
    }
    if (['PLANNED', 'PROJECTED', 'INFERRED'].includes(row.state)) {
      unknownRemainders.push({ reason: 'NOT_OBSERVED', sourceFact: clone(row) });
      continue;
    }
    const required = ['canonicalFactId', 'revision', 'segment', 'state', 'provenance'].filter(key => !present(row[key]));
    if (required.length || !['OBSERVED', 'COMPLETED'].includes(row.state)) {
      missingInputs.push(...required.map(key => `observations[${index}].${key}`));
      if (!required.includes('state') && !['OBSERVED', 'COMPLETED'].includes(row.state)) missingInputs.push(`observations[${index}].verifiedObservedState`);
      unknownRemainders.push({ reason: 'OBSERVATION_METADATA_MISSING_OR_UNSUPPORTED', sourceFact: clone(row) });
      totalUnknown = true; continue;
    }
    if ((row.identityStatus && !['CONFIRMED', 'RECONCILED'].includes(row.identityStatus))
        || (row.associationStatus && !['CONFIRMED', 'RECONCILED'].includes(row.associationStatus))) {
      conflicts.push({ reason: 'IDENTITY_UNRESOLVED', canonicalFactId: row.canonicalFactId, segment: row.segment, sourceFacts: [clone(row)] });
      missingInputs.push(`identityResolution:${row.canonicalFactId}/${row.segment}`); totalUnknown = true; continue;
    }
    const key = canonical([row.canonicalFactId, row.segment]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const [key, deliveries] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const [canonicalFactId, segment] = JSON.parse(key);
    const revisions = new Map();
    for (const row of deliveries) {
      if (!revisions.has(row.revision)) revisions.set(row.revision, []);
      revisions.get(row.revision).push(row);
    }
    const superseded = new Set(), lineage = new Map();
    let conflictReason = null;
    for (const [revision, sources] of revisions) {
      if (new Set(sources.map(row => canonical(factPayload(row)))).size > 1) conflictReason = 'SOURCE_FACT_CONFLICT';
      for (const row of sources) {
        if (row.conflict === true || row.sourceConflict === true) conflictReason = 'SOURCE_FACT_CONFLICT';
        if (present(row.supersedes)) {
          if (row.correctionVerified !== true) { conflictReason = 'CORRECTION_LINEAGE_UNVERIFIED'; continue; }
          const targets = Array.isArray(row.supersedes) ? row.supersedes : [row.supersedes];
          for (const target of targets) {
            if (typeof target !== 'string' || !target || target === revision) { conflictReason = 'CORRECTION_LINEAGE_INVALID'; continue; }
            superseded.add(target);
            if (!lineage.has(revision)) lineage.set(revision, new Set());
            lineage.get(revision).add(target);
          }
        }
      }
    }
    // A disconnected cycle cannot acquire validity because an unrelated third
    // revision happens to be the only unsuperseded frontier node.
    const visiting = new Set(), visited = new Set();
    function hasCycle(revision) {
      if (visiting.has(revision)) return true;
      if (visited.has(revision)) return false;
      visiting.add(revision);
      for (const target of lineage.get(revision) ?? []) if (hasCycle(target)) return true;
      visiting.delete(revision); visited.add(revision);
      return false;
    }
    if ([...lineage.keys()].some(hasCycle)) conflictReason = 'CORRECTION_LINEAGE_CYCLE';
    const frontier = [...revisions.keys()].filter(revision => !superseded.has(revision));
    if (frontier.length !== 1) conflictReason ??= frontier.length ? 'REVISION_PRECEDENCE_UNRESOLVED' : 'CORRECTION_LINEAGE_CYCLE';
    if (conflictReason) {
      conflicts.push({ canonicalFactId, segment, reason: conflictReason, sourceFacts: uniqueRows(deliveries) });
      missingInputs.push(`sourceOrCorrectionResolution:${canonicalFactId}/${segment}`); totalUnknown = true; continue;
    }
    const sources = uniqueRows(revisions.get(frontier[0]));
    const fact = { ...clone(sources[0]), sourceFacts: sources };
    activeFacts.push(fact);
    if (!['KNOWN', 'PARTIAL_KNOWN'].includes(fact.coverage)) {
      unknownRemainders.push({ canonicalFactId, segment, reason: 'COVERAGE_UNKNOWN' });
      missingInputs.push(`coverage:${canonicalFactId}/${segment}`);
    }
    if (fact.coverage === 'PARTIAL_KNOWN' && fact.remainderStatus !== 'OMITTED_CONFIRMED' && fact.remainderStatus !== 'STOPPED_CONFIRMED') {
      unknownRemainders.push({ canonicalFactId, segment, reason: 'UNREPORTED_REMAINDER' });
      missingInputs.push(`remainderStatus:${canonicalFactId}/${segment}`);
    }
  }
  return {
    activeFacts,
    conflicts: uniqueRows(conflicts),
    unknownRemainders: uniqueRows(unknownRemainders),
    exposureCount: totalUnknown ? null : activeFacts.length,
    decisionType: missingInputs.length || conflicts.length ? 'ASK' : 'KEEP',
    missingInputs: uniqueSorted(missingInputs),
  };
}

/** Compare one explicitly compatible semantic dimension to its executed target.
 * planned: {construct,unit,method,configuration,targetRevision,value OR target:{min,max}}
 * completed: same metadata, executedTargetRevision, value and state:'COMPLETED'/'OBSERVED'.
 * Metadata equality never means that the method is physiologically validated.
 * BELOW/ABOVE refer to the supplied numeric construct (pace seconds included),
 * never sporting merit. Conversions/tolerances are deliberately unavailable.
 */
export function compareDimension(input = {}) {
  const { planned, completed } = input ?? {};
  const missingInputs = [];
  const result = (classification, knowledgeStatus) => ({ classification, knowledgeStatus, missingInputs: uniqueSorted(missingInputs), physiologicalConclusion: 'NOT_ASSESSED' });
  if (!planned || !completed) {
    if (!planned) missingInputs.push('planned');
    if (!completed) missingInputs.push('completed');
    return result('UNCLASSIFIED', 'UNKNOWN');
  }
  if (planned.conflict === true || completed.conflict === true || planned.sourceConflict === true || completed.sourceConflict === true) {
    missingInputs.push('sourceConflictResolution');
    return result('UNCLASSIFIED', 'CONFLICT');
  }
  let mismatch = false;
  for (const field of ['construct', 'unit', 'method', 'configuration']) {
    if (!present(planned[field])) missingInputs.push(`planned.${field}`);
    if (!present(completed[field])) missingInputs.push(`completed.${field}`);
    if (present(planned[field]) && present(completed[field]) && canonical(planned[field]) !== canonical(completed[field])) {
      mismatch = true; missingInputs.push(`compatible.${field}`);
    }
  }
  for (const field of ['loadConvention', 'calibrationRevision', 'measurementContext', 'scaleAnchors']) {
    if (present(planned[field]) || present(completed[field])) {
      if (!present(planned[field]) || !present(completed[field]) || canonical(planned[field]) !== canonical(completed[field])) {
        mismatch = true; missingInputs.push(`compatible.${field}`);
      }
    }
  }
  if (!present(planned.targetRevision)) missingInputs.push('planned.targetRevision');
  if (!present(completed.executedTargetRevision)) missingInputs.push('completed.executedTargetRevision');
  if (present(planned.targetRevision) && present(completed.executedTargetRevision) && planned.targetRevision !== completed.executedTargetRevision) {
    mismatch = true; missingInputs.push('executedTargetRevisionAssociation');
  }
  if (!['OBSERVED', 'COMPLETED'].includes(completed.state)) missingInputs.push('completed.observedOrCompletedState');
  if (!Number.isFinite(completed.value)) missingInputs.push('completed.value');
  let min, max;
  if (planned.target && typeof planned.target === 'object') {
    ({ min, max } = planned.target);
  } else min = max = planned.value;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) missingInputs.push('planned.explicitValidTargetOrRange');
  if (missingInputs.length) return result('UNCLASSIFIED', mismatch ? 'NOT_COMPARABLE' : 'UNKNOWN');
  return result(completed.value < min ? 'BELOW' : completed.value > max ? 'ABOVE' : 'WITHIN_TARGET', 'COMPARABLE');
}

/** G04 routes only. It never produces a re-entry dose or clinical assessment.
 * null means this boundary found explicit current nonclinical eligibility and
 * no interruption; adequacy/necessity/policy authorization are separate checks.
 */
export function routeBoundary(context = {}) {
  context ??= {};
  const flags = context.clinicalFlags;
  const suppliedClinicalFlag = Array.isArray(flags) ? flags.some(flag => present(flag) && flag !== false)
    : flags && typeof flags === 'object' ? Object.values(flags).some(value => value === true) : flags === true || (typeof flags === 'string' && flags.length > 0);
  const clinical = suppliedClinicalFlag || ['CLINICAL_HUMAN_REQUIRED', 'OUT_OF_SCOPE_CLINICAL'].includes(context.eligibilityStatus)
    || ['clinicalDependency', 'persistentPain', 'injury', 'illness', 'pathology', 'functionalLimitation', 'clearanceRequired', 'rehabilitation'].some(key => context[key] === true);
  const route = (decisionType, missingInputs, unsupportedDependency, autonomyLevel = 'ABSTAIN_OR_HOLD') => ({ decisionType, autonomyLevel, missingInputs, unsupportedDependency });
  if (clinical) return route('CLINICAL_HUMAN_REQUIRED', [], 'COMPETENT_CLINICAL_HUMAN_ASSESSMENT', 'CLINICAL_HUMAN_REQUIRED');
  const nonclinicalKnown = context.eligibilityStatus === 'NONCLINICAL_CONFIRMED'
    || (context.eligibilityKnown === true && context.nonclinical === true);
  if (!nonclinicalKnown || context.eligibilityCurrent === false || context.relevantContextChanged === true) {
    return route('ASK', ['currentNonclinicalEligibility'], 'ELIGIBILITY_UNASSESSED', 'ASK_BEFORE_DECISION');
  }
  if (context.interrupted === false) return null;
  if (context.interrupted !== true) return route('ASK', ['interruptionStatus'], 'CONTINUITY_UNASSESSED', 'ASK_BEFORE_DECISION');
  const reason = typeof context.interruptionReason === 'string' ? context.interruptionReason.toUpperCase() : null;
  if (!['TRAVEL', 'AGENDA', 'SCHEDULE', 'NONCLINICAL'].includes(reason)) {
    return route('ASK', ['declaredInterruptionReason'], 'INTERRUPTION_REASON_UNASSESSED', 'ASK_BEFORE_DECISION');
  }
  if (context.actualExposureKnown !== true) return route('ASK', ['actualExposureDuringInterruption'], 'ACTUAL_EXPOSURE_UNASSESSED', 'ASK_BEFORE_DECISION');
  const recipe = context.reentryRecipe;
  if (!recipe || recipe.approved !== true || recipe.applicable !== true || !present(recipe.id) || !present(recipe.version)
      || recipe.revoked === true || recipe.expired === true) {
    return route('NOT_SUPPORTED_YET', [], 'APPROVED_APPLICABLE_NONCLINICAL_REENTRY_RECIPE');
  }
  return route('HOLD', [], 'SEPARATE_REENTRY_POLICY_EVALUATION');
}
