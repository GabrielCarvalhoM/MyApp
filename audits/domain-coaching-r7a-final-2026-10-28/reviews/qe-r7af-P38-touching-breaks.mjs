// R7AF-QE-r1 P38 (independent engineering judge, R7A-FINAL-FREEZE): breaks that touch, with no training between, and training recorded only by
// a late log (Founder 0.3/0.4/I9; contract §3 rules 4-5, boundaries B5/B6).
//  T1 A (16 days to Sunday) reported Monday 20:00; B Mon-Tue with a stated start Monday 08:00, i.e. before A's report: identity and point?
//  T2 the same with dates only (B5: a report made on a break's first day precedes it);
//  T3 A reported only on Tuesday (after B began Monday), B Mon-Tue reported Wednesday: dates touch, no re-entry, no training -> asked;
//  T5 A (Mon-Tue of week 3) reported Saturday; B (Thu-Fri) reported Sunday 06:00 with Wednesday's training not yet logged -> asked; Wednesday
//     logged Sunday 07:00 (late; is the latest return asked to be confirmed?); B again Sunday 08:00 -> a new break (training between).
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,at,on,obs,addDays,brk,lastR,dec,entryOf,print,copy,reportOn,live,localAt,tzOf} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P38',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
const pre=id=>{const t=H.start({id,schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);return {t,d0:t.p.weeks[5].startDate};};
for(const [name,{aDay,aHm,bExtra}] of Object.entries({T1:{aDay:0,aHm:'20:00',bExtra:d0=>({startedAt:localAt(d0,'08:00',0)})},T2:{aDay:0,aHm:'20:00',bExtra:()=>({})},T3:{aDay:1,aHm:'07:00',bExtra:()=>({})}})){
 const {t,d0}=pre('qaf-p38-'+name);const a=H.ev(t,at(t.p,5,aDay,aHm,brk(addDays(d0,-16),addDays(d0,-1))));const A=lastR(t.p);
 const s=H.ev(t,at(t.p,5,2,'07:00',brk(d0,addDays(d0,1),bExtra(d0))));
 out.cases[name]={A:a,B:s,missing:t.last.missingInputs,Bdec:s.includes('REESTABLISH')?dec(lastR(t.p)):null,Bstart:s.includes('REESTABLISH')?entryOf(lastR(t.p)).run:null,Aentry:entryOf(A).run};
}
{const t=H.start({id:'qaf-p38-t5'},3),w=3,e0=t.p.weeks[w].startDate;
 const a=H.ev(t,at(t.p,w,5,'06:00',brk(e0,addDays(e0,1))));const A=lastR(t.p);
 const b1=H.ev(t,at(t.p,w,6,'06:00',brk(addDays(e0,3),addDays(e0,4))));const m1=t.last.missingInputs;
 const wed=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===2);
 const lg=H.ev(t,at(t.p,w,6,'07:00',{kind:'PARTIAL_SESSION',observations:wed.map(s=>obs(t.p,s))}));const m2=t.last.missingInputs;
 const b2=H.ev(t,at(t.p,w,6,'08:00',brk(addDays(e0,3),addDays(e0,4))));
 out.cases.T5={A:a,Bfirst:b1,BfirstMissing:m1,lateLog:lg,lateLogMissing:m2,Bagain:b2,Bdec:b2.includes('REESTABLISH')?dec(lastR(t.p)):null};}
print(out);
