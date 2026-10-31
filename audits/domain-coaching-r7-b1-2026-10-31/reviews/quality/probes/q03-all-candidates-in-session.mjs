// R7B1-QUALITY q03: the new end-of-candidates question of exerciseSubstitution (R7-B.1, QE-R7B-R2-04 path): "Every admissible alternative ... is already
// in a session with X ... options: add equipment, or keep X" with NO_ADMISSIBLE_ALTERNATIVE ['Add equipment','Keep X']. Sweep the p04 grid (week-2
// substitutions after two weekly reviews) and, for each such question: (a) does "Add equipment" have an effect (the same substitution after an
// EQUIPMENT_CHANGE to the full equipment list), (b) does naming another same-pattern exercise work (substitution.to, the missing input), (c) what did the
// athlete have. Also counts every status of the grid.
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const EQ={FULL,DB_BENCH:['DUMBBELLS','BENCH'],DB_BENCH_BANDS_BAR:['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],BODYWEIGHT:[],KETTLEBELL:['KETTLEBELL'],BANDS:['BANDS'],DB:['DUMBBELLS'],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES']};
const CAT=JSON.parse(fs.readFileSync(new URL('../../../../../CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url),'utf8')).strength.configurations;
const step=(t,w)=>{const observations=t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s));const r=evaluateProgram(t.p,{...review(t.p,w,{observations}),actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const out={decisions:0,status:{},allInSession:[],summary:{questions:0,addEquipmentWithoutEffect:0,addEquipmentImpossible:0,namedWorks:0,onlyKeepEffective:0}};
for(const [eqName,eq] of Object.entries(EQ))for(const sg of ['GENERAL','STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const nd of [2,4])for(const exp of ['NOVICE','INTERMEDIATE']){
 const label=`eq=${eqName} str=${sg} days=${nd} exp=${exp}`;
 let t;try{t={p:program({id:'p04',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:sg},strengthExperience:exp,equipment:eq,schedule:{strengthDays:nd===2?[0,4]:[0,2,4,5]}}),ledger:[]};}catch{continue;}
 step(t,0);step(t,1);
 const inUse=[...new Set(t.p.weeks[2].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const X of inUse)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const sub={exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})};
  const r=evaluateProgram(t.p,{...review(t.p,2,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);out.decisions++;out.status[r.status]=(out.status[r.status]??0)+1;
  if(!(r.status==='ASK'&&/^Every admissible alternative/.test(r.reason??'')))continue;
  out.summary.questions++;
  // (a) "Add equipment": everything the catalog knows, from this week (a permanent EQUIPMENT_CHANGE), then the same substitution.
  let addEffect=null;const missingEq=FULL.filter(q=>!eq.includes(q));
  if(!missingEq.length){addEffect='IMPOSSIBLE: the athlete already has every equipment';out.summary.addEquipmentImpossible++;}
  else{const c={p:t.p,ledger:t.ledger};const e=evaluateProgram(c.p,{...review(c.p,2,{day:1,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:FULL}}),actualLedger:c.ledger},opts);
   if(e.proposal){const r2=evaluateProgram(e.proposal,{...review(e.proposal,2,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:e.actualLedger??c.ledger},opts);addEffect=r2.status==='MODIFY'?'EFFECT: '+r2.substitutions[0].selected:'NO EFFECT: '+r2.status+' '+(r2.reason??'').slice(0,100);}
   else addEffect='EQUIPMENT_CHANGE '+e.status+' '+(e.reason??'').slice(0,100);}
  if(/^NO EFFECT/.test(addEffect))out.summary.addEquipmentWithoutEffect++;
  // (b) naming each same-pattern configuration
  const Xc=configurationOf(X),named=[];
  for(const c of CAT.filter(c=>c.pattern===Xc.pattern&&c.id!==X)){const r3=evaluateProgram(t.p,{...review(t.p,2,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{...sub,to:c.id}}),actualLedger:t.ledger},opts);if(r3.status==='MODIFY')named.push(c.id);}
  if(named.length)out.summary.namedWorks++;
  if(!named.length&&!/^EFFECT/.test(addEffect))out.summary.onlyKeepEffective++;
  out.allInSession.push({label,X,reason,question:r.reason,options:r.disclosures?.[0]?.options,addEquipment:addEffect,namedThatWork:named});
 }
}
fs.writeFileSync(new URL('./out/q03-all-candidates-in-session.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({decisions:out.decisions,status:out.status,summary:out.summary,first:out.allInSession.slice(0,6)},null,1));
