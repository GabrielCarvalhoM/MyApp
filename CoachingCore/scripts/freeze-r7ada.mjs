// COACHING CORE — R7-A DECISION AUTHORITY single freeze (node scripts/freeze-r7ada.mjs): binds the runtime, tests and policy both reviews read,
// on the same bytes, together with the evidence recorded on those bytes before the freeze (Founder request §38: source digest, manifest, branch,
// HEAD/base commit, runtime delta, tests, properties, probes, mutation, regressions) and the Cloud git state (§39). There is one freeze,
// R7A-DECISION-AUTHORITY-FREEZE-1: an existing freeze file is never overwritten and a second one is refused. The freeze is refused while the
// suite fails, while any recorded evidence ran on other bytes or failed, while a pre-freeze gate (§37) is open, or while closed history (§3)
// differs from its baseline. The delta is stated against STATE-MODEL-CONSUMER-FREEZE-1 (the byte-exact copy in
// audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source). After it the runtime is not changed.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7A-DECISION-AUTHORITY-FREEZE-1';
const dir=path.join(cc,'r7/decision-authority'),target=path.join(dir,'RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json');
const AUDIT='audits/domain-coaching-r7a-decision-authority-2026-10-29/',PROBES=AUDIT+'probes/',BASE_BRANCH='r7/decision-authority-closure-base';
if(fs.existsSync(dir)&&fs.readdirSync(dir).some(f=>/^RUNTIME_FREEZE_/.test(f)))throw Error('The decision authority closure has its single freeze already; no further freeze (Founder request §38)');
const shaAt=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),sha=p=>shaAt(path.join(cc,p)),shaRepo=p=>shaAt(path.join(repo,p)),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const refuse=why=>{throw Error('Freeze refused: '+why);};
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8'});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout.replace(/\n$/,'');};
// The bound files: runtime, tests, policy, dev fixtures, package.json (as STATE-MODEL-CONSUMER-FREEZE-1 binds them).
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const pf=json(AUDIT+'state-consumer-freeze-source/MANIFEST.json'),prior=p=>pf.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(pf.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const manifestDigest=hash(files);
// Closed history (§3): every file the baseline bound before the first edit is unchanged, except this mission's own runtime, tests, scripts and
// folders, and the mission files, which are append-only (checked against the base commit).
const baseline=json(AUDIT+'BASELINE.json'),ownPrefixes=['CoachingCore/src/','CoachingCore/test/','CoachingCore/scripts/','CoachingCore/r7/decision-authority/',AUDIT];
const drift=baseline.entries.filter(e=>!ownPrefixes.some(p=>e.path.startsWith(p))&&!['CURRENT_MISSION.md','MISSION_LEDGER.md'].includes(e.path)).filter(e=>!fs.existsSync(path.join(repo,e.path))||shaRepo(e.path)!==e.sha256).map(e=>e.path);
if(drift.length)refuse('closed history differs from the baseline: '+drift.slice(0,20).join(', '));
const ownEdits=baseline.entries.filter(e=>ownPrefixes.some(p=>e.path.startsWith(p))&&(!fs.existsSync(path.join(repo,e.path))||shaRepo(e.path)!==e.sha256)).map(e=>e.path);
const notInScope=ownEdits.filter(p=>!(Object.keys(files).map(f=>'CoachingCore/'+f).includes(p)));
if(notInScope.length)refuse('baseline files changed outside the runtime and tests: '+notInScope.join(', '));
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${BASE_BRANCH}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!now.subarray(0,base.length).equals(base))refuse(f+' is not an append-only extension of '+BASE_BRANCH);}
const pred=pf.freeze;if(shaRepo(pred.file)!==pred.fileSha256)refuse('STATE-MODEL-CONSUMER-FREEZE-1 freeze file changed');
const growth='audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch';if(shaRepo(growth)!=='6b737179873535dac0ebc950aa0637866ea2c32df396cf9b93a80654940820d6')refuse('the Growth Layer patch changed');
// The suite, on these bytes.
const t=spawnSync(process.execPath,['--test','--test-reporter=spec'],{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={tests:n('tests'),pass:n('pass'),fail:n('fail'),node:process.version};
if(t.status!==0||tests.fail!==0||!(tests.pass>0))refuse('the suite does not pass on these bytes: '+JSON.stringify(tests));
// The properties P1-P7 and the exact finding regressions, by name, in the passing suite.
const NAMES=['P1 factual independence','P2 context consistency','P2 review closure','P3 no calendar progression','P4 gate order independence','P5 future session is not fact','P6 walk/jog ceiling','P7 execution promotion','QE-R7ASC-01','QE-R7ASC-02','QE-R7ASC-03','QE-R7ASC-04','SSCTR F4','HOLD (Founder 1.3)','MAINTAIN (Founder §23)'];
const passed=[...t.stdout.matchAll(/^✔ (.+?) \(\d/gm)].map(m=>m[1]),properties=Object.fromEntries(NAMES.map(k=>[k,passed.filter(x=>x.startsWith(k)).length]));
if(Object.values(properties).some(v=>!v))refuse('a property or finding regression is not in the passing suite: '+JSON.stringify(properties));
// The evidence recorded before the freeze, each bound to this source digest.
const ev=json(PROBES+'EVIDENCE_RUNS_R7ADA.json'),REQUIRED=['blockers.predecessor','blockers.candidate','tests-on-predecessor','self-challenge.candidate','self-challenge.predecessor','judges','regression','ablation','mutation'];
const evBad=ev.runs.filter(r=>r.exit!==0||r.sourceDigestStart!==sourceDigest||r.sourceDigestEnd!==sourceDigest).map(r=>r.name),evMissing=REQUIRED.filter(x=>!ev.runs.some(r=>r.name===x));
if(evBad.length||evMissing.length)refuse('evidence runs not bound to '+sourceDigest+', failed or missing: '+JSON.stringify({evBad,evMissing}));
const evDrift=ev.runs.filter(r=>r.outSha256&&shaRepo(r.output)!==r.outSha256).map(r=>r.name);if(evDrift.length)refuse('evidence outputs changed after their run: '+evDrift.join(', '));
const kit=json(PROBES+'kit-final/RUNS.json'),kitUnbound=kit.runs.filter(r=>r.sourceDigestStart!==sourceDigest||r.sourceDigestEnd!==sourceDigest).map(r=>r.name);
if(kitUnbound.length)refuse('SSCTR kit runs not bound: '+kitUnbound.join(', '));
const named=json(PROBES+'NAMED_DIFFERENCES_R7ADA.json');
if(named.unnamed.length||kit.runs.some(r=>r.exit!==0&&!named.kit.named.includes(r.name)))refuse('kit or judge differences without a named cause: '+JSON.stringify(named.unnamed));
// The pre-freeze gates (§37).
const B=json(PROBES+'runs/candidate/BLOCKERS.json'),BP=json(PROBES+'runs/baseline-predecessor/BLOCKERS.json');
const closed={'QE-R7ASC-01':!B.present['QE-R7ASC-01'],'QE-R7ASC-02':!B.presentByMechanism['QE-R7ASC-02'],'QE-R7ASC-03':!B.present['QE-R7ASC-03'],'QE-R7ASC-04':!B.present['QE-R7ASC-04'],F4:!B.present.F4};
if(Object.values(closed).some(v=>!v))refuse('a finding is not closed on the reviewers\' probes: '+JSON.stringify(closed));
if(Object.values(BP.present).some(v=>!v))refuse('a finding is not reproduced on the predecessor: '+JSON.stringify(BP.present));
const sc=json(PROBES+'runs/self-challenge.candidate.out.json'),scp=json(PROBES+'runs/self-challenge.predecessor.out.json');
if(sc.total.violations!==0)refuse('self-challenge violations on the candidate: '+JSON.stringify(sc.total));
const mut=json(PROBES+'runs/mutation.out.json'),survivors=mut.mutants.filter(m=>m.applied&&!m.killed).map(m=>m.id),notApplied=mut.mutants.filter(m=>!m.applied).map(m=>m.id);
if(survivors.length||notApplied.length)refuse('mutation: survivors or mutants not applied: '+JSON.stringify({survivors,notApplied}));
const reg=json('CoachingCore/r7/decision-authority/REGRESSION_R7ADA.json'),regDrift=Object.entries(reg.runtimes.current.sources).filter(([p,h])=>shaRepo(p)!==h).map(([p])=>p);
if(regDrift.length)refuse('the regression ran on other sources: '+regDrift.join(', '));
const rn=json('CoachingCore/r7/decision-authority/REGRESSION_R7ADA_NAMED.json');
if(rn.verdict.unclassifiedDifferences!==0||rn.verdict.unreadRose.length||rn.verdict.strengthDoseRose!==0)refuse('regression differences or rises without a named class: '+JSON.stringify(rn.verdict));
const tp=json(PROBES+'runs/tests-on-predecessor.out.json');
// The Cloud git state (§39), recorded before the freeze.
const gitState={branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),base:{branch:BASE_BRANCH,commit:git('rev-parse',BASE_BRANCH)},statusShort:git('status','--short').split('\n').filter(Boolean),diffStat:git('diff','--stat').split('\n').filter(Boolean)};
if(gitState.branch!=='claude/trusting-euler-04la8t')refuse('not on the Cloud session branch: '+gitState.branch);
if(gitState.head!==gitState.base.commit)refuse('HEAD moved from the base commit before the freeze: '+gitState.head);
const bind=p=>({path:p,sha256:shaRepo(p)});
const out={revision,frozenAt:new Date().toISOString(),node:process.version,
 sourceRevision:{baseline:AUDIT+'BASELINE.json',baselineSha256:shaRepo(AUDIT+'BASELINE.json'),predecessor:pred.revision,predecessorSourceDigest:pred.sourceDigest,predecessorManifestDigest:pred.manifestDigest,predecessorFreezeFile:{path:pred.file,sha256:pred.fileSha256}},
 git:gitState,
 policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,manifestDigest,runtimeFiles:Object.keys(files).filter(p=>p.startsWith('src/')),files,
 deltaFromPredecessorFreeze:{changed,added,removed,baseline:AUDIT+'state-consumer-freeze-source/MANIFEST.json',priorFreezeSourceDigest:pred.sourceDigest},
 tests:{...tests,propertiesAndFindingRegressions:properties,onPredecessor:{...bind(PROBES+'runs/tests-on-predecessor.out.json'),total:tp.total,passing:tp.passing,failing:tp.failing.length}},
 preFreezeGates:{findingsClosedOnReviewersProbes:closed,reproducedOnPredecessor:BP.present,qeR7asc02LiteralCriterion:{present:B.present['QE-R7ASC-02'],cells:B.blockers['QE-R7ASC-02'].literalCells,reading:'the unreviewed cell prescribes less than the reviewed one (an open, incomplete week earns nothing; the closed week credits its executed easy runs); the probe\'s history projection omits easyExtra and devCount, on which the two histories differ (E1/E3, QE-R7ASM-05). No cell has the plan ahead of history.'},
  selfChallenge:{candidate:sc.total,predecessor:scp.total},mutation:{mutants:mut.mutants.length,killed:mut.mutants.filter(m=>m.killed).length,survivors},regression:rn.verdict,closedHistory:{baselineFilesChecked:baseline.entries.length,drift:0,growthPatch:'unchanged, not applied',missionFiles:'append-only against '+BASE_BRANCH}},
 evidence:{
  probes:{...bind(PROBES+'EVIDENCE_RUNS_R7ADA.json'),runs:ev.runs.length,boundTo:sourceDigest},
  ssctrKit:{...bind(PROBES+'kit-final/RUNS.json'),runs:kit.runs.length,boundTo:sourceDigest},
  namedDifferences:bind(PROBES+'NAMED_DIFFERENCES_R7ADA.json'),
  mutation:bind(PROBES+'runs/mutation.out.json'),
  regression:{...bind('CoachingCore/r7/decision-authority/REGRESSION_R7ADA.json'),named:bind('CoachingCore/r7/decision-authority/REGRESSION_R7ADA_NAMED.json'),summary:reg.summary},
  documents:['FOUNDER_REQUEST.md','TASK_CONTRACT.md','DECISION_AUTHORITY_CONTRACT.md','dossier/CONSUMER_AUDIT.md'].map(p=>bind(AUDIT+p))},
 rule:'The runtime is frozen: both independent reviews read these bytes, and no reviewer runs in the session that froze it (Founder request §38, §40). After the reviews, only a material violation of factual authority, correction/retraction consistency, coherent decision resolution, temporal/evidence-based progression or return <= factual tolerated dose, or a direct sports regression in F1-F4, D53/D56-D59, HOLD, MAINTAIN or return/restoration, can block this foundation; any other finding goes to the backlog (Founder request §43).'};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,manifestDigest,policyHash:out.policyHash,files:Object.keys(files).length,tests,changed,added,removed,git:{branch:gitState.branch,head:gitState.head}}));
