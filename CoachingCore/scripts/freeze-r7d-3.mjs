// R7-D freeze 3 (node scripts/freeze-r7d-3.mjs): R7D-FREEZE-3, DOMAIN_COACHING_R7-D Phase 3.2 (SSCTR-P31-F02: a newer declared break never silently
// replaces, joins or outranks an older one still unapplied), on top of R7D-FREEZE-2 (bound files 88d2495, record 93f3a38), which is superseded and
// never edited. Lean form of scripts/freeze-r7d-2.mjs. It binds by SHA-256 the committed bytes of:
//  - every file R7D-FREEZE-2 bound, at its current bytes;
//  - every source and test file;
//  - the R7-D instruments for the final gate: harness R7D-HARNESS-4 and its validation 4, interface delta 4, final brief 3, R7D-PREREG-4;
//  - the Phase 3.2 authorization summary, probes, evidence, regressions and both reviews;
//  - the human revalidation queue, unchanged since R7D-FREEZE-2 (this phase appends nothing).
// It computes a source digest and a manifest digest (canonical hash, src/value.mjs), records the suite (zero failures) and the three R7-B
// conformance checks (PASS, read-only), and binds the Phase 3.2 evidence manifest (its outputs must still hash as listed, on these source bytes).
// It refuses when:
//  - a bound file is not committed;
//  - a source file other than r6-adaptation.mjs differs from R7D-FREEZE-2, or an existing test other than the two disclosed assertion updates;
//  - the policy, catalog, B0 or R6 records, product/ or canon/ changed since R7D-FREEZE-2, or the queue changed at all;
//  - the diagnostic corpus, PREREG-1 to PREREG-3 or the R7D-FREEZE-1/-2 records and Phase 3.1 folder changed;
//  - CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since R7D-FREEZE-2;
//  - either review is not a pass, or a source or test byte differs from the reviewed runtime;
//  - a final holdout exists.
// One record, never overwritten. It writes only CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json.
//   node scripts/freeze-r7d-3.mjs --evidence <EVIDENCE_PHASE32.json> --ssctr <recheck.json> --engineering <check.json> --reviewed <commit>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7D-FREEZE-3',AUD='audits/domain-coaching-r7-d-2026-11-02',P32=`${AUD}/phase32`;
const PRED={revision:'R7D-FREEZE-2',commit:'88d2495ae06310abb8eff1ddb7a02b9880994ae9',recordCommit:'93f3a38',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const UPDATED_TESTS=['CoachingCore/test/r7a1-composition.test.mjs','CoachingCore/test/r7d-phase31.test.mjs'];
const target=path.join(cc,'r7/d/RUNTIME_FREEZE_R7D_3.json');
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const refuse=why=>{throw Error('Freeze refused: '+why);};
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const quiet=(a,b,paths)=>spawnSync('git',['diff','--quiet',a,b,'--',...paths],{cwd:repo}).status===0;
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const head=git('rev-parse','HEAD').trim();
// Inputs unchanged since R7D-FREEZE-2; the earlier instruments and records unchanged; the mission and the ledger append-only; no final holdout yet.
if(!quiet(PRED.commit,'HEAD',['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','product','canon',QUEUE]))refuse('an input changed since R7D-FREEZE-2 (policy, catalog, records, product/, canon/ or the queue)');
if(!quiet(git('rev-parse','cdff248').trim(),'HEAD',[`${AUD}/diagnostic`,`${AUD}/PREREGISTRATION_R7D.md`]))refuse('the diagnostic corpus, its manifests, its evaluation or PREREG-1 changed since the Phase 2 checkpoint');
if(!quiet(PRED.recordCommit,'HEAD',[`${AUD}/PREREGISTRATION_R7D_2.md`,`${AUD}/PREREGISTRATION_R7D_3.md`,'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json',PRED.record,`${AUD}/phase31`,`${AUD}/phase3`]))refuse('PREREG-2/-3, the R7D-FREEZE-1/-2 records or the Phase 3/3.1 folders changed');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${PRED.commit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since R7D-FREEZE-2');}
if(fs.existsSync(path.join(repo,AUD,'final')))refuse('a final holdout folder exists; the freeze precedes it');
// The source and test delta from R7D-FREEZE-2.
const delta={src:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',PRED.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)};
if(delta.src.join('|')!=='M\tCoachingCore/src/r6-adaptation.mjs')refuse('the source delta is not r6-adaptation.mjs alone: '+delta.src.join(', '));
const modifiedTests=delta.test.filter(l=>!l.startsWith('A\t')).map(l=>l.slice(2));
if(modifiedTests.sort().join('|')!==[...UPDATED_TESTS].sort().join('|'))refuse('existing tests changed beyond the two disclosed assertion updates: '+modifiedTests.join(', '));
const pred=json(PRED.record),q=json(QUEUE);
if(pred.files[QUEUE]!==shaRepo(QUEUE))refuse('the queue differs from the bytes R7D-FREEZE-2 bound');
// The bound files.
const ls=d=>fs.existsSync(path.join(repo,d))?fs.readdirSync(path.join(repo,d)).filter(f=>/\.(mjs|json|md)$/.test(f)).map(f=>`${d}/${f}`):[];
const list=[...Object.keys(pred.files),...ls('CoachingCore/src').filter(p=>p.endsWith('.mjs')),...ls('CoachingCore/test').filter(p=>p.endsWith('.mjs')),
 'CoachingCore/scripts/freeze-r7d-3.mjs','CoachingCore/scripts/verify-r7d-3.mjs',PRED.record,
 ...ls(`${AUD}/harness`).filter(p=>p.endsWith('.mjs')),...ls(`${AUD}/harness/lib`),...ls(`${AUD}/harness/validation`).filter(p=>p.endsWith('.mjs')),`${AUD}/harness/README.md`,
 `${AUD}/harness/validation/DEV_CASES_R7D_4.json`,`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_4.json`,
 ...['INTERFACE_DELTA_R7D_4.md','AUTHOR_BRIEF_FINAL_R7D_3.md'].map(f=>`${AUD}/author/${f}`),`${AUD}/PREREGISTRATION_R7D_4.md`,
 `${P32}/AUTHORIZATION_PHASE32.md`,...ls(`${P32}/probes`),...ls(`${P32}/probes/out`),...ls(`${P32}/evidence`),...ls(`${P32}/regression/diagnostic`),...ls(`${P32}/regression/generated`),
 ...ls(`${P32}/reviews`),...ls(`${P32}/reviews/ssctr`),...ls(`${P32}/reviews/ssctr/probes`),...ls(`${P32}/reviews/ssctr/probes/out`),...ls(`${P32}/reviews/engineering`),...ls(`${P32}/reviews/engineering/probes`),QUEUE];
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
// The Phase 3.2 evidence manifest: PASS, on these source bytes, with every output it lists unchanged.
const evPath=arg('--evidence'),ssPath=arg('--ssctr'),enPath=arg('--engineering'),reviewed=arg('--reviewed');if(!evPath||!ssPath||!enPath||!reviewed)refuse('give --evidence, --ssctr, --engineering and --reviewed');
const ev=json(evPath);
if(ev.result!=='PASS'||ev.problems?.length)refuse('the evidence manifest is not a PASS');
if(Object.entries(ev.runtimeSource).some(([p,h])=>srcFiles[p]!==h)||Object.keys(srcFiles).some(p=>ev.runtimeSource[p]!==srcFiles[p]))refuse('the evidence was made on other source bytes');
for(const [k,o] of Object.entries(ev.outputs))if(shaRepo(o.path)!==o.sha256)refuse('evidence output changed: '+k);
// Both reviews judged the runtime bytes of the reviewed commit: no source or test byte may differ since.
if(!quiet(reviewed,'HEAD',['CoachingCore/src','CoachingCore/test']))refuse('a source or test byte differs from the reviewed runtime ('+reviewed+')');
const ss=json(ssPath),en=json(enPath);
if(!['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(ss.disposition))refuse('the SSCTR recheck disposition is '+ss.disposition);
if(!['READY','READY_WITH_CONDITIONS'].includes(en.verdict))refuse('the engineering check verdict is '+en.verdict);
const postReview={reviewedRuntime:git('rev-parse',reviewed).trim(),changedSinceReviewed:git('diff','--name-status',reviewed,'HEAD').split('\n').filter(Boolean)};
const record={revision,mission:'DOMAIN_COACHING_R7-D Phase 3.2 (narrow closure of SSCTR-P31-F02: unresolved multiple interruptions)',commit:head,
 predecessor:{...PRED,sha256:shaRepo(PRED.record),note:'Superseded, not edited. Its verifier (verify-r7d-2.mjs) now fails files-current by design: r6-adaptation.mjs and two test files changed.'},
 created:new Date().toISOString(),delta:{...delta,updatedTests:UPDATED_TESTS},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{path:evPath,sha256:shaRepo(evPath),outputs:ev.outputs,results:ev.results,red:ev.red,suite:ev.suite,directed:ev.directed,directed31:ev.directed31,authority:ev.authority},
 rule:{id:'R7D-P32-NO-LAST-WRITE-WINS',text:'The breaks on record that no return has applied, with the break a review states, are read as interruptions by the existing episode semantics: a report belongs to the interruption it names (interruption.episodeId: its identity or the event id of one of its reports), and the same facts apart from the name are one declaration (an exact replay). Nothing else joins two reports; dates that touch, overlap or are equal never do (I9). One interruption is read as R7-D Phase 3.1 read its declaration. With several: none replaces another; every one is screened clinically first; each later one must name its relation (the earlier break\'s episodeId: a correction; its own: a separate break), or the relation is asked (INTERRUPTION_RELATION) and no return dose is chosen; a correction of an applied break waits while a break not applied is on record (asked when stated, otherwise not read: notApplied). Separate breaks stay separate facts (separateBreaks): the return reads the stop that ends with the latest of them and runs back through each earlier one whose days reach or touch it, or with nothing trained between (every planned session between them reported not done, or none planned); recorded training between them ends the stop there; unreported training between them is asked (TRAINING_BETWEEN_BREAKS). No duration is added and no break is merged.',
  founder:'Phase 3.2 (phase32/AUTHORIZATION_PHASE32.md): no last-write-wins over unresolved interruption facts; explicit correction only; relation asked; separate breaks by factual continuity'},
 noNewNumber:'Phase 3.2 adds no dose, threshold, increment, tolerance, cadence, return recipe, taper, race, strength or learning authority: the return is the unchanged R6-NONCLINICAL-RETURN recipe, classed by the days of the stop the facts establish. Offline synthetic shadow reference only; V1_COACHING_AUTHORITY_READY stays NO.',
 closedDefect:{id:'SSCTR-P31-F02',status:'CLOSED in R7-D Phase 3.2 on the paths the rule names (touching, overlapping, nothing trained between, unknown between: asked); NOT closed as a whole family: residual SSCTR-P32-F01 under disclosures (SSCTR CF-P32-02)',witness:`${P32}/probes/f02-witness.mjs`,before:ev.results?.witness?.freeze2??null,after:ev.results?.witness?.candidate??null,measured:'P18 and INSERT_NEWER_BREAK (R7D-HARNESS-4, R7D-PREREG-4)'},
 disclosures:{
  f08:{ids:['QE-R7D-P31-01','SSCTR-P31-F03','SSCTR-P32-F02'],status:'KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY',owner:'After R7-D and before any consumer or V1 coaching authority: Founder/PCG with qualified SSCTR/clinical-domain review (G04 owners, G03)',text:"KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY holds while a kept break's stated reason is clinical: a qualified clearance is not R7-D authority to convert a clinical-cause interruption into the nonclinical recipe, and the break routes to a human at every later decision; a newer nonclinical break that names none no longer replaces it (it did on R7D-FREEZE-2: the F03 relabel path). An explicit named correction of the reason to nonclinical is honoured as the athlete's statement, not as clearance, and re-enters through the nonclinical recipe as on R7D-FREEZE-2: its free text is still screened and current eligibility must be NONCLINICAL_CONFIRMED with every clinical flag false (SSCTR CF-P32-04). No runtime expansion."},
  residuals:[
   "SSCTR-P32-F01 (no envelope; identical to R7D-FREEZE-2): with any recorded session of the plan between two separate breaks (either sport, completed or with minutes, even a 5-minute aborted run) the earlier break has no decision effect; the re-entry is classed by the later break alone and resumes the doses executed before the earlier break and since (a 14-day holiday, one session, a 4-day trip: SHORT with THRESHOLD the next week). P18(a) accepts TRAINING_AFTER on any executed session, so no instrument detects it; a holdout case of break, one session, break is judged on domain grounds. The reading of 'known training between' is the Founder's decision (SSCTR CF-P32-02, CF-P32-03).",
   "SSCTR-P32-F03 / QE-R7D-P32-03 (with QE-R7D-P31-12; equal to R7D-FREEZE-2): dateless reports with equal facts stated on different days are one declaration.",
   "SSCTR-P32-F04 (consumer condition, fail-closed): a conflicted session listed in TRAINING_BETWEEN_BREAKS is answered only by a correction of the conflicting report (correctionOf).",
   "QE-R7D-P32-02: two declarations with equal clocks decide by their order in the record (one order applies, the other asks); fail-closed in one order, no fact dropped; unreachable by the evaluation client.",
   "QE-R7D-P32-04 (extension of QE-R7D-P31-10): a report id re-sent with other facts is read over the kept row in that decision but not recorded; it can bypass the no-last-write-wins rule; unreachable by the evaluation client; consumer condition: never re-send a report id with other facts.",
   "QE-R7D-P32-05: after a return that applied separate breaks, the earlier break's identity is not addressable; naming the return's episode with one break's corrected facts replaces the whole stop; consumer condition: restate the whole stop under the return's episode.",
   "QE-R7D-P32-01, reconciled in the instruments (R7D-PREREG-4 addendum Δ9): RESTATE_DECLARED_BREAK does not restate a stated correction of an applied break while another break is stated in its window (B4), and a kept correction listed in notApplied is not asked again unless it is sent again."],
  ssctrFindings:ss.findings??null,engineeringFindings:en.findings??null},
 routed:[{ids:['SSCTR-P32-F01','SSCTR-P32-F03'],to:'Founder, then the next authorized runtime or interface mission'},{ids:['SSCTR-P32-F02','QE-R7D-P31-01'],to:'Founder/PCG with the G04 owners and G03 (F08)'},{ids:['SSCTR-P32-F04','QE-R7D-P32-04','QE-R7D-P32-05'],to:'G03 and the interface owner (consumer conditions, INTERFACE-4 section 3)'},{ids:['QE-R7D-P32-02','QE-R7D-P32-03'],to:'next authorized runtime mission (Engineering)'}],
 testGaps:{phase32:{id:'QE-R7D-P32-06',owner:'Engineering',trigger:'the next authorized runtime phase',text:'9 of the 18 engineering mutants survive the suite; first QM32-10 (an earlier separate break with a missing or unclear reason read without the reason question), QM32-13 (invalid facts read without asking), QM32-06 (a conflicted report between breaks read as no training); then QM32-02, QM32-05, QM32-14. Tests cannot be added now without changing the reviewed test bytes.'},inherited:'The R7D-FREEZE-2 test gaps (QE-R7D-P31-05, QM31-07 first) stand'},
 reviews:{ssctr:{recordId:ss.recordId,path:ssPath,sha256:shaRepo(ssPath),disposition:ss.disposition,conditions:ss.conditionsForFreeze??ss.conditions??[]},engineering:{recordId:en.recordId,path:enPath,sha256:shaRepo(enPath),verdict:en.verdict,conditions:en.conditionsForFreeze??en.conditions??[]},postReview},
 instruments:{harness:'R7D-HARNESS-4',prereg:{path:`${AUD}/PREREGISTRATION_R7D_4.md`,sha256:shaRepo(`${AUD}/PREREGISTRATION_R7D_4.md`),revision:'R7D-PREREG-4'},interface:'R7D-INTERFACE-4 (INTERFACE_ONLY_R7D.md + INTERFACE_DELTA_R7D_2.md + INTERFACE_DELTA_R7D_3.md + INTERFACE_DELTA_R7D_4.md)',finalBrief:`${AUD}/author/AUTHOR_BRIEF_FINAL_R7D_3.md`,validation:`${AUD}/harness/validation/HARNESS_VALIDATION_R7D_4.json`},
 authorization:{path:`${P32}/AUTHORIZATION_PHASE32.md`,sha256:shaRepo(`${P32}/AUTHORIZATION_PHASE32.md`)},
 humanRevalidationQueue:{path:QUEUE,sha256:shaRepo(QUEUE),items:q.items.length,added:[],proposed:[ss.proposedHumanRevalidation?.item?.queue_id??null].filter(Boolean),note:'Unchanged since R7D-FREEZE-2: Phase 3.2 has no queue authorization. The proposed item stays proposed for its authorized owner (coordinator, Chief or Founder) in a phase that authorizes it, naming R7D-FREEZE-3 (SSCTR CF-P32-08).'},
 bindingConditions:{inherited:{from:PRED.revision,record:PRED.record,note:'Every binding condition of R7D-FREEZE-2 travels unchanged with this runtime.'},added:['The conditions of the two Phase 3.2 reviews, listed under reviews','R7D-PREREG-4 Δ7 consumer conditions: name a correction (episodeId); never generate episodeId values; answer INTERRUPTION_RELATION by restating the newer break with the athlete\'s episodeId; answer TRAINING_BETWEEN_BREAKS as UNREPORTED_TRAINING']},
 testChanges:{updatedAssertions:UPDATED_TESTS,why:'Each encoded a newer unnamed declaration replacing a kept, unapplied one (F02): R7-D Phase 3.1 T6 asserted that an unnamed newer break replaces the kept one; R7-A.1 C4/C5 corrected a kept return report by re-sending it without its episodeId. Each now names the break it corrects (unnamed, the relation is asked). Each as it stood at R7D-FREEZE-2 fails on this runtime; T6 as updated fails on R7D-FREEZE-2 (evidence red).'},
 finalHoldoutExists:false,V1_COACHING_AUTHORITY_READY:'NO',
 verifier:'node CoachingCore/scripts/verify-r7d-3.mjs (read-only; --suite also re-runs the suite and the conformance checks; --write writes only CoachingCore/r7/d/VERIFICATION_R7D_3.json)'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),record:path.relative(repo,target),sha256:shaRepo(path.relative(repo,target))},null,1));
