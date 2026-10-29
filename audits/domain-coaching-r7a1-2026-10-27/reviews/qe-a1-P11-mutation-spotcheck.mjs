// R7A1-QE-r1 P11: independent spot-check of the author's recorded mutation results (probes/mutation-check-r7a1.out.json) for four reverts,
// plus one mutant of my own per new finding's mechanism, to show whether the R7-A and R7-A.1 tests can see them. Copies src/, r6/fixtures,
// the policy and the three test files into the OS temp folder (never into the repo), applies one exact replacement at a time, runs
// `node --test` there and removes the copy. Prints only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,print} from './qe-a1-lib.mjs';
const cc=path.join(ROOT,'CoachingCore'),TESTS=['test/r7a-semantic-core.test.mjs','test/r7a-cycle2.test.mjs','test/r7a1-composition.test.mjs'];
const A='src/r6-adaptation.mjs',C='src/r6-composition.mjs',V='src/r6-provenance.mjs';
const MUTANTS=[
 ['author: A1 C7 two races ahead pass validation (recorded: survives, documented)',A,"...(races.length>1?['duplicateRace:'+races.map(s=>s.id).join('+')]:[])","...[]"],
 ['author: A1 C4 recorded adaptations are not applied again (recorded: caught)',C,"const list=next.weeks[i].adaptations??[];let sessions=merged;","const list=[];let sessions=merged;"],
 ['author: A1 QE-05 an agreeing report does not fill unknown fields (recorded: caught)',V,"for(const k of ['load','reps','rir'])if(!known(t[k])&&known(o[k]))t[k]=clone(o[k]);",""],
 ['author: A1 C5 a newer return starts from the start an earlier return replaced (recorded: caught)',A,"prior=pauseWeek===w&&replaced?replaced:program.stateTrace[pauseWeek]??program.stateTrace[0]","prior=program.stateTrace[pauseWeek]??program.stateTrace[0]"],
 // A behaviour the review asks for (QE-R7A1-01): a move re-applied after an equipment change re-plans the moved content. Making the move
 // re-application drop instead of copying stale content is a behaviour change the tests should notice either way; here only the current
 // behaviour is mutated to "never re-apply a move" to see whether any test pins C4 moves through an equipment change.
 ['own: C4 a missed-session move is never re-applied',C,"if(a.kind==='MISSED_SESSION'){","if(a.kind==='MISSED_SESSION'&&false){"],
 // QE-R7A1-02: evidenceStart reading the systemic flag. Forcing systemic HOLD in every evidence re-derivation (the behaviour the finding
 // requires when the week had the signal) must not break any test that encodes the current behaviour as intended.
 ['own: SYSTEMIC_SIGNAL ignored by the weekly review',A,"||(program.weeks[w].adaptations??[]).some(a=>a.kind==='SYSTEMIC_SIGNAL')","||false"],
 // QE-R7A1-04: one same-day definition. The adaptations' extra `s.date>asOfLocal` clause removed from fatigue (aheadOf alone decides).
 ['own: fatigue uses aheadOf alone (same-day PM session adapted)',C,"if(!(s.date>asOfLocal&&s.prescription&&env.ahead(s)))return s;","if(!(s.prescription&&env.ahead(s)))return s;"]
];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qe-a1-mut-')),results=[];
try{
 const copyDir=rel=>{for(const e of fs.readdirSync(path.join(cc,rel),{withFileTypes:true})){const p=path.join(rel,e.name);if(e.isDirectory())copyDir(p);else{fs.mkdirSync(path.dirname(path.join(tmp,'CoachingCore',p)),{recursive:true});fs.copyFileSync(path.join(cc,p),path.join(tmp,'CoachingCore',p));}}};
 for(const rel of ['src','r6/fixtures'])copyDir(rel);
 fs.mkdirSync(path.join(tmp,'CoachingCore/test'),{recursive:true});for(const t of TESTS)fs.copyFileSync(path.join(cc,t),path.join(tmp,'CoachingCore',t));
 fs.copyFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),path.join(tmp,'CoachingCore/r6/PROGRAM_POLICY_R6.json'));fs.copyFileSync(path.join(cc,'package.json'),path.join(tmp,'CoachingCore/package.json'));
 const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024});return {code:r.status,failed:[...new Set([...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter(n=>n!=='failing tests:'))]};};
 const clean=run();results.push({mutation:'unmutated copy',caught:clean.code!==0,failed:clean.failed});
 for(const [name,file,from,to] of MUTANTS){const f=path.join(tmp,'CoachingCore',file),orig=fs.readFileSync(f,'utf8');if(orig.split(from).length!==2){results.push({mutation:name,applied:false});continue;}fs.writeFileSync(f,orig.replace(from,()=>to));const r=run();fs.writeFileSync(f,orig);results.push({mutation:name,applied:true,caught:r.code!==0,failingTests:r.failed.slice(0,4)});}
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
print({probe:'R7A1-QE-P11',tests:TESTS,results});
