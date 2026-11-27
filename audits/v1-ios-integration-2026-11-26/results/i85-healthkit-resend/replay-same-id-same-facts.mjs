// #85 evidence: what the REAL frozen boundary (CoachingCore/src/boundary/integration.mjs, read only) answers when B re-sends a workout's
// frozen bytes (same activityId, same sessionId, same facts) under a NEW clientRequestId. Synthetic athlete of CoachingCore/test/v1int-helpers.mjs;
// nothing in CoachingCore is changed or written (memoryStore). Run from the repository root:
//   node audits/v1-ios-integration-2026-11-26/results/i85-healthkit-resend/replay-same-id-same-facts.mjs
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const H = await import(pathToFileURL(join(root, 'CoachingCore/test/v1int-helpers.mjs')).href);

const activity = sessionId => ({ activityId: 'HK-SYNTH-85', activityType: 'RUN', sessionId, observedAt: '2026-11-17T07:45:00-03:00',
  actual: { completed: true, minutes: 30, distanceKm: 5 }, sourceQuality: 'WEARABLE_FULL' });
const send = (t, id, a) => { const r = t.it.importActivities({ actor: t.actor, clientRequestId: id, expectedVersion: t.version(), activities: [a] });
  return r.ok ? { ok: true, replayed: !!r.replayed, outcome: r.activities.map(x => x.outcome) } : { ok: false, code: r.error.code }; };
const rows = t => t.rows().filter(o => o.source?.provider === 'HEALTHKIT' && o.superseded !== true).length;
const out = {};

// 1. A write that landed (its answer lost to B), then the re-send in a NEW delivery: DUPLICATE, one row.
{ const t = H.athlete({ id: 'i85-landed' }); if (!t.enroll().ok) throw new Error('enroll'); t.set('2026-11-17', '21:00');
  const sid = t.sessions(0).find(s => s.sport === 'RUN' && s.date === '2026-11-17').id;
  out.landed_first = send(t, 'delivery-1', activity(sid));
  out.landed_resend_new_id = send(t, 'delivery-2', activity(sid));
  out.landed_rows = rows(t); }
// 2. Nothing landed during the outage: the re-send is the first write, RECORDED, one row.
{ const t = H.athlete({ id: 'i85-lost' }); if (!t.enroll().ok) throw new Error('enroll'); t.set('2026-11-17', '21:00');
  const sid = t.sessions(0).find(s => s.sport === 'RUN' && s.date === '2026-11-17').id;
  out.lost_resend_new_id = send(t, 'delivery-2', activity(sid));
  out.lost_rows = rows(t); }
// 3. Control: the same id with another link is never a second row (ACTIVITY_LINKED_ELSEWHERE); B re-sends the frozen link, never this.
{ const t = H.athlete({ id: 'i85-link' }); if (!t.enroll().ok) throw new Error('enroll'); t.set('2026-11-17', '21:00');
  const sid = t.sessions(0).find(s => s.sport === 'RUN' && s.date === '2026-11-17').id;
  send(t, 'delivery-1', activity(sid));
  out.other_link_resend = send(t, 'delivery-3', activity(undefined));
  out.other_link_rows = rows(t); }
console.log(JSON.stringify(out));
