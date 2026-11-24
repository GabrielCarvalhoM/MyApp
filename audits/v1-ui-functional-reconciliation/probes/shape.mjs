// Prints the key paths of captured JSON (arrays merged as []), with the JS type and a short example: a compact view of the real shapes.
import fs from 'node:fs';
const paths=new Map();
function walk(x,p){const t=x===null?'null':Array.isArray(x)?'array':typeof x;
 const e=paths.get(p)??{types:new Set(),ex:undefined};e.types.add(t);if(e.ex===undefined&&t!=='object'&&t!=='array')e.ex=JSON.stringify(x)?.slice(0,60);paths.set(p,e);
 if(t==='array')x.forEach(v=>walk(v,p+'[]'));else if(t==='object')for(const[k,v]of Object.entries(x))walk(v,p+'.'+(/^w\d|^[0-9a-f]{16}|^[A-Za-z0-9_-]{20,}$/.test(k)?'<key>':k));}
const [file,maxDepth='99']=process.argv.slice(2);walk(JSON.parse(fs.readFileSync(file,'utf8')),'$');
for(const[p,e]of paths){if(p.split(/[.[]/).length-1>+maxDepth)continue;console.log(p,[...e.types].join('|'),e.ex??'');}
