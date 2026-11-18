// P0 focal coverage driver (QRE-P0-04: localeCompare and toSorted, which J5 and P16 call zero times).
// The SAME text runs in Node over the native ESM namespaces (lab/focal-oracle.mjs) and in the device JSContext over the bundle's own module
// registry (FocalTests.swift). It only calls real engine functions on frozen inputs (the R5 independent holdout corpus, the dev authority,
// the r5-learning test contract's observation shape) and returns digests made by the engine's own hash, so any engine or locale difference
// in an ordering shows up as a digest difference. It adds no training rule and no sporting scenario.
// M = { r6: r6-index, sched: r5-schedule, learn: r5-learning, value: value }   input = { corpus, authority, eventIds, locales }
globalThis.__p0focal = function (M, inputJSON) {
  const input = JSON.parse(inputJSON), H = v => M.value.hash(v), copy = v => JSON.parse(JSON.stringify(v));
  const errorOf = e => ({ error: e && e.constructor ? e.constructor.name : typeof e }); // never the message: engine-specific text (QRE-P0-03)
  const LC = String.prototype.localeCompare, TS = Array.prototype.toSorted;
  const pairs = new Map(); let lcCalls = 0, tsCalls = 0;
  String.prototype.localeCompare = function (b, ...rest) {
    lcCalls++; const a = String(this), s = String(b);
    if (rest.length === 0 && !pairs.has(a + '\u0000' + s)) pairs.set(a + '\u0000' + s, [a, s]);
    return LC.call(this, b, ...rest);
  };
  Array.prototype.toSorted = function (...args) { tsCalls++; return TS.apply(this, args); };
  const counts = {}, mark = k => { counts[k] = { localeCompare: lcCalls, toSorted: tsCalls }; };
  const out = {};
  try {
    // A. generateProgram on the 24 frozen R5 holdout inputs: r5-contract validateAvailability (toSorted) and anchorConfigurationHash (localeCompare).
    out.generate = input.corpus.cases.map(k => {
      try { const r = M.r6.generateProgram(copy(k.programInput), { authority: input.authority }); return { caseId: k.caseId, status: r.status ?? null, digest: H(r) }; }
      catch (e) { return { caseId: k.caseId, ...errorOf(e) }; }
    });
    mark('generate');
    // B. scheduleCandidates/chooseSchedule on the same frozen availability and anchors (as r5-program.mjs calls them): the r5-schedule ordering.
    out.schedule = input.corpus.cases.map(k => {
      const p = k.programInput;
      try {
        const c = M.sched.scheduleCandidates(copy(p.athlete.anchors), copy(p.availability), copy(p.scheduleOptions), p.asOf, { allowOmissions: true });
        return { caseId: k.caseId, digest: H({ candidates: c, chosen: M.sched.chooseSchedule(c, p.athlete.goal?.priority) }) };
      } catch (e) { return { caseId: k.caseId, ...errorOf(e) }; }
    });
    mark('schedule');
    // C. r5-learning with the observation shape of CoachingCore/test/r5-learning.test.mjs; ties in observedAt, a conflicting eventId, a reused
    // source and a purpose refusal make the three sorts (accepted, excluded, evidence rows) compare by string.
    const asOf = '2026-10-25T12:00:00Z', context = { family: 'EASY', modality: 'RUN', phase: 'BUILD', doseKey: 'EASY_30', arrangement: 'SPLIT' };
    const obs = (id, n, at, over = {}) => ({ eventId: id, athleteId: 'SYNTHETIC_A', sessionId: 'S_' + id, observedAt: at, origin: 'ACTUAL_EXECUTION',
      sourceHash: H({ syntheticEvent: id }), plannedPrescriptionHash: H({ syntheticPlan: 'EASY_30' }), actual: { completed: true, minutes: 30 },
      response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET' }, context: copy(context), comparable: true, confounded: false, ...over });
    const days = ['2026-10-04T10:00:00Z', '2026-10-11T10:00:00Z', '2026-10-18T10:00:00Z'];
    const batch = input.eventIds.map((id, i) => obs(id, i, days[i % days.length])).reverse();
    const conflict = { ...batch[0], actual: { completed: true, minutes: 31 } };
    const reused = obs('EV_REUSED', 99, days[0], { sourceHash: batch[1].sourceHash });
    const model = () => M.learn.createLearningModel({ athleteId: 'SYNTHETIC_A', purposeAllowed: true, asOf });
    try {
      const m1 = M.learn.updateLearningModel(model(), batch, { asOf, purposeAllowed: true });
      const m2 = M.learn.updateLearningModel(m1, [conflict, reused], { asOf, purposeAllowed: true });
      const m3 = M.learn.updateLearningModel(model(), batch, { asOf, purposeAllowed: false });
      const ev = M.learn.evidenceFor(m2, context, { asOf });
      out.learning = { accepted: m1.observations.map(o => o.eventId), m1: H(m1), m2: H(m2), m3: H(m3), excludedReasons: m2.excluded.map(e => e.reason).concat(m3.excluded.map(e => e.reason)), evidence: H(ev) };
    } catch (e) { out.learning = errorOf(e); }
    mark('learning');
  } finally { String.prototype.localeCompare = LC; Array.prototype.toSorted = TS; }
  // D. The comparisons the engine actually made (default locale), re-judged under each locale and by UTF-16 code units.
  const sign = x => (x < 0 ? -1 : x > 0 ? 1 : 0), list = [...pairs.values()];
  const table = { default: list.map(([a, b]) => sign(LC.call(a, b))), codeUnits: list.map(([a, b]) => (a < b ? -1 : a > b ? 1 : 0)) };
  for (const l of input.locales) table[l] = list.map(([a, b]) => sign(LC.call(a, b, l)));
  const differ = k => list.filter((_, i) => table[k][i] !== table.default[i]).map(([a, b], j) => [a, b]);
  out.collation = {
    defaultLocale: new Intl.Collator().resolvedOptions().locale, pairs: list.length, pairsDigest: H(list), signs: Object.fromEntries(Object.entries(table).map(([k, v]) => [k, H(v)])),
    differFromDefault: Object.fromEntries(Object.keys(table).filter(k => k !== 'default').map(k => [k, differ(k).length])),
    codeUnitExamples: differ('codeUnits').slice(0, 5),
    // The pairs and signs themselves: sort algorithms differ between engines (V8 TimSort, JSC merge sort), so each engine compares a
    // different set of pairs for the same result; the device re-judges Node's pairs too.
    list, table
  };
  out.counts = counts;
  out.digest = H({ generate: out.generate, schedule: out.schedule, learning: out.learning });
  return JSON.stringify(out);
};
