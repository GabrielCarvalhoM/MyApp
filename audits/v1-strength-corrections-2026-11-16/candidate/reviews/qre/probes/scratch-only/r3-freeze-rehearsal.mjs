// QRE V1STR N4 recheck R3: rehearsal of scripts/v1str-freeze.mjs on 5f7f6f6. SCRATCH CLONE ONLY (argv[2] = a judges/qre-n4/r3-freeze clone).
// Part 1: --preserved on the pristine tree and on trees it must refuse (each case edits the clone, runs the verifier, then restores the files with
// `git checkout`/`git reset` of that scratch clone; an added file is removed alone with fs.unlinkSync; no recursive deletion).
// Part 2: --write 1 refused without enabling records and with records bound to the previous values hash; then a TEST-ONLY records file bound to
// the new values hash, plus stand-in review records, committed; --write 1; --check 1 before the record is committed (QRE-STR-B-02: expected to
// fail); commit; --check 1; then drift cases on --check 1.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
const ROOT=process.argv[2],OUT=process.argv[3];if(!ROOT||!/judges[\\/]qre-n4[\\/]r3-freeze$/.test(ROOT))throw new Error('scratch r3-freeze only: '+ROOT);
const CC=path.join(ROOT,'CoachingCore'),git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).trim();
const verify=(...a)=>{const t0=Date.now(),r=spawnSync(process.execPath,['scripts/v1str-freeze.mjs',...a],{cwd:CC,encoding:'utf8',maxBuffer:1<<28});return {exit:r.status,ms:Date.now()-t0,out:(r.stdout+r.stderr).trim().split('\n').slice(0,8).join(' | ').slice(0,1500)};};
const results={preserved:[],write:[],check:[]};const save=()=>fs.writeFileSync(OUT,JSON.stringify(results,null,1));
const edit=(f,fn)=>{const p=path.join(ROOT,f);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
const addFile=(f,body)=>{fs.writeFileSync(path.join(ROOT,f),body);return [f];};
const R7B='CoachingCore/src/r7b-repertoire.mjs';
function kase(bucket,name,expectRefuse,doIt,{commit=false,args=['--preserved']}={}){
 const head=git('rev-parse','HEAD'),added=doIt()??[];
 if(commit){git('add','-A','--',...(added.length?added:['.']));git('commit','-q','-m','qre r3 rehearsal: '+name);}
 const r=verify(...args);results[bucket].push({name,commit,expectRefuse,exit:r.exit,asExpected:(r.exit!==0)===expectRefuse,out:r.out});save();
 if(commit)git('reset','-q','--hard',head);
 for(const f of added){const p=path.join(ROOT,f);if(fs.existsSync(p)&&!git('ls-files','--',f))fs.unlinkSync(p);}
 git('checkout','--','.');
}
// ---- Part 1 ----
kase('preserved','pristine tree at 5f7f6f6',false,()=>[]);
kase('preserved','amended file = the 3342a1d bytes (the previously judged version), working tree',true,()=>{fs.writeFileSync(path.join(ROOT,R7B),git('show','3342a1d:'+R7B)+'\n');return [];});
kase('preserved','amended file = the 3342a1d bytes, committed',true,()=>{fs.writeFileSync(path.join(ROOT,R7B),execFileSync('git',['show','3342a1d:'+R7B],{cwd:ROOT}));return [R7B];},{commit:true});
kase('preserved','one byte in the changed comment of the amended file',true,()=>{edit(R7B,s=>{if(!s.includes('no asking slot, whatever'))throw new Error('anchor text');return s.replace('no asking slot, whatever','no asking slots, whatever');});return [];});
kase('preserved','trailing newline added to the amended file',true,()=>{edit(R7B,s=>s+'\n');return [];});
kase('preserved','the in-force guard removed from the amended file (mutant R3-01), committed',true,()=>{edit(R7B,s=>{const o="if(i%2===1&&(!S.inForce||typeof S.inForce[types[x.ti]+':'+x.si]==='string'))";if(!s.includes(o))throw new Error('guard');return s.replace(o,'if(i%2===1)');});return [R7B];},{commit:true});
kase('preserved','extra changed frozen file src/r6-program.mjs (committed)',true,()=>{edit('CoachingCore/src/r6-program.mjs',s=>s+'\n// x\n');return ['CoachingCore/src/r6-program.mjs'];},{commit:true});
kase('preserved','earlier record V1RFC: a field added',true,()=>{edit('CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json',s=>s.replace('"revision"','"tampered": true,\n "revision"'));return [];});
kase('preserved','added untracked file CoachingCore/src/evil.mjs',true,()=>addFile('CoachingCore/src/evil.mjs','export const x=1;\n'));
kase('preserved','added committed file CoachingCore/src/evil.mjs',true,()=>addFile('CoachingCore/src/evil.mjs','export const x=1;\n'),{commit:true});
kase('preserved','changed runtime-read policy CoachingCore/r5/PROGRAM_POLICY_R5.json (committed)',true,()=>{edit('CoachingCore/r5/PROGRAM_POLICY_R5.json',s=>s+' ');return ['CoachingCore/r5/PROGRAM_POLICY_R5.json'];},{commit:true});
kase('preserved','the r5 SSCTR policy review changed (runtime-read, committed)',true,()=>{edit('audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json',s=>s+' ');return ['audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];},{commit:true});
kase('preserved','values file changed (committed): an own file, which --preserved does not judge (only --check does)',false,()=>{edit('CoachingCore/v1/STRENGTH_EXTENSION_V1.json',s=>s.replace('"timeDose": null','"timeDose": 30'));return ['CoachingCore/v1/STRENGTH_EXTENSION_V1.json'];},{commit:true});
// ---- Part 2 ----
const REC='audits/v1-strength-corrections-2026-11-16/candidate/reviews/ssctr/SSCTR_V1STR_RECORDS.json';
const BOUNDARIES=['V1X-STRENGTH-HOLD-DOSE','V1X-STRENGTH-UPPER-LOADING','V1X-STRENGTH-PLANE','V1X-STRENGTH-EXPOSURE'];
const records=sha=>JSON.stringify({note:'TEST-ONLY: written by the QRE in a scratch clone to rehearse the freeze verifier. Not a review, not an approval.',records:BOUNDARIES.map(b=>({boundaryId:b,extensionSha256:sha,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['TEST-ONLY'],conditions:['TEST-ONLY'],reviewId:'TEST-ONLY-QRE-R3'}))},null,1)+'\n';
const NEW='06d4731de7cf748adf53ff4b88bdffcfe14200ee69c9d8cd1d86257c0d749b33',OLD='15a51f55e847ad01d683912d50319629ead68a1cfa00d3c69c5061b3e596850f';
const head0=git('rev-parse','HEAD');
{const r=verify('--write','1','--commit',head0);results.write.push({name:'--write 1 with no records file',expectRefuse:true,exit:r.exit,asExpected:r.exit!==0,out:r.out});save();}
fs.writeFileSync(path.join(ROOT,REC),records(OLD));git('add','--',REC);git('commit','-q','-m','TEST-ONLY records bound to the previous values hash');
{const h=git('rev-parse','HEAD'),r=verify('--write','1','--commit',h);results.write.push({name:'--write 1 with records bound to the previous values hash 15a51f55',expectRefuse:true,exit:r.exit,asExpected:r.exit!==0,out:r.out});save();}
git('reset','-q','--hard',head0);
// Stand-in review records, as the real commit will add them (review files only) and the TEST-ONLY enabling records for the new hash.
const STAND=['audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/QRE_V1STR_N4_RECHECK_R3.md','audits/v1-strength-corrections-2026-11-16/candidate/reviews/ssctr/SSCTR_V1STR_N4_RECHECK_R3.md'];
for(const f of STAND)fs.writeFileSync(path.join(ROOT,f),'TEST-ONLY stand-in written in a scratch clone by the QRE.\n');
fs.writeFileSync(path.join(ROOT,REC),records(NEW));git('add','--',REC,...STAND);git('commit','-q','-m','TEST-ONLY: stand-in review records and enabling records bound to 06d4731d');
const bound=git('rev-parse','HEAD');results.write.push({name:'scratch commit adding only review records and the enabling records',commit:bound,files:git('diff','--name-only',head0,bound).split('\n')});save();
{const r=verify('--write','1','--commit',bound);results.write.push({name:'--write 1 over the scratch commit (runs the joint suite with the four boundaries on by default)',expectRefuse:false,exit:r.exit,ms:r.ms,asExpected:r.exit===0,out:r.out});save();}
const recFile='CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json';
if(fs.existsSync(path.join(ROOT,recFile))){
 const rec=JSON.parse(fs.readFileSync(path.join(ROOT,recFile),'utf8'));
 results.write.push({name:'record written',revision:rec.revision,commit:rec.commit,fileCount:rec.fileCount,filesDigest:rec.filesDigest,amendment:{newSha256:rec.amendment.newSha256,diffSha256:rec.amendment.diff.sha256,rulesAlone:rec.amendment.rulesAlone,linesAdded:rec.amendment.diff.linesAdded,linesRemoved:rec.amendment.diff.linesRemoved},suite:{joint:rec.suite.joint,own:rec.suite.own},boundaries:rec.extension.boundaries,extensionSha:rec.extension.sha256,pinned:rec.extension.pinned});save();
 {const r=verify('--check','1');results.check.push({name:'--check 1 before the record is committed (QRE-STR-B-02; the header now says write, commit, check)',expectRefuse:true,exit:r.exit,asExpected:r.exit!==0,out:r.out});save();}
 git('add','--',recFile);git('commit','-q','-m','TEST-ONLY freeze record');
 kase('check','--check 1 after the record is committed',false,()=>[],{args:['--check','1']});
 kase('check','one enabling record withdrawn (committed)',true,()=>{edit(REC,s=>{const r=JSON.parse(s);r.records=r.records.slice(1);return JSON.stringify(r,null,1)+'\n';});return [REC];},{commit:true,args:['--check','1']});
 kase('check','amended file one byte (working tree)',true,()=>{edit(R7B,s=>s.replace('no asking slot, whatever','no asking slots, whatever'));return [];},{args:['--check','1']});
 kase('check','a later review file added under the candidate folder (committed)',true,()=>addFile('audits/v1-strength-corrections-2026-11-16/candidate/LATER.md','later\n'),{commit:true,args:['--check','1']});
 kase('check','untracked file in src',true,()=>addFile('CoachingCore/src/evil.mjs','export const x=1;\n'),{args:['--check','1']});
 kase('check','values file changed (committed)',true,()=>{edit('CoachingCore/v1/STRENGTH_EXTENSION_V1.json',s=>s.replace('"timeDose": null','"timeDose": 30'));return ['CoachingCore/v1/STRENGTH_EXTENSION_V1.json'];},{commit:true,args:['--check','1']});
 kase('check','earlier record V1RFC: a field added (committed)',true,()=>{edit('CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json',s=>s.replace('"revision"','"tampered": true,\n "revision"'));return ['CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json'];},{commit:true,args:['--check','1']});
 {const r=verify('--write','1','--commit',bound);results.write.push({name:'--write 1 again (a record is never rewritten)',expectRefuse:true,exit:r.exit,asExpected:r.exit!==0,out:r.out});save();}
}
save();console.log(JSON.stringify({preserved:results.preserved.map(x=>[x.name,x.exit,x.asExpected]),write:results.write.map(x=>[x.name,x.exit,x.asExpected]),check:results.check.map(x=>[x.name,x.exit,x.asExpected])},null,1));
