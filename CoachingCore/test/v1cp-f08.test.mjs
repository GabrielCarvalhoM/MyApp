// V1 Coaching Productization, Block 2: F08 under DR-148 (Founder D2; PCG-V1CP-F08 r2; Security SEC-V1CP-01..27), with the sporting mapping of
// SSCTR-V1CP-DECISION Q05-Q08 (returnLadder, warningSignInstrument). Directed tests of C-Q05-9, C-Q06-3, C-Q07-4 and C-Q08-5, and the core-level
// tests of SEC-V1CP-02, 03, 21, 22 and 23. The software never makes the clinical judgment, and a recovering athlete always has a legitimate way back.
//   S1 (NOT_FEELING_100, WELLBEING_CHECK): every warning sign answered no opens a 3-14 day window at the intent's rung for the affected sports;
//       after it the affected sessions wait for the window-end check; the return climbs the speed's rungs one executed plan week at a time.
//   S2 (READINESS_DECLARATION): after a clinical hold, the athlete's declaration restarts each sport declared ready at MODERATE or above, its first
//       step held one more week; restrictions are hard caps; any sign returns to the hold; nothing says "cleared".
//   S3 (restartProgram): a new plan from the cold start, never above the in-program return of the same pause, the record kept whole.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram,restartProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const F=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/v1-f08.mjs')).href);
const {HYBRID,doneBefore,live}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/test/v1cp-fixtures.mjs')).href);
const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false])),XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false])),S6NO=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}},x={})=>({declaredRecovered:true,warningSigns:RNO(),sports,...x});
const FORBIDDEN=/\b(cleared|clearance granted|liberad[oa]|libera[çc][ãa]o|approved by|released|fit to train|safe to (train|run)|apto|alta m[eé]dica)\b/i;
function timeline(input=HYBRID()){
 const t={p:generateProgram(input).program,ledger:[],ref:null,n:0,results:[]};
 t.step=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`f08-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day,extra.flags??{}),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.substitution?{substitution:extra.substitution}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})};
  const r=evaluateProgram(t.p,review);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 return t;
}
const sessionsIn=(p,from,to,sport)=>p.weeks.flatMap(x=>x.sessions).filter(s=>s.date>=from&&s.date<=to&&(!sport||s.sport===sport));
const rowsOf=s=>(s.prescription?.exercises??[]);
const facts=(t,f)=>t.ledger.filter(o=>o.fact===f);
/** Reports of week w's live sessions, done as prescribed; `adverse` session ids report an adverse recovery, `skip` ids are not reported. */
const doneWeek=(t,w,{adverse=[],skip=[]}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId)&&!skip.includes(o.sessionId)).map(o=>adverse.includes(o.sessionId)?{...o,eventId:o.eventId+'-adverse',response:{...o.response,recovery:'ADVERSE'}}:o);
const ladder=(p,w)=>{const m=(p.weeks[w]?.adaptations??[]).find(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER');return m?m.rungs:null;};
const maxSets=(p,w)=>{const o={};for(const s of p.weeks[w].sessions.filter(x=>x.sport==='STRENGTH'&&live(x)))for(const e of rowsOf(s))o[e.id]=Math.max(o[e.id]??0,e.sets);return o;};
/** Week 0 done and reviewed; the report on week 1's Tuesday morning; each window week done (unless `skipWindow`) and reviewed with its check;
 * the last review of the window is the window-end check (improved). Returns the timeline and the week the return starts. */
function windowThenCheck({condition='MILD_ILLNESS',intent='REDUCE_SUBSTANTIAL',days=5,speed='BALANCED',sports,region,skipWindow=false,improved=true}={}){
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const r=t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition,warningSigns:NO(condition),intent,days,returnSpeed:speed,...(sports?{sports}:{}),...(region?{region}:{})}},'08:00');
 assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);
 const end=Math.floor((8+days-1)/7);
 for(let w=1;w<=end;w++){const obs=skipWindow?[]:doneWeek(t,w);const g=t.step(w,6,'WEEKLY_REVIEW',{observations:obs,check:{warningSigns:NO(condition),...(obs.length?{exerciseResponse:XNO(condition)}:{}),...(w===end?{improved}:{})}});if(w===end)t.endReview=g;}
 return {t,from:end+1};
}

// ---------------- Situation 1: the entry ----------------
test('S1-1 (C-Q05-9, SEC-V1CP-02/03): any warning sign yes routes to the clinical hold; an unanswered one is asked; only the vocabulary is read',()=>{
 const wb=c=>({condition:c,warningSigns:NO(c),intent:'REST',days:5});
 for(const c of ['MINOR_DISCOMFORT','MILD_ILLNESS'])for(const k of F.signsFor(c)){const r=timeline().step(1,1,'NOT_FEELING_100',{wellbeing:{...wb(c),warningSigns:{...NO(c),[k]:true}}});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',c+' '+k);assert.equal(r.proposal,null);assert.match(r.reason,/professional assessment/);assert.doesNotMatch(r.reason,FORBIDDEN);}
 const W=F.WARNING_SIGNS;
 assert.ok(!F.signsFor('UNUSUAL_FATIGUE').includes(W.W11)&&!F.signsFor('UNUSUAL_FATIGUE').includes(W.W15)&&F.signsFor('UNUSUAL_FATIGUE').includes(W.W10),'training fatigue alone is not routed clinical');
 assert.ok(F.signsFor('MILD_ILLNESS').includes(W.W11)&&F.signsFor('MILD_ILLNESS').includes(W.W15)&&!F.signsFor('MINOR_DISCOMFORT').includes(W.W10));
 const t=timeline();
 for(const k of F.signsFor('MILD_ILLNESS')){const s={...NO('MILD_ILLNESS')};delete s[k];const r=t.step(1,1,'NOT_FEELING_100',{wellbeing:{...wb('MILD_ILLNESS'),warningSigns:s}});assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['wellbeing.warningSigns.'+k]);}
 assert.ok(t.step(1,1,'NOT_FEELING_100',{wellbeing:{...wb('MILD_ILLNESS'),warningSigns:{...NO('MILD_ILLNESS'),[W.W1]:'no'}}}).missingInputs.includes('wellbeing.warningSigns.'+W.W1),'a non-boolean answer is unknown, never no');
 for(const [x,key] of [[{days:2},'wellbeing.days'],[{days:15},'wellbeing.days'],[{text:'flu'},'wellbeing.unrecognized'],[{professionalSeen:true},'wellbeing.unrecognized'],[{condition:'COVID'},'wellbeing.condition'],[{intent:'TRAIN_HARDER'},'wellbeing.intent'],[{region:'LEFT_KNEE'},'wellbeing.region'],[{sports:['SWIM']},'wellbeing.sports'],[{startDate:t.day(1,3)},'wellbeing.startDate']]){
  const r=t.step(1,1,'NOT_FEELING_100',{wellbeing:{...wb('MINOR_DISCOMFORT'),...x}});assert.equal(r.status,'ASK',JSON.stringify(x));assert.ok(r.missingInputs.includes(key),JSON.stringify(r.missingInputs));
 }
 const stale=t.step(1,1,'NOT_FEELING_100',{wellbeing:wb('MINOR_DISCOMFORT'),eligibility:ELIG(t.day(0,6))});assert.deepEqual(stale.missingInputs,['eligibility.assessedToday'],'the screen is answered with the report (Q4 scoping)');
 assert.equal(facts(t,'WELLBEING_DECLARED').length,0,'nothing is recorded until a window opens');
});

test('S1-2 (C-Q05-9): each condition and intent pair is allowed or refused as decided',()=>{
 for(const c of F.CONDITIONS)for(const i of F.INTENTS){
  const r=timeline().step(1,1,'NOT_FEELING_100',{wellbeing:{condition:c,warningSigns:NO(c),intent:i,days:4}});const ok=!(F.ILLNESS_TYPE.includes(c)&&i==='REDUCE_LIGHT');
  assert.equal(r.action,ok?'WELLBEING_REDUCTION':'ASK',`${c} ${i}: ${r.reason}`);if(!ok)assert.match(r.reason,/no long run/);
 }
});

test('S1-3 (Q05, C-Q05-9): the window runs the intent\'s rung; a local report changes only the sports and the region it states; a systemic one covers both',()=>{
 let t=timeline();t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}},'08:00');
 const win=sessionsIn(t.p,t.day(1,1),t.day(1,5)).filter(live);
 assert.ok(win.some(s=>s.sport==='RUN')&&win.some(s=>s.sport==='STRENGTH'));
 for(const s of win){if(s.sport==='RUN'){assert.equal(s.role,'EASY',s.id);assert.ok(!s.prescription.strides);}else for(const e of rowsOf(s)){assert.equal(e.sets,1,e.id);assert.ok(e.rir>=4,e.id);}}
 // After the window, the affected sessions wait for the window-end check (C-Q05-1).
 assert.ok(sessionsIn(t.p,t.day(1,6),t.day(3,6)).every(s=>!live(s)&&(!s.explanation||/Waiting for your check/.test(s.explanation))),'no session after the window before the check');
 assert.equal(timeline().step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:4,sports:['RUN']}}).status,'ASK','a systemic condition affects both sports');
 // R1: light activity only: optional walks, never a run; strength rests.
 t=timeline();t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'LIGHT_ACTIVITY_ONLY',days:5}},'08:00');
 for(const s of sessionsIn(t.p,t.day(1,1),t.day(1,5))){if(s.sport==='RUN'&&live(s)){assert.equal(s.role,'WALK');assert.equal(s.optional,true);}if(s.sport==='STRENGTH')assert.ok(!live(s));}
 // R3: quality and strides go, the long run at its consolidation length, strength one set fewer at four or more in reserve.
 // The rungs act on the doses the window holds (this week's start once week 0 was reviewed), never on a projection.
 t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});const b0=t.p;t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:5}},'08:00');
 const long=sessionsIn(t.p,t.day(1,5),t.day(1,5),'RUN')[0],long0=sessionsIn(b0,t.day(1,5),t.day(1,5),'RUN')[0];
 assert.equal(long.role,'LONG');assert.equal(long.prescription.durationMinutes,Math.max(15,long0.prescription.durationMinutes-10));
 const fri=sessionsIn(t.p,t.day(1,4),t.day(1,4),'STRENGTH')[0],fri0=sessionsIn(b0,t.day(1,4),t.day(1,4),'STRENGTH')[0];
 for(const e of rowsOf(fri)){const e0=rowsOf(fri0).find(x=>x.id===e.id);assert.equal(e.sets,Math.max(1,e0.sets-1));assert.ok(e.rir>=4);assert.equal(hash(e.load),hash(e0.load),'no load step; the load is chosen by effort, never above it');}
 // A local discomfort of running only: strength is unchanged, in the window and after it.
 t=timeline();const b2=t.p;t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['RUN'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:4}},'08:00');
 assert.deepEqual(sessionsIn(t.p,t.day(1,0),t.day(3,6),'STRENGTH').map(s=>hash(s.prescription)),sessionsIn(b2,t.day(1,0),t.day(3,6),'STRENGTH').map(s=>hash(s.prescription)),'the unaffected sport is unchanged');
 assert.ok(sessionsIn(t.p,t.day(1,1),t.day(1,4),'RUN').every(s=>!live(s)));
 // A lower-body strength discomfort: only the lower rows change; running is untouched.
 t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});const b3=t.p;t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],region:'LOWER_BODY',warningSigns:NO('MINOR_DISCOMFORT'),intent:'REDUCE_LIGHT',days:4}},'08:00');
 const f=sessionsIn(t.p,t.day(1,4),t.day(1,4),'STRENGTH')[0],f0=sessionsIn(b3,t.day(1,4),t.day(1,4),'STRENGTH')[0];
 assert.ok(rowsOf(f).some(e=>e.region==='LOWER')&&rowsOf(f).some(e=>e.region!=='LOWER'));
 for(const e of rowsOf(f)){const e0=rowsOf(f0).find(x=>x.id===e.id);if(e.region==='LOWER'){assert.ok(e.rir>=4);assert.ok(e.sets<=Math.max(1,e0.sets-1));}else assert.deepEqual([e.sets,e.rir],[e0.sets,e0.rir],e.id);}
 assert.deepEqual(sessionsIn(t.p,t.day(1,1),t.day(2,6),'RUN').map(s=>hash(s.prescription)),sessionsIn(b3,t.day(1,1),t.day(2,6),'RUN').map(s=>hash(s.prescription)));
});

test('S1-4 (C-Q05-3, C-Q05-9): a window holding the race day is asked; a replay changes nothing; the weeks a window covers release no step',()=>{
 const race=HYBRID();race.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date:'2026-12-05'}},strength:'GENERAL'};
 const t=timeline(race),raceDay=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE').date,w=Math.floor((Date.parse(raceDay)-Date.parse(t.p.startDate))/864e5/7),d=(Date.parse(raceDay)-Date.parse(t.p.weeks[w].startDate))/864e5;
 const ill=t.step(w,Math.max(0,d-3),'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5}},'08:00');
 assert.equal(ill.status,'ASK');assert.match(ill.reason,/race/);assert.match(ill.reason,/does not plan a race while you are unwell/);assert.equal(ill.proposal,null);
 const u=timeline();u.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(u.p,1)});
 const wb={condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_LIGHT',days:9};
 assert.equal(u.step(1,1,'NOT_FEELING_100',{wellbeing:wb,eventId:'nf-1'},'08:00').action,'WELLBEING_REDUCTION');
 const again=u.step(1,1,'NOT_FEELING_100',{wellbeing:wb,eventId:'nf-1'},'08:30');assert.equal(again.status,'KEEP');assert.equal(facts(u,'WELLBEING_DECLARED').length,1);
 const start=hash(u.p.stateTrace[2]);
 const g=u.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(u,1),check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}});
 assert.ok(Object.values(g.gates).every(x=>x!=='ADVANCE'&&x!=='EARNED'),'no step from a week the window covers');
 assert.ok(Object.values(u.p.weeks[2].adaptations.find(a=>a.phase==='WINDOW').starts).every(x=>x==='FIXED')&&hash(u.p.stateTrace[2].strength.exercises)===hash(JSON.parse(JSON.stringify(u.p.stateTrace[2].strength.exercises))),'the window\'s later week starts where it was held');
 assert.ok(start);
});

// ---------------- Situation 1: the window's end and the return ----------------
test('S1-5 (C-Q05-1, persistence): the return starts only after the window-end check; not improved routes to assessment, never a new window',()=>{
 const sick=windowThenCheck({condition:'MILD_ILLNESS',intent:'REST',days:5,improved:false});
 assert.equal(sick.t.endReview.status,'CLINICAL_HUMAN_REQUIRED');assert.match(sick.t.endReview.reason,/professional assessment/);assert.doesNotMatch(sick.t.endReview.reason,FORBIDDEN);
 assert.equal(sick.t.step(2,1,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED','the hold stands until the readiness declaration');
 const rest=windowThenCheck({condition:'NEED_REST',intent:'REST',days:5,improved:false});
 assert.equal(rest.t.endReview.status,'ASK');assert.match(rest.t.endReview.reason,/break|new plan/);assert.ok(sessionsIn(rest.t.p,rest.t.day(2,0),rest.t.day(2,6)).every(s=>!live(s)),'the sessions keep waiting');
 // The check event: without "improved" it is asked; a warning sign at the check routes to the hold; improved starts the return that day.
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3}},'08:00');
 assert.ok(sessionsIn(t.p,t.day(1,4),t.day(1,6)).every(s=>!live(s)),'after the window and before the check nothing is planned');
 const half=t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE')}},'07:00');assert.equal(half.status,'ASK');assert.deepEqual(half.missingInputs,['wellbeingCheck.improved']);
 const ok=t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:true}},'07:00');assert.equal(ok.action,'WELLBEING_RETURN_START',ok.reason);
 assert.ok(sessionsIn(t.p,t.day(1,4),t.day(1,6)).some(live),'the return starts the day of the check');
 assert.deepEqual([ladder(t.p,1),ladder(t.p,2),ladder(t.p,3),ladder(t.p,4)].map(x=>x?.RUN??'-'),['R2','R2','R3','R4'],'a partial week repeats its step the next week');
 const s=timeline();s.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(s.p,1)});s.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:3}},'08:00');
 assert.equal(s.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W13]:true},improved:true}},'07:00').status,'CLINICAL_HUMAN_REQUIRED');
});

test('S1-6 (C-Q06-3): each window and speed climbs its rungs one week each; none reaches the held doses before an executed R3 or recipe step (FP-4 apart)',()=>{
 const cases=[['REDUCE_LIGHT','FASTER',5,['R4']],['REDUCE_LIGHT','BALANCED',5,['R3','R4']],['REDUCE_LIGHT','CONSERVATIVE',5,['R3','R4','R4']],['REDUCE_SUBSTANTIAL','FASTER',5,['R3','R4']],['REDUCE_SUBSTANTIAL','BALANCED',5,['R2','R3','R4']],['REDUCE_SUBSTANTIAL','CONSERVATIVE',5,['R2','R3','R4','R4']],['REST','FASTER',5,['R3','R4']],['REST','BALANCED',5,['R2','R3','R4']],['REST','CONSERVATIVE',5,['M']],['LIGHT_ACTIVITY_ONLY','FASTER',12,['M']],['REST','BALANCED',12,['M','M']]];
 for(const [intent,speed,days,want] of cases){
  const {t,from}=windowThenCheck({condition:'UNUSUAL_FATIGUE',intent,speed,days});
  const got=[];for(let w=from;w<from+want.length;w++)got.push(ladder(t.p,w)?.RUN??'-');
  assert.deepEqual(got,want,`${intent} ${speed} ${days}`);assert.equal(ladder(t.p,from+want.length)?.RUN,undefined,`${intent} ${speed}: running moves on after the last step`);
  // Strength may hold one more week at R4 when the next week would add more than one set (D49, QRE-V1CP-05); never another rung.
  for(let w=from+want.length;w<8&&ladder(t.p,w);w++)assert.deepEqual(ladder(t.p,w),{STRENGTH:'R4'},`${intent} ${speed} week ${w}`);
  const firstHeld=want.findIndex(r=>r==='R4');if(firstHeld===0)assert.ok(intent==='REDUCE_LIGHT'&&speed==='FASTER','only FASTER after an easier window resumes the held doses at once (FP-4)');
 }
});

test('S1-7 (C-Q06-3, D49): after 11-14 days the conservative return holds each recipe step one more week and never restarts or clears history',()=>{
 const {t,from}=windowThenCheck({condition:'UNUSUAL_FATIGUE',intent:'REST',speed:'CONSERVATIVE',days:12});
 const runs=w=>sessionsIn(t.p,t.p.weeks[w].startDate,addDays(t.p.weeks[w].startDate,6),'RUN').filter(live).map(s=>s.prescription.durationMinutes).join(',');
 assert.equal(runs(from+1),runs(from),'the entry repeats');assert.equal(runs(from+3),runs(from+2),'the next step repeats');
 for(let w=from;w<8;w++){assert.notEqual(t.p.stateTrace[w].run.mode,'RESTART',`week ${w}: never a restart`);}
 assert.equal(t.p.stateTrace[from].run.achieved.long,t.p.stateTrace[1].run.achieved.long,'achieved history is not cleared');
 // Real weeks: strength sets never rise more than one per executed week across the return.
 let prev=maxSets(t.p,1);for(let w=from;w<8;w++){const cur=maxSets(t.p,w);for(const [id,n] of Object.entries(cur))if(prev[id]!==undefined)assert.ok(n<=prev[id]+1,`week ${w} ${id}: ${prev[id]} to ${n}`);if(w+1<8)t.step(w,6,'WEEKLY_REVIEW',{observations:doneWeek(t,w),check:{warningSigns:NO('UNUSUAL_FATIGUE'),exerciseResponse:XNO('UNUSUAL_FATIGUE')}});prev=cur;}
});

test('S1-8 (transitionRule, C-Q06-1): a rung not done as planned repeats with no debt; a reduced window not done reads as rest (C-Q05-5); loads logged there never become the reference',()=>{
 const {t,from}=windowThenCheck({intent:'REDUCE_SUBSTANTIAL',speed:'BALANCED',days:5});
 assert.deepEqual([ladder(t.p,from)?.RUN,ladder(t.p,from+1)?.RUN],['R2','R3']);
 const runDay=t.p.weeks[from].sessions.find(s=>s.sport==='RUN'&&live(s)).id,ref=hash(t.p.stateTrace[from+2].strength.exercises);
 const g=t.step(from,6,'WEEKLY_REVIEW',{observations:doneWeek(t,from,{skip:[runDay]}),check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS')}});
 assert.match(g.reason,/running: this week was not done as planned|running and strength: this week/);
 assert.deepEqual([ladder(t.p,from+1)?.RUN,ladder(t.p,from+1)?.STRENGTH,ladder(t.p,from+2)?.RUN],['R2','R3','R3'],'only the sport not done repeats; the other climbs');
 assert.equal(hash(t.p.stateTrace[from+2].strength.exercises),ref,'the held strength reference is unchanged by the loads logged on reduced rungs');
 const none=windowThenCheck({intent:'REDUCE_SUBSTANTIAL',speed:'FASTER',days:5,skipWindow:true});
 assert.equal(ladder(none.t.p,none.from)?.RUN,'R3','not done: the window reads as rest (FASTER after rest: R3, R4)');
 assert.match(none.t.endReview.reason,/count as rest/);
});

test('S1-9 (Q06): the speed changes until the return starts, never after',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3,returnSpeed:'BALANCED'}},'08:00');
 const k=t.step(1,2,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),returnSpeed:'FASTER'}},'07:00');assert.equal(k.status,'KEEP');assert.equal(facts(t,'WELLBEING_CHECKED').length,1);
 t.step(1,4,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),improved:true}},'07:00');
 assert.equal(ladder(t.p,2)?.RUN,'R3','FASTER after rest starts at R3');
 const late=t.step(1,5,'WELLBEING_CHECK',{check:{warningSigns:NO('UNUSUAL_FATIGUE'),returnSpeed:'CONSERVATIVE'}},'07:00');assert.equal(late.status,'ASK');assert.match(late.reason,/no longer changes/);
});

test('S1-10 (C-Q05-2 with SSCTR-V1CPI-01, C-Q05-4): a report during the return supersedes it with its own window and coverage; again a week later routes to assessment; an adverse session asks the items',()=>{
 const {t,from}=windowThenCheck({condition:'MINOR_DISCOMFORT',sports:['RUN'],intent:'REDUCE_SUBSTANTIAL',speed:'BALANCED',days:5});
 assert.equal(ladder(t.p,from)?.STRENGTH,undefined,'the running-only episode leaves strength alone');
 const wb={condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:5};
 const r=t.step(from,1,'NOT_FEELING_100',{wellbeing:wb},'08:00');assert.equal(r.action,'WELLBEING_REDUCTION',r.reason);assert.match(r.reason,/replaces what you reported before/);
 const win=sessionsIn(t.p,t.day(from,1),t.day(from,5));assert.ok(win.every(s=>!live(s)),'the illness covers both sports: every session of its window rests (B4)');
 const last=facts(t,'WELLBEING_DECLARED').at(-1);assert.equal(last.wellbeing.supersedes,facts(t,'WELLBEING_DECLARED')[0].eventId);
 assert.ok(t.p.weeks[from+1].adaptations.every(a=>a.episode!==facts(t,'WELLBEING_DECLARED')[0].eventId),'the superseded episode leaves the weeks ahead');
 const again=t.step(from+1,1,'NOT_FEELING_100',{wellbeing:wb},'08:00');assert.equal(again.status,'CLINICAL_HUMAN_REQUIRED');assert.match(again.reason,/professional assessment/);
 // Within the 14 days a continuous window may last: during a window, a new report that would pass them is asked.
 const c=timeline();c.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(c.p,1)});c.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:10}},'08:00');
 const over=c.step(1,4,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REST',days:14}},'08:00');assert.equal(over.status,'ASK');assert.deepEqual(over.missingInputs,['wellbeing.days']);
 // A local report in a scope the open episode does not touch is asked (I-06).
 const n=windowThenCheck({condition:'MINOR_DISCOMFORT',sports:['RUN'],intent:'REDUCE_LIGHT',speed:'BALANCED',days:5});
 const other=n.t.step(n.from,1,'NOT_FEELING_100',{wellbeing:{condition:'MINOR_DISCOMFORT',sports:['STRENGTH'],warningSigns:NO('MINOR_DISCOMFORT'),intent:'REST',days:3}},'08:00');assert.equal(other.status,'ASK');assert.match(other.reason,/one reduction is open at a time/);
 // An adverse session during the return asks the warning signs and the exercise-response items before anything else.
 const u=windowThenCheck({condition:'MILD_ILLNESS',intent:'REDUCE_SUBSTANTIAL',speed:'BALANCED',days:5}),w=u.from,s0=u.t.p.weeks[w].sessions.find(s=>live(s)&&s.date<=u.t.day(w,2)&&s.sport==='STRENGTH');
 const obs=doneWeek(u.t,w,{adverse:[s0.id]}).filter(o=>o.sessionId===s0.id);
 const ask=u.t.step(w,2,'WEEKLY_REVIEW',{observations:obs});assert.equal(ask.status,'ASK');assert.deepEqual(ask.missingInputs,['wellbeingCheck']);assert.match(ask.reason,/not going well.*how your sessions felt/);
 const x=u.t.step(w,2,'WEEKLY_REVIEW',{observations:obs,check:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:{...XNO('MILD_ILLNESS'),[F.EXERCISE_SIGNS.X1]:true}}});assert.equal(x.status,'CLINICAL_HUMAN_REQUIRED');
 const v=windowThenCheck({condition:'MILD_ILLNESS',intent:'REDUCE_SUBSTANTIAL',speed:'BALANCED',days:5});
 const missing=v.t.step(v.from,6,'WEEKLY_REVIEW',{observations:doneWeek(v.t,v.from)});assert.equal(missing.status,'ASK','each weekly review of the return re-asks the warning signs');
});

// ---------------- Situation 2 ----------------
function clinicalBreak(){
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const r=t.step(3,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,1),endDate:t.day(2,6),reasonCategory:'ILLNESS',reason:'flu'}});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');
 return t;
}
function substitutionHold(){
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const mon=t.p.weeks[1].sessions.filter(s=>live(s)&&s.date<=t.day(1,1));t.step(1,1,'WEEKLY_REVIEW',{observations:doneBefore(t.p,2).filter(o=>mon.some(s=>s.id===o.sessionId))});
 const x=t.p.weeks[1].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date>t.day(1,2)),ex=rowsOf(x)[0];
 assert.equal(t.step(1,2,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}).status,'CLINICAL_HUMAN_REQUIRED');
 return t;
}
test('S2-1 (C-Q07-4, SEC-V1CP-22): no declaration stays clinical; any warning sign keeps the hold; a clean one restarts at MODERATE or above, its first step held',()=>{
 const t=clinicalBreak();
 assert.equal(t.step(3,1,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED','no declaration: the hold stands');
 const half=t.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true}})});assert.equal(half.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(half.missingInputs,['readiness.sports.STRENGTH.ready']);
 const unsigned=t.step(3,2,'READINESS_DECLARATION',{readiness:{...READY(),warningSigns:{}}});assert.equal(unsigned.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(unsigned.missingInputs.length,F.READINESS_SIGNS.length);
 for(const k of [F.WARNING_SIGNS.W1,F.WARNING_SIGNS.W13])assert.equal(t.step(3,2,'READINESS_DECLARATION',{readiness:READY(undefined,{warningSigns:{...RNO(),[k]:true}})}).status,'CLINICAL_HUMAN_REQUIRED',k);
 assert.deepEqual(t.step(3,2,'READINESS_DECLARATION',{readiness:READY(),eligibility:ELIG(t.day(3,1))}).missingInputs,['eligibility.assessedToday']);
 assert.ok(t.step(3,2,'READINESS_DECLARATION',{readiness:READY(undefined,{returnSpeed:'FASTER'})}).missingInputs.includes('readiness.returnSpeed'),'no FASTER after a clinical hold');
 const r=t.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true},STRENGTH:{ready:false}})});
 assert.equal(r.action,'REESTABLISH',r.reason);assert.doesNotMatch(r.reason,FORBIDDEN);assert.match(r.reason,/makes no medical judgment/);
 const d=t.p.decisions.at(-1).interruption;assert.equal(d.cause,'CLINICAL');assert.equal(d.restart,'READINESS_DECLARED');assert.ok(['MODERATE','LONG'].includes(d.classBySport.RUN));
 assert.ok(sessionsIn(t.p,t.day(3,3),t.day(5,6),'STRENGTH').every(s=>!live(s)),'strength held');
 assert.equal(facts(t,'INTERRUPTION_DECLARED')[0].interruption.reasonCategory,'ILLNESS','the clinical cause stays on record');
 // A short stop still restarts at MODERATE (no SHORT resume after a clinical hold), its entry held one more week, without old loads.
 const u=substitutionHold(),before=u.p.stateTrace[1].strength.exercises;
 const s=u.step(1,4,'READINESS_DECLARATION',{readiness:READY()});assert.equal(s.action,'READINESS_RESTART',s.reason);
 const rec=u.p.decisions.at(-1).readinessRecord;assert.ok(Object.values(rec.classBySport).every(c=>c!=='SHORT'),JSON.stringify(rec.classBySport));
 const next=sessionsIn(u.p,u.day(2,0),u.day(2,6),'STRENGTH').filter(live).flatMap(rowsOf);assert.ok(next.length&&next.every(e=>e.sets<=1&&e.rir>=4),'the entry dose, never the old loads');
 assert.deepEqual([1,2,3].map(w=>u.p.stateTrace[w].run.returnStep),[0,0,1],'the entry (this week from the declaration) repeats one more week before the first step');
 assert.ok(Object.keys(before).length);
 const c=substitutionHold();c.step(1,4,'READINESS_DECLARATION',{readiness:READY(undefined,{returnSpeed:'CONSERVATIVE'})});
 assert.ok(Object.values(c.p.decisions.at(-1).readinessRecord.classBySport).every(x=>x==='LONG'),'conservative: one class more cautious');
});

test('S2-2 (C-Q07-4): restrictions are hard caps, never substituted; running with a lower-body restriction needs its own answer; one sport can stay held',()=>{
 const t=clinicalBreak();
 const ask=t.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}})});
 assert.equal(ask.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(ask.missingInputs,['readiness.sports.RUN.runningNotRestricted']);
 const held=clinicalBreak();held.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true,runningNotRestricted:false},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}})});
 assert.ok(sessionsIn(held.p,held.day(3,3),held.day(5,6),'RUN').every(s=>!live(s)),'running restricted: held');
 assert.ok(sessionsIn(held.p,held.day(3,3),held.day(5,6),'STRENGTH').some(live),'strength restarts');
 t.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true,runningNotRestricted:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}})});
 const ahead=sessionsIn(t.p,t.day(3,3),t.day(7,6),'STRENGTH').filter(live);
 assert.ok(ahead.length&&ahead.every(s=>rowsOf(s).every(e=>e.region!=='LOWER')),'no lower-body row while restricted, and no substitute');
 assert.ok(sessionsIn(t.p,t.day(4,0),t.day(4,6),'RUN').some(live),'running restarts on its own answer');
 // The restriction ends: only the lower rows restart, at the entry; the upper rows keep their doses (Q07).
 const region=Object.fromEntries(t.p.weeks.flatMap(x=>x.sessions).flatMap(rowsOf).map(e=>[e.id,e.region]));
 t.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(t,3),check:S6NO()});const before=JSON.parse(JSON.stringify(t.p.stateTrace[4].strength.exercises));
 const end=t.step(4,1,'READINESS_DECLARATION',{readiness:READY()},'08:00');assert.equal(end.action,'READINESS_RESTART',end.reason);
 const lower=w=>sessionsIn(t.p,t.day(w,w===4?2:0),t.day(w,6),'STRENGTH').filter(live).flatMap(rowsOf).filter(e=>e.region==='LOWER');
 assert.ok(lower(4).length&&lower(4).every(e=>e.sets<=1&&e.rir>=4),'the restricted rows restart at the entry, never at prior loads');
 assert.ok(lower(5).every(e=>e.sets<=2&&e.rir>=3),'then their own return steps (D49)');
 const after=t.p.stateTrace[4].strength;assert.deepEqual(after.entryRegions,['LOWER']);
 for(const [id,ex] of Object.entries(before))if(region[id]!=='LOWER')assert.deepEqual(after.exercises[id],ex,id+': the other rows keep their own state');
});

test('S2-3 (C-Q07-4, SEC-V1CP-21): during the restart a warning sign or an adverse session routes back with a question; history is kept; no clearance wording',()=>{
 const t=clinicalBreak();t.step(3,2,'READINESS_DECLARATION',{readiness:READY()});
 const ask=t.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(t,3)});assert.equal(ask.status,'ASK','each weekly review of the restart asks the items');
 const ok=t.step(3,6,'WEEKLY_REVIEW',{observations:doneWeek(t,3),check:S6NO()});assert.notEqual(ok.status,'CLINICAL_HUMAN_REQUIRED');assert.notEqual(ok.status,'ASK',ok.reason);
 const s=t.p.weeks[4].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.date<=t.day(4,2)),adverse=doneWeek(t,4,{adverse:[s.id]}).filter(o=>o.sessionId===s.id);
 const q=t.step(4,2,'WEEKLY_REVIEW',{observations:adverse});assert.equal(q.status,'ASK');
 const back=t.step(4,2,'WEEKLY_REVIEW',{observations:adverse,check:{...S6NO(),warningSigns:{...S6NO().warningSigns,[F.WARNING_SIGNS.W6]:true}}});assert.equal(back.status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(t.step(4,3,'WEEKLY_REVIEW').status,'CLINICAL_HUMAN_REQUIRED','a new declaration is needed');
 assert.equal(t.step(4,4,'READINESS_DECLARATION',{readiness:READY()}).status,'MODIFY');
 assert.equal(facts(t,'INTERRUPTION_DECLARED').length,1);assert.equal(facts(t,'READINESS_DECLARED').length,2);
 for(const r of t.results)assert.doesNotMatch(String(r.reason),FORBIDDEN);
 const none=timeline(),k=none.step(1,2,'READINESS_DECLARATION',{readiness:READY()});assert.equal(k.status,'KEEP');assert.match(k.reason,/nothing to restart/);
});

// ---------------- Situation 3 ----------------
test('S3-1 (C-Q08-5, SEC-V1CP-23): a new plan needs the declaration first; it keeps the restriction, leaves out a sport not declared ready, and the record whole',()=>{
 const fresh=(asOf,startDate)=>{const i=HYBRID();i.asOf=asOf;i.startDate=startDate;i.athlete.eligibility={...i.athlete.eligibility,assessedAt:asOf};return i;};
 const t=clinicalBreak(),blocked=restartProgram({intake:fresh(t.day(7,0),t.day(7,1)),record:t.ledger,referenceState:t.ref});
 assert.equal(blocked.status,'CLINICAL_HUMAN_REQUIRED');assert.deepEqual(blocked.missingInputs,['readiness']);
 t.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true,runningNotRestricted:true},STRENGTH:{ready:true,restrictions:['AVOID_LOWER_BODY_STRENGTH']}})});
 const g=restartProgram({intake:fresh(addDays(t.p.startDate,7*9),addDays(t.p.startDate,7*9+1)),record:t.ledger,referenceState:t.ref});
 assert.equal(g.status,'PROPOSED',g.reason);assert.equal(g.program.canonical.athlete.pause.readinessDeclared,true,'never "nonclinical"');
 const all=g.program.weeks.flatMap(x=>x.sessions);
 assert.ok(all.filter(s=>s.sport==='STRENGTH'&&live(s)).every(s=>rowsOf(s).every(e=>e.region!=='LOWER')),'the restriction carries over');
 assert.equal(g.program.capability.run.class,'RESTART','after a clinical hold the new plan starts no higher than the return entry');
 assert.ok(all.filter(s=>s.weekIndex===0&&s.sport==='STRENGTH'&&live(s)).flatMap(rowsOf).every(e=>e.sets<=1&&e.rir>=4));
 assert.equal(hash(g.restart.carriedRecord),hash(t.ledger),'the record is returned whole');
 const h=clinicalBreak();h.step(3,2,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true},STRENGTH:{ready:false}})});
 const n=restartProgram({intake:fresh(addDays(h.p.startDate,7*9),addDays(h.p.startDate,7*9+1)),record:h.ledger,referenceState:h.ref});
 assert.equal(n.status,'PROPOSED',n.reason);assert.equal(n.program.capability.strength.programmed,false,'a sport not declared ready is not programmed');
});

test('S3-2 (C-Q08-1, C-Q08-2): after a three-week nonclinical pause the new plan never starts above the moderate return entry; the record bounds the stated exposure',()=>{
 const t=timeline();t.step(0,6,'WEEKLY_REVIEW',{observations:doneBefore(t.p,1)});
 const day=addDays(t.p.startDate,7*4),i=HYBRID();i.asOf=day;i.startDate=addDays(day,1);i.athlete.eligibility={...i.athlete.eligibility,assessedAt:day};i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};i.athlete.recent={...i.athlete.recent,runMinutesPerWeek:400};
 const g=restartProgram({intake:i,record:t.ledger,referenceState:t.ref});
 assert.equal(g.status,'PROPOSED',g.reason);
 assert.ok(g.program.canonical.athlete.pause.weeks>=3&&g.program.canonical.athlete.pause.bySportDays.RUN>10);
 assert.equal(g.program.capability.run.class,'RESTART');
 assert.ok(g.program.weeks[0].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(rowsOf).every(e=>e.sets<=1&&e.rir>=4),'strength starts at the return entry');
 assert.ok(g.restart.boundedByRecord.includes('recent.runMinutesPerWeek'),'the stated exposure is bounded by what the record shows');
 assert.ok(g.program.canonical.athlete.recentRun.runMinutesPerWeek<400);
});
