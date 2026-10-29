#!/usr/bin/env node
// R6 independent holdout builder (R6-HOLDOUT-1).
// Plain Node 24, no imports from the repository. It only constructs and validates JSON.
//   node build-independent-holdout.mjs            -> build, validate, write the corpus, print its SHA-256
//   node build-independent-holdout.mjs --check    -> build and validate only (no write)
//   node build-independent-holdout.mjs --seal <authorStartedAt>
//        -> rebuild, require byte equality with the corpus on disk, write INDEPENDENCE_MANIFEST.json
// The author never reads, imports or runs the runtime or the evaluator.

import {writeFileSync, readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS_PATH = join(HERE, 'R6_INDEPENDENT_HOLDOUT.json');
const MANIFEST_PATH = join(HERE, 'INDEPENDENCE_MANIFEST.json');
const INTERFACE_PATH = join(HERE, 'INTERFACE_ONLY.md');
const FREEZE_PATH = join(HERE, '..', 'RUNTIME_FREEZE_R6.json');
const REVISION = 'R6-HOLDOUT-1';

// Week indices are 0-based (coordinator clarification, recorded in the manifest).
const WEEK_BASE = 0;

// ---------------------------------------------------------------- utilities
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const toDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`bad date ${s}`);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) throw new Error(`bad date ${s}`);
  return d;
};
const addDays = (s, n) => { const d = toDate(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const diffDays = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const wdName = (s) => WD[toDate(s).getUTCDay()];
const idx = (k) => k + WEEK_BASE;
const W = (k) => `week index ${idx(k)} (program week ${k + 1})`;
const dd = (S, k, d) => addDays(S, 7 * k + d);
const dayNames = (S, days) => days.map((d) => `${wdName(addDays(S, d))} (day ${d})`).join(', ');
const TS_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const localDateOf = (ts) => { const m = TS_RE.exec(ts ?? ''); return m ? m[1] : null; };
const instant = (ts) => new Date(ts).getTime();

const OK = {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'};
const OK_SAMEDAY = {...OK, nextDayFunction: 'UNKNOWN'};
const UNK = {performance: 'UNKNOWN', recovery: 'UNKNOWN', effort: 'UNKNOWN', nextDayFunction: 'UNKNOWN'};

const eligOK = (date, over = {}) => ({
  status: 'NONCLINICAL_CONFIRMED', assessedAt: date,
  pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false,
  ...over,
});

const mkIntake = ({asOf, startDate, weeks, tz, learningConsent, athlete, schedule, history}) => ({
  version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf, startDate, weeks,
  ...(learningConsent !== undefined ? {learningConsent} : {}),
  ...(tz !== undefined ? {timezoneOffsetMinutes: tz} : {}),
  athlete, schedule,
  ...(history ? {history} : {}),
});

// review: date = start + 7k + d, so the asOf is in week k by construction (validated again below)
const rv = (cid, n, S, k, d, time, kind, extra = {}, off = '-03:00') => {
  const date = dd(S, k, d);
  const {eligibility, ...rest} = extra;
  return {
    version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE',
    asOf: `${date}T${time}${off}`, weekIndex: idx(k), event: {id: `${cid}-E${n}`, kind},
    eligibility: eligibility ?? eligOK(date), ...rest,
  };
};
const done = (k, sport, ref, extra = {}) => ({weekIndex: idx(k), sport, ...ref, completed: true, actualStimulus: 'AS_PRESCRIBED', response: {...OK}, ...extra});
const doneSameDay = (k, sport, ref, extra = {}) => done(k, sport, ref, {response: {...OK_SAMEDAY}, ...extra});
const missed = (k, sport, ref, extra = {}) => ({weekIndex: idx(k), sport, ...ref, completed: false, response: {...UNK}, ...extra});
const tref = (k, sport, ref) => ({weekIndex: idx(k), sport, ...ref});

const kx = (id, sets, reps, kg, convention, rir, observedAt, flags = {}) => ({
  id, sets, reps,
  ...(kg != null ? {load: {value: kg, unit: 'KG', convention}} : {}),
  ...(rir != null ? {rir} : {}),
  current: flags.current ?? true, familiar: flags.familiar ?? true, tolerated: flags.tolerated ?? true, observedAt,
});
const kr = (family, durationMinutes, observedAt, extra = {}, flags = {}) => ({
  prescription: {modality: 'RUN', family, durationMinutes, ...extra},
  current: flags.current ?? true, familiar: flags.familiar ?? true, tolerated: flags.tolerated ?? true, observedAt,
});
const runRow = (activityId, provider, startedAt, durationMinutes, completeness = 'FULL') => ({activityId, provider, sport: 'RUN', startedAt, durationMinutes, completeness});
const strRow = (activityId, provider, startedAt, durationMinutes, exercises, completeness = 'FULL') => ({activityId, provider, sport: 'STRENGTH', startedAt, durationMinutes, completeness, ...(exercises ? {exercises} : {})});

const GYM = ['BARBELL', 'RACK', 'BENCH', 'DUMBBELLS', 'MACHINES', 'PULL_UP_BAR', 'BODYWEIGHT', 'BANDS'];
const garminFull = (historyWeeks) => ({provider: 'garmin', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'FULL', historyWeeks});

// ---------------------------------------------------------------- cases
const CASES = [];
const add = (fn) => CASES.push(fn);

// =============================== COLD START ===============================

// H01 run-first half marathon, 16 weeks, full wearable; arrangement probe (strength on the eve of the long run)
add(() => {
  const cid = 'R6-H01', S = '2027-03-01', asOf = '2027-02-26', race = dd(S, 15, 6);
  const sched = {runDays: [1, 3, 5, 6], strengthDays: [3, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 45, longRunDay: 6, longRunMinutes: 150};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Ana, 34, intermediate runner (4 runs/week, ~210 min, longest run 80 min, 10K in 52:00 three months ago, a current 3x6-min threshold session). She wants a half marathon on ${race} (${wdName(race)}, last day of a 16-week horizon) with a 115-minute goal, plus two running-support strength sessions with dumbbells at home. Runs ${dayNames(S, sched.runDays)} in the morning, long run on ${wdName(dd(S, 0, 6))}; strength ${dayNames(S, sched.strengthDays)} in the evening, so ${wdName(dd(S, 0, 5))} strength falls about 12-15 hours before the long run. Full watch history agrees with her self-report.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {
      id: 'h01-ana', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'},
      event: {kind: 'HALF_MARATHON', date: race, timeGoalMinutes: 115},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 4, runMinutesPerWeek: 210, longestRunMinutes: 80, strengthDaysPerWeek: 2},
      performanceAnchors: [{kind: 'RACE', distance: '10K', minutes: 52, date: '2026-11-15'}],
      knownRuns: [
        kr('THRESHOLD', 49, '2027-02-23', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 3, workMinutes: 6, recoveryMinutes: 2}, effort: 'comfortably hard, a few words at a time'}),
        kr('LONG', 80, '2027-02-21', {effort: 'easy, conversational'}),
        kr('EASY', 45, '2027-02-25', {effort: 'easy'}),
      ],
      knownExercises: [
        kx('goblet-squat', 3, 10, 24, 'TOTAL', 3, '2027-02-25'),
        kx('db-rdl', 3, 10, 22, 'PER_HAND', 3, '2027-02-25'),
        kx('db-split-squat', 3, 8, 12, 'PER_HAND', 3, '2027-02-20'),
        kx('db-row', 3, 10, 20, 'PER_HAND', 2, '2027-02-20'),
        kx('db-calf-raise', 3, 15, 16, 'PER_HAND', 2, '2027-02-20'),
      ],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH', 'BANDS'],
      sex: 'F', heightCm: 165, weightKg: 60,
      wearableCapabilities: garminFull(8),
    }, schedule: sched, history: [
      runRow('g-1001', 'garmin', '2027-02-16T06:30:00-03:00', 49),
      runRow('g-1002', 'garmin', '2027-02-18T06:30:00-03:00', 45),
      strRow('g-1003', 'garmin', '2027-02-18T19:00:00-03:00', 40),
      runRow('g-1004', 'garmin', '2027-02-20T07:00:00-03:00', 40),
      strRow('g-1005', 'garmin', '2027-02-20T18:00:00-03:00', 40),
      runRow('g-1006', 'garmin', '2027-02-21T07:00:00-03:00', 78),
      runRow('g-1007', 'garmin', '2027-02-23T06:30:00-03:00', 49),
      runRow('g-1008', 'garmin', '2027-02-25T06:30:00-03:00', 45),
      strRow('g-1009', 'garmin', '2027-02-25T19:00:00-03:00', 40),
    ]}),
    independentAssessment: {
      rationale: 'The goal agrees with her anchor (a 52:00 10K predicts about 114-117 min for a half marathon), and 16 weeks is ample, so this tests plain coaching quality: a periodised build from her evidenced load and a concurrent arrangement that keeps heavy lower-body work out of the 24 h before the long run. Thursday (AM run + PM strength, about 72 h before the long run) is the natural home for the heavier lower-body session (hard days hard); Saturday evening strength must be light, upper or trunk focused.',
      preferredCoachingBehavior: [
        `PROPOSED, 16 weeks, base -> build -> specific -> taper, with a RACE session on ${race} in the final week.`,
        'Start near the current load: week 1 about 200-230 min with a long run of about 75-85 min. Weekly growth about 10% or less, a lighter week every 3-4 weeks, a peak long run of about 110-130 min around 3 weeks out, and a peak week of about 280-330 min.',
        'One quality session a week early, from the threshold family and close to her current 3x6 min, growing to a second key stimulus only in the specific phase (for example half-marathon-specific segments). Quality on Tuesday (after Monday rest) and/or Thursday morning, never on Saturday.',
        'Strength twice a week from her known loads (goblet 24 kg, RDL 22 kg/hand, split squat 12 kg/hand) at RIR 2-3. The main lower-body work goes on Thursday evening. Saturday evening is upper/trunk/calf or very low lower-body volume.',
        'Taper over the final 10-14 days: volume down 30-50% with some intensity kept. The last moderately heavy lower-body session at least 7-10 days before the race. Race-week strength light or absent, and the day before the race rest or a short shakeout.',
      ],
      acceptableAlternatives: [
        'A peak long run anywhere from 105 to 135 min; 3:1 or 2:1 loading cycles.',
        'Quality on Thursday instead of Tuesday, with Thursday evening strength as the same hard day.',
        'Saturday strength dropped or converted to mobility/trunk in recovery and taper weeks.',
      ],
      concerns: [
        'Heavy squat/hinge/split-squat volume on Saturday evening before the Sunday long run, or quality on Saturday.',
        'Week-1 volume far above ~230 min or a long run above ~95 min in the first two weeks; no recovery weeks in 16 weeks.',
        'No taper, heavy strength in race week, or strength taken to RIR 0-1 in the specific phase.',
        'Ignoring her current threshold session and starting her as a novice; asking for facts already supplied.',
      ],
    },
  }, meta: {}};
});

// H02 strength-first with some running
add(() => {
  const cid = 'R6-H02', S = '2027-04-05', asOf = '2027-04-02';
  const sched = {runDays: [1, 5], strengthDays: [0, 2, 4], runTurn: 'PM', strengthTurn: 'PM', runMinutes: 30, strengthMinutes: 75, longRunDay: 5, longRunMinutes: 40};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Bruno, 38, experienced lifter (back squat 5x5 at 120 kg RIR 2, bench 5x5 at 92.5 kg, RDL 3x6 at 110 kg, rows, pull-ups) with a strength goal; running is a secondary "regular" goal and he currently jogs once a week for ~25 min. Strength ${dayNames(S, sched.strengthDays)} 75 min, runs ${dayNames(S, sched.runDays)} 30 min (Saturday up to 40). Full gym, 12 weeks, prefers squat and push emphasis with exercise rotation every 6 weeks. No event.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h02-bruno', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'REGULAR', strength: 'STRENGTH'},
      runExperience: 'NOVICE', strengthExperience: 'EXPERIENCED',
      recent: {runDaysPerWeek: 1, runMinutesPerWeek: 25, longestRunMinutes: 25, strengthDaysPerWeek: 4},
      knownRuns: [kr('EASY', 25, '2027-03-27', {effort: 'easy'})],
      knownExercises: [
        kx('back-squat', 5, 5, 120, 'TOTAL', 2, '2027-03-29'),
        kx('bench-press', 5, 5, 92.5, 'TOTAL', 2, '2027-03-31'),
        kx('barbell-rdl', 3, 6, 110, 'TOTAL', 2, '2027-03-31'),
        kx('barbell-row', 4, 8, 75, 'TOTAL', 2, '2027-03-29'),
        kx('pull-up', 4, 6, null, null, 2, '2027-03-31'),
        kx('db-split-squat', 3, 8, 22, 'PER_HAND', 2, '2027-03-26'),
      ],
      equipment: GYM,
      strengthPreferences: {emphasis: ['SQUAT', 'PUSH'], movementPriorities: ['SQUAT', 'HINGE', 'PUSH', 'PULL'], rotation: 'EVERY_6_WEEKS'},
      sex: 'M', heightCm: 180, weightKg: 88,
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Strength leads, so running must be dosed (volume and intensity) to protect lower-body recovery, while respecting that he is a novice runner at 25 min/week. Strength should start from his documented working loads, not a novice template, and the requested 6-week rotation gives a natural variation/deload point.',
      preferredCoachingBehavior: [
        'PROPOSED with 3 strength sessions/week starting at about 90-100% of current working loads at RIR 2-3. Squat and push are emphasised, hinge and pull maintained. Progression by small load/rep steps (main lifts about 2.5-5% per step at most), with a lighter week or variation change around weeks 6-7. No grinding (RIR 0).',
        'Running twice a week, easy and conversational, about 20-30 min, rising slowly to about 30-40 min by the end; Saturday the longer easy run (≤ 40 min). No QUALITY running in the first weeks; at most strides late.',
        'Arrangement: the easy Tuesday run after Monday\'s heavy day is acceptable at easy effort; no hard running the day before a heavy lower-body day.',
      ],
      acceptableAlternatives: [
        'The second run kept optional in weeks 1-2; strides added in the last third.',
        'A deload around week 4-5 instead of 6, if the program justifies it.',
      ],
      concerns: [
        'Starting the squat far below (for example 60 kg) or above 120 kg, or weekly jumps above 5% on main lifts.',
        'Intervals or threshold work for a novice runner; running volume jumping above ~60-70 min/week in the first weeks.',
        'Ignoring the squat/push emphasis or the 6-week rotation preference; asking for information already supplied.',
      ],
    },
  }, meta: {}};
});

// H03 novice runner who is an experienced lifter, 10K in 12 weeks
add(() => {
  const cid = 'R6-H03', S = '2027-05-03', asOf = '2027-04-29', race = dd(S, 11, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 40, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 70};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Carla, 31, has lifted 4x/week for years (back squat 4x6 at 85 kg) but has never run. She wants to finish a 10K on ${race} (12 weeks) and keep her strength. Runs ${dayNames(S, sched.runDays)} (Sunday longest, up to 70 min), strength ${dayNames(S, sched.strengthDays)} 60 min. No time goal.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h03-carla', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'MAINTAIN'},
      event: {kind: '10K', date: race},
      runExperience: 'NONE', strengthExperience: 'EXPERIENCED',
      recent: {runDaysPerWeek: 0, runMinutesPerWeek: 0, strengthDaysPerWeek: 4},
      knownExercises: [
        kx('back-squat', 4, 6, 85, 'TOTAL', 2, '2027-04-26'),
        kx('barbell-rdl', 3, 8, 80, 'TOTAL', 2, '2027-04-28'),
        kx('bench-press', 4, 6, 50, 'TOTAL', 2, '2027-04-26'),
        kx('lat-pulldown', 3, 10, 50, 'TOTAL', 2, '2027-04-28'),
        kx('hip-thrust-db', 3, 10, 30, 'TOTAL', 2, '2027-04-28'),
        kx('db-split-squat', 3, 8, 16, 'PER_HAND', 2, '2027-04-24'),
      ],
      equipment: GYM, sex: 'F', heightCm: 166, weightKg: 64,
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Muscular strength and general fitness do not transfer to tissue tolerance for running impact. A complete beginner needs graded exposure even when she is fit. Going from zero to finishing a 10K (about 60-75 min) in 12 weeks is achievable with run-walk progression. Strength should be maintained, not rebuilt, with lower-body volume trimmed so she can adapt to running.',
      preferredCoachingBehavior: [
        `PROPOSED with completion intent and a RACE on ${race}.`,
        'Running starts with WALK_JOG 3x/week (about 20-30 min total, short jog bouts) and moves to continuous easy 25-40 min over about 6-8 weeks. The Sunday session builds to about 60-75 min (or a run-walk covering ~10 km) by weeks 9-10. No QUALITY in the first half (strides or light pickups at most, late). Reduced volume in race week.',
        'Strength 2-3 sessions near current loads (about 85-95%) with fewer lower-body sets, RIR 2-3. Friday (two days before the Sunday run) upper-dominant or light lower; no heavy lower-body in race week.',
        'Explanation that her fitness lets her progress steadily but that legs and tendons set the pace.',
      ],
      acceptableAlternatives: [
        'Very short continuous easy runs (10-20 min, walk breaks allowed) from week 1 instead of explicit walk-jog.',
        'Strength reduced to 2 sessions/week to free recovery.',
      ],
      concerns: [
        'Continuous 30-40 min runs three times in week 1, or any interval session in weeks 1-6.',
        'Full lower-body strength volume kept while running is added; heavy squats in race week.',
        'Strength restarted at novice loads, or time-goal pacing invented.',
        'A long run above her stated 70 min.',
      ],
    },
  }, meta: {}};
});

// H04 experienced runner new to strength, half marathon with ambitious goal, home dumbbells (no bench)
add(() => {
  const cid = 'R6-H04', S = '2027-08-02', asOf = '2027-07-30', race = dd(S, 11, 6);
  const sched = {runDays: [0, 1, 3, 5, 6], strengthDays: [1, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 70, strengthMinutes: 30, longRunDay: 6, longRunMinutes: 140};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Diego, 36, experienced runner (5 runs/week ~330 min, long run 105 min, 10K 41:00 in June, half marathon 91:00 in April) targets 88:00 in a half marathon on ${race} (12 weeks). He has never lifted; home equipment is dumbbells, bands and bodyweight (no bench). Runs ${dayNames(S, sched.runDays)} AM with the long run on Sunday; strength ${dayNames(S, sched.strengthDays)} PM, 30 min.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h04-diego', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'},
      event: {kind: 'HALF_MARATHON', date: race, timeGoalMinutes: 88},
      runExperience: 'EXPERIENCED', strengthExperience: 'NONE',
      recent: {runDaysPerWeek: 5, runMinutesPerWeek: 330, longestRunMinutes: 105, strengthDaysPerWeek: 0},
      performanceAnchors: [
        {kind: 'RACE', distance: 'HALF_MARATHON', minutes: 91, date: '2027-04-11'},
        {kind: 'RACE', distance: '10K', minutes: 41, date: '2027-06-13'},
      ],
      knownRuns: [
        kr('THRESHOLD', 63, '2027-07-27', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 4, workMinutes: 8, recoveryMinutes: 2}, effort: 'comfortably hard'}),
        kr('HALF_MARATHON_SPECIFIC', 68, '2027-07-22', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 2, workMinutes: 20, recoveryMinutes: 3}, effort: 'half-marathon effort'}),
        kr('LONG', 105, '2027-07-25', {effort: 'easy'}),
        kr('EASY', 55, '2027-07-29', {effort: 'easy'}),
      ],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BANDS'],
      sex: 'M', heightCm: 176, weightKg: 68,
      wearableCapabilities: garminFull(26),
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Running should continue from his established workload with half-marathon-specific progression, not be reset. The new strength stimulus is the main risk: unaccustomed eccentric work causes large soreness that can spoil quality runs in weeks 1-3. Start with low volume, a high reserve and simple runner-relevant patterns within his equipment (no bench). 88:00 is about 3% faster than his anchors predict (about 90-91): ambitious but plausible, so flag it rather than refuse it.',
      preferredCoachingBehavior: [
        'PROPOSED: running about 300-340 min/week at first, peaking about 360-400; long run 105 -> about 120-135 min; two key sessions/week (threshold and half-marathon-specific, possibly inside the long run) never on consecutive days and not on Monday after the Sunday long run; taper of about 10-14 days.',
        'Strength twice a week, 30 min, novice dose: 1-2 sets per exercise in weeks 1-2 rising to 2-3, RIR 3-4 early, technique focus. Library ids within his equipment, for example goblet-squat, db-rdl, db-split-squat or reverse-lunge, db-calf-raise or standing-calf-raise, push-up, db-row, dead-bug/side-plank/pallof-press. Nothing needing a bench or barbell.',
        'Friday strength (before the Saturday run and Sunday long run) clearly light; Tuesday evening after the morning run is fine.',
        'An explicit note that 88:00 is ambitious relative to his anchors.',
      ],
      acceptableAlternatives: [
        'One strength session/week in the first 2 weeks; strength paused in race week.',
        'Keeping the goal unchanged but labelling the uncertainty, rather than proposing a new number.',
      ],
      concerns: [
        'Novice strength at RIR 0-2 or 3+ sets of lunges/split squats in week 1 (soreness before quality).',
        'Exercises needing a bench or barbell (one-arm-db-row, db-step-up, hip-thrust-db, db-bench-press, barbell lifts).',
        'Running reset to an intermediate/base volume, a third quality session, or quality on Monday after the long run.',
        'Heavy lower-body work on Friday.',
      ],
    },
  }, meta: {}};
});

// H05 general fitness, novice, too many days offered, start on a Wednesday
add(() => {
  const cid = 'R6-H05', S = '2027-01-06', asOf = '2027-01-04';
  const sched = {runDays: [0, 1, 2, 3, 4, 5], strengthDays: [0, 2, 4, 6], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 45, longRunDay: 3, longRunMinutes: 60};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Elisa, 52, wants general fitness. Novice at both (one ~20-min jog a week, no lifting). Enthusiastically offers 6 run days (${dayNames(S, sched.runDays)}) and 4 strength days (${dayNames(S, sched.strengthDays)}), three of them shared, 45 min each, for 8 weeks. Dumbbells and bodyweight at home, no watch. The program starts on a ${wdName(S)}, so day 0 is ${wdName(S)}.`,
    intake: mkIntake({asOf, startDate: S, weeks: 8, tz: -180, athlete: {
      id: 'h05-elisa', ageYears: 52, eligibility: eligOK(asOf),
      goals: {run: 'GENERAL', strength: 'GENERAL'},
      runExperience: 'NOVICE', strengthExperience: 'NOVICE',
      recent: {runDaysPerWeek: 1, runMinutesPerWeek: 20, longestRunMinutes: 20, strengthDaysPerWeek: 0},
      equipment: ['BODYWEIGHT', 'DUMBBELLS'], sex: 'F',
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Availability is not prescription. A novice on 20 min/week of running should start with about 3 short run/walk sessions and 2 full-body strength sessions, with real rest days. Filling 10 sessions/week (including double days) would be an overuse and adherence risk. Day 0 is a Wednesday, so day mapping must not assume Monday.',
      preferredCoachingBehavior: [
        'PROPOSED using a subset: about 2-3 runs (WALK_JOG/EASY, 15-30 min) and 2 full-body strength sessions (2-3 sets, RIR 3; for example goblet-squat, db-rdl, db-row, incline-push-up, glute-bridge, dead-bug), mostly on different days, with an explanation that she offered more days than she needs and that the rest are rest or optional.',
        'Gentle progression over 8 weeks (running time +5-10%/week; strength reps first, then load).',
      ],
      acceptableAlternatives: [
        'Extra walks or mobility clearly marked optional.',
        'ASK how many days she would like to train (weaker, since a safe default exists).',
        'Up to 3 runs + 2 strength with one shared day if same-day sessions are short.',
      ],
      concerns: [
        '7 or more sessions/week, or double days for a novice; runs of 40-45 min in early weeks.',
        'Day indices misread as Monday-based.',
        'Barbell exercises (no barbell) or strength at low RIR.',
      ],
    },
  }, meta: {}};
});

// H06 low data, no wearable, 10K on a Saturday that is not one of his run days
add(() => {
  const cid = 'R6-H06', S = '2027-09-06', asOf = '2027-09-03', race = dd(S, 11, 5);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 4], runTurn: 'PM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 30, longRunDay: 6, longRunMinutes: 80};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Fábio, 41, intermediate runner without a watch: about 3 runs/week, ~120 min, longest 50 min, no recent race or test. He entered a 10K on ${race} (a ${wdName(race)}), but his usual run days are ${dayNames(S, sched.runDays)} with the long run on Sunday. Strength novice with a single kettlebell (load unknown) and bodyweight, ${dayNames(S, sched.strengthDays)} 30 min. 12 weeks.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h06-fabio', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'GENERAL'},
      event: {kind: '10K', date: race},
      runExperience: 'INTERMEDIATE', strengthExperience: 'NOVICE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50},
      equipment: ['BODYWEIGHT', 'KETTLEBELL'],
      wearableCapabilities: {provider: 'NONE', activityAvailable: false, heartRateAvailable: false, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'NONE'},
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Self-reported volume is enough to start. Missing wearable data and anchors call for effort-based prescription and early calibration, not refusal. The race is on a Saturday, which is not one of his run days. The race date is fixed, so race week must be arranged around it (no long run the day after the race).',
      preferredCoachingBehavior: [
        'PROPOSED with explicit uncertainty: no anchor means no time target, and sessions are described by effort. Week 1 about 110-130 min; long run 50 -> about 70-80 min peak; one conservative quality session per week introduced after the first week(s).',
        `RACE on ${race}. In race week a short race-touch early in the week, Thursday short/easy or rest, and the Sunday after the race easy or rest (not a long run).`,
        'Strength novice with kettlebell + bodyweight, load self-selected to RIR 3 (load stays unknown); for example kb-goblet-squat, kb-deadlift, reverse-lunge, push-up/incline-push-up, prone-row-practice, dead-bug/side-plank. Friday session light.',
        'missingInputs/uncertainty naming a time trial or effort calibration as optional.',
      ],
      acceptableAlternatives: [
        'A 5K time trial suggested in weeks 2-4 to calibrate.',
        'A non-blocking question about whether the race replaces that week\'s Sunday run.',
      ],
      concerns: [
        'ASK or refusal only because there is no wearable or anchor; invented paces or a time goal.',
        'The race placed on Sunday or ignored, or a long run the day after the race.',
        'Kettlebell loads invented as if known.',
      ],
    },
  }, meta: {}};
});

// H07 partial wearable history contradicting the self-report; out-of-library history exercise
add(() => {
  const cid = 'R6-H07', S = '2027-06-07', asOf = '2027-06-04';
  const sched = {runDays: [1, 3, 4, 6], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 45, longRunDay: 6, longRunMinutes: 90};
  const P = 'polar';
  const ex1 = [{id: 'goblet-squat', sets: 3, reps: 8, loadKg: 20, rir: 2}, {id: 'trap-bar-deadlift', sets: 3, reps: 5, loadKg: 90, rir: 2}, {id: 'db-row', sets: 3, reps: 10, loadKg: 18}];
  const ex2 = [{id: 'db-rdl', sets: 3, reps: 8, loadKg: 18}, {id: 'push-up', sets: 3, reps: 10}, {id: 'db-row', sets: 3, reps: 10, loadKg: 18}];
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: 'Gabi, 29, says she runs 4x/week (~200 min, longest 75 min). Her partially connected watch (4 weeks, completeness PARTIAL) shows 2-3 runs/week totalling about 95-127 min, longest 55 min, with one run recorded only in part. Her strength rows include a trap-bar deadlift, which is outside the exercise library. 12 weeks, running-performance focus, no event, strength maintenance; full gym except machines.',
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h07-gabi', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'PERFORMANCE', strength: 'MAINTAIN'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 75, strengthDaysPerWeek: 2},
      knownExercises: [
        kx('goblet-squat', 3, 8, 20, 'TOTAL', 2, '2027-05-24'),
        kx('db-row', 3, 10, 18, 'PER_HAND', 2, '2027-06-01'),
        kx('db-rdl', 3, 8, 18, 'PER_HAND', 2, '2027-05-14'),
      ],
      equipment: ['BARBELL', 'RACK', 'DUMBBELLS', 'BENCH', 'BODYWEIGHT'],
      wearableCapabilities: {provider: P, activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: true, setsRepsLoadAvailable: true, subjectiveEffortAvailable: false, completeness: 'PARTIAL', historyWeeks: 4},
    }, schedule: sched, history: [
      strRow('p-2001', P, '2027-05-10T19:00:00-03:00', 45, ex1),
      runRow('p-2002', P, '2027-05-11T06:40:00-03:00', 40),
      runRow('p-2003', P, '2027-05-13T06:40:00-03:00', 35),
      strRow('p-2004', P, '2027-05-14T19:00:00-03:00', 40, ex2),
      runRow('p-2005', P, '2027-05-16T07:30:00-03:00', 50),
      strRow('p-2006', P, '2027-05-17T19:00:00-03:00', 45, ex1),
      runRow('p-2007', P, '2027-05-18T06:40:00-03:00', 40),
      strRow('p-2008', P, '2027-05-20T19:00:00-03:00', 40, ex2),
      runRow('p-2009', P, '2027-05-22T07:30:00-03:00', 31, 'PARTIAL'),
      strRow('p-2010', P, '2027-05-24T19:00:00-03:00', 45, ex1),
      runRow('p-2011', P, '2027-05-25T06:40:00-03:00', 35),
      runRow('p-2012', P, '2027-05-27T06:40:00-03:00', 40),
      runRow('p-2013', P, '2027-05-30T07:30:00-03:00', 52),
      strRow('p-2014', P, '2027-06-01T19:00:00-03:00', 45, ex1),
      runRow('p-2015', P, '2027-06-02T06:40:00-03:00', 45),
    ]}),
    independentAssessment: {
      rationale: 'Two credible but conflicting sources. With PARTIAL completeness some runs may be unrecorded, so the watch is a floor rather than the truth, and the self-report may be optimistic. A careful coach starts near the evidenced level (or blends the two with explicit uncertainty) and lets the first weeks confirm. The long run should start near the evidenced 50-60 min, not 75. The trap-bar deadlift is history only; hinge work must use a library id.',
      preferredCoachingBehavior: [
        'PROPOSED starting at about 130-160 min/week (between the evidence and the claim, leaning to the evidence) with a long run of about 55-65 min. Uncertainty/missingInputs record the conflict and invite confirmation; progression is allowed to speed up if the first weeks are tolerated.',
        'Strength maintenance twice a week from her known goblet-squat/db-row/db-rdl loads; hinge via db-rdl or barbell-rdl; trap-bar-deadlift not programmed.',
        'Quality introduced conservatively (one session/week), not at the claimed 200-min level.',
      ],
      acceptableAlternatives: [
        'ASK specifically to reconcile 200 vs ~115 min/week before generating (nearly as good).',
        'Starting at the pure evidence (~110-125 min) with a faster early ramp if tolerated.',
      ],
      concerns: [
        'Accepting 200 min/week and a 75-min long run at face value.',
        'Treating unrecorded days as zero training and starting below ~100 min with a long run under 45 min.',
        'Programming trap-bar-deadlift, or not mentioning the conflict at all.',
      ],
    },
  }, meta: {intentional: ['OUT_OF_LIBRARY_HISTORY']}};
});

// H08 bodyweight + bands only, hypertrophy, 8 weeks
add(() => {
  const cid = 'R6-H08', S = '2027-02-01', asOf = '2027-01-29';
  const sched = {runDays: [1, 3, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 40, strengthMinutes: 50, longRunDay: 5, longRunMinutes: 60};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: 'Hugo, 33, an experienced lifter who now trains at home with only bodyweight and bands, wants hypertrophy (upper-body emphasis) over 8 weeks while running 3x/week (~110 min, Saturday longest up to 60). He can currently do 3x20 push-ups, 3x15 bodyweight split squats, 3x20 glute bridges and 3x15 band rows; his old barbell numbers are no longer current. Strength Mon/Wed/Fri 50 min, runs Tue/Thu/Sat.',
    intake: mkIntake({asOf, startDate: S, weeks: 8, tz: -180, athlete: {
      id: 'h08-hugo', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'REGULAR', strength: 'HYPERTROPHY'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'EXPERIENCED',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 110, longestRunMinutes: 50, strengthDaysPerWeek: 3},
      knownExercises: [
        kx('push-up', 3, 20, null, null, 2, '2027-01-27'),
        kx('split-squat-bodyweight', 3, 15, null, null, 3, '2027-01-27'),
        kx('glute-bridge', 3, 20, null, null, 3, '2027-01-25'),
        kx('band-row', 3, 15, null, null, 2, '2027-01-25'),
        kx('back-squat', 4, 8, 100, 'TOTAL', 2, '2026-06-15', {current: false}),
        kx('bench-press', 4, 8, 80, 'TOTAL', 2, '2026-06-15', {current: false}),
      ],
      equipment: ['BODYWEIGHT', 'BANDS'],
      strengthPreferences: {emphasis: ['UPPER'], movementPriorities: ['PUSH', 'PULL', 'SQUAT'], rotation: 'COACH_DECIDES'},
      sex: 'M', heightCm: 182, weightKg: 84,
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Without external load, hypertrophy depends on effort close to failure, higher reps, unilateral variations and enough hard sets. The library offers only bodyweight and band options. His previous barbell loads are not current and could not be programmed anyway. Starting points must reflect what he can do now (3x20 push-ups), not novice regressions.',
      preferredCoachingBehavior: [
        'PROPOSED with strength 3x/week using only BODYWEIGHT/BANDS ids (push-up, incline-push-up, band-row, prone-row-practice, split-squat-bodyweight, reverse-lunge, glute-bridge, standing-calf-raise, dead-bug, side-plank, pallof-press).',
        'Upper-body volume of about 10-16 hard sets/week per major muscle group, RIR 1-3, progression by reps/sets/tempo or unilateral emphasis, never by kilograms.',
        'Easy running maintained 3x/week, with Saturday the longer run (about 50-60 min). Friday strength upper-focused (eve of the Saturday longer run).',
        'An honest note that lower-body hypertrophy and pulling options are limited without load or a bar.',
      ],
      acceptableAlternatives: [
        'Box-squat-bodyweight as volume/warm-up work.',
        'Two strength sessions in some weeks if running recovery requires it.',
      ],
      concerns: [
        'Any dumbbell, barbell, machine, bench or pull-up-bar exercise.',
        'Prescribing the old barbell loads, or wall push-ups/sit-to-stand as his main work.',
        'Progression expressed as kilogram increases on bodyweight movements.',
      ],
    },
  }, meta: {}};
});

// H09 4-week horizon, 10K closer than ideal, unrealistic time goal
add(() => {
  const cid = 'R6-H09', S = '2027-10-04', asOf = '2027-10-01', race = dd(S, 3, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 75};
  return {c: {
    caseId: cid, family: 'COLD_START', operation: 'GENERATE',
    scenario: `Inês, 27, has run for 4 months (2x/week, ~70 min, longest 35 min; 5K time trial 31:00 on 2027-09-19). She entered a 10K on ${race}, the last day of a 4-week horizon, hoping for 50 minutes. Strength maintenance Mon/Fri 40 min (intermediate lifter); runs Tue/Thu/Sun.`,
    intake: mkIntake({asOf, startDate: S, weeks: 4, tz: -180, athlete: {
      id: 'h09-ines', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'MAINTAIN'},
      event: {kind: '10K', date: race, timeGoalMinutes: 50},
      runExperience: 'NOVICE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 2, runMinutesPerWeek: 70, longestRunMinutes: 35, strengthDaysPerWeek: 2},
      performanceAnchors: [{kind: 'TIME_TRIAL', distance: '5K', minutes: 31, date: '2027-09-19'}],
      knownRuns: [kr('EASY', 30, '2027-09-28', {effort: 'easy'}), kr('LONG', 35, '2027-09-26', {effort: 'easy'})],
      knownExercises: [
        kx('goblet-squat', 3, 10, 16, 'TOTAL', 2, '2027-09-27'),
        kx('db-rdl', 3, 10, 12, 'PER_HAND', 2, '2027-09-27'),
        kx('db-bench-press', 3, 10, 10, 'PER_HAND', 2, '2027-09-24'),
        kx('lat-pulldown', 3, 10, 30, 'TOTAL', 2, '2027-09-24'),
      ],
      equipment: GYM, sex: 'F',
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Finishing the 10K is realistic (with walk breaks if needed). A 50-minute goal is not supported: a 31:00 5K predicts about 64-66 min. Four weeks cannot build a base, so the coach must not cram volume; the useful work is consistency, a modest long-run extension, a short taper and honest expectation-setting.',
      preferredCoachingBehavior: [
        `PROPOSED with explicit negotiation/uncertainty: 50:00 is not supported by her anchor; propose a comfortable finish or about 63-67 min. RACE on ${race}.`,
        'Three runs/week from week 1 or 2 (up from 2). Weekly volume about 70 -> 85-100 min; long run 35 -> about 45-55 min at peak (weeks 2-3); no QUALITY, or only strides/light pickups; reduced load in race week.',
        'Strength twice a week, moderate, in weeks 1-3; light or skipped in race week, nothing heavy within ~4 days of the race.',
      ],
      acceptableAlternatives: [
        'ASK to confirm whether she wants to keep the time goal before generating.',
        'Keeping 2 runs in week 1 and adding the third in week 2.',
      ],
      concerns: [
        'A long run of 70+ min, weekly volume of 120+ min, or threshold work at "goal-pace" effort.',
        'No taper; heavy strength in race week.',
        'UNSUPPORTED/refusal of a feasible completion goal, or silently accepting the 50-min target.',
      ],
    },
  }, meta: {}};
});

// =============================== INTAKE SAFETY AND SCOPE ===============================

const baseRunner = (asOf, over = {}) => ({
  ageEligible: true, eligibility: eligOK(asOf),
  runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
  recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 65, strengthDaysPerWeek: 2},
  knownExercises: [
    kx('goblet-squat', 3, 10, 20, 'TOTAL', 2, addDays(asOf, -3)),
    kx('db-rdl', 3, 10, 16, 'PER_HAND', 2, addDays(asOf, -3)),
    kx('db-row', 3, 10, 16, 'PER_HAND', 2, addDays(asOf, -5)),
    kx('push-up', 3, 12, null, null, 2, addDays(asOf, -5)),
  ],
  equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'],
  ...over,
});
const stdSched = {runDays: [1, 3, 6], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 100};

add(() => {
  const cid = 'R6-H10', S = '2027-03-08', asOf = '2027-03-05', race = dd(S, 11, 6);
  return {c: {
    caseId: cid, family: 'INTAKE_SAFETY_SCOPE', operation: 'GENERATE',
    scenario: `Complete, attractive onboarding for a 10K on ${race} (12 weeks), intermediate runner, but the athlete skipped the eligibility questions: status UNKNOWN and no answers to the individual questions.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h10-joana', ...baseRunner(asOf, {eligibility: {status: 'UNKNOWN', assessedAt: asOf}}),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race, timeGoalMinutes: 55},
      performanceAnchors: [{kind: 'RACE', distance: '5K', minutes: 27, date: '2027-02-14'}],
    }, schedule: stdSched}),
    independentAssessment: {
      rationale: 'Unknown eligibility is neither clearance nor disease. The correct move is to ask the eligibility questions before prescribing anything.',
      preferredCoachingBehavior: ['ASK, naming eligibility (the screening answers) as the missing input; no program.'],
      acceptableAlternatives: ['INVALID_INPUT that clearly asks for the eligibility answers (weaker).'],
      concerns: [
        'PROPOSED program despite unknown eligibility.',
        'CLINICAL_HUMAN_REQUIRED (treating unknown as clinical).',
        'A generic error that does not say what is missing.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H11', S = '2027-03-01', asOf = '2027-02-26', race = dd(S, 15, 6);
  return {c: {
    caseId: cid, family: 'INTAKE_SAFETY_SCOPE', operation: 'GENERATE',
    scenario: `The athlete marks the summary status NONCLINICAL_CONFIRMED but answers pain=true and persistentPain=true: knee pain on downhill running for the last three weeks. She wants a half marathon on ${race} (16 weeks). Everything else is complete.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {
      id: 'h11-katia', ...baseRunner(asOf, {eligibility: eligOK(asOf, {pain: true, persistentPain: true})}),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: 'HALF_MARATHON', date: race},
    }, schedule: stdSched}),
    independentAssessment: {
      rationale: 'A specific flag outranks the summary status. Persistent pain is a clinical question that needs human clinical evaluation before a training plan. The product must not diagnose or "train around" it.',
      preferredCoachingBehavior: ['CLINICAL_HUMAN_REQUIRED with a neutral, non-diagnostic explanation; no program.'],
      acceptableAlternatives: ['ASK that resolves the contradiction (confirming the pain answers) and produces no program in the meantime.'],
      concerns: [
        'PROPOSED, even a reduced or "knee-friendly" one.',
        'Diagnosing, or recommending rehab exercises for the knee.',
        'UNSUPPORTED without clinical routing.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H12', S = '2027-06-07', asOf = '2027-06-04', race = dd(S, 15, 6);
  return {c: {
    caseId: cid, family: 'INTAKE_SAFETY_SCOPE', operation: 'GENERATE',
    scenario: `Experienced runner (5 runs/week, ~320 min, long run 120 min) wants a full marathon on ${race} in 16 weeks (event kind MARATHON, outside the 10K/half-marathon scope).`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {
      id: 'h12-leo', ...baseRunner(asOf, {runExperience: 'EXPERIENCED', recent: {runDaysPerWeek: 5, runMinutesPerWeek: 320, longestRunMinutes: 120, strengthDaysPerWeek: 2}}),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: 'MARATHON', date: race, timeGoalMinutes: 200},
    }, schedule: {runDays: [0, 1, 3, 5, 6], strengthDays: [1, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 70, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 180}}),
    independentAssessment: {
      rationale: 'The event is outside V1 scope. The honest answer is to say so rather than silently coach a different event.',
      preferredCoachingBehavior: ['UNSUPPORTED with a clear reason (V1 supports 10K and half marathon), optionally naming the supported alternatives.'],
      acceptableAlternatives: [
        'INVALID_INPUT that names the unsupported event kind.',
        'ASK offering a half-marathon or non-event program instead.',
      ],
      concerns: [
        'A half-marathon program silently built for the marathon date.',
        'The event ignored and a general program produced without explanation.',
      ],
    },
  }, meta: {intentional: ['EVENT_KIND']}};
});

add(() => {
  const cid = 'R6-H13', S = '2027-04-05', asOf = '2027-04-02';
  return {c: {
    caseId: cid, family: 'INTAKE_SAFETY_SCOPE', operation: 'GENERATE',
    scenario: 'Recreational runner and lifter, 31, reports she is pregnant (specialPopulation PREGNANCY). She feels well and all eligibility flags are false. She wants to keep running and lifting for 12 weeks.',
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h13-marina', ...baseRunner(asOf, {ageEligible: undefined, ageYears: 31}),
      goals: {run: 'REGULAR', strength: 'GENERAL'}, sex: 'F', specialPopulation: ['PREGNANCY'],
    }, schedule: stdSched}),
    independentAssessment: {
      rationale: 'Exercise in an uncomplicated pregnancy is generally encouraged, but prescribing it requires input from her obstetric care provider and pregnancy-specific adjustments that a nonclinical V1 reference coach cannot make.',
      preferredCoachingBehavior: ['CLINICAL_HUMAN_REQUIRED (route to her obstetric care provider or a qualified professional), supportive and non-alarming; no program.'],
      acceptableAlternatives: ['UNSUPPORTED (population out of scope) with a clear, non-alarming reason.'],
      concerns: [
        'PROPOSED standard program.',
        'Disease/alarm framing of pregnancy.',
        'An ASK loop that ends in a program without clinician input.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H14', S = '2027-05-03', asOf = '2027-04-30', race = dd(S, 11, 6);
  const sched = {runDays: [0, 2, 4], strengthDays: [1, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 30, strengthMinutes: 40, longRunDay: 5, longRunMinutes: 90};
  return {c: {
    caseId: cid, family: 'INTAKE_SAFETY_SCOPE', operation: 'GENERATE',
    scenario: `Half marathon on ${race} (12 weeks). Runs offered ${dayNames(S, sched.runDays)} with 30 min each, but the long-run day is ${wdName(dd(S, 0, 5))} (day 5, not a run day) with 90 minutes; strength ${dayNames(S, sched.strengthDays)}.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h14-nuno', ...baseRunner(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: 'HALF_MARATHON', date: race},
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Contradictory schedule facts. Saturday may be available only for the long run, or may be a mistake. With 30-minute sessions on the stated days, where the long run goes is material for a half marathon.',
      preferredCoachingBehavior: ['ASK which day carries the long run (add Saturday as a run day, or use one of Mon/Wed/Fri), without assuming silently.'],
      acceptableAlternatives: [
        'PROPOSED that treats Saturday as an added long-run day (or moves the long run to a chosen run day) and explicitly flags the assumption.',
        'INVALID_INPUT with a precise reason.',
      ],
      concerns: [
        'A silent assumption in either direction.',
        'A half-marathon program without long runs.',
        'Long runs squeezed into the 30-minute slots without comment.',
      ],
    },
  }, meta: {intentional: ['LONG_RUN_DAY_NOT_RUN_DAY']}};
});

// =============================== BALANCED CONFLICTS ===============================

add(() => {
  const cid = 'R6-H15', S = '2027-04-05', asOf = '2027-04-02';
  const sched = {runDays: [0, 2, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 60, longRunDay: 5, longRunMinutes: 80};
  return {c: {
    caseId: cid, family: 'BALANCED_CONFLICT', operation: 'GENERATE',
    scenario: `Balanced hybrid athlete with no stated priority: wants to run better (no event) and build muscle. Runs ${dayNames(S, sched.runDays)} in the morning (Saturday long, up to 80 min); strength ${dayNames(S, sched.strengthDays)} in the evening, 60 min. Monday and Wednesday are shared days; Friday strength is the eve of the long run. Intermediate at both, gym access.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h15-otavio', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'PERFORMANCE', strength: 'HYPERTROPHY'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 60, strengthDaysPerWeek: 3},
      knownRuns: [kr('THRESHOLD', 47, '2027-03-29', {warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 3, workMinutes: 7, recoveryMinutes: 2}, effort: 'comfortably hard'}), kr('LONG', 60, '2027-03-27', {effort: 'easy'})],
      knownExercises: [
        kx('leg-press', 3, 10, 120, 'TOTAL', 2, '2027-03-29'),
        kx('db-bench-press', 3, 10, 22, 'PER_HAND', 2, '2027-03-31'),
        kx('lat-pulldown', 3, 10, 55, 'TOTAL', 2, '2027-03-31'),
        kx('db-rdl', 3, 10, 20, 'PER_HAND', 2, '2027-03-29'),
        kx('seated-cable-row', 3, 12, 50, 'TOTAL', 2, '2027-03-26'),
        kx('db-overhead-press', 3, 10, 14, 'PER_HAND', 2, '2027-03-26'),
      ],
      equipment: GYM,
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'With no priority, a balanced default exists and should be offered rather than demanded. Put the quality run and the heavy lower-body work on the same shared day (≥ 6 h apart, hard day hard). Keep the other shared day lighter (easy run + upper-focused hypertrophy), and keep Friday, the eve of the long run, free of heavy lower-body work. Lower-body hypertrophy volume should be moderate to protect running; upper-body volume can carry the hypertrophy goal.',
      preferredCoachingBehavior: [
        'PROPOSED with both goals progressing. Quality on Monday or Wednesday morning; heavy lower-body that evening (or on the other shared day with the trade-off stated). Friday strength upper-dominant or light lower; Saturday long run progressing about 60 -> 80 min.',
        'Negotiation/explanation of the trade-off and that a temporary priority can be chosen later.',
      ],
      acceptableAlternatives: [
        'ASK about priority together with (or after) a provisional balanced program.',
        'Quality on Wednesday with lower-body on Monday evening (~36-40 h before), if lower-body volume is moderate.',
      ],
      concerns: [
        'Heavy lower-body work on Friday before the long run.',
        'A hard run the morning after a heavy lower-body evening.',
        'Silently making the plan run-first or strength-first.',
        'ASK with no provisional plan when a sensible default exists.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H16', S = '2027-05-10', asOf = '2027-05-07', race = dd(S, 7, 5);
  const sched = {runDays: [1, 3, 5], strengthDays: [1, 3, 5], runTurn: 'PM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 50, longRunDay: 5, longRunMinutes: 75};
  return {c: {
    caseId: cid, family: 'BALANCED_CONFLICT', operation: 'GENERATE',
    scenario: `Athlete wants both a 10K time goal (45:00, race on ${race}, a Saturday, 46:30 PR) and a heavy-strength goal (back squat 5x3 at 140 kg) over 8 weeks, but only has ${dayNames(S, sched.runDays)} evenings. Runs and strength both on those days, both PM, 50 min each. He did not say whether he can do both in one session.`,
    intake: mkIntake({asOf, startDate: S, weeks: 8, tz: -180, athlete: {
      id: 'h16-pedro', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'STRENGTH'},
      event: {kind: '10K', date: race, timeGoalMinutes: 45},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 140, longestRunMinutes: 70, strengthDaysPerWeek: 3},
      performanceAnchors: [{kind: 'RACE', distance: '10K', minutes: 46.5, date: '2027-03-21'}],
      knownExercises: [
        kx('back-squat', 5, 3, 140, 'TOTAL', 2, '2027-05-04'),
        kx('barbell-rdl', 3, 5, 120, 'TOTAL', 2, '2027-05-06'),
        kx('bench-press', 5, 3, 100, 'TOTAL', 2, '2027-05-06'),
        kx('pull-up', 4, 6, null, null, 2, '2027-05-04'),
      ],
      equipment: GYM,
    }, schedule: sched}),
    independentAssessment: {
      rationale: 'Two performance goals compete, there are only 3 days, and stacking both in the same turn (about 100 min, with order effects) was not confirmed. That is a genuine athlete decision.',
      preferredCoachingBehavior: ['ASK: confirm whether he can train run + strength in one evening (about 100 min, run first or strength first) and which goal leads for these 8 weeks (for example 10K priority with strength maintenance until race day). No silent assumption.'],
      acceptableAlternatives: ['PROPOSED with an explicit, flagged temporary priority on the dated 10K (strength maintained in short sessions after easy runs) and an explicit question about the same-session assumption.'],
      concerns: [
        'Silently scheduling 100-minute combined sessions.',
        'Heavy squats before key runs or in race week.',
        'Silently dropping either goal.',
        'Ignoring that the race is on a Saturday (one of his days).',
      ],
    },
  }, meta: {}};
});

// =============================== ADAPTATION SEQUENCES ===============================

const hmIntermediate = (asOf, extra = {}) => ({
  ageEligible: true, eligibility: eligOK(asOf),
  goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'},
  runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
  recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80, strengthDaysPerWeek: 2},
  knownRuns: [
    kr('THRESHOLD', 49, addDays(asOf, -3), {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 3, workMinutes: 6, recoveryMinutes: 2}, effort: 'comfortably hard'}),
    kr('LONG', 80, addDays(asOf, -5), {effort: 'easy'}),
    kr('EASY', 45, addDays(asOf, -1), {effort: 'easy'}),
  ],
  knownExercises: [
    kx('goblet-squat', 3, 10, 24, 'TOTAL', 2, addDays(asOf, -4)),
    kx('db-rdl', 3, 10, 20, 'PER_HAND', 2, addDays(asOf, -4)),
    kx('db-split-squat', 3, 8, 12, 'PER_HAND', 2, addDays(asOf, -1)),
    kx('db-row', 3, 10, 18, 'PER_HAND', 2, addDays(asOf, -1)),
    kx('push-up', 3, 12, null, null, 2, addDays(asOf, -1)),
  ],
  equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH', 'BANDS'],
  wearableCapabilities: garminFull(12),
  ...extra,
});
const hmSched = {runDays: [1, 3, 5, 6], strengthDays: [0, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 45, longRunDay: 6, longRunMinutes: 130};

// H17 missed quality in build -> weekly review -> short work pause -> return
add(() => {
  const cid = 'R6-H17', S = '2027-03-01', asOf = '2027-02-26', race = dd(S, 11, 6);
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `João, intermediate, half marathon on ${race} (12 weeks); runs Tue/Thu/Sat AM with the long run on Sunday, strength Mon/Thu PM. In ${W(4)} he misses the key quality run because of work, then completes the rest of the week. In ${W(5)} a last-minute work trip stops all training from Wednesday to Sunday (5 days); he returns on the Monday of ${W(6)}.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {id: 'h17-joao', ...hmIntermediate(asOf), event: {kind: 'HALF_MARATHON', date: race, timeGoalMinutes: 110}}, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 4, 3, '21:00:00', 'MISSED_SESSION'),
        targetRef: tref(4, 'RUN', {role: ['QUALITY']}),
        observationFacts: [missed(4, 'RUN', {role: ['QUALITY']}), done(4, 'STRENGTH', {day: 0})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 4, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(4, 'STRENGTH', {day: 3}), done(4, 'RUN', {day: 5}), doneSameDay(4, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 6, 0, '07:00:00', 'RETURN_AFTER_PAUSE', {
        interruption: {startDate: dd(S, 5, 2), endDate: dd(S, 5, 6), days: 5, reasonCategory: 'WORK', reason: 'Viagem de trabalho de última hora', nonclinical: true}}),
        observationFacts: [done(5, 'STRENGTH', {day: 0}), done(5, 'RUN', {day: 1})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'One missed quality session in a 12-week build has a negligible effect. The right move is to let it go, or relocate it only where it creates no back-to-back hard days and does not load the eve of the long run. A 5-day nonclinical break barely detrains a trained runner, so the plan should resume close to schedule without a restart.',
      preferredCoachingBehavior: [
        `S1 (MISSED_SESSION, ${W(4)}): KEEP, or a MODIFY that only relocates the stimulus without back-to-back hard days or a hard Saturday before the Sunday long run. No make-up added to next week.`,
        `S2 (WEEKLY_REVIEW, ${W(4)}): KEEP; next week's progression continues as planned (no regression for one miss).`,
        `S3 (RETURN_AFTER_PAUSE, ${W(6)}): KEEP or a minimal MODIFY (first session easy; the next long run held at the last completed long-run duration rather than progressed). No ASK about the cause, since a nonclinical WORK category was given.`,
      ],
      acceptableAlternatives: [
        'S1: turning the Saturday easy run into easy running with a few strides.',
        'S3: a slightly lighter first week back (about 10-15% less), with the race build otherwise intact.',
      ],
      concerns: [
        'S1: quality made up on Saturday (eve of the long run) or stacked onto the next week.',
        'S2: the whole plan regressed for one missed session.',
        'S3: a major deload or restart, HOLD, ASK about an explicitly nonclinical work trip, or making up the missed long run.',
      ],
    },
  }, meta: {}};
});

// H18 strength-first: missed key strength session, partial session, weekly review
add(() => {
  const cid = 'R6-H18', S = '2027-06-07', asOf = '2027-06-04';
  const sched = {runDays: [1, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 30, strengthMinutes: 70};
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Karen, 35, 62 kg, strength-first (squat 5x5 at 70 kg) with general running twice a week. In ${W(3)} she misses Monday's strength session (sick child, she is fine), then on Wednesday she only has 40 minutes and does the main lifts but skips the accessories (felt normal). Friday and the runs go as planned.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h18-karen', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'GENERAL', strength: 'STRENGTH'},
      runExperience: 'NOVICE', strengthExperience: 'EXPERIENCED',
      recent: {runDaysPerWeek: 2, runMinutesPerWeek: 50, longestRunMinutes: 30, strengthDaysPerWeek: 3},
      knownExercises: [
        kx('back-squat', 5, 5, 70, 'TOTAL', 2, '2027-05-31'),
        kx('barbell-rdl', 3, 6, 65, 'TOTAL', 2, '2027-06-02'),
        kx('bench-press', 4, 6, 40, 'TOTAL', 2, '2027-06-02'),
        kx('barbell-row', 3, 8, 35, 'TOTAL', 2, '2027-05-31'),
        kx('lat-pulldown', 3, 10, 40, 'TOTAL', 2, '2027-06-02'),
        kx('db-split-squat', 3, 8, 12, 'PER_HAND', 2, '2027-05-28'),
      ],
      equipment: GYM, sex: 'F', weightKg: 62,
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 3, 1, '08:00:00', 'MISSED_SESSION'),
        targetRef: tref(3, 'STRENGTH', {day: 0}),
        observationFacts: [missed(3, 'STRENGTH', {day: 0})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 3, 2, '21:00:00', 'PARTIAL_SESSION'),
        targetRef: tref(3, 'STRENGTH', {day: 2}),
        observationFacts: [
          done(3, 'RUN', {day: 1}),
          {weekIndex: idx(3), sport: 'STRENGTH', day: 2, completed: false, actualMinutes: 40, response: {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'UNKNOWN'}},
        ],
        adoptProposal: true},
      {review: rv(cid, 3, S, 3, 6, '20:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(3, 'STRENGTH', {day: 4}), done(3, 'RUN', {day: 5})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'In strength-priority training one missed session does not change the trajectory. The missed session\'s key lift can be prioritised in the next session without merging two sessions\' volume, and the next exposure should repeat (not skip) the planned load. A time-limited partial session with a normal response calls for no regression.',
      preferredCoachingBehavior: [
        `S1 (MISSED_SESSION, ${W(3)}): KEEP, or a MODIFY that brings Monday's main lift into Wednesday without adding Monday's full volume. The missed lift's next exposure repeats the planned load rather than jumping ahead.`,
        'S2 (PARTIAL_SESSION): KEEP; skipped accessories are not carried over; no regression.',
        'S3 (WEEKLY_REVIEW): KEEP; normal progression next week, the missed lift progressing from where it was last done.',
      ],
      acceptableAlternatives: ['S1: moving Monday\'s session to Tuesday evening (the Tuesday run is easy), keeping at least 48 h before the next heavy lower-body session.'],
      concerns: [
        'Monday\'s full volume stacked onto Wednesday or Friday.',
        'A deload after one miss.',
        'Progressing the missed lift as if it had been done.',
        'Treating the time-limited partial as underperformance or fatigue.',
      ],
    },
  }, meta: {}};
});

// H19 one bad session vs a repeated pattern
add(() => {
  const cid = 'R6-H19', S = '2027-01-04', asOf = '2026-12-31', race = dd(S, 11, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 100};
  const under = (rec, nd) => ({performance: 'UNDER', recovery: rec, effort: 'HARDER', nextDayFunction: nd});
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Lucas, intermediate, 10K on ${race} (12 weeks, PR 48:00, goal 46:00). In ${W(4)} one quality session goes badly (harder, under target) but he recovers normally and the rest of the week is fine. Then the same happens in ${W(5)} with poor recovery, and again in ${W(6)} with poor recovery and impaired function the next day; the ${W(5)} long run also felt harder than it should.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h19-lucas', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race, timeGoalMinutes: 46},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 65, strengthDaysPerWeek: 2},
      performanceAnchors: [{kind: 'RACE', distance: '10K', minutes: 48, date: '2026-10-18'}],
      knownRuns: [kr('TEN_K_SPECIFIC', 50, '2026-12-29', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 5, workMinutes: 3, recoveryMinutes: 2}, effort: '10K effort'}), kr('LONG', 65, '2026-12-27', {effort: 'easy'})],
      knownExercises: [kx('goblet-squat', 3, 10, 24, 'TOTAL', 2, '2026-12-28'), kx('db-rdl', 3, 10, 20, 'PER_HAND', 2, '2026-12-28'), kx('db-row', 3, 10, 20, 'PER_HAND', 2, '2026-12-25')],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'], wearableCapabilities: garminFull(10),
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 4, 4, '12:00:00', 'UNDERPERFORMANCE'),
        targetRef: tref(4, 'RUN', {role: ['QUALITY']}),
        observationFacts: [done(4, 'RUN', {role: ['QUALITY']}, {response: under('COMPATIBLE', 'NORMAL')}), done(4, 'STRENGTH', {day: 0})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 4, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(4, 'STRENGTH', {day: 4}), doneSameDay(4, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 5, 4, '12:00:00', 'UNDERPERFORMANCE'),
        targetRef: tref(5, 'RUN', {role: ['QUALITY']}),
        observationFacts: [done(5, 'RUN', {role: ['QUALITY']}, {response: under('ADVERSE', 'NORMAL')}), done(5, 'STRENGTH', {day: 0})],
        adoptProposal: true},
      {review: rv(cid, 4, S, 6, 4, '20:00:00', 'UNDERPERFORMANCE'),
        targetRef: tref(6, 'RUN', {role: ['QUALITY']}),
        observationFacts: [
          done(5, 'RUN', {role: 'LONG'}, {response: under('ADVERSE', 'NORMAL'), reportedAt: `${dd(S, 6, 4)}T19:30:00-03:00`}),
          done(6, 'STRENGTH', {day: 0}),
          done(6, 'RUN', {role: ['QUALITY']}, {response: under('ADVERSE', 'IMPAIRED')}),
        ],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'A single bad session is noise (sleep, heat, life) and should not move the plan. Three consecutive under-target key sessions with worsening recovery, plus a harder long run, form a pattern of accumulated fatigue or a prescription that is too ambitious, and the plan must respond. The coach should distinguish the two.',
      preferredCoachingBehavior: [
        `S1 (UNDERPERFORMANCE, ${W(4)}): KEEP, single session; no change.`,
        'S2 (WEEKLY_REVIEW): KEEP.',
        `S3 (UNDERPERFORMANCE, ${W(5)}): KEEP with heightened monitoring, or a small MODIFY (hold the next quality progression).`,
        `S4 (UNDERPERFORMANCE, ${W(6)}): MODIFY. Reduce the quality dose (fewer/shorter repetitions or lower effort), hold or reduce weekly progression or insert lighter days, explicitly citing the repeated pattern. A check-in about sleep, stress or illness symptoms alongside is good.`,
      ],
      acceptableAlternatives: [
        'S3: MODIFY already, given two consecutive sessions with adverse recovery.',
        'S4: HOLD intensity (easy running only) until a check-in; ASK if it explicitly checks illness symptoms while protecting the athlete.',
      ],
      concerns: [
        'S1/S2: regression or deload from one session.',
        'S4: progression continuing unchanged.',
        'S4: CLINICAL routing with no clinical flag.',
        'Large changes to strength for a running-specific pattern without reason.',
      ],
    },
  }, meta: {}};
});

// H20 repeated easier-than-planned strength sessions
add(() => {
  const cid = 'R6-H20', S = '2027-02-01', asOf = '2027-01-29';
  const sched = {runDays: [1, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 35, strengthMinutes: 60, longRunDay: 5, longRunMinutes: 45};
  const easy = {performance: 'OVER', recovery: 'COMPATIBLE', effort: 'EASIER', nextDayFunction: 'NORMAL'};
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: 'Bea, 30, intermediate lifter with a strength goal. Her self-reported working loads were conservative, and every strength session in weeks 1-3 feels easier than planned (reps done with reserve to spare, normal recovery). Her two easy runs per week feel as intended. She consents to learning. Timestamps in UTC.',
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: 0, learningConsent: true, athlete: {
      id: 'h20-bea', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'GENERAL', strength: 'STRENGTH'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 2, runMinutesPerWeek: 60, longestRunMinutes: 40, strengthDaysPerWeek: 3},
      knownExercises: [
        kx('back-squat', 3, 5, 60, 'TOTAL', 3, '2027-01-25'),
        kx('barbell-rdl', 3, 6, 60, 'TOTAL', 3, '2027-01-27'),
        kx('bench-press', 3, 5, 40, 'TOTAL', 3, '2027-01-27'),
        kx('barbell-row', 3, 8, 40, 'TOTAL', 3, '2027-01-25'),
        kx('lat-pulldown', 3, 10, 40, 'TOTAL', 3, '2027-01-27'),
      ],
      equipment: GYM, sex: 'F',
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 0, 6, '18:00:00', 'WEEKLY_REVIEW', {learningConsent: true}, 'Z'),
        observationFacts: [done(0, 'STRENGTH', {day: 0}, {response: easy}), done(0, 'STRENGTH', {day: 2}, {response: easy}), done(0, 'STRENGTH', {day: 4}, {response: easy}), done(0, 'RUN', {day: 1}), done(0, 'RUN', {day: 5})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 1, 6, '18:00:00', 'WEEKLY_REVIEW', {learningConsent: true}, 'Z'),
        observationFacts: [done(1, 'STRENGTH', {day: 0}, {response: easy}), done(1, 'STRENGTH', {day: 2}, {response: easy}), done(1, 'STRENGTH', {day: 4}, {response: easy}), done(1, 'RUN', {day: 1}), done(1, 'RUN', {day: 5})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 2, 2, '20:00:00', 'PROGRESSION_TOO_EASY', {learningConsent: true}, 'Z'),
        targetRef: tref(2, 'STRENGTH', {day: 4}),
        observationFacts: [done(2, 'STRENGTH', {day: 0}, {response: easy}), done(2, 'RUN', {day: 1}), done(2, 'STRENGTH', {day: 2}, {response: {...easy, nextDayFunction: 'UNKNOWN'}})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Repeated reports of sessions being easier than planned, with performance above target and normal recovery, are reliable evidence that her starting loads underestimate her capacity. A coach raises the loads modestly once the pattern repeats. Easy runs that feel easy are working as intended and are not a reason to raise running intensity.',
      preferredCoachingBehavior: [
        'S1 (WEEKLY_REVIEW, week 1): KEEP (calibration week), or a small load increase.',
        'S2 (WEEKLY_REVIEW, week 2): MODIFY with a modest load increase (about 2.5-7.5%, or the target reserve tightened toward RIR 2) on lifts reported easier, unless the program\'s normal progression already does this.',
        'S3 (PROGRESSION_TOO_EASY, week 3): MODIFY with loads raised beyond the default progression and the athlete-specific pattern noted (consent given). Easy runs unchanged.',
      ],
      acceptableAlternatives: ['Adding a rep or set within the planned range instead of load, if the next weeks then progress load.'],
      concerns: [
        'Making the easy runs harder.',
        'Load jumps above ~10%.',
        'Ignoring three weeks of consistent evidence.',
        'Unnecessary exercise changes.',
      ],
    },
  }, meta: {}};
});

// H21 local fatigue -> systemic fatigue -> recovered
add(() => {
  const cid = 'R6-H21', S = '2027-07-05', asOf = '2027-07-02';
  const sched = {runDays: [1, 3, 5], strengthDays: [0, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 50, longRunDay: 5, longRunMinutes: 90};
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Marta, 37, wants faster running and more strength (no event). Runs Tue/Thu/Sat (Saturday long), strength Mon/Thu evening. In ${W(3)}, the morning after Monday's strength session her quads are very sore (no pain, stairs uncomfortable) and Tuesday's run is next. In ${W(5)} a hard work week and poor sleep leave her drained: Monday's strength and Tuesday's run both felt much harder than usual, with poor recovery (no fever, no illness). By the Monday of ${W(6)}, after a relaxed weekend and an easy 30-min test jog on Sunday, she feels normal.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h21-marta', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'PERFORMANCE', strength: 'STRENGTH'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2},
      knownRuns: [kr('THRESHOLD', 50, '2027-06-29', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 3, workMinutes: 7, recoveryMinutes: 2}, effort: 'comfortably hard'})],
      knownExercises: [kx('back-squat', 4, 6, 60, 'TOTAL', 2, '2027-06-28'), kx('barbell-rdl', 3, 8, 55, 'TOTAL', 2, '2027-07-01'), kx('bench-press', 3, 8, 35, 'TOTAL', 2, '2027-06-28'), kx('lat-pulldown', 3, 10, 40, 'TOTAL', 2, '2027-07-01')],
      equipment: GYM, sex: 'F',
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 3, 1, '06:30:00', 'LOCAL_FATIGUE', {signals: {region: 'LOWER'}}),
        targetRef: tref(3, 'RUN', {day: 1}),
        observationFacts: [done(3, 'STRENGTH', {day: 0}, {response: {performance: 'COMPATIBLE', recovery: 'ADVERSE', effort: 'ON_TARGET', nextDayFunction: 'IMPAIRED'}})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 5, 2, '07:00:00', 'SYSTEMIC_FATIGUE', {signals: {region: 'ALL'}}),
        targetRef: tref(5, 'RUN', {day: 3}),
        observationFacts: [
          done(5, 'STRENGTH', {day: 0}, {response: {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'}}),
          done(5, 'RUN', {day: 1}, {response: {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'}}),
        ],
        adoptProposal: true},
      {review: rv(cid, 3, S, 6, 0, '07:00:00', 'RECOVERED', {
        currentDemonstration: {observedAt: `${dd(S, 5, 6)}T08:00:00-03:00`, sport: 'RUN', family: 'EASY', minutes: 30, completed: true, effort: 'CONVERSATIONAL', response: 'COMPATIBLE', ordinaryFunction: 'COMPATIBLE', nextDayFunction: 'NORMAL'}}),
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Local muscle soreness after strength work is a local, short-lived, nonclinical problem: protect the next lower-body-intensive session, nothing more. Systemic fatigue from life stress and poor sleep affects everything: reduce the whole week\'s load and check for illness symptoms, without assuming disease. After recovery, resume at about the pre-fatigue level rather than jumping to where the original plan would have been.',
      preferredCoachingBehavior: [
        `S1 (LOCAL_FATIGUE LOWER, ${W(3)}): MODIFY locally. Tuesday's run easy/shorter, or swapped with a later easy day so quality happens when the soreness has eased; the next lower-body strength volume reduced; upper body unaffected; not clinical.`,
        `S2 (SYSTEMIC_FATIGUE ALL, ${W(5)}): MODIFY the rest of the week. Quality converted to easy or removed, strength volume down 30-50% or one session dropped, the long run shortened and easy, easy movement kept. A check-in on sleep, stress and illness symptoms; no make-up.`,
        `S3 (RECOVERED, ${W(6)}): resume at roughly the ${W(4)} level (not the original week-7 plan plus catch-up), reintroducing quality during the week if she stays normal.`,
      ],
      acceptableAlternatives: [
        'S1: KEEP with an explicit instruction to keep Tuesday easy if still sore.',
        'S2: HOLD intensity for a few days.',
        'S3: KEEP, if the program\'s next week was already moderate.',
      ],
      concerns: [
        'S1: clinical routing for ordinary soreness, or a full-body deload.',
        'S2: planned progression or intervals continued, or CLINICAL routing with no clinical flag.',
        'S3: a big jump or extra make-up work.',
      ],
    },
  }, meta: {}};
});

// H22 unavailable day + permanent schedule change
add(() => {
  const cid = 'R6-H22', S = '2027-01-04', asOf = '2026-12-31', race = dd(S, 15, 6);
  const newSched = {runDays: [0, 2, 4, 6], strengthDays: [2, 5], longRunDay: 6, runTurn: 'AM', strengthTurn: 'PM', from: dd(S, 8, 0)};
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Nina, intermediate, half marathon on ${race} (16 weeks); runs Tue/Thu/Sat/Sun (Sunday long), strength Mon/Thu. In ${W(5)} she learns on Wednesday that Sunday ${dd(S, 5, 6)} is taken by a family event (long-run day). In ${W(7)} she gets a new job: from ${newSched.from} she can run Mon/Wed/Fri/Sun (Sunday long) and lift Wed/Sat.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {id: 'h22-nina', ...hmIntermediate(asOf), event: {kind: 'HALF_MARATHON', date: race}}, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 5, 2, '20:00:00', 'UNAVAILABLE_DAY', {changes: {unavailableDates: [dd(S, 5, 6)]}}),
        targetRef: tref(5, 'RUN', {role: 'LONG'}),
        observationFacts: [done(5, 'STRENGTH', {day: 0}), done(5, 'RUN', {day: 1})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 5, 6, '20:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(5, 'RUN', {day: 3}), done(5, 'STRENGTH', {day: 3}), done(5, 'RUN', {day: 5})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 7, 2, '20:00:00', 'SCHEDULE_CHANGE', {changes: newSched}),
        adoptProposal: true},
      {review: rv(cid, 4, S, 8, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(8, 'RUN', {day: 0}), done(8, 'RUN', {day: 2}), done(8, 'STRENGTH', {day: 2}), done(8, 'RUN', {day: 4}), done(8, 'STRENGTH', {day: 5}), doneSameDay(8, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'A one-off unavailable long-run day is best handled by moving the long run to the nearest sensible day, replacing rather than adding to that day\'s run, or by accepting a shorter week. A permanent schedule change requires re-mapping the week so that key sessions keep their spacing: no quality the day after the long run, and no heavy lower-body work the day before it. Progression and the race timeline should carry over, and nothing before the effective date should change.',
      preferredCoachingBehavior: [
        `S1 (UNAVAILABLE_DAY ${dd(S, 5, 6)}): MODIFY, long run moved to Saturday ${dd(S, 5, 5)} replacing the Saturday easy run (not added on top), possibly slightly shortened; nothing scheduled on the unavailable date.`,
        'S2 (WEEKLY_REVIEW): KEEP.',
        `S3 (SCHEDULE_CHANGE from ${newSched.from}): MODIFY from that date only. Long run Sunday; quality on Wednesday (or Friday, if short), never Monday (day after the long run); heavy lower-body work on Wednesday evening; Saturday strength (eve of the long run) upper/light. Progression and the race date preserved.`,
        `S4 (WEEKLY_REVIEW, ${W(8)}): KEEP.`,
      ],
      acceptableAlternatives: [
        'S1: skipping or shortening that week\'s long run if it was a recovery week.',
        'S3: quality on Friday with Wednesday easy + strength.',
      ],
      concerns: [
        'S1: long run on Monday before Tuesday\'s session without adjusting, two runs on Saturday, or anything on the unavailable date.',
        'S3: quality on Monday after the Sunday long run, heavy lower-body work on Saturday, a progression reset, or changes before the effective date.',
      ],
    },
  }, meta: {scheduleChanges: [newSched]}};
});

// H23 double conflict on a shared day
add(() => {
  const cid = 'R6-H23', S = '2027-08-30', asOf = '2027-08-27', race = dd(S, 11, 5);
  const sched = {runDays: [1, 3, 5], strengthDays: [1, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 45, longRunDay: 5, longRunMinutes: 80};
  const conflictDay = dd(S, 4, 1);
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Otto, intermediate, 10K on ${race} (a Saturday, 12 weeks). Runs Tue/Thu/Sat AM (Saturday long), strength Tue/Fri PM. For Tuesday ${conflictDay} (${W(4)}) he has an evening commitment, so both Tuesday sessions would have to fit into the same morning slot, and he says he cannot do both back-to-back.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h23-otto', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 140, longestRunMinutes: 65, strengthDaysPerWeek: 2},
      knownExercises: [kx('goblet-squat', 3, 10, 24, 'TOTAL', 2, '2027-08-24'), kx('db-rdl', 3, 10, 20, 'PER_HAND', 2, '2027-08-27'), kx('db-split-squat', 3, 8, 14, 'PER_HAND', 2, '2027-08-24'), kx('db-row', 3, 10, 20, 'PER_HAND', 2, '2027-08-27'), kx('push-up', 3, 15, null, null, 2, '2027-08-27')],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'],
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 4, 0, '07:00:00', 'DOUBLE_CONFLICT', {changes: {strengthTurn: 'AM', sameTurnConfirmed: false, from: conflictDay, to: conflictDay}}),
        targetRef: tref(4, 'STRENGTH', {day: 1}),
        adoptProposal: true},
      {review: rv(cid, 2, S, 4, 6, '18:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(4, 'RUN', {day: 1}), done(4, 'RUN', {day: 3}), done(4, 'STRENGTH', {day: 4}), done(4, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Running leads (dated 10K). The Tuesday run stays and the strength session must not be stacked into the same morning without confirmation. The best place for it is a day where it does not precede a key run: Wednesday works only if light or upper-focused when Thursday holds quality, and Friday already carries strength on the eve of the long run. Dropping this week\'s Tuesday strength is also reasonable.',
      preferredCoachingBehavior: [
        'S1 (DOUBLE_CONFLICT): MODIFY. Keep the Tuesday run; move strength to Wednesday with upper/trunk emphasis (or light lower) or drop it this week, relying on Friday. No same-slot stacking; nothing heavy added to Friday.',
        'S2 (WEEKLY_REVIEW): KEEP; normal structure resumes next week.',
      ],
      acceptableAlternatives: [
        'S1: ASK that presents the concrete options (move to Wednesday vs skip).',
        'A short strength block after the run only if the athlete confirms the time (he said he cannot, so this is weak here).',
      ],
      concerns: [
        'Both sessions stacked in the same morning against his statement.',
        'Heavy lower-body work on Wednesday before a Thursday quality session.',
        'Friday strength doubled on the eve of the long run.',
        'Dropping the run instead of the strength session.',
      ],
    },
  }, meta: {}};
});

// H24 travel with bodyweight only, then back home
add(() => {
  const cid = 'R6-H24', S = '2027-04-05', asOf = '2027-04-02', race = dd(S, 11, 6);
  const from = dd(S, 4, 0), to = dd(S, 5, 6);
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Paula, intermediate, half marathon on ${race} (12 weeks), gym lifter (back squat 3x6 at 60 kg). She travels to Lisbon (UTC+01:00) from ${from} to ${to} with only bodyweight available (she can still run). She reviews her first travel week from Lisbon, then returns home; on her first week back the squat feels heavier than usual.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h24-paula', ...hmIntermediate(asOf, {
        knownExercises: [kx('back-squat', 3, 6, 60, 'TOTAL', 2, '2027-03-29'), kx('barbell-rdl', 3, 8, 55, 'TOTAL', 2, '2027-04-01'), kx('db-split-squat', 3, 8, 14, 'PER_HAND', 2, '2027-03-29'), kx('lat-pulldown', 3, 10, 40, 'TOTAL', 2, '2027-04-01'), kx('db-bench-press', 3, 10, 14, 'PER_HAND', 2, '2027-03-29')],
        equipment: GYM}),
      event: {kind: 'HALF_MARATHON', date: race}, sex: 'F',
    }, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 3, 6, '18:00:00', 'EQUIPMENT_CHANGE', {changes: {equipment: ['BODYWEIGHT'], from, to}}),
        adoptProposal: true},
      {review: rv(cid, 2, S, 4, 6, '20:00:00', 'WEEKLY_REVIEW', {}, '+01:00'),
        observationFacts: [done(4, 'STRENGTH', {day: 0}), done(4, 'RUN', {day: 1}), done(4, 'RUN', {day: 3}), done(4, 'STRENGTH', {day: 3}), done(4, 'RUN', {day: 5}), doneSameDay(4, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 6, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [
          done(6, 'STRENGTH', {day: 0}, {response: {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL'}}),
          done(6, 'RUN', {day: 1}), done(6, 'RUN', {day: 3}), done(6, 'STRENGTH', {day: 3}), done(6, 'RUN', {day: 5}), doneSameDay(6, 'RUN', {role: 'LONG'}),
        ],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Two weeks of travel with bodyweight only should keep strength patterns alive with substitutes (maintenance intent) and leave running untouched. The change is temporary and must revert after the end date. On return a slightly harder squat is expected after two weeks without load: hold or slightly reduce for a week, then resume. It is not a reason for a deload or a regression.',
      preferredCoachingBehavior: [
        `S1 (EQUIPMENT_CHANGE ${from}..${to}): MODIFY strength only in that window, with pattern-matched bodyweight substitutes (split-squat-bodyweight/reverse-lunge, glute-bridge/hip-hinge-practice, push-up, prone-row-practice, standing-calf-raise, side-plank/dead-bug), maintenance intent. Running unchanged; original equipment and exercises after ${to}.`,
        'S2 (WEEKLY_REVIEW from UTC+01:00): KEEP; the different offset is handled without error.',
        `S3 (WEEKLY_REVIEW, ${W(6)}, back home): KEEP or a small MODIFY holding loads for a week (no progression on the squat), then resuming; the HARDER report is read in context.`,
      ],
      acceptableAlternatives: ['S3: a small temporary load reduction (≤ ~10%) on the lower-body lifts.'],
      concerns: [
        'Strength dropped entirely, or barbell/dumbbell exercises prescribed while away.',
        'The equipment change made permanent.',
        'Running changed for an equipment-only issue.',
        'S2: the +01:00 timestamp rejected or the week misassigned.',
        'S3: a large deload, or loads progressed despite HARDER.',
      ],
    },
  }, meta: {}};
});

// H25 goal change (adds a 10K) then the event date moves earlier
add(() => {
  const cid = 'R6-H25', S = '2027-01-04', asOf = '2026-12-31';
  const race1 = dd(S, 13, 6), race2 = dd(S, 11, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 50, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 90};
  return {c: {
    caseId: cid, family: 'ADAPTATION', operation: 'SEQUENCE',
    scenario: `Rafa, 28, runs regularly (3x/week, ~120 min, longest 50) and trains for hypertrophy 3x/week. In ${W(2)} he signs up for a 10K on ${race1} and changes his goals to race the 10K while only maintaining strength, effective ${dd(S, 3, 0)}. In ${W(6)} the organisers move the race two weeks earlier, to ${race2}.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {
      id: 'h25-rafa', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'REGULAR', strength: 'HYPERTROPHY'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50, strengthDaysPerWeek: 3},
      performanceAnchors: [{kind: 'TIME_TRIAL', distance: '5K', minutes: 25, date: '2026-12-12'}],
      knownExercises: [kx('back-squat', 4, 8, 80, 'TOTAL', 2, '2026-12-28'), kx('bench-press', 4, 8, 70, 'TOTAL', 2, '2026-12-30'), kx('barbell-rdl', 3, 10, 70, 'TOTAL', 2, '2026-12-28'), kx('lat-pulldown', 4, 10, 60, 'TOTAL', 2, '2026-12-30'), kx('db-overhead-press', 3, 10, 16, 'PER_HAND', 2, '2026-12-30')],
      equipment: GYM, sex: 'M',
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 2, 2, '20:00:00', 'GOAL_CHANGE', {changes: {goals: {run: 'RACE', strength: 'MAINTAIN'}, event: {kind: '10K', date: race1}, from: dd(S, 3, 0)}}),
        adoptProposal: true},
      {review: rv(cid, 2, S, 6, 2, '20:00:00', 'EVENT_DATE_CHANGE', {changes: {eventDate: race2}}),
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'A goal change should reshape the plan from its effective date: a progressive 10K build with a taper and post-race recovery, and strength stepping down to maintenance (less volume, intensity kept). When the race moves earlier, the build is compressed by accepting a lower peak, not by ramping faster, and the taper moves with the race.',
      preferredCoachingBehavior: [
        `S1 (GOAL_CHANGE, effective ${dd(S, 3, 0)}): MODIFY. A 10K build toward ${race1} with a RACE on that date; weekly running growth about 10% or less; quality introduced after 1-2 weeks; long run 50 -> about 75-85 min; taper in race week; post-race recovery weeks planned. Strength to maintenance (2-3 sessions, lower volume, intensity kept), heavy lower-body work separated from key runs. Weeks before the effective date unchanged.`,
        `S2 (EVENT_DATE_CHANGE to ${race2}): MODIFY. RACE moved to ${race2}, build compressed with a lower peak long run rather than a steeper ramp, taper shifted to the new race week, post-race recovery and the remaining weeks re-planned (post-race goals may be asked about).`,
      ],
      acceptableAlternatives: [
        'S1: a brief confirmation question about the strength change (weak, since it is explicit).',
        'S2: a note about time-goal realism.',
      ],
      concerns: [
        'S1: a running volume jump above ~20%/week, or full hypertrophy volume kept.',
        'S2: the race left on the old date, a steeper ramp to the old peak, the taper removed, or no post-race recovery.',
      ],
    },
  }, meta: {}};
});

// =============================== RETURN AFTER PAUSE ===============================

add(() => {
  const cid = 'R6-H26', S = '2027-05-03', asOf = '2027-04-30', race = dd(S, 15, 6);
  const pStart = dd(S, 6, 0), pEnd = dd(S, 8, 2);
  return {c: {
    caseId: cid, family: 'RETURN_AFTER_PAUSE', operation: 'SEQUENCE',
    scenario: `Sofia, intermediate, half marathon on ${race} (16 weeks), fully adherent through ${W(5)}. She then takes a ${diffDays(pStart, pEnd) + 1}-day vacation without training (${pStart}..${pEnd}) and returns on Thursday of ${W(8)}, with about 7 weeks to the race.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {id: 'h26-sofia', ...hmIntermediate(asOf), event: {kind: 'HALF_MARATHON', date: race, timeGoalMinutes: 112}, sex: 'F'}, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 5, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(5, 'STRENGTH', {day: 0}), done(5, 'RUN', {day: 1}), done(5, 'RUN', {day: 3}), done(5, 'STRENGTH', {day: 3}), done(5, 'RUN', {day: 5}), doneSameDay(5, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 8, 3, '07:00:00', 'RETURN_AFTER_PAUSE', {interruption: {startDate: pStart, endDate: pEnd, days: diffDays(pStart, pEnd) + 1, reasonCategory: 'VACATION', reason: 'Férias em família', nonclinical: true}}),
        adoptProposal: true},
      {review: rv(cid, 3, S, 9, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(9, 'STRENGTH', {day: 0}), done(9, 'RUN', {day: 1}), doneSameDay(9, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'About 2.5 weeks off causes a modest but real loss of running fitness and strength. Re-entry should take 1-2 weeks below the pre-pause level before rebuilding. With ~7 weeks to go, the remaining build must be recomputed realistically (lower peak, taper preserved) rather than resuming at the planned week-8 load or making up missed sessions.',
      preferredCoachingBehavior: [
        'S1 (WEEKLY_REVIEW, adherent): KEEP.',
        `S2 (RETURN_AFTER_PAUSE, VACATION, ${W(8)}): MODIFY. Re-entry at about 60-75% of pre-pause weekly volume; long run about 70-80% of the last one; quality reintroduced as lighter work in the second week back; strength at about 85-90% of loads with more reserve; the rest of the build recomputed for ${race} with a realistic peak and an intact taper. Time-goal realism noted. No ASK about the cause (VACATION given).`,
        `S3 (WEEKLY_REVIEW, ${W(9)}): KEEP or gradual progression.`,
      ],
      acceptableAlternatives: ['S2: a request for a short current demonstration (easy run) before committing loads (weaker, since the category is clear).'],
      concerns: [
        'S2: resuming at the planned week-8 load, or making up missed long runs.',
        'S2: cutting the taper to rebuild volume.',
        'S2: HOLD or clinical routing for a vacation.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H27', S = '2027-09-13', asOf = '2027-09-10', race = dd(S, 11, 6);
  return {c: {
    caseId: cid, family: 'RETURN_AFTER_PAUSE', operation: 'GENERATE',
    scenario: `Tiago, 40, former half marathoner (threshold 4x8 min and 100-min long runs until June), stopped for 11 weeks while moving to another country (nonclinical). In the last two weeks he ran once a week for 30 min. He signs up for a 10K on ${race} (12 weeks) and wants running-support strength again (his pre-pause loads are listed as not current).`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h27-tiago', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race},
      runExperience: 'EXPERIENCED', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 1, runMinutesPerWeek: 30, longestRunMinutes: 30, strengthDaysPerWeek: 0},
      knownRuns: [
        kr('THRESHOLD', 63, '2027-06-17', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 4, workMinutes: 8, recoveryMinutes: 2}, effort: 'comfortably hard'}, {current: false}),
        kr('LONG', 100, '2027-06-20', {effort: 'easy'}, {current: false}),
        kr('EASY', 30, '2027-09-05', {effort: 'easy'}),
      ],
      knownExercises: [kx('goblet-squat', 3, 10, 28, 'TOTAL', 2, '2027-06-15', {current: false}), kx('db-rdl', 3, 10, 24, 'PER_HAND', 2, '2027-06-15', {current: false}), kx('db-row', 3, 10, 22, 'PER_HAND', 2, '2027-06-15', {current: false})],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'],
      pause: {nonclinical: true, weeks: 11, reasonCategory: 'MOVING', reason: 'Mudança de país; sem treinar desde o fim de junho.'},
    }, schedule: stdSched}),
    independentAssessment: {
      rationale: 'After 11 weeks off, the starting point is what he does now (1x30 min), not what he did in June. Training history allows a somewhat faster rebuild than a true novice, but not pre-pause prescriptions. Strength restarts below the old loads with a generous reserve.',
      preferredCoachingBehavior: [
        `PROPOSED starting from current work: 3 easy runs of about 20-30 min in week 1 (walk-jog not needed but allowed); quality only after ~3-4 weeks of consistent running; long run 30 -> about 60-75 min by the race; RACE on ${race} with a realistic or completion target.`,
        'Strength at about 70-80% of the old loads (or rebuilt from reps), RIR 3, twice a week.',
        'No ASK about the cause of the pause (MOVING, nonclinical, given).',
      ],
      acceptableAlternatives: ['A slightly faster progression than a novice\'s ("muscle memory"), still starting at the current level.'],
      concerns: [
        'The old 4x8 threshold or a 100-min long run prescribed, or pre-pause strength loads used as current.',
        'ASK about the pause cause.',
        'Refusing the event.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H28', S = '2027-02-01', asOf = '2027-01-29', race = dd(S, 11, 6);
  const pStart = dd(S, 3, 2), pEnd = dd(S, 4, 6);
  const intr = {startDate: pStart, endDate: pEnd, days: diffDays(pStart, pEnd) + 1};
  return {c: {
    caseId: cid, family: 'RETURN_AFTER_PAUSE', operation: 'SEQUENCE',
    scenario: `Vera, intermediate, half marathon on ${race} (12 weeks). She stopped training from ${pStart} to ${pEnd} (${intr.days} days). On returning (Monday of ${W(5)}) she only writes "Fiquei de cama uns dias e depois perdi o ritmo" (I was in bed for a few days and then lost my rhythm), with no category. An hour later she answers the follow-up: it was flu with fever for 4 days, fever-free since ${dd(S, 4, 1)}; she feels fine now and all current eligibility answers are negative.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {id: 'h28-vera', ...hmIntermediate(asOf), event: {kind: 'HALF_MARATHON', date: race}, sex: 'F'}, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 5, 0, '08:00:00', 'RETURN_AFTER_PAUSE', {interruption: {...intr, reason: 'Fiquei de cama uns dias e depois perdi o ritmo.'}}),
        adoptProposal: false},
      {review: rv(cid, 2, S, 5, 0, '09:30:00', 'RETURN_AFTER_PAUSE', {interruption: {...intr, reasonCategory: 'ILLNESS', reason: `Gripe com febre por 4 dias; sem febre desde ${dd(S, 4, 1)}.`, nonclinical: false}}),
        adoptProposal: false},
    ],
    independentAssessment: {
      rationale: 'The first answer is free text that hints at illness without a category, so the right move is to ask what happened, not to resume and not to assume disease. Once she says it was a febrile illness, returning to training involves clinical judgment (for example, return after a febrile viral illness). A nonclinical reference coach should route that to a human clinician rather than prescribe a comeback, even though she feels fine.',
      preferredCoachingBehavior: [
        'S1 (free text only): ASK about the cause/category of the break; no resumption and no load prescription.',
        'S2 (ILLNESS with fever): CLINICAL_HUMAN_REQUIRED (human clinical clearance before resuming), supportive and non-diagnostic; no program changes applied.',
      ],
      acceptableAlternatives: [
        'S1: CLINICAL_HUMAN_REQUIRED (defensible given "de cama").',
        'S2: ASK specifically for clinician clearance with no program.',
      ],
      concerns: [
        'S1: resuming training or progression on free text alone.',
        'S2: automatic resumption or KEEP; diagnosing; alarming language.',
      ],
    },
  }, meta: {}};
});

// =============================== EVENT TRANSITIONS ===============================

add(() => {
  const cid = 'R6-H29', S = '2027-03-01', asOf = '2027-02-26', race = dd(S, 5, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 90};
  const trip = [dd(S, 5, 2), dd(S, 5, 3), dd(S, 5, 4)];
  return {c: {
    caseId: cid, family: 'EVENT_TRANSITION', operation: 'SEQUENCE',
    scenario: `Wagner, intermediate (10K PR 50:00, goal 48:00), 10K on ${race} at the end of ${W(5)} in an 8-week horizon (two post-race weeks). He completes the pre-race week. On Monday of race week he learns of a work trip Wednesday-Friday (${trip.join(', ')}). He races in 49 minutes, then does the post-race week.`,
    intake: mkIntake({asOf, startDate: S, weeks: 8, tz: -180, athlete: {
      id: 'h29-wagner', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race, timeGoalMinutes: 48},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2},
      performanceAnchors: [{kind: 'RACE', distance: '10K', minutes: 50, date: '2026-10-25'}],
      knownRuns: [kr('TEN_K_SPECIFIC', 50, '2027-02-23', {warmupMinutes: 15, cooldownMinutes: 10, work: {repetitions: 5, workMinutes: 3, recoveryMinutes: 2}, effort: '10K effort'})],
      knownExercises: [kx('goblet-squat', 3, 10, 24, 'TOTAL', 2, '2027-02-22'), kx('db-rdl', 3, 10, 20, 'PER_HAND', 2, '2027-02-25'), kx('db-row', 3, 10, 20, 'PER_HAND', 2, '2027-02-25')],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'], wearableCapabilities: garminFull(10),
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 4, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(4, 'STRENGTH', {day: 0}), done(4, 'RUN', {day: 1}), done(4, 'RUN', {day: 3}), doneSameDay(4, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 5, 0, '08:00:00', 'EVENT_WEEK_CONFLICT', {changes: {unavailableDates: trip}}),
        adoptProposal: true},
      {review: rv(cid, 3, S, 5, 6, '18:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(5, 'RUN', {day: 1}), {weekIndex: idx(5), sport: 'RUN', role: 'RACE', completed: true, actualMinutes: 49, response: {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'UNKNOWN'}}],
        adoptProposal: true},
      {review: rv(cid, 4, S, 6, 6, '18:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(6, 'RUN', {role: ['RECOVERY_EASY', 'EASY']})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'The taper and race week should be protected; a late conflict in race week is resolved by subtraction, never by moving work closer to the race. Saturday is not one of his run days, so a shakeout there can only be optional. After a 10K, about 5-7 easy days come before any quality, and the race result is new performance evidence.',
      preferredCoachingBehavior: [
        `S1 (WEEKLY_REVIEW, ${W(4)}): KEEP the taper/race week as planned.`,
        `S2 (EVENT_WEEK_CONFLICT ${trip[0]}..${trip[2]}): MODIFY. Race kept on ${race}; Tuesday a short race-touch (strides or a few short efforts); nothing on the trip dates; the Thursday run and Thursday strength dropped (not moved to Saturday as a hard session); Monday strength light or none; an optional short Saturday shakeout at most.`,
        `S3 (WEEKLY_REVIEW, race done in 49:00): KEEP. ${W(6)} easy/recovery (no quality for ~5-7 days), light strength; the 49:00 recorded as the new anchor.`,
        `S4 (WEEKLY_REVIEW, ${W(6)}): KEEP; the final week resumes moderate training (quality may return).`,
      ],
      acceptableAlternatives: ['S2: ASK whether Saturday is available for a shakeout.'],
      concerns: [
        'S2: the missed Thursday session moved to Saturday, or extra volume added on Tuesday.',
        'S3: quality within 5 days after the race, or the race treated as a normal long run.',
        'The race result ignored for future prescriptions.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H30', S = '2027-06-07', asOf = '2027-06-04', race = dd(S, 13, 6);
  return {c: {
    caseId: cid, family: 'EVENT_TRANSITION', operation: 'SEQUENCE',
    scenario: `Xénia, intermediate, half marathon on ${race} at the end of ${W(13)} in a 16-week horizon. She misses the last long run (${W(11)}, two weeks out) for a family reason, completes the taper week, races in 112 min, and two days later reports very sore legs (expected after a half marathon, no pain flags). The program then continues with two post-race weeks.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, athlete: {id: 'h30-xenia', ...hmIntermediate(asOf), event: {kind: 'HALF_MARATHON', date: race, timeGoalMinutes: 112}, sex: 'F'}, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 11, 6, '20:00:00', 'MISSED_SESSION'),
        targetRef: tref(11, 'RUN', {role: 'LONG'}),
        observationFacts: [done(11, 'STRENGTH', {day: 0}), done(11, 'RUN', {day: 1}), done(11, 'RUN', {day: 3}), done(11, 'STRENGTH', {day: 3}), done(11, 'RUN', {day: 5}), missed(11, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 12, 6, '19:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(12, 'STRENGTH', {day: 0}), done(12, 'RUN', {day: 1}), done(12, 'RUN', {day: 3})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 13, 6, '21:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(13, 'RUN', {day: 1}), {weekIndex: idx(13), sport: 'RUN', role: 'RACE', eventId: 'R6-H30-RACE', completed: true, actualMinutes: 112, response: {performance: 'COMPATIBLE', recovery: 'UNKNOWN', effort: 'ON_TARGET', nextDayFunction: 'UNKNOWN'}}],
        adoptProposal: true},
      {review: rv(cid, 4, S, 14, 1, '08:00:00', 'LOCAL_FATIGUE', {signals: {region: 'LOWER'}}),
        observationFacts: [{weekIndex: idx(13), sport: 'RUN', role: 'RACE', eventId: 'R6-H30-RACE-C1', correctionOf: 'R6-H30-RACE', correctedAt: `${dd(S, 14, 1)}T07:55:00-03:00`, reportedAt: `${dd(S, 14, 1)}T07:55:00-03:00`, completed: true, actualMinutes: 112, response: {performance: 'COMPATIBLE', recovery: 'ADVERSE', effort: 'ON_TARGET', nextDayFunction: 'IMPAIRED'}}],
        adoptProposal: true},
      {review: rv(cid, 5, S, 14, 6, '18:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(14, 'RUN', {role: ['RECOVERY_EASY', 'EASY']})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Missing the last long run two weeks out costs little: fitness is already built, and making it up endangers the taper. Very sore legs one to two days after a half marathon are the normal response and are already covered by post-race recovery; they are not a clinical signal. Post-race weeks should be easy before any quality returns.',
      preferredCoachingBehavior: [
        `S1 (MISSED_SESSION long run, ${W(11)}): KEEP. No make-up long run, no longer long run in ${W(12)}, taper intact.`,
        `S2 (WEEKLY_REVIEW taper, ${W(12)}): KEEP.`,
        `S3 (WEEKLY_REVIEW race, ${W(13)}): KEEP. Race recorded; post-race weeks easy (no quality for about 7-10 days; strength light/upper first).`,
        'S4 (LOCAL_FATIGUE after the race, correction applied): KEEP or a MODIFY that keeps the next few runs short and easy; read as the expected post-race response; no HOLD or clinical routing.',
        `S5 (WEEKLY_REVIEW, ${W(14)}): KEEP; gradual return in the final week.`,
      ],
      acceptableAlternatives: ['S1: a moderate, shorter long run early in the next week only if the taper is clearly not disturbed (weaker than letting it go).'],
      concerns: [
        'S1: the long run moved to Monday, or the next week\'s long run extended or the taper delayed.',
        'S4: CLINICAL routing or HOLD for normal post-race soreness; ignoring the correction.',
        'S3/S5: quality soon after the race.',
      ],
    },
  }, meta: {}};
});

// =============================== DATA QUALITY ===============================

add(() => {
  const cid = 'R6-H31', S = '2027-01-04', asOf = '2026-12-31', race = dd(S, 11, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 100};
  const noEffort = {performance: 'UNKNOWN', recovery: 'COMPATIBLE', effort: 'UNKNOWN', nextDayFunction: 'NORMAL'};
  return {c: {
    caseId: cid, family: 'DATA_QUALITY', operation: 'SEQUENCE',
    scenario: `Yara, intermediate, 10K on ${race}. She records runs with a Garmin watch (full) and her phone also logs them (Apple Health, partial). In ${W(2)} the Sunday long run arrives twice (watch and phone, a minute apart), and the Tuesday/Thursday runs arrive without any effort rating. In ${W(3)} the Tuesday run arrives twice again, the phone showing only 31 minutes because its GPS paused.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h31-yara', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2},
      knownExercises: [kx('goblet-squat', 3, 10, 20, 'TOTAL', 2, '2026-12-28'), kx('db-rdl', 3, 10, 16, 'PER_HAND', 2, '2026-12-28'), kx('db-row', 3, 10, 16, 'PER_HAND', 2, '2026-12-25')],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'], wearableCapabilities: garminFull(12), sex: 'F',
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 2, 6, '20:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [
          done(2, 'STRENGTH', {day: 0}, {source: {provider: 'manual', quality: 'MANUAL'}}),
          done(2, 'RUN', {day: 1}, {response: noEffort, source: {provider: 'garmin', activityId: 'g-7701', quality: 'WEARABLE_FULL'}}),
          done(2, 'RUN', {day: 3}, {response: noEffort, source: {provider: 'garmin', activityId: 'g-7702', quality: 'WEARABLE_FULL'}}),
          done(2, 'STRENGTH', {day: 4}, {source: {provider: 'manual', quality: 'MANUAL'}}),
          done(2, 'RUN', {role: 'LONG'}, {eventId: 'R6-H31-LONG-WATCH', observedAt: `${dd(S, 2, 6)}T07:02:00-03:00`, source: {provider: 'garmin', activityId: 'g-7781', quality: 'WEARABLE_FULL'}, response: {...OK_SAMEDAY}}),
          done(2, 'RUN', {role: 'LONG'}, {eventId: 'R6-H31-LONG-PHONE', observedAt: `${dd(S, 2, 6)}T07:03:10-03:00`, source: {provider: 'apple-health', activityId: 'ah-55120', quality: 'WEARABLE_PARTIAL'}, response: {...UNK}}),
        ],
        adoptProposal: true},
      {review: rv(cid, 2, S, 3, 6, '20:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [
          done(3, 'STRENGTH', {day: 0}, {source: {provider: 'manual', quality: 'MANUAL'}}),
          done(3, 'RUN', {day: 1}, {eventId: 'R6-H31-TUE-WATCH', observedAt: `${dd(S, 3, 1)}T06:35:00-03:00`, source: {provider: 'garmin', activityId: 'g-7802', quality: 'WEARABLE_FULL'}}),
          {weekIndex: idx(3), sport: 'RUN', day: 1, eventId: 'R6-H31-TUE-PHONE', observedAt: `${dd(S, 3, 1)}T06:35:40-03:00`, source: {provider: 'apple-health', activityId: 'ah-55201', quality: 'WEARABLE_PARTIAL'}, completed: true, actualMinutes: 31, response: {...UNK}},
          done(3, 'RUN', {day: 3}, {source: {provider: 'garmin', activityId: 'g-7803', quality: 'WEARABLE_FULL'}}),
          done(3, 'STRENGTH', {day: 4}, {source: {provider: 'manual', quality: 'MANUAL'}}),
          doneSameDay(3, 'RUN', {role: 'LONG'}, {source: {provider: 'garmin', activityId: 'g-7881', quality: 'WEARABLE_FULL'}}),
        ],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Duplicates from two devices for one session must be reconciled into one: double-counting would inflate volume and could trigger false over-performance or ramp alarms. Missing effort is unknown, not negative. When the duplicates disagree on duration, the full wearable source should win, or the conflict should be flagged, rather than reading the session as partial.',
      preferredCoachingBehavior: [
        `S1 (WEEKLY_REVIEW, ${W(2)}): KEEP. The long run counted once; missing effort on Tue/Thu tolerated as unknown; no over-performance or overload inference.`,
        `S2 (WEEKLY_REVIEW, ${W(3)}): KEEP. Tuesday counted once at the watch duration (or flagged as conflicting), not as a partial session and not as two sessions.`,
      ],
      acceptableAlternatives: ['A non-blocking request for perceived effort on runs where it is missing.'],
      concerns: [
        'Double-counting volume.',
        'OVER classification or load warnings caused by duplicates.',
        'ASK/blocking only because effort is missing.',
        'PARTIAL_SESSION-style adaptation driven by the phone record.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H32', S = '2027-05-03', asOf = '2027-04-30', race = dd(S, 11, 6);
  const qref = {role: ['QUALITY', 'EASY']};
  return {c: {
    caseId: cid, family: 'DATA_QUALITY', operation: 'SEQUENCE',
    scenario: `Zeca, intermediate, half marathon on ${race}. In ${W(4)} he reports the key quality run manually as done as prescribed, but his watch (battery died) uploaded a partial record showing only 22 minutes and not completed. The Saturday run of that week has not synced. On Tuesday of ${W(5)} he corrects his manual report (he actually cut the session short at 35 minutes because of time, felt fine), and at the same time the missing Saturday run arrives from the watch, three days late.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {id: 'h32-zeca', ...hmIntermediate(asOf), event: {kind: 'HALF_MARATHON', date: race}}, schedule: hmSched}),
    steps: [
      {review: rv(cid, 1, S, 4, 6, '20:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [
          done(4, 'STRENGTH', {day: 0}),
          done(4, 'RUN', qref, {eventId: 'R6-H32-Q-MANUAL', source: {provider: 'manual', quality: 'MANUAL'}}),
          {weekIndex: idx(4), sport: 'RUN', ...qref, eventId: 'R6-H32-Q-WATCH', source: {provider: 'garmin', activityId: 'g-90412', quality: 'WEARABLE_PARTIAL'}, completed: false, actualMinutes: 22, response: {...UNK}},
          done(4, 'STRENGTH', {day: 3}),
          doneSameDay(4, 'RUN', {role: 'LONG'}),
        ],
        adoptProposal: true},
      {review: rv(cid, 2, S, 5, 1, '08:00:00', 'PARTIAL_SESSION'),
        targetRef: tref(4, 'RUN', qref),
        observationFacts: [
          {weekIndex: idx(4), sport: 'RUN', ...qref, eventId: 'R6-H32-Q-CORR', correctionOf: 'R6-H32-Q-MANUAL', correctedAt: `${dd(S, 5, 1)}T07:55:00-03:00`, reportedAt: `${dd(S, 5, 1)}T07:55:00-03:00`, source: {provider: 'manual', quality: 'MANUAL'}, completed: false, actualMinutes: 35, response: {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'}},
          done(4, 'RUN', {day: 5}, {eventId: 'R6-H32-SAT-LATE', observedAt: `${dd(S, 4, 5)}T07:10:00-03:00`, reportedAt: `${dd(S, 5, 1)}T07:50:00-03:00`, source: {provider: 'garmin', activityId: 'g-90477', quality: 'WEARABLE_FULL'}}),
        ],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Contradictory reports for one session should be treated as uncertain, not resolved silently, and should not drive a progression change on their own. An explicit athlete correction supersedes the report it corrects, and the reconciled truth is a partial session (35 min, normal response) needing no make-up. Late-arriving data with a past observation time belongs to the week it happened in and should be accepted, not rejected or attached to the arrival week.',
      preferredCoachingBehavior: [
        `S1 (WEEKLY_REVIEW, ${W(4)}): KEEP with recorded uncertainty about the quality session (or ASK to clarify); no change to progression based on the 22-minute partial record.`,
        `S2 (PARTIAL_SESSION, ${W(5)}): KEEP. The correction supersedes the manual report (35 min done, compatible), the session is counted once, the late Saturday run is attached to ${W(4)}, and nothing is made up.`,
      ],
      acceptableAlternatives: ['S1: ASK about the contradictory session.'],
      concerns: [
        'S1: MODIFY/regression driven by the watch\'s partial record alone, or the session counted twice.',
        'S2: the correction ignored, three reports counted, the late record rejected because of its report time, or the remainder of the quality rescheduled.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H33', S = '2027-07-01', asOf = '2027-06-28';
  const sched = {runDays: [1, 3, 5], strengthDays: [0, 2, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 45, strengthMinutes: 50, longRunDay: 3, longRunMinutes: 75};
  const W1 = 1, W3 = 3;
  const whoop = {provider: 'whoop', quality: 'WEARABLE_PARTIAL'};
  return {c: {
    caseId: cid, family: 'DATA_QUALITY', operation: 'SEQUENCE',
    scenario: `Alice, 26, regular runner and hypertrophy trainee (UTC-03:00). Her program starts on a ${wdName(S)} (day 0 = ${wdName(S)}): runs ${dayNames(S, sched.runDays)}, long run on Sunday; strength ${dayNames(S, sched.strengthDays)} with dumbbells (she chooses the loads). Her wrist strap records exercise identity, sets and reps but no loads or effort. She does her ${W(W1)} review at 23:40 local time on the last day of the week (already the next day in UTC). Her Tuesday run started at 22:15 local (Wednesday in UTC). A strength record for Monday arrives stamped two days in the future (device clock skew). Afterwards the strap stops syncing (last sync ${dd(S, 2, 3)}); in ${W(W3)} she manually logs only her long run.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, athlete: {
      id: 'h33-alice', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'REGULAR', strength: 'HYPERTROPHY'},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 130, longestRunMinutes: 60, strengthDaysPerWeek: 3},
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'], sex: 'F',
      wearableCapabilities: {provider: 'whoop', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: true, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'PARTIAL', historyWeeks: 2},
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, W1, 6, '23:40:00', 'WEEKLY_REVIEW'),
        observationFacts: [
          done(W1, 'STRENGTH', {day: 0}, {source: whoop, response: {performance: 'UNKNOWN', recovery: 'COMPATIBLE', effort: 'UNKNOWN', nextDayFunction: 'NORMAL'}}),
          done(W1, 'RUN', {day: 1}),
          done(W1, 'STRENGTH', {day: 2}, {source: {provider: 'manual', quality: 'MANUAL'}, loadsByPattern: {SQUAT: 20, HINGE: 22, LUNGE: 12, PUSH: 16, PULL: 18}}),
          done(W1, 'RUN', {role: 'LONG'}),
          {...done(W1, 'STRENGTH', {day: 4}, {eventId: 'R6-H33-MON-SKEW', observedAt: `${dd(S, W1 + 1, 1)}T18:00:00-03:00`, reportedAt: `${dd(S, W1, 6)}T23:30:00-03:00`, source: whoop, response: {...UNK}}), _intent: 'FUTURE_TIMESTAMP'},
          done(W1, 'RUN', {day: 5}, {eventId: 'R6-H33-TUE-LATE', observedAt: `${dd(S, W1, 5)}T22:15:00-03:00`, response: {...OK}}),
        ],
        adoptProposal: true},
      {review: rv(cid, 2, S, W3, 6, '20:00:00', 'WEEKLY_REVIEW'),
        observationFacts: [done(W3, 'RUN', {role: 'LONG'}, {source: {provider: 'manual', quality: 'MANUAL'}})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Timestamps must be read in the athlete\'s local offset. The 23:40 review belongs to the last day of the week, and the 22:15 run belongs to Tuesday, even though both fall on the next UTC date. A record stamped in the future relative to the review is not trustworthy evidence of completion. Records with unknown loads and effort cannot drive load progression. A stale sync means missing data, not missed training.',
      preferredCoachingBehavior: [
        `S1 (WEEKLY_REVIEW at 23:40 local, ${W(W1)}): accepted as this week's review (local date ${dd(S, W1, 6)}). The 22:15 run attached to Tuesday ${dd(S, W1, 5)}. The strength record with unknown loads/effort counts as done but does not move loads (a request for loads/RIR is fine). The future-stamped Monday record excluded or flagged, not counted as clean completion evidence. Overall KEEP.`,
        `S2 (WEEKLY_REVIEW, ${W(W3)}, only the long run reported): KEEP with recorded uncertainty, or ASK to confirm the unreported sessions; unreported is not missed; no regression.`,
      ],
      acceptableAlternatives: ['S1: ASK about the future-dated record.'],
      concerns: [
        'S1: INVALID_INPUT or week misassignment because of the UTC date rollover; the late run attached to Wednesday.',
        'S1: the future record counted as completed evidence, or loads inferred or treated as zero.',
        'S2: MODIFY/HOLD for "non-adherence" inferred from missing sync.',
      ],
    },
  }, meta: {intentional: ['FUTURE_TIMESTAMP']}};
});

// =============================== ATHLETE LEARNING ===============================

add(() => {
  const cid = 'R6-H34', S = '2027-03-01', asOf = '2027-02-26', race = dd(S, 15, 5);
  const sched = {runDays: [1, 3, 5], strengthDays: [0, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 45, longRunDay: 5, longRunMinutes: 140};
  const adverse = {performance: 'COMPATIBLE', recovery: 'ADVERSE', effort: 'ON_TARGET', nextDayFunction: 'IMPAIRED'};
  const week = (k) => [done(k, 'STRENGTH', {day: 0}), done(k, 'RUN', {day: 1}), done(k, 'RUN', {day: 3}), done(k, 'STRENGTH', {day: 3}), done(k, 'RUN', {role: 'LONG'}, {response: adverse})];
  return {c: {
    caseId: cid, family: 'ATHLETE_LEARNING', operation: 'SEQUENCE',
    scenario: `Caio, 45, intermediate, half marathon on ${race} (a Saturday, 16 weeks), consents to learning. Runs Tue/Thu/Sat with the Saturday long run, strength Mon/Thu. Each Saturday long run is completed as prescribed at the right effort, but every Sunday he is wrecked (poor recovery, impaired normal function), while all other sessions are fine. The pattern repeats in ${W(1)}, ${W(2)} and ${W(3)}. No pain.`,
    intake: mkIntake({asOf, startDate: S, weeks: 16, tz: -180, learningConsent: true, athlete: {
      id: 'h34-caio', ...hmIntermediate(asOf, {ageEligible: undefined, ageYears: 45}),
      event: {kind: 'HALF_MARATHON', date: race}, sex: 'M',
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 1, 6, '19:00:00', 'WEEKLY_REVIEW', {learningConsent: true}), observationFacts: week(1), adoptProposal: true},
      {review: rv(cid, 2, S, 2, 6, '19:00:00', 'WEEKLY_REVIEW', {learningConsent: true}), observationFacts: week(2), adoptProposal: true},
      {review: rv(cid, 3, S, 3, 6, '19:00:00', 'WEEKLY_REVIEW', {learningConsent: true}), observationFacts: week(3), adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'One hard recovery after a long run is unremarkable. The same disproportionate next-day impairment after every long run, with everything else normal, is an athlete-specific response (age, fuelling, long-run duration) that should change future decisions: slower long-run growth and protected recovery after it, recorded as learned with consent. It is not clinical without pain flags, and it does not justify cutting everything.',
      preferredCoachingBehavior: [
        `S1 (${W(1)}): KEEP, single instance (monitoring note at most).`,
        `S2 (${W(2)}): KEEP with monitoring, or a MODIFY holding the next long-run duration.`,
        `S3 (${W(3)}): MODIFY. Long-run progression held or slowed (repeat durations, smaller increments, possibly a lower peak), the day after the long run kept as rest, Monday lower-body strength kept light; the athlete-specific pattern recorded as learned (consent given). A question about fuelling, hydration or sleep on long-run days is a good addition.`,
      ],
      acceptableAlternatives: ['S3: ASK about fuelling/sleep together with a protective change to the long-run progression.'],
      concerns: [
        'Default long-run progression continued after three identical responses.',
        'A deload of everything (quality, strength) for a long-run-specific pattern.',
        'Clinical routing with no pain or clinical flags.',
      ],
    },
  }, meta: {}};
});

add(() => {
  const cid = 'R6-H35', S = '2027-04-05', asOf = '2027-04-02', race = dd(S, 11, 6);
  const sched = {runDays: [1, 3, 6], strengthDays: [0, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 40, longRunDay: 6, longRunMinutes: 100};
  const Q = {role: ['QUALITY']};
  return {c: {
    caseId: cid, family: 'ATHLETE_LEARNING', operation: 'SEQUENCE',
    scenario: `Dani, intermediate, 10K on ${race}, consents to learning. In ${W(4)} one quality session feels unusually easy (over target). In ${W(5)} the quality session is under target and much harder, on a 34 °C afternoon (marked confounded and not comparable). In ${W(6)} everything is as planned, and an easy run feels easier than expected, as easy runs should.`,
    intake: mkIntake({asOf, startDate: S, weeks: 12, tz: -180, learningConsent: true, athlete: {
      id: 'h35-dani', ageEligible: true, eligibility: eligOK(asOf),
      goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: '10K', date: race},
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2},
      performanceAnchors: [{kind: 'RACE', distance: '10K', minutes: 47, date: '2027-02-21'}],
      knownExercises: [kx('goblet-squat', 3, 10, 22, 'TOTAL', 2, '2027-03-29'), kx('db-rdl', 3, 10, 18, 'PER_HAND', 2, '2027-03-29'), kx('db-row', 3, 10, 18, 'PER_HAND', 2, '2027-03-26')],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'], wearableCapabilities: garminFull(10),
    }, schedule: sched}),
    steps: [
      {review: rv(cid, 1, S, 4, 6, '19:00:00', 'WEEKLY_REVIEW', {learningConsent: true}),
        observationFacts: [done(4, 'STRENGTH', {day: 0}), done(4, 'RUN', Q, {response: {performance: 'OVER', recovery: 'COMPATIBLE', effort: 'EASIER', nextDayFunction: 'NORMAL'}}), done(4, 'STRENGTH', {day: 4}), doneSameDay(4, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 2, S, 5, 6, '19:00:00', 'WEEKLY_REVIEW', {learningConsent: true}),
        observationFacts: [done(5, 'STRENGTH', {day: 0}), done(5, 'RUN', Q, {confounded: true, comparable: false, response: {performance: 'UNDER', recovery: 'COMPATIBLE', effort: 'HARDER', nextDayFunction: 'NORMAL'}}), done(5, 'STRENGTH', {day: 4}), doneSameDay(5, 'RUN', {role: 'LONG'})],
        adoptProposal: true},
      {review: rv(cid, 3, S, 6, 6, '19:00:00', 'WEEKLY_REVIEW', {learningConsent: true}),
        observationFacts: [done(6, 'STRENGTH', {day: 0}), done(6, 'RUN', Q), done(6, 'STRENGTH', {day: 4}), doneSameDay(6, 'RUN', {role: 'LONG'}, {response: {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'EASIER', nextDayFunction: 'UNKNOWN'}})],
        adoptProposal: true},
    ],
    independentAssessment: {
      rationale: 'Single good or bad days are noise. A confounded, non-comparable session (heat) carries almost no information about fitness. An easy run feeling easy is correct execution. None of this should change prescriptions or be stored as an athlete-specific pattern.',
      preferredCoachingBehavior: [
        `S1 (${W(4)}): KEEP; no intensity increase from one great session.`,
        `S2 (${W(5)}): KEEP; the confounded hot-day session excluded from learning and progression decisions.`,
        `S3 (${W(6)}): KEEP; no learned change recorded from this sequence.`,
      ],
      acceptableAlternatives: ['A brief "monitor" note in S1 or S2.'],
      concerns: [
        'MODIFY increasing intensity after one OVER session.',
        'Reducing load after the confounded UNDER session.',
        'An athlete-specific pattern learned from noise or confounded data.',
        'Making easy runs harder because they feel easy.',
      ],
    },
  }, meta: {}};
});

// ---------------------------------------------------------------- validation
const LIB = {
  'back-squat': ['SQUAT', ['BARBELL', 'RACK']], 'goblet-squat': ['SQUAT', ['DUMBBELLS']], 'kb-goblet-squat': ['SQUAT', ['KETTLEBELL']], 'leg-press': ['SQUAT', ['MACHINES']], 'box-squat-bodyweight': ['SQUAT', ['BODYWEIGHT']], 'sit-to-stand': ['SQUAT', ['BODYWEIGHT']],
  'barbell-rdl': ['HINGE', ['BARBELL']], 'db-rdl': ['HINGE', ['DUMBBELLS']], 'kb-deadlift': ['HINGE', ['KETTLEBELL']], 'hip-thrust-db': ['HINGE', ['DUMBBELLS', 'BENCH']], 'glute-bridge': ['HINGE', ['BODYWEIGHT']], 'hip-hinge-practice': ['HINGE', ['BODYWEIGHT']],
  'db-split-squat': ['LUNGE', ['DUMBBELLS']], 'db-step-up': ['LUNGE', ['DUMBBELLS', 'BENCH']], 'reverse-lunge': ['LUNGE', ['BODYWEIGHT']], 'split-squat-bodyweight': ['LUNGE', ['BODYWEIGHT']],
  'standing-calf-raise': ['CALF', ['BODYWEIGHT']], 'db-calf-raise': ['CALF', ['DUMBBELLS']], 'supported-calf-raise': ['CALF', ['BODYWEIGHT']],
  'bench-press': ['PUSH', ['BARBELL', 'BENCH', 'RACK']], 'db-bench-press': ['PUSH', ['DUMBBELLS', 'BENCH']], 'db-floor-press': ['PUSH', ['DUMBBELLS']], 'machine-chest-press': ['PUSH', ['MACHINES']], 'push-up': ['PUSH', ['BODYWEIGHT']], 'incline-push-up': ['PUSH', ['BODYWEIGHT']], 'wall-pushup': ['PUSH', ['BODYWEIGHT']], 'db-overhead-press': ['PUSH', ['DUMBBELLS']],
  'one-arm-db-row': ['PULL', ['DUMBBELLS', 'BENCH']], 'db-row': ['PULL', ['DUMBBELLS']], 'barbell-row': ['PULL', ['BARBELL']], 'lat-pulldown': ['PULL', ['MACHINES']], 'seated-cable-row': ['PULL', ['MACHINES']], 'pull-up': ['PULL', ['PULL_UP_BAR']], 'band-row': ['PULL', ['BANDS']], 'prone-row-practice': ['PULL', ['BODYWEIGHT']],
  'dead-bug': ['TRUNK', ['BODYWEIGHT']], 'dead-bug-practice': ['TRUNK', ['BODYWEIGHT']], 'side-plank': ['TRUNK', ['BODYWEIGHT']], 'pallof-press': ['TRUNK', ['BANDS']],
};
const EQUIP = new Set(['BODYWEIGHT', 'DUMBBELLS', 'BARBELL', 'RACK', 'BENCH', 'KETTLEBELL', 'MACHINES', 'BANDS', 'PULL_UP_BAR']);
const EXP = new Set(['NONE', 'NOVICE', 'INTERMEDIATE', 'EXPERIENCED']);
const RUN_GOALS = new Set(['RACE', 'PERFORMANCE', 'REGULAR', 'GENERAL', 'NONE']);
const STR_GOALS = new Set(['STRENGTH', 'HYPERTROPHY', 'RUNNING_SUPPORT', 'MAINTAIN', 'GENERAL', 'NONE']);
const RUN_FAMILIES = new Set(['EASY', 'LONG', 'THRESHOLD', 'TEN_K_SPECIFIC', 'HALF_MARATHON_SPECIFIC']);
const EVENT_KINDS = new Set(['WEEKLY_REVIEW', 'MISSED_SESSION', 'PARTIAL_SESSION', 'UNDERPERFORMANCE', 'OVERPERFORMANCE', 'PROGRESSION_NOT_TOLERATED', 'PROGRESSION_TOO_EASY', 'LOCAL_FATIGUE', 'SYSTEMIC_FATIGUE', 'SCHEDULE_CHANGE', 'UNAVAILABLE_DAY', 'DOUBLE_CONFLICT', 'EQUIPMENT_CHANGE', 'GOAL_CHANGE', 'EVENT_DATE_CHANGE', 'RETURN_AFTER_PAUSE', 'EVENT_WEEK_CONFLICT', 'RECOVERED']);
const REASONS = new Set(['TRAVEL', 'WORK', 'FAMILY', 'SCHEDULE', 'VACATION', 'WEATHER', 'EQUIPMENT', 'MOTIVATION', 'STUDY', 'MOVING', 'OTHER_NONCLINICAL', 'ILLNESS', 'INJURY', 'PAIN', 'MEDICAL', 'SURGERY', 'PREGNANCY', 'POSTPARTUM', 'CLINICAL']);
const RUN_ROLES = new Set(['EASY', 'LONG', 'QUALITY', 'WALK_JOG', 'WALK', 'RACE', 'RACE_TOUCH', 'SHAKEOUT', 'RECOVERY_EASY', 'REST_BY_DESIGN']);
const PATTERNS = new Set(['SQUAT', 'HINGE', 'LUNGE', 'CALF', 'PUSH', 'PULL', 'TRUNK']);
const RESP = {performance: new Set(['COMPATIBLE', 'UNDER', 'OVER', 'UNKNOWN']), recovery: new Set(['COMPATIBLE', 'ADVERSE', 'UNKNOWN']), effort: new Set(['ON_TARGET', 'EASIER', 'HARDER', 'UNKNOWN']), nextDayFunction: new Set(['NORMAL', 'IMPAIRED', 'UNKNOWN'])};
const QUAL = new Set(['WEARABLE_FULL', 'WEARABLE_PARTIAL', 'MANUAL']);
const ELIG_BOOLS = ['pain', 'persistentPain', 'injury', 'illness', 'functionalLimitation', 'clinicalConcern'];

const KEYS = {
  case: ['caseId', 'family', 'scenario', 'operation', 'intake', 'steps', 'independentAssessment'],
  assessment: ['rationale', 'preferredCoachingBehavior', 'acceptableAlternatives', 'concerns'],
  intake: ['version', 'synthetic', 'purpose', 'asOf', 'startDate', 'weeks', 'learningConsent', 'timezoneOffsetMinutes', 'athlete', 'schedule', 'history'],
  athlete: ['id', 'ageEligible', 'ageYears', 'eligibility', 'goals', 'event', 'runExperience', 'strengthExperience', 'recent', 'performanceAnchors', 'knownRuns', 'knownExercises', 'equipment', 'strengthPreferences', 'sex', 'heightCm', 'weightKg', 'specialPopulation', 'wearableCapabilities', 'pause'],
  eligibility: ['status', 'assessedAt', ...ELIG_BOOLS],
  schedule: ['runDays', 'strengthDays', 'runTurn', 'strengthTurn', 'runMinutes', 'strengthMinutes', 'longRunDay', 'longRunMinutes', 'sameTurnConfirmed', 'temporaryPreference'],
  recent: ['runDaysPerWeek', 'runMinutesPerWeek', 'longestRunMinutes', 'strengthDaysPerWeek'],
  wearable: ['provider', 'activityAvailable', 'heartRateAvailable', 'exerciseIdentityAvailable', 'setsRepsLoadAvailable', 'subjectiveEffortAvailable', 'completeness', 'historyWeeks'],
  pause: ['nonclinical', 'weeks', 'reasonCategory', 'reason'],
  knownRun: ['prescription', 'current', 'familiar', 'tolerated', 'observedAt'],
  runRx: ['modality', 'family', 'durationMinutes', 'warmupMinutes', 'cooldownMinutes', 'work', 'effort'],
  knownEx: ['id', 'sets', 'reps', 'load', 'rir', 'current', 'familiar', 'tolerated', 'observedAt'],
  history: ['activityId', 'provider', 'sport', 'startedAt', 'durationMinutes', 'completeness', 'exercises'],
  step: ['review', 'observationFacts', 'targetRef', 'adoptProposal'],
  review: ['version', 'synthetic', 'purpose', 'asOf', 'weekIndex', 'event', 'eligibility', 'observations', 'targetSessionId', 'learningConsent', 'changes', 'interruption', 'currentDemonstration', 'signals'],
  changes: ['runDays', 'strengthDays', 'runTurn', 'strengthTurn', 'runMinutes', 'strengthMinutes', 'longRunDay', 'longRunMinutes', 'sameTurnConfirmed', 'temporaryPreference', 'unavailableDates', 'equipment', 'from', 'to', 'eventDate', 'event', 'goals'],
  interruption: ['days', 'startDate', 'endDate', 'reasonCategory', 'reason', 'nonclinical', 'clinicalReason'],
  demo: ['observedAt', 'sport', 'family', 'minutes', 'completed', 'effort', 'response', 'ordinaryFunction', 'nextDayFunction'],
  fact: ['weekIndex', 'sport', 'role', 'day', 'completed', 'actualMinutes', 'actualStimulus', 'loadsByPattern', 'exercises', 'response', 'observedAt', 'occurrenceDate', 'source', 'eventId', 'correctionOf', 'correctedAt', 'reportedAt', 'comparable', 'confounded', '_intent'],
  targetRef: ['weekIndex', 'sport', 'role', 'day'],
  source: ['provider', 'activityId', 'quality'],
};
const checkKeys = (where, obj, kind) => {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) { fail(where, `${kind} must be an object`); return; }
  for (const k of Object.keys(obj)) if (!KEYS[kind].includes(k)) fail(where, `unexpected ${kind} key "${k}"`);
  for (const [k, v] of Object.entries(obj)) if (v === undefined) fail(where, `${kind}.${k} is undefined`);
};
const isDay = (d) => Number.isInteger(d) && d >= 0 && d <= 6;

function validate({c, meta}) {
  const cid = c.caseId;
  const allow = new Set(meta.intentional ?? []);
  checkKeys(cid, c, 'case');
  checkKeys(`${cid}.assessment`, c.independentAssessment, 'assessment');
  for (const k of KEYS.assessment) {
    const v = c.independentAssessment?.[k];
    if (v == null || (Array.isArray(v) ? v.length === 0 : String(v).trim().length < 20)) fail(cid, `assessment.${k} is empty or too thin`);
  }
  if (!['GENERATE', 'SEQUENCE'].includes(c.operation)) fail(cid, 'bad operation');
  if (c.operation === 'GENERATE' && c.steps) fail(cid, 'GENERATE case must not have steps');
  if (c.operation === 'SEQUENCE' && !(c.steps?.length > 0)) fail(cid, 'SEQUENCE case needs steps');

  const it = c.intake;
  checkKeys(`${cid}.intake`, it, 'intake');
  if (it.version !== 'R6-INTAKE-1' || it.synthetic !== true || it.purpose !== 'SHADOW_REFERENCE') fail(cid, 'intake header');
  if (![4, 8, 12, 16].includes(it.weeks)) fail(cid, 'weeks');
  toDate(it.asOf); toDate(it.startDate);
  if (it.asOf > it.startDate) fail(cid, 'intake asOf after startDate');
  if (it.timezoneOffsetMinutes !== undefined && !Number.isInteger(it.timezoneOffsetMinutes)) fail(cid, 'tz offset');
  const lastDay = addDays(it.startDate, it.weeks * 7 - 1);

  const a = it.athlete;
  checkKeys(`${cid}.athlete`, a, 'athlete');
  if (!(a.ageEligible === true || Number.isInteger(a.ageYears))) fail(cid, 'age');
  if (Number.isInteger(a.ageYears) && a.ageYears < 18) fail(cid, 'adult only');
  checkKeys(`${cid}.eligibility`, a.eligibility, 'eligibility');
  if (a.eligibility.assessedAt !== it.asOf) fail(cid, 'eligibility.assessedAt should be the onboarding date');
  if (a.eligibility.status === 'NONCLINICAL_CONFIRMED') for (const b of ELIG_BOOLS) if (typeof a.eligibility[b] !== 'boolean') fail(cid, `eligibility.${b} missing`);
  if (!RUN_GOALS.has(a.goals?.run) || !STR_GOALS.has(a.goals?.strength)) fail(cid, 'goals');
  if (a.goals.run === 'RACE' && !a.event) fail(cid, 'RACE goal without event');
  if (a.event) {
    if (!['10K', 'HALF_MARATHON'].includes(a.event.kind) && !allow.has('EVENT_KIND')) fail(cid, `event kind ${a.event.kind}`);
    toDate(a.event.date);
    if (a.event.date < it.startDate || a.event.date > lastDay) fail(cid, `event ${a.event.date} outside horizon ${it.startDate}..${lastDay}`);
  }
  for (const k of ['runExperience', 'strengthExperience']) if (a[k] !== undefined && !EXP.has(a[k])) fail(cid, k);
  if (a.recent) checkKeys(`${cid}.recent`, a.recent, 'recent');
  if (a.wearableCapabilities) { checkKeys(`${cid}.wearable`, a.wearableCapabilities, 'wearable'); if (!['NONE', 'PARTIAL', 'FULL'].includes(a.wearableCapabilities.completeness)) fail(cid, 'wearable completeness'); }
  if (a.pause) { checkKeys(`${cid}.pause`, a.pause, 'pause'); if (a.pause.reasonCategory && !REASONS.has(a.pause.reasonCategory)) fail(cid, 'pause reason'); }
  const equip = new Set(a.equipment ?? []);
  for (const e of equip) if (!EQUIP.has(e)) fail(cid, `equipment ${e}`);
  for (const r of a.knownRuns ?? []) {
    checkKeys(`${cid}.knownRun`, r, 'knownRun'); checkKeys(`${cid}.knownRun.rx`, r.prescription, 'runRx');
    if (r.prescription.modality !== 'RUN' || !RUN_FAMILIES.has(r.prescription.family)) fail(cid, 'known run family');
    if (r.observedAt > it.asOf) fail(cid, `known run observed after onboarding ${r.observedAt}`);
    const w = r.prescription.work;
    if (w) {
      if (r.prescription.family === 'EASY' || r.prescription.family === 'LONG') fail(cid, 'work block on easy/long family');
      const min = (r.prescription.warmupMinutes ?? 0) + (r.prescription.cooldownMinutes ?? 0) + w.repetitions * w.workMinutes + (w.repetitions - 1) * w.recoveryMinutes;
      const max = min + w.recoveryMinutes;
      if (r.prescription.durationMinutes < min || r.prescription.durationMinutes > max) fail(cid, `known run duration ${r.prescription.durationMinutes} not in [${min},${max}]`);
    }
  }
  for (const x of a.knownExercises ?? []) {
    checkKeys(`${cid}.knownEx`, x, 'knownEx');
    if (!LIB[x.id]) fail(cid, `known exercise ${x.id} not in library`);
    else if (x.current) for (const e of LIB[x.id][1]) if (!equip.has(e)) fail(cid, `current exercise ${x.id} needs ${e}`);
    if (x.load && (x.load.unit !== 'KG' || !['TOTAL', 'PER_HAND'].includes(x.load.convention))) fail(cid, 'load shape');
    if (x.observedAt > it.asOf) fail(cid, 'known exercise observed after onboarding');
  }
  const sc = it.schedule;
  checkKeys(`${cid}.schedule`, sc, 'schedule');
  for (const k of ['runDays', 'strengthDays']) {
    if (!Array.isArray(sc[k]) || !sc[k].every(isDay) || new Set(sc[k]).size !== sc[k].length) fail(cid, `schedule.${k}`);
  }
  if (sc.longRunDay !== undefined && !sc.runDays.includes(sc.longRunDay) && !allow.has('LONG_RUN_DAY_NOT_RUN_DAY')) fail(cid, 'longRunDay not a run day');
  if (allow.has('LONG_RUN_DAY_NOT_RUN_DAY') && sc.runDays.includes(sc.longRunDay)) fail(cid, 'intentional contradiction missing');
  if (a.event && (it.weeks * 7 - 1) < diffDays(it.startDate, a.event.date)) fail(cid, 'event beyond horizon');
  for (const h of it.history ?? []) {
    checkKeys(`${cid}.history`, h, 'history');
    const ld = localDateOf(h.startedAt);
    if (!ld) fail(cid, `history startedAt needs offset ${h.startedAt}`);
    else if (ld > it.asOf) fail(cid, `history after onboarding ${h.startedAt}`);
    for (const e of h.exercises ?? []) if (!LIB[e.id] && !allow.has('OUT_OF_LIBRARY_HISTORY')) fail(cid, `history exercise ${e.id}`);
  }

  // ---- steps
  const schedules = [{from: it.startDate, runDays: sc.runDays, strengthDays: sc.strengthDays, longRunDay: sc.longRunDay}];
  const daysFor = (k, sport) => {
    const ws = addDays(it.startDate, 7 * k);
    let cur = schedules[0];
    for (const s of schedules) if (s.from <= ws) cur = s;
    return {days: sport === 'RUN' ? cur.runDays : cur.strengthDays, longRunDay: cur.longRunDay};
  };
  let prev = null;
  const ids = new Set();
  const reviewIds = new Set();
  (c.steps ?? []).forEach((st, i) => {
    const where = `${cid}.S${i + 1}`;
    checkKeys(where, st, 'step');
    if (typeof st.adoptProposal !== 'boolean') fail(where, 'adoptProposal must be boolean');
    const r = st.review;
    checkKeys(where, r, 'review');
    if (r.version !== 'R6-REVIEW-1' || r.synthetic !== true || r.purpose !== 'SHADOW_REFERENCE') fail(where, 'review header');
    const ld = localDateOf(r.asOf);
    if (!ld) { fail(where, `asOf needs a timezone: ${r.asOf}`); return; }
    const k = r.weekIndex - WEEK_BASE;
    if (!Number.isInteger(k) || k < 0 || k >= it.weeks) fail(where, `weekIndex ${r.weekIndex} out of range`);
    const ws = addDays(it.startDate, 7 * k), we = addDays(ws, 6);
    if (ld < ws || ld > we) fail(where, `asOf local date ${ld} not in week ${r.weekIndex} (${ws}..${we})`);
    if (prev && instant(r.asOf) < instant(prev)) fail(where, 'asOf earlier than previous step');
    if (!EVENT_KINDS.has(r.event?.kind)) fail(where, `event kind ${r.event?.kind}`);
    if (reviewIds.has(r.event.id)) fail(where, 'duplicate review event id'); reviewIds.add(r.event.id);
    checkKeys(where, r.eligibility, 'eligibility');
    if (r.eligibility.assessedAt !== ld) fail(where, 'review eligibility.assessedAt should be the review date');
    if (r.event.kind === 'WEEKLY_REVIEW') {
      const lastSessionDay = Math.max(...daysFor(k, 'RUN').days, ...daysFor(k, 'STRENGTH').days);
      if (diffDays(ws, ld) < lastSessionDay) fail(where, 'weekly review before the week\'s last session day');
    }
    if (r.changes) {
      checkKeys(where, r.changes, 'changes');
      for (const d of r.changes.unavailableDates ?? []) { toDate(d); if (d < ld) fail(where, 'unavailable date in the past'); }
      if (r.changes.equipment) for (const e of r.changes.equipment) if (!EQUIP.has(e)) fail(where, 'changes.equipment');
      if (r.changes.from) toDate(r.changes.from);
      if (r.changes.to) { toDate(r.changes.to); if (r.changes.to < r.changes.from) fail(where, 'changes to < from'); }
      if (r.changes.eventDate) { toDate(r.changes.eventDate); if (r.changes.eventDate > lastDay || r.changes.eventDate < ld) fail(where, 'new event date outside the remaining horizon'); }
      if (r.changes.event) { if (!['10K', 'HALF_MARATHON'].includes(r.changes.event.kind)) fail(where, 'changes.event kind'); if (r.changes.event.date > lastDay) fail(where, 'changes.event date beyond horizon'); }
      if (r.changes.goals && (!RUN_GOALS.has(r.changes.goals.run) || !STR_GOALS.has(r.changes.goals.strength))) fail(where, 'changes.goals');
      if (r.changes.runDays || r.changes.strengthDays || r.changes.longRunDay !== undefined) {
        const cur = schedules[schedules.length - 1];
        const nx = {from: r.changes.from ?? ld, runDays: r.changes.runDays ?? cur.runDays, strengthDays: r.changes.strengthDays ?? cur.strengthDays, longRunDay: r.changes.longRunDay ?? cur.longRunDay};
        if (!nx.runDays.includes(nx.longRunDay)) fail(where, 'new long run day not a run day');
        if (nx.from <= ld) fail(where, 'schedule change should take effect after the review');
        schedules.push(nx);
      }
    }
    if (r.interruption) {
      checkKeys(where, r.interruption, 'interruption');
      const x = r.interruption;
      if (x.reasonCategory && !REASONS.has(x.reasonCategory)) fail(where, 'reason category');
      if (x.startDate && x.endDate) {
        if (x.endDate < x.startDate) fail(where, 'interruption end < start');
        if (x.days !== undefined && x.days !== diffDays(x.startDate, x.endDate) + 1) fail(where, 'interruption days mismatch');
        if (x.endDate >= ld) fail(where, 'interruption must have ended before the return review');
      }
    }
    if (r.currentDemonstration) {
      checkKeys(where, r.currentDemonstration, 'demo');
      if (instant(r.currentDemonstration.observedAt) > instant(r.asOf)) fail(where, 'demonstration in the future');
    }
    const checkRef = (ref, label, isFact) => {
      const fk = ref.weekIndex - WEEK_BASE;
      if (!Number.isInteger(fk) || fk < 0 || fk >= it.weeks) { fail(where, `${label} week out of range`); return null; }
      if (!['RUN', 'STRENGTH'].includes(ref.sport)) fail(where, `${label} sport`);
      if (ref.role !== undefined) {
        const roles = Array.isArray(ref.role) ? ref.role : [ref.role];
        for (const ro of roles) if (ref.sport === 'RUN' ? !RUN_ROLES.has(ro) : !String(ro).startsWith('STRENGTH_')) fail(where, `${label} role ${ro}`);
      }
      const {days, longRunDay} = daysFor(fk, ref.sport);
      let sessionDate = null;
      if (ref.day !== undefined) {
        if (!days.includes(ref.day)) fail(where, `${label} day ${ref.day} is not one of the athlete's ${ref.sport} days in week ${ref.weekIndex}`);
        sessionDate = addDays(it.startDate, 7 * fk + ref.day);
      } else if (ref.role === 'LONG' && longRunDay !== undefined) {
        sessionDate = addDays(it.startDate, 7 * fk + longRunDay);
      }
      if (isFact && sessionDate && sessionDate > ld) fail(where, `${label} refers to a future session ${sessionDate}`);
      if (isFact && fk > k) fail(where, `${label} in a later week than the review`);
      return sessionDate;
    };
    if (st.targetRef) { checkKeys(where, st.targetRef, 'targetRef'); checkRef(st.targetRef, 'targetRef', false); }
    const factKeys = new Set();
    for (const f of st.observationFacts ?? []) {
      checkKeys(where, f, 'fact');
      const sd = checkRef(f, `fact(${f.sport} ${JSON.stringify(f.day ?? f.role)})`, true);
      if (typeof f.completed !== 'boolean') fail(where, 'fact.completed');
      if (f.completed && !f.actualStimulus && f.actualMinutes === undefined && !f.exercises) fail(where, 'completed fact without stimulus/minutes');
      if (f.actualStimulus !== undefined && f.actualStimulus !== 'AS_PRESCRIBED') fail(where, 'actualStimulus');
      if (f.loadsByPattern) for (const p of Object.keys(f.loadsByPattern)) if (!PATTERNS.has(p)) fail(where, `loadsByPattern ${p}`);
      for (const [rk, rv2] of Object.entries(f.response ?? {})) if (!RESP[rk]?.has(rv2)) fail(where, `response.${rk}=${rv2}`);
      for (const rk of ['performance', 'recovery', 'effort']) if (!f.response?.[rk]) fail(where, `response.${rk} missing`);
      if (f.source) { checkKeys(where, f.source, 'source'); if (f.source.quality && !QUAL.has(f.source.quality)) fail(where, 'source quality'); }
      if (f.observedAt) {
        const od = localDateOf(f.observedAt);
        if (!od) fail(where, 'observedAt needs offset');
        else {
          const future = instant(f.observedAt) > instant(r.asOf);
          if (future && f._intent !== 'FUTURE_TIMESTAMP') fail(where, `observedAt in the future ${f.observedAt}`);
          if (!future && f._intent === 'FUTURE_TIMESTAMP') fail(where, 'intended future timestamp is not in the future');
          if (sd && od !== sd && f._intent !== 'FUTURE_TIMESTAMP') fail(where, `observedAt ${od} != session date ${sd}`);
        }
      }
      if (f.reportedAt && instant(f.reportedAt) > instant(r.asOf)) fail(where, 'reportedAt after review asOf');
      if (f.correctedAt && instant(f.correctedAt) > instant(r.asOf)) fail(where, 'correctedAt after review asOf');
      if (f.eventId) { if (ids.has(f.eventId)) fail(where, `duplicate eventId ${f.eventId}`); ids.add(f.eventId); }
      if (f.correctionOf && !ids.has(f.correctionOf)) fail(where, `correctionOf unknown ${f.correctionOf}`);
      const key = `${f.weekIndex}|${f.sport}|${JSON.stringify(f.day ?? null)}|${JSON.stringify(f.role ?? null)}`;
      if (factKeys.has(key) && !f.eventId) fail(where, `two facts for the same reference without explicit eventId: ${key}`);
      factKeys.add(key);
    }
    prev = r.asOf;
  });
  if (meta.intentional?.includes('FUTURE_TIMESTAMP') && !JSON.stringify(c).includes('FUTURE_TIMESTAMP')) fail(cid, 'intended future timestamp missing');
}

// drop undefined values (from "ageEligible: undefined" style overrides); keep builder annotations
const clean = (v) => Array.isArray(v) ? v.map(clean) : (v && typeof v === 'object')
  ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, clean(x)])) : v;
// strip builder-only annotations (keys starting with "_") for the written corpus
const strip = (v) => Array.isArray(v) ? v.map(strip) : (v && typeof v === 'object')
  ? Object.fromEntries(Object.entries(v).filter(([k, x]) => !k.startsWith('_') && x !== undefined).map(([k, x]) => [k, strip(x)])) : v;

// ---------------------------------------------------------------- build
function build() {
  const built = CASES.map((fn) => fn()).map(({c, meta}) => ({c: clean(c), meta}));
  for (const b of built) validate(b);
  const ids = built.map(({c}) => c.caseId);
  if (new Set(ids).size !== ids.length) fail('corpus', 'duplicate caseId');
  ids.forEach((id, i) => { if (id !== `R6-H${String(i + 1).padStart(2, '0')}`) fail('corpus', `caseId order ${id}`); });
  const out = built.map(({c}) => strip(c));
  if (JSON.stringify(out).includes('"_')) fail('corpus', 'builder annotation leaked');
  return {revision: REVISION, cases: out};
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const corpus = build();
const text = `${JSON.stringify(corpus, null, 2)}\n`;
const bytes = Buffer.from(text, 'utf8');
if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
// summary
const fam = {};
for (const c of corpus.cases) fam[c.family] = (fam[c.family] ?? 0) + 1;
const steps = corpus.cases.reduce((n, c) => n + (c.steps?.length ?? 0), 0);

const mode = process.argv[2];
if (mode === '--check') {
  console.log(JSON.stringify({ok: true, cases: corpus.cases.length, steps, families: fam, bytes: bytes.length, sha256: sha256(bytes)}, null, 2));
} else if (mode === '--seal') {
  const authorStartedAt = process.argv[3];
  if (!authorStartedAt || Number.isNaN(Date.parse(authorStartedAt))) { console.error('usage: --seal <authorStartedAt ISO>'); process.exit(2); }
  if (!existsSync(CORPUS_PATH)) { console.error('corpus missing'); process.exit(2); }
  const onDisk = readFileSync(CORPUS_PATH);
  if (!onDisk.equals(bytes)) { console.error('corpus on disk differs from the deterministic rebuild; refusing to seal'); process.exit(3); }
  const freezeBytes = readFileSync(FREEZE_PATH);
  const freeze = JSON.parse(freezeBytes.toString('utf8'));
  const ifaceBytes = readFileSync(INTERFACE_PATH);
  const ifaceSha = sha256(ifaceBytes);
  const ifaceEntry = (freeze.entries ?? []).find((e) => e.path === 'CoachingCore/r6/holdout/INTERFACE_ONLY.md');
  const sealedAt = new Date().toISOString();
  if (!(Date.parse(authorStartedAt) > Date.parse(freeze.frozenAt))) { console.error('authorStartedAt must be after frozenAt'); process.exit(4); }
  if (!(Date.parse(sealedAt) > Date.parse(authorStartedAt))) { console.error('sealedAt must be after authorStartedAt'); process.exit(4); }
  const builderBytes = readFileSync(fileURLToPath(import.meta.url));
  const manifest = {
    revision: REVISION,
    author: 'Independent R6 holdout author (Claude Opus 5.5 general-purpose subagent acting as an independent hybrid running/strength coach); not the runtime author',
    authorStartedAt,
    sealedAt,
    freezeRevision: freeze.revision,
    freezeFrozenAt: freeze.frozenAt,
    freezeDigest: freeze.sourceDigest,
    corpusPath: 'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json',
    corpusSha256: sha256(bytes),
    hashMode: 'SHA-256 over the exact corpus file bytes (UTF-8, LF line endings, 2-space JSON, trailing newline)',
    bytes: bytes.length,
    cases: corpus.cases.length,
    steps,
    families: fam,
    builderPath: 'CoachingCore/r6/holdout/build-independent-holdout.mjs',
    builderSha256: sha256(builderBytes),
    representationClarifications: [
      {
        topic: 'week index base',
        question: 'INTERFACE_ONLY.md does not state whether week index / review weekIndex / targetRef.weekIndex / observationFacts[].weekIndex are 0-based or 1-based.',
        askedOf: 'coordinator (main)',
        answer: 'Week indices are 0-based: the first program week is weekIndex 0 and starts on the intake startDate; week i starts at startDate + 7*i days. Applies to week index, review weekIndex, targetRef.weekIndex and observationFacts[].weekIndex, like day 0-6.',
        receivedBeforeSeal: true,
        appliedAs: 'WEEK_BASE = 0 in the builder; the scenario/assessment texts cite both "week index N" and "program week N+1".',
        interfaceFileChanged: false,
      },
    ],
    engineImplementationByAuthor: false,
    runtimeInspectedBeforeSeal: false,
    outputsInspectedBeforeSeal: false,
    runtimeImportedOrExecutedByAuthor: false,
    developmentFixturesInspected: false,
    earlierHoldoutsInspected: false,
    assessmentsAuthoredBeforeRuntimeOutput: true,
    firstEvaluationExecutedByAuthor: false,
    inspectedFiles: [
      {path: 'CoachingCore/r6/holdout/INTERFACE_ONLY.md', scope: 'read in full (the public interface)', sha256: ifaceSha, matchesFreezeEntry: ifaceEntry ? ifaceEntry.sha256 === ifaceSha : null},
      {path: 'CoachingCore/r6/RUNTIME_FREEZE_R6.json', scope: 'metadata only (revision, frozenAt, sourceDigest; the INTERFACE_ONLY.md entry hash for comparison); no listed file was opened', sha256: sha256(freezeBytes)},
    ],
    filesWritten: [
      'CoachingCore/r6/holdout/build-independent-holdout.mjs',
      'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json',
      'CoachingCore/r6/holdout/INDEPENDENCE_MANIFEST.json',
    ],
    contextDisclosure: 'The session harness injected the user-level and project-level CLAUDE.md instructions and the auto-memory index into the author\'s context (general project governance, for example that unknown eligibility is ASK and clinical judgment stays human). No repository file other than the two listed above was opened, listed, searched or imported, and the only directory listing was of the holdout folder (to confirm it existed). The builder imports only node:fs, node:crypto, node:path and node:url.',
    commandsRun: [
      'node -e "console.log(new Date().toISOString())" (author start time)',
      'ls of CoachingCore/r6/holdout/ and node --version',
      'node build-independent-holdout.mjs --check / (default) / --seal',
    ],
    interfaceGapsNoted: [
      'Week index base was not stated (resolved by the coordinator clarification above).',
      'No turn-level unavailability: DOUBLE_CONFLICT is expressed as changes {strengthTurn:"AM", sameTurnConfirmed:false, from, to} for the conflict date; the interface does not define how a double conflict should be encoded.',
      'A partial strength session can only be described by minutes (or by guessing program-chosen exercise ids); there is no "first N exercises done" or "accessories skipped" form.',
      'Weekly reviews must name existing sessions; if a program drops one of the athlete\'s chosen days in a given week (deload, taper, fewer days than offered), a sport+day fact becomes a corpus error. There is no "all planned sessions done as prescribed" shorthand.',
      'Next-day function of a session on the last day of a week cannot be reported in that week\'s review (it must stay UNKNOWN or arrive later as a correction).',
      'Vocabularies not enumerated: eligibility.status beyond NONCLINICAL_CONFIRMED/UNKNOWN, specialPopulation values, performanceAnchors kind/distance, wearable provider names (used "NONE" for no wearable), effort/response values beyond those listed.',
      'No free-text field for pain location or a missed-session reason outside interruption.',
      'No explicit wearable last-sync time; a stale sync can only be expressed as an absence of observations.',
      'The interface does not say whether an event date may fall on a day that is not one of the athlete\'s run days (used deliberately in H06, H16, H29 and H34).',
    ],
  };
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({sealed: true, sealedAt, corpusSha256: manifest.corpusSha256, bytes: manifest.bytes, cases: manifest.cases}, null, 2));
} else {
  writeFileSync(CORPUS_PATH, bytes);
  console.log(JSON.stringify({written: CORPUS_PATH, cases: corpus.cases.length, steps, families: fam, bytes: bytes.length, sha256: sha256(bytes)}, null, 2));
}
