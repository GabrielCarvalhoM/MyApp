// V1 CoachingCore Integration Boundary (2026-11-23): the Node oracle of the integration boundary's device run (the core-oracle.mjs pattern).
// Runs journeys B, D, G and H of test/v1int-journeys.test.mjs live through the integration boundary, records every call it makes (operation,
// clock, arguments), replays them through int-driver.js over the native ESM modules, checks the replay stores the same bytes as the live run,
// and writes the fixture the device test compares against.
//   node audits/v1-core-safety-lifecycle-2026-11-18/mac/int-oracle.mjs   -> audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/int.json
// Deterministic: running it again must leave `git diff` empty.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as integration from '../../../../../CoachingCore/src/boundary/integration.mjs';
import * as store from '../../../../../CoachingCore/src/boundary/store.mjs';
import * as value from '../../../../../CoachingCore/src/value.mjs';
import {athlete,ELIG,addDays,at,athleteA,notFeeling100WithSign,readiness} from '../../../../../CoachingCore/test/v1int-helpers.mjs';

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..','..','..'),HERE=path.join(REPO,'audits','v1-core-safety-lifecycle-2026-11-18','mac');
const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'int-qre-rerun.json');
const KEY='v1int-device-run-synthetic-key',OPS=['enroll','submit','importActivities','restart','read','carried'];
const U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
/** One athlete through the boundary whose every call is recorded as the driver will replay it. */
function recorded(id){
 let n=0;const t=athlete({id,key:KEY,newId:p=>p+'_'+String(++n).padStart(6,'0')}),steps=[];
 for(const k of OPS){const f=t.it[k];t.it[k]=args=>{const {actor:_a,...rest}=args??{};steps.push({op:k,at:t.clock,args:JSON.parse(JSON.stringify(rest))});return f(args);};}
 return {t,steps,journey:name=>({name,athleteId:id,steps,live:t.store.raw(id)})};
}
const restartIntake=(id,day,pause)=>{const u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);if(pause)u.athlete.pause=pause;else delete u.athlete.pause;return u;};
const journeys=[];
// B: the watch in the morning, the athlete's form in the evening (an in-place merge custody now admits), the same workout again, the Sunday review.
{const r=recorded('int-b'),t=r.t;t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');
 t.set(s.date,'08:00');t.import([t.watch(s)],{eligibility:ELIG(s.date)});t.set(s.date,'20:00');t.weekly(s.date,[t.form(s)]);
 t.set(s.date,'20:05');t.import([t.watch(s)]);const sun=addDays(t.doc().program.startDate,6);t.set(sun);t.weekly(sun,[]);t.it.carried({actor:t.actor});
 journeys.push(r.journey('int-b-two-voices'));}
// D: a strength report, its correction, a refused second correction of the replaced report.
{const r=recorded('int-d'),t=r.t;t.enroll();const s=t.sessions(0).find(x=>x.sport==='STRENGTH');t.set(s.date);
 const id=t.weekly(s.date,[t.form(s)]).recorded[0];t.set(s.date,'21:00');const fix={...t.form(s),correctionOf:id,actual:{...t.form(s).actual,minutes:18}};
 t.weekly(s.date,[fix]);t.weekly(s.date,[fix]);journeys.push(r.journey('int-d-correction'));}
// G: hold, readiness, a symptom stop, its correction by the athlete, the restart asks (SB-1); a later declaration; the restart.
{const r=recorded('int-g'),t=r.t;t.enroll();const p=t.doc().program,d0=addDays(p.startDate,6);t.set(d0);t.weekly(d0,t.sessions(0).map(s=>t.form(s)));
 const h=addDays(p.startDate,8),rd=addDays(h,4);t.set(h,'08:00');t.api.notFeeling100({actor:t.actor,clientRequestId:'hold',expectedVersion:t.version(),...notFeeling100WithSign(h)});
 t.set(rd,'08:00');t.api.declareReadiness({actor:t.actor,clientRequestId:'ready',expectedVersion:t.version(),...readiness(rd)});
 const s=t.sessions(2).find(x=>x.sport==='RUN'&&x.date>rd);t.set(s.date,'21:00');
 const stop=t.weekly(s.date,[{...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]);
 t.set(s.date,'22:30');t.weekly(s.date,[{...t.form(s),correctionOf:stop.recorded[0],actual:{completed:false,minutes:0},response:U3}]);
 const day=addDays(s.date,3);t.set(day,'10:00');t.it.restart({actor:t.actor,intake:restartIntake('int-g',day,null),expectedVersion:t.version()});
 t.set(addDays(s.date,1),'08:00');t.api.notFeeling100({actor:t.actor,clientRequestId:'hold-2',expectedVersion:t.version(),...notFeeling100WithSign(addDays(s.date,1))});
 t.set(addDays(s.date,2),'08:00');t.api.declareReadiness({actor:t.actor,clientRequestId:'ready-2',expectedVersion:t.version(),...readiness(addDays(s.date,2))});
 t.set(day,'10:00');t.it.restart({actor:t.actor,intake:restartIntake('int-g',day,null),expectedVersion:t.version()});journeys.push(r.journey('int-g-safety'));}
// H: refusals the boundary makes: too many reports, a cross-author correction, a clock behind the record.
{const r=recorded('int-h'),t=r.t;t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'08:00');
 const hk=t.import([t.watch(s)],{eligibility:ELIG(s.date)});t.set(s.date,'20:00');t.weekly(s.date,Array(40).fill(t.form(s)));
 t.weekly(s.date,[{...t.form(s),correctionOf:hk.recorded[0]}]);t.set(s.date,'07:00');t.weekly(s.date,[t.form(s)]);journeys.push(r.journey('int-h-refusals'));}

const input={key:KEY,journeys:journeys.map(({live:_l,...j})=>j)};
vm.runInThisContext(fs.readFileSync(path.join(HERE,'int-driver.js'),'utf8'));
const M={integration,store,value},expected=JSON.parse(globalThis.__intfocal(M,JSON.stringify(input)));
assert.equal(globalThis.__intfocal(M,JSON.stringify(input)),JSON.stringify(expected),'the replay is deterministic');
// The replay stores the same bytes the live run stored (the recorded calls are the whole journey).
for(const j of journeys){const last=expected.journeys.find(x=>x.name===j.name).steps.findLast(s=>s.stored);assert.equal(last.stored,value.hash(JSON.parse(j.live)),j.name+': replay = live');}
const codes=Object.fromEntries(expected.journeys.map(j=>[j.name,j.steps.map(s=>s.code+(s.status?':'+s.status:''))]));
fs.writeFileSync(OUT,JSON.stringify({driver:fs.readFileSync(path.join(HERE,'int-driver.js'),'utf8'),inputJSON:JSON.stringify(input),expected},null,1)+'\n');
console.log(JSON.stringify({ok:true,out:path.relative(REPO,OUT).replaceAll('\\','/'),digest:expected.digest,codes},null,1));
