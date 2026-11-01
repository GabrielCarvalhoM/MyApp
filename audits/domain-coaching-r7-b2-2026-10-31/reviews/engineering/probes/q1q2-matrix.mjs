// QE-R7B2 judge probe Q1/Q2 (request REVIEW Q1, Q2): in a return's re-entry week with late pre-break evidence (K6/K6b state), every clinical
// signal the handlers' screens read, alone and with every block-choice shape, in the same review and in two steps, must give the handler's own
// clinical route on R7-B.2 (CLINICAL_HUMAN_REQUIRED, no proposal, the handler's own reason, pending CLINICAL_HUMAN_REQUIRED, late report recorded);
// every review without a clinical signal must decide exactly as on R7B1-FREEZE-2 (all output fields); after the clinical route, a later review with
// no signal and no pending clinical state must still get R7-A's question. Read-only on both trees (dual.mjs).
import {NOW,PRED,BAD,correctionOf,apply,snap,diff,write,reentry,at,sub,recorded} from './dual.mjs';

const SIGNALS=[['pain:true',{pain:true}],['injury:true',{injury:true}],["pain:'yes'",{pain:'yes'}],["pain:'SIM'",{pain:'SIM'}],['pain:1',{pain:1}],["injury:'Y'",{injury:'Y'}],["pain:' Yes '",{pain:' Yes '}],
 ['text: knee hurts',{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'My knee hurts when I squat'}],['text: dor no ombro',{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'Sinto dor no ombro'}],
 ["text: couldn't run without pain",{text:"I couldn't do it without pain"}],['pain, no reason',{reason:undefined,pain:true}],['pain + nonclinicalConfirmed',{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,pain:true}]];
const CHOICES=[['none',undefined],['empty list',[]],['ladder step',[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]],['graduation decline',[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]],['graduation accept',[{offer:'RUN_QUALITY_GRADUATION',decision:'ACCEPT'}]],
 ['main change',[{type:'MAIN_CHANGE',from:'goblet-squat',to:'db-split-squat',reason:'ATHLETE_PREFERENCE'}]],['unrecognised',[{type:'LADDER_JUMP'}]],['null entry',[null]],['string entry',['x']]];
const RETURNS=[['return illness',{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reason:'Flu illness',nonclinical:true}}],['return injury category',{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reasonCategory:'INJURY',reason:'Twisted ankle'}}],
 ['return clinical flag',{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reasonCategory:'WORK',reason:'Work',clinicalReason:true}}],["return clinical flag 'yes'",{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reasonCategory:'WORK',reason:'Work',clinicalReason:'yes'}}],
 ["alias kind 'RETURN' + illness",{kind:'RETURN',interruption:{days:1,reason:'Flu illness',nonclinical:true}}]];
const NONCLINICAL=X=>[['weekly',{}],['sub pain:false',sub(X,{pain:false,injury:false})],["sub pain:'no'",sub(X,{pain:'no'})],["sub pain:'nao'",sub(X,{pain:'nao'})],["sub pain:'maybe'",sub(X,{pain:'maybe'})],['sub pain:null',sub(X,{pain:null})],['sub pain:0',sub(X,{pain:0})],
 ['sub skill mismatch',sub(X)],['sub dislike, confirmed',sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'I just dislike this one'})],['sub dislike, not confirmed',sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE'})],
 ['sub text ambiguous',sub(X,{text:'it feels weird'})],['sub text denial',sub(X,{text:'no pain at all, I just prefer another one'})],['sub text pain free',sub(X,{text:'pain free, just bored'})],
 ['OBS-01 sub pain without exercise',{kind:'EXERCISE_SUBSTITUTION',substitution:{reason:'SKILL_MISMATCH',pain:true}}],['weekly carrying sub.pain (no screen of its own)',{kind:'WEEKLY_REVIEW',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}}],
 ['equipment change',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS']}}],['schedule change',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}}],['missed session',{kind:'MISSED_SESSION',targetSessionId:'w3-str-d4'}],
 ['partial session',{kind:'PARTIAL_SESSION'}],['local fatigue',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}],['systemic fatigue',{kind:'SYSTEMIC_FATIGUE'}],['underperformance',{kind:'UNDERPERFORMANCE'}],['goal change',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}],
 ['recovered',{kind:'RECOVERED'}],['unavailable day',{kind:'UNAVAILABLE_DAY',dates:['2026-11-29']}],['event week conflict',{kind:'EVENT_WEEK_CONFLICT'}],['return nonclinical (FAMILY)',{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reasonCategory:'FAMILY',reason:'Family visit',nonclinical:true}}],
 ['ladder choice only',{choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}],['unrecognised choice only',{choices:[{type:'LADDER_JUMP'}]}]];

function scenario(rt){
 const same=[],two=[],after=[],pres=[],neighD=[];
 const e=reentry(rt,'qe-q1');const {t,late,lateObs,X}=e;
 // Q1, one review: every signal x every choice shape, with the late report; the reference is the same review without it.
 for(const [sn,sx] of SIGNALS)for(const [cn,choices] of CHOICES){
  const x={...sub(X,sx),...(choices!==undefined?{choices}:{})};
  const r=at(rt,t,3,{...x,observations:[lateObs]}),ref=at(rt,t,3,{...x,observations:[]});
  same.push({signal:sn,choice:cn,withLate:snap(rt,r),noLate:{status:ref.status,reason:ref.reason,proposal:!!ref.proposal,counterfactuals:snap(rt,ref).counterfactuals},lateRecorded:recorded(r,late)});
 }
 for(const [rn,rx] of RETURNS)for(const [cn,choices] of [CHOICES[0],CHOICES[2],CHOICES[6]]){
  const x={...rx,...(choices!==undefined?{choices}:{})};
  const r=at(rt,t,3,{...x,observations:[lateObs]}),ref=at(rt,t,3,{...x,observations:[]});
  same.push({signal:rn,choice:cn,withLate:snap(rt,r),noLate:{status:ref.status,reason:ref.reason,proposal:!!ref.proposal,counterfactuals:snap(rt,ref).counterfactuals},lateRecorded:recorded(r,late)});
 }
 // Q1, two steps (K6b): the late report alone, then the signal alone; also carrying the first step's reference state, and with a block choice.
 for(const [sn,sx] of [SIGNALS[0],SIGNALS[1],SIGNALS[2],SIGNALS[7],['return illness',null],['return injury category',null]]){
  const f=reentry(rt,'qe-q1b');
  const sync=apply(f.t,at(rt,f.t,3,{observations:[f.lateObs]},{hour:'05:00:00'}));
  const x=sx?sub(f.X,sx):RETURNS.find(r=>r[0]===sn)[1];
  const r=at(rt,f.t,3,x),rs=at(rt,f.t,3,{...x,referenceState:sync.referenceState},{hour:'06:30:00'}),rc=at(rt,f.t,3,{...x,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]},{hour:'07:00:00'});
  two.push({signal:sn,sync:{status:sync.status,missing:sync.missingInputs,lateRecorded:recorded(sync,f.late)},alone:snap(rt,r),aloneLateStillRecorded:recorded(r,f.late),withSyncReferenceState:snap(rt,rs),withChoice:snap(rt,rc)});
 }
 // Q2 after the clinical route: the pain + late review is applied; later reviews of the same re-entry week.
 {const f=reentry(rt,'qe-q2a');const r=apply(f.t,at(rt,f.t,3,{...sub(f.X,{pain:true}),observations:[f.lateObs]}));
  after.push({step:'pain + late (applied)',...snap(rt,r)});
  const n1=at(rt,f.t,3,{},{day:5});after.push({step:'later review, no signal, no reference state',...snap(rt,n1),lateRecorded:recorded(n1,f.late)});
  after.push({step:'later review, no signal, carrying the clinical reference state',...snap(rt,at(rt,f.t,3,{referenceState:r.referenceState},{day:5,hour:'07:00:00'}))});
  const q=n1.question;
  if(q){const c=apply(f.t,at(rt,f.t,3,{kind:'RETURN_AFTER_PAUSE',interruption:{episodeId:q.episodeId,startDate:q.startDate,endDate:q.endDate,reasonCategory:'WORK',reason:'Work travel',nonclinical:true}},{day:5,hour:'08:00:00'}));
   after.push({step:'the interruption confirmed again (episodeId from the question)',...snap(rt,c)});
   after.push({step:'later review after the confirmation, no signal',...snap(rt,at(rt,f.t,3,{},{day:5,hour:'20:00:00'}))});}
 }
 // Q2 preserved A and adjacent: late report, no clinical signal, every kind (all output fields must equal FREEZE-2's).
 for(const [n,x] of NONCLINICAL(X))pres.push({name:n,...snap(rt,at(rt,t,3,{...x,observations:[lateObs]}))});
 // Neighbor D: nonclinical corrections of week 2's strength reports + the late report; also corrections alone.
 {const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${rt.H.addDays(t.p.weeks[3].startDate,4)}T05:00:00Z`,BAD));
  const r=at(rt,t,3,{observations:[...fixes,lateObs]});neighD.push({name:'D corrections + late',...snap(rt,r),correctionRecorded:(r.actualLedger??[]).some(o=>o.correctionOf),lateRecorded:recorded(r,late)});
  neighD.push({name:'D corrections alone',...snap(rt,at(rt,t,3,{observations:fixes}))});
  neighD.push({name:'D sub skill + corrections + late',...snap(rt,at(rt,t,3,{...sub(X),observations:[...fixes,lateObs]}))});}
 return {same,two,after,pres,neighD};
}
const A=scenario(PRED),B=scenario(NOW);
const isRoute=(s,reason)=>s.status==='CLINICAL_HUMAN_REQUIRED'&&s.action==='CLINICAL_HUMAN_REQUIRED'&&s.proposal===null&&s.pending?.status==='CLINICAL_HUMAN_REQUIRED'&&s.pending?.reason===s.reason&&(reason===undefined||s.reason===reason)&&!s.missingInputs.length;
const q1Same=B.same.map((b,i)=>{const a=A.same[i];const ok=isRoute(b.withLate,b.noLate.reason)&&b.noLate.status==='CLINICAL_HUMAN_REQUIRED'&&b.noLate.reason===a.noLate.reason&&b.withLate.counterfactuals===b.noLate.counterfactuals&&b.lateRecorded;
 return {signal:b.signal,choice:b.choice,ok,r7b2:{status:b.withLate.status,proposal:b.withLate.proposal,pending:b.withLate.pending?.status,reasonIsHandlers:b.withLate.reason===b.noLate.reason,lateRecorded:b.lateRecorded},freeze2:{status:a.withLate.status,proposal:a.withLate.proposal,reason:String(a.withLate.reason).slice(0,80)},handlerReasonSameOnBoth:b.noLate.reason===a.noLate.reason};});
const q1Two=B.two.map((b,i)=>{const a=A.two[i];return {signal:b.signal,ok:isRoute(b.alone)&&isRoute(b.withSyncReferenceState)&&isRoute(b.withChoice)&&b.aloneLateStillRecorded&&b.sync.lateRecorded,r7b2:{alone:b.alone.status,withSyncReferenceState:b.withSyncReferenceState.status,withChoice:b.withChoice.status,lateStillRecorded:b.aloneLateStillRecorded},freeze2:{alone:a.alone.status,withSyncReferenceState:a.withSyncReferenceState.status,withChoice:a.withChoice.status},sync:b.sync};});
const q2After=B.after.map((b,i)=>({step:b.step,same:!diff(A.after[i],b).length||i===0,differs:diff(A.after[i],b),r7b2:{status:b.status,missing:b.missingInputs,pending:b.pending?.status??null,proposal:b.proposal},freeze2:{status:A.after[i].status,missing:A.after[i].missingInputs,pending:A.after[i].pending?.status??null}}));
const q2Pres=B.pres.map((b,i)=>({name:b.name,same:!diff(A.pres[i],b).length,differs:diff(A.pres[i],b),status:b.status,clinical:b.status==='CLINICAL_HUMAN_REQUIRED',reason:String(b.reason).slice(0,100)}));
const q2D=B.neighD.map((b,i)=>({name:b.name,same:!diff(A.neighD[i],b).length,differs:diff(A.neighD[i],b),status:b.status,proposal:b.proposal,correctionRecorded:b.correctionRecorded,lateRecorded:b.lateRecorded}));
const verdict={q1SameReview:{cases:q1Same.length,ok:q1Same.filter(r=>r.ok).length,failed:q1Same.filter(r=>!r.ok)},q1TwoStep:{cases:q1Two.length,ok:q1Two.filter(r=>r.ok).length,failed:q1Two.filter(r=>!r.ok)},
 q2After:{rows:q2After},q2Preserved:{cases:q2Pres.length,identical:q2Pres.filter(r=>r.same).length,changed:q2Pres.filter(r=>!r.same),anyClinical:q2Pres.filter(r=>r.clinical).map(r=>r.name)},q2NeighborD:q2D};
write('q1q2-matrix',{verdict,q1Same,q1Two,q2After,q2Pres,q2D});
console.log(JSON.stringify({q1SameReview:{cases:verdict.q1SameReview.cases,ok:verdict.q1SameReview.ok,failed:verdict.q1SameReview.failed.map(r=>r.signal+' / '+r.choice+' -> '+JSON.stringify(r.r7b2))},
 q1TwoStep:{cases:q1Two.length,ok:verdict.q1TwoStep.ok,failed:verdict.q1TwoStep.failed},freeze2SameReviewStatuses:[...new Set(q1Same.map(r=>r.freeze2.status))],
 q2After:q2After.map(r=>r.step+': F2 '+r.freeze2.status+' / B2 '+r.r7b2.status+' '+JSON.stringify(r.r7b2.missing)+(r.same?' SAME':' DIFF '+r.differs)),
 q2Preserved:{cases:q2Pres.length,identical:verdict.q2Preserved.identical,changed:verdict.q2Preserved.changed.map(r=>r.name+' '+r.differs),anyClinical:verdict.q2Preserved.anyClinical,statuses:q2Pres.map(r=>r.name+': '+r.status)},q2D},null,1));
