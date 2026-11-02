// R7-D diagnostic corpus builder (independent case author).
// Plain Node, no imports from the repository. It only constructs JSON and checks the author's own invariants.
// Usage: node build-diagnostic-corpus.mjs   -> writes R7D_DIAGNOSTIC_CORPUS.json next to this file.
import { writeFileSync } from 'node:fs';

// ---------------------------------------------------------------- calendar helpers
const DAY_MS = 86400000;
const WINDOW = { from: '2026-11-03', to: '2027-04-30' };
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * DAY_MS).toISOString().slice(0, 10);
const weekdayName = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(d + 'T00:00:00Z').getUTCDay()];
const offsetStr = (tz) => {
  const sign = tz < 0 ? '-' : '+';
  const a = Math.abs(tz);
  return `${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
};
// a program-relative calendar for one case
const cal = (startDate, tz = 0) => ({
  date: (week, day) => addDays(startDate, 7 * week + day),
  ts: (week, day, time) => `${addDays(startDate, 7 * week + day)}T${time}:00${offsetStr(tz)}`,
  tsAt: (date, time, tzOverride) => `${date}T${time}:00${offsetStr(tzOverride ?? tz)}`,
});

// ---------------------------------------------------------------- intake helpers
const eligOK = (d) => ({ status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false });
const intake = (o) => ({ version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', ...o });
const GYM_FULL = ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'MACHINES', 'PULL_UP_BAR', 'BANDS', 'BODYWEIGHT'];

// ---------------------------------------------------------------- step and fact helpers
const at = (week, day, time) => ({ week, day, time });
const OK = { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' };
// run roles that an athlete can actually "do" (rest-by-design and the race are reported separately)
const RUN_DONE_ROLES = ['EASY', 'LONG', 'QUALITY', 'WALK_JOG', 'WALK', 'RACE_TOUCH', 'SHAKEOUT', 'RECOVERY_EASY'];
const RUN_LIVE_ROLES = ['EASY', 'LONG', 'QUALITY', 'WALK_JOG', 'WALK', 'RACE', 'RACE_TOUCH', 'SHAKEOUT', 'RECOVERY_EASY'];
const runsDone = (weeks, extra = {}) => ({ each: { weeks: [].concat(weeks), sport: 'RUN', roles: RUN_DONE_ROLES }, completed: true, asPrescribed: true, response: OK, ...extra });
const strengthDone = (weeks, extra = {}) => ({ each: { weeks: [].concat(weeks), sport: 'STRENGTH' }, completed: true, asPrescribed: true, response: OK, ...extra });
const review = (stepId, week, day, time, observations, extra = {}) => ({ stepId, at: at(week, day, time), event: { kind: 'WEEKLY_REVIEW' }, observations, ...extra });
const fullWeek = (stepId, week, day, time, sports, extra = {}) => review(stepId, week, day, time, [
  ...(sports.includes('RUN') ? [runsDone(week)] : []),
  ...(sports.includes('STRENGTH') ? [strengthDone(week)] : []),
], extra);

// ---------------------------------------------------------------- expectation helpers
const E = (expectationId, atStep, oracleClass, assert, rationale) => ({ expectationId, atStep, oracleClass, assert, rationale });
const status = (...oneOf) => ({ type: 'STATUS_IN', oneOf });
const validity = (value) => ({ type: 'VALIDITY_IS', value });
const qkind = (value) => ({ type: 'QUESTION_KIND_IS', value });
const noRx = () => ({ type: 'NO_PRESCRIPTION' });
const absent = (weeks, sport, roles) => ({ type: 'ROLE_ABSENT', weeks, sport, roles });
const present = (weeks, sport, roles) => ({ type: 'ROLE_PRESENT', weeks, sport, roles });
const phase = (week, oneOf) => ({ type: 'PHASE_IS', week, oneOf });
const cmp = (role, week, op, otherWeek) => ({ type: 'ROLE_MINUTES_COMPARE', sport: 'RUN', role, week, op, otherWeek });
const judged = (statement) => ({ type: 'JUDGED', statement });
const VALID = 'VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
const RECON = 'REQUIRES_RECONCILIATION';
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const ia = (rationale, preferredCoachingBehavior, acceptableAlternatives, concerns) => ({ rationale, preferredCoachingBehavior, acceptableAlternatives, concerns });
// VARIANT relations: the `expect` value always describes the VARIANT's plan relative to the BASE case's plan.
const variant = (v, compareAtStep, expect, rationale) => ({ relation: 'VARIANT', variant: v, compareAtStep, expect, rationale: `${rationale} (Direction: the variant's plan compared with the base case's plan.)` });

const cases = [];
const meta = {}; // per-case author-side metadata used only by the self-checks below (tz, schedule notes)

// ================================================================ CASES

// ---------------------------------------------------------------- D01 walk/jog beginner builds to a 10K over 16 weeks
{
  const start = '2026-11-11'; const tz = -300; const C = cal(start, tz); // Wednesday start, US Eastern standard time
  const raceDate = C.date(15, 4); // Sunday 2027-02-28 = the long-run day of week 15
  const timeline = [];
  for (const w of range(0, 6)) timeline.push(fullWeek(`w${w}`, w, 6, '20:30', ['RUN', 'STRENGTH']));
  // week 7: work trip, nothing reported, no review. The athlete declares it before the first session of week 8.
  timeline.push({ stepId: 'ret8', at: at(8, 0, '06:00'), event: { kind: 'RETURN_AFTER_PAUSE', interruption: { startDate: C.date(7, 0), endDate: C.date(7, 6), days: 7, reasonCategory: 'WORK', nonclinical: true, reason: 'Work trip all week, no time to train.' } } });
  for (const w of range(8, 14)) timeline.push(fullWeek(`w${w}`, w, 6, '20:30', ['RUN', 'STRENGTH']));
  timeline.push(review('w15', 15, 6, '20:30', [
    { ref: { week: 15, sport: 'RUN', role: 'RACE' }, completed: true, minutes: 74, response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' } },
    runsDone(15), strengthDone(15),
  ]));
  const variantTimeline = timeline.map((s) => s.stepId === 'ret8' ? { ...s, event: { ...s.event, interruption: { ...s.event.interruption, reasonCategory: 'VACATION', reason: 'Short holiday with the kids.' } } } : s);
  meta['R7D-D01'] = { tz, start };
  cases.push({
    caseId: 'R7D-D01',
    authorIntent: 'A 41-year-old who has never run builds from nothing to a 10K over 16 weeks with bodyweight-only running-support strength, a Wednesday start in a negative time zone, and one fully declared nonclinical week off. It probes whether the coach starts with walk/jog, progresses gradually, absorbs a short break without catching up, and lands a taper and race week on the stated date.',
    coverageTags: ['COLD_START', 'RUN_FIRST', 'RACE_10K', 'H16', 'RUN_EXP_NONE', 'STR_EXP_NOVICE', 'WALK_JOG', 'BODYWEIGHT_ONLY', 'LOW_DATA', 'START_NON_MONDAY', 'TIMEZONE', 'RETURN_SHORT', 'TAPER', 'RACE_WEEK', 'POST_RACE'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2026-11-10', startDate: start, weeks: 16, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd01-maya', ageYears: 41, sex: 'F', heightCm: 165, weightKg: 72,
        eligibility: eligOK('2026-11-10'),
        goals: { run: { kind: 'RACE', event: { kind: '10K', date: raceDate } }, strength: 'RUNNING_SUPPORT' },
        runExperience: 'NONE', strengthExperience: 'NOVICE',
        recent: { runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0, strengthDaysPerWeek: 0 },
        equipment: ['BODYWEIGHT'],
      },
      schedule: { runDays: [0, 2, 4], strengthDays: [1, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 40, strengthMinutes: 30, longRunDay: 4, longRunMinutes: 75 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d01-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'A complete, in-scope intake with a race 15+ weeks away is plannable; no fact is missing.'),
      E('d01-e02', 'GENERATE', 'DOMAIN_ORACLE', present([0], 'RUN', ['WALK_JOG', 'WALK']), 'Someone with zero running history should start with walk/jog (or walking), not continuous running.'),
      E('d01-e03', 'GENERATE', 'DOMAIN_ORACLE', absent([0, 1, 2, 3], 'RUN', ['QUALITY']), 'No harder running sessions in the first month for a complete beginner.'),
      E('d01-e04', 'GENERATE', 'DOMAIN_ORACLE', phase(15, ['RACE_WEEK']), 'The race falls on day 4 of week 15.'),
      E('d01-e05', 'GENERATE', 'DOMAIN_ORACLE', present([15], 'RUN', ['RACE']), 'The goal race is part of the plan on its date.'),
      E('d01-e06', 'GENERATE', 'INVARIANT_ORACLE', judged('Every strength exercise in every week is executable with bodyweight only (no implement or machine), and every strength load is BODYWEIGHT.'), 'Equipment is bodyweight only; the repertoire must stay within it.'),
      E('d01-e07', 'GENERATE', 'INVARIANT_ORACLE', judged('Runs appear only on days 0, 2 and 4 and strength only on days 1 and 5 of each week; no other day receives a session.'), 'Chosen days belong to the athlete; no session on an unchosen day.'),
      E('d01-e08', 'GENERATE', 'DOMAIN_ORACLE', judged('Running load grows gradually from walk/jog toward continuous easy running; no single week shows an abrupt jump in total running time, and the longest session never exceeds the 75 minutes available on the long-run day.'), 'Gradual progression is the central safety property for a novice.'),
      E('d01-e09', 'ret8', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'A fully declared 7-day nonclinical break needs no question; the coach re-plans or keeps.'),
      E('d01-e10', 'ret8', 'DOMAIN_ORACLE', qkind(null), 'All week-7 sessions are covered by the declared break, so nothing is unknown.'),
      E('d01-e11', 'ret8', 'DOMAIN_ORACLE', validity(VALID), 'Nothing is pending after a declared nonclinical break.'),
      E('d01-e12', 'ret8', 'DOMAIN_ORACLE', judged('The first week back (week 8) does not exceed the running load of the last completed week before the break (week 6) and does not try to catch up the missed week; a small step back or a repeat of week 6 is appropriate.'), 'One missed week in a beginner means resume, not compensate.'),
      E('d01-e13', 'w14', 'DOMAIN_ORACLE', phase(15, ['RACE_WEEK']), 'The race week stays in place after the last pre-race review.'),
      E('d01-e14', 'w14', 'DOMAIN_ORACLE', present([15], 'RUN', ['RACE']), 'The race stays prescribed on its date.'),
      E('d01-e15', 'w14', 'DOMAIN_ORACLE', judged('Running in the final 7-10 days before the race is reduced relative to the peak weeks, with no new or harder session types introduced in race week, and strength in race week is light or absent in the two days before the race.'), 'A short taper suits a novice 10K.'),
    ],
    metamorphicRelations: [
      variant({ timeline: variantTimeline }, 'ret8', 'SAME_PLAN', 'The same 7-day break declared with a different nonclinical reason category (VACATION instead of WORK) should produce the same return plan; the category only matters for the clinical/nonclinical split.'),
      { relation: 'CALENDAR_SHIFT', rationale: 'The Wednesday start and negative offset are central: day offsets, not weekday names, define the week.' },
      { relation: 'RENAME_OPAQUE_IDS' },
    ],
    independentAssessment: ia(
      'A true beginner (no running at all, novice strength) aiming at a 10K in 16 weeks. This is feasible as a completion goal with run/walk progressions. The risks are starting with continuous running, progressing too fast, adding intensity early, or reacting to a missed week by compressing the build.',
      'Start with walk/jog intervals three times per week totalling a modest amount of time, progress the run fraction and duration a little each week, keep all running easy until continuous easy running is established (quality, if any, only late and gentle such as strides or short steady segments), build a longer session on the Sunday up to roughly 60-75 minutes of running or run/walk, taper in the last 7-10 days, race on the date. Strength: two short bodyweight sessions (squat, hinge, lunge, calf, push, pull/trunk patterns) with high reps in reserve. After the declared work week off: resume at or slightly below the week-6 level.',
      ['A plan whose last weeks still contain short walk breaks so the race can be completed as run/walk.', 'Starting with WALK sessions only for the first week before walk/jog.', 'Keeping strength to one session a week during the taper.', 'Repeating week 6 exactly after the break.'],
      ['Continuous 30-40 minute runs in week 0 (uses the time available rather than the current capacity).', 'Quality or threshold work in the first month.', 'A week after the break that is harder than before it, or doubling sessions to make up for the lost week.', 'A long session that exceeds 75 minutes, or runs on strength days.', 'Asking a question after a fully declared nonclinical break.']),
    domainNotes: 'Asking is not needed anywhere in this timeline: every week is reported and the break is declared with a nonclinical category. The time zone is UTC-05:00; step clocks are local. The race is on the long-run day so the race reference is unambiguous.',
  });
}

// ---------------------------------------------------------------- D02 half marathon: build, taper with a late answer, race, after the race
{
  const start = '2026-12-03'; const tz = 60; const C = cal(start, tz); // Thursday start, Central European time
  const raceDate = C.date(10, 3); // Sunday 2027-02-14, the long-run day
  const offers = { RUN_QUALITY_GRADUATION: 'ACCEPT', LADDER_STEP: 'DECLINE' };
  const head = range(0, 7).map((w) => fullWeek(`w${w}`, w, 6, '21:00', ['RUN', 'STRENGTH'], w > 0 ? { respondToOffers: offers } : {}));
  const u9 = { stepId: 'u9', at: at(9, 0, '07:00'), event: { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [C.date(9, 4)] } }, note: 'Week 8 was never reviewed. The athlete only opens the app to block Monday of the taper week (work trip).' };
  const a9 = { stepId: 'a9', at: at(9, 1, '07:30'), event: { kind: 'WEEKLY_REVIEW' }, answer: { report: { completed: true, asPrescribed: true, response: OK } }, note: 'Late answer during the taper: every listed week-8 run was done as prescribed.' };
  const tail = [
    fullWeek('w9', 9, 6, '21:00', ['RUN', 'STRENGTH']),
    review('w10', 10, 6, '21:00', [
      { ref: { week: 10, sport: 'RUN', role: 'RACE' }, completed: true, minutes: 113, response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' } },
      runsDone(10), strengthDone(10),
    ]),
    fullWeek('w11', 11, 6, '21:00', ['RUN', 'STRENGTH']),
  ];
  const timeline = [...head, u9, a9, ...tail];
  const onTime = [...head, fullWeek('w8', 8, 6, '21:00', ['RUN', 'STRENGTH'], { respondToOffers: offers }), u9, ...tail];
  meta['R7D-D02'] = { tz, start };
  cases.push({
    caseId: 'R7D-D02',
    authorIntent: 'An intermediate runner and experienced lifter runs a half marathon in week 10 of 12 while maintaining strength. The last build week is never reviewed, the coach must ask at the start of the taper, and the answer arrives a day late, inside the taper. It probes the race window (taper, race week, race, after the race) and whether a late answer during the taper gives the same plan as an on-time review.',
    coverageTags: ['RUN_FIRST', 'RACE_HALF', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_EXPERIENCED', 'GYM', 'START_NON_MONDAY', 'TIMEZONE', 'SKIPPED_REVIEW', 'UNREPORTED_WEEKS', 'LATE_ANSWER', 'TAPER_ANSWER', 'UNAVAILABLE_DAY', 'TAPER', 'RACE_WEEK', 'POST_RACE', 'OFFERS', 'SAME_FACTS_DIFFERENT_ORDER'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2026-12-02', startDate: start, weeks: 12, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd02-tomas', ageYears: 34, sex: 'M', heightCm: 181, weightKg: 79,
        eligibility: eligOK('2026-12-02'),
        goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: raceDate, timeGoalMinutes: 115 } }, strength: 'MAINTAIN' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'EXPERIENCED',
        recent: { runDaysPerWeek: 4, runMinutesPerWeek: 190, longestRunMinutes: 85, strengthDaysPerWeek: 2 },
        performanceAnchors: [{ kind: 'RACE_RESULT', distance: '10K', minutes: 51, date: '2026-11-15' }],
        knownRuns: [
          { prescription: { modality: 'RUN', family: 'THRESHOLD', durationMinutes: 50, warmupMinutes: 15, cooldownMinutes: 10, work: { repetitions: 3, workMinutes: 8, recoveryMinutes: 2 }, effort: 'comfortably hard' }, current: true, familiar: true, tolerated: true, observedAt: '2026-11-26T18:30:00+01:00' },
          { prescription: { modality: 'RUN', family: 'LONG', durationMinutes: 85, effort: 'easy, conversational' }, current: true, familiar: true, tolerated: true, observedAt: '2026-11-29T09:00:00+01:00' },
        ],
        knownExercises: [
          { id: 'back-squat', sets: 4, reps: 5, load: { value: 105, unit: 'KG', convention: 'TOTAL' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-11-30T19:00:00+01:00' },
          { id: 'barbell-rdl', sets: 3, reps: 6, load: { value: 95, unit: 'KG', convention: 'TOTAL' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-11-30T19:00:00+01:00' },
          { id: 'bench-press', sets: 4, reps: 6, load: { value: 75, unit: 'KG', convention: 'TOTAL' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-11-27T19:00:00+01:00' },
          { id: 'pull-up', sets: 3, reps: 6, load: { value: 0, unit: 'KG', convention: 'BODYWEIGHT' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-11-27T19:00:00+01:00' },
          { id: 'one-arm-db-row', sets: 3, reps: 10, load: { value: 30, unit: 'KG', convention: 'PER_HAND' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-11-27T19:00:00+01:00' },
        ],
        equipment: GYM_FULL,
      },
      schedule: { runDays: [0, 2, 3, 5], strengthDays: [1, 4], runTurn: 'PM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 55, longRunDay: 3, longRunMinutes: 130 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d02-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete intake, realistic goal (51-minute 10K, 115-minute half target), 10 weeks to race.'),
      E('d02-e02', 'GENERATE', 'DOMAIN_ORACLE', phase(10, ['RACE_WEEK']), 'The race is on day 3 of week 10.'),
      E('d02-e03', 'GENERATE', 'DOMAIN_ORACLE', present([10], 'RUN', ['RACE']), 'The race is on its date.'),
      E('d02-e04', 'GENERATE', 'DOMAIN_ORACLE', absent([10], 'RUN', ['LONG']), 'No separate long run in race week; the race is the long effort.'),
      E('d02-e05', 'GENERATE', 'DOMAIN_ORACLE', phase(11, ['POST_EVENT', 'NEXT_BLOCK']), 'The week after the half marathon is a post-event week.'),
      E('d02-e06', 'GENERATE', 'DOMAIN_ORACLE', absent([11], 'RUN', ['QUALITY']), 'Four to ten days after a half marathon an intermediate runner should run easy only.'),
      E('d02-e07', 'GENERATE', 'DOMAIN_ORACLE', judged('Strength is maintained with known loads (KNOWN or FROM_LOG, not ESTABLISH) at reduced volume and reps in reserve of about 2 or more; heavy lower-body work is reduced in weeks 9-10 and absent in the two days before the race.'), 'A maintenance goal next to a half-marathon build.'),
      E('d02-e08', 'GENERATE', 'DOMAIN_ORACLE', judged('The long run grows from about the current 85 minutes toward a peak of roughly 100-130 minutes no later than two weeks before the race, and the weekly running load rises gradually with at least one easier week in the build.'), 'Specific endurance for a half marathon without abrupt jumps.'),
      E('d02-e09', 'u9', 'DOMAIN_ORACLE', status('ASK'), 'A whole peak week (four runs, including the long run and the quality session) has no report and the taper doses depend on it.'),
      E('d02-e10', 'u9', 'DOMAIN_ORACLE', qkind('UNREPORTED_TRAINING'), 'The question is about the unreported week-8 runs.'),
      E('d02-e11', 'u9', 'INVARIANT_ORACLE', noRx(), 'While the question stands the run doses ahead are not a prescription.'),
      E('d02-e12', 'a9', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'The answer resolves the question.'),
      E('d02-e13', 'a9', 'DOMAIN_ORACLE', validity(VALID), 'Nothing remains pending.'),
      E('d02-e14', 'a9', 'DOMAIN_ORACLE', qkind(null), 'No further question.'),
      E('d02-e15', 'a9', 'DOMAIN_ORACLE', present([10], 'RUN', ['RACE']), 'The race remains on its date after the late answer.'),
      E('d02-e16', 'a9', 'DOMAIN_ORACLE', cmp('LONG', 9, '<=', 8), 'The taper-week long run is not longer than the peak-week long run.'),
      E('d02-e17', 'a9', 'INVARIANT_ORACLE', judged('No session is placed on the unavailable date (day 4 of week 9) and no session moves to a day the athlete did not choose.'), 'Unavailable day respected; chosen days respected.'),
      E('d02-e18', 'w10', 'DOMAIN_ORACLE', phase(11, ['POST_EVENT', 'NEXT_BLOCK']), 'After the race the remaining week is post-event.'),
      E('d02-e19', 'w10', 'DOMAIN_ORACLE', absent([11], 'RUN', ['QUALITY']), 'Recovery after the half marathon.'),
      E('d02-e20', 'w10', 'DOMAIN_ORACLE', judged('Week 11 running is easy and clearly below the pre-taper weekly load, and its longest run is well below the peak long run.'), 'Post-race recovery week.'),
    ],
    metamorphicRelations: [
      variant({ timeline: onTime }, 'w9', 'SAME_PLAN', 'Same facts reported on time (week-8 review on day 6 of week 8) versus late (asked at the start of the taper and answered the next morning). Once week 9 is reviewed, the race-week and post-race plan should be the same.'),
      { relation: 'CARRIER_CLINICAL', atStep: 'a9', rationale: 'The same taper answer delivered through a clinical route and then cleared should leave the same plan.' },
      { relation: 'RESEND', atStep: 'w10' },
      { relation: 'LOAD_CONVENTION_EQUIVALENT' },
    ],
    independentAssessment: ia(
      'A well-prepared intermediate runner with a credible half-marathon goal and an experienced lifter who only wants to keep strength. The interesting part is the unreported peak week right before the taper: the coach cannot know whether the athlete absorbed the peak, so it should ask before setting taper doses, and a late answer should land the athlete exactly where an on-time review would have.',
      'Plan four runs (easy, quality, easy, long on Sunday) with two maintenance strength sessions on Friday and Monday using known loads at lower volume. Build the long run toward roughly 105-125 minutes by week 7-8, taper from week 9 (shorter long run, maintained but reduced quality, lower volume), race on Sunday of week 10 with a short sharpening session and a shakeout before it, then an easy post-race week. At the start of week 9, ask about the unreported week-8 runs; after the answer, confirm or re-plan the taper and keep Monday of week 9 empty.',
      ['A 7-day taper (taper starts only in race week) if the peak long run is placed in week 8.', 'Keeping one short strength session in race week early in the week.', 'Strides in the post-race week.', 'Treating the unreported week conservatively without asking only if the taper doses were not increased; asking is better.'],
      ['Assuming the unreported peak week was done and silently keeping the projection.', 'Moving the Monday session of week 9 to Tuesday or Wednesday on an unchosen day.', 'A long run or heavy squats in the two days before the race.', 'Quality sessions in the week after the race.', 'Resetting the experienced lifter to ESTABLISH loads.']),
    domainNotes: 'The athlete runs in the evening (PM) so the 07:00 step on day 0 of week 9 precedes that day\'s run; the answer arrives the next morning. Offers are accepted for run quality and declined for ladder steps. Steps carry REANSWERED_NO_CHANGE eligibility by default.',
  });
}

// ---------------------------------------------------------------- D03 unknown eligibility at onboarding (strength only, 4 weeks)
{
  const start = '2027-01-16'; // Saturday
  meta['R7D-D03'] = { tz: 0, start };
  cases.push({
    caseId: 'R7D-D03',
    authorIntent: 'A 52-year-old who wants a 4-week machine-gym strength start leaves the eligibility status unanswered and two clinical questions blank. It probes that unknown eligibility is a question: no program, no clinical route, no presumed illness.',
    coverageTags: ['ELIGIBILITY_UNKNOWN', 'STRENGTH_ONLY', 'GENERAL_FITNESS', 'H4', 'STR_EXP_NOVICE', 'RUN_EXP_NONE', 'GYM', 'FREQ_LOW', 'START_NON_MONDAY', 'LOW_DATA', 'COLD_START'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2027-01-12', startDate: start, weeks: 4, timezoneOffsetMinutes: 0,
      athlete: {
        id: 'd03-ines', ageYears: 52, sex: 'F',
        eligibility: { status: 'UNKNOWN', assessedAt: '2027-01-12', pain: false, injury: false, illness: false, persistentPain: false },
        goals: { run: 'NONE', strength: 'GENERAL' },
        runExperience: 'NONE', strengthExperience: 'NOVICE',
        recent: { runDaysPerWeek: 0, strengthDaysPerWeek: 0 },
        equipment: ['MACHINES', 'DUMBBELLS', 'BENCH', 'BANDS', 'BODYWEIGHT'],
      },
      schedule: { runDays: [], strengthDays: [0, 3], strengthTurn: 'AM', strengthMinutes: 45 },
    }),
    timeline: [],
    expectedDomainProperties: [
      E('d03-e01', 'GENERATE', 'INVARIANT_ORACLE', status('ASK'), 'Unknown eligibility is a question, never a clearance and never a presumed illness.'),
      E('d03-e02', 'GENERATE', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed until eligibility is answered.'),
      E('d03-e03', 'GENERATE', 'INVARIANT_ORACLE', judged('The missing facts named by the coach are the eligibility answers (the status and the unanswered functional-limitation and clinical-concern items); the response does not describe the athlete as having a clinical condition and does not route her to a clinician.'), 'Asking is the right answer; routing would presume illness.'),
    ],
    metamorphicRelations: [{ relation: 'RENAME_OPAQUE_IDS' }],
    independentAssessment: ia(
      'Everything needed to plan is present except eligibility. Four flags were answered "no" but the status is UNKNOWN and functional limitation and clinical concern were left blank.',
      'Return ASK naming the unanswered eligibility items; no program until they are answered.',
      ['Asking only for the status if the coach treats the status as the single gate, as long as nothing is prescribed.'],
      ['Generating a "safe" beginner program anyway.', 'CLINICAL_HUMAN_REQUIRED (presumes a clinical problem from missing answers).', 'UNSUPPORTED (the request is in scope).', 'INVALID_INPUT (the intake is well formed; omitted flags are allowed and mean unknown).']),
    domainNotes: 'Onboarding-only case. A second form of the same fact (status confirmed but one flag omitted) would also be unknown; it is not encoded as a VARIANT because a relation needs a step present in both timelines.',
  });
}

// ---------------------------------------------------------------- D04 pain at onboarding (hybrid, 8 weeks)
{
  const start = '2026-11-23'; // Monday
  meta['R7D-D04'] = { tz: 0, start };
  cases.push({
    caseId: 'R7D-D04',
    authorIntent: 'A recreational hybrid athlete reports persistent pain at onboarding while asking for a normal 8-week plan. It probes the clinical boundary at the very first decision: route to a qualified human and prescribe nothing, including no "pain-free" partial plan.',
    coverageTags: ['CLINICAL_SIGNAL', 'BALANCED_HYBRID', 'NON_RACE', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'COLD_START'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2026-11-20', startDate: start, weeks: 8, timezoneOffsetMinutes: 0,
      athlete: {
        id: 'd04-omar', ageYears: 37, sex: 'M',
        eligibility: { status: 'CLINICAL', assessedAt: '2026-11-20', pain: true, persistentPain: true, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false },
        goals: { run: 'REGULAR', strength: 'GENERAL' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50, strengthDaysPerWeek: 1 },
        equipment: ['DUMBBELLS', 'BODYWEIGHT', 'BANDS'],
      },
      schedule: { runDays: [1, 3, 5], strengthDays: [0, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 40, strengthMinutes: 40, longRunDay: 5, longRunMinutes: 70 },
    }),
    timeline: [],
    expectedDomainProperties: [
      E('d04-e01', 'GENERATE', 'INVARIANT_ORACLE', status('CLINICAL_HUMAN_REQUIRED'), 'Persistent pain is a clinical signal; the coach is not a clinician.'),
      E('d04-e02', 'GENERATE', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed while the clinical route stands.'),
      E('d04-e03', 'GENERATE', 'NOT_EVALUABLE_DOMAIN', judged('Whether this athlete can train, and how, depends on a clinical assessment of the pain.'), 'Clinical adequacy is outside the domain oracle.'),
    ],
    metamorphicRelations: [],
    independentAssessment: ia(
      'Pain that is persistent, declared at onboarding, with a running history: a qualified human must assess it before any program.',
      'CLINICAL_HUMAN_REQUIRED with no program, no partial plan and no claim of clearance.',
      [],
      ['A reduced or "upper-body only" program.', 'ASK (the signal is already explicit; nothing is unknown about it).', 'PROPOSED with a note to "listen to your body".']),
    domainNotes: 'Onboarding-only case.',
  });
}

// ---------------------------------------------------------------- D05 out of scope: adolescent asking for a half marathon
{
  const start = '2027-03-06'; // Saturday; ends 2027-04-30
  const C = cal(start, -360);
  meta['R7D-D05'] = { tz: -360, start };
  cases.push({
    caseId: 'R7D-D05',
    authorIntent: 'A 16-year-old asks for a half-marathon plan with hypertrophy work. Adolescents are outside V1. It probes that an out-of-scope request is not planned, and not softened into a reduced plan.',
    coverageTags: ['OUT_OF_SCOPE', 'RACE_HALF', 'H8', 'RUN_EXP_NOVICE', 'STR_EXP_NOVICE', 'START_NON_MONDAY', 'TIMEZONE', 'COLD_START'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2027-03-01', startDate: start, weeks: 8, timezoneOffsetMinutes: -360,
      athlete: {
        id: 'd05-leo', ageYears: 16, sex: 'M',
        eligibility: eligOK('2027-03-01'),
        goals: { run: { kind: 'RACE', event: { kind: 'HALF_MARATHON', date: C.date(7, 1) } }, strength: 'HYPERTROPHY' },
        runExperience: 'NOVICE', strengthExperience: 'NOVICE',
        recent: { runDaysPerWeek: 2, runMinutesPerWeek: 60, longestRunMinutes: 35, strengthDaysPerWeek: 2 },
        equipment: GYM_FULL,
      },
      schedule: { runDays: [1, 3, 5], strengthDays: [0, 2, 4], runTurn: 'PM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 60, longRunDay: 1, longRunMinutes: 90 },
    }),
    timeline: [],
    expectedDomainProperties: [
      E('d05-e01', 'GENERATE', 'INVARIANT_ORACLE', status('UNSUPPORTED'), 'Adolescents are outside the V1 scope.'),
      E('d05-e02', 'GENERATE', 'INVARIANT_ORACLE', noRx(), 'An out-of-scope request is not planned.'),
    ],
    metamorphicRelations: [],
    independentAssessment: ia(
      'Age 16 is outside the adult-only V1 scope, regardless of how reasonable the request looks. A novice teenager going from 35 minutes to a half marathon in 7 weeks would also be a poor plan for an adult.',
      'UNSUPPORTED with no program.',
      [],
      ['Any program, including a reduced "teen" program.', 'CLINICAL_HUMAN_REQUIRED (age is a scope question, not a clinical signal).', 'ASK for age confirmation (the age is given).']),
    domainNotes: 'Onboarding-only case. The race date is day 1 (Sunday) of week 7, inside the program.',
  });
}

// ---------------------------------------------------------------- D06 habitual late reporter, run-only, high frequency, full watch history
{
  const start = '2027-01-09'; const tz = 540; const C = cal(start, tz); // Saturday start, Japan
  const asOf = '2027-01-07';
  const history = [];
  let n = 0;
  for (const k of [4, 3, 2, 1]) {
    for (const [d, mins] of [[0, 50], [1, 98], [3, 60], [4, 45], [6, 48]]) {
      const day = addDays(start, -7 * k + d);
      if (day >= asOf) continue;
      history.push({ activityId: `wa-h${++n}`, provider: 'watch-a', sport: 'RUN', startedAt: `${day}T06:15:00+09:00`, durationMinutes: mins, completeness: 'FULL' });
    }
  }
  const watch = (id) => ({ provider: 'watch-a', activityId: id, quality: 'WEARABLE_FULL' });
  const w1Long = { ref: { week: 1, sport: 'RUN', day: 1 }, completed: true, fraction: 0.75, response: { performance: 'UNDER', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' }, observedAt: C.ts(1, 1, '06:10'), source: watch('wa-1001') };
  const head = [
    review('w0', 0, 6, '21:00', [runsDone(0)], { respondToOffers: { RUN_QUALITY_GRADUATION: 'ACCEPT' } }),
    { stepId: 'p2', at: at(2, 0, '05:15'), event: { kind: 'PARTIAL_SESSION' }, targetRef: { week: 1, sport: 'RUN', day: 1 }, observations: [{ ...w1Long, reportedAt: C.ts(2, 0, '05:15') }], note: 'Week 1 was never reviewed; the athlete reports only the shortened Sunday long run, six days late.' },
    { stepId: 'a2', at: at(2, 3, '20:30'), event: { kind: 'WEEKLY_REVIEW' }, answer: { overrides: [
      { ref: { week: 1, sport: 'RUN', day: 0 }, completed: true, asPrescribed: true, response: OK },
      { ref: { week: 1, sport: 'RUN', day: 3 }, completed: false },
    ] }, note: 'Partial answer: two of the week-1 runs; days 4 and 6 of week 1 still unanswered.' },
    { stepId: 'w2', at: at(2, 6, '21:00'), event: { kind: 'WEEKLY_REVIEW' }, answer: { overrides: [
      { ref: { week: 1, sport: 'RUN', day: 4 }, completed: true, asPrescribed: true, response: OK },
      { ref: { week: 1, sport: 'RUN', day: 6 }, completed: false },
    ] }, observations: [runsDone(2)], note: 'The rest of week 1 plus the full week 2.' },
    review('w3', 3, 6, '21:00', [runsDone(3)], { respondToOffers: { RUN_QUALITY_GRADUATION: 'ACCEPT' } }),
  ];
  const s5 ={ stepId: 's5', at: at(5, 1, '19:00'), event: { kind: 'SCHEDULE_CHANGE', changes: { longRunDay: 0 } }, note: 'Week 4 was never reviewed. From now on the long run moves to Saturday.' };
  const a5 = { stepId: 'a5', at: at(5, 2, '07:00'), event: { kind: 'WEEKLY_REVIEW' }, answer: { report: { completed: true, asPrescribed: true, response: OK } }, note: 'Late answer: everything the question lists was done as prescribed.' };
  const tail = [review('w5', 5, 6, '21:00', [runsDone(5)]), review('w6', 6, 6, '21:00', [runsDone(6)]), review('w7', 7, 6, '21:00', [runsDone(7)])];
  const timeline = [...head, s5, a5, ...tail];
  const onTime = [...head, review('w4', 4, 6, '21:00', [runsDone(4)]), s5, ...tail];
  meta['R7D-D06'] = { tz, start };
  cases.push({
    caseId: 'R7D-D06',
    authorIntent: 'An experienced run-only athlete training five days a week habitually reports late: a week is reported days afterwards, one session at a time, and answers to questions come in pieces. It probes unknown-versus-missed handling, partial answers that leave some sessions unknown, and that a late answer yields the same plan as an on-time review.',
    coverageTags: ['RUN_ONLY', 'NON_RACE', 'H8', 'RUN_EXP_EXPERIENCED', 'STR_EXP_NONE', 'FREQ_HIGH', 'WEARABLE_FULL', 'START_NON_MONDAY', 'TIMEZONE', 'LATE_REPORTER', 'SKIPPED_REVIEW', 'UNREPORTED_WEEKS', 'LATE_ANSWER', 'PARTIAL_ANSWER', 'SHORTENED_RUNS', 'MIXED_EXECUTION', 'SCHEDULE_CHANGE', 'OFFERS', 'SAME_FACTS_DIFFERENT_ORDER'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf, startDate: start, weeks: 8, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd06-kenji', ageYears: 45, sex: 'M', heightCm: 170, weightKg: 63,
        eligibility: eligOK(asOf),
        goals: { run: 'PERFORMANCE', strength: 'NONE' },
        runExperience: 'EXPERIENCED', strengthExperience: 'NONE',
        recent: { runDaysPerWeek: 5, runMinutesPerWeek: 280, longestRunMinutes: 100 },
        performanceAnchors: [{ kind: 'RACE_RESULT', distance: 'HALF_MARATHON', minutes: 98, date: '2026-12-13' }],
        knownRuns: [{ prescription: { modality: 'RUN', family: 'THRESHOLD', durationMinutes: 60, warmupMinutes: 15, cooldownMinutes: 12, work: { repetitions: 2, workMinutes: 15, recoveryMinutes: 3 }, effort: 'threshold, controlled' }, current: true, familiar: true, tolerated: true, observedAt: '2027-01-05T06:30:00+09:00' }],
        wearableCapabilities: { provider: 'watch-a', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'FULL', historyWeeks: 4 },
      },
      schedule: { runDays: [0, 1, 3, 4, 6], strengthDays: [], runTurn: 'AM', runMinutes: 50, longRunDay: 1, longRunMinutes: 110 },
      history,
    }),
    timeline,
    expectedDomainProperties: [
      E('d06-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete intake with four weeks of full watch history.'),
      E('d06-e02', 'GENERATE', 'INVARIANT_ORACLE', judged('No strength session appears in any week (strength goal NONE, no strength days).'), 'Run-only athlete.'),
      E('d06-e03', 'GENERATE', 'DOMAIN_ORACLE', present([0], 'RUN', ['LONG']), 'An experienced runner with a current 100-minute long run keeps a long run from week 0.'),
      E('d06-e04', 'GENERATE', 'DOMAIN_ORACLE', present([0, 1, 2, 3], 'RUN', ['QUALITY']), 'A current, tolerated threshold session supports quality work in the first block (directly or after an accepted offer).'),
      E('d06-e05', 'GENERATE', 'DOMAIN_ORACLE', judged('Week-0 running is close to the current ~280 minutes per week (roughly 230-300), mostly easy, with the long run near the current 95-100 minutes; it is not reset to beginner volumes.'), 'Experienced and consistent: start at current capacity.'),
      E('d06-e06', 'p2', 'DOMAIN_ORACLE', status('ASK'), 'Four of five week-1 runs are unknown and the next doses depend on them.'),
      E('d06-e07', 'p2', 'DOMAIN_ORACLE', qkind('UNREPORTED_TRAINING'), 'The question is about the unreported runs.'),
      E('d06-e08', 'p2', 'INVARIANT_ORACLE', noRx(), 'While the question stands the run doses ahead are not a prescription.'),
      E('d06-e09', 'p2', 'INVARIANT_ORACLE', judged('The question lists the four unreported week-1 runs (days 0, 3, 4, 6) and does not list the long run that was just reported; nothing unreported is treated as done or as missed.'), 'Unknown is neither done nor not done.'),
      E('d06-e10', 'a2', 'DOMAIN_ORACLE', status('ASK'), 'The partial answer leaves two week-1 runs unknown.'),
      E('d06-e11', 'a2', 'DOMAIN_ORACLE', validity(RECON), 'Still pending.'),
      E('d06-e12', 'w2', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'All week-1 and week-2 facts are now known.'),
      E('d06-e13', 'w2', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending.'),
      E('d06-e14', 'w2', 'DOMAIN_ORACLE', judged('Week 3 does not try to make up the two missed week-1 runs or the shortened long run: running load is held or progresses only modestly from the week actually completed, and the next long run is not extended to compensate.'), 'No catch-up after mixed execution.'),
      E('d06-e15', 's5', 'DOMAIN_ORACLE', status('ASK'), 'Week 4 is entirely unreported.'),
      E('d06-e16', 's5', 'DOMAIN_ORACLE', qkind('UNREPORTED_TRAINING'), 'The question is about the unreported week-4 runs.'),
      E('d06-e17', 's5', 'INVARIANT_ORACLE', noRx(), 'Pending question.'),
      E('d06-e18', 'a5', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'The answer resolves the question.'),
      E('d06-e19', 'a5', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending.'),
      E('d06-e20', 'a5', 'INVARIANT_ORACLE', judged('From week 6 on, the long run is on day 0 (Saturday) and runs remain only on days 0, 1, 3, 4 and 6; the long run is not followed by another long or quality run the next day.'), 'Schedule change respected; Saturday long run then Sunday easy.'),
    ],
    metamorphicRelations: [
      variant({ timeline: onTime }, 'w5', 'SAME_PLAN', 'Week 4 reported on time (review on day 6 of week 4) versus reported late (asked at the schedule change, answered the next morning) with identical facts: once week 5 is reviewed the plan should be the same.'),
      { relation: 'CARRIER_CLINICAL', atStep: 'a5' },
      { relation: 'DUPLICATE_SECOND_SOURCE', atStep: 'p2' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w2' },
    ],
    independentAssessment: ia(
      'A consistent, experienced runner whose reporting is the problem, not his training. The coach must keep unknown sessions unknown, ask for them, accept answers in pieces without treating unanswered sessions as done or missed, and must not penalise or reward late reporting once the facts are in.',
      'Plan five runs a week around the current 280 minutes with a Sunday long run and one or two quality sessions. At the late partial report of the shortened long run, ask about the other four week-1 runs. After the first partial answer, keep asking only about the remaining two. After the full answer (two runs missed, long run at 75%, the rest done), plan week 3 by holding or slightly reducing, not compensating. Ask again about week 4 when the schedule change arrives; the answer (all done) restores the normal progression, with the long run on Saturday from week 6.',
      ['Holding the doses of week 3 exactly at week-2 level.', 'Asking once for both remaining sessions and the current week together.', 'Treating the shortened long run as a signal to keep the next long run at the same length.'],
      ['Treating unreported sessions as done (silent progression) or as missed (silent cut).', 'Clearing the question after the partial answer.', 'Adding extra volume in week 3 to compensate.', 'Any strength session.', 'Different plans after week 5 depending only on whether week 4 was reported on time or late.']),
    domainNotes: 'All step clocks are Japan local time (UTC+09:00). At w2 the remaining week-1 runs are given as explicit overrides and week 2 as a bulk report, so the case does not depend on whether the pending question also lists current-week sessions; a week-2 session listed by the question and covered by the bulk report carries the same derived event id (a re-send of the same fact).',
  });
}

// ---------------------------------------------------------------- D07 strength-first, kettlebell-only home gym, schedule change, travel with a hotel gym
{
  const start = '2026-11-29'; const tz = 0; const C = cal(start, tz); // Sunday start, Lisbon
  const obs = '2026-11-27T19:00:00+00:00';
  const kx = (id, sets, reps, value, convention, rir) => ({ id, sets, reps, load: { value, unit: 'KG', convention }, rir, current: true, familiar: true, tolerated: true, observedAt: obs });
  const both = (id, w, extra) => fullWeek(id, w, 6, '21:30', ['RUN', 'STRENGTH'], extra);
  const timeline = [
    both('w0', 0),
    { ...fullWeek('w1', 1, 6, '21:00', ['RUN', 'STRENGTH']), confirmPendingLoads: true, respondToOffers: { LADDER_STEP: 'ACCEPT', RUN_QUALITY_GRADUATION: 'DECLINE' } },
    { stepId: 's1', at: at(1, 6, '21:30'), event: { kind: 'SCHEDULE_CHANGE', changes: { strengthDays: [2, 4, 6], runDays: [0, 3], longRunDay: 0 } }, note: 'New work shift: strength moves to Tue/Thu/Sat evenings, runs to Sun/Wed mornings, from week 2.' },
    both('w2', 2, { confirmPendingLoads: true }),
    { stepId: 't3', at: at(2, 6, '22:00'), event: { kind: 'EQUIPMENT_CHANGE', changes: { equipment: ['DUMBBELLS', 'BENCH', 'MACHINES', 'BODYWEIGHT'], from: C.date(3, 1), to: C.date(3, 6) } }, note: 'Conference in New York Monday to Saturday of week 3: hotel gym with dumbbells, a bench and machines; no kettlebells.' },
    { stepId: 'w3', at: C.tsAt(C.date(3, 6), '16:30', -300), event: { kind: 'WEEKLY_REVIEW' }, observations: [runsDone(3), strengthDone(3)], note: 'Sent from New York (UTC-05:00); 21:30 at home.' },
    both('w4', 4, { respondToOffers: { LADDER_STEP: 'ACCEPT', RUN_QUALITY_GRADUATION: 'DECLINE' } }),
    { stepId: 'f5', at: at(5, 3, '07:00'), event: { kind: 'LOCAL_FATIGUE', signals: { region: 'LOWER' } }, note: 'Legs very heavy the morning after the Tuesday hinge session, before the Wednesday run.' },
    both('w5', 5),
    both('w6', 6),
    both('w7', 7),
  ];
  meta['R7D-D07'] = { tz, start };
  cases.push({
    caseId: 'R7D-D07',
    authorIntent: 'A strength-first athlete with only kettlebells, a pull-up bar and bodyweight at home, and little running, changes her training days mid-program and then travels for a week to a hotel gym with different equipment, then returns home. It probes equipment-bound exercise selection, known kettlebell loads and conventions, schedule changes, a temporary equipment window, and a local lower-body fatigue signal.',
    coverageTags: ['STRENGTH_FIRST', 'NON_RACE', 'GENERAL_FITNESS', 'H8', 'STR_EXP_INTERMEDIATE', 'RUN_EXP_NOVICE', 'KETTLEBELL', 'START_NON_MONDAY', 'SCHEDULE_CHANGE', 'EQUIPMENT_CHANGE', 'TRAVEL', 'TIMEZONE', 'FATIGUE_LOCAL', 'LOAD_CONFIRMATION', 'OFFERS'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2026-11-28', startDate: start, weeks: 8, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd07-ana', ageYears: 29, sex: 'F', heightCm: 168, weightKg: 61,
        eligibility: eligOK('2026-11-28'),
        goals: { run: 'GENERAL', strength: 'STRENGTH' },
        runExperience: 'NOVICE', strengthExperience: 'INTERMEDIATE',
        recent: { runDaysPerWeek: 1, runMinutesPerWeek: 25, longestRunMinutes: 25, strengthDaysPerWeek: 3 },
        knownExercises: [
          kx('kb-goblet-squat', 4, 8, 24, 'SINGLE_IMPLEMENT', 2),
          kx('kb-deadlift', 4, 8, 24, 'SINGLE_IMPLEMENT', 3),
          kx('push-up', 3, 12, 0, 'BODYWEIGHT', 2),
          kx('pull-up', 4, 5, 0, 'BODYWEIGHT', 1),
          kx('reverse-lunge', 3, 10, 0, 'BODYWEIGHT', 3),
        ],
        equipment: ['KETTLEBELL', 'PULL_UP_BAR', 'BODYWEIGHT'],
        exerciseRotationPreference: 'COACH_DECIDES',
        strengthPreferences: { emphasis: ['LOWER'], movementPriorities: ['HINGE', 'PULL'] },
      },
      schedule: { runDays: [0, 4], strengthDays: [1, 3, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 30, strengthMinutes: 50, longRunDay: 0, longRunMinutes: 45 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d07-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d07-e02', 'GENERATE', 'INVARIANT_ORACLE', judged('Every strength exercise uses only a kettlebell, the pull-up bar or bodyweight; no barbell, dumbbell, bench or machine exercise appears.'), 'Equipment-bound repertoire.'),
      E('d07-e03', 'GENERATE', 'DOMAIN_ORACLE', judged('Exercises the athlete already does (kettlebell goblet squat, kettlebell deadlift, pull-up, push-up, reverse lunge) start from her known loads and reps in their own convention (24 kg single implement), not from ESTABLISH, with reps in reserve of about 1-3; strength is the primary stimulus with three progressing sessions per week.'), 'Strength-first with known current loads.'),
      E('d07-e04', 'GENERATE', 'DOMAIN_ORACLE', absent([0, 1, 2, 3], 'RUN', ['QUALITY']), 'A novice runner with a general running goal runs easy in the first block.'),
      E('d07-e05', 'GENERATE', 'DOMAIN_ORACLE', judged('Running stays easy and modest (two sessions, about 20-45 minutes) and grows slowly from the current 25 minutes per week.'), 'Running is secondary.'),
      E('d07-e06', 's1', 'DOMAIN_ORACLE', status('MODIFY'), 'A change of training days requires a new plan.'),
      E('d07-e07', 's1', 'INVARIANT_ORACLE', judged('From week 2 on, strength sessions fall only on days 2, 4 and 6 and runs only on days 0 and 3; no strength remains on days 1, 3 or 5 and no run on day 4.'), 'The new chosen days replace the old ones.'),
      E('d07-e08', 't3', 'DOMAIN_ORACLE', status('MODIFY'), 'The week-3 strength sessions cannot be done with kettlebells.'),
      E('d07-e09', 't3', 'INVARIANT_ORACLE', judged('Strength sessions dated inside the travel window (days 1-6 of week 3) use only dumbbells, the bench, machines or bodyweight; no kettlebell or pull-up-bar exercise appears in them.'), 'Temporary equipment window.'),
      E('d07-e10', 't3', 'DOMAIN_ORACLE', judged('Travel-week exercises keep the same movement patterns at a similar effort (new implements start with ESTABLISH or conservative loads), and weeks 4 onward return to the kettlebell repertoire and loads.'), 'Travel is a temporary substitution, not a new program.'),
      E('d07-e11', 'f5', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'A local fatigue signal is not clinical.'),
      E('d07-e12', 'f5', 'DOMAIN_ORACLE', judged('After the lower-body fatigue signal, the remaining lower-body load of week 5 is eased (fewer sets, more reserve, or lighter) and the run that day stays easy or shorter; nothing is added.'), 'Respond proportionately to local fatigue.'),
    ],
    metamorphicRelations: [
      { relation: 'LOAD_CONVENTION_EQUIVALENT', rationale: 'Single-implement kettlebell loads are central.' },
      { relation: 'CALENDAR_SHIFT' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w3' },
    ],
    independentAssessment: ia(
      'An intermediate lifter with a narrow home setup (one 24 kg kettlebell is her current working load for squat and hinge) who wants to get stronger, plus easy general running. Her constraints change twice: new days, then a week of travel with different equipment.',
      'Three strength sessions built around the kettlebell squat and hinge, pull-ups, push-ups and lunges, progressing reps/sets or single-leg variations since the kettlebell load is fixed; two easy runs, Sunday a little longer. Re-plan on the new days from week 2. For the travel week, swap to dumbbell/machine versions of the same patterns with conservative or effort-based loads, then return to the home plan. On lower-body fatigue, ease the next lower-body work and keep the run easy.',
      ['Progressing the kettlebell exercises through tempo, pauses or single-leg variations instead of load.', 'Reducing strength to two sessions during travel.', 'Ladder steps (harder variations) offered at block boundaries.'],
      ['Programming dumbbells or barbells at home.', 'Programming kettlebell exercises in the hotel week.', 'Keeping sessions on the old days after the schedule change.', 'Quality runs for a novice runner with a general goal.', 'Escalating fatigue to a clinical route.']),
    domainNotes: 'Load confirmations are accepted at the next step in case the coach asks about first logged loads (for example the new hotel-gym exercises). The week-3 review is sent with an explicit New York timestamp that is the same local evening at home.',
  });
}

// ---------------------------------------------------------------- D08 balanced hybrid: shared days, turns, double conflicts, an unavailable long-run day
{
  const start = '2026-11-17'; const tz = 0; const C = cal(start, tz); // Tuesday start, London
  const obs = '2026-11-13T18:00:00+00:00';
  const kx = (id, sets, reps, value, convention, rir) => ({ id, sets, reps, load: { value, unit: 'KG', convention }, rir, current: true, familiar: true, tolerated: true, observedAt: obs });
  const both = (id, w) => fullWeek(id, w, 6, '20:00', ['RUN', 'STRENGTH']);
  const timeline = [
    both('w0', 0), both('w1', 1), both('w2', 2),
    { stepId: 'dc3', at: at(3, 1, '12:00'), event: { kind: 'DOUBLE_CONFLICT', changes: { from: C.date(3, 2), to: C.date(3, 2), runTurn: 'PM', strengthTurn: 'PM', sameTurnConfirmed: true } }, note: 'Thursday of week 3: only the evening is free; the athlete confirms doing both back to back.' },
    both('w3', 3),
    both('w4', 4),
    { stepId: 'dc5', at: at(4, 6, '20:30'), event: { kind: 'DOUBLE_CONFLICT', changes: { from: C.date(5, 0), to: C.date(5, 0), runTurn: 'PM', strengthTurn: 'PM', sameTurnConfirmed: false } }, note: 'Tuesday of week 5: only the evening is free and the athlete does NOT want both in one turn.' },
    both('w5', 5),
    { stepId: 'u6', at: at(6, 3, '18:00'), event: { kind: 'UNAVAILABLE_DAY', changes: { unavailableDates: [C.date(6, 5)] } }, note: 'Family event on Sunday of week 6, the long-run day. Tuesday and Thursday of week 6 have already passed.' },
    both('w6', 6), both('w7', 7), both('w8', 8),
  ];
  meta['R7D-D08'] = { tz, start };
  cases.push({
    caseId: 'R7D-D08',
    authorIntent: 'A balanced hybrid athlete trains run and strength on two shared days in different turns. Two double conflicts arrive (one with same-turn confirmation, one without) and later the long-run day becomes unavailable when no other chosen run day is left that week. It probes turn handling, the confirmation rule, and that sessions are never moved to unchosen days.',
    coverageTags: ['BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'GYM', 'SHARED_DAYS', 'SAME_TURN', 'DOUBLE_CONFLICT', 'UNAVAILABLE_DAY', 'FREQ_HIGH', 'START_NON_MONDAY'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2026-11-16', startDate: start, weeks: 12, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd08-sam', ageYears: 31, sex: 'M',
        eligibility: eligOK('2026-11-16'),
        goals: { run: 'REGULAR', strength: 'HYPERTROPHY' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 75, strengthDaysPerWeek: 3 },
        knownExercises: [
          kx('leg-press', 3, 10, 140, 'MACHINE_STACK', 2),
          kx('machine-chest-press', 3, 10, 50, 'MACHINE_STACK', 2),
          kx('lat-pulldown', 3, 10, 55, 'MACHINE_STACK', 2),
          kx('db-rdl', 3, 10, 22, 'PER_HAND', 2),
          kx('seated-cable-row', 3, 12, 50, 'MACHINE_STACK', 2),
        ],
        equipment: ['MACHINES', 'DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR', 'BODYWEIGHT'],
      },
      schedule: { runDays: [0, 2, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 60, longRunDay: 5, longRunMinutes: 90 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d08-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Shared days in different turns need no confirmation.'),
      E('d08-e02', 'GENERATE', 'INVARIANT_ORACLE', judged('On the shared days 0 and 2 the run is in the AM turn and strength in the PM turn; no day has both sports in the same turn.'), 'Same turn needs confirmation, which was not given at onboarding.'),
      E('d08-e03', 'GENERATE', 'DOMAIN_ORACLE', judged('The Saturday strength session before the Sunday long run is not the heaviest lower-body session of the week, and the run on a shared day is not a hard quality run placed just before the heaviest lower-body work of that evening.'), 'Concurrent-training placement.'),
      E('d08-e04', 'dc3', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'The confirmed double conflict can be planned.'),
      E('d08-e05', 'dc3', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending.'),
      E('d08-e06', 'dc3', 'DOMAIN_ORACLE', judged('On Thursday of week 3 both sessions are in the PM turn (confirmed) and the combination is sensible: an easy or shortened run with the strength session, not a quality run stacked on heavy legs.'), 'Confirmed same-turn day.'),
      E('d08-e07', 'dc5', 'DOMAIN_ORACLE', status('MODIFY', 'ASK'), 'The unconfirmed double conflict needs a change or a question.'),
      E('d08-e08', 'dc5', 'INVARIANT_ORACLE', judged('On Tuesday of week 5 the plan does not contain two live sessions in the same turn; if one is dropped it is marked skipped, not moved to a day the athlete did not choose.'), 'Same turn without confirmation is not allowed.'),
      E('d08-e09', 'u6', 'DOMAIN_ORACLE', status('MODIFY'), 'The long run of week 6 cannot happen on Sunday.'),
      E('d08-e10', 'u6', 'INVARIANT_ORACLE', judged('No session is dated Sunday of week 6, and no run is placed on Wednesday, Friday, Saturday or Monday of week 6 (days the athlete did not choose for running); the long run of week 6 is skipped rather than moved to an unchosen day or doubled up.'), 'Chosen days are the athlete\'s.'),
      E('d08-e11', 'u6', 'DOMAIN_ORACLE', judged('The week-7 long run is not extended to compensate for the skipped week-6 long run: it is no longer than what had been planned for week 6.'), 'No catch-up.'),
    ],
    metamorphicRelations: [
      { relation: 'CALENDAR_SHIFT' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w5' },
      { relation: 'LOAD_CONVENTION_EQUIVALENT' },
    ],
    independentAssessment: ia(
      'An intermediate hybrid athlete in a gym without barbells, three runs and three hypertrophy sessions with two shared days. Most of the difficulty is in the schedule, not the dose.',
      'Run AM / lift PM on shared days, Sunday long run, upper or lighter emphasis on Saturday. On the confirmed Thursday, put both in the evening with the easy run first or a short run after lifting. On the unconfirmed Tuesday, keep one session in the evening (strength, or an easy run if the coach prefers to protect running) and skip the other; asking which one is also fine. On the unavailable Sunday, skip the week-6 long run; resume the planned progression in week 7 without compensating.',
      ['Shortening the Thursday run when stacked with strength.', 'Asking at dc5 which session to keep.', 'Turning the remaining week-6 strength session lighter to compensate for nothing (not required).'],
      ['Placing both sessions in the same turn on the unconfirmed day.', 'Moving the long run to Saturday (a strength-only day) or Monday (unchosen).', 'A longer week-7 long run to catch up.', 'Quality running stacked before heavy lower-body work on shared days.']),
    domainNotes: 'Bulk reports cover only planned, non-skipped sessions, so the week-5 and week-6 reviews stay valid whichever session the coach drops.',
  });
}

// ---------------------------------------------------------------- D09 restart after a long break, then a goal change to a 10K, then the race moves earlier
{
  const start = '2027-01-08'; const tz = -180; const C = cal(start, tz); // Friday start, Sao Paulo
  const firstRace = C.date(15, 2); // Sunday 2027-04-25
  const movedRace = C.date(13, 2); // Sunday 2027-04-11
  const athlete = {
    id: 'd09-rafa', ageYears: 36, sex: 'M', heightCm: 176, weightKg: 82,
    eligibility: eligOK('2027-01-07'),
    goals: { run: 'REGULAR', strength: 'NONE' },
    runExperience: 'EXPERIENCED', strengthExperience: 'NONE',
    recent: { runDaysPerWeek: 1, runMinutesPerWeek: 20, longestRunMinutes: 20 },
    equipment: ['BODYWEIGHT'],
    pause: { nonclinical: true, weeks: 22, reasonCategory: 'MOVING', reason: 'Moved cities and changed jobs in August; stopped running. Used to race half marathons.' },
  };
  const { pause, ...athleteNoPause } = athlete;
  const runs = (id, w) => review(id, w, 6, '20:00', [runsDone(w)]);
  const timeline = [
    runs('w0', 0), runs('w1', 1),
    review('w2', 2, 6, '20:00', [
      { ref: { week: 2, sport: 'RUN', day: 1 }, completed: true, asPrescribed: true, response: OK },
      { ref: { week: 2, sport: 'RUN', day: 3 }, completed: true, fraction: 0.6, response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' } },
      { ref: { week: 2, sport: 'RUN', day: 5 }, completed: true, asPrescribed: true, response: OK },
    ], { note: 'Monday run cut short: ran out of time before work, felt fine.' }),
    runs('w3', 3), runs('w4', 4),
    { stepId: 'g5', at: at(5, 0, '07:00'), event: { kind: 'GOAL_CHANGE', changes: { goals: { run: { kind: 'RACE', event: { kind: '10K', date: firstRace, timeGoalMinutes: 50 } }, strength: 'NONE' }, event: { kind: '10K', date: firstRace, timeGoalMinutes: 50 } } }, note: 'Signs up for a 10K on Sunday of week 15 with a 50-minute target.' },
    ...range(5, 9).map((w) => runs(`w${w}`, w)),
    { stepId: 'ed10', at: at(10, 0, '07:00'), event: { kind: 'EVENT_DATE_CHANGE', changes: { eventDate: movedRace } }, note: 'The organiser moves the race two weeks earlier, to Sunday of week 13.' },
    runs('w10', 10), runs('w11', 11), runs('w12', 12),
    review('w13', 13, 6, '20:00', [
      { ref: { week: 13, sport: 'RUN', role: 'RACE' }, completed: true, minutes: 52, response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' } },
      runsDone(13),
    ]),
    runs('w14', 14), runs('w15', 15),
  ];
  meta['R7D-D09'] = { tz, start };
  cases.push({
    caseId: 'R7D-D09',
    authorIntent: 'A formerly experienced runner restarts from 20 minutes a week after five months off, then mid-program signs up for a 10K, and later the race is moved two weeks earlier. It probes that past experience does not override current capacity, that a shortened but tolerated run is not treated as intolerance, and that goal and event-date changes re-plan without compressing load.',
    coverageTags: ['RUN_ONLY', 'RESTART', 'RETURN_LONG', 'RUN_EXP_EXPERIENCED', 'STR_EXP_NONE', 'H16', 'FREQ_LOW', 'NON_RACE', 'RACE_10K', 'GOAL_CHANGE', 'EVENT_DATE_CHANGE', 'SHORTENED_RUNS', 'START_NON_MONDAY', 'TIMEZONE', 'TAPER', 'RACE_WEEK', 'POST_RACE'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2027-01-07', startDate: start, weeks: 16, timezoneOffsetMinutes: tz,
      athlete,
      schedule: { runDays: [1, 3, 5], strengthDays: [], runTurn: 'AM', runMinutes: 45, longRunDay: 1, longRunMinutes: 90 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d09-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'A nonclinical past break with a known current level is plannable.'),
      E('d09-e02', 'GENERATE', 'DOMAIN_ORACLE', absent([0, 1], 'RUN', ['QUALITY']), 'The first two weeks of a restart are easy running only.'),
      E('d09-e03', 'GENERATE', 'DOMAIN_ORACLE', phase(0, ['RETURN', 'ESTABLISHMENT']), 'The first week is a return/establishment week.'),
      E('d09-e04', 'GENERATE', 'DOMAIN_ORACLE', judged('Week-0 running totals roughly 30-70 minutes in short easy runs (no run longer than about 30 minutes), anchored on the current 20 minutes per week rather than on the 45/90 minutes available or the former racing history; later progression may be somewhat faster than for a true novice.'), 'Current capacity governs the restart.'),
      E('d09-e05', 'GENERATE', 'INVARIANT_ORACLE', judged('No strength session appears in any week.'), 'Run-only athlete.'),
      E('d09-e06', 'w2', 'DOMAIN_ORACLE', judged('The 60% Monday run (time-limited, compatible response) does not trigger a reduction or a question; week 3 holds or progresses modestly.'), 'A shortened run for a nonclinical, non-physiological reason is not intolerance.'),
      E('d09-e07', 'g5', 'DOMAIN_ORACLE', status('MODIFY'), 'A new race goal needs a new plan.'),
      E('d09-e08', 'g5', 'DOMAIN_ORACLE', phase(15, ['RACE_WEEK']), 'The race is on day 2 of week 15.'),
      E('d09-e09', 'g5', 'DOMAIN_ORACLE', present([15], 'RUN', ['RACE']), 'The race is in the plan.'),
      E('d09-e10', 'g5', 'DOMAIN_ORACLE', judged('The new plan continues from the running actually completed in weeks 0-4; the first race-oriented week is not a jump in volume or intensity, and quality is introduced gradually.'), 'Goal change is not a reset upward.'),
      E('d09-e11', 'ed10', 'DOMAIN_ORACLE', status('MODIFY'), 'The race date changed.'),
      E('d09-e12', 'ed10', 'DOMAIN_ORACLE', phase(13, ['RACE_WEEK']), 'The new race date is day 2 of week 13.'),
      E('d09-e13', 'ed10', 'DOMAIN_ORACLE', present([13], 'RUN', ['RACE']), 'The race is on the new date.'),
      E('d09-e14', 'ed10', 'DOMAIN_ORACLE', absent([15], 'RUN', ['RACE']), 'No race remains on the old date.'),
      E('d09-e15', 'ed10', 'DOMAIN_ORACLE', phase(14, ['POST_EVENT', 'NEXT_BLOCK']), 'The week after the new race date is post-event.'),
      E('d09-e16', 'ed10', 'DOMAIN_ORACLE', judged('The earlier date is absorbed by shortening the remaining build and taper, not by increasing weekly running load or the long run faster than before the change.'), 'Never compress progression to fit a moved race.'),
      E('d09-e17', 'w13', 'DOMAIN_ORACLE', absent([14], 'RUN', ['QUALITY']), 'Easy running the week after the race.'),
    ],
    metamorphicRelations: [
      variant({ intakePatch: { athlete: athleteNoPause } }, 'w4', 'NOT_LOWER_RUN_LOAD', 'The same athlete without the declared past pause (same current 20 minutes a week) should not get a lower running load: the declared break can only make the coach more cautious, never less.'),
      { relation: 'CALENDAR_SHIFT' },
      { relation: 'RESEND', atStep: 'w13' },
    ],
    independentAssessment: ia(
      'Past experience helps the rate of progression but the starting point must be today\'s capacity: 20 minutes a week. The moved race shortens the time to prepare; the right reaction is a shorter build and taper, not a steeper ramp.',
      'Start with three short easy runs (e.g., 15-25 minutes), progress about 10-20% per week with a step-back week, add strides then gentle threshold work only after ~3-4 weeks, long run on Saturday growing from ~25 to ~60-75 minutes. On the goal change, plan toward the 10K from the current level. On the date change, re-plan with the taper starting about 7-10 days before the new date and a post-race easy week, without raising the weekly load.',
      ['Keeping all running easy until the goal change.', 'Accepting that a 50-minute target may not be reached and keeping the plan unchanged in load.', 'A one-week taper only (race week).'],
      ['Starting at 45-minute runs and a 90-minute long run because of experience.', 'Quality in the first two weeks.', 'Reducing load after the time-limited shortened run.', 'Increasing volume steeply after the race moves earlier.', 'Leaving the race on the old date or racing twice.']),
    domainNotes: 'The former half-marathon history cannot be given as a performance anchor because its date is before the case window; it is stated in the pause reason text only.',
  });
}

// ---------------------------------------------------------------- D10 a break whose reason may be clinical: free text first, then illness, then qualified clearance
{
  const start = '2026-11-14'; const tz = 60; const C = cal(start, tz); // Saturday start, Berlin
  const obs = '2026-11-12T19:00:00+01:00';
  const kx = (id, sets, reps, value, convention, rir) => ({ id, sets, reps, load: { value, unit: 'KG', convention }, rir, current: true, familiar: true, tolerated: true, observedAt: obs });
  const both = (id, w) => fullWeek(id, w, 6, '20:00', ['RUN', 'STRENGTH']);
  const timeline = [
    both('w0', 0), both('w1', 1), both('w2', 2), both('w3', 3),
    { stepId: 'r5', at: at(5, 0, '06:30'), event: { kind: 'RETURN_AFTER_PAUSE', interruption: { startDate: C.date(4, 1), endDate: C.date(4, 6), days: 6, reason: 'Had a bad flu with a fever for three days; feeling better now.' } },
      observations: [{ ref: { week: 4, sport: 'RUN', day: 0 }, completed: true, asPrescribed: true, response: OK }],
      note: 'The break is described only in free text: no category, no nonclinical or clinical flag.' },
    { stepId: 'c5', at: at(5, 0, '10:00'), event: { kind: 'RETURN_AFTER_PAUSE', interruption: { startDate: C.date(4, 1), endDate: C.date(4, 6), days: 6, reasonCategory: 'ILLNESS', clinicalReason: true, reason: 'Flu with fever.' } }, note: 'The athlete states the category: illness.' },
    { stepId: 'cl6', at: at(6, 0, '06:30'), clearance: 'QUALIFIED_CLEARANCE',
      event: { kind: 'RETURN_AFTER_PAUSE',
        interruption: { startDate: C.date(4, 1), endDate: C.date(5, 6), days: 13, reasonCategory: 'ILLNESS', clinicalReason: true, reason: 'Flu; the GP cleared a gradual return on Thursday of week 5.' },
        currentDemonstration: { observedAt: C.ts(5, 5, '17:30'), sport: 'RUN', family: 'EASY', minutes: 20, completed: true, effort: 'CONVERSATIONAL', response: 'COMPATIBLE', ordinaryFunction: 'COMPATIBLE', nextDayFunction: 'NORMAL' } },
      note: 'Qualified clearance, with an easy 20-minute run done after the GP visit.' },
    both('w6', 6), both('w7', 7), both('w8', 8),
  ];
  meta['R7D-D10'] = { tz, start };
  cases.push({
    caseId: 'R7D-D10',
    authorIntent: 'A hybrid athlete misses a week with flu and first describes it only in free text, then names it as illness, then returns after a qualified clearance with a short demonstration run. It probes that free text is not a nonclinical category, that an illness break routes to a human with nothing prescribed, and that the post-clearance return is gradual.',
    coverageTags: ['BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'GYM', 'START_NON_MONDAY', 'TIMEZONE', 'CLINICAL_PAUSE', 'CLINICAL_SIGNAL', 'RETURN_MODERATE', 'UNREPORTED_WEEKS'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2026-11-13', startDate: start, weeks: 12, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd10-lena', ageYears: 33, sex: 'F',
        eligibility: eligOK('2026-11-13'),
        goals: { run: 'REGULAR', strength: 'STRENGTH' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 80, strengthDaysPerWeek: 2 },
        knownExercises: [
          kx('back-squat', 3, 6, 70, 'TOTAL', 2),
          kx('db-bench-press', 3, 8, 20, 'PER_HAND', 2),
          kx('barbell-row', 3, 8, 50, 'TOTAL', 2),
          kx('db-rdl', 3, 8, 20, 'PER_HAND', 2),
        ],
        equipment: ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'PULL_UP_BAR', 'BODYWEIGHT'],
      },
      schedule: { runDays: [0, 2, 4], strengthDays: [3, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 50, longRunDay: 0, longRunMinutes: 100 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d10-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d10-e02', 'r5', 'DOMAIN_ORACLE', status('ASK', 'CLINICAL_HUMAN_REQUIRED'), 'Free text alone is asked about; routing straight to a human because the text mentions fever is cautious and acceptable. Treating it as a nonclinical break is not.'),
      E('d10-e03', 'r5', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed while the nature of the break is unresolved.'),
      E('d10-e04', 'r5', 'INVARIANT_ORACLE', judged('The coach does not treat the free-text break as nonclinical and does not plan a return from it.'), 'A break is nonclinical only with a nonclinical category.'),
      E('d10-e05', 'c5', 'INVARIANT_ORACLE', status('CLINICAL_HUMAN_REQUIRED'), 'An illness break routes to a qualified human.'),
      E('d10-e06', 'c5', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed while the clinical route stands.'),
      E('d10-e07', 'cl6', 'DOMAIN_ORACLE', status('MODIFY'), 'After clearance a return plan is needed.'),
      E('d10-e08', 'cl6', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending after clearance and a full description of the break.'),
      E('d10-e09', 'cl6', 'DOMAIN_ORACLE', qkind(null), 'The break covers every missed session.'),
      E('d10-e10', 'cl6', 'DOMAIN_ORACLE', absent([6], 'RUN', ['QUALITY']), 'No hard running in the first week back after a febrile illness.'),
      E('d10-e11', 'cl6', 'DOMAIN_ORACLE', cmp('LONG', 6, '<', 3), 'The first long run back is shorter than the last pre-illness long run.'),
      E('d10-e12', 'cl6', 'DOMAIN_ORACLE', judged('Week 6 running is clearly below week 3 (roughly half to two-thirds), strength uses reduced sets or loads with more reserve, and the plan ramps back to the pre-illness level over about two to three weeks.'), 'Gradual return after 13 days off with illness.'),
      E('d10-e13', 'cl6', 'NOT_EVALUABLE_DOMAIN', judged('Whether a return 13 days after a febrile illness is medically appropriate for this athlete.'), 'Clinical judgment; the clearance is the qualified human\'s.'),
    ],
    metamorphicRelations: [
      { relation: 'CALENDAR_SHIFT' },
      { relation: 'RENAME_OPAQUE_IDS' },
    ],
    independentAssessment: ia(
      'Flu with fever is a clinical reason. The athlete first only describes it in words, so the coach must not decide for her that it was nonclinical. Once named as illness, a qualified human must clear the return; after clearance, the demonstration run (20 easy minutes, normal next day) supports a cautious restart.',
      'At r5, ask for the category of the break (or route to a human); prescribe nothing. At c5, CLINICAL_HUMAN_REQUIRED. At cl6, plan a return week at roughly 50-65% of the pre-illness running with no quality and a shorter long run, strength at reduced volume and higher reps in reserve, then rebuild over two to three weeks if responses stay compatible.',
      ['Routing to a human already at r5.', 'A return week with only easy runs and a single strength session.', 'Phase RETURN for week 6.'],
      ['Planning a return at r5 from the free text.', 'Resuming at the pre-illness level after clearance.', 'Prescribing anything between c5 and cl6.', 'The coach clearing the athlete itself because she says she feels better.']),
    domainNotes: 'The demonstration run happened after the GP visit and before the clearance step was recorded. Steps carry the default re-answered eligibility (nothing clinical at the time of answering).',
  });
}

// ---------------------------------------------------------------- D11 strength-first: pain in one exercise, qualified clearance, then a substitution
{
  const start = '2027-02-01'; const tz = -420; const C = cal(start, tz); // Monday start, Arizona (no daylight saving)
  const obs = '2027-01-27T18:00:00-07:00';
  const kx = (id, sets, reps, value, convention, rir) => ({ id, sets, reps, load: { value, unit: 'KG', convention }, rir, current: true, familiar: true, tolerated: true, observedAt: obs });
  const both = (id, w, extra) => fullWeek(id, w, 6, '20:00', ['RUN', 'STRENGTH'], extra);
  const timeline = [
    both('w0', 0), both('w1', 1),
    { stepId: 'pt2', at: at(2, 0, '20:30'),
      event: { kind: 'EXERCISE_SUBSTITUTION', substitution: { exerciseRef: { week: 2, day: 0, pattern: 'SQUAT' }, reason: 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', pain: true, text: 'Sharp pain at the front of the right knee at the bottom of every back squat rep; it stopped when I stopped squatting.' } },
      eligibility: { status: 'CLINICAL', assessedAt: C.date(2, 0), pain: true, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false },
      observations: [{ ref: { week: 2, sport: 'STRENGTH', day: 0 }, completed: false }],
      note: 'The athlete picks "discomfort or preference" but reports pain.' },
    { stepId: 'cl2', at: at(2, 4, '12:00'), clearance: 'QUALIFIED_CLEARANCE',
      event: { kind: 'EXERCISE_SUBSTITUTION', substitution: { exerciseRef: { week: 2, day: 4, pattern: 'SQUAT' }, reason: 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', nonclinicalConfirmed: true, pain: false, to: 'leg-press', text: 'A physiotherapist assessed the knee on Thursday and cleared training; prefers leg press instead of back squat for now.' } },
      observations: [{ ref: { week: 2, sport: 'RUN', day: 1 }, completed: false }, { ref: { week: 2, sport: 'STRENGTH', day: 2 }, completed: false }],
      note: 'Qualified clearance; the substitution is now a confirmed nonclinical preference.' },
    review('w2', 2, 6, '20:00', [
      { ref: { week: 2, sport: 'STRENGTH', day: 4 }, completed: true, asPrescribed: true, loadsByPattern: { SQUAT: 150 }, response: OK },
      { ref: { week: 2, sport: 'RUN', day: 5 }, completed: true, asPrescribed: true, response: OK },
    ]),
    both('w3', 3, { confirmPendingLoads: true }),
    both('w4', 4), both('w5', 5),
  ];
  meta['R7D-D11'] = { tz, start };
  cases.push({
    caseId: 'R7D-D11',
    authorIntent: 'An experienced lifter on a strength-first plan reports sharp knee pain in the back squat while labelling it as discomfort. After a qualified clearance he asks for leg press instead. It probes that pain in one exercise routes to a human (regardless of the chosen label), that nothing is prescribed until clearance, and that the cleared substitution stays within the same pattern without disturbing the rest of the program.',
    coverageTags: ['STRENGTH_FIRST', 'NON_RACE', 'H12', 'STR_EXP_EXPERIENCED', 'RUN_EXP_NOVICE', 'GYM', 'TIMEZONE', 'CLINICAL_SIGNAL', 'SUBSTITUTION', 'SUBSTITUTION_PAIN_CLEARANCE', 'LOAD_CONFIRMATION', 'MIXED_EXECUTION'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2027-01-29', startDate: start, weeks: 12, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd11-dev', ageYears: 39, sex: 'M', heightCm: 183, weightKg: 92,
        eligibility: eligOK('2027-01-29'),
        goals: { run: 'GENERAL', strength: 'STRENGTH' },
        runExperience: 'NOVICE', strengthExperience: 'EXPERIENCED',
        recent: { runDaysPerWeek: 1, runMinutesPerWeek: 30, longestRunMinutes: 30, strengthDaysPerWeek: 4 },
        knownExercises: [
          kx('back-squat', 5, 5, 140, 'TOTAL', 2),
          kx('bench-press', 5, 5, 100, 'TOTAL', 2),
          kx('barbell-rdl', 4, 6, 120, 'TOTAL', 2),
          kx('barbell-row', 4, 8, 80, 'TOTAL', 2),
          kx('pull-up', 4, 6, 0, 'BODYWEIGHT', 2),
          kx('db-overhead-press', 3, 8, 22, 'PER_HAND', 2),
        ],
        equipment: GYM_FULL,
        exerciseRotationPreference: 'FIXED',
        strengthPreferences: { emphasis: ['LOWER'], movementPriorities: ['SQUAT', 'HINGE', 'PUSH', 'PULL'] },
      },
      schedule: { runDays: [1, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 35, strengthMinutes: 75, longRunDay: 5, longRunMinutes: 50 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d11-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d11-e02', 'GENERATE', 'DOMAIN_ORACLE', judged('The main lifts start from the known loads (KNOWN, not ESTABLISH) with low reps and reps in reserve of about 1-3, the squat pattern appears on day 0 and on at least one other strength day, and running stays easy and short.'), 'Strength-first for an experienced lifter.'),
      E('d11-e03', 'GENERATE', 'DOMAIN_ORACLE', absent([0, 1, 2, 3], 'RUN', ['QUALITY']), 'A novice runner with a general running goal.'),
      E('d11-e04', 'pt2', 'INVARIANT_ORACLE', status('CLINICAL_HUMAN_REQUIRED'), 'Pain with an exercise routes to a qualified human, whatever reason label the athlete picked.'),
      E('d11-e05', 'pt2', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed while the clinical route stands.'),
      E('d11-e06', 'pt2', 'INVARIANT_ORACLE', judged('The coach does not perform the substitution itself or continue with a "pain-free" alternative while the route stands.'), 'The coach cannot clear a clinical route.'),
      E('d11-e07', 'cl2', 'DOMAIN_ORACLE', status('MODIFY'), 'The cleared substitution changes the plan.'),
      E('d11-e08', 'cl2', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending after clearance.'),
      E('d11-e09', 'cl2', 'DOMAIN_ORACLE', judged('From the Friday session of week 2 on, the back squat is replaced by the leg press (or, if the coach declines the exact request, another squat-pattern exercise available in the gym), the leg press starts at an ESTABLISH or conservative load, and the other lifts keep their known loads and the weekly structure.'), 'Same-pattern substitution within equipment.'),
      E('d11-e10', 'w3', 'DOMAIN_ORACLE', judged('After the logged 150 kg leg-press load is confirmed, later leg-press sessions use it as the reference (FROM_LOG or KNOWN) and the back squat does not return on its own.'), 'Confirmed first logged load becomes the reference.'),
      E('d11-e11', 'cl2', 'NOT_EVALUABLE_DOMAIN', judged('Whether leg press is clinically appropriate for this knee.'), 'Clinical adequacy belongs to the qualified human.'),
    ],
    metamorphicRelations: [
      { relation: 'LOAD_CONVENTION_EQUIVALENT' },
      { relation: 'RENAME_OPAQUE_IDS' },
    ],
    independentAssessment: ia(
      'Sharp, reproducible joint pain under load is a clinical signal even when the athlete calls it discomfort. After a physiotherapist clears training, the athlete\'s preferred same-pattern swap is reasonable and should not disturb the rest of a strength-first program.',
      'At pt2, CLINICAL_HUMAN_REQUIRED and nothing prescribed. At cl2, replace back squat by leg press with an effort-based starting load, keep everything else. After the first logged leg-press load is confirmed, progress from it.',
      ['Replacing back squat with another squat-pattern exercise if leg press were unavailable.', 'Reducing lower-body volume a little in the first week after clearance.'],
      ['Continuing the program with leg press at pt2 without a human.', 'Treating the label "discomfort or preference" as nonclinical despite pain:true.', 'Re-introducing back squat later without the athlete asking.', 'Starting the leg press from a guessed heavy load.']),
    domainNotes: 'The substitution references point at the squat-pattern exercise of day 0 and day 4 of week 2; a three-day strength-first plan for this lifter is expected to train the squat pattern on both. The week-2 Tuesday run and Wednesday strength session fell inside the clinical route and are reported as not done.',
  });
}

// ---------------------------------------------------------------- D12 adverse responses, alone then repeated, then pain; a generic "recovered" does not clear
{
  const start = '2027-02-18'; const tz = 330; const C = cal(start, tz); // Thursday start, India
  const raceDate = C.date(7, 3); // Sunday 2027-04-11
  const ADV = { performance: 'COMPATIBLE', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED' };
  const run = (w, d, extra) => ({ ref: { week: w, sport: 'RUN', day: d }, completed: true, asPrescribed: true, response: OK, ...extra });
  const both = (id, w) => fullWeek(id, w, 6, '20:00', ['RUN', 'STRENGTH']);
  const timeline = [
    both('w0', 0),
    review('w1', 1, 6, '20:00', [run(1, 0), run(1, 3, { response: ADV }), run(1, 5), strengthDone(1)], { note: 'Sunday long run: heavy legs and poor function the next day.' }),
    both('w2', 2),
    review('w3', 3, 6, '20:00', [run(3, 0), run(3, 3, { response: ADV }), run(3, 5, { response: { performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED' } }), strengthDone(3)], { note: 'The long run again, and now the Tuesday run too.' }),
    review('w4', 4, 6, '20:00', [run(4, 0), { ref: { week: 4, sport: 'RUN', day: 3 }, completed: true, fraction: 0.7, response: ADV }, { ref: { week: 4, sport: 'RUN', day: 5 }, completed: false }, strengthDone(4)],
      { eligibility: { status: 'CLINICAL', assessedAt: C.date(4, 6), pain: true, persistentPain: true, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false }, note: 'Shin pain on every run for a week; skipped Tuesday.' }),
    { stepId: 'rec5', at: at(5, 2, '08:00'), event: { kind: 'RECOVERED' }, note: 'A generic "I am recovered" with the eligibility questions re-answered without pain, but no qualified clearance.' },
  ];
  const calm = [both('w0', 0), both('w1', 1), both('w2', 2), both('w3', 3)];
  meta['R7D-D12'] = { tz, start };
  cases.push({
    caseId: 'R7D-D12',
    authorIntent: 'A run-first 10K athlete reports an adverse response once, then repeatedly, then persistent shin pain, then says she is recovered without any clearance. It probes proportionate responses to adverse signals, escalation to the clinical route when pain appears, and that only a qualified human can lift that route.',
    coverageTags: ['RUN_FIRST', 'RACE_10K', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'START_NON_MONDAY', 'TIMEZONE', 'ADVERSE_RESPONSE', 'REPEATED_SIGNAL', 'CLINICAL_SIGNAL', 'SHORTENED_RUNS', 'MIXED_EXECUTION', 'NO_CONSENT'],
    oracleClass: 'INVARIANT_ORACLE',
    intake: intake({
      asOf: '2027-02-17', startDate: start, weeks: 8, timezoneOffsetMinutes: tz, learningConsent: false,
      athlete: {
        id: 'd12-priya', ageYears: 28, sex: 'F',
        eligibility: eligOK('2027-02-17'),
        goals: { run: { kind: 'RACE', event: { kind: '10K', date: raceDate, timeGoalMinutes: 55 } }, strength: 'RUNNING_SUPPORT' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 140, longestRunMinutes: 65, strengthDaysPerWeek: 1 },
        performanceAnchors: [{ kind: 'RACE_RESULT', distance: '10K', minutes: 58, date: '2026-12-06' }],
        equipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT', 'BANDS'],
      },
      schedule: { runDays: [0, 3, 5], strengthDays: [1, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 40, longRunDay: 3, longRunMinutes: 80 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d12-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d12-e02', 'GENERATE', 'DOMAIN_ORACLE', phase(7, ['RACE_WEEK']), 'The race is on day 3 of week 7.'),
      E('d12-e03', 'w1', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'One adverse response is not a clinical signal.'),
      E('d12-e04', 'w1', 'DOMAIN_ORACLE', cmp('LONG', 2, '<=', 1), 'After an adverse long-run response the next long run is not longer.'),
      E('d12-e05', 'w3', 'DOMAIN_ORACLE', cmp('LONG', 4, '<=', 3), 'A repeated adverse response blocks long-run progression.'),
      E('d12-e06', 'w3', 'DOMAIN_ORACLE', judged('After the second adverse long run and an adverse Tuesday run, week 4 reduces running stress (shorter long run and/or easier or fewer hard sessions) rather than just holding it, and does not add strength volume.'), 'Repeated signal warrants a reduction.'),
      E('d12-e07', 'w4', 'INVARIANT_ORACLE', status('CLINICAL_HUMAN_REQUIRED'), 'Persistent pain routes to a qualified human.'),
      E('d12-e08', 'w4', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed while the route stands.'),
      E('d12-e09', 'rec5', 'INVARIANT_ORACLE', status('CLINICAL_HUMAN_REQUIRED'), 'A generic "recovered" and a pain-free re-answer are not a qualified clearance; the coach cannot clear the route.'),
      E('d12-e10', 'rec5', 'INVARIANT_ORACLE', noRx(), 'Still nothing prescribed, including the race.'),
      E('d12-e11', 'w4', 'NOT_EVALUABLE_DOMAIN', judged('Whether and when this athlete can run the 10K.'), 'Clinical judgment.'),
    ],
    metamorphicRelations: [
      variant({ timeline: calm }, 'w3', 'NOT_LOWER_RUN_LOAD', 'The same athlete with every session compatible (no adverse responses) should not end up with a lower running load after week 3 than the athlete who reported adverse responses.'),
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w3' },
      { relation: 'RESEND', atStep: 'w1' },
    ],
    independentAssessment: ia(
      'An adverse next-day response after a long run is common and calls for holding; repeated, it calls for reducing; persistent pain is a clinical matter. A generic "recovered" is neither a fact about training nor a clearance.',
      'w1: keep the week-2 long run at or below week 1. w3: reduce the week-4 long run and soften the quality session. w4: CLINICAL_HUMAN_REQUIRED. rec5: still CLINICAL_HUMAN_REQUIRED until a qualified human clears; the race is not prescribed meanwhile.',
      ['Asking how the athlete feels after the first adverse response, if the plan is not progressed meanwhile.', 'At w3, replacing the quality session with an easy run.'],
      ['Progressing the long run after an adverse response.', 'Routing to a clinician after a single adverse response without pain.', 'Continuing to prescribe running after the pain report.', 'Restarting the plan at rec5 without clearance.']),
    domainNotes: 'Learning consent is off, so the reductions are per-decision responses, not learned patterns. A re-sent first adverse report must not count twice.',
  });
}

// ---------------------------------------------------------------- D13 learning a repeated personal long-run pattern with consent, then consent revoked
{
  const start = '2026-11-22'; const tz = 600; const C = cal(start, tz); // Sunday start, Brisbane (no daylight saving)
  const PATTERN = { performance: 'COMPATIBLE', recovery: 'ADVERSE', effort: 'ON_TARGET', nextDayFunction: 'IMPAIRED' };
  const week = (w, longResp, extra = {}) => review(`w${w}`, w, 6, '20:00', [
    { ref: { week: w, sport: 'RUN', day: 0 }, completed: true, asPrescribed: true, response: longResp },
    { ref: { week: w, sport: 'RUN', day: 2 }, completed: true, asPrescribed: true, response: OK },
    { ref: { week: w, sport: 'RUN', day: 4 }, completed: true, asPrescribed: true, response: OK },
    strengthDone(w),
  ], extra);
  const timeline = range(0, 8).map((w) => week(w, [1, 3, 5].includes(w) ? PATTERN : OK, w === 7 ? { learningConsent: false, note: 'The athlete revokes learning consent.' } : {}));
  meta['R7D-D13'] = { tz, start };
  cases.push({
    caseId: 'R7D-D13',
    authorIntent: 'With learning consent, a hybrid athlete shows the same personal response three times: the long run (and only the long run) leaves him impaired the next day, while every other session is fine. He later revokes consent. It probes that learning, if any, is specific and bounded, never more aggressive than not learning, and stops after revocation.',
    coverageTags: ['BALANCED_HYBRID', 'NON_RACE', 'H12', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'START_NON_MONDAY', 'TIMEZONE', 'LEARNING_PATTERN', 'REPEATED_SIGNAL', 'ADVERSE_RESPONSE', 'CONSENT_REVOKED'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2026-11-20', startDate: start, weeks: 12, timezoneOffsetMinutes: tz, learningConsent: true,
      athlete: {
        id: 'd13-noah', ageYears: 47, sex: 'M',
        eligibility: eligOK('2026-11-20'),
        goals: { run: 'REGULAR', strength: 'GENERAL' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 170, longestRunMinutes: 75, strengthDaysPerWeek: 2 },
        equipment: ['DUMBBELLS', 'BENCH', 'PULL_UP_BAR', 'BANDS', 'BODYWEIGHT'],
      },
      schedule: { runDays: [0, 2, 4], strengthDays: [1, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 45, longRunDay: 0, longRunMinutes: 120 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d13-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d13-e02', 'w1', 'DOMAIN_ORACLE', cmp('LONG', 2, '<=', 1), 'No long-run progression right after an impaired next day.'),
      E('d13-e03', 'w3', 'DOMAIN_ORACLE', cmp('LONG', 4, '<=', 3), 'Same response repeated.'),
      E('d13-e04', 'w5', 'DOMAIN_ORACLE', cmp('LONG', 6, '<=', 5), 'Third occurrence.'),
      E('d13-e05', 'w5', 'DOMAIN_ORACLE', judged('By week 6 the long run is not progressed beyond the duration that repeatedly produced impaired next days, while the other runs and the strength sessions continue normally; any learned adjustment is specific to the long run and modest (it neither removes the long run nor cuts total running drastically).'), 'A personal, specific, bounded pattern.'),
      E('d13-e06', 'w7', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'Revoking learning consent is not a reason to ask or hold.'),
      E('d13-e07', 'w7', 'INVARIANT_ORACLE', judged('After revocation the coach no longer applies or updates a learned personal pattern; the reported facts themselves stay in the record and may still inform ordinary decisions.'), 'Without consent the coach does not learn.'),
    ],
    metamorphicRelations: [
      variant({ intakePatch: { learningConsent: false } }, 'w6', 'NOT_LOWER_RUN_LOAD', 'Without learning consent (same facts), the running load after week 6 should not be lower than with learning: learning from an adverse pattern may only make the coach equally or more careful.'),
      { relation: 'CONSENT_OFF', rationale: 'Central to the case.' },
    ],
    independentAssessment: ia(
      'A 47-year-old whose long runs beyond his current tolerance cost him the next day, three times, while everything else is fine. A good coach recognises that the issue is the long run specifically and stops pushing it; with consent the coach may keep that as a personal tolerance, without consent it should still react to each report.',
      'Hold the long run after each impaired day, and after the third occurrence cap the long run near the last well-tolerated duration for a while (or progress it more slowly), keep the other sessions on their normal progression. After revocation, stop using any stored personal pattern; carry on with ordinary decisions from the facts.',
      ['Splitting the long-run increase into smaller steps rather than capping.', 'Moving some long-run volume into a mid-week easy run within the chosen days.', 'No learned change at all, if each per-decision response already holds the long run.'],
      ['Progressing the long run in weeks 2, 4 or 6.', 'Cutting all running or strength because of a long-run-specific pattern.', 'Learning more aggressive progression from the compatible weeks.', 'Continuing to apply a learned pattern after revocation.']),
    domainNotes: 'The pattern weeks are 1, 3 and 5; weeks 0, 2, 4, 6-8 are fully compatible. Revocation is carried on the week-7 review.',
  });
}

// ---------------------------------------------------------------- D14 no consent, noisy reports, a "too easy" pattern, and an out-of-scope marathon request
{
  const start = '2026-12-09'; const tz = -180; const C = cal(start, tz); // Wednesday start, Buenos Aires
  const run = (w, d, extra) => ({ ref: { week: w, sport: 'RUN', day: d }, completed: true, asPrescribed: true, response: OK, ...extra });
  const lift = (w, d, extra) => ({ ref: { week: w, sport: 'STRENGTH', day: d }, completed: true, asPrescribed: true, response: OK, ...extra });
  const both = (id, w) => fullWeek(id, w, 6, '20:30', ['RUN', 'STRENGTH']);
  const EASY = { performance: 'OVER', recovery: 'COMPATIBLE', effort: 'EASIER', nextDayFunction: 'NORMAL' };
  const noisy = [
    review('w1', 1, 6, '20:30', [run(1, 1), run(1, 3, { response: { performance: 'UNDER', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' }, confounded: true, comparable: false }), run(1, 5), strengthDone(1)], { note: 'Saturday long run at 14:00 in 34 C heat.' }),
    review('w2', 2, 6, '20:30', [run(2, 1, { response: { performance: 'UNDER', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' }, comparable: false }), run(2, 3), run(2, 5), strengthDone(2)], { note: 'Thursday run on a new, hilly route.' }),
  ];
  const timeline = [
    both('w0', 0), ...noisy,
    { stepId: 'tz3', at: at(3, 2, '21:00'), event: { kind: 'PROGRESSION_TOO_EASY' }, targetRef: { week: 3, sport: 'STRENGTH', day: 2 }, observations: [lift(3, 2, { response: EASY })] },
    review('w3', 3, 6, '20:30', [runsDone(3), lift(3, 0), lift(3, 4)]),
    { stepId: 'tz4', at: at(4, 2, '21:00'), event: { kind: 'PROGRESSION_TOO_EASY' }, targetRef: { week: 4, sport: 'STRENGTH', day: 2 }, observations: [lift(4, 2, { response: EASY })] },
    review('w4', 4, 6, '20:30', [runsDone(4), lift(4, 0), lift(4, 4)]),
    { stepId: 'g5', at: at(5, 0, '07:00'), event: { kind: 'GOAL_CHANGE', changes: { goals: { run: { kind: 'RACE', event: { kind: 'MARATHON', date: C.date(7, 4) } }, strength: 'HYPERTROPHY' }, event: { kind: 'MARATHON', date: C.date(7, 4) } } }, note: 'Asks to switch to a marathon in three weeks.' },
    both('w5', 5), both('w6', 6),
  ];
  const clean = [both('w0', 0), both('w1', 1), both('w2', 2)];
  meta['R7D-D14'] = { tz, start };
  cases.push({
    caseId: 'R7D-D14',
    authorIntent: 'A strength-first hybrid athlete without learning consent sends noisy run data (a heat-confounded long run, a non-comparable hilly run), then reports the same strength session as too easy twice, then asks to switch to a marathon. It probes that noise changes nothing, that no personal pattern is learned without consent, and that an out-of-scope request mid-program is not planned.',
    coverageTags: ['STRENGTH_FIRST', 'GENERAL_FITNESS', 'NON_RACE', 'H8', 'RUN_EXP_NOVICE', 'STR_EXP_INTERMEDIATE', 'GYM', 'FREQ_HIGH', 'START_NON_MONDAY', 'TIMEZONE', 'LEARNING_NOISE', 'NO_CONSENT', 'REPEATED_SIGNAL', 'OUT_OF_SCOPE', 'GOAL_CHANGE'],
    oracleClass: 'METAMORPHIC_ORACLE',
    intake: intake({
      asOf: '2026-12-08', startDate: start, weeks: 8, timezoneOffsetMinutes: tz, learningConsent: false,
      athlete: {
        id: 'd14-sofia', ageYears: 26, sex: 'F',
        eligibility: eligOK('2026-12-08'),
        goals: { run: 'GENERAL', strength: 'HYPERTROPHY' },
        runExperience: 'NOVICE', strengthExperience: 'INTERMEDIATE',
        recent: { runDaysPerWeek: 2, runMinutesPerWeek: 70, longestRunMinutes: 40, strengthDaysPerWeek: 3 },
        knownExercises: [
          { id: 'goblet-squat', sets: 3, reps: 10, load: { value: 24, unit: 'KG', convention: 'SINGLE_IMPLEMENT' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-12-05T18:00:00-03:00' },
          { id: 'lat-pulldown', sets: 3, reps: 10, load: { value: 45, unit: 'KG', convention: 'MACHINE_STACK' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-12-05T18:00:00-03:00' },
          { id: 'db-bench-press', sets: 3, reps: 10, load: { value: 14, unit: 'KG', convention: 'PER_HAND' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-12-03T18:00:00-03:00' },
          { id: 'leg-press', sets: 3, reps: 12, load: { value: 100, unit: 'KG', convention: 'MACHINE_STACK' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-12-03T18:00:00-03:00' },
          { id: 'db-rdl', sets: 3, reps: 10, load: { value: 16, unit: 'KG', convention: 'PER_HAND' }, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-12-05T18:00:00-03:00' },
        ],
        equipment: GYM_FULL,
      },
      schedule: { runDays: [1, 3, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 40, strengthMinutes: 60, longRunDay: 3, longRunMinutes: 70 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d14-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d14-e02', 'GENERATE', 'DOMAIN_ORACLE', judged('Strength carries the hypertrophy goal (three sessions, moderate reps, known loads in their own conventions, reps in reserve about 1-3, gradual volume progression); running is easy, modest and progresses slowly from 70 minutes per week.'), 'Strength-first hybrid.'),
      E('d14-e03', 'w2', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'Noise is not a reason to ask or hold.'),
      E('d14-e04', 'tz3', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'A "too easy" report is not a clinical or missing-fact situation.'),
      E('d14-e05', 'tz4', 'INVARIANT_ORACLE', judged('With learning consent off, no personal response pattern is stored or applied; any change after the second "too easy" report is the ordinary per-decision response for that session (for example a normal load or rep step), not a learned faster progression for the athlete.'), 'Without consent the coach does not learn.'),
      E('d14-e06', 'g5', 'INVARIANT_ORACLE', status('UNSUPPORTED', 'INVALID_INPUT'), 'A marathon is outside V1; the request is not planned.'),
      E('d14-e07', 'g5', 'INVARIANT_ORACLE', absent([5, 6, 7], 'RUN', ['RACE']), 'No race is added to the plan in force.'),
      E('d14-e08', 'g5', 'INVARIANT_ORACLE', judged('The plan in force after the request is the previous hypertrophy/general plan, not a marathon build.'), 'An out-of-scope request does not replace the plan.'),
      E('d14-e09', 'w5', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'Training continues normally after the rejected request.'),
    ],
    metamorphicRelations: [
      variant({ timeline: [...clean, ...timeline.slice(3)] }, 'w2', 'SAME_PLAN', 'Replacing the two noisy run reports (heat-confounded, non-comparable route) with clean compatible reports should not change the plan after week 2: noise should change nothing.'),
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w1' },
      { relation: 'CONSENT_OFF' },
    ],
    independentAssessment: ia(
      'Noise should be ignored: a long run slowed by heat with normal recovery, and a hard-feeling run on hills, say nothing about fitness. "Too easy" twice on one strength session can justify the ordinary load/rep step, but without consent it is not stored as a personal trait. A marathon three weeks away is out of scope and also a bad idea for a novice runner.',
      'Keep the plan unchanged after the noisy weeks. After each "too easy" report, apply at most the normal progression step for that session. Reject the marathon request (UNSUPPORTED or an invalid-input response) and keep the current plan.',
      ['A small load step after the first "too easy" report.', 'Explaining that the marathon is outside scope while offering nothing in its place.'],
      ['Reducing the run plan after the heat-confounded long run.', 'Accelerating strength progression for the rest of the program as a learned trait.', 'Building any marathon or long-distance plan.', 'Dropping the existing plan after the rejected request.']),
    domainNotes: 'The marathon event kind is outside the intake vocabulary on purpose; the request is the out-of-scope probe. In weeks 3 and 4 the day-2 strength session is reported by the PROGRESSION_TOO_EASY event and the weekly review reports only the other two strength sessions, to avoid a duplicate with different content.',
  });
}

// ---------------------------------------------------------------- D15 data quality: phone + watch duplicate, UTC-stamped watch data, out-of-order arrival, corrections, a clock in the future
{
  const start = '2026-11-24'; const tz = 660; const C = cal(start, tz); // Tuesday start, Sydney summer time (UTC+11:00)
  const watch = (activityId) => ({ provider: 'watch-b', activityId, quality: 'WEARABLE_FULL' });
  const utc = (week, day, localTime) => new Date(Date.parse(C.ts(week, day, localTime))).toISOString().replace('.000Z', 'Z');
  const run = (w, d, extra) => ({ ref: { week: w, sport: 'RUN', day: d }, completed: true, asPrescribed: true, response: OK, ...extra });
  const history = [
    ['2026-11-04T06:30:00+11:00', 'RUN', 40, 'FULL'], ['2026-11-05T19:30:00Z', 'RUN', 35, 'PARTIAL'], ['2026-11-08T20:05:00Z', 'RUN', 70, 'FULL'],
    ['2026-11-11T06:40:00+11:00', 'RUN', 40, 'FULL'], ['2026-11-13T18:00:00+11:00', 'STRENGTH', 30, 'PARTIAL'], ['2026-11-15T20:10:00Z', 'RUN', 65, 'PARTIAL'],
    ['2026-11-18T06:35:00+11:00', 'RUN', 42, 'FULL'], ['2026-11-21T20:10:00Z', 'RUN', 72, 'FULL'],
  ].map(([startedAt, sport, durationMinutes, completeness], i) => ({ activityId: `wb-h${i + 1}`, provider: 'watch-b', sport, startedAt, durationMinutes, completeness }));
  const w0 = review('w0', 0, 6, '20:00', [
    run(0, 0), run(0, 2),
    run(0, 5, { eventId: 'd15-w0-long-phone', source: { provider: 'phone-app', quality: 'MANUAL' } }),
    run(0, 5, { eventId: 'd15-w0-long-watch', observedAt: utc(0, 5, '07:12'), source: watch('wb-778') }),
    strengthDone(0),
  ], { note: 'The Sunday long run arrives twice: typed in the phone app and synced from the watch, whose timestamp is in UTC (Saturday evening UTC = Sunday morning locally).' });
  const w0single = review('w0', 0, 6, '20:00', [run(0, 0), run(0, 2), run(0, 5, { eventId: 'd15-w0-long-watch', observedAt: utc(0, 5, '07:12'), source: watch('wb-778') }), strengthDone(0)]);
  const w1 = review('w1', 1, 6, '20:00', [
    run(1, 5, { eventId: 'd15-w1-long', reportedAt: C.ts(1, 5, '10:00') }),
    { ref: { week: 1, sport: 'RUN', day: 2 }, completed: true, minutes: 95, response: OK, eventId: 'd15-w1-d2', reportedAt: C.ts(1, 6, '18:00') },
    run(1, 0, { eventId: 'd15-w1-d0', reportedAt: C.ts(1, 6, '18:05') }),
    run(1, 2, { eventId: 'd15-w1-d2-fix', correctionOf: 'd15-w1-d2', correctedAt: C.ts(1, 6, '19:30'), reportedAt: C.ts(1, 6, '19:30') }),
    strengthDone(1),
  ], { note: 'Out of order (Sunday reported before Tuesday) and a typo (95 minutes) corrected before the review is sent.' });
  const w1clean = review('w1', 1, 6, '20:00', [run(1, 0), run(1, 2), run(1, 5), strengthDone(1)]);
  const rest = [
    review('w2', 2, 6, '20:00', [run(2, 0), run(2, 2), { ref: { week: 2, sport: 'RUN', day: 5 }, completed: false, eventId: 'd15-w2-long' }, strengthDone(2)], { note: 'The long run is wrongly reported as not done.' }),
    review('w3', 3, 6, '20:00', [run(2, 5, { eventId: 'd15-w2-long-fix', correctionOf: 'd15-w2-long', correctedAt: C.ts(3, 6, '19:00') }), runsDone(3), strengthDone(3)], { note: 'A week later the athlete corrects the week-2 long run: it was done as prescribed.' }),
    review('w4', 4, 6, '20:00', [run(4, 0), run(4, 2), run(4, 5, { eventId: 'd15-w4-long-skewed', observedAt: C.ts(5, 1, '07:05'), source: watch('wb-901') }), strengthDone(4)], { note: 'The watch clock was set two days ahead: the long run is stamped in the future.' }),
    review('f4', 4, 6, '21:30', [run(4, 5, { eventId: 'd15-w4-long-fixed', observedAt: C.ts(4, 5, '07:05'), source: watch('wb-901') })], { note: 'The watch clock is fixed and the long run re-synced with the right time.' }),
    review('w5', 5, 6, '20:00', [runsDone(5), strengthDone(5)]),
  ];
  const timeline = [w0, w1, ...rest];
  meta['R7D-D15'] = { tz, start };
  cases.push({
    caseId: 'R7D-D15',
    authorIntent: 'A run-first athlete with a partial watch history sends messy data: the same long run from phone and watch (watch stamped in UTC, which falls on the previous calendar day), reports out of order with an in-review correction, a correction a week late, and a watch clock set two days ahead. It probes de-duplication, local-date attribution, correction semantics and future-clock handling.',
    coverageTags: ['RUN_FIRST', 'NON_RACE', 'H8', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_NOVICE', 'WEARABLE_PARTIAL', 'START_NON_MONDAY', 'TIMEZONE', 'DUPLICATE_SOURCES', 'CORRECTION', 'OUT_OF_ORDER', 'CLOCK_SKEW', 'CONTRADICTION', 'SAME_FACTS_DIFFERENT_ORDER'],
    oracleClass: 'METAMORPHIC_ORACLE',
    intake: intake({
      asOf: '2026-11-23', startDate: start, weeks: 8, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd15-mia', ageYears: 30, sex: 'F',
        eligibility: eligOK('2026-11-23'),
        goals: { run: 'PERFORMANCE', strength: 'RUNNING_SUPPORT' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 135, longestRunMinutes: 70, strengthDaysPerWeek: 1 },
        equipment: ['DUMBBELLS', 'BODYWEIGHT', 'BANDS'],
        wearableCapabilities: { provider: 'watch-b', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'PARTIAL', historyWeeks: 3 },
      },
      schedule: { runDays: [0, 2, 5], strengthDays: [1, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 45, longRunDay: 5, longRunMinutes: 90 },
      history,
    }),
    timeline,
    expectedDomainProperties: [
      E('d15-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete intake with a partial history.'),
      E('d15-e02', 'GENERATE', 'DOMAIN_ORACLE', judged('The partial history is read as about three runs a week (about 135-150 minutes, long run near 70 minutes) and one light strength session; UTC-stamped rows are attributed to their local dates; the starting week is near that level, neither from zero nor above it.'), 'Use partial data honestly.'),
      E('d15-e03', 'w0', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'All sessions are reported.'),
      E('d15-e04', 'w0', 'INVARIANT_ORACLE', judged('The phone and watch reports of the Sunday long run are one session (counted once) and the long run is dated on Sunday local time, not Saturday.'), 'De-duplication and local-date attribution.'),
      E('d15-e05', 'w1', 'INVARIANT_ORACLE', judged('The 95-minute typo is superseded by its correction: it is not treated as an overperformance and does not drive any progression; arrival order does not matter.'), 'Correction within the same decision.'),
      E('d15-e06', 'w3', 'DOMAIN_ORACLE', judged('After the late correction, the plan from week 4 treats the week-2 long run as done (no remedial or reduced long run because of a miss that did not happen), while the week-3 decisions already taken are not rewritten.'), 'A correction changes the future plan, never what was already decided or done.'),
      E('d15-e07', 'w4', 'DOMAIN_ORACLE', status('HOLD', 'ASK'), 'A report stamped two days after the decision time cannot be used as given.'),
      E('d15-e08', 'w4', 'INVARIANT_ORACLE', judged('The future-stamped long run is not written to the completed-work record as given (not dated in week 5, not counted as done in week 4 until its time is resolved).'), 'Only reported facts with valid times write history.'),
      E('d15-e09', 'f4', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'The re-synced report resolves the hold.'),
      E('d15-e10', 'f4', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending.'),
    ],
    metamorphicRelations: [
      variant({ timeline: [w0single, w1, ...rest] }, 'w0', 'SAME_PLAN', 'Only the watch report of the long run (no phone duplicate) must give the same plan after week 0.'),
      variant({ timeline: [w0, w1clean, ...rest] }, 'w1', 'SAME_PLAN', 'The same week-1 facts reported in order and without the corrected typo must give the same plan after week 1.'),
      { relation: 'DUPLICATE_SECOND_SOURCE', atStep: 'w5' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w1' },
      { relation: 'RESEND', atStep: 'f4' },
    ],
    independentAssessment: ia(
      'None of these data events is about training: they are about trust in the record. A good coach counts one session once, dates it in the athlete\'s local day, lets a correction replace what it corrects, and refuses to write a fact that claims to come from the future.',
      'Plan from the partial history at about current volume. Count the duplicate long run once on Sunday. Use the corrected week-1 value. After the late correction, plan week 4 as if the week-2 long run was done. Hold (or ask about) the future-stamped report; accept the re-synced one.',
      ['ASK instead of HOLD for the future-stamped report.', 'Keeping the week-4 plan unchanged after the late correction if week 3 had not been reduced.'],
      ['Counting the long run twice or on Saturday.', 'Reacting to the 95-minute typo.', 'Reducing the week-4 long run because of the miss that was later corrected.', 'Accepting a fact dated in the future as done.']),
    domainNotes: 'The CONTRADICTION tag is used for the week-2 "not done" report contradicted a week later by its correction. Week 0 day 5 is a Sunday; 07:12 local is 20:12 UTC on Saturday.',
  });
}

// ---------------------------------------------------------------- D16 more chosen days than capacity, mixed execution, an empty review and a partial answer (4 weeks)
{
  const start = '2026-11-07'; const tz = 120; const C = cal(start, tz); // Saturday start, Athens
  const run = (w, d, extra) => ({ ref: { week: w, sport: 'RUN', day: d }, completed: true, asPrescribed: true, response: OK, ...extra });
  const miss = (w, d, sport = 'RUN') => ({ ref: { week: w, sport, day: d }, completed: false });
  const HARD = { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' };
  const week1Facts = [
    run(1, 0),
    { ref: { week: 1, sport: 'RUN', day: 1 }, completed: true, fraction: 0.5, response: { performance: 'UNDER', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' } },
    miss(1, 2), run(1, 3), miss(1, 4), miss(1, 5),
  ];
  const w0 = review('w0', 0, 6, '20:00', [
    run(0, 0),
    { ref: { week: 0, sport: 'RUN', day: 1 }, completed: true, fraction: 0.6, response: { performance: 'UNDER', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL' } },
    miss(0, 2), run(0, 3), miss(0, 4), run(0, 5, { response: HARD }),
    { ref: { week: 0, sport: 'STRENGTH', day: 0 }, completed: true, firstExercises: 2, response: OK },
    { ref: { week: 0, sport: 'STRENGTH', day: 2 }, completed: true, asPrescribed: true, response: OK },
    miss(0, 4, 'STRENGTH'),
  ], { note: 'Mixed execution: four of six runs, one cut short; two of three strength sessions, one partial.' });
  const tail = [fullWeek('w2', 2, 6, '20:00', ['RUN', 'STRENGTH']), fullWeek('w3', 3, 6, '20:00', ['RUN', 'STRENGTH'])];
  const timeline = [
    w0,
    review('w1', 1, 6, '20:00', [], { note: 'Empty weekly review: opened and sent with no reports.' }),
    { stepId: 'p1', at: at(1, 6, '21:15'), event: { kind: 'WEEKLY_REVIEW' }, answer: { overrides: [week1Facts[1], week1Facts[3]] }, note: 'Partial answer: only Sunday (half) and Tuesday (done).' },
    { stepId: 'a2', at: at(2, 0, '06:30'), event: { kind: 'WEEKLY_REVIEW' }, answer: { overrides: [week1Facts[0], week1Facts[2], week1Facts[4], week1Facts[5]] }, note: 'The rest, next morning: Saturday done, Monday, Wednesday and Thursday not done. Week-1 strength stays unreported.' },
    ...tail,
  ];
  const onTime = [w0, review('a2', 1, 6, '20:00', week1Facts), ...tail];
  meta['R7D-D16'] = { tz, start };
  cases.push({
    caseId: 'R7D-D16',
    authorIntent: 'A heavy, novice 44-year-old who currently runs once a week picks six run days and three strength days for a 4-week general-fitness program. He then does about half of it, sends an empty review, and answers in two pieces. It probes capacity-aware planning on chosen days, mixed and shortened execution, the empty review, a partial answer, and that late answers equal on-time ones.',
    coverageTags: ['GENERAL_FITNESS', 'BALANCED_HYBRID', 'NON_RACE', 'H4', 'RUN_EXP_NOVICE', 'STR_EXP_NONE', 'TOO_MANY_DAYS', 'FREQ_HIGH', 'SHARED_DAYS', 'LOW_DATA', 'START_NON_MONDAY', 'TIMEZONE', 'MIXED_EXECUTION', 'SHORTENED_RUNS', 'EMPTY_REVIEW', 'PARTIAL_ANSWER', 'LATE_ANSWER', 'UNREPORTED_WEEKS', 'SAME_FACTS_DIFFERENT_ORDER'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2026-11-05', startDate: start, weeks: 4, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd16-yannis', ageYears: 44, sex: 'M', heightCm: 178, weightKg: 94,
        eligibility: eligOK('2026-11-05'),
        goals: { run: 'GENERAL', strength: 'GENERAL' },
        runExperience: 'NOVICE', strengthExperience: 'NONE',
        recent: { runDaysPerWeek: 1, runMinutesPerWeek: 25, longestRunMinutes: 25, strengthDaysPerWeek: 0 },
        equipment: ['BODYWEIGHT', 'BANDS'],
      },
      schedule: { runDays: [0, 1, 2, 3, 4, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 30, strengthMinutes: 30, longRunDay: 1, longRunMinutes: 60 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d16-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED', 'ASK'), 'Honouring the chosen days with light sessions is preferred; asking about capacity is acceptable.'),
      E('d16-e02', 'GENERATE', 'DOMAIN_ORACLE', judged('Week-0 total running is close to current capacity (roughly 30-70 minutes spread over the six days as walks, walk/jog, very short easy runs or rest by design), not six 30-minute runs plus a 60-minute long run.'), 'Capacity, not availability, sets the dose.'),
      E('d16-e03', 'GENERATE', 'DOMAIN_ORACLE', absent([0, 1, 2, 3], 'RUN', ['QUALITY']), 'No harder running for a novice in a 4-week general program.'),
      E('d16-e04', 'GENERATE', 'INVARIANT_ORACLE', judged('Strength uses only bodyweight and bands; on shared days running is AM and strength PM.'), 'Equipment and turns.'),
      E('d16-e05', 'w0', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'Everything is reported.'),
      E('d16-e06', 'w0', 'DOMAIN_ORACLE', qkind(null), 'No session of week 0 is unknown.'),
      E('d16-e07', 'w0', 'DOMAIN_ORACLE', judged('Week 1 does not increase running over week 0; it holds or reduces, and does not schedule make-up sessions for the two missed runs.'), 'Mixed execution with two shortened/hard runs.'),
      E('d16-e08', 'w1', 'DOMAIN_ORACLE', status('ASK'), 'An empty review leaves all week-1 runs unknown.'),
      E('d16-e09', 'w1', 'DOMAIN_ORACLE', qkind('UNREPORTED_TRAINING'), 'The question lists the unreported runs.'),
      E('d16-e10', 'w1', 'INVARIANT_ORACLE', noRx(), 'Nothing prescribed while the question stands.'),
      E('d16-e11', 'p1', 'DOMAIN_ORACLE', status('ASK'), 'Four runs are still unknown after the partial answer.'),
      E('d16-e12', 'p1', 'DOMAIN_ORACLE', validity(RECON), 'Still pending.'),
      E('d16-e13', 'a2', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'All week-1 runs are now known.'),
      E('d16-e14', 'a2', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending (strength unknowns do not block run doses).'),
      E('d16-e15', 'a2', 'DOMAIN_ORACLE', judged('Week 2 running is not above week 1\'s planned load; the plan adapts toward the two to three sessions he actually does (lighter content on the other chosen days), without catch-up.'), 'Plan for what the athlete does.'),
    ],
    metamorphicRelations: [
      variant({ timeline: onTime }, 'a2', 'SAME_PLAN', 'The same week-1 facts delivered in the week-1 review (on time) instead of an empty review plus a two-part answer must give the same plan.'),
      { relation: 'CARRIER_CLINICAL', atStep: 'a2' },
      { relation: 'PERMUTE_OBSERVATIONS', atStep: 'w0' },
    ],
    independentAssessment: ia(
      'Enthusiasm exceeds capacity: one 25-minute run a week now, nine chosen sessions a week asked. The chosen days must be respected, but the dose must come from capacity; then execution shows what he can sustain.',
      'Put light content on all chosen days (walks, short walk/jog, mobility-like bodyweight strength) with total running near 40-60 minutes, no hard running. After week 0 hold or reduce. At the empty review, ask about the week-1 runs; after the partial answer, keep asking about the rest; after the full answer, plan week 2 around the ~3 sessions he really does.',
      ['ASK at onboarding to confirm capacity before planning.', 'REST_BY_DESIGN on some chosen run days.', 'Treating the shortened long run as a sign to keep the long session short.'],
      ['Six full runs per week in week 0.', 'Progression after a week of misses.', 'Treating unknown week-1 runs as done or missed.', 'Clearing the question after the partial answer.', 'Different plans depending only on when the same week-1 facts arrived.']),
    domainNotes: 'The two-part answer uses explicit overrides so it does not depend on which sessions the pending question lists. Week-1 strength is never reported in either version.',
  });
}

// ---------------------------------------------------------------- D17 strength only: older novice, two days, first logged loads, fatigue, eligibility left unanswered mid-program
{
  const start = '2026-12-06'; const tz = -480; const C = cal(start, tz); // Sunday start, US Pacific standard time
  const lift = (w, d, extra) => ({ ref: { week: w, sport: 'STRENGTH', day: d }, completed: true, asPrescribed: true, response: OK, ...extra });
  const wk = (id, w, extra) => review(id, w, 6, '18:00', [strengthDone(w)], extra);
  const timeline = [
    review('w0', 0, 6, '18:00', [strengthDone(0, { loadsByPattern: { SQUAT: 20, HINGE: 12, PUSH: 10, PULL: 20 } })], { note: 'First sessions: she logs the working loads she found.' }),
    wk('w1', 1, { confirmPendingLoads: true }),
    { stepId: 'f2', at: at(2, 1, '06:30'), event: { kind: 'SYSTEMIC_FATIGUE', signals: { region: 'ALL' } }, note: 'Slept badly for three nights looking after a grandchild; very tired before the Monday session.' },
    wk('w2', 2),
    wk('u3', 3, { eligibility: { status: 'UNKNOWN', assessedAt: C.date(3, 6) }, note: 'She skips the eligibility questions this week.' }),
    wk('e3', 3, { note: 'One hour later she answers the eligibility questions (nothing clinical) and re-sends the week.' }),
    wk('w4', 4),
    review('w5', 5, 6, '18:00', [lift(5, 1), lift(5, 4, { response: { performance: 'COMPATIBLE', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED' } })], { note: 'Very sore for two days after Thursday.' }),
    wk('w6', 6), wk('w7', 7),
  ];
  timeline.find((s) => s.stepId === 'e3').at = at(3, 6, '19:00');
  meta['R7D-D17'] = { tz, start };
  cases.push({
    caseId: 'R7D-D17',
    authorIntent: 'A 63-year-old who has never lifted starts a twice-weekly machine and dumbbell program, logs her first working loads, has a tired week, skips the eligibility questions once, and later reports an adverse strength response. It probes strength-only planning with no running, first-load confirmation, nonclinical fatigue, mid-program unknown eligibility and a single adverse strength response.',
    coverageTags: ['STRENGTH_ONLY', 'GENERAL_FITNESS', 'H8', 'STR_EXP_NONE', 'RUN_EXP_NONE', 'GYM', 'FREQ_LOW', 'LOW_DATA', 'COLD_START', 'START_NON_MONDAY', 'TIMEZONE', 'LOAD_CONFIRMATION', 'FATIGUE_SYSTEMIC', 'ELIGIBILITY_UNKNOWN', 'ADVERSE_RESPONSE'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2026-12-04', startDate: start, weeks: 8, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd17-helen', ageYears: 63, sex: 'F', heightCm: 160, weightKg: 66,
        eligibility: eligOK('2026-12-04'),
        goals: { run: 'NONE', strength: 'GENERAL' },
        runExperience: 'NONE', strengthExperience: 'NONE',
        recent: { runDaysPerWeek: 0, strengthDaysPerWeek: 0 },
        equipment: ['MACHINES', 'DUMBBELLS', 'BENCH', 'BODYWEIGHT'],
      },
      schedule: { runDays: [], strengthDays: [1, 4], strengthTurn: 'AM', strengthMinutes: 45 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d17-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'A healthy older adult is in scope.'),
      E('d17-e02', 'GENERATE', 'INVARIANT_ORACLE', absent(range(0, 7), 'RUN', RUN_LIVE_ROLES), 'No running for a strength-only athlete with no run days.'),
      E('d17-e03', 'GENERATE', 'DOMAIN_ORACLE', judged('Two full-body sessions of simple machine/dumbbell/bodyweight exercises covering the main patterns, ESTABLISH loads (no guessed numbers), low volume (about 1-3 sets) and reps in reserve of about 3 or more at first, progressing slowly; only machines, dumbbells, bench or bodyweight are used.'), 'A true beginner at 63.'),
      E('d17-e04', 'w0', 'DOMAIN_ORACLE', judged('The first logged loads are presented for confirmation and are not used to raise the loads before they are confirmed.'), 'First logged loads become the reference only after confirmation.'),
      E('d17-e05', 'f2', 'DOMAIN_ORACLE', status('MODIFY', 'KEEP'), 'General fatigue from poor sleep is not a clinical signal.'),
      E('d17-e06', 'f2', 'DOMAIN_ORACLE', judged('The Monday session is eased (fewer sets or more reps in reserve, or shortened) and nothing progresses that day.'), 'Respond to systemic fatigue.'),
      E('d17-e07', 'u3', 'INVARIANT_ORACLE', status('ASK', 'HOLD'), 'Unanswered eligibility is a question; it is never a clearance and never a presumed illness.'),
      E('d17-e08', 'u3', 'INVARIANT_ORACLE', noRx(), 'Nothing is prescribed until eligibility is answered.'),
      E('d17-e09', 'e3', 'DOMAIN_ORACLE', status('KEEP', 'MODIFY'), 'Eligibility answered with nothing clinical; the re-sent week is counted once.'),
      E('d17-e10', 'e3', 'DOMAIN_ORACLE', validity(VALID), 'Nothing pending.'),
      E('d17-e11', 'w5', 'DOMAIN_ORACLE', judged('After the adverse Thursday response, the next week does not increase lower-body load or volume; a small reduction or a repeat is appropriate, and there is no clinical route (no pain was reported).'), 'Single adverse strength response.'),
    ],
    metamorphicRelations: [
      { relation: 'RESEND', atStep: 'e3' },
      { relation: 'LOAD_CONVENTION_EQUIVALENT' },
      { relation: 'CALENDAR_SHIFT' },
    ],
    independentAssessment: ia(
      'An older beginner benefits greatly from simple, regular resistance training; the risks are too much volume, guessed loads and over-reacting to normal tiredness or soreness. Unanswered eligibility mid-program must pause prescription until answered.',
      'Two full-body sessions (leg press or sit-to-stand/box squat, a hinge, a push, a pull, a trunk exercise), effort-based starting loads, confirm the first logged loads, then small progressions. Ease the session on the fatigue day. Ask when eligibility is unanswered; continue once answered. After the adverse response, repeat or slightly reduce the lower-body work.',
      ['Starting with machines only.', 'HOLD instead of ASK when eligibility is unanswered.', 'Postponing the fatigue-day session within the chosen days.'],
      ['Any running session.', 'Fixed guessed loads at the start.', 'Routing fatigue or soreness to a clinician.', 'Continuing to prescribe while eligibility is unanswered.', 'Counting the re-sent week twice.']),
    domainNotes: 'loadsByPattern values are kilograms in the convention of whatever exercise the coach planned for that pattern; they are modest so they are plausible for a machine or a dumbbell variant.',
  });
}

// ---------------------------------------------------------------- D18 moderate vacation found through a question, then a long work break with a demonstration (16 weeks)
{
  const start = '2027-01-06'; const tz = -300; const C = cal(start, tz); // Wednesday start, Bogota (no daylight saving)
  const obs = '2027-01-04T19:00:00-05:00';
  const kx = (id, sets, reps, value, convention, rir) => ({ id, sets, reps, load: { value, unit: 'KG', convention }, rir, current: true, familiar: true, tolerated: true, observedAt: obs });
  const both = (id, w) => fullWeek(id, w, 6, '21:00', ['RUN', 'STRENGTH']);
  const vacation = { startDate: C.date(4, 0), endDate: C.date(6, 2), days: 17, reasonCategory: 'VACATION', nonclinical: true, reason: 'Family trip; no training at all.' };
  const demo = { observedAt: C.ts(13, 5, '18:00'), sport: 'RUN', family: 'EASY', minutes: 20, completed: true, effort: 'CONVERSATIONAL', response: 'COMPATIBLE', ordinaryFunction: 'COMPATIBLE', nextDayFunction: 'NORMAL' };
  const r14 = { stepId: 'r14', at: at(14, 0, '07:00'), event: { kind: 'RETURN_AFTER_PAUSE', interruption: { startDate: C.date(9, 0), endDate: C.date(13, 6), days: 35, reasonCategory: 'WORK', nonclinical: true, reason: 'Five-week project at a remote site; no gym and no running.' }, currentDemonstration: demo }, note: 'Declared before the first session after the break, with a 20-minute easy test run two days earlier.' };
  const build = (vac, ret) => [
    both('w0', 0), both('w1', 1), both('w2', 2), both('w3', 3),
    { stepId: 's6', at: at(6, 3, '06:30'), event: { kind: 'SCHEDULE_CHANGE', changes: { runTurn: 'PM' } }, note: 'Back from 17 days away without saying so; only asks to move runs to the evening.' },
    { stepId: 'a6', at: at(6, 3, '08:00'), event: { kind: 'WEEKLY_REVIEW', interruption: vac }, note: 'Answer: a declared nonclinical break.' },
    both('w6', 6), both('w7', 7), both('w8', 8),
    ret,
    both('w14', 14), both('w15', 15),
  ];
  const timeline = build(vacation, r14);
  const workVariant = build({ ...vacation, reasonCategory: 'WORK', reason: 'Work travel; no training at all.' }, r14);
  const noDemo = build(vacation, { ...r14, event: { kind: 'RETURN_AFTER_PAUSE', interruption: r14.event.interruption } });
  meta['R7D-D18'] = { tz, start };
  cases.push({
    caseId: 'R7D-D18',
    authorIntent: 'A balanced hybrid athlete silently disappears for 17 days, comes back asking only to change her run turn, and declares the vacation when asked; later she declares a five-week work break with a short demonstration run. It probes the moderate break found through a question, a long break return with reduced loads in both sports, and that the reason category within nonclinical does not matter.',
    coverageTags: ['BALANCED_HYBRID', 'NON_RACE', 'H16', 'RUN_EXP_INTERMEDIATE', 'STR_EXP_INTERMEDIATE', 'GYM', 'START_NON_MONDAY', 'TIMEZONE', 'UNREPORTED_WEEKS', 'SKIPPED_REVIEW', 'LATE_ANSWER', 'RETURN_MODERATE', 'RETURN_LONG', 'SCHEDULE_CHANGE'],
    oracleClass: 'DOMAIN_ORACLE',
    intake: intake({
      asOf: '2027-01-05', startDate: start, weeks: 16, timezoneOffsetMinutes: tz,
      athlete: {
        id: 'd18-camila', ageYears: 35, sex: 'F',
        eligibility: eligOK('2027-01-05'),
        goals: { run: 'PERFORMANCE', strength: 'STRENGTH' },
        runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
        recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 75, strengthDaysPerWeek: 2 },
        knownExercises: [
          kx('back-squat', 3, 5, 70, 'TOTAL', 2),
          kx('bench-press', 3, 5, 45, 'TOTAL', 2),
          kx('barbell-rdl', 3, 6, 70, 'TOTAL', 2),
          kx('lat-pulldown', 3, 10, 45, 'MACHINE_STACK', 2),
        ],
        equipment: GYM_FULL,
      },
      schedule: { runDays: [1, 3, 5], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 50, longRunDay: 3, longRunMinutes: 90 },
    }),
    timeline,
    expectedDomainProperties: [
      E('d18-e01', 'GENERATE', 'DOMAIN_ORACLE', status('PROPOSED'), 'Complete in-scope intake.'),
      E('d18-e02', 's6', 'DOMAIN_ORACLE', status('ASK'), 'Two and a half weeks of planned runs have no report.'),
      E('d18-e03', 's6', 'DOMAIN_ORACLE', qkind('UNREPORTED_TRAINING'), 'The question is about the unreported runs.'),
      E('d18-e04', 's6', 'INVARIANT_ORACLE', noRx(), 'Nothing prescribed while the question stands.'),
      E('d18-e05', 'a6', 'DOMAIN_ORACLE', status('MODIFY'), 'A 17-day break calls for a re-plan.'),
      E('d18-e06', 'a6', 'DOMAIN_ORACLE', validity(VALID), 'The declared break covers the unknown sessions.'),
      E('d18-e07', 'a6', 'DOMAIN_ORACLE', absent([6], 'RUN', ['QUALITY']), 'No hard running in the first days back.'),
      E('d18-e08', 'a6', 'DOMAIN_ORACLE', cmp('LONG', 7, '<=', 3), 'The first full week back does not exceed the last pre-break long run.'),
      E('d18-e09', 'a6', 'INVARIANT_ORACLE', judged('From the change on, runs are scheduled in the PM turn on days 1, 3 and 5; nothing is added to make up for the break.'), 'Schedule change and no catch-up.'),
      E('d18-e10', 'r14', 'DOMAIN_ORACLE', status('MODIFY'), 'Return after five weeks off.'),
      E('d18-e11', 'r14', 'DOMAIN_ORACLE', validity(VALID), 'Fully declared nonclinical break.'),
      E('d18-e12', 'r14', 'DOMAIN_ORACLE', phase(14, ['RETURN', 'ESTABLISHMENT']), 'The first week after a long break is a return week.'),
      E('d18-e13', 'r14', 'DOMAIN_ORACLE', absent([14], 'RUN', ['QUALITY']), 'No hard running in the return week.'),
      E('d18-e14', 'r14', 'DOMAIN_ORACLE', cmp('LONG', 14, '<', 8), 'The return long run is shorter than the last pre-break long run.'),
      E('d18-e15', 'r14', 'DOMAIN_ORACLE', judged('Return running is roughly 40-60% of the week-8 level, anchored on the 20-minute demonstration; strength resumes at reduced loads or volume (for example re-established or about 10-20% below the last logged loads) with more reserve.'), 'Detraining after five weeks.'),
    ],
    metamorphicRelations: [
      variant({ timeline: workVariant }, 'a6', 'SAME_PLAN', 'The same 17-day break declared as WORK instead of VACATION (both nonclinical) should give the same return plan.'),
      variant({ timeline: noDemo }, 'r14', 'NOT_HIGHER_RUN_LOAD', 'Without the demonstration run (less evidence of current tolerance) the return should not be more ambitious.'),
      { relation: 'CALENDAR_SHIFT' },
    ],
    independentAssessment: ia(
      'Two nonclinical breaks of different length. The first is hidden: the coach can only find it by asking about unreported sessions. The second is declared with a current demonstration of tolerance. Fitness loss after 17 days is modest; after 35 days it is meaningful in both sports.',
      'At s6, ask about the unreported runs (prescribe nothing). After the declared vacation, plan a short re-entry (about one week near 70-80% of pre-break, no quality) and move runs to the evening. After the five-week break, plan a return week near half of the pre-break running with no quality and reduced strength loads, then rebuild over two to three weeks.',
      ['Treating the first re-entry week as RETURN phase.', 'Re-establishing strength loads after the long break instead of a percentage reduction.'],
      ['Assuming the vacation weeks were done (progression) or missed without asking.', 'Resuming at the pre-break level after five weeks.', 'Quality running in either first week back.', 'Different plans for VACATION versus WORK.']),
    domainNotes: 'The vacation is declared as an interruption inside a weekly review on day 3 of week 6 (an answer). The demonstration run is two days before the return decision, inside the declared break.',
  });
}

// @@END@@

// ================================================================ AUTHOR SELF-CHECKS (independent of check-corpus.mjs)
const problems = [];
const inWindow = (d) => d >= WINDOW.from && d <= WINDOW.to;
const localStepDate = (c, s) => {
  if (typeof s.at === 'string') {
    const tz = meta[c.caseId]?.tz ?? 0;
    const local = new Date(Date.parse(s.at) + tz * 60000).toISOString().slice(0, 10);
    return { date: local, ms: Date.parse(s.at) };
  }
  const tz = meta[c.caseId]?.tz ?? 0;
  const date = addDays(c.intake.startDate, 7 * s.at.week + s.at.day);
  return { date, ms: Date.parse(`${date}T${s.at.time}:00${offsetStr(tz)}`) };
};
const visitDates = (obj, path, fn) => {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) visitDates(v, `${path}.${k}`, fn);
  } else if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}/.test(obj)) fn(obj, path);
};
cases.forEach((c, i) => {
  const want = `R7D-D${String(i + 1).padStart(2, '0')}`;
  if (c.caseId !== want) problems.push(`${c.caseId}: expected id ${want}`);
  const end = addDays(c.intake.startDate, 7 * c.intake.weeks - 1);
  if (c.intake.asOf > c.intake.startDate) problems.push(`${c.caseId}: asOf after startDate`);
  visitDates(c, c.caseId, (s, p) => {
    const tzStamp = s.match(/T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/);
    const d = tzStamp ? new Date(Date.parse(s) + (meta[c.caseId]?.tz ?? 0) * 60000).toISOString().slice(0, 10) : s.slice(0, 10);
    if (!inWindow(s.slice(0, 10)) || !inWindow(d)) problems.push(`${p}: ${s} outside window`);
  });
  let prev = -Infinity; const ids = new Set(['GENERATE']);
  for (const s of c.timeline) {
    const { date, ms } = localStepDate(c, s);
    if (date < c.intake.startDate || date > end) problems.push(`${c.caseId}/${s.stepId}: step outside program`);
    if (ms < prev) problems.push(`${c.caseId}/${s.stepId}: step out of order`);
    prev = ms;
    if (ids.has(s.stepId)) problems.push(`${c.caseId}/${s.stepId}: duplicate step id`);
    ids.add(s.stepId);
  }
  for (const e of c.expectedDomainProperties) if (!ids.has(e.atStep)) problems.push(`${c.caseId}/${e.expectationId}: unknown step ${e.atStep}`);
  const ev = c.intake.athlete.event?.date ?? c.intake.athlete.goals.run?.event?.date;
  if (ev && (ev < c.intake.startDate || ev > end)) problems.push(`${c.caseId}: event outside program`);
  if (!c.independentAssessment.preferredCoachingBehavior) problems.push(`${c.caseId}: no assessment`);
});
const corpus = { corpusRevision: 'R7D-DIAGNOSTIC-1', cases };
const out = new URL('./R7D_DIAGNOSTIC_CORPUS.json', import.meta.url);
writeFileSync(out, JSON.stringify(corpus, null, 1) + '\n');
const steps = cases.reduce((a, c) => a + c.timeline.length, 0);
const tags = {};
for (const c of cases) for (const t of c.coverageTags) tags[t] = (tags[t] || 0) + 1;
console.log(JSON.stringify({ cases: cases.length, steps, problems, starts: cases.map((c) => `${c.caseId} ${c.intake.startDate} ${weekdayName(c.intake.startDate)} H${c.intake.weeks}`), tags }, null, 1));
if (problems.length) process.exitCode = 1;
