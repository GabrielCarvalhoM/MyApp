// R2 q3: the new withdrawals and the hold weeks, from the side of a client that controls the carried records.
// (i) truncating the record of formats (the report fact a week read) suppresses the in-week withdrawal; (ii) dropping the engine's F08 hold
// fact makes a hold week count; (iii) forged facts only add withdrawals, and never outrank the warning-sign screen.
import {H,P,out} from './base.mjs';
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const plain=(t,s)=>{const o=s.sport==='RUN'?H.asPrescribed(t,s):{};return o?.eventId?o:H.report(t.p,s,o??{});};
const after=n=>{const t=H.timeline(H.racePlan({goalMinutes:48}));for(let w=0;w<n;w++)t.week(w,s=>plain(t,s));return t;};
const shown=f=>({status:f.status,reason:f.reason,withdrawn:f.withdrawn??null,observed:f.observedForecast?.forecastSeconds??null,mean:f.adherence?.mean??null});
const correction=(t,s,patch,at)=>{const row=t.row(s.id);return {eventId:row.eventId+'-v2',athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:row.localDate,actual:{...row.actual,...patch},response:row.response,correctionOf:row.eventId,correctedAt:at};};
// (i)
{
 const u=after(5),monday=u.look(5),easys=[1,2,3,4].flatMap(w=>u.runsOf(w,s=>s.role!=='QUALITY'));
 u.step(5,2,'WEEKLY_REVIEW',{observations:easys.map(s=>correction(u,s,{minutes:10,completed:false},`${u.day(5,2)}T07:00:00-03:00`))},'08:00');
 const honest=u.look(5,3);
 const ids=new Set(easys.map(s=>s.id)),cutoff=u.day(5,0);
 const truncated=u.fmt.filter(f=>!(f.fact==='RUN_REPORT_RECEIVED'&&ids.has(f.sessionId)&&f.recordedAt.slice(0,10)<cutoff));
 const r=P.evaluateProgram(u.p,{...u.review(5,3,'WEEKLY_REVIEW',{},'08:00'),runFormatRecord:truncated},u.opts);
 out('q3i',{monday:shown(monday.runForecast),honestThursday:shown(honest.runForecast),truncatedThursday:shown(r.runForecast),layer:r.runFormat.status,screen:r.runFormat.warningSignScreen?.status,withheld:(r.runFormat.paceEvidenceWithheld??[]).length,dropped:u.fmt.length-truncated.length,insights:[honest.paceInsights.status,r.paceInsights.status]});
}
// (iii) a forged break of 14 days on record and a required screen together: the screen is named first.
{
 const v=after(5),day=v.day(5,1);
 const brk={fact:'INTERRUPTION_DECLARED',athleteId:v.p.athleteId,declaredAt:`${day}T10:00:00.000Z`,interruption:{startDate:day,endDate:v.day(7,1),days:15,reasonCategory:'TRAVEL'}};
 const s=v.p.weeks[5].sessions.find(s=>s.sport==='RUN'&&H.live(s)),run=v.runs[s.id];
 const obs=run?.expression==='NATIVE'?H.nativeReport(v,s,{minutes:20,completed:false,actual:{stop:{reason:'SYMPTOM'}}}):H.report(v.p,s,{pace:345,rpe:4,completed:false,actual:{minutes:20,stop:{reason:'SYMPTOM'}}});
 const r=P.evaluateProgram(v.p,{...v.review(5,2,'WEEKLY_REVIEW',{observations:[obs]},'21:00'),actualLedger:[...v.ledger,brk]},v.opts);
 out('q3iii',{engine:r.status,layer:r.runFormat.status,screen:r.runFormat.warningSignScreen?.status,rf:shown(r.runForecast),pi:r.paceInsights.reason});
 const r2=P.evaluateProgram(v.p,{...v.review(5,2,'WEEKLY_REVIEW',{},'21:00'),actualLedger:[...v.ledger,brk]},v.opts);
 out('q3iii.break-only',{engine:r2.status,layer:r2.runFormat.status,rf:shown(r2.runForecast),pi:r2.paceInsights.reason});
}
