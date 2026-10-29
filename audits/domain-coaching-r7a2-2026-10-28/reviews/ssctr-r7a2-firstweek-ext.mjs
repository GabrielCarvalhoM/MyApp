// SSCTR R7A2-SSCTR-r1 first-loaded-week extension (own instrument, written for R7-A.2). Read-only runtime use of the live tree, synthetic data,
// DEV_TEST_ONLY authority. Prints only. Usage: node ssctr-r7a2-firstweek-ext.mjs > out.json   (env SHARD=i/n)
// Same intake factors as ssctr-r7a1-recheck-firstweek.mjs (3 classes x 3 goals x 1-2 strength days x 20-40 min x break from Tue/Fri/Sat of the
// first week with loaded strength), with these break lengths and variants:
//  MODERATE/LONG (14, 21, 28, 29, 42 days; and 21 days with every pre-break exposure missing its repetition target by two, "MISSED"):
//   E, O, B as in the first-week grid (O against the last executed whole count; for MISSED against the declared fallback: known count, else none);
//   CEQ  the ceiling the return set (interruption.entry) differs from the last executed whole count before the break (largest of the week, R20);
//   NOENTRY an executed pre-break exercise not in the return's start state at the entry step;
//   REPS the entry's repetition target differs from the one the exercise was executed at (S-G);
//   BLK  a block-boundary set earned (blocksDone rises) by the end of the block of re-entry (the block in progress earns no set).
//  SHORT (4, 7, 10 days): for each loaded pre-break exercise,
//   K1   its first exposure after the return: kind, sets, reps in reserve and repetitions (tallied);
//   S1   that exposure above max(last executed count before the break, effortGuidedLoad.sets), or below effortGuidedLoad.minimumRir when it
//        is an effort-guided row, or at other repetitions than it was executed at;
//   M    "resume": in a calendar week after the return, its largest count before the phase reduction (exposure.baseSets) above the same
//        exercise's in the same week of a twin timeline with no break (every session executed and reviewed); examples kept.
//   Bodyweight pre-break exercises are tallied separately (first exposure after the return vs. before).
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const POL=JSON.parse(fs.readFileSync(path.join(CC,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,'')).operational,P=POL.return,EG=POL.establishment.effortGuidedLoad;
const [shard,shards]=(process.env.SHARD??'0/1').split('/').map(Number);
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,cls,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:cls==='NONE'?0:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:days.includes(4)?[1,5,6]:[1,4,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`fx-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s,missed=false){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:missed?Math.max(1,e.reps-2):e.reps,rir:e.rir}))}));return {eventId:`fx-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,missed=()=>false)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,missed(s)))}));
const practice=e=>e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE';
const loaded=e=>e.load.mode!=='BODYWEIGHT'&&!practice(e);
const rowsOf=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,day:s.day,e})));
const whole=e=>!Number.isInteger(e.exposure?.phasedSets)||e.exposure.phasedSets===e.exposure.baseSets;
const out={probe:'R7A2-SSCTR-r1-FIRSTWEEK-EXT',runtime:'live tree (check the digest)',shard:`${shard}/${shards}`,policy:{shortMaxDays:P.shortMaxDays,moderateMaxDays:P.moderateMaxDays,strengthEntrySets:P.strengthEntrySets,strengthEntryMinimumRir:P.strengthEntryMinimumRir,effortGuidedLoad:EG},
 cases:0,skipped:[],tally:{},short:{kinds:{},bodyweight:{}},examples:{}};
const T=(fam,cls,k,n=1)=>{const c=((out.tally[fam]??={})[cls]??={cases:0,exercises:0});c[k]=(c[k]??0)+n;};
const ex=(k,v)=>{const l=(out.examples[k]??=[]);if(l.length<8)l.push(v);};
// The no-break twin: every week executed and reviewed; per exercise and week the largest count before the phase reduction.
const twinCache=new Map();
function twin(cfg){const key=JSON.stringify(cfg);if(twinCache.has(key))return twinCache.get(key);
 const g=R.generateProgram(intake('fx-twin-'+key,cfg),opts),t={p:g.program,ledger:[]},seq={};
 for(let w=0;w<13;w++){for(const {e} of rowsOf(t.p,w))if(!practice(e)){const m=(seq[e.id]??={});m[w]=Math.max(m[w]??0,e.exposure?.baseSets??e.sets);}weekly(t,w);}
 twinCache.set(key,seq);return seq;}
const LENGTHS=[[14,'MODERATE'],[21,'MODERATE'],[28,'MODERATE'],[29,'LONG'],[42,'LONG'],[21,'MISSED'],[4,'SHORT'],[7,'SHORT'],[10,'SHORT']];
let idx=0;
for(const cls of ['NONE','FAMILIAR','KNOWN'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const days of [[0],[0,3]])for(const minutes of [20,30,40])for(const startDay of [1,4,5])for(const [length,fam] of LENGTHS){
 if(idx++%shards!==shard)continue;
 const cfg={goal,cls,days,minutes},id=`fx-${cls}-${goal}-${days.length}-${minutes}-b${startDay}-${length}-${fam}`;
 const g=R.generateProgram(intake(id,cfg),opts);if(!g.program){out.skipped.push(id+':'+g.status);continue;}
 const t={p:g.program,ledger:[]};
 try{
  const F=t.p.weeks.findIndex(x=>rowsOf(t.p,x.index).some(r=>loaded(r.e)));if(F<0||F>3){out.skipped.push(id+':no loaded week');continue;}
  for(let w=0;w<F;w++)weekly(t,w);
  const bStart=addDays(t.p.weeks[F].startDate,startDay),bEnd=addDays(bStart,length-1),report=addDays(bEnd,1);
  const beforeAll=rowsOf(t.p,F).filter(r=>r.date<bStart&&!practice(r.e)),before=beforeAll.filter(r=>loaded(r.e)),bw=beforeAll.filter(r=>!loaded(r.e));
  if(!before.length){out.skipped.push(id+':nothing before the break');continue;}
  const known0=t.p.stateTrace[F].strength.exercises,missed=fam==='MISSED';
  // The last executed whole count (largest of the week, R20) and the executed repetitions; MISSED: no executed count, the declared fallback.
  const ceil={},reps={},pre={};for(const {e} of before){reps[e.id]=e.reps;(pre[e.id]??=[]).push(e.exposure?.baseSets??e.sets);if(whole(e))ceil[e.id]=Math.max(ceil[e.id]??0,e.sets);}
  if(missed)for(const id of Object.keys(ceil)){const k=known0[id];if(Number.isInteger(k?.lastExecutedSets))ceil[id]=k.lastExecutedSets;else if(Number.isInteger(k?.sets))ceil[id]=k.sets;else delete ceil[id];}
  weekly(t,F,s=>s.date<bStart,()=>missed);
  const rw=Math.floor((Date.parse(report)-Date.parse(t.p.startDate))/(7*864e5));
  for(let w=F+1;w<rw;w++)weekly(t,w,()=>false);
  const r=ev(t,at(t.p,rw,(Date.parse(report)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:length,startDate:bStart,endDate:bEnd,reasonCategory:'TRAVEL',reason:'Work travel'}}));
  if(!/REESTABLISH/.test(r.action??'')){out.skipped.push(id+':'+r.status+'/'+r.action);continue;}
  const D=t.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1),entry=D.interruption?.entry?.strength?.exercises??{},cl=D.interruption?.class;
  out.cases++;T(fam,cls,'cases');const ids=[...new Set(before.map(b=>b.e.id))];T(fam,cls,'exercises',ids.length);
  if(fam==='SHORT'?cl!=='SHORT':cl!==(fam==='MISSED'?'MODERATE':fam)){T(fam,cls,'CLASS');ex('CLASS',{id,cl});}
  const blocks=t.p.blocks??[],bi=blocks.findIndex(b=>rw>=b.startWeek&&rw<b.endWeekExclusive),limitWeek=blocks[bi+1]?.endWeekExclusive??16,reentryBlockEnd=blocks[bi]?.endWeekExclusive??16;
  if(fam!=='SHORT'){
   for(const x of ids){const s=entry[x];
    if(!s||s.returnStep!==0){T(fam,cls,'NOENTRY');ex('NOENTRY',{id,exercise:x,state:s??null});continue;}
    if((s.setCeiling??null)!==(ceil[x]??null)){T(fam,cls,'CEQ');ex('CEQ',{id,exercise:x,setCeiling:s.setCeiling??null,expected:ceil[x]??null,pre:pre[x]});}
    if(s.reps!==reps[x]){T(fam,cls,'REPS');ex('REPS',{id,exercise:x,entryReps:s.reps,executedReps:reps[x]});}
   }
   const seen=new Set(),largest={},b0={};for(const x of ids)b0[x]=entry[x]?.blocksDone??0;
   for(let w=rw;w<13;w++){
    for(const {date,e} of rowsOf(t.p,w)){
     if(!ids.includes(e.id)||date<report)continue;
     if(!seen.has(e.id)){seen.add(e.id);if(e.exposure?.kind!=='RETURN_ENTRY'||e.sets>P.strengthEntrySets||e.rir<P.strengthEntryMinimumRir){T(fam,cls,'E');ex('E',{id,week:w,exercise:e.id,kind:e.exposure?.kind,sets:e.sets,rir:e.rir});}
      if(e.reps!==reps[e.id]){T(fam,cls,'REPS_ROW');ex('REPS_ROW',{id,exercise:e.id,rowReps:e.reps,executedReps:reps[e.id]});}}
     const c=ceil[e.id];
     if(w<limitWeek&&Number.isInteger(c)&&e.sets>c){T(fam,cls,'O');ex('O',{id,week:w,exercise:e.id,sets:e.sets,ceiling:c,kind:e.exposure?.kind,limitWeek});}
     if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1){T(fam,cls,'B');ex('B',{id,week:w,exercise:e.id,sets:e.sets,largest:largest[e.id]});}
    }
    weekly(t,w,s=>s.date>=report);
    for(const {date,e} of rowsOf(t.p,w))if(date>=report&&ids.includes(e.id))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
    if(w+1===reentryBlockEnd)for(const x of ids){const s=t.p.stateTrace[w+1]?.strength?.exercises?.[x];if((s?.blocksDone??0)>b0[x]){T(fam,cls,'BLK');ex('BLK',{id,exercise:x,blocksDone:s.blocksDone,before:b0[x]});}}
   }
   // The highest count reached before limitWeek, for the met/missed comparison (S-C).
   if(fam==='MISSED'||length===21){const hi={};for(let w=rw;w<Math.min(limitWeek,13);w++)for(const {date,e} of rowsOf(t.p,w))if(ids.includes(e.id)&&date>=report)hi[e.id]=Math.max(hi[e.id]??0,e.sets);
    (out.maxBeforeLimit??={})[id.replace(/-(21-(MODERATE|MISSED))$/,'')]={...(out.maxBeforeLimit?.[id.replace(/-(21-(MODERATE|MISSED))$/,'')]??{}),[fam]:hi};}
  }else{
   const tw=twin(cfg),seq={};
   const first={};
   for(const {e} of bw){const s=entry[e.id];T(fam,cls,'bwExercises');if(!s)T(fam,cls,'bwNotInState');}
   const bwIds=[...new Set(bw.map(b=>b.e.id))],bwFirst={};
   for(let w=rw;w<13;w++){
    for(const {date,e} of rowsOf(t.p,w)){
     if(date<report||practice(e))continue;
     if(bwIds.includes(e.id)&&!bwFirst[e.id]){bwFirst[e.id]=1;const pb=bw.filter(b=>b.e.id===e.id).at(-1).e;const k=`${cls}:${pb.sets}->${e.sets} ${e.exposure?.kind}`;out.short.bodyweight[k]=(out.short.bodyweight[k]??0)+1;}
     if(!ids.includes(e.id))continue;
     if(!first[e.id]){first[e.id]=1;const k=`${cls}:${e.exposure?.kind}`;out.short.kinds[k]=(out.short.kinds[k]??0)+1;
      const lastPre=before.filter(b=>b.e.id===e.id).at(-1).e,lim=Math.max(lastPre.sets,EG.sets),effort=['UNLOGGED','FIRST_ESTABLISH','REESTABLISH'].includes(e.exposure?.kind);
      if(e.sets>lim||(effort&&e.rir<EG.minimumRir)||e.reps!==lastPre.reps){T(fam,cls,'S1');ex('S1',{id,exercise:e.id,kind:e.exposure?.kind,sets:e.sets,rir:e.rir,reps:e.reps,pre:`${lastPre.sets}x${lastPre.reps}@${lastPre.rir} ${lastPre.exposure?.kind}`});}}
     const m=(seq[e.id]??={});m[w]=Math.max(m[w]??0,e.exposure?.baseSets??e.sets);
    }
    weekly(t,w,s=>s.date>=report);
   }
   for(const x of ids){const a=seq[x]??{},b=tw[x]??{};for(const w of Object.keys(a).map(Number).sort((p,q)=>p-q))if(Number.isInteger(b[w])&&a[w]>b[w]){T(fam,cls,'M');ex('M',{id,exercise:x,week:w,short:a,noBreak:b});break;}}
  }
 }catch(err){out.skipped.push(id+':'+String(err?.stack??err).slice(0,300));}
}
console.log(JSON.stringify(out,null,1));
