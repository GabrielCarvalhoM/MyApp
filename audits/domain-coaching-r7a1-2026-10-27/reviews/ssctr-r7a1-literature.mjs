// SSCTR R7A1-SSCTR-r1 literature access log. Two directed PubMed searches (E-utilities esearch/esummary, relevance) and efetch of selected
// abstracts; one Europe PMC full-text availability check. Purposes:
//  Q1 (S2, R23 class): does a set count rising from 1 to 3 for a familiar accessory after a gap of up to five weeks carry a material risk
//     (exercise-induced muscle damage, loss of the repeated-bout protection), and is there counterevidence?
//  Q2 (S1, D56): is there evidence on judging tolerance of a resumed resistance-training volume by the most recent session versus any session
//     of the week? Expected to be indirect at best (a negative result is logged, not read as absence of evidence).
// Output: ssctr-r7a1-literature.out.json and ssctr-r7a1-abstracts.out.txt. Read-only; nothing under CoachingCore/ is touched.
import fs from 'node:fs';
import path from 'node:path';
const HERE=import.meta.dirname,base='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const queries={
 Q1:'("detraining"[tiab] OR "training cessation"[tiab] OR "retraining"[tiab]) AND ("resistance training"[tiab] OR "strength training"[tiab]) AND ("muscle damage"[tiab] OR "repeated bout"[tiab] OR "soreness"[tiab] OR "volume"[tiab])',
 Q2:'("resistance training"[tiab] OR "strength training"[tiab]) AND ("autoregulation"[tiab] OR "readiness"[tiab] OR "session-to-session"[tiab]) AND ("volume"[tiab] OR "sets"[tiab]) AND ("fatigue"[tiab] OR "recovery"[tiab])'
};
const pause=()=>new Promise(r=>setTimeout(r,1200));
const out={searchedOn:new Date().toISOString(),site:'PubMed E-utilities; Europe PMC REST',searches:{}};
for(const [k,q] of Object.entries(queries)){
 await pause();const r=await fetch(base+'esearch.fcgi?db=pubmed&retmode=json&retmax=20&sort=relevance&term='+encodeURIComponent(q)),j=await r.json(),ids=j.esearchresult?.idlist??[];
 const rec={query:q,esearchStatus:r.status,count:j.esearchresult?.count??null,hits:[]};
 if(ids.length){await pause();const s=await fetch(base+'esummary.fcgi?db=pubmed&retmode=json&id='+ids.join(','));rec.esummaryStatus=s.status;const sj=await s.json();if(!sj.result)rec.esummaryError=JSON.stringify(sj).slice(0,300);for(const id of sj.result?ids:[]){const d=sj.result[id];rec.hits.push({pmid:id,pubdate:d.pubdate,source:d.source,title:d.title,pubtype:(d.pubtype??[]).join('; '),authors:(d.authors??[]).map(a=>a.name).slice(0,6).join(', ')});}}
 out.searches[k]=rec;
}
const pick=(process.env.PICK??'').split(',').filter(Boolean);
if(pick.length){await pause();const f=await fetch(base+'efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id='+pick.join(','));out.efetchStatus=f.status;out.abstractsFetched=pick;fs.writeFileSync(path.join(HERE,'ssctr-r7a1-abstracts.out.txt'),await f.text());}
const epmc=await fetch('https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13674372/fullTextXML');out.europePmcFullTextCheck={pmcid:'PMC13674372',status:epmc.status,bytes:(await epmc.text()).length};
fs.writeFileSync(path.join(HERE,'ssctr-r7a1-literature.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({Q1:{status:out.searches.Q1.esearchStatus,count:out.searches.Q1.count,hits:out.searches.Q1.hits.map(h=>h.pmid+' '+h.pubdate.slice(0,4)+' '+h.title.slice(0,110)+' ['+h.pubtype+']')},Q2:{status:out.searches.Q2.esearchStatus,count:out.searches.Q2.count,hits:out.searches.Q2.hits.map(h=>h.pmid+' '+h.pubdate.slice(0,4)+' '+h.title.slice(0,110)+' ['+h.pubtype+']')},efetch:out.efetchStatus??null,epmc:out.europePmcFullTextCheck},null,1));
