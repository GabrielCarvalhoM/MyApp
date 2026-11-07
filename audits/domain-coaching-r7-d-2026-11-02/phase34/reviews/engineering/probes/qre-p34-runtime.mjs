// QRE R7-D Phase 3.4 narrow check: runtime adversarial probes (independent Quality/Reliability Engineer; not the author's evidence).
// Runs on a scratch copy only: node qre-p34-runtime.mjs <root> --label <name> [--out <file>]
// <root> holds CoachingCore/ (and the audit records it reads). The fixtures are the repository's own (r7/b/fixtures/helpers.mjs) from that root.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const {opts,K,FULL,elig,program,review,obs,live,addDays,evaluateProgram}=H;

const GEN={id:'qre-p34-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
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
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,monStrength=s=>s.sport==='STRENGTH'&&dow(s)===1,longRun=s=>s.sport==='RUN'&&s.role==='LONG',tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s),all=(p,s)=>obs(p,s);
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
const sum=d=>d?{start:d.startDate,end:d.endDate,days:d.days,cls:d.class,relation:d.relation??null,runMode:d.entry?.run?.mode??null,stops:(d.separateBreaks??[]).map(b=>b.stop+(b.ownReturn?`(${b.ownReturn.class}/${b.ownReturn.days},RUN=${b.ownReturn.reentered.RUN},STR=${b.ownReturn.reentered.STRENGTH})`:'')+(b.stopInOwnReturn!==undefined?`[in ${b.ownReturnOf}: ${b.stopInOwnReturn}]`:''))}:null;
const res=r=>({action:r.action,status:r.status??null,validity:r.planValidity?.status??null,missing:r.missingInputs??[],question:r.question?.kind??null,reason:String(r.reason??'').slice(0,260)});
function foundersCase(id,D,plainAt={day:4,hour:'08:00:00'},report=miss(friStrength)){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>report(t.p,s)));
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,r:step(t,6,plainAt)};
}
const view=t=>{const d=lastReturn(t.p),from=addDays(t.p.weeks[6].startDate,6);return {stop:sum(d),runs:runsAhead(t.p,6,from),strength:strengthAhead(t.p,6,from)};};
const out={probe:'QRE-P34-RUNTIME-1',label,root,cases:{}};
const run=(id,f)=>{try{out.cases[id]=f();}catch(e){out.cases[id]={exception:e.name+': '+e.message,stack:String(e.stack).split('\n').slice(0,5).join(' | ')};}};

// Q01: a named correction of the latest break that states its length and last day but not its first day (readBreak accepts it: start=null), after a
// return that read the holiday as its own return. Compared with the same correction stating its first day, and with the fresh read of the corrected trip.
run('Q01_correction_without_startDate',()=>{
 const at={day:5,hour:'10:00:00'};
 const a=foundersCase('q01a',trip(28,31)),ra=a.r;
 const {startDate,...noStart}=trip(28,32);
 const rc=step(a.t,6,{...at,kind:'RETURN_AFTER_PAUSE',interruption:{...noStart,episodeId:'q01a-D'},event:{id:'q01a-D2',kind:'RETURN_AFTER_PAUSE'}});
 const b=foundersCase('q01b',trip(28,31));
 const rb=step(b.t,6,{...at,kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,32),episodeId:'q01b-D'},event:{id:'q01b-D2',kind:'RETURN_AFTER_PAUSE'}});
 const f=foundersCase('q01f',trip(28,32),at);
 const f2=foundersCase('q01f2',noStart,at);
 return {first:{result:res(ra),view:view(a.t)},correctionWithoutStart:{result:res(rc),view:view(a.t)},correctionWithStart:{result:res(rb),view:view(b.t)},freshWithStart:{result:res(f.r),view:view(f.t)},freshWithoutStart:{result:res(f2.r),view:view(f2.t)},
  equalNoStartVsWithStart:hash(view(a.t))===hash(view(b.t)),equalNoStartVsFresh:hash(view(a.t))===hash(view(f.t))};
});

// Q03: R-F08-1 on the paths that do not read the kept record: a review whose interruption is an empty template, and a review that states a break
// beginning after it (a plan). The kept episode is clinical (injury), restated as a holiday by name, the client cleared the continuation state.
run('Q03_rf08_unread_paths',()=>{
 const injury=brk(0,13,{reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false});
 const t=base();
 const r0=step(t,4,{day:0,hour:'07:00:00',interruption:injury,event:{id:'q03-A',kind:'WEEKLY_REVIEW'}});
 const r1=step(t,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A(),episodeId:'q03-A'}});t.ref=null;
 const tmpl=step(copy(t),4,{day:2,hour:'07:00:00',kind:'WEEKLY_REVIEW',interruption:{startDate:null,endDate:null,reason:null,reasonCategory:null}});
 const tmplRet=step(copy(t),4,{day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:null,endDate:null,reason:null,reasonCategory:null}});
 const plan=step(copy(t),4,{day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(20,22)});
 const plain=step(copy(t),4,{day:2,hour:'07:00:00'});
 return {injury:res(r0),restated:res(r1),templateWeekly:{...res(tmpl),proposal:!!tmpl.proposal},templateReturn:{...res(tmplRet),proposal:!!tmplRet.proposal},futureBreak:{...res(plan),proposal:!!plan.proposal},plainControl:{...res(plain),proposal:!!plain.proposal}};
});

// Q04: genuine late evidence that removes the run-complete weeks the own return read (I6; SSCTR CF-P34-04): after the Founder's-case return, the long
// runs of weeks 4 and 5 are corrected to not done. The fresh read of the corrected record (no sport complete in any week: the stop runs through the
// holiday, as the X2 residual) is compared with what the next review decides.
run('Q04_late_evidence_flips_own_return',()=>{
 const c=foundersCase('q04',trip(28,31));
 const longs=[4,5].map(w=>c.t.p.weeks[w].sessions.find(s=>live(s)&&longRun(s)));
 const fixes=longs.map(s=>{const row=c.t.ledger.find(o=>o.sessionId===s.id&&!o.fact);return {...obs(c.t.p,s,{actual:{completed:false,minutes:0}}),observedAt:row.observedAt,correctionOf:row.eventId,correctedAt:`${day(33)}T09:00:00Z`};});
 const later=step(copy(c.t),6,{day:5,hour:'09:30:00',observations:fixes});
 const fresh=foundersCase('q04f',trip(28,31),{day:4,hour:'08:00:00'},(p,s)=>friStrength(s)||longRun(s)?notDone(p,s):obs(p,s));
 return {returnRead:{result:res(c.r),view:view(c.t)},nextReviewWithCorrections:{...res(later),proposal:!!later.proposal},freshReadOfCorrectedRecord:{result:res(fresh.r),view:view(fresh.t)}};
});

// Q05: SKIPPED sessions (an unavailable day skips a session without debt): in the late form (weeks reviewed at the time, the holiday declared
// later), the athlete marks both strength days of weeks 4 and 5 unavailable and runs every run. The between weeks then plan running only.
run('Q05_skipped_strength_weeks',()=>{
 const mk=(id,mode)=>{
  const t=base();
  for(const w of [2,3])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))});
  for(const w of [4,5]){
   if(mode==='SKIPPED'){const dates=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>s.date);step(t,w,{day:0,hour:'05:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:dates}});}
   step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>mode==='NOT_DONE'&&s.sport==='STRENGTH'?notDone(t.p,s):obs(t.p,s))});
  }
  step(t,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
  const before=t.p.weeks[6].sessions.filter(s=>live(s)&&s.date<day(30));
  step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:before.map(s=>notDone(t.p,s))});
  const r=step(t,7,{day:0,hour:'07:00:00'}),from=addDays(t.p.weeks[7].startDate,0);
  return {result:res(r),stop:sum(lastReturn(t.p)),skippedInWeeks45:[4,5].map(w=>t.p.weeks[w].sessions.filter(s=>s.status==='SKIPPED').map(s=>s.sport+':'+s.date)),runs:runsAhead(t.p,7,from),strength:strengthAhead(t.p,7,from)};
 };
 return {skipped:mk('q05s','SKIPPED'),notDone:mk('q05n','NOT_DONE'),allDone:mk('q05a','ALL')};
});

// Q06: weeks of generated plans whose running is only sessions the re-entry contract does not count (no gated run): such a week can never be
// complete in running, so it can never be a full re-entry week while it plans running (static scan of the plans the tests generate).
run('Q06_weeks_without_counted_runs',()=>{
 const GATED=['EASY','LONG','QUALITY','WALK_JOG'];
 const shapes={GEN,GEV:{id:'qre-p34-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}},
  HALF:{id:'qre-p34-hm',weeks:14,goals:{run:'HALF_MARATHON',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'HALF_MARATHON',date:'2027-01-24'}},
  WALKS:{id:'qre-p34-walks',weeks:12,goals:{run:'GENERAL',strength:'GENERAL'},equipment:FULL,recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{runDays:[1,2,3,5,6]}}};
 const o={};
 for(const [k,s] of Object.entries(shapes)){let p;try{p=program(s);}catch(e){o[k]={error:e.message.slice(0,200)};continue;}
  o[k]=p.weeks.map((w,j)=>{const runs=w.sessions.filter(x=>live(x)&&x.sport==='RUN');return {week:j,phase:w.phase,runRoles:runs.map(x=>x.role+(x.optional?'(opt)':'')),gated:runs.filter(x=>GATED.includes(x.role)).length,strength:w.sessions.filter(x=>live(x)&&x.sport==='STRENGTH').length};}).filter(x=>x.runRoles.length&&!x.gated);
 }
 return o;
});

// Q07: determinism with R-F08-1: the same clinical-cause review evaluated twice is byte-identical, and the episode's route is never serialized.
run('Q07_rf08_determinism',()=>{
 const injury=brk(0,13,{reasonCategory:'INJURY',reason:'ankle sprain',nonclinical:false});
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',interruption:injury,event:{id:'q07-A',kind:'WEEKLY_REVIEW'}});
 const x=review(t.p,4,{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A(),episodeId:'q07-A'}});
 const input={...x,actualLedger:t.ledger};
 const r1=evaluateProgram(t.p,input,opts),r2=evaluateProgram(t.p,input,opts),s=JSON.stringify(r1);
 return {status:r1.status,identical:hash(r1)===hash(r2)&&JSON.stringify(r2)===s,symbolInOutput:/Phase 3\.4: the clinical route/.test(s),episodeInReason:/restating that break as nonclinical/.test(r1.reason??''),inputHashMatchesInput:r1.inputHash===hash({programHash:t.p.hash,review:input})};
});

const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
