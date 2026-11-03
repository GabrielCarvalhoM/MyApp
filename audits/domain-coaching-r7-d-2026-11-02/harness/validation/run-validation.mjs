// R7-D harness validation (Phase 1 plan: "sem falso bloqueio no FREEZE-4; sensibilidade nos freezes superados; oráculo sem testemunha =
// TEST_GAP"). Development cases only (build-dev-cases.mjs): contaminated by construction, never diagnostic or fresh evidence.
//   node run-validation.mjs --dev <dev-cases.json> --out <file> --candidate <repo root> [--f4 <root>] [--f3 <root>] [--b2 <root>] [--prer7a <root>]
// R7D-HARNESS-VALIDATION-2 (Phase 3): no false block on the candidate runtime (the tree under --candidate); R7C-FREEZE-4 is now a superseded
// runtime whose four diagnostic blockers (DX-01, DX-02, F03, F04) must be detected; P05 carrier coverage must be non-zero on the dev cases.
// Superseded runtimes are rebuilt outside the repository (see HARNESS_VALIDATION.md for the exact git archive / copy commands).
// R7D-HARNESS-VALIDATION-3 (Phase 3.1): also --d1 <root> (R7D-FREEZE-1, superseded): QE-R7D-P3-01 (a) and (b) are detected by P17 and its
// RESTATE_DECLARED_BREAK relation, P3-F01 by CARRIER_CLINICAL, each clean on the candidate; P17 gets units on the candidate and every P17 check
// fires on a constructed violation. P3-F01 is no longer a finding on the candidate: its cases are plain no-false-block cases.
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../lib/client.mjs';
import {evaluateProperties} from '../lib/properties.mjs';
import {runRelations} from '../lib/metamorphic.mjs';
import {verifyRuntime,sourceBytes} from '../r7d-harness.mjs';
import {digestOf,addDays as addDaysLocal} from '../lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const dev=JSON.parse(fs.readFileSync(arg('--dev'),'utf8')),byId=new Map(dev.cases.map(c=>[c.caseId,c]));
const out={validation:'R7D-HARNESS-VALIDATION-3',harness:'R7D-HARNESS-3',devCorpusSha256:digestOf(dev),runs:[],witnesses:[],coverage:{}};

async function ctxFor(root,record){
 const cc=path.join(root,'CoachingCore');
 const rt=await loadRuntime(cc);
 const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8'));
 const catalogPath=path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json');
 const catalog=JSON.parse(fs.readFileSync(fs.existsSync(catalogPath)?catalogPath:path.join(arg('--candidate'),'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'));
 return {rt,ctx:{policy,catalog},runtime:record?verifyRuntime(root,record):{revision:'CANDIDATE (not frozen)',source:sourceBytes(cc)}};
}
function evaluate(rt,ctx,kase,relations=true){
 const base=runCase(rt,kase),properties=evaluateProperties(base,ctx),rel=relations?runRelations(rt,kase,base,ctx):{};
 return {base,properties,relations:rel,fails:[...Object.values(properties).filter(p=>p.result==='FAIL').map(p=>({property:p.id,issues:[...new Set(p.violations.map(v=>v.issue??'VIOLATION'))],n:p.violations.length})),...Object.entries(rel).filter(([,r])=>(r.violations??[]).length).map(([k,r])=>({relation:k,n:r.violations.length,issues:[...new Set(r.violations.map(v=>v.issue))]}))],differences:Object.entries(rel).filter(([,r])=>(r.differences??[]).length).map(([k])=>k)};
}
// ---------- 1. Candidate: no false block on the development cases ----------
const croot=arg('--candidate'),F4=await ctxFor(croot,arg('--candidate-record'));
// Finding witnesses: none since Phase 3.1 (P3-F01, the one R7D-HARNESS-VALIDATION-2 measured on DEV-17 and DEV-17b, is corrected; it is now a
// sensitivity row on R7D-FREEZE-1 below, and its cases must show no violation on the candidate).
const FINDING_CASES={};
const f4=[],relRows=new Map();for(const c of dev.cases){const e=evaluate(F4.rt,F4.ctx,c);relRows.set(c.caseId,e.relations);f4.push({caseId:c.caseId,generation:e.base.generation?.status,steps:e.base.steps.length,fails:e.fails,differences:e.differences,...(FINDING_CASES[c.caseId]?{findingWitness:FINDING_CASES[c.caseId]}:{})});}
const plain=f4.filter(x=>!x.findingWitness);
out.runs.push({runtime:F4.runtime,purpose:'NO_FALSE_BLOCK',expected:'no violation outside the finding witnesses',cases:f4,result:plain.every(x=>!x.fails.length)?'PASS':'FAIL'});
// P05 coverage (Founder, Phase 3): the carrier relations and the re-send must each get units on the candidate.
for(const r of ['CARRIER_CLINICAL','CARRIER_HOLD','RESEND','RESTATE_DECLARED_BREAK']){const by=[...relRows].map(([id,x])=>({caseId:id,units:x[r]?.units??0,violations:(x[r]?.violations??[]).length,notApplicable:x[r]?.notApplicable??null})).filter(x=>x.units||x.notApplicable?.length);out.coverage[r]={units:by.reduce((n,x)=>n+x.units,0),violations:by.reduce((n,x)=>n+x.violations,0),cases:by};}
out.coverage.result=['CARRIER_CLINICAL','CARRIER_HOLD','RESEND','RESTATE_DECLARED_BREAK'].every(r=>out.coverage[r].units>0)?'COVERED':'NOT_COVERED';
// P17 property units on the candidate (R7D-PREREG-3): every stated break not applied by its own decision is followed until applied.
{const by=[];for(const c of dev.cases){const p=evaluateProperties(runCase(F4.rt,c),F4.ctx).P17;if(p.units)by.push({caseId:c.caseId,units:p.units,violations:p.violations.length});}out.coverage.P17={units:by.reduce((n,x)=>n+x.units,0),violations:by.reduce((n,x)=>n+x.violations,0),cases:by};}
if(!(out.coverage.P17.units>0))out.coverage.result='NOT_COVERED';
// ---------- 2. Sensitivity on superseded runtimes (documented defects) ----------
const SENS=[
 {key:'--f4',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json',defect:'DX-01 (a same-day day-precision report drops out of the record at the next decision)',cases:['DEV-12'],detect:f=>f.some(x=>x.property==='P10'&&x.issues.includes('RECORD_ROW_DROPPED'))},
 {key:'--f4',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json',defect:'DX-02 (a break declared in a weekly review with no pending question is ignored, VALID)',cases:['DEV-13'],detect:f=>f.some(x=>x.property==='P08')},
 {key:'--f4',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json',defect:'F03 (a machine load logged as prescribed is refused; machine settings fabricated by +1 kg)',cases:['DEV-15'],detect:f=>f.some(x=>x.property==='P16')},
 {key:'--f4',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json',defect:'F04 (confounded masks an adverse recovery and an impaired next day; the long run advances)',cases:['DEV-14'],detect:f=>f.some(x=>x.property==='P09')},
 {key:'--f3',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json',defect:'QE-R7C-10 (shortened answer recorded by a clinical route stays unapplied)',cases:['DEV-02','DEV-02b'],detect:f=>f.some(x=>x.relation==='CARRIER_CLINICAL')},
 {key:'--b2',record:'CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json',defect:'R7C-G01 (unknown training planned without a question: unreported weeks read as a stop, entry dose VALID)',cases:['DEV-10'],detect:f=>f.some(x=>x.property==='P03'||x.property==='P06')},
 {key:'--prer7a',record:null,defect:'D54 (a strength row not done for more than 28 days ignores the race-window dose)',cases:['DEV-11'],detect:f=>f.some(x=>x.property==='P07')},
 // R7D-HARNESS-VALIDATION-3: the QE-R7D-P3-01 family on R7D-FREEZE-1.
 {key:'--d1',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json',defect:'QE-R7D-P3-01(a) (a break declared with another event is asked and then lost: the next plain review is VALID on the pre-break plan)',cases:['DEV-18','DEV-20'],detect:f=>f.some(x=>x.property==='P17'||x.relation==='RESTATE_DECLARED_BREAK')},
 {key:'--d1',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json',defect:'QE-R7D-P3-01(b) (a break declared with a clinical flag is lost across qualified clearance: the next plain review is VALID on the pre-break plan)',cases:['DEV-19'],detect:f=>f.some(x=>x.property==='P17'||x.relation==='RESTATE_DECLARED_BREAK')},
 {key:'--d1',record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json',defect:'P3-F01 (a break answering UNREPORTED_TRAINING through a clinical route is not retained across clearance: asked again)',cases:['DEV-17','DEV-17b'],detect:f=>f.some(x=>x.relation==='CARRIER_CLINICAL')}
];
for(const s of SENS){
 const root=arg(s.key);if(!root){out.runs.push({purpose:'SENSITIVITY',defect:s.defect,result:'NOT_RUN'});continue;}
 // Freeze records are append-only and kept in the current tree; each one binds the bytes of its own freeze.
 const recordPath=s.record?path.join(croot,s.record):path.join(croot,'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/MANIFEST.json');
 const R=await ctxFor(root,recordPath),rows=[];
 for(const id of s.cases){const e=evaluate(R.rt,R.ctx,byId.get(id));rows.push({caseId:id,steps:e.base.steps.length,stopped:e.base.stopped,runtimeErrors:e.base.runtimeErrors,fails:e.fails,detected:s.detect(e.fails)});}
 const f4same=s.cases.map(id=>f4.find(x=>x.caseId===id));
 out.runs.push({runtime:R.runtime,purpose:'SENSITIVITY',defect:s.defect,cases:rows,onCandidate:f4same.map(x=>({caseId:x.caseId,fails:x.fails})),result:rows.some(r=>r.detected)&&f4same.every(x=>!x.fails.length)?'DETECTED_AND_CLEAN_ON_CANDIDATE':'NOT_DETECTED'});
}
// (R7D-HARNESS-VALIDATION-2 measured P3-F01 here as a finding on the candidate. Phase 3.1 corrected it: it is the last sensitivity row above.)
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
// R7D-HARNESS-2 witnesses: the carrier-independent return (P08), confounded semantics (P09) and the load round trip (P16).
function witnessP(id,caseId,property,mutate){
 const base=runCase(F4.rt,byId.get(caseId)),t={...base,steps:base.steps.map(s=>({...s}))},note=mutate(t);
 out.witnesses.push({witness:id,caseId,mutation:note,expects:[property+' violation'],fired:evaluateProperties(t,F4.ctx)[property].violations.length>0});
}
witnessP('W-P08b','DEV-13','P08',t=>{const s=stepOf(t,'brk'),p=thaw(s.planBefore);for(const x of p.weeks[s.weekIndex].sessions)if(x.sport==='RUN'&&x.prescription&&x.date>=s.asOfLocal)x.prescription.durationMinutes=120;s.result={...s.result,status:'KEEP',action:'KEEP',proposal:null,planValidity:{status:'VALID_WITHIN_CURRENT_BOUNDED_SCOPE'}};s.planAfter=p;s.adopted=false;return 'a break declared in a weekly review answered KEEP, VALID, runs of 120 min';});
witnessP('W-P09b','DEV-14','P09',t=>{const s=t.steps[0];s.result={...s.result,gates:{...(s.result.gates??{}),LONG:'ADVANCE'}};return 'a confounded long run with an adverse recovery credited ADVANCE';});
witnessP('W-P16a','DEV-15','P16',t=>{const s=t.steps[0],o=(s.review.observations??[]).find(x=>(x.actual?.exercises??[]).some(e=>(e.sets??[]).some(z=>z.load?.convention==='MACHINE_STACK')));const e=o.actual.exercises.find(x=>x.sets.some(z=>z.load?.convention==='MACHINE_STACK'));s.result={...s.result,loadQuestions:[...(s.result.loadQuestions??[]),{exerciseId:e.id,sessionId:o.sessionId,reason:'LOGGED_UNIT_OR_CONVENTION_UNKNOWN'}]};return 'a load logged exactly as prescribed answered as an unknown unit';});
witnessP('W-P16b','DEV-15','P16',t=>{const s=t.steps[0],p=thaw(s.planAfter);const x=p.weeks[1].sessions.find(y=>y.sport==='STRENGTH'&&y.prescription&&y.prescription.exercises.some(e=>e.load?.convention==='MACHINE_STACK'&&e.load.mode==='KNOWN'));const e=x.prescription.exercises.find(e=>e.load?.convention==='MACHINE_STACK'&&e.load.mode==='KNOWN');e.load.value+=1;s.planAfter=p;return 'a machine setting stated 1 kg above anything supplied or logged';});
// Engineering check CF-5 (QE-R7D-P3-05, -06): the tightened P07 and P16 each fire on a constructed violation.
witnessP('W-P07d','DEV-04','P07',t=>{const s=t.steps[1],p=thaw(s.planAfter);p.goal.run.event.date=addDaysLocal(p.goal.run.event.date,-7);s.planAfter=p;s.adopted=true;return 'race date moved a week earlier by a weekly review that asked for nothing';});
witnessP('W-P16c','DEV-15','P16',t=>{for(const s of t.steps){const p=thaw(s.planAfter),row=p.weeks.flatMap(w=>w.sessions).filter(x=>x.sport==='STRENGTH'&&x.prescription&&x.date>=s.asOfLocal).flatMap(x=>x.prescription.exercises).find(e=>e.load?.nextSetting);if(row){row.load.nextSetting.aboveKg+=1;s.planAfter=p;return 'a next-setting row states a fallback 1 kg above anything supplied or logged';}}return 'NO_NEXT_SETTING_ROW';});
// R7D-HARNESS-3 witnesses (P17): each check fires on a constructed violation of the candidate's own run of DEV-18.
witnessP('W-P17a','DEV-18','P17',t=>{const s=stepOf(t,'w5d2');s.result={...s.result,status:'KEEP',action:'KEEP',proposal:null,planValidity:{status:'VALID_WITHIN_CURRENT_BOUNDED_SCOPE'}};s.planAfter=s.planBefore;s.adopted=false;return 'the review after the declared break answered KEEP, VALID, with no return';});
witnessP('W-P17c','DEV-18','P17',t=>{const s=stepOf(t,'w5d1'),p=thaw(s.planBefore);p.decisions=[...p.decisions,{action:'RESCHEDULE',eventId:'witness',asOf:s.asOf}];p.schedule={...p.schedule,strengthDays:[0,3]};s.planAfter=p;s.adopted=true;return 'the schedule change that carried the break applied over it';});
witnessP('W-P17c2','DEV-18','P17',t=>{const s=stepOf(t,'w5d2'),p=thaw(s.planAfter);p.decisions=[...p.decisions,{action:'RESCHEDULE',eventId:'witness',asOf:s.asOf}];s.planAfter=p;return 'the return applied together with the schedule change';});
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
wrapped('W-RESTATE','DEV-18',ev=>(p,r)=>{const x=ev(p,r);return Array.isArray(x.actualLedger)?{...x,actualLedger:x.actualLedger.filter(o=>o.fact!=='INTERRUPTION_DECLARED')}:x;},'RESTATE_DECLARED_BREAK');
wrapped('W-CARRIER','DEV-02',ev=>(p,r)=>{const x=ev(p,r);return r.event.id.endsWith('w7d3')&&!r.referenceState?{...x,planValidity:{status:'REQUIRES_RECONCILIATION'}}:x;},'CARRIER_CLINICAL');
out.summary={noFalseBlock:out.runs[0].result,coverage:out.coverage.result,carrierUnits:Object.fromEntries(['CARRIER_CLINICAL','CARRIER_HOLD','RESEND','RESTATE_DECLARED_BREAK'].map(r=>[r,out.coverage[r].units])),p17Units:out.coverage.P17.units,sensitivity:out.runs.slice(1).map(r=>({defect:r.defect,result:r.result})),witnessesFired:out.witnesses.filter(w=>w.fired).length,witnesses:out.witnesses.length,notFired:out.witnesses.filter(w=>!w.fired).map(w=>w.witness)};
fs.writeFileSync(arg('--out'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary,null,1));
