// R7AF-QE-r1 P30d (independent engineering judge, R7A-FINAL-FREEZE): the third clause of the "earned" rule ("the week before was executed as
// planned") counts attendance only. A (16 days) reported Monday of week 5; every session of week 5 executed and logged by Sunday 12:00, with an
// adverse response (performance UNDER, recovery ADVERSE, effort HARDER, next day IMPAIRED) or a compatible one; week 5 not reviewed (or
// reviewed Sunday 21:00, for reference). B = Mon-Tue of week 6, reported Wednesday 06:00. Question (§10 "progresso não conquistado", P5): does B
// start from the step the weekly review would have held? Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,afterA,at,on,obs,addDays,brk,lastR,stateSummary,print,copy,live} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P30d',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
const HARD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
for(const resp of ['adverse','compatible'])for(const reviewed of [false,true]){
 const {t,d0}=afterA(`qaf-p30d-${resp}`);
 H.ev(t,at(t.p,5,6,'12:00',{kind:'PARTIAL_SESSION',observations:t.p.weeks[5].sessions.filter(live).map(s=>{const o=obs(t.p,s);return resp==='adverse'?{...o,response:{...HARD}}:o;})}));const logged=t.last.status+'/'+t.last.action;
 if(reviewed)H.weekly(t,5,()=>false);
 const s=H.ev(t,on(t,addDays(d0,9),'06:00',brk(addDays(d0,7),addDays(d0,8))));const B=lastR(t.p);
 out.cases[`${resp}/${reviewed?'reviewed':'unreviewed'}`]={logged,reviewW6Start:reviewed?stateSummary(t.p.stateTrace[6]):null,B:s,stateAt:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,start:stateSummary(B.interruption.entry)};
}
print(out);
