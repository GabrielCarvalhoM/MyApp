// The PF-0 §3 verdict of a device run, from its P0RESULT lines (RUN.md §2): the in-test budgets of `performance`, plus the COLD load and first
// plan budgets judged on the ColdStartTests samples (one fresh process each; QRE-P0-07). Budgets are read, never adjusted.
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/device-budgets.mjs <p0-results.txt>
import fs from 'node:fs';
const lines = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter(l => l.startsWith('P0RESULT '));
const of = name => lines.filter(l => l.startsWith(`P0RESULT ${name} `)).map(l => JSON.parse(l.slice(`P0RESULT ${name} `.length)));
const q = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
const perf = of('performance'), cold = of('cold-start');
if (perf.length !== 1) { console.error(`expected one performance result, found ${perf.length}`); process.exit(2); }
const p = perf[0], rows = [...p.budgets.map(b => ({ metric: b.metric, measured: b.measured, budget: b.budgetMs ?? b.budgetMB, pass: b.pass }))];
if (cold.length < 10) rows.push({ metric: `cold samples: ${cold.length} of the 10 required`, measured: cold.length, budget: 10, pass: false });
else {
  const load = q(cold.map(c => c.load.totalMs), 0.95), gen = q(cold.map(c => c.firstGenerateMs), 0.95);
  rows.push({ metric: `COLD context + bundle load p95, n=${cold.length} (PF-0 <= 1.0 s)`, measured: load, budget: 1000, pass: load <= 1000 });
  rows.push({ metric: `COLD first plan p95, n=${cold.length} (PF-0 <= 2.0 s)`, measured: gen, budget: 2000, pass: gen <= 2000 });
}
const devices = new Set([p, ...cold].map(x => `${x.device.machine} ${x.device.system} ${x.device.configuration}${x.device.isSimulator ? ' SIMULATOR' : ''}${x.device.debuggerAttached === false ? '' : x.device.debuggerAttached === true ? ' DEBUGGER' : ' DEBUGGER-UNKNOWN'}${x.device.lowPowerMode ? ' LOW-POWER' : ''}`));
const valid = devices.size === 1 && ![...devices][0].match(/SIMULATOR|DEBUGGER|LOW-POWER|Debug/); // DEBUGGER also matches DEBUGGER-UNKNOWN
for (const r of rows) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${String(Math.round(r.measured * 10) / 10).padStart(8)} / ${r.budget}  ${r.metric}`);
console.log(`environment: ${[...devices].join(' | ')}${valid ? '' : '  -> NOT A VALID MEASUREMENT (one device, Release, no simulator, no debugger, no Low Power Mode required)'}`);
process.exit(valid && rows.every(r => r.pass) ? 0 : 1);
