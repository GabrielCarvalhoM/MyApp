// QRE FPV R1, probe p03: edges of the two candidate fixes beyond their own tests. Synthetic only.
//   node p03-fix-edges.mjs <repo-copy>
// (a) SEC-BC-R2-01: the view reads only erasure markers whatever their instant. A readiness declaration made with the clock ahead, then the clock
//     set right: the view as committed vs the "every F08 fact at Infinity" variant (mutant V2 of p02, which the tests do not kill).
// (b) FPV-01 sweep wider than the test's week 0: hold in weeks 0-2, any day, declaration 1-3 days later, a report done or stopped before the hold;
//     then the next screen, a later report and a correction of the earlier report. Any ENGINE_CONTRACT_VIOLATION is listed.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const R=process.argv[2],imp=p=>import(pathToFileURL(path.join(R,'CoachingCore',p)).href);
const {athlete,notFeeling100WithSign,readiness,addDays,ELIG}=await imp('test/v1int-helpers.mjs');
const {planView}=await imp('src/boundary/views.mjs'),{readableF08,standingHolds,isF08Fact}=await imp('src/v1-f08.mjs');
const code=r=>r?.ok===false?r.error.code:'OK';
const U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
// (a)
{const t=athlete({id:'p03a'});t.enroll();const d0=t.sessions(0)[0].date,d=k=>addDays(d0,k);
 t.set(d(3),'09:00');const h=t.api.notFeeling100({actor:t.actor,clientRequestId:'h',expectedVersion:t.version(),...notFeeling100WithSign(d(3))});
 t.set(d(20),'09:00');const rd=t.api.declareReadiness({actor:t.actor,clientRequestId:'rd',expectedVersion:t.version(),...readiness(d(20))});
 const out={hold:code(h),readinessAhead:code(rd),at:{}};
 for(const k of [4,10,21]){t.set(d(k),'10:00');const doc=t.doc(),v=planView(doc,{nowMs:t.clock}),f08=doc.rows.filter(r=>r!==null).filter(isF08Fact);
  const v2=standingHolds(readableF08(f08,{athleteId:doc.athleteId,at:Infinity})).holds.length;
  out.at['d+'+k]={committedView:v.state,executable:v.week.sessions.filter(s=>s.executable).length,holdsIfEveryFactReadAtInfinity:v2,write:code(t.weekly(d(k),[]))};}
 console.log('(a)',JSON.stringify(out));}
// (b)
{let cases=0;const bad=[],codes={};
 for(const w of [0,1,2])for(let hd=0;hd<=6;hd++)for(const lag of [1,2,3])for(const kind of ['done','stop']){
  const t=athlete({id:`p03b-${w}-${hd}-${lag}-${kind}`});t.enroll();const p=t.doc().program,ws=addDays(p.startDate,7*w),h=addDays(ws,hd),rdDay=addDays(h,lag);
  const before=t.sessions(w).filter(s=>s.sport==='RUN'&&s.date<h);if(!before.length)continue;cases++;const s=before[0];
  t.set(s.date,'20:00');const f=t.form(s),obs=kind==='stop'?{...f,actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}:f;
  const rec=t.weekly(s.date,[obs]);const steps=[['report',code(rec)]];
  t.set(h,'08:00');steps.push(['hold',code(t.api.notFeeling100({actor:t.actor,clientRequestId:'h',expectedVersion:t.version(),...notFeeling100WithSign(h)}))]);
  t.set(rdDay,'08:00');steps.push(['readiness',code(t.api.declareReadiness({actor:t.actor,clientRequestId:'rd',expectedVersion:t.version(),...readiness(rdDay)}))]);
  t.set(rdDay,'09:00');steps.push(['screen',code(t.screen(ELIG(rdDay)))]);
  const later=[...t.sessions(w),...t.sessions(w+1)].find(x=>x.date>rdDay);
  if(later){t.set(later.date,'20:00');steps.push(['later',code(t.weekly(later.date,[t.form(later)]))]);
   if(rec.ok&&rec.recorded?.[0]){t.set(later.date,'21:00');steps.push(['correction',code(t.weekly(later.date,[{...t.form(s),correctionOf:rec.recorded[0],response:U3}]))]);}}
  for(const [k,c] of steps){codes[k+':'+c]=(codes[k+':'+c]??0)+1;}
  if(steps.some(([,c])=>c==='ENGINE_CONTRACT_VIOLATION'))bad.push(`${w}/${hd}/${lag}/${kind}:`+steps.filter(([,c])=>c!=='OK').map(([k,c])=>k+'='+c).join(','));}
 console.log('(b)',JSON.stringify({cases,engineContractViolations:bad.length,byWeek:Object.fromEntries([0,1,2].map(w=>[w,bad.filter(b=>b.startsWith(w+"/")).length])),codes,first:bad.slice(0,8)}));}
