// Diagnosis probe (read-only): the same loss for what the athlete says that is not a distance fact. The athlete reports an easy run as one whole
// measurement (6.6 km in the whole minutes: a slow run) and says why it is not comparable: heat, or walk breaks. The import of the same run
// agrees and merges. Then the import re-syncs its part. Read: the easy band of the next week today; what the weaker reading would give (the
// kept distance facts read on every report in force: those statements are not report facts); and what the contract gives (oracle.mjs).
// Usage: node d-other-statements.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {admission} from './oracle.mjs';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');
const {atSixteen,nativeReport,weekWith,asPrescribed,report,live,VALUES:V}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const band=r=>{const b=r?.runCalibration?.paceBands?.EASY;return b?.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b?.status??null;};
function go(said,correct){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const s=t.runsOf(3,q=>q.role==='EASY').find(q=>t.runs[q.id]?.expression==='NATIVE'),run=t.runs[s.id],km=Math.round(run.blocks[0].steps[0].target.metres*0.6/10)/100,min=Math.round(run.estimate.durationMinutes.low);
 let rest=t.p.weeks[3].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
 const review=(obs,time)=>{const r=t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
 const app={...nativeReport(t,s,{minutes:min,rpe:3,actual:{formatHash:run.timeFormatHash,distanceKm:km,measurement:'GPS',gpsQuality:'OK',...said}}),eventId:'app-x'};
 const dev=id=>({eventId:id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-1',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min,distanceKm:km,measurement:'GPS',gpsQuality:'OK',rpe:3},response:UNKNOWN});
 review([app],'18:00');review([dev('dev-x')],'19:00');
 if(correct)review([{...dev('dev-x-v2'),correctionOf:'dev-x',correctedAt:`${t.day(3,6)}T19:30:00-03:00`}],'20:00');
 const row=t.row(s.id),reports=[{id:'app-x',speaker:'ATHLETE',at:1},{id:'dev-x',speaker:'DEVICE:hk-1',at:2},...(correct?[{id:'dev-x-v2',speaker:'DEVICE:hk-1',at:3}]:[])],arg={ledger:t.ledger,formatRecord:t.fmt,reports,sessionId:s.id,athleteId:t.p.athleteId};
 const o=admission(row,arg,V),next=t.week(4,weekWith(t,4,null,null));
 return {live:row.eventId,rowConditions:row.actual.conditions??null,rowWalkBreaks:row.actual.walkBreaks??null,today:{easyNextWeek:band(next),withheld:(next.runFormat?.paceEvidenceWithheld??[]).filter(q=>q.sessionId===s.id).map(q=>q.reason)},
  weakerReading:o.factsOnEveryReportInForce,contract:{verdict:o.verdict,notCarried:o.notCarried}};
}
const out={};
for(const [name,said] of [['says nothing more (control)',{}],['says HEAT',{conditions:['HEAT']}],['says walk breaks',{walkBreaks:true}]])out[name]={merged:go(said,false),afterTheImportReSyncs:go(said,true)};
console.log(JSON.stringify(out,null,1));
