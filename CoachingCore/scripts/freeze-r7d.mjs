// R7-D freeze (node scripts/freeze-r7d.mjs): R7D-FREEZE-1, DOMAIN_COACHING_R7-D Phase 3 (narrow correction of DX-01, DX-02, F03 and F04), on top
// of R7C-FREEZE-4 (commit a9654c8). Lean form of the R7-C freeze (scripts/freeze-r7c.mjs). It binds by SHA-256 the committed bytes:
//  - every file R7C-FREEZE-4 bound, at its current bytes;
//  - every source and test file;
//  - the review records the runtime reads;
//  - the R7-D instruments for the final gate: the harness R7D-HARNESS-2, the author interface and its delta, the final brief and R7D-PREREG-2;
//  - the Phase 3 probes, authorization summary, policy decision records (F03-B) and both reviews.
// It computes a source digest and a manifest digest (canonical hash, src/value.mjs). On these bytes it records the suite (zero failures required)
// and the three R7-B conformance checks (PASS required, read-only). It binds the Phase 3 evidence manifest, whose outputs must still hash as
// listed and whose runtime source must be these bytes.
// It refuses when:
//  - a bound file is not committed;
//  - the policy, catalog, B0 or R6 records, human queue, product/ or canon/ changed since R7C-FREEZE-4;
//  - CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since then;
//  - either review is not a pass;
//  - a final holdout exists.
// One record, never overwritten. It writes only CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json.
//   node scripts/freeze-r7d.mjs --evidence <EVIDENCE_PHASE3.json> --ssctr <recheck.json> --engineering <check.json>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7D-FREEZE-1',AUD='audits/domain-coaching-r7-d-2026-11-02';
const PRED={revision:'R7C-FREEZE-4',commit:'a9654c8ea175611fbaae805ac6b0e8b928620dff',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json'};
const target=path.join(cc,'r7/d/RUNTIME_FREEZE_R7D_1.json');
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const refuse=why=>{throw Error('Freeze refused: '+why);};
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const head=git('rev-parse','HEAD').trim();
// Inputs unchanged since R7C-FREEZE-4; the mission and the ledger append-only since then; no final holdout yet.
const UNCHANGED=['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json','product','canon'];
if(spawnSync('git',['diff','--quiet',PRED.commit,'HEAD','--',...UNCHANGED],{cwd:repo}).status!==0)refuse('an input changed since R7C-FREEZE-4 (policy, catalog, records, queue, product/ or canon/)');
// The diagnostic corpus, its manifests and its first evaluation are preserved byte for byte since the Phase 2 checkpoint (regression only now).
const p2=git('rev-parse','cdff248').trim();if(spawnSync('git',['diff','--quiet',p2,'HEAD','--',`${AUD}/diagnostic`,`${AUD}/PREREGISTRATION_R7D.md`],{cwd:repo}).status!==0)refuse('the diagnostic corpus, its manifests, its evaluation or PREREG-1 changed since the Phase 2 checkpoint');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${PRED.commit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since R7C-FREEZE-4');}
if(fs.existsSync(path.join(repo,AUD,'final')))refuse('a final holdout folder exists; the freeze precedes it');
// The bound files.
const ls=d=>fs.existsSync(path.join(repo,d))?fs.readdirSync(path.join(repo,d)).filter(f=>/\.(mjs|json|md)$/.test(f)).map(f=>`${d}/${f}`):[];
const pred=json(PRED.record);
const list=[...Object.keys(pred.files),...ls('CoachingCore/src').filter(p=>p.endsWith('.mjs')),...ls('CoachingCore/test').filter(p=>p.endsWith('.mjs')),
 'CoachingCore/scripts/freeze-r7d.mjs','CoachingCore/scripts/verify-r7d.mjs','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',
 ...ls(`${AUD}/harness`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/harness/lib`),...ls(`${AUD}/harness/validation`).filter(p=>p.endsWith('.mjs')),`${AUD}/harness/README.md`,
 `${AUD}/harness/validation/DEV_CASES_R7D_2.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_2.json`,
 ...['INTERFACE_ONLY_R7D.md','INTERFACE_DELTA_R7D_2.md','CASE_SCHEMA_R7D.json','check-corpus.mjs','AUTHOR_BRIEF_FINAL_R7D.md'].map(f=>`${AUD}/author/${f}`),
 `${AUD}/PREREGISTRATION_R7D.md`,`${AUD}/PREREGISTRATION_R7D_2.md`,`${AUD}/phase3/AUTHORIZATION_PHASE3.md`,...ls(`${AUD}/phase3/probes`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/phase3/policy`),
 ...ls(`${AUD}/phase3/reviews`),...ls(`${AUD}/phase3/reviews/ssctr`),...ls(`${AUD}/phase3/reviews/ssctr/probes`),...ls(`${AUD}/phase3/reviews/engineering`),...ls(`${AUD}/phase3/reviews/engineering/probes`)];
const missing=list.filter(p=>!fs.existsSync(path.join(repo,p)));if(missing.length)refuse('bound files missing: '+missing.join(', '));
const files=Object.fromEntries([...new Set(list)].sort().map(p=>[p,shaRepo(p)]));
const shaHead=p=>{const r=spawnSync('git',['show',`${head}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const uncommitted=Object.entries(files).filter(([p,s])=>shaHead(p)!==s).map(([p])=>p);if(uncommitted.length)refuse('bound files differ from HEAD (commit first): '+uncommitted.slice(0,10).join(', '));
const srcFiles=Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('CoachingCore/src/')));
const sourceDigest=hash(srcFiles),manifestDigest=hash(files);
const delta={src:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)};
if(delta.test.some(l=>!l.startsWith('A\t')))refuse('an existing test changed: '+delta.test.filter(l=>!l.startsWith('A\t')).join(', '));
// Evidence on these bytes: the suite and the conformance checks (read-only; their stdout is the report).
const run=(args,label)=>{const r=spawnSync(process.execPath,args,{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms'),node:process.version};
if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`],s);let j;try{j=JSON.parse(r.stdout);}catch{refuse(s+': no JSON');}if(j.result!=='PASS')refuse(s+': '+JSON.stringify(j.problems).slice(0,300));return [s,{result:j.result,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
// The Phase 3 evidence manifest: PASS, on these source bytes, with every output it lists unchanged.
const evPath=arg('--evidence'),ssPath=arg('--ssctr'),enPath=arg('--engineering');if(!evPath||!ssPath||!enPath)refuse('give --evidence, --ssctr and --engineering');
const ev=json(evPath);
if(ev.result!=='PASS'||ev.problems?.length)refuse('the evidence manifest is not a PASS');
if(Object.entries(ev.runtimeSource).some(([p,h])=>srcFiles[p]!==h)||Object.keys(srcFiles).some(p=>ev.runtimeSource[p]!==srcFiles[p]))refuse('the evidence was made on other source bytes');
for(const [k,o] of Object.entries(ev.outputs))if(shaRepo(o.path)!==o.sha256)refuse('evidence output changed: '+k);
// The F03-B policy decision (SSCTR rule and PCG authority form) and both Phase 3 reviews.
const policy={ssctr:`${AUD}/phase3/policy/SSCTR_F03B_DECISION_R7D.json`,pcg:`${AUD}/phase3/policy/PCG_F03B_AUTHORITY_R7D.json`};
const sd=json(policy.ssctr),pd=json(policy.pcg);
if(sd.outcome!=='DECIDED'||sd.chosenRule?.ruleId!=='F03B-MACHINE-STEP-r1')refuse('the SSCTR F03-B decision');
if(pd.outcome!=='AUTHORITY_FORM_DECIDED')refuse('the PCG F03-B authority form');
const ss=json(ssPath),en=json(enPath);
// Both reviews judged the runtime bytes of 9e1ecbf (candidate 7039bc1): no source or test byte may differ (SSCTR CF-01). What changed after the
// candidate is listed (harness renderer and tightened oracles, probes, documents, scripts, the review records themselves).
const REVIEWED={runtime:'9e1ecbf',candidate:'7039bc1'};
if(spawnSync('git',['diff','--quiet',REVIEWED.runtime,'HEAD','--','CoachingCore/src','CoachingCore/test'],{cwd:repo}).status!==0)refuse('a source or test byte differs from the reviewed runtime ('+REVIEWED.runtime+')');
const postReview={reviewedRuntime:git('rev-parse',REVIEWED.runtime).trim(),reviewedCandidate:git('rev-parse',REVIEWED.candidate).trim(),changedSinceCandidate:git('diff','--name-status',REVIEWED.candidate,'HEAD').split('\n').filter(Boolean)};
if(!['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(ss.disposition))refuse('the SSCTR recheck disposition is '+ss.disposition);
if(!['READY','READY_WITH_CONDITIONS'].includes(en.verdict))refuse('the engineering check verdict is '+en.verdict);
const record={revision,mission:'DOMAIN_COACHING_R7-D Phase 3 (narrow correction: DX-01, DX-02, F03, F04)',commit:head,
 predecessor:{...PRED,sha256:shaRepo(PRED.record),note:'Not edited. Its verifier (verify-r7c.mjs --revision 4) now fails files-current by design: its bound sources changed.'},
 created:new Date().toISOString(),delta,files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{path:evPath,sha256:shaRepo(evPath),outputs:ev.outputs,results:ev.results,authority:ev.authority,directed:ev.directed},
 policyDecision:{finding:'F03-B',ruleId:sd.chosenRule.ruleId,interpretation:'I-1 (PCG): the MACHINE_STACK smallest increment is one setting of that machine, never a kilogram; no machine load is computed',
  ssctr:{recordId:sd.recordId,path:policy.ssctr,sha256:shaRepo(policy.ssctr),outcome:sd.outcome,conditions:sd.conditions},
  pcg:{recordId:pd.recordId,path:policy.pcg,sha256:shaRepo(policy.pcg),outcome:pd.outcome,bindingForm:pd.bindingForm??null,conditions:pd.conditions},
  policyBytesChanged:false,policyCanonicalHash:ev.authority.policy.canonicalHash,r6BoundariesEnabled:ev.authority.policy.boundariesEnabled},
 reviews:{ssctr:{recordId:ss.recordId,path:ssPath,sha256:shaRepo(ssPath),disposition:ss.disposition,conditions:ss.conditionsForFreeze??ss.conditions??[]},engineering:{recordId:en.recordId,path:enPath,sha256:shaRepo(enPath),verdict:en.verdict,conditions:en.conditionsForFreeze??[]},postReview},
 instruments:{harness:'R7D-HARNESS-2',prereg:{path:`${AUD}/PREREGISTRATION_R7D_2.md`,sha256:shaRepo(`${AUD}/PREREGISTRATION_R7D_2.md`),revision:'R7D-PREREG-2'},interface:'R7D-INTERFACE-2 (INTERFACE_ONLY_R7D.md + INTERFACE_DELTA_R7D_2.md)',finalBrief:`${AUD}/author/AUTHOR_BRIEF_FINAL_R7D.md`},
 authorization:{path:`${AUD}/phase3/AUTHORIZATION_PHASE3.md`,sha256:shaRepo(`${AUD}/phase3/AUTHORIZATION_PHASE3.md`)},
 bindingConditions:{inherited:{from:PRED.revision,record:PRED.record,note:'The R7-C binding conditions (C2, C3, C7, C8, C9) and the R7B2-C1..C4 conditions travel unchanged with this runtime.'},
  added:['F03-B: the conditions of SSCTR-R7D-F03B-r1 (C1-C9) and PCG-R7D-F03B-r1 (I-1 everywhere an increment is used; no policy byte change; binding by this record)','CONSUMER_CONDITION (R7D-PREREG-2 Δ4): a client sends the athlete\'s current learning consent with every decision','The conditions of the two Phase 3 reviews, listed under reviews']},
 knownFindings:[{id:'QE-R7D-P3-01',includes:'P3-F01',class:'MAJOR (engineering check), non-blocking; PRE_EXISTING in substance; no envelope',
  text:'A declared break is retained only by a decision that applies it. (a) another event kind that declares one asks, and a later plain review without it is VALID on the stale plan; (b) a break with a clinical flag, then qualified clearance, then a plain review without it is VALID on the stale plan (F08 family); (c) P3-F01: a declared-break answer recorded by a clinical route is not retained across clearance, and the first eligible decision asks again (fail-closed) where the direct answer re-enters. None is worse than on R7C-FREEZE-4.',
  measured:'(c) is a P05 violation if the final holdout exercises it (CARRIER_CLINICAL stays strict); (a) and (b) are measured by no automated property (declared TEST_GAP; domain-judged)',
  evidence:[`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_2.json`,`${AUD}/phase3/reviews/engineering/ENGINEERING_CHECK_R7D_PHASE3.json`,`${AUD}/phase3/reviews/ssctr/SSCTR_PHASE3_RECHECK_R7D.json`],
  next:'Founder decision before the final holdout is commissioned: authorize a correction, a new oracle or an envelope (the latter two through an R7D-PREREG-3 registered before the holdout), or accept the measurement as registered'}],
 testGaps:{mutationSurvivors:{from:'R7D-ENGINEERING-PHASE3-CHECK-1 (CF-4)',mutants:['QM10','QM16','QM18','QM19','QM21','QM23','QM24'],note:'Survive the whole suite; the judge\'s probes show the candidate correct where QM16, QM19, QM21 and QM23 would not be'},oracleGaps:['QE-R7D-P3-01 (a) and (b): no automated property'] },
 routed:[{ids:['QE-R7D-P3-03','QE-R7D-P3-04','QE-R7D-P3-08'],to:'Engineering backlog (CF-7)',note:'pre-existing: a same-day correction of a day-precision report refused; the learning model shares the DX-01 re-reading; a non-object interruption on a weekly review ignored'},{ids:['QE-R7D-P3-11'],to:'Security (CF-6): acceptance of the consent consumer condition (a revocation lapses unless the client repeats it)'}],
 // The reviews' disclosure conditions (SSCTR CF-02, CF-03, CF-05, CF-06; the engineering findings), carried as the reviews wrote them.
 disclosures:{
  noNewNumber:{statement:'Phase 3 adds no dose, threshold, increment, tolerance or cadence number. F03-B\'s prescriptive behaviour is the one SSCTR-R7D-F03B-r1 approved, with PCG-R7D-F03B-r1. Offline synthetic shadow reference only; V1_COACHING_AUTHORITY_READY stays NO.',ssctr:ss.newPrescriptiveAuthority??null},
  f03bRuleResiduals:{from:sd.recordId,residuals:sd.residuals??null,restatedR09:'Machine establishment and hint agreement, and cross-source duplicate tolerance, are equality-only (SSCTR-R7D-P3-RECHECK-r1 O-3)'},
  recheckResiduals:ss.residuals??null,recheckObservations:ss.additionalObservations??null,flaggedBehaviours:ss.flaggedBehaviours??null,
  founderInterpretationFlag:'For event kinds other than a weekly review or a return report, "the same interruption is factual whatever the carrier" is implemented as a clinical screen plus a question (breakCarrierAsk), not as applying the break; the break is not retained after that question. The Founder sees this before Phase 4 (SSCTR CF-05).',
  f08Label:'F08 (no path back to the plan after a clinical route) fails closed only when the return re-declares the clinical reason; a plain review after clearance that omits a break can be VALID with pre-break doses, as on R7C-FREEZE-4 (SSCTR CF-03)',
  consumerConditionsG03:['A break is declared once, in the decision that first reports it','When asked (interruption.reportedOnItsOwn), the break is sent on its own before any other event','After a qualified clearance of a clinically routed break, the break (or the qualified human\'s constraints) is declared again before a plain review','No template interruption object is sent'],
  engineeringFindings:en.findings??null},
 openConditions:[
  {id:'SSCTR CF-07',status:'PENDING',text:'Funded-human revalidation items proposed by SSCTR-R7D-F03B-r1 and SSCTR-R7D-P3-RECHECK-r1 are appended to the queue by the authorized owner, naming R7D-FREEZE-1; the queue is unchanged by this phase',items:[...(Array.isArray(sd.proposedHumanRevalidation)?sd.proposedHumanRevalidation:[sd.proposedHumanRevalidation]),...(Array.isArray(ss.proposedHumanRevalidation)?ss.proposedHumanRevalidation:[ss.proposedHumanRevalidation])].filter(Boolean).map(x=>x.id??x.itemId??null)},
  {id:'PCG proposed index entry',status:'PENDING',text:'The PCG record proposes a canon/CANONICAL_INDEX.md entry for I-1; applied only at an authorized canon sync',entry:pd.proposedIndexEntry??null},
  {id:'SSCTR CF-04',status:'DONE_BEFORE_FREEZE',text:'The harness domain packet renders load.nextSetting for machine step rows (renderer only; harness/lib/report.mjs)'}],
 finalHoldoutExists:false,V1_COACHING_AUTHORITY_READY:'NO',
 verifier:'node CoachingCore/scripts/verify-r7d.mjs (read-only; --suite also re-runs the suite and the conformance checks; --write writes only CoachingCore/r7/d/VERIFICATION_R7D_1.json)'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),record:path.relative(repo,target),sha256:shaRepo(path.relative(repo,target))},null,1));
