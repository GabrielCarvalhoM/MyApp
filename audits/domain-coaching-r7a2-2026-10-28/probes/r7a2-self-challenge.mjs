// DOMAIN_COACHING_R7-A.2 author self-challenge (Founder request §18): equivalence classes of two and three breaks, corrections, late reports,
// first exposures, the week boundary, a break starting on a session's day, observation clocks, unreported sessions, changes between two
// breaks, a re-establishment before a break and short breaks in the first loaded week. Each case states its oracle; the probe prints the
// violations. RT=freezeA2 runs the byte-exact R7A1-FREEZE-A2 copy (../freezeA2-source), otherwise the live tree. Synthetic data, DEV_TEST_ONLY
// authority, read-only: prints only. Usage: node r7a2-self-challenge.mjs > out.json
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,F2=process.env.RT==='freezeA2',CC=F2?path.resolve(here,'../freezeA2-source/CoachingCore'):path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,c='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:c},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{cls='KNOWN',equipment=['DUMBBELLS','BENCH','BARBELL','RACK'],schedule={},tz=0}={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,...(tz?{timezoneOffsetMinutes:tz}:{}),
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},equipment,knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
const tzOf=p=>p.timezoneOffsetMinutes??0,localAt=(d,hm,tz)=>new Date(Date.parse(`${d}T${hm}:00Z`)-tz*60000).toISOString();
const at=(p,w,day,hm,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:localAt(d,hm,tzOf(p)),weekIndex:w,event:{id:`sc-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,day=s.date){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`sc-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:localAt(day,s.turn==='PM'?'19:00':'08:00',tzOf(p)),actual,response:{...OK}};}
const live=s=>s.prescription&&s.status!=='SKIPPED';
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const reportOn=(t,w,day,hm,keep)=>ev(t,at(t.p,w,day,hm,{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const brk=(start,end,reason='Work travel')=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason}});
const begin=(id,o={},weeks=3)=>{const g=R.generateProgram(intake(id,o),opts);if(!g.program)throw Error(id+': '+g.status);const t={p:g.program,ledger:[],log:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const rowsFrom=(P,w,from)=>P.weeks[w]?.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=from).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,id:e.id,sets:e.sets,rir:e.rir,mode:e.load.mode,value:e.load.value??null,kind:e.exposure?.kind??null})))??[];
const lastR=P=>P.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
const out={probe:'R7A2-SELF-CHALLENGE-1',runtime:F2?'R7A1-FREEZE-A2':'live tree (check the digest)',cases:{},violations:[]};
const flag=(c,what)=>out.violations.push(`${c}: ${what}`);
// Oracle I3: after a separate break that follows a re-entry, no strength row from its report over two weeks is above the largest count, or
// at a known load above the largest load, executed since the first return, plus the one set a return step may add (strengthReturnSets).
function sinceFirst(t,fromDate,toDate){const x={};for(const w of t.p.weeks)for(const s of w.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=fromDate&&s.date<toDate&&t.ledger.some(o=>o.sessionId===s.id)))for(const e of s.prescription.exercises){const y=x[e.id]??={sets:0,load:0};y.sets=Math.max(y.sets,e.sets);y.load=Math.max(y.load,e.load.value??0);}return x;}
function oracleI3(c,t,firstReport,breakStart,report,rw){
 const ex=sinceFirst(t,firstReport,breakStart),bad=[];
 for(const w of [rw,rw+1])for(const r of rowsFrom(t.p,w,report)){const x=ex[r.id];if(!x)continue;if(r.sets>Math.max(x.sets,1)+1||r.mode==='KNOWN'&&r.value>x.load&&x.load>0)bad.push(`w${w} ${r.id} ${r.sets}@${r.rir}/${r.mode}${r.value??''} vs ${x.sets}/${x.load}`);}
 if(bad.length)flag(c,'I3 '+bad.slice(0,3).join('; '));return bad.length;
}
const firstReturn=(t,d0,hm='06:00')=>ev(t,at(t.p,5,0,hm,brk(addDays(d0,-16),addDays(d0,-1))));
// C1/C2: two breaks, the second short or moderate, starting the same week or the next, reported the next morning or a few days later.
for(const [b2days,startDay,len] of [[2,2,2],[2,3,4],[8,4,5],[9,4,14],[6,6,3]]){
 const c=`C1-2 second break d${startDay} ${len}d`,t=begin('sc-c12');weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;firstReturn(t,d0);
 const s=addDays(d0,startDay),e=addDays(s,len-1),rep=addDays(e,1),rw=Math.floor((Date.parse(rep)-Date.parse(t.p.startDate))/(7*864e5));
 reportOn(t,5,Math.min(startDay,6),'05:00',x=>x.date<s);for(let w=5;w<rw;w++)weekly(t,w,x=>x.date<s);
 const r=ev(t,at(t.p,rw,(Date.parse(rep)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00',brk(s,e)));
 out.cases[c]={second:r.action,relation:lastR(t.p).interruption?.relation??null,log:t.log.slice(-3)};
 if(!F2&&lastR(t.p).interruption.relation!=='NEW')flag(c,'relation '+lastR(t.p).interruption.relation);
 oracleI3(c,t,d0,s,rep,rw);
}
// C3/C4: three reports — a separate break, its correction, a new break after the correction's re-entry; and a correction of the first break
// before a separate one.
{
 const c='C3 A, B new, C corrects B, D new',t=begin('sc-c3');weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;firstReturn(t,d0);
 reportOn(t,5,2,'05:00',x=>x.day<2);ev(t,at(t.p,5,4,'06:00',brk(addDays(d0,2),addDays(d0,3))));ev(t,at(t.p,5,4,'09:00',brk(addDays(d0,1),addDays(d0,3),'Work travel, from Tuesday')));
 if(!F2&&lastR(t.p).interruption.relation!=='SAME_BREAK')flag(c,'C not SAME_BREAK');
 oracleI3(c+' (C)',t,d0,addDays(d0,1),addDays(d0,4),5);
 weekly(t,5);const d6=t.p.weeks[6].startDate;reportOn(t,6,3,'05:00',x=>x.day<3);ev(t,at(t.p,6,5,'06:00',brk(addDays(d6,3),addDays(d6,4))));
 if(!F2&&lastR(t.p).interruption.relation!=='NEW')flag(c,'D not NEW');oracleI3(c+' (D)',t,d0,addDays(d6,3),addDays(d6,5),6);
 out.cases[c]={log:t.log.slice(-6)};
}
{
 const c='C4 A, A corrected, B new',t=begin('sc-c4');weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;firstReturn(t,d0);
 ev(t,at(t.p,5,0,'07:00',brk(addDays(d0,-15),addDays(d0,-1),'Work travel, corrected')));if(!F2&&lastR(t.p).interruption.relation!=='SAME_BREAK')flag(c,'A2 not SAME_BREAK');
 reportOn(t,5,3,'05:00',x=>x.day<3);ev(t,at(t.p,5,5,'06:00',brk(addDays(d0,3),addDays(d0,4))));if(!F2&&lastR(t.p).interruption.relation!=='NEW')flag(c,'B not NEW');
 oracleI3(c,t,d0,addDays(d0,3),addDays(d0,5),5);out.cases[c]={log:t.log.slice(-4)};
}
// C5: a late report of an earlier, separate break is asked.
{
 const c='C5 late earlier break',t=begin('sc-c5');weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;firstReturn(t,d0);
 const r=ev(t,at(t.p,5,1,'06:00',brk(addDays(d0,-30),addDays(d0,-25))));out.cases[c]={status:r.status};if(!F2&&r.status!=='ASK')flag(c,'not asked: '+r.status);
}
// C6/C13: the first loaded week, every class, a short, moderate or long break starting after the first exposures.
const firstLoaded=(cls,o={})=>{const t={p:R.generateProgram(intake(`sc-fw-${cls}`,{cls,...o}),opts).program,ledger:[],log:[]};const F=t.p.weeks.findIndex(x=>rowsFrom(t.p,x.index,x.startDate).some(r=>r.mode!=='BODYWEIGHT'&&r.kind!=='PRACTICE'));for(let w=0;w<F;w++)weekly(t,w);return {t,F};};
for(const cls of ['NONE','FAMILIAR','KNOWN'])for(const len of [5,10,14,35])for(const startDay of [3,5]){
 const c=`C6 ${cls} first week, break d${startDay} ${len}d`,{t,F}=firstLoaded(cls,{schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}});
 const s=addDays(t.p.weeks[F].startDate,startDay),e=addDays(s,len-1),rep=addDays(e,1);
 const before={};for(const r of rowsFrom(t.p,F,t.p.weeks[F].startDate).filter(r=>r.date<s&&r.kind!=='PRACTICE'))before[r.id]=Math.max(before[r.id]??0,r.sets);
 weekly(t,F,x=>x.date<s);const rw=Math.floor((Date.parse(rep)-Date.parse(t.p.startDate))/(7*864e5));for(let w=F+1;w<rw;w++)weekly(t,w,()=>false);
 const r=ev(t,at(t.p,rw,(Date.parse(rep)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00',brk(s,e)));if(!/REESTABLISH/.test(r.action)){out.cases[c]={skipped:r.status};continue;}
 // A moderate or long return: the SSCTR's E, O and B (strengthReturnSets). A short one resumes the last completed doses: no exposure of an
 // exercise executed before the break comes back above its count before the break until a week after the return is executed (its later
 // weeks follow the plan's own transitions, block-boundary set included, as without a break: not this class).
 const cls2=len<=10?'SHORT':len<=28?'MODERATE':'LONG',seen=new Set(),bad=[],largest={},entry=lastR(t.p).interruption?.entry?.strength?.exercises;
 if(!F2)for(const id of Object.keys(before))if(!entry?.[id]?.lastPerformed)bad.push(`state ${id} not in use at the break`);
 for(let w=rw;w<rw+4;w++){for(const x of rowsFrom(t.p,w,rep)){if(!(x.id in before))continue;
   if(!seen.has(x.id)){seen.add(x.id);if(cls2!=='SHORT'&&(x.kind!=='RETURN_ENTRY'||x.sets>1||x.rir<4))bad.push(`E w${w} ${x.id} ${x.kind} ${x.sets}@${x.rir}`);}
   if(cls2==='SHORT'&&w===rw&&x.sets>before[x.id])bad.push(`resume w${w} ${x.id} ${x.sets}>${before[x.id]}`);
   if(cls2!=='SHORT'&&x.sets>before[x.id])bad.push(`O w${w} ${x.id} ${x.sets}>${before[x.id]}`);
   if(cls2!=='SHORT'&&Number.isInteger(largest[x.id])&&x.sets>largest[x.id]+1)bad.push(`B w${w} ${x.id} ${x.sets}>${largest[x.id]}+1`);}
  weekly(t,w,x=>x.date>=rep);for(const x of rowsFrom(t.p,w,rep))if(x.id in before)largest[x.id]=Math.max(largest[x.id]??0,x.sets);}
 out.cases[c]={class:cls2,exercises:Object.keys(before).length,violations:bad.length};if(bad.length)flag(c,bad.slice(0,3).join('; '));
}
// C7: the same break reported at 23:30 on Sunday or 00:30 on Monday gives the same next week; C7b with a non-zero time zone.
for(const tz of [0,-180,330]){
 const c=`C7 week boundary tz${tz}`,rows=[];
 for(const [w,day,hm] of [[4,6,'23:30'],[5,0,'00:30']]){const t=begin('sc-c7',{tz});weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;ev(t,at(t.p,w,day,hm,brk(addDays(d0,-16),addDays(d0,-2))));rows.push(JSON.stringify({w5:t.p.weeks[5].sessions.map(s=>[s.id,s.role,s.prescription?.durationMinutes??null,(s.prescription?.exercises??[]).map(e=>e.sets+'@'+e.rir)]),s6:t.p.stateTrace[6]}));}
 out.cases[c]={same:rows[0]===rows[1]};if(rows[0]!==rows[1])flag(c,'differs');
}
// C8: a session executed on the morning of the break's first day, and the observation clock (C9): a pre-break session observed only after
// the break began does not count; one observed before it and reported later does.
{
 const c='C8 break starts on an executed session day',t=begin('sc-c8',{schedule:{strengthDays:[2,5],strengthTurn:'AM'}});weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;firstReturn(t,d0);
 // Wednesday's strength (AM) is executed, then a break from Wednesday is reported: Wednesday is in the break; its execution is not before it.
 reportOn(t,5,2,'12:00',x=>x.day<=2);const r=ev(t,at(t.p,5,5,'06:00',brk(addDays(d0,2),addDays(d0,4))));
 const at2=lastR(t.p).interruption?.stateAt;out.cases[c]={action:r.action,executed:at2?.executed??null};
 oracleI3(c,t,d0,addDays(d0,2),addDays(d0,5),5);
}
// C10: unreported sessions before the break perform nothing; C11: an equipment change, a fatigue report and a missed-session move between two
// breaks.
for(const between of ['none','equipment','fatigue','missed']){
 const c=`C11 between the breaks: ${between}`,t=begin('sc-c11');weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;firstReturn(t,d0);
 if(between==='equipment')ev(t,at(t.p,5,1,'07:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 if(between==='fatigue')ev(t,at(t.p,5,1,'07:00',{kind:'SYSTEMIC_FATIGUE'}));
 if(between==='missed'){const q=t.p.weeks[5].sessions.find(s=>s.sport==='RUN'&&s.day===1);ev(t,at(t.p,5,1,'20:00',{kind:'MISSED_SESSION',targetSessionId:q.id}));}
 if(between!=='none')reportOn(t,5,3,'05:00',x=>x.day<3&&x.day!==1);
 const r=ev(t,at(t.p,5,5,'06:00',brk(addDays(d0,3),addDays(d0,4))));out.cases[c]={action:r.action,relation:lastR(t.p).interruption?.relation??null,log:t.log.slice(-3)};
 if(!F2&&lastR(t.p).interruption.relation!=='NEW')flag(c,'not NEW');oracleI3(c,t,d0,addDays(d0,3),addDays(d0,5),5);
}
// C12: a re-establishment executed in the break's week (a long gap before it), then a short or moderate break: the first exposure back is
// at most the re-establishment count, then at most one set per executed week, and no known load comes back before a later log (SSCTR D53).
for(const len of [5,14]){
 const c=`C12 re-established then ${len}d break`,t=begin('sc-c12r',{schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}});
 for(let w=3;w<8;w++)weekly(t,w,x=>x.sport!=='STRENGTH');
 const w=8,d=t.p.weeks[w].startDate,re=rowsFrom(t.p,w,d).filter(x=>x.date===d);
 reportOn(t,w,1,'05:00',x=>x.day===0);const s=addDays(d,2),e=addDays(s,len-1),rep=addDays(e,1),rw=Math.floor((Date.parse(rep)-Date.parse(t.p.startDate))/(7*864e5));
 weekly(t,w,x=>x.day===0);for(let k=w+1;k<rw;k++)weekly(t,k,()=>false);
 const r=ev(t,at(t.p,rw,(Date.parse(rep)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00',brk(s,e)));
 const c0={};for(const x of re)c0[x.id]=Math.max(c0[x.id]??0,x.sets);const bad=[];
 for(const [i,k] of [rw,rw+1].entries())for(const x of rowsFrom(t.p,k,rep))if(x.id in c0&&(x.sets>c0[x.id]+i||x.mode==='KNOWN'))bad.push(`w${k} ${x.id} ${x.sets}@${x.rir}/${x.mode}${x.value??''} vs re-established ${c0[x.id]}`);
 out.cases[c]={kinds:[...new Set(re.map(x=>x.kind))],action:r.action,violations:bad.length};if(bad.length)flag(c,bad.slice(0,3).join('; '));
}
console.log(JSON.stringify(out,null,1));
