// Normalization Consistency (F1/F2/F3) differential: FREEZE-4 normalizer vs this line, on generated multi-pass records (the same prior to both,
// the candidate's own output carried pass to pass). Successor of audits/v1-core-sec-r2-2026-11-19/evidence/differential.mjs (same generator and
// seed). Usage: node differential.mjs <FREEZE-4 CoachingCore> <candidate CoachingCore> [cases=3000] [seed=20261119]
// MONO=1: monotone arrival clock and no replays. SHOW=n KIND=<class> prints samples. CASES=<file> writes every row in force FREEZE-4 lost, one
// by one: how FREEZE-4 lost it, the incoming reports read before it, and where the candidate keeps it. Read-only; synthetic athletes only.
//
// Every pass whose two outputs differ is classified (first matching class):
//   F1_LOSS        FREEZE-4 drops a carried row in force (re-refused); the candidate keeps it (in force, merged, or replaced by its own chain)
//   F1_ORDER       the same reports in force on the same identities, read in record order: a carried row stays the holder, a late report merges
//                  into it (FREEZE-4 made the late report the holder), or a late conflicting report is refused against the carried row
//   F1_CHAIN       an incoming correction dated before the carried report it names: refused by both (classification of the refusal differs)
//   F2_BIND        the candidate refuses ACTIVITY_BOUND_TO_TWO_SESSIONS where the activity is held by a carried row's merged part
//   F2_FLAG_TARGET a report bound by activity to an execution whose row a correction retired: the candidate flags the row in force for that
//                  execution; FREEZE-4 flagged the retired row object after its history copy was taken, so no output row carried it
//                  (the row in force escaped the conflict)
//   F3_RESOLUTION  a valid correction of a carried execution in conflict resolves it (FREEZE-4 had dropped the quarantine on re-read, so it
//                  refused the correction or merged it into the conflicted row); as in the review that flagged the conflict. The resolving
//                  correction may itself be corrected later in the same review
//   F3_QUARANTINE  the only difference is the quarantine of a carried conflicted row's identity (FREEZE-4 dropped it on re-read)
//   PART_ACTIVITY  the only difference is the activity id now kept on merged parts (record bytes; F2 storage)
//   ORDER_ONLY     the same content in a different list order (excluded, duplicates, conflicts, superseded, quarantine)
//   UNEXPLAINED    anything else (must be 0)
// Candidate invariants (must all be 0): rows in force lost; orphans; two rows in force on one identity; one activity in force on two identities;
// re-read instability of the rows in force and their conflict flags (the output normalized again with nothing new, at a later clock), and any
// difference between that re-read and the same after a JSON round trip; nondeterminism. Quarantine-only re-read differences are classified:
//   REFUSED_IDENTITY  a refused report's own identity, quarantined in its pass only (nothing flagged on it; O-1 family, not F3)
//   FLAGGED_LATER     a row flagged in force by event-id reuse whose identity the pass did not quarantine; every re-read does (stricter)
//   other             must be 0
// nondeterminism.
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
const canon=x=>JSON.stringify(x),json=x=>JSON.parse(JSON.stringify(x));
const ACTUALS=[{completed:true,minutes:40},{completed:true,minutes:41},{completed:true,minutes:20},{completed:false,minutes:0},{completed:true,minutes:45}];
// The generator of the SEC-R2 differential, unchanged (same seed gives the same records).
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
 for(let j=0;j<2;j++)if(rnd()<(process.env.MONO?0:0.3))ev.push(JSON.parse(JSON.stringify(pick(ev))));
 const passes=[[],[],[]];
 ev.forEach((e,i)=>passes[Math.min(2,Math.floor(i/Math.max(1,Math.ceil(ev.length/3))))].push(e));
 return passes;
}
const rec=n=>[...n.accepted,...n.supersededRows];
const holds=(rows,R)=>rows.some(x=>x!==R&&(x.eventId===R.supersededBy||(x.provenance?.mergedSourceIds??[]).includes(R.supersededBy))&&identity(x)===identity(R));
const orphansOf=n=>{const rows=rec(n);return n.supersededRows.filter(R=>n.superseded.some(e=>e.eventId===R.eventId&&e.supersededBy===R.supersededBy)&&!holds(rows,R));};
const lostOf=(n,prior)=>{const out=rec(n);return prior.filter(x=>x.superseded!==true).filter(R=>{const live=n.accepted.some(x=>x.eventId===R.eventId||(x.provenance?.mergedSourceIds??[]).includes(R.eventId));const kept=out.find(x=>x.eventId===R.eventId&&x.superseded===true);return !live&&!(kept&&holds(out,kept));});};
const doubleId=n=>{const ids=n.accepted.map(identity);return ids.length!==new Set(ids).size;};
const actsOf=o=>[o.source?.activityId??o.canonicalActivityId??null,...Object.values(o.provenance?.parts??{}).map(p=>p?.activityId??null)].filter(Boolean);
const doubleAct=n=>{const m=new Map();for(const o of n.accepted)for(const a of actsOf(o)){if(!m.has(a))m.set(a,new Set());m.get(a).add(identity(o));}return [...m.values()].some(v=>v.size>1);};
const stripPartActs=n=>{const c=json(n);for(const o of [...c.accepted,...c.observations,...c.supersededRows])for(const p of Object.values(o.provenance?.parts??{}))if(p&&typeof p==='object')delete p.activityId;return c;};
const sorted=n=>{const c=json(n);for(const k of ['excluded','duplicates','conflicts','superseded','quarantinedIdentities'])c[k]=[...c[k]].map(canon).sort();return c;};
const inForce=n=>n.accepted.map(o=>identity(o)+'='+[...new Set(o.provenance?.mergedSourceIds??[o.eventId])].sort().join('+')+(o.conflicted?'!':'')).sort();
const inForceSets=n=>n.accepted.map(o=>identity(o)+'='+[...new Set([o.eventId,...(o.provenance?.mergedSourceIds??[])])].sort().join('+')).sort();
function classify(a,b,prior,batch){
 if(lostOf(a,prior).length&&!lostOf(b,prior).length)return 'F1_LOSS';
 {const carriedConflict=prior.filter(p=>p.superseded!==true&&p.conflicted===true);
  const resolvedBy=n=>new Set(n.superseded.filter(e=>carriedConflict.some(p=>p.eventId===e.eventId)&&batch.some(o=>o.eventId===e.supersededBy&&o.correctionOf)).map(e=>e.eventId+'~'+e.supersededBy));
  {const ra=resolvedBy(a);if([...resolvedBy(b)].some(k=>!ra.has(k)))return 'F3_RESOLUTION';}
  if(carriedConflict.some(p=>b.supersededRows.some(x=>x.eventId===p.eventId&&x.superseded===true&&batch.some(o=>o.eventId===x.supersededBy&&o.correctionOf)&&b.accepted.some(y=>y.eventId===x.supersededBy&&identity(y)===identity(p)))))return 'F3_RESOLUTION';}
 const a1=stripPartActs(a),b1=stripPartActs(b);
 if(canon(a1)===canon(b1))return 'PART_ACTIVITY';
 if(canon(sorted(a1))===canon(sorted(b1)))return 'ORDER_ONLY';
 // F3: only the quarantine differs, and what the candidate adds are identities of carried rows in force flagged conflicted
 {const qa=new Set(a1.quarantinedIdentities),extra=b1.quarantinedIdentities.filter(q=>!qa.has(q)),x=sorted(a1),y=sorted(b1);x.quarantinedIdentities=y.quarantinedIdentities=[];
  if(extra.length&&canon(x)===canon(y)&&extra.every(q=>b1.accepted.some(o=>identity(o)===q&&o.conflicted===true&&prior.some(p=>p.eventId===o.eventId&&p.conflicted===true))))return 'F3_QUARANTINE';}
 // F2: the candidate refuses a report whose activity a carried row holds as a merged part, for another identity
 const partActs=new Map();for(const p of prior.filter(x=>x.superseded!==true))for(const [id,part] of Object.entries(p.provenance?.parts??{}))if(part?.activityId&&p.provenance?.activityId!==part.activityId)partActs.set(part.activityId,identity(p));
 if(b.excluded.some(e=>e.reason==='ACTIVITY_BOUND_TO_TWO_SESSIONS'&&!a.excluded.some(f=>f.eventId===e.eventId&&f.reason===e.reason)&&batch.some(o=>o.eventId===e.eventId&&partActs.has(o.source?.activityId??o.canonicalActivityId))))return 'F2_BIND';
 // F2 flag target: an activity bound to an execution a correction retired: the candidate flags the row in force, FREEZE-4 the history row
 {const AB='ACTIVITY_BOUND_TO_TWO_SESSIONS',fa=new Set(a.accepted.filter(o=>o.conflicted).map(o=>o.eventId));
  const moved=b.accepted.filter(o=>o.conflicted&&o.provenance?.conflict===AB&&!fa.has(o.eventId));
  if(moved.length&&canon(inForceSets(a))===canon(inForceSets(b))&&moved.every(o=>a.conflicts.some(c=>c.reason===AB&&a.superseded.some(e=>e.eventId===c.eventIds[0])&&a.supersededRows.some(h=>h.eventId===c.eventIds[0]&&identity(h)===identity(o)))))return 'F2_FLAG_TARGET';}
 // F1 chain: an incoming correction of a carried report, dated before that report was available, refused by both
 const avail=o=>Date.parse(o.correctedAt??o.reportedAt);
 const early=batch.filter(o=>o.correctionOf&&prior.some(p=>(p.eventId===o.correctionOf||(p.provenance?.mergedSourceIds??[]).includes(o.correctionOf))&&avail(o)<avail(p)));
 if(early.length&&early.every(o=>!a.accepted.some(x=>x.eventId===o.eventId)&&!b.accepted.some(x=>x.eventId===o.eventId))&&canon(inForceSets(a))===canon(inForceSets(b)))return 'F1_CHAIN';
 // F1 order: a carried row in force read before a late report with an earlier clock
 const late=batch.some(o=>prior.some(p=>p.superseded!==true&&avail(o)<avail(p)));
 const carriedKept=prior.filter(p=>p.superseded!==true).every(p=>b.accepted.some(x=>x.eventId===p.eventId||(x.provenance?.mergedSourceIds??[]).includes(p.eventId))||b.supersededRows.some(x=>x.eventId===p.eventId&&holds(rec(b),x)));
 if(late&&carriedKept)return 'F1_ORDER';
 // superseded-first: a carried report kept as history now meets an incoming report reusing its event id (QRE-R6-14), where FREEZE-4 read the
 // incoming report first because the history row sorted after it
 const histIds=new Set(prior.filter(p=>p.superseded===true).flatMap(p=>[p.eventId,...(p.provenance?.mergedSourceIds??[])]));
 if(b.excluded.some(e=>e.reason==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'&&histIds.has(e.eventId)&&!a.excluded.some(f=>f.eventId===e.eventId&&f.reason===e.reason))&&carriedKept)return 'F1_ORDER';
 return 'UNEXPLAINED';
}
const stats={seed:SEED,mono:!!process.env.MONO,cases:0,passes:0,identical:0,classes:{},candidate:{lostInForce:0,orphans:0,doubleIdentity:0,doubleActivity:0,rereadUnstable:0,roundTripUnstable:0,nondeterministic:0,rereadQuarantine:{REFUSED_IDENTITY:0,FLAGGED_LATER:0,other:0}},freeze4:{lostInForce:0,lostPasses:0,doubleActivity:0,rereadUnstable:0,rereadQuarantine:{REFUSED_IDENTITY:0,FLAGGED_LATER:0,other:0}}};
const samples=[],lostCases=[];
// One FREEZE-4 loss: the refusal it met when re-read, the incoming reports that sorted before it (FREEZE-4 read them first), and the candidate.
const HOW={DUPLICATE_CONFLICT_QUARANTINED:'a late report of the same execution, conflicting, read first: it became the row and the carried one was refused as the conflict',
 ACTIVITY_BOUND_TO_TWO_SESSIONS:'a late report carrying the same watch activity for another session, read first: it bound the activity and the carried row was refused',
 INVALID_CORRECTION_CHAIN:'a carried correction whose original was no longer found when it was read: a late report read first had taken the original\'s event id or evicted it',
 EVENT_ID_REUSED_WITH_DIFFERENT_FACTS:'a late report reusing the carried row\'s event id, read first: the carried row was refused as the reuse',
 IDENTITY_QUARANTINED_BY_CONFLICT:'a late conflicting report read first quarantined the identity, and the carried row was refused by that quarantine'};
function lostCase(c,p,R,batch,prior,a,b){
 const avail=o=>Date.parse(o.correctedAt??o.reportedAt??o.observedAt),refusal=a.excluded.find(e=>e.eventId===R.eventId)?.reason??null;
 const before=batch.filter(o=>avail(o)<avail(R)||avail(o)===avail(R)&&String(o.eventId)<String(R.eventId));
 const live=b.accepted.find(x=>x.eventId===R.eventId),merged=b.accepted.find(x=>x.eventId!==R.eventId&&(x.provenance?.mergedSourceIds??[]).includes(R.eventId)),rep=b.supersededRows.find(x=>x.eventId===R.eventId&&x.superseded===true);
 const where=live?(live.conflicted?'in force, flagged conflicted ('+live.provenance?.conflict+')':'in force'):merged?'merged into '+merged.eventId:rep?'replaced by '+rep.supersededBy+' (a valid correction in this review)':'LOST';
 return {case:c,pass:p,row:R.eventId+(R.correctionOf?'<'+R.correctionOf:''),identity:identity(R),freeze4:refusal?{refused:refusal,how:HOW[refusal]??refusal}:{refused:null,how:'not refused: left the record as a replaced row whose replacement is not in force'},
  readFirst:before.map(o=>o.eventId+(o.correctionOf?'<'+o.correctionOf:'')+(o.athleteId!==ATH?' (other athlete)':'')),sameOnFreeze3:F3N?lostOf(F3N(json(batch),{athleteId:ATH,asOf:DAY+'T0'+(p+1)+':00:00Z',maximumAgeDays:36500,incoming:true,prior:json(prior)}),prior).some(x=>x.eventId===R.eventId):null,candidate:where};}
const F3N=process.env.FREEZE3?(await load(process.env.FREEZE3)).normalizeObservations:null;
const rereadOf=(F,n,asOf)=>F([],{athleteId:ATH,asOf,maximumAgeDays:36500,prior:json(rec(n))});
const stableOf=(n,m)=>canon(inForce(n))===canon(inForce(m));
const qClass=(n,m)=>{const a=new Set(n.quarantinedIdentities),b=new Set(m.quarantinedIdentities),out=[];
 for(const q of a)if(!b.has(q))out.push(n.accepted.some(o=>identity(o)===q&&o.conflicted===true)?'other':'REFUSED_IDENTITY');
 for(const q of b)if(!a.has(q))out.push(n.accepted.some(o=>identity(o)===q&&o.conflicted===true&&o.provenance?.conflict==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS')?'FLAGGED_LATER':'other');
 return out;};
for(let c=0;c<N;c++){
 stats.cases++;const passes=gen();let prior=[];
 for(const [p,batch] of passes.entries()){
  if(!batch.length)continue;stats.passes++;
  const o={athleteId:ATH,asOf:DAY+'T0'+(p+1)+':00:00Z',maximumAgeDays:36500,incoming:true};
  const a=OLD(json(batch),{...o,prior:json(prior)}),b=NEW(json(batch),{...o,prior:json(prior)}),b2=NEW(json(batch),{...o,prior:json(prior)});
  if(canon(b)!==canon(b2))stats.candidate.nondeterministic++;
  const lb=lostOf(b,prior),la=lostOf(a,prior);
  stats.candidate.lostInForce+=lb.length;stats.freeze4.lostInForce+=la.length;if(la.length)stats.freeze4.lostPasses++;
  if(orphansOf(b).length)stats.candidate.orphans++;if(doubleId(b))stats.candidate.doubleIdentity++;if(doubleAct(b))stats.candidate.doubleActivity++;if(doubleAct(a))stats.freeze4.doubleActivity++;
  // re-read with nothing new (the canonical record and the next review read it so), at a later clock, and after a JSON round trip
  const asOf2=DAY+'T0'+(p+1)+':30:00Z',rb=rereadOf(NEW,b,asOf2),rbt=rereadOf(NEW,json(b),asOf2),ra=rereadOf(OLD,a,asOf2);
  if(!stableOf(b,rb)){stats.candidate.rereadUnstable++;samples.push({kind:'rereadUnstable',batch,prior,old:a,new:b,reread:rb});}
  for(const k of new Set(qClass(b,rb))){stats.candidate.rereadQuarantine[k]++;if(k==='other')samples.push({kind:'rereadQuarantineOther',batch,prior,old:a,new:b,reread:rb});}
  if(canon(rb)!==canon(rbt))stats.candidate.roundTripUnstable++;
  if(!stableOf(a,ra))stats.freeze4.rereadUnstable++;for(const k of new Set(qClass(a,ra)))stats.freeze4.rereadQuarantine[k]++;
  if(lb.length)samples.push({kind:'candidateLost',batch,prior,old:a,new:b});
  for(const R of la)lostCases.push(lostCase(c,p,R,batch,prior,a,b));
  if(canon(a)===canon(b))stats.identical++;else{const k=classify(a,b,prior,batch);stats.classes[k]=(stats.classes[k]??0)+1;if(k==='UNEXPLAINED'||process.env.KIND===k)samples.push({kind:k,batch,prior,old:a,new:b});}
  prior=rec(b);
 }
}
console.log(JSON.stringify(stats,null,1));
const sm=o=>o.eventId+(o.correctionOf?'<'+o.correctionOf:'')+'['+(o.sessionId??'-')+'/'+(o.canonicalActivityId??'-')+'/'+o.actual?.minutes+(o.actual?.completed===false?'x':'')+(o.athleteId!==ATH?'/OTHER':'')+'@'+String(o.correctedAt??o.reportedAt).slice(5,16)+']'+(o.superseded?'~'+o.supersededBy:'')+(o.conflicted?'!':'')+(o.provenance?.mergedSourceIds?.length>1?'{'+o.provenance.mergedSourceIds.join(',')+'}':'');
const so=n=>n&&({acc:n.accepted.map(sm),sup:n.superseded.map(e=>e.eventId+'~'+e.supersededBy),exc:n.excluded.map(e=>e.eventId+':'+e.reason),dup:n.duplicates.map(d=>d.eventId+'>'+d.mergedInto+':'+d.reason[0]),q:n.quarantinedIdentities});
const want=process.env.KIND;for(const x of samples.filter(x=>!want||x.kind===want).slice(0,Number(process.env.SHOW??3)))console.log(JSON.stringify({kind:x.kind,prior:(x.prior??[]).map(sm),batch:x.batch.map(sm),old:so(x.old),new:so(x.new),...(x.reread?{reread:so(x.reread)}:{})}));
if(process.env.OUT)fs.writeFileSync(process.env.OUT,JSON.stringify(stats,null,1)+'\n');
if(process.env.CASES){const by=k=>Object.entries(lostCases.reduce((m,x)=>(m[x[k]]=(m[x[k]]??0)+1,m),{}));
 fs.writeFileSync(process.env.CASES,JSON.stringify({seed:SEED,mono:!!process.env.MONO,lost:lostCases.length,sameOnFreeze3:lostCases.filter(x=>x.sameOnFreeze3===true).length,
  byFreeze4Refusal:Object.fromEntries(Object.entries(lostCases.reduce((m,x)=>(m[x.freeze4.refused??'none']=(m[x.freeze4.refused??'none']??0)+1,m),{}))),
  byCandidate:Object.fromEntries(Object.entries(lostCases.reduce((m,x)=>{const k=x.candidate.replace(/ \(.*\)$/,'').replace(/ by .*$/,'').replace(/into .*$/,'into');m[k]=(m[k]??0)+1;return m;},{}))),cases:lostCases},null,1)+'\n');}
const c=stats.candidate;process.exitCode=(stats.classes.UNEXPLAINED??0)||c.lostInForce||c.orphans||c.doubleIdentity||c.doubleActivity||c.rereadUnstable||c.rereadQuarantine.other||c.roundTripUnstable||c.nondeterministic?1:0;
