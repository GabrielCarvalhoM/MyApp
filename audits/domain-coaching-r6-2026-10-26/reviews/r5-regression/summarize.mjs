// Read-only summarizer for the R5-in-R6 regression replay. Independent Quality judge tool.
// Usage: node summarize.mjs <caseId> [--assessment] [--weeks a-b]
import {readFileSync} from 'node:fs';
const root = 'C:/Users/carva/Desktop/myApp/MyApp/';
const replay = JSON.parse(readFileSync(root + 'CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.json', 'utf8'));
const corpus = JSON.parse(readFileSync(root + 'CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json', 'utf8'));
const id = process.argv[2];
const row = replay.rows.find(r => r.caseId === id);
const c = corpus.cases.find(r => r.caseId === id);
const showAssess = process.argv.includes('--assessment');
const wi = process.argv.indexOf('--weeks');
const [wa, wb] = wi > 0 ? process.argv[wi + 1].split('-').map(Number) : [0, 99];

const ex = e => `${e.id}${e.sets}x${e.reps}${e.load ? '@' + e.load.value + (e.load.convention === 'PER_HAND' ? 'ph' : '') : ''}${e.rir != null ? 'r' + e.rir : ''}`;
const sess = s => {
  const p = s.prescription || {};
  if (p.modality === 'STRENGTH') return `d${s.day} ${s.anchorId || s.role} STR ${p.durationMinutes}m [${(p.exercises || []).map(ex).join(' ')}]${s.optional ? ' OPT' : ''}${s.substitution ? ' SUB' : ''}`;
  const w = p.work ? ` work${p.work.repetitions}x${p.work.workMinutes}/${p.work.recoveryMinutes}` : '';
  return `d${s.day} ${s.anchorId || s.role} ${p.family} ${p.durationMinutes}m${w}${s.role ? ' role=' + s.role : ''}${s.optional ? ' OPT' : ''}${s.prescriptionSource ? ' src=' + s.prescriptionSource.origin : ''}`;
};
const prog = (p, label) => {
  if (!p) { console.log(label, 'NO PROGRAM'); return; }
  console.log(label, 'sel=', p.selectedScheduleId, 'blocks=', (p.blocks || []).map(b => `${b.phase}[${b.startWeek}-${b.endWeekExclusive})`).join(' '), 'eventTransition=', JSON.stringify(p.eventTransition));
  if (p.gaps?.length) console.log('  gaps', JSON.stringify(p.gaps));
  if (p.decisions?.length) console.log('  decisions', JSON.stringify(p.decisions).slice(0, 1500));
  for (const w of p.weeks || []) {
    if (w.index < wa || w.index > wb) continue;
    console.log(`  W${w.index} ${w.phase} ${w.status} runMin=${w.plannedRunMinutes} | ` + w.sessions.map(sess).join(' | ') + (w.notes?.length ? ' NOTES:' + JSON.stringify(w.notes) : ''));
  }
};
console.log('#', id, c.family, c.operation);
console.log('SCENARIO:', c.scenario);
if (showAssess) console.log('ASSESSMENT:', JSON.stringify(c.independentAssessment, null, 1));
const g = row.r6Output?.generation;
console.log('GEN', g?.status, g?.reason, 'missing=', JSON.stringify(g?.missingInputs), 'errors=', JSON.stringify(g?.errors), 'unsupportedDecisions=', g?.unsupportedProgramDecisions, 'scopeSatisfied=', g?.requestedScopeSatisfied);
if (g?.counterfactuals) console.log('  CF', JSON.stringify(g.counterfactuals).slice(0, 2500));
if (g?.excludedAlternatives?.length) console.log('  EXCL', JSON.stringify(g.excludedAlternatives).slice(0, 1500));
if (g?.question) console.log('  Q', JSON.stringify(g.question));
prog(g?.program, 'PROGRAM');
for (const [i, st] of (row.r6Output?.steps || []).entries()) {
  const res = st.result || {};
  console.log(`STEP${i}`, res.status, res.action, '-', res.reason);
  console.log('  review', JSON.stringify({asOf: st.review?.asOf, weekIndex: st.review?.weekIndex, event: st.review?.event, changes: st.review?.changes, interruption: st.review?.interruption, currentDemonstration: st.review?.currentDemonstration, eligibility: st.review?.eligibility?.status, obs: (st.review?.observations || []).map(o => ({id: o.eventId, s: o.sessionId, at: o.observedAt, act: o.actual ?? o.actualStimulus ?? o.stimulus, resp: o.response ?? o.responses}))}).slice(0, 2500));
  for (const k of Object.keys(res)) {
    if (['proposal', 'runtimeVersion', 'mode', 'applied', 'officialPlanState', 'appliedState', 'horizonsConsidered', 'status', 'action', 'reason'].includes(k)) continue;
    const v = JSON.stringify(res[k]);
    if (v && v !== '[]' && v !== 'null' && v !== '{}') console.log('  ' + k, v.slice(0, 1800));
  }
  if (res.proposal) prog(res.proposal, `  PROPOSAL${i}`);
}
