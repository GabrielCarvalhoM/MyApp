// SSCTR R7A-SSCTR-r1 literature access check and one directed counterevidence search for Q1 (Europe PMC REST, lite, relevance).
// Question: does a reduced (low-volume or low-intensity) first bout fail to protect against a later, larger bout, so that the count
// after a phase-reduced re-establishment should restart from the reduced count (reading B) rather than the count before the reduction (A)?
import fs from 'node:fs';
const q='(TITLE_ABS:"repeated bout effect" OR TITLE_ABS:"repeated-bout effect") AND (TITLE_ABS:"low-intensity" OR TITLE_ABS:"low volume" OR TITLE_ABS:"low-volume" OR TITLE_ABS:"number of contractions" OR TITLE_ABS:"fewer" OR TITLE_ABS:"submaximal" OR TITLE_ABS:"volume")';
const url='https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=lite&pageSize=25&sort=RELEVANCE&query='+encodeURIComponent(q);
const r=await fetch(url),j=await r.json();
const out={searchedOn:new Date().toISOString(),site:'Europe PMC REST search API (lite, relevance)',query:q,http:r.status,hitCount:j.hitCount,results:(j.resultList?.result??[]).map(x=>({pmid:x.pmid??null,pmcid:x.pmcid??null,doi:x.doi??null,year:x.pubYear,title:x.title,journal:x.journalTitle??null,source:x.source}))};
fs.writeFileSync(new URL('./ssctr-r7a-literature.out.json',import.meta.url),JSON.stringify(out,null,1)+'\n');
console.log(out.http,out.hitCount);for(const x of out.results)console.log(x.year,x.pmid,x.title.slice(0,150));
