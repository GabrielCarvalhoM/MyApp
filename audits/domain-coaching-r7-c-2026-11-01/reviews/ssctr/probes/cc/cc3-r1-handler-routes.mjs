// SSCTR CC recheck, probe CC3 (R1 / C9 beyond the plain-review answer). My re-run kinds-days grid on R7C-FREEZE-2 still flags 46 next-week cells,
// all known-stop answers carried on day 3 or 4 by EXERCISE_SUBSTITUTION, RETURN_SHORT or EVENT_DATE_CHANGE: does week b+1 still credit the
// answer week's elapsed unreported sessions on those routes, and does the next decision then cure it before a stale session is due?
// Step 1 (answer): every kinds-days decision kind carrying the gap's reports (MISS) on days 2-5 of week b; A: the same kind and day with the facts
// known at week b-1's review. Recorded: B's week b+1 right after the answer against A's (R1 = B's week b+1 above A's, an intense role A lacks,
// or a run above entry + step).
// Step 2 (cure), for every R1 cell: week b's later facts by delivery (MID_SKIP: the runs executed after the answer reported later in the week,
// week b's review skipped; NONE_SKIP: nothing more; REVIEW: week b's own review with those facts), then the first decision of week b+1 of several
// kinds. A VALID decision whose week b+1 is above A's, holds an intense role A lacks, or breaks the policy single-run ceiling on B's factual record
// is a failure to cure, classed BREACH (above the ceiling), INTENSE (an intense role A lacks) or STEP_WITHIN_CEILING (above A, inside the ceiling). Read-only; prints JSON. Usage: node cc3-r1-handler-routes.mjs [--base]
import {runtimes,kit,GEN,R10K,VALID,FREEZE_1} from './cc-lib.mjs';
const withBase=process.argv.includes('--base');
const {rt,cleanup}=await runtimes(withBase?[['F1',FREEZE_1]]:[]);
const out={check:'SSCTR-CC3-R1-HANDLER-ROUTES',runtimes:Object.keys(rt),grid:{}};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H,STEP=K.C.stepMinutes;
 const elapsedOf=(p,b,d)=>p.weeks[b].sessions.filter(s=>H.live(s)&&s.date<K.day(p,b,d));
 const lastStrength=(p,b)=>p.weeks[b-1].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').at(-1);
 const KINDS={
  WEEKLY_REVIEW:()=>({}),
  SCHEDULE_CHANGE:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
  SYSTEMIC_FATIGUE:()=>({kind:'SYSTEMIC_FATIGUE'}),
  LOCAL_FATIGUE:()=>({kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
  UNAVAILABLE_STRENGTH_DAY:(p,b,d)=>{const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='STRENGTH'&&x.date>K.day(p,b,d));return s?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[s.date]}}:null;},
  UNAVAILABLE_RUN_DAY:(p,b,d)=>{const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='RUN'&&x.role!=='RACE'&&x.date>K.day(p,b,d));return s?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[s.date]}}:null;},
  EQUIPMENT_CHANGE:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),
  GOAL_CHANGE:()=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
  EXERCISE_SUBSTITUTION:(p,b,d)=>{const s=p.weeks[b].sessions.find(x=>H.live(x)&&x.sport==='STRENGTH'&&x.date>=K.day(p,b,d));return s?{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:s.prescription.exercises[0].id,reason:'SKILL_MISMATCH'}}:null;},
  MISSED_SESSION:(p,b,d)=>{const s=elapsedOf(p,b,d).find(x=>x.sport==='STRENGTH');return s?{kind:'MISSED_SESSION',targetSessionId:s.id}:null;},
  UNDERPERFORMANCE:(p,b)=>({kind:'UNDERPERFORMANCE',targetSessionId:lastStrength(p,b).id}),
  OVERPERFORMANCE:(p,b)=>({kind:'OVERPERFORMANCE',targetSessionId:lastStrength(p,b).id}),
  DOUBLE_CONFLICT:()=>({kind:'DOUBLE_CONFLICT',changes:{strengthTurn:'AM'}}),
  EVENT_DATE_CHANGE:(p)=>p.goal?.run?.event?{kind:'EVENT_DATE_CHANGE',changes:{eventDate:H.addDays(p.goal.run.event.date,-7)}}:null,
  RETURN_SHORT:(p,b,d)=>d<3?null:{kind:'RETURN_AFTER_PAUSE',interruption:{startDate:K.day(p,b,0),endDate:K.day(p,b,d-1),days:d,reasonCategory:'WORK',reason:'work',nonclinical:true}}
 };
 const NEXT={PLAIN_D0:{day:0,hour:'07:00:00'},PLAIN_D2:{day:2,hour:'07:00:00'},SCHEDULE_CHANGE:{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},SYSTEMIC_FATIGUE:{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'},EQUIPMENT_CHANGE:{day:0,hour:'07:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}},GOAL_CHANGE:{day:0,hour:'07:00:00',kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}};
 const bad=(inB,inA)=>K.aboveRef(inB,inA)||K.intenseRolesNotIn(inB,inA).length>0;
 const res={answers:0,answerValid:0,r1:[],byKind:{},cure:{cells:0,valid:0,asks:0,fail:[],material:[],byKindClass:{},excess:{},byDelivery:{}},errors:[]};
 const CONFIGS=[['GEN',GEN(H),5,0],['GEN',GEN(H),7,0],['GEN',GEN(H),7,2],['GEN',GEN(H),9,0],['R10K',R10K(H),7,0],['R10K',R10K(H),9,0],['R10K taper',R10K(H),10,0],['R10K taper',R10K(H),10,2]];
 for(const [name,o,b,g] of CONFIGS)for(const mode of ['RV','NR']){
  let f;try{f=K.fork(o,{g,b,mode,V:'MISS'});}catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode}: fork ${e.message}`);continue;}
  for(const [kind,make] of Object.entries(KINDS))for(const d of [2,3,4,5]){
   const xb=make(f.B.p,b,d),xa=make(f.A.p,b,d);if(!xb||!xa)continue;
   const B=K.copy(f.B),A=K.copy(f.A);let rb,ra;
   try{rb=K.step(B,b,{day:d,hour:'07:00:00',...xb,observations:f.facts});ra=K.step(A,b,{day:d,hour:'07:00:00',...xa});}catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode} ${kind} d=${d}: ${e.message}`);continue;}
   res.answers++;const valid=rb.planValidity?.status===VALID;if(valid)res.answerValid++;
   if(b+1>=B.p.weeks.length||!valid)continue;
   const nB=K.runsOf(B.p,b+1),nA=K.runsOf(A.p,b+1),entryStep=nB.filter(x=>!/^RACE:/.test(x)&&Number(x.split(':')[1])>K.ENTRY+STEP);
   const isR1=bad(nB,nA);const bk=res.byKind[kind]??={answers:0,r1:0};bk.answers++;
   if(!isR1)continue;bk.r1++;
   const key=`${name} b=${b} g=${g} ${mode} ${kind} d=${d}`;res.r1.push({key,answer:K.brief(rb),A:K.brief(ra),weekB1_B:nB,weekB1_A:nA,aboveEntryStep:entryStep});
   const later=(P,from,to)=>P.weeks[b].sessions.filter(s=>H.live(s)&&s.date>=K.day(P,b,from)&&s.date<=K.day(P,b,to)).map(s=>H.obs(P,s));
   for(const delivery of ['MID_SKIP','NONE_SKIP','REVIEW']){
    const Bd=K.copy(B),Ad=K.copy(A),midTo=d<=2?3:6,mid=d<=2?{day:4,hour:'07:00:00'}:{day:6,hour:'12:00:00'};
    try{
     if(delivery==='MID_SKIP'){K.step(Bd,b,{...mid,observations:later(Bd.p,d,midTo)});K.step(Ad,b,{...mid,observations:later(Ad.p,d,midTo)});}
     if(delivery==='REVIEW'){K.step(Bd,b,{observations:later(Bd.p,d,6)});K.step(Ad,b,{observations:later(Ad.p,d,6)});}
    }catch(e){res.errors.push(`${key} ${delivery}: ${e.message}`);continue;}
    for(const [nk,nx] of Object.entries(NEXT)){
     const tb=K.copy(Bd),ta=K.copy(Ad);let qb,qa;
     try{qb=K.step(tb,b+1,{...nx});qa=K.step(ta,b+1,{...nx});}catch(e){res.errors.push(`${key} ${delivery} ${nk}: ${e.message}`);continue;}
     const PB=qb.proposal??tb.p,PA=qa.proposal??ta.p,inB=K.runsOf(PB,b+1,nx.day),inA=K.runsOf(PA,b+1,nx.day),v=qb.planValidity?.status===VALID;
     const ceil=K.factualCeiling({...tb,p:PB},b+1),over=v?K.overCeiling(inB,ceil):[];
     res.cure.cells++;if(v)res.cure.valid++;if(qb.status==='ASK')res.cure.asks++;
     const bd=res.cure.byDelivery[delivery]??={cells:0,valid:0,asks:0,fail:0};bd.cells++;if(v)bd.valid++;if(qb.status==='ASK')bd.asks++;
     if(v&&(bad(inB,inA)||over.length)){bd.fail++;const cls=over.length?'BREACH':K.intenseRolesNotIn(inB,inA).length?'INTENSE':'STEP_WITHIN_CEILING';bd[cls]=(bd[cls]??0)+1;const ck=res.cure.byKindClass[`${kind} ${cls}`]=(res.cure.byKindClass[`${kind} ${cls}`]??0)+1;const excess=Math.max(0,...inB.filter(x=>!/^RACE:/.test(x)).map(x=>{const [role,m]=x.split(':');const same=inA.filter(y=>y.startsWith(role+':')).map(y=>+y.split(':')[1]);return +m-(same.length?Math.max(...same):0);}));const hk=`${kind} excess ${excess}`;res.cure.excess[hk]=(res.cure.excess[hk]??0)+1;const line={key:`${key} ${delivery} ${nk}`,cls,excess,B:K.brief(qb),A:K.brief(qa),inB,inA,ceiling:ceil,over};res.cure.fail.push(line);if(cls!=='STEP_WITHIN_CEILING')res.cure.material.push(line);}
    }
   }
  }
 }
 out.grid[label]={answers:res.answers,answerValid:res.answerValid,r1Cells:res.r1.length,r1ByKind:Object.fromEntries(Object.entries(res.byKind).filter(([,v])=>v.r1)),cure:{cells:res.cure.cells,valid:res.cure.valid,asks:res.cure.asks,fail:res.cure.fail.length,material:res.cure.material.length,byKindClass:res.cure.byKindClass,excessOverAByKind:res.cure.excess,byDelivery:res.cure.byDelivery},errors:res.errors.length};
 out[label]={r1:res.r1,cureMaterial:res.cure.material,cureFailSample:res.cure.fail.slice(0,20),errors:res.errors.slice(0,30)};
}
cleanup();
console.log(JSON.stringify(out,null,1));
