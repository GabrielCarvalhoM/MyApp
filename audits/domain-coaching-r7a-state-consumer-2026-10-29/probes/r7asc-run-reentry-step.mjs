// Author probe (prints only): does the run side of a return skip a step the way F1's strength did? A 16-day (MODERATE, mode RETURN) or 35-day
// (LONG, mode RESTART) break from Tuesday of week 4, reported Thursday 07:00 of week 6 (re-entry this week); the week-6 sessions after the report
// executed as prescribed and the week reviewed on Sunday; weeks 7-10 executed as prescribed and reviewed. Per week: the plan's run start
// (stateTrace), history's run at the week start (historicalStateOf, Monday 06:00) and the run rows. R7ASC_ROOT selects the runtime.
import * as L from './r7asc-lib.mjs';
const out={probe:'r7asc-run-reentry-step',root:L.ROOT,reportDay:Number(process.env.REPORT_DAY??3),cases:{}};const RD=out.reportDay;
for(const [name,days] of [['MODERATE',16],['LONG',35]]){
 L.resetIds();const t=L.start('r7asc-rr-'+name,4),start=L.addDays(t.p.weeks[4].startDate,1),end=L.addDays(start,days-1);
 const rw=Math.floor((Date.parse(end)-Date.parse(t.p.startDate))/864e5/7),ret=L.step(t,L.at(t.p,rw,RD,'07:00:00',L.brk(start,end)));
 const c=out.cases[name]={break:{start,end,reportedWeek:rw},return:`${ret.status}/${ret.action}`,weeks:[]};
 // The return week: the sessions after the report (Thursday on), executed as prescribed, reviewed on Sunday.
 const post=s=>s.date>=L.addDays(t.p.weeks[rw].startDate,RD);
 L.weekly(t,rw,post);
 for(let w=rw+1;w<rw+5;w++)L.weekly(t,w);
 for(let w=rw;w<rw+5;w++){const P=t.p.stateTrace[w]?.run,H=L.history(t,w,0,'06:00:00');
  c.weeks.push({week:w,plan:{mode:P?.mode,returnStep:P?.returnStep??null,restart:P?.restart??null,easy:P?.easy??null,long:P?.long??null},history:{mode:H?.state?.run?.mode,returnStep:H?.state?.run?.returnStep??null,restart:H?.state?.run?.restart??null,easy:H?.state?.run?.easy??null},rows:L.runRows(t,w)});}
}
L.print(out);
