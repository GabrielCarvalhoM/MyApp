// P03 (reviewer-owned, Property B): a real correction (correctionOf, the runtime's own normalizer) must leave no retracted value factual in any
// reader. Each case has a CORRECTED cell (original report, then a correction) and a CONTROL cell that reported the corrected facts directly; the
// two must agree in every reader: historicalStateOf at several cuts (before and after the correction's own time), the decision's gates, rows and
// load questions, and the internal reducer (a what-if return's entry). Base: weeks 0-3 trained and reviewed (default intake, STRENGTH goal).
//   B1  load 22 -> 20 (one increment above the row, target met; then corrected to the row's load)
//   B2  chain X+2 -> X+1 -> X (a correction of a correction)
//   B3  the correction moves the execution to Monday of the next week (same session)
//   B4  run: Sunday's long run reported complete, corrected to 30 minutes, not complete
//   B5  a report without exercise details, corrected with the sets and loads (adds a usable load)
import * as L from './qe-r7asc-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asc-P03-correction-boundary',root:L.ROOT_USED,cases:{}};
const exPick=H=>{const h=L.hex(H,ID),s=H?.state?.strength?.exercises?.[ID];return h?{mode:h.mode,lastExecutedLoad:h.lastExecutedLoad,liftedLoad:h.liftedLoad,lastPerformedAt:h.lastPerformedAt,tick:h.earnedProgress.loadTick,stepEarned:h.earnedProgress.stepEarned,stateLoad:s?.load??null,stateReps:s?.reps??null}:null;};
const runPick=H=>({achieved:H.run.achieved,longestContinuous:H.run.longestContinuous,mode:H.run.mode,easyWeeksDone:H.state.run.easyWeeksDone,long:H.state.run.long});
function base(){L.resetIds();const t=L.start('qe-p03',4);return t;}
function readers(t,{sat,cuts,run=false}){
 const r={};for(const [name,asOf] of Object.entries(cuts)){const H=L.historyAt(t,asOf);r[name]=run?runPick(H):exPick(H);}
 r.decision={action:t.last.action,gate:t.last.gates?.[run?'LONG':ID]??null,questions:(t.last.loadQuestions??[]).filter(q=>q.exerciseId===ID).map(q=>q.reason)};
 r.rowsNext=run?null:L.rowsOf(t,5,L.SAT,[ID]).map(L.fmtRow);
 r.runRowsNext=run?t.p.weeks[5].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`).join(' '):undefined;
 const e=L.reducerEntry(t,5,[ID]);r.internalReducer=run?null:e.entry[ID];
 if(run){const c=L.copy(t),d0=c.p.weeks[5].startDate,x=L.R.evaluateProgram(c.p,{...L.at(c.p,5,3,'06:00:00',L.brk(L.addDays(d0,1),L.addDays(d0,2))),actualLedger:c.ledger},L.opts);const en=x.proposal?.decisions.at(-1)?.interruption?.entry?.run;r.internalReducer={achieved:en?.achieved,longestContinuous:en?.longestContinuous,easyWeeksDone:en?.easyWeeksDone,long:en?.long};}
 return r;
}
function runCase(name,build){
 const res={};
 for(const cell of ['CORRECTED','CONTROL']){const t=base();const info=build(t,cell);res[cell]={...info,readers:readers(t,info)};}
 const strip=x=>JSON.stringify(x);
 const keys=Object.keys(res.CORRECTED.readers);
 res.agree=Object.fromEntries(keys.map(k=>[k,strip(res.CORRECTED.readers[k])===strip(res.CONTROL.readers[k])]));
 res.allAgree=Object.values(res.agree).every(Boolean);
 out.cases[name]=res;
}
const day=(t,w,d,h)=>`${L.addDays(t.p.weeks[w].startDate,d)}T${h}Z`;
// B1, B2, B3, B5 share the shape: week 4 reported by its Sunday review, Saturday's report first, its correction(s) before the review.
function strengthCase(kind){return (t,cell)=>{
 const w=4,sat=t.p.weeks[w].sessions.find(L.SAT),row=sat.prescription.exercises.find(e=>e.id===ID),X=row.load.value,others=t.p.weeks[w].sessions.filter(s=>L.live(s)&&s!==sat);
 const at=kg=>(id,e)=>id===ID?kg:(e.load.mode==='KNOWN'?e.load.value:20);
 const satObs=(opt,id,observedAt)=>({...L.obs(t.p,sat,opt),eventId:id,observedAt:observedAt??`${sat.date}T19:00:00Z`});
 const fix=(o,id,opt,correctedAt,observedAt)=>({...satObs(opt,id,observedAt??o.observedAt),correctionOf:o.eventId,correctedAt});
 const obsOthers=others.filter(s=>s.day<6).map((s,i)=>({...L.obs(t.p,s),eventId:`p03-${kind}-o${i}`}));
 const sunday=others.filter(s=>s.day===6).map((s,i)=>({...L.obs(t.p,s),eventId:`p03-${kind}-s${i}`}));
 L.step(t,L.at(t.p,w,4,'21:00:00',{observations:obsOthers}));
 const monday=`${L.addDays(sat.date,2)}T07:00:00Z`;
 if(kind==='B1'){if(cell==='CONTROL')L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[satObs({kg:at(X)},'p03-sat')]}));else{const o=satObs({kg:at(X+2)},'p03-sat');L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[o]}));L.step(t,L.at(t.p,w,6,'20:30:00',{observations:[fix(o,'p03-sat-fix',{kg:at(X)},day(t,w,6,'20:00:00'))]}));}}
 if(kind==='B2'){if(cell==='CONTROL')L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[satObs({kg:at(X)},'p03-sat')]}));else{const o=satObs({kg:at(X+2)},'p03-sat');L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[o]}));const f1=fix(o,'p03-sat-fix1',{kg:at(X+1)},day(t,w,6,'10:00:00'));L.step(t,L.at(t.p,w,6,'10:30:00',{observations:[f1]}));L.step(t,L.at(t.p,w,6,'20:30:00',{observations:[fix(f1,'p03-sat-fix2',{kg:at(X)},day(t,w,6,'20:00:00'))]}));}}
 if(kind==='B5'){if(cell==='CONTROL')L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[satObs({kg:at(X)},'p03-sat')]}));else{const o=satObs({noDetails:true},'p03-sat');L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[o]}));L.step(t,L.at(t.p,w,6,'20:30:00',{observations:[fix(o,'p03-sat-fix',{kg:at(X)},day(t,w,6,'20:00:00'))]}));}}
 if(kind==='B3'){
  // The session was done on Monday of week 5 (07:00 local), not Saturday: CONTROL reports it so on Monday 08:00; CORRECTED first claimed Saturday.
  const mon=`${L.addDays(t.p.weeks[w+1].startDate,0)}T07:00:00Z`;
  if(cell==='CORRECTED'){const o=satObs({kg:at(X)},'p03-sat');L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[o]}));L.step(t,L.at(t.p,w,6,'20:30:00',{observations:sunday}));L.step(t,L.at(t.p,w+1,0,'08:00:00',{observations:[fix(o,'p03-sat-fix',{kg:at(X)},`${L.addDays(t.p.weeks[w+1].startDate,0)}T07:30:00Z`,mon)]}));}
  else{L.step(t,L.at(t.p,w,6,'20:30:00',{observations:sunday}));L.step(t,L.at(t.p,w+1,0,'08:00:00',{observations:[{...satObs({kg:at(X)},'p03-sat-fix',mon)}]}));}
  return {sat:sat.id,X,cuts:{satNight:day(t,w,5,'22:00:00'),sunNight:day(t,w,6,'22:00:00'),mon0730:day(t,w+1,0,'07:20:00'),mon12:day(t,w+1,0,'12:00:00')}};
 }
 L.step(t,L.at(t.p,w,6,'21:00:00',{observations:sunday}));
 return {sat:sat.id,X,cuts:{satNight:day(t,w,5,'22:00:00'),sunBeforeFix:day(t,w,6,'19:00:00'),sunAfterReview:day(t,w,6,'22:00:00'),mon:day(t,w+1,0,'06:00:00')}};
};}
runCase('B1_22_to_20',strengthCase('B1'));
runCase('B2_chain',strengthCase('B2'));
runCase('B3_moved_to_monday',strengthCase('B3'));
runCase('B5_adds_load',strengthCase('B5'));
// B4 run correction.
runCase('B4_run_long_corrected',(t,cell)=>{
 const w=4,long=t.p.weeks[w].sessions.find(s=>L.live(s)&&s.sport==='RUN'&&s.role==='LONG'),others=t.p.weeks[w].sessions.filter(s=>L.live(s)&&s!==long);
 L.step(t,L.at(t.p,w,5,'21:00:00',{observations:others.map((s,i)=>({...L.obs(t.p,s),eventId:`p03-B4-o${i}`}))}));
 const o={...L.obs(t.p,long),eventId:'p03-long'},short={...o,actual:{completed:false,minutes:30}};
 if(cell==='CONTROL')L.step(t,L.at(t.p,w,6,'21:00:00',{observations:[short]}));
 else{L.step(t,L.at(t.p,w,6,'12:00:00',{observations:[o]}));L.step(t,L.at(t.p,w,6,'21:00:00',{observations:[{...short,eventId:'p03-long-fix',correctionOf:'p03-long',correctedAt:day(t,w,6,'20:00:00')}]}));}
 return {sat:long.id,run:true,cuts:{sunNoon:day(t,w,6,'13:00:00'),sunAfterReview:day(t,w,6,'22:00:00'),mon:day(t,w+1,0,'06:00:00')}};
});
out.allCasesAgree=Object.values(out.cases).every(c=>c.allAgree);
console.log(JSON.stringify(out,null,1));
