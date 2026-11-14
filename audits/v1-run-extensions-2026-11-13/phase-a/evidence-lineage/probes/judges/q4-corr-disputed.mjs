// QRE-R4 probe: the D-01 path for the other reasons: a dispute (app 11 km measured, device 6.6 km) and no duration (device without minutes),
// then the device's re-sync correction (with an effort). Usage: node q4-corr-disputed.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';import path from 'node:path';
const root=process.argv[2];const imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs');const {atSixteen,nativeReport,weekWith,asPrescribed,report,live,DEV,F}=H;
const obsOf=(t,w,id,list)=>t.p.weeks[w].sessions.filter(live).flatMap(s=>{if(s.id===id)return list;const o=s.sport==='RUN'?asPrescribed(t,s):{};return [o?.eventId?o:report(t.p,s,o??{})];});
const dev=(t,s,actual,id)=>({eventId:'dev-'+id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-easy',source:{provider:'HEALTHKIT',activityId:'hk-easy',quality:'WEARABLE_FULL'},actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'}});
const out={};
for(const kind of ['disputed','untimed']){for(const correct of [false,true]){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const s=t.runsOf(3,x=>x.role==='EASY').find(x=>t.runs[x.id]?.expression==='NATIVE');const run=t.runs[s.id];
 const app={...nativeReport(t,s,{minutes:63,km:kind==='disputed'?11:null,rpe:3,actual:{formatHash:run.timeFormatHash}}),eventId:'app-x'};
 const d=dev(t,s,{completed:true,...(kind==='disputed'?{minutes:63}:{}),distanceKm:6.6,measurement:'GPS',gpsQuality:'OK',rpe:3},'x');
 t.step(3,6,'WEEKLY_REVIEW',{observations:obsOf(t,3,s.id,[app,d])},'19:00');
 if(correct)t.step(3,6,'WEEKLY_REVIEW',{observations:[{...dev(t,s,{completed:true,minutes:63,distanceKm:6.6,measurement:'GPS',gpsQuality:'OK',rpe:3},'x-v2'),correctionOf:d.eventId,correctedAt:t.day(3,6)+'T21:00:00-03:00'}]},'21:30');
 const row=t.row(s.id),r=t.week(4,weekWith(t,4,null,null)),b=r.runCalibration?.paceBands?.EASY;
 out[kind+(correct?' + device correction':'')]={row:{id:row.eventId,km:row.actual.distanceKm,min:row.actual.minutes},easy:b&&[b.fastSecondsPerKm,b.slowSecondsPerKm],withheld:(r.runFormat?.paceEvidenceWithheld??[]).map(x=>x.reason)};
}}
console.log(JSON.stringify(out));
