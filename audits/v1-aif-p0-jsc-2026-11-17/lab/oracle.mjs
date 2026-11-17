// The Node oracle: runs the AIF reference client over the composed engine natively (Node ESM, node:fs, node:crypto) and records, for each
// journey, the exact synthetic inputs (intake, kind, asOf, facts, event id) and the digests of every answer and envelope. The device and the
// lab replay the same inputs and must reproduce the digests.
//   J5   the AIF portable proof journey (generate, three Sunday reviews, "not 100%" with a warning sign): the five reference answers.
//   P16  the first plan of the AIF perf journey: a 16-week hybrid plan, a mid-week report and a Sunday review each week (~95 ledger rows).
// It then replays both from the JSON fixtures in fresh clients and requires the same digests (the fixtures lose nothing the engine reads).
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs   (writes ios/Tests/P0HostTests/Fixtures/*.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from '../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs';
import * as Sc from '../../v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';
import { comparisonDigests } from '../build/compare.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), FIX = path.join(HERE, '..', 'ios', 'Tests', 'P0HostTests', 'Fixtures');
const tree = v => (v && typeof v === 'object' && !Array.isArray(v)) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, L.digestOf(v[k])])) : null;

function recorder(intake) {
  const c = L.createClient(), steps = [], answers = [], full = [];
  const note = (step, r) => { steps.push(step); answers.push({ status: r.status, answer: L.digestOf(r), envelope: L.digestOf(c.envelope), ...comparisonDigests(r, c.envelope), ledgerRows: c.envelope.actualLedger.length, tree: tree(r) }); full.push(r); };
  // Inputs are stored as the exact JSON text the host passes across the bridge (a host never re-serializes them: key order is kept).
  note({ kind: 'ONBOARD', intakeJSON: JSON.stringify(intake) }, c.onboard(intake));
  return {
    c,
    review(kind, asOf, facts) { const factsJSON = JSON.stringify(facts), r = c.review(kind, asOf, facts); note({ kind, asOf, factsJSON, eventId: c.envelope.decisions.at(-1).eventId }, r); return r; },
    done: extra => ({ engine: L.S.V1_STRENGTH_ENGINE, steps, expected: answers, ...extra, full })
  };
}

function j5() {
  const R = recorder(Sc.athleteA()), c = R.c;
  for (let w = 0; w < 3; w++) { const f = Sc.weekFacts(c.envelope, w); R.review('WEEKLY_REVIEW', f.asOf, f.facts); }
  const day = Sc.addDays(c.envelope.program.startDate, 22);
  R.review('NOT_FEELING_100', Sc.at(day, '08:00'), Sc.notFeeling100WithSign(day));
  return R.done({ journey: 'J5', what: 'AIF portable proof journey: generate, three Sunday reviews, not-100% with a warning sign' });
}

function p16() {
  const R = recorder(Sc.athleteA({ weeks: 16 })), c = R.c;
  let snapshotBefore = null;
  for (let w = 0; w < 16; w++) {
    const live = Sc.liveSessions(c.envelope, w), onRecord = Sc.reportedInPlan(c.envelope), first = live.find(s => !onRecord.has(s.id));
    if (first && first.date < Sc.addDays(c.envelope.program.startDate, w * 7 + 6))
      R.review('WEEKLY_REVIEW', Sc.at(first.date), { eligibility: Sc.ELIG(first.date), observations: [Sc.reportOf(c.envelope, first, { tag: 'p0' })] });
    const f = Sc.weekFacts(c.envelope, w, { tag: 'p0' });
    if (w === 15) snapshotBefore = R.done().steps.length; // the fixed "whole plan on record" review is this step
    R.review('WEEKLY_REVIEW', f.asOf, f.facts);
  }
  return R.done({ journey: 'P16', what: 'AIF perf journey, first plan: 16-week hybrid plan, mid-week report + Sunday review each week', fixedReviewStep: snapshotBefore });
}

// Replay from the JSON fixture in a fresh client, explicit event ids: must reproduce every digest.
function replay(fx) {
  const c = L.createClient(), got = [];
  for (const s of fx.steps) {
    const r = s.kind === 'ONBOARD' ? c.onboard(JSON.parse(s.intakeJSON)) : c.review(s.kind, s.asOf, JSON.parse(s.factsJSON), { eventId: s.eventId });
    got.push({ answer: L.digestOf(r), envelope: L.digestOf(c.envelope) });
  }
  return got.every((g, i) => g.answer === fx.expected[i].answer && g.envelope === fx.expected[i].envelope);
}

fs.mkdirSync(FIX, { recursive: true });
const summary = {};
for (const fx of [j5(), p16()]) {
  const ok = replay(fx);
  if (!ok) { console.error(`${fx.journey}: replay from JSON fixture differs from the direct run`); process.exit(1); }
  const { full, ...rest } = fx;
  fs.writeFileSync(path.join(FIX, `${fx.journey.toLowerCase()}.json`), JSON.stringify(rest) + '\n');
  // Full answers only for J5: the field-level diff of the five reference answers if a digest differs on the device.
  if (fx.journey === 'J5') fs.writeFileSync(path.join(FIX, 'j5-answers.json'), JSON.stringify(full) + '\n');
  summary[fx.journey] = { steps: fx.steps.length, finalRows: fx.expected.at(-1).ledgerRows, statuses: fx.expected.map(e => e.status), finalEnvelope: fx.expected.at(-1).envelope, replayFromFixture: ok };
}
console.log(JSON.stringify(summary, null, 1));
