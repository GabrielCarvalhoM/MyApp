// R7B2-QUALITY-r1 Q1/Q2 enumeration. The decisions R7-B.2 changes are, by construction (src/r6-adaptation.mjs:368-372), those where
// clinicalRoute(kind,review) is not null and FREEZE-2 did not already return the handler's route: a class-(b) exit came first. FREEZE-2 attaches
// the canonical factual state's proposal to any such question (withFactualReplan), and that proposal has two sources: factualReplan (a correction
// that moved this week's PlanningView) and graduationWithdrawal (a correction that disqualifies a graduation's qualifying week). So the grid
// crosses each class-(b) exit with each proposal source and every block-choice shape, on both runtimes, with nonclinical controls:
//  A  same-id return resend x factual re-plan (QE-R7B2-01 class): week 5 (two weeks after the return), plus A2 week 4 and A3 the re-entry week
//  B  same-id return resend x graduation withdrawal (GRAD fixture): the re-entry week, and B2 the week after
//  C  late pre-break evidence (staleReturn) x factual re-plan: C1 re-entry this week (fromWeek=w), C2 the report week of a return reported with
//     one session left (fromWeek=w+1, a PlanningView the return does not anchor), C3 that return's re-entry week
//  D  late pre-break evidence x graduation withdrawal (a strength program that graduates at week 4), plus the two-step form
//  E  the factual re-plan's own question (CAND-01, forged state as U2 built it) x choices
//  F  a non-JSON interruption reason (throwing toString) in the same-id and CAND-01 states: the precedence point now screens it earlier
// Each changed row is classified (qr1.classify) and, once each runtime's result is applied, the sessions still ahead are compared (doseDelta).
// Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node q1-enum.mjs
import {NOW,PRED,BAD,correctionOf,apply,write,full,classify,doseDelta,CHOICES} from './qr1.mjs';

const SUB={pain:{pain:true},injury:{injury:true},painYes:{pain:'yes'},text:{text:'Knee injury, it hurts'}};
const RET={illness:{reason:'Flu illness',reasonCategory:null},injuryCategory:{reasonCategory:'INJURY'},flagTrue:{clinicalReason:true},flagYes:{clinicalReason:'yes'},aliasRETURN:{reason:'Flu illness',reasonCategory:null,_kind:'RETURN'}};
const RET_CTL={sameFacts:{},otherNonclinical:{reasonCategory:'FAMILY',reason:'Family visit'}};
const CH4=['none','ladder','declined','unrecognised'],CH8=Object.keys(CHOICES);
const W12={id:'q-enum',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12};
const GRAD={goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const GRADS={goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{strengthDays:[0,4],runMinutes:45},equipment:['DUMBBELLS','BENCH'],weeks:16};
const EV={goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};

function scenario(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs,program}=rt.H,rows=[];
 const corr=(t,w,pred,when,change=a=>a,response=BAD)=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s))).map(o=>correctionOf(o,change(structuredClone(o.actual)),when,response));
 const strengthId=(p,w,after=null)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&(!after||s.date>after)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0]??'goblet-squat';
 const push=(group,name,signal,p,rv,ledger,extra={})=>{const r=evaluateProgram(p,{...rv,actualLedger:ledger},opts);rows.push({group,name,signal,snap:full(rt,r),extra,_prog:r.proposal??p,_after:rv.asOf.slice(0,10)});return r;};
 const withChoices=(x,c)=>CHOICES[c]===undefined?x:{...x,choices:structuredClone(CHOICES[c])};
 const returnRv=(p,w,{day,hour},interruption,{id=null,observations=[],choice='none'}={})=>{const {_kind,...i}=interruption;const rv=review(p,w,withChoices({day,hour,kind:_kind??'RETURN_AFTER_PAUSE',interruption:i,observations},choice));return id?{...rv,event:{...rv.event,id}}:rv;};
 const returnFirst=(t,w,repDay,repHour='06:00:00',endOffset=-1)=>{const rep=addDays(t.p.weeks[w].startDate,repDay),first={startDate:t.p.weeks[w].startDate,endDate:addDays(rep,endOffset),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const rv=review(t.p,w,{day:repDay,hour:repHour,kind:'RETURN_AFTER_PAUSE',interruption:first});const r=apply(t,evaluateProgram(t.p,{...rv,actualLedger:t.ledger},opts));
  if(r.action!=='REESTABLISH')throw new Error(rt.label+': setup return did not re-establish: '+r.status+' '+r.reason);return {first,id:rv.event.id,rep};};

 // ---------- A: same-id resend x factual re-plan ----------
 {const t=reviewed({...W12,id:'q-enum-a'},3),R=returnFirst(t,3,3);weekly(t,3);weekly(t,4);
  const when=`${t.p.weeks[5].startDate}T05:00:00Z`,C={none:[],w4StrengthBAD:corr(t,4,s=>s.sport==='STRENGTH',when),w4RunBAD:corr(t,4,s=>s.sport==='RUN',when)};
  for(const [sn,sig] of Object.entries(RET))for(const [cn,obsv] of Object.entries(C))for(const ch of CH8)push('A',`A ${sn} | ${cn} | ${ch}`,true,t.p,returnRv(t.p,5,{day:0,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);
  for(const [sn,sig] of Object.entries(RET_CTL))for(const [cn,obsv] of Object.entries(C))for(const ch of CH8)push('A-ctl',`A-ctl ${sn} | ${cn} | ${ch}`,false,t.p,returnRv(t.p,5,{day:0,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);}
 {const t=reviewed({...W12,id:'q-enum-a2'},3),R=returnFirst(t,3,3);weekly(t,3);
  const when=`${t.p.weeks[4].startDate}T05:00:00Z`,C={none:[],w3StrengthBAD:corr(t,3,s=>s.sport==='STRENGTH',when),w3RunBAD:corr(t,3,s=>s.sport==='RUN',when)};
  for(const [sn,sig] of Object.entries(RET))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('A2',`A2 ${sn} | ${cn} | ${ch}`,true,t.p,returnRv(t.p,4,{day:0,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);
  for(const [sn,sig] of Object.entries(RET_CTL))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('A2-ctl',`A2-ctl ${sn} | ${cn} | ${ch}`,false,t.p,returnRv(t.p,4,{day:0,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);}
 {const t=reviewed({...W12,id:'q-enum-a3'},3),R=returnFirst(t,3,3);
  const when=`${addDays(R.rep,1)}T05:00:00Z`,C={none:[],w2StrengthBAD:corr(t,2,s=>s.sport==='STRENGTH',when)};
  for(const [sn,sig] of Object.entries(RET))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('A3',`A3 ${sn} | ${cn} | ${ch}`,true,t.p,returnRv(t.p,3,{day:4,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);
  for(const [sn,sig] of Object.entries(RET_CTL))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('A3-ctl',`A3-ctl ${sn} | ${cn} | ${ch}`,false,t.p,returnRv(t.p,3,{day:4,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);}

 // ---------- B: same-id resend x graduation withdrawal ----------
 {const t=reviewed({...GRAD,id:'q-enum-b'},4);if(!t.p.canonical.athlete.runGraduation)throw new Error(rt.label+': GRAD did not graduate');
  const R=returnFirst(t,4,3),when=`${addDays(R.rep,1)}T05:00:00Z`,long=s=>s.role==='LONG';
  const C={none:[],w3LongBAD:corr(t,3,long,when),w3Long10min:corr(t,3,long,when,a=>({...a,minutes:10}),null)};
  for(const [sn,sig] of Object.entries(RET))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('B',`B ${sn} | ${cn} | ${ch}`,true,t.p,returnRv(t.p,4,{day:4,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);
  for(const [sn,sig] of Object.entries(RET_CTL))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('B-ctl',`B-ctl ${sn} | ${cn} | ${ch}`,false,t.p,returnRv(t.p,4,{day:4,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);
  // B2: the week after the re-entry week (the graduation still stands on the record until a correction disqualifies it).
  weekly(t,4);const when2=`${t.p.weeks[5].startDate}T05:00:00Z`,C2={w3LongBAD:corr(t,3,long,when2),w4LongBAD:corr(t,4,long,when2)};
  for(const [sn,sig] of Object.entries(RET))for(const [cn,obsv] of Object.entries(C2))for(const ch of CH4)push('B2',`B2 ${sn} | ${cn} | ${ch}`,true,t.p,returnRv(t.p,5,{day:0,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);
  for(const [sn,sig] of Object.entries(RET_CTL))for(const [cn,obsv] of Object.entries(C2))for(const ch of CH4)push('B2-ctl',`B2-ctl ${sn} | ${cn} | ${ch}`,false,t.p,returnRv(t.p,5,{day:0,hour:'06:00:00'},{...R.first,...sig},{id:R.id,observations:obsv,choice:ch}),t.ledger);}

 // ---------- C: late pre-break evidence x factual re-plan ----------
 const lateBase=(id,repDay)=>{const t=reviewed({...W12,id},2);const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,2,{keep:s=>s.id!==late.id});const R=returnFirst(t,3,repDay);return {t,late,lateObs:obs(t.p,late),R};};
 const lateGrid=(group,t,lateObs,w,day,hour,whenDay)=>{
  const when=`${whenDay}T05:00:00Z`,X=strengthId(t.p,w);
  const C={lateOnly:[lateObs],late_w2StrengthBAD:[...corr(t,2,s=>s.sport==='STRENGTH',when),lateObs],late_w2RunBAD:[...corr(t,2,s=>s.sport==='RUN',when),lateObs],late_w2AllTrivial:[...corr(t,2,()=>true,when,a=>a,null),lateObs]};
  for(const [sn,sig] of Object.entries(SUB))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push(group,`${group} ${sn} | ${cn} | ${ch}`,true,t.p,review(t.p,w,withChoices({day,hour,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...sig},observations:obsv},ch)),t.ledger);
  for(const [sn,x] of Object.entries({weekly:{},skillSubstitution:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}}}))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push(group+'-ctl',`${group}-ctl ${sn} | ${cn} | ${ch}`,false,t.p,review(t.p,w,withChoices({day,hour,...x,observations:obsv},ch)),t.ledger);
 };
 {const {t,lateObs,R}=lateBase('q-enum-c1',3);lateGrid('C1',t,lateObs,3,4,'06:00:00',addDays(R.rep,1));}
 {const {t,lateObs,R}=lateBase('q-enum-c2',5);lateGrid('C2',t,lateObs,3,6,'06:00:00',addDays(R.rep,1));}
 {const {t,lateObs}=lateBase('q-enum-c3',5);lateGrid('C3',t,lateObs,4,0,'06:00:00',t.p.weeks[4].startDate);}

 // ---------- D: late pre-break evidence x graduation withdrawal ----------
 {const t={p:program({...GRADS,id:'q-enum-d'}),ledger:[]};for(let w=0;w<4;w++)weekly(t,w);
  const late=t.p.weeks[4].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,4,{keep:s=>s.id!==late.id});
  if(!t.p.canonical.athlete.runGraduation)throw new Error(rt.label+': GRADS did not graduate at week 4');
  const R=returnFirst(t,5,3),lateObs=obs(t.p,late),when=`${addDays(R.rep,1)}T05:00:00Z`,long=s=>s.role==='LONG',X=strengthId(t.p,5,R.rep);
  const C={lateOnly:[lateObs],late_w4LongBAD:[...corr(t,4,long,when),lateObs],late_w4Long10min:[...corr(t,4,long,when,a=>({...a,minutes:10}),null),lateObs]};
  for(const [sn,sig] of Object.entries(SUB))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('D',`D ${sn} | ${cn} | ${ch}`,true,t.p,review(t.p,5,withChoices({day:4,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...sig},observations:obsv},ch)),t.ledger);
  for(const [sn,x] of Object.entries({weekly:{},skillSubstitution:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}}}))for(const [cn,obsv] of Object.entries(C))for(const ch of CH4)push('D-ctl',`D-ctl ${sn} | ${cn} | ${ch}`,false,t.p,review(t.p,5,withChoices({day:4,hour:'06:00:00',...x,observations:obsv},ch)),t.ledger);
  // Two steps (K6b form): the late report and the correction in a review without a signal, applied; then the pain alone.
  const t2={p:t.p,ledger:t.ledger},s1=push('D-2step',`D-2step step1 weekly | late_w4LongBAD | none`,false,t2.p,review(t2.p,5,{day:3,hour:'21:00:00',observations:C.late_w4LongBAD}),t2.ledger);apply(t2,s1);
  for(const [sn,sig] of Object.entries(SUB))push('D-2step',`D-2step step2 ${sn} | none | none`,true,t2.p,review(t2.p,5,{day:4,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...sig}}),t2.ledger);}

 // ---------- E: the factual re-plan's own question (CAND-01) x choices ----------
 {const t=reviewed({...EV,id:'q-enum-e'},5),w=5,day=t.p.weeks[w].startDate,race=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.prescription);
  const forged=structuredClone(t.p),rw=forged.weeks[race.weekIndex];rw.adaptations=[...(rw.adaptations??[]),{kind:'UNAVAILABLE_DAY',eventId:'q-forged',asOf:`${day}T05:00:00Z`,asOfLocal:day,past:[],dates:[race.date]}];forged.hash=rt.P.programHash(forged);
  const fixes=corr(t,w-1,s=>s.sport==='STRENGTH',`${day}T05:00:00Z`),X=strengthId(t.p,w,day);
  const subs=Object.fromEntries(Object.entries(SUB).map(([k,v])=>[k,{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...v}}]));
  const rets={illnessReturn:{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}},injuryReturn:{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reasonCategory:'INJURY',reason:'Ankle',nonclinical:true}}};
  for(const [sn,x] of Object.entries({...subs,...rets}))for(const ch of CH4)push('E',`E ${sn} | w4StrengthBAD | ${ch}`,true,forged,review(forged,w,withChoices({day:0,hour:'06:00:00',...x,observations:fixes},ch)),t.ledger);
  for(const [sn,x] of Object.entries({weekly:{},skillSubstitution:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}}}))for(const ch of CH4)push('E-ctl',`E-ctl ${sn} | w4StrengthBAD | ${ch}`,false,forged,review(forged,w,withChoices({day:0,hour:'06:00:00',...x,observations:fixes},ch)),t.ledger);
  // F (CAND-01 state): a non-JSON interruption reason.
  const bomb={toString(){throw new Error('q-r1 throwing reason');}};
  push('F',`F factual-ask state | return with a throwing reason`,false,forged,review(forged,w,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:bomb,nonclinical:true},observations:fixes}),t.ledger);}
 {const t=reviewed({...W12,id:'q-enum-f'},3),R=returnFirst(t,3,3),bomb={toString(){throw new Error('q-r1 throwing reason');}};
  push('F',`F same-id state | resend with a throwing reason`,false,t.p,returnRv(t.p,3,{day:4,hour:'06:00:00'},{...R.first,reason:bomb},{id:R.id}),t.ledger);
  push('F',`F fresh id | return with a throwing reason (control)`,false,t.p,returnRv(t.p,3,{day:4,hour:'06:00:00'},{...R.first,reason:bomb}),t.ledger);}
 return rows;
}

const a=scenario(PRED),b=scenario(NOW);
if(a.length!==b.length)throw new Error('row count differs');
const rows=a.map((x,i)=>{const y=b[i];if(x.name!==y.name)throw new Error('row order differs at '+i);const c=classify(x.snap,y.snap);
 const changed=c.cls!=='SAME',dose=changed?doseDelta(y._prog,x._prog,y._after):null;
 return {name:x.name,group:x.group,signal:x.signal,cls:c.cls,why:c.why,differs:c.differs??[],dose,
  freeze2:{status:x.snap.status,action:x.snap.action,proposal:x.snap.proposal,proposalAction:x.snap.proposalAction,disclosureIds:x.snap.disclosureIds,pending:x.snap.pending?.status??null,ledger:x.snap.ledger,reason:x.snap.reason,missingInputs:x.snap.missingInputs},
  r7b2:{status:y.snap.status,action:y.snap.action,proposal:y.snap.proposal,proposalAction:y.snap.proposalAction,disclosureIds:y.snap.disclosureIds,pending:y.snap.pending?.status??null,ledger:y.snap.ledger,reason:y.snap.reason,missingInputs:y.snap.missingInputs}};});
const groups={};
for(const r of rows){const g=groups[r.group]??={rows:0,SAME:0,changed:0,byClass:{},freeze2WithProposal:0,freeze2ProposalActions:{},freeze2Statuses:{},r7b2Statuses:{},r7b2WithProposal:0,ledgerDiffers:0,bothProposalsDiffer:0,signalRowsNotClinicalOnR7B2:0,changedWithoutSignal:0,doseB2AboveF2Rows:0,doseB2BelowF2Rows:0};
 g.rows++;g.byClass[r.cls]=(g.byClass[r.cls]??0)+1;if(r.cls==='SAME')g.SAME++;else g.changed++;
 if(r.freeze2.proposal){g.freeze2WithProposal++;g.freeze2ProposalActions[r.freeze2.proposalAction]=(g.freeze2ProposalActions[r.freeze2.proposalAction]??0)+1;}
 if(r.r7b2.proposal)g.r7b2WithProposal++;
 g.freeze2Statuses[r.freeze2.status]=(g.freeze2Statuses[r.freeze2.status]??0)+1;g.r7b2Statuses[r.r7b2.status]=(g.r7b2Statuses[r.r7b2.status]??0)+1;
 if(r.freeze2.ledger!==r.r7b2.ledger)g.ledgerDiffers++;
 if(r.freeze2.proposal&&r.r7b2.proposal&&r.freeze2.proposal!==r.r7b2.proposal)g.bothProposalsDiffer++;
 if(r.signal&&r.r7b2.status!=='CLINICAL_HUMAN_REQUIRED')g.signalRowsNotClinicalOnR7B2++;
 if(!r.signal&&r.cls!=='SAME')g.changedWithoutSignal++;
 if(r.dose?.b2AboveF2)g.doseB2AboveF2Rows++;if(r.dose?.b2BelowF2)g.doseB2BelowF2Rows++;}
const total=Object.values(groups).reduce((s,g)=>({rows:s.rows+g.rows,changed:s.changed+g.changed}),{rows:0,changed:0});
const byClass={};for(const r of rows)byClass[r.cls]=(byClass[r.cls]??0)+1;
const outside=rows.filter(r=>!['SAME','S5_I'].includes(r.cls));
const out=write('q1-enum',{rows:rows.length,total,byClass,groups,outsideSection5:outside.map(r=>({name:r.name,cls:r.cls,why:r.why,freeze2:{status:r.freeze2.status,proposal:r.freeze2.proposal,proposalAction:r.freeze2.proposalAction,disclosureIds:r.freeze2.disclosureIds,reason:r.freeze2.reason},r7b2:{status:r.r7b2.status,proposal:r.r7b2.proposal,reason:r.r7b2.reason},dose:r.dose})),grid:rows});
console.log(JSON.stringify({rows:rows.length,total,byClass},null,0));
for(const [g,v] of Object.entries(groups))console.log(g.padEnd(8),JSON.stringify(v));
console.log('--- outside §5 shape (i):',outside.length);
const seen={};for(const r of outside){const k=r.group+' '+r.cls+' F2:'+r.freeze2.status+'/'+(r.freeze2.proposalAction??'-')+'/'+r.freeze2.disclosureIds.join('+')+' B2:'+r.r7b2.status+' dose(+'+(r.dose?.b2AboveF2??'-')+'/-'+(r.dose?.b2BelowF2??'-')+')';seen[k]=(seen[k]??0)+1;}
for(const [k,n] of Object.entries(seen))console.log(String(n).padStart(4),k);
