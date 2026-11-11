// CoachingCore V1 Final Closure: the single directed fix cycle after the independent review round on 2d089c0. One test per finding:
// SSCTR R-01 to R-06 (with SSCTR-V1FC-DECISION Amendment 2), Security SEC-V1FC-01 to -03 and -05 to -07, and the QRE findings named below.
// Development authority for the event extension; synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {generateProgram} from '../src/r6-index.mjs';
import * as V1 from '../src/v1-index.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {intake,PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';
import {devEventExtension} from '../src/v1-events.mjs';
import {ROOT,F,HYBRID,NO,READY,ELIG,addDays,live} from './v1cib-helpers.mjs';

const I=p=>import(pathToFileURL(path.join(ROOT,'CoachingCore/src',p)).href);
const {createCustody}=await I('boundary/custody.mjs');
const {memoryStore}=await I('boundary/store.mjs');
const {createBoundary}=await I('boundary/api.mjs');
const {CLIENT_STATES:S}=await I('boundary/views.mjs');
const {telemetryOf,NEVER_OUTBOUND}=await I('boundary/inventory.mjs');

const X=JSON.parse(fs.readFileSync(new URL('../v1/EVENT_EXTENSION_V1.json',import.meta.url),'utf8'));
const A2=JSON.parse(fs.readFileSync(new URL('../../audits/coachingcore-v1-final-closure-2026-11-11/ssctr-decision/SSCTR_V1FC_DECISION_AMENDMENT_2.json',import.meta.url),'utf8')).values.marathon;
const dev={authority:devAuthority(),eventExtension:devEventExtension()};
const all=p=>p.weeks.flatMap(w=>w.sessions),fam=(p,f)=>all(p).filter(s=>s.prescription?.family===f),runs=w=>w.sessions.filter(s=>s.sport==='RUN'&&s.prescription);
const longOf=w=>w.sessions.find(s=>s.role==='LONG')?.prescription?.durationMinutes??null;
const mar=(over={},sched={},{weeks=16,date='2027-01-31'}={})=>intake('v1fc-mar',{weeks,athlete:{goals:{run:{kind:'RACE',event:{kind:'MARATHON',date}},strength:'MAINTAIN'},runExperience:'EXPERIENCED',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150},...over},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210,...sched}});
const five=(over={},sched={})=>intake('v1fc-5k',{weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'5K',date:'2027-01-17'}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:110,longestRunMinutes:45},...over},schedule:{runDays:[0,2,5],strengthDays:[1,3],runMinutes:50,strengthMinutes:40,longRunDay:5,longRunMinutes:70,...sched}});
const missLong=(from,to)=>({weeks:Array.from({length:16},(_,w)=>w>=from&&w<to?{missed:[{sport:'RUN',role:'LONG'}]}:{})});

// ---------- SSCTR ----------
test('R-01 (Amendment 2): marathon race day reads the longest long run executed in the 30 days before the first taper day; long runs done long ago count for nothing',()=>{
 assert.equal(X.marathon.raceDayLongRunWindowDaysBeforeFirstTaperDay,A2.raceDayLongRunWindowDaysBeforeFirstTaperDay);assert.equal(X.marathon.raceDayLongRunBasis,A2.raceDayLongRunBasis);assert.equal(X.marathon.taperLongRunBasis,A2.taperLongRunBasis);
 // The judge's reproduction: 150 minutes executed in weeks 0 and 1, then every long run missed. Race day is a completion, with the caution.
 const old=simulateProgram(mar(),missLong(2,12),dev).finalProgram,race=all(old).find(s=>s.role==='RACE'),E=old.phases.raceWeek;
 assert.equal(race.prescription.completion,true,'long runs about 11 weeks before the race decide nothing');
 const note=old.negotiation.find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');assert.deepEqual(note.options,['Choose a later or shorter event','Keep the event and complete it with walk breaks']);
 assert.match(note.detail,/is 0 minutes \(earlier long runs are too long ago to count\)/);assert.ok(!old.negotiation.some(n=>n.id==='MARATHON_PROJECTION'),'R-02: no projection of marathon effort beside a completion');
 // The taper long run reads the same window: with nothing in it, it is that week's easy run (the long-run floor), never 0.7 of an old peak.
 for(const k of [E-2,E-1]){const w=old.weeks[k],easy=Math.max(...runs(w).filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes));assert.ok((longOf(w)??0)<=easy,`taper week ${k}: ${longOf(w)} against an easy run of ${easy}`);}
 // Fully executed: marathon effort. Only the last two specific long runs missed: still marathon effort (the window holds the earlier ones).
 const done=simulateProgram(mar(),{},dev).finalProgram,E2=done.phases.raceWeek;assert.equal(all(done).find(s=>s.role==='RACE').prescription.effortDomain,'MARATHON_EFFORT');
 const two=simulateProgram(mar(),missLong(E2-4,E2-2),dev).finalProgram,r2=all(two).find(s=>s.role==='RACE');assert.equal(r2.prescription.effortDomain,'MARATHON_EFFORT');assert.equal(r2.prescription.completion,undefined);
 // G.1: the half marathon keeps the program's highest executed long run (the R6 rule); its states hold no per-week record.
 const hm=simulateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{},dev).finalProgram;assert.ok(hm.stateTrace.every(s=>s.run?.achieved?.longByWeek===undefined));
});
test('R-02 (Amendment 1, on reprojection): the projection note is each proposal\'s own; it never promises marathon effort over a plan that no longer reaches it',()=>{
 const r=simulateProgram(mar(),missLong(2,12),dev);let seen=0,firstWeek=null;
 for(const row of r.rows){const p=row.weekly?.result?.proposal;if(!p)continue;const race=all(p).find(s=>s.role==='RACE'),proj=(p.negotiation??[]).find(n=>n.id==='MARATHON_PROJECTION'),amb=(p.negotiation??[]).find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');
  if(race?.prescription.completion){seen++;firstWeek??=row.weekIndex;assert.equal(proj,undefined,`week ${row.weekIndex}: a completion carries no projection of marathon effort`);assert.equal(amb?.caution,'LATER_OR_SHORTER_EVENT_FIRST');}
  else if(race){assert.ok(proj&&proj.projectedLongRunMinutes>=150,`week ${row.weekIndex}`);assert.match(proj.detail,/between about 7 and 3 weeks before the race/);assert.ok(proj.detail.includes(`reaches about ${proj.projectedLongRunMinutes} minutes`));}}
 assert.ok(seen>=1,'the shortfall is shown on a proposal');assert.ok(firstWeek<12,'as soon as it is projected, not only in race week: week '+firstWeek);
 const p0=generateProgram(mar(),dev);assert.match(p0.negotiation.find(n=>n.id==='MARATHON_PROJECTION').detail,/conditional projection, never a promise/);
});
test('R-03, R-04: with a race early in its week the taper quality is still reduced from the peak session, and light strength after a marathon is at most one session in any 7 days',()=>{
 // A Monday race: the taper counts days, so a session of a specific week planned under taper rules is never the peak the next one reduces from.
 const f=simulateProgram(mar({},{},{date:'2027-01-25'}),{},dev).finalProgram,race=all(f).find(s=>s.role==='RACE'),before=s=>Math.round((Date.parse(race.date)-Date.parse(s.date))/864e5),total=w=>w.repetitions*w.workMinutes;
 assert.equal(f.goal.run.event?.kind,'MARATHON');
 const peak=Math.max(...fam(f,'MARATHON_SPECIFIC').filter(s=>before(s)>20).map(s=>total(s.prescription.work))),tq=fam(f,'MARATHON_SPECIFIC').filter(s=>before(s)>=7&&before(s)<=20);
 assert.ok(tq.length>=1);for(const s of tq){const want=before(s)>=14?0.6:0.5;assert.ok(Math.abs(total(s.prescription.work)-peak*want)<=2,`day -${before(s)}: ${total(s.prescription.work)} of a peak of ${peak}`);}
 // Strength on Monday and Friday after a Sunday marathon.
 const g=simulateProgram(mar({},{strengthDays:[0,4],runDays:[1,2,3,5,6]}),{},dev).finalProgram,r2=all(g).find(s=>s.role==='RACE'),since=s=>Math.round((Date.parse(s.date)-Date.parse(r2.date))/864e5);
 assert.equal(g.goal.run.event?.kind,'MARATHON');
 const lifts=all(g).filter(s=>s.sport==='STRENGTH'&&s.prescription&&since(s)>0&&since(s)<=14).map(since);assert.ok(lifts.length>=1&&lifts.every(d=>d>3),'none on days 1 to 3: '+lifts);
 for(let i=1;i<lifts.length;i++)assert.ok(lifts[i]-lifts[i-1]>=7,'at most one in any 7 days: '+lifts);
});
test('R-05, R-06: the run-days note at exactly four days, and the 5K threshold note only where the plan holds quality sessions',()=>{
 assert.doesNotMatch(generateProgram(mar(),dev).negotiation.find(n=>n.id==='MARATHON_BLOCK_NOTES').detail,/With 4 run days/);
 const four=generateProgram(mar({recent:{runDaysPerWeek:4,runMinutesPerWeek:400,longestRunMinutes:160}},{runDays:[0,2,4,6],strengthDays:[1,3],runMinutes:100}),dev);
 if(four.program.goal.run.event)assert.match(four.negotiation.find(n=>n.id==='MARATHON_BLOCK_NOTES').detail,/With 4 run days your long run may be held by the weekly share/);
 const beg=generateProgram(five({runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},{runDays:[1,3,5],runMinutes:35,longRunMinutes:undefined}),dev);
 assert.equal(beg.program.goal.run.event.thresholdOnly,true);assert.ok(!beg.negotiation.some(n=>n.id==='EVENT_5K_THRESHOLD_INTERVALS'),'a walk/jog athlete gets no intervals, so no note about them');
 const nov=generateProgram(five({runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:130,longestRunMinutes:45}}),dev);assert.ok(nov.negotiation.some(n=>n.id==='EVENT_5K_THRESHOLD_INTERVALS'));
});

// ---------- Security ----------
const TZ='-03:00',KEY=Buffer.from('v1fc-fix-key-not-a-secret-00001'),ME={athleteId:'ath-v1fc-fix'},CONSENTS={COACHING:true,HEALTH_SIGNALS:true,LEARNING:false};
let n=0;const rid=()=>`fix-${++n}`;
function server({start='2026-11-09',intake:inp=HYBRID(),consents=CONSENTS,engine,enrollAt=-2}={}){
 const at=(w,d,hm='20:00')=>Date.parse(`${addDays(start,w*7+d)}T${hm}:00${TZ}`),clock={t:Date.parse(`${addDays(start,enrollAt)}T12:00:00${TZ}`)},store=memoryStore(),logs=[];
 const custody=createCustody({store,key:KEY,now:()=>clock.t,...(engine?{engine}:{})}),api=createBoundary({custody,now:()=>clock.t,log:x=>logs.push(x)});
 const s={store,custody,api,clock,start,logs,set:(w,d,hm)=>{clock.t=at(w,d,hm);}};
 const e=api.onboard({actor:ME,intake:inp,consents,clientRequestId:rid()});assert.ok(e.ok&&e.enrolled,JSON.stringify(e));return s;
}
const doc=s=>s.custody.read({actor:ME}).doc,ver=s=>doc(s).version;
const elig=s=>({...ELIG(new Date(s.clock.t-3*3600e3).toISOString().slice(0,10)),assessedAt:new Date(s.clock.t).toISOString()});
const reportOf=x=>({sessionId:x.id,occurredOn:x.date,completed:true,minutes:x.prescription.durationMinutes,...(x.sport==='STRENGTH'?{exercises:x.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}});
const checkIn=(s,w)=>{s.set(w,6,'20:00');const r=s.api.weeklyCheckIn({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),reports:doc(s).program.weeks[w].sessions.filter(x=>live(x)&&!x.optional).map(reportOf)});assert.ok(r.ok,JSON.stringify(r.error));return r;};
const signHold=s=>{const r=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W7]:true},intent:'REST',days:5}});assert.equal(r.ok,true,JSON.stringify(r.error));return r;};

test('SEC-V1FC-01: the erased flag and the annotation pointer are under a MAC: an erasure marker (a hold) can no longer be turned into an erased slot in storage',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const hold=signHold(s);
 assert.ok(s.api.eraseHealthFacts({actor:ME,eventIds:[hold.eventId],expectedVersion:ver(s)}).ok);assert.equal(s.api.plan({actor:ME}).view.state,S.BLOCKED);
 const raw=s.store.raw(ME.athleteId),tamper=f=>{const d=JSON.parse(raw);f(d);s.store.setRaw(ME.athleteId,JSON.stringify(d));const r=s.api.plan({actor:ME});s.store.setRaw(ME.athleteId,raw);return r;};
 const m=JSON.parse(raw).rows.findIndex(r=>r?.fact===F.ERASED_F08);assert.ok(m>=0);
 // The reviewer's tamper, without the key: null the marker row and flag its chain entry as erased.
 const a=tamper(d=>{d.rows[m]=null;d.chain[m].erased=true;});assert.equal(a.ok,false);assert.equal(a.error.code,'INTEGRITY_FAILURE');assert.equal(a.state,S.INTEGRITY_FAILURE);
 // Un-erasing a slot, or flagging any other row as erased, fails the same way.
 const e=JSON.parse(raw).chain.findIndex(c=>c.erased);assert.equal(tamper(d=>{delete d.chain[e].erased;}).error.code,'INTEGRITY_FAILURE');
 assert.equal(tamper(d=>{d.rows[0]=null;d.chain[0].erased=true;}).error.code,'INTEGRITY_FAILURE');
 // The annotation pointer: an entry cannot be re-pointed or turned into an annotation.
 const t=server();checkIn(t,0);const raw2=t.store.raw(ME.athleteId),bad=f=>{const d=JSON.parse(raw2);f(d);t.store.setRaw(ME.athleteId,JSON.stringify(d));const r=t.api.plan({actor:ME});t.store.setRaw(ME.athleteId,raw2);return r;};
 assert.equal(bad(d=>{const k=d.chain.length-1;d.chain[k].of=1;d.rows[k]=null;}).error.code,'INTEGRITY_FAILURE');
 assert.equal(t.api.plan({actor:ME}).ok,true,'the untouched record still reads');assert.equal(s.api.plan({actor:ME}).view.state,S.BLOCKED,'and the erased hold still holds');
});
test('SEC-V1FC-02: the V1 entry point takes the onboarding intake and its own plans only; a legacy input never makes or stores a plan, and never locks the record',()=>{
 const legacy={...HYBRID(),version:'R5-INPUT-1'};
 assert.equal(V1.generateProgram(legacy).status,'INVALID_INPUT');assert.equal(V1.generateProgram(legacy).program,null);assert.equal(V1.generateProgram(null).status,'INVALID_INPUT');
 assert.equal(V1.restartProgram({intake:legacy,record:[]}).status,'INVALID_INPUT');assert.equal(V1.evaluateProgram({version:'R6-LEGACY-PROGRAM-1'},{}).status,'HOLD');assert.equal(V1.evaluateProgram(null,{}).status,'HOLD');
 const clock={t:Date.parse('2026-11-07T12:00:00-03:00')},store=memoryStore(),custody=createCustody({store,key:KEY,now:()=>clock.t}),api=createBoundary({custody,now:()=>clock.t});
 const e=api.onboard({actor:ME,intake:legacy,consents:CONSENTS,clientRequestId:rid()});assert.equal(e.enrolled,false);assert.equal(e.status,'INVALID_INPUT');assert.equal(store.raw(ME.athleteId),null,'nothing is stored');
 assert.ok(api.onboard({actor:ME,intake:HYBRID(),consents:CONSENTS,clientRequestId:rid()}).enrolled,'the athlete can still enrol');
 const kept=store.raw(ME.athleteId),r=api.restart({actor:ME,intake:legacy,expectedVersion:1});assert.notEqual(r.status,'PROPOSED');assert.equal(store.raw(ME.athleteId),kept);assert.equal(api.plan({actor:ME}).ok,true,'the record still reads');
 // An engine that returned a plan custody cannot read back is refused before anything is stored.
 const odd=createCustody({store:memoryStore(),key:KEY,now:()=>clock.t,engine:{...V1,generateProgram:i=>({...V1.generateProgram(i),program:{version:'R6-LEGACY-PROGRAM-1'}})}});
 assert.equal(odd.enroll({actor:ME,intake:HYBRID(),consents:CONSENTS,clientRequestId:rid()}).error.code,'ENGINE_CONTRACT_VIOLATION');
});
test('SEC-V1FC-03: a session named as missed is the one the same request reports as not done, of this week and not ahead; no other session is moved or copied',()=>{
 const make=()=>{const s=server({start:'2026-11-02',intake:EDGE_PROFILES.TEN_K_EIGHT_WEEKS,enrollAt:-1});for(const w of [0,1,2,3])checkIn(s,w);return s;};
 const s=make(),p=doc(s).program,q4=p.weeks[4].sessions.find(x=>x.role==='QUALITY'),q5=p.weeks[5].sessions.find(x=>x.role==='QUALITY'||x.key&&x.sport==='RUN'),long4=p.weeks[4].sessions.find(x=>x.role==='LONG');
 s.set(4,q4.day,'21:00');const kept=p.hash,sub=(review)=>s.custody.submit({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),review:{eligibility:elig(s),...review}});
 const missed=x=>({sessionId:x.id,occurrenceDate:x.date,actual:{completed:false},response:{}});
 // The app names another session than the one it reports: refused, nothing changes.
 for(const target of [q5.id,long4.id,'w0-run-d0','nope'])assert.equal(sub({kind:'MISSED_SESSION',observations:[missed(q4)],targetSessionId:target}).error.code,'INVALID_REQUEST',target);
 assert.equal(sub({kind:'MISSED_SESSION',observations:[{...missed(q4),actual:{completed:true,minutes:30}}],targetSessionId:q4.id}).error.code,'INVALID_REQUEST','a session reported as done is not missed');
 assert.equal(doc(s).program.hash,kept);assert.equal(doc(s).pending,null);
 // A session of next week, or one still ahead this week, reported as missed: asked, never moved (no work is brought forward or planned twice).
 const next=sub({kind:'MISSED_SESSION',observations:[missed(q5)],targetSessionId:q5.id});assert.equal(next.ok,true);assert.equal(next.status,'ASK');assert.equal(next.offer,undefined);assert.deepEqual(next.decision.missingInputs,['targetSessionId']);
 const t=make();t.set(4,q4.day,'21:00');const ahead=t.custody.submit({actor:ME,clientRequestId:rid(),expectedVersion:ver(t),review:{eligibility:elig(t),kind:'MISSED_SESSION',observations:[missed(long4)],targetSessionId:long4.id}});
 assert.equal(ahead.status,'ASK');assert.equal(ahead.offer,undefined);assert.equal(doc(t).pending,null);
 // The honest report still gets its offer.
 const u=make();u.set(4,q4.day,'21:00');const ok=u.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver(u),eligibility:elig(u),sessionId:q4.id,occurredOn:q4.date,completed:false});assert.equal(ok.offer?.kind,'MOVE');
 const moved=doc(u).pending.proposal.weeks[4].sessions.filter(x=>x.prescription&&x.status!=='SKIPPED'&&x.role==='QUALITY');assert.equal(moved.length,1,'the week holds one quality session, never two');
});
test('SEC-V1FC-05, -06, -07, -08: an erased report takes its question with it; only health events are scrubbed; a learned change needs the learning consent; refusals carry neutral codes',()=>{
 // -05: a "not 100%" report that was asked about an unanswered sign, then erased: the view no longer asks the erased question.
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const signs=NO('MILD_ILLNESS');delete signs[F.WARNING_SIGNS.W1];
 const ask=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'MILD_ILLNESS',warningSigns:signs,intent:'REST',days:4}});assert.equal(ask.view.state,S.NEEDS_INPUT);
 const e=s.api.eraseHealthFacts({actor:ME,eventIds:[ask.eventId],expectedVersion:ver(s)});assert.ok(e.ok);assert.equal(doc(s).reference,null);assert.equal(e.view.question,null);assert.ok(!s.store.raw(ME.athleteId).includes(F.WARNING_SIGNS.W1));
 // -06: naming an ordinary review beside a health event erases nothing of the ordinary one.
 const t=server(),wk=checkIn(t,0);t.set(1,1,'08:00');const rep=t.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(t),eligibility:elig(t),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4}});
 const before=doc(t).decisions.find(d=>d.eventId===wk.eventId);assert.ok(t.api.eraseHealthFacts({actor:ME,eventIds:[rep.eventId,wk.eventId],expectedVersion:ver(t)}).ok);
 assert.deepEqual(doc(t).decisions.find(d=>d.eventId===wk.eventId),before,'the weekly review keeps its entry');assert.equal(doc(t).decisions.find(d=>d.eventId===rep.eventId).kind,'ERASED');
 assert.equal(t.api.eraseHealthFacts({actor:ME,eventIds:[wk.eventId],expectedVersion:ver(t)}).error.code,'NOT_FOUND','an ordinary review alone is no health fact');
 const h=server();checkIn(h,0);h.set(1,1,'08:00');const hold=signHold(h),wk0=doc(h).decisions.find(d=>d.kind==='WEEKLY_REVIEW');
 assert.ok(h.api.eraseHealthFacts({actor:ME,eventIds:[hold.eventId,wk0.eventId],expectedVersion:ver(h)}).ok);assert.deepEqual(doc(h).decisions.find(d=>d.eventId===wk0.eventId),wk0);
 // -07: a waiting learned rearrangement is closed when the learning consent is revoked, and never adopted without it.
 const engine={...V1,evaluateProgram:(program,input,options={})=>{const r=V1.evaluateProgram(program,input,options);if(input.event.kind!=='WEEKLY_REVIEW'||!r.proposal||options.withhold?.includes('LEARNED_REARRANGEMENT'))return r;
  const p=JSON.parse(JSON.stringify(r.proposal));p.arrangementSessions={...p.arrangementSessions,__learned:true};return {...r,action:'LEARNED_REARRANGEMENT',proposal:p,learnedPatterns:[{cause:'X'}]};}};
 const l=server({engine,consents:{...CONSENTS,LEARNING:true}}),off=checkIn(l,0);assert.equal(off.offer?.kind,'LEARNED_REARRANGEMENT');
 assert.ok(l.api.setConsent({actor:ME,purpose:'LEARNING',granted:false,expectedVersion:ver(l)}).ok);assert.equal(doc(l).pending,null);assert.ok(doc(l).decisions.some(d=>d.of===off.decisionId&&d.cause==='CONSENT_REVOKED'));
 assert.equal(l.api.accept({actor:ME,decisionId:off.decisionId,expectedVersion:ver(l)}).error.code,'NOT_PENDING');
 // -08: no refusal code is a health-derived word, and the new response fields never reach telemetry.
 const src=fs.readFileSync(new URL('../src/boundary/custody.mjs',import.meta.url),'utf8'),codes=[...src.matchAll(/fail\('([A-Z_]+)'/g)].map(m=>m[1]);
 for(const c of new Set(codes))assert.ok(!NEVER_OUTBOUND.some(w=>c.includes(w)),c);
 const tel=JSON.stringify(telemetryOf('notFeeling100',rep));assert.ok(!/unavailable|TEMPORARY_REDUCTION|offer|agency/.test(tel),tel);
});
