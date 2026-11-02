// P6-X2: the reach of the recorded-answer re-plan (answeredOnRecord) outside the answer class, R7C-FREEZE-2 (F2) against R7C-FREEZE-3 (F3).
// No UNREPORTED_TRAINING question is involved: every session is reported, on time, by plain decisions; what varies is whether end-of-week
// reviews are made (and so whether a week start is anchored by WEEK_EVIDENCE or stays a CONDITIONAL_PLAN) and how the facts deviate from the
// plan. Each scenario is run on both runtimes with the client applying every proposal and reporting what its own plan prescribes.
// Reported per scenario: the first decision that differs (status, validity, question, plan of weeks w..w+1) with both plans' run minutes and
// known loads ahead; and, for every F3 decision whose factual state came from the recorded-answer re-plan (origin RECORDED), the sessions ahead
// whose run minutes or known load the re-plan raised or lowered against the plan it replaced (a within-F3, attributable comparison).
// Families: TIMELY_REVIEWED (day-of reports plus an end-of-week review), PERDAY (day-of reports only, never reviewed: Sunday's on Monday
// 06:00, as the state-model P51 fixture), P51 (weeks 0-4 reviewed, then PERDAY), each with deviations: NONE, SAT_LIFT_MISSED (Saturday strength
// session missed), LONG_70 (long run at 70 % of its minutes), EASY_MISSED (first easy run reported not done), LOADS_UP (every known load logged
// 2.5 kg above the plan). Programs: the P51 intake (16 weeks, STRENGTH goal), GEN and R10K (12 weeks). Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,notDone,brief,val,planFrom,loadsFrom,minutesFrom,ORIGIN} from './p6-lib.mjs';
const out={probe:'P6-X2 reach of the recorded-answer re-plan (F2 vs F3)',runtimes:Object.keys(RUNTIMES),scenarios:[],recordedReplans:{count:0,raised:[],lowered:0,byScenario:{}}};
const progs=H=>({
 P51:{id:'p6x2-p51',weeks:16,goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[H.K('back-squat',3,5,80),H.K('db-bench-press',3,8,18,'PER_HAND'),{id:'db-split-squat',familiar:true}],schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}},
 GEN:{id:'p6x2-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]},
 R10K:{id:'p6x2-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}}
});
/** One report of session s under deviation dev (null: not reported at all). */
function report(H,p,s,dev){
 if(dev==='SAT_LIFT_MISSED'&&s.sport==='STRENGTH'&&s.day===5)return null;
 if(dev==='LONG_70'&&s.sport==='RUN'&&s.role==='LONG')return H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.7))});
 if(dev==='LOADS_UP'&&s.sport==='STRENGTH')return H.obs(p,s,{kg:e=>e.load.mode==='KNOWN'?e.load.value+2.5:22.5});
 return H.obs(p,s);
}
function run(R,{prog,family,dev,weeks}){
 const H=R.H,o=progs(H)[prog],t=client(R,H.program(o)),log=[],N=t.p.weeks.length;
 const firstEasy=w=>t.p.weeks[w].sessions.find(x=>x.sport==='RUN'&&x.role==='EASY'&&live(x))?.id;
 const rep=(w,s)=>dev==='EASY_MISSED'&&s.id===firstEasy(w)?notDone(t.p,s):report(H,t.p,s,dev==='EASY_MISSED'?null:dev);
 const decide=(w,x,label,day)=>{const before=t.p,r=t.step(w,x);log.push({label,w,day,before,after:t.p,r,...brief(r),plan:planFrom(R,t.p,w,day)});return r;};
 for(let w=0;w<Math.min(weeks,N-1);w++){
  const reviewed=family==='TIMELY_REVIEWED'||family==='P51'&&w<5;
  const sessions=t.p.weeks[w].sessions.filter(live);
  for(const d of [...new Set(sessions.filter(s=>s.day<6).map(s=>s.day))].sort()){
   const obs=sessions.filter(s=>s.day===d).map(s=>rep(w,s)).filter(Boolean);
   decide(w,{day:d,hour:'21:00:00',observations:obs},`w${w} d${d}`,d);
  }
  const sat=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>rep(w,s)).filter(Boolean);
  if(reviewed)decide(w,{day:6,hour:'21:00:00',observations:sat},`w${w} review`,6);
  else decide(w+1,{day:0,hour:'06:00:00',observations:sat},`w${w+1} d0 (w${w} Sunday reports)`,0);
 }
 return log;
}
const scen=[];
for(const prog of ['P51','GEN','R10K'])for(const family of ['TIMELY_REVIEWED','PERDAY','P51'])for(const dev of ['NONE','SAT_LIFT_MISSED','LONG_70','EASY_MISSED','LOADS_UP'])scen.push({prog,family,dev,weeks:prog==='P51'?12:11});
const names=Object.keys(RUNTIMES),F2=RUNTIMES[names.find(n=>n.startsWith('F2'))],F3=RUNTIMES[names.find(n=>n.startsWith('F3'))];
for(const sc of scen){
 const A=run(F2,sc),B=run(F3,sc),label=`${sc.prog} ${sc.family} ${sc.dev}`;
 let first=null,differing=0;
 for(let i=0;i<Math.max(A.length,B.length);i++){
  const a=A[i],b=B[i];
  const same=a&&b&&a.status===b.status&&a.validity===b.validity&&a.question===b.question&&JSON.stringify(a.plan)===JSON.stringify(b.plan);
  if(!same){differing++;if(!first)first={step:b?.label??a?.label,F2:a&&{status:a.status,action:a.action,validity:a.validity,origin:a.origin,minutes:minutesFrom(a.after,a.w,a.day),loads:loadsFrom(a.after,a.w,a.day)},F3:b&&{status:b.status,action:b.action,validity:b.validity,origin:b.origin,minutes:minutesFrom(b.after,b.w,b.day),loads:loadsFrom(b.after,b.w,b.day)}};}
 }
 // Every F3 decision whose factual state came from the recorded-answer re-plan: what it raised or lowered against the plan it replaced.
 const rec=B.filter(x=>x.origin==='RECORDED');
 for(const x of rec){
  out.recordedReplans.count++;out.recordedReplans.byScenario[label]=(out.recordedReplans.byScenario[label]??0)+1;
  const m0=minutesFrom(x.before,x.w,x.day,3),m1=minutesFrom(x.after,x.w,x.day,3),l0=loadsFrom(x.before,x.w,x.day,3),l1=loadsFrom(x.after,x.w,x.day,3);
  const num=v=>Number(String(v).split(':')[1]);
  const up=[...Object.keys(m1).filter(k=>k in m0&&num(m1[k])>num(m0[k])).map(k=>`${k} ${m0[k]}->${m1[k]}`),...Object.keys(l1).filter(k=>k in l0&&l1[k]>l0[k]).map(k=>`${k} ${l0[k]}->${l1[k]}`),...Object.keys(m1).filter(k=>!(k in m0)).map(k=>`${k} new ${m1[k]}`)];
  const down=Object.keys(m0).filter(k=>k in m1&&num(m1[k])<num(m0[k])).length+Object.keys(l0).filter(k=>k in l1&&l1[k]<l0[k]).length;
  if(down)out.recordedReplans.lowered++;
  if(up.length)out.recordedReplans.raised.push({scenario:label,step:x.label,status:x.status,validity:x.validity,up});
 }
 out.scenarios.push({scenario:label,decisions:B.length,differing,recordedReplans:rec.length,recordedSteps:rec.map(x=>x.label),first});
}
console.log(JSON.stringify(out,null,1));
