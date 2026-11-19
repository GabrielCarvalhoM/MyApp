// Dose impact of SEC-R2-03 through the composed engine. Usage: node dose.mjs <CoachingCore root>. Synthetic athlete only; read-only.
// Journeys: plan A, week 0 reported in full (two runs with a watch activity); then a review in week 1 carries one correction that the
// normalizer refuses: (A) a correction of run d3 reusing run d1's event id; (B) a correction of run d3 carrying run d1's watch activity;
// (S) a correction of strength d2 reusing strength d5's event id. Control (P): the same report with no correctionOf (a plain conflicting report).
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2],imp=p=>import(pathToFileURL(path.join(root,p)).href);
const S=await imp('src/v1-safety-index.mjs');
const {client,athleteA,reportOf,liveSessions,at,ELIG,addDays}=await imp('test/v1core-helpers.mjs');
const {factsFromLedger}=await imp('src/v1-run-history.mjs');const {FORMAT_VALUES_URL}=await imp('src/v1-run-format.mjs');
const fs=await import('node:fs');const VALUES=JSON.parse(fs.readFileSync(FORMAT_VALUES_URL,'utf8'));
function journey(kind,plain=false){
 const c=client(S);c.onboard(athleteA({weeks:8,id:'dose'}));const ss=liveSessions(c.env,0),day=addDays(c.env.program.startDate,6);
 const obs=ss.map(s=>reportOf(c.env,s)),d1=obs.find(o=>o.sessionId==='w0-run-d1');
 obs.push({...d1,eventId:'dev-d1',actual:{...d1.actual},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'});
 c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:obs},'w0');
 const d8=addDays(day,2),led=c.env.actualLedger,pick=id=>led.find(o=>o.eventId===id&&!o.superseded);
 let bad=null;
 if(kind==='A'){const x=pick('aif-w0-run-d3');bad={sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'aif-w0-run-d1',correctionOf:'aif-w0-run-d3',actual:{...x.actual,minutes:x.actual.minutes-5},response:x.response};}
 if(kind==='B'){const x=pick('aif-w0-run-d3');bad={sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'aif-w0-run-d3-c',correctionOf:'aif-w0-run-d3',actual:{...x.actual,minutes:x.actual.minutes-5},response:x.response,source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'};}
 if(kind==='S'){const x=pick('aif-w0-str-d2');bad={sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'aif-w0-str-d5',correctionOf:'aif-w0-str-d2',actual:{...x.actual,minutes:x.actual.minutes-5},response:x.response};}
 if(bad){bad.correctedAt=at(d8,'07:00');bad.reportedAt=at(d8,'07:00');if(plain){delete bad.correctionOf;delete bad.correctedAt;}
  c.review('WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[bad]},'bad');}
 const L=c.env.actualLedger,reports=L.filter(o=>!o.fact);
 const probe=c.probe('WEEKLY_REVIEW',at(addDays(day,7)),{eligibility:ELIG(addDays(day,7))},'p');
 const rs=(()=>{const d=addDays(c.env.program.startDate,10),upd={...athleteA({weeks:8,id:'dose'}),asOf:d,startDate:addDays(d,3)};upd.athlete.eligibility=ELIG(d);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
  const g=S.restartProgram({intake:upd,record:L,referenceState:c.env.referenceState,asOf:at(d,'10:00'),athleteId:c.env.program.athleteId,runEvidenceRecord:c.env.runEvidenceRecord,runFormatRecord:c.env.runFormatRecord,runHistoryRecord:c.env.runHistoryRecord});
  const w=g.program?.weeks?.[0];return {status:g.status,week0:w?w.sessions.map(s=>s.sport+':'+(s.prescription?.minutes??s.prescription?.durationMinutes??s.minutes??'?')).join(' '):g.reason};})();
 return {
  live:reports.filter(o=>!o.superseded).map(o=>o.eventId+(o.conflicted?'!':'')).sort().join(' '),
  orphans:reports.filter(o=>o.superseded&&!reports.some(r=>r!==o&&r.eventId===o.supersededBy&&r.sessionId===o.sessionId)).map(o=>o.eventId).join(' '),
  runFacts:factsFromLedger(L,{athleteId:c.env.program.athleteId},VALUES).length,
  week0:(probe.weekEvidence?.week===0?probe.weekEvidence:null)&&probe.weekEvidence.rows.map(x=>x.sessionId.slice(3)+':'+x.status[0]+x.kind[0]).join(' '),
  strength:JSON.stringify(probe.strengthExposure?.executed?.rows?.length??probe.strengthExposure?.status??null),
  status:probe.status+'/'+probe.action,
  restart:rs
 };
}
const out={};
for(const k of [null,'A','B','S']){out[k??'none']=journey(k);if(k)out[k+'-plain']=journey(k,true);}
console.log(JSON.stringify(out,null,1));
