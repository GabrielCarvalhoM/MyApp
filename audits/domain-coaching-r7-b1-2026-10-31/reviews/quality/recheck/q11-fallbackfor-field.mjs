// R7B1-QUALITY q11: the template-row field `fallbackFor` ({from, reason}) against the decisions recorded. After a reason-based substitution (week 3,
// both reasons, every exercise in use) and after a later EQUIPMENT_CHANGE that removes the substitute's equipment, every template row (templates and
// noviceTemplates of every context of the proposal) that carries fallbackFor must: name a configuration set aside by a recorded reason-based selection,
// with that selection's last reason; hold a different configuration; never be the configuration it stands in for. Reports counts and violations.
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {skeletonOf} from '../../../../../CoachingCore/src/r6-program.mjs';
import {r6Authority} from '../../../../../CoachingCore/src/r6-authority.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const auth=r6Authority(opts),FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const EQ={DB_BANDS:['DUMBBELLS','BANDS'],DB_BENCH_KB:['DUMBBELLS','BENCH','KETTLEBELL'],FULL,BANDS_AND_BAR:['BANDS','PULL_UP_BAR']};
const ev=(t,w,x)=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
const out={proposals:0,rowsWithFallbackFor:0,violations:[]};
const inspect=(p,tag)=>{out.proposals++;const sel=p.canonical.athlete.strengthSelections??[],sk=skeletonOf(p,auth),seen=new Set();
 for(let k=0;k<p.weeks.length;k++){const s=sk.at(k)??sk;if(seen.has(s))continue;seen.add(s);
  for(const t of [...(s.templates??[]),...(s.noviceTemplates??[])])for(const r of t.rows.filter(r=>r.fallbackFor)){out.rowsWithFallbackFor++;
   const last=sel.filter(x=>x.from===r.fallbackFor.from&&x.setAside!==false&&['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'].includes(x.reason)).at(-1);
   const ok=!!last&&last.reason===r.fallbackFor.reason&&r.entry.id!==r.fallbackFor.from;
   if(!ok&&out.violations.length<10)out.violations.push({tag,template:t.type,slot:r.slot,entry:r.entry.id,fallbackFor:r.fallbackFor,lastSelection:last??null});}}};
for(const [eqName,eq] of Object.entries(EQ))for(const sg of ['GENERAL','RUNNING_SUPPORT']){
 const t0=reviewed({id:'q11',equipment:eq,goals:{run:'PERFORMANCE',strength:sg},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},3);
 const inUse=[...new Set(t0.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const X of inUse)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const t={p:t0.p,ledger:t0.ledger};const s=ev(t,3,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
  if(s.status!=='MODIFY')continue;inspect(s.proposal,`${eqName}/${sg} ${X} ${reason}`);t.p=s.proposal;t.ledger=s.actualLedger??t.ledger;
  const need=configurationOf(s.substitutions[0].selected).equipment.filter(q=>q!=='BODYWEIGHT');
  for(const q of need){const e=ev(t,3,{day:2,kind:'EQUIPMENT_CHANGE',changes:{equipment:eq.filter(x=>x!==q)}});if(e.proposal)inspect(e.proposal,`${eqName}/${sg} ${X} ${reason} -${q}`);}
 }
}
fs.writeFileSync(new URL('./out/q11-fallbackfor-field.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
