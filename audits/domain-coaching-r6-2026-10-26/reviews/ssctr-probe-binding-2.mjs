// SSCTR R6 independent probe 3: follow-up details (walk/jog EARNED steps, RESTART gating, partial establishment gating,
// pre-pause surplus during return, week-1 exposure with a familiar quality task). Reviewer-authored, DEV_TEST_ONLY authority.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES,intake} from '../../../CoachingCore/r6/fixtures/profiles.mjs';

const ALL=devAuthority();
const without=(...ids)=>devAuthority(ALL.policy.scientificBoundaryIds.filter(x=>!ids.includes(x)));
const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const R={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},EASIER:{performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'}};
let n=0;
const obs=(p,s,response='COMPATIBLE')=>({eventId:`probe3-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed:true,minutes:s.prescription.durationMinutes},response:R[response],source:{provider:'MANUAL'}});
const end=(p,w)=>new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
const review=(p,w,kind,date,extra={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+'T21:00:00Z',weekIndex:w,event:{id:`probe3-${kind}-${w}-${n++}`,kind},eligibility:el(date),...extra});
const week=(p,w,{response='COMPATIBLE',skip=false}={},ledger=[])=>{const observations=skip?[]:p.weeks[w].sessions.filter(s=>s.prescription&&s.role!=='RACE').map(s=>obs(p,s,s.sport==='RUN'?response:'COMPATIBLE'));const r=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',end(p,w),{observations,actualLedger:ledger}),{authority:ALL});return {r,p:r.proposal??p,ledger:r.actualLedger??ledger};};
const res={};
// Walk/jog ladder index under repeated EASIER responses (EARNED) versus COMPATIBLE.
for(const response of ['COMPATIBLE','EASIER']){
 let p=generateProgram(PROFILES.G_LOW_DATA_NO_WEARABLE,{authority:ALL}).program,ledger=[];const steps=[];
 for(let w=0;w<6;w++){const s=p.weeks[w].sessions.find(x=>x.role==='WALK_JOG');steps.push({w,ladderStep:s?.prescription.calibration?.step??null,work:s?.prescription.work??null,role:s?.role??p.weeks[w].sessions.find(x=>x.sport==='RUN')?.role});const x=week(p,w,{response},ledger);p=x.p;ledger=x.ledger;}
 res['WALK_JOG_'+response]=steps;
}
// RESTART class generated without R6-NONCLINICAL-RETURN authority.
{
 const g=generateProgram(EDGE_PROFILES.RESTART_AFTER_PAUSE,{authority:without('R6-NONCLINICAL-RETURN')});
 res.RESTART_WITHOUT_RETURN_AUTHORITY={status:g.status,runClass:g.program?.capability.run.class,week0:g.program?.weeks[0].sessions.filter(s=>s.sport==='RUN').map(s=>`${s.role}:${s.prescription?.durationMinutes}`),week3:g.program?.weeks[3].sessions.filter(s=>s.sport==='RUN').map(s=>`${s.role}:${s.prescription?.durationMinutes}`)};
}
// Known-load athlete with load-establishment authority disabled: are ESTABLISH rows still emitted?
{
 const g=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:without('R6-LOAD-ESTABLISHMENT')});
 res.ESTABLISH_ROWS_WITHOUT_LOAD_AUTHORITY={status:g.status,establishRows:[...new Set(g.program?.weeks.flatMap(w=>w.sessions.flatMap(s=>s.prescription?.exercises?.filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id)??[]))??[])]};
}
// Pre-pause surplus counted toward EARNED during a moderate return.
{
 let p=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program,ledger=[];
 for(let w=0;w<3;w++){const x=week(p,w,{response:'EASIER'},ledger);p=x.p;ledger=x.ledger;}
 const w=4,date=new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+1*86400000).toISOString().slice(0,10);
 const r=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',date,{interruption:{days:12,nonclinical:true,clinicalReason:false,reason:'Work travel'},actualLedger:ledger}),{authority:ALL});
 let q=r.proposal,l=r.actualLedger;const from=q.decisions.at(-1).fromWeek;const trail=[];
 for(let k=from;k<from+3&&k<q.weeks.length;k++){trail.push({w:k,phase:q.weeks[k].phase,runs:q.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.durationMinutes}`)});const x=week(q,k,{response:'EASIER'},l);trail[trail.length-1].gates=x.r.gates;q=x.p;l=x.ledger;}
 res.RETURN_WITH_EASIER_RESPONSES={returnStatus:r.status,from,trail};
}
// Week-1 exposure for a familiar-quality runner whose quality task is longer than an easy run.
{
 const g=generateProgram(PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH,{authority:ALL});
 const est=intake('probe-qf',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'MAINTAIN'},runExperience:'EXPERIENCED',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50},knownExercises:[{id:'goblet-squat',sets:2,reps:8,load:{value:20,unit:'KG',convention:'PER_HAND'},rir:3,current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}],knownRuns:[{prescription:{modality:'RUN',family:'THRESHOLD',durationMinutes:55,warmupMinutes:15,cooldownMinutes:10,effortDomain:'THRESHOLD_CONTROLLED',effort:'Comfortably hard',equipment:[],work:{repetitions:5,workMinutes:5,recoveryMinutes:1}},current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}]},schedule:{runDays:[1,3,6],strengthDays:[4],runMinutes:60,longRunDay:6}});
 const g2=generateProgram(est,{authority:ALL});
 const tot=w=>w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.prescription.family!=='WALK').reduce((a,s)=>a+s.prescription.durationMinutes,0);
 res.WEEK1_FAMILIAR_QUALITY={E:{reported:200,week0:tot(g.program.weeks[0]),week1:tot(g.program.weeks[1])},qualityFamiliar120:{status:g2.status,reported:120,week0:tot(g2.program.weeks[0]),week0Sessions:g2.program.weeks[0].sessions.filter(s=>s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`)}};
}
const file=path.join(import.meta.dirname,'ssctr-probe-binding-2.out.json');
fs.writeFileSync(file,JSON.stringify(res,null,2)+'\n');
console.log(JSON.stringify(res,null,1));
