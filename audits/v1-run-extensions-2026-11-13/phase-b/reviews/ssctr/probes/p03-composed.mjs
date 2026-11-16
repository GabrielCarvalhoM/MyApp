// SSCTR-RFC review r1, probe 03: the composed entry point (v1-run-forecast-index.mjs) on my own synthetic athletes. The client mechanics
// (timeline/report/asPrescribed) are the candidate's test helpers; the scenarios and the expected values are mine, from the decision.
import fs from 'node:fs';
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
const H=await import('file:///'+ROOT+'test/v1rfc-helpers.mjs');
const RWS=await import('file:///'+ROOT+'test/v1rws-helpers.mjs');
const M=await import('file:///'+ROOT+'src/v1-race-forecast.mjs');
const {P,F,DEV,timeline,racePlan,runner,result,report,asPrescribed,addDays,ELIG,START,live,FV,RC}=H;
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m);}};
const note=(...a)=>console.log('  ·',...a);
const RFC=['runForecast','paceInsights','paceRevision','paceRevisionRecord'],rest=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!RFC.includes(k)));
const hashOf=x=>H.hash(x);
// ---------- S1: default authority, no record file ----------
{
 const exists=fs.existsSync(new URL(M.FORECAST_RECORDS_URL));ok(!exists,'S1 records file absent');
 const g=P.generateProgram(racePlan({}),RWS.DEV);
 ok(g.runForecast.status==='DISABLED'&&g.paceInsights.status==='DISABLED'&&g.paceRevision.status==='DISABLED','S1 default all DISABLED: '+[g.runForecast.status,g.paceInsights.status,g.paceRevision.status]);
 ok(hashOf(rest(g))===hashOf(F.generateProgram(racePlan({}),RWS.DEV)),'S1 default answer is the run formats answer');
 const a=M.runForecastAuthority();ok(Object.keys(a.approved).length===0,'S1 no boundary approved by default');
}
// ---------- S2: my adherence journey (10K, 16 weeks), long run not reported in weeks 2 and 4 ----------
const weekWith=(t,w,drop=()=>false,how=s=>asPrescribed(t,s),extra={})=>t.step(w,6,'WEEKLY_REVIEW',{...extra,observations:t.p.weeks[w].sessions.filter(live).filter(s=>!(s.sport==='RUN'&&drop(s))).map(s=>{const o=s.sport==='RUN'?how(s):{};return o?.eventId?o:report(t.p,s,o??{});})});
{
 const t=timeline(racePlan({goalMinutes:48}),{opts:DEV});
 const expectedA=[];
 for(let w=0;w<4;w++){
  const drop=s=>s.role==='LONG'&&(w===1||w===3);
  const runs=t.p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&(s.status!=='SKIPPED'||!s.movedTo)&&s.optional!==true);
  const planned=runs.reduce((n,s)=>n+s.prescription.durationMinutes,0),credited=runs.filter(s=>live(s)&&!drop(s)).reduce((n,s)=>n+s.prescription.durationMinutes,0);
  expectedA.push(credited/planned);weekWith(t,w,drop);
 }
 const r=t.look(4),f=r.runForecast;
 note('S2 my expected a per week',expectedA.map(x=>x.toFixed(4)).join(' '),'| entry',f.adherence.weeks.map(k=>k.a?.toFixed(4)).join(' '));
 ok(expectedA.every((a,i)=>Math.abs(a-f.adherence.weeks[i].a)<1e-9),'S2 weekly adherence equals my own count');
 // my own forecast from those a, the current estimate as V1RC computes it from a 10K 50:00 (HIGH, m .025), reference 2027-01-01
 const fOf=a=>a<0.5?0:a>=0.9?1:(a-0.5)/0.4,G=0.05,gam=H_=>G*(1-Math.exp(-H_/10));
 const Hnow=expectedA.reduce((s,a)=>s+fOf(a),0),mean=expectedA.reduce((s,a)=>s+a,0)/4,future=10,Rhi=Math.min(1,0.5+1.2816*0.3);
 const range=fut=>{const g=gam(Hnow+future*fut)-0;return [Math.floor(2925*Math.exp(-Rhi*g)/15+1e-9)*15,Math.round(3000*Math.exp(-0.5*g)/15)*15,Math.ceil(3075/15-1e-9)*15];};
 const myObs=range(fOf(mean)),myPlan=range(1);
 note('S2 status',f.status,f.display,'obs',f.observedForecast.forecastSeconds,'mine',myObs,'plan',f.planScenario.forecastSeconds,'mine',myPlan);
 ok(JSON.stringify(f.observedForecast.forecastSeconds)===JSON.stringify(myObs),'S2 observed forecast equals my computation');
 ok(JSON.stringify(f.planScenario.forecastSeconds)===JSON.stringify(myPlan),'S2 plan scenario equals my computation');
 ok(fOf(mean)<1?f.display==='BOTH_RANGES'&&f.shown[0]==='OBSERVED_FORECAST':true,'S2 observed first when both');
 ok(f.planScenario.highSeconds===f.current.highSeconds&&f.observedForecast.highSeconds===f.current.highSeconds,'S2 slow edge = current estimate');
 ok(r.runCalibration.goal&&f.observedForecast.goalRelation?.styling==='NEUTRAL','S2 goal relation neutral beside its range');
 // copy: no forbidden words in any statement
 const texts=JSON.stringify([f.observedForecast.statement,f.planScenario.statement,f.basis.statement,f.observedForecast.goalRelation?.statement,f.planScenario.goalRelation?.statement]).toLowerCase();
  ok(texts.split('probability').length-1===texts.split('not a probability').length-1,'S2 probability only as the decided "not a probability"');
 for(const w of ['you will run','predicted time','on track','achievable','likely','chance','confidence interval','%'])ok(!texts.includes(w),'S2 copy free of "'+w+'"');
 note('S2 texts',f.observedForecast.statement,'||',f.planScenario.statement,'||',f.basis.statement);
 globalThis.S2=t;
}
// ---------- S3: fast easy runs at an easy effort change nothing the forecast or the insights say ----------
{
 const mk=fast=>{const t=timeline(racePlan({id:'rf-ez'}),{opts:DEV});for(let w=0;w<4;w++)weekWith(t,w,()=>false,s=>s.role==='EASY'&&fast?{pace:255,rpe:3}:asPrescribed(t,s));return t.look(4);};
 const ctl=mk(false),fast=mk(true);
 ok(JSON.stringify(ctl.runForecast.observedForecast.forecastSeconds)===JSON.stringify(fast.runForecast.observedForecast.forecastSeconds),'S3 forecast unchanged by fast easy runs');
 ok(JSON.stringify(ctl.runForecast.current)===JSON.stringify(fast.runForecast.current),'S3 current estimate unchanged by fast easy runs');
 const states=r=>Object.fromEntries(Object.entries(r.paceInsights.domains).map(([d,x])=>[d,x.state]));
 ok(JSON.stringify(states(ctl))===JSON.stringify(states(fast)),'S3 insights unchanged '+JSON.stringify(states(fast)));
 note('S3 easy band ctl/fast',JSON.stringify(ctl.runCalibration.paceBands?.EASY??null),JSON.stringify(fast.runCalibration.paceBands?.EASY??null));
}
// ---------- S4: declared break of 14 days, and of 8 days ----------
for(const days of [14,8]){
 const t=timeline(racePlan({id:'rf-br'+days}),{opts:DEV});for(let w=0;w<4;w++)weekWith(t,w);
 const from=t.day(4,0),to=addDays(from,days-1);
 const r1=t.step(4,1,'WEEKLY_REVIEW',{interruption:{startDate:from,endDate:to,days,reasonCategory:'TRAVEL'}},'09:00');
 const looks=[];for(let w=4;w<=7;w++){looks.push(t.look(w));}
 note('S4 break',days,'d: in-week',r1.status,r1.runForecast.status,r1.runForecast.reason,'| looks',looks.map((x,i)=>`w${i+5}:${x.status}/${x.runForecast.status}/${x.runForecast.reason??''}/mode=${x.program?.stateTrace?.[i+4]?.run?.mode??x.proposal?.stateTrace?.[i+4]?.run?.mode??'?'}`).join(' '));
 if(days>=14)ok([r1,...looks.slice(0,2)].every(x=>x.runForecast.status!=='SHOWN'),'S4 a declared break of 14 days withdraws the forecast at once and after (SSCTR-RFC-A-01: fails on 400edb7, the in-week answer stays SHOWN)');
}
// ---------- S5: a clinical sign: hold; forecast and insights withdrawn ----------
{
 const t=timeline(racePlan({id:'rf-pain'}),{opts:DEV});for(let w=0;w<3;w++)weekWith(t,w);
 const r=t.step(3,1,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(3,1),{pain:true})},'09:00');
 note('S5 pain',r.status,r.runForecast.status,r.runForecast.reason,r.paceInsights.status,r.paceInsights.reason);
 ok(r.runForecast.status!=='SHOWN'&&!r.runForecast.observedForecast?.lowSeconds,'S5 no forecast under a clinical route');
 ok(r.paceInsights.status!=='ACTIVE','S5 no insights under a clinical route');
}
// ---------- S6: unknown experience reads EXPERIENCED (smallest ceiling) ----------
{
 const known=timeline(racePlan({id:'rf-xk',experience:'NOVICE'}),{opts:DEV}),unk=timeline(racePlan({id:'rf-xu',x:{athlete:{runExperience:undefined}}}),{opts:DEV});
 for(const t of [known,unk])for(let w=0;w<2;w++)weekWith(t,w);
 const a=known.look(2).runForecast,b=unk.look(2).runForecast;
 note('S6 known',a.experience,a.experienceSource,'| unknown',b.experience,b.experienceSource,b.status);
 ok(b.experience==='EXPERIENCED'&&/UNKNOWN/.test(b.experienceSource),'S6 unknown experience is EXPERIENCED');
 ok(a.experience==='NOVICE','S6 a stated NOVICE is NOVICE');
}
// ---------- S7: marathon: current estimate only, never a range kind ----------
{
 const intake=runner({id:'rf-mar',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:addDays(START,111),timeGoalMinutes:225}},anchors:[result('HALF_MARATHON',6600,'2026-12-20')],recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210}});
 const t=timeline(intake,{opts:DEV});const looks=[t.look(0)];for(let w=0;w<3;w++){weekWith(t,w);looks.push(t.look(w+1));}
 for(const r of looks){const f=r.runForecast;ok(f.observedForecast===null&&f.planScenario===null&&(f.shown??[]).length===0,'S7 marathon has no range kind ('+f.status+' '+f.reason+')');if(f.marathon)ok(f.marathon.labelledForecast===false&&f.marathon.goalRelation==='NOT_APPLICABLE_V1RC_GOAL_COMPARISON_ONLY','S7 marathon labels');}
 note('S7 marathon',looks.map(r=>r.runForecast.status+'/'+(r.runForecast.marathon?.statement??r.runForecast.reason)).join(' | '));
 const est=looks[1].runCalibration.estimates.MARATHON;if(looks[1].runForecast.marathon?.lowSeconds)ok(looks[1].runForecast.marathon.lowSeconds===est.lowSeconds&&looks[1].runForecast.marathon.highSeconds===est.highSeconds,'S7 marathon = V1RC estimate');
}
// ---------- S8: threshold sessions in the heat, on a treadmill, declared: no vote; adherence credited whole ----------
{
 const intake=runner({id:'rf-thr2',asOf:'2027-01-02',start:START,weeks:16,runExperience:'INTERMEDIATE',goal:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays(START,16*7-1)}},anchors:[result('10K',3000,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:70,longRunMinutes:120,longRunDay:6}});
 const run=(actual)=>{const t=timeline(intake,{opts:DEV});for(let w=0;w<7;w++)weekWith(t,w,()=>false,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:280,actual}:asPrescribed(t,s));return {t,r:t.look(7)};};
 const base=run({measurement:'TRACK'}),heat=run({measurement:'TRACK',conditions:['HEAT']}),mill=run({measurement:'TREADMILL'});
 const thr=x=>x.r.paceInsights.domains.THRESHOLD_CONTROLLED;
 note('S8 families of quality',base.t.p.weeks.slice(0,7).map(w=>w.sessions.filter(s=>s.role==='QUALITY').map(s=>s.prescription.family).join('+')).join(' '));
 note('S8 threshold base',thr(base).state,thr(base).votes,thr(base).action,'| heat',thr(heat).state,thr(heat).votes,JSON.stringify(thr(heat).excluded.map(x=>x.reason)),'| mill',thr(mill).state,thr(mill).votes);
 ok(thr(heat).votes===0&&thr(mill).votes===0,'S8 heat and treadmill never vote');
 const credits=x=>x.r.runForecast.adherence.weeks.flatMap(k=>k.credits??[]).filter(c=>x.t.p.weeks.flatMap(w=>w.sessions).find(s=>s.id===c.sessionId)?.role==='QUALITY').map(c=>c.c);
 ok(credits(heat).every(c=>c===1)&&credits(mill).every(c=>c===1),'S8 completed heat/treadmill sessions are adherence 1: '+credits(heat));
 // observational: with insights on, every key the run formats return is theirs
 const viaF=(()=>{const t=timeline(intake,{opts:RWS.DEV,entry:F});for(let w=0;w<7;w++)weekWith(t,w,()=>false,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:280,actual:{measurement:'TRACK'}}:asPrescribed(t,s));return t.look(7);})();
 ok(hashOf(rest(base.r))===hashOf(viaF),'S8 insights on: run-format keys unchanged');
 ok(base.r.paceRevision.status==='INERT'&&JSON.stringify(base.r.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED)===JSON.stringify(base.r.runCalibration.paceBands.THRESHOLD_CONTROLLED),'S8 revision INERT, band = V1RC');
 ok(base.r.runCalibration.hash===viaF.runCalibration.hash,'S8 calibration identical');
 globalThis.S8=base;
}
// ---------- S9: B-1, a single pre-plan result: when does the forecast go, and from what state ----------
for(const event of ['10K','HALF_MARATHON']){
 const t=timeline(racePlan({id:'rf-age'+event,event}),{opts:DEV});const row=[];
 for(let w=0;w<15;w++){const r=t.look(w);const f=r.runForecast,e=r.runCalibration.estimates?.[event];row.push(`w${w+1}:${f.status==='SHOWN'?'S':f.status==='TOO_UNCERTAIN_TO_SHOW'?'T':f.status}(${e?.confidence??'-'}${e?.margin!=null?' '+e.margin:''})`);if(w<14)weekWith(t,w);
  if(f.status==='SHOWN'&&e&&e.confidence==='LOW')note('S9 SHOWN on a LOW estimate',event,'week',w+1,JSON.stringify(f.observedForecast?.forecastSeconds??f.planScenario?.forecastSeconds));
  if(f.status==='SHOWN')ok(f.confidence==='LOW','S9 shown with gain is LOW confidence');}
 note('S9',event,row.join(' '));
}
console.log(`p03: ${checks-fails}/${checks} checks hold`);
