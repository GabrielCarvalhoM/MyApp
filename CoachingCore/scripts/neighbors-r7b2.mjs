// R7-B.2 adversarial neighbor grid (DOMAIN_COACHING_R7-B.2, TASK_CONTRACT §7 G3): the request's neighbors A-F, the K6 and K6b paths, the check after
// the clinical route, and a clinical and a nonclinical case for every class-(b) exit fixed (R7B2-CAND-01, R7B2-CAND-02). Every case runs on this
// tree's runtime and on the predecessor R7B1-FREEZE-2 (commit 146ebb8, extracted from git into a temporary directory), each through its own
// fixtures, and is checked twice: the expected outcome on R7-B.2, and its relation to FREEZE-2, either SAME (status, action, reason, missing
// inputs, proposal, pending reference state) or TO_CLINICAL (FREEZE-2 returned a nonclinical question with no proposal; R7-B.2 returns the
// handler's clinical route with no proposal). Read-only unless given --write, which writes only the report named by --out (default
// r7/b2/NEIGHBORS_R7B2.json).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const PRED=arg('--base','146ebb80c51d302ef3518a61c1cab208c7778632');
const coach=fileURLToPath(new URL('..',import.meta.url)),repo=path.resolve(coach,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7b2-nb-')),tarFile=path.join(tmp,'pred.tar');
const ar=spawnSync('git',['archive','--format=tar','-o',tarFile,PRED,'CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:repo,encoding:'utf8'});
if(ar.status!==0)throw new Error('git archive failed: '+ar.stderr);
const tx=spawnSync('tar',['-xf','pred.tar'],{cwd:tmp,encoding:'utf8'});if(tx.status!==0)throw new Error('tar failed: '+tx.stderr);
const load=async root=>{const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);return {H:await imp('r7/b/fixtures/helpers.mjs'),P:await imp('src/r6-program.mjs')};};
const NOW=await load(repo),BEFORE=await load(tmp);

const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const STALE=/^Training before the interruption that began on \d{4}-\d{2}-\d{2} is now recorded, and the return reported on \d{4}-\d{2}-\d{2} did not read it: confirm that interruption again/;
const PAIN_ROUTE=X=>'Pain, injury, illness or a functional limitation with '+X+' routes to qualified human assessment; no exercise is substituted as a remedy';
const ILLNESS_ROUTE='The interruption reason is clinical or possibly clinical (flu, illness): qualified assessment is needed; no nonclinical return recipe';
const FACTUAL_ASK='The race now falls on a date marked unavailable; confirm whether the race still happens on that date or the new date';
const correctionOf=(o,correctedAt)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:structuredClone(o.actual),response:{...o.response,...BAD}});
const sub=(X,x={})=>({kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...x}});
const ILL={kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reason:'Flu illness',nonclinical:true}};

// ---------- scenarios, built on each runtime through its own fixtures ----------
/** The re-entry week (K6): week 2's day-4 strength session left out of its review; a nonclinical return on day 3 of week 3. */
function reentry({H}){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs}=H,apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
 const t=reviewed({id:'b2-nb',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,2,{keep:s=>s.id!==late.id});
 const rep=addDays(t.p.weeks[3].startDate,3);
 apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 const X=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const at=(x,hour='06:00:00',extra={})=>evaluateProgram(t.p,{...review(t.p,3,{day:4,hour,...x}),actualLedger:t.ledger,...extra},opts);
 return {t,late,lateObs:obs(t.p,late),X,at,apply,recorded:r=>(r.actualLedger??[]).some(o=>o.sessionId===late.id&&!o.superseded),fixes:()=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,`${addDays(t.p.weeks[3].startDate,4)}T05:00:00Z`))};
}
/** A plain program after two reviewed weeks (neighbors E and F). */
function plain({H}){
 const {reviewed,review,evaluateProgram,opts,live}=H,t=reviewed({id:'b2-nb-plain',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2),day=t.p.weeks[2].startDate;
 const X=t.p.weeks[2].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id))[0];
 return {t,X,day,live,at:x=>evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts)};
}
/** R7B2-CAND-02: a recorded nonclinical return, then the same event id again. */
function returned({H}){
 const {reviewed,review,evaluateProgram,opts,addDays}=H,t=reviewed({id:'b2-nb-c02',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first}),ret=evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts);t.ledger=ret.actualLedger??t.ledger;if(ret.proposal)t.p=ret.proposal;
 return {first,again:(interruption,id=r0.event.id)=>{const r=review(t.p,3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption});return evaluateProgram(t.p,{...r,event:{...r.event,id},actualLedger:t.ledger},opts);}};
}
/** R7B2-CAND-01: the factual re-plan's own question on a hash-valid program state (as in the B.2 tests). */
function factual({H,P}){
 const {reviewed,review,evaluateProgram,opts,live}=H;
 const t=reviewed({id:'b2-nb-c01',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'},5),w=5,day=t.p.weeks[w].startDate;
 const race=t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.prescription),p=structuredClone(t.p);
 p.weeks[race.weekIndex].adaptations=[...(p.weeks[race.weekIndex].adaptations??[]),{kind:'UNAVAILABLE_DAY',eventId:'b2-state',asOf:`${day}T05:00:00Z`,asOfLocal:day,past:[],dates:[race.date]}];p.hash=P.programHash(p);
 if(!P.validProgram(p))throw Error('setup: program state invalid');
 const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w-1].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,`${day}T05:00:00Z`));
 const X=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 return {X,at:x=>evaluateProgram(p,{...review(p,w,{day:0,hour:'06:00:00',...x,observations:fixes}),actualLedger:t.ledger},opts)};
}

// ---------- the grid: [id, neighbor, relation to FREEZE-2, run(rt) -> {r, ...facts}, expected on R7-B.2 (r, facts) -> true | reason] ----------
const isClinical=(r,reason=null)=>r.status==='CLINICAL_HUMAN_REQUIRED'&&r.action==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal&&r.referenceState?.pending?.status==='CLINICAL_HUMAN_REQUIRED'&&(reason===null||r.reason===reason);
const isStale=r=>r.status==='ASK'&&STALE.test(r.reason)&&JSON.stringify(r.missingInputs)==='["interruption.episodeId"]'&&!r.proposal&&r.referenceState?.pending?.status!=='CLINICAL_HUMAN_REQUIRED';
const CASES=[];
const re=(id,neighbor,relation,x,expect,{late=true,hour}={})=>CASES.push([id,neighbor,relation,rt=>{const s=reentry(rt),r=s.at({...(typeof x==='function'?x(s.X):x),observations:late?[s.lateObs]:[]},hour);return {r,X:s.X,recorded:s.recorded(r)};},expect]);
// A: late pre-break evidence, no clinical signal -> R7-A's confirmation question, unchanged
re('A1 weekly review + late','A','SAME',{},({r})=>isStale(r));
re('A2 substitution pain:false + late','A','SAME',X=>sub(X,{pain:false,injury:false}),({r})=>isStale(r));
re('A3 substitution unclear pain (maybe) + late','A','SAME',X=>sub(X,{pain:'maybe'}),({r})=>isStale(r));
re('A4 nonclinical discomfort text + late','A','SAME',X=>sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'I just dislike this one'}),({r})=>isStale(r));
// B: a clinical signal, no late evidence -> the existing clinical route, unchanged
re('B1 substitution pain, no late','B','SAME',X=>sub(X,{pain:true}),({r,X})=>isClinical(r,PAIN_ROUTE(X)),{late:false});
re('B2 illness return, no late','B','SAME',ILL,({r})=>isClinical(r,ILLNESS_ROUTE),{late:false});
// C: late evidence + a clinical signal in the re-entry week -> CLINICAL, no proposal, the late evidence kept (K6 rows)
re('C1 substitution pain + late (K6)','C','TO_CLINICAL',X=>sub(X,{pain:true}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C2 substitution injury + late','C','TO_CLINICAL',X=>sub(X,{injury:true}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C3 substitution pain "yes" + late','C','TO_CLINICAL',X=>sub(X,{pain:'yes'}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C4 clinical free text + late','C','TO_CLINICAL',X=>sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'My knee hurts when I squat'}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C5 pain + ladder choice + late (K6)','C','TO_CLINICAL',X=>({...sub(X,{pain:true}),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C6 pain + graduation decline + late','C','TO_CLINICAL',X=>({...sub(X,{pain:true}),choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C7 pain + unrecognised choice + late (K6)','C','TO_CLINICAL',X=>({...sub(X,{pain:true}),choices:[{type:'LADDER_JUMP'}]}),({r,X,recorded})=>isClinical(r,PAIN_ROUTE(X))&&recorded);
re('C8 illness return + late','C','SAME',ILL,({r,recorded})=>isClinical(r,ILLNESS_ROUTE)&&recorded);
CASES.push(['C9 two steps: late report alone, then pain only (K6b)','C','TO_CLINICAL',rt=>{const s=reentry(rt),sync=s.apply(s.t,s.at({observations:[s.lateObs]},'05:00:00'));const r=s.at({...sub(s.X,{pain:true}),observations:[]});return {r,X:s.X,syncStale:isStale(sync),recorded:s.recorded(r)};},({r,X,syncStale,recorded})=>syncStale&&isClinical(r,PAIN_ROUTE(X))&&recorded]);
// After the clinical route: a later review with no signal and no pending clinical state still gets the late-evidence question; with the clinical
// reference state it stays clinical (the sticky rule, unchanged).
CASES.push(['AC1 after the clinical route: later review, no signal, no pending state','AFTER','SAME',rt=>{const s=reentry(rt);s.apply(s.t,s.at({...sub(s.X,{pain:true}),observations:[s.lateObs]},'05:00:00'));return {r:s.at({observations:[]})};},({r})=>isStale(r)]);
CASES.push(['AC2 after the clinical route: later review carrying its reference state','AFTER','TO_CLINICAL',rt=>{const s=reentry(rt),p=s.apply(s.t,s.at({...sub(s.X,{pain:true}),observations:[s.lateObs]},'05:00:00'));return {r:s.at({observations:[]},'06:00:00',{referenceState:p.referenceState}),own:true};},({r})=>r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal]);
// D: a nonclinical factual correction + late evidence -> never clinical, unchanged
CASES.push(['D1 nonclinical correction + late','D','SAME',rt=>{const s=reentry(rt),r=s.at({observations:[...s.fixes(),s.lateObs]});return {r,corrected:(r.actualLedger??[]).some(o=>o.correctionOf)};},({r,corrected})=>isStale(r)&&corrected]);
// E: a block choice + a clinical signal (QE-R7B1-01), unchanged
for(const [n,choices] of [['ladder step',[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]],['unrecognised',[{type:'LADDER_JUMP'}]]])
 CASES.push([`E${n==='ladder step'?1:2} block choice (${n}) + pain, no late`,'E','SAME',rt=>{const s=plain(rt);return {r:s.at({...sub(s.X,{pain:true}),choices}),X:s.X};},({r,X})=>isClinical(r,PAIN_ROUTE(X))]);
// F: an equipment or skill substitution with no clinical signal, unchanged (B.1 behaviour)
CASES.push(['F1 skill substitution, no signal','F','SAME',rt=>{const s=plain(rt),r=s.at(sub(s.X));return {r,aside:!!r.proposal&&!r.proposal.weeks.slice(2).flatMap(w=>w.sessions).filter(x=>s.live(x)&&x.date>s.day).some(x=>x.prescription.exercises?.some(e=>e.id===s.X))};},({r,aside})=>r.status!=='CLINICAL_HUMAN_REQUIRED'&&!!r.proposal&&aside]);
CASES.push(['F2 equipment change, no signal','F','SAME',rt=>{const s=plain(rt);return {r:s.at({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS']}})};},({r})=>r.status!=='CLINICAL_HUMAN_REQUIRED']);
// Class (b) exits fixed in U2: a clinical and a nonclinical case each
CASES.push(['CAND-01 clinical: factual question + substitution pain','CAND-01','TO_CLINICAL',rt=>{const s=factual(rt);return {r:s.at(sub(s.X,{pain:true})),X:s.X};},({r,X})=>isClinical(r,PAIN_ROUTE(X))]);
CASES.push(['CAND-01 clinical: factual question + illness return','CAND-01','TO_CLINICAL',rt=>{const s=factual(rt);return {r:s.at({kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}})};},({r})=>isClinical(r,ILLNESS_ROUTE)]);
CASES.push(['CAND-01 nonclinical: factual question, weekly review','CAND-01','SAME',rt=>{const s=factual(rt);return {r:s.at({})};},({r})=>r.status==='ASK'&&r.reason===FACTUAL_ASK]);
CASES.push(['CAND-01 nonclinical: factual question, substitution without pain','CAND-01','SAME',rt=>{const s=factual(rt);return {r:s.at(sub(s.X))};},({r})=>r.status==='ASK'&&r.reason===FACTUAL_ASK]);
CASES.push(['CAND-02 clinical: same id, illness reason','CAND-02','TO_CLINICAL',rt=>{const s=returned(rt);return {r:s.again({...s.first,reasonCategory:null,reason:'Flu illness'})};},({r})=>isClinical(r,ILLNESS_ROUTE)]);
CASES.push(['CAND-02 clinical: same id, injury category','CAND-02','TO_CLINICAL',rt=>{const s=returned(rt);return {r:s.again({...s.first,reasonCategory:'INJURY',reason:'Twisted ankle'})};},({r})=>isClinical(r)]);
CASES.push(['CAND-02 clinical: same id, clinical flag','CAND-02','TO_CLINICAL',rt=>{const s=returned(rt);return {r:s.again({...s.first,clinicalReason:true})};},({r})=>isClinical(r)]);
CASES.push(['CAND-02 nonclinical: same report again','CAND-02','SAME',rt=>{const s=returned(rt);return {r:s.again(s.first)};},({r})=>r.status==='KEEP'&&!r.proposal]);
CASES.push(['CAND-02 nonclinical: same id, other nonclinical facts','CAND-02','SAME',rt=>{const s=returned(rt);return {r:s.again({...s.first,reason:'Family visit',reasonCategory:'FAMILY'})};},({r})=>r.status==='ASK'&&JSON.stringify(r.missingInputs)==='["event.id"]']);
// R7B2-OBS-01 (class c, recorded, unchanged): pain with no named exercise
re('OBS-01 pain without a named exercise + late','OBS-01','SAME',{kind:'EXERCISE_SUBSTITUTION',substitution:{reason:'SKILL_MISMATCH',pain:true}},({r})=>r.status==='ASK');

// ---------- running ----------
const view=r=>({status:r.status,action:r.action,reason:String(r.reason??''),missingInputs:r.missingInputs??[],proposal:r.proposal?.hash??null,pending:r.referenceState?.pending?.status??null});
const rows=[];
for(const [id,neighbor,relation,run,expect] of CASES){
 let a,b,err=null;try{a=run(BEFORE);b=run(NOW);}catch(e){err=String(e?.stack??e).split('\n').slice(0,3).join(' | ');}
 if(err){rows.push({id,neighbor,relation,verdict:'ERROR',error:err});continue;}
 const va=view(a.r),vb=view(b.r),expected=!!expect(b);
 const related=relation==='SAME'?JSON.stringify(va)===JSON.stringify(vb):va.status==='ASK'&&va.action==='ASK'&&va.proposal===null&&vb.status==='CLINICAL_HUMAN_REQUIRED'&&vb.proposal===null;
 rows.push({id,neighbor,relation,verdict:expected&&related?'PASS':'FAIL',expectedOnR7B2:expected,relationHolds:related,freeze2:{...va,reason:va.reason.slice(0,160)},r7b2:{...vb,reason:vb.reason.slice(0,160)}});
}
fs.rmSync(tmp,{recursive:true,force:true});
const failed=rows.filter(r=>r.verdict!=='PASS');
const report={check:'R7B2-ADVERSARIAL-NEIGHBORS',predecessor:PRED,current:'working tree',cases:rows.length,byNeighbor:Object.fromEntries([...new Set(rows.map(r=>r.neighbor))].map(n=>[n,{cases:rows.filter(r=>r.neighbor===n).length,failed:rows.filter(r=>r.neighbor===n&&r.verdict!=='PASS').length}])),failed:failed.length,result:failed.length?'FAIL':'PASS',rows};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(coach,arg('--out','r7/b2/NEIGHBORS_R7B2.json')),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,cases:report.cases,byNeighbor:report.byNeighbor,failed:failed.map(r=>({id:r.id,error:r.error,expectedOnR7B2:r.expectedOnR7B2,relationHolds:r.relationHolds,freeze2:r.freeze2?.status+' '+r.freeze2?.reason?.slice(0,80),r7b2:r.r7b2?.status+' '+r.r7b2?.reason?.slice(0,80)}))},null,1));
process.exitCode=failed.length?1:0;
