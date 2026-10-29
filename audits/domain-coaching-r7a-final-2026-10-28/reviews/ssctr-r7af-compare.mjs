// SSCTR R7AF-SSCTR-r1 comparison (own). Prints only. For each output of ssctr-r7af-runs/ (my re-runs on R7A-FINAL-FREEZE): its sha256 against
// my own R7A2-FREEZE-1 output of the same instrument (audits/domain-coaching-r7a2-2026-10-28/reviews/runs/) and against the author's evidence
// run on R7A-FINAL-FREEZE (probes/runs/); for each output that differs from my R7A2-FREEZE-1 output, the JSON paths that differ. The round-12
// instrument's stdout names the folder it runs from, so its data file is compared section by section, with folder names normalized.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),mine=path.join(here,'ssctr-r7af-runs'),a2=path.join(root,'audits/domain-coaching-r7a2-2026-10-28/reviews/runs'),author=path.join(here,'../probes/runs');
const sha=f=>fs.existsSync(f)?createHash('sha256').update(fs.readFileSync(f)).digest('hex'):null;
const authorName=n=>n==='r12-instrument'?'ssctr-instrument':n.startsWith('x-')?'ssctr2-'+n:'ssctr-'+n;
function diff(a,b,p='',out=[]){if(out.length>40)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'/'+k,out);return out;}
 out.push({path:p,before:JSON.stringify(a)?.slice(0,300),now:JSON.stringify(b)?.slice(0,300)});return out;}
const rows=[];
for(const f of fs.readdirSync(mine).filter(f=>f.endsWith('.out.json')&&!f.startsWith('f-')).sort()){
 const n=f.replace(/\.out\.json$/,''),m=sha(path.join(mine,f)),r=sha(path.join(a2,f)),au=sha(path.join(author,authorName(n)+'.out.json'));
 const row={name:n,sha256:m,equalsMyR7A2Freeze1:m===r,equalsAuthorRunOnFinal:au===null?null:m===au};
 if(m!==r&&n!=='r12-instrument'){try{row.differencesFromMyR7A2Freeze1=diff(JSON.parse(fs.readFileSync(path.join(a2,f),'utf8')),JSON.parse(fs.readFileSync(path.join(mine,f),'utf8')));}catch(e){row.differencesFromMyR7A2Freeze1=String(e).slice(0,200);}}
 rows.push(row);
}
const norm=s=>s.replace(/audits[\\/]+domain-coaching-r7a[^"\\/]*[\\/]+(reviews|probes)/g,'<folder>').replace(/ssctr-r7a[a-z0-9]*-r12-instrument/g,'<instrument>').replace(/ssctr-r12-instrument/g,'<instrument>');
const d1=JSON.parse(norm(fs.readFileSync(path.join(a2,'r12-instrument.data.json'),'utf8'))),d2=JSON.parse(norm(fs.readFileSync(path.join(mine,'r12-instrument.data.json'),'utf8')));
const sections=[...new Set([...Object.keys(d1),...Object.keys(d2)])],differ=sections.filter(k=>JSON.stringify(d1[k])!==JSON.stringify(d2[k]));
const r12={sections:sections.length,differentSections:differ,differences:differ.flatMap(k=>diff(d1[k],d2[k],'/'+k)).slice(0,20)};
console.log(JSON.stringify({compare:'R7AF-SSCTR-r1',at:new Date().toISOString(),identicalToMyR7A2Freeze1:rows.filter(r=>r.equalsMyR7A2Freeze1).map(r=>r.name),differentFromMyR7A2Freeze1:rows.filter(r=>!r.equalsMyR7A2Freeze1).map(r=>r.name),notEqualToAuthorRun:rows.filter(r=>r.equalsAuthorRunOnFinal===false).map(r=>r.name),r12,rows},null,1));
