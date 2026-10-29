// Q10 (reviewer-owned): Founder P1/I8 on the clock the author's P1 test does not use. P51's history (weeks 5 and 6 executed but for Saturday's
// lift, reported day by day, never reviewed). At several clocks of week 6, each handler that brings no new fact is applied to a copy; history
// one day into week 7 (and a what-if return's entry) is compared with the control that received nothing. Same ledger in every cell.
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q10-noop-sweep',root:L.ROOT_USED,cells:[]};
const base=L.start('qe-q10',5);L.perDay(base,5,s=>!L.SAT(s));
for(const s of base.p.weeks[6].sessions.filter(s=>L.live(s)&&!L.SAT(s)&&s.day<6))L.step(base,L.at(base.p,6,s.day,'21:00:00',{observations:[L.obs(base.p,s)]}));
const nextW=base.p.weeks[7].startDate;
const handlers={
 EQUIPMENT_CHANGE:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK','KETTLEBELL']}},
 SCHEDULE_CHANGE_NEXT_WEEK:{kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}},
 GOAL_CHANGE_LATER:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'},from:base.p.weeks[9].startDate}},
 LOCAL_FATIGUE:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},
 UNAVAILABLE_DAY_NEXT_WEEK:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[L.addDays(nextW,2)]}},
 RECOVERED:{kind:'RECOVERED'},
 WEEKLY_REVIEW_NO_FACTS:{kind:'WEEKLY_REVIEW'},
};
const clocks=[[3,'12:00:00'],[6,'10:00:00'],[6,'22:00:00']];
const fp=t=>{const H=L.history(t,7,1);return {strength:Object.fromEntries(Object.entries(H.strength.exercises).map(([id,e])=>[id,`${e.mode}${e.lastExecutedLoad??''} tick ${e.earnedProgress.loadTick} step ${e.earnedProgress.stepEarned} lp ${e.lastPerformedAt}`])),run:JSON.stringify(H.run),basis:H.basis};};
const finish=t=>{L.step(t,L.at(t.p,7,0,'06:00:00',{observations:t.p.weeks[6].sessions.filter(s=>L.live(s)&&s.day===6).map(s=>({...L.obs(t.p,s),eventId:'q10-sun-'+s.id}))}));return t;};
const control=fp(finish(L.copy(base)));
for(const [day,hour] of clocks)for(const [name,h] of Object.entries(handlers)){
 const t=L.copy(base),r=L.evaluate(t,L.at(t.p,6,day,hour,h));
 if(!['UNSUPPORTED','HOLD'].includes(r.status)){t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
 finish(t);const f=fp(t),diff=Object.keys(f.strength).filter(id=>f.strength[id]!==control.strength[id]).map(id=>`${id}: ${control.strength[id]} -> ${f.strength[id]}`);
 out.cells.push({clock:`day${day} ${hour}`,handler:name,status:`${r.status}/${r.action}`,proposal:!!r.proposal,week7StrengthAuthority:t.p.weeks[7].startAuthority?.STRENGTH?.provenance,historyChanged:diff.length>0||f.run!==control.run,strengthDiff:diff,runChanged:f.run!==control.run});
}
out.control=control;out.changedCells=out.cells.filter(c=>c.historyChanged).map(c=>`${c.clock} ${c.handler}`);
console.log(JSON.stringify(out,null,1));
