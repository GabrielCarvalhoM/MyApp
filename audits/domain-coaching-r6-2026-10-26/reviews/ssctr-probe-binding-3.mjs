// SSCTR R6 independent probe 4: taper/race-week quality when every build quality session was missed; intake pause naming illness.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../../../CoachingCore/r6/fixtures/profiles.mjs';
const ALL=devAuthority();
const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
let n=0;
const end=(p,w)=>new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
const res={};
{
 let p=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,{authority:ALL}).program,ledger=[];
 const taper=p.weeks.findIndex(w=>w.phase==='TAPER');
 for(let w=0;w<taper;w++){
  const observations=p.weeks[w].sessions.filter(s=>s.prescription&&s.role!=='QUALITY').map(s=>({eventId:`p4-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed:true,minutes:s.prescription.durationMinutes},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},source:{provider:'MANUAL'}}));
  const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:end(p,w)+'T21:00:00Z',weekIndex:w,event:{id:`p4-${w}`,kind:'WEEKLY_REVIEW'},eligibility:el(end(p,w)),observations,actualLedger:ledger},{authority:ALL});
  p=r.proposal??p;ledger=r.actualLedger??ledger;
 }
 const executedQuality=ledger.filter(o=>o.context?.role==='QUALITY').length;
 const fmt=wk=>wk.sessions.filter(s=>s.prescription).map(s=>`${s.day}:${s.role}:${s.prescription.family}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})`:''}${s.prescription.strides?'+str'+s.prescription.strides.repetitions:''}`);
 res.TAPER_AFTER_ALL_QUALITY_MISSED={executedQualitySessions:executedQuality,taperWeek:fmt(p.weeks[taper]),raceWeek:fmt(p.weeks[taper+1])};
}
{
 const base=PROFILES.C_BALANCED_HYBRID;
 const ill={...base,athlete:{...base.athlete,pause:{nonclinical:true,weeks:6,reason:'Pneumonia, recovered now'}}};
 const g=generateProgram(ill,{authority:ALL});
 res.INTAKE_PAUSE_NAMING_ILLNESS={status:g.status,runClass:g.program?.capability.run.class,week0:g.program?.weeks[0].sessions.filter(s=>s.sport==='RUN').map(s=>`${s.role}:${s.prescription?.durationMinutes}`)};
}
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-binding-3.out.json'),JSON.stringify(res,null,2)+'\n');
console.log(JSON.stringify(res,null,1));
