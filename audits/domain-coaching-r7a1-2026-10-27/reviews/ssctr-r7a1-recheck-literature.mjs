// SSCTR R7A1-SSCTR-r2 literature access log. One directed PubMed search (E-utilities esearch/esummary, relevance) and efetch of selected
// abstracts. Purpose (new finding D59, sporting weight only; the ruling rests on the declared policy text): does a novice's or a briefly
// trained person's single or first-week resistance exposure leave a protection (repeated-bout effect) that lasts across a two-to-three-week
// break, and is a 1 -> 3 or 2 -> 4 set step after such a break a material concern? Counterevidence is sought in the same search.
// Usage: node ssctr-r7a1-recheck-literature.mjs   (PICK=pmid,pmid to fetch abstracts). Output: ssctr-r7a1-recheck-literature.out.json and
// ssctr-r7a1-recheck-abstracts.out.txt. Read-only; nothing under CoachingCore/ is touched.
import fs from 'node:fs';
import path from 'node:path';
const HERE=import.meta.dirname,base='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const queries={
 Q3:'("repeated bout effect"[tiab] OR "repeated-bout effect"[tiab]) AND ("duration"[tiab] OR "weeks"[tiab] OR "persist"[tiab] OR "retention"[tiab]) AND ("untrained"[tiab] OR "novice"[tiab] OR "resistance exercise"[tiab])'
};
const pause=()=>new Promise(r=>setTimeout(r,1200));
const out={searchedOn:new Date().toISOString(),site:'PubMed E-utilities',searches:{}};
for(const [k,q] of Object.entries(queries)){
 await pause();const r=await fetch(base+'esearch.fcgi?db=pubmed&retmode=json&retmax=20&sort=relevance&term='+encodeURIComponent(q)),j=await r.json(),ids=j.esearchresult?.idlist??[];
 const rec={query:q,esearchStatus:r.status,count:j.esearchresult?.count??null,hits:[]};
 if(ids.length){await pause();const s=await fetch(base+'esummary.fcgi?db=pubmed&retmode=json&id='+ids.join(','));rec.esummaryStatus=s.status;const sj=await s.json();for(const id of sj.result?ids:[]){const d=sj.result[id];rec.hits.push({pmid:id,pubdate:d.pubdate,source:d.source,title:d.title,pubtype:(d.pubtype??[]).join('; '),authors:(d.authors??[]).map(a=>a.name).slice(0,6).join(', ')});}}
 out.searches[k]=rec;
}
const pick=(process.env.PICK??'').split(',').filter(Boolean);
if(pick.length){await pause();const f=await fetch(base+'efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id='+pick.join(','));out.efetchStatus=f.status;out.abstractsFetched=pick;fs.writeFileSync(path.join(HERE,'ssctr-r7a1-recheck-abstracts.out.txt'),await f.text());}
fs.writeFileSync(path.join(HERE,'ssctr-r7a1-recheck-literature.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({Q3:{status:out.searches.Q3.esearchStatus,count:out.searches.Q3.count,hits:out.searches.Q3.hits.map(h=>h.pmid+' '+h.pubdate.slice(0,4)+' '+h.source+' '+h.title.slice(0,120)+' ['+h.pubtype+']')},efetch:out.efetchStatus??null},null,1));
