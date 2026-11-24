// QRE BC R1 probe 4: SEC-INT-02R forgeries that only one new rule refuses (for the mutants that survive the focal and wide files).
// The engine answer of the second voice is altered once (the focal test's rig), on the custody it is pointed at. Synthetic. Read-only.
// Usage: node [--import mutate-hook.mjs with MUT] p04-evolves-merge-forgery.mjs <CoachingCore dir>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(process.argv[2]),imp=f=>import(pathToFileURL(path.join(CC,f)).href);
const {createCustody}=await imp('src/boundary/custody.mjs'),H=await imp('test/v1int-helpers.mjs');
const {S,memoryStore,athleteA,ELIG,at,CONSENTS,json,U}=H,code=r=>r.ok?'OK':r.error.code;
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 return {b,send,store};
}
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{...U},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const T=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded),other=t=>Object.keys(t.provenance.parts).find(k=>k!==t.eventId);
const cases={
 // A "not done" voice merged into a completed row whose amount is left unchanged (a dispute laundered into a merge): only the
 // "one execution" rule (completed equal across the row, every new voice and the result) refuses it.
 'MERGE of a "not done" voice, row unchanged, unflagged':[{completed:false,minutes:0},t=>{const k=other(t);delete t.conflicted;delete t.provenance.conflict;t.provenance.mergedSourceIds=[...new Set([...(t.provenance.mergedSourceIds??[t.eventId]),k])];}],
 // The new voice's actual carries a key its report never sent (nothing is added to a voice).
 'MERGE: a key added to the new voice (rpe 9, never sent)':[{completed:true,minutes:40},t=>{t.provenance.parts[other(t)].actual.rpe=9;}],
 // The new voice's response carries a word outside the four (a non-word key changed).
 'MERGE: a non-word key added to the new voice response':[{completed:true,minutes:40,rpe:4},t=>{t.provenance.parts[other(t)].response.note='x';}],
 // manualDistanceKm in a voice whose report stated a distance of its own.
 'MERGE: manualDistanceKm invented on a voice that sent no distance':[{completed:true,minutes:40,rpe:4},t=>{t.provenance.parts[other(t)].actual.manualDistanceKm=12;}],
 'MERGE: a key the report stated dropped from the new voice (rpe 4 sent)':[{completed:true,minutes:40,rpe:4},t=>{delete t.provenance.parts[other(t)].actual.rpe;delete t.actual.rpe;}],
 'MERGE of a "not done" voice with no stated response, row unchanged, unflagged':[{completed:false,minutes:0},t=>{const k=other(t);delete t.conflicted;delete t.provenance.conflict;t.provenance.mergedSourceIds=[...new Set([...(t.provenance.mergedSourceIds??[t.eventId]),k])];},'U'],
 'control MERGE':[{completed:true,minutes:40,rpe:4},()=>{}],
 'control KEPT VOICE ("not done")':[{completed:false,minutes:0},()=>{}],
};
for(const [name,[ath,f,resp]] of Object.entries(cases)){const r=rig(l=>{f(T(l));return l;});const a=r.send('hk',[DEV(r.b)],'08:00');
 const x=r.send('form',[{...r.b,actual:ath,response:resp==='U'?{...U}:{...U,recovery:'ADVERSE'}}],'20:00','x');console.log(name.padEnd(70),code(a),code(x));}
