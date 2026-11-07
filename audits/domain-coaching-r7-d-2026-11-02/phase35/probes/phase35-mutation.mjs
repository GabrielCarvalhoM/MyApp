// R7-D Phase 3.5 mutation adequacy: each mutant removes or weakens one part of the phase's runtime delta (SSCTR-P34R2-F01, SSCTR-P34R2-F02,
// QRE2-P34-01) or re-applies a QRE survivor of Phase 3.4 (N01, N05, the depth-2 drop of QRE2-P34-03), in a scratch copy of the runtime, and must be
// killed by its own witness test; the five R7-D directed files (3.5, 3.4, 3.3, 3.2, 3.1) are also run to record every test that catches it.
//   node phase35-mutation.mjs --out <file> --work-parent <scratch dir>
// It never deletes anything: it copies the runtime, its authority inputs, fixtures and tests and the five review records the runtime reads into a NEW
// directory it creates under --work-parent (mkdtemp), mutates the copy, and restores each mutated file by rewriting its original bytes. The
// repository is only read.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const REPO=path.resolve(import.meta.dirname,'../../../..'),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),parent=arg('--work-parent');if(!out||!parent)throw Error('--out <file> --work-parent <scratch dir>');
if(!fs.statSync(parent).isDirectory())throw Error('--work-parent is not a directory: '+parent);
if(path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be outside the repository');
const work=fs.mkdtempSync(path.join(path.resolve(parent),'r7d-p35-mut-'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const F='src/r6-adaptation.mjs',T35='test/r7d-phase35.test.mjs',T34='test/r7d-phase34.test.mjs';
const FILES=[T35,T34,'test/r7d-phase33.test.mjs','test/r7d-phase32.test.mjs','test/r7d-phase31.test.mjs'];
const W={F01:'R7-D Phase 3.5 T31',CU3:'R7-D Phase 3.5 T32 (SSCTR-P34R2-F02, CU3)',CU1:'R7-D Phase 3.5 T32 (SSCTR-P34R2-F02, CU1, LC1, CU2)',LATER:'R7-D Phase 3.5 T32 (SSCTR-P34R2-F02): a correction that moves the trip a week later',
 R07:'R7-D Phase 3.5 T33 (QRE2-P34-01, R07): after a late first-day lift',R07b:'R7-D Phase 3.5 T33 (QRE2-P34-01, R07): a start time before the lift',R04:'R7-D Phase 3.5 T33 (QRE2-P34-01, R04)',
 T34:'R7-D Phase 3.5 T34',N01:'R7-D Phase 3.5 T35 (QRE CQ2-4, N01)',N05:'R7-D Phase 3.5 T35 (QRE CQ2-4, N05)',C3:'R7-D Phase 3.4 T20 (characterization)'};
const MUTANTS=[
 {id:'P35-M01',defect:'SSCTR-P34R2-F01 reverted: a race week without a gated run re-enters running whatever the systemic rule holds',edits:[['&&raced(x)&&!h.systemic','&&raced(x)']],witness:W.F01},
 {id:'P35-M02',defect:'SSCTR-P34R2-F02 reverted in unreportedBetween: the superseded report masks the days a correction uncovers',edits:[['unreportedBetween(ctx,from,through,H.g.identity)','unreportedBetween(ctx,from,through)']],witness:W.CU3},
 {id:'P35-M03',defect:'SSCTR-P34R2-F02 reverted in the re-entry history: the weeks between are read from the superseded return',edits:[['reentryBetween(ctx,x.end,start,startedAt,H.g.identity)','reentryBetween(ctx,x.end,start,startedAt)']],witness:W.LATER},
 {id:'P35-M04',defect:'SSCTR-P34R2-F02: the exception names the earlier break, not the break being read',edits:[['unreportedBetween(ctx,from,through,H.g.identity)','unreportedBetween(ctx,from,through,x.g.identity)']],witness:W.CU1},
 {id:'P35-M05',defect:'QRE2-P34-01: the re-read reads only the report its return listed, never a restatement of that break',edits:[['startedAt:utcTimestamp(newer.interruption.startedAt)','startedAt:utcTimestamp(i.startedAt)']],witness:W.R07},
 {id:'P35-M06',defect:'QRE2-P34-01: a restatement on record is kept as a break of its own',edits:[['!applied(r)&&!consumed.has(r.eventId)','!applied(r)']],witness:W.R04},
 {id:'P35-M07',defect:'QRE2-P34-01: the restating review is decided as if it stated a break of its own',edits:[['stated=restated?{...input,interruption:undefined}:input','stated=input']],witness:W.R07},
 {id:'P35-M08',defect:'QRE2-P34-01: a re-read does not read the restatement the deciding review carries',edits:[['carried:declared?[...carried,declared]:carried}','carried}']],witness:W.R04},
 {id:'P35-M09',defect:'QRE2-P34-01: a return report that only restates a listed break is decided by the return handler (it asks the reason)',edits:[["(restated&&!read&&kind==='RETURN_AFTER_PAUSE'?staleReturn(c)??restatedKeep(restated):null)||",'']],witness:W.R07},
 {id:'P35-M10',defect:'QRE2-P34-01: a report changing another fact of a listed break is read as a restatement',edits:[['if(factsBesideStart(i)!==factsBesideStart(x.decl.interruption))return false;','']],witness:W.C3,file:T34},
 {id:'P35-M11',defect:'QRE2-P34-01: a start time on another day than the break\'s first day is read',edits:[['localDate(t,tz)===x.row.startDate&&','']],witness:W.R07b},
 {id:'P35-M12',defect:'QRE2-P34-01: the oldest report of a listed break decides, not the newest',edits:[['const n=naming(x,rows).at(-1);','const n=naming(x,rows)[0];']],witness:W.R07b},
 {id:'N01',defect:'QRE2-P34-04: F03 without required(x): a week with only optional runs re-enters running',edits:[['RUN:required(x)&&(!gated(x)||d.RUN===true)&&raced(x)','RUN:(!gated(x)||d.RUN===true)&&raced(x)']],witness:W.N01},
 {id:'N05',defect:'QRE2-P34-04: F04 names the own return\'s head, not the break that starts its stop',edits:[['startedAt,startBreak:at,continuous','startedAt,startBreak:H,continuous']],witness:W.N05},
 {id:'DEPTH2',defect:'QRE2-P34-03: an own return at depth 2 or more reads its stop without its earlier breaks',edits:[['const r=ownReturnOf(ctx,x,sorted.slice(k+1).filter(y=>!place.has(y.g)));','const r=ownReturnOf({...ctx,__depth:(ctx.__depth??0)+1},x,sorted.slice(k+1).filter(y=>!place.has(y.g)));'],['sub=stopOf(ctx,x,earlier);','sub=stopOf(ctx,x,(ctx.__depth??0)>1?[]:earlier);']],witness:W.T34}
];
const LEAN=['CoachingCore/src','CoachingCore/test','CoachingCore/r7/b','CoachingCore/r7/b0','CoachingCore/r6/fixtures','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r5/PROGRAM_POLICY_R5.json',
 'CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','CoachingCore/r3/BOUNDED_POLICY_CANDIDATES_R3.json','CoachingCore/package.json','CoachingCore/POLICY_REGISTRY_RUNTIME_BINDINGS.json','CoachingCore/SHADOW_DECISION_SCHEMA.json','CoachingCore/SHADOW_INPUT_SCHEMA.json',
 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json',
 'audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
for(const p of LEAN){const s=path.join(REPO,p),d=path.join(work,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(s,d,{recursive:true});}
const cc=path.join(work,'CoachingCore');
// --test-name-pattern reads a regular expression: the witness title is escaped so it matches itself (a parenthesis included).
const literal=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const run=(files,pattern=null)=>{const r=spawnSync(process.execPath,['--test',...(pattern?['--test-name-pattern',literal(pattern)]:[]),...files],{cwd:cc,encoding:'utf8',maxBuffer:1<<26,timeout:1800000});const failed=[...r.stdout.matchAll(/^✖ (R7-D [^\n]*?) \(\d/gm)].map(m=>m[1]),selected=(r.stdout.match(/^✔ R7-D |^✖ R7-D /gm)??[]).length;return {status:r.status,selected,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set(failed)]};};
const baseline=run(FILES);
const results=[];
const f=path.join(cc,F),src=fs.readFileSync(f,'utf8');
for(const m of MUTANTS){
 const counts=m.edits.map(([a])=>src.split(a).length-1);
 if(counts.some(n=>n!==1)){results.push({id:m.id,defect:m.defect,applied:false,occurrences:counts,killed:false});continue;}
 const file=m.file??T35,clean=run([file],m.witness);
 fs.writeFileSync(f,m.edits.reduce((s,[a,b])=>s.replace(a,b),src));
 const witness=run([file],m.witness),all=run(FILES);
 fs.writeFileSync(f,src);
 results.push({id:m.id,defect:m.defect,file:'CoachingCore/'+F,witness:m.witness,witnessFile:'CoachingCore/'+file,applied:true,cleanRun:{selected:clean.selected,pass:clean.pass,fail:clean.fail},witnessRun:{selected:witness.selected,pass:witness.pass,fail:witness.fail,failedTests:witness.failed},caughtBy:all.failed,
  killed:clean.selected>=1&&clean.fail===0&&witness.status!==0&&witness.fail>=1&&witness.failed.length>=1&&witness.failed.every(x=>x.startsWith(m.witness.trim()))});
}
const restored=sha(f)===sha(path.join(REPO,'CoachingCore',F));
const report={mutation:'R7D-PHASE35-MUTATION-1',testFiles:FILES.map(t=>({file:'CoachingCore/'+t,sha256:sha(path.join(REPO,'CoachingCore',t))})),source:{file:'CoachingCore/'+F,sha256:sha(path.join(REPO,'CoachingCore',F))},scratchRestored:restored,baseline,mutants:results,
 summary:{mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({...report.summary,scratchRestored:restored,baseline:{pass:baseline.pass,fail:baseline.fail}}));
process.exitCode=report.summary.survived.length||baseline.fail||!restored?1:0;
