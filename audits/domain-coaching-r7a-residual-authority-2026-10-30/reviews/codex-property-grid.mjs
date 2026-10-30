// Fresh bounded metamorphic cases. Reviewer-owned predicates; uses predecessor QE public-API scaffolding only.
import path from 'node:path';
const repo=path.resolve(import.meta.dirname,'../../..');
process.env.QE_ROOT??=path.join(repo,'CoachingCore');
const L=await import('../probes/judges/qe/qe-r7ada-lib.mjs');
const rows=[],errors=[];
const push=(group,input,read,violations=[])=>rows.push({group,input,read,violations});
const use=(t,r)=>L.step(t,r,{allow:true});
const kg=v=>(id,e)=>id==='db-rdl'?v:e.load.mode==='KNOWN'?e.load.value:20;
const target=s=>s.prescription?.exercises?.some(e=>e.id==='db-rdl');
const facts=t=>L.facts(t),hs=t=>L.hState(L.history(t,3),'db-rdl');
function event(t,kind,day,observations){const x=L.at(t.p,2,day,'06:00:00',{kind,observations});
 if(kind==='SCHEDULE_CHANGE')x.changes={runMinutes:55};
 if(kind==='GOAL_CHANGE')x.changes={goals:{strength:'HYPERTROPHY'}};
 if(kind==='UNAVAILABLE_DAY')x.changes={unavailableDates:['2030-01-01']};
 if(kind==='LOCAL_FATIGUE')x.signals={region:'UPPER'};
 if(kind==='DOUBLE_CONFLICT')x.changes={strengthTurn:'PM'};
 if(kind==='EQUIPMENT_CHANGE')x.changes={equipment:[...t.p.canonical.athlete.equipment,'BANDS']};
 if(kind==='MISSED_SESSION')x.targetSessionId=t.p.weeks[2].sessions.find(s=>L.live(s)&&s.sport==='RUN').id;
 if(kind==='RETURN_AFTER_PAUSE')x.interruption={days:3,startDate:L.addDays(t.p.weeks[2].startDate,day-3),endDate:L.addDays(t.p.weeks[2].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'};
 return x;
}
function correctionCell(shape,kind,day,early,shared){
 L.resetIds();const t=L.gen({id:'codex-A',schedule:{strengthDays:[2,6]}}),start=shape==='UP'?20:24;
 L.weekly(t,0,()=>true,s=>target(s)?{kg:kg(start)}:{});
 const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,target(s)?{kg:kg(start)}:{}),eventId:'cx-w1-'+i}));
 const before=[...t.ledger.filter(o=>o.logs?.['db-rdl']&&!o.superseded),...w1.filter(o=>t.p.weeks[1].sessions.some(s=>s.id===o.sessionId&&target(s)))];
 const fixes=before.map(o=>L.correctionOf(o,{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>shape!=='REMOVE'||e.id!=='db-rdl').map(e=>e.id!=='db-rdl'?e:{...e,sets:e.sets.map(s=>({...s,load:{...s.load,value:shape==='UP'?24:20}}))})},L.addDays(t.p.weeks[1].startDate,6)+'T20:00:00Z'));
 use(t,L.at(t.p,1,6,'21:00:00',{observations:early?[...w1,...fixes]:w1}));
 const r=use(t,event(t,kind,day,early?[]:fixes));
 const after=L.rowsOf(t,2,s=>s.day>=day,['db-rdl']);
 shared.reports??=t.p.weeks[2].sessions.filter(s=>L.live(s)&&s.day>=day).map(s=>({...L.obs(t.p,s,target(s)?{kg:kg(24),sets:(id,e)=>id==='db-rdl'?3:e.sets,set:(id,x)=>id==='db-rdl'?{...x,reps:5,rir:3}:x}:{}),eventId:'cx-w2-'+s.id}));
 let qs=[];
 for(let d=day;d<7;d++){const reports=shared.reports.filter(o=>t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.day===d&&L.live(s)));const close=use(t,L.at(t.p,2,d,'21:00:00',{observations:structuredClone(reports)}));qs.push(...(close.loadQuestions??[]).filter(q=>q.exerciseId==='db-rdl').map(q=>q.reason+':'+q.logged+'/'+q.planned));}
 return {status:r.status,action:r.action,proposal:!!r.proposal,after,questions:qs,history:hs(t),facts:facts(t),next:L.rowsOf(t,3,()=>true,['db-rdl'])};
}
if(!process.argv.includes('--B-only'))for(const shape of ['DOWN','UP','REMOVE'])for(const day of [0,6])for(const kind of ['WEEKLY_REVIEW','SCHEDULE_CHANGE','GOAL_CHANGE','UNAVAILABLE_DAY','LOCAL_FATIGUE','DOUBLE_CONFLICT','EQUIPMENT_CHANGE','MISSED_SESSION','RETURN_AFTER_PAUSE']){
 try{const shared={},E=correctionCell(shape,kind,day,true,shared),D=correctionCell(shape,kind,day,false,shared);
 const violations=[];if(E.facts!==D.facts)violations.push('NON_EQUIVALENT_FACTS');else for(const k of ['after','questions','history','next'])if(!L.eq(E[k],D[k]))violations.push('EARLY_LATE_'+k);
 push('A',{shape,day,kind},{EARLY:E,LATE:D},violations);
 }catch(e){errors.push({group:'A',shape,day,kind,error:e.stack});}
}
function pause(t,k,days,offset=0){const start=L.addDays(t.p.weeks[k].startDate,offset),end=L.addDays(start,days-1),report=L.addDays(end,1),w=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=L.addDays(x.startDate,6));if(w<0)throw Error('horizon');
 const r=use(t,L.at(t.p,w,Math.round((Date.parse(report)-Date.parse(t.p.weeks[w].startDate))/864e5),'06:00:00',L.brk(start,end)));
 const d=r.proposal?.decisions.at(-1);if(d?.action!=='REESTABLISH')throw Error('pause: '+r.status+' '+r.reason);
 return {entry:d.interruption.entry.run,cls:d.interruption.class,fromWeek:d.fromWeek,report,reportedAt:d.asOf,rows:t.p.weeks[d.fromWeek].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.date>=report).map(s=>({role:s.role,dimension:s.progression?.dimension,value:s.progression?.value,minutes:s.prescription.durationMinutes}))};
}
const record=(t,since=-Infinity)=>t.ledger.filter(o=>!o.superseded&&!o.partial&&!o.conflicted&&o.context?.sport==='RUN'&&Date.parse(o.observedAt)>since).map(o=>{const s=t.p.weeks.flatMap(w=>w.sessions).find(s=>s.id===o.sessionId);return {role:s?.role,dimension:s?.progression?.dimension,value:s?.progression?.value,minutes:s?.prescription?.durationMinutes,actualMinutes:o.actual?.minutes};});
function checkEasy(entry,ran){const cap=role=>Math.max(...ran.filter(x=>x.role===role&&!['THRESHOLD_STEP','SPECIFIC_STEP'].includes(x.dimension)).map(x=>x.minutes)),v=[],dest=entry.mode==='RETURN'?entry.returnTo:entry;
 for(const [role,k] of [['EASY','easy'],['LONG','long']]){const bound=cap(role);if(Number.isFinite(bound)&&dest?.[k]>bound)v.push(k+':'+dest[k]+'>'+bound);}
 return v;
}
function checkLong(p){const v=[];if(p.entry.mode!=='RESTART'||p.entry.restart>15)v.push('LONG_RESTART_ENTRY');if(p.rows.some(r=>r.minutes>15))v.push('LONG_RESTART_ROWS');return v;}
if(!process.argv.includes('--A-only')){
 // Cut both sides of consolidation, every break class, and the short/moderate boundary.
 for(const k of [2,4,5,6,8])for(const days of [3,10,11,28,29,33]){
  try{L.resetIds();const t=L.gen({id:'codex-B-easy',weeks:16});for(let w=0;w<k;w++)L.weekly(t,w);const ran=record(t),p=pause(t,k,days),v=p.cls==='LONG'?checkLong(p):checkEasy(p.entry,ran);
  push('B.easy',{k,days},{ran,return:p},v);}catch(e){errors.push({group:'B.easy',k,days,error:e.stack});}
 }
 // Reproduce SELF-01's transition and adjacent executed/unexecuted stages; no restart long-offset probes.
 for(const stage of [0,1,2])for(const after of ['NONE','ONE_RUN'])for(const days of [3,10,11,28,29,33]){
  try{L.resetIds();const t=L.gen({id:'codex-B-repeat',weeks:16});for(let w=0;w<3;w++)L.weekly(t,w);const first=pause(t,3,14);
   for(let w=5;w<5+stage;w++)L.weekly(t,w);
   const k=5+stage;
   if(after==='ONE_RUN'){const s=t.p.weeks[k].sessions.find(s=>L.live(s)&&s.sport==='RUN');use(t,L.at(t.p,k,s.day,'21:00:00',{observations:[L.obs(t.p,s)]}));}
   // While a RETURN remains active its returnTo is a future conditional target, not its entry dose (E1.3/E1.4).
   const ran=record(t,Date.parse(first.reportedAt)),p=pause(t,k,days,after==='ONE_RUN'?2:0),v=p.cls==='LONG'?checkLong(p):stage<2||(p.cls==='SHORT'&&p.entry.mode==='RETURN')?[]:checkEasy(p.entry,ran);
   const last=ran.at(-1);
   if((p.cls==='SHORT'||stage<2&&p.cls==='MODERATE')&&last?.dimension==='RETURN_STEP'&&(p.entry.mode!=='RETURN'||p.entry.returnStep>last.value))v.push('RETURN_RELEASE_ABOVE_EXECUTION');
   if(stage===0&&after==='NONE'&&p.cls!=='LONG'&&(p.entry.mode!=='RETURN'||p.entry.returnStep!==0))v.push('UNEXECUTED_REENTRY');
   if(p.cls==='MODERATE'&&stage===2&&(p.entry.mode!=='RETURN'||p.entry.returnStep!==0||p.entry.returnFrom.easy>15))v.push('SELF_01_MODERATE_RECIPE');
   push('B.repeated',{stage,after,days},{ran,return:p},v);
  }catch(e){errors.push({group:'B.repeated',stage,after,days,error:e.stack});}
 }
}
const out={probe:'codex-independent-property-grid',node:process.version,tree:L.ROOT,rows,errors,summary:{cases:rows.length,violations:rows.filter(r=>r.violations.length).length,errors:errors.length,groups:Object.fromEntries([...new Set(rows.map(r=>r.group))].map(g=>[g,{cases:rows.filter(r=>r.group===g).length,violations:rows.filter(r=>r.group===g&&r.violations.length).length}]))}};
console.log(JSON.stringify(out,null,2));process.exitCode=errors.length||out.summary.violations?1:0;
