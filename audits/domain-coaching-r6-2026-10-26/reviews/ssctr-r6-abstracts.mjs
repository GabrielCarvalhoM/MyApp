// SSCTR R6 native reviewer: abstract-level retrieval (ABSTRACT_ONLY access) for non-open-access records via Europe PMC core API.
import fs from 'node:fs';
import path from 'node:path';
const ids=process.argv.slice(2),out=[];
for(const pmid of ids){
 const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:${pmid}%20AND%20SRC:MED&format=json&resultType=core`;
 try{const j=await (await fetch(url)).json();const r=j.resultList?.result?.[0];out.push({pmid,url,accessedOn:'2026-10-26',status:r?'ABSTRACT_RETRIEVED':'NOT_FOUND',title:r?.title,authors:r?.authorString,journal:r?.journalInfo?.journal?.title,year:r?.pubYear,doi:r?.doi??null,pubType:r?.pubTypeList?.pubType,abstract:r?.abstractText?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')});}
 catch(e){out.push({pmid,url,accessedOn:'2026-10-26',status:'FAILED',error:e.message});}
}
const f=path.join(import.meta.dirname,'ssctr-evidence','abstracts-r6.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
fs.writeFileSync(f,JSON.stringify([...prior,...out],null,2)+'\n');
for(const r of out)console.log('##',r.pmid,r.status,'|',r.title,'|',r.authors?.slice(0,60),'|',r.year,'|',r.doi,'\n',r.abstract?.slice(0,1900));
