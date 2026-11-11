// CoachingCore V1 Run Calibration Extension (Founder request of 2026-11-11): the additive freeze record (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-n).
// It binds one commit: (1) COACHINGCORE-V1-FREEZE-1 preserved, every file that record binds byte-identical here, and (2) the files this extension
// adds. COACHINGCORE-V1-FREEZE-1 and every earlier freeze are referenced, never edited. This script writes nothing but its own record.
//   node scripts/v1rc-freeze.mjs --write <n> --commit <sha> --suite <passed>/<total> [--note "..."]   writes v1/RUNTIME_FREEZE_V1RC_<n>.json
//   node scripts/v1rc-freeze.mjs --check <n>                                                              recomputes and compares; exit 1 on drift
// (`v1fc-freeze.mjs --check 1` binds whole directories, so in this worktree it names the added files as drift; the preserved check is here.)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),CC=path.join(here,'..'),ROOT=path.join(CC,'..');
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'}).trim();
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1];};
const digest=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const BASE='CoachingCore/v1/RUNTIME_FREEZE_V1_1.json';
/** What this extension adds: tracked files only, under these paths. */
const ADDED=['CoachingCore/src/v1-run-calibration.mjs','CoachingCore/src/v1-run-index.mjs','CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json','CoachingCore/test/v1rc-helpers.mjs','CoachingCore/scripts/v1rc-freeze.mjs','CoachingCore/scripts/v1rc-journeys.mjs','CoachingCore/scripts/v1rc-fuzz.mjs','audits/coachingcore-v1-run-calibration-2026-11-11'];
const testFiles=()=>git('ls-files','--','CoachingCore/test').split('\n').filter(f=>/\/v1rc-[^/]+\.test\.mjs$/.test(f));
const added=()=>[...git('ls-files','--',...ADDED).split('\n'),...testFiles()].filter(Boolean).filter(f=>!/RUNTIME_FREEZE_V1RC_\d+\.json$/.test(f)).sort();
const filesNow=()=>Object.fromEntries(added().map(f=>[f,sha(path.join(ROOT,f))]));
const recordPath=n=>path.join(CC,'v1',`RUNTIME_FREEZE_V1RC_${n}.json`);
/** COACHINGCORE-V1-FREEZE-1 preserved: every file it binds, read here, against the hash it recorded. */
function preserved(){
 const base=JSON.parse(fs.readFileSync(path.join(ROOT,BASE),'utf8')),changed=Object.entries(base.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(path.join(ROOT,f))!==h).map(([f])=>f);
 return {revision:base.revision,record:BASE,sha256:sha(path.join(ROOT,BASE)),commit:base.commit,fileCount:base.fileCount,filesDigest:base.filesDigest,identical:base.fileCount-changed.length,changed};
}

if(arg('--write')){
 const n=arg('--write'),commit=arg('--commit'),suite=arg('--suite'),out=recordPath(n);
 if(!/^\d+$/.test(n)||!commit||!/^\d+\/\d+$/.test(suite??''))throw new Error('usage: --write <n> --commit <sha> --suite <passed>/<total>');
 if(fs.existsSync(out))throw new Error('a freeze record is never rewritten: '+out);
 const full=git('rev-parse',commit),dirty=git('status','--porcelain','--',...ADDED,'CoachingCore/src','CoachingCore/test','CoachingCore/v1');
 if(dirty)throw new Error('the bound paths differ from the index or hold untracked files; commit first:\n'+dirty);
 if(git('diff','--name-only',full,'HEAD','--',...ADDED,'CoachingCore/src','CoachingCore/test'))throw new Error('the bound paths at HEAD differ from the commit named');
 const base=preserved();if(base.changed.length)throw new Error('COACHINGCORE-V1-FREEZE-1 is not preserved: '+base.changed.join(', '));
 const ext=await import('../src/v1-run-calibration.mjs'),files=filesNow(),[passed,total]=suite.split('/').map(Number),auth=ext.runCalibrationAuthority();
 const record={revision:`COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-${n}`,mission:'CoachingCore V1 Run Calibration Extension (Founder request of 2026-11-11)',
  scope:'An additive extension of the V1-scoped CoachingCore on synthetic data: run calibration, pace bands, heart-rate zones and current race estimates beside the unchanged prescription. Not production, backend, operational security or a published app; no authorization for real athletes.',
  commit:full,created:new Date().toISOString(),additiveTo:base,entryPoint:'CoachingCore/src/v1-run-index.mjs',baseEntryPoint:'CoachingCore/src/v1-index.mjs',suite:{passed,total},
  extension:{id:ext.RUN_EXTENSION_ID,file:'CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json',sha256:ext.RUN_EXTENSION_FILE_SHA256,pinned:ext.RUN_EXTENSION_SHA256,enabledByIndependentRecord:Object.keys(auth.approved).sort(),
   records:(f=>({file:f,sha256:fs.existsSync(path.join(ROOT,f))?sha(path.join(ROOT,f)):null,note:'A boundary this record enables is on; a boundary without an enabling record bound to the extension hash is off (fail closed: effort only, the frozen V1 behaviour).'}))('audits/coachingcore-v1-run-calibration-2026-11-11/reviews/ssctr/SSCTR_V1RC_RUN_RECORDS.json')},
  ...(arg('--note')?{note:arg('--note')}:{}),files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
 fs.writeFileSync(out,JSON.stringify(record,null,1)+'\n');console.log(`${record.revision}: ${record.fileCount} added files, digest ${record.filesDigest}, binds ${full}; ${base.revision} preserved ${base.identical}/${base.fileCount}`);
}else if(arg('--check')){
 const r=JSON.parse(fs.readFileSync(recordPath(arg('--check')),'utf8')),now=filesNow(),drift=[...new Set([...Object.keys(r.files),...Object.keys(now)])].filter(f=>r.files[f]!==now[f]),base=preserved();
 const ok=!drift.length&&digest(r.files)===r.filesDigest&&!base.changed.length&&base.sha256===r.additiveTo.sha256;
 console.log(ok?`${r.revision}: ${r.fileCount} added files match; ${base.revision} preserved ${base.identical}/${base.fileCount}`:`${r.revision}: DRIFT\n`+[...drift,...base.changed.map(f=>'(FREEZE-1) '+f)].slice(0,40).join('\n'));process.exit(ok?0:1);
}else if(process.argv.includes('--preserved')){
 const base=preserved();console.log(`${base.revision}: ${base.identical}/${base.fileCount} files byte-identical`+(base.changed.length?'\nCHANGED:\n'+base.changed.join('\n'):''));process.exit(base.changed.length?1:0);
}else{console.log('usage: --write <n> --commit <sha> --suite <passed>/<total> | --check <n> | --preserved');process.exit(2);}
