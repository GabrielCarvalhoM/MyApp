// Read-only compact step view for the R5-in-R6 replay: decision, counterfactuals, evidence use and proposal delta.
import {readFileSync} from 'node:fs';
const root = 'C:/Users/carva/Desktop/myApp/MyApp/';
const replay = JSON.parse(readFileSync(root + 'CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.json', 'utf8'));
const corpus = JSON.parse(readFileSync(root + 'CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json', 'utf8'));
const id = process.argv[2];
const row = replay.rows.find(r => r.caseId === id), c = corpus.cases.find(r => r.caseId === id);
const sig = s => {
  const p = s.prescription || {};
  const ex = (p.exercises || []).map(e => `${e.id}${e.sets}x${e.reps}@${e.load?.value ?? '-'}r${e.rir}`).join(',');
  return `d${s.day}:${s.anchorId || s.role}:${p.family}:${p.durationMinutes}${p.work ? ':' + p.work.repetitions + 'x' + p.work.workMinutes + '/' + p.work.recoveryMinutes : ''}${ex ? ':' + ex : ''}${s.optional ? ':OPT' : ''}${s.prescriptionSource?.origin && !/CURRENT_SELF/.test(s.prescriptionSource.origin) ? ':' + s.prescriptionSource.origin : ''}`;
};
console.log('#', id, c.family, c.operation);
console.log('SCENARIO:', c.scenario);
if (process.argv.includes('--assessment')) console.log('ASSESSMENT:', JSON.stringify(c.independentAssessment));
if (process.argv.includes('--input')) {
  const steps = c.operation === 'SEQUENCE' ? c.steps : [c];
  for (const s of steps) console.log('INPUTSTEP', JSON.stringify({review: s.review, observationFacts: s.observationFacts, historicalFacts: s.historicalFacts, target: s.target, adopt: s.adoptProposal}).slice(0, 3500));
}
let program = row.r6Output.generation.program;
for (const [i, st] of row.r6Output.steps.entries()) {
  const r = st.result;
  console.log(`STEP${i} asOf=${st.review.asOf} wk=${st.review.weekIndex} event=${st.review.event?.kind} => ${r.status}/${r.action}: ${r.reason}`);
  for (const o of st.review.observations || []) console.log('   obs', o.eventId, o.sessionId, 'at', o.observedAt, o.timeBasis || '', 'actual', JSON.stringify({c: o.actual?.completed, m: o.actual?.minutes, sets: o.actual?.sets}), 'resp', JSON.stringify(o.response), o.confounded ? 'CONFOUNDED:' + JSON.stringify(o.confounded) : '', o.comparable === false ? 'NONCOMPARABLE' : '');
  if (st.review.changes) console.log('   changes', JSON.stringify(st.review.changes).slice(0, 800));
  if (st.review.interruption) console.log('   interruption', JSON.stringify(st.review.interruption));
  if (st.review.currentDemonstration) console.log('   demo', JSON.stringify(st.review.currentDemonstration));
  for (const cf of r.counterfactuals || []) console.log('   cf', cf.action ?? cf.id, cf.admissible, '-', (cf.reason || '').slice(0, 220), cf.costs?.length ? JSON.stringify(cf.costs).slice(0, 300) : '');
  if (r.missingInputs?.length) console.log('   missing', JSON.stringify(r.missingInputs));
  if (r.question) console.log('   question', JSON.stringify(r.question));
  for (const k of ['excludedObservations', 'quarantined', 'duplicates', 'provenance', 'evidence', 'gates', 'horizons', 'learning', 'uncertainty', 'disclosure', 'disclosures', 'substitutions', 'nextObservation', 'errors']) if (r[k] && JSON.stringify(r[k]) !== '[]' && JSON.stringify(r[k]) !== '{}') console.log('   ' + k, JSON.stringify(r[k]).slice(0, 1200));
  const m = r.updatedModel;
  if (m) console.log('   model', JSON.stringify({keys: Object.keys(m), obs: (m.observations || m.entries || []).length, learningConsent: m.learningConsent}).slice(0, 400));
  console.log('   ledger', (r.actualLedger || []).length, 'otherKeys', Object.keys(r).join(','));
  if (r.proposal) {
    const base = program;
    for (const w of r.proposal.weeks) {
      const old = base.weeks.find(x => x.index === w.index);
      const a = (old?.sessions || []).map(sig).join(' '), b = w.sessions.map(sig).join(' ');
      if (a !== b || old?.phase !== w.phase) console.log(`   Δ W${w.index} ${old?.phase}->${w.phase}\n      was ${a}\n      now ${b}${w.notes?.length ? '\n      notes ' + JSON.stringify(w.notes) : ''}`);
    }
  }
  if (st.review && c.operation === 'SEQUENCE' && (c.steps[i]?.adoptProposal) && r.proposal) program = r.proposal;
}
