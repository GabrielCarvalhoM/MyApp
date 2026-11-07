// QRE R7-D Phase 3.5 check (QRE-R7D-PHASE35-CHECK-r1, Q1/Q2): runtime probes of candidate 8e78b8a (independent Quality/Reliability Engineer; not the
// author's evidence). Scratch copies only:
//   node qre2-p35-runtime.mjs <root> --label <name> [--out <file>]
// <root> holds CoachingCore/ (a git archive) and the review records it reads. The fixtures are the repository's own (r7/b/fixtures/helpers.mjs) there.
// The case shapes extend the role's Phase 3.4 probe (phase34/reviews/engineering/probes2/qre2-p34-runtime.mjs, rerun unchanged separately).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const HP=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=HP;

const GEN={id:'qre2-p35-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const GEV={id:'qre2-p35-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
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
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s),all=(p,s)=>obs(p,s);
const weekObs=(p,w,f=all)=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
const sum=d=>d?{start:d.startDate,end:d.endDate,days:d.days,cls:d.class,startedAt:d.startedAt??null,runMode:d.entry?.run?.mode??null,stops:(d.separateBreaks??[]).map(b=>b.episode+':'+b.stop+(b.ownReturn?`(${b.ownReturn.class}/${b.ownReturn.days},RUN=${b.ownReturn.reentered.RUN},STR=${b.ownReturn.reentered.STRENGTH})`:'')+(b.reentryWeek?`[re ${b.reentryWeek}]`:''))}:null;
const res=r=>({action:r.action,status:r.status??null,validity:r.planValidity?.status??null,missing:r.missingInputs??[],question:r.question??null,reason:String(r.reason??'').slice(0,240)});
const viewAt=(t,w,d=6)=>{const x=lastReturn(t.p),from=addDays(t.p.weeks[w].startDate,d);return {stop:sum(x),runs:runsAhead(t.p,w,from),strength:strengthAhead(t.p,w,from)};};
// Views compared across cases with their own ids: each episode id reduced to its role suffix (after the last '-').
const norm=v=>JSON.parse(JSON.stringify(v).replace(/\b[a-z0-9]+(?:-[a-z0-9]+)*-(A|D|z|x|H|hol|T2)\b/g,'<$1>'));
const same=(a,b)=>hash(norm(a))===hash(norm(b));
const out={probe:'QRE2-P35-RUNTIME-1',label,root,cases:{}};
const run=(id,f)=>{try{out.cases[id]=f();}catch(e){out.cases[id]={exception:e.name+': '+e.message,stack:String(e.stack).split('\n').slice(0,5).join(' | ')};}};
const isAsk=r=>r.action==='ASK';

/** The Founder's case: A kept (wk2-3), weeks 4-5 reported by `report`, D (Mon-Thu wk6) named and declared Fri wk6 07:00; a plain review at 08:00. */
function founders(id,{report=miss(friStrength),a=A(),lift=false,D=trip(28,31)}={}){
 const t=base(),l=lift?[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))]:[];
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'},observations:l});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,typeof report==='function'?report:report[w]))});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};
}
let SEQ=0;
const correct=(t,id,i,when={day:5,hour:'10:00:00'},w=6)=>step(t,w,{...when,kind:'RETURN_AFTER_PAUSE',interruption:{...i,episodeId:id+'-D'},event:{id:`${id}-D-c${++SEQ}`,kind:'RETURN_AFTER_PAUSE'}});
const AFTER=()=>`${day(0)}T20:00:00Z`,BEFORE=()=>`${day(0)}T07:00:00Z`;
/** The holiday restated by name (`name`, default its event id) by a channel; `i` overrides facts; `eventId` fixes the report id (a replay). */
const restate=(t,id,{startedAt=AFTER(),channel='weekly',when={day:5,hour:'10:00:00'},w=6,name=id+'-A',i={},eventId=null}={})=>{
 const it={...A(),...i,episodeId:name,...(startedAt===null?{}:{startedAt})},e={id:eventId??`${id}-A-r${++SEQ}`};
 return channel==='declaration'?step(t,w,{...when,kind:'LOCAL_FATIGUE',interruption:it,event:{...e,kind:'LOCAL_FATIGUE'}})
  :channel==='weekly'?step(t,w,{...when,interruption:it,event:{...e,kind:'WEEKLY_REVIEW'}}):step(t,w,{...when,kind:'RETURN_AFTER_PAUSE',interruption:it,event:{...e,kind:'RETURN_AFTER_PAUSE'}});};
const CH=['declaration','weekly','return'];
const liftOf=t=>obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
/** The reviews after an answer, to week `to` (each week reviewed with every session done); the rest of week 6 first. */
function later(t,{from=6,to=11,fromDay=5}={}){
 const r=[];if(from===6){r.push(['wk6plain',step(t,6,{day:fromDay,hour:'13:00:00'})]);r.push(['wk6sun',step(t,6,{day:6,hour:'21:00:00'})]);}
 for(let w=Math.max(7,from);w<=to;w++)r.push(['wk'+w,step(t,w,{observations:weekObs(t.p,w)})]);
 return {steps:Object.fromEntries(r.map(([k,v])=>[k,res(v)].map((x,i)=>i?{a:x.action,m:x.missing}:x))),asks:r.filter(([,v])=>isAsk(v)).map(([k,v])=>k+':'+v.missingInputs.join('|'))};
}
const lateLift=id=>{const x=founders(id),first=res(x.r),q=step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)]});return {x,first,q:res(q)};};
/** The control: the holiday stated with its start time from the outset, the lift reported late, then the trip confirmed (R7D-FREEZE-4's answer). */
function ctlR07(id,{startedAt=AFTER()}={}){const c=founders(id,{a:brk(0,13,{startedAt})});const q=step(c.t,6,{day:5,hour:'09:00:00',observations:[liftOf(c.t)]});const k=correct(c.t,id,trip(28,31),{day:5,hour:'11:00:00'});return {t:c.t,q:res(q),confirm:res(k)};}

// ---------- Q1. R07: the late-evidence re-read (staleReturn -> recordedStop) ----------
// (a) restatement by each channel, then the trip's confirmation: no later ask to week 11; the view equals the start stated from the outset.
for(const ch of CH)run('R07a_restate_'+ch+'_then_confirm',()=>{
 const id='q7a'+ch[0],{x,first,q}=lateLift(id),a=restate(x.t,id,{channel:ch}),c=correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'});
 const v=viewAt(x.t,6),ctl=ctlR07(id+'c');
 return {first,question:q,answer:res(a),confirmation:res(c),equalToControl:same(v,viewAt(ctl.t,6)),control:ctl.confirm.action,view:v,later:later(x.t)};
});
// (b) the trip confirmed first: the start time is asked again; the restatement (each channel) then applies the kept confirmation.
for(const ch of CH)run('R07b_confirm_then_restate_'+ch,()=>{
 const id='q7b'+ch[0],{x,q}=lateLift(id),c=correct(x.t,id,trip(28,31)),a=restate(x.t,id,{channel:ch,when:{day:5,hour:'11:00:00'}});
 const p=a.action==='REESTABLISH'?null:step(x.t,6,{day:5,hour:'12:00:00'}),ctl=ctlR07(id+'c');
 return {question:q,confirmation:res(c),answer:res(a),next:p?res(p):null,equalToControl:same(viewAt(x.t,6),viewAt(ctl.t,6)),later:later(x.t)};
});
// (c) the restatement with no confirmation: the I6 confirmation is asked until the re-entry week is over, as on R7D-FREEZE-4 for an unanswered late fact.
for(const ch of CH)run('R07c_restate_'+ch+'_unconfirmed',()=>{const id='q7c'+ch[0],{x,q}=lateLift(id),a=restate(x.t,id,{channel:ch});return {question:q,answer:res(a),later:later(x.t)};});
run('R07c_control_unanswered_late_lift',()=>{const id='q7cn',{x,q}=lateLift(id);return {question:q,later:later(x.t)};});
// (d) a start time before the lift: the return as read; no question and no change.
for(const ch of CH)run('R07d_restate_before_'+ch,()=>{const id='q7d'+ch[0],{x}=lateLift(id),v0=viewAt(x.t,6),a=restate(x.t,id,{channel:ch,startedAt:BEFORE()});return {answer:res(a),unchanged:same(v0,viewAt(x.t,6)),later:later(x.t)};});
// (e) the trip confirmed first and nothing else in week 6; the start time stated only in week 8 (by the weekly review): answerable late.
run('R07e_confirm_then_restate_in_week8',()=>{
 const id='q7e',{x}=lateLift(id),c=correct(x.t,id,trip(28,31)),s=step(x.t,6,{day:6,hour:'21:00:00'}),w7=step(x.t,7,{observations:weekObs(x.t.p,7)});
 const a=restate(x.t,id,{channel:'weekly',when:{day:6,hour:'21:00:00'},w:8});
 return {confirmation:res(c),wk6sun:res(s),wk7:res(w7),answerWk8:res(a),later:later(x.t,{from:9,to:11})};
});
// (f) a restatement that changes another fact (the reason text; the end date) is no answer (O-02: asked); a valid one then supersedes it.
for(const [k,i] of [['reason',{reason:'Holiday abroad'}],['endDate',{endDate:day(12),days:13}]])run('R07f_other_fact_'+k,()=>{
 const id='q7f'+k[0],{x}=lateLift(id),n=returns(x.t.p).length,wrong=restate(x.t,id,{i}),appliedByChanged=returns(x.t.p).length>n,right=restate(x.t,id,{when:{day:5,hour:'11:00:00'}}),c=correct(x.t,id,trip(28,31),{day:5,hour:'12:00:00'});
 return {changed:res(wrong),appliedByChanged,right:res(right),confirmation:res(c),later:later(x.t)};
});
// (g) a restatement with no start time: consumed, the start time still unknown, so the question stays; a valid one then answers it.
run('R07g_timeless_then_valid',()=>{const id='q7g',{x}=lateLift(id),a=restate(x.t,id,{startedAt:null}),p=step(x.t,6,{day:5,hour:'10:30:00'}),b=restate(x.t,id,{when:{day:5,hour:'11:00:00'}}),c=correct(x.t,id,trip(28,31),{day:5,hour:'12:00:00'});
 return {timeless:res(a),plainAfter:res(p),valid:res(b),confirmation:res(c),later:later(x.t)};});
// (h) the newest restatement decides: after then before (the lift inside the holiday: the return as read); before then after (asks the confirmation).
run('R07h_after_then_before',()=>{const id='q7h',{x}=lateLift(id),v0=viewAt(x.t,6),a=restate(x.t,id),b=restate(x.t,id,{startedAt:BEFORE(),when:{day:5,hour:'11:00:00'}});return {after:res(a),before:res(b),asRead:same(v0,viewAt(x.t,6)),later:later(x.t)};});
run('R07h_before_then_after',()=>{const id='q7i',{x}=lateLift(id),a=restate(x.t,id,{startedAt:BEFORE()}),b=restate(x.t,id,{when:{day:5,hour:'11:00:00'}}),c=correct(x.t,id,trip(28,31),{day:5,hour:'12:00:00'});return {before:res(a),after:res(b),confirmation:res(c),later:later(x.t)};});
// (i) a valid restatement, then a newer timeless one: the start time is unknown again (the newest decides); answerable again.
run('R07i_valid_then_timeless',()=>{const id='q7j',{x}=lateLift(id),a=restate(x.t,id),b=restate(x.t,id,{startedAt:null,when:{day:5,hour:'10:30:00'}}),c=correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'}),d=restate(x.t,id,{when:{day:5,hour:'11:30:00'}}),e=d.action==='REESTABLISH'?null:step(x.t,6,{day:5,hour:'12:00:00'});
 return {valid:res(a),timeless:res(b),confirmation:res(c),validAgain:res(d),next:e?res(e):null,later:later(x.t)};});
// (j) the same restatement event sent twice (one event id): idempotent.
run('R07j_replayed_restatement',()=>{const id='q7k',{x}=lateLift(id),a=restate(x.t,id,{eventId:id+'-rest'}),v=viewAt(x.t,6),b=restate(x.t,id,{eventId:id+'-rest',when:{day:5,hour:'10:30:00'}}),replayChanged=!same(v,viewAt(x.t,6)),c=correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'});
 return {first:res(a),replay:res(b),replayChanged,confirmation:res(c),later:later(x.t)};});
// (k) the holiday reported with its own episodeId: the restatement names it by that episodeId, or by its report's event id.
for(const by of ['episode','eventId'])run('R07k_named_holiday_by_'+by,()=>{const id='q7l'+by[1],x=founders(id,{a:{...A(),episodeId:id+'-hol'}});const q=step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)]});
 const a=restate(x.t,id,{name:by==='episode'?id+'-hol':id+'-A',i:{episodeId:undefined}}),c=correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'});return {first:res(x.r),question:res(q),answer:res(a),confirmation:res(c),later:later(x.t)};});

// (l) a "restatement" whose reason text turns clinical (category unchanged): no restatement; clinical first, by each channel.
for(const ch of CH)run('R07n_clinical_reason_text_'+ch,()=>{const id='q7n'+ch[0],{x}=lateLift(id),a=restate(x.t,id,{channel:ch,i:{reason:'Holiday, then the flu with a fever'}}),p=step(x.t,6,{day:5,hour:'11:00:00'});return {answer:res(a),next:res(p)};});
// (l2) the same after the re-entry week (week 8, the late-evidence re-read no longer runs), with no late fact: clinical first, by each channel.
for(const ch of CH)run('R07n2_clinical_reason_text_week8_'+ch,()=>{const id='q7q'+ch[0],x=founders(id);later(x.t,{to:7});const a=restate(x.t,id,{channel:ch,when:{day:2,hour:'10:00:00'},w:8,i:{reason:'Holiday, then the flu with a fever'}}),p=step(x.t,8,{day:2,hour:'11:00:00'});return {first:res(x.r),answer:res(a),next:res(p)};});
// (m) the restatement rule with an earlier, separately applied return in the history (the separate-breaks return is not the first episode).
run('R07m_prior_applied_return',()=>{const id='q7p',t={p:program({...GEN,id:'qre2-p35-prior'}),ledger:[],ref:null};
 step(t,0,{observations:weekObs(t.p,0)});const w1=t.p.weeks[1].startDate;
 const pr=step(t,1,{day:3,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:addDays(w1,1),endDate:addDays(w1,2),days:2,reasonCategory:'WORK',reason:'Work trip',nonclinical:true},event:{id:id+'-P',kind:'RETURN_AFTER_PAUSE'},observations:t.p.weeks[1].sessions.filter(s=>live(s)&&s.date===w1).map(s=>obs(t.p,s))});
 step(t,1,{observations:t.p.weeks[1].sessions.filter(s=>live(s)&&s.date>addDays(w1,2)).map(s=>obs(t.p,s))});
 if(pr.action!=='REESTABLISH')return {priorReturn:res(pr),note:'the prior break was not applied'};
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,miss(friStrength)))});
 const first=step(t,6,{day:4,hour:'08:00:00'}),q=step(t,6,{day:5,hour:'09:00:00',observations:[liftOf(t)]}),a=restate(t,id),c=correct(t,id,trip(28,31),{day:5,hour:'11:00:00'});
 return {episodes:returns(t.p).length,first:res(first),stop:sum(lastReturn(t.p)),question:res(q),answer:res(a),confirmation:res(c),later:later(t)};});
// (p) the I6 confirmation by "the same dates" with no episodeId (the question offers both), after the restatement: against the named confirmation.
run('R07p_confirmation_by_same_dates_unnamed',()=>{const id='q7r',{x}=lateLift(id),a=restate(x.t,id),c=step(x.t,6,{day:5,hour:'11:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(28,31),event:{id:id+'-conf',kind:'RETURN_AFTER_PAUSE'}});
 const v=viewAt(x.t,6),{x:y}=lateLift(id+'n');restate(y.t,id+'n');correct(y.t,id+'n',trip(28,31),{day:5,hour:'11:00:00'});
 return {answer:res(a),confirmation:res(c),stop:v.stop,equalToNamed:same(v,viewAt(y.t,6)),namedStop:viewAt(y.t,6).stop,later:later(x.t)};});
// (p2) the same channel with no restatement involved: T13's late fact (week 5's Friday strength corrected to done), then the I6 confirmation by the
// same dates with no episodeId, against the named confirmation (pre-existing path: returnAfterPause re-reads a recorded return only for a named report).
run('R07p2_T13_late_fact_confirmation_unnamed',()=>{const mk=(id,named)=>{const x=founders(id),fri=x.t.p.weeks[5].sessions.find(s=>live(s)&&friStrength(s)),row=x.t.ledger.find(o=>o.sessionId===fri.id&&!o.fact);
  const lf=step(x.t,6,{day:5,hour:'09:30:00',observations:[{...obs(x.t.p,fri),observedAt:row.observedAt,correctionOf:row.eventId,correctedAt:`${day(33)}T09:00:00Z`}]});
  const c=named?correct(x.t,id,trip(28,31),{day:5,hour:'10:00:00'}):step(x.t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(28,31),event:{id:id+'-conf',kind:'RETURN_AFTER_PAUSE'}});
  const d=lastReturn(x.t.p);return {x,lateFact:res(lf),confirmation:res(c),relation:d?.relation??null,basis:d?.basis??null,view:viewAt(x.t,6)};};
 const u=mk('q7tu',false),n=mk('q7tn',true);
 return {unnamed:{lateFact:u.lateFact,confirmation:u.confirmation,relation:u.relation,basis:u.basis,view:u.view},named:{lateFact:n.lateFact,confirmation:n.confirmation,relation:n.relation,basis:n.basis,view:n.view},equal:same(u.view,n.view),firstReturnView:null};});
// (p3) QRE-P35-01 at its simplest: the Founder's case applied, then the trip re-sent with the same dates and no episodeId (R7-A §9 duplicate), against the
// named re-send; weeks 4-5 with the Friday strength missed (OWN_RETURN) or every session done (TRAINING_AFTER).
for(const [k,rep] of [['ownReturn',miss(friStrength)],['trainingAfter',all]])run('R07r_plain_resend_unnamed_'+k,()=>{const mk=(id,named)=>{const x=founders(id,{report:rep}),v0=viewAt(x.t,6),d0=lastReturn(x.t.p);
  const c=named?correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'}):step(x.t,6,{day:5,hour:'11:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(28,31),event:{id:id+'-dup',kind:'RETURN_AFTER_PAUSE'}});
  const d=lastReturn(x.t.p);return {first:sum(d0),firstStrength:v0.strength.slice(0,5),resend:res(c),relation:d.relation,basis:d.basis,view:viewAt(x.t,6)};};
 const u=mk('q7u'+k.length,false),n=mk('q7v'+k.length,true);return {unnamed:u,named:n,equal:same(u.view,n.view),strengthEqual:same(u.view.strength,n.view.strength)};});
// (q) the late lift and the restatement in one weekly review (the answer sent with the fact).
for(const [k,s] of [['after',AFTER],['before',BEFORE]])run('R07q_lift_and_restatement_together_'+k,()=>{const id='q7s'+k[0],x=founders(id),v0=viewAt(x.t,6);
 const a=step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)],interruption:{...A(),episodeId:id+'-A',startedAt:s()},event:{id:id+'-both',kind:'WEEKLY_REVIEW'}});
 const c=a.action==='ASK'&&(a.missingInputs??[]).includes('interruption.episodeId')?correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'}):null;
 return {together:res(a),unchanged:same(v0,viewAt(x.t,6)),confirmation:c?res(c):null,later:later(x.t)};});
// (o) a report of the holiday changing its reason text only (nonclinical), never followed by a valid restatement: the O-02 question, how long.
run('R07o_changed_reason_left_unanswered',()=>{const id='q7o',{x}=lateLift(id),a=restate(x.t,id,{i:{reason:'Holiday abroad'}});return {changed:res(a),later:later(x.t,{to:9})};});

// ---------- Q1. Persistent asks of the Phase 3.4 probe, answered afterwards ----------
const REP4={4:miss(friStrength),5:miss(tueRun)},CORR=trip(22,32);
const r4=id=>{const x=founders(id,{report:REP4,lift:true});return {x,first:res(x.r),rc:correct(x.t,id,CORR)};};
function ctlR04(id){const c=founders(id,{report:REP4,lift:true,a:brk(0,13,{startedAt:AFTER()})});const k=correct(c.t,id,CORR);return {t:c.t,k:res(k)};}
for(const ch of CH)run('R04a_'+ch+'_then_plain',()=>{const id='q4a'+ch[0],{x,first,rc}=r4(id),a=restate(x.t,id,{channel:ch,when:{day:5,hour:'11:00:00'}}),p=a.action==='REESTABLISH'?null:step(x.t,6,{day:5,hour:'12:00:00'});
 const v=viewAt(x.t,6),ctl=ctlR04(id+'c'),again=correct(x.t,id,CORR,{day:5,hour:'12:30:00'});
 return {first,correction:res(rc),answer:res(a),next:p?res(p):null,equalToControl:same(v,viewAt(ctl.t,6)),control:ctl.k.action,correctionAgain:res(again),idempotent:same(v,viewAt(x.t,6)),later:later(x.t)};});
run('R04b_ignored_to_week7_then_answered',()=>{const id='q4b',{x,rc}=r4(id),s=step(x.t,6,{day:6,hour:'21:00:00'}),w7=step(x.t,7,{observations:weekObs(x.t.p,7)}),a=restate(x.t,id,{when:{day:6,hour:'21:00:00'},w:8});
 return {correction:res(rc),wk6sun:res(s),wk7:res(w7),answerWk8:res(a),later:later(x.t,{from:9,to:11})};});
run('R04c_escape_tripStartedAt_then_answered',()=>{const id='q4c',{x,rc}=r4(id),e=correct(x.t,id,{...CORR,startedAt:`${day(22)}T06:00:00Z`},{day:5,hour:'11:00:00'}),a=restate(x.t,id,{when:{day:5,hour:'12:00:00'}});
 return {correction:res(rc),escape:res(e),answer:res(a),later:later(x.t)};});
run('R04d_holiday_timeless_then_answered',()=>{const id='q4d',{x,rc}=r4(id),e=restate(x.t,id,{startedAt:null,channel:'declaration',when:{day:5,hour:'11:00:00'}}),p=step(x.t,6,{day:5,hour:'11:30:00'}),a=restate(x.t,id,{when:{day:5,hour:'12:00:00'}});
 return {correction:res(rc),timeless:res(e),plain:res(p),answer:res(a),later:later(x.t)};});
run('R04e_late_lift_then_correction_then_answered',()=>{const id='q4e',x=founders(id),ll=step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)]}),rc=correct(x.t,id,trip(28,32)),a=restate(x.t,id,{when:{day:5,hour:'11:00:00'}});
 return {lateLift:res(ll),correction:res(rc),answer:res(a),later:later(x.t)};});
run('R07l_tripConfirmedAgain_to_week9_then_answered',()=>{const id='q7m',{x}=lateLift(id),c=correct(x.t,id,trip(28,31)),L=later(x.t,{to:9}),a=restate(x.t,id,{when:{day:6,hour:'21:30:00'},w:9});
 return {confirmation:res(c),until9:L,answerWk9:res(a),after:later(x.t,{from:10,to:11})};});

// ---------- Q1/Q2. Scope: nothing else changes ----------
// (s1) no question pending (no lift): the holiday restated with a start time keeps the plan; no later ask.
for(const ch of CH)run('S1_restate_without_question_'+ch,()=>{const id='qs1'+ch[0],x=founders(id),v=viewAt(x.t,6),a=restate(x.t,id,{channel:ch});return {first:res(x.r),answer:res(a),unchanged:same(v,viewAt(x.t,6)),later:later(x.t)};});
// (s2) a single-break return (no separate breaks): a newer report of the applied break with a start time is a correction (listedBreaks empty).
run('S2_single_break_correction_with_start',()=>{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'qs2-A',kind:'SYSTEMIC_FATIGUE'}});const r=step(t,4,{day:0,hour:'08:00:00'});
 const c=step(t,4,{day:1,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...brk(0,13),episodeId:'qs2-A',startedAt:AFTER()},event:{id:'qs2-A2',kind:'RETURN_AFTER_PAUSE'}});return {first:res(r),correction:res(c),view:viewAt(t,4),later:later(t,{from:5,to:7})};});
// (s3) after the restatement and confirmation, a new break in week 9 (Mon-Wed): its return reads it alone; no relation question.
run('S3_new_break_after_restatement',()=>{const id='qs3',{x}=lateLift(id);restate(x.t,id);correct(x.t,id,trip(28,31),{day:5,hour:'11:00:00'});later(x.t,{to:8});
 const d=step(x.t,9,{day:3,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(49,51),episodeId:id+'-T2'},event:{id:id+'-T2',kind:'LOCAL_FATIGUE'}}),p=step(x.t,9,{day:3,hour:'08:00:00'});
 const ctl=ctlR07(id+'c');later(ctl.t,{to:8});step(ctl.t,9,{day:3,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(49,51),episodeId:id+'c-T2'},event:{id:id+'c-T2',kind:'LOCAL_FATIGUE'}});step(ctl.t,9,{day:3,hour:'08:00:00'});
 return {declared:res(d),plain:res(p),stop:sum(lastReturn(x.t.p)),equalToControl:same(viewAt(x.t,9),viewAt(ctl.t,9)),later:later(x.t,{from:10,to:11})};});
// (s4) the latest break (the trip) reported again with its start time: a newer report of the latest break (the correction path), unchanged.
run('S4_restate_latest_break',()=>{const id='qs4',x=founders(id),c=correct(x.t,id,{...trip(28,31),startedAt:`${day(28)}T06:00:00Z`});return {first:res(x.r),correction:res(c),view:viewAt(x.t,6),later:later(x.t)};});

// ---------- Q2. F01 (systemic rule through a race week) and F02 (re-read without the superseded report) ----------
const ADV={response:{recovery:'ADVERSE'}},role=r=>s=>s.sport==='RUN'&&s.role===r;
function raceWeek(id,report,{gated=false,signal=false}={}){
 const t={p:program({...GEV,id:'qre2-p35-'+(gated?'g':'n'),schedule:{runDays:gated?[1,3,5,6]:[3,5,6],longRunDay:6}}),ledger:[],ref:null};
 for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 if(signal)step(t,7,{day:2,hour:'21:00:00',kind:'SYSTEMIC_FATIGUE',event:{id:id+'-sig',kind:'SYSTEMIC_FATIGUE'}});
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:weekObs(t.p,7,report)});
 const r=step(t,8,{day:4,hour:'08:00:00'});
 return {roles7:t.p.weeks[7].sessions.filter(live).map(s=>s.sport+':'+s.role),result:res(r),stop:sum(lastReturn(t.p)),runs:runsAhead(t.p,8,addDays(t.p.weeks[8].startDate,6)),strength:strengthAhead(t.p,8,addDays(t.p.weeks[8].startDate,6))};
}
const F01={
 strengthAndShakeoutAdverse:(p,s)=>s.sport==='STRENGTH'||role('SHAKEOUT')(s)?obs(p,s,ADV):obs(p,s),
 strengthAndTouchAdverse:(p,s)=>s.sport==='STRENGTH'||role('RACE_TOUCH')(s)?obs(p,s,ADV):obs(p,s),
 threeRunsAdverse:(p,s)=>s.sport==='RUN'?obs(p,s,ADV):obs(p,s),
 touchAndShakeoutAdverse:(p,s)=>role('RACE_TOUCH')(s)||role('SHAKEOUT')(s)?obs(p,s,ADV):obs(p,s),
 strengthAdverseOnly:(p,s)=>s.sport==='STRENGTH'?obs(p,s,ADV):obs(p,s),
 shakeoutAdverseOnly:(p,s)=>role('SHAKEOUT')(s)?obs(p,s,ADV):obs(p,s),
 allNominal:all,
 strengthUnderAndShakeoutHarder:(p,s)=>s.sport==='STRENGTH'?obs(p,s,{response:{performance:'UNDER'}}):role('SHAKEOUT')(s)?obs(p,s,{response:{effort:'HARDER'}}):obs(p,s)
};
for(const [k,f] of Object.entries(F01)){run('F01_gateless_'+k,()=>raceWeek('qf1n'+k.length,f));run('F01_gated_'+k,()=>raceWeek('qf1g'+k.length,f,{gated:true}));}
run('F01_gateless_signal_recorded',()=>raceWeek('qf1sig',all,{signal:true}));
// F02: corrections of the latest break after a separate-breaks return; each against the fresh report of the corrected trip.
const declared=(id,D,facts,{dw=6,dd=4}={})=>{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,dw,{day:dd,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:facts(t)});return {t,r:step(t,dw,{day:dd,hour:'08:00:00'})};};
const v1=t=>[4,5].flatMap(w=>weekObs(t.p,w,miss(friStrength)));
const F02={earlier:trip(27,31),extendEnd:trip(28,32),shrinkEnd:trip(28,30),laterUncoversLift:trip(29,32),sameDates:trip(28,31)};
for(const [k,D2] of Object.entries(F02))run('F02_correction_'+k,()=>{const c=declared('qf2'+k.length,trip(28,31),v1),rc=correct(c.t,'qf2'+k.length,D2);const f=declared('qf2f'+k.length,D2,v1,{dd:5});
 const vc=viewAt(c.t,6),vf=viewAt(f.t,6);
 return {first:res(c.r),correction:res(rc),fresh:res(f.r),asked:(rc.question?.unreported?.sessionIds??[]).length,askedFresh:(f.r.question?.unreported?.sessionIds??[]).length,equalToFresh:same(vc,vf),stopAndStrengthEqualToFresh:same([vc.stop,vc.strength],[vf.stop,vf.strength]),view:vc,viewFresh:vf};});
// F02 on the fresh path: the same separate breaks reported fresh (no applied head): unchanged by construction (the exception names no applied episode).
run('F02_fresh_with_unreported_between',()=>{const f=declared('qf2u',trip(28,31),t=>[...weekObs(t.p,4,miss(friStrength)),...t.p.weeks[5].sessions.filter(s=>live(s)&&s.date!==day(27)).map(s=>obs(t.p,s))]);return {fresh:res(f.r),asked:(f.r.question?.unreported?.sessionIds??[]).length};});

const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
