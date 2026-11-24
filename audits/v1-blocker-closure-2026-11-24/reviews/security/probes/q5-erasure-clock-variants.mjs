// SEC_BC_R2 probe q5 (SEC-BC-01 cycle 1): variants of q1. Each prints the erasure result, the marker's instant, the latest readiness
// declaration's instant, and the state / weekly status after the clock is right again.
//  v1 q1 shape: declaration d1, standing hold d3, clock back to d0, erase the d3 report.
//  v2 the declaration is the LAST operation (hold d3 answered by a declaration d4), clock back to d2, erase the d3 report (C6: an erased fact
//     is never read as absent; with the true clock this is BLOCKED).
//  v3 as v2 with the true clock, one hour after the declaration (control for v2).
//  v4 as v1, but the clock behind by one second only.
//  v5 as v1, then a revocation of HEALTH_SIGNALS under the same behind clock before the erasure.
//  v6 one action with the clock 20 days ahead, then the clock right: erase the d3 report (marker 20 days ahead), then state.
//  v7 as v1, then the retry of the erased request (same client request id) under the behind clock, then with the clock right.
// Usage: node q5-erasure-clock-variants.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q5-erasure-clock-variants.mjs <root>');
const {athlete,notFeeling100WithSign,readiness,addDays}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r.ok?'OK':r.error.code;
function run(v){
 const t=athlete({id:`q5-${v}`});t.enroll();const d0=t.sessions(0)[0].date,d=k=>addDays(d0,k);
 const nf=(k,rid)=>{t.set(d(k),'09:00');return t.api.notFeeling100({actor:t.actor,clientRequestId:rid,expectedVersion:t.version(),...notFeeling100WithSign(d(k))});};
 const ready=(k,rid)=>{t.set(d(k),'09:00');return t.api.declareReadiness({actor:t.actor,clientRequestId:rid,expectedVersion:t.version(),...readiness(d(k))});};
 const out={v};let target;
 if(v==='v2'||v==='v3'){nf(0,'nf1');ready(1,'rd1');target=nf(3,'nf2');const r2=ready(4,'rd2');out.rd2=[code(r2),r2.status??null,r2.error?.message??null];}
 else{nf(0,'nf1');ready(1,'rd1');target=nf(3,'nf2');}
 if(v==='v6'){t.set(d(20),'09:00');out.ahead=code(t.weekly(d(3),[]));}
 if(v==='v1'||v==='v5'||v==='v7')t.set(d(0),'20:00');
 if(v==='v2')t.set(d(2),'20:00');
 if(v==='v3')t.set(d(4),'10:00');
 if(v==='v4'){t.set(d(3),'09:00');t.clock-=1000;}
 if(v==='v6')t.set(d(3),'10:00');
 if(v==='v5')out.revoke=code(t.it.setConsent({actor:t.actor,purpose:'HEALTH_SIGNALS',granted:false,expectedVersion:t.version()}));
 const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[target.eventId],expectedVersion:t.version()});out.erase=code(e);
 const rows=t.it.visible(t.doc());out.marker=rows.filter(r=>r.fact==='ERASED_F08').map(r=>r.declaredAt);out.lastReady=rows.filter(r=>r.fact==='READINESS_DECLARED').map(r=>r.declaredAt).at(-1)??null;
 out.lastAt=t.it.carried({actor:t.actor}).lastAt;
 if(v==='v7'){const again=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf2',expectedVersion:t.version(),...notFeeling100WithSign(d(3))});out.retryBehind=code(again);}
 if(v==='v5'){t.set(d(3),'11:00');out.regrant=code(t.it.setConsent({actor:t.actor,purpose:'HEALTH_SIGNALS',granted:true,expectedVersion:t.version()}));}
 t.set(v==='v6'?d(3):d(4),v==='v6'?'11:00':'11:00');
 const st=t.api.status({actor:t.actor});out.state=st.ok?st.state:code(st);
 const wk=t.weekly(v==='v6'?d(3):d(4),[]);out.weekly=[code(wk),wk.status??null];
 if(v==='v7'){t.set(d(4),'12:00');const again=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf2',expectedVersion:t.version(),...notFeeling100WithSign(d(3))});out.retryRight=[code(again),again.status??null];}
 return out;
}
for(const v of ['v1','v2','v3','v4','v5','v6','v7'])console.log(JSON.stringify(run(v)));
