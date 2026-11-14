// SEC focal R3 (read-only): fail closed on safety signals. What the candidate does with a report-fact row that is altered, re-sealed,
// of another athlete, of an unknown kind, relabelled, not a row, lost; and whether a screen clears what it should not.
// Usage: node s1-signal.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const ROOT=pathToFileURL(path.resolve(process.argv[2])+'/').href;
const H=await import(ROOT+'test/v1rws-helpers.mjs');
const {hash}=await import(ROOT+'src/value.mjs');
const {F,DEV,report,atSixteen,asPrescribed,ELIG}=H;
const out={};const put=(k,v)=>{out[k]=v;};
const safe=f=>{try{return f();}catch(e){return {THREW:String(e&&e.stack||e).slice(0,300)};}};
const isFact=r=>r&&r.fact==='RUN_REPORT_RECEIVED';
const scr=r=>({engine:r.status,ext:r.runFormat?.status,reason:r.runFormat?.reason??null,screen:r.runFormat?.warningSignScreen?.status??null,why:r.runFormat?.warningSignScreen?.reason??null,ids:r.runFormat?.warningSignScreen?.sessionIds??null,
 native:r.runFormat?.native??null,unreadableReports:r.runFormat?.unreadableReports??null,unreadableFormats:r.runFormat?.unreadableFormats??null,withheld:(r.runFormat?.paceEvidenceWithheld??[]).map(x=>x.reason)});
// The candidate's own naming and seal, recomputed by a client outside the custody (no key).
const reseal=row=>{const report=row.report;return {...row,eventId:`report|${report.reportId}|${hash(report).slice(0,16)}`,inputHash:hash({athleteId:row.athleteId,recordedAt:row.recordedAt,report})};};
function conflict(){ // device import first (completed), then the app's symptom-stop report of the same run (SSCTR-RWS-B-01 shape)
 const t=atSixteen(),s=t.long;
 const device={eventId:'dev-1',athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,source:{provider:'HEALTHKIT',activityId:'hk-long-1',quality:'WEARABLE_FULL'},canonicalActivityId:'hk-long-1',actual:{completed:true,minutes:30,distanceKm:5,measurement:'GPS'}};
 const app={...report(t.p,s,{}),eventId:'app-stop',actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}};
 t.step(1,6,'WEEKLY_REVIEW',{observations:[device]},'18:00');
 t.week(1,x=>x.id===s.id?app:asPrescribed(t,x),{});
 return t;
}
function next(t,fmt,elig){const save=t.fmt;t.fmt=fmt;const ss=t.p.weeks[2].sessions.filter(H.live);
 const r=t.step(2,6,'WEEKLY_REVIEW',{observations:ss.map(s=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});}),eligibility:elig});t.fmt=save;return r;}
const variant=(name,mod,eligOf)=>put(name,safe(()=>{
 const one=e=>{const t=conflict();const fmt=mod(t.fmt.map(r=>JSON.parse(JSON.stringify(r))),t);return scr(next(t,fmt,e(t)));}; // a fresh timeline for each answer
 const sameDay=t=>({...ELIG(t.day(1,6)),assessedAt:t.day(1,6)+'T12:00:00-03:00'}); // before the stop: answers nothing
 const after=t=>({...ELIG(t.day(2,6)),assessedAt:t.day(2,6)+'T19:00:00-03:00'});    // after the stop, before the review: clears a readable stop
 return {noScreen:one(eligOf??sameDay),screenAnsweredAfter:one(after)};}));
put('A0 the facts as kept (rows)',safe(()=>{const t=conflict();return t.fmt.filter(isFact).map(r=>({keys:Object.keys(r).sort(),reportKeys:Object.keys(r.report).sort(),stop:r.report.stop,recordedAt:r.recordedAt}));}));
variant('V0 kept as is',f=>f);
variant('V1 fact rows deleted',f=>f.filter(r=>!isFact(r)));
variant('V2 reason FATIGUE, not re-sealed',f=>f.map(r=>isFact(r)&&r.report.stop?{...r,report:{...r.report,stop:{...r.report.stop,reason:'FATIGUE'}}}:r));
variant('V3 reason FATIGUE, re-sealed (client recomputes)',f=>f.map(r=>isFact(r)&&r.report.stop?reseal({...r,report:{...r.report,stop:{...r.report.stop,reason:'FATIGUE'}}}):r));
variant('V4 recordedAt back 7 days, not re-sealed; screen of day 1',f=>f.map(r=>isFact(r)?{...r,recordedAt:new Date(Date.parse(r.recordedAt)-7*864e5).toISOString()}:r),t=>({...ELIG(t.day(1,1)),assessedAt:t.day(1,1)+'T12:00:00-03:00'}));
variant('V4b recordedAt back 7 days, re-sealed; screen of day 1',f=>f.map(r=>isFact(r)?reseal({...r,recordedAt:new Date(Date.parse(r.recordedAt)-7*864e5).toISOString()}):r),t=>({...ELIG(t.day(1,1)),assessedAt:t.day(1,1)+'T12:00:00-03:00'}));
variant('V4c control: as kept; screen of day 1',f=>f,t=>({...ELIG(t.day(1,1)),assessedAt:t.day(1,1)+'T12:00:00-03:00'}));
variant('V5 extra key on the row (top level)',f=>f.map(r=>isFact(r)?{...r,note:'<img src=x onerror=alert(1)>'}:r));
variant('V6 extra key inside report.stop, re-sealed',f=>f.map(r=>isFact(r)&&r.report.stop?reseal({...r,report:{...r.report,stop:{...r.report.stop,note:'dor no peito'}}}):r));
variant('V7 extra key inside report, re-sealed',f=>f.map(r=>isFact(r)?reseal({...r,report:{...r.report,note:'x'}}):r));
variant('V8 athleteId of another athlete, not re-sealed',f=>f.map(r=>isFact(r)?{...r,athleteId:'someone-else'}:r));
variant('V8b another athlete, re-sealed for that athlete',f=>f.map(r=>isFact(r)?reseal({...r,athleteId:'someone-else'}):r));
variant('V9 unknown kind (fact X)',f=>f.map(r=>isFact(r)?{...r,fact:'X'}:r));
variant('V10 relabelled as a format row (fact RUN_FORMAT_EMITTED)',f=>f.map(r=>isFact(r)?{...r,fact:'RUN_FORMAT_EMITTED'}:r));
variant('V10b relabelled as a format row, and deleted twin control',f=>f.filter(r=>!isFact(r)).concat([{fact:'RUN_FORMAT_EMITTED',eventId:'junk'}]));
variant('V11 not a row: a string',f=>[...f,'garbage']);
variant('V11b not a row: null',f=>[...f,null]);
variant('V11c not a row: a number',f=>[...f,42]);
variant('V11d not a row: an array',f=>[...f,[1,2]]);
variant('V12 the fact key removed',f=>f.map(r=>{if(!isFact(r))return r;const {fact:_x,...rest}=r;return rest;}));
variant('V13 a row of the 644cd8e format (5 report keys, old hash)',f=>f.map(r=>{if(!isFact(r))return r;const report={sessionId:r.report.sessionId,reportId:r.report.reportId,stop:r.report.stop,distanceKm:r.report.distanceKm,timed:r.report.timed},ih=hash(report);return {fact:r.fact,eventId:`report|${report.reportId}|${ih.slice(0,16)}`,athleteId:r.athleteId,recordedAt:r.recordedAt,sessionId:r.sessionId,report,inputHash:ih};}));
variant('V14 recordedAt same instant, not canonical text, re-sealed',f=>f.map(r=>isFact(r)?reseal({...r,recordedAt:r.recordedAt.replace('.000Z','Z')}):r));
// The whole record sent as something that is not a list.
put('V15 runFormatRecord not a list (object)',safe(()=>{const t=conflict();const save=t.fmt;t.fmt={};const r=next(t,t.fmt,{...ELIG(t.day(1,6)),assessedAt:t.day(1,6)+'T12:00:00-03:00'});t.fmt=save;return scr(r);}));
put('V15b runFormatRecord absent',safe(()=>{const t=conflict();const ss=t.p.weeks[2].sessions.filter(H.live);const rv=t.review(2,6,'WEEKLY_REVIEW',{observations:ss.map(s=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});})});delete rv.runFormatRecord;return scr(F.evaluateProgram(t.p,rv,DEV));}));
// The holding state: does it persist (append-only record), and what do the held answers say under it.
put('W1 unreadable row carried forward by the engine',safe(()=>{const t=conflict();t.fmt=[...t.fmt,'garbage'];const r=next(t,t.fmt,{...ELIG(t.day(2,6)),assessedAt:t.day(2,6)+'T19:00:00-03:00'});return {inRecordReturned:r.runFormatRecord.filter(x=>x==='garbage').length,...scr(r)};}));
put('W2 refused review (asOf unreadable) on an unreadable record',safe(()=>{const t=conflict();const rv={...t.review(2,6,'WEEKLY_REVIEW',{}),runFormatRecord:[...t.fmt,'garbage'],asOf:'nope'};return scr(F.evaluateProgram(t.p,rv,DEV));}));
console.log(JSON.stringify(out,null,1));
