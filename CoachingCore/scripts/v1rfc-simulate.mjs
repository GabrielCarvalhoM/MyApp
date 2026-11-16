// CoachingCore V1 Race Forecast (phase B): the synthetic sanity simulation of the handoff (section 8). It describes the generator below, never
// athletes: nothing here is predictive validity, and none of its numbers may become a claim in any text.
//   node scripts/v1rfc-simulate.mjs [--noise EACH|TOTAL] [--out <file>]      prints the result; writes it only when --out names a file
// Fixed before the first run (never tuned to pass; a threshold that fails is reported as it is):
// - A synthetic athlete on a 16-week 10 km plan (14 counted weeks, then taper and race week), experience class drawn evenly.
// - A true 10 km time T0 at the plan's start, and a true response R to training: {0, 0.25, 0.5, 1} inside the model; 1.5 (above the ceiling)
//   and -0.5 (regression) outside it. The true time after H effective weeks is T0 * exp(-R * G * (1 - exp(-H / 10))).
// - Adherence arm: every week near 0.95, near 0.7, near 0.4, or 0.95 with a pause of three weeks (weeks 4 to 6) at 0.
// - Two results on record: A three days before the plan, B on the last day of week 6. Each is the true time of its day times a measurement
//   noise, lognormal with sd = 0.025 / 1.2816 (the decision's own noise model for a HIGH reference). B is the reference in force.
// - The forecast is the one of week 7 (six weeks done), from B's estimate, with the pair (A, B) when the decision's rules admit it.
// - The truth is the race result: the true time at race day times a race-day noise of the same sd.
// - Baselines: B0, persistence (B's time); B2, the straight line through A and B in log time, carried to race day.
// - `--noise EACH` (the default, and the generator as it was fixed before the first run): each of the two noises has the sd above.
//   `--noise TOTAL` was added AFTER the first result was seen, to show what it depends on: the two noises together have that sd (each
//   sd / sqrt 2), which is the single-source reading the calibration's own margin is built on. It is a second description, not a correction.
// Reported per response arm and in all: how often the truth is inside the observed forecast's envelope [low, high] (unrounded); the mean
// absolute error of its central against B0 and B2; how often the fast edge is faster than the truth.
import fs from 'node:fs';
import {forecastOf,fOf,gammaOf,RACE_FORECAST} from '../src/v1-race-forecast.mjs';

const noiseArg=process.argv.indexOf('--noise'),NOISE=noiseArg>0&&process.argv[noiseArg+1]==='TOTAL'?'TOTAL':'EACH';
const FV=RACE_FORECAST.forecast,Z=FV.response.z,MARGIN=0.025,MODEL_SD=MARGIN/Z,SD=NOISE==='TOTAL'?MODEL_SD/Math.SQRT2:MODEL_SD,N=2000,SEED=20261115;
const rng=(seed=>()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;})(SEED);
const gauss=()=>{let u=0,v=0;while(u===0)u=rng();while(v===0)v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*864e5).toISOString().slice(0,10),START='2027-01-04',clamp=v=>Math.max(0,Math.min(1,v));
const ARMS={R0:0,R025:0.25,R05:0.5,R1:1,ABOVE_CEILING:1.5,REGRESSION:-0.5},ADHERENCE=['HIGH','MIDDLE','LOW','PAUSE'],CLASSES=['NOVICE','INTERMEDIATE','EXPERIENCED'];
const weekly=(arm,w)=>arm==='PAUSE'?(w>=3&&w<=5?0:clamp(0.95+0.05*gauss())):clamp({HIGH:0.95,MIDDLE:0.7,LOW:0.4}[arm]+0.08*gauss());

function one(R,arm,experience){
 const G=FV.gainCeilingLogTime[experience],a=Array.from({length:14},(_,w)=>weekly(arm,w)),T0=2400+rng()*1500,H=n=>a.slice(0,n).reduce((s,v)=>s+fOf(v,FV),0),at=n=>T0*Math.exp(-R*gammaOf(H(n),G,FV.tauWeeks));
 const A=T0*Math.exp(SD*gauss()),B=at(6)*Math.exp(SD*gauss()),truth=at(14)*Math.exp(SD*gauss());
 const weeks=Array.from({length:16},(_,i)=>({index:i,startDate:onDate(START,7*i),phase:i<14?'BUILD':i===14?'TAPER':'RACE_WEEK',zeroCredit:false,planned:true,a:i<6?a[i]:null}));
 const f=forecastOf({event:'10K',experience,unitSeconds:15,estimate:{lower:B*(1-MARGIN),central:B,upper:B*(1+MARGIN),tier:'HIGH'},weeks,completedWeeks:6,raceWeekIndex:15,reference:{date:onDate(START,41),t10:B,sigma:MODEL_SD},pairA:{date:onDate(START,-3),t10:A,sigma:MODEL_SD},previous:null,q8Down:false},FV);
 const o=f.observedForecast,b2=Math.exp(Math.log(B)+(Math.log(B)-Math.log(A))/44*(111-41));
 return {inside:truth>=o.unrounded.low&&truth<=o.unrounded.high,below:truth<o.unrounded.low,above:truth>o.unrounded.high,
  errCentral:Math.abs(o.unrounded.central/truth-1),errB0:Math.abs(B/truth-1),errB2:Math.abs(b2/truth-1),shown:o.status==='SHOWN',noGain:f.flags.length>0};
}
const out={generator:{seed:SEED,perArm:N,noise:NOISE,fixedBeforeTheFirstRun:NOISE==='EACH',measurementSd:SD,raceDaySd:SD,arms:ARMS,adherenceArms:ADHERENCE,classes:CLASSES,forecast:'OBSERVED_FORECAST of week 7, unrounded envelope'},arms:{},note:'Describes the generator only. Not athletes, not predictive validity, never a claim in any text.'};
let all=0,inside=0;
for(const [name,R] of Object.entries(ARMS)){
 const rows=Array.from({length:N},(_,k)=>one(R,ADHERENCE[k%4],CLASSES[k%3])),mean=k=>rows.reduce((s,r)=>s+r[k],0)/rows.length,share=k=>rows.filter(r=>r[k]).length/rows.length;
 out.arms[name]={response:R,insideEnvelope:share('inside'),truthFasterThanTheFastEdge:share('below'),truthSlowerThanTheSlowEdge:share('above'),mapeCentral:mean('errCentral'),mapeB0:mean('errB0'),mapeB2:mean('errB2'),shown:share('shown'),noGainAssumed:share('noGain')};
 all+=rows.length;inside+=rows.filter(r=>r.inside).length;
}
const A=out.arms,pp=0.01;
out.insideEnvelopeAll=inside/all;
// The handoff's thresholds, each with what was found. "The fast edge faster than the truth" is the truth slower than the fast edge: in the
// no-response arm the handoff bounds how often the envelope's fast edge was reached or passed by the truth; here it is how often the truth was
// faster than the fast edge (the envelope missed on the fast side).
out.thresholds={
 insideAllAtLeast80:{found:out.insideEnvelopeAll,met:out.insideEnvelopeAll>=0.8},
 insideEachArmAtLeast60:{found:Object.fromEntries(Object.entries(A).map(([k,v])=>[k,v.insideEnvelope])),met:Object.values(A).every(v=>v.insideEnvelope>=0.6)},
 mapeCentralNotAboveB0WhereResponseAtLeastHalf:{found:{R05:[A.R05.mapeCentral,A.R05.mapeB0],R1:[A.R1.mapeCentral,A.R1.mapeB0]},met:A.R05.mapeCentral<=A.R05.mapeB0&&A.R1.mapeCentral<=A.R1.mapeB0},
 mapeCentralWithinOnePointOfB0WithNoResponse:{found:[A.R0.mapeCentral,A.R0.mapeB0],met:A.R0.mapeCentral<=A.R0.mapeB0+pp},
 truthFasterThanTheFastEdgeAtMost10WithNoResponse:{found:A.R0.truthFasterThanTheFastEdge,met:A.R0.truthFasterThanTheFastEdge<=0.1}};
out.allMet=Object.values(out.thresholds).every(t=>t.met);
const text=JSON.stringify(out,null,1)+'\n',i=process.argv.indexOf('--out');
if(i>0&&process.argv[i+1])fs.writeFileSync(process.argv[i+1],text);
console.log(text);
