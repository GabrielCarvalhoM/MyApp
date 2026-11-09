// V1CP Fix-Forward: the seven representative F08 journeys (A-G) on synthetic athletes, end to end through the public runtime. Read-only: it writes
// only the JSON trace named on the command line. Usage: node f08-journeys.mjs <repoRoot> <outJson>
// Each step records what the athlete sends, what the coach decides (status, action, reason), the doses that matter, and whether a question was asked,
// so a reader can follow the journey without running it. Every answer is synthetic and stated; nothing a prescription needs is invented.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [ROOT, OUT] = process.argv.slice(2);
if (!ROOT || !OUT) { console.error('usage: node f08-journeys.mjs <repoRoot> <outJson>'); process.exit(2); }
const {generateProgram, evaluateProgram, restartProgram} = await import(pathToFileURL(path.join(ROOT, 'CoachingCore/src/r6-index.mjs')).href);
const F = await import(pathToFileURL(path.join(ROOT, 'CoachingCore/src/v1-f08.mjs')).href);
const {HYBRID, doneBefore} = await import(pathToFileURL(path.join(ROOT, 'CoachingCore/test/v1cp-fixtures.mjs')).href);
const live = s => !!s?.prescription && s.status !== 'SKIPPED';
const ELIG = (d, x = {}) => ({status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false, ...x});
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const NO = c => Object.fromEntries(F.signsFor(c).map(k => [k, false])), XNO = c => Object.fromEntries(F.exerciseSignsFor(c).map(k => [k, false]));
const RNO = () => Object.fromEntries(F.READINESS_SIGNS.map(k => [k, false]));
const S6NO = () => ({warningSigns: Object.fromEntries(F.READINESS_SIGNS.slice(0, 9).map(k => [k, false])), exerciseResponse: Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k => [k, false]))});
const READY = (sports = {RUN: {ready: true}, STRENGTH: {ready: true, restrictions: []}}) => ({declaredRecovered: true, warningSigns: RNO(), sports});

function journey(name, goal, input = HYBRID()) {
  const g = generateProgram(input), t = {name, goal, p: g.program, ledger: [], ref: null, n: 0, steps: []};
  t.day = (w, d) => addDays(t.p.startDate, w * 7 + d);
  t.week = w => {
    const x = t.p.weeks[w]; if (!x) return null;
    const rungs = (x.adaptations ?? []).filter(a => a.kind === 'WELLBEING_REDUCTION' && !a.endedBy).map(a => `${a.phase}:${Object.entries(a.rungs ?? {}).map(([s, r]) => s[0] + r).join('/')}`);
    const run = x.sessions.filter(s => s.sport === 'RUN').map(s => live(s) ? `${s.role}${s.prescription.durationMinutes}` : s.role === 'RACE' ? 'RACE(-)' : '-');
    const str = x.sessions.filter(s => s.sport === 'STRENGTH').map(s => live(s) ? s.prescription.exercises.map(e => `${e.sets}x${e.reps}@${e.rir}`).join(',') : '-');
    const race = x.sessions.filter(s => s.role === 'RACE').map(s => ({date: s.date, ownEvent: !!s.ownEvent, coach: s.coachRecommendation ?? null, plan: s.prescription ? `${s.prescription.family} ${s.prescription.durationMinutes ?? ''}`.trim() : null}));
    return {week: w, rungs, run, strength: str, ...(race.length ? {race} : {})};
  };
  t.step = (w, d, kind, extra = {}, time = '20:00', note = '') => {
    const day = t.day(w, d);
    const review = {version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${day}T${time}:00-03:00`, weekIndex: w, event: {id: extra.eventId ?? `${name}-${++t.n}`, kind}, eligibility: extra.eligibility ?? ELIG(day), observations: extra.observations ?? [], ...(extra.wellbeing ? {wellbeing: extra.wellbeing} : {}), ...(extra.check ? {wellbeingCheck: extra.check} : {}), ...(extra.readiness ? {readiness: extra.readiness} : {}), ...(extra.interruption ? {interruption: extra.interruption} : {}), ...(extra.changes ? {changes: extra.changes} : {}), ...(t.ledger.length ? {actualLedger: t.ledger} : {}), ...(t.ref ? {referenceState: t.ref} : {})};
    const r = evaluateProgram(t.p, review);
    t.ledger = r.actualLedger ?? t.ledger; t.ref = r.referenceState ?? t.ref; if (r.proposal) t.p = r.proposal;
    t.steps.push({day, kind, note, status: r.status, action: r.action, asked: r.status === 'ASK' ? r.missingInputs : null, offers: (r.offers ?? []).map(o => o.id), reason: r.reason});
    return r;
  };
  t.done = w => doneBefore(t.p, w + 1).filter(o => t.p.weeks[w].sessions.some(s => s.id === o.sessionId));
  t.review = (w, c, extra = {}) => { const obs = extra.observations ?? t.done(w); return t.step(w, 6, 'WEEKLY_REVIEW', {observations: obs, check: {warningSigns: NO(c), ...(obs.length ? {exerciseResponse: XNO(c)} : {}), ...(extra.improved !== undefined ? {improved: extra.improved} : {})}}, '20:00', extra.note ?? 'weekly review with the check'); };
  t.out = () => ({name, goal, steps: t.steps, weeks: t.p.weeks.map((_, w) => t.week(w)), questions: t.steps.filter(s => s.status === 'ASK').length, clinical: t.steps.filter(s => s.status === 'CLINICAL_HUMAN_REQUIRED').length});
  t.step(0, 6, 'WEEKLY_REVIEW', {observations: doneBefore(t.p, 1)}, '20:00', 'week 0 done as planned');
  return t;
}
const journeys = [];

// A: mild indisposition, a temporary reduction, better, back to training. No document; no endless questions.
{
  const t = journey('A', 'Indisposicao leve: reduz, melhora e volta a treinar');
  t.step(1, 1, 'NOT_FEELING_100', {wellbeing: {condition: 'MILD_INDISPOSITION', warningSigns: NO('MILD_INDISPOSITION'), intent: 'REDUCE_SUBSTANTIAL', days: 4}}, '07:00', 'I am not 100%: much lighter, 4 days');
  t.step(1, 5, 'WELLBEING_CHECK', {check: {warningSigns: NO('MILD_INDISPOSITION'), improved: true}}, '09:00', 'better: the short check');
  for (let w = 1; w < 6; w++) t.review(w, 'MILD_INDISPOSITION');
  journeys.push(t.out());
}
// B: a faster recovery: the athlete feels better on day 3, ends the reduction early with the short check (D4) and picked the faster return (D2): the
// return still climbs through executed weeks; nothing comes back by the calendar (D1). With no whole week inside the window, faster equals balanced.
{
  const t = journey('B', 'Recuperacao mais rapida: encerra a reducao antes, retomada rapida, sem volta automatica a dose anterior');
  t.step(1, 0, 'NOT_FEELING_100', {wellbeing: {condition: 'UNUSUAL_FATIGUE', warningSigns: NO('UNUSUAL_FATIGUE'), intent: 'REDUCE_LIGHT', days: 7, returnSpeed: 'FASTER'}}, '07:00', 'unusual fatigue: easier sessions, 7 days, faster return');
  t.step(1, 2, 'WELLBEING_CHECK', {check: {warningSigns: NO('UNUSUAL_FATIGUE'), improved: true}}, '07:00', 'day 3: I feel better (the short check, with today\'s screen)');
  for (let w = 1; w < 5; w++) t.review(w, 'UNUSUAL_FATIGUE');
  journeys.push(t.out());
}
// C: a local problem: strength's lower-body rows rest; running and the upper rows continue; a later systemic report covers both.
{
  const t = journey('C', 'Problema localizado: so as linhas de membros inferiores da forca param; corrida continua');
  t.step(1, 0, 'NOT_FEELING_100', {wellbeing: {condition: 'MINOR_DISCOMFORT', sports: ['STRENGTH'], region: 'LOWER_BODY', warningSigns: NO('MINOR_DISCOMFORT'), intent: 'REST', days: 5}}, '07:00', 'knee discomfort: rest lower-body strength, 5 days');
  t.review(1, 'MINOR_DISCOMFORT', {improved: true, note: 'window end: better'});
  for (let w = 2; w < 4; w++) t.review(w, 'MINOR_DISCOMFORT');
  t.step(4, 1, 'NOT_FEELING_100', {wellbeing: {condition: 'UNUSUAL_FATIGUE', warningSigns: NO('UNUSUAL_FATIGUE'), intent: 'REDUCE_SUBSTANTIAL', days: 3}}, '07:00', 'then unusual fatigue (systemic): both sports');
  journeys.push(t.out());
}
// D: better but still limited: a clinical hold, then the athlete's own readiness with a restriction: conservative restart, the restriction a hard cap.
{
  const t = journey('D', 'Recuperacao incompleta: volta conservadora com restricao; nunca retorno completo nem liberacao presumida');
  t.step(1, 1, 'NOT_FEELING_100', {wellbeing: {condition: 'MINOR_DISCOMFORT', warningSigns: {...NO('MINOR_DISCOMFORT'), [F.WARNING_SIGNS.W7]: true}, intent: 'REST', days: 5}}, '08:00', 'swelling: a warning sign');
  t.step(2, 1, 'READINESS_DECLARATION', {readiness: READY({RUN: {ready: true, runningNotRestricted: true}, STRENGTH: {ready: true, restrictions: ['AVOID_LOWER_BODY_STRENGTH']}})}, '07:00', 'I am ready, but I still avoid lower-body strength');
  for (let w = 2; w < 5; w++) t.step(w, 6, 'WEEKLY_REVIEW', {observations: t.done(w), check: S6NO()}, '20:00', 'weekly review with the restart check');
  journeys.push(t.out());
}
// E: a long pause: the athlete updates their facts and starts a new plan; the record is kept; current capacity is not set to old records.
{
  const t = journey('E', 'Pausa prolongada: novo plano a partir dos dados atuais; historico preservado');
  for (let w = 1; w < 3; w++) t.review(w, 'NEED_REST', {note: 'training as planned'});
  const i = HYBRID(); i.asOf = t.day(8, 0); i.startDate = t.day(8, 1); i.athlete.eligibility = ELIG(i.asOf);
  i.athlete.pause = {reasonCategory: 'TRAVEL', nonclinical: true}; i.athlete.recent = {runDaysPerWeek: 2, runMinutesPerWeek: 60, longestRunMinutes: 30, strengthDaysPerWeek: 1};
  const g = restartProgram({intake: i, record: t.ledger, referenceState: t.ref});
  const out = t.out();
  out.restart = {status: g.status, reason: g.reason ?? null, missingInputs: g.missingInputs ?? [], recordKept: g.restart ? g.restart.carriedRecord.length === t.ledger.length : null, priorCapacity: g.restart?.priorCapacity ?? null,
    firstWeek: g.program ? {run: g.program.weeks[0].sessions.filter(s => s.sport === 'RUN' && live(s)).map(s => s.prescription.durationMinutes), strength: g.program.weeks[0].sessions.filter(s => s.sport === 'STRENGTH' && live(s)).map(s => s.prescription.exercises.map(e => `${e.sets}x${e.reps}@${e.rir}`).join(','))} : null,
    oldPeak: {run: Math.max(...t.p.weeks.slice(0, 3).flatMap(x => x.sessions.filter(s => s.sport === 'RUN' && live(s)).map(s => s.prescription.durationMinutes)))}};
  journeys.push(out);
}
// F: a race during the return (D3): it stays on the calendar as the athlete's own event, no question blocks, the paths are offered once, and the coach
// plans that day as the return's rung allows (an easy run), never at race effort or as a completion.
{
  const i = HYBRID(); i.athlete.goals = {run: {kind: 'RACE', event: {kind: '10K', date: '2026-12-26'}}, strength: 'GENERAL'};
  const t = journey('F', 'Corrida durante o retorno: evento proprio do atleta, sem bloqueio; o dia segue a etapa do retorno', i);
  const rw = t.p.weeks.findIndex(x => x.sessions.some(s => s.role === 'RACE'));
  for (let w = 1; w < rw - 1; w++) t.review(w, 'MILD_ILLNESS');
  t.step(rw - 1, 1, 'NOT_FEELING_100', {wellbeing: {condition: 'MILD_ILLNESS', warningSigns: NO('MILD_ILLNESS'), intent: 'REDUCE_SUBSTANTIAL', days: 5}}, '07:00', 'a mild illness the week before the race');
  t.review(rw - 1, 'MILD_ILLNESS', {improved: true, note: 'window end: better'});
  t.review(rw, 'MILD_ILLNESS', {note: 'race week: the race slot follows the return rung'});
  journeys.push(t.out());
}
// G: a new interruption after the return: the new episode is judged on its own, never by the earlier one.
{
  const t = journey('G', 'Nova interrupcao apos o retorno: novo episodio avaliado por si');
  t.step(1, 1, 'NOT_FEELING_100', {wellbeing: {condition: 'NEED_REST', warningSigns: NO('NEED_REST'), intent: 'REDUCE_LIGHT', days: 3, returnSpeed: 'FASTER'}}, '07:00', 'need rest: easier, 3 days');
  t.review(1, 'NEED_REST', {improved: true, note: 'window end: better'});
  for (let w = 2; w < 5; w++) t.review(w, 'NEED_REST');
  t.step(5, 1, 'NOT_FEELING_100', {wellbeing: {condition: 'MILD_ILLNESS', warningSigns: NO('MILD_ILLNESS'), intent: 'REST', days: 4}}, '07:00', 'weeks later: a mild illness');
  const s2 = journey('G2', 'Nova parada apos um recomeco declarado: a causa e perguntada de novo');
  s2.step(3, 0, 'RETURN_AFTER_PAUSE', {interruption: {startDate: s2.day(2, 1), endDate: s2.day(2, 6), reasonCategory: 'ILLNESS', reason: 'flu'}}, '07:00', 'a flu break: clinical');
  s2.step(3, 0, 'READINESS_DECLARATION', {readiness: READY(), eligibility: ELIG(`${s2.day(3, 0)}T11:30:00Z`)}, '09:00', 'I am ready again');
  for (let w = 3; w < 6; w++) s2.step(w, 6, 'WEEKLY_REVIEW', {observations: s2.done(w), check: S6NO()}, '20:00', 'training again');
  const i = HYBRID(); i.asOf = addDays(s2.day(5, 6), 35); i.startDate = addDays(i.asOf, 1); i.athlete.eligibility = ELIG(i.asOf);
  const g = restartProgram({intake: i, record: s2.ledger, referenceState: s2.ref});
  const out = t.out(); out.afterRestart = {...s2.out(), restartAfterNewStop: {status: g.status, missingInputs: g.missingInputs ?? []}};
  journeys.push(out);
}

fs.writeFileSync(OUT, JSON.stringify({generatedBy: 'audits/v1cp-fix-forward-2026-11-09/evidence/f08-journeys.mjs', root: path.resolve(ROOT), journeys}, null, 1));
for (const j of journeys) console.log(j.name, '|', j.goal, '| steps', j.steps.length, '| questions', j.questions, '| clinical', j.clinical);
