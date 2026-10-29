// SSCTR R7ASM-SSCTR-r1 comparison (own). Prints only. For each output of ssctr-r7asm-runs/ (my re-runs on HISTORICAL-PROJECTION-FREEZE-1, plus
// my probes on the byte-exact STATE-EVIDENCE-FREEZE-1 copy, suffix .PRED): its sha256 against my own STATE-EVIDENCE-FREEZE-1 output of the same
// instrument (audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs/, every job of which recorded 692483ce... before and
// after it). For a live output that differs from that predecessor output, the JSON paths that differ. A .PRED output must equal that predecessor
// output except its printed runtime label (the copy is that freeze: a reproducibility check of my own instruments). The round-12 instrument's data
// file is compared section by section, folder and instrument names normalized. My new probes (regression, changes, holdout-detail) have no
// predecessor counterpart and are read on their own.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),mine=path.join(here,'ssctr-r7asm-runs'),prev=path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs');
const sha=f=>fs.existsSync(f)?createHash('sha256').update(fs.readFileSync(f)).digest('hex'):null;
function diff(a,b,p='',out=[]){if(out.length>80)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'/'+k,out);return out;}
 out.push({path:p,predecessor:JSON.stringify(a)?.slice(0,400),stateModel:JSON.stringify(b)?.slice(0,400)});return out;}
const OWN=new Set(['regression','changes','changes.PRED','holdout-detail','compare','verify-r7asm.read-only','literature']);
const lbl=x=>{try{const j=JSON.parse(x);delete j.runtime;return JSON.stringify(j);}catch{return null;}},rd=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):null;
const rows=[];
for(const f of fs.readdirSync(mine).filter(f=>f.endsWith('.out.json')).sort()){
 const n=f.replace(/\.out\.json$/,'');if(OWN.has(n))continue;const base=n.replace(/\.PRED$/,''),m=sha(path.join(mine,f)),r=sha(path.join(prev,base+'.out.json'));
 const eqLabel=lbl(rd(path.join(mine,f)))===lbl(rd(path.join(prev,base+'.out.json')));
 const row={name:n,sha256:m,equalsMyPredecessorOutput:m===r,equalsMyPredecessorOutputExceptRuntimeLabel:eqLabel};
 if(!eqLabel&&n!=='r12-instrument'){try{row.differencesFromMyPredecessorOutput=diff(JSON.parse(fs.readFileSync(path.join(prev,base+'.out.json'),'utf8')),JSON.parse(fs.readFileSync(path.join(mine,f),'utf8')));}catch(e){row.differencesFromMyPredecessorOutput=String(e).slice(0,200);}}
 rows.push(row);
}
const norm=s=>s.replace(/audits[\\/]+domain-coaching-r7a[^"\\/]*[\\/]+(reviews|probes)/g,'<folder>').replace(/ssctr-r7a[a-z0-9]*-r12-instrument/g,'<instrument>').replace(/ssctr-r12-instrument/g,'<instrument>');
let r12=null;const d2f=path.join(mine,'r12-instrument.data.json');
if(fs.existsSync(d2f)){const d1=JSON.parse(norm(fs.readFileSync(path.join(prev,'r12-instrument.data.json'),'utf8'))),d2=JSON.parse(norm(fs.readFileSync(d2f,'utf8')));
 const S1=d1.sections??d1,S2=d2.sections??d2;
 const sections=[...new Set([...Object.keys(S1),...Object.keys(S2)])],differ=sections.filter(k=>JSON.stringify(S1[k])!==JSON.stringify(S2[k]));
 r12={sections:sections.length,differentSections:differ,nonSectionKeysEqual:Object.keys(d2).filter(k=>k!=='sections').every(k=>JSON.stringify(d1[k])===JSON.stringify(d2[k])),nonSectionKeysDiffering:Object.keys(d2).filter(k=>k!=='sections'&&JSON.stringify(d1[k])!==JSON.stringify(d2[k])),differences:differ.flatMap(k=>diff(S1[k],S2[k],'/'+k)).slice(0,120)};}
const live=rows.filter(r=>!r.name.endsWith('.PRED'));
console.log(JSON.stringify({compare:'R7ASM-SSCTR-r1',at:new Date().toISOString(),
 identicalToMyPredecessorOutput:live.filter(r=>r.equalsMyPredecessorOutput||r.equalsMyPredecessorOutputExceptRuntimeLabel).map(r=>r.name),
 differentFromMyPredecessorOutput:live.filter(r=>!(r.equalsMyPredecessorOutput||r.equalsMyPredecessorOutputExceptRuntimeLabel)).map(r=>r.name),
 predCopyReproducesMyPredecessorOutput:rows.filter(r=>r.name.endsWith('.PRED')).map(r=>[r.name,r.equalsMyPredecessorOutput||r.equalsMyPredecessorOutputExceptRuntimeLabel?'equal (except the printed runtime label)':'DIFFERENT']),r12,rows},null,1));
