// QE probe H (C16 class, branch asymmetry): R7-A validates changes.from/to for SCHEDULE_CHANGE (ASK on a malformed or inverted date),
// but EQUIPMENT_CHANGE stores any string as a dated window and compares dates as strings. A malformed `to` is "later" than every date,
// so a change stated as temporary is applied to the end of the program; an inverted window is accepted and does nothing.
import {cur,opts,intake,review,rows,out} from './qe-lib.mjs';
const R=cur;
const p=R.generateProgram(intake({id:'qe-H',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const W=2,from=p.weeks[3].startDate,validTo=p.weeks[3].sessions.at(-1).date;
const barbellWeeks=P=>P.weeks.map((wk,i)=>[i,rows(P,i).some(x=>x.e.equipment.includes('BARBELL'))]).filter(([i])=>i>=3).map(([i,b])=>`w${i}:${b?'barbell':'substituted'}`);
const eq=to=>{const r=R.evaluateProgram(p,review(p,W,{day:0,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from,to}}),opts);return {to,status:r.status,action:r.action,window:r.proposal?.canonical?.equipmentWindows??null,weeks:r.proposal?barbellWeeks(r.proposal):null,reason:r.reason};};
const sch=to=>{const r=R.evaluateProgram(p,review(p,W,{day:0,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3],from,to}}),opts);return {to,status:r.status,action:r.action,missingInputs:r.missingInputs};};
out('H',{original:barbellWeeks(p),equipmentChange:{validWindow:eq(validTo),malformedTo:eq('soon'),impossibleDate:eq('2026-13-45'),invertedWindow:eq('2026-11-01')},
 scheduleChangeSameDates:{malformedTo:sch('soon'),invertedWindow:sch('2026-11-01')}});
