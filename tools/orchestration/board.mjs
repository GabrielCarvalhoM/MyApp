#!/usr/bin/env node
// The agents' interface to the RepMile Product & Engineering board (GitHub Projects v2). docs/engineering/WORKFLOW.md §3.
//
//   board.mjs setup [--apply]                       create/align the project, its fields and its repository link (dry-run by default)
//   board.mjs create --title T --body-file F --type .. --area .. --front .. --priority .. --release .. [--new-scope] [--force-new]
//   board.mjs add <issue> --type .. --area .. --front .. --priority .. --release .. [--status ..] [--deps ..]
//   board.mjs set <issue> [--status ..] [--validation ..] [--priority ..] [--release ..] [--deps ..] [--start AAAA-MM-DD] [--target ..]
//   board.mjs evidence <issue> "<link or short text>" [--validation Simulador|iPhone|Dados reais]
//   board.mjs show <issue>
//   board.mjs list [--json]
//   board.mjs views [--apply]                       create the saved views (name, layout, filter, visible fields)
//
// Rules enforced here (not by convention): Status and its status:* label are always written together; an issue with
// `needs:founder-approval` cannot leave Backlog/Blocked; Verified needs Validação ≠ "Não validado" and Evidências, and closes the
// issue as completed; `create` refuses a probable duplicate unless --force-new; `--new-scope` marks the issue for founder approval.
import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { run, repoRoot, MissingDependency } from './lib/sh.mjs';
import {
  APPROVAL_LABEL, FIELDS, FLAG_FIELDS, STATUS, STATUS_LABEL, VIEWS, labelsFor, loadConfig, findProject, loadFields, listItems, graphql,
  setFieldValue, transitionError, validateValue,
} from './lib/board.mjs';
import { similarTitles } from './lib/dedupe.mjs';

let cwd, cfg;
const gh = (args) => run('gh', args, { cwd }).out;

function board({ required = true } = {}) {
  const p = findProject(cfg, cwd);
  if (!p) {
    if (!required) return null;
    throw new Error(`quadro "${cfg.title}" não encontrado para ${cfg.owner}; rode: node tools/orchestration/board.mjs setup --apply`);
  }
  return { projectId: p.id, number: p.number, url: p.url, fields: loadFields(cfg, p.number, cwd) };
}

const ISSUE_Q = `query($owner:String!,$repo:String!,$n:Int!){repository(owner:$owner,name:$repo){issue(number:$n){id number title url state
  labels(first:50){nodes{name}} projectItems(first:20){nodes{id project{id number}
  fieldValues(first:30){nodes{__typename ... on ProjectV2ItemFieldSingleSelectValue{name field{... on ProjectV2FieldCommon{name}}}
  ... on ProjectV2ItemFieldTextValue{text field{... on ProjectV2FieldCommon{name}}}
  ... on ProjectV2ItemFieldDateValue{date field{... on ProjectV2FieldCommon{name}}}}}}}}}}`;

function issue(n, b) {
  const [owner, repo] = cfg.repo.split('/');
  const i = graphql(ISSUE_Q, { owner, repo, n: Number(n) }, cwd).repository.issue;
  if (!i) throw new Error(`issue #${n} não existe em ${cfg.repo}`);
  const item = b ? i.projectItems.nodes.find((x) => x.project.id === b.projectId) : null;
  const values = {};
  for (const v of item?.fieldValues.nodes ?? []) if (v.field?.name) values[v.field.name] = v.name ?? v.text ?? v.date;
  return { ...i, labels: i.labels.nodes.map((l) => l.name), itemId: item?.id ?? null, values };
}

// Managed label families: when a family is in `wanted`, any other label of that family is stale and removed.
function syncLabels(i, wanted, { removeStatus = false } = {}) {
  const add = wanted.filter((l) => !i.labels.includes(l));
  const statusLabels = Object.values(STATUS_LABEL);
  const family = (l) => (statusLabels.includes(l) ? 'status' : l.split(':')[0]);
  const managed = new Set(wanted.map(family).filter((f) => ['priority', 'area', 'type'].includes(f)));
  if (removeStatus) managed.add('status');
  const remove = i.labels.filter((l) => managed.has(family(l)) && (family(l) !== 'status' || statusLabels.includes(l)) && !wanted.includes(l));
  if (!add.length && !remove.length) return;
  const args = ['issue', 'edit', String(i.number), '-R', cfg.repo];
  if (add.length) args.push('--add-label', add.join(','));
  if (remove.length) args.push('--remove-label', remove.join(','));
  gh(args);
}

function fieldUpdates(values) {
  const out = {};
  for (const [flag, field] of Object.entries(FLAG_FIELDS)) {
    if (values[flag] === undefined) continue;
    const err = validateValue(field, values[flag]);
    if (err) throw new Error(err);
    out[field] = values[flag];
  }
  return out;
}

function apply(b, i, updates) {
  const next = { ...i.values, ...updates };
  if (updates.Status) {
    const err = transitionError(updates.Status, { labels: i.labels, validation: next['Validação'], evidence: next['Evidências'] });
    if (err) throw new Error(`#${i.number}: ${err}`);
  }
  let itemId = i.itemId;
  if (!itemId) itemId = JSON.parse(gh(['project', 'item-add', String(b.number), '--owner', cfg.owner, '--url', i.url, '--format', 'json'])).id;
  if (!next['Validação'] && !updates['Validação']) updates['Validação'] = 'Não validado';
  if (!next.Status && !updates.Status) updates.Status = 'Backlog';
  for (const [field, value] of Object.entries(updates)) {
    const f = b.fields[field];
    if (!f) throw new Error(`o campo "${field}" não existe no quadro; rode board.mjs setup --apply`);
    setFieldValue({ projectId: b.projectId, itemId, field: f, def: { ...FIELDS[field], name: field }, value }, cwd);
  }
  const status = updates.Status ?? next.Status;
  syncLabels(i, labelsFor({ type: next.Tipo, front: next.Frente, priority: next.Prioridade, status }), { removeStatus: Boolean(updates.Status) });
  if (updates.Status === 'Verified' && i.state === 'OPEN') {
    gh(['issue', 'close', String(i.number), '-R', cfg.repo, '--reason', 'completed', '--comment',
      `Verificado (${next['Validação']}). Evidências: ${next['Evidências']}`]);
  }
  console.log(`#${i.number} ${i.title}: ${Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
}

const COMMON = { type: { type: 'string' }, area: { type: 'string' }, front: { type: 'string' }, priority: { type: 'string' },
  release: { type: 'string' }, status: { type: 'string' }, validation: { type: 'string' }, deps: { type: 'string' },
  evidence: { type: 'string' }, start: { type: 'string' }, target: { type: 'string' } };

function setup(applyChanges) {
  const say = (m) => console.log(`${applyChanges ? '' : '[dry-run] '}${m}`);
  let p = findProject(cfg, cwd);
  if (!p) {
    say(`criar o projeto "${cfg.title}" para ${cfg.owner}`);
    if (!applyChanges) { for (const [n, d] of Object.entries(FIELDS)) say(`campo ${n} (${d.type}${d.options ? `: ${d.options.join(', ')}` : ''})`); return; }
    p = JSON.parse(gh(['project', 'create', '--owner', cfg.owner, '--title', cfg.title, '--format', 'json']));
  }
  console.log(`projeto #${p.number}: ${p.url}`);
  if (applyChanges) run('gh', ['project', 'link', String(p.number), '--owner', cfg.owner, '--repo', cfg.repo], { cwd, allowFail: true });
  const fields = loadFields(cfg, p.number, cwd);
  for (const [name, def] of Object.entries(FIELDS)) {
    const have = fields[name];
    if (have && def.options) {
      const missing = def.options.filter((o) => !(o in have.options));
      const order = Object.keys(have.options);
      const aligned = !missing.length && def.options.every((o, k) => order[k] === o) && order.length === def.options.length;
      if (aligned) continue;
      say(`alinhar as opções de ${name}: ${def.options.join(', ')}`);
      if (applyChanges) {
        const opts = def.options.map((o) => `{name:${JSON.stringify(o)},color:GRAY,description:""}`).join(',');
        graphql(`mutation{updateProjectV2Field(input:{fieldId:${JSON.stringify(have.id)},singleSelectOptions:[${opts}]}){projectV2Field{... on ProjectV2SingleSelectField{id}}}}`, {}, cwd);
      }
    } else if (!have) {
      say(`criar o campo ${name} (${def.type})`);
      if (applyChanges) {
        const args = ['project', 'field-create', String(p.number), '--owner', cfg.owner, '--name', name, '--data-type', def.type];
        if (def.options) args.push('--single-select-options', def.options.join(','));
        gh(args);
      }
    }
  }
  if (cfg.number !== p.number) console.log(`registre "number": ${p.number} em tools/orchestration/board.json`);
}

function views(applyChanges) {
  const b = board();
  const existing = graphql(`query($owner:String!,$number:Int!){user(login:$owner){projectV2(number:$number){views(first:50){nodes{id name layout filter}}}}}`,
    { owner: cfg.owner, number: b.number }, cwd).user.projectV2.views.nodes;
  const ui = [];
  for (const v of VIEWS) {
    let view = existing.find((x) => x.name === v.name);
    const ids = v.fields.map((f) => b.fields[f]?.id).filter(Boolean);
    if (!view) {
      console.log(`${applyChanges ? '' : '[dry-run] '}criar a visão "${v.name}" (${v.layout}${v.filter ? `, filtro ${v.filter}` : ''})`);
      if (!applyChanges) continue;
      view = graphql(`mutation($p:ID!,$n:String!,$l:ProjectV2ViewLayout!){createProjectV2View(input:{projectId:$p,name:$n,layout:$l}){projectV2View{id name layout filter}}}`,
        { p: b.projectId, n: v.name, l: v.layout }, cwd).createProjectV2View.projectV2View;
    }
    if (applyChanges) {
      const fieldList = ids.map((id) => JSON.stringify(id)).join(',');
      graphql(`mutation($v:ID!,$f:String!){updateProjectV2View(input:{viewId:$v,filter:$f,configuration:{visibleFieldIds:[${fieldList}]}}){projectV2View{id}}}`,
        { v: view.id, f: v.filter }, cwd);
    }
    if (v.uiGroupBy) ui.push(`"${v.name}": agrupar por ${v.uiGroupBy}${v.uiDates ? `; datas = ${v.uiDates.join(' → ')}` : ''}`);
  }
  if (ui.length) { console.log('\nAjustes que a API do GitHub não permite (um clique cada, no menu da visão):'); for (const u of ui) console.log(`  - ${u}`); }
  console.log(`\nquadro: ${b.url}`);
}

function main() {
  cwd = repoRoot();
  cfg = loadConfig();
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'setup') return setup(rest.includes('--apply'));
  if (cmd === 'views') return views(rest.includes('--apply'));
  if (cmd === 'list') {
    const b = board();
    const items = listItems(cfg, b.number, cwd);
    if (rest.includes('--json')) return console.log(JSON.stringify(items, null, 2));
    for (const s of STATUS) {
      const xs = items.filter((x) => (x.values.Status ?? 'Backlog') === s);
      if (!xs.length) continue;
      console.log(`\n${s} (${xs.length})`);
      for (const x of xs) console.log(`  #${x.number ?? '—'} ${x.title} · ${x.values.Frente ?? '?'} · ${x.values.Prioridade ?? '?'} · ${x.values['Validação'] ?? ''}`);
    }
    return;
  }
  if (cmd === 'show') {
    const b = board();
    const i = issue(rest[0], b);
    return console.log(JSON.stringify({ number: i.number, title: i.title, url: i.url, state: i.state, labels: i.labels, onBoard: Boolean(i.itemId), fields: i.values }, null, 2));
  }
  if (cmd === 'add' || cmd === 'set') {
    const { values, positionals } = parseArgs({ args: rest, options: COMMON, allowPositionals: true });
    if (!positionals[0]) throw new Error(`uso: board.mjs ${cmd} <issue> --campo valor`);
    const b = board();
    const i = issue(positionals[0], b);
    if (cmd === 'set' && !i.itemId) throw new Error(`#${i.number} não está no quadro; use board.mjs add`);
    const updates = fieldUpdates(values);
    if (cmd === 'add') for (const k of ['type', 'area', 'front', 'priority', 'release']) if (!values[k] && !i.values[FLAG_FIELDS[k]]) throw new Error(`add exige --${k}`);
    return apply(b, i, updates);
  }
  if (cmd === 'evidence') {
    const { values, positionals } = parseArgs({ args: rest, options: { validation: { type: 'string' } }, allowPositionals: true });
    const [n, text] = positionals;
    if (!n || !text) throw new Error('uso: board.mjs evidence <issue> "<link ou texto curto>" [--validation …]');
    const b = board();
    const i = issue(n, b);
    gh(['issue', 'comment', String(i.number), '-R', cfg.repo, '--body', `**Evidência**${values.validation ? ` (${values.validation})` : ''}: ${text}`]);
    const joined = [i.values['Evidências'], text].filter(Boolean).join(' · ');
    const updates = { 'Evidências': joined.length > 1000 ? `${joined.slice(0, 960)} … (ver comentários da issue)` : joined };
    if (values.validation) { const e = validateValue('Validação', values.validation); if (e) throw new Error(e); updates['Validação'] = values.validation; }
    return apply(b, i, updates);
  }
  if (cmd === 'create') {
    const { values } = parseArgs({ args: rest, options: { ...COMMON, title: { type: 'string' }, 'body-file': { type: 'string' },
      'new-scope': { type: 'boolean', default: false }, 'force-new': { type: 'boolean', default: false } } });
    for (const k of ['title', 'body-file', 'type', 'area', 'front', 'priority', 'release']) if (!values[k]) throw new Error(`create exige --${k}`);
    const updates = fieldUpdates(values);
    const existing = JSON.parse(gh(['issue', 'list', '-R', cfg.repo, '--state', 'all', '--limit', '500', '--json', 'number,title,state']));
    const dupes = similarTitles(values.title, existing);
    if (dupes.length && !values['force-new']) {
      console.error('possível duplicata — atualize a existente, ou repita com --force-new se for mesmo outra tarefa:');
      for (const d of dupes) console.error(`  #${d.number} [${d.state}] ${d.title} (similaridade ${d.score.toFixed(2)})`);
      process.exitCode = 1; return;
    }
    const b = board();
    const status = values['new-scope'] ? 'Backlog' : (values.status ?? 'Backlog');
    const labels = labelsFor({ type: values.type, front: values.front, priority: values.priority, status, approval: values['new-scope'] });
    const body = readFileSync(values['body-file'], 'utf8');
    const url = gh(['issue', 'create', '-R', cfg.repo, '--title', values.title, '--body', body, ...labels.flatMap((l) => ['--label', l])]);
    const n = url.split('/').pop();
    const i = issue(n, b);
    return apply(b, i, { ...updates, Status: status });
  }
  console.error('uso: board.mjs <setup|create|add|set|evidence|show|list> … (cabeçalho do arquivo)');
  process.exitCode = 2;
}

try { main(); } catch (e) {
  if (e instanceof MissingDependency) console.error(`board: ${e.message}`);
  else if (/missing required scopes|read:project|project scope/i.test(String(e.message))) console.error('board: o token do gh não tem o escopo de Projects. Rode: gh auth refresh -h github.com -s project');
  else console.error(`board: ${e.message}`);
  process.exitCode = process.exitCode || 2;
}
export { APPROVAL_LABEL };
