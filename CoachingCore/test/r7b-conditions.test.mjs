// DOMAIN_COACHING_R7-B: SSCTR r2 conditions not exercised elsewhere. B0-C01 c9 (graduation never exempts the race-day completion rule),
// B0-C07 c6 (a subpattern-changing ladder link keeps a horizontal push in the week), and the claims no text may make (B0-C02 c4, B0-C03 c4,
// B0-C05 c4, B0-C11 c7; catalog safety.productMustNot).
import test from 'node:test';
import assert from 'node:assert/strict';
import {program,reviewed,weekly,review,evaluateProgram,opts,FULL,live,obs,gen} from '../r7/b/fixtures/helpers.mjs';
import {raceDayCompletionBasis,skeletonOf} from '../src/r6-program.mjs';
import {FORBIDDEN_CLAIM} from '../src/r6-prescription.mjs';

test('B0-C01 c9: a graduated athlete whose program used walk/jog or a restart still completes the race with walk breaks (D47)',()=>{
 const p=program({id:'c-c9',goals:{run:'RACE',strength:'NONE'},event:{kind:'10K',date:'2027-02-14'},weeks:16,runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:12},schedule:{strengthDays:[]}});
 const sk=skeletonOf(p,opts.authority);
 for(const history of [['WALK_JOG'],['RESTART']])assert.equal(raceDayCompletionBasis(sk,{mode:'EASY',qualityRunner:true,graduatedAt:8,modeHistory:history,achieved:{long:60}}),'PROGRAM_HISTORY',history[0]);
});

test('B0-C07 c6: push-up → pike-push-up is offered only while another PUSH slot of the week keeps a horizontal push',()=>{
 const at=(id,strength,days)=>{const t=reviewed({id,equipment:[],strengthExperience:'INTERMEDIATE',goals:{run:'PERFORMANCE',strength},rotation:'COACH_DECIDES',weeks:16,schedule:{strengthDays:days}},4);
  const r=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s))}),actualLedger:t.ledger},opts);
  return {offers:r.offers??[],used:new Set(t.p.weeks[4].sessions.flatMap(s=>s.prescription?.exercises??[]).map(e=>e.id))};};
 const only=at('c-pike-only','HYPERTROPHY',[0,4]);assert.ok(only.used.has('push-up')&&!only.used.has('incline-push-up'));
 assert.ok(!only.offers.some(o=>o.to==='pike-push-up'),'push-up is the only horizontal push: no pike step');
 const kept=at('c-pike-kept','GENERAL',[0,2,4]);assert.ok(kept.used.has('push-up')&&kept.used.has('incline-push-up'));
 assert.ok(kept.offers.some(o=>o.from==='push-up'&&o.to==='pike-push-up'),'another horizontal push stays in the week: the pike step is offered');
});

test('No program text claims injury prevention, rehabilitation, pain relief or a physiological threshold (prescriptions, explanations, negotiation, disclosures)',()=>{
 const texts=[];
 const collect=g=>{for(const n of g.negotiation??[])texts.push(n.detail??'',...(n.options??[]));const p=g.program;if(!p)return;
  for(const w of p.weeks)for(const s of w.sessions){texts.push(s.explanation??'');for(const t of s.prescription?.instructions??[])texts.push(t);for(const e of s.prescription?.exercises??[])texts.push(...e.instructions);texts.push(s.prescription?.effort??'');}};
 for(const strength of ['RUNNING_SUPPORT','HYPERTROPHY','STRENGTH','GENERAL'])for(const eq of [FULL,[],['BANDS','PULL_UP_BAR'],['KETTLEBELL']])collect(gen({id:`c-claims-${strength}-${eq.length}`,goals:{run:'PERFORMANCE',strength},equipment:eq,strengthExperience:'NONE',schedule:{strengthDays:[0,2,4,5]}}));
 collect(gen({id:'c-claims-event',goals:{run:'RACE',strength:'RUNNING_SUPPORT'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80,strengthDaysPerWeek:2},schedule:{runDays:[1,3,4,6],longRunMinutes:120}}));
 const t=reviewed({id:'c-claims-review',goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'COACH_DECIDES',weeks:12},5);
 for(const r of [t.last])for(const d of r.disclosures??[])texts.push(d.detail??'');
 assert.ok(texts.length>5000);
 const bad=texts.filter(x=>FORBIDDEN_CLAIM.test(x));assert.deepEqual(bad,[]);
});
