// REPMILE V1 test-suite sanitization (2026-11-25): the ACTIVE suite of the current CoachingCore (`npm test`).
//
// ONE run of exactly what `node --test` discovers, with nothing filtered (no name pattern, no skip pattern, no file excluded), so no test, subtest
// or file can be left out of it (review cycle, QRE_SAN_R1 QRE-SAN-01/-08). The verdict is then read from the junit report:
// - ACTIVE: every test the manifest does not list must pass. A skipped, todo or cancelled test fails the suite, and so does a file that fails to
//   load. node's own failure count must equal the failures accounted for here (a parent that fails after its subtests is counted by node).
// - HISTORICAL: every test test/HISTORICAL_TESTS.json lists (tests of an earlier line, not edited, bytes pinned) must be found exactly once and must
//   FAIL, at the assertion line the manifest pins (failsAt.line, QRE-SAN-03). A historical test that passes, or fails elsewhere, means the current
//   tree changed in a way the manifest does not describe: for a pinned defect, the defect may be back. Each is green in its own context, at
//   the commit it belongs to (`npm run test:historical`).
// - Every successor and alsoCoveredBy test the manifest names must pass.
// The full spec output goes to a log file (its path is printed); stdout carries the verdict and every active failure.
// Usage (from CoachingCore): node scripts/suite-active.mjs [--junit <file>] [--log <file>]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readManifest,manifestErrors,parseJunit,junitCounts,MANIFEST} from './suite-manifest.mjs';

const CORE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const argv=process.argv.slice(2),val=k=>argv.includes(k)?argv[argv.indexOf(k)+1]:null;
const manifest=readManifest(CORE),errors=manifestErrors(manifest);
if(errors.length){for(const e of errors)console.error('MANIFEST: '+e);process.exit(1);}
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(CORE,f))).digest('hex');
for(const e of manifest.entries){const f='test/'+e.file;
 if(!fs.existsSync(path.join(CORE,f)))errors.push(`${e.id}: ${f} is missing (a historical test is kept, never deleted)`);
 else if(sha(f)!==e.fileSha256)errors.push(`${e.id}: ${f} is not the pinned bytes (a historical test is never edited to pass; write a successor)`);}
if(errors.length){for(const e of errors)console.error('HISTORICAL: '+e);process.exit(1);}

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'suite-active-'));
const junit=val('--junit')?path.resolve(val('--junit')):path.join(tmp,'junit.xml'),log=val('--log')?path.resolve(val('--log')):path.join(tmp,'spec.txt');
console.log(`node --test (every discovered test, nothing filtered); spec log: ${log}`);
spawnSync(process.execPath,['--test','--test-reporter=spec',`--test-reporter-destination=${log}`,'--test-reporter=junit',`--test-reporter-destination=${junit}`],{cwd:CORE,stdio:['ignore','ignore','inherit'],maxBuffer:1<<28});
if(!fs.existsSync(junit)){console.error('no junit report was written');process.exit(1);}
const xml=fs.readFileSync(junit,'utf8'),all=parseJunit(xml),counts=junitCounts(xml),problems=[];
const key=(file,title)=>`${file}\u0000${title}`,listed=new Map(manifest.entries.map(e=>[key(e.file,e.title),e]));
const seen=new Map();for(const c of all)if(!c.fileLevel){const k=key(c.file,c.name);seen.set(k,[...(seen.get(k)??[]),c]);}

// ---- historical ----
let asDeclared=0;
for(const e of manifest.entries){const hits=seen.get(key(e.file,e.title))??[];
 if(hits.length!==1){problems.push(`${e.id}: found ${hits.length} times in ${e.file} (expected exactly once)`);continue;}
 const c=hits[0];
 if(c.status==='passed')problems.push(`${e.id}: PASSES on the current tree, so it is no longer incompatible with it. If it pins a defect, the defect may be back (${e.contract.slice(0,160)}). ${e.file}: "${e.title.slice(0,90)}"`);
 else if(c.status!=='failed')problems.push(`${e.id}: ${c.status} on the current tree`);
 else if(c.failLine!==e.failsAt.line)problems.push(`${e.id}: fails at ${e.file}:${c.failLine??'?'}, not at its declared assertion :${e.failsAt.line}; the tree changed before the pinned point (${e.file}: "${e.title.slice(0,90)}")`);
 else asDeclared++;}
// ---- active ----
const active=all.filter(c=>!c.fileLevel&&!listed.has(key(c.file,c.name)));
const failed=active.filter(c=>c.status==='failed'),passed=active.filter(c=>c.status==='passed');
for(const c of active)if(c.status!=='passed'&&c.status!=='failed')problems.push(`${c.status} and not a historical test: ${c.file}: ${c.name.slice(0,120)}`);
for(const c of all.filter(c=>c.fileLevel))if(c.status==='failed')problems.push(`a test file failed to load: ${c.file}`);else if(c.status!=='passed')problems.push(`${c.status}: ${c.file}: ${c.name.slice(0,120)}`);
for(const e of manifest.entries)for(const [role,x] of [['successor',e.successor],...(e.alsoCoveredBy??[]).map(a=>['alsoCoveredBy',a])]){
 const hits=seen.get(key(x.file,x.title))??[];
 if(hits.length!==1)problems.push(`${e.id}: ${role} found ${hits.length} times: ${x.file}: "${x.title.slice(0,100)}"`);
 else if(hits[0].status!=='passed')problems.push(`${e.id}: ${role} ${hits[0].status}: ${x.file}: "${x.title.slice(0,100)}"`);}
// ---- node's own counters, against this accounting ----
const accounted=all.filter(c=>c.status==='failed').length;
if(counts.fail!==accounted)problems.push(`node counts ${counts.fail} failures, ${accounted} are accounted for here (a failure outside a testcase, e.g. a parent after its subtests)`);
for(const k of ['cancelled','todo','skipped'])if(counts[k])problems.push(`node counts ${counts[k]} ${k}`);

for(const c of failed)console.error(`✖ ACTIVE FAILURE ${c.file}:${c.failLine??'?'} — ${c.name}\n    ${c.message.slice(0,600)}`);
console.log(`\nACTIVE SUITE: ${active.length} active tests, ${passed.length} pass, ${failed.length} fail.`+
 ` HISTORICAL (${MANIFEST}): ${asDeclared}/${manifest.entries.length} fail on this tree at their declared assertion; each is verified green at its own commit by \`npm run test:historical\` (not run here).`+
 ` node reported ${counts.tests} entries, ${all.filter(c=>c.fileLevel).length} of them files without tests (helpers).`);
for(const p of problems)console.error('SUITE: '+p);
process.exit(!failed.length&&!problems.length?0:1);
