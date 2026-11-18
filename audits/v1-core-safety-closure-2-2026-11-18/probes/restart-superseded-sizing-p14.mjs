const J=JSON.stringify;
const t0=quality('lists').t;
const fresh={...sixteen({asOf:t0.day(8,0),start:t0.day(8,1)}),athlete:{...sixteen({asOf:t0.day(8,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
const restart=u=>{const s=JSON.parse(JSON.stringify({ledger:u.ledger,fmt:u.fmt,ev:u.ev,hist:u.hist,ref:u.ref}));return F.restartProgram({intake:fresh,record:s.ledger,referenceState:s.ref,asOf:`${t0.day(8,0)}T10:00:00-03:00`,athleteId:u.p.athleteId,runEvidenceRecord:s.ev,runFormatRecord:s.fmt,runHistoryRecord:s.hist},DEV);};
const plan=x=>(x.proposal??x.program).weeks[0].sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription?.durationMinutes).join(',');
for(const [lab,o,how] of [['lists+watch',{},'lists'],['direct lists+watch',{first:EXTRA.lists},null],['plain+watch',{},'plain'],['merged',{},null],['lists alone',{watch:null},'lists'],['direct lists alone',{watch:null,first:EXTRA.lists},null],['alone',{watch:null},null],['plain alone',{watch:null},'plain']]){
 const q=quality(how,o),g=restart(q.t);console.log(lab.padEnd(22),plan(g),'rows',q.t.ledger.filter(x=>!x.fact).length,'superseded',q.t.ledger.filter(x=>!x.fact&&x.superseded).length);
}
