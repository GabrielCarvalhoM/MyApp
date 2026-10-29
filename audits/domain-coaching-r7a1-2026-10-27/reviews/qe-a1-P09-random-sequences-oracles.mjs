// R7A1-QE-r1 P09: seeded random search over sequences of 2-4 changes (same day, later days, and across the week boundary with the weekly
// review in between), on five programs, checked by invariant oracles rather than by order equivalence:
//  O1 history: a row that was not ahead at any step keeps its prescription to the end (C1);
//  O2 equipment: no live strength row dated after an equipment statement uses equipment outside the latest statement covering its date (C2, C5);
//  O3 unavailable: no live session (race excepted) on a date the athlete declared unavailable or in conflict that week (C4);
//  O4 systemic: no live quality or race-touch run in the week after a systemic fatigue report of that week (C4);
//  O6 event: at most one live race, on the goal's current event date (C5, C7);
//  O7 wait: after a return that re-plans from next week, no live session (race excepted) is left after it that week, unless a later return
//     of that week governs (C4, C5);
//  O9 status: no UNSUPPORTED or HOLD outcome (a fail-closed refusal is listed separately; it is not a wrong plan).
// Every session the sequence passes is reported as prescribed, except a missed target and sessions in a declared break or on an unavailable
// date. Synthetic data, DEV_TEST_ONLY authority, prints only. SEED and N (sequences) may be set in the environment.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,runtime,make,line,at,obs,addDays,print} from './qe-a1-lib.mjs';
import {createHash} from 'node:crypto';
const {catalogueEntry}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-catalogue.mjs')).href);
const RT=await runtime(process.env.RT==='F2'?'F2':'A1'),H=make(RT),{R,opts}=RT;
let seed=Number(process.env.SEED??7);const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;},pick=a=>a[Math.floor(rnd()*a.length)];
const h=x=>createHash('sha256').update(JSON.stringify(x??null)).digest('hex').slice(0,16);
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const PROGRAMS={
 plain:{ia:{schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},w:3},
 s3:{ia:{schedule:{strengthDays:[0,2,5],runDays:[1,3,6],longRunDay:6}},w:3},
 race:{ia:{athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},w:6},
 raceLate:{ia:{athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},w:10},
 pmRuns:{ia:{schedule:{runDays:[0,2,4,6],strengthDays:[1,3],runTurn:'PM',strengthTurn:'AM',longRunDay:6},athlete:{recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80,strengthDaysPerWeek:2}}},w:4}
};
const bases={};for(const [k,{ia,w}] of Object.entries(PROGRAMS))bases[k]=H.start({...ia,id:'qa1-p09-'+k},w);
const HOURS=['05:00','07:00','11:30','12:30','18:00','20:00','23:30'],hourOf=hm=>Number(hm.slice(0,2))+Number(hm.slice(3))/60;
const isRace=k=>k.startsWith('race');
function makeChange(t,w,day,hm,ctx){
 const p=t.p,wk=p.weeks[w],d0=wk.startDate,today=addDays(d0,day),kinds=['SYSTEMIC_FATIGUE','LOCAL_FATIGUE','UNAVAILABLE_DAY','EQUIPMENT_PERM','EQUIPMENT_WINDOW','EQUIPMENT_BACK','SCHEDULE_NEXT','SCHEDULE_MINUTES','GOAL_NEXT','RETURN_MODERATE','RETURN_SHORT','MISSED_SESSION',...(isRace(ctx.name)?['EVENT_LATER','EVENT_EARLIER','EVENT_CONFLICT']:[])];
 const k=pick(kinds),future=wk.sessions.filter(s=>s.prescription&&s.date>today),past=wk.sessions.filter(s=>s.prescription&&s.date<today&&s.key&&s.status!=='SKIPPED'&&!ctx.reported.has(s.id));
 switch(k){
  case 'SYSTEMIC_FATIGUE':return {kind:k};case 'LOCAL_FATIGUE':return {kind:k,signals:{region:'LOWER'}};
  case 'UNAVAILABLE_DAY':return future.length?{kind:k,changes:{unavailableDates:[pick(future).date]}}:{kind:'SYSTEMIC_FATIGUE'};
  case 'EVENT_CONFLICT':return future.length?{kind:'EVENT_WEEK_CONFLICT',changes:{unavailableDates:[pick(future).date]}}:{kind:'SYSTEMIC_FATIGUE'};
  case 'EQUIPMENT_PERM':return {kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}};
  case 'EQUIPMENT_BACK':return {kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}};
  case 'EQUIPMENT_WINDOW':{const f=addDays(today,pick([0,1,2])),to=addDays(f,pick([1,3,6,9]));return {kind:'EQUIPMENT_CHANGE',changes:{equipment:pick([['DUMBBELLS','BENCH'],['BODYWEIGHT'],['DUMBBELLS']]),from:f,to}};}
  case 'SCHEDULE_NEXT':return {kind:'SCHEDULE_CHANGE',changes:pick([{runDays:[0,3,6],longRunDay:6},{strengthDays:[1,4]},{runTurn:'PM'}])};
  case 'SCHEDULE_MINUTES':return {kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:pick([30,45,75])}};
  case 'GOAL_NEXT':return {kind:'GOAL_CHANGE',changes:{goals:{strength:pick(['HYPERTROPHY','GENERAL','STRENGTH'])}}};
  case 'RETURN_MODERATE':{const end=addDays(today,-1),days=pick([12,16,21]);return {kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:addDays(end,-(days-1)),endDate:end,reasonCategory:'TRAVEL',reason:'Work travel'}};}
  case 'RETURN_SHORT':{const end=addDays(today,-1),days=pick([3,5,8]);return {kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:addDays(end,-(days-1)),endDate:end,reasonCategory:'TRAVEL',reason:'Work travel'}};}
  case 'MISSED_SESSION':return past.length?{kind:k,targetSessionId:pick(past).id}:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}};
  case 'EVENT_LATER':return {kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.goal.run.event?.date??addDays(d0,30),pick([7,14]))}};
  case 'EVENT_EARLIER':return {kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(today,pick([7,9,12]))}};
 }
}
const out={probe:'R7A1-QE-P09',runtime:RT.tag,seed:Number(process.env.SEED??7),sequences:0,steps:0,refusals:[],violations:{O1:[],O2:[],O3:[],O4:[],O6:[],O7:[],O9:[]},errors:[]};
const NSEQ=Number(process.env.N??400);
for(let n=0;n<NSEQ;n++){
 const name=pick(Object.keys(PROGRAMS)),w0=PROGRAMS[name].w,t=H.copy(bases[name]),ctx={name,reported:new Set(),missed:new Set(),breaks:[]};
 const len=2+Math.floor(rnd()*3);let w=w0,day=Math.floor(rnd()*4),hi=Math.floor(rnd()*HOURS.length);const steps=[];
 try{
  for(let s=0;s<len;s++){
   if(s>0){const adv=pick([0,0,1,2,3,7]);if(adv===0)hi=Math.min(HOURS.length-1,hi+1);else{day+=adv;hi=Math.floor(rnd()*HOURS.length);}}
   if(day>6){ // weekly review of week w, then continue in w+1
    const rep=t.p.weeks[w].sessions.filter(x=>x.prescription&&x.status!=='SKIPPED'&&!ctx.reported.has(x.id)&&!ctx.missed.has(x.id)&&!ctx.breaks.some(b=>x.date>=b[0]&&x.date<=b[1])&&!(ctx.unavailable??[]).includes(x.date));
    rep.forEach(x=>ctx.reported.add(x.id));H.ev(t,at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:rep.map(x=>obs(t.p,x))}));steps.push({w,day:6,hm:'21:00',kind:'WEEKLY_REVIEW',status:t.last.status+'/'+t.last.action});
    if(w+1>=t.p.weeks.length-1)break;w++;day=day-7;if(day>6)day=6;
   }
   const hm=HOURS[hi],today=addDays(t.p.weeks[w].startDate,day);
   const x=makeChange(t,w,day,hm,ctx);if(x.kind==='MISSED_SESSION')ctx.missed.add(x.targetSessionId);
   if(x.kind==='RETURN_AFTER_PAUSE')ctx.breaks.push([x.interruption.startDate,x.interruption.endDate]);
   if(['UNAVAILABLE_DAY','EVENT_WEEK_CONFLICT'].includes(x.kind))ctx.unavailable=[...(ctx.unavailable??[]),...x.changes.unavailableDates];
   const rep=t.p.weeks[w].sessions.filter(y=>y.prescription&&y.status!=='SKIPPED'&&(y.date<today||y.date===today&&(y.turn==='AM'?hourOf(hm)>=12:false))&&!ctx.reported.has(y.id)&&!ctx.missed.has(y.id)&&!ctx.breaks.some(b=>y.date>=b[0]&&y.date<=b[1]));
   rep.forEach(y=>ctx.reported.add(y.id));
   const before=t.p,review=at(t.p,w,day,hm,{...x,observations:rep.map(y=>obs(t.p,y))});H.ev(t,review);out.steps++;
   const r=t.last,localNoon=hourOf(hm)>=12,reportedNow=new Set([...ctx.reported]);
   const history=before.weeks.flatMap(wk=>wk.sessions).filter(y=>y.date<today||y.date===today&&(reportedNow.has(y.id)||y.turn==='AM'&&localNoon)).map(y=>[y.id,h(y.prescription)]);
   steps.push({w,day,hm,today,reportedAt:new Set(reportedNow),kind:x.kind,x,status:r.status+'/'+r.action,fromWeek:r.proposal?.decisions.at(-1)?.fromWeek??null,history,errors:r.errors??null});
   if(['UNSUPPORTED','HOLD'].includes(r.status))out.refusals.push({program:name,seq:steps.map(s=>`${s.kind}@w${s.w}d${s.day} ${s.hm}`).join(' > '),status:r.status,reason:r.reason,errors:(r.errors??[]).slice(0,4)});
  }
 }catch(e){out.errors.push({program:name,seq:steps.map(s=>s.kind).join(' > '),error:String(e?.stack??e).slice(0,300)});continue;}
 out.sequences++;
 const P=t.p,rows=new Map(P.weeks.flatMap(wk=>wk.sessions).map(s=>[s.id,s])),live=s=>s.prescription&&s.status!=='SKIPPED',seq=steps.map(s=>`${s.kind}${s.x?.changes?' '+JSON.stringify(s.x.changes):''}${s.x?.interruption?' '+s.x.interruption.days+'d':''}${s.x?.targetSessionId?' '+s.x.targetSessionId:''}@w${s.w}d${s.day} ${s.hm} ${s.status}`).join(' > ');
 const push=(o,detail)=>{if(out.violations[o].length<25)out.violations[o].push({program:name,seq,detail});else out.violations[o].count=(out.violations[o].count??25)+1;};
 // O1
 for(const s of steps.filter(s=>s.history))for(const [id,ph] of s.history){const now=rows.get(id);if(!now||h(now.prescription)!==ph){push('O1',`${id} (history at ${s.kind}@d${s.day} ${s.hm}) ${now?'rewritten':'removed'}`);break;}}
 // O2: statements in order; for each live strength row dated after a statement's day, the latest statement covering its date decides.
 // A statement governs the rows still ahead at its own clock (C1): dated after its day, or that day, unreported and not an AM session past noon.
 const stmts=steps.filter(s=>s.kind==='EQUIPMENT_CHANGE'&&/MODIFY|KEEP/.test(s.status)).map(s=>({day:s.today,noon:hourOf(s.hm)>=12,reported:s.reportedAt,from:s.x.changes.from??s.today,to:s.x.changes.to??null,eq:s.x.changes.equipment})),aheadAtStmt=(x,y)=>y.date>x.day||y.date===x.day&&!x.reported.has(y.id)&&!(y.turn==='AM'&&x.noon);
 if(stmts.length)for(const s of [...rows.values()].filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>=stmts[0].day)){const cov=stmts.filter(x=>aheadAtStmt(x,s)&&s.date>=x.from&&(!x.to||s.date<=x.to)).at(-1);if(!cov)continue;const bad=s.prescription.exercises.filter(e=>!(catalogueEntry(e.id)?.equipment??[]).every(q=>q==='BODYWEIGHT'||cov.eq.includes(q)));if(bad.length)push('O2',`${s.date} ${s.id}${s.moved?' <-'+s.moved.from:''}: ${bad.map(e=>e.id).join(',')} outside ${cov.eq.join('+')}`);}
 // O3
 for(const s of steps.filter(s=>['UNAVAILABLE_DAY','EVENT_WEEK_CONFLICT'].includes(s.kind)&&/MODIFY|KEEP/.test(s.status)))for(const d of s.x.changes.unavailableDates)for(const y of [...rows.values()].filter(y=>y.date===d&&live(y)&&y.role!=='RACE'))push('O3',`${y.id} live on ${d} after ${s.kind}@d${s.day} ${s.hm}`);
 // O4
 for(const s of steps.filter(s=>s.kind==='SYSTEMIC_FATIGUE'&&/MODIFY|KEEP/.test(s.status)))for(const y of P.weeks[s.w].sessions.filter(y=>live(y)&&y.sport==='RUN'&&['QUALITY','RACE_TOUCH'].includes(y.role)&&y.date>s.today))push('O4',`${y.id} ${y.role} after systemic fatigue @d${s.day} ${s.hm}`);
 // O6
 const races=[...rows.values()].filter(y=>y.role==='RACE'&&live(y));if(races.length>1||P.goal.run.event&&races.length&&races[0].date!==P.goal.run.event.date)push('O6',races.map(y=>y.id+' '+y.date).join(' + ')+' event '+P.goal.run.event?.date);
 // O7
 const rets=steps.filter(s=>s.kind==='RETURN_AFTER_PAUSE'&&/MODIFY/.test(s.status));
 for(const s of rets){if(rets.some(o=>o!==s&&o.w===s.w&&steps.indexOf(o)>steps.indexOf(s)))continue;if(s.fromWeek!==s.w+1)continue;for(const y of P.weeks[s.w].sessions.filter(y=>live(y)&&y.role!=='RACE'&&(y.date>s.today)))push('O7',`${y.id} live after a return that starts next week @d${s.day} ${s.hm}`);}
 for(const s of steps.filter(s=>s.errors?.length))push('O9',`${s.kind}: ${s.errors.slice(0,3).join(',')}`);
}
out.summary=Object.fromEntries(Object.entries(out.violations).map(([k,v])=>[k,v.count??v.length]));out.refusalCount=out.refusals.length;out.refusals=out.refusals.slice(0,15);
print(out);
