// CoachingCore V1 Strength Extension (Founder request of 2026-11-16; SI-V1-SSCTR-SQ-1 to SQ-4): the additive freeze record
// (COACHINGCORE-V1-STRENGTH-FREEZE-n). No earlier freeze record or verifier is edited to accept it (Founder governance rule of 2026-11-13): the
// historical checks keep running on their own frozen snapshots, and this verifier declares the one amendment it authorizes. It binds one commit:
//   (i)   every file the four earlier freezes bind is byte-identical here (COACHINGCORE-V1-FREEZE-1, -RUN-CALIBRATION-FREEZE-1,
//         -RUN-FORMAT-FREEZE-2 and -RACE-FORECAST-FREEZE-1), and so is the authority each of the last two bound, except the two amended files
//         of COACHINGCORE-V1-FREEZE-1;
//   (ii)  src/r6-adaptation.mjs is the bytes COACHINGCORE-V1-RUN-FORMAT-FREEZE-2 authorized (its own amendment, untouched here);
//   (iii) src/r7b-repertoire.mjs, the one file this extension amends: its base is exactly the bytes COACHINGCORE-V1-FREEZE-1 recorded, and its
//         new hash and its whole diff are the authorized ones below, read again from git on every check. Nothing lexical is accepted in their
//         place: any other byte in the file, on any line, fails;
//   (iv)  nothing else under CoachingCore's source, values, tests, scripts, policy, catalog or fixtures changed since the commit
//         COACHINGCORE-V1-RACE-FORECAST-FREEZE-1 binds, but what this extension adds;
//   (v)   the files this extension adds, each by hash, and the authority it was built from.
// The earlier verifiers are not run here. On this line each of them names the amended file, by design, and each passes on the commit its own
// record binds (the historical check stays green on its own snapshot). For the same reason the joint suite has exactly two failures on this
// line, the two historical freeze tests that name the amended file: `--write` runs the suite itself, never trusts a typed count, and refuses
// unless those two tests, by name, are the only failures and every test of this extension passes.
// A freeze is written only over independent SSCTR records that enable the four boundaries for the pinned values.
// This script writes nothing but its own record.
//   node scripts/v1str-freeze.mjs --write <n> --commit <sha> [--note "..."]   runs the suites, then writes v1/RUNTIME_FREEZE_V1STR_<n>.json
//   node scripts/v1str-freeze.mjs --check <n>                                  recomputes and compares; exit 1 on drift
//   node scripts/v1str-freeze.mjs --preserved                                  (i) to (iv) on the tree here
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
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
/** The earlier freezes this one is additive to, each by its own record. */
const PRIOR={v1:'CoachingCore/v1/RUNTIME_FREEZE_V1_1.json',v1rc:'CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json',v1rws:'CoachingCore/v1/RUNTIME_FREEZE_V1RWS_2.json',v1rfc:'CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json'};
/** The file of COACHINGCORE-V1-FREEZE-1 that COACHINGCORE-V1-RUN-FORMAT-FREEZE-2 amended, and the one this extension amends. */
const AMENDED_BEFORE='CoachingCore/src/r6-adaptation.mjs',AMENDED='CoachingCore/src/r7b-repertoire.mjs';
/** What this extension adds: tracked files only, under these paths. */
const ADDED=['CoachingCore/src/v1-strength.mjs','CoachingCore/src/v1-strength-index.mjs','CoachingCore/v1/STRENGTH_EXTENSION_V1.json','CoachingCore/test/v1str-helpers.mjs','CoachingCore/scripts/v1str-freeze.mjs','audits/v1-strength-corrections-2026-11-16/candidate'];
/** The authority this implementation was built from, bound by hash (read, never edited). */
const AUTHORITY=['audits/v1-strength-intelligence-2026-11-13/STRENGTH_INTELLIGENCE_FOUNDATION.md','audits/v1-strength-intelligence-2026-11-13/reviews/SSCTR_SI_V1_DECISION.json','audits/v1-strength-intelligence-2026-11-13/reviews/SSCTR_SI_V1_DECISION.md',
 'audits/v1-strength-intelligence-2026-11-13/probe-strength.mjs','audits/v1-strength-intelligence-2026-11-13/sweep-planes.mjs','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json','CoachingCore/r6/PROGRAM_POLICY_R6.json',...Object.values(PRIOR)];
const RECORDS='audits/v1-strength-corrections-2026-11-16/candidate/reviews/ssctr/SSCTR_V1STR_RECORDS.json';
const isMine=f=>/\/v1str-[^/]+\.test\.mjs$/.test(f)||/RUNTIME_FREEZE_V1STR_\d+\.json$/.test(f)||ADDED.some(a=>f===a||f.startsWith(a+'/'));
const testFiles=()=>git('ls-files','--','CoachingCore/test').split('\n').filter(f=>/\/v1str-[^/]+\.test\.mjs$/.test(f));
const added=()=>[...git('ls-files','--',...ADDED).split('\n'),...testFiles()].filter(Boolean).filter(f=>!/RUNTIME_FREEZE_V1STR_\d+\.json$/.test(f)).sort();
const filesNow=()=>Object.fromEntries(added().map(f=>[f,sha(path.join(ROOT,f))]));
const recordPath=n=>path.join(CC,'v1',`RUNTIME_FREEZE_V1STR_${n}.json`);
const differs=([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(path.join(ROOT,f))!==h;
/** (i) and (ii): the four earlier records against the files here; the file this extension amends is checked apart. */
function preserved(){
 const rec=Object.fromEntries(Object.entries(PRIOR).map(([k,f])=>[k,read(f)])),out={};
 for(const [k,r] of Object.entries(rec)){
  const skip=k==='v1'?[AMENDED_BEFORE,AMENDED]:[],changed=Object.entries(r.files).filter(([f])=>!skip.includes(f)).filter(differs).map(([f])=>f),authority=Object.entries(r.authority??{}).filter(differs).map(([f])=>f);
  out[k]={revision:r.revision,record:PRIOR[k],sha256:sha(path.join(ROOT,PRIOR[k])),commit:r.commit,fileCount:r.fileCount,filesDigest:r.filesDigest,identical:r.fileCount-skip.length-changed.length,...(skip.length?{amended:skip}:{}),changed,...(r.authority?{authorityChanged:authority}:{})};
 }
 // (ii): the earlier amendment is the bytes its own record authorized.
 const earlier={file:AMENDED_BEFORE,recordedIn:rec.v1rws.revision,authorizedSha256:rec.v1rws.amendment.newSha256,sha256:fs.existsSync(path.join(ROOT,AMENDED_BEFORE))?sha(path.join(ROOT,AMENDED_BEFORE)):null};
 earlier.ok=earlier.sha256===earlier.authorizedSha256;
 const bad=[...Object.entries(out).flatMap(([k,x])=>[...x.changed.map(f=>`(${x.revision}) ${f}`),...(x.authorityChanged??[]).map(f=>`(${x.revision}, authority) ${f}`)]),...(earlier.ok?[]:[`(${earlier.recordedIn}, amendment) ${AMENDED_BEFORE}`])];
 return {records:out,earlierAmendment:earlier,bad};
}
/**
 * The authorized amendment (Strength Intelligence Foundation section F, step S2; Founder request of 2026-11-16): the bytes of the amended file
 * and its whole diff from the base, each by hash. The diff is the hunk headers and the changed lines of `git diff -U0 <base> -- <file>`, joined
 * by a line feed.
 */
const AMENDMENT={sha256:'6bd4f365cd34b4165c3bafb838ad0cd20429f0841fb90b53b12a94481ec53833',diffSha256:'f053482ff60f5f3264416d544bd050d477bf652977c6aaf482c39a20c140c17b',linesAdded:36,linesRemoved:10};
const diffText=lines=>lines.filter(l=>/^(@@|[+-])/.test(l)&&!/^(\+\+\+|---)/.test(l));
function rulesAlone(lines){
 const plus=lines.filter(l=>l.startsWith('+')&&!l.startsWith('+++')),minus=lines.filter(l=>l.startsWith('-')&&!l.startsWith('---')),found=shaOf(Buffer.from(diffText(lines).join('\n'),'utf8'));
 const ok=found===AMENDMENT.diffSha256&&plus.length===AMENDMENT.linesAdded&&minus.length===AMENDMENT.linesRemoved;
 return {ok,linesAdded:plus.length,linesRemoved:minus.length,diffSha256:found,authorizedDiffSha256:AMENDMENT.diffSha256};
}
const diffOf=(base,commit=null)=>execFileSync('git',['diff','--no-color','--no-ext-diff','-U0',base,...(commit?[commit]:[]),'--',AMENDED],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28});
/** (iii): the amended file from the base the first record keeps to a commit (or to the tree here), with the whole diff. */
function amendment(commit=null){
 const v1=read(PRIOR.v1),baseBytes=blob(v1.commit,AMENDED),diff=diffOf(v1.commit,commit),lines=diff.split('\n');
 return {file:AMENDED,rulesAlone:rulesAlone(lines),baseCommit:v1.commit,baseSha256:shaOf(baseBytes),baseIsTheRecorded:shaOf(baseBytes)===v1.files[AMENDED],recordedIn:v1.revision,newSha256:commit?shaOf(blob(commit,AMENDED)):sha(path.join(ROOT,AMENDED)),authorizedSha256:AMENDMENT.sha256,
  what:'The repertoire authority carries the strength rules handed under the exported key STRENGTH_RULES (as `strength`), and the binding of a plan records them. With them: a hold configuration is not admitted (SQ-1); in an upper-body slot where RUNNING_SUPPORT is a matching purpose external loading ranks before purpose (SQ-2); with two MAIN slots of PUSH or PULL that admit both planes, the second asks for the vertical plane in a new plan, inside the loading guard, and keeps the configuration it was built with in a plan in force (SQ-4). Without the key every authority, binding and selection is exactly as before.',
  diff:{sha256:shaOf(Buffer.from(diff,'utf8')),linesAdded:lines.filter(l=>l.startsWith('+')&&!l.startsWith('+++')).length,linesRemoved:lines.filter(l=>l.startsWith('-')&&!l.startsWith('---')).length,hunks:lines.filter(l=>l.startsWith('@@')).length,text:diffText(lines)}};
}
/** (iv): what changed under CoachingCore since the commit the last freeze binds, to a commit (or to the tree here), beyond this extension. */
const outside=(from,to=null)=>git('diff','--name-only',from,...(to?[to]:[]),'--','CoachingCore/src','CoachingCore/v1','CoachingCore/test','CoachingCore/scripts','CoachingCore/r6','CoachingCore/r7','CoachingCore/fixtures','CoachingCore/package.json','CoachingCore/package-lock.json').split('\n').filter(Boolean).filter(f=>!isMine(f)&&f!==AMENDED&&!Object.values(PRIOR).includes(f));
/** A run of the test runner here: the counts and the names of the tests that failed, read from its own report (never typed in). */
function runSuite(files=[]){
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd:CC,encoding:'utf8',maxBuffer:1<<30}),out=String(r.stdout??''),count=k=>{const m=out.match(new RegExp(`^# ${k} (\\d+)$`,'m'));return m?Number(m[1]):null;};
 const failed=[...out.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m=>m[1].replace(/\s+#.*$/,'').trim());
 const total=count('tests'),passed=count('pass'),fail=count('fail');
 if(total===null||passed===null||fail===null||count('cancelled')!==0||fail!==failed.length)throw new Error('the test runner\'s report could not be read');
 return {passed,total,failed:failed.sort()};
}
/** The two historical freeze tests that fail on this line, by design: each names the amended file and stays green on its own snapshot. */
const HISTORICAL=[
 {test:'CoachingCore/test/v1rc-calibration.test.mjs',name:'V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here',names:[AMENDED_BEFORE,AMENDED],greenOn:'c8104c1 (its own snapshot)',since:'COACHINGCORE-V1-RUN-FORMAT-FREEZE-1 (it named the earlier amended file); it now names both'},
 {test:'CoachingCore/test/v1rws-engine.test.mjs',name:'I10, V6: every file the two earlier freezes bind is byte-identical here except the one amended file; its base is the recorded bytes and its diff is the reader alone',names:[AMENDED],greenOn:'2dfa216 (the last commit of the run extensions line)',since:'this extension'}];
async function boundaries(){
 const ext=await import('../src/v1-strength.mjs'),auth=ext.strengthAuthority();
 return {ext,auth,on:Object.fromEntries(Object.keys(ext.STRENGTH_BOUNDARIES).map(k=>[ext.STRENGTH_BOUNDARIES[k],ext.allowsStrength(auth,k)]))};
}

if(arg('--write')){
 const n=arg('--write'),commit=arg('--commit'),out=recordPath(n);
 if(!/^\d+$/.test(n)||!commit)throw new Error('usage: --write <n> --commit <sha>');
 if(fs.existsSync(out))throw new Error('a freeze record is never rewritten: '+out);
 const full=git('rev-parse',commit),bound=[...ADDED,'CoachingCore/src','CoachingCore/test','CoachingCore/v1','CoachingCore/scripts'],dirty=git('status','--porcelain','--',...bound);
 if(dirty)throw new Error('the bound paths differ from the index or hold untracked files; commit first:\n'+dirty);
 if(git('diff','--name-only',full,'HEAD','--',...bound))throw new Error('the bound paths at HEAD differ from the commit named');
 const p=preserved();if(p.bad.length)throw new Error('an earlier freeze is not preserved: '+p.bad.join(', '));
 const a=amendment(full);if(!a.baseIsTheRecorded)throw new Error('the base of the amended file is not the bytes COACHINGCORE-V1-FREEZE-1 recorded');
 if(a.newSha256!==sha(path.join(ROOT,AMENDED)))throw new Error('the amended file here is not the one of the commit named');
 if(a.newSha256!==AMENDMENT.sha256)throw new Error('the amended file is not the authorized bytes');
 if(!a.rulesAlone.ok)throw new Error('the diff of the amended file is not the authorized one');
 const changed=outside(p.records.v1rfc.commit,full);if(changed.length)throw new Error('files outside this extension and its one amendment changed since '+p.records.v1rfc.revision+': '+changed.join(', '));
 const {ext,on}=await boundaries(),off=Object.keys(on).filter(k=>!on[k]);
 if(off.length)throw new Error('no independent SSCTR record enables '+off.join(', ')+' over the pinned values: nothing is frozen while a blocker stands');
 const decision=read('CoachingCore/v1/STRENGTH_EXTENSION_V1.json').decision;if(sha(path.join(ROOT,decision.file))!==decision.sha256)throw new Error('the SSCTR decision the values name is not the bytes here');
 const joint=runSuite(),own=runSuite(testFiles().map(f=>path.relative(CC,path.join(ROOT,f))));
 if(own.failed.length||own.passed!==own.total)throw new Error('this extension\'s own tests fail: '+own.failed.join(' | '));
 const expected=HISTORICAL.map(h=>h.name).sort();
 if(joint.failed.length!==expected.length||joint.failed.some((x,i)=>x!==expected[i])||joint.total-joint.passed!==expected.length)throw new Error('on this line the joint suite fails only the two historical freeze tests that name the amended file; found: '+(joint.failed.join(' | ')||'none'));
 const files=filesNow();
 const record={revision:`COACHINGCORE-V1-STRENGTH-FREEZE-${n}`,mission:'CoachingCore V1 Strength Intelligence: the four SSCTR-approved corrections (Founder request of 2026-11-16)',
  scope:'An additive extension of the V1-scoped CoachingCore on synthetic data: hold configurations out of selection until a time dose is approved, external loading before purpose in upper-body slots under RUNNING_SUPPORT, vertical and horizontal plane alternation of the push and pull MAIN slots, and a descriptive weekly count of working sets per primary muscle. No dose, progression, recovery, interference, hold or screening rule changes. Not production, backend, operational security or a published app; no authorization for real athletes.',
  commit:full,created:new Date().toISOString(),additiveTo:p.records,earlierAmendment:p.earlierAmendment,amendment:a,entryPoint:'CoachingCore/src/v1-strength-index.mjs',baseEntryPoint:'CoachingCore/src/v1-run-forecast-index.mjs',composition:'v1-strength-index -> v1-run-forecast-index -> v1-run-format-index -> v1-run-index -> v1-index',
  suite:{joint:{passed:joint.passed,total:joint.total,failed:joint.failed,note:'Everything on this line, run by this script. Its two failures are the historical freeze tests below, by name.'},own:{passed:own.passed,total:own.total,files:testFiles().length,note:'The tests of this extension (test/v1str-*.test.mjs), run by this script.'},
   historical:{expectedFailures:HISTORICAL,note:'The historical freeze checks are not run here and no earlier verifier is edited: each runs, as it is, against the commit its own record binds, where it is green. (i) to (iv) are this line\'s own proof that the earlier freezes are preserved.'}},
  extension:{id:ext.STRENGTH_EXTENSION_ID,file:'CoachingCore/v1/STRENGTH_EXTENSION_V1.json',sha256:ext.STRENGTH_VALUES_FILE_SHA256,pinned:ext.STRENGTH_VALUES_SHA256,boundaries:on,
   records:{file:RECORDS,sha256:fs.existsSync(path.join(ROOT,RECORDS))?sha(path.join(ROOT,RECORDS)):null,note:'A boundary is on only with an independent SSCTR record bound to the values hash; without one it is off (fail closed: every plan and review is the answer of the entry point below). A plan records the selection boundaries it was built under and is reviewed only under those.'}},
  authority:Object.fromEntries(AUTHORITY.map(f=>[f,sha(path.join(ROOT,f))])),
  ...(arg('--note')?{note:arg('--note')}:{}),files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
 fs.writeFileSync(out,JSON.stringify(record,null,1)+'\n');
 console.log(`${record.revision}: ${record.fileCount} added files, digest ${record.filesDigest}, binds ${full}; 1 amended file (${a.diff.linesAdded}+/${a.diff.linesRemoved}-); ${Object.values(p.records).map(x=>`${x.revision} preserved ${x.identical}/${x.fileCount-(x.amended?.length??0)}`).join('; ')}`);
}else if(arg('--check')){
 const r=JSON.parse(fs.readFileSync(recordPath(arg('--check')),'utf8')),now=filesNow(),drift=[...new Set([...Object.keys(r.files),...Object.keys(now)])].filter(f=>r.files[f]!==now[f]),p=preserved(),a=amendment(r.commit),changed=outside(p.records.v1rfc.commit),{on}=await boundaries();
 const amended=fs.existsSync(path.join(ROOT,AMENDED))&&sha(path.join(ROOT,AMENDED))===r.amendment.newSha256&&r.amendment.newSha256===AMENDMENT.sha256&&a.baseIsTheRecorded&&a.baseSha256===r.amendment.baseSha256&&a.newSha256===r.amendment.newSha256&&a.diff.sha256===r.amendment.diff.sha256&&a.rulesAlone.ok;
 const authority=Object.entries(r.authority).filter(differs).map(([f])=>f),switched=Object.keys(r.extension.boundaries).filter(k=>r.extension.boundaries[k]!==on[k]),priors=Object.keys(PRIOR).filter(k=>p.records[k].sha256!==r.additiveTo[k].sha256);
 const ok=!drift.length&&digest(r.files)===r.filesDigest&&!p.bad.length&&!priors.length&&amended&&!changed.length&&!authority.length&&!switched.length;
 console.log(ok?`${r.revision}: ${r.fileCount} added files match; 1 amended file matches its recorded diff (${r.amendment.diff.linesAdded}+/${r.amendment.diff.linesRemoved}-); ${Object.values(p.records).map(x=>`${x.revision} preserved ${x.identical}/${x.fileCount-(x.amended?.length??0)}`).join('; ')}`
  :`${r.revision}: DRIFT\n`+[...drift,...p.bad,...priors.map(k=>'(record) '+PRIOR[k]),...(amended?[]:['(amendment) '+AMENDED]),...changed.map(f=>'(outside this extension) '+f),...authority.map(f=>'(authority) '+f),...switched.map(k=>'(boundary) '+k)].slice(0,40).join('\n'));process.exit(ok?0:1);
}else if(process.argv.includes('--preserved')){
 const p=preserved(),a=amendment(),changed=outside(p.records.v1rfc.commit),bytesOk=a.newSha256===AMENDMENT.sha256;
 console.log(Object.values(p.records).map(x=>`${x.revision}: ${x.identical}/${x.fileCount-(x.amended?.length??0)} files byte-identical${x.amended?` (${x.amended.length} amended)`:''}`).join('\n')
  +`\n${AMENDED_BEFORE}: ${p.earlierAmendment.ok?'':'NOT '}the bytes ${p.earlierAmendment.recordedIn} authorized`
  +`\n${AMENDED}: its base is ${a.baseIsTheRecorded?'':'NOT '}the recorded bytes; it is ${bytesOk?'':'NOT '}the authorized bytes; its diff is ${a.rulesAlone.ok?'':'NOT '}the authorized one (${a.rulesAlone.linesAdded}+/${a.rulesAlone.linesRemoved}-; file ${a.newSha256}; diff ${a.rulesAlone.diffSha256})`
  +`\n${changed.length?'CHANGED outside this extension:\n'+changed.join('\n'):'nothing else changed since '+p.records.v1rfc.commit.slice(0,7)}`+(p.bad.length?'\nNOT PRESERVED:\n'+p.bad.join('\n'):''));
 process.exit(p.bad.length||!a.baseIsTheRecorded||!a.rulesAlone.ok||!bytesOk||changed.length?1:0);
}else{console.log('usage: --write <n> --commit <sha> | --check <n> | --preserved');process.exit(2);}
