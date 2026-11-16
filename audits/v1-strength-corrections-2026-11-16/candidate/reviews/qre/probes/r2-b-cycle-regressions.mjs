// QRE V1STR recheck R2, probe B (independent judge; read-only): regressions the corrective cycle could introduce in selection.
// (1) practiceStart against the engine's strength class NONE, over a population of intakes and restarts.
// (2) A plan in force: the plane rule after a rebuild (schedule changes in both directions, permanent equipment loss and regain, substitutions,
//     event weeks) against the same sequence without the plane rule. Counted: a MAIN row that takes an exercise the plan held before only in
//     another role (the dose-state concern of SSCTR-STR-A-01, through `established`), an exercise new to the plan, a vertical lift lost, and
//     a NONE plan in force acted on by the rule although it was built with none.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/r2-b-cycle-regressions.mjs [out.json]
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {lifter,hybrid,timeline,live,hash,EQUIPMENT,FULL,DEV,OFF,only,familiar,rowsOf,mainsOf,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const out={};const note=(k,v)=>{out[k]=v;console.log(k,JSON.stringify(v));};
const NOPLANE=only('HOLD','UPPER');
const asks=p=>[...(p.templates??[]),...(p.noviceTemplates??[])].flatMap(t=>t.rows.filter(r=>r.planeAlternation).map(r=>t.type+':'+r.slot));
const twoMainSlots=p=>['PUSH','PULL'].some(pt=>(p.templates??[]).flatMap(t=>t.rows.filter(r=>r.role==='MAIN'&&r.slotPattern===pt)).length>=2);

// (1) practiceStart vs class NONE
{const rows=[];let n=0,mismatch=[];
 const variants=[
  ...['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'].map(e=>({label:'stated '+e,i:lifter({experience:e})})),
  ...[0,3,6,12,24,60].map(m=>({label:'months '+m,i:lifter({months:m})})),
  {label:'NOVICE + familiar db-row',i:lifter({experience:'NOVICE',known:[familiar('db-row')]})},
  {label:'NONE + familiar:false entry',i:lifter({experience:'NONE',known:[{id:'db-row',familiar:false,current:false,tolerated:true,observedAt:'2026-11-06'}]})},
  {label:'NONE + unknown name',i:lifter({experience:'NONE',known:[familiar('zercher-squat')]})},
  {label:'NOVICE + dose',i:lifter({experience:'NOVICE',known:[{id:'goblet-squat',sets:3,reps:8,load:{value:16,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-06'}]})},
  {label:'NONE + stale dose',i:lifter({experience:'NONE',known:[{id:'goblet-squat',sets:3,reps:8,load:{value:16,unit:'KG',convention:'TOTAL'},rir:2,current:false,familiar:true,tolerated:true,observedAt:'2026-01-06'}]})},
  {label:'hybrid NOVICE months 3',i:hybrid({months:3})},{label:'hybrid months 0',i:hybrid({months:0})},
 ];
 for(const v of variants)for(const eq of ['FULL','MACH_DB','BANDS','BANDS_PULLUP','DB_BANDS'])for(const days of [[1,4],[1,3,5],[0,2,4,6]]){
  const i={...v.i,athlete:{...v.i.athlete,equipment:EQUIPMENT[eq]},schedule:{...v.i.schedule,strengthDays:days}};
  const r=S.generateProgram(i,DEV);n++;if(!r.program){rows.push({label:v.label,status:r.status});continue;}
  const cls=r.program.capability.strength.class,a=asks(r.program).length;
  // Expectation of D-13: class NONE asks nothing; any other class asks wherever two MAIN slots of a pattern exist.
  const ok=cls==='NONE'?a===0:(!twoMainSlots(r.program)||a>0);
  if(!ok)mismatch.push({label:v.label,eq,days:days.length,cls,asks:a});
 }
 note('B1 practiceStart vs strength class NONE',{plans:n,notGenerated:rows,mismatches:mismatch});
}
// (1b) Restart after a pause: the new plan's class and asks.
{const res=[];
 for(const experience of ['NONE','INTERMEDIATE'])for(const eq of ['FULL','MACH_DB']){
  const intake=lifter({experience,equipment:EQUIPMENT[eq],days:[1,3,5]}),t=timeline(intake);t.weeks(0,2);
  for(const weeks of [1,6]){const asOf=addDays(t.p.startDate,22),r=S.restartProgram({intake:{...intake,asOf,startDate:addDays(t.p.startDate,28),athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref},DEV);
   res.push({experience,eq,pauseWeeks:weeks,status:r.status,cls:r.program?.capability.strength.class??null,asks:r.program?asks(r.program).length:null});}
 }
 note('B1b restart class and asks',res);
}

// (2) Plans in force.
// Each sequence: the steps before the last change (week by week), then the last change at week `at`; `before` is what weeks 0..at-1 held.
const sched=d=>['SCHEDULE_CHANGE',{changes:{strengthDays:d}}],equip=e=>['EQUIPMENT_CHANGE',{changes:{equipment:e}}];
const SEQ={
 'sched 2->3':{at:2,last:sched([1,3,5])},'sched 2->4':{at:2,last:sched([0,2,4,6])},'sched 3->2':{at:2,last:sched([1,4])},'sched 4->2':{at:2,last:sched([1,4])},
 'sched 3->4':{at:2,last:sched([0,2,4,6])},'sched 4->3':{at:2,last:sched([1,3,5])},'sched 2->5':{at:2,last:sched([0,1,2,4,6])},'sched 5->2':{at:2,last:sched([1,4])},
 'equip loss->regain':{at:4,pre:equip(['BANDS']),last:null},'equip to machines':{at:2,last:equip(['MACHINES','BANDS'])},
 'sched 4->2 then 2->4':{at:4,pre:sched([1,4]),last:sched([0,2,4,6])},
};
const FROM={'sched 2->3':[1,4],'sched 2->4':[1,4],'sched 3->2':[1,3,5],'sched 4->2':[0,2,4,6],'sched 3->4':[1,3,5],'sched 4->3':[0,2,4,6],'sched 2->5':[1,4],'sched 5->2':[0,1,2,4,6],'equip loss->regain':[1,4],'equip to machines':[1,4],'sched 4->2 then 2->4':[0,2,4,6]};
const ids=(p,from,to=p.weeks.length)=>{const m=new Map();for(let w=from;w<to;w++)for(const {e} of rowsOf(p,w)){m.set(e.id,new Set([...(m.get(e.id)??[]),e.role]));}return m;};
{const tally={sequences:0,roleSwitchByRule:[],newExerciseByRule:[],verticalLost:[],noneInForceActedOn:[],statusDiffers:[]};
 const VERT=id=>/VERTICAL/.test(configurationOf(id)?.subpattern??'');
 for(const [name,seq] of Object.entries(SEQ))for(const eq of ['FULL','MACH_DB','MACHINES','BANDS','BANDS_PULLUP','DB_BANDS','KB'])for(const who of ['NONE','NOVICE+known','INTERMEDIATE','hybrid']){
  const base=who==='hybrid'?hybrid({equipment:EQUIPMENT[eq],days:FROM[name]}):lifter({experience:who==='NOVICE+known'?'NOVICE':who,known:who==='NOVICE+known'?[familiar('goblet-squat')]:[],equipment:EQUIPMENT[eq],days:FROM[name],goal:'HYPERTROPHY'});
  const run=opts=>{const t=timeline(base,{opts});if(!t.p)return null;t.weeks(0,1);
   if(seq.pre){t.step(2,0,...seq.pre,'06:00');t.weeks(2,3);}
   const before=ids(t.p,0,seq.at),[kind,extra]=seq.last??equip(base.athlete.equipment),r=t.step(seq.at,0,kind,extra,'06:00');t.weeks(seq.at,seq.at+1);
   return {t,r,before,after:ids(t.p,seq.at+2),mains:mainsOf(t.p)};};
  const d=run(DEV),n=run(NOPLANE);if(!d||!n){continue;}tally.sequences++;
  const label=`${name} ${eq} ${who}`;
  if(d.r.status!==n.r.status)tally.statusDiffers.push({label,dev:d.r.status,noPlane:n.r.status});
  // A MAIN row after the change whose exercise the plan before held only in another role, with the rule and not without it.
  const switched=x=>[...x.after].filter(([id,roles])=>roles.has('MAIN')&&x.before.has(id)&&!x.before.get(id).has('MAIN')).map(([id])=>id);
  const sd=switched(d),sn=switched(n);const extra=sd.filter(id=>!sn.includes(id));
  if(extra.length){const rowsW=(p,w,id)=>rowsOf(p,w).filter(x=>x.e.id===id).map(x=>({session:x.s.id,role:x.e.role,sets:x.e.sets,reps:x.e.reps,rir:x.e.rir,load:x.e.load?.mode}));
   const lastBefore=id=>{for(let w=seq.at-1;w>=0;w--){const r=rowsW(d.t.p,w,id);if(r.length)return {week:w,rows:r};}return null;};
   tally.roleSwitchByRule.push({label,ids:extra,detail:extra.map(id=>({id,before:lastBefore(id),afterWithRule:rowsW(d.t.p,seq.at+2,id),afterWithoutRuleThatSlot:Object.entries(n.mains).filter(([k])=>d.mains[k]===id).map(([k,v])=>k+'='+v)}))});}
  // An exercise in the plan after the change that neither the plan before (with the rule) nor the plan after without the rule holds.
  const fresh=[...d.after.keys()].filter(id=>!d.before.has(id)&&!n.after.has(id));if(fresh.length)tally.newExerciseByRule.push({label,ids:fresh});
  // A vertical lift the plan held before as MAIN and no longer holds at all.
  const lost=[...d.before].filter(([id,r])=>VERT(id)&&r.has('MAIN')&&!d.after.has(id)).map(([id])=>id);if(lost.length&&!name.startsWith('equip'))tally.verticalLost.push({label,ids:lost});
  // NONE plans: built with no asking slot; after the change, does the plane rule change anything against the same plan without it?
  if(who==='NONE'&&hash(d.t.p.templates)!==hash(n.t.p.templates))tally.noneInForceActedOn.push({label,dev:d.mains,noPlane:n.mains});
 }
 note('B2 plans in force',{sequences:tally.sequences,roleSwitchByRule:tally.roleSwitchByRule,newExerciseByRule:tally.newExerciseByRule,verticalLost:tally.verticalLost,noneInForceActedOn:tally.noneInForceActedOn,statusDiffers:tally.statusDiffers});
}
// (3) Event weeks: a schedule change and an equipment change inside the taper; nothing new to the plan in the taper, race or post-event weeks.
{const res=[];
 for(const eq of ['FULL','MACH_DB','DB_BANDS'])for(const [kind,extra] of [['SCHEDULE_CHANGE',{changes:{strengthDays:[2]}}],['SCHEDULE_CHANGE',{changes:{strengthDays:[0,2,4]}}],['EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}}]]){
  const t=timeline(hybrid({equipment:EQUIPMENT[eq],weeks:8}));const ph=t.p.phases.phases,taper=ph.indexOf('TAPER');t.weeks(0,taper-1);
  const earlier=new Set(t.p.weeks.slice(0,taper).flatMap((_,w)=>rowsOf(t.p,w).map(x=>x.e.id)));
  const r=t.step(taper,0,kind,extra,'06:00');const later=t.p.weeks.slice(taper).flatMap((_,k)=>rowsOf(t.p,taper+k).map(x=>x.e.id));
  res.push({eq,kind,changes:extra.changes,status:r.status,newInEventWeeks:[...new Set(later.filter(id=>!earlier.has(id)))]});
 }
 note('B3 event weeks',res);
}
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
