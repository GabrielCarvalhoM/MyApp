// QRE V1STR R1, probe B (independent judge; read-only, writes nothing but its own JSON when given a path): N1, N2 and N4 on behaviour, along the
// paths a plan in force takes: equipment changes (permanent, temporary, gain, loss, loss then regain), schedule changes that change the template
// set, block-boundary choices, reason-based substitutions and their replay, novice density, restarts, taper, holds, plan lengths and day counts.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-b-selection-paths.mjs [out.json]
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {slotsInForce} from '../../../../../../CoachingCore/src/v1-strength.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {lifter,hybrid,timeline,live,hash,EQUIPMENT,FULL,DEV,OFF,only,familiar,idsOf,slots,mainsOf,rowsOf,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
import fs from 'node:fs';

const out={cases:{}},HOLDS=['front-plank','side-plank'];
const note=(k,v)=>{out.cases[k]=v;console.log(k,JSON.stringify(v));};
const allIds=p=>[...new Set([...p.weeks.flatMap((_,w)=>rowsOf(p,w).map(x=>x.e.id)),...[...(p.templates??[]),...(p.noviceTemplates??[])].flatMap(t=>t.rows.flatMap(r=>[r.entry.id,...r.alternatives])) ])];
const holdsIn=p=>allIds(p).filter(id=>HOLDS.includes(id));
const weekMains=(p,w)=>rowsOf(p,w).filter(x=>x.e.role==='MAIN'&&x.e.region==='UPPER').map(x=>x.s.templateType+':'+x.e.id).sort();
const loading=id=>configurationOf(id)?.loading;

// B-1 Permanent loss of equipment, then regain (recorded decisions both), for the push and pull MAIN slots: the plan with the rules against the
// frozen engine (OFF) after the same two events, and against a new plan with the regained equipment.
for(const [name,intake] of [['INTERMEDIATE GENERAL FULL 2d',lifter({experience:'INTERMEDIATE',equipment:FULL})],['INTERMEDIATE HYPERTROPHY FULL 2d',lifter({experience:'INTERMEDIATE',goal:'HYPERTROPHY',equipment:FULL})],['EXPERIENCED STRENGTH MACH_DB 2d',lifter({experience:'EXPERIENCED',goal:'STRENGTH',equipment:EQUIPMENT.MACH_DB})],['hybrid RUNNING_SUPPORT FULL 2d',hybrid({equipment:FULL})]]){
 const res={};
 for(const [label,opts] of [['DEV',DEV],['OFF',OFF]]){
  const t=timeline(intake,{opts});const m0=mainsOf(t.p);t.weeks(0,1);
  const loss=t.step(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:[]}},'06:00');const m1=mainsOf(t.p);t.weeks(2,3);
  const regain=t.step(4,0,'EQUIPMENT_CHANGE',{changes:{equipment:intake.athlete.equipment}},'06:00');const m2=mainsOf(t.p);t.weeks(4,5);
  res[label]={built:m0,afterLoss:m1,afterRegain:m2,statuses:[loss.status,regain.status],week6Mains:weekMains(t.p,6),inForce:slotsInForce(t.p)};
 }
 const fresh=mainsOf(S.generateProgram(intake,DEV).program);
 const stuck=Object.entries(res.DEV.afterRegain).filter(([k,id])=>loading(id)!=='EXTERNAL'&&loading(res.OFF.afterRegain[k])==='EXTERNAL').map(([k,id])=>`${k}: ${id} (OFF ${res.OFF.afterRegain[k]}, new plan ${fresh[k]})`);
 note('B1 loss-then-regain '+name,{dev:res.DEV,off:res.OFF,newPlan:fresh,devKeepsBodyweightWhereFrozenEngineReturnsToExternal:stuck});
}
// B-2 Temporary window (dated) of loss, and of gain: the weeks inside and after it.
{
 const intake=lifter({experience:'INTERMEDIATE',equipment:FULL});
 for(const [label,opts] of [['DEV',DEV],['OFF',OFF]]){
  const t=timeline(intake,{opts});t.weeks(0,1);
  const from=t.day(3,0),to=t.day(3,6);
  const r=t.step(2,1,'EQUIPMENT_CHANGE',{changes:{equipment:[],from,to}},'06:00');t.weeks(2,5);
  note(`B2 temporary loss window ${label}`,{status:r.status,week3:weekMains(t.p,3),week4:weekMains(t.p,4),templates:mainsOf(t.p)});
 }
 const g=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB});
 for(const [label,opts] of [['DEV',DEV],['OFF',OFF]]){
  const t=timeline(g,{opts});t.weeks(0,1);
  const r=t.step(2,1,'EQUIPMENT_CHANGE',{changes:{equipment:FULL,from:t.day(3,0),to:t.day(3,6)}},'06:00');const w3=weekMains(t.p,3);t.weeks(2,2);const w3b=weekMains(t.p,3);t.weeks(3,4);
  note(`B2 temporary gain window ${label}`,{status:r.status,week3AtChange:w3,week3NextReview:w3b,week5:weekMains(t.p,5)});
 }
}
// B-3 Schedule changes that change the template set (2->3, 2->4, 4->2, 3->1) under the rules: the upper MAIN rows before and after, and OFF.
for(const [from,to] of [[[1,4],[1,3,5]],[[1,4],[0,2,4,6]],[[0,2,4,6],[1,4]],[[1,3,5],[3]]]){
 const r={};
 for(const [label,opts] of [['DEV',DEV],['OFF',OFF]]){
  const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,days:from}),{opts});t.weeks(0,1);
  const ch=t.step(2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:to}},'06:00');t.weeks(2,3);
  r[label]={status:ch.status,before:Object.values(mainsOf(timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,days:from}),{opts}).p)).filter(id=>['PUSH','PULL'].includes(configurationOf(id).pattern)).sort(),after:mainsOf(t.p),inForce:slotsInForce(t.p),week4:weekMains(t.p,4)};
 }
 note(`B3 schedule ${from.length}d->${to.length}d`,r);
}
// B-4 Block boundary: a MAIN change of the vertical push slot, and its replay; a ladder offer list compared with OFF.
{
 const t=timeline(lifter({experience:'INTERMEDIATE',goal:'HYPERTROPHY',equipment:FULL,days:[1,4],weeks:16}));
 const end=t.p.blocks.find(b=>b.family==='DEVELOPMENT').endWeekExclusive-1;t.weeks(0,end-1);
 const r=t.week(end,()=>({}),{choices:[{type:'MAIN_CHANGE',from:'db-overhead-press',to:'db-bench-press',reason:'ATHLETE_PREFERENCE'}]});
 const after=mainsOf(t.p);t.weeks(end+1,end+3);
 note('B4 MAIN change of the vertical slot at the block boundary',{status:r.status,action:r.action,reason:r.reason,after,later:mainsOf(t.p),inForce:slotsInForce(t.p),rowsFULL_B2:t.p.templates.flatMap(x=>x.rows).filter(x=>x.planeAlternation).map(x=>({entry:x.entry.id,directive:x.directive??null,pa:x.planeAlternation}))});
}
// B-5 SKILL_MISMATCH substitution of the vertical MAIN, then the loss of its substitute's equipment: fallback direction, with and without rules.
for(const [label,opts] of [['DEV',DEV],['OFF',OFF]]){
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,known:[familiar('bench-press')]}),{opts});t.weeks(0,1);
 const vert=mainsOf(t.p)['FULL_B:2'];
 const sub=t.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:vert,reason:'SKILL_MISMATCH'}},'06:00');
 const afterSub=mainsOf(t.p);t.weeks(2,3);
 const loss=t.step(4,0,'EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}},'06:00');
 note(`B5 SKILL_MISMATCH then equipment loss ${label}`,{vertical:vert,subStatus:sub.status,selected:sub.substitutions?.map(x=>x.selected),afterSub,lossStatus:loss.status,lossReason:loss.status==='ASK'?loss.reason:undefined,afterLoss:mainsOf(t.p),inForce:slotsInForce(t.p)});
}
// B-6 N1 along every path: a long plan, five days, bodyweight, rotation every two weeks, familiar planks, a SKILL_MISMATCH and a preference
// substitution of the trunk row, a named plank target, an equipment change, a restart.
{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BANDS,days:[0,1,2,4,6],weeks:16,rotation:'EVERY_2_WEEKS',known:HOLDS.map(familiar)});
 const t=timeline(intake);const seen=new Set(holdsIn(t.p));
 for(let w=0;w<3;w++){t.week(w);holdsIn(t.p).forEach(x=>seen.add(x));}
 const s1=t.step(3,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'dead-bug',reason:'SKILL_MISMATCH'}},'06:00');holdsIn(t.p).forEach(x=>seen.add(x));
 const s2=t.step(3,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'pallof-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:'side-plank'}},'06:10');
 const s3=t.step(3,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'pallof-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}},'06:20');holdsIn(t.p).forEach(x=>seen.add(x));
 const e=t.step(3,1,'EQUIPMENT_CHANGE',{changes:{equipment:[]}},'06:00');holdsIn(t.p).forEach(x=>seen.add(x));
 for(let w=3;w<9;w++){t.week(w);holdsIn(t.p).forEach(x=>seen.add(x));}
 const asOf=addDays(t.p.startDate,64),re=S.restartProgram({intake:{...intake,asOf,startDate:addDays(t.p.startDate,70),athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:1,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref},DEV);
 const trunk=t.p.templates.flatMap(x=>x.rows).filter(r=>r.pattern==='TRUNK').map(r=>r.entry.id);
 note('B6 N1 every path',{holdsSeen:[...seen],skillMismatch:[s1.status,s1.substitutions?.map(x=>x.selected)],namedHold:s2.status,preference:[s3.status,s3.substitutions?.map(x=>x.selected)],equipmentLoss:e.status,trunkRowsNow:trunk,missing:t.p.templates.map(x=>x.missingPatterns),restart:[re.status,re.program?holdsIn(re.program):null]});
}
// B-7 Novice density (B0-C08): NONE, 3 and 5 days; the two template sets agree on every annotated slot, and after the first block boundary.
for(const days of [[1,3,5],[0,1,2,4,6]])for(const eq of ['FULL','BANDS','MACHINES']){
 const t=timeline(lifter({experience:'NONE',equipment:EQUIPMENT[eq],days}));
 const ann=set=>Object.fromEntries((set??[]).flatMap(x=>x.rows.filter(r=>r.planeAlternation).map(r=>[x.type+':'+r.slot,r.planeAlternation.built])));
 const a=ann(t.p.templates),b=ann(t.p.noviceTemplates),clash=Object.keys(a).filter(k=>k in b&&a[k]!==b[k]);
 const start=slots(t.p),end=t.p.blocks.find(x=>x.family==='DEVELOPMENT').endWeekExclusive;t.weeks(0,end+1);
 note(`B7 novice ${eq} ${days.length}d`,{regular:a,novice:b,clash,slotsKept:hash(slots(t.p))===hash(start),inForce:slotsInForce(t.p)});
}
// B-8 Plans of 4, 8, 12, 16 weeks with 1 to 6 strength days, every equipment profile: status, holds, asking slots per pattern.
{
 const bad=[];let n=0;
 for(const weeks of [4,8,12,16])for(const days of [[3],[1,4],[1,3,5],[0,2,4,6],[0,1,2,4,6],[0,1,2,3,4,6]])for(const eq of Object.keys(EQUIPMENT))for(const experience of ['NONE','INTERMEDIATE']){
  if((n++)%2&&weeks!==16)continue;
  const r=S.generateProgram(lifter({experience,equipment:EQUIPMENT[eq],days,weeks}),DEV),o=S.generateProgram(lifter({experience,equipment:EQUIPMENT[eq],days,weeks}),OFF);
  if(r.status!==o.status){bad.push({weeks,days:days.length,eq,experience,dev:r.status,off:o.status});continue;}
  if(!r.program)continue;
  const asks=['PUSH','PULL'].map(p=>[...(r.program.templates??[])].flatMap(x=>x.rows.filter(q=>q.planeAlternation&&q.slotPattern===p)).length);
  if(holdsIn(r.program).length||asks.some(k=>k>Math.max(1,0)))bad.push({weeks,days:days.length,eq,experience,holds:holdsIn(r.program),asks});
 }
 note('B8 lengths x days x equipment',{plans:n,anomalies:bad});
}
// B-9 A plan built under the rules whose rows lost their annotation (a client that drops unknown fields): integrity, and what a rebuild does.
{
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL}));t.weeks(0,1);
 const strip=p=>JSON.parse(JSON.stringify(p,(k,v)=>k==='planeAlternation'?undefined:v));
 const q=strip(t.p),r=S.evaluateProgram(q,t.review(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:['DUMBBELLS','BENCH','MACHINES','BANDS']}},'06:00'),DEV);
 const kept=S.evaluateProgram(t.p,t.review(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:['DUMBBELLS','BENCH','MACHINES','BANDS']}},'06:00'),DEV);
 note('B9 plan without its annotations',{status:r.status,reason:r.status==='HOLD'?r.reason:undefined,mains:r.proposal?mainsOf(r.proposal):null,withAnnotations:kept.proposal?mainsOf(kept.proposal):kept.status});
}
// B-10 Determinism: the same review twice, and the same plan generated twice in one process and after other plans.
{
 const i=hybrid({equipment:EQUIPMENT.MACH_DB});const a=S.generateProgram(i,DEV);S.generateProgram(lifter({}),DEV);const b=S.generateProgram(i,DEV);
 const t=timeline(i);t.weeks(0,1);const rv=t.review(2,6,'WEEKLY_REVIEW');
 note('B10 determinism',{generate:hash(a)===hash(b),review:hash(S.evaluateProgram(t.p,rv,DEV))===hash(S.evaluateProgram(t.p,rv,DEV))});
}
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
