// SSCTR R6 round-4 probe b: strength return step one without logs (P7 analogue) with a structured WORK category.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES} from '../../../CoachingCore/r6/fixtures/profiles.mjs';
const ALL=devAuthority(),el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
let n=0;const end=(p,w)=>new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
const week=(p,w,ledger)=>{const observations=p.weeks[w].sessions.filter(s=>s.prescription&&s.role!=='RACE').map(s=>({eventId:`r4b-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed:true,minutes:s.prescription.durationMinutes},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},source:{provider:'MANUAL'}}));const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:end(p,w)+'T21:00:00Z',weekIndex:w,event:{id:`r4bw-${n++}`,kind:'WEEKLY_REVIEW'},eligibility:el(end(p,w)),observations,actualLedger:ledger},{authority:ALL});return {r,p:r.proposal??p,ledger:r.actualLedger??ledger};};
let p=generateProgram(PROFILES.D_NOVICE_RUNNER_EXPERIENCED_STRENGTH,{authority:ALL}).program,ledger=[];
for(const w of [0,1]){const x=week(p,w,ledger);p=x.p;ledger=x.ledger;}
const out={};
for(const days of [20,90]){
 const w=3,date=p.weeks[w].startDate;
 const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+'T21:00:00Z',weekIndex:w,event:{id:`r4b-ret-${days}`,kind:'RETURN_AFTER_PAUSE'},eligibility:el(date),interruption:{days,nonclinical:true,reasonCategory:'WORK',reason:'Work travel'},actualLedger:ledger},{authority:ALL});
 if(!r.proposal){out[days]={status:r.status};continue;}
 const from=r.proposal.decisions.at(-1).fromWeek,x=week(r.proposal,from,r.actualLedger);
 const fmt=wk=>wk.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}${e.load.mode==='KNOWN'?'@'+e.load.value:'/'+e.load.mode}`).join(','));
 out[days]={status:r.status,from,stepOneNoLogs:fmt(x.p.weeks[from+1]),knownPriorLoads:fmt(x.p.weeks[from+1]).join(',').includes('@')};
}
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy2-r4b.out.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,1));
