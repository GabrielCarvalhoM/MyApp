// DOMAIN_COACHING_R7-A Final Closure author self-challenge (Founder request §15): equivalence classes of two and three interruptions, one
// interruption corrected several times, a correction and a new interruption in both orders, a correction made while a later interruption went
// on, late session evidence, the same day, the week boundary, the first loaded week, repeated short returns, equipment and fatigue between
// interruptions, duplicate reports, explicit identity and time zones. Each case states its oracle; the probe prints the violations.
// RT=freeze1 runs the byte-exact R7A2-FREEZE-1 copy (../freeze1-source), otherwise the live tree. Synthetic data, DEV_TEST_ONLY authority,
// read-only: prints only. Usage: node r7af-self-challenge.mjs > out.json
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,F1=process.env.RT==='freeze1',CC=F1?path.resolve(here,'../freeze1-source/CoachingCore'):path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,c='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:c},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
let N=0;
const intake=(id,{cls='KNOWN',schedule={},tz=0}={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,...(tz?{timezoneOffsetMinutes:tz}:{}),
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')]:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
const tzOf=p=>p.timezoneOffsetMinutes??0,localAt=(d,hm,tz)=>new Date(Date.parse(`${d}T${hm}:00Z`)-tz*60000).toISOString();
const at=(p,w,day,hm,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:localAt(d,hm,tzOf(p)),weekIndex:w,event:{id:`af-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{day=s.date,hm=null,reportedAt=null}={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`af-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:localAt(day,hm??(s.turn==='PM'?'19:00':'08:00'),tzOf(p)),...(reportedAt?{reportedAt}:{}),actual,response:{...OK}};}
const live=s=>s.prescription&&s.status!=='SKIPPED';
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const reportOn=(t,w,day,hm,keep,kind='WEEKLY_REVIEW')=>ev(t,at(t.p,w,day,hm,{kind,observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const brk=(start,end,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const begin=(id,o={},weeks=3)=>{const g=R.generateProgram(intake(id,o),opts);if(!g.program)throw Error(id+': '+g.status);const t={p:g.program,ledger:[],log:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copyT=t=>({p:t.p,ledger:t.ledger,log:[...t.log]});
const returns=P=>P.decisions.filter(d=>d.action==='REESTABLISH'),lastR=P=>returns(P).at(-1);
const episodes=P=>new Set(returns(P).map(d=>d.interruption?.episode??d.eventId)).size;
const rowsFrom=(P,w,from)=>P.weeks[w]?.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=from).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,id:e.id,sets:e.sets,rir:e.rir,mode:e.load.mode,value:e.load.value??null,kind:e.exposure?.kind??null})))??[];
const longsFrom=(P,w,from)=>P.weeks[w]?.sessions.filter(s=>live(s)&&s.role==='LONG'&&s.date>=from).map(s=>s.prescription.durationMinutes)??[];
const weekOfDay=(P,d)=>Math.floor((Date.parse(d)-Date.parse(P.startDate))/(7*864e5)),dayIn=(P,d)=>(Date.parse(d)-Date.parse(P.weeks[weekOfDay(P,d)].startDate))/864e5;
const evOn=(t,d,hm,x)=>ev(t,at(t.p,weekOfDay(t.p,d),dayIn(t.p,d),hm,x));
const out={probe:'R7AF-SELF-CHALLENGE-1',runtime:F1?'R7A2-FREEZE-1':'live tree (check the digest)',cases:{},violations:[]};
const flag=(c,what)=>out.violations.push(`${c}: ${what}`);
const expect=(c,cond,what)=>{if(!cond)flag(c,what);};
// Oracle D (Founder 0.3, QE-R7A1-09 class): after a separate interruption that follows a re-entry, for two weeks no strength row is at the
// pre-break dose (a known load at three sets or more) and no long run is longer than the re-entry long run plus one 25-minute step.
function oracleDose(c,P,from,reentryLong){const w=weekOfDay(P,from),bad=[...[w,w+1].flatMap(k=>rowsFrom(P,k,from).filter(r=>r.mode==='KNOWN'&&r.sets>=3).map(r=>`w${k} ${r.id} ${r.sets}/KNOWN${r.value}`)),...[w,w+1].flatMap(k=>longsFrom(P,k,from).filter(m=>m>reentryLong+25).map(m=>`w${k} long ${m}`))];if(bad.length)flag(c,'dose '+bad.slice(0,3).join('; '));return bad.length;}
const rec=(c,t,extra={})=>{out.cases[c]={log:t.log,returns:returns(t.p).map(d=>({eventId:d.eventId,relation:d.interruption?.relation??null,basis:d.interruption?.basis??null,episode:d.interruption?.episode??null,revision:d.interruption?.revision??null,supersedes:d.interruption?.supersedes??null,start:d.interruption?.startDate??null,end:d.interruption?.endDate??null,stateAt:d.interruption?.stateAt?`${d.interruption.stateAt.kind}/w${d.interruption.stateAt.week}/${d.interruption.stateAt.eventId??'-'}`:null})),...extra};};
/** A: weeks 0-2 trained, 3-4 untrained, a 16-day return Monday 06:00 of week 5 (re-entry that week); Monday to Wednesday executed. */
function base(id,o={}){const t=begin(id,o);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;ev(t,at(t.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1))));const A=lastR(t.p);reportOn(t,5,2,'21:00',s=>s.day<3);return {t,d0,A,reentryLong:Math.max(...longsFrom(t.p,5,d0),20)};}

// C1 two interruptions: B after A's re-entry, short or moderate, in A's re-entry week, the next week reviewed, or the next week unreviewed.
for(const len of [2,12])for(const where of ['same','nextReviewed','nextUnreviewed']){
 const c=`C1-two-${where}-${len}d`,{t,d0,A,reentryLong}=base('af-c1-'+c);
 if(where==='nextReviewed')weekly(t,5,()=>false);
 const bs=where==='same'?addDays(d0,3):addDays(d0,7),be=addDays(bs,len-1),back=addDays(be,1);
 const r=evOn(t,back,'07:00',brk(bs,be)),B=lastR(t.p);
 expect(c,r.action==='REESTABLISH','B re-established: '+r.status);expect(c,B?.interruption?.relation==='NEW','B NEW');expect(c,episodes(t.p)===2,'two episodes');
 expect(c,JSON.stringify(t.p.decisions.find(d=>d.eventId===A.eventId))===JSON.stringify(A),'A untouched');
 expect(c,where==='nextReviewed'?B?.interruption?.stateAt?.kind==='WEEK_START':B?.interruption?.stateAt?.eventId===A.eventId,'B starts from A’s re-entry: '+JSON.stringify(B?.interruption?.stateAt));
 oracleDose(c,t.p,back,reentryLong);rec(c,t);
}
// C2 three interruptions, each after the re-entry of the one before.
// The week between B and C is reviewed, so C starts from B's re-entry or the start that review decided after it, never from before B; its
// long runs stay within one step of that decided start.
{const c='C2-three',{t,d0}=base('af-c2');evOn(t,addDays(d0,5),'07:00',brk(addDays(d0,3),addDays(d0,4)));const B=lastR(t.p);weekly(t,5);
 const decided=Math.max(...longsFrom(t.p,6,t.p.weeks[6].startDate),20);
 evOn(t,addDays(d0,10),'07:00',brk(addDays(d0,8),addDays(d0,9)));const C=lastR(t.p),sa=C.interruption?.stateAt;
 expect(c,[B,C].every(x=>x.interruption?.relation==='NEW')&&episodes(t.p)===3,'three new episodes');expect(c,sa?.eventId===B.eventId||sa?.kind==='WEEK_START'&&sa?.week===6,'C from B’s re-entry or the decided start after it: '+JSON.stringify(sa));
 oracleDose(c,t.p,addDays(d0,10),decided);rec(c,t);}
// C3 one interruption corrected several times (named): one episode, revisions counted, each start read at its own dates; the dates of the
// first report again give its entry (0.6).
{const c='C3-corrected-thrice',{t,d0,A}=base('af-c3'),id=A.interruption?.episode;
 for(const [s,e,hm] of [[-17,-1,'22:00'],[-15,-1,'22:30'],[-16,0,'23:00'],[-16,-1,'23:30']])evOn(t,addDays(d0,2),hm,brk(addDays(d0,s),addDays(d0,e),{episodeId:id}));
 const rs=returns(t.p);expect(c,episodes(t.p)===1&&rs.length===5&&rs.slice(1).every((d,i)=>d.interruption?.relation==='SAME_BREAK'&&d.interruption?.revision===i+2&&d.interruption?.supersedes===rs[i].eventId),'one episode, four revisions in order');
 expect(c,JSON.stringify(rs.at(-1).interruption?.entry?.strength)===JSON.stringify(A.interruption?.entry?.strength),'the first dates again give the first entry');rec(c,t);}
// C4 a correction, then a new interruption: B starts from the correction in force when it began.
{const c='C4-correct-then-new',{t,d0,A,reentryLong}=base('af-c4');evOn(t,addDays(d0,2),'22:00',brk(addDays(d0,-15),addDays(d0,-1),{episodeId:A.interruption?.episode}));const A2=lastR(t.p);
 evOn(t,addDays(d0,5),'07:00',brk(addDays(d0,3),addDays(d0,4)));const B=lastR(t.p);
 expect(c,A2.interruption?.relation==='SAME_BREAK'&&B.interruption?.relation==='NEW'&&B.interruption?.stateAt?.eventId===A2.eventId,'B NEW from the correction in force');oracleDose(c,t.p,addDays(d0,5),reentryLong);rec(c,t);}
// C5 a new interruption, then a correction of the old one arriving late (named, or the same dates): asked; nothing changes.
for(const named of [true,false]){const c=`C5-new-then-late-correction-${named?'named':'dates'}`,{t,d0,A}=base('af-c5-'+named);evOn(t,addDays(d0,5),'07:00',brk(addDays(d0,3),addDays(d0,4)));const before=t.p;
 const r=evOn(t,addDays(d0,5),'08:00',brk(addDays(d0,-16),addDays(d0,-1),named?{episodeId:A.interruption?.episode,reason:'Long trip'}:{reason:'Long trip'}));
 expect(c,r.status==='ASK'&&t.p===before,'asked, plan unchanged: '+r.status);rec(c,t);}
// C6 the QE-R7A2-01 class: A reported again after B began and before B is reported (the same dates, a named shifted start, a named later end),
// B in A's re-entry week or the next one: A's report again is A; B is new, from A's re-entry; never the pre-break dose.
for(const fix of ['duplicate','namedEarlier','namedLater'])for(const bWeek of ['same','next'])for(const when of ['duringB','afterB']){
 const c=`C6-${fix}-${bWeek}-${when}`,{t,d0,A,reentryLong}=base('af-c6-'+c),bs=bWeek==='same'?addDays(d0,3):addDays(d0,7),be=addDays(bs,3),back=addDays(be,1);
 const x=fix==='duplicate'?brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long trip'}):fix==='namedEarlier'?brk(addDays(d0,-17),addDays(d0,-1),{episodeId:A.interruption?.episode}):brk(addDays(d0,-16),d0,{episodeId:A.interruption?.episode});
 evOn(t,when==='duringB'?addDays(bs,1):back,when==='duringB'?'12:00':'06:00',x);const A2=lastR(t.p);
 const r=evOn(t,back,'07:00',brk(bs,be)),B=lastR(t.p);
 expect(c,A2.interruption?.episode===A.interruption?.episode&&A2.interruption?.relation==='SAME_BREAK','A’s report again is A');
 expect(c,r.action==='REESTABLISH'&&B.interruption?.relation==='NEW'&&episodes(t.p)===2,'B new: '+r.status+' '+B.interruption?.relation);
 oracleDose(c,t.p,back,reentryLong);rec(c,t);
}
// C7 late session evidence (I6): Monday's lifting of the first loaded week, a Wednesday-Friday break, the sync before or after the return.
function firstLoaded(id,cls='FAMILIAR',tz=0){const g=R.generateProgram(intake(id,{cls,tz,schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}}),opts),t={p:g.program,ledger:[],log:[]};const F=t.p.weeks.findIndex(x=>rowsFrom(t.p,x.index,x.startDate).some(r=>r.mode!=='BODYWEIGHT'&&r.kind!=='PRACTICE'));for(let w=0;w<F;w++)weekly(t,w);return {t,F,d:t.p.weeks[F].startDate};}
const mondayObs=(t,F,reportedAt)=>t.p.weeks[F].sessions.filter(s=>live(s)&&s.day===0).map(s=>obs(t.p,s,{reportedAt}));
{const a=firstLoaded('af-c7a'),b=firstLoaded('af-c7b'),c='C7-late-session';
 ev(a.t,at(a.t.p,a.F,4,'21:00',{kind:'PARTIAL_SESSION',observations:mondayObs(a.t,a.F,localAt(addDays(a.d,4),'21:00',0))}));ev(a.t,at(a.t.p,a.F,5,'06:00',brk(addDays(a.d,2),addDays(a.d,4))));
 ev(b.t,at(b.t.p,b.F,5,'06:00',brk(addDays(b.d,2),addDays(b.d,4))));const s=ev(b.t,at(b.t.p,b.F,5,'07:00',{kind:'PARTIAL_SESSION',observations:mondayObs(b.t,b.F,localAt(addDays(b.d,5),'07:00',0))}));
 const c2=ev(b.t,at(b.t.p,b.F,5,'08:00',brk(addDays(b.d,2),addDays(b.d,4))));
 expect(c,s.status==='ASK','the late sync after the return asks: '+s.status);expect(c,c2.action==='REESTABLISH'&&lastR(b.t.p).interruption?.relation==='SAME_BREAK','confirmed as the same break');
 expect(c,JSON.stringify(lastR(b.t.p).interruption?.entry?.strength)===JSON.stringify(lastR(a.t.p).interruption?.entry?.strength),'confirmed state = state read in time');rec(c,b.t,{inTime:lastR(a.t.p).interruption?.stateAt??null});}
// C8 the same day (0.8): a 14-day break from Monday of the first loaded week, Monday's lifting at 19:00; stated start before, after, or none.
for(const cls of ['NONE','FAMILIAR'])for(const st of ['06:00','21:00',null]){const c=`C8-same-day-${cls}-${st??'date-only'}`,{t,F,d}=firstLoaded('af-c8-'+c,cls),ids=new Set(t.p.weeks[F].sessions.filter(s=>live(s)&&s.day===0&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode!=='BODYWEIGHT').map(e=>e.id)));
 const r=ev(t,at(t.p,F+2,0,'06:00',{...brk(d,addDays(d,13),st?{startedAt:localAt(d,st,0)}:{}),observations:mondayObs(t,F,null)})),entry=r.proposal?.decisions.at(-1).interruption?.entry?.strength?.exercises??{};
 // Date only: the order decides whether Monday's exercises (FAMILIAR's loaded first exposures, NONE's practice) are in use when the break
 // begins, a fact the return starts from: asked.
 if(st===null)expect(c,r.status==='ASK','date only, the exercises in use differ: asked ('+r.status+')');
 else for(const id of ids)expect(c,st==='21:00'?entry[id]?.returnStep===0:entry[id]===undefined,`${id} ${st==='21:00'?'before':'after'} the start`);rec(c,t);}
// The same day, immaterial: A begins on a Saturday whose lifting was executed that evening, with every exercise already in use and its ceiling
// unchanged; only the last performed date differs, so the date suffices and the other reading is recorded.
{const c='C8-same-day-in-use',{t,A}=base('af-c8-inuse');expect(c,A?.action==='REESTABLISH'&&!!A.interruption?.stateAt?.sameDay,'recorded, not asked: '+JSON.stringify(A?.interruption?.stateAt??null));rec(c,t);}
// C9 the week boundary (P5): the same history, B short or moderate, Thursday of the re-entry week or Monday of the next (unreviewed): the
// same start state.
for(const len of [2,12]){const c=`C9-week-boundary-${len}d`,x=base('af-c9a-'+len),y=base('af-c9b-'+len);
 evOn(x.t,addDays(x.d0,3+len),'07:00',brk(addDays(x.d0,3),addDays(x.d0,2+len)));evOn(y.t,addDays(y.d0,7+len),'07:00',brk(addDays(y.d0,7),addDays(y.d0,6+len)));
 const strip=e=>JSON.stringify({...e,strength:{...e.strength,exercises:Object.fromEntries(Object.entries(e.strength.exercises).map(([k,v])=>[k,(({lastPerformed,...z})=>z)(v)]))}});
 expect(c,strip(lastR(x.t.p).interruption?.entry??{strength:{exercises:{}}})===strip(lastR(y.t.p).interruption?.entry??{strength:{exercises:{}}}),'same start on both sides of the week boundary');rec(c,y.t);}
// C10 the first loaded week (D59): every exercise lifted before a Saturday break enters the return steps with its executed count as ceiling.
for(const cls of ['NONE','FAMILIAR','KNOWN']){const c=`C10-first-week-${cls}`,{t,F,d}=firstLoaded('af-c10-'+cls,cls);
 const before=t.p.weeks[F].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date<addDays(d,5)).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE'));
 weekly(t,F,s=>s.date<addDays(d,5));weekly(t,F+1,()=>false);const r=ev(t,at(t.p,F+2,5,'06:00',brk(addDays(d,5),addDays(d,18)))),entry=r.proposal?.decisions.at(-1).interruption?.entry?.strength?.exercises??{};
 for(const e of before)expect(c,entry[e.id]?.returnStep===0&&entry[e.id]?.setCeiling>=1,`${e.id} at the entry with a ceiling`);rec(c,t);}
// C11 repeated short returns: three short breaks, a duplicate between them; each break eases its own slot, at most one each.
{const c='C11-short-repeated',t=begin('af-c11'),w=3,d0=t.p.weeks[w].startDate;ev(t,at(t.p,w,0,'06:00',brk(addDays(d0,-6),addDays(d0,-1))));reportOn(t,w,2,'05:00',s=>s.day<=1);
 ev(t,at(t.p,w,5,'06:00',brk(addDays(d0,-6),addDays(d0,-1),{reason:'Long trip'})));ev(t,at(t.p,w,5,'07:00',brk(addDays(d0,2),addDays(d0,4))));weekly(t,w,s=>s.day>=5);
 reportOn(t,w+1,2,'05:00',s=>s.day<=1);ev(t,at(t.p,w+1,5,'07:00',brk(addDays(d0,9),addDays(d0,11))));weekly(t,w+1,s=>s.day>=5);
 const slots=t.p.weeks.slice(w,w+4).flatMap(x=>x.sessions.filter(s=>/short break runs easy/.test(s.explanation??'')).map(s=>s.easedFor));
 expect(c,episodes(t.p)===3,'three episodes');expect(c,new Set(slots).size===slots.length&&slots.length===3,'one slot per break: '+JSON.stringify(slots));rec(c,t,{slots});}
// C12 equipment and fatigue between two interruptions: B is still new and starts from the re-entry.
for(const between of ['equipment','fatigue']){const c=`C12-${between}-between`,{t,d0,reentryLong}=base('af-c12-'+between);
 if(between==='equipment')ev(t,at(t.p,5,2,'22:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,3),to:addDays(d0,13)}}));else ev(t,at(t.p,5,2,'22:00',{kind:'SYSTEMIC_FATIGUE'}));
 const r=evOn(t,addDays(d0,6),'07:00',brk(addDays(d0,3),addDays(d0,5))),B=lastR(t.p);expect(c,r.action==='REESTABLISH'&&B.interruption?.relation==='NEW','B new: '+r.status);oracleDose(c,t.p,addDays(d0,6),reentryLong);rec(c,t);}
// C13 duplicates: the same report twice (one event id) adds nothing; one event id with other facts is asked; the same record with a new id
// is the same episode; the same record of an earlier interruption after a later one is asked.
{const c='C13-duplicates',{t,d0,A}=base('af-c13'),n=t.p.decisions.length,again=at(t.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1)));
 const k=R.evaluateProgram(t.p,{...again,event:{...again.event,id:A.eventId},actualLedger:t.ledger},opts),x=R.evaluateProgram(t.p,{...again,event:{...again.event,id:A.eventId},interruption:{...again.interruption,reason:'Holiday'},actualLedger:t.ledger},opts);
 expect(c,k.status==='KEEP'&&!k.proposal,'replay kept: '+k.status);expect(c,x.status==='ASK','reused id asked: '+x.status);
 ev(t,{...again,asOf:localAt(addDays(d0,2),'22:00',0),eligibility:elig(addDays(d0,2)),weekIndex:5});expect(c,t.p.decisions.length===n+1&&episodes(t.p)===1&&lastR(t.p).interruption?.basis==='DUPLICATE','a new id with the same record is a revision');rec(c,t);}
// C14 explicit identity: a new name on the days of A, a correction of an earlier interruption, an unknown name after the re-entry.
{const c='C14-explicit',{t,d0,A}=base('af-c14');
 const r1=evOn(t,addDays(d0,2),'22:00',brk(addDays(d0,-10),addDays(d0,-1),{episodeId:'my-other-trip'}));expect(c,r1.status==='ASK','a new name on A’s days asked: '+r1.status);
 const r2=evOn(t,addDays(d0,6),'07:00',brk(addDays(d0,3),addDays(d0,5),{episodeId:'trip-2'}));expect(c,r2.action==='REESTABLISH'&&lastR(t.p).interruption?.episode==='trip-2'&&lastR(t.p).interruption?.relation==='NEW','a name after the re-entry is a new episode with that identity');
 const r3=evOn(t,addDays(d0,6),'08:00',brk(addDays(d0,-16),addDays(d0,-1),{episodeId:A.interruption?.episode}));expect(c,r3.status==='ASK','a correction of the earlier one asked: '+r3.status);
 const r4=evOn(t,addDays(d0,6),'09:00',brk(addDays(d0,2),addDays(d0,5),{episodeId:'trip-2'}));expect(c,r4.action==='REESTABLISH'&&lastR(t.p).interruption?.relation==='SAME_BREAK'&&lastR(t.p).interruption?.episode==='trip-2','the latest corrected by its name');rec(c,t);}
// C15 time zones: the C6 duplicate case and the C9 boundary case at UTC-5 and UTC+9: the same identities and states as at UTC.
for(const tz of [-300,540]){const c=`C15-tz${tz}`,{t,d0,A,reentryLong}=base('af-c15-'+tz,{tz});
 evOn(t,addDays(d0,7),'06:00',brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long trip'}));const r=evOn(t,addDays(d0,7),'07:00',brk(addDays(d0,3),addDays(d0,6))),B=lastR(t.p);
 expect(c,r.action==='REESTABLISH'&&B.interruption?.relation==='NEW'&&B.interruption?.stateAt?.eventId===A.eventId,'B new from A’s first report');oracleDose(c,t.p,addDays(d0,7),reentryLong);rec(c,t);}
console.log(JSON.stringify(out,null,1));
