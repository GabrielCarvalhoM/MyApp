// Normalization Consistency (F1/F2/F3): sporting impact through the composed engine. Usage: node dose-impact.mjs <CoachingCore root>.
// Synthetic athlete only; read-only. Run it on FREEZE-4 (e704180) and on the candidate and compare. Plan A (8 weeks); week 0 reported in full on
// its Sunday, run d1 by the athlete and by the watch (HK-D1, merged). Running minutes are EASY + LONG only (SSCTR C-SR2-1); optional walks
// (role WALK) and strength are listed apart.
// Journeys:
//   none  control
//   F1    the next morning a correction of run d3 (10 min shorter) is reviewed; that evening a watch report of d3 (15 min longer, HK-D3) arrives,
//         reported the evening before the correction (a late sync)
//   F1a   as F1, the late watch report agreeing with the correction (a late sync of the same execution)
//   F2    two days later a correction of run d3 carries d1's merged watch activity HK-D1 (SEC-R2 journey B)
//   F3    that evening the athlete corrects their own d1 part to half the minutes, recovery adverse, against the watch voice in force; a later
//         review the same week brings nothing new
import {pathToFileURL} from 'node:url';
import path from 'node:path';import fs from 'node:fs';
const root=process.argv[2],imp=p=>import(pathToFileURL(path.join(root,p)).href);
const S=await imp('src/v1-safety-index.mjs');
const {client,athleteA,reportOf,liveSessions,at,ELIG,addDays}=await imp('test/v1core-helpers.mjs');
const {factsFromLedger}=await imp('src/v1-run-history.mjs');const {FORMAT_VALUES_URL}=await imp('src/v1-run-format.mjs');
const VALUES=JSON.parse(fs.readFileSync(FORMAT_VALUES_URL,'utf8')),U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
function journey(kind){
 const c=client(S);c.onboard(athleteA({weeks:8,id:'ncc-dose'}));const ss=liveSessions(c.env,0),day=addDays(c.env.program.startDate,6);
 const obs=ss.map(s=>reportOf(c.env,s)),d1=obs.find(o=>o.sessionId==='w0-run-d1');
 obs.push({...d1,eventId:'dev-d1',actual:{...d1.actual},response:U,source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'});
 c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:obs},'w0');
 const x=id=>c.env.actualLedger.find(o=>o.eventId===id&&!o.superseded),d3=x('aif-w0-run-d3'),dn=addDays(day,1),answers=[];let last=at(day,'23:00');
 if(kind==='F1'||kind==='F1a'){
  answers.push(c.review('WEEKLY_REVIEW',at(dn,'08:00'),{eligibility:ELIG(dn),observations:[{sessionId:d3.sessionId,occurrenceDate:d3.localDate,eventId:'d3-fix',correctionOf:d3.eventId,correctedAt:at(dn,'07:00'),reportedAt:at(dn,'07:00'),actual:{...d3.actual,minutes:d3.actual.minutes-10},response:d3.response}]},'fix'));
  const m=kind==='F1'?d3.actual.minutes+15:d3.actual.minutes-10;
  answers.push(c.review('WEEKLY_REVIEW',at(dn,'20:00'),{eligibility:ELIG(dn),observations:[{sessionId:d3.sessionId,occurrenceDate:d3.localDate,eventId:'d3-watch',reportedAt:at(day,'21:00'),actual:{...d3.actual,minutes:m},response:U,source:{provider:'HEALTHKIT',activityId:'HK-D3',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D3'}]},'late'));last=at(dn,'21:00');
 }
 if(kind==='F2'){const d8=addDays(day,2);
  answers.push(c.review('WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[{sessionId:d3.sessionId,occurrenceDate:d3.localDate,eventId:'d3-borrow',correctionOf:d3.eventId,correctedAt:at(d8,'07:00'),reportedAt:at(d8,'07:00'),actual:{...d3.actual,minutes:d3.actual.minutes-5},response:d3.response,source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'}]},'borrow'));last=at(d8,'21:00');}
 if(kind==='F3'){const row=x(c.env.actualLedger.find(o=>o.sessionId==='w0-run-d1'&&!o.superseded).eventId),part=Object.keys(row.provenance.parts).find(id=>id!=='dev-d1');
  answers.push(c.review('WEEKLY_REVIEW',at(day,'21:00'),{eligibility:ELIG(day),observations:[{sessionId:'w0-run-d1',occurrenceDate:row.localDate,eventId:'d1-fix',correctionOf:part,correctedAt:at(day,'20:30'),reportedAt:at(day,'20:30'),actual:{...row.actual,minutes:Math.round(row.actual.minutes/2)},response:{...U,recovery:'ADVERSE'}}]},'dispute'));}
 const L=c.env.actualLedger,reports=L.filter(o=>!o.fact);
 const sameWeek=c.probe('WEEKLY_REVIEW',last,{eligibility:ELIG(last.slice(0,10))},'p0'),next=c.probe('WEEKLY_REVIEW',at(addDays(day,7)),{eligibility:ELIG(addDays(day,7))},'p1');
 const rs=(()=>{const d=addDays(c.env.program.startDate,10),upd={...athleteA({weeks:8,id:'ncc-dose'}),asOf:d,startDate:addDays(d,3)};upd.athlete.eligibility=ELIG(d);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
  const g=S.restartProgram({intake:upd,record:L,referenceState:c.env.referenceState,asOf:at(d,'10:00'),athleteId:c.env.program.athleteId,runEvidenceRecord:c.env.runEvidenceRecord,runFormatRecord:c.env.runFormatRecord,runHistoryRecord:c.env.runHistoryRecord});
  const w=g.program?.weeks?.[0],min=s=>s.prescription?.minutes??s.prescription?.durationMinutes??s.minutes??0,ss=w?.sessions??[];
  return {status:g.status,running:ss.filter(s=>s.sport==='RUN'&&['EASY','LONG'].includes(s.role)).map(min),walk:ss.filter(s=>s.sport==='RUN'&&s.role==='WALK').map(min),strength:ss.filter(s=>s.sport==='STRENGTH').map(min),reason:g.status==='PROPOSED'?undefined:g.reason};})();
 const wk=p=>p.weekEvidence?.week===0?Object.fromEntries(p.weekEvidence.rows.filter(r=>r.sport==='RUN').map(r=>[r.sessionId.slice(3),r.status])):null;
 return {
  inForce:reports.filter(o=>!o.superseded).map(o=>o.eventId+(o.conflicted?'!':'')).sort().join(' '),
  d3:reports.filter(o=>o.sessionId==='w0-run-d3'&&!o.superseded).map(o=>({eventId:o.eventId,minutes:o.actual?.minutes,conflicted:!!o.conflicted})),
  hkD1Sessions:[...new Set(reports.filter(o=>!o.superseded&&(o.canonicalActivityId==='HK-D1'||Object.values(o.provenance?.parts??{}).some(p=>p?.activityId==='HK-D1'))).map(o=>o.sessionId))],
  refused:answers.flatMap(a=>(a.provenance?.excluded??[]).map(e=>e.eventId+':'+e.reason)),
  runFacts:factsFromLedger(L,{athleteId:c.env.program.athleteId},VALUES).length,
  afterLastReview:{status:sameWeek.status+'/'+sameWeek.action,week:sameWeek.weekEvidence?.week,week0Runs:wk(sameWeek),conflicted:sameWeek.weekEvidence?.conflicted},
  nextWeek:{status:next.status+'/'+next.action,week:next.weekEvidence?.week},
  restart:rs
 };
}
const out={};for(const k of ['none','F1','F1a','F2','F3'])out[k]=journey(k);
console.log(JSON.stringify(out,null,1));
