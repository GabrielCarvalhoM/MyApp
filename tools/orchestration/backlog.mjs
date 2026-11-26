#!/usr/bin/env node
// Seeds labels, the initial V1 backlog issues and their board items from backlog/V1_INITIAL_BACKLOG.md. Dry-run by default.
//
//   node tools/orchestration/backlog.mjs [--apply] [--file <backlog.md>] [--no-board]
//
// Idempotent: every issue carries `<!-- backlog-key: KEY -->`; an existing key is never recreated (its board item is
// added/filled if missing). Labels: existing equivalents are renamed (labels.json "rename"), never duplicated.
import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { run, repoRoot, MissingDependency } from './lib/sh.mjs';
import { labelsFor, loadConfig, findProject, loadFields, listItems, setFieldValue, FIELDS, FLAG_FIELDS, validateValue } from './lib/board.mjs';
import { parseBacklog, renderBody } from './lib/backlog-parse.mjs';

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false }, file: { type: 'string' }, 'no-board': { type: 'boolean', default: false } } });
const APPLY = values.apply;
const cwd = repoRoot();
const cfg = loadConfig();
const gh = (args) => run('gh', args, { cwd }).out;
const say = (m) => console.log(`${APPLY ? '' : '[dry-run] '}${m}`);

function ensureLabels() {
  const spec = JSON.parse(readFileSync(fileURLToPath(new URL('./labels.json', import.meta.url)), 'utf8'));
  const have = new Set(JSON.parse(gh(['label', 'list', '-R', cfg.repo, '--limit', '200', '--json', 'name'])).map((l) => l.name));
  for (const [from, to] of Object.entries(spec.rename)) {
    if (have.has(from) && !have.has(to)) {
      say(`renomear rótulo existente "${from}" → "${to}" (equivalente, sem duplicar)`);
      if (APPLY) gh(['label', 'edit', from, '-R', cfg.repo, '--name', to]);
      have.delete(from); have.add(to);
    }
  }
  for (const l of spec.labels) {
    if (have.has(l.name)) continue;
    say(`criar rótulo ${l.name}`);
    if (APPLY) gh(['label', 'create', l.name, '-R', cfg.repo, '--color', l.color, '--description', l.description]);
  }
}

function main() {
  const file = values.file ?? fileURLToPath(new URL('./backlog/V1_INITIAL_BACKLOG.md', import.meta.url));
  const items = parseBacklog(readFileSync(file, 'utf8'));
  for (const it of items) for (const [k, v] of Object.entries(it.fields)) {
    const field = FLAG_FIELDS[k];
    if (!field && k !== 'approval') throw new Error(`${it.key}: campo desconhecido "${k}"`);
    if (field) { const e = validateValue(field, v); if (e) throw new Error(`${it.key}: ${e}`); }
  }
  console.log(`backlog: ${items.length} itens em ${file}`);
  ensureLabels();

  const existing = JSON.parse(gh(['issue', 'list', '-R', cfg.repo, '--state', 'all', '--limit', '500', '--json', 'number,body,url,title']));
  const byKey = new Map();
  for (const i of existing) { const m = i.body?.match(/<!-- backlog-key: ([\w-]+) -->/); if (m) byKey.set(m[1], i); }

  for (const it of items) {
    if (byKey.has(it.key)) { console.log(`= ${it.key} já existe: #${byKey.get(it.key).number}`); continue; }
    const missing = it.deps.filter((d) => !byKey.has(d));
    if (missing.length && APPLY) throw new Error(`${it.key}: dependências ainda sem issue (${missing.join(', ')}); ordene o arquivo`);
    const body = renderBody(it, (k) => (byKey.has(k) ? `#${byKey.get(k).number}` : `{{${k}}}`));
    const labels = labelsFor({ type: it.fields.type, front: it.fields.front, priority: it.fields.priority, status: it.fields.status, approval: it.fields.approval === 'founder' });
    say(`criar ${it.key}: ${it.title} [${labels.join(', ')}]${it.deps.length ? ` deps ${it.deps.join(',')}` : ''}`);
    if (APPLY) {
      const url = gh(['issue', 'create', '-R', cfg.repo, '--title', it.title, '--body', body, ...labels.flatMap((l) => ['--label', l])]);
      byKey.set(it.key, { number: Number(url.split('/').pop()), url, title: it.title });
      console.log(`  → ${url}`);
    } else byKey.set(it.key, { number: `?${it.key}`, url: null });
  }

  if (values['no-board']) return;
  const p = findProject(cfg, cwd);
  if (!p) { console.log(`backlog: quadro "${cfg.title}" ainda não existe; rode board.mjs setup --apply e repita (idempotente)`); return; }
  const fields = loadFields(cfg, p.number, cwd);
  const onBoard = new Map(listItems(cfg, p.number, cwd).filter((x) => x.number).map((x) => [x.number, x]));
  for (const it of items) {
    const iss = byKey.get(it.key);
    if (!iss?.url) continue;
    let item = onBoard.get(iss.number);
    const wanted = { ...Object.fromEntries(Object.entries(it.fields).filter(([k]) => FLAG_FIELDS[k]).map(([k, v]) => [FLAG_FIELDS[k], v])), 'Validação': 'Não validado' };
    if (it.deps.length) wanted['Dependências'] = it.deps.map((d) => (byKey.has(d) ? `#${byKey.get(d).number}` : d)).join(', ');
    const todo = Object.entries(wanted).filter(([f]) => !item?.values[f]);
    if (!todo.length) continue;
    say(`quadro: #${iss.number} ${it.key} ← ${todo.map(([f, v]) => `${f}=${v}`).join(' · ')}`);
    if (!APPLY) continue;
    if (!item) item = { itemId: JSON.parse(gh(['project', 'item-add', String(p.number), '--owner', cfg.owner, '--url', iss.url, '--format', 'json'])).id, values: {} };
    for (const [f, v] of todo) setFieldValue({ projectId: p.id, itemId: item.itemId, field: fields[f], def: { ...FIELDS[f], name: f }, value: v }, cwd);
  }
}

try { main(); } catch (e) {
  console.error(`backlog: ${e instanceof MissingDependency ? e.message : e.message}`);
  if (/read:project|missing required scopes/i.test(e.message)) console.error('backlog: rode `gh auth refresh -h github.com -s project` ou use --no-board');
  process.exitCode = 2;
}
