// O-1 Conflict Evidence differential (successor of audits/v1-core-ncc-2026-11-19/evidence/differential.mjs: same generator, seed, fate accounting
// and candidate invariants). Base: the FREEZE-5 normalizer (f40fbe1). Usage: node differential.mjs <FREEZE-5 CoachingCore> <candidate CoachingCore>
// [cases=3000] [seed=20261119]. O1=1 selects the O-1 classes and invariants (below); without it the file classifies as its predecessor did.
// O-1 classes (first matching), each pass where the two outputs differ, after the fate accounting:
//   VOICE_KEPT      the dose view is identical (every row's id, identity, amount, response, flag, conflict reason, merged ids, replacement, the
//                   quarantine, the refusals and duplicates): only parts and input hashes differ, and every part the candidate adds is the
//                   row's own report or a report both trees refused for a conflict (DUPLICATE_CONFLICT_QUARANTINED, IDENTITY_QUARANTINED_BY_CONFLICT)
//   DISPUTE_STAYS   FREEZE-5 leaves an identity's row in force unflagged where the candidate keeps it flagged, and the candidate's row carries a
//                   voice of another speaker than the correction that settled it on FREEZE-5 (SSCTR-NCC-01: the refused voice still disagrees)
//   VOICE_AGREES    the candidate's row in force merged a voice FREEZE-5's did not (a kept voice that agrees with the correction)
//   SPEAKER_RULE    the candidate's row is unflagged where FREEZE-5's is flagged, and every voice FREEZE-5 carried and the candidate did not is of
//                   the correction's own speaker (P4)
//   ORDER_ONLY      as before;  UNEXPLAINED anything else (must be 0)
// O-1 candidate invariants (must be 0): voiceLost (a report the candidate refused for a conflict on an identity with a flagged row in force and
// no other execution's activity, absent from every row of its record), integrityVoiceKept (a report refused for any other reason whose input hash
// a row of the record carries, where the prior did not), unmergedVoiceOnCleanRow (an unflagged row in force with a part neither its own report nor
// merged: a disputed amount in dose). Plus the predecessor's: no row lost, orphan, double identity or activity, re-read or round-trip
// instability, nondeterminism.
// MONO=1: monotone arrival clock and no replays. EXT=1 (cycle 1, QRE C2): the generator also adds, per watch report, an athlete's correction of
// the session's own report and a late device re-sync of the watch report, delivered after that correction but made before it (non-monotone), so
// corrections of merged parts whose holder became available after the part are exercised. SHOW=n KIND=<class> prints samples. CASES=<file> writes every row in force FREEZE-4 lost, one
// by one: how FREEZE-4 lost it, the incoming reports read before it, and where the candidate keeps it. Read-only; synthetic athletes only.
//
// Cycle 1 (QRE C2): the fate of every incoming report is accounted first. A report refused by the candidate but not by FREEZE-4 (by event id and
// reason), or the reverse, must be explained from the inputs and the candidate's own record, else the pass is UNEXPLAINED, whatever class it
// would otherwise get (so no class that looks only at carried rows can absorb an unexplained refusal). Refusals: CHAIN_BEFORE_REPORT (the
// correction is dated before the named report's own report time, read from the generated input), CHAIN_CASCADE (the named report is in no row
// of the candidate's record), BOUND_IN_FORCE / BOUND_HISTORY (another execution's row in force, or its history row, holds the activity), CONFLICT_
// WITH_RECORD (a row in force on the identity is flagged conflicted, or the identity is quarantined), ID_HELD (another report of the record, or of
// this review, holds the event id). Admissions: CHAIN_NOW_FOUND (valid by the named report's own clock), CONFLICT_STATE_DIFFERS (the rows in
// force on the identity or activity it met differ between the two), CHAIN_OTHER_IDENTITY (the id it names is held by another execution of the
// record), QUARANTINE_RESOLVED (F3), REPLAY_OF_RECORD (an exact replay of a report the
// record holds, read as such because the record is rebuilt first). A report refused by both for another reason must have the candidate's reason
// explained (REFUSED_BOTH:<why>). A refusal is also CONFLICT_THEN_RESOLVED when the
// row it conflicted with was flagged and a valid correction of the same review then resolved that conflict.
// Every pass whose two outputs differ is then classified (first matching class). The classes below read carried rows and outputs; only the fate
// accounting above reads every incoming report (QRE C5):
//   F1_LOSS        FREEZE-4 drops a carried row in force (re-refused); the candidate keeps it (in force, merged, or replaced by its own chain)
//   F1_ORDER       the same reports in force on the same identities, read in record order: a carried row stays the holder, a late report merges
//                  into it (FREEZE-4 made the late report the holder), or a late conflicting report is refused against the carried row
//   F1_CHAIN       an incoming correction dated before the carried report it names: refused by both (classification of the refusal differs)
//   F2_BIND        the candidate refuses ACTIVITY_BOUND_TO_TWO_SESSIONS where the activity is held by a carried row's merged part
//   F2_FLAG_TARGET a report bound by activity to an execution whose row a correction retired: the candidate flags the row in force for that
//                  execution; FREEZE-4 flagged the retired row object after its history copy was taken, so no output row carried it
//                  (the row in force escaped the conflict; where it was already flagged for another conflict, only its label differs)
//   F3_RESOLUTION  a valid correction of a carried execution in conflict resolves it (FREEZE-4 had dropped the quarantine on re-read, so it
//                  refused the correction or merged it into the conflicted row); as in the review that flagged the conflict. The resolving
//                  correction may itself be corrected later in the same review
//   F3_QUARANTINE  the only difference is the quarantine of a carried conflicted row's identity (FREEZE-4 dropped it on re-read)
//   PART_FIELDS    the only difference is what merged parts now keep: the activity id (F2) and the report's own clock (cycle 1); record bytes
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
const OLD=(await load(oldRoot)).normalizeObservations,NEW=(await load(newRoot)).normalizeObservations,{hash}=await import(pathToFileURL(path.join(newRoot,'src/value.mjs')).href);
let s=SEED;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const pick=a=>a[Math.floor(rnd()*a.length)];
const ATH='ath-d',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const isoOf=v=>{const t=Date.parse(v);return Number.isFinite(t)?new Date(t).toISOString():v;};
const identity=o=>o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??(o.provenance?.provider??o.source?.provider??'MANUAL')+'@'+isoOf(o.observedAt));
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
 if(process.env.EXT){const plus=(iso,min)=>new Date(Date.parse(iso)+min*60000).toISOString(),ws=ev.filter(e=>/^W\d+$/.test(e.eventId));
  for(const w of ws){if(rnd()>=0.6)continue;const i=w.eventId.slice(1),m=ev.find(e=>e.eventId==='M'+i);
   const tm=process.env.MONO?at(''):plus(w.reportedAt,60+Math.floor(rnd()*60)),tw=process.env.MONO?at(''):plus(w.reportedAt,5+Math.floor(rnd()*50));
   if(m&&rnd()<0.8)ev.push({...m,eventId:'A'+i+'-'+(n++),correctionOf:m.eventId,correctedAt:tm,reportedAt:tm,actual:{...pick(ACTUALS)}});
   ev.push({...w,eventId:'R'+i+'-'+(n++),correctionOf:w.eventId,correctedAt:tw,reportedAt:tw,actual:{completed:true,minutes:(w.actual.minutes||40)+Math.floor(rnd()*4)}});}}
 for(let j=0;j<2;j++)if(rnd()<(process.env.MONO?0:0.3))ev.push(JSON.parse(JSON.stringify(pick(ev))));
 const passes=[[],[],[]];
 ev.forEach((e,i)=>passes[Math.min(2,Math.floor(i/Math.max(1,Math.ceil(ev.length/3))))].push(e));
 const raw=new Map();for(const e of ev){if(!raw.has(e.eventId))raw.set(e.eventId,[]);raw.get(e.eventId).push(e);}
 return {passes,raw};
}
const rec=n=>[...n.accepted,...n.supersededRows];
const holds=(rows,R)=>rows.some(x=>x!==R&&(x.eventId===R.supersededBy||(x.provenance?.mergedSourceIds??[]).includes(R.supersededBy))&&identity(x)===identity(R));
const orphansOf=n=>{const rows=rec(n);return n.supersededRows.filter(R=>n.superseded.some(e=>e.eventId===R.eventId&&e.supersededBy===R.supersededBy)&&!holds(rows,R));};
const lostOf=(n,prior)=>{const out=rec(n);return prior.filter(x=>x.superseded!==true).filter(R=>{const live=n.accepted.some(x=>(x.eventId===R.eventId||(x.provenance?.mergedSourceIds??[]).includes(R.eventId))&&identity(x)===identity(R));const kept=out.find(x=>x.eventId===R.eventId&&x.superseded===true&&identity(x)===identity(R));return !live&&!(kept&&holds(out,kept));});};
const doubleId=n=>{const ids=n.accepted.map(identity);return ids.length!==new Set(ids).size;};
const actsOf=o=>[o.source?.activityId??o.canonicalActivityId??null,...Object.values(o.provenance?.parts??{}).map(p=>p?.activityId??null)].filter(Boolean);
const doubleAct=n=>{const m=new Map();for(const o of n.accepted)for(const a of actsOf(o)){if(!m.has(a))m.set(a,new Set());m.get(a).add(identity(o));}return [...m.values()].some(v=>v.size>1);};
const stripPartActs=n=>{const c=json(n);for(const o of [...c.accepted,...c.observations,...c.supersededRows])for(const p of Object.values(o.provenance?.parts??{}))if(p&&typeof p==='object'){delete p.activityId;delete p.availableAt;}return c;};
const idsOfRow=o=>[o.eventId,...(o.provenance?.mergedSourceIds??[]),...Object.keys(o.provenance?.parts??{}),...Object.keys(o.provenance?.inputHashes??{})];
/** Fate accounting (cycle 1, QRE C2): every incoming report refused by one side and not the other, or refused by both for different reasons. */
function fates(a,b,prior,batch,raw){
 const out=[],recIds=new Set([...b.accepted,...b.supersededRows].flatMap(idsOfRow)),avail=o=>Date.parse(o.correctedAt??o.reportedAt??o.observedAt);
 const actHolders=(rows,act)=>rows.filter(o=>actsOf(o).includes(act));
 const whyRefused=(id,reason)=>{for(const o of batch.filter(x=>x.eventId===id)){
   if(reason==='INVALID_CORRECTION_CHAIN'&&o.correctionOf){const named=raw.get(o.correctionOf)??[];if(named.length&&named.every(x=>avail(o)<avail(x)))return 'CHAIN_BEFORE_REPORT';if(!recIds.has(o.correctionOf))return 'CHAIN_CASCADE';
    // the id it names is held in the record by another execution (the report that reused it was refused): the chain cannot reach it
    if([...b.accepted,...b.supersededRows].some(x=>idsOfRow(x).includes(o.correctionOf)&&identity(x)!==identity(o)))return 'CHAIN_OTHER_IDENTITY';}
   else if(reason==='ACTIVITY_BOUND_TO_TWO_SESSIONS'){const act=o.source?.activityId??o.canonicalActivityId;if(actHolders(b.accepted,act).some(x=>identity(x)!==identity(o)))return 'BOUND_IN_FORCE';if(actHolders(b.supersededRows,act).some(x=>identity(x)!==identity(o)))return 'BOUND_HISTORY';}
   else if(reason==='DUPLICATE_CONFLICT_QUARANTINED'||reason==='IDENTITY_QUARANTINED_BY_CONFLICT'){const ident=identity(o);
    if(b.accepted.some(x=>identity(x)===ident&&x.conflicted)||b.quarantinedIdentities.includes(ident))return 'CONFLICT_WITH_RECORD';
    // the row it conflicted with was flagged, then a valid correction of this review resolved that conflict (the established rule)
    if(b.supersededRows.some(x=>identity(x)===ident&&x.conflicted===true&&batch.some(c=>c.eventId===x.supersededBy&&c.correctionOf)))return 'CONFLICT_THEN_RESOLVED';}
   else if(reason==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'){if(recIds.has(id)||prior.some(p=>idsOfRow(p).includes(id))||batch.filter(x=>x.eventId===id).length>1)return 'ID_HELD';}}
  return null;};
 const whyAdmitted=(id,reason)=>{for(const o of batch.filter(x=>x.eventId===id)){
   if(b.duplicates.some(d=>d.eventId===id&&d.reason==='EXACT_REPLAY')&&prior.some(p=>idsOfRow(p).includes(id)))return 'REPLAY_OF_RECORD';
   if(process.env.O1&&b.duplicates.some(d=>d.eventId===id&&d.reason==='EXACT_REPLAY')&&b.excluded.some(e=>e.eventId===id&&CONFLICT_REFUSALS.includes(e.reason)))return 'REPLAY_OF_KEPT_VOICE';
   if(o.correctionOf&&prior.some(p=>p.superseded!==true&&p.conflicted===true&&identity(p)===identity(o)))return 'QUARANTINE_RESOLVED';
   if(reason==='INVALID_CORRECTION_CHAIN'&&o.correctionOf){const named=raw.get(o.correctionOf)??[];if(!named.length||named.some(x=>avail(o)>=avail(x)))return 'CHAIN_NOW_FOUND';}
   else if(['DUPLICATE_CONFLICT_QUARANTINED','ACTIVITY_BOUND_TO_TWO_SESSIONS','EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'].includes(reason)){
    const ident=identity(o),act=o.source?.activityId??o.canonicalActivityId,on=n=>canon(n.accepted.filter(x=>identity(x)===ident||act&&actsOf(x).includes(act)).map(x=>idsOfRow(x).sort()).sort());
    if(on(a)!==on(b)||lostOf(a,prior).length)return 'CONFLICT_STATE_DIFFERS';}
   else if(reason==='IDENTITY_QUARANTINED_BY_CONFLICT'){if(prior.some(p=>p.superseded!==true&&p.conflicted&&identity(p)===identity(o))||!b.quarantinedIdentities.includes(identity(o)))return 'QUARANTINE_RESOLVED';}}
  return null;};
 for(const id of new Set(batch.map(o=>o.eventId))){
  const ra=a.excluded.filter(e=>e.eventId===id).map(e=>e.reason),rb=b.excluded.filter(e=>e.eventId===id).map(e=>e.reason),left=[...ra];
  const onlyB=rb.filter(x=>{const i=left.indexOf(x);if(i>=0){left.splice(i,1);return false;}return true;}),onlyA=left;
  // refused by both, for another reason: the candidate's reason must be explained
  const pairs=Math.min(onlyA.length,onlyB.length);
  for(let k=0;k<pairs;k++){const w=whyRefused(id,onlyB[k]);out.push({eventId:id,change:'reasonChanged',reason:onlyA[k]+'>'+onlyB[k],why:w?'REFUSED_BOTH:'+w:'UNEXPLAINED_REFUSAL'});}
  for(const x of onlyB.slice(pairs)){const w=whyRefused(id,x);out.push({eventId:id,change:'newRefusal',reason:x,why:w??'UNEXPLAINED_REFUSAL'});}
  for(const x of onlyA.slice(pairs)){const w=whyAdmitted(id,x);out.push({eventId:id,change:'newAdmission',reason:x,why:w??'UNEXPLAINED_ADMISSION'});}
 }
 return out;
}
const sorted=n=>{const c=json(n);for(const k of ['excluded','duplicates','conflicts','superseded','quarantinedIdentities'])c[k]=[...c[k]].map(canon).sort();return c;};
const inForce=n=>n.accepted.map(o=>identity(o)+'='+[...new Set(o.provenance?.mergedSourceIds??[o.eventId])].sort().join('+')+(o.conflicted?'!':'')).sort();
const inForceSets=n=>n.accepted.map(o=>identity(o)+'='+[...new Set([o.eventId,...(o.provenance?.mergedSourceIds??[])])].sort().join('+')).sort();
function classify(a,b,prior,batch,fate=[]){
 if(fate.some(x=>x.why.startsWith('UNEXPLAINED')))return 'UNEXPLAINED';
 if(lostOf(a,prior).length&&!lostOf(b,prior).length)return 'F1_LOSS';
 {const carriedConflict=prior.filter(p=>p.superseded!==true&&p.conflicted===true);
  const resolvedBy=n=>new Set(n.superseded.filter(e=>carriedConflict.some(p=>p.eventId===e.eventId)&&batch.some(o=>o.eventId===e.supersededBy&&o.correctionOf)).map(e=>e.eventId+'~'+e.supersededBy));
  {const ra=resolvedBy(a);if([...resolvedBy(b)].some(k=>!ra.has(k)))return 'F3_RESOLUTION';}
  if(carriedConflict.some(p=>b.supersededRows.some(x=>x.eventId===p.eventId&&x.superseded===true&&batch.some(o=>o.eventId===x.supersededBy&&o.correctionOf)&&b.accepted.some(y=>y.eventId===x.supersededBy&&identity(y)===identity(p)))))return 'F3_RESOLUTION';}
 const a1=stripPartActs(a),b1=stripPartActs(b);
 if(canon(a1)===canon(b1))return 'PART_FIELDS';
 if(canon(sorted(a1))===canon(sorted(b1)))return 'ORDER_ONLY';
 // F3: only the quarantine differs, and what the candidate adds are identities of carried rows in force flagged conflicted
 {const qa=new Set(a1.quarantinedIdentities),extra=b1.quarantinedIdentities.filter(q=>!qa.has(q)),x=sorted(a1),y=sorted(b1);x.quarantinedIdentities=y.quarantinedIdentities=[];
  if(extra.length&&canon(x)===canon(y)&&extra.every(q=>b1.accepted.some(o=>identity(o)===q&&o.conflicted===true&&prior.some(p=>p.eventId===o.eventId&&p.conflicted===true))))return 'F3_QUARANTINE';}
 // F2: the candidate refuses a report whose activity a carried row holds as a merged part, for another identity
 const partActs=new Map();for(const p of prior.filter(x=>x.superseded!==true))for(const [id,part] of Object.entries(p.provenance?.parts??{}))if(part?.activityId&&p.provenance?.activityId!==part.activityId)partActs.set(part.activityId,identity(p));
 if(b.excluded.some(e=>e.reason==='ACTIVITY_BOUND_TO_TWO_SESSIONS'&&!a.excluded.some(f=>f.eventId===e.eventId&&f.reason===e.reason)&&batch.some(o=>o.eventId===e.eventId&&partActs.has(o.source?.activityId??o.canonicalActivityId))))return 'F2_BIND';
 // F2 flag target: an activity bound to an execution a correction retired: the candidate flags the row in force, FREEZE-4 the history row
 {const AB='ACTIVITY_BOUND_TO_TWO_SESSIONS',fa=new Set(a.accepted.filter(o=>o.conflicted&&o.provenance?.conflict===AB).map(o=>o.eventId));
  const moved=[...b.accepted,...b.supersededRows.filter(h=>batch.some(c=>c.eventId===h.supersededBy))].filter(o=>o.conflicted&&o.provenance?.conflict===AB&&!fa.has(o.eventId)&&!a.supersededRows.some(h=>h.eventId===o.eventId&&h.conflicted&&h.provenance?.conflict===AB));
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
// ---------- O-1 ----------
const CONFLICT_REFUSALS=['DUPLICATE_CONFLICT_QUARANTINED','IDENTITY_QUARANTINED_BY_CONFLICT'];
const speakerOf=p=>typeof p?.activityId==='string'&&p.activityId?'DEVICE:'+p.activityId:['MANUAL','SELF_REPORT'].includes(p?.sourceQuality)?'ATHLETE':null;
const doseRow=o=>({e:o.eventId,i:identity(o),a:o.actual,r:o.response,c:o.conflicted===true,k:o.provenance?.conflict??null,m:[...(o.provenance?.mergedSourceIds??[])].sort(),s:o.superseded===true,b:o.supersededBy??null});
const doseView=n=>canon({rows:[...n.accepted.map(doseRow).map(canon).sort(),'|',...n.supersededRows.map(doseRow).map(canon).sort()],q:[...n.quarantinedIdentities].sort(),
 x:n.excluded.map(e=>e.eventId+':'+e.reason).sort(),d:n.duplicates.map(d=>d.eventId+':'+d.reason).sort(),u:n.superseded.map(e=>e.eventId+'~'+e.supersededBy).sort()});
const partsOf=o=>Object.keys(o.provenance?.parts??{});
function classifyO1(a,b,prior,batch,fate=[]){
 if(fate.some(x=>x.why.startsWith('UNEXPLAINED')))return 'UNEXPLAINED';
 const refused=new Set([...a.excluded,...b.excluded].filter(e=>CONFLICT_REFUSALS.includes(e.reason)).map(e=>e.eventId));
 if(doseView(a)===doseView(b)){
  const rowsA=new Map([...a.accepted,...a.supersededRows].map(o=>[o.eventId+'|'+(o.superseded===true),o]));
  if([...b.accepted,...b.supersededRows].every(o=>{const x=rowsA.get(o.eventId+'|'+(o.superseded===true)),have=new Set(x?partsOf(x):[]);return partsOf(o).every(id=>have.has(id)||id===o.eventId||refused.has(id)||prior.some(p=>partsOf(p).includes(id)));}))return 'VOICE_KEPT';
 }
 // A correction naming a report both trees refused for a conflict (a kept voice): FREEZE-5 cannot find it, the candidate can.
 const kept=new Set([...refused,...prior.flatMap(p=>partsOf(p).filter(id=>id!==p.eventId&&!(p.provenance?.mergedSourceIds??[]).includes(id)))]);
 for(const o of [...b.accepted,...b.supersededRows])for(const id of partsOf(o))if(id!==o.eventId&&!(o.provenance?.mergedSourceIds??[]).includes(id))kept.add(id);
 const rep_=id=>batch.filter(c=>c.eventId===id);
 // The chain now reaches the kept voice: found (CHAIN_NOW_FOUND), then possibly its own event id meets a record report (a replay, or the reuse
 // rule QRE-R6-14, which flags the row holding the id: O-NCC-1); every row newly flagged is flagged for that reuse or is the kept voice's own.
 const chainKept=x=>rep_(x.eventId).some(c=>kept.has(c.correctionOf))&&(x.why==='CHAIN_NOW_FOUND'||x.why==='REPLAY_OF_RECORD'||x.reason==='INVALID_CORRECTION_CHAIN>EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');
 const spk0=c=>speakerOf({activityId:c.source?.activityId??c.canonicalActivityId??null,sourceQuality:c.source?.quality??(c.source?.activityId?'WEARABLE_FULL':'MANUAL')});
 const EXPLAIN={CHAIN_TO_KEPT_VOICE:chainKept,
  ACTIVITY_OF_KEPT_VOICE:x=>x.change==='newRefusal'&&x.reason==='ACTIVITY_BOUND_TO_TWO_SESSIONS'&&rep_(x.eventId).some(c=>{const act=c.source?.activityId??c.canonicalActivityId;return b.accepted.some(o=>identity(o)!==identity(c)&&Object.entries(o.provenance?.parts??{}).some(([id,p])=>p?.activityId===act&&kept.has(id)));}),
  ID_HELD_BY_KEPT_VOICE:x=>x.change==='newRefusal'&&x.reason==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'&&kept.has(x.eventId),
  FORK_AFTER_SPEAKER_RULE:x=>x.change==='newRefusal'&&x.reason==='DUPLICATE_CONFLICT_QUARANTINED'&&rep_(x.eventId).some(c=>c.correctionOf&&b.superseded.some(e=>e.eventId===c.correctionOf&&batch.some(d=>d.eventId===e.supersededBy&&d!==c&&spk0(d)===spk0(c)))),
  REPLAY_OF_KEPT_VOICE:x=>x.why==='REPLAY_OF_KEPT_VOICE',
  CHAIN_CASCADE:x=>/CHAIN_CASCADE$/.test(x.why)};
 if(fate.length){const hit=fate.map(x=>Object.keys(EXPLAIN).find(k=>EXPLAIN[k](x)));
  if(hit.every(Boolean)){const fa=new Set(a.accepted.filter(o=>o.conflicted).map(o=>o.eventId)),idsK=new Set(fate.flatMap(x=>rep_(x.eventId).map(c=>identity(c))));
   // every row the candidate flags and FREEZE-5 does not is flagged for an event-id reuse (QRE-R6-14, O-NCC-1) or is on an identity these reports name
   if(b.accepted.filter(o=>o.conflicted&&!fa.has(o.eventId)).every(o=>o.provenance?.conflict==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'||idsK.has(identity(o))||[...idsK].some(i=>b.accepted.some(y=>identity(y)===i&&actsOf(y).some(a_=>actsOf(o).includes(a_))))))
    return [...new Set(hit.filter(k=>k!=='CHAIN_CASCADE'))].sort().join('+')||'CHAIN_CASCADE';}}
 // A kept voice's device activity is bound to its execution (as a carried part already was, F2): another session's report carrying it is refused.
 // A fork: a correction naming a report that a correction of the same speaker in this review already replaced (the speaker rule settled the
 // dispute with it) now meets that unflagged row and conflicts with it, as any fork outside a dispute does.
 // A replay of a kept voice is a replay: FREEZE-5 had lost the refused report, so its second copy was read as new and settled the conflict it raised.
 if(b.duplicates.some(d=>d.reason==='EXACT_REPLAY'&&kept.has(d.eventId)&&!a.duplicates.some(e=>e.eventId===d.eventId&&e.reason==='EXACT_REPLAY')&&a.accepted.some(o=>o.eventId===d.eventId)))return 'REPLAY_OF_KEPT_VOICE';
 const live=(n,i)=>n.accepted.find(o=>identity(o)===i)??null,ids=new Set([...a.accepted,...b.accepted].map(identity));
 for(const i of ids){const x=live(a,i),y=live(b,i);if(!x||!y)continue;
  const fix=batch.find(c=>c.correctionOf&&identity(c)===i&&(c.eventId===x.eventId||(x.provenance?.mergedSourceIds??[]).includes(c.eventId)));
  if(!x.conflicted&&y.conflicted&&fix){const me=speakerOf({activityId:fix.source?.activityId??fix.canonicalActivityId??null,sourceQuality:fix.source?.quality??(fix.source?.activityId?'WEARABLE_FULL':'MANUAL')});
   if(Object.entries(y.provenance?.parts??{}).some(([id,p])=>id!==fix.eventId&&speakerOf(p)!==me))return 'DISPUTE_STAYS';}
  const ma=new Set(x.provenance?.mergedSourceIds??[]);if((y.provenance?.mergedSourceIds??[]).some(id=>!ma.has(id)&&id!==y.eventId))return 'VOICE_AGREES';
  // P4: the voices FREEZE-5 carried and the candidate did not are all of the correction's own speaker (whatever the flags then read).
  for(const c of batch.filter(c=>c.correctionOf&&identity(c)===i&&y.eventId===c.eventId)){const me=speakerOf({activityId:c.source?.activityId??c.canonicalActivityId??null,sourceQuality:c.source?.quality??(c.source?.activityId?'WEARABLE_FULL':'MANUAL')}),have=new Set(partsOf(y)),had=new Set(partsOf(x));
   const dropped=Object.entries(x.provenance?.parts??{}).filter(([id])=>!have.has(id)&&id!==c.eventId);if(me&&dropped.length&&dropped.every(([,p])=>speakerOf(p)===me)&&partsOf(y).every(id=>had.has(id)||id===c.eventId))return 'SPEAKER_RULE';}
 }
 if(canon(sorted(a))===canon(sorted(b)))return 'ORDER_ONLY';
 // What a dose reader reads is the same: per identity, the row in force has the same amount, response and flag (its id, merged ids or conflict
 // label may differ), and history rows differ only in flags or merged ids. Never used when a row is resolved on one side and flagged on the other.
 if(!fate.some(x=>x.why.startsWith('UNEXPLAINED'))){const per=n=>Object.fromEntries([...new Set(n.accepted.map(identity))].map(i=>[i,n.accepted.filter(o=>identity(o)===i).map(o=>canon([o.actual,o.response,o.conflicted===true])).sort()]));
  if(canon(per(a))===canon(per(b))){const fl=n=>n.accepted.filter(o=>o.conflicted).map(o=>o.eventId).sort();return canon(fl(a))===canon(fl(b))&&a.accepted.every(o=>!o.conflicted||b.accepted.some(y=>y.eventId===o.eventId&&(y.provenance?.conflict??null)===(o.provenance?.conflict??null)))?'SAME_DOSE_PROVENANCE':'SAME_DOSE_FLAG_LABEL';}}
 return 'UNEXPLAINED';
}
function o1Invariants(b,prior,batch){
 const rows=[...b.accepted,...b.supersededRows],held=new Set(rows.flatMap(idsOfRow)),hashes=new Set(rows.flatMap(o=>Object.values(o.provenance?.inputHashes??{})));
 const priorHashes=new Set(prior.flatMap(o=>Object.values(o.provenance?.inputHashes??{})));
 let voiceLost=0,integrityVoiceKept=0,unmergedVoiceOnCleanRow=0;
 for(const e of b.excluded){const o=batch.find(x=>x.eventId===e.eventId&&hash(x)===e.inputHash);if(!o)continue;
  if(CONFLICT_REFUSALS.includes(e.reason)){const i=identity(o),act=o.source?.activityId??o.canonicalActivityId,flagged=b.accepted.some(x=>identity(x)===i&&x.conflicted===true),elsewhere=act&&b.accepted.some(x=>identity(x)!==i&&actsOf(x).includes(act));
   if(o.athleteId===ATH&&flagged&&!elsewhere&&!o.conflicted&&!held.has(e.eventId))voiceLost++;}
  else{const h=hash({...o,athleteId:ATH});if(hashes.has(h)&&!priorHashes.has(h))integrityVoiceKept++;}}
 for(const o of b.accepted)if(!o.conflicted){const m=new Set([o.eventId,...(o.provenance?.mergedSourceIds??[])]);if(partsOf(o).some(id=>!m.has(id)))unmergedVoiceOnCleanRow++;}
 return {voiceLost,integrityVoiceKept,unmergedVoiceOnCleanRow};
}
const stats={seed:SEED,o1:!!process.env.O1,o1Invariants:{voiceLost:0,integrityVoiceKept:0,unmergedVoiceOnCleanRow:0},mono:!!process.env.MONO,ext:!!process.env.EXT,fates:{},cases:0,passes:0,identical:0,classes:{},candidate:{lostInForce:0,orphans:0,doubleIdentity:0,doubleActivity:0,rereadUnstable:0,roundTripUnstable:0,nondeterministic:0,rereadQuarantine:{REFUSED_IDENTITY:0,FLAGGED_LATER:0,other:0}},freeze4:{lostInForce:0,lostPasses:0,doubleActivity:0,rereadUnstable:0,rereadQuarantine:{REFUSED_IDENTITY:0,FLAGGED_LATER:0,other:0}}};
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
 stats.cases++;const {passes,raw}=gen();let prior=[];
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
  const fate=fates(a,b,prior,batch,raw);for(const x of fate){const k=x.change+':'+x.reason+':'+x.why;stats.fates[k]=(stats.fates[k]??0)+1;}
  if(process.env.O1){const v=o1Invariants(b,prior,batch);for(const k of Object.keys(v)){stats.o1Invariants[k]+=v[k];if(v[k])samples.push({kind:k,batch,prior,old:a,new:b});}}
  if(canon(a)===canon(b))stats.identical++;else{const k=(process.env.O1?classifyO1:classify)(a,b,prior,batch,fate);stats.classes[k]=(stats.classes[k]??0)+1;if(k==='UNEXPLAINED'||process.env.KIND===k)samples.push({kind:k,batch,prior,old:a,new:b,fate});}
  prior=rec(b);
 }
}
console.log(JSON.stringify(stats,null,1));
const sm=o=>o.eventId+(o.correctionOf?'<'+o.correctionOf:'')+'['+(o.sessionId??'-')+'/'+(o.canonicalActivityId??'-')+'/'+o.actual?.minutes+(o.actual?.completed===false?'x':'')+(o.athleteId!==ATH?'/OTHER':'')+'@'+String(o.correctedAt??o.reportedAt).slice(5,16)+']'+(o.superseded?'~'+o.supersededBy:'')+(o.conflicted?'!':'')+(o.provenance?.mergedSourceIds?.length>1?'{'+o.provenance.mergedSourceIds.join(',')+'}':'');
const so=n=>n&&({acc:n.accepted.map(sm),sup:n.superseded.map(e=>e.eventId+'~'+e.supersededBy),exc:n.excluded.map(e=>e.eventId+':'+e.reason),dup:n.duplicates.map(d=>d.eventId+'>'+d.mergedInto+':'+d.reason[0]),q:n.quarantinedIdentities});
const want=process.env.KIND;if(process.env.DOSEDIFF)for(const x of samples.filter(x=>x.kind==='UNEXPLAINED').slice(0,Number(process.env.SHOW??3))){const A=new Map([...x.old.accepted,...x.old.supersededRows].map(o=>[o.eventId+'|'+(o.superseded===true),canon(doseRow(o))])),B=new Map([...x.new.accepted,...x.new.supersededRows].map(o=>[o.eventId+'|'+(o.superseded===true),canon(doseRow(o))]));console.log('DOSEDIFF',JSON.stringify([...new Set([...A.keys(),...B.keys()])].filter(k=>A.get(k)!==B.get(k)).map(k=>({k,old:A.get(k),new:B.get(k)}))));}
for(const x of samples.filter(x=>!want||x.kind===want).slice(0,Number(process.env.SHOW??3)))console.log(JSON.stringify({kind:x.kind,fate:x.fate,prior:(x.prior??[]).map(sm),batch:x.batch.map(sm),old:so(x.old),new:so(x.new),...(x.reread?{reread:so(x.reread)}:{})}));
if(process.env.SAMPLES)fs.writeFileSync(process.env.SAMPLES,JSON.stringify(samples.filter(x=>!want||x.kind===want).slice(0,Number(process.env.SHOW??3)).map(x=>({kind:x.kind,prior:x.prior,batch:x.batch})))+'\n');
if(process.env.OUT)fs.writeFileSync(process.env.OUT,JSON.stringify(stats,null,1)+'\n');
if(process.env.CASES){const by=k=>Object.entries(lostCases.reduce((m,x)=>(m[x[k]]=(m[x[k]]??0)+1,m),{}));
 fs.writeFileSync(process.env.CASES,JSON.stringify({seed:SEED,mono:!!process.env.MONO,lost:lostCases.length,sameOnFreeze3:lostCases.filter(x=>x.sameOnFreeze3===true).length,
  byFreeze4Refusal:Object.fromEntries(Object.entries(lostCases.reduce((m,x)=>(m[x.freeze4.refused??'none']=(m[x.freeze4.refused??'none']??0)+1,m),{}))),
  byCandidate:Object.fromEntries(Object.entries(lostCases.reduce((m,x)=>{const k=x.candidate.replace(/ \(.*\)$/,'').replace(/ by .*$/,'').replace(/into .*$/,'into');m[k]=(m[k]??0)+1;return m;},{}))),cases:lostCases},null,1)+'\n');}
const c=stats.candidate;process.exitCode=Object.values(stats.o1Invariants).some(Boolean)||(stats.classes.UNEXPLAINED??0)||c.lostInForce||c.orphans||c.doubleIdentity||c.doubleActivity||c.rereadUnstable||c.rereadQuarantine.other||c.roundTripUnstable||c.nondeterministic?1:0;
