// R7-D Phase 3.3 independent quality/reliability probes (QUALITY_CHECK_R7D_PHASE33). Written by the reviewer, not by the author of the runtime,
// tests, harness or evidence. Runs directly against a runtime root given on the command line (a scratch copy: never the repository) and writes one
// JSON file. It never writes anywhere else and deletes nothing.
//   node qre-p33-runtime-probes.mjs --rt <root holding CoachingCore and the authority records> --out <file>
// Synthetic development fixtures (r7/b/fixtures/helpers.mjs): engineering evidence only.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--rt'),out=arg('--out');if(!root||!out)throw Error('--rt <root> --out <file>');
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=H;
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);

const GEN={id:'qre-p33-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const RUNONLY={id:'qre-p33-run',weeks:12,goals:{run:'PERFORMANCE',strength:'NONE'},schedule:{strengthDays:[]}};
const STRONLY={id:'qre-p33-str',weeks:12,goals:{run:'NONE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],schedule:{runDays:[],longRunDay:null}};
// A hybrid plan in EASY mode with two optional brisk walks a week (more chosen run days than current running supports).
const WALKS={id:'qre-p33-walk',weeks:12,goals:{run:'GENERAL',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{runDays:[1,2,3,5,6]},equipment:FULL};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}}),all=(p,s)=>obs(p,s);
const cache=new Map();
function base(o){if(!cache.has(o.id)){const t={p:program(o),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});cache.set(o.id,t);}const t=cache.get(o.id);return {p:t.p,ledger:[...t.ledger],ref:t.ref};}
const W2='2026-11-16',day=n=>addDays(W2,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const sessionsIn=(p,from,to)=>p.weeks.flatMap(x=>x.sessions).filter(s=>live(s)&&s.date>=day(from)&&s.date<=day(to));
const summary=(r,p)=>{const d=lastReturn(p);return {action:r.action,status:r.status,question:r.question?.kind??null,validity:r.planValidity?.status??null,
 stop:d&&r.action==='REESTABLISH'?{start:d.startDate,end:d.endDate,days:d.days,class:d.class,runMode:d.entry?.run?.mode??null,separate:(d.separateBreaks??[]).map(b=>({episode:b.episode,start:b.startDate,end:b.endDate,stop:b.stop,...(b.reentryWeek?{reentryWeek:b.reentryWeek}:{})}))}:null,
 reason:String(r.reason??'').slice(0,400)};};
/** A kept on `aAt` (fatigue report), the gap sessions reported with D's declaration (named, a fatigue report on `dAt`), then a plain review. */
function twoBreaks(o,id,{a,d,aAt,dAt,plainAt,report,gap}){
 const t=base(o);
 const ra=step(t,aAt.w,{day:aAt.d,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const g=sessionsIn(t.p,gap[0],gap[1]);
 const rd=step(t,dAt.w,{day:dAt.d,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:g.filter(s=>report(t.p,s)!==null).map(s=>report(t.p,s))});
 const r=step(t,plainAt.w,{day:plainAt.d,hour:plainAt.h??'08:00:00'});
 return {t,ra:ra.action,rd:rd.action,r,gap:g.map(s=>`${s.date}:${s.sport}:${s.role}${s.optional?'*':''}`)};
}
const cases=[];
const run=(id,why,fn)=>{try{cases.push({id,why,...fn()});}catch(e){cases.push({id,why,error:e.message.slice(0,500)});}};
// A = days 0-13 (weeks 2-3), kept Mon wk4; week 4 (days 14-20) between; D = Mon-Thu wk5 (days 21-24), declared Fri wk5; plain review Fri wk5.
const STD={a:brk(0,13),d:trip(21,24),aAt:{w:4,d:0},dAt:{w:5,d:4},plainAt:{w:5,d:4,h:'08:00:00'},gap:[14,20]};
const onlyRuns=(p,s)=>s.sport==='RUN'?obs(p,s):notDone(p,s),oneRun=(p,s)=>s.sport==='RUN'&&s.date===day(15)?obs(p,s):notDone(p,s);
for(const [plan,o] of [['RUN_ONLY',RUNONLY],['STRENGTH_ONLY',STRONLY]]){
 run(`Q1-${plan}-full-week`,`${plan} plan: week 4 executed in full between the breaks: a re-entry (expected SHORT, TRAINING_AFTER with reentryWeek ${day(14)})`,()=>{const x=twoBreaks(o,'q1f'+plan,{...STD,report:all});return {gap:x.gap,steps:[x.ra,x.rd],result:summary(x.r,x.t.p)};});
 run(`Q1-${plan}-one-session`,`${plan} plan: one session of week 4 done, the rest reported not done: no re-entry (expected MODERATE 25)`,()=>{const x=twoBreaks(o,'q1o'+plan,{...STD,report:(p,s)=>s===sessionsIn(p,14,20)[0]?obs(p,s):notDone(p,s)});return {gap:x.gap,steps:[x.ra,x.rd],result:summary(x.r,x.t.p)};});
}
// Q2: optional walks in the week between the breaks (gates read EASY/LONG/QUALITY/WALK_JOG only).
for(const [label,report] of [['walks unreported',(p,s)=>s.role==='WALK'?null:obs(p,s)],['walks reported not done',(p,s)=>s.role==='WALK'?notDone(p,s):obs(p,s)],['every session done',all]])
 run(`Q2-WALKS-${label.replace(/\W+/g,'-')}`,`hybrid plan with two optional walks a week: week 4 executed in full except the optional walks (${label})`,()=>{const x=twoBreaks(WALKS,'q2'+label.replace(/\W+/g,''),{...STD,report});return {gap:x.gap,steps:[x.ra,x.rd],result:summary(x.r,x.t.p)};});
// Q3: three separate breaks. (a) A, a whole week, B, one run, H: B is read through, A is history with its re-entry week.
run('Q3a-three-breaks-reentry-before-middle','A (days 0-13), week 4 in full, B (days 21-23), one run (Thu) and a strength session not done (Fri), H (days 26-29): expected A TRAINING_AFTER (reentryWeek wk4), B TRAINING_NOT_REESTABLISHED, stop 21-29 (9 days, SHORT)',()=>{
 const t=base(GEN);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'q3a-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk4=sessionsIn(t.p,14,20);
 const rb=step(t,5,{day:3,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,23),episodeId:'q3a-B'},event:{id:'q3a-B',kind:'LOCAL_FATIGUE'},observations:wk4.map(s=>obs(t.p,s))});
 const g=sessionsIn(t.p,24,25);
 const rh=step(t,6,{day:2,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(26,29),episodeId:'q3a-H'},event:{id:'q3a-H',kind:'LOCAL_FATIGUE'},observations:g.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 const r=step(t,6,{day:2,hour:'08:00:00'});return {gap:g.map(s=>`${s.date}:${s.sport}:${s.role}`),steps:[rb.action,rh.action],result:summary(r,t.p)};});
// (b) A, one run, B, a whole week, H: the loop stops at the week after B; A and B are both TRAINING_AFTER with that week.
run('Q3b-three-breaks-reentry-after-middle','A (days 0-13), one run (Tue wk4), B (days 17-20), week 5 in full, H (days 28-31): expected the stop H alone (SHORT), A and B TRAINING_AFTER, each with reentryWeek wk5',()=>{
 const t=base(GEN);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'q3b-A',kind:'SYSTEMIC_FATIGUE'}});
 const g1=sessionsIn(t.p,14,16);
 const rb=step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'q3b-B'},event:{id:'q3b-B',kind:'LOCAL_FATIGUE'},observations:g1.map(s=>oneRun(t.p,s))});
 const wk5=sessionsIn(t.p,21,27);
 const rh=step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'q3b-H'},event:{id:'q3b-H',kind:'LOCAL_FATIGUE'},observations:wk5.map(s=>obs(t.p,s))});
 const r=step(t,6,{day:4,hour:'08:00:00'});return {gap:[...g1,...wk5].map(s=>`${s.date}:${s.sport}:${s.role}`),steps:[rb.action,rh.action],result:summary(r,t.p)};});
// Q4: a return in force before the earlier break (an applied 4-day break in week 2), then A, one run, D; and A, a whole week, D.
run('Q4a-applied-return-before-A-isolated','applied break E (Mon-Thu wk2, returned Fri wk2), week 3 reviewed, A (wk4-5, days 14-27), one run (Tue wk6), D (Thu-Sun wk6, days 31-34): expected the stop 14-34 (21 days, MODERATE), the state from E\'s return',()=>{
 const t=base(GEN);
 const re=step(t,2,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(0,3)});
 step(t,2,{observations:sessionsIn(t.p,4,6).map(s=>obs(t.p,s))});step(t,3,{observations:t.p.weeks[3].sessions.filter(live).map(s=>obs(t.p,s))});
 step(t,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(14,27),event:{id:'q4a-A',kind:'SYSTEMIC_FATIGUE'}});
 const g=sessionsIn(t.p,28,30);
 step(t,7,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(31,34),episodeId:'q4a-D'},event:{id:'q4a-D',kind:'LOCAL_FATIGUE'},observations:g.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 const r=step(t,7,{day:0,hour:'08:00:00'});
 // The comparator: the same 21 days declared once.
 const k=base(GEN);step(k,2,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(0,3)});step(k,2,{observations:sessionsIn(k.p,4,6).map(s=>obs(k.p,s))});step(k,3,{observations:k.p.weeks[3].sessions.filter(live).map(s=>obs(k.p,s))});
 const rk=step(k,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk(14,34,{reason:'Holiday then work trip'})});
 const ahead=p=>p.weeks.slice(7,9).flatMap(x=>x.sessions.filter(s=>live(s)&&s.date>=day(35))).map(s=>`${s.sport}:${s.role}:${s.prescription.family??''}:${s.prescription.durationMinutes??''}`);
 return {firstReturn:re.action,result:summary(r,t.p),comparator:summary(rk,k.p),entrySameAsDeclaredOnce:hash(lastReturn(t.p)?.entry??null)===hash(lastReturn(k.p)?.entry??null),aheadSameAsDeclaredOnce:JSON.stringify(ahead(t.p))===JSON.stringify(ahead(k.p))};});
run('Q4b-applied-return-before-A-full-week','applied break E (Mon-Thu wk2), A (wk3, days 7-13), week 4 in full, D (Mon-Thu wk5): expected D alone (SHORT), A TRAINING_AFTER with reentryWeek wk4',()=>{
 const t=base(GEN);
 step(t,2,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(0,3)});step(t,2,{observations:sessionsIn(t.p,4,6).map(s=>obs(t.p,s))});
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(7,13),event:{id:'q4b-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk4=sessionsIn(t.p,14,20);
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'q4b-D'},event:{id:'q4b-D',kind:'LOCAL_FATIGUE'},observations:wk4.map(s=>obs(t.p,s))});
 const r=step(t,5,{day:4,hour:'08:00:00'});return {result:summary(r,t.p)};});
// Q5: the later break has a stated start time on a day the athlete trained before it: the week is complete before the break began.
run('Q5-startedAt-same-day','A (days 0-13), week 4 in full with its Sunday long run at 08:00, D from Sun wk4 18:00 (startedAt) to Wed wk5 (days 20-23): the whole week was executed before D began',()=>{
 const t=base(GEN);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'q5-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk4=sessionsIn(t.p,14,20);
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(20,23),startedAt:`${day(20)}T18:00:00Z`,episodeId:'q5-D'},event:{id:'q5-D',kind:'LOCAL_FATIGUE'},observations:wk4.map(s=>obs(t.p,s))});
 const r=step(t,5,{day:4,hour:'08:00:00'});return {gap:wk4.map(s=>`${s.date}:${s.sport}:${s.role}:${s.turn}`),result:summary(r,t.p)};});
// Q6: a whole week executed in full between the breaks, and sessions after it (before the later break) unreported.
run('Q6-full-week-then-unreported','A (days 0-13), week 4 in full, Mon-Tue wk5 unreported, D (Thu-Sun wk5, days 24-27): the re-entry week is found before any question about the later sessions',()=>{
 const t=base(GEN);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'q6-A',kind:'SYSTEMIC_FATIGUE'}});
 const wk4=sessionsIn(t.p,14,20);
 step(t,6,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(24,27),episodeId:'q6-D'},event:{id:'q6-D',kind:'LOCAL_FATIGUE'},observations:wk4.map(s=>obs(t.p,s))});
 const r=step(t,6,{day:0,hour:'08:00:00'});return {unreported:sessionsIn(t.p,21,23).map(s=>`${s.date}:${s.sport}:${s.role}`),result:summary(r,t.p)};});
// Q7: determinism: the same plain review twice, byte-identical; and the record's provenance kept append-only across the return.
run('Q7-determinism-and-record','F01 form (one run between): the same plain review evaluated twice gives byte-identical outputs; the declarations travel unchanged',()=>{
 const t=base(GEN);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'q7-A',kind:'SYSTEMIC_FATIGUE'}});
 const rowsA=JSON.stringify(t.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED'));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'q7-D'},event:{id:'q7-D',kind:'LOCAL_FATIGUE'},observations:sessionsIn(t.p,14,16).map(s=>oneRun(t.p,s))});
 const x=review(t.p,5,{day:1,hour:'07:00:00'}),a=evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts),b=evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);
 const decl=a.actualLedger.filter(o=>o.fact==='INTERRUPTION_DECLARED');
 return {sameHash:hash(a)===hash(b),firstDeclarationUnchanged:JSON.stringify(decl.slice(0,1))===rowsA,declarations:decl.map(o=>o.eventId),ledgerPrefixKept:JSON.stringify(a.actualLedger.slice(0,t.ledger.length).map(o=>o.eventId??o.fact))===JSON.stringify(t.ledger.map(o=>o.eventId??o.fact)),result:summary(a,a.proposal??t.p)};});
fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});
fs.writeFileSync(out,JSON.stringify({probe:'QRE-R7D-P33-RUNTIME-PROBES-1',runtimeRoot:path.resolve(root),runtimeSha256:{'CoachingCore/src/r6-adaptation.mjs':(await import('node:crypto')).createHash('sha256').update(fs.readFileSync(path.join(root,'CoachingCore/src/r6-adaptation.mjs'))).digest('hex')},cases},null,1)+'\n');
console.log(JSON.stringify(cases.map(c=>({id:c.id,error:c.error,res:c.result?{a:c.result.action,q:c.result.question,stop:c.result.stop&&[c.result.stop.start,c.result.stop.end,c.result.stop.days,c.result.stop.class,c.result.stop.separate.map(b=>b.stop+(b.reentryWeek?'@'+b.reentryWeek:'')).join('/')]}:null,extra:c.entrySameAsDeclaredOnce!==undefined?[c.entrySameAsDeclaredOnce,c.aheadSameAsDeclaredOnce]:c.sameHash!==undefined?[c.sameHash,c.firstDeclarationUnchanged,c.ledgerPrefixKept]:undefined})),null,1));
