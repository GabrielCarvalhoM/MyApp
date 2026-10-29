// Read-only step inspector for the R6 first evaluation.
// Written by the independent coaching-quality judge. It never imports or runs the runtime.
// Usage: node inspect-steps.mjs <caseId|ALL> [--weeks a-b] [--full]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const ev = JSON.parse(fs.readFileSync(path.join(root, 'CoachingCore/r6/holdout/FIRST_EVALUATION.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'), 'utf8'));
const want = process.argv[2] || 'ALL';
const full = process.argv.includes('--full');
const wIdx = process.argv.indexOf('--weeks');
const weekRange = wIdx > 0 ? process.argv[wIdx + 1].split('-').map(Number) : null;

function exStr(x) {
  const l = x.load || {};
  const load = l.mode === 'KNOWN' ? `${l.value}${l.convention === 'PER_HAND' ? 'ph' : ''}` : l.mode === 'ESTABLISH' ? 'EST' : l.mode === 'BODYWEIGHT' ? 'BW' : (l.mode || '?');
  return `${x.id} ${x.sets}x${x.reps}@${load} r${x.rir}`;
}
function sess(s) {
  const p = s.prescription || {};
  const w = p.work ? ` [${p.work.repetitions}x${p.work.workMinutes}/${p.work.recoveryMinutes}]` : '';
  const ex = s.sport === 'STRENGTH' ? ` {${(p.exercises || []).map(exStr).join('; ')}}` : '';
  const conv = s.converted ? ` conv=${JSON.stringify(s.converted).slice(0, 160)}` : '';
  const expl = s.explanation ? ` expl=${JSON.stringify(s.explanation).slice(0, 200)}` : '';
  return `${s.id} d${s.day}${s.turn ? s.turn[0] : ''} ${s.sport === 'RUN' ? 'R' : 'S'}:${s.role}${s.optional ? '?' : ''} ${p.durationMinutes ?? '-'}m${p.family && s.sport === 'RUN' && p.family !== s.role ? '(' + p.family + ')' : ''}${w}${ex}${s.status && s.status !== 'PLANNED' ? ' st=' + s.status : ''}${conv}${expl}`;
}
function sig(s) { const p = s.prescription || {}; return JSON.stringify([s.day, s.sport, s.role, s.optional, s.status, p.durationMinutes, p.work, (p.exercises || []).map(exStr)]); }
function weekRun(w) { return (w.sessions || []).filter(s => s.sport === 'RUN' && !s.optional && s.status !== 'SKIPPED').reduce((a, s) => a + (s.prescription?.durationMinutes || 0), 0); }

function diff(before, after) {
  const out = [];
  if (!before || !after) return ['  (no diff)'];
  const n = Math.max(before.weeks.length, after.weeks.length);
  for (let i = 0; i < n; i++) {
    const a = before.weeks[i], b = after.weeks[i];
    if (weekRange && (i < weekRange[0] || i > weekRange[1])) continue;
    if (!a || !b) { out.push(`   W${i} missing in ${a ? 'after' : 'before'}`); continue; }
    const am = new Map(a.sessions.map(s => [s.id, s])), bm = new Map(b.sessions.map(s => [s.id, s]));
    const lines = [];
    for (const [id, s] of bm) { const o = am.get(id); if (!o) lines.push(`     + ${sess(s)}`); else if (sig(o) !== sig(s) || full) { if (sig(o) !== sig(s)) { lines.push(`     - ${sess(o)}`); lines.push(`     + ${sess(s)}`); } } }
    for (const [id, s] of am) if (!bm.has(id)) lines.push(`     x ${sess(s)}`);
    if (a.phase !== b.phase || lines.length) out.push(`   W${i} ${a.phase}->${b.phase} run ${weekRun(a)}->${weekRun(b)}m` + (lines.length ? '\n' + lines.join('\n') : ''));
  }
  return out.length ? out : ['   (proposal identical in sessions)'];
}

for (const row of ev.rows) {
  if (want !== 'ALL' && row.caseId !== want) continue;
  const c = corpus.cases.find(x => x.caseId === row.caseId);
  if (!row.output?.steps?.length) continue;
  let current = row.output.generation.program;
  console.log(`===== ${row.caseId} (${c.family})`);
  row.output.steps.forEach((st, i) => {
    const cs = c.steps[i];
    const rv = st.review || {};
    const r = st.result || {};
    console.log(`--- S${i + 1} ${rv.event?.kind} wk=${rv.weekIndex} asOf=${rv.asOf} target=${rv.targetSessionId || '-'} adopt=${cs.adoptProposal}`);
    if (rv.changes) console.log(`   changes=${JSON.stringify(rv.changes)}`);
    if (rv.interruption) console.log(`   interruption=${JSON.stringify(rv.interruption)}`);
    if (rv.currentDemonstration) console.log(`   demo=${JSON.stringify(rv.currentDemonstration)}`);
    if (rv.signals) console.log(`   signals=${JSON.stringify(rv.signals)}`);
    console.log(`   obs=${JSON.stringify((rv.observations || []).map(o => [o.sessionId, o.actual?.completed, o.actual?.minutes, o.response?.performance, o.response?.recovery, o.response?.effort, o.response?.nextDayFunction, o.source?.quality, o.correctionOf ? 'corr:' + o.correctionOf : '', o.comparable === false ? 'noncomp' : '', o.confounded ? 'confounded' : '']))}`);
    if (st.resolutions) console.log(`   resolutions=${JSON.stringify(st.resolutions.map(x => [x.kind, x.sessionId, x.role, x.ambiguous]))}`);
    console.log(`   RESULT status=${r.status} action=${r.action} reason=${r.reason}`);
    if (r.missingInputs?.length) console.log(`   missingInputs=${JSON.stringify(r.missingInputs)}`);
    if (r.question) console.log(`   question=${JSON.stringify(r.question).slice(0, 800)}`);
    if (r.disclosures?.length) console.log(`   disclosures=${JSON.stringify(r.disclosures).slice(0, full ? 99999 : 1200)}`);
    if (r.learnedPatterns) console.log(`   learned=${JSON.stringify(r.learnedPatterns).slice(0, full ? 99999 : 1200)}`);
    if (r.substitutions) console.log(`   subs=${JSON.stringify(r.substitutions).slice(0, 800)}`);
    if (r.gates) console.log(`   gates=${JSON.stringify(r.gates).slice(0, full ? 99999 : 1200)}`);
    if (r.horizons) console.log(`   horizons=${JSON.stringify(r.horizons).slice(0, full ? 99999 : 800)}`);
    if (r.weekEvidence) console.log(`   weekEvidence=${JSON.stringify(r.weekEvidence && { ...r.weekEvidence, rows: undefined })}`);
    if (r.provenance) console.log(`   provenance=${JSON.stringify(r.provenance).slice(0, 600)}`);
    if (r.updatedModel) console.log(`   model obs=${r.updatedModel.observations?.length} excl=${r.updatedModel.excluded?.length} dup=${r.updatedModel.duplicates?.length} sup=${r.updatedModel.superseded?.length} conf=${r.updatedModel.conflicts?.length} causal=${r.updatedModel.causalityEstablished} patterns=${JSON.stringify(r.updatedModel.patterns || r.updatedModel.learned || null)?.slice(0, 400)}`);
    if (r.counterfactuals) console.log(`   counterfactuals=${JSON.stringify(r.counterfactuals.map(cf => [cf.id || cf.option || cf.kind, cf.selected ?? cf.chosen, (cf.reason || cf.rejectedBecause || '').toString().slice(0, 140)]))}`);
    if (r.proposal) { diff(current, r.proposal).forEach(l => console.log(l)); }
    if (cs.adoptProposal && r.proposal) current = r.proposal;
  });
}
