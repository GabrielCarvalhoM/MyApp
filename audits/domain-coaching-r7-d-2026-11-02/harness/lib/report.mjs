// Domain-evaluation packet and summary. The packet gives a domain judge what each case asked, what the athlete did and said, what the coach
// decided at each step (current week as prescription, next week marked provisional), the automated results and the author's assessment.
import {live} from './client.mjs';
import {classifyEligibility} from './properties.mjs';

const loadText=l=>!l?'':l.mode==='KNOWN'?`${l.value}kg ${l.convention??''}`.trim():l.mode==='BODYWEIGHT'?'BW':l.mode==='FROM_LOG'?'last logged':l.mode==='ESTABLISH'?'establish':l.mode??'';
export function sessionText(s){
 if(!s.prescription)return `d${s.day} ${s.sport} ${s.role}${s.status&&s.status!=='PLANNED'?' ['+s.status+']':''}`;
 const p=s.prescription,st=s.status&&s.status!=='PLANNED'?` [${s.status}]`:'';
 if(s.sport==='RUN'){const w=p.work?(Number.isFinite(p.work.workSeconds)?` ${p.work.repetitions}x(${p.work.workSeconds}s jog/${p.work.recoverySeconds}s walk)`:` ${p.work.repetitions}x${p.work.workMinutes}'/${p.work.recoveryMinutes}'`):'';const strides=p.strides?` +strides`:'';return `d${s.day} ${s.date} ${s.turn??''} RUN ${s.role} ${p.durationMinutes}min (${p.family}${w}${strides}${p.completion?', completion':''})${st}`;}
 return `d${s.day} ${s.date} ${s.turn??''} ${s.role} ${p.durationMinutes}min: `+(p.exercises??[]).map(e=>`${e.id} ${e.sets}x${e.reps}${Number.isFinite(e.rir)?' RIR'+e.rir:''} ${loadText(e.load)}`).join('; ')+st;
}
const weekText=(plan,k,fromDate=null)=>{const w=plan?.weeks?.[k];if(!w)return null;return {week:k,phase:w.phase,startDate:w.startDate,sessions:w.sessions.filter(s=>(s.prescription||s.role==='REST_BY_DESIGN')&&(!fromDate||s.date>=fromDate)).map(sessionText)};};
function reportText(o){
 const a=o.actual??{},r=o.response??{};
 const resp=['performance','recovery','effort','nextDayFunction'].map(k=>r[k]&&r[k]!=='UNKNOWN'?`${k}=${r[k]}`:null).filter(Boolean).join(',');
 const ex=Array.isArray(a.exercises)?` ${a.exercises.length} exercises`:'';
 return `${o.sessionId} ${a.completed?'done':'not done'}${Number.isFinite(a.minutes)?' '+a.minutes+'min':''}${ex}${resp?' ('+resp+')':''}${o.reportedAt?' reportedAt '+o.reportedAt:''}${o.observedAt?' at '+o.observedAt:''}${o.correctionOf?' corrects '+o.correctionOf:''}${o.source?.provider?' via '+o.source.provider:''}`;
}
function intakeSummary(i){
 const a=i.athlete??{};
 return {startDate:i.startDate,weeks:i.weeks,asOf:i.asOf,tz:i.timezoneOffsetMinutes??0,learningConsent:i.learningConsent??null,eligibility:classifyEligibility(a.eligibility),goals:a.goals,event:a.event??(typeof a.goals?.run==='object'?a.goals.run.event:null),runExperience:a.runExperience??null,strengthExperience:a.strengthExperience??null,recent:a.recent??null,knownRuns:(a.knownRuns??[]).length,knownExercises:(a.knownExercises??[]).map(k=>`${k.id} ${k.sets}x${k.reps} ${k.load?.value}${k.load?.unit} ${k.load?.convention}`),equipment:a.equipment??null,pause:a.pause??null,wearable:a.wearableCapabilities?.completeness??null,history:(i.history??[]).length,ageYears:a.ageYears??null,specialPopulation:a.specialPopulation??null,schedule:i.schedule};
}
export function domainPacket(rows,report){
 const cases=[];
 for(const row of rows){
  if(!row.base){cases.push({caseId:row.caseId,corpusError:row.corpusError??null,harnessError:row.harnessError??null});continue;}
  const {kase,base}=row,g=base.generation,gp=g?.program;
  const raceWeek=gp?gp.weeks.findIndex(w=>w.phase==='RACE_WEEK'):-1;
  const steps=base.steps.map(s=>{
   const r=s.result,rv=s.review,next=s.weekIndex+1;
   return {stepId:s.stepId,asOf:s.asOf,kind:s.kind,week:s.weekIndex,
    athlete:{eligibility:classifyEligibility(rv.eligibility),reports:(rv.observations??[]).map(reportText),...(rv.changes?{changes:rv.changes}:{}),...(rv.interruption?{interruption:rv.interruption}:{}),...(rv.substitution?{substitution:rv.substitution}:{}),...(rv.currentDemonstration?{currentDemonstration:rv.currentDemonstration}:{}),...(rv.signals?{signals:rv.signals}:{}),...(rv.choices?{choices:rv.choices}:{}),...(rv.loadConfirmations?{loadConfirmations:rv.loadConfirmations}:{}),...(typeof rv.learningConsent==='boolean'?{learningConsent:rv.learningConsent}:{}),...(s.clearance?{clearance:'QUALIFIED_CLEARANCE'}:{}),notes:s.notes},
    coach:{status:r.status,action:r.action,validity:r.planValidity?.status,question:r.question?{kind:r.question.kind,fromWeek:r.question.fromWeek,sessions:(r.question.unreported?.sessionIds??[]).length}:null,reason:r.reason,missingInputs:r.missingInputs,offers:(r.offers??[]).map(o=>o.type??o.id),loadQuestions:(r.loadQuestions??[]).length,gates:r.gates??null,adopted:s.adopted,
     currentWeek:weekText(s.planAfter,s.weekIndex,s.asOfLocal),nextWeekProvisional:weekText(s.planAfter,next)}};
  });
  const failures=Object.values(row.properties).filter(p=>p.result==='FAIL').map(p=>({property:p.id,name:p.name,violations:p.violations.slice(0,8),more:Math.max(0,p.violations.length-8)}));
  const notEvaluable=Object.values(row.properties).filter(p=>p.notEvaluable.length).map(p=>({property:p.id,units:p.notEvaluable.length,example:p.notEvaluable[0]}));
  const mviol=Object.entries(row.relations??{}).filter(([,r])=>(r.violations??[]).length).map(([k,r])=>({relation:k,violations:r.violations.slice(0,3)}));
  const mdiff=Object.entries(row.relations??{}).filter(([,r])=>(r.differences??[]).length).map(([k,r])=>({relation:k,blocking:r.blocking,differences:r.differences}));
  cases.push({caseId:row.caseId,authorIntent:kase.authorIntent,coverageTags:kase.coverageTags,oracleClass:kase.oracleClass,intake:intakeSummary(base.intake),
   generation:{status:g?.status,reason:g?.reason,missingInputs:g?.missingInputs??[],phases:gp?gp.weeks.map(w=>w.phase):null,week0:weekText(gp,0),week1:weekText(gp,1),raceWeek:raceWeek>=0?weekText(gp,raceWeek):null,weekBeforeRace:raceWeek>0?weekText(gp,raceWeek-1):null},
   steps,stopped:base.stopped,corpusErrors:base.corpusErrors,runtimeErrors:base.runtimeErrors,
   automated:{failures,notEvaluable},metamorphic:{violations:mviol,nonBlockingDifferences:mdiff},
   authorExpectations:row.expectations,independentAssessment:kase.independentAssessment,domainNotes:kase.domainNotes,authorRelations:kase.metamorphicRelations??[]});
 }
 const json={packet:'R7D-DOMAIN-PACKET-1',harness:report.harness,firstEvaluation:report.firstEvaluation,runtime:{revision:report.runtime.revision,commit:report.runtime.commit},corpus:report.corpus,cases};
 return {json,md:packetMarkdown(json)};
}
const j=v=>'`'+JSON.stringify(v)+'`';
function packetMarkdown(p){
 const L=[`# R7-D domain-evaluation packet (${p.corpus.revision??'corpus'})`,'',`Runtime ${p.runtime.revision} (${p.runtime.commit?.slice(0,7)}), harness ${p.harness}, first evaluation: ${p.firstEvaluation}. Corpus sha256 ${p.corpus.sha256}.`,'','Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author\'s expectations and independent assessment.',''];
 for(const c of p.cases){
  L.push(`## ${c.caseId}`,'');
  if(c.corpusError||c.harnessError){L.push('**Not evaluated:** '+j(c.corpusError??c.harnessError),'');continue;}
  L.push(`**Intent.** ${c.authorIntent}`,'',`**Tags.** ${c.coverageTags.join(', ')} · oracle ${c.oracleClass}`,'',`**Intake.** ${j(c.intake)}`,'');
  const g=c.generation;
  L.push(`**Onboarding.** ${g.status}: ${g.reason??''}${g.missingInputs?.length?' · missing '+j(g.missingInputs):''}`);
  if(g.phases)L.push('',`- Phases: ${g.phases.join(' · ')}`,`- Week 0 (${g.week0.phase}): ${g.week0.sessions.join(' | ')}`,`- Week 1 (${g.week1?.phase}): ${g.week1?.sessions.join(' | ')}`);
  if(g.weekBeforeRace)L.push(`- Week ${g.weekBeforeRace.week} (${g.weekBeforeRace.phase}): ${g.weekBeforeRace.sessions.join(' | ')}`);
  if(g.raceWeek)L.push(`- Week ${g.raceWeek.week} (${g.raceWeek.phase}): ${g.raceWeek.sessions.join(' | ')}`);
  L.push('');
  for(const s of c.steps){
   const a=s.athlete,co=s.coach;
   L.push(`### ${s.stepId} · ${s.asOf} · ${s.kind} (week ${s.week})`,'');
   const said=[a.eligibility!=='CONFIRMED'?`eligibility ${a.eligibility}`:null,a.clearance?'qualified clearance':null,a.reports.length?`${a.reports.length} report(s): ${a.reports.join('; ')}`:'no reports',a.changes?'changes '+j(a.changes):null,a.interruption?'break '+j(a.interruption):null,a.substitution?'substitution '+j(a.substitution):null,a.currentDemonstration?'demonstration '+j(a.currentDemonstration):null,a.signals?'signals '+j(a.signals):null,a.choices?'choices '+j(a.choices):null,a.loadConfirmations?'load confirmations '+j(a.loadConfirmations):null,a.learningConsent!==undefined?'learning consent '+a.learningConsent:null,a.notes?.length?'client notes '+a.notes.join(','):null].filter(Boolean);
   L.push(`- Athlete: ${said.join(' · ')}`);
   L.push(`- Coach: **${co.status}** / ${co.action} · ${co.validity}${co.question?` · question ${co.question.kind} (${co.question.sessions} sessions, from week ${co.question.fromWeek})`:''}${co.offers.length?' · offers '+co.offers.join(','):''}${co.loadQuestions?` · ${co.loadQuestions} load question(s)`:''}${co.adopted?' · new plan':''}`);
   L.push(`- Reason: ${co.reason}`);
   if(co.gates)L.push(`- Gates: ${j(co.gates)}`);
   if(co.currentWeek)L.push(`- Current week ${co.currentWeek.week} (${co.currentWeek.phase}) from ${s.asOf.slice(0,10)}: ${co.currentWeek.sessions.join(' | ')||'—'}`);
   if(co.nextWeekProvisional)L.push(`- Next week ${co.nextWeekProvisional.week} (${co.nextWeekProvisional.phase}, provisional): ${co.nextWeekProvisional.sessions.join(' | ')}`);
   L.push('');
  }
  if(c.stopped)L.push(`**Run stopped:** ${c.stopped} ${j(c.corpusErrors??[])} ${j(c.runtimeErrors??[])}`,'');
  L.push('**Automated properties.** '+(c.automated.failures.length?c.automated.failures.map(f=>`${f.property} FAIL ${j(f.violations)}`).join(' · '):'no failure')+(c.automated.notEvaluable.length?' · not evaluable: '+c.automated.notEvaluable.map(n=>`${n.property} (${n.units})`).join(', '):''),'');
  L.push('**Metamorphic.** '+(c.metamorphic.violations.length?c.metamorphic.violations.map(v=>`${v.relation} ${j(v.violations)}`).join(' · '):'no violation')+(c.metamorphic.nonBlockingDifferences.length?' · non-blocking differences: '+c.metamorphic.nonBlockingDifferences.map(d=>d.relation).join(', '):''),'');
  L.push('**Author expectations.**',...(c.authorExpectations.length?c.authorExpectations.map(e=>`- ${e.expectationId} @${e.atStep} ${e.type} [${e.oracleClass}]: **${e.result}**${e.observed!==undefined?' observed '+j(e.observed):''}${e.statement?' — '+e.statement:''}${e.reason?' ('+e.reason+')':''}`):['- none']),'');
  const ia=c.independentAssessment??{};
  L.push('**Independent assessment (author, written before any output).**',`- Rationale: ${ia.rationale}`,`- Preferred: ${ia.preferredCoachingBehavior}`,`- Acceptable alternatives: ${(ia.acceptableAlternatives??[]).join(' / ')||'—'}`,`- Concerns: ${(ia.concerns??[]).join(' / ')||'—'}`,`- Domain notes: ${c.domainNotes||'—'}`,'');
 }
 return L.join('\n')+'\n';
}
export function summaryMarkdown(r){
 const L=[`# R7-D harness run summary${r.label?' — '+r.label:''}`,'',`- Harness ${r.harness}; first evaluation: ${r.firstEvaluation}; ${r.startedAt} → ${r.finishedAt}; node ${r.node}.`,`- Runtime ${r.runtime.revision} (${r.runtime.commit}), files ${r.runtime.same}/${r.runtime.files} equal to the record.`,`- Corpus ${r.corpus.revision} (${r.corpus.cases} cases), sha256 ${r.corpus.sha256}.`,`- Freshness: ${r.freshness.length?r.freshness.join('; '):'all checks pass'}.`,`- Structure: ${r.structure.errors.length} error(s), ${r.structure.warnings.length} warning(s).`,`- Evaluated ${r.summary.evaluated}/${r.summary.cases}; corpus errors ${r.summary.corpusErrors}; harness errors ${r.summary.harnessErrors}.`,'','| Property | Result | Units | Violations | Not evaluable | Failing cases |','|---|---|---|---|---|---|'];
 for(const [k,p] of Object.entries(r.summary.properties))L.push(`| ${k} | ${p.result} | ${p.units} | ${p.violations} | ${p.notEvaluableUnits} | ${p.failingCases.join(', ')} |`);
 L.push('','| Relation | Applicable cases | Units | Violations | Failing cases | Non-blocking differences |','|---|---|---|---|---|---|');
 for(const [k,x] of Object.entries(r.summary.relations))L.push(`| ${k} | ${x.applicableCases} | ${x.units} | ${x.violations} | ${x.failingCases.join(', ')} | ${x.differenceCases.join(', ')} |`);
 L.push('',`Author expectations: ${JSON.stringify(r.summary.expectations)}.`);
 if(r.corpusErrors.length)L.push('','Corpus errors:',...r.corpusErrors.map(e=>`- ${e.caseId}: ${JSON.stringify(e.errors).slice(0,400)}`));
 if(r.harnessErrors.length)L.push('','Harness errors:',...r.harnessErrors.map(e=>`- ${e.caseId}: ${JSON.stringify(e.error).slice(0,400)}`));
 return L.join('\n')+'\n';
}
