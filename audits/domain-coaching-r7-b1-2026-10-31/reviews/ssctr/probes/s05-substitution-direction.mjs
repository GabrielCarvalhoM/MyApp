// SSCTR R7-B.1 review probe s05 (read-only): strength implications of QE-R7B-R2-04 (next candidate) and QE-R7B-R2-03 (SKILL_MISMATCH fallback).
// Part A: every substitution (both reasons) of every exercise in use in week 4 of a grid of athletes, decided in week 3. For each MODIFY: the
// selection's skill, kind, loading and demand against the replaced exercise; after a SKILL_MISMATCH a selection above the replaced exercise's skill is a
// climb; the selection's first exposure (kind, sets, RIR); whether a loaded -> unloaded change is disclosed; whether the plan prescribes the selection
// in the replaced exercise's slots.
// Part B: after a SKILL_MISMATCH whose substitute needs equipment the replaced one did not, that equipment is lost (permanently, or in a dated window):
// the configurations that fill the replaced exercise's slots in the next weeks (skill vs the substitute and vs the set-aside one's ladder), or the
// question asked and its options.
// Usage: SSCTR_ROOT=<tree root> node s05-substitution-direction.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), R = await imp('CoachingCore/src/r7b-repertoire.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL, addDays} = H;
const sk = id => R.skillRank(R.configurationOf(id)?.skill);
const desc = id => { const c = R.configurationOf(id); return c ? `${id}[${c.subpattern},${c.skill},${c.kind},${c.loading},low:${c.lowerDemand},ecc:${c.eccentric}]` : id; };
const above = id => { const out = new Set(), todo = [id]; while (todo.length) for (const n of R.ladderNext(todo.pop())) if (!out.has(n)) { out.add(n); todo.push(n); } return out; };
const grid = [['GENERAL', ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], [0, 4]], ['STRENGTH', FULL, [0, 2, 4]], ['HYPERTROPHY', ['KETTLEBELL', 'BANDS'], [0, 4]], ['RUNNING_SUPPORT', [], [0, 4]], ['HYPERTROPHY', FULL, [0, 1, 3, 4]], ['GENERAL', ['MACHINES', 'DUMBBELLS'], [0, 2, 4]], ['STRENGTH', ['DUMBBELLS', 'BENCH'], [0, 1, 3, 4]], ['HYPERTROPHY', ['DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR'], [0, 2, 4]], ['GENERAL', ['BANDS', 'PULL_UP_BAR'], [0, 2, 4]], ['RUNNING_SUPPORT', ['DUMBBELLS', 'KETTLEBELL'], [0, 1, 3, 4]], ['STRENGTH', FULL, [0, 2, 4], 'NOVICE'], ['GENERAL', ['DUMBBELLS', 'BENCH'], [0, 2, 4], 'NONE']];
const A = {decisions: 0, modify: 0, climbs: [], equalSkillOtherKind: [], notInSlot: [], firstExposureNotEstablish: [], undisclosedUnloading: [], lines: []};
for (const [strength, eq, days, exp] of grid) {
  const o = {id: `s05-${strength}-${eq.length}-${days.length}-${exp ?? 'INT'}`, equipment: eq, goals: {run: 'PERFORMANCE', strength}, rotation: 'FIXED', weeks: 12, schedule: {strengthDays: days}, ...(exp ? {strengthExperience: exp, recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 60, strengthDaysPerWeek: exp === 'NONE' ? 0 : 2}} : {})};
  let t; try { t = reviewed(o, 3); } catch (e) { A.lines.push(`${o.id} NO PROGRAM ${String(e.message).slice(0, 100)}`); continue; }
  const ids = [...new Set(t.p.weeks[4].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
  for (const id of ids) for (const reason of ['SKILL_MISMATCH', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']) {
    A.decisions++;
    const r = evaluateProgram(t.p, {...review(t.p, 3, {day: 1, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'SKILL_MISMATCH' ? {} : {nonclinicalConfirmed: true})}}), actualLedger: t.ledger}, opts);
    if (r.status !== 'MODIFY') { A.lines.push(`${o.id} ${id} ${reason}: ${r.status}`); continue; }
    A.modify++;
    const sel = r.substitutions[0].selected, X = R.configurationOf(id), S = R.configurationOf(sel), tag = `${o.id} ${desc(id)} ${reason} -> ${desc(sel)}`;
    A.lines.push(tag);
    if (reason === 'SKILL_MISMATCH' && sk(sel) > sk(id)) A.climbs.push(tag);
    if (reason === 'SKILL_MISMATCH' && sk(sel) === sk(id) && !R.ladderBelow(id).includes(sel)) A.equalSkillOtherKind.push(tag);
    if (X.loading === 'EXTERNAL' && S.loading !== 'EXTERNAL' && !r.substitutions[0].stimulusChange) A.undisclosedUnloading.push(tag);
    // the replaced exercise's slots in week 4 prescribe the selection; its first exposure is an establishment
    for (const s of t.p.weeks[4].sessions.filter(z => live(z) && z.sport === 'STRENGTH')) {
      const old = s.prescription.exercises.find(e => e.id === id); if (!old) continue;
      const now = r.proposal.weeks[4].sessions.find(z => z.id === s.id)?.prescription?.exercises ?? [];
      if (!now.some(e => e.id === sel)) A.notInSlot.push(`${tag} in ${s.id}`);
    }
    const first = r.proposal.weeks.slice(3).flatMap(w => w.sessions.filter(live).flatMap(s => (s.prescription.exercises ?? []).filter(e => e.id === sel)))[0];
    if (first && !(['FIRST_ESTABLISH', 'BODYWEIGHT', 'REESTABLISH', 'KNOWN', 'PRACTICE'].includes(first.exposure?.kind) && first.sets <= 2 && first.rir >= 3)) A.firstExposureNotEstablish.push(`${tag}: ${first.exposure?.kind} ${first.sets}@${first.rir}`);
  }
}
console.log('PART A ' + JSON.stringify({decisions: A.decisions, modify: A.modify, climbs: A.climbs, equalSkillOtherKind: A.equalSkillOtherKind, notInSlot: A.notInSlot, firstExposureNotEstablish: A.firstExposureNotEstablish, undisclosedUnloading: A.undisclosedUnloading}, null, 1));
console.log(A.lines.join('\n'));
// Part B
const B = {cases: 0, climbs: [], asks: [], fallbacks: []};
for (const [eqn, eq] of [['db-kb', ['DUMBBELLS', 'BENCH', 'KETTLEBELL']], ['full', FULL], ['db-bands', ['DUMBBELLS', 'BENCH', 'BANDS']], ['kb-bands-bar', ['KETTLEBELL', 'BANDS', 'PULL_UP_BAR']], ['machines-db', ['MACHINES', 'DUMBBELLS', 'BANDS']]]) for (const strength of ['GENERAL', 'STRENGTH']) for (const days of [[0, 4], [0, 2, 4]]) {
  const o = {id: `s05b-${eqn}-${strength}-${days.length}`, equipment: eq, goals: {run: 'PERFORMANCE', strength}, rotation: 'FIXED', weeks: 12, schedule: {strengthDays: days}};
  const t0 = reviewed(o, 3);
  const ids = [...new Set(t0.p.weeks[4].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
  for (const id of ids) {
    const t = structuredClone(t0), s = evaluateProgram(t.p, {...review(t.p, 3, {day: 1, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason: 'SKILL_MISMATCH'}}), actualLedger: t.ledger}, opts);
    if (s.status !== 'MODIFY') continue;
    const S = R.configurationOf(s.substitutions[0].selected), X = R.configurationOf(id), extra = S.equipment.filter(q => q !== 'BODYWEIGHT' && !X.equipment.includes(q)); if (!extra.length) continue;
    t.ledger = s.actualLedger ?? t.ledger; t.p = s.proposal; weekly(t, 3);
    for (const variant of ['permanent', 'window']) {
      const c = structuredClone(t), change = variant === 'permanent' ? {equipment: eq.filter(q => !extra.includes(q))} : {equipment: eq.filter(q => !extra.includes(q)), from: c.p.weeks[5].startDate, to: addDays(c.p.weeks[5].startDate, 6)};
      const r = evaluateProgram(c.p, {...review(c.p, 4, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', changes: change}), actualLedger: c.ledger}, opts); B.cases++;
      const tag = `${o.id} ${desc(id)} -> ${desc(S.id)}, ${variant} loss of ${extra.join('+')}`;
      if (r.status === 'ASK') { const d = (r.disclosures ?? []).find(z => z.id === 'NO_LOWER_SKILL_ALTERNATIVE'); B.asks.push(`${tag}: ASK ${d ? JSON.stringify(d.options) : String(r.reason).slice(0, 120)}`); continue; }
      if (!r.proposal) { B.fallbacks.push(`${tag}: ${r.status} ${r.action ?? ''}`); continue; }
      c.ledger = r.actualLedger ?? c.ledger; c.p = r.proposal;
      const seen = new Set();
      for (let w = 4; w < 7; w++) { if (w > 4) weekly(c, w - 1);
        for (const sess of c.p.weeks[w].sessions.filter(z => live(z) && z.sport === 'STRENGTH')) { const was = t0.p.weeks[w].sessions.find(z => z.id === sess.id); const old = was?.prescription?.exercises?.find(e => e.id === id); if (!old) continue;
          for (const e of sess.prescription.exercises.filter(z => z.pattern === X.pattern && z.role === old.role)) { seen.add(e.id); if (e.id !== S.id && (above(id).has(e.id) || sk(e.id) > sk(S.id) || e.id === id)) B.climbs.push(`${tag}: w${w} ${desc(e.id)}`); } } }
      B.fallbacks.push(`${tag}: ${r.status} ${r.action ?? ''} -> slots hold ${[...seen].map(desc).join(', ') || 'nothing (left out)'}`);
    }
  }
}
console.log('\nPART B ' + JSON.stringify({cases: B.cases, climbs: B.climbs, asks: B.asks.length}, null, 1));
console.log(B.asks.join('\n')); console.log(B.fallbacks.join('\n'));
