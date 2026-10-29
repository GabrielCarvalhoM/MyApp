// Read-only structural checks over the first-evaluation programs (generated programs and step proposals).
// Written by the independent coaching-quality judge. It never imports or runs the runtime.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const ev = JSON.parse(fs.readFileSync(path.join(root, 'CoachingCore/r6/holdout/FIRST_EVALUATION.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'), 'utf8'));
const live = s => s.status !== 'SKIPPED' && !s.optional;
const absDay = s => s.weekIndex * 7 + s.day;
const lowerLoaded = s => s.sport === 'STRENGTH' && (s.prescription?.exercises || []).some(x => x.region === 'LOWER' && x.role === 'MAIN' && ['MODERATE', 'HEAVY'].includes(x.lowerDemand));

function arrangement(p) {
  const all = p.weeks.flatMap(w => w.sessions.filter(live));
  const longs = all.filter(s => s.sport === 'RUN' && s.role === 'LONG');
  const qual = all.filter(s => s.sport === 'RUN' && s.role === 'QUALITY');
  const out = { lowerEveOfLong: [], qualityDayAfterLong: [], qualityBackToBack: [], lowerBeforeQualitySameDayOrEve: [], weeksWithoutPull: 0, strengthWeeks: 0 };
  for (const L of longs) {
    for (const s of all) if (lowerLoaded(s) && absDay(s) === absDay(L) - 1) out.lowerEveOfLong.push(`W${s.weekIndex}d${s.day}`);
    for (const q of qual) if (absDay(q) === absDay(L) + 1) out.qualityDayAfterLong.push(`W${q.weekIndex}d${q.day}`);
  }
  for (const a of qual) for (const b of qual) if (absDay(b) - absDay(a) === 1) out.qualityBackToBack.push(`W${a.weekIndex}d${a.day}`);
  for (const q of qual) for (const s of all) if (lowerLoaded(s) && (absDay(s) === absDay(q) - 1 || (absDay(s) === absDay(q) && s.turn === 'AM' && q.turn === 'PM'))) out.lowerBeforeQualitySameDayOrEve.push(`W${s.weekIndex}d${s.day}`);
  for (const w of p.weeks) { const str = w.sessions.filter(s => live(s) && s.sport === 'STRENGTH' && (s.prescription?.exercises || []).length); if (!str.length) continue; out.strengthWeeks++; if (!str.some(s => s.prescription.exercises.some(x => x.pattern === 'PULL'))) out.weeksWithoutPull++; }
  for (const k of Object.keys(out)) if (Array.isArray(out[k])) out[k] = [...new Set(out[k])];
  return out;
}

// Bodyweight repetitions that fall in a proposal while sets do not fall (outside phase reductions).
function bodyweightRepDrops(before, after) {
  const drops = [];
  for (const w of after.weeks) {
    const bw = before.weeks[w.index]; if (!bw || bw.phase !== w.phase) continue;
    const bm = new Map(bw.sessions.map(s => [s.id, s]));
    for (const s of w.sessions) {
      const o = bm.get(s.id); if (!o || s.sport !== 'STRENGTH') continue;
      for (const x of s.prescription?.exercises || []) {
        if (x.load?.mode !== 'BODYWEIGHT') continue;
        const y = (o.prescription?.exercises || []).find(e => e.id === x.id);
        if (y && x.reps < y.reps && x.sets >= y.sets) drops.push(`W${w.index} ${x.id} ${y.sets}x${y.reps}->${x.sets}x${x.reps}`);
      }
    }
  }
  return drops;
}

const result = { programs: {}, bodyweightRepDrops: {} };
for (const row of ev.rows) {
  const g = row.output?.generation;
  if (g?.program) result.programs[row.caseId] = arrangement(g.program);
  const c = corpus.cases.find(x => x.caseId === row.caseId);
  let current = g?.program;
  (row.output?.steps || []).forEach((st, i) => {
    const pr = st.result?.proposal;
    if (pr && current) { const d = bodyweightRepDrops(current, pr); if (d.length) result.bodyweightRepDrops[`${row.caseId} S${i + 1}`] = { gates: st.result.gates ? Object.fromEntries(Object.entries(st.result.gates).filter(([k]) => d.some(x => x.includes(' ' + k + ' ')))) : null, examples: d.slice(0, 4), count: d.length }; }
    if (pr && c.steps[i].adoptProposal) current = pr;
  });
}
fs.writeFileSync(path.join(here, 'program-checks.out.json'), JSON.stringify(result, null, 2) + '\n');
const summary = Object.fromEntries(Object.entries(result.programs).map(([k, v]) => [k, { lowerEveOfLong: v.lowerEveOfLong.length, qualityDayAfterLong: v.qualityDayAfterLong.length, qualityBackToBack: v.qualityBackToBack.length, lowerBeforeQuality: v.lowerBeforeQualitySameDayOrEve.length, weeksWithoutPull: `${v.weeksWithoutPull}/${v.strengthWeeks}` }]));
console.log(JSON.stringify(summary));
console.log('bodyweight rep drops in', Object.keys(result.bodyweightRepDrops).length, 'steps:', Object.keys(result.bodyweightRepDrops).join(', '));
