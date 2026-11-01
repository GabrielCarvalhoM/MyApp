// R7-B.2 read-only verification of R7B2-FREEZE-1 (node scripts/verify-r7b2.mjs [--tests] [--write]). It recomputes every bound file's SHA-256,
// the source and manifest digests, the policy canonical hash, the catalog binding, the predecessor record, the unchanged inputs (with the human
// queue), every evidence report and probe record, the test-change and blocker-closure records, and with --tests re-runs the suite and compares the
// count. --write writes only CoachingCore/r7/b2/VERIFICATION_R7B2_1.json. It never writes anything else and runs nothing that writes.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..');
const rec=JSON.parse(fs.readFileSync(path.join(cc,'r7/b2/RUNTIME_FREEZE_R7B2_1.json'),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(path.resolve(cc,p))).digest('hex'),shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const checks=[],ok=(id,pass,detail=null)=>checks.push({id,pass:!!pass,...(detail?{detail}:{})});
ok('revision',rec.revision==='R7B2-FREEZE-1'&&rec.mission==='DOMAIN_COACHING_R7-B.2');
const now=Object.fromEntries(Object.keys(rec.files).map(p=>[p,fs.existsSync(path.resolve(cc,p))?sha(p):null]));
const differing=Object.keys(rec.files).filter(p=>now[p]!==rec.files[p]);ok('files',!differing.length,differing.length?differing:null);
ok('sourceDigest',hash(Object.fromEntries(Object.entries(now).filter(([p])=>p.startsWith('src/'))))===rec.sourceDigest);
ok('manifestDigest',hash(now)===rec.manifestDigest);
const unbound=[...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f)].filter(p=>!(p in rec.files));ok('noUnboundRuntimeOrTestFile',!unbound.length,unbound.length?unbound:null);
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));ok('policy',hash(policy)===rec.policy.canonicalHash&&rec.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c');
ok('catalog',sha('r7/b0/REPERTOIRE_CATALOG_B0.json')===rec.catalogBinding.sha256&&rec.catalogBinding.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9');
ok('records',shaRepo(rec.catalogBinding.records)===rec.catalogBinding.recordsSha256);
ok('predecessorRecord',shaRepo(rec.predecessorFreeze.record)===rec.predecessorFreeze.sha256&&rec.predecessorFreeze.freeze==='R7B1-FREEZE-2');
for(const [p,h] of Object.entries(rec.unchangedInputs))ok('unchanged:'+p,shaRepo(p)===h);
for(const [k,e] of Object.entries(rec.evidence)){
 if(e.report)ok('evidence:'+k,sha(e.report)===e.sha256);else if(e.record)ok('evidence:'+k,shaRepo(e.record)===e.sha256);
 if(k==='probes')for(const [name,x] of Object.entries(e))ok('evidence:probes:'+name,shaRepo(x.record)===x.sha256);
 if(e.inherited)for(const [name,x] of Object.entries(e.inherited))if(x?.record)ok(`evidence:${k}:inherited:${name}`,shaRepo(x.record)===x.sha256);
}
ok('routingCondition',rec.routing?.conditionHolds===true);
ok('testChangesRecord',shaRepo(rec.testChanges.record)===rec.testChanges.sha256);
ok('blockerClosureRecord',shaRepo(rec.blockerClosure.record)===rec.blockerClosure.sha256);
if(process.argv.includes('--tests')){const t=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);ok('tests',n('tests')===rec.tests.count&&n('fail')===0,{count:n('tests'),fail:n('fail')});}
const result={check:'R7B2-VERIFICATION',freeze:rec.revision,sourceDigest:rec.sourceDigest,manifestDigest:rec.manifestDigest,passed:checks.filter(c=>c.pass).length,total:checks.length,result:checks.every(c=>c.pass)?'PASS':'FAIL',checks};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(cc,'r7/b2/VERIFICATION_R7B2_1.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({...result,checks:result.checks.filter(c=>!c.pass)},null,1));
process.exitCode=result.result==='PASS'?0:1;
