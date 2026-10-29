// R7AF-QE-r1 P30b (independent engineering judge, R7A-FINAL-FREEZE): P30 widened. The same executed history (A's return Monday of week 5;
// Tue run + Wed lift executed; Thu-Sun of week 5 not executed, no weekly review), one unrelated decision X at a clock between the end of
// week 5 and B's start, then B (2 days) reported two days after it began. Each cell is compared with its control (the same B, no X).
// X: an equipment statement for a window three weeks later (a substitution there), the same with the full kit (KEEP, recorded), a strength
// session-length change, systemic fatigue, a strength goal change. Clocks: Sunday 06:00 of week 5 (before Sunday's long run), Sunday 10:00,
// and Monday 06:00 of week 6 (then B is Tue-Wed of week 6). Oracle (Founder 0.5, §10, I5, P5; contract §4): B's start state equals the
// control's, i.e. no return step that the athlete did not execute. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,afterA,reportOn,at,on,addDays,brk,lastR,dec,entryOf,stateSummary,strengthRows,runRows,print,copy} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P30b',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:[],tally:{cells:0,differs:0,runStepAhead:0,strengthStepAhead:0}};
const {t:base,d0}=afterA('qaf-p30b');reportOn(base,5,2,'21:00',s=>s.day<3);
const XS={
 equipmentWindow:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}),
 equipmentNoop:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}}),
 strengthMinutes:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}),
 systemicFatigue:()=>({kind:'SYSTEMIC_FATIGUE'}),
 goalChange:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})
};
const CLOCKS={sun0600:{d:addDays(d0,6),hm:'06:00',b:7},sun1000:{d:addDays(d0,6),hm:'10:00',b:7},mon0600:{d:addDays(d0,7),hm:'06:00',b:8}};
const steps=e=>({run:Number(/step (\d+)/.exec(e?.run??'')?.[1]??-1),strength:Object.fromEntries(Object.entries(e?.strength??{}).map(([k,v])=>[k,Number(/step (\d+)/.exec(v)?.[1]??-1)]))});
for(const [cn,c] of Object.entries(CLOCKS)){
 const B=t=>H.ev(t,on(t,addDays(d0,c.b+2),'06:00',brk(addDays(d0,c.b),addDays(d0,c.b+1))));
 const ctl=copy(base);B(ctl);const C=lastR(ctl.p),cE=entryOf(C);
 for(const [xn,mk] of Object.entries(XS)){
  const t=copy(base);H.ev(t,on(t,c.d,c.hm,mk()));const x=`${t.last.status}/${t.last.action} fromWeek ${t.last.proposal?.decisions.at(-1)?.fromWeek??'-'}`;
  const r=B(t),D=lastR(t.p),e=entryOf(D),sc=steps(cE),sx=steps(e);
  const runAhead=sx.run>sc.run,strAhead=Object.keys(sx.strength).filter(k=>sx.strength[k]>(sc.strength[k]??-1));
  const differs=JSON.stringify(e)!==JSON.stringify(cE);
  out.tally.cells++;if(differs)out.tally.differs++;if(runAhead)out.tally.runStepAhead++;if(strAhead.length)out.tally.strengthStepAhead++;
  out.cells.push({clock:cn,x:xn,xResult:x,B:r,stateAt:`${D.interruption.stateAt.kind}/w${D.interruption.stateAt.week}/${D.interruption.stateAt.eventId}`,control:`${C.interruption.stateAt.kind}/w${C.interruption.stateAt.week}/${C.interruption.stateAt.eventId}`,
   differs,runAhead,strengthAhead:strAhead,run:{cell:e.run,control:cE.run},
   rowsAfterB:{cell:[...runRows(t.p,weekOfB(t.p,c),addDays(d0,c.b+2)),...runRows(t.p,weekOfB(t.p,c)+1,addDays(d0,14))],control:[...runRows(ctl.p,weekOfB(ctl.p,c),addDays(d0,c.b+2)),...runRows(ctl.p,weekOfB(ctl.p,c)+1,addDays(d0,14))]}});
 }
}
function weekOfB(P,c){return Math.floor((Date.parse(addDays(d0,c.b+2))-Date.parse(P.startDate))/(7*864e5));}
print(out);
