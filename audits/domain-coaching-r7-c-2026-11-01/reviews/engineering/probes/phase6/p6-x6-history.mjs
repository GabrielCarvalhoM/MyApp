// P6-X6: no past history rewritten by the recorded-answer re-plan. For every F3 decision whose factual state came from it (origin RECORDED), in
// (a) the answer grid (GEN week 7, R10K taper and race week; g 0/2; RV/NR; EXEC, MIXED, ADVERSE, LONGONE; carriers CSUB and CHOICE; next a
// plain review on day 3 and day 5) and (b) the reach scenarios (P51 and GEN, never reviewed, Saturday lift missed / long run at 70 %), the
// proposal is compared with the program it replaces:
//  - every week before the decision's week: sessions, start trace and recorded start authority byte-identical;
//  - the decision's week: every session dated before the decision (or not ahead) byte-identical;
//  - the decision log: the earlier decisions are a prefix of the new one (append-only);
//  - HistoricalState (historicalStateOf, the public read-only API) at the decision's clock, on the same record: identical before and after.
// Also counted: decisions whose status is UNSUPPORTED (the runtime's own immutability guard failing closed). Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,notDone,BAD,ORIGIN} from './p6-lib.mjs';
const R=RUNTIMES[Object.keys(RUNTIMES).find(n=>n.startsWith('F3'))],H=R.H,{hash}=R;
const out={probe:'P6-X6 history under the recorded-answer re-plan',runtime:R.name,checked:0,violations:[],unsupported:0};
function check(label,before,r,w,asOf,ledger){
 if(r.status==='UNSUPPORTED')out.unsupported++;
 if(ORIGIN(r)!=='RECORDED'||!r.proposal)return;
 out.checked++;const P=r.proposal,bad=[],day=asOf.slice(0,10);
 for(let j=0;j<w;j++){
  if(hash(before.weeks[j].sessions)!==hash(P.weeks[j].sessions))bad.push(`week ${j} sessions`);
  if(hash(before.stateTrace[j])!==hash(P.stateTrace[j]))bad.push(`week ${j} start trace`);
  if(hash(before.weeks[j].startAuthority??null)!==hash(P.weeks[j].startAuthority??null))bad.push(`week ${j} start authority`);
 }
 const old=new Map(before.weeks[w].sessions.map(s=>[s.id,s]));
 for(const s of P.weeks[w].sessions){const o=old.get(s.id);if(o&&o.date<day&&hash(o.prescription)!==hash(s.prescription))bad.push(`past session ${s.id}`);}
 for(const o of before.weeks[w].sessions)if(o.date<day&&!P.weeks[w].sessions.some(s=>s.id===o.id))bad.push(`past session removed ${o.id}`);
 if(hash(before.decisions)!==hash(P.decisions.slice(0,before.decisions.length)))bad.push('decision log not append-only');
 const h0=R.A.historicalStateOf(before,{asOf,actualLedger:ledger},H.opts),h1=R.A.historicalStateOf(P,{asOf,actualLedger:ledger},H.opts);
 if(hash(h0)!==hash(h1))bad.push('HistoricalState differs');
 if(bad.length)out.violations.push({label,bad});
}
const step=(t,w,x,label,apply=true)=>{const before=t.p,asOf=`${addDays(before.weeks[w].startDate,x.day??6)}T${x.hour??'21:00:00'}Z`,r=t.step(w,x,{apply});check(label,before,r,w,asOf,t.ledger);return r;};
const GEN={id:'p6x6-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const R10K={id:'p6x6-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
for(const [prog,o,b] of [['GEN',GEN,7],['R10K',R10K,10],['R10K',R10K,11]])for(const g of [0,2])for(const mode of ['RV','NR']){
 const B=client(R,H.program(o));
 for(let w=0;w<g;w++)B.step(w,{observations:B.p.weeks[w].sessions.filter(live).map(s=>H.obs(B.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)B.step(w,{observations:strengthOf(B.p,w)});
 B.step(b-1,{observations:[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(B.p,w)):[]),...strengthOf(B.p,b-1)]});
 const start=B.p.weeks[b].startDate,runs=runSessions(B.p,g,b),oldest=runs.filter(s=>s.role==='LONG'&&addDays(s.date,30)>=start).sort((x,y)=>x.date<y.date?-1:1)[0];
 for(const V of ['EXEC','MIXED','ADVERSE','LONGONE']){
  const facts=runs.map(s=>V==='EXEC'?H.obs(B.p,s):V==='MIXED'?(s.role==='LONG'?H.obs(B.p,s):notDone(B.p,s)):V==='ADVERSE'?H.obs(B.p,s,s.role==='LONG'?{response:BAD}:{}):(s.id===oldest?.id?H.obs(B.p,s):notDone(B.p,s)));
  for(const carrier of ['CSUB','CHOICE']){
   const t=B.copy(),label=`${prog} b=${b} g=${g} ${mode} ${V} ${carrier}`;
   if(carrier==='CSUB'){const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];t.step(b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;}
   else t.step(b,{day:2,hour:'07:00:00',observations:facts,choices:[{type:'NOT_A_CHOICE'}]},{apply:false});
   step(t,b,{day:3,hour:'07:00:00'},label+' d3');step(t,b,{day:5,hour:'07:00:00'},label+' d5');
  }
 }
}
// (b) The reach: never reviewed, reported on the day (Sunday's on Monday 06:00).
const P51={id:'p6x6-p51',weeks:16,goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[H.K('back-squat',3,5,80),H.K('db-bench-press',3,8,18,'PER_HAND'),{id:'db-split-squat',familiar:true}],schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}};
for(const [prog,o] of [['P51',P51],['GEN',GEN]])for(const dev of ['SAT_LIFT_MISSED','LONG_70']){
 const t=client(R,H.program(o));
 const rep=s=>dev==='SAT_LIFT_MISSED'&&s.sport==='STRENGTH'&&s.day===5?null:dev==='LONG_70'&&s.role==='LONG'?H.obs(t.p,s,{minutes:Math.round(s.prescription.durationMinutes*0.7)}):H.obs(t.p,s);
 for(let w=0;w<10;w++){
  const ss=t.p.weeks[w].sessions.filter(live);
  for(const d of [...new Set(ss.filter(s=>s.day<6).map(s=>s.day))].sort())step(t,w,{day:d,hour:'21:00:00',observations:ss.filter(s=>s.day===d).map(rep).filter(Boolean)},`${prog} ${dev} w${w} d${d}`);
  step(t,w+1,{day:0,hour:'06:00:00',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(rep).filter(Boolean)},`${prog} ${dev} w${w+1} d0`);
 }
}
console.log(JSON.stringify(out,null,1));
