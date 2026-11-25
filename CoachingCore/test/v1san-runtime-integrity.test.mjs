// REPMILE V1 test-suite sanitization (2026-11-25): the integrity of the runtime in force, independent of the test suite around it.
//
// Every earlier record test asserts "nothing else changed in CoachingCore since <its base>", tests included, so each later line (even one that
// only adds a test) made it fail by design, and a successor had to be written (51 failures by 90452b8). This test checks what those records
// protect, by class, so that test-only work never needs another successor:
// - the RUNTIME is the bytes REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2 binds: every consumed file byte-identical, no consumed file added or
//   removed, the amended JavaScriptCore bundle the one recorded, the dependencies and lockfile unchanged;
// - every RECORD is its sealed bytes: the three records of the amendment chain at their own commits, and every record under v1/ as of 90452b8;
// - the earlier verifiers fail ONLY on test infrastructure (test/**, scripts/suite-*.mjs, package.json's scripts) beyond what amendment-2 declares.
// A change of src/ or of a file the runtime reads fails here, as it should: it is an amendment, with its own record (HISTORICAL_TEST_POLICY.md).
// Successor of v1hr5r-successors.test.mjs tests 1 and 2 (test/HISTORICAL_TESTS.json), which assert that the record verifiers pass outright.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';

const ROOT=path.resolve(import.meta.dirname,'../..');
const ANCHOR='90452b8';
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28});
const shaAt=(commit,f)=>createHash('sha256').update(execFileSync('git',['show',`${commit}:${f}`],{cwd:ROOT,maxBuffer:1<<28})).digest('hex');
const verify=script=>spawnSync(process.execPath,[path.join(ROOT,'CoachingCore/scripts',script),'--check'],{cwd:ROOT,encoding:'utf8'});
const REC=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json'),'utf8'));
/** Test infrastructure: what may change without touching the runtime. Nothing under src/, v1/, fixtures/, artifacts/ or the lockfile. */
const INFRA=f=>/^CoachingCore\/test\//.test(f)||/^CoachingCore\/scripts\/suite-[\w-]+\.mjs$/.test(f)||f==='CoachingCore/package.json';
/** The files the runtime reads, exactly as the amendment verifiers compute them (src/**.mjs and every data file they open by URL). */
function consumed(){
 const walk=d=>fs.readdirSync(path.join(ROOT,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
 const src=walk('CoachingCore/src').filter(f=>f.endsWith('.mjs')).sort(),data=new Set();
 for(const f of src)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/new URL\('([^']+)',import\.meta\.url\)/g))data.add(path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1])));
 return [...src,...[...data].sort()];
}

test('the runtime in force is the bytes REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2 binds: every consumed file, nothing added or removed, the amended bundle',()=>{
 assert.equal(REC.revision,'REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2');
 assert.equal(REC.fileCount,Object.keys(REC.files).length);
 assert.equal(REC.filesDigest,createHash('sha256').update(JSON.stringify(REC.files)).digest('hex'),'the record is internally consistent');
 const changed=Object.entries(REC.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f);
 assert.deepEqual(changed,[],'every file the runtime reads is the bound bytes');
 assert.deepEqual([...consumed()].sort(),Object.keys(REC.files).sort(),'the runtime reads exactly the bound files');
 assert.equal(sha(REC.bundle.file),REC.bundle.sha256,'the amended JavaScriptCore bundle is the recorded one');
});
test('dependencies are unchanged: package.json differs from 90452b8 at most in its scripts, and the lockfile is byte-identical',()=>{
 const now=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/package.json'),'utf8')),was=JSON.parse(git('show',`${ANCHOR}:CoachingCore/package.json`));
 const {scripts:_a,...a}=now,{scripts:_b,...b}=was;assert.deepEqual(a,b);
 for(const k of Object.keys(was.scripts))if(k!=='test')assert.equal(now.scripts[k],was.scripts[k],'an earlier script is kept as it was: '+k);
 assert.equal(sha('CoachingCore/package-lock.json'),shaAt(ANCHOR,'CoachingCore/package-lock.json'));
});
test('every record is its sealed bytes: the amendment chain at its own commits, and every record under v1/ as of 90452b8',()=>{
 for(const [f,c] of [['CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json','6482749'],['CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json','bec39c5'],['CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json','9a88521']])
  assert.equal(sha(f),shaAt(c,f),f+' is the bytes of '+c);
 const at=git('ls-tree','--name-only',`${ANCHOR}:CoachingCore/v1`).split('\n').filter(f=>f.endsWith('.json'));
 assert.ok(at.length>=24);
 for(const n of at){const f='CoachingCore/v1/'+n;assert.ok(fs.existsSync(path.join(ROOT,f)),f+' is kept');assert.equal(sha(f),shaAt(ANCHOR,f),f+' is not rewritten');}
});
test('successor of v1hr5r-successors.test.mjs (the amendment-2 verifier passes): it fails, if at all, only because test infrastructure was added or changed',()=>{
 const r=verify('v1-hr5-runna-amendment.mjs');
 if(r.status===0){assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2: 91\/91 consumed files byte-identical/);return;}
 const lines=r.stderr.split('\n').filter(Boolean);assert.ok(lines.length>0);
 for(const l of lines){
  assert.match(l,/^(CHANGED and not declared|UNTRACKED): /,'only the "nothing else changed" step may fail: '+l);
  const named=l.replace(/^[A-Z ]+(and not declared)?: /,'').split(', ').map(s=>s.trim()).filter(Boolean);
  assert.ok(named.length>0&&named.every(INFRA),'a file that is not test infrastructure: '+named.filter(f=>!INFRA(f)).join(', '));
 }
});
test('successor of v1hr5r-successors.test.mjs (AMENDMENT-1 and the original freeze fail only on what amendment-2 declares): the same, with test infrastructure allowed',()=>{
 const DECLARED=[...REC.amended.map(a=>a.file),...Object.keys(REC.amendedTests),...REC.added,...REC.addedConsumed,...REC.noLongerConsumed,'CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json'];
 const first=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json'),'utf8'));
 for(const script of ['v1-five-zone-amendment.mjs','v1-final-release-freeze.mjs']){
  const r=verify(script);assert.notEqual(r.status,0,script+' must not pass over the amended bytes');
  const allowed=new Set(script==='v1-final-release-freeze.mjs'?[...DECLARED,'CoachingCore/src/v1-run-calibration.mjs','CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json',...first.addedConsumed,...first.added]:DECLARED);
  for(const l of r.stderr.split('\n').filter(Boolean)){
   const named=[...l.matchAll(/CoachingCore\/[\w./-]+|audits\/[\w./-]+/g)].map(m=>m[0].replace(/[,.]$/,''));
   assert.ok(named.every(f=>allowed.has(f)||INFRA(f)),script+': an undeclared file in: '+l);
   assert.ok(/RC-1|CHANGED and not declared|bundle module not the bound source|bundle asset differs|NOT byte-identical|NOT BOUND|UNTRACKED|CONSUMED and not declared|other bound files byte-identical|not in the amended bundle|five-zone values|diff is not the recorded|bundle is not the one|enabling state/.test(l),script+': an unexpected kind of failure: '+l);
  }
 }
});
