// Core Safety & Lifecycle Closure, Phase A: reproduce QRE-AIF-01 (authority expiry vs clinical route) and QRE-AIF-02 (restart identity) on the
// base commit, through the composed entry point the app uses (v1-strength-index.mjs, no options). Prints JSON; writes nothing.
//   node audits/v1-core-safety-lifecycle-2026-11-18/repro/repro-p0.mjs [entry]   (entry defaults to v1-strength-index.mjs)
import {createClient} from '../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs';
import {athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign} from '../../v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';
import {createCustody} from '../../../CoachingCore/src/boundary/custody.mjs';
import {memoryStore} from '../../../CoachingCore/src/boundary/store.mjs';

const entry=process.argv[2]??'v1-strength-index.mjs';
const S=await import('../../../CoachingCore/src/'+entry);
const out={entry};
const ms=iso=>Date.parse(iso);

// QRE-AIF-01: the same warning sign the day before, on, and after review_by (2027-04-30, UTC day), on one plan covering the date.
{const i=athleteA({weeks:8,id:'p0-expiry'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);
 const x=createClient();x.onboard(i);
 const sign=day=>{const r=createClient({envelope:x.envelope}).review('NOT_FEELING_100',at(day,'08:00'),notFeeling100WithSign(day),{eventId:'probe-sign-'+day});return {status:r.status,proposal:!!r.proposal,reason:r.reason?.slice(0,120)};};
 const plain=day=>{const r=createClient({envelope:x.envelope}).review('WEEKLY_REVIEW',at(day,'20:00'),{eligibility:ELIG(day)},{eventId:'probe-weekly-'+day});return {status:r.status,proposal:!!r.proposal};};
 out.expiry={signBefore:sign('2027-04-29'),signOnDate:sign('2027-04-30'),signAfter:sign('2027-05-01'),weeklyBefore:plain('2027-04-25'),weeklyAfter:plain('2027-05-02'),
  generateAfter:S.generateProgram({...i,asOf:'2027-05-04',startDate:'2027-05-10',athlete:{...i.athlete,eligibility:ELIG('2027-05-04')}}).status};}

// QRE-AIF-02 through the headless client: plan A, report week 0, restart to plan B, report B's first session.
{const c=createClient();const g=c.onboard(athleteA({weeks:8}));const p0=c.envelope.program;
 for(const s of liveSessions(c.envelope,0)){const r=reportOf(c.envelope,s);c.review('WEEKLY_REVIEW',at(addDays(p0.startDate,6)),{eligibility:ELIG(addDays(p0.startDate,6)),observations:[r]},{eventId:'w0-'+s.id});}
 const day=addDays(p0.startDate,18),upd={...athleteA({weeks:8}),asOf:day,startDate:addDays(p0.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const rs=c.restart(upd,at(day,'10:00'));const s0=liveSessions(c.envelope,0)[0],rep=reportOf(c.envelope,s0,{tag:'-new-plan'});
 const pr=c.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[rep]},{eventId:'probe-restart'});
 const own=c.envelope.actualLedger.filter(o=>o.eventId===rep.eventId),prior=c.envelope.actualLedger.filter(o=>o.sessionId===s0.id&&!o.fact&&o.localDate<c.envelope.program.startDate);
 out.restartClient={first:g.status,restart:rs.status,planAIds:p0.weeks[0].sessions.map(s=>s.id),planBIds:c.envelope.program.weeks[0].sessions.map(s=>s.id),probe:pr.status,sessionId:s0.id,ownRows:own.length,ownConflicted:own.map(o=>!!o.conflicted),priorRows:prior.map(o=>({eventId:o.eventId,localDate:o.localDate,conflicted:!!o.conflicted,conflict:o.provenance?.conflict??null}))};}

// QRE-AIF-02 through the V1CIB custody (the boundary the ADR recommends).
{let clock=ms('2026-11-14T12:00:00-03:00');const store=memoryStore(),cu=createCustody({store,key:'p0-synthetic-key-r',now:()=>clock,engine:S}),actor={athleteId:'p0-custody-r'};
 const plain=(program,s)=>{const {eventId:_e,athleteId:_a,...o}=reportOf({program,presentation:{runSessions:{}},actualLedger:[]},s);return o;};
 cu.enroll({actor,intake:athleteA({id:'p0-custody-r'}),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});const p0=store.load(actor.athleteId).program;
 clock=ms(at(addDays(p0.startDate,6)));const w=cu.submit({actor,clientRequestId:'w0',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(addDays(p0.startDate,6)),observations:liveSessions({program:p0},0).map(s=>plain(p0,s))}});
 const day=addDays(p0.startDate,18),upd={...athleteA({weeks:8,id:'p0-custody-r'}),asOf:day,startDate:addDays(p0.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 clock=ms(at(day,'10:00'));const rs=cu.restart({actor,intake:upd,expectedVersion:store.load(actor.athleteId).version});const d1=store.load(actor.athleteId),s0=liveSessions({program:d1.program},0)[0];
 clock=ms(at(s0.date));const r=cu.submit({actor,clientRequestId:'after-restart',expectedVersion:d1.version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s0.date),observations:[plain(d1.program,s0)]}});
 out.restartCustody={week0:w.ok?w.status:w.error?.code,restart:rs.ok?rs.status:rs.error?.code,afterRestart:r.ok?r.status:r.error?.code,message:r.error?.message??null};}

console.log(JSON.stringify(out,null,1));
