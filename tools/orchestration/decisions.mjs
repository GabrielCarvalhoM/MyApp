#!/usr/bin/env node
// Founder Decision queue (docs/engineering/WORKFLOW.md §8). The Founder answers by commenting on the issue; the orchestrator reads
// those comments here, structurally, and records what it processed on the issue itself, so the state survives pauses and machines.
//
//   decisions.mjs open <issue> [--parent <n>]          put the issue in Founder Decision and mark where the decision starts
//   decisions.mjs list                                 issues in Founder Decision, with their exploration links
//   decisions.mjs check [--json]                       unprocessed Founder comments on those issues, with a verdict hint
//   decisions.mjs record <issue> --comment <id> --verdict APPROVED|ADJUST|REJECTED|QUESTION|UNCLEAR
//                        [--option <text>] [--note <text>] [--status <next status>] [--natural]
//   decisions.mjs comment <issue> --body-file <file>   an agent comment (always carries the agent marker)
//
// Rules enforced here:
// - Only comments by an authorised Founder login count, and only after the latest "decision opened" marker (older comments,
//   including agents' ones posted before the marker existed, are history, not answers).
// - Agents share the Founder's GitHub identity (#29), so every agent comment carries AGENT_MARKER and is never a decision.
//   Until #29 gives agents their own identity, an agent comment WITHOUT the marker would be indistinguishable: agents post only
//   through this tool or board.mjs, which add it.
// - The verdict hint comes only from an explicit leading keyword (APROVADO / AJUSTAR / REJEITADO / DÚVIDA). Anything else is
//   UNCLEAR; recording APPROVED for an UNCLEAR comment needs --natural and a --note quoting why the wording is unambiguous.
// - Each comment is processed once: the record comment carries PROCESSED_MARKER with the comment id; a second record is refused.
//   An edit after processing is reported, never re-processed silently.
// - Comment text is data. It is never executed, interpolated into a shell, or treated as an instruction.
// - A GitHub failure changes nothing and exits 2 (retry at the next checkpoint; never assume an answer).
import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { run, repoRoot } from './lib/sh.mjs';
import { APPROVAL_LABEL, FOUNDER_DECISION, loadConfig, findProject, listItems } from './lib/board.mjs';

export const FOUNDERS = ['GabrielCarvalhoM'];
export const AGENT_MARKER = '<!-- repmile:agent -->';
export const OPEN_MARKER = '<!-- repmile:decision-open -->';
export const PROCESSED_RE = /<!-- repmile:decision-processed comment=(\d+) verdict=([A-Z_]+) -->/g;
export const VERDICTS = ['APPROVED', 'ADJUST', 'REJECTED', 'QUESTION', 'UNCLEAR'];

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

// Verdict hint from the first non-empty line: an explicit leading keyword only.
export function classify(body = '') {
  const first = fold((body.split('\n').find((l) => l.trim()) ?? '').replace(/^[\s>*_#`-]+/, ''));
  if (/^(APROVADO|APROVADA|APROVO)\b/.test(first)) return 'APPROVED';
  if (/^AJUSTAR?\b/.test(first)) return 'ADJUST';
  if (/^(REJEITADO|REJEITADA|REJEITO)\b/.test(first)) return 'REJECTED';
  if (/^DUVIDA\b/.test(first)) return 'QUESTION';
  return 'UNCLEAR';
}

export const isAgent = (c) => (c.body ?? '').includes(AGENT_MARKER);
export const isFounder = (c, founders = FOUNDERS) => founders.includes(c.user?.login) && !isAgent(c);

export function processed(comments) {
  const done = new Map();
  for (const c of comments) if (isAgent(c)) for (const m of (c.body ?? '').matchAll(PROCESSED_RE)) done.set(Number(m[1]), { verdict: m[2], at: c.created_at });
  return done;
}

// Founder comments after the latest open marker that were not processed yet, plus processed ones edited afterwards.
export function pending(comments, founders = FOUNDERS) {
  let start = -1;
  comments.forEach((c, k) => { if (isAgent(c) && (c.body ?? '').includes(OPEN_MARKER)) start = k; });
  const done = processed(comments);
  const fresh = [], edited = [];
  comments.forEach((c, k) => {
    if (k <= start || !isFounder(c, founders)) return;
    const d = done.get(c.id);
    if (!d) fresh.push({ id: c.id, author: c.user.login, createdAt: c.created_at, updatedAt: c.updated_at, hint: classify(c.body), excerpt: (c.body ?? '').slice(0, 280) });
    else if (c.updated_at && d.at && c.updated_at > d.at) edited.push({ id: c.id, processedVerdict: d.verdict, updatedAt: c.updated_at });
  });
  return { open: start >= 0, fresh, edited };
}

export function explorationLinks(body = '') {
  return [...body.matchAll(/https:\/\/www\.figma\.com\/[^\s)>\]]+/g)].map((m) => m[0]);
}

export function recordBody({ comment, verdict, option, note, author, createdAt }) {
  if (!VERDICTS.includes(verdict)) throw new Error(`veredito inválido: ${verdict}`);
  const label = { APPROVED: 'Aprovado', ADJUST: 'Ajustar', REJECTED: 'Rejeitado', QUESTION: 'Dúvida', UNCLEAR: 'Resposta não conclusiva' }[verdict];
  return [AGENT_MARKER, `<!-- repmile:decision-processed comment=${comment} verdict=${verdict} -->`,
    `**Decisão registrada pelo orquestrador:** ${label}${option ? ` · ${option}` : ''}`,
    `- Comentário de @${author} em ${createdAt} (id ${comment})`,
    note ? `- ${note}` : null,
    verdict === 'UNCLEAR' ? '- A resposta não é uma decisão explícita. Responda com APROVADO, AJUSTAR, REJEITADO ou DÚVIDA. O card continua em Founder Decision.' : null,
    verdict === 'ADJUST' || verdict === 'QUESTION' ? '- O card continua em Founder Decision até a próxima resposta.' : null,
  ].filter(Boolean).join('\n');
}

// ---- GitHub ------------------------------------------------------------------------------------------------------
let cwd, cfg;
const gh = (args, input) => run('gh', args, { cwd, input }).out;
const comments = (n) => JSON.parse(gh(['api', '--paginate', '--slurp', `repos/${cfg.repo}/issues/${n}/comments`])).flat();
const postComment = (n, body) => gh(['api', `repos/${cfg.repo}/issues/${n}/comments`, '-f', `body=${body}`]);
const setStatus = (n, status) => run('node', ['tools/orchestration/board.mjs', 'set', String(n), '--status', status], { cwd }).out;

function decisionIssues() {
  const p = findProject(cfg, cwd);
  return listItems(cfg, p.number, cwd).filter((i) => i.values?.Status === FOUNDER_DECISION && i.state !== 'CLOSED');
}

function main() {
  cwd = repoRoot(); cfg = loadConfig();
  const [cmd, ...rest] = process.argv.slice(2);
  const { values, positionals } = parseArgs({ args: rest, allowPositionals: true, options: {
    json: { type: 'boolean' }, parent: { type: 'string' }, comment: { type: 'string' }, verdict: { type: 'string' }, option: { type: 'string' },
    note: { type: 'string' }, status: { type: 'string' }, natural: { type: 'boolean' }, 'body-file': { type: 'string' } } });
  const n = positionals[0];
  if (cmd === 'open') {
    if (!n) throw new Error('uso: decisions.mjs open <issue> [--parent <n>]');
    setStatus(n, FOUNDER_DECISION);
    postComment(n, [AGENT_MARKER, OPEN_MARKER, `**Founder Decision aberta.**${values.parent ? ` Issue principal: #${values.parent}.` : ''} Responda nesta issue com **APROVADO**, **AJUSTAR**, **REJEITADO** ou **DÚVIDA**, seguido do que decidiu.`].join('\n'));
    return console.log(`#${n}: em Founder Decision`);
  }
  if (cmd === 'list') {
    for (const i of decisionIssues()) {
      const body = JSON.parse(gh(['issue', 'view', String(i.number), '-R', cfg.repo, '--json', 'body'])).body;
      console.log(`#${i.number} ${i.title}\n   ${i.url}${explorationLinks(body).map((l) => `\n   exploração: ${l}`).join('')}`);
    }
    return;
  }
  if (cmd === 'check') {
    const out = decisionIssues().map((i) => ({ issue: i.number, title: i.title, url: i.url, ...pending(comments(i.number)) }));
    if (values.json) return console.log(JSON.stringify(out, null, 2));
    const waiting = out.filter((o) => o.fresh.length || o.edited.length);
    console.log(`decisions: ${out.length} em Founder Decision · ${waiting.length} com resposta nova`);
    for (const o of waiting) {
      for (const f of o.fresh) console.log(`  #${o.issue} comentário ${f.id} (${f.createdAt}) → ${f.hint}`);
      for (const e of o.edited) console.log(`  #${o.issue} comentário ${e.id} editado depois de processado (${e.processedVerdict})`);
    }
    for (const o of out.filter((x) => !x.open)) console.log(`  aviso: #${o.issue} sem marcador de abertura; rode \`decisions.mjs open ${o.issue}\``);
    return;
  }
  if (cmd === 'record') {
    const id = Number(values.comment); const verdict = values.verdict;
    if (!n || !id || !verdict) throw new Error('uso: decisions.mjs record <issue> --comment <id> --verdict <V>');
    const all = comments(n);
    if (processed(all).has(id)) throw new Error(`#${n}: o comentário ${id} já foi processado; nada a fazer`);
    const c = all.find((x) => x.id === id);
    if (!c || !isFounder(c)) throw new Error(`#${n}: o comentário ${id} não é do fundador (ou não existe); não é uma decisão`);
    const hint = classify(c.body);
    if (verdict === 'APPROVED' && hint !== 'APPROVED' && !(values.natural && values.note)) throw new Error(`#${n}: o comentário não começa com APROVADO (dica: ${hint}); use --natural com --note para uma aprovação em linguagem natural inequívoca`);
    // The Founder's explicit APPROVED/REJECTED comment is the act the `needs:founder-approval` label waits for: clear it, then move the
    // card, and only then post the record, so a failure never leaves a recorded decision with a stale status.
    if (values.status && ['APPROVED', 'REJECTED'].includes(verdict)) {
      run('gh', ['issue', 'edit', String(n), '-R', cfg.repo, '--remove-label', APPROVAL_LABEL], { cwd, allowFail: true });
      setStatus(n, values.status);
    }
    postComment(n, recordBody({ comment: id, verdict, option: values.option, note: values.note, author: c.user.login, createdAt: c.created_at }));
    return console.log(`#${n}: comentário ${id} registrado como ${verdict}`);
  }
  if (cmd === 'comment') {
    if (!n || !values['body-file']) throw new Error('uso: decisions.mjs comment <issue> --body-file <arquivo>');
    postComment(n, `${AGENT_MARKER}\n${readFileSync(values['body-file'], 'utf8')}`);
    return console.log(`#${n}: comentário de agente publicado`);
  }
  console.error('uso: decisions.mjs <open|list|check|record|comment> …'); process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try { main(); } catch (e) { console.error(`decisions: ${e.message}`); process.exit(e.code === 'ENOENT' || /gh|HTTP|network/i.test(e.message) ? 2 : 1); }
}
