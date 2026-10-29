// SSCTR R7ASM-SSCTR-r1 literature access and currency check (own; byte-derived from ssctr-r7ase-literature.mjs, same queries as R7ASE-SSCTR-r1, R7AB-SSCTR-r1 and R7AF-SSCTR-r1). PubMed E-utilities only (esearch, esummary). Prints only.
// Purpose: confirm actual literature access at this review (SSCTR-01) and look for a new systematic review or meta-analysis since my R7-A.2
// searches that would be a re-review trigger (SSCTR-09) for the return recipe this regression re-check relies on. This is a regression
// check (state model Founder §26: regression only; no new sporting research); no ruling rests on these hits, and titles are not read as evidence.
const E='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const Q=[
 {id:'Q1',purpose:'New syntheses on training cessation / detraining (the basis of the return classes and ceilings)',term:'(detraining[tiab] OR "training cessation"[tiab] OR "training interruption"[tiab]) AND ("meta-analysis"[pt] OR "systematic review"[tiab]) AND 2025:2026[dp]'},
 {id:'Q2',purpose:'New syntheses on retraining / return to training after a nonclinical break (strength, endurance, running)',term:'(retraining[tiab] OR "return to training"[tiab] OR "muscle memory"[tiab]) AND (strength[tiab] OR endurance[tiab] OR running[tiab]) AND ("meta-analysis"[pt] OR "systematic review"[tiab]) AND 2025:2026[dp]'}
];
const get=async u=>{try{const r=await fetch(u);return {status:r.status,text:await r.text()};}catch(e){return {status:'ERROR '+String(e?.message??e).slice(0,120),text:''};}};
const out={probe:'R7ASM-SSCTR-r1-LITERATURE',at:new Date().toISOString(),queries:[]};
for(const q of Q){
 const s=await get(`${E}esearch.fcgi?db=pubmed&retmode=json&retmax=20&sort=pub_date&term=${encodeURIComponent(q.term)}`);
 const ids=s.status===200?JSON.parse(s.text).esearchresult.idlist:[];
 const sum=ids.length?await get(`${E}esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`):{status:null,text:'{}'};
 const res=sum.status===200?JSON.parse(sum.text).result:{};
 out.queries.push({...q,esearchStatus:s.status,esummaryStatus:sum.status,count:s.status===200?JSON.parse(s.text).esearchresult.count:null,hits:ids.map(i=>({pmid:i,title:res[i]?.title,source:res[i]?.source,pubdate:res[i]?.pubdate,doi:(res[i]?.articleids??[]).find(a=>a.idtype==='doi')?.value??null}))});
}
console.log(JSON.stringify(out,null,1));
