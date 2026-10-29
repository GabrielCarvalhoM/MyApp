// R7A2-QE-r1 P18 (independent engineering judge, R7A2-FREEZE-1): declared boundary 1, "the record as reported". The first loaded week's
// sessions before a 14-day break (from Saturday) are logged (a) before the return, (b) only after the return (same morning, 07:00), or
// (c) after the return and then the same break reported again (08:00). For NONE, FAMILIAR and KNOWN athletes, five weeks from the return:
// does (b) ever prescribe more than (a) (a set above, a heavier known load, or a lower RIR on the same session and exercise), and does (c)
// give (a)'s rows? Engineering reading only: the dose effect, if any, is the SSCTR's. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,obs,line,addDays,print} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT),{R,opts}=RT;
const brk=(start,end,reason='Work travel')=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const KNOWN=[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'},{id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}];
const athleteOf=cls=>({strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},knownExercises:cls==='KNOWN'?KNOWN:[]});
const out={probe:'R7A2-QE-P18',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',classes:{}};
const weekOf=(P,d)=>Math.floor((Date.parse(d)-Date.parse(P.startDate))/(7*864e5));
function run(cls,mode){
 const g=R.generateProgram({...(()=>{const x={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,athlete:{id:'qa7a2-p18-'+cls,ageEligible:true,eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-01',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],exerciseRotationPreference:'FIXED',...athleteOf(cls)},schedule:{runDays:[1,4,6],strengthDays:[0,3],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}};return x;})()},opts);
 const t={p:g.program,ledger:[]};
 const F=t.p.weeks.findIndex(x=>x.sessions.some(s=>s.sport==='STRENGTH'&&s.prescription&&s.prescription.exercises.some(e=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE')));
 for(let w=0;w<F;w++)H.weekly(t,w);
 const bStart=addDays(t.p.weeks[F].startDate,5),bEnd=addDays(bStart,13),back=addDays(bEnd,1),rw=weekOf(t.p,back),day=(Date.parse(back)-Date.parse(t.p.weeks[rw].startDate))/864e5;
 const pre=t.p.weeks[F].sessions.filter(s=>live(s)&&s.date<bStart);
 const log=[];
 if(mode==='a')log.push('F reported '+H.ev(t,at(t.p,F,6,'21:00',{kind:'WEEKLY_REVIEW',observations:pre.map(s=>obs(t.p,s))})));
 else log.push('F unreported '+H.ev(t,at(t.p,F,6,'21:00',{kind:'WEEKLY_REVIEW',observations:[]})));
 for(let w=F+1;w<rw;w++)H.weekly(t,w,()=>false);
 log.push('return '+H.ev(t,at(t.p,rw,day,'06:00',brk(bStart,bEnd))));
 if(mode!=='a')log.push('late log '+H.ev(t,at(t.p,rw,day,'07:00',{kind:'PARTIAL_SESSION',observations:pre.map(s=>obs(t.p,s))})));
 if(mode==='c')log.push('same break again '+H.ev(t,at(t.p,rw,day,'08:00',brk(bStart,bEnd,'Work travel, details'))));
 const rows={};
 for(let w=rw;w<rw+5;w++){for(const s of t.p.weeks[w].sessions.filter(x=>live(x)&&x.date>=back&&x.sport==='STRENGTH'))for(const e of s.prescription.exercises)rows[`${s.id}:${e.id}`]={sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load.mode,load:e.load.value??null,kind:e.exposure?.kind??null};H.weekly(t,w);}
 return {log,rows,lines:[rw,rw+1].map(k=>line(t.p,k))};
}
for(const cls of ['NONE','FAMILIAR','KNOWN']){
 const a=run(cls,'a'),b=run(cls,'b'),c=run(cls,'c');
 const above=[],differAC=[];
 for(const [k,x] of Object.entries(b.rows)){const y=a.rows[k];if(!y)continue;if(x.sets>y.sets||(x.mode==='KNOWN'&&y.mode==='KNOWN'&&x.load>y.load)||x.rir<y.rir)above.push(`${k} late ${x.sets}x${x.reps}@${x.rir}/${x.mode}${x.load??''} vs in-order ${y.sets}x${y.reps}@${y.rir}/${y.mode}${y.load??''}`);}
 for(const k of new Set([...Object.keys(a.rows),...Object.keys(c.rows)]))if(JSON.stringify(a.rows[k])!==JSON.stringify(c.rows[k]))differAC.push(k);
 const differAB=Object.keys({...a.rows,...b.rows}).filter(k=>JSON.stringify(a.rows[k])!==JSON.stringify(b.rows[k])).length;
 out.classes[cls]={logs:{a:a.log,b:b.log,c:c.log},rowsCompared:Object.keys(a.rows).length,lateAboveInOrder:above,rowsDifferInOrderVsLate:differAB,reReportDiffersFromInOrder:differAC,sample:{a:a.lines,b:b.lines}};
}
print(out);
