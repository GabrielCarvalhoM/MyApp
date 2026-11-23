// SEC_INT_R1 probe 6: forged in-place changes against the amended custody reconcile (`evolves`), with an engine whose answer is altered
// for one review (the rig of test/v1int-custody.test.mjs, reproduced here). Each forgery adds a genuine voice of this review, so `evolves`
// sees "a new part from incoming" and must still refuse what is not the engine's evolution.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p6-evolves-forgery.mjs
import {createCustody} from '../../../../../CoachingCore/src/boundary/custody.mjs';
import {S,memoryStore,ELIG,at,CONSENTS,athleteA,json} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const ATH=(b,extra={},resp={})=>({...b,actual:{completed:true,minutes:40,rpe:4,...extra},response:{...b.response,...resp}});
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 const row=()=>cu.visible(store.load('rc')).find(o=>!o.fact&&o.sessionId===s.id&&!o.superseded);
 return {cu,store,s,b,send,row};
}
const target=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);
const cases={
 // athlete row with a symptom stop and ADVERSE on record; the device's workout arrives; the merged row is forged
 'stop and ADVERSE removed from the merged row (parts kept)':{first:'ath',f:t=>{delete t.actual.stop;t.response={...t.response,recovery:'COMPATIBLE'};}},
 'amount rewritten (minutes 40 -> 5) beside the genuine new voice':{first:'ath',f:t=>{t.actual.minutes=5;}},
 'first merge: the row\'s own voice omitted from parts, amount rewritten':{first:'dev',f:(t,i)=>{const own=t.eventId;delete t.provenance.parts[own];t.actual={completed:false,minutes:0};}},
 'new voice content fabricated (incoming id, other content)':{first:'dev',f:(t,i)=>{const k=Object.keys(t.provenance.parts).find(x=>x!==t.eventId);t.provenance.parts[k]={...t.provenance.parts[k],actual:{completed:true,minutes:5,rpe:1}};}},
 'provenance.conflict cleared, conflicted kept':{first:'dev',dispute:true,f:t=>{delete t.provenance.conflict;}},
};
for(const [name,{first,f,dispute}] of Object.entries(cases)){
 const r=rig((l,i)=>{f(target(l),i);return l;});
 const a=first==='ath'?r.send('form',[ATH(r.b,{minutes:40,stop:{reason:'SYMPTOM'}},{recovery:'ADVERSE'})],'08:00'):r.send('hk',[DEV(r.b)],'08:00');
 const before=r.row();
 const x=first==='ath'?r.send('hk',[DEV(r.b)],'20:00','x'):r.send('form',[ATH(r.b,dispute?{minutes:90}:{})],'20:00','x');
 const after=r.row();
 console.log((x.ok?'KEPT   ':'REFUSED')+' '+name.padEnd(66),x.ok?'':x.error.code,x.ok?JSON.stringify({stop:after.actual.stop??null,rec:after.response?.recovery,min:after.actual.minutes,completed:after.actual.completed,parts:Object.keys(after.provenance?.parts??{}).length,conflict:after.provenance?.conflict??null,conflicted:after.conflicted??null}):'');
}
