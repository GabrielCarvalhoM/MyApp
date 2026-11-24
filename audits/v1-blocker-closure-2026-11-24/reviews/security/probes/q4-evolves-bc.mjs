// SEC_BC_R1 probe q4 (SEC-INT-02R both ways): forgeries beyond p8 against the tightened `evolves`, and legitimate engine rows that must stay
// kept. Same rig as p8-evolves-r2 (device 40 min first, then the athlete's report; the engine answer altered for that review only).
// DEV0 = the device row as the boundary builds it (no response object).
// Usage: node q4-evolves-bc.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q4-evolves-bc.mjs <root>');
const {createCustody}=await import(pathToFileURL(`${root}/CoachingCore/src/boundary/custody.mjs`).href);
const {S,memoryStore,ELIG,at,CONSENTS,athleteA,json}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const UNK={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const DEV=(b,{id='HK1',minutes=40,resp=true}={})=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},...(resp?{response:UNK}:{}),source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const RESP={performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'IMPAIRED'};
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 const row=()=>cu.visible(store.load('rc')).find(o=>!o.fact&&o.sessionId===s.id&&!o.superseded);
 return {b,send,row};
}
const T=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);
const other=t=>Object.keys(t.provenance.parts).find(k=>k!==t.eventId);
const M={completed:true,minutes:40,rpe:4},K={completed:true,minutes:90,rpe:4};
const cases=[
 ['forge','MERGE: merged response deleted (dev row with response)',{ath:M},t=>{delete t.response;}],
 ['forge','MERGE: merged response deleted (dev row WITHOUT response)',{ath:M,dev:{resp:false}},t=>{delete t.response;}],
 ['forge','MERGE: recovery and nextDayFunction keys deleted from merged response (dev row WITHOUT response)',{ath:M,dev:{resp:false}},t=>{if(t.response){delete t.response.recovery;delete t.response.nextDayFunction;}}],
 ['forge','MERGE: merged response all UNKNOWN (dev row WITHOUT response)',{ath:M,dev:{resp:false}},t=>{t.response={...UNK};}],
 ['forge','MERGE: a symptom stop removed from the new voice and the row',{ath:{...M,stop:{reason:'SYMPTOM'}}},t=>{delete t.provenance.parts[other(t)].actual.stop;delete t.actual.stop;}],
 ['forge','MERGE: completed removed from the result',{ath:M},t=>{delete t.actual.completed;}],
 ['forge','MERGE: performance fabricated in the row only',{ath:M,resp:{...RESP,performance:'UNKNOWN'}},t=>{t.response.performance='EXCEEDED';}],
 ['forge','MERGE: rpe fabricated in the row only (sent 4, row 9)',{ath:M},t=>{t.actual.rpe=9;}],
 ['forge','MERGE: the new voice part minutes dropped',{ath:M},t=>{delete t.provenance.parts[other(t)].actual.minutes;}],
 ['forge','MERGE: an extra response key in the new voice',{ath:M},t=>{t.provenance.parts[other(t)].response.pain='NONE';}],
 ['forge','KEPT: the kept voice response deleted',{ath:K},t=>{delete t.provenance.parts[other(t)].response;}],
 ['forge','KEPT: the kept voice ADVERSE -> UNKNOWN',{ath:K},t=>{t.provenance.parts[other(t)].response.recovery='UNKNOWN';}],
 ['forge','KEPT: the kept voice stop removed',{ath:{...K,stop:{reason:'SYMPTOM'}}},t=>{delete t.provenance.parts[other(t)].actual.stop;}],
 ['forge','KEPT: label swapped to another engine label',{ath:K},t=>{t.provenance.conflict='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS';}],
 ['tolerated','MERGE: the new voice distance moved to manualDistanceKm',{ath:{...M,distanceKm:6.5}},t=>{const p=t.provenance.parts[other(t)].actual;if(p.distanceKm!==undefined){p.manualDistanceKm=p.distanceKm;delete p.distanceKm;}}],
 ['legit','control MERGE (dev row with response)',{ath:M},()=>{}],
 ['legit','control MERGE (dev row WITHOUT response)',{ath:M,dev:{resp:false}},()=>{}],
 ['legit','control KEPT (dev row WITHOUT response)',{ath:K,dev:{resp:false}},()=>{}],
 ['legit','control MERGE with a symptom stop and partial response',{ath:{...M,stop:{reason:'SYMPTOM'}},resp:{recovery:'ADVERSE'}},()=>{}],
 ['legit','control KEPT "not done" voice',{ath:{completed:false,minutes:0}},()=>{}],
 ['legit','control MERGE with zero rpe and empty exercises',{ath:{...M,rpe:0,exercises:[]}},()=>{}],
];
for(const [cls,name,{ath,dev={},resp=RESP},f] of cases){
 const r=rig((l)=>{f(T(l));return l;});const d=r.send('hk',[DEV(r.b,dev)],'08:00');
 const x=r.send('form',[{...r.b,actual:ath,response:resp}],'20:00','x'),y=r.row();
 console.log(cls.padEnd(9),(x.ok?'KEPT   ':'REFUSED'),name.padEnd(100),x.ok?JSON.stringify({c:y.actual.completed,min:y.actual.minutes,stop:y.actual.stop??null,rec:y.response?.recovery??null,ndf:y.response?.nextDayFunction??null,cf:y.conflicted??null}):x.error.code,d.ok?'':'(device '+d.error.code+')');
}
