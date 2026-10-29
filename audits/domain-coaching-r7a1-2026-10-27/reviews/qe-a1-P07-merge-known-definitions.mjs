// R7A1-QE-r1 P07: QE-R7A-05 mechanism. `mergeActual` ranks entries by `exerciseFacts` (a load counts as known only when its unit is
// readable, kgOf) but `filled` fills a field only when it is null or undefined. A set whose load is present but unreadable (unit missing,
// 'LBS', 'pounds') is therefore "unknown" for the ranking and for every reader (strengthLogs asks about it) yet "known" for the fill, so the
// other report's readable load is never taken. Oracle (I4): adding an agreeing report never makes a load the other report states known
// unknown, in either arrival order; compared with each report alone. Also: three agreeing reports in all six arrival orders.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,runtime,make,at,obs,print} from './qe-a1-lib.mjs';
const out={probe:'R7A1-QE-P07',cases:{}};
const perms=a=>a.length<=1?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(r=>[x,...r]));
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT),{R,opts}=RT,w=0;
 const {normalizeObservations}=await import(pathToFileURL(path.join(tag==='A1'?path.join(ROOT,'CoachingCore'):path.join(ROOT,'audits/domain-coaching-r7a1-2026-10-27/freeze2-source/CoachingCore'),'src/r6-provenance.mjs')).href);
 const t=H.start({id:'qa1-p07',schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6}},0),s=t.p.weeks[w].sessions.find(x=>x.sport==='STRENGTH'&&x.prescription);
 const sq=s.prescription.exercises.find(e=>e.id==='back-squat');
 // Manual: loads and reps, no RIR (6 known). Device: reps and RIR, its load present with an unreadable unit (6 known by exerciseFacts).
 const manual={...obs(t.p,s),eventId:'p07-manual',source:{provider:'MANUAL'}};manual.actual.exercises=manual.actual.exercises.map(e=>e.id!=='back-squat'?e:{id:e.id,sets:e.sets.map(({rir,...x})=>x)});
 const variants={unitMissing:{value:sq.load.value},unitLBS:{value:Math.round(sq.load.value*2.2046),unit:'LBS',convention:'TOTAL'},unitPounds:{value:Math.round(sq.load.value*2.2046),unit:'pounds',convention:'TOTAL'},loadNull:null};
 for(const [vk,ld] of Object.entries(variants)){
  const device={...obs(t.p,s),eventId:'p07-device-'+vk,observedAt:manual.observedAt,source:{provider:'WEARABLE:GENERIC',activityId:'act-p07-'+vk,quality:'WEARABLE_FULL'}};device.actual.minutes+=1;
  device.actual.exercises=device.actual.exercises.map(e=>e.id!=='back-squat'?e:{id:e.id,sets:e.sets.map(x=>ld===null?{reps:x.reps,rir:x.rir}:{...x,load:ld})});
  const run=list=>{const T=H.copy(t),r=R.evaluateProgram(T.p,{...at(T.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:list}),actualLedger:[]},opts);const log=r.weekEvidence?.rows?.find(x=>x.sessionId===s.id)?.logs?.['back-squat']??null;return {status:r.status+'/'+r.action,squatLoad:log?.load??null,unitUnknown:log?.unitUnknown??null,loadQuestion:(r.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>q.reason),nextSquat:(({load,mode,loadTick})=>({load,mode,loadTick}))(r.proposal?.stateTrace?.[w+1]?.strength?.exercises?.['back-squat']??t.p.stateTrace[w+1].strength.exercises['back-squat'])};};
  out.cases[`${tag}:${vk}`]={manualOnly:run([manual]),deviceOnly:run([device]),manualThenDevice:run([manual,device]),deviceThenManual:run([device,manual])};
 }
 // Three agreeing partial reports of one session (loads only, reps only, RIR only): every arrival order must give the same merged facts.
 const part=(id,keep)=>{const o={...obs(t.p,s),eventId:'p07-3-'+id,observedAt:manual.observedAt,source:{provider:id==='L'?'MANUAL':'WEARABLE:GENERIC',...(id==='L'?{}:{activityId:'act-3-'+id,quality:'WEARABLE_FULL'})}};o.actual.exercises=o.actual.exercises.map(e=>({id:e.id,sets:e.sets.map(x=>Object.fromEntries(Object.entries(x).filter(([k])=>keep.includes(k))))}));return o;};
 const three=[part('L',['load']),part('P',['reps']),part('Q',['rir'])],merged={};
 for(const order of perms([0,1,2])){const n=normalizeObservations(order.map(i=>three[i]),{athleteId:t.p.athleteId,asOf:at(t.p,w,6,'21:00',{kind:'X'}).asOf,maximumAgeDays:36500});const e=n.accepted[0]?.actual?.exercises?.find(x=>x.id==='back-squat');merged[order.join('')]=JSON.stringify(e?.sets?.map(x=>[x.load?.value??null,x.reps??null,x.rir??null]));}
 out.cases[`${tag}:threeReports`]={byOrder:merged,sameEveryOrder:new Set(Object.values(merged)).size===1};
}
print(out);
