// REPMILE CoachingCore V1 final physical validation (2026-11-24): the driver of the final journeys, the int-driver.js pattern widened to the
// whole surface the app consumes. The SAME text runs in Node over the native ESM namespaces (final-oracle.mjs, final-vm-check.mjs) and in the
// device JSContext over the bundle's module registry (NativeBoundaryTests.testFinalJourneys). It replays frozen synthetic operations through
// createIntegration and the frozen api.mjs over a memory store and a memory anchor, with a deterministic id source and the clock of each step,
// and returns digests made by the engine's own hash. It adds no training rule and decides nothing.
// M = { integration: integration.mjs, store: store.mjs, api: api.mjs, value: value.mjs, newStore?, newAnchor? }
//   newStore(journeyName) / newAnchor(journeyName), when given, replace the memory store and the memory anchor (the device's native file store
//   and Keychain anchor); the expected answers and stored digests are the same, since a store keeps JSON text and an anchor {version, docMac}.
// input = { key, journeys: [{name, athleteId, steps:[{op, at, args}]}] }
//   op 'it.<name>'   an integration operation (enroll, submit, importActivities, restart, eraseHealthFacts, setConsent, accept, decline, ...)
//   op 'api.<name>'  an api.mjs operation over the same integration (onboard, logRun, notFeeling100, declareReadiness, plan, status, ...)
//   op 'reopen'      a new integration and api over the same store and anchor (a new process over the persisted bytes)
//   op 'raw.keep' / 'raw.restore' / 'raw.drop' / 'raw.tamper'   storage faults on the athlete named in args (a backup kept and restored, the
//                    file lost, one stored character altered)
globalThis.__finalfocal = function (M, inputJSON) {
  const input = JSON.parse(inputJSON), H = v => M.value.hash(v);
  const errorOf = e => ({ error: e && e.constructor ? e.constructor.name : typeof e }); // never the message (QRE-P0-03)
  const viewOf = r => r && r.view && typeof r.view === 'object' ? r.view : null;
  // RFC-NUMERIC-1 (Mac README §5): the Race Forecast's unrounded math-library bits may differ by an ULP between runtimes. The boundary keeps the
  // last answer's readings (carried.presentation.readings, a projection for the app, never sent to the engine), the forecast among them, so a
  // step also reports its digests without any `runForecast` (and without the carried MAC that seals them), the digest of the canonical record
  // (the stored document without the carried projections), and the forecasts at 9 significant digits (their own hashes left out). A step whose
  // full digests differ while all of these are equal is EXPLAINED_LIBM; anything else that differs is DIVERGED.
  const strip = (v, drop) => Array.isArray(v) ? v.map(x => strip(x, drop)) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).filter(k => !drop.includes(k)).map(k => [k, strip(v[k], drop)])) : v;
  const coarse = v => Array.isArray(v) ? v.map(coarse) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).filter(k => k !== 'hash').map(k => [k, coarse(v[k])])) : typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v) ? Number(v.toPrecision(9)) : v;
  const forecasts = (v, out) => { if (Array.isArray(v)) v.forEach(x => forecasts(x, out)); else if (v && typeof v === 'object') for (const k of Object.keys(v)) { if (k === 'runForecast') out.push(coarse(v[k])); else forecasts(v[k], out); } return out; };
  const docDigests = raw => { if (raw === null || raw === undefined) return { stored: null, storedSans: null, canonical: null }; const d = JSON.parse(raw);
    return { stored: H(d), storedSans: H(strip(d, ['runForecast', 'carriedMac'])), canonical: H(strip(d, ['carried', 'carriedMac'])) }; };
  function run(j) {
    let clock = 0, n = 0, it = null, api = null;
    const store = M.newStore ? M.newStore(j.name) : M.store.memoryStore(), m = new Map(), kept = new Map();
    const anchor = M.newAnchor ? M.newAnchor(j.name) : { get: id => (m.has(id) ? { ...m.get(id) } : null), set: (id, v) => m.set(id, { ...v }), clear: id => m.delete(id) };
    const open = () => {
      it = M.integration.createIntegration({ store, key: j.key ?? input.key, clock: () => clock, anchor, newId: p => p + '_' + String(++n).padStart(6, '0') });
      api = M.api.createBoundary({ custody: it, now: () => clock });
    };
    open();
    return j.steps.map(s => {
      clock = s.at;
      const args = JSON.parse(JSON.stringify(s.args ?? {})), who = args.athleteId ?? j.athleteId;
      try {
        if (s.op === 'reopen') { open(); return { op: s.op }; }
        if (s.op.startsWith('raw.')) {
          const raw = store.raw(who);
          if (s.op === 'raw.keep') kept.set(who, raw);
          else if (s.op === 'raw.restore') store.setRaw(who, kept.get(who));
          else if (s.op === 'raw.drop') store.remove(who);
          else if (s.op === 'raw.tamper') { const i = raw.indexOf(args.find); store.setRaw(who, raw.slice(0, i) + args.replace + raw.slice(i + args.find.length)); }
          else throw new Error('unknown raw op');
          const now = store.raw(who), d = docDigests(now);
          return { op: s.op, ...d, forecastCoarse: H(now === null ? [] : forecasts(JSON.parse(now), [])) };
        }
        const [side, name] = s.op.split('.'), target = side === 'it' ? it : side === 'api' ? api : null;
        if (!target || typeof target[name] !== 'function') throw new Error('unknown op');
        const r = target[name]({ actor: { athleteId: j.athleteId }, ...args });
        const raw = store.raw(j.athleteId), v = viewOf(r), d = docDigests(raw);
        return { op: s.op, code: r.ok === false ? r.error.code : 'OK', status: r.status ?? null, version: r.version ?? null,
          recorded: Array.isArray(r.recorded) ? r.recorded.length : null, duplicate: r.duplicate === true ? true : null, replayed: r.replayed === true ? true : null,
          screen: r.warningSignScreen && r.warningSignScreen.reason ? r.warningSignScreen.reason : null,
          activities: Array.isArray(r.activities) ? r.activities.map(a => a.outcome + (a.reason ? ':' + a.reason : '')) : null,
          state: v ? v.state : (typeof r.state === 'string' ? r.state : null),
          executable: v && v.week ? v.week.sessions.filter(x => x.executable).length : null,
          hold: v ? (v.hold ? v.hold.exit : null) : null,
          answer: H(r), answerSans: H(strip(r, ['runForecast', 'carriedMac'])), ...d,
          forecastCoarse: H(forecasts(r, raw === null ? [] : forecasts(JSON.parse(raw), []))) };
      } catch (e) { return { op: s.op, ...errorOf(e) }; }
    });
  }
  const out = { journeys: input.journeys.map(j => ({ name: j.name, steps: run(j) })) };
  out.digest = H(out.journeys);
  return JSON.stringify(out);
};
