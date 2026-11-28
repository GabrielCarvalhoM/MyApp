// RepMile front C · engine captures the shared fixtures do not hold (#73): what the CURRENT CoachingCore answers when a warning sign carries the
// URGENT_CARE_ADVISED guidance level. Nothing here is written by hand and no rule is restated: each file is a real answer of the frozen engine
// for a synthetic athlete, through the integration boundary as front A's host calls it (`integration.submit`, then the plan view the host
// facade appends, `done` of api.mjs), or a real plan view. Fixture mode (FixtureCoachingWriter) replays them; the app bundles the output folder
// as the `Captures` folder reference. CoachingCore, CoachingPresentation and their fixtures are read only (frozen).
//
// Run: node ios/Packages/RepMileUI/Tools/capture-engine.mjs [outDir]   (default: ios/Packages/RepMileUI/Captures)
// Deterministic (ids from a counter, a fixed clock and key): two runs give the same bytes (evidence i73: `diff -r`).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athlete,ELIG,athleteA,CONSENTS} from '../../../../CoachingCore/test/v1int-helpers.mjs';
import {URGENT_SIGNS} from '../../../../CoachingCore/src/v1-f08.mjs';
import {warningSignSet,weekPlan,loggedEntries,PROJECTIONS_VERSION} from '../../CoachingPresentation/Facade/app-projections.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.resolve(process.argv[2]??path.join(HERE,'../Captures'));fs.mkdirSync(OUT,{recursive:true});
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const index=[];
const level=x=>x?.decision?.guidance?.level??x?.view?.hold?.guidance?.level??x?.view?.lastDecision?.guidance?.level??null;
const save=(name,x,what)=>{fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify(x,null,1)+'\n');
 index.push({file:name+'.json',what,status:x?.status??null,state:x?.view?.state??null,guidance:level(x)});return x;};
/** The answer as the host facade returns it: integration.submit, then the plan view after the write (api.mjs `done`, unchanged in shape). */
const hostAnswer=(t,r)=>{if(!r.ok)return r;const v=t.api.plan({actor:t.actor});return {...r,...(v.ok?{view:v.view}:{viewError:v.error,state:v.state})};};
const allNo=signs=>Object.fromEntries(signs.map(k=>[k,false]));
const fresh=name=>{const t=athlete({newId,id:'c73-'+name,weeks:12});const e=t.enroll();if(!e.ok)throw new Error('enroll '+e.error?.code);
 return {t,run:t.sessions(0).find(x=>x.sport==='RUN')};};
/** A clinical hold on record (PROFESSIONAL_ASSESSMENT): a run report with the screen flag "pain" answered yes. */
function held(name){const {t,run}=fresh(name);t.set(run.date,'20:00');
 const end=new Date(t.clock-15*60000).toISOString();
 const h=t.submit({kind:'WEEKLY_REVIEW',eligibility:{...ELIG(run.date),status:undefined,pain:true},
  observations:[{sessionId:run.id,occurrenceDate:run.date,observedAt:end,actual:{completed:true,minutes:40,rpe:4},
   response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'ON_TARGET',nextDayFunction:'UNKNOWN'}}]});
 if(h.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+h.status);const day=addDay(run.date,3);t.set(day,'09:00');return {t,day};}
// NotFeeling100ViewModel.makeRequest: the condition, the engine's set answered, an intent, the screen answered and dated the plan's day.
const nf=(c,signs,intent,eligibility)=>({kind:'NOT_FEELING_100',wellbeing:{condition:c,warningSigns:signs,...(intent?{intent}:{})},eligibility});
// ReadinessViewModel.request: recovered, the READINESS set answered, both sports ready, no restriction, the screen.
const rd=(signs,eligibility)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:signs,
 sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},eligibility});

const ill=warningSignSet('MILD_ILLNESS'),ready=warningSignSet('READINESS');
// 1. "Não estou 100%" with one urgent sign "sim", the others "não", and a screen none applies: one capture per urgent sign the app asks.
for(const k of URGENT_SIGNS.filter(k=>ill.warningSigns.includes(k))){const {t,run}=fresh('nf-'+k);t.set(run.date,'08:00');
 const a=save('nf-urgent-'+k,hostAnswer(t,t.submit(nf('MILD_ILLNESS',{...allNo(ill.warningSigns),[k]:true},ill.intents.at(-1),ELIG(run.date)))),
  `not 100% (MILD_ILLNESS), ${k} yes, screen none applies: CLINICAL_HUMAN_REQUIRED, URGENT_CARE_ADVISED, plan BLOCKED`);
 if(k===URGENT_SIGNS[0])save('plan-blocked-urgent',t.api.plan({actor:t.actor}),'plan view after an urgent sign: BLOCKED, hold.guidance URGENT_CARE_ADVISED');
 if(level(a)!=='URGENT_CARE_ADVISED')throw new Error('nf '+k+' '+level(a));}
// 2. The readiness declaration during a hold, with one urgent sign "sim" and the screen: one capture per urgent sign.
for(const k of URGENT_SIGNS.filter(k=>ready.warningSigns.includes(k))){const {t,day}=held('rd-'+k);
 const a=save('readiness-urgent-'+k,hostAnswer(t,t.submit(rd({...allNo(ready.warningSigns),[k]:true},ELIG(day)))),
  `readiness during a hold, ${k} yes, screen none applies: CLINICAL_HUMAN_REQUIRED, URGENT_CARE_ADVISED, the hold stands`);
 if(level(a)!=='URGENT_CARE_ADVISED')throw new Error('readiness '+k+' '+level(a));}
// 3. The readiness declaration with a sign that is not urgent: the hold stands at the professional-assessment level (never "de volta").
{const k='gettingWorse';const {t,day}=held('rd-'+k);
 const a=save('readiness-sign-'+k,hostAnswer(t,t.submit(rd({...allNo(ready.warningSigns),[k]:true},ELIG(day)))),
  `readiness during a hold, ${k} yes, screen none applies: CLINICAL_HUMAN_REQUIRED, PROFESSIONAL_ASSESSMENT, the hold stands`);
 if(level(a)!=='PROFESSIONAL_ASSESSMENT')throw new Error('readiness '+k+' '+level(a));}

// 4. #101: onboarding with a clinical sign marked on 27 Cuidados (persistentPain yes, the other flags unanswered, as the checklist sends them):
// the answer the host facade returns for `onboard` (api.mjs), no record written.
{const t=athlete({newId,id:'c101-onboard-clinical',weeks:12});const intake=athleteA({weeks:12,id:'c101-onboard-clinical'});
 intake.athlete.eligibility={assessedAt:intake.asOf,persistentPain:true};
 const a=save('onboard-clinical',t.api.onboard({actor:t.actor,intake,consents:CONSENTS,clientRequestId:'c101-1'}),
  'onboarding with a clinical sign marked (27 Cuidados): CLINICAL_HUMAN_REQUIRED, not enrolled');
 if(a.status!=='CLINICAL_HUMAN_REQUIRED'||a.enrolled!==false)throw new Error('onboard clinical '+a.status+' '+a.enrolled);}

// 5. #101: Lucas, the Figma's onboarding persona (`837:1144`), as the app sends him (the Swift golden request of OnboardingTests.lucasGolden,
// built by results/i101-onboarding/scratch/i101-engine-replay.mjs) on Saturday 24 Oct 2026: the record the app reads after "Montar meu plano"
// (fixture scenario `lucas-onboarded`, screens 31–34).
{const golden=JSON.parse(fs.readFileSync(path.join(HERE,'../Tests/RepMileUIUnitTests/OnboardingTests.swift'),'utf8').match(/static let lucasGolden = #"(.*?)"#/)[1]);
 const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-10-24',startDate:golden.startDate,weeks:golden.weeks,timezoneOffsetMinutes:-180,
  learningConsent:false,athlete:golden.athlete,schedule:golden.schedule};
 const t=athlete({newId,id:golden.athlete.id,weeks:golden.weeks,start:'2026-10-24T12:00:00-03:00'});
 const o=t.api.onboard({actor:t.actor,intake,consents:{COACHING:true,HEALTH_SIGNALS:false,LEARNING:false},clientRequestId:'c101-lucas-1'});
 if(o.status!=='PROPOSED')throw new Error('lucas '+o.status);
 save('lucas-plan',t.api.plan({actor:t.actor}),'#101 Lucas after onboarding: plan view, week 0 (8 weeks to the 10 km of 20 Dec)');
 save('lucas-sessions',t.api.sessions({actor:t.actor}),'#101 Lucas after onboarding: every week');
 save('lucas-presentation',t.it.presentation({actor:t.actor}),'#101 Lucas after onboarding: calibration by the 5 km in 21:48');
 save('lucas-week-plan',{ok:true,projections:PROJECTIONS_VERSION,...weekPlan(t.doc(),{today:t.api.plan({actor:t.actor}).view.today})},'#101 Lucas: projection weekPlan');
 const r=t.it.read({actor:t.actor});
 save('lucas-logged',{ok:true,projections:PROJECTIONS_VERSION,entries:loggedEntries(t.it.visible(r.doc))},'#101 Lucas: nothing logged yet');}

fs.writeFileSync(path.join(OUT,'INDEX.json'),JSON.stringify({generator:'ios/Packages/RepMileUI/Tools/capture-engine.mjs',files:index},null,1)+'\n');
console.log(`${index.length} captures → ${path.relative(process.cwd(),OUT)||'.'}`);
