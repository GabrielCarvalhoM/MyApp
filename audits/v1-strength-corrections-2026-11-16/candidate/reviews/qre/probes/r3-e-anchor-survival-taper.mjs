// QRE V1STR N4 recheck R3, probe E (independent judge; read-only, writes nothing but its own JSON when given a path).
// (1) Anchor survival through a permanent loss of equipment and its regain: the anchors after the loss, after the regain, and whether each
//     anchored slot is back on its own configuration. The author's record says the anchor comes back when the equipment comes back.
//     The fix makes a slot ask in force only where an anchor exists, so an anchor that is not carried through (a slot left unfilled meanwhile
//     has no row, hence no annotation) would end the alternation for good.
// (2) Changes inside the taper of a race plan (days in every direction, equipment), with the same-state counterfactual of probe A at each
//     review through the race week and the week after: what differs from the plan state reviewed without the plane rule.
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-e-anchor-survival-taper.mjs [out.json]
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {programHash} from '../../../../../../CoachingCore/src/r6-program.mjs';
import {slotsInForce} from '../../../../../../CoachingCore/src/v1-strength.mjs';
import {lifter,hybrid,timeline,EQUIPMENT,DEV,only,familiar,report,live,rowsOf} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const NOPLANE=only('HOLD','UPPER'),DAYS={1:[3],2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]};
const out={survival:{runs:0,lostAfterLoss:[],notBackAfterRegain:[],backOnOwn:0},taper:{runs:0,steps:0,notKeep:[],asksNotBuilt:[],statusDiffers:[],newInEventWeeks:[]}};
const slotOf=(p,key)=>{const [type,slot]=key.split(':');return (p.templates??[]).find(t=>t.type===type)?.rows.find(r=>r.slot===Number(slot))??null;};
// (1)
for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const eq of ['FULL','MACH_DB','DB','BANDS_PULLUP','MACHINES','DB_BANDS'])for(const days of [2,3,4])for(const lossTo of [[],['BANDS'],['DUMBBELLS']]){
 const intake=lifter({goal,experience:'INTERMEDIATE',equipment:EQUIPMENT[eq],days:DAYS[days]}),t=timeline(intake);if(!t.p)continue;const built=slotsInForce(t.p);if(!Object.keys(built).length)continue;
 out.survival.runs++;const label=`${goal} ${eq} ${days}d loss to ${JSON.stringify(lossTo)}`;
 t.weeks(0,0);t.step(1,0,'EQUIPMENT_CHANGE',{changes:{equipment:lossTo}},'06:00');const mid=slotsInForce(t.p),unfilled=Object.keys(built).filter(k=>!slotOf(t.p,k));t.weeks(1,1);
 t.step(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:intake.athlete.equipment}},'06:00');t.weeks(2,2);const after=slotsInForce(t.p);
 const lost=Object.keys(built).filter(k=>mid[k]!==built[k]);if(lost.length)out.survival.lostAfterLoss.push({label,built,mid,unfilledDuringLoss:unfilled});
 const notBack=Object.keys(built).filter(k=>after[k]!==built[k]||slotOf(t.p,k)?.entry.id!==built[k]);
 if(notBack.length)out.survival.notBackAfterRegain.push({label,built,after,now:Object.fromEntries(Object.keys(built).map(k=>[k,slotOf(t.p,k)?.entry.id??null])),unfilledDuringLoss:unfilled});else out.survival.backOnOwn++;
}
// (2)
const cfPlan=p=>{const q=structuredClone(p);q.repertoire.strengthExtension={...q.repertoire.strengthExtension,boundaries:q.repertoire.strengthExtension.boundaries.filter(b=>b!=='V1X-STRENGTH-PLANE')};delete q.hash;q.hash=programHash(q);return q;};
const slotMap=p=>{const m=new Map();for(const t of p?.templates??[])for(const r of t.rows)m.set(t.type+':'+r.slot,{id:r.entry.id,role:r.role,plane:r.planeAlternation??null,tpl:t.type});return m;};
for(const eq of ['FULL','MACH_DB','DB_BANDS','BANDS_PULLUP'])for(const change of [['D',1],['D',3],['D',4],['D',5],['D','OTHER'],['E',['BANDS']],['E',[]]]){
 const intake=hybrid({equipment:EQUIPMENT[eq],weeks:8}),t=timeline(intake);const phases=t.p.phases.phases,taper=phases.indexOf('TAPER'),built=slotsInForce(t.p);t.weeks(0,taper-1);
 out.taper.runs++;const label=`${eq} ${change.join(' ')}`,earlier=new Set(t.p.weeks.slice(0,taper).flatMap((_,w)=>rowsOf(t.p,w).map(x=>x.e.id)));
 const steps=[['C',taper],...Array.from({length:phases.length-taper},(_,k)=>['W',taper+k])];
 for(const [k,w] of steps){
  const rev=k==='C'?(change[0]==='D'?t.review(w,0,'SCHEDULE_CHANGE',{changes:{strengthDays:change[1]==='OTHER'?[0,3]:DAYS[change[1]]}},'06:00'):t.review(w,0,'EQUIPMENT_CHANGE',{changes:{equipment:change[1]}},'06:00'))
   :t.review(w,6,'WEEKLY_REVIEW',{observations:t.p.weeks[w].sessions.filter(live).map(s=>report(t.p,s,{}))});
  const dev=S.evaluateProgram(t.p,rev,DEV),cf=S.evaluateProgram(cfPlan(t.p),rev,NOPLANE);out.taper.steps++;
  if(dev.status!==cf.status)out.taper.statusDiffers.push({label,step:k+w,dev:dev.status,cf:cf.status});
  if(dev.proposal&&cf.proposal){const A=slotMap(dev.proposal),C=slotMap(cf.proposal),kept=new Set();
   for(const [key,x] of A)if(x.plane){if(!(key in built)||x.plane.built!==built[key])out.taper.asksNotBuilt.push({label,key});if(x.id===x.plane.built&&C.get(key)?.id!==x.id)kept.add(x.tpl);}
   for(const key of new Set([...A.keys(),...C.keys()])){const x=A.get(key),y=C.get(key);if(x?.id===y?.id&&x?.role===y?.role)continue;if(x?.plane&&x.id===x.plane.built)continue;if(kept.has((x??y).tpl))continue;out.taper.notKeep.push({label,step:k+w,key,dev:x?.id??null,cf:y?.id??null});}}
  t.take(dev);
 }
 const later=t.p.weeks.slice(taper).flatMap((_,k)=>rowsOf(t.p,taper+k).map(x=>x.e.id)),fresh=[...new Set(later.filter(id=>!earlier.has(id)))];if(fresh.length)out.taper.newInEventWeeks.push({label,fresh});
}
console.log(JSON.stringify({survival:{runs:out.survival.runs,backOnOwn:out.survival.backOnOwn,lostAfterLoss:out.survival.lostAfterLoss.length,notBackAfterRegain:out.survival.notBackAfterRegain.length},taper:{runs:out.taper.runs,steps:out.taper.steps,notKeep:out.taper.notKeep.length,asksNotBuilt:out.taper.asksNotBuilt.length,statusDiffers:out.taper.statusDiffers.length,newInEventWeeks:out.taper.newInEventWeeks.length}}));
for(const x of out.survival.notBackAfterRegain.slice(0,8))console.log('NOTBACK',JSON.stringify(x));
for(const x of out.taper.notKeep.slice(0,8))console.log('TAPER',JSON.stringify(x));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
