// QRE V1STR R1: rehearsal of scripts/v1str-freeze.mjs --preserved against trees it should refuse. SCRATCH CLONE ONLY (argv[2] = clone root).
// Each case edits the clone, runs the verifier, records the exit code and the output, and restores the files with `git checkout`/`git reset`
// on that scratch clone (no recursive deletion; added files are removed one by one with fs.unlinkSync).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const ROOT=process.argv[2];if(!ROOT||!/scratchpad[\\/]qre-v1str[\\/]r2-freeze$/.test(ROOT))throw new Error('scratch r2-freeze only: '+ROOT);
const CC=path.join(ROOT,'CoachingCore'),git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'}).trim(),sha=b=>createHash('sha256').update(b).digest('hex');
const verify=(...a)=>{const r=spawnSync(process.execPath,['scripts/v1str-freeze.mjs',...a],{cwd:CC,encoding:'utf8'});return {exit:r.status,out:(r.stdout+r.stderr).trim().split('\n').slice(-6).join(' | ')};};
const results=[];
const restore=added=>{for(const f of added){const p=path.join(ROOT,f);if(fs.existsSync(p))fs.unlinkSync(p);}git('checkout','--','.');};
function kase(name,expectRefuse,edit,{commit=false}={}){
 const head=git('rev-parse','HEAD'),added=edit()??[];
 if(commit){git('add','-A','--',...(added.length?added:['.']));git('commit','-q','-m','qre rehearsal: '+name);}
 const r=verify('--preserved');
 results.push({name,commit,expectRefuse,exit:r.exit,refused:r.exit!==0,asExpected:(r.exit!==0)===expectRefuse,out:r.out});
 if(commit)git('reset','-q','--hard',head);restore(added);
}
const edit=(f,fn)=>{const p=path.join(ROOT,f);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
// 0. pristine
kase('pristine tree',false,()=>[]);
// 1. an extra changed frozen file (uncommitted, then committed)
kase('extra changed frozen file src/r6-program.mjs (working tree)',true,()=>{edit('CoachingCore/src/r6-program.mjs',s=>s+'\n// x\n');});
kase('extra changed frozen file src/r6-program.mjs (committed)',true,()=>{edit('CoachingCore/src/r6-program.mjs',s=>s+'\n// x\n');return ['CoachingCore/src/r6-program.mjs'];},{commit:true});
// 2. a different byte in the amended file (a comment) and a whitespace change
kase('one byte in a comment of r7b-repertoire.mjs',true,()=>{edit('CoachingCore/src/r7b-repertoire.mjs',s=>s.replace('V1X strength rules (src/v1-strength.mjs;','V1X strength rules (src/v1-strength.mjs,'));});
kase('trailing newline added to r7b-repertoire.mjs',true,()=>{edit('CoachingCore/src/r7b-repertoire.mjs',s=>s+'\n');});
// 3. a changed earlier record: (a) a non-file field; (b) a runtime-read file it binds outside CoachingCore, with the record's hash updated to match
kase('earlier record V1RFC: a note field changed',true,()=>{edit('CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json',s=>s.replace('"revision"','"tampered": true,\n "revision"'));});
const RFC_RECORDS='audits/v1-run-extensions-2026-11-13/phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json';
kase('earlier record V1RFC + the SSCTR run-records file it binds (runtime-read), hash updated in the record',true,()=>{
 edit(RFC_RECORDS,s=>s.replace(/"disposition":\s*"APPROVE_WITH_CONDITIONS"/,'"disposition": "APPROVE"'));
 const h=sha(fs.readFileSync(path.join(ROOT,RFC_RECORDS)));
 edit('CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json',s=>{const r=JSON.parse(s);r.files[RFC_RECORDS]=h;return JSON.stringify(r,null,1)+'\n';});
});
kase('the same, committed',true,()=>{
 edit(RFC_RECORDS,s=>s.replace(/"disposition":\s*"APPROVE_WITH_CONDITIONS"/,'"disposition": "APPROVE"'));
 const h=sha(fs.readFileSync(path.join(ROOT,RFC_RECORDS)));
 edit('CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json',s=>{const r=JSON.parse(s);r.files[RFC_RECORDS]=h;return JSON.stringify(r,null,1)+'\n';});
 return [RFC_RECORDS,'CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json'];
},{commit:true});
kase('a runtime-read SSCTR record file bound by no earlier record changed: audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json',true,()=>{edit('audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json',s=>s+' ');});
// 4. added files outside the declared paths
const addFile=(f,body)=>{fs.writeFileSync(path.join(ROOT,f),body);return [f];};
kase('added untracked file CoachingCore/src/evil.mjs',true,()=>addFile('CoachingCore/src/evil.mjs','export const x=1;\n'));
kase('added committed file CoachingCore/src/evil.mjs',true,()=>addFile('CoachingCore/src/evil.mjs','export const x=1;\n'),{commit:true});
kase('added committed file CoachingCore/r5/evil.json',true,()=>addFile('CoachingCore/r5/evil.json','{}\n'),{commit:true});
kase('changed runtime-read policy CoachingCore/r5/PROGRAM_POLICY_R5.json (committed)',true,()=>{edit('CoachingCore/r5/PROGRAM_POLICY_R5.json',s=>s+' ');return ['CoachingCore/r5/PROGRAM_POLICY_R5.json'];},{commit:true});
kase('changed runtime-read CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json (committed)',true,()=>{edit('CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json',s=>s+' ');return ['CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json'];},{commit:true});
kase('added committed test file CoachingCore/test/v1str-evil.test.mjs (matches the own-test pattern)',true,()=>addFile('CoachingCore/test/v1str-evil.test.mjs','import test from "node:test";test("x",()=>{});\n'),{commit:true});
kase('changed values file v1/STRENGTH_EXTENSION_V1.json (committed)',true,()=>{edit('CoachingCore/v1/STRENGTH_EXTENSION_V1.json',s=>s.replace('"timeDose": null','"timeDose": 30'));return ['CoachingCore/v1/STRENGTH_EXTENSION_V1.json'];},{commit:true});
console.log(JSON.stringify(results,null,1));
fs.writeFileSync(process.argv[3]??path.join(ROOT,'..','freeze-rehearsal.json'),JSON.stringify(results,null,1));
