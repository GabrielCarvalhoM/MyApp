// R7A2-QE-r1 P17 (independent engineering judge, R7A2-FREEZE-1): the identity rule against a SAME_BREAK correction reported late.
// interruptionEpisode reads a new report as SAME_BREAK when it "begins before that report and does not end before that break began". A
// correction of break A reported in a later week moves the latest live report day past A's re-entry, while A's dates stay. A separate break B
// that began after A's re-entry, and is reported after that correction, then begins before the latest report and ends after A began.
// Question (Founder §20, I1, I3): is B read as a break of its own, starting from A's re-entry, or as a correction of A?
// Oracle, as P13: after B (SHORT), no strength row at the pre-break dose (KNOWN load at 3 sets or more) and no long run above the re-entry
// length plus one step; B's relation is NEW (or ASK), never SAME_BREAK of A. Synthetic data, DEV_TEST_ONLY authority, prints only.
// Runs on the live runtime, or with QE_LIVE_ROOT on another copy (e.g. the byte-exact FREEZE-A2 copy).
import {runtime,make,at,obs,line,addDays,print} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const out={probe:'R7A2-QE-P17',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
const brk=(start,end,reason='Work travel')=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const rows=(P,w,from)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&s.date>=from);
const preBreak=(P,w,from)=>rows(P,w,from).filter(s=>s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='KNOWN'&&e.sets>=3).map(e=>`${s.id}:${e.id} ${e.sets}x${e.reps}@${e.rir}/KNOWN${e.load.value}`));
const longs=(P,w,from)=>rows(P,w,from).filter(s=>s.role==='LONG').map(s=>`${s.id} ${s.prescription.durationMinutes}`);
const dec=d=>d?{eventId:d.eventId,asOf:d.asOf,relation:d.interruption?.relation??null,episode:d.interruption?.episode??null,supersedes:d.interruption?.supersedes??null,start:d.interruption?.startDate,end:d.interruption?.endDate,class:d.interruption?.class,stateAt:d.interruption?.stateAt?{kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,eventId:d.interruption.stateAt.eventId}:null}:null;
const liveReturns=P=>{const all=P.decisions.filter(d=>d.action==='REESTABLISH'),gone=new Set(all.map(d=>d.interruption?.supersedes).filter(Boolean));return all.filter(d=>!gone.has(d.eventId)).map(d=>d.eventId);};
const strengthStart=(P,w)=>Object.fromEntries(Object.entries(P.stateTrace[w]?.strength?.exercises??{}).map(([id,e])=>[id,`${e.mode}${e.load??''} sets ${e.sets??'-'} step ${e.returnStep??'-'}`]));
const runStart=(P,w)=>{const r=P.stateTrace[w]?.run??{};return `${r.mode} easy ${r.easy} long ${r.long} step ${r.returnStep??'-'}`;};
/**
 * Weeks 0-2 trained, 3-4 not (break A, 16 days), A reported Monday 06:00 of week 5 (re-entry that week). Mon-Wed of week 5 executed and
 * reported. Break B: Thursday-Sunday of week 5 (4 days). Then, per case, a correction A' of break A (same dates, another reason, or one day
 * earlier) and B's report, in the order and at the clocks given.
 */
function scenario(name,{reviewW5=false,steps}){
 const t=H.start({id:'qa7a2-p17',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);
 H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);
 const w=5,d0=t.p.weeks[w].startDate,log=[];
 log.push('A '+H.ev(t,at(t.p,w,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1)))));const A=t.p.decisions.at(-1);
 const reentry={rows:line(t.p,w),longs:longs(t.p,w,d0)};
 if(reviewW5){H.weekly(t,w,s=>s.day<3);log.push('weekly w5 (Mon-Wed executed) '+t.last.status+'/'+t.last.action);}
 else log.push('Mon-Wed reported '+H.ev(t,at(t.p,w,3,'05:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day<3).map(s=>obs(t.p,s))})));
 const B0=addDays(d0,3),B1=addDays(d0,6),r=[];
 for(const st of steps){
  const x=st.what==='A_FIX'?brk(addDays(d0,st.shift?-17:-16),addDays(d0,-1),'Long work trip'):brk(B0,B1);
  const res=H.ev(t,at(t.p,st.w,st.day,st.hm,x));log.push(`${st.what} w${st.w}d${st.day} ${st.hm} ${res}`);r.push({what:st.what,result:res,decision:res.includes('REESTABLISH')?dec(t.p.decisions.at(-1)):null,missingInputs:t.last.missingInputs??[]});
 }
 const fromB=addDays(B1,1),wB=Math.floor((Date.parse(fromB)-Date.parse(t.p.startDate))/(7*864e5));
 const bad=[...preBreak(t.p,wB,fromB),...preBreak(t.p,wB+1,fromB)];
 const longAfter=[...longs(t.p,wB,fromB),...longs(t.p,wB+1,fromB)];
 out.cases[name]={log,A:dec(A),reentry,reports:r,liveReturns:liveReturns(t.p),afterB:{weekB:wB,rowsWeekB:line(t.p,wB),rowsNext:line(t.p,wB+1),strengthStartNext:strengthStart(t.p,wB+1),runStartNext:runStart(t.p,wB+1)},
  oracle:{preBreakDoseRows:bad,longRunsAfterB:longAfter,bRelation:r.find(x=>x.what==='B')?.decision?.relation??r.find(x=>x.what==='B')?.result}};
}
// L1: A' (same dates, another reason) on Monday 06:00 of week 6, then B on Monday 07:00.
scenario('L1_fixMon_then_B',{steps:[{what:'A_FIX',w:6,day:0,hm:'06:00'},{what:'B',w:6,day:0,hm:'07:00'}]});
// L2: as L1 with the week-5 review on Sunday 21:00 (Mon-Wed executed).
scenario('L2_reviewed_fixMon_then_B',{reviewW5:true,steps:[{what:'A_FIX',w:6,day:0,hm:'06:00'},{what:'B',w:6,day:0,hm:'07:00'}]});
// L3: A' made during B (Friday 12:00 of week 5), B reported on Monday 07:00 of week 6.
scenario('L3_fixDuringB_then_B',{steps:[{what:'A_FIX',w:5,day:4,hm:'12:00'},{what:'B',w:6,day:0,hm:'07:00'}]});
// L4: A' moves A's first day one day earlier (a real correction), Monday 06:00 of week 6, then B.
scenario('L4_fixShift_then_B',{steps:[{what:'A_FIX',w:6,day:0,hm:'06:00',shift:true},{what:'B',w:6,day:0,hm:'07:00'}]});
// Controls: B before A' (A' is then asked), and B alone.
scenario('C1_B_then_fix',{steps:[{what:'B',w:6,day:0,hm:'06:00'},{what:'A_FIX',w:6,day:0,hm:'07:00'}]});
scenario('C2_B_only',{steps:[{what:'B',w:6,day:0,hm:'07:00'}]});
print(out);
