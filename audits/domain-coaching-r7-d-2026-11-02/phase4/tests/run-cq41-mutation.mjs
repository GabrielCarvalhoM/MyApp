// R7-D Phase 4, CQ4-1 evidence: runs r7d-phase4-cq41.test.mjs on the R7D-FREEZE-5 bytes (this worktree) and on lean mutant copies of them built by
// the Phase 3.5 quality recheck's own probe (phase35/reviews/engineering/probes2/qre3-p35-mutation.mjs --build-only, read and run unchanged, into a
// NEW scratch directory). Expected: every test passes on the frozen bytes; QF3 fails only T39, QF7 only T40, QF6 only T41; QF0 (the cycle's fix
// reverted) fails all three. Writes one JSON file; never writes inside CoachingCore; no deletion.
//   node run-cq41-mutation.mjs --mutants <dir holding QF0, QF3, QF6, QF7> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {MUTANTS} from '../../phase35/reviews/engineering/probes2/qre3-p35-mutants.mjs';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const mutants=arg('--mutants'),outFile=arg('--out');if(!mutants||!outFile)throw Error('--mutants <dir> --out <file>');
const HERE=import.meta.dirname,REPO=path.resolve(HERE,'../../../..'),TEST=path.join(HERE,'r7d-phase4-cq41.test.mjs'),F='CoachingCore/src/r6-adaptation.mjs';
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rec=JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json'),'utf8'));
const run=root=>{const r=spawnSync(process.execPath,['--test',TEST],{cwd:REPO,encoding:'utf8',env:{...process.env,R7D_P4_ROOT:root},maxBuffer:1<<26,timeout:600000});
 const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN),failed=[...new Set([...r.stdout.matchAll(/^✖ (R7-D Phase 4 T\d+)/gm)].map(m=>m[1]))];
 return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed};};
const EXPECT={QF3:['R7-D Phase 4 T39'],QF7:['R7-D Phase 4 T40'],QF6:['R7-D Phase 4 T41'],QF0:['R7-D Phase 4 T39','R7-D Phase 4 T40','R7-D Phase 4 T41']};
const frozen={root:'this worktree (R7D-FREEZE-5)',sourceSha256:sha(path.join(REPO,F)),boundSha256:rec.files[F],...run(REPO)};
const rows=Object.entries(EXPECT).map(([id,exp])=>{const m=MUTANTS.find(x=>x.id===id),root=path.join(mutants,id),r=run(root);
 return {id,what:m?.what??null,mutatedSha256:sha(path.join(root,F)),...r,expectedFailing:exp,killedAsExpected:JSON.stringify([...r.failed].sort())===JSON.stringify([...exp].sort())};});
const result=frozen.sourceSha256===frozen.boundSha256&&frozen.fail===0&&frozen.pass===3&&rows.every(r=>r.killedAsExpected)?'PASS':'FAIL';
const out={evidence:'R7D-PHASE4-CQ41-MUTATION',condition:'CQ4-1 (QRE-R7D-PHASE35-CHECK-r2; QRE3-P35-01)',test:{path:path.relative(REPO,TEST).split(path.sep).join('/'),sha256:sha(TEST)},
 mutantsFrom:'phase35/reviews/engineering/probes2/qre3-p35-mutants.mjs (exact text edits of the bounded cycle line; built with qre3-p35-mutation.mjs --build-only)',frozen,mutants:rows,result,ran:new Date().toISOString(),node:process.version};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({result,frozen:`${frozen.pass}/${frozen.tests}`,mutants:rows.map(r=>`${r.id}:${r.failed.join('+')||'none'}:${r.killedAsExpected}`)}));
