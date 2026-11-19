// SEC-R2-03 differential: the FREEZE-3 normalizer (a6e10d0) vs this tree on generated multi-pass records (the same prior fed to both).
// Usage: node differential.mjs <old CoachingCore> <new CoachingCore> [cases=3000] [seed=20261119]; MONO=1 gives a monotone arrival clock and
// no replays (new reports never dated before the record carried). KIND=unexplained|newOrphan|lost|double SHOW=n prints samples.
// Outputs must be identical unless the FREEZE-3 output holds an in-pass orphan, a replacement by a refused report, or a second row in force
// on one identity; the candidate must never write an orphan or a second row in force, and must never lose a row in force without replacement.
import {pathToFileURL} from 'node:url';
import path from 'node:path';import fs from 'node:fs';
const [oldRoot,newRoot]=process.argv.slice(2,4),N=Number(process.argv[4]??3000),SEED=Number(process.argv[5]??20261119);
const load=r=>import(pathToFileURL(path.join(r,'src/r6-provenance.mjs')).href);
const OLD=(await load(oldRoot)).normalizeObservations,NEW=(await load(newRoot)).normalizeObservations;
let s=SEED;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const pick=a=>a[Math.floor(rnd()*a.length)];
const ATH='ath-d',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const identity=o=>o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??(o.provenance?.provider??'MANUAL')+'@'+o.observedAt);
const canon=x=>JSON.stringify(x);
const ACTUALS=[{completed:true,minutes:40},{completed:true,minutes:41},{completed:true,minutes:20},{completed:false,minutes:0},{completed:true,minutes:45}];
function gen(){
 const k=2+Math.floor(rnd()*3),sessions=[];
 for(let i=0;i<k;i++)sessions.push({sid:rnd()<0.65?'s'+i:null,act:rnd()<0.5?'hk-'+i:null,day:shift(DAY,-(2+i*3))});
 const ev=[];let n=0,t=0;
 const at=(d)=>process.env.MONO?new Date(Date.parse(shift(DAY,-1)+'T00:00:00Z')+(t++)*60000).toISOString():d+'T'+String(10+Math.floor((t++)/60)%12).padStart(2,'0')+':'+String(t%60).padStart(2,'0')+':00Z';
 for(const [i,x] of sessions.entries()){
  const b={athleteId:ATH,...(x.sid?{sessionId:x.sid}:{}),observedAt:x.day+'T09:00:00Z',context:{sport:pick(['RUN','RUN','STRENGTH']),sessionType:'RUN_EASY'},response:U};
  ev.push({...b,eventId:'M'+i,reportedAt:at(x.day),actual:{...pick(ACTUALS.slice(0,3))},source:{provider:'MANUAL'}});
  if(x.act&&rnd()<0.8)ev.push({...b,eventId:'W'+i,reportedAt:at(x.day),actual:{...pick(ACTUALS.slice(0,3))},source:{provider:'HEALTHKIT',activityId:x.act,quality:'WEARABLE_FULL'},canonicalActivityId:x.act});
 }
 const m=1+Math.floor(rnd()*4);
 for(let j=0;j<m;j++){
  const target=rnd()<0.08?{eventId:'nope',observedAt:DAY+'T01:00:00Z',reportedAt:DAY+'T01:00:00Z',athleteId:ATH,context:{sport:'RUN'},response:U,source:{provider:'MANUAL'},actual:{completed:true,minutes:10}}:pick(ev);
  const day=String(target.observedAt).slice(0,10),when=at(day);
  const ids=ev.map(e=>e.eventId),kind=rnd();
  const eventId=kind<0.15?pick(ids):kind<0.22?target.eventId:'C'+(n++)+'-'+j;
  const c={...target,eventId,correctionOf:target.eventId,correctedAt:when,reportedAt:when,actual:rnd()<0.07?{completed:true,minutes:'x'}:{...pick(ACTUALS)}};
  const r=rnd();
  if(r<0.12){const o=pick(sessions.filter(z=>z.act));if(o){c.source={provider:'HEALTHKIT',activityId:o.act,quality:'WEARABLE_FULL'};c.canonicalActivityId=o.act;}}
  else if(r<0.17)c.athleteId='someone-else';
  else if(r<0.22)c.correctionOf=pick(ids.filter(x=>x!==target.eventId).concat(['nope']));
  ev.push(c);
 }
 // replays
 for(let j=0;j<2;j++)if(rnd()<(process.env.MONO?0:0.3))ev.push(JSON.parse(JSON.stringify(pick(ev))));
 // split in order into passes
 const passes=[[],[],[]];
 ev.forEach((e,i)=>passes[Math.min(2,Math.floor(i/Math.max(1,Math.ceil(ev.length/3))))].push(e));
 return passes;
}
const rec=n=>[...n.accepted,...n.supersededRows];
const holds=(rows,R)=>rows.some(x=>x!==R&&(x.eventId===R.supersededBy||(x.provenance?.mergedSourceIds??[]).includes(R.supersededBy))&&identity(x)===identity(R));
const orphansOf=n=>{const rows=rec(n);return n.supersededRows.filter(R=>n.superseded.some(e=>e.eventId===R.eventId&&e.supersededBy===R.supersededBy)&&!holds(rows,R));};
const rejectedRetire=n=>{const bad=new Set([...n.excluded.map(e=>e.eventId),...n.duplicates.filter(d=>d.reason==='EXACT_REPLAY').map(d=>d.eventId)]);return n.superseded.some(e=>bad.has(e.supersededBy)&&!n.accepted.some(x=>x.eventId===e.supersededBy));};
const stats={newDouble:0,doubleBoth:0,lostCarriedReRejected:0,lostOther:0,cases:0,passes:0,identical:0,explained:0,unexplained:0,newOrphans:0,lostInForce:0,oldOrphanPasses:0,nondeterministic:0};
const samples=[];
for(let c=0;c<N;c++){
 stats.cases++;const passes=gen();let prior=[];
 for(const [p,batch] of passes.entries()){
  if(!batch.length)continue;stats.passes++;
  const o={athleteId:ATH,asOf:DAY+'T0'+(p+1)+':00:00Z',maximumAgeDays:36500,prior:JSON.parse(JSON.stringify(prior)),incoming:true};
  const a=OLD(batch,{...o,prior:JSON.parse(JSON.stringify(prior))}),b=NEW(batch,{...o,prior:JSON.parse(JSON.stringify(prior))});
  const b2=NEW(JSON.parse(JSON.stringify(batch)),{...o,prior:JSON.parse(JSON.stringify(prior))});
  if(canon(b)!==canon(b2))stats.nondeterministic++;
  const double=n=>{const ids=n.accepted.map(identity);return ids.length!==new Set(ids).size;};const oo=[...orphansOf(a),...(rejectedRetire(a)?[1]:[]),...(double(a)&&!double(b)?[2]:[])];if(double(b)){stats.newDouble=(stats.newDouble??0)+1;if(double(a))stats.doubleBoth=(stats.doubleBoth??0)+1;samples.push({kind:'double',batch,prior,old:a,new:b});}if(oo.length)stats.oldOrphanPasses++;
  if(canon(a)===canon(b))stats.identical++;else if(oo.length)stats.explained++;else{stats.unexplained++;samples.push({kind:'unexplained',batch,prior,old:a,new:b});}
  if(orphansOf(b).length){stats.newOrphans++;samples.push({kind:'newOrphan',batch,prior,old:a,new:b});}
  // a row in force in the prior is never lost: still in force, merged, or replaced by a row of the same execution
  const out=rec(b);
  for(const R of prior.filter(x=>x.superseded!==true)){
   const live=b.accepted.some(x=>x.eventId===R.eventId||(x.provenance?.mergedSourceIds??[]).includes(R.eventId));
   const kept=out.find(x=>x.eventId===R.eventId&&x.superseded===true);
   if(!live&&!(kept&&holds(out,kept))){stats.lostInForce++;if(b.excluded.some(e=>e.eventId===R.eventId))stats.lostCarriedReRejected++;else stats.lostOther++;samples.push({kind:'lost',R,batch,prior,old:a,new:b});}
  }
  prior=rec(b);
 }
}
console.log(JSON.stringify({seed:SEED,...stats},null,1));
const sm=o=>o.eventId+(o.correctionOf?'<'+o.correctionOf:'')+'['+(o.sessionId??'-')+'/'+(o.canonicalActivityId??'-')+'/'+o.actual?.minutes+(o.actual?.completed===false?'x':'')+(o.athleteId!==ATH?'/OTHER':'')+']'+(o.superseded?'~'+o.supersededBy:'')+(o.conflicted?'!':'');const so=n=>n&&({acc:n.accepted.map(sm),sup:n.superseded.map(e=>e.eventId+'~'+e.supersededBy),exc:n.excluded.map(e=>e.eventId+':'+e.reason),dup:n.duplicates.map(d=>d.eventId+'>'+d.mergedInto+':'+d.reason[0]),q:n.quarantinedIdentities});const want=process.env.KIND;if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,JSON.stringify(samples.filter(x=>!want||x.kind===want)));for(const x of samples.filter(x=>!want||x.kind===want).slice(0,Number(process.env.SHOW??3)))console.log(JSON.stringify({kind:x.kind,R:x.R&&sm(x.R),prior:(x.prior??[]).map(sm),batch:x.batch.map(sm),old:so(x.old),new:so(x.new)}));
process.exitCode=stats.unexplained||stats.newOrphans||stats.lostInForce||stats.nondeterministic?1:0;
