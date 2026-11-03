// R7-D Phase 3.1 engineering check: the instruments (R7D-HARNESS-3) against R7D-HARNESS-2 on the same runtime and runs.
//  1. PREREG-3 Δ5: P11/P12 units and violations under HARNESS-2 and HARNESS-3, on every case of the diagnostic corpus and the dev cases; and for
//     every schedule/equipment change whose own decision asked or refused, whether the adopted plan changed the schedule or the equipment (if it
//     never does, Δ5 only removes false FAILs of the "change not adopted" kind).
//  2. A constructed case: an equipment change that removes the barbell, carried with a break (asked), then the plain review that applies the break
//     (VALID); never sent again. HARNESS-2 P11 flags the barbell in the VALID plan; HARNESS-3 does not (the relaxation Δ5 makes).
//  3. P03/P10 on the new row: fire on a forged row, a rewritten row, a dropped row, a row with a wrong clock (declaredAt).
//  4. P17 and RESTATE_DECLARED_BREAK on wrapped runtimes: a runtime that applies a kept break twice (author mutant P31-M5), one that ignores a
//     newer declaration (P31-M6), one that drops the early-return record (QM31-07); which instrument, if any, notices.
//   node qe31-instruments.mjs --cand <root: CoachingCore + audits/domain-coaching-r7-d-2026-11-02 (HARNESS-3)> --h2 <root holding HARNESS-2>
//                            [--mutants <dir holding CoachingCore copies named by mutant id>] [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const cand=path.resolve(arg('--cand')),h2root=path.resolve(arg('--h2')),mutDir=arg('--mutants')?path.resolve(arg('--mutants')):null,outFile=arg('--out');
const AUD='audits/domain-coaching-r7-d-2026-11-02';
const imp=(r,p)=>import(pathToFileURL(path.join(r,p)).href);
const C3=await imp(cand,`${AUD}/harness/lib/client.mjs`),P3=await imp(cand,`${AUD}/harness/lib/properties.mjs`),M3=await imp(cand,`${AUD}/harness/lib/metamorphic.mjs`);
const P2=await imp(h2root,`${AUD}/harness/lib/properties.mjs`);
const rt=await C3.loadRuntime(path.join(cand,'CoachingCore'));
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cand,'CoachingCore/r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cand,'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const corpora={diagnostic:JSON.parse(fs.readFileSync(path.join(cand,`${AUD}/diagnostic/R7D_DIAGNOSTIC_CORPUS.json`),'utf8')),dev3:JSON.parse(fs.readFileSync(path.join(cand,`${AUD}/harness/validation/DEV_CASES_R7D_3.json`),'utf8'))};
const thaw=v=>JSON.parse(JSON.stringify(v)),PENDING=['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'];
const out={probe:'qe31-instruments',cand,h2root};

// ---------- 1. Δ5 on the existing corpora ----------
{
 const rows=[],refusedChanges=[];
 for(const [label,corpus] of Object.entries(corpora))for(const kase of corpus.cases){
  let t;try{t=C3.runCase(rt,kase);}catch(e){rows.push({label,caseId:kase.caseId,error:e.message});continue;}
  const a=P2.evaluateProperties(t,ctx),b=P3.evaluateProperties(t,ctx);
  for(const k of ['P11','P12']){const x=a[k],y=b[k];if(x.units!==y.units||x.violations.length!==y.violations.length)rows.push({label,caseId:kase.caseId,property:k,h2:{units:x.units,violations:x.violations.length,issues:[...new Set(x.violations.map(v=>v.issue))]},h3:{units:y.units,violations:y.violations.length}});}
  for(const s of t.steps)if(['SCHEDULE_CHANGE','DOUBLE_CONFLICT','EQUIPMENT_CHANGE'].includes(s.kind)&&PENDING.includes(s.result.status)){
   const sch=p=>JSON.stringify(p.schedule??null),eq=p=>JSON.stringify(p.canonical?.athlete?.equipment??null);
   refusedChanges.push({label,caseId:kase.caseId,stepId:s.stepId,kind:s.kind,status:s.result.status,adopted:s.adopted,scheduleChanged:sch(s.planBefore)!==sch(s.planAfter),equipmentChanged:eq(s.planBefore)!==eq(s.planAfter)});
  }
 }
 out.delta5={casesWhereP11orP12Differ:rows,refusedChanges,anyRefusedChangeAdopted:refusedChanges.some(r=>r.scheduleChanged||r.equipmentChanged)};
}

// ---------- 2. Constructed: an equipment change carried with a break, never sent again ----------
{
 const base=corpora.dev3.cases.find(c=>c.caseId==='DEV-18');
 const kase=thaw(base);kase.caseId='QE31-EQ';
 const s=kase.timeline.find(x=>x.stepId==='w5d1');s.event={...s.event,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BANDS']}};
 const t=C3.runCase(rt,kase),a=P2.evaluateProperties(t,ctx),b=P3.evaluateProperties(t,ctx);
 const st=t.steps.map(x=>({stepId:x.stepId,kind:x.kind,status:x.result.status,action:x.result.action,validity:x.result.planValidity?.status}));
 const barbellAhead=x=>x.planAfter.weeks.flatMap(w=>w.sessions).filter(v=>v.prescription&&v.status!=='SKIPPED'&&v.date>=x.asOfLocal&&v.sport==='STRENGTH').flatMap(v=>v.prescription.exercises.map(e=>e.id)).filter(id=>/barbell|back-squat|deadlift|bench-press/.test(id));
 out.equipmentCarriedWithBreak={steps:st,barbellExercisesInPlanAfterReturn:[...new Set(barbellAhead(t.steps.find(x=>x.stepId==='w5d2')))].slice(0,6),
  h2P11:{result:a.P11.result,violations:a.P11.violations.length,issues:[...new Set(a.P11.violations.map(v=>v.issue))],at:[...new Set(a.P11.violations.map(v=>v.at))]},
  h3P11:{result:b.P11.result,violations:b.P11.violations.length},h3P17:{result:b.P17.result,units:b.P17.units,violations:b.P17.violations.length}};
}

// ---------- 3. P03/P10 fire on constructed violations of the new row ----------
{
 const kase=corpora.dev3.cases.find(c=>c.caseId==='DEV-18'),t0=C3.runCase(rt,kase);
 const iDecl=t0.steps.findIndex(s=>(s.result.actualLedger??[]).some(r=>r.fact==='INTERRUPTION_DECLARED'));
 const muts={
  forgedRow:t=>{const s=t.steps[iDecl];const row=thaw(s.result.actualLedger.find(r=>r.fact==='INTERRUPTION_DECLARED'));s.result={...s.result,actualLedger:[...s.result.actualLedger,{...row,eventId:'forged'}]};},
  rewrittenFacts:t=>{const s=t.steps[iDecl+1];s.result={...s.result,actualLedger:s.result.actualLedger.map(r=>r.fact==='INTERRUPTION_DECLARED'?{...thaw(r),interruption:{...r.interruption,days:3}}:r)};},
  rewrittenClock:t=>{const s=t.steps[iDecl+1];s.result={...s.result,actualLedger:s.result.actualLedger.map(r=>r.fact==='INTERRUPTION_DECLARED'?{...thaw(r),declaredAt:'2026-12-31T00:00:00.000Z'}:r)};},
  dropped:t=>{const s=t.steps[iDecl+1];s.result={...s.result,actualLedger:s.result.actualLedger.filter(r=>r.fact!=='INTERRUPTION_DECLARED')};},
  wrongClockAtRecording:t=>{const s=t.steps[iDecl];s.result={...s.result,actualLedger:s.result.actualLedger.map(r=>r.fact==='INTERRUPTION_DECLARED'?{...thaw(r),declaredAt:'2026-12-31T00:00:00.000Z',provenance:{firstRecordedAt:'2026-12-31T00:00:00.000Z'}}:r)};},
  wrongAthleteAtRecording:t=>{const s=t.steps[iDecl];s.result={...s.result,actualLedger:s.result.actualLedger.map(r=>r.fact==='INTERRUPTION_DECLARED'?{...thaw(r),athleteId:'someone-else'}:r)};}
 };
 const res={declaringStep:t0.steps[iDecl]?.stepId??null};
 for(const [k,m] of Object.entries(muts)){
  const t={...t0,steps:t0.steps.map(s=>({...s}))};m(t);const p=P3.evaluateProperties(t,ctx);
  res[k]={P03:p.P03.violations.filter(v=>v.fact==='INTERRUPTION_DECLARED'||v.eventId==='forged').length,P10:p.P10.violations.length,P10issues:[...new Set(p.P10.violations.map(v=>v.issue))]};
 }
 out.p03p10=res;
}

// ---------- 4. P17 / RESTATE on mutated runtimes (directed-test survivors and author mutants) ----------
if(mutDir){
 const res={};
 for(const id of fs.readdirSync(mutDir)){
  const r=await C3.loadRuntime(path.join(mutDir,id,'CoachingCore')),fails=[];
  for(const kase of corpora.dev3.cases.filter(c=>/^DEV-(1[7-9]|2[01])/.test(c.caseId))){
   const t=C3.runCase(r,kase),p=P3.evaluateProperties(t,ctx),rel=M3.runRelations(r,kase,t,ctx,{only:['RESTATE_DECLARED_BREAK','CARRIER_CLINICAL','RESEND','DETERMINISM']});
   const f=[...Object.values(p).filter(x=>x.result==='FAIL').map(x=>x.id+':'+[...new Set(x.violations.map(v=>v.issue??'V'))].join('/')),...Object.entries(rel).filter(([,v])=>(v.violations??[]).length).map(([k])=>k)];
   if(f.length)fails.push({caseId:kase.caseId,fails:f});
  }
  res[id]={detected:fails.length>0,fails};
 }
 out.mutantsUnderHarness=res;
}
const text=JSON.stringify(out,null,1);if(outFile)fs.writeFileSync(outFile,text+'\n');console.log(text);
