// V1 CoachingCore Integration Boundary (2026-11-23): focal driver for the Mac/iPhone run of the integration boundary (the core-driver.js
// pattern). The SAME text runs in Node over the native ESM namespaces (int-oracle.mjs) and in the device JSContext over the bundle's own module
// registry. It replays frozen synthetic operations (precomputed by the Node oracle) through createIntegration over a memory store, with a
// deterministic id source and the clock of each step, and returns digests made by the engine's own hash. It adds no training rule.
// M = { integration: integration.mjs, store: store.mjs, value: value.mjs }
// input = { key, journeys: [{name, athleteId, steps:[{op, at, args}]}] }   op: enroll | submit | importActivities | restart | read | carried
globalThis.__intfocal = function (M, inputJSON) {
  const input = JSON.parse(inputJSON), H = v => M.value.hash(v);
  const errorOf = e => ({ error: e && e.constructor ? e.constructor.name : typeof e }); // never the message (QRE-P0-03)
  function run(j) {
    let clock = 0, n = 0;
    const store = M.store.memoryStore(), actor = { athleteId: j.athleteId };
    const it = M.integration.createIntegration({ store, key: input.key, clock: () => clock, newId: p => p + '_' + String(++n).padStart(6, '0') });
    return j.steps.map(s => {
      clock = s.at;
      try {
        const r = it[s.op]({ actor, ...JSON.parse(JSON.stringify(s.args)) });
        const raw = store.raw(j.athleteId);
        return { op: s.op, code: r.ok === false ? r.error.code : 'OK', status: r.status ?? null, version: r.version ?? null,
          recorded: Array.isArray(r.recorded) ? r.recorded.length : null, screen: r.warningSignScreen && r.warningSignScreen.reason ? r.warningSignScreen.reason : null,
          answer: H(r), stored: raw === null ? null : H(JSON.parse(raw)) };
      } catch (e) { return { op: s.op, ...errorOf(e) }; }
    });
  }
  const out = { journeys: input.journeys.map(j => ({ name: j.name, steps: run(j) })) };
  out.digest = H(out.journeys);
  return JSON.stringify(out);
};
