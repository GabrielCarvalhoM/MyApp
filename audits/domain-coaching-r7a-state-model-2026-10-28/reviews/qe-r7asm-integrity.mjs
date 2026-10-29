// Independent integrity check of HISTORICAL-PROJECTION-FREEZE-1 (reviewer-owned, read-only).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const cc = process.argv[2];
const sha = b => createHash('sha256').update(b).digest('hex');
// own canonical(), not imported from the runtime under review
const canon = v => v === null || typeof v !== 'object' ? JSON.stringify(v)
  : Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
  : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
const h = v => sha(canon(v));
const manPath = path.join(cc, 'r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json');
const manBytes = fs.readFileSync(manPath);
const man = JSON.parse(manBytes.toString('utf8'));
const drift = [], ok = [];
for (const [p, d] of Object.entries(man.files)) {
  const got = sha(fs.readFileSync(path.join(cc, p)));
  (got === d ? ok : drift).push(got === d ? p : {p, recorded: d, got});
}
const live = [...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f),
              ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f)];
const unbound = live.filter(p => !(p in man.files));
const missing = Object.keys(man.files).filter(p => !fs.existsSync(path.join(cc, p)));
const srcMap = Object.fromEntries(live.filter(p => p.startsWith('src/')).sort().map(p => [p, sha(fs.readFileSync(path.join(cc, p)))]));
const recomputedDigest = h(srcMap);
const policy = JSON.parse(fs.readFileSync(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'), 'utf8').replace(/^\uFEFF/, ''));
const freezeFiles = fs.readdirSync(path.join(cc, 'r7/state-model')).filter(f => /^RUNTIME_FREEZE_/.test(f));
// all freeze files anywhere under r7 (other missions own theirs)
console.log(JSON.stringify({
  manifestSha256: sha(manBytes),
  revision: man.revision, frozenAt: man.frozenAt, node: man.node,
  recordedSourceDigest: man.sourceDigest, recomputedDigest, digestMatches: recomputedDigest === man.sourceDigest,
  filesBound: Object.keys(man.files).length, filesMatching: ok.length, drift, missing, unbound,
  policyRevision: policy.revision, policyHashRecomputed: h(policy), policyHashRecorded: man.policyHash,
  freezeFilesInStateModel: freezeFiles,
  delta: man.deltaFromStateEvidenceFreeze && {changed: man.deltaFromStateEvidenceFreeze.changed, added: man.deltaFromStateEvidenceFreeze.added, removed: man.deltaFromStateEvidenceFreeze.removed, prior: man.deltaFromStateEvidenceFreeze.priorFreezeSourceDigest}
}, null, 2));
