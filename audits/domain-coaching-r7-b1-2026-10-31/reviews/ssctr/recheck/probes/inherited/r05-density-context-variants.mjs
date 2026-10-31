import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck probe r05 (read-only, FREEZE-2): does the B0-C08 cap survive the weekly review that follows a context change?
// V1: capped from intake (4 days), SCHEDULE_CHANGE at week 1 to another 4 days. V2: capped from intake, permanent EQUIPMENT_CHANGE at week 1.
// V3: capped from intake, no change (control). For weeks 2-4: template types after the change proposal and after the next weekly review.
const {reviewed, weekly, review, evaluateProgram, opts} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const NOV4 = {strengthExperience: 'NONE', goals: {run: 'REGULAR', strength: 'GENERAL'}, equipment: ['DUMBBELLS', 'BENCH'], schedule: {strengthDays: [0, 2, 4, 5]}, weeks: 12};
const types = (p, w) => p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH' && s.prescription).map(s => s.templateType).sort().join(',');
const row = (p, ws) => ws.map(w => `w${w}{capped=${p.stateTrace[w]?.strength?.density?.capped ?? '-'} ${types(p, w)}}`).join(' ');
for (const [label, change] of [
  ['V1 schedule change to [0,1,3,5]', {kind: 'SCHEDULE_CHANGE', changes: {strengthDays: [0, 1, 3, 5]}}],
  ['V2 permanent equipment change (+KETTLEBELL)', {kind: 'EQUIPMENT_CHANGE', equipmentChange: {equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL']}, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL']}],
  ['V3 control (no change)', null]
]) {
  const t = reviewed({...NOV4, id: 'r05-' + label.slice(0, 2)}, 0);
  weekly(t, 0);
  if (change) {
    const r = evaluateProgram(t.p, {...review(t.p, 1, {day: 0, hour: '06:00:00', ...change}), actualLedger: t.ledger}, opts);
    console.log(`\n${label}: ${r.status} ${r.action} ${r.status !== 'MODIFY' ? (r.reason ?? '').slice(0, 160) : ''}`);
    if (r.proposal) { t.p = r.proposal; t.ledger = r.actualLedger ?? t.ledger; }
    console.log('  after the change      :', row(t.p, [2, 3, 4]), '| top-level noviceTemplates', t.p.noviceTemplates ? 'yes' : 'none');
  } else console.log(`\n${label}`);
  weekly(t, 1);
  console.log('  after the w1 review   :', row(t.p, [2, 3, 4]), '| top-level noviceTemplates', t.p.noviceTemplates ? 'yes' : 'none');
}
