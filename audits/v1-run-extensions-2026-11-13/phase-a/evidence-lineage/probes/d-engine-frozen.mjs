// Diagnosis probe (read-only): the same question as d-engine.mjs through the frozen V1 entry point alone (v1-index.mjs: no run calibration, no
// run formats). The athlete reports a planned run as done with an adverse recovery; the import of the same run merges; the import then re-syncs.
// Usage: node d-engine-frozen.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs');
const {timeline,sixteen,report,live,V1,X}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
function go(entry,correct){
 const t=timeline(sixteen(),{entry});t.week(0,()=>({pace:340,rpe:4}));
 const s=t.runsOf(1,q=>q.role==='EASY')[0],min=s.prescription.durationMinutes;
 let rest=t.p.weeks[1].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>report(t.p,q,q.sport==='RUN'?{pace:340,rpe:4}:{}));
 const review=(obs,time)=>{const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
 const app={...report(t.p,s,{rpe:6,response:{effort:'HARDER',recovery:'ADVERSE'}}),eventId:'app-x'};
 const dev=id=>({eventId:id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-1',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min},response:UNKNOWN});
 review([app,dev('dev-x')],'19:00');
 if(correct)review([{...dev('dev-x-v2'),correctionOf:'dev-x',correctedAt:`${t.day(1,6)}T20:30:00-03:00`}],'21:00');
 const r=t.results.at(-1),row=t.row(s.id);
 return {liveRow:row.eventId,recovery:row.response.recovery,effort:row.response.effort,status:r.status,adverseSessions:r.weekEvidence?.adverseSessions??null,systemicConvergence:r.weekEvidence?.systemicConvergence??null};
}
const out={};
for(const [name,entry] of [['v1-index (COACHINGCORE-V1-FREEZE-1)',V1],['v1-run-index (V1RC freeze)',X]])out[name]={merged:go(entry,false),afterImportCorrection:go(entry,true)};
console.log(JSON.stringify(out,null,1));
