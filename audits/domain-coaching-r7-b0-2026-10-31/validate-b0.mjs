// R7-B0 repertoire validation. Read-only by default; --write records only
// audits/domain-coaching-r7-b0-2026-10-31/VALIDATION_B0.json. Frozen runtime modules are
// imported read-only to call pure functions (no file is written, no test or verifier is run).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
process.chdir(root);
const A = 'audits/domain-coaching-r7-b0-2026-10-31/';
const B = 'CoachingCore/r7/b0/';
const read = p => fs.readFileSync(p);
const json = p => JSON.parse(read(p).toString('utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => sha(canonical(v));
const mod = p => import(pathToFileURL(path.resolve(p)).href);
const checks = [];
const check = (id, ok, detail) => checks.push({id, pass: !!ok, detail});

const catalogPath = B + 'REPERTOIRE_CATALOG_B0.json', schemaPath = B + 'REPERTOIRE_CATALOG_B0.schema.json';
const cat = json(catalogPath), schema = json(schemaPath);
const policy = json('CoachingCore/r6/PROGRAM_POLICY_R6.json');
const review = json('audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.r12.json');
const r2 = json('CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json');
const op = policy.operational;
const C = cat.strength.configurations, byId = new Map(C.map(c => [c.id, c]));
const SK = {LOW: 0, MODERATE: 1, HIGH: 2}, LD = {NONE: 0, LIGHT: 1, MODERATE: 2, HEAVY: 3}, OD = {NONE: 0, LOW: 1, MODERATE: 2, HIGH: 3};

// V01 schema and parameterization instances
const require = createRequire(import.meta.url);
const Ajv2020 = require(path.resolve('CoachingCore/node_modules/ajv/dist/2020.js')).default;
const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: false});
const validate = ajv.compile(schema);
const schemaOk = validate(cat);
const sub = d => ajv.getSchema(schema.$id + '#/$defs/' + d);
const sampleRunDose = {familyId: 'RUN.THRESHOLD', configurationId: 'RUNCFG.THRESHOLD_INTERVALS', date: '2026-11-10', purpose: 'QUALITY', ladderIndex: 1,
  structure: [{phase: 'WARMUP', duration: {value: op.run.qualityWarmupMinutes, unit: 'MINUTE', class: 'PRESCRIBED', provenance: 'policy:operational.run.qualityWarmupMinutes'}},
    {phase: 'REPEAT', repetitions: op.run.thresholdLadder[1].repetitions, children: [{phase: 'WORK', duration: {value: op.run.thresholdLadder[1].workMinutes, unit: 'MINUTE', class: 'PRESCRIBED', provenance: 'policy:operational.run.thresholdLadder[1]'}, completion: 'TIME'}, {phase: 'RECOVERY', duration: {value: op.run.thresholdLadder[1].recoveryMinutes, unit: 'MINUTE', class: 'PRESCRIBED'}, recoveryMode: 'EASY_JOG_OR_WALK', completion: 'TIME'}]},
    {phase: 'COOLDOWN', duration: {value: op.run.qualityCooldownMinutes, unit: 'MINUTE', class: 'PRESCRIBED'}}],
  intensity: {method: 'EFFORT_CUE', cue: 'THRESHOLD_CONTROLLED'}, authorityRefs: ['R6-RUN-QUALITY', 'R6-PLANNED-PROGRESSION']};
const sampleRow = {configurationId: 'goblet-squat', contextualRole: 'MAIN', sets: 3, repTarget: {min: 8, max: 12}, rirTarget: {minimum: 2}, loadMode: 'FROM_LOG', load: {value: 16, unit: 'KILOGRAM', class: 'PRESCRIBED', provenance: 'executed log, adopted'}, convention: 'SINGLE_IMPLEMENT', restSeconds: op.strength.restSeconds.MAIN, setType: 'WORK', exposureKind: 'FROM_LOG', authorityRefs: ['R6-PLANNED-PROGRESSION']};
const sampleState = {athleteId: 'a-1', subject: {kind: 'STRENGTH_CONFIGURATION', id: 'goblet-squat'}, mode: 'FROM_LOG_ADOPTED', referenceLoad: {value: 16, unit: 'KILOGRAM', class: 'EXECUTED', provenance: 'log-77'}, sets: 3, lastGate: 'ADVANCE', asOf: '2026-11-09', evidenceRefs: ['log-77']};
const badRow = {...sampleRow, sets: 9, loadMode: 'GUESS'};
const instances = {runDose: sub('runDose')(sampleRunDose), strengthRowDose: sub('strengthRowDose')(sampleRow), progressionState: sub('progressionState')(sampleState), rejectsInvalidRow: !sub('strengthRowDose')(badRow)};
check('V01-schema-and-parameterization', schemaOk && Object.values(instances).every(Boolean), {catalogValid: schemaOk, errors: (validate.errors || []).slice(0, 10), instances});

// V02 policy binding: canonical hash and every policy: reference resolves
const policyHash = hash(policy);
const refs = new Set();
JSON.stringify(cat).replace(/policy:[A-Za-z0-9_.\-]+/g, m => { refs.add(m.replace(/[.]+$/, '')); return m; });
const resolve = r => r.slice(7).split('.').reduce((o, k) => (o !== undefined && o !== null && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined, policy);
const unresolved = [...refs].filter(r => resolve(r) === undefined);
check('V02-policy-binding', policyHash === cat.bindings.policy.canonicalHash && policy.revision === cat.bindings.policy.revision && !unresolved.length, {policyHash, references: refs.size, unresolved});

// V03 R6 catalogue fidelity
const {CATALOGUE} = await mod('CoachingCore/src/r6-catalogue.mjs');
const fidelity = [], deltas = [];
for (const e of CATALOGUE) {
  const b = byId.get(e.id);
  if (!b) { fidelity.push({id: e.id, issue: 'missing'}); continue; }
  const latSame = (b.lat === 'UNILATERAL') === e.unilateral;
  if (!latSame) deltas.push({id: e.id, r6: {unilateral: e.unilateral}, b0: {lat: b.lat}, declared: !!b.r6Delta?.lat});
  const same = b.origin === 'R6' && b.pattern === e.pattern && b.region === e.region && canonical([...b.eq].sort()) === canonical([...e.equipment].sort()) && b.skill === e.skill && b.lower === e.lowerDemand && (latSame || !!b.r6Delta?.lat) && b.variantOf === e.variantOf && (!e.runningSupport || b.purposes.includes('RUNNING_SUPPORT')) && b.roles.includes(e.role);
  if (!same) fidelity.push({id: e.id, issue: 'field mismatch'});
  const r6conv = e.convention, r6load = e.loading;
  if (b.conv !== r6conv || b.loading !== r6load) { deltas.push({id: e.id, r6: {loading: r6load, convention: r6conv}, b0: {loading: b.loading, conv: b.conv}}); if (!b.r6Delta) fidelity.push({id: e.id, issue: 'undeclared representation delta'}); }
}
const r6Origin = C.filter(c => c.origin === 'R6');
check('V03-r6-catalogue-fidelity', !fidelity.length && r6Origin.length === CATALOGUE.length && r6Origin.every(c => CATALOGUE.some(e => e.id === c.id)), {r6Entries: CATALOGUE.length, preserved: r6Origin.length, b0Entries: C.length - r6Origin.length, issues: fidelity, declaredDeltas: deltas});

// V04 identity and referential integrity
const ids = list => list.map(x => x.id);
const dup = list => list.filter((x, i) => list.indexOf(x) !== i);
const runCfgIds = cat.run.families.flatMap(f => f.configurations.map(c => c.id));
const allIds = [...ids(C), ...ids(cat.run.families), ...runCfgIds, ...ids(cat.strength.templates), ...ids(cat.laterGate), ...ids(cat.candidates), ...ids(cat.witnesses.positive), ...ids(cat.witnesses.negative), ...ids(cat.composition.interferenceRelations), ...ids(cat.composition.placementRules)];
const ladderIds = cat.strength.skillLadders.progressionOf.flat(), practiceIds = Object.values(cat.strength.skillLadders.practiceFor);
const pullText = JSON.stringify(cat.strength.pullCoverage.byEquipmentProfile);
const pullIds = [...pullText.matchAll(/[a-z0-9]+(?:-[a-z0-9]+)+/g)].map(m => m[0]).filter(t => !['band-or'].includes(t));
const candidateRefs = new Set([...JSON.stringify({...cat, candidates: []}).matchAll(/B0-C[0-9]{2}/g)].map(m => m[0]));
const vocabMuscle = new Set(cat.vocabulary.muscles), vocabEq = new Set(cat.vocabulary.equipment);
const integrity = {
  duplicateIds: dup(allIds),
  unknownLadderIds: ladderIds.filter(i => !byId.has(i)),
  practiceForNotPractice: practiceIds.filter(i => !byId.get(i)?.roles.includes('PRACTICE')),
  unknownPullIds: pullIds.filter(i => !byId.has(i)),
  undefinedCandidates: [...candidateRefs].filter(i => !cat.candidates.some(c => c.id === i)),
  unreferencedCandidates: cat.candidates.map(c => c.id).filter(i => !candidateRefs.has(i)),
  b0WithoutCandidateStatus: C.filter(c => c.origin === 'B0' && c.authorityStatus !== 'B0_CANDIDATE').map(c => c.id),
  badMuscles: C.flatMap(c => [...c.prim, ...c.sec].filter(m => !vocabMuscle.has(m)).map(m => c.id + ':' + m)),
  badEquipment: C.flatMap(c => c.eq.filter(e => !vocabEq.has(e)).map(e => c.id + ':' + e)),
  primarySecondaryOverlap: C.filter(c => c.prim.some(m => c.sec.includes(m))).map(c => c.id)
};
check('V04-identity-and-references', Object.values(integrity).every(v => !v.length), integrity);

// Selection helpers (mirror R6 candidatesFor plus B0 role admissibility)
const maxSkill = exp => exp === 'NOVICE' || exp === 'NONE' ? 0 : 1;
const admissible = (c, {equipment, experience, familiar = [], role}) => { const av = new Set([...equipment, 'BODYWEIGHT']); return c.eq.every(x => av.has(x)) && c.roles.includes(role) && (familiar.includes(c.id) || SK[c.skill] <= maxSkill(experience)); };
const defSub = cat.strength.templateRules.patternDefaultSubpattern;
const rank = (a, b) => Number(b.sub === defSub[b.pattern]) - Number(a.sub === defSub[a.pattern]) || (a.loading === 'EXTERNAL' && b.loading !== 'EXTERNAL' ? -1 : b.loading === 'EXTERNAL' && a.loading !== 'EXTERNAL' ? 1 : 0) || SK[b.skill] - SK[a.skill] || Number(b.origin === 'R6') - Number(a.origin === 'R6') || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const options = (pattern, subs, ctx) => C.filter(c => c.pattern === pattern && (!subs || subs.includes(c.sub)) && admissible(c, ctx) && !(ctx.used || []).includes(c.id)).sort(rank);
const profiles = cat.strength.equipmentProfiles;

// V05 slot coverage per equipment profile x experience
const coverage = {}, holes = [], pullDowngrades = [], accessoryGaps = [];
for (const [pname, equipment] of Object.entries(profiles)) for (const experience of ['NOVICE', 'INTERMEDIATE']) {
  const key = pname + '/' + experience; coverage[key] = {};
  for (const t of cat.strength.templates) {
    const used = [];
    // MAIN slots are filled first, as R6 keeps main lifts before accessories.
    const order = t.slots.map((s, i) => i).sort((x, y) => Number(t.slots[y].role === 'MAIN') - Number(t.slots[x].role === 'MAIN') || x - y);
    const filled = [];
    for (const i of order) {
      const s = t.slots[i];
      const main = options(s.pattern, s.subpatterns, {equipment, experience, role: s.role, used});
      if (main.length) { used.push(main[0].id); filled[i] = s.pattern + ':' + s.role + '=' + main[0].id; continue; }
      const acc = s.role === 'MAIN' ? options(s.pattern, null, {equipment, experience, role: 'ACCESSORY', used}) : [];
      if (acc.length) { used.push(acc[0].id); if (s.pattern === 'PULL') pullDowngrades.push(key + ' ' + t.id); filled[i] = s.pattern + ':DOWNGRADED_ACCESSORY=' + acc[0].id; continue; }
      if (s.role === 'MAIN') holes.push(key + ' ' + t.id + ' ' + s.pattern + ':' + s.role); else accessoryGaps.push(key + ' ' + t.id + ' ' + s.pattern);
      filled[i] = s.pattern + ':MISSING_DISCLOSED';
    }
    coverage[key][t.id] = filled;
    if (t.slots.some(s => s.pattern === 'PULL') && !filled.some(f => f.startsWith('PULL:') && !f.endsWith('MISSING_DISCLOSED'))) holes.push(key + ' ' + t.id + ' PULL:NO_PULL_ROW');
  }
}
const pullNeverEmpty = holes.filter(h => h.includes(' PULL:')).length === 0;
const coreFilled = holes.filter(h => /(SQUAT|HINGE|PUSH|LUNGE):MAIN/.test(h)).length === 0;
check('V05-slot-coverage-by-equipment', pullNeverEmpty && coreFilled, {profiles: Object.keys(profiles), holes, pullDowngradesDisclosed: pullDowngrades, accessorySlotsLeftEmptyAndDisclosed: accessoryGaps, matrix: coverage});

// V05b goal-context alternatives have admissible options in the profiles that can host them
const goalAlt = [];
for (const t of cat.strength.templates) for (const s of t.slots) for (const [g, alt] of Object.entries(s.goalContext || {})) {
  for (const p of alt.alternativePatterns || []) for (const prof of ['FULL_GYM', 'HOME_DUMBBELLS', 'BODYWEIGHT_ONLY']) goalAlt.push({template: t.id, goal: g, pattern: p, profile: prof, options: options(p, null, {equipment: profiles[prof], experience: 'INTERMEDIATE', role: 'ACCESSORY'}).map(c => c.id)});
  for (const sp of alt.alternateSubpatterns || []) for (const prof of ['FULL_GYM', 'HOME_DUMBBELLS', 'BODYWEIGHT_ONLY']) goalAlt.push({template: t.id, goal: g, subpattern: sp, profile: prof, options: options(s.pattern, [sp], {equipment: profiles[prof], experience: 'NOVICE', role: 'ACCESSORY'}).map(c => c.id)});
}
const gymOk = goalAlt.filter(x => x.profile === 'FULL_GYM').every(x => x.options.length > 0);
const bwSub = goalAlt.filter(x => x.subpattern && x.profile === 'BODYWEIGHT_ONLY').every(x => x.options.length > 0);
check('V05b-goal-context-alternatives', gymOk && bwSub, {fullGymAllCovered: gymOk, bodyweightCalfAlternationCovered: bwSub, emptyOutsideGym: goalAlt.filter(x => !x.options.length).map(x => x.template + ' ' + x.goal + ' ' + (x.pattern || x.subpattern) + ' ' + x.profile)});

// V06 rotation eligibility mapping and admissible alternatives
const R = cat.strength.rotation, groups = R.subpatternGroups || {};
const sameGroup = (p, a, b) => a === b || (groups[p] || []).some(g => g.includes(a) && g.includes(b));
const within1 = (x, y, m) => Math.abs(m[x] - m[y]) <= 1;
const alternativeOf = (cur, cand) => cand.id !== cur.id && cand.pattern === cur.pattern && sameGroup(cur.pattern, cur.sub, cand.sub) && cand.prim.some(m => cur.prim.includes(m)) && within1(cur.lower, cand.lower, LD) && within1(cur.axial, cand.axial, OD) && within1(cur.ecc, cand.ecc, OD);
const rotation = [];
for (const prof of ['FULL_GYM', 'HOME_DUMBBELLS_BENCH', 'HOME_DUMBBELLS', 'KETTLEBELL_ONLY', 'BANDS_ONLY', 'BODYWEIGHT_ONLY']) for (const t of cat.strength.templates) t.slots.forEach((s, i) => {
  if (s.role !== 'ACCESSORY') return;
  const opts = options(s.pattern, s.subpatterns, {equipment: profiles[prof], experience: 'INTERMEDIATE', role: 'ACCESSORY'});
  if (!opts.length) return;
  const alts = opts.filter(o => alternativeOf(opts[0], o));
  rotation.push({profile: prof, template: t.id, slot: i, current: opts[0].id, alternatives: alts.map(a => a.id), EVERY_2_WEEKS: alts.length ? 'TWO_WEEK_ELIGIBLE' : 'BLOCK_BOUNDARY_ELIGIBLE'});
});
const map = R.preferenceToEligibility;
const mappingOk = Object.values(map).every(m => !String(m.MAIN).includes('TWO_WEEK') && m.PRACTICE === 'REASON_ONLY') && map.FIXED.MAIN === 'REASON_ONLY' && map.FIXED.ACCESSORY === 'REASON_ONLY' && map.EVERY_2_WEEKS.ACCESSORY.startsWith('TWO_WEEK_ELIGIBLE') && canonical(R.deferredPhases) === canonical(['ESTABLISHMENT', ...op.rotation.deferInPhases]);
const twoWeek = rotation.filter(r => r.EVERY_2_WEEKS === 'TWO_WEEK_ELIGIBLE').length;
check('V06-rotation-eligibility', mappingOk && twoWeek > 0, {mappingOk, accessorySlotsEvaluated: rotation.length, twoWeekEligible: twoWeek, blockBoundaryOnly: rotation.length - twoWeek, detail: rotation});

// V07 directed close-variation relation
const closeVar = (a, b) => a.id !== b.id && a.pattern === b.pattern && a.sub === b.sub && a.prim.some(m => b.prim.includes(m)) && SK[b.skill] <= SK[a.skill] && within1(a.lower, b.lower, LD) && within1(a.axial, b.axial, OD) && within1(a.ecc, b.ecc, OD);
const edges = []; for (const a of C) for (const b of C) if (closeVar(a, b)) edges.push([a.id, b.id]);
const asymmetric = edges.filter(([a, b]) => !edges.some(([x, y]) => x === b && y === a));
const upward = edges.filter(([a, b]) => SK[byId.get(b).skill] > SK[byId.get(a).skill]);
check('V07-close-variation-directed', edges.length > 0 && asymmetric.length > 0 && !upward.length, {edges: edges.length, directedOnly: asymmetric.length, examples: asymmetric.slice(0, 12)});

// V08 skill ladders: same pattern, skill never decreases
const ladderIssues = [];
for (const chain of cat.strength.skillLadders.progressionOf) for (let i = 1; i < chain.length; i++) { const a = byId.get(chain[i - 1]), b = byId.get(chain[i]); if (!a || !b || a.pattern !== b.pattern || SK[b.skill] < SK[a.skill]) ladderIssues.push(chain[i - 1] + '->' + chain[i]); }
const practiceCovered = ['SQUAT', 'HINGE', 'LUNGE', 'PUSH', 'PULL', 'CALF', 'TRUNK'].every(p => byId.get(cat.strength.skillLadders.practiceFor[p])?.pattern === p);
check('V08-skill-ladders', !ladderIssues.length && practiceCovered, {chains: cat.strength.skillLadders.progressionOf.length, issues: ladderIssues, practiceCovered});

// V09 run classification equals the reviewed runtime binding (assessCapability) on a grid
const P = await mod('CoachingCore/src/r6-program.mjs');
const minSession = op.run.minimumSessionMinutes;
const catRunClass = ({exp, W, D, L, fq, longPause}) => {
  const below = v => Number.isFinite(v) && v > 0 && v < minSession, belowMin = below(L) || below(W);
  if (exp === 'NONE' || exp === 'NOVICE' && (W === null || W < 45 || D === 0) || belowMin && !longPause) return 'WALK_JOG';
  if (D === 0 || W === 0 || longPause) return 'RESTART';
  if (W === null) return 'EASY_UNKNOWN';
  if (exp === 'NOVICE' || W < 60 || (D ?? 0) < 2) return 'EASY_LOW';
  return fq ? 'QUALITY_FAMILIAR' : 'EASY_CURRENT';
};
let gridCases = 0; const classMismatch = [];
for (const exp of ['NONE', 'NOVICE', 'INTERMEDIATE', 'EXPERIENCED']) for (const W of [null, 0, 10, 30, 44, 45, 59, 60, 120, 240]) for (const D of [null, 0, 1, 2, 4]) for (const L of [null, 10, 14, 15, 40]) for (const fq of [false, true]) for (const longPause of [false, true]) {
  gridCases++;
  const c = {athlete: {runExperience: exp, strengthExperience: 'NOVICE', recentRun: {runMinutesPerWeek: W, runDaysPerWeek: D, longestRunMinutes: L, basis: 'SELF_REPORT'}, knownRuns: fq ? [{current: true, prescription: {family: 'THRESHOLD'}}] : [], knownExercises: [], pause: longPause ? {screen: {status: 'NONCLINICAL'}, weeks: 6} : null}, goals: {run: {kind: 'GENERAL'}, strength: {kind: 'NONE'}, event: null}, schedule: {runDays: [1, 3, 5], strengthDays: []}};
  const runtime = P.assessCapability(c, op).run.class, spec = catRunClass({exp, W, D, L, fq, longPause});
  if (runtime !== spec) classMismatch.push({exp, W, D, L, fq, longPause, runtime, spec});
}
const classIds = new Set(cat.classification.runClasses.map(x => x.id));
check('V09-run-classification-equals-runtime', !classMismatch.length && ['NOT_PROGRAMMED', 'WALK_JOG', 'RESTART', 'EASY_UNKNOWN', 'EASY_LOW', 'QUALITY_FAMILIAR', 'EASY_CURRENT'].every(i => classIds.has(i)), {gridCases, mismatches: classMismatch.slice(0, 10), mismatchCount: classMismatch.length});

// V10 trajectories: every class has an entry, no dead-end mode, return and clinical routes exist
const tr = cat.trajectories.run.transitions;
const from = s => tr.filter(t => t.from.startsWith(s));
const entries = ['WALK_JOG', 'RESTART', 'EASY_UNKNOWN', 'EASY_LOW', 'EASY_CURRENT', 'QUALITY_FAMILIAR'].filter(k => !tr.some(t => t.from === 'intake' && t.guard.includes(k)));
const deadEnds = ['WALK_JOG', 'RESTART', 'EASY'].filter(s => !from(s).length);
const exits = {walkJogToEasy: tr.some(t => t.from.startsWith('WALK_JOG') && t.to === 'EASY'), restartToEasy: tr.some(t => t.from.startsWith('RESTART') && t.to === 'EASY'), easyToQuality: tr.some(t => t.from === 'EASY' && t.to.includes('quality')), returns: ['RETURN_SHORT', 'RETURN_MODERATE(1)', 'RESTART(entry)', 'CLINICAL_HOLD', 'ASK_HOLD'].every(s => tr.some(t => t.from === 'any' && t.to === s))};
const strTr = cat.trajectories.strengthExercise.transitions;
const strengthPaths = ['PRACTICE', 'ESTABLISH', 'FROM_LOG_PENDING', 'FROM_LOG_ADOPTED', 'REESTABLISH', 'RETURN_ENTRY', 'RETURN_STEP'].every(s => strTr.some(t => t.to.startsWith(s) || t.to.includes(s)));
const events = {tenK: runCfgIds.includes('RUNCFG.TEN_K_SPECIFIC_INTERVALS'), half: runCfgIds.includes('RUNCFG.HALF_MARATHON_SPECIFIC_INTERVALS'), onlySupported: canonical(cat.scope.supportedEvents) === canonical(['10K', 'HALF_MARATHON']), raceModes: runCfgIds.includes('RUNCFG.RACE_COMPLETION') && runCfgIds.includes('RUNCFG.RACE_EFFORT')};
check('V10-trajectories-no-dead-ends', !entries.length && !deadEnds.length && Object.values(exits).every(Boolean) && strengthPaths && Object.values(events).every(Boolean), {missingEntries: entries, deadEnds, exits, strengthPaths, events});

// V11 families complete and bound to approved envelopes or familiar paths
const approved = new Set(review.records.filter(r => r.disposition === 'APPROVE_WITH_CONDITIONS').map(r => r.boundaryId));
const r2ok = new Set(r2.records.filter(r => r.disposition === 'APPROVE_WITH_CONDITIONS').map(r => r.review_id));
const famIssues = [];
for (const f of cat.run.families) {
  if (!f.eligibility.positive.length || !f.eligibility.negative.length || !f.progression.rule || !f.regression.rule) famIssues.push(f.id + ': incomplete');
  for (const e of f.envelopes || []) if (!approved.has(e) || !policy.scientificBoundaryIds.includes(e)) famIssues.push(f.id + ': envelope ' + e);
  for (const p of f.familiarPath || []) if (!r2ok.has(p)) famIssues.push(f.id + ': familiar ' + p);
  if (!(f.envelopes || []).length && !(f.familiarPath || []).length) famIssues.push(f.id + ': no authority');
  if (f.authorityStatus === 'B0_CANDIDATE' && !f.candidate) famIssues.push(f.id + ': candidate id missing');
}
check('V11-run-families-bound', !famIssues.length && approved.size === 10, {families: cat.run.families.length, approvedEnvelopes: [...approved], issues: famIssues});

// V12 composition relations reproduce the frozen runtime (pure function, wrap off)
const Bal = await mod('CoachingCore/src/r6-balanced.mjs');
const run = (id, day, hour, family) => ({id, day, startMinute: hour * 60, prescription: {modality: 'RUN', family}});
const lift = (id, day, hour, exId, sets) => ({id, day, startMinute: hour * 60, prescription: {modality: 'STRENGTH', exercises: [{id: exId, pattern: byId.get(exId).pattern, sets, load: {mode: 'KNOWN', unit: 'KG'}}]}});
const H = 'back-squat', M = 'goblet-squat';
const cases = {
  'CMP.I01': [[lift('s', 0, 18, H, 3), run('r', 2, 7, 'RACE')], 'run', 'HIGH'],
  'CMP.I02': [[lift('s', 0, 18, H, 3), run('r', 1, 7, 'THRESHOLD')], 'run', 'MODERATE'],
  'CMP.I03': [[lift('s', 0, 7, H, 3), run('r', 1, 18, 'THRESHOLD')], 'run', 'LOW'],
  'CMP.I04': [[lift('s', 0, 18, M, 3), run('r', 1, 7, 'THRESHOLD')], 'run', 'LOW'],
  'CMP.I05': [[run('r', 0, 7, 'THRESHOLD'), lift('s', 0, 8, H, 3)], 'strength', 'MODERATE'],
  'CMP.I06': [[run('r', 0, 7, 'THRESHOLD'), lift('s', 0, 18, H, 3)], 'strength', 'LOW'],
  'CMP.I07': [[run('r', 0, 7, 'THRESHOLD'), lift('s', 0, 8, M, 3)], 'strength', 'LOW'],
  'CMP.I08': [[run('r', 0, 7, 'EASY'), lift('s', 0, 8, M, 3)], 'strength', 'LOW'],
  'CMP.I09': [[run('a', 0, 7, 'THRESHOLD'), run('b', 1, 7, 'LONG')], 'run', 'MODERATE'],
  'CMP.I10': [[lift('a', 0, 7, H, 3), lift('b', 1, 18, H, 3)], 'strength', 'MODERATE']
};
const compo = {};
for (const [id, [sessions, axis, sev]] of Object.entries(cases)) {
  const rel = cat.composition.interferenceRelations.find(r => r.id === id);
  const costs = Bal.interferenceCosts(sessions, {wrap: false, hybrid: op.hybrid, strengthDevelopment: true});
  const got = costs.filter(c => c.axis === axis).map(c => c.severity);
  compo[id] = {catalog: rel && rel.axis + '/' + rel.severity, runtime: got, ok: !!rel && rel.axis === axis && rel.severity === sev && got.includes(sev)};
}
const heavyBelowMin = Bal.lowerDemand({modality: 'STRENGTH', exercises: [{id: H, pattern: 'SQUAT', sets: 2, load: {mode: 'KNOWN', unit: 'KG'}}]}, op.hybrid) === 'MODERATE';
const hybridEqual = canonical(Bal.DEFAULT_HYBRID) === canonical(op.hybrid);
check('V12-composition-equals-runtime', Object.values(compo).every(x => x.ok) && heavyBelowMin && hybridEqual, {relations: compo, heavyBelowMinimumSetsCountsModerate: heavyBelowMin, hybridConstantsEqualPolicy: hybridEqual, b0Only: cat.composition.interferenceRelations.filter(r => r.authorityStatus === 'B0_CANDIDATE').map(r => r.id)});

// V13 archetypes: one per context, equal to the runtime goal model
const runGoals = ['RACE', 'PERFORMANCE', 'REGULAR', 'GENERAL', 'NONE'], strGoals = ['STRENGTH', 'HYPERTROPHY', 'RUNNING_SUPPORT', 'MAINTAIN', 'GENERAL', 'NONE'];
const archOf = (run, str, ev) => {
  const runDev = ['RACE', 'PERFORMANCE'].includes(run), strDev = ['STRENGTH', 'HYPERTROPHY'].includes(str);
  if (run === 'NONE' && str === 'NONE') return null;
  if (str === 'NONE') return ['ARCH.RUN_ONLY', 'RUN']; if (run === 'NONE') return ['ARCH.STRENGTH_ONLY', 'STRENGTH'];
  const base = ev ? (strDev ? 'JOINT' : 'RUN') : runDev && strDev ? 'JOINT' : runDev ? 'RUN' : strDev ? 'STRENGTH' : 'JOINT';
  return [{RUN: 'ARCH.RUN_LED', STRENGTH: 'ARCH.STRENGTH_LED', JOINT: 'ARCH.JOINT'}[base], base];
};
const archIssues = []; let archCases = 0; const archCount = {};
for (const run of runGoals) for (const str of strGoals) for (const ev of [null, {kind: '10K', date: '2026-12-20'}, {kind: 'HALF_MARATHON', date: '2027-01-10'}]) {
  if (ev && run === 'NONE') continue;
  const a = archOf(run, str, ev); if (!a) continue; archCases++;
  archCount[a[0]] = (archCount[a[0]] || 0) + 1;
  const gm = P.buildGoalModel({goals: {run: {kind: run}, strength: {kind: str}, event: ev}, schedule: {}});
  if (gm.baseLead !== a[1]) archIssues.push({run, str, ev: ev?.kind ?? null, runtime: gm.baseLead, spec: a[1]});
  for (const [phase, lead] of Object.entries(cat.archetypes.phaseLeads)) if (['SPECIFIC', 'TAPER', 'RACE_WEEK', 'POST_EVENT'].includes(phase) && gm.priorityByPhase[phase].lead !== lead) archIssues.push({run, str, phase, runtime: gm.priorityByPhase[phase].lead, spec: lead});
}
check('V13-archetypes-equal-goal-model', !archIssues.length && Object.keys(archCount).length === cat.archetypes.items.length, {cases: archCases, perArchetype: archCount, issues: archIssues.slice(0, 10)});

// V14 witnesses: coverage and executable checks
const knownFamilies = [...ids(cat.run.families), ...ids(cat.strength.sessionFamilies), 'composition'];
const posFamilyOk = cat.witnesses.positive.every(w => knownFamilies.some(f => w.family.includes(f)));
const central = ['RUN.WALK_JOG', 'RUN.EASY', 'RUN.LONG', 'RUN.STRIDES', 'RUN.THRESHOLD', 'RUN.EVENT_SPECIFIC', 'RUN.RACE_TOUCH', 'RUN.RACE', 'RUN.FAMILIAR_REPEATED_BOUTS', 'STR.FULL_BODY', 'STR.LOWER', 'STR.UPPER', 'STR.TRUNK_CALF', 'composition'];
const uncovered = central.filter(f => !cat.witnesses.positive.some(w => w.family.includes(f)));
const allowedOutcomes = ['NOT_ADMISSIBLE', 'UNSUPPORTED', 'LATER_GATE', 'FORBIDDEN', 'DEFERRED', 'NOT_ELIGIBLE', 'HOLD', 'CLINICAL_HUMAN_REQUIRED', 'ASK', 'NOT_REPRESENTABLE'];
const negOk = cat.witnesses.negative.every(w => allowedOutcomes.some(o => w.expected.startsWith(o)));
const ladder = op.run.thresholdLadder, ten = op.run.tenKSpecificLadder, half = op.run.halfMarathonSpecificLadder, fmt = s => s.repetitions + 'x' + s.workMinutes + '/' + s.recoveryMinutes;
const exec = {
  'WP-RUN-06': fmt(ladder[0]) === '3x5/2' && fmt(ladder[1]) === '4x5/2',
  'WP-RUN-07': fmt(ladder[4]) === '4x8/2' && fmt(ladder[5]) === '3x10/2' && fmt(ladder[3]) === '3x8/2',
  'WP-RUN-08': fmt(ten[0]) === '5x3/2' && fmt(ten[1]) === '6x3/2',
  'WP-RUN-09': fmt(half[0]) === '2x12/3' && fmt(half[1]) === '3x10/2',
  'WP-RUN-11': fmt(op.event.raceWeekTouch['10K']) === '3x2/2' && op.event.raceWeekTouchMinDaysBeforeRace === 3,
  'WP-RUN-14': op.return.entryRunMinutes === 15 && op.run.restart.stepMinutes === 5 && op.run.restart.switchToEasyAtMinutes === 30,
  'WP-STR-05': alternativeOf(byId.get('db-step-up'), byId.get('reverse-lunge-db')),
  'WP-STR-08': ['kb-goblet-squat', 'kb-deadlift', 'kb-row'].every(i => admissible(byId.get(i), {equipment: profiles.KETTLEBELL_ONLY, experience: 'INTERMEDIATE', role: 'MAIN'})),
  'WP-STR-09': options('PULL', null, {equipment: profiles.BODYWEIGHT_ONLY, experience: 'NOVICE', role: 'ACCESSORY'})[0]?.id === 'prone-ytw-raise' && !options('PULL', ['HORIZONTAL_PULL', 'VERTICAL_PULL'], {equipment: profiles.BODYWEIGHT_ONLY, experience: 'NOVICE', role: 'MAIN'}).length,
  'WN-09': !admissible(byId.get('back-squat'), {equipment: profiles.FULL_GYM, experience: 'NOVICE', role: 'MAIN'}) && admissible(byId.get('back-squat'), {equipment: profiles.FULL_GYM, experience: 'NOVICE', familiar: ['back-squat'], role: 'MAIN'}),
  'WN-11': R.deferredPhases.includes('TAPER'),
  'WN-12': !String(map.EVERY_2_WEEKS.MAIN).includes('TWO_WEEK'),
  'WN-13': Object.values(map).every(m => m.PRACTICE === 'REASON_ONLY'),
  'WN-24': byId.get('band-row').conv === 'BAND_TENSION',
  'WN-21': compo['CMP.I01'].ok && op.hybrid.preRaceStrengthGapHours >= 48
};
check('V14-witnesses', posFamilyOk && !uncovered.length && negOk && Object.values(exec).every(Boolean), {positive: cat.witnesses.positive.length, negative: cat.witnesses.negative.length, centralUncovered: uncovered, executable: exec});

// V15 later-gate items are outside the repertoire and carry fallbacks
const laterIds = ids(cat.laterGate), inRepertoire = laterIds.filter(i => allIds.filter(x => x === i).length > 1);
const forbiddenFamilies = cat.run.families.filter(f => /STEADY|HILL|TEMPO|VO2_DE_NOVO|SPEED|FARTLEK/.test(f.id)).map(f => f.id);
const forbiddenConfigs = C.filter(c => /nordic|copenhagen|plyo|jump|swing|clean|snatch/.test(c.id)).map(c => c.id);
check('V15-later-gate-separation', !inRepertoire.length && !forbiddenFamilies.length && !forbiddenConfigs.length && cat.laterGate.every(l => l.fallback && l.reason), {laterGate: laterIds.length, inRepertoire, forbiddenFamilies, forbiddenConfigs});

// V16 gap closure matrix covers every readiness category and every R6 open-gap id
const gapDoc = fs.existsSync(B + 'GAP_CLOSURE_B0.md') ? read(B + 'GAP_CLOSURE_B0.md').toString('utf8') : '';
const openGaps = json('CoachingCore/r6/OPEN_GAPS_R6.json');
const gapIds = [...new Set(JSON.stringify(openGaps).match(/"id":"([^"]+)"/g)?.map(s => s.slice(6, -1)) ?? [])];
const readinessIds = ['R1', 'R2', 'S1', 'S2', 'H1', 'H2', 'A1', 'A2', 'P1', 'P2', 'B1', 'B2', 'T1', 'T2'];
const missingGaps = gapIds.filter(i => !gapDoc.includes(i)), missingReadiness = readinessIds.filter(i => !new RegExp('\\b' + i + '\\b').test(gapDoc));
check('V16-gap-closure-coverage', gapDoc.length > 0 && !missingGaps.length && !missingReadiness.length, {r6GapIds: gapIds.length, missingGaps, missingReadiness});

// V17 status and scope guards
const statusOk = cat.status.runtimeAuthority === false && cat.status.productTruth === false && cat.status.RUNTIME_IMPLEMENTATION_READY === 'NO' && cat.status.V1_COACHING_AUTHORITY_READY === 'NO';
const runEvents = cat.run.families.flatMap(f => f.configurations.map(c => c.event).filter(Boolean));
check('V17-status-and-scope', statusOk && runEvents.every(e => ['10K', 'HALF_MARATHON'].includes(e)), {statusOk, runEvents});

const out = {revision: 'R7B0-VALIDATION-1', checkedAt: new Date().toISOString(), catalog: {path: catalogPath, revision: cat.revision, sha256: sha(read(catalogPath))}, schema: {path: schemaPath, sha256: sha(read(schemaPath))}, policyHash, method: 'Node standard library + pinned ajv 2020 from CoachingCore/node_modules; frozen runtime modules imported read-only for pure functions (assessCapability, buildGoalModel, interferenceCosts, lowerDemand, CATALOGUE); nothing written outside this report.', passed: checks.filter(c => c.pass).length, total: checks.length, checks};
if (process.argv.includes('--write')) fs.writeFileSync(A + 'VALIDATION_B0.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({passed: out.passed, total: out.total, failed: checks.filter(c => !c.pass).map(c => ({id: c.id, detail: c.detail}))}, null, 1).slice(0, 6000));
process.exitCode = checks.every(c => c.pass) ? 0 : 1;
