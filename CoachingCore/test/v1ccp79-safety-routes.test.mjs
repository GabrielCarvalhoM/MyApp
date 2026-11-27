// REPMILE CoachingCore CCP-79 (#79, Founder decision of 2026-11-27, comment 7227351995; item 5 added from #74, comment 7227437457): the regression
// tests of the controlled fix-forward REPMILE-COACHINGCORE-V1-CCP79-AMENDMENT-3. Each was written failing first: on the frozen runtime
// (REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2) every test below fails at its first assertion of the defect. Through the real integration
// boundary (custody → engine), synthetic athletes, in-memory store.
// 1 a warning sign answered yes reaches its clinical route when the eligibility screen is missing (never the ASK for the screen);
// 2 an urgent sign with a screen flag "yes" keeps URGENT_CARE_ADVISED (the higher level of the items answered yes);
// 3 a later decision never lowers a standing hold's level (SSCTR interim rule: the highest since hold.since, until a readiness declaration releases it);
// 4 past the correction and per-day limits, a screen flag "yes" is a safety signal (admitted at most safetyExcess beyond the limit);
// 5 a clinical route keeps the facts of the session reports sent with it.
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,ELIG,addDays} from './v1int-helpers.mjs';
import {LIMITS,statesSafetySignal,screenStatesFlag} from '../src/boundary/admission.mjs';
import {signsFor,READINESS_SIGNS,URGENT_SIGNS} from '../src/v1-f08.mjs';

const URG='URGENT_CARE_ADVISED',PRO='PROFESSIONAL_ASSESSMENT',CLIN='CLINICAL_HUMAN_REQUIRED',ILL=signsFor('MILD_ILLNESS');
const FLAGS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
const no=list=>Object.fromEntries(list.map(k=>[k,false]));
const lvl=r=>r?.decision?.guidance?.level??null;
const holdOf=t=>t.api.plan({actor:t.actor}).view.hold;
const FLAG=(day,k)=>({...ELIG(day),status:undefined,[k]:true});
const nf=(signs,eligibility)=>({kind:'NOT_FEELING_100',wellbeing:{condition:'MILD_ILLNESS',warningSigns:signs,intent:'REST',days:4},...(eligibility?{eligibility}:{})});
const rd=(signs,eligibility)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:signs,sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},...(eligibility?{eligibility}:{})});
let n=0;
function fresh(){const t=athlete({id:`ccp79-${++n}`,weeks:12});assert.equal(t.enroll().ok,true);const ss=t.sessions(0);return {t,run:ss.find(s=>s.id==='w0-run-d1'),str:ss.find(s=>s.sport==='STRENGTH')};}
function urgentHold(){const c=fresh();c.t.set(c.run.date,'08:00');assert.equal(lvl(c.t.submit(nf({...no(ILL),chestPainPressureOrTightness:true},ELIG(c.run.date)))),URG);
 c.day=addDays(c.run.date,2);c.t.set(c.day,'09:00');return c;}
function proHold(){const c=fresh();c.t.set(c.run.date,'20:00');assert.equal(c.t.weekly(c.run.date,[c.t.form(c.run)],{eligibility:FLAG(c.run.date,'pain')}).status,CLIN);
 c.day=addDays(c.run.date,3);c.t.set(c.day,'09:00');return c;}

test('CCP-79 item 1: a warning sign answered yes without a current screen takes its clinical route at the level of the signs, never the ASK for the screen',()=>{
 for(const k of [...URGENT_SIGNS.filter(x=>ILL.includes(x)),'feverOrChills']){const {t,run}=fresh();t.set(run.date,'08:00');const a=t.submit(nf({...no(ILL),[k]:true},null));
  assert.equal(a.status,CLIN,k);assert.equal(lvl(a),URGENT_SIGNS.includes(k)?URG:PRO,k);assert.deepEqual(a.decision.warningSigns,[k]);
  const v=t.api.plan({actor:t.actor}).view;assert.equal(v.state,'BLOCKED');assert.equal(v.hold.guidance.level,lvl(a));}
 {const {t,run}=fresh();t.set(run.date,'08:00');const a=t.submit({kind:'NOT_FEELING_100',wellbeing:{condition:'MILD_ILLNESS',warningSigns:{breathlessAtRest:true}}});assert.equal(a.status,CLIN);assert.equal(lvl(a),URG);}
 {const {t,run}=fresh();t.set(run.date,'08:00');const a=t.submit(nf({...no(ILL),palpitationsAtRest:true},ELIG(addDays(run.date,-20))));assert.equal(a.status,CLIN);assert.equal(lvl(a),URG);}
 // Unchanged: without a sign answered yes, a missing screen is still asked.
 {const {t,run}=fresh();t.set(run.date,'08:00');const a=t.submit(nf(no(ILL),null));assert.equal(a.status,'ASK');assert.deepEqual(a.decision.missingInputs,['eligibility.currentAssessment']);}
});
test('CCP-79 item 1 during a hold: an urgent sign without a screen, in a report of how the athlete feels or a readiness declaration, raises the hold to urgent care',()=>{
 {const {t}=proHold();const a=t.submit(nf({...no(ILL),chestPainPressureOrTightness:true},null));assert.equal(a.status,CLIN);assert.equal(lvl(a),URG);assert.equal(holdOf(t).guidance.level,URG);}
 {const {t}=proHold();const a=t.submit(rd({...no(READINESS_SIGNS),faintingOrDizziness:true},null));assert.equal(a.status,CLIN);assert.equal(lvl(a),URG);assert.equal(holdOf(t).guidance.level,URG);}
});
test('CCP-79 item 2: an urgent sign with any screen flag answered yes keeps URGENT_CARE_ADVISED; a flag alone keeps the professional assessment',()=>{
 for(const f of FLAGS){const {t,run}=fresh();t.set(run.date,'08:00');const a=t.submit(nf({...no(ILL),chestPainPressureOrTightness:true},FLAG(run.date,f)));
  assert.equal(a.status,CLIN,f);assert.equal(lvl(a),URG,f);assert.deepEqual(a.decision.warningSigns,['chestPainPressureOrTightness']);assert.equal(holdOf(t).guidance.level,URG,f);}
 {const {t,run}=fresh();t.set(run.date,'08:00');assert.equal(lvl(t.submit(nf({...no(ILL),feverOrChills:true},FLAG(run.date,'illness')))),PRO);}
 {const {t,run}=fresh();t.set(run.date,'08:00');assert.equal(lvl(t.submit(nf({...no(ILL),chestPainPressureOrTightness:true},{...ELIG(run.date),status:'CLINICAL'}))),URG);}
 {const {t,run}=fresh();t.set(run.date,'20:00');const a=t.weekly(run.date,[t.form(run)],{eligibility:FLAG(run.date,'injury')});assert.equal(a.status,CLIN);assert.equal(lvl(a),PRO);}
});
test('CCP-79 item 3: a later decision never lowers a standing hold\'s guidance level; a readiness declaration that releases the hold ends it',()=>{
 {const {t,day}=urgentHold();t.submit(nf({...no(ILL),feverOrChills:true},ELIG(day)));assert.equal(holdOf(t).guidance.level,URG,'a non-urgent sign answered later');}
 {const {t,run,day}=urgentHold();const a=t.weekly(day,[t.form(run)]);assert.equal(a.status,CLIN);assert.equal(lvl(a),PRO,'the decision keeps its own level');assert.equal(holdOf(t).guidance.level,URG,'a run report');}
 {const {t,day}=urgentHold();t.submit({kind:'WEEKLY_REVIEW',eligibility:FLAG(day,'pain')});assert.equal(holdOf(t).guidance.level,URG,'a screen flag');}
 {const {t,day}=proHold();t.submit(nf({...no(ILL),breathlessAtRest:true},ELIG(day)));t.clock+=3600e3;t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day)});assert.equal(holdOf(t).guidance.level,URG,'raised, then a plain screen');}
 {const {t,day}=urgentHold();const r=t.submit(rd(no(READINESS_SIGNS),ELIG(day)));assert.equal(r.ok,true);assert.equal(holdOf(t),null,'released');
  const d2=addDays(day,2);t.set(d2,'20:00');assert.equal(t.submit({kind:'WEEKLY_REVIEW',eligibility:FLAG(d2,'injury')}).status,CLIN);assert.equal(holdOf(t).guidance.level,PRO,'a new hold reads its own decisions');}
});
test('CCP-79 item 4: past the correction limit a screen flag answered yes is a safety signal, admitted at most safetyExcess beyond the limit and routed',()=>{
 const {t,str}=fresh();t.set(str.date,'08:00');let head=t.weekly(str.date,[t.form(str)]).recorded[0];
 for(let k=1;k<=LIMITS.correctionsPerReport;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:20+k}}]);assert.equal(r.ok,true);head=r.recorded[0];}
 t.clock+=60e3;const plain=t.weekly(str.date,[{...t.form(str),correctionOf:head}]);assert.equal(plain.error?.code,'LIMIT_EXCEEDED','unchanged without a signal');
 const out=[];for(let k=1;k<=LIMITS.safetyExcess+1;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:40+k}}],{eligibility:FLAG(str.date,'pain')});out.push(r);if(r.ok)head=r.recorded[0];}
 assert.equal(out[0].status,CLIN);assert.equal(out[0].recorded.length,1,'the correction is recorded');
 assert.deepEqual(out.map(r=>r.ok?'OK':r.error.code),[...Array(LIMITS.safetyExcess).fill('OK'),'LIMIT_EXCEEDED'],'bounded');
});
test('CCP-79 item 4: statesSafetySignal reads the request\'s screen exactly as the engine\'s gate reads a clinical flag',()=>{
 for(const f of FLAGS)for(const v of [true,'sim','YES',1])assert.equal(statesSafetySignal({actual:{completed:true}},{[f]:v}),true,f+' '+v);
 for(const s of ['CLINICAL','pain_or_injury'])assert.equal(screenStatesFlag({status:s}),true,s);
 for(const sc of [null,undefined,{},ELIG('2026-11-20'),{pain:false},{pain:'nao'},{pain:'maybe'},[{pain:true}]])assert.equal(statesSafetySignal({actual:{completed:true}},sc),false,JSON.stringify(sc));
 assert.equal(statesSafetySignal({actual:{completed:true,stop:{reason:'SYMPTOM'}}}),true,'the frozen signals stay');
});
test('CCP-79 item 5: a clinical route keeps the facts of the session reports sent with it (run, strength, a correction, a sign without a screen)',()=>{
 {const {t,run}=fresh();t.set(run.date,'20:00');const a=t.weekly(run.date,[t.form(run)],{eligibility:FLAG(run.date,'pain')});assert.equal(a.status,CLIN);assert.equal(a.recorded.length,1);assert.equal(t.live(run.id).length,1);}
 {const {t,str}=fresh();t.set(str.date,'20:00');const a=t.weekly(str.date,[t.form(str)],{eligibility:FLAG(str.date,'injury')});assert.equal(a.status,CLIN);assert.equal(a.recorded.length,1);}
 {const {t,run}=fresh();t.set(run.date,'20:00');const first=t.weekly(run.date,[t.form(run)]).recorded[0];t.clock+=3600e3;
  const a=t.weekly(run.date,[{...t.form(run),correctionOf:first,actual:{...t.form(run).actual,minutes:33}}],{eligibility:FLAG(run.date,'pain')});
  assert.equal(a.status,CLIN);assert.equal(a.recorded.length,1);const live=t.live(run.id);assert.equal(live.length,1);assert.equal(live[0].actual.minutes,33);}
 {const {t,run}=fresh();t.set(run.date,'20:00');const a=t.submit({...nf({...no(ILL),chestPainPressureOrTightness:true},null),observations:[t.form(run)]});assert.equal(a.status,CLIN);assert.equal(lvl(a),URG);assert.equal(a.recorded.length,1);}
 // Unchanged: a report with no screen and no sign is asked, and nothing is recorded until the screen is answered.
 {const {t,run}=fresh();t.set(run.date,'20:00');const a=t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(run)]});assert.equal(a.status,'ASK');assert.equal(a.recorded?.length??0,0);}
});
