// R7-D freeze 2 (node scripts/freeze-r7d-2.mjs): R7D-FREEZE-2, DOMAIN_COACHING_R7-D Phase 3.1 (QE-R7D-P3-01 (a), (b) and P3-F01: a declared break is a
// record fact until a return applies it), on top of R7D-FREEZE-1 (bytes 4cabd18, record 6c03ca8), which is superseded and never edited. Lean form
// of scripts/freeze-r7d.mjs. It binds by SHA-256 the committed bytes of:
//  - every file R7D-FREEZE-1 bound, at its current bytes;
//  - every source and test file;
//  - the R7-D instruments for the final gate: harness R7D-HARNESS-3 and its validation 3, interface delta 3, final brief 2, R7D-PREREG-3;
//  - the Phase 3.1 authorization summary, probes, evidence, regressions and both reviews;
//  - the human revalidation queue and its Phase 3.1 integration record (the append names this freeze before this record exists).
// It computes a source digest and a manifest digest (canonical hash, src/value.mjs), records the suite (zero failures) and the three R7-B
// conformance checks (PASS, read-only), and binds the Phase 3.1 evidence manifest (its outputs must still hash as listed, on these source bytes).
// It refuses when:
//  - a bound file is not committed;
//  - a source file other than r6-adaptation.mjs differs from R7D-FREEZE-1, or an existing test other than the two disclosed assertion updates;
//  - the policy, catalog, B0 or R6 records, product/ or canon/ changed since R7D-FREEZE-1;
//  - the queue is not R7D-FREEZE-1's 230 items plus exactly the integrated items, each naming R7D-FREEZE-2;
//  - CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since R7D-FREEZE-1;
//  - either review is not a pass, or a source or test byte differs from the reviewed runtime;
//  - a final holdout exists.
// One record, never overwritten. It writes only CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json.
//   node scripts/freeze-r7d-2.mjs --evidence <EVIDENCE_PHASE31.json> --ssctr <recheck.json> --engineering <check.json> --reviewed <commit>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7D-FREEZE-2',AUD='audits/domain-coaching-r7-d-2026-11-02',P31=`${AUD}/phase31`;
const PRED={revision:'R7D-FREEZE-1',commit:'4cabd18def76f88d170a90723cef422989f502c7',recordCommit:'6c03ca8',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QPIN=`${P31}/QUEUE_INTEGRATION_R7D.json`;
const UPDATED_TESTS=['CoachingCore/test/r7a1-composition.test.mjs','CoachingCore/test/r7c-phase5-cc.test.mjs'];
const target=path.join(cc,'r7/d/RUNTIME_FREEZE_R7D_2.json');
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const refuse=why=>{throw Error('Freeze refused: '+why);};
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const head=git('rev-parse','HEAD').trim();
// Inputs unchanged since R7D-FREEZE-1; the mission and the ledger append-only since then; no final holdout yet.
const UNCHANGED=['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','product','canon'];
if(spawnSync('git',['diff','--quiet',PRED.commit,'HEAD','--',...UNCHANGED],{cwd:repo}).status!==0)refuse('an input changed since R7D-FREEZE-1 (policy, catalog, records, product/ or canon/)');
const p2=git('rev-parse','cdff248').trim();if(spawnSync('git',['diff','--quiet',p2,'HEAD','--',`${AUD}/diagnostic`,`${AUD}/PREREGISTRATION_R7D.md`],{cwd:repo}).status!==0)refuse('the diagnostic corpus, its manifests, its evaluation or PREREG-1 changed since the Phase 2 checkpoint');
if(spawnSync('git',['diff','--quiet',PRED.recordCommit,'HEAD','--',`${AUD}/PREREGISTRATION_R7D_2.md`,PRED.record],{cwd:repo}).status!==0)refuse('PREREG-2 or the R7D-FREEZE-1 record changed');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${PRED.commit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since R7D-FREEZE-1');}
if(fs.existsSync(path.join(repo,AUD,'final')))refuse('a final holdout folder exists; the freeze precedes it');
// The source and test delta from R7D-FREEZE-1.
const delta={src:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)};
if(delta.src.join('|')!=='M\tCoachingCore/src/r6-adaptation.mjs')refuse('the source delta is not r6-adaptation.mjs alone: '+delta.src.join(', '));
const modifiedTests=delta.test.filter(l=>!l.startsWith('A\t')).map(l=>l.slice(2));
if(modifiedTests.sort().join('|')!==[...UPDATED_TESTS].sort().join('|'))refuse('existing tests changed beyond the two disclosed assertion updates: '+modifiedTests.join(', '));
// The queue: R7D-FREEZE-1's items as they were, then exactly the integrated items, each naming this freeze.
const pin=json(QPIN),q=json(QUEUE),q0=JSON.parse(spawnSync('git',['show',`${PRED.commit}:${QUEUE}`],{cwd:repo,encoding:'utf8',maxBuffer:1<<28}).stdout);
if(JSON.stringify(q.items.slice(0,q0.items.length))!==JSON.stringify(q0.items))refuse('the queue items of R7D-FREEZE-1 changed');
const added=q.items.slice(q0.items.length);
if(pin.previousItems!==q0.items.length||pin.afterItems!==q.items.length||JSON.stringify(added.map(i=>i.queue_id))!==JSON.stringify(pin.queueIds))refuse('the queue additions do not match the integration record');
if(!added.every(i=>JSON.stringify(i.target).includes(revision)))refuse('an integrated queue item does not name '+revision);
if(pin.queueSha256After!==shaRepo(QUEUE))refuse('the queue bytes differ from the integration record');
// The bound files.
const ls=d=>fs.existsSync(path.join(repo,d))?fs.readdirSync(path.join(repo,d)).filter(f=>/\.(mjs|json|md)$/.test(f)).map(f=>`${d}/${f}`):[];
const pred=json(PRED.record);
const list=[...Object.keys(pred.files),...ls('CoachingCore/src').filter(p=>p.endsWith('.mjs')),...ls('CoachingCore/test').filter(p=>p.endsWith('.mjs')),
 'CoachingCore/scripts/freeze-r7d-2.mjs','CoachingCore/scripts/verify-r7d-2.mjs',PRED.record,
 ...ls(`${AUD}/harness`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/harness/lib`),...ls(`${AUD}/harness/validation`).filter(p=>p.endsWith('.mjs')),`${AUD}/harness/README.md`,
 `${AUD}/harness/validation/DEV_CASES_R7D_3.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_3.json`,
 ...['INTERFACE_DELTA_R7D_3.md','AUTHOR_BRIEF_FINAL_R7D_2.md'].map(f=>`${AUD}/author/${f}`),`${AUD}/PREREGISTRATION_R7D_3.md`,
 `${P31}/AUTHORIZATION_PHASE31.md`,...ls(`${P31}/probes`),...ls(`${P31}/evidence`),...ls(`${P31}/regression/diagnostic`),...ls(`${P31}/regression/generated`),
 ...ls(`${P31}/reviews`),...ls(`${P31}/reviews/ssctr`),...ls(`${P31}/reviews/ssctr/probes`),...ls(`${P31}/reviews/engineering`),...ls(`${P31}/reviews/engineering/probes`),
 QUEUE,QPIN,`${P31}/integrate-queue-r7d.mjs`];
const missing=list.filter(p=>!fs.existsSync(path.join(repo,p)));if(missing.length)refuse('bound files missing: '+missing.join(', '));
const files=Object.fromEntries([...new Set(list)].sort().map(p=>[p,shaRepo(p)]));
const shaHead=p=>{const r=spawnSync('git',['show',`${head}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const uncommitted=Object.entries(files).filter(([p,s])=>shaHead(p)!==s).map(([p])=>p);if(uncommitted.length)refuse('bound files differ from HEAD (commit first): '+uncommitted.slice(0,10).join(', '));
const srcFiles=Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('CoachingCore/src/')));
const sourceDigest=hash(srcFiles),manifestDigest=hash(files);
if(pin.freeze?.sourceDigest!==sourceDigest)refuse('the queue integration names another source digest');
// Evidence on these bytes: the suite and the conformance checks (read-only; their stdout is the report).
const run=(args,label)=>{const r=spawnSync(process.execPath,args,{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms'),node:process.version};
if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`],s);let j;try{j=JSON.parse(r.stdout);}catch{refuse(s+': no JSON');}if(j.result!=='PASS')refuse(s+': '+JSON.stringify(j.problems).slice(0,300));return [s,{result:j.result,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
// The Phase 3.1 evidence manifest: PASS, on these source bytes, with every output it lists unchanged.
const evPath=arg('--evidence'),ssPath=arg('--ssctr'),enPath=arg('--engineering'),reviewed=arg('--reviewed');if(!evPath||!ssPath||!enPath||!reviewed)refuse('give --evidence, --ssctr, --engineering and --reviewed');
const ev=json(evPath);
if(ev.result!=='PASS'||ev.problems?.length)refuse('the evidence manifest is not a PASS');
if(Object.entries(ev.runtimeSource).some(([p,h])=>srcFiles[p]!==h)||Object.keys(srcFiles).some(p=>ev.runtimeSource[p]!==srcFiles[p]))refuse('the evidence was made on other source bytes');
for(const [k,o] of Object.entries(ev.outputs))if(shaRepo(o.path)!==o.sha256)refuse('evidence output changed: '+k);
// Both reviews judged the runtime bytes of the reviewed commit: no source or test byte may differ since.
if(spawnSync('git',['diff','--quiet',reviewed,'HEAD','--','CoachingCore/src','CoachingCore/test'],{cwd:repo}).status!==0)refuse('a source or test byte differs from the reviewed runtime ('+reviewed+')');
const ss=json(ssPath),en=json(enPath);
if(!['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(ss.disposition))refuse('the SSCTR recheck disposition is '+ss.disposition);
if(!['READY','READY_WITH_CONDITIONS'].includes(en.verdict))refuse('the engineering check verdict is '+en.verdict);
const postReview={reviewedRuntime:git('rev-parse',reviewed).trim(),changedSinceReviewed:git('diff','--name-status',reviewed,'HEAD').split('\n').filter(Boolean)};
const record={revision,mission:'DOMAIN_COACHING_R7-D Phase 3.1 (narrow closure of QE-R7D-P3-01 (a), (b) and P3-F01: interruption fact persistence)',commit:head,
 predecessor:{...PRED,sha256:shaRepo(PRED.record),note:'Superseded, not edited. Its verifier (verify-r7d.mjs) now fails files-current by design: r6-adaptation.mjs and two test files changed.'},
 created:new Date().toISOString(),delta:{...delta,updatedTests:UPDATED_TESTS},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{path:evPath,sha256:shaRepo(evPath),outputs:ev.outputs,results:ev.results,red:ev.red,suite:ev.suite,directed:ev.directed,authority:ev.authority},
 rule:{id:'R7D-P31-FACT-PERSISTENCE',text:'A break a review states (an interruption object with a value, beginning by the review) is recorded in the completed-work record (INTERRUPTION_DECLARED) whatever that review decides, the early clinical and eligibility routes included; a review refused as invalid input before it is read (contract, clock, week, list shape, carried state or model integrity) records nothing. The break stays in force until a return (REESTABLISH) is decided at or after it, or a newer declaration replaces it. A later review that states no break reads it as if it stated it: a weekly review or a return report applies it by the existing return recipe; another event kind is asked and applies nothing; a clinical route still comes first; a break whose own reason is clinical routes to a human again (F08 unchanged). The event that carried it is never applied with it.',
  founder:'D1-D3 (phase31/AUTHORIZATION_PHASE31.md): fact retention is not decision application'},
 noNewNumber:'Phase 3.1 adds no dose, threshold, increment, tolerance or cadence (SSCTR CF-P31-06): the re-entry is the unchanged R6-NONCLINICAL-RETURN recipe. Offline synthetic shadow reference only; V1_COACHING_AUTHORITY_READY stays NO.',
 // The open domain defect the SSCTR routes to the Founder (CF-P31-02, CF-P31-03): never an envelope, never an allowed residual.
 openDefect:{id:'SSCTR-P31-F02',status:'OPEN: FOUNDER DECISION BEFORE PHASE 4',safe:false,
  text:'A newer stated break for a different, disjoint period ends the retention of a kept, unapplied one: the kept break\'s declared days leave the factual state and the re-entry is classed by the newer stop alone (a 14-day holiday kept, then a 7-day trip: SHORT, EASY 45/34, LONG 65, then THRESHOLD 41, where the 21-day stop declared at once gives MODERATE, EASY 15, LONG 20). UNREPORTED_TRAINING and the D18 ceiling do not protect against this under-classification. P17 counts the newer declaration as resolution and P08 passes, so no automated property detects it; a holdout case with two disjoint declared stops before an eligible review exercises it and is domain-judged without envelope. Same as R7D-FREEZE-1 when the newer break is stated in a weekly review; better than it otherwise. It conflicts with Founder D2 ("in every case the fact survives"); whether its correction is required before Phase 4 is the Founder\'s decision. Options left open by the SSCTR: ask whether the newer break corrects the kept one or is a separate stop (the existing episode question, I9), or read contiguous declared stops with no training between as one stop (against I9 as written).',
  reproduction:`${P31}/reviews/ssctr/probes/p4-newer-replaces.mjs`},
 disclosures:{
  f08:{ids:['QE-R7D-P31-01','SSCTR-P31-F03'],text:'A break whose own reason is clinical is kept and, after qualified clearance, routes to a human at every later decision, also while the athlete trains and reports normally; no truthful conforming input leaves it. Only a newer, different declaration replaces it, and that exit is not uniformly conservative (a later nonclinical trip replaces an injury break and resumes SHORT with threshold work; relabelling the same dates as nonclinical gives MODERATE). Fails closed (no dose). Owners: Founder and PCG with the G04 owners, and the SSCTR; trigger: before any consumer use of the kept-break rule or any V1 authority claim.'},
  residuals:['SSCTR-P31-F01: days held after a kept break\'s stated end date are neither break nor asked (SHORT re-entry after a possibly longer real stop); same as a return report with the same dates; with F07','SSCTR-P31-F04: an event asked because a break is kept takes effect only if re-sent after the return (no held signal); consumer condition','SSCTR-P31-F05 / QE-R7D-P31-08: a decision that returns no record leaves it unchanged; the client keeps the previous one (now stated in INTERFACE-3)','QE-R7D-P31-03: an applied break stated again with a new event id is applied again (re-anchored re-entry, as R-DX02-2); consumer condition: state a break once, correct it with episodeId','QE-R7D-P31-11: a partial newer declaration replaces a complete kept break, a clinical one included; later decisions ask (fail-closed)','QE-R7D-P31-12: an open-ended kept break ends the day before its applying review (as if stated there); inputHash is a consistency check, not authentication','QE-R7D-P31-10: a replay with the same event id and other break facts is neither recorded nor refused','QE-R7D-P31-09: the record is append-only by fact, not by position','QE-R7D-P31-04: PREREG-3 Δ5 is a scoped relaxation of P11/P12; the re-send of the carrying event is a consumer condition no property measures','The declaring review\'s current demonstration is not kept with the break (more conservative entry)'],
  ssctrFindings:ss.findings??null,engineeringFindings:en.findings??null},
 routed:[{ids:['SSCTR-P31-F02'],to:'Founder (D2 interpretation), then the next authorized runtime mission'},{ids:['QE-R7D-P31-01','SSCTR-P31-F03'],to:'Founder/PCG with G04 owners (F08), SSCTR; G03 for the consumer path and the relabelling incentive'},{ids:['SSCTR-P31-F01'],to:'with F07 (Founder/PCG, SSCTR)'},{ids:['SSCTR-P31-F04'],to:'next runtime mission (optional held signal for the break ask)'},{ids:['QE-R7D-P31-07','QE-R7D-P31-12 (forged row)'],to:'Security (privacy owner), before any real-data consumer'}],
 testGaps:{mutationSurvivors:{from:'R7D-ENGINEERING-PHASE31-CHECK-1 (CF-5; QE-R7D-P31-05)',first:'QM31-07 (an early return that drops the carried record survives all 921 tests; caught only by harness P10)',note:'Owner Engineering; trigger the next authorized runtime phase; no test change in this phase'},inherited:'The R7D-FREEZE-1 test gaps (QM10, QM16, QM18, QM19, QM21, QM23, QM24) stand'},
 reviews:{ssctr:{recordId:ss.recordId,path:ssPath,sha256:shaRepo(ssPath),disposition:ss.disposition,conditions:ss.conditionsForFreeze??ss.conditions??[]},engineering:{recordId:en.recordId,path:enPath,sha256:shaRepo(enPath),verdict:en.verdict,conditions:en.conditionsForFreeze??en.conditions??[]},postReview},
 instruments:{harness:'R7D-HARNESS-3',prereg:{path:`${AUD}/PREREGISTRATION_R7D_3.md`,sha256:shaRepo(`${AUD}/PREREGISTRATION_R7D_3.md`),revision:'R7D-PREREG-3'},interface:'R7D-INTERFACE-3 (INTERFACE_ONLY_R7D.md + INTERFACE_DELTA_R7D_2.md + INTERFACE_DELTA_R7D_3.md)',finalBrief:`${AUD}/author/AUTHOR_BRIEF_FINAL_R7D_2.md`,validation:`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_3.json`},
 authorization:{path:`${P31}/AUTHORIZATION_PHASE31.md`,sha256:shaRepo(`${P31}/AUTHORIZATION_PHASE31.md`)},
 humanRevalidationQueue:{path:QUEUE,sha256:shaRepo(QUEUE),previousItems:q0.items.length,items:q.items.length,added:added.map(i=>({queue_id:i.queue_id,decision_id:i.decision_id,decision_revision:i.decision_revision})),integration:{path:QPIN,sha256:shaRepo(QPIN)}},
 bindingConditions:{inherited:{from:PRED.revision,record:PRED.record,note:'Every binding condition of R7D-FREEZE-1 (the R7-C conditions, R7B2-C1..C4, F03-B C1-C9 with PCG I-1, the consent consumer condition and both Phase 3 reviews\' conditions) travels unchanged with this runtime, except the G03 consumer conditions on re-declaring a break, which this phase retires (R7D-PREREG-3 Δ8).'},
  added:['C3, unchanged and now load-bearing for the kept break: the client carries the completed-work record exactly as returned, INTERRUPTION_DECLARED rows included; a qualified clearance drops only the clinical continuation state','The conditions of the two Phase 3.1 reviews, listed under reviews']},
 testChanges:{updatedAssertions:UPDATED_TESTS,why:'Each encoded QE-R7D-P3-01: R7-A.1 C4 asserted order independence while a 16-day return asked (startedAt) and the unavailable day was applied VALID on the plan that ignored the break; R7-C QE-R7C-01 asserted VALID after the clearance of an illness break that was dropped. Both fail on R7D-FREEZE-1 and pass on this runtime (evidence red.updatedAssertions); the R7-A.1 test now also asserts that both orders agree once the break is completed.'},
 finalHoldoutExists:false,V1_COACHING_AUTHORITY_READY:'NO',
 verifier:'node CoachingCore/scripts/verify-r7d-2.mjs (read-only; --suite also re-runs the suite and the conformance checks; --write writes only CoachingCore/r7/d/VERIFICATION_R7D_2.json)'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),record:path.relative(repo,target),sha256:shaRepo(path.relative(repo,target))},null,1));
