// SSCTR-RFC review r1, probe 06: every string the three added keys emit over a whole 10K journey (forecast and insights on; revision on in a
// second run), checked against values.forecast.forbiddenInCopy, a percent sign or z beside a range, and the engine's FORBIDDEN_CLAIM (B-4).
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
const H=await import('file:///'+ROOT+'test/v1rfc-helpers.mjs');
const {FORBIDDEN_CLAIM}=await import('file:///'+ROOT+'src/r6-prescription.mjs');
const {DEV,DEV_REVISION,timeline,racePlan,result,asPrescribed}=H;
const textsOf=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(textsOf):v&&typeof v==='object'?Object.values(v).flatMap(textsOf):[];
const seen=new Set();
for(const opts of [DEV,DEV_REVISION]){
 const t=timeline(racePlan({id:'c-'+(opts===DEV?'a':'b'),goalMinutes:48}),{opts});
 for(let w=0;w<=15;w++){const r=t.look(w);for(const k of ['runForecast','paceInsights','paceRevision'])for(const s of textsOf(r[k]))seen.add(s);if(w<15)t.week(w,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:270,actual:{measurement:'TRACK'}}:asPrescribed(t,s),w===7?{runEvidence:[result('10K',2940,'2027-02-28',{id:'tune'})]}:{});}
}
const sentences=[...seen].filter(s=>/\s/.test(s));
const bad=['you will run','predicted time','on track','achievable','likely','chance','confidence interval','critical speed','fitter','faster race'];
const hits=sentences.filter(s=>bad.some(b=>s.toLowerCase().includes(b))||/\d\s*%/.test(s)&&/\d:\d\d/.test(s));
const claim=sentences.filter(s=>FORBIDDEN_CLAIM.test?FORBIDDEN_CLAIM.test(s):false);
console.log('distinct sentences emitted:',sentences.length);
for(const s of sentences)console.log('  -',s.slice(0,220));
console.log('forbidden-word hits:',hits.length,hits);
console.log('FORBIDDEN_CLAIM hits:',claim.length,claim);
