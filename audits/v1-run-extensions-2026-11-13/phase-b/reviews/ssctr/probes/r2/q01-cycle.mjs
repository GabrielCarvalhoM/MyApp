// SSCTR-RFC recheck r2, probe q01, on 0d3015b: my own scenarios for each changed reading (A-01 edges, A-02 hold, a pair, b delivered band,
// c rows outside their week, d in-week change). Client mechanics from the test helpers; scenarios and expectations mine, from the decision.
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
const H=await import('file:///'+ROOT+'test/v1rfc-helpers.mjs');
const {READINESS_SIGNS}=await import('file:///'+ROOT+'src/v1-f08.mjs');
const {DEV,timeline,racePlan,runner,result,report,asPrescribed,addDays,ELIG,START,live,flatSteps}=H;
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m);}};const note=(...a)=>console.log('  ·',...a);
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const half=(id,anchors=[result('10K',2880,'2027-01-01')])=>runner({id,asOf:'2027-01-02',start:START,weeks:16,runExperience:'INTERMEDIATE',goal:{kind:'RACE',event:{kind:'10K',date:addDays(START,16*7-1)}},anchors,recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:70,longRunMinutes:120,longRunDay:6}});
const run=(t,w,x={})=>t.week(w,s=>plain(t,s),x);
const said=r=>[r.runForecast.status,r.runForecast.reason??null,r.paceInsights.status,r.paceInsights.reason??null].join('/');

// ---- A-01 edges: a 14-day break declared on the Monday it starts; 15 days declared in progress mid-week; a break that ended yesterday ----
{
 const t=timeline(half('q-b1'),{opts:DEV});for(let w=0;w<5;w++)run(t,w);
 const d=t.step(5,0,'WEEKLY_REVIEW',{interruption:{startDate:t.day(5,0),endDate:t.day(6,6),days:14,reasonCategory:'WORK'}},'12:00');
 const thu=t.look(5,3),mon=t.look(6),wed=t.look(6,2),after=t.look(7,0);note('A-01 14 days from today:',d.status,said(d),'| Thu',said(thu),'| next Mon',said(mon),'| next Wed',said(wed),'| day after the end',said(after));
 ok(d.runForecast.status==='UNAVAILABLE'&&d.paceInsights.status==='UNAVAILABLE','A-01 withdrawn in the declaring answer');
 ok([thu,mon,wed].every(x=>x.runForecast.reason==='DECLARED_BREAK_OF_14_DAYS_OR_MORE'&&x.paceInsights.reason==='DECLARED_BREAK_OF_14_DAYS_OR_MORE'),'A-01 withdrawn on later days of the break');
 ok(!('observedForecast' in d.runForecast)||d.runForecast.observedForecast==null,'A-01 no number while withdrawn');
 const u=timeline(half('q-b2'),{opts:DEV});for(let w=0;w<5;w++)run(u,w);
 const e=u.step(5,3,'WEEKLY_REVIEW',{interruption:{startDate:u.day(5,1),endDate:u.day(7,1),days:15,reasonCategory:'WORK'}},'12:00');
 note('A-01 15 days in progress, declared Thursday:',e.status,said(e));ok(e.runForecast.status==='UNAVAILABLE','A-01 15 days in progress withdrawn');
 const f=timeline(half('q-b3'),{opts:DEV});for(let w=0;w<3;w++)run(f,w);
 const g=f.step(3,1,'WEEKLY_REVIEW',{interruption:{startDate:f.day(4,0),endDate:f.day(5,6),days:14,reasonCategory:'WORK'}},'12:00');
 note('A-01 break starting next week:',g.status,said(g),'| facts on record:',f.ledger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length);
}
// ---- A-02: clinical hold on Wednesday of week 5, every session of weeks 5 and 6 reported complete, readiness on Wednesday of week 6 ----
{
 const ready={declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}};
 const mk=hold=>{const t=timeline(half('q-h'+(hold?1:0)),{opts:DEV});for(let w=0;w<4;w++)run(t,w);
  if(hold)t.step(4,2,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,2),{pain:true})});
  run(t,4);if(hold)t.step(5,2,'READINESS_DECLARATION',{readiness:ready});for(let w=5;w<11;w++)run(t,w,w===9?{runEvidence:[result('10K',2850,t.day(9,6),{id:'post'})]}:{});return t;};
 const h=mk(true),c=mk(false),fh=h.look(11).runForecast,fc=c.look(11).runForecast;
 note('A-02 hold facts',h.ledger.filter(o=>o.fact==='CLINICAL_HOLD').length,h.ledger.filter(o=>o.fact==='READINESS_DECLARED').length,'| weeks counted (hold):',fh.adherence?.weeks.map(k=>k.week+':'+(k.counted?'c':'-')+':'+(k.a==null?'n':k.a.toFixed(2))).join(' '));
 note('A-02 control counted:',fc.adherence?.weeks.map(k=>k.week+':'+(k.counted?'c':'-')).join(' '),'| status hold/control',fh.status,fc.status,'| g obs',fh.decomposition?.g?.observedForecast,fc.decomposition?.g?.observedForecast);
 const wk=new Map((fh.adherence?.weeks??[]).map(k=>[k.week,k]));
 ok(wk.get(4)&&wk.get(4).counted===false,'A-02 the week the hold opened in is not counted');
 ok(wk.get(4)&&wk.get(4).credits.every(x=>x.rule==='COMPLETED'),'A-02 reported sessions still read (but the week earns nothing)');
 ok(wk.get(5)&&wk.get(5).counted===false,'A-02 the week readiness was declared in is not counted');
 // With a reference measured AFTER the hold, the zero-credit weeks leave the athlete lower on the saturating curve, so the remaining weeks
 // earn a little more (a property of the decided model, recorded as SSCTR-RFC-B-01). With the reference BEFORE the hold, the hold never adds gain.
 note('A-02 reference after the hold: g hold',fh.decomposition?.g?.observedForecast,'control',fc.decomposition?.g?.observedForecast,'| seconds',JSON.stringify(fh.observedForecast?.forecastSeconds),JSON.stringify(fc.observedForecast?.forecastSeconds));
 const mk2=hold=>{const t=timeline(half('q-h2'+(hold?1:0)),{opts:DEV});for(let w=0;w<4;w++)run(t,w);if(hold)t.step(4,2,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,2),{pain:true})});run(t,4);if(hold)t.step(5,2,'READINESS_DECLARATION',{readiness:ready});for(let w=5;w<8;w++)run(t,w);return t.look(8).runForecast;};
 const gh=mk2(true),gc=mk2(false);
 note('A-02 reference before the hold: g hold',gh.decomposition?.g?.observedForecast,gh.status,gh.reason,'control',gc.decomposition?.g?.observedForecast,gc.status);
 ok(gh.status==='UNAVAILABLE'||gh.decomposition&&gc.decomposition&&!(gh.decomposition.g.observedForecast>gc.decomposition.g.observedForecast+1e-12),'A-02 with the reference before the hold, the hold never adds gain');
}
// ---- (a) the pair: my numbers; earlier 10K official vs GPS, later 10K official 1.5% faster at week 8; and a slower one ----
{
 const go=(first,second)=>{const t=timeline(half('q-p',[first]),{opts:DEV});for(let w=0;w<8;w++)run(t,w,w===7?{runEvidence:[second]}:{});return t.look(8).runForecast;};
 const off=go(result('10K',2880,'2027-01-01'),result('10K',2820,'2027-02-28',{id:'b'})),gps=go(result('10K',2880,'2027-01-01',{measurement:'GPS'}),result('10K',2820,'2027-02-28',{id:'b'}));
 const slowGps=go(result('10K',2880,'2027-01-01',{measurement:'GPS'}),result('10K',2980,'2027-02-28',{id:'b'})),slowOff=go(result('10K',2880,'2027-01-01'),result('10K',2930,'2027-02-28',{id:'b'}));
 note('pair official:',off.response?.source,off.response?.R_c?.toFixed(4),JSON.stringify(off.observedForecast?.forecastSeconds),'| GPS:',gps.response?.source,gps.response?.R_c,JSON.stringify(gps.observedForecast?.forecastSeconds),gps.response?.notes);
 note('slower GPS earlier (3.5%):',slowGps.flags,slowGps.decomposition?.g?.planScenario,'| slower official (1.7%):',slowOff.response?.source,slowOff.response?.R_c?.toFixed(4),JSON.stringify(slowOff.observedForecast?.forecastSeconds));
 ok(off.response?.source==='PRIOR_UPDATED_BY_ONE_PAIR','pair official used');ok(gps.response?.source==='PRIOR'&&gps.response?.pair===null,'pair GPS earlier: prior');
 ok(slowGps.flags?.includes('NO_GAIN_LATEST_RESULT_SLOWER')&&slowGps.decomposition.g.planScenario===0,'GPS earlier still serves the slowdown rule');
 // what the stricter rule costs: the same slower-but-under-3% case with the earlier result by GPS (prior, R_c 0.5) against by an official course
 const slowGps2=go(result('10K',2880,'2027-01-01',{measurement:'GPS'}),result('10K',2930,'2027-02-28',{id:'b'}));
 note('slower 1.7% GPS earlier:',slowGps2.response?.source,JSON.stringify(slowGps2.observedForecast?.forecastSeconds),'vs official earlier',JSON.stringify(slowOff.observedForecast?.forecastSeconds));
}
// ---- (b) the delivered band: every voting threshold session is read against the work pace of the format it was delivered with ----
{
 const t=timeline(half('q-d'),{opts:DEV}),fmt={};
 for(let w=0;w<8;w++){const look=t.look(w);for(const s of t.p.weeks[w].sessions.filter(x=>x.sport==='RUN'&&x.role==='QUALITY')){const rs=look.runSessions?.[s.id];const p=rs?flatSteps(rs.blocks).find(x=>x.kind==='WORK')?.intensity?.pace:null;if(p)fmt[s.id]=[p.fastSecondsPerKm,p.slowSecondsPerKm];}
  t.week(w,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:268,actual:{measurement:'TRACK'}}:asPrescribed(t,s));}
 const ins=t.look(8).paceInsights.domains.THRESHOLD_CONTROLLED;
 note('(b) threshold',ins.state,ins.votes,'| bands read',ins.sessions.map(s=>s.sessionId+':'+s.band.fastSecondsPerKm+'-'+s.band.slowSecondsPerKm).join(' '),'| delivered',JSON.stringify(fmt));
 ok(ins.sessions.length>0&&ins.sessions.every(s=>fmt[s.sessionId]&&s.band.fastSecondsPerKm===fmt[s.sessionId][0]&&s.band.slowSecondsPerKm===fmt[s.sessionId][1]),'(b) each session read against the band it was delivered with');
}
// ---- (c) a session run in the following week under its own id; (d) a second source mid-week for an earlier session ----
{
 const t=timeline(half('q-l'),{opts:DEV});for(let w=0;w<3;w++)run(t,w);
 const long=t.runsOf(3,s=>s.role==='LONG')[0];
 t.step(3,6,'WEEKLY_REVIEW',{observations:t.p.weeks[3].sessions.filter(live).filter(s=>s.id!==long.id).map(s=>plain(t,s))});
 const late={...plain(t,long),eventId:'late-'+long.id,occurrenceDate:t.day(4,0)};
 t.step(4,1,'WEEKLY_REVIEW',{observations:[late]},'09:00');t.week(4,s=>plain(t,s));
 const f=t.look(5).runForecast,c=f.adherence?.weeks.find(k=>k.week===3)?.credits.find(x=>x.sessionId===long.id);
 note('(c) long run of week 4 run on Monday of week 5:',JSON.stringify(c),'| row in ledger:',!!t.row(long.id),t.row(long.id)?.localDate);
 ok(c&&c.rule==='MISSING_REPORT'&&c.c===0,'(c) a session run outside its own week is not credited');
 // (d)
 const u=timeline(half('q-s'),{opts:DEV});for(let w=0;w<5;w++)run(u,w);
 const mon=u.look(5),easy=u.runsOf(3,s=>s.role!=='QUALITY')[0];
 const dev={eventId:'dev2-'+easy.id,athleteId:u.p.athleteId,sessionId:easy.id,occurrenceDate:easy.date,canonicalActivityId:'hk3-'+easy.id,source:{provider:'HEALTHKIT',activityId:'hk3-'+easy.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:easy.prescription.durationMinutes},response:UNKNOWN};
 const wed=u.step(5,2,'WEEKLY_REVIEW',{observations:[dev]},'08:00'),fri=u.look(5,4);
 note('(d) Monday',mon.runForecast.status,'| Wednesday after a second source for a week-4 session',said(wed),'| Friday',said(fri));
 ok(mon.runForecast.status==='SHOWN'&&wed.runForecast.status==='UNAVAILABLE'&&fri.runForecast.reason==='REPORTS_CHANGED_SINCE_THE_WEEK_STARTED','(d) the week is withdrawn, never another number');
 u.week(5,s=>plain(u,s));const nxt=u.look(6);note('(d) next Monday',said(nxt),JSON.stringify(nxt.runForecast.observedForecast?.forecastSeconds));
 ok(['SHOWN','TOO_UNCERTAIN_TO_SHOW'].includes(nxt.runForecast.status),'(d) read again from the next boundary');
}
console.log(`q01: ${checks-fails}/${checks} checks hold`);
