// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §27: "any difference must have a named cause"): compares every output of the evidence round
// with its predecessor reference, byte for byte and with machine paths, tree labels and clocks removed.
// - kit: the SSCTR kit against the decision authority closure's kit-final (the same 43 jobs on R7A-DECISION-AUTHORITY-FREEZE-1);
// - judges: the 35 earlier judge probes against that closure's re-run on the same predecessor bytes;
// - findings, asc, r7asc-qe, self-challenge: the candidate's output against the predecessor copy's, run in this round.
// Writes probes/COMPARISON_R7ARA.json; prints its summary.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),sha=b=>createHash('sha256').update(b).digest('hex');
const DA='audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/';
const ev=JSON.parse(fs.readFileSync(path.join(here,'EVIDENCE_RUNS_R7ARA.json'),'utf8'));
const read=p=>fs.existsSync(p)?fs.readFileSync(p):null;
const DROP=new Set(['root','runtime','ROOT','rootUsed','tree','TREE','generatedAt','ranAt','node','seconds','durationMs','elapsedMs','at']);
const strip=b=>{if(!b)return null;try{const f=x=>Array.isArray(x)?x.map(f):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!DROP.has(k)).map(([k,v])=>[k,f(v)])):typeof x==='string'?x.replace(/[A-Za-z]:\/Users\/[^"]*?MyApp\//g,'').replace(/\/home\/user\/MyApp\//g,'').replace(/audits\/domain-coaching-r7a-residual-authority-2026-10-30\/decision-authority-freeze-source\/CoachingCore/g,'<TREE>').replace(/^CoachingCore$/,'<TREE>'):x;return JSON.stringify(f(JSON.parse(b.toString())));}catch{return null;}};
const verdict=(a,b)=>!a||!b?'MISSING':sha(a)===sha(b)?'IDENTICAL':strip(a)!==null&&strip(a)===strip(b)?'LABEL_OR_CLOCK_ONLY':'DIFFERENT';
const out={revision:'R7ARA-COMPARISON-1',generatedAt:new Date().toISOString(),sourceDigest:ev.sourceDigest,groups:{}};
const put=(g,row)=>{(out.groups[g]??=[]).push(row);};
for(const r of ev.runs){
 const mine=read(path.join(repo,r.output));
 if(r.group==='kit')put('kit',{name:r.name,exit:r.exit,verdict:verdict(read(path.join(repo,DA,'kit-final',r.name+'.out.json')),mine)});
 else if(r.group==='judges')put('judges',{name:r.name,exit:r.exit,verdict:verdict(read(path.join(repo,DA,'judges',r.name+'.out.json')),mine)});
 else if(['findings','asc','r7asc-qe'].includes(r.group)&&r.name.endsWith('.cand')){const base=r.name.slice(0,-5),pred=ev.runs.find(x=>x.group===r.group&&x.name===base+'.pred');put(r.group,{name:base,exit:r.exit,predExit:pred?.exit??null,verdict:verdict(pred?read(path.join(repo,pred.output)):null,mine)});}
}
const count=list=>({jobs:list.length,identical:list.filter(x=>x.verdict==='IDENTICAL').length,labelOrClockOnly:list.filter(x=>x.verdict==='LABEL_OR_CLOCK_ONLY').length,different:list.filter(x=>x.verdict==='DIFFERENT').map(x=>x.name),missing:list.filter(x=>x.verdict==='MISSING').map(x=>x.name),failed:list.filter(x=>x.exit!==0).map(x=>x.name)});
out.summary=Object.fromEntries(Object.entries(out.groups).map(([g,l])=>[g,count(l)]));
fs.writeFileSync(path.join(here,'COMPARISON_R7ARA.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary,null,1));
