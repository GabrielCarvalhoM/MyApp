// R7AF-QE-r1 P30 (independent engineering judge, R7A-FINAL-FREEZE): the "earned week" rule of executedStateAt (contract §4; stateAtBreak
// `earned`). After A's return, a later week's planned start is the state point of a separate interruption B only when it was earned: A's
// return set it, "a decision re-planned it after the week before was over (the weekly review's rule)", or the week before was executed as
// planned. The code accepts ANY decision with fromWeek <= k made on or after the last day of week k-1 and before B began.
// Question (Founder 0.5, §10, I5, P5): does an unrelated decision between A's re-entry week and B (an equipment statement, a schedule change,
// fatigue, an unavailable day, a goal change) change the state B starts from, against the same executed history without it?
// Setup = the author's own test "R7-A final P5 (cross week)": A (16 days) reported Monday 06:00 of week 5; Tue run + Wed lift executed and
// reported Wednesday 21:00; Thu-Sun of week 5 neither executed nor reviewed. B = Mon-Tue of week 6, reported Wednesday 06:00 of week 6.
// Variant X: one more review on Sunday of week 5 (before B began). Oracle: B's stateAt and entry equal the control's (no X), except where X
// is the weekly review itself (the declared earned case). Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,afterA,reportOn,at,on,addDays,brk,lastR,dec,entryOf,stateSummary,strengthRows,runRows,print,copy} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P30',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{},summary:[]};
const {t:base,d0,A}=afterA('qaf-p30');reportOn(base,5,2,'21:00',s=>s.day<3);
const X={
 none:null,
 weeklyReviewSunday:t=>at(t.p,5,6,'21:00',{kind:'WEEKLY_REVIEW',observations:[]}),
 equipmentWindowLater:t=>at(t.p,5,6,'10:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}),
 equipmentWindowAllKit:t=>at(t.p,5,6,'10:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}}),
 scheduleMinutes:t=>at(t.p,5,6,'10:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}),
 scheduleTurn:t=>at(t.p,5,6,'10:00',{kind:'SCHEDULE_CHANGE',changes:{runTurn:'PM'}}),
 systemicFatigue:t=>at(t.p,5,6,'10:00',{kind:'SYSTEMIC_FATIGUE'}),
 localFatigue:t=>at(t.p,5,6,'10:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
 unavailableLater:t=>at(t.p,5,6,'10:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(d0,17)]}}),
 goalChange:t=>at(t.p,5,6,'10:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
 missedThuSat:t=>null // handled below: MISSED_SESSION of Thursday's run and Saturday's lift, each reported that evening
};
for(const [name,mk] of Object.entries(X)){
 const t=copy(base),log=[];let xr=null;
 if(name==='missedThuSat'){
  for(const s of t.p.weeks[5].sessions.filter(s=>s.prescription&&[3,5].includes(s.day))){H.ev(t,at(t.p,5,s.day,'22:00',{kind:'MISSED_SESSION',targetSessionId:s.id}));log.push(`MISSED ${s.id} ${t.last.status}/${t.last.action} fromWeek ${t.last.proposal?.decisions.at(-1)?.fromWeek??'-'}`);}
 }else if(mk){const rv=mk(t);H.ev(t,rv);xr=t.last;log.push(`${rv.event.kind} ${xr.status}/${xr.action} fromWeek ${xr.proposal?.decisions.at(-1)?.fromWeek??'-'}`);}
 const start6=stateSummary(t.p.stateTrace[6]);
 const r=H.ev(t,on(t,addDays(d0,9),'06:00',brk(addDays(d0,7),addDays(d0,8))));const B=lastR(t.p);
 out.cases[name]={log,week6PlannedStartBeforeB:start6,B:r,Bdecision:r.includes('REESTABLISH')?dec(B):null,Bentry:r.includes('REESTABLISH')?entryOf(B):null,
  week6After:[...runRows(t.p,6,addDays(d0,9)),...strengthRows(t.p,6,addDays(d0,9))],week7:[...runRows(t.p,7,addDays(d0,14)),...strengthRows(t.p,7,addDays(d0,14))]};
}
const ctl=out.cases.none;
for(const [name,c] of Object.entries(out.cases)){
 const sameEntry=JSON.stringify(c.Bentry)===JSON.stringify(ctl.Bentry),samePoint=JSON.stringify(c.Bdecision?.stateAt)===JSON.stringify(ctl.Bdecision?.stateAt);
 out.summary.push({name,x:c.log.join(' | ')||'-',B:c.B,stateAt:c.Bdecision?.stateAt?`${c.Bdecision.stateAt.kind}/w${c.Bdecision.stateAt.week}/${c.Bdecision.stateAt.eventId}`:null,samePointAsControl:samePoint,sameEntryAsControl:sameEntry,run:c.Bentry?.run??null});
}
print(out);
