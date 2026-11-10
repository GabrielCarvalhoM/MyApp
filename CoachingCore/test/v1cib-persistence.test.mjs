// V1 Coaching Integration Boundary QRE-FF-06 (QRE_FF_RECHECK_CYCLE programNotJsonStable / jsonRoundTripProgram): a valid program, record and reference
// state stay valid through generate -> validate -> serialize -> persist -> load -> validate -> continue. canonical() follows JSON value semantics, so a
// value and its JSON round trip hash the same; integrity checks stay effective (a changed value never passes).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,I,F,timeline,HYBRID,KNOWN,NO,XNO,doneWeek,reviewWeeks,READY,clone} from './v1cib-helpers.mjs';

const V=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const P=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-program.mjs')).href);
const json=v=>JSON.parse(JSON.stringify(v));
/** The pre-V1CIB canonical text (kept here only to show which hashes are unchanged). */
function legacyCanonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(legacyCanonical).join(',')+']';return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+legacyCanonical(value[k])).join(',')+'}';}
const hasUndefined=v=>v===undefined||(v&&typeof v==='object'&&(Array.isArray(v)?Array.from(v).some(hasUndefined):Object.values(v).some(hasUndefined)));

test('QRE-FF-06 canonical(): an absent key and an undefined value are the same JSON value; null stays a value of its own',()=>{
 assert.equal(V.canonical({a:1,b:undefined}),V.canonical({a:1}));
 assert.notEqual(V.canonical({a:1,b:null}),V.canonical({a:1}),'null is kept: it is not an absent field');
 assert.equal(V.canonical([1,undefined,3]),V.canonical([1,null,3]),'an undefined array element is null, as in JSON');
 assert.equal(V.canonical({z:{y:undefined,x:[undefined,{w:undefined}]}}),'{"z":{"x":[null,{}]}}');
 assert.equal(V.canonical({b:2,a:1}),V.canonical({a:1,b:2}),'key order never matters');
 const sparse=[1];sparse[2]=3;assert.equal(V.canonical(sparse),'[1,null,3]','a hole is null, as in JSON');
 assert.equal(V.canonical({f:()=>1,s:Symbol('x'),n:1}),'{"n":1}','functions and symbols are not JSON values');
 assert.equal(V.canonical({d:new Date(Date.UTC(2026,10,9))}),'{"d":"2026-11-09T00:00:00.000Z"}','toJSON applies as in JSON');
 assert.throws(()=>V.hash(undefined),'hashing no value at all still throws');
});
test('QRE-FF-06 canonical(): every JSON value hashes the same before and after a JSON round trip, and a changed value never does',()=>{
 const samples=[{a:[1,2,{b:'x',c:undefined}],d:null,e:{f:undefined}},[undefined,0,-0,'',false,{}],{n:1.5,big:1e21,small:1e-7,neg:-3},{deep:{a:{b:{c:{d:[undefined,null]}}}}}];
 for(const v of samples){assert.equal(V.hash(v),V.hash(json(v)),JSON.stringify(v));}
 const p=I.generateProgram(HYBRID()).program;
 assert.equal(V.hash(p),V.hash(json(p)));
 const t=json(p);t.weeks[1].sessions[0].prescription.durationMinutes=(t.weeks[1].sessions[0].prescription.durationMinutes??0)+5;
 assert.notEqual(V.hash(t),V.hash(p),'a changed dose changes the hash');
});
test('QRE-FF-06 history: a JSON-stable value keeps its earlier hash exactly; only values that held undefined change (they already failed after storage)',()=>{
 const p=I.generateProgram(HYBRID()).program;
 assert.equal(hasUndefined(p),false,'a generated program holds no undefined value');
 assert.equal(V.canonical(p),legacyCanonical(p),'its canonical text is unchanged');
 const odd={a:1,b:undefined};assert.notEqual(legacyCanonical(odd),V.canonical(odd));assert.equal(legacyCanonical(json(odd)),V.canonical(odd),'after storage the earlier text equals the new one');
});
test('QRE-FF-06 (QRE minimal reproduction): the next weekly review on a schedule-change proposal gives the same decision on the program as kept and on its JSON round trip',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 const s=t.step(1,1,'SCHEDULE_CHANGE',{changes:{runDays:[0,2,4]}},'08:00');
 assert.equal(s.status,'MODIFY',s.reason);
 assert.ok(P.validProgram(json(t.p)),'the proposal is valid after a JSON round trip');
 const rv=t.review(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1)});
 const a=I.evaluateProgram(t.p,rv),b=I.evaluateProgram(json(t.p),json(rv));
 assert.notEqual(b.status,'HOLD',b.reason);
 assert.equal(b.status,a.status);assert.equal(b.action,a.action);assert.equal(b.proposal?.hash??null,a.proposal?.hash??null);
 assert.equal(V.hash(json(b)),V.hash(json(a)),'the whole decision is the same');
});
/** Runs the steps of a journey twice, once keeping every object as returned and once storing each returned object as JSON text on disk and loading it
 * back before the next step (a restart of the app between every two decisions); the decisions must be the same at every step. */
function bothWays(build,steps,label){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'v1cib-rt-'));
 const mem=build(),disk=build();
 const store=(k,v)=>{const f=path.join(dir,`${k}.json`);fs.writeFileSync(f,JSON.stringify(v));return JSON.parse(fs.readFileSync(f,'utf8'));};
 let n=0;
 for(const s of steps){
  const ra=s(mem);
  disk.p=store('program',disk.p);disk.ledger=store('record',disk.ledger);disk.ref=disk.ref?store('reference',disk.ref):null;
  const rb=s(disk);n++;
  assert.ok(P.validProgram(disk.p),`${label} step ${n}: the stored program is valid`);
  assert.equal(rb.status,ra.status,`${label} step ${n}: ${rb.reason}`);assert.equal(rb.action,ra.action,`${label} step ${n}`);
  assert.equal(rb.proposal?.hash??null,ra.proposal?.hash??null,`${label} step ${n}: the same proposal`);
  assert.equal(V.hash(json(rb.actualLedger??null)),V.hash(json(ra.actualLedger??null)),`${label} step ${n}: the same record`);
  assert.equal(V.hash(json(rb.referenceState??null)),V.hash(json(ra.referenceState??null)),`${label} step ${n}: the same reference state`);
 }
 // Only the three files written here are removed, one by one, then the empty folder (no recursive removal).
 for(const k of ['program','record','reference']){const f=path.join(dir,`${k}.json`);if(fs.existsSync(f))fs.unlinkSync(f);}fs.rmdirSync(dir);
 return {mem,disk,n};
}
test('QRE-FF-06 round trip on disk, step by step: default weeks, a schedule change, a preference change and a missed session',()=>{
 const steps=[t=>t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)}),t=>t.step(1,1,'SCHEDULE_CHANGE',{changes:{runDays:[0,2,4]}},'08:00'),t=>t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1)}),
  t=>t.step(2,1,'PREFERENCE_CHANGE',{changes:{coaching:{volume:'LOWER'}}},'08:00'),t=>t.step(2,3,'MISSED_SESSION',{observations:[]},'21:00'),t=>t.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,2)}),t=>t.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(t,3)})];
 const {n}=bothWays(()=>timeline(KNOWN(4,HYBRID())),steps,'default');assert.equal(n,steps.length);
});
test('QRE-FF-06 round trip on disk, step by step: a Situation 1 report, its check, a return, a clinical hold and its readiness declaration',()=>{
 const steps=[t=>t.step(0,6,'WEEKLY_REVIEW',{observations:doneWeek(t,0)}),
  t=>t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'07:00'),
  t=>t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}}),
  t=>t.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W7]:true},intent:'REST',days:3}},'07:00'),
  t=>t.step(2,3,'WEEKLY_REVIEW',{observations:[]}),
  t=>t.step(2,4,'READINESS_DECLARATION',{readiness:READY()},'08:00'),
  t=>t.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,2).filter(o=>o.occurrenceDate>t.day(2,4))})];
 bothWays(()=>timeline(KNOWN(4,HYBRID())),steps,'F08');
});
test('QRE-FF-06 adversarial storage: a stored program whose dose was changed, or whose hash was recomputed by the client, is refused (HOLD), never planned on',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 const bad=json(t.p);const s=bad.weeks[2].sessions.find(x=>x.prescription&&x.sport==='RUN');s.prescription.durationMinutes+=20;
 const r=I.evaluateProgram(bad,t.review(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1)}));
 assert.equal(r.status,'HOLD');assert.match(r.reason,/integrity/);
 const resealed=json(bad);delete resealed.hash;resealed.hash=P.programHash(resealed);
 assert.ok(P.validProgram(resealed),'a keyless program hash can be recomputed by anyone: the core alone cannot tell (custody holds the program, RECORD-CUSTODY)');
});
test('QRE-FF-06 adversarial storage: a record row changed after sealing is unreadable after storage too (HOLD), and an intact one reads the same',()=>{
 const t=timeline();reviewWeeks(t,0,1);
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4}},'07:00');
 const rec=json(t.ledger),row=rec.find(o=>o.fact===F.WELLBEING_DECLARED);assert.ok(row);
 const ok=I.evaluateProgram(json(t.p),{...t.review(1,2,'MISSED_SESSION',{observations:[]}),actualLedger:rec});
 assert.notEqual(ok.status,'HOLD',ok.reason);
 row.wellbeing.days=3;
 const r=I.evaluateProgram(json(t.p),{...t.review(1,2,'MISSED_SESSION',{observations:[]}),actualLedger:rec});
 assert.equal(r.status,'HOLD');assert.deepEqual(r.errors,['record.f08Unreadable']);
});
