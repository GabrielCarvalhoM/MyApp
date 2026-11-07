// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q1): runtime probes of the bounded cycle's new branch (returnAfterPause: an unnamed report
// with the latest break's days re-reads the recorded return, as a named one does). Which other paths does the branch reach, and does each equal the
// named report on the same runtime? Run on candidate 33d3181, 8e78b8a and R7D-FREEZE-4 rebuilds (git archive, scratch only):
//   node qre3-p35-runtime.mjs <root> --label <name> [--out <file>]
// The fixtures are the repository's own (r7/b/fixtures/helpers.mjs) in <root>. The case shapes extend the role's r1 probe (probes/qre2-p35-runtime.mjs).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const HP=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=HP;

const GEN={id:'qre3-p35-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
// `ledger` overrides the record sent with this one review (the athlete's client sends part of it); the kept record is then the runtime's answer.
const step=(t,w,x={},{ledger=null}={})=>{const L=ledger??t.ledger;const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(L.length?{actualLedger:L}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
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
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
const sum=d=>d?{start:d.startDate,end:d.endDate,days:d.days,cls:d.class,relation:d.relation??null,basis:d.basis??null,stops:(d.separateBreaks??[]).map(b=>b.episode+':'+b.stop+'('+b.startDate+'..'+b.endDate+')')}:null;
const res=r=>({action:r.action,status:r.status??null,validity:r.planValidity?.status??null,missing:r.missingInputs??[],reason:String(r.reason??'').slice(0,260)});
const viewAt=(t,w,d=6)=>{const from=addDays(t.p.weeks[w].startDate,d);return {stop:sum(lastReturn(t.p)),returns:returns(t.p).length,runs:runsAhead(t.p,w,from),strength:strengthAhead(t.p,w,from)};};
// Views compared across cases with their own ids: each episode id reduced to its role suffix (after the last '-').
const norm=v=>JSON.parse(JSON.stringify(v).replace(/\b[a-z0-9]+(?:-[a-z0-9]+)*-(A|D|C|z)\b/g,'<$1>'));
const same=(a,b)=>hash(norm(a))===hash(norm(b));
const out={probe:'QRE3-P35-RUNTIME-1',label,root,cases:{}};
const run=(id,f)=>{try{out.cases[id]=f();}catch(e){out.cases[id]={exception:e.name+': '+e.message,stack:String(e.stack).split('\n').slice(0,5).join(' | ')};}};
const later=(t,{from=6,to=11,fromDay=5}={})=>{const r=[];if(from===6){r.push(['wk6plain',step(t,6,{day:fromDay,hour:'13:00:00'})]);r.push(['wk6sun',step(t,6,{day:6,hour:'21:00:00'})]);}
 for(let w=Math.max(7,from);w<=to;w++)r.push(['wk'+w,step(t,w,{observations:weekObs(t.p,w)})]);return r.filter(([,v])=>v.action==='ASK').map(([k,v])=>k+':'+v.missingInputs.join('|'));};

/** The Founder's case (r1 probe): A kept (wk2-3), weeks 4-5 reported by `report`, D (Mon-Thu wk6) named, declared Fri wk6 07:00; a plain review 08:00. */
function founders(id,{report=miss(friStrength),D=trip(28,31)}={}){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,report))});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};
}
/** T36's continuity control: A kept, a run done in the three days after it (no whole week), D (days 17-20) declared Mon wk5; the return reads one stop. */
function continuity(id){
 const c=base();step(c,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=c.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(c,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(c.p,s):notDone(c.p,s))});
 return {t:c,r:step(c,5,{day:1,hour:'07:00:00'})};
}
let SEQ=0;
/** The latest break's report again by `channel`, named (its episodeId) or not; `i` the facts. */
const send=(t,w,id,i,{named=false,channel='return',when={day:5,hour:'11:00:00'},ledger=null}={})=>{const it=named?{...i,episodeId:id+'-D'}:i,e={id:`${id}-s${++SEQ}`};
 const kind=channel==='return'?'RETURN_AFTER_PAUSE':channel==='declaration'?'LOCAL_FATIGUE':'WEEKLY_REVIEW';
 return step(t,w,{...when,...(channel==='weekly'?{}:{kind}),interruption:it,event:{...e,kind}},{ledger});};
/** Both forms on fresh copies of one shape: `mk(id)` builds the shape, `act(x,id,named)` sends; each result with the record, the doses and later asks. */
// `equal`: the same action, status, missing inputs, record (the relation basis apart: DUPLICATE for the unnamed form, EXPLICIT for the named one, by
// R7-A's own rule) and doses; `keptFirstRows`: the record keeps every separate-break row the first return read.
const noBasis=v=>({...v,stop:v.stop?{...v.stop,basis:undefined}:null});
const rowsOf=s=>(s?.stops??[]).map(x=>x.replace(/\(.*$/,''));
const pair=(mk,act,{w=6,to=11,laterFrom=6}={})=>{const one=named=>{const id=(named?'qn':'qu')+(++SEQ),x=mk(id),before=viewAt(x.t,w),r=act(x,id,named),v=viewAt(x.t,w);
  return {first:res(x.r),firstStop:before.stop,firstStrength:before.strength,result:res(r),view:v,keptFirstRows:same(rowsOf(before.stop).filter(s=>!/:LATEST$/.test(s)),rowsOf(v.stop).filter(s=>!/:LATEST$/.test(s))),later:to?later(x.t,{from:laterFrom,to}):null};};
 const u=one(false),n=one(true);return {unnamed:u,named:n,equal:same([u.result.action,u.result.status,u.result.missing,noBasis(u.view)],[n.result.action,n.result.status,n.result.missing,noBasis(n.view)]),strengthEqual:same(u.view.strength,n.view.strength)};};

// N1. A continuity return (the stop runs back through the holiday) confirmed by the dates the I6 question names: the stop's (days 0-20).
run('N1_continuity_resend_stop_dates',()=>pair(continuity,(x,id,named)=>send(x.t,5,id,{...trip(0,20)},{named,when:{day:1,hour:'09:00:00'}}),{w:5,to:8,laterFrom:6}));
// N1b. The same with the trip's own days (T36's control): asked on every runtime, named or not?
run('N1b_continuity_resend_trip_days',()=>pair(continuity,(x,id,named)=>send(x.t,5,id,trip(17,20),{named,when:{day:1,hour:'09:00:00'}}),{w:5,to:0}));
// N2. The own-return case re-sent with the holiday's declaration left out of the record sent (a partial client record).
run('N2_ownReturn_resend_record_without_holiday',()=>pair(founders,(x,id,named)=>send(x.t,6,id,trip(28,31),{named,ledger:x.t.ledger.filter(o=>!(o.fact==='INTERRUPTION_DECLARED'&&o.eventId===id+'-A'))}),{to:0}));
// N3. A report of the holiday whose reason turns clinical (routed clinical), then the trip re-sent: R-F08-1 through the re-read.
run('N3_clinical_holiday_report_then_resend',()=>pair(founders,(x,id,named)=>{const c=step(x.t,6,{day:5,hour:'10:00:00',interruption:{...A(),episodeId:id+'-A',reason:'Holiday, then the flu with a fever'},event:{id:id+'-A-clin',kind:'WEEKLY_REVIEW'}});
 const r=send(x.t,6,id,trip(28,31),{named});return {...r,reason:`[clinical report: ${c.status??c.action}] `+(r.reason??'')};},{to:0}));
// N4. The re-send arriving late: weeks 6-8 executed, the trip re-sent on Wed wk9.
run('N4_ownReturn_resend_week9',()=>pair(id=>{const x=founders(id);later(x.t,{to:8});return x;},(x,id,named)=>send(x.t,9,id,trip(28,31),{named,when:{day:2,hour:'10:00:00'}}),{w:9,to:11,laterFrom:10}));
// N5. The re-send with a start time on the trip's first day.
run('N5_ownReturn_resend_with_startedAt',()=>pair(founders,(x,id,named)=>send(x.t,6,id,{...trip(28,31),startedAt:`${day(28)}T06:00:00Z`},{named})));
// N6. The re-send giving the last day and the length only (no first day): the duplicate test reads the first day the length gives.
run('N6_ownReturn_resend_end_and_days_only',()=>pair(founders,(x,id,named)=>{const {startDate,...i}=trip(28,31);return send(x.t,6,id,i,{named});},{to:0}));
// N7/N8. Unnamed reports that are no duplicate (another last day; another first day): unchanged against 8e78b8a (equal flags only informative).
run('N7_ownReturn_report_extended_end',()=>pair(founders,(x,id,named)=>send(x.t,6,id,trip(28,32),{named}),{to:0}));
run('N8_ownReturn_report_earlier_start',()=>pair(founders,(x,id,named)=>send(x.t,6,id,trip(27,31),{named}),{to:0}));
// N9. After a named correction that re-read the record (the trip extended to Friday), the corrected dates re-sent.
run('N9_after_named_correction_resend_corrected_dates',()=>pair(id=>{const x=founders(id);send(x.t,6,id,trip(28,32),{named:true,when:{day:5,hour:'10:00:00'}});return x;},(x,id,named)=>send(x.t,6,id,trip(28,32),{named}),{to:0}));
// N10. The re-send with another nonclinical reason (the same days): a newer report of the trip with its own facts.
run('N10_ownReturn_resend_other_reason',()=>pair(founders,(x,id,named)=>send(x.t,6,id,trip(28,31,{reasonCategory:'FAMILY',reason:'Family visit'}),{named}),{to:0}));
// N11. The re-send whose reason turns clinical: clinical first on every runtime.
run('N11_ownReturn_resend_clinical_reason',()=>pair(founders,(x,id,named)=>send(x.t,6,id,trip(28,31,{reason:'Work trip, then a fever'}),{named}),{to:0}));
// N12/N13. The re-send by a weekly review and by a declaration (the I6 confirmation by other channels), then the reviews after it.
run('N12_ownReturn_resend_weekly_review',()=>pair(founders,(x,id,named)=>send(x.t,6,id,trip(28,31),{named,channel:'weekly'})));
run('N13_ownReturn_resend_declaration',()=>pair(founders,(x,id,named)=>{const r=send(x.t,6,id,trip(28,31),{named,channel:'declaration'});const p=step(x.t,6,{day:5,hour:'12:00:00'});return {...p,reason:`[declaration: ${r.action}] `+(p.reason??'')};}));
// N14. The TRAINING_AFTER return re-sent in week 9 (the row is kept; the doses equal the named one).
run('N14_trainingAfter_resend_week9',()=>pair(id=>{const x=founders(id,{report:all});later(x.t,{to:8});return x;},(x,id,named)=>send(x.t,9,id,trip(28,31),{named,when:{day:2,hour:'10:00:00'}}),{w:9,to:11,laterFrom:10}));
// N15. A single-break return (no separate breaks) re-sent unnamed in week 9: the R7-A duplicate path, unchanged against 8e78b8a.
run('N15_single_break_resend_week9',()=>pair(id=>{const t=base();for(const w of [2,3,4,5])step(t,w,{observations:weekObs(t.p,w)});const r=step(t,6,{day:4,hour:'08:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'RETURN_AFTER_PAUSE'}});later(t,{to:8});return {t,r};},
 (x,id,named)=>send(x.t,9,id,trip(28,31),{named,when:{day:2,hour:'10:00:00'}}),{w:9,to:11,laterFrom:10}));

// N16. R07 in the confirmation-first order: the late first-day lift (I6 asked), the trip confirmed by the same dates BEFORE the holiday's start time is
// given (the re-read asks it: rule 0.8), then the holiday restated with its start time; the reviews after it. T36(b) covers only the restatement first.
const liftOf=t=>obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
run('N16_R07_unnamed_confirmation_first_then_restatement',()=>pair(id=>{const x=founders(id);step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)]});return x;},(x,id,named)=>{
 const c=send(x.t,6,id,trip(28,31),{named,when:{day:5,hour:'10:00:00'}}),a=step(x.t,6,{day:5,hour:'11:00:00',interruption:{...A(),episodeId:id+'-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-A-rest',kind:'WEEKLY_REVIEW'}});
 return {...a,reason:`[confirmation: ${c.action}${(c.missingInputs??[]).length?' '+c.missingInputs.join(','):''}] `+(a.reason??'')};}));
// N16b. The same, the confirmation alone (no start time given afterwards): what the athlete gets.
run('N16b_R07_unnamed_confirmation_first_only',()=>pair(id=>{const x=founders(id);step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)]});return x;},(x,id,named)=>send(x.t,6,id,trip(28,31),{named,when:{day:5,hour:'10:00:00'}}),{to:8}));

const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
console.error(JSON.stringify(Object.fromEntries(Object.entries(out.cases).map(([k,v])=>[k,v.exception??{u:v.unnamed.result.action+(v.unnamed.result.missing.length?'['+v.unnamed.result.missing.join(',')+']':'')+(v.unnamed.result.status?'/'+v.unnamed.result.status:''),n:v.named.result.action+(v.named.result.missing.length?'['+v.named.result.missing.join(',')+']':'')+(v.named.result.status?'/'+v.named.result.status:''),eq:v.equal,strEq:v.strengthEqual,uKept:v.unnamed.keptFirstRows,uStops:v.unnamed.view.stop?.stops?.length,uLater:v.unnamed.later}]))));
