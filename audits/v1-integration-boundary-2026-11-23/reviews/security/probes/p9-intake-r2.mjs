// SEC_INT_R2 probe 9: the cycle-1 intake bounds (enroll/restart), and what the stored record still keeps inside them.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p9-intake-r2.mjs
import {athlete,athleteA} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code+(r.error.limit?':'+r.error.limit:'');
const mk=(id,n,len)=>{const i=athleteA({weeks:8,id});return {...i,athlete:{...i.athlete,performanceAnchors:Array.from({length:n},(_,k)=>({...i.athlete.performanceAnchors[0],note:'NOTE'+k+'-'+'x'.repeat(len)}))}};};
for(const [n,len] of [[3000,0],[500,0],[120,480],[60,480]]){const t=athlete({id:'p9-'+n});const e=t.enroll(mk('p9-'+n,n,len));const raw=t.store.raw('p9-'+n);
 console.log(`enroll ${n} anchors, ${len}-char note each:`,code(e),e.status??'','| stored bytes',raw?.length??null,'| notes kept',(raw?.match(/NOTE\d+-/g)??[]).length);}
const t=athlete({id:'p9-r'});t.enroll();let deep={},c=deep;for(let k=0;k<20;k++){c.a={};c=c.a;}const i=athleteA({weeks:8,id:'p9-r'});
console.log('restart with a 20-deep field:',code(t.it.restart({actor:t.actor,intake:{...i,athlete:{...i.athlete,deep}},expectedVersion:t.version()})));
console.log('restart with 3000 anchors:',code(t.it.restart({actor:t.actor,intake:mk('p9-r',3000,0),expectedVersion:t.version()})));
