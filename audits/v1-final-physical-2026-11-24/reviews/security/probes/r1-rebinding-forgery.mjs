// SEC_FPV_R1 probe r1 (FPV-01 against SEC-INT-02/02R): the engine re-binds the stored report (context.mode / phaseClass changed) AND, in the
// same review, tries each kind of change to that row. The re-binding must not loosen anything: every forgery is still refused, every legitimate
// shape still kept, and the stored context stays the recorded one. Same rig as p8-evolves-r2 / q4-evolves-bc (device 40 min first, then the
// athlete's report; the engine answer altered for that second review only). Also: a re-binding alone on a plain review (row kept as recorded,
// nothing added to the chain), and re-bindings of other shapes (a key added/removed, a non-string mode, a fact row) refused.
// Usage: node r1-rebinding-forgery.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node r1-rebinding-forgery.mjs <root>');
const {createCustody}=await import(pathToFileURL(`${root}/CoachingCore/src/boundary/custody.mjs`).href);
const {S,memoryStore,ELIG,at,CONSENTS,athleteA,json}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const UNK={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const DEV=b=>({...b,actual:{completed:true,minutes:40,distanceKm:7.06,measurement:'GPS'},response:UNK,source:{provider:'HEALTHKIT',activityId:'HK1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK1'});
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 const stored=()=>store.load('rc').rows.find(o=>o&&!o.fact&&o.sessionId===s.id);
 return {b,send,stored,chain:()=>store.load('rc').chain.length};
}
const T=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);
const other=t=>Object.keys(t.provenance.parts).find(k=>k!==t.eventId);
const REBIND=t=>{t.context={...t.context,mode:t.context.mode==='RETURN'?'NORMAL':'RETURN',phaseClass:'REBOUND_BY_PROBE'};};
const M={completed:true,minutes:40,rpe:4},K={completed:true,minutes:90,rpe:4};
const forge=[
 ['MERGE: ADVERSE/IMPAIRED dropped from merged response',M,t=>{t.response={...UNK};}],
 ['MERGE: rpe fabricated in new voice and row',M,t=>{t.provenance.parts[other(t)].actual.rpe=9;t.actual.rpe=9;}],
 ['MERGE: completed removed',M,t=>{delete t.actual.completed;}],
 ['MERGE: stop removed from new voice and row',{...M,stop:{reason:'SYMPTOM'}},t=>{delete t.provenance.parts[other(t)].actual.stop;delete t.actual.stop;}],
 ['KEPT: kept voice amount fabricated',K,t=>{t.provenance.parts[other(t)].actual.minutes=300;}],
 ['KEPT: conflict flag cleared',K,t=>{delete t.conflicted;delete t.provenance.conflict;}],
 ['ROW: actual.minutes changed (no evolve)',M,t=>{t.actual.minutes=5;}],
];
const out=[];
for(const [name,ath,f] of forge){const r=rig((l)=>{const t=T(l);REBIND(t);f(t);return l;});r.send('hk',[DEV(r.b)],'08:00');const x=r.send('ath',[{...r.b,actual:ath,response:{performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'IMPAIRED'}}],'20:00',true);
 out.push(['forge+rebind',x.ok?'KEPT   ':'REFUSED',name,x.ok?'':x.error.code]);}
for(const [name,ath] of [['control MERGE + rebind',M],['control KEPT + rebind',K]]){const r=rig((l)=>{REBIND(T(l));return l;});r.send('hk',[DEV(r.b)],'08:00');const before=json(r.stored().context);
 const x=r.send('ath',[{...r.b,actual:ath,response:{performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'IMPAIRED'}}],'20:00',true);
 out.push(['legit',x.ok?'KEPT   ':'REFUSED',name,x.ok?`storedContextUnchanged=${JSON.stringify(r.stored().context)===JSON.stringify(before)} mode=${r.stored().context.mode}`:x.error.code]);}
// A re-binding alone on a plain later review (the row is not evolved): kept as recorded, no annotation in the chain.
{const r=rig((l)=>{REBIND(T(l));return l;});r.send('hk',[DEV(r.b)],'08:00');const before=json(r.stored()),c0=r.chain();const x=r.send('empty',[],'21:00',true);
 out.push(['legit',x.ok?'KEPT   ':'REFUSED','re-binding alone, empty review',x.ok?`rowByteEqual=${JSON.stringify(r.stored())===JSON.stringify(before)} chainGrew=${r.chain()-c0}`:x.error.code]);}
// Re-bindings of other shapes: each must be refused.
const shapes=[
 ['context key added with mode change',t=>{t.context={...t.context,mode:'RETURN',extra:'x'};}],
 ['context key removed (weekIndex) with mode change',t=>{const {weekIndex,...c}=t.context;t.context={...c,mode:'RETURN'};}],
 ['mode set to a number',t=>{t.context={...t.context,mode:7};}],
 ['mode set to an object',t=>{t.context={...t.context,mode:{toString(){return 'RETURN';}}};}],
 ['phaseClass removed',t=>{const {phaseClass,...c}=t.context;t.context=c;}],
 ['context removed',t=>{delete t.context;}],
 ['context replaced by a string',t=>{t.context='RETURN';}],
 ['sessionType changed with mode',t=>{t.context={...t.context,mode:'RETURN',sessionType:'RUN:LONG'};}],
 ['plannedHash changed with mode',t=>{t.context={...t.context,mode:'RETURN',plannedHash:'0'.repeat(64)};}],
];
for(const [name,f] of shapes){const r=rig((l)=>{f(T(l));return l;});r.send('hk',[DEV(r.b)],'08:00');const x=r.send('empty',[],'21:00',true);
 out.push(['shape',x.ok?'KEPT   ':'REFUSED',name,x.ok?`stored mode=${JSON.stringify(r.stored().context?.mode)}`:x.error.code]);}
for(const o of out)console.log(o[0].padEnd(13),o[1],o[2].padEnd(52),o[3]);
