// R7-D Phase 3.4 mutation adequacy (SSCTR-P33-F01 under direction A; the correction and late-evidence re-reads; R-F08-1): each mutant removes or
// weakens one part of the phase's rule in a scratch copy of the runtime, and must be killed by its own witness test in
// CoachingCore/test/r7d-phase34.test.mjs; the whole directed file is also run to record every test that catches it. STOP_WHEN adequate.
//   node phase34-mutation.mjs --out <file> --work-parent <scratch dir>
// It never deletes anything: it copies CoachingCore and the review records the runtime reads into a NEW directory it creates under --work-parent
// (mkdtemp), mutates the copy, and restores each mutated file by rewriting its original bytes. The repository is only read.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const REPO=path.resolve(import.meta.dirname,'../../../..'),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),parent=arg('--work-parent');if(!out||!parent)throw Error('--out <file> --work-parent <scratch dir>');
if(!fs.statSync(parent).isDirectory())throw Error('--work-parent is not a directory: '+parent);
if(path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be outside the repository');
const work=fs.mkdtempSync(path.join(path.resolve(parent),'r7d-p34-mut-'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const TEST='test/r7d-phase34.test.mjs',F='src/r6-adaptation.mjs';
const MUTANTS=[
 {id:'P34-M1',defect:'the R7D-FREEZE-4 reading: weeks complete in one sport count as days of the stop (SSCTR-P33-F01 itself)',file:F,
  from:"if((by.sport.RUN||by.sport.STRENGTH)&&!appliedBetween(ctx,x.end,start)){",
  to:"if(false){",
  witness:'R7-D Phase 3.4 T1'},
 {id:'P34-M2',defect:'any executed session between the breaks reads the earlier break as its own return (isolated training in a long gap shortens the stop)',file:F,
  from:"if((by.sport.RUN||by.sport.STRENGTH)&&!appliedBetween(ctx,x.end,start)){",
  to:"if(trainedBetween(ctx,x.end,start)&&!appliedBetween(ctx,x.end,start)){",
  witness:'R7-D Phase 3.4 T4: isolated sessions'},
 {id:'P34-M3',defect:'no per-sport reading: a sport with its own whole complete week still continues from the earlier break\'s own return',file:F,
  from:"if(!re.RUN&&!re.STRENGTH)return withOwn;",
  to:"return withOwn;",
  witness:'R7-D Phase 3.4 T2: one week with every run done'},
 {id:'P34-M4',defect:'the per-sport reading crossed: the sport that completed the week continues from the own return and the other resumes its history',file:F,
  from:"state:{run:re.RUN?history.state.run:withOwn.state.run,strength:re.STRENGTH?history.state.strength:withOwn.state.strength}",
  to:"state:{run:re.STRENGTH?history.state.run:withOwn.state.run,strength:re.RUN?history.state.strength:withOwn.state.strength}",
  witness:'R7-D Phase 3.4 T2: strength executed in full'},
 {id:'P34-M5',defect:'the earlier break read as its own return is recorded as history (TRAINING_AFTER): the record hides the own return',file:F,
  from:"place.set(x.g,'OWN_RETURN');break;",
  to:"place.set(x.g,'TRAINING_AFTER');break;",
  witness:'R7-D Phase 3.4 T1'},
 {id:'P34-M6',defect:'the late-evidence check recomputes a return without the earlier break\'s own return: a spurious question after the return',file:F,
  from:"const rec=recordedStop(ctx,r.eventId,{start:r.start,end:r.end,days:null,startedAt:r.startedAt},{onlyOwnReturn:true});",
  to:"const rec=null;",
  witness:'R7-D Phase 3.4 T10: after a return'},
 {id:'P34-M7',defect:'a named correction of the latest break reads it alone: the earlier break its return read is dropped (F01 through a correction)',file:F,
  from:"else if(named){const last=episodesOf(program).at(-1),",
  to:"else if(false){const last=episodesOf(program).at(-1),",
  witness:'R7-D Phase 3.4 T10'},
 {id:'P34-M8',defect:'R-F08-1 dropped in the clinical screen: the report in force alone decides (a restated clinical break re-enters by the nonclinical recipe)',file:F,
  from:"return stated??review?.[EPISODE_CLINICAL]??null;",
  to:"return stated;",
  witness:'R7-D Phase 3.4 T12 (R-F08-1): a clinical-cause break restated'},
 {id:'P34-M9',defect:'R-F08-1 dropped in the episode: only the latest report of an episode is screened',file:F,
  from:"clinicalCause:list.find(x=>interruptionScreen(x.i).clinical)??null",
  to:"clinicalCause:interruptionScreen(list.at(-1).i).clinical?list.at(-1):null",
  witness:'R7-D Phase 3.4 T12 (R-F08-1): a clinical-cause break restated'},
 {id:'P34-M10',defect:'the stop still runs through the earlier break while its own return is read (training days counted as stop days in the class)',file:F,
  from:"place.set(x.g,'OWN_RETURN');break;",
  to:"place.set(x.g,'OWN_RETURN');start=x.start;startedAt=x.startedAt;break;",
  witness:'R7-D Phase 3.4 T1'},
 {id:'P34-M11',defect:'the race touch and the race are not required: a race week with them missed re-enters running (SSCTR BR-Q4)',file:F,
  from:"return d?{RUN:d.RUN===true&&raced(x),STRENGTH:d.STRENGTH===true}:null;",
  to:"return d?{RUN:d.RUN===true,STRENGTH:d.STRENGTH===true}:null;",
  witness:'R7-D Phase 3.4 T14: a race week'},
 {id:'P34-M12',defect:'a session on the later break\'s first day never counts as between, even when executed before its stated start (QE-R7D-P33-02)',file:F,
  from:"const between=s=>s.date>after&&(s.date<before||!!startedAt&&s.date===before);",
  to:"const between=s=>s.date>after&&s.date<before;",
  witness:'R7-D Phase 3.4 T15'},
 {id:'P34-M13',defect:'the single-run ceiling after a return planned from its own week counts the elapsed runs of that week that were not done (SSCTR-P34-F01)',file:'src/r6-composition.mjs',
  from:"{completedRuns:[...completedRuns,...runsOf(projected)]}",
  to:"{completedRuns:[...completedRuns,...runsOf(credited.week)]}",
  witness:'R7-D Phase 3.4 T16'}
];
fs.cpSync(path.join(REPO,'CoachingCore'),path.join(work,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});
for(const rec of ['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']){fs.mkdirSync(path.dirname(path.join(work,rec)),{recursive:true});fs.copyFileSync(path.join(REPO,rec),path.join(work,rec));}
const cc=path.join(work,'CoachingCore');
// --test-name-pattern reads a regular expression: the witness title is escaped so it matches itself (a parenthesis included).
const literal=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const run=(pattern=null)=>{const r=spawnSync(process.execPath,['--test',...(pattern?['--test-name-pattern',literal(pattern)]:[]),TEST],{cwd:cc,encoding:'utf8',maxBuffer:1<<26,timeout:900000});const failed=[...r.stdout.matchAll(/^✖ (R7-D [^\n]*?) \(\d/gm)].map(m=>m[1]),selected=(r.stdout.match(/^✔ R7-D |^✖ R7-D /gm)??[]).length;return {status:r.status,selected,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set(failed)]};};
const baseline=run();
const results=[];
for(const m of MUTANTS){
 if(typeof m.witness!=='string'||!m.witness.trim())throw Error(`${m.id}: no witness title`);
 const f=path.join(cc,m.file),src=fs.readFileSync(f,'utf8'),n=src.split(m.from).length-1;
 if(n!==1){results.push({id:m.id,defect:m.defect,applied:false,occurrences:n,killed:false});continue;}
 const clean=run(m.witness);
 fs.writeFileSync(f,src.replace(m.from,m.to));
 const witness=run(m.witness),all=run();
 fs.writeFileSync(f,src);
 results.push({id:m.id,defect:m.defect,file:'CoachingCore/'+m.file,witness:m.witness,applied:true,cleanRun:{selected:clean.selected,pass:clean.pass,fail:clean.fail},witnessRun:{selected:witness.selected,pass:witness.pass,fail:witness.fail,failedTests:witness.failed},caughtBy:all.failed,
  killed:clean.selected>=1&&clean.fail===0&&witness.status!==0&&witness.fail>=1&&witness.failed.length>=1&&witness.failed.every(x=>x.startsWith(m.witness.trim()))});
}
const restored=[...new Set(MUTANTS.map(m=>m.file))].every(f=>sha(path.join(cc,f))===sha(path.join(REPO,'CoachingCore',f)));
const report={mutation:'R7D-PHASE34-MUTATION-1',testFile:'CoachingCore/'+TEST,testFileSha256:sha(path.join(REPO,'CoachingCore',TEST)),sources:Object.fromEntries([...new Set(MUTANTS.map(m=>m.file))].map(f=>['CoachingCore/'+f,sha(path.join(REPO,'CoachingCore',f))])),scratchRestored:restored,baseline,mutants:results,summary:{mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({...report.summary,scratchRestored:restored}));
process.exitCode=report.summary.survived.length||baseline.fail||!restored?1:0;
