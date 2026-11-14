// V1 Run Workout Structure: the engine's amendment and what never changes around it. T1 and I1 (preservation), T3 (a report's new facts survive in
// the record and in custody), T16 (the amendment alone), T18 and I5 (a reading is never accepted), T19 and I2 (the five bindings read alike),
// I7 (replay), and the clinical screen first. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,X,V1,DEV,FORMATS_OFF,ELIG,live,runner,result,report,hash,timeline,atSixteen,sixteen,paced,nativeReport,weekWith} from './v1rws-helpers.mjs';
import {READS_COMPLETION,historicalStateOf} from '../src/r6-adaptation.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore} from '../src/boundary/store.mjs';

const MINE=['runSessions','runFormat','runFormatRecord','runHistoryRecord'];
const core=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!MINE.includes(k)));
const JOURNEYS=[
 ['an experienced runner with a current result',sixteen(),(t,w)=>t.week(w,paced)],
 ['a 10 km race plan, one session missed',runner({id:'rw-j-ev',weeks:12,goal:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},anchors:[result('10K',3000,'2026-10-25')]}),(t,w)=>t.week(w,s=>w===1&&s.role==='EASY'?false:{pace:390,rpe:4})],
 ['a beginner by walk and jog',runner({id:'rw-j-new',weeks:8,runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:0}}),(t,w)=>t.week(w)],
 ['a runner with no result on record',runner({id:'rw-j-none',weeks:8}),(t,w)=>t.week(w,()=>({pace:400,rpe:3}))],
];
test('I1, T1: with the native formats off the composed entry point is the calibration entry point, key by key; on, with no native report, it adds only its own keys',()=>{
 for(const [name,intake,weekOf] of JOURNEYS){
  const base=timeline(intake,{opts:FORMATS_OFF,entry:X,prefix:'p'}),off=timeline(intake,{opts:FORMATS_OFF,prefix:'p'}),on=timeline(intake,{opts:DEV,prefix:'p'});
  assert.equal(hash(core(off.g)),hash(base.g),name+': plan, off');assert.equal(hash(core(on.g)),hash(base.g),name+': plan, on');
  assert.deepEqual([off.g.runFormat.status,Object.keys(off.g.runSessions).length,off.g.runFormatRecord.length],['DISABLED',0,0]);
  for(let w=0;w<4;w++){
   const b=weekOf(base,w),o=weekOf(off,w),n=weekOf(on,w);
   assert.equal(hash(core(o)),hash(b),`${name}: week ${w}, off`);assert.equal(hash(core(n)),hash(b),`${name}: week ${w}, on with plain reports`);
   assert.equal(hash(on.p),hash(base.p));assert.equal(hash(on.ledger),hash(base.ledger));assert.equal(hash(n.runCalibration),hash(b.runCalibration));assert.equal(n.inputHash,b.inputHash,'the engine hashed the same review');
  }
  assert.equal(on.state.status,'ACTIVE');
 }
});
test('T2 through the engine: every planned run session of every journey has a time expression whose steps add up to its prescription',async()=>{
 const {timeBlocks,stepsMinutes}=await import('../src/v1-run-format.mjs');let n=0;const families=new Set();
 for(const [name,intake] of JOURNEYS){const t=timeline(intake,{opts:DEV});
  for(const week of t.p.weeks)for(const s of week.sessions.filter(x=>x.sport==='RUN'&&live(x))){const p=s.prescription;assert.ok(Math.abs(stepsMinutes(timeBlocks(p))-p.durationMinutes)<1e-9,`${name} ${s.id} ${p.family}`);n++;families.add(p.family);}}
 assert.ok(n>100&&['EASY','LONG','THRESHOLD','TEN_K_SPECIFIC','RACE_TOUCH','RACE','WALK_JOG','RECOVERY_EASY'].every(f=>families.has(f)),[...families].join());
});

const fast16=(t,x={})=>nativeReport(t,t.long,{minutes:85,km:16,rpe:4,...x});
test('T6, I2: a 16 km long run done in fewer than 0.9 of its planned minutes is complete for the engine, and the step it releases is the time version\'s',()=>{
 const t=atSixteen(),run=t.runs[t.long.id];
 assert.deepEqual([run.expression,run.blocks[0].steps[0].target.metres,t.long.prescription.durationMinutes],['NATIVE',16000,100]);
 const r=t.week(1,weekWith(t,1,t.long.id,fast16(t))),row=t.row(t.long.id);
 assert.ok(85<0.9*100);assert.deepEqual([row.partial,row.comparable,row.actual.minutes,row.actual.distanceKm],[false,true,85,16],'complete, with the real minutes and the measured distance');
 assert.equal(r.weekEvidence.rows.find(x=>x.sessionId===t.long.id).status,'COMPLETED');
 assert.deepEqual([t.runs[t.long.id].execution.status,t.runs[t.long.id].execution.basis,t.runs[t.long.id].execution.completed],['DISTANCE','MEASURED',true]);
 // The same week by time, every session done in its planned minutes: the same gates and the same next long run dose.
 const time=atSixteen();const rt=time.week(1,paced);
 assert.deepEqual(r.gates,rt.gates);assert.equal(t.p.weeks[2].sessions.find(s=>s.role==='LONG').prescription.durationMinutes,time.p.weeks[2].sessions.find(s=>s.role==='LONG').prescription.durationMinutes);
 // Without the reader the same row is read by its minutes: partial (what the amendment is for).
 const plain=X.evaluateProgram(atSixteen().p,(u=>{u.week(0,paced);return u;})(timeline(sixteen(),{entry:X,opts:FORMATS_OFF})).review(1,6,'WEEKLY_REVIEW',{observations:[fast16(t)]}),FORMATS_OFF);
 assert.equal(plain.actualLedger.find(o=>o.sessionId===t.long.id).partial,true,'the frozen read');
});
test('T16: the amendment alone: a mutant that reads the minutes first would fail the fast run, one that reads completed first would pass a stop',()=>{
 const t=atSixteen(),stopped=nativeReport(t,t.long,{minutes:95,km:12,completed:true,actual:{stop:{reason:'FATIGUE',metres:12000}}});
 const r=t.week(1,weekWith(t,1,t.long.id,stopped)),row=t.row(t.long.id);
 assert.ok(95>=0.9*100&&row.actual.completed===true,'the client said completed and the minutes pass the frozen read');
 assert.equal(row.partial,true,'a stop is never the target met');assert.equal(r.weekEvidence.rows.find(x=>x.sessionId===t.long.id).status,'PARTIAL');
 assert.deepEqual([t.runs[t.long.id].execution.status,t.runs[t.long.id].execution.stop.reason,t.runs[t.long.id].execution.completed],['STOPPED','FATIGUE',false]);
});
test('T18, I5: a reading is never accepted: forged on any entry point, in the review, in the carried record or in the options, a 12 km stop stays incomplete',()=>{
 const forged={status:'DISTANCE',basis:'MEASURED'},stop=t=>nativeReport(t,t.long,{minutes:70,km:12,completed:true,actual:{stop:{reason:'CHOICE',metres:12000},completionRead:forged}});
 // (a) v1-index and (b) v1-run-index: the field is ignored (the frozen read: 70 of 100 minutes).
 for(const [entry,opts] of [[V1,{eventExtension:DEV.eventExtension}],[X,FORMATS_OFF]]){const t=timeline(sixteen(),{entry,opts});t.week(0,paced);const long=t.p.weeks[1].sessions.find(s=>s.role==='LONG');
  const o={...report(t.p,long,{}),actual:{completed:true,minutes:70,distanceKm:12,measurement:'GPS',completionRead:forged}};t.step(1,6,'WEEKLY_REVIEW',{observations:[o]});assert.equal(t.row(long.id).partial,true);}
 // (c) the composed entry point, in the review: dropped and read again.
 const c=atSixteen();c.week(1,weekWith(c,1,c.long.id,stop(c)));
 assert.equal(c.row(c.long.id).partial,true);assert.ok(!('completionRead' in c.row(c.long.id).actual),'the forged reading is not recorded');assert.equal(c.runs[c.long.id].execution.status,'STOPPED');
 assert.ok(c.runs[c.long.id].execution.extentKm===12&&c.runs[c.long.id].execution.targetKm===16,'the extent is the 12 km run, never the target');
 // (d) inside the carried record: dropped again at the next review, the row still incomplete.
 const d=atSixteen();d.week(1,weekWith(d,1,d.long.id,stop(d)));d.ledger=d.ledger.map(o=>o.sessionId===d.long.id?{...o,partial:false,actual:{...o.actual,completionRead:forged}}:o);
 d.week(2,weekWith(d,2,null,null));assert.equal(d.row(d.long.id).partial,true);assert.ok(!('completionRead' in d.row(d.long.id).actual));
 // (e) the reader's own key in the caller's options: only this entry point sets it.
 const e=atSixteen();e.opts={...DEV,[READS_COMPLETION]:()=>'DISTANCE'};e.week(1,weekWith(e,1,e.long.id,stop(e)));assert.equal(e.row(e.long.id).partial,true);
 // The frozen entry points given that key by a caller are development only (an integration passes no options): the key is what the amendment reads.
 const f=timeline(sixteen(),{entry:V1,opts:{eventExtension:DEV.eventExtension}});f.week(0,paced);const long=f.p.weeks[1].sessions.find(s=>s.role==='LONG');
 assert.equal(V1.evaluateProgram(f.p,f.review(1,6,'WEEKLY_REVIEW',{observations:[{...report(f.p,long,{}),actual:{completed:true,minutes:70}}]}),{eventExtension:DEV.eventExtension}).actualLedger.find(o=>o.sessionId===long.id).partial,true);
});
test('I2, T19: every binding of the record reads the same run alike: the review, the record kept under a clinical hold, the two views of a late report and the historical state',()=>{
 // The review and the historical state.
 const t=atSixteen();t.week(1,weekWith(t,1,t.long.id,fast16(t)));
 const at=t.review(2,0,'WEEKLY_REVIEW').asOf,mine=F.historicalStateOf(t.p,{asOf:at,actualLedger:t.ledger,runFormatRecord:t.fmt},DEV),frozen=historicalStateOf(t.p,{asOf:at,actualLedger:t.ledger},DEV);
 const byTime=atSixteen();byTime.week(1,paced);const timeState=F.historicalStateOf(byTime.p,{asOf:at,actualLedger:byTime.ledger,runFormatRecord:byTime.fmt},DEV);
 assert.deepEqual(mine.state.run,timeState.state.run,'the reconstruction reads the fast 16 km as the review did: the week of the time version done');
 assert.deepEqual([mine.state.run.easyWeeksDone,frozen.state.run.easyWeeksDone],[1,0],'without the reader the reconstruction would read the week as not done');
 // The record kept under a clinical hold (the binding of line 553): the report is recorded complete while nothing is planned.
 const h=atSixteen(),day=h.day(1,2),done=fast16(h); // the report cites the 16 km format delivered before the clinical route
 const clinical=h.step(1,2,'WEEKLY_REVIEW',{eligibility:ELIG(day,{pain:true})});assert.equal(clinical.status,'CLINICAL_HUMAN_REQUIRED');
 const held=h.step(1,6,'WEEKLY_REVIEW',{observations:[done]});assert.equal(held.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(held.proposal,null);
 assert.equal(h.row(h.long.id)?.partial,false,'recorded as it was done, complete by distance');
 // viewMovedBy and gapAnsweredBy: a review that brings a late report of an earlier week reads the carried record twice more, through the reader.
 const calls=[],spy=(o,s)=>{if(s.id===t.long.id)calls.push(o.eventId);return s.id===t.long.id?'DISTANCE':null;};
 const v=timeline(sixteen(),{entry:V1,opts:{eventExtension:DEV.eventExtension}});v.week(0,s=>s.role==='EASY'&&s.day===0?false:paced(s));
 const long=v.p.weeks[1].sessions.find(s=>s.role==='LONG'),o={...report(v.p,long,{}),actual:{completed:true,minutes:85,distanceKm:16,measurement:'GPS'}};
 v.opts={eventExtension:DEV.eventExtension,[READS_COMPLETION]:spy};v.step(1,6,'WEEKLY_REVIEW',{observations:[o]});assert.equal(calls.length,1,'one binding in a plain review');assert.equal(v.row(long.id).partial,false);
 calls.length=0;const late=v.p.weeks[1].sessions.find(s=>s.role==='EASY');
 v.step(2,1,'WEEKLY_REVIEW',{observations:[report(v.p,late,{pace:340,rpe:4})]});
 assert.equal(calls.length,3,'the review, viewMovedBy and gapAnsweredBy each bind the record through the reader: '+calls.length);
});
test('I7, T3: a replayed review is an exact replay; a report\'s new facts survive in the engine\'s record, the measured distance untouched',()=>{
 const t=atSixteen(),facts={stop:{reason:'TIME',atStep:{block:0,rep:0},metres:15000,seconds:5400},declared:{distanceKm:15,reason:'SIGNAL_LOSS',confirmedAt:'2026-11-22T12:00:00-03:00'},segments:[{distanceKm:0.4,measurement:'GPS'}],conditions:['WIND_STRONG'],steps:[{block:0,rep:0,kind:'STEADY',targetMet:false,metres:14600}]};
 const o=nativeReport(t,t.long,{minutes:91,km:14.2,actual:facts}),rv=t.review(1,6,'WEEKLY_REVIEW',{observations:[o],eventId:'rw-replay'});
 const first=t.take(F.evaluateProgram(t.p,rv,DEV)),row=t.row(t.long.id);
 for(const k of ['formatHash','steps','stop','declared','segments','conditions'])assert.deepEqual(row.actual[k],o.actual[k],k);
 assert.deepEqual([row.actual.distanceKm,row.actual.gpsQuality,row.actual.deviceGpsQuality],[14.2,'POOR',null],'a listed failure reason marks the measurement POOR; the measured value stays');
 const again=F.evaluateProgram(t.p,{...rv,actualLedger:t.ledger,referenceState:t.ref,runFormatRecord:t.fmt,runEvidenceRecord:t.ev},DEV);
 assert.ok(again.provenance.duplicates.some(d=>d.eventId===o.eventId&&d.reason==='EXACT_REPLAY'));assert.equal(hash(again.actualLedger.filter(x=>!x.fact)),hash(first.actualLedger.filter(x=>!x.fact)));
 // A run imported outside the plan keeps its stated sport.
 const loose={eventId:'rw-loose',athleteId:t.p.athleteId,canonicalActivityId:'hk-loose-1',source:{provider:'HEALTHKIT',activityId:'hk-loose-1'},occurrenceDate:t.day(2,2),actual:{completed:true,minutes:40,distanceKm:7,measurement:'GPS',sport:'RUN'}};
 t.step(2,2,'WEEKLY_REVIEW',{observations:[loose]});assert.equal(t.ledger.find(x=>x.eventId==='rw-loose').actual.sport,'RUN');assert.equal(t.ledger.find(x=>x.eventId==='rw-loose').context.sessionType,'UNPLANNED');
});
test('T3: custody keeps the new facts of a report row by row when the composed entry point is the engine it runs',()=>{
 // Custody stores the engine's fields only: the extension's records are kept beside it here, as the integration must (Data and Security).
 const kept={ev:[],fmt:[],hist:[],runs:{}},take=r=>{kept.ev=r.runEvidenceRecord??kept.ev;kept.fmt=r.runFormatRecord??kept.fmt;kept.hist=r.runHistoryRecord??kept.hist;if(r.runFormat?.status==='ACTIVE')kept.runs=r.runSessions;return r;};
 const engine={generateProgram:i=>take(F.generateProgram(i,DEV)),evaluateProgram:(p,r,o={})=>take(F.evaluateProgram(p,{...r,runEvidenceRecord:kept.ev,runFormatRecord:kept.fmt,runHistoryRecord:kept.hist},{...DEV,...o})),restartProgram:(i,o={})=>take(F.restartProgram({...i,runFormatRecord:kept.fmt,runHistoryRecord:kept.hist},{...DEV,...o}))};
 const clock={t:Date.parse('2026-11-07T12:00:00-03:00')},me={athleteId:'ath-rws-1'},custody=createCustody({store:memoryStore(),key:Buffer.from('v1rws-test-key-not-a-secret-0001'),now:()=>clock.t,engine});
 const e=custody.enroll({actor:me,intake:sixteen(),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:false},clientRequestId:'q0'});assert.ok(e.ok&&e.enrolled,JSON.stringify(e));
 const plan=()=>custody.read({actor:me}).doc,screen=()=>({...ELIG(new Date(clock.t).toISOString().slice(0,10)),assessedAt:new Date(clock.t).toISOString()});
 const send=(id,observations)=>{const r=custody.submit({actor:me,clientRequestId:id,expectedVersion:plan().version,review:{kind:'WEEKLY_REVIEW',eligibility:screen(),observations}});assert.equal(r.ok,true,JSON.stringify(r.error));return r;};
 const plainOf=w=>plan().program.weeks[w].sessions.filter(live).map(s=>{const {eventId,athleteId,...o}=report(plan().program,s,s.sport==='RUN'?paced(s):{});return o;});
 clock.t=Date.parse('2026-11-15T20:00:00-03:00');send('q1',plainOf(0));
 const long=plan().program.weeks[1].sessions.find(s=>s.role==='LONG'),run=kept.runs[long.id];assert.equal(run.blocks[0].steps[0].target.metres,16000);
 clock.t=Date.parse('2026-11-22T20:00:00-03:00');
 const r=send('q2',[{sessionId:long.id,occurrenceDate:long.date,actual:{completed:true,minutes:85,distanceKm:16,measurement:'GPS',gpsQuality:'OK',formatHash:run.formatHash,steps:[],declared:{distanceKm:16},completionRead:{status:'DISTANCE'}},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}]);
 const stored=plan().rows.find(x=>x&&x.sessionId===long.id);
 assert.deepEqual([stored.actual.formatHash,stored.actual.distanceKm,stored.actual.declared.distanceKm,stored.partial],[run.formatHash,16,16,false]);assert.ok(!('completionRead' in stored.actual));assert.equal(custody.verify(plan()),null,'the chain verifies');
 // The next review sends the stored row back unchanged: custody accepts it (a stored row never changes under the reader).
 clock.t=Date.parse('2026-11-29T20:00:00-03:00');send('q3',plainOf(2));assert.equal(custody.verify(plan()),null);assert.equal(r.status!=='HOLD',true);
});
test('A report that cites a format the record does not hold is not recorded and is asked again; a record sent without its formats holds; a clinical signal still routes first',()=>{
 const t=atSixteen(),o=fast16(t),bad={...o,actual:{...o.actual,formatHash:'0'.repeat(64)}};
 const asked=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW',{observations:[bad]}),DEV);
 assert.deepEqual([asked.status,asked.missingInputs,asked.question.kind,asked.actualLedger,asked.proposal],['ASK',['observations.actual.formatHash'],'UNKNOWN_RUN_FORMAT',undefined,null]);
 assert.equal(hash(asked.runFormatRecord),hash(t.fmt));
 const clinical=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW',{observations:[bad],eligibility:ELIG(t.day(1,6),{pain:true})}),DEV);
 assert.equal(clinical.status,'CLINICAL_HUMAN_REQUIRED','the clinical screen comes before this extension\'s question');
 t.week(1,weekWith(t,1,t.long.id,o));
 const lost=F.evaluateProgram(t.p,{...t.review(2,6,'WEEKLY_REVIEW'),runFormatRecord:[]},DEV);
 assert.deepEqual([lost.status,lost.errors,lost.proposal],['HOLD',['runFormatRecord.missingFormat'],null]);
 const altered=F.evaluateProgram(t.p,{...t.review(2,6,'WEEKLY_REVIEW'),runFormatRecord:t.fmt.map(r=>r.sessionId===t.long.id?{...r,format:{...r.format,blocks:[{repeat:1,steps:[{...r.format.blocks[0].steps[0],target:{type:'DISTANCE',metres:1000}}]}]}}:r)},DEV);
 assert.equal(altered.status,'HOLD','an altered format row is unreadable, never read as a shorter target');
});
test('I9, V4: the order of the records is irrelevant; and the one source of a band is V1RC unless a wrapping entry point hands another through the hook',async()=>{
 const {BAND_OF}=await import('../src/v1-run-format-index.mjs'),t=atSixteen();t.week(1,weekWith(t,1,t.long.id,fast16(t)));
 const rv=t.review(2,2,'WEEKLY_REVIEW'),straight=F.evaluateProgram(t.p,rv,DEV),shuffled=F.evaluateProgram(t.p,{...rv,actualLedger:[...t.ledger].reverse(),runFormatRecord:[...t.fmt].reverse(),runHistoryRecord:[...t.hist].reverse()},DEV);
 assert.equal(hash(shuffled.runSessions),hash(straight.runSessions));assert.equal(shuffled.action,straight.action);
 // The hook, with nothing to say: the same sessions. With an effective threshold band: the selector reads it, and shows the band it read.
 const same=F.evaluateProgram(t.p,rv,{...DEV,[BAND_OF]:({band})=>band});assert.equal(hash(same.runSessions),hash(straight.runSessions));
 const refused=F.evaluateProgram(t.p,rv,{...DEV,[BAND_OF]:()=>({status:'AVAILABLE',domain:'OTHER',fastSecondsPerKm:100,slowSecondsPerKm:110})});assert.equal(hash(refused.runSessions),hash(straight.runSessions),'a band of another domain is no band: V1RC\'s stands');
 const u=timeline(sixteen());for(let w=0;w<4;w++)u.week(w,weekWith(u,w,null,null));
 const q=u.runsOf(4,s=>s.role==='QUALITY')[0],before=u.runs[q.id],work=r=>r.blocks.flatMap(b=>b.steps).find(s=>s.kind==='WORK');
 const moved=F.evaluateProgram(u.p,u.review(4,0,'WEEKLY_REVIEW'),{...DEV,[BAND_OF]:({domain,band})=>domain==='THRESHOLD_CONTROLLED'?{...band,fastSecondsPerKm:band.fastSecondsPerKm-10,slowSecondsPerKm:band.slowSecondsPerKm-10}:band}).runSessions[q.id];
 assert.equal(before.expression,'NATIVE');assert.equal(work(moved).intensity.pace.fastSecondsPerKm,work(before).intensity.pace.fastSecondsPerKm-10,'the band the format was sized with is the band it shows');
 assert.notEqual(moved.formatHash,before.formatHash);assert.equal(moved.planning.plannedPrescriptionHash,before.planning.plannedPrescriptionHash,'the dose is untouched');
});
test('I10, V6: every file the two earlier freezes bind is byte-identical here except the one amended file; its base is the recorded bytes and its diff is the reader alone',async()=>{
 const fs=await import('node:fs'),{createHash}=await import('node:crypto'),{execFileSync}=await import('node:child_process'),{fileURLToPath}=await import('node:url');
 const root=fileURLToPath(new URL('../../',import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex'),read=f=>JSON.parse(fs.readFileSync(root+f,'utf8')),AMENDED='CoachingCore/src/r6-adaptation.mjs';
 const v1=read('CoachingCore/v1/RUNTIME_FREEZE_V1_1.json'),rc=read('CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json'),changed=rec=>Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(root+f)||sha(fs.readFileSync(root+f))!==h).map(([f])=>f);
 // The historical test of the calibration extension (v1rc-calibration.test.mjs, "COACHINGCORE-V1-FREEZE-1 is preserved") names this one file on this
 // line, by design: it is not edited, and its own snapshot (c8104c1) is where it stays green (Founder governance rule of 2026-11-13).
 assert.deepEqual(changed(v1),[AMENDED]);assert.deepEqual(changed(rc),[],'the 30 files of the calibration freeze are untouched');assert.equal(Object.keys(v1.files).length,198);
 assert.equal(sha(execFileSync('git',['show',`${rc.commit}:${AMENDED}`],{cwd:root,maxBuffer:1<<28})),v1.files[AMENDED],'the amendment starts from exactly the bytes the first freeze recorded');
 const diff=execFileSync('git',['diff','--no-color','--no-ext-diff','-U0',rc.commit,'--',AMENDED],{cwd:root,encoding:'utf8',maxBuffer:1<<28}).split('\n'),plus=diff.filter(l=>l.startsWith('+')&&!l.startsWith('+++')),minus=diff.filter(l=>l.startsWith('-')&&!l.startsWith('---'));
 assert.equal(minus.length,10);assert.ok(plus.length<=24,String(plus.length));
 // Every changed line is the reader: its declaration, its comment, or the argument that carries it. Nothing else of the engine moved.
 for(const l of plus)assert.ok(/READS_COMPLETION|READ_STATUSES|completionRead|\breads\b/.test(l)||/^\+\s*(\/\*\*|\*)/.test(l),l.slice(0,120));
 for(const l of minus){const twin=plus.find(p=>p.slice(1).replace(/,options\[READS_COMPLETION\]|,reads:options\[READS_COMPLETION\]|,reads:ctx\.reads|,reads=null|,reads\b/g,'').replace('const read=completionRead(reads,o,s),complete=read?read===\'DISTANCE\':','const complete=')===l.slice(1));assert.ok(twin,'a removed line returns with only the reader added: '+l.slice(0,100));}
});
