// SSCTR R7ASE-SSCTR-r1 comparison (own). Prints only. For each output of ssctr-r7ase-runs/ (my re-runs on STATE-EVIDENCE-FREEZE-1, plus my
// probes on the byte-exact R7A-BOUNDARY-FINAL-FREEZE copy, suffix .BOUNDARY): its sha256 against my own R7A-BOUNDARY-FINAL-FREEZE output of the
// same instrument (audits/domain-coaching-r7a-boundary-2026-10-28/reviews/ssctr-r7ab-runs/) and against the author's evidence run on
// STATE-EVIDENCE-FREEZE-1 (probes/runs/); for each output that differs from my R7AB output, the JSON paths that differ. A .BOUNDARY output must
// equal my R7AB output except its printed runtime label (the copy is that freeze). The round-12 instrument's data file is compared section by
// section, folder and instrument names normalized. My own new probes (regression, se-probe, holdout-detail) have no R7AB counterpart.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),mine=path.join(here,'ssctr-r7ase-runs'),ab=path.join(root,'audits/domain-coaching-r7a-boundary-2026-10-28/reviews/ssctr-r7ab-runs'),author=path.join(here,'../probes/runs');
const sha=f=>fs.existsSync(f)?createHash('sha256').update(fs.readFileSync(f)).digest('hex'):null;
const authorName=n=>n==='r12-instrument'?'ssctr-instrument':n.startsWith('x-')?'ssctr2-'+n:n.startsWith('f-')?'ssctr7af-'+n:n.startsWith('b-')?'ssctr7ab-'+n:'ssctr-'+n;
function diff(a,b,p='',out=[]){if(out.length>60)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'/'+k,out);return out;}
 out.push({path:p,boundary:JSON.stringify(a)?.slice(0,300),stateEvidence:JSON.stringify(b)?.slice(0,300)});return out;}
const OWN=new Set(['regression','se-probe','se-probe.BOUNDARY','holdout-detail','compare','verify-r7ase.read-only','systemic','systemic.BOUNDARY','literature','tick','tick.BOUNDARY']);
const lbl=x=>{try{const j=JSON.parse(x);delete j.runtime;return JSON.stringify(j);}catch{return null;}},rd=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):null;
const rows=[];
for(const f of fs.readdirSync(mine).filter(f=>f.endsWith('.out.json')).sort()){
 const n=f.replace(/\.out\.json$/,'');if(OWN.has(n))continue;const base=n.replace(/\.BOUNDARY$/,''),m=sha(path.join(mine,f)),r=sha(path.join(ab,base+'.out.json')),au=n.endsWith('.BOUNDARY')?null:sha(path.join(author,authorName(n)+'.out.json'));
 const eqLabel=n.endsWith('.BOUNDARY')?lbl(rd(path.join(mine,f)))===lbl(rd(path.join(ab,base+'.out.json'))):null;
 const row={name:n,sha256:m,equalsMyR7ABOutput:m===r,...(eqLabel===null?{}:{equalsMyR7ABOutputExceptRuntimeLabel:eqLabel}),equalsAuthorRunOnStateEvidence:au===null?null:m===au};
 if(m!==r&&n!=='r12-instrument'&&!eqLabel){try{row.differencesFromMyR7ABOutput=diff(JSON.parse(fs.readFileSync(path.join(ab,base+'.out.json'),'utf8')),JSON.parse(fs.readFileSync(path.join(mine,f),'utf8')));}catch(e){row.differencesFromMyR7ABOutput=String(e).slice(0,200);}}
 rows.push(row);
}
const norm=s=>s.replace(/audits[\\/]+domain-coaching-r7a[^"\\/]*[\\/]+(reviews|probes)/g,'<folder>').replace(/ssctr-r7a[a-z0-9]*-r12-instrument/g,'<instrument>').replace(/ssctr-r12-instrument/g,'<instrument>');
let r12=null;const d2f=path.join(mine,'r12-instrument.data.json');
if(fs.existsSync(d2f)){const d1=JSON.parse(norm(fs.readFileSync(path.join(ab,'r12-instrument.data.json'),'utf8'))),d2=JSON.parse(norm(fs.readFileSync(d2f,'utf8')));
 const au12=path.join(author,'ssctr-instrument.data.json'),d3=fs.existsSync(au12)?JSON.parse(norm(fs.readFileSync(au12,'utf8'))):null;
 const S1=d1.sections??d1,S2=d2.sections??d2,S3=d3?(d3.sections??d3):null;
 const sections=[...new Set([...Object.keys(S1),...Object.keys(S2)])],differ=sections.filter(k=>JSON.stringify(S1[k])!==JSON.stringify(S2[k]));
 r12={sections:sections.length,differentSections:differ,nonSectionKeysEqual:Object.keys(d2).filter(k=>k!=='sections').every(k=>JSON.stringify(d1[k])===JSON.stringify(d2[k])),differences:differ.flatMap(k=>diff(S1[k],S2[k],'/'+k)).slice(0,80),sectionsNotEqualToAuthorRun:S3?sections.filter(k=>JSON.stringify(S3[k])!==JSON.stringify(S2[k])):'author data file not found'};}
console.log(JSON.stringify({compare:'R7ASE-SSCTR-r1',at:new Date().toISOString(),identicalToMyR7AB:rows.filter(r=>!r.name.endsWith('.BOUNDARY')&&r.equalsMyR7ABOutput).map(r=>r.name),differentFromMyR7AB:rows.filter(r=>!r.name.endsWith('.BOUNDARY')&&!r.equalsMyR7ABOutput).map(r=>r.name),
 boundaryCopyReproducesMyR7AB:rows.filter(r=>r.name.endsWith('.BOUNDARY')).map(r=>[r.name,r.equalsMyR7ABOutput||r.equalsMyR7ABOutputExceptRuntimeLabel?'equal (except the printed runtime label)':'DIFFERENT']),notEqualToAuthorRun:rows.filter(r=>r.equalsAuthorRunOnStateEvidence===false).map(r=>r.name),r12,rows},null,1));
