// Q-R7B probe 08: completeness of CONFORMANCE_R7B.json against the catalog, computed independently of the author's checker. Walks the
// catalog for every id-bearing item (families, configurations, templates, relations, placements, rules, witnesses, later-gate items,
// signals, classes, archetypes, routes, modes, session families...) and every top-level section, and lists what the matrix names nowhere.
// Also checks each matrix entry: consumers named exist in the source file (function/const name), tests named exist in the test file.
import fs from 'node:fs';
const root=new URL('../../../../../CoachingCore/',import.meta.url);
const C=JSON.parse(fs.readFileSync(new URL('r7/b0/REPERTOIRE_CATALOG_B0.json',root),'utf8'));
const M=JSON.parse(fs.readFileSync(new URL('r7/b/CONFORMANCE_R7B.json',root),'utf8'));
const ids=new Set(M.entries.map(e=>e.id)),text=JSON.stringify(M.entries);
const named=id=>[...ids].some(x=>x===id||x.endsWith(':'+id)||x.endsWith('#'+id))||text.includes('"'+id+'"')||text.includes(id);
const groups={};
const add=(g,list)=>{groups[g]=list.map(x=>typeof x==='string'?x:x.id).filter(Boolean);};
add('run.families',C.run.families);add('run.modes',C.run.modes);add('run.intensityMethods',C.run.intensityMethods);
add('run.configurations',C.run.families.flatMap(f=>f.configurations));
add('strength.sessionFamilies',C.strength.sessionFamilies);add('strength.templates',C.strength.templates);add('strength.configurations',C.strength.configurations);
add('strength.substitution.reasons',C.strength.substitution.reasons??[]);
for(const k of ['interferenceRelations','placementRules','infeasibleOrIncomparable','sessionClasses'])if(Array.isArray(C.composition[k]))add('composition.'+k,C.composition[k]);
add('composition.protectedStimuli',Array.isArray(C.composition.protectedStimuli)?C.composition.protectedStimuli:Object.keys(C.composition.protectedStimuli??{}));
for(const k of ['signals','statuses','unknownCategories','runClasses','strengthClasses'])if(Array.isArray(C.classification[k]))add('classification.'+k,C.classification[k]);
add('archetypes',C.archetypes.items);add('candidates',C.candidates);add('laterGate',C.laterGate);
add('witnesses.positive',C.witnesses.positive);add('witnesses.negative',C.witnesses.negative);
add('safety.routes',Array.isArray(C.safety.routes)?C.safety.routes:Object.keys(C.safety.routes??{}));
add('safety.perFamily',Array.isArray(C.safety.perFamily)?C.safety.perFamily:Object.keys(C.safety.perFamily??{}));
const report={};
for(const [g,list] of Object.entries(groups)){const miss=list.filter(id=>!named(id));report[g]={count:list.length,missingFromMatrix:miss};}
// Sections: every top-level key of each major block.
const sections={};for(const top of ['run','strength','composition','classification','archetypes','trajectories','safety','scope'])for(const k of Object.keys(C[top]??{})){const id=top+'.'+k;sections[id]=named(id)||[...ids].some(x=>x.includes(id));}
report.sectionsNotNamed=Object.entries(sections).filter(([,v])=>!v).map(([k])=>k);
// Consumers and tests resolvable.
const srcCache={},testCache={},bad=[];
for(const e of M.entries){
 for(const c of e.consumers??[]){const [file,sym]=c.split('#');const p=new URL(file,root);if(!fs.existsSync(p)){bad.push({id:e.id,consumer:c,why:'file missing'});continue;}const s=srcCache[file]??=fs.readFileSync(p,'utf8');if(sym&&!new RegExp(`\\b${sym.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).test(s))bad.push({id:e.id,consumer:c,why:'symbol not in file'});}
 for(const t of e.tests??[]){const [file,name]=t.split('::');const p=new URL(file,root);if(!fs.existsSync(p)){bad.push({id:e.id,test:t,why:'test file missing'});continue;}const s=testCache[file]??=fs.readFileSync(p,'utf8');if(name&&!s.includes(name.trim()))bad.push({id:e.id,test:t,why:'test title not found'});}
 if(e.status==='IMPLEMENTED'&&!(e.tests??[]).length)bad.push({id:e.id,why:'IMPLEMENTED without a named test'});
 if(e.status==='IMPLEMENTED'&&!(e.consumers??[]).length)bad.push({id:e.id,why:'IMPLEMENTED without a consumer'});
 if(['DESCRIPTIVE','NOT_APPLICABLE','DEFERRED','INHERITED'].includes(e.status)&&!e.note)bad.push({id:e.id,why:e.status+' without a note'});
 if(e.status==='DEFERRED'&&!e.owner)bad.push({id:e.id,why:'DEFERRED without owner'});
}
report.entryProblems=bad;
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./out/p08-completeness.json',import.meta.url),JSON.stringify(report,null,1));
console.log(JSON.stringify(report,null,1));
