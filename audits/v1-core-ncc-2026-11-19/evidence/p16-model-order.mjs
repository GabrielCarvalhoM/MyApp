// Normalization Consistency: why the P16 fixture's digests move (Mac package). Replays the P16 journey of audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs on two
// repository roots through each root's own AIF harness and lists every differing answer path, grouped; then compares each answer's learning model
// field by field as sets. Usage: node p16-model-order.mjs <FREEZE-4 repo root> <candidate repo root>. Read-only. Expected on this line: only
// updatedModel.excluded differs in order (equal as a set), and the hashes over it (model hash, trace hashes, the next review's input hash).
import path from 'node:path';import {pathToFileURL} from 'node:url';
const run=async root=>{const L=await import(pathToFileURL(path.join(root,'audits/v1-app-integration-foundation-2026-11-16/harness/lib.mjs')).href),Sc=await import(pathToFileURL(path.join(root,'audits/v1-app-integration-foundation-2026-11-16/harness/scenario.mjs')).href);
 const c=L.createClient(),answers=[];answers.push(c.onboard(Sc.athleteA({weeks:16})));
 for(let w=0;w<16;w++){const live=Sc.liveSessions(c.envelope,w),onRecord=Sc.reportedInPlan(c.envelope),first=live.find(s=>!onRecord.has(s.id));
  if(first&&first.date<Sc.addDays(c.envelope.program.startDate,w*7+6))answers.push(c.review('WEEKLY_REVIEW',Sc.at(first.date),{eligibility:Sc.ELIG(first.date),observations:[Sc.reportOf(c.envelope,first,{tag:'p0'})]}));
  const f=Sc.weekFacts(c.envelope,w,{tag:'p0'});answers.push(c.review('WEEKLY_REVIEW',f.asOf,f.facts));}return answers;};
const [a,b]=await Promise.all(process.argv.slice(2,4).map(run));
const top=new Map();const walk=(x,y,p,root)=>{if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],p+'.'+k,root);return;}const key=p.replace(/\.\d+/g,'.#');top.set(key,(top.get(key)??0)+1);};
a.forEach((r,i)=>{for(const k of Object.keys(r))walk(r[k],b[i][k],k,i);});
console.log([...top.entries()].sort((x,y)=>y[1]-x[1]).slice(0,25).map(([k,v])=>v+'  '+k).join('\n'));
// is the model's content the same as sets?
const canon=v=>JSON.stringify(v);const setOf=l=>(l??[]).map(canon).sort().join('\n');
let sameSets=true,detail=[];a.forEach((r,i)=>{const x=r.updatedModel,y=b[i].updatedModel;if(!x)return;for(const k of Object.keys(x)){if(Array.isArray(x[k])){if(setOf(x[k])!==setOf(y[k])){sameSets=false;detail.push(i+':'+k+' '+x[k].length+'->'+y[k].length);}}else if(!['hash','revision','asOf'].includes(k)&&canon(x[k])!==canon(y[k])){sameSets=false;detail.push(i+':'+k);}}});
console.log('updatedModel equal as sets:',sameSets,detail.slice(0,12).join(' | '));
const others=[...top.keys()].filter(k=>!k.startsWith('updatedModel')&&!/trace|inputHash|hash$/.test(k));console.log('other differing paths:',others.slice(0,20));
