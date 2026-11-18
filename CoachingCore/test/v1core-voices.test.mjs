// V1 Core Safety & Lifecycle, QRE-RWS-F-01 closure (a): the four forms a mixed run report can take never reach the engine, and with the two voices
// disjoint every comparability fact either voice states survives the engine's merge (and its re-merge after a re-synchronization, E-1).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/v1-safety-index.mjs';
import {checkReportVoice} from '../src/boundary/report-voices.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays} from './v1core-helpers.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
function plan(id){const c=client(S);c.onboard(athleteA({weeks:8,id}));const s=liveSessions(c.env,0).find(x=>x.sport==='RUN'),b=reportOf(c.env,s);const {response:_r,eventId:_e,...body}=b,m={...b.actual};delete m.rpe;return {c,s,body,m};}
const device=(body,m,extra={})=>({...body,eventId:'dev-1',actual:{...m,...extra},source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-1',response:{...UNKNOWN}});
const athlete=(s,body,actual,response={})=>({sessionId:s.id,occurrenceDate:body.occurrenceDate,eventId:'ath-1',actual:{completed:true,...actual},response:{...UNKNOWN,...response}});

test('QRE-RWS-F-01 (a): the two disjoint voices are admitted', ()=>{
 const {s,body,m}=plan('v-ok');
 assert.deepEqual(checkReportVoice('DEVICE',device(body,m,{gpsQuality:'OK',measurement:'GPS'})),{ok:true});
 assert.deepEqual(checkReportVoice('ATHLETE',athlete(s,body,{rpe:7,conditions:['HEAT'],walkBreaks:true},{recovery:'ADVERSE'})),{ok:true});
});

test('QRE-RWS-F-01 (a): the four mixed forms are refused (K1, K4, K5, SEC-RWS-E-02)', ()=>{
 const {s,body,m}=plan('v-mixed');
 const k1=checkReportVoice('DEVICE',device(body,m,{rpe:8,conditions:['HEAT']}));                                    // one report with the device's measure and the athlete's addition
 const k1r=checkReportVoice('DEVICE',{...device(body,m),response:{...UNKNOWN,recovery:'ADVERSE'}});
 const {source:_s,canonicalActivityId:_c,...bare}=device(body,m),k4=checkReportVoice('DEVICE',bare);                 // an import with no origin field
 const k5=checkReportVoice('ATHLETE',{...athlete(s,body,{rpe:7}),source:{activityId:'HK-1'},canonicalActivityId:'HK-1'}); // the app's report with the activity id
 const manual=checkReportVoice('ATHLETE',{...athlete(s,body,{rpe:7}),source:{provider:'MANUAL',activityId:'HK-1'}});   // MANUAL with an activity id
 const appMeasure=checkReportVoice('ATHLETE',athlete(s,body,{gpsQuality:'OK',measurement:'GPS'}));                  // the athlete's report with the device's measurement
 for(const r of [k1,k1r,k4,k5,manual,appMeasure])assert.equal(r.ok,false);
 assert.deepEqual(k1.errors,['actual.conditions','actual.rpe']);assert.deepEqual(k1r.errors,['response.recovery']);
 assert.deepEqual(k4.errors,['source.identifiedActivity']);assert.ok(k5.errors.includes('source.notTheAthlete'));assert.ok(manual.errors.includes('source.notTheAthlete'));
 assert.deepEqual(appMeasure.errors,['actual.gpsQuality','actual.measurement']);
 assert.equal(checkReportVoice('PHONE',device(body,m)).ok,false);assert.equal(checkReportVoice('DEVICE',null).ok,false);
});

for(const [label,fromDevice,fromAthlete,read] of [
 ['HEAT said by the athlete',{},{conditions:['HEAT']},o=>o.actual.conditions],
 ['walk breaks said by the athlete',{},{walkBreaks:true},o=>o.actual.walkBreaks],
 ['POOR GPS measured by the device',{gpsQuality:'POOR'},{},o=>o.actual.gpsQuality]])
 test(`QRE-RWS-F-01 (a): ${label} survives the merge and the re-synchronization (one value per field cannot be overwritten by the other voice)`,()=>{
  const {c,s,body,m}=plan('v-'+label.split(' ')[0]),d=device(body,m,fromDevice),a=athlete(s,body,{rpe:7,...fromAthlete});
  assert.ok(checkReportVoice('DEVICE',d).ok&&checkReportVoice('ATHLETE',a).ok);
  const expect=read({actual:{...fromDevice,...fromAthlete}});
  c.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[d,a]},'both');
  const row=()=>c.env.actualLedger.find(o=>!o.fact&&!o.superseded&&o.sessionId===s.id);
  assert.deepEqual(read(row()),expect);
  const d1=addDays(s.date,1);c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...d,eventId:'dev-1b',correctionOf:'dev-1',correctedAt:at(d1,'07:00'),actual:{...d.actual,minutes:d.actual.minutes+1}}]},'resync');
  assert.deepEqual(read(row()),expect,'after the re-synchronization');
 });
