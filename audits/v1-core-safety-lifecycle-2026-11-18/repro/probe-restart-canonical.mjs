// Phase A probe: what a restarted plan's canonical intake carries (is canonical.restart always present after restartProgram?).
import {createClient} from '../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs';
import {athleteA,reportOf,liveSessions,at,ELIG,addDays} from '../../v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';
const c=createClient();c.onboard(athleteA({weeks:8}));const p0=c.envelope.program;
for(const s of liveSessions(c.envelope,0))c.review('WEEKLY_REVIEW',at(addDays(p0.startDate,6)),{eligibility:ELIG(addDays(p0.startDate,6)),observations:[reportOf(c.envelope,s)]},{eventId:'w0-'+s.id});
const day=addDays(p0.startDate,18),upd={...athleteA({weeks:8}),asOf:day,startDate:addDays(p0.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
const r=c.restart(upd,at(day,'10:00'));const p=c.envelope.program;
console.log(JSON.stringify({status:r.status,programIdA:p0.id,programIdB:p.id,revisionB:p.revision,canonicalKeys:Object.keys(p.canonical),restart:p.canonical.restart??null,pause:p.canonical.athlete?.pause??null,restartKey:Object.keys(r.restart??{})},null,1));
