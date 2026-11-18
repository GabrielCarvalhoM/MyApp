// Core Safety & Lifecycle: focal driver for the Mac/iPhone revalidation (the P0 focal pattern, lab/focal-driver.js). The SAME text runs in Node
// over the native ESM namespaces (core-oracle.mjs) and in the device JSContext over the bundle's own module registry (CoreFocalTests.swift).
// It replays frozen synthetic inputs (precomputed by the Node oracle) through the composed entry point v1-safety-index.mjs, carrying the record
// as the AIF client does, and returns digests made by the engine's own hash. It adds no training rule.
// M = { core: v1-safety-index, contract: r5-contract, value: value }   input = { journeys: [{name, steps:[op]}], anchors }
// op: {op:'onboard', intake} | {op:'review'|'probe', kind, asOf, facts, eventId} | {op:'restart', intake, asOf} | {op:'roundtrip'}
globalThis.__corefocal = function (M, inputJSON) {
  const input = JSON.parse(inputJSON), H = v => M.value.hash(v), copy = v => JSON.parse(JSON.stringify(v));
  const errorOf = e => ({ error: e && e.constructor ? e.constructor.name : typeof e }); // never the message (QRE-P0-03)
  /** RFC-NUMERIC-1: the answer without what may differ across runtimes (runForecast's non-integer numbers and its two digests). */
  const stable = v => { const walk = (o, inF) => Array.isArray(o) ? o.map(x => walk(x, inF)) : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).filter(k => !(inF && (k === 'hash' || k === 'inputDigest'))).map(k => [k, walk(o[k], inF)])) : (inF && typeof o === 'number' && !Number.isInteger(o)) ? 'NUM' : o;
    return Object.fromEntries(Object.keys(v).map(k => [k, walk(v[k], k === 'runForecast')])); };
  const CARRIED = ['runEvidenceRecord', 'runFormatRecord', 'runHistoryRecord'], PERSISTED = ['program', 'actualLedger', 'referenceState', 'athleteModel', ...CARRIED];
  function run(j) {
    let env = { program: null, actualLedger: [], referenceState: null, athleteModel: null, runEvidenceRecord: [], runFormatRecord: [], runHistoryRecord: [] };
    const keep = r => { if (r.program && !env.program) env.program = r.program; if (r.proposal) env.program = r.proposal;
      if (Array.isArray(r.actualLedger)) env.actualLedger = r.actualLedger; else if (Array.isArray(r.carriedRecord)) env.actualLedger = r.carriedRecord;
      if (r.referenceState !== undefined && r.referenceState !== null) env.referenceState = r.referenceState; if (r.updatedModel) env.athleteModel = r.updatedModel;
      for (const k of CARRIED) if (Array.isArray(r[k])) env[k] = r[k]; return r; };
    const input = (kind, asOf, facts, eventId) => { const weekIndex = Math.floor((Date.parse(asOf.slice(0, 10) + 'T00:00:00Z') - Date.parse(env.program.startDate + 'T00:00:00Z')) / (7 * 864e5));
      return { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf, weekIndex, event: { id: eventId, kind }, ...facts,
        ...(env.actualLedger.length ? { actualLedger: env.actualLedger } : {}), ...(env.referenceState ? { referenceState: env.referenceState } : {}), ...(env.athleteModel ? { athleteModel: env.athleteModel } : {}),
        runEvidenceRecord: env.runEvidenceRecord, runFormatRecord: env.runFormatRecord, runHistoryRecord: env.runHistoryRecord }; };
    return j.steps.map(s => {
      try {
        let r;
        if (s.op === 'onboard') { r = M.core.generateProgram(copy(s.intake)); if (r.status === 'PROPOSED') keep(r); }
        else if (s.op === 'review') r = keep(M.core.evaluateProgram(env.program, input(s.kind, s.asOf, copy(s.facts), s.eventId)));
        else if (s.op === 'probe') r = M.core.evaluateProgram(env.program, input(s.kind, s.asOf, copy(s.facts), s.eventId));
        else if (s.op === 'restart') { r = M.core.restartProgram({ intake: copy(s.intake), record: env.actualLedger, referenceState: env.referenceState, asOf: s.asOf, athleteId: env.program ? env.program.athleteId : null, runEvidenceRecord: env.runEvidenceRecord, runFormatRecord: env.runFormatRecord, runHistoryRecord: env.runHistoryRecord });
          if (r.status === 'PROPOSED') { env.program = r.program; env.referenceState = null; keep(r); } }
        else if (s.op === 'roundtrip') { env = JSON.parse(JSON.stringify(env)); return { op: 'roundtrip', persisted: H(PERSISTED.map(k => env[k])) }; }
        const fc = r.runForecast;
        return { op: s.op, status: r.status ?? null, proposal: !!r.proposal, expiry: r.authorityExpiry ?? null, namespace: env.program ? (env.program.sessionNamespace ?? null) : null,
          answer: H(r), stable: H(stable(r)), persisted: H(PERSISTED.map(k => env[k])), forecast: fc ? { status: fc.status ?? null, reason: fc.reason ?? null } : null };
      } catch (e) { return { op: s.op, ...errorOf(e) }; }
    });
  }
  const out = { journeys: input.journeys.map(j => ({ name: j.name, steps: run(j) })) };
  // C-3: the anchor hash under the device's default collator and each listed one (the engine must not call localeCompare at all).
  const LC = String.prototype.localeCompare; let calls = 0; out.anchors = {};
  try { for (const l of ['default', ...input.locales]) { String.prototype.localeCompare = function (b) { calls++; return l === 'default' ? LC.call(this, b) : LC.call(this, b, l); }; out.anchors[l] = H(M.contract.anchorConfigurationHash(copy(input.anchors))); } }
  finally { String.prototype.localeCompare = LC; }
  out.localeCompareCalls = calls;
  out.defaultLocale = (typeof Intl !== 'undefined' && Intl.Collator) ? new Intl.Collator().resolvedOptions().locale : null;
  // The cross-runtime digest leaves out `answer` (the whole answer, runForecast internals included, RFC-NUMERIC-1): it is compared per step apart.
  out.digest = H({ journeys: out.journeys.map(j => j.steps.map(({ answer, ...s }) => s)), anchors: out.anchors, localeCompareCalls: out.localeCompareCalls });
  return JSON.stringify(out);
};
