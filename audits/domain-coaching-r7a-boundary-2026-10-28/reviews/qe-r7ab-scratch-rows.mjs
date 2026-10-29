// R7AB-QE-r1 scratch: the default synthetic program's rows and recorded start authorities (read-only, prints only).
import {H,line,print,stateSummary} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const t=H.start({id:'qab-rows'},3);
const auth=a=>a?`${a.authority} RUN:${a.RUN?.provenance} STR:${a.STRENGTH?.provenance}`:null;
print({weeks:[0,1,2,3,4].map(w=>({w,start:t.p.weeks[w].startDate,auth:auth(t.p.weeks[w].startAuthority),rows:line(t.p,w),state:stateSummary(t.p.stateTrace[w])}))});
