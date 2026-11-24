// SEC_BC_R2 probe q7 (SEC-BC-01, restore): the q1 attack, then the stored record restored to its state before the erasure (a backup put back),
// with and without the anchor. A restore must never end in a released hold.
// Usage: node q7-erasure-restore.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q7-erasure-restore.mjs <root>');
const {athlete,notFeeling100WithSign,readiness,addDays,memoryAnchor}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r.ok?'OK':r.error.code;
for(const withAnchor of [false,true]){
 const t=athlete({id:`q7-${withAnchor}`,anchor:withAnchor?memoryAnchor():null});t.enroll();const d0=t.sessions(0)[0].date,d=k=>addDays(d0,k);
 t.set(d(0),'08:00');t.api.notFeeling100({actor:t.actor,clientRequestId:'nf1',expectedVersion:t.version(),...notFeeling100WithSign(d(0))});
 t.set(d(1),'09:00');t.api.declareReadiness({actor:t.actor,clientRequestId:'rd1',expectedVersion:t.version(),...readiness(d(1))});
 t.set(d(3),'09:00');const h2=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf2',expectedVersion:t.version(),...notFeeling100WithSign(d(3))});
 const before=t.store.raw(t.id);
 t.set(d(0),'20:00');const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[h2.eventId],expectedVersion:t.version()});
 t.set(d(3),'11:00');const afterErase=t.api.status({actor:t.actor}).state;
 t.store.setRaw(t.id,before);
 const st=t.api.status({actor:t.actor});let wk;try{wk=t.weekly(d(3),[]);}catch(x){wk={ok:false,error:{code:'THREW:'+x.message}};}
 console.log(JSON.stringify({withAnchor,erase:code(e),afterErase,afterRestore:st.ok?st.state:code(st),weekly:[code(wk),wk.status??null]}));
}
