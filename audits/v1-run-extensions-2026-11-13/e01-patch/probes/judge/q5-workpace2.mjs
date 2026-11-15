// QRE R5: does the masked whole-row reason (q5-workpace) reach a band? Every quality session of weeks 3 to 6 reported with a work pace, the watch
// flagging its GPS POOR (merged), then the athlete correcting their own report (variant). Usage: node q5-workpace2.mjs <CoachingCore> [pace] [rpe]
import {load,UNKNOWN} from './lib.mjs';
const L=await load(process.argv[2]),{H}=L,pace=Number(process.argv[3]??255),rpe=Number(process.argv[4]??7);
function go(variant){
 const t=H.atSixteen();t.week(1,H.weekWith(t,1,null,null));t.week(2,H.weekWith(t,2,null,null));
 const seen=[];let last=null;
 for(const w of [3,4,5,6]){
  const qs=t.runsOf(w,s=>s.role==='QUALITY');
  const rest=t.p.weeks[w].sessions.filter(H.live).filter(s=>!qs.includes(s)).map(s=>{const o=s.sport==='RUN'?H.asPrescribed(t,s):{};return o?.eventId?o:H.report(t.p,s,o??{});});
  const obs=[],corr=[];
  for(const q of qs){
   const run=t.runs[q.id],base=H.report(t.p,q,{workPace:pace,rpe});
   const a1={...base,eventId:'app-'+q.id,actual:{...base.actual,formatHash:run.timeFormatHash}};
   const d1={eventId:'dev-'+q.id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:'hk-'+q.id,source:{provider:'HEALTHKIT',activityId:'hk-'+q.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},response:UNKNOWN};
   obs.push(a1,d1);
   if(variant!=='merged only'){const extra=variant==='lists'?{segments:[{distanceKm:4,measurement:'GPS'}]}:{};corr.push({...a1,eventId:a1.eventId+'-v2',actual:{...a1.actual,...extra},correctionOf:a1.eventId,correctedAt:`${t.day(w,6)}T19:30:00-03:00`});}
   seen.push(q.id);
  }
  t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},'18:00');
  last=corr.length?t.step(w,6,'WEEKLY_REVIEW',{observations:corr},'20:00'):t.results.at(-1);
 }
 const r=t.week(7,H.weekWith(t,7,null,null)),bands=Object.fromEntries(Object.entries(r.runCalibration?.paceBands??{}).map(([k,b])=>[k,b.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm,b.basis??null]:b.status]));
 return {sessions:seen.length,withheld:(r.runFormat.paceEvidenceWithheld??[]).filter(x=>seen.includes(x.sessionId)).map(x=>x.reason),hash:r.runCalibration?.hash?.slice(0,16),bands,trainingNotes:JSON.stringify(r.runCalibration?.recalibration??r.runCalibration?.training??null).slice(0,400)};
}
const out={};for(const v of ['merged only','plain','lists'])try{out[v]=go(v);}catch(e){out[v]={THREW:String(e.stack).slice(0,500)};}
console.log(JSON.stringify(out,null,1));
