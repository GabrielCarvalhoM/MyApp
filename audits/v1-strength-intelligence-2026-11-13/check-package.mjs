// Strength Intelligence Foundation (2026-11-13): package integrity check (read-only). It verifies the exemplar against the BOUND catalog
// (R7B0-CATALOG-2, read by its bytes and hash), the controlled vocabularies, the absence of invented numbers, the alias rules, and that the
// document cites only probe checks, files and gap ids that exist. `--table` prints the derived view of the existing catalog fields for the
// exemplar (never stored in the package: the catalog prevails). Run from the repository root:
// node audits/v1-strength-intelligence-2026-11-13/check-package.mjs [--table]
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execSync} from 'node:child_process';

const HERE=new URL('./',import.meta.url),ROOT=new URL('../../',import.meta.url);
const read=(rel,base=HERE)=>fs.readFileSync(new URL(rel,base));
const results=[];const check=(claim,ok,observed=null)=>results.push({claim,ok:!!ok,observed});

const ex=JSON.parse(read('EXERCISE_EXEMPLAR_V1.json').toString('utf8'));
const catBytes=read(ex.binds.catalogPath,ROOT),catSha=createHash('sha256').update(catBytes).digest('hex');
const cat=JSON.parse(catBytes.toString('utf8')),cfg=new Map(cat.strength.configurations.map(c=>[c.id,c]));
const doc=read('STRENGTH_INTELLIGENCE_FOUNDATION.md').toString('utf8'),probe=read('probe-strength.mjs').toString('utf8');

// Binding
check('exemplar binds the catalog bytes actually on disk (sha256)',catSha===ex.binds.catalogSha256,catSha);
check('exemplar binds the catalog revision',cat.revision===ex.binds.catalogRevision,cat.revision);
check('runtime pins the same catalog sha (r7b-repertoire.mjs CATALOG_SHA256)',read('CoachingCore/src/r7b-repertoire.mjs',ROOT).toString('utf8').includes(`CATALOG_SHA256='${ex.binds.catalogSha256}'`));

// Entries
const ids=ex.entries.map(e=>e.id);
check('15-25 exemplar entries',ids.length>=15&&ids.length<=25,ids.length);
check('every exemplar id exists in the bound catalog (no new exercise)',ids.every(id=>cfg.has(id)),ids.filter(id=>!cfg.has(id)));
check('no duplicate ids',new Set(ids).size===ids.length);
const need={SQUAT:2,HINGE:2,PUSH:3,PULL:3,LUNGE:1,CALF:2,TRUNK:1};
const byPattern=ids.reduce((m,id)=>(m[cfg.get(id)?.pattern]=(m[cfg.get(id)?.pattern]??0)+1,m),{});
check('coverage: squat, hinge, push H+V, pull H+V, unilateral, calves, trunk, a runner accessory',Object.entries(need).every(([p,n])=>(byPattern[p]??0)>=n)&&['HORIZONTAL_PUSH','VERTICAL_PUSH','HORIZONTAL_PULL','VERTICAL_PULL'].every(s=>ids.some(id=>cfg.get(id)?.sub===s))&&ids.some(id=>cfg.get(id)?.lat==='UNILATERAL')&&ids.some(id=>cfg.get(id)?.purposes.includes('RUNNING_SUPPORT')&&cfg.get(id)?.kind==='ISOLATION'),byPattern);
// Only the new fields: no existing catalog field is copied into an entry (no parallel source of truth).
const catFields=new Set(Object.keys(cat.strength.configurationFields).concat(['name','region','authorityStatus','note']));
const allowed=new Set(['id','doseUnit','display','aliases','decisions']);
check('entries carry only the new fields (doseUnit, display, aliases) plus decisions; no existing field copied',ex.entries.every(e=>Object.keys(e).every(k=>allowed.has(k)&&!(catFields.has(k)&&k!=='id'))),ex.entries.flatMap(e=>Object.keys(e).filter(k=>!allowed.has(k))));
const DOSE=ex.newFieldNamespaces.engine.vocabulary.doseUnit;
check('doseUnit is in its controlled vocabulary',ex.entries.every(e=>DOSE.includes(e.doseUnit)));
const holds=ex.entries.filter(e=>e.doseUnit==='HOLD_SECONDS').map(e=>e.id);
check('HOLD_SECONDS only on isometric trunk stability configurations',holds.length>0&&holds.every(id=>cfg.get(id).pattern==='TRUNK'&&cfg.get(id).kind==='STABILITY'&&/plank/.test(id)),holds);
check('SQ-1 condition: HOLD set is exactly front-plank and side-plank, in the entries and the engine namespace',JSON.stringify(holds.sort())==='["front-plank","side-plank"]'&&JSON.stringify([...(ex.newFieldNamespaces.engine.holdConfigurations??[])].sort())==='["front-plank","side-plank"]',holds);
// SSCTR records bind the document as submitted (its commit), and that commit is an ancestor of HEAD.
const recFile=new URL('reviews/SSCTR_SI_V1_DECISION.json',HERE);
if(fs.existsSync(recFile)){
 const recs=JSON.parse(fs.readFileSync(recFile,'utf8')),bound=ex.ssctr?.boundDocumentSha256;
 let submitted=null;try{submitted=createHash('sha256').update(execSync(`git show ${ex.ssctr.boundCommit}:audits/v1-strength-intelligence-2026-11-13/STRENGTH_INTELLIGENCE_FOUNDATION.md`,{cwd:new URL('../../',import.meta.url)})).digest('hex');}catch{}
 check('SSCTR records SQ-1..SQ-4 exist, each bound to the submitted document sha',['SQ-1','SQ-2','SQ-3','SQ-4'].every(q=>recs.some(r=>r.review_id==='SI-V1-SSCTR-'+q&&r.target?.artifact_sha256===bound)),recs.map(r=>r.review_id));
 check('the bound sha is the document at the bound commit',submitted===bound,submitted);
 check('every record has a disposition, evidence status, conditions and a review-by date no later than 2027-04-30',recs.every(r=>r.disposition&&r.evidence_status&&(r.decision?.conditions??[]).length>0&&r.expiry?.review_by<='2027-04-30'));
}else check('SSCTR records present',false,'reviews/SSCTR_SI_V1_DECISION.json missing');
// Decisions reference real catalog fields and real probe scenarios.
const scenarios=new Set([...probe.matchAll(/check\('([A-Z0-9]+)'/g)].map(m=>m[1]));
const uses=ex.entries.flatMap(e=>e.decisions.flatMap(d=>d.uses));
check('every decision uses existing catalog fields only',uses.every(u=>catFields.has(u)),[...new Set(uses.filter(u=>!catFields.has(u)))]);
check('every decision kind is in the declared vocabulary',ex.entries.every(e=>e.decisions.every(d=>ex.decisionKinds.includes(d.kind))));
check('every entry demonstrates at least one decision',ex.entries.every(e=>e.decisions.length>=1));
const cited=ex.entries.flatMap(e=>e.decisions.flatMap(d=>d.probe??[]));
check('every probe scenario cited exists in probe-strength.mjs',cited.every(s=>scenarios.has(s)),[...new Set(cited.filter(s=>!scenarios.has(s)))]);
// No invented numbers in the new fields (display names, aliases, doseUnit carry no number).
const newText=JSON.stringify(ex.entries.map(e=>({d:e.display,a:e.aliases,u:e.doseUnit})));
check('no numeric value in the new fields (no fatigue, stimulus or interference score)',!/\d/.test(newText.replace(/pt-BR/g,'').replace(/leg press 45/g,'')),null);
check('no fatigue/stimulus/interference score key anywhere in the exemplar',!/"(fatigue|stimulus|interference|systemic)[A-Za-z]*"\s*:\s*[0-9]/i.test(JSON.stringify(ex)));
// Aliases: unique across entries, never equal to an ambiguous alias, ambiguous aliases point to 2+ real configurations.
const aliasOwner=new Map();let dup=[];
for(const e of ex.entries)for(const a of e.aliases['pt-BR']){const k=a.toLowerCase();if(aliasOwner.has(k)&&aliasOwner.get(k)!==e.id)dup.push(a);aliasOwner.set(k,e.id);}
check('no alias maps to two configurations',dup.length===0,dup);
const amb=ex.ambiguousAliases;
check('ambiguous aliases name 2+ real configurations and are never a direct alias',amb.every(a=>a.candidates.length>=2&&a.candidates.every(id=>cfg.has(id))&&!aliasOwner.has(a.alias.toLowerCase())),amb.filter(a=>aliasOwner.has(a.alias.toLowerCase())).map(a=>a.alias));
check('every exemplar entry has a pt-BR display name',ex.entries.every(e=>typeof e.display?.['pt-BR']==='string'&&e.display['pt-BR'].trim().length>0));

// Document consistency
const gaps=[...new Set([...doc.matchAll(/GAP-S\d/g)].map(m=>m[0]))].sort(),probeGaps=new Set([...probe.matchAll(/'(GAP-S\d)'/g)].map(m=>m[1]));
check('document gap ids GAP-S1..S8 are all defined in its summary table',['GAP-S1','GAP-S2','GAP-S3','GAP-S4','GAP-S5','GAP-S6','GAP-S7','GAP-S8'].every(g=>new RegExp('\\| '+g+' \\|').test(doc)),gaps);
check('every gap the probe tags is defined in the document',[...probeGaps].every(g=>doc.includes('| '+g+' |')),[...probeGaps]);
const nChecks=(probe.match(/\bcheck\('/g)??[]).length;
check('document states the probe check count it ships with',doc.includes(`${nChecks}/${nChecks}`)&&doc.includes(`${nChecks} checagens`),nChecks);
const files=['EXERCISE_EXEMPLAR_V1.json','probe-strength.mjs','check-package.mjs','sweep-planes.mjs'];
check('every package file the document names exists',files.every(f=>fs.existsSync(new URL(f,HERE))&&doc.includes(f.replace('sweep-planes.mjs','sweep-planes'))),files.filter(f=>!fs.existsSync(new URL(f,HERE))));
check('the document cites the catalog sha it binds',doc.includes(ex.binds.catalogSha256.slice(0,7)));
check('every SSCTR question SQ-1..SQ-4 is stated in section 8',['SQ-1','SQ-2','SQ-3','SQ-4'].every(q=>new RegExp('\\*\\*'+q+'\\*\\*').test(doc)));

if(process.argv.includes('--table')){
 console.log('| id | padrão/sub | equip. | carga/conv. | lat. | habil. | inf./axial/exc. | primários | papéis | doseUnit |');
 console.log('|---|---|---|---|---|---|---|---|---|---|');
 for(const e of ex.entries){const c=cfg.get(e.id);console.log(`| ${e.id} | ${c.pattern}/${c.sub} | ${c.eq.join('+')} | ${c.loading}/${c.conv} | ${c.lat} | ${c.skill} | ${c.lower}/${c.axial}/${c.ecc} | ${c.prim.join('+')} | ${c.roles.join('/')} | ${e.doseUnit} |`);}
 console.log('');
}
let pass=0;for(const x of results){if(x.ok)pass++;console.log(`${x.ok?'PASS':'FAIL'} ${x.claim}${x.ok?'':'\n      '+JSON.stringify(x.observed)}`);}
console.log(`\n${pass}/${results.length} package checks`);
process.exitCode=pass===results.length?0:1;
