// R7-D final holdout (H1) builder, R7D-AUTHOR-BRIEF-FINAL-7. Plain Node: node:fs, node:path only.
// Authored independently from the public interface (R7D-INTERFACE-7) and CASE_SCHEMA_R7D.json.
// It only constructs JSON; it imports nothing from the repository and never runs the coach.
import fs from 'node:fs';
import path from 'node:path';

const HERE = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'R7D_FINAL_HOLDOUT.json');

// ---------- calendar ----------
function addDays(s, n) { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function off(min) { const sg = min < 0 ? '-' : '+'; const a = Math.abs(min); return sg + String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0'); }
function cal(start, tz) {
  return {
    d: (w, dd) => addDays(start, 7 * w + dd),
    ts: (w, dd, t) => addDays(start, 7 * w + dd) + 'T' + t + ':00' + off(tz),
  };
}
const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const weekday = (s) => WD[new Date(s + 'T00:00:00Z').getUTCDay()];

// ---------- steps and facts ----------
const at = (week, day, time) => ({ week, day, time });
const R = (week, sport, day, role) => { const r = { week, sport }; if (day != null) r.day = day; if (role) r.role = role; return r; };
const done = (ref, x = {}) => ({ ref, completed: true, asPrescribed: true, ...x });
const miss = (ref, x = {}) => ({ ref, completed: false, ...x });
const each = (weeks, sport, roles, x = { completed: true, asPrescribed: true }) => ({ each: { weeks, sport, ...(roles ? { roles } : {}) }, ...x });
const step = (stepId, atv, event, x = {}) => ({ stepId, at: atv, event, ...x });
const review = (extra = {}) => ({ kind: 'WEEKLY_REVIEW', ...extra });
const brk = (startDate, endDate, reasonCategory, reason, x = {}) => ({ startDate, endDate, reasonCategory, reason, nonclinical: true, ...x });

// ---------- expectations ----------
const INV = 'INVARIANT_ORACLE', DOM = 'DOMAIN_ORACLE', MET = 'METAMORPHIC_ORACLE', NED = 'NOT_EVALUABLE_DOMAIN';
const E = (expectationId, atStep, oracleClass, assert, rationale) => ({ expectationId, atStep, oracleClass, assert, rationale });
const ST = (...oneOf) => ({ type: 'STATUS_IN', oneOf });
const VALID = { type: 'VALIDITY_IS', value: 'VALID_WITHIN_CURRENT_BOUNDED_SCOPE' };
const RECON = { type: 'VALIDITY_IS', value: 'REQUIRES_RECONCILIATION' };
const QK = (value) => ({ type: 'QUESTION_KIND_IS', value });
const NP = { type: 'NO_PRESCRIPTION' };
const J = (statement) => ({ type: 'JUDGED', statement });
const ABS = (weeks, sport, roles) => ({ type: 'ROLE_ABSENT', weeks, sport, roles });
const PRES = (weeks, sport, roles) => ({ type: 'ROLE_PRESENT', weeks, sport, roles });
const PH = (week, ...oneOf) => ({ type: 'PHASE_IS', week, oneOf });
const CMP = (role, week, op, otherWeek) => ({ type: 'ROLE_MINUTES_COMPARE', sport: 'RUN', role, week, op, otherWeek });
const RUN_ROLES = ['EASY', 'LONG', 'QUALITY', 'WALK_JOG', 'WALK', 'RACE', 'RACE_TOUCH', 'SHAKEOUT', 'RECOVERY_EASY'];

// ---------- intake ----------
const elig = (assessedAt, x = {}) => ({ status: 'NONCLINICAL_CONFIRMED', assessedAt, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false, ...x });
function intake({ asOf, start, weeks, tz, athlete, schedule, learningConsent, history }) {
  const o = { version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf, startDate: start, weeks };
  if (learningConsent !== undefined) o.learningConsent = learningConsent;
  if (tz !== undefined) o.timezoneOffsetMinutes = tz;
  o.athlete = { ageEligible: true, eligibility: elig(asOf), ...athlete };
  o.schedule = schedule;
  if (history) o.history = history;
  return o;
}
const ia = (rationale, preferredCoachingBehavior, acceptableAlternatives, concerns) => ({ rationale, preferredCoachingBehavior, acceptableAlternatives, concerns });
const kex = (id, sets, reps, value, convention, rir, observedAt) => ({ id, sets, reps, load: { value, unit: 'KG', convention }, rir, current: true, familiar: true, tolerated: true, observedAt });

const CASES = [];
let n = 0;
function K(fn) { n += 1; const caseId = 'R7D-F' + String(n).padStart(2, '0'); CASES.push({ caseId, ...fn(caseId) }); }

// ===================== COLD STARTS AND EVENTS =====================

// F01 run-first half marathon, 16 weeks, Wednesday start, confounded long runs, race date moved earlier
K((id) => {
  const c = cal('2026-11-11', 60);
  const longBad = { ref: R(1, 'RUN', 4, 'LONG'), completed: true, asPrescribed: true, confounded: true, response: { performance: 'UNDER', effort: 'HARDER', recovery: 'ADVERSE', nextDayFunction: 'IMPAIRED' } };
  const s1obs = [done(R(1, 'RUN', 0)), done(R(1, 'STRENGTH', 1)), done(R(1, 'RUN', 2)), longBad, done(R(1, 'STRENGTH', 5))];
  const tl = [
    step('s1', at(1, 6, '20:00'), review(), { observations: s1obs, note: 'Hilly trail long run on a hot afternoon: slower and harder than planned, legs still heavy and slow the next day.' }),
    step('s2', at(2, 6, '20:00'), review(), { observations: [done(R(2, 'RUN', 0)), done(R(2, 'STRENGTH', 1)), done(R(2, 'RUN', 2)), { ref: R(2, 'RUN', 4, 'LONG'), completed: true, asPrescribed: true, confounded: true, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE', nextDayFunction: 'NORMAL' } }, done(R(2, 'STRENGTH', 5))], note: 'Windy coastal long run (confounded) that went fine: the control.' }),
    step('s3', at(3, 1, '12:00'), { kind: 'EVENT_DATE_CHANGE', changes: { eventDate: c.d(14, 4) } }, { note: 'Organisers moved the half marathon one week earlier.' }),
  ];
  const varTl = JSON.parse(JSON.stringify(tl)); delete varTl[0].observations[3].confounded;
  return {
    authorIntent: 'Cold start of a run-first half-marathon plan over 16 weeks with a non-Monday calendar, then a confounded long run with adverse recovery and impaired next day versus a confounded long run that went fine, then the race moved a week earlier. Confounding must not erase an adverse recovery.',
    coverageTags: ['COLD_START', 'RUN_FIRST', 'RACE_HALF', 'H16', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'START_NON_MONDAY', 'TIMEZONE', 'ADVERSE_RESPONSE', 'EVENT_DATE_CHANGE', 'SKIPPED_REVIEW'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-10', start: '2026-11-11', weeks: 16, tz: 60, athlete: { id: 'ath-f01-ines', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 130, longestRunMinutes: 60, strengthDaysPerWeek: 0 }, performanceAnchors: [{ kind: 'RACE_RESULT', distance: '10K', minutes: 54, date: '2026-11-08' }], goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: '2027-02-28', timeGoalMinutes: 125 } }, strength: 'RUNNING_SUPPORT' }, equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BANDS'] }, schedule: { runDays: [0, 2, 4], strengthDays: [1, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 40, longRunDay: 4, longRunMinutes: 120 } }),
    timeline: tl,
    expectedDomainProperties: [
      E('f01-e1', 'GENERATE', DOM, ST('PROPOSED'), 'An in-scope adult with confirmed eligibility, a race date inside 16 weeks and a 10K anchor can be planned.'),
      E('f01-e2', 'GENERATE', DOM, PRES([15], 'RUN', ['RACE']), 'The race sits on its stated date in the last week.'),
      E('f01-e3', 'GENERATE', DOM, PH(15, 'RACE_WEEK'), 'The week of the race is the race week.'),
      E('f01-e4', 'GENERATE', DOM, CMP('LONG', 11, '>=', 1), 'A half-marathon build progresses the long run for an athlete whose longest run is 60 minutes.'),
      E('f01-e5', 's1', DOM, CMP('LONG', 2, '<=', 1), 'After an adverse recovery and an impaired next day, the next long run is not extended, whatever the heat or terrain.'),
      E('f01-e6', 's1', DOM, J('The adverse recovery and impaired next day of the confounded long run are treated as real signals: the confounding only makes its pace and effort hard to read.'), 'R7D-INTERFACE-2 section 4; a coach does not explain away a bad recovery with the weather.'),
      E('f01-e7', 's2', DOM, J('The confounded long run that went fine is not penalised: the plan may resume its normal progression without treating the slow conditions as underperformance.'), 'Control for the confounded flag.'),
      E('f01-e8', 's3', DOM, PRES([14], 'RUN', ['RACE']), 'The moved race date is honoured.'),
      E('f01-e9', 's3', DOM, ABS([15], 'RUN', ['RACE']), 'No race remains on the old date.'),
      E('f01-e10', 's3', DOM, PH(14, 'RACE_WEEK', 'TAPER'), 'The new race week is treated as the race week (or the end of its taper).'),
    ],
    metamorphicRelations: [
      { relation: 'VARIANT', variant: { timeline: varTl }, compareAtStep: 's1', expect: 'SAME_PLAN', rationale: 'Removing the confounded flag from a run whose recovery was adverse and next day impaired must not change the plan: confounding never neutralises recovery signals.' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 's1' }, { relation: 'CALENDAR_SHIFT' },
    ],
    independentAssessment: ia(
      'Ines is an intermediate runner with a 54-minute 10K and a 60-minute longest run aiming at a 2:05 half in 16 weeks; strength is support work she is new to. Heat and hills explain a slow pace, not legs that are still impaired the next day.',
      'Propose a progressive half-marathon build with a gradual long-run progression on Sundays and two short running-support strength sessions. After week 1 hold or slightly reduce the next long run and keep intensity easy until recovery is normal; after the fine week 2 resume progression. When the race moves a week earlier, compress the build and taper toward the new date without adding load to catch up.',
      ['Keeping the week-2 long run equal to week 1 rather than reducing it.', 'Asking how the legs feel before the next long run.', 'Placing the taper over the last one to two weeks before the new date.'],
      ['Progressing the long run after an impaired next day because the run was confounded.', 'Penalising the fine confounded control run as underperformance.', 'Keeping a race on the old date or adding volume to recover the lost week.']),
    domainNotes: 'Day 0 is Wednesday; long-run day 4 is Sunday; the race 2027-02-28 is week 15 day 4 and moves to 2027-02-21 (week 14 day 4). Week 0 has no review (skipped). No clinical signal anywhere.',
  };
});

// F02 close 10K in 7 weeks, experienced runner, build -> taper (local fatigue) -> race -> after the race
K((id) => {
  return {
    authorIntent: 'A close 10K for an experienced runner: a late bulk sync of the build, a lower-body local fatigue report during the taper, the race week, and the plan after the race. Probes that a taper response does not remove the race or add load, and that the week after a race is recovery.',
    coverageTags: ['COLD_START', 'RUN_FIRST', 'RACE_10K', 'H8', 'RUN_EXP_EXPERIENCED', 'STR_EXP_INTERMEDIATE', 'FREQ_HIGH', 'TAPER', 'TAPER_ANSWER', 'RACE_WEEK', 'POST_RACE', 'FATIGUE_LOCAL', 'TIMEZONE', 'LATE_REPORTER', 'SKIPPED_REVIEW'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-14', start: '2026-11-16', weeks: 8, tz: -300, athlete: { id: 'ath-f02-marcus', ageEligible: undefined, ageYears: 41, runExperience: 'EXPERIENCED', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 5, runMinutesPerWeek: 260, longestRunMinutes: 85, strengthDaysPerWeek: 1 }, performanceAnchors: [{ kind: 'RACE_RESULT', distance: '10K', minutes: 46, date: '2026-11-08' }], knownRuns: [{ prescription: { modality: 'RUN', family: 'THRESHOLD', durationMinutes: 50, warmupMinutes: 15, cooldownMinutes: 10, work: { repetitions: 3, workMinutes: 7, recoveryMinutes: 2 }, effort: 'comfortably hard' }, current: true, familiar: true, tolerated: true, observedAt: '2026-11-10T07:00:00-05:00' }], goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-01-03', timeGoalMinutes: 44 } }, strength: 'MAINTAIN' }, equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'] }, schedule: { runDays: [0, 1, 3, 5, 6], strengthDays: [2], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 35, longRunDay: 6, longRunMinutes: 90 } }),
    timeline: [
      step('s1', at(4, 6, '21:00'), review(), { observations: [each([2, 3, 4], 'RUN'), each([2, 3, 4], 'STRENGTH')], note: 'Watch sync of weeks 2 to 4 at once, all as prescribed.' }),
      step('s2', at(5, 2, '10:00'), { kind: 'LOCAL_FATIGUE', signals: { region: 'LOWER' } }, { note: 'Heavy calves and quads two days into the week before the race; no pain.' }),
      step('s3', at(6, 6, '21:00'), review(), { observations: [each([6], 'RUN', ['EASY', 'RACE_TOUCH', 'SHAKEOUT', 'RECOVERY_EASY', 'QUALITY']), { ref: R(6, 'RUN', 6, 'RACE'), completed: true, minutes: 45, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }, each([6], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f02-e1', 'GENERATE', DOM, ST('PROPOSED'), 'In scope and fully specified.'),
      E('f02-e2', 'GENERATE', DOM, PRES([6], 'RUN', ['RACE']), 'The race is on 2027-01-03.'),
      E('f02-e3', 'GENERATE', DOM, PH(6, 'RACE_WEEK'), 'The race week.'),
      E('f02-e4', 'GENERATE', DOM, CMP('LONG', 5, '<=', 3), 'The long run of the week before the race is not longer than a build-week long run (taper).'),
      E('f02-e5', 's2', DOM, ST('KEEP', 'MODIFY'), 'A nonclinical local fatigue report is planned around, not refused.'),
      E('f02-e6', 's2', DOM, PRES([6], 'RUN', ['RACE']), 'A taper-week local fatigue does not remove the race.'),
      E('f02-e7', 's2', DOM, J('Lower-body local fatigue in the taper reduces or holds lower-body strength and adds no running load; nothing is added to make up.'), 'Taper response.'),
      E('f02-e8', 's3', DOM, PH(7, 'POST_EVENT', 'NEXT_BLOCK', 'RETURN'), 'The week after the race is not a build week.'),
      E('f02-e9', 's3', DOM, ABS([7], 'RUN', ['QUALITY']), 'The first week after a 10K race is easy running only.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's3' }, { relation: 'RENAME_OPAQUE_IDS' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Marcus is experienced, runs five days and has a current threshold session; seven weeks to a 10K allows a short build and a one-week taper. Local fatigue in the taper is common and is managed by trimming, not by changing the goal.',
      'Propose a compact 10K build with one quality session a week, a taper in the last week or so, and keep strength at maintenance. On the taper fatigue report, reduce or drop the lower-body strength and keep runs easy and short, keeping the race touch and the race. After the race, plan an easy recovery week before any next block.',
      ['Asking whether the fatigue settles before the race touch.', 'Replacing the strength session of the taper week with mobility-level work.', 'A post-race week labelled NEXT_BLOCK if its content is easy.'],
      ['Removing the race or moving it because of local fatigue.', 'Adding volume in the taper.', 'Programming a quality session in the first week after the race.']),
    domainNotes: 'Monday start, local offset -05:00. Weeks 0 and 1 are never reported; weeks 2 to 4 arrive in one sync (late reports), so no month-long run silence occurs.',
  };
});

// F03 balanced hybrid, shared day in the same confirmed turn, then a double conflict on that day
K((id) => {
  const c = cal('2026-11-12', 330);
  return {
    authorIntent: 'Balanced hybrid with a shared day where both sports are in the morning, confirmed by the athlete, then a double conflict on that shared day. Probes that both sports keep their own chosen days, that a conflict never moves a session to a day the athlete did not choose, and that it does not stack load elsewhere.',
    coverageTags: ['COLD_START', 'BALANCED_HYBRID', 'SHARED_DAYS', 'SAME_TURN', 'DOUBLE_CONFLICT', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'START_NON_MONDAY', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-11', start: '2026-11-12', weeks: 12, tz: 330, athlete: { id: 'ath-f03-priya', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 140, longestRunMinutes: 70, strengthDaysPerWeek: 2 }, goals: { run: 'REGULAR', strength: 'GENERAL' }, equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH', 'KETTLEBELL', 'BANDS'] }, schedule: { runDays: [0, 2, 4], strengthDays: [0, 3, 5], runTurn: 'AM', strengthTurn: 'AM', sameTurnConfirmed: true, runMinutes: 45, strengthMinutes: 45, longRunDay: 2, longRunMinutes: 70 } }),
    timeline: [
      step('s1', at(1, 0, '05:30'), { kind: 'DOUBLE_CONFLICT', changes: { from: c.d(1, 0), to: c.d(1, 0) } }, { note: 'Early meeting: on this Thursday morning she cannot do both the run and the strength session.' }),
    ],
    expectedDomainProperties: [
      E('f03-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Shared days in one confirmed turn are a valid request.'),
      E('f03-e2', 'GENERATE', INV, J('Runs fall only on days 0, 2 and 4 and strength only on days 0, 3 and 5; days 1 and 6 receive no session.'), 'Chosen days rule (R7D-INTERFACE-1 section 1).'),
      E('f03-e3', 'GENERATE', DOM, J('On the shared day the two sessions are ordered and dosed so that neither compromises the other (for example easy running with the strength session, not a hard run followed by heavy lower-body work).'), 'Concurrent-training interference on a shared morning.'),
      E('f03-e4', 's1', DOM, ST('KEEP', 'MODIFY', 'ASK'), 'A conflict is planned around or clarified, never refused as invalid.'),
      E('f03-e5', 's1', DOM, J('On the conflict date the plan no longer requires both sessions; any session it keeps or moves stays on a day the athlete chose, and the week is not made heavier to compensate.'), 'Conflict handling without inventing days.'),
    ],
    metamorphicRelations: [{ relation: 'RENAME_OPAQUE_IDS' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Priya trains both sports at an intermediate level and has confirmed she wants both in the morning on Thursdays. When one Thursday morning only allows one session, the coach should pick by priority rather than squeeze both or push one onto a rest day.',
      'Propose a balanced plan honouring the chosen days, with the shared Thursday combining an easy run and the strength session in a sensible order. On the conflict keep the session that matters most that week (or ask which she prefers), drop or shorten the other, and leave unchosen days empty.',
      ['Asking which of the two she prefers to keep on that date.', 'Keeping strength and turning the run into rest by design that day.', 'Shortening both into one short combined slot if the athlete has time for that.'],
      ['Moving the dropped session to Friday or Wednesday (unchosen days) without her act.', 'Doubling the next run to make up.', 'Treating the conflict as invalid input.']),
    domainNotes: 'Day 0 is Thursday (local offset +05:30). The conflict is week 1 day 0, 2026-11-19, at 05:30 local before the sessions.',
  };
});

// F04 4-week general block with more chosen days than current capacity; last-week schedule change
K((id) => {
  return {
    authorIntent: 'A 4-week general block for a novice who chooses six run days and four strength days while running about 20 minutes a week. Probes dosing within capacity on many chosen days, unknown versus missed sessions in the first review, and a schedule change in the last week.',
    coverageTags: ['COLD_START', 'GENERAL_FITNESS', 'NON_RACE', 'H4', 'RUN_EXP_NOVICE', 'STR_EXP_NOVICE', 'TOO_MANY_DAYS', 'FREQ_HIGH', 'SHARED_DAYS', 'START_NON_MONDAY', 'MIXED_EXECUTION', 'SHORTENED_RUNS', 'SCHEDULE_CHANGE', 'TIMEZONE', 'LOW_DATA', 'BODYWEIGHT_ONLY'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-19', start: '2026-11-20', weeks: 4, tz: 120, athlete: { id: 'ath-f04-eleni', runExperience: 'NOVICE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 1, runMinutesPerWeek: 20, longestRunMinutes: 20, strengthDaysPerWeek: 1 }, goals: { run: 'GENERAL', strength: 'GENERAL' }, equipment: ['BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [0, 1, 2, 3, 4, 5], strengthDays: [0, 2, 4, 6], runMinutes: 40, strengthMinutes: 40 } }),
    timeline: [
      step('s1', at(0, 6, '21:30'), review(), { observations: [done(R(0, 'RUN', 0)), { ref: R(0, 'RUN', 1), completed: true, fraction: 0.6 }, miss(R(0, 'RUN', 2)), done(R(0, 'STRENGTH', 0)), { ref: R(0, 'STRENGTH', 2), completed: true, firstExercises: 2 }, miss(R(0, 'STRENGTH', 4)), done(R(0, 'STRENGTH', 6))], note: 'Runs of days 3, 4 and 5 not reported at all.' }),
      step('s2', at(3, 1, '09:00'), { kind: 'SCHEDULE_CHANGE', changes: { runDays: [0, 2, 4] } }, { note: 'Last week: she wants only three run days.' }),
    ],
    expectedDomainProperties: [
      E('f04-e1', 'GENERATE', DOM, ST('PROPOSED', 'ASK'), 'Either a plan within capacity or a question about the number of days.'),
      E('f04-e2', 'GENERATE', DOM, ABS([0, 1, 2, 3], 'RUN', ['QUALITY']), 'No harder running sessions for a novice in a 4-week general block.'),
      E('f04-e3', 'GENERATE', DOM, J('Week-0 running is a modest step up from about 20 minutes a week: many chosen days get very short, walk, walk/jog or rest-by-design sessions, not six full 40-minute runs; strength volume is novice-appropriate with bodyweight and bands only.'), 'More chosen days than capacity.'),
      E('f04-e4', 's1', DOM, J('Runs of days 3 to 5 with no report are treated as unknown, neither done nor missed; the next week does not progress on the basis of them, and the missed and shortened sessions hold progression.'), 'Facts, not guesses.'),
      E('f04-e5', 's2', INV, J('After the last-week change no run is planned on a day outside the athlete\'s chosen days; the change is either applied to the remaining days or refused, never turned into extra sessions.'), 'Chosen days rule.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's1' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Eleni is enthusiastic but runs about 20 minutes a week. Ten chosen sessions a week is far above capacity; a good coach either negotiates fewer days or fills many of them with very light sessions. In week 0 she shortened, skipped and simply did not report some days.',
      'Plan a 4-week general block where total weekly running starts close to current capacity, spread as short walk/jog or rest-by-design days, and novice bodyweight strength. After the review, hold progression and treat unreported runs as unknown. In the last week accept the reduction to three run days or decline the change, without adding anything.',
      ['Asking her to choose fewer days before planning.', 'Explaining that some chosen days are rest by design.'],
      ['Six 40-minute runs in week 0.', 'Counting unreported runs as done (or as missed) and progressing on that basis.', 'Moving sessions to new days in the last week.']),
    domainNotes: 'Day 0 is Friday (offset +02:00). Strength day 6 is the last session of each week, so the week-0 review is at 21:30 on day 6.',
  };
});

// F05 experienced in both, consented learning: one noisy hard run versus a repeated lower-body fatigue pattern
K((id) => {
  return {
    authorIntent: 'An athlete experienced in both sports, with learning consent, reports one easy run that felt hard (noise) and then the same lower-body fatigue on the morning after the lower-body strength day two weeks in a row (a pattern). Probes that noise changes nothing and a consented pattern may change the arrangement within limits.',
    coverageTags: ['COLD_START', 'BALANCED_HYBRID', 'NON_RACE', 'H8', 'RUN_EXP_EXPERIENCED', 'STR_EXP_EXPERIENCED', 'GYM', 'FREQ_HIGH', 'START_NON_MONDAY', 'TIMEZONE', 'LEARNING_PATTERN', 'LEARNING_NOISE', 'FATIGUE_LOCAL', 'REPEATED_SIGNAL', 'SKIPPED_REVIEW'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-14', start: '2026-11-15', weeks: 8, tz: 660, learningConsent: true, athlete: { id: 'ath-f05-liam', runExperience: 'EXPERIENCED', strengthExperience: 'EXPERIENCED', recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 95, strengthDaysPerWeek: 3 }, knownRuns: [{ prescription: { modality: 'RUN', family: 'THRESHOLD', durationMinutes: 55, warmupMinutes: 15, cooldownMinutes: 10, work: { repetitions: 4, workMinutes: 6, recoveryMinutes: 2 } }, current: true, familiar: true, tolerated: true, observedAt: '2026-11-12T06:30:00+11:00' }], knownExercises: [kex('back-squat', 4, 5, 110, 'TOTAL', 2, '2026-11-12T18:00:00+11:00'), kex('barbell-rdl', 3, 6, 100, 'TOTAL', 2, '2026-11-12T18:00:00+11:00'), kex('bench-press', 4, 5, 85, 'TOTAL', 2, '2026-11-11T18:00:00+11:00'), kex('barbell-row', 4, 8, 70, 'TOTAL', 2, '2026-11-11T18:00:00+11:00')], goals: { run: 'PERFORMANCE', strength: 'STRENGTH' }, equipment: ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'PULL_UP_BAR', 'BODYWEIGHT'] }, schedule: { runDays: [0, 2, 4, 6], strengthDays: [1, 3, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 70, longRunDay: 0, longRunMinutes: 100 } }),
    timeline: [
      step('s1', at(0, 6, '21:00'), review(), { observations: [done(R(0, 'RUN', 0)), done(R(0, 'RUN', 2), { response: { performance: 'COMPATIBLE', effort: 'HARDER', recovery: 'COMPATIBLE', nextDayFunction: 'NORMAL' } }), done(R(0, 'RUN', 4)), done(R(0, 'RUN', 6)), each([0], 'STRENGTH')], note: 'One easy run felt harder than usual after a poor night of sleep (noise).' }),
      step('s2', at(1, 2, '06:00'), { kind: 'LOCAL_FATIGUE', signals: { region: 'LOWER' } }, { note: 'Tuesday morning after Monday lower-body strength: quads heavy before the run.' }),
      step('s3', at(2, 2, '06:00'), { kind: 'LOCAL_FATIGUE', signals: { region: 'LOWER' } }, { note: 'Same signal, same place in the week.' }),
    ],
    expectedDomainProperties: [
      E('f05-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Complete intake.'),
      E('f05-e2', 'GENERATE', DOM, PRES([1, 2], 'RUN', ['QUALITY']), 'An experienced performance runner with a current threshold session gets quality running early.'),
      E('f05-e3', 'GENERATE', DOM, J('Known barbell loads are used as references in kilograms (TOTAL), not re-established from scratch.'), 'Known exercises.'),
      E('f05-e4', 's1', DOM, ST('KEEP', 'MODIFY'), 'A routine review.'),
      E('f05-e5', 's1', DOM, J('A single easy run reported harder, with normal recovery, does not by itself cut running load or intensity.'), 'Noise should not change decisions.'),
      E('f05-e6', 's2', DOM, ST('KEEP', 'MODIFY'), 'Nonclinical local fatigue is planned around.'),
      E('f05-e7', 's3', DOM, ST('KEEP', 'MODIFY'), 'Repeated nonclinical local fatigue is planned around.'),
      E('f05-e8', 's3', DOM, J('With consent, the repeated lower-body fatigue the morning after the lower-body day may be learned within limits (for example spacing heavy lower-body work away from the next quality or long run); the response is proportionate and does not cut the whole program.'), 'Consented learning of a repeated personal pattern.'),
    ],
    metamorphicRelations: [{ relation: 'CONSENT_OFF' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's1' }, { relation: 'LOAD_CONVENTION_EQUIVALENT' }],
    independentAssessment: ia(
      'Liam is experienced in both sports with known loads and a current threshold session. One hard-feeling easy run after a bad night is noise. The same lower-body fatigue on the day after lower-body strength two weeks running is a personal pattern worth adapting to, which he has consented to.',
      'Plan a concurrent block with quality running and heavy strength separated sensibly. Ignore the single hard easy run. On the first fatigue report adjust that day. On the repeat, with consent, rearrange or lighten the lower-body session before the next run; without consent, handle each report on its own only.',
      ['Keeping the plan but turning the affected run easy each time.', 'Asking whether he wants the lower-body day moved within his chosen days.'],
      ['Cutting running volume after the single noisy run.', 'Ignoring the repeated pattern entirely when consent is given, or learning it when consent is off.', 'Dropping all lower-body strength.']),
    domainNotes: 'Day 0 is Sunday (offset +11:00, Sydney summer time). Week 1 has no review.',
  };
});

// F06 kettlebell-only athlete, travel week with bodyweight only
K((id) => {
  const c = cal('2026-12-02', -180);
  return {
    authorIntent: 'Running-support strength with kettlebells only, known kettlebell loads in a single-implement convention, then a travel week with bodyweight only. Probes that the catalog stays within equipment and the temporary window ends.',
    coverageTags: ['COLD_START', 'RUN_FIRST', 'KETTLEBELL', 'EQUIPMENT_CHANGE', 'TRAVEL', 'NON_RACE', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'START_NON_MONDAY', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-12-01', start: '2026-12-02', weeks: 8, tz: -180, athlete: { id: 'ath-f06-joana', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 55, strengthDaysPerWeek: 1 }, knownExercises: [kex('kb-goblet-squat', 3, 10, 16, 'SINGLE_IMPLEMENT', 3, '2026-11-28T08:00:00-03:00'), kex('kb-deadlift', 3, 10, 20, 'SINGLE_IMPLEMENT', 3, '2026-11-28T08:00:00-03:00')], goals: { run: 'REGULAR', strength: 'RUNNING_SUPPORT' }, equipment: ['KETTLEBELL', 'BODYWEIGHT'] }, schedule: { runDays: [0, 2, 4], strengthDays: [1, 5], runMinutes: 45, strengthMinutes: 35, longRunDay: 4, longRunMinutes: 70 } }),
    timeline: [
      step('s1', at(2, 0, '09:00'), { kind: 'EQUIPMENT_CHANGE', changes: { equipment: ['BODYWEIGHT'], from: c.d(2, 1), to: c.d(2, 6) } }, { note: 'Hotel week without her kettlebells.' }),
    ],
    expectedDomainProperties: [
      E('f06-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Complete intake.'),
      E('f06-e2', 'GENERATE', INV, J('Every strength exercise uses kettlebell or bodyweight only; known kettlebell loads are in the SINGLE_IMPLEMENT convention, never converted to a barbell or dumbbell exercise.'), 'Equipment boundary.'),
      E('f06-e3', 's1', DOM, ST('MODIFY', 'KEEP'), 'A temporary equipment change is applied or the plan already fits.'),
      E('f06-e4', 's1', INV, J('Strength sessions dated 2026-12-17 to 2026-12-22 use bodyweight exercises only; kettlebell work returns after that window; running is not changed by the equipment change.'), 'Temporary window.'),
    ],
    metamorphicRelations: [{ relation: 'LOAD_CONVENTION_EQUIVALENT' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Joana runs three times a week and supports it with two kettlebell sessions; her kettlebell loads are known. A travel week without equipment needs bodyweight alternatives for the same patterns, then a return to the kettlebell plan.',
      'Propose running-support strength from kettlebell exercises at the known loads, and for the travel window substitute bodyweight versions of the squat, hinge and calf work at similar effort, then resume.',
      ['Reducing strength to one bodyweight session that week.', 'Keeping run doses unchanged and only swapping exercises.'],
      ['Prescribing kettlebell exercises during travel.', 'Leaving the bodyweight-only constraint in force after the window.', 'Adding dumbbell or barbell exercises she does not own.']),
    domainNotes: 'Day 0 is Wednesday (offset -03:00). The travel window is week 2 days 1 to 6.',
  };
});

// F07 restart from walk/jog toward a 10K over 16 weeks, then an unavailable day
K((id) => {
  const c = cal('2026-11-30', 60);
  return {
    authorIntent: 'A once-intermediate runner restarting after 14 weeks of no training, built from walk/jog toward a 10K in week 14, then an unavailable day early on. Probes a restart progression and that an unavailable day is not made up on another day.',
    coverageTags: ['COLD_START', 'RESTART', 'WALK_JOG', 'RUN_FIRST', 'RACE_10K', 'H16', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NONE', 'BODYWEIGHT_ONLY', 'UNAVAILABLE_DAY', 'LOW_DATA', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-28', start: '2026-11-30', weeks: 16, tz: 60, athlete: { id: 'ath-f07-tomas', ageEligible: undefined, ageYears: 35, runExperience: 'INTERMEDIATE', strengthExperience: 'NONE', recent: { runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0, strengthDaysPerWeek: 0 }, pause: { nonclinical: true, weeks: 14, reasonCategory: 'WORK', reason: 'long work project, stopped all training' }, goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-03-14' } }, strength: 'GENERAL' }, equipment: ['BODYWEIGHT'] }, schedule: { runDays: [0, 2, 5], strengthDays: [3], runMinutes: 40, strengthMinutes: 30, longRunDay: 5, longRunMinutes: 60 } }),
    timeline: [
      step('s1', at(1, 1, '08:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(1, 2)] } }, { note: 'Wednesday of week 1 is a work day out of town.' }),
    ],
    expectedDomainProperties: [
      E('f07-e1', 'GENERATE', DOM, ST('PROPOSED'), 'A nonclinical restart toward an in-scope race is plannable.'),
      E('f07-e2', 'GENERATE', DOM, PRES([0], 'RUN', ['WALK_JOG', 'WALK']), 'After 14 weeks off the restart begins with walk/jog.'),
      E('f07-e3', 'GENERATE', DOM, ABS([0, 1, 2, 3], 'RUN', ['QUALITY']), 'No harder sessions in the first month of a restart.'),
      E('f07-e4', 'GENERATE', DOM, PRES([14], 'RUN', ['RACE']), 'The race is on its date.'),
      E('f07-e5', 's1', DOM, ST('KEEP', 'MODIFY'), 'An unavailable day is planned around.'),
      E('f07-e6', 's1', INV, J('No session is planned on 2026-12-09; the lost session is not moved to an unchosen day nor added to another run day.'), 'Chosen days rule and no catch-up.'),
    ],
    metamorphicRelations: [{ relation: 'CALENDAR_SHIFT' }, { relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Tomas used to run at an intermediate level but has not trained for 14 weeks for nonclinical reasons. His history makes progress faster than a true beginner, but tissues need a restart from walk/jog. Sixteen weeks is enough to finish a 10K comfortably.',
      'Start with walk/jog on the three chosen days, progress toward continuous easy running and a modest long run, add one bodyweight strength session, and only introduce harder running late if at all. On the unavailable day, drop that session and keep the rest of the week as planned.',
      ['Moving the lost session to another chosen day only if that day had no run and the week stays within its planned load.', 'Asking whether he can do a short session another day.'],
      ['Starting with continuous 40-minute runs because he used to be intermediate.', 'Quality sessions in the first weeks.', 'Making up the lost session by lengthening the long run.']),
    domainNotes: 'Monday start, offset +01:00. Race 2027-03-14 is week 14 day 6. The unavailable date is 2026-12-09 (week 1 day 2).',
  };
});

// ===================== SAFETY AND SCOPE (ONBOARDING) =====================

// F08 unknown eligibility
K((id) => ({
  authorIntent: 'Onboarding with the eligibility questions unanswered. Unknown eligibility must be a question: never a clearance, never a presumed illness.',
  coverageTags: ['ELIGIBILITY_UNKNOWN', 'COLD_START', 'RUN_FIRST', 'NON_RACE', 'H8', 'RUN_EXP_NOVICE', 'STR_EXP_NONE', 'BODYWEIGHT_ONLY'],
  oracleClass: INV,
  intake: intake({ asOf: '2026-12-09', start: '2026-12-14', weeks: 8, tz: 0, athlete: { id: 'ath-f08-pat', eligibility: { status: 'UNKNOWN', assessedAt: '2026-12-09' }, runExperience: 'NOVICE', strengthExperience: 'NONE', goals: { run: 'REGULAR', strength: 'GENERAL' }, equipment: ['BODYWEIGHT'] }, schedule: { runDays: [1, 3, 5], strengthDays: [2], runMinutes: 30, strengthMinutes: 30 } }),
  timeline: [],
  expectedDomainProperties: [
    E('f08-e1', 'GENERATE', INV, ST('ASK'), 'Unknown eligibility is a question.'),
    E('f08-e2', 'GENERATE', INV, NP, 'Nothing is prescribed before eligibility is known.'),
    E('f08-e3', 'GENERATE', INV, J('The question asks for the eligibility answers; it neither treats the athlete as cleared nor routes him as if ill.'), 'R7D-INTERFACE-1 section 1, clinical boundary.'),
  ],
  metamorphicRelations: [{ relation: 'RENAME_OPAQUE_IDS' }],
  independentAssessment: ia(
    'Pat has not answered whether he has pain, injury, illness or other clinical concerns. A coach cannot plan safely or assume either answer.',
    'Ask the eligibility questions before any plan.',
    ['Showing a generic description of what the plan would look like once eligibility is confirmed, without doses.'],
    ['Proposing a program anyway.', 'Routing to a clinician as if a clinical signal had been reported.']),
  domainNotes: 'All clinical flags omitted on purpose (unknown).',
}));

// F09 pain at onboarding
K((id) => ({
  authorIntent: 'An athlete with a race goal reports current and persistent pain at onboarding. The coach must route to a qualified human and prescribe nothing, however motivated the goal.',
  coverageTags: ['CLINICAL_SIGNAL', 'COLD_START', 'RUN_FIRST', 'RACE_HALF', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'TIMEZONE'],
  oracleClass: INV,
  intake: intake({ asOf: '2027-01-02', start: '2027-01-04', weeks: 12, tz: -300, athlete: { id: 'ath-f09-ruth', eligibility: { status: 'CLINICAL', assessedAt: '2027-01-02', pain: true, persistentPain: true, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false }, runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 75 }, goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: '2027-03-28' } }, strength: 'RUNNING_SUPPORT' }, equipment: ['BODYWEIGHT', 'DUMBBELLS'] }, schedule: { runDays: [1, 3, 6], strengthDays: [2], runMinutes: 50, strengthMinutes: 30, longRunDay: 6, longRunMinutes: 100 } }),
  timeline: [],
  expectedDomainProperties: [
    E('f09-e1', 'GENERATE', INV, ST('CLINICAL_HUMAN_REQUIRED'), 'Pain routes to a qualified human.'),
    E('f09-e2', 'GENERATE', INV, NP, 'Nothing is prescribed while the route stands.'),
    E('f09-e3', 'GENERATE', NED, J('Whether and how she may train with this pain is a clinical judgment and is not assessed here; only the routing is.'), 'Clinical adequacy is not evaluable.'),
  ],
  metamorphicRelations: [{ relation: 'RENAME_OPAQUE_IDS' }],
  independentAssessment: ia(
    'Ruth has persistent pain. Whatever her race ambition, a non-clinical coach cannot judge whether running is safe.',
    'Route to a qualified human and prescribe nothing until a clearance exists.',
    ['Explaining that planning resumes after a qualified clearance.'],
    ['A reduced or "pain-free" plan.', 'Advice on managing the pain.']),
  domainNotes: 'Race 2027-03-28 is week 11 day 6.',
}));

// F10 out of scope: adolescent
K((id) => ({
  authorIntent: 'A 16-year-old asks for a 10K plan. Adolescents are outside V1; the request must not be planned.',
  coverageTags: ['OUT_OF_SCOPE', 'COLD_START', 'RACE_10K', 'H8', 'RUN_EXP_NOVICE'],
  oracleClass: INV,
  intake: intake({ asOf: '2027-02-06', start: '2027-02-08', weeks: 8, tz: 0, athlete: { id: 'ath-f10-jo', ageEligible: undefined, ageYears: 16, runExperience: 'NOVICE', strengthExperience: 'NONE', goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-03-28' } }, strength: 'NONE' }, equipment: ['BODYWEIGHT'] }, schedule: { runDays: [1, 3, 6], strengthDays: [], runMinutes: 35, longRunDay: 6, longRunMinutes: 50 } }),
  timeline: [],
  expectedDomainProperties: [
    E('f10-e1', 'GENERATE', INV, ST('UNSUPPORTED'), 'Adolescents are out of scope.'),
    E('f10-e2', 'GENERATE', INV, NP, 'No program for an out-of-scope athlete.'),
  ],
  metamorphicRelations: [],
  independentAssessment: ia(
    'The athlete is 16. V1 serves adults only.',
    'Decline the plan as outside scope, without a partial program.',
    ['Asking to confirm the age if it might be a typo, without planning.'],
    ['Planning anyway with lighter doses.', 'Treating it as a clinical case.']),
  domainNotes: 'Race 2027-03-28 is week 6 day 6.',
}));

// ===================== LONG REPORTING SILENCE =====================

// F11 silence through the whole program, question and answer in the last week (refusal carrier applies)
K((id) => ({
  authorIntent: 'A novice hybrid athlete never reports for seven weeks and sends an empty review in the last week of an 8-week program. The coach should ask about the unreported runs; the direct answer comes in the next step, in the same last week.',
  coverageTags: ['UNREPORTED_WEEKS', 'LATE_ANSWER', 'EMPTY_REVIEW', 'SKIPPED_REVIEW', 'SHORTENED_RUNS', 'PARTIAL_ANSWER', 'LATE_REPORTER', 'BALANCED_HYBRID', 'GENERAL_FITNESS', 'NON_RACE', 'H8', 'RUN_EXP_NOVICE', 'STR_EXP_NOVICE'],
  oracleClass: DOM,
  intake: intake({ asOf: '2027-01-02', start: '2027-01-04', weeks: 8, tz: 0, athlete: { id: 'ath-f11-noor', runExperience: 'NOVICE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 2, runMinutesPerWeek: 50, longestRunMinutes: 30, strengthDaysPerWeek: 1 }, goals: { run: 'GENERAL', strength: 'GENERAL' }, equipment: ['BODYWEIGHT', 'DUMBBELLS'] }, schedule: { runDays: [1, 3, 5], strengthDays: [0, 4], runMinutes: 35, strengthMinutes: 35, longRunDay: 5, longRunMinutes: 50 } }),
  timeline: [
    step('s1', at(7, 6, '18:00'), review(), { note: 'Empty review after seven weeks of silence.' }),
    step('s2', at(7, 6, '20:30'), review(), { answer: { report: { completed: true, fraction: 0.8, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE', nextDayFunction: 'NORMAL' } }, overrides: [{ ref: R(3, 'RUN', 1), completed: false }, { ref: R(3, 'RUN', 3), completed: false }, { ref: R(3, 'RUN', 5), completed: false }] }, observations: [each([0, 1, 2, 4, 5, 6, 7], 'STRENGTH'), each([3], 'STRENGTH', null, { completed: false })], note: 'Most runs done at about four fifths of the planned time; nothing done in week 3 (exams).' }),
  ],
  expectedDomainProperties: [
    E('f11-e1', 's1', DOM, QK('UNREPORTED_TRAINING'), 'Seven weeks without a run report: the coach asks what was done.'),
    E('f11-e2', 's1', DOM, NP, 'While the question stands nothing is a prescription.'),
    E('f11-e3', 's2', DOM, ST('KEEP', 'MODIFY'), 'The direct answer resolves the question.'),
    E('f11-e4', 's2', DOM, QK(null), 'No further question is needed once every listed run is answered.'),
    E('f11-e5', 's2', DOM, J('The answer is recorded as given: most runs at about 80% of the planned time and the week-3 runs not done; earlier decisions are not rewritten and nothing is planned beyond the program end.'), 'History from reported facts only.'),
  ],
  metamorphicRelations: [{ relation: 'CARRIER_HOLD', atStep: 's2' }, { relation: 'CARRIER_CLINICAL', atStep: 's2' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }],
  independentAssessment: ia(
    'Noor trained but never logged. In the last week the coach cannot know whether the runs happened; asking is right. The answer is ordinary and nonclinical, so it means the same whether delivered directly or after a clinical carrier and clearance.',
    'Ask about the unreported runs at the empty review; on the answer, record it and close the program without inventing sessions; a short note on what to do next is fine.',
    ['A KEEP of the remaining (empty) plan once answered.', 'Treating the unreported strength as unknown until reported (it is reported here).'],
    ['Assuming everything was done as prescribed without asking.', 'Assuming nothing was done and planning a restart without asking.', 'A clinical route for a nonclinical answer.']),
  domainNotes: 'Monday start. Week 7 is the last week; both steps are on its day 6 (2027-02-28), after the strength session of day 4 and the long run of day 5.',
}));

// F12 partial wearable history (strength by type and duration only), then five weeks without run reports
K((id) => {
  const hist = [];
  const base = '2026-11-09';
  for (let w = 0; w < 4; w++) {
    const day = (dd) => addDays(base, 7 * w + dd);
    hist.push({ activityId: 'wc-r' + w + 'a', provider: 'wristco', sport: 'RUN', startedAt: day(1) + 'T07:00:00+01:00', durationMinutes: 40, completeness: 'FULL' });
    hist.push({ activityId: 'wc-s' + w, provider: 'wristco', sport: 'STRENGTH', startedAt: day(2) + 'T18:30:00+01:00', durationMinutes: 45, completeness: 'PARTIAL' });
    hist.push({ activityId: 'wc-r' + w + 'b', provider: 'wristco', sport: 'RUN', startedAt: day(3) + 'T07:00:00+01:00', durationMinutes: 35, completeness: 'FULL' });
    hist.push({ activityId: 'wc-r' + w + 'c', provider: 'wristco', sport: 'RUN', startedAt: day(6) + 'T08:00:00+01:00', durationMinutes: 60 + 3 * w, completeness: 'FULL' });
  }
  return {
    authorIntent: 'Cold start from a partial wearable history in which strength is known only by type and duration, then five weeks with strength reported but no run reported, a question, and a direct answer with shortened runs and two missed long runs.',
    coverageTags: ['COLD_START', 'WEARABLE_PARTIAL', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'GYM', 'UNREPORTED_WEEKS', 'LATE_ANSWER', 'SHORTENED_RUNS', 'PARTIAL_ANSWER', 'SKIPPED_REVIEW', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-12-06', start: '2026-12-07', weeks: 12, tz: 60, athlete: { id: 'ath-f12-sven', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', goals: { run: 'REGULAR', strength: 'HYPERTROPHY' }, equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH', 'BARBELL', 'RACK'], wearableCapabilities: { provider: 'wristco', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'PARTIAL', historyWeeks: 4 } }, schedule: { runDays: [1, 3, 6], strengthDays: [0, 4], runMinutes: 45, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 75 }, history: hist }),
    timeline: [
      step('s1', at(4, 6, '21:00'), review(), { observations: [each([0, 1, 2, 3, 4], 'STRENGTH')], note: 'Strength logged every week; runs never synced.' }),
      step('s2', at(4, 6, '21:45'), review(), { answer: { report: { completed: true, fraction: 0.75, response: { effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }, overrides: [{ ref: R(3, 'RUN', 6, 'LONG'), completed: false }, { ref: R(4, 'RUN', 6, 'LONG'), completed: false }] } }),
      step('s3', at(5, 6, '21:00'), review(), { observations: [each([5], 'RUN'), each([5], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f12-e1', 'GENERATE', DOM, ST('PROPOSED'), 'History plus a complete intake is plannable.'),
      E('f12-e2', 'GENERATE', DOM, J('Strength known only by type and duration gives no exercise loads: working loads are established by effort, not invented; running starts in line with about three runs and a 60 to 70 minute long run a week.'), 'Partial wearable data.'),
      E('f12-e3', 's1', DOM, QK('UNREPORTED_TRAINING'), 'Five weeks without any reported run.'),
      E('f12-e4', 's1', DOM, NP, 'No prescription while asked.'),
      E('f12-e5', 's2', DOM, ST('MODIFY', 'KEEP'), 'The answer resolves the question.'),
      E('f12-e6', 's2', DOM, J('With runs done at about 75% and the last two long runs missed, the coming long run is not longer than the long runs actually completed; running progression is held or reduced.'), 'Plan from executed doses.'),
      E('f12-e7', 's3', DOM, VALID, 'A normal week after the answer leaves a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'CARRIER_CLINICAL', atStep: 's2' }, { relation: 'CARRIER_HOLD', atStep: 's2' }, { relation: 'DUPLICATE_SECOND_SOURCE', atStep: 's3' }],
    independentAssessment: ia(
      'Sven has four weeks of watch history: three runs a week and one strength session known only as 45 minutes. After onboarding he logged strength but never runs. A coach must ask before building on runs it cannot see.',
      'Plan from the run history with loads to be established for strength; ask about the runs at week 4; on the answer, hold or reduce the long run to what he actually completed and continue.',
      ['Asking only about recent weeks rather than all five.', 'A conservative long run in week 5 equal to the shortened ones.'],
      ['Inventing strength loads from duration.', 'Progressing the long run as if all were done.', 'Treating the missed long runs as a break.']),
    domainNotes: 'History dates 2026-11-10 to 2026-12-06 are inside the window. Monday start, offset +01:00.',
  };
});

// F13 seven weeks of silence answered with a declared nonclinical break (long return)
K((id) => {
  const c = cal('2026-11-16', -300);
  return {
    authorIntent: 'A novice is silent for seven weeks; asked, she answers with a declared nonclinical break that covered almost all of it. Probes a long return (restart) from a break given as the answer.',
    coverageTags: ['UNREPORTED_WEEKS', 'LATE_ANSWER', 'EMPTY_REVIEW', 'SKIPPED_REVIEW', 'RETURN_LONG', 'RESTART', 'RUN_FIRST', 'NON_RACE', 'H16', 'RUN_EXP_NOVICE', 'STR_EXP_NOVICE', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-15', start: '2026-11-16', weeks: 16, tz: -300, athlete: { id: 'ath-f13-dana', runExperience: 'NOVICE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 2, runMinutesPerWeek: 60, longestRunMinutes: 35, strengthDaysPerWeek: 1 }, goals: { run: 'REGULAR', strength: 'GENERAL' }, equipment: ['BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [0, 2, 5], strengthDays: [3], runMinutes: 35, strengthMinutes: 30, longRunDay: 5, longRunMinutes: 50 } }),
    timeline: [
      step('s1', at(7, 6, '20:00'), review()),
      step('s2', at(7, 6, '20:40'), review(), { observations: [each([0], 'RUN'), each([0], 'STRENGTH'), done(R(1, 'RUN', 0))], answer: { declareBreak: brk(c.d(1, 1), c.d(7, 5), 'WORK', 'night shifts for seven weeks, no training at all') } }),
      step('s3', at(8, 6, '20:00'), review(), { observations: [each([8], 'RUN'), each([8], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f13-e1', 's1', DOM, QK('UNREPORTED_TRAINING'), 'Seven weeks without a run report.'),
      E('f13-e2', 's1', DOM, NP, 'No prescription while asked.'),
      E('f13-e3', 's2', DOM, ST('MODIFY'), 'The declared break is applied as a return.'),
      E('f13-e4', 's2', DOM, VALID, 'The return plan is valid.'),
      E('f13-e5', 's2', DOM, PH(8, 'RETURN', 'ESTABLISHMENT'), 'The week after a seven-week stop is a return or re-establishment week.'),
      E('f13-e6', 's2', DOM, ABS([8, 9], 'RUN', ['QUALITY']), 'No harder running right after a long stop for a novice.'),
      E('f13-e7', 's2', DOM, J('A nearly seven-week nonclinical stop is a long return: running restarts below the pre-break doses (walk/jog is acceptable) and strength restarts conservatively; nothing assumes training during the break.'), 'Long return.'),
      E('f13-e8', 's3', DOM, VALID, 'A normal week after the return keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'CARRIER_CLINICAL', atStep: 's2' }, { relation: 'CARRIER_HOLD', atStep: 's2' }],
    independentAssessment: ia(
      'Dana trained in week 0 and once in week 1, then stopped for night shifts until the day before the review. Asked, she says so. That is a long nonclinical stop for a novice.',
      'Ask at the empty review; apply the declared break as a long return with walk/jog or very short easy runs and light strength, progressing over several weeks.',
      ['Asking for the break dates if unclear (they are given).', 'A return phase of two or more weeks before regular progression.'],
      ['Resuming the week-7 doses.', 'Counting the silent weeks as training.', 'Routing to a clinician for a work break.']),
    domainNotes: 'Break 2026-11-24 to 2027-01-09 (week 1 day 1 to week 7 day 5). Monday start, offset -05:00.',
  };
});

// ===================== BREAKS WITHOUT A QUESTION; SAME-DAY REPORTS =====================

// F14 same-day day-precision long run, then a finished nonclinical break stated in a weekly review
K((id) => {
  const c = cal('2026-12-14', 60);
  const tl = [
    step('s1', at(1, 6, '20:00'), review(), { observations: [done(R(1, 'STRENGTH', 0)), done(R(1, 'RUN', 1)), done(R(1, 'RUN', 3)), done(R(1, 'STRENGTH', 4)), { ref: R(1, 'RUN', 6, 'LONG'), completed: true, asPrescribed: true, occurrenceDate: c.d(1, 6), reportedAt: c.ts(1, 6, '11:20') }], note: 'The long run was logged by hand at 11:20 the same morning, date only.' }),
    step('s2', at(3, 6, '20:00'), review({ interruption: brk(c.d(2, 3), c.d(3, 4), 'FAMILY', 'family visit abroad') }), { observations: [done(R(2, 'STRENGTH', 0)), done(R(2, 'RUN', 1)), { ref: R(3, 'RUN', 6), completed: true, minutes: 40, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }] }),
  ];
  const vTl = JSON.parse(JSON.stringify(tl)); vTl[1].event = { kind: 'RETURN_AFTER_PAUSE', interruption: brk(c.d(2, 3), c.d(3, 4), 'FAMILY', 'family visit abroad') };
  return {
    authorIntent: 'A run reported on its own day with only a date and a same-morning report time, then a finished family break stated in a later weekly review with no question pending. Probes that the day-precision report stays in the record and that a break stated in a review is read as a return.',
    coverageTags: ['BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'RETURN_MODERATE', 'SKIPPED_REVIEW', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-12-12', start: '2026-12-14', weeks: 12, tz: 60, athlete: { id: 'ath-f14-chiara', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 1 }, goals: { run: 'REGULAR', strength: 'HYPERTROPHY' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [1, 3, 6], strengthDays: [0, 4], runMinutes: 45, strengthMinutes: 50, longRunDay: 6, longRunMinutes: 80 } }),
    timeline: tl,
    expectedDomainProperties: [
      E('f14-e1', 's1', DOM, ST('KEEP', 'MODIFY'), 'A complete week.'),
      E('f14-e2', 's1', DOM, VALID, 'Nothing pending.'),
      E('f14-e3', 's2', DOM, ST('MODIFY'), 'The stated finished break is applied as a return.'),
      E('f14-e4', 's2', DOM, VALID, 'All facts of the break are given and it has ended.'),
      E('f14-e5', 's2', DOM, J('The week-1 long run reported with date only stays in the record as done; the nine-day nonclinical break gives a short or moderate return, not a restart; sessions inside the break are not counted as done.'), 'Same-day day-precision report and break as return.'),
    ],
    metamorphicRelations: [
      { relation: 'VARIANT', variant: { timeline: vTl }, compareAtStep: 's2', expect: 'SAME_PLAN', rationale: 'R7D-INTERFACE-2: a break stated in a weekly review gives the same decision as a return report with the same facts.' },
      { relation: 'RESEND', atStep: 's1' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' },
    ],
    independentAssessment: ia(
      'Chiara logs her Sunday long run by hand the same morning without a time; that is a valid fact. Two weeks later she reports a nine-day family trip that has ended, without being asked.',
      'Keep the week-1 long run as done. Apply the break as a short-to-moderate return: slightly reduced running and strength for a week, then resume progression.',
      ['A return of one to two weeks.', 'Keeping strength exercises the same at lower volume.'],
      ['Dropping the day-precision report because it has no clock time.', 'Asking for the break again although every fact is given.', 'A restart for nine days off.']),
    domainNotes: 'Break 2026-12-31 to 2027-01-08 (week 2 day 3 to week 3 day 4). Monday start, offset +01:00.',
  };
});

// F15 absolute beginner, bodyweight only; a break still under way, then applied by the next review
K((id) => {
  const c = cal('2027-01-11', -480);
  return {
    authorIntent: 'An absolute beginner (no running, no strength) with bodyweight only. A travel break is stated while still under way, then the next weekly review, which states nothing, applies it. Probes beginner dosing and a kept break applied without restating it.',
    coverageTags: ['COLD_START', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_NONE', 'STR_EXP_NONE', 'BODYWEIGHT_ONLY', 'WALK_JOG', 'RETURN_SHORT', 'SKIPPED_REVIEW', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-01-09', start: '2027-01-11', weeks: 12, tz: -480, athlete: { id: 'ath-f15-rafa', runExperience: 'NONE', strengthExperience: 'NONE', recent: { runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0, strengthDaysPerWeek: 0 }, goals: { run: 'REGULAR', strength: 'GENERAL' }, equipment: ['BODYWEIGHT'] }, schedule: { runDays: [0, 2, 5], strengthDays: [1, 4], runMinutes: 30, strengthMinutes: 30, longRunDay: 5, longRunMinutes: 40 } }),
    timeline: [
      step('s1', at(3, 6, '19:00'), review({ interruption: brk(c.d(3, 3), c.d(4, 2), 'TRAVEL', 'trip to see family, back next Wednesday') }), { observations: [done(R(3, 'RUN', 0)), done(R(3, 'STRENGTH', 1)), done(R(3, 'RUN', 2))] }),
      step('s2', at(4, 6, '19:00'), review(), { observations: [done(R(4, 'STRENGTH', 4)), done(R(4, 'RUN', 5))] }),
    ],
    expectedDomainProperties: [
      E('f15-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Plannable.'),
      E('f15-e2', 'GENERATE', DOM, PRES([0], 'RUN', ['WALK_JOG', 'WALK']), 'An absolute beginner starts with walking or walk/jog.'),
      E('f15-e3', 'GENERATE', DOM, ABS([0, 1, 2, 3], 'RUN', ['QUALITY']), 'No harder running for a beginner.'),
      E('f15-e4', 'GENERATE', DOM, J('Strength uses bodyweight exercises at a beginner level (regressions such as sit-to-stand, wall or incline push-ups) with generous reserve.'), 'Absolute beginner.'),
      E('f15-e5', 's1', INV, ST('ASK'), 'A break still under way is asked about, not applied (R7D-INTERFACE-2 section 1).'),
      E('f15-e6', 's1', INV, NP, 'While a kept break is not applied no plan is valid.'),
      E('f15-e7', 's2', DOM, ST('MODIFY'), 'The next review applies the kept break without restating it.'),
      E('f15-e8', 's2', DOM, VALID, 'The break has ended and its facts are complete.'),
      E('f15-e9', 's2', DOM, J('A seven-day break for an absolute beginner repeats or slightly steps back the walk/jog progression rather than jumping ahead.'), 'Short return for a beginner.'),
    ],
    metamorphicRelations: [{ relation: 'CALENDAR_SHIFT' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }],
    independentAssessment: ia(
      'Rafa is starting from nothing. Mid-trip he says he is away until next Wednesday; the coach should not plan the return before it ends. The next review, without restating it, is when the return can be planned.',
      'Plan walk/jog and basic bodyweight strength. At the under-way break ask (or hold) without a new plan; at the next review apply the 7-day break with a gentle repeat of the last completed walk/jog step.',
      ['Asking him to confirm the return date when the break ends.', 'Repeating the week before the break.'],
      ['Applying the return while he is still away.', 'Requiring him to state the break again.', 'Jumping the walk/jog progression forward.']),
    domainNotes: 'Break 2027-02-04 to 2027-02-10 (week 3 day 3 to week 4 day 2). Offset -08:00.',
  };
});

// ===================== MACHINE LOADS =====================

// F16 hybrid with machines: logged as prescribed, own heavier settings, confirmation and an equal second log (no learning consent)
K((id) => {
  const c = cal('2026-11-23', -300);
  const ob = '2026-11-20T18:00:00-05:00';
  const lp = { SQUAT: 150, PUSH: 55 };
  return {
    authorIntent: 'Machine exercises with known kilogram settings over three weeks: a week logged exactly as prescribed (including a same-day, date-only report), then the athlete\'s own heavier settings, then a confirmation and an equal second log. Learning consent is off.',
    coverageTags: ['COLD_START', 'STRENGTH_FIRST', 'GYM', 'LOAD_CONFIRMATION', 'NO_CONSENT', 'NON_RACE', 'H8', 'RUN_EXP_NOVICE', 'STR_EXP_INTERMEDIATE', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-21', start: '2026-11-23', weeks: 8, tz: -300, learningConsent: false, athlete: { id: 'ath-f16-kofi', runExperience: 'NOVICE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 1, runMinutesPerWeek: 25, longestRunMinutes: 25, strengthDaysPerWeek: 3 }, knownExercises: [kex('leg-press', 3, 10, 140, 'MACHINE_STACK', 2, ob), kex('lat-pulldown', 3, 10, 55, 'MACHINE_STACK', 2, ob), kex('machine-chest-press', 3, 10, 50, 'MACHINE_STACK', 2, ob), kex('seated-cable-row', 3, 10, 50, 'MACHINE_STACK', 2, ob)], goals: { run: 'GENERAL', strength: 'HYPERTROPHY' }, equipment: ['MACHINES', 'DUMBBELLS', 'BENCH', 'BODYWEIGHT'] }, schedule: { runDays: [1, 4], strengthDays: [0, 2, 5], runMinutes: 30, strengthMinutes: 60 } }),
    timeline: [
      step('s1', at(0, 5, '21:00'), review(), { observations: [done(R(0, 'STRENGTH', 0)), done(R(0, 'RUN', 1)), done(R(0, 'STRENGTH', 2)), done(R(0, 'RUN', 4)), { ref: R(0, 'STRENGTH', 5), completed: true, asPrescribed: true, occurrenceDate: c.d(0, 5), reportedAt: c.ts(0, 5, '18:40') }] }),
      step('s2', at(1, 5, '21:00'), review(), { observations: [done(R(1, 'STRENGTH', 0), { loadsByPattern: lp }), done(R(1, 'RUN', 1)), done(R(1, 'STRENGTH', 2), { loadsByPattern: lp }), done(R(1, 'RUN', 4)), done(R(1, 'STRENGTH', 5), { loadsByPattern: lp })], note: 'Reps and reserve as prescribed at his own heavier settings.' }),
      step('s3', at(2, 5, '21:00'), review(), { confirmPendingLoads: true, observations: [done(R(2, 'STRENGTH', 0), { loadsByPattern: lp }), done(R(2, 'RUN', 1)), done(R(2, 'STRENGTH', 2), { loadsByPattern: lp }), done(R(2, 'RUN', 4)), done(R(2, 'STRENGTH', 5), { loadsByPattern: lp })] }),
    ],
    expectedDomainProperties: [
      E('f16-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Plannable.'),
      E('f16-e2', 'GENERATE', INV, J('Known machine exercises are prescribed with KNOWN loads in kilograms in the MACHINE_STACK convention, never converted to another convention.'), 'R7D-INTERFACE-2 section 3.'),
      E('f16-e3', 's1', DOM, ST('KEEP', 'MODIFY'), 'A complete week.'),
      E('f16-e4', 's2', DOM, J('Heavier settings the athlete chose are not the reference yet: the coach asks one confirmation question (loadQuestions) and keeps the earlier settings until confirmed or logged again; the day-5 date-only report of week 0 is still in the record.'), 'Machine-load rule and same-day report.'),
      E('f16-e5', 's3', DOM, J('Once confirmed (and logged equal again) the settings are the reference; where a heavier setting is due the row asks for the machine\'s next setting above the reference and states no computed number of its own.'), 'The coach never computes a machine setting.'),
      E('f16-e6', 's3', DOM, VALID, 'Nothing pending after confirmation.'),
    ],
    metamorphicRelations: [{ relation: 'LOAD_CONVENTION_EQUIVALENT' }, { relation: 'RESEND', atStep: 's2' }, { relation: 'CONSENT_OFF' }],
    independentAssessment: ia(
      'Kofi knows his machine settings. Machines differ, so a coach cannot compute the next plate; it can ask for the next available setting and accept what he logs once it is confirmed or repeated.',
      'Prescribe the known settings, read logs as prescribed, ask once about the new heavier settings and adopt them on confirmation or on the second equal log.',
      ['Adopting the settings on the second equal log even before the confirmation is read.', 'Keeping reps constant and letting load rise only through logged settings.'],
      ['Computing kilogram increments for a machine.', 'Adopting a single heavier log immediately without confirmation.', 'Asking several separate questions for the same setting.']),
    domainNotes: 'Day 5 (Saturday) is the last session day, so reviews are on day 5 evening. Learning consent false throughout.',
  };
});

// F17 strength-first, strength-only gym athlete: heavier setting, a setting that does not fit, second equal log
K((id) => {
  const ob = '2027-01-15T19:00:00+00:00';
  return {
    authorIntent: 'Strength-first, strength-only cold start on machines with known settings; then a heavier own setting at one session and a lighter setting that does not fit the request at another; then the heavier setting logged again (equal second log) without a confirmation.',
    coverageTags: ['COLD_START', 'STRENGTH_FIRST', 'STRENGTH_ONLY', 'GYM', 'LOAD_CONFIRMATION', 'NON_RACE', 'H12', 'STR_EXP_INTERMEDIATE', 'RUN_EXP_NOVICE', 'START_NON_MONDAY'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-01-16', start: '2027-01-19', weeks: 12, tz: 0, athlete: { id: 'ath-f17-hana', runExperience: 'NOVICE', strengthExperience: 'INTERMEDIATE', recent: { strengthDaysPerWeek: 3 }, knownExercises: [kex('leg-press', 4, 6, 120, 'MACHINE_STACK', 2, ob), kex('lat-pulldown', 4, 8, 50, 'MACHINE_STACK', 2, ob), kex('seated-cable-row', 3, 10, 45, 'MACHINE_STACK', 2, ob), kex('machine-chest-press', 4, 8, 40, 'MACHINE_STACK', 2, ob)], goals: { run: 'NONE', strength: 'STRENGTH' }, equipment: ['MACHINES', 'BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [], strengthDays: [0, 2, 4], strengthMinutes: 60 } }),
    timeline: [
      step('s1', at(0, 6, '18:00'), review(), { observations: [each([0], 'STRENGTH')] }),
      step('s2', at(1, 6, '18:00'), review(), { observations: [done(R(1, 'STRENGTH', 0), { loadsByPattern: { SQUAT: 130 } }), done(R(1, 'STRENGTH', 2), { loadsByPattern: { SQUAT: 115 } }), done(R(1, 'STRENGTH', 4))], note: 'Day 2: a different leg press in the other gym, lighter stack.' }),
      step('s3', at(2, 6, '18:00'), review(), { observations: [done(R(2, 'STRENGTH', 0), { loadsByPattern: { SQUAT: 130 } }), done(R(2, 'STRENGTH', 2)), done(R(2, 'STRENGTH', 4), { loadsByPattern: { SQUAT: 130 } })] }),
    ],
    expectedDomainProperties: [
      E('f17-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Plannable.'),
      E('f17-e2', 'GENERATE', INV, ABS([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'RUN', RUN_ROLES), 'No run day chosen and no running goal: no run session.'),
      E('f17-e3', 'GENERATE', INV, J('Known machine settings are KNOWN loads in kilograms, MACHINE_STACK.'), 'R7D-INTERFACE-2 section 3.'),
      E('f17-e4', 's2', DOM, J('The 115 kg leg-press log (below the known 120 and below any heavier setting) is not taken as the new heavier reference and does not by itself lower the reference; the 130 kg log is not the reference yet.'), 'A setting that does not fit.'),
      E('f17-e5', 's3', DOM, J('130 kg logged again at another session that met its target becomes the reference without another question; no coach-computed setting appears.'), 'Second equal log.'),
      E('f17-e6', 's3', DOM, VALID, 'Nothing pending once the reference is set.'),
    ],
    metamorphicRelations: [{ relation: 'LOAD_CONVENTION_EQUIVALENT' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }],
    independentAssessment: ia(
      'Hana is strength-first with no running. Gyms differ: one log heavier, one lighter on another machine. A coach should not chase single logs, should not lower a reference because of an off-machine session, and should accept a heavier setting once it repeats at target.',
      'Prescribe the known settings; after week 1 ask (or wait) about 130 and disregard 115 as a heavier setting; after the second 130 log adopt it.',
      ['Asking which leg press she used on day 2.', 'Keeping 120 until she confirms 130.'],
      ['Lowering the reference to 115.', 'Adopting 130 after one log.', 'Inventing a kilogram increment.']),
    domainNotes: 'Day 0 is Tuesday. Day 6 (Monday) has no session.',
  };
});

// ===================== DATA =====================

// F18 phone + watch duplicate, in-time correction, late correction, exact re-send
K((id) => {
  const c = cal('2026-11-30', -360);
  const watch = { ref: R(0, 'RUN', 1), completed: true, minutes: 41, observedAt: c.ts(0, 1, '06:30'), source: { provider: 'wristco', activityId: 'wc-881', quality: 'WEARABLE_FULL' }, eventId: 'f18-w0d1-watch' };
  return {
    authorIntent: 'Data hygiene in a half-marathon build: the same run reported by phone and watch, an in-time correction of a missed-session report, a late correction of an earlier long run, and an exact re-send of a report.',
    coverageTags: ['DUPLICATE_SOURCES', 'CORRECTION', 'WEARABLE_FULL', 'RUN_FIRST', 'RACE_HALF', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'TIMEZONE', 'SKIPPED_REVIEW'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-27', start: '2026-11-30', weeks: 12, tz: -360, athlete: { id: 'ath-f18-bea', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 65, strengthDaysPerWeek: 1 }, goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: '2027-02-21' } }, strength: 'RUNNING_SUPPORT' }, equipment: ['BODYWEIGHT', 'DUMBBELLS'], wearableCapabilities: { provider: 'wristco', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: true, completeness: 'FULL' } }, schedule: { runDays: [1, 3, 6], strengthDays: [2], runMinutes: 45, strengthMinutes: 35, longRunDay: 6, longRunMinutes: 110 } }),
    timeline: [
      step('s1', at(0, 6, '21:00'), review(), { observations: [{ ref: R(0, 'RUN', 1), completed: true, minutes: 40, source: { provider: 'phoneapp', quality: 'MANUAL' }, eventId: 'f18-w0d1-phone' }, watch, done(R(0, 'STRENGTH', 2)), done(R(0, 'RUN', 3)), { ref: R(0, 'RUN', 6, 'LONG'), completed: true, minutes: 60, eventId: 'f18-w0-long' }], note: 'The Tuesday run arrives from the phone log and from the watch.' }),
      step('s2', at(1, 4, '08:00'), { kind: 'MISSED_SESSION' }, { targetRef: R(1, 'RUN', 3), observations: [miss(R(1, 'RUN', 3), { eventId: 'f18-w1d3-miss' })] }),
      step('s3', at(1, 6, '21:00'), review(), { observations: [done(R(1, 'RUN', 1)), done(R(1, 'STRENGTH', 2)), { ref: R(1, 'RUN', 3), completed: true, minutes: 35, eventId: 'f18-w1d3-fix', correctionOf: 'f18-w1d3-miss', correctedAt: c.ts(1, 6, '20:50') }, done(R(1, 'RUN', 6, 'LONG')), { ref: R(0, 'RUN', 6, 'LONG'), completed: true, minutes: 48, eventId: 'f18-w0-long-fix', correctionOf: 'f18-w0-long', correctedAt: c.ts(1, 6, '20:52') }, watch], note: 'Wednesday run was done late in the evening after all (in-time correction); last week\'s long run was 48 minutes, the watch had auto-paused (late correction); the watch app re-sends the week-0 Tuesday run unchanged.' }),
    ],
    expectedDomainProperties: [
      E('f18-e1', 's1', DOM, ST('KEEP', 'MODIFY'), 'A complete week.'),
      E('f18-e2', 's1', INV, J('The phone and watch reports of the same Tuesday run count as one session, not two.'), 'Duplicate sources.'),
      E('f18-e3', 's2', DOM, ST('KEEP', 'MODIFY', 'ASK'), 'A missed run is planned around.'),
      E('f18-e4', 's3', DOM, VALID, 'Corrections resolve every report.'),
      E('f18-e5', 's3', DOM, J('The in-time correction replaces the missed report (the Wednesday run is done, 35 minutes); the late correction makes the week-0 long run 48 minutes, which may temper future long-run doses but changes no past decision; the re-sent watch report is counted once.'), 'History rules for corrections and re-sends.'),
    ],
    metamorphicRelations: [{ relation: 'DUPLICATE_SECOND_SOURCE', atStep: 's3' }, { relation: 'RESEND', atStep: 's3' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's3' }],
    independentAssessment: ia(
      'Bea logs by phone and watch; duplicates, corrections and re-sends are normal app noise. A coach must count each session once, let a correction replace what it corrects, and let a late correction influence only what comes next.',
      'Count the Tuesday run once; after the missed report, adjust or keep; at the review, accept both corrections and ignore the re-send, then plan week 2 from the corrected facts (the long run base is 48, not 60, minutes).',
      ['Keeping the week-2 long run unchanged if it was already conservative.', 'Asking which duplicate is right when the minutes differ by a minute (not needed).'],
      ['Counting the Tuesday run twice.', 'Keeping the Wednesday run as missed after its correction.', 'Rewriting an earlier decision because of the late correction.']),
    domainNotes: 'Monday start, offset -06:00. Race 2027-02-21 is week 11 day 6.',
  };
});

// F19 contradiction, out-of-order arrival, a clock in the future, time zones while travelling
K((id) => {
  const c = cal('2027-02-01', 540);
  const utc = (w, dd, t) => c.d(w, dd) + 'T' + t + ':00+00:00';
  return {
    authorIntent: 'A hybrid athlete living at +09:00 trains a week in London (+00:00). Probes a contradiction between watch and phone, week-0 reports arriving after week 1, a report clocked after the decision that reads it, and a later correction that resolves the contradiction.',
    coverageTags: ['CONTRADICTION', 'CORRECTION', 'OUT_OF_ORDER', 'CLOCK_SKEW', 'TIMEZONE', 'DUPLICATE_SOURCES', 'LATE_REPORTER', 'SKIPPED_REVIEW', 'BALANCED_HYBRID', 'NON_RACE', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-01-30', start: '2027-02-01', weeks: 8, tz: 540, athlete: { id: 'ath-f19-yuki', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80, strengthDaysPerWeek: 2 }, goals: { run: 'PERFORMANCE', strength: 'MAINTAIN' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT', 'KETTLEBELL'] }, schedule: { runDays: [0, 2, 4, 6], strengthDays: [1, 3], runMinutes: 50, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 90 } }),
    timeline: [
      step('s1', at(1, 6, '22:00'), review(), { observations: [done(R(1, 'RUN', 0), { observedAt: utc(1, 0, '07:00') }), done(R(1, 'STRENGTH', 1)), { ref: R(1, 'RUN', 2), completed: true, minutes: 45, observedAt: utc(1, 2, '06:45'), source: { provider: 'wristco', activityId: 'wc-2201', quality: 'WEARABLE_FULL' }, eventId: 'f19-w1d2-watch' }, { ref: R(1, 'RUN', 2), completed: false, source: { provider: 'phoneapp', quality: 'MANUAL' }, eventId: 'f19-w1d2-manual' }, done(R(1, 'STRENGTH', 3)), done(R(1, 'RUN', 4), { observedAt: utc(1, 4, '07:10') }), done(R(1, 'RUN', 6, 'LONG'), { observedAt: utc(1, 6, '08:00') })], note: 'Week in London; the phone log wrongly says Wednesday was skipped while the watch recorded it.' }),
      step('s2', at(2, 6, '22:00'), review(), { observations: [each([0], 'RUN', null, { completed: true, asPrescribed: true, reportedAt: c.ts(2, 6, '21:55') }), each([0], 'STRENGTH', null, { completed: true, asPrescribed: true, reportedAt: c.ts(2, 6, '21:55') }), done(R(2, 'RUN', 0)), done(R(2, 'STRENGTH', 1)), done(R(2, 'RUN', 2)), done(R(2, 'STRENGTH', 3)), done(R(2, 'RUN', 4)), { ref: R(2, 'RUN', 6, 'LONG'), completed: true, asPrescribed: true, observedAt: c.ts(2, 6, '23:30'), eventId: 'f19-w2-long-future' }], note: 'Week-0 reports finally sync, after week 1; the long-run clock is wrong (set after the review time).' }),
      step('s3', at(3, 6, '22:00'), review(), { observations: [{ ref: R(1, 'RUN', 2), completed: true, minutes: 45, eventId: 'f19-w1d2-fix', correctionOf: 'f19-w1d2-manual', correctedAt: c.ts(3, 6, '21:50') }, { ref: R(2, 'RUN', 6, 'LONG'), completed: true, asPrescribed: true, observedAt: c.ts(2, 6, '07:30'), eventId: 'f19-w2-long' }, each([3], 'RUN'), each([3], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f19-e1', 's1', DOM, J('The contradictory reports of week 1 day 2 are not silently resolved by picking one: the session is asked about, held, or left unknown until resolved; the London-timed reports fall on their own local dates.'), 'Contradiction and time zones.'),
      E('f19-e2', 's2', DOM, J('The long run clocked after the decision is not recorded as done at this decision (refused, held or asked); the week-0 reports arriving late are accepted as late facts that only affect the future.'), 'Clock in the future and out-of-order arrival.'),
      E('f19-e3', 's3', DOM, J('The correction makes the Wednesday run of week 1 done and the contradiction disappears; the properly clocked week-2 long run counts once.'), 'Correction resolves a contradiction.'),
      E('f19-e4', 's3', DOM, VALID, 'Nothing pending after the correction.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }, { relation: 'CALENDAR_SHIFT' }, { relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Yuki\'s data are messy: two devices disagree, a week arrives late and one clock is wrong. A coach plans on facts it can trust and asks when two facts contradict.',
      'Hold or ask about the contradicted session instead of guessing; place travel-week sessions on their local dates; accept late week-0 reports for future planning; refuse the future-clocked report; resolve all once corrected.',
      ['Treating the contradicted session as unknown and planning conservatively.', 'Holding the whole week-2 review because of the bad clock, with the re-sent long run accepted later.'],
      ['Silently trusting one device.', 'Recording the future-clocked long run as done.', 'Rewriting week-1 decisions because week 0 arrived late.']),
    domainNotes: 'Home offset +09:00; London reports carry +00:00. The future clock is 23:30 local on week 2 day 6, after the 22:00 review.',
  };
});

// ===================== BREAK STATED WITH ANOTHER EVENT =====================

// F20 break stated with a schedule change, a fatigue report before the next review, a mid-week return, events re-sent
K((id) => {
  const c = cal('2026-12-21', 60);
  const ob = '2026-12-17T18:00:00+01:00';
  const sched = { runDays: [1, 3, 5], strengthDays: [0, 4] };
  return {
    authorIntent: 'A work break stated together with a schedule change, then a systemic fatigue report before any review, then a return reported on Thursday after the Monday and Tuesday sessions were not done, then both events sent again. Probes kept breaks, events asked on their own, and a mid-week return.',
    coverageTags: ['SCHEDULE_CHANGE', 'FATIGUE_SYSTEMIC', 'RETURN_SHORT', 'BALANCED_HYBRID', 'GYM', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'LATE_REPORTER', 'TIMEZONE'],
    oracleClass: INV,
    intake: intake({ asOf: '2026-12-19', start: '2026-12-21', weeks: 12, tz: 60, athlete: { id: 'ath-f20-oskar', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 140, longestRunMinutes: 70, strengthDaysPerWeek: 2 }, knownExercises: [kex('back-squat', 3, 5, 90, 'TOTAL', 2, ob), kex('bench-press', 3, 5, 70, 'TOTAL', 2, ob), kex('barbell-row', 3, 8, 60, 'TOTAL', 2, ob), kex('barbell-rdl', 3, 6, 80, 'TOTAL', 2, ob)], goals: { run: 'REGULAR', strength: 'STRENGTH' }, equipment: ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'BODYWEIGHT'] }, schedule: { runDays: [0, 3, 5], strengthDays: [1, 4], runMinutes: 45, strengthMinutes: 60, longRunDay: 5, longRunMinutes: 75 } }),
    timeline: [
      step('s1', at(3, 1, '08:00'), { kind: 'SCHEDULE_CHANGE', changes: sched, interruption: brk(c.d(2, 2), c.d(2, 6), 'WORK', 'audit week, no training') }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH'), done(R(2, 'RUN', 0)), done(R(2, 'STRENGTH', 1))], note: 'Asks to swap days and mentions last week\'s audit break in the same message.' }),
      step('s2', at(3, 2, '07:30'), { kind: 'SYSTEMIC_FATIGUE', signals: { region: 'ALL' } }),
      step('s3', at(3, 3, '07:00'), { kind: 'RETURN_AFTER_PAUSE' }, { observations: [miss(R(3, 'RUN', 0)), miss(R(3, 'STRENGTH', 1))], note: 'Return report on Thursday; Monday run and Tuesday strength were not done.' }),
      step('s4', at(3, 3, '07:30'), { kind: 'SCHEDULE_CHANGE', changes: sched }, { note: 'The schedule change sent again after the return.' }),
      step('s5', at(3, 3, '07:45'), { kind: 'SYSTEMIC_FATIGUE', signals: { region: 'ALL' } }, { note: 'The fatigue report sent again after the return.' }),
    ],
    expectedDomainProperties: [
      E('f20-e1', 's1', INV, ST('ASK'), 'A break stated with another kind of event is kept and asked on its own (R7D-INTERFACE-3).'),
      E('f20-e2', 's1', INV, NP, 'No plan is valid while the kept break is not applied.'),
      E('f20-e3', 's2', INV, ST('ASK'), 'Another kind of event while the break is kept is asked about, not applied.'),
      E('f20-e4', 's2', INV, NP, 'Still no valid plan.'),
      E('f20-e5', 's3', DOM, ST('MODIFY'), 'The return report applies the kept break without restating it.'),
      E('f20-e6', 's3', DOM, VALID, 'The return is complete.'),
      E('f20-e7', 's3', DOM, J('The return is reported mid-week: the not-done Monday run and Tuesday strength never count as done for the longest-run limit, and the weeks after are planned from the runs completed before the break.'), 'R7D-INTERFACE-6 section 2.'),
      E('f20-e8', 's4', DOM, ST('MODIFY', 'KEEP'), 'The re-sent schedule change is now applied.'),
      E('f20-e9', 's4', INV, J('From this decision on, runs fall on days 1, 3 and 5 and strength on days 0 and 4 only.'), 'Chosen days after the change.'),
      E('f20-e10', 's5', DOM, ST('MODIFY', 'KEEP'), 'The re-sent fatigue report is planned around.'),
      E('f20-e11', 's5', DOM, J('Systemic fatigue right after a return holds or reduces intensity and volume for the coming days; nothing is added.'), 'Fatigue handling.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's1' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Oskar mixes three things: a past break, a schedule swap and general fatigue. The break must be applied before anything else can be planned; the events then make sense only against the return plan.',
      'Record the break and ask for it on its own; ask the fatigue event on its own as well; on the Thursday return apply a short return that ignores the not-done Monday and Tuesday sessions; then apply the swap and the fatigue (lighter days this week).',
      ['Applying the swap only from the following week.', 'Asking how long the fatigue has lasted.'],
      ['Applying the schedule swap on top of the stale plan before the return.', 'Requiring the break to be stated again.', 'Counting the Monday and Tuesday sessions as done.']),
    domainNotes: 'Break 2027-01-06 to 2027-01-10. Return reported Thursday 2027-01-14 (week 3 day 3).',
  };
});

// ===================== BREAKS UNDER A CLINICAL ROUTE =====================

// F21 a nonclinical break stated while the eligibility shows pain; qualified clearance; reviews that do not restate it
K((id) => {
  const c = cal('2027-01-25', -180);
  return {
    authorIntent: 'A work-trip break is stated in a review whose eligibility re-answer reports pain. Clinical first; after a qualified clearance the next review must apply the kept break rather than revive the pre-break plan.',
    coverageTags: ['CLINICAL_SIGNAL', 'RETURN_SHORT', 'TRAVEL', 'RUN_FIRST', 'RACE_10K', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'TIMEZONE', 'SKIPPED_REVIEW'],
    oracleClass: INV,
    intake: intake({ asOf: '2027-01-23', start: '2027-01-25', weeks: 12, tz: -180, athlete: { id: 'ath-f21-lucas', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 130, longestRunMinutes: 60, strengthDaysPerWeek: 0 }, goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-04-11', timeGoalMinutes: 52 } }, strength: 'RUNNING_SUPPORT' }, equipment: ['BODYWEIGHT', 'BANDS', 'DUMBBELLS'] }, schedule: { runDays: [1, 3, 6], strengthDays: [2, 4], runMinutes: 45, strengthMinutes: 30, longRunDay: 6, longRunMinutes: 80 } }),
    timeline: [
      step('s1', at(3, 6, '20:00'), review({ interruption: brk(c.d(2, 4), c.d(3, 2), 'TRAVEL', 'work trip abroad') }), { eligibility: { status: 'CLINICAL', assessedAt: c.d(3, 6), pain: true, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false }, observations: [done(R(2, 'RUN', 1)), done(R(2, 'STRENGTH', 2)), done(R(2, 'RUN', 3))], note: 'Back from the trip with a painful Achilles.' }),
      step('s2', at(4, 6, '20:00'), review(), { clearance: 'QUALIFIED_CLEARANCE', observations: [each([4], 'RUN', null, { completed: false }), each([4], 'STRENGTH', null, { completed: false })], note: 'A physiotherapist cleared him on Saturday; he did not train in week 4 while waiting.' }),
      step('s3', at(5, 6, '20:00'), review(), { observations: [each([5], 'RUN'), each([5], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f21-e1', 's1', INV, ST('CLINICAL_HUMAN_REQUIRED'), 'Pain in the eligibility re-answer routes to a qualified human first.'),
      E('f21-e2', 's1', INV, NP, 'Nothing prescribed under the clinical route.'),
      E('f21-e3', 's1', NED, J('Whether he can run with this Achilles pain is a clinical judgment, not assessed.'), 'Clinical adequacy not evaluable.'),
      E('f21-e4', 's2', DOM, ST('MODIFY', 'ASK'), 'After clearance the next review applies the kept break (or asks a fact it still lacks).'),
      E('f21-e5', 's2', INV, J('The pre-break plan is not treated as valid again just because the clearance did not mention the break: the kept travel break is applied as a return.'), 'R7D-INTERFACE-3 section 1.'),
      E('f21-e6', 's2', DOM, J('With the break plus a week without training, the return is conservative and does not resume the pre-break progression.'), 'Return dose.'),
      E('f21-e7', 's3', DOM, VALID, 'A normal week after the return.'),
      E('f21-e8', 's3', DOM, PRES([10], 'RUN', ['RACE']), 'The race goal stands.'),
    ],
    metamorphicRelations: [{ relation: 'CALENDAR_SHIFT' }, { relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Lucas reports a finished work trip and, at the same time, pain. The pain decides first; once a qualified human clears him, the coach still has to account for the trip and the week he did not train.',
      'Route to a human at s1 and prescribe nothing; after clearance apply the trip as a return, counting the week of no training, and rebuild toward the 10K.',
      ['Asking how the Achilles responded to the first easy run (a nonclinical tolerance check) without clinical advice.', 'A return of two weeks before regular progression.'],
      ['Planning around the pain.', 'Resuming the pre-break plan after the clearance.', 'Asking him to state the break again.']),
    domainNotes: 'Break 2027-02-12 to 2027-02-17. Clearance at week 4 day 6. Race 2027-04-11 is week 10 day 6.',
  };
});

// F22 substitution without pain, then a substitution with pain carrying a break, then clearance and a review
K((id) => {
  const c = cal('2026-12-02', 0);
  return {
    authorIntent: 'A skill-mismatch substitution, then a substitution with knee pain that also states a conference break, then a qualified clearance in a review that does not restate the break. Probes catalog-bounded substitution, clinical routing, and the kept break applied after clearance.',
    coverageTags: ['SUBSTITUTION', 'SUBSTITUTION_PAIN_CLEARANCE', 'CLINICAL_SIGNAL', 'STRENGTH_FIRST', 'NON_RACE', 'H8', 'RUN_EXP_NOVICE', 'STR_EXP_INTERMEDIATE', 'START_NON_MONDAY', 'RETURN_SHORT'],
    oracleClass: INV,
    intake: intake({ asOf: '2026-11-29', start: '2026-12-02', weeks: 8, tz: 0, athlete: { id: 'ath-f22-amara', runExperience: 'NOVICE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 1, runMinutesPerWeek: 30, longestRunMinutes: 30, strengthDaysPerWeek: 3 }, goals: { run: 'GENERAL', strength: 'HYPERTROPHY' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT'] }, schedule: { runDays: [1, 4], strengthDays: [0, 2, 5], runMinutes: 30, strengthMinutes: 55 } }),
    timeline: [
      step('s1', at(1, 2, '07:00'), { kind: 'EXERCISE_SUBSTITUTION', substitution: { exerciseRef: { week: 1, day: 2, pattern: 'SQUAT' }, reason: 'SKILL_MISMATCH', text: 'heels lift and knees cave on the squat, cannot keep steady technique' } }),
      step('s2', at(2, 5, '07:00'), { kind: 'EXERCISE_SUBSTITUTION', substitution: { exerciseRef: { week: 2, day: 5, pattern: 'SQUAT' }, reason: 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', pain: true, text: 'sharp pain at the front of the knee going down since Saturday' }, interruption: brk(c.d(2, 0), c.d(2, 3), 'WORK', 'conference, no training') }),
      step('s3', at(3, 6, '20:00'), review(), { clearance: 'QUALIFIED_CLEARANCE', observations: [each([3], 'RUN', null, { completed: false }), each([3], 'STRENGTH', null, { completed: false })], note: 'Cleared by a sports physician; nothing trained in week 3.' }),
    ],
    expectedDomainProperties: [
      E('f22-e1', 's1', DOM, ST('MODIFY', 'KEEP'), 'A skill mismatch is solved within the catalog.'),
      E('f22-e2', 's1', DOM, J('The squat is replaced by an easier squat-pattern variation she can do with steady technique, within dumbbells, bench or bodyweight; no exercise outside her equipment or the catalog.'), 'Repertoire boundary.'),
      E('f22-e3', 's2', INV, ST('CLINICAL_HUMAN_REQUIRED'), 'A substitution with pain routes to a qualified human.'),
      E('f22-e4', 's2', INV, NP, 'Nothing prescribed under the route.'),
      E('f22-e5', 's3', DOM, ST('MODIFY', 'ASK'), 'After clearance the review applies the kept break.'),
      E('f22-e6', 's3', INV, J('The pre-break plan does not become valid again just because of the clearance; the kept conference break is applied.'), 'R7D-INTERFACE-3 section 1.'),
      E('f22-e7', 's3', NED, J('How much knee-dominant loading suits her after the clearance is a clinical judgment, not assessed.'), 'Clinical adequacy.'),
    ],
    metamorphicRelations: [{ relation: 'RENAME_OPAQUE_IDS' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Amara\'s first request is a technique problem: regress the squat. The second carries knee pain and mentions a conference week; the pain routes to a human first. After clearance, the break and the week she did nothing still need a return.',
      'Regress the squat within equipment; route the painful substitution to a human with no plan; after clearance apply the conference break, account for the untrained week and restart progression conservatively.',
      ['A box squat or sit-to-stand as the regression.', 'Asking for the squat she prefers among regressions.'],
      ['Swapping to an exercise outside her equipment.', 'Accepting a pain substitution as a preference.', 'Resuming the old plan after the clearance.']),
    domainNotes: 'Day 0 is Wednesday. Break 2026-12-16 to 2026-12-19; pain report Monday 2026-12-21 (week 2 day 5).',
  };
});

// F23 a break with a clinical cause, then a nonclinical break, then clearance and the first break restated by name as nonclinical
K((id) => {
  const c = cal('2027-02-15', -300);
  return {
    authorIntent: 'A flu break (clinical cause) is stated first; a nonclinical work break follows before any return; after a qualified clearance the athlete restates the first break by name with a nonclinical reason. Clinical first and the clinical episode rule must hold throughout.',
    coverageTags: ['CLINICAL_PAUSE', 'CLINICAL_SIGNAL', 'BALANCED_HYBRID', 'NON_RACE', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'TIMEZONE', 'SKIPPED_REVIEW'],
    oracleClass: INV,
    intake: intake({ asOf: '2027-02-13', start: '2027-02-15', weeks: 8, tz: -300, athlete: { id: 'ath-f23-grace', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 140, longestRunMinutes: 65, strengthDaysPerWeek: 2 }, goals: { run: 'REGULAR', strength: 'MAINTAIN' }, equipment: ['DUMBBELLS', 'BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [0, 2, 5], strengthDays: [1, 3], runMinutes: 45, strengthMinutes: 40, longRunDay: 5, longRunMinutes: 70 } }),
    timeline: [
      step('s1', at(2, 6, '20:00'), review({ interruption: { startDate: c.d(2, 0), endDate: c.d(2, 4), reasonCategory: 'ILLNESS', reason: 'flu with fever', clinicalReason: true } }), { observations: [each([1], 'RUN'), each([1], 'STRENGTH')] }),
      step('s2', at(3, 6, '20:00'), review({ interruption: brk(c.d(3, 2), c.d(3, 5), 'WORK', 'deadline week') }), { observations: [done(R(3, 'RUN', 0)), done(R(3, 'STRENGTH', 1))] }),
      step('s3', at(4, 6, '20:00'), review({ interruption: { episodeId: id + '-s1', startDate: c.d(2, 0), endDate: c.d(2, 4), reasonCategory: 'OTHER_NONCLINICAL', reason: 'it was only a mild cold, no fever after all', nonclinical: true } }), { clearance: 'QUALIFIED_CLEARANCE' }),
    ],
    expectedDomainProperties: [
      E('f23-e1', 's1', INV, ST('CLINICAL_HUMAN_REQUIRED'), 'A break whose reason is illness routes to a qualified human.'),
      E('f23-e2', 's1', INV, NP, 'Nothing prescribed.'),
      E('f23-e3', 's2', INV, ST('CLINICAL_HUMAN_REQUIRED'), 'A newer nonclinical break never makes the kept clinical one nonclinical (R7D-INTERFACE-4).'),
      E('f23-e4', 's2', INV, J('No relation question and no return dose is given while the kept clinical-cause break stands.'), 'Clinical first, before the relation question.'),
      E('f23-e5', 's3', INV, ST('CLINICAL_HUMAN_REQUIRED'), 'A clinical-cause episode stays clinical after clearance and after a restated nonclinical reason (R7D-INTERFACE-6 section 3, F08).'),
      E('f23-e6', 's3', INV, NP, 'No nonclinical return is planned for a clinical cause.'),
      E('f23-e7', 's3', NED, J('Whether she is actually fit to train after the flu is a clinical judgment, not assessed.'), 'Clinical adequacy.'),
    ],
    metamorphicRelations: [{ relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Grace had the flu with fever, then a work week. A fever illness is a clinical cause; the coach cannot reclassify it because she later calls it a cold, nor because a clearance arrived without a mechanism to end the clinical episode.',
      'Route each decision to a qualified human and prescribe nothing; explain that the restated reason is recorded as her statement but does not end the clinical route.',
      ['Recording the corrected dates and text as her statement while keeping the route.'],
      ['Planning a nonclinical return after the restatement or the clearance.', 'Asking the relation question between the two breaks as if both were nonclinical.', 'Treating the newer work break as replacing the illness break.']),
    domainNotes: 'Illness 2027-03-01 to 2027-03-05; work 2027-03-10 to 2027-03-13. The first break\'s identity is the review event id ' + id + '-s1.',
  };
});

// ===================== TWO BREAKS BEFORE ANY RETURN =====================

// F24 later break shorter and beginning the day after the earlier one ends; athlete says it is a separate break
K((id) => {
  const c = cal('2026-11-09', -300);
  const B = brk(c.d(3, 0), c.d(3, 4), 'FAMILY', 'helping my parents move house');
  return {
    authorIntent: 'A conference week stated with an unavailable-day event, then a five-day family break that begins the day after it ends, stated in the next review. Asked, the athlete says the second is a separate break. Together they are a 12-day stop, much longer than the later break alone.',
    coverageTags: ['UNAVAILABLE_DAY', 'RETURN_MODERATE', 'RUN_FIRST', 'RACE_10K', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'TIMEZONE', 'SKIPPED_REVIEW'],
    oracleClass: INV,
    intake: intake({ asOf: '2026-11-07', start: '2026-11-09', weeks: 12, tz: -300, athlete: { id: 'ath-f24-mateo', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2 }, goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-01-24', timeGoalMinutes: 50 } }, strength: 'RUNNING_SUPPORT' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT'] }, schedule: { runDays: [1, 3, 6], strengthDays: [0, 4], runMinutes: 45, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 85 } }),
    timeline: [
      step('s1', at(3, 1, '07:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(3, 4)] }, interruption: brk(c.d(2, 0), c.d(2, 6), 'WORK', 'conference week, no training') }, { observations: [each([1], 'RUN'), each([1], 'STRENGTH')] }),
      step('s2', at(3, 6, '20:00'), review({ interruption: B })),
      step('s3', at(4, 0, '07:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...B, episodeId: id + '-s2' } }, { observations: [miss(R(3, 'RUN', 6))], note: 'Answer: "another break", under its own identity.' }),
      step('s4', at(4, 6, '20:00'), review(), { observations: [each([4], 'RUN'), each([4], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f24-e1', 's1', INV, ST('ASK'), 'A break stated with another kind of event is kept and asked on its own.'),
      E('f24-e2', 's1', INV, NP, 'No valid plan while a kept break is not applied.'),
      E('f24-e3', 's2', INV, QK('INTERRUPTION_RELATION'), 'A newer break that names none: its relation to the kept one is asked (R7D-INTERFACE-4).'),
      E('f24-e4', 's2', INV, NP, 'No return dose before the relation is known.'),
      E('f24-e5', 's3', DOM, ST('MODIFY'), 'With the relation answered the return is applied.'),
      E('f24-e6', 's3', DOM, J('Two separate breaks that touch form one continuous stop from 2026-11-23 to 2026-12-04 (12 days); the return is dosed for that stop, clearly more conservative than for the five-day later break alone.'), 'Touching separate breaks.'),
      E('f24-e7', 's3', DOM, PRES([10], 'RUN', ['RACE']), 'The race goal stands.'),
      E('f24-e8', 's4', DOM, VALID, 'A review that states no break keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'CALENDAR_SHIFT' }, { relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Mateo was away a full week at a conference and then five more days helping his parents. Each break alone is short; back to back they are almost two weeks without running before a 10K build continues.',
      'Keep the conference break, ask how the second break relates, and once he says it is separate, plan the return for the continuous 12-day stop, then rebuild toward the race.',
      ['A return of one to two weeks at reduced volume.', 'Lowering the 10K time goal expectation in the explanation.'],
      ['Planning the return from the five-day break alone.', 'Adding up the days of both breaks beyond the actual stop.', 'Asking him to restate the conference break.']),
    domainNotes: 'Break A 2026-11-23 to 2026-11-29 (week 2); break B 2026-11-30 to 2026-12-04 (week 3 days 0 to 4). The answer step names B by its own identity ' + id + '-s2.',
  };
});

// F25 later break overlapping the earlier one; the athlete says it corrects it (beginner)
K((id) => {
  const c = cal('2026-12-28', 60);
  const B = brk(c.d(2, 3), c.d(3, 1), 'VACATION', 'ski trip, the real dates');
  return {
    authorIntent: 'A novice states a ski trip together with a local fatigue report, then a review states overlapping trip dates; asked, she says the newer dates correct the first ones. Probes correction of a kept break and training done after the corrected stop.',
    coverageTags: ['FATIGUE_LOCAL', 'CORRECTION', 'RETURN_SHORT', 'SHORTENED_RUNS', 'BALANCED_HYBRID', 'NON_RACE', 'H16', 'RUN_EXP_NOVICE', 'STR_EXP_NOVICE', 'KETTLEBELL', 'TIMEZONE'],
    oracleClass: INV,
    intake: intake({ asOf: '2026-12-26', start: '2026-12-28', weeks: 16, tz: 60, athlete: { id: 'ath-f25-lea', runExperience: 'NOVICE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 2, runMinutesPerWeek: 60, longestRunMinutes: 35, strengthDaysPerWeek: 1 }, goals: { run: 'REGULAR', strength: 'MAINTAIN' }, equipment: ['BODYWEIGHT', 'BANDS', 'KETTLEBELL'] }, schedule: { runDays: [0, 2, 5], strengthDays: [1, 3], runMinutes: 35, strengthMinutes: 35, longRunDay: 5, longRunMinutes: 50 } }),
    timeline: [
      step('s1', at(3, 2, '08:00'), { kind: 'LOCAL_FATIGUE', signals: { region: 'LOWER' }, interruption: brk(c.d(2, 1), c.d(2, 5), 'VACATION', 'ski trip') }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH'), done(R(2, 'RUN', 0))] }),
      step('s2', at(3, 6, '20:00'), review({ interruption: B }), { observations: [{ ref: R(3, 'RUN', 2), completed: true, fraction: 0.7, response: { recovery: 'COMPATIBLE' } }, done(R(3, 'STRENGTH', 3)), done(R(3, 'RUN', 5))] }),
      step('s3', at(4, 0, '07:30'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...B, episodeId: id + '-s1' } }, { observations: [miss(R(2, 'STRENGTH', 1)), miss(R(2, 'RUN', 2))], note: 'Answer: "the same break, corrected". The Tuesday and Wednesday before the trip were packing days.' }),
      step('s4', at(4, 6, '20:00'), review(), { observations: [each([4], 'RUN'), each([4], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f25-e1', 's1', INV, ST('ASK'), 'Break stated with another kind of event: kept, asked on its own.'),
      E('f25-e2', 's1', INV, NP, 'No valid plan.'),
      E('f25-e3', 's2', INV, QK('INTERRUPTION_RELATION'), 'Overlapping newer break that names none: relation asked.'),
      E('f25-e4', 's2', INV, NP, 'No return dose before the answer.'),
      E('f25-e5', 's3', DOM, ST('MODIFY'), 'The corrected break is applied.'),
      E('f25-e6', 's3', DOM, J('The corrected break (2027-01-14 to 2027-01-19) replaces the first facts; the stop is not lengthened by the superseded dates; the runs and strength done after the trip count as executed training for the return.'), 'Correction of a kept break.'),
      E('f25-e7', 's4', DOM, VALID, 'A review that states no break keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Lea first gave rough trip dates, then the real ones, overlapping. She says the second is the same trip corrected. After the trip she already ran and lifted a little.',
      'Keep the first statement, ask the relation, then read only the corrected dates: a six-day stop for a novice, a short return that takes into account the shortened run and the sessions done since.',
      ['Asking how the local fatigue is now before progressing.', 'Repeating the last pre-break week.'],
      ['Joining the two date ranges into one longer stop.', 'Treating the corrected break as a second break.', 'Ignoring the sessions done after the trip.']),
    domainNotes: 'First statement 2027-01-12 to 2027-01-16; corrected 2027-01-14 to 2027-01-19. The answer names the first break by ' + id + '-s1. The local fatigue was not re-sent after the return (it had resolved).',
  };
});

// F26 two breaks with days between, sessions between unreported until asked; separate
K((id) => {
  const c = cal('2027-01-07', 120);
  const B = brk(c.d(3, 1), c.d(3, 5), 'TRAVEL', 'ferry trip to the islands');
  return {
    authorIntent: 'A three-day work break stated with a schedule change, then a later travel break with four days between them; asked, the athlete says they are separate; the planned sessions between were never reported until the coach asks, and none was done.',
    coverageTags: ['SCHEDULE_CHANGE', 'TRAVEL', 'RETURN_MODERATE', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'START_NON_MONDAY', 'TIMEZONE', 'PARTIAL_ANSWER'],
    oracleClass: INV,
    intake: intake({ asOf: '2027-01-05', start: '2027-01-07', weeks: 12, tz: 120, athlete: { id: 'ath-f26-nikos', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 160, longestRunMinutes: 75, strengthDaysPerWeek: 2 }, goals: { run: 'PERFORMANCE', strength: 'GENERAL' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT', 'PULL_UP_BAR'] }, schedule: { runDays: [0, 2, 4], strengthDays: [1, 5], runMinutes: 50, strengthMinutes: 45, longRunDay: 2, longRunMinutes: 85 } }),
    timeline: [
      step('s1', at(2, 3, '09:00'), { kind: 'SCHEDULE_CHANGE', changes: { runTurn: 'PM' }, interruption: brk(c.d(2, 0), c.d(2, 2), 'WORK', 'inventory at work') }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH')] }),
      step('s2', at(3, 6, '20:00'), review({ interruption: B })),
      step('s3', at(4, 0, '07:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...B, episodeId: 'islands-trip' } }, { note: 'Answer: "another break", under a name of its own.' }),
      step('s4', at(4, 0, '12:00'), { kind: 'RETURN_AFTER_PAUSE' }, { observations: [miss(R(2, 'RUN', 4)), miss(R(2, 'STRENGTH', 5)), miss(R(3, 'RUN', 0))], note: 'Asked about the sessions between the breaks: none was done.' }),
    ],
    expectedDomainProperties: [
      E('f26-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept and asked on its own.'),
      E('f26-e2', 's1', INV, NP, 'No valid plan.'),
      E('f26-e3', 's2', INV, QK('INTERRUPTION_RELATION'), 'Relation asked.'),
      E('f26-e4', 's3', INV, QK('TRAINING_BETWEEN_BREAKS'), 'Planned sessions between separate breaks with no report are asked about first (R7D-INTERFACE-4).'),
      E('f26-e5', 's3', INV, NP, 'No return dose before they are answered.'),
      E('f26-e6', 's4', DOM, ST('MODIFY'), 'All facts known: the return is applied.'),
      E('f26-e7', 's4', DOM, VALID, 'Nothing pending.'),
      E('f26-e8', 's4', DOM, J('With every planned session between them reported not done, the stop runs from 2027-01-21 to 2027-02-02 (13 days) and the return is dosed for that stop.'), 'No training between the breaks.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's4' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Nikos had an inventory weekend, four ordinary days in which he did nothing, then a ferry trip. Without knowing about the days between, the coach cannot tell whether he trained; asking is right. Since nothing was done, the stop is effectively continuous.',
      'Keep the first break, ask the relation, ask about the sessions between, then plan a return for the whole 13-day stop.',
      ['Treating the stop as two shorter breaks only if training had been reported between them (it was not).'],
      ['Assuming the unreported sessions were done.', 'Assuming they were not done without asking.', 'Planning the return from the later five-day break alone.']),
    domainNotes: 'Day 0 is Thursday (offset +02:00). Break A 2027-01-21 to 2027-01-23; sessions between on 2027-01-25, 2027-01-26 and 2027-01-28; break B 2027-01-29 to 2027-02-02.',
  };
});

// ===================== BUILD -> TAPER -> RACE -> AFTER (HALF MARATHON) =====================

// F27 half marathon: late sync of the build, a shortened hard run in the taper, race week, after the race
K((id) => ({
  authorIntent: 'Half-marathon build for an intermediate runner with a shortened, harder-than-planned run in the taper week, then the race and the plan after it. Probes that a taper response adds nothing and keeps the race, and that the week after a half marathon is recovery.',
  coverageTags: ['COLD_START', 'RUN_FIRST', 'RACE_HALF', 'H8', 'TAPER', 'TAPER_ANSWER', 'RACE_WEEK', 'POST_RACE', 'SHORTENED_RUNS','RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'LATE_REPORTER', 'TIMEZONE'],
  oracleClass: DOM,
  intake: intake({ asOf: '2027-02-27', start: '2027-03-01', weeks: 8, tz: -180, athlete: { id: 'ath-f27-camila', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 4, runMinutesPerWeek: 220, longestRunMinutes: 110, strengthDaysPerWeek: 1 }, performanceAnchors: [{ kind: 'RACE_RESULT', distance: 'HALF_MARATHON', minutes: 125, date: '2026-11-15' }], goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: '2027-04-18', timeGoalMinutes: 120 } }, strength: 'RUNNING_SUPPORT' }, equipment: ['BODYWEIGHT', 'DUMBBELLS'] }, schedule: { runDays: [0, 2, 4, 6], strengthDays: [1, 3], runMinutes: 50, strengthMinutes: 30, longRunDay: 6, longRunMinutes: 130 } }),
  timeline: [
    step('s1', at(4, 6, '21:00'), review(), { observations: [each([1, 2, 3, 4], 'RUN'), each([1, 2, 3, 4], 'STRENGTH')], note: 'Sync of weeks 1 to 4.' }),
    step('s2', at(5, 3, '07:00'), { kind: 'UNDERPERFORMANCE' }, { targetRef: R(5, 'RUN', 2), observations: [{ ref: R(5, 'RUN', 2), completed: true, fraction: 0.7, response: { performance: 'UNDER', effort: 'HARDER', recovery: 'COMPATIBLE', nextDayFunction: 'NORMAL' } }], note: 'Taper session cut to 70% because it felt hard (warm, humid morning).' }),
    step('s3', at(6, 6, '21:00'), review(), { observations: [each([6], 'RUN', ['EASY', 'RACE_TOUCH', 'SHAKEOUT', 'RECOVERY_EASY', 'QUALITY']), { ref: R(6, 'RUN', 6, 'RACE'), completed: true, minutes: 127, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }, each([6], 'STRENGTH')] }),
  ],
  expectedDomainProperties: [
    E('f27-e1', 'GENERATE', DOM, ST('PROPOSED'), 'Plannable.'),
    E('f27-e2', 'GENERATE', DOM, PRES([6], 'RUN', ['RACE']), 'Race on 2027-04-18.'),
    E('f27-e3', 'GENERATE', DOM, PH(6, 'RACE_WEEK'), 'Race week.'),
    E('f27-e4', 'GENERATE', DOM, CMP('LONG', 5, '<=', 3), 'The long run of the week before the race is not longer than a build-week long run.'),
    E('f27-e5', 's2', DOM, ST('KEEP', 'MODIFY'), 'A nonclinical underperformance in the taper is planned around.'),
    E('f27-e6', 's2', DOM, PRES([6], 'RUN', ['RACE']), 'The race stays.'),
    E('f27-e7', 's2', DOM, J('A single hard, shortened taper run adds no make-up load and no extra quality; the remaining taper is kept or eased.'), 'Taper response.'),
    E('f27-e8', 's3', DOM, PH(7, 'POST_EVENT', 'NEXT_BLOCK', 'RETURN'), 'After the race.'),
    E('f27-e9', 's3', DOM, ABS([7], 'RUN', ['QUALITY', 'LONG']), 'No quality and no long run in the first week after a half marathon.'),
  ],
  metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's3' }, { relation: 'CALENDAR_SHIFT' }],
  independentAssessment: ia(
    'Camila ran 2:05 and aims at 2:00. Her build was synced late but complete. One humid taper session felt hard; that is not a reason to add or to change the race.',
    'Keep the taper, perhaps easing the next session, keep the race, then plan an easy recovery week without quality or a long run.',
    ['Asking how she slept or felt (nonclinical) before the race touch.', 'A post-race week of short easy runs and light strength.'],
    ['Adding a session to make up for the cut run.', 'Removing the race touch or the race.', 'A long run or intervals in the week after the race.']),
  domainNotes: 'Offset -03:00. Race 2027-04-18 is week 6 day 6. Week 0 never reported (no month-long silence).',
}));

// ===================== SEPARATE BREAKS WITH TRAINING BETWEEN =====================

// F28 isolated training between a long holiday and a short trip; the trip later corrected by name to start later, uncovering unreported sessions
K((id) => {
  const c = cal('2026-12-07', 0);
  const A = { ...brk(c.d(2, 0), c.d(3, 6), 'VACATION', 'two-week holiday'), episodeId: 'hol-dec' };
  const B = { ...brk(c.d(4, 3), c.d(4, 6), 'TRAVEL', 'short work trip'), episodeId: 'trip-jan' };
  const tl = [
    step('s1', at(4, 0, '08:00'), { kind: 'SCHEDULE_CHANGE', changes: { runTurn: 'PM' }, interruption: A }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH')] }),
    step('s2', at(4, 6, '21:00'), review({ interruption: B }), { observations: [miss(R(4, 'STRENGTH', 0)), done(R(4, 'RUN', 1))] }),
    step('s3', at(5, 2, '08:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...brk(c.d(4, 5), c.d(4, 6), 'TRAVEL', 'short work trip; I only left on Saturday'), episodeId: 'trip-jan' } }, { observations: [done(R(5, 'STRENGTH', 0)), done(R(5, 'RUN', 1))] }),
    step('s4', at(5, 6, '21:00'), review(), { observations: [miss(R(4, 'STRENGTH', 3)), { ref: R(4, 'RUN', 4), completed: true, fraction: 0.6 }, done(R(5, 'STRENGTH', 3)), done(R(5, 'RUN', 4)), done(R(5, 'RUN', 6))], note: 'Asked about the uncovered sessions: Thursday strength not done, Friday run cut short.' }),
  ];
  const vTl = JSON.parse(JSON.stringify(tl)); vTl[1].observations[1] = miss(R(4, 'RUN', 1));
  return {
    authorIntent: 'Two weeks of holiday, one run, then a short trip: the single run must not end a three-week stop. After the return, the trip is corrected by name to start later, which uncovers sessions between the breaks that were never reported.',
    coverageTags: ['RETURN_MODERATE', 'TRAVEL', 'SCHEDULE_CHANGE', 'CORRECTION', 'SHORTENED_RUNS', 'LATE_REPORTER', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'SKIPPED_REVIEW'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-12-05', start: '2026-12-07', weeks: 12, tz: 0, athlete: { id: 'ath-f28-ollie', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 75, strengthDaysPerWeek: 2 }, goals: { run: 'REGULAR', strength: 'GENERAL' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT', 'PULL_UP_BAR'] }, schedule: { runDays: [1, 4, 6], strengthDays: [0, 3], runMinutes: 45, strengthMinutes: 45, longRunDay: 6, longRunMinutes: 80 } }),
    timeline: tl,
    expectedDomainProperties: [
      E('f28-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f28-e2', 's1', INV, NP, 'No valid plan.'),
      E('f28-e3', 's2', DOM, ST('MODIFY'), 'A separate named break with all sessions between reported: the return is applied.'),
      E('f28-e4', 's2', DOM, J('One run between the holiday and the trip, with the strength session missed, does not end the stop: the return is read through the holiday, from 2026-12-21 to 2027-01-10 (21 days), and is dosed as such; the single run is not proof of restored capacity.'), 'Isolated training between breaks (R7D-INTERFACE-5/6).'),
      E('f28-e5', 's2', DOM, ABS([5], 'RUN', ['QUALITY']), 'No harder running in the first week after a three-week stop.'),
      E('f28-e6', 's3', INV, QK('TRAINING_BETWEEN_BREAKS'), 'The corrected later start uncovers planned sessions with no report: they are asked about first (R7D-INTERFACE-7).'),
      E('f28-e7', 's3', INV, NP, 'No return dose before the answer.'),
      E('f28-e8', 's4', DOM, ST('MODIFY', 'KEEP'), 'The answer completes the facts.'),
      E('f28-e9', 's4', DOM, VALID, 'Nothing pending.'),
      E('f28-e10', 's4', DOM, J('The run of 2027-01-05 and the shortened run of 2027-01-08 remain isolated training: no whole week was executed, so the stop is still read through the holiday and nothing is presented as restored fitness.'), 'Training short of a whole week.'),
    ],
    metamorphicRelations: [
      { relation: 'VARIANT', variant: { timeline: vTl }, compareAtStep: 's2', expect: 'NOT_HIGHER_RUN_LOAD', rationale: 'If the single run between the breaks had not been done, the return can be no more aggressive than with it.' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 's4' },
    ],
    independentAssessment: ia(
      'Ollie had two weeks off, ran once, then went on a short trip. One run does not undo two weeks off. When he later says he left on Saturday, two sessions appear between the breaks that he never reported.',
      'Keep the holiday, apply both breaks at the review as one stop through the holiday with a moderate return; on the corrected trip ask about the uncovered sessions; with one partial run and a missed lift, keep the same conservative reading.',
      ['A return of two weeks at reduced volume.', 'Asking whether the partial run was cut for a nonclinical reason.'],
      ['Treating the single run as a re-entry and returning from the short trip alone.', 'Ignoring the uncovered sessions or guessing them.', 'Adding up days beyond the actual stop.']),
    domainNotes: 'Holiday 2026-12-21 to 2027-01-03; run 2027-01-05; trip first 2027-01-07 to 2027-01-10, corrected to 2027-01-09 to 2027-01-10. Uncovered: strength 2027-01-07, run 2027-01-08.',
  };
});

// F29 a whole week executed in both sports between the breaks; the later break states a start time on the day of that week's last session; corrected by length and last day only
K((id) => {
  const c = cal('2027-01-04', 60);
  const ob = '2026-12-30T18:00:00+01:00';
  const A = { ...brk(c.d(1, 3), c.d(2, 2), 'WORK', 'site visit'), episodeId: 'site-a' };
  const B = { ...brk(c.d(3, 6), c.d(4, 4), 'TRAVEL', 'flight for a family trip'), startedAt: c.ts(3, 6, '15:00'), episodeId: 'trip-b' };
  return {
    authorIntent: 'Between a work break and a family trip the athlete executes one whole plan week in both sports, every session as prescribed; the trip states a start time on the day of that week\'s long run, which was done that morning. Later the trip is corrected by name with only its length and last day.',
    coverageTags: ['GYM', 'TRAVEL', 'UNAVAILABLE_DAY', 'CORRECTION', 'RETURN_SHORT', 'LATE_REPORTER', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-01-02', start: '2027-01-04', weeks: 12, tz: 60, athlete: { id: 'ath-f29-ana', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 75, strengthDaysPerWeek: 2 }, knownExercises: [kex('back-squat', 3, 6, 70, 'TOTAL', 2, ob), kex('barbell-rdl', 3, 8, 60, 'TOTAL', 2, ob), kex('db-bench-press', 3, 10, 18, 'PER_HAND', 2, ob), kex('one-arm-db-row', 3, 10, 20, 'PER_HAND', 2, ob)], goals: { run: 'REGULAR', strength: 'STRENGTH' }, equipment: ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'BODYWEIGHT'] }, schedule: { runDays: [0, 2, 6], strengthDays: [1, 4], runMinutes: 45, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 80 } }),
    timeline: [
      step('s1', at(2, 3, '08:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(3, 3)] }, interruption: A }, { observations: [each([0], 'RUN'), each([0], 'STRENGTH'), done(R(1, 'RUN', 0)), done(R(1, 'STRENGTH', 1)), done(R(1, 'RUN', 2))] }),
      step('s2', at(4, 6, '20:00'), review({ interruption: B }), { observations: [done(R(2, 'STRENGTH', 4)), done(R(2, 'RUN', 6)), done(R(3, 'RUN', 0)), done(R(3, 'STRENGTH', 1)), done(R(3, 'RUN', 2)), done(R(3, 'STRENGTH', 4)), done(R(3, 'RUN', 6, 'LONG'), { observedAt: c.ts(3, 6, '07:30') }), done(R(4, 'RUN', 6))] }),
      step('s3', at(5, 3, '07:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { episodeId: 'trip-b', days: 5, endDate: c.d(4, 4), reasonCategory: 'TRAVEL', reason: 'family trip; the flight was on Monday after all', nonclinical: true } }, { observations: [done(R(5, 'RUN', 0)), done(R(5, 'STRENGTH', 1)), done(R(5, 'RUN', 2))] }),
    ],
    expectedDomainProperties: [
      E('f29-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f29-e2', 's1', INV, NP, 'No valid plan.'),
      E('f29-e3', 's2', DOM, ST('MODIFY'), 'Two separate named breaks with everything between reported.'),
      E('f29-e4', 's2', DOM, J('Week 3 lies wholly between the breaks (its long run was done at 07:30, before the 15:00 start) and was executed completely in both sports: the athlete re-entered, the site visit is history, and the return is classed by the six-day trip alone, resuming from the doses executed (presented as resumed training, never as restored fitness).'), 'Whole-week re-entry (R7D-INTERFACE-6 section 1).'),
      E('f29-e5', 's3', DOM, ST('MODIFY', 'KEEP'), 'A correction of the latest break by name.'),
      E('f29-e6', 's3', DOM, VALID, 'Nothing pending.'),
      E('f29-e7', 's3', DOM, J('The corrected trip runs 2027-02-01 to 2027-02-05, read from its length and last day; the earlier break is not re-read as a stop and week 3 remains the re-entry week.'), 'Correction by length and last day (R7D-INTERFACE-6 section 2).'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }, { relation: 'LOAD_CONVENTION_EQUIVALENT' }],
    independentAssessment: ia(
      'Ana trained a complete week, both sports exactly as planned, between a work trip and a family trip, and she ran long on the morning she flew out. That is clear evidence she resumed; the return should reflect only the second trip.',
      'Apply the return for the six-day trip from the executed week-3 doses; on the correction accept the new dates (Monday to Friday) and keep the same reading.',
      ['A one-week short return.', 'Asking to confirm the flight time if it had been missing (it is given).'],
      ['Reading the stop through the site visit despite the complete week.', 'Treating the morning long run as inside the trip.', 'Re-opening the site visit on the correction.']),
    domainNotes: 'Site visit 2027-01-14 to 2027-01-20; week 3 is 2027-01-25 to 2027-01-31; trip first 2027-01-31 15:00 to 2027-02-05, corrected to 5 days ending 2027-02-05.',
  };
});

// F30 every run of the week between done, strength missed (own return); strength on the earlier break's first day reported late; return mid-week; start time answered in a return report
K((id) => {
  const c = cal('2026-11-16', -300);
  const A = { ...brk(c.d(2, 0), c.d(2, 5), 'FAMILY', 'family wedding abroad'), episodeId: 'fam-1' };
  return {
    authorIntent: 'Runs of the week between two breaks all done, strength missed: the earlier break must be read as its own return for strength. The return is reported on a Friday after a missed Thursday run. A strength session on the earlier break\'s first day is then reported late without a time; the start time is answered in a return report.',
    coverageTags: ['RETURN_SHORT', 'LATE_REPORTER', 'SCHEDULE_CHANGE', 'MIXED_EXECUTION', 'RUN_FIRST', 'RACE_HALF', 'H16', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-14', start: '2026-11-16', weeks: 16, tz: -300, athlete: { id: 'ath-f30-ben', runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 160, longestRunMinutes: 80, strengthDaysPerWeek: 0 }, goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: '2027-02-28' } }, strength: 'RUNNING_SUPPORT' }, equipment: ['DUMBBELLS', 'BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [1, 3, 6], strengthDays: [0, 4], runMinutes: 50, strengthMinutes: 35, longRunDay: 6, longRunMinutes: 120 } }),
    timeline: [
      step('s1', at(2, 6, '07:00'), { kind: 'SCHEDULE_CHANGE', changes: { strengthTurn: 'PM' }, interruption: A }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH')] }),
      step('s2', at(4, 4, '07:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...brk(c.d(4, 0), c.d(4, 1), 'WORK', 'two-day off-site'), episodeId: 'work-1' } }, { observations: [done(R(2, 'RUN', 6)), done(R(3, 'RUN', 1)), done(R(3, 'RUN', 3)), done(R(3, 'RUN', 6)), miss(R(3, 'STRENGTH', 0)), miss(R(3, 'STRENGTH', 4)), miss(R(4, 'RUN', 3))], note: 'Return reported on Friday; the Thursday run was not done.' }),
      step('s3', at(4, 6, '21:00'), review(), { observations: [done(R(4, 'STRENGTH', 4)), done(R(4, 'RUN', 6)), { ref: R(2, 'STRENGTH', 0), completed: true, asPrescribed: true, reportedAt: c.ts(4, 6, '20:55'), eventId: 'f30-w2d0-str' }], note: 'He remembers he lifted on the morning of the wedding trip, no time given.' }),
      step('s4', at(5, 1, '07:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...A, startedAt: c.ts(2, 0, '11:00') } }, { observations: [done(R(5, 'STRENGTH', 0))], note: 'Answer: the trip started at 11:00, after the session.' }),
    ],
    expectedDomainProperties: [
      E('f30-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f30-e2', 's1', INV, NP, 'No valid plan.'),
      E('f30-e3', 's2', DOM, ST('MODIFY'), 'Separate named breaks with everything between reported.'),
      E('f30-e4', 's2', DOM, J('Week 3 counts for running only (every run done, strength missed): the wedding trip is read as its own return; running resumes from what week 3 executed; strength continues from that own return and gets no step it did not earn; the missed Thursday run of week 4 never counts as done for the longest-run limit.'), 'One-sport week and mid-week return (R7D-INTERFACE-6).'),
      E('f30-e5', 's2', DOM, PRES([14], 'RUN', ['RACE']), 'The race goal stands.'),
      E('f30-e6', 's3', DOM, ST('ASK'), 'A strength session on the earlier break\'s first day without a time changes the state strength starts from: the break\'s start time is asked.'),
      E('f30-e7', 's3', DOM, J('The coach asks for the start time of fam-1 (or first confirms the latest break) instead of guessing whether the session was before the trip.'), 'R7D-INTERFACE-6/7 start-time question.'),
      E('f30-e8', 's4', DOM, ST('MODIFY', 'KEEP'), 'The answer in a return report is applied.'),
      E('f30-e9', 's4', DOM, VALID, 'Nothing pending.'),
      E('f30-e10', 's4', DOM, J('With the trip starting at 11:00, the session that morning is training done before the break; it informs strength\'s starting state but is never a re-entry by itself.'), 'Answer read as the break\'s report.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Ben kept running between his two trips but skipped every lift. Running has shown it resumed; strength has not. Later he remembers a lift on the morning he left, which matters only if it came before the trip started.',
      'Read the wedding trip as its own return: running continues from the executed week, strength from the own return. Ignore the missed Thursday run when setting the long run. Ask the start time once the late lift arrives; with 11:00 given, count the lift as pre-break training.',
      ['Asking first to confirm the off-site dates, then the start time.', 'Holding strength at the own-return level for an extra week.'],
      ['Restoring strength progression because running resumed.', 'Counting the missed Thursday run as done.', 'Guessing the order of the lift and the trip.']),
    domainNotes: 'Wedding trip 2026-11-30 to 2026-12-05 (Monday lift that morning); week 3 2026-12-07 to 2026-12-13; off-site 2026-12-14 to 2026-12-15; Thursday 2026-12-17 run missed; return Friday 2026-12-18.',
  };
});

// F31 strength of the week between logged without reps in reserve; late report of a lift on the earlier break's first day; latest break confirmed first; start time sent with another event; then the week's review
K((id) => {
  const c = cal('2026-11-25', 330);
  const ob = '2026-11-21T19:00:00+05:30';
  const A = { ...brk(c.d(1, 1), c.d(2, 0), 'MOVING', 'moving flat'), episodeId: 'move-1' };
  const B = { ...brk(c.d(4, 0), c.d(4, 3), 'FAMILY', 'family visit'), episodeId: 'fam-2' };
  const sets = (reps, kg, k) => Array.from({ length: k }, () => ({ reps, load: { value: kg, unit: 'KG', convention: 'TOTAL' } }));
  const noRir = [{ id: 'back-squat', sets: sets(8, 80, 4) }, { id: 'bench-press', sets: sets(8, 60, 4) }, { id: 'barbell-row', sets: sets(10, 55, 4) }];
  return {
    authorIntent: 'Between a move and a family visit every run is done while strength is first missed and then logged without reps in reserve, so strength has no counting week. Then a lift on the move\'s first day is reported late; the athlete confirms the later break first, sends the start time with an unavailable-day event, and the week\'s review applies it.',
    coverageTags: ['GYM', 'MIXED_EXECUTION', 'LATE_REPORTER', 'UNAVAILABLE_DAY', 'RETURN_SHORT', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'START_NON_MONDAY', 'TIMEZONE'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-24', start: '2026-11-25', weeks: 12, tz: 330, athlete: { id: 'ath-f31-arjun', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2 }, knownExercises: [kex('back-squat', 4, 8, 80, 'TOTAL', 2, ob), kex('bench-press', 4, 8, 60, 'TOTAL', 2, ob), kex('barbell-row', 4, 10, 55, 'TOTAL', 2, ob), kex('barbell-rdl', 3, 10, 70, 'TOTAL', 2, ob)], goals: { run: 'PERFORMANCE', strength: 'HYPERTROPHY' }, equipment: ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'BODYWEIGHT'] }, schedule: { runDays: [0, 3, 5], strengthDays: [1, 4], runMinutes: 50, strengthMinutes: 60, longRunDay: 3, longRunMinutes: 80 } }),
    timeline: [
      step('s1', at(2, 1, '08:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(4, 0)] }, interruption: A }, { observations: [each([0], 'RUN'), each([0], 'STRENGTH'), done(R(1, 'RUN', 0))] }),
      step('s2', at(4, 6, '21:00'), review({ interruption: B }), { observations: [miss(R(2, 'STRENGTH', 1)), done(R(2, 'RUN', 3)), miss(R(2, 'STRENGTH', 4)), done(R(2, 'RUN', 5)), done(R(3, 'RUN', 0)), done(R(3, 'RUN', 3)), done(R(3, 'RUN', 5)), { ref: R(3, 'STRENGTH', 1), completed: true, exercises: noRir }, { ref: R(3, 'STRENGTH', 4), completed: true, exercises: noRir }, done(R(4, 'STRENGTH', 4)), done(R(4, 'RUN', 5))], note: 'Both week-2 lifts missed while unpacking; week-3 lifts logged with reps and loads but no reps in reserve.' }),
      step('s3', at(5, 6, '21:00'), review(), { observations: [each([5], 'RUN'), each([5], 'STRENGTH'), { ref: R(1, 'STRENGTH', 1), completed: true, asPrescribed: true, reportedAt: c.ts(5, 6, '20:50'), eventId: 'f31-w1d1-str' }], note: 'He remembers the Thursday lift before the movers came, no time given.' }),
      step('s4', at(6, 0, '07:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: B }, { note: 'He confirms the family visit first, with exactly the same facts.' }),
      step('s5', at(6, 1, '07:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(6, 5)] }, interruption: { ...A, startedAt: c.ts(1, 1, '14:00') } }, { note: 'The start time of the move (14:00) sent with an unavailable-day request.' }),
      step('s6', at(6, 6, '21:00'), review(), { observations: [each([6], 'RUN'), each([6], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f31-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f31-e2', 's1', INV, NP, 'No valid plan.'),
      E('f31-e3', 's2', DOM, ST('MODIFY'), 'Separate named breaks with everything between reported.'),
      E('f31-e4', 's2', DOM, J('Strength logged without reps in reserve never counts a week for strength; week 3 counts for running only: the move is read as its own return, running resumes from what was executed and strength continues from the move\'s own return without an unearned step.'), 'R7D-INTERFACE-6 section 1.'),
      E('f31-e5', 's3', DOM, ST('ASK'), 'A late lift on the move\'s first day without a time: the start time (or first a confirmation of the latest break) is asked.'),
      E('f31-e6', 's4', DOM, ST('ASK', 'MODIFY', 'KEEP'), 'Restating the latest break with the same facts is the same declaration.'),
      E('f31-e7', 's4', DOM, J('The identical restatement of fam-2 applies nothing new; if the start time of move-1 is still missing it is asked again.'), 'R7D-INTERFACE-4 and 7.'),
      E('f31-e8', 's5', DOM, J('The restated move with its 14:00 start is recorded as that break\'s report, never as a break of its own; the unavailable day is handled without inventing a session on another day.'), 'Answer sent with another kind of event.'),
      E('f31-e9', 's6', DOM, ST('MODIFY', 'KEEP'), 'The week\'s review applies what is pending.'),
      E('f31-e10', 's6', DOM, VALID, 'Nothing pending after the review.'),
    ],
    metamorphicRelations: [{ relation: 'RESEND', atStep: 's4' }, { relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }],
    independentAssessment: ia(
      'Arjun ran every session between his move and the family visit but missed his first two lifts and logged the next ones without reserve, so the coach cannot tell whether strength was really at prescription. A late-remembered lift on moving day matters only if it preceded the move.',
      'Treat running as resumed and strength as continuing from the move\'s own return; ask the start time after the late lift; accept the same-facts confirmation without change; record the start time sent with the unavailable day and apply it at the next review, with the unavailable session dropped.',
      ['Asking to confirm the family visit before the start time.', 'Prompting him to log reserve on future lifts.'],
      ['Counting the week-3 lifts as a strength re-entry.', 'Treating the restated move as a third break.', 'Moving the unavailable session to an unchosen day.']),
    domainNotes: 'Day 0 is Wednesday (offset +05:30). Move 2026-12-03 (Thursday lift that morning) to 2026-12-09; week 3 2026-12-16 to 2026-12-22; family visit 2026-12-23 to 2026-12-26.',
  };
});

// ===================== RACE WEEK BETWEEN TWO BREAKS =====================

// F32 10K race week between a work trip and a post-race holiday: race touch at half its minutes, optional shakeout undone, race finished, strength done
K((id) => {
  const c = cal('2027-02-01', 0);
  return {
    authorIntent: 'A work trip in the week before a 10K (stated with a systemic fatigue report), the race week between it and a post-race holiday: the race touch done at half its minutes, the optional shakeout left undone, the race finished, strength done in full. Probes per-sport counting of a race week.',
    coverageTags: ['RACE_10K', 'RACE_WEEK', 'POST_RACE', 'FATIGUE_SYSTEMIC', 'SHORTENED_RUNS', 'RETURN_SHORT', 'LATE_REPORTER', 'RUN_FIRST', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'KETTLEBELL', 'SKIPPED_REVIEW'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-01-30', start: '2027-02-01', weeks: 8, tz: 0, athlete: { id: 'ath-f32-imogen', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 160, longestRunMinutes: 75, strengthDaysPerWeek: 2 }, performanceAnchors: [{ kind: 'RACE_RESULT', distance: '10K', minutes: 53, date: '2026-11-21' }], goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-03-07', timeGoalMinutes: 51 } }, strength: 'MAINTAIN' }, equipment: ['DUMBBELLS', 'BODYWEIGHT', 'KETTLEBELL'] }, schedule: { runDays: [1, 3, 6], strengthDays: [0, 4], runMinutes: 45, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 80 } }),
    timeline: [
      step('s1', at(3, 6, '09:00'), { kind: 'SYSTEMIC_FATIGUE', signals: { region: 'ALL' }, interruption: brk(c.d(3, 1), c.d(3, 5), 'WORK', 'work trip, no training') }, { observations: [each([0, 1, 2], 'RUN'), each([0, 1, 2], 'STRENGTH')], note: 'Back from the work trip feeling drained.' }),
      step('s2', at(5, 5, '08:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...brk(c.d(5, 0), c.d(5, 4), 'VACATION', 'post-race holiday'), episodeId: 'after-race' } }, { observations: [done(R(3, 'RUN', 6)), each([4], 'STRENGTH'), each([4], 'RUN', ['RACE_TOUCH'], { completed: true, fraction: 0.5 }), each([4], 'RUN', ['SHAKEOUT'], { completed: false }), each([4], 'RUN', ['EASY', 'RECOVERY_EASY']), { ref: R(4, 'RUN', 6, 'RACE'), completed: true, minutes: 52, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }] }),
      step('s3', at(5, 6, '20:00'), review(), { observations: [done(R(5, 'RUN', 6))] }),
    ],
    expectedDomainProperties: [
      E('f32-e1', 's1', INV, ST('ASK'), 'Break stated with a fatigue report: kept, asked on its own.'),
      E('f32-e2', 's1', INV, NP, 'No valid plan.'),
      E('f32-e3', 's2', DOM, ST('MODIFY'), 'Separate named break with the weeks between reported.'),
      E('f32-e4', 's2', DOM, J('The race touch done at half its minutes is not done, so the race week does not count for running even though the race was finished; the undone optional shakeout decides nothing; strength done in full counts that week for strength only. The work trip is therefore read as its own return for running, with no restored fitness claimed.'), 'Race-week counting per sport (R7D-INTERFACE-6 section 1).'),
      E('f32-e5', 's2', DOM, ABS([6], 'RUN', ['QUALITY']), 'No harder running right after a 10K and a holiday.'),
      E('f32-e6', 's3', DOM, VALID, 'A review that states no break keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Imogen missed most of her taper week on a work trip, cut her race touch in half, skipped the optional shakeout, still finished the 10K, kept lifting, then went on holiday. The race says nothing about restored training capacity by itself.',
      'Apply the holiday with a short, easy return; read running as continuing from the work trip\'s own return and strength from its executed race-week session; no quality in the first week back.',
      ['A fully easy post-race week before any next block.', 'Asking how she felt after the race.'],
      ['Counting the half race touch as done.', 'Treating the finished race as proof that full training load can resume.', 'Letting the undone optional shakeout hold the week.']),
    domainNotes: 'Work trip 2027-02-23 to 2027-02-27; race week 2027-03-01 to 2027-03-07 (race 2027-03-07); holiday 2027-03-08 to 2027-03-12. If the coach plans no race touch or shakeout, the bulk facts for them expand to nothing.',
  };
});

// F33 half-marathon race week between two breaks: strength and the shakeout recover adversely, race touch and race go well
K((id) => {
  const c = cal('2027-02-15', -360);
  return {
    authorIntent: 'A half-marathon race week between a work crunch and a trip to friends: the race touch and the race go well, but the strength session and the optional shakeout both report an adverse recovery. Converging adverse responses across sports must hold the week in both sports.',
    coverageTags: ['RACE_HALF', 'RACE_WEEK', 'POST_RACE', 'ADVERSE_RESPONSE', 'RETURN_SHORT', 'SCHEDULE_CHANGE', 'TRAVEL', 'RUN_FIRST', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'TIMEZONE', 'LATE_REPORTER'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-02-13', start: '2027-02-15', weeks: 8, tz: -360, athlete: { id: 'ath-f33-diego', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 4, runMinutesPerWeek: 230, longestRunMinutes: 110, strengthDaysPerWeek: 1 }, performanceAnchors: [{ kind: 'RACE_RESULT', distance: 'HALF_MARATHON', minutes: 119, date: '2026-11-22' }], goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: '2027-03-14', timeGoalMinutes: 116 } }, strength: 'RUNNING_SUPPORT' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT'] }, schedule: { runDays: [1, 3, 6], strengthDays: [2], runMinutes: 55, strengthMinutes: 35, longRunDay: 6, longRunMinutes: 120 } }),
    timeline: [
      step('s1', at(2, 5, '08:00'), { kind: 'SCHEDULE_CHANGE', changes: { runTurn: 'PM' }, interruption: { ...brk(c.d(2, 0), c.d(2, 4), 'WORK', 'crunch week, no training'), episodeId: 'crunch' } }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH')] }),
      step('s2', at(4, 5, '08:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...brk(c.d(4, 1), c.d(4, 4), 'TRAVEL', 'visiting friends after the race'), episodeId: 'visit' } }, { observations: [done(R(2, 'RUN', 6)), each([3], 'RUN', ['RACE_TOUCH'], { completed: true, asPrescribed: true, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }), each([3], 'RUN', ['SHAKEOUT'], { completed: true, asPrescribed: true, response: { recovery: 'ADVERSE' } }), each([3], 'STRENGTH', null, { completed: true, asPrescribed: true, response: { recovery: 'ADVERSE' } }), each([3], 'RUN', ['EASY', 'RECOVERY_EASY']), { ref: R(3, 'RUN', 6, 'RACE'), completed: true, minutes: 118, response: { performance: 'COMPATIBLE', effort: 'ON_TARGET', recovery: 'COMPATIBLE' } }] }),
      step('s3', at(4, 6, '20:00'), review(), { observations: [done(R(4, 'RUN', 6))] }),
    ],
    expectedDomainProperties: [
      E('f33-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f33-e2', 's1', INV, NP, 'No valid plan.'),
      E('f33-e3', 's2', DOM, ST('MODIFY'), 'Separate named breaks with the weeks between reported.'),
      E('f33-e4', 's2', DOM, J('Adverse recovery in the strength session and in the shakeout converge across sports: the race week re-enters neither sport, although the race touch and race went well; the return is no more aggressive than one read through the crunch week, and nothing is presented as restored fitness.'), 'R7D-INTERFACE-7 section 1.'),
      E('f33-e5', 's2', DOM, ABS([5], 'RUN', ['QUALITY', 'LONG']), 'No quality or long run in the first full week after a half marathon and a trip.'),
      E('f33-e6', 's3', DOM, VALID, 'A review that states no break keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's2' }, { relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Diego raced well, but both his strength session and his shakeout left him recovering poorly that week: a whole-body signal, not a one-sport blip. Coming back from a trip after a half marathon, he needs an easy return.',
      'Apply the trip as a return without treating the race week as a re-entry in either sport; plan easy running and light strength for the first week back.',
      ['Asking how he recovered from the race itself.', 'A full recovery week before any next block.'],
      ['Counting the race week for running because the touch and race went well.', 'Ignoring the shakeout\'s adverse recovery because shakeouts are optional.', 'A long run or quality right after.']),
    domainNotes: 'Crunch 2027-03-01 to 2027-03-05; race week 2027-03-08 to 2027-03-14 (race 2027-03-14); trip 2027-03-16 to 2027-03-19. Whether the race week holds only the touch, a shakeout and the race is the coach\'s plan; bulk facts expand to the sessions it has.',
  };
});

// ===================== CHAINS OF THREE BREAKS =====================

// F34 three breaks: a run-only week between the first two, a race week with the race missed and strength done between the last two
K((id) => {
  const c = cal('2026-11-30', -420);
  return {
    authorIntent: 'Three separate named breaks in a chain: between the first two only running is done in full; between the last two the race week has strength done and the race missed. No week counts in both sports.',
    coverageTags: ['RACE_10K', 'RACE_WEEK', 'MIXED_EXECUTION', 'SCHEDULE_CHANGE', 'UNAVAILABLE_DAY', 'RETURN_SHORT', 'RUN_FIRST', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'TIMEZONE', 'LATE_REPORTER'],
    oracleClass: DOM,
    intake: intake({ asOf: '2026-11-28', start: '2026-11-30', weeks: 12, tz: -420, athlete: { id: 'ath-f34-kim', runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2 }, goals: { run: { kind: 'RACE', event: { kind: '10K', date: '2027-01-17' } }, strength: 'MAINTAIN' }, equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [1, 3, 6], strengthDays: [2, 4], runMinutes: 45, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 80 } }),
    timeline: [
      step('s1', at(3, 6, '21:00'), { kind: 'SCHEDULE_CHANGE', changes: { strengthTurn: 'PM' }, interruption: { ...brk(c.d(2, 0), c.d(2, 6), 'WORK', 'year-end deadline'), episodeId: 'chain-1' } }, { observations: [each([0, 1], 'RUN'), each([0, 1], 'STRENGTH'), done(R(3, 'RUN', 1)), done(R(3, 'RUN', 3)), done(R(3, 'RUN', 6)), miss(R(3, 'STRENGTH', 2)), miss(R(3, 'STRENGTH', 4))] }),
      step('s2', at(6, 0, '08:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(6, 5)] }, interruption: { ...brk(c.d(4, 0), c.d(5, 6), 'VACATION', 'holidays with family'), episodeId: 'chain-2' } }),
      step('s3', at(7, 4, '08:00'), { kind: 'RETURN_AFTER_PAUSE', interruption: { ...brk(c.d(7, 0), c.d(7, 3), 'FAMILY', 'family visit'), episodeId: 'chain-3' } }, { observations: [each([6], 'STRENGTH'), each([6], 'RUN', ['RACE_TOUCH', 'EASY', 'RECOVERY_EASY', 'SHAKEOUT']), miss(R(6, 'RUN', 6, 'RACE'))], note: 'The race was missed (roads closed by snow); strength that week done in full.' }),
      step('s4', at(7, 6, '20:00'), review(), { observations: [done(R(7, 'STRENGTH', 4)), done(R(7, 'RUN', 6))] }),
    ],
    expectedDomainProperties: [
      E('f34-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f34-e2', 's1', INV, NP, 'No valid plan.'),
      E('f34-e3', 's2', INV, ST('ASK'), 'Another event while a break is kept: asked; the newer named break is kept too.'),
      E('f34-e4', 's2', INV, NP, 'No valid plan.'),
      E('f34-e5', 's3', DOM, ST('MODIFY'), 'All three breaks named and the weeks between reported.'),
      E('f34-e6', 's3', DOM, J('Week 3 counts for running only and the race week (race missed, strength done) for strength only; no week counts in both sports, so neither sport gets a step it did not earn, the breaks\' days are never added up, and nothing is presented as restored fitness.'), 'Chain of separate breaks, per-sport weeks.'),
      E('f34-e7', 's4', DOM, VALID, 'A review that states no break keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's3' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Kim kept running through one week, then took two weeks of holidays, lifted but missed the race in the next week, then visited family. Each sport has evidence of continuity in a different week; neither has a week that shows both.',
      'Return conservatively from the latest break, running from what it executed in week 3 and around it, strength from what the race week executed, without restoring the pre-break progression for either.',
      ['Asking whether she wants a new race goal after the missed race.', 'A two-week return.'],
      ['Adding the three breaks\' days into one long stop.', 'Treating the missed race as a failed session to make up.', 'Returning both sports to the pre-break plan.']),
    domainNotes: 'Breaks 2026-12-14 to 2026-12-20, 2026-12-28 to 2027-01-10, 2027-01-18 to 2027-01-21; week 3 2026-12-21 to 2026-12-27; race week 2027-01-11 to 2027-01-17.',
  };
});

// F35 three breaks, the first two touching; a beginner's walk/jog week between the second and third with optional walks undone and strength missed
K((id) => {
  const c = cal('2027-01-17', -600);
  return {
    authorIntent: 'A beginner states two touching breaks through two other events, then a week of walk/jog done in full with the optional walks undone and strength missed, then a third break in the week\'s review. Probes touching breaks as one stop and a one-sport week for a beginner.',
    coverageTags: ['RUN_EXP_NONE', 'STR_EXP_NOVICE', 'WALK_JOG', 'MIXED_EXECUTION', 'SCHEDULE_CHANGE', 'UNAVAILABLE_DAY', 'RETURN_MODERATE', 'BALANCED_HYBRID', 'NON_RACE', 'H12', 'START_NON_MONDAY', 'TIMEZONE', 'LATE_REPORTER'],
    oracleClass: DOM,
    intake: intake({ asOf: '2027-01-16', start: '2027-01-17', weeks: 12, tz: -600, athlete: { id: 'ath-f35-sam', runExperience: 'NONE', strengthExperience: 'NOVICE', recent: { runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0, strengthDaysPerWeek: 1 }, goals: { run: 'REGULAR', strength: 'GENERAL' }, equipment: ['BODYWEIGHT', 'BANDS'] }, schedule: { runDays: [0, 2, 4], strengthDays: [1, 5], runMinutes: 30, strengthMinutes: 30, longRunDay: 0, longRunMinutes: 40 } }),
    timeline: [
      step('s1', at(4, 3, '08:00'), { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [c.d(4, 5)] }, interruption: { ...brk(c.d(3, 0), c.d(3, 3), 'VACATION', 'beach long weekend'), episodeId: 'v1' } }, { observations: [each([0, 1, 2], 'RUN'), each([0, 1, 2], 'STRENGTH')] }),
      step('s2', at(4, 3, '08:10'), { kind: 'SCHEDULE_CHANGE', changes: { runTurn: 'PM' }, interruption: { ...brk(c.d(3, 4), c.d(4, 2), 'FAMILY', 'looking after my nephew'), episodeId: 'v2' } }),
      step('s3', at(6, 6, '19:00'), review({ interruption: { ...brk(c.d(6, 1), c.d(6, 4), 'WORK', 'night shifts'), episodeId: 'v3' } }), { observations: [done(R(4, 'RUN', 4)), miss(R(4, 'STRENGTH', 5)), each([5], 'RUN', ['WALK_JOG', 'EASY', 'LONG', 'QUALITY']), each([5], 'RUN', ['WALK'], { completed: false }), miss(R(5, 'STRENGTH', 1)), miss(R(5, 'STRENGTH', 5)), done(R(6, 'RUN', 0)), done(R(6, 'STRENGTH', 5))] }),
      step('s4', at(7, 6, '19:00'), review(), { observations: [each([7], 'RUN'), each([7], 'STRENGTH')] }),
    ],
    expectedDomainProperties: [
      E('f35-e1', 's1', INV, ST('ASK'), 'Break with another event kind: kept, asked on its own.'),
      E('f35-e2', 's1', INV, NP, 'No valid plan.'),
      E('f35-e3', 's2', INV, ST('ASK'), 'A second named break with another event kind: kept, asked.'),
      E('f35-e4', 's2', INV, NP, 'No valid plan.'),
      E('f35-e5', 's3', DOM, ST('MODIFY'), 'Three named breaks with the days between reported.'),
      E('f35-e6', 's3', DOM, J('The first two breaks touch and form one continuous ten-day stop (2027-02-07 to 2027-02-16); week 5 counts for running only (every walk/jog step done, optional walks deciding nothing, strength missed): running resumes from the walk/jog executed, strength continues from that stop\'s own return without an unearned step.'), 'Touching breaks and a one-sport week for a beginner.'),
      E('f35-e7', 's3', DOM, ABS([7], 'RUN', ['QUALITY']), 'No harder running for a beginner after breaks.'),
      E('f35-e8', 's4', DOM, VALID, 'A review that states no break keeps a valid plan.'),
    ],
    metamorphicRelations: [{ relation: 'PERMUTE_OBSERVATIONS', atStep: 's3' }, { relation: 'CALENDAR_SHIFT' }],
    independentAssessment: ia(
      'Sam is new to running. A long weekend away ran straight into a week of childcare, then a solid week of walk/jog without the optional walks and without strength, then night shifts. The walk/jog week is real progress for running only.',
      'Read the two touching breaks as one stop, credit the walk/jog week to running only, and after the night shifts repeat or gently continue walk/jog and restart strength from its own return level.',
      ['Asking whether the night shifts will continue before progressing.', 'Repeating the last completed walk/jog step.'],
      ['Treating the touching breaks as two short ones.', 'Holding running because optional walks were skipped.', 'Progressing strength as if the week had counted for it.']),
    domainNotes: 'Day 0 is Sunday (offset -10:00). Breaks 2027-02-07 to 2027-02-10 and 2027-02-11 to 2027-02-16 (touching); week 5 is 2027-02-21 to 2027-02-27; night shifts 2027-03-01 to 2027-03-04.',
  };
});

// ===================== OUTPUT =====================
function stepsOf(cs) { return cs.reduce((a, k) => a + k.timeline.length, 0); }
const corpus = { corpusRevision: 'R7D-FINAL-1', cases: CASES };
const text = JSON.stringify(corpus, null, 1) + '\n';
fs.writeFileSync(OUT, text);
const tags = {};
for (const k of CASES) for (const t of k.coverageTags) tags[t] = (tags[t] || 0) + 1;
console.log(JSON.stringify({ out: OUT, cases: CASES.length, steps: stepsOf(CASES), bytes: Buffer.byteLength(text) }));
console.log(CASES.map((k) => k.caseId + ' ' + k.intake.startDate + ' ' + weekday(k.intake.startDate) + ' steps=' + k.timeline.length).join('\n'));
