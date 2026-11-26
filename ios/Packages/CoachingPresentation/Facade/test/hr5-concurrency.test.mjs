// HR5 operations: the concurrency and persistence contract front A must implement (mission phase 4), proven over the real boundary.
// - The accepted V1HR5R risk, reproduced: two writers of one store, the second having loaded before the first committed, both at the same custody
//   version (a heart-rate write does not move it). The store's version compare-and-swap lets the second overwrite the first; the anchor's
//   carriedSeq does not see it (both wrote seq+1). The athlete's first declaration is lost silently.
// - The guard A implements (NATIVE N-5 + this contract): one writer per athlete under a cross-process lock held from load to commit, and a
//   commit that compares the stored BYTES it loaded (not only the version). Under it the second writer is refused (CONFLICT_STALE_VERSION),
//   nothing is lost, and a retry on a fresh read keeps both declarations.
// - Rollback of the carried blob at the same version is detected through the anchor's carriedSeq (QRE-HR5R-06).
// - Persistence across processes: one Node process writes the profile to a file store + file anchor, a second process reads it (the pending
//   physical item; A repeats it natively with its own store and Keychain anchor).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {athleteA,createIntegration,createBoundary,memoryStore,memoryAnchor,CONSENTS} from '../../../../../CoachingCore/test/v1int-helpers.mjs';

const KEY='abc-synthetic-key',ID='hr5-cc',CLOCK=Date.parse('2026-11-14T12:00:00-03:00');
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const sha=t=>createHash('sha256').update(t??'').digest('hex');
/** A writer: its own integration over a store adapter, as a second process would have. */
const writer=(store,anchor)=>{const it=createIntegration({store,key:KEY,clock:()=>CLOCK,anchor,newId});return {it,api:createBoundary({custody:it,now:()=>CLOCK})};};
const actor={athleteId:ID};
const profileOf=it=>{const c=it.carried({actor});return c.ok?c.records.heartRateProfileRecord.filter(r=>r.source==='ATHLETE').map(r=>r.declaration):null;};
/** A second writer that LOADED (store and anchor) before the first one committed, and commits after it: its reads are frozen at the snapshot,
 * its writes reach the shared store and anchor. (A writer that loads after the commit is already refused: the anchor's carriedSeq is newer.) */
const staleReader=(shared,snapshot)=>({...shared,load:id=>id===ID?JSON.parse(snapshot):shared.load(id)});
const staleAnchor=(shared,snapshot)=>({...shared,get:id=>id===ID?{...snapshot}:shared.get(id)});
/** The guard of the contract: the commit refuses when the stored bytes differ from the bytes this operation loaded (lost-update proof). */
function guarded(inner){
 const loaded=new Map();
 return {...inner,load:id=>{const d=inner.load(id);loaded.set(id,sha(d===null?'null':JSON.stringify(d)));return d;},
  commit(id,expectedVersion,doc){const now=inner.raw(id);if(loaded.has(id)&&sha(now===null?'null':JSON.stringify(JSON.parse(now)))!==loaded.get(id))return {ok:false,conflict:true};
   const r=inner.commit(id,expectedVersion,doc);if(r?.ok)loaded.set(id,sha(JSON.stringify(doc)));return r;}};
}
function enrolled(){const shared=memoryStore(),anchor=memoryAnchor(),a=writer(shared,anchor);
 assert.ok(a.it.enroll({actor,intake:athleteA({weeks:8,id:ID}),consents:CONSENTS}).ok);return {shared,anchor,a};}
const v=it=>it.read({actor}).doc.version;

test('the accepted race: a same-version heart-rate write over a stale read loses the first declaration silently',()=>{
 const {shared,anchor,a}=enrolled();const before=shared.raw(ID),anchorBefore=anchor.get(ID);
 assert.ok(a.api.setHeartRateProfile({actor,clientRequestId:'w1',expectedVersion:v(a.it),heartRateProfile:{maxHeartRateBpm:195}}).ok);
 const b=writer(staleReader(shared,before),staleAnchor(anchor,anchorBefore));
 const r=b.api.setHeartRateProfile({actor,clientRequestId:'w2',expectedVersion:1,heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});
 assert.ok(r.ok,'the version compare-and-swap does not refuse it (same custody version)');
 const kept=profileOf(writer(shared,anchor).it);
 assert.deepEqual(kept,[{zoneUpperBpm:[130,150,165,180]}],'the declared maximum 195 is gone, and nothing says so');
});

test('the contract guard: one writer per athlete and a bytes compare-and-swap refuse the stale writer; a fresh retry keeps both',()=>{
 const {shared,anchor,a}=enrolled();const before=shared.raw(ID),anchorBefore=anchor.get(ID);
 assert.ok(a.api.setHeartRateProfile({actor,clientRequestId:'w1',expectedVersion:v(a.it),heartRateProfile:{maxHeartRateBpm:195}}).ok);
 const b=writer(guarded(staleReader(shared,before)),staleAnchor(anchor,anchorBefore));
 const r=b.api.setHeartRateProfile({actor,clientRequestId:'w2',expectedVersion:1,heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});
 assert.equal(r.ok,false);assert.equal(r.error.code,'CONFLICT_STALE_VERSION','refused, nothing written');
 assert.deepEqual(profileOf(writer(shared,anchor).it),[{maxHeartRateBpm:195}]);
 // The host's retry (handoff §7: refresh, rebuild, new request id) on a fresh read.
 const c=writer(guarded(shared),anchor);
 assert.ok(c.api.setHeartRateProfile({actor,clientRequestId:'w2b',expectedVersion:v(c.it),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}}).ok);
 assert.deepEqual(profileOf(c.it),[{maxHeartRateBpm:195},{zoneUpperBpm:[130,150,165,180]}]);
 // The same request id again: replayed, not appended (duplicates are absorbed).
 const again=c.api.setHeartRateProfile({actor,clientRequestId:'w2b',expectedVersion:v(c.it),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});
 assert.equal(again.replayed,true);assert.equal(profileOf(c.it).length,2);
});

test('a writer that loads after the other commit is refused by the anchor (carriedSeq), not raced',()=>{
 const {shared,anchor,a}=enrolled();const before=shared.raw(ID);
 assert.ok(a.api.setHeartRateProfile({actor,clientRequestId:'w1',expectedVersion:v(a.it),heartRateProfile:{maxHeartRateBpm:195}}).ok);
 const r=writer(staleReader(shared,before),anchor).api.setHeartRateProfile({actor,clientRequestId:'w2',expectedVersion:1,heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});
 assert.equal(r.ok,false);assert.equal(r.error.code,'RECORD_ROLLED_BACK');assert.deepEqual(profileOf(writer(shared,anchor).it),[{maxHeartRateBpm:195}]);
});

test('a rolled-back carried blob at the same version is RECORD_ROLLED_BACK (anchor carriedSeq)',()=>{
 const {shared,anchor,a}=enrolled();const before=shared.raw(ID);
 assert.ok(a.api.setHeartRateProfile({actor,clientRequestId:'w1',expectedVersion:v(a.it),heartRateProfile:{maxHeartRateBpm:195}}).ok);
 assert.ok(Number.isInteger(anchor.get(ID).carriedSeq),'the anchor keeps carriedSeq');
 shared.setRaw(ID,before);
 const r=writer(shared,anchor).api.plan({actor});assert.equal(r.ok,false);assert.equal(r.error.code,'RECORD_ROLLED_BACK');
});

test('the heart-rate profile written by one process is read by another (file store + file anchor)',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'abc-hr5-xp-'));
 const helpers=new URL('../../../../../CoachingCore/test/v1int-helpers.mjs',import.meta.url).href;
 const script=path.join(dir,'proc.mjs');
 fs.writeFileSync(script,`import fs from 'node:fs';import path from 'node:path';
import {athleteA,createIntegration,createBoundary,fileStore,CONSENTS} from ${JSON.stringify(helpers)};
const [dir,mode]=process.argv.slice(2),af=path.join(dir,'anchor.json');
const anchor={get:id=>{try{return JSON.parse(fs.readFileSync(af,'utf8'))[id]??null}catch{return null}},set:(id,x)=>{let m={};try{m=JSON.parse(fs.readFileSync(af,'utf8'))}catch{};m[id]=x;fs.writeFileSync(af+'.tmp',JSON.stringify(m));fs.renameSync(af+'.tmp',af);},clear:id=>{}};
let n=0;const it=createIntegration({store:fileStore(path.join(dir,'store')),key:${JSON.stringify(KEY)},clock:()=>${CLOCK},anchor,newId:p=>p+'_'+mode+'_'+(++n)});
const api=createBoundary({custody:it,now:()=>${CLOCK}}),actor={athleteId:${JSON.stringify(ID)}};
if(mode==='write'){if(!it.enroll({actor,intake:athleteA({weeks:8,id:${JSON.stringify(ID)}}),consents:CONSENTS}).ok)process.exit(2);
 const r=api.setHeartRateProfile({actor,clientRequestId:'xp-1',expectedVersion:it.read({actor}).doc.version,heartRateProfile:{maxHeartRateBpm:195}});console.log(JSON.stringify({ok:r.ok,pid:process.pid}));}
else{const p=it.presentation({actor});const z=p.readings?.runCalibration?.heartRateFiveZones;console.log(JSON.stringify({ok:p.ok,pid:process.pid,kind:z?.reference?.kind,bpm:z?.reference?.bpm,declared:z?.profile?.declaredMaximumBpm}));}
`);
 const w=JSON.parse(execFileSync(process.execPath,[script,dir,'write'],{encoding:'utf8'}).trim().split('\n').at(-1));
 const r=JSON.parse(execFileSync(process.execPath,[script,dir,'read'],{encoding:'utf8'}).trim().split('\n').at(-1));
 assert.equal(w.ok,true);assert.notEqual(w.pid,r.pid);
 assert.deepEqual({ok:r.ok,kind:r.kind,bpm:r.bpm,declared:r.declared},{ok:true,kind:'ATHLETE_DECLARED_MAXIMUM',bpm:195,declared:195});
});
