// Recheck probe RC-P2: the reach of the ceiling re-plan beyond the reproduced findings, F1 (R7C-FREEZE-1) against F2 (R7C-FREEZE-2).
// Timelines per class (run sessions only vary; strength is always executed when reported):
//  NEVER          no report at all; decisions at day 0 of week W (plain review, schedule change) — the class the request names;
//  EMPTY_REVIEWS  the same facts with every end-of-week review made, nothing reported: the on-time reading of NEVER;
//  KNOWN_MISS     weeks 0-1 executed; from week 2 every run reported not done at the week's own review (strength executed); mid-week decisions;
//  ONE_MISS       every session executed except one easy run a week reported not done, reviewed on time; mid-week decisions;
//  ONE_UNREP      the same with that easy run unreported;
//  SKIPPED        every session reported executed day by day, end-of-week reviews of weeks 2-3 skipped (no credit: nothing unexecuted);
//  SKIPPED_UNREP  the same with one easy run a week unreported and those reviews skipped; ON_TIME_UNREP is it with the reviews made.
// For each decision: status, validity, ceiling reason, the runs of its week still ahead and of the next week, and whether strength rows from
// the decision's week changed (the re-plan re-composes every sport). Read-only; prints JSON.
import {RUNTIMES,timeline,runsOf,runsFrom,brief,live,addDays,notDone,strengthDigest} from './rc-lib.mjs';
const CLASSES={
 GEN:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],schedule:{runMinutes:50,strengthMinutes:50,longRunMinutes:80}},
 GEN60:{},
 R10K:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}},
 LOW:{runExperience:'BEGINNER',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:20,strengthDaysPerWeek:2}}
};
const AT=(d,h='07:00:00')=>({day:d,hour:h});
/** One decision on timeline t; the plan in force after it is its proposal, or the program it was made on. */
function dec(t,w,x,R){
 const before=t.p,r=t.step(w,x),P=r.proposal??before;
 return {w,...brief(r),ahead:P.weeks[w]?runsFrom(P,w,x.day??6):null,next:runsOf(P,w+1),strengthChanged:r.proposal?strengthDigest(R,r.proposal,w)!==strengthDigest(R,before,w):false};
}
const firstEasy=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.role==='EASY')[0]?.id;
const TL={
 NEVER:(R,o)=>{const out=[];for(let W=1;W<=6;W++){for(const x of [AT(0),{...AT(0),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}]){const t=timeline(R,o);out.push({W,kind:x.kind??'WEEKLY_REVIEW',...dec(t,W,x,R)});}}return out;},
 EMPTY_REVIEWS:(R,o)=>{const t=timeline(R,o),out=[];for(let w=0;w<6;w++){out.push({eow:w,...dec(t,w,{},R)});const c=t.copy();out.push({W:w+1,kind:'WEEKLY_REVIEW',...dec(c,w+1,AT(0),R)});}return out;},
 KNOWN_MISS:(R,o)=>{const t=timeline(R,o),out=[];for(let w=0;w<8;w++){const ex=w<2;
  out.push({mid:w,...dec(t,w,{...AT(2),observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date<addDays(t.p.weeks[w].startDate,2)).map(s=>ex||s.sport==='STRENGTH'?R.H.obs(t.p,s):notDone(t.p,s))},R)});
  out.push({eow:w,...dec(t,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date>=addDays(t.p.weeks[w].startDate,2)).map(s=>ex||s.sport==='STRENGTH'?R.H.obs(t.p,s):notDone(t.p,s))},R)});}return out;},
 ONE_MISS:(R,o)=>{const t=timeline(R,o),out=[];for(let w=0;w<8;w++){const e=firstEasy(t.p,w),f=s=>s.id===e?notDone(t.p,s):R.H.obs(t.p,s),cut=addDays(t.p.weeks[w].startDate,2);
  out.push({mid:w,...dec(t,w,{...AT(2),observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date<cut).map(f)},R)});out.push({eow:w,...dec(t,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.date>=cut).map(f)},R)});}return out;},
 ONE_UNREP:(R,o)=>{const t=timeline(R,o),out=[];for(let w=0;w<8;w++){const e=firstEasy(t.p,w),cut=addDays(t.p.weeks[w].startDate,2),k=s=>live(s)&&s.id!==e;
  out.push({mid:w,...dec(t,w,{...AT(2),observations:t.p.weeks[w].sessions.filter(s=>k(s)&&s.date<cut).map(s=>R.H.obs(t.p,s))},R)});out.push({eow:w,...dec(t,w,{observations:t.p.weeks[w].sessions.filter(s=>k(s)&&s.date>=cut).map(s=>R.H.obs(t.p,s))},R)});}return out;},
 SKIPPED:(R,o)=>skipped(R,o,{unrep:false,skip:true}),
 SKIPPED_UNREP:(R,o)=>skipped(R,o,{unrep:true,skip:true}),
 ON_TIME_UNREP:(R,o)=>skipped(R,o,{unrep:true,skip:false})
};
function skipped(R,o,{unrep,skip}){const t=timeline(R,o),out=[];for(let w=0;w<7;w++){const e=unrep&&w>=2?firstEasy(t.p,w):null,k=s=>live(s)&&s.id!==e;
 for(const d of [2,4]){const lo=addDays(t.p.weeks[w].startDate,d-2),hi=addDays(t.p.weeks[w].startDate,d);out.push({mid:w,day:d,...dec(t,w,{...AT(d),observations:t.p.weeks[w].sessions.filter(s=>k(s)&&s.date>=(d===2?'0000':lo)&&s.date<hi).map(s=>R.H.obs(t.p,s))},R)});}
 const rest=t.p.weeks[w].sessions.filter(s=>k(s)&&s.date>=addDays(t.p.weeks[w].startDate,4));
 if(skip&&(w===2||w===3)){if(rest.length)out.push({late:w,...dec(t,w+1,{...AT(0,'06:00:00'),observations:rest.map(s=>R.H.obs(t.p,s))},R)});}
 else out.push({eow:w,...dec(t,w,{observations:rest.map(s=>R.H.obs(t.p,s))},R)});}
 return out;}
const out={probe:'RC-P2 reach grid',runtimes:Object.keys(RUNTIMES),timelines:{}};
const strip=x=>JSON.stringify({...x,reason:undefined});
for(const [tl,run] of Object.entries(TL))for(const [cls,o] of Object.entries(CLASSES)){
 const res={};for(const [name,R] of Object.entries(RUNTIMES))res[name]=run(R,{id:`rc-p2-${cls}`,...o});
 const [a,b]=Object.values(res),diff=[];for(let i=0;i<Math.max(a.length,b.length);i++)if(strip(a[i])!==strip(b[i]))diff.push({i,F1:a[i],F2:b[i]});
 const ceilingF2=b.filter(x=>x.ceiling).length,strengthF2=b.filter(x=>x.ceiling&&x.strengthChanged).length;
 out.timelines[`${tl} ${cls}`]={decisions:b.length,differing:diff.length,ceilingDecisionsF2:ceilingF2,ceilingWithStrengthChangeF2:strengthF2,diff,F2:b};
}
out.summary=Object.fromEntries(Object.entries(out.timelines).map(([k,v])=>[k,{decisions:v.decisions,differing:v.differing,ceiling:v.ceilingDecisionsF2,strength:v.ceilingWithStrengthChangeF2}]));
console.log(JSON.stringify(out,null,1));
