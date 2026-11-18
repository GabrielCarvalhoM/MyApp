// Core Safety & Lifecycle: the lab check of the focal revalidation, before the device. Loads the device bundle as ONE classic script in a V8
// vm context with the same four host functions and the same exposeModules tail rewrite the iOS host makes (CoachingCoreRuntime.swift), runs
// core-driver.js over the bundle's module registry, and compares with the Node oracle (Fixtures/core.json). V8 is not JavaScriptCore: this
// proves the bundle and the driver, not the device. Run: node audits/v1-core-safety-lifecycle-2026-11-18/mac/vm-check.mjs [--jitless is a node flag]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),P0=path.resolve(HERE,'..','..','v1-aif-p0-jsc-2026-11-17'),RES=path.join(P0,'ios','Sources','P0Host','Resources');
const fx=JSON.parse(fs.readFileSync(path.join(P0,'ios','Tests','P0HostTests','Fixtures','core.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(RES,'assets-manifest.json'),'utf8'));
const assets=new Map(manifest.map(a=>{const b=fs.readFileSync(path.join(RES,'assets',a.file));if(createHash('sha256').update(b).digest('hex')!==a.sha256)throw new Error('asset hash '+a.key);return [a.key,b.toString('utf8')];}));
const host={readAsset:k=>assets.get(k)??null,existsAsset:k=>assets.has(k),sha256:t=>createHash('sha256').update(t,'utf8').digest('hex'),now:()=>performance.now()};
const ctx=vm.createContext({__p0host:host}),tail='\nconst __api = __req(';
let src=fs.readFileSync(path.join(RES,'coachingcore-p0.js'),'utf8');if(src.split(tail).length!==2)throw new Error('bundle tail');src=src.replace(tail,'\nglobalThis.__p0req = __req;'+tail);
vm.runInContext(src,ctx,{filename:'coachingcore-p0.js'});vm.runInContext(fx.driver,ctx,{filename:'core-driver.js'});
const m=fx.modules,got=JSON.parse(vm.runInContext(`__corefocal({core:__p0req(${m.core}),contract:__p0req(${m.contract}),value:__p0req(${m.value})}, ${JSON.stringify(fx.inputJSON)})`,ctx));
const e=fx.expected,diffs=[];
got.journeys.forEach((j,i)=>j.steps.forEach((s,k)=>{const x=e.journeys[i].steps[k];for(const f of ['status','proposal','namespace','stable','persisted','error'])if(JSON.stringify(s[f])!==JSON.stringify(x[f]))diffs.push(`${j.name}#${k}.${f}`);if(s.answer!==x.answer)diffs.push(`${j.name}#${k}.answer(EXPLAINED_LIBM candidate)`);}));
const ok=got.digest===e.digest&&!diffs.some(d=>!d.includes('EXPLAINED_LIBM'));
console.log(JSON.stringify({ok,digestEqual:got.digest===e.digest,diffs,localeCompareCalls:got.localeCompareCalls,defaultLocale:got.defaultLocale},null,1));
process.exit(ok?0:1);
