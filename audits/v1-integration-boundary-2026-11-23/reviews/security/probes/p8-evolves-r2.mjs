// SEC_INT_R2 probe 8: forgeries against the cycle-1 `evolves` (KEPT VOICE / MERGE), each built on the real engine row of the shape
// (p8-shape.mjs prints them). Device 40 min first, then the athlete's report; the engine answer is altered for that second review only.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p8-evolves-r2.mjs
import {createCustody} from '../../../../../CoachingCore/src/boundary/custody.mjs';
import {S,memoryStore,ELIG,at,CONSENTS,athleteA,json} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
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
const cases={
 'MERGE: the new voice\'s ADVERSE/IMPAIRED left out of the merged response':{ath:{completed:true,minutes:40,rpe:4},f:t=>{t.response={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};}},
 'MERGE: rpe fabricated in the new voice and the row (sent 4, kept 9)':{ath:{completed:true,minutes:40,rpe:4},f:t=>{t.provenance.parts[other(t)].actual.rpe=9;t.actual.rpe=9;}},
 'MERGE: effort fabricated in the new voice and the row':{ath:{completed:true,minutes:40,rpe:4},f:t=>{t.provenance.parts[other(t)].response.effort='TOO_HARD';t.response.effort='TOO_HARD';}},
 'KEPT->MERGE: a disagreeing "not done" voice merged, completed true->false, unflagged':{ath:{completed:false,minutes:0},f:t=>{const k=other(t);delete t.conflicted;delete t.provenance.conflict;t.provenance.mergedSourceIds=[t.eventId,k];t.actual={...t.actual,completed:false,minutes:0};}},
 'KEPT VOICE: a conflict label of no known kind':{ath:{completed:true,minutes:90,rpe:4},f:t=>{t.provenance.conflict='NO_SUCH_LABEL';}},
 'KEPT VOICE: the kept voice\'s amount fabricated (sent 90, kept 300)':{ath:{completed:true,minutes:90,rpe:4},f:t=>{t.provenance.parts[other(t)].actual.minutes=300;}},
 'control: no alteration (MERGE)':{ath:{completed:true,minutes:40,rpe:4},f:()=>{}},
 'control: no alteration (KEPT VOICE)':{ath:{completed:true,minutes:90,rpe:4},f:()=>{}},
};
for(const [name,{ath,f}] of Object.entries(cases)){
 const r=rig((l,i)=>{f(T(l),i);return l;});r.send('hk',[DEV(r.b)],'08:00');
 const x=r.send('form',[{...r.b,actual:ath,response:RESP}],'20:00','x'),y=r.row();
 console.log((x.ok?'KEPT   ':'REFUSED')+' '+name.padEnd(82),x.ok?JSON.stringify({completed:y.actual.completed,min:y.actual.minutes,rpe:y.actual.rpe??null,rec:y.response.recovery,ndf:y.response.nextDayFunction,effort:y.response.effort,conflicted:y.conflicted??null,label:y.provenance.conflict??null}):x.error.code);
}
