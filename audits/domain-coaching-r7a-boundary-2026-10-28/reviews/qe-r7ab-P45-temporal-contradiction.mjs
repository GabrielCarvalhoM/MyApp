// R7AB-QE-r1 P45 (independent engineering judge): Founder §11 / I7 by my own cases. A (afterA: 11-21..12-06, reported Monday 12-07 06:00);
// Tuesday's run (12-08) and Wednesday's lift (12-09) of the re-entry executed and reported Wednesday 21:00. Named corrections of A (its
// episodeId), each evaluated without applying:
//  C1 the end moved onto the executed Tuesday (12-08);            C2 moved after the re-entry with a startedAt (12-10 09:00 to 12-11);
//  C3 days only (18), no dates, sent Friday (end = Thursday);     C4 the start moved earlier (11-14), nothing after the re-entry crossed;
//  C5 the end moved back to Saturday 12-05 (shorter, consistent);  C6 by A's report id, the end on Wednesday 12-09;
//  C7 the same correction as C1 sent before any re-entry training (the re-entry week not yet executed): applies (no contradiction).
// Expected (contract §5): C1, C2, C3, C6 asked (interruption.startDate/endDate); C4, C5, C7 applied. Prints only; DEV_TEST_ONLY.
import {H,at,on,addDays,brk,lastR,afterA,reportOn,print,copy,peek,dec} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const {t:base,d0,A}=afterA('qab-p45');const before=copy(base);reportOn(base,5,2,'21:00',s=>s.day<3);
const ep=A.interruption.episode,named=(s,e,x={})=>brk(s,e,{episodeId:ep,...x});
const C={
 C1_endOntoTuesday:[base,addDays(d0,4),'06:00',named(addDays(d0,-16),addDays(d0,1))],
 C2_afterReentryStartedAt:[base,addDays(d0,4),'06:00',named(addDays(d0,3),addDays(d0,4),{startedAt:`${addDays(d0,3)}T09:00:00Z`})],
 C3_daysOnlyFriday:[base,addDays(d0,4),'06:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:18,reasonCategory:'TRAVEL',reason:'Work travel',episodeId:ep}}],
 C4_startEarlier:[base,addDays(d0,4),'06:00',named(addDays(d0,-23),addDays(d0,-1))],
 C5_endEarlier:[base,addDays(d0,4),'06:00',named(addDays(d0,-16),addDays(d0,-2))],
 C6_byReportIdEndWednesday:[base,addDays(d0,4),'06:00',brk(addDays(d0,-16),addDays(d0,2),{episodeId:A.eventId})],
 C7_endOntoTuesdayBeforeTraining:[before,addDays(d0,1),'05:00',named(addDays(d0,-16),addDays(d0,0))]
};
const out={probe:'R7AB-QE-P45',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
for(const [n,[t,d,hm,x]] of Object.entries(C)){const r=peek(t,on(t,d,hm,x));out.cases[n]={status:`${r.status}/${r.action}`,missing:r.missingInputs,reason:r.reason?.slice(0,160)??null,decision:r.proposal?dec(lastR(r.proposal)):null};}
print(out);
