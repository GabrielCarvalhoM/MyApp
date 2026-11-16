// CoachingCore V1 Race Forecast + Pace Insights (phase B of the V1 run extensions): the additive freeze record
// (COACHINGCORE-V1-RACE-FORECAST-FREEZE-n). It amends nothing and edits no earlier record or verifier (Founder governance rule of 2026-11-13):
//   (i)   COACHINGCORE-V1-RUN-FORMAT-FREEZE-2 is preserved: its own verifier, unedited, is run here and must pass (it proves, in turn, the two
//         freezes under it and the one amended file with its authorized diff);
//   (ii)  nothing under CoachingCore's source, values, tests or scripts changed since the commit that freeze binds, but what this extension adds;
//   (iii) the files this extension adds, each by hash, and the authority it was built from.
// On this line the joint suite has exactly one failure, the historical freeze test of the run calibration that names the file phase A amended:
// `--write` runs the suite itself and refuses unless that test, by name, is the only failure and every test of this extension passes.
// A freeze is written only over independent SSCTR records that enable V1X-RUN-FORECAST and V1X-PACE-INSIGHTS for the pinned values, and only
// while V1X-PACE-REVISION is off (it waits for an integration to meet IC-2).
// The pace revision is implemented in the bytes a freeze binds, off, NOT approved, and it does NOT fail closed (PACE_REVISION below names what
// is open). No enabling record of it is valid over those bytes, so `--write` refuses and `--check` fails when the records file holds any
// record of V1X-PACE-REVISION, enabling or not (asked by the three judges of the recheck on 0d3015b; this guard was added after that
// recheck and is not itself re-judged). Closing any of its conditions needs new code, a new review and a successor freeze.
// This script writes nothing but its own record.
//   node scripts/v1rfc-freeze.mjs --write <n> --commit <sha> [--note "..."]   runs the suites, then writes v1/RUNTIME_FREEZE_V1RFC_<n>.json
//   node scripts/v1rfc-freeze.mjs --check <n>                                  recomputes and compares; exit 1 on drift
//   node scripts/v1rfc-freeze.mjs --preserved                                  (i) and (ii) on the tree here
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),CC=path.join(here,'..'),ROOT=path.join(CC,'..');
const shaOf=bytes=>createHash('sha256').update(bytes).digest('hex'),sha=f=>shaOf(fs.readFileSync(f));
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).trim();
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1];};
const digest=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
/** The freeze this one is additive to, and the number its own verifier knows it by. */
const PRIOR='CoachingCore/v1/RUNTIME_FREEZE_V1RWS_2.json',PRIOR_N='2';
/** What this extension adds: tracked files only, under these paths. */
const ADDED=['CoachingCore/src/v1-race-forecast.mjs','CoachingCore/src/v1-pace-insights.mjs','CoachingCore/src/v1-run-forecast-index.mjs','CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json','CoachingCore/test/v1rfc-helpers.mjs','CoachingCore/scripts/v1rfc-freeze.mjs','CoachingCore/scripts/v1rfc-simulate.mjs',
 'audits/v1-run-extensions-2026-11-13/phase-b','audits/v1-race-forecast-2026-11-13/evidence'];
/** The authority this implementation was built from, bound by hash (read, never edited). */
const AUTHORITY=['audits/v1-race-forecast-2026-11-13/HANDOFF_RACE_FORECAST.md','audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION_R2.json','audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION.json','audits/v1-run-extensions-2026-11-13/PREFLIGHT_V1_RUN_EXTENSIONS.md',
 'audits/v1-run-extensions-2026-11-13/e01-patch/E01_PATCH_CLOSURE.md','audits/v1-run-extensions-2026-11-13/e01-patch/IOS_RUN_REPORT_INTEGRATION_CONTRACT.md','audits/v1-athlete-data-foundation-2026-11-13/ATHLETE_DATA_FOUNDATION.md',PRIOR];
const RECORDS='audits/v1-run-extensions-2026-11-13/phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json';
const isMine=f=>/\/v1rfc-[^/]+\.test\.mjs$/.test(f)||/RUNTIME_FREEZE_V1RFC_\d+\.json$/.test(f)||ADDED.some(a=>f===a||f.startsWith(a+'/'));
const testFiles=()=>git('ls-files','--','CoachingCore/test').split('\n').filter(f=>/\/v1rfc-[^/]+\.test\.mjs$/.test(f));
const added=()=>[...git('ls-files','--',...ADDED).split('\n'),...testFiles()].filter(Boolean).filter(f=>!/RUNTIME_FREEZE_V1RFC_\d+\.json$/.test(f)).sort();
const filesNow=()=>Object.fromEntries(added().map(f=>[f,sha(path.join(ROOT,f))]));
const recordPath=n=>path.join(CC,'v1',`RUNTIME_FREEZE_V1RFC_${n}.json`);
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
/** (i): the earlier freeze, by its own verifier, unedited. */
function prior(){
 const r=spawnSync(process.execPath,['scripts/v1rws-freeze.mjs','--check',PRIOR_N],{cwd:CC,encoding:'utf8'}),record=read(PRIOR);
 return {revision:record.revision,record:PRIOR,sha256:sha(path.join(ROOT,PRIOR)),commit:record.commit,ok:r.status===0,verifier:'CoachingCore/scripts/v1rws-freeze.mjs --check '+PRIOR_N,verifierSha256:sha(path.join(CC,'scripts','v1rws-freeze.mjs')),said:String(r.stdout??'').trim().split('\n')[0]};
}
/**
 * (ii): what changed under CoachingCore since the commit the earlier freeze binds, to a commit (or to the tree here), beyond this extension's own
 * files. The earlier freeze's own record was written after the commit it binds: it is bound here by hash (AUTHORITY), not by this difference.
 */
const outside=(from,to=null)=>git('diff','--name-only',from,...(to?[to]:[]),'--','CoachingCore/src','CoachingCore/v1','CoachingCore/test','CoachingCore/scripts','CoachingCore/r6','CoachingCore/r7','CoachingCore/fixtures','CoachingCore/package.json','CoachingCore/package-lock.json').split('\n').filter(Boolean).filter(f=>!isMine(f)&&f!==PRIOR);
/** A run of the test runner here: the counts and the names of the tests that failed, read from its own report (never typed in). */
function runSuite(files=[]){
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd:CC,encoding:'utf8',maxBuffer:1<<30}),out=String(r.stdout??''),count=k=>{const m=out.match(new RegExp(`^# ${k} (\\d+)$`,'m'));return m?Number(m[1]):null;};
 const failed=[...out.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m=>m[1].replace(/\s+#.*$/,'').trim());
 const total=count('tests'),passed=count('pass'),fail=count('fail');
 if(total===null||passed===null||fail===null||count('cancelled')!==0||fail!==failed.length)throw new Error('the test runner\'s report could not be read');
 return {passed,total,failed:failed.sort()};
}
/** The one historical test that fails on this line since phase A, by design (Founder governance decision of 2026-11-14). */
const HISTORICAL='V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here';
/** What a freeze says of the pace revision, whose code is inside the bytes it binds. */
const PACE_REVISION={boundary:'V1X-PACE-REVISION',state:'IMPLEMENTED_OFF_NOT_APPROVED',failsClosed:false,enablingRecord:'NONE_VALID_OVER_THESE_BYTES',
 statement:'The athlete-confirmed revision of the threshold band is implemented in the files this freeze binds, is off, is not approved and does not fail closed. No enabling record of V1X-PACE-REVISION is valid over these bytes: the runtime would turn it on with any record bound to the values hash, so this verifier fails when one is present. Turning it on needs new code, the open findings closed and judged again, an integration that meets IC-2, and a successor freeze. "Off by default" is not a claim that it is safe.',
 open:['SEC-RFC-A-01','SEC-RFC-A-02','SEC-RFC-A-03','SEC-RFC-A-10','SSCTR-RFC-A-03','SSCTR-RFC-A-11','SSCTR-RFC-A-09 (the question for the offer)','QRE-RFC-A-04','QRE-RFC-B-03','L-12 (GPS quality written by the device)','hard gate E-1','QRE-RWS-F-01']};
async function boundaries(){
 const ext=await import('../src/v1-race-forecast.mjs'),auth=ext.runForecastAuthority(),file=fs.existsSync(path.join(ROOT,RECORDS))?read(RECORDS):null;
 return {ext,on:Object.fromEntries(Object.keys(ext.FORECAST_BOUNDARIES).map(k=>[ext.FORECAST_BOUNDARIES[k],ext.allowsForecast(auth,k)])),
  revisionRecords:(Array.isArray(file?.records)?file.records:[]).filter(r=>r?.boundaryId===ext.FORECAST_BOUNDARIES.REVISION).length};
}

if(arg('--write')){
 const n=arg('--write'),commit=arg('--commit'),out=recordPath(n);
 if(!/^\d+$/.test(n)||!commit)throw new Error('usage: --write <n> --commit <sha>');
 if(fs.existsSync(out))throw new Error('a freeze record is never rewritten: '+out);
 const full=git('rev-parse',commit),bound=[...ADDED,'CoachingCore/src','CoachingCore/test','CoachingCore/v1','CoachingCore/scripts'],dirty=git('status','--porcelain','--',...bound);
 if(dirty)throw new Error('the bound paths differ from the index or hold untracked files; commit first:\n'+dirty);
 if(git('diff','--name-only',full,'HEAD','--',...bound))throw new Error('the bound paths at HEAD differ from the commit named');
 const p=prior();if(!p.ok)throw new Error(p.revision+' is not preserved here: '+p.said);
 const changed=outside(p.commit,full);if(changed.length)throw new Error('files outside this extension changed since '+p.revision+': '+changed.join(', '));
 const {ext,on,revisionRecords}=await boundaries();
 if(revisionRecords)throw new Error('the records file holds a record of V1X-PACE-REVISION: none is valid over these bytes (the revision is not approved and does not fail closed)');
 if(!on['V1X-RUN-FORECAST']||!on['V1X-PACE-INSIGHTS'])throw new Error('no independent SSCTR record enables V1X-RUN-FORECAST and V1X-PACE-INSIGHTS over the pinned values: nothing is frozen while a blocker stands');
 if(on['V1X-PACE-REVISION'])throw new Error('V1X-PACE-REVISION is on: it stays off until an integration meets IC-2, and is no part of this freeze');
 const joint=runSuite(),own=runSuite(testFiles().map(f=>path.relative(CC,path.join(ROOT,f))));
 if(own.failed.length||own.passed!==own.total)throw new Error('this extension\'s own tests fail: '+own.failed.join(' | '));
 if(joint.failed.length!==1||joint.failed[0]!==HISTORICAL||joint.total-joint.passed!==1)throw new Error('on this line the joint suite fails only the one historical freeze test; found: '+(joint.failed.join(' | ')||'none'));
 const files=filesNow();
 const record={revision:`COACHINGCORE-V1-RACE-FORECAST-FREEZE-${n}`,mission:'CoachingCore V1 Run Extensions, phase B: Race Forecast and Pace Insights (Founder mission of 2026-11-15)',
  scope:'An additive extension of the V1-scoped CoachingCore on synthetic data: the race forecast (two plausibility envelopes, never probabilities) and the pace insights (observational), read through the admitted record of the native run formats. The athlete-confirmed revision of the threshold band is implemented and off. Not production, backend, operational security or a published app; no authorization for real athletes.',
  commit:full,created:new Date().toISOString(),additiveTo:p,amendment:null,entryPoint:'CoachingCore/src/v1-run-forecast-index.mjs',baseEntryPoint:'CoachingCore/src/v1-run-format-index.mjs',composition:'v1-run-forecast-index -> v1-run-format-index -> v1-run-index -> v1-index',
  suite:{joint:{passed:joint.passed,total:joint.total,failed:joint.failed,note:'Everything on this line, run by this script. Its one failure is the historical freeze test of the run calibration, by name; it is not edited and stays green on its own snapshot.'},own:{passed:own.passed,total:own.total,files:testFiles().length,note:'The tests of this extension (test/v1rfc-*.test.mjs), run by this script.'}},
  paceRevision:PACE_REVISION,
  extension:{id:ext.FORECAST_EXTENSION_ID,file:'CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json',sha256:ext.FORECAST_VALUES_FILE_SHA256,pinned:ext.FORECAST_VALUES_SHA256,boundaries:on,
   records:{file:RECORDS,sha256:fs.existsSync(path.join(ROOT,RECORDS))?sha(path.join(ROOT,RECORDS)):null,note:'A boundary is on only with an independent SSCTR record bound to the values hash; without one it is off (fail closed: the added keys are DISABLED and everything else is the run formats\' answer).'}},
  authority:Object.fromEntries(AUTHORITY.map(f=>[f,sha(path.join(ROOT,f))])),
  ...(arg('--note')?{note:arg('--note')}:{}),files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
 fs.writeFileSync(out,JSON.stringify(record,null,1)+'\n');
 console.log(`${record.revision}: ${record.fileCount} added files, digest ${record.filesDigest}, binds ${full}; no amended file; ${p.revision} preserved by its own verifier`);
}else if(arg('--check')){
 const r=JSON.parse(fs.readFileSync(recordPath(arg('--check')),'utf8')),now=filesNow(),drift=[...new Set([...Object.keys(r.files),...Object.keys(now)])].filter(f=>r.files[f]!==now[f]),p=prior(),changed=outside(p.commit),{on,revisionRecords}=await boundaries();
 const authority=Object.entries(r.authority).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(path.join(ROOT,f))!==h).map(([f])=>f),switched=Object.keys(r.extension.boundaries).filter(k=>r.extension.boundaries[k]!==on[k]);
 const ok=!drift.length&&digest(r.files)===r.filesDigest&&p.ok&&p.sha256===r.additiveTo.sha256&&!changed.length&&!authority.length&&!switched.length&&!revisionRecords;
 console.log(ok?`${r.revision}: ${r.fileCount} added files match; no amended file; ${p.revision} preserved (${p.said})`
  :`${r.revision}: DRIFT\n`+[...drift,...(p.ok?[]:['('+p.revision+') '+p.said]),...changed.map(f=>'(outside this extension) '+f),...authority.map(f=>'(authority) '+f),...switched.map(k=>'(boundary) '+k),...(revisionRecords?['(boundary) a record of V1X-PACE-REVISION is present: none is valid over these bytes']:[])].slice(0,40).join('\n'));process.exit(ok?0:1);
}else if(process.argv.includes('--preserved')){
 const p=prior(),changed=outside(p.commit);
 console.log(`${p.revision}: ${p.ok?'preserved':'NOT preserved'} (${p.said}); ${changed.length?'CHANGED outside this extension:\n'+changed.join('\n'):'nothing outside this extension changed since '+p.commit.slice(0,7)}`);process.exit(p.ok&&!changed.length?0:1);
}else{console.log('usage: --write <n> --commit <sha> | --check <n> | --preserved');process.exit(2);}
