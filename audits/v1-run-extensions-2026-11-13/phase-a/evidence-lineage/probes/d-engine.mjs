// Diagnosis probe (read-only): what the frozen engine's own row keeps of the athlete's report after the import corrects its part of a merged row.
// The engine reads completion, load and the athlete's response from the live row; this extension reads pace evidence and history.
// Usage: node d-engine.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs');
const {atSixteen,nativeReport,weekWith,asPrescribed,report,live}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const device=(t,s,actual,eventId)=>({eventId,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-easy',source:{provider:'HEALTHKIT',activityId:'hk-easy',quality:'WEARABLE_FULL'},actual,response:UNKNOWN});
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
function go(correct){
 const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
 const easy=t.runsOf(3,s=>s.role==='EASY').find(s=>t.runs[s.id]?.expression==='NATIVE'),run=t.runs[easy.id],km=run.blocks[0].steps[0].target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 let rest=t.p.weeks[3].sessions.filter(live).filter(s=>s.id!==easy.id).map(s=>plain(t,s));
 const review=(obs,time)=>{const r=t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
 // The athlete's report: the native session, done, harder than planned and with an adverse recovery. The import: the same run, the whole distance.
 const app={...nativeReport(t,easy,{minutes:min,km,rpe:6,response:{effort:'HARDER',recovery:'ADVERSE'}}),eventId:'app-x'};
 const dev=device(t,easy,{completed:true,minutes:min,distanceKm:km,measurement:'GPS',gpsQuality:'OK'},'dev-x');
 review([app,dev],'19:00');
 if(correct)review([{...device(t,easy,{completed:true,minutes:min,distanceKm:km,measurement:'GPS',gpsQuality:'OK'},'dev-x-v2'),correctionOf:'dev-x',correctedAt:`${t.day(3,6)}T20:30:00-03:00`}],'21:00');
 const r=t.results.at(-1),row=t.row(easy.id),x=r.runSessions?.[easy.id]?.execution;
 const ev=r.weekEvidence,mine=ev?.rows?.find(q=>q.sessionId===easy.id||q.id===easy.id);
 return {liveRow:row.eventId,response:row.response,rpe:row.actual.rpe??null,citesFormat:typeof row.actual.formatHash==='string',execution:{expression:x?.expression,status:x?.status,paceEvidence:x?.paceEvidence},
  engine:{status:r.status,adverseSessions:ev?.adverseSessions??null,weekRow:mine?{status:mine.status,adverse:mine.adverse??null,response:mine.response??null}:null}};
}
console.log(JSON.stringify({merged:go(false),afterImportCorrection:go(true)},null,1));
