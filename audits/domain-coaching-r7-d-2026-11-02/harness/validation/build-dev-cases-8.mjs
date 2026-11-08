// R7D-HARNESS-VALIDATION-8 development cases (R7-D Phase 4, R7D-PREREG-7): DEV_CASES_R7D_7.json (bound by R7D-FREEZE-5, never edited) plus five
// cases in the shapes the Phase 3.5 quality recheck probed (QRE-R7D-PHASE35-CHECK-r2, probes2/qre3-p35-cases.mjs), derived the same way:
//   DEV-58 (QH21) and DEV-59 (QH22): CQ4-2 / QRE3-P35-02. DEV-56 with the holiday reported under its own episodeId; the wrong-day answer and the
//     valid answer name the holiday in two forms (its episodeId, its report's event id), in both orders. R7D-HARNESS-7 r2 false-blocks both (P17).
//   DEV-60 (QH24), DEV-61 (QH25), DEV-62 (QH26): CQ4-1 / QRE3-P35-01, as DEV cases (CQ4-2 "per CQ4-1"): the duplicate re-read of the bounded cycle in
//     the shapes no directed test pinned: the re-send by last day and length only (QF3), the re-send of a named correction's dates (QF7), and the
//     R07 confirmation-first order, unnamed (QF6).
// Development cases only: written by the instrument owner, contaminated by construction, never holdout or generalization evidence.
//   node build-dev-cases-8.mjs <DEV_CASES_R7D_7.json> <out DEV_CASES_R7D_8.json>
import fs from 'node:fs';
const [devFile,outFile]=process.argv.slice(2);
if(!devFile||!outFile)throw Error('usage: <DEV_CASES_R7D_7.json> <out file>');
if(fs.existsSync(outFile))throw Error('refusing to overwrite '+outFile);
const dev=JSON.parse(fs.readFileSync(devFile,'utf8'));
const byId=id=>{const c=dev.cases.find(x=>x.caseId===id);if(!c)throw Error('missing '+id);return JSON.parse(JSON.stringify(c));};
const rename=(k,from,to)=>{const c=JSON.parse(JSON.stringify(k).split(from).join(to));c.caseId=to;return c;};
const stepOf=(c,id)=>{const s=c.timeline.find(x=>x.stepId===id);if(!s)throw Error(c.caseId+': no step '+id);return s;};
const added=[];
// DEV-58 (QH21: wrong by the holiday's episodeId, right by its report's event id) and DEV-59 (QH22: the reverse).
for(const [id,qh,wrong,right] of [['DEV-58','QH21','hol','evt'],['DEV-59','QH22','evt','hol']]){
 const c=rename(byId('DEV-56'),'DEV-56',id),name=f=>f==='hol'?`${id}-hol`:`${id}-w4d0`;
 stepOf(c,'w4d0').event.interruption.episodeId=`${id}-hol`;stepOf(c,'wrong').event.interruption.episodeId=name(wrong);stepOf(c,'right').event.interruption.episodeId=name(right);
 c.authorIntent=`R7D-HARNESS-VALIDATION-8 (${qh} shape; QRE3-P35-02): ${c.authorIntent} The holiday is reported with its own episodeId; the wrong-day answer names it by ${wrong==='hol'?'that episodeId':'its report event id'}, the valid answer by ${right==='hol'?'that episodeId':'its report event id'}. Both forms name one break: no false block (R7D-HARNESS-7 r2 false-blocked it).`;
 added.push(c);}
// DEV-60 (QH24): DEV-53 with the re-send giving its last day and length only (no first day).
{const c=rename(byId('DEV-53'),'DEV-53','DEV-60');delete stepOf(c,'dup').event.interruption.startDate;
 c.authorIntent=`R7D-HARNESS-VALIDATION-8 (QH24 shape; QRE3-P35-01, mutant QF3): ${c.authorIntent} The unnamed re-send states its last day and length, no first day: still the latest break's duplicate, re-read as the named report is.`;added.push(c);}
// DEV-61 (QH25): DEV-53 after a named correction of the trip to Friday (re-read), then the corrected dates re-sent with no name.
{const c=rename(byId('DEV-53'),'DEV-53','DEV-61'),i=k=>({...stepOf(c,'dup').event.interruption,endDate:'2026-12-18',days:5,...k});
 const at=c.timeline.findIndex(s=>s.stepId==='dup');c.timeline.splice(at,0,{stepId:'corr',at:{week:6,day:5,time:'09:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:i({episodeId:'DEV-61-brk2'})}});
 stepOf(c,'dup').event.interruption=i({});
 c.authorIntent=`R7D-HARNESS-VALIDATION-8 (QH25 shape; QRE3-P35-01, mutant QF7): ${c.authorIntent} After a named correction of the trip to Friday, the corrected dates are re-sent with no name: a duplicate of the report in force, re-read as the named report is.`;added.push(c);}
// DEV-62 (QH26): R07 in the confirmation-first order (DEV-56's late lift), the trip confirmed by the same dates with no name, then the holiday restated
// with a start after the lift.
{const c=rename(byId('DEV-56'),'DEV-56','DEV-62'),trip=stepOf(c,'brk2').event.interruption,{episodeId,...plain}=trip;
 const wrong=stepOf(c,'wrong'),right=stepOf(c,'right');
 wrong.stepId='conf';wrong.event={kind:'RETURN_AFTER_PAUSE',interruption:plain};
 right.stepId='restate';right.event.interruption.startedAt='2026-11-16T20:00:00Z';
 c.authorIntent='R7D-HARNESS-VALIDATION-8 (QH26 shape; QRE3-P35-01, mutant QF6): R07 confirmation first by the same dates, unnamed (the re-read asks the holiday\'s start time, as the named confirmation does), then the holiday restated with a start after the lift.';added.push(c);}
const ids=new Set(dev.cases.map(c=>c.caseId));for(const c of added)if(ids.has(c.caseId))throw Error('duplicate id '+c.caseId);
const out={...dev,corpusRevision:'R7D-DEV-8',note:'DEV_CASES_R7D_7 (R7D-FREEZE-5) plus DEV-58 to DEV-62 (R7-D Phase 4, R7D-PREREG-7). Development cases only, contaminated by construction.',cases:[...dev.cases,...added]};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:out.cases.length,added:added.map(c=>c.caseId)}));
