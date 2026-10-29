// SSCTR R6 reader: prints the abstract and paragraphs matching a pattern from a retrieved full-text XML (reading aid only).
import fs from 'node:fs';
import path from 'node:path';
const [id,pattern='',max='12']=process.argv.slice(2);
const xml=fs.readFileSync(path.join(import.meta.dirname,'ssctr-evidence',id+'.xml'),'utf8');
const text=s=>s.replace(/<xref[^>]*>([\s\S]*?)<\/xref>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const title=text(xml.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/)?.[1]??'');
const authors=[...xml.matchAll(/<contrib[^>]*contrib-type="author"[\s\S]*?<surname>([^<]*)<\/surname>/g)].map(m=>m[1]).slice(0,4).join(', ');
const doi=xml.match(/<article-id pub-id-type="doi">([^<]*)/)?.[1],pmid=xml.match(/<article-id pub-id-type="pmid">([^<]*)/)?.[1];
const year=xml.match(/<pub-date[^>]*>[\s\S]*?<year>(\d{4})/)?.[1];
console.log(`# ${id} | ${title} | ${authors} | ${year} | doi ${doi} | pmid ${pmid}`);
const abs=xml.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/)?.[1];if(abs)console.log('ABSTRACT:',text(abs).slice(0,3500));
if(pattern){const re=new RegExp(pattern,'i');const paras=[...xml.matchAll(/<(p|title)[^>]*>([\s\S]*?)<\/\1>/g)].map(m=>text(m[2])).filter(p=>re.test(p));
for(const p of paras.slice(0,Number(max)))console.log('--',p.slice(0,1400));}
