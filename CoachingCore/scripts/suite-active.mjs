// REPMILE V1 test-suite sanitization (2026-11-25): the ACTIVE suite of the current CoachingCore (`npm test`).
//
// Phase 1 runs exactly what `node --test` discovers (every test file; nothing filtered by file) except the tests test/HISTORICAL_TESTS.json
// lists: tests that verify a record or a contract of an earlier line (a freeze's own preservation check, a defect a test pinned as open that a
// later versioned amendment closed, an expectation a later reviewed change replaced). Those are not deleted and not edited. Each is executed
// green in its own context, at the commit it belongs to, by `npm run test:historical`, and each names a successor that covers the current
// contract and must pass here.
//
// Phase 2 runs those historical tests, and only those, on this tree. It proves the delegation is exact and honest:
// - every manifest title matches exactly one test, in the file the manifest names, and no other test anywhere (node omits a test excluded by
//   pattern from its report, so this is what shows nothing else was left out);
// - every one of them still FAILS here. A historical test that passes on the current tree means the current tree has gone back to the
//   superseded behaviour (for a pinned defect: the defect is back), or that the entry is stale. Either is a failure of the active suite.
//
// It also fails when a successor is missing or not passing, a historical test file is not its pinned bytes, a test the manifest does not list
// is skipped, or the manifest is malformed.
// Usage (from CoachingCore): node scripts/suite-active.mjs [--junit <file>] [--no-phase2 | --phase2-only]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readManifest,manifestErrors,parseJunit,exactPattern,MANIFEST} from './suite-manifest.mjs';

const CORE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const argv=process.argv.slice(2),opt=k=>argv.includes(k),val=k=>opt(k)?argv[argv.indexOf(k)+1]:null;
const manifest=readManifest(CORE),errors=manifestErrors(manifest);
if(errors.length){for(const e of errors)console.error('MANIFEST: '+e);process.exit(1);}
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(CORE,f))).digest('hex');
for(const e of manifest.entries){const f='test/'+e.file;
 if(!fs.existsSync(path.join(CORE,f)))errors.push(`${e.id}: ${f} is missing (a historical test is kept, never deleted)`);
 else if(sha(f)!==e.fileSha256)errors.push(`${e.id}: ${f} is not the pinned bytes (a historical test is never edited to pass; write a successor)`);}
if(errors.length){for(const e of errors)console.error('HISTORICAL: '+e);process.exit(1);}

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'suite-active-')),junit=val('--junit')?path.resolve(val('--junit')):path.join(tmp,'active.xml');
const key=(file,title)=>`${file}\u0000${title}`,listed=new Set(manifest.entries.map(e=>key(e.file,e.title)));
const node=(args,dest,stdout)=>{const r=spawnSync(process.execPath,['--test',...args,...(stdout?['--test-reporter=spec','--test-reporter-destination=stdout']:[]),'--test-reporter=junit',`--test-reporter-destination=${dest}`],{cwd:CORE,stdio:['ignore',stdout?'inherit':'ignore','inherit'],maxBuffer:1<<28});
 if(!fs.existsSync(dest)){console.error('no junit report was written for '+dest);process.exit(1);}
 const all=parseJunit(fs.readFileSync(dest,'utf8'));return {status:r.status,cases:all.filter(c=>!c.fileLevel),loadFailures:all.filter(c=>c.fileLevel&&c.status==='failed')};};

// ---- Phase 1: the active suite ----
const only2=opt('--phase2-only'),p1=only2?{status:0,cases:[]}:node(manifest.entries.map(e=>`--test-skip-pattern=${exactPattern(e.title)}`),junit,true);
const byKey=new Map(p1.cases.map(c=>[key(c.file,c.name),c])),problems=[];
if(!only2)for(const e of manifest.entries){const s=byKey.get(key(e.successor.file,e.successor.title));
 if(!s)problems.push(`${e.id}: successor not found: ${e.successor.file}: "${e.successor.title.slice(0,100)}"`);
 else if(s.status!=='passed')problems.push(`${e.id}: successor ${s.status}: ${e.successor.file}: "${e.successor.title.slice(0,100)}"`);
 if(byKey.has(key(e.file,e.title)))problems.push(`${e.id}: ran in the active suite although listed as historical`);}
for(const c of p1.cases)if(c.status==='skipped')problems.push(`skipped and not delegated by the manifest: ${c.file}: ${c.name.slice(0,120)}`);
for(const c of p1.loadFailures??[])problems.push(`a test file failed to load: ${c.file}`);
const failed=p1.cases.filter(c=>c.status==='failed'),passed=p1.cases.filter(c=>c.status==='passed');

// ---- Phase 2: the delegated tests, on this tree ----
let p2=null;
if(!opt('--no-phase2')){
 p2=node(manifest.entries.map(e=>`--test-name-pattern=${exactPattern(e.title)}`),path.join(tmp,'historical-at-head.xml'),false);
 for(const c of p2.loadFailures)problems.push(`a test file failed to load: ${c.file}`);
 const seen=new Map();for(const c of p2.cases){const k=key(c.file,c.name);seen.set(k,(seen.get(k)??0)+1);
  if(!listed.has(k))problems.push(`a manifest title also matches a test it does not list: ${c.file}: "${c.name.slice(0,100)}" (it would be left out of the active suite)`);}
 for(const e of manifest.entries){const n=seen.get(key(e.file,e.title))??0,c=p2.cases.find(x=>x.file===e.file&&x.name===e.title);
  if(n!==1)problems.push(`${e.id}: matched ${n} times in ${e.file} (expected exactly once)`);
  else if(c.status==='passed')problems.push(`${e.id}: PASSES on the current tree: it is no longer incompatible with it. If it pins a defect, the defect may be back (${e.contract}); otherwise retire the entry with its provenance. ${e.file}: "${e.title.slice(0,90)}"`);
  else if(c.status!=='failed')problems.push(`${e.id}: ${c.status} on the current tree`);}
}
console.log((only2?`\nHISTORICAL AT HEAD:`:`\nACTIVE SUITE: ${passed.length+failed.length} active tests, ${passed.length} pass, ${failed.length} fail.`)+
 ` HISTORICAL: ${manifest.entries.length} tests delegated by ${MANIFEST} to \`npm run test:historical\` (executed at the commit each belongs to)`+
 (p2?`; on this tree ${p2.cases.filter(c=>c.status==='failed').length}/${manifest.entries.length} of them fail, as declared.`:'; phase 2 not run.'));
for(const p of problems)console.error('SUITE: '+p);
process.exit(p1.status===0&&!failed.length&&!problems.length?0:1);
