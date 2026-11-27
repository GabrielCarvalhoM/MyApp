// RepMile Product & Engineering board (GitHub Projects v2): schema, label mirror and API helpers.
// The board's Status field is the source of truth for delivery state; the status:* labels are a mirror written by the same
// command (board.mjs), so `gh issue list` and the board never disagree.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { run } from './sh.mjs';

export const CONFIG_PATH = fileURLToPath(new URL('../board.json', import.meta.url));
export const loadConfig = () => JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));

// "Founder Decision" (fundador, 27/11): espera por decisão humana de produto, distinta de Blocked (impedimento técnico/operacional).
export const FOUNDER_DECISION = 'Founder Decision';
export const STATUS = ['Backlog', FOUNDER_DECISION, 'Ready', 'In Progress', 'Blocked', 'In Review', 'Ready to Integrate', 'Integrated', 'Verified'];
export const VALIDATED = ['Simulador', 'iPhone', 'Dados reais'];

// Field name → definition. Single-select options are in board order.
export const FIELDS = {
  Status: { type: 'SINGLE_SELECT', builtin: true, options: STATUS, colors: { [FOUNDER_DECISION]: 'PURPLE' },
    descriptions: { [FOUNDER_DECISION]: 'Aguardando decisão do fundador; responda comentando a issue (APROVADO / AJUSTAR / REJEITADO / DÚVIDA)' } },
  Tipo: { type: 'SINGLE_SELECT', options: ['Feature', 'Bug Fix', 'Refactor', 'Optimization', 'Test', 'Design', 'Infrastructure', 'Research'] },
  'Área': { type: 'SINGLE_SELECT', options: ['iOS Frontend', 'Backend', 'CoachingCore', 'HealthKit', 'RunRecorder', 'Strength', 'UX/UI', 'DevOps'] },
  Prioridade: { type: 'SINGLE_SELECT', options: ['P0', 'P1', 'P2', 'P3'] },
  Frente: { type: 'SINGLE_SELECT', options: ['A', 'B', 'C', 'Design', 'Integration'] },
  Release: { type: 'SINGLE_SELECT', options: ['V1', 'V1.1', 'V2'] },
  // "Código implementado" ≠ "funcionalidade validada": this field says where the behaviour was actually observed.
  'Validação': { type: 'SINGLE_SELECT', options: ['Não validado', ...VALIDATED] },
  // Fidelidade ao Figma aprovado (fundador, 27/11): independente de Status e Validação. Integrado ≠ verificado no Figma.
  Figma: { type: 'SINGLE_SELECT', options: ['Não se aplica', 'NOT_VERIFIED', 'MATCH', 'MISMATCH', 'APPROVED_DEVIATION'] },
  // Aprovação do produto pelo fundador (PRODUCT_APPROVED): só o fundador marca; revisão de agente não conta.
  Produto: { type: 'SINGLE_SELECT', options: ['Não aprovado', 'Aprovado pelo fundador'] },
  'Dependências': { type: 'TEXT' },
  'Evidências': { type: 'TEXT' },
  'Início': { type: 'DATE' },
  'Entrega alvo': { type: 'DATE' },
};

// CLI flag → field name.
export const FLAG_FIELDS = { status: 'Status', type: 'Tipo', area: 'Área', priority: 'Prioridade', front: 'Frente', release: 'Release',
  validation: 'Validação', figma: 'Figma', product: 'Produto', deps: 'Dependências', evidence: 'Evidências', start: 'Início', target: 'Entrega alvo' };

export const STATUS_LABEL = { [FOUNDER_DECISION]: 'status:founder-decision', Ready: 'status:ready', 'In Progress': 'status:in-progress', Blocked: 'status:blocked',
  'Ready to Integrate': 'status:ready-to-integrate', Integrated: 'status:integrated' };
export const APPROVAL_LABEL = 'needs:founder-approval';

const FRONT_AREA = { A: 'area:coachinghost', B: 'area:healthkit', C: 'area:swiftui', Design: 'area:design', Integration: 'area:integration' };

// Labels implied by the board fields (the label taxonomy is the coarse GitHub-side mirror).
export function labelsFor({ type, front, priority, status, approval } = {}) {
  const l = new Set();
  if (front) l.add(FRONT_AREA[front]);
  if (type === 'Bug Fix') l.add('type:bug');
  else if (front === 'Integration' && ['Feature', 'Test', 'Infrastructure'].includes(type)) l.add('type:integration');
  else if (type === 'Feature' || type === 'Design') l.add('type:feature');
  else if (type) l.add('type:tech-debt');
  if (priority) l.add(`priority:${priority.toLowerCase()}`);
  if (status && STATUS_LABEL[status]) l.add(STATUS_LABEL[status]);
  if (approval) l.add(APPROVAL_LABEL);
  return [...l].filter(Boolean);
}

// Transition rules (WORKFLOW.md §3). Returns an error string or null.
export function transitionError(to, { labels = [], validation, evidence, figma } = {}) {
  if (!STATUS.includes(to)) return `status desconhecido: ${to} (válidos: ${STATUS.join(', ')})`;
  if (labels.includes(APPROVAL_LABEL) && !['Backlog', 'Blocked', FOUNDER_DECISION].includes(to)) {
    return `a issue aguarda aprovação do fundador (${APPROVAL_LABEL}); só o fundador remove o rótulo`;
  }
  // Integrated = on the integration branch, not yet validated where it matters; it still needs the evidence of what was proven
  // (CI run, simulator manifest). Record it first: `board.mjs evidence <n> "<link>"`, then the status.
  if (to === 'Integrated' && !evidence?.trim()) return 'Integrated exige Evidências (PR integrado, CI, manifest do simulador): rode `board.mjs evidence` antes';
  if (to === 'Verified') {
    if (!VALIDATED.includes(validation)) return `Verified exige Validação em ${VALIDATED.join(' / ')} (implementado ≠ validado)`;
    if (!evidence?.trim()) return 'Verified exige Evidências (link do run, manifest.json, screenshot)';
    // Tela ou fluxo visual: só fecha com a fidelidade ao Figma comprovada (MATCH) ou um desvio aprovado pelo fundador.
    if (figma && !['Não se aplica', 'MATCH', 'APPROVED_DEVIATION'].includes(figma)) return `Verified exige Figma = MATCH ou APPROVED_DEVIATION (hoje: ${figma})`;
  }
  return null;
}

export function validateValue(field, value) {
  const def = FIELDS[field];
  if (!def) return `campo desconhecido: ${field}`;
  if (def.type === 'SINGLE_SELECT' && !def.options.includes(value)) return `${field}: "${value}" inválido (opções: ${def.options.join(', ')})`;
  if (def.type === 'DATE' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${field}: data no formato AAAA-MM-DD`;
  if (def.type === 'TEXT' && value.length > 1000) return `${field}: texto acima de 1000 caracteres; use um link`;
  return null;
}

// ---- GitHub API ------------------------------------------------------------------------------------------------
export function graphql(query, vars = {}, cwd) {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [k, v] of Object.entries(vars)) args.push(typeof v === 'number' ? '-F' : '-f', `${k}=${v}`);
  const r = JSON.parse(run('gh', args, { cwd }).out);
  if (r.errors) throw new Error(r.errors.map((e) => e.message).join('; '));
  return r.data;
}

export function findProject(cfg, cwd) {
  const list = JSON.parse(run('gh', ['project', 'list', '--owner', cfg.owner, '--format', 'json', '--limit', '100'], { cwd }).out);
  return list.projects.find((p) => (cfg.number ? p.number === cfg.number : p.title === cfg.title)) ?? null;
}

export function loadFields(cfg, number, cwd) {
  const r = JSON.parse(run('gh', ['project', 'field-list', String(number), '--owner', cfg.owner, '--format', 'json', '--limit', '100'], { cwd }).out);
  const fields = {};
  for (const f of r.fields) fields[f.name] = { id: f.id, type: f.type, options: Object.fromEntries((f.options ?? []).map((o) => [o.name, o.id])) };
  return fields;
}

const ITEMS_QUERY = `query($owner:String!,$number:Int!,$after:String){user(login:$owner){projectV2(number:$number){id items(first:100,after:$after){
  pageInfo{hasNextPage endCursor} nodes{id content{__typename ... on Issue{number title url state labels(first:30){nodes{name}}}
  ... on PullRequest{number title url state} ... on DraftIssue{title}}
  fieldValues(first:30){nodes{__typename
    ... on ProjectV2ItemFieldSingleSelectValue{name field{... on ProjectV2FieldCommon{name}}}
    ... on ProjectV2ItemFieldTextValue{text field{... on ProjectV2FieldCommon{name}}}
    ... on ProjectV2ItemFieldDateValue{date field{... on ProjectV2FieldCommon{name}}}}}}}}}}`;

export function listItems(cfg, number, cwd) {
  const items = [];
  let after = null;
  do {
    const vars = { owner: cfg.owner, number };
    if (after) vars.after = after;
    const p = graphql(ITEMS_QUERY, vars, cwd).user.projectV2;
    for (const n of p.items.nodes) {
      const values = {};
      for (const v of n.fieldValues.nodes) if (v.field?.name) values[v.field.name] = v.name ?? v.text ?? v.date;
      items.push({ itemId: n.id, kind: n.content?.__typename, number: n.content?.number ?? null, title: n.content?.title,
        url: n.content?.url, state: n.content?.state, labels: n.content?.labels?.nodes.map((l) => l.name) ?? [], values });
    }
    after = p.items.pageInfo.hasNextPage ? p.items.pageInfo.endCursor : null;
  } while (after);
  return items;
}

export function setFieldValue({ projectId, itemId, field, def, value }, cwd) {
  const args = ['project', 'item-edit', '--id', itemId, '--project-id', projectId, '--field-id', field.id];
  if (def.type === 'SINGLE_SELECT') {
    const opt = field.options[value];
    if (!opt) throw new Error(`a opção "${value}" não existe no quadro para ${def.name ?? 'o campo'}; rode board.mjs setup --apply`);
    args.push('--single-select-option-id', opt);
  } else if (def.type === 'DATE') args.push('--date', value);
  else args.push('--text', value);
  run('gh', args, { cwd });
}

// Saved views. The API sets name, layout, filter and visible fields; grouping, sorting and the roadmap's date fields are UI-only
// (ProjectV2View.groupByFields is read-only), so `uiGroupBy` / `uiDates` are printed as the remaining one-click steps.
const COMMON_FIELDS = ['Title', 'Status', 'Tipo', 'Área', 'Frente', 'Prioridade', 'Release', 'Validação', 'Figma', 'Produto', 'Dependências', 'Evidências'];
export const VIEWS = [
  { name: 'Visão Geral', layout: 'BOARD_LAYOUT', filter: '', fields: COMMON_FIELDS },
  { name: 'Por Área', layout: 'TABLE_LAYOUT', filter: '', fields: COMMON_FIELDS, uiGroupBy: 'Área' },
  { name: 'Por Tipo', layout: 'TABLE_LAYOUT', filter: '', fields: COMMON_FIELDS, uiGroupBy: 'Tipo' },
  { name: 'Por Frente', layout: 'TABLE_LAYOUT', filter: '', fields: COMMON_FIELDS, uiGroupBy: 'Frente' },
  { name: 'Bugs & Fixes', layout: 'TABLE_LAYOUT', filter: 'tipo:"Bug Fix"', fields: COMMON_FIELDS, uiGroupBy: 'Status' },
  { name: 'Roadmap', layout: 'ROADMAP_LAYOUT', filter: '-status:Verified', fields: ['Title', 'Status', 'Release', 'Frente', 'Início', 'Entrega alvo'], uiGroupBy: 'Release', uiDates: ['Início', 'Entrega alvo'] },
  { name: 'Bloqueios', layout: 'TABLE_LAYOUT', filter: 'status:Blocked', fields: COMMON_FIELDS, uiGroupBy: 'Frente' },
  { name: 'Founder Decision', layout: 'TABLE_LAYOUT', filter: 'status:"Founder Decision"', fields: COMMON_FIELDS },
];
