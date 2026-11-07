// R7-D Phase 3.3 independent mutation probe (QUALITY_CHECK_R7D_PHASE33): the reviewer's own mutants of the Phase 3.3 rule, beyond the author's
// eight, each run against the Phase 3.3 and 3.2 directed test files and the reviewer's runtime probes (qre-p33-runtime-probes.mjs). Also one
// experiment (EXP-*), not a mutant: a variant that tests a hypothesis about a probe result.
// It copies a runtime root (CoachingCore plus the authority records) into a NEW directory it creates under --work-parent (mkdtemp), mutates the copy
// one mutant at a time and restores each file by rewriting its original bytes. Nothing is deleted; the source root is only read.
//   node qre-p33-mutation.mjs --rt <candidate root> --work-parent <scratch dir> --baseline <runtime-probes.candidate.json> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const src=arg('--rt'),parent=arg('--work-parent'),baseFile=arg('--baseline'),out=arg('--out');
if(!src||!parent||!baseFile||!out)throw Error('--rt --work-parent --baseline --out');
const work=fs.mkdtempSync(path.join(path.resolve(parent),'qre-p33-mut-'));
fs.cpSync(src,work,{recursive:true});
const cc=path.join(work,'CoachingCore'),F=path.join(cc,'src/r6-adaptation.mjs'),orig=fs.readFileSync(F,'utf8'),sha=b=>createHash('sha256').update(b).digest('hex');
const PROBE=path.join(import.meta.dirname,'qre-p33-runtime-probes.mjs'),baseline=JSON.parse(fs.readFileSync(baseFile,'utf8'));
const view=c=>c.error?{error:c.error}:{action:c.result.action,question:c.result.question,stop:c.result.stop,extra:[c.entrySameAsDeclaredOnce,c.aheadSameAsDeclaredOnce,c.sameHash]};
const M=[
 {id:'QM1',what:'a week whose session falls on the earlier break\'s last day counts',from:"x.sessions.every(s=>s.date>after&&s.date<before));",to:"x.sessions.every(s=>s.date>=after&&s.date<before));"},
 {id:'QM2',what:'a week whose session falls on the stop\'s first day counts',from:"x.sessions.every(s=>s.date>after&&s.date<before));",to:"x.sessions.every(s=>s.date>after&&s.date<=before));"},
 {id:'QM3',what:'the empty-week guard dropped (a plan week with no live session re-enters)',from:".filter(x=>x.sessions.length&&x.sessions.every(",to:".filter(x=>x.sessions.every("},
 {id:'QM4',what:'both sports required whatever the week plans (run-only or strength-only weeks never re-enter)',from:"[...new Set(x.sessions.map(s=>s.sport))].every(sport=>done[sport]===true)",to:"['RUN','STRENGTH'].every(sport=>done[sport]===true)"},
 {id:'QM5',what:'reentryWeek written on every record row once a re-entry is found (placed breaks and LATEST too)',from:"...(!place.has(x.g)&&reentry?{reentryWeek:reentry.startDate}:{})",to:"...(reentry?{reentryWeek:reentry.startDate}:{})"},
 {id:'QM6',what:'the history read without the stop\'s start time',from:"const at=stateAtBreak(ctx,{start:before,startedAt}).history;",to:"const at=stateAtBreak(ctx,{start:before}).history;"},
 {id:'QM7',what:'off by one: the week before the candidate week is read',from:"const done=at(x.j+1)?.complete;",to:"const done=at(x.j)?.complete;"},
 {id:'QM8',what:'any unreported session between the breaks suppresses the re-entry (asks even after a whole executed week)',from:"reentry=reestablishedBetween(ctx,x.end,start,startedAt);",to:"reentry=unreportedBetween(ctx,onDate(x.end,1),onDate(start,-1)).length?null:reestablishedBetween(ctx,x.end,start,startedAt);"},
 {id:'QM9',what:'SKIPPED sessions kept in the wholly-between test',from:"sessions:x.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED')}))",to:"sessions:x.sessions.filter(s=>s.prescription)}))"},
 {id:'QM10',what:'the latest week between the breaks reported as the re-entry week instead of the first',from:"return weeks.find(x=>{const done=",to:"return weeks.findLast(x=>{const done="},
 {id:'EXP-1',what:'experiment: a session on the stop\'s first day counts as before it when the stop has a stated start time (tests the Q5 hypothesis)',from:"x.sessions.every(s=>s.date>after&&s.date<before));",to:"x.sessions.every(s=>s.date>after&&(s.date<before||!!startedAt&&s.date===before)));"}
];
const node=(args,cwd)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const tests=()=>{const r=node(['--test','test/r7d-phase33.test.mjs','test/r7d-phase32.test.mjs'],cc);return {pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...r.stdout.matchAll(/^✖ (R7-D [^\n]*?) \(\d/gm)].map(m=>m[1].slice(0,110)))]};};
const probes=id=>{const f=path.join(work,`probes-${id}.json`);const r=node([PROBE,'--rt',work,'--out',f],cc);if(!fs.existsSync(f))return {error:r.stderr.slice(0,400)};const j=JSON.parse(fs.readFileSync(f,'utf8'));return {differ:j.cases.filter((c,i)=>JSON.stringify(view(c))!==JSON.stringify(view(baseline.cases[i]))).map(c=>c.id),cases:j.cases.map(c=>({id:c.id,...view(c)}))};};
const rows=[];
for(const m of M){
 const n=orig.split(m.from).length-1;if(n!==1){rows.push({id:m.id,what:m.what,applied:false,occurrences:n});continue;}
 fs.writeFileSync(F,orig.replace(m.from,m.to));
 const t=m.id.startsWith('EXP')?null:tests(),p=probes(m.id);
 fs.writeFileSync(F,orig);
 rows.push({id:m.id,what:m.what,applied:true,tests:t,probes:{differ:p.differ??null,error:p.error??null,...(m.id.startsWith('EXP')?{cases:p.cases}:{})},killedByTests:t?t.fail>0:null,killedByProbes:(p.differ??[]).length>0});
 console.log(m.id,t?`tests fail ${t.fail}`:'',`probes differ ${JSON.stringify(p.differ??p.error)}`);
}
const restored=sha(fs.readFileSync(F))===sha(fs.readFileSync(path.join(src,'CoachingCore/src/r6-adaptation.mjs')));
fs.writeFileSync(out,JSON.stringify({probe:'QRE-R7D-P33-MUTATION-1',source:path.resolve(src),work,sourceSha256:sha(fs.readFileSync(path.join(src,'CoachingCore/src/r6-adaptation.mjs'))),restored,rows},null,1)+'\n');
console.log(JSON.stringify({restored,summary:rows.map(r=>[r.id,r.killedByTests,r.killedByProbes])}));
