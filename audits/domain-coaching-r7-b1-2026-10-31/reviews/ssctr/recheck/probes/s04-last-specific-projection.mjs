// SSCTR R7-B.1 review probe s04 (read-only): a substitution decided at the start of the last SPECIFIC week, whose substitute is planned in that week.
// The decision's conditional projection assumes the planned exposure executed, so its taper may show the substitute. What does the athlete see, and
// what does the weekly review of that week do when (a) the substitute was executed, (b) it was missed? Prints, per case: the decision's disclosures,
// the taper rows of the substitute in the decision's projection, the weekly review's status/disclosures, and the taper week's rows in the plan in force
// (stand-ins with their instruction, slots left out via eventStandIns, the substitute's dose when executed).
// Usage: SSCTR_ROOT=<tree root> node s04-last-specific-projection.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live} = H;
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}};
const row = e => `${e.id} ${e.sets}x${e.reps}@RIR${e.rir} ${e.load?.mode}${e.load?.value != null ? ' ' + e.load.value + 'kg' : ''} ${e.exposure?.kind ?? ''}`;
for (const [name, o] of [['fixed', {...EV, id: 's04-fixed', rotation: 'FIXED'}], ['rot2w', {...EV, id: 's04-rot', rotation: 'EVERY_2_WEEKS'}]]) {
  const t0 = reviewed(o, 0), ph = t0.p.phases.phases, tw = ph.indexOf('TAPER'), sw = tw - 1;
  const t = reviewed(o, 0); for (let w = 0; w < sw; w++) weekly(t, w);
  for (const [id, reason] of [['db-split-squat', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE'], ['db-rdl', 'SKILL_MISMATCH'], ['goblet-squat', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']]) {
    const r = evaluateProgram(t.p, {...review(t.p, sw, {day: 0, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'SKILL_MISMATCH' ? {} : {nonclinicalConfirmed: true})}}), actualLedger: t.ledger}, opts);
    if (r.status !== 'MODIFY') { console.log(`${name} ${id} ${reason}: ${r.status} ${String(r.reason).slice(0, 100)}`); continue; }
    const sel = r.substitutions[0].selected;
    const inSpecific = r.proposal.weeks[sw].sessions.filter(s => live(s) && s.prescription.exercises?.some(e => e.id === sel)).map(s => `${s.date} ${row(s.prescription.exercises.find(e => e.id === sel))}`);
    const inTaperProjection = r.proposal.weeks[tw].sessions.filter(s => live(s) && s.prescription.exercises?.some(e => e.id === sel)).map(s => `${s.date} ${row(s.prescription.exercises.find(e => e.id === sel))}`);
    console.log(`\n## ${name} ${id} ${reason} -> ${sel}\n decision disclosures: ${JSON.stringify((r.disclosures ?? []).map(d => d.id))}\n substitute in the last SPECIFIC week: ${inSpecific.join('; ') || 'none'}\n substitute in the decision's taper projection: ${inTaperProjection.join('; ') || 'none'}`);
    for (const variant of ['executed', 'missed']) {
      const c = structuredClone(t); c.ledger = r.actualLedger ?? c.ledger; c.p = r.proposal;
      const rv = weekly(c, sw, {keep: variant === 'missed' ? s => !(s.prescription?.exercises ?? []).some(e => e.id === sel) : () => true});
      const taper = c.p.weeks[tw].sessions.filter(s => s.sport === 'STRENGTH').map(s => `${s.date}${live(s) ? '' : ' (rest)'} [${(s.prescription?.exercises ?? []).filter(e => ['LUNGE', 'HINGE', 'SQUAT'].includes(e.pattern)).map(e => row(e) + ((e.instructions ?? []).some(i => /stands in for/.test(i)) ? ' (stand-in)' : '')).join(', ')}]${s.eventStandIns ? ' eventStandIns ' + JSON.stringify(s.eventStandIns) : ''}${s.explanation ? ' explanation: ' + s.explanation : ''}`);
      console.log(` ${variant}: weekly review of week ${sw} -> ${rv.status} ${rv.action ?? ''}; disclosures ${JSON.stringify((rv.disclosures ?? []).map(d => d.id))}\n   taper week ${tw}: ${taper.join(' | ')}`);
    }
  }
}
