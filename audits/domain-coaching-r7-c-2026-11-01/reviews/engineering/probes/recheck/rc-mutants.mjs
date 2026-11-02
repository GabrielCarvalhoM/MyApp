// Recheck: independent re-run of the correction-cycle mutants CC-M1..M9 (fragments as committed in probes/phase5-mutation.mjs) on an ISOLATED
// copy (a git archive of a10cec0 outside the repository), with the R7-C directed test files. Each fragment must occur once; the file is restored
// after each mutant and checked by SHA-256. Usage: node rc-mutants.mjs <copy root containing CoachingCore/>. Prints JSON.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(process.argv[2]??''),repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..');
if(!process.argv[2]||root.toLowerCase().startsWith(repo.toLowerCase()))throw Error('copy root required, outside the repository');
const core=path.join(root,'CoachingCore'),AD='src/r6-adaptation.mjs',CO='src/r6-composition.mjs',sha=b=>createHash('sha256').update(b).digest('hex');
const TESTS=['test/r7c-longitudinal.test.mjs','test/r7c-phase4.test.mjs','test/r7c-phase5.test.mjs','test/r7c-phase5-cc.test.mjs'];
const M=[
 ['CC-M1',AD,"overCeiling=!moved&&!answered&&!ctx.noCeiling&&!!aboveFactsCeiling(ctx)&&!runGapInForce(ctx);","overCeiling=false;"],
 ['CC-M2',AD,"uncredited=answered||overCeiling?ctx.program","uncredited=false?ctx.program"],
 ['CC-M3',AD,"if(pending&&(pendingStatus||carried)&&!clinicalSticky","if(pending&&pendingStatus&&!clinicalSticky"],
 ['CC-M4',AD,"Object.hasOwn(REACTIVE,s.kind??'')&&s.weekIndex===w?s:null;}","Object.hasOwn(REACTIVE,s.kind??'')?s:null;}"],
 ['CC-M5',CO,"return credited.length?{ceiling,sessionIds:over.map(s=>s.id),credited:credited.map(s=>s.id)}:null;","return {ceiling,sessionIds:over.map(s=>s.id),credited:credited.map(s=>s.id)};"],
 ['CC-M6',CO,"||week.startAuthority?.RUN?.provenance===WEEK_START.RETURN_ENTRY||(ctx.base","||(ctx.base"],
 ['CC-M7',CO,"||(ctx.base??program.stateTrace[w])?.run?.mode!=='EASY')return null;",")return null;"],
 ['CC-M8',AD,"if(factual0?.origin==='CEILING'&&decision.question?.kind==='UNREPORTED_TRAINING')return","if(false&&factual0?.origin==='CEILING'&&decision.question?.kind==='UNREPORTED_TRAINING')return"],
 ['CC-M9',CO,"if(ctx.kind==='RETURN_AFTER_PAUSE'||week","if(week"]
];
const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:core,encoding:'utf8',maxBuffer:1<<28}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failing:[...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map(m=>m[1].slice(0,160))};};
const out={check:'RC-MUTANTS correction cycle',root,baseline:run(),mutants:[]};
if(out.baseline.fail!==0)throw Error('baseline fails: '+JSON.stringify(out.baseline));
for(const [id,file,from,to] of M){
 const f=path.join(core,file),orig=fs.readFileSync(f),src=orig.toString('utf8'),n=src.split(from).length-1;
 if(n!==1){out.mutants.push({id,result:'INVALID',occurrences:n});continue;}
 let r;try{fs.writeFileSync(f,src.replace(from,to));r=run();}finally{fs.writeFileSync(f,orig);}
 if(sha(fs.readFileSync(f))!==sha(orig))throw Error('restore failed: '+id);
 out.mutants.push({id,result:r.fail>0?'KILLED':'SURVIVED',...r});
}
out.summary={mutants:out.mutants.length,killed:out.mutants.filter(m=>m.result==='KILLED').length,survived:out.mutants.filter(m=>m.result==='SURVIVED').map(m=>m.id),invalid:out.mutants.filter(m=>m.result==='INVALID').map(m=>m.id)};
console.log(JSON.stringify(out,null,1));
