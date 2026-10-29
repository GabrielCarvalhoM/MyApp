// SSCTR R6 (native reviewer) literature access: Europe PMC REST search and legal full-text XML retrieval.
// Usage: node ssctr-r6-literature.mjs search            -> runs the query set, appends to ssctr-r6-search-log.json
//        node ssctr-r6-literature.mjs fetch PMCID ...    -> retrieves fullTextXML into ssctr-evidence/, appends to ssctr-r6-access-trace.json
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const dir=import.meta.dirname,evidence=path.join(dir,'ssctr-evidence'),today='2026-10-26';
const append=(file,rows)=>{const f=path.join(dir,file);let prior=[];try{prior=JSON.parse(fs.readFileSync(f,'utf8'));}catch{}fs.writeFileSync(f,JSON.stringify([...prior,...rows],null,2)+'\n');};
const QUERIES=[
 ['RESIDUAL_ST_TO_RUN','(resistance OR strength) training AND (running economy OR endurance performance) AND (residual OR "subsequent" OR "following") AND fatigue AND review','Residual effect of lower-body strength sessions on subsequent running'],
 ['AEROBIC_TO_STRENGTH','"concurrent" AND (aerobic OR endurance) AND "subsequent" AND strength performance AND (acute OR recovery) AND (hours OR "h")','Residual effect of prior endurance exercise on subsequent strength performance'],
 ['SEQUENCE_META','concurrent training AND (sequence OR order) AND meta-analysis','Intra-session order effects on strength/hypertrophy/aerobic adaptations'],
 ['RECOVERY_BETWEEN','concurrent training AND recovery duration between sessions AND (6 h OR 24 h)','Between-session spacing in concurrent training'],
 ['TAPER_META','taper AND endurance AND performance AND meta-analysis','Taper volume/intensity/frequency/duration'],
 ['TAPER_RECREATIONAL','taper AND (recreational OR amateur) AND (runners OR marathon OR half-marathon)','Taper in recreational runners'],
 ['MAINTENANCE_DOSE','minimal dose AND maintain AND (strength OR endurance) AND (detraining OR reduced training)','Reduced-dose maintenance of strength during event phases'],
 ['STRENGTH_IN_TAPER','(strength training OR resistance training) AND taper AND (endurance athletes OR runners OR cyclists)','Strength work during endurance taper'],
 ['SPIKE_SESSION','running AND injury AND (single session OR longest run) AND (spike OR increase) AND cohort','Single-session distance spikes and injury'],
 ['NOVICE_PROGRESSION','novice runners AND (weekly progression OR training load change) AND injury','Weekly progression magnitude and injury in novice runners'],
 ['LOAD_INJURY_REVIEW','running-related injury AND training load AND (systematic review OR meta-analysis)','Training load change and running-related injury'],
 ['RIR_ACCURACY','repetitions in reserve AND (accuracy OR prediction) AND (meta-analysis OR systematic review)','Accuracy of RIR estimation'],
 ['REP_VS_LOAD_PROGRESSION','progressive overload AND (repetition progression OR load progression) AND hypertrophy','Reps-then-load (double) progression'],
 ['SET_VOLUME_DOSE','resistance training AND weekly sets AND dose-response AND (hypertrophy OR strength) AND meta-analysis','Set-volume progression'],
 ['DETRAINING_STRENGTH','(training cessation OR detraining) AND (muscle strength OR muscular performance) AND meta-analysis','Strength retention after interruption'],
 ['DETRAINING_ENDURANCE','detraining AND (VO2max OR endurance) AND (weeks) AND (trained OR recreational)','Endurance retention after interruption'],
 ['RETRAINING','(retraining OR muscle memory) AND (detraining) AND resistance training','Regain after interruption'],
 ['TALK_TEST','talk test AND (ventilatory threshold OR exercise intensity) AND validity','Effort anchors for intensity'],
 ['RPE_PRESCRIPTION','(rating of perceived exertion OR RPE) AND (prescription OR self-regulated) AND running AND (intensity OR threshold)','RPE-anchored running intensity'],
 ['RECREATIONAL_TID','(recreational OR amateur) runners AND (polarized OR pyramidal OR threshold) AND randomized','Intensity distribution and threshold work in recreational runners'],
 ['THRESHOLD_INTERVALS','(threshold OR tempo OR cruise) intervals AND runners AND randomized AND (5 km OR 10 km OR half marathon)','Threshold/interval progression in recreational runners'],
 ['STRIDES_SPRINTS','(strides OR short sprints OR sprint interval) AND (running economy OR distance runners) AND (recreational OR trained)','Short relaxed fast running'],
 ['EXERCISE_VARIATION','(exercise variation OR varying exercises OR exercise rotation) AND resistance training AND (hypertrophy OR strength)','Exercise rotation and continuity'],
 ['EXERCISE_SPECIFICITY_SUB','resistance training AND (exercise selection OR specificity) AND (transfer OR different exercises) AND strength gains','Substitution specificity'],
 ['ST_RUNNERS_META','(strength training OR resistance training) AND (distance runners OR endurance runners) AND (running economy OR performance) AND meta-analysis','Strength training for runners'],
 ['HM_RECOVERY','half-marathon AND recovery AND (muscle damage OR time course) AND recreational','Post-event recovery'],
 ['RETURN_RUNNING_NONCLIN','(return to running OR resumption) AND (training interruption OR break) AND runners NOT injury','Nonclinical return'],
 ['NOVICE_STRENGTH_LOAD','(novice OR untrained) AND resistance training AND (load selection OR self-selected intensity OR familiarization)','Load establishment for novices'],
 ['INDIVIDUALIZED_RUN','individualized endurance training AND (heart rate variability OR recovery) AND recreational runners AND randomized','Response-informed progression'],
 ['MONITORING_MISSING','(athlete monitoring OR training monitoring) AND (missing data OR data quality OR wearable)','Partial/noisy monitoring data']
];
async function search(){
 const rows=[];
 for(const [id,query,purpose] of QUERIES){
  const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query+' AND (SRC:MED OR SRC:PMC)')}&format=json&pageSize=12&resultType=lite&sort=CITED%20desc`;
  try{const r=await fetch(url);const j=await r.json();rows.push({id,query,site:'Europe PMC REST search (lite, sorted by citations)',searched_on:today,purpose,hitCount:j.hitCount,results:(j.resultList?.result??[]).map(x=>({pmid:x.pmid??null,pmcid:x.pmcid??null,doi:x.doi??null,title:x.title,journal:x.journalTitle,year:x.pubYear,isOpenAccess:x.isOpenAccess,inPMC:x.inPMC,cited:x.citedByCount}))});}
  catch(e){rows.push({id,query,searched_on:today,purpose,error:e.message});}
 }
 append('ssctr-r6-search-log.json',rows);
 for(const r of rows){console.log('##',r.id,r.hitCount);for(const x of r.results??[])console.log('  ',x.year,x.pmcid??'-',x.pmid??'-',x.isOpenAccess,String(x.cited).padStart(4),'|',x.title?.slice(0,140),'|',x.journal);}
}
async function fetchIds(ids){
 fs.mkdirSync(evidence,{recursive:true});const trace=[];
 for(const id of ids){
  const url=`https://www.ebi.ac.uk/europepmc/webservices/rest/${id}/fullTextXML`;
  try{const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);const xml=await r.text();if(!xml.includes('<article'))throw new Error('Not article XML');fs.writeFileSync(path.join(evidence,id+'.xml'),xml);const title=xml.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/)?.[1]?.replace(/<[^>]+>/g,'');trace.push({id,url,accessedOn:today,status:'RETRIEVED',accessor:'SSCTR-R6-native',sha256:createHash('sha256').update(xml).digest('hex'),bytes:Buffer.byteLength(xml),title});console.log('OK',id,title);}
  catch(e){trace.push({id,url,accessedOn:today,status:'FAILED',accessor:'SSCTR-R6-native',error:e.message});console.log('FAIL',id,e.message);}
 }
 append('ssctr-r6-access-trace.json',trace);
}
const [mode,...rest]=process.argv.slice(2);
if(mode==='search')await search();else if(mode==='fetch')await fetchIds(rest);else console.log('usage: search | fetch PMCID...');
