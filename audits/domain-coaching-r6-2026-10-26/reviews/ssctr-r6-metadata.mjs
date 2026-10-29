// SSCTR R6 native reviewer: bibliographic metadata for cited records (Europe PMC core). Raw output only.
import fs from 'node:fs';
import path from 'node:path';
const pmids=process.argv.slice(2),out=[];
for(const pmid of pmids){const j=await (await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:${pmid}%20AND%20SRC:MED&format=json&resultType=core`)).json();const r=j.resultList?.result?.[0];out.push({pmid,pmcid:r?.pmcid??null,title:r?.title,authors:r?.authorString,journal:r?.journalInfo?.journal?.title,year:Number(r?.pubYear),doi:r?.doi??null,pubTypes:r?.pubTypeList?.pubType??[]});}
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-evidence','metadata-r6.json'),JSON.stringify(out,null,2)+'\n');
for(const r of out)console.log(r.pmid,r.pmcid,r.year,'|',r.authors?.slice(0,90),'|',r.journal,'|',r.doi,'|',JSON.stringify(r.pubTypes).slice(0,80));
