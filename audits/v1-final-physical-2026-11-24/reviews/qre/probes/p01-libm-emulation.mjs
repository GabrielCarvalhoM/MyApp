// QRE FPV R1, probe p01: does the device's EXPLAINED_LIBM set follow from the math library alone, and can a 1-ULP libm difference reach
// anything the classifier does not explain? Synthetic only. Run from a scratch copy:
//   node p01-libm-emulation.mjs <repo> collect <args.json>          every Math.exp/log/pow argument the final journeys use (Node/V8)
//   node p01-libm-emulation.mjs <repo> table <args.json> <table.json> <mode>
//        mode=apple : the values come from the platform C libm (python3 math.*, macOS libsystem_m, the library JavaScriptCore calls)
//        mode=up|down[:fns]: every result of the listed functions (default exp,log,pow) moved one ULP up or down (a worst case)
// The step verdict is BoundaryTests.swift's: equal -> IDENTICAL; else, without `answer`/`stored`, equal -> EXPLAINED_LIBM; else DIVERGED.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const [,,REPO,phase,a1,a2,mode]=process.argv;
const imp=p=>import(pathToFileURL(path.join(REPO,p)).href);
const M={integration:await imp('CoachingCore/src/boundary/integration.mjs'),store:await imp('CoachingCore/src/boundary/store.mjs'),api:await imp('CoachingCore/src/boundary/api.mjs'),value:await imp('CoachingCore/src/value.mjs')};
const FX=JSON.parse(fs.readFileSync(path.join(REPO,'audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/final.json'),'utf8'));
vm.runInThisContext(FX.driver);
const orig={exp:Math.exp,log:Math.log,pow:Math.pow};
const f64=new Float64Array(1),u64=new BigUint64Array(f64.buffer);
const ulp=(x,d)=>{if(!Number.isFinite(x)||x===0)return x;f64[0]=x;u64[0]+=BigInt(d*(x>0?1:-1));return f64[0];};
function classify(got){const ids={IDENTICAL:[],EXPLAINED_LIBM:[],DIVERGED:[]};
 got.journeys.forEach((j,a)=>j.steps.forEach((s,b)=>{const e=FX.expected.journeys[a].steps[b],id=`${j.name}#${b}`;
  if(JSON.stringify(s)===JSON.stringify(e))return ids.IDENTICAL.push(id);
  const {answer:_a,stored:_s,...rs}=s,{answer:_b,stored:_t,...re}=e;const ok=JSON.stringify(rs)===JSON.stringify(re);ids[ok?'EXPLAINED_LIBM':'DIVERGED'].push(ok?id:id+'['+Object.keys(re).filter(k=>JSON.stringify(rs[k])!==JSON.stringify(re[k])).join(',')+']');}));
 return ids;}
if(phase==='collect'){const seen={exp:new Set(),log:new Set(),pow:new Set()};
 Math.exp=x=>{seen.exp.add(JSON.stringify([x]));return orig.exp(x);};Math.log=x=>{seen.log.add(JSON.stringify([x]));return orig.log(x);};Math.pow=(x,y)=>{seen.pow.add(JSON.stringify([x,y]));return orig.pow(x,y);};
 const got=JSON.parse(globalThis.__finalfocal(M,FX.inputJSON));Object.assign(Math,orig);
 const c=classify(got);console.log(JSON.stringify({baselineNode:{identical:c.IDENTICAL.length,explained:c.EXPLAINED_LIBM.length,diverged:c.DIVERGED.length,digestEqual:got.digest===FX.expected.digest},
  args:Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,v.size]))}));
 fs.writeFileSync(a1,JSON.stringify(Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,[...v].map(s=>JSON.parse(s))])),null,0));process.exit(0);}
if(phase==='table'){const args=JSON.parse(fs.readFileSync(a1,'utf8'));let table;
 if(mode==='apple'){const py="import json,math,sys\na=json.load(open(sys.argv[1]))\nprint(json.dumps({'exp':[math.exp(x[0]) for x in a['exp']],'log':[math.log(x[0]) for x in a['log']],'pow':[math.pow(x[0],x[1]) for x in a['pow']]}))";
  // JSON numbers both ways: Python json.dumps writes repr (shortest round-trip), JS JSON.stringify likewise, so the doubles cross exactly.
  const raw=JSON.parse(execFileSync('python3',['-I','-c',py,a1],{encoding:'utf8'}));
  table={exp:new Map(args.exp.map(([x],i)=>[x,raw.exp[i]])),log:new Map(args.log.map(([x],i)=>[x,raw.log[i]])),pow:new Map(args.pow.map(([x,y],i)=>[x+','+y,raw.pow[i]]))};}
 const [dir,fnList='exp,log,pow']=String(mode).split(':'),fns=fnList.split(','),d=dir==='up'?1:dir==='down'?-1:0;let changed={exp:0,log:0,pow:0};
 const pick=(k,key,v)=>{let w=v;if(table){const t=table[k].get(key);if(t!==undefined&&!Number.isNaN(t))w=t;}else if(fns.includes(k))w=ulp(v,d);if(!Object.is(w,v))changed[k]++;return w;};
 Math.exp=x=>pick('exp',x,orig.exp(x));Math.log=x=>pick('log',x,orig.log(x));Math.pow=(x,y)=>pick('pow',x+','+y,orig.pow(x,y));
 const got=JSON.parse(globalThis.__finalfocal(M,FX.inputJSON));Object.assign(Math,orig);
 const c=classify(got),diffTable=table?Object.fromEntries(['exp','log','pow'].map(k=>[k,[...table[k]].filter(([key,v])=>{const [x,y]=String(key).split(',').map(Number);const o=k==='pow'?orig.pow(x,y):orig[k](Number(key));return !Object.is(o,v);}).length])):null;
 fs.writeFileSync(a2,JSON.stringify(c));
 console.log(JSON.stringify({mode,argsWhoseValueDiffers:diffTable,callsChanged:changed,identical:c.IDENTICAL.length,explained:c.EXPLAINED_LIBM.length,diverged:c.DIVERGED.length,divergedIds:c.DIVERGED,digestEqual:got.digest===FX.expected.digest}));}
