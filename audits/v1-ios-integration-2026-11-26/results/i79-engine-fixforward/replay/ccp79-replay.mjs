// RepMile #79 (CCP-79) regression replay: the five problems of the Founder's scope, sent through the real integration boundary (createIntegration →
// custody → CoachingCore), as the app sends them (one synthetic athlete per case, in-memory store, no personal data). Each check states the
// behaviour CCP-79 requires. Run against the frozen base, it FAILS exactly the defects (the failing-first evidence); against the fix, all pass.
// Usage: node ccp79-replay.mjs <repo root>    (read-only: nothing under the repository is written)
const ROOT=process.argv[2];if(!ROOT){console.error('usage: node ccp79-replay.mjs <repo root>');process.exit(2);}
const {athlete,ELIG,addDays}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {LIMITS}=await import(ROOT+'/CoachingCore/src/boundary/admission.mjs');
const {signsFor,READINESS_SIGNS,URGENT_SIGNS}=await import(ROOT+'/CoachingCore/src/v1-f08.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
let failures=0,passes=0;const check=(label,cond)=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}`);cond?passes++:failures++;};
const URG='URGENT_CARE_ADVISED',PRO='PROFESSIONAL_ASSESSMENT';
const no=list=>Object.fromEntries(list.map(k=>[k,false]));
const lvl=r=>r?.decision?.guidance?.level??null;
const say=r=>r.ok?`status=${r.status} level=${lvl(r)} recorded=${r.recorded?.length??0} missing=${JSON.stringify(r.decision?.missingInputs??[])}`:`refused ${r.error?.code}${r.error?.limit?' '+r.error.limit:''}`;
const view=t=>t.api.plan({actor:t.actor}).view;
const holdLevel=t=>view(t)?.hold?.guidance?.level??null;
const FLAG=(day,k)=>({...ELIG(day),status:undefined,[k]:true});
const nf=(condition,signs,eligibility)=>({kind:'NOT_FEELING_100',wellbeing:{condition,warningSigns:signs,intent:'REST',days:4},...(eligibility?{eligibility}:{})});
const rd=(signs,eligibility)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:signs,sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},...(eligibility?{eligibility}:{})});
function fresh(name){const t=athlete({newId,id:'ccp79-'+name,weeks:12});const e=t.enroll();if(!e.ok)throw new Error('enroll '+e.error?.code);
 const ss=t.sessions(0);return {t,run:ss.find(s=>s.id==='w0-run-d1'),str:ss.find(s=>s.sport==='STRENGTH')};}
const ILL=signsFor('MILD_ILLNESS');
/** A professional-assessment hold opened by a run report with the screen flag "pain" yes, three days later. */
function proHold(name){const c=fresh(name);c.t.set(c.run.date,'20:00');const h=c.t.weekly(c.run.date,[c.t.form(c.run)],{eligibility:FLAG(c.run.date,'pain')});
 if(h.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+say(h));c.day=addDays(c.run.date,3);c.t.set(c.day,'09:00');return c;}
/** An urgent hold: "Não estou 100%" with chest pain and a complete screen (the route both the base and the fix give). */
function urgentHold(name){const c=fresh(name);c.t.set(c.run.date,'08:00');const a=c.t.submit(nf('MILD_ILLNESS',{...no(ILL),chestPainPressureOrTightness:true},ELIG(c.run.date)));
 if(lvl(a)!==URG)throw new Error('urgent hold '+say(a));c.day=addDays(c.run.date,2);c.t.set(c.day,'09:00');return c;}

console.log('=== 1 a warning sign answered yes WITHOUT a current screen takes its clinical route (never the ASK for the screen)');
for(const k of [...URGENT_SIGNS.filter(x=>ILL.includes(x)),'feverOrChills','swelling']){const {t,run}=fresh('s1-'+k);t.set(run.date,'08:00');
 const a=t.submit(nf('MILD_ILLNESS',{...no(ILL),[k]:true},null));const want=URGENT_SIGNS.includes(k)?URG:PRO;
 check(`NF ${k} yes, no screen → ${say(a)}; plan ${view(t).state} hold ${holdLevel(t)} (want CLINICAL ${want}, BLOCKED)`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===want&&view(t).state==='BLOCKED'&&holdLevel(t)===want);}
{const {t,run}=fresh('s1-lone');t.set(run.date,'08:00');const a=t.submit({kind:'NOT_FEELING_100',wellbeing:{condition:'MILD_ILLNESS',warningSigns:{breathlessAtRest:true}}});
 check(`a lone urgent sign (nothing else answered), no screen → ${say(a)} (want CLINICAL ${URG})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===URG);}
{const {t,run}=fresh('s1-stale');t.set(run.date,'08:00');const a=t.submit(nf('MILD_ILLNESS',{...no(ILL),palpitationsAtRest:true},ELIG(addDays(run.date,-20))));
 check(`urgent sign with a screen 20 days old → ${say(a)} (want CLINICAL ${URG})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===URG);}
{const {t,run}=fresh('s1-none');t.set(run.date,'08:00');const a=t.submit(nf('MILD_ILLNESS',no(ILL),null));
 check(`every sign "não", no screen → ${say(a)} (unchanged: ASK eligibility.currentAssessment)`,a.status==='ASK'&&JSON.stringify(a.decision.missingInputs)==='["eligibility.currentAssessment"]');}
{const {t}=proHold('s1-hold');const a=t.submit(nf('MILD_ILLNESS',{...no(ILL),chestPainPressureOrTightness:true},null));
 check(`during a hold, chest pain yes, no screen → ${say(a)}; hold ${holdLevel(t)} (want ${URG})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===URG&&holdLevel(t)===URG);}
{const {t}=proHold('s1-ready');const a=t.submit(rd({...no(READINESS_SIGNS),faintingOrDizziness:true},null));
 check(`readiness during a hold, fainting yes, no screen → ${say(a)}; hold ${holdLevel(t)} (want ${URG})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===URG&&holdLevel(t)===URG);}

console.log('=== 2 an urgent sign with a screen flag "sim" keeps URGENT_CARE_ADVISED (the higher level of the items answered yes)');
for(const f of ['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern']){const {t,run}=fresh('s2-'+f);t.set(run.date,'08:00');
 const a=t.submit(nf('MILD_ILLNESS',{...no(ILL),chestPainPressureOrTightness:true},FLAG(run.date,f)));
 check(`chest pain yes + flag ${f} yes → ${say(a)}; hold ${holdLevel(t)} (want ${URG})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===URG&&holdLevel(t)===URG);}
{const {t,run}=fresh('s2-pro');t.set(run.date,'08:00');const a=t.submit(nf('MILD_ILLNESS',{...no(ILL),feverOrChills:true},FLAG(run.date,'illness')));
 check(`fever yes + flag illness yes → ${say(a)} (want ${PRO})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===PRO);}
{const {t,run}=fresh('s2-flag');t.set(run.date,'20:00');const a=t.weekly(run.date,[t.form(run)],{eligibility:FLAG(run.date,'injury')});
 check(`a flag alone (no sign) → ${say(a)} (unchanged level: ${PRO})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===PRO);}

console.log('=== 3 a later decision never lowers the hold\'s level (the highest since hold.since, until a readiness declaration releases it)');
{const {t,day}=urgentHold('s3-fever');const a=t.submit(nf('MILD_ILLNESS',{...no(ILL),feverOrChills:true},ELIG(day)));
 check(`urgent hold, then NF fever + screen → decision ${lvl(a)}, hold ${holdLevel(t)} (want hold ${URG})`,holdLevel(t)===URG);}
{const {t,run,day}=urgentHold('s3-run');const a=t.weekly(day,[t.form(run)]);
 check(`urgent hold, then a run report + screen "none" → ${say(a)}; hold ${holdLevel(t)} (want ${URG})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&holdLevel(t)===URG);}
{const {t,day}=urgentHold('s3-flag');t.submit({kind:'WEEKLY_REVIEW',eligibility:FLAG(day,'pain')});
 check(`urgent hold, then a screen with "pain" yes → hold ${holdLevel(t)} (want ${URG})`,holdLevel(t)===URG);}
{const {t,run,day}=urgentHold('s3-release');const r=t.submit(rd(no(READINESS_SIGNS),ELIG(day)));const v=view(t);
 check(`urgent hold released by a complete readiness declaration → ${say(r)}; plan ${v.state}, hold ${v.hold?'standing':'none'}`,r.ok&&!v.hold);
 const d2=addDays(day,2);t.set(d2,'20:00');const h=t.submit({kind:'WEEKLY_REVIEW',eligibility:FLAG(d2,'injury')});
 check(`a new hold after the release (flag injury) → ${say(h)}; hold ${holdLevel(t)} (a new hold starts from its own decisions: ${PRO})`,h.status==='CLINICAL_HUMAN_REQUIRED'&&holdLevel(t)===PRO);}
{const {t,day}=proHold('s3-raise');t.submit(nf('MILD_ILLNESS',{...no(ILL),breathlessAtRest:true},ELIG(day)));const up=holdLevel(t);t.clock+=3600e3;
 t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day)});check(`professional hold raised by breathless at rest (${up}), then a plain screen → hold ${holdLevel(t)} (want ${URG})`,up===URG&&holdLevel(t)===URG);}

console.log(`=== 4 past the correction limit (${LIMITS.correctionsPerReport}), a screen flag "sim" is a safety signal: admitted (at most ${LIMITS.safetyExcess} beyond) and routed`);
{const {t,str}=fresh('s4');t.set(str.date,'08:00');let head=t.weekly(str.date,[t.form(str)]).recorded[0];
 for(let k=1;k<=LIMITS.correctionsPerReport;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:20+k}}]);if(!r.ok)throw new Error('correction '+k+' '+say(r));head=r.recorded[0];}
 t.clock+=60e3;const plain=t.weekly(str.date,[{...t.form(str),correctionOf:head}]);
 check(`correction ${LIMITS.correctionsPerReport+1}, screen "none" → ${say(plain)} (unchanged: LIMIT_EXCEEDED)`,!plain.ok&&plain.error.code==='LIMIT_EXCEEDED');
 const out=[];for(let k=1;k<=LIMITS.safetyExcess+1;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:40+k}}],{eligibility:FLAG(str.date,'pain')});out.push(r);if(r.ok&&r.recorded?.length)head=r.recorded[0];}
 check(`correction ${LIMITS.correctionsPerReport+1}, flag "pain" yes → ${say(out[0])} (want admitted, CLINICAL, the correction recorded)`,out[0].ok&&out[0].status==='CLINICAL_HUMAN_REQUIRED'&&out[0].recorded?.length===1);
 check(`corrections ${LIMITS.correctionsPerReport+1}..${LIMITS.correctionsPerReport+LIMITS.safetyExcess} with the flag admitted, the next refused (bounded): ${out.map(r=>r.ok?'OK':r.error.code).join(',')}`,out.slice(0,LIMITS.safetyExcess).every(r=>r.ok)&&!out[LIMITS.safetyExcess].ok&&out[LIMITS.safetyExcess].error.code==='LIMIT_EXCEEDED');}

console.log('=== 5 a safety alert keeps the facts of the session it is sent with');
{const {t,run}=fresh('s5-run');t.set(run.date,'20:00');const a=t.weekly(run.date,[t.form(run)],{eligibility:FLAG(run.date,'pain')});
 check(`run report + flag "pain" yes → ${say(a)}; live rows of the session ${t.live(run.id).length} (want CLINICAL, 1 recorded)`,a.status==='CLINICAL_HUMAN_REQUIRED'&&a.recorded?.length===1&&t.live(run.id).length===1);}
{const {t,str}=fresh('s5-str');t.set(str.date,'20:00');const a=t.weekly(str.date,[t.form(str)],{eligibility:FLAG(str.date,'injury')});
 check(`strength log + flag "injury" yes → ${say(a)} (want CLINICAL, 1 recorded)`,a.status==='CLINICAL_HUMAN_REQUIRED'&&a.recorded?.length===1);}
{const {t,run}=fresh('s5-corr');t.set(run.date,'20:00');const first=t.weekly(run.date,[t.form(run)]).recorded[0];t.clock+=3600e3;
 const a=t.weekly(run.date,[{...t.form(run),correctionOf:first,actual:{...t.form(run).actual,minutes:33}}],{eligibility:FLAG(run.date,'pain')});const live=t.live(run.id);
 check(`a correction + flag "pain" yes → ${say(a)}; the correction is the report in force (${live.length===1&&live[0].actual?.minutes===33})`,a.status==='CLINICAL_HUMAN_REQUIRED'&&a.recorded?.length===1&&live.length===1&&live[0].actual?.minutes===33);}
{const {t,run}=fresh('s5-nf');t.set(run.date,'20:00');const a=t.submit({...nf('MILD_ILLNESS',{...no(ILL),chestPainPressureOrTightness:true},null),observations:[t.form(run)]});
 check(`NF chest pain, no screen, with the session report → ${say(a)} (want CLINICAL ${URG}, 1 recorded)`,a.status==='CLINICAL_HUMAN_REQUIRED'&&lvl(a)===URG&&a.recorded?.length===1);}
{const {t,run}=fresh('s5-ask');t.set(run.date,'20:00');const a=t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(run)]});
 check(`a report with no screen and no sign → ${say(a)} (unchanged: ASK, nothing recorded)`,a.status==='ASK'&&(a.recorded?.length??0)===0);}

console.log(`RESULT: ${passes} pass, ${failures} fail`);process.exitCode=failures?1:0;
