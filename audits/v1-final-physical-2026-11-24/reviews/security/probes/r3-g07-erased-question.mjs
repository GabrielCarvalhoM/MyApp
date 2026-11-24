// SEC_FPV_R1 probe r3 (G07, the logged-only path): a "not 100%" report that opens no hold but leaves a question (ASK, NEEDS_INPUT), then its
// erasure. Prints the question, the view before and after (state, executable sessions), whether a marker was written, and the device channel.
//  a  mild illness, warning signs unanswered        b  mild illness, signs named outside the vocabulary (read as unrecognized)      c  a condition outside the list
// Usage: node r3-g07-erased-question.mjs <root containing CoachingCore>   (synthetic athletes only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node r3-g07-erased-question.mjs <root>');
const {athlete,addDays,ELIG}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r?.ok===false?r.error.code:'OK';
const NO={chestPain:false,fainting:false,breathlessness:false,palpitations:false,fever:false,swelling:false};
const cases={a:{condition:'MILD_ILLNESS',warningSigns:{},intent:'REST',days:1},b:{condition:'MILD_ILLNESS',warningSigns:null,intent:'REST',days:1},c:{condition:'PAIN',warningSigns:{},intent:'REST',days:2}};
for(const [k,wb] of Object.entries(cases)){
 const t=athlete({id:`r3-${k}`});t.enroll();const p=t.doc().program,d4=addDays(p.startDate,4);t.set(d4,'08:00');
 const r=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),eligibility:ELIG(d4),wellbeing:wb.warningSigns===null?{...wb,warningSigns:NO}:wb});
 const v0=t.api.plan({actor:t.actor}).view;
 const out={case:k,nf:[code(r),r.status??null,r.error?.message?.slice(0,80)??null],question:v0.question,before:[v0.state,v0.week.sessions.filter(s=>s.executable).length],factRows:t.doc().rows.filter(x=>x&&x.fact).map(x=>x.fact)};
 if(r.ok){t.set(d4,'09:00');const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[r.eventId],expectedVersion:t.version()});const v1=t.api.plan({actor:t.actor}).view;
  out.erase=code(e);out.marker=t.doc().rows.some(x=>x?.fact==='ERASED_F08');out.after=[v1.state,v1.week.sessions.filter(s=>s.executable).length];
  const s=t.sessions(0).find(x=>x.date>=d4&&x.sport==='RUN');if(s){t.set(d4,'10:00');out.device=code(t.it.importActivities({actor:t.actor,clientRequestId:'hk',expectedVersion:t.version(),activities:[t.watch(s)]}));}}
 console.log(JSON.stringify(out));
}
