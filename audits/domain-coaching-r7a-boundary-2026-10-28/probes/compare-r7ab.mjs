// DOMAIN_COACHING_R7-A boundary comparison: each output of run-evidence-r7ab.mjs against the same probe's output recorded on R7A-FINAL-FREEZE
// (the R7-A final author's runs, its engineering judge's and its SSCTR's outputs), byte for byte; a differing JSON output also gets its first
// differing paths. This mission's self-challenge has no earlier output: its run on the R7A-FINAL-FREEZE copy is the comparison. Read-only
// except COMPARE_R7AB.json next to this file. Usage: node compare-r7ab.mjs
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),FP=path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/probes/runs'),FR=path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/reviews');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const ev=JSON.parse(fs.readFileSync(path.join(here,'EVIDENCE_RUNS_R7AB.json'),'utf8'));
const recorded=name=>{
 if(fs.existsSync(path.join(FP,name+'.out.json')))return path.join(FP,name+'.out.json');
 let m=/^qe7af-(P\d+[a-z]?)(?:\.(.+))?$/.exec(name);if(m)return path.join(FR,`qe-r7af-${m[1]}${m[2]?'.'+m[2]:''}.out.json`);
 m=/^ssctr7af-(.+)$/.exec(name);if(m)return path.join(FR,'ssctr-r7af-runs',m[1]+'.out.json');
 if(name==='r7ab-self-challenge')return path.join(here,'runs','r7ab-self-challenge.FINAL.out.json');
 return null;
};
const parse=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return null;}};
const paths=(a,b,at='',out=[])=>{if(out.length>=12)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))paths(a[k],b[k],at+'/'+k,out);return out;}out.push({path:at,finalFreeze:JSON.stringify(a)?.slice(0,200)??null,candidate:JSON.stringify(b)?.slice(0,200)??null});return out;};
const rows=ev.runs.filter(r=>r.name!=='r7ab-self-challenge.FINAL').map(r=>{
 const mine=path.join(here,'runs',r.name+'.out.json'),theirs=recorded(r.name);
 if(!theirs||!fs.existsSync(theirs))return {name:r.name,exit:r.exit,compared:null,reason:'no recorded output on R7A-FINAL-FREEZE'};
 const same=sha(mine)===sha(theirs),a=parse(theirs),b=parse(mine);
 return {name:r.name,exit:r.exit,compared:path.relative(root,theirs).replace(/\\/g,'/'),identical:same,candidateSha256:sha(mine),finalFreezeSha256:sha(theirs),...(same?{}:{firstDifferences:a&&b?paths(a,b):'not JSON'})};
});
const out={revision:'R7AB-COMPARE-1',generatedAt:new Date().toISOString(),sourceDigest:[...new Set(ev.runs.map(r=>r.sourceDigestStart+'/'+r.sourceDigestEnd))],summary:{runs:rows.length,identical:rows.filter(r=>r.identical).length,different:rows.filter(r=>r.identical===false).map(r=>r.name),uncompared:rows.filter(r=>r.compared===null).map(r=>r.name),failed:ev.runs.filter(r=>r.exit!==0).map(r=>r.name)},rows};
fs.writeFileSync(path.join(here,'COMPARE_R7AB.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary,null,1));
