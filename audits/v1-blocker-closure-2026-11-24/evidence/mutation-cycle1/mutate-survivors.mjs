// Copied from audits/v1-blocker-closure-2026-11-24/reviews/qre/probes/mutate-survivors.mjs (QRE BC R1), unchanged; it writes its output next to itself (this folder).
// QRE BC R1: the survivors of mutate-run-bc.mjs re-run against a larger set: --set=boundary (every test file that reaches src/boundary) or
// --set=all (the full suite). Baseline-aware as mutate-run-bc.mjs (a kill is a title green without the mutant). In memory only.
// Run from a CoachingCore/ copy of 6e85222: node <this> --set=boundary|all --only=ID,ID [--jobs=3]
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),hook=pathToFileURL(path.join(HERE,'mutate-hook.mjs')).href;
const src=fs.readFileSync(path.join(HERE,'mutate-run-bc.mjs'),'utf8'),M=eval(src.slice(src.indexOf('const M=[')+8,src.indexOf('];\nconst FOCAL')+1));
const arg=k=>process.argv.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3),set=arg('set')??'boundary',only=arg('only').split(','),jobs=Number(arg('jobs')??3);
const files=set==='all'?[]:fs.readdirSync('test').filter(f=>f.endsWith('.test.mjs')&&/boundary\/|v1int-helpers/.test(fs.readFileSync(path.join('test',f),'utf8'))).map(f=>'test/'+f);
function run(file,from,to){return new Promise(res=>{const mut=Buffer.from(JSON.stringify({file,from,to})).toString('base64');
 const c=spawn(process.execPath,['--import',hook,'--test',...files],{env:{...process.env,MUT:mut}});let text='';c.stdout.on('data',d=>text+=d);c.stderr.on('data',d=>text+=d);
 c.on('close',()=>res({applied:!/MUTANT NOT APPLIED/.test(text),failing:[...new Set([...text.matchAll(/^✖ (.+?) \(\d/mg)].map(m=>m[1]))].filter(t=>t!=='failing tests:'),
  pass:Number((text.match(/ℹ pass (\d+)/)??[])[1]),fail:Number((text.match(/ℹ fail (\d+)/)??[])[1])}));});}
const base=await run('__none__.mjs','x','x'),B=new Set(base.failing);console.log('baseline',set,files.length||'all','pass',base.pass,'fail',base.fail);
const out=[],queue=M.filter(m=>only.includes(m[0]));
async function worker(){for(let m=queue.shift();m;m=queue.shift()){const r=await run(m[1],m[2],m[3]),k=r.failing.filter(t=>!B.has(t));
 const line={id:m[0],set,applied:r.applied,pass:r.pass,fail:r.fail,verdict:!r.applied?'NOT_APPLIED':k.length?'KILLED':'SURVIVED',killers:k.slice(0,3)};out.push(line);console.log(JSON.stringify(line));}}
await Promise.all(Array.from({length:jobs},worker));
fs.writeFileSync(path.join(HERE,`mutation-survivors-${set}.json`),JSON.stringify(out,null,1)+'\n');
