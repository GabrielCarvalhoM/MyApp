// SSCTR R6 round 8: Europe PMC searches (lite, relevance) and abstract retrieval for the round-8 rulings. Reviewer-authored.
// Writes ssctr-evidence/search-r8.json (queries, hit counts, top hits) and ssctr-evidence/abstracts-r8.json (selected abstracts).
import fs from 'node:fs';
import path from 'node:path';
const DIR=path.join(import.meta.dirname,'ssctr-evidence'),TODAY='2026-10-26';
const QUERIES={
 r8race:{purpose:'Round 8 (D47): race day for athletes whose continuous running was built from walk/jog or a restart inside the program; counterevidence that a first 10K at race effort after short preparation is tolerated',
  q:'(TITLE_ABS:"novice runners" OR TITLE_ABS:"beginner runners") AND (TITLE_ABS:"10 km" OR TITLE_ABS:"10-km" OR TITLE_ABS:"race" OR TITLE_ABS:"event") AND (TITLE_ABS:"injury" OR TITLE_ABS:"running-related")'},
 r8runwalk:{purpose:'Round 8 (D47): run/walk pacing in races; any counterevidence on walk breaks',
  q:'(TITLE_ABS:"run-walk" OR TITLE_ABS:"run/walk" OR TITLE_ABS:"walk breaks" OR TITLE_ABS:"walking breaks") AND (TITLE_ABS:"marathon" OR TITLE_ABS:"race" OR TITLE_ABS:"half-marathon" OR TITLE_ABS:"10 km")'},
 r8loadrel:{purpose:'Round 8 (D45): session-to-session reproducibility of effort-selected loads (agreement tolerance for a second log)',
  q:'(TITLE_ABS:"repetitions in reserve" OR TITLE_ABS:"self-selected") AND (TITLE_ABS:"reliability" OR TITLE_ABS:"reproducibility" OR TITLE_ABS:"test-retest") AND (TITLE_ABS:"load" OR TITLE_ABS:"intensity") AND TITLE_ABS:"resistance"'},
 r8retrain:{purpose:'Round 8 (return sets): strength retraining after short detraining; how quickly prior volume is regained',
  q:'(TITLE_ABS:"detraining" OR TITLE_ABS:"training cessation") AND (TITLE_ABS:"retraining" OR TITLE_ABS:"muscle memory" OR TITLE_ABS:"resumption") AND TITLE_ABS:"strength"'}
};
const search=async q=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&resultType=lite&pageSize=15`;const j=await (await fetch(url)).json();return {url,hitCount:j.hitCount,top:(j.resultList?.result??[]).map(r=>({pmid:r.pmid??null,pmcid:r.pmcid??null,title:r.title,authors:r.authorString?.slice(0,120),year:r.pubYear,journal:r.journalTitle,isOpenAccess:r.isOpenAccess,pubType:r.pubType}))};};
const abstract=async pmid=>{const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=EXT_ID:${pmid}%20AND%20SRC:MED`;const j=await (await fetch(url)).json();const r=j.resultList?.result?.[0];return {pmid,retrievedAt:new Date().toISOString(),url,title:r?.title,authors:r?.authorString,year:r?.pubYear,journal:r?.journalInfo?.journal?.title,doi:r?.doi??null,isOpenAccess:r?.isOpenAccess,pmcid:r?.pmcid??null,pubType:r?.pubTypeList?.pubType,abstract:r?.abstractText?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')??null};};
const mode=process.argv[2]??'search';
if(mode==='search'){
 const out={searchedOn:TODAY,site:'Europe PMC REST search API (lite, relevance)',searches:{}};
 for(const [k,{purpose,q}] of Object.entries(QUERIES)){try{out.searches[k]={purpose,query:q,...await search(q)};}catch(e){out.searches[k]={purpose,query:q,error:e.message};}}
 fs.writeFileSync(path.join(DIR,'search-r8.json'),JSON.stringify(out,null,2)+'\n');
 for(const [k,s] of Object.entries(out.searches)){console.log('##',k,'hits',s.hitCount,s.error??'');for(const r of s.top??[])console.log('  ',r.pmid,r.pmcid??'-',r.year,r.isOpenAccess,'|',r.title?.slice(0,140));}
}else{
 const ids=process.argv.slice(3),out=[];for(const id of ids){try{out.push(await abstract(id));}catch(e){out.push({pmid:id,error:e.message});}}
 const f=path.join(DIR,'abstracts-r8.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
 const merged=[...prior.filter(p=>!ids.includes(p.pmid)),...out];fs.writeFileSync(f,JSON.stringify(merged,null,2)+'\n');
 for(const r of out)console.log('##',r.pmid,r.pmcid??'-',r.year,'|',r.title,'|',r.authors?.slice(0,80),'|',r.doi,'\n',r.abstract?.slice(0,2200));
}
