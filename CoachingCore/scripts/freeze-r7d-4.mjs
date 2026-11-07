// R7-D freeze 4 (node scripts/freeze-r7d-4.mjs): R7D-FREEZE-4, DOMAIN_COACHING_R7-D Phase 3.3 (SSCTR-P32-F01: training between two separate breaks
// re-enters the athlete only by a whole week of the plan executed completely; anything less is a fact of the stop), on top of R7D-FREEZE-3 (bound
// files aeafc83, record c938b53), which is superseded and never edited. Lean form of scripts/freeze-r7d-3.mjs. It binds by SHA-256 the committed
// bytes of:
//  - every file R7D-FREEZE-3 bound, at its current bytes;
//  - every source and test file;
//  - the R7-D instruments for the final gate: harness R7D-HARNESS-5 and its validation 5, interface delta 5, final brief 4, R7D-PREREG-5;
//  - the Phase 3.3 authorization summary, probes, evidence, regressions and both reviews;
//  - the human revalidation queue after the one authorized append (HQ-R7D-SSCTR-P32-RECHECK) and its integration record.
// It computes a source digest and a manifest digest (canonical hash, src/value.mjs), records the suite (zero failures) and the three R7-B
// conformance checks (PASS, read-only), and binds the Phase 3.3 evidence manifest (its outputs must still hash as listed, on these source bytes).
// It refuses when:
//  - a bound file is not committed;
//  - a source file other than r6-adaptation.mjs differs from R7D-FREEZE-3, or an existing test other than the disclosed Phase 3.2 file;
//  - the policy, catalog, B0 or R6 records, product/ or canon/ changed since R7D-FREEZE-3;
//  - the queue differs from R7D-FREEZE-3's by anything but the one authorized item and its addendum key, appended after every earlier item;
//  - the diagnostic corpus, PREREG-1 to PREREG-4, the R7D-FREEZE-1/-2/-3 records or the Phase 3 / 3.1 / 3.2 folders changed;
//  - CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since the Phase 3.2 checkpoint (9042ed0);
//  - either review is not a pass, or a source or test byte differs from the reviewed runtime;
//  - a final holdout exists.
// One record, never overwritten. It writes only CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json.
//   node scripts/freeze-r7d-4.mjs --evidence <EVIDENCE_PHASE33.json> --ssctr <recheck.json> --engineering <check.json> --reviewed <commit>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7D-FREEZE-4',AUD='audits/domain-coaching-r7-d-2026-11-02',P33=`${AUD}/phase33`;
const PRED={revision:'R7D-FREEZE-3',commit:'aeafc833745fec8bf2d41c1aa0a4dce511d52777',recordCommit:'c938b53',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json'};
const PHASE32_CLOSE='9042ed0';
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_ITEM='HQ-R7D-SSCTR-P32-RECHECK',QUEUE_RECORD=`${P33}/QUEUE_INTEGRATION_R7D_P33.json`;
const UPDATED_TESTS=['CoachingCore/test/r7d-phase32.test.mjs'];
const target=path.join(cc,'r7/d/RUNTIME_FREEZE_R7D_4.json');
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const refuse=why=>{throw Error('Freeze refused: '+why);};
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<28});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const quiet=(a,b,paths)=>spawnSync('git',['diff','--quiet',a,b,'--',...paths],{cwd:repo}).status===0;
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const head=git('rev-parse','HEAD').trim();
// Inputs unchanged since R7D-FREEZE-3; the earlier instruments and records unchanged; the mission and the ledger append-only; no final holdout yet.
if(!quiet(PRED.commit,'HEAD',['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','product','canon']))refuse('an input changed since R7D-FREEZE-3 (policy, catalog, records, product/ or canon/)');
if(!quiet(git('rev-parse','cdff248').trim(),'HEAD',[`${AUD}/diagnostic`,`${AUD}/PREREGISTRATION_R7D.md`]))refuse('the diagnostic corpus, its manifests, its evaluation or PREREG-1 changed since the Phase 2 checkpoint');
if(!quiet(PHASE32_CLOSE,'HEAD',[`${AUD}/PREREGISTRATION_R7D_2.md`,`${AUD}/PREREGISTRATION_R7D_3.md`,`${AUD}/PREREGISTRATION_R7D_4.md`,'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json',PRED.record,'CoachingCore/r7/d/VERIFICATION_R7D_3.json',`${AUD}/phase32`,`${AUD}/phase31`,`${AUD}/phase3`]))refuse('PREREG-2/-3/-4, the R7D-FREEZE-1/-2/-3 records or the Phase 3/3.1/3.2 folders changed');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${PHASE32_CLOSE}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since the Phase 3.2 checkpoint');}
if(fs.existsSync(path.join(repo,AUD,'final')))refuse('a final holdout folder exists; the freeze precedes it');
// The source and test delta from R7D-FREEZE-3.
const delta={src:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)};
if(delta.src.join('|')!=='M\tCoachingCore/src/r6-adaptation.mjs')refuse('the source delta is not r6-adaptation.mjs alone: '+delta.src.join(', '));
const modifiedTests=delta.test.filter(l=>!l.startsWith('A\t')).map(l=>l.slice(2));
if(modifiedTests.sort().join('|')!==[...UPDATED_TESTS].sort().join('|'))refuse('existing tests changed beyond the disclosed Phase 3.2 assertion updates: '+modifiedTests.join(', '));
// The queue: R7D-FREEZE-3's bytes plus exactly the one authorized item, appended, with its addendum key and integration record.
const pred=json(PRED.record),q=json(QUEUE),qb=JSON.parse(spawnSync('git',['show',`${PRED.commit}:${QUEUE}`],{cwd:repo,encoding:'utf8',maxBuffer:1<<28}).stdout),qr=fs.existsSync(path.join(repo,QUEUE_RECORD))?json(QUEUE_RECORD):null;
if(pred.files[QUEUE]!==createHash('sha256').update(spawnSync('git',['show',`${PRED.commit}:${QUEUE}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28}).stdout).digest('hex'))refuse('the queue at R7D-FREEZE-3 differs from the bytes it bound');
if(q.items.length!==qb.items.length+1||JSON.stringify(q.items.slice(0,qb.items.length))!==JSON.stringify(qb.items)||q.items.at(-1).queue_id!==QUEUE_ITEM)refuse('the queue is not R7D-FREEZE-3\'s plus the one authorized item, appended');
if(Object.keys(qb).some(k=>k!=='items'&&JSON.stringify(q[k])!==JSON.stringify(qb[k]))||Object.keys(q).filter(k=>!(k in qb)).join('|')!=='r7d_p33_queue_addendum')refuse('the queue\'s other keys changed beyond the Phase 3.3 addendum');
if(!qr||qr.queueSha256After!==shaRepo(QUEUE)||qr.queueIds?.join('|')!==QUEUE_ITEM||qr.problems?.length)refuse('the queue integration record does not match the queue');
// The bound files.
const ls=d=>fs.existsSync(path.join(repo,d))?fs.readdirSync(path.join(repo,d)).filter(f=>/\.(mjs|json|md)$/.test(f)).map(f=>`${d}/${f}`):[];
const list=[...Object.keys(pred.files),...ls('CoachingCore/src').filter(p=>p.endsWith('.mjs')),...ls('CoachingCore/test').filter(p=>p.endsWith('.mjs')),
 'CoachingCore/scripts/freeze-r7d-4.mjs','CoachingCore/scripts/verify-r7d-4.mjs',PRED.record,'CoachingCore/r7/d/VERIFICATION_R7D_3.json',
 ...ls(`${AUD}/harness`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/harness/lib`),...ls(`${AUD}/harness/validation`).filter(p=>p.endsWith('.mjs')),`${AUD}/harness/README.md`,
 `${AUD}/harness/validation/DEV_CASES_R7D_5.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_5.json`,
 ...['INTERFACE_DELTA_R7D_5.md','AUTHOR_BRIEF_FINAL_R7D_4.md'].map(f=>`${AUD}/author/${f}`),`${AUD}/PREREGISTRATION_R7D_5.md`,
 `${P33}/AUTHORIZATION_PHASE33.md`,`${P33}/integrate-queue-r7d-p32.mjs`,QUEUE_RECORD,...ls(`${P33}/probes`),...ls(`${P33}/probes/out`),...ls(`${P33}/evidence`),...ls(`${P33}/regression/diagnostic`),...ls(`${P33}/regression/generated`),
 ...ls(`${P33}/reviews`),...ls(`${P33}/reviews/ssctr`),...ls(`${P33}/reviews/ssctr/probes`),...ls(`${P33}/reviews/ssctr/probes/out`),...ls(`${P33}/reviews/engineering`),...ls(`${P33}/reviews/engineering/probes`),...ls(`${P33}/reviews/engineering/probes/out`),QUEUE];
const missing=list.filter(p=>!fs.existsSync(path.join(repo,p)));if(missing.length)refuse('bound files missing: '+missing.join(', '));
const files=Object.fromEntries([...new Set(list)].sort().map(p=>[p,shaRepo(p)]));
const shaHead=p=>{const r=spawnSync('git',['show',`${head}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const uncommitted=Object.entries(files).filter(([p,s])=>shaHead(p)!==s).map(([p])=>p);if(uncommitted.length)refuse('bound files differ from HEAD (commit first): '+uncommitted.slice(0,10).join(', '));
const srcFiles=Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('CoachingCore/src/')));
const sourceDigest=hash(srcFiles),manifestDigest=hash(files);
// Evidence on these bytes: the suite and the conformance checks (read-only; their stdout is the report).
const run=(args,label)=>{const r=spawnSync(process.execPath,args,{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms'),node:process.version};
if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`],s);let j;try{j=JSON.parse(r.stdout);}catch{refuse(s+': no JSON');}if(j.result!=='PASS')refuse(s+': '+JSON.stringify(j.problems).slice(0,300));return [s,{result:j.result,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
// The Phase 3.3 evidence manifest: PASS, on these source bytes, with every output it lists unchanged.
const evPath=arg('--evidence'),ssPath=arg('--ssctr'),enPath=arg('--engineering'),reviewed=arg('--reviewed');if(!evPath||!ssPath||!enPath||!reviewed)refuse('give --evidence, --ssctr, --engineering and --reviewed');
const ev=json(evPath);
if(ev.result!=='PASS'||ev.problems?.length)refuse('the evidence manifest is not a PASS');
if(Object.entries(ev.runtimeSource).some(([p,h])=>srcFiles[p]!==h)||Object.keys(srcFiles).some(p=>ev.runtimeSource[p]!==srcFiles[p]))refuse('the evidence was made on other source bytes');
for(const [k,o] of Object.entries(ev.outputs))if(shaRepo(o.path)!==o.sha256)refuse('evidence output changed: '+k);
// Both reviews judged the runtime bytes of the reviewed commit: no source or test byte may differ since.
if(!quiet(reviewed,'HEAD',['CoachingCore/src','CoachingCore/test']))refuse('a source or test byte differs from the reviewed runtime ('+reviewed+')');
const ss=json(ssPath),en=json(enPath);
if(!['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(ss.disposition))refuse('the SSCTR recheck disposition is '+ss.disposition);
if(!['READY','READY_WITH_CONDITIONS'].includes(en.verdict))refuse('the quality/reliability check verdict is '+en.verdict);
const postReview={reviewedRuntime:git('rev-parse',reviewed).trim(),changedSinceReviewed:git('diff','--name-status',reviewed,'HEAD').split('\n').filter(Boolean)};
const proposed=[ss.proposedHumanRevalidation?.item?.queue_id??null,en.proposedHumanRevalidation?.item?.queue_id??null].filter(Boolean);
const record={revision,mission:'DOMAIN_COACHING_R7-D Phase 3.3 (narrow closure of SSCTR-P32-F01: known training between two separate breaks)',commit:head,
 predecessor:{...PRED,sha256:shaRepo(PRED.record),note:'Superseded, not edited. Its verifier (verify-r7d-3.mjs) now fails files-current by design: r6-adaptation.mjs, the Phase 3.2 test file and the harness files changed.'},
 created:new Date().toISOString(),delta:{...delta,updatedTests:UPDATED_TESTS},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{path:evPath,sha256:shaRepo(evPath),outputs:ev.outputs,results:ev.results,red:ev.red,suite:ev.suite,directed:ev.directed,directed32:ev.directed32,directed31:ev.directed31,authority:ev.authority},
 rule:{id:'R7D-P33-REENTRY-WEEK',text:'Training recorded between two separate breaks (each later one named on its own) re-enters the athlete after the earlier break only when a whole week of the plan lying wholly between them (every session it plans after the earlier break\'s last day and before the stop\'s first day) was executed completely in every sport it plans: every session executed as prescribed and every gate ADVANCE or EARNED, with a usable log for every exercise (the evidence reducer\'s COMPLETED_SESSIONS rule, SSCTR S-A and E3, R7-A final P5; a review that closed the week does not make it one). Then the earlier break is history (TRAINING_AFTER, with reentryWeek) and the return reads the later break alone from what was executed. Training short of that (an isolated session of either sport, a partial or aborted one, sessions in no complete week, a week with a session missed, partial, unreported, conflicted or adverse) is a fact of the stop, not a re-entry: the stop runs back through the earlier break as with nothing trained between (TRAINING_NOT_REESTABLISHED), classed by the unchanged return classes. Unreported sessions between them are asked first (TRAINING_BETWEEN_BREAKS). Identities, relations, the replay and correction rules, clinical first and F08 are unchanged; no break is merged and no duration added.',
  founder:'Phase 3.3 (phase33/AUTHORIZATION_PHASE33.md): direction B, restrict what counts as known training between two interruptions; an isolated execution is not a resumption; a proven resumption stays recognized; no new threshold, clinical criterion or dose'},
 noNewNumber:'Phase 3.3 adds no dose, threshold, count, length, increment, tolerance, cadence, return recipe, taper, race, strength or learning authority: the week is the plan\'s own and the completeness test is the evidence reducer\'s existing rule; the return is the unchanged R6-NONCLINICAL-RETURN recipe, classed by the stop the facts establish. Offline synthetic shadow reference only; V1_COACHING_AUTHORITY_READY stays NO.',
 closedDefect:{id:'SSCTR-P32-F01',status:'CLOSED in R7-D Phase 3.3 on the paths the rule names (isolated training of either sport, partial or aborted sessions, sessions in no whole executed week; the late form through a reviewed week); disclosed residuals of the rule below',witness:`${P33}/probes/f01-witness.mjs`,before:ev.results?.witness?.freeze3??null,after:ev.results?.witness?.candidate??null,measured:'P18(a) re-entry week (R7D-HARNESS-5, R7D-PREREG-5 Δ1)'},
 disclosures:{
  f08:{ids:['QE-R7D-P31-01','SSCTR-P31-F03','SSCTR-P32-F02'],status:'KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY',owner:'After R7-D and before any consumer or V1 coaching authority: Founder/PCG with qualified SSCTR/clinical-domain review (G04 owners, G03)',text:'Unchanged by Phase 3.3 (the R7D-FREEZE-3 text stands): fail-closed while a kept break\'s stated reason is clinical; an explicit named correction of the reason to nonclinical is the athlete\'s statement, not clearance. No runtime expansion.'},
  residuals:[
   'Plan-week alignment (R7D-PREREG-5 Δ6): re-entry is read per plan week, as every step is; seven or more days executed across two plan weeks with neither whole one complete do not re-enter (conservative).',
   'Every sport (R7D-PREREG-5 Δ6): a week with every run done but a strength session missed does not re-enter; per-sport re-entry is not modelled (the NF-R7AB-1 / R40 family; conservative).',
   'Imperfect adherence over a long gap (R7D-PREREG-5 Δ6): weeks of training between two breaks with no single complete week are read as one stop, more conservative than either break alone (the existing rule that no incomplete week earns a step).',
   'A reviewed week is not a re-entry by itself (R7D-PREREG-5 Δ6): a week a review closed before the earlier break was declared counts only if executed completely.',
   'Extra question (R7D-PREREG-5 Δ6, O-01 extended): unreported sessions between the breaks are still asked when no whole week fits between them.',
   'The R7D-FREEZE-3 residuals other than SSCTR-P32-F01 stand unchanged (SSCTR-P32-F03, SSCTR-P32-F04, QE-R7D-P32-02, -04, -05, QE-R7D-P32-01 as reconciled).'],
  ssctrFindings:ss.findings??null,engineeringFindings:en.findings??null},
 routed:[{ids:['SSCTR-P32-F01 residuals of the rule (R7D-PREREG-5 Δ6)'],to:'Founder, then the next authorized runtime or interface mission'},{ids:['SSCTR-P32-F02','QE-R7D-P31-01'],to:'Founder/PCG with the G04 owners and G03 (F08), unchanged'},{ids:['SSCTR-P32-F03','SSCTR-P32-F04','QE-R7D-P32-02','QE-R7D-P32-04','QE-R7D-P32-05'],to:'as routed by R7D-FREEZE-3, unchanged'}],
 testGaps:{inherited:'The R7D-FREEZE-3 test gaps (QE-R7D-P32-06 first) stand; Phase 3.3 adds tests only for its own rule'},
 reviews:{ssctr:{recordId:ss.recordId,path:ssPath,sha256:shaRepo(ssPath),disposition:ss.disposition,conditions:ss.conditionsForFreeze??ss.conditions??[]},qualityReliability:{recordId:en.recordId,path:enPath,sha256:shaRepo(enPath),verdict:en.verdict,conditions:en.conditionsForFreeze??en.conditions??[]},postReview},
 instruments:{harness:'R7D-HARNESS-5',prereg:{path:`${AUD}/PREREGISTRATION_R7D_5.md`,sha256:shaRepo(`${AUD}/PREREGISTRATION_R7D_5.md`),revision:'R7D-PREREG-5'},interface:'R7D-INTERFACE-5 (INTERFACE_ONLY_R7D.md + INTERFACE_DELTA_R7D_2.md + INTERFACE_DELTA_R7D_3.md + INTERFACE_DELTA_R7D_4.md + INTERFACE_DELTA_R7D_5.md)',finalBrief:`${AUD}/author/AUTHOR_BRIEF_FINAL_R7D_4.md`,validation:`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_5.json`},
 authorization:{path:`${P33}/AUTHORIZATION_PHASE33.md`,sha256:shaRepo(`${P33}/AUTHORIZATION_PHASE33.md`)},
 humanRevalidationQueue:{path:QUEUE,sha256:shaRepo(QUEUE),items:q.items.length,added:[QUEUE_ITEM],integration:{path:QUEUE_RECORD,sha256:shaRepo(QUEUE_RECORD)},proposed,note:`The Founder's Phase 3.3 authorization appended ${QUEUE_ITEM}, naming R7D-FREEZE-3 (the freeze its SSCTR record judged), by its owner (Chief / Founder); every earlier item is unchanged. Any item proposed by the Phase 3.3 reviews stays proposed: this phase authorizes no other append.`},
 bindingConditions:{inherited:{from:PRED.revision,record:PRED.record,note:'Every binding condition of R7D-FREEZE-3 travels unchanged with this runtime.'},added:['The conditions of the two Phase 3.3 reviews, listed under reviews','R7D-PREREG-5 Δ5 consumer conditions: report every planned session between two breaks; never present one session as proof of resumption; say why an earlier break still counts or which week re-entered the athlete, with no number of the consumer\'s own']},
 testChanges:{updatedAssertions:UPDATED_TESTS,why:'Two Phase 3.2 T4 assertions encoded "recorded training between two separate breaks leaves the latest break alone" (SSCTR-P32-F01): the two sessions between the breaks now re-enter nothing, so the stop runs through (MODERATE 21 instead of SHORT 4). Each is marked "R7-D Phase 3.3"; each as it stood at R7D-FREEZE-3 fails on this runtime, and each as updated fails on R7D-FREEZE-3 (evidence red).'},
 finalHoldoutExists:false,V1_COACHING_AUTHORITY_READY:'NO',
 verifier:'node CoachingCore/scripts/verify-r7d-4.mjs (read-only; --suite also re-runs the suite and the conformance checks; --write writes only CoachingCore/r7/d/VERIFICATION_R7D_4.json)'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),record:path.relative(repo,target),sha256:shaRepo(path.relative(repo,target))},null,1));
