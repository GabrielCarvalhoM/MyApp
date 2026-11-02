// R7-C Phase 6 (QE-R7C-07): runs the read-only evidence the Phase 6 request names on this worktree's committed runtime and writes each output
// under probes/out with the label R7C-P6-<short HEAD> (the b2-copy clinical probes write under probes/b2-copy/out themselves), then a manifest of
// commands, exit codes and output SHA-256 (probes/out/evidence.<label>.json). The set, and only it: the Engineering recorder-independence grid
// (rc-p4, 160 cells), the SD grid and SD-01 check, G01, G02, the clinical probes, the R7-B, R7-B.1 and R7-B.2 conformance checks, the R7-A/B
// differentials against R7B2-FREEZE-1, the differential against R7C-FREEZE-2 (phase6-differential), the holdout (D1, H19) and the full suite.
// The SSCTR's own SD probes are not re-run (not requested). Refuses to run when CoachingCore/src or CoachingCore/test differ from HEAD. Nothing
// else is written. Usage: node audits/domain-coaching-r7-c-2026-11-01/probes/phase6-run-evidence.mjs [--only name,name]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),WT=path.resolve(HERE,'../../..'),CORE=path.join(WT,'CoachingCore'),OUT=path.join(HERE,'out');
const git=(...a)=>spawnSync('git',a,{cwd:WT,encoding:'utf8'});
if(git('diff','--quiet','HEAD','--','CoachingCore/src','CoachingCore/test').status!==0)throw Error('CoachingCore/src or test differs from HEAD: commit first');
const head=git('rev-parse','HEAD').stdout.trim(),label='R7C-P6-'+head.slice(0,7),B2='1a1c7286adc8b08d16f97dea86f4973fe33e5a95';
const only=(()=>{const i=process.argv.indexOf('--only');return i>=0?new Set(process.argv[i+1].split(',')):null;})();
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const P='audits/domain-coaching-r7-c-2026-11-01/probes',E='audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/recheck';
const JOBS=[
 ['recorder-independence',[`${E}/rc-p4-recorder-independence.mjs`]],
 ['phase6-differential-vs-R7C-FREEZE-2',[`${P}/phase6-differential.mjs`]],
 ['adversarial-sd',[`${P}/phase5-adversarial-sd.mjs`]],
 ['verify-sd01',[`${P}/phase4-verify-sd01.mjs`]],
 ['adversarial-g01',[`${P}/phase4-adversarial-g01.mjs`]],
 ['adversarial-g02',[`${P}/phase3-adversarial-g02.mjs`]],
 ['holdout',[`${P}/phase3-holdout.mjs`]],
 ['conformance-r7b',['CoachingCore/scripts/conformance-r7b.mjs']],
 ['conformance-r7b1',['CoachingCore/scripts/conformance-r7b1.mjs']],
 ['conformance-r7b2',['CoachingCore/scripts/conformance-r7b2.mjs']],
 ['neighbors-r7b2-vs-R7B2-FREEZE-1',['CoachingCore/scripts/neighbors-r7b2.mjs','--base',B2]],
 ['differential-regress-r7b2-vs-R7B2-FREEZE-1',['CoachingCore/scripts/regress-r7b2.mjs','--base',B2]]
];
const manifest={check:'R7C-P6-EVIDENCE',head,label,node:process.version,started:new Date().toISOString(),jobs:[]};
for(const [name,args] of JOBS){
 if(only&&!only.has(name))continue;
 const t0=Date.now(),r=spawnSync(process.execPath,args,{cwd:WT,encoding:'utf8',maxBuffer:1<<28,timeout:1800000}),file=path.join(OUT,`${name}.${label}.json`);
 fs.writeFileSync(file,r.stdout);
 manifest.jobs.push({name,command:'node '+args.join(' '),exit:r.status,ms:Date.now()-t0,output:path.relative(WT,file).replaceAll('\\','/'),sha256:sha(file),stderr:(r.stderr??'').slice(0,400)||null});
 console.log(name,r.status,Date.now()-t0+'ms');
}
// The R7-B.2 clinical probes (copied verbatim in Phase 3): they write their own outputs, labelled, under probes/b2-copy/out.
for(const [name,args,env] of [['k6-stale-return-clinical',[`${P}/b2-copy/k6-stale-return-clinical.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}],['k6b-stale-return-two-step',[`${P}/b2-copy/k6b-stale-return-two-step.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}],['b2-inventory',[`${P}/b2-copy/b2-inventory.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}],['adversarial',[`${P}/b2-copy/adversarial-r7b1.mjs`,WT,label],{}]]){
 if(only&&!only.has(name))continue;
 const t0=Date.now(),r=spawnSync(process.execPath,args,{cwd:WT,encoding:'utf8',maxBuffer:1<<28,timeout:1800000,env:{...process.env,...env}}),file=path.join(HERE,'b2-copy/out',`${name}-${label}.json`);
 manifest.jobs.push({name:'b2-copy/'+name,command:'node '+args.join(' ')+(env.PROBE_ROOT?' (PROBE_ROOT, PROBE_LABEL)':''),exit:r.status,ms:Date.now()-t0,output:fs.existsSync(file)?path.relative(WT,file).replaceAll('\\','/'):null,sha256:fs.existsSync(file)?sha(file):null,stdout:(r.stdout??'').slice(0,400),stderr:(r.stderr??'').slice(0,400)||null});
 console.log('b2-copy/'+name,r.status,Date.now()-t0+'ms');
}
// The full suite, in CoachingCore.
if(!only||only.has('full-suite')){
 const t0=Date.now(),r=spawnSync(process.execPath,['--test'],{cwd:CORE,encoding:'utf8',maxBuffer:1<<28,timeout:1800000}),n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))??[])[1]??NaN);
 const tail=r.stdout.split('✖ failing tests:')[1]??'',failures=[...tail.matchAll(/✖ (.+?) \(\d/g)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i).map(title=>({title,first:(tail.split(title)[1]??'').split('\n').find(l=>/Error/.test(l))?.trim()??null}));
 const file=path.join(OUT,`full-suite.${label}.json`);
 fs.writeFileSync(file,JSON.stringify({check:'R7C-P6-FULL-SUITE',command:'node --test (in CoachingCore)',node:process.version,commit:head,srcAndTestClean:true,durationMs:Date.now()-t0,tests:n('tests'),pass:n('pass'),fail:n('fail'),cancelled:n('cancelled'),skipped:n('skipped'),todo:n('todo'),failures},null,1)+'\n');
 manifest.jobs.push({name:'full-suite',command:'node --test (in CoachingCore)',exit:r.status,ms:Date.now()-t0,output:path.relative(WT,file).replaceAll('\\','/'),sha256:sha(file)});
 console.log('full-suite',n('tests'),n('pass'),n('fail'));
}
manifest.ended=new Date().toISOString();
fs.writeFileSync(path.join(OUT,`evidence.${label}${only?'.partial':''}.json`),JSON.stringify(manifest,null,1)+'\n');
