// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §25): the bounded self-challenge. It attacks only the two root causes, through shapes the
// reviewers' probes and this mission's tests do not already pin: A5 (factual correction before every decision) on other delivery days, other
// review kinds (a missed session, an equipment statement, a return report) and a conflict carried by other kinds; E1 (return factual ceiling) on
// the walk/jog ladder and its exit, EASY short and moderate returns at every week, a repeated pause, a return's completion and a restart's switch
// to easy running. Each case states its own violation predicate. R7ADA_ROOT selects the tree (the previous author's library, unchanged).
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority. Prints JSON.
import * as L from '../../domain-coaching-r7a-decision-authority-2026-10-29/probes/r7ada-lib.mjs';
const out={probe:'r7ara-self-challenge',tree:L.TREE,classes:{}};
const add=(cls,c)=>{(out.classes[cls]??={cases:0,violations:0,examples:[]}).cases++;if(c.violation){out.classes[cls].violations++;if(out.classes[cls].examples.length<6)out.classes[cls].examples.push(c);}};
const hState=(H,id)=>{const st=H?.state?.strength?.exercises?.[id]??null;return st&&{mode:st.mode,load:st.load??null,reps:st.reps??null,pending:st.pendingLoad??null};};
const correctionOf=(o,actual,correctedAt)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response}});
const kgFor=(id0,v)=>(id,e)=>id===id0?v:(e.load.mode==='KNOWN'?e.load.value:20);
const allow=(t,review)=>{const r=L.evaluate(t,review);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};

// ---------- A5 ----------
// db-rdl at 24 kg in weeks 0-1, both logs corrected to 20; the event carrying the correction in LATE (nothing in EARLY) at `day` `hour` of week 2;
// the remaining sessions of week 2 reported day by day from reports built once, Saturday's db-rdl at 24 kg (3x5 @ RIR 3); week closed Sunday.
const EVENTS={
 WEEKLY_REVIEW:(p,d,h,o)=>L.at(p,2,d,h,{observations:o}),
 UNAVAILABLE_FRI:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'UNAVAILABLE_DAY',observations:o}),changes:{unavailableDates:[L.addDays(p.weeks[2].startDate,4)]}}),
 LOCAL_FATIGUE:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'LOCAL_FATIGUE',observations:o}),signals:{region:'LOWER'}}),
 SYSTEMIC_FATIGUE:(p,d,h,o)=>L.at(p,2,d,h,{kind:'SYSTEMIC_FATIGUE',observations:o}),
 SCHEDULE_NEXT_WEEK:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'SCHEDULE_CHANGE',observations:o}),changes:{runMinutes:55}}),
 GOAL_NEXT_WEEK:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'GOAL_CHANGE',observations:o}),changes:{goals:{strength:'HYPERTROPHY'}}}),
 TURN_CONFLICT:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'DOUBLE_CONFLICT',observations:o}),changes:{strengthTurn:'PM'}}),
 EQUIPMENT_ADD:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'EQUIPMENT_CHANGE',observations:o}),changes:{equipment:[...p.canonical.athlete.equipment,'BANDS']}}),
 MISSED_TUE_RUN:(p,d,h,o)=>({...L.at(p,2,1,'21:00:00',{kind:'MISSED_SESSION',observations:o}),targetSessionId:p.weeks[2].sessions.find(s=>L.live(s)&&s.sport==='RUN'&&s.day===1).id}),
 RETURN_MON_TUE:(p,d,h,o)=>({...L.at(p,2,2,'07:00:00',{observations:o,...L.brk(p.weeks[2].startDate,L.addDays(p.weeks[2].startDate,1))})}),
 // A 10K athlete (the engineering judge's inferred kinds): the event moved one week later, and a skip in the event-conflict handler.
 EVENT_DATE_CHANGE:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'EVENT_DATE_CHANGE',observations:o}),changes:{eventDate:L.addDays(p.canonical.goals.event.date,7)}}),
 EVENT_WEEK_CONFLICT:(p,d,h,o)=>({...L.at(p,2,d,h,{kind:'EVENT_WEEK_CONFLICT',observations:o}),changes:{unavailableDates:[L.addDays(p.weeks[2].startDate,4)]}}),
};
const EVENT_ATHLETE={athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:L.addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'}}};
function a5(kind,day,hour,cellName,shared){
 L.resetIds();const t=L.gen({id:'r7ara-sc-a5',...(kind.startsWith('EVENT_')?EVENT_ATHLETE:{})});
 L.weekly(t,0,()=>true,s=>L.SAT(s)?{kg:kgFor('db-rdl',24)}:{});
 const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{kg:kgFor('db-rdl',24)}:{}),eventId:`sc-w1-${i}`}));
 const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id==='db-rdl')));
 const fix=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(has)].map(o=>correctionOf(o,{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).map(e=>e.id!=='db-rdl'?e:{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:20}}))})},`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`));
 L.step(t,L.at(t.p,1,6,'21:00:00',{observations:cellName==='EARLY'?[...w1,...fix]:w1}));
 const ev=EVENTS[kind](t.p,day,hour,cellName==='LATE'?fix:[]),evAt=Date.parse(ev.asOf),d=allow(t,ev);
 shared.reports??=t.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{kg:kgFor('db-rdl',24),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}:{}),eventId:`sc-w2-${s.id}`}));
 const reports=shared.reports.filter(o=>Date.parse(o.observedAt)>evAt&&t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&L.live(s))&&o.sessionId!==ev.targetSessionId);
 const byDay=new Map();for(const o of reports){const s=t.p.weeks[2].sessions.find(x=>x.id===o.sessionId);if(!byDay.has(s.day))byDay.set(s.day,[]);byDay.get(s.day).push(structuredClone(o));}
 for(const dd of [0,1,2,3,4,5])if(byDay.has(dd))allow(t,L.at(t.p,2,dd,'21:00:00',{observations:byDay.get(dd)}));
 const close=allow(t,L.at(t.p,2,6,'21:00:00',{observations:byDay.get(6)??[]}));
 return {status:d.status,action:d.action,questions:(close.loadQuestions??[]).filter(q=>q.exerciseId==='db-rdl').map(q=>`${q.reason}:${q.logged}/${q.planned}`),history:hState(L.history(t,3,0,'06:00:00'),'db-rdl'),next:L.rowsOf(t,3,()=>true,['db-rdl']).map(r=>r.split(' ').slice(2).join(' '))};
}
for(const [day,hour] of [[1,'07:00:00'],[2,'07:00:00'],[3,'07:00:00']])for(const kind of Object.keys(EVENTS)){
 if(['MISSED_TUE_RUN','RETURN_MON_TUE'].includes(kind)&&day!==1)continue;
 const shared={},E=a5(kind,day,hour,'EARLY',shared),La=a5(kind,day,hour,'LATE',shared);
 add('A5.delivery-day-and-kind',{kind,day,EARLY:E,LATE:La,violation:JSON.stringify(E.history)!==JSON.stringify(La.history)||JSON.stringify(E.next)!==JSON.stringify(La.next)||JSON.stringify(E.questions)!==JSON.stringify(La.questions)});
}

// The week's last day: strength on Wednesday and Sunday (PM); the correction arrives on Sunday before that day's session (07:00 or 13:00); week 2
// Monday to Saturday executed; Sunday's db-rdl logged at 24 (3x5 @ RIR 3), the week closed at 21:00.
const LAST={
 WEEKLY_REVIEW:(p,h,o)=>L.at(p,2,6,h,{observations:o}),
 UNAVAILABLE_LATER:(p,h,o)=>({...L.at(p,2,6,h,{kind:'UNAVAILABLE_DAY',observations:o}),changes:{unavailableDates:['2030-01-01']}}),
 SCHEDULE_NOOP:(p,h,o)=>({...L.at(p,2,6,h,{kind:'SCHEDULE_CHANGE',observations:o}),changes:{runMinutes:p.canonical.schedule.runMinutes}}),
 GOAL_NEXT_WEEK:(p,h,o)=>({...L.at(p,2,6,h,{kind:'GOAL_CHANGE',observations:o}),changes:{goals:{strength:'HYPERTROPHY'}}}),
 LOCAL_FATIGUE_UPPER:(p,h,o)=>({...L.at(p,2,6,h,{kind:'LOCAL_FATIGUE',observations:o}),signals:{region:'UPPER'}}),
 TURN_CONFLICT:(p,h,o)=>({...L.at(p,2,6,h,{kind:'DOUBLE_CONFLICT',observations:o}),changes:{strengthTurn:'PM'}}),
 EQUIPMENT_ADD:(p,h,o)=>({...L.at(p,2,6,h,{kind:'EQUIPMENT_CHANGE',observations:o}),changes:{equipment:[...p.canonical.athlete.equipment,'BANDS']}}),
};
function lastDay(kind,hour,cellName,shared){
 L.resetIds();const t=L.gen({id:'r7ara-sc-last',schedule:{strengthDays:[2,6]}}),has=s=>s.prescription?.exercises?.some(e=>e.id==='db-rdl'),SUN=s=>L.live(s)&&s.sport==='STRENGTH'&&s.day===6;
 L.weekly(t,0,()=>true,s=>has(s)?{kg:kgFor('db-rdl',24)}:{});
 const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,has(s)?{kg:kgFor('db-rdl',24)}:{}),eventId:`last-w1-${i}`}));
 const hasO=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&has(s)));
 const fix=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(hasO)].map(o=>correctionOf(o,{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).map(e=>e.id!=='db-rdl'?e:{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:20}}))})},`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`));
 L.step(t,L.at(t.p,1,6,'21:00:00',{observations:cellName==='EARLY'?[...w1,...fix]:w1}));
 for(const s of t.p.weeks[2].sessions.filter(s=>L.live(s)&&s.day<6))allow(t,L.at(t.p,2,s.day,'21:00:00',{observations:[L.obs(t.p,s)]}));
 const d=allow(t,LAST[kind](t.p,hour,cellName==='LATE'?fix:[])),sun=t.p.weeks[2].sessions.find(SUN);
 shared.rep??=sun?{...L.obs(t.p,sun,{kg:kgFor('db-rdl',24),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}),eventId:'last-sun'}:null;
 const close=allow(t,L.at(t.p,2,6,'21:00:00',{observations:shared.rep&&sun&&shared.rep.sessionId===sun.id?[structuredClone(shared.rep)]:[]}));
 return {status:d.status,action:d.action,row:L.rowsOf(t,2,SUN,['db-rdl']).map(r=>r.split(' ').slice(2).join(' ')),questions:(close.loadQuestions??[]).filter(q=>q.exerciseId==='db-rdl').map(q=>q.reason),history:hState(L.history(t,3,0,'06:00:00'),'db-rdl')};
}
for(const hour of ['07:00:00','13:00:00'])for(const kind of Object.keys(LAST)){
 const shared={},E=lastDay(kind,hour,'EARLY',shared),La=lastDay(kind,hour,'LATE',shared);
 add('A5.last-day',{kind,hour,EARLY:E,LATE:La,violation:JSON.stringify(E.history)!==JSON.stringify(La.history)||JSON.stringify(E.row)!==JSON.stringify(La.row)||JSON.stringify(E.questions)!==JSON.stringify(La.questions)});
}

// ---------- E1 ----------
const runsAfter=(t,w,fromDay)=>t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.date>=fromDay).map(s=>({role:s.role,minutes:s.prescription.durationMinutes,dim:s.progression?.dimension??null,value:s.progression?.value??null}));
const executed=(t,since=-Infinity,before=Infinity)=>t.ledger.filter(o=>!o.superseded&&!o.conflicted&&!o.partial&&o.context?.sport==='RUN'&&Date.parse(o.observedAt)>since&&Date.parse(o.observedAt)<before).sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)).map(o=>{const s=t.p.weeks.flatMap(w=>w.sessions).find(x=>x.id===o.sessionId);return {role:s.role,minutes:s.prescription.durationMinutes,dim:s.progression?.dimension??null,value:s.progression?.value??null,week:o.context.weekIndex};});
function pause(t,k,days,d0=0){
 const start=L.addDays(t.p.weeks[k].startDate,d0),end=L.addDays(start,days-1),report=L.addDays(end,1),W=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=L.addDays(x.startDate,6));
 if(W<0||W+1>=t.p.weeks.length)return null;
 const r=allow(t,L.at(t.p,W,Math.round((Date.parse(report)-Date.parse(t.p.weeks[W].startDate))/864e5),'06:00:00',L.brk(start,end))),d=t.p.decisions.at(-1);
 if(d?.action!=='REESTABLISH')return {r,error:r.status+' '+r.action};
 return {r,cls:d.interruption.class,entry:d.interruption.entry.run,fromWeek:d.fromWeek,report,cut:Date.parse(start+'T00:00:00Z'),reportedAt:Date.parse(d.asOf),rows:runsAfter(t,d.fromWeek,report)};
}
const lastOf=(ran,pred)=>ran.filter(pred).at(-1);
// The ceiling the reviewers' probes read (Q06c, the SSCTR's easy return): the largest long and easy run executed; an eased quality slot is no easy-run dose.
const largestOf=(ran,pred)=>{const v=ran.filter(pred).map(x=>x.minutes);return v.length?Math.max(...v):null;};
const easyCap=ran=>largestOf(ran,x=>x.role==='EASY'&&!['THRESHOLD_STEP','SPECIFIC_STEP'].includes(x.dim));
const easyCheck=(entry,ran,{step=5}={})=>{const long=largestOf(ran,x=>x.role==='LONG'),easy=easyCap(ran),e=entry.mode==='RETURN'?entry.returnTo:entry;
 return {long,easy,entryLong:e.long,entryEasy:e.easy,entryExtra:e.easyExtra??0,violation:(long!==null&&e.long>long)||(easy!==null&&(e.easy+(entry.mode==='RETURN'?0:((e.easyExtra??0)>0?step:0)))>easy)};};
// E1.1 walk/jog ladder (W2 preserved) and its exit (F4-X): the engineering walk/jog fixture.
const wjTo=(t,step)=>{for(let w=0;w<t.p.weeks.length-3;w++){if(t.p.weeks[w].sessions.some(s=>L.live(s)&&s.role==='WALK_JOG'&&s.progression?.value===step))return w;L.weekly(t,w);}return -1;};
for(const A of [2,4,6,8])for(const days of [3,6,10,17,33]){
 L.resetIds();const t=L.gen({id:'r7ara-sc-wj',...L.WJ}),wA=wjTo(t,A);if(wA<0)continue;L.weekly(t,wA);
 const p=pause(t,wA+1,days);if(!p||p.error){add('E1.walkjog-ladder-and-exit',{A,days,skipped:p?.error??'beyond the program',violation:false});continue;}
 const allowed=p.cls==='SHORT'?A:p.cls==='MODERATE'?Math.max(0,A-1):0,cont=p.rows.filter(x=>['EASY','LONG','QUALITY'].includes(x.role)),steps=p.rows.filter(x=>x.dim==='WALK_JOG_STEP').map(x=>x.value);
 add('E1.walkjog-ladder-and-exit',{A,days,cls:p.cls,entry:{mode:p.entry.mode,walkStep:p.entry.walkStep},steps,continuous:cont,violation:p.entry.mode!=='WALK_JOG'||p.entry.walkStep>allowed||steps.some(v=>v>allowed)||cont.length>0});
}
// E1.2 EASY short returns at every week (the long and easy runs against the last executed), E1.3 moderate returns (the conditional target).
for(const k of [1,2,3,4,5,6,7,8,9])for(const days of [3,6,10,17]){
 L.resetIds();const t=L.gen({id:'r7ara-sc-easy'});for(let w=0;w<k;w++)L.weekly(t,w);
 const p=pause(t,k,days);if(!p||p.error)continue;const ran=executed(t,-Infinity,p.cut),c=easyCheck(p.entry,ran);
 const rowsAbove=p.cls==='SHORT'?p.rows.filter(x=>x.role==='LONG'&&c.long!==null&&x.minutes>c.long||x.role==='EASY'&&x.dim==='EASY_MINUTES'&&c.easy!==null&&x.minutes>c.easy):[];
 add(p.cls==='SHORT'?'E1.easy-short':'E1.easy-moderate',{k,days,cls:p.cls,...c,rowsAbove,violation:c.violation||rowsAbove.length>0});
}
// E1.4 a repeated pause, EASY: a short return at week 5, its re-entry week executed from the report on and closed, then a second short pause.
for(const [k,days2] of [[3,6],[5,6],[5,3],[6,10]]){
 L.resetIds();const t=L.gen({id:'r7ara-sc-rep'});for(let w=0;w<k;w++)L.weekly(t,w);
 const p1=pause(t,k,6);if(!p1||p1.error)continue;L.weekly(t,p1.fromWeek,s=>s.date>=p1.report);const p2=pause(t,p1.fromWeek+1,days2);if(!p2||p2.error)continue;
 const ran=executed(t,p1.reportedAt,p2.cut),c=easyCheck(p2.entry,ran.length?ran:executed(t,-Infinity,p1.cut));
 add('E1.easy-repeated-pause',{k,days2,cls:p2.cls,...c,violation:c.violation});
}
// E1.5 a return's completion: MODERATE (weeks 3-4), re-entry weeks 5 and 6 executed (steps 0 and 1), the evidence completes the return; then a short
// pause before any easy run (the return state at the step last run), or after Tuesday's easy run only (EASY, the long run at the last one run).
for(const after of ['NONE','TUESDAY_EASY']){
 L.resetIds();const t=L.gen({id:'r7ara-sc-done'});for(let w=0;w<3;w++)L.weekly(t,w);const p1=pause(t,3,14);if(!p1||p1.error)continue;
 L.weekly(t,5);L.weekly(t,6);const H=L.history(t,7,0).state.run;
 if(after==='TUESDAY_EASY'){const s=t.p.weeks[7].sessions.find(x=>L.live(x)&&x.sport==='RUN'&&x.day===1);allow(t,L.at(t.p,7,1,'21:00:00',{observations:[L.obs(t.p,s)]}));}
 const p2=pause(t,7,4,after==='NONE'?0:2);if(!p2||p2.error)continue;const ran=executed(t,p1.reportedAt,p2.cut),last=ran.filter(x=>['RETURN_STEP','EASY_MINUTES','LONG_MINUTES'].includes(x.dim)).at(-1);
 const v=after==='NONE'?!(p2.entry.mode==='RETURN'&&p2.entry.returnStep<=last.value):easyCheck(p2.entry,ran).violation;
 add('E1.return-completion',{after,historyMode:H.mode,lastRun:last,entry:{mode:p2.entry.mode,returnStep:p2.entry.returnStep??null,long:p2.entry.long,easy:p2.entry.easy},violation:v});
}
// E1.6 a restart (LONG pause) executed until the switch to easy running, then a short pause before any easy-mode run.
{
 L.resetIds();const t=L.gen({id:'r7ara-sc-restart'});for(let w=0;w<2;w++)L.weekly(t,w);const p1=pause(t,2,33);
 if(p1&&!p1.error){let w=p1.fromWeek,H=null;L.weekly(t,w,s=>s.date>=p1.report);for(w=w+1;w<t.p.weeks.length-2;w++){H=L.history(t,w,0).state.run;if(H.mode!=='RESTART')break;L.weekly(t,w);}
  const p2=pause(t,w,4);if(p2&&!p2.error){const ran=executed(t,p1.reportedAt,p2.cut),last=ran.filter(x=>x.dim).at(-1);
   add('E1.restart-switch',{historyMode:H?.mode,lastRun:last,entry:{mode:p2.entry.mode,restart:p2.entry.restart,easy:p2.entry.easy,long:p2.entry.long},violation:last?.dim==='RESTART_MINUTES'&&!(p2.entry.mode==='RESTART'&&p2.entry.restart<=last.value)});}}
}
out.total={cases:Object.values(out.classes).reduce((n,c)=>n+c.cases,0),violations:Object.values(out.classes).reduce((n,c)=>n+c.violations,0)};
console.log(JSON.stringify(out,null,1));
