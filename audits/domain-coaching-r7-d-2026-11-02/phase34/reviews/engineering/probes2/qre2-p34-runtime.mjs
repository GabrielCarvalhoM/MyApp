// QRE R7-D Phase 3.4 recheck (QRE-R7D-PHASE34-CHECK-r2, CQ-4): runtime probes of the bounded cycle on candidate 46934a0 (independent Quality/
// Reliability Engineer; not the author's evidence). Scratch copies only:
//   node qre2-p34-runtime.mjs <root> --label <name> [--out <file>]
// <root> holds CoachingCore/ and the audit records it reads. The fixtures are the repository's own (r7/b/fixtures/helpers.mjs) at that root.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=H;

const GEN={id:'qre2-p34-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const GEV={id:'qre2-p34-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const A=()=>brk(0,13);
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s),all=(p,s)=>obs(p,s),none=(p,s)=>notDone(p,s);
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
const sum=d=>d?{start:d.startDate,end:d.endDate,days:d.days,cls:d.class,relation:d.relation??null,runMode:d.entry?.run?.mode??null,stops:(d.separateBreaks??[]).map(b=>b.episode+':'+b.stop+(b.ownReturn?`(${b.ownReturn.class}/${b.ownReturn.days},RUN=${b.ownReturn.reentered.RUN},STR=${b.ownReturn.reentered.STRENGTH})`:'')+(b.stopInOwnReturn!==undefined?`[in ${b.ownReturnOf}: ${b.stopInOwnReturn}]`:''))}:null;
const res=r=>({action:r.action,status:r.status??null,validity:r.planValidity?.status??null,missing:r.missingInputs??[],question:r.question??null,errors:r.errors??[],reason:String(r.reason??'').slice(0,300)});
const viewAt=(t,w)=>{const d=lastReturn(t.p),from=addDays(t.p.weeks[w].startDate,6);return {stop:sum(d),runs:runsAhead(t.p,w,from),strength:strengthAhead(t.p,w,from)};};
// Views compared across cases with their own episode ids: the ids are replaced by their role suffix (-A, -D, -z, -x, -H) before hashing.
const norm=v=>JSON.parse(JSON.stringify(v).replace(/\b[a-z0-9]+-(A|D|z|x|H)\b/g,'<$1>'));
const same=(a,b)=>hash(norm(a))===hash(norm(b));
const out={probe:'QRE2-P34-RUNTIME-1',label,root,cases:{}};
const run=(id,f)=>{try{out.cases[id]=f();}catch(e){out.cases[id]={exception:e.name+': '+e.message,stack:String(e.stack).split('\n').slice(0,5).join(' | ')};}};

/** The Founder's case: A kept (wk2-3), weeks 4-5 reported by `report`, D (Mon-Thu wk6) named and declared Fri wk6; a plain review an hour later. */
function founders(id,D,report=miss(friStrength),{a=A(),lift=false}={}){
 const t=base();
 const l=lift?[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))]:[];
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'},observations:l});
 const o=[4,5].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>(typeof report==='function'?report:report[w])(t.p,s)));
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};
}
let SEQ=0;const correct=(t,id,i,at={day:5,hour:'10:00:00'},w=6)=>step(t,w,{...at,kind:'RETURN_AFTER_PAUSE',interruption:{...i,episodeId:id+'-D'},event:{id:`${id}-D-c${++SEQ}`,kind:'RETURN_AFTER_PAUSE'}});

// ---------- R01: CQ-1 (QRE-P34-01) beyond T26 ----------
// (a) a return whose stop ran through the earlier break (weeks 4-5 not done: NO_TRAINING_BETWEEN), corrected without its first day vs with it.
run('R01a_continuity_return_correction_without_first_day',()=>{
 const {startDate:_s,...noFirst}=trip(28,32);
 const x=founders('r1a',trip(28,31),none),y=founders('r1b',trip(28,31),none);
 const rx=correct(x.t,'r1a',noFirst),ry=correct(y.t,'r1b',trip(28,32));
 return {first:res(x.r),firstView:viewAt(x.t,6),withoutFirst:res(rx),withFirst:res(ry),equal:same(viewAt(x.t,6),viewAt(y.t,6)),viewWithout:viewAt(x.t,6),viewWith:viewAt(y.t,6)};
});
// (b) the Founder's case corrected with its start time only (no startDate): the first day is the start time's local day.
run('R01b_correction_with_startedAt_only',()=>{
 const {startDate:_s,...noFirst}=trip(28,32);
 const x=founders('r1c',trip(28,31)),y=founders('r1d',trip(28,31));
 const rx=correct(x.t,'r1c',{...noFirst,startedAt:`${day(28)}T06:00:00Z`}),ry=correct(y.t,'r1d',{...trip(28,32),startedAt:`${day(28)}T06:00:00Z`});
 return {withoutFirst:res(rx),withFirst:res(ry),equal:same(viewAt(x.t,6),viewAt(y.t,6))};
});
// (c) persistence: after the correction without its first day, the week's later reviews and the next week's review never hold.
run('R01c_no_hold_across_later_reviews',()=>{
 const {startDate:_s,...noFirst}=trip(28,32);
 const x=founders('r1e',trip(28,31)),rc=correct(x.t,'r1e',noFirst);
 const r2=step(x.t,6,{day:5,hour:'12:00:00'}),r3=step(x.t,6,{day:6,hour:'21:00:00'}),r4=step(x.t,7,{day:0,hour:'07:00:00'}),r5=step(x.t,7,{observations:x.t.p.weeks[7].sessions.filter(live).map(s=>obs(x.t.p,s))});
 return {correction:res(rc),later:[r2,r3,r4,r5].map(res),anyHold:[rc,r2,r3,r4,r5].some(r=>r.status==='HOLD'||r.action==='HOLD')};
});
// (d) a correction without its first day whose length reaches back to touch the holiday (18 days ending on day 31 starts on day 14).
run('R01d_length_reaches_the_holiday',()=>{
 const {startDate:_s,...noFirst}=trip(14,31);
 const x=founders('r1f',trip(28,31)),y=founders('r1g',trip(28,31));
 const rx=correct(x.t,'r1f',noFirst),ry=correct(y.t,'r1g',trip(14,31));
 return {withoutFirst:res(rx),withFirst:res(ry),equal:same(viewAt(x.t,6),viewAt(y.t,6)),viewWithout:viewAt(x.t,6).stop};
});
// (e) a correction stating only its length, reported on Saturday: the end is the day before the review (Friday), the first day its length gives.
run('R01e_length_only_vs_dates',()=>{
 const x=founders('r1h',trip(28,31)),y=founders('r1i',trip(28,31));
 const rx=correct(x.t,'r1h',{days:5,reasonCategory:'WORK',reason:'Work trip',nonclinical:true},{day:5,hour:'10:00:00'}),ry=correct(y.t,'r1i',{...trip(28,32)},{day:5,hour:'10:00:00'});
 return {lengthOnly:res(rx),dates:res(ry),equal:same(viewAt(x.t,6),viewAt(y.t,6)),stopLengthOnly:viewAt(x.t,6).stop};
});

// ---------- R02: SSCTR-P34R-F04 liveness: can the athlete answer the new question? ----------
// T25's SD1 (a lift on the holiday's first day with no start time; strength read from the holiday's own return). The answer restates the holiday by its
// episodeId with its start time; SD2 is the same facts with the start time stated from the outset.
const sd=(id,a,report=miss(friStrength))=>founders(id,trip(28,31),report,{a,lift:true});
run('R02a_answer_by_declaration',()=>{
 const x=sd('r2a',A()),q=res(x.r);
 const ans=step(x.t,6,{day:4,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...A(),episodeId:'r2a-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:'r2a-A2',kind:'LOCAL_FATIGUE'}});
 const plain=step(x.t,6,{day:4,hour:'10:00:00'});
 const ctl=sd('r2c',brk(0,13,{startedAt:`${day(0)}T20:00:00Z`}));
 return {question:q,answer:res(ans),plainAfterAnswer:res(plain),viewAfter:viewAt(x.t,6),control:res(ctl.r),controlView:viewAt(ctl.t,6),equalToControl:same(viewAt(x.t,6),viewAt(ctl.t,6))};
});
run('R02b_answer_in_the_weekly_review',()=>{
 const x=sd('r2b',A());
 const ans=step(x.t,6,{day:4,hour:'09:00:00',interruption:{...A(),episodeId:'r2b-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:'r2b-answer',kind:'WEEKLY_REVIEW'}});
 const plain=step(x.t,6,{day:4,hour:'10:00:00'});
 const ctl=sd('r2d',brk(0,13,{startedAt:`${day(0)}T20:00:00Z`}));
 return {question:res(x.r),answer:res(ans),plainAfterAnswer:res(plain),equalToControl:same(viewAt(x.t,6),viewAt(ctl.t,6))};
});
// (c) the start time stated before the lift: the lift is inside the holiday.
run('R02c_answer_start_before_the_lift',()=>{
 const x=sd('r2e',A());
 const ans=step(x.t,6,{day:4,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...A(),episodeId:'r2e-A',startedAt:`${day(0)}T00:30:00Z`},event:{id:'r2e-A2',kind:'LOCAL_FATIGUE'}});
 const plain=step(x.t,6,{day:4,hour:'10:00:00'});
 return {question:res(x.r),answer:res(ans),plainAfterAnswer:res(plain),viewAfter:viewAt(x.t,6)};
});

// ---------- R03: SSCTR-P34R-F04 question target when the own return's stop starts at an even earlier break (startBreak) ----------
// z (wk2), week 3 reported not done, x (wk4), weeks 5-6 with the Friday strength missed, H (Mon-Thu wk7). The lift is on z's first day with no start
// time. x is H's own return; x's own stop runs back through z (nothing trained between), so the stop x's return reads starts on z's first day.
function chain(id,zi=brk(0,6)){
 const t=base();
 const lift=[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))];
 step(t,3,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:zi,event:{id:id+'-z',kind:'SYSTEMIC_FATIGUE'},observations:lift});
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(14,20),episodeId:id+'-x'},event:{id:id+'-x',kind:'LOCAL_FATIGUE'},observations:t.p.weeks[3].sessions.filter(live).map(s=>notDone(t.p,s))});
 const o=[5,6].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s)));
 step(t,7,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(35,38),episodeId:id+'-H'},event:{id:id+'-H',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,r:step(t,7,{day:4,hour:'08:00:00'})};
}
run('R03_question_names_the_break_that_starts_the_own_stop',()=>{
 const x=chain('r3'),q=res(x.r);
 const named=q.question?.episodeId??null;
 let answer=null,plain=null,view=null;
 if(q.action==='ASK'&&named){answer=res(step(x.t,7,{day:4,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...brk(0,6),episodeId:named,startedAt:`${day(0)}T20:00:00Z`},event:{id:'r3-answer',kind:'LOCAL_FATIGUE'}}));plain=res(step(x.t,7,{day:4,hour:'10:00:00'}));view=viewAt(x.t,7);}
 const ctl=chain('r3c',brk(0,6,{startedAt:`${day(0)}T20:00:00Z`}));
 return {question:q,questionNamesZ:named==='r3-z',answerByNamedBreak:answer,plainAfterAnswer:plain,viewAfter:view,control:res(ctl.r),controlView:viewAt(ctl.t,7),equalToControl:view?same(view,viewAt(ctl.t,7)):null};
});

// ---------- R04: SSCTR-P34R-F04 in the correction re-read (recordedStop) ----------
// Week 4: every run done, the Friday strength missed; week 5: strength in full, the Tuesday run missed. The first return (trip wk6) re-enters both
// sports by their own weeks (no full week): no question. A correction that starts the trip on Tuesday of week 5 (no strength that day) leaves only
// week 4 wholly between: strength now reads from the holiday's own return, and the lift on the holiday's first day has no start time.
const REP4={4:miss(friStrength),5:miss(tueRun)},CORR=trip(22,32);
const r4case=id=>{const x=founders(id,trip(28,31),REP4,{lift:true});return {x,first:res(x.r),firstView:viewAt(x.t,6),rc:correct(x.t,id,CORR)};};
// The rest of the plan after an answer: the correction again, a plain review, Sunday's review, next week's Monday and its weekly review, week 8.
const after=(t,id)=>{const r=[];r.push(['correctionAgain',correct(t,id,CORR,{day:5,hour:'12:00:00'})]);r.push(['plain',step(t,6,{day:5,hour:'13:00:00'})]);r.push(['sunday',step(t,6,{day:6,hour:'21:00:00'})]);
 r.push(['wk7mon',step(t,7,{day:0,hour:'07:00:00'})]);r.push(['wk7review',step(t,7,{observations:t.p.weeks[7].sessions.filter(live).map(s=>obs(t.p,s))})]);r.push(['wk8review',step(t,8,{observations:t.p.weeks[8].sessions.filter(live).map(s=>obs(t.p,s))})]);
 return Object.fromEntries(r.map(([k,v])=>[k,res(v)]));};
const answers={
 declaration:(t,id,q)=>step(t,6,{day:5,hour:'11:00:00',kind:'LOCAL_FATIGUE',interruption:{...A(),episodeId:q,startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-ans',kind:'LOCAL_FATIGUE'}}),
 weeklyReview:(t,id,q)=>step(t,6,{day:5,hour:'11:00:00',interruption:{...A(),episodeId:q,startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-ans',kind:'WEEKLY_REVIEW'}}),
 returnReport:(t,id,q)=>step(t,6,{day:5,hour:'11:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A(),episodeId:q,startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-ans',kind:'RETURN_AFTER_PAUSE'}})
};
for(const [k,f] of Object.entries(answers))run('R04_answer_'+k,()=>{
 const id='r4'+k.slice(0,3),{x,first,firstView,rc}=r4case(id),q=rc.question?.episodeId??null,asked=rc.action==='ASK'&&(rc.missingInputs??[]).includes('interruption.startedAt');
 if(!asked)return {first,correction:res(rc)};
 const ans=f(x.t,id,q);return {first,firstView,correction:res(rc),answer:res(ans),then:after(x.t,id),viewAfter:viewAt(x.t,6)};
});
// The question left unanswered: the plan keeps the applied return; later reviews.
run('R04_question_ignored',()=>{const id='r4ign',{x,rc}=r4case(id);const r=[['sunday',step(x.t,6,{day:6,hour:'21:00:00'})],['wk7mon',step(x.t,7,{day:0,hour:'07:00:00'})],['wk7review',step(x.t,7,{observations:x.t.p.weeks[7].sessions.filter(live).map(s=>obs(x.t.p,s))})]];
 return {correction:res(rc),later:Object.fromEntries(r.map(([k,v])=>[k,res(v)]))};});
// Control: the holiday's start time stated from the outset; the same correction is applied.
run('R04_control_start_stated',()=>{const x=founders('r4ctl',trip(28,31),REP4,{lift:true,a:brk(0,13,{startedAt:`${day(0)}T20:00:00Z`})}),rc=correct(x.t,'r4ctl',CORR);return {first:res(x.r),correction:res(rc),view:viewAt(x.t,6)};});

// CF-P34-02 (the corrected return equals the fresh read): the same facts with the trip reported fresh on its corrected dates (the holiday unapplied):
// the separate-breaks path asks the same question; answered by restating the holiday with its start time, then a plain review.
run('R04_fresh_equivalent',()=>{const x=founders('r4fr',CORR,REP4,{lift:true}),q=res(x.r);
 const ans=step(x.t,6,{day:4,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...A(),episodeId:'r4fr-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:'r4fr-ans',kind:'LOCAL_FATIGUE'}});
 const plain=step(x.t,6,{day:4,hour:'10:00:00'}),ctl=correct(founders('r4frc',trip(28,31),REP4,{lift:true,a:brk(0,13,{startedAt:`${day(0)}T20:00:00Z`})}).t,'r4frc',CORR);
 return {fresh:q,answer:res(ans),plainAfterAnswer:res(plain),viewAfter:viewAt(x.t,6),correctionWithStartStated:res(ctl)};});
// A dates-unchanged correction (one more day at the end) after the lift on the holiday's first day was reported only after the return: the re-read
// of the recorded return now sees the lift.
run('R04_late_lift_then_correction',()=>{const id='r4ll',x=founders(id,trip(28,31),miss(friStrength));
 const lift=obs(x.t.p,x.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
 const lr=step(x.t,6,{day:5,hour:'09:00:00',observations:[{...lift}]}),rc=correct(x.t,id,trip(28,32)),pl=step(x.t,6,{day:5,hour:'13:00:00'}),wk=step(x.t,7,{observations:x.t.p.weeks[7].sessions.filter(live).map(s=>obs(x.t.p,s))});
 return {first:res(x.r),lateLift:res(lr),correction:res(rc),plain:res(pl),wk7review:res(wk)};});
// ---------- R07: the late-evidence check (staleReturn -> recordedStop -> stopOf) after a late-reported lift, on the Founder's case itself ----------
// The Founder's case (weeks 4-5 with every run done and the Friday strength missed) is applied; the Monday lift on the holiday's first day is reported
// only afterwards (Saturday 09:00, a plain review with that one observation). Answer channels, then the reviews of weeks 6 to 9.
const lateLift=id=>{const x=founders(id,trip(28,31),miss(friStrength)),first=res(x.r);
 const lift=obs(x.t.p,x.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
 return {x,first,lr:step(x.t,6,{day:5,hour:'09:00:00',observations:[lift]})};};
const later=t=>{const r=[['plain',step(t,6,{day:5,hour:'13:00:00'})],['sunday',step(t,6,{day:6,hour:'21:00:00'})],['wk7review',step(t,7,{observations:t.p.weeks[7].sessions.filter(live).map(s=>obs(t.p,s))})],
 ['wk8review',step(t,8,{observations:t.p.weeks[8].sessions.filter(live).map(s=>obs(t.p,s))})],['wk9review',step(t,9,{observations:t.p.weeks[9].sessions.filter(live).map(s=>obs(t.p,s))})]];return Object.fromEntries(r.map(([k,v])=>[k,res(v)]));};
const lateAnswers={
 none:()=>null,
 holidayDeclaration:(t,id)=>step(t,6,{day:5,hour:'10:00:00',kind:'LOCAL_FATIGUE',interruption:{...A(),episodeId:id+'-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-ans',kind:'LOCAL_FATIGUE'}}),
 holidayInWeeklyReview:(t,id)=>step(t,6,{day:5,hour:'10:00:00',interruption:{...A(),episodeId:id+'-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-ans',kind:'WEEKLY_REVIEW'}}),
 holidayReturnReport:(t,id)=>step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...A(),episodeId:id+'-A',startedAt:`${day(0)}T20:00:00Z`},event:{id:id+'-ans',kind:'RETURN_AFTER_PAUSE'}}),
 tripConfirmedAgain:(t,id)=>correct(t,id,trip(28,31),{day:5,hour:'10:00:00'}),
 holidayThenTrip:(t,id)=>{lateAnswers.holidayDeclaration(t,id);return correct(t,id,trip(28,31),{day:5,hour:'11:00:00'});}
};
for(const [k,f] of Object.entries(lateAnswers))run('R07_late_lift_answer_'+k,()=>{const id='r7'+k.slice(0,4),{x,first,lr}=lateLift(id),a=f(x.t,id);return {first,lateLift:res(lr),answer:a?res(a):null,later:later(x.t)};});
// Controls: (a) T13's own late fact (the Friday strength of week 5 corrected to done) answered by confirming the trip again; (b) a late lift inside the
// holiday but not on its first day (Monday of week 3), answered the same way.
run('R07_control_T13_late_fact_answered',()=>{const id='r7c13',x=founders(id,trip(28,31),miss(friStrength)),first=res(x.r);
 const fri=x.t.p.weeks[5].sessions.find(s=>live(s)&&friStrength(s)),row=x.t.ledger.find(o=>o.sessionId===fri.id&&!o.fact);
 const lr=step(x.t,6,{day:5,hour:'09:30:00',observations:[{...obs(x.t.p,fri),observedAt:row.observedAt,correctionOf:row.eventId,correctedAt:`${day(33)}T09:00:00Z`}]});
 const a=correct(x.t,id,trip(28,31),{day:5,hour:'10:00:00'});return {first,lateFact:res(lr),answer:res(a),later:later(x.t)};});
run('R07_control_late_lift_not_first_day',()=>{const id='r7cnf',x=founders(id,trip(28,31),miss(friStrength)),first=res(x.r);
 const lift=obs(x.t.p,x.t.p.weeks[3].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(7)));
 const lr=step(x.t,6,{day:5,hour:'09:00:00',observations:[lift]}),a=correct(x.t,id,trip(28,31),{day:5,hour:'10:00:00'});return {first,lateLift:res(lr),answer:res(a),later:later(x.t)};});
// Escapes from the unanswered question: what else the athlete could send. (a) the correction again with the start time of the trip (a different fact
// than the one asked); (b) the trip re-corrected back to its first report's dates (giving up the true dates); (c) the holiday restated exactly as its
// first report (no start time).
const escapes={
 tripStartedAt:(t,id)=>correct(t,id,{...CORR,startedAt:`${day(22)}T06:00:00Z`},{day:5,hour:'11:00:00'}),
 backToFirstDates:(t,id)=>correct(t,id,trip(28,31),{day:5,hour:'11:00:00'}),
 holidayRestatedUnchanged:(t,id)=>step(t,6,{day:5,hour:'11:00:00',kind:'LOCAL_FATIGUE',interruption:{...A(),episodeId:id+'-A'},event:{id:id+'-ans',kind:'LOCAL_FATIGUE'}})
};
for(const [k,f] of Object.entries(escapes))run('R04_escape_'+k,()=>{const id='r4e'+k.slice(0,3),{x,rc}=r4case(id);const e=f(x.t,id);
 const r=[['plain',step(x.t,6,{day:5,hour:'13:00:00'})],['wk7review',step(x.t,7,{observations:x.t.p.weeks[7].sessions.filter(live).map(s=>obs(x.t.p,s))})]];
 return {correction:res(rc),escape:res(e),later:Object.fromEntries(r.map(([k2,v])=>[k2,res(v)]))};});

// ---------- R05: SSCTR-P34R-F02/F03 edges ----------
const raceWeekOf=(id,o,report)=>{const t={p:program(o),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const runs7=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>s.role);
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(42,45),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:t.p.weeks[7].sessions.filter(live).map(s=>report(t.p,s))});
 const r=step(t,8,{day:4,hour:'08:00:00'});return {runs7,result:res(r),stop:sum(lastReturn(t.p)),runs:runsAhead(t.p,8,addDays(t.p.weeks[8].startDate,6))};};
const RW={...GEV,id:'qre2-rw',schedule:{runDays:[3,5,6],longRunDay:6}},RWo={...GEV,id:'qre2-rwo',goals:{run:'10K',strength:'NONE'},knownExercises:[],schedule:{runDays:[3,5,6],longRunDay:6,strengthDays:[]}};
const half=(p,s)=>obs(p,s,{minutes:Math.max(1,Math.round(s.prescription.durationMinutes/2))});
const role=r=>s=>s.sport==='RUN'&&s.role===r;
run('R05a_gateless_race_week_touch_half',()=>({hybrid:raceWeekOf('r5a',RW,(p,s)=>role('RACE_TOUCH')(s)?half(p,s):obs(p,s)),runOnly:raceWeekOf('r5b',RWo,(p,s)=>role('RACE_TOUCH')(s)?half(p,s):obs(p,s))}));
run('R05b_gateless_race_week_race_half',()=>({hybrid:raceWeekOf('r5c',RW,(p,s)=>role('RACE')(s)?half(p,s):obs(p,s)),runOnly:raceWeekOf('r5d',RWo,(p,s)=>role('RACE')(s)?half(p,s):obs(p,s))}));
run('R05c_gateless_race_week_shakeout_missed',()=>({hybrid:raceWeekOf('r5e',RW,(p,s)=>role('SHAKEOUT')(s)?notDone(p,s):obs(p,s)),runOnly:raceWeekOf('r5f',RWo,(p,s)=>role('SHAKEOUT')(s)?notDone(p,s):obs(p,s))}));
run('R05d_gateless_race_week_all',()=>({hybrid:raceWeekOf('r5g',RW,all),runOnly:raceWeekOf('r5h',RWo,all)}));
// R08 (F03's required-run clause, mutant N01): the holiday in weeks 5-6, the race week 7 not done, the post-event week 8 with its optional runs not
// done and its strength done, a trip Mon-Thu of week 9. No run was done between the breaks: running re-enters nowhere.
run('R08_post_event_week_optional_runs_not_done',()=>{const t={p:program(GEV),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(21,34),event:{id:'r8-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[...t.p.weeks[7].sessions.filter(live).map(s=>notDone(t.p,s)),...t.p.weeks[8].sessions.filter(live).map(s=>s.sport==='RUN'?notDone(t.p,s):obs(t.p,s))];
 step(t,9,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(49,52),episodeId:'r8-D'},event:{id:'r8-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,9,{day:4,hour:'08:00:00'});
 return {week7:t.p.weeks[7].sessions.filter(live).map(s=>s.sport+':'+s.role),week8:t.p.weeks[8].sessions.filter(live).map(s=>s.sport+':'+s.role),result:res(r),stop:sum(lastReturn(t.p)),runs:runsAhead(t.p,9,addDays(t.p.weeks[9].startDate,6))};});

const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
