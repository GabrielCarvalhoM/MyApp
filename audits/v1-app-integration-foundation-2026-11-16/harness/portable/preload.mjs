// Preload of the portable-host proof: builds the asset bundle a mobile build would ship (every JSON file the engine names by URL in its
// sources, found statically as a bundler would), installs the host, and registers the hooks before any engine module loads.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {register} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const SRC=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..','..','CoachingCore','src');
const assets=new Map(),files=[];
for(const f of fs.readdirSync(SRC).filter(x=>x.endsWith('.mjs')).map(x=>path.join(SRC,x))){
 for(const m of fs.readFileSync(f,'utf8').matchAll(/new URL\('([^']+\.json)',import\.meta\.url\)/g)){
  const target=path.resolve(path.dirname(f),m[1]),key=decodeURIComponent(pathToFileURL(target).pathname).replace(/^\/([A-Za-z]:)/,'$1').toLowerCase();
  if(!assets.has(key)&&fs.existsSync(target)){assets.set(key,fs.readFileSync(target,'utf8'));files.push(path.relative(path.resolve(SRC,'..','..'),target).replaceAll('\\','/'));}
 }
}
globalThis.__AIF_HOST={assets,files,calls:{readFileSync:0,existsSync:0,sha256:0,sha256Chars:0},misses:[],unsupported:[],sha256:text=>createHash('sha256').update(text,'utf8').digest('hex')};
register('./hooks.mjs',import.meta.url);
