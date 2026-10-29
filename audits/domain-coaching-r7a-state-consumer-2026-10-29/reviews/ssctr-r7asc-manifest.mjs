// SSCTR R7ASC-SSCTR-r1 outputs manifest (own): writes ssctr-r7asc-outputs.json, the SHA-256 of every file I wrote in this folder (prefix
// ssctr-r7asc-) and in ssctr-r7asc-runs/, itself excluded, with the freeze digest the review is bound to. Writes only that file.
// Usage: node ssctr-r7asc-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const HERE = import.meta.dirname, OUT = 'ssctr-r7asc-outputs.json';
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const mine = fs.readdirSync(HERE).filter(f => f.startsWith('ssctr-r7asc-') && f !== OUT && fs.statSync(path.join(HERE, f)).isFile());
const runs = fs.readdirSync(path.join(HERE, 'ssctr-r7asc-runs')).map(f => 'ssctr-r7asc-runs/' + f);
const files = [...mine, ...runs].sort().map(f => ({file: f, sha256: sha(path.join(HERE, f))}));
fs.writeFileSync(path.join(HERE, OUT), JSON.stringify({revision: 'R7ASC-SSCTR-r1', boundTo: {freeze: 'STATE-MODEL-CONSUMER-FREEZE-1', sourceDigest: 'adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5'}, writtenAt: new Date().toISOString(), files}, null, 1) + '\n');
console.log(JSON.stringify({files: files.length}));
