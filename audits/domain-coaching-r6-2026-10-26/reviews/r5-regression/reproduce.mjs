// Read-only: (1) check frozen runtime entries against RUNTIME_FREEZE_R6.json, (2) check R5 corpus / first raw against
// BASELINE.json, (3) re-run all 24 frozen R5 cases in memory through the frozen R6 runtime and compare with the
// published replay. Writes nothing; prints a JSON report.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {evaluateHoldoutCase} from '../../../../CoachingCore/scripts/evaluate-holdout-r6.mjs';
import {hash} from '../../../../CoachingCore/src/value.mjs';
const root = 'C:/Users/carva/Desktop/myApp/MyApp/';
const sha = p => createHash('sha256').update(readFileSync(root + p)).digest('hex');
const json = p => JSON.parse(readFileSync(root + p, 'utf8'));
const freeze = json('CoachingCore/r6/RUNTIME_FREEZE_R6.json');
const freezeMismatches = freeze.entries.filter(e => sha(e.path) !== e.sha256).map(e => e.path);
const baseline = json('audits/domain-coaching-r6-2026-10-26/BASELINE.json');
const base = p => baseline.entries.find(e => e.path === p)?.sha256;
const corpusPath = 'CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json', firstPath = 'CoachingCore/r5/holdout/FIRST_EVALUATION.json';
const replay = json('CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.json');
const corpus = json(corpusPath);
const rows = corpus.cases.map(c => {
  const now = evaluateHoldoutCase(c);
  const pub = replay.rows.find(r => r.caseId === c.caseId).r6Output;
  return {caseId: c.caseId, factsHashMatches: hash(c) === replay.rows.find(r => r.caseId === c.caseId).immutableFactsHash, outputIdentical: hash(now) === hash(pub)};
});
console.log(JSON.stringify({
  freezeRevision: freeze.revision, sourceDigest: freeze.sourceDigest, freezeEntries: freeze.entries.length, freezeMismatches,
  corpus: {sha256: sha(corpusPath), baseline: base(corpusPath), replayDeclared: replay.corpusSha256},
  firstRaw: {sha256: sha(firstPath), baseline: base(firstPath), replayDeclared: replay.r5FirstRawSha256},
  r5QualityReview: {sha256: sha('audits/domain-coaching-r5-2026-10-25/reviews/quality-holdout-review.json'), replayDeclared: replay.r5QualityReviewSha256},
  replaySha256: sha('CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.json'), replayRevision: replay.revision, replayAuthority: replay.authority,
  cases: rows.length, factsHashMismatches: rows.filter(r => !r.factsHashMatches).map(r => r.caseId), outputMismatches: rows.filter(r => !r.outputIdentical).map(r => r.caseId)
}, null, 1));
