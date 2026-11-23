// QRE probe P06: shapes the amended reconcile (`evolves`) should refuse, beyond the 9 of the candidate's test. The engine answer is altered for
// one review (the second voice's), on the amended custody.mjs. Expected for each: ENGINE_CONTRACT_VIOLATION and nothing kept.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p06-evolves-forged.mjs
import {createCustody} from '../../../../../CoachingCore/src/boundary/custody.mjs';
import {S,memoryStore,athleteA,ELIG,at,CONSENTS,json} from '../../../../../CoachingCore/test/v1int-helpers.mjs';

const DEV=(b,id='HK1')=>({...b,actual:{completed:true,minutes:40,distanceKm:7.06,measurement:'GPS'},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const ATH=b=>({...b,actual:{completed:true,minutes:40,rpe:4}});
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const p=store.load('rc').program,s=p.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),s3=p.weeks[0].sessions.find(x=>x.id==='w0-run-d3');
 const b={sessionId:s.id,occurrenceDate:s.date,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
 let v=1;const send=(rid,obs,time,m=false)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=false;if(r.ok)v=r.version;return r;};
 return {cu,store,s,s3,b,send};
}
const target=(l,sid='w0-run-d1')=>l.find(o=>!o.fact&&o.sessionId===sid&&!o.superseded);
const cases={
 // First merge (the row had no parts): the row's own voice is dropped from parts, only the newcomer stays.
 'first merge: own voice dropped from parts':(l,i)=>{const t=target(l);const own=t.eventId;delete t.provenance.parts[own];return l;},
 // First merge: the row's own voice kept in parts but its response rewritten.
 'first merge: own voice response rewritten':(l,i)=>{const t=target(l);t.provenance.parts[t.eventId].response={recovery:'COMPATIBLE'};return l;},
 // The amount moves to any value, as long as a voice is added (amount not tied to the voices).
 'amount set to 999 with the new voice':(l,i)=>{const t=target(l);t.actual={...t.actual,minutes:999};return l;},
 // A report of this review for ANOTHER session is merged into this session's row as a voice.
 'voice of another session merged here':(l,i)=>l,
 // conflicted set to a non-boolean.
 'conflicted set to "maybe"':(l,i)=>{const t=target(l);t.conflicted='maybe';return l;},
};
for(const [name,alter] of Object.entries(cases)){
 const r=rig(alter);const first=r.send('hk',[DEV(r.b)],'08:00');const before=r.store.raw('rc');
 let x;
 if(name.startsWith('voice of another session')){
  // The review brings one report, for w0-run-d3; the engine answer merges it as a voice of w0-run-d1's row (forged by the alteration below).
  const r2=rig((l,i)=>{const t=target(l),id=i.observations[0].eventId;const other=l.findIndex(o=>o.eventId===id);if(other>=0)l.splice(other,1);
   t.provenance.parts={...(t.provenance.parts??{[t.eventId]:{actual:t.actual,response:t.response}}),[id]:{actual:{completed:true,minutes:1},response:{}}};
   t.provenance.mergedSourceIds=[...(t.provenance.mergedSourceIds??[]),id];return l;});
  r2.send('hk',[DEV(r2.b)],'08:00');const b2=r2.store.raw('rc');x=r2.send('form',[{...ATH(r2.b),sessionId:r2.s3.id,occurrenceDate:r2.s3.date}],'20:00',true);
  console.log(JSON.stringify({case:name,answer:x.ok?'KEPT':x.error.code,changed:r2.store.raw('rc')!==b2}));continue;}
 x=r.send('form',[ATH(r.b)],'20:00',true);
 console.log(JSON.stringify({case:name,answer:x.ok?'KEPT':x.error.code,changed:r.store.raw('rc')!==before}));
}
