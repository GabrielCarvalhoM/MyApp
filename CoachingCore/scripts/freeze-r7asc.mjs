// COACHING CORE — STATE MODEL CONSUMER CLOSURE single freeze (node scripts/freeze-r7asc.mjs): binds the runtime, tests and policy both reviews
// read, on the same bytes, together with the evidence recorded on those bytes before the freeze (Founder §28: digest, manifest, source revision,
// runtime files, tests, probes, mutation, regressions). There is one freeze, STATE-MODEL-CONSUMER-FREEZE-1: an existing freeze file is never
// overwritten and a second one is refused, and the freeze is refused while the suite fails or any recorded evidence ran on other bytes. The delta
// is stated against HISTORICAL-PROJECTION-FREEZE-1 (the byte-exact copy in audits/domain-coaching-r7a-state-consumer-2026-10-29/
// state-model-freeze-source). After it the runtime is not changed (Founder §28, §29).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='STATE-MODEL-CONSUMER-FREEZE-1';
const dir=path.join(cc,'r7/state-consumer'),target=path.join(dir,'RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json');
const AUDIT='audits/domain-coaching-r7a-state-consumer-2026-10-29/',PROBES=AUDIT+'probes/';
if(fs.existsSync(dir)&&fs.readdirSync(dir).some(f=>/^RUNTIME_FREEZE_/.test(f)))throw Error('The state model consumer closure has its single freeze already; no further freeze (Founder request §28)');
const shaAt=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),sha=p=>shaAt(path.join(cc,p)),shaRepo=p=>shaAt(path.join(repo,p)),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const pf=JSON.parse(fs.readFileSync(path.join(repo,AUDIT,'state-model-freeze-source/MANIFEST.json'),'utf8'));
const prior=p=>pf.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(pf.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const manifestDigest=hash(files);
// The suite, on these bytes.
const t=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={tests:n('tests'),pass:n('pass'),fail:n('fail'),node:process.version};
if(t.status!==0||tests.fail!==0||!(tests.pass>0))throw Error('The suite does not pass on these bytes: '+JSON.stringify(tests));
// The evidence recorded before the freeze, each bound to this source digest (and, for the mutation check, to these test files).
const refuse=why=>{throw Error('Freeze refused: '+why);};
const ev=json(PROBES+'EVIDENCE_RUNS_R7ASC.json'),evBad=ev.runs.filter(r=>r.skipped||r.exit!==0||r.sourceDigestStart!==sourceDigest||r.sourceDigestEnd!==sourceDigest).map(r=>r.name);
if(evBad.length)refuse('evidence runs not bound to '+sourceDigest+' or failed: '+evBad.join(', '));
const kit=json(PROBES+'kit-final/RUNS.json'),kitBad=kit.runs.filter(r=>r.exit!==0||r.sourceDigestStart!==sourceDigest||r.sourceDigestEnd!==sourceDigest).map(r=>r.name);
if(kitBad.length)refuse('SSCTR kit runs not bound or failed: '+kitBad.join(', '));
const mut=json(PROBES+'mutation-check-r7asc.out.json'),mutTestsDrift=Object.entries(mut.bound?.tests??{}).filter(([p,h])=>files[p]!==h).map(([p])=>p);
if(mut.bound?.sourceDigest!==sourceDigest||mutTestsDrift.length)refuse('the mutation check ran on other bytes: '+JSON.stringify({sourceDigest:mut.bound?.sourceDigest,mutTestsDrift}));
const survivors=mut.results.filter(r=>r.applied&&!r.caught).map(r=>r.mutation),doc=json(PROBES+'MUTATION_SURVIVORS_R7ASC.json').documented??{},undocumented=survivors.filter(s=>!doc[s]),notApplied=mut.results.filter(r=>!r.applied).map(r=>r.mutation);
if(undocumented.length||notApplied.length)refuse('mutation survivors undocumented or mutations not applied: '+JSON.stringify({undocumented,notApplied}));
const reg=json('CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json'),regDrift=Object.entries(reg.runtimes.current.sources).filter(([p,h])=>shaRepo(p)!==h).map(([p])=>p);
if(regDrift.length)refuse('the regression ran on other sources: '+regDrift.join(', '));
const named=json('CoachingCore/r7/state-consumer/REGRESSION_R7ASC_NAMED.json');
if(named.verdict.unclassifiedDifferences!==0)refuse('regression differences without a named class: '+named.verdict.unclassifiedDifferences);
const bind=p=>({path:p,sha256:shaRepo(p)});
const out={revision,frozenAt:new Date().toISOString(),node:process.version,sourceRevision:{baseline:AUDIT+'BASELINE.json',baselineSha256:shaRepo(AUDIT+'BASELINE.json'),predecessor:pf.freeze.revision,predecessorSourceDigest:pf.freeze.sourceDigest},
 policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,manifestDigest,runtimeFiles:Object.keys(files).filter(p=>p.startsWith('src/')),files,
 deltaFromPredecessorFreeze:{changed,added,removed,baseline:AUDIT+'state-model-freeze-source/MANIFEST.json',priorFreezeSourceDigest:pf.freeze.sourceDigest},
 tests,
 evidence:{
  probes:{...bind(PROBES+'EVIDENCE_RUNS_R7ASC.json'),runs:ev.runs.length,boundTo:sourceDigest},
  ssctrKit:{...bind(PROBES+'kit-final/RUNS.json'),runs:kit.runs.length,boundTo:sourceDigest},
  mutation:{...bind(PROBES+'mutation-check-r7asc.out.json'),survivorsDocument:bind(PROBES+'MUTATION_SURVIVORS_R7ASC.json'),total:mut.total,caught:mut.caught,survivors,boundTo:mut.bound.sourceDigest},
  regression:{...bind('CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json'),named:bind('CoachingCore/r7/state-consumer/REGRESSION_R7ASC_NAMED.json'),summary:reg.summary,verdict:named.verdict}},
 rule:'The runtime is frozen: both independent reviews read these bytes, and no reviewer runs in the session that froze it (Founder request §28, §29). After the reviews, only a material violation of Properties A-D or a direct sports regression (F1, F2, F3, D53-D59) can block this foundation; any other finding goes to the backlog (Founder request §34).'};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,manifestDigest,policyHash:out.policyHash,files:Object.keys(files).length,tests,changed,added,removed}));
