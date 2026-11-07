// SSCTR R7-D Phase 3.5 narrow recheck r2 (REVIEW_REQUEST_PHASE35_R2.md section 3, SSCTR question 2: SSCTR-P35-F01), written by the fresh SSCTR
// instance of SSCTR-R7D-P35-RECHECK-r2. It runs the development cases named below (DEV_CASES_R7D_7, contaminated by construction: engineering
// evidence for a domain recheck only, never gate, quality or generalization evidence) through the harness client of one harness root on each runtime
// root given, evaluates the harness properties of that harness root, and rebuilds witness W-P18j (run-validation.mjs) on the first runtime. It also
// checks adverseConvergence (P18(e)) against the runtime's own classifier (r6-learning classify, r6-adaptation kindOf) on every combination of the
// response fields, for complete, partial and confounded reports. Read-only: it writes no file. Run it on scratch roots, never on the repository:
//   node p35-recheck2-harness.mjs --harness <root holding the audit folder's harness lib> --dev <DEV_CASES_R7D_7.json> --run <label>=<root> [...]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2),arg=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const hroot=path.resolve(arg('--harness')),runs=args.flatMap((a,i)=>a==='--run'?[args[i+1]]:[]).map(s=>{const [l,...r]=s.split('=');return {label:l,root:path.resolve(r.join('='))};});
const lib=f=>import(pathToFileURL(path.join(hroot,'audits/domain-coaching-r7-d-2026-11-02/harness/lib',f)).href);
const {loadRuntime,runCase}=await lib('client.mjs'),P=await lib('properties.mjs');
const dev=JSON.parse(fs.readFileSync(path.resolve(arg('--dev')),'utf8')),byId=new Map(dev.cases.map(c=>[c.caseId,c]));
const CASES=['DEV-48','DEV-53','DEV-54','DEV-55','DEV-56','DEV-57'];
const out={harnessRoot:path.basename(path.dirname(hroot))+'/'+path.basename(hroot),devCorpus:dev.corpusRevision,cases:CASES,runs:[]};
const ctxOf=root=>({policy:JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))});
const fails=props=>Object.values(props).filter(p=>p.result==='FAIL').map(p=>({property:p.id,issues:[...new Set(p.violations.map(v=>v.issue??'VIOLATION'))],n:p.violations.length}));
const lastRet=trace=>{const s=[...trace.steps].reverse().find(t=>P.appliesReturn(t));const d=s?(s.result.proposal?.decisions??[]).filter(x=>x.action==='REESTABLISH').at(-1)?.interruption:null;
 return d?{at:s.stepId,stop:`${d.class} ${d.days}d ${d.startDate}..${d.endDate}`,relation:`${d.relation}/${d.basis}`,breaks:(d.separateBreaks??null)?.map(b=>`${String(b.episode).split('-').at(-1)}:${b.stop}${b.reentryWeek?' reentry '+b.reentryWeek:''}${b.ownReturn?' reentered RUN '+b.ownReturn.reentered.RUN+' STRENGTH '+b.ownReturn.reentered.STRENGTH:''}`)??null}:null;};
let first=null;
for(const r of runs){
 const rt=await loadRuntime(path.join(r.root,'CoachingCore')),ctx=ctxOf(r.root),rows=[];
 for(const id of CASES){const t=runCase(rt,byId.get(id)),p=P.evaluateProperties(t,ctx);
  rows.push({caseId:id,steps:t.steps.length,stopped:t.stopped??null,lastReturn:lastRet(t),fails:fails(p),P18:{result:p.P18.result,units:p.P18.units,notEvaluable:p.P18.notEvaluable.length},P17:{result:p.P17.result,units:p.P17.units}});
  if(!first&&id==='DEV-48')first={rt,ctx,t};}
 out.runs.push({label:r.label,cases:rows});
}
// W-P18j (run-validation.mjs, verbatim mutation) on the first runtime's DEV-48 trace.
if(first){const thaw=v=>JSON.parse(JSON.stringify(v)),t={...first.t,steps:first.t.steps.map(s=>({...s}))},s=t.steps.find(x=>x.stepId==='plain'),p=thaw(s.planAfter),d=p.decisions.findLast(x=>x.action==='REESTABLISH'),wk=p.weeks[7].startDate;
 Object.assign(d.interruption,{startDate:'2026-12-28',endDate:'2026-12-31',days:4,class:'SHORT'});d.interruption.separateBreaks=d.interruption.separateBreaks.map(b=>b.stop==='LATEST'?b:{...b,stop:'OWN_RETURN',ownReturn:{class:'MODERATE',days:14,startDate:b.startDate,endDate:b.endDate,returnDay:wk,reentered:{RUN:wk,STRENGTH:null}}});s.planAfter=p;s.adopted=true;
 const pr=P.evaluateProperties(t,first.ctx);out.witness_W_P18j={on:runs[0].label,fired:pr.P18.violations.some(v=>v.issue==='SYSTEMIC_WEEK_REENTERED'),issues:[...new Set(pr.P18.violations.map(v=>v.issue))]};}
// adverseConvergence against the runtime's classifier: one live session per sport, each with the same report; complete (actual.completed true,
// partial false), partial (completed true, partial true) or not completed; confounded or not. ADVERSE per the reducer = kindOf(o)==='ADVERSE' with
// recovery ADVERSE (P18(e) reads recovery ADVERSE only, by design a necessary condition).
{const L=await import(pathToFileURL(path.join(runs[0].root,'CoachingCore/src/r6-learning.mjs')).href);
 const kindOf=o=>o.partial?'PARTIAL':o.confounded?(o.response?.recovery==='ADVERSE'||o.response?.nextDayFunction==='IMPAIRED'?'ADVERSE':'CONFOUNDED'):L.classify(o);
 const V={performance:['OVER','COMPATIBLE','UNDER',undefined],effort:['EASIER','ON_TARGET','HARDER',undefined],nextDayFunction:['NORMAL','IMPAIRED',undefined]},rows=[];
 for(const performance of V.performance)for(const effort of V.effort)for(const nextDayFunction of V.nextDayFunction)for(const shape of ['complete','partial','notCompleted'])for(const confounded of [false,true]){
  const o={sessionId:'s',actual:{completed:shape!=='notCompleted'},partial:shape!=='complete',confounded,response:{recovery:'ADVERSE',performance,effort,nextDayFunction},observedAt:'2026-01-01T00:00:00Z'};
  const week={sessions:[{id:'s',sport:'RUN',prescription:{},status:'PLANNED'},{id:'t',sport:'STRENGTH',prescription:{},status:'PLANNED'}]},ledger=[o,{...o,sessionId:'t'}];
  const reducerAdverse=kindOf(o)==='ADVERSE',harness=P.adverseConvergence(week,ledger,'2026-02-01T00:00:00Z');
  rows.push({performance:performance??null,effort:effort??null,nextDayFunction:nextDayFunction??null,shape,confounded,kind:kindOf(o),reducerAdverse,harness});}
 out.adverseConvergenceVsReducer={combinations:rows.length,harnessTrueWhileReducerNotAdverse:rows.filter(r=>r.harness&&!r.reducerAdverse),reducerAdverseWhileHarnessFalse:rows.filter(r=>r.reducerAdverse&&!r.harness).length,
  note:'The second count is expected to be non-zero only for reports the reducer reads ADVERSE for a reason other than recovery ADVERSE alone; every row here has recovery ADVERSE, so it must be zero for P18(e) to equal the reducer on recovery-ADVERSE reports.'};}
console.log(JSON.stringify(out,null,1));
