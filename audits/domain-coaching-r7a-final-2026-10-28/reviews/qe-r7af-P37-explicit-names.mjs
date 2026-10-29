// R7AF-QE-r1 P37 (independent engineering judge, R7A-FINAL-FREEZE): explicit identity edges (Founder 0.4 order, §8; contract §3 rule 1).
// A = 16-day break reported Monday 06:00 of week 5 (default program), Tue run + Wed lift logged (A's re-entry executed).
//  E1 a later break (Thu-Fri) reported with A's identity: by rule 1 a correction of A that moves A after its own executed re-entry. What
//     identity, state point and dose follow? (compared with the same report unnamed, E0);
//  E2 the same with the event id of A's report as the name;  E3 a fresh name on A's own days (asked);  E4 a fresh name after the re-entry
//     (a new interruption with that name);  E5 after a separate break B, A's identity again (asked, B4);  E6 B corrected by its own name back
//     across A's re-entry (asked);  E7 the same name reused by the client for a new trip after B (rule 1: a correction of B).
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,at,on,addDays,brk,lastR,episodes,dec,entryOf,preBreakDose,strengthRows,runRows,print,copy,afterA,reportOn,peek} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P37',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
const {t:base,d0,A}=afterA('qaf-p37');reportOn(base,5,2,'21:00',s=>s.day<3);const Aid=A.interruption.episode;
const after=(t,from)=>({preBreakDose:[...preBreakDose(t.p,5,from),...preBreakDose(t.p,6,from)],runs:[...runRows(t.p,5,from),...runRows(t.p,6,from)].slice(0,6),strength:[...strengthRows(t.p,5,from),...strengthRows(t.p,6,from)].slice(0,6)});
const one=(name,extra)=>{const t=copy(base),s=H.ev(t,on(t,addDays(d0,5),'07:00',brk(addDays(d0,3),addDays(d0,4),extra)));out.cases[name]={s,missing:t.last.missingInputs,decision:s.includes('REESTABLISH')?dec(lastR(t.p)):null,episodes:episodes(t.p).length,entry:s.includes('REESTABLISH')?entryOf(lastR(t.p)):null,after:after(t,addDays(d0,5))};return t;};
one('E0_unnamed',{});one('E1_namedA',{episodeId:Aid});one('E2_namedAReport',{episodeId:A.eventId,reason:'Second trip'});one('E4_freshName',{episodeId:'trip-2'});
{const r=peek(base,on(base,addDays(d0,3),'07:00',brk(addDays(d0,-12),addDays(d0,-1),{episodeId:'trip-x'})));out.cases.E3_freshNameOnADays={status:r.status,missing:r.missingInputs};}
{const t=copy(base);H.ev(t,on(t,addDays(d0,5),'07:00',brk(addDays(d0,3),addDays(d0,4),{episodeId:'trip-2'})));
 const r5=peek(t,on(t,addDays(d0,5),'08:00',brk(addDays(d0,-16),addDays(d0,-1),{episodeId:Aid})));out.cases.E5_AafterB={status:r5.status,missing:r5.missingInputs};
 const r6=peek(t,on(t,addDays(d0,5),'08:00',brk(addDays(d0,-1),addDays(d0,4),{episodeId:'trip-2'})));out.cases.E6_BbackAcrossA={status:r6.status,missing:r6.missingInputs};
 reportOn(t,6,1,'21:00',s=>s.day<=1);const s7=H.ev(t,on(t,addDays(d0,12),'07:00',brk(addDays(d0,9),addDays(d0,11),{episodeId:'trip-2'})));
 out.cases.E7_nameReused={s:s7,decision:s7.includes('REESTABLISH')?dec(lastR(t.p)):null,episodes:episodes(t.p).length,entry:s7.includes('REESTABLISH')?entryOf(lastR(t.p)):null};}
print(out);
