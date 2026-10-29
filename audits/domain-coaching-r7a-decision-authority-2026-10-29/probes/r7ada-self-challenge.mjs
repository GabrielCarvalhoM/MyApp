// Author probe (R7-A DECISION AUTHORITY, Founder request §32): the self-challenge, by equivalence class, before the freeze. Each class builds two or
// more cells that hold the same facts (or differ only in what the class says must not matter) and counts the cases where HistoricalState or the
// resolved prescription differs, or a progression is granted without the execution that earns it. Prints JSON only. R7ADA_ROOT selects the tree.
//   A  factual authority          A1 FROM_LOG + a KNOWN row planned before a correction (P01: EARLY, LATE, AFTER); A2 a known load corrected lower,
//                                 the row ahead planned from the retracted one; A3 a conflicting late wearable record; A4 the planned target alone
//                                 (P1); A5 an unreadable execution; A6 a newer report of a break that moves an establishment inside the pause
//   C  coherent decision context  C1 goal change, every ordered pair (P07); C2 a goal change stated after the closing review; C3 handler order;
//                                 C4 review closure (complete week; an open week, where the decisions that re-plan agree); C5 a return's own week
//                                 closed, then a no-op decision
//   D  progression authority      D1 two unexecuted weeks (P02b, EASY and WALK_JOG, k=1..11: threshold, quality, strides, ladder, continuous
//                                 running); D2 missed long runs with the projection ahead; D3 HOLD + RETURN: each run of a return week missed in
//                                 turn, a run not yet due (P05, P05b), a second return week whose long run is missed
//   E  walk/jog return ceiling    E1 the SSCTR's 12 cells (HOLD, consolidation, repeated pause, SHORT/MODERATE); E2 a step earned and never run,
//                                 then a pause (same-week and cross-week reports)
// Recorded, not counted (`declared`): the standing projection after a week no review closed and no decision re-planned (boundary E1/E3, kept).
import * as L from './r7ada-lib.mjs';
const out={probe:'r7ada-self-challenge',tree:L.TREE,classes:{},declared:{}};
const cls=(name,cases)=>{const v=cases.filter(c=>c.violation);out.classes[name]={cases:cases.length,violations:v.length,examples:v.slice(0,4).map(c=>c.case)};};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// A run state claims more than another: a later mode, a higher step, target, counter or peak, fewer walk days, strides unlocked.
const RANK={WALK_JOG:0,RESTART:1,RETURN:1,EASY:2},NUM=['walkStep','restart','returnStep','long','easy','easyExtra','qualityStep','specificStep','thresholdDone','devCount','easyWeeksDone','qualityDone','stridesDone','longestContinuous'];
function ahead(a,b){
 if(a.mode!==b.mode)return RANK[a.mode]>RANK[b.mode]?['mode']:[];
 const f=NUM.filter(k=>Number.isFinite(a[k])&&(!Number.isFinite(b[k])||a[k]>b[k]));
 for(const k of ['long','easy','strides'])if(Number.isFinite(a.achieved?.[k])&&(!Number.isFinite(b.achieved?.[k])||a.achieved[k]>b.achieved[k]))f.push('achieved.'+k);
 if(a.achieved?.quality&&!b.achieved?.quality)f.push('achieved.quality');
 if(Number.isFinite(a.walks)&&Number.isFinite(b.walks)&&a.walks<b.walks)f.push('walks');
 if(a.stridesEligible&&!b.stridesEligible)f.push('stridesEligible');
 return f;
}

// ---------- A: factual authority ----------
const RDL='db-rdl',P01V={noDetails:{noDetails:true},repsNoLoad:{set:(id,x)=>id===RDL?{reps:x.reps,rir:x.rir}:x},unknownUnit:{set:(id,x)=>id===RDL?{...x,load:{...x.load,unit:'STONE'}}:x}};
const kgOf=first=>(id,e)=>id===RDL?first:(e.load.mode==='KNOWN'?e.load.value:20);
function p01Reports(v,kg,first=20){L.resetIds();const t=L.gen({id:'r7ada-a1'});L.weekly(t,0,()=>true,s=>L.SAT(s)?{kg:kgOf(first)}:{});
 const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{kg:kgOf(first)}:{}),eventId:`a1-w1-${i}`}));L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));
 const w2=t.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?v:{}),eventId:`a1-w2-${i}`}));
 const w3=t.p.weeks[3].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{kg:kgOf(kg),sets:(id,e)=>id===RDL?3:e.sets,set:(id,x)=>id===RDL?{...x,reps:5,rir:3}:x}:{}),eventId:`a1-w3-${i}`}));
 return {w1,w2,w3};}
/** fix(o) is the correction of an original report: removal (A1) or a lower load (A2). target replaces the planned load of week 3's row. */
function p01(cell,R,{fix,first=20,target=null}){L.resetIds();const t=L.gen({id:'r7ada-a1'});L.weekly(t,0,()=>true,s=>L.SAT(s)?{kg:kgOf(first)}:{});
 const has=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===RDL)));
 const originals=[...t.ledger.filter(o=>o.logs?.[RDL]&&!o.superseded),...R.w1.filter(has)],correctedAt=`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
 const fixes=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:fix(o.actual.exercises??[])},response:{...o.response}}));
 L.step(t,L.at(t.p,1,6,'21:00:00',{observations:cell==='EARLY'?[...R.w1,...fixes]:R.w1}));
 if(cell==='LATE')L.step(t,L.at(t.p,2,0,'07:00:00',{observations:fixes}));
 L.deliver(t,2,R.w2);
 if(target!==null){const p=structuredClone(t.p);for(const s of p.weeks[3].sessions.filter(L.SAT))for(const e of s.prescription.exercises.filter(e=>e.id===RDL&&e.load.mode==='KNOWN'))e.load={...e.load,value:target};delete p.hash;p.hash=L.PG.programHash(p);t.p=p;}
 const row3=L.rowsOf(t,3,L.SAT,[RDL])[0]??null;
 L.deliver(t,3,R.w3,{close:true,extra:cell==='AFTER'?fixes:[]});
 const H=L.history(t,4,0),h=L.hex(H,RDL),st=H.state.strength.exercises[RDL]??null;
 return {record:L.record(t),row3,history:{reader:h&&{mode:h.mode,last:h.lastExecutedLoad,lifted:h.liftedLoad,tick:h.earnedProgress.loadTick},state:st&&{mode:st.mode,load:st.load??null,pending:st.pendingLoad??null,unlogged:!!st.unlogged}},rows4:L.rowsOf(t,4,L.SAT,[RDL])};}
const removeRDL=xs=>xs.filter(e=>e.id!==RDL),lowerRDL=to=>xs=>xs.map(e=>e.id!==RDL?e:{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:to}}))});
{const cases=[];
 for(const [vn,v] of Object.entries(P01V))for(const kg of [18,20,22,24]){const R=p01Reports(v,kg),E=p01('EARLY',R,{fix:removeRDL});
  for(const cell of ['LATE','AFTER']){const X=p01(cell,R,{fix:removeRDL});cases.push({case:`A1 ${vn} ${kg}kg ${cell}`,violation:X.record===E.record&&!eq(X.history,E.history)||X.history.state?.mode==='KNOWN'});}}
 cls('A1 FROM_LOG + KNOWN row planned before a correction',cases);}
{const cases=[],residual=[];
 for(const kg of [20,22,24,26,28]){const R=p01Reports({drop:[RDL]},kg,24),E=p01('EARLY',R,{fix:lowerRDL(20),first:24}),La=p01('LATE',R,{fix:lowerRDL(20),first:24}),Af=p01('AFTER',R,{fix:lowerRDL(20),first:24});
  cases.push({case:`A2 ${kg}kg LATE`,violation:La.record===E.record&&!eq(La.history,E.history)});
  residual.push({kg,afterEqualsEarly:eq(Af.history,E.history),early:E.history.reader,after:Af.history.reader,afterRow:Af.row3,earlyRow:E.row3});}
 cls('A2 known load corrected lower, row ahead planned from the retracted one',cases);
 // The exposure executed BEFORE the correction arrived was judged against the row in force when it was executed (SSCTR D44): recorded.
 out.declared['A2 an exposure executed before its correction arrived (SSCTR D44)']=residual;}
{const cases=[];
 // A3: a late wearable record quarantines week 1's Saturday session (a conflict), reported before (EARLY) or after (LATE) week 2 was planned.
 for(const kg of [19,24]){const run=cell=>{L.resetIds();const t=L.gen({id:'r7ada-a3'});L.weekly(t,0);L.weekly(t,1);const sat1=t.p.weeks[1].sessions.find(L.SAT);
   const wear={eventId:'a3-wear',athleteId:t.p.athleteId,sessionId:sat1.id,observedAt:`${sat1.date}T19:00:00Z`,source:'WEARABLE',actual:{completed:false,minutes:5},response:{...L.OK}};
   if(cell==='EARLY')L.step(t,L.at(t.p,1,6,'22:00:00',{observations:[wear]}));
   const w2=t.p.weeks[2].sessions.filter(L.live).map(s=>L.obs(t.p,s,L.SAT(s)?{kg:kgOf(kg)}:{}));
   if(cell==='LATE')L.step(t,L.at(t.p,2,0,'07:00:00',{observations:[wear]}));
   L.deliver(t,2,w2,{close:true});const h=L.hex(L.history(t,3,0),RDL);return {record:L.record(t),conflicted:t.ledger.some(o=>o.conflicted),h:h&&{mode:h.mode,last:h.lastExecutedLoad}};};
  const E=run('EARLY'),La=run('LATE');cases.push({case:`A3 conflict ${kg}kg`,violation:!E.conflicted||E.record===La.record&&!eq(E.h,La.h)});}
 cls('A3 conflicting late wearable record',cases);}
{const cases=[];
 for(const [vn,v] of Object.entries({firstLog:P01V.noDetails,unreadable:P01V.unknownUnit}))for(const kg of [20,22,26]){const R=p01Reports(v,kg),ref=p01('AFTER',R,{fix:removeRDL,target:20});
  for(const target of [16,24,30]){const X=p01('AFTER',R,{fix:removeRDL,target});cases.push({case:`A4 ${vn} ${kg}kg target ${target}`,violation:X.record===ref.record&&!eq(X.history,ref.history)});}}
 cls('A4 the planned target alone (P1)',cases);}
{const cases=[];
 for(const [vn,v] of [['unknownUnit',P01V.unknownUnit],['repsNoLoad',P01V.repsNoLoad]]){const R=p01Reports(v,22),X=p01('AFTER',R,{fix:removeRDL});
  cases.push({case:`A5 ${vn}`,violation:X.history.reader?.last!=null||X.history.state?.mode==='KNOWN'});}
 cls('A5 unreadable execution is no load',cases);}
{const cases=[];
 // A6: db-rdl established on week 0's Saturday (its only log); a first report of a break starts the day after it, a newer report of the same
 // break starts the day before it. Neither return entry, nor the rows after it, hold db-rdl as KNOWN at a load no fact supports.
 for(const kg of [20,24]){L.resetIds();const t=L.gen({id:'r7ada-a6'});L.weekly(t,0,()=>true,s=>L.SAT(s)?{kg:kgOf(kg)}:{});const sat=t.p.weeks[0].sessions.find(L.SAT).date;
  const end=L.addDays(t.p.weeks[2].startDate,6),first=L.step(t,L.at(t.p,3,0,'06:00:00',L.brk(L.addDays(sat,1),end))),d1=first.proposal?.decisions.at(-1);
  const e1=d1?.interruption?.entry?.strength?.exercises?.[RDL]??null,id=d1?.interruption?.episodeId;
  const second=L.step(t,{...L.at(t.p,3,0,'07:00:00',{kind:'RETURN_AFTER_PAUSE'}),interruption:{...L.brk(L.addDays(sat,-1),end).interruption,...(id?{episodeId:id}:{})}});
  const e2=second.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[RDL]??null,h=L.hex(L.history(t,3,0,'08:00:00'),RDL),rows=L.rowsOf(t,3,()=>true,[RDL]);
  const above=r=>{const m=r.match(/KNOWN([\d.]+)/);return !!m&&+m[1]>kg;};
  cases.push({case:`A6 ${kg}kg: first entry ${e1?.mode}${e1?.load??''}, newer ${second.action} entry ${e2?.mode}${e2?.load??''}, history ${h?.mode} ${h?.lastExecutedLoad??''}, rows ${rows.join(' ')}`,violation:[e1,e2].some(e=>e?.mode==='KNOWN'&&e.load>kg)||rows.some(above)});}
 cls('A6 a newer report of a break moves an establishment inside the pause',cases);}

// ---------- C: coherent decision context ----------
const GOALS=['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT','MAINTAIN'];
{const cases=[];
 for(const g1 of GOALS)for(const g2 of GOALS){if(g1===g2)continue;const cell=withEquip=>{L.resetIds();const t=L.gen({id:`r7ada-c1-${g1}-${g2}`,goal:g1});for(let w=0;w<4;w++)L.weekly(t,w);
  L.step(t,{...L.at(t.p,4,0,'06:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:g2}}});L.weekly(t,4);if(withEquip)L.step(t,L.equip(t.p,5));return {record:L.record(t),rows:L.rowsOf(t,5),run:L.runRows(t,5)};};
  const P=cell(false),Q=cell(true);cases.push({case:`C1 ${g1}->${g2}`,violation:P.record===Q.record&&!eq([P.rows,P.run],[Q.rows,Q.run])});}
 cls('C1 goal change, every ordered pair (P07)',cases);}
{const cases=[];
 for(const [g1,g2] of [['STRENGTH','MAINTAIN'],['HYPERTROPHY','MAINTAIN'],['STRENGTH','HYPERTROPHY'],['GENERAL','STRENGTH']]){const cell=withEquip=>{L.resetIds();const t=L.gen({id:`r7ada-c2-${g1}`,goal:g1});for(let w=0;w<4;w++)L.weekly(t,w);
  L.step(t,{...L.at(t.p,3,6,'22:30:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:g2},from:t.p.weeks[4].startDate}});if(withEquip)L.step(t,L.equip(t.p,4));return {rows:L.rowsOf(t,4),run:L.runRows(t,4)};};
  cases.push({case:`C2 ${g1}->${g2} after the closing review`,violation:!eq(cell(false),cell(true))});}
 cls('C2 goal change stated after the closing review',cases);}
{const cases=[],base=(()=>{L.resetIds();const t=L.start('r7ada-c3',4);L.step(t,{...L.at(t.p,4,0,'06:00:00',{kind:'GOAL_CHANGE'}),changes:{goals:{strength:'HYPERTROPHY'}}});L.weekly(t,4);return t;})();
 const H={equip:p=>L.equip(p,5,0,'06:00:00'),window:p=>({...L.at(p,5,0,'07:00:00',{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...p.canonical.athlete.equipment,'BANDS'],from:L.addDays(p.weeks[5].startDate,1),to:L.addDays(p.weeks[5].startDate,3)}}),schedule:p=>({...L.at(p,5,0,'08:00:00',{kind:'SCHEDULE_CHANGE'}),changes:{runDays:[...p.canonical.schedule.runDays]}}),review:p=>L.at(p,5,0,'09:00:00',{observations:[]})};
 const seq=names=>{const t=L.copy(base);for(const n of names)L.step(t,H[n](t.p));return JSON.stringify({rows:L.rowsOf(t,5),run:L.runRows(t,5),next:L.runCore(t.p.stateTrace[6].run)});};
 const none=seq([]),perms=a=>a.length<=1?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
 for(const p of [...perms(['equip','window','schedule','review']),['equip'],['window'],['schedule'],['review']])cases.push({case:'C3 '+p.join('+'),violation:seq(p)!==none});
 cls('C3 handler order (no-op statements in every order)',cases);}
{const cases=[],declared=[];
 // C4a: a complete week, closed by its review or reported session by session and followed by a no-op decision: the same dose.
 const t0=L.start('r7ada-c4',3);
 {const R=L.copy(t0);L.weekly(R,3);const U=L.copy(t0);L.deliver(U,3,U.p.weeks[3].sessions.filter(L.live).map(s=>L.obs(U.p,s)));L.step(U,L.equip(U.p,4,0,'07:00:00'));
  cases.push({case:'C4a complete week reviewed vs reported + no-op',violation:!eq([L.rowsOf(R,4),L.runRows(R,4)],[L.rowsOf(U,4),L.runRows(U,4)])});}
 // C4b: a week with nothing executed and no review (open). The decisions that re-plan a sport from this week resolve it alike: an equipment
 // statement (strength) and the late closing review. C4c (declared): a decision that re-plans nothing keeps the stored rows.
 for(const [pn,o] of [['EASY',{}],['WALK_JOG',L.WJ]])for(const K of [2,3,5]){
  const base=()=>{L.resetIds();const t=L.gen({id:'r7ada-c4b-'+pn,...o});for(let w=0;w<K;w++)L.weekly(t,w);return t;};
  const D={none:t=>{},equipment:t=>L.step(t,L.equip(t.p,K+1,0,'07:00:00')),schedule:t=>L.step(t,{...L.at(t.p,K+1,0,'07:00:00',{kind:'SCHEDULE_CHANGE'}),changes:{runDays:[...t.p.canonical.schedule.runDays]}}),report:t=>L.step(t,L.at(t.p,K+1,0,'07:00:00',{observations:[]})),closing:t=>L.step(t,L.at(t.p,K,6,'21:00:00',{observations:[]}))};
  const r={};for(const [k,f] of Object.entries(D)){const t=base();f(t);r[k]={strength:L.rowsOf(t,K+1),run:L.runRows(t,K+1),plan:L.runCore(t.p.stateTrace[K+1].run),history:L.runCore(L.history(t,K+1,0,'08:00:00').state.run)};}
  cases.push({case:`C4b ${pn} k=${K} equipment vs closing review (strength)`,violation:!eq(r.equipment.strength,r.closing.strength)});
  cases.push({case:`C4b ${pn} k=${K} closing review: plan not ahead of history`,violation:ahead(r.closing.plan,r.closing.history).length>0});
  declared.push({cell:`${pn} k=${K}`,storedRowsKeptBy:Object.keys(D).filter(k=>k!=='closing'&&eq(r[k].run,r.none.run)),runAsStored:r.none.run,runAsResolved:r.closing.run,strengthKeptBy:Object.keys(D).filter(k=>k!=='closing'&&eq(r[k].strength,r.none.strength)),storedStartAheadOfHistory:ahead(r.none.plan,r.none.history)});}
 cls('C4 review closure',cases);
 out.declared['C4c standing projection: a week no review closed, then a decision that re-plans nothing (boundary E1/E3)']=declared;}
{const cases=[];
 const cell=(days,missed,withEquip)=>{L.resetIds();const t=L.start('r7ada-c5',2),s0=t.p.weeks[2].startDate,end=L.addDays(s0,days-1),rep=L.addDays(end,1),W=t.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=L.addDays(x.startDate,6));
  L.step(t,L.at(t.p,W,Math.round((Date.parse(rep)-Date.parse(t.p.weeks[W].startDate))/864e5),'06:00:00',L.brk(s0,end)));
  L.step(t,L.at(t.p,W,6,'21:00:00',{observations:t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.date>=rep&&!(missed&&s.sport==='RUN'&&s.role==='LONG')).map(s=>L.obs(t.p,s))}));
  if(withEquip)L.step(t,L.equip(t.p,W+1));return {rows:L.rowsOf(t,W+1),run:L.runRows(t,W+1)};};
 for(const days of [16,17,18,30,31,32])for(const missed of [false,true])cases.push({case:`C5 ${days}d ${missed?'long missed':'executed'}`,violation:!eq(cell(days,missed,false),cell(days,missed,true))});
 cls('C5 a return\'s own week closed, then a no-op decision',cases);}

// ---------- D: evidence-based progression authority ----------
{const cases=[];const PROF={EASY:{},WALK_JOG:L.WJ};
 for(const [pn,o] of Object.entries(PROF))for(let k=1;k<=11;k++){const cell=c=>{L.resetIds();const t=L.gen({id:'r7ada-d1-'+pn,...o});for(let w=0;w<k;w++)L.weekly(t,w);if(c==='R')L.weekly(t,k,()=>false);L.weekly(t,k+1,()=>false);
   if(k+2>=t.p.weeks.length)return null;return {plan:L.runCore(t.p.stateTrace[k+2].run),history:L.runCore(L.history(t,k+2,0).state.run),rows:L.runRows(t,k+2)};};
  const U=cell('U'),R=cell('R');if(!U)continue;const au=ahead(U.plan,U.history),ar=ahead(R.plan,R.history),rd=eq(U.history,R.history)&&!eq(U.rows,R.rows);
  cases.push({case:`D1 ${pn} k=${k}${au.length?' U ahead '+au:''}${ar.length?' R ahead '+ar:''}${rd?' rows differ':''}`,violation:au.length>0||ar.length>0||rd});}
 // The reviewer's NOLONG shape (P02b): week k executed but its long run (each session reported the day it ran, the week left open in U and
 // closed by its review in R), week k+1 nothing. Full histories compared: the rows must agree when they agree, and no plan is ahead of history.
 for(const [pn,o] of Object.entries(PROF))for(let k=1;k<=11;k++){const cell=c=>{L.resetIds();const t=L.gen({id:'r7ada-d1n-'+pn,...o});for(let w=0;w<k;w++)L.weekly(t,w);const keep=s=>!(s.sport==='RUN'&&s.role==='LONG');
   if(c==='R')L.weekly(t,k,keep);else for(const s of t.p.weeks[k].sessions.filter(s=>L.live(s)&&keep(s)&&s.day<6))L.step(t,L.at(t.p,k,s.day,'21:30:00',{observations:[L.obs(t.p,s)]}));
   L.weekly(t,k+1,()=>false);if(k+2>=t.p.weeks.length)return null;return {record:L.record(t),plan:L.runCore(t.p.stateTrace[k+2].run),history:L.runCore(L.history(t,k+2,0).state.run),rows:L.runRows(t,k+2)};};
  const U=cell('U'),R=cell('R');if(!U)continue;const au=ahead(U.plan,U.history),ar=ahead(R.plan,R.history),same=U.record===R.record&&eq(U.history,R.history),rd=same&&!eq(U.rows,R.rows);
  cases.push({case:`D1 NOLONG ${pn} k=${k}${U.record===R.record?'':' (records differ)'}${eq(U.history,R.history)?'':' (histories differ: '+Object.keys(U.history).filter(x=>!eq(U.history[x],R.history[x])).join(',')+')'}${au.length?' U ahead '+au:''}${ar.length?' R ahead '+ar:''}${rd?' rows differ':''}`,violation:au.length>0||ar.length>0||rd});}
 cls('D1 two unexecuted weeks: threshold, quality, strides, ladder, continuous running',cases);}
{const cases=[];
 for(const k of [4,5,8,9]){L.resetIds();const t=L.start('r7ada-d2',k),earned=L.history(t,k,0).state.run.long;
  for(const w of [k,k+1])for(const s of t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.role!=='LONG'))L.step(t,L.at(t.p,w,s.day,'21:30:00',{observations:[L.obs(t.p,s)]}));
  L.weekly(t,k+1,()=>false,{},'22:00:00');
  cases.push({case:`D2 long runs of weeks ${k},${k+1} missed`,violation:t.p.stateTrace[k+2].run.long>earned||L.history(t,k+2,0).state.run.long>earned});}
 cls('D2 missed long runs with the projection ahead',cases);}
{const cases=[];const dose=st=>st.mode==='RETURN'?'R'+st.returnStep:st.mode==='RESTART'?'S'+st.restart:st.mode;
 for(const [name,days] of [['MODERATE',17],['LONG',31],['MODERATE_MON',14],['LONG_MON',28]]){
  L.resetIds();const t0=L.start('r7ada-d3',2),s0=t0.p.weeks[2].startDate,end=L.addDays(s0,days-1),rep=L.addDays(end,1),W=t0.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=L.addDays(x.startDate,6)),rd=Math.round((Date.parse(rep)-Date.parse(t0.p.weeks[W].startDate))/864e5);
  L.step(t0,L.at(t0.p,W,rd,'06:00:00',L.brk(s0,end)));
  const runs=t0.p.weeks[W].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.date>=rep),entry=dose(t0.p.stateTrace[W].run),last=runs.at(-1)?.date;
  // Each run of the return week missed in turn (the long, a quality or an easy run), all executed, none executed.
  for(const miss of [null,...runs.map(s=>s.id),'ALL']){const t=L.copy(t0);
   const keep=s=>s.date>=rep&&!(miss==='ALL'&&s.sport==='RUN')&&!(miss&&miss!=='ALL'&&s.id===miss);
   // P5: the evening before the week's last run is due, history holds the entry, whatever ran before it.
   const before=t.p.weeks[W].sessions.filter(s=>L.live(s)&&keep(s)&&s.date<last);
   if(before.length)L.step(t,L.at(t.p,W,Math.round((Date.parse(last)-Date.parse(t.p.weeks[W].startDate))/864e5)-1,'21:00:00',{observations:before.map(s=>L.obs(t.p,s))}));
   const early=runs.length>1?dose(L.historyAt(t,`${L.addDays(last,-1)}T22:00:00Z`).state.run):entry;
   L.step(t,L.at(t.p,W,6,'21:30:00',{observations:t.p.weeks[W].sessions.filter(s=>L.live(s)&&keep(s)&&s.date>=last).map(s=>L.obs(t.p,s))}));
   const next=dose(t.p.stateTrace[W+1].run),h=dose(L.history(t,W+1,0).state.run),role=miss&&miss!=='ALL'?runs.find(s=>s.id===miss).role:miss;
   cases.push({case:`D3 ${name} missed ${role??'none'}: entry ${entry} before the last run ${early} history ${h} plan ${next}`,violation:early!==entry||(miss!==null&&(h!==entry||next!==entry))});}
  // A second re-entry week whose last run (the long run in RETURN; restart runs all carry the easy role) is missed holds the dose: it never
  // completes the return to the prior long run.
  {const t=L.copy(t0);L.step(t,L.at(t.p,W,6,'21:30:00',{observations:t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.date>=rep).map(s=>L.obs(t.p,s))}));
   const s1=dose(t.p.stateTrace[W+1].run),lastRun=t.p.weeks[W+1].sessions.filter(s=>L.live(s)&&s.sport==='RUN').at(-1);
   L.weekly(t,W+1,s=>s.id!==lastRun.id);const s2=dose(t.p.stateTrace[W+2].run),h2=dose(L.history(t,W+2,0).state.run);
   cases.push({case:`D3 ${name} second re-entry week, its ${lastRun.role} run missed: after week 1 ${s1}, after week 2 plan ${s2} history ${h2}`,violation:s2!==s1||h2!==s1});}}
 cls('D3 HOLD + RETURN: each run of the return week missed, a run not yet due, a second return week',cases);}

// ---------- E: the walk/jog return ceiling ----------
{const cases=[];const T={CONS:{first:2,held:4,second:5},DEV:{first:1,held:3,second:4}};
 for(const [tl,X] of Object.entries(T))for(const variant of ['ALL','ONE_MISSED','NONE'])for(const second of ['SHORT','MODERATE']){
  L.resetIds();const g=L.R.generateProgram(structuredClone({...L.PROFILES,...L.EDGE_PROFILES}.WALK_JOG_FIVE_DAYS),L.opts),t={p:g.program,ledger:[]};
  for(let w=0;w<X.first;w++)L.weekly(t,w);const b1=L.addDays(t.p.weeks[X.first].startDate,1);L.weekly(t,X.first,s=>s.date<b1,{},'06:30:00');
  const rd=L.addDays(t.p.weeks[X.first+1].startDate,3);L.step(t,L.at(t.p,X.first+1,3,'07:00:00',L.brk(b1,L.addDays(rd,-1))));L.weekly(t,X.first+1,s=>s.date>=rd);
  for(let w=X.first+2;w<X.held;w++)L.weekly(t,w);const firstWJ=t.p.weeks[X.held].sessions.filter(x=>L.live(x)&&L.isWJ(x))[0]?.id;
  L.weekly(t,X.held,{ALL:()=>true,ONE_MISSED:s=>s.id!==firstWJ,NONE:s=>!L.isWJ(s)}[variant]);
  const W=X.second,b2=L.addDays(t.p.weeks[W].startDate,1);L.weekly(t,W,s=>s.date<b2,{},'06:30:00');
  if(second==='SHORT')L.step(t,L.at(t.p,W,6,'07:00:00',L.brk(b2,L.addDays(t.p.weeks[W].startDate,5))));else L.step(t,L.at(t.p,W+1,6,'07:00:00',L.brk(b2,L.addDays(b2,11))));
  const ran=t.p.weeks.flatMap(w=>w.sessions.filter(s=>L.live(s)&&L.isWJ(s)&&t.ledger.some(o=>o.sessionId===s.id&&!o.superseded))).sort((a,b)=>a.date<b.date?-1:1),last=ran.at(-1).progression.value,allowed=second==='SHORT'?last:Math.max(0,last-1);
  const back=L.wjSteps(t,second==='SHORT'?W+1:W+2);cases.push({case:`E1 ${tl}/${variant}/${second}: back ${back} allowed ${allowed}`,violation:!back.length||back.some(x=>x>allowed)});}
 cls('E1 SSCTR walk/jog cells (HOLD, consolidation, repeated pause)',cases);}
{const cases=[];
 for(const ranWeeks of [2,3,4,5])for(const kind of ['SHORT','MODERATE'])for(const sameWeek of [false,true]){L.resetIds();const t=L.gen({id:'r7ada-e2',...L.WJ});for(let w=0;w<ranWeeks;w++)L.weekly(t,w);
  L.weekly(t,ranWeeks,s=>!L.isWJ(s));
  const d0=t.p.weeks[ranWeeks+1].startDate,end=L.addDays(d0,kind==='SHORT'?(sameWeek?3:5):14),rep=L.addDays(end,1),W=t.p.weeks.findIndex(x=>rep>=x.startDate&&rep<=L.addDays(x.startDate,6));
  const r=L.step(t,L.at(t.p,W,Math.round((Date.parse(rep)-Date.parse(t.p.weeks[W].startDate))/864e5),'07:00:00',L.brk(L.addDays(d0,1),end))),d=r.proposal?.decisions.at(-1);
  const ran=t.p.weeks.flatMap(w=>w.sessions.filter(s=>L.live(s)&&L.isWJ(s)&&t.ledger.some(o=>o.sessionId===s.id&&!o.superseded))).sort((a,b)=>a.date<b.date?-1:1),last=ran.at(-1)?.progression?.value??0;
  // The return: its entry and the walk/jog sessions of its week from the report day on (sessions before it are the plan the break replaced).
  const allowed=kind==='SHORT'?last:Math.max(0,last-1),entry=d?.interruption?.entry?.run?.walkStep,back=d?[...new Set(t.p.weeks[d.fromWeek].sessions.filter(s=>L.live(s)&&L.isWJ(s)&&s.date>=rep).map(s=>s.progression?.value))]:[];
  cases.push({case:`E2 ran ${ranWeeks} weeks, next step never run, ${kind}${sameWeek?' (reported the same week)':''}: last ${last} entry ${entry} back ${back} allowed ${allowed}`,violation:!(entry<=allowed)||back.some(x=>x>allowed)});}
 cls('E2 a step earned and never run, then a pause',cases);}

out.total={cases:Object.values(out.classes).reduce((n,c)=>n+c.cases,0),violations:Object.values(out.classes).reduce((n,c)=>n+c.violations,0)};
console.log(JSON.stringify(out,null,1));
