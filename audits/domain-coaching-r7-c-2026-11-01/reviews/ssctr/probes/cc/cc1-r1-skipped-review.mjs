// SSCTR CC recheck, probe CC1 (R1 / C9 after QE-R7C-02). After a gap answered later in week b (known stop MISS, or executed EXEC), with
// answer-week runs elapsed before the answer and never reported, which week b+1 reaches the athlete, and is it what the facts allow?
// Grid: GEN b=5,7 and R10K b=9 and b=10 (taper to race week); gap from the start (g=0) or after two executed weeks (g=2); RV/NR; V MISS/EXEC;
// answer on day 2 or day 4 (B: a plain review carrying the gap's reports; A: the same facts known at week b-1's review, a plain review that day).
// Then, in both A and B, one delivery of week b's later facts:
//  MID_SKIP   the runs executed after the answer reported by a separate decision later in the week (day 4 07:00 after a day-2 answer; day 6 12:00
//             after a day-4 answer), and week b's own review skipped (the QE-R7C-02 timeline);
//  REVIEW     the same facts at week b's own review (day 6 21:00);
//  NONE_SKIP  nothing reported after the answer, no review;
//  LATE       the same facts sent with the first decision of week b+1.
// Then the first decision of week b+1, of each kind, on day 0 (and a plain one on day 2). Per cell: B and A status/validity, week b+1's runs in force
// from the decision day, equality to A, the policy single-run ceiling on B's factual record (cc-lib factualCeiling), runs above it in a VALID
// decision, and intense roles (quality or race touch) in B that A does not plan, and B above A (a longer non-race run than A's longest, or more run minutes in total). Read-only; prints JSON.
// Usage: node cc1-r1-skipped-review.mjs [--base] (with --base, the same grid on R7C-FREEZE-1 too, for the delta).
import {runtimes,kit,GEN,R10K,VALID,FREEZE_1} from './cc-lib.mjs';
const withBase=process.argv.includes('--base');
const {rt,cleanup}=await runtimes(withBase?[['F1',FREEZE_1]]:[]);
const out={check:'SSCTR-CC1-R1-SKIPPED-REVIEW',runtimes:Object.keys(rt),grid:{},summary:{}};
const KINDS={PLAIN_D0:()=>({day:0,hour:'07:00:00'}),PLAIN_D2:()=>({day:2,hour:'07:00:00'}),SCHEDULE_CHANGE:()=>({day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),SYSTEMIC_FATIGUE:()=>({day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'}),EQUIPMENT_CHANGE:()=>({day:0,hour:'07:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}),LOCAL_FATIGUE:()=>({day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}})};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H,res={cells:0,validB:0,sameAsA:0,validNotSame:[],breaches:[],intenseNotInA:[],aboveA:[],errors:[],byDelivery:{}};
 const progs=[['GEN',GEN(H),5],['GEN',GEN(H),7],['R10K',R10K(H),9],['R10K taper->race',R10K(H),10]];
 for(const [name,o,b] of progs)for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC']){
  let f;try{f=K.fork(o,{g,b,mode,V});}catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode} ${V}: fork ${e.message}`);continue;}
  for(const d of [2,4]){
   const B0=K.copy(f.B),A0=K.copy(f.A),ansB=K.step(B0,b,{day:d,hour:'07:00:00',observations:f.facts}),ansA=K.step(A0,b,{day:d,hour:'07:00:00'});
   const later=(P,from,to)=>P.weeks[b].sessions.filter(s=>H.live(s)&&s.date>=K.day(P,b,from)&&s.date<=K.day(P,b,to)).map(s=>H.obs(P,s));
   for(const delivery of ['MID_SKIP','REVIEW','NONE_SKIP','LATE']){
    const B=K.copy(B0),A=K.copy(A0);let lateB=[],lateA=[];
    const midTo=d===2?3:6,mid=d===2?{day:4,hour:'07:00:00'}:{day:6,hour:'12:00:00'};
    if(delivery==='MID_SKIP'){K.step(B,b,{...mid,observations:later(B.p,d,midTo)});K.step(A,b,{...mid,observations:later(A.p,d,midTo)});}
    if(delivery==='REVIEW'){K.step(B,b,{observations:later(B.p,d,6)});K.step(A,b,{observations:later(A.p,d,6)});}
    if(delivery==='LATE'){lateB=later(B.p,d,6);lateA=later(A.p,d,6);}
    for(const [kind,make] of Object.entries(KINDS)){
     const x=make(),tb=K.copy(B),ta=K.copy(A);let rb,ra;
     try{rb=K.step(tb,b+1,{...x,observations:lateB});ra=K.step(ta,b+1,{...x,observations:lateA});}catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode} ${V} d=${d} ${delivery} ${kind}: ${e.message}`);continue;}
     const PB=rb.proposal??tb.p,PA=ra.proposal??ta.p,inB=K.runsOf(PB,b+1,x.day),inA=K.runsOf(PA,b+1,x.day),valid=rb.planValidity?.status===VALID;
     const ceil=K.factualCeiling({...tb,p:PB},b+1),over=valid?K.overCeiling(inB,ceil):[],extra=valid?K.intenseRolesNotIn(inB,inA):[],above=valid&&K.aboveRef(inB,inA);
     const same=JSON.stringify(inB)===JSON.stringify(inA),key=`${name} b=${b} g=${g} ${mode} ${V} d=${d} ${delivery} ${kind}`;
     res.cells++;if(valid)res.validB++;if(same)res.sameAsA++;
     const bd=res.byDelivery[`${delivery} ${V}`]??={cells:0,validB:0,same:0,breaches:0,aboveA:0,intenseRoleNotInA:0};bd.cells++;if(valid)bd.validB++;if(same)bd.same++;if(over.length)bd.breaches++;if(above)bd.aboveA++;if(extra.length)bd.intenseRoleNotInA++;
     const line={key,B:K.brief(rb),A:K.brief(ra),weekB1_B:inB,weekB1_A:inA,ceiling:ceil};if(above)res.aboveA.push(line);
     if(valid&&!same)res.validNotSame.push(line);
     if(over.length)res.breaches.push({...line,over});
     if(extra.length)res.intenseNotInA.push({...line,extra});
    }
   }
  }
 }
 out.grid[label]={cells:res.cells,validB:res.validB,sameAsA:res.sameAsA,breaches:res.breaches.length,aboveA:res.aboveA.length,aboveAMiss:res.aboveA.filter(z=>/ MISS /.test(z.key)).length,intenseNotInA:res.intenseNotInA.length,validNotSame:res.validNotSame.length,errors:res.errors.length,byDelivery:res.byDelivery};
 out[label]={aboveA:res.aboveA.filter(z=>/ MISS /.test(z.key)).slice(0,60),aboveAExec:res.aboveA.filter(z=>/ EXEC /.test(z.key)).slice(0,20),breaches:res.breaches.slice(0,40),intenseNotInA:res.intenseNotInA.slice(0,40),validNotSame:res.validNotSame.slice(0,80),errors:res.errors.slice(0,20)};
}
cleanup();
console.log(JSON.stringify(out,null,1));
