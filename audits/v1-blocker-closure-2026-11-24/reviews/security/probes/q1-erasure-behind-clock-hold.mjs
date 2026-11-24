// SEC_BC_R1 probe q1 (SEC-INT-04 rest): does an erasure of health facts allowed under a clock behind the record date its erasure marker in the
// past, so that an earlier readiness declaration answers it and a standing clinical hold is released?
// Usage: node q1-erasure-behind-clock-hold.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q1-erasure-behind-clock-hold.mjs <root>');
const H=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const {athlete,notFeeling100WithSign,readiness,addDays}=H;
const code=r=>r.ok?'OK':r.error.code;
function scenario(attack){
 const t=athlete({id:`q1-${attack?'atk':'ctl'}`});t.enroll();const d0=t.sessions(0)[0].date;
 t.set(d0,'08:00');const h1=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf1',expectedVersion:t.version(),...notFeeling100WithSign(d0)});
 const d1=addDays(d0,1);t.set(d1,'09:00');const r0=t.api.declareReadiness({actor:t.actor,clientRequestId:'rd1',expectedVersion:t.version(),...readiness(d1)});
 const d3=addDays(d0,3);t.set(d3,'09:00');const h2=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf2',expectedVersion:t.version(),...notFeeling100WithSign(d3)});
 const before=t.api.status({actor:t.actor});
 // control: erase at the true time; attack: the clock set back to the evening of d0 (after enrollment, before the readiness declaration)
 if(attack)t.set(d0,'20:00');else t.set(d3,'10:00');
 const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[h2.eventId],expectedVersion:t.version()});
 const marker=t.it.visible(t.doc()).filter(r=>r.fact==='ERASED_F08').map(r=>r.declaredAt);
 t.set(d3,'11:00');const after=t.api.status({actor:t.actor});
 const wk=t.weekly(d3,[]);
 return {attack,h1:[code(h1),h1.status],r0:[code(r0),r0.status],h2:[code(h2),h2.status],holdBefore:before.hold?.exit??before.state,erase:code(e),marker,
  stateAfter:after.state,holdAfter:after.hold?.exit??null,weekly:[code(wk),wk.status]};
}
for(const a of [false,true])console.log(JSON.stringify(scenario(a)));
