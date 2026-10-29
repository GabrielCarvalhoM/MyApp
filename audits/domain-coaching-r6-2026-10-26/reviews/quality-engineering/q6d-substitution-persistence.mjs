// QRE probe Q6d: substitution persistence. After an adopted EQUIPMENT_CHANGE (permanent, and a temporary window), every
// later adopted reprojection (weekly reviews, a schedule change) keeps sessions inside the available equipment; after
// the window the original exercises return without a converted load. Real authority.
import {R6,baseIntake,review,obsFor,sessionsOf,write,addDays} from './qlib.mjs';
const need=e=>e.equipment??[];
function run(windowWeeks){
 let p=R6.generateProgram(baseIntake({id:'q-sub-'+windowWeeks,weeks:12})).program;let ledger=[],model=null,ref=null;const log=[];
 const step=(rv)=>{if(ledger.length)rv.actualLedger=ledger;if(model)rv.athleteModel=model;if(ref)rv.referenceState=ref;const r=R6.evaluateProgram(p,rv);ledger=r.actualLedger??ledger;model=r.updatedModel??model;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;log.push({kind:rv.event.kind,week:rv.weekIndex,status:r.status,action:r.action});return r;};
 const w=2,from=addDays(p.weeks[w].startDate,1),to=windowWeeks?addDays(p.weeks[w].startDate,windowWeeks*7-1):undefined,avail=new Set(['BODYWEIGHT','BANDS']);
 for(let k=0;k<w;k++)step(review(p,k,{observations:sessionsOf(p).filter(s=>s.weekIndex===k&&s.prescription).map(s=>obsFor(p,s))}));
 step(review(p,w,{kind:'EQUIPMENT_CHANGE',day:0,changes:{equipment:[...avail],from,...(to?{to}:{})}}));
 for(let k=w;k<w+5;k++){step(review(p,k,{observations:sessionsOf(p).filter(s=>s.weekIndex===k&&s.prescription&&!ledger.some(o=>o.sessionId===s.id)).map(s=>obsFor(p,s,{loads:{}}))}));if(k===w+1)step(review(p,k+1,{kind:'SCHEDULE_CHANGE',day:0,changes:{strengthDays:[0,2],runDays:[1,3,6],longRunDay:6}}));}
 const inWindow=s=>s.date>=from&&(!to||s.date<=to);
 const bad=sessionsOf(p).filter(s=>s.sport==='STRENGTH'&&s.prescription&&inWindow(s)).flatMap(s=>s.prescription.exercises.filter(e=>need(e).some(q=>!avail.has(q))).map(e=>({session:s.id,date:s.date,exercise:e.id,equipment:need(e)})));
 const after=to?sessionsOf(p).filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.date>to).slice(0,3).map(s=>({id:s.id,exercises:s.prescription.exercises.map(e=>e.id+':'+e.load.mode+(e.load.value!=null?'@'+e.load.value:''))})):null;
 return {window:to?{from,to}:'PERMANENT',log,unavailableEquipmentPrescribed:bad,afterWindow:after};
}
const out={probe:'Q6d-substitution-persistence',authorityUsed:'REAL r6Authority()',permanent:run(0),temporary2w:run(2)};
out.pass=out.permanent.unavailableEquipmentPrescribed.length===0&&out.temporary2w.unavailableEquipmentPrescribed.length===0;
write('q6d-substitution-persistence.out.json',out);console.log(JSON.stringify({pass:out.pass,permanentBad:out.permanent.unavailableEquipmentPrescribed.slice(0,3),tempBad:out.temporary2w.unavailableEquipmentPrescribed.slice(0,3),permLog:out.permanent.log.map(x=>x.kind+':'+x.action),afterWindow:out.temporary2w.afterWindow},null,0));
