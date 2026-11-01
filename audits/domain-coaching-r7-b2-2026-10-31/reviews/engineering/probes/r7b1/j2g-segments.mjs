// R7B1-ENG-r1 judge probe J2g (R2-01 with context segments): a two-day strength-NONE athlete states four days from week 3 (in week 1), then a
// permanent kettlebell-only change in week 2 (it reaches both the earlier two-day segment and the four-day context). Every week ahead, after the
// change and after each weekly review, uses only the kettlebell and bodyweight, and weeks 3-4 (before the first boundary) are capped from the
// stored capped templates of the four-day context. Read-only.
import {record,guard,done,program,weekly,review,evaluateProgram,opts,live,apply,R,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const t={p:program({id:'j2g',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],weeks:12,schedule:{strengthDays:[0,4]}}),ledger:[]};
const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
const bad=(p,from)=>p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>!R.configurationOf(e.id).equipment.every(q=>['KETTLEBELL','BODYWEIGHT'].includes(q))).map(e=>`w${w.index}:${e.id}`)));
const F=[],log=[];
guard('J2g','segments',()=>{
 weekly(t,0);
 const a=apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5],from:t.p.weeks[3].startDate}}),actualLedger:t.ledger},opts));
 log.push({step:'schedule from week 3',status:a.status,stored:!!t.p.noviceTemplates,segments:(t.p.contextBefore??[]).map(e=>({until:e.untilWeek,novice:!!e.noviceTemplates,days:e.canonical.schedule.strengthDays.length}))});
 weekly(t,1);
 const b=apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts));
 log.push({step:'kettlebell only in week 2',status:b.status,action:b.action,stored:!!t.p.noviceTemplates,segments:(t.p.contextBefore??[]).map(e=>({until:e.untilWeek,novice:!!e.noviceTemplates,eq:e.canonical.athlete.equipment})),bad:bad(t.p,2).slice(0,6),types:[2,3,4,5].map(w=>types(t.p,w))});
 if(bad(t.p,2).length)F.push({after:'equipment change',bad:bad(t.p,2).slice(0,6)});
 for(let w=2;w<6;w++){const r=weekly(t,w,{o:()=>({kg:()=>12})});const k=w+1;log.push({reviewed:w,action:r.action,next:types(t.p,k),density:t.p.stateTrace[k]?.strength?.density??null});
  if(bad(t.p,k).length)F.push({after:'weekly '+w,bad:bad(t.p,k).slice(0,6)});
  const capped=t.p.stateTrace[k]?.strength?.density?.capped===true,sk=P.skeletonOf(t.p,auth),days=(sk.at(k)??sk).c.schedule.strengthDays.length;
  if(days>2&&/CORE/.test(types(t.p,k))!==capped)F.push({week:k,capped,types:types(t.p,k)});}
});
record('J2g','R2-01 with context segments',!F.length,'a change reaching an earlier segment and the later context keeps both consistent through the next reviews',{label:LABEL,failures:F,log});
done('j2g-segments');
