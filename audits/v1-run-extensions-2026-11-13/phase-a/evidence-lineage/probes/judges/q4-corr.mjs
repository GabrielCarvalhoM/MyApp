// QRE-R4 probe: a correction of the device's part of a merged row (the merged row is retired whole; the live row is the device's re-sync alone).
// Is the app's statement (a further recording) still read? Readers: V1RC P1 (needs an effort), the S3 sizing source (latest run of the class),
// the execution's paceWithheld, and the history. Compared with the same record without the correction.
// Usage: node q4-corr.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2];
const imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs');
const {atSixteen,nativeReport,weekWith,asPrescribed,report,live,DEV,F}=H;
const RF=await imp('src/v1-run-format.mjs');
const RH=await imp('src/v1-run-history.mjs');
const V=H.VALUES;
const safe=f=>{try{return f();}catch(e){return {THREW:String(e&&e.stack||e).slice(0,400)};}};
const obsOf=(t,w,id,list)=>t.p.weeks[w].sessions.filter(live).flatMap(s=>{if(s.id===id)return list;const o=s.sport==='RUN'?asPrescribed(t,s):{};return [o?.eventId?o:report(t.p,s,o??{})];});
const dev=(t,s,actual,id)=>({eventId:'dev-'+id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-easy',source:{provider:'HEALTHKIT',activityId:'hk-easy',quality:'WEARABLE_FULL'},actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'}});
const band=r=>{const b=r?.runCalibration?.paceBands?.EASY;return b?(b.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b.status):null;};
function go({correct,rpeOnDevice,devMinutes=63,family='EASY'}){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const s=t.runsOf(3,x=>x.role===family).find(x=>t.runs[x.id]?.expression==='NATIVE')??t.runsOf(3,x=>x.role===family)[0];const run=t.runs[s.id];
 const app={...nativeReport(t,s,{minutes:63,rpe:3,actual:{formatHash:run.timeFormatHash,segments:[{distanceKm:4.4,measurement:'GPS'}]}}),eventId:'app-x'};
 const d=dev(t,s,{completed:true,minutes:devMinutes,distanceKm:6.6,measurement:'GPS',gpsQuality:'OK',segments:[],...(rpeOnDevice?{rpe:3}:{})},'x');
 t.step(3,6,'WEEKLY_REVIEW',{observations:obsOf(t,3,s.id,[app,d])},'19:00');
 if(correct){const c={...dev(t,s,{completed:true,minutes:devMinutes,distanceKm:6.6,measurement:'GPS',gpsQuality:'OK',...(rpeOnDevice?{rpe:3}:{})},'x-v2'),correctionOf:d.eventId,correctedAt:t.day(3,6)+'T21:00:00-03:00'};t.step(3,6,'WEEKLY_REVIEW',{observations:[c]},'21:30');}
 const row=t.row(s.id),facts=RF.readReportFacts(t.fmt,t.p.athleteId,V);
 const r4=t.week(4,weekWith(t,4,null,null));
 const hist=RH.runHistory({ledger:t.ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180,reportsOf:o=>RF.reportsVerdict(o,facts,V)},V).runs.find(x=>x.sessionId===s.id);
 // the next week's easy native sessions as delivered (sizing reads S3 from the latest run of the class)
 const r5=t.week(5,weekWith(t,5,null,null));
 const sized=Object.values(r5.runSessions??{}).filter(x=>!x.past&&x.family===family).map(x=>({id:x.sessionId,expr:x.expression,km:x.estimate?.distanceKm?.low??null,min:x.estimate?.durationMinutes,planning:JSON.stringify(x.planning??null).slice(0,160)}));
 return {family,row:{id:row.eventId,km:row.actual.distanceKm,min:row.actual.minutes,rpe:row.actual.rpe??null,segs:JSON.stringify(row.actual.segments),merged:row.provenance?.mergedSourceIds??null,correctionOf:row.correctionOf??null},
  verdict:RF.reportsVerdict(row,facts,V),week4:{band:band(r4),withheld:(r4.runFormat?.paceEvidenceWithheld??[]).map(x=>x.reason)},history:{paceWithheld:hist?.paceWithheld,referenceKm:hist?.referenceKm},week5:{band:band(r5),sized}};
}
const out={};
for(const correct of [false,true])for(const rpeOnDevice of [false,true])out[`correct=${correct},rpeOnDevice=${rpeOnDevice}`]=safe(()=>go({correct,rpeOnDevice}));
out['LONG correct=true rpe=true']=safe(()=>go({correct:true,rpeOnDevice:true,family:'LONG'}));
out['LONG correct=false rpe=true']=safe(()=>go({correct:false,rpeOnDevice:true,family:'LONG'}));
console.log(JSON.stringify(out,null,1));
