// SEC_INT_R2 helper probe: the real engine's MERGE and KEPT VOICE rows (device 40, then athlete 40 rpe 4 ADVERSE; device 40 then athlete 90).
import {createCustody} from '../../../../../CoachingCore/src/boundary/custody.mjs';
import {S,memoryStore,ELIG,at,CONSENTS,athleteA} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
for(const [name,ath] of [['merge',{minutes:40,rpe:4}],['kept',{minutes:90,rpe:4}]]){
 let clock=Date.parse('2026-11-14T12:00:00-03:00');const store=memoryStore(),actor={athleteId:'rc'};const cu=createCustody({store,key:'k',now:()=>clock,engine:S});
 cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1');
 const b={sessionId:s.id,occurrenceDate:s.date,response:{performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};let v=1;
 for(const [rid,obs,t] of [['hk',[DEV(b)],'08:00'],['f',[{...b,actual:{completed:true,...ath}}],'20:00']]){clock=Date.parse(at(s.date,t));const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});v=r.version;}
 const row=cu.visible(store.load('rc')).find(o=>!o.fact&&o.sessionId===s.id&&!o.superseded);console.log(name,JSON.stringify({actual:row.actual,response:row.response,conflicted:row.conflicted,prov:{...row.provenance,parts:Object.fromEntries(Object.entries(row.provenance.parts).map(([k,p])=>[k,{actual:p.actual,response:p.response}]))}}));}
