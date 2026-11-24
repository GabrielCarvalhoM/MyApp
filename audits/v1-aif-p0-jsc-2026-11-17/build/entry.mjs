// P0 bridge facade: the only surface the host calls. It wraps the AIF reference client (harness/lib.mjs) and returns small JSON strings
// (status, hashes, timings, APP-VIEW-0 projections), never the envelope or an answer, except on the two explicit paths that need them:
// exportEnvelope (the host persists it) and, in diagnostic mode only, the full answer for a field-level comparison with the oracle.
// It adds no training rule: every decision is the engine's answer as the client keeps it.
import * as L from '../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs';
import { comparisonDigests } from './compare.mjs';
// Core Safety & Lifecycle (2026-11-18): the successor's composed entry point is carried in the bundle for its focal revalidation
// (audits/v1-core-safety-lifecycle-2026-11-18/mac); the facade below and its J5/P16 journeys are unchanged.
import * as CORE from '../../../CoachingCore/src/v1-safety-index.mjs';
export const coreEngine = CORE.V1_CORE_ENGINE;
// Final physical validation (Mac README §14 step 2): the integration boundary the app consumes (createIntegration, the frozen api.mjs over it,
// and the reference store adapters) is carried in the bundle, so the device validates the boundary and not only the engine. Imported after the
// engine so every earlier module keeps its id (core.json names modules by id). The facade below is unchanged.
import * as INTEGRATION from '../../../CoachingCore/src/boundary/integration.mjs';
import * as STORE from '../../../CoachingCore/src/boundary/store.mjs';
import * as BOUNDARY_API from '../../../CoachingCore/src/boundary/api.mjs';
export const integration = INTEGRATION, store = STORE, boundaryApi = BOUNDARY_API;

let client = null, snapshot = null;
const now = () => performance.now();
const out = o => JSON.stringify(o);
const tree = v => (v && typeof v === 'object' && !Array.isArray(v)) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, L.digestOf(v[k])])) : null;
const p0 = () => (typeof __p0 === 'undefined' ? null : __p0);
function report(r, ms, opts) {
  const o = { status: r.status, action: r.action ?? null, reason: typeof r.reason === 'string' ? r.reason : null, engineMs: ms,
    version: client.envelope.version, ledgerRows: client.envelope.actualLedger.length, programHash: client.envelope.program?.hash ?? null };
  if (opts.digest) { const t0 = now(); o.answerDigest = L.digestOf(r); o.envelopeDigest = L.digestOf(client.envelope); Object.assign(o, comparisonDigests(r, client.envelope)); o.digestMs = now() - t0; }
  if (opts.tree) o.tree = tree(r);
  if (opts.answer) o.answer = r;
  if (opts.overhead) { const t0 = now(); JSON.stringify(r); o.answerStringifyMs = now() - t0; }
  return out(o);
}
const parseOpts = s => (s ? JSON.parse(s) : {});

export const api = Object.freeze({
  engine: L.S.V1_STRENGTH_ENGINE,
  /** A fresh client (empty envelope). */
  reset() { client = L.createClient(); snapshot = null; return out({ ok: true, engine: L.S.V1_STRENGTH_ENGINE }); },
  onboard(intakeJSON, optsJSON) {
    const intake = JSON.parse(intakeJSON), t0 = now(), r = client.onboard(intake), ms = now() - t0;
    return report(r, ms, parseOpts(optsJSON));
  },
  review(kind, asOf, factsJSON, eventId, optsJSON) {
    const facts = JSON.parse(factsJSON), t0 = now(), r = client.review(kind, asOf, facts, eventId ? { eventId } : {}), ms = now() - t0;
    return report(r, ms, parseOpts(optsJSON));
  },
  /** Persistence path: the whole envelope as JSON, for the host's atomic write. */
  exportEnvelope() { return JSON.stringify(client.envelope); },
  envelopeDigest() { return L.digestOf(client.envelope); },
  /** Restore from the persisted JSON (a new client over it, as the AIF restore does). */
  restore(envelopeJSON) {
    const t0 = now(), env = JSON.parse(envelopeJSON);
    if (env.schema !== L.ENVELOPE_SCHEMA || env.engine !== L.S.V1_STRENGTH_ENGINE) return out({ ok: false, error: 'ENVELOPE_OF_ANOTHER_VERSION' });
    client = L.createClient({ envelope: env });
    return out({ ok: true, ms: now() - t0, version: client.envelope.version, ledgerRows: client.envelope.actualLedger.length });
  },
  /** Keeps the current envelope inside the context, for repeated reviews on one fixed state without crossing the bridge. */
  takeSnapshot() { snapshot = JSON.stringify(client.envelope); return out({ ok: true, chars: snapshot.length }); },
  restoreSnapshot() { const t0 = now(); client = L.createClient({ envelope: JSON.parse(snapshot) }); return out({ ok: true, ms: now() - t0 }); },
  /** An APP-VIEW-0 projection, the only thing a screen would receive. */
  view(name, nowMs) {
    const t0 = now(), env = client.envelope;
    const v = name === 'TODAY' ? L.todayView(env, { nowMs }) : name === 'WEEK' ? L.weekView(env, { nowMs }) : name === 'INSIGHTS' ? L.insightsView(env) : null;
    if (!v) throw new Error('unknown view ' + name);
    const json = JSON.stringify(v);
    return out({ ms: now() - t0, chars: json.length, view: json });
  },
  /** Host usage counters, and the size-measurement switch of the reference client. */
  hostCalls() { const h = p0(); return out(h ? { calls: h.calls, misses: h.misses, unsupported: h.unsupported } : null); },
  measureBytes(on) { const h = p0(); if (h) h.measureBytes = !!on; return out({ measureBytes: !!on }); }
});
