// P7-X6: the first-recorded clock's own rules on F4's normalizeObservations (recordArrival as evaluateProgram calls it), beyond the directed
// test: conflicts (same event id with other facts; physical disagreement), a correction resolving a conflict, a legacy (clockless) carried row
// merged with a new second-source report, a re-send of a superseded fact, two sources of one execution in the same decision, input order
// permutations, a carried clock supplied in actualLedger, and a re-send whose availability sorts before its carried row. Read-only; prints JSON.
import {RUNTIMES,programs,live} from './p7-lib.mjs';
const R=Object.values(RUNTIMES).at(-1),H=R.H,{normalizeObservations}=R.N;
const p=H.program(programs(H).GEN),s=p.weeks[0].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.role==='EASY'),A=p.athleteId;
const T=['2026-11-03T21:00:00Z','2026-11-05T07:00:00Z','2026-11-07T07:00:00Z','2026-11-09T07:00:00Z'].map(x=>new Date(x).toISOString());
const base={athleteId:A,sessionId:s.id,observedAt:`${s.date}T08:00:00Z`,actual:{completed:true,minutes:s.prescription.durationMinutes},response:{}};
const N=(obs,asOf,prior=[])=>normalizeObservations(obs,{athleteId:A,asOf,prior,maximumAgeDays:36500,recordArrival:true});
const clocks=n=>n.accepted.map(o=>({eventId:o.eventId,conflicted:!!o.conflicted,firstRecordedAt:o.provenance.firstRecordedAt??null}));
const out={probe:'P7-X6 first-recorded clock rules',checks:[]},check=(id,ok,detail)=>out.checks.push({id,ok,detail});
const n1=N([{...base,eventId:'e1'}],T[0]);
// 1. same event id re-sent with other facts: a conflict on the carried row, which keeps its own clock; the newcomer is rejected.
{const n=N([{...base,eventId:'e1',actual:{completed:true,minutes:5}}],T[1],n1.accepted);check('conflict:event-id-reused',n.accepted.length===1&&n.accepted[0].conflicted===true&&n.accepted[0].provenance.firstRecordedAt===T[0],clocks(n));}
// 2. a second report of the session that disagrees physically: conflict, the carried row keeps its clock.
const n2=N([{...base,eventId:'e2',actual:{completed:true,minutes:10},source:{provider:'WATCH',activityId:'w2'}}],T[1],n1.accepted);
check('conflict:physical',n2.accepted.length===1&&n2.accepted[0].conflicted===true&&n2.accepted[0].provenance.firstRecordedAt===T[0],clocks(n2));
// 3. a correction resolving that conflict: it takes the earliest clock of the execution's reports (the conflicted row's).
{const n=N([{...base,eventId:'e3',correctionOf:'e1',correctedAt:T[2],actual:{completed:true,minutes:20}}],T[2],[...n2.accepted,...n2.supersededRows]);const c=n.accepted.find(o=>o.eventId==='e3');check('correction-resolves-conflict:earliest',!!c&&c.provenance.firstRecordedAt===T[0]&&!c.conflicted,clocks(n));}
// 4. a legacy carried row (no clock) merged with a new second-source report: no clock is known for the execution.
{const legacy=n1.accepted.map(o=>{const {firstRecordedAt,...pv}=o.provenance;return {...o,provenance:pv};});const n=N([{...base,eventId:'e4',source:{provider:'WATCH',activityId:'w4'}}],T[1],legacy);check('legacy-merge:no-clock',n.accepted.length===1&&!('firstRecordedAt' in n.accepted[0].provenance),clocks(n));}
// 5. a superseded fact re-sent: stays history; the live correction keeps its clock.
{const c=N([{...base,eventId:'e5',correctionOf:'e1',correctedAt:T[1],actual:{completed:true,minutes:22}}],T[1],n1.accepted);const n=N([{...base,eventId:'e1'}],T[2],[...c.accepted,...c.supersededRows]);check('superseded-resend',n.accepted.length===1&&n.accepted[0].eventId==='e5'&&n.accepted[0].provenance.firstRecordedAt===T[0],clocks(n));}
// 6. two sources of one execution in the same decision: one row, that decision's clock.
{const n=N([{...base,eventId:'e6a'},{...base,eventId:'e6b',source:{provider:'WATCH',activityId:'w6'}}],T[1]);check('same-decision-two-sources',n.accepted.length===1&&n.accepted[0].provenance.firstRecordedAt===T[1],clocks(n));}
// 7. input order permutations of new and carried reports give the same record (deterministic).
{const s2=p.weeks[0].sessions.filter(x=>live(x)&&x.sport==='RUN')[1],obs=[{...base,eventId:'e7a',source:{provider:'WATCH',activityId:'w7'}},{athleteId:A,sessionId:s2.id,eventId:'e7b',observedAt:`${s2.date}T08:00:00Z`,actual:{completed:true,minutes:30},response:{}}];
 const a=N(obs,T[1],n1.accepted),b=N([...obs].reverse(),T[1],[...n1.accepted].reverse());check('order-permutation',R.hash(a.accepted)===R.hash(b.accepted),{a:clocks(a),b:clocks(b)});}
// 8. a re-send carrying a later reportedAt whose carried row has none: the carried clock stays.
{const n=N([{...base,eventId:'e1',reportedAt:T[1]}],T[1],n1.accepted);check('resend-later-reportedAt',n.accepted.length===1&&n.accepted[0].provenance.firstRecordedAt===T[0],clocks(n));}
// 9. a re-send that sorts before its carried row (the carried row has a late reportedAt, the re-send none): still the carried (earlier) clock.
{const c=N([{...base,eventId:'e9',reportedAt:T[1]}],T[1]);const n=N([{...base,eventId:'e9'}],T[2],c.accepted);check('resend-sorts-first',n.accepted.length===1&&n.accepted[0].provenance.firstRecordedAt===T[1],clocks(n));}
// 10. (trust note) a clock supplied in the carried record (actualLedger) is kept as carried; one supplied in observations is replaced.
{const forged=n1.accepted.map(o=>({...o,provenance:{...o.provenance,firstRecordedAt:'2020-01-01T00:00:00.000Z'}}));const n=N([],T[1],forged),m=N([{...base,eventId:'e10',provenance:{firstRecordedAt:'2020-01-01T00:00:00.000Z'}}],T[1]);check('trust:carried-clock-kept,observation-clock-replaced',n.accepted[0].provenance.firstRecordedAt==='2020-01-01T00:00:00.000Z'&&m.accepted[0].provenance.firstRecordedAt===T[1],{carried:clocks(n),observation:clocks(m)});}
out.pass=out.checks.filter(c=>c.ok).length;out.total=out.checks.length;
console.log(JSON.stringify(out,null,1));
