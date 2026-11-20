// Safety Continuity: the mutants of this line's runtime (v1-f08.mjs and r6-provenance.mjs), each applied to its own copy in a new scratch extract
// of HEAD, and the focal and successor files run against it. Usage: node mutate-sc.mjs <existing scratch parent>. Read-only for the
// repository; no deletion anywhere (the mutated file is rewritten with its original bytes after each mutant).
import fs from 'node:fs';import path from 'node:path';import {execFileSync,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(here,'..','..','..'),CC=path.join(ROOT,'CoachingCore'),parent=process.argv[2];
if(!parent||!fs.existsSync(parent))throw new Error('usage: node mutate-sc.mjs <existing scratch parent>');
const F08='src/v1-f08.mjs',PROV='src/r6-provenance.mjs';
const MUTANTS={
 'S1 SB-1 ignores stops (FREEZE-6)':[F08,"rows.some(o=>(voiced(o)||stopOnRecord(o))&&","rows.some(o=>voiced(o)&&"],
 'S2 stops read only in force':[F08,"const stopOnRecord=o=>!!o&&!o.fact&&voices(o).some(stopped);","const stopOnRecord=o=>!!o&&!o.fact&&o.superseded!==true&&voices(o).some(stopped);"],
 'S3 stops read only from the row, not its voices':[F08,"const stopOnRecord=o=>!!o&&!o.fact&&voices(o).some(stopped);","const stopOnRecord=o=>!!o&&!o.fact&&stopped(o.actual);"],
 'S4 a stop needs a stated reason':[F08,"const stopped=a=>isObj(a)&&a.stop!==undefined&&a.stop!==null&&a.stop!==false;","const stopped=a=>isObj(a)&&isObj(a.stop)&&typeof a.stop.reason==='string';"],
 'S5 a stop counts only with minutes':[F08,"const stopped=a=>isObj(a)&&a.stop!==undefined&&a.stop!==null&&a.stop!==false;","const stopped=a=>isObj(a)&&a.stop!==undefined&&a.stop!==null&&a.stop!==false&&Number(a.minutes)>0;"],
 'O1 occurrence for corrections in conflict only (FREEZE-6)':[F08,"VOICED_DISPUTES.includes(o.provenance?.conflict)","o.provenance?.conflict==='CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE'"],
 'O2 occurrence for any flag':[F08,"VOICED_DISPUTES.includes(o.provenance?.conflict)","true"],
 'O3 occurrence when any voice says done':[F08,"Object.keys(o.provenance.parts).length>1&&voices(o).every(a=>wellFormed(a)&&did(a));\n","Object.keys(o.provenance.parts).length>1&&voices(o).some(a=>wellFormed(a)&&did(a));\n"],
 'O4 occurrence counted as executed (amount credited)':[F08,"const executed=o=>o&&!o.fact&&!o.conflicted&&o.superseded!==true&&did(o.actual);","const executed=o=>o&&!o.fact&&(!o.conflicted||o.provenance?.conflict==='CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS')&&o.superseded!==true&&did(o.actual);"],
 'Q1 heldBefore reads any quarantine (FREEZE-6)':[PROV,"const heldBefore=disputedHere();","const heldBefore=quarantined.has(identity);"],
 'Q2 quarantine refusal reads any quarantine (FREEZE-6)':[PROV,"if(!admit&&disputedHere()&&o.conflicted!==true){","if(!admit&&quarantined.has(identity)&&o.conflicted!==true){"],
 'L1 no voice limit (FREEZE-6)':[PROV,"if(kept.length>=VOICE_LIMIT&&!(stops(o)&&!kept.some(stops)))return;",""],
 'L2 the limit without the stop exception':[PROV,"if(kept.length>=VOICE_LIMIT&&!(stops(o)&&!kept.some(stops)))return;","if(kept.length>=VOICE_LIMIT)return;"],
 'L3 the stop exception unbounded':[PROV,"if(kept.length>=VOICE_LIMIT&&!(stops(o)&&!kept.some(stops)))return;","if(kept.length>=VOICE_LIMIT&&!stops(o))return;"],
};
const FILES=['v1core-sc-safety-continuity.test.mjs','v1core-sc-successors.test.mjs'];
const dir=fs.mkdtempSync(path.join(parent,'sc-mutants-')),tar=path.join(dir,'tree.tar');
// HEAD's CoachingCore, the harness the engine tests reach through test/v1core-helpers.mjs, and the authority records the runtime loads
const tracked=new Set(execFileSync('git',['ls-files','audits'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).split('\n'));
const named=execFileSync('git',['grep','-h','-o','-E',"audits/[A-Za-z0-9._/-]+",'HEAD','--','CoachingCore/src','CoachingCore/test'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).split('\n').map(s=>s.replace(/^HEAD:/,''));
const dirs=new Set([...tracked].flatMap(f=>f.split('/').slice(1).map((_,i,a)=>f.split('/').slice(0,i+1).join('/'))));
const auth=[...new Set(named.map(p=>p.replace(/[/.]+$/,'')))].filter(p=>p&&(tracked.has(p)||dirs.has(p)));
execFileSync('git',['archive','-o',tar,'HEAD','CoachingCore','audits/v1-app-integration-foundation-2026-11-16/harness',...new Set(auth)],{cwd:ROOT});execFileSync('tar',['-xf','tree.tar'],{cwd:dir});
const X=path.join(dir,'CoachingCore');fs.cpSync(path.join(CC,'node_modules'),path.join(X,'node_modules'),{recursive:true});
const run=()=>{const env={...process.env};delete env.NODE_TEST_CONTEXT;const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...FILES.map(f=>'test/'+f)],{cwd:X,encoding:'utf8',env});
 return {pass:Number(/# pass (\d+)/.exec(r.stdout)?.[1]),fail:Number(/# fail (\d+)/.exec(r.stdout)?.[1]),failing:[...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map(m=>m[1].slice(0,70))};};
const orig=Object.fromEntries([F08,PROV].map(f=>[f,fs.readFileSync(path.join(X,f),'utf8')]));
const control=run();console.log('control',JSON.stringify(control));
let survived=0;
for(const [name,[file,a,b]] of Object.entries(MUTANTS)){const src=orig[file];if(src.split(a).length!==2)throw new Error(name+': the mutated text, once');
 fs.writeFileSync(path.join(X,file),src.replace(a,b));const r=run();fs.writeFileSync(path.join(X,file),src);
 if(!r.fail)survived++;console.log((r.fail?'KILLED  ':'SURVIVED')+' '+name+': '+r.fail+' failing'+(r.fail?' ('+r.failing.slice(0,4).join(' | ')+')':''));}
console.log(`${Object.keys(MUTANTS).length-survived}/${Object.keys(MUTANTS).length} killed by the focal and successor files; control ${control.pass}/${control.pass+control.fail}`);
process.exitCode=survived||control.fail?1:0;
