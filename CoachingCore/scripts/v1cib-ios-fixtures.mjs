// V1 Coaching Integration Boundary: synthetic fixtures for the iOS app (requests and responses of the boundary API, one file per client state or flow).
// Deterministic: a fixed clock per step, counter ids, a fixed non-secret key. No real data. Usage: node scripts/v1cib-ios-fixtures.mjs [outDir]
// The app can be built against these files before any server exists; they are regenerated and compared byte for byte by test/v1cib-fixtures.test.mjs.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore} from '../src/boundary/store.mjs';
import {createBoundary} from '../src/boundary/api.mjs';
import {HYBRID,live} from '../test/v1cp-fixtures.mjs';
import {signsFor,READINESS_SIGNS,WARNING_SIGNS} from '../src/v1-f08.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
export function buildFixtures(){
 const START='2026-11-09',addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
 const at=(w,d,hm)=>Date.parse(`${addDays(START,w*7+d)}T${hm}:00-03:00`),clock={t:at(-1,5,'12:00')};
 let k=0;const store=memoryStore(),custody=createCustody({store,key:'v1cib-fixtures-key-not-a-secret',now:()=>clock.t,newId:p=>`${p}_fixture_${String(++k).padStart(4,'0')}`});
 const api=createBoundary({custody,now:()=>clock.t}),actor={athleteId:'ath-fixture-hybrid'},files={};
 const set=(w,d,hm)=>{clock.t=at(w,d,hm);},ver=()=>api.plan({actor}).view?.version;
 const ELIG=()=>({status:'NONCLINICAL_CONFIRMED',assessedAt:new Date(clock.t).toISOString(),pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
 const NO=c=>Object.fromEntries(signsFor(c).map(x=>[x,false]));
 let n=0;const rid=()=>`fixture-req-${String(++n).padStart(3,'0')}`;
 const put=(name,state,call,request,response)=>{files[name]={state,call,request,response};return response;};
 const reports=w=>custody.read({actor}).doc.program.weeks[w].sessions.filter(s=>live(s)&&!s.optional).map(s=>({sessionId:s.id,occurredOn:s.date,completed:true,minutes:s.prescription.durationMinutes,
  ...(s.sport==='STRENGTH'?{exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));
 const call=(name,state,op,req)=>put(name,state,op,req,api[op](req));
 // Onboarding and the first week.
 call('01-onboarding','VALID_PLAN','onboard',{actor,intake:HYBRID(),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:false},clientRequestId:rid()});
 put('02-plan-current-week','VALID_PLAN','plan',{actor},api.plan({actor}));
 set(0,1,'21:00');const [run]=reports(0).filter(r=>r.occurredOn===addDays(START,1));
 call('03-log-run','VALID_PLAN','logRun',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),...run});
 set(0,4,'21:00');const [lift]=reports(0).filter(r=>r.occurredOn===addDays(START,4)&&r.exercises);
 call('04-log-strength','VALID_PLAN','logStrength',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),...lift});
 set(0,6,'20:00');call('05-weekly-check-in','VALID_PLAN','weeklyCheckIn',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),reports:reports(0).filter(r=>r.occurredOn!==addDays(START,1)&&r.occurredOn!==addDays(START,4))});
 // A change that waits for the athlete, and choices.
 set(1,0,'08:00');const ch=call('06-availability-change-pending','PENDING_CONFIRMATION','updateAvailability',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),changes:{runDays:[0,2,4]}});
 call('07-accept-change','VALID_PLAN','accept',{actor,decisionId:ch.decisionId,expectedVersion:ver()});
 call('08-set-preferences','PENDING_CONFIRMATION','setPreferences',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),volume:'LOWER',difficulty:{RUN:'STANDARD',STRENGTH:'HIGHER'}});
 call('09-set-coach','PENDING_CONFIRMATION','setCoach',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),profile:'CONSERVATIVE'});
 // A question: the screen is too old (the plan in force is a projection until it is answered).
 set(1,1,'08:00');call('10-needs-input','NEEDS_INPUT','logRun',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:{...ELIG(),assessedAt:'2026-10-01'},sessionId:'unknown',occurredOn:addDays(START,7),completed:false});
 // V1 Final Closure: "not 100%" with every warning sign answered no. V1 opens no temporary reduction: the plan is kept and the answer carries the
 // typed unavailability (the athlete skips a session or reports a break by their own report).
 set(1,2,'08:00');call('11-not-feeling-100-plan-kept','VALID_PLAN','notFeeling100',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}});
 // A session not done: recorded as missed, never made up (when a key session can move to a later day the answer carries an offer that waits for the
 // athlete: test/v1fc-boundary.test.mjs; this plan has no such day).
 set(1,3,'21:00');const skipped=custody.read({actor}).doc.program.weeks[1].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.date<=addDays(START,10));
 call('12-missed-session-no-debt','VALID_PLAN','logRun',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),sessionId:skipped.id,occurredOn:skipped.date,completed:false});
 // A warning sign: the hold (no prescription), and the readiness declaration.
 set(2,2,'08:00');call('13-warning-sign-blocked','BLOCKED','notFeeling100',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[WARNING_SIGNS.W7]:true},intent:'REST',days:4}});
 put('14-status-blocked','BLOCKED','status',{actor},api.status({actor}));
 set(2,4,'09:00');call('15-readiness-restart','RETURNING','declareReadiness',{actor,clientRequestId:rid(),expectedVersion:ver(),eligibility:ELIG(),readiness:{declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(x=>[x,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}});
 const last=custody.read({actor}).doc.decisions.at(-1);
 put('16-decision-explanation','RETURNING','decision',{actor,decisionId:last.decisionId},api.decision({actor,decisionId:last.decisionId}));
 put('17-history','RETURNING','history',{actor},api.history({actor}));
 // Errors: a stale version, an integrity failure, no data.
 call('18-conflict-stale-version','OPERATIONAL_ERROR','logRun',{actor,clientRequestId:rid(),expectedVersion:1,eligibility:ELIG(),sessionId:'unknown',occurredOn:addDays(START,18),completed:false});
 const raw=store.raw(actor.athleteId),doc=JSON.parse(raw);doc.rows.pop();doc.chain.pop();store.setRaw(actor.athleteId,JSON.stringify(doc));
 put('19-integrity-failure','INTEGRITY_FAILURE','plan',{actor},api.plan({actor}));store.setRaw(actor.athleteId,raw);
 put('20-no-data','NO_DATA','plan',{actor:{athleteId:'ath-not-enrolled'}},api.plan({actor:{athleteId:'ath-not-enrolled'}}));
 files['00-index']={contract:'V1CIB boundary, audits/v1-coaching-integration-boundary-2026-11-09/INTEGRATION_BOUNDARY_V1.md',synthetic:true,states:[...new Set(Object.values(files).map(f=>f.state))].sort(),
  notSynced:'NOT_SYNCED is the app\'s own state for reports in its offline queue (the server never returns it)',files:Object.keys(files).sort().map(name=>({name,state:files[name].state,call:files[name].call}))};
 return files;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const out=path.resolve(process.argv[2]??path.join(here,'..','fixtures','v1cib-ios'));fs.mkdirSync(out,{recursive:true});
 const files=buildFixtures();for(const [name,content] of Object.entries(files))fs.writeFileSync(path.join(out,`${name}.json`),JSON.stringify(content,null,1)+'\n');
 console.log(`${Object.keys(files).length} fixtures in ${out}`);
}
