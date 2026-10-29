// SSCTR R6 native reviewer: third targeted search set. Appends to ssctr-r6-search-log.json.
import fs from 'node:fs';
import path from 'node:path';
const dir=import.meta.dirname,today='2026-10-26';
const Q=[
 ['TAPER_ENDURANCE','(TITLE:"tapering" OR TITLE:"taper") AND (TITLE_ABS:"endurance" OR TITLE_ABS:"runners") AND (TITLE_ABS:"performance")','Taper syntheses/primary'],
 ['TAPER_WANG','DOI:"10.1371/journal.pone.0282838"','Wang 2023 PLOS ONE taper meta-analysis (R5 source)'],
 ['EIMD_RUNNING','TITLE_ABS:"muscle damage" AND TITLE_ABS:"running performance" AND (TITLE_ABS:"resistance" OR TITLE_ABS:"eccentric")','Muscle damage after strength work and subsequent running'],
 ['EDDENS','TITLE:"intra-session exercise sequence"','Eddens 2018 order meta-analysis'],
 ['ST_BEFORE_RUN_ACUTE','TITLE_ABS:"strength training" AND TITLE_ABS:"running" AND TITLE_ABS:"24 h" AND TITLE_ABS:"acute"','Acute next-day effect of strength work on running'],
 ['RE_AFTER_ST','TITLE_ABS:"running economy" AND TITLE_ABS:"lower body" AND TITLE_ABS:"resistance" AND TITLE_ABS:"hours"','Running economy hours after lower-body resistance work'],
 ['CONCURRENT_SAME_DAY','TITLE_ABS:"concurrent training" AND (TITLE_ABS:"same day" OR TITLE_ABS:"separate days") AND TITLE_ABS:"strength"','Same-day vs separate-day scheduling'],
 ['HILLS','TITLE_ABS:"uphill" AND TITLE_ABS:"interval" AND TITLE_ABS:"runners" AND TITLE_ABS:"training"','Hill work'],
 ['RPE_LOAD_SELECT','TITLE_ABS:"repetitions in reserve" AND TITLE_ABS:"load" AND (TITLE_ABS:"novice" OR TITLE_ABS:"untrained" OR TITLE_ABS:"inexperienced")','RIR load selection by novices'],
 ['SELF_SELECTED','TITLE_ABS:"self-selected" AND TITLE_ABS:"resistance training" AND TITLE_ABS:"intensity"','Self-selected loads'],
 ['RUN_INJURY_LOAD_SR','TITLE_ABS:"running-related injur*" AND TITLE_ABS:"training load" AND (TITLE:"systematic review" OR TITLE:"meta-analysis")','Training-load change and running injury'],
 ['NIELSEN_2014','TITLE:"excessive progression in weekly running distance"','Nielsen 2014'],
 ['DAMSTED','TITLE_ABS:"change in training load" AND TITLE_ABS:"running" AND TITLE_ABS:"injur*"','Load change and injury'],
 ['WALK_RUN','TITLE_ABS:"run-walk" OR (TITLE_ABS:"walk" AND TITLE_ABS:"novice runners" AND TITLE_ABS:"program")','Walk/jog entry programmes'],
 ['MARATHON_TAPER_OBS','TITLE:"longer disciplined tapers"','Recreational taper observational'],
 ['STRENGTH_MAINT_INSEASON','TITLE_ABS:"in-season" AND TITLE_ABS:"strength maintenance" AND (TITLE_ABS:"cyclists" OR TITLE_ABS:"runners" OR TITLE_ABS:"endurance")','In-season strength maintenance in endurance athletes']
];
const rows=[];
for(const [id,query,purpose] of Q){
 const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=10&resultType=lite`;
 try{const j=await (await fetch(url)).json();rows.push({id,query,site:'Europe PMC REST search (lite, relevance)',searched_on:today,purpose,hitCount:j.hitCount,results:(j.resultList?.result??[]).map(x=>({pmid:x.pmid??null,pmcid:x.pmcid??null,doi:x.doi??null,title:x.title,journal:x.journalTitle,year:x.pubYear,isOpenAccess:x.isOpenAccess}))});}
 catch(e){rows.push({id,query,searched_on:today,purpose,error:e.message});}
}
const f=path.join(dir,'ssctr-r6-search-log.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
fs.writeFileSync(f,JSON.stringify([...prior,...rows.map(r=>({...r,set:'v3'}))],null,2)+'\n');
for(const r of rows){console.log('##',r.id,r.hitCount??r.error);for(const x of r.results??[])console.log('  ',x.year,x.pmcid??'-',x.pmid??'-',x.isOpenAccess,'|',x.title?.slice(0,130),'|',x.journal);}
