// Q-R7B probe 04: configurations reached only through later reviews: skill-ladder steps accepted at block-boundary weekly reviews
// (B0-C07, choices LADDER_STEP from the offers the review returned), and EXERCISE_SUBSTITUTION reviews (SKILL_MISMATCH and a confirmed
// nonclinical preference) for every exercise in use. Sessions are executed as prescribed with compatible responses. Output: out/p04-review-driven.json
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {newAcc,collect,CATALOG} from './lib.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const EQ={FULL,DB_BENCH:['DUMBBELLS','BENCH'],DB_BENCH_BANDS_BAR:['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],BODYWEIGHT:[],KETTLEBELL:['KETTLEBELL'],BANDS:['BANDS'],DB:['DUMBBELLS'],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES']};
const acc=newAcc(),ladder=new Map(),subst=new Map(),offersSeen=new Set(),asks=[],t0=Date.now();
const rec=(m,k,v)=>{if(!m.has(k))m.set(k,v);};
const step=(t,w,choices)=>{const observations=t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s));return evaluateProgram(t.p,{...review(t.p,w,{observations,...(choices?{choices}:{})}),actualLedger:t.ledger},opts);};
for(const [eqName,eq] of Object.entries(EQ))for(const sg of ['GENERAL','STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const nd of [2,4])for(const exp of ['NOVICE','INTERMEDIATE']){
 const label=`eq=${eqName} str=${sg} days=${nd} exp=${exp}`;
 let t;try{t={p:program({id:'p04',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:sg},strengthExperience:exp,equipment:eq,schedule:{strengthDays:nd===2?[0,4]:[0,2,4,5]}}),ledger:[]};}catch(e){asks.push({label,error:e.message.slice(0,200)});continue;}
 // Substitutions on the week-2 program, before any ladder step.
 const subAt=JSON.parse(JSON.stringify(t));
 for(let w=0;w<16;w++){
  let r=step(t,w);
  if(r.offers?.length){
   for(const o of r.offers)offersSeen.add(o.from+'->'+o.to);
   const seen=new Set(),choices=r.offers.filter(o=>!seen.has(o.from)&&seen.add(o.from)).map(o=>({type:'LADDER_STEP',from:o.from,to:o.to}));
   const r2=step(t,w,choices);
   if(r2.status==='ASK'){asks.push({label,week:w,reason:r2.reason?.slice(0,200)});}
   else{r=r2;for(const c of choices)rec(ladder,c.to,label+' @w'+w+' from '+c.from);}
  }
  if(['UNSUPPORTED','HOLD'].includes(r.status)){asks.push({label,week:w,status:r.status,reason:r.reason?.slice(0,160)});break;}
  t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;
  collect(acc,t.p,label+' @w'+w);
  if(w===1){
   // EXERCISE_SUBSTITUTION in week 2 for every strength exercise still ahead.
   const inUse=[...new Set(t.p.weeks[2].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
   for(const id of inUse)for(const sub of [{exerciseId:id,reason:'SKILL_MISMATCH'},{exerciseId:id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}]){
    const s=evaluateProgram(t.p,{...review(t.p,2,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
    if(s.proposal){collect(acc,s.proposal,label+' subst '+sub.reason+' '+id);for(const x of s.substitutions??[])rec(subst,x.selected,label+' '+sub.reason+' '+id);}
   }
  }
 }
}
const all=CATALOG.strength.configurations.map(c=>c.id);
const out={ms:Date.now()-t0,configsSeen:acc.configs.size,configsNotSeen:all.filter(id=>!acc.configs.has(id)),reachedByLadder:Object.fromEntries(ladder),reachedBySubstitution:Object.fromEntries(subst),offersSeen:[...offersSeen].sort(),ladderEdges:CATALOG.strength.skillLadders.progressionOf.flatMap(c=>c.slice(1).map((y,i)=>c[i]+'->'+y)),asks:asks.slice(0,40),askCount:asks.length};
out.ladderEdgesNeverOffered=out.ladderEdges.filter(e=>!offersSeen.has(e));
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./out/p04-review-driven.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({ms:out.ms,configsSeen:out.configsSeen,configsNotSeen:out.configsNotSeen,ladder:Object.keys(out.reachedByLadder),substitution:Object.keys(out.reachedBySubstitution),ladderEdgesNeverOffered:out.ladderEdgesNeverOffered,askCount:out.askCount,asks:out.asks.slice(0,8)},null,1));
