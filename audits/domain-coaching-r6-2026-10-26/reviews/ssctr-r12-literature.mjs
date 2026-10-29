// SSCTR R6 round 12: Europe PMC searches (lite, relevance), abstract retrieval and open-access full-text retrieval for the round-12
// rulings. Reviewer-authored. Writes ssctr-evidence/search-r12.json, ssctr-evidence/abstracts-r12.json and, for open-access records
// named on the command line with `fulltext`, ssctr-evidence/<PMCID>.xml.
import fs from 'node:fs';
import path from 'node:path';
const DIR=path.join(import.meta.dirname,'ssctr-evidence'),TODAY='2026-10-27';
const QUERIES={
 r12taperstrength:{purpose:'Round 12 (re-establishment in a taper or race week): how resistance training is dosed during a taper or the final week before an endurance event, and whether a strength session in that window harms or helps performance; counterevidence: full strength volume tolerated or beneficial in the taper',
  q:'(TITLE_ABS:"taper" OR TITLE_ABS:"tapering" OR TITLE_ABS:"pre-competition" OR TITLE_ABS:"precompetition") AND (TITLE_ABS:"strength training" OR TITLE_ABS:"resistance training" OR TITLE_ABS:"concurrent training") AND (TITLE_ABS:"endurance" OR TITLE_ABS:"running" OR TITLE_ABS:"runners" OR TITLE_ABS:"cyclists")'},
 r12eimdrun:{purpose:'Round 12 (weight of a re-establishment close to a race): whether muscle damage or soreness from a lower-body resistance session impairs running economy or performance over the following days, and how long; counterevidence: no effect at low or moderate dose',
  q:'(TITLE_ABS:"muscle damage" OR TITLE_ABS:"muscle soreness" OR TITLE_ABS:"DOMS") AND (TITLE_ABS:"resistance exercise" OR TITLE_ABS:"strength training" OR TITLE_ABS:"resistance training" OR TITLE_ABS:"squat") AND (TITLE_ABS:"running economy" OR TITLE_ABS:"running performance" OR TITLE_ABS:"endurance performance")'},
 r12rbedetrain:{purpose:'Round 12 (weight of the first session after weeks without an exercise): whether the protection against muscle damage from earlier training persists after weeks without training, so that the first session back damages little; counterevidence: protection lost after a few weeks',
  q:'(TITLE_ABS:"repeated bout effect" OR TITLE_ABS:"repeated-bout effect") AND (TITLE_ABS:"weeks" OR TITLE_ABS:"months" OR TITLE_ABS:"duration" OR TITLE_ABS:"detraining" OR TITLE_ABS:"time course") AND (TITLE_ABS:"resistance" OR TITLE_ABS:"eccentric")'}
};
const search=async q=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&resultType=lite&pageSize=15`;const j=await (await fetch(url)).json();return {url,hitCount:j.hitCount,top:(j.resultList?.result??[]).map(r=>({pmid:r.pmid??null,pmcid:r.pmcid??null,title:r.title,authors:r.authorString?.slice(0,120),year:r.pubYear,journal:r.journalTitle,isOpenAccess:r.isOpenAccess,pubType:r.pubType}))};};
const abstract=async pmid=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=EXT_ID:${pmid}%20AND%20SRC:MED`;const j=await (await fetch(url)).json();const r=j.resultList?.result?.[0];return {pmid,retrievedAt:new Date().toISOString(),url,title:r?.title,authors:r?.authorString,year:r?.pubYear,journal:r?.journalInfo?.journal?.title,doi:r?.doi??null,isOpenAccess:r?.isOpenAccess,pmcid:r?.pmcid??null,pubType:r?.pubTypeList?.pubType,abstract:r?.abstractText?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')??null};};
const mode=process.argv[2]??'search';
if(mode==='search'){
 const out={searchedOn:TODAY,site:'Europe PMC REST search API (lite, relevance)',searches:{}};
 for(const [k,{purpose,q}] of Object.entries(QUERIES)){try{out.searches[k]={purpose,query:q,...await search(q)};}catch(e){out.searches[k]={purpose,query:q,error:e.message};}}
 fs.writeFileSync(path.join(DIR,'search-r12.json'),JSON.stringify(out,null,2)+'\n');
 for(const [k,s] of Object.entries(out.searches)){console.log('##',k,'hits',s.hitCount,s.error??'');for(const r of s.top??[])console.log('  ',r.pmid,r.pmcid??'-',r.year,r.isOpenAccess,'|',r.title?.slice(0,140));}
}else if(mode==='fulltext'){
 for(const id of process.argv.slice(3)){const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/${id}/fullTextXML`;const r=await fetch(url);const t=await r.text();if(r.ok&&t.includes('<article')){fs.writeFileSync(path.join(DIR,id+'.xml'),t);console.log('##',id,'saved',t.length,'bytes');}else console.log('##',id,'not retrieved',r.status);}
}else{
 const ids=process.argv.slice(3),out=[];for(const id of ids){try{out.push(await abstract(id));}catch(e){out.push({pmid:id,error:e.message});}}
 const f=path.join(DIR,'abstracts-r12.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
 const merged=[...prior.filter(p=>!ids.includes(p.pmid)),...out];fs.writeFileSync(f,JSON.stringify(merged,null,2)+'\n');
 for(const r of out)console.log('##',r.pmid,r.pmcid??'-',r.year,'|',r.title,'|',r.authors?.slice(0,80),'|',r.doi,'\n',r.abstract?.slice(0,2200));
}
