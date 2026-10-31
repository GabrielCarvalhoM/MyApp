import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck (FREEZE-2) copy of probe p11 (read-only): B0-C01 edges.
// A: strides repetitions around the introduction week (c5: no other run dimension steps).
// B: whole-session single-run ceiling when the longest executed run is short (c5).
// C: credit given to an easy run reported on the quality day at >= 90% of the session minutes (c4/c6 observation contract).
const {reviewed, weekly, runs} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const GRAD = {id: 'p11-grad', ...RUN_ONLY, runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 16};
const strides = (p, w) => runs(p, w).filter(s => s.prescription.strides).map(s => s.prescription.strides.repetitions + (s.prescription.strides.optional ? 'opt' : ''));
const line = (p, w) => runs(p, w).map(s => `${s.role}:${s.prescription.durationMinutes}${s.prescription.strides ? '+str' + s.prescription.strides.repetitions : ''}`).join(' ');

console.log('=== A. strides repetitions by week (GRAD) ===');
const t = reviewed(GRAD, 0);
let g = null;
for (let w = 0; w < 10; w++) {
  const r = weekly(t, w);
  if (r.action === 'RUN_QUALITY_GRADUATION') g = w;
}
for (let w = 0; w < 11; w++) console.log(`w${w} ${t.p.weeks[w].phase}${g !== null && w === g + 1 ? ' [INTRO]' : ''} strides ${JSON.stringify(strides(t.p, w))} | ${line(t.p, w)}`);

console.log('\n=== B. short longest run at graduation: is the 34-min session within longest + 5? ===');
for (const [L, W, rm] of [[20, 60, 30], [25, 65, 30], [25, 70, 35]]) {
  const x = reviewed({...GRAD, id: `p11-short-${L}-${W}-${rm}`, recent: {runDaysPerWeek: 3, runMinutesPerWeek: W, longestRunMinutes: L}, schedule: {strengthDays: [], runMinutes: rm, longRunMinutes: rm}}, 0);
  let gg = null;
  for (let w = 0; w < 12 && gg === null; w++) { const r = weekly(x, w); if (r.action === 'RUN_QUALITY_GRADUATION') gg = w; }
  if (gg === null) { console.log(`L${L} W${W} rm${rm}: no graduation in 12 weeks; class ${x.p.capability.run.class}; ${[...Array(6).keys()].map(w => line(x.p, w)).join(' || ')}`); continue; }
  const longest = Math.max(...[...Array(gg + 1).keys()].flatMap(k => runs(x.p, k).map(s => s.prescription.durationMinutes)));
  const q = runs(x.p, gg + 1).find(s => s.role === 'QUALITY');
  console.log(`L${L} W${W} rm${rm}: graduated at review ${gg}; longest executed ${longest}; intro week: ${line(x.p, gg + 1)}; quality ${q ? q.prescription.durationMinutes + ' min (ceiling ' + (longest + 5) + ')' : 'none'}`);
}

console.log('\n=== C. easy run >= 90% of the session reported on the introduced quality day ===');
const c = reviewed({...GRAD, id: 'p11-credit'}, 0);
let gc = null;
for (let w = 0; w < 8 && gc === null; w++) { const r = weekly(c, w); if (r.action === 'RUN_QUALITY_GRADUATION') gc = w; }
const q = runs(c.p, gc + 1).find(s => s.role === 'QUALITY');
const m = Math.ceil(0.9 * q.prescription.durationMinutes);
const before = c.p.stateTrace[gc + 1].run;
const r = weekly(c, gc + 1, {o: s => s.role === 'QUALITY' ? {minutes: m} : {}});
const after = c.p.stateTrace[gc + 2].run;
console.log(`reported ${m} easy minutes on the ${q.prescription.durationMinutes}-min threshold day -> QUALITY ${r.gates.QUALITY}; qualityDone ${before.qualityDone}->${after.qualityDone}; achieved.quality ${JSON.stringify(after.achieved.quality?.work ?? null)}; qualityStep ${before.qualityStep}->${after.qualityStep}; thresholdDone ${before.thresholdDone}->${after.thresholdDone}`);
// Two more weeks: does the ladder step on the next easy-for-quality week?
const r2 = weekly(c, gc + 2, {o: s => s.role === 'QUALITY' ? {minutes: m} : {}});
const after2 = c.p.stateTrace[gc + 3].run;
console.log(`second such week -> QUALITY ${r2.gates.QUALITY}; qualityStep ${after.qualityStep}->${after2.qualityStep}; thresholdDone ${after.thresholdDone}->${after2.thresholdDone}; next quality ${JSON.stringify(runs(c.p, gc + 3).find(s => s.role === 'QUALITY')?.prescription.work)}`);
