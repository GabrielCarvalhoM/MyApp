// SSCTR BC R1 probe b4: f08 restartIntake readings for stops near the restart day (SEC-SC-03 neighbourhood), with and without a declaration,
// and what the cause answer then routes to. Built on the focal test's own shapes. Usage: node b4-restart-stops.mjs <CoachingCore root>. Synthetic.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const {normalizeObservations}=await imp('src/r6-provenance.mjs'),{restartIntake,readReadiness,readinessFact,READINESS_SIGNS}=await imp('src/v1-f08.mjs');
const json=x=>JSON.parse(JSON.stringify(x)),U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const ATH='ath-b4',DAY='2026-11-10',shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const N=(batch,asOf,prior)=>normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,...(prior?{prior:json(prior)}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const rep=(id,sid,d,extra={})=>({athleteId:ATH,sessionId:sid,eventId:id,observedAt:d+'T07:00:00Z',reportedAt:d+'T08:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const R0=readinessFact({athleteId:ATH},{event:{id:'r0'},readiness:{}},shift(DAY,-8)+'T08:00:00.000Z',READY,null);
const STOP={completed:false,minutes:12,stop:{reason:'SYMPTOM'}};
const ri=(record,pause)=>restartIntake({intake:{asOf:DAY,athlete:{id:ATH,recent:{runMinutesPerWeek:200,runDaysPerWeek:4},...(pause?{pause}:{})}},record:json(record),asOf:DAY,screen:x=>({status:['INJURY','ILLNESS','PAIN'].includes(String(x?.reasonCategory).toUpperCase())?'CLINICAL':'NONCLINICAL'}),athleteId:ATH});
const show=r=>r.status!=='READY'?r.status+(r.missingInputs?'('+r.missingInputs.join(',')+')':''):(p=>p===null?'NO_PAUSE':p.readinessDeclared?'DECLARED':'ASK w'+p.weeks)(r.facts.pause)+(r.missingInputs?.length?' missing:'+r.missingInputs.join(','):'')+(r.questions?' q:'+JSON.stringify(r.questions).slice(0,80):'');
const cases={
 'stop today, nothing else':[rep('S','s',DAY,{actual:STOP})],
 'stop yesterday, nothing else':[rep('S','s',shift(DAY,-1),{actual:STOP})],
 'stop yesterday, done today':[rep('S','s',shift(DAY,-1),{actual:STOP}),rep('D','d',DAY)],
 'stop 3 days ago, done today':[rep('S','s',shift(DAY,-3),{actual:STOP}),rep('D','d',DAY)],
 'done today, stop today later':[rep('D','d',DAY),rep('S','s',DAY,{observedAt:DAY+'T18:00:00Z',reportedAt:DAY+'T19:00:00Z',actual:STOP})],
 'done today only':[rep('D','d',DAY)],
};
for(const [k,obs] of Object.entries(cases)){
 const r=rec(N(obs,DAY+'T20:00:00Z'));
 console.log(k.padEnd(32),'| no decl:',show(ri(r)).padEnd(22),'| decl 8d before:',show(ri([R0,...r])).padEnd(22),'| no decl, cause TIME:',show(ri(r,{reasonCategory:'TIME'})).padEnd(14),'| cause INJURY:',show(ri(r,{reasonCategory:'INJURY'})));
}
