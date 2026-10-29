import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseBalanced,interferenceCosts} from '../src/r6-balanced.mjs';
import {normalizeObservations,localDate} from '../src/r6-provenance.mjs';
import {createLearningModel,updateLearningModel,evidenceFor,preferredArrangement,classify} from '../src/r6-learning.mjs';

const heavyLower={modality:'STRENGTH',exercises:[{id:'back-squat',pattern:'SQUAT',sets:3,load:{mode:'KNOWN',value:80,unit:'KG'}},{id:'barbell-rdl',pattern:'HINGE',sets:3,load:{mode:'KNOWN',value:80,unit:'KG'}}]};
const cruise={modality:'RUN',family:'THRESHOLD'},longRun={modality:'RUN',family:'LONG'},upper={modality:'STRENGTH',exercises:[{id:'db-bench-press',pattern:'PUSH',sets:3,load:{mode:'KNOWN',value:20,unit:'KG'}}]};
const s=(id,day,prescription,turn='AM')=>typeof turn==='object'?{id,day,turn:'AM',prescription,...turn}:{id,day,turn,prescription};
const protectRun={id:'protect-run',sessions:[s('Q',0,cruise),s('L',1,heavyLower),s('LR',4,longRun),s('U',5,upper)]};
const protectStrength={id:'protect-strength',sessions:[s('L',0,heavyLower),s('Q',1,cruise),s('LR',4,longRun),s('U',5,upper)]};
const adverseCopy={...protectRun,id:'adverse-copy',admissible:false,reasons:['Explicit adverse combined recovery']};

test('Balanced: Pareto first, then lowest worst-case joint harm; the remaining cost is disclosed',()=>{
 const r=chooseBalanced([protectRun,protectStrength,adverseCopy],{lead:'JOINT'});
 assert.equal(r.selected.id,'protect-run');assert.equal(r.basis,'LOWEST_WORST_CASE_JOINT_HARM');
 const lost=r.counterfactuals.find(c=>c.id==='protect-strength');
 assert.ok(lost.costs.some(c=>c.axis==='run'&&c.severity==='MODERATE'));
 assert.ok(r.counterfactuals.find(c=>c.id==='protect-run').costs.some(c=>c.axis==='strength'&&c.severity==='LOW'));
 assert.equal(r.counterfactuals.find(c=>c.id==='adverse-copy').admissible,false);
});
test('Balanced: candidate order never decides (H03/H11/H20 root cause)',()=>{
 const a=chooseBalanced([protectRun,protectStrength],{lead:'JOINT'}),b=chooseBalanced([protectStrength,protectRun],{lead:'JOINT'});
 assert.equal(a.selected.id,b.selected.id);
});
test('Balanced: without severity authority a real trade-off is asked, never resolved by order',()=>{
 const r=chooseBalanced([protectRun,protectStrength],{lead:'JOINT',severityAuthority:false});
 assert.equal(r.selected,null);assert.equal(r.askRequired,true);assert.equal(r.question.id,'TEMPORARY_TRADE_OFF_PREFERENCE');
});
test('Balanced: an equal-harm opposing trade-off is asked; a temporary preference or strong athlete evidence resolves it',()=>{
 const goblet={modality:'STRENGTH',exercises:[{id:'goblet-squat',pattern:'SQUAT',sets:3,load:{mode:'ESTABLISH',unit:'KG'}}]};
 const runFirst={id:'X',sessions:[s('Q',0,cruise),{...s('L',0,goblet),backToBackOrder:1}]},strengthFirst={id:'Y',sessions:[{...s('Q',0,cruise),backToBackOrder:1},s('L',0,goblet)]};
 const tie=chooseBalanced([runFirst,strengthFirst],{lead:'JOINT'});
 assert.equal(tie.askRequired,true);assert.equal(tie.selected,null);assert.deepEqual(tie.tiedIds.sort(),['X','Y']);
 const pref=chooseBalanced([runFirst,strengthFirst],{lead:'JOINT',temporaryPreference:'RUN'});
 assert.equal(pref.selected.id,'X');assert.equal(pref.basis,'TEMPORARY_PREFERENCE');
 const learned=chooseBalanced([runFirst,strengthFirst],{lead:'JOINT',athleteEvidence:{preferredId:'Y',confidence:'STRONG'}});
 assert.equal(learned.selected.id,'Y');assert.equal(learned.basis,'ATHLETE_EVIDENCE');
 const runLead=chooseBalanced([runFirst,strengthFirst],{lead:'RUN'});
 assert.equal(runLead.selected.id,'X');
});
test('Balanced: identical costs are a canonical choice that no candidate identifier or input order decides (SSCTR D24)',()=>{
 const mk=(id,d)=>({id,sessions:[s('E1',d,{modality:'RUN',family:'EASY'}),s('U',d+2,upper)]});
 const pick=list=>chooseBalanced(list,{lead:'JOINT'});
 const r1=pick([mk('b-option',0),mk('a-option',1)]),r2=pick([mk('z',1),mk('y',0)]),r3=pick([mk('a-option',0),mk('b-option',1)]);
 for(const r of [r1,r2,r3])assert.equal(r.basis,'EQUIVALENT_NO_TRADE_OFF');
 const day=r=>r.selected.sessions[0].day;assert.equal(day(r1),day(r2));assert.equal(day(r1),day(r3));
});
test('Balanced: an easy run right before moderate or heavy lower-body work costs strength, so strength-first wins when strength develops (SSCTR D24)',()=>{
 const both=first=>({id:first,sessions:[s('E',1,{modality:'RUN',family:'EASY'},{turn:'PM',backToBackOrder:first==='run-first'?0:1}),s('L',1,heavyLower,{turn:'PM',backToBackOrder:first==='run-first'?1:0})]});
 const r=chooseBalanced([both('run-first'),both('strength-first')],{lead:'JOINT',context:{strengthRole:'PRIMARY'}});
 assert.equal(r.selected.id,'strength-first');assert.ok(r.counterfactuals.find(c=>c.id==='run-first').costs.some(c=>/Easy run shortly before heavy/.test(c.cause)));
 const maintain=chooseBalanced([both('run-first'),both('strength-first')],{lead:'JOINT',context:{strengthRole:'MAINTAIN'}});
 assert.equal(maintain.basis,'EQUIVALENT_NO_TRADE_OFF');assert.equal(maintain.selected.orderFlexible,true,'either order is disclosed when nothing differs');
});
test('Balanced: severities compare worst first (leximax); a moderate cost never beats a low one by count (SSCTR D25)',()=>{
 const one=interferenceCosts([s('L',0,heavyLower,{turn:'PM'}),s('Q',1,cruise,{turn:'PM'})]);
 assert.equal(one[0].severity,'MODERATE');
 const lows=[s('Q',0,cruise,{turn:'AM'}),s('L',1,heavyLower,{turn:'AM'})];
 const r=chooseBalanced([{id:'moderate-run',sessions:[s('L',0,heavyLower,{turn:'PM'}),s('Q',1,cruise,{turn:'PM'})]},{id:'low-strength',sessions:lows}],{lead:'JOINT'});
 assert.equal(r.selected.id,'low-strength');assert.equal(r.basis==='EQUIVALENT_NO_TRADE_OFF',false);
 assert.match(interferenceCosts([s('Q',0,cruise,{turn:'AM'}),s('L',0,heavyLower,{turn:'PM'})])[0].cause,/earlier the same day/);
});
test('Interference model: direction and gap matter; upper body does not interfere; race protection is high',()=>{
 assert.equal(interferenceCosts([s('U',0,upper),s('Q',1,cruise)]).length,0);
 assert.equal(interferenceCosts([s('L',0,heavyLower),s('Q',3,cruise)]).length,0);
 assert.equal(interferenceCosts([s('L',0,heavyLower),s('R',2,{modality:'RUN',family:'RACE'})]).find(c=>c.afterId==='R').severity,'HIGH');
});
const ATH='ath-1',ASOF='2026-11-08T20:00:00Z';
const obs=(id,at,extra={})=>({eventId:id,athleteId:ATH,sessionId:extra.sessionId??'w0-run-d1',observedAt:at,actual:{completed:true,minutes:40,...(extra.actual??{})},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',...(extra.response??{})},...(extra.top??{})});
test('Provenance: a future observation never informs a past decision; small clock skew is quarantined',()=>{
 const n=normalizeObservations([obs('f1','2026-11-09T07:00:00Z'),obs('skew','2026-11-08T20:03:00Z',{sessionId:'w0-run-d2'}),obs('ok','2026-11-08T07:00:00Z',{sessionId:'w0-run-d3'})],{athleteId:ATH,asOf:ASOF});
 assert.deepEqual(n.excluded.map(e=>e.reason).sort(),['FUTURE_CLOCK_SKEW_QUARANTINED','FUTURE_OBSERVATION']);
 assert.deepEqual(n.accepted.map(o=>o.eventId),['ok']);
});
test('Provenance: a report made after the decision clock is not available even for an earlier execution',()=>{
 const n=normalizeObservations([obs('late','2026-11-07T07:00:00Z',{top:{reportedAt:'2026-11-09T08:00:00Z'}})],{athleteId:ATH,asOf:ASOF});
 assert.equal(n.excluded[0].reason,'FUTURE_REPORT_NOT_AVAILABLE');
});
test('Provenance: timezone offsets normalize to UTC and bind to the local day; day precision uses the latest causal instant',()=>{
 const n=normalizeObservations([obs('tz','2026-11-07T22:30:00-03:00')],{athleteId:ATH,asOf:ASOF,timezoneOffsetMinutes:-180});
 assert.equal(n.accepted[0].observedAt,'2026-11-08T01:30:00.000Z');assert.equal(n.accepted[0].localDate,'2026-11-07');
 assert.equal(localDate('2026-11-08T01:30:00.000Z',-180),'2026-11-07');
 const d=normalizeObservations([{...obs('day',undefined),observedAt:undefined,occurrenceDate:'2026-11-08'}],{athleteId:ATH,asOf:ASOF});
 assert.equal(d.accepted[0].observedAt,new Date(Date.parse(ASOF)).toISOString());assert.equal(d.accepted[0].provenance.timePrecision,'DAY');
 const earlier=normalizeObservations([{...obs('day2',undefined),observedAt:undefined,occurrenceDate:'2026-11-06'}],{athleteId:ATH,asOf:ASOF});
 assert.equal(earlier.accepted[0].observedAt,'2026-11-06T23:59:59.000Z');
});
test('Provenance: out-of-order arrival is ordered by event time; corrections supersede',()=>{
 const n=normalizeObservations([obs('b','2026-11-06T07:00:00Z',{sessionId:'s2'}),obs('a','2026-11-04T07:00:00Z',{sessionId:'s1'}),obs('a2','2026-11-04T07:00:00Z',{sessionId:'s1',actual:{minutes:35},top:{correctionOf:'a',correctedAt:'2026-11-05T09:00:00Z'}})],{athleteId:ATH,asOf:ASOF});
 assert.deepEqual(n.accepted.map(o=>o.eventId),['a2','b']);assert.equal(n.superseded[0].eventId,'a');
});
test('Provenance: manual + wearable duplicates merge without double counting; contradictory reports quarantine',()=>{
 const manual=obs('m','2026-11-06T07:00:00Z',{response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'HARDER'}});
 const watch={...obs('w','2026-11-06T07:05:00Z',{actual:{minutes:41},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'}}),source:{provider:'WEARABLE:X',activityId:'act-9',quality:'WEARABLE_FULL'}};
 const n=normalizeObservations([manual,watch],{athleteId:ATH,asOf:ASOF});
 assert.equal(n.accepted.length,1);assert.equal(n.duplicates[0].reason,'SAME_EXECUTION_DIFFERENT_SOURCE');
 assert.equal(n.accepted[0].actual.minutes,41);assert.equal(n.accepted[0].response.effort,'HARDER');
 // The record is append-only (QRE-R6-14): the first report stays, flagged conflicted and quarantined; the contradicting one is excluded.
 const c=normalizeObservations([manual,{...watch,actual:{completed:false,minutes:12}}],{athleteId:ATH,asOf:ASOF});
 assert.equal(c.accepted.length,1);assert.equal(c.accepted[0].conflicted,true);assert.equal(c.conflicts[0].reason,'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS');
 assert.ok(c.quarantinedIdentities.length===1);
 const reused=normalizeObservations([manual,{...manual,actual:{completed:true,minutes:10}}],{athleteId:ATH,asOf:ASOF});
 assert.ok(reused.excluded.some(e=>e.reason==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'));
 const replay=normalizeObservations([manual],{athleteId:ATH,asOf:ASOF,prior:[manual]});
 assert.equal(replay.accepted.length,1);assert.equal(replay.duplicates[0].reason,'EXACT_REPLAY');
});
test('Provenance: stale observations expire for learning windows',()=>{
 const n=normalizeObservations([obs('old','2025-08-02T07:00:00Z')],{athleteId:ATH,asOf:ASOF});
 assert.equal(n.excluded[0].reason,'STALE_OBSERVATION');
});
const ctx={sessionType:'RUN:LONG',arrangementId:'A'};
const learned=(rows,asOf='2026-11-30T20:00:00Z')=>updateLearningModel(createLearningModel({athleteId:ATH,purposeAllowed:true,asOf:'2026-10-01T00:00:00Z'}),rows.map(([id,at,response,actual={}])=>({...obs(id,at,{sessionId:'s-'+id,response,actual}),context:ctx,comparable:actual.completed!==false})),{asOf});
test('Learning: one bad session is a signal, not a rule; missing effort is unknown, not adverse',()=>{
 const m=learned([['x','2026-11-20T07:00:00Z',{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER'}]]);
 const e=evidenceFor(m,ctx);assert.equal(e.confidence,'PRIOR');assert.equal(e.adverseCount,1);
 assert.equal(classify({actual:{completed:true},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'UNKNOWN'}}),'COMPATIBLE');
 assert.equal(classify({actual:{completed:true},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'}}),'COMPLETED_NO_RESPONSE');
});
test('Learning: partial completion informs adherence only; repeated comparable outcomes build confidence; conflicts stay mixed',()=>{
 const partial=learned([['p','2026-11-20T07:00:00Z',{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'},{completed:false,minutes:20}]]);
 assert.equal(evidenceFor(partial,ctx).informativeCount,0);assert.equal(evidenceFor(partial,ctx).partialCount,1);
 const good={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'};
 const strong=learned([['a','2026-11-01T07:00:00Z',good],['b','2026-11-08T07:00:00Z',good],['c','2026-11-15T07:00:00Z',good],['d','2026-11-22T07:00:00Z',good]]);
 assert.equal(evidenceFor(strong,ctx).confidence,'STRONG');
 const mixed=learned([['a','2026-11-01T07:00:00Z',good],['b','2026-11-08T07:00:00Z',{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER'}],['c','2026-11-15T07:00:00Z',good]]);
 assert.equal(evidenceFor(mixed,ctx).direction,'MIXED');
 assert.equal(evidenceFor(strong,ctx).causal,false);assert.equal(evidenceFor(strong,ctx).automaticDoseAuthority,false);
});
test('Learning: declined consent keeps nothing for personalization',()=>{
 const m=updateLearningModel(createLearningModel({athleteId:ATH,purposeAllowed:false,asOf:'2026-10-01T00:00:00Z'}),[obs('a','2026-11-01T07:00:00Z')],{asOf:'2026-11-30T20:00:00Z',purposeAllowed:false});
 assert.equal(m.observations.length,0);assert.equal(evidenceFor(m,ctx).reason,'PURPOSE_NOT_ALLOWED');
});
test('Learning: an arrangement preference needs repeated comparable evidence and never grants admissibility',()=>{
 const good={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'},bad={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER'};
 const rows=[['a1','2026-11-01T07:00:00Z',good],['a2','2026-11-08T07:00:00Z',good],['a3','2026-11-15T07:00:00Z',good]];
 let m=updateLearningModel(createLearningModel({athleteId:ATH,purposeAllowed:true,asOf:'2026-10-01T00:00:00Z'}),[...rows.map(([id,at,r])=>({...obs(id,at,{sessionId:'s-'+id,response:r}),context:{sessionType:'RUN:QUALITY',arrangementId:'A'},comparable:true})),...rows.map(([id,at])=>({...obs('b'+id,at,{sessionId:'s-b'+id,response:bad}),context:{sessionType:'RUN:QUALITY',arrangementId:'B'},comparable:true}))],{asOf:'2026-11-30T20:00:00Z'});
 const p=preferredArrangement(m,[{id:'A'},{id:'B'}],{sessionType:'RUN:QUALITY'},{asOf:'2026-11-30T20:00:00Z'});
 assert.equal(p.preferredId,'A');assert.equal(p.causal,false);
 assert.equal(preferredArrangement(m,[{id:'B'}],{sessionType:'RUN:QUALITY'},{asOf:'2026-11-30T20:00:00Z'}).preferredId,null);
});
