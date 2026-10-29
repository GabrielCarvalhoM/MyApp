// SSCTR R7A2-SSCTR-r1 literature access check (own). PubMed E-utilities only (esearch, esummary, efetch abstracts). Prints only.
// Purpose: confirm actual literature access and calibrate the sporting weight of non-blocking cost notes (a low set-count ceiling held for
// weeks; a short break after a single establishment week). No ruling of this re-check rests on these abstracts.
const E='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const Q=[
 {id:'Q1',purpose:'Minimal dose to maintain or increase strength (cost of a 2-set ceiling held for weeks)',term:'("minimal dose"[tiab] OR "minimum effective dose"[tiab] OR "minimum effective training dose"[tiab]) AND (strength[tiab]) AND (resistance[tiab] OR "1RM"[tiab])'},
 {id:'Q2',purpose:'Short-term training cessation and muscular performance (weight of a <=10-day break)',term:'("training cessation"[tiab] OR detraining[tiab]) AND ("meta-analysis"[pt] OR "systematic review"[tiab]) AND (strength[tiab] OR "muscular performance"[tiab])'}
];
const get=async u=>{const r=await fetch(u);return {status:r.status,text:await r.text()};};
const out={probe:'R7A2-SSCTR-r1-LITERATURE',at:new Date().toISOString(),queries:[]};
for(const q of Q){
 const s=await get(`${E}esearch.fcgi?db=pubmed&retmode=json&retmax=12&sort=relevance&term=${encodeURIComponent(q.term)}`);
 const ids=s.status===200?JSON.parse(s.text).esearchresult.idlist:[];
 const sum=ids.length?await get(`${E}esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`):{status:null,text:'{}'};
 const res=sum.status===200?JSON.parse(sum.text).result:{};
 out.queries.push({...q,esearchStatus:s.status,count:s.status===200?JSON.parse(s.text).esearchresult.count:null,hits:ids.map(i=>({pmid:i,title:res[i]?.title,source:res[i]?.source,pubdate:res[i]?.pubdate,doi:(res[i]?.articleids??[]).find(a=>a.idtype==='doi')?.value??null}))});
}
const want=process.argv.slice(2);
if(want.length){const a=await get(`${E}efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id=${want.join(',')}`);out.abstracts={status:a.status,text:a.text};}
console.log(JSON.stringify(out,null,1));
