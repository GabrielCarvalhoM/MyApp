// The host surface of the composed engine (ADR evidence): what an embedding runtime must provide for CoachingCore to run outside Node.js.
// Static: the module graph reachable from the entry point, its bytes and every non-relative import. Runtime: every file the engine reads while it
// loads and plans (patched fs.readFileSync before the engine is imported), and every crypto call it makes. Compressed sizes: gzip level 9.
// Run: node audits/v1-app-integration-foundation-2026-11-16/harness/surface.mjs  (writes results/surface.json)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {syncBuiltinESMExports} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..'),OUT=path.join(HERE,'..','results');
const ENTRY=path.join(REPO,'CoachingCore','src','v1-strength-index.mjs');
const rel=f=>path.relative(REPO,f).replaceAll('\\','/');
const gz=b=>zlib.gzipSync(b,{level:9}).length;

// ---- static graph ----
const IMPORT=/(?:^|[;\s])(?:import|export)\s*(?:[\w*{}\s,$]+from\s*)?['"]([^'"]+)['"]/g,DYNAMIC=/import\(\s*['"]([^'"]+)['"]\s*\)/g;
const seen=new Map(),external=new Map();
function walk(file){
 if(seen.has(file))return;const src=fs.readFileSync(file);seen.set(file,src);
 const text=src.toString('utf8');
 for(const re of [IMPORT,DYNAMIC])for(const m of text.matchAll(re)){const spec=m[1];
  if(spec.startsWith('.')){walk(path.resolve(path.dirname(file),spec));continue;}
  const users=external.get(spec)??new Set();users.add(rel(file));external.set(spec,users);
  if(!spec.startsWith('node:')){const pkg=path.join(REPO,'CoachingCore','node_modules',spec.endsWith('.js')?spec:spec);if(fs.existsSync(pkg)){/* package code counted below */}}}
}
walk(ENTRY);
const jsBytes=[...seen.values()].reduce((a,b)=>a+b.length,0),jsAll=Buffer.concat([...seen.values()]);
// ajv and its dependencies, if reachable, are counted from node_modules as a whole package each.
const pkgDir=name=>path.join(REPO,'CoachingCore','node_modules',name);
const dirBytes=d=>fs.readdirSync(d,{withFileTypes:true}).reduce((a,e)=>a+(e.isDirectory()?dirBytes(path.join(d,e.name)):/\.(js|json)$/.test(e.name)?fs.statSync(path.join(d,e.name)).size:0),0);
const packages=[...external.keys()].filter(s=>!s.startsWith('node:')).map(s=>s.split('/')[0]);
const ajvDeps=packages.includes('ajv')?JSON.parse(fs.readFileSync(path.join(pkgDir('ajv'),'package.json'),'utf8')).dependencies??{}:{};
const pkgSizes=Object.fromEntries([...new Set([...packages,...Object.keys(ajvDeps)])].map(p=>[p,fs.existsSync(pkgDir(p))?dirBytes(pkgDir(p)):null]));

// ---- runtime reads and crypto calls ----
const reads=new Map(),hashes={sha256:0,other:0,bytes:0},hmacs={count:0};
const origRead=fs.readFileSync;
fs.readFileSync=function(p,...a){const out=origRead.call(fs,p,...a);const f=p instanceof URL?fileURLToPath(p):String(p);if(f.startsWith(REPO))reads.set(rel(f),(reads.get(rel(f))??0)+1);return out;};
const origHash=crypto.createHash,origHmac=crypto.createHmac;
crypto.createHash=function(alg,...a){const h=origHash.call(crypto,alg,...a);if(alg==='sha256')hashes.sha256++;else hashes.other++;const up=h.update.bind(h);h.update=(d,...x)=>{hashes.bytes+=Buffer.byteLength(d);return up(d,...x);};return h;};
crypto.createHmac=function(...a){hmacs.count++;return origHmac.apply(crypto,a);};
syncBuiltinESMExports();
const t0=performance.now();const S=await import(pathToFileURL(ENTRY).href);const loadMs=performance.now()-t0;
const loadReads=new Map(reads),loadHashes={...hashes};
const {athleteA}=await import('./scenario.mjs');const g=S.generateProgram(athleteA());
const assets=[...loadReads.keys()].map(f=>({file:f,bytes:fs.statSync(path.join(REPO,f)).size})).filter(a=>!a.file.endsWith('.mjs')&&!a.file.endsWith('.js'));
const assetBytes=assets.reduce((a,b)=>a+b.bytes,0),assetAll=Buffer.concat(assets.map(a=>origRead.call(fs,path.join(REPO,a.file))));
const out={entry:rel(ENTRY),
 modules:{count:seen.size,bytes:jsBytes,gzipBytes:gz(jsAll),files:[...seen.keys()].map(rel).sort()},
 externalImports:Object.fromEntries([...external].map(([k,v])=>[k,[...v].sort()])),packages:pkgSizes,
 assetsReadAtLoad:{count:assets.length,bytes:assetBytes,gzipBytes:gz(assetAll),files:assets},
 cryptoAtLoad:{sha256Calls:loadHashes.sha256,otherHashCalls:loadHashes.other,bytesHashed:loadHashes.bytes,hmacCalls:hmacs.count},
 cryptoAfterOneGenerate:{sha256Calls:hashes.sha256,bytesHashed:hashes.bytes},
 filesReadAfterLoad:[...reads.keys()].filter(f=>!loadReads.has(f)),
 generateStatus:g.status,loadMs:Math.round(loadMs)};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'surface.json'),JSON.stringify(out,null,1)+'\n');
console.log(`modules ${out.modules.count} (${out.modules.bytes} B, gzip ${out.modules.gzipBytes} B); external ${Object.keys(out.externalImports).join(', ')}; packages ${JSON.stringify(pkgSizes)}`);
console.log(`assets at load ${out.assetsReadAtLoad.count} (${assetBytes} B, gzip ${out.assetsReadAtLoad.gzipBytes} B); sha256 at load ${loadHashes.sha256} over ${loadHashes.bytes} B; after one generate ${hashes.sha256} over ${hashes.bytes} B; hmac ${hmacs.count}; reads after load ${out.filesReadAfterLoad.length}`);
