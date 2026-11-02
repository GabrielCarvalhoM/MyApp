// P7-X3: re-sends, duplicates, split answers and corrections around a recorded answer (the QE-R7C-10 cells: GEN week 7 g=0 RV, R10K taper g=2 RV,
// and R10K race week g=2 RV with the R4 carrier). Each path is compared with the same facts delivered directly (plain reviews on the same days):
//  R1  re-send with new event ids and a supplied reportedAt (day 3, 06:00) after a clinical carrier on day 2 (cleared);
//  R2  the carrier's own reports carry reportedAt (day 2, 06:00);
//  R3  a second-source duplicate (new event id, a WATCH activity id, minutes within tolerance) recorded on day 3;
//  R4  split answer: the long runs through the carrier on day 2, the other runs directly on day 3;
//  R5  a direct answer done in full on day 2, then a correction of every gap long run to 60 % recorded by a clinical carrier on day 3 (cleared);
//  R6  the answer done in full recorded by a clinical carrier on day 2 (cleared), then the same correction delivered directly on day 3;
//  R7  (control, pre-existing class) a timely athlete, then a correction of an on-time long run recorded by a clinical carrier.
// Next decision after the last step: a plain review the next day (07:00), then the week's review (day 6, 21:00, no reports). Compared: plan in
// force from that day over weeks b, b+1, and validity. Read-only; prints JSON.
import {RUNTIMES,client,live,programs,strengthOf,runSessions,answer,csub,fork,AT,brief,runsFromDay,planFrom,val} from './p7-lib.mjs';
const out={probe:'P7-X3 re-sends, duplicates, split answers, corrections',runtimes:Object.keys(RUNTIMES),cells:[],summary:{}};
const corr=(o,f,day)=>({...o,eventId:o.eventId+'-c'+day,correctionOf:o.eventId,correctedAt:`${day}T06:00:00Z`,actual:{...o.actual,minutes:Math.max(10,Math.round(o.actual.minutes*f))}});
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,P=programs(H),sum={cells:0,fail:0,staleValid:0,byShape:{}};
 const cmp=(label,shape,a,ra,b,rb,w,d,stale)=>{const pa=planFrom(R,a.p,w,d),pb=planFrom(R,b.p,w,d),ok=JSON.stringify(pa)===JSON.stringify(pb)&&val(ra)===val(rb);const staleValid=!ok&&val(ra)==='VALID'&&stale&&JSON.stringify(pa)===JSON.stringify(stale);sum.cells++;if(!ok){sum.fail++;sum.byShape[shape]=(sum.byShape[shape]??0)+1;}if(staleValid)sum.staleValid++;out.cells.push({runtime:name,cell:label,shape,ok,staleValid,path:{...brief(ra),runs:runsFromDay(a.p,w,d,2)},direct:{...brief(rb),runs:runsFromDay(b.p,w,d,2)}});};
 const carrierOf=(b,race)=>race?(t,facts,at)=>t.step(b,{...at,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts}):(t,facts,at)=>csub(t,b,facts,at);
 for(const [prog,o,b,g,race] of process.env.P7X3_ONLY_R7?[]:[['GEN week 7',P.GEN,7,0,false],['R10K taper',P.R10K,10,2,false],['R10K race week',P.R10K,11,2,true]]){
  const {t:B,question}=fork(R,o,{g,b,mode:'RV'});if(question!=='UNREPORTED_TRAINING')throw Error(prog+' no question');
  const C=carrierOf(b,race),day=d=>H.addDays(B.p.weeks[b].startDate,d);
  for(const V of ['SHORT60','ADVERSE','MIX_SHORT_MISS','EXEC']){
   const facts=runSessions(B.p,g,b).flatMap((s,i)=>answer(H,B.p,s,i,V)),stale=planFrom(R,B.p,b,3);
   const next=(t,d)=>[t.step(b,AT(d)),t.step(b,{day:6,hour:'21:00:00'})];
   const tail=(lab,shape,x,y,d)=>{const [a1,a2]=next(x,d),[b1,b2]=next(y,d);cmp(`${prog} ${V} ${lab} :: day ${d}`,shape,x,a1,y,b1,b,d,stale);cmp(`${prog} ${V} ${lab} :: week review`,shape,x,a2,y,b2,b,6,null);};
   {// R1
    const x=B.copy();C(x,facts,AT(2));x.ref=race?x.ref:null;x.step(b,{...AT(3),observations:facts.map(f=>({...f,eventId:f.eventId+'-r',reportedAt:`${day(3)}T06:00:00Z`}))});
    const y=B.copy();y.step(b,{...AT(2),observations:facts});y.step(b,{...AT(3),observations:facts.map(f=>({...f,eventId:f.eventId+'-r',reportedAt:`${day(3)}T06:00:00Z`}))});tail('R1 re-send new ids + reportedAt','R1',x,y,4);}
   {// R2
    const rf=facts.map(f=>({...f,reportedAt:`${day(2)}T06:00:00Z`}));const x=B.copy();C(x,rf,AT(2));if(!race)x.ref=null;const y=B.copy();y.step(b,{...AT(2),observations:rf});tail('R2 reportedAt on the carrier\'s reports','R2',x,y,3);}
   {// R3
    const dup=facts.filter(f=>f.actual.completed).map((f,i)=>({...f,eventId:f.eventId+'-w',source:{provider:'WATCH',activityId:'w-'+f.sessionId},actual:{...f.actual,minutes:f.actual.minutes+1}}));
    const x=B.copy();C(x,facts,AT(2));if(!race)x.ref=null;x.step(b,{...AT(3),observations:dup});const y=B.copy();y.step(b,{...AT(2),observations:facts});y.step(b,{...AT(3),observations:dup});tail('R3 second-source duplicate day 3','R3',x,y,4);}
   {// R4
    const ids=new Set(runSessions(B.p,g,b).filter(s=>s.role==='LONG').map(s=>s.id)),longF=facts.filter(f=>ids.has(f.sessionId)),rest=facts.filter(f=>!ids.has(f.sessionId));
    const x=B.copy();C(x,longF,AT(2));if(!race)x.ref=null;x.step(b,{...AT(3),observations:rest});const y=B.copy();y.step(b,{...AT(2),observations:longF});y.step(b,{...AT(3),observations:rest});tail('R4 split: long runs by carrier, rest direct','R4',x,y,4);}
   if(V==='EXEC'){// R5, R6
    const ids=new Set(runSessions(B.p,g,b).filter(s=>s.role==='LONG').map(s=>s.id)),fixes=facts.filter(f=>ids.has(f.sessionId)).map(f=>corr(f,0.6,day(3)));
    {const x=B.copy();x.step(b,{...AT(2),observations:facts});C(x,fixes,AT(3));if(!race)x.ref=null;const y=B.copy();y.step(b,{...AT(2),observations:facts});y.step(b,{...AT(3),observations:fixes});tail('R5 direct answer, correction by carrier','R5',x,y,4);}
    {const x=B.copy();C(x,facts,AT(2));if(!race)x.ref=null;x.step(b,{...AT(3),observations:fixes});const y=B.copy();y.step(b,{...AT(2),observations:facts});y.step(b,{...AT(3),observations:fixes});tail('R6 carrier answer, correction direct','R6',x,y,4);}
   }
  }
 }
 {// R7 control: timely GEN athlete, weeks 0..5 reported and reviewed on time; week 6 day 2 a correction of week 5's long run to 60 %.
  const t=client(R,H.program(P.GEN));const kept=[];for(let w=0;w<6;w++){const ob=t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s));kept.push(...ob);t.step(w,{observations:ob});}
  const lr=t.p.weeks[5].sessions.find(s=>live(s)&&s.sport==='RUN'&&s.role==='LONG'),orig=kept.find(o=>o.sessionId===lr.id),fix=corr(orig,0.6,H.addDays(t.p.weeks[6].startDate,2));
  const stale=planFrom(R,t.p,6,3);
  const x=t.copy();csub(x,6,[fix],AT(2));const y=t.copy();y.step(6,{...AT(2),observations:[fix]});
  const a=x.step(6,AT(3)),bb=y.step(6,AT(3));cmp('GEN timely, correction of an on-time long run (week 5) by carrier vs direct :: day 3','R7',x,a,y,bb,6,3,stale);
  const a2=x.step(6,{day:6,hour:'21:00:00'}),b2=y.step(6,{day:6,hour:'21:00:00'});cmp('GEN timely, correction of an on-time long run (week 5) :: week review','R7',x,a2,y,b2,6,6,null);
 }
 out.summary[name]=sum;
}
console.log(JSON.stringify(out,null,1));
