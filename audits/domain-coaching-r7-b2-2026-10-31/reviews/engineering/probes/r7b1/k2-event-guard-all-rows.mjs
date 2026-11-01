// R7B1-ENG-r2 judge probe K2 (the cycle's event-week guard on every row, its records and the general disclosure; regressions and state). Read-only;
// PROBE_ROOT=<tree> runs it on another runtime (compare the 'preserve' fingerprints between FREEZE-1 and FREEZE-2).
// - K2a preserve: event programs (rotations FIXED, EVERY_2_WEEKS, COACH_DECIDES; 10K and half; several equipment sets) executed as prescribed and
//   reviewed every week through the post-event week: no event-week stand-in or omission is recorded and no NO_NEW_EXERCISE_IN_EVENT_WEEKS note is
//   emitted; the plan fingerprint is printed so the two runtimes can be compared;
// - K2b one strength day always skipped: in the event weeks every row is performed in this program, or a stand-in that is performed, admissible for
//   the row (not set aside) and fits the equipment of the date, or left out; the omission is disclosed once by the decision that makes it (no note
//   repeated for the same slot by later reviews);
// - K2c a travel window over the taper (kettlebell only): event-week rows fit the equipment of their date; stand-ins are performed;
// - K2d history never reads the guard: HistoricalState at each event-week start equals the reducer's facts (lastPerformedAt only from executions).
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL,apply,A,P,R,imp,LABEL} from './lib.mjs';
import {createHash} from 'node:crypto';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,16);
const eventSessions=(p,w)=>{const sk=P.skeletonOf(p,auth);return p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&EVENT.includes(P.dayPhaseOf(sk.at(w)??sk,w,s.day)));};
const performedSet=t=>{const byId=new Map(t.p.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));return new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??byId.get(o.sessionId)?.prescription?.exercises??[]).map(e=>e.id)));};
const notesOf=r=>(r.disclosures??[]).filter(d=>d.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');
const F={K2a:[],K2b:[],K2c:[],K2d:[]},fp={},info={};
const BASE={recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]}};
const PROGRAMS=[
 ['10k-fixed-db-kb',{...BASE,goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],rotation:'FIXED'}],
 ['10k-rot2-full-3d',{...BASE,goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL,rotation:'EVERY_2_WEEKS',schedule:{...BASE.schedule,strengthDays:[0,2,4]}}],
 ['10k-coach-full-3d',{...BASE,goals:{run:'RACE',strength:'STRENGTH'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL,rotation:'COACH_DECIDES',schedule:{...BASE.schedule,strengthDays:[0,2,4]}}],
 ['half-rot2-bw',{...BASE,goals:{run:'RACE',strength:'RUNNING_SUPPORT'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},weeks:16,equipment:['BANDS','PULL_UP_BAR'],rotation:'EVERY_2_WEEKS',schedule:{runDays:[1,3,4,6],strengthDays:[0,2,4],longRunMinutes:120}}],
 ['10k-short-fixed',{...BASE,goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-17'},weeks:12,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],rotation:'FIXED'}],
 ['10k-novice-cap',{...BASE,goals:{run:'RACE',strength:'GENERAL'},strengthExperience:'NONE',event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH'],rotation:'FIXED',schedule:{...BASE.schedule,strengthDays:[0,2,4,5]}}]];
for(const [name,o] of PROGRAMS){
 // K2a preserve
 guard('K2a-'+name,'preserve',()=>{
  const t=reviewed({...o,id:'k2a-'+name},0),post=t.p.phases.phases.lastIndexOf('POST_EVENT'),last=Math.min(post+1,t.p.weeks.length-1),notes=[];
  for(let w=0;w<last;w++){const r=weekly(t,w,{o:()=>({kg:()=>16})});notes.push(...notesOf(r).map(d=>`w${w}:`+(d.slots??[]).map(g=>g.sessionId+':'+g.selected).join(',')));}
  const recs=t.p.weeks.flatMap(w=>w.sessions.flatMap(s=>(s.eventStandIns??[]).map(g=>`${s.id}:${g.selected}>${g.inEventWeeks}`)));
  fp[name]={plan:sha(t.p.weeks.map(w=>w.sessions.map(s=>[s.id,s.prescription]))),records:recs.length,notes:notes.length};
  if(recs.length||notes.length)F.K2a.push({name,records:recs.slice(0,6),notes:notes.slice(0,6),note:'a timeline executed as prescribed records or discloses event-week omissions'});
 });
 // K2b one strength day skipped every week (the athlete never does that day's session)
 guard('K2b-'+name,'skipped day',()=>{
  const t=reviewed({...o,id:'k2b-'+name},0),post=t.p.phases.phases.lastIndexOf('POST_EVENT'),taper=t.p.phases.phases.findIndex(p=>EVENT.includes(p)),skipDay=Math.max(...t.p.canonical.schedule.strengthDays);
  const noteSlots=new Map();
  for(let w=0;w<=Math.min(post,t.p.weeks.length-2);w++){
   const r=weekly(t,w,{keep:s=>!(s.sport==='STRENGTH'&&s.day===skipDay),o:()=>({kg:()=>16})});
   for(const d of notesOf(r))for(const g of d.slots??[])noteSlots.set(g.sessionId+':'+g.selected,(noteSlots.get(g.sessionId+':'+g.selected)??0)+1);
   const k=w+1;if(k<taper||k>post)continue;
   const performed=performedSet(t),sk=P.skeletonOf(t.p,auth),aside=new Set((t.p.canonical.athlete.strengthSelections??[]).map(s=>s.from));
   for(const s of eventSessions(t.p,k)){
    const have=new Set([...(sk.at(k)??sk).equipmentForDate(s.date),'BODYWEIGHT']);
    for(const e of s.prescription?.exercises??[]){const c=R.configurationOf(e.id);
     if(!performed.has(e.id)&&e.role!=='PRACTICE')F.K2b.push({name,week:k,session:s.id,exercise:e.id,note:'never performed in this program, on an event-phase day'});
     if(!c.equipment.every(q=>have.has(q)))F.K2b.push({name,week:k,session:s.id,exercise:e.id,note:'does not fit the equipment of the date'});
     if(aside.has(e.id))F.K2b.push({name,week:k,session:s.id,exercise:e.id,note:'set aside'});}
    for(const g of s.eventStandIns??[])if(g.inEventWeeks&&!performed.has(g.inEventWeeks))F.K2b.push({name,week:k,session:s.id,standIn:g.inEventWeeks,note:'stand-in not performed'});
   }
  }
  const repeated=[...noteSlots].filter(([,n])=>n>1);
  info['K2b-'+name]={skipDay,noteSlots:noteSlots.size,repeated:repeated.slice(0,6)};
  if(repeated.length)F.K2b.push({name,repeated:repeated.slice(0,6),note:'the same event-week omission is disclosed again by later reviews'});
 });
}
// K2c a travel window over the taper: kettlebell only
guard('K2c','taper window',()=>{
 const o=PROGRAMS[0][1],t=reviewed({...o,id:'k2c'},0),taper=t.p.phases.phases.indexOf('TAPER'),post=t.p.phases.phases.indexOf('POST_EVENT');
 for(let w=0;w<taper;w++)weekly(t,w,{o:()=>({kg:()=>16})});
 const from=t.p.weeks[taper].startDate,to=addDays(from,6);
 const r=apply(t,evaluateProgram(t.p,{...review(t.p,taper,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL'],from,to}}),actualLedger:t.ledger},opts));
 info.K2c={status:r.status,action:r.action,notes:notesOf(r).map(d=>d.detail.slice(0,240))};
 for(let k=taper;k<=post;k++){
  const performed=performedSet(t),sk=P.skeletonOf(t.p,auth);
  for(const s of eventSessions(t.p,k)){const have=new Set([...(sk.at(k)??sk).equipmentForDate(s.date),'BODYWEIGHT']);
   for(const e of s.prescription?.exercises??[]){if(!R.configurationOf(e.id).equipment.every(q=>have.has(q)))F.K2c.push({week:k,session:s.id,exercise:e.id,note:'does not fit the equipment of the date'});if(!performed.has(e.id)&&e.role!=='PRACTICE')F.K2c.push({week:k,session:s.id,exercise:e.id,note:'never performed'});}}
  if(k<post)weekly(t,k,{o:()=>({kg:()=>16})});
 }
});
// K2d history never reads the guard
guard('K2d','history',()=>{
 const o=PROGRAMS[1][1],t=reviewed({...o,id:'k2d'},0),post=t.p.phases.phases.lastIndexOf('POST_EVENT'),taper=t.p.phases.phases.indexOf('TAPER'),skipDay=4;
 for(let w=0;w<=post&&w<t.p.weeks.length-1;w++){weekly(t,w,{keep:s=>!(s.sport==='STRENGTH'&&s.day===skipDay),o:()=>({kg:()=>16})});
  if(w+1>=taper){const h=A.historicalStateOf(t.p,{asOf:`${t.p.weeks[w+1].startDate}T05:00:00Z`,actualLedger:t.ledger},opts),performed=performedSet(t);
   for(const [id,x] of Object.entries(h.strength.exercises))if(x.lastPerformedAt&&!performed.has(id))F.K2d.push({week:w+1,exercise:id,lastPerformedAt:x.lastPerformedAt,note:'history credits an execution the record does not hold'});}}
});
record('K2a','preserve: executed as prescribed, nothing recorded or disclosed',!F.K2a.length,'event timelines executed as prescribed record no event-week stand-in or omission and emit no note',{label:LABEL,failures:F.K2a,fingerprints:fp});
record('K2b','every event-week row performed, a performed admissible stand-in, or left out; disclosed once',!F.K2b.length,'with one strength day always skipped, the event weeks hold only exercises performed in this program that fit the date; each omission is disclosed once',{failures:F.K2b.slice(0,12),count:F.K2b.length,info:Object.fromEntries(Object.entries(info).filter(([k])=>k.startsWith('K2b')))});
record('K2c','travel window over the taper',!F.K2c.length,'every event-week row fits the equipment of its date and was performed',{failures:F.K2c.slice(0,12),info:info.K2c??null});
record('K2d','history never reads the guard',!F.K2d.length,'HistoricalState credits only executions',{failures:F.K2d.slice(0,6)});
done('k2-event-guard-all-rows');
