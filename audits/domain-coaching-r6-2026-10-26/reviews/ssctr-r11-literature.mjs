// SSCTR R6 round 11: Europe PMC searches (lite, relevance), abstract retrieval and open-access full-text retrieval for the round-11
// rulings. Reviewer-authored. Writes ssctr-evidence/search-r11.json, ssctr-evidence/abstracts-r11.json and, for open-access records
// named on the command line with `fulltext`, ssctr-evidence/<PMCID>.xml.
import fs from 'node:fs';
import path from 'node:path';
const DIR=path.join(import.meta.dirname,'ssctr-evidence'),TODAY='2026-10-26';
const QUERIES={
 r11rbeshort:{purpose:'Round 11 (dossier Q1; D53 weight): does one first, lower-volume or lower-intensity bout protect against muscle damage from a subsequent bout a few days to two weeks later (repeated-bout effect after a low-dose first exposure); counterevidence: no protection',
  q:'(TITLE_ABS:"repeated bout effect" OR TITLE_ABS:"repeated-bout effect" OR TITLE_ABS:"protective effect") AND (TITLE_ABS:"low-intensity" OR TITLE_ABS:"low intensity" OR TITLE_ABS:"lower volume" OR TITLE_ABS:"fewer" OR TITLE_ABS:"submaximal") AND (TITLE_ABS:"eccentric" OR TITLE_ABS:"resistance exercise" OR TITLE_ABS:"muscle damage")'},
 r11retrain:{purpose:'Round 11 (D53): how training volume is reintroduced after weeks without resistance training (retraining after detraining), and whether a fast return to the prior number of sets is supported; counterevidence: prior volume tolerated at once',
  q:'(TITLE_ABS:"retraining" OR TITLE_ABS:"re-training" OR TITLE_ABS:"muscle memory") AND (TITLE_ABS:"detraining" OR TITLE_ABS:"training cessation") AND (TITLE_ABS:"resistance training" OR TITLE_ABS:"strength training")'},
 r11novicevolume:{purpose:'Round 11 (dossier Q1, cost side): strength and hypertrophy gains from low set volumes in the first weeks of training in untrained or novice adults (single versus multiple sets); counterevidence: early gains need higher volume',
  q:'(TITLE_ABS:"single set" OR TITLE_ABS:"single-set" OR TITLE_ABS:"low volume" OR TITLE_ABS:"low-volume") AND (TITLE_ABS:"untrained" OR TITLE_ABS:"novice" OR TITLE_ABS:"beginners") AND (TITLE_ABS:"resistance training" OR TITLE_ABS:"strength training")'}
};
const search=async q=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&resultType=lite&pageSize=15`;const j=await (await fetch(url)).json();return {url,hitCount:j.hitCount,top:(j.resultList?.result??[]).map(r=>({pmid:r.pmid??null,pmcid:r.pmcid??null,title:r.title,authors:r.authorString?.slice(0,120),year:r.pubYear,journal:r.journalTitle,isOpenAccess:r.isOpenAccess,pubType:r.pubType}))};};
const abstract=async pmid=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=EXT_ID:${pmid}%20AND%20SRC:MED`;const j=await (await fetch(url)).json();const r=j.resultList?.result?.[0];return {pmid,retrievedAt:new Date().toISOString(),url,title:r?.title,authors:r?.authorString,year:r?.pubYear,journal:r?.journalInfo?.journal?.title,doi:r?.doi??null,isOpenAccess:r?.isOpenAccess,pmcid:r?.pmcid??null,pubType:r?.pubTypeList?.pubType,abstract:r?.abstractText?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')??null};};
const mode=process.argv[2]??'search';
if(mode==='search'){
 const out={searchedOn:TODAY,site:'Europe PMC REST search API (lite, relevance)',searches:{}};
 for(const [k,{purpose,q}] of Object.entries(QUERIES)){try{out.searches[k]={purpose,query:q,...await search(q)};}catch(e){out.searches[k]={purpose,query:q,error:e.message};}}
 fs.writeFileSync(path.join(DIR,'search-r11.json'),JSON.stringify(out,null,2)+'\n');
 for(const [k,s] of Object.entries(out.searches)){console.log('##',k,'hits',s.hitCount,s.error??'');for(const r of s.top??[])console.log('  ',r.pmid,r.pmcid??'-',r.year,r.isOpenAccess,'|',r.title?.slice(0,140));}
}else if(mode==='fulltext'){
 for(const id of process.argv.slice(3)){const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/${id}/fullTextXML`;const r=await fetch(url);const t=await r.text();if(r.ok&&t.includes('<article')){fs.writeFileSync(path.join(DIR,id+'.xml'),t);console.log('##',id,'saved',t.length,'bytes');}else console.log('##',id,'not retrieved',r.status);}
}else{
 const ids=process.argv.slice(3),out=[];for(const id of ids){try{out.push(await abstract(id));}catch(e){out.push({pmid:id,error:e.message});}}
 const f=path.join(DIR,'abstracts-r11.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
 const merged=[...prior.filter(p=>!ids.includes(p.pmid)),...out];fs.writeFileSync(f,JSON.stringify(merged,null,2)+'\n');
 for(const r of out)console.log('##',r.pmid,r.pmcid??'-',r.year,'|',r.title,'|',r.authors?.slice(0,80),'|',r.doi,'\n',r.abstract?.slice(0,2200));
}
