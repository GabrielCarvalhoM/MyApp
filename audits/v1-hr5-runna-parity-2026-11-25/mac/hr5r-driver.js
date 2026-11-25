// V1HR5R native validation (2026-11-25): the driver of the corrected five-zone journeys (V1X-HR-FIVE-ZONE-2), copied from V1HR5's hr5-driver.js
// and widened with what the correction adds (the reference's provenance, the boundary source, the athlete's profile, setHeartRateProfile).
// Originally: final-driver.js (V1 final physical validation) widened with what V1HR5 added. The SAME text runs in Node over the native ESM namespaces (hr5-oracle.mjs) and in the Mac and iPhone JSContext over the
// bundle's module registry (FiveZoneTests). It replays recorded synthetic operations through createIntegration and the frozen api.mjs over a
// memory store and anchor (or the native file store and Keychain anchor), with a deterministic id source and the clock of each step. Beside the
// digests of final-driver.js, each step reports a READABLE summary of the five zones and of the three zones the record holds (status, reason,
// reference, edges, the per-session heart-rate roles), so a divergence is visible as a sporting value, not only as a hash. It decides nothing.
// M = { integration, store, api, value, newStore?, newAnchor? }; input = { key, journeys: [{name, athleteId, steps:[{op, at, args}]}] }
globalThis.__hr5 = function (M, inputJSON) {
  const input = JSON.parse(inputJSON), H = v => M.value.hash(v);
  const errorOf = e => ({ error: e && e.constructor ? e.constructor.name : typeof e });
  const viewOf = r => r && r.view && typeof r.view === 'object' ? r.view : null;
  const strip = (v, drop) => Array.isArray(v) ? v.map(x => strip(x, drop)) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).filter(k => !drop.includes(k)).map(k => [k, strip(v[k], drop)])) : v;
  // As final-driver.js (RFC-NUMERIC-1): the Race Forecast's unrounded math-library bits may differ by an ULP between runtimes, so a step also
  // carries its digests without any `runForecast` (and the seal over it). A step whose full digests differ is EXPLAINED_LIBM only if these, the
  // canonical record, and the readable five- and three-zone summaries (with the five-zone digest) are all equal; anything else is DIVERGED.
  const docDigests = raw => { if (raw === null || raw === undefined) return { stored: null, storedSans: null, canonical: null }; const d = JSON.parse(raw); return { stored: H(d), storedSans: H(strip(d, ['runForecast', 'carriedMac'])), canonical: H(strip(d, ['carried', 'carriedMac'])) }; };
  // The readings the record keeps (carried.presentation.readings), or the ones an answer carries (presentation()).
  const readingsOf = (r, raw) => (r && r.readings) || (raw ? (((JSON.parse(raw).carried || {}).presentation || {}).readings || null) : null);
  const five = rc => {
    const z = rc && rc.heartRateFiveZones; if (!z) return null;
    const roles = {}; for (const id of Object.keys(z.sessions || {}).sort()) { const s = z.sessions[id], k = s.role + (s.slowDownCueAtOrAboveBpm != null ? '@' + s.slowDownCueAtOrAboveBpm : '') + (s.reason ? ':' + s.reason : '') + (s.primary ? ':PRIMARY' : ''); roles[k] = (roles[k] || 0) + 1; }
    return { status: z.status, reason: z.reason || null, reference: z.reference ? z.reference.kind + ':' + z.reference.bpm + ':' + (z.reference.evidenceId || z.reference.provenance) : null,
      boundarySource: z.boundarySource || null, profile: z.profile ? [z.profile.ageYears, z.profile.declaredMaximumBpm, (z.profile.customZoneUpperBpm || []).join('/')].join('|') : null,
      disclosures: (z.disclosures || []).join(','), measurements: (z.measurements || []).map(m => m.sensor + ':' + m.bpm + ':' + m.zone).join(','), notUsed: (z.notUsed || []).map(x => x.kind + ':' + x.reason).join(','),
      referenceConfidence: z.referenceConfidence || null, zoneModelConfidence: z.zoneModelConfidence || null, conflict: z.conflict ? z.conflict.status + ':' + z.conflict.labMaxBpm + '<' + z.conflict.observedMaxBpm + ':' + z.conflict.differenceBpm : null,
      edges: z.zones ? z.zones.map(x => x.zone + ':' + (x.minBpm === null ? '' : x.minBpm) + '-' + (x.maxBpm === null ? '' : x.maxBpm)).join(' ') : null,
      flags: [z.primaryGuidance, z.sessionTarget, z.gatesProgression, z.convertedToPaceOrEffort].map(String).join(','),
      roles: Object.keys(roles).sort().map(k => k + ' x' + roles[k]).join(', '), digest: H(z) };
  };
  const three = rc => { const z = rc && rc.heartRateZones; return z ? { status: z.status, reason: z.reason || null, basis: z.basis || null, edges: z.zones ? z.zones.map(x => x.name + ':' + (x.lowBpm === null ? '' : x.lowBpm) + '-' + (x.highBpm === null ? '' : x.highBpm)).join(' ') : null, digest: H(z) } : null; };
  function run(j) {
    let clock = 0, n = 0, it = null, api = null;
    const store = M.newStore ? M.newStore(j.name) : M.store.memoryStore(), m = new Map(), kept = new Map();
    const anchor = M.newAnchor ? M.newAnchor(j.name) : { get: id => (m.has(id) ? { ...m.get(id) } : null), set: (id, v) => m.set(id, { ...v }), clear: id => m.delete(id) };
    const open = () => {
      it = M.integration.createIntegration({ store, key: j.key || input.key, clock: () => clock, anchor, newId: p => p + '_' + String(++n).padStart(6, '0') });
      api = M.api.createBoundary({ custody: it, now: () => clock });
    };
    open();
    return j.steps.map(s => {
      clock = s.at;
      const args = JSON.parse(JSON.stringify(s.args || {})), who = args.athleteId || j.athleteId;
      try {
        if (s.op === 'reopen') { open(); return { op: s.op }; }
        if (s.op.startsWith('raw.')) {
          const raw = store.raw(who);
          if (s.op === 'raw.keep') kept.set(who, raw);
          else if (s.op === 'raw.restore') store.setRaw(who, kept.get(who));
          else if (s.op === 'raw.tamper') { const i = raw.indexOf(args.find); if (i < 0) throw new Error('tamper target'); store.setRaw(who, raw.slice(0, i) + args.replace + raw.slice(i + args.find.length)); }
          else throw new Error('unknown raw op');
          return { op: s.op, ...docDigests(store.raw(who)) };
        }
        const [side, name] = s.op.split('.'), target = side === 'it' ? it : side === 'api' ? api : null;
        if (!target || typeof target[name] !== 'function') throw new Error('unknown op');
        const r = target[name]({ actor: { athleteId: j.athleteId }, ...args });
        const raw = store.raw(j.athleteId), v = viewOf(r), rd = r.ok === false ? null : readingsOf(r, raw), rc = rd ? rd.runCalibration : null;
        return { op: s.op, code: r.ok === false ? r.error.code : 'OK', status: r.status || null, version: r.version || null, replayed: r.replayed === true, profileRows: (((raw ? JSON.parse(raw).carried : null) || {}).records || {}).heartRateProfileRecord ? JSON.parse(raw).carried.records.heartRateProfileRecord.length : null,
          state: v ? v.state : (typeof r.state === 'string' ? r.state : null), hold: v ? (v.hold ? v.hold.exit : null) : null,
          fiveZones: five(rc), threeZones: three(rc), calibration: rc ? rc.status : null,
          answer: H(r), answerSans: H(strip(r, ['runForecast', 'carriedMac'])), ...docDigests(raw) };
      } catch (e) { return { op: s.op, ...errorOf(e) }; }
    });
  }
  const out = { journeys: input.journeys.map(j => ({ name: j.name, steps: run(j) })) };
  out.digest = H(out.journeys);
  return JSON.stringify(out);
};
// The five-zone module itself, called directly (the same text in Node and in the JSContext): the inclusive limits for every maximum of the
// declared range (120-230), every age 18-80 (220 - age), the zone of readings on, between and around the edges (fractions round half up), custom
// limits and their refusals, the sample classifier (strap and optical, defaults and given limits), and the refusal of impossible maxima.
globalThis.__hr5units = function (Z, inputJSON) {
  const input = JSON.parse(inputJSON), V = Z.HR5_VALUES, out = { pinned: Z.HR5_SHA256, fileSha256: Z.HR5_FILE_SHA256, valid: !!V, edges: {}, ages: {} };
  const lim = z => z ? z.slice(0, 4).map(x => x.maxBpm).join(',') : null;
  for (let b = input.from; b <= input.to; b++) out.edges[b] = lim(Z.zonesFromMaximum(b, V));
  for (let a = input.ageFrom; a <= input.ageTo; a++) out.ages[a] = lim(Z.zonesFromMaximum(220 - a, V));
  const z = Z.zonesFromMaximum(input.reference, V);
  out.readings = input.readings.map(b => Z.zoneOfBpm(z, b, input.limits.plausibleBpm));
  out.readingsWithoutRange = Z.zoneOfBpm(z, 150);
  out.custom = input.custom.map(c => lim(Z.zonesFromCustomLimits(c, V)));
  out.classified = Z.classifySamples(z, input.series, input.limits);
  out.classifiedOptical = Z.classifySamples(z, Object.assign({}, input.series, { sensor: 'OPTICAL' }), input.limits);
  out.classifiedWithDefaults = Z.classifySamples(z, input.series, {});
  out.refused = input.bad.map(b => Z.zonesFromMaximum(b, V));
  return JSON.stringify(out);
};
