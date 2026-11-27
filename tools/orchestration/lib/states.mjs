// Delivery states (docs/engineering/WORKFLOW.md §2). Only what GitHub cannot show by itself is a label:
//   BACKLOG             open issue, no status label
//   READY               status:ready
//   IN_PROGRESS         status:in-progress
//   FOUNDER_DECISION    status:founder-decision (waiting for a Founder product decision; not a technical block)
//   BLOCKED             status:blocked          (wins over every other label)
//   IN_REVIEW           derived: an open, non-draft PR names the issue ("Issue: #n")
//   READY_TO_INTEGRATE  status:ready-to-integrate (reviewed + gates green; set by the reviewer)
//   INTEGRATED          status:integrated       (merged into the integration branch)
//   VERIFIED            the issue is closed as completed after the validation it asks for
export const STATE_LABELS = {
  'status:founder-decision': 'FOUNDER_DECISION',
  'status:blocked': 'BLOCKED',
  'status:integrated': 'INTEGRATED',
  'status:ready-to-integrate': 'READY_TO_INTEGRATE',
  'status:in-progress': 'IN_PROGRESS',
  'status:ready': 'READY',
};

export function issueState(labelNames, hasOpenPr = false) {
  const has = (l) => labelNames.includes(l);
  if (has('status:founder-decision')) return 'FOUNDER_DECISION';
  if (has('status:blocked')) return 'BLOCKED';
  if (has('status:integrated')) return 'INTEGRATED';
  if (has('status:ready-to-integrate')) return 'READY_TO_INTEGRATE';
  if (hasOpenPr) return 'IN_REVIEW';
  if (has('status:in-progress')) return 'IN_PROGRESS';
  if (has('status:ready')) return 'READY';
  return 'BACKLOG';
}

export function priorityOf(labelNames) {
  const p = labelNames.find((l) => /^priority:p\d$/.test(l));
  return p ? Number(p.at(-1)) : 9;
}

// PR body: the template's "Issue:" line, or GitHub closing keywords.
export function parseLinkedIssues(body = '') {
  const found = new Set();
  for (const m of body.matchAll(/^\s*(?:[-*]\s*)?\**Issue\**\s*:\s*(.+)$/gim)) for (const n of m[1].matchAll(/#(\d+)/g)) found.add(Number(n[1]));
  for (const m of body.matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|refs?)\s+#(\d+)/gi)) found.add(Number(m[1]));
  return [...found].sort((a, b) => a - b);
}

// Issue body: the "### Dependências" section of the issue forms (and of the seeded backlog).
export function parseDependencies(body = '') {
  const m = body.match(/^###\s+Depend[êe]ncias\s*\n([\s\S]*?)(?=^###\s|(?![\s\S]))/im);
  if (!m) return [];
  return [...new Set([...m[1].matchAll(/#(\d+)/g)].map((x) => Number(x[1])))].sort((a, b) => a - b);
}
