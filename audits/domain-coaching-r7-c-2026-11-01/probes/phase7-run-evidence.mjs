// R7-C Phase 7 (QE-R7C-10): runs the read-only evidence the Phase 7 request names on this worktree's committed runtime and writes each output
// under probes/out with the label R7C-P7-<short HEAD> (the b2-copy clinical probes write under probes/b2-copy/out themselves), then a manifest of
// commands, exit codes and output SHA-256 (probes/out/evidence.<label>.json). The set:
// - recorder independence: the Engineering recheck's original grid (rc-p4, 160 cells), the Engineering's shortened-answer grid (p6-x5, 280 cells)
//   and its trajectories (p6-x1, 1,536), the SSCTR's mixed-answer scope grid (p6-mixed-scope, 768 cells: P6-F01) and its CC2 grid (1,200 cells);
// - the differential against R7C-FREEZE-3 (phase7-differential);
// - the Engineering's Phase 6 reach, late-reporter, direct-refire and history probes (p6-x2, p6-x4, p6-x7, p6-x6) with R7C-FREEZE-3's bytes as
//   the old runtime (its label starts with F2) and this worktree as the new one (F3): QE-R7C-11 and QE-R7C-12 as they now stand;
// - as in Phase 6: the SD grid and SD-01 check, G01, G02, the holdout (D1, H19), the clinical probes, the R7-B, R7-B.1 and R7-B.2 conformance
//   checks, the R7-A/B differentials against R7B2-FREEZE-1, and the full suite.
// Refuses to run when CoachingCore/src or CoachingCore/test differ from HEAD. Nothing else is written; R7C-FREEZE-3's bytes are extracted with
// git archive into a temporary directory (removed after). Usage: node audits/domain-coaching-r7-c-2026-11-01/probes/phase7-run-evidence.mjs
// [--only name,name]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {extract} from './phase3-lib.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url)),WT=path.resolve(HERE,'../../..'),CORE=path.join(WT,'CoachingCore'),OUT=path.join(HERE,'out');
const git=(...a)=>spawnSync('git',a,{cwd:WT,encoding:'utf8'});
if(git('diff','--quiet','HEAD','--','CoachingCore/src','CoachingCore/test').status!==0)throw Error('CoachingCore/src or test differs from HEAD: commit first');
const head=git('rev-parse','HEAD').stdout.trim(),label='R7C-P7-'+head.slice(0,7),B2='1a1c7286adc8b08d16f97dea86f4973fe33e5a95',F3='08c6db352d102e2b33ed7e834cff980248b90299';
const only=(()=>{const i=process.argv.indexOf('--only');return i>=0?new Set(process.argv[i+1].split(',')):null;})();
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const slash=p=>p.split(path.sep).join('/');
const f3=extract(F3),OLD=`F2-is-R7C-FREEZE-3=${slash(f3.root)}`,NEW=`F3-is-R7C-P7=${slash(WT)}`;
const P='audits/domain-coaching-r7-c-2026-11-01/probes',E='audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes',S='audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/probes';
const JOBS=[
 ['recorder-independence',[`${E}/recheck/rc-p4-recorder-independence.mjs`]],
 ['recorder-independence-shortened',[`${E}/phase6/p6-x5-short-answer.mjs`],{QE_ROOTS:`F4=${slash(WT)}`}],
 ['recorder-independence-trajectories',[`${E}/phase6/p6-x1-trajectory-independence.mjs`],{QE_ROOTS:`F4=${slash(WT)}`}],
 ['ssctr-mixed-scope',[`${S}/phase6/p6-mixed-scope.mjs`]],
 ['ssctr-cc2',[`${S}/cc/cc2-answer-after-refusal.mjs`]],
 ['phase7-differential-vs-R7C-FREEZE-3',[`${P}/phase7-differential.mjs`]],
 ['reach-vs-R7C-FREEZE-3',[`${E}/phase6/p6-x2-reach.mjs`],{QE_ROOTS:`${OLD};${NEW}`}],
 ['late-reporter-vs-R7C-FREEZE-3',[`${E}/phase6/p6-x4-late-reporter.mjs`],{QE_ROOTS:`${OLD};${NEW}`}],
 ['direct-refire-vs-R7C-FREEZE-3',[`${E}/phase6/p6-x7-direct-refire.mjs`],{QE_ROOTS:`${OLD};${NEW}`}],
 ['history',[`${E}/phase6/p6-x6-history.mjs`],{QE_ROOTS:NEW}],
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
const manifest={check:'R7C-P7-EVIDENCE',head,label,node:process.version,started:new Date().toISOString(),runtimes:{old:{label:'F2-is-R7C-FREEZE-3',commit:F3,root:'git archive (temporary)'},new:{label:'F3-is-R7C-P7 / F4 / F2 / HEAD (each probe\'s own name for this worktree)',commit:head}},jobs:[]};
try{
 for(const [name,args,env={}] of JOBS){
  if(only&&!only.has(name))continue;
  const t0=Date.now(),r=spawnSync(process.execPath,args,{cwd:WT,encoding:'utf8',maxBuffer:1<<28,timeout:3600000,env:{...process.env,...env}}),file=path.join(OUT,`${name}.${label}.json`);
  fs.writeFileSync(file,r.stdout);
  manifest.jobs.push({name,command:'node '+args.join(' ')+(env.QE_ROOTS?' (QE_ROOTS: '+env.QE_ROOTS.split(';').map(x=>x.split('=')[0]).join(', ')+')':''),exit:r.status,ms:Date.now()-t0,output:path.relative(WT,file).replaceAll('\\','/'),sha256:sha(file),stderr:(r.stderr??'').slice(0,400)||null});
  console.log(name,r.status,Date.now()-t0+'ms');
 }
 // The R7-B.2 clinical probes (copied verbatim in Phase 3): they write their own outputs, labelled, under probes/b2-copy/out.
 for(const [name,args,env] of [['k6-stale-return-clinical',[`${P}/b2-copy/k6-stale-return-clinical.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}],['k6b-stale-return-two-step',[`${P}/b2-copy/k6b-stale-return-two-step.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}],['b2-inventory',[`${P}/b2-copy/b2-inventory.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}],['adversarial',[`${P}/b2-copy/adversarial-r7b1.mjs`],{PROBE_ROOT:WT,PROBE_LABEL:label}]]){
  if(only&&!only.has(name))continue;
  const t0=Date.now(),r=spawnSync(process.execPath,args,{cwd:WT,encoding:'utf8',maxBuffer:1<<28,timeout:1800000,env:{...process.env,...env}}),file=path.join(HERE,'b2-copy/out',`${name}-${label}.json`);
  manifest.jobs.push({name:'b2-copy/'+name,command:'node '+args.join(' ')+' (PROBE_ROOT, PROBE_LABEL)',exit:r.status,ms:Date.now()-t0,output:fs.existsSync(file)?path.relative(WT,file).replaceAll('\\','/'):null,sha256:fs.existsSync(file)?sha(file):null,stdout:(r.stdout??'').slice(0,300)||null,stderr:(r.stderr??'').slice(0,400)||null});
  console.log('b2-copy/'+name,r.status,Date.now()-t0+'ms');
 }
 // The full suite, in CoachingCore.
 if(!only||only.has('full-suite')){
  const t0=Date.now(),r=spawnSync(process.execPath,['--test'],{cwd:CORE,encoding:'utf8',maxBuffer:1<<28,timeout:1800000}),n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))??[])[1]??NaN);
  const tail=r.stdout.split('✖ failing tests:')[1]??'',failures=[...tail.matchAll(/✖ (.+?) \(\d/g)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i).map(title=>({title,first:(tail.split(title)[1]??'').split('\n').find(l=>/Error/.test(l))?.trim()??null}));
  const file=path.join(OUT,`full-suite.${label}.json`);
  fs.writeFileSync(file,JSON.stringify({check:'R7C-P7-FULL-SUITE',command:'node --test (in CoachingCore)',node:process.version,commit:head,srcAndTestClean:true,durationMs:Date.now()-t0,tests:n('tests'),pass:n('pass'),fail:n('fail'),cancelled:n('cancelled'),skipped:n('skipped'),todo:n('todo'),failures},null,1)+'\n');
  manifest.jobs.push({name:'full-suite',command:'node --test (in CoachingCore)',exit:r.status,ms:Date.now()-t0,output:path.relative(WT,file).replaceAll('\\','/'),sha256:sha(file)});
  console.log('full-suite',n('tests'),n('pass'),n('fail'));
 }
}finally{f3.cleanup();}
manifest.ended=new Date().toISOString();
fs.writeFileSync(path.join(OUT,`evidence.${label}${only?'.partial':''}.json`),JSON.stringify(manifest,null,1)+'\n');
