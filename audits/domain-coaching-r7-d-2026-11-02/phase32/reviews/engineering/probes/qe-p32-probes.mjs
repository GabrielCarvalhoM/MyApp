// R7-D Phase 3.2 engineering check (R7D-ENGINEERING-PHASE32-CHECK-1), independent probes. Synthetic development fixtures (r7/b/fixtures):
// engineering evidence only. Run on a scratch root holding CoachingCore (never on the repository):
//   node qe-p32-probes.mjs <root holding CoachingCore> [--label <name>]
// Scenarios (each prints what the runtime decided; the judgment is in the engineering record):
//   K   relation ASK propagation: every review kind, with no break of its own, while two breaks are kept and the newer one is unnamed
//   DL  dateless reports with the same facts stated two weeks apart (are they joined as one declaration?), against the dated control
//   SE  the same event id sent again with other facts while its break is kept (one and two kept breaks)
//   AN  the relation answered under the kept report's own event id, then a TRAINING_BETWEEN_BREAKS answer in a later review
//   ORD record-order invariance: two breaks declared at the same clock, the carried record in either order
//   SC  after a separate-breaks return: a correction that names the earlier separate break, then one that names the return's episode
//   TH  three kept breaks, the third unnamed; then answered
//   TB  the TRAINING_BETWEEN_BREAKS question: does a proposal travel with it
//   RP  determinism: the same input twice, byte-identical result
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(process.argv[2]??'.'),label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:root;
const L=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const V=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const R6=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-adaptation.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=L,{hash}=V;
const GEN={id:'qe-p32',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
const trained=weeks=>{const t={p:program(GEN),ledger:[],ref:null};for(const w of weeks)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});return t;};
const BASE=trained([0,1]),S2=BASE.p.weeks[2].startDate;
const brk=(from,to,x={})=>({startDate:addDays(S2,from),endDate:addDays(S2,to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const A=()=>brk(0,13),B=()=>brk(14,20,{reasonCategory:'WORK',reason:'Work trip'}),D=()=>brk(17,20,{reasonCategory:'WORK',reason:'Work trip'});
const W4D0={day:0,hour:'07:00:00'},W5D0={day:0,hour:'07:00:00'},W5D1={day:1,hour:'07:00:00'},W5D2={day:2,hour:'07:00:00'},W5D3={day:3,hour:'07:00:00'};
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
const rows=l=>l.filter(o=>o.fact==='INTERRUPTION_DECLARED');
const v=(r,t)=>{const ret=r.action==='REESTABLISH'&&t?returns(t.p).at(-1)?.interruption:null;return {status:r.status,action:r.action,validity:r.planValidity?.status??null,question:r.question?.kind??null,missing:r.missingInputs??[],proposalActions:r.proposal?r.proposal.decisions.slice(-1).map(d=>d.action):[],...(ret?{ret:{episode:ret.episode,start:ret.startDate,end:ret.endDate,days:ret.days,class:ret.class,relation:ret.relation,basis:ret.basis,separate:(ret.separateBreaks??[]).map(b=>`${b.episode}:${b.startDate}..${b.endDate}:${b.stop}`),notApplied:(ret.notApplied??[]).map(b=>b.eventId)}}:{}),reason:String(r.reason).slice(0,260)};};
const twoKept=(newer=B())=>{const t=copy(BASE);step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'qe-A',kind:'SYSTEMIC_FATIGUE'}});step(t,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:newer,event:{id:'qe-B',kind:'LOCAL_FATIGUE'}});return t;};
const out={probe:'R7D-ENG-P32-PROBES-1',runtime:label,r6Sha:null,scenarios:{}};

// K: every review kind, no break of its own, two kept breaks with the newer unnamed.
{const res={};const t0=twoKept();
 for(const kind of R6.REVIEW_KINDS){const t=copy(t0);let r;try{r=step(t,5,{...W5D1,kind});res[kind]=v(r,t);}catch(e){res[kind]={error:e.message};}}
 out.scenarios.K={note:'every kind with no break of its own after A kept and B kept unnamed',results:res,
  allRelationOrClinical:Object.values(res).every(x=>x.question==='INTERRUPTION_RELATION'||x.status==='CLINICAL_HUMAN_REQUIRED'),
  anyReturnOrValid:Object.values(res).some(x=>x.proposalActions?.includes('REESTABLISH')||x.validity==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE')};}

// DL: dateless reports with the same facts, two weeks apart; dated control with distinct dates.
{const t=copy(BASE),f={days:5,reasonCategory:'WORK',reason:'Work trip',nonclinical:true};
 const a=step(t,3,{day:3,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...f},event:{id:'qe-DL1',kind:'SYSTEMIC_FATIGUE'}});
 const b=step(t,5,{day:3,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...f},event:{id:'qe-DL2',kind:'LOCAL_FATIGUE'}});
 const r=step(t,5,{day:4,hour:'07:00:00'});
 const c=copy(BASE);
 step(c,3,{day:3,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...f,startDate:addDays(c.p.weeks[3].startDate,-2),endDate:addDays(c.p.weeks[3].startDate,2)},event:{id:'qe-DC1',kind:'SYSTEMIC_FATIGUE'}});
 step(c,5,{day:3,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...f,startDate:addDays(c.p.weeks[5].startDate,-2),endDate:addDays(c.p.weeks[5].startDate,2)},event:{id:'qe-DC2',kind:'LOCAL_FATIGUE'}});
 const rc=step(c,5,{day:4,hour:'07:00:00'});
 out.scenarios.DL={note:'two dateless reports with the same facts (5 days, work trip), declared in week 3 and week 5; then a plain review',first:v(a),second:v(b),plain:v(r,t),declaredRows:rows(t.ledger).length,datedControlPlain:v(rc,c),
  joinedAsOne:r.question?.kind!=='INTERRUPTION_RELATION'};}

// SE: the same event id sent again with other facts while its break is kept.
{const t=copy(BASE);step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'qe-SE',kind:'SYSTEMIC_FATIGUE'}});
 const r1=step(copy(t),5,{...W5D1,kind:'RETURN_AFTER_PAUSE',interruption:B(),event:{id:'qe-SE',kind:'RETURN_AFTER_PAUSE'}});
 const t1=copy(t);const r1b=step(t1,5,{...W5D1,kind:'RETURN_AFTER_PAUSE',interruption:B(),event:{id:'qe-SE',kind:'RETURN_AFTER_PAUSE'}});
 // Two kept: A (qe-SE) and a named separate D (qe-D); qe-SE sent again with B's facts as a weekly review.
 const t2=copy(t);step(t2,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:{...brk(30,33,{reasonCategory:'WORK',reason:'x'})},event:{id:'qe-noop',kind:'LOCAL_FATIGUE'}});
 const t3=copy(t);step(t3,5,{...W5D0,kind:'LOCAL_FATIGUE',interruption:{...D(),episodeId:'qe-D'},event:{id:'qe-D',kind:'LOCAL_FATIGUE'}});
 const gap=t3.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=addDays(S2,14)&&s.date<=addDays(S2,16));
 const r3=step(t3,5,{...W5D1,interruption:{...B(),reason:'Work trip (sent again under the first report id)'},event:{id:'qe-SE',kind:'WEEKLY_REVIEW'},observations:gap.map(s=>obs(t3.p,s,{actual:{completed:false,minutes:0}}))});
 out.scenarios.SE={note:'A (14 days) kept under event qe-SE; the same event id sent again as a return report with B (7 days); FREEZE-2 also read the own break',
  oneKept:v(r1b,t1),recordRowFacts:rows(t1.ledger).map(x=>`${x.eventId}:${x.interruption.startDate}..${x.interruption.endDate}`),
  twoKeptSeparate:v(r3,t3),
  olderFactsReadInOneKept:r1b.action==='REESTABLISH'?returns(t1.p).at(-1).interruption.startDate===A().startDate:null};}

// AN: the relation answered under the newer report's own event id; the decision then asks TRAINING_BETWEEN_BREAKS; answered in a later review.
{const mk=()=>twoKept(D());const gapOf=t=>t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=addDays(S2,14)&&s.date<=addDays(S2,16));
 const t=mk();const q1=step(t,5,{...W5D1,kind:'WEEKLY_REVIEW',interruption:{...D(),episodeId:'qe-B'},event:{id:'qe-B',kind:'WEEKLY_REVIEW'}});
 const g=gapOf(t),q2=step(t,5,{...W5D2,observations:g.map(s=>obs(t.p,s,{actual:{completed:false,minutes:0}}))});
 const u=mk();const p1=step(u,5,{...W5D1,interruption:{...D(),episodeId:'qe-B'},event:{id:'qe-B-answer',kind:'WEEKLY_REVIEW'}});
 const gu=gapOf(u),p2=step(u,5,{...W5D2,observations:gu.map(s=>obs(u.p,s,{actual:{completed:false,minutes:0}}))});
 out.scenarios.AN={note:'answer under the kept report’s own event id (not recorded: the first row stands) versus under a new event id',
  sameIdAnswer:v(q1,t),sameIdThenGapAnswer:v(q2,t),newIdAnswer:v(p1,u),newIdThenGapAnswer:v(p2,u)};}

// ORD: two breaks declared at the same clock (A, then D named separate), then a return; the carried record in either order.
{const t=copy(BASE),at={day:0,hour:'07:00:00'};
 const E={...brk(7,13,{reasonCategory:'WORK',reason:'Work trip'}),episodeId:'qe-E'};
 step(t,4,{...at,kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:'qe-OA',kind:'SYSTEMIC_FATIGUE'}});
 step(t,4,{...at,kind:'LOCAL_FATIGUE',interruption:E,event:{id:'qe-E',kind:'LOCAL_FATIGUE'}});
 const decl=rows(t.ledger),other=t.ledger.filter(o=>o.fact!=='INTERRUPTION_DECLARED');
 const mkIn=l=>({...review(t.p,4,{day:1,hour:'07:00:00'}),event:{id:'qe-ORD',kind:'WEEKLY_REVIEW'},actualLedger:l});
 const r1=evaluateProgram(t.p,mkIn([...other,...decl]),opts),r2=evaluateProgram(t.p,mkIn([...other,...[...decl].reverse()]),opts);
 const ret=r=>r.proposal?returns(r.proposal).at(-1)?.interruption:null,strip=x=>x&&({start:x.startDate,end:x.endDate,days:x.days,class:x.class,entry:hash(x.entry)});
 out.scenarios.ORD={note:'A (14 days) and E (7 days, same end, named) declared at the same clock; return read with the record in either order',
  order1:{...v(r1),episode:ret(r1)?.episode,separate:(ret(r1)?.separateBreaks??[]).map(b=>`${b.episode}:${b.stop}`)},order2:{...v(r2),episode:ret(r2)?.episode,separate:(ret(r2)?.separateBreaks??[]).map(b=>`${b.episode}:${b.stop}`)},
  sameStopAndEntry:JSON.stringify(strip(ret(r1)))===JSON.stringify(strip(ret(r2))),sameWholeResult:hash(JSON.parse(JSON.stringify({...r1,inputHash:null,trace:null,actualLedger:null,referenceState:null})))===hash(JSON.parse(JSON.stringify({...r2,inputHash:null,trace:null,actualLedger:null,referenceState:null})))};}

// SC: after a separate-breaks return (A and B touching), a correction that names A's identity, then one naming the return's episode.
{const t=twoKept();step(t,5,{...W5D1,interruption:{...B(),episodeId:'qe-B'},event:{id:'qe-SC-ans',kind:'WEEKLY_REVIEW'}});
 const before=returns(t.p).length,Ac={...A(),endDate:addDays(S2,11),days:12,episodeId:'qe-A'};
 const c1=step(copy(t),5,{...W5D3,kind:'RETURN_AFTER_PAUSE',interruption:Ac,event:{id:'qe-SC-c1',kind:'RETURN_AFTER_PAUSE'}});
 const t2=copy(t),c2=step(t2,5,{...W5D3,kind:'RETURN_AFTER_PAUSE',interruption:{...Ac,episodeId:'qe-B'},event:{id:'qe-SC-c2',kind:'RETURN_AFTER_PAUSE'}});
 out.scenarios.SC={note:'separate return A+B (episode qe-B); then a correction of A naming qe-A; then one naming qe-B with A’s corrected facts',returnsBefore:before,
  firstReturn:(returns(t.p).at(-1)?.interruption?.separateBreaks??[]).map(b=>`${b.episode}:${b.startDate}..${b.endDate}:${b.stop}`),namingA:v(c1),namingEpisode:v(c2,t2)};}

// TH: three kept breaks: A (unnamed), F (named separate, after A), G (unnamed, later); then G answered as separate.
{const t=copy(BASE);
 step(t,4,{...W4D0,kind:'SYSTEMIC_FATIGUE',interruption:brk(0,6),event:{id:'qe-TA',kind:'SYSTEMIC_FATIGUE'}});
 step(t,4,{day:1,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...brk(7,13,{reasonCategory:'WORK',reason:'Work'}),episodeId:'qe-TF'},event:{id:'qe-TF',kind:'LOCAL_FATIGUE'}});
 step(t,4,{day:2,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:brk(14,20,{reasonCategory:'FAMILY',reason:'Family'}),event:{id:'qe-TG',kind:'LOCAL_FATIGUE'}});
 const q=step(t,5,W5D1),a=step(t,5,{...W5D2,interruption:{...brk(14,20,{reasonCategory:'FAMILY',reason:'Family'}),episodeId:'qe-TG'}});
 out.scenarios.TH={note:'three kept breaks touching (7+7+7 days); the third unnamed',question:{...v(q),breaks:q.question?.breaks?.map(b=>b.episodeId),unresolved:q.question?.unresolved},answered:v(a,t)};}

// TB: does a proposal travel with TRAINING_BETWEEN_BREAKS.
{const t=twoKept(D());const q=step(t,5,{...W5D1,interruption:{...D(),episodeId:'qe-B'}});
 out.scenarios.TB={question:v(q),proposal:q.proposal?{lastAction:q.proposal.decisions.at(-1)?.action,decisions:q.proposal.decisions.length}:null,unreported:q.question?.unreported??null};}

// RP: determinism over a whole separate-break sequence.
{const run=()=>{const t=twoKept();const a=step(t,5,W5D1),b=step(t,5,{...W5D2,interruption:{...B(),episodeId:'qe-B'},event:{id:'qe-RP',kind:'WEEKLY_REVIEW'}});return hash(JSON.parse(JSON.stringify([a,b,t.p,t.ledger])));};
 // The helper numbers event ids with a counter: ids differ between runs, so compare a run with itself rebuilt from the same inputs.
 const t=twoKept(),inp={...review(t.p,5,W5D2),interruption:{...B(),episodeId:'qe-B'},event:{id:'qe-RP',kind:'WEEKLY_REVIEW'},actualLedger:t.ledger,referenceState:t.ref};
 const x1=evaluateProgram(t.p,inp,opts),x2=evaluateProgram(JSON.parse(JSON.stringify(t.p)),JSON.parse(JSON.stringify(inp)),opts);
 out.scenarios.RP={sameInputSameBytes:JSON.stringify(x1)===JSON.stringify(x2),action:x1.action};}
console.log(JSON.stringify(out,null,1));
