// R7-D Phase 3.3 mutation adequacy (SSCTR-P32-F01, Founder direction B): each mutant reintroduces one way training between two separate breaks
// could again erase the earlier break, or one way the re-entry rule could be weakened, in a scratch copy of the runtime, and must be killed by its own
// witness test in CoachingCore/test/r7d-phase33.test.mjs; the whole directed file is also run to record every test that catches it. STOP_WHEN
// adequate: no broad campaign.
//   node phase33-mutation.mjs --out <file> --work-parent <scratch dir>
// It never deletes anything: it copies CoachingCore and the two review records the runtime reads into a NEW directory it creates under
// --work-parent (mkdtemp), mutates the copy, and restores each mutated file by rewriting its original bytes. The repository is only read.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const REPO=path.resolve(import.meta.dirname,'../../../..'),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),parent=arg('--work-parent');if(!out||!parent)throw Error('--out <file> --work-parent <scratch dir>');
if(!fs.statSync(parent).isDirectory())throw Error('--work-parent is not a directory: '+parent);
if(path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be outside the repository');
const work=fs.mkdtempSync(path.join(path.resolve(parent),'r7d-p33-mut-'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const TEST='test/r7d-phase33.test.mjs',F='src/r6-adaptation.mjs';
const MUTANTS=[
 {id:'P33-M1',defect:'the R7D-FREEZE-3 reading: any recorded session between the breaks re-enters the athlete (F01 itself)',file:F,
  from:"reentry=reestablishedBetween(ctx,x.end,start,startedAt);",
  to:"reentry=trainedBetween(ctx,x.end,start)?{startDate:null}:null;",
  witness:'R7-D Phase 3.3 T1'},
 {id:'P33-M2',defect:'a week a review closed re-enters the athlete whatever its gates (a review of a week with one session counts)',file:F,
  from:"const done=at(x.j+1)?.complete;",
  to:"const done=at(x.j+1)&&{RUN:at(x.j+1).sport?.RUN?.week===x.j+1||at(x.j+1).complete?.RUN,STRENGTH:at(x.j+1).sport?.STRENGTH?.week===x.j+1||at(x.j+1).complete?.STRENGTH};",
  witness:'R7-D Phase 3.3 T3: the late form'},
 {id:'P33-M3',defect:'one sport executed completely is enough (the other sport\'s sessions of the week missed)',file:F,
  from:"].every(sport=>done[sport]===true);})??null;",
  to:"].some(sport=>done[sport]===true);})??null;",
  witness:'R7-D Phase 3.3 T4: a week between the breaks with a session missed or partial'},
 {id:'P33-M4',defect:'every week counts as executed completely (gates ignored: a missed, partial or adverse session re-enters)',file:F,
  from:"complete:{RUN:complete('RUN'),STRENGTH:complete('STRENGTH')}};",
  to:"complete:{RUN:true,STRENGTH:true}};",
  witness:'R7-D Phase 3.3 T4: a week between the breaks with a session missed or partial'},
 {id:'P33-M5',defect:'every session reported done is enough (an adverse response, recovery adverse or next day impaired, re-enters)',file:F,
  from:"].every(sport=>done[sport]===true);})??null;",
  to:"].every(sport=>x.sessions.filter(s=>s.sport===sport).every(s=>(ctx.fullLedger??ctx.ledger).some(o=>o.sessionId===s.id&&!o.conflicted&&o.actual?.completed===true)));})??null;",
  witness:'R7-D Phase 3.3 T5'},
 {id:'P33-M6',defect:'a week that holds days of a break counts (the week need only touch the days between them)',file:F,
  from:"x.sessions.length&&x.sessions.every(s=>s.date>after&&s.date<before));",
  to:"x.sessions.length&&x.sessions.some(s=>s.date>after&&s.date<before));",
  witness:'R7-D Phase 3.3 T4: a week that holds days of the earlier break'},
 {id:'P33-M7',defect:'the record says nothing was trained between the breaks when training was recorded there',file:F,
  from:"place.set(x.g,trainedBetween(ctx,x.end,start)?'TRAINING_NOT_REESTABLISHED':'NO_TRAINING_BETWEEN');",
  to:"place.set(x.g,'NO_TRAINING_BETWEEN');",
  witness:'R7-D Phase 3.3 T1'},
 {id:'P33-M8',defect:'with training recorded between the breaks, their unreported sessions are read through without asking',file:F,
  from:"unknown=unreportedBetween(ctx,from,through),n=unknown.length;",
  to:"unknown=unreportedBetween(ctx,from,through),n=trainedBetween(ctx,x.end,start)?0:unknown.length;",
  witness:'R7-D Phase 3.3 T4: unreported sessions in a week between the breaks'}
];
// The scratch runtime: CoachingCore (with its installed dependencies) and the review records the runtime reads by relative path.
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
const restored=sha(path.join(cc,F))===sha(path.join(REPO,'CoachingCore',F));
const report={mutation:'R7D-PHASE33-MUTATION-1',testFile:'CoachingCore/'+TEST,testFileSha256:sha(path.join(REPO,'CoachingCore',TEST)),sources:Object.fromEntries([...new Set(MUTANTS.map(m=>m.file))].map(f=>['CoachingCore/'+f,sha(path.join(REPO,'CoachingCore',f))])),scratchRestored:restored,baseline,mutants:results,summary:{mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({...report.summary,scratchRestored:restored,work}));
process.exitCode=report.summary.survived.length||baseline.fail||!restored?1:0;
