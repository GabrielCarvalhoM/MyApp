#!/usr/bin/env node
// "Qual é o estado atual da construção do RepMile?" — answered from git, GitHub Issues, Pull Requests and CI only.
//
//   node tools/orchestration/status.mjs [--no-fetch] [--offline] [--json] [--out <file>]
//
// Read-only: the only write is `git fetch origin --prune --tags` (skip with --no-fetch). It never edits a branch, an
// issue or a PR, and it works from any checkout of the repository without any earlier session being open.
// Exit 0: report produced. Exit 2: missing dependency (git, or gh when not --offline) or not a checkout.
import { parseArgs } from 'node:util';
import { writeFileSync } from 'node:fs';
import { ROLES, evaluate, parseNameStatus, summarize } from './lib/ownership.mjs';
import { git, ghJson, run, repoRoot, refExists, baseTagFor, MissingDependency } from './lib/sh.mjs';
import { issueState, parseDependencies, parseLinkedIssues, priorityOf, STATE_LABELS } from './lib/states.mjs';
import { APPROVAL_LABEL, loadConfig, findProject, listItems } from './lib/board.mjs';

const BOARD_STATE = { Backlog: 'BACKLOG', Ready: 'READY', 'In Progress': 'IN_PROGRESS', Blocked: 'BLOCKED', 'In Review': 'IN_REVIEW',
  'Ready to Integrate': 'READY_TO_INTEGRATE', Integrated: 'INTEGRATED', Verified: 'VERIFIED' };

const { values } = parseArgs({
  options: {
    fetch: { type: 'boolean', default: true }, 'no-fetch': { type: 'boolean', default: false },
    offline: { type: 'boolean', default: false }, json: { type: 'boolean', default: false }, out: { type: 'string' },
  },
});

function collectGit(cwd) {
  if (!values['no-fetch']) {
    const f = git(['fetch', 'origin', '--prune', '--tags', '--quiet'], { cwd, allowFail: true });
    if (f.code !== 0) console.error(`status: aviso: git fetch falhou (${f.err.split('\n')[0]}); usando refs locais`);
  }
  const worktrees = {};
  let cur = {};
  for (const line of git(['worktree', 'list', '--porcelain'], { cwd }).out.split('\n')) {
    if (line.startsWith('worktree ')) cur = { path: line.slice(9) };
    if (line.startsWith('branch ')) worktrees[line.slice(7).replace('refs/heads/', '')] = cur.path;
  }
  const fronts = [];
  for (const role of ROLES) {
    const b = role.branch;
    const remote = refExists(`origin/${b}`, cwd) ? `origin/${b}` : null;
    const local = refExists(`refs/heads/${b}`, cwd) ? b : null;
    // Measure the most advanced tip: local work not yet pushed is still checked against the ownership matrix.
    const localAhead = local && remote && git(['merge-base', '--is-ancestor', remote, local], { cwd, allowFail: true }).code === 0;
    const tip = localAhead ? local : (remote ?? local);
    const f = { role: role.id, label: role.label, branch: b, exists: Boolean(tip), published: Boolean(remote) };
    if (tip) {
      const base = baseTagFor(tip, cwd);
      const [sha, date, subject] = git(['log', '-1', '--format=%h%x09%cs%x09%s', tip], { cwd }).out.split('\t');
      Object.assign(f, { sha, date, subject, base, containsBase: Boolean(base) });
      if (base) {
        f.aheadOfBase = Number(git(['rev-list', '--count', `${base}..${tip}`], { cwd }).out);
        const changes = parseNameStatus(git(['diff', '--name-status', '-M', `${base}...${tip}`], { cwd }).out);
        const auditsAtBase = new Set(git(['ls-tree', '-r', '--name-only', base, '--', 'audits/'], { cwd }).out.split('\n'));
        const ev = evaluate(changes, role.id, { existedAtBase: (p) => auditsAtBase.has(p) });
        f.ownership = { ...summarize(ev), violations: ev.results.filter((r) => r.verdict !== 'OK').slice(0, 10) };
      }
      if (local && remote) {
        const [ahead, behind] = git(['rev-list', '--left-right', '--count', `${local}...${remote}`], { cwd }).out.split(/\s+/).map(Number);
        Object.assign(f, { unpushed: ahead, behindRemote: behind });
        if (ahead) {
          const [lsha, ldate, lsubject] = git(['log', '-1', '--format=%h%x09%cs%x09%s', local], { cwd }).out.split('\t');
          f.localTip = { sha: lsha, date: ldate, subject: lsubject, remoteSha: git(['rev-parse', '--short', remote], { cwd }).out };
        }
      } else if (local && !remote) {
        f.unpushed = Number(git(['rev-list', '--count', f.base ? `${f.base}..${local}` : local], { cwd }).out);
      }
    }
    const wt = worktrees[b];
    if (wt) {
      const st = git(['-C', wt, 'status', '--porcelain'], { allowFail: true });
      f.worktree = { path: wt, uncommitted: st.code === 0 ? st.out.split('\n').filter(Boolean).length : null };
    }
    fronts.push(f);
  }
  return { fronts };
}

function collectGitHub(cwd, fronts) {
  const repo = ghJson(['repo', 'view', '--json', 'nameWithOwner,defaultBranchRef'], { cwd });
  const R = repo.nameWithOwner;
  const prs = ghJson(['pr', 'list', '-R', R, '--state', 'open', '--limit', '100', '--json',
    'number,title,headRefName,baseRefName,isDraft,url,reviewDecision,statusCheckRollup,labels,body,updatedAt,headRefOid'], { cwd });
  const issues = ghJson(['issue', 'list', '-R', R, '--state', 'open', '--limit', '300', '--json', 'number,title,labels,url,updatedAt,body'], { cwd });
  const closed = ghJson(['issue', 'list', '-R', R, '--state', 'closed', '--limit', '300', '--json', 'number,title,closedAt,stateReason'], { cwd });
  const closedSet = new Set(closed.map((i) => i.number));
  for (const f of fronts) {
    if (!f.published) continue;
    const runs = ghJson(['run', 'list', '-R', R, '--branch', f.branch, '--limit', '1', '--json', 'status,conclusion,headSha,url,workflowName,createdAt'], { cwd });
    const r = runs?.[0];
    const tipFull = git(['rev-parse', `origin/${f.branch}`], { cwd }).out;
    f.ci = r ? { status: r.status, conclusion: r.conclusion, url: r.url, current: r.headSha === tipFull } : null;
    f.pr = prs.filter((p) => p.headRefName === f.branch || p.headRefName.startsWith(`${f.branch}-`)).map((p) => p.number);
  }
  // The board's Status is the source of truth; labels are the fallback when the board is not readable.
  let board = null;
  try {
    const cfg = loadConfig();
    const p = findProject(cfg, cwd);
    if (p) board = { url: p.url, items: new Map(listItems(cfg, p.number, cwd).filter((x) => x.number).map((x) => [x.number, x])) };
    else board = { missing: true };
  } catch (e) { board = { error: /scope|read:project/i.test(e.message) ? 'token sem escopo de Projects (gh auth refresh -h github.com -s project)' : e.message.split('\n')[0] }; }
  const prByIssue = new Map();
  for (const p of prs) {
    p.linked = parseLinkedIssues(p.body);
    p.ci = rollup(p.statusCheckRollup);
    for (const n of p.linked) if (!p.isDraft) prByIssue.set(n, p.number);
  }
  for (const i of issues) {
    i.labelNames = i.labels.map((l) => l.name);
    const item = board?.items?.get(i.number);
    i.board = item?.values ?? null;
    i.state = item?.values.Status ? BOARD_STATE[item.values.Status] : issueState(i.labelNames, prByIssue.has(i.number));
    i.validation = item?.values['Validação'] ?? null;
    i.awaitingFounder = i.labelNames.includes(APPROVAL_LABEL);
    i.offBoard = Boolean(board?.items) && !item;
    i.pr = prByIssue.get(i.number) ?? null;
    i.priority = priorityOf(i.labelNames);
    i.deps = parseDependencies(i.body);
    i.openDeps = i.deps.filter((d) => !closedSet.has(d));
  }
  const weekAgo = Date.now() - 7 * 864e5;
  const verifiedThisWeek = closed.filter((i) => i.stateReason === 'COMPLETED' && Date.parse(i.closedAt) > weekAgo);
  return { repo: R, defaultBranch: repo.defaultBranchRef?.name, prs, issues, verifiedThisWeek, board: board?.items ? { url: board.url, items: board.items.size } : board };
}

function rollup(checks = []) {
  if (!checks.length) return 'sem checks';
  const states = checks.map((c) => (c.conclusion || c.state || c.status || '').toUpperCase());
  if (states.some((s) => ['FAILURE', 'ERROR', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED'].includes(s))) return 'FALHOU';
  if (states.some((s) => ['IN_PROGRESS', 'QUEUED', 'PENDING', 'EXPECTED', 'WAITING', ''].includes(s))) return 'rodando';
  return 'verde';
}

const ciText = (ci) => !ci ? 'sem execução' : ci.status !== 'completed' ? `rodando${ci.current ? '' : ' (commit antigo)'}`
  : `${ci.conclusion === 'success' ? 'verde' : `FALHOU (${ci.conclusion})`}${ci.current ? '' : ' (commit antigo)'}`;

function render(data) {
  const L = [];
  const { fronts, gh } = data;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  L.push(`# Estado da construção do RepMile — ${now} UTC`, '');
  const alerts = [];
  for (const f of fronts) {
    if (!f.exists) continue;
    if (!f.containsBase) alerts.push(`${f.label}: \`${f.branch}\` não contém nenhuma tag de base \`v1-abc-*\``);
    if (f.ownership?.forbidden || f.ownership?.approval) alerts.push(`${f.label}: ${f.ownership.forbidden} caminho(s) fora da coluna e ${f.ownership.approval} que exigem aprovação (\`node tools/orchestration/guard.mjs --head origin/${f.branch} --branch ${f.branch}\`)`);
    if (f.unpushed) alerts.push(`${f.label}: ${f.unpushed} commit(s) local(is) não publicado(s) em \`origin/${f.branch}\``);
    if (f.behindRemote) alerts.push(`${f.label}: a branch local está ${f.behindRemote} commit(s) atrás do remoto`);
    if (f.ci && f.ci.status === 'completed' && f.ci.conclusion !== 'success') alerts.push(`${f.label}: CI ${f.ci.conclusion} — ${f.ci.url}`);
  }
  if (gh) for (const p of gh.prs) if (p.ci === 'FALHOU') alerts.push(`PR #${p.number}: checks falharam — ${p.url}`);

  if (gh) {
    const by = (s) => gh.issues.filter((i) => i.state === s);
    L.push('## Resumo', '');
    L.push(`- Repositório \`${gh.repo}\` · ${gh.prs.length} PR(s) aberto(s) · ${by('IN_PROGRESS').length} em andamento · ${by('IN_REVIEW').length} em revisão · ${by('READY_TO_INTEGRATE').length} prontas para integrar · ${by('BLOCKED').length} bloqueada(s) · ${by('READY').length} prontas · ${by('BACKLOG').length} no backlog · ${gh.verifiedThisWeek.length} verificada(s) nos últimos 7 dias`);
    L.push(`- Quadro: ${gh.board?.url ? `${gh.board.url} (${gh.board.items} itens; estado lido do campo Status)` : `indisponível — ${gh.board?.error ?? 'ainda não criado'}; estado lido dos rótulos status:*`}`);
    L.push(`- Alertas: ${alerts.length || 'nenhum'}`, '');
  }

  L.push('## Frentes', '', '| Frente | Branch | Último commit | Base · à frente | Não publicado | Alterações locais | CI | PR | Ownership |', '|---|---|---|---|---|---|---|---|---|');
  for (const f of fronts) {
    if (!f.exists) { L.push(`| ${f.label} | \`${f.branch}\` | — (não existe ainda) | | | | | | |`); continue; }
    const own = f.ownership ? (f.ownership.forbidden || f.ownership.approval ? `**${f.ownership.forbidden} proibido · ${f.ownership.approval} aprovação**` : `ok (${f.ownership.files})`) : '—';
    const wt = f.worktree ? (f.worktree.uncommitted ? `${f.worktree.uncommitted} arquivo(s)` : 'limpa') : '—';
    L.push(`| ${f.label} | \`${f.branch}\`${f.published ? '' : ' (só local)'} | ${f.localTip ? `local \`${f.localTip.sha}\` ${f.localTip.date} ${f.localTip.subject.slice(0, 50)} (remoto \`${f.localTip.remoteSha}\`)` : `\`${f.sha}\` ${f.date} ${f.subject.slice(0, 60)}`} | ${f.base ?? '**sem base**'} · ${f.aheadOfBase ?? '?'} | ${f.unpushed ? `**${f.unpushed}**` : 0} | ${wt} | ${gh ? ciText(f.ci) : 'offline'} | ${f.pr?.length ? f.pr.map((n) => `#${n}`).join(' ') : '—'} | ${own} |`);
  }
  L.push('');

  if (gh) {
    L.push('## Pull Requests abertos', '');
    if (!gh.prs.length) L.push('Nenhum.', '');
    else {
      L.push('| PR | Título | head → base | Issue | CI | Revisão | Rascunho |', '|---|---|---|---|---|---|---|');
      for (const p of gh.prs) L.push(`| [#${p.number}](${p.url}) | ${p.title} | \`${p.headRefName}\` → \`${p.baseRefName}\` | ${p.linked.map((n) => `#${n}`).join(' ') || '**sem issue**'} | ${p.ci} | ${p.reviewDecision || '—'} | ${p.isDraft ? 'sim' : 'não'} |`);
      L.push('');
    }
    const section = (title, list, extra = () => '') => {
      L.push(`## ${title}`, '');
      if (!list.length) { L.push('Nenhuma.', ''); return; }
      for (const i of list) L.push(`- [#${i.number}](${i.url}) ${i.title} · ${i.labelNames.filter((n) => !n.startsWith('status:')).join(', ')}${extra(i)}`);
      L.push('');
    };
    const sorted = (s) => gh.issues.filter((i) => i.state === s).sort((a, b) => a.priority - b.priority || a.number - b.number);
    section('Em andamento', sorted('IN_PROGRESS'));
    section('Em revisão', sorted('IN_REVIEW'), (i) => (i.pr ? ` · PR #${i.pr}` : ''));
    section('Prontas para integrar', sorted('READY_TO_INTEGRATE'));
    section('Integradas, ainda não validadas (implementado ≠ validado)', sorted('INTEGRATED'), (i) => ` · validação: ${i.validation ?? 'Não validado'}`);
    section('Bloqueadas', sorted('BLOCKED'), (i) => (i.openDeps.length ? ` · aguarda ${i.openDeps.map((n) => `#${n}`).join(', ')}` : ' · **dependências fechadas: revisar o bloqueio**'));
    const ready = sorted('READY');
    const promotable = sorted('BACKLOG').filter((i) => i.deps.length && !i.openDeps.length);
    section('Próximos incrementos (READY, por prioridade)', ready, (i) => (i.openDeps.length ? ` · ⚠ dependências abertas ${i.openDeps.map((n) => `#${n}`).join(', ')}` : ''));
    if (promotable.length) section('Backlog com dependências cumpridas (candidatas a READY)', promotable.filter((i) => !i.awaitingFounder));
    section('Aguardando decisão do fundador', gh.issues.filter((i) => i.awaitingFounder).sort((a, b) => a.priority - b.priority || a.number - b.number));
    const off = gh.issues.filter((i) => i.offBoard);
    if (off.length) alerts.push(`${off.length} issue(s) aberta(s) fora do quadro: ${off.map((i) => `#${i.number}`).join(', ')} (board.mjs add)`);
  }

  L.push('## Alertas', '');
  L.push(...(alerts.length ? alerts.map((a) => `- ${a}`) : ['Nenhum.']), '');
  L.push('_Fonte: git (`origin`), GitHub Issues/PRs/Actions. Sem monitoramento em segundo plano: este relatório é gerado sob demanda._');
  return L.join('\n');
}

try {
  const cwd = repoRoot();
  const data = collectGit(cwd);
  if (!values.offline) {
    try { run('gh', ['auth', 'status'], { cwd }); } catch (e) {
      throw e instanceof MissingDependency ? e : new MissingDependency('gh (autenticado: `gh auth login`)');
    }
    data.gh = collectGitHub(cwd, data.fronts);
  }
  const text = values.json ? JSON.stringify(data, null, 2) : render(data);
  if (values.out) writeFileSync(values.out, `${text}\n`);
  console.log(text);
} catch (e) {
  console.error(`status: ${e instanceof MissingDependency ? `${e.message} — use --offline para só o estado git` : e.stack || e}`);
  process.exitCode = 2;
}
export { STATE_LABELS };
