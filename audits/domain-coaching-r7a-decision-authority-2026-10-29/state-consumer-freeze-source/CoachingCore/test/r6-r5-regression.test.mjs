import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {evaluateHoldoutCase,factObservation} from '../scripts/evaluate-holdout-r6.mjs';
import {legacyDirection,legacyAlternative} from '../src/r6-legacy.mjs';
import {generateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const CORPUS=new URL('../r5/holdout/R5_INDEPENDENT_HOLDOUT.json',import.meta.url);
const bytes=fs.readFileSync(CORPUS),corpus=JSON.parse(bytes),opts={authority:devAuthority()};
const kase=id=>corpus.cases.find(c=>c.caseId==='R5-'+id);
const run=id=>evaluateHoldoutCase(structuredClone(kase(id)),opts);

test('R5 regression: the frozen R5 corpus and first raw are byte-identical to their manifests',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../r5/holdout/INDEPENDENCE_MANIFEST.json',import.meta.url)));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.corpusSha256);
 const first=fs.readFileSync(new URL('../r5/holdout/FIRST_EVALUATION.json',import.meta.url));
 assert.equal(createHash('sha256').update(first).digest('hex'),'c202e0ab2b5e1217a85ce2e174b35130b731c03d8dc2c053a3aa75d8bf4357d4');
});
test('Root cause VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES (H02/H09/H13): dependent duration follows sets; the baseline is never blocked',()=>{
 const anchor=kase('H02').programInput.athlete.anchors.find(a=>a.id==='lower-primary'),alt=anchor.alternatives.find(a=>a.id==='lower-less-volume');
 assert.deepEqual(legacyDirection(anchor.prescription,alt.prescription).direction,'REGRESS');
 for(const id of ['H02','H09','H13'])assert.equal(run(id).generation.status,'PROPOSED',id);
 assert.equal(run('H09').steps[0].result.action,'PROGRESS');
 assert.deepEqual(run('H13').steps.map(s=>s.result.action),['KEEP','KEEP','REGRESS']);
});
test('Root cause STALE_ALTERNATIVE_POISONS_BASELINE (H24): stale alternatives are excluded individually; replays and contradictions never count',()=>{
 const o=run('H24');assert.equal(o.generation.status,'PROPOSED');
 assert.ok(o.generation.excludedAlternatives.every(x=>x.reasons.includes('STALE_OR_FUTURE_SUPPORT')||x.reasons.some(r=>r.startsWith('DIRECTION'))));
 assert.ok(o.steps.every(s=>s.result.action==='KEEP'));
 assert.ok(o.steps.every(s=>s.result.excludedObservations.some(e=>e.reason==='STALE_OBSERVATION')));
});
test('Root cause BALANCED_INPUT_ORDER (H03/H11/H20): generation compares joint harm, independent of option order',()=>{
 const o=run('H03');assert.equal(o.generation.ranking.basis,'LOWEST_WORST_CASE_JOINT_HARM');
 const reversed=structuredClone(kase('H03'));reversed.programInput.scheduleOptions.reverse();
 assert.equal(evaluateHoldoutCase(reversed,opts).generation.program.selectedScheduleId,o.generation.program.selectedScheduleId);
 const swapped=structuredClone(kase('H03'));swapped.programInput.scheduleOptions=swapped.programInput.scheduleOptions.map(x=>({...x,id:{'protect-run':'zz-run','protect-strength':'aa-strength','known-adverse-copy':'mm-adverse'}[x.id]}));
 assert.equal(evaluateHoldoutCase(swapped,opts).generation.program.selectedScheduleId,'zz-run','identifier order is not a preference either');
 const lost=o.generation.counterfactuals.find(c=>c.id==='protect-strength');assert.ok(lost.costs.some(c=>c.axis==='run'));
 const noAuthority=evaluateHoldoutCase(structuredClone(kase('H03')),{authority:devAuthority(['R6-COLD-START','R6-PLANNED-PROGRESSION'])});
 assert.equal(noAuthority.generation.status,'ASK','without severity authority the real trade-off is asked');
});
test('Root cause BALANCED_INITIAL_GENERATION (H20): the initial generation is fixed, not only the later move',()=>{
 const o=run('H20');assert.equal(o.generation.status,'PROPOSED');assert.equal(o.generation.ranking.basis,'LOWEST_WORST_CASE_JOINT_HARM');
 assert.equal(o.steps[0].result.action,'MOVE');
});
test('Root cause ADAPTER_CLOCK (H07/H08/H10/H11): an omitted time never becomes a clock after the review',()=>{
 for(const id of ['H07','H08','H10','H11']){
  const c=kase(id),steps=c.operation==='SEQUENCE'?c.steps:[c];
  const o=run(id);
  o.steps.forEach((s,i)=>{for(const x of s.review.observations)assert.ok(Date.parse(x.observedAt)<=Date.parse(steps[i].review.asOf),id+' '+x.observedAt);});
  assert.ok(o.steps.every(s=>s.result.status!=='HOLD'),id);
 }
 assert.deepEqual(run('H08').steps.map(s=>s.result.action),['KEEP','KEEP','PROGRESS']);
 assert.equal(run('H10').steps[0].result.action,'DISCARD');
});
test('Root cause RETURN_PREPARATION_DIMENSION (H16): a known nonclinical return reuses the current demonstration and stages strength',()=>{
 const r=run('H16').steps[0].result;assert.equal(r.action,'REESTABLISH');
 const run20=r.prescriptions.find(p=>p.anchorId==='conversational-run');assert.equal(run20.prescription.durationMinutes,20);
 assert.ok(r.prescriptions.filter(p=>p.prescription.modality==='STRENGTH').every(p=>p.prescription.exercises.every(e=>e.sets===1&&e.rir>=4)));
 assert.ok(r.proposal.weeks.slice(4).every(w=>w.requiresReconciliationBeforeExecution));
 assert.equal(run('H15').steps[0].result.status,'ASK');assert.equal(run('H17').steps[0].result.status,'CLINICAL_HUMAN_REQUIRED');
});
test('Root cause SUBSTITUTION_NOT_SELECTED (H19): supplied admissible substitutes enter the candidate set and are disclosed',()=>{
 const r=run('H19').steps[0].result;assert.equal(r.action,'SUBSTITUTE');
 assert.deepEqual(r.substitutions.map(s=>s.alternativeId).sort(),['practice-a-hotel','practice-b-hotel']);
 assert.ok(r.proposal.weeks[2].sessions.every(s=>s.prescription.equipment.every(e=>['OUTDOOR','BODYWEIGHT'].includes(e))));
});
test('Root cause UNKNOWN_COMBINED_TOLERANCE (H21): unknown arrangement recovery stays admissible under whole-week tolerance; history informs the choice',()=>{
 const o=run('H21');assert.equal(o.generation.status,'PROPOSED');
 const r=o.steps[0].result;assert.equal(r.action,'KEEP');assert.match(r.reason,/3 comparable compatible.*3 comparable adverse/);
});
test('Event transition in the legacy path (H01/H22): taper and race week are derived from the athlete baseline',()=>{
 const p=run('H01').generation.program;assert.equal(p.gaps.length,0);
 const race=p.weeks.find(w=>w.phase==='EVENT');assert.ok(race.sessions.some(s=>s.race));
 const taper=p.weeks.find(w=>w.phase==='TAPER');assert.ok(taper.plannedRunMinutes<p.weeks[taper.index-1].plannedRunMinutes);
 assert.ok(run('H22').generation.program.weeks.find(w=>w.phase==='EVENT').sessions.some(s=>s.race));
});
test('Bounded R5 behaviors stay correct: H06 asks, H12/H14/H23 keep',()=>{
 assert.equal(run('H06').generation.status,'ASK');
 for(const id of ['H12','H14','H23'])assert.equal(run(id).steps[0].result.status,'KEEP',id);
});
test('Adapter: day-precision facts take the latest causal instant of the session day',()=>{
 const program={athleteId:'a',weeks:[{sessions:[]}],goal:{priority:'BALANCED'}},source={id:'w0-x',date:'2026-11-06',prescription:{modality:'RUN',family:'EASY',durationMinutes:30,equipment:[]},weekIndex:0};
 const o=factObservation({...program,weeks:[{phase:'X',sessions:[source]}]},source,{completed:true,actualStimulus:null},'c','2026-11-08T20:00:00Z');
 assert.equal(o.observedAt,'2026-11-06T23:59:59Z');assert.equal(o.timePrecision,'DAY');
 const same=factObservation({...program,weeks:[{phase:'X',sessions:[source]}]},{...source,date:'2026-11-08'},{completed:true,actualStimulus:null},'c','2026-11-08T20:00:00Z');
 assert.equal(same.observedAt,'2026-11-08T20:00:00.000Z');
});
test('Legacy alternative admissibility is per alternative and reasons are explicit',()=>{
 const a=kase('H24').programInput.athlete.anchors.find(x=>x.id==='lower-primary');
 const r=legacyAlternative(a,a.alternatives[0],kase('H24').programInput.athlete.anchors,kase('H24').programInput.asOf);
 assert.equal(r.admissible,false);assert.ok(r.reasons.includes('STALE_OR_FUTURE_SUPPORT'));
 assert.equal(generateProgram(kase('H24').programInput,opts).status,'PROPOSED');
});
test('Legacy unknown arrangement response is admissible only with LOW interference and no same-day pairing (SSCTR D26)',()=>{
 const r=run('H21'),cf=r.generation.counterfactuals;
 const strength=cf.find(c=>c.id==='protect-strength');
 assert.equal(strength.admissible,false);assert.match(strength.reason,/needs arrangement evidence/);
 assert.equal(r.generation.program.selectedScheduleId,'protect-run');
});
