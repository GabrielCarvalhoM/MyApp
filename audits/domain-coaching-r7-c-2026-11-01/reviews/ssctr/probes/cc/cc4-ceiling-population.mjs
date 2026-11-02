// SSCTR CC recheck, probe CC4 (item 3: the ceiling re-plan's semantics, scope and populations). Each family is compared on HEAD (R7C-FREEZE-2) and
// R7C-FREEZE-1 (F1), and against a reference built from the same facts on the accepted path:
//  N  never reported: run classes x intake longest run; nothing reported; decisions at day 0 (plain, schedule change, systemic fatigue) and day 2
//     (plain) of weeks 1-5. REF: the same weeks closed by weekly reviews with nothing reported (G01: with an anchor run they hold like a reviewed
//     miss; without one they ask). Checks: no new dose (HEAD never above the stored week, never an intense role the stored week lacks); HEAD within
//     the policy ceiling on the facts; HEAD against REF (above / equal / below); whether HEAD drops quality the athlete earned on facts (none here).
//  L  late known stop with an anchor run in the window (the G01 grid's late schedule-change rows): GEN, weeks [0,g) executed and reviewed, gap
//     [g,b) reviewed with strength only, its runs reported not done late inside a SCHEDULE_CHANGE on day 0 of week b. REF: the same reports at
//     week b-1's review (the reviewed-miss path, B1).
//  P  partial facts, executed runs at 70 % or one run reported not done, every week reviewed on time, then mid-week decisions: the trigger should
//     never fire on the timely path.
//  R  a short or moderate return with a current demonstration, the re-entry week partly reported (easy runs executed below the demonstration,
//     the long run unreported or not done), then the first decision of the week after it: the policy ceiling counts the demonstration; the
//     engine's record does not keep it.
//  T  taper and race week (R10K weeks 9-11) after executed weeks with one easy run unreported or not done in the window.
// Read-only; prints JSON. Usage: node cc4-ceiling-population.mjs
import {runtimes,kit,VALID,FREEZE_1,R10K} from './cc-lib.mjs';
const {rt,cleanup}=await runtimes([['F1',FREEZE_1]]);
const out={check:'SSCTR-CC4-CEILING-POPULATION',runtimes:Object.keys(rt),N:{},L:{},P:{},R:{},T:{}};
const CEILING=/exceed what the recorded runs allow/;
const KH=kit(rt.HEAD),H=KH.H;
const CLASSES={
 EASY_CURRENT_40:{recent:{runDaysPerWeek:3,runMinutesPerWeek:100,longestRunMinutes:40,strengthDaysPerWeek:2}},
 EASY_CURRENT_50:{recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2}},
 EASY_CURRENT_60:{recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}},
 EASY_CURRENT_70:{recent:{runDaysPerWeek:3,runMinutesPerWeek:170,longestRunMinutes:70,strengthDaysPerWeek:2}},
 EASY_LOW:{runExperience:'BEGINNER',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:20,strengthDaysPerWeek:2}},
 EASY_UNKNOWN:{recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null,strengthDaysPerWeek:2}},
 QUALITY_FAMILIAR:{runExperience:'ADVANCED',recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:90,strengthDaysPerWeek:2},schedule:{runDays:[1,2,4,6]}},
 RESTART:{recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:2}},
 RACE_10K:{goals:{run:{kind:'RACE',event:{kind:'10K',date:H.addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2}}
};
const DECS={PLAIN_D0:{day:0,hour:'07:00:00'},PLAIN_D2:{day:2,hour:'07:00:00'},SCHEDULE_CHANGE:{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},SYSTEMIC_FATIGUE:{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'}};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H;
 // ---------- N ----------
 {const res={cells:0,ceilingReplans:0,newDose:[],overCeilingValid:[],vsRef:{equal:0,above:0,below:0,other:0},aboveRef:[],rows:[]};
  for(const [cls,o] of Object.entries(CLASSES))for(const asOf of ['2026-11-01','2026-11-02']){
   let p;try{const g=R.generateProgram({...H.intake({id:`cc4-n-${cls}`,...o}),asOf,athlete:{...H.intake({id:`cc4-n-${cls}`,...o}).athlete,eligibility:H.elig(asOf)}},R.opts);p=g.program;if(!p)throw Error(g.status+' '+g.reason);}catch(e){res.rows.push({cls,asOf,error:e.message});continue;}
   for(let W=1;W<=5;W++)for(const [dk,dx] of Object.entries(DECS)){
    const t={p,ledger:[],ref:null},stored=K.runsOf(p,W,dx.day);let r;
    try{r=K.step(t,W,{...dx});}catch(e){res.rows.push({cls,asOf,W,dk,error:e.message});continue;}
    const ref={p,ledger:[],ref:null};let rr;
    try{for(let w=0;w<W;w++)K.step(ref,w,{});rr=K.step(ref,W,{...dx});}catch(e){res.rows.push({cls,asOf,W,dk,refError:e.message});continue;}
    const inH=K.runsOf(r.proposal??t.p,W,dx.day),inRef=K.runsOf(rr.proposal??ref.p,W,dx.day),v=r.planValidity?.status===VALID,vr=rr.planValidity?.status===VALID;
    const ceil=K.factualCeiling({...t,p:r.proposal??t.p},W),isCeil=CEILING.test(r.reason??'');res.cells++;if(isCeil)res.ceilingReplans++;
    const key=`${cls} asOf=${asOf} W=${W} ${dk}`;
    if(v&&(K.aboveRef(inH,stored)||K.intenseRolesNotIn(inH,stored).length))res.newDose.push({key,stored,inH});
    if(v&&K.overCeiling(inH,ceil).length)res.overCeilingValid.push({key,inH,ceil,B:K.brief(r)});
    if(v&&vr){const eq=JSON.stringify(inH)===JSON.stringify(inRef);if(eq)res.vsRef.equal++;else if(K.aboveRef(inH,inRef)||K.intenseRolesNotIn(inH,inRef).length){res.vsRef.above++;res.aboveRef.push({key,inH,inRef,stored,ceil,B:K.brief(r),REF:K.brief(rr)});}else if(K.aboveRef(inRef,inH))res.vsRef.below++;else res.vsRef.other++;}
    if(dk==='PLAIN_D0')res.rows.push({key,B:`${r.status}/${r.action??''}/${v?'VALID':r.planValidity?.status}${isCeil?'/CEILING':''}`,REF:`${rr.status}/${rr.action??''}/${vr?'VALID':rr.planValidity?.status}`,stored:stored.join('/'),inH:inH.join('/'),inRef:inRef.join('/'),ceil});
   }
  }
  out.N[label]={cells:res.cells,ceilingReplans:res.ceilingReplans,newDose:res.newDose.length,overCeilingValid:res.overCeilingValid.length,vsRef:res.vsRef,aboveRef:res.aboveRef.slice(0,40),newDoseList:res.newDose.slice(0,20),overCeilingList:res.overCeilingValid.slice(0,20),rowsPlainD0:res.rows};
 }
 // ---------- L ----------
 {const GEN={id:'cc4-l',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}},res=[];
  for(const b of [5,7,9])for(const g of [b-4,b-3,b-2])if(g>=1)for(const day of [0,2]){
   const t={p:H.program(GEN),ledger:[],ref:null};
   for(let w=0;w<g;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
   for(let w=g;w<b-1;w++)K.step(t,w,{observations:K.strengthOf(t.p,w)});
   const facts=K.report(t.p,g,b,'MISS'),A=K.copy(t),B=K.copy(t);
   const qa=K.step(A,b-1,{observations:[...K.strengthOf(t.p,b-1),...facts]}),qb=K.step(B,b-1,{observations:K.strengthOf(t.p,b-1)});
   const stored=K.runsOf(B.p,b,day);
   const rb=K.step(B,b,{day,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts}),ra=K.step(A,b,{day,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}});
   const inB=K.runsOf(rb.proposal??B.p,b,day),inA=K.runsOf(ra.proposal??A.p,b,day),ceil=K.factualCeiling({...B,p:rb.proposal??B.p},b);
   res.push({key:`GEN b=${b} g=${g} day ${day}`,reviewBefore:{A:K.brief(qa).s,B:`${qb.status}/${qb.question?.kind??''}`},B:K.brief(rb),A:K.brief(ra),stored:stored.join('/'),inB:inB.join('/'),inA:inA.join('/'),eqA:JSON.stringify(inB)===JSON.stringify(inA),ceiling:ceil,overCeiling:rb.planValidity?.status===VALID?K.overCeiling(inB,ceil):[]});
  }
  out.L[label]={rows:res,eqA:res.filter(z=>z.eqA).length,n:res.length,overCeiling:res.filter(z=>z.overCeiling.length).length};
 }
 // ---------- P ----------
 {const GEN={id:'cc4-p',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'}},res={decisions:0,ceilingReplans:[],byVariant:{}};
  for(const variant of ['SHORT70','ONE_MISS','SHORT70_ONE_MISS']){
   const t={p:H.program(GEN),ledger:[],ref:null};let n=0,c=0;
   for(let w=0;w<8;w++){
    const cut=K.day(t.p,w,2),obsOf=s=>s.sport==='RUN'&&(variant!=='ONE_MISS')?H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.7))}):H.obs(t.p,s);
    const missId=w===2?t.p.weeks[2].sessions.find(s=>H.live(s)&&s.sport==='RUN'&&s.role==='EASY')?.id:null;
    const mk=s=>variant!=='SHORT70'&&s.id===missId?K.notDone(t.p,s):obsOf(s);
    for(const x of [{day:2,hour:'07:00:00',observations:t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.date<cut).map(mk)},{day:4,hour:'07:00:00'},{observations:t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.date>=cut).map(mk)}]){
     const r=K.step(t,w,x);n++;if(CEILING.test(r.reason??'')){c++;res.ceilingReplans.push(`${variant} week ${w} ${x.day??6}: ${r.status}/${r.action}`);}
    }
   }
   res.byVariant[variant]={decisions:n,ceilingReplans:c};res.decisions+=n;
  }
  out.P[label]=res;
 }
 // ---------- R ----------
 {const res=[];const demo=(day,minutes)=>({observedAt:`${H.addDays(day,-1)}T07:00:00Z`,sport:'RUN',family:'EASY',minutes,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'});
  const RG={id:'cc4-r',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}};
  for(const [kind,days,demoMin] of [['SHORT',6,25],['SHORT',6,40],['MODERATE',20,40]])for(const longFact of ['UNREPORTED','NOT_DONE','EXECUTED']){
   const t={p:H.program(RG),ledger:[],ref:null};let entryWeek,ret;
   try{
    if(kind==='SHORT'){for(let w=0;w<5;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>s.sport==='RUN'?K.notDone(t.p,s):H.obs(t.p,s))});
     const start=t.p.weeks[5].startDate;ret=K.step(t,5,{day:6,hour:'12:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:H.addDays(start,5),days,reasonCategory:'TRAVEL',nonclinical:true},currentDemonstration:demo(H.addDays(start,6),demoMin)});entryWeek=6;}
    else{const start=t.p.weeks[2].startDate,end=H.addDays(start,days-1),retDate=H.addDays(t.p.weeks[4].startDate,6);
     ret=K.step(t,4,{day:6,hour:'12:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,days,reasonCategory:'TRAVEL',nonclinical:true},currentDemonstration:demo(retDate,demoMin)});entryWeek=5;}
   }catch(e){res.push({kind,days,demoMin,longFact,error:e.message});continue;}
   const entry=K.runsOf(t.p,entryWeek),easy=t.p.weeks[entryWeek].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.role!=='LONG'),long=t.p.weeks[entryWeek].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.role==='LONG');
   const obs=[...easy.map(s=>H.obs(t.p,s,{minutes:Math.max(10,s.prescription.durationMinutes-10)})),...(longFact==='NOT_DONE'?long.map(s=>K.notDone(t.p,s)):longFact==='EXECUTED'?long.map(s=>H.obs(t.p,s)):[]),...K.strengthOf(t.p,entryWeek)];
   // The re-entry week's facts arrive mid-week of the week after (its review skipped), then the first decision there.
   const stored=K.runsOf(t.p,entryWeek+1),r=K.step(t,entryWeek+1,{day:0,hour:'07:00:00',observations:obs});
   const inH=K.runsOf(r.proposal??t.p,entryWeek+1),ceilNoDemo=K.factualCeiling({...t,p:r.proposal??t.p},entryWeek+1);
   res.push({key:`${kind} ${days}d demo ${demoMin} long ${longFact}`,ret:K.brief(ret),entryWeek:entry.join('/'),stored:stored.join('/'),B:K.brief(r),inH:inH.join('/'),ceilingWithoutDemo:ceilNoDemo,ceilingWithDemoIfInWindow:demoMin+K.C.stepMinutes,ceilingReplan:CEILING.test(r.reason??'')});
  }
  out.R[label]=res;
 }
 // ---------- T ----------
 {const res=[];
  for(const [hole,hw] of [['UNREPORTED',8],['NOT_DONE',8],['UNREPORTED',9],['NOT_DONE',9]])for(const b of [9,10,11]){
   if(hw>=b)continue;
   const t={p:H.program(R10K(H)),ledger:[],ref:null};
   for(let w=0;w<b;w++){const holeId=w===hw?t.p.weeks[w].sessions.find(s=>H.live(s)&&s.sport==='RUN'&&s.role==='EASY')?.id:null;
    K.step(t,w,{observations:t.p.weeks[w].sessions.filter(s=>H.live(s)&&!(hole==='UNREPORTED'&&s.id===holeId)).map(s=>s.id===holeId?K.notDone(t.p,s):H.obs(t.p,s))});}
   for(const x of [{day:0,hour:'07:00:00'},{day:2,hour:'07:00:00'}]){const tt=K.copy(t),stored=K.runsOf(tt.p,b,x.day),r=K.step(tt,b,x),inH=K.runsOf(r.proposal??tt.p,b,x.day);
    res.push({key:`R10K hole ${hole} in week ${hw}, decision week ${b} day ${x.day}`,B:K.brief(r),stored:stored.join('/'),inH:inH.join('/'),ceiling:K.factualCeiling({...tt,p:r.proposal??tt.p},b),ceilingReplan:CEILING.test(r.reason??'')});}
  }
  out.T[label]=res;
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
