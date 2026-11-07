// R7-D freeze 5 (node scripts/freeze-r7d-5.mjs): R7D-FREEZE-5, DOMAIN_COACHING_R7-D Phase 3.4 (SSCTR-P33-F01 under the Founder's direction A; the
// re-entry week contract, QE-R7D-P33-01; the correction and late-evidence re-reads of a separate-breaks return; R-F08-1 of PCG-R7D-F08-r1; F08 stays
// OPEN, blocked by authority), on top of R7D-FREEZE-4 (bound files b242237, record 8bbbb8e), which is superseded and never edited. Lean form of
// scripts/freeze-r7d-4.mjs. It binds by SHA-256 the committed bytes of:
//  - every file R7D-FREEZE-4 bound, at its current bytes;
//  - every source and test file;
//  - the R7-D instruments for the final gate: harness R7D-HARNESS-6 and its validation 6, interface delta 6, final brief 5, R7D-PREREG-6;
//  - the Phase 3.4 authorization summary, decision request and records (SSCTR, PCG), F08 benchmark and proposal, probes, evidence, regressions and
//    both reviews;
//  - the human revalidation queue after the one authorized append (HQ-R7D-SSCTR-P33-RECHECK) and its integration record.
// It computes a source digest and a manifest digest (canonical hash, src/value.mjs), records the suite (zero failures) and the three R7-B
// conformance checks (PASS, read-only), and binds the Phase 3.4 evidence manifest (its outputs must still hash as listed, on these source bytes).
// It refuses when:
//  - a bound file is not committed;
//  - a source file other than r6-adaptation.mjs differs from R7D-FREEZE-4, or an existing test other than the disclosed Phase 3.3 and 3.2 files;
//  - the policy, catalog, B0 or R6 records, product/ or canon/ changed since R7D-FREEZE-4;
//  - the queue differs from R7D-FREEZE-4's by anything but the one authorized item and its addendum key, appended after every earlier item;
//  - the diagnostic corpus, PREREG-1 to PREREG-5, the R7D-FREEZE-1/-2/-3/-4 records or the Phase 3 / 3.1 / 3.2 / 3.3 folders changed;
//  - CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since the Phase 3.3 checkpoint (3edf3c5);
//  - either review is not a pass, or a source or test byte differs from the reviewed runtime;
//  - a final holdout exists.
// One record, never overwritten. It writes only CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json.
//   node scripts/freeze-r7d-5.mjs --evidence <EVIDENCE_PHASE34.json> --ssctr <recheck.json> --engineering <check.json> --reviewed <commit>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7D-FREEZE-5',AUD='audits/domain-coaching-r7-d-2026-11-02',P34=`${AUD}/phase34`;
const PRED={revision:'R7D-FREEZE-4',commit:'b2422376b04e444acd64504d9798db47ac0e079a',recordCommit:'8bbbb8e',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json'};
const PHASE33_CLOSE='3edf3c5';
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_ITEM='HQ-R7D-SSCTR-P33-RECHECK',QUEUE_RECORD=`${P34}/QUEUE_INTEGRATION_R7D_P34.json`,QUEUE_KEY='r7d_p34_queue_addendum';
const UPDATED_TESTS=['CoachingCore/test/r7d-phase32.test.mjs','CoachingCore/test/r7d-phase33.test.mjs'];
const target=path.join(cc,'r7/d/RUNTIME_FREEZE_R7D_5.json');
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const refuse=why=>{throw Error('Freeze refused: '+why);};
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<28});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const quiet=(a,b,paths)=>spawnSync('git',['diff','--quiet',a,b,'--',...paths],{cwd:repo}).status===0;
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const head=git('rev-parse','HEAD').trim(),predCommit=git('rev-parse',PRED.commit).trim();
// Inputs unchanged since R7D-FREEZE-4; the earlier instruments and records unchanged; the mission and the ledger append-only; no final holdout yet.
if(!quiet(predCommit,'HEAD',['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','product','canon']))refuse('an input changed since R7D-FREEZE-4 (policy, catalog, records, product/ or canon/)');
if(!quiet(git('rev-parse','cdff248').trim(),'HEAD',[`${AUD}/diagnostic`,`${AUD}/PREREGISTRATION_R7D.md`]))refuse('the diagnostic corpus, its manifests, its evaluation or PREREG-1 changed since the Phase 2 checkpoint');
if(!quiet(PHASE33_CLOSE,'HEAD',[`${AUD}/PREREGISTRATION_R7D_2.md`,`${AUD}/PREREGISTRATION_R7D_3.md`,`${AUD}/PREREGISTRATION_R7D_4.md`,`${AUD}/PREREGISTRATION_R7D_5.md`,'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json',PRED.record,'CoachingCore/r7/d/VERIFICATION_R7D_4.json',`${AUD}/phase33`,`${AUD}/phase32`,`${AUD}/phase31`,`${AUD}/phase3`]))refuse('PREREG-2 to -5, the R7D-FREEZE-1 to -4 records or the Phase 3 to 3.3 folders changed');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${PHASE33_CLOSE}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since the Phase 3.3 checkpoint');}
if(fs.existsSync(path.join(repo,AUD,'final')))refuse('a final holdout folder exists; the freeze precedes it');
// The source and test delta from R7D-FREEZE-4.
const delta={src:git('diff','--name-status',predCommit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',predCommit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)};
if(delta.src.join('|')!=='M\tCoachingCore/src/r6-adaptation.mjs|M\tCoachingCore/src/r6-composition.mjs')refuse('the source delta is not r6-adaptation.mjs and r6-composition.mjs: '+delta.src.join(', '));
const modifiedTests=delta.test.filter(l=>!l.startsWith('A\t')).map(l=>l.slice(2));
if(modifiedTests.sort().join('|')!==[...UPDATED_TESTS].sort().join('|'))refuse('existing tests changed beyond the disclosed Phase 3.3 and 3.2 assertion updates: '+modifiedTests.join(', '));
// The queue: R7D-FREEZE-4's bytes plus exactly the one authorized item, appended, with its addendum key and integration record.
const pred=json(PRED.record),q=json(QUEUE),qb=JSON.parse(spawnSync('git',['show',`${predCommit}:${QUEUE}`],{cwd:repo,encoding:'utf8',maxBuffer:1<<28}).stdout),qr=fs.existsSync(path.join(repo,QUEUE_RECORD))?json(QUEUE_RECORD):null;
if(pred.files[QUEUE]!==createHash('sha256').update(spawnSync('git',['show',`${predCommit}:${QUEUE}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28}).stdout).digest('hex'))refuse('the queue at R7D-FREEZE-4 differs from the bytes it bound');
if(q.items.length!==qb.items.length+1||JSON.stringify(q.items.slice(0,qb.items.length))!==JSON.stringify(qb.items)||q.items.at(-1).queue_id!==QUEUE_ITEM)refuse('the queue is not R7D-FREEZE-4\'s plus the one authorized item, appended');
if(Object.keys(qb).some(k=>k!=='items'&&JSON.stringify(q[k])!==JSON.stringify(qb[k]))||Object.keys(q).filter(k=>!(k in qb)).join('|')!==QUEUE_KEY)refuse('the queue\'s other keys changed beyond the Phase 3.4 addendum');
if(!qr||qr.queueSha256After!==shaRepo(QUEUE)||qr.queueIds?.join('|')!==QUEUE_ITEM||qr.problems?.length)refuse('the queue integration record does not match the queue');
// The bound files.
const ls=d=>fs.existsSync(path.join(repo,d))?fs.readdirSync(path.join(repo,d)).filter(f=>/\.(mjs|json|md|diff)$/.test(f)).map(f=>`${d}/${f}`):[];
const list=[...Object.keys(pred.files),...ls('CoachingCore/src').filter(p=>p.endsWith('.mjs')),...ls('CoachingCore/test').filter(p=>p.endsWith('.mjs')),
 'CoachingCore/scripts/freeze-r7d-5.mjs','CoachingCore/scripts/verify-r7d-5.mjs',PRED.record,'CoachingCore/r7/d/VERIFICATION_R7D_4.json',
 ...ls(`${AUD}/harness`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/harness/lib`),...ls(`${AUD}/harness/validation`).filter(p=>p.endsWith('.mjs')),`${AUD}/harness/README.md`,
 `${AUD}/harness/validation/DEV_CASES_R7D_6.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_6.json`,
 ...['INTERFACE_DELTA_R7D_6.md','AUTHOR_BRIEF_FINAL_R7D_5.md'].map(f=>`${AUD}/author/${f}`),`${AUD}/PREREGISTRATION_R7D_6.md`,
 `${P34}/AUTHORIZATION_PHASE34.md`,`${P34}/integrate-queue-r7d-p33.mjs`,QUEUE_RECORD,...ls(`${P34}/policy`),...ls(`${P34}/policy/prototype`),...ls(`${P34}/policy/prototype/out`),...ls(`${P34}/policy/ssctr-probes`),...ls(`${P34}/policy/ssctr-probes/out`),
 ...ls(`${P34}/f08`),...ls(`${P34}/probes`),...ls(`${P34}/probes/out`),...ls(`${P34}/evidence`),...ls(`${P34}/regression/diagnostic`),...ls(`${P34}/regression/generated`),
 ...ls(`${P34}/reviews`),...ls(`${P34}/reviews/ssctr`),...ls(`${P34}/reviews/ssctr/probes`),...ls(`${P34}/reviews/ssctr/probes/out`),...ls(`${P34}/reviews/engineering`),...ls(`${P34}/reviews/engineering/probes`),...ls(`${P34}/reviews/engineering/probes/out`),QUEUE];
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
if(!quiet(reviewed,'HEAD',['CoachingCore/src','CoachingCore/test',`${AUD}/harness/lib`,`${AUD}/harness/r7d-harness.mjs`]))refuse('a source, test or harness byte differs from the reviewed candidate ('+reviewed+')');
const ss=json(ssPath),en=json(enPath);
if(!['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(ss.disposition))refuse('the SSCTR recheck disposition is '+ss.disposition);
if(!['READY','READY_WITH_CONDITIONS'].includes(en.verdict))refuse('the quality/reliability check verdict is '+en.verdict);
if(ss.candidate&&!git('rev-parse',reviewed).trim().startsWith(String(ss.candidate).slice(0,7)))refuse('the SSCTR recheck judged another candidate ('+ss.candidate+')');
if(en.candidate&&!git('rev-parse',reviewed).trim().startsWith(String(en.candidate).slice(0,7)))refuse('the quality check judged another candidate ('+en.candidate+')');
const postReview={reviewedRuntime:git('rev-parse',reviewed).trim(),changedSinceReviewed:git('diff','--name-status',reviewed,'HEAD').split('\n').filter(Boolean)};
const proposed=[ss.proposedHumanRevalidation?.item?.queue_id??null,en.proposedHumanRevalidation?.item?.queue_id??null].filter(Boolean);
const decision=json(`${P34}/policy/SSCTR_P34_DECISION_R7D.json`),pcg=json(`${P34}/policy/PCG_F08_AUTHORITY_R7D.json`);
const record={revision,mission:'DOMAIN_COACHING_R7-D Phase 3.4 (SSCTR-P33-F01 under direction A; QE-R7D-P33-01; corrections of a separate-breaks return; R-F08-1; F08 open)',commit:head,
 predecessor:{...PRED,commit:predCommit,sha256:shaRepo(PRED.record),note:'Superseded, not edited. Its verifier (verify-r7d-4.mjs) now fails files-current by design: r6-adaptation.mjs, two test files and the harness files changed.'},
 created:new Date().toISOString(),delta:{...delta,updatedTests:UPDATED_TESTS},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{path:evPath,sha256:shaRepo(evPath),outputs:ev.outputs,results:ev.results,red:ev.red,suite:ev.suite,directed:ev.directed,authority:ev.authority},
 decisions:{ssctr:{recordId:decision.recordId,path:`${P34}/policy/SSCTR_P34_DECISION_R7D.json`,sha256:shaRepo(`${P34}/policy/SSCTR_P34_DECISION_R7D.json`)},pcg:{recordId:pcg.recordId,path:`${P34}/policy/PCG_F08_AUTHORITY_R7D.json`,sha256:shaRepo(`${P34}/policy/PCG_F08_AUTHORITY_R7D.json`),outcome:pcg.outcome??null}},
 f08:{status:'F08_OPEN',form:'BLOCKED_BY_AUTHORITY (F08-BLOCK-G04, PCG-R7D-F08-r1): no clearance input, no S5/S6; R-F08-1 implemented (a clinical-cause episode stays clinical); KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY, qualified. Never declared resolved.',owner:'G04 qualified professional (unavailable); the Founder appoints and funds one (trigger T1)'},
 noNewNumber:'Phase 3.4 adds no dose, threshold, count, length, increment, tolerance, cadence, percentage, ceiling, return recipe or clinical authority: the class table, the R6-NONCLINICAL-RETURN recipe, the evidence reducer\'s per-sport COMPLETED_SESSIONS rule and the plan\'s own week are existing authority; R-F08-1 restricts an existing correction path. Offline synthetic shadow reference only; V1_COACHING_AUTHORITY_READY stays NO.',
 reviews:{ssctr:{recordId:ss.recordId,path:ssPath,sha256:shaRepo(ssPath),disposition:ss.disposition,conditions:ss.conditionsForFreeze??ss.conditions??[]},qualityReliability:{recordId:en.recordId,path:enPath,sha256:shaRepo(enPath),verdict:en.verdict,conditions:en.conditionsForFreeze??en.conditions??[]},postReview},
 disclosures:{ssctrFindings:ss.findings??null,engineeringFindings:en.findings??null},
 instruments:{harness:'R7D-HARNESS-6',prereg:{path:`${AUD}/PREREGISTRATION_R7D_6.md`,sha256:shaRepo(`${AUD}/PREREGISTRATION_R7D_6.md`),revision:'R7D-PREREG-6'},interface:'R7D-INTERFACE-6 (INTERFACE_ONLY_R7D.md + INTERFACE_DELTA_R7D_2.md to INTERFACE_DELTA_R7D_6.md)',finalBrief:`${AUD}/author/AUTHOR_BRIEF_FINAL_R7D_5.md`,validation:`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_6.json`},
 authorization:{path:`${P34}/AUTHORIZATION_PHASE34.md`,sha256:shaRepo(`${P34}/AUTHORIZATION_PHASE34.md`)},
 humanRevalidationQueue:{path:QUEUE,sha256:shaRepo(QUEUE),items:q.items.length,added:[QUEUE_ITEM],integration:{path:QUEUE_RECORD,sha256:shaRepo(QUEUE_RECORD)},proposed,note:`The Founder's Phase 3.4 authorization appended ${QUEUE_ITEM}, naming R7D-FREEZE-4 (the freeze its SSCTR record judged), by its owner (Chief / Founder); every earlier item is unchanged. Any item proposed in Phase 3.4 stays proposed: this phase authorizes no other append.`},
 bindingConditions:{inherited:{from:PRED.revision,record:PRED.record,note:'Every binding condition of R7D-FREEZE-4 travels unchanged with this runtime, except where a Phase 3.4 record supersedes it explicitly.'},added:['The conditions of the Phase 3.4 SSCTR decision, the PCG F08 authority form and the two Phase 3.4 reviews, listed under decisions and reviews']},
 finalHoldoutExists:false,V1_COACHING_AUTHORITY_READY:'NO',
 verifier:'node CoachingCore/scripts/verify-r7d-5.mjs (read-only; --suite also re-runs the suite and the conformance checks; --write writes only CoachingCore/r7/d/VERIFICATION_R7D_5.json)'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),record:path.relative(repo,target),sha256:shaRepo(path.relative(repo,target))},null,1));
