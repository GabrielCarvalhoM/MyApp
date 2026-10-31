// Inserts the proposed queue array (hq-proposed.json) as one fenced json block into recheck/SSCTR_RECHECK_R7B.md, replacing the placeholder.
// Writes only that markdown file.
import fs from 'node:fs';
import path from 'node:path';

const md = path.resolve(import.meta.dirname, '..', 'SSCTR_RECHECK_R7B.md');
const hq = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'hq-proposed.json'), 'utf8'));
const text = fs.readFileSync(md, 'utf8');
if (!text.includes('<!-- HQ_JSON_BLOCK -->')) throw Error('placeholder not found (already inserted?)');
fs.writeFileSync(md, text.replace('<!-- HQ_JSON_BLOCK -->', '```json\n' + JSON.stringify(hq, null, 2) + '\n```'));
const out = fs.readFileSync(md, 'utf8'), lines = out.trimEnd().split('\n');
console.log('inserted', hq.length, 'entries; gate lines:', (out.match(/R7B_SSCTR_GATE =/g) ?? []).length, '| last line:', lines.at(-1));
