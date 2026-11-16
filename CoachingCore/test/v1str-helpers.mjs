// V1 Strength Extension (Founder request of 2026-11-16; SI-V1-SSCTR-SQ-1 to SQ-4): shared helpers of its directed tests (not a test file).
// The timeline is a conforming client of the composed entry point (v1-strength-index.mjs): it keeps the plan, the engine's record, the reference
// state and every record of the run extensions that an answer returns, and sends each back with the next review.
import fs from 'node:fs';
import * as S from '../src/v1-strength-index.mjs';
import * as P from '../src/v1-run-forecast-index.mjs';
import {devStrength,STRENGTH_VALUES_URL,STRENGTH_BOUNDARIES} from '../src/v1-strength.mjs';
import {configurationOf,CONFIGURATIONS} from '../src/r7b-repertoire.mjs';
import {DEV as RUN_DEV,ELIG,addDays,live,hash} from './v1rfc-helpers.mjs';
export {S,P,ELIG,addDays,live,hash,configurationOf,CONFIGURATIONS,STRENGTH_BOUNDARIES,devStrength};
export const VALUES=JSON.parse(fs.readFileSync(STRENGTH_VALUES_URL,'utf8'));
export const B=STRENGTH_BOUNDARIES,HOLDS=VALUES.holdDose.configurations;
/** Every boundary of every extension on, over the files as read (development authorities). */
export const DEV={...RUN_DEV,strengthExtension:devStrength()};
/** The run extensions on and this one off: the state before any enabling record of it. */
export const OFF={...RUN_DEV,strengthExtension:devStrength([])};
/** Only the boundaries named on. */
export const only=(...names)=>({...RUN_DEV,strengthExtension:devStrength(names.map(n=>B[n]))});

export const AS_OF='2026-11-13',START='2026-11-16';
export const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
/** The nine equipment profiles of the catalog (FULL, MACH_DB, DB_BENCH, DB, KB, BANDS, BANDS_PULLUP, PULLUP, BW) and three more (MACHINES, DB_BANDS, BAR). */
export const EQUIPMENT={FULL,DB_BENCH:['DUMBBELLS','BENCH'],DB:['DUMBBELLS'],BW:[],MACH_DB:['DUMBBELLS','BENCH','MACHINES'],MACHINES:['MACHINES'],BANDS:['BANDS'],DB_BANDS:['DUMBBELLS','BANDS'],BAR:['BARBELL','RACK','BENCH'],KB:['KETTLEBELL'],BANDS_PULLUP:['BANDS','PULL_UP_BAR'],PULLUP:['PULL_UP_BAR']};
/** A strength intake: `months` of strength training set the experience class the intake derives; `known` are the athlete's named exercises. */
export const MONTHS={NONE:0,NOVICE:6,INTERMEDIATE:24,EXPERIENCED:60};
/** `experience` states the strength experience class (NONE: new to strength, nothing done recently); `months` alone leaves the intake to derive it. */
export const lifter=({id='str-athlete',experience=null,months=experience?MONTHS[experience]:24,goal='GENERAL',equipment=FULL,days=[1,4],minutes=60,known=[],weeks=12,run='NONE',recent={},schedule={},athlete={},rotation='COACH_DECIDES'}={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:AS_OF,startDate:START,weeks,timezoneOffsetMinutes:-180,learningConsent:true,
 athlete:{id,ageYears:32,eligibility:ELIG(AS_OF),strengthTrainingMonths:months,...(experience?{strengthExperience:experience}:{}),runTrainingMonths:run==='NONE'?0:36,goals:{run,strength:goal},equipment,recent:{strengthDaysPerWeek:experience==='NONE'?0:days.length,...recent},exerciseRotationPreference:rotation,...(known.length?{knownExercises:known}:{}),...athlete},
 schedule:{strengthDays:days,strengthMinutes:minutes,...schedule}});
/** A hybrid intake: a 10 km race plan with RUNNING_SUPPORT strength. */
export const hybrid=({goal='RUNNING_SUPPORT',equipment=FULL,days=[2,5],known=[],months=18,weeks=12,event='10K',id='str-hybrid',minutes=45}={})=>lifter({id,months,goal,equipment,days,minutes,known,weeks,run:{kind:'RACE',event:{kind:event,date:addDays(START,weeks*7-1)}},
 recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80},schedule:{runDays:[1,3,5,6],runMinutes:50,longRunMinutes:90,longRunDay:6,runTurn:'AM',strengthTurn:'PM'}});
/** An exercise the athlete names as familiar, with no dose. */
export const familiar=id=>({id,familiar:true,current:true,tolerated:true,observedAt:'2026-11-06'});
/** An exercise the athlete names with a current working dose. */
export const known=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-06'});

export const strengthSessions=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
export const rowsOf=(p,w)=>strengthSessions(p,w).flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
export const idsOf=p=>[...new Set(p.weeks.flatMap((_,w)=>rowsOf(p,w).map(x=>x.e.id)))];
/** The configuration of each template slot, by template type and slot: the selection a plan holds. */
export const slots=p=>Object.fromEntries([...(p.templates??[]),...(p.noviceTemplates??[]).map(t=>({...t,type:t.type+'@novice'}))].flatMap(t=>t.rows.map(r=>[t.type+':'+r.slot,r.entry.id])));
export const mainsOf=p=>Object.fromEntries((p.templates??[]).flatMap(t=>t.rows.filter(r=>r.role==='MAIN').map(r=>[t.type+':'+r.slot,r.entry.id])));
export const planesOf=p=>[...new Set(idsOf(p).map(id=>configurationOf(id)?.subpattern))].filter(s=>/^(VERTICAL|HORIZONTAL)_/.test(s??'')).sort();
/** The report of a session done as prescribed; a strength set logged at the prescribed repetitions and reserve (a load chosen by effort at `kg`). */
export function report(p,s,{kg=20,completed=true,response={},exercises=null}={}){
 const x=s.prescription,a={completed,...(completed?{minutes:x.durationMinutes}:{})};
 if(x.modality==='STRENGTH'&&completed)a.exercises=exercises??x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:{load:{value:e.load.mode==='KNOWN'||Number.isFinite(e.load.value)?e.load.value:kg,unit:'KG',convention:e.load.convention}}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));
 return {eventId:'str-done-'+p.id.slice(-6)+'-'+s.id,athleteId:p.athleteId,sessionId:s.id,actual:a,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL',...response},occurrenceDate:s.date};
}
/** The conforming client. `entry`: the entry point it talks to (this extension's by default). */
export function timeline(intake,{opts=DEV,prefix='str',entry=S}={}){
 const g=entry.generateProgram(intake,opts);
 const t={g,p:g.program,ledger:[],ref:null,ev:g.runEvidenceRecord??[],fmt:g.runFormatRecord??[],hist:g.runHistoryRecord??[],rev:g.paceRevisionRecord??[],n:0,results:[g],opts,last:g};
 if(!t.p)return t;
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=t.day(w,d),{eventId,eligibility,observations,...more}=extra;return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:eventId??`${prefix}-${++t.n}`,kind},eligibility:eligibility??ELIG(day),observations:observations??[],...more,
  ...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist,paceRevisionRecord:t.rev};};
 t.take=r=>{t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.ev=r.runEvidenceRecord??t.ev;t.fmt=r.runFormatRecord??t.fmt;t.hist=r.runHistoryRecord??t.hist;t.rev=r.paceRevisionRecord??t.rev;t.results.push(r);t.last=r;return r;};
 t.step=(w,d,kind,extra={},time='20:00',opts=t.opts)=>t.take(entry.evaluateProgram(t.p,t.review(w,d,kind,extra,time),opts));
 /** The weekly review of week w (Sunday evening), every live session reported as prescribed; `how(session)` gives report options, or false for not done. */
 t.week=(w,how=()=>({}),extra={})=>t.step(w,6,'WEEKLY_REVIEW',{...extra,observations:t.p.weeks[w].sessions.filter(live).map(s=>{const o=how(s);return o===false?report(t.p,s,{completed:false}):report(t.p,s,o??{});})});
 t.weeks=(from,to,how)=>{for(let w=from;w<=to;w++)t.week(w,how);return t;};
 return t;
}
