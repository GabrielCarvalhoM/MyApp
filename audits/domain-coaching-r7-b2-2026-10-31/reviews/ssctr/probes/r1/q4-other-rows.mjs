// R7B2-SSCTR-r1 probe Q4 (SSCTR judge, session 6): the other changed decision classes (K6 rows, K6b, CAND-02, CAND-01). For each changed row:
// FREEZE-2 and R7-B.2 status, proposal (on either side), missing inputs, pending state and whether the review's evidence is recorded; then the
// follow-ups that show whether the nonclinical question that was replaced is still asked once no clinical state is carried, and that the clinical
// dependency is sticky while it is carried. Read-only on both trees (dual.mjs); writes only ./out/q4-other-rows.json.
import {NOW,PRED,correctionOf,BAD,apply,write,reentry,at,sub,recorded} from './dual.mjs';
const S=r=>({status:r.status,action:r.action,proposal:r.proposal?r.proposal.hash.slice(0,12):null,missing:r.missingInputs??[],pending:r.referenceState?.pending?.status??null,reason:String(r.reason??'').slice(0,120)});
function runAll(rt){
 const {review,evaluateProgram,opts,live,addDays,reviewed}=rt.H,rows=[];
 const row=(cls,name,r,x={})=>rows.push({cls,name,...S(r),...x});
 // K6: late pre-break report + substitution pain in the re-entry week (same review), with choices.
 for(const [label,extra] of [['pain',{}],['pain + ladder choice',{choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}],['pain + unrecognised choice',{choices:[{type:'SOMETHING'}]}],['injury',{inj:true}],['clinical text',{txt:true}]]){
  const e=reentry(rt,'ssctr-q4');
  const s=extra.inj?sub(e.X,{injury:true}):extra.txt?sub(e.X,{text:'Sharp knee pain when I squat'}):sub(e.X,{pain:true});
  const r=at(rt,e.t,3,{...s,...(extra.choices?{choices:extra.choices}:{}),observations:[e.lateObs]});
  row('K6','late + '+label,r,{lateRecorded:recorded(r,e.late)});
  if(label==='pain'){
   const t2={p:e.t.p,ledger:r.actualLedger};
   const noRef=evaluateProgram(t2.p,{...review(t2.p,3,{day:5,hour:'06:00:00'}),actualLedger:t2.ledger},opts);
   row('K6-after','later weekly review, no signal, no reference state',noRef,{lateStillRecorded:recorded(noRef,e.late)});
   const withRef=evaluateProgram(t2.p,{...review(t2.p,3,{day:5,hour:'06:00:00'}),referenceState:r.referenceState,actualLedger:t2.ledger},opts);
   row('K6-after','later weekly review, carrying the reference state',withRef);
  }
 }
 // K6b: the late report in one review, the pain alone in a later review of the same week, carrying the first step's reference state.
 {const e=reentry(rt,'ssctr-q4b');const r1=at(rt,e.t,3,{observations:[e.lateObs]});row('K6b','step 1: late report only',r1);
  const t2={p:e.t.p,ledger:r1.actualLedger};
  const r2=evaluateProgram(t2.p,{...review(t2.p,3,{day:4,hour:'09:00:00',...sub(e.X,{pain:true})}),referenceState:r1.referenceState,actualLedger:t2.ledger},opts);
  row('K6b','step 2: pain only, with step 1 reference state',r2,{lateRecorded:recorded(r2,e.late)});}
 // CAND-02: a recorded return resent under its event id with a clinical reason (no correction), and controls.
 {const t=reviewed({id:'ssctr-q4c',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
  const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first}),E=r0.event.id;apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts));
  const again=(name,i,id=E)=>{const r=review(t.p,3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:i});const x=evaluateProgram(t.p,{...r,event:{...r.event,id},actualLedger:t.ledger},opts);row('CAND-02',name,x);return x;};
  const ill=again('same id, illness reason',{...first,reasonCategory:null,reason:'Flu illness'});
  again('same id, injury category',{...first,reasonCategory:'INJURY',reason:'Twisted ankle'});
  again('same id, clinical flag',{...first,clinicalReason:true});
  again('control: same id, same facts',first);
  again('control: same id, other nonclinical facts',{...first,reasonCategory:'FAMILY',reason:'Family visit'});
  again('control: new id, illness reason',{...first,reasonCategory:null,reason:'Flu illness'},E+'-new');
  const withRef=evaluateProgram(t.p,{...review(t.p,3,{day:5,hour:'06:00:00'}),referenceState:ill.referenceState,actualLedger:t.ledger},opts);
  row('CAND-02-after','later weekly review, carrying the reference state',withRef);
  const noRef=evaluateProgram(t.p,{...review(t.p,3,{day:5,hour:'06:00:00'}),actualLedger:t.ledger},opts);
  row('CAND-02-after','later weekly review, no reference state',noRef);}
 // CAND-01: the factual re-plan's own question (state built as in the mission inventory: an UNAVAILABLE_DAY adaptation over the race date).
 {const EV={id:'ssctr-q4d',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
  const t=reviewed(EV,5),w=5,day=t.p.weeks[w].startDate,race=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.prescription);
  const forged=structuredClone(t.p),rw=forged.weeks[race.weekIndex];rw.adaptations=[...(rw.adaptations??[]),{kind:'UNAVAILABLE_DAY',eventId:'ssctr-forged',asOf:`${day}T05:00:00Z`,asOfLocal:day,past:[],dates:[race.date]}];forged.hash=rt.P.programHash(forged);
  const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w-1].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD));
  const X=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const ev=(p,x)=>evaluateProgram(p,{...review(p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
  row('CAND-01','control: forged, correction, weekly (the factual question)',ev(forged,{observations:fixes}));
  const cp=ev(forged,{...sub(X,{pain:true}),observations:fixes});row('CAND-01','forged, correction, substitution pain',cp,{correctionRecorded:(cp.actualLedger??[]).some(o=>o.correctionOf)});
  row('CAND-01','forged, correction, return with an illness',ev(forged,{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true},observations:fixes}));
  // After the clinical route, the next nonclinical review that carries the same facts again: is the factual question still asked?
  const t2={p:forged,ledger:cp.actualLedger};
  row('CAND-01-after','later weekly review, no reference state, no reports',evaluateProgram(t2.p,{...review(t2.p,w,{day:1,hour:'06:00:00'}),actualLedger:t2.ledger},opts));
 }
 return rows;
}
const a=runAll(PRED),b=runAll(NOW);
const rows=a.map((x,i)=>{const y=b[i];const same=JSON.stringify(x)===JSON.stringify(y);return {cls:x.cls,name:x.name,same,freeze2:x,r7b2:y,
 changedInsideSection5:!same&&x.status==='ASK'&&!x.proposal&&y.status==='CLINICAL_HUMAN_REQUIRED'&&!y.proposal};});
const changed=rows.filter(r=>!r.same);
const out=write('q4-other-rows',{rows,changed:changed.map(r=>r.cls+': '+r.name),changedOutsideSection5:changed.filter(r=>!r.changedInsideSection5).map(r=>r.cls+': '+r.name)});
for(const r of rows)console.log((r.same?'SAME ':'DIFF ')+r.cls+' | '+r.name+' | F2 '+r.freeze2.status+(r.freeze2.proposal?' +P':'')+' '+JSON.stringify(r.freeze2.missing)+' pend='+r.freeze2.pending+' | B2 '+r.r7b2.status+(r.r7b2.proposal?' +P':'')+' '+JSON.stringify(r.r7b2.missing)+' pend='+r.r7b2.pending+(r.r7b2.lateRecorded!==undefined?' late='+r.r7b2.lateRecorded:'')+(r.r7b2.lateStillRecorded!==undefined?' lateStill='+r.r7b2.lateStillRecorded:'')+(r.r7b2.correctionRecorded!==undefined?' corr='+r.r7b2.correctionRecorded:''));
console.log('changedOutsideSection5:',JSON.stringify(out.changedOutsideSection5));
