// R7-D Phase 3 mutation adequacy: each mutant reintroduces one defect the phase fixed, in a scratch copy of the runtime, and must be killed by its
// own witness test in CoachingCore/test/r7d-phase3.test.mjs. The whole directed file is also run to record every test that catches it.
//   node phase3-mutation.mjs --out <file> [--work <scratch dir>]
// Read-only on the repository: it copies CoachingCore and the two review records the runtime reads into the scratch directory.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const REPO=path.resolve(import.meta.dirname,'../../../..'),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out');if(!out)throw Error('--out <file>');
const work=path.resolve(arg('--work')??fs.mkdtempSync(path.join(os.tmpdir(),'r7d-p3-mut-')));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const TEST='test/r7d-phase3.test.mjs';
const MUTANTS=[
 {id:'DX01-M1',defect:'a carried same-day day-precision row is re-screened as an exact timestamp and dropped',file:'src/r6-provenance.mjs',
  from:"const t=carried&&o.provenance?.timePrecision==='DAY'&&isoDay(o.localDate)&&utcTimestamp(o.observedAt)?{at:utcTimestamp(o.observedAt),precision:'DAY',day:o.localDate}:effective(o);",to:'const t=effective(o);',
  witness:'R7-D DX-01: a same-day report with day precision, accepted by a decision, stays in the record'},
 {id:'DX02-M1',defect:'a declared break in a weekly review is read only when an unreported-training question is pending',file:'src/r6-adaptation.mjs',
  from:"const kind=kind0==='WEEKLY_REVIEW'&&declaresBreak(review)?'RETURN_AFTER_PAUSE':kind0;",to:"const kind=kind0==='WEEKLY_REVIEW'&&declaresBreak(review)&&(review?.referenceState?.pending?.missingInputs??[]).includes('observations.unreportedSessions|interruption')?'RETURN_AFTER_PAUSE':kind0;",
  witness:'R7-D DX-02: a declared break inside a weekly review with no question pending is read'},
 {id:'F03-M1',defect:'the prescribed machine unit (STACK_STEP) is not accepted when logged back',file:'src/r6-prescription.mjs',
  from:"const LOAD_UNITS={...INCREMENT_UNITS,MACHINE_STACK:'KG'};",to:'const LOAD_UNITS={...INCREMENT_UNITS};',
  witness:'R7-D F03-A: a machine load is prescribed in the unit of its value'},
 {id:'F03-M2',defect:'at the top of the range the engine computes the next machine load (R + 1 kg)',file:'src/r6-program.mjs',
  from:'   else ex.stepDue={reps:Math.max(lo,Math.min(hi,ex.repsBase??lo)),heldReps:ex.reps};',to:'   else{ex.load=Math.round((ex.load+1)*10)/10;ex.reps=Math.max(lo,Math.min(hi,ex.repsBase??lo));}',
  witness:'R7-D F03-B T2 '},
 {id:'F03-M3',defect:'a heavier machine setting is adopted on the ADVANCE exposure alone, without verification',file:'src/r6-program.mjs',
  from:'  if(log.confirmed===true||same(log.earlier)||same(ex?.pendingSetting))return',to:'  if(true)return',
  witness:'R7-D F03-B T3/T4'},
 {id:'F04-M1',defect:'confounded erases an adverse recovery and an impaired next day',file:'src/r6-adaptation.mjs',
  from:"const kindOf=o=>o.partial?'PARTIAL':o.confounded?(adverseBeyondConfounding(o)?'ADVERSE':'CONFOUNDED'):classify(o);",to:"const kindOf=o=>o.partial?'PARTIAL':o.confounded?'CONFOUNDED':classify(o);",
  witness:'R7-D F04: confounded × performance × recovery × next-day function'}
];
// The scratch runtime: CoachingCore (with its installed dependencies) and the review records the runtime reads by relative path.
fs.rmSync(path.join(work,'CoachingCore'),{recursive:true,force:true});
fs.cpSync(path.join(REPO,'CoachingCore'),path.join(work,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});
for(const rec of ['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']){fs.mkdirSync(path.dirname(path.join(work,rec)),{recursive:true});fs.copyFileSync(path.join(REPO,rec),path.join(work,rec));}
const cc=path.join(work,'CoachingCore');
// A witness pattern is a regular expression (node --test-name-pattern): it must select its witness test, or the mutant is not judged (a pattern
// that selects nothing passes vacuously).
const run=(pattern=null)=>{const r=spawnSync(process.execPath,['--test',...(pattern?['--test-name-pattern',pattern]:[]),TEST],{cwd:cc,encoding:'utf8',maxBuffer:1<<26,timeout:900000});const failed=[...r.stdout.matchAll(/^✖ (R7-D [^\n]*?) \(\d/gm)].map(m=>m[1]),selected=(r.stdout.match(/^✔ R7-D |^✖ R7-D /gm)??[]).length;return {status:r.status,selected,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set(failed)]};};
const baseline=run();
const results=[];
for(const m of MUTANTS){
 const f=path.join(cc,m.file),src=fs.readFileSync(f,'utf8'),n=src.split(m.from).length-1;
 if(n!==1){results.push({...m,applied:false,occurrences:n,killed:false});continue;}
 fs.writeFileSync(f,src.replace(m.from,m.to));
 const witness=run(m.witness),all=run();
 fs.writeFileSync(f,src);
 // Killed only when the witness run fails and every failing test it selected is the named witness (a pattern selecting nothing passes vacuously).
 results.push({id:m.id,defect:m.defect,file:'CoachingCore/'+m.file,witness:m.witness,applied:true,witnessRun:{pass:witness.pass,fail:witness.fail,failedTests:witness.failed},caughtBy:all.failed,killed:witness.status!==0&&witness.fail>=1&&witness.failed.length>=1&&witness.failed.every(n=>n.startsWith(m.witness.trim()))});
}
const report={mutation:'R7D-PHASE3-MUTATION-1',testFile:'CoachingCore/'+TEST,testFileSha256:sha(path.join(REPO,'CoachingCore',TEST)),sources:Object.fromEntries([...new Set(MUTANTS.map(m=>m.file))].map(f=>['CoachingCore/'+f,sha(path.join(REPO,'CoachingCore',f))])),baseline,mutants:results,summary:{mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report.summary));
process.exitCode=report.summary.survived.length||baseline.fail?1:0;
