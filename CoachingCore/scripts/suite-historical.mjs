// REPMILE V1 test-suite sanitization (2026-11-25): the HISTORICAL suite (`npm run test:historical`).
//
// Every test test/HISTORICAL_TESTS.json lists is executed in the context it belongs to: a temporary detached worktree of the commit the entry
// names (belongsTo.commit), with this checkout's dependencies, running that commit's own bytes of the test file. It checks, per entry:
// - the test file at that commit is the bytes the manifest pins, which are the bytes on the current tree (the historical test was never edited:
//   what passes there is exactly what is kept here);
// - the test is found exactly once and PASSES there.
// The worktrees are removed afterwards; nothing in this checkout is written. With --at-head it then runs the active suite (where each
// historical test must fail at its declared assertion), so one command shows both halves.
// Usage (from CoachingCore): node scripts/suite-historical.mjs [--only <commit>] [--json <file>] [--at-head]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readManifest,manifestErrors,parseJunit,exactPattern} from './suite-manifest.mjs';

const CORE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),ROOT=path.resolve(CORE,'..');
const argv=process.argv.slice(2),val=k=>argv.includes(k)?argv[argv.indexOf(k)+1]:null;
const manifest=readManifest(CORE),errors=manifestErrors(manifest);
if(errors.length){for(const e of errors)console.error('MANIFEST: '+e);process.exit(1);}
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28});
const shaOf=buf=>createHash('sha256').update(buf).digest('hex');
const groups=new Map();for(const e of manifest.entries){if(val('--only')&&!e.belongsTo.commit.startsWith(val('--only')))continue;const c=e.belongsTo.commit;if(!groups.has(c))groups.set(c,[]);groups.get(c).push(e);}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'suite-historical-')),report=[];let bad=0;
for(const [commit,entries] of groups){
 const wt=path.join(tmp,commit);
 // QRE-SAN-07: belongsTo is a strict ancestor of firstFailedAt, which is an ancestor of (or is) HEAD.
 const anc=(a,b)=>spawnSync('git',['merge-base','--is-ancestor',a,b],{cwd:ROOT}).status===0;
 for(const e of entries){const f=e.firstFailedAt.commit,why=[];
  if(git('rev-parse',commit).trim()===git('rev-parse',f).trim()||!anc(commit,f))why.push(`belongsTo ${commit} is not a strict ancestor of firstFailedAt ${f}`);
  if(!anc(f,'HEAD'))why.push(`firstFailedAt ${f} is not an ancestor of HEAD`);
  if(why.length){bad++;report.push({id:e.id,commit,file:e.file,title:e.title,result:'NOT_VERIFIED',why});console.log(`✖ ${e.id}: ${why.join('; ')}`);}}
 try{
  git('worktree','add','--detach','--quiet',wt,commit);
  // A copy, never a symlink: .gitignore's node_modules/ matches a directory only, so a symlink is an UNTRACKED file to the record verifiers.
  fs.cpSync(path.join(CORE,'node_modules'),path.join(wt,'CoachingCore','node_modules'),{recursive:true,dereference:true});
  const files=[...new Set(entries.map(e=>'test/'+e.file))],dest=path.join(tmp,commit+'.xml');
  const pre=entries.map(e=>{const p=path.join(wt,'CoachingCore','test',e.file);return fs.existsSync(p)?shaOf(fs.readFileSync(p)):null;});
  spawnSync(process.execPath,['--test',...entries.map(e=>`--test-name-pattern=${exactPattern(e.title)}`),'--test-reporter=junit',`--test-reporter-destination=${dest}`,...files],{cwd:path.join(wt,'CoachingCore'),stdio:'ignore',maxBuffer:1<<28});
  const cases=fs.existsSync(dest)?parseJunit(fs.readFileSync(dest,'utf8')):[];
  entries.forEach((e,i)=>{
   const hits=cases.filter(c=>c.file===e.file&&c.name===e.title),why=[];
   if(pre[i]!==e.fileSha256)why.push(pre[i]?'the file at this commit is not the pinned bytes':'the file does not exist at this commit');
   if(hits.length!==1)why.push(`found ${hits.length} times`);else if(hits[0].status!=='passed')why.push(hits[0].status);
   const ok=!why.length;if(!ok)bad++;
   report.push({id:e.id,commit,file:e.file,title:e.title,result:ok?'PASS_IN_ITS_CONTEXT':'NOT_VERIFIED',why});
   console.log(`${ok?'✔':'✖'} ${e.id} @${commit.slice(0,7)} ${e.file}: ${e.title.slice(0,110)}${ok?'':' — '+why.join('; ')}`);
  });
 }catch(err){for(const e of entries){bad++;report.push({id:e.id,commit,file:e.file,title:e.title,result:'NOT_VERIFIED',why:[String(err.message).split('\n')[0]]});console.log(`✖ ${e.id} @${commit.slice(0,7)}: ${String(err.message).split('\n')[0]}`);}}
 finally{try{git('worktree','remove','--force',wt);}catch{}}
}
try{git('worktree','prune');}catch{}
console.log(`\nHISTORICAL SUITE: ${report.length-bad}/${report.length} historical tests pass at the commit they belong to (${groups.size} commits)`);
if(val('--json'))fs.writeFileSync(path.resolve(val('--json')),JSON.stringify({schema:'REPMILE-V1-HISTORICAL-RUN-1',node:process.version,head:git('rev-parse','HEAD').trim(),report},null,1)+'\n');
let head=0;
if(argv.includes('--at-head')){const r=spawnSync(process.execPath,[path.join(CORE,'scripts/suite-active.mjs')],{cwd:CORE,stdio:'inherit'});head=r.status;}
process.exit(bad||head?1:0);
