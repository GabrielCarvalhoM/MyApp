// Executor selection is declared by the session that wrote the checkpoint (the Chief decides the
// tier: Claude for judgment, Codex for bounded verifiable engineering; deterministic tooling runs
// inside sessions). The runtime only enforces availability: the mission never depends on Codex, and
// work Codex cannot take returns to the Claude unit that follows the job.
export function chooseExecutor(unit, codexAvailability) {
  if (unit.executor !== 'codex') return { executor: unit.executor, reason: `declared ${unit.executor}` };
  if (codexAvailability.ok) return { executor: 'codex', reason: 'declared codex; codex is available' };
  return { executor: 'claude', reason: `codex unavailable: ${codexAvailability.reason}; the next Claude unit does the necessary work` };
}
