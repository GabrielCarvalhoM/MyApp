// RepMile V1 shared contract, end-to-end check (ABC foundation consolidation, 2026-11-26): runs requests ENCODED BY SWIFT (the closed types of
// CoachingPresentation) through the real boundary (`createIntegration` + `api.mjs`, the current runtime) and prints every answer, for
// EndToEndBoundaryTests to decode with the same Swift types. It plays front A's part only: the actor, a request id, the expected version and the
// clock. It never edits a request: what Swift encoded is what the boundary receives (the `received` echo proves the transport of safety keys).
//
// Input (argv[2]): {cases:[{name, intake?, consents?, steps:[{at:"YYYY-MM-DD HH:MM", op, ...}]}]}
//   op: enroll {intake} | restart {intake} | submit {review} | setHeartRateProfile {heartRateProfile} | eraseHeartRateProfile | plan |
//       presentation | logged | warningSignSet {condition} | stripObservedAt {review} (the same review with observedAt removed: why the type
//       requires it) | firstSession {sport} (the plan's first session of a sport, for a planned report) | weekPlan (the facade projection) |
//       engineRead (CCP-ONB-1: what the engine read from the intake, as the stored plan holds it: canonical facts, disclosures, first-week loads)
// Output (stdout, last line): {cases:[{name, answers:[{op, answer, received?}]}]}
import fs from 'node:fs';
import {athlete,at as instant} from '../../../../CoachingCore/test/v1int-helpers.mjs';
import {loggedEntries,keepsReport,warningSignSet,weekPlan,PROJECTIONS_VERSION} from './app-projections.mjs';

const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
/** CCP-ONB-1: the facts the engine read from an intake, from the stored plan (test evidence only; the app never reads the record this way). */
function engineRead(p){
 const c=p.canonical,a=c.athlete;
 return {weeks:p.weeks.length,canonical:{weeks:c.weeks,goals:c.goals,schedule:c.schedule,coaching:c.coaching??null,
  athlete:{runExperience:a.runExperience,strengthExperience:a.strengthExperience,experienceBasis:a.experienceBasis??null,recentRun:a.recentRun,recentStrength:a.recentStrength,
   equipment:a.equipment,knownExercises:a.knownExercises.map(e=>({id:e.id,familiar:e.familiar,current:e.current,dose:e.dose,loadHint:e.loadHint})),performanceAnchors:a.performanceAnchors}},
  uncertainty:c.uncertainty.map(u=>({field:u.field,category:u.category})),negotiation:p.negotiation.map(n=>({id:n.id,...(n.unmet?{unmet:n.unmet}:{})})),
  capability:{run:p.capability.run.programmed,strength:p.capability.strength.programmed,runClass:p.capability.run.class??null},temporaryPreference:p.goal.temporaryPreference??null,
  firstWeekStrength:p.weeks[0].sessions.filter(x=>x.sport==='STRENGTH').flatMap(x=>x.prescription?.exercises??[]).map(e=>({id:e.id,sets:e.sets,reps:e.reps,load:e.load??null})),
  firstWeekRun:p.weeks[0].sessions.filter(x=>x.sport==='RUN').map(x=>({role:x.role,minutes:x.prescription?.durationMinutes??null}))};
}
const out=[];
for(const c of input.cases){
 const t=athlete({newId,id:c.athleteId??c.name,weeks:8});let n=0;const rid=()=>`${c.name}-${++n}`;
 const version=()=>{const o=t.it.read({actor:t.actor});return o.ok?o.doc.version:null;};
 const kept=r=>{if(!r?.ok||!Array.isArray(r.recorded))return undefined;const o=t.it.read({actor:t.actor});if(!o.ok)return undefined;const e=loggedEntries(t.it.visible(o.doc));
  return {kept:r.recorded.filter(id=>keepsReport(e,id)),notKept:r.recorded.filter(id=>!keepsReport(e,id))};};
 const answers=[];
 for(const s of c.steps){
  if(s.at){const [d,h]=s.at.split(' ');t.clock=Date.parse(instant(d,h??'12:00'));}
  let answer,received;
  switch(s.op){
   case 'enroll':received={specialPopulation:s.intake?.athlete?.specialPopulation,eligibility:s.intake?.athlete?.eligibility,heartRateProfile:s.intake?.heartRateProfile,
    intakeKeys:Object.keys(s.intake??{}).sort(),athleteKeys:Object.keys(s.intake?.athlete??{}).sort(),scheduleKeys:Object.keys(s.intake?.schedule??{}).sort()};
    answer=t.api.onboard({actor:t.actor,intake:clone(s.intake),consents:s.consents??{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true},clientRequestId:rid()});break;
   case 'restart':received={specialPopulation:s.intake?.athlete?.specialPopulation};answer=t.api.restart({actor:t.actor,intake:clone(s.intake),expectedVersion:version()});break;
   case 'submit':answer=t.it.submit({actor:t.actor,clientRequestId:rid(),expectedVersion:version(),review:clone(s.review)});received={keys:Object.keys(s.review).sort()};answer={...answer,...(kept(answer)??{})};break;
   case 'stripObservedAt':{const rv=clone(s.review);for(const o of rv.observations??[])delete o.observedAt;answer=t.it.submit({actor:t.actor,clientRequestId:rid(),expectedVersion:version(),review:rv});answer={...answer,...(kept(answer)??{})};break;}
   case 'setHeartRateProfile':answer=t.api.setHeartRateProfile({actor:t.actor,clientRequestId:rid(),expectedVersion:version(),heartRateProfile:clone(s.heartRateProfile)});break;
   case 'eraseHeartRateProfile':answer=t.api.eraseHeartRateProfile({actor:t.actor,clientRequestId:rid(),expectedVersion:version()});break;
   case 'plan':answer=t.api.plan({actor:t.actor});break;
   case 'presentation':answer=t.it.presentation({actor:t.actor});break;
   case 'logged':{const o=t.it.read({actor:t.actor});answer=o.ok?{ok:true,projections:PROJECTIONS_VERSION,entries:loggedEntries(t.it.visible(o.doc))}:o;break;}
   case 'weekPlan':{const o=t.it.read({actor:t.actor});const v=t.api.plan({actor:t.actor});answer=o.ok?{ok:true,projections:PROJECTIONS_VERSION,...weekPlan(o.doc,{today:v.ok?v.view.today:null})}:o;break;}
   case 'engineRead':{const o=t.it.read({actor:t.actor});answer=o.ok?{ok:true,...engineRead(o.doc.program)}:o;break;}
   case 'warningSignSet':answer=warningSignSet(s.condition);break;
   case 'firstSession':{const v=t.api.sessions({actor:t.actor});const x=v.ok?v.weeks.flatMap(w=>w?.sessions??[]).find(y=>y.sport===s.sport&&y.executable):null;answer=x?{ok:true,id:x.id,date:x.date}:{ok:false};break;}
   default:answer={ok:false,error:{code:'RUNNER_UNKNOWN_OP',message:s.op}};
  }
  answers.push({op:s.op,answer,...(received?{received}:{})});
 }
 out.push({name:c.name,answers});
}
console.log(JSON.stringify({cases:out}));
