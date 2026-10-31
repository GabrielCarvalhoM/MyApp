// Q-R7B probe 16: reachability summary from the probe outputs (p01, p02, p03, p04, p06, p11, p12). Classifies every catalog configuration:
// DEFAULT (some onboarding input without declared familiarity produces it at generation), REVIEW (only after a review: ladder step,
// rotation, substitution), FAMILIAR (only when the athlete declares it familiar), NONE (no probe produced it). Output: out/p16-summary.json
import fs from 'node:fs';
import {CATALOG} from './lib.mjs';
const rd=f=>JSON.parse(fs.readFileSync(new URL('./out/'+f,import.meta.url),'utf8'));
const all=CATALOG.strength.configurations.map(c=>c.id);
const p01=rd('p01-sweep.json'),p02=rd('p02-config-targeted.json'),p04=rd('p04-review-driven.json'),p06=rd('p06-rotation-sweep.json'),p12=rd('p12-ladder-targeted.json'),p03=rd('p03-run-families.json');
const generationDefault=new Set([...Object.keys(p01.configs),...Object.entries(p02.res).filter(([,v])=>v.reachable&&!v.witness.familiar).map(([k])=>k)]);
const rotation=new Set(all.filter(id=>!p06.configsNotSeen.includes(id)));
const review=new Set([...all.filter(id=>!p04.configsNotSeen.includes(id)),...p12.filter(x=>x.accepted!==null&&!/bird-dog/.test(x.want)).map(x=>x.want.split(' -> ')[1])]);
const familiar=new Set(Object.entries(p02.res).filter(([,v])=>v.reachable).map(([k])=>k));
const cls={};for(const id of all)cls[id]=generationDefault.has(id)?'DEFAULT':rotation.has(id)?'ROTATION':review.has(id)?'REVIEW':familiar.has(id)?'FAMILIAR_ONLY':'NONE';
const by=k=>Object.entries(cls).filter(([,v])=>v===k).map(([id])=>id);
const out={configurations:{total:all.length,reachable:all.length-by('NONE').length,DEFAULT:by('DEFAULT').length,ROTATION:by('ROTATION'),REVIEW:by('REVIEW'),FAMILIAR_ONLY:by('FAMILIAR_ONLY'),NONE:by('NONE')},
 runFamilies:{total:CATALOG.run.families.length,reachable:p03.familiesSeen.length,notSeen:p03.familiesNotSeen},
 runConfigurations:{total:13,namedByRuntime:p03.runConfigsSeen.length,notNamed:p03.runConfigsNotSeen},
 templates:{total:CATALOG.strength.templates.length,reachable:p01.templates?Object.keys(p01.templates).length:null,notSeen:p01.templatesNotSeen},
 archetypes:{total:CATALOG.archetypes.items.length,reachable:Object.keys(p01.archetypes).length,notSeen:p01.archetypesNotSeen,overlays:Object.keys(p01.overlays)},
 programsGenerated:{p01:p01.n,p06:p06.n/2,p02triesTotal:Object.values(p02.res).reduce((n,v)=>n+v.tries,0)},classification:cls};
fs.writeFileSync(new URL('./out/p16-summary.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({...out,classification:undefined},null,1));
