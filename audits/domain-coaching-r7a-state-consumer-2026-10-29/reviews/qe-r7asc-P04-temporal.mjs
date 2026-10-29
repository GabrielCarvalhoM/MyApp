// P04 (reviewer-owned, Property D): evidence affects history only after it exists.
// (1) Thursday return, Friday session. Weeks 0-1 trained and reviewed; an interruption from week 2's Monday to week 4's Wednesday (class by its
//     length: SHORT, MODERATE, LONG variants) is reported on Thursday 06:00 of week 4; re-entry starts this week. Cells: EXEC (Friday's sessions
//     executed at their time, reported Friday 21:00) and NONE (not executed). HistoricalState must be identical at every cut up to the Friday
//     execution and may differ only after it. Cuts: Thu 07:00, Thu 22:00, Fri 12:00, Fri 18:59, Fri 19:01, Fri 22:00, Sun 22:00, next Mon 06:00.
// (2) Truncation metamorphic test (an independent C16): on each final timeline, at a grid of cuts (every day 06:00 and 22:00 local), history read
//     on the whole record must equal history read on only the rows executed before the cut (no corrections in these timelines, so the record is
//     append-only facts). A difference means a row executed at or after the cut moved history at the cut.
// (3) The same truncation test with a negative time zone (-180) and a session executed 22:30 local on the week's last day.
import * as L from './qe-r7asc-lib.mjs';
const out={probe:'qe-r7asc-P04-temporal',root:L.ROOT_USED};
const OP=L.opts.authority.policy.operational.return;
const H=(t,asOf,ledger=t.ledger)=>L.A.historicalStateOf(t.p,{asOf,actualLedger:ledger},L.opts);
const sig=h=>h?L.V.hash({strength:h.strength,run:h.run,state:h.state}):null;
const brief=h=>h?{run:{mode:h.state.run.mode,returnStep:h.state.run.returnStep??null,restart:h.state.run.restart??null},strength:Object.fromEntries(Object.entries(h.state.strength.exercises).map(([id,e])=>[id,`${e.mode}${e.load??''} rs${e.returnStep??'-'} sets${e.sets??'-'} cap${e.setCap??'-'} lp${e.lastPerformed??'-'}`]))}:null;
// Schedule: run days Tue/Thu/Sun (1,3,6), strength Wed/Sat PM (2,5). The interruption starts on week 2's Monday and ends on a Wednesday
// (days = 3, 17, 31: SHORT, MODERATE, LONG by the policy); it is reported on the Thursday after at 06:00. The "later planned session" is that
// week's Saturday strength session (19:00 local), with Thursday's run (08:00) executed in both cells.
function timeline(variant,cell,tz=null){
 L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-p04-'+variant,...(tz===null?{}:{tz})}),L.opts),t={p:g.program,ledger:[]};
 L.weekly(t,0);L.weekly(t,1);
 const days={SHORT:3,MODERATE:17,LONG:31}[variant],start=t.p.weeks[2].startDate,end=L.addDays(start,days-1),report=L.addDays(end,1);
 const W=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=L.addDays(x.startDate,6)),rd=Math.round((Date.parse(report)-Date.parse(t.p.weeks[W].startDate))/864e5);
 const r=L.step(t,L.at(t.p,W,rd,'06:00:00',L.brk(start,end)),{allow:true});
 const d=t.p.decisions.at(-1);
 const thu=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.day===3);if(thu.length)L.step(t,L.at(t.p,W,3,'12:00:00',{observations:thu.map(s=>L.obs(t.p,s))}));
 const sat=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.day===5);
 if(cell==='EXEC'&&sat.length)L.step(t,L.at(t.p,W,5,'21:00:00',{observations:sat.map(s=>L.obs(t.p,s))}));
 // Sunday and the next week executed and reviewed in both cells, so later cuts see a shared future.
 const sun=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.day===6);L.step(t,L.at(t.p,W,6,'21:00:00',{observations:sun.map(s=>L.obs(t.p,s))}));
 if(W+1<t.p.weeks.length)L.weekly(t,W+1);
 return {t,W,d,r:{status:r.status,action:r.action},later:sat.map(s=>`${s.sport}:${s.templateType??s.role}:${s.prescription.exercises?.map(e=>e.exposure?.kind).join('/')}`),days,cls:d.interruption?.class,fromWeek:d.fromWeek,policy:{shortMaxDays:OP.shortMaxDays,moderateMaxDays:OP.moderateMaxDays}};
}
out.thursdayLaterSession={};
for(const variant of ['SHORT','MODERATE','LONG']){
 const X=timeline(variant,'EXEC'),N=timeline(variant,'NONE'),W=X.W,day=(d,h)=>`${L.addDays(X.t.p.weeks[W].startDate,d)}T${h}Z`;
 const cuts={thu0700:day(3,'07:00:00'),thu2200:day(3,'22:00:00'),fri1200:day(4,'12:00:00'),sat1859:day(5,'18:59:00'),sat1901:day(5,'19:01:00'),sat2200:day(5,'22:00:00'),sun2200:day(6,'22:00:00'),nextMon:`${X.t.p.weeks[W+1]?.startDate}T06:00:00Z`};
 const rows=Object.fromEntries(Object.entries(cuts).map(([k,c])=>{const a=H(X.t,c),b=H(N.t,c);return [k,{equal:sig(a)===sig(b),EXEC:brief(a),NONE:brief(b)}];}));
 const laterExecAt=X.t.ledger.filter(o=>X.t.p.weeks[W].sessions.some(s=>s.id===o.sessionId&&s.day===5)).map(o=>o.observedAt);
 out.thursdayLaterSession[variant]={returnDecision:X.r,class:X.cls,days:X.days,policy:X.policy,reportWeek:W,fromWeek:X.fromWeek,laterSession:X.later,laterExecutedAt:laterExecAt,
  equalUpToExecution:['thu0700','thu2200','fri1200','sat1859'].every(k=>rows[k].equal),firstDifferingCut:Object.keys(rows).find(k=>!rows[k].equal)??null,cuts:rows};
}
// (2)+(3) truncation metamorphic test
function grid(t){const out=[];for(const w of t.p.weeks.slice(0,Math.min(t.p.weeks.length,8)))for(let d=0;d<7;d++){const day=L.addDays(w.startDate,d),tz=t.p.timezoneOffsetMinutes??0;for(const hh of ['06:00','22:00']){out.push(new Date(Date.parse(`${day}T${hh}:00Z`)-tz*60000).toISOString());}}return out;}
function truncation(name,t){const cuts=grid(t),bad=[];for(const c of cuts){const full=H(t,c),tr=H(t,c,t.ledger.filter(o=>Date.parse(o.observedAt)<Date.parse(c)));if(sig(full)!==sig(tr))bad.push({cut:c,full:brief(full),truncated:brief(tr)});}return {timeline:name,cuts:cuts.length,violations:bad.length,examples:bad.slice(0,3)};}
const tl=[];
for(const variant of ['SHORT','MODERATE','LONG'])for(const cell of ['EXEC','NONE'])tl.push(truncation(variant+'-'+cell,timeline(variant,cell).t));
{L.resetIds();const t=L.start('qe-p04-plain',6);tl.push(truncation('plain-6-weeks',t));}
// (3) tz -180: week 2's Sunday session executed 22:30 local (01:30 UTC next day), every week reviewed Monday 06:00 local.
{L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-p04-tz',tz:-180}),L.opts),t={p:g.program,ledger:[]};
 for(let w=0;w<5;w++){const obs=t.p.weeks[w].sessions.filter(L.live).map(s=>{const o=L.obs(t.p,s);if(s.day===6)o.observedAt=new Date(Date.parse(`${s.date}T22:30:00Z`)+180*60000).toISOString();else o.observedAt=new Date(Date.parse(o.observedAt)+180*60000).toISOString();return o;});
  L.step(t,{...L.at(t.p,w+1<t.p.weeks.length?w+1:w,0,'09:00:00',{observations:obs})});}
 tl.push(truncation('tz-180-late-sunday',t));}
out.truncation=tl;
out.truncationViolations=tl.reduce((n,x)=>n+x.violations,0);
console.log(JSON.stringify(out,null,1));
