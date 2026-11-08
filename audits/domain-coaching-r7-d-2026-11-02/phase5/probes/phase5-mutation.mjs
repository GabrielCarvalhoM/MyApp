// R7-D Phase 5 mutation evidence: every runtime hunk of the cycle, reverted or bent one at a time, must be killed by the CoachingCore suite; and
// the CQ4-1 mutants (the Phase 3.5 quality recheck's QF0, QF3, QF6, QF7), applied to the candidate, must be killed by T39-T41 now inside the suite
// (QRE-P4-K04), each by its own test. One full copy of the candidate's CoachingCore and the authority records it reads goes into a NEW directory
// (--work); each mutant's source is written into that copy, the suite runs, and the original bytes are written back and checked by hash (nothing is
// deleted; the repository is never written). A mutant is killed when a test that passes on the copy's baseline fails. Writes one JSON (--out).
//   node phase5-mutation.mjs --work <new dir> --out <file> [--only id,id]
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const work=arg('--work'),outFile=arg('--out'),only=arg('--only')?.split(',')??null;
if(!work||!outFile)throw Error('--work <new dir> --out <file>');if(fs.existsSync(work))throw Error('--work must be new');if(fs.existsSync(outFile))throw Error('--out exists');
const REPO=path.resolve(import.meta.dirname,'../../../..');
const RECORDS=['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const AD='CoachingCore/src/r6-adaptation.mjs',PR='CoachingCore/src/r6-program.mjs',CO='CoachingCore/src/r6-composition.mjs';
const e=(file,from,to)=>({file,from,to});
const MUTANTS=[
 {id:'P5-M1',what:'SSCTR-P4-F01 reverted at its source: a moderate or long return sets no returnEntry marker',...e(AD,"{...clone(strength),returnEntry:true,exercises:","{...clone(strength),exercises:")},
 {id:'P5-M2',what:'the planner ignores the marker: a week is an entry week only through an exercise in use at the entry step',...e(PR,"const entryWeek=ss.entryWeek===true||ss.returnEntry===true||[...inUse]","const entryWeek=ss.entryWeek===true||[...inUse]")},
 {id:'P5-M3',what:'the transition ignores the marker when the week states no entry flag (the evidence reducer\'s own reading)',...e(PR,"ss0.entryWeek:ss0.returnEntry===true||used.some(","ss0.entryWeek:used.some(")},
 {id:'P5-M4',what:'the marker never ends: every later week is a return-entry week',...e(PR,"if(ss.returnEntry===true&&used.some(x=>!x.practice&&ss.exercises[x.id]))delete ss.returnEntry;","if(false)delete ss.returnEntry;")},
 {id:'P5-M5',what:'the facts read at a later break (strengthAtBreak) also end the marker',...e(PR,"  if(evidenceMode&&log)facts[id]=executedDose(ex,log,on);\n }\n if(evidenceMode)ss.facts=facts;\n return ss;","  if(evidenceMode&&log)facts[id]=executedDose(ex,log,on);\n }\n endReturnEntry(ss,used);\n if(evidenceMode)ss.facts=facts;\n return ss;")},
 {id:'P5-M6',what:'R7D-FC-01 reverted: only a bodyweight log without a kilogram is evidence (band and assistance logs are not)',...e(AD,"!l.unitUnknown&&NO_KG_CONVENTIONS.includes(l.convention)","!l.unitUnknown&&l.convention==='BODYWEIGHT'")},
 {id:'P5-M7',what:'QRE-P4-F01 reverted: the credit reading never decides the question',...e(CO,"&&!creditDecides(ctx,next,fromWeek,{capped,sports,completedRuns,unknown}))return null;",")return null;")},
 {id:'P5-M8',what:'the credit reading also reads a start anchored on evidence (a return\'s entry, a review\'s week evidence), not only a projection',...e(CO,"if(next.weeks[fromWeek]?.startAuthority?.RUN?.provenance!==WEEK_START.CONDITIONAL_PLAN||st?.run?.mode!=='EASY'","if(st?.run?.mode!=='EASY'")},
 {id:'P5-M9',what:'rotation ignores the marker (a return whose exercises hold no return step yet rotates its slots)',...e(PR,"const returning=ss.returnEntry===true||Object.values(ss.exercises)","const returning=Object.values(ss.exercises)")},
 {id:'P5-M10',what:'the learning mode label of a return-entry week ignores the marker',...e(AD,"program.stateTrace[s.weekIndex]?.strength?.returnEntry===true||Object.values(","Object.values(")}
];
const {MUTANTS:M3}=await import('file:///'+path.join(REPO,'audits/domain-coaching-r7-d-2026-11-02/phase35/reviews/engineering/probes2/qre3-p35-mutants.mjs').replace(/\\/g,'/'));
const CQ41={QF3:['R7-D Phase 4 T39'],QF7:['R7-D Phase 4 T40'],QF6:['R7-D Phase 4 T41'],QF0:['R7-D Phase 4 T39','R7-D Phase 4 T40','R7-D Phase 4 T41']};
const sha=b=>createHash('sha256').update(b).digest('hex');
const short=t=>(t.match(/^R7-D Phase \d+ T\d+/)??[t])[0];
const run=(cc,files=[])=>new Promise(res=>{const p=spawn(process.execPath,['--test',...files],{cwd:cc});let out='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
 p.on('close',status=>res({status,tests:Number(out.match(/ℹ tests (\d+)/)?.[1]??NaN),pass:Number(out.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(out.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...out.matchAll(/^✖ (.*?) \(\d[\d.]*ms\)$/gm)].map(m=>m[1]))].filter(x=>x!=='failing tests:')}));});
fs.mkdirSync(work,{recursive:true});
for(const p of ['CoachingCore',...RECORDS]){const d=path.join(work,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(path.join(REPO,p),d,{recursive:true});}
const cc=path.join(work,'CoachingCore');
const results=[],baseline=await run(cc);results.push({id:'baseline',...baseline});
const baseFailed=new Set(baseline.failed);
const list=[...MUTANTS.filter(m=>!only||only.includes(m.id)).map(m=>({...m,kind:'PHASE5'})),...Object.keys(CQ41).filter(id=>!only||only.includes(id)).map(id=>{const m=M3.find(x=>x.id===id);return {id,what:m.what,file:AD,from:m.from,to:m.to,then:m.then,kind:'CQ41'};})];
for(const m of list){
 const f=path.join(work,m.file),orig=fs.readFileSync(f);let src=orig.toString('utf8');
 const edits=[[m.from,m.to],...(m.then?[m.then]:[])];let applied=true,occ=null;
 for(const [a,b] of edits){const n=src.split(a).length-1;if(n!==1){applied=false;occ=n;break;}src=src.replace(a,b);}
 if(!applied){results.push({id:m.id,what:m.what,kind:m.kind,applied:false,occurrences:occ});continue;}
 fs.writeFileSync(f,src);
 const t=m.kind==='CQ41'?await run(cc,['test/r7d-phase4-cq41.test.mjs']):await run(cc);
 fs.writeFileSync(f,orig);const restored=sha(fs.readFileSync(f))===sha(orig);
 const newFailures=t.failed.filter(x=>!baseFailed.has(x));
 const row={id:m.id,what:m.what,kind:m.kind,file:m.file,mutatedSha256:sha(Buffer.from(src)),tests:t.tests,pass:t.pass,fail:t.fail,newFailures,killed:newFailures.length>0,restored};
 if(m.kind==='CQ41'){row.failedShort=[...new Set(t.failed.map(short))].sort();row.expectedFailing=CQ41[m.id];row.killedAsExpected=JSON.stringify(row.failedShort)===JSON.stringify([...CQ41[m.id]].sort());}
 results.push(row);
}
const p5=results.filter(r=>r.kind==='PHASE5'),cq=results.filter(r=>r.kind==='CQ41');
const out={evidence:'R7D-PHASE5-MUTATION',mode:'FULL_SUITE on one full copy (sequential; original bytes restored and checked by hash)',source:{[AD]:sha(fs.readFileSync(path.join(REPO,AD))),[PR]:sha(fs.readFileSync(path.join(REPO,PR))),[CO]:sha(fs.readFileSync(path.join(REPO,CO)))},results,
 summary:{baseline:`${baseline.pass}/${baseline.tests}`,baselineFailing:baseline.failed,phase5:{mutants:p5.length,killed:p5.filter(r=>r.killed).length,survived:p5.filter(r=>r.applied!==false&&!r.killed).map(r=>r.id),notApplied:p5.filter(r=>r.applied===false).map(r=>r.id)},cq41:{mutants:cq.length,killedAsExpected:cq.filter(r=>r.killedAsExpected).length},allRestored:results.filter(r=>r.id!=='baseline'&&r.applied!==false).every(r=>r.restored)},ran:new Date().toISOString(),node:process.version};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify(out.summary,null,1));
