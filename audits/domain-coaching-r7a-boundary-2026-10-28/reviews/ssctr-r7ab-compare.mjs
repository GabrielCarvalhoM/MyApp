// SSCTR R7AB-SSCTR-r1 comparison (own). Prints only. For each output of ssctr-r7ab-runs/ (my re-runs on R7A-BOUNDARY-FINAL-FREEZE, plus my
// probes on the byte-exact R7A-FINAL-FREEZE copy, suffix .FINAL): its sha256 against my own R7A-FINAL-FREEZE output of the same instrument
// (audits/domain-coaching-r7a-final-2026-10-28/reviews/ssctr-r7af-runs/) and against the author's evidence run on R7A-BOUNDARY-FINAL-FREEZE
// (probes/runs/); for each output that differs from my R7A-FINAL-FREEZE output, the JSON paths that differ. A .FINAL output must equal my
// R7A-FINAL-FREEZE output (the copy is that freeze). The round-12 instrument's data file is compared section by section, folder names normalized.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),mine=path.join(here,'ssctr-r7ab-runs'),af=path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/reviews/ssctr-r7af-runs'),author=path.join(here,'../probes/runs');
const sha=f=>fs.existsSync(f)?createHash('sha256').update(fs.readFileSync(f)).digest('hex'):null;
const authorName=n=>n==='r12-instrument'?'ssctr-instrument':n.startsWith('x-')?'ssctr2-'+n:n.startsWith('f-')?'ssctr7af-'+n:'ssctr-'+n;
function diff(a,b,p='',out=[]){if(out.length>40)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'/'+k,out);return out;}
 out.push({path:p,before:JSON.stringify(a)?.slice(0,300),now:JSON.stringify(b)?.slice(0,300)});return out;}
const rows=[];
for(const f of fs.readdirSync(mine).filter(f=>f.endsWith('.out.json')&&!f.startsWith('b-')&&!['literature.out.json','compare.out.json'].includes(f)).sort()){
 const n=f.replace(/\.out\.json$/,''),base=n.replace(/\.FINAL$/,''),m=sha(path.join(mine,f)),r=sha(path.join(af,base+'.out.json')),au=n.endsWith('.FINAL')?null:sha(path.join(author,authorName(n)+'.out.json'));
 const lbl=x=>{try{const j=JSON.parse(x);delete j.runtime;return JSON.stringify(j);}catch{return null;}},rd=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):null,eqLabel=n.endsWith('.FINAL')?lbl(rd(path.join(mine,f)))===lbl(rd(path.join(af,base+'.out.json'))):null;
 const row={name:n,sha256:m,equalsMyR7AFOutput:m===r,...(eqLabel===null?{}:{equalsMyR7AFOutputExceptRuntimeLabel:eqLabel}),equalsAuthorRunOnBoundary:au===null?null:m===au};
 if(m!==r&&n!=='r12-instrument'){try{row.differencesFromMyR7AFOutput=diff(JSON.parse(fs.readFileSync(path.join(af,base+'.out.json'),'utf8')),JSON.parse(fs.readFileSync(path.join(mine,f),'utf8')));}catch(e){row.differencesFromMyR7AFOutput=String(e).slice(0,200);}}
 rows.push(row);
}
const norm=s=>s.replace(/audits[\\/]+domain-coaching-r7a[^"\\/]*[\\/]+(reviews|probes)/g,'<folder>').replace(/ssctr-r7a[a-z0-9]*-r12-instrument/g,'<instrument>').replace(/ssctr-r12-instrument/g,'<instrument>');
const d1=JSON.parse(norm(fs.readFileSync(path.join(af,'r12-instrument.data.json'),'utf8'))),d2=JSON.parse(norm(fs.readFileSync(path.join(mine,'r12-instrument.data.json'),'utf8')));
const au12=path.join(author,'ssctr-instrument.data.json'),d3=fs.existsSync(au12)?JSON.parse(norm(fs.readFileSync(au12,'utf8'))):null;
const S1=d1.sections??d1,S2=d2.sections??d2,S3=d3?(d3.sections??d3):null,top={keys:Object.keys(d2),nonSectionKeysEqual:Object.keys(d2).filter(k=>k!=='sections').every(k=>JSON.stringify(d1[k])===JSON.stringify(d2[k]))};
const sections=[...new Set([...Object.keys(S1),...Object.keys(S2)])],differ=sections.filter(k=>JSON.stringify(S1[k])!==JSON.stringify(S2[k]));
const r12={sections:sections.length,differentSections:differ,top,differences:differ.flatMap(k=>diff(S1[k],S2[k],'/'+k)).slice(0,60),sectionsNotEqualToAuthorRun:S3?sections.filter(k=>JSON.stringify(S3[k])!==JSON.stringify(S2[k])):'author data file not found'};
console.log(JSON.stringify({compare:'R7AB-SSCTR-r1',at:new Date().toISOString(),identicalToMyR7AF:rows.filter(r=>!r.name.endsWith('.FINAL')&&r.equalsMyR7AFOutput).map(r=>r.name),differentFromMyR7AF:rows.filter(r=>!r.name.endsWith('.FINAL')&&!r.equalsMyR7AFOutput).map(r=>r.name),
 finalCopyReproducesMyR7AF:rows.filter(r=>r.name.endsWith('.FINAL')).map(r=>[r.name,r.equalsMyR7AFOutput||r.equalsMyR7AFOutputExceptRuntimeLabel?'equal except the printed runtime label':'DIFFERENT']),notEqualToAuthorRun:rows.filter(r=>r.equalsAuthorRunOnBoundary===false).map(r=>r.name),r12,rows},null,1));
