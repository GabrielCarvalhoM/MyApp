// Q07 (cycle recheck): a short declared break after a return week with no executed session vs the same days spent waiting (NB-3 path).
import {timeline,HYBRID,KNOWN,NO,XNO,doneWeek,reviewWeeks,ladder,live,addDays} from './h.mjs';
const rows=(t,w,from)=>t.p.weeks[w].sessions.filter(s=>live(s)&&!s.optional&&s.date>=(from??t.day(w,0))).map(s=>s.sport==='RUN'?s.role+':'+s.prescription.durationMinutes:'S:'+s.prescription.exercises.reduce((a,e)=>a+e.sets,0)+'@'+Math.min(...s.prescription.exercises.map(e=>e.rir))).join(' ');
const lastExec=t=>t.ledger.filter(o=>o.actual?.completed||Number(o.actual?.minutes)>0).map(o=>o.occurrenceDate).filter(Boolean).sort().at(-1);
for(const [label,checkDay,speed] of [['answered check (FASTER), R3 week unexecuted',[1,6],'FASTER'],['answered check (BALANCED), R2 week unexecuted',[1,6],'BALANCED'],['no check: waited',null,'FASTER']]){
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:5,returnSpeed:speed}},'07:00');
 if(checkDay)t.step(checkDay[0],checkDay[1],'WELLBEING_CHECK',{check:{warningSigns:NO('NEED_REST'),improved:true}},'09:00');
 const r=t.step(3,2,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(3,0),endDate:t.day(3,1),reasonCategory:'TRAVEL',nonclinical:true}},'07:00');
 const i=t.p.decisions.at(-1).interruption??{};const le=lastExec(t),gap=le?Math.round((Date.parse(t.day(3,2))-Date.parse(le))/864e5)-1:null;
 console.log(`== ${label}: ${r.status} ${r.action} class ${i.class} bySport ${JSON.stringify(i.classBySport??null)} days ${i.days} | last executed session ${le} -> ${gap} days without training before ${t.day(3,2)}`);
 console.log(`   week 3 from Wed: ${rows(t,3,t.day(3,2))} | week 4 planned: ${rows(t,4)} | ladder wk3 ${JSON.stringify(ladder(t.p,3))} wk4 ${JSON.stringify(ladder(t.p,4))}`);
 const n=t.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(t,3).filter(o=>t.p.weeks[3].sessions.some(s=>s.id===o.sessionId&&s.date>=t.day(3,2))),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}},'20:00');
 console.log(`   after the week-3 review (${n.status} ${n.action}): week 4 ${rows(t,4)} | held doses (week 0): ${rows(t,0)}`);
}
