import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..'),out=path.join(root,'CoachingCore/r4');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>fs.writeFileSync(path.join(out,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const old=load('CoachingCore/r3/REPRESENTATIVE_RUNTIME_RESULTS_R3.json').results;
const current=load('CoachingCore/r4/FROZEN40_RERUN.json').results;
const code=x=>({'POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED':'POSITIVE','SUPPORTED_KEEP':'KEEP','CORRECT_ABSTAIN_OR_HOLD':'HOLD','NOT_SUPPORTED_DOMAIN_GAP':'NOT_SUPPORTED_DOMAIN','NOT_SUPPORTED_SCIENCE_GAP':'NOT_SUPPORTED_SCIENCE'}[x]??x);
const cases=current.map(c=>({caseId:c.caseId,from:code(old.find(x=>x.caseId===c.caseId).coverage),to:c.coverage,missingInputs:c.missingInputs,remainingDependency:c.unsupportedDependency}));
const groups=[];
for(const from of [...new Set(cases.map(x=>x.from))])for(const to of [...new Set(cases.filter(x=>x.from===from).map(x=>x.to))]){const rows=cases.filter(x=>x.from===from&&x.to===to);groups.push({from,to,count:rows.length,caseIds:rows.map(x=>x.caseId)});}
write('R3_TO_R4_TRANSITIONS.json',{revision:'DCR4-TRANSITIONS-1',cases,groups,interpretation:'A lower domain-gap count includes targeted ASK for absent current anchors, not only added prescriptions. Raw ASK count15 can conceal removal of unnecessary questions and discovery of different legitimate missing inputs.'});
write('R3_TO_R4_TRANSITIONS.md','# R3 → R4 case transitions\n\nUnchanged source facts and original expectations. Domain closure is not equivalent to a positive: some resolved selectors now identify the genuinely missing athlete input.\n\n| R3 | R4 | Count | Cases |\n|---|---|---:|---|\n'+groups.map(g=>`| ${g.from} | ${g.to} | ${g.count} | ${g.caseIds.join(', ')} |`).join('\n')+'\n\nBoth rounds have15ASK overall, but five previous ASK now receive concrete proposals, while five previous domain gaps now receive targeted input questions. Their identities and remaining dependencies are explicit in JSON. This does not imply that every question is eliminated or that every capability is complete.\n');
for(const [file,key] of [['R3_DOMAIN_GAP_ROOT_CAUSE.json','clusters'],['R3_ASK_AUTOPSY.json','cases']]){
 const doc=load('CoachingCore/r4/'+file);
 if(key==='clusters')for(const c of doc.clusters)c.r4Results=cases.filter(r=>c.caseIds.includes(r.caseId));else for(const c of doc.cases)c.r4Result=cases.find(r=>r.caseId===c.caseId);
 write(file,doc);
}
console.log(JSON.stringify(groups.map(({from,to,count})=>({from,to,count}))));
