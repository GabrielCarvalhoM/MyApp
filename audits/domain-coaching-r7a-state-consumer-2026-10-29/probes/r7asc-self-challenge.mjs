// Author self-challenge (Founder §24; prints only): tries to break the four properties of the state model consumer closure on the runtime R7ASC_ROOT
// selects (default: the live tree), class by class. Each class runs its variants and counts violations; an exception is a violation of its class.
//   A  history contamination: KNOWN rows without a factual load (C1), retracted evidence (C2), conflicting reports (C3), late wearable data (C4)
//   C  semantic dose: HOLD (C5), MAINTAIN (C6), the REPS_THEN_LOAD goals (C7), goal changes (C8), partial repetitions and partial load (C9)
//   D  temporal evidence: mid-week returns and the restoration (C10), future same-week sessions (C11), week boundaries (C12), same-day order (C13)
//   B  public API: the reducer against historicalStateOf (C14), the PlanningView against history (C15)
//   D  across the simulation corpus: history at each week start does not move when sessions executed after it join the record (C16)
// Usage: node r7asc-self-challenge.mjs [class ...]
import * as L from './r7asc-lib.mjs';
const only=process.argv.slice(2),out={probe:'r7asc-self-challenge',root:L.ROOT,classes:{}};
const J=x=>JSON.stringify(x);
function run(name,fn){if(only.length&&!only.includes(name))return;const c=out.classes[name]={cases:0,violations:0,examples:[]};const bad=(why,x={})=>{c.violations++;if(c.examples.length<6)c.examples.push({why,...x});};
 try{fn({ok:()=>c.cases++,bad,c});}catch(e){bad('exception: '+e.message);}}
const RDL='db-rdl',safe=fn=>{try{return fn();}catch(e){return {error:e.message};}};
const H=(t,w,d=0,h='06:00:00',ledger=t.ledger)=>safe(()=>L.history(t,w,d,h,ledger));
const est=(Hs,id)=>{const s=Hs?.state?.strength?.exercises?.[id],h=Hs?.strength?.exercises?.[id];if(Hs?.error)return Hs;if(!s)return null;return {mode:s.mode,load:s.load??null,pendingLoad:s.pendingLoad??null,unlogged:!!s.unlogged,lastPerformed:s.lastPerformed??null,loadTick:s.loadTick??0,lifted:h?.liftedLoad??null};};
const entryOf=(t,w,id)=>safe(()=>{const x=L.copy(t),r=L.step(x,L.at(x.p,w,3,'06:00:00',L.brk(L.addDays(x.p.weeks[w].startDate,1),L.addDays(x.p.weeks[w].startDate,2))));const e=r.proposal.decisions.at(-1).interruption.entry.strength.exercises[id]??null;if(!e)return null;const {lastExecutedSets,...rest}=e;return rest;});
const fixOf=(o,correctedAt,actual)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response}});
const record=t=>L.V.hash(t.ledger.map(o=>({e:o.eventId,s:o.sessionId,t:o.observedAt,a:o.actual,c:o.correctionOf??null,x:!!o.superseded,q:!!o.conflicted})).sort((a,b)=>a.e<b.e?-1:1));

// ---------- A: history contamination ----------
run('C1-known-row-without-load',({ok,bad})=>{
 const V={noDetails:{noDetails:true},repsNoLoad:{set:(id,x)=>id===RDL?{reps:x.reps,rir:x.rir}:x},unknownUnit:{set:(id,x)=>id===RDL?{...x,load:{...x.load,unit:'STONE'}}:x},at18:{kg:(id,e)=>id===RDL?18:(e.load.mode==='KNOWN'?e.load.value:20)},at22:{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)},missed:{actual:{completed:false,minutes:0}}};
 for(const [name,v] of Object.entries(V))for(const factsOnly of [false,true]){
  const w2=(()=>{L.resetIds();const t=L.generate({id:'sc1'});L.weekly(t,0);L.step(t,L.at(t.p,1,6,'21:00:00',{observations:t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`sc1-w1-${i}`}))}));return t.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?v:{}),eventId:`sc1-w2-${i}`}));})();
  const cell=c=>{L.resetIds();const t=L.generate({id:'sc1'});L.weekly(t,0);const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`sc1-w1-${i}`}));
   const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===RDL)));
   const fixes=[...t.ledger.filter(o=>o.logs?.[RDL]&&!o.superseded),...w1.filter(has)].map(o=>fixOf(o,`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`,{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==RDL)}));
   if(c==='EARLY')L.step(t,L.at(t.p,1,6,'21:00:00',{observations:[...w1,...fixes]}));else{L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));L.step(t,L.at(t.p,2,0,'07:00:00',{observations:fixes}));}
   L.step(t,factsOnly?L.at(t.p,3,0,'06:00:00',{observations:structuredClone(w2)}):L.at(t.p,2,6,'21:00:00',{observations:structuredClone(w2)}));return t;};
  const E=cell('EARLY'),Lt=cell('LATE');ok();
  if(record(E)!==record(Lt)){bad('records differ',{name});continue;}
  const he=est(H(E,3,0,'06:30:00'),RDL),hl=est(H(Lt,3,0,'06:30:00'),RDL);
  if(J(he)!==J(hl))bad('history depends on when the correction reached the plan',{name,factsOnly,early:he,late:hl});
  if(hl&&hl.mode==='KNOWN'&&!(hl.lifted>0))bad('a KNOWN load without a usable log',{name,factsOnly,late:hl});
  if(J(entryOf(E,3,RDL))!==J(entryOf(Lt,3,RDL)))bad('return entries differ',{name,factsOnly});
 }
});
run('C2-retracted-evidence',({ok,bad})=>{
 const shapes={to20:(o,e)=>({...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:20}}))}),to18:(o,e)=>({...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:18}}))}),removed:null,notDone:'NOT_DONE'};
 for(const [name,shape] of Object.entries(shapes)){
  L.resetIds();const t=L.start('sc2',2);L.perDay(t,2,s=>!L.SAT(s));L.weekly(t,3,s=>!L.SAT(s));
  const sat=t.p.weeks[4].sessions.find(L.SAT),first=L.obs(t.p,sat,{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)});
  L.step(t,L.at(t.p,4,5,'21:00:00',{observations:[first]}));
  const actual=shape==='NOT_DONE'?{completed:false,minutes:0}:{...structuredClone(first.actual),exercises:shape?first.actual.exercises.map(e=>e.id===RDL?shape(first,e):e):first.actual.exercises.filter(e=>e.id!==RDL)};
  const fix=L.at(t.p,4,6,'21:00:00'),r=L.step(t,{...fix,observations:[fixOf(first,fix.asOf,actual)]});ok();
  if(!r.provenance.superseded.some(x=>x.eventId===first.eventId))bad('the normalizer did not supersede',{name});
  for(const [w,d,h] of [[4,6,'23:00:00'],[5,0,'06:00:00'],[5,3,'12:00:00'],[6,0,'06:00:00']]){const Hs=H(t,w,d,h);if(Hs?.error){bad('reader threw',{name,w,d,e:Hs.error});continue;}
   if(/\b22\b/.test(J({h:Hs.strength.exercises[RDL]??null,s:Hs.state.strength.exercises[RDL]??null})))bad('a public reader returns the retracted 22',{name,w,d});}
  const e=entryOf(t,5,RDL);if(/\b22\b/.test(J(e)))bad('a return resumes the retracted 22',{name});
 }
});
run('C3-conflicting-report',({ok,bad})=>{
 for(const late of [false,true])for(const variant of ['shorter','heavier']){
  L.resetIds();const t=L.generate({id:'sc3'}),w0=t.p.weeks[0].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`sc3-w0-${i}`}));
  const sat0=t.p.weeks[0].sessions.find(L.SAT),man=w0.find(o=>o.sessionId===sat0.id);
  const other={eventId:'sc3-w0-watch',athleteId:t.p.athleteId,sessionId:sat0.id,observedAt:man.observedAt,source:{provider:'HEALTHKIT',activityId:'hk-sc3',quality:'WEARABLE_FULL'},actual:variant==='shorter'?{completed:true,minutes:Math.round(man.actual.minutes*0.6)}:{...structuredClone(man.actual),exercises:man.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>({...x,load:x.load?.unit==='KG'?{...x.load,value:x.load.value+10}:x.load}))}))},response:{...L.OK}};
  L.step(t,{...L.at(t.p,0,6,'21:00:00',{observations:late?w0:[...w0,other]}),loadConfirmations:[{exerciseId:RDL,value:20,unit:'KG',convention:'PER_HAND'}]});
  if(late)L.step(t,L.at(t.p,1,0,'07:00:00',{observations:[other]}));
  L.weekly(t,1,()=>true,s=>L.SAT(s)?{noDetails:true}:{});ok();
  const s=H(t,2,0)?.state?.strength?.exercises?.[RDL];
  if(s&&s.mode==='KNOWN'&&!t.ledger.some(o=>!o.conflicted&&!o.superseded&&Number.isFinite(o.logs?.[RDL]?.load)))bad('a KNOWN load with only a quarantined log',{late,variant,state:s});
 }
});
run('C4-late-wearable-data',({ok,bad})=>{
 for(const day of [2,5]){
  L.resetIds();const a=L.start('sc4',2),b=L.copy(a),s=a.p.weeks[2].sessions.find(x=>L.live(x)&&x.sport==='STRENGTH'&&x.day===day),late=`${L.addDays(a.p.weeks[2].startDate,6)}T09:00:00Z`;
  L.step(a,L.at(a.p,2,day,'21:00:00',{observations:[L.obs(a.p,s)]}));L.step(a,L.at(a.p,2,6,'21:00:00'));
  L.step(b,L.at(b.p,2,6,'21:00:00',{observations:[L.obs(b.p,s,{extra:{reportedAt:late,source:{provider:'HEALTHKIT',activityId:'hk-sc4-'+day,quality:'WEARABLE_FULL'}}})]}));ok();
  const cut=[2,day,'23:00:00'],ha=H(a,...cut),hb=H(b,...cut);
  if(J(ha?.strength)!==J(hb?.strength))bad('the same execution reported late gives another history at the same cut',{day});
  const before=H(b,2,day-1,'12:00:00');if(Object.values(before?.strength?.exercises??{}).some(e=>e.lastPerformedAt===s.date))bad('an execution counted before it happened',{day});
 }
});

// ---------- C: semantic dose ----------
const outOfRange=(rows,goal)=>{const [,hi]=L.policy.operational.strength.goalDoses[goal].repRange;return rows.filter(r=>['KNOWN','FROM_LOG'].includes(r.mode)&&r.reps>hi);};
run('C5-hold',({ok,bad})=>{
 for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const [name,f] of Object.entries({missedBy2:x=>({...x,reps:Math.max(1,x.reps-2)}),missedBy1:x=>({...x,reps:x.reps-1}),lowReserve:x=>({...x,rir:0}),aboveLowReserve:x=>({...x,reps:x.reps+3,rir:0}),repsUnlogged:x=>({load:x.load,rir:x.rir})}))for(const path of ['R42','ownLoad']){
  L.resetIds();const t=L.generate({id:'sc5',goal});L.weekly(t,0);L.weekly(t,1);
  if(path==='R42')L.perDay(t,2,()=>true,s=>L.WED(s)?{kg:(id,e)=>id==='back-squat'?e.load.value-2.5:e.load.mode==='KNOWN'?e.load.value:20}:{});else L.weekly(t,2);
  const row=L.rowsOf(t,3,L.WED,['back-squat'])[0];L.weekly(t,3,()=>true,s=>L.WED(s)?{set:(id,x)=>id==='back-squat'?f(x):x}:{});ok();
  const k=t.last.gates?.['back-squat'];if(k!=='HOLD')continue;
  const next=L.rowsOf(t,4,L.WED,['back-squat'])[0];
  if(next.value>row.value+1e-9||next.reps>row.reps)bad('HOLD progressed the held dose',{goal,name,path,held:row,next});
  if(outOfRange([next],goal).length)bad('HOLD left the range',{goal,name,path,next});
 }
});
run('C6-maintain',({ok,bad})=>{
 for(const from of ['HYPERTROPHY','GENERAL','STRENGTH','RUNNING_SUPPORT'])for(const reps of [5,10,12,15])for(const when of [[2,0,'07:00:00'],[3,6,'22:00:00']]){
  L.resetIds();const t=L.start('sc6',2,{goal:from,athlete:{knownExercises:[L.K('back-squat',3,reps,70),L.K('db-bench-press',3,reps,18,'PER_HAND')]}});
  const r=L.evaluate(t,{...L.at(t.p,when[0],when[1],when[2],{kind:'GOAL_CHANGE'}),changes:{goals:{strength:'MAINTAIN'}}});if(r.proposal){t.ledger=r.actualLedger??t.ledger;t.p=r.proposal;}ok();
  if(t.p.goal.strength.kind!=='MAINTAIN')continue;
  for(let w=when[0];w<when[0]+4;w++)L.weekly(t,w);
  const bad8=[when[0]+1,when[0]+2,when[0]+3,when[0]+4].flatMap(w=>outOfRange(L.rowsOf(t,w,L.STR),'MAINTAIN'));if(bad8.length)bad('a row of a known dose outside 8-8',{from,reps,when,row:bad8[0]});
 }
});
run('C7-reps-then-load',({ok,bad})=>{
 for(const goal of ['HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const empty of [1,2]){
  const rows={};for(const cell of ['U','R']){L.resetIds();const t=L.generate({id:'sc7',goal});for(let w=0;w<4;w++)L.weekly(t,w);for(let w=4;w<4+empty;w++)if(cell==='R'||w===3+empty)L.weekly(t,w,()=>false);rows[cell]=L.rowsOf(t,4+empty,L.STR);
   const o=outOfRange(rows[cell],goal);if(o.length)bad('outside the range',{goal,empty,cell,row:o[0]});}
  ok();if(J(rows.U)!==J(rows.R))bad('the dose after empty weeks depends on whether they were reviewed',{goal,empty});
 }
});
run('C8-goal-change',({ok,bad})=>{
 const goals=['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','GENERAL','MAINTAIN'];
 for(const a of goals)for(const b of goals){if(a===b)continue;
  L.resetIds();const t=L.start('sc8',3,{goal:a,athlete:{knownExercises:[L.K('back-squat',3,12,70),L.K('db-bench-press',3,12,18,'PER_HAND')]}});
  const r=L.evaluate(t,{...L.at(t.p,3,6,'22:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:b}}});if(r.proposal){t.ledger=r.actualLedger??t.ledger;t.p=r.proposal;}ok();
  if(t.p.goal.strength.kind!==b)continue;for(let w=4;w<7;w++)L.weekly(t,w);
  const o=[4,5,6,7].flatMap(w=>outOfRange(L.rowsOf(t,w,L.STR),b));if(o.length)bad('a row of a known dose above the new goal\'s range',{from:a,to:b,row:o[0]});
 }
});
run('C9-partial',({ok,bad})=>{
 for(const [name,mk] of Object.entries({fewerSets:(p,s)=>({actual:{completed:false,minutes:Math.round(s.prescription.durationMinutes/2),exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:Math.max(1,e.sets-1)},()=>({load:{value:e.load.value??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}))}}),
  partialReps:()=>({set:(id,x)=>({...x,reps:Math.max(1,x.reps-3)})}),partialLoad:()=>({kg:(id,e)=>e.load.mode==='KNOWN'?e.load.value-2.5:20}),oneExercise:(p,s)=>({only:[s.prescription.exercises[0].id]})})){
  L.resetIds();const t=L.start('sc9',2),wed=t.p.weeks[2].sessions.find(L.WED),before=L.rowsOf(t,2,L.WED);
  L.weekly(t,2,()=>true,s=>L.WED(s)?mk(t.p,s):{});ok();
  const after=L.rowsOf(t,3,L.WED);for(const r of after){const b=before.find(x=>x.id===r.id);if(b&&b.mode==='KNOWN'&&r.mode==='KNOWN'&&(r.value>b.value+1e-9||r.value===b.value&&r.reps>b.reps))bad('a partial execution earned a step',{name,before:b,after:r});}
  const h=H(t,3,0),later=new Set(t.p.weeks[2].sessions.filter(x=>L.live(x)&&x.sport==='STRENGTH'&&x.day>wed.day).flatMap(x=>x.prescription.exercises.map(e=>e.id)));for(const e of wed.prescription.exercises){if(later.has(e.id))continue;const x=h?.strength?.exercises?.[e.id];if(x&&x.liftedLoad!==null&&e.load.mode==='KNOWN'&&name==='partialLoad'&&x.liftedLoad!==e.load.value-2.5)bad('history did not keep the lighter lift',{name,id:e.id,x});}
 }
});

// ---------- D: temporal evidence ----------
run('C10-return-midweek-restoration',({ok,bad})=>{
 const KNOWN3=[L.K('back-squat',4,5,80),L.K('barbell-rdl',3,6,90),L.K('db-bench-press',3,8,18,'PER_HAND')];
 for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const minutes of [20,25])for(const mode of ['thu','mon','fri'])for(const days of [[0,2,4],[0,3]]){
  L.resetIds();const t=L.generate({id:`sc10-${goal}-${minutes}-${mode}`,goal,athlete:{knownExercises:KNOWN3,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length}},schedule:{runDays:[1,5,6],strengthDays:days,runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
  for(let w=0;w<4;w++)L.weekly(t,w);L.weekly(t,4,s=>s.day<=2);L.weekly(t,5,()=>false);
  const rd=mode==='mon'?0:mode==='thu'?3:4,d=L.addDays(t.p.weeks[6].startDate,rd);
  L.step(t,L.at(t.p,6,rd,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:L.addDays(d,-16),endDate:L.addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
  const largest={},covered=new Set();
  for(let w=6;w<14;w++){
   for(const [x,ex] of Object.entries(t.p.stateTrace[w].strength.exercises))if(Number.isInteger(ex.setCap)||Number.isInteger(ex.regainCap)||Number.isInteger(ex.returnStep))covered.add(x);
   const from=w===6?rd:0,rows=t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='STRENGTH'&&s.day>=from).flatMap(s=>s.prescription.exercises);
   for(const e of rows)if(covered.has(e.id)&&Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)bad('a covered count came back more than one set above the largest executed since the break',{goal,minutes,mode,days,week:w,id:e.id,sets:e.sets,largest:largest[e.id]});
   L.weekly(t,w,s=>s.day>=from);if(w===8)L.step(t,L.at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
   for(const e of rows)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
  }
  ok();
  // The return steps move only from the dose executed: from the second week back the plan's return step is history's.
  for(let w=8;w<12;w++){const Hs=H(t,w,0);for(const [x,e] of Object.entries(t.p.stateTrace[w].strength.exercises)){const h=Hs?.state?.strength?.exercises?.[x];if(h&&Number.isInteger(h.returnStep)&&Number.isInteger(e.returnStep)&&e.returnStep>h.returnStep)bad('the plan is ahead of history in the return steps',{goal,mode,week:w,id:x,plan:e.returnStep,history:h.returnStep});}}
 }
 // The run side: a moderate return and a restart reported on Friday with the earlier easy run missed step only from what was run.
 for(const [m,days] of [['RETURN',16],['RESTART',35]]){L.resetIds();const t=L.start('sc10r-'+m,4),s0=L.addDays(t.p.weeks[4].startDate,1),end=L.addDays(s0,days-1),rw=Math.floor((Date.parse(end)-Date.parse(t.p.startDate))/864e5/7);
  L.step(t,L.at(t.p,rw,4,'07:00:00',L.brk(s0,end)));L.weekly(t,rw,s=>s.date>=L.addDays(t.p.weeks[rw].startDate,4));for(let w=rw+1;w<rw+5;w++)L.weekly(t,w);ok();
  const seq=[rw+1,rw+2,rw+3].map(w=>m==='RETURN'?t.p.stateTrace[w].run.returnStep??'done':t.p.stateTrace[w].run.restart);
  if(J(seq)!==J(m==='RETURN'?[0,1,'done']:[15,20,25]))bad('the run re-entry skipped a dose',{mode:m,seq});}
});
run('C11-future-same-week',({ok,bad})=>{
 const progs=[()=>{L.resetIds();return L.start('sc11a',6);},()=>{L.resetIds();const t=L.start('sc11b',2);for(let w=2;w<5;w++)L.weekly(t,w,()=>true,s=>s.sport==='STRENGTH'?{set:(id,x)=>id==='back-squat'?{...x,reps:x.reps-2,rir:0}:x}:{});L.weekly(t,5);return t;},()=>{L.resetIds();const t=L.start('sc11c',5);L.perDay(t,5,x=>!L.SAT(x));L.perDay(t,6,x=>!L.SAT(x));return t;}];
 for(const [i,mk] of progs.entries()){const t=mk();for(const w of [1,2,3,4,5])for(const [d,h] of [[0,'06:00:00'],[2,'12:00:00'],[4,'22:00:00'],[6,'23:30:00']]){
  const cut=`${L.addDays(t.p.weeks[w].startDate,d)}T${h}Z`,early=t.ledger.filter(o=>Date.parse(o.observedAt)<Date.parse(cut));ok();
  const a=safe(()=>L.A.historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},L.opts)),b=safe(()=>L.A.historicalStateOf(t.p,{asOf:cut,actualLedger:early},L.opts));
  if(J(a)!==J(b))bad('history at T moves with evidence executed after T',{program:i,cut});}}
});
run('C12-week-boundary',({ok,bad})=>{
 L.resetIds();const t=L.start('sc12',2);
 for(let w=2;w<7;w++){const mon=H(t,w,0,'00:30:00'),x=L.copy(t);L.weekly(x,w);ok();
  if(J(H(x,w,0,'00:30:00'))!==J(mon))bad('executing a week changed its own start',{week:w});
  if(Object.values(mon?.strength?.exercises??{}).some(e=>(e.lastPerformedAt??'')>=t.p.weeks[w].startDate))bad('a session of the new week is credited at its start',{week:w});
  L.weekly(t,w);}
});
run('C13-same-day-order',({ok,bad})=>{
 for(const startedAt of [null,'05:00:00','23:00:00']){L.resetIds();const t=L.start('sc13',4),wed=t.p.weeks[4].sessions.find(L.WED);L.step(t,L.at(t.p,4,2,'21:00:00',{observations:[L.obs(t.p,wed)]}));
  const r=safe(()=>L.evaluate(t,L.at(t.p,4,4,'07:00:00',L.brk(wed.date,L.addDays(wed.date,1),startedAt?{startedAt:`${wed.date}T${startedAt}Z`}:{}))));ok();
  if(r.error)bad('a same-day return threw',{startedAt,e:r.error});else if(!['MODIFY','ASK'].includes(r.status))bad('unexpected status',{startedAt,status:r.status});}
});

// ---------- B: public API ----------
run('C14-reducer-vs-public-reader',({ok,bad})=>{
 const states={plain:()=>{L.resetIds();return L.start('sc14a',5);},p40:()=>{L.resetIds();const t=L.start('sc14b',2);L.perDay(t,2,s=>!L.SAT(s));L.weekly(t,3,s=>!L.SAT(s));L.weekly(t,4);return t;},
  corrected:()=>{L.resetIds();const t=L.start('sc14c',4);const sat=t.p.weeks[4].sessions.find(L.SAT),o=L.obs(t.p,sat,{kg:(id,e)=>id===RDL?22:(e.load.mode==='KNOWN'?e.load.value:20)});L.step(t,L.at(t.p,4,5,'21:00:00',{observations:[o]}));const f=L.at(t.p,4,6,'21:00:00');L.step(t,{...f,observations:[fixOf(o,f.asOf,L.obs(t.p,sat).actual)]});return t;},
  afterReturn:()=>{L.resetIds();const t=L.start('sc14d',3);L.step(t,L.at(t.p,3,4,'07:00:00',L.brk(L.addDays(t.p.weeks[3].startDate,1),L.addDays(t.p.weeks[3].startDate,2))));L.weekly(t,3,s=>s.day>=4);L.weekly(t,4);return t;}};
 for(const [name,mk] of Object.entries(states)){const t=mk(),w=5,x=L.copy(t),bs=L.addDays(x.p.weeks[w].startDate,1),r=safe(()=>L.step(x,L.at(x.p,w,3,'06:00:00',L.brk(bs,L.addDays(bs,1)))));ok();
  if(r.error){bad('the return threw',{name,e:r.error});continue;}
  const entry=r.proposal.decisions.at(-1).interruption.entry.strength.exercises,pub=safe(()=>L.A.historicalStateOf(x.p,{asOf:`${bs}T00:00:00Z`,actualLedger:x.ledger},L.opts));
  for(const id of Object.keys(entry))if(J(pub?.state?.strength?.exercises?.[id])!==J(entry[id]))bad('the public reader and the reducer disagree',{name,id});}
});
run('C15-view-vs-history',({ok,bad})=>{
 for(const name of ['plain','p51']){L.resetIds();const t=name==='plain'?L.start('sc15a',5):(()=>{const t=L.start('sc15b',5);L.perDay(t,5,x=>!L.SAT(x));L.perDay(t,6,x=>!L.SAT(x));return t;})(),w=name==='plain'?5:7;
  const r=L.evaluate(t,{...L.at(t.p,w,1,'07:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:['DUMBBELLS','BENCH'],from:L.addDays(t.p.weeks[w].startDate,1),to:L.addDays(t.p.weeks[w].startDate,4)}});ok();
  if(!r.proposal){bad('no re-plan to compare',{name,status:r.status});continue;}
  const view=r.proposal.stateTrace[w].strength.exercises,Hs=L.A.historicalStateOf(t.p,{asOf:`${t.p.weeks[w].startDate}T00:30:00Z`,actualLedger:r.actualLedger},L.opts);
  for(const [id,h] of Object.entries(Hs.strength.exercises)){if(h.earnedProgress.stepEarned)continue;const v=view[id],s=Hs.state.strength.exercises[id];
   if(!v){bad('an established exercise is missing from the view',{name,id});continue;}
   for(const k of ['mode','load','reps','loadTick','lastPerformed','returnStep'])if(J(v[k]??null)!==J(s[k]??null))bad('the view mixes an atom history does not hold',{name,id,atom:k,view:v[k]??null,history:s[k]??null});}
  for(const id of Object.keys(view))if(!Hs.strength.exercises[id])bad('the view holds an exercise history does not',{name,id});
 }
});

// Property D on every simulated program (the class of the T04 dead bug), at the start of every week k:
// - the final program's history read with the whole record equals the same read with only the sessions executed before that start (corrections
//   travel with the session they correct);
// - for every exercise, the target history records for its last executed exposure is the target that exposure's row carried. A past week read
//   again at a later cut is read as of its own clock, so a session executed after that clock (and before the cut) moves nothing in it.
const SIM=await import(L.pathToRoot('src/r6-simulator.mjs')),TRAJ=await import(L.pathToRoot('r6/fixtures/trajectories.mjs'));
run('C16-later-evidence-invariance',({ok,bad})=>{
 const pick=Hs=>Hs?.error?Hs:{run:Hs?.state?.run??null,strength:Object.fromEntries(Object.entries(Hs?.state?.strength?.exercises??{}).map(([id,x])=>[id,(({mode,load,reps,loadTick,lastPerformed,returnStep,setCap,regainCap,setCeiling,blocksDone,pendingLoad,unlogged,ceiling})=>({mode,load,reps,loadTick,lastPerformed,returnStep,setCap,regainCap,setCeiling,blocksDone,pendingLoad,unlogged,ceiling}))(x)]))};
 for(const t of TRAJ.TRAJECTORIES){const sim=SIM.simulateProgram(t.input,t.script,L.opts);if(!sim.finalProgram){bad('the simulation produced no program',{id:t.id});continue;}
  const P=sim.finalProgram,ledger=sim.actualLedger,live=ledger.filter(o=>!o.superseded&&!o.conflicted),rows=new Map(P.weeks.flatMap(w=>w.sessions.filter(x=>x.prescription?.exercises).map(x=>[x.id,x.prescription.exercises])));
  for(let k=1;k<P.weeks.length;k++){const cut=`${P.weeks[k].startDate}T00:00:00Z`,before=ledger.filter(o=>Date.parse(o.observedAt)<Date.parse(cut));
   const full=pick(safe(()=>L.A.historicalStateOf(P,{asOf:cut,actualLedger:ledger},L.opts))),known=pick(safe(()=>L.A.historicalStateOf(P,{asOf:cut,actualLedger:before},L.opts)));ok();
   if(full.error||known.error){bad('the public reader threw',{id:t.id,week:k,e:full.error??known.error});continue;}
   if(J(full)!==J(known)){const ids=Object.keys({...full.strength,...known.strength}).filter(id=>J(full.strength[id])!==J(known.strength[id]));
    bad('a session executed after the cut moved history at the cut',{id:t.id,week:k,run:J(full.run)!==J(known.run),exercises:ids.map(id=>({id,withLater:full.strength[id]??null,cutOnly:known.strength[id]??null}))});}
   const Hs=safe(()=>L.A.historicalStateOf(P,{asOf:cut,actualLedger:ledger},L.opts));if(Hs?.error)continue;
   for(const [id,h] of Object.entries(Hs.strength.exercises)){if(h.lastExecutedReps===null)continue;
    const o=live.filter(o=>Date.parse(o.observedAt)<Date.parse(cut)&&(o.actual?.exercises??[]).some(e=>e.id===id)).sort((x,y)=>Date.parse(x.observedAt)-Date.parse(y.observedAt)).at(-1),row=o&&rows.get(o.sessionId)?.find(e=>e.id===id);
    if(!row)continue;ok();
    if(row.reps!==h.lastExecutedReps)bad('history records a target the last executed exposure never carried',{id:t.id,week:k,exercise:id,rowReps:row.reps,history:h.lastExecutedReps,kind:row.exposure?.kind??null});}}}
});

out.totalViolations=Object.values(out.classes).reduce((n,c)=>n+c.violations,0);out.classesRun=Object.keys(out.classes).length;out.cases=Object.values(out.classes).reduce((n,c)=>n+c.cases,0);
L.print(out);
