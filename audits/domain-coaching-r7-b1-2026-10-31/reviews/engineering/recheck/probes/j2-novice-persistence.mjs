// R7B1-ENG-r1 judge probe J2 (QE-R7B-R2-01, QE-R7B-05 residual): the context a decision rebuilds is the context later reviews compose from.
// Read-only; PROBE_ROOT=<tree> runs it on another runtime. For every decision kind on a strength-NONE athlete, then the next weekly reviews:
// - J2a: stored noviceTemplates follow the context in force (present whenever the plan holds a capped week; no set-aside exercise; only the
//   equipment of the permanent context);
// - J2b: the plan is capped exactly when its state is, in every week ahead, after every later review;
// - J2c: the next weekly review reproduces the decision's own selection for the next week (same template types and exercises per session):
//   the stored context is the one the decision composed with (planned -> released/executed without drift);
// - J2d: released -> corrected: a correction of the boundary week re-caps the next week from the stored templates of the current context, which
//   still honour every earlier decision (no set-aside exercise, no removed equipment);
// - J2e: a change stated from a later week keeps the earlier context (and its capped templates) before that week.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,live,addDays,BAD,correctionOf,apply,P,R,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);

const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],weeks:12};
const strengthSessions=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const shape=(p,w)=>JSON.stringify(strengthSessions(p,w).map(s=>[s.templateType,s.prescription.exercises.map(e=>e.id)]));
const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
const aside=p=>new Set((p.canonical.athlete.strengthSelections??[]).filter(s=>s.setAside!==false&&['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'].includes(s.reason)).map(s=>s.from));
const CAPPED_TYPES=new Set(['CORE','FULL_A','FULL_B','FULL_C']);
const failures={J2a:[],J2b:[],J2c:[],J2d:[],J2e:[]},info=[];
const ctxCheck=(name,step,p)=>{
 const sk=P.skeletonOf(p,auth),have=new Set([...p.canonical.athlete.equipment,'BODYWEIGHT']),gone=aside(p);
 const cappedAhead=p.stateTrace.some((st,k)=>k<p.weeks.length&&st?.strength?.density?.capped===true&&(sk.at(k)??sk).c.schedule.strengthDays.length>2);
 if(cappedAhead&&!p.noviceTemplates)failures.J2a.push({name,step,note:'a capped week ahead but no stored capped templates'});
 for(const tp of p.noviceTemplates??[])for(const row of tp.rows)if(gone.has(row.entry.id)||!row.entry.equipment.every(q=>have.has(q)))failures.J2a.push({name,step,template:tp.type,exercise:row.entry.id,note:gone.has(row.entry.id)?'set-aside exercise in the stored capped templates':'missing equipment in the stored capped templates'});
 for(let k=0;k<p.weeks.length;k++){const s=sk.at(k)??sk;if(s.c.schedule.strengthDays.length<=2)continue;const capped=P.densityCappedAt(s,p.stateTrace[k]?.strength),t=types(p,k);if(!t)continue;
  const isCapped=t.split(',').includes('CORE');if(isCapped!==capped)failures.J2b.push({name,step,week:k,capped,types:t,note:'plan capped differs from its state'});}
};
const decisions=[
 ['sub-mismatch-w2',{id:'j2-a',schedule:{strengthDays:[0,2,4,5]}},2,t=>({kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}})],
 ['sub-pref-w1',{id:'j2-b',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'db-row',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}})],
 ['sched-2to4-w1',{id:'j2-c',schedule:{strengthDays:[0,4]}},1,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}})],
 ['sched-2to3-w2',{id:'j2-d',schedule:{strengthDays:[0,4]}},2,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}})],
 ['sched-4to2-w1',{id:'j2-e',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,4]}})],
 ['sched-2to4-from-w3',{id:'j2-f',schedule:{strengthDays:[0,4]}},1,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5],from:t.p.weeks[3].startDate}})],
 ['equip-kb-w1',{id:'j2-g',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}})],
 ['equip-bw-w2',{id:'j2-h',schedule:{strengthDays:[0,2,4,5]}},2,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:[]}})],
 ['equip-add-kb-w1',{id:'j2-i',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}})],
 ['equip-window-w1',{id:'j2-j',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL'],from:t.p.weeks[2].startDate,to:addDays(t.p.weeks[2].startDate,6)}})],
 ['goal-hyp-w1',{id:'j2-k',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})],
 ['goal-rs-w2',{id:'j2-l',schedule:{strengthDays:[0,2,4,5]}},2,t=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'RUNNING_SUPPORT'}}})],
 ['sched-2to4-then-sub',{id:'j2-m',schedule:{strengthDays:[0,4]}},1,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),t=>({kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}})],
 ['sub-then-equip-kb',{id:'j2-n',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL','BANDS']}})],
 ['equip-then-goal',{id:'j2-o',schedule:{strengthDays:[0,2,4,5]}},1,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','KETTLEBELL']}}),t=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})],
];
for(const [name,o,w0,...makes] of decisions)guard('J2-'+name,'novice persistence',()=>{
 const t=reviewed({...NOV,...o},w0);const steps=[];
 let w=w0;
 for(const [i,make] of makes.entries()){
  const x=make(t),r=apply(t,evaluateProgram(t.p,{...review(t.p,w,{hour:'06:00:00',...x,day:x.day??0}),actualLedger:t.ledger},opts));
  steps.push({step:`decision${i}`,week:w,status:r.status,action:r.action,stored:!!t.p.noviceTemplates,reason:String(r.reason).slice(0,120)});
  if(r.status!=='MODIFY'){info.push({name,step:i,status:r.status,reason:String(r.reason).slice(0,200)});return;}
  ctxCheck(name,`decision${i}`,t.p);
  if(i<makes.length-1){weekly(t,w);w++;}
 }
 // The decision's own plan for the next weeks, then the weekly reviews: the review of a week executed as planned reproduces the next week's selection.
 for(let k=w;k<Math.min(w+5,t.p.weeks.length-1);k++){
  const planned=shape(t.p,k+1),rv=weekly(t,k,{o:()=>({kg:()=>12})});
  const now=shape(t.p,k+1);if(planned!==now)failures.J2c.push({name,reviewedWeek:k,nextWeek:k+1,action:rv.action,planned:JSON.parse(planned).map(x=>x.flat().join(' ')),now:JSON.parse(now).map(x=>x.flat().join(' '))});
  ctxCheck(name,`weekly${k}`,t.p);
 }
 // J2e: a change from a later week leaves the earlier context in force before it.
 if(name==='sched-2to4-from-w3'){const sk=P.skeletonOf(t.p,auth);const before=(sk.at(2)??sk).c.schedule.strengthDays.length,after=(sk.at(3)??sk).c.schedule.strengthDays.length;
  if(!(before===2&&after===4))failures.J2e.push({name,before,after});
  if(types(t.p,2).split(',').length!==2)failures.J2e.push({name,week2:types(t.p,2),note:'week 2 not on the earlier two-day context'});}
 info.push({name,steps,finalStored:!!t.p.noviceTemplates,finalTypes:[w,w+1,w+2,w+3].filter(k=>k<t.p.weeks.length).map(k=>`w${k}:${types(t.p,k)}`)});
});

// J2d: released -> corrected re-caps from the stored context, which still honours the earlier decisions.
for(const [name,o,pre] of [
 ['sub-then-release-then-fix',{id:'j2-d1',schedule:{strengthDays:[0,2,4,5]}},t=>apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts))],
 ['sched-then-release-then-fix',{id:'j2-d2',schedule:{strengthDays:[0,4]}},t=>apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts))],
 ['equip-then-release-then-fix',{id:'j2-d3',schedule:{strengthDays:[0,2,4,5]}},t=>apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts))]])
 guard('J2d-'+name,'released then corrected',()=>{
  const t=reviewed({...NOV,...o},0),startWeek=name.startsWith('sched')?1:2;for(let w=0;w<startWeek;w++)weekly(t,w);
  const d=pre(t);if(d.status!=='MODIFY'){failures.J2d.push({name,decision:d.status,reason:String(d.reason).slice(0,160)});return;}
  const sk0=P.skeletonOf(t.p,auth),boundary=P.firstStrengthBoundary(sk0);
  for(let w=startWeek;w<boundary;w++)weekly(t,w,{o:()=>({kg:()=>12})});
  const released=t.p.stateTrace[boundary]?.strength?.density??null,day=t.p.weeks[boundary].startDate;
  const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[boundary-1].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD));
  const r=apply(t,evaluateProgram(t.p,{...review(t.p,boundary,{day:0,hour:'06:00:00',observations:fixes}),actualLedger:t.ledger},opts));
  const ahead=t.p.weeks[boundary].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day),ids=ahead.flatMap(s=>s.prescription.exercises.map(e=>e.id)),have=new Set([...t.p.canonical.athlete.equipment,'BODYWEIGHT']);
  const bad=ids.filter(id=>aside(t.p).has(id)||!R.configurationOf(id).equipment.every(q=>have.has(q)));
  const recapped=ahead.some(s=>s.templateType==='CORE')||t.p.stateTrace[boundary]?.strength?.density?.capped===true&&ahead.every(s=>CAPPED_TYPES.has(s.templateType));
  info.push({name,boundary,released,correction:{status:r.status,action:r.action},recapped,aheadTypes:ahead.map(s=>s.templateType),bad});
  if(!recapped||bad.length)failures.J2d.push({name,boundary,released,correction:r.status+'/'+r.action,recapped,aheadTypes:ahead.map(s=>s.templateType),bad});
  // and the weekly review of that week plans the next one capped from the same stored context
  const rv=weekly(t,boundary,{o:()=>({kg:()=>12})}),next=strengthSessions(t.p,boundary+1),ids2=next.flatMap(s=>s.prescription.exercises.map(e=>e.id)),bad2=ids2.filter(id=>aside(t.p).has(id)||!R.configurationOf(id).equipment.every(q=>have.has(q)));
  if(bad2.length)failures.J2d.push({name,week:boundary+1,bad:bad2,action:rv.action});
 });

record('J2a','stored capped templates follow the context in force',!failures.J2a.length,'a stored program holds the capped templates whenever a capped week lies ahead, with no set-aside exercise and only the equipment of its permanent context',{failures:failures.J2a.slice(0,10),count:failures.J2a.length});
record('J2b','capped exactly when the state is',!failures.J2b.length,'every week with more than two strength days is capped exactly when its state is, after the decision and after every later review',{failures:failures.J2b.slice(0,10),count:failures.J2b.length});
record('J2c','the next review reproduces the decision\'s selection',!failures.J2c.length,'a week executed as planned and reviewed plans the next week with the same template types and exercises the decision planned for it',{failures:failures.J2c.slice(0,10),count:failures.J2c.length});
record('J2d','released, then corrected: re-capped from the stored context',!failures.J2d.length,'a correction of the boundary week re-caps the sessions ahead from the stored capped templates, which keep every earlier decision',{failures:failures.J2d,count:failures.J2d.length});
record('J2e','a change from a later week keeps the earlier context before it',!failures.J2e.length,'weeks before a dated change keep the earlier schedule and its templates',{failures:failures.J2e});
record('J2-info','decision timelines (information)',true,'',{label:LABEL,info});
done('j2-novice-persistence');
