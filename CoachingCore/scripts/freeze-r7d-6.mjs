// R7-D freeze 6 (node scripts/freeze-r7d-6.mjs): R7D-FREEZE-6, DOMAIN_COACHING_R7-D Phase 5 (the final corrective cycle the Founder authorized
// after the Phase 4 holdout, option A), on top of R7D-FREEZE-5 (bound commit 7272e9a, record 20c099d), which is superseded and never edited.
//  - Runtime: SSCTR-P4-F01 (a moderate or long return's entry is ahead until an exercise in use is executed: exercises never executed before the break
//    follow strengthEntryWeek and the D49 return steps), R7D-FC-01 on its path (band and assistance logs are evidence), QRE-P4-F01 (the
//    UNREPORTED_TRAINING question reads the credit of a projected start, whatever the week's phase). No new number.
//  - Tests: T42-T47 (test/r7d-phase5.test.mjs); T39-T41 moved into the suite (test/r7d-phase4-cq41.test.mjs, QRE-P4-K04); one legacy assertion
//    amended per SSCTR-P4-F01 CND-2 (test/r6-adaptation.test.mjs).
//  - Instruments for the new holdout (K03): R7D-HARNESS-9 and validation 9, R7D-INTERFACE-8, brief 8, the advisory checker, the seal R7D-SEAL-FINAL-2,
//    R7D-PREREG-8.
// It binds by SHA-256 the committed bytes of every file R7D-FREEZE-5 bound (current bytes), every source and test file, the R7-D instruments, the
// Phase 5 records and the human revalidation queue (unchanged: Phase 5 authorizes no append). It computes the source and manifest digests (canonical
// hash, src/value.mjs), records the suite (zero failures) and the three R7-B conformance checks (PASS, read-only), and binds the Phase 5 evidence
// manifest (its outputs must still hash as listed, on these source bytes) and the two independent reviews.
// It refuses when:
//  - a bound file is not committed, or the record exists already (never overwritten);
//  - the source delta from R7D-FREEZE-5 is not exactly r6-adaptation.mjs, r6-composition.mjs and r6-program.mjs; an existing test other than
//    r6-adaptation.test.mjs changed; a test file other than r7d-phase4-cq41.test.mjs and r7d-phase5.test.mjs was added;
//  - the policy, the catalog, the R6 and B0 records, the R7-B fixtures, product/ or canon/ changed since R7D-FREEZE-5;
//  - the queue changed since R7D-FREEZE-5;
//  - the diagnostic corpus, PREREG-1 to PREREG-7, the R7D-FREEZE-1 to -5 records, the Phase 3 to Phase 4 folders or the spent holdout final/ changed
//    since the Phase 4 checkpoint (cc0b56f); CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since it;
//  - the new holdout folder final2/ exists (the freeze precedes it);
//  - the evidence manifest is not a PASS or was made on other source bytes; either review is not a pass or judged another candidate; the commits
//    after the reviewed candidate do anything but add new files under the two Phase 5 review folders.
// It writes only CoachingCore/r7/d/RUNTIME_FREEZE_R7D_6.json.
//   node scripts/freeze-r7d-6.mjs --evidence <EVIDENCE_PHASE5.json> --ssctr <review.json> --engineering <review.json> --reviewed <commit>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7D-FREEZE-6',AUD='audits/domain-coaching-r7-d-2026-11-02',P5=`${AUD}/phase5`;
const PRED={revision:'R7D-FREEZE-5',commit:'7272e9a',recordCommit:'20c099d',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json'},PHASE4_CLOSE='cc0b56f';
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const SRC_DELTA=['M\tCoachingCore/src/r6-adaptation.mjs','M\tCoachingCore/src/r6-composition.mjs','M\tCoachingCore/src/r6-program.mjs'];
const TEST_MODIFIED=['CoachingCore/test/r6-adaptation.test.mjs'],TEST_ADDED=['CoachingCore/test/r7d-phase4-cq41.test.mjs','CoachingCore/test/r7d-phase5.test.mjs'];
const target=path.join(cc,'r7/d/RUNTIME_FREEZE_R7D_6.json');
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const refuse=why=>{throw Error('Freeze refused: '+why);};
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<28});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const quiet=(a,b,paths)=>spawnSync('git',['diff','--quiet',a,b,'--',...paths],{cwd:repo}).status===0;
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const prefix=(commit,f)=>{const base=spawnSync('git',['show',`${commit}:${f}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28}).stdout,now=fs.readFileSync(path.join(repo,f));return base.length>0&&now.subarray(0,base.length).equals(base);};
const head=git('rev-parse','HEAD').trim(),predCommit=git('rev-parse',PRED.commit).trim();
// Inputs unchanged since R7D-FREEZE-5; earlier instruments, records and the spent holdout unchanged since the Phase 4 checkpoint; no new holdout yet.
if(!quiet(predCommit,'HEAD',['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','product','canon',QUEUE]))refuse('an input changed since R7D-FREEZE-5 (policy, catalog, R6 or B0 records, R7-B fixtures, product/, canon/ or the queue)');
const EARLIER=[`${AUD}/diagnostic`,...['','_2','_3','_4','_5','_6','_7'].map(x=>`${AUD}/PREREGISTRATION_R7D${x}.md`),...[1,2,3,4,5].map(n=>`CoachingCore/r7/d/RUNTIME_FREEZE_R7D_${n}.json`),`${AUD}/phase3`,`${AUD}/phase31`,`${AUD}/phase32`,`${AUD}/phase33`,`${AUD}/phase34`,`${AUD}/phase35`,`${AUD}/phase4`,`${AUD}/final`,`${AUD}/PHASE4_CHECKPOINT.md`];
if(!quiet(PHASE4_CLOSE,'HEAD',EARLIER))refuse('an earlier instrument, record, freeze record or the spent holdout final/ changed since the Phase 4 checkpoint');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md'])if(!prefix(PHASE4_CLOSE,f))refuse(f+' is not append-only since the Phase 4 checkpoint');
if(fs.existsSync(path.join(repo,AUD,'final2')))refuse('the new holdout folder final2/ exists; the freeze precedes it');
// The source and test delta from R7D-FREEZE-5.
const delta={src:git('diff','--name-status',predCommit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',predCommit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)};
if(delta.src.join('|')!==SRC_DELTA.join('|'))refuse('the source delta is not r6-adaptation.mjs, r6-composition.mjs and r6-program.mjs: '+delta.src.join(', '));
const modified=delta.test.filter(l=>!l.startsWith('A\t')).map(l=>l.slice(2)).sort(),added=delta.test.filter(l=>l.startsWith('A\t')).map(l=>l.slice(2)).sort();
if(modified.join('|')!==TEST_MODIFIED.join('|'))refuse('existing tests changed beyond the disclosed assertion amendment: '+modified.join(', '));
if(added.join('|')!==[...TEST_ADDED].sort().join('|'))refuse('test files added beyond T39-T41 and T42-T47: '+added.join(', '));
// The bound files.
const ls=d=>fs.existsSync(path.join(repo,d))?fs.readdirSync(path.join(repo,d)).filter(f=>/\.(mjs|json|md|diff)$/.test(f)).map(f=>`${d}/${f}`):[];
const pred=json(PRED.record);
const list=[...Object.keys(pred.files),...ls('CoachingCore/src').filter(p=>p.endsWith('.mjs')),...ls('CoachingCore/test').filter(p=>p.endsWith('.mjs')),
 'CoachingCore/scripts/freeze-r7d-6.mjs','CoachingCore/scripts/verify-r7d-6.mjs',PRED.record,'CoachingCore/r7/d/VERIFICATION_R7D_5.json',
 ...ls(`${AUD}/harness`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/harness/lib`),...ls(`${AUD}/harness/validation`).filter(p=>p.endsWith('.mjs')),`${AUD}/harness/README.md`,
 `${AUD}/harness/validation/DEV_CASES_R7D_8.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_8.json`,`${AUD}/harness/validation/DEV_CASES_R7D_9.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_9.json`,
 ...['INTERFACE_DELTA_R7D_7.md','INTERFACE_DELTA_R7D_8.md','AUTHOR_BRIEF_FINAL_R7D_7.md','AUTHOR_BRIEF_FINAL_R7D_8.md','check-corpus.mjs','check-corpus-8.mjs','CASE_SCHEMA_R7D.json','INTERFACE_ONLY_R7D.md'].map(f=>`${AUD}/author/${f}`),
 `${AUD}/PREREGISTRATION_R7D_7.md`,`${AUD}/PREREGISTRATION_R7D_8.md`,`${AUD}/PHASE4_CHECKPOINT.md`,
 ...ls(P5),...ls(`${P5}/probes`),...ls(`${P5}/evidence`),...ls(`${P5}/reviews`),...ls(`${P5}/reviews/ssctr`),...ls(`${P5}/reviews/ssctr/probes`),...ls(`${P5}/reviews/engineering`),...ls(`${P5}/reviews/engineering/probes`),QUEUE];
const missing=list.filter(p=>!fs.existsSync(path.join(repo,p)));if(missing.length)refuse('bound files missing: '+missing.join(', '));
const files=Object.fromEntries([...new Set(list)].sort().map(p=>[p,shaRepo(p)]));
const shaHead=p=>{const r=spawnSync('git',['show',`${head}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const uncommitted=Object.entries(files).filter(([p,s])=>shaHead(p)!==s).map(([p])=>p);if(uncommitted.length)refuse('bound files differ from HEAD (commit first): '+uncommitted.slice(0,10).join(', '));
const srcFiles=Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('CoachingCore/src/')));
const sourceDigest=hash(srcFiles),manifestDigest=hash(files);
const run=(args,label)=>{const r=spawnSync(process.execPath,args,{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms'),node:process.version};
if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`],s);let j;try{j=JSON.parse(r.stdout);}catch{refuse(s+': no JSON');}if(j.result!=='PASS')refuse(s+': '+JSON.stringify(j.problems).slice(0,300));return [s,{result:j.result,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
const evPath=arg('--evidence'),ssPath=arg('--ssctr'),enPath=arg('--engineering'),reviewed=arg('--reviewed');if(!evPath||!ssPath||!enPath||!reviewed)refuse('give --evidence, --ssctr, --engineering and --reviewed');
const ev=json(evPath);
if(ev.result!=='PASS'||ev.problems?.length)refuse('the evidence manifest is not a PASS');
if(Object.entries(ev.runtimeSource).some(([p,h])=>srcFiles[p]!==h)||Object.keys(srcFiles).some(p=>ev.runtimeSource[p]!==srcFiles[p]))refuse('the evidence was made on other source bytes');
for(const [k,o] of Object.entries(ev.outputs))if(shaRepo(o.path)!==o.sha256)refuse('evidence output changed: '+k);
if(!quiet(reviewed,'HEAD',['CoachingCore/src','CoachingCore/test',`${AUD}/harness`,`${AUD}/author`,`${AUD}/PREREGISTRATION_R7D_8.md`]))refuse('a source, test, harness, author or pre-registration byte differs from the reviewed candidate ('+reviewed+')');
const REVIEW_DIRS=[`${P5}/reviews/ssctr/`,`${P5}/reviews/engineering/`],afterReview=git('diff','--name-status',reviewed,'HEAD').split('\n').filter(Boolean);
const notReviewRecords=afterReview.filter(l=>!(l.startsWith('A\t')&&REVIEW_DIRS.some(d=>l.slice(2).startsWith(d))));
if(notReviewRecords.length)refuse('after the reviewed candidate only new files under the two Phase 5 review folders are allowed: '+notReviewRecords.slice(0,10).join(', '));
const ss=json(ssPath),en=json(enPath);
if(!['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(ss.disposition))refuse('the SSCTR review disposition is '+ss.disposition);
if(!['READY','READY_WITH_CONDITIONS'].includes(en.verdict))refuse('the quality/reliability review verdict is '+en.verdict);
const fullReviewed=git('rev-parse',reviewed).trim();
if(!ss.candidate||!fullReviewed.startsWith(String(ss.candidate).slice(0,7)))refuse('the SSCTR review judged another candidate ('+ss.candidate+')');
if(!en.candidate||!fullReviewed.startsWith(String(en.candidate).slice(0,7)))refuse('the quality review judged another candidate ('+en.candidate+')');
const record={revision,mission:'DOMAIN_COACHING_R7-D Phase 5, the final corrective cycle (SSCTR-P4-F01 with R7D-FC-01 on its path; QRE-P4-F01; K03 instruments for one new independent holdout; F08 open)',commit:head,
 predecessor:{...PRED,commit:predCommit,sha256:shaRepo(PRED.record),note:'Superseded, not edited, never renamed. Its verifier (verify-r7d-5.mjs) now fails files-current by design: three source files, one test file and new harness files changed; no-final-holdout fails since Phase 4.'},
 created:new Date().toISOString(),delta:{...delta,modifiedTests:TEST_MODIFIED,addedTests:TEST_ADDED},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{path:evPath,sha256:shaRepo(evPath),outputs:ev.outputs,results:ev.results,red:ev.red,suite:ev.suite,directed:ev.directed,authority:ev.authority},
 reviews:{ssctr:{recordId:ss.recordId,path:ssPath,sha256:shaRepo(ssPath),disposition:ss.disposition,conditions:ss.conditionsForFreeze??ss.conditions??[]},qualityReliability:{recordId:en.recordId,path:enPath,sha256:shaRepo(enPath),verdict:en.verdict,conditions:en.conditionsForFreeze??en.conditions??[]},postReview:{reviewedRuntime:fullReviewed,changedSinceReviewed:afterReview}},
 disclosures:{ssctrFindings:ss.findings??null,engineeringFindings:en.findings??null},
 f08:{status:'F08_OPEN',form:'BLOCKED_BY_AUTHORITY (F08-BLOCK-G04, PCG-R7D-F08-r1); the Founder\'s D2 direction recorded, not implemented. Never declared resolved.'},
 noNewNumber:'Phase 5 adds no dose, threshold, count, length, increment, tolerance, cadence, percentage, ceiling, return recipe or clinical authority: the entry dose and return steps are the policy\'s strengthEntryWeek and strengthReturnSets (SSCTR D49), the band log reads repetitions as B0-C04 already states, and the question reads the projection the plan already holds against the reviewed entry and the 30-day window of operational.run.singleRunCeiling.',
 instruments:{harness:'R7D-HARNESS-9',validation:'R7D-HARNESS-VALIDATION-9',interface:'R7D-INTERFACE-8 (INTERFACE_ONLY_R7D.md + INTERFACE_DELTA_R7D_2.md to INTERFACE_DELTA_R7D_8.md)',brief:'R7D-AUTHOR-BRIEF-FINAL-8',checker:'check-corpus.mjs (errors) and check-corpus-8.mjs (advice)',seal:'R7D-SEAL-FINAL-2 (harness/seal-final-2.mjs)',prereg:{path:`${AUD}/PREREGISTRATION_R7D_8.md`,sha256:shaRepo(`${AUD}/PREREGISTRATION_R7D_8.md`)}},
 authorization:{path:`${P5}/AUTHORIZATION_PHASE5.md`,sha256:shaRepo(`${P5}/AUTHORIZATION_PHASE5.md`)},
 humanRevalidationQueue:{path:QUEUE,sha256:shaRepo(QUEUE),items:json(QUEUE).items.length,added:[],note:'Phase 5 authorizes no append; the queue is R7D-FREEZE-5\'s, byte for byte.'},
 bindingConditions:{inherited:{from:PRED.revision,record:PRED.record,note:'Every binding condition of R7D-FREEZE-5 travels unchanged with this runtime, except where a Phase 5 record supersedes it explicitly.'},added:'The conditions of the two Phase 5 reviews (reviews.*.conditions).'},
 finalHoldoutExists:false,spentHoldout:{path:`${AUD}/final`,note:'The Phase 4 holdout: evaluationCount 1, never evaluated again; its results, judgments and records are unchanged.'},V1_COACHING_AUTHORITY_READY:'NO',
 verifier:'node CoachingCore/scripts/verify-r7d-6.mjs (read-only; --suite also re-runs the suite and the conformance checks; --write writes only CoachingCore/r7/d/VERIFICATION_R7D_6.json)'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),record:path.relative(repo,target),sha256:shaRepo(path.relative(repo,target))},null,1));
