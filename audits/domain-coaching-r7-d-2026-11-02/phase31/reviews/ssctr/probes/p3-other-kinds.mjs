// Point 3: while a break is kept, another event kind is asked and applies nothing. A 5-day (SHORT) or 14-day (MODERATE) break ending the day
// before week 4 is declared on week 4 day 1 with a schedule change (asked). On day 2 a signal event arrives carrying an executed run report with
// an adverse response; on day 3 a plain weekly review applies the kept break. Compared with: the signal re-sent after the return (day 4), and
// the timely order (return report on day 1, signal on day 2, both applied). Reports the run and strength doses from day 4 and whether the
// signal's report is in the record. Run on both roots. Synthetic fixtures; engineering evidence only.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,live,obs}=L;
const base=trained([0,1,2,3]);
const W=4,d=n=>addDays(base.p.weeks[W].startDate,n);
const doses=(p,from)=>p.weeks.slice(W,W+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.date>=from)).map(s=>s.sport==='RUN'?`R:${s.prescription.family}:${s.prescription.durationMinutes}`:`S:${s.prescription.exercises.reduce((n,e)=>n+e.sets,0)}sets`).join(' ');
const out={root,rows:[]};
for(const len of [5,14]){
 const brk={startDate:addDays(d(0),-len),endDate:d(-1),days:len,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
 for(const kind of ['SYSTEMIC_FATIGUE','LOCAL_FATIGUE','UNDERPERFORMANCE','PROGRESSION_NOT_TOLERATED','MISSED_SESSION']){
  const t0=copy(base);step(t0,W,{day:1,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});
  const s=t0.p.weeks[W].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.date<=d(2));
  const report=s?[obs(t0.p,s,{response:{recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}})]:[];
  const A=copy(t0),ra=step(A,W,{day:2,hour:'07:00:00',kind,observations:report,signals:{region:'LOWER'}});
  const recorded=report.every(o=>A.ledger.some(x=>x.eventId===o.eventId||x.sessionId===o.sessionId&&x.observedAt===o.observedAt));
  const rr=step(A,W,{day:3,hour:'07:00:00'});
  const B=copy(A),rb=step(B,W,{day:4,hour:'07:00:00',kind,signals:{region:'LOWER'}});
  const C=copy(base);step(C,W,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk});const rc=step(C,W,{day:2,hour:'07:00:00',kind,observations:report,signals:{region:'LOWER'}});
  out.rows.push({len,kind,reportOn:s?.date??null,asked:`${ra.status} ${ra.missingInputs.join('+')}`,reportRecorded:recorded,applied:`${rr.action}`,
   notResent:doses(A.p,d(4)),resent:`${rb.action}: ${doses(B.p,d(4))}`,timely:`${rc.action}: ${doses(C.p,d(4))}`});
 }
}
console.log(JSON.stringify(out,null,1));
