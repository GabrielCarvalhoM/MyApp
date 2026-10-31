// Probe batch C-mutation: catalog and SSCTR-record binding under byte changes. The frozen tree is extracted with `git archive` (HEAD) into the
// OS temp directory, one copy per variant; only the copies are mutated. Nothing in the repository is written. Read-only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {record,guard,done,REPO} from './lib.mjs';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7b-eng-judge-'));
const tar=path.join(tmp,'frozen.tar'),base=path.join(tmp,'base');fs.mkdirSync(base);
const paths=['CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'];
const ar=spawnSync('git',['archive','--format=tar','-o',tar,'HEAD',...paths],{cwd:REPO,encoding:'utf8'});if(ar.status!==0)throw new Error(ar.stderr);
const tx=spawnSync('tar',['-xf',path.relative(base,tar).replace(/\\/g,'/')],{cwd:base,encoding:'utf8'});if(tx.status!==0)throw new Error(tx.stderr);
const CAT='CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',REC='audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json';
let n=0;
async function variant(label,mutate){
 const dir=path.join(tmp,'v'+(n++));fs.cpSync(base,dir,{recursive:true});mutate(dir);
 const H=await import(pathToFileURL(path.join(dir,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
 const R=await import(pathToFileURL(path.join(dir,'CoachingCore/src/r7b-repertoire.mjs')).href);
 return {label,H,R};
}
const edit=(dir,rel,f)=>{const p=path.join(dir,rel);fs.writeFileSync(p,f(fs.readFileSync(p)));};
const recs=dir=>JSON.parse(fs.readFileSync(path.join(dir,REC),'utf8'));
const writeRecs=(dir,x)=>fs.writeFileSync(path.join(dir,REC),JSON.stringify(x,null,1));
const GRAD={id:'m-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};

const out={};
try{
 const real=await import(pathToFileURL(path.join(REPO,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
 const realProgram=real.program({id:'m-real'});
 const v={};
 v.baseline=await variant('baseline',()=>{});
 v.catalogByte=await variant('catalog one byte changed',d=>edit(d,CAT,b=>{const s=b.toString('utf8');const i=s.indexOf('"revision"');return Buffer.from(s.slice(0,i)+' '+s.slice(i),'utf8');}));
 v.catalogMissing=await variant('catalog missing',d=>fs.rmSync(path.join(d,CAT)));
 v.recordsMissing=await variant('records missing',d=>fs.rmSync(path.join(d,REC)));
 v.recordsCorrupt=await variant('records not JSON',d=>edit(d,REC,b=>Buffer.concat([b,Buffer.from('}')])));
 v.c01Rejected=await variant('B0-C01 record REJECT',d=>writeRecs(d,recs(d).map(r=>r.review_id.endsWith('B0-C01')?{...r,disposition:'REJECT'}:r)));
 v.c01Revoked=await variant('B0-C01 approve + appended REVOKE/REJECT record',d=>{const x=recs(d),c=x.find(r=>r.review_id.endsWith('B0-C01'));writeRecs(d,[...x,{...c,review_revision:'r3',disposition:'REJECT',evidence_status:'NOT_SUPPORTED'}]);});
 v.coreExpired=await variant('B0-C05 review_by in the past',d=>writeRecs(d,recs(d).map(r=>r.review_id.endsWith('B0-C05')?{...r,expiry:{...r.expiry,review_by:'2026-10-01'}}:r)));
 v.c10Off=await variant('B0-C10 record removed',d=>writeRecs(d,recs(d).filter(r=>!r.review_id.endsWith('B0-C10'))));
 const status=(H,o)=>{const g=H.gen(o);return {status:g.status,reason:String(g.reason).slice(0,140)};};
 for(const [k,x] of Object.entries(v)){
  const a=x.R.repertoireAuthority({asOf:'2026-11-01'});
  const ev=x.H.evaluateProgram(realProgram,x.H.review(realProgram,0,{observations:[]}),x.H.opts);
  const t={};try{const g=x.H.gen(GRAD);t.gradStatus=g.status;if(g.program){const tt={p:g.program,ledger:[]};for(let w=0;w<4;w++)x.H.weekly(tt,w);t.graduated=!!tt.p.canonical.athlete.runGraduation;}}catch(e){t.error=String(e.message).slice(0,160);}
  out[k]={label:x.label,valid:a.valid,approved:Object.keys(a.approved).sort(),catalogFileSha:x.R.CATALOG_FILE_SHA256?.slice(0,12)??null,generate:status(x.H,{id:'m-gen'}),reviewOfRealProgram:{status:ev.status,reason:String(ev.reason).slice(0,140)},graduation:t,fiveK:status(x.H,{id:'m-5k',goals:{run:'RACE',strength:'NONE'},event:{kind:'5K',date:'2026-12-20'},schedule:{strengthDays:[]}})};
 }
 const failClosed=['catalogByte','catalogMissing','recordsMissing','recordsCorrupt','coreExpired'].every(k=>out[k].generate.status==='UNSUPPORTED'&&out[k].reviewOfRealProgram.status==='UNSUPPORTED');
 record('C1a','catalog/records binding: fail closed',failClosed&&out.baseline.generate.status==='PROPOSED',
  'any catalog byte change, a missing catalog or records file, unreadable records or an expired core record: no program and no review decision',
  Object.fromEntries(['baseline','catalogByte','catalogMissing','recordsMissing','recordsCorrupt','coreExpired'].map(k=>[k,{valid:out[k].valid,generate:out[k].generate.status,review:out[k].reviewOfRealProgram.status}])));
 record('C1b','per-record gating: a rejected candidate is off',out.c01Rejected.graduation.graduated===false&&!out.c01Rejected.approved.includes('B0-C01'),
  'B0-C01 rejected: graduation never happens (its fallback, easy running, applies)',{c01Rejected:out.c01Rejected.graduation,approved:out.c01Rejected.approved,baseline:out.baseline.graduation});
 record('C1c','per-record gating: a later non-enabling record for the same candidate',!out.c01Revoked.approved.includes('B0-C01'),
  'fail closed: when the records hold a non-enabling (rejecting) record for a candidate next to an approving one, the candidate is off (or the set is refused)',
  {approved:out.c01Revoked.approved,graduation:out.c01Revoked.graduation});
 record('C1d','per-record gating: B0-C10 (5K fallback) record removed',out.c10Off.fiveK.status!=='PROPOSED',
  'without the B0-C10 record the 5K fallback is off: a 5K is outside the event scope as in R6 (no PERFORMANCE plan from a 5K input)',
  {c10Off:{approved:out.c10Off.approved,fiveK:out.c10Off.fiveK},baseline:{fiveK:out.baseline.fiveK}});
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
done('c-mutation');
