// SSCTR R7-B.1 review probe s01 (read-only): QE-R7B-OBS-04 on a wider grid than r06 / the author's P1, with a no-substitution counterfactual.
// For each athlete, decision point, exercise in use and reason (SKILL_MISMATCH, NONCLINICAL_DISCOMFORT_OR_PREFERENCE): apply the decision, then the
// weekly reviews (every live session executed as prescribed, or the substitute's sessions missed), and judge each event-phase day (dayPhaseOf: TAPER,
// RACE_WEEK, POST_EVENT) in the plan in force when its week starts. Checks:
//  N  no configuration never performed in this program (ledger) is prescribed on an event-phase day; the set-aside one never returns;
//  S  every stand-in (row note "stands in for") is performed in this program, not set aside, an admissible alternative of the set-aside one
//     (same pattern + subpattern group, a shared primary muscle, within one demand step, admitted in the slot role), and after a SKILL_MISMATCH a
//     rung below / lower skill than the set-aside one and never above the substitute;
//  D  dose on event-phase days: RIR >= the phase minimum; a stand-in row's load is never above that exercise's last executed load; per session and per
//     week, strength sets never above the counterfactual (same athlete, same reviews, no substitution) -- excesses are listed, not hidden;
//  E  after the post-event week the substitute's first exposure is an establishment (FIRST_ESTABLISH or BODYWEIGHT, <= 2 sets, RIR >= 3);
//  T  the decision discloses NO_NEW_EXERCISE_IN_EVENT_WEEKS (stand-ins, sessions left out, keep-until-after option) whenever the substitute is new
//     and an event-phase day is ahead;
//  C  clinical screen and questions first (pain, a clinical text, an unconfirmed preference).
// Usage: SSCTR_ROOT=<tree root> node s01-obs04-event-weeks.mjs [label]  -> prints a JSON summary; details to stdout.
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs'), R = await imp('CoachingCore/src/r7b-repertoire.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL, K} = H;
const auth = AU.r6Authority(opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'], MINRIR = {TAPER: 3, RACE_WEEK: 4, POST_EVENT: 4};
const label = process.argv[2] ?? 'run';
const stats = {decisions: 0, modify: 0, ask: 0, other: 0, eventDaysJudged: 0, rowsJudged: 0, standInRows: 0, omittedSlots: 0, emptiedSessions: 0, checks: 0, failures: {}, excess: [], firstAfter: {}, disclosures: 0, keepOption: 0, projectedSubstituteInEventWeeks: 0};
const fail = (k, d) => { stats.failures[k] = stats.failures[k] ?? []; if (stats.failures[k].length < 15) stats.failures[k].push(d); stats.failures[k + '#'] = (stats.failures[k + '#'] ?? 0) + 1; };
const check = (k, ok, d) => { stats.checks++; if (!ok) fail(k, d); };
const performed = t => { const byId = new Map(t.p.weeks.flatMap(w => w.sessions.map(s => [s.id, s]))); const m = new Map(); for (const o of t.ledger.filter(o => !o.superseded && o.actual?.completed)) for (const e of (o.actual.exercises ?? byId.get(o.sessionId)?.prescription?.exercises ?? [])) { const kg = Math.max(0, ...((e.sets ?? []).map(s => s?.load?.value ?? 0))); const prev = m.get(e.id); if (!prev || o.observedAt > prev.at) m.set(e.id, {at: o.observedAt, kg}); } return m; };
const strengthIds = (p, w) => [...new Set(p.weeks[w].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
const eventSessions = (p, w) => { const sk = P.skeletonOf(p, auth); return p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH').map(s => ({s, phase: P.dayPhaseOf(sk.at(w) ?? sk, w, s.day)})).filter(x => EVENT.includes(x.phase)); };
const isStandIn = e => [e.note, ...(e.instructions ?? [])].some(x => /stands in for/.test(x ?? ''));
const sets = s => live(s) ? (s.prescription.exercises ?? []).reduce((n, e) => n + (e.sets ?? 0), 0) : 0;
const sub = (t, w, day, id, reason, x = {}) => evaluateProgram(t.p, {...review(t.p, w, {day, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE' ? {nonclinicalConfirmed: true} : {}), ...x}}), actualLedger: t.ledger}, opts);
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}};
const athletes = [
  ['A-10K-general-dbkb-fixed', {...EV, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'}],
  ['B-10K-strength-full-coach-3d', {...EV, goals: {run: 'RACE', strength: 'STRENGTH'}, equipment: FULL, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}, rotation: 'COACH_DECIDES'}],
  ['C-half-hypertrophy-bands-2w', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, goals: {run: 'RACE', strength: 'HYPERTROPHY'}, equipment: ['DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR'], schedule: {runDays: [1, 2, 4, 6], strengthDays: [0, 3], longRunMinutes: 120}, rotation: 'EVERY_2_WEEKS'}],
  ['D-10K-runsupport-bodyweight', {...EV, goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, equipment: [], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'}],
  ['E-10K-novice-none-3d', {...EV, strengthExperience: 'NONE', recent: {...EV.recent, strengthDaysPerWeek: 0}, equipment: ['DUMBBELLS', 'BENCH'], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}, rotation: 'FIXED'}],
  ['F-half-general-machines-intakefamiliar', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, equipment: ['MACHINES', 'DUMBBELLS', 'BANDS', 'KETTLEBELL'], schedule: {runDays: [1, 3, 4, 6], strengthDays: [0, 4], longRunMinutes: 120}, rotation: 'FIXED', knownExercises: [K('kb-goblet-squat', 3, 10, 16), K('kb-row', 3, 10, 16), K('single-leg-rdl-db', 3, 10, 10, 'PER_HAND')]}],
];
for (const [name, o0] of athletes) {
  const o = {...o0, id: 's01-' + name};
  let base;
  try { base = reviewed(o, 0); } catch (e) { console.log(name, 'NO PROGRAM', String(e.message).slice(0, 160)); continue; }
  const ph = base.p.phases.phases, tw = ph.indexOf('TAPER'), rw = ph.indexOf('RACE_WEEK'), pw = ph.indexOf('POST_EVENT');
  console.log(`\n## ${name}: phases ${ph.join(',')} | taper ${tw} race ${rw} post ${pw}`);
  // Counterfactual: the same reviews, no substitution.
  const cf = reviewed(o, 0); const cfPlanAt = {};
  for (let w = 0; w <= Math.min(pw, cf.p.weeks.length - 1); w++) { cfPlanAt[w] = structuredClone(cf.p.weeks[w]); weekly(cf, w); }
  const points = [['TAPER-d0', tw, 0, false], ['TAPER-d3', tw, 3, false], ['RACE_WEEK-d0', rw, 0, false], ['POST_EVENT-d0', pw, 0, false], ['LAST_SPECIFIC-d0-executed', tw - 1, 0, false], ['LAST_SPECIFIC-d0-missed', tw - 1, 0, true]];
  for (const [pt, wk, day, missSub] of points) {
    const t = reviewed(o, 0); for (let w = 0; w < wk; w++) weekly(t, w);
    for (const id of strengthIds(t.p, wk)) for (const reason of ['SKILL_MISMATCH', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']) {
      stats.decisions++;
      const before = performed(t), r = sub(t, wk, day, id, reason), tag = `${name} ${pt} ${id} ${reason}`;
      if (r.status !== 'MODIFY') { if (r.status === 'ASK') stats.ask++; else stats.other++; console.log(`${tag}: ${r.status} ${String(r.reason).slice(0, 90)}`); continue; }
      stats.modify++;
      const sel = r.substitutions[0].selected, X = R.configurationOf(id), Z = R.configurationOf(sel), d = (r.disclosures ?? []).find(z => z.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS');
      if (d) { stats.disclosures++; if ((d.options ?? []).some(x => /until after the event/.test(x))) stats.keepOption++; }
      // T: the substitute is new and an event-phase day is ahead in the decision week or later, and the plan holds a stand-in/omission
      // T applies when the replaced exercise is prescribed on an event-phase day still ahead in the plan before the decision
      const decisionDay = H.addDays(t.p.weeks[wk].startDate, day), xInEventAhead = [...Array(Math.max(0, pw - wk + 1)).keys()].some(i => eventSessions(t.p, wk + i).some(({s}) => live(s) && s.date >= decisionDay && s.prescription.exercises.some(e => e.id === id)));
      if (!before.has(sel) && xInEventAhead) check('T-disclosure', !!d && (d.options ?? []).some(x => /until after the event/.test(x)), {tag, sel});
      // the decision's own projection: does the substitute appear on an event-phase day of a later week (conditional projection)?
      for (let k = wk; k <= pw; k++) for (const {s} of eventSessions(r.proposal, k)) if (live(s) && s.prescription.exercises.some(e => e.id === sel) && !before.has(sel)) { stats.projectedSubstituteInEventWeeks++; if (k === wk) fail('N-decision-week', {tag, week: k, session: s.id}); }
      const c = structuredClone(t); c.ledger = r.actualLedger ?? c.ledger; c.p = r.proposal;
      let firstAfter = null;
      for (let w = wk; w < c.p.weeks.length; w++) {
        const perf = performed(c);
        // judge this week's event-phase days in the plan in force at its start (sessions after the decision in its own week)
        const asOfDay = w === wk ? H.addDays(t.p.weeks[wk].startDate, day) : null;
        for (const {s, phase} of eventSessions(c.p, w)) {
          if (asOfDay && s.date < asOfDay) continue;
          stats.eventDaysJudged++;
          if (!live(s)) { if (s.eventStandIns) stats.emptiedSessions++; continue; }
          for (const g of s.eventStandIns ?? []) if (!g.inEventWeeks) stats.omittedSlots++;
          for (const e of s.prescription.exercises) {
            stats.rowsJudged++;
            check('N-never-performed', perf.has(e.id), {tag, week: w, phase, session: s.id, prescribes: e.id, sets: e.sets, rir: e.rir, mode: e.load?.mode});
            check('N-set-aside-returns', e.id !== id, {tag, week: w, session: s.id});
            check('D-rir', e.rir >= MINRIR[phase], {tag, week: w, phase, id: e.id, rir: e.rir});
            if (isStandIn(e)) {
              stats.standInRows++;
              const Y = R.configurationOf(e.id), aside = new Set((c.p.canonical.athlete.strengthSelections ?? []).filter(x => x.setAside).map(x => x.from));
              const adm = R.admissibleAlternative(X, Y, {role: e.role === 'PRACTICE' ? 'ACCESSORY' : e.role, skillOk: () => true, auth: R.DEFAULT_REPERTOIRE});
              const dir = reason !== 'SKILL_MISMATCH' || ((R.ladderBelow(X.id).includes(Y.id) || R.skillRank(Y.skill) < R.skillRank(X.skill)) && R.skillRank(Y.skill) <= R.skillRank(Z.skill));
              check('S-stand-in', perf.has(Y.id) && !aside.has(Y.id) && adm && dir, {tag, week: w, standIn: Y.id, performed: perf.has(Y.id), aside: aside.has(Y.id), admissible: adm, direction: dir});
              const last = perf.get(Y.id);
              if (e.load?.mode === 'KNOWN') check('D-stand-in-load', !(e.load.value > (last?.kg ?? 0) + 1e-9), {tag, week: w, standIn: Y.id, value: e.load.value, lastLogged: last?.kg});
            }
          }
          // D: session and week sets vs the counterfactual plan in force at the same week start
          const cs = cfPlanAt[w]?.sessions.find(z => z.id === s.id);
          if (cs && sets(s) > sets(cs)) stats.excess.push({tag, week: w, phase, session: s.id, sets: sets(s), counterfactual: sets(cs), rows: s.prescription.exercises.map(e => `${e.id}:${e.sets}x${e.reps}@${e.rir}${e.load?.mode === 'KNOWN' ? ' ' + e.load.value + 'kg' : ' ' + e.load?.mode}`).join(', '), cfRows: cs.prescription?.exercises?.map(e => `${e.id}:${e.sets}`).join(', ')});
        }
        // E: first exposure of the substitute after the post-event week (in the plan in force at that week's start)
        if (w > pw && firstAfter === null && !perf.has(sel)) { const row = c.p.weeks[w].sessions.filter(live).flatMap(s => s.prescription.exercises ?? []).find(e => e.id === sel); if (row) { firstAfter = row; const k = row.exposure?.kind ?? row.load?.mode; stats.firstAfter[k] = (stats.firstAfter[k] ?? 0) + 1; check('E-first-after-event', ['FIRST_ESTABLISH', 'BODYWEIGHT'].includes(row.exposure?.kind) && row.sets <= 2 && row.rir >= 3, {tag, week: w, kind: row.exposure?.kind, sets: row.sets, rir: row.rir}); } }
        if (w >= c.p.weeks.length - 1) break;
        weekly(c, w, {keep: missSub && w === wk ? s => !(s.prescription?.exercises ?? []).some(e => e.id === sel) : () => true});
      }
      // per-week sets in event weeks vs counterfactual (week totals)
      console.log(`${tag}: MODIFY -> ${sel}${before.has(sel) ? ' (performed)' : ' (new)'} | standIns ${JSON.stringify(d?.standIns ?? [])} omitted ${d?.omittedSessions?.length ?? 0} | first after event: ${firstAfter ? `${firstAfter.exposure?.kind} ${firstAfter.sets}@${firstAfter.rir}` : 'none'}`);
    }
  }
}
// C: the clinical screen and the questions first, in each event phase.
{
  const o = {...athletes[0][1], id: 's01-first'}, t = reviewed(o, 0), ph = t.p.phases.phases;
  for (const phase of ['TAPER', 'RACE_WEEK', 'POST_EVENT']) {
    const c = reviewed(o, 0), wk = ph.indexOf(phase); for (let w = 0; w < wk; w++) weekly(c, w);
    const id = strengthIds(c.p, wk)[0];
    check('C-pain', sub(c, wk, 0, id, 'SKILL_MISMATCH', {pain: true}).status === 'CLINICAL_HUMAN_REQUIRED', {phase});
    check('C-text', sub(c, wk, 0, id, 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', {text: 'sharp pain in my knee since last week'}).status === 'CLINICAL_HUMAN_REQUIRED', {phase});
    check('C-unconfirmed', sub(c, wk, 0, id, 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', {nonclinicalConfirmed: undefined}).status === 'ASK', {phase});
    check('C-no-reason', sub(c, wk, 0, id, 'BORED').status === 'ASK', {phase});
  }
}
const failed = Object.entries(stats.failures).filter(([k]) => k.endsWith('#')).reduce((n, [, v]) => n + v, 0);
console.log('\nSUMMARY ' + JSON.stringify({label, ...stats, failed, excessCount: stats.excess.length, excess: stats.excess.slice(0, 30)}, null, 1));
