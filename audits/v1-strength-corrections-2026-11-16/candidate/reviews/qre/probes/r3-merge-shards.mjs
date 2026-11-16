// QRE V1STR N4 recheck R3: merges the shard outputs of probe A or F (or B) into one summary. node r3-merge-shards.mjs <out.json> <shard.json>...
import fs from 'node:fs';
const [out,...files]=process.argv.slice(2);
const add=(a,b)=>{if(typeof b==='number')return (a??0)+b;if(b&&typeof b==='object'&&!Array.isArray(b)){const o={...(a??{})};for(const [k,v] of Object.entries(b))o[k]=add(o[k],v);return o;}return a;};
let counts={},examples={};const lists=(o,path='')=>{for(const [k,v] of Object.entries(o??{})){if(Array.isArray(v)){if(v.length)(examples[path+k]??=[]).push(...v.slice(0,20));}else if(v&&typeof v==='object')lists(v,path+k+'.');}};
for(const f of files){const s=JSON.parse(fs.readFileSync(f,'utf8'));counts=add(counts,s.counts??{});lists(s.tally??s);}
for(const k of Object.keys(examples))examples[k]=examples[k].slice(0,40);
const res={shards:files.length,counts,examples};
fs.writeFileSync(out,JSON.stringify(res,null,1));console.log(JSON.stringify(counts));
