// Q-R7B probe 05: does a stated strength emphasis or movement priority change which configuration fills a slot (catalog
// classification.signals.emphasis: "Slot ordering and accessory choice inside goal doses"; templateRules.selection: "Emphasis
// preferences reorder and choose among admissible alternatives")? Compares the configuration sets of programs that differ only by the
// emphasis input. Output: out/p05-emphasis.json
import fs from 'node:fs';
import {intake,opts,generateProgram} from './lib.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const ids=p=>p.templates.map(t=>t.templateId+':'+t.rows.map(r=>r.slot+'='+r.entry.id).sort().join(',')).join(' | ');
const order=p=>p.templates.map(t=>t.rows.map(r=>r.entry.id+(r.emphasized?'*':'')).join(','));
const EMPH=[[],['CALF'],['LOWER'],['PULL'],['HINGE'],['TRUNK'],['UPPER'],['HIP_ABDUCTION'],['ELBOW_FLEXION'],['GLUTES'],['SINGLE_LEG']];
const out=[];
for(const sg of ['GENERAL','HYPERTROPHY','RUNNING_SUPPORT','STRENGTH'])for(const nd of [2,4,5])for(const eq of [FULL,['DUMBBELLS','BENCH'],['BANDS']]){
 const base=generateProgram(intake({id:'p05',goals:{run:'PERFORMANCE',strength:sg},equipment:eq,schedule:{strengthDays:{2:[0,4],4:[0,2,4,5],5:[0,1,2,4,5]}[nd]}}),opts).program;
 const b=ids(base);
 for(const e of EMPH.slice(1)){
  for(const field of ['emphasis','movementPriorities']){
   const p=generateProgram(intake({id:'p05',goals:{run:'PERFORMANCE',strength:sg},equipment:eq,schedule:{strengthDays:{2:[0,4],4:[0,2,4,5],5:[0,1,2,4,5]}[nd]},athlete:{strengthPreferences:{[field]:e}}}),opts).program;
   out.push({sg,nd,eq:eq.join('+'),field,emphasis:e,configurationSetChanged:ids(p)!==b,rowOrderChanged:JSON.stringify(order(p))!==JSON.stringify(order(base))});
  }
 }
}
const summary={cases:out.length,configurationSetChanged:out.filter(x=>x.configurationSetChanged).length,rowOrderChanged:out.filter(x=>x.rowOrderChanged).length};
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./out/p05-emphasis.json',import.meta.url),JSON.stringify({summary,out},null,1));
console.log(JSON.stringify(summary));
