// R7B1-QUALITY q05: how often is the NO_LOWER_SKILL_ALTERNATIVE question a dead end? Grid: equipment profile x strength goal x days. Week 3: a
// SKILL_MISMATCH substitution of every exercise in use; week 3 reviewed; week 4: a permanent EQUIPMENT_CHANGE removing, one at a time, each item of
// equipment the substitute needs. For each NO_LOWER_SKILL_ALTERNATIVE question:
//  O2 "Name a <pattern> exercise": effective when an EXERCISE_SUBSTITUTION of the substitute naming some same-pattern configuration (either reason) is
//     applied and the same equipment change then succeeds (MODIFY/KEEP with a proposal);
//  O2same: the same EQUIPMENT_CHANGE resubmitted with the question's missing input substitution.to (any same-pattern configuration) succeeds;
//  O1 "Keep the equipment": always possible by not making the change; recorded as the only way out when O2 and O2same fail (dead end for an athlete
//     who has really lost that equipment).
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const CAT=JSON.parse(fs.readFileSync(new URL('../../../../../CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url),'utf8')).strength.configurations;
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const EQ={DB_BANDS:['DUMBBELLS','BANDS'],DB_BENCH_KB:['DUMBBELLS','BENCH','KETTLEBELL'],DB_BENCH_BANDS:['DUMBBELLS','BENCH','BANDS'],DB_KB_BANDS:['DUMBBELLS','KETTLEBELL','BANDS'],BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],KB_BANDS:['KETTLEBELL','BANDS'],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES'],FULL};
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const ev=(t,w,x)=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
const out={programs:0,mismatches:0,changes:0,questions:0,deadEnds:0,o2Effective:0,o2sameEffective:0,byStatus:{},cases:[]};
for(const [eqName,eq] of Object.entries(EQ))for(const sg of ['GENERAL','STRENGTH','RUNNING_SUPPORT'])for(const days of [[0,4],[0,2,4]])for(const exp of ['NOVICE','INTERMEDIATE']){
 const label=`eq=${eqName} str=${sg} days=${days.length} exp=${exp}`;let t0;
 try{t0=reviewed({id:'q05',equipment:eq,goals:{run:'PERFORMANCE',strength:sg},strengthExperience:exp,rotation:'FIXED',weeks:12,schedule:{strengthDays:days}},3);}catch{continue;}
 out.programs++;
 const inUse=[...new Set(t0.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const X of inUse){
  const t={p:t0.p,ledger:t0.ledger};const s=ev(t,3,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}});
  if(s.status!=='MODIFY')continue;out.mismatches++;apply(t,s);try{weekly(t,3);}catch{continue;}
  const sub=s.substitutions[0].selected,need=configurationOf(sub).equipment.filter(q=>q!=='BODYWEIGHT');
  for(const q of need){
   const left=eq.filter(x=>x!==q),change={kind:'EQUIPMENT_CHANGE',changes:{equipment:left}};
   const r=ev(t,4,change);out.changes++;out.byStatus[r.status]=(out.byStatus[r.status]??0)+1;
   const d=r.disclosures?.find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');if(!d)continue;out.questions++;
   const pattern=configurationOf(d.substitute).pattern,same=CAT.filter(c=>configurationOf(c.id)?.pattern===pattern);
   const o2=[],o2same=[];
   for(const c of same){
    const r2=ev(t,4,{...change,substitution:{exerciseId:d.substitute,to:c.id,reason:'SKILL_MISMATCH'}});if(r2.status==='MODIFY'||r2.status==='KEEP'&&r2.proposal)o2same.push(c.id);
    for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
     const c2={p:t.p,ledger:t.ledger};const n=ev(c2,4,{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:d.substitute,reason,to:c.id,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
     if(n.status!=='MODIFY')continue;apply(c2,n);const again=ev(c2,4,{day:1,...change});
     if(again.status==='MODIFY'||again.status==='KEEP'&&again.proposal){o2.push(c.id+'/'+reason.slice(0,5));break;}
    }
   }
   const remaining=same.filter(c=>{const k=configurationOf(c.id);return k&&k.id!==d.setAside&&k.equipment.every(x=>x==='BODYWEIGHT'||left.includes(x));}).map(c=>c.id);
   if(o2.length)out.o2Effective++;if(o2same.length)out.o2sameEffective++;const dead=!o2.length&&!o2same.length;if(dead)out.deadEnds++;
   out.cases.push({label,X,substitute:sub,removed:q,setAside:d.setAside,pattern,question:r.reason,missingInputs:r.missingInputs,options:d.options,o2NameThenChange:o2,o2SameReviewWithTo:o2same,deadEnd:dead,sameePatternWithEquipmentLeft:remaining});
  }
 }
}
fs.writeFileSync(new URL('./out/q05-no-lower-skill-grid.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({programs:out.programs,mismatches:out.mismatches,changes:out.changes,byStatus:out.byStatus,questions:out.questions,deadEnds:out.deadEnds,o2Effective:out.o2Effective,o2sameEffective:out.o2sameEffective,sample:out.cases.slice(0,4).map(c=>({label:c.label,X:c.X,substitute:c.substitute,removed:c.removed,deadEnd:c.deadEnd,o2:c.o2NameThenChange,remaining:c.sameePatternWithEquipmentLeft}))},null,1));
