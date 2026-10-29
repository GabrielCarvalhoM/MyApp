// R7AF-QE-r1 probe helpers (independent engineering judge, R7A-FINAL-FREEZE). Thin layer over the earlier judges' read-only helpers
// (audits/domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs): synthetic data, DEV_TEST_ONLY authority, the live runtime loaded read-only
// (or QE_LIVE_ROOT, e.g. ../freeze1-source/CoachingCore), nothing written outside stdout.
import {runtime,make,at,obs,line,addDays,print,localAt,tzOf} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
export {at,obs,line,addDays,print,localAt,tzOf};
export const RT=await runtime('A1'),H=make(RT),R=RT.R,opts=RT.opts;
export const live=s=>s.prescription&&s.status!=='SKIPPED';
export const brk=(start,end,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
export const returns=P=>P.decisions.filter(d=>d.action==='REESTABLISH');
export const lastR=P=>returns(P).at(-1);
export const episodes=P=>[...new Set(returns(P).map(d=>d.interruption?.episode??d.eventId))];
export const weekOfDay=(P,d)=>Math.floor((Date.parse(d)-Date.parse(P.startDate))/(7*864e5));
export const dayIn=(P,d)=>(Date.parse(d)-Date.parse(P.weeks[weekOfDay(P,d)].startDate))/864e5;
/** A review on local date d at local time hm (the week index derived from the date). */
export const on=(t,d,hm,x)=>at(t.p,weekOfDay(t.p,d),dayIn(t.p,d),hm,x);
/** Evaluate without applying (a what-if), or apply (step). */
export const peek=(t,review)=>R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
export const step=(t,review)=>{const s=H.ev(t,review);return {s,r:t.last};};
/** Report sessions of week w as executed, at local day/hour, with `keep` choosing them. */
export const reportOn=(t,w,day,hm,keep,kind='WEEKLY_REVIEW')=>H.ev(t,at(t.p,w,day,hm,{kind,observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
export const dec=d=>d?{eventId:d.eventId,asOf:d.asOf,fromWeek:d.fromWeek,relation:d.interruption?.relation??null,basis:d.interruption?.basis??null,episode:d.interruption?.episode??null,revision:d.interruption?.revision??null,supersedes:d.interruption?.supersedes??null,start:d.interruption?.startDate,end:d.interruption?.endDate,class:d.interruption?.class,stateAt:d.interruption?.stateAt?{kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,eventId:d.interruption.stateAt.eventId,sameDay:!!d.interruption.stateAt.sameDay,reportedAfterStart:!!d.interruption.stateAt.reportedAfterStart}:null}:null;
/** A compact reading of a start state: run mode/step/minutes; per exercise its mode, load, sets, return step and ceiling. */
export const stateSummary=st=>st?{run:`${st.run?.mode} step ${st.run?.returnStep??'-'} easy ${st.run?.easy??'-'} long ${st.run?.long??'-'}`,strength:Object.fromEntries(Object.entries(st.strength?.exercises??{}).sort().map(([id,e])=>[id,`${e.mode??'-'}${e.load??''} sets ${e.sets??'-'} step ${e.returnStep??'-'} ceil ${e.setCeiling??'-'}`]))}:null;
export const entryOf=d=>stateSummary(d?.interruption?.entry);
/** Strength rows (exercise-level) and long runs of week w from local date `from`. */
export const strengthRows=(P,w,from)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from).flatMap(s=>s.prescription.exercises.map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}${e.exposure?.kind?' '+e.exposure.kind:''}`));
export const runRows=(P,w,from)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from).map(s=>`${s.date} ${s.role} ${s.prescription.family}:${s.prescription.durationMinutes}${s.easedFor?' easedFor '+s.easedFor:''}`);
export const preBreakDose=(P,w,from)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='KNOWN'&&e.sets>=3).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir}/KNOWN${e.load.value}`));
/** The default synthetic program (runs Tue/Thu/Sun AM, strength Wed/Sat PM), weeks 0-2 trained and reviewed, 3-4 untrained, then A: a 16-day
 * break reported Monday 06:00 of week 5 (re-entry that week). `o` overrides the intake (tz, schedule, athlete). */
export function afterA(id,o={}){
 const t=H.start({id,schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6},...o},3);H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);
 const d0=t.p.weeks[5].startDate;H.ev(t,at(t.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1))));
 return {t,d0,A:lastR(t.p)};
}
export const copy=t=>({p:t.p,ledger:t.ledger});
