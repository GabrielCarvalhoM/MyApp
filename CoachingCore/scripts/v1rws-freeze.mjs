// CoachingCore V1 Run Workout Structure with the Athlete Data Foundation (Founder request of 2026-11-13): the additive freeze record
// (COACHINGCORE-V1-RUN-FORMAT-FREEZE-n). No earlier freeze record or verifier is edited to accept it (Founder governance rule of 2026-11-13): the
// historical checks keep running on their frozen snapshots, and this verifier declares the one amendment it authorizes. It binds one commit:
//   (i)   every file COACHINGCORE-V1-FREEZE-1 binds is byte-identical here, except the one amended file;
//   (ii)  that file, src/r6-adaptation.mjs: its base is exactly the bytes COACHINGCORE-V1-FREEZE-1 recorded, its new hash and its whole diff are
//         recorded here, and the diff is checked again from git on every check;
//   (iii) every file COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1 binds is byte-identical here;
//   (iv)  the files this extension adds.
// Governance of the historical checks (Founder decision of 2026-11-14): the historical test and verifier of the earlier freezes stay as they are
// and keep running against their own frozen snapshot. This line has its own verification, here, with the authorized hash and diff of the one
// amended file (AMENDMENT below). On this line the joint suite therefore has exactly one failure, the historical test that names the amended
// file: `--write` runs the suite itself, never trusts a typed count, and refuses unless that test, by name, is the only failure. The record keeps
// the three results apart: the joint run, this extension's own tests, and where the historical check stays green.
// This script writes nothing but its own record.
//   node scripts/v1rws-freeze.mjs --write <n> --commit <sha> [--note "..."]   runs the suite, then writes v1/RUNTIME_FREEZE_V1RWS_<n>.json
//   node scripts/v1rws-freeze.mjs --check <n>                                  recomputes and compares; exit 1 on drift
//   node scripts/v1rws-freeze.mjs --preserved                                  (i), (ii) on the bytes here, and (iii)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),CC=path.join(here,'..'),ROOT=path.join(CC,'..');
const shaOf=bytes=>createHash('sha256').update(bytes).digest('hex'),sha=f=>shaOf(fs.readFileSync(f));
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).trim();
const blob=(commit,file)=>execFileSync('git',['show',`${commit}:${file}`],{cwd:ROOT,maxBuffer:1<<28});
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1];};
const digest=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const V1='CoachingCore/v1/RUNTIME_FREEZE_V1_1.json',V1RC='CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json';
/** The one file of COACHINGCORE-V1-FREEZE-1 this extension amends (handoff section 5; preflight V1, V6). */
const AMENDED='CoachingCore/src/r6-adaptation.mjs';
/** What this extension adds: tracked files only, under these paths. */
const ADDED=['CoachingCore/src/v1-run-format.mjs','CoachingCore/src/v1-run-format-index.mjs','CoachingCore/src/v1-run-history.mjs','CoachingCore/v1/RUN_FORMATS_V1.json','CoachingCore/test/v1rws-helpers.mjs','CoachingCore/scripts/v1rws-freeze.mjs','audits/v1-run-extensions-2026-11-13/phase-a'];
/** The authority this implementation was built from, bound by hash (read, never edited). */
const AUTHORITY=['audits/v1-run-extensions-2026-11-13/PREFLIGHT_V1_RUN_EXTENSIONS.md','audits/v1-run-workout-structure-2026-11-13/HANDOFF_RUN_WORKOUT_STRUCTURE.md','audits/v1-run-workout-structure-2026-11-13/ssctr/SSCTR_RWS_R2_DECISION.json',
 'audits/v1-run-workout-structure-2026-11-13/ssctr/SSCTR_RWS_R3_DECISION.json','audits/v1-run-workout-structure-2026-11-13/ssctr/SSCTR_RWS_R3A_AMENDMENT.json','audits/v1-athlete-data-foundation-2026-11-13/ATHLETE_DATA_FOUNDATION.md','audits/v1-race-forecast-2026-11-13/HANDOFF_RACE_FORECAST.md'];
const testFiles=()=>git('ls-files','--','CoachingCore/test').split('\n').filter(f=>/\/v1rws-[^/]+\.test\.mjs$/.test(f));
const added=()=>[...git('ls-files','--',...ADDED).split('\n'),...testFiles()].filter(Boolean).filter(f=>!/RUNTIME_FREEZE_V1RWS_\d+\.json$/.test(f)).sort();
const filesNow=()=>Object.fromEntries(added().map(f=>[f,sha(path.join(ROOT,f))]));
const recordPath=n=>path.join(CC,'v1',`RUNTIME_FREEZE_V1RWS_${n}.json`);
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
/** (i) and (iii): the two earlier records against the files here; the amended file is checked apart. */
function preserved(){
 const base=read(V1),rc=read(V1RC),differs=([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(path.join(ROOT,f))!==h;
 const v1Changed=Object.entries(base.files).filter(([f])=>f!==AMENDED).filter(differs).map(([f])=>f),rcChanged=Object.entries(rc.files).filter(differs).map(([f])=>f);
 return {v1:{revision:base.revision,record:V1,sha256:sha(path.join(ROOT,V1)),commit:base.commit,fileCount:base.fileCount,filesDigest:base.filesDigest,identical:base.fileCount-1-v1Changed.length,amended:[AMENDED],changed:v1Changed},
  v1rc:{revision:rc.revision,record:V1RC,sha256:sha(path.join(ROOT,V1RC)),commit:rc.commit,fileCount:rc.fileCount,filesDigest:rc.filesDigest,identical:rc.fileCount-rcChanged.length,changed:rcChanged}};
}
/**
 * The authorized amendment (handoff section 5; Founder decision of 2026-11-13, reviewed on bcac30d and d6381bb): the bytes of the amended file and
 * its whole diff from the base, each by hash. The diff is the hunk headers and the changed lines of `git diff -U0 <base> -- <file>`, joined by a
 * line feed. Nothing lexical is accepted in their place (QRE-RWS-B-03): any other byte in the file, on any line, fails.
 */
const AMENDMENT={sha256:'6cedcb72be4e2bc6434a1f86a20d8c4447498b73c1157706cc91554847ac6e50',diffSha256:'6675741d38b2ec2a375656b055cf03cf5c442ae145c75a3f2e5922572afbe370',linesAdded:22,linesRemoved:10};
const diffText=lines=>lines.filter(l=>/^(@@|[+-])/.test(l)&&!/^(\+\+\+|---)/.test(l));
/** The amendment is the reader alone: the diff compared is, byte for byte, the authorized one. */
function readerAlone(lines){
 const plus=lines.filter(l=>l.startsWith('+')&&!l.startsWith('+++')),minus=lines.filter(l=>l.startsWith('-')&&!l.startsWith('---')),found=shaOf(Buffer.from(diffText(lines).join('\n'),'utf8'));
 const ok=found===AMENDMENT.diffSha256&&plus.length===AMENDMENT.linesAdded&&minus.length===AMENDMENT.linesRemoved;
 return {ok,linesAdded:plus.length,linesRemoved:minus.length,diffSha256:found,authorizedDiffSha256:AMENDMENT.diffSha256,unexplained:ok?[]:['the diff of the amended file is not the authorized one']};
}
/** A run of the test runner here: the counts and the names of the tests that failed, read from its own report (never typed in). */
function runSuite(files=[]){
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd:CC,encoding:'utf8',maxBuffer:1<<30}),out=String(r.stdout??''),count=k=>{const m=out.match(new RegExp(`^# ${k} (\\d+)$`,'m'));return m?Number(m[1]):null;};
 const failed=[...out.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m=>m[1].replace(/\s+#.*$/,'').trim());
 const total=count('tests'),passed=count('pass'),fail=count('fail');
 if(total===null||passed===null||fail===null||count('cancelled')!==0||fail!==failed.length)throw new Error('the test runner\'s report could not be read');
 return {passed,total,failed:failed.sort()};
}
/** The one historical test that names the amended file on this line, by design (Founder governance rule of 2026-11-13; QRE-RWS-A-02). */
const HISTORICAL={test:'CoachingCore/test/v1rc-calibration.test.mjs',name:'V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here',names:[AMENDED],greenOn:'c8104c1 (its own snapshot)',
 reading:'A freeze verifier of the calibration extension written as a test, inside a file that freeze binds: it is not edited. On this line it must fail naming only the amended file; the living invariant is test I10 of v1rws-engine.test.mjs and this verifier.'};
/** (ii): the amended file from the base the earlier record keeps to the bytes here, with the whole diff. */
function amendment(commit){
 const base=read(V1),rc=read(V1RC),baseBytes=blob(rc.commit,AMENDED),diff=execFileSync('git',['diff','--no-color','--no-ext-diff','-U0',rc.commit,commit,'--',AMENDED],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28});
 const lines=diff.split('\n'),plus=lines.filter(l=>l.startsWith('+')&&!l.startsWith('+++')),minus=lines.filter(l=>l.startsWith('-')&&!l.startsWith('---'));
 return {file:AMENDED,readerAlone:readerAlone(lines),baseCommit:rc.commit,baseSha256:shaOf(baseBytes),baseIsTheRecorded:shaOf(baseBytes)===base.files[AMENDED],recordedIn:base.revision,newSha256:shaOf(blob(commit,AMENDED)),authorizedSha256:AMENDMENT.sha256,
  what:'bindObservations takes the completion reader of the native run format entry point (the exported key READS_COMPLETION), carried to its five bindings: the review, the record kept under a clinical hold, viewMovedBy, gapAnsweredBy and historicalStateOf. Without the key every binding reads exactly as before.',
  diff:{sha256:shaOf(Buffer.from(diff,'utf8')),linesAdded:plus.length,linesRemoved:minus.length,hunks:lines.filter(l=>l.startsWith('@@')).length,text:lines.filter(l=>/^(@@|[+-])/.test(l)&&!/^(\+\+\+|---)/.test(l))}};
}

if(arg('--write')){
 const n=arg('--write'),commit=arg('--commit'),out=recordPath(n);
 if(!/^\d+$/.test(n)||!commit)throw new Error('usage: --write <n> --commit <sha>');
 if(fs.existsSync(out))throw new Error('a freeze record is never rewritten: '+out);
 const full=git('rev-parse',commit),bound=[...ADDED,'CoachingCore/src','CoachingCore/test','CoachingCore/v1'],dirty=git('status','--porcelain','--',...bound);
 if(dirty)throw new Error('the bound paths differ from the index or hold untracked files; commit first:\n'+dirty);
 if(git('diff','--name-only',full,'HEAD','--',...ADDED,'CoachingCore/src','CoachingCore/test'))throw new Error('the bound paths at HEAD differ from the commit named');
 const p=preserved();if(p.v1.changed.length||p.v1rc.changed.length)throw new Error('an earlier freeze is not preserved: '+[...p.v1.changed,...p.v1rc.changed].join(', '));
 const a=amendment(full);if(!a.baseIsTheRecorded)throw new Error('the base of the amended file is not the bytes COACHINGCORE-V1-FREEZE-1 recorded');
 if(a.newSha256!==sha(path.join(ROOT,AMENDED)))throw new Error('the amended file here is not the one of the commit named');
 if(a.newSha256!==AMENDMENT.sha256)throw new Error('the amended file is not the authorized bytes');
 if(!a.readerAlone.ok)throw new Error('the amended file changes more than the reader: '+a.readerAlone.unexplained.join(' | '));
 // A freeze is written only over an enabling record: the boundary on by the independent SSCTR record bound to the pinned values.
 const ext=await import('../src/v1-run-format.mjs'),auth=ext.runFormatAuthority(),records='audits/v1-run-extensions-2026-11-13/phase-a/reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json';
 if(!ext.allowsFormat(auth))throw new Error('no independent SSCTR record enables V1X-RUN-NATIVE over the pinned values: nothing is frozen while a blocker stands');
 // The suite, run here: the joint run (everything on this line) and this extension's own tests. The only failure allowed is the historical one.
 const joint=runSuite(),own=runSuite(testFiles().map(f=>path.relative(CC,path.join(ROOT,f))));
 if(own.failed.length||own.passed!==own.total)throw new Error('this extension\'s own tests fail: '+own.failed.join(' | '));
 if(joint.failed.length!==1||joint.failed[0]!==HISTORICAL.name||joint.total-joint.passed!==1)throw new Error('on this line the joint suite fails only the one historical test that names the amended file; found: '+(joint.failed.join(' | ')||'none'));
 const srcChanged=git('diff','--name-only',p.v1rc.commit,full,'--','CoachingCore/src','CoachingCore/r6','CoachingCore/r7','CoachingCore/fixtures','CoachingCore/package.json','CoachingCore/package-lock.json').split('\n').filter(Boolean).filter(f=>f!==AMENDED&&!ADDED.includes(f));
 if(srcChanged.length)throw new Error('files outside the declared amendment and additions changed since the base: '+srcChanged.join(', '));
 const files=filesNow();
 const record={revision:`COACHINGCORE-V1-RUN-FORMAT-FREEZE-${n}`,mission:'CoachingCore V1 Run Extensions, phase A: Run Workout Structure and Athlete Data Foundation (Founder request of 2026-11-13)',
  scope:'An additive extension of the V1-scoped CoachingCore on synthetic data: native prescription of run sessions by distance or by time, the reading of their execution, the record of formats delivered and the record of dated run distances. Not production, backend, operational security or a published app; no authorization for real athletes. Race Forecast and Pace Insights are not part of it.',
  commit:full,created:new Date().toISOString(),additiveTo:p,amendment:a,entryPoint:'CoachingCore/src/v1-run-format-index.mjs',baseEntryPoint:'CoachingCore/src/v1-run-index.mjs',composition:'v1-run-format-index -> v1-run-index -> v1-index',
  suite:{joint:{passed:joint.passed,total:joint.total,failed:joint.failed,note:'Everything on this line, run by this script. Its one failure is the historical test below, by name.'},own:{passed:own.passed,total:own.total,files:testFiles().length,note:'The tests of this extension (test/v1rws-*.test.mjs), run by this script.'},
   historical:{expectedFailures:[HISTORICAL],note:'The historical freeze checks are not run here: they run, unedited, against their own snapshot (the commit each earlier record binds), where they are green. (i) to (iii) above are this line\'s own proof that the earlier freezes are preserved.'}},
  extension:{id:ext.FORMAT_EXTENSION_ID,file:'CoachingCore/v1/RUN_FORMATS_V1.json',sha256:ext.FORMAT_VALUES_FILE_SHA256,pinned:ext.FORMAT_VALUES_SHA256,enabledByIndependentRecord:Object.keys(auth.approved).sort(),
   records:{file:records,sha256:fs.existsSync(path.join(ROOT,records))?sha(path.join(ROOT,records)):null,note:'The boundary V1X-RUN-NATIVE is on only with an independent SSCTR record bound to the values hash; without one it is off (fail closed: every run session is its time expression, the frozen behaviour).'}},
  authority:Object.fromEntries(AUTHORITY.map(f=>[f,sha(path.join(ROOT,f))])),
  ...(arg('--note')?{note:arg('--note')}:{}),files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
 fs.writeFileSync(out,JSON.stringify(record,null,1)+'\n');
 console.log(`${record.revision}: ${record.fileCount} added files, digest ${record.filesDigest}, binds ${full}; 1 amended file (${a.diff.linesAdded}+/${a.diff.linesRemoved}-); ${p.v1.revision} preserved ${p.v1.identical}/${p.v1.fileCount-1}; ${p.v1rc.revision} preserved ${p.v1rc.identical}/${p.v1rc.fileCount}`);
}else if(arg('--check')){
 const r=JSON.parse(fs.readFileSync(recordPath(arg('--check')),'utf8')),now=filesNow(),drift=[...new Set([...Object.keys(r.files),...Object.keys(now)])].filter(f=>r.files[f]!==now[f]),p=preserved(),a=amendment(r.commit);
 const amended=fs.existsSync(path.join(ROOT,AMENDED))&&sha(path.join(ROOT,AMENDED))===r.amendment.newSha256&&r.amendment.newSha256===AMENDMENT.sha256&&a.baseIsTheRecorded&&a.baseSha256===r.amendment.baseSha256&&a.newSha256===r.amendment.newSha256&&a.diff.sha256===r.amendment.diff.sha256&&a.readerAlone.ok;
 const authority=Object.entries(r.authority).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(path.join(ROOT,f))!==h).map(([f])=>f);
 const ok=!drift.length&&digest(r.files)===r.filesDigest&&!p.v1.changed.length&&!p.v1rc.changed.length&&p.v1.sha256===r.additiveTo.v1.sha256&&p.v1rc.sha256===r.additiveTo.v1rc.sha256&&amended&&!authority.length;
 console.log(ok?`${r.revision}: ${r.fileCount} added files match; 1 amended file matches its recorded diff (${r.amendment.diff.linesAdded}+/${r.amendment.diff.linesRemoved}-); ${p.v1.revision} preserved ${p.v1.identical}/${p.v1.fileCount-1}; ${p.v1rc.revision} preserved ${p.v1rc.identical}/${p.v1rc.fileCount}`
  :`${r.revision}: DRIFT\n`+[...drift,...p.v1.changed.map(f=>'(V1-FREEZE-1) '+f),...p.v1rc.changed.map(f=>'(V1RC-FREEZE-1) '+f),...(amended?[]:['(amendment) '+AMENDED]),...authority.map(f=>'(authority) '+f)].slice(0,40).join('\n'));process.exit(ok?0:1);
}else if(process.argv.includes('--preserved')){
 // The amended file as it is here (the working tree), against the base: the reader alone.
 const p=preserved(),rc=read(V1RC),base=read(V1),baseOk=shaOf(blob(rc.commit,AMENDED))===base.files[AMENDED],bad=[...p.v1.changed,...p.v1rc.changed];
 const alone=readerAlone(execFileSync('git',['diff','--no-color','--no-ext-diff','-U0',rc.commit,'--',AMENDED],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).split('\n')),bytesOk=fs.existsSync(path.join(ROOT,AMENDED))&&sha(path.join(ROOT,AMENDED))===AMENDMENT.sha256;
 console.log(`${p.v1.revision}: ${p.v1.identical}/${p.v1.fileCount-1} files byte-identical, 1 amended (${AMENDED}; its base is ${baseOk?'':'NOT '}the recorded bytes; it is ${bytesOk?'':'NOT '}the authorized bytes; its diff is ${alone.ok?'':'NOT '}the authorized one, the reader alone, ${alone.linesAdded}+/${alone.linesRemoved}-); ${p.v1rc.revision}: ${p.v1rc.identical}/${p.v1rc.fileCount} files byte-identical`+(bad.length?'\nCHANGED:\n'+bad.join('\n'):'')+(alone.ok?'':'\nUNEXPLAINED:\n'+alone.unexplained.join('\n')));process.exit(bad.length||!baseOk||!alone.ok||!bytesOk?1:0);
}else{console.log('usage: --write <n> --commit <sha> | --check <n> | --preserved');process.exit(2);}
