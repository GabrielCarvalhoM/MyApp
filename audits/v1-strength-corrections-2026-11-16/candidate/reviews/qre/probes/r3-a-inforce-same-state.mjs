// QRE V1STR N4 recheck R3, probe A (independent judge; read-only, writes nothing but its own JSON when given a path).
// Claim under test (D-18): in a plan in force the plane rule only keeps. At every review of a plan built under all the rules, the answer is
// compared with the answer the engine gives to the SAME plan state and the SAME review without the plane rule (the plan's binding minus
// V1X-STRENGTH-PLANE, its hash recomputed, reviewed under HOLD+UPPER): the "same-state counterfactual" (CF). Checked at every step:
//  (a) every asking row is a slot the plan was built with asking, on the configuration it was built with (anchor key and value);
//  (b) every template slot that differs from the CF is an asking slot that kept its own anchor, or a slot of the same session (cascade);
//  (c) an asking row whose anchor does not fit takes exactly what the CF slot takes;
//  (d) where the selection equals the CF, every prescribed row of every week equals the CF;
//  (e) a MAIN row on a configuration the plan held before the step only in another role, that the CF does not have at that slot;
//  (f) an externally loaded MAIN row outside the goal's repetition range from the step on, that the CF does not have;
//  plus, for single changes, the plan built without the plane rule from scratch (NOPLANE twin, the R2 measure): role switch, new exercise,
//  out-of-range MAIN; for plans that open with movement practice, whole-plan identity with the twin (criterion 1); and the declared cost
//  (a vertical MAIN of the plan before a change of days that the plan no longer holds at all).
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-a-inforce-same-state.mjs <shard> <shards> [out.json]
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {programHash} from '../../../../../../CoachingCore/src/r6-program.mjs';
import {slotsInForce} from '../../../../../../CoachingCore/src/v1-strength.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {lifter,hybrid,timeline,hash,EQUIPMENT,DEV,only,familiar,report,live,rowsOf} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const NOPLANE=only('HOLD','UPPER'),PLANE='V1X-STRENGTH-PLANE';
const GOALS=JSON.parse(fs.readFileSync(new URL('../../../../../../CoachingCore/r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength.goalDoses;
const [shard,shards,outPath]=[Number(process.argv[2]??0),Number(process.argv[3]??1),process.argv[4]];
const DAYS={1:[3],2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]},OTHER={2:[2,5],3:[0,2,4],4:[0,1,3,5],5:[1,2,3,5,6]};
const BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar);
const EQ12=['FULL','MACH_DB','DB_BENCH','DB','KB','BANDS','BANDS_PULLUP','PULLUP','BW','MACHINES','DB_BANDS','BAR'],EQ6=['FULL','MACH_DB','DB','BANDS','BANDS_PULLUP','MACHINES'];
// Profiles: practiceStart false (asks at build) and true (never asks), and the hybrid race plan.
const PROFILES=[];
for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [who,experience,known] of [['INTERMEDIATE','INTERMEDIATE',[]],['EXPERIENCED+barbell','EXPERIENCED',BARBELL],['NOVICE+known','NOVICE',[familiar('goblet-squat')]]])for(const eq of EQ12)
 PROFILES.push({id:`${who} ${goal} ${eq}`,practice:false,goal,eq,make:days=>lifter({goal,experience,known,equipment:EQUIPMENT[eq],days})});
for(const goal of ['STRENGTH','GENERAL'])for(const experience of ['NONE','NOVICE'])for(const eq of EQ12)
 PROFILES.push({id:`${experience} ${goal} ${eq}`,practice:true,goal,eq,make:days=>lifter({goal,experience,equipment:EQUIPMENT[eq],days})});
for(const eq of EQ12)PROFILES.push({id:`hybrid RUNNING_SUPPORT ${eq}`,practice:false,goal:'RUNNING_SUPPORT',eq,make:days=>hybrid({equipment:EQUIPMENT[eq],days})});
// Sequences. Steps: ['W',w] weekly review; ['D',w,days|'OTHER:n'] change of strength days; ['E',w,equipment|'ORIG']; ['S',w,reason].
const SEQ=[];
for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)if(a!==b)SEQ.push({name:`${a}->${b}`,a,single:true,steps:[['W',0],['D',1,b],['W',1],['W',2]]});
for(const a of [2,3,4,5])SEQ.push({name:`${a}->${a} other weekdays`,a,single:true,steps:[['W',0],['D',1,'OTHER:'+a],['W',1],['W',2]]});
for(const [a,b] of [[2,3],[3,2],[2,4],[4,2],[3,4],[4,3],[2,5],[5,2]])SEQ.push({name:`${a}->${b}->${a}`,a,multi:true,steps:[['W',0],['D',1,b],['W',1],['D',2,a],['W',2],['W',3]]});
for(const [a,b,c] of [[2,3,4],[4,3,2],[2,4,3],[3,2,4]])SEQ.push({name:`${a}->${b}->${c}`,a,multi:true,steps:[['W',0],['D',1,b],['W',1],['D',2,c],['W',2],['W',3]]});
SEQ.push({name:'2: equipment to none, regain',a:2,multi:true,steps:[['W',0],['E',1,[]],['W',1],['E',2,'ORIG'],['W',2],['W',3]]});
SEQ.push({name:'2: equipment to bands, 2->3, regain',a:2,multi:true,steps:[['W',0],['E',1,['BANDS']],['W',1],['D',2,3],['W',2],['E',3,'ORIG'],['W',3],['W',4]]});
SEQ.push({name:'2->3, equipment to none, regain, 3->2',a:2,multi:true,steps:[['W',0],['D',1,3],['W',1],['E',2,[]],['W',2],['E',3,'ORIG'],['W',3],['D',4,2],['W',4],['W',5]]});
SEQ.push({name:'4: equipment to none, 4->2, regain',a:4,multi:true,steps:[['W',0],['E',1,[]],['W',1],['D',2,2],['W',2],['E',3,'ORIG'],['W',3],['W',4]]});
SEQ.push({name:'2: SKILL_MISMATCH of the anchored, 2->3, 3->2',a:2,multi:true,steps:[['W',0],['S',1,'SKILL_MISMATCH'],['W',1],['D',2,3],['W',2],['D',3,2],['W',3],['W',4]]});
SEQ.push({name:'2: preference of the anchored, 2->4',a:2,multi:true,steps:[['W',0],['S',1,'NONCLINICAL_DISCOMFORT_OR_PREFERENCE'],['W',1],['D',2,4],['W',2],['W',3]]});
SEQ.push({name:'4: SKILL_MISMATCH of the anchored, 4->2, 2->4',a:4,multi:true,steps:[['W',0],['S',1,'SKILL_MISMATCH'],['W',1],['D',2,2],['W',2],['D',3,4],['W',3],['W',4]]});
SEQ.push({name:'2: long run through the first block boundaries',a:2,multi:true,steps:[...[0,1,2,3,4,5,6,7,8,9,10].map(w=>['W',w])]});
SEQ.push({name:'2->3, long run to week 10',a:2,multi:true,steps:[['W',0],['D',1,3],...[1,2,3,4,5,6,7,8,9,10].map(w=>['W',w])]});
SEQ.push({name:'4->2, long run to week 10',a:4,multi:true,steps:[['W',0],['D',1,2],...[1,2,3,4,5,6,7,8,9,10].map(w=>['W',w])]});
const JOBS=[];
for(const p of PROFILES)for(const s of SEQ){if(s.multi&&!EQ6.includes(p.eq))continue;if(s.a===1&&!s.single)continue;JOBS.push([p,s]);}

const strip=v=>JSON.parse(JSON.stringify(v,(k,x)=>k==='planeAlternation'?undefined:x));
const cfPlan=p=>{const q=structuredClone(p);q.repertoire.strengthExtension={...q.repertoire.strengthExtension,boundaries:q.repertoire.strengthExtension.boundaries.filter(b=>b!==PLANE)};delete q.hash;q.hash=programHash(q);return q;};
const sets=p=>[...(p?.templates??[]).map(t=>({t,key:t.type})),...(p?.noviceTemplates??[]).map(t=>({t,key:t.type+'@novice'}))];
const slotMap=p=>{const m=new Map();for(const {t,key} of sets(p))for(const r of t.rows)m.set(key+':'+r.slot,{id:r.entry.id,role:r.role,plane:r.planeAlternation??null,tpl:key});return m;};
const rolesIn=p=>{const m=new Map();for(const {t} of sets(p))for(const r of t.rows)m.set(r.entry.id,(m.get(r.entry.id)??new Set()).add(r.role));return m;};
const loading=id=>configurationOf(id)?.loading,vertical=id=>/^VERTICAL_/.test(configurationOf(id)?.subpattern??'');
const outside=(p,goal,from)=>{const s=new Set(),g=GOALS[goal];if(!g)return s;const [lo,hi]=g.repRange;for(let w=from;w<p.weeks.length;w++)for(const {e} of rowsOf(p,w))if(e.role==='MAIN'&&loading(e.id)==='EXTERNAL'&&(e.reps<lo||e.reps>hi))s.add(e.id);return s;};
const tally={jobs:0,steps:0,stepsWithProposal:0,noPlan:0,statusDiffers:[],a_askNotBuilt:[],b_notKeep:[],c_askingNotOrdinary:[],d_weeksDifferSameSelection:[],e_roleSwitchVsCF:[],f_outsideVsCF:[],anchorKept:0,cascadeSlots:0,anchorNotFitting:0,
 twin:{sequences:0,roleSwitchByRule:[],newExerciseByRule:[],outsideByRule:[],practiceNotIdentical:[]},cost:{verticalLost:{},verticalLostCF:0},asksAfter:{}};
const push=(arr,x)=>{if(arr.length<60)arr.push(x);arr.n=(arr.n??0)+1;};

function run(profile,seq,opts,withCF){
 const intake=profile.make(DAYS[seq.a]),t=timeline(intake,{opts});if(!t.p)return null;
 const built0=slotsInForce(t.p),log=[];
 for(const st of seq.steps){
  const [kind,w]=st;let rev;
  if(kind==='W'){if(!t.p.weeks[w])break;rev=t.review(w,6,'WEEKLY_REVIEW',{observations:t.p.weeks[w].sessions.filter(live).map(s=>report(t.p,s,{}))});}
  else if(kind==='D')rev=t.review(w,0,'SCHEDULE_CHANGE',{changes:{strengthDays:String(st[2]).startsWith('OTHER')?OTHER[seq.a]:DAYS[st[2]]}},'06:00');
  else if(kind==='E')rev=t.review(w,0,'EQUIPMENT_CHANGE',{changes:{equipment:st[2]==='ORIG'?intake.athlete.equipment:st[2]}},'06:00');
  else if(kind==='S'){const anchors=slotsInForce(t.p),target=Object.values(anchors)[0]??[...slotMap(t.p).values()].find(x=>x.role==='MAIN'&&configurationOf(x.id)?.region==='UPPER')?.id;
   rev=t.review(w,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:target,reason:st[2],nonclinicalConfirmed:true}},'06:00');}
  const before=t.p,dev=S.evaluateProgram(before,rev,opts),cf=withCF?S.evaluateProgram(cfPlan(before),rev,NOPLANE):null;
  log.push({step:st.join(' '),before,dev,cf,w});
  t.take(dev);
 }
 return {t,built0,log};
}
const myJobs=JOBS.filter((_,i)=>i%shards===shard);
for(const [profile,seq] of myJobs){
 tally.jobs++;const label=`${profile.id} | ${seq.name}`;
 const d=run(profile,seq,DEV,true);if(!d){tally.noPlan++;continue;}
 for(const {step,before,dev,cf,w} of d.log){
  tally.steps++;
  if(dev.status!==cf.status){push(tally.statusDiffers,{label,step,dev:dev.status,cf:cf.status});continue;}
  if(!dev.proposal)continue;tally.stepsWithProposal++;
  const A=slotMap(dev.proposal),C=slotMap(cf.proposal),rb=rolesIn(before),goal=profile.goal;
  // (a)
  for(const [k,x] of A)if(x.plane){const key=k.replace('@novice','');if(!(key in d.built0)||x.plane.built!==d.built0[key])push(tally.a_askNotBuilt,{label,step,slot:k,built:x.plane.built,atBuild:d.built0[key]??null});}
  const asking=[...A].filter(([,x])=>x.plane).map(([k])=>k);tally.asksAfter[asking.length]=(tally.asksAfter[asking.length]??0)+1;
  // (b), (c)
  const kept=new Set();
  for(const [k,x] of A)if(x.plane){if(x.id===x.plane.built){if(C.get(k)?.id!==x.id){kept.add(x.tpl);tally.anchorKept++;}}else{tally.anchorNotFitting++;if(C.get(k)?.id!==x.id)push(tally.c_askingNotOrdinary,{label,step,slot:k,dev:x.id,cf:C.get(k)?.id??null,anchor:x.plane.built});}}
  let selectionSame=true;
  for(const k of new Set([...A.keys(),...C.keys()])){const x=A.get(k),y=C.get(k);if(x?.id===y?.id&&x?.role===y?.role)continue;selectionSame=false;
   if(x?.plane&&x.id===x.plane.built)continue;
   if(kept.has((x??y).tpl)){tally.cascadeSlots++;continue;}
   push(tally.b_notKeep,{label,step,slot:k,dev:x?`${x.id}/${x.role}`:null,cf:y?`${y.id}/${y.role}`:null});}
  // (d)
  if(selectionSame&&hash(strip(dev.proposal.weeks))!==hash(strip(cf.proposal.weeks)))push(tally.d_weeksDifferSameSelection,{label,step});
  // (e)
  for(const [k,x] of A){if(x.role!=='MAIN')continue;const was=rb.get(x.id);if(!was||was.has('MAIN'))continue;if(C.get(k)?.id===x.id)continue;push(tally.e_roleSwitchVsCF,{label,step,slot:k,id:x.id,heldBefore:[...was],cf:C.get(k)?.id??null});}
  // (f)
  const od=outside(dev.proposal,goal,w),oc=outside(cf.proposal,goal,w);for(const id of od)if(!oc.has(id))push(tally.f_outsideVsCF,{label,step,id});
  // declared cost: a vertical MAIN of the plan before a change of days that the plan after no longer holds at all
  if(step.startsWith('D')){const vb=[...rb].filter(([id,r])=>vertical(id)&&r.has('MAIN')).map(([id])=>id),after=rolesIn(dev.proposal),afterCF=rolesIn(cf.proposal);const lost=vb.filter(id=>!after.has(id));
   if(lost.length){const key=`${seq.name.startsWith('2->3->2')||seq.name.includes('other')?seq.name:step}`;tally.cost.verticalLost[key]=(tally.cost.verticalLost[key]??0)+1;}if(vb.some(id=>!afterCF.has(id)))tally.cost.verticalLostCF++;}
 }
 // The twin built without the plane rule (single changes): the R2 measures, and whole-plan identity for practice-start plans.
 if(seq.single||profile.practice){
  const n=run(profile,seq,NOPLANE,false);if(!n)continue;tally.twin.sequences++;
  const ch=d.log.findIndex(x=>x.step.startsWith('D')||x.step.startsWith('E')||x.step.startsWith('S'));
  if(ch>=0){
   const bd=rolesIn(d.log[ch].before),bn=rolesIn(n.log[ch].before),ad=slotMap(d.t.p),an=slotMap(n.t.p);
   for(const [k,x] of ad){if(x.role!=='MAIN')continue;const was=bd.get(x.id);if(!was||was.has('MAIN'))continue;if(an.get(k)?.id===x.id)continue;push(tally.twin.roleSwitchByRule,{label,slot:k,id:x.id,heldBefore:[...was],twin:an.get(k)?.id??null});}
   const fresh=[...rolesIn(d.t.p).keys()].filter(id=>!bd.has(id)&&!rolesIn(n.t.p).has(id));if(fresh.length)push(tally.twin.newExerciseByRule,{label,ids:fresh});
   const w=d.log[ch].w,od=outside(d.t.p,profile.goal,w),on=outside(n.t.p,profile.goal,w);for(const id of od)if(!on.has(id))push(tally.twin.outsideByRule,{label,id});
  }
  if(profile.practice){const strip2=p=>strip({templates:p.templates,novice:p.noviceTemplates??null,weeks:p.weeks});if(hash(strip2(d.t.p))!==hash(strip2(n.t.p))||Object.keys(d.built0).length)push(tally.twin.practiceNotIdentical,{label,anchorsAtBuild:d.built0});}
 }
}
const counts=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,Array.isArray(v)?(v.n??v.length):v&&typeof v==='object'&&!Array.isArray(v)?counts(v):v]));
const out={shard,shards,jobs:myJobs.length,counts:counts(tally),tally};
console.log(JSON.stringify(out.counts));
if(outPath)fs.writeFileSync(outPath,JSON.stringify(out,null,1));
