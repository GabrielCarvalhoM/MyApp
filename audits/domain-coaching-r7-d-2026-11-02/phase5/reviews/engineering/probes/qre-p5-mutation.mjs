// QRE-R7D-PHASE5-REVIEW-r1: independent mutation run on the Phase 5 candidate (c7c72e5). It re-applies the author's ten runtime mutants (read from
// phase5/probes/phase5-mutation.mjs by text, not imported, so the author's probe never runs) and the judge's own extra mutants, plus the CQ4-1 mutants
// QF0/QF3/QF6/QF7 against T39-T41. Source: a copy of the candidate CoachingCore (+ the authority records it reads) already extracted with
// `git archive c7c72e5` into --src (never the repository). Each worker copies --src into a NEW directory (--work), writes a mutant, runs the suite,
// restores the original bytes and checks them by hash. Nothing is deleted. A mutant is killed when a test passing on the copy's baseline fails.
//   node qre-p5-mutation.mjs --src <extracted candidate root> --work <new dir> --out <new file> [--only id,id] [--quick]
// --quick: run first the directed/legacy files that read these paths; only a survivor of the quick run is run against the whole suite.
import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const src=arg('--src'),work=arg('--work'),outFile=arg('--out'),only=arg('--only')?.split(',')??null,quick=process.argv.includes('--quick');
if(!src||!work||!outFile)throw Error('--src --work --out');if(fs.existsSync(work))throw Error('--work must be new');if(fs.existsSync(outFile))throw Error('--out exists');
const AD='CoachingCore/src/r6-adaptation.mjs',PR='CoachingCore/src/r6-program.mjs',CO='CoachingCore/src/r6-composition.mjs';
const e=(id,what,file,from,to)=>({id,what,file,from,to,kind:'JUDGE'});
// The author's ten, parsed from their probe's source text (same from/to strings).
const authorSrc=fs.readFileSync(path.resolve(import.meta.dirname,'../../../probes/phase5-mutation.mjs'),'utf8');
const body=authorSrc.slice(authorSrc.indexOf('const MUTANTS=['),authorSrc.indexOf('\n];',authorSrc.indexOf('const MUTANTS=['))+3);
const AUTHOR=new Function('AD','PR','CO','e',body.replace('const MUTANTS=','return '))(AD,PR,CO,(file,from,to)=>({file,from,to})).map(m=>({...m,kind:'AUTHOR'}));
const JUDGE=[
 e('J1','a SHORT return also sets the returnEntry marker',AD,"cls==='SHORT'?clone(strength):","cls==='SHORT'?{...clone(strength),returnEntry:true}:"),
 e('J2','only a LONG return sets the marker (a MODERATE one does not)',AD,"{...clone(strength),returnEntry:true,exercises:","{...clone(strength),returnEntry:cls==='LONG',exercises:"),
 e('J3','the marker ends at any strength exposure, with or without a state (practice rows included)',PR,"if(ss.returnEntry===true&&used.some(x=>!x.practice&&ss.exercises[x.id]))","if(ss.returnEntry===true&&used.length)"),
 e('J4','a practice row with a state also ends the marker',PR,"used.some(x=>!x.practice&&ss.exercises[x.id]))delete ss.returnEntry","used.some(x=>ss.exercises[x.id]))delete ss.returnEntry"),
 e('J5','creditDecides reads a projection held in any run mode',CO,"||st?.run?.mode!=='EASY'||!st.strength)return false;","||!st?.strength)return false;"),
 e('J6','creditDecides asks also when the credit reading plans a run of equal length',CO,"capped.get(s.id)<runMinutesOf(s));","capped.get(s.id)<=runMinutesOf(s));"),
 e('J7','creditDecides counts none of the unreported runs (the credit reading reads only the completed runs)',CO,"const counted=[...completedRuns,...unknown.map(s=>({date:s.date,minutes:runMinutesOf(s)})).filter(x=>x.minutes>0)];","const counted=[...completedRuns];"),
 e('J8','creditDecides compares sessions absent from the capped week (a session id only the credit reading plans)',CO,"s.prescription&&capped.has(s.id)&&capped.get(s.id)<runMinutesOf(s)","s.prescription&&(capped.get(s.id)??0)<runMinutesOf(s)"),
 e('J9','loggedLoads: a no-kilogram log with an unknown unit is evidence too',AD,"||!l.unitUnknown&&NO_KG_CONVENTIONS.includes(l.convention))","||NO_KG_CONVENTIONS.includes(l.convention))"),
 e('J10','creditDecides reads the projection start from the strength state of the week after',CO,"start:{runState:st.run,strengthState:st.strength}","start:{runState:st.run,strengthState:next.stateTrace[fromWeek+1]?.strength??st.strength}"),
 e('J11','the planner reads the marker but buildWeek drops the RIR floor: a marker week is not an entry week only in the transition',PR,"entryWeekOf=(ss0,used)=>typeof ss0.entryWeek==='boolean'?ss0.entryWeek:ss0.returnEntry===true||","entryWeekOf=(ss0,used)=>ss0.returnEntry===true||(typeof ss0.entryWeek==='boolean'?ss0.entryWeek:false)||"),
 e('J12','creditDecides compares against the uncapped (free) week instead of the capped one (credit reading vs the zero reading uncapped)',CO,"&&!creditDecides(ctx,next,fromWeek,{capped,sports,completedRuns,unknown}))return null;","&&!creditDecides(ctx,next,fromWeek,{capped:uncapped,sports,completedRuns,unknown}))return null;")
];
const M3src=fs.readFileSync(path.resolve(import.meta.dirname,'../../../../phase35/reviews/engineering/probes2/qre3-p35-mutants.mjs'),'utf8');
const {MUTANTS:M3}=await import('file:///'+path.resolve(import.meta.dirname,'../../../../phase35/reviews/engineering/probes2/qre3-p35-mutants.mjs').replace(/\\/g,'/'));
const CQ41={QF3:['R7-D Phase 4 T39'],QF7:['R7-D Phase 4 T40'],QF6:['R7-D Phase 4 T41'],QF0:['R7-D Phase 4 T39','R7-D Phase 4 T40','R7-D Phase 4 T41']};
const CQ=Object.keys(CQ41).map(id=>{const m=M3.find(x=>x.id===id);return {id,what:m.what,file:AD,from:m.from,to:m.to,then:m.then,kind:'CQ41'};});
const sha=b=>createHash('sha256').update(b).digest('hex'),short=t=>(t.match(/^R7-D Phase \d+ T\d+/)??[t])[0];
const QUICK=['test/r7d-phase5.test.mjs','test/r6-adaptation.test.mjs','test/r7d-phase4-cq41.test.mjs'];
const run=(cc,files=[])=>new Promise(res=>{const p=spawn(process.execPath,['--test',...files],{cwd:cc});let out='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
 p.on('close',status=>res({status,tests:Number(out.match(/ℹ tests (\d+)/)?.[1]??NaN),pass:Number(out.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(out.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...out.matchAll(/^✖ (.*?) \(\d[\d.]*ms\)$/gm)].map(m=>m[1]))].filter(x=>x!=='failing tests:'),err:status&&isNaN(Number(out.match(/ℹ tests (\d+)/)?.[1]))?out.slice(-600):undefined}));});
fs.mkdirSync(work,{recursive:true});
for(const p of fs.readdirSync(src))fs.cpSync(path.join(src,p),path.join(work,p),{recursive:true});
const cc=path.join(work,'CoachingCore');
const list=[...AUTHOR,...JUDGE,...CQ].filter(m=>!only||only.includes(m.id));
const results=[],baseline=await run(cc);results.push({id:'baseline',...baseline});const baseFailed=new Set(baseline.failed);
for(const m of list){
 const f=path.join(work,m.file),orig=fs.readFileSync(f);let s=orig.toString('utf8');let ok=true,occ=null;
 for(const [a,b] of [[m.from,m.to],...(m.then?[m.then]:[])]){const n=s.split(a).length-1;if(n!==1){ok=false;occ=n;break;}s=s.replace(a,b);}
 if(!ok){results.push({id:m.id,kind:m.kind,what:m.what,applied:false,occurrences:occ});continue;}
 fs.writeFileSync(f,s);
 let t,scope;
 if(m.kind==='CQ41'){t=await run(cc,['test/r7d-phase4-cq41.test.mjs']);scope='cq41';}
 else if(quick){t=await run(cc,QUICK);scope='quick';if(!t.failed.some(x=>!baseFailed.has(x))){t=await run(cc);scope='full';}}
 else{t=await run(cc);scope='full';}
 fs.writeFileSync(f,orig);const restored=sha(fs.readFileSync(f))===sha(orig);
 const nf=t.failed.filter(x=>!baseFailed.has(x));
 const row={id:m.id,kind:m.kind,what:m.what,file:m.file,scope,tests:t.tests,pass:t.pass,fail:t.fail,newFailures:nf.map(x=>x.slice(0,90)),killed:nf.length>0||(t.status!==0&&isNaN(t.tests)),restored,...(t.err?{err:t.err}:{})};
 if(m.kind==='CQ41'){row.failedShort=[...new Set(t.failed.map(short))].sort();row.killedAsExpected=JSON.stringify(row.failedShort)===JSON.stringify([...CQ41[m.id]].sort());}
 results.push(row);console.error(m.id,row.killed,scope,row.newFailures.slice(0,3).join(' | '));
}
const out={probe:'QRE-P5-MUTATION-1',src,results,summary:{baseline:`${baseline.pass}/${baseline.tests}`,survived:results.filter(r=>r.id!=='baseline'&&r.applied!==false&&!r.killed).map(r=>r.id),notApplied:results.filter(r=>r.applied===false).map(r=>r.id),allRestored:results.filter(r=>r.id!=='baseline'&&r.applied!==false).every(r=>r.restored)},ran:new Date().toISOString(),node:process.version};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});console.log(JSON.stringify(out.summary));
