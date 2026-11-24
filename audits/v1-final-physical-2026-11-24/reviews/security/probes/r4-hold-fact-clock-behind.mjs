// SEC_FPV_R1 probe r4 (context for SEC-BC-R2-01's scope): the view's other reads "as of the clock". A CLINICAL_HOLD fact recorded with the
// clock ahead, then later ops at that clock that change the cached reference, then the clock set right: what does the plan view show?
// Usage: node r4-hold-fact-clock-behind.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];
const {athlete,notFeeling100WithSign,addDays,ELIG}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r?.ok===false?r.error.code:'OK';
for(const follow of ['none','noScreen','screen','deviceImport']){
 const t=athlete({id:`r4-${follow}`});t.enroll();const d0=t.sessions(0)[0].date,ahead=addDays(d0,20);
 t.set(ahead,'09:00');const h=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(ahead)});
 t.set(ahead,'10:00');let f=null;
 if(follow==='noScreen')f=t.submit({kind:'WEEKLY_REVIEW',observations:[]});
 if(follow==='screen')f=t.screen(ELIG(ahead));
 if(follow==='deviceImport'){const s=t.sessions(0)[0];f=t.it.importActivities({actor:t.actor,clientRequestId:'hk',expectedVersion:t.version(),activities:[{...t.watch(s),observedAt:new Date(Date.parse(ahead+'T08:00:00-03:00')).toISOString()}]});}
 const ref=t.doc().reference?.pending?.status??null;t.set(addDays(d0,1),'09:00');const v=t.api.plan({actor:t.actor}).view;
 console.log(JSON.stringify({follow,hold:[code(h),h.status],follow_:f?[code(f),f.status??null]:null,referencePending:ref,stateRight:v.state,executable:v.week.sessions.filter(s=>s.executable).length,write:code(t.weekly(addDays(d0,1),[]))}));
}
