// SSCTR R6 round 10: Europe PMC searches (lite, relevance), abstract retrieval and open-access full-text retrieval for the round-10
// rulings. Reviewer-authored. Writes ssctr-evidence/search-r10.json, ssctr-evidence/abstracts-r10.json and, for open-access
// records named on the command line with `fulltext`, ssctr-evidence/<PMCID>.xml.
import fs from 'node:fs';
import path from 'node:path';
const DIR=path.join(import.meta.dirname,'ssctr-evidence'),TODAY='2026-10-26';
const QUERIES={
 r10detrain:{purpose:'Round 10 (D52-B): strength and muscle loss after 3-8 weeks without resistance training in trained or recreationally active adults, to weigh resuming the prior load after more than return.moderateMaxDays without performance (counterevidence: strength retained)',
  q:'(TITLE_ABS:"detraining" OR TITLE_ABS:"training cessation" OR TITLE_ABS:"inactivity") AND (TITLE_ABS:"resistance training" OR TITLE_ABS:"strength training") AND (TITLE_ABS:"muscle strength" OR TITLE_ABS:"maximal strength") AND (TITLE_ABS:"weeks")'},
 r10repeatedbout:{purpose:'Round 10 (D52-B, R17): how long the protective repeated-bout effect against exercise-induced muscle damage lasts, for an exercise resumed after weeks without it',
  q:'(TITLE_ABS:"repeated bout effect" OR TITLE_ABS:"repeated-bout effect") AND (TITLE_ABS:"weeks" OR TITLE_ABS:"months" OR TITLE_ABS:"duration" OR TITLE_ABS:"long-lasting")'},
 r10selfselected:{purpose:'Round 10 (D52-A): what loads people choose without a prescribed reference (self-selected resistance training loads), to weigh a row that names a logged load that does not exist',
  q:'(TITLE_ABS:"self-selected" OR TITLE_ABS:"self selected") AND (TITLE_ABS:"load" OR TITLE_ABS:"intensity") AND (TITLE_ABS:"resistance training" OR TITLE_ABS:"resistance exercise")'},
 r10recoveryweek:{purpose:'Round 10 (Q4): evidence on how a reduced (recovery or deload) week in running is distributed across sessions, in particular whether the long run must stay the longest session',
  q:'(TITLE_ABS:"runners" OR TITLE_ABS:"running") AND (TITLE_ABS:"recovery week" OR TITLE_ABS:"deload" OR TITLE_ABS:"step-back week" OR TITLE_ABS:"unloading week" OR TITLE_ABS:"reduced training volume") AND (TITLE_ABS:"long run" OR TITLE_ABS:"training load" OR TITLE_ABS:"periodization")'}
};
const search=async q=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&resultType=lite&pageSize=15`;const j=await (await fetch(url)).json();return {url,hitCount:j.hitCount,top:(j.resultList?.result??[]).map(r=>({pmid:r.pmid??null,pmcid:r.pmcid??null,title:r.title,authors:r.authorString?.slice(0,120),year:r.pubYear,journal:r.journalTitle,isOpenAccess:r.isOpenAccess,pubType:r.pubType}))};};
const abstract=async pmid=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=EXT_ID:${pmid}%20AND%20SRC:MED`;const j=await (await fetch(url)).json();const r=j.resultList?.result?.[0];return {pmid,retrievedAt:new Date().toISOString(),url,title:r?.title,authors:r?.authorString,year:r?.pubYear,journal:r?.journalInfo?.journal?.title,doi:r?.doi??null,isOpenAccess:r?.isOpenAccess,pmcid:r?.pmcid??null,pubType:r?.pubTypeList?.pubType,abstract:r?.abstractText?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')??null};};
const mode=process.argv[2]??'search';
if(mode==='search'){
 const out={searchedOn:TODAY,site:'Europe PMC REST search API (lite, relevance)',searches:{}};
 for(const [k,{purpose,q}] of Object.entries(QUERIES)){try{out.searches[k]={purpose,query:q,...await search(q)};}catch(e){out.searches[k]={purpose,query:q,error:e.message};}}
 fs.writeFileSync(path.join(DIR,'search-r10.json'),JSON.stringify(out,null,2)+'\n');
 for(const [k,s] of Object.entries(out.searches)){console.log('##',k,'hits',s.hitCount,s.error??'');for(const r of s.top??[])console.log('  ',r.pmid,r.pmcid??'-',r.year,r.isOpenAccess,'|',r.title?.slice(0,140));}
}else if(mode==='fulltext'){
 for(const id of process.argv.slice(3)){const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/${id}/fullTextXML`;const r=await fetch(url);const t=await r.text();if(r.ok&&t.includes('<article')){fs.writeFileSync(path.join(DIR,id+'.xml'),t);console.log('##',id,'saved',t.length,'bytes');}else console.log('##',id,'not retrieved',r.status);}
}else{
 const ids=process.argv.slice(3),out=[];for(const id of ids){try{out.push(await abstract(id));}catch(e){out.push({pmid:id,error:e.message});}}
 const f=path.join(DIR,'abstracts-r10.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
 const merged=[...prior.filter(p=>!ids.includes(p.pmid)),...out];fs.writeFileSync(f,JSON.stringify(merged,null,2)+'\n');
 for(const r of out)console.log('##',r.pmid,r.pmcid??'-',r.year,'|',r.title,'|',r.authors?.slice(0,80),'|',r.doi,'\n',r.abstract?.slice(0,2200));
}
