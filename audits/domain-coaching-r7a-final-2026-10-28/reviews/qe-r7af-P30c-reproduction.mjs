// R7AF-QE-r1 P30c: minimal reproduction of QE-R7AF-01 (independent engineering judge, R7A-FINAL-FREEZE). Every input is an ordinary synthetic
// review accepted through evaluateProgram; DEV_TEST_ONLY authority; prints only.
//  1. A: a 16-day break (Sat 2026-11-21 to Sun 12-06) reported Monday 12-07 06:00 (week 5): re-entry this week (A's return also stores the
//     conditional start of week 6: return step 1).
//  2. Tue run and Wed lift executed and reported Wednesday 21:00; Thu-Sun not executed; week 5 not reviewed.
//  3. X (one of): nothing (control) | an equipment statement for a window three weeks later, Monday 12-14 06:00 | the same with the full kit
//     (recorded, KEEP) | systemic fatigue, Monday 06:00.
//  4. B: a separate 2-day trip, Tue 12-15 to Wed 12-16, reported Thursday 12-17 06:00.
// Prints B's identity, its state point, its start against A's stored week-6 start, and the run/strength rows that follow.
import {H,afterA,reportOn,on,addDays,brk,lastR,dec,stateSummary,strengthRows,runRows,print,copy} from './qe-r7af-lib.mjs';
const {t:base,d0,A}=afterA('qaf-p30c');reportOn(base,5,2,'21:00',s=>s.day<3);
const storedByA=base.p.stateTrace[6];
// Bookkeeping fields of a planned week (planned, entryWeek) are not state: they are left out of the comparison.
const strip=st=>JSON.stringify({run:st.run,strength:{...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).map(([k,{lastPerformed,...e}])=>[k,e]))}});
const X={control:null,equipmentWindow:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}},equipmentFullKit:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}},systemicFatigue:{kind:'SYSTEMIC_FATIGUE'}};
const out={probe:'R7AF-QE-P30c',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',A:dec(A),storedByAForWeek6:stateSummary(storedByA),cases:{}};
for(const [n,x] of Object.entries(X)){
 const t=copy(base);let xs=null;if(x){xs=H.ev(t,on(t,addDays(d0,7),'06:00',x));}
 const s=H.ev(t,on(t,addDays(d0,10),'06:00',brk(addDays(d0,8),addDays(d0,9))));const B=lastR(t.p),e=B.interruption.entry;
 out.cases[n]={X:xs,B:s,identity:{relation:B.interruption.relation,basis:B.interruption.basis,sameAsA:B.interruption.episode===A.interruption.episode},stateAt:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}/${B.interruption.stateAt.eventId??'-'}`,
  startEqualsStoredByA:strip(e)===strip(storedByA),start:stateSummary(e),
  week6:[...runRows(t.p,6,addDays(d0,10)),...strengthRows(t.p,6,addDays(d0,10))],week7:[...runRows(t.p,7,addDays(d0,14)),...strengthRows(t.p,7,addDays(d0,14))]};
}
print(out);
