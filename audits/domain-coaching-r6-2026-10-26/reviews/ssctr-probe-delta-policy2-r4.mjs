// SSCTR R6 round-4 screen-only delta probe (hash d766f0d9...). Reviewer-authored; DEV_TEST_ONLY authority.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {screenInterruptionReason} from '../../../CoachingCore/src/r6-clinical.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES} from '../../../CoachingCore/r6/fixtures/profiles.mjs';
const ALL=devAuthority(),out={probe:'R6-SSCTR-DELTA-R4',authority:'DEV_TEST_ONLY'};
// expect: C must be CLINICAL; N must be NONCLINICAL; A must be ASK; X = ASK or CLINICAL (never NONCLINICAL)
const T=(reason,expect,cat='WORK')=>({reason,expect,cat});
const BATTERY=[
 // R3: free text alone never confirms a nonclinical break
 T('Work travel, will resume Monday','A',null),T('Vacaciones con la familia','A',null),T('Holiday','A',null),T(null,'A',null),
 // double negation with a structured nonclinical category
 T("On the work trip I couldn't run without pain",'C'),T('Could not train without pain during the work trip','C'),T('Never ran without pain on vacation','C'),T('Was not able to run without pain','C'),T("Didn't manage to run without pain",'C'),
 T('Não conseguia correr sem dor durante a viagem','C'),T('Nunca treinei sem dor no trabalho','C'),T('No pude correr sin dolor en el viaje','C'),T('Nunca corrí sin dolor en vacaciones','C'),T('Jamás corrí sin dolor','C'),
 // round-2/3 cases with a category
 T('Not sick - injured on holiday','C'),T('No pain, injury during work travel','C'),T('no pain and injured knee at work','C'),T('Ocupado y enfermo','C'),T('Hacía mucho calor y me lesioné la rodilla','C'),T('Flu','C'),
 // falls (ambiguous in all three languages)
 T('I fell on the trip','X'),T('Tripped during travel','X'),T('Caí na viagem','X'),T('Levei um tombo no trabalho','X'),T('Me caí en el viaje','X'),T('Tropecé en el trabajo','X'),
 // legitimate denials with a category
 T('No pain or injury, work travel','N'),T('no pain and no injury','N'),T('Not sick, not injured','N'),T('I had no pain','N'),T('Sem dor nem lesão, só trabalho','N'),T('Sin enfermedad ni lesión, solo trabajo','N'),T('nothing clinical, just a busy month','N'),
 // conservative false positives are acceptable (X)
 T('No time and no pain','X'),T("Didn't feel any pain",'X'),
 // residual heuristic limits (reported, not expected to be caught)
 T('It was hard to run without pain','REPORT'),T('Struggled to run without pain on the trip','REPORT'),T('Apenas conseguia correr sem dor','REPORT')
];
out.SCREEN=BATTERY.map(({reason,expect,cat})=>{const r=screenInterruptionReason({reason,reasonCategory:cat,nonclinical:true});const ok=expect==='C'?r.status==='CLINICAL':expect==='N'?r.status==='NONCLINICAL':expect==='A'?r.status==='ASK':expect==='X'?r.status!=='NONCLINICAL':true;return {reason,category:cat,expect,status:r.status,basis:r.basis,ok};});
out.SCREEN_FAILURES=out.SCREEN.filter(x=>!x.ok).map(x=>`${x.reason} [${x.category}] -> ${x.status} (expected ${x.expect})`);
out.RESIDUAL=out.SCREEN.filter(x=>x.expect==='REPORT').map(x=>`${x.reason} [${x.category}] -> ${x.status}`);
const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const R={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},EASIER:{performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'}};
let n=0;
const end=(p,w)=>new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
const week=(p,w,ledger,response='COMPATIBLE')=>{const observations=p.weeks[w].sessions.filter(s=>s.prescription&&s.role!=='RACE').map(s=>({eventId:`r4-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed:true,minutes:s.prescription.durationMinutes},response:R[s.sport==='RUN'?response:'COMPATIBLE'],source:{provider:'MANUAL'}}));const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:end(p,w)+'T21:00:00Z',weekIndex:w,event:{id:`r4w-${w}-${n++}`,kind:'WEEKLY_REVIEW'},eligibility:el(end(p,w)),observations,actualLedger:ledger},{authority:ALL});return {r,p:r.proposal??p,ledger:r.actualLedger??ledger};};
const ret=(p,w,date,interruption,ledger,extra={})=>evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+'T21:00:00Z',weekIndex:w,event:{id:`r4r-${n++}`,kind:'RETURN_AFTER_PAUSE'},eligibility:el(date),interruption,actualLedger:ledger,...extra},{authority:ALL});
// Return behaviour with a structured category (P5/P6 analogues and the EARNED trail)
{
 let p=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program,ledger=[];
 for(const w of [0,1,2,3]){const x=week(p,w,ledger);p=x.p;ledger=x.ledger;}
 const w=5,date=p.weeks[w].startDate;
 const s=(i,extra)=>{const r=ret(p,w,date,i,ledger,extra);return {status:r.status,missing:r.missingInputs,demo:r.proposal?.decisions.at(-1)?.demonstrationUsed??null,first:r.proposal?r.proposal.weeks[r.proposal.decisions.at(-1).fromWeek].sessions.filter(x=>x.sport==='RUN'&&x.prescription).map(x=>`${x.role}:${x.prescription.durationMinutes}`):null};};
 out.RETURN={
  freeTextOnly:s({days:14,nonclinical:true,reason:'Work travel'}),
  workCategory:s({days:14,nonclinical:true,reasonCategory:'WORK',reason:'Work travel'}),
  workCategoryIllnessText:s({days:14,nonclinical:true,reasonCategory:'WORK',reason:'Sick with a fever'}),
  workCategoryDoubleNegation:s({days:14,nonclinical:true,reasonCategory:'WORK',reason:"couldn't run without pain"}),
  illnessCategory:s({days:14,nonclinical:true,reasonCategory:'ILLNESS'}),
  strengthDemonstration:s({days:20,nonclinical:true,reasonCategory:'WORK'},{currentDemonstration:{observedAt:date,response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',minutes:45,prescription:{modality:'STRENGTH',durationMinutes:45}}})
 };
 // EARNED trail during a return with a category (pre-pause surplus present)
 let q=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program,l=[];
 for(let k=0;k<3;k++){const x=week(q,k,l,'EASIER');q=x.p;l=x.ledger;}
 const rw=4,rdate=new Date(Date.parse(q.weeks[rw].startDate+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 const rr=ret(q,rw,rdate,{days:12,nonclinical:true,reasonCategory:'WORK',reason:'Work travel'},l);
 let qq=rr.proposal,ll=rr.actualLedger;const trail=[];
 if(qq){const from=qq.decisions.at(-1).fromWeek;for(let k=from;k<from+3&&k<qq.weeks.length;k++){const runs=qq.weeks[k].sessions.filter(x=>x.sport==='RUN'&&x.prescription).map(x=>`${x.role}:${x.prescription.durationMinutes}`);const x=week(qq,k,ll,'EASIER');trail.push({w:k,runs,easyGate:x.r.gates?.EASY});qq=x.p;ll=x.ledger;}}
 out.RETURN_EARNED_TRAIL={status:rr.status,trail};
}
// Intake pause with and without a category
{
 const base=PROFILES.C_BALANCED_HYBRID,g=pause=>{const r=generateProgram({...base,athlete:{...base.athlete,pause}},{authority:ALL});return {status:r.status,missing:r.missingInputs,runClass:r.program?.capability.run.class??null};};
 out.INTAKE={freeTextOnly:g({nonclinical:true,weeks:6,reason:'Vacation'}),travelCategory:g({nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Vacation'}),travelCategoryDoubleNegation:g({nonclinical:true,weeks:2,reasonCategory:'TRAVEL',reason:'No podía correr sin dolor'}),travelCategoryFall:g({nonclinical:true,weeks:2,reasonCategory:'TRAVEL',reason:'Me caí en el viaje'})};
}
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy2-r4.out.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({failures:out.SCREEN_FAILURES,residual:out.RESIDUAL,ret:out.RETURN,earned:out.RETURN_EARNED_TRAIL,intake:out.INTAKE},null,1));
