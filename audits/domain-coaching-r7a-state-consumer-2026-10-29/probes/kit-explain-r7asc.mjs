// Author probe (prints only): the SSCTR's regression kit as re-run here (a folder written by run-ssctr-kit.mjs), instrument by instrument, against
// the SSCTR's own outputs on STATE-EVIDENCE-FREEZE-1 (SE, the freeze it accepted for D53, D56-D59) and on HISTORICAL-PROJECTION-FREEZE-1 (HPF1,
// the predecessor). Wall clocks and runtime labels are ignored, as in ssctr-kit-compare.mjs. Every differing leaf is sorted into a shape:
//  HASH         both values are SHA-256 digests (premise/value hashes that follow any change of the values they hash);
//  REPS_LOWER   the two values are the same row or record except for repetition counts, all lower now;
//  REPS_HIGHER  the same, all higher now;
//  NUMBER       a bare number changed (a count, a load, a step);
//  OTHER        anything else (listed in full, up to 12 per instrument).
// It reads; it judges nothing. Usage: node kit-explain-r7asc.mjs <kitFolder>
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../..'),now=path.resolve(process.argv[2]);
const REF={SE:path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs'),HPF1:path.join(root,'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs')};
const read=(dir,n)=>{const p=path.join(dir,n+'.out.json');if(!fs.existsSync(p))return undefined;try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return {unparsed:true};}};
const strip=x=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['at','runtime','root','generatedAt','tree','node'].includes(k)).map(([k,v])=>[k,strip(v)])):x;
const HEX=/^[0-9a-f]{64}$/,REPS=/(\d+)x(\d+)(?=@)/g;
const shape=(a,b)=>{
 if(typeof a==='string'&&typeof b==='string'){
  if(HEX.test(a)&&HEX.test(b))return 'HASH';
  const ra=[...a.matchAll(REPS)],rb=[...b.matchAll(REPS)];
  if(ra.length&&ra.length===rb.length&&a.replace(REPS,'$1xR')===b.replace(REPS,'$1xR')){const d=ra.map((m,i)=>Number(m[2])-Number(rb[i][2])).filter(x=>x!==0);if(d.length&&d.every(x=>x<0))return 'REPS_LOWER';if(d.length&&d.every(x=>x>0))return 'REPS_HIGHER';}
 }
 if(typeof a==='number'&&typeof b==='number')return 'NUMBER';
 return 'OTHER';
};
const leaves=(x,y,p,out)=>{if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'&&Array.isArray(x)===Array.isArray(y)){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))leaves(x[k],y[k],p+'.'+k,out);return;}out.push({path:p,now:x,ref:y});};
const names=JSON.parse(fs.readFileSync(path.join(now,'RUNS.json'),'utf8')).runs.map(r=>r.name);
const out={probe:'kit-explain-r7asc',now,instruments:{}};
for(const n of names){const a=read(now,n),row={};
 for(const [lab,dir] of Object.entries(REF)){const b=read(dir,n);if(b===undefined){row[lab]=null;continue;}const d=[];leaves(strip(a),strip(b),n,d);
  const by={};for(const x of d){const s=shape(x.now,x.ref);(by[s]??=[]).push(x);}
  row[lab]={identical:!d.length,leaves:d.length,shapes:Object.fromEntries(Object.entries(by).map(([k,v])=>[k,v.length])),...(by.OTHER?{other:by.OTHER.slice(0,12).map(x=>({path:x.path,now:JSON.stringify(x.now)?.slice(0,220)??null,ref:JSON.stringify(x.ref)?.slice(0,220)??null}))}:{}),...(by.REPS_HIGHER?{repsHigher:by.REPS_HIGHER.slice(0,12).map(x=>({path:x.path,now:x.now,ref:x.ref}))}:{})};}
 out.instruments[n]=row;}
console.log(JSON.stringify(out,null,1));
