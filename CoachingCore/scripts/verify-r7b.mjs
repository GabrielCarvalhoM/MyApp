// R7-B read-only verification of R7B-RUNTIME-REPERTOIRE-FREEZE-1 (node scripts/verify-r7b.mjs [--tests] [--write]). It recomputes every bound
// file's SHA-256, the source and manifest digests, the policy canonical hash, the catalog binding and the unchanged inputs, and with --tests
// re-runs the suite and compares the count. --write writes only CoachingCore/r7/b/VERIFICATION_R7B.json. It never writes anything else.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
// --freeze 1|2 picks the record (default: the latest present). FREEZE-1 is superseded by FREEZE-2 after the fix cycle and verifies at its own
// commit (4995d58); --write writes VERIFICATION_R7B.json (FREEZE-1) or VERIFICATION_R7B_2.json (FREEZE-2).
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),fi=process.argv.indexOf('--freeze'),which=fi>=0?process.argv[fi+1]:fs.existsSync(path.join(cc,'r7/b/RUNTIME_FREEZE_R7B_2.json'))?'2':'1',suffix=which==='2'?'_2':'',rec=JSON.parse(fs.readFileSync(path.join(cc,'r7/b/RUNTIME_FREEZE_R7B'+suffix+'.json'),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(path.resolve(cc,p))).digest('hex'),shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const checks=[],ok=(id,pass,detail=null)=>checks.push({id,pass:!!pass,...(detail?{detail}:{})});
const now=Object.fromEntries(Object.keys(rec.files).map(p=>[p,fs.existsSync(path.resolve(cc,p))?sha(p):null]));
const differing=Object.keys(rec.files).filter(p=>now[p]!==rec.files[p]);ok('files',!differing.length,differing.length?differing:null);
ok('sourceDigest',hash(Object.fromEntries(Object.entries(now).filter(([p])=>p.startsWith('src/'))))===rec.sourceDigest);
ok('manifestDigest',hash(now)===rec.manifestDigest);
const srcNow=fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),unbound=srcNow.filter(p=>!(p in rec.files));ok('noUnboundRuntimeFile',!unbound.length,unbound.length?unbound:null);
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));ok('policy',hash(policy)===rec.policy.canonicalHash&&rec.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c');
ok('catalog',sha('r7/b0/REPERTOIRE_CATALOG_B0.json')===rec.catalogBinding.sha256&&rec.catalogBinding.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9');
ok('records',shaRepo(rec.catalogBinding.records)===rec.catalogBinding.recordsSha256);
for(const [p,h] of Object.entries(rec.unchangedInputs))ok('unchanged:'+p,shaRepo(p)===h);
for(const k of Object.keys(rec.evidence))ok('evidence:'+k,sha(rec.evidence[k].report)===rec.evidence[k].sha256);
ok('testChangesRecord',shaRepo(rec.testChanges.record)===rec.testChanges.sha256);
if(process.argv.includes('--tests')){const t=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);ok('tests',n('tests')===rec.tests.count&&n('fail')===0,{count:n('tests'),fail:n('fail')});}
const result={check:'R7B-VERIFICATION',freeze:rec.revision,sourceDigest:rec.sourceDigest,manifestDigest:rec.manifestDigest,passed:checks.filter(c=>c.pass).length,total:checks.length,result:checks.every(c=>c.pass)?'PASS':'FAIL',checks};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(cc,'r7/b/VERIFICATION_R7B'+suffix+'.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify({...result,checks:result.checks.filter(c=>!c.pass)},null,1));
process.exitCode=result.result==='PASS'?0:1;
