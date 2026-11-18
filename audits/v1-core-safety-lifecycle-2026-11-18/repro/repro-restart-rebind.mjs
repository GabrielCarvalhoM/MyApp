// Phase A, QRE-AIF-02 extent: after a restart, does a review WITHOUT any new report already rewrite plan A's rows (context re-bound to plan B's
// sessions of the same id)? Through the headless client and through the V1CIB custody. Prints JSON; writes nothing.
import {createClient} from '../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs';
import {athleteA,reportOf,liveSessions,at,ELIG,addDays} from '../../v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';
import {createCustody} from '../../../CoachingCore/src/boundary/custody.mjs';
import {memoryStore} from '../../../CoachingCore/src/boundary/store.mjs';
const entry=process.argv[2]??'v1-strength-index.mjs';
const S=await import('../../../CoachingCore/src/'+entry);
const ms=iso=>Date.parse(iso),out={entry};
const ctxOf=o=>o?.context?{sessionType:o.context.sessionType,weekIndex:o.context.weekIndex,plannedHash:o.context.plannedHash?.slice(0,12),dateShift:o.context.dateShift}:null;
{const c=createClient();c.onboard(athleteA({weeks:8}));const p0=c.envelope.program;
 for(const s of liveSessions(c.envelope,0))c.review('WEEKLY_REVIEW',at(addDays(p0.startDate,6)),{eligibility:ELIG(addDays(p0.startDate,6)),observations:[reportOf(c.envelope,s)]},{eventId:'w0-'+s.id});
 const before=Object.fromEntries(c.envelope.actualLedger.filter(o=>!o.fact).map(o=>[o.eventId,ctxOf(o)]));
 const day=addDays(p0.startDate,18),upd={...athleteA({weeks:8}),asOf:day,startDate:addDays(p0.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 c.restart(upd,at(day,'10:00'));const d=addDays(c.envelope.program.startDate,1);
 const r=c.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d)},{eventId:'plain-after-restart'});
 const after=Object.fromEntries(c.envelope.actualLedger.filter(o=>!o.fact).map(o=>[o.eventId,ctxOf(o)]));
 out.client={status:r.status,planAStart:p0.startDate,planBStart:c.envelope.program.startDate,changed:Object.keys(before).filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k])).map(k=>({eventId:k,before:before[k],after:after[k]}))};}
{let clock=ms('2026-11-14T12:00:00-03:00');const store=memoryStore(),cu=createCustody({store,key:'p0-synthetic-key-r',now:()=>clock,engine:S}),actor={athleteId:'p0-custody-rb'};
 const plain=(program,s)=>{const {eventId:_e,athleteId:_a,...o}=reportOf({program,presentation:{runSessions:{}},actualLedger:[]},s);return o;};
 cu.enroll({actor,intake:athleteA({id:'p0-custody-rb'}),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});const p0=store.load(actor.athleteId).program;
 clock=ms(at(addDays(p0.startDate,6)));cu.submit({actor,clientRequestId:'w0',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(addDays(p0.startDate,6)),observations:liveSessions({program:p0},0).map(s=>plain(p0,s))}});
 const day=addDays(p0.startDate,18),upd={...athleteA({weeks:8,id:'p0-custody-rb'}),asOf:day,startDate:addDays(p0.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 clock=ms(at(day,'10:00'));cu.restart({actor,intake:upd,expectedVersion:store.load(actor.athleteId).version});const d1=store.load(actor.athleteId),d=addDays(d1.program.startDate,1);
 clock=ms(at(d));const r=cu.submit({actor,clientRequestId:'plain',expectedVersion:d1.version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(d)}});
 out.custody={plainAfterRestart:r.ok?r.status:r.error?.code,message:r.error?.message??null};}
console.log(JSON.stringify(out,null,1));
