// SSCTR R6 native reviewer: second, field-restricted Europe PMC search set (relevance order). Appends to ssctr-r6-search-log.json.
import fs from 'node:fs';
import path from 'node:path';
const dir=import.meta.dirname,today='2026-10-26';
const Q=[
 ['RESIDUAL_ST_TO_RUN','TITLE_ABS:"resistance training" AND TITLE_ABS:"running economy" AND TITLE_ABS:"impair*"','Residual effect of lower-body strength sessions on subsequent running'],
 ['DOMA_REVIEW','TITLE:"impaired endurance performance following single bouts of resistance training"','Doma 2017 review'],
 ['AEROBIC_TO_STRENGTH','TITLE_ABS:"aerobic exercise" AND TITLE_ABS:"subsequent" AND TITLE_ABS:"strength" AND TITLE_ABS:"concurrent"','Prior endurance exercise and subsequent strength'],
 ['SEQUENCE_META','TITLE:"concurrent" AND (TITLE:"sequence" OR TITLE:"order") AND (TITLE:"meta-analysis" OR TITLE:"systematic review")','Intra-session order'],
 ['RECOVERY_BETWEEN','TITLE:"concurrent" AND TITLE:"recovery duration"','Spacing between concurrent sessions'],
 ['TAPER_META','TITLE:"taper*" AND TITLE:"meta-analysis"','Taper meta-analyses'],
 ['TAPER_RECREATIONAL','TITLE:"taper*" AND (TITLE:"recreational" OR TITLE:"marathon")','Taper in recreational runners'],
 ['MAINTENANCE_DOSE','TITLE:"maintaining physical performance" OR (TITLE:"minimal dose" AND TITLE:"exercise")','Minimal maintenance dose'],
 ['SPIKE_SESSION','TITLE:"how much running is too much"','Frandsen 2025 single-session spikes'],
 ['NOVICE_PROGRESSION','TITLE:"novice runners" AND TITLE_ABS:"weekly" AND TITLE_ABS:"injur*" AND TITLE_ABS:"progression"','Weekly progression in novice runners'],
 ['GRONORUN_RESULT','TITLE_ABS:"graded training program" AND TITLE_ABS:"novice runners"','Buist 2008 graded programme results'],
 ['RIR_ACCURACY','TITLE:"accuracy in predicting repetitions to task failure"','Halperin 2022 RIR accuracy'],
 ['REP_VS_LOAD','TITLE:"progressive overload without progressing load"','Plotkin 2022'],
 ['SET_VOLUME','TITLE_ABS:"dose-response" AND TITLE_ABS:"weekly" AND TITLE_ABS:"sets" AND TITLE_ABS:"hypertrophy" AND TITLE_ABS:"meta-analysis"','Set volume dose-response'],
 ['DETRAINING_STRENGTH','TITLE:"training cessation" AND TITLE_ABS:"muscular performance"','Bosquet 2013 detraining strength'],
 ['DETRAINING_GENERAL','TITLE:"detraining" AND (TITLE:"systematic review" OR TITLE:"meta-analysis")','Detraining syntheses'],
 ['TALK_TEST','TITLE:"talk test"','Talk test validity'],
 ['RECREATIONAL_TID','(TITLE:"recreational runners" OR TITLE:"recreational athletes") AND (TITLE_ABS:"polarized" OR TITLE_ABS:"intensity distribution")','Intensity distribution in recreational runners'],
 ['EXERCISE_VARIATION','TITLE_ABS:"exercise variation" AND TITLE_ABS:"resistance training" AND TITLE_ABS:"hypertrophy"','Exercise rotation'],
 ['ST_RUNNERS_META','TITLE:"strength training" AND TITLE_ABS:"distance running" AND (TITLE:"meta-analysis" OR TITLE:"systematic review")','Strength training for runners'],
 ['HM_RECOVERY','TITLE:"half-marathon" AND TITLE_ABS:"recovery"','Post-race recovery'],
 ['STRIDES','TITLE_ABS:"sprint" AND TITLE_ABS:"running economy" AND TITLE_ABS:"endurance runners" AND TITLE_ABS:"training"','Short fast running additions'],
 ['INDIVIDUALIZED','TITLE_ABS:"individualized" AND TITLE_ABS:"endurance training" AND TITLE_ABS:"recreational runners"','Response-guided progression'],
 ['RPE_RUN','TITLE_ABS:"perceived exertion" AND TITLE_ABS:"self-paced" AND TITLE_ABS:"interval" AND TITLE_ABS:"runners"','RPE-anchored intervals'],
 ['RETRAINING','TITLE_ABS:"retraining" AND TITLE_ABS:"detraining" AND TITLE_ABS:"resistance training"','Regain after interruption']
];
const rows=[];
for(const [id,query,purpose] of Q){
 const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=10&resultType=lite`;
 try{const j=await (await fetch(url)).json();rows.push({id,query,site:'Europe PMC REST search (lite, relevance)',searched_on:today,purpose,hitCount:j.hitCount,results:(j.resultList?.result??[]).map(x=>({pmid:x.pmid??null,pmcid:x.pmcid??null,doi:x.doi??null,title:x.title,journal:x.journalTitle,year:x.pubYear,isOpenAccess:x.isOpenAccess}))});}
 catch(e){rows.push({id,query,searched_on:today,purpose,error:e.message});}
}
const f=path.join(dir,'ssctr-r6-search-log.json');let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}
fs.writeFileSync(f,JSON.stringify([...prior,...rows.map(r=>({...r,set:'v2'}))],null,2)+'\n');
for(const r of rows){console.log('##',r.id,r.hitCount??r.error);for(const x of r.results??[])console.log('  ',x.year,x.pmcid??'-',x.pmid??'-',x.isOpenAccess,'|',x.title?.slice(0,130),'|',x.journal);}
