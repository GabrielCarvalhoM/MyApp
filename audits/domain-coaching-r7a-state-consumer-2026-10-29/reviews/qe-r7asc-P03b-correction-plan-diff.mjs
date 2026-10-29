// P03b (reviewer-owned): P03-B1 showed every historical reader equal to the control, but the closing decision INSTANTIATE_LOGGED_LOADS (corrected)
// against KEEP (control). Which planned sessions differ, and is any difference read from the retracted 22 kg? Compares the two programs after
// the closing review, session by session, from week 4 on; and the stored start (stateTrace) of week 5 for db-rdl.
import * as L from './qe-r7asc-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asc-P03b-correction-plan-diff',root:L.ROOT_USED};
function cell(kind){
 L.resetIds();const t=L.start('qe-p03',4),w=4,sat=t.p.weeks[w].sessions.find(L.SAT),X=sat.prescription.exercises.find(e=>e.id===ID).load.value,others=t.p.weeks[w].sessions.filter(s=>L.live(s)&&s!==sat);
 const at=kg=>(id,e)=>id===ID?kg:(e.load.mode==='KNOWN'?e.load.value:20),satObs=(opt,id)=>({...L.obs(t.p,sat,opt),eventId:id,observedAt:`${sat.date}T19:00:00Z`});
 L.step(t,L.at(t.p,w,4,'21:00:00',{observations:others.filter(s=>s.day<6).map((s,i)=>({...L.obs(t.p,s),eventId:`p03-B1-o${i}`}))}));
 const sunday=others.filter(s=>s.day===6).map((s,i)=>({...L.obs(t.p,s),eventId:`p03-B1-s${i}`}));
 const decisions=[];
 if(kind==='CONTROL'){decisions.push(L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[satObs({kg:at(X)},'p03-sat')]})).action);}
 else{const o=satObs({kg:at(X+2)},'p03-sat');decisions.push(L.step(t,L.at(t.p,w,5,'21:00:00',{observations:[o]})).action);decisions.push(L.step(t,L.at(t.p,w,6,'20:30:00',{observations:[{...satObs({kg:at(X)},'p03-sat-fix'),correctionOf:o.eventId,correctedAt:`${L.addDays(t.p.weeks[w].startDate,6)}T20:00:00Z`}]})).action);}
 const before=structuredClone(t.p);
 const r=L.step(t,L.at(t.p,w,6,'21:00:00',{observations:sunday}));decisions.push(r.action);
 return {t,before,decisions,counter:r.counterfactuals?.map(c=>({id:c.id,admissible:c.admissible,reason:c.reason,changeCount:c.changeCount})),st5:t.p.stateTrace[5].strength.exercises[ID],st5before:before.stateTrace[5].strength.exercises[ID]};
}
const C=cell('CONTROL'),K=cell('CORRECTED');
const sessions=p=>new Map(p.weeks.slice(4).flatMap(w=>w.sessions.map(s=>[s.id,s])));
const a=sessions(C.t.p),b=sessions(K.t.p),diff=[];
for(const [id,s] of a){const x=b.get(id);if(L.V.hash(s.prescription)!==L.V.hash(x?.prescription))diff.push({id,control:s.prescription?.exercises?.map(e=>`${e.id} ${e.load.mode}${e.load.value??''} ${e.sets}x${e.reps}`)??s.prescription?.durationMinutes,corrected:x?.prescription?.exercises?.map(e=>`${e.id} ${e.load.mode}${e.load.value??''} ${e.sets}x${e.reps}`)??x?.prescription?.durationMinutes});}
// The corrected cell's program BEFORE its closing review vs the control's: did a mid-week decision of the corrected cell write anything?
const pb=sessions(K.before),pc=sessions(C.before),diffBefore=[];for(const [id,s] of pc){const x=pb.get(id);if(L.V.hash(s.prescription)!==L.V.hash(x?.prescription))diffBefore.push(id);}
out.decisions={CONTROL:C.decisions,CORRECTED:K.decisions};
out.closingCounterfactuals={CONTROL:C.counter,CORRECTED:K.counter};
out.sessionsDifferingAfterClose=diff;
out.sessionsDifferingBeforeClose=diffBefore;
out.programHashBeforeClose={CONTROL:C.before.hash,CORRECTED:K.before.hash};
out.stateTraceWeek5={CONTROL:C.st5,CORRECTED:K.st5,CONTROLbefore:C.st5before,CORRECTEDbefore:K.st5before};
console.log(JSON.stringify(out,null,1));
