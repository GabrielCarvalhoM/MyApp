// Diagnosis probe (read-only): two rows of the acceptance matrix the main matrix does not hold.
// (a) A late correction: the import re-syncs its part in the middle of the following week.
// (b) The race of the judge's probe (rows as the engine keeps them), read by the lineage oracle, with and without a fact of the correction.
// Usage: node d-late-race.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {admission} from './oracle.mjs';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');
const {atSixteen,nativeReport,weekWith,asPrescribed,report,live,timeline,raceTen,VALUES:V}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const band=r=>{const b=r?.runCalibration?.paceBands?.EASY;return b?.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b?.status??null;};
function late(){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const s=t.runsOf(3,q=>q.role==='EASY').find(q=>t.runs[q.id]?.expression==='NATIVE'),run=t.runs[s.id],km=run.blocks[0].steps[0].target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 const app={...nativeReport(t,s,{minutes:min,rpe:3,actual:{formatHash:run.timeFormatHash,segments:[{distanceKm:Math.round(km*40)/100,measurement:'GPS'}]}}),eventId:'app-x'};
 const dev=id=>({eventId:id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-1',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min,distanceKm:Math.round(km*60)/100,measurement:'GPS',gpsQuality:'OK',rpe:3},response:UNKNOWN});
 t.week(3,weekWith(t,3,s.id,app));t.step(3,6,'WEEKLY_REVIEW',{observations:[dev('dev-x')]},'22:00');
 const mid=t.step(4,2,'WEEKLY_REVIEW',{observations:[{...dev('dev-x-v2'),correctionOf:'dev-x',correctedAt:`${t.day(4,2)}T09:00:00-03:00`}]},'10:00');
 const row=t.row(s.id),reports=[{id:'app-x',speaker:'ATHLETE',at:1},{id:'dev-x',speaker:'DEVICE:hk-1',at:2},{id:'dev-x-v2',speaker:'DEVICE:hk-1',at:3}];
 const o=admission(row,{ledger:t.ledger,formatRecord:t.fmt,reports,sessionId:s.id,athleteId:t.p.athleteId},V),end=t.week(4,weekWith(t,4,null,null));
 return {engineOnTheLateCorrection:mid.status,rejected:(mid.provenance?.excluded??[]).map(e=>e.eventId+':'+e.reason),live:row.eventId,today:{verdict:RF.reportsVerdict(row,RF.readReportFacts(t.fmt,t.p.athleteId,V),V),easyAtTheCorrection:band(mid),easyAfterTheWeek:band(end)},contract:{verdict:o.verdict,inForce:o.inForce,notCarried:o.notCarried,replaced:o.replaced}};
}
function race(){
 const p=timeline(raceTen()).p,r=p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),day=r.date;
 const ctx={sessionId:r.id,sport:'RUN',role:'RACE',family:'RACE',mode:'EASY',weekIndex:r.weekIndex};
 const row=(id,actual,extra={})=>({eventId:id,athleteId:p.athleteId,sessionId:r.id,localDate:day,observedAt:`${day}T15:00:00.000Z`,partial:false,actual:{completed:true,minutes:50,measurement:'GPS',...actual},response:UNKNOWN,provenance:{sourceQuality:'WEARABLE_FULL'},context:ctx,...extra});
 const obs={app:{eventId:'app-race',sessionId:r.id,actual:{completed:true,minutes:50,segments:[{distanceKm:4,measurement:'GPS'}]}},dev:{eventId:'dev-race',sessionId:r.id,source:{activityId:'hk'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK'}},v2:{eventId:'dev-race-v2',sessionId:r.id,source:{activityId:'hk'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK'}}};
 const facts=which=>{let rec=RF.appendReportFacts([],[RF.reportFactOf(obs.app,V),RF.reportFactOf(obs.dev,V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:`${day}T16:00:00.000Z`},V).record;if(which==='with')rec=RF.appendReportFacts(rec,[RF.reportFactOf(obs.v2,V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:`${day}T18:00:00.000Z`},V).record;return rec;};
 const merged=row('app-race',{distanceKm:6,gpsQuality:'OK',segments:[{distanceKm:4,measurement:'GPS'}]},{provenance:{sourceQuality:'WEARABLE_FULL',mergedSourceIds:['app-race','dev-race']}}),ledger=[{...merged,superseded:true,supersededBy:'dev-race-v2'},row('dev-race-v2',{distanceKm:6,gpsQuality:'OK'},{correctionOf:'dev-race'})];
 const known=[{id:'app-race',speaker:'ATHLETE',at:1},{id:'dev-race',speaker:'DEVICE:hk',at:1}],out={};
 for(const which of ['without','with']){const rec=facts(which),o=admission(ledger[1],{ledger,formatRecord:rec,reports:which==='with'?[...known,{id:'dev-race-v2',speaker:'DEVICE:hk',at:2}]:known,sessionId:r.id,athleteId:p.athleteId},V);out[which+' a fact of the correction']={todayVerdictOnTheLiveRow:RF.reportsVerdict(ledger[1],RF.readReportFacts(rec,p.athleteId,V),V),contract:{verdict:o.verdict,inForce:o.inForce,notCarried:o.notCarried,replaced:o.replaced}};}
 return out;
}
console.log(JSON.stringify({lateCorrection:late(),race:race()},null,1));
