// Diagnosis probe (read-only): can a caller, with the engine as it is frozen, keep the athlete's statements on the engine's row when the import
// corrects its part? Tried: with the import's correction, the athlete's standing report is sent again as a new report (a new event id), in the
// same review or in the next one; and sent again under its old event id (a replay).
// Usage: node d-recompose.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');
const {atSixteen,nativeReport,weekWith,asPrescribed,report,live,VALUES:V}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const band=r=>{const b=r?.runCalibration?.paceBands?.EASY;return b?.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b?.status??null;};
function go(how){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],km=run.blocks[0].steps[0].target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 let rest=t.p.weeks[3].sessions.filter(live).filter(s=>s.id!==easy.id).map(s=>plain(t,s));
 const review=(obs,time)=>{const r=t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
 // The athlete: the run by time, a second recording of 4.4 km, harder than planned, adverse recovery. The import: the first file over the whole minutes.
 const app=id=>{const o={...nativeReport(t,easy,{minutes:min,rpe:3,response:{effort:'HARDER',recovery:'ADVERSE'},actual:{segments:[{distanceKm:Math.round(km*40)/100,measurement:'GPS'}]}}),eventId:id};o.actual.formatHash=run.timeFormatHash;return o;};
 const dev=(id,extra={})=>({eventId:id,athleteId:t.p.athleteId,sessionId:easy.id,occurrenceDate:easy.date,canonicalActivityId:'hk-1',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min,distanceKm:Math.round(km*60)/100,measurement:'GPS',gpsQuality:'OK',rpe:3},response:UNKNOWN,...extra});
 review([app('app-x'),dev('dev-x')],'18:00');
 const corr=dev('dev-x-v2',{correctionOf:'dev-x',correctedAt:`${t.day(3,6)}T18:30:00-03:00`});
 if(how==='correction alone')review([corr],'19:00');
 if(how==='correction + the athlete\'s report again, new id, same review')review([corr,app('app-x-again')],'19:00');
 if(how==='correction, then the athlete\'s report again, new id, next review'){review([corr],'19:00');review([app('app-x-again')],'20:00');}
 if(how==='correction + the athlete\'s report replayed under its old id')review([corr,app('app-x')],'19:00');
 const r=t.results.at(-1),row=t.row(easy.id),facts=RF.readReportFacts(t.fmt,t.p.athleteId,V),next=t.week(4,weekWith(t,4,null,null));
 return {live:row.eventId,merged:row.provenance?.mergedSourceIds??null,recovery:row.response.recovery,effort:row.response.effort,km:row.actual.distanceKm??null,list:(row.actual.segments??[]).length,citesFormat:typeof row.actual.formatHash==='string',
  duplicates:(r.provenance?.duplicates??[]).filter(d=>/app-x|dev-x/.test(d.eventId)).map(d=>d.eventId+':'+d.reason),adverseSessions:r.weekEvidence?.adverseSessions??null,verdictToday:RF.reportsVerdict(row,facts,V),easyNextWeek:band(next),withheld:(next.runFormat?.paceEvidenceWithheld??[]).filter(q=>q.sessionId===easy.id).map(q=>q.reason)};
}
const out={};
for(const how of ['merged, no correction','correction alone','correction + the athlete\'s report again, new id, same review','correction, then the athlete\'s report again, new id, next review','correction + the athlete\'s report replayed under its old id'])try{out[how]=go(how);}catch(e){out[how]={THREW:String(e?.stack??e).slice(0,400)};}
console.log(JSON.stringify(out,null,1));
