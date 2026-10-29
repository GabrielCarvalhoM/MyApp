import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';

/**
 * FREEZE-2: the delta freeze after the independent engineering FAIL on FREEZE-1. Same discovery as freeze-r6.mjs. It records
 * the predecessor digest, the changed files, the findings behind the change, the policy hash the SSCTR bound and the order
 * of events: the single first evaluation ran on FREEZE-1 before any fix, and the runtime author did not inspect its contents.
 * It refuses unless the current SSCTR review binds the current policy and allows the freeze. Writes once; a later run only
 * confirms the digest.
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const R6='CoachingCore/r6/',AUDIT='audits/domain-coaching-r6-2026-10-26/';
const files=new Set();
const walk=rel=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.mjs'))files.add(p);}};
walk('CoachingCore/src');
for(const p of [...files]){
 const text=fs.readFileSync(abs(p),'utf8');
 for(const m of text.matchAll(/new URL\('(\.\.\/[^']+\.json)',import\.meta\.url\)/g)){
  const target=path.posix.normalize(path.posix.join(path.posix.dirname(p),m[1]));
  assert.ok(fs.existsSync(abs(target)),'Runtime data file missing: '+target);files.add(target);
 }
}
for(const p of [R6+'holdout/INTERFACE_ONLY.md','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/package.json'])files.add(p);
const entries=[...files].sort().map(p=>({path:p,sha256:sha(p)})),sourceDigest=hash(entries);
const out=abs(R6+'RUNTIME_FREEZE_R6_2.json');
if(fs.existsSync(out)){assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).sourceDigest,sourceDigest,'FREEZE-2 source changed; evidence on it must never be overwritten');console.log('Freeze-2 unchanged '+sourceDigest);}
else{
 const f1=json(R6+'RUNTIME_FREEZE_R6.json');
 assert.equal(hash(f1.entries),f1.sourceDigest,'FREEZE-1 record altered');
 const policyFile=R6+'PROGRAM_POLICY_R6.json',policy=json(policyFile),policyHash=hash(policy),review=json(AUDIT+'reviews/ssctr-policy-review.json');
 assert.equal(review.policyHash,policyHash,'The SSCTR review does not bind the current policy');
 assert.equal(review.freezeVerdict?.runtimeMayBeFrozen,true,'The SSCTR freeze verdict does not allow the freeze');
 const first=R6+'holdout/FIRST_EVALUATION.json',firstRaw=json(first),manifest=json(R6+'holdout/INDEPENDENCE_MANIFEST.json');
 assert.equal(firstRaw.sourceDigest,f1.sourceDigest,'The first evaluation must be bound to FREEZE-1');
 const before=new Map(f1.entries.map(e=>[e.path,e.sha256])),after=new Map(entries.map(e=>[e.path,e.sha256]));
 const interfacePath=R6+'holdout/INTERFACE_ONLY.md';
 assert.equal(before.get(interfacePath),after.get(interfacePath),'The holdout interface must not change');
 const engineering=json(AUDIT+'reviews/quality-engineering-review.json');
 const record={revision:'R6-FREEZE-2',frozenAt:new Date().toISOString(),node:process.version,sourceDigest,entries,
  predecessor:{revision:f1.revision,path:R6+'RUNTIME_FREEZE_R6.json',sourceDigest:f1.sourceDigest,frozenAt:f1.frozenAt},
  delta:{changed:entries.filter(e=>before.has(e.path)&&before.get(e.path)!==e.sha256).map(e=>({path:e.path,before:before.get(e.path),after:e.sha256})),added:entries.filter(e=>!before.has(e.path)).map(e=>e.path),removed:f1.entries.filter(e=>!after.has(e.path)).map(e=>e.path)},
  reason:{review:AUDIT+'reviews/quality-engineering-review.json',verdict:engineering.verdict?.engineeringStatus??null,findings:(engineering.findings??[]).map(f=>f.id),fixScopePinnedBy:[{path:'CoachingCore/test/r6-engineering-fixes.test.mjs',writtenAt:'2026-10-26T19:20:34Z',note:'Written from the engineering findings alone, before the holdout author handed back case summaries and before any evaluation output existed'},{path:'CoachingCore/test/r6-ssctr-r7-fixes.test.mjs',note:'Regression tests for the SSCTR round-7 binding defects D42–D46, recommendations R6, R7, R9 and R10, and one author-found return-entry defect; its D45 test also asserts D48'},{path:'CoachingCore/test/r6-ssctr-r8-fixes.test.mjs',note:'Regression tests for the SSCTR round-8 binding defects D47–D49, recommendations R11–R13, and one author-found restart change'},{path:'CoachingCore/test/r6-ssctr-r9-fixes.test.mjs',note:'Regression tests for the SSCTR round-9 binding defects D50 and D51 (runtime only, same policy hash)'},{path:'CoachingCore/test/r6-ssctr-r10-fixes.test.mjs',note:'Regression tests for the SSCTR round-10 binding defect D52 (runtime only, same policy hash): the probe-Z cases, later sessions of the same week, completion reports without loads, bodyweight exercises and the author-found conflicted report'},{path:'CoachingCore/test/r6-ssctr-r11-fixes.test.mjs',note:'Regression tests for the SSCTR round-11 binding defect D53 (runtime only, same policy hash): probe AH, sets after a re-establishment with a block-boundary set earned before the gap or by the re-establishment week'}],
   ssctrRounds:{dossiers:[AUDIT+'reviews/ssctr-dossier/REVISION_R6_POLICY_3.md',AUDIT+'reviews/ssctr-dossier/REVISION_R6_POLICY_4.md',AUDIT+'reviews/ssctr-dossier/REVISION_R6_POLICY_5.md',AUDIT+'reviews/ssctr-dossier/RUNTIME_DELTA_D50_D51.md',AUDIT+'reviews/ssctr-dossier/RUNTIME_DELTA_D52.md',AUDIT+'reviews/ssctr-dossier/RUNTIME_DELTA_D53.md'],disclosure:'SSCTR rounds 7 to 11 drove further fixes (D42–D53, R6, R7, R9–R13) plus three author-found changes: the return-entry week, found by an author probe of the return path; the run history cleared at a restart, found by an author check of a restart before a race; and a conflicted strength report that neither sets nor confirms a load, found by the author while testing D52. D50 to D53 are runtime-only and were checked by the SSCTR at the same policy hash before this freeze. They were made after the runtime author had seen the holdout author’s one-line case summaries in its hand-back; the runtime author never saw the corpus, the first evaluation or any evaluation output',
    weeklyReviewContract:'The SSCTR approvals hold when every elapsed week receives a gating weekly review, in order and after its last session, with unreported sessions reviewed as missed. A week without a gating review keeps the projection’s assumption that it was executed and logged (establishment, progression, block credit, achieved peaks and the strength resume clock). That path is outside the approval and is an owned gap to close before any use beyond the offline reference (SSCTR R18); holdout steps that skip weeks carry this assumption'}},
  policy:{revision:policy.revision,hash:policyHash,sha256:sha(policyFile),previousReviewedHash:'af2779fe0fc0e0a52f4b6371d3b360996687e57931b9b3feb878e9652f464910',reviewedSinceFreeze1:['e9c87e09d35496791c6d6894639652a4c7bd6cbf6f0b01299d57dd7352373f87','1046ad0ef1291068b309e229852b782e8a8f0eee478c3f8aec59facedd80a554']},
  ssctr:{path:AUDIT+'reviews/ssctr-policy-review.json',revision:review.revision,policyHash:review.policyHash,freezeVerdict:review.freezeVerdict},
  firstEvaluation:{path:first,sha256:sha(first),sourceDigest:firstRaw.sourceDigest,evaluatedAt:firstRaw.evaluatedAt,contentsInspectedByRuntimeAuthor:false,note:'Recorded once on FREEZE-1 before any fix; never re-run or overwritten'},
  holdout:{corpusSha256:manifest.corpusSha256,authorStartedAt:manifest.authorStartedAt,sealedAt:manifest.sealedAt,interfaceUnchanged:true},
  nextEvidence:'The sealed corpus is rerun once on FREEZE-2 as labelled challenge reuse (POSTFIX_EVALUATION_FREEZE2.json); the first evaluation stays the primary record'};
 fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({frozen:sourceDigest,entries:entries.length,changed:record.delta.changed.length,added:record.delta.added.length,removed:record.delta.removed.length}));
}
