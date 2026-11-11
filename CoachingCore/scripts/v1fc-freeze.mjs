// CoachingCore V1 Final Closure: the freeze record of the V1-scoped CoachingCore (COACHINGCORE-V1-FREEZE-n). It binds one commit: the SHA-256 of every
// tracked file of the V1 runtime (source, the policy, the catalog, the event extension, tests, fixtures, the scripts the evidence uses) and of the
// review and decision records the freeze rests on. Earlier freezes are referenced, never edited. This script writes nothing but its own record.
//   node scripts/v1fc-freeze.mjs --write <n> --commit <sha> --suite <passed>/<total> [--note "..."]   writes v1/RUNTIME_FREEZE_V1_<n>.json
//   node scripts/v1fc-freeze.mjs --check <n>                                                              recomputes and compares; exit 1 on drift
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),CC=path.join(here,'..'),ROOT=path.join(CC,'..');
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'}).trim();
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1];};
/** The files a V1 freeze binds: tracked files only, under these paths. */
const BOUND=['CoachingCore/src','CoachingCore/v1/EVENT_EXTENSION_V1.json','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r6/fixtures','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json','CoachingCore/r7/b/fixtures','CoachingCore/test','CoachingCore/fixtures/v1cib-ios',
 'CoachingCore/scripts/v1cib-ios-fixtures.mjs','CoachingCore/scripts/v1fc-journeys.mjs','CoachingCore/scripts/v1fc-freeze.mjs','CoachingCore/package.json','CoachingCore/package-lock.json','CoachingCore/SHADOW_INPUT_SCHEMA.json','CoachingCore/SHADOW_DECISION_SCHEMA.json',
 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/coachingcore-v1-final-closure-2026-11-11'];
const tracked=()=>git('ls-files','--',...BOUND).split('\n').filter(Boolean).filter(f=>!/RUNTIME_FREEZE_V1_\d+\.json$/.test(f)).sort();
const filesNow=()=>Object.fromEntries(tracked().map(f=>[f,sha(path.join(ROOT,f))]));
const digest=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const recordPath=n=>path.join(CC,'v1',`RUNTIME_FREEZE_V1_${n}.json`);

if(arg('--write')){
 const n=arg('--write'),commit=arg('--commit'),suite=arg('--suite'),out=recordPath(n);
 if(!/^\d+$/.test(n)||!commit||!/^\d+\/\d+$/.test(suite??''))throw new Error('usage: --write <n> --commit <sha> --suite <passed>/<total>');
 if(fs.existsSync(out))throw new Error('a freeze record is never rewritten: '+out);
 const full=git('rev-parse',commit),dirty=git('status','--porcelain','--',...BOUND);
 if(dirty)throw new Error('the bound paths differ from the index or hold untracked files; commit first:\n'+dirty);
 if(git('diff','--name-only',full,'HEAD','--',...BOUND))throw new Error('the bound paths at HEAD differ from the commit named');
 const files=filesNow(),prior='CoachingCore/r7/d/RUNTIME_FREEZE_R7D_6.json';
 const ext=await import('../src/v1-events.mjs'),[passed,total]=suite.split('/').map(Number);
 const record={revision:`COACHINGCORE-V1-FREEZE-${n}`,mission:'CoachingCore V1 Final Closure (Founder request of 2026-11-11)',scope:'The V1-scoped CoachingCore and its reference custody boundary on synthetic data. Not production, backend, operational security or a published app; no authorization for real athletes.',
  commit:full,created:new Date().toISOString(),origin:{candidate:'3b1480445fc22a5fc3a35875dd26d2c4de891a60',branch:'claude/v1-integration-boundary',note:'The interrupted V1 Coaching Integration Boundary candidate this mission started from'},
  predecessor:{revision:'R7D-FREEZE-6',record:prior,sha256:sha(path.join(ROOT,prior)),note:'Referenced, not edited. A regression reference; it is not a V1 approval.'},
  entryPoint:'CoachingCore/src/v1-index.mjs',suite:{passed,total},
  eventExtension:{id:ext.EVENT_EXTENSION_ID,file:'CoachingCore/v1/EVENT_EXTENSION_V1.json',sha256:ext.EXTENSION_FILE_SHA256,pinned:ext.EXTENSION_SHA256,enabledByIndependentRecord:Object.keys(ext.eventExtensionAuthority().approved).sort(),
   records:(f=>({file:f,sha256:fs.existsSync(path.join(ROOT,f))?sha(path.join(ROOT,f)):null,note:'The events this record enables are on; an event without an enabling record bound to the extension hash is off (fail closed).'}))('audits/coachingcore-v1-final-closure-2026-11-11/reviews/ssctr/SSCTR_V1FC_EVENT_RECORDS.json')},
  ...(arg('--note')?{note:arg('--note')}:{}),files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
 fs.writeFileSync(out,JSON.stringify(record,null,1)+'\n');console.log(`${record.revision}: ${record.fileCount} files, digest ${record.filesDigest}, binds ${full}`);
}else if(arg('--check')){
 const r=JSON.parse(fs.readFileSync(recordPath(arg('--check')),'utf8')),now=filesNow(),drift=[...new Set([...Object.keys(r.files),...Object.keys(now)])].filter(f=>r.files[f]!==now[f]);
 const ok=!drift.length&&digest(r.files)===r.filesDigest;console.log(ok?`${r.revision}: ${r.fileCount} files match`:`${r.revision}: DRIFT in ${drift.length} file(s)\n`+drift.slice(0,40).join('\n'));process.exit(ok?0:1);
}else{console.log('usage: --write <n> --commit <sha> --suite <passed>/<total> | --check <n>');process.exit(2);}
