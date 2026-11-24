// REPMILE CoachingCore V1 final physical validation (2026-11-24): the lab twin of the device boundary tests. The shipped bundle runs in a bare V8
// context (no Node globals) with the host the device gives it: the four P0 functions plus hmacSHA256(keyRef, text) and constantTimeEqual(a, b),
// here over Node's crypto, the key resolved by the host from its reference. The module registry is exposed the way the Swift host does it
// (one line before the bundle tail). It replays int.json and final.json and compares every step with the Node oracle. Run with and without
// --jitless. It is not a JavaScriptCore run: only the iPhone and the Mac XCTest runs are.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..'),P0=path.join(REPO,'audits','v1-aif-p0-jsc-2026-11-17','ios');
const RES=path.join(P0,'Sources','P0Host','Resources'),FX=path.join(P0,'Tests','P0HostTests','Fixtures');
const manifest=JSON.parse(fs.readFileSync(path.join(RES,'build-manifest.json'),'utf8')),assets=JSON.parse(fs.readFileSync(path.join(RES,'assets-manifest.json'),'utf8'));
const texts=new Map(assets.map(a=>[a.key,fs.readFileSync(path.join(RES,'assets',a.file),'utf8')]));
const idOf=f=>manifest.modules.find(m=>m.file==='CoachingCore/src/'+f).id;
let bundle=fs.readFileSync(path.join(RES,'coachingcore-p0.js'),'utf8');
const sha=createHash('sha256').update(bundle).digest('hex');if(sha!==manifest.bundle.sha256)throw new Error('bundle sha differs from the build manifest');
bundle=bundle.replace('\nconst __api = __req(','\nglobalThis.__p0req = __req;\nconst __api = __req(');
const keyring=new Map();let hmacCalls=0;
const host={readAsset:k=>texts.get(k)??null,existsAsset:k=>texts.has(k),sha256:t=>createHash('sha256').update(t,'utf8').digest('hex'),now:()=>performance.now(),
 hmacSHA256:(ref,text)=>{const k=keyring.get(ref);if(k===undefined)return '';hmacCalls++;return createHmac('sha256',k).update(text,'utf8').digest('hex');},
 constantTimeEqual:(a,b)=>{const x=Buffer.from(a,'utf8'),y=Buffer.from(b,'utf8');return x.length===y.length&&timingSafeEqual(x,y);}};
const ctx=vm.createContext({__p0host:host});vm.runInContext(bundle,ctx,{filename:'coachingcore-p0.js'});
const req=id=>ctx.__p0req(id),M={integration:req(idOf('boundary/integration.mjs')),store:req(idOf('boundary/store.mjs')),api:req(idOf('boundary/api.mjs')),value:req(idOf('value.mjs'))};
const report={bundleSha256:sha,jitless:process.execArgv.includes('--jitless'),fixtures:{}};let ok=true;
for(const [name,fn,global] of [['int','int-driver','__intfocal'],['final','final-driver','__finalfocal']]){
 const fx=JSON.parse(fs.readFileSync(path.join(FX,name+'.json'),'utf8'));keyring.set(JSON.parse(fx.inputJSON).key,JSON.parse(fx.inputJSON).key);
 vm.runInContext(fx.driver,ctx);const got=JSON.parse(ctx[global](M,fx.inputJSON)),diffs=[];
 got.journeys.forEach((j,a)=>j.steps.forEach((s,b)=>{const e=fx.expected.journeys[a].steps[b];if(JSON.stringify(s)!==JSON.stringify(e))diffs.push(`${j.name}#${b}`);}));
 const equal=got.digest===fx.expected.digest&&!diffs.length;ok&&=equal;report.fixtures[name]={digestEqual:got.digest===fx.expected.digest,diffs,steps:got.journeys.reduce((n,j)=>n+j.steps.length,0)};
}
const calls=JSON.parse(ctx.CoachingCoreP0.hostCalls());report.host={unsupported:calls.unsupported,misses:calls.misses,hmacCalls,constantTimeEqual:calls.calls.constantTimeEqual??0};
ok&&=!calls.unsupported.length&&!calls.misses.length;report.ok=ok;console.log(JSON.stringify(report,null,1));process.exit(ok?0:1);
