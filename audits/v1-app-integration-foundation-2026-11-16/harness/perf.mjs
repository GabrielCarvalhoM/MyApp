// Laboratory measurements of the headless client over the real composed engine (mission §6, "Performance do fluxo").
// These are Node.js numbers on the development machine. They are NOT iPhone numbers. Two modes:
//   default   V8 with its JIT (an upper bound on speed: no iOS JavaScript engine embedded in an app runs this fast)
//   --jitless V8 interpreter only (the closest proxy available here for JavaScriptCore inside an app, which runs without JIT on iOS)
// Run: node audits/v1-app-integration-foundation-2026-11-16/harness/perf.mjs   (writes results/perf.json; takes a few minutes)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url)),OUT=path.join(HERE,'..','results'),SELF=fileURLToPath(import.meta.url);
const q=(xs,p)=>{if(!xs.length)return null;const s=[...xs].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.ceil(p*s.length)-1)];};
const stats=xs=>({n:xs.length,median:q(xs,0.5),p95:q(xs,0.95),max:xs.length?Math.max(...xs):null});
const r1=x=>x===null?null:Math.round(x*10)/10;
const round=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,typeof v==='number'?r1(v):v]));

async function child(task){
 const t0=performance.now();
 const L=await import('./lib.mjs'),Sc=await import('./scenario.mjs');
 const importMs=performance.now()-t0;
 if(task==='cold'){const t1=performance.now(),c=L.createClient();c.onboard(Sc.athleteA());const genMs=performance.now()-t1;
  const f=Sc.weekFacts(c.envelope,0),t2=performance.now();c.review('WEEKLY_REVIEW',f.asOf,f.facts);const evalMs=performance.now()-t2;
  return {bootToScriptMs:t0,importMs,firstGenerateMs:genMs,firstEvaluateMs:evalMs,rssMB:process.memoryUsage().rss/2**20};}
 // The long history: three consecutive 16-week hybrid plans (48 weeks), a mid-week report and a Sunday review each week, the record carried.
 const reviews=[],plans=[];let restartRefused=null,snap=null;let peakRss=0;const mem=()=>{const m=process.memoryUsage();peakRss=Math.max(peakRss,m.rss);return m;};
 const c=L.createClient({onMeasure:(op,x)=>{const m=mem();reviews.push({op,ms:x.ms,status:x.status??null,rows:x.ledgerRows??null,inBytes:x.inputBytes??null,outBytes:x.answerBytes,heapMB:m.heapUsed/2**20});}});
 c.onboard(Sc.athleteA({weeks:16}));plans.push(c.envelope.program.startDate);
 const ser=[],views=[];
 for(let plan=0;plan<3;plan++){
  for(let w=0;w<16;w++){
   const live=Sc.liveSessions(c.envelope,w),onRecord=Sc.reportedInPlan(c.envelope),first=live.find(s=>!onRecord.has(s.id));
   if(first&&first.date<Sc.addDays(c.envelope.program.startDate,w*7+6))c.review('WEEKLY_REVIEW',Sc.at(first.date),{eligibility:Sc.ELIG(first.date),observations:[Sc.reportOf(c.envelope,first,{tag:`p${plan}`})]});
   const f=Sc.weekFacts(c.envelope,w,{tag:`p${plan}`});if(plan===0&&w===15)snap={env:structuredClone(c.envelope),f};c.review('WEEKLY_REVIEW',f.asOf,f.facts);
   if(w%4===3){const t0=performance.now(),text=JSON.stringify(c.envelope),t1=performance.now();JSON.parse(text);const t2=performance.now();
    ser.push({rows:c.envelope.actualLedger.length,envelopeBytes:Buffer.byteLength(text),stringifyMs:t1-t0,parseMs:t2-t1});
    const nowMs=Date.parse(Sc.at(Sc.addDays(c.envelope.program.startDate,w*7+6),'21:00')),v0=performance.now();L.todayView(c.envelope,{nowMs});L.weekView(c.envelope,{nowMs});L.insightsView(c.envelope);views.push({rows:c.envelope.actualLedger.length,ms:performance.now()-v0});}
  }
  if(plan<2){const start=Sc.addDays(c.envelope.program.startDate,16*7+7),day=Sc.addDays(start,-6),i=Sc.athleteA({weeks:16});
   i.asOf=day;i.startDate=start;i.athlete.eligibility=Sc.ELIG(day);i.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:1};i.athlete.goals.run={kind:'RACE',event:{kind:'10K',date:Sc.addDays(start,16*7-1)}};
   const r=c.restart(i,Sc.at(day,'10:00'));if(r.status!=='PROPOSED'){restartRefused={afterPlan:plan,status:r.status,reason:r.reason};break;}plans.push(c.envelope.program.startDate);}
 }
 // Warm latency of one fixed review (the last Sunday of the first plan, its whole record carried), repeated on the same state; and the heap that
 // state retains after a forced collection (--expose-gc), against the heap right after one such review.
 const warm=[];let retained=null,afterReview=null;
 for(let k=0;k<15;k++){const cc=L.createClient({envelope:snap.env}),t0=performance.now(),r=cc.review('WEEKLY_REVIEW',snap.f.asOf,snap.f.facts);warm.push(performance.now()-t0);if(r.status==='UNSUPPORTED')return {error:'warm review UNSUPPORTED'};
  if(k===14&&globalThis.gc){afterReview=process.memoryUsage().heapUsed/2**20;globalThis.gc();retained=process.memoryUsage().heapUsed/2**20;}}
 const statuses={};for(const d of c.envelope.decisions)statuses[d.status]=(statuses[d.status]??0)+1;
 return {importMs,plans,restartRefused,reviews,serialization:ser,views,warmReviewAtFullPlan:warm,heapAfterReviewMB:afterReview,heapRetainedAfterGcMB:retained,statuses,peakRssMB:peakRss/2**20,finalRows:c.envelope.actualLedger.length,finalEnvelopeBytes:Buffer.byteLength(JSON.stringify(c.envelope))};
}

if(process.argv[2]==='--child'){console.log(JSON.stringify(await child(process.argv[3])));process.exit(0);}

const run=(flags,task)=>JSON.parse(execFileSync(process.execPath,[...flags,'--expose-gc',SELF,'--child',task],{encoding:'utf8',maxBuffer:64*2**20}).trim().split('\n').at(-1));
const modes={default:[],jitless:['--jitless']},out={note:'Laboratory measurements on Node.js. Not iPhone measurements. --jitless is a proxy for an interpreter-only engine, not JavaScriptCore itself.',
 machine:{node:process.version,platform:`${os.platform()} ${os.release()}`,cpu:os.cpus()[0]?.model,cores:os.cpus().length,memGB:Math.round(os.totalmem()/2**30)},modes:{}};
for(const [name,flags] of Object.entries(modes)){
 const cold=Array.from({length:5},()=>run(flags,'cold')),long=run(flags,'long');
 if(long.error){out.modes[name]={error:long.error,missing:long.missing};continue;}
 const allEv=long.reviews.filter(r=>r.op==='evaluate'),ev=allEv.filter(r=>r.status!=='UNSUPPORTED'),byRows=b=>ev.filter(r=>r.rows>=b[0]&&r.rows<b[1]).map(r=>r.ms);
 out.modes[name]={
  coldStart:{bootToScriptMs:stats(cold.map(x=>x.bootToScriptMs)),importMs:stats(cold.map(x=>x.importMs)),firstGenerateMs:stats(cold.map(x=>x.firstGenerateMs)),firstEvaluateMs:stats(cold.map(x=>x.firstEvaluateMs)),rssMB:stats(cold.map(x=>x.rssMB))},
  generateMs:stats(long.reviews.filter(r=>r.op==='generate').map(r=>r.ms)),restartMs:stats(long.reviews.filter(r=>r.op==='restart').map(r=>r.ms)),
  evaluateMs:{all:stats(ev.map(r=>r.ms)),rows0to60:stats(byRows([0,60])),rows60to150:stats(byRows([60,150])),rows150up:stats(byRows([150,1e9]))},
  warmReviewAtFullPlanMs:stats(long.warmReviewAtFullPlan),
  bytes:{inputMedian:q(ev.map(r=>r.inBytes),0.5),inputMax:Math.max(...ev.map(r=>r.inBytes)),answerMedian:q(ev.map(r=>r.outBytes),0.5),answerMax:Math.max(...ev.map(r=>r.outBytes))},
  serialization:long.serialization.map(round),projectionsMs:long.views.map(round),
  memory:{peakRssMB:long.peakRssMB,heapMBMaxObserved:Math.max(...long.reviews.map(r=>r.heapMB)),heapAfterReviewMB:long.heapAfterReviewMB,heapRetainedAfterGcMB:long.heapRetainedAfterGcMB},
  history:{reviews:allEv.length,excludedFromLatency:{status:'UNSUPPORTED',count:allEv.length-ev.length,why:'authority expiry (R7B0 records review_by 2027-04-30): fail-closed answers are not decision latency'},plans:long.plans,restartRefused:long.restartRefused,finalRows:long.finalRows,finalEnvelopeBytes:long.finalEnvelopeBytes,statuses:long.statuses},
  series:ev.map(r=>[r.rows,r1(r.ms)])};
 for(const k of ['coldStart','evaluateMs'])for(const [kk,v] of Object.entries(out.modes[name][k]))out.modes[name][k][kk]=round(v);
 for(const k of ['generateMs','restartMs','warmReviewAtFullPlanMs'])out.modes[name][k]=round(out.modes[name][k]);
 out.modes[name].memory=round(out.modes[name].memory);
}
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'perf.json'),JSON.stringify(out,null,1)+'\n');
for(const [name,m] of Object.entries(out.modes)){if(m.error){console.log(name,m.error,m.missing);continue;}
 console.log(`${name}: import ${m.coldStart.importMs.median} ms, first generate ${m.coldStart.firstGenerateMs.median} ms, evaluate median ${m.evaluateMs.all.median} / p95 ${m.evaluateMs.all.p95} / max ${m.evaluateMs.all.max} ms, warm@full-plan ${m.warmReviewAtFullPlanMs.median} ms, retained heap ${m.memory.heapRetainedAfterGcMB} MB, peak RSS ${m.memory.peakRssMB} MB, rows ${m.history.finalRows}, envelope ${m.history.finalEnvelopeBytes} B`);}
