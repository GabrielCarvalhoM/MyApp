// SSCTR R7A-SSCTR-r1: the same directed counterevidence search for Q1 on PubMed E-utilities (Europe PMC returned HTTP 503 twice).
import fs from 'node:fs';
const term='("repeated bout effect"[tiab] OR "repeated-bout effect"[tiab]) AND ("low-intensity"[tiab] OR "low volume"[tiab] OR "low-volume"[tiab] OR "number of contractions"[tiab] OR "submaximal"[tiab] OR "fewer"[tiab])';
const es=await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=30&sort=relevance&term='+encodeURIComponent(term));
const ej=es.ok?await es.json():null,ids=ej?.esearchresult?.idlist??[];
let sum=null;if(ids.length){const s=await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id='+ids.join(','));sum=s.ok?await s.json():null;}
const out={searchedOn:new Date().toISOString(),site:'PubMed E-utilities esearch/esummary (relevance)',query:term,http:es.status,hitCount:ej?.esearchresult?.count??null,results:ids.map(id=>{const x=sum?.result?.[id];return {pmid:id,year:x?.pubdate?.slice(0,4)??null,title:x?.title??null,journal:x?.source??null,doi:(x?.articleids??[]).find(a=>a.idtype==='doi')?.value??null};})};
fs.writeFileSync(new URL('./ssctr-r7a-literature.out.json',import.meta.url),JSON.stringify(out,null,1)+'\n');
console.log(out.http,out.hitCount);for(const x of out.results)console.log(x.year,x.pmid,(x.title??'').slice(0,160));
