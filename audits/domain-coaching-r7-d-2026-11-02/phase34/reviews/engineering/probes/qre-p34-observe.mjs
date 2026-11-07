// QRE R7-D Phase 3.4: observability of surviving mutants (is a survivor a test gap or an equivalent mutant?). Each scenario runs on a runtime root;
// the caller compares the candidate with the mutant roots built by qre-p34-mutation.mjs.  node qre-p34-observe.mjs <root> --label <name> [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=H;
const GEN={id:'qre-p34-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const GEV={id:'qre-p34-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay(),friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const stops=d=>(d?.separateBreaks??[]).map(b=>b.stop+(b.ownReturn?`(RUN=${b.ownReturn.reentered.RUN},STR=${b.ownReturn.reentered.STRENGTH})`:''));
const runsOfWeek=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const res=r=>({action:r.action,status:r.status??null,missing:r.missingInputs??[],reason:String(r.reason??'').slice(0,160)});
const out={probe:'QRE-P34-OBSERVE-1',label,cases:{}};
const run=(id,f)=>{try{out.cases[id]=f();}catch(e){out.cases[id]={exception:e.name+': '+e.message};}};

// O1 (Q02): a race week between the breaks with every session done, the race finished with an adverse recovery (BR-Q4: no adverse race re-enters running).
run('O1_adverse_race',()=>{
 const t={p:program(GEV),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:'o1-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=t.p.weeks[7].sessions.filter(live).map(s=>s.sport==='RUN'&&s.role==='RACE'?obs(t.p,s,{response:{recovery:'ADVERSE'}}):obs(t.p,s));
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:'o1-D'},event:{id:'o1-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,8,{day:4,hour:'08:00:00'});return {result:res(r),stops:stops(lastReturn(t.p)),runMode:lastReturn(t.p)?.entry?.run?.mode??null};
});
// O2 (Q12): the later break starts on the Sunday of a week executed in full (its long run that day), with NO stated start time (BR-Q5: the week is
// not complete; the session on the first day never counts as between).
run('O2_same_day_without_startedAt',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'o2-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(20,23),episodeId:'o2-D'},event:{id:'o2-D',kind:'LOCAL_FATIGUE'},observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s))});
 const r=step(t,5,{day:4,hour:'08:00:00'});return {result:res(r),start:lastReturn(t.p)?.startDate,days:lastReturn(t.p)?.days,cls:lastReturn(t.p)?.class,stops:stops(lastReturn(t.p))};
});
// O3 (Q15, SSCTR-P34-F01): a return reported Wednesday night with the week's elapsed runs unreported (T16's shape), then a later handler on the return's
// week. RESULT (recorded in the review): neither handler tried re-plans from the return's own week (the missed session KEEPs; the schedule change
// re-plans from next week, fromWeek 8), so this scenario does NOT reach Q15: its observability is not demonstrated here.
run('O3_ceiling_after_a_later_replan',()=>{
 const mk=d=>{const t=base();for(const w of [2,3])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))});
  const r=step(t,7,{day:d,hour:'21:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(14,34)});return {t,r};};
 const mon=mk(0),wed=mk(2);
 const thu=wed.t.p.weeks[7].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.date===addDays(wed.t.p.weeks[7].startDate,3));
 const later=thu?step(wed.t,7,{day:3,hour:'21:00:00',kind:'MISSED_SESSION',targetSessionId:thu.id,observations:[notDone(wed.t.p,thu)]}):null;
 // A schedule change on Thursday morning (it re-plans from next week on every runtime: fromWeek 8).
 const wed2=mk(2),sched=step(wed2.t,7,{day:3,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{runDays:[1,4,6]}});
 return {mondayReturn:{result:res(mon.r),w8:runsOfWeek(mon.t.p,8),w9:runsOfWeek(mon.t.p,9)},wednesdayReturn:res(wed.r),thursdayMissed:later?{result:res(later),w8:runsOfWeek(wed.t.p,8),w9:runsOfWeek(wed.t.p,9)}:'no Thursday run',
  thursdayScheduleChange:{result:res(sched),fromWeek:sched.proposal?.decisions?.at(-1)?.fromWeek??null,w7ahead:wed2.t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=addDays(wed2.t.p.weeks[7].startDate,3)).map(s=>`${s.role}:${s.prescription.durationMinutes}`),w8:runsOfWeek(wed2.t.p,8),w9:runsOfWeek(wed2.t.p,9)}};
});
// O4 (Q09): a named correction of the trip after the Founder's-case return, sent with a record that lacks the holiday's declaration.
run('O4_correction_with_partial_record',()=>{
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'o4-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s)));
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'o4-D'},event:{id:'o4-D',kind:'LOCAL_FATIGUE'},observations:o});
 step(t,6,{day:4,hour:'08:00:00'});
 const partial={...t,ledger:t.ledger.filter(r=>!(r.fact==='INTERRUPTION_DECLARED'&&r.eventId==='o4-A'))};
 const r=step(partial,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,32),episodeId:'o4-D'},event:{id:'o4-D2',kind:'RETURN_AFTER_PAUSE'}});
 return {result:res(r),stop:lastReturn(partial.p)?{start:lastReturn(partial.p).startDate,days:lastReturn(partial.p).days,relation:lastReturn(partial.p).relation,stops:stops(lastReturn(partial.p))}:null};
});
const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
