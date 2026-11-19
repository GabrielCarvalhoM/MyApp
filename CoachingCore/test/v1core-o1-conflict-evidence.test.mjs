// O-1 Conflict Evidence & Safety Policy (Founder mission of 2026-11-19, after COACHINGCORE-V1-CORE-SAFETY-FREEZE-5): SSCTR-NCC-01, SEC-NCC-02.
// Synthetic athletes only.
// A report refused only because it disputes the row in force for its execution (a head-on conflict), or because that execution is already in
// dispute, is kept as a voice (`provenance.parts`) of the flagged row: never merged into its amount, never in dose. So:
// - SSCTR-NCC-01: a later correction resolves the dispute only when it agrees with every voice kept, the refused one included; who spoke first
//   does not decide who resolves it.
// - SEC-NCC-02: f08's readiness question (SB-1) hears that voice: a refused report saying a session took place after a readiness declaration
//   re-opens the question (ASK), as an admitted one does. A report refused for integrity (another athlete, an invalid time or measure, an event
//   id reused with other facts, a device activity of another session, an invalid correction chain) is never kept.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {restartIntake,readReadiness,readinessFact,READINESS_SIGNS} from '../src/v1-f08.mjs';

const ATH='ath-o1',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const json=x=>JSON.parse(JSON.stringify(x));
const N=(batch,asOf,prior)=>normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,...(prior?{prior:json(prior)}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const dx=shift(DAY,-5),T1=dx+'T13:00:00Z',T2=dx+'T15:00:00Z',T3=dx+'T20:00:00Z',T4=shift(DAY,-1)+'T09:00:00Z';
const WATCH=act=>({source:{provider:'HEALTHKIT',activityId:act,quality:'WEARABLE_FULL'},canonicalActivityId:act});
const rep=(id,sid,d,extra={})=>({athleteId:ATH,...(sid?{sessionId:sid}:{}),eventId:id,observedAt:d+'T09:00:00Z',reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const fix=(row,extra={},when=dx+'T14:00:00Z')=>({...row,correctionOf:row.eventId,correctedAt:when,reportedAt:when,...extra});
const live=(r,sid)=>r.filter(o=>o.sessionId===sid&&o.superseded!==true&&!o.fact);
const voices=o=>Object.keys(o?.provenance?.parts??{}).sort();
/** What is in force for a session: its rows, amount, flag and voices; and whether its identity is quarantined. */
const held=(n,sid='sx')=>({live:live(n.accepted,sid).map(o=>({eventId:o.eventId,actual:o.actual,conflicted:o.conflicted===true,voices:voices(o)})),q:n.quarantinedIdentities.includes('session:'+sid)});
const reread=(r,asOf=T4)=>N([],asOf,r);
const STOP={completed:false,minutes:12,stop:{reason:'SYMPTOM'}},ADV={...U,recovery:'ADVERSE'};
const DEVICE=(id='X',extra={})=>rep(id,'sx',dx,{reportedAt:dx+'T11:00:00Z',...WATCH('hk-x'),...extra});
const ATHLETE_STOP=(id='A',extra={})=>rep(id,'sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP,response:ADV,...extra});
const RESYNC=(of='X',extra={})=>({...DEVICE('X2'),correctionOf:of,correctedAt:dx+'T14:30:00Z',reportedAt:dx+'T14:30:00Z',...extra});
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=at=>readinessFact({athleteId:ATH},{event:{id:'ready-o1'},readiness:{}},at,READY,null);
/** f08 restart: whether the readiness declaration still stands in for the stops on record (true), or the question is asked (undefined). */
const declared=record=>restartIntake({intake:{asOf:DAY,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record:json(record),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH}).facts?.pause?.readinessDeclared;
const pause=record=>restartIntake({intake:{asOf:DAY,athlete:{id:ATH}},record:json(record),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH}).facts?.pause;

// ---------- SSCTR-NCC-01: who resolves a head-on dispute ----------
test('SSCTR-NCC-01 (scenario 21): the device reports the run, the athlete says they stopped for a symptom (refused), the device re-syncs: the dispute stays',()=>{
 const l1=rec(N([DEVICE()],T1)),n2=N([ATHLETE_STOP()],T2,l1);
 assert.deepEqual(n2.excluded.map(e=>e.eventId+':'+e.reason),['A:DUPLICATE_CONFLICT_QUARANTINED'],'the athlete\'s report is still refused for sporting use');
 assert.deepEqual(held(n2),{live:[{eventId:'X',actual:{completed:true,minutes:40},conflicted:true,voices:['A','X']}],q:true},'its voice is kept on the flagged row; the amount is the device\'s, never merged');
 const n3=N([RESYNC()],T3,rec(n2));
 assert.deepEqual(n3.excluded,[],'the re-sync is a valid correction');
 assert.deepEqual(held(n3),{live:[{eventId:'X2',actual:{completed:true,minutes:40},conflicted:true,voices:['A','X2']}],q:true},'FREEZE-5: X2 in force, unflagged, the dispute resolved by the kept speaker');
 for(const r of [reread(rec(n3)),reread(json(rec(reread(rec(n3)))))])assert.deepEqual(held(r),held(n3),'a re-read and a JSON round trip keep it');
});
test('SSCTR-NCC-01 (S21b): the athlete first, the device refused, the device re-syncs: the same dispute as when the device spoke first',()=>{
 const l1=rec(N([ATHLETE_STOP()],T1)),n2=N([DEVICE()],T2,l1),n3=N([RESYNC()],T3,rec(n2));
 assert.deepEqual(n3.excluded,[],'FREEZE-5: INVALID_CORRECTION_CHAIN, the device report having left the record');
 assert.deepEqual(held(n2).live.map(o=>[o.eventId,o.conflicted,o.voices]),[['A',true,['A','X']]],'before the re-sync: the athlete\'s row, flagged, with the device\'s voice');
 // After the re-sync the row in force is the correction, flagged, with the athlete's voice: exactly what the device-first order gives.
 const h=held(n3),other=held(N([RESYNC()],T3,rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1))))));
 assert.deepEqual(h,{live:[{eventId:'X2',actual:{completed:true,minutes:40},conflicted:true,voices:['A','X2']}],q:true});
 assert.deepEqual(h,other,'who spoke first does not decide the outcome');
});
test('SSCTR-NCC-01: one review or three, any order of the batch: the same dispute',()=>{
 const want=held(N([RESYNC()],T3,rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1))))));
 for(const batch of [[DEVICE(),ATHLETE_STOP(),RESYNC()],[RESYNC(),ATHLETE_STOP(),DEVICE()],[ATHLETE_STOP(),RESYNC(),DEVICE()]]){
  const h=held(N(batch,T3));assert.deepEqual([h.q,h.live.length,h.live[0].conflicted,h.live[0].voices],[want.q,1,true,want.live[0].voices]);
 }
});
test('SSCTR-NCC-01: the dispute is resolved by the refused speaker (the athlete corrects their own report), or by the kept speaker agreeing with them',()=>{
 const l2=rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1))));
 // The athlete's own correction: the whole run after all.
 const a=N([fix(ATHLETE_STOP(),{eventId:'A2',actual:{completed:true,minutes:40},response:U},dx+'T16:00:00Z')],T3,l2);
 assert.deepEqual(a.excluded,[]);
 assert.deepEqual(held(a),{live:[{eventId:'A2',actual:{completed:true,minutes:40},conflicted:false,voices:['A2','X']}],q:false},'resolved: both voices agree');
 // The device re-syncs to the stop the athlete reported.
 const d=N([RESYNC('X',{actual:{completed:false,minutes:12}})],T3,l2);
 assert.deepEqual(d.excluded,[]);
 const h=held(d);assert.deepEqual([h.q,h.live.length,h.live[0].conflicted,h.live[0].voices,h.live[0].actual.completed,h.live[0].actual.minutes],[false,1,false,['A','X2'],false,12],'resolved: both voices agree, the stop kept');
 assert.deepEqual(held(reread(rec(d))),h,'and stays resolved on a re-read');
});
test('SSCTR-NCC-01: a correction that resolves only part of the dispute, a refused correction, a replay and a late re-sync of the same report: the dispute stays, nothing new is kept',()=>{
 const l2=rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1)))),before=held(reread(l2));
 // Partial: the device lowers its minutes but still says the run was completed.
 const part=N([RESYNC('X',{actual:{completed:true,minutes:14}})],T3,l2);
 assert.deepEqual([held(part).q,held(part).live.map(o=>o.conflicted)],[true,[true]]);
 // A correction made before the report it names: refused, the record unchanged.
 const early=N([fix(ATHLETE_STOP(),{eventId:'A0',actual:{completed:true,minutes:40}},dx+'T12:00:00Z')],T3,l2);
 assert.deepEqual(early.excluded.map(e=>e.reason),['INVALID_CORRECTION_CHAIN']);assert.deepEqual(held(early),before);
 // Every report sent again: replays; the stored record is unchanged.
 const again=N([DEVICE(),ATHLETE_STOP()],T3,l2);
 assert.deepEqual(again.duplicates.map(x=>x.eventId+':'+x.reason).sort(),['A:EXACT_REPLAY','X:EXACT_REPLAY']);
 assert.deepEqual(rec(again),rec(reread(l2,T3)),'no new voice, no new row');
});
test('SSCTR-NCC-01: a strength session disputed head-on keeps both voices too',()=>{
 const ctx={context:{sport:'STRENGTH',sessionType:'STRENGTH_FULL'}};
 const n=N([rep('S2','sst',dx,{...ctx,reportedAt:dx+'T12:30:00Z',actual:{completed:false,minutes:10,stop:{reason:'SYMPTOM'}}})],T2,rec(N([rep('S1','sst',dx,{...ctx,reportedAt:dx+'T11:00:00Z',actual:{completed:true,minutes:45}})],T1)));
 assert.deepEqual(held(n,'sst'),{live:[{eventId:'S1',actual:{completed:true,minutes:45},conflicted:true,voices:['S1','S2']}],q:true});
});

// ---------- SEC-NCC-02: SB-1 hears a refused report's stop ----------
const afterReady=()=>{const R=ready(shift(dx,-3)+'T08:00:00.000Z'),N0=rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0}});return {R,l1:rec(N([N0],T1))};};
test('SEC-NCC-02 (e7): after a readiness declaration, a "not done" in force and a late symptom stop that conflicts with it: the readiness question is asked',()=>{
 const {R,l1}=afterReady();
 assert.equal(declared([R,...l1]),true,'control: a "not done" alone is no training after the declaration');
 const n=N([rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP,response:ADV})],T2,l1);
 assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['S:DUPLICATE_CONFLICT_QUARANTINED']);
 assert.equal(declared([R,...rec(n)]),undefined,'FREEZE-5: true, SB-1 skipped');
 for(const r of [reread(rec(n)),reread(json(rec(reread(rec(n)))))])assert.equal(declared([R,...rec(r)]),undefined,'after a re-read and a JSON round trip');
 // A quantitative resolution never answers the question: the athlete confirms the stop, and the stop is still training after the declaration.
 const resolved=N([fix(rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0}}),{eventId:'N2',actual:{completed:false,minutes:12}},dx+'T16:00:00Z')],T3,rec(n));
 assert.equal(held(resolved).live[0].conflicted,false,'the dispute is resolved');
 assert.equal(declared([R,...rec(resolved)]),undefined,'the question is still asked');
});
test('SEC-NCC-02: a declaration made after the disputed session answers it (no permanent block); an admitted stop is asked as before',()=>{
 const {l1}=afterReady(),n=N([rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP,response:ADV})],T2,l1);
 assert.equal(declared([ready(shift(DAY,-1)+'T08:00:00.000Z'),...rec(n)]),true,'the later declaration stands');
 const {R}=afterReady();assert.equal(declared([R,...rec(N([rep('S','sx',dx,{actual:STOP,response:ADV})],T1))]),undefined,'admitted stop: asked');
});
test('SEC-NCC-02 / S3: a report refused for integrity is never kept, and cannot open the question nor add a voice',()=>{
 const {R,l1}=afterReady(),S=extra=>rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP,response:ADV,...extra});
 const cases={
  'another athlete':S({athleteId:'someone-else'}),
  'invalid measure':S({actual:{completed:false,minutes:-3}}),
  'future report':S({reportedAt:shift(DAY,30)+'T00:00:00Z'}),
  'report before the run':S({reportedAt:dx+'T08:00:00Z'}),
  'event id reused with other facts':rep('N','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP}),
  'invalid correction chain':S({correctionOf:'nothing',correctedAt:dx+'T12:30:00Z'}),
 };
 for(const [label,o] of Object.entries(cases)){
  const n=N([o],T2,l1);
  assert.equal(n.excluded.length,1,label);
  assert.deepEqual(rec(n).flatMap(voices),rec(reread(l1,T2)).flatMap(voices),label+': no voice kept');
  assert.equal(declared([R,...rec(n)]),true,label+': the declaration stands');
 }
 // A device activity another session holds: borrowed evidence, never a voice of this execution.
 const other=rec(N([rep('Z','sz',shift(dx,-1),WATCH('hk-z'))],T1,l1)),b=N([S(WATCH('hk-z'))],T2,other);
 assert.deepEqual(b.excluded.map(e=>e.reason),['ACTIVITY_BOUND_TO_TWO_SESSIONS']);
 assert.ok(!rec(b).some(o=>voices(o).includes('S')),'not kept');
});
test('SEC-NCC-02: a report on an execution already in dispute is kept too (the third voice), and the readiness question hears it',()=>{
 const {R}=afterReady();
 // Two "not done" reports that dispute only the recovery: a dispute in which no voice says the session took place.
 const N1=rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0},response:{...U,recovery:'COMPATIBLE'}});
 const N2=rep('M','sx',dx,{reportedAt:dx+'T11:30:00Z',actual:{completed:false,minutes:0},response:ADV});
 const l=rec(N([N1,N2],T1));assert.equal(declared([R,...l]),true,'control: no voice says it took place');
 const n=N([rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP})],T2,l);
 assert.deepEqual(n.excluded.map(e=>e.reason),['IDENTITY_QUARANTINED_BY_CONFLICT']);
 assert.deepEqual(held(n).live.map(o=>[o.conflicted,o.voices]),[[true,['M','N','S']]]);
 assert.equal(declared([R,...rec(n)]),undefined,'FREEZE-5: true');
});
test('O-1: a kept voice is never dose: the flagged row\'s amount is the first-admitted report\'s, and the restart pause reads no occurrence from a head-on dispute',()=>{
 const l2=rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1))));
 const row=live(l2,'sx')[0];
 assert.deepEqual([row.conflicted,row.actual],[true,{completed:true,minutes:40}]);
 assert.deepEqual(row.provenance.mergedSourceIds,undefined,'no report merged into it');
 // The pause reads the same as on FREEZE-5 (a direct conflict is not an occurrence), so it errs long, never short.
 assert.deepEqual(pause(l2),pause(rec(N([DEVICE({actual:{completed:true,minutes:40}})],T1)).map(o=>({...o,conflicted:true,provenance:{...o.provenance,conflict:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'}}))));
});
test('O-1: a record written before this line (a flagged row with one voice) is read as it was; the next head-on report adds its voice',()=>{
 const old=rec(N([DEVICE()],T1)).map(o=>({...o,conflicted:true,provenance:{...o.provenance,conflict:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'}}));
 assert.deepEqual(held(reread(old)),{live:[{eventId:'X',actual:{completed:true,minutes:40},conflicted:true,voices:[]}],q:true});
 // QRE-O1-03(d): the next head-on report on it is kept as a voice (the row's own report becomes its first part).
 assert.deepEqual(held(N([ATHLETE_STOP()],T2,old)),{live:[{eventId:'X',actual:{completed:true,minutes:40},conflicted:true,voices:['A','X']}],q:true});
});
test('SSCTR-NCC-01: while the dispute stands, a correction is its speaker\'s word for all that speaker said; the other speaker\'s voice still has to agree',()=>{
 // The athlete said done and not done (two reports, head-on): the athlete's correction of the row in force settles it, either way.
 const D=rep('D','sx',dx,{reportedAt:dx+'T11:00:00Z'}),ND=rep('ND','sx',dx,{reportedAt:dx+'T11:30:00Z',actual:{completed:false,minutes:0}}),l=rec(N([D,ND],T1));
 assert.deepEqual(held(N([],T1,l)).live.map(o=>[o.eventId,o.conflicted,o.voices]),[['D',true,['D','ND']]]);
 for(const [actual,want] of [[{completed:true,minutes:40},true],[{completed:false,minutes:0},false]]){
  const n=N([fix(D,{eventId:'D2',actual},dx+'T16:00:00Z')],T3,l),h=held(n);
  assert.deepEqual([h.q,h.live.map(o=>[o.eventId,o.conflicted,o.actual.completed,o.voices])],[false,[['D2',false,want,[]]]],'resolved by the athlete: '+want);
 }
 // A device and the athlete: the device's own re-sync never sets the athlete's voice aside (scenario 21), and the athlete's correction never
 // sets the device's aside, whichever row id the client names (the device's row, as the client saw it): it settles the dispute by agreeing.
 const l2=rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1)))),byAthlete=(id,actual)=>({...ATHLETE_STOP(id),correctionOf:'X',correctedAt:dx+'T16:00:00Z',reportedAt:dx+'T16:00:00Z',actual,response:U});
 assert.deepEqual(held(N([byAthlete('A3',{completed:true,minutes:40})],T3,l2)),{live:[{eventId:'A3',actual:{completed:true,minutes:40},conflicted:false,voices:['A3','X']}],q:false},'agrees with the device: settled, both voices kept');
 // SSCTR-RWS-B-01 shape: the device measured 30 minutes, the athlete now says 100. FREEZE-5 settled it only when the client named the device's
 // row (the device's voice then left the record); now it stays in dispute whatever is named and whoever spoke first.
 for(const order of ['device first','athlete first']){
  const D30=DEVICE('X',{actual:{completed:true,minutes:30}}),first=order==='device first'?[D30,ATHLETE_STOP()]:[ATHLETE_STOP(),D30],l=rec(N([first[1]],T2,rec(N([first[0]],T1))));
  for(const of of ['X','A']){const n=N([{...byAthlete('A5',{completed:true,minutes:100}),correctionOf:of}],T3,l);assert.equal(held(n).live[0].conflicted,true,order+', naming '+of);}
 }
 // A third speaker (a report with no known source quality) is nobody's word: never set aside.
 const odd=rec(N([rep('O','sx',dx,{reportedAt:dx+'T12:45:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:5}})],T2,l2));
 const n3=N([fix(ATHLETE_STOP(),{eventId:'A4',actual:{completed:true,minutes:40},response:U},dx+'T16:00:00Z')],T3,odd);
 assert.equal(held(n3).live[0].conflicted,true,'the unknown speaker\'s voice still disagrees');
});
test('P4: while a dispute stands, a correction naming a report the row in force no longer holds as a voice still carries every other speaker\'s voice of that row',()=>{
 // The athlete (A, 40 min) and the device (X, 20 min) dispute; the athlete corrects their own report twice, both times naming A: the first
 // correction (A2, 40) stays in dispute with the device; the second (A3, 40) names A, which A2 replaced and the row in force (A2) no longer holds.
 const A=rep('A','sx',dx,{reportedAt:dx+'T11:00:00Z'}),X=DEVICE('X',{reportedAt:dx+'T11:30:00Z',actual:{completed:true,minutes:20}});
 const l=rec(N([A,X],T1)),a2=rec(N([fix(A,{eventId:'A2'},dx+'T14:30:00Z')],T2,l));
 assert.deepEqual(held(N([],T2,a2)).live.map(o=>[o.eventId,o.conflicted,o.voices]),[['A2',true,['A2','X']]]);
 const n=N([fix(A,{eventId:'A3'},dx+'T16:00:00Z')],T3,a2);
 assert.deepEqual(held(n).live.map(o=>[o.eventId,o.conflicted,o.voices]),[['A3',true,['A3','X']]],'the device\'s 20 minutes still disagree: never retired unheard');
});
test('SEC-O1-01a (cycle 1): while a dispute stands, a correction from an unknown speaker naming a report the row in force no longer holds still carries its other voices; SB-1 still asks',()=>{
 // Security p2: the athlete's "not done" N disputes a device-recorded symptom stop S (kept); the athlete's N2 (naming N) stays disputed with S;
 // then a correction from an unknown source names N, which the row in force (N2) no longer holds.
 const {R}=afterReady(),Nn=rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0}});
 const S=rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP,...WATCH('hk-s')}),l1=rec(N([Nn,S],T1));
 const l2=rec(N([{...Nn,eventId:'N2',correctionOf:'N',correctedAt:dx+'T14:00:00Z',reportedAt:dx+'T14:00:00Z'}],T2,l1));
 assert.deepEqual([held(N([],T2,l2)).live.map(o=>[o.eventId,o.conflicted,o.voices]),declared([R,...l2])],[[['N2',true,['N2','S']]],undefined]);
 const u={...Nn,eventId:'U1',correctionOf:'N',correctedAt:dx+'T16:00:00Z',reportedAt:dx+'T16:00:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'}};
 const n=N([u],T3,l2),h=held(n);
 assert.ok(h.live.length===1&&h.live[0].conflicted&&h.live[0].voices.includes('S'),'24ca2ae: U1{}, S retired unheard: '+JSON.stringify(h));
 assert.equal(declared([R,...rec(n)]),undefined,'24ca2ae: DECLARED');
});
// ---------- QRE-O1-01: the guards of keepVoice, each pinned ----------
test('QRE-O1-01 (M6): a report carrying another session\'s device activity on a disputed execution is never kept, so that session\'s run never leaves the record',()=>{
 const Z=rep('Z','sz',shift(dx,2),{reportedAt:shift(dx,2)+'T12:00:00Z',...WATCH('hk-z')}),X1=rep('X1','sx',dx),X2=rep('X2','sx',dx,{reportedAt:dx+'T13:00:00Z',actual:{completed:false,minutes:0}});
 const l1=rec(N([Z,X1,X2],shift(dx,2)+'T13:00:00Z')),B=rep('B','sx',dx,{reportedAt:dx+'T14:00:00Z',actual:{completed:true,minutes:30},...WATCH('hk-z')});
 const n=N([B],T4,l1);
 assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['B:IDENTITY_QUARANTINED_BY_CONFLICT']);
 assert.ok(!rec(n).some(o=>voices(o).includes('B')),'not kept');
 let cur=rec(n);for(let i=0;i<3;i++){const m=reread(json(cur));assert.deepEqual(live(m.accepted,'sz').map(o=>o.eventId),['Z'],'re-read '+i+': Z stays in force');cur=rec(m);}
});
test('QRE-O1-01 (M7): a voice kept in one review is found by a correction and a replay in that same review, as across reviews',()=>{
 const A2=fix(ATHLETE_STOP(),{eventId:'A2',actual:{completed:true,minutes:40},response:U},dx+'T14:30:00Z');
 const one=N([DEVICE(),ATHLETE_STOP(),A2],T3),split=N([A2],T3,rec(N([ATHLETE_STOP()],T2,rec(N([DEVICE()],T1)))));
 assert.deepEqual(one.excluded.map(e=>e.eventId+':'+e.reason),['A:DUPLICATE_CONFLICT_QUARANTINED'],'the correction finds the kept voice: no INVALID_CORRECTION_CHAIN');
 assert.deepEqual(held(one),held(split));assert.equal(held(one).live[0].conflicted,false,'settled by agreement');
 const again=N([DEVICE(),ATHLETE_STOP(),ATHLETE_STOP()],T2);
 assert.deepEqual(again.duplicates.map(d=>d.eventId+':'+d.reason),['A:EXACT_REPLAY'],'the second copy is a replay of the kept voice');
});
test('QRE-O1-01 (M8): a kept voice\'s device activity is bound to its execution in that same review: another session carrying it is refused, as across reviews',()=>{
 const M=rep('M','sx',dx,{reportedAt:dx+'T11:00:00Z'}),W=rep('W','sx',dx,{reportedAt:dx+'T11:30:00Z',actual:{completed:false,minutes:0},...WATCH('hk-w')}),Y=rep('Y','sy',dx,{reportedAt:dx+'T12:00:00Z',...WATCH('hk-w')});
 const one=N([M,W,Y],T1),split=N([Y],T1,rec(N([M,W],T1)));
 assert.deepEqual(one.excluded.map(e=>e.eventId+':'+e.reason).sort(),['W:DUPLICATE_CONFLICT_QUARANTINED','Y:ACTIVITY_BOUND_TO_TWO_SESSIONS']);
 assert.deepEqual(split.excluded.map(e=>e.eventId+':'+e.reason),['Y:ACTIVITY_BOUND_TO_TWO_SESSIONS']);
 assert.deepEqual(live(one.accepted,'sy'),[],'no row in force for sy borrows the watch activity');
});
