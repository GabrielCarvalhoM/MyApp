import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]):)/, '$1:'));
const out = path.join(dir, 'ssctr-evidence');
await mkdir(out, {recursive:true});
const ids = process.argv.slice(2);
const trace = [];
for (const id of ids) {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/${id}/fullTextXML`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    if (!xml.includes('<article')) throw new Error('Not article XML');
    await writeFile(path.join(out, `${id}.xml`), xml);
    trace.push({id,url,accessedOn:'2026-10-26',status:'RETRIEVED',sha256:createHash('sha256').update(xml).digest('hex'),bytes:Buffer.byteLength(xml)});
    const title = xml.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/)?.[1]?.replace(/<[^>]+>/g,'');
    console.log(JSON.stringify({id,title,bytes:xml.length}));
  } catch (error) { trace.push({id,url,accessedOn:'2026-10-26',status:'FAILED',error:error.message}); }
}
let prior = [];
try { prior = JSON.parse(await readFile(path.join(dir,'ssctr-access-trace.json'),'utf8')); } catch {}
await writeFile(path.join(dir,'ssctr-access-trace.json'),JSON.stringify([...prior,...trace],null,2)+'\n');
console.log(JSON.stringify(trace));
