// Front B's recommended test double (contract §8): the REAL frozen `createIntegration` over `memoryStore` and the synthetic athlete of
// CoachingCore/test/v1int-helpers.mjs (read only; nothing in CoachingCore is changed or written). It plays front A's part as far as B can
// see it: `ingestContext()` from the verified record and plan, and `deliver()` = `importActivities` on the current version, with A's own
// §6.1 handling (CONFLICT_STALE_VERSION / REQUEST_ID_REUSED: a fresh id `<deliveryId>~<n>`, at most 3; BUSY: same id, at most 3). The
// failure code and index go back verbatim; Swift maps them with the shared `BoundaryDisposition.of(code:index:)`. No code is invented.
//
// Protocol: one JSON request per stdin line {id, op, ...}; one JSON answer per stdout line {id, ok, result | error}.
import readline from 'node:readline';
const H = await import(process.argv[2]);
let t = null;
const localDay = (instant, off) => new Date(Date.parse(instant) + off * 60000).toISOString().slice(0, 10);
const runSessionsOf = doc => doc.program.weeks.flatMap(w => w.sessions).filter(s => s.sport === 'RUN').map(s => ({ sessionId: s.id, day: s.date }));

function deliver({ deliveryId, activities }) {
  let rid = deliveryId, busy = 0, stale = 0;
  for (;;) {
    const r = t.it.importActivities({ actor: t.actor, clientRequestId: rid, expectedVersion: t.version(), activities });
    if (r.ok) return { kind: 'answered', version: r.version, replayed: !!r.replayed, activities: r.activities };
    const code = r.error.code;
    if ((code === 'CONFLICT_STALE_VERSION' || code === 'REQUEST_ID_REUSED') && stale < 3) { stale++; rid = `${deliveryId}~${stale}`; continue; }
    if (code === 'BUSY' && busy < 3) { busy++; continue; }
    return { kind: 'failure', code, index: Number.isInteger(r.error.index) ? r.error.index : null };
  }
}

const ops = {
  init: ({ athleteId, start }) => { t = H.athlete({ id: athleteId, ...(start ? { start } : {}) }); const e = t.enroll(); if (!e.ok) throw new Error(e.error.code); return { version: t.version() }; },
  set: ({ day, time }) => { t.set(day, time); return {}; },
  sessions: ({ week }) => t.sessions(week).map(s => ({ id: s.id, date: s.date, sport: s.sport })),
  context: () => {
    const o = t.it.read({ actor: t.actor });
    if (!o.ok) return { kind: 'unavailable', code: o.error.code };
    const off = o.doc.program.timezoneOffsetMinutes ?? 0;
    return { kind: 'ready', recordStartDay: localDay(o.doc.createdAt, off), timezoneOffsetMinutes: off, runSessions: runSessionsOf(o.doc), version: o.doc.version };
  },
  deliver,
  // The athlete answers the warning-sign screen through their own channel (as the app does): what releases an ASK.
  screen: ({ day }) => { const s = t.screen(H.ELIG(day)); if (!s.ok) throw new Error(s.error.code); return { version: t.version() }; },
  // G07 path of v1bc-blocker-closure (SCREEN_REQUIRED): a symptom stop, a report of how the athlete feels, and its erasure, which erases
  // the stored screen: the device channel then waits for a new one.
  eraseScreen: ({ sessionId }) => {
    const s = t.sessions(0).find(x => x.id === sessionId);
    t.set(s.date, '20:00');
    t.weekly(s.date, [{ ...t.form(s), actual: { completed: false, minutes: 12, stop: { reason: 'SYMPTOM' } }, response: H.U }]);
    t.set(s.date, '21:00');
    const nf = t.api.notFeeling100({ actor: t.actor, clientRequestId: 'nf-double', expectedVersion: t.version(), ...H.notFeeling100WithSign(s.date) });
    if (!nf.ok) throw new Error(nf.error.code);
    t.set(s.date, '21:30');
    const e = t.it.eraseHealthFacts({ actor: t.actor, eventIds: [nf.eventId], expectedVersion: t.version() });
    if (!e.ok) throw new Error(e.error.code);
    return { version: t.version() };
  },
  // Rows on record that came from HealthKit (live, not superseded), by activity: the "no double credit" oracle.
  deviceRows: () => t.rows().filter(o => o.source?.provider === 'HEALTHKIT' && o.superseded !== true)
    .map(o => ({ eventId: o.eventId, activityId: o.canonicalActivityId, sessionId: o.sessionId ?? null })),
  version: () => ({ version: t.version() }),
  // The athlete's own report of a planned session (their form, ATHLETE channel), e.g. the report of an iPhone recording (front C).
  reportSession: ({ sessionId, day, time }) => {
    const s = t.sessions(0).find(x => x.id === sessionId) ?? t.sessions(1).find(x => x.id === sessionId);
    t.set(day ?? s.date, time ?? '20:00');
    const r = t.weekly(day ?? s.date, [t.form(s)]);
    if (!r.ok) throw new Error(r.error.code);
    return { eventId: r.recorded[0] ?? null, version: t.version() };
  },
  // Live rows of a session (one per run done), with the voices each row holds.
  liveRows: ({ sessionId }) => t.live(sessionId).map(o => ({ eventId: o.eventId, provider: o.source?.provider ?? null,
    parts: Object.keys(o.provenance?.parts ?? {}).length, merged: (o.provenance?.mergedSourceIds ?? []).length })),
  // A delivery sent as front A would, but with a request id the test chooses (to show what the custody answers for a reused id).
  importWithId: ({ clientRequestId, activities }) => {
    const r = t.it.importActivities({ actor: t.actor, clientRequestId, expectedVersion: t.version(), activities });
    return r.ok ? { ok: true, replayed: !!r.replayed, activities: r.activities } : { ok: false, code: r.error.code };
  },
};

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  let req;
  try { req = JSON.parse(line); } catch { return; }
  let out;
  try { out = { id: req.id, ok: true, result: ops[req.op](req) }; } catch (e) { out = { id: req.id, ok: false, error: String(e?.message ?? e) }; }
  process.stdout.write(JSON.stringify(out) + '\n');
});
