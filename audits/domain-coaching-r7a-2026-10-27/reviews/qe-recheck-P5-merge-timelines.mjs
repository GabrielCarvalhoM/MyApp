// QE re-check probe P5 (R7A-QE-r2, FREEZE-2): reach of the P4 merge findings over weekly-reviewed timelines.
// 5a: every strength session reported twice: manual (loads and reps, no RIR) and an agreeing device report (reps and RIR, no loads,
//     device activity id). Compared with the field union of the two (manual plus RIR). Final known loads and steps after 10 weeks.
// 5b: every run reported three times (manual, device, manual-declared SELF_REPORT; minutes D, D+2, D+1, all pairwise agreeing) in three
//     arrival orders. Next-week run prescriptions compared across orders.
// Synthetic data, DEV_TEST_ONLY authority. QE_RUNTIME=pre runs the R6 closure runtime.
import {cur,pre,opts,intake,review,obs,out} from './qe-lib.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const OKR={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const at=s=>s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z');
const res={runtime:tag};
// ---------- 5a ----------
{
 const run=mode=>{
  let p=R.generateProgram(intake({id:'qe-rc-P5a',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];const log=[];
  for(let w=0;w<10;w++){
   const list=[];
   for(const s of p.weeks[w].sessions.filter(x=>x.prescription&&x.status!=='SKIPPED')){
    const o=obs(p,s);
    if(s.sport==='STRENGTH'){
     if(mode==='union'){list.push(o);continue;}
     o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(({rir,...x})=>x)}));list.push(o);
     if(mode==='merged')list.push({eventId:`dev-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:at(s),reportedAt:s.date+'T21:00:00Z',actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir}))}))},response:{...OKR},source:{provider:'APPLE_HEALTH',activityId:'hk-'+s.id}});
    }else list.push(o);
   }
   const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
  }
  const st=p.stateTrace[10].strength.exercises;
  return {log:log.join(' '),finalKnownLoads:Object.fromEntries(Object.entries(st).filter(([,e])=>e.mode==='KNOWN').map(([id,e])=>[id,e.load])),sources:Object.fromEntries(Object.entries(st).map(([id,e])=>[id,e.source]))};
 };
 const merged=run('merged'),union=run('union'),manualNoRir=run('manualOnly');
 res['5a_tenWeeks']={manualWithoutRir:manualNoRir,manualPlusDevice_merged:merged,fieldUnion_manualWithRir:union,
  mergedEqualsUnion:JSON.stringify(merged.finalKnownLoads)===JSON.stringify(union.finalKnownLoads),
  loadsBehindUnion:Object.entries(union.finalKnownLoads).filter(([id,v])=>merged.finalKnownLoads[id]!==v).map(([id,v])=>`${id}: merged ${merged.finalKnownLoads[id]} vs union ${v}`)};
}
// ---------- 5b ----------
{
 const orders={MWS:[9,10,11],WMS:[10,9,11],SWM:[11,10,9]};
 const runOrder=hours=>{
  let p=R.generateProgram(intake({id:'qe-rc-P5b',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];const next=[];
  for(let w=0;w<10;w++){
   const list=[];
   for(const s of p.weeks[w].sessions.filter(x=>x.prescription&&x.status!=='SKIPPED')){
    if(s.sport!=='RUN'){list.push(obs(p,s));continue;}
    const D=s.prescription.durationMinutes,mk=(id,m,src,h)=>({eventId:`${id}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:at(s),reportedAt:`${s.date}T${String(h).padStart(2,'0')}:30:00Z`,actual:{completed:true,minutes:m},response:{...OKR},...(src?{source:src}:{})});
    list.push(mk('M',D,null,hours[0]),mk('W',D+2,{provider:'APPLE_HEALTH',activityId:'hk-'+s.id},hours[1]),mk('S',D+1,{quality:'SELF_REPORT'},hours[2]));
   }
   const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
   next.push(p.weeks[w+1].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join(','));
  }
  return next;
 };
 const by=Object.fromEntries(Object.entries(orders).map(([k,h])=>[k,runOrder(h)]));
 const diffWeeks=by.MWS.map((x,i)=>x!==by.WMS[i]||x!==by.SWM[i]?`w${i+1}: MWS ${x} | WMS ${by.WMS[i]} | SWM ${by.SWM[i]}`:null).filter(Boolean);
 res['5b_runTriplesTenWeeks']={nextWeekRunsByOrder:by,weeksThatDifferByArrivalOrder:diffWeeks};
}
out('P5',res);
