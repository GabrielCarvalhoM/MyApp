// QE independent mutation spot-check on an ISOLATED COPY of the frozen bytes (git archive 1890f66 CoachingCore + the B0 review records, with
// node_modules copied). Never run against the repository: the first argument must be the copy's CoachingCore root, and the script refuses the worktree.
// usage: node qe-mutation.mjs <copy>/CoachingCore
// Each mutant edits one source file in the copy, runs the R7-C directed tests and the R7-B.2 clinical-precedence tests, records the result and
// restores the file byte for byte.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const root=path.resolve(process.argv[2]??'');
if(!root||!fs.existsSync(path.join(root,'src/r6-adaptation.mjs'))||/worktrees[\\/]domain-coaching-r7-c[\\/]CoachingCore$/.test(root))throw new Error('give the isolated copy root, never the worktree');
const TESTS=['test/r7c-longitudinal.test.mjs','test/r7c-phase4.test.mjs','test/r7c-phase5.test.mjs','test/r7b2-clinical-precedence.test.mjs'];
const MUTANTS=[
 {id:'QM-1',file:'src/r6-adaptation.mjs',what:'reproduces SD-M1: an answer is never re-planned (gapAnsweredBy ignored); the question just clears',
  from:'const moved=viewMovedBy(ctx),answered=!moved&&gapAnsweredBy(ctx);if(!moved&&!answered)return null;',to:'const moved=viewMovedBy(ctx),answered=false;if(!moved)return null;'},
 {id:'QM-2',file:'src/r6-adaptation.mjs',what:'new: the held signal is replayed in any week (heldSignal ignores its weekIndex)',
  from:"Object.hasOwn(REACTIVE,s.kind??'')&&s.weekIndex===w?s:null;}",to:"Object.hasOwn(REACTIVE,s.kind??'')?s:null;}"},
 {id:'QM-3',file:'src/r6-adaptation.mjs',what:'candidate fix for QE-R7C-03 (not a mutant): the held signal also travels when a change is kept beside the question (carried)',
  from:"if(pending&&pendingStatus&&!clinicalSticky&&result.status!=='CLINICAL_HUMAN_REQUIRED'){",to:"if(pending&&(pendingStatus||carried)&&!clinicalSticky&&result.status!=='CLINICAL_HUMAN_REQUIRED'){"},
 {id:'QM-4',file:'src/r6-adaptation.mjs',what:'new: the gap guard ignores plansNoRunDose (every change beside the question becomes the question)',
  from:"if(!unreported&&d.proposal&&plansNoRunDose(ctx,d.proposal))return",to:"if(false&&!unreported&&d.proposal&&plansNoRunDose(ctx,d.proposal))return"}
];
const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:root,encoding:'utf8',maxBuffer:1<<28,timeout:900000});const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failing:[...r.stdout.matchAll(/^\s*✖ (.+?) \(\d/gm)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i).slice(0,8)};};
const before=Object.fromEntries([...new Set(MUTANTS.map(m=>m.file))].map(f=>[f,sha(path.join(root,f))]));
const out={probe:'QE mutation spot-check',root,tests:TESTS,sourceSha256Before:before,baseline:run(),mutants:[]};
for(const m of MUTANTS){
 const f=path.join(root,m.file),orig=fs.readFileSync(f);const src=orig.toString('utf8');
 if(src.split(m.from).length!==2){out.mutants.push({id:m.id,what:m.what,result:'INVALID (anchor not unique)'});continue;}
 fs.writeFileSync(f,src.replace(m.from,m.to));
 try{const r=run();out.mutants.push({id:m.id,what:m.what,result:r.fail>0?'KILLED':'SURVIVED',...r});}
 finally{fs.writeFileSync(f,orig);}
}
out.sourceSha256After=Object.fromEntries(Object.keys(before).map(f=>[f,sha(path.join(root,f))]));
out.restored=Object.keys(before).every(f=>before[f]===out.sourceSha256After[f]);
console.log(JSON.stringify(out,null,1));
