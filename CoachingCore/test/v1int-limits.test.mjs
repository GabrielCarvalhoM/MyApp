// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): SEC-O1-03, the boundary part. Every limit refuses the whole request with a
// reproducible code and records nothing; nothing is truncated, so no stop, adverse response or correction target is lost here. The abuse shapes
// of the Safety Continuity report (2000 reports) are reproduced at the boundary. Synthetic only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {LIMITS,structureError,observationError} from '../src/boundary/admission.mjs';
import {athlete,ELIG,addDays,at} from './v1int-helpers.mjs';

const code=r=>r.ok?'OK':r.error.code;
const setup=id=>{const t=athlete({id});t.enroll();const ss=t.sessions(0);return {t,run:ss.find(s=>s.id==='w0-run-d1'),str:ss.find(s=>s.sport==='STRENGTH')};};
const nested=n=>{let v={completed:true};for(let i=0;i<n;i++)v={x:v};return v;};

test('SEC-O1-03 boundary: one request of 2000 reports is refused whole (no truncation), records nothing, and names the safety fields it carried so the app keeps the draft',()=>{
 const {t,run}=setup('lim-1');t.set(run.date);const v=t.version(),raw=t.store.raw('lim-1');
 const f=t.form(run),many=Array.from({length:2000},()=>({...f}));many[1500]={...many[1500],actual:{completed:false,minutes:5,stop:{reason:'SYMPTOM'}}};
 const r=t.weekly(run.date,many);
 assert.equal(code(r),'LIMIT_EXCEEDED');assert.equal(r.error.limit,'observationsPerRequest');assert.deepEqual(r.safetyFields,['actual.stop','eligibility']);
 assert.equal(t.version(),v);assert.equal(t.store.raw('lim-1'),raw,'not a byte written');
 const ok=t.weekly(run.date,[many[1500]]);assert.equal(code(ok),'OK','the athlete\'s stop sent in a request the boundary admits');assert.equal(ok.warningSignScreen.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
});

test('SEC-O1-03 boundary (O-SC-1): 2000 agreeing reports of one session by the athlete keep one report: the record does not grow',()=>{
 const {t,run}=setup('lim-2');t.set(run.date);assert.equal(code(t.weekly(run.date,[t.form(run)])),'OK');const size=t.store.raw('lim-2').length,v=t.version();
 const form=t.form(run),codes=new Set();for(let k=0;k<2000;k++){const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[form]},{expectedVersion:v});codes.add(code(r));assert.equal(r.duplicate,true);}
 const other=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[{...form,actual:{...form.actual,minutes:41}}]},{expectedVersion:v});assert.equal(code(other),'ALREADY_REPORTED','a changed report of the session is a correction to make');
 assert.deepEqual([...codes],['OK']);assert.equal(t.version(),v);assert.equal(t.store.raw('lim-2').length,size);assert.equal(t.live(run.id).length,1);
});

test('SEC-O1-03 boundary (O-SC-1, SEC-SC-O-3): 2000 workouts on one session keep at most deviceActivitiesPerSession; 2000 re-syncs of one workout change nothing',()=>{
 const {t,run}=setup('lim-3');t.set(run.date,'20:00');const codes=[],w=t.watch(run);t.screen(ELIG(run.date));let v=t.version();
 for(let k=0;k<2000;k++){const r=t.import([{...w,activityId:`HK-${k}`}],{expectedVersion:v});if(r.ok)v=r.version;codes.push(code(r));}
 assert.equal(codes.filter(c=>c==='OK').length,LIMITS.deviceActivitiesPerSession);assert.deepEqual([...new Set(codes.slice(LIMITS.deviceActivitiesPerSession))],['LIMIT_EXCEEDED']);
 const parts=Object.keys(t.live(run.id)[0].provenance.parts??{}).length;assert.ok(parts<=LIMITS.deviceActivitiesPerSession,`${parts} voices`);
 const size=t.store.raw('lim-3').length;for(let k=0;k<2000;k++)assert.equal(t.import([{...w,activityId:'HK-0'}],{expectedVersion:v}).duplicate,true);
 assert.equal(t.version(),v);assert.equal(t.store.raw('lim-3').length,size);
});

test('SEC-O1-03 boundary: corrections of one report and new reports of one day are bounded; the bound is a refusal, the earlier record stays',()=>{
 const {t,str}=setup('lim-4');t.set(str.date,'08:00');let head=t.weekly(str.date,[t.form(str)]).recorded[0];
 for(let k=1;k<=LIMITS.correctionsPerReport;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:20+k}}]);assert.equal(code(r),'OK',`correction ${k}`);head=r.recorded[0];}
 t.clock+=60e3;const over=t.weekly(str.date,[{...t.form(str),correctionOf:head}]);assert.equal(code(over),'LIMIT_EXCEEDED');assert.equal(over.error.limit,'correctionsPerReport');
 // Unplanned workouts (no session) on one day: each is its own activity; the ninth is refused.
 const day=addDays(t.doc().program.startDate,2);t.set(day,'23:00');const w=t.watch(t.sessions(0).find(s=>s.id==='w0-run-d1'));delete w.sessionId;
 const out=[];for(let k=0;k<LIMITS.reportsPerDayPerChannel+1;k++)out.push(code(t.import([{...w,activityId:`HK-free-${k}`,observedAt:at(day,`${String(6+k).padStart(2,'0')}:00`)}],{eligibility:ELIG(day)})));
 assert.deepEqual(out,[...Array(LIMITS.reportsPerDayPerChannel).fill('OK'),'LIMIT_EXCEEDED']);
});

test('SEC-O1-03 boundary: shapes no real report has are refused with the limit named: size, depth, arrays, keys, strings, identifiers, unknown and boundary-owned fields',()=>{
 const {t,run,str}=setup('lim-5');t.set(run.date);const f=t.form(run),v=t.version();
 const cases=[
  [{...f,actual:{...f.actual,note:'x'.repeat(20000)}},'LIMIT_EXCEEDED','observationBytes'],
  [{...f,actual:{...f.actual,deep:nested(20)}},'LIMIT_EXCEEDED','depth'],
  [{...f,actual:{...f.actual,laps:Array(LIMITS.arrayLength+1).fill(1)}},'LIMIT_EXCEEDED','arrayLength'],
  [{...f,actual:{...f.actual,...Object.fromEntries(Array.from({length:40},(_,i)=>['k'+i,1]))}},'LIMIT_EXCEEDED','keysPerObject'],
  [{...f,actual:{...f.actual,label:'y'.repeat(LIMITS.stringLength+1)}},'LIMIT_EXCEEDED','stringLength'],
  [{...f,sessionId:'s'.repeat(129)},'INVALID_IDENTIFIER'],[{...f,sessionId:'w0\nrun'},'INVALID_IDENTIFIER'],[{...f,correctionOf:''},'INVALID_IDENTIFIER'],
  [{...f,occurrenceDate:'yesterday'},'INVALID_TIME'],[{...f,observedAt:'2026-13-40T99:00'},'INVALID_TIME'],
  [{...f,note:'hi'},'UNKNOWN_FIELD'],[{...f,reportedAt:at(run.date)},'BOUNDARY_OWNED_FIELD'],[{...f,actual:{...f.actual,provenance:{}}},'BOUNDARY_OWNED_FIELD'],
  [{...f,actual:{...f.actual,minutes:Infinity}},'LIMIT_EXCEEDED','number'],[{...f,actual:{minutes:40}},'INVALID_OBSERVATION'],['report','INVALID_OBSERVATION']];
 for(const [o,c,limit] of cases){const r=t.weekly(run.date,[o]);assert.equal(code(r),c,JSON.stringify(o).slice(0,80));if(limit)assert.equal(r.error.limit,limit);assert.equal(r.error.index,0);}
 const sf=t.form(str),big=Array.from({length:LIMITS.observationsPerRequest},()=>({...sf,actual:{...sf.actual,pad:'z'.repeat(500),pad2:'z'.repeat(500),pad3:'z'.repeat(500),pad4:'z'.repeat(500),pad5:'z'.repeat(500),pad6:'z'.repeat(500),pad7:'z'.repeat(500),pad8:'z'.repeat(500)}}));
 assert.equal(t.weekly(run.date,big).error.limit,'requestBytes');
 assert.equal(t.submit({kind:'WEEKLY_REVIEW',interruption:{reason:'r'.repeat(LIMITS.stringLength+1)}}).error.limit,'stringLength','the review\'s own fields are bounded too');
 assert.equal(t.version(),v,'nothing recorded by any of them');
});

test('SEC-O1-03 boundary: the limits admit what real use sends: a full week of reports, a 32-workout HealthKit backfill, the largest strength report measured with margin',()=>{
 const {t}=setup('lim-6');const p=t.doc().program,end=addDays(p.startDate,p.weeks.length*7-1);
 const runs=p.weeks.flatMap(w=>w.sessions).filter(s=>s.sport==='RUN'&&s.prescription).slice(0,LIMITS.observationsPerRequest);t.set(end,'21:00');
 const r=t.import(runs.map(s=>t.watch(s)),{eligibility:ELIG(end)});assert.equal(code(r),'OK');assert.equal(r.recorded.length+r.notRecorded.length,runs.length);
 const s0=t.sessions(0).filter(s=>s.sport==='STRENGTH').map(s=>t.form(s));for(const o of s0)assert.equal(observationError('ATHLETE',o,0),null);
 assert.equal(structureError(s0[0]),null);
 assert.equal(code(t.import([...runs,runs[0]].map(s=>t.watch(s)))),'LIMIT_EXCEEDED');
});

test('SEC-O1-03 boundary (portability): the byte measure needs no TextEncoder or Buffer and equals UTF-8 on accents, emoji, CJK and a lone surrogate',async()=>{
 const {utf8Length}=await import('../src/boundary/admission.mjs');
 for(const s of ['','abc','ação São Paulo','💪🏃‍♀️','跑步','\ud800x','x\udc00',JSON.stringify({a:'é',b:['🙂']})])assert.equal(utf8Length(s),Buffer.byteLength(s,'utf8'),JSON.stringify(s));
});
