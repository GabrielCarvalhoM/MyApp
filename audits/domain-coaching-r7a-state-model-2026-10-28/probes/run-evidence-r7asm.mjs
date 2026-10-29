// COACHING CORE — STATE MODEL CLOSURE evidence runner: runs every probe and grid this mission relies on, binding each output to the source
// digest of the runtime it ran on (recomputed before and after each run, the same canonical digest the freeze records). Read-only with respect to
// CoachingCore/src; it writes only this folder's run outputs and EVIDENCE_RUNS_R7ASM.json. Usage: node run-evidence-r7asm.mjs
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../../../CoachingCore/src/value.mjs';
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const repo=path.resolve(here,'../../..'),cc=path.join(repo,'CoachingCore'),runs=path.join(here,'runs');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(path.join(cc,'src',f))])));
const SE='audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews',AB='audits/domain-coaching-r7a-boundary-2026-10-28/reviews',AF='audits/domain-coaching-r7a-final-2026-10-28/reviews',A1='audits/domain-coaching-r7a1-2026-10-27/reviews',A2='audits/domain-coaching-r7a2-2026-10-28/reviews';
const HERE='audits/domain-coaching-r7a-state-model-2026-10-28/probes';
// name, script (repo-relative), env
const JOBS=[
 // This mission's own evidence.
 ['r7asm-self-challenge',`${HERE}/r7asm-self-challenge.mjs`,{}],
 ['r7asm-self-challenge.PRIOR',`${HERE}/r7asm-self-challenge.mjs`,{SM_ROOT:'audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/CoachingCore'}],
 ['r7asm-t1t2',`${HERE}/t1t2-both-freezes.mjs`,{}],
 ['r7asm-t1t2.PRIOR',`${HERE}/t1t2-both-freezes.mjs`,{SM_ROOT:'audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/CoachingCore'}],
 ['r7asm-rows-h24-h29',`${HERE}/rows-h24-h29.mjs`,{}],
 ['r7asm-h29-dbrow',`${HERE}/h29-dbrow.mjs`,{}],
 // The state evidence judge's own probes (QE-R7ASE-01, QE-R7ASE-02 and their variants) on these bytes.
 ['qe-r7ase-P51d',`${SE}/qe-r7ase-P51d-identical-ledgers.mjs`,{}],
 ['qe-r7ase-P51c',`${SE}/qe-r7ase-P51c-atdose-projected-tick-unmet.mjs`,{}],
 ['qe-r7ase-P51b',`${SE}/qe-r7ase-P51b-atdose-projected-tick-dev.mjs`,{}],
 ['qe-r7ase-P50',`${SE}/qe-r7ase-P50-reestablish-projected-date.mjs`,{}],
 ['qe-r7ase-P50.tz540',`${SE}/qe-r7ase-P50-reestablish-projected-date.mjs`,{QE_TZ:'540'}],
 ['qe-r7ase-P50.tz-300',`${SE}/qe-r7ase-P50-reestablish-projected-date.mjs`,{QE_TZ:'-300'}],
 ['qe-r7ase-P52',`${SE}/qe-r7ase-P52-fresh-exercise-entryweek.mjs`,{}],
 ['qe-r7ase-I01',`${SE}/qe-r7ase-I01-sundaylong-trace.mjs`,{}],
 ['qe-r7ase-I02',`${SE}/qe-r7ase-I02-same-facts.mjs`,{}],
 ['ssctr-r7ase-tick-probe',`${SE}/ssctr-r7ase-tick-probe.mjs`,{}],
 // QE-R7AB-01's own probes (the boundary judge's P40 family) on these bytes.
 ['qe-r7ab-P40',`${AB}/qe-r7ab-P40-held-outside-return.mjs`,{}],
 ['qe-r7ab-P40.tz540',`${AB}/qe-r7ab-P40-held-outside-return.mjs`,{QE_TZ:'540'}],
 ['qe-r7ab-P40b',`${AB}/qe-r7ab-P40b-held-variants.mjs`,{}],
 ['qe-r7ab-P40c',`${AB}/qe-r7ab-P40c-moderate-ceiling.mjs`,{}],
 ['qe-r7ab-P41',`${AB}/qe-r7ab-P41-held-after-short-return.mjs`,{}],
 ['qe-r7ab-P47b',`${AB}/qe-r7ab-P47b-localfatigue-pre.mjs`,{}],
 ['qe-r7af-P30c',`${AF}/qe-r7af-P30c-reproduction.mjs`,{}],
 // The earlier blockers' probes: interruption identity and the return's point.
 ['qe-r7af-P37',`${AF}/qe-r7af-P37-explicit-names.mjs`,{}],
 ['qe-r7af-P32',`${AF}/qe-r7af-P32-late-evidence.mjs`,{}],
 ['qe-r7af-P31',`${AF}/qe-r7af-P31-identity-order-grid.mjs`,{}],
 ['qe-r7a2-P17',`${A2}/qe-r7a2-P17-late-correction-then-separate-break.mjs`,{}],
 ['qe-r7a2-P19',`${A2}/qe-r7a2-P19-identity-interleaving-grid.mjs`,{}],
 ['qe-a1-P07',`${A1}/qe-a1-P07-merge-known-definitions.mjs`,{}]
];
fs.mkdirSync(runs,{recursive:true});
const out=[];
for(const [name,script,env] of JOBS){
 const abs=path.join(repo,script);
 if(!fs.existsSync(abs)){out.push({name,script,skipped:'script not found'});continue;}
 const start=digest();
 const r=spawnSync(process.execPath,[abs],{cwd:repo,encoding:'utf8',maxBuffer:256*1024*1024,env:{...process.env,...Object.fromEntries(Object.entries(env))}});
 const end=digest(),file=path.join(runs,name+'.out.json');
 fs.writeFileSync(file,r.stdout??'');
 if(r.stderr)fs.writeFileSync(path.join(runs,name+'.err.txt'),r.stderr);
 out.push({name,script,env,exit:r.status,outSha256:sha(file),bytes:(r.stdout??'').length,sourceDigestStart:start,sourceDigestEnd:end,stderrBytes:(r.stderr??'').length});
}
const result={revision:'R7ASM-EVIDENCE-1',generatedAt:new Date().toISOString(),node:process.version,sourceDigest:digest(),
 rule:'Every output is bound to the source digest of the runtime it ran on, recomputed before and after the run. A run whose two digests differ, or whose exit is not 0, is not evidence.',
 runs:out,summary:{runs:out.length,failed:out.filter(r=>r.exit!==0&&!r.skipped).map(r=>r.name),skipped:out.filter(r=>r.skipped).map(r=>r.name),unbound:out.filter(r=>!r.skipped&&r.sourceDigestStart!==r.sourceDigestEnd).map(r=>r.name)}};
fs.writeFileSync(path.join(here,'EVIDENCE_RUNS_R7ASM.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify(result.summary,null,1));
