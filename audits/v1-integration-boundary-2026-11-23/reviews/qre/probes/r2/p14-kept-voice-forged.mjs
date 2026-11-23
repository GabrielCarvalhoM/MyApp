// QRE R2 probe P14: forged KEPT VOICE evolutions (O-1 dispute: device 40 min, then the athlete 90 min, then a third voice), on the amended
// custody. Expected: each refused (ENGINE_CONTRACT_VIOLATION). Run also under mutants C08/C09 (r2/custody-mutants.txt) to show whether the
// guard is real but untested by the suite.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/r2/p14-kept-voice-forged.mjs
import {createCustody} from '../../../../../../CoachingCore/src/boundary/custody.mjs';
import {S,memoryStore,athleteA,ELIG,at,CONSENTS,json} from '../../../../../../CoachingCore/test/v1int-helpers.mjs';
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const ATH=(b,minutes)=>({...b,actual:{completed:true,minutes,rpe:6}});
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=false;const store=memoryStore(),actor={athleteId:'kv'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode?{...r,actualLedger:alter(json(r.actualLedger))}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'kv'}),consents:CONSENTS});
 const s=store.load('kv').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
 let v=1;const send=(rid,obs,time,m=false)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=false;if(r.ok)v=r.version;return r;};
 return {store,b,send};
}
const row=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);
const cases={
 'control (no alteration)':l=>l,
 'kept voice: amount changed':l=>{const t=row(l);t.actual={...t.actual,minutes:999};return l;},
 'kept voice: conflict label changed':l=>{const t=row(l);t.provenance.conflict='SOMETHING_ELSE';return l;},
 'kept voice: response changed':l=>{const t=row(l);t.response={...t.response,recovery:'COMPATIBLE'};return l;},
};
for(const [name,alter] of Object.entries(cases)){const r=rig(alter);r.send('hk',[DEV(r.b)],'08:00');const d=r.send('form',[ATH(r.b,90)],'12:00');
 const flagged=row(r.store.load('kv').rows.filter(Boolean))?.conflicted;const before=r.store.raw('kv');const x=r.send('hk2',[DEV(r.b,'HK2',41)],'20:00',true);
 console.log(JSON.stringify({case:name,disputeFlagged:flagged===true,dispute:d.ok,answer:x.ok?'KEPT':x.error.code,changed:r.store.raw('kv')!==before}));}
