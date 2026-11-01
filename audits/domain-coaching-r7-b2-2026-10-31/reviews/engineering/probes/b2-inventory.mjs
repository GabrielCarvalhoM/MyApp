// DOMAIN_COACHING_R7-B.2 U2 inventory probe (TASK_CONTRACT §4): every exit that can be returned before a handler's clinical screen once a review
// is admitted, probed for reachability with a clinical signal in the same review. Read-only against the runtime at PROBE_ROOT (set it to the tree
// under test; PROBE_LABEL names the bytes). Uses the verbatim copy of the R7-B.1 judge probe library (lib.mjs) and only public runtime exports.
// Each row records the review's status, action, whether it proposes anything, the pending reference state and the reason's start.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs,apply,correctionOf,BAD,LABEL,P} from './lib.mjs';
const row=(name,r,x={})=>({name,status:r.status,action:r.action,proposal:!!r.proposal,pending:r.referenceState?.pending?.status??null,reason:String(r.reason??'').slice(0,140),...x});
const isClinical=r=>r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal;

// ---- CAND-01: the factual re-plan's own question (factual?.ask) is returned without running any handler ----
// Its sources: factualReplan -> composeWeeks -> reapply of a recorded UNAVAILABLE_DAY adaptation over the race date (r6-composition reapply), and
// graduationWithdrawal -> rebuild (an arrangement trade-off, or the same composition question). The unavailable-day handler refuses to record a date
// that holds the race, and an event moves only through goalChange, whose own rebuild asks the same question; so the probe builds the state directly:
// a program of the runtime with that adaptation added to its race week and its hash recomputed (validProgram checks only the hash), and a review
// whose correction of last week's reports moves this week's PlanningView, so the factual re-plan runs and asks.
const c01=[];
guard('CAND-01','factual re-plan question x clinical',()=>{
 const EV={id:'b2-c01',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
 const t=reviewed(EV,5),w=5,day=t.p.weeks[w].startDate;
 const race=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.prescription);
 const forged=structuredClone(t.p),rw=forged.weeks[race.weekIndex];
 rw.adaptations=[...(rw.adaptations??[]),{kind:'UNAVAILABLE_DAY',eventId:'b2-forged',asOf:`${day}T05:00:00Z`,asOfLocal:day,past:[],dates:[race.date]}];
 forged.hash=P.programHash(forged);
 const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w-1].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD));
 const X=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const at=(p,x)=>evaluateProgram(p,{...review(p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
 const pain={kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}};
 c01.push({raceWeek:race.weekIndex,raceDate:race.date,validProgram:P.validProgram(forged),corrections:fixes.length,exercise:X});
 c01.push(row('control: forged program, correction, weekly review',at(forged,{observations:fixes})));
 c01.push(row('forged program, correction, substitution pain',at(forged,{...pain,observations:fixes})));
 c01.push(row('control: forged program, no correction, substitution pain',at(forged,{...pain,observations:[]})));
 c01.push(row('control: runtime program, correction, substitution pain',at(t.p,{...pain,observations:fixes})));
 c01.push(row('forged program, correction, return with an illness',at(forged,{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true},observations:fixes})));
});
const c01ask=c01.slice(1).find(r=>r.name.startsWith('control: forged program, correction, weekly'));
const c01bypass=c01.filter(r=>r.name&&!r.name.startsWith('control')&&/pain|illness/.test(r.name)&&r.status!=='CLINICAL_HUMAN_REQUIRED');
record('CAND-01','factual re-plan question before the clinical screen',!c01bypass.length,'a review reporting pain or illness routes to a human even when the factual re-plan raises its own question',{label:LABEL,factualAskFires:/marked unavailable/.test(c01ask?.reason??''),rows:c01,bypass:c01bypass});

// ---- CAND-02: returnAfterPause's same-event-id question comes before its own interruption-reason screen ----
const c02=[];
guard('CAND-02','report-identity question x clinical',()=>{
 const t=reviewed({id:'b2-c02',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first}),E=r0.event.id;
 const ret=apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts));
 c02.push(row('return (WORK)',ret,{eventId:E}));
 const again=(name,interruption,id=E)=>{const r=review(t.p,3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption});c02.push(row(name,evaluateProgram(t.p,{...r,event:{...r.event,id},actualLedger:t.ledger},opts),{sameId:id===E}));};
 again('control: same id, same facts',first);
 again('same id, illness reason',{...first,reasonCategory:null,reason:'Flu illness'});
 again('same id, injury category',{...first,reasonCategory:'INJURY',reason:'Twisted ankle'});
 again('same id, clinical flag',{...first,clinicalReason:true});
 again('control: same id, other nonclinical facts',{...first,reason:'Family visit',reasonCategory:'FAMILY'});
 again('control: new id, illness reason',{...first,reasonCategory:null,reason:'Flu illness'},E+'-new');
});
const c02bypass=c02.filter(r=>/illness|injury|clinical flag/.test(r.name)&&r.sameId&&r.status!=='CLINICAL_HUMAN_REQUIRED');
record('CAND-02','same-event-id question before the return screen',!c02bypass.length,'a resent return report whose reason is clinical routes to a human, whatever id it reuses',{label:LABEL,rows:c02,bypass:c02bypass});

// ---- Adjacent exits recorded for the classification (TASK_CONTRACT §4 (a)/(c)); none is expected to change ----
const adj=[];
guard('ADJ','adjacent exits',()=>{
 const t=reviewed({id:'b2-adj',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const X=t.p.weeks[2].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const at=(name,x,y={})=>adj.push(row(name,evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger,...y},opts)));
 at('substitution pain without the exercise (handler contract, :541)',{kind:'EXERCISE_SUBSTITUTION',substitution:{reason:'SKILL_MISMATCH',pain:true}});
 at('substitution pain, eligibility not assessed (:316)',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}},{eligibility:null});
 at('substitution pain, eligibility flag (:312)',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}},{eligibility:{...review(t.p,2,{day:0}).eligibility,pain:true}});
 at('substitution pain, malformed observations (:322)',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}},{observations:'x'});
 at('substitution pain, plain',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}});
 at('weekly review carrying a substitution with pain (no screen of its own)',{kind:'WEEKLY_REVIEW',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}});
});
record('ADJ','adjacent exits recorded for the classification',true,'recorded, not judged here',{label:LABEL,rows:adj});
done('b2-inventory');
