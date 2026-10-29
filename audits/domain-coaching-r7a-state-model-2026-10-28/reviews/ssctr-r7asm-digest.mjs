// SSCTR R7ASM-SSCTR-r1 digest probe (own; prints only). Byte-identical in logic to the copy I ran from my session scratchpad at the start of this
// review (output ssctr-r7asm-digest.start.out.json). Usage: node ssctr-r7asm-digest.mjs <CoachingCore dir>.
// Independent, read-only re-computation of HISTORICAL-PROJECTION-FREEZE-1 (SSCTR regression review).
// Re-implements the canonical hash rather than importing it from the frozen bytes.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const cc = process.argv[2];
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v)
  : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']'
  : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => createHash('sha256').update(canonical(v)).digest('hex');
const shaFile = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifestPath = path.join(cc, 'r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json');
const manifestSha = shaFile(manifestPath);
const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const drift = [];
for (const [p, h] of Object.entries(m.files)) { const now = shaFile(path.join(cc, p)); if (now !== h) drift.push({p, recorded: h, now}); }
const live = [...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f), ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f)];
const unfrozen = live.filter(p => !(p in m.files));
const missing = Object.keys(m.files).filter(p => !fs.existsSync(path.join(cc, p)));
const srcMap = Object.fromEntries(Object.keys(m.files).filter(p => p.startsWith('src/')).sort().map(p => [p, shaFile(path.join(cc, p))]));
const recomputedSourceDigest = hash(srcMap);
const policy = JSON.parse(fs.readFileSync(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'), 'utf8').replace(/^﻿/, ''));
const freezeFiles = fs.readdirSync(path.join(cc, 'r7/state-model')).filter(f => /^RUNTIME_FREEZE_/.test(f));
console.log(JSON.stringify({
  at: new Date().toISOString(), node: process.version,
  revision: m.revision, frozenAt: m.frozenAt,
  manifestSha256: manifestSha,
  recordedSourceDigest: m.sourceDigest, recomputedSourceDigest, sourceDigestMatches: recomputedSourceDigest === m.sourceDigest,
  policyRevision: policy.revision, policyHashRecomputed: hash(policy), policyHashRecorded: m.policyHash,
  filesBound: Object.keys(m.files).length, drift, unfrozen, missing, freezeFilesInDir: freezeFiles,
  delta: m.deltaFromStateEvidenceFreeze
}, null, 2));
