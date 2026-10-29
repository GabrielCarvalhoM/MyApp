// SSCTR R7A-SSCTR-r2 literature access log: one directed PubMed search (E-utilities esearch/esummary, relevance) and efetch of selected
// abstracts. Purpose: weigh R27 (the first quality slot after a short break of at most return.shortMaxDays days) against evidence on
// short-term training cessation in endurance athletes; counterevidence (a loss within two weeks) is sought in the same query.
// Output: ssctr-r7a-recheck-literature.out.json (search, hit list) and ssctr-r7a-recheck-abstracts.out.txt (abstract text as returned).
import fs from 'node:fs';
import path from 'node:path';
const HERE=import.meta.dirname,base='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const query='("detraining"[tiab] OR "training cessation"[tiab]) AND ("endurance"[tiab] OR "runners"[tiab] OR "running"[tiab]) AND ("short-term"[tiab] OR "2 weeks"[tiab] OR "two weeks"[tiab] OR "days"[tiab]) AND ("VO2max"[tiab] OR "maximal oxygen uptake"[tiab] OR "performance"[tiab])';
const out={searchedOn:new Date().toISOString(),site:'PubMed E-utilities',query,hits:[]};
const r=await fetch(base+'esearch.fcgi?db=pubmed&retmode=json&retmax=25&sort=relevance&term='+encodeURIComponent(query));out.esearchStatus=r.status;
const j=await r.json(),ids=j.esearchresult?.idlist??[];out.count=j.esearchresult?.count??null;
if(ids.length){const s=await fetch(base+'esummary.fcgi?db=pubmed&retmode=json&id='+ids.join(','));out.esummaryStatus=s.status;const sj=await s.json();for(const id of ids){const d=sj.result[id];out.hits.push({pmid:id,pubdate:d.pubdate,source:d.source,title:d.title,authors:(d.authors??[]).map(a=>a.name).slice(0,6).join(', ')});}}
const pick=['10966148','1487339','33517866','3747802'];
const f=await fetch(base+'efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id='+pick.join(','));out.efetchStatus=f.status;out.abstractsFetched=pick;
fs.writeFileSync(path.join(HERE,'ssctr-r7a-recheck-abstracts.out.txt'),await f.text());
fs.writeFileSync(path.join(HERE,'ssctr-r7a-recheck-literature.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({esearch:out.esearchStatus,count:out.count,hits:out.hits.length,efetch:out.efetchStatus}));
