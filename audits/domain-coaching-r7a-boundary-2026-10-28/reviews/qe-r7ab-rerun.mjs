// R7AB-QE-r1 (independent engineering judge): re-runs the earlier judges' and authors' engineering probes (print-only scripts) against the live
// runtime, stores each stdout under reviews/qe-r7ab-runs/, and compares its SHA-256 with the author's recorded run in
// probes/EVIDENCE_RUNS_R7AB.json. It never runs the author's evidence runner, an SSCTR grid, a verifier with --write, or any freeze/prepare/
// queue/regress script. Usage: node qe-r7ab-rerun.mjs [namePrefix ...]; CONC (default 4). Writes only under reviews/qe-r7ab-runs/.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),outDir=path.join(here,'qe-r7ab-runs');
const author=JSON.parse(fs.readFileSync(path.join(here,'../probes/EVIDENCE_RUNS_R7AB.json'),'utf8')).runs;
const ENGINEERING=author.filter(r=>!/^ssctr/.test(r.name)&&!/run-evidence|ssctr-|freeze-|prepare-|queue-|regress-|verify-r/.test(r.script));
const wanted=process.argv.slice(2),jobs=wanted.length?ENGINEERING.filter(j=>wanted.some(w=>j.name.startsWith(w))):ENGINEERING;
fs.mkdirSync(outDir,{recursive:true});
const results=[];
const runOne=j=>new Promise(res=>{const t0=Date.now(),abs=path.join(root,j.script),cwd=path.dirname(abs),out=[],err=[];
 const p=spawn(process.execPath,[abs],{cwd,env:{...process.env,...j.env}});p.stdout.on('data',d=>out.push(d));p.stderr.on('data',d=>err.push(d));
 p.on('close',code=>{const buf=Buffer.concat(out);fs.writeFileSync(path.join(outDir,j.name+'.out.json'),buf);fs.writeFileSync(path.join(outDir,j.name+'.err.txt'),Buffer.concat(err));
  const sha=createHash('sha256').update(buf).digest('hex');results.push({name:j.name,exit:code,seconds:Math.round((Date.now()-t0)/100)/10,outSha256:sha,authorSha256:j.outSha256,identical:sha===j.outSha256});res();});});
const queue=[...jobs];await Promise.all(Array.from({length:Number(process.env.CONC??4)},async()=>{while(queue.length)await runOne(queue.shift());}));
results.sort((a,b)=>a.name<b.name?-1:1);
console.log(JSON.stringify({at:new Date().toISOString(),ran:results.length,identical:results.filter(r=>r.identical).length,differ:results.filter(r=>!r.identical).map(r=>r.name),failed:results.filter(r=>r.exit!==0).map(r=>r.name),results},null,1));
