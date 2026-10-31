// SSCTR R7-B recheck probe r07 (read-only, FREEZE-2): Q-R7B-02 class-specific QUALITY_AFTER_EVIDENCE trace and Q-R7B-07 skill/equipment limits in
// PULL_LIMITED_FOR_EQUIPMENT and MOVEMENT_PATTERN_UNAVAILABLE: no promised path that does not exist, no equivalence claim, equipment never required.
import {gen, FULL} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const RUN = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
for (const [label, recent, exp] of [['EASY_UNKNOWN', {runDaysPerWeek: 3, runMinutesPerWeek: null, longestRunMinutes: null}, 'INTERMEDIATE'], ['EASY_LOW', {runDaysPerWeek: 3, runMinutesPerWeek: 50, longestRunMinutes: 25}, 'INTERMEDIATE'], ['WALK_JOG', {runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0}, 'NONE'], ['EASY_CURRENT', {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 60}, 'INTERMEDIATE']]) {
  const g = gen({id: 'r07-' + label, ...RUN, recent, runExperience: exp});
  const q = g.program.feasibility.reductions.find(r => r.id === 'QUALITY_AFTER_EVIDENCE');
  console.log(`${label} (class ${g.program.capability.run.class}): ${q ? q.path + ' | ' + q.detail : 'no QUALITY_AFTER_EVIDENCE reduction'}`);
}
for (const [label, equipment, exp] of [['bands only, intermediate', ['BANDS'], 'INTERMEDIATE'], ['nothing, novice', [], 'NOVICE'], ['pull-up bar only, novice', ['PULL_UP_BAR'], 'NOVICE'], ['barbell+rack only, novice', ['BARBELL', 'RACK'], 'NOVICE']]) {
  const g = gen({id: 'r07-' + label.replace(/\W+/g, '-'), goals: {run: 'PERFORMANCE', strength: 'GENERAL'}, equipment, strengthExperience: exp});
  for (const n of (g.negotiation ?? []).filter(n => ['PULL_LIMITED_FOR_EQUIPMENT', 'MOVEMENT_PATTERN_UNAVAILABLE'].includes(n.id))) console.log(`${label}: ${n.id} limit=${JSON.stringify(n.limit ?? n.limits)} options=${JSON.stringify(n.options)} | ${n.detail}`);
}
