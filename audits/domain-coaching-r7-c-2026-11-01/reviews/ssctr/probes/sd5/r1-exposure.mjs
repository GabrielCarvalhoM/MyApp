// SSCTR semantic re-disposition (R7-C Phase 5), probe R1X: the exposure of residual R1. After a known stop (every gap run reported not done)
// answered on day 2 or day 5 of week 7, the elapsed answer-week sessions keep the prescriptions stored while the question was open (history), and
// week 8's conditional projection counts them as prescribed. Does that projection reach week 8 in force, VALID, above what the facts allow?
// Timelines as in the Phase 5 tests: GEN, gap from the start (g=0) or after two executed weeks (g=2), RV, answer MISS on day 2 or day 5 (B); A has
// the facts at week 6's review. After the answer, week 7's facts are one of:
//  NONE      nothing of week 7 reported;
//  REST      the sessions from the answer on executed as prescribed, the elapsed ones unreported;
//  ALL       the elapsed runs reported not done, the rest executed as prescribed (the Phase 5 convergence facts).
// Then week 7 is either reviewed (REVIEW, end of week, with those facts) or not (NOREVIEW, the facts sent with the week-8 decision), and on day 0
// of week 8 a decision of each kind. Per cell: status, validity, week 8's runs in force from day 0, against A with the same facts and decisions,
// and whether any VALID week-8 run exceeds the single-run ceiling on the factual ledger (longest completed run in 30 days + 5, entry with none).
// Read-only on the working tree; prints JSON.
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
const rt=await load(REPO),H=rt.H,POL=rt.opts.authority.policy.operational,ENTRY=POL.return.entryRunMinutes,CEIL=POL.run.singleRunCeiling;
const GEN={id:'sd5-r1x-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const notDone=(p,s)=>({eventId:`sd5-r1x-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>H.live(s)&&s.sport==='RUN'));
function step(t,w,x={}){const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;}
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
function fork(g){
 const t={p:H.program(GEN),ledger:[],ref:null};
 for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 for(let w=g;w<6;w++)step(t,w,{observations:strengthOf(t.p,w)});
 const facts=runSessions(t.p,g,7).map(s=>notDone(t.p,s)),A=copy(t),B=copy(t);
 step(A,6,{observations:[...strengthOf(t.p,6),...facts]});step(B,6,{observations:strengthOf(t.p,6)});
 return {A,B,facts};
}
const day=(p,b,d)=>H.addDays(p.weeks[b].startDate,d);
const week7Facts=(P,d,mode)=>{const cut=day(P,7,d),live=P.weeks[7].sessions.filter(H.live);if(mode==='NONE')return [];
 return live.flatMap(s=>s.date>=cut?[H.obs(P,s)]:mode==='ALL'&&s.sport==='RUN'?[notDone(P,s)]:mode==='ALL'?[H.obs(P,s)]:[]);};
const runs8=P=>P.weeks[8].sessions.filter(s=>s.sport==='RUN'&&H.live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
function ceilingBreach(t,P){
 const byId=new Map(P.weeks.flatMap(x=>x.sessions).map(s=>[s.id,s]));
 const done=t.ledger.filter(o=>o.actual?.completed!==false&&Number(o.actual?.minutes)>0&&byId.get(o.sessionId)?.sport==='RUN').map(o=>({date:o.observedAt.slice(0,10),min:o.actual.minutes}));
 return P.weeks[8].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.role!=='RACE').filter(s=>{const win=done.filter(x=>x.date<s.date&&(Date.parse(s.date)-Date.parse(x.date))/864e5<=CEIL.windowDays);return s.prescription.durationMinutes>(win.length?Math.max(...win.map(x=>x.min))+CEIL.stepMinutes:ENTRY);}).map(s=>`${s.id}:${s.prescription.durationMinutes}`);
}
const KINDS={WEEKLY_REVIEW_DAY0:{},EQUIPMENT_CHANGE:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}},GOAL_CHANGE:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},SCHEDULE_CHANGE:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},SYSTEMIC_FATIGUE:{kind:'SYSTEMIC_FATIGUE'},LOCAL_FATIGUE:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},RECOVERED:{kind:'RECOVERED'}};
const brief=r=>`${r.status}/${r.action??''}/${r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status}${r.question?'/'+r.question.kind:''}`;
const out={check:'SSCTR-SD5-R1-EXPOSURE',entry:ENTRY,cases:{},breaches:[],summary:{}};
for(const g of [0,2])for(const d of [2,5]){
 const f=fork(g);const B0=copy(f.B),ans=step(B0,7,{day:d,hour:'07:00:00',observations:f.facts});
 const key=`g=${g} answer day ${d}`;out.cases[key]={answer:brief(ans),week8AfterAnswerB:runs8(B0.p),week8A:runs8(f.A.p),elapsedB:B0.p.weeks[7].sessions.filter(s=>H.live(s)&&s.sport==='RUN'&&s.date<day(B0.p,7,d)).map(s=>`${s.role}:${s.prescription.durationMinutes}`),cells:{}};
 for(const facts of ['NONE','REST','ALL'])for(const rev of ['REVIEW','NOREVIEW']){
  const B=copy(B0),A=copy(f.A),fb=week7Facts(B.p,d,facts),fa=week7Facts(A.p,d,facts);let w7b=null,w7a=null;
  if(rev==='REVIEW'){w7b=brief(step(B,7,{observations:[...fb]}));w7a=brief(step(A,7,{observations:[...fa]}));}
  for(const [kind,x] of Object.entries(KINDS)){
   const rb=step(copy(B),8,{day:0,hour:'07:00:00',...x,observations:rev==='NOREVIEW'?fb:[]}),ra=step(copy(A),8,{day:0,hour:'07:00:00',...x,observations:rev==='NOREVIEW'?fa:[]});
   const PB=rb.proposal??B.p,PA=ra.proposal??A.p,valid=rb.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
   const tb=copy(B);tb.ledger=rb.actualLedger??tb.ledger;const breach=valid?ceilingBreach(tb,PB):[];
   const cell=`${facts} ${rev} ${kind}`;
   out.cases[key].cells[cell]={week7Review:w7b?`${w7b} (A ${w7a})`:null,B:brief(rb),A:brief(ra),week8B:runs8(PB),week8A:runs8(PA),same:JSON.stringify(runs8(PB))===JSON.stringify(runs8(PA)),breach};
   if(breach.length)out.breaches.push(`${key} ${cell}: ${brief(rb)} ${breach.join(',')} (A ${runs8(PA).join('/')})`);
  }
 }
}
let n=0,same=0,validB=0;for(const c of Object.values(out.cases))for(const x of Object.values(c.cells)){n++;if(x.same)same++;if(/VALID/.test(x.B)&&!/REQUIRES/.test(x.B))validB++;}
out.summary={cells:n,sameAsA:same,validInB:validB,breaches:out.breaches.length};
console.log(JSON.stringify(out,null,1));
