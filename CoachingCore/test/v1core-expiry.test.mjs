// V1 Core Safety & Lifecycle, QRE-AIF-01 (L-APP-08, the AUTHORITY_EXPIRY gate): after the enabling records' review-by date, no prescription,
// no proposal and no new plan; a recognized clinical route still answers as it did before the date. Nothing else changes.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/v1-safety-index.mjs';
import * as below from '../src/v1-strength-index.mjs';
import {RECORDS_URL} from '../src/r7b-repertoire.mjs';
import fs from 'node:fs';
import {client,athleteA,at,ELIG,addDays,notFeeling100WithSign,readiness} from './v1core-helpers.mjs';

const RECORDS=JSON.parse(fs.readFileSync(RECORDS_URL,'utf8'));
/** One plan whose weeks cover the review-by date (2027-04-30, UTC day). */
function planAcross(entry=S){
 const i=athleteA({weeks:8,id:'core-expiry'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);
 const c=client(entry);assert.equal(c.onboard(i).status,'PROPOSED');return {c,i};
}
const sign=(c,day,time='08:00',extra={})=>c.probe('NOT_FEELING_100',at(day,time),{...notFeeling100WithSign(day),...extra},'sign-'+day);
const weekly=(c,day)=>c.probe('WEEKLY_REVIEW',at(day,'20:00'),{eligibility:ELIG(day)},'weekly-'+day);

test('QRE-AIF-01: before and on the review-by day, the answer of the new entry point is the answer below it, byte for byte', ()=>{
 const {c}=planAcross();
 for(const day of ['2027-04-25','2027-04-29','2027-04-30']){
  const rv=c.input('NOT_FEELING_100',at(day,'08:00'),notFeeling100WithSign(day),'s-'+day);
  assert.equal(JSON.stringify(S.evaluateProgram(c.env.program,rv)),JSON.stringify(below.evaluateProgram(c.env.program,rv)));
  const wv=c.input('WEEKLY_REVIEW',at(day,'20:00'),{eligibility:ELIG(day)},'w-'+day);
  assert.equal(JSON.stringify(S.evaluateProgram(c.env.program,wv)),JSON.stringify(below.evaluateProgram(c.env.program,wv)));
 }
 const r=sign(c,'2027-04-30');assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.authorityExpiry,undefined);
});

test('QRE-AIF-01: after the date a warning sign is CLINICAL_HUMAN_REQUIRED, with nothing prescribed or proposed', ()=>{
 const {c}=planAcross(),pre=sign(c,'2027-04-30'),post=sign(c,'2027-05-01');
 assert.equal(below.evaluateProgram(c.env.program,c.input('NOT_FEELING_100',at('2027-05-01','08:00'),notFeeling100WithSign('2027-05-01'),'x')).status,'UNSUPPORTED','the defect, below');
 assert.equal(post.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(post.proposal,null);
 assert.deepEqual(post.authorityExpiry,{status:'EXPIRED',asOfDay:'2027-05-01',reviewBy:['2027-04-30'],records:post.authorityExpiry.records,clinicalRouteAnswered:true});
 assert.ok(post.authorityExpiry.records.includes('B0-C04'));
 assert.equal(post.guidance?.level,pre.guidance?.level,'the same guidance level as before the date');
 assert.deepEqual(post.warningSigns,pre.warningSigns);
 assert.ok(!(post.runSessions&&Object.values(post.runSessions).some(s=>s?.executable)),'no executable run');
 assert.equal(post.strengthExposure?.status,'NOT_APPLICABLE');
});

test('QRE-AIF-01: the UTC day decides; an evening instant west of UTC on 30 April is already 1 May', ()=>{
 const {c}=planAcross();
 const late=c.probe('WEEKLY_REVIEW','2027-04-30T22:30:00-03:00',{eligibility:ELIG('2027-04-30')},'late');
 assert.equal(late.status,'UNSUPPORTED');assert.equal(late.authorityExpiry?.asOfDay,'2027-05-01');
 const lateSign=c.probe('NOT_FEELING_100','2027-04-30T22:30:00-03:00',notFeeling100WithSign('2027-04-30'),'late-sign');
 assert.equal(lateSign.status,'CLINICAL_HUMAN_REQUIRED');
});

test('QRE-AIF-01: after the date a review without a clinical route is refused, with the expiry named; a readiness release prescribes nothing', ()=>{
 const {c}=planAcross();
 assert.equal(weekly(c,'2027-04-25').status!=='UNSUPPORTED',true,'before: decided');
 const post=weekly(c,'2027-05-02');
 assert.equal(post.status,'UNSUPPORTED');assert.equal(post.proposal,null);assert.equal(post.authorityExpiry.clinicalRouteAnswered,false);
 // A hold recorded before the date stands after it; the readiness declaration that would release it is refused (no prescription after expiry).
 c.review('NOT_FEELING_100',at('2027-04-28','08:00'),notFeeling100WithSign('2027-04-28'),'hold');
 const stand=weekly(c,'2027-05-02');assert.equal(stand.status,'CLINICAL_HUMAN_REQUIRED','the standing hold answers');assert.equal(stand.proposal,null);
 // The declaration that would release the hold before the date releases nothing after it: the dependency is kept (the engine's own reference
 // continuation answers it), no proposal, no prescription.
 const rel=c.probe('READINESS_DECLARATION',at('2027-05-03','08:00'),readiness('2027-05-03'),'ready');
 assert.ok(['CLINICAL_HUMAN_REQUIRED','UNSUPPORTED'].includes(rel.status),rel.status);assert.equal(rel.proposal,null);
 const c2=planAcross().c;c2.review('NOT_FEELING_100',at('2027-04-20','08:00'),notFeeling100WithSign('2027-04-20'),'hold');
 assert.ok(c2.probe('READINESS_DECLARATION',at('2027-04-23','08:00'),readiness('2027-04-23'),'ready').proposal,'control: before the date the same declaration releases');
});

test('QRE-AIF-01: several signs at once, and a clinical eligibility flag, route as before the date', ()=>{
 const {c}=planAcross();
 const many=day=>({...notFeeling100WithSign(day),wellbeing:{...notFeeling100WithSign(day).wellbeing,warningSigns:{...notFeeling100WithSign(day).wellbeing.warningSigns,chestPainPressureOrTightness:true,feverOrChills:true}}});
 const pre=c.probe('NOT_FEELING_100',at('2027-04-29','08:00'),many('2027-04-29'),'m1'),post=c.probe('NOT_FEELING_100',at('2027-05-04','08:00'),many('2027-05-04'),'m2');
 assert.equal(post.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(post.guidance?.level,pre.guidance?.level);assert.deepEqual(post.warningSigns,pre.warningSigns);
 const flag=c.probe('WEEKLY_REVIEW',at('2027-05-04','20:00'),{eligibility:{...ELIG('2027-05-04'),pain:true}},'flag');
 assert.equal(flag.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(flag.proposal,null);
});

test('QRE-AIF-01: invalid input after the date decides nothing; it is never read as a clinical route or a prescription', ()=>{
 const {c}=planAcross();
 const bad=S.evaluateProgram(c.env.program,{...c.input('NOT_FEELING_100',at('2027-05-02','08:00'),notFeeling100WithSign('2027-05-02'),'bad'),weekIndex:99});
 assert.equal(bad.status,'UNSUPPORTED');assert.equal(bad.proposal,null);
 const noClock=S.evaluateProgram(c.env.program,{...c.input('NOT_FEELING_100',at('2027-05-02','08:00'),notFeeling100WithSign('2027-05-02'),'nc'),asOf:'2027-05-02'});
 assert.ok(['UNSUPPORTED','HOLD'].includes(noClock.status));assert.equal(noClock.proposal,null);
});

test('QRE-AIF-01: records missing, altered or vetoed are not expiry: the refusal stands whatever the review says', ()=>{
 const {c}=planAcross(),rv=c.input('NOT_FEELING_100',at('2027-04-29','08:00'),notFeeling100WithSign('2027-04-29'),'r');
 const without=RECORDS.filter(r=>!/B0-C04$/.test(r.review_id));
 const altered=RECORDS.map(r=>/B0-C04$/.test(r.review_id)?{...r,target:{...r.target,sha256:'0'.repeat(64)}}:r);
 const vetoed=RECORDS.map(r=>/B0-C04$/.test(r.review_id)?{...r,disposition:'REJECT'}:r);
 for(const records of [without,altered,vetoed,[]]){const r=S.evaluateProgram(c.env.program,rv,{repertoireRecords:records});assert.equal(r.status,'UNSUPPORTED');assert.equal(r.authorityExpiry,undefined);}
 const own=S.evaluateProgram(c.env.program,{...rv,asOf:at('2027-05-02','08:00')},{repertoire:{valid:false}});assert.equal(own.status,'UNSUPPORTED');assert.equal(own.authorityExpiry,undefined);
});

test('QRE-AIF-01: after the date no new plan is made; a clinical intake is still answered as clinical', ()=>{
 const {i}=planAcross();
 const later={...i,asOf:'2027-05-04',startDate:'2027-05-10',athlete:{...i.athlete,eligibility:ELIG('2027-05-04')}};
 assert.equal(S.generateProgram(later).status,'UNSUPPORTED');
 const clinical={...later,athlete:{...later.athlete,eligibility:{...ELIG('2027-05-04'),pain:true}}};
 assert.equal(S.generateProgram(clinical).status,'CLINICAL_HUMAN_REQUIRED');
});

test('QRE-AIF-01: after a restore, the same answers', ()=>{
 const {c}=planAcross();c.review('WEEKLY_REVIEW',at('2027-04-25','20:00'),{eligibility:ELIG('2027-04-25')},'w0');
 const r=client(S,JSON.parse(JSON.stringify(c.env)));
 assert.equal(JSON.stringify(sign(r,'2027-05-01')),JSON.stringify(sign(c,'2027-05-01')));
 assert.equal(sign(r,'2027-05-01').status,'CLINICAL_HUMAN_REQUIRED');
});
