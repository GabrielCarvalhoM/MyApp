// QRE probe Q6c: clinical routing and the nonclinical-break rule, end to end through generateProgram (intake pause) and
// evaluateProgram (RETURN_AFTER_PAUSE). Expectation: any clinical category, clinical flag or clinical mention -> human;
// free text alone (or a flag alone) never confirms a nonclinical break; ambiguous/unknown -> ASK. Real authority.
import {R6,baseIntake,review,write,elig,addDays,screenInterruptionReason} from './qlib.mjs';
const CLIN=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM','CLINICAL'],NONCLIN=['TRAVEL','WORK','FAMILY','SCHEDULE','VACATION','WEATHER','EQUIPMENT','MOTIVATION','STUDY','MOVING','OTHER_NONCLINICAL'];
const CLIN_TEXT=['I was sick with the flu','sprained my ankle','knee pain after running','had surgery','estive doente','tive uma lesão no joelho','febre e tosse','estuve enfermo','me lesioné la rodilla','dolor de espalda','work trip, then a fever','no pain but injured my calf','covid','food poisoning and vomiting','physio for my shin splints'];
const LEXICON_PROBE=['broke my leg','broken wrist','cancer treatment','chemotherapy','heart attack','chest tightness','nausea','bad headache','muscle cramps','got stitches','appendicitis','kidney stones','dengue','bleeding','my back went out','pulled a hamstring','high blood pressure','diabetes','depression','panic attacks','mononucleosis','hernia','shingles','wisdom teeth removed','quebrei a perna','fraturei o pulso','rompí el tobillo','náuseas','estuve con migraña','sore legs','felt dizzy','concussion','asthma attack','tendon rupture','plantar pain','torn ligament'];
const NONCLIN_TEXT=['work travel','vacation with family','busy at work','moving house','exams at university','gym closed','viagem de trabalho','vacaciones'];
const P=R6.generateProgram(baseIntake({id:'q-clin',weeks:12})).program,w=4,ws=P.weeks[w].startDate;
const viaReview=i=>{const r=R6.evaluateProgram(P,review(P,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:{days:14,endDate:addDays(ws,-1),...i},eligibility:elig(ws)}));return r.status;};
const viaIntake=pause=>R6.generateProgram(baseIntake({id:'q-clin-i',athlete:{pause:{weeks:6,...pause}}})).status;
const rows=[];const rec=(group,input,expect)=>{const rv=viaReview(input),it=viaIntake(input),sc=screenInterruptionReason({reason:input.reason??null,reasonCategory:input.reasonCategory??null,nonclinical:input.nonclinical??null,clinicalReason:input.clinicalReason??null}).status;rows.push({group,input,review:rv,intake:it,screen:sc,ok:expect(rv)&&expect(it)});};
const isClin=s=>s==='CLINICAL_HUMAN_REQUIRED',notProceed=s=>['ASK','CLINICAL_HUMAN_REQUIRED','UNSUPPORTED','HOLD','INVALID_INPUT'].includes(s);
for(const c of CLIN)for(const nonclinical of [true,false,undefined])for(const reason of [undefined,'work travel','all good now'])rec('clinicalCategory',{reasonCategory:c,nonclinical,clinicalReason:false,reason},isClin);
for(const c of NONCLIN)for(const reason of CLIN_TEXT)rec('nonclinicalCategoryClinicalText',{reasonCategory:c,nonclinical:true,reason},isClin);
for(const reason of NONCLIN_TEXT)for(const nonclinical of [true,undefined])for(const clinicalReason of [false,undefined])rec('freeTextOnly',{reason,nonclinical,clinicalReason},notProceed);
for(const flags of [{nonclinical:true},{nonclinical:true,clinicalReason:false},{clinicalReason:false}])rec('flagOnly',flags,notProceed);
for(const reasonCategory of ['BUSINESS','HOLIDAY','INJURED','SICK','  ','unknown'])rec('unknownCategory',{reasonCategory,nonclinical:true},notProceed);
rec('clinicalFlagTrue',{reasonCategory:'WORK',clinicalReason:true},isClin);
// Lexicon coverage probe: nonclinical category + clinical free text not necessarily in the lexicon.
const lex=LEXICON_PROBE.map(reason=>({reason,screen:screenInterruptionReason({reason,reasonCategory:'OTHER_NONCLINICAL',nonclinical:true}).status,review:viaReview({reasonCategory:'OTHER_NONCLINICAL',nonclinical:true,reason})}));
// Current eligibility flags in the review always route to a human.
const flagRows=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].map(k=>({flag:k,review:R6.evaluateProgram(P,review(P,1,{eligibility:elig(addDays(P.weeks[1].startDate,6),{[k]:true})})).status}));
const failures=rows.filter(r=>!r.ok);
const out={probe:'Q6c-clinical-routing',authorityUsed:'REAL r6Authority()',cases:rows.length,failures,lexiconProbe:lex,lexiconMissesProceeding:lex.filter(x=>x.review==='MODIFY'||x.screen==='NONCLINICAL'),eligibilityFlags:flagRows,pass:failures.length===0&&flagRows.every(f=>f.review==='CLINICAL_HUMAN_REQUIRED')};
write('q6c-clinical-routing.out.json',out);
console.log(JSON.stringify({cases:rows.length,failures:failures.length,failureSample:failures.slice(0,5),flags:flagRows.map(f=>f.flag+':'+f.review)},null,0));
console.log('LEXICON misses (nonclinical category + clinical text -> proceeds):',JSON.stringify(out.lexiconMissesProceeding.map(x=>x.reason)));
