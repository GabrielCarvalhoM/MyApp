// R7-B catalog ↔ runtime conformance check (DOMAIN_COACHING_R7-B; request §21). Read-only unless given --write, which writes only
// CoachingCore/r7/b/CONFORMANCE_R7B.report.json. It checks that r7/b/CONFORMANCE_R7B.json disposes of every SSCTR r2 condition, every run
// family, intensity method, composition relation and placement rule, infeasible/incomparable representation, later-gate item, witness,
// substitution reason, template, configuration field and the classification, archetype, trajectory and safety sections of the bound catalog;
// that every status is one of the allowed ones; that every IMPLEMENTED entry names a runtime consumer that exists in src/ and at least one test
// whose title exists in that test file; and that every DEFERRED entry names an owner and a gate.
import fs from 'node:fs';
const root=new URL('..',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const catalog=JSON.parse(read('r7/b0/REPERTOIRE_CATALOG_B0.json')),records=JSON.parse(read('../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'));
const matrix=JSON.parse(read('r7/b/CONFORMANCE_R7B.json')),entries=new Map(matrix.entries.map(e=>[e.id,e])),problems=[];
const STATUS=['IMPLEMENTED','INHERITED','DESCRIPTIVE','DEFERRED','NOT_APPLICABLE'];
const expected=[];
for(const r of records){const id=r.review_id.replace('R7B0-SSCTR-','');(r.decision?.conditions??[]).forEach((_,i)=>expected.push(`SSCTR:${id}#c${i+1}`));}
for(const f of catalog.run.families)expected.push('run.family:'+f.id);
for(const m of catalog.run.intensityMethods)expected.push('run.intensityMethod:'+m.id);
for(const r of catalog.composition.interferenceRelations)expected.push('composition.relation:'+r.id);
for(const r of catalog.composition.placementRules)expected.push('composition.placement:'+r.id);
for(const r of catalog.composition.infeasibleOrIncomparable)expected.push('composition.infeasible:'+r.id);
for(const p of catalog.composition.protectedStimuli)expected.push('composition.protected:'+p.lead);
for(const g of catalog.laterGate)expected.push('laterGate:'+g.id);
for(const w of [...catalog.witnesses.positive,...catalog.witnesses.negative])expected.push('witness:'+w.id);
for(const r of catalog.strength.substitution.reasons)expected.push('substitution.reason:'+r.id);
for(const t of catalog.strength.templates)expected.push('template:'+t.id);
for(const k of Object.keys(catalog.strength.configurationFields))expected.push('configuration.field:'+k);
for(const s of catalog.classification.signals)expected.push('classification.signal:'+s.id);
for(const c of catalog.classification.runClasses)expected.push('classification.runClass:'+c.id);
for(const c of catalog.classification.strengthClasses)expected.push('classification.strengthClass:'+c.id);
for(const a of catalog.archetypes.items)expected.push('archetype:'+a.id);
for(const k of Object.keys(catalog.safety.routes))expected.push('safety.route:'+k);
for(const id of ['strength.templateRules','strength.skillLadders','strength.closeVariationRule','strength.rotation','strength.pullCoverage','strength.noviceDensity','strength.demandSemantics','strength.muscleCounting','strength.equipmentProfiles','classification.skillAdmissibility','classification.graduation','classification.unknownCategories','trajectories.run','trajectories.event','trajectories.event.combinedTaper','trajectories.strengthExercise','trajectories.novice','composition.ranking','composition.sessionClasses','parameterModel'])expected.push('section:'+id);
const tests=new Map();for(const f of fs.readdirSync(new URL('test/',root)).filter(f=>f.endsWith('.test.mjs')))tests.set('test/'+f,read('test/'+f));
const src=new Map();for(const f of fs.readdirSync(new URL('src/',root)).filter(f=>f.endsWith('.mjs')))src.set('src/'+f,read('src/'+f));
for(const id of expected){
 const e=entries.get(id);if(!e){problems.push('missing: '+id);continue;}
 if(!STATUS.includes(e.status))problems.push('status: '+id);
 if(e.status==='IMPLEMENTED'){
  if(!(e.consumers??[]).length)problems.push('no consumer: '+id);
  for(const c of e.consumers??[]){const [file,name]=c.split('#');if(!src.has(file)||name&&!src.get(file).includes(name))problems.push(`consumer not found: ${id} → ${c}`);}
  if(!(e.tests??[]).length)problems.push('no test: '+id);
 }
 for(const t of e.tests??[]){const [file,title]=t.split('::');if(!tests.has(file)||!tests.get(file).includes(title))problems.push(`test not found: ${id} → ${t}`);}
 if(e.status==='DEFERRED'&&!(e.owner&&e.gate))problems.push('deferral without owner and gate: '+id);
 if(!e.rule)problems.push('no rule text: '+id);
}
for(const id of entries.keys())if(!expected.includes(id))problems.push('unexpected entry: '+id);
const counts=Object.fromEntries(STATUS.map(s=>[s,matrix.entries.filter(e=>e.status===s).length]));
const report={check:'R7B-CONFORMANCE',catalogRevision:catalog.revision,expected:expected.length,entries:matrix.entries.length,counts,conditions:expected.filter(x=>x.startsWith('SSCTR:')).length,problems,result:problems.length?'FAIL':'PASS'};
if(process.argv.includes('--write'))fs.writeFileSync(new URL('r7/b/CONFORMANCE_R7B.report.json',root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({...report,problems:problems.slice(0,40)},null,1));
process.exitCode=problems.length?1:0;
