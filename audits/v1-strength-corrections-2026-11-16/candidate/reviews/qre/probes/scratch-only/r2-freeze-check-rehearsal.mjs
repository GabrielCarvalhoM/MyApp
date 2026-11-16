// QRE V1STR R1: rehearsal of scripts/v1str-freeze.mjs --check 1 against a scratch freeze written over TEST-ONLY records. SCRATCH CLONE ONLY.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
const ROOT=process.argv[2];if(!ROOT||!/scratchpad[\\/]qre-v1str[\\/]r2-freeze$/.test(ROOT))throw new Error('scratch r2-freeze only: '+ROOT);
const CC=path.join(ROOT,'CoachingCore'),git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'}).trim();
const check=()=>{const r=spawnSync(process.execPath,['scripts/v1str-freeze.mjs','--check','1'],{cwd:CC,encoding:'utf8'});return {exit:r.status,out:(r.stdout+r.stderr).trim().split('\n').slice(0,6).join(' | ')};};
const results=[];
const edit=(f,fn)=>{const p=path.join(ROOT,f);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
function kase(name,expectRefuse,doIt,{commit=false}={}){
 const head=git('rev-parse','HEAD'),added=doIt()??[];
 if(commit){git('add','-A','--',...added);git('commit','-q','-m','qre check rehearsal: '+name);}
 const r=check();results.push({name,commit,expectRefuse,exit:r.exit,asExpected:(r.exit!==0)===expectRefuse,out:r.out});
 if(commit)git('reset','-q','--hard',head);
 for(const f of added){const p=path.join(ROOT,f);if(fs.existsSync(p)&&!git('ls-files','--',f))fs.unlinkSync(p);}
 git('checkout','--','.');
}
const REC='audits/v1-strength-corrections-2026-11-16/candidate/reviews/ssctr/SSCTR_V1STR_RECORDS.json';
kase('pristine (freeze record committed)',false,()=>[]);
kase('one enabling record withdrawn (committed)',true,()=>{edit(REC,s=>{const r=JSON.parse(s);r.records=r.records.slice(1);return JSON.stringify(r,null,1)+'\n';});return [REC];},{commit:true});
kase('earlier record V1RFC: a note field changed (committed)',true,()=>{edit('CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json',s=>s.replace('"revision"','"tampered": true,\n "revision"'));return ['CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json'];},{commit:true});
kase('a later review file added under the candidate folder (committed)',true,()=>{fs.writeFileSync(path.join(ROOT,'audits/v1-strength-corrections-2026-11-16/candidate/CLOSURE.md'),'closure\n');return ['audits/v1-strength-corrections-2026-11-16/candidate/CLOSURE.md'];},{commit:true});
kase('untracked file in src',true,()=>{fs.writeFileSync(path.join(ROOT,'CoachingCore/src/evil.mjs'),'export const x=1;\n');return ['CoachingCore/src/evil.mjs'];});
kase('runtime-read r5 policy changed (committed)',true,()=>{edit('CoachingCore/r5/PROGRAM_POLICY_R5.json',s=>s+' ');return ['CoachingCore/r5/PROGRAM_POLICY_R5.json'];},{commit:true});
kase('amended file one byte (working tree)',true,()=>{edit('CoachingCore/src/r7b-repertoire.mjs',s=>s.replace('V1X strength rules (src/v1-strength.mjs;','V1X strength rules (src/v1-strength.mjs,'));return [];});
console.log(JSON.stringify(results,null,1));
fs.writeFileSync(process.argv[3],JSON.stringify(results,null,1));
