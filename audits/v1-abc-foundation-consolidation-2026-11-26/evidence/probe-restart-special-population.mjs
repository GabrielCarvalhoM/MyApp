// ABC foundation consolidation (2026-11-26): diagnostic probe over the current runtime (synthetic). Run from the repo root: node audits/v1-abc-foundation-consolidation-2026-11-26/evidence/probe-restart-special-population.mjs
import {athlete,athleteA} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const t=athlete({newId,id:'rs',weeks:8});t.enroll();t.set('2026-11-20','10:00');
const i=athleteA({weeks:8,id:'rs'});i.asOf='2026-11-20';i.startDate='2026-11-23';i.athlete.eligibility.assessedAt='2026-11-20';i.athlete.specialPopulation=['POSTPARTUM'];
const r=t.api.restart({actor:t.actor,intake:i,expectedVersion:t.version()});const {view,...x}=r;console.log(JSON.stringify(x).slice(0,600));console.log('view state',view?.state, 'sessions exec', view?.week?.sessions?.filter(s=>s.executable).length);
const p=t.api.plan({actor:t.actor});console.log('plan',p.view?.state,p.view?.week?.sessions?.filter(s=>s.executable).length);
