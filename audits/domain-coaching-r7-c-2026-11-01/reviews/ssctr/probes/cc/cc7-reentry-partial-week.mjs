// SSCTR CC recheck, probe CC7 (item 3, a population CC4-R found): the week after a re-entry week that was partly reported. The ceiling re-plan
// reads the window before the week; if it still holds earlier known misses or a declared break, and the re-entry week's easy runs were executed a
// little short with the long run unreported or not done, what does it re-plan to, against the same facts on the reviewed path?
// Families:
//  RET  a short declared break (6 days) after weeks 0-4 with their runs reported not done; return on day 6 of week 5 with a current demonstration
//       (25 or 40 minutes); re-entry week 6.
//  KM   a known stop reported on time (weeks 2-5 runs not done at their reviews, GEN), so week 6 is the known-miss entry; weeks 6-7 executed and
//       reviewed (entry progression); re-entry-progression week 8.
// The partly reported week W: easy runs executed at prescription minus 0, 5 or 10 minutes, the long run UNREPORTED, NOT_DONE or EXECUTED.
// Paths, same facts: LATE (week W's review skipped; the facts arrive with the first decision of week W+1, plain day 0), MID (the facts reported on
// day 6 12:00 of week W, review skipped, then the plain day-0 decision), REVIEWED (week W's own review at day 6 21:00 with the facts, then the
// plain day-0 decision). Per cell: week W+1 in force after the day-0 decision on HEAD and R7C-FREEZE-1, the policy ceiling on the ledger (no
// demonstration) and with the demonstration where it is in the window, and whether HEAD's re-plan lands below that ceiling and below the
// reviewed path. Read-only; prints JSON.
import {runtimes,kit,VALID,FREEZE_1,R7B2} from './cc-lib.mjs';
const {rt,cleanup}=await runtimes([['F1',FREEZE_1],['B2',R7B2]]);
const out={check:'SSCTR-CC7-REENTRY-PARTIAL-WEEK',runtimes:Object.keys(rt),cells:[]};
const CEILING=/exceed what the recorded runs allow/;
const runsAll=(K,P,w)=>K.runsOf(P,w,0).join('/');
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H;
 const demo=(day,minutes)=>({observedAt:`${H.addDays(day,-1)}T07:00:00Z`,sport:'RUN',family:'EASY',minutes,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'});
 const builds={};
 for(const demoMin of [25,40])builds[`RET demo ${demoMin}`]=()=>{const t={p:H.program({id:'cc7-r',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}}),ledger:[],ref:null};
  for(let w=0;w<5;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>s.sport==='RUN'?K.notDone(t.p,s):H.obs(t.p,s))});
  const start=t.p.weeks[5].startDate;K.step(t,5,{day:6,hour:'12:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:H.addDays(start,5),days:6,reasonCategory:'TRAVEL',nonclinical:true},currentDemonstration:demo(H.addDays(start,6),demoMin)});
  return {t,W:6,demoDate:H.addDays(start,5),demoMin};};
 builds['KM GEN']=()=>{const t={p:H.program({id:'cc7-k',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}}),ledger:[],ref:null};
  for(let w=0;w<2;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
  for(let w=2;w<6;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>s.sport==='RUN'?K.notDone(t.p,s):H.obs(t.p,s))});
  for(let w=6;w<8;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
  return {t,W:8,demoDate:null,demoMin:null};};
 for(const [bk,build] of Object.entries(builds))for(const short of [0,5,10])for(const longFact of ['UNREPORTED','NOT_DONE','EXECUTED'])for(const path of ['LATE','MID','REVIEWED']){
  let b;try{b=build();}catch(e){out.cells.push({label,key:`${bk}`,error:e.message});continue;}
  const {t,W}=b,P=t.p,easy=P.weeks[W].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.role!=='LONG'),long=P.weeks[W].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.role==='LONG');
  const facts=[...easy.map(s=>H.obs(P,s,{minutes:Math.max(10,s.prescription.durationMinutes-short)})),...(longFact==='NOT_DONE'?long.map(s=>K.notDone(P,s)):longFact==='EXECUTED'?long.map(s=>H.obs(P,s)):[]),...K.strengthOf(P,W)];
  const weekW=runsAll(K,P,W),stored=runsAll(K,P,W+1);let r;
  try{
   if(path==='MID')K.step(t,W,{day:6,hour:'12:00:00',observations:facts});
   if(path==='REVIEWED')K.step(t,W,{observations:facts});
   r=K.step(t,W+1,{day:0,hour:'07:00:00',observations:path==='LATE'?facts:[]});
  }catch(e){out.cells.push({label,key:`${bk} short ${short} long ${longFact} ${path}`,error:e.message});continue;}
  const inForce=runsAll(K,r.proposal??t.p,W+1),ceilNoDemo=K.factualCeiling({...t,p:r.proposal??t.p},W+1);
  const demoInWindow=b.demoDate&&(Date.parse(P.weeks[W+1].startDate)-Date.parse(b.demoDate))/864e5<=K.C.windowDays;
  const ceilDemo=demoInWindow?Math.max(ceilNoDemo,b.demoMin+K.C.stepMinutes):ceilNoDemo;
  out.cells.push({label,key:`${bk} short ${short} long ${longFact} ${path}`,weekW,stored,decision:`${r.status}/${r.action??''}/${r.planValidity?.status===VALID?'VALID':r.planValidity?.status}${CEILING.test(r.reason??'')?'/CEILING':''}`,weekW1:inForce,ceilingLedger:ceilNoDemo,ceilingWithDemo:ceilDemo});
 }
}
cleanup();
// Summary: per key, HEAD vs F1 vs B2 and the REVIEWED path on HEAD.
const by={};for(const c of out.cells){if(c.error)continue;(by[c.key]??={})[c.label]=c;}
out.summary=Object.entries(by).map(([key,v])=>{const rev=by[key.replace(/ (LATE|MID|REVIEWED)$/,' REVIEWED')]?.HEAD;return {key,HEAD:v.HEAD&&`${v.HEAD.decision} ${v.HEAD.weekW1}`,F1:v.F1&&`${v.F1.decision} ${v.F1.weekW1}`,B2:v.B2&&`${v.B2.decision} ${v.B2.weekW1}`,reviewedHEAD:rev&&rev.weekW1,ceilingLedger:v.HEAD?.ceilingLedger,ceilingWithDemo:v.HEAD?.ceilingWithDemo,weekW:v.HEAD?.weekW,stored:v.HEAD?.stored};});
console.log(JSON.stringify(out,null,1));
