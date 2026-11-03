// R7-D Phase 3.2 mutation adequacy (SSCTR-P31-F02): each mutant reintroduces one way a newer declaration can erase, join or outrank an older
// unapplied break, in a scratch copy of the runtime, and must be killed by its own witness test in CoachingCore/test/r7d-phase32.test.mjs. The
// whole directed file is also run to record every test that catches it. The Founder's seven (last-write-wins; automatic merge; the older fact
// dropped by a partial newer declaration; "separate" with the older break ignored; unknown training between separate breaks read as no training;
// read as resumed training; clinical precedence bypassed by the episode question) plus one of the rule itself (a correction of an applied break
// applied across a kept one, the SSCTR p4b path). STOP_WHEN adequate: no broad campaign.
//   node phase32-mutation.mjs --out <file> [--work <scratch dir>]
// Read-only on the repository: it copies CoachingCore and the two review records the runtime reads into the scratch directory.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const REPO=path.resolve(import.meta.dirname,'../../../..'),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out');if(!out)throw Error('--out <file>');
const work=path.resolve(arg('--work')??fs.mkdtempSync(path.join(os.tmpdir(),'r7d-p32-mut-')));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const TEST='test/r7d-phase32.test.mjs',F='src/r6-adaptation.mjs';
const MUTANTS=[
 {id:'P32-M1',defect:'last-write-wins: with several breaks on record the newest one is read alone',file:F,
  from:"if(groups.length===1)return {groups,read:groups[0],separate:null,excluded:[],ask:null};",
  to:"if(groups.length>=1)return {groups,read:groups.at(-1),separate:null,excluded:[],ask:null};",
  witness:'R7-D Phase 3.2 T1'},
 {id:'P32-M2',defect:'automatic merge: a newer break that names none is joined to the kept one by its dates (the relation is never asked)',file:F,
  from:"const unresolved=groups.filter((g,k)=>k>0&&!g.named);",
  to:"const unresolved=groups.filter((g,k)=>false);",
  witness:'R7-D Phase 3.2 T1'},
 {id:'P32-M3',defect:'the older fact dropped when the newer declaration is partial (a newer report with no dates joins the one before it)',file:F,
  from:"for(let a=0;a<reports.length;a++)for(let b=0;b<reports.length;b++)if(a!==b&&(keys[a]===keys[b]||",
  to:"for(let a=0;a<reports.length;a++)for(let b=0;b<reports.length;b++)if(a!==b&&(keys[a]===keys[b]||b===a-1&&!isoDay(reports[a].i.startDate)&&!isoDay(reports[a].i.endDate)||",
  witness:'R7-D Phase 3.2 T1: a partial newer declaration'},
 {id:'P32-M4',defect:'answered "separate", the older break is ignored: the return reads the latest break alone',file:F,
  from:"for(const g of ctx.separate.filter(x=>x!==headG)){",
  to:"for(const g of ctx.separate.filter(x=>false)){",
  witness:'R7-D Phase 3.2 T4: separate breaks whose days touch or overlap'},
 {id:'P32-M5',defect:'unknown training between separate breaks read as no training (continuity assumed)',file:F,
  from:"unknown=unreportedBetween(ctx,from,through),n=unknown.length;",
  to:"unknown=unreportedBetween(ctx,from,through),n=0;",
  witness:'R7-D Phase 3.2 T4: separate breaks with unreported training between them'},
 {id:'P32-M6',defect:'unknown training between separate breaks read as resumed training (the earlier break left out)',file:F,
  from:"if(trainedBetween(ctx,x.end,start))break;",
  to:"if(trainedBetween(ctx,x.end,start)||unreportedBetween(ctx,onDate(x.end,1),onDate(start,-1)).length)break;",
  witness:'R7-D Phase 3.2 T4: separate breaks with unreported training between them'},
 {id:'P32-M7',defect:'clinical precedence bypassed by the episode question: with the relation unresolved the review reads the newest break, not the clinical one',file:F,
  from:"if(unresolved.length)return {groups,read:clinical??latest(open.length?open:groups),",
  to:"if(unresolved.length)return {groups,read:latest(open.length?open:groups),",
  witness:'R7-D Phase 3.2 T5: clinical first comes before the relation question'},
 {id:'P32-M8',defect:'a correction of an applied break is applied across a break kept since (SSCTR p4b): the kept break is consumed unapplied',file:F,
  from:"if(own?.applied&&open.length)return {groups,read:clinical??own,separate:null,excluded:[],ask:'CORRECTION_ACROSS_KEPT_BREAK'};",
  to:"if(own?.applied&&open.length)return {groups,read:clinical??own,separate:null,excluded:[],ask:null};",
  witness:'R7-D Phase 3.2 T6: an applied break and a later new one'}
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
const report={mutation:'R7D-PHASE32-MUTATION-1',testFile:'CoachingCore/'+TEST,testFileSha256:sha(path.join(REPO,'CoachingCore',TEST)),sources:Object.fromEntries([...new Set(MUTANTS.map(m=>m.file))].map(f=>['CoachingCore/'+f,sha(path.join(REPO,'CoachingCore',f))])),baseline,mutants:results,summary:{mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report.summary));
process.exitCode=report.summary.survived.length||baseline.fail?1:0;
