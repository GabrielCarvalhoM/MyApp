// DOMAIN_COACHING_R7-B, the one bounded fix cycle after the independent reviews of R7B-RUNTIME-REPERTOIRE-FREEZE-1 (Engineering QE-R7B-01…11,
// Quality Q-R7B-01, -02, -05). Each test reproduces the judge's probe on public entry points and checks the plan, not only the decision record.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {program,reviewed,weekly,review,evaluateProgram,generateProgram,intake,opts,FULL,live,obs,runs,gen} from '../r7/b/fixtures/helpers.mjs';
import {repertoireAuthority,allowsCandidate,configurationOf,SKILL_LADDERS} from '../src/r7b-repertoire.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';

const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
const ids=(p,w,pred=()=>true)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(pred).map(e=>e.id));
const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
const quality=(p,w)=>runs(p,w).filter(s=>['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'].includes(s.prescription.family)).map(s=>s.id);
const at=(t,w,x={})=>evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger},opts);
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const weekObs=(t,w,pred=()=>true)=>t.p.weeks[w].sessions.filter(s=>live(s)&&pred(s)).map(s=>obs(t.p,s));
const obsFor=(t,w,pred)=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s)));
const RECORDS=JSON.parse(fs.readFileSync(new URL('../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',import.meta.url),'utf8'));

test('QE-R7B-01: a reason-based substitution plans exactly the configuration the decision selects, never the next ladder step',()=>{
 const o={id:'fx-sub-db',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12};
 const t=reviewed(o,3);
 for(const [id,pattern,extra,expected] of [['db-rdl','HINGE',{},'kb-deadlift'],['dead-bug','TRUNK',{},'bird-dog'],['db-rdl','HINGE',{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:'kb-deadlift'},'kb-deadlift']]){
  const r=at(t,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason:'SKILL_MISMATCH',...extra}});
  assert.equal(r.status,'MODIFY',`${id}: ${r.reason}`);assert.equal(r.substitutions[0].selected,expected,id);
  for(let w=4;w<=8;w++){const got=ids(r.proposal,w,e=>e.pattern===pattern);assert.ok(got.includes(expected),`${id} week ${w}: ${got}`);assert.ok(!got.includes(id),`${id} came back in week ${w}`);}
 }
 // The grid of the engineering probe: every applied substitution of every exercise in use, both reasons.
 let applied=0;
 for(const g of [{id:'fx-sub-full',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},{id:'fx-sub-kb',equipment:['KETTLEBELL','BANDS'],goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},rotation:'FIXED',weeks:12},{id:'fx-sub-bw',equipment:[],goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},rotation:'FIXED',weeks:12,strengthExperience:'NOVICE'},o]){
  const tg=reviewed(g,3);
  for(const id of [...new Set(ids(tg.p,4,e=>e.role!=='PRACTICE'))])for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
   const r=at(tg,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
   if(r.status!=='MODIFY')continue;applied++;
   const sel=r.substitutions[0].selected,pattern=configurationOf(id).pattern;
   for(const s of tg.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===id))){
    const now=r.proposal.weeks[4].sessions.find(x=>x.id===s.id),got=(now?.prescription?.exercises??[]).filter(e=>e.pattern===pattern).map(e=>e.id);
    assert.ok(got.includes(sel),`${g.id} ${id} ${reason}: decision ${sel}, week 4 ${s.templateType} plans ${got}`);
   }
   for(let w=4;w<12;w++)assert.ok(!ids(r.proposal,w).includes(id),`${g.id} ${id} ${reason}: set aside, back in week ${w}`);
  }
 }
 assert.ok(applied>=40,`applied substitutions ${applied}`);
});

test('QE-R7B-01: a substitution follows its configuration into templates a later context change creates',()=>{
 // The decision names the slots of the templates that existed; after a change to four days the new templates' slot that would pick the
 // set-aside configuration takes the decided one, never another pick.
 const t=reviewed({id:'fx-sub-ctx',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},3);
 const s=apply(t,at(t,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-rdl',reason:'SKILL_MISMATCH'}}));
 assert.equal(s.status,'MODIFY',s.reason);const sel=s.substitutions[0].selected;
 // The change comes the same morning, before the new exercise is ever executed (so it is not yet established and the selection order alone
 // would not keep it).
 const before=types(t.p,4),r=apply(t,at(t,3,{day:1,hour:'08:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,1,3,4]}}));
 assert.equal(r.status,'MODIFY',r.reason);assert.notEqual(types(t.p,4),before,'new template types');
 // Every hinge main row of the new weeks is the decided configuration: never the set-aside one, never the next rung of its ladder.
 for(let w=4;w<8;w++){const mains=ids(t.p,w,e=>e.pattern==='HINGE'&&e.role==='MAIN');assert.ok(mains.length&&mains.every(id=>id===sel),`week ${w}: hinge mains ${mains} (decision ${sel})`);assert.ok(!ids(t.p,w).some(id=>['db-rdl','single-leg-rdl-db','barbell-rdl'].includes(id)),`week ${w}: ${ids(t.p,w)}`);}
});

test('Q-R7B-01 / QE-R7B-02: an accepted ladder step holds from the week it starts; the calendar never puts a lower rung back',()=>{
 const CASES=[
  {from:'band-assisted-pull-up',to:'pull-up',o:{equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
  {from:'db-overhead-press',to:'barbell-overhead-press',o:{equipment:['DUMBBELLS','BARBELL','RACK'],goals:{run:'PERFORMANCE',strength:'STRENGTH'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
  {from:'reverse-lunge',to:'reverse-lunge-db',o:{equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{strengthDays:[0,2,4]}},only:['EVERY_2_WEEKS']}];
 let accepted=0;
 for(const c of CASES)for(const rotation of c.only??['COACH_DECIDES','EVERY_6_WEEKS','EVERY_2_WEEKS']){
  const t={p:program({id:`fx-lad-${c.to}-${rotation}`,weeks:16,rotation,...c.o}),ledger:[]};let f=null;
  for(let w=0;w<16;w++){
   const plain=at(t,w,{observations:weekObs(t,w)});
   if(f===null&&(plain.offers??[]).some(x=>x.type==='LADDER_STEP'&&x.from===c.from&&x.to===c.to)){const r=at(t,w,{observations:weekObs(t,w),choices:[{type:'LADDER_STEP',from:c.from,to:c.to}]});assert.equal(r.status,'MODIFY',r.reason);apply(t,r);f=w+1;continue;}
   apply(t,plain);
  }
  if(f===null)continue;accepted++;
  const lower=new Set(SKILL_LADDERS.flatMap(ch=>{const i=ch.indexOf(c.to);return i>0?ch.slice(0,i):[];}));
  assert.ok(ids(t.p,f).includes(c.to),`${c.to} ${rotation}: not planned in its first week ${f}: ${ids(t.p,f)}`);
  for(let w=f;w<16;w++){const back=ids(t.p,w).filter(id=>lower.has(id)&&configurationOf(id).pattern===configurationOf(c.to).pattern);assert.deepEqual(back,[],`${c.to} ${rotation}: week ${w} plans a lower rung ${back}`);}
 }
 assert.ok(accepted>=4,`accepted steps ${accepted}`);
});

const NOV={id:'fx-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
test('QE-R7B-03: a decision plans the novice density from evidence, as the evidence reducer and the weekly review do',()=>{
 // A3: the boundary week's strength reports corrected to adverse after the release.
 const t={p:program(NOV),ledger:[]};for(let w=0;w<5;w++)weekly(t,w);
 assert.equal(t.p.stateTrace[5].strength.density?.capped,false);
 const fixes=obsFor(t,4,s=>s.sport==='STRENGTH').map(o=>correctionOf(o,structuredClone(o.actual),`${t.p.weeks[5].startDate}T05:00:00Z`,BAD));
 const r=at(t,5,{day:0,hour:'06:00:00',observations:fixes}),P2=r.proposal??t.p;
 const h=historicalStateOf(P2,{asOf:`${t.p.weeks[5].startDate}T06:00:00Z`,actualLedger:r.actualLedger??t.ledger},opts);
 assert.match(types(P2,5),/CORE/);assert.equal(P2.stateTrace[5].strength.density?.capped,h.state.strength.density?.capped);
 // A3b: week 4 strength not executed and not reviewed; decisions on week 5 day 0 plan as the weekly review of the same facts does.
 const base=()=>{const x={p:program({...NOV,id:'fx-novice-b'}),ledger:[]};for(let w=0;w<4;w++)weekly(x,w);return x;};
 const t2=base(),runObs=weekObs(t2,4,s=>s.sport==='RUN');
 const control=at(t2,4,{observations:runObs});const cp=control.proposal??t2.p;
 for(const x of [{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:55}},{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:ids(t2.p,5).find(id=>id!=='dead-bug'),reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}},{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BANDS']}}]){
  const d=at(t2,5,{day:0,hour:'06:00:00',observations:runObs,...x}),P=d.proposal??t2.p;
  const hh=historicalStateOf(P,{asOf:`${t2.p.weeks[5].startDate}T06:00:00Z`,actualLedger:d.actualLedger??t2.ledger},opts);
  // A schedule change starts next week by design (this week's sessions stay where they are); the first week each decision plans is judged.
  const k=x.kind==='SCHEDULE_CHANGE'?6:5;assert.match(types(P,k),/CORE/,`${x.kind}: week ${k} ${types(P,k)} (control ${types(cp,k)})`);
  assert.equal(P.stateTrace[k].strength.density?.capped,true,x.kind);assert.equal(hh.state.strength.density?.capped,true,x.kind);
 }
});

const GRAD={id:'fx-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
test('QE-R7B-04: graduation is withdrawn when a correction disqualifies a qualifying week; the same facts at the boundary never graduate',()=>{
 for(const [label,change,response] of [['adverse',a=>a,BAD],['10 minutes',a=>({...a,minutes:10}),null]]){
  const t=reviewed({...GRAD,id:'fx-grad-'+label.replace(/ /g,'')},3);const g=weekly(t,3);
  assert.equal(g.action,'RUN_QUALITY_GRADUATION',label);assert.ok(quality(t.p,4).length,label);
  const long=obsFor(t,3,s=>s.role==='LONG')[0],fix=correctionOf(long,change(structuredClone(long.actual)),`${t.p.weeks[4].startDate}T05:00:00Z`,response);
  const r=apply(t,at(t,4,{day:0,hour:'06:00:00',observations:[fix]}));
  assert.ok(r.proposal,`${label}: ${r.status} ${r.reason}`);
  assert.equal(t.p.canonical.athlete.runGraduation,undefined,label);
  assert.equal(t.p.canonical.athlete.runGraduationWithdrawn?.length,1,label);
  assert.ok((r.disclosures??[]).some(d=>d.id==='RUN_QUALITY_GRADUATION_WITHDRAWN'),label);
  for(let w=4;w<16;w++)if(w<8)assert.deepEqual(quality(t.p,w),[],`${label}: quality in week ${w}`);
  // The introduction week is then executed and reviewed on the corrected record: nothing brings the threshold back.
  weekly(t,4);for(const w of [5,6])assert.deepEqual(quality(t.p,w),[],`${label}: quality in week ${w} after the week-4 review`);
  const h=historicalStateOf(t.p,{asOf:`${t.p.weeks[5].startDate}T06:00:00Z`,actualLedger:t.ledger},opts);
  assert.equal(h.state.run.qualityRunner,false,label);
 }
 // Control: the same facts at the boundary review give no graduation.
 const c=reviewed({...GRAD,id:'fx-grad-ctl'},3);
 const ctl=at(c,3,{observations:c.p.weeks[3].sessions.filter(live).map(s=>obs(c.p,s,s.role==='LONG'?{minutes:10}:{}))});
 assert.notEqual(ctl.action,'RUN_QUALITY_GRADUATION');
 // A graduation whose evidence stands is kept by a later correction of an unrelated report.
 const k=reviewed({...GRAD,id:'fx-grad-keep'},3);weekly(k,3);
 const easy=obsFor(k,1,s=>s.role==='EASY')[0],keep=at(k,4,{day:0,hour:'06:00:00',observations:[correctionOf(easy,{...structuredClone(easy.actual)},`${k.p.weeks[4].startDate}T05:00:00Z`)]});
 assert.ok(((keep.proposal??k.p).canonical.athlete.runGraduation),'unrelated correction keeps the graduation');
});

test('QE-R7B-05: the novice density cap starts when a strength-NONE athlete moves above two days before the first block boundary',()=>{
 const t={p:program({...NOV,id:'fx-novice-2d',schedule:{strengthDays:[0,4]}}),ledger:[]};weekly(t,0);
 const r=at(t,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}});
 assert.equal(r.status,'MODIFY',r.reason);
 for(const w of [2,3,4])assert.match(types(r.proposal,w),/CORE/,`week ${w}: ${types(r.proposal,w)}`);
 assert.equal(r.proposal.stateTrace[2].strength.density?.capped,true);
 // After the first block boundary there is no cap to start.
 const late={p:program({...NOV,id:'fx-novice-2d-late',schedule:{strengthDays:[0,4]}}),ledger:[]};for(let w=0;w<6;w++)weekly(late,w);
 const r2=at(late,6,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}});
 assert.equal(r2.status,'MODIFY',r2.reason);assert.doesNotMatch(types(r2.proposal,7),/CORE/);
});

const LAD={id:'fx-ladder',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16};
test('QE-R7B-06: two changes of one exercise at one boundary are asked in every order; nothing is recorded from an unapplied step',()=>{
 const t=reviewed(LAD,4),ob=weekObs(t,4),choose=choices=>at(t,4,{observations:ob,choices});
 const L={type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'},M={type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION',purpose:'EQUIPMENT'},M2={type:'MAIN_CHANGE',from:'goblet-squat',to:'kb-goblet-squat',reason:'ATHLETE_PREFERENCE'};
 for(const pair of [[L,M],[M,L],[M,M2],[M2,M],[L,L]]){const r=choose(pair);assert.equal(r.status,'ASK',JSON.stringify(pair.map(x=>x.type+':'+x.to)));assert.equal(r.proposal,null);}
 // Each change alone is applied.
 assert.equal(choose([M]).status,'MODIFY');
});

test('Q-R7B-02: the trace promises graduation only to the classes that have it; an unknown running start is told it has no harder session',()=>{
 const unknown=program({id:'fx-unknown',goals:{run:'RACE',strength:'NONE'},recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null},event:{kind:'10K',date:'2027-02-14'},schedule:{strengthDays:[]},weeks:16});
 assert.equal(unknown.coldStart.run.class,'EASY_UNKNOWN');
 const q=unknown.feasibility.reductions.find(x=>x.id==='QUALITY_AFTER_EVIDENCE');
 assert.ok(q&&q.path==='NONE_IN_V1'&&!/graduation/i.test(q.detail),JSON.stringify(q));
 const low=program({id:'fx-low',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[]},weeks:12});
 const ql=low.feasibility.reductions.find(x=>x.id==='QUALITY_AFTER_EVIDENCE');
 assert.ok(ql&&ql.path==='GRADUATION_AT_BLOCK_REVIEW'&&/graduation/i.test(ql.detail),JSON.stringify(ql));
});

test('QE-R7B-07: a configuration set aside for SKILL_MISMATCH is never offered again, nor accepted as a step or a MAIN change',()=>{
 const t=reviewed({...LAD,id:'fx-aside'},4);
 apply(t,at(t,4,{observations:weekObs(t,4),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}));
 weekly(t,5);
 const sub=apply(t,at(t,6,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'back-squat',reason:'SKILL_MISMATCH'}}));
 assert.equal(sub.status,'MODIFY',sub.reason);for(let w=6;w<8;w++)weekly(t,w);
 const ob=weekObs(t,8),offer=at(t,8,{observations:ob});
 assert.ok(!(offer.offers??[]).some(o=>o.to==='back-squat'),'re-offered');
 for(const ch of [{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'},{type:'MAIN_CHANGE',from:'goblet-squat',to:'back-squat',reason:'ATHLETE_PREFERENCE'}])assert.equal(at(t,8,{observations:ob,choices:[ch]}).status,'ASK',ch.type);
});

test('QE-R7B-08: block choices that cannot be applied in this review, and an unknown substitution target, are asked, never dropped',()=>{
 const t=reviewed({...LAD,id:'fx-choices'},4);
 const mid=at(t,4,{day:2,hour:'06:00:00',observations:[],choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]});
 const missed=t.p.weeks[4].sessions.find(s=>live(s)&&s.sport==='RUN');
 const other=at(t,4,{kind:'MISSED_SESSION',targetSessionId:missed.id,observations:t.p.weeks[4].sessions.filter(s=>live(s)&&s.id!==missed.id).map(s=>obs(t.p,s)),choices:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'ATHLETE_PREFERENCE'}]});
 const bogus=at(t,4,{observations:weekObs(t,4),choices:[{type:'LADDER_JUMP',from:'goblet-squat',to:'front-squat'}]});
 const notList=at(t,4,{observations:weekObs(t,4),choices:{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}});
 for(const [k,r] of Object.entries({mid,other,bogus,notList}))assert.ok(['ASK','HOLD'].includes(r.status),`${k}: ${r.status} ${r.reason}`);
 const unknownTo=at(t,4,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:'no-such-exercise'}});
 assert.equal(unknownTo.status,'ASK',unknownTo.reason);
});

test('QE-R7B-09 / QE-R7B-10: the review-by date reads the instant, not its written offset; a rejecting record turns its candidate off',()=>{
 const a=repertoireAuthority({asOf:'2027-04-30T21:00:00Z'}),b=repertoireAuthority({asOf:'2027-05-01T02:00:00+05:00'});
 assert.equal(a.valid,b.valid);assert.deepEqual(Object.keys(a.approved),Object.keys(b.approved));
 const c01=RECORDS.find(r=>r.review_id==='R7B0-SSCTR-B0-C01');
 const withReject=repertoireAuthority({asOf:'2026-11-01',repertoireRecords:[...RECORDS,{...c01,disposition:'REJECT'}]});
 assert.equal(withReject.valid,true);assert.equal(allowsCandidate(withReject,'B0-C01'),false);
});

test('QE-R7B-11: the 5K fallback follows the planner authority, not the default records',()=>{
 const input=intake({id:'fx-5k',goals:{run:'RACE',strength:'NONE'},event:{kind:'5K',date:'2027-01-24'},schedule:{strengthDays:[]},weeks:12});
 assert.ok(generateProgram(input,opts).program,'with B0-C10 the 5K gets the performance fallback');
 const off=repertoireAuthority({asOf:'2026-11-01',repertoireRecords:RECORDS.filter(r=>r.review_id!=='R7B0-SSCTR-B0-C10')});
 const g=generateProgram(input,{...opts,authority:{...opts.authority,repertoire:off}});
 // Without B0-C10 the frozen R6 behaviour stands: a 5K is not a supported event (no fallback is applied).
 assert.equal(g.program,null);assert.equal(g.status,'INVALID_INPUT',g.reason);
});

test('Q-R7B-05: a configuration is used at most once per session (first-week novice TPL.CORE practice included)',()=>{
 for(const days of [[0,2,4],[0,2,4,5],[0,1,2,4,5]]){
  const p=program({...NOV,id:'fx-once-'+days.length,schedule:{strengthDays:days}});
  for(const w of p.weeks)for(const s of w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH')){const list=s.prescription.exercises.map(e=>e.id);assert.equal(new Set(list).size,list.length,`${s.id}: ${list}`);}
 }
});

test('Q-R7B-07: equipment disclosures name the real limit and offer only equipment that would add the pattern',()=>{
 // A pull-up bar and no band, novice: pull-ups need practice first; a band would add a loaded row.
 const bar=program({id:'fx-q7-bar',strengthExperience:'NOVICE',equipment:['PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'}});
 const d=bar.negotiation.find(n=>n.id==='PULL_LIMITED_FOR_EQUIPMENT');
 assert.ok(d&&d.limit==='SKILL'&&/more practice/.test(d.detail)&&d.options.includes('Add a band')&&!d.options.some(o=>/bar/.test(o)),JSON.stringify(d));
 // Bodyweight only: no pattern is offered "a band or bar", and a pattern limited by skill is never offered equipment.
 for(const days of [[0,2,4],[0,2,4,5]])for(const strengthExperience of ['NONE','NOVICE']){
  const bw=program({id:`fx-q7-bw-${days.length}-${strengthExperience}`,strengthExperience,equipment:[],goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{strengthDays:days}});
  for(const m of bw.negotiation.filter(n=>n.id==='MOVEMENT_PATTERN_UNAVAILABLE')){
   assert.ok(!m.options.some(o=>/band or bar/.test(o)),JSON.stringify(m.options));
   for(const [p,l] of Object.entries(m.limits))if(l==='SKILL')assert.ok(!m.options.some(o=>o.startsWith('Add')&&o.includes(p)),JSON.stringify(m));
  }
 }
});

// ---------- SSCTR R7B-SSCTR-r1 findings F1–F5 (the same fix cycle) ----------
const TASK={category:'VO2_STYLE',current:true,familiar:true,tolerated:true,observedAt:'2026-10-28',prescription:{modality:'RUN',family:'VO2_STYLE_INTERVALS',durationMinutes:40,warmupMinutes:12,cooldownMinutes:8,work:{repetitions:4,workMinutes:3,recoveryMinutes:2}},target:{method:'PACE',construct:'FIELD_SESSION_TARGET',paceSecondsPerKm:255,provenance:'Athlete report of the last three track sessions'},history:{sameTaskExposures:6,response:'TOLERATED'},conditions:{comparable:true}};
const BOUTS={id:'fx-bouts',goals:{run:'PERFORMANCE',strength:'NONE'},recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70},knownRuns:[TASK],schedule:{strengthDays:[],runDays:[1,3,5,6]},weeks:12};
const boutsSessions=p=>p.weeks.flatMap(w=>runs(p,w.index)).filter(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS');
const daysBetween=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const addDaysIso=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);

test('SSCTR R7B-F1 (DECL-04 revised): after a restart a graduated athlete waits the established easy weeks, like EASY_CURRENT',()=>{
 const scenario=base=>{
  const t=reviewed(base,0);for(let w=0;w<6;w++)weekly(t,w);
  const start=t.p.weeks[6].startDate,end=addDaysIso(start,29);let w=6;
  while(addDaysIso(t.p.weeks[w].startDate,6)<=end&&w<t.p.weeks.length-1){weekly(t,w,{keep:()=>false});w++;}
  const day=Math.max(0,Math.min(6,daysBetween(t.p.weeks[w].startDate,addDaysIso(end,1))));
  const r=at(t,w,{day,kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:end,reasonCategory:'TRAVEL',nonclinical:true}});
  assert.ok(r.proposal,r.reason);
  const P=r.proposal,asOfDay=addDaysIso(t.p.weeks[w].startDate,day);
  const firstEasy=P.weeks.findIndex((x,k)=>k>=w&&P.stateTrace[k]?.run?.mode==='EASY');
  const firstQ=P.weeks.findIndex((x,k)=>k>=w&&runs(P,k).some(s=>s.role==='QUALITY'&&s.date>asOfDay));
  return {graduated:!!t.p.canonical.athlete.runGraduation,firstEasy,firstQ};
 };
 const g=scenario({...GRAD,id:'fx-f1-grad'}),c=scenario({id:'fx-f1-curr',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:90,longestRunMinutes:40},schedule:{strengthDays:[],runMinutes:45},weeks:16});
 assert.ok(g.graduated,'graduated before the break');assert.ok(g.firstEasy>=0&&c.firstEasy>=0,JSON.stringify({g,c}));
 assert.ok(g.firstQ<0||g.firstQ-g.firstEasy>=2,'graduated: '+JSON.stringify(g));
 assert.ok(c.firstQ<0||c.firstQ-c.firstEasy>=2,'comparator: '+JSON.stringify(c));
 assert.equal(g.firstQ-g.firstEasy,c.firstQ-c.firstEasy,JSON.stringify({g,c}));
});

test('SSCTR R7B-F2: familiar bouts only while the task is current (at most 28 days since its last performance)',()=>{
 for(const observedAt of ['2026-10-28','2026-10-15','2026-10-05']){
  const p=program({...BOUTS,id:'fx-bouts-'+observedAt,knownRuns:[{...TASK,observedAt}]});
  let last=observedAt;for(const s of boutsSessions(p)){assert.ok(daysBetween(last,s.date)<=28,`${observedAt}: ${s.date} is ${daysBetween(last,s.date)} days after ${last}`);last=s.date;}
  if(observedAt==='2026-10-28')assert.ok(boutsSessions(p).length>0,'a current task is used');
 }
 for(const ev of [{kind:'10K',date:'2027-01-24'},{kind:'HALF_MARATHON',date:'2027-01-24'}]){
  const p=program({...BOUTS,id:'fx-bouts-'+ev.kind,goals:{run:'RACE',strength:'NONE'},event:ev,weeks:16});
  let last=TASK.observedAt;for(const s of boutsSessions(p)){assert.ok(daysBetween(last,s.date)<=28,`${ev.kind}: ${s.date} is ${daysBetween(last,s.date)} days after ${last}`);last=s.date;}
 }
});

test('SSCTR R7B-F5: when the familiar bouts give way to the threshold ladder, the session says it is a different stimulus',()=>{
 const i=reviewed({...BOUTS,id:'fx-bouts-break'},3);
 const ret=at(i,4,{day:3,kind:'RETURN_AFTER_PAUSE',interruption:{days:4,reasonCategory:'TRAVEL',nonclinical:true}});
 assert.ok(ret.proposal,ret.reason);
 const q=[5,6,7,8,9].flatMap(w=>runs(ret.proposal,w).filter(s=>s.role==='QUALITY'));
 assert.ok(q.length,'a quality session follows the break');
 for(const s of q)assert.ok(s.prescription.family!=='FAMILIAR_REPEATED_BOUTS'&&s.replaces==='FAMILIAR_REPEATED_BOUTS'&&/different, lower stimulus/.test(s.explanation??''),JSON.stringify([s.prescription.family,s.explanation]));
 // A task last done on the intake day stays current through week 3, so both adverse sessions are the bouts themselves.
 const t=reviewed({...BOUTS,id:'fx-bouts-adverse',knownRuns:[{...TASK,observedAt:'2026-11-01'}]},2);
 assert.equal(runs(t.p,3).find(s=>s.role==='QUALITY')?.prescription.family,'FAMILIAR_REPEATED_BOUTS');
 weekly(t,2,{o:s=>s.role==='QUALITY'?{response:BAD}:{}});weekly(t,3,{o:s=>s.role==='QUALITY'?{response:BAD}:{}});
 const q4=runs(t.p,4).find(s=>s.role==='QUALITY');
 assert.ok(q4&&q4.replaces==='FAMILIAR_REPEATED_BOUTS'&&/repeated harder-than-usual/.test(q4.explanation??''),JSON.stringify(q4&&[q4.prescription.family,q4.explanation]));
});

test('SSCTR R7B-F3: strides hold in the introduction week; race-day warm-up strides are optional where strides are',()=>{
 const t=reviewed({...GRAD,id:'fx-f3'},0);let g=null;
 for(let w=0;w<8;w++){const r=weekly(t,w);if(r.action==='RUN_QUALITY_GRADUATION')g=w;}
 assert.ok(g!==null,'graduated');
 const reps=w=>Math.max(0,...runs(t.p,w).filter(s=>s.prescription.strides).map(s=>s.prescription.strides.repetitions));
 assert.equal(reps(g+1),reps(g),`introduction week ${g+1}: strides ${reps(g+1)} vs ${reps(g)}`);
 const race=program({id:'fx-f3-race',goals:{run:'RACE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:4,runMinutesPerWeek:80,longestRunMinutes:35},event:{kind:'10K',date:'2027-02-14'},schedule:{strengthDays:[],runDays:[1,3,5,6],runMinutes:45,longRunMinutes:90},weeks:16});
 const day=race.weeks.flatMap(w=>runs(race,w.index)).find(s=>s.role==='RACE');
 assert.ok(day,'race day planned');
 for(const x of (day.prescription.instructions??[]).filter(x=>/stride/i.test(x)&&!/no strides/i.test(x)))assert.match(x,/optional/,x);
});

test('SSCTR R7B-F4: the CMP.P04 content stage sees next week\'s day-0 long run across the week wrap',()=>{
 const p=program({id:'fx-f4',goals:{run:'RACE',strength:'STRENGTH'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:3},knownExercises:[{id:'bulgarian-split-squat-db',familiar:true}],schedule:{runDays:[0,2,4],strengthDays:[1,3,6],longRunDay:0}});
 let reduced=0;
 for(const w of p.weeks){
  const next=p.weeks[w.index+1];if(!next||['RACE_WEEK','POST_EVENT','CONSOLIDATION'].includes(w.phase)||['RACE_WEEK','POST_EVENT'].includes(next.phase))continue;
  if((p.goal.priorityByPhase[w.phase]?.lead??p.goal.baseLead)!=='RUN'||!next.sessions.some(s=>s.day===0&&s.role==='LONG'&&s.prescription))continue;
  for(const s of w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.day===6))for(const e of s.prescription.exercises.filter(e=>e.role!=='MAIN'&&e.region==='LOWER'&&configurationOf(e.id)?.eccentric==='HIGH')){
   if(e.exposure?.contentReduction==='CMP.P04')reduced++;else assert.ok(e.sets<=1||['FIRST_ESTABLISH','REESTABLISH'].includes(e.exposure?.kind),`week ${w.index} ${w.phase} ${e.id} x${e.sets} (${e.exposure?.kind}) before next week's day-0 long run`);
  }
 }
 assert.ok(reduced>0,'the wrap reduces at least one row');
});
