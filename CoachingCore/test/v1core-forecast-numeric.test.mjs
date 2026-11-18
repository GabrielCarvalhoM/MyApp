// V1 Core Safety & Lifecycle, Race Forecast numeric contract (policy A, RFC-NUMERIC-1; P0 device report EXPLAINED_LIBM, C-4): a last-bit
// difference of the runtime's Math.exp, Math.log or Math.pow (V8 and JavaScriptCore round some differently) moves only the unrounded internals of
// the runForecast block and its hash; it never moves what is persisted, a status, a shown value or a decision. Checked here by running the same
// journeys with every one of those functions answering one unit in the last place away, up and down. The `**` operator cannot be perturbed in
// JavaScript: the two-race branch `(w0+w1)**-0.5` is left to the device run (Mac revalidation package).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/v1-safety-index.mjs';
import {client,athleteA,liveSessions,reportOf,at,ELIG,addDays} from './v1core-helpers.mjs';
import {result} from './v1rc-helpers.mjs';

/**
 * RFC-NUMERIC-1, the rule (structural, not a list): outside runForecast nothing differs. Inside it, every status, reason, label, boolean and integer
 * (every shown value is a rounded integer of seconds) is identical; only a non-integer number may differ, by at most 1e-12 of its size; the block's
 * own hash is runtime-local (never persisted, compared across runtimes or used as identity).
 */
const allowed=(k,x,y)=>k.startsWith('runForecast.')&&(['runForecast.hash','runForecast.inputDigest'].includes(k)||typeof x==='number'&&typeof y==='number'&&!(Number.isInteger(x)&&Number.isInteger(y))&&Math.abs(x-y)<=1e-12*Math.max(1,Math.abs(x)));
const PERSISTED=['program','actualLedger','referenceState','athleteModel','runEvidenceRecord','runFormatRecord','runHistoryRecord'];
const f64=new Float64Array(1),i64=new BigInt64Array(f64.buffer);
const ulp=(x,dir)=>{if(!Number.isFinite(x)||x===0)return x;f64[0]=x;i64[0]+=BigInt((x>0?1:-1)*dir);return f64[0];};
function leaves(o,p='',out={}){if(o&&typeof o==='object'){for(const k of Object.keys(o))leaves(o[k],p?p+'.'+k:k,out);}else out[p]=o;return out;}
function journey(anchors){
 const c=client(S),i=athleteA({weeks:12,id:'core-libm'});i.athlete.performanceAnchors=anchors;c.onboard(i);const steps=[];
 for(let w=0;w<6;w++){const day=addDays(c.env.program.startDate,w*7+6);const r=c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:liveSessions(c.env,w).map(s=>reportOf(c.env,s,{tag:'-'+w}))},'w'+w);
  steps.push({answer:JSON.parse(JSON.stringify(r)),persisted:JSON.stringify(PERSISTED.map(k=>c.env[k]))});}
 return steps;
}
function perturbed(anchors,dir){const saved={exp:Math.exp,log:Math.log,pow:Math.pow};try{for(const k of Object.keys(saved))Math[k]=(...a)=>ulp(saved[k](...a),dir);return journey(anchors);}finally{Object.assign(Math,saved);}}

for(const [label,anchors] of [['one race result',[result('10K',3000,'2026-11-01')]],['two race results',[result('5K',1440,'2026-10-04'),result('10K',3000,'2026-11-01')]]])
 test(`RFC-NUMERIC-1 (${label}): a last-bit libm difference never reaches persisted state, a status or a shown value`,()=>{
  const ref=journey(anchors);assert.ok(ref.some(s=>s.answer.runForecast?.status),'the forecast is computed');
  const moved=new Set();
  for(const dir of [1,-1]){const alt=perturbed(anchors,dir);
   ref.forEach((s,i)=>{
    assert.equal(alt[i].persisted,s.persisted,`persisted state, step ${i}`);
    const a=leaves(s.answer),b=leaves(alt[i].answer);
    for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(a[k]!==b[k]){const leaf=k.replace(/\.\d+(?=\.|$)/g,'');moved.add(leaf);
     assert.ok(allowed(k,a[k],b[k]),`step ${i}: ${k} moved (${a[k]} vs ${b[k]})`);}
   });}
  console.log(label,'moved leaves:',[...moved].sort().join(', ')||'none');
 });
