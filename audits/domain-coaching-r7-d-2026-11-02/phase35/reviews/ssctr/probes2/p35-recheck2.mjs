// SSCTR R7-D Phase 3.5 narrow recheck r2 (REVIEW_REQUEST_PHASE35_R2.md section 3, SSCTR questions 1 and 3), written by the fresh SSCTR instance of
// SSCTR-R7D-P35-RECHECK-r2. Synthetic development fixtures (CoachingCore/r7/b/fixtures/helpers.mjs, with the helpers of
// CoachingCore/test/r7d-phase35.test.mjs restated here): engineering evidence for a domain recheck only, never gate, quality or generalization
// evidence. Read-only: it writes no file. Run it on a scratch root holding CoachingCore and the five SSCTR authority records, never on the repository:
//   node p35-recheck2.mjs <root holding CoachingCore> --label <name>
// Standard fixture (the T36 founders shape): strength Mon (day 0, PM) and Fri (4, PM), runs Tue (1) and Thu (3), the long run Sun (6); day n counts
// from Mon of week 2. A = the holiday days 0-13, kept on Mon wk4; weeks 4-5 reported with the Friday lift missed (strength re-enters, running does
// not: A is read as its own return); D = the work trip Mon-Thu wk6 (days 28-31), named, declared Fri wk6; a plain review an hour later.
//  QH17*  the re-send of D after that return: unnamed (u) and named (n); with days and end only (d); a week later (w7); a changed nonclinical reason
//         text (x); a reason text that turns clinical (cl).
//  QH18*  R07: the late first-day lift asks A's start time; A restated after the lift asks the I6 confirmation; confirmed by D's dates unnamed (u)
//         or named (n); c = the start time stated from the outset (T33 control).
//  CT*    controls: TA, the TRAINING_AFTER row (weeks 4-5 reported in full); SB, a single-break duplicate; CO, a continuity return re-sent with the
//         trip's days (CO) and with the whole recorded stop's days (COw).
//  T37*   a report of A (listed by the latest return) whose reason text turns clinical, by each channel: after the re-entry week (week 8, as T37),
//         inside it (week 6), and the review after it.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.resolve(process.argv[2]),label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:root;
const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=L;
const GEN={id:'r7d-p35-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const A=()=>brk(0,13);
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s),all=(p,s)=>obs(p,s);
const weekObs=(p,w,f=all)=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const tag=e=>String(e).split('-').at(-1);
/** The return in force (stop, class, relation and basis, each separate break) and every run and strength dose of weeks w and w+1 from day d. */
function full(t,w,d=6){
 const x=lastReturn(t.p),from=addDays(t.p.weeks[w].startDate,d),ws=t.p.weeks.slice(w,w+2);
 return {ret:x?`${x.class} ${x.days}d ${x.startDate}..${x.endDate} ${x.entry?.run?.mode??''}`:null,relation:x?`${x.relation}/${x.basis} rev ${x.revision}`:null,
  breaks:x?(x.separateBreaks??null)?.map(b=>`${tag(b.episode)}:${b.stop}${b.reentryWeek?' reentry '+b.reentryWeek:''}${b.ownReturn?' reentered RUN '+b.ownReturn.reentered.RUN+' STRENGTH '+b.ownReturn.reentered.STRENGTH:''}`)??null:null,
  runs:ws.flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.date} ${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`),
  strength:ws.flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).map(s=>`${s.date} `+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`).join(' ')),
  returnsApplied:returns(t.p).length};
}
const dec=r=>({action:r.action,status:r.status??null,missingInputs:r.missingInputs??[],question:r.question?{kind:r.question.kind??null,episodeId:r.question.episodeId?tag(r.question.episodeId):null,startDate:r.question.startDate??null}:null,reason:(r.reason??'').slice(0,300)});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const out={runtime:label,cases:{},comparisons:{}};
function founders(id,{report=miss(friStrength),a=A()}={}){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,report))});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};
}
const send=(x,id,i,{w=6,when={day:5,hour:'11:00:00'},n=''}={})=>step(x.t,w,{...when,kind:'RETURN_AFTER_PAUSE',interruption:i,event:{id:`${id}-re-${w}-${when.hour}${n}`,kind:'RETURN_AFTER_PAUSE'}});
const later=t=>[step(t,6,{day:5,hour:'13:00:00'}),step(t,6,{day:6,hour:'21:00:00'}),step(t,7,{observations:weekObs(t.p,7)}),step(t,8,{observations:weekObs(t.p,8)})].map(r=>r.action+(r.missingInputs?.length?' '+r.missingInputs.join('|'):''));
const named=(id,x={})=>({...trip(28,31),...x,episodeId:id+'-D'});

// ---------- QH17: the re-send of D after a return that read A as its own return ----------
{const variants=[
  ['QH17u_unnamed',id=>trip(28,31),{}],['QH17n_named',id=>named(id),{}],
  ['QH17du_daysAndEndOnly_unnamed',id=>{const {startDate,...i}=trip(28,31);return i;},{}],['QH17dn_daysAndEndOnly_named',id=>{const {startDate,...i}=named(id);return i;},{}],
  ['QH17w7u_aWeekLater_unnamed',id=>trip(28,31),{w:7,when:{day:1,hour:'07:00:00'}}],['QH17w7n_aWeekLater_named',id=>named(id),{w:7,when:{day:1,hour:'07:00:00'}}],
  ['QH17xu_otherNonclinicalReason_unnamed',id=>trip(28,31,{reason:'Work trip, a delayed flight home'}),{}],['QH17xn_otherNonclinicalReason_named',id=>named(id,{reason:'Work trip, a delayed flight home'}),{}],
  ['QH17clu_reasonTurnsClinical_unnamed',id=>trip(28,31,{reason:'Work trip, then the flu with a fever'}),{}],['QH17cln_reasonTurnsClinical_named',id=>named(id,{reason:'Work trip, then the flu with a fever'}),{}]];
 for(const [k,mk,o] of variants){const id=k.slice(0,9).toLowerCase(),x=founders(id),first=full(x.t,6,6),r=send(x,id,mk(id),o),w=o.w??6;
  out.cases[k]={firstReturn:{decision:dec(x.r),view:first},resend:dec(r),view:full(x.t,w,o.w===7?1:6),next:dec(step(x.t,w,{day:(o.when?.day??5),hour:'14:00:00'}))};}
 const v=k=>out.cases[k].view;
 out.comparisons.QH17_unnamedEqualsNamed=same(v('QH17u_unnamed'),v('QH17n_named'));
 out.comparisons.QH17_resendEqualsFirstReturn={unnamed:same({...v('QH17u_unnamed'),relation:null,returnsApplied:null},{...out.cases.QH17u_unnamed.firstReturn.view,relation:null,returnsApplied:null}),named:same({...v('QH17n_named'),relation:null,returnsApplied:null},{...out.cases.QH17n_named.firstReturn.view,relation:null,returnsApplied:null})};
 out.comparisons.QH17d_unnamedEqualsNamed=same(v('QH17du_daysAndEndOnly_unnamed'),v('QH17dn_daysAndEndOnly_named'));
 out.comparisons.QH17w7_unnamedEqualsNamed=same(v('QH17w7u_aWeekLater_unnamed'),v('QH17w7n_aWeekLater_named'));
 out.comparisons.QH17x_unnamedEqualsNamed=same(v('QH17xu_otherNonclinicalReason_unnamed'),v('QH17xn_otherNonclinicalReason_named'));
 out.comparisons.QH17cl_bothClinical=[out.cases.QH17clu_reasonTurnsClinical_unnamed.resend.status,out.cases.QH17cln_reasonTurnsClinical_named.resend.status,out.cases.QH17clu_reasonTurnsClinical_unnamed.next.status,out.cases.QH17cln_reasonTurnsClinical_named.next.status];}

// ---------- QH18: R07, then the trip confirmed by its dates ----------
{const monLift=t=>t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)),after=`${day(0)}T20:00:00Z`;
 const flow=(id,nm)=>{const x=founders(id),q=step(x.t,6,{day:5,hour:'09:00:00',observations:[obs(x.t.p,monLift(x.t))]});
  const a=step(x.t,6,{day:5,hour:'10:00:00',interruption:{...A(),episodeId:id+'-A',startedAt:after},event:{id:`${id}-A-wr`,kind:'WEEKLY_REVIEW'}});
  const c=send(x,id,nm?named(id):trip(28,31));const view=full(x.t,6,6);return {late:dec(q),restatement:dec(a),confirmation:dec(c),view,later:later(x.t)};};
 out.cases.QH18u_confirmedByTheSameDates_unnamed=flow('qh18u',false);out.cases.QH18n_confirmedByName=flow('qh18n',true);
 {const x=founders('qh18c',{a:brk(0,13,{startedAt:after})});step(x.t,6,{day:5,hour:'09:00:00',observations:[obs(x.t.p,monLift(x.t))]});const c=send(x,'qh18c',named('qh18c'));
  out.cases.QH18c_startTimeStatedFromTheOutset={confirmation:dec(c),view:full(x.t,6,6)};}
 const v=k=>out.cases[k].view;
 out.comparisons.QH18_unnamedEqualsNamed=same(v('QH18u_confirmedByTheSameDates_unnamed'),v('QH18n_confirmedByName'));
 out.comparisons.QH18_unnamedEqualsStatedFromTheOutset=same({...v('QH18u_confirmedByTheSameDates_unnamed'),relation:null,returnsApplied:null},{...v('QH18c_startTimeStatedFromTheOutset'),relation:null,returnsApplied:null});
 out.comparisons.QH18_noLaterAsk=out.cases.QH18u_confirmedByTheSameDates_unnamed.later.every(s=>!s.startsWith('ASK'));}

// ---------- CT: the controls ----------
{const x=founders('ctta',{report:all}),first=full(x.t,6,6),r=send(x,'ctta',trip(28,31)),y=founders('cttn',{report:all}),rn=send(y,'cttn',named('cttn'));
 out.cases.CTTA_trainingAfterRowKept={firstReturn:{decision:dec(x.r),view:first},unnamed:{resend:dec(r),view:full(x.t,6,6)},named:{resend:dec(rn),view:full(y.t,6,6)}};
 out.comparisons.CTTA_unnamedEqualsNamed=same(full(x.t,6,6),full(y.t,6,6));}
{const sb=base();for(const w of [2,3,4,5])step(sb,w,{observations:weekObs(sb.p,w)});
 const r1=step(sb,6,{day:4,hour:'08:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(28,31),event:{id:'ctsb-1',kind:'RETURN_AFTER_PAUSE'}}),first=full(sb,6,6);
 const r2=step(sb,6,{day:5,hour:'11:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(28,31),event:{id:'ctsb-2',kind:'RETURN_AFTER_PAUSE'}});
 out.cases.CTSB_singleBreakDuplicate={first:dec(r1),firstView:first,duplicate:dec(r2),view:full(sb,6,6)};}
{const co=k=>{const c=base();step(c,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:k+'-A',kind:'SYSTEMIC_FATIGUE'}});
  const gap=c.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
  step(c,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:k+'-D'},event:{id:k+'-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(c.p,s):notDone(c.p,s))});
  return {c,r:step(c,5,{day:1,hour:'07:00:00'})};};
 {const {c,r}=co('ctco'),first=full(c,5,1),rc=step(c,5,{day:1,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(17,20),event:{id:'ctco-re',kind:'RETURN_AFTER_PAUSE'}});
  out.cases.CTCO_continuityResentWithTheTripsDays={first:dec(r),firstView:first,resend:dec(rc),view:full(c,5,1)};}
 {const {c,r}=co('ctcw'),first=full(c,5,1),rc=step(c,5,{day:1,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(0,20),event:{id:'ctcw-re',kind:'RETURN_AFTER_PAUSE'}});
  out.cases.CTCOw_continuityResentWithTheRecordedStopsDays={first:dec(r),firstView:first,resend:dec(rc),view:full(c,5,1)};}}

// ---------- T37: a report of the listed break whose reason text turns clinical ----------
{const CH=['declaration','weekly review','return report'];
 const restateWith=(t,id,extra,channel,when,w)=>{const i={...A(),...extra,episodeId:id+'-A'},e={id:`${id}-A-x-${channel.replace(' ','')}-${w}-${when.hour}`};
  return channel==='declaration'?step(t,w,{...when,kind:'LOCAL_FATIGUE',interruption:i,event:{...e,kind:'LOCAL_FATIGUE'}})
   :channel==='weekly review'?step(t,w,{...when,interruption:i,event:{...e,kind:'WEEKLY_REVIEW'}}):step(t,w,{...when,kind:'RETURN_AFTER_PAUSE',interruption:i,event:{...e,kind:'RETURN_AFTER_PAUSE'}});};
 for(const channel of CH){
  {const id='t37a'+channel[0],x=founders(id);step(x.t,6,{day:6,hour:'21:00:00'});step(x.t,7,{observations:weekObs(x.t.p,7)});
   const a=restateWith(x.t,id,{reason:'Holiday, then the flu with a fever'},channel,{day:2,hour:'10:00:00'},8),n=step(x.t,8,{day:3,hour:'10:00:00'});
   out.cases['T37a_afterTheReentryWeek_'+channel.replace(' ','')]={report:dec(a),next:dec(n),returnsApplied:returns(x.t.p).length};}
  {const id='t37b'+channel[0],x=founders(id);
   const a=restateWith(x.t,id,{reason:'Holiday, then the flu with a fever'},channel,{day:5,hour:'10:00:00'},6),n=step(x.t,6,{day:5,hour:'12:00:00'});
   out.cases['T37b_insideTheReentryWeek_'+channel.replace(' ','')]={report:dec(a),next:dec(n),returnsApplied:returns(x.t.p).length};}
 }
 out.comparisons.T37_everyChannelClinical=Object.entries(out.cases).filter(([k])=>k.startsWith('T37')).map(([k,c])=>`${k}: ${c.report.status}/${c.next.status}`);}
console.log(JSON.stringify(out,null,1));
