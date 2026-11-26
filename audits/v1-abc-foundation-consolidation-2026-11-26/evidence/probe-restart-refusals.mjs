import {athlete,athleteA} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
for(const [tag,mut] of [['clinical',i=>{i.athlete.eligibility.pain=true;}],['age81',i=>{i.athlete.ageYears=81;}],['ask',i=>{delete i.athlete.eligibility.status;}]]){
const t=athlete({newId,id:'rs'+tag,weeks:8});t.enroll();t.set('2026-11-20','10:00');
const i=athleteA({weeks:8,id:'rs'+tag});i.asOf='2026-11-20';i.startDate='2026-11-23';i.athlete.eligibility.assessedAt='2026-11-20';mut(i);
const r=t.api.restart({actor:t.actor,intake:i,expectedVersion:t.version()});const p=t.api.plan({actor:t.actor});
console.log(tag,r.ok,r.status,r.reason?.slice(0,90),'| plan',p.view?.state,'exec',p.view?.week?.sessions?.filter(s=>s.executable).length);}
