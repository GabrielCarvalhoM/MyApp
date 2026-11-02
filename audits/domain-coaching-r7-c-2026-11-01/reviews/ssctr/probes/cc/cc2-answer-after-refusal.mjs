// SSCTR CC recheck, probe CC2 (QE-R7C-01 class, item 2). The gap's reports reach the engine inside a decision that records them without applying
// them (a refusal or a clinical route), then the next decision. Is it applied as the accepted path applies it?
// Recorders on day 2 of week b (B): R4 (SCHEDULE_CHANGE in the program's last week, HOLD), SUB_PAIN (substitution with pain, CLINICAL), RET_ILL
// (clinical return report, illness, days 0-1), ELIG (eligibility pain flag with the answer: R5, not recorded), RECOVERED (stays ASK), DATES
// (equipment change with unusable dates: a question of another kind). After a clinical route, clearance is modelled as the Phase 5 CC tests do
// (the carried record, no clinical reference state; the runtime has no clearance API).
// Then on day 3 07:00 one next decision: PLAIN, RESEND (the answer re-sent), SYSTEMIC_FATIGUE. Compared with A (the same facts at week b-1's
// review, plain day-3 decision) and D (the accepted direct path: a plain review carrying the answer on day 2, then the same day-3 decision).
// Then week b's review with nothing new and the first decision of week b+1 (plain day 0): week b+1 compared with A and D.
// Facts V: MISS (known stop), EXEC (executed as prescribed), ADVERSE (executed, long runs adverse), MIXED (alternate runs not done).
// Read-only; prints JSON. Usage: node cc2-answer-after-refusal.mjs [--base]
import {runtimes,kit,GEN,R10K,VALID,FREEZE_1} from './cc-lib.mjs';
const withBase=process.argv.includes('--base');
const {rt,cleanup}=await runtimes(withBase?[['F1',FREEZE_1]]:[]);
const out={check:'SSCTR-CC2-ANSWER-AFTER-REFUSAL',runtimes:Object.keys(rt),grid:{}};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H,res={cells:0,aboveA:[],aboveD:[],recorderStatus:{},validNotA:[],validNotD:[],breaches:[],intenseNotInA:[],next:[],errors:[],byV:{}};
 const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
 const factsOf=(p,g,b,V)=>K.runSessions(p,g,b).map((s,i)=>V==='MISS'||V==='MIXED'&&i%2?K.notDone(p,s):H.obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{}));
 const RECORDERS={
  R4:(p,b,facts)=>b===p.weeks.length-1?{day:2,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts}:null,
  SUB_PAIN:(p,b,facts)=>{const X=p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.date>=K.day(p,b,2)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];return X?{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts}:null;},
  RET_ILL:(p,b,facts)=>({day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',observations:facts,interruption:{startDate:p.weeks[b].startDate,endDate:K.day(p,b,1),days:2,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}}),
  ELIG:(p,b,facts)=>{const d=K.day(p,b,2);return {day:2,hour:'07:00:00',observations:facts,eligibility:{...H.elig(d),pain:true}};},
  RECOVERED:(p,b,facts)=>({day:2,hour:'07:00:00',kind:'RECOVERED',observations:facts}),
  DATES:(p,b,facts)=>({day:2,hour:'07:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[Math.min(b+1,p.weeks.length-1)].startDate,to:'soon'},observations:facts})
 };
 const progs=[['GEN',GEN(H),5],['GEN',GEN(H),7],['R10K',R10K(H),9],['R10K taper',R10K(H),10],['R10K race week',R10K(H),11]];
 for(const [name,o,b] of progs)for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC','ADVERSE','MIXED']){
  // Shared prefix: weeks [0,g) executed and reviewed, [g,b-1) RV reviewed with strength only (NR not), up to week b-1's review. B's review of
  // week b-1 has no runs (it asks); A's has the gap's reports (this V). Same construction as the Phase 5 tests.
  let pre,st;try{pre={p:H.program(o),ledger:[],ref:null};
   for(let w=0;w<g;w++)K.step(pre,w,{observations:pre.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(pre.p,s))});
   if(mode==='RV')for(let w=g;w<b-1;w++)K.step(pre,w,{observations:K.strengthOf(pre.p,w)});
   st=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>K.strengthOf(pre.p,w)):[]),...K.strengthOf(pre.p,b-1)];
  }catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode}: prefix ${e.message}`);continue;}
  const facts=factsOf(pre.p,g,b,V),A=K.copy(pre),B0=K.copy(pre);
  K.step(A,b-1,{observations:[...st,...facts]});K.step(B0,b-1,{observations:st});
  const f={B:B0};
  for(const [rec,make] of Object.entries(RECORDERS)){
   const x=make(f.B.p,b,facts);if(!x)continue;
   const B=K.copy(f.B);let r0;try{r0=K.step(B,b,x);}catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode} ${V} ${rec}: ${e.message}`);continue;}
   const recorded=facts.every(fc=>B.ledger.some(z=>z.sessionId===fc.sessionId));
   res.recorderStatus[rec]=res.recorderStatus[rec]??{};const rs=res.recorderStatus[rec][`${r0.status}/${r0.planValidity?.status}/recorded=${recorded}`]??=0;res.recorderStatus[rec][`${r0.status}/${r0.planValidity?.status}/recorded=${recorded}`]=rs+1;
   const cleared=r0.status==='CLINICAL_HUMAN_REQUIRED'?{...K.copy(B),ref:null}:K.copy(B);
   for(const [nk,nx] of Object.entries({PLAIN:{},RESEND:{observations:facts},SYSTEMIC_FATIGUE:{kind:'SYSTEMIC_FATIGUE'}})){
    const tb=K.copy(cleared),ta=K.copy(A),D=K.copy(f.B);
    let rb,ra,rd;
    try{K.step(D,b,{day:2,hour:'07:00:00',observations:facts});K.step(ta,b,{day:2,hour:'07:00:00'});rb=K.step(tb,b,{day:3,hour:'07:00:00',...nx});ra=K.step(ta,b,{day:3,hour:'07:00:00',...(nk==='RESEND'?{}:nx)});rd=K.step(D,b,{day:3,hour:'07:00:00',...(nk==='RESEND'?{}:nx)});}
    catch(e){res.errors.push(`${name} b=${b} g=${g} ${mode} ${V} ${rec} ${nk}: ${e.message}`);continue;}
    const PB=rb.proposal??tb.p,PA=ra.proposal??ta.p,PD=rd.proposal??D.p,inB=K.runsOf(PB,b,3),inA=K.runsOf(PA,b,3),inD=K.runsOf(PD,b,3),valid=rb.planValidity?.status===VALID;
    const ceil=K.factualCeiling({...tb,p:PB},b),over=valid?K.overCeiling(inB,ceil):[],extra=valid?K.intenseRolesNotIn(inB,inA):[],aboveA=valid&&K.aboveRef(inB,inA),aboveD=valid&&K.aboveRef(inB,inD);
    const key=`${name} b=${b} g=${g} ${mode} ${V} ${rec}->${nk}`,line={key,rec:K.brief(r0),B:K.brief(rb),A:K.brief(ra),D:K.brief(rd),inB,inA,inD,ceiling:ceil};
    res.cells++;const bv=res.byV[V]??={cells:0,valid:0,eqA:0,eqD:0,aboveA:0,aboveD:0,breaches:0,intense:0};bv.cells++;if(valid)bv.valid++;if(aboveA){bv.aboveA++;res.aboveA.push(line);}if(aboveD){bv.aboveD++;res.aboveD.push(line);}
    if(JSON.stringify(inB)===JSON.stringify(inA))bv.eqA++;if(JSON.stringify(inB)===JSON.stringify(inD))bv.eqD++;
    if(valid&&JSON.stringify(inB)!==JSON.stringify(inA))res.validNotA.push(line);
    if(valid&&JSON.stringify(inB)!==JSON.stringify(inD))res.validNotD.push(line);
    if(over.length){bv.breaches++;res.breaches.push({...line,over});}
    if(extra.length){bv.intense++;res.intenseNotInA.push({...line,extra});}
    // Week b's review with nothing new, then week b+1's first decision (plain, day 0).
    if(nk==='PLAIN'){
     try{K.step(tb,b,{});K.step(ta,b,{});K.step(D,b,{});
      if(b+1<tb.p.weeks.length){const nb=K.step(tb,b+1,{day:0,hour:'07:00:00'}),na=K.step(ta,b+1,{day:0,hour:'07:00:00'}),nd=K.step(D,b+1,{day:0,hour:'07:00:00'});
       const wB=K.runsOf(nb.proposal??tb.p,b+1),wA=K.runsOf(na.proposal??ta.p,b+1),wD=K.runsOf(nd.proposal??D.p,b+1);
       res.next.push({key,B:K.brief(nb),wB,wA,wD,aboveA:K.aboveRef(wB,wA)||K.intenseRolesNotIn(wB,wA).length>0,eqA:JSON.stringify(wB)===JSON.stringify(wA),eqD:JSON.stringify(wB)===JSON.stringify(wD),ceiling:K.factualCeiling({...tb,p:nb.proposal??tb.p},b+1)});}}
     catch(e){res.errors.push(`${key} next: ${e.message}`);}
    }
   }
  }
 }
 const nx=res.next,nxv=nx.filter(z=>z.B.v===VALID);
 out.grid[label]={cells:res.cells,byV:res.byV,recorderStatus:res.recorderStatus,validNotA:res.validNotA.length,validNotD:res.validNotD.length,breaches:res.breaches.length,intenseNotInA:res.intenseNotInA.length,next:{cells:nx.length,valid:nxv.length,aboveA:nxv.filter(z=>z.aboveA).length,eqA:nxv.filter(z=>z.eqA).length,eqD:nxv.filter(z=>z.eqD).length,breaches:nxv.filter(z=>K.overCeiling(z.wB,z.ceiling).length).length},errors:res.errors.length};
 out[label]={aboveA:res.aboveA.slice(0,80),aboveD:res.aboveD.slice(0,40),validNotA:res.validNotA.slice(0,60),validNotD:res.validNotD.slice(0,60),breaches:res.breaches.slice(0,30),intenseNotInA:res.intenseNotInA.slice(0,40),nextAboveA:nxv.filter(z=>z.aboveA).slice(0,40),nextNotD:nxv.filter(z=>!z.eqD),nextNotA:nxv.filter(z=>!z.eqA).slice(0,40),nextBreaches:nxv.filter(z=>K.overCeiling(z.wB,z.ceiling).length).slice(0,20),errors:res.errors.slice(0,30)};
}
cleanup();
console.log(JSON.stringify(out,null,1));
