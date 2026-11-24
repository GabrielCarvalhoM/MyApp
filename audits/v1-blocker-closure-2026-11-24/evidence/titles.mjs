// Failing test titles of a `node --test` output, without durations, deduplicated. Usage: node titles.mjs <out.txt> [<base.txt>]
import fs from 'node:fs';
const titles=f=>{const s=fs.readFileSync(f,'utf8');const set=new Set();
 for(const line of s.split(/\r?\n/)){const m=/^\s*✖ (.*?)(?: \([\d.]+m?s\))?$/.exec(line);if(!m)continue;const t=m[1].trim();if(t==='failing tests:')continue;set.add(t);}
 return set;};
const [a,b]=process.argv.slice(2),A=titles(a);
const sum=s=>{const m=fs.readFileSync(a,'utf8').match(/ℹ (tests|pass|fail) (\d+)/g);return m?m.join(' '):'';};
console.log(sum(),'| distinct failing titles',A.size);
if(b){const B=titles(b);const added=[...A].filter(t=>!B.has(t)),gone=[...B].filter(t=>!A.has(t));
 console.log('NEW failing ('+added.length+'):');for(const t of added)console.log('  + '+t);
 console.log('NO LONGER failing ('+gone.length+'):');for(const t of gone)console.log('  - '+t);}
