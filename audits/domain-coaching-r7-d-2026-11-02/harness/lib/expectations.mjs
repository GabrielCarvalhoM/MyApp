// The author's expectations (expectedDomainProperties), evaluated on the base run. Machine-checkable asserts give PASS / FAIL / NOT_EVALUABLE;
// JUDGED asserts go to the domain judge. A FAIL here is an author oracle, never an automatic block: the judge triages it.
import {live} from './client.mjs';

const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',RECON='REQUIRES_RECONCILIATION';
const OPS={'<=':(a,b)=>a<=b,'<':(a,b)=>a<b,'>=':(a,b)=>a>=b,'==':(a,b)=>a===b};
const maxMinutes=(plan,week,sport,role)=>{const w=plan?.weeks?.[week];if(!w)return null;const xs=w.sessions.filter(s=>live(s)&&s.sport===sport&&s.role===role&&Number.isFinite(s.prescription?.durationMinutes)).map(s=>s.prescription.durationMinutes);return xs.length?Math.max(...xs):null;};

export function evaluateExpectations(kase,trace){
 const out=[];
 for(const e of kase.expectedDomainProperties??[]){
  const a=e.assert??{},row={expectationId:e.expectationId,atStep:e.atStep,oracleClass:e.oracleClass,type:a.type,rationale:e.rationale??null};
  if(a.type==='JUDGED'){out.push({...row,result:'JUDGED',statement:a.statement});continue;}
  const gen=e.atStep==='GENERATE',step=gen?null:trace.steps.find(s=>s.stepId===e.atStep);
  if(!gen&&!(kase.timeline??[]).some(s=>s.stepId===e.atStep)){out.push({...row,result:'CORPUS_ERROR',reason:'NO_SUCH_STEP'});continue;}
  if(!gen&&!step){out.push({...row,result:'NOT_EVALUABLE',reason:'STEP_NOT_EXECUTED ('+(trace.stopped??'stopped')+')'});continue;}
  const status=gen?trace.generation?.status:step.result.status,validity=gen?null:step.result.planValidity?.status,plan=gen?trace.generation?.program:step.planAfter;
  let ok,observed;
  switch(a.type){
   case 'STATUS_IN':observed=status;ok=(a.oneOf??[]).includes(status);break;
   case 'VALIDITY_IS':if(gen){out.push({...row,result:'CORPUS_ERROR',reason:'VALIDITY_AT_GENERATE'});continue;}observed=validity;ok=validity===a.value;break;
   case 'QUESTION_KIND_IS':if(gen){observed=trace.generation?.question?.kind??null;ok=observed===(a.value??null);break;}observed=step.result.question?.kind??null;ok=observed===(a.value??null);break;
   case 'NO_PRESCRIPTION':observed=gen?status:validity;ok=gen?status!=='PROPOSED':validity===RECON;break;
   case 'ROLE_ABSENT':case 'ROLE_PRESENT':{
    if(!plan){observed='NO_PLAN';ok=a.type==='ROLE_ABSENT';break;}
    const found=(a.weeks??[]).flatMap(k=>plan.weeks[k]?.sessions??[]).filter(s=>live(s)&&s.sport===a.sport&&(a.roles??[]).includes(s.role));
    observed=found.map(s=>`${s.weekIndex}:${s.day}:${s.role}`);ok=a.type==='ROLE_ABSENT'?found.length===0:found.length>0;break;}
   case 'PHASE_IS':observed=plan?.weeks?.[a.week]?.phase??null;ok=observed!==null&&(a.oneOf??[]).includes(observed);if(observed===null){out.push({...row,result:'NOT_EVALUABLE',reason:'NO_SUCH_WEEK_OR_PLAN'});continue;}break;
   case 'ROLE_MINUTES_COMPARE':{
    const x=maxMinutes(plan,a.week,a.sport??'RUN',a.role),y=maxMinutes(plan,a.otherWeek,a.sport??'RUN',a.role);
    observed={week:x,otherWeek:y};
    if(x===null||y===null||!OPS[a.op]){out.push({...row,result:'NOT_EVALUABLE',reason:'ROLE_NOT_IN_BOTH_WEEKS',observed});continue;}
    ok=OPS[a.op](x,y);break;}
   default:out.push({...row,result:'CORPUS_ERROR',reason:'UNKNOWN_ASSERT_TYPE'});continue;
  }
  out.push({...row,result:ok?'PASS':'FAIL',observed,expected:a});
 }
 return out;
}
export {VALID,RECON};
