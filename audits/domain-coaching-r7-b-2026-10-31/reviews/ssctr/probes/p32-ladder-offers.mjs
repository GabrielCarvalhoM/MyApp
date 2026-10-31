// SSCTR R7-B probe p32 (read-only): B0-C07 ladder offers in an event program: offered only at a development block boundary whose next
// week is not a deferred phase (never into SPECIFIC/TAPER/RACE_WEEK/POST_EVENT), never during a return; accepting one admits only that
// configuration (c5).
import {reviewed, weekly, review, evaluateProgram, opts, rows, live, obs, FULL} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const o = {id: 'p32', equipment: FULL, goals: {run: 'RACE', strength: 'STRENGTH'}, event: {kind: '10K', date: '2027-01-31'}, rotation: 'COACH_DECIDES', weeks: 16, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 60, strengthDaysPerWeek: 2}};
const t = reviewed(o, 0);
console.log('phases', t.p.phases.phases.join(','), '| blocks', t.p.blocks.map(b => b.family + '[' + b.startWeek + ',' + b.endWeekExclusive + ')').join(' '));
for (let w = 0; w < 13; w++) {
  const r = weekly(t, w);
  if ((r.offers ?? []).length) console.log(`review w${w} (${t.p.phases.phases[w]} -> next ${t.p.phases.phases[w + 1]}): offers ${r.offers.map(x => x.from + '->' + x.to).join(', ')}`);
}
console.log('(no other offers)');
// A ladder step chosen at a boundary followed by SPECIFIC is asked about, never applied.
const t2 = reviewed({...o, id: 'p32b'}, 0);
const specStart = t2.p.phases.phases.indexOf('SPECIFIC');
for (let w = 0; w < specStart - 1; w++) weekly(t2, w);
const w = specStart - 1;
const r = evaluateProgram(t2.p, {...review(t2.p, w, {observations: t2.p.weeks[w].sessions.filter(live).map(s => obs(t2.p, s)), choices: [{type: 'LADDER_STEP', from: 'goblet-squat', to: 'back-squat'}]}), actualLedger: t2.ledger}, opts);
console.log(`choice of a ladder step at the boundary into SPECIFIC (review w${w}): ${r.status} ${r.action} — ${r.reason?.slice(0, 140)}`);
