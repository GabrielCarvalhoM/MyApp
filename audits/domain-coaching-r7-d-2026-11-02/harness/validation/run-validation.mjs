// R7-D harness validation (Phase 1 plan: "sem falso bloqueio no FREEZE-4; sensibilidade nos freezes superados; oráculo sem testemunha =
// TEST_GAP"). Development cases only (build-dev-cases.mjs): contaminated by construction, never diagnostic or fresh evidence.
//   node run-validation.mjs --dev <dev-cases.json> --out <file> --f4 <repo root> [--f3 <root>] [--b2 <root>] [--prer7a <root>]
// Superseded runtimes are rebuilt outside the repository (see HARNESS_VALIDATION.md for the exact git archive / copy commands).
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../lib/client.mjs';
import {evaluateProperties} from '../lib/properties.mjs';
import {runRelations} from '../lib/metamorphic.mjs';
import {verifyRuntime} from '../r7d-harness.mjs';
import {digestOf} from '../lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const dev=JSON.parse(fs.readFileSync(arg('--dev'),'utf8')),byId=new Map(dev.cases.map(c=>[c.caseId,c]));
const out={validation:'R7D-HARNESS-VALIDATION-1',devCorpusSha256:digestOf(dev),runs:[],witnesses:[]};

async function ctxFor(root,record){
 const cc=path.join(root,'CoachingCore');
 const rt=await loadRuntime(cc);
 const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8'));
 const catalogPath=path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json');
 const catalog=JSON.parse(fs.readFileSync(fs.existsSync(catalogPath)?catalogPath:path.join(arg('--f4'),'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'));
 return {rt,ctx:{policy,catalog},runtime:record?verifyRuntime(root,record):null};
}
function evaluate(rt,ctx,kase,relations=true){
 const base=runCase(rt,kase),properties=evaluateProperties(base,ctx),rel=relations?runRelations(rt,kase,base,ctx):{};
 return {base,properties,relations:rel,fails:[...Object.values(properties).filter(p=>p.result==='FAIL').map(p=>({property:p.id,issues:[...new Set(p.violations.map(v=>v.issue??'VIOLATION'))],n:p.violations.length})),...Object.entries(rel).filter(([,r])=>(r.violations??[]).length).map(([k,r])=>({relation:k,n:r.violations.length,issues:[...new Set(r.violations.map(v=>v.issue))]}))],differences:Object.entries(rel).filter(([,r])=>(r.differences??[]).length).map(([k])=>k)};
}
// ---------- 1. FREEZE-4: no false block on the development cases ----------
const f4root=arg('--f4'),F4=await ctxFor(f4root,path.join(f4root,'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json'));
const f4=[];for(const c of dev.cases){const e=evaluate(F4.rt,F4.ctx,c);f4.push({caseId:c.caseId,generation:e.base.generation?.status,steps:e.base.steps.length,fails:e.fails,differences:e.differences});}
out.runs.push({runtime:F4.runtime,purpose:'NO_FALSE_BLOCK',expected:'no violation',cases:f4,result:f4.every(x=>!x.fails.length)?'PASS':'FAIL'});
// ---------- 2. Sensitivity on superseded runtimes (documented defects) ----------
const SENS=[
 {key:'--f3',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json',defect:'QE-R7C-10 (shortened answer recorded by a clinical route stays unapplied)',cases:['DEV-02','DEV-02b'],detect:f=>f.some(x=>x.relation==='CARRIER_CLINICAL')},
 {key:'--b2',record:'CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json',defect:'R7C-G01 (unknown training planned without a question: unreported weeks read as a stop, entry dose VALID)',cases:['DEV-10'],detect:f=>f.some(x=>x.property==='P03'||x.property==='P06')},
 {key:'--prer7a',record:null,defect:'D54 (a strength row not done for more than 28 days ignores the race-window dose)',cases:['DEV-11'],detect:f=>f.some(x=>x.property==='P07')}
];
for(const s of SENS){
 const root=arg(s.key);if(!root){out.runs.push({purpose:'SENSITIVITY',defect:s.defect,result:'NOT_RUN'});continue;}
 // Freeze records are append-only and kept in the current tree; each one binds the bytes of its own freeze.
 const recordPath=s.record?path.join(f4root,s.record):path.join(f4root,'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/MANIFEST.json');
 const R=await ctxFor(root,recordPath),rows=[];
 for(const id of s.cases){const e=evaluate(R.rt,R.ctx,byId.get(id));rows.push({caseId:id,steps:e.base.steps.length,stopped:e.base.stopped,runtimeErrors:e.base.runtimeErrors,fails:e.fails,detected:s.detect(e.fails)});}
 const f4same=s.cases.map(id=>f4.find(x=>x.caseId===id));
 out.runs.push({runtime:R.runtime,purpose:'SENSITIVITY',defect:s.defect,cases:rows,onFreeze4:f4same.map(x=>({caseId:x.caseId,fails:x.fails})),result:rows.some(r=>r.detected)&&f4same.every(x=>!x.fails.length)?'DETECTED_AND_CLEAN_ON_FREEZE4':'NOT_DETECTED'});
}
// ---------- 3. Synthetic witnesses: every automated check fires on a constructed violation ----------
const thaw=v=>JSON.parse(JSON.stringify(v));
function witness(id,caseId,mutate,expect){
 const base=runCase(F4.rt,byId.get(caseId));
 const t={...base,generation:base.generation,steps:base.steps.map(s=>({...s}))};
 const note=mutate(t);
 const p=evaluateProperties(t,F4.ctx),fired=Object.values(p).some(x=>x.violations.some(v=>expect.includes(v.issue)));
 out.witnesses.push({witness:id,caseId,mutation:note,expects:expect,fired});
}
const stepOf=(t,id)=>t.steps.find(s=>s.stepId===id);
witness('W-P01','DEV-03',t=>{const s=stepOf(t,'w1d1');s.result={...s.result,proposal:s.planBefore};return 'clinical decision carries a proposal';},['PRESCRIPTION_WITH_CLINICAL_ROUTE']);
witness('W-P01b','DEV-03',t=>{const s=stepOf(t,'w1r');s.result={...s.result,status:'KEEP',proposal:null};return 'standing clinical route answered KEEP';},['CLINICAL_ROUTE_NOT_STICKY']);
witness('W-P02','DEV-07',t=>{t.generation={...t.generation,status:'PROPOSED',program:{weeks:[]}};return 'unknown eligibility answered PROPOSED';},['PRESCRIBED_DESPITE_UNKNOWN','ROUTE_MISMATCH']);
witness('W-P02b','DEV-09',t=>{const s=stepOf(t,'w2r');s.result={...s.result,status:'KEEP'};return 'pain flag answered KEEP';},['CLINICAL_FLAG_NOT_ROUTED']);
witness('W-P03','DEV-01',t=>{const s=t.steps[1];s.result={...s.result,actualLedger:[...s.result.actualLedger,{...thaw(s.result.actualLedger[0]),eventId:'invented-row',provenance:{...thaw(s.result.actualLedger[0].provenance),inputHashes:{'invented-row':'0'}}}]};return 'a record row nobody reported';},['RECORD_ROW_WITHOUT_REPORT']);
witness('W-P03b','DEV-10',t=>{const s=t.steps[2];s.result={...s.result,gates:{...(s.result.gates??{}),LONG:'ADVANCE'}};return 'an empty week credited (LONG ADVANCE)';},['CREDIT_WITHOUT_REPORT']);
witness('W-P04','DEV-02',t=>{const s=stepOf(t,'w6r');s.result={...s.result,planValidity:{status:'VALID_WITHIN_CURRENT_BOUNDED_SCOPE'}};return 'a question returned VALID';},['PENDING_BUT_VALID']);
witness('W-P06','DEV-01',t=>{const s=t.steps[3],p=thaw(s.planAfter);const r=p.weeks[s.weekIndex+1].sessions.find(x=>x.sport==='RUN'&&x.role==='LONG');r.prescription.durationMinutes+=40;s.planAfter=p;return 'next week long run +40 min at a closing review';},['__P06__']);
witness('W-P07','DEV-04',t=>{const s=t.steps[5],p=thaw(s.planAfter);p.weeks[7].phase='TAPER';s.planAfter=p;return 'race week relabelled TAPER';},['RACE_WEEK_PHASE_LOST']);
witness('W-P07b','DEV-04',t=>{const s=t.steps[5],p=thaw(s.planAfter);const x=p.weeks[7].sessions.find(y=>y.sport==='STRENGTH'&&y.prescription);x.prescription.exercises[0].sets=3;x.prescription.exercises[0].rir=2;s.planAfter=p;return 'race-week strength 3 sets at RIR 2';},['RACE_WINDOW_STRENGTH_ABOVE_PHASE_DOSE']);
witness('W-P07c','DEV-04',t=>{const s=t.steps[5],p=thaw(s.planAfter);p.weeks[7].sessions.filter(x=>x.role==='RACE').forEach(x=>x.status='SKIPPED');s.planAfter=p;return 'race session skipped';},['RACE_SESSION_MISSING']);
witness('W-P08','DEV-05',t=>{const s=stepOf(t,'ret'),p=thaw(s.planAfter);for(const x of p.weeks[s.weekIndex].sessions)if(x.sport==='RUN'&&x.prescription&&x.date>=s.asOfLocal)x.prescription.durationMinutes=120;s.planAfter=p;return 'return week runs set to 120 min';},['__P08__']);
witness('W-P09','DEV-06',t=>{const s=stepOf(t,'w1r');s.result={...s.result,gates:{...(s.result.gates??{}),LONG:'ADVANCE'}};return 'adverse long run credited ADVANCE';},['PROGRESSION_WITHOUT_FAVOURABLE_EXECUTION']);
witness('W-P10','DEV-01',t=>{const s=t.steps[1],p=thaw(s.planAfter);const x=p.weeks[0].sessions.find(y=>y.prescription);x.prescription.durationMinutes=(x.prescription.durationMinutes??0)+5;s.planAfter=p;s.adopted=true;return 'past session rewritten by an adopted plan';},['PAST_SESSION_REWRITTEN']);
witness('W-P10b','DEV-01',t=>{const s=t.steps[2];s.result={...s.result,actualLedger:s.result.actualLedger.slice(1)};return 'record row dropped';},['RECORD_ROW_DROPPED']);
witness('W-P11','DEV-01',t=>{const s=t.steps[2],p=thaw(s.planAfter);const x=p.weeks[4].sessions.find(y=>y.sport==='STRENGTH'&&y.prescription);x.prescription.exercises[0].id='invented-exercise';s.planAfter=p;return 'exercise outside the catalog';},['EXERCISE_OUTSIDE_CATALOG']);
witness('W-P11b','DEV-04',t=>{const s=t.steps[1],p=thaw(s.planAfter);const x=p.weeks[3].sessions.find(y=>y.sport==='STRENGTH'&&y.prescription);x.prescription.exercises[0].id='back-squat';s.planAfter=p;return 'barbell exercise without a barbell';},['EQUIPMENT_NOT_AVAILABLE']);
witness('W-P12','DEV-01',t=>{const s=t.steps[2],p=thaw(s.planAfter);const x=p.weeks[4].sessions.find(y=>y.sport==='RUN'&&y.prescription);x.day=2;s.planAfter=p;return 'run moved to an unchosen day';},['SESSION_ON_UNCHOSEN_DAY']);
witness('W-P12b','DEV-01',t=>{const s=t.steps[2],p=thaw(s.planAfter);const r=p.weeks[4].sessions.find(y=>y.sport==='RUN'&&y.prescription&&y.day===1);const g=p.weeks[4].sessions.find(y=>y.sport==='STRENGTH'&&y.prescription);g.day=1;g.date=r.date;g.turn=r.turn;s.planAfter=p;return 'run and strength in one turn without confirmation';},['SAME_TURN_WITHOUT_CONFIRMATION','SESSION_ON_UNCHOSEN_DAY']);
witness('W-P13','DEV-01',t=>{const s=t.steps[1],rows=thaw(s.result.actualLedger);delete rows[0].provenance.firstRecordedAt;s.result={...s.result,actualLedger:rows};return 'record row without its clock';},['RECORD_ROW_WITHOUT_CLOCK']);
witness('W-P14','DEV-09',t=>{const s=t.steps[1];s.result={...s.result,updatedModel:{...s.result.updatedModel,purposeAllowed:true}};return 'learning without consent';},['LEARNING_WITHOUT_CONSENT']);
// P06 and P08 violations carry no issue label (unit records): count any violation of the property.
for(const w of out.witnesses)if(w.expects[0]==='__P06__'||w.expects[0]==='__P08__'){
 const id=w.expects[0]==='__P06__'?'P06':'P08',kase=byId.get(w.caseId),base=runCase(F4.rt,kase),t={...base,steps:base.steps.map(s=>({...s}))};
 if(id==='P06'){const s=t.steps[3],p=thaw(s.planAfter);p.weeks[s.weekIndex+1].sessions.find(x=>x.sport==='RUN'&&x.role==='LONG').prescription.durationMinutes+=40;s.planAfter=p;}
 else{const s=t.steps.find(x=>x.stepId==='ret'),p=thaw(s.planAfter);for(const x of p.weeks[s.weekIndex].sessions)if(x.sport==='RUN'&&x.prescription&&x.date>=s.asOfLocal)x.prescription.durationMinutes=120;s.planAfter=p;}
 w.fired=evaluateProperties(t,F4.ctx)[id].violations.length>0;w.expects=[id+' violation'];
}
// Runtime-wrapper witnesses for the metamorphic relations.
function wrapped(name,caseId,wrap,relation){
 const rt={generateProgram:F4.rt.generateProgram,evaluateProgram:wrap(F4.rt.evaluateProgram)},kase=byId.get(caseId);
 const base=runCase(rt,kase),rel=runRelations(rt,kase,base,F4.ctx,{only:[relation]});
 out.witnesses.push({witness:name,caseId,relation,mutation:'wrapped runtime',fired:(rel[relation]?.violations??[]).length>0});
}
let calls=0;
wrapped('W-DET','DEV-01',ev=>(p,r)=>{const x=ev(p,r);return ++calls>8&&r.event.kind==='WEEKLY_REVIEW'&&calls%2?{...x,planValidity:{status:'REQUIRES_RECONCILIATION'}}:x;},'DETERMINISM');
wrapped('W-PERM','DEV-01',ev=>(p,r)=>{const x=ev(p,r),o=r.observations??[];return o.length>1&&o[0].eventId>o[o.length-1].eventId?{...x,status:'ASK'}:x;},'PERMUTE_OBSERVATIONS');
wrapped('W-DUP','DEV-01',ev=>(p,r)=>{const x=ev(p,r),o=r.observations??[];return new Set(o.map(y=>y.sessionId)).size<o.length?{...x,status:'MODIFY'}:x;},'DUPLICATE_SECOND_SOURCE');
wrapped('W-RENAME','DEV-01',ev=>(p,r)=>{const x=ev(p,r);return String(p.athleteId).startsWith('rn~')?{...x,status:'HOLD'}:x;},'RENAME_OPAQUE_IDS');
wrapped('W-RESEND','DEV-01',ev=>(p,r)=>{const x=ev(p,r),seen=new Set((r.actualLedger??[]).map(y=>y.eventId));return (r.observations??[]).some(o=>seen.has(o.eventId))?{...x,status:'ASK'}:x;},'RESEND');
wrapped('W-CARRIER','DEV-02',ev=>(p,r)=>{const x=ev(p,r);return r.event.id.endsWith('w7d3')&&!r.referenceState?{...x,planValidity:{status:'REQUIRES_RECONCILIATION'}}:x;},'CARRIER_CLINICAL');
out.summary={noFalseBlock:out.runs[0].result,sensitivity:out.runs.slice(1).map(r=>({defect:r.defect,result:r.result})),witnessesFired:out.witnesses.filter(w=>w.fired).length,witnesses:out.witnesses.length,notFired:out.witnesses.filter(w=>!w.fired).map(w=>w.witness)};
fs.writeFileSync(arg('--out'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary,null,1));
