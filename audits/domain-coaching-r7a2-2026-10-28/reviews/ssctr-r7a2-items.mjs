// SSCTR R7A2-SSCTR-r1 targeted probe (own instrument, written for R7-A.2), one section per dossier item that the grids do not cover.
// Read-only runtime use of the live tree, synthetic data, DEV_TEST_ONLY authority. Prints only. Usage: node ssctr-r7a2-items.mjs > out.json
//  SD  a re-establishment executed before a break (strength missed weeks 2-6, re-established Monday of week 7, break from Wednesday):
//      moderate (14 d) and short (7 d), target met or missed; rows of the next weeks, the return's start state, E/O/B.
//  SE  two separate short breaks (run Tue quality, Thu easy, Sun long): the first one's slot run before the second; the second reported while
//      the first one's slot is still ahead; and a newer report of the first. The eased slots and the quality runs of the next weeks.
//  SF  a short break during the return steps: before the weekly review of the re-entry week (the review decided after the break began),
//      and after it. The strength rows and run mode of the next weeks; no row at the dose before the first break.
//  SH  the first loaded week's sessions logged only after a moderate return, then the same break reported again: E/B and ceilings.
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const POL=JSON.parse(fs.readFileSync(path.join(CC,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,'')).operational,P=POL.return;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=({id,cls='KNOWN',goal='STRENGTH',schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`it-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{missed=false}={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:missed?Math.max(1,e.reps-2):e.reps,rir:e.rir}))}));return {eventId:`it-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const live=s=>s.prescription&&s.status!=='SKIPPED';
const step=(t,review)=>{const r=R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${review.event.kind}@w${review.weekIndex}:${r.status}/${r.action}`);return r;};
const weekly=(t,w,keep=()=>true,o={})=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,o))}));
const report=(t,w,day,hour,keep,o={})=>step(t,at(t.p,w,day,hour,{kind:'PARTIAL_SESSION',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,o))}));
const brk=(start,end)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel'}});
const gen=ia=>{const g=R.generateProgram(intake(ia),opts);if(!g.program)throw Error(g.status+' '+g.reason);return {p:g.program,ledger:[],log:[]};};
const copy=t=>({p:t.p,ledger:t.ledger,log:[...t.log]});
const srow=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).map(s=>`d${s.day} `+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.exposure?.kind}${e.load.mode==='KNOWN'?' '+e.load.value:''}`).join(', '));
const rrow=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN').map(s=>`d${s.day} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''} ${s.prescription?`${s.prescription.family}:${s.prescription.durationMinutes}`:'-'}${s.easedFor?' easedFor='+s.easedFor:''}${/short break runs easy/.test(s.explanation??'')?' [EASY-SLOT]':''}`);
const lastReturn=P=>P.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
const pick=(ex,ks=['mode','sets','reps','load','ceiling','setCeiling','regainCap','priorSets','returnStep','lastExecutedSets','lastPerformed','unlogged','source','blocksDone'])=>ex?Object.fromEntries(ks.filter(k=>ex[k]!==undefined).map(k=>[k,ex[k]])):null;
const out={probe:'R7A2-SSCTR-r1-ITEMS',runtime:'live tree (check the digest)'};
const sec=(k,f)=>{try{out[k]=f();}catch(e){out[k]={error:String(e?.stack??e).slice(0,600)};}};

// ---------- SD: a re-establishment executed before a break ----------
sec('SD',()=>{
 const res={};
 for(const [len,label] of [[14,'MODERATE'],[7,'SHORT']])for(const missed of [false,true]){
  const t=gen({id:`it-sd-${len}-${missed}`});
  for(let w=0;w<2;w++)weekly(t,w);
  for(let w=2;w<7;w++)weekly(t,w,s=>s.sport!=='STRENGTH');
  const w=7,d0=t.p.weeks[w].startDate,before=t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.day===0&&live(s));
  const preRows=srow(t.p,w),bStart=addDays(d0,2),bEnd=addDays(bStart,len-1),back=addDays(bEnd,1);
  report(t,w,1,'20:00:00',s=>s.sport==='STRENGTH'&&s.day===0,{missed});
  weekly(t,w,s=>s.date<bStart&&s.sport!=='STRENGTH');
  const rw=Math.floor((Date.parse(back)-Date.parse(t.p.startDate))/(7*864e5));for(let x=w+1;x<rw;x++)weekly(t,x,()=>false);
  const r=step(t,at(t.p,rw,(Date.parse(back)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00:00',brk(bStart,bEnd))),D=lastReturn(t.p);
  const ids=before.flatMap(s=>s.prescription.exercises.map(e=>e.id)),reRows=Object.fromEntries(before.flatMap(s=>s.prescription.exercises.map(e=>[e.id,{sets:e.sets,kind:e.exposure?.kind,base:e.exposure?.baseSets,phased:e.exposure?.phasedSets}])));
  const traj={},largest={},v={E:0,B:0,O:0,firstKinds:{}};const ceiling=Object.fromEntries(ids.map(i=>[i,D?.interruption?.entry?.strength?.exercises?.[i]?.setCeiling??null]));
  for(let x=rw;x<14;x++){
   for(const s of t.p.weeks[x].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=back))for(const e of s.prescription.exercises){if(!ids.includes(e.id))continue;
    (traj[e.id]??=[]).push(`w${x}d${s.day}:${e.sets}x${e.reps}@${e.rir}/${e.exposure?.kind}`);
    if(!(e.id in v.firstKinds)){v.firstKinds[e.id]=`${e.exposure?.kind} ${e.sets}@${e.rir}`;if(label!=='SHORT'&&(e.exposure?.kind!=='RETURN_ENTRY'||e.sets>P.strengthEntrySets||e.rir<P.strengthEntryMinimumRir))v.E++;}
    if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)v.B++;}
   weekly(t,x,s=>s.date>=back);
   for(const s of t.p.weeks[x].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=back))for(const e of s.prescription.exercises)if(ids.includes(e.id))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
  }
  res[`${label}-${len}d-${missed?'missed':'met'}`]={action:r.action,class:D?.interruption?.class,preRowsWeek7:preRows,reestablishment:reRows,entry:Object.fromEntries(ids.map(i=>[i,pick(D?.interruption?.entry?.strength?.exercises?.[i])])),ceiling,checks:v,trajectory:traj};
 }
 return res;
});

// ---------- SE: two separate short breaks ----------
sec('SE',()=>{
 const sched={runDays:[1,3,6],strengthDays:[2,5],longRunDay:6};const res={};
 const base=()=>{const t=gen({id:'it-se',schedule:sched});for(let w=0;w<4;w++)weekly(t,w);return t;};
 const view=(t,ws)=>Object.fromEntries(ws.map(w=>[`w${w}`,rrow(t.p,w)]));
 // A: Fri-Sun of week 4, reported Monday 06:00 of week 5.
 const A=t=>{const d=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d,-3),addDays(d,-1))));return lastReturn(t.p).eventId;};
 { const t=base();weekly(t,4,s=>s.day<4);const a=A(t);report(t,5,1,'20:00:00',s=>s.day<=1);
   const d=t.p.weeks[5].startDate;step(t,at(t.p,5,5,'06:00:00',brk(addDays(d,2),addDays(d,4))));const b=lastReturn(t.p);
   const v1=view(t,[5,6,7]);weekly(t,5,s=>s.day>=5);res.firstSlotRunThenSecond={A:a,B:b.eventId,relation:b.interruption.relation,afterReturn:v1,afterReview:view(t,[5,6,7])}; }
 { const t=base();weekly(t,4,s=>s.day<4);const a=A(t);
   const d=t.p.weeks[5].startDate;step(t,at(t.p,5,1,'05:00:00',brk(d,d)));const b=lastReturn(t.p);
   const v1=view(t,[5,6,7]);weekly(t,5,s=>s.day>=1);res.secondWhileFirstAhead={A:a,B:b.eventId,relation:b.interruption.relation,afterReturn:v1,afterReview:view(t,[5,6,7])}; }
 { const t=base();weekly(t,4,s=>s.day<4);const a=A(t);
   const d=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'07:00:00',brk(addDays(d,-4),addDays(d,-1))));const b=lastReturn(t.p);
   res.sameBreakCorrection={A:a,B:b.eventId,relation:b.interruption.relation,supersedes:b.interruption.supersedes,afterReturn:view(t,[5,6])}; }
 { const t=base();weekly(t,4,s=>s.day<4);res.oneBreakControl={A:A(t),afterReturn:view(t,[5,6])}; }
 return res;
});

// ---------- SF: a short break during the return steps ----------
sec('SF',()=>{
 const res={};
 const first=()=>{const t=gen({id:'it-sf'});for(let w=0;w<3;w++)weekly(t,w);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));return {t,d0};};
 const preDose=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.load.mode==='KNOWN'&&e.sets>=3).map(e=>`${e.id}:${e.sets}`);
 { const {t,d0}=first();const entryRows=srow(t.p,5);
   // Entry sessions before Thursday executed; break Thu-Sun; the weekly review Sunday 21:00 (inside the break) reports what was done; return Monday.
   weekly(t,5,s=>s.day<3);const st6=t.p.stateTrace[6].strength.exercises;
   step(t,at(t.p,6,0,'06:00:00',brk(addDays(d0,3),addDays(d0,6))));const B=lastReturn(t.p);
   res.breakBeforeReview={week5:entryRows,reviewedState6:Object.fromEntries(Object.entries(st6).map(([k,v])=>[k,pick(v,['returnStep','setCeiling','sets'])])),relation:B.interruption.relation,stateAt:B.interruption.stateAt,entry:Object.fromEntries(Object.entries(B.interruption.entry.strength.exercises).map(([k,v])=>[k,pick(v,['returnStep','setCeiling','sets','lastPerformed'])])),week6:srow(t.p,6),run6:rrow(t.p,6),runMode7:t.p.stateTrace[7]?.run?.mode,preBreakDose:[preDose(t.p,6),preDose(t.p,7)]};
   weekly(t,6);res.breakBeforeReview.week7=srow(t.p,7); }
 { const {t,d0}=first();
   weekly(t,5);const d1=t.p.weeks[6].startDate;step(t,at(t.p,6,3,'06:00:00',brk(d1,addDays(d1,2))));const B=lastReturn(t.p);
   res.breakAfterReview={relation:B.interruption.relation,stateAt:B.interruption.stateAt,entry:Object.fromEntries(Object.entries(B.interruption.entry.strength.exercises).map(([k,v])=>[k,pick(v,['returnStep','setCeiling','sets'])])),week6:srow(t.p,6),run6:rrow(t.p,6),preBreakDose:[preDose(t.p,6),preDose(t.p,7)]};
   weekly(t,6,s=>s.day>=3);res.breakAfterReview.week7=srow(t.p,7); }
 return res;
});

// ---------- SH: executions logged only after the return ----------
sec('SH',()=>{
 const res={};
 for(const cls of ['NONE','FAMILIAR']){
  const t=gen({id:`it-sh-${cls}`,cls,schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}});
  const rows=w=>t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
  const F=t.p.weeks.findIndex(x=>rows(x.index).some(({e})=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE'));for(let w=0;w<F;w++)weekly(t,w);
  const bStart=addDays(t.p.weeks[F].startDate,5),bEnd=addDays(bStart,13),back=addDays(bEnd,1);
  const before=rows(F).filter(({date,e})=>date<bStart&&e.exposure?.kind!=='PRACTICE'),ids=[...new Set(before.map(({e})=>e.id))],exec=Object.fromEntries(before.map(({e})=>[e.id,e.sets]));
  weekly(t,F,()=>false);
  const rw=Math.floor((Date.parse(back)-Date.parse(t.p.startDate))/(7*864e5));for(let w=F+1;w<rw;w++)weekly(t,w,()=>false);
  const day=(Date.parse(back)-Date.parse(t.p.weeks[rw].startDate))/864e5;
  const T1=copy(t);step(T1,at(T1.p,rw,day,'06:00:00',brk(bStart,bEnd)));const R1=lastReturn(T1.p);
  // The pre-break sessions are logged after the return; then the same break is reported again.
  const T2=copy(T1);step(T2,at(T2.p,rw,day,'07:00:00',{kind:'PARTIAL_SESSION',observations:t.p.weeks[F].sessions.filter(s=>live(s)&&s.date<bStart).map(s=>obs(t.p,s))}));
  step(T2,at(T2.p,rw,day,'08:00:00',brk(bStart,bEnd)));const R2=lastReturn(T2.p);
  const run=(T)=>{const seen={},largest={},v={E:0,B:0,O:0,first:{}};for(let w=rw;w<12;w++){for(const s of T.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=back))for(const e of s.prescription.exercises){if(!ids.includes(e.id))continue;if(!seen[e.id]){seen[e.id]=1;v.first[e.id]=`${e.exposure?.kind} ${e.sets}@${e.rir}`;if(e.exposure?.kind!=='RETURN_ENTRY'||e.sets>1||e.rir<4)v.E++;}if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)v.B++;if(w<11&&e.sets>exec[e.id])v.O++;}
   weekly(T,w,s=>s.date>=back);for(const s of T.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=back))for(const e of s.prescription.exercises)if(ids.includes(e.id))largest[e.id]=Math.max(largest[e.id]??0,e.sets);}return v;};
  res[cls]={executedBeforeBreak:exec,unknownAtReturn:{entry:Object.fromEntries(ids.map(i=>[i,pick(R1.interruption.entry.strength.exercises[i],['returnStep','setCeiling','sets'])])),checks:run(T1)},
   reportedAgain:{relation:R2.interruption.relation,entry:Object.fromEntries(ids.map(i=>[i,pick(R2.interruption.entry.strength.exercises[i],['returnStep','setCeiling','sets'])])),checks:run(T2)}};
 }
 return res;
});
console.log(JSON.stringify(out,null,1));
