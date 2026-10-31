// R7B1-QUALITY recheck q14 (R7B1-FREEZE-2).
//  E: QR7B1-02 "whatever placed it": a permanent or dated EQUIPMENT_CHANGE sent in the TAPER week, RACE_WEEK or POST_EVENT of event programs (10K/16w,
//     10K/12w; several equipment profiles; FIXED and EVERY_2_WEEKS), removing each item in use one at a time. For each proposal: no configuration
//     new to the event weeks of the plan and never performed in this program; every newly kept-out or stood-in slot disclosed (own or informational
//     NO_NEW_EXERCISE_IN_EVENT_WEEKS slots); the weekly reviews through POST_EVENT keep that.
//  K: QE-R7B1-01 regression: an EXERCISE_SUBSTITUTION with pain, or an illness interruption, sent with a block choice (ladder step, declined offer,
//     unrecognised choice) routes to CLINICAL_HUMAN_REQUIRED with no proposal.
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {skeletonOf,dayPhaseOf} from '../../../../../CoachingCore/src/r6-program.mjs';
import {r6Authority} from '../../../../../CoachingCore/src/r6-authority.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const auth=r6Authority(opts),EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const out={E:{changes:0,applied:0,checks:0,failures:{},examples:{}},K:{cases:0,failures:[]}};
const check=(c,ok,d)=>{out.E.checks++;if(!ok){out.E.failures[c]=(out.E.failures[c]??0)+1;(out.E.examples[c]??=[]).length<6&&out.E.examples[c].push(d);}};
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const performedIds=t=>new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??[]).map(e=>e.id)));
const evRows=(p,from,asOf)=>{const sk=skeletonOf(p,auth);return p.weeks.slice(from).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=asOf&&EVENT.includes(dayPhaseOf(sk.at(k.index)??sk,k.index,s.day))).map(s=>({k:k.index,s})));};
const sig=g=>g.slot+':'+g.selected+':'+(g.inEventWeeks??'');
const EQ={DB_BENCH_KB:['DUMBBELLS','BENCH','KETTLEBELL'],FULL,BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES']};
for(const [evName,event,weeks] of [['10K16',{kind:'10K',date:'2027-01-24'},16],['10K12',{kind:'10K',date:'2027-01-17'},12]])for(const [eqName,eq] of Object.entries(EQ))for(const rotation of ['FIXED','EVERY_2_WEEKS']){
 const t=reviewed({id:'q14',goals:{run:'RACE',strength:'GENERAL'},event,weeks,equipment:eq,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,2,4]},rotation},0);
 const ph=t.p.phases.phases,taper=ph.indexOf('TAPER'),post=ph.indexOf('POST_EVENT');
 for(let w=0;w<=post;w++){
  if(EVENT.includes(ph[w])){
   const performed=performedIds(t),asOf=t.p.weeks[w].startDate,ids0=new Set(evRows(t.p,w,asOf).flatMap(({s})=>s.prescription.exercises.map(e=>e.id)));
   const items=[...new Set(t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.flatMap(e=>configurationOf(e.id)?.equipment??[])))].filter(q=>q!=='BODYWEIGHT');
   for(const q of items)for(const dated of [false,true]){
    const changes={equipment:eq.filter(x=>x!==q),...(dated?{from:asOf,to:addDays(asOf,10)}:{})};
    const label=`${evName} eq=${eqName} rot=${rotation} w${w} ${ph[w]} -${q}${dated?' window':''}`;
    const r=evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes}),actualLedger:t.ledger},opts);out.E.changes++;
    if(!r.proposal)continue;out.E.applied++;
    const info=(r.disclosures??[]).filter(d=>d.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');
    for(const {k,s} of evRows(r.proposal,w,asOf)){
     for(const e of s.prescription.exercises)check('E.newInEventWeeks',ids0.has(e.id)||performed.has(e.id),{label,week:k,session:s.id,id:e.id});
     const s0=t.p.weeks[k].sessions.find(y=>y.id===s.id),was=new Set((s0?.eventStandIns??[]).map(sig));
     for(const g of (s.eventStandIns??[]).filter(g=>!was.has(sig(g))))check('E.disclosed',info.some(d=>d.slots?.some(v=>v.sessionId===s.id&&v.selected===g.selected)),{label,session:s.id,entry:g});
    }
    // also sessions that became rest by design from stand-ins
    for(const k of r.proposal.weeks.slice(w))for(const s of k.sessions.filter(s=>s.role==='REST_BY_DESIGN'&&s.eventStandIns?.length&&s.date>=asOf)){const s0=t.p.weeks[k.index].sessions.find(y=>y.id===s.id);if(s0&&live(s0))check('E.restDisclosed',info.some(d=>d.sessions?.includes(s.id)),{label,session:s.id});}
    // follow the first applied permanent change of each week through the post-event week
    if(!dated&&q===items[0]){const c={p:r.proposal,ledger:r.actualLedger??t.ledger};const perf=new Set(performed);
     for(let k=w;k<=Math.min(post,c.p.weeks.length-1);k++){const rows=evRows(c.p,k,c.p.weeks[k].startDate).filter(z=>z.k===k);const pk=performedIds(c);
      for(const {s} of rows)for(const e of s.prescription.exercises)check('E.followThrough',ids0.has(e.id)||pk.has(e.id)||perf.has(e.id),{label,week:k,session:s.id,id:e.id});
      try{weekly(c,k);}catch(e){check('E.review',false,{label,week:k,error:String(e.message).slice(0,160)});break;}}}
   }
  }
  weekly(t,w);
 }
}
// K
{const t=reviewed({id:'q14k',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},5);
 const ex=t.p.weeks[5].sessions.find(s=>live(s)&&s.sport==='STRENGTH').prescription.exercises[0].id;
 for(const choices of [[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],[{type:'NOT_A_CHOICE'}]])
  for(const [name,x] of [['pain',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:ex,reason:'SKILL_MISMATCH',pain:true}}],['illness',{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}}]]){
   const r=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'06:00:00',...x,choices}),actualLedger:t.ledger},opts);out.K.cases++;
   const control=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
   if(!(r.status===control.status&&(control.status!=='CLINICAL_HUMAN_REQUIRED'||!r.proposal)))out.K.failures.push({name,choices,status:r.status,control:control.status,proposal:!!r.proposal});
   (out.K.seen??=[]).push(`${name} ${JSON.stringify(choices[0])} -> ${r.status} (alone: ${control.status})`);
  }}
fs.writeFileSync(new URL('./out/q14-equipment-event-and-clinical.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({E:{changes:out.E.changes,applied:out.E.applied,checks:out.E.checks,failures:out.E.failures,examples:out.E.examples},K:out.K},null,1));
