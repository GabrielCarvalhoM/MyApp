// Q1 (F01 closure on paths the witness does not run). Run on both roots (candidate and R7D-FREEZE-3).
//  I1  Alignment: A = days 0-8 (Mon wk2 - Tue wk3, 9 days) kept by a fatigue report on Wed wk3; every planned session from Wed wk3 to Fri wk4
//      executed in full (7 sessions, more than one plan week's five), but no plan week lies wholly between (Mon/Tue wk3 inside A, Sun wk4 inside
//      D); D = Sat wk4 - Tue wk5 (4 days), named, declared with the gap on Wed wk5; a plain review on Thu wk5. Comparator: days 0-22 once.
//  I2  Three breaks, an isolated run between each: A = wk2 (7 d), Tue wk3 run, B = Wed-Sun wk3 (5 d), Tue wk4 run, C = Wed-Sat wk4 (4 d).
//  I3  Three breaks: a complete week between A and B, an isolated run between B and C. A = wk2-3 (14 d), wk4 in full, B = wk5 (7 d), Tue wk6
//      run only, C = Wed-Sat wk6 (4 d). Expected: the stop runs B..C; A is history with its re-entry week.
//  I4  The late form (as the witness's E3) with week 4 executed in full and reviewed, but no reps in reserve logged on its strength sessions.
//  I5  The bulk form (as the witness's E2) with week 4 executed in full but no reps in reserve logged on its strength sessions.
//  I6  Gap Mon-Tue wk4 both sessions done; D = Wed-Sun wk4 holds the rest of week 4 (5 d). No whole week between.
import {setup} from './common.mjs';
const P=await setup();
const {step,base,copy,day,brk,trip,obs,notDone,weekObs,sessionsIn,view,once,noRir,live,out}=P;
const run1=(p,s)=>s.sport==='RUN'&&s.role!=='LONG'?obs(p,s):notDone(p,s);
// ---- I1 ----
{const t=base();
 const a=step(t,3,{day:2,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,8),event:{id:'i1-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=sessionsIn(t.p,9,18);
 step(t,5,{day:2,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(19,22),episodeId:'i1-D'},event:{id:'i1-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>obs(t.p,s))});
 const r=step(t,5,{day:3,hour:'07:00:00'});
 const k=once(0,22,5,3);
 out.cases.I1_alignment={aKept:a.action,gap:gap.map(s=>`${s.date} ${s.sport} ${s.role}`),gapSessions:gap.length,result:view(r,t,5,4),comparatorOnce23:view(k.r,k.t,5,4)};}
// ---- I2 ----
{const t=base();
 const a=step(t,3,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,6),event:{id:'i2-A',kind:'SYSTEMIC_FATIGUE'}});
 const g1=sessionsIn(t.p,7,8);
 const b=step(t,4,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(9,13),episodeId:'i2-B'},event:{id:'i2-B',kind:'LOCAL_FATIGUE'},observations:g1.map(s=>run1(t.p,s))});
 const g2=sessionsIn(t.p,14,15);
 const c=step(t,4,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(16,19),episodeId:'i2-C'},event:{id:'i2-C',kind:'LOCAL_FATIGUE'},observations:g2.map(s=>run1(t.p,s))});
 const r=step(t,5,{day:0,hour:'07:00:00'});
 const k=once(0,19,5,0);
 out.cases.I2_threeBreaksIsolatedRuns={aKept:a.action,bStep:b.action+' '+(b.question?.kind??''),cStep:c.action+' '+(c.question?.kind??''),gaps:[...g1,...g2].map(s=>`${s.date} ${s.sport} ${s.role}`),result:view(r,t,5,1),comparatorOnce20:view(k.r,k.t,5,1)};}
// ---- I3 ----
{const t=base();
 const a=step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'i3-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk4=t.p.weeks[4].sessions.filter(live);
 const b=step(t,6,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,27),episodeId:'i3-B'},event:{id:'i3-B',kind:'LOCAL_FATIGUE'},observations:wk4.map(s=>obs(t.p,s))});
 const g2=sessionsIn(t.p,28,29);
 const c=step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:'i3-C'},event:{id:'i3-C',kind:'LOCAL_FATIGUE'},observations:g2.map(s=>run1(t.p,s))});
 const r=step(t,6,{day:6,hour:'08:00:00'});
 const k=once(21,33,6,6);
 out.cases.I3_completeWeekThenIsolatedRun={aKept:a.action,bStep:b.action+' '+(b.question?.kind??''),cStep:c.action+' '+(c.question?.kind??''),result:view(r,t,7,0),comparatorBtoCOnce13:view(k.r,k.t,7,0)};}
// ---- I4: late form, week 4 in full and reviewed, strength without reps in reserve ----
{const t=base();
 for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});
 const rv=step(t,4,{observations:weekObs(t.p,4,(p,s)=>s.sport==='STRENGTH'?noRir(p,s):obs(p,s))});
 step(t,5,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'i4-A',kind:'SYSTEMIC_FATIGUE'}});
 const before=t.p.weeks[5].sessions.filter(s=>live(s)&&s.date<day(23));
 step(t,5,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(23,26),episodeId:'i4-D'},event:{id:'i4-D',kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
 out.cases.I4_lateReviewedWeekNoRir={week4Review:rv.action+' '+rv.status,result:view(step(t,6,{day:0,hour:'07:00:00'}),t,6,1)};}
// ---- I5: bulk form, week 4 in full, strength without reps in reserve ----
{const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'i5-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weekObs(t.p,4,(p,s)=>s.sport==='STRENGTH'?noRir(p,s):obs(p,s));
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'i5-D'},event:{id:'i5-D',kind:'LOCAL_FATIGUE'},observations:o});
 out.cases.I5_bulkWeekNoRir=view(step(t,5,{day:4,hour:'08:00:00'}),t,5,6);
 // control: the same with reps in reserve logged (the witness's E2)
 const u=base();step(u,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'i5c-A',kind:'SYSTEMIC_FATIGUE'}});
 step(u,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'i5c-D'},event:{id:'i5c-D',kind:'LOCAL_FATIGUE'},observations:weekObs(u.p,4)});
 out.cases.I5_controlWithRir=view(step(u,5,{day:4,hour:'08:00:00'}),u,5,6);}
// ---- I6 ----
{const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'i6-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=sessionsIn(t.p,14,15);
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(16,20),episodeId:'i6-D'},event:{id:'i6-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>obs(t.p,s))});
 const k=once(0,20,5,1);
 out.cases.I6_laterBreakHoldsTheWeek={gap:gap.map(s=>`${s.date} ${s.sport}`),result:view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2),comparatorOnce21:view(k.r,k.t,5,2)};}
console.log(JSON.stringify(out,null,1));
