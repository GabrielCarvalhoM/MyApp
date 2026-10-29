// IO adapters/fixtures are outside the pure evaluator. The evaluator cannot load an expected oracle.
import inputs from '../fixtures/e2e-inputs.json' with { type: 'json' };
import bundle from '../fixtures/authority-bundle.json' with { type: 'json' };
import { clone } from './value.mjs';

export function scenarioInput(id) {
  const f=inputs.find(x=>x.fixtureId===id);
  if(!f) throw new Error('Unknown fixture '+id);
  return {
    inputVersion:'BSR-INPUT-1',purpose:'SYNTHETIC_SHADOW',synthetic:true,
    evaluatedAt:'2026-10-24T00:00:00-03:00',athleteFixtureId:f.athleteState.athlete_id,
    athleteState:clone(f.athleteState),officialPlanState:clone(f.officialPlanState),
    event:clone(f.facts.event),observation:clone(f.facts.observation),
    preacceptedBranch:clone(f.facts.branch),athleteResponseHistory:clone(f.facts.history),planContext:f.facts.planContext,
    observedExecutionState:{events:[clone(f.facts.event)],completed:[],inferred:[]},
    recoveryContext:{eligibilityStatus:'NONCLINICAL_CONFIRMED',clinicalConcern:false,interrupted:id==='E2E-14',...(id==='E2E-14'?{interruptionReason:'TRAVEL',actualExposureKnown:true}:{}),sourceRef:'ACF-SYNTHETIC-EXPLICIT-PREMISE',contextChanged:false},
    policyContext:{registryVersion:bundle.registryVersion,registryHash:bundle.registryHash,revokedReviewIds:[],holds:[],longitudinalPurposeAllowed:true},
    provenance:{dataClass:'SYNTHETIC',sourceRef:'ACF-1.0.0-r1',sourceRevision:'r1',coverage:'EXPLICIT_FIXTURE_FACTS',association:'CONFIRMED'}
  };
}
export function dayInput(planId,day,completed=[]) {
  const plan=bundle.plans.find(p=>p.plan_id===planId),athlete=bundle.athletes.find(a=>a.athlete_id===plan.athlete_id);
  const input=scenarioInput('E2E-01');
  Object.assign(input,{athleteFixtureId:athlete.athlete_id,athleteState:clone(athlete),officialPlanState:clone(plan),event:{event_id:planId+'-DAY-'+day,type:'DAY_RECORDED',day},observation:{type:'EXPLICIT_COMPATIBLE_CONTEXT',response:athlete.history.response},preacceptedBranch:null,athleteResponseHistory:null,planContext:null,observedExecutionState:{events:[],completed:clone(completed),inferred:[]}});
  return input;
}
export const fixturePlans=()=>clone(bundle.plans);
export const authorityInfo=()=>({version:bundle.registryVersion,hash:bundle.registryHash,bundleHash:bundle.bundleHash});
export function goldenInput(id) {
  const p=bundle.sdcProfiles.find(p=>p.id===id);if(!p)throw new Error('Unknown Golden '+id);
  const i=scenarioInput('E2E-01');
  i.athleteFixtureId='A-SDC';i.athleteState={athlete_id:'A-SDC',facts:clone(p.facts)};
  i.officialPlanState={plan_id:'SDC-WEEK',plan_revision:'SDC-SCI-r1',athlete_id:'A-SDC',sessions:clone(p.facts.week),recipeCatalog:clone(bundle.sdcCatalog.recipes)};
  i.event={event_id:'GOLD-'+id,type:'SDC_REVIEWED_EVENT',facts:clone(p.facts)};i.observation={type:'SDC_EXPLICIT_FACTS'};
  i.observedExecutionState={events:[clone(i.event)],completed:[],inferred:[]};
  i.recoveryContext.clinicalConcern=p.facts.eligibility.status==='CLINICAL_CONCERN';
  return i;
}
