// SSCTR R7-D Phase 3.4 (SSCTR-R7D-P34-DECISION-r1, finding SSCTR-P34-F01): does the single-run ceiling of a return re-planned from its own week
// credit that week's elapsed, unexecuted run sessions as executed for the weeks after it? Synthetic development fixtures; engineering evidence for
// a domain decision only. Read-only: run on a scratch root holding CoachingCore, never on the repository.
//   node p34-ceiling.mjs <root holding CoachingCore> --label <name>
//  G1-G4  one break, 21 days (Mon wk4 - Sun wk6), weeks 2-3 reported not done (no completed run in the 30 days before week 7); a return report in
//         week 7 on Mon (G1), Wed (G2) or Fri (G3) with the elapsed week-7 runs unreported, or Fri with them reported not done (G4).
//  G5     the R1 shape with D = Thu-Sun wk7 declared Mon wk8 (the return plans a whole week ahead): A kept Mon wk4; weeks 4-6 strength done,
//         every run not done; week 7 Mon-Wed runs not done, strength done.
import {setup} from '../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup();
const {step,base,brk,trip,obs,notDone,weekObs,live,returns,day,out}=P;
const runs=(t,w)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.prescription.family}:${s.prescription.durationMinutes}`).join(' ');
for(const [id,d,report] of [['G1_mondayReport',0,false],['G2_wednesdayReportUnreported',2,false],['G3_fridayReportUnreported',4,false],['G4_fridayReportNotDone',4,true]]){
 const t=base();for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});
 const elapsed=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date<day(35+d));
 const r=step(t,7,{day:d,hour:'21:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(14,34),observations:report?elapsed.map(s=>notDone(t.p,s)):[]});
 const ret=returns(t.p).at(-1);
 out.cases[id]={action:r.action,ret:ret?`${ret.interruption.class} ${ret.interruption.days}d fromWeek ${ret.fromWeek}`:null,wk7:runs(t,7),wk8:runs(t,8),wk9:runs(t,9)};
}
{const by=(fRun,fStr)=>(p,s)=>s.sport==='RUN'?fRun(p,s):fStr(p,s),done=(p,s)=>obs(p,s);
 const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'g5-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5,6].flatMap(w=>weekObs(t.p,w,by(notDone,done))).concat(t.p.weeks[7].sessions.filter(s=>live(s)&&s.date<day(38)).map(s=>s.sport==='RUN'?notDone(t.p,s):obs(t.p,s)));
 step(t,8,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(38,41),episodeId:'g5-D'},event:{id:'g5-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,8,{day:0,hour:'08:00:00'}),ret=returns(t.p).at(-1);
 out.cases.G5_runLapseWholeWeekAhead={action:r.action,ret:ret?`${ret.interruption.class} ${ret.interruption.days}d fromWeek ${ret.fromWeek}`:null,separateBreaks:(ret?.interruption.separateBreaks??[]).map(b=>`${b.episode} ${b.stop}`),wk8:runs(t,8),wk9:runs(t,9),wk10:runs(t,10)};}
console.log(JSON.stringify(out,null,1));
