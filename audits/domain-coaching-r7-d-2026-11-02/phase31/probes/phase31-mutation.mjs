// R7-D Phase 3.1 mutation adequacy: each mutant reintroduces one way the declared-break fact can be lost or misapplied, in a scratch copy of the
// runtime, and must be killed by its own witness test in CoachingCore/test/r7d-phase31.test.mjs. The whole directed file is also run to record
// every test that catches it. The Founder's four (lost after an ASK; lost after a clinical route and clearance; the P3-F01 answer dropped after a
// clinical route; the sibling event applied while the break is retained) plus two of the rule itself (applied twice; a newer declaration ignored).
//   node phase31-mutation.mjs --out <file> [--work <scratch dir>]
// Read-only on the repository: it copies CoachingCore and the two review records the runtime reads into the scratch directory.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const REPO=path.resolve(import.meta.dirname,'../../../..'),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out');if(!out)throw Error('--out <file>');
const work=path.resolve(arg('--work')??fs.mkdtempSync(path.join(os.tmpdir(),'r7d-p31-mut-')));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const TEST='test/r7d-phase31.test.mjs',F='src/r6-adaptation.mjs';
const MUTANTS=[
 {id:'P31-M1',defect:'a break declared with another event is not recorded: lost after its question (ASK)',file:F,
  from:"if(!statesBreak(review)||carried.some(r=>r.eventId===review.event.id))return null;",
  to:"if(!statesBreak(review)||carried.some(r=>r.eventId===review.event.id)||!['WEEKLY_REVIEW','RETURN_AFTER_PAUSE'].includes(KIND_ALIASES[review.event.kind]??review.event.kind))return null;",
  witness:'R7-D Phase 3.1 T1: a break declared with another event is asked and recorded'},
 {id:'P31-M2',defect:'the break is read from the clinical continuation state, not the record: lost when qualified clearance drops that state',file:F,
  from:"const retained=asOf&&!declaresBreak(input)?retainedBreak(program,carried,asOf):null,",
  to:"const retained=asOf&&!declaresBreak(input)&&input?.referenceState?retainedBreak(program,carried,asOf):null,",
  witness:'R7-D Phase 3.1 T2: a break with a clinical flag routes to a human first and is recorded'},
 {id:'P31-M3',defect:'the break answering UNREPORTED_TRAINING is dropped when the same decision routes clinically (P3-F01)',file:F,
  from:"...clone(carried),...(declared?[declared]:[])],",
  to:"...clone(carried),...(declared&&!clinicalRoute(kind,review)?[declared]:[])],",
  witness:'R7-D Phase 3.1 T3'},
 {id:'P31-M4',defect:'the event that carried the break is applied while the break is retained',file:F,
  from:"(kind!=='RETURN_AFTER_PAUSE'&&declaresBreak(review)&&breakCarrierAsk(kind,recordedOn))",
  to:"(kind!=='RETURN_AFTER_PAUSE'&&declaresBreak(review)&&!declared&&breakCarrierAsk(kind,recordedOn))",
  witness:'R7-D Phase 3.1 T4'},
 {id:'P31-M5',defect:'a recorded break stays in force after the return that applied it, so it is applied again',file:F,
  from:"return latest&&!program.decisions.some(d=>d.action==='REESTABLISH'&&Date.parse(d.asOf)>=Date.parse(latest.declaredAt))?latest:null;",
  to:'return latest;',
  witness:'R7-D Phase 3.1 T5'},
 {id:'P31-M6',defect:'a newer declaration does not replace an older one not applied yet (the first stays in force)',file:F,
  from:"const latest=rows.reduce((m,r)=>!m||Date.parse(r.declaredAt)>=Date.parse(m.declaredAt)?r:m,null);",
  to:"const latest=rows.reduce((m,r)=>!m||Date.parse(r.declaredAt)<Date.parse(m.declaredAt)?r:m,null);",
  witness:'R7-D Phase 3.1 T6: a newer declaration of the break replaces'}
];
// The scratch runtime: CoachingCore (with its installed dependencies) and the review records the runtime reads by relative path.
fs.rmSync(path.join(work,'CoachingCore'),{recursive:true,force:true});
fs.cpSync(path.join(REPO,'CoachingCore'),path.join(work,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});
for(const rec of ['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']){fs.mkdirSync(path.dirname(path.join(work,rec)),{recursive:true});fs.copyFileSync(path.join(REPO,rec),path.join(work,rec));}
const cc=path.join(work,'CoachingCore');
// A witness pattern is a regular expression (node --test-name-pattern) with no group or class characters: it must select its witness test, or
// the mutant is not judged (a pattern that selects nothing passes vacuously, and is refused here).
const run=(pattern=null)=>{const r=spawnSync(process.execPath,['--test',...(pattern?['--test-name-pattern',pattern]:[]),TEST],{cwd:cc,encoding:'utf8',maxBuffer:1<<26,timeout:900000});const failed=[...r.stdout.matchAll(/^✖ (R7-D [^\n]*?) \(\d/gm)].map(m=>m[1]),selected=(r.stdout.match(/^✔ R7-D |^✖ R7-D /gm)??[]).length;return {status:r.status,selected,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set(failed)]};};
const baseline=run();
const results=[];
for(const m of MUTANTS){
 if(/[()[\]{}|*+?^$\\]/.test(m.witness))throw Error(`${m.id}: the witness pattern must be literal text`);
 const f=path.join(cc,m.file),src=fs.readFileSync(f,'utf8'),n=src.split(m.from).length-1;
 if(n!==1){results.push({id:m.id,defect:m.defect,applied:false,occurrences:n,killed:false});continue;}
 // The witness must select at least one test on the unmutated runtime, and all of them must pass there.
 const clean=run(m.witness);
 fs.writeFileSync(f,src.replace(m.from,m.to));
 const witness=run(m.witness),all=run();
 fs.writeFileSync(f,src);
 // Killed only when the witness selects tests that pass unmutated, the mutated witness run fails, and every failing test it selected is the named witness.
 results.push({id:m.id,defect:m.defect,file:'CoachingCore/'+m.file,witness:m.witness,applied:true,cleanRun:{selected:clean.selected,pass:clean.pass,fail:clean.fail},witnessRun:{selected:witness.selected,pass:witness.pass,fail:witness.fail,failedTests:witness.failed},caughtBy:all.failed,
  killed:clean.selected>=1&&clean.fail===0&&witness.status!==0&&witness.fail>=1&&witness.failed.length>=1&&witness.failed.every(x=>x.startsWith(m.witness.trim()))});
}
const report={mutation:'R7D-PHASE31-MUTATION-1',testFile:'CoachingCore/'+TEST,testFileSha256:sha(path.join(REPO,'CoachingCore',TEST)),sources:Object.fromEntries([...new Set(MUTANTS.map(m=>m.file))].map(f=>['CoachingCore/'+f,sha(path.join(REPO,'CoachingCore',f))])),baseline,mutants:results,summary:{mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report.summary));
process.exitCode=report.summary.survived.length||baseline.fail?1:0;
