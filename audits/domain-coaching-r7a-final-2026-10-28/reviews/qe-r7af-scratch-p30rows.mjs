// R7AF-QE-r1 scratch: the strength rows after B in the P30b Monday cells (equipment no-op, systemic fatigue) against the control. Prints only.
import {H,afterA,reportOn,on,addDays,brk,lastR,strengthRows,runRows,print,copy,entryOf} from './qe-r7af-lib.mjs';
const {t:base,d0}=afterA('qaf-p30b');reportOn(base,5,2,'21:00',s=>s.day<3);
const B=t=>H.ev(t,on(t,addDays(d0,10),'06:00',brk(addDays(d0,8),addDays(d0,9))));
const res={};
for(const [n,x] of Object.entries({control:null,equipmentNoop:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}},systemicFatigue:{kind:'SYSTEMIC_FATIGUE'}})){
 const t=copy(base);if(x)H.ev(t,on(t,addDays(d0,7),'06:00',x));const s=B(t);
 res[n]={B:s,stateAt:lastR(t.p).interruption.stateAt.kind+'/w'+lastR(t.p).interruption.stateAt.week,entry:entryOf(lastR(t.p)),week6:[...runRows(t.p,6,addDays(d0,10)),...strengthRows(t.p,6,addDays(d0,10))],week7:[...runRows(t.p,7,addDays(d0,14)),...strengthRows(t.p,7,addDays(d0,14))]};
}
print(res);
