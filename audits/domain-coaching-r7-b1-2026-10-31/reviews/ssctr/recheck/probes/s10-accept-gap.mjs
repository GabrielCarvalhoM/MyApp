// SSCTR R7-B.1 recheck probe s10 (read-only): leaving the slot out after a SKILL_MISMATCH when equipment loss leaves no lower option (C2,
// R6-SUBSTITUTION condition 8). Grid of s05 part B (substitutes needing equipment the set-aside exercise did not). For each loss that raises the
// question: its text and options; confirming (changes.acceptGap: true) through the next two weekly reviews (what fills the replaced exercise's
// slots: nothing, never a configuration above the set-aside one or the substitute); the weeks the pattern is absent from the plan; for a dated
// window, whether the substitute returns after it.
// Usage: SSCTR_ROOT=<tree root> node s10-accept-gap.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), R = await imp('CoachingCore/src/r7b-repertoire.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL, addDays} = H;
const above = id => { const out = new Set(), todo = [id]; while (todo.length) for (const n of R.ladderNext(todo.pop())) if (!out.has(n)) { out.add(n); todo.push(n); } return out; };
const sk = id => R.skillRank(R.configurationOf(id)?.skill);
const T = {questions: 0, optionSets: {}, accepted: 0, acceptedModify: 0, climbs: [], patternAbsentWeeks: [], windowReturns: [], texts: new Set(), acceptedTexts: new Set()};
for (const [eqn, eq] of [['db-kb', ['DUMBBELLS', 'BENCH', 'KETTLEBELL']], ['full', FULL], ['db-bands', ['DUMBBELLS', 'BENCH', 'BANDS']], ['kb-bands-bar', ['KETTLEBELL', 'BANDS', 'PULL_UP_BAR']], ['machines-db', ['MACHINES', 'DUMBBELLS', 'BANDS']]]) for (const strength of ['GENERAL', 'STRENGTH']) for (const days of [[0, 4], [0, 2, 4]]) {
  const o = {id: `s10-${eqn}-${strength}-${days.length}`, equipment: eq, goals: {run: 'PERFORMANCE', strength}, rotation: 'FIXED', weeks: 12, schedule: {strengthDays: days}};
  const t0 = reviewed(o, 3);
  const ids = [...new Set(t0.p.weeks[4].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
  for (const id of ids) {
    const t = structuredClone(t0), s = evaluateProgram(t.p, {...review(t.p, 3, {day: 1, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason: 'SKILL_MISMATCH'}}), actualLedger: t.ledger}, opts);
    if (s.status !== 'MODIFY') continue;
    const S = R.configurationOf(s.substitutions[0].selected), X = R.configurationOf(id), extra = S.equipment.filter(q => q !== 'BODYWEIGHT' && !X.equipment.includes(q)); if (!extra.length) continue;
    t.ledger = s.actualLedger ?? t.ledger; t.p = s.proposal; weekly(t, 3);
    for (const variant of ['permanent', 'window']) {
      const change = variant === 'permanent' ? {equipment: eq.filter(q => !extra.includes(q))} : {equipment: eq.filter(q => !extra.includes(q)), from: t.p.weeks[5].startDate, to: addDays(t.p.weeks[5].startDate, 6)};
      const q = evaluateProgram(t.p, {...review(t.p, 4, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', changes: change}), actualLedger: t.ledger}, opts);
      if (q.status !== 'ASK') continue;
      T.questions++;
      const d = (q.disclosures ?? []).find(z => z.id === 'NO_LOWER_SKILL_ALTERNATIVE'), key = JSON.stringify(d?.options ?? null) + ' missing ' + JSON.stringify(q.missingInputs) + ' proposal ' + !!q.proposal;
      T.optionSets[key] = (T.optionSets[key] ?? 0) + 1; T.texts.add(String(q.reason).replace(/[a-z0-9-]+(?= needs)|[a-z0-9-]+(?= was set aside)/g, '<x>'));
      const c = structuredClone(t), a = evaluateProgram(c.p, {...review(c.p, 4, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', changes: {...change, acceptGap: true}}), actualLedger: c.ledger}, opts);
      T.accepted++; if (a.status === 'MODIFY' || a.status === 'KEEP') T.acceptedModify++;
      const ad = (a.disclosures ?? []).find(z => z.id === 'NO_LOWER_SKILL_ALTERNATIVE'); if (ad?.detail) T.acceptedTexts.add(ad.detail.replace(/^[a-z0-9-]+ needs [a-z ]+, which is not available( from \S+( to \S+)?)?; [a-z0-9-]+ was set aside/, '<x> needs <eq>, which is not available<when>; <y> was set aside'));
      if (!a.proposal) continue;
      c.ledger = a.actualLedger ?? c.ledger; c.p = a.proposal;
      let absent = 0;
      for (let w = 4; w < 8 && w < c.p.weeks.length; w++) {
        if (w > 4) weekly(c, w - 1);
        const pat = c.p.weeks[w].sessions.filter(z => live(z) && z.sport === 'STRENGTH').flatMap(z => z.prescription.exercises.filter(e => e.pattern === X.pattern).map(e => e.id));
        if (!pat.length) absent++;
        for (const e of pat) if (e === id || above(id).has(e) || (e !== S.id && sk(e) > sk(S.id))) T.climbs.push(`${o.id} ${id}->${S.id} ${variant}: w${w} ${e}`);
      }
      T.patternAbsentWeeks.push(`${o.id} ${id}->${S.id} ${variant}: ${X.pattern} absent in ${absent} of weeks 4-7`);
      if (variant === 'window') { const after = c.p.weeks[6].sessions.filter(z => live(z) && z.sport === 'STRENGTH').flatMap(z => z.prescription.exercises.map(e => e.id)); T.windowReturns.push(`${o.id} ${id}->${S.id}: after the window week 6 holds ${S.id}: ${after.includes(S.id)}`); }
      // (naming an exercise needs one in the sessions ahead to replace; with the slot left out the way back is the equipment)
    }
  }
}
console.log(JSON.stringify({...T, texts: [...T.texts], acceptedTexts: [...T.acceptedTexts]}, null, 1));
