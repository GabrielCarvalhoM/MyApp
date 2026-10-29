// R7AB-QE-r1 P47 (independent engineering judge): no-op handlers (Founder P1, I8) at every clock around a week boundary, on two bases:
//  RET: A's return (afterA), Tuesday's run and Wednesday's lift of the re-entry week executed, week 5 never reviewed; B Tue-Wed of week 6.
//  PRE: P40's history before any return, week 2 executed but Saturday's lift (unreviewed), week 3 the same and reviewed; B Tue-Wed of week 4.
// No-ops: the same equipment (no window), a full-kit window three weeks ahead (KEEP, recorded), the same strength minutes, the same goal,
// an unavailable date with no session, a local fatigue report with nothing optional left. Clocks: Sunday 11:00 and 13:00 (before / after the
// AM long run's shift is over), Sunday 22:00, Monday 06:00 of B's week. Oracle: B's start (last performed aside) equals the base's without the
// no-op. Prints only; synthetic data; DEV_TEST_ONLY authority.
import {H,at,obs,on,addDays,brk,lastR,afterA,reportOn,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const facts=st=>JSON.stringify({run:{...st.run,planned:undefined},strength:{...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))}});
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const bases={};
{const {t,d0}=afterA('qab-p47-ret');reportOn(t,5,2,'21:00',s=>s.day<3);bases.RET={t,w:5,bDay:addDays(d0,8)};}
{const miss=s=>s.sport==='STRENGTH'&&s.day===5,t=H.start({id:'qab-p47-pre'},2);perDay(t,2,s=>!miss(s));H.ev(t,at(t.p,3,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[2].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 perDay(t,3,s=>!miss(s));bases.PRE={t,w:3,bDay:addDays(t.p.weeks[4].startDate,1),sundayRunLate:true};}
const out={probe:'R7AB-QE-P47',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:[],violations:[]};
for(const [bn,b] of Object.entries(bases)){
 const B=t=>{H.ev(t,on(t,addDays(b.bDay,2),'06:00',brk(b.bDay,addDays(b.bDay,1))));return lastR(t.p);};
 const sun=addDays(b.t.p.weeks[b.w].startDate,6),mon=addDays(sun,1);
 const NOOP={sameEquipment:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}),fullKitWindow:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(sun,22),to:addDays(sun,25)}}),
  sameMinutes:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:60}}),sameGoal:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'STRENGTH'}}}),unavailableNoSession:d=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[d===sun?sun:addDays(mon,3)]}}),localFatigue:()=>({kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}})};
 const CLOCKS={sun1100:[sun,'11:00'],sun1300:[sun,'13:00'],sun2200:[sun,'22:00'],mon0600:[mon,'06:00']};
 const ctl=copy(b.t),C=B(ctl),cf=facts(C.interruption.entry);
 for(const [cn,[d,hm]] of Object.entries(CLOCKS))for(const [xn,mk] of Object.entries(NOOP)){
  const t=copy(b.t);const x=H.ev(t,on(t,d,hm,mk(d))),D=B(t),same=facts(D.interruption.entry)===cf;
  out.cells.push({base:bn,clock:cn,noop:xn,x,proposal:!!t.last&&x,point:`${D.interruption.stateAt.kind}/w${D.interruption.stateAt.week}`,control:`${C.interruption.stateAt.kind}/w${C.interruption.stateAt.week}`,same});
  if(!same)out.violations.push(`${bn} ${cn} ${xn} (${x}): B ${D.interruption.stateAt.kind}/w${D.interruption.stateAt.week} differs from the control ${C.interruption.stateAt.kind}/w${C.interruption.stateAt.week}`);
 }
}
out.tally={cells:out.cells.length,violations:out.violations.length};
print(out);
