// SEC_FPV_R1 probe r2 (G07: "an erasure request can never be read as recovery or readiness"). Each variant ends with the plan view state, the
// sports' states, executable sessions, the status read, and the engine's next weekly status; the expected exit is a readiness declaration only.
//  e1 hold (sign), erase every F08 fact (final-g07-erasure shape)            e2 hold, readiness, erase the READINESS declaration only
//  e3 hold, erase, then a screen answered with no sign (no declaration)      e4 hold, erase, then erase the erasure marker's own id
//  e5 symptom stop, erase the stop's session report id (not an F08 fact)     e6 hold, revoke HEALTH_SIGNALS, erase, re-grant
//  e7 hold, erase, a second erasure of the same id                          e8 "not 100%" without a sign (logged only), erase
//  e9 hold, erase, readiness (the only exit): expected to continue          e10 stop, hold, erase all F08, readiness: the stop still screened
// Usage: node r2-g07-erasure-never-readiness.mjs <root containing CoachingCore>   (synthetic athletes only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node r2-g07-erasure-never-readiness.mjs <root>');
const H=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const {athlete,notFeeling100WithSign,readiness,addDays,ELIG,U}=H;
const code=r=>r?.ok===false?r.error.code:'OK';
function end(t,day){const v=t.api.plan({actor:t.actor}).view;t.set(day,'23:00');const w=t.weekly(day,[]);
 return {state:v.state,sports:Object.values(v.sports).map(s=>s.state).join('/'),executable:v.week.sessions.filter(s=>s.executable).length,status:t.api.status({actor:t.actor}).state,nextWeekly:[code(w),w.status??null,w.warningSignScreen?.reason??null]};}
function run(v){
 const t=athlete({id:`g07-${v}`});t.enroll();const p=t.doc().program,d=k=>addDays(p.startDate,k),out={v};
 const nf=(k,time,req)=>{t.set(d(k),time);return t.api.notFeeling100({actor:t.actor,clientRequestId:`nf-${k}-${time}`,expectedVersion:t.version(),...req});};
 const ready=(k,time)=>{t.set(d(k),time);return t.api.declareReadiness({actor:t.actor,clientRequestId:`rd-${k}-${time}`,expectedVersion:t.version(),...readiness(d(k))});};
 const erase=ids=>t.it.eraseHealthFacts({actor:t.actor,eventIds:ids,expectedVersion:t.version()});
 const f08=()=>t.doc().rows.filter(r=>r&&r.fact&&r.fact!=='ERASED_F08').map(r=>r.eventId);
 const stopRun=()=>{const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');const r=t.weekly(s.date,[{...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U,recovery:'ADVERSE'}}]);out.stop=[code(r),r.warningSignScreen?.reason??null];return r;};
 let day=4;
 if(v==='e10')stopRun();
 if(v==='e5'){const r=stopRun();t.set(d(1),'21:00');out.erase=code(erase(r.recorded));out.after=end(t,d(1));return out;}
 if(v==='e8'){const r=nf(4,'08:00',{eligibility:ELIG(d(4)),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{},intent:'REST',days:1}});out.nf=[code(r),r.status??null];
  out.before=t.api.plan({actor:t.actor}).view.state;t.set(d(4),'09:00');out.erase=[code(erase([r.eventId])),t.doc().rows.some(x=>x?.fact==='ERASED_F08')?'marker':'no-marker'];out.after=end(t,d(4));return out;}
 const h=nf(4,'08:00',notFeeling100WithSign(d(4)));out.hold=[code(h),h.status??null];
 if(v==='e2'){const r=ready(5,'08:00');out.ready=[code(r),r.status??null];out.beforeErase=t.api.plan({actor:t.actor}).view.state;t.set(d(5),'09:00');out.erase=code(erase([r.eventId]));day=5;out.after=end(t,d(5));return out;}
 if(v==='e6'){t.set(d(4),'08:30');out.revoke=code(t.it.setConsent({actor:t.actor,purpose:'HEALTH_SIGNALS',granted:false,expectedVersion:t.version()}));}
 t.set(d(4),'09:00');const e=erase(f08());out.erase=code(e);
 if(v==='e6'){t.set(d(4),'09:30');out.regrant=code(t.it.setConsent({actor:t.actor,purpose:'HEALTH_SIGNALS',granted:true,expectedVersion:t.version()}));}
 if(v==='e3'){t.set(d(4),'10:00');out.screen=code(t.screen(ELIG(d(4))));}
 if(v==='e4'){const m=t.doc().rows.filter(r=>r&&r.fact==='ERASED_F08').map(r=>r.eventId);t.set(d(4),'10:00');const r=erase(m);out.eraseMarker=code(r);out.markers=t.doc().rows.filter(r=>r&&r.fact==='ERASED_F08').length;}
 if(v==='e7'){t.set(d(4),'10:00');out.eraseAgain=code(erase([h.eventId]));}
 if(v==='e9'||v==='e10'){const r=ready(5,'08:00');out.ready=[code(r),r.status??null];day=5;t.set(d(5),'09:00');const s=t.screen(ELIG(d(5)));out.screenAfterReady=[code(s),s.status??null,s.warningSignScreen?.reason??null];}
 out.after=end(t,d(day));return out;
}
for(const v of ['e1','e2','e3','e4','e5','e6','e7','e8','e9','e10'])try{console.log(JSON.stringify(run(v)));}catch(e){console.log(JSON.stringify({v,threw:String(e.message).slice(0,160)}));}
