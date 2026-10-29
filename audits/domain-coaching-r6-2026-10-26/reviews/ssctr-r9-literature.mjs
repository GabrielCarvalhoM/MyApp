// SSCTR R6 round 9: Europe PMC searches (lite, relevance), abstract retrieval and open-access full-text retrieval for the round-9
// rulings. Reviewer-authored. Writes ssctr-evidence/search-r9.json, ssctr-evidence/abstracts-r9.json and, for open-access
// records named on the command line with `fulltext`, ssctr-evidence/<PMCID>.xml.
import fs from 'node:fs';
import path from 'node:path';
const DIR=path.join(import.meta.dirname,'ssctr-evidence'),TODAY='2026-10-26';
const QUERIES={
 r9deload:{purpose:'Round 9 (D49, dossier Q1-Q2): is a deload or consolidation week a planned temporary reduction after which training resumes at the pre-deload level, so that the return ceiling is the last unreduced executed dose?',
  q:'(TITLE_ABS:"deload" OR TITLE_ABS:"deloading") AND (TITLE_ABS:"resistance training" OR TITLE_ABS:"strength" OR TITLE_ABS:"consensus")'},
 r9shortdetrain:{purpose:'Round 9 (D49 Q3, restart run history Q7): magnitude of strength and endurance loss over breaks of 2-6 weeks in trained or recreational adults',
  q:'(TITLE_ABS:"detraining" OR TITLE_ABS:"training cessation" OR TITLE_ABS:"training interruption") AND (TITLE_ABS:"short-term" OR TITLE_ABS:"weeks") AND (TITLE_ABS:"systematic review" OR TITLE_ABS:"meta-analysis")'},
 r9runvolume:{purpose:'Round 9 (D50): does progressive running volume, rather than an unchanged weekly dose, drive adaptation in recreational or novice runners over 8-16 weeks? Counterevidence: maintenance without progression',
  q:'(TITLE_ABS:"recreational runners" OR TITLE_ABS:"novice runners") AND (TITLE_ABS:"training volume" OR TITLE_ABS:"progression" OR TITLE_ABS:"progressive") AND (TITLE_ABS:"performance" OR TITLE_ABS:"VO2max" OR TITLE_ABS:"randomized")'},
 r9variation:{purpose:'Round 9 (D51): what is lost when exercise rotation stops: effects of exercise variation on strength, hypertrophy and motivation (counterevidence: no effect)',
  q:'(TITLE_ABS:"exercise variation" OR TITLE_ABS:"exercise rotation" OR TITLE_ABS:"varied exercise") AND (TITLE_ABS:"resistance training") AND (TITLE_ABS:"hypertrophy" OR TITLE_ABS:"strength" OR TITLE_ABS:"motivation")'}
};
const search=async q=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&resultType=lite&pageSize=15`;const j=await (await fetch(url)).json();return {url,hitCount:j.hitCount,top:(j.resultList?.result??[]).map(r=>({pmid:r.pmid??null,pmcid:r.pmcid??null,title:r.title,authors:r.authorString?.slice(0,120),year:r.pubYear,journal:r.journalTitle,isOpenAccess:r.isOpenAccess,pubType:r.pubType}))};};
const abstract=async pmid=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=EXT_ID:${pmid}%20AND%20SRC:MED`;const j=await (await fetch(url)).json();const r=j.resultList?.result?.[0];return {pmid,retrievedAt:new Date().toISOString(),url,title:r?.title,authors:r?.authorString,year:r?.pubYear,journal:r?.journalInfo?.journal?.title,doi:r?.doi??null,isOpenAccess:r?.isOpenAccess,pmcid:r?.pmcid??null,pubType:r?.pubTypeList?.pubType,abstract:r?.abstractText?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')??null};};
const mode=process.argv[2]??'search';
if(mode==='search'){
 const out={searchedOn:TODAY,site:'Europe PMC REST search API (lite, relevance)',searches:{}};
 for(const [k,{purpose,q}] of Object.entries(QUERIES)){try{out.searches[k]={purpose,query:q,...await search(q)};}catch(e){out.searches[k]={purpose,query:q,error:e.message};}}
 fs.writeFileSync(path.join(DIR,'search-r9.json'),JSON.stringify(out,null,2)+'\n');
 for(const [k,s] of Object.entries(out.searches)){console.log('##',k,'hits',s.hitCount,s.error??'');for(const r of s.top??[])console.log('  ',r.pmid,r.pmcid??'-',r.year,r.isOpenAccess,'|',r.title?.slice(0,140));}
}else if(mode==='fulltext'){
 for(const id of process.argv.slice(3)){const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/${id}/fullTextXML`;const r=await fetch(url);const t=await r.text();if(r.ok&&t.includes('<article')){fs.writeFileSync(path.join(DIR,id+'.xml'),t);console.log('##',id,'saved',t.length,'bytes');}else console.log('##',id,'not retrieved',r.status);}
}else{
 const ids=process.argv.slice(3),out=[];for(const id of ids){try{out.push(await abstract(id));}catch(e){out.push({pmid:id,error:e.message});}}
 const f=path.join(DIR,'abstracts-r9.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
 const merged=[...prior.filter(p=>!ids.includes(p.pmid)),...out];fs.writeFileSync(f,JSON.stringify(merged,null,2)+'\n');
 for(const r of out)console.log('##',r.pmid,r.pmcid??'-',r.year,'|',r.title,'|',r.authors?.slice(0,80),'|',r.doi,'\n',r.abstract?.slice(0,2200));
}
