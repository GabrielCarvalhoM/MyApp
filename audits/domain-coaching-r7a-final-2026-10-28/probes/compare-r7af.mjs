// DOMAIN_COACHING_R7-A final: compares each recorded evidence output (runs/) with the output the same probe recorded on R7A2-FREEZE-1 (the
// R7-A.2 author runs, the R7-A.2 engineering judge's outputs and the R7-A.2 SSCTR runs), byte for byte and, where they differ, by the first JSON
// paths that differ (folder names normalized for the round-12 instrument). Reads only; writes COMPARE_R7AF.json next to this file.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),A2='audits/domain-coaching-r7a2-2026-10-28/';
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runs=JSON.parse(fs.readFileSync(path.join(here,'EVIDENCE_RUNS_R7AF.json'),'utf8')).runs;
const refOf=name=>name.startsWith('qe2-')?A2+'reviews/qe-r7a2-'+name.slice(4)+'.out.json':name.startsWith('ssctr2-')?A2+'reviews/runs/'+name.slice(7)+'.out.json':name==='r7af-self-challenge'?null:A2+'probes/runs/'+name+'.out.json';
const diff=(a,b,at='',out=[])=>{if(out.length>=12)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,out);return out;}out.push({path:at,before:JSON.stringify(a)?.slice(0,220)??null,now:JSON.stringify(b)?.slice(0,220)??null});return out;};
const parse=s=>{try{return JSON.parse(s);}catch{return null;}};
const rows=[];
for(const r of runs){
 const ref=refOf(r.name),mine=path.posix.join('audits/domain-coaching-r7a-final-2026-10-28/probes',r.output);
 if(!ref||!fs.existsSync(path.join(root,ref))){rows.push({name:r.name,reference:null,identical:null});continue;}
 const same=sha(ref)===sha(mine);
 rows.push({name:r.name,reference:ref,identical:same,...(same?{}:{differences:diff(parse(read(ref)),parse(read(mine)))})});
}
// The round-12 instrument writes its sections next to itself: compared section by section with the folder names normalized.
const inst=(p,dir)=>parse(read(p).replaceAll(dir,'X'))?.sections??{},ia=inst(A2+'probes/runs/ssctr-instrument.data.json','domain-coaching-r7a2-2026-10-28/probes'),ib=fs.existsSync(path.join(here,'runs/ssctr-instrument.data.json'))?inst('audits/domain-coaching-r7a-final-2026-10-28/probes/runs/ssctr-instrument.data.json','domain-coaching-r7a-final-2026-10-28/probes'):{};
const instrument={sections:Object.keys(ib).length,differentFromFreeze1:Object.keys({...ia,...ib}).filter(k=>JSON.stringify(ia[k])!==JSON.stringify(ib[k]))};
const out={revision:'R7AF-COMPARE-1',comparedAt:new Date().toISOString(),against:'R7A2-FREEZE-1 outputs recorded by R7-A.2 (author runs, engineering judge, SSCTR runs)',identical:rows.filter(x=>x.identical===true).map(x=>x.name),different:rows.filter(x=>x.identical===false).map(x=>x.name),noReference:rows.filter(x=>x.identical===null).map(x=>x.name),instrument,rows};
fs.writeFileSync(path.join(here,'COMPARE_R7AF.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({identical:out.identical.length,different:out.different,noReference:out.noReference,instrument},null,1));
