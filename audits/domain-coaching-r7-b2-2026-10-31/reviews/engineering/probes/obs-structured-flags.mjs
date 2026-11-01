// QE-R7B2 judge probe (adjacent, information): a substitution report that carries illness or functional limitation as structured flags rather
// than pain/injury or free text (B0-C06 condition 8 names all four). Both runtimes, a plain program in week 3 (no return, no late evidence).
import {NOW,PRED,snap,diff,write,at} from './dual.mjs';
function scenario(rt){const {reviewed,live}=rt.H;const t=reviewed({id:'qe-flags',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const X=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 return [['illness:true',{illness:true}],['functionalLimitation:true',{functionalLimitation:true}],['clinicalConcern:true',{clinicalConcern:true}],['persistentPain:true',{persistentPain:true}],['text: I have the flu',{text:'I have the flu'}],['pain:true (control)',{pain:true}]]
  .map(([n,x])=>{const r=at(rt,t,3,{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...x}},{day:1});return {name:n,...snap(rt,r),selected:r.substitutions?.[0]?.selected??null};})
  .concat([['alias SUBSTITUTION_NEED + substitution pain',{kind:'SUBSTITUTION_NEED',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}}],['alias SUBSTITUTION_NEED + pain + equipment change',{kind:'SUBSTITUTION_NEED',substitution:{exerciseId:X,pain:true},changes:{equipment:['BANDS']}}]].map(([n,x])=>{const r=at(rt,t,3,x,{day:1});return {name:n,...snap(rt,r),selected:r.substitutions?.[0]?.selected??null};}));}
const a=scenario(PRED),b=scenario(NOW);
const rows=b.map((x,i)=>({name:x.name,same:!diff(a[i],x).length,status:x.status,proposal:!!x.proposal,selected:x.selected,reason:String(x.reason).slice(0,120)}));
write('obs-structured-flags',{rows});console.log(JSON.stringify(rows,null,1));
