// QRE V1STR N4 recheck R3, probe D (read-only). The own test the fix removed, "SQ-4 c5 (SSCTR-STR-A-08) a change of strength days keeps the
// vertical lifts the plan was built with, and brings no exercise into a running plan" (76b8448), with every assertion evaluated and reported
// instead of stopping at the first. Which of its assertions fail on these bytes: only the rejected reading (the verticals kept), or also its
// protective half (no upper-body MAIN row new to the plan)?
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-d-removed-test.mjs
import {lifter,timeline,idsOf,mainsOf,configurationOf,FULL} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const planeOf=id=>configurationOf(id).subpattern,res={keepsVertical:{pass:0,fail:[]},noNewUpperMain:{pass:0,fail:[]},stayMainOrAccessory:{pass:0,fail:[]},status:{pass:0,fail:[]},oneToTwo:{pass:0,fail:[]}};
const check=(k,ok,msg)=>{if(ok)res[k].pass++;else res[k].fail.push(msg);};
for(const [from,to,stayMain] of [[[1,4],[0,2,4,6],false],[[0,2,4,6],[1,4],true],[[1,4],[1,3,5],true],[[1,3,5],[1,4],true],[[1,3,5],[0,2,4,6],true]]){
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,days:from})),label=`${from.length} to ${to.length} days`;t.weeks(0,1);
 const before=new Set(idsOf(t.p)),vertical=Object.values(mainsOf(t.p)).filter(id=>/^VERTICAL_/.test(planeOf(id)));
 const r=t.step(2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:to}},'06:00');check('status',r.status==='MODIFY',label+' '+r.status);
 const rows=t.p.templates.flatMap(x=>x.rows),upper=rows.filter(x=>x.entry.region==='UPPER'),ahead=new Set(idsOf({weeks:t.p.weeks.slice(3)}));
 for(const id of vertical)check('keepsVertical',ahead.has(id),`${label}: ${id} left the plan`);
 for(const x of upper.filter(x=>x.role==='MAIN'))check('noNewUpperMain',before.has(x.entry.id),`${label}: ${x.entry.id} is new to the plan`);
 if(stayMain)for(const id of vertical)check('stayMainOrAccessory',upper.some(x=>x.role==='MAIN'&&x.entry.id===id),`${label}: ${id} is no longer a MAIN row`);
 else for(const id of vertical)check('stayMainOrAccessory',JSON.stringify([...new Set(upper.filter(x=>x.entry.id===id).map(x=>x.role))])==='["ACCESSORY"]',`${label}: ${id} roles ${JSON.stringify([...new Set(upper.filter(x=>x.entry.id===id).map(x=>x.role))])}`);
}
{const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,days:[3]}));t.weeks(0,1);const before=new Set(idsOf(t.p));
 check('oneToTwo',t.step(2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:[1,4]}},'06:00').status==='MODIFY','status');
 const upper=Object.values(mainsOf(t.p)).filter(id=>configurationOf(id).region==='UPPER');check('oneToTwo',upper.length===4,'upper '+upper.length);
 check('oneToTwo',upper.every(id=>before.has(id)&&!/^VERTICAL_/.test(planeOf(id))),JSON.stringify(upper));}
console.log(JSON.stringify(res,null,1));
