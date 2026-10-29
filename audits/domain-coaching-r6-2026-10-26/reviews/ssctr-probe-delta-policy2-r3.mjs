// SSCTR R6 round-3 delta probe (hash 983171ac...): clinical-screen battery incl. double negation, D36 dose key, D37 disclosure.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {screenInterruptionReason} from '../../../CoachingCore/src/r6-clinical.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,intake} from '../../../CoachingCore/r6/fixtures/profiles.mjs';
const ALL=devAuthority(),out={probe:'R6-SSCTR-DELTA-R3',authority:'DEV_TEST_ONLY'};
// expected: C = must be CLINICAL; N = may be NONCLINICAL; A = ASK or CLINICAL acceptable (never NONCLINICAL)
const BATTERY=[
 // double negation: affirmative clinical meaning inside a negated clause
 ['On the work trip I couldn\'t run without pain','C'],['Could not train without pain during the work trip','C'],['Never ran without pain on vacation','C'],
 ['Não conseguia correr sem dor durante a viagem','C'],['Não consegui treinar sem dor no trabalho','C'],['No podía correr sin dolor durante el viaje','C'],['Nunca corrí sin dolor en vacaciones','C'],
 // clause boundaries (round-2 failures)
 ['Not sick - injured on holiday','C'],['No pain, injury during work travel','C'],['no pain and injured knee at work','C'],['Not ill, injured my knee at work','C'],
 // Spanish (round-2 failures and new)
 ['Ocupado y enfermo','C'],['Familia, estuve con fiebre','C'],['Hacía mucho calor y me lesioné la rodilla','C'],['Me torcí el tobillo en el viaje','C'],['Me enfermé durante las vacaciones','C'],['Viaje de trabajo, me duele la espalda','C'],['Tuve gripe en el viaje','C'],
 // falls and accidents
 ['Caí na viagem','A'],['Me caí en el viaje','A'],['I fell on the trip','A'],['Had a car accident on the trip','C'],['Acidente de bicicleta na viagem','C'],
 // legitimate denials and nonclinical reasons
 ['No pain or injury, work travel','N'],['Sem dor nem lesão, só trabalho','N'],['Sin enfermedad ni lesión, solo trabajo','N'],['no pain, no injury, work travel','N'],['Work travel, will resume Monday','N'],['Vacaciones con la familia','N'],['Viagem de trabalho, sem dor','N'],
 // structured category interplay
 [null,'N',{reasonCategory:'TRAVEL'}],['Flu','C',{reasonCategory:'TRAVEL'}],['knee was fine','A',{reasonCategory:'TRAVEL'}],['Holiday','A',{nonclinical:false}]
];
out.SCREEN=BATTERY.map(([reason,expect,flags={}])=>{const r=screenInterruptionReason({reason,nonclinical:flags.nonclinical??true,reasonCategory:flags.reasonCategory??null});const ok=expect==='C'?r.status==='CLINICAL':expect==='A'?r.status!=='NONCLINICAL':true;return {reason,expect,status:r.status,basis:r.basis,matched:r.matched,ok};});
out.SCREEN_FAILURES=out.SCREEN.filter(x=>!x.ok).map(x=>`${x.reason} -> ${x.status} (expected ${x.expect})`);
// end-to-end on the failures (return review and short intake pause)
{
 const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
 let p=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program;
 const w=2,date=p.weeks[w].startDate,phrases=out.SCREEN.filter(x=>!x.ok).map(x=>x.reason).concat(['Not sick - injured on holiday','Ocupado y enfermo']);
 out.E2E=phrases.map(reason=>{const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+'T21:00:00Z',weekIndex:w,event:{id:'r3-'+reason,kind:'RETURN_AFTER_PAUSE'},eligibility:el(date),interruption:{days:14,reason,nonclinical:true}},{authority:ALL});const base=PROFILES.C_BALANCED_HYBRID;const g=generateProgram({...base,athlete:{...base.athlete,pause:{nonclinical:true,weeks:2,reason}}},{authority:ALL});return {reason,returnStatus:r.status,intakeShortPauseStatus:g.status};});
}
// D37 disclosure: the round-2 unavoidable MODERATE case
{
 const kn=[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-27'},{id:'barbell-rdl',sets:3,reps:6,load:{value:85,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}];
 const g=generateProgram(intake('probe-moderate',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['BARBELL','RACK','BENCH','DUMBBELLS'],knownExercises:kn},schedule:{runDays:[1,3,6],strengthDays:[1,3],runTurn:'PM',strengthTurn:'AM',longRunDay:6,runMinutes:50,strengthMinutes:50,longRunMinutes:80}}),{authority:ALL});
 out.D37_DISCLOSURE={status:g.status,items:(g.program?.negotiation??[]).filter(n=>n.id==='ARRANGEMENT_COST_DISCLOSED').map(n=>({context:n.context,costs:n.costs,options:n.options,blocking:n.blocking}))};
}
// D36: bound observations carry doseKey; a quality observation's key names family, ladder and step
{
 const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
 let p=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program,ledger=[];
 for(let w=0;w<4;w++){const end=new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);const observations=p.weeks[w].sessions.filter(s=>s.prescription).map((s,i)=>({eventId:`r3-${w}-${i}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed:true,minutes:s.prescription.durationMinutes},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},source:{provider:'MANUAL'}}));const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:end+'T21:00:00Z',weekIndex:w,event:{id:'r3w'+w,kind:'WEEKLY_REVIEW'},eligibility:el(end),observations,actualLedger:ledger},{authority:ALL});p=r.proposal??p;ledger=r.actualLedger??ledger;}
 out.D36_DOSE_KEYS=[...new Set(ledger.filter(o=>o.context?.role==='QUALITY').map(o=>o.context.doseKey))];
}
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy2-r3.out.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({failures:out.SCREEN_FAILURES,e2e:out.E2E,d37:out.D37_DISCLOSURE,d36:out.D36_DOSE_KEYS},null,1));
