// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q1/Q3): probe cases in the R7-D corpus format, derived from the candidate's own development
// cases (harness/validation/DEV_CASES_R7D_7.json at 33d3181), for the harness and differential probes:
//   node qre3-p35-cases.mjs <DEV_CASES_R7D_7.json> <out corpus file>
// QH21-QH23b: P17's same-break window end (QRE-P35-03 as built: sameBreakNamed) when the earlier break carries its own episodeId and the two answers
//   name it in different forms (its episodeId, its report's event id); both forms name the break (restatesListed reads either).
// QH24-QH29n: the bounded cycle's duplicate re-read in shapes T36 does not hold (the runtime probe's N6, N9, N16, N4, N12 and N1 shapes).
import fs from 'node:fs';
const [devFile,outFile]=process.argv.slice(2);
const dev=JSON.parse(fs.readFileSync(devFile,'utf8')),byId=id=>JSON.parse(JSON.stringify(dev.cases.find(c=>c.caseId===id)));
const rename=(k,from,to)=>{const c=JSON.parse(JSON.stringify(k).split(from).join(to));c.caseId=to;c.authorIntent='QRE3-P35 probe: '+c.authorIntent;return c;};
const stepOf=(c,id)=>c.timeline.find(s=>s.stepId===id);
const cases=[];
// P17 name forms (base DEV-56: a wrong-day start time, then a valid one before the lift; nothing changes).
for(const [id,wrong,right] of [['QH21','hol','evt'],['QH22','evt','hol'],['QH23','hol','hol'],['QH23b','evt','evt']]){
 const c=rename(byId('DEV-56'),'DEV-56',id),name=f=>f==='hol'?`${id}-hol`:`${id}-w4d0`;
 stepOf(c,'w4d0').event.interruption.episodeId=`${id}-hol`;stepOf(c,'wrong').event.interruption.episodeId=name(wrong);stepOf(c,'right').event.interruption.episodeId=name(right);
 c.authorIntent+=` (the holiday reported with its own episodeId; wrong names it by ${wrong==='hol'?'that episodeId':'its report event id'}, right by ${right==='hol'?'that episodeId':'its report event id'})`;cases.push(c);}
// QH24: DEV-53 with the re-send giving its last day and length only.
{const c=rename(byId('DEV-53'),'DEV-53','QH24');delete stepOf(c,'dup').event.interruption.startDate;c.authorIntent+=' (the re-send states its last day and length, no first day)';cases.push(c);}
// QH25: DEV-53 after a named correction of the trip to Friday (re-read), then the corrected dates re-sent with no name.
{const c=rename(byId('DEV-53'),'DEV-53','QH25'),i=k=>({...stepOf(c,'dup').event.interruption,endDate:'2026-12-18',days:5,...k});
 const at=c.timeline.findIndex(s=>s.stepId==='dup');c.timeline.splice(at,0,{stepId:'corr',at:{week:6,day:5,time:'09:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:i({episodeId:'QH25-brk2'})}});
 stepOf(c,'dup').event.interruption=i({});c.authorIntent+=' (after a named correction to Friday, the corrected dates re-sent)';cases.push(c);}
// QH26 / QH26n: R07 in the confirmation-first order (base DEV-56's late lift): the trip confirmed by the same dates (unnamed / named), then the holiday
// restated with a start after the lift; the weeks after it.
for(const [id,named] of [['QH26',false],['QH26n',true]]){
 const c=rename(byId('DEV-56'),'DEV-56',id),trip=stepOf(c,'brk2').event.interruption,{episodeId,...plain}=trip;
 const wrong=stepOf(c,'wrong'),right=stepOf(c,'right');
 wrong.stepId='conf';wrong.event={kind:'RETURN_AFTER_PAUSE',interruption:named?{...plain,episodeId:`${id}-brk2`}:plain};
 right.stepId='restate';right.event.interruption.startedAt='2026-11-16T20:00:00Z';
 c.authorIntent=`QRE3-P35 probe: R07 confirmation first by the same dates (${named?'named':'unnamed'}), then the holiday restated with a start after the lift`;cases.push(c);}
// QH27: DEV-53's re-send arriving in week 9, after weeks 6-8 reviewed with every session done (DEV-56's week 7 and 8 reports).
{const c=rename(byId('DEV-53'),'DEV-53','QH27'),d56=byId('DEV-56'),after=['sun','wk7','wk8'].map(s=>JSON.parse(JSON.stringify(stepOf(d56,s)).split('DEV-56').join('QH27')));
 const dup=stepOf(c,'dup'),plain2=stepOf(c,'plain2');c.timeline=c.timeline.filter(s=>s!==dup&&s!==plain2);
 dup.at={week:9,day:2,time:'10:00'};plain2.at={week:9,day:2,time:'12:00'};c.timeline.push(...after,dup,plain2);c.authorIntent+=' (the re-send in week 9)';cases.push(c);}
// QH28: DEV-53's re-send carried by a weekly review.
{const c=rename(byId('DEV-53'),'DEV-53','QH28');stepOf(c,'dup').event.kind='WEEKLY_REVIEW';c.authorIntent+=' (carried by a weekly review)';cases.push(c);}
// QH29 / QH29n: DEV-27 (one easy run between the holiday and the trip: one stop through both), confirmed with the stop's dates (the I6 question's).
for(const [id,named] of [['QH29',false],['QH29n',true]]){
 const c=rename(byId('DEV-27'),'DEV-27',id),{episodeId,...t}=stepOf(c,'brk2').event.interruption,stop={...t,startDate:'2026-11-16',days:21};
 c.timeline.push({stepId:'dup',at:{week:5,day:1,time:'09:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:named?{...stop,episodeId:`${id}-brk2`}:stop}},{stepId:'plain2',at:{week:5,day:1,time:'12:00'},event:{kind:'WEEKLY_REVIEW'}},
  {stepId:'wk5',at:{week:5,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'}});
 c.authorIntent+=` (then confirmed with the stop's dates, ${named?'named':'unnamed'})`;cases.push(c);}
fs.writeFileSync(outFile,JSON.stringify({corpusRevision:'QRE3-P35-PROBE',contaminated:true,derivedFrom:'DEV_CASES_R7D_7 (33d3181)',cases},null,1)+'\n');
console.log('cases',cases.length,cases.map(c=>c.caseId).join(','));
