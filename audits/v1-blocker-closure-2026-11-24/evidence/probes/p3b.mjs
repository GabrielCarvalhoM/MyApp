// SEC-SC judge probe (items 1, 3, 4 extra shapes). Usage: node p3.mjs <extract root>. Synthetic athletes only.
import {pathToFileURL} from 'node:url';
const root=process.argv[2];
const {normalizeObservations}=await import(pathToFileURL(root+'/CoachingCore/src/r6-provenance.mjs').href);
const {restartIntake,readReadiness,readinessFact,READINESS_SIGNS}=await import(pathToFileURL(root+'/CoachingCore/src/v1-f08.mjs').href);
const ATH='ath-sec3',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10),json=x=>JSON.parse(JSON.stringify(x));
const N=(batch,asOf,prior)=>normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,...(prior?{prior:json(prior)}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const dx=shift(DAY,-5),T1=dx+'T13:00:00Z',T2=dx+'T15:00:00Z',T3=dx+'T20:00:00Z',T4=shift(DAY,-1)+'T09:00:00Z';
const WATCH=act=>({source:{provider:'HEALTHKIT',activityId:act,quality:'WEARABLE_FULL'},canonicalActivityId:act});
const rep=(id,sid,d,extra={})=>({athleteId:ATH,sessionId:sid,eventId:id,observedAt:d+'T09:00:00Z',reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=(at,id)=>readinessFact({athleteId:ATH},{event:{id},readiness:{}},at,READY,null);
const R0=ready(shift(dx,-3)+'T08:00:00.000Z','r0'),RL=ready(shift(DAY,-1)+'T08:00:00.000Z','rl');
const run=(record,day=DAY)=>restartIntake({intake:{asOf:day,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record:json(record),asOf:day,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});
const sb=(record,day)=>{const r=run(record,day);if(r.status!=='READY')return r.status;const p=r.facts.pause;return p===null?'NO_PAUSE':p.readinessDeclared===true?'DECLARED':'ASK';};
const summary=(record,day)=>{const r=run(record,day);return r.status!=='READY'?r.status:{sb1:sb(record,day),pause:r.facts.pause&&{w:r.facts.pause.weeks,run:r.facts.pause.bySportDays.RUN},last:r.carried.priorCapacity.lastExecutedDay,recent:r.intake.athlete.recent};};
const live=(r,sid='sx')=>r.filter(o=>o.sessionId===sid&&o.superseded!==true&&!o.fact).map(o=>`${o.eventId}${o.conflicted?'[C:'+(o.provenance?.conflict??'')+']':''}{${Object.keys(o.provenance?.parts??{}).length}}`).join(' ');
const out={};
const STOP=(stop={reason:'SYMPTOM'},m=12)=>({completed:false,minutes:m,stop});
const fix=(row,id,extra={},when=dx+'T16:00:00Z')=>({...row,eventId:id,correctionOf:row.eventId,correctedAt:when,reportedAt:when,...extra});
// A. admitted stop (no dispute) after R0, corrected away by various speakers / shapes
const S=rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP()});
const lS=rec(N([S],T1));
out.A0_admittedStop=sb([R0,...lS]);
for(const [k,c] of Object.entries({
 A1_athleteToDone40:fix(S,'S2',{actual:{completed:true,minutes:40}}),
 A2_athleteToNotDone:fix(S,'S2',{actual:{completed:false,minutes:0}}),
 A3_unknownToNotDone:fix(S,'S2',{actual:{completed:false,minutes:0},source:{provider:'OTHER',quality:'UNVERIFIED'}}),
 A4_noSourceToNotDone:(()=>{const c=fix(S,'S2',{actual:{completed:false,minutes:0}});delete c.source;return c;})(),
 A5_deviceToNotDone:fix(S,'S2',{actual:{completed:false,minutes:0},...WATCH('hk-q')}),
 A6_stopFalse:fix(S,'S2',{actual:{completed:false,minutes:0,stop:false}}),
 A7_stopNull:fix(S,'S2',{actual:{completed:false,minutes:0,stop:null}}),
})){const n=N([c],T3,lS),r=rec(n);out[k]={excl:n.excluded.map(e=>e.reason),live:live(r),sb1:sb([R0,...r]),rt:sb([R0,...rec(N([],T4,json(rec(N([],T3,r)))))]),laterDecl:sb([R0,RL,...r])};}
// chained corrections: S -> S2 -> S3 (all not done) by the athlete
{const r1=rec(N([fix(S,'S2',{actual:{completed:false,minutes:0}})],T3,lS)),c3={...fix(S,'S3',{actual:{completed:false,minutes:0}},dx+'T17:00:00Z'),correctionOf:'S2'},r2=rec(N([c3],T4,r1));out.A8_chainedTwice={live:live(r2),sb1:sb([R0,...r2])};}
// B. stop value shapes, in force, after R0
for(const [k,st] of Object.entries({B1_time:{reason:'TIME'},B2_weather:{reason:'WEATHER'},B3_true:true,B4_emptyObj:{},B5_string:'x',B6_zero:0,B7_false:false,B8_null:null}))
 {const n=N([rep('S'+k,'sb'+k,dx,{actual:{completed:false,minutes:0,stop:st}})],T1),r=rec(n);out[k]={excl:n.excluded.map(e=>e.reason),sb1:sb([R0,...r])};}
// C. refused correction / replays
{const bad={...fix(S,'S2',{actual:{completed:false,minutes:0}}),correctionOf:'nope'};const n=N([bad],T3,lS);out.C1_refusedCorrection={excl:n.excluded.map(e=>e.reason),sb1:sb([R0,...rec(n)])};
 const n2=N([S,S],T2,lS);out.C2_replay={excl:n2.excluded.map(e=>e.reason),dup:n2.duplicates.map(d=>d.reason),sb1:sb([R0,...rec(n2)])};
 out.C3_earlierDeclReplayedOnly=sb([R0,ready(shift(dx,-3)+'T08:00:00.000Z','r0b'),...lS]);
 out.C4_laterDeclThenNewStop=sb([R0,RL,...lS,...rec(N([rep('S7','s7',shift(DAY,-1),{observedAt:shift(DAY,-1)+'T10:00:00Z',reportedAt:shift(DAY,-1)+'T11:00:00Z',actual:STOP()})],shift(DAY,-1)+'T12:00:00Z'))]);
 out.C5_laterDeclAnswers=sb([R0,RL,...lS]);}
// D. over-asking
{const D=rep('D','sd',dx,{reportedAt:dx+'T11:00:00Z'}),lD=rec(N([D],T1));out.D0_doneAfterDecl=sb([R0,...lD]);
 out.D1_doneRetractedByOwnSpeaker=sb([R0,...rec(N([fix(D,'D2',{actual:{completed:false,minutes:0}})],T3,lD))]);
 out.D2_doneRetractedByUnknown=sb([R0,...rec(N([fix(D,'D2',{actual:{completed:false,minutes:0},source:{provider:'OTHER',quality:'UNVERIFIED'}})],T3,lD))]);
 const pre=shift(dx,-5),SP=rep('SP','sp',pre,{reportedAt:pre+'T12:00:00Z',actual:STOP()}),lp=rec(N([SP],pre+'T13:00:00Z'));out.D3_preDeclStop=sb([R0,...lp]);
 out.D4_preDeclStopCorrectedAfterDecl=sb([R0,...rec(N([fix(SP,'SP2',{actual:{completed:false,minutes:0}},dx+'T10:00:00Z')],T1,lp))]);}
// E. clinical holds independent
{const clin={athleteId:ATH,fact:'INTERRUPTION_DECLARED',eventId:'int-1',declaredAt:shift(DAY,-1)+'T09:00:00.000Z',interruption:{reasonCategory:'INJURY'}};
 out.E1_stopPlusClinicalAfterLaterDecl=run([R0,RL,...lS,clin]).status;out.E2_clinicalBeforeLaterDecl_noStop=run([R0,{...clin,declaredAt:shift(DAY,-2)+'T09:00:00.000Z'},RL]).status;}
// F. fabrication: integrity-refused stops never reach the record
{const Z=rep('Z','sz',shift(dx,-4),{...WATCH('hk-z'),reportedAt:shift(dx,-4)+'T12:00:00Z'}),N0=rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0}}),base=rec(N([N0,Z],T1));
 const tries={F1_foreign:{...S,athleteId:'other'},F2_badMinutes:{...S,actual:STOP({reason:'SYMPTOM'},-1)},F3_idReuseOfN:{...S,eventId:'N'},F4_borrowedActivity:{...S,...WATCH('hk-z')},F5_future:{...S,reportedAt:shift(DAY,3)+'T10:00:00Z'},F6_beforeObservation:{...S,reportedAt:dx+'T08:00:00Z'},F7_selfFlaggedBadChain:{...S,conflicted:true,correctionOf:'nothing',correctedAt:dx+'T12:30:00Z'}};
 out.F0_baseline=sb([R0,...base]);for(const [k,o] of Object.entries(tries)){const n=N([o],T2,base),r=rec(n);out[k]={excl:n.excluded.map(e=>e.reason),live:live(r),sb1:sb([R0,...r])};}}
// G. same-day stop: no pause read; voice dating by the row (SEC-O-O1-2)
{const today=rep('ST','st',DAY,{observedAt:DAY+'T07:00:00Z',reportedAt:DAY+'T08:00:00Z',actual:STOP()});out.G1_sameDayStop=sb([R0,...rec(N([today],DAY+'T09:00:00Z'))]);
 const pre=shift(dx,-5),NP=rep('NP','sq',pre,{reportedAt:pre+'T11:00:00Z',actual:{completed:false,minutes:0}}),lq=rec(N([NP],pre+'T13:00:00Z'));
 const n=N([rep('SQ','sq',dx,{reportedAt:dx+'T12:00:00Z',actual:STOP(),response:{...U,recovery:'ADVERSE'}})],T2,lq);out.G2_stopObservedAfterDeclOnRowObservedBefore={excl:n.excluded.map(e=>e.eventId+':'+e.reason),live:live(rec(n),'sq'),sb1:sb([R0,...rec(n)])};}
// H. C-O1-2 security: forged provenance.conflict on an incoming self-flagged report, then a second "done" voice
{const X={...rep('X','sh',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:true,minutes:40}}),conflicted:true,provenance:{conflict:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS',parts:{a:{actual:{completed:true,minutes:300}},b:{actual:{completed:true,minutes:300}}}}};
 const n1=N([X],T1),r1=rec(n1);out.H1_forgedFlagAlone={live:live(r1,'sh'),partsStored:JSON.stringify(r1.find(o=>o.sessionId==='sh')?.provenance?.parts??null),s:summary([R0,...r1])};
 const r2=rec(N([rep('Y','sh',dx,{reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:300}})],T2,r1));out.H2_forgedFlagPlusDone={live:live(r2,'sh'),s:summary([R0,...r2])};
 const h=rec(N([rep('X','sh',dx,{reportedAt:dx+'T11:00:00Z'}),rep('Y','sh',dx,{reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:300}})],T2));out.H3_honestTwoReports={live:live(h,'sh'),s:summary([R0,...h])};
 const hs=rec(N([rep('Y2','sh',dx,{reportedAt:dx+'T12:00:00Z',actual:STOP()})],T3,r2));out.H4_forgedFlagRowThenStop={live:live(hs,'sh'),s:summary([R0,...hs])};
 const st=rec(N([{...X,actual:STOP(),eventId:'X3',sessionId:'si'}],T1));out.H5_forgedFlagOnStopRow={live:live(st,'si'),s:summary([R0,...st])};}
// I. SEC-O1-03 cap: conflicting "not done" voices, then a genuine "done" (the other SB-1 signal, SEC_O1_R1 item 1)
for(const K of [3,20]){
 const base=rec(N([rep('B0','sk',dx,{reportedAt:dx+'T10:00:00Z',actual:{completed:false,minutes:0},response:{...U,performance:'UNDER'}})],T1));
 const spam=Array.from({length:K},(_,i)=>rep('k'+i,'sk',dx,{reportedAt:dx+'T11:'+String(i%60).padStart(2,'0')+':00Z',actual:{completed:false,minutes:0},response:{...U,performance:i%2?'OVER':'UNDER'},source:{provider:'OTHER',quality:'UNVERIFIED'}}));
 const r1=rec(N(spam,T2,base)),r2=N([rep('G','sk',dx,{reportedAt:dx+'T14:00:00Z',actual:{completed:true,minutes:40}})],T3,r1);
 out['I_cap_K'+K]={liveBefore:live(r1,'sk'),excl:r2.excluded.map(e=>e.eventId+':'+e.reason),live:live(rec(r2),'sk'),sb1:sb([R0,...rec(r2)])};
}
// J. stop spam, replay, and agreeing-merge growth (O-SC-1)
{const dev=rep('D','sj',dx,{reportedAt:dx+'T11:00:00Z',...WATCH('hk-j')}),ld=rec(N([dev],T1));
 const spam=Array.from({length:2000},(_,i)=>rep('js'+i,'sj',dx,{reportedAt:dx+'T12:30:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:false,minutes:i%9,stop:{reason:'SYMPTOM'},pad:'x'.repeat(1000)}}));
 let t=Date.now();const n=N(spam,T2,ld),r=rec(n);out.J1_stopSpam2000={ms:Date.now()-t,bytes:JSON.stringify(r).length,parts:Object.keys(r.find(o=>o.sessionId==='sj'&&o.superseded!==true).provenance.parts).length,excluded:n.excluded.length,sb1:sb([R0,...r])};
 const n2=N(spam,T3,r);out.J2_replaySpam={bytesSame:JSON.stringify(rec(n2))===JSON.stringify(r),excluded:n2.excluded.length,dup:n2.duplicates.length};
 const agree=Array.from({length:2000},(_,i)=>rep('ag'+i,'sa',dx,{reportedAt:dx+'T12:30:00Z',actual:{completed:true,minutes:40,pad:'x'.repeat(1000)}}));
 t=Date.now();const na=N(agree,T2),ra=rec(na);const row=ra.find(o=>o.sessionId==='sa'&&o.superseded!==true);out.J3_agreeing2000={ms:Date.now()-t,bytes:JSON.stringify(ra).length,parts:Object.keys(row?.provenance?.parts??{}).length,merged:(row?.provenance?.mergedSourceIds??[]).length,dup:na.duplicates.length,excl:na.excluded.length,conflicted:!!row?.conflicted};}
console.log(JSON.stringify(out,null,1));
// extra shapes
{const out2={};
 const h=rec(N([rep('X','sh',dx,{reportedAt:dx+'T11:00:00Z'}),rep('Y','sh',dx,{reportedAt:dx+'T12:00:00Z'})],T2));out2.H3b_honestAgreeing={live:live(h,'sh'),s:summary([R0,...h])};
 // moved session: "not done" on its day before the declaration, then done late after it with a stop, corrected (not a fresh report)
 const pre=shift(dx,-5),NP=rep('NP','sq',pre,{reportedAt:pre+'T11:00:00Z',actual:{completed:false,minutes:0}}),lq=rec(N([NP],pre+'T13:00:00Z'));
 const c=N([{...NP,eventId:'NP2',correctionOf:'NP',observedAt:dx+'T09:00:00Z',correctedAt:dx+'T12:00:00Z',reportedAt:dx+'T12:00:00Z',actual:STOP()}],T2,lq);out2.G3_correctionMovesObservedAfterDecl={excl:c.excluded.map(e=>e.eventId+':'+e.reason),live:live(rec(c),'sq'),sb1:sb([R0,...rec(c)])};
 const d=N([rep('DQ','sq',dx,{reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:40}})],T2,lq);out2.G4_doneObservedAfterDeclOnRowObservedBefore={excl:d.excluded.map(e=>e.eventId+':'+e.reason),live:live(rec(d),'sq'),sb1:sb([R0,...rec(d)])};
 console.log('EXTRA '+JSON.stringify(out2));}
