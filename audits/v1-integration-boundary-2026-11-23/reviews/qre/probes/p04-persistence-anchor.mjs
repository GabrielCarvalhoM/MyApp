// QRE probe P04: persistence, anchor and lifecycle edges of integration.mjs.
// (a) acknowledgeRecordLoss on an intact record (no loss, no rollback);
// (b) acknowledgeRecordLoss after INTEGRITY_FAILURE (tampered record);
// (c) enroll whose write landed before the store threw: what the retry answers;
// (d) an anchor write that fails: what the caller is told; then a rollback to the anchor's version;
// (e) a store that returns {ok:false} without throwing (a real version race) is not reported as PERSISTENCE_FAILURE.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p04-persistence-anchor.mjs
import {athlete,memoryStore,memoryAnchor,ELIG,addDays} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;

{const anchor=memoryAnchor(),t=athlete({id:'p04-a',anchor});t.enroll();const sun=addDays(t.doc().program.startDate,6);t.set(sun);t.weekly(sun,t.sessions(0).map(s=>t.form(s)));
 const v=t.version();console.log('(a) intact record version',v,'read',code(t.it.read({actor:t.actor})));
 const ack=t.it.acknowledgeRecordLoss({actor:t.actor});console.log('    acknowledgeRecordLoss on an intact record:',code(ack),'-> read now',code(t.it.read({actor:t.actor})),'stored',t.store.raw('p04-a')===null?'GONE':'kept','tombstone',!!t.store.tombstoneOf?.('x'));}
{const anchor=memoryAnchor(),t=athlete({id:'p04-b',anchor});t.enroll();const raw=JSON.parse(t.store.raw('p04-b'));raw.carried.records.runFormatRecord=[];t.store.setRaw('p04-b',JSON.stringify(raw));
 console.log('(b) tampered: read',code(t.it.read({actor:t.actor})),'ack',code(t.it.acknowledgeRecordLoss({actor:t.actor})),'stored',t.store.raw('p04-b')===null?'GONE':'kept');}
{const base=memoryStore();let mode='throw-after';const store={...base,commit(i,v,d){const r=base.commit(i,v,d);if(mode==='throw-after'){mode='ok';throw new Error('fsync');}return r;}};
 const t=athlete({id:'p04-c',store});const a=t.enroll();const b=t.enroll();console.log('(c) enroll write landed then threw:',code(a),'; retry:',code(b),'; record version',t.version());}
{const inner=memoryAnchor();let failSet=false;const anchor={...inner,set:(i,v)=>{if(failSet)throw new Error('keychain locked');inner.set(i,v);}};
 const t=athlete({id:'p04-d',anchor});t.enroll();const v1=t.store.raw('p04-d');const sun=addDays(t.doc().program.startDate,6);t.set(sun);
 failSet=true;const r=t.weekly(sun,t.sessions(0).map(s=>t.form(s)));failSet=false;console.log('(d) anchor write failed; the answer:',code(r),'version',r.version,'anchorStale surfaced:','anchorStale' in r||JSON.stringify(r).includes('anchor'));
 t.store.setRaw('p04-d',v1);console.log('    store rolled back to v1 (the anchor still says v1):',code(t.it.read({actor:t.actor})),'version',t.version());}
{const base=memoryStore();const store={...base,commit:(i,v,d)=>v===null?base.commit(i,v,d):{ok:false,version:99}};const t=athlete({id:'p04-e',store});t.enroll();const s=t.sessions(0)[0];t.set(s.date);
 console.log('(e) store version race (no throw):',code(t.weekly(s.date,[t.form(s)])));}
