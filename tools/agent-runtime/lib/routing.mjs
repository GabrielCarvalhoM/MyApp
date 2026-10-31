// Executor selection is declared by the session that wrote the checkpoint (the Chief decides the tier:
// local tooling, Codex for bounded verifiable engineering, Claude for judgment). The runtime only
// enforces availability and the fallback: the mission never depends on Codex being there.

export function chooseExecutor(unit, codexAvailability) {
  if (unit.executor !== 'codex') return { executor: unit.executor, reason: `declared ${unit.executor}` };
  if (codexAvailability.ok) return { executor: 'codex', reason: 'declared codex; codex is available' };
  return fallbackFor(unit, `codex unavailable: ${codexAvailability.reason}`);
}

// Deterministic work goes to its local command when the job names one; anything else returns to
// Claude, which does only the part of the job that is still needed.
export function fallbackFor(unit, reason) {
  const command = unit.job?.fallback_command;
  if (command) return { executor: 'local', command, reason: `${reason}; running the deterministic fallback command` };
  return { executor: 'claude', reason: `${reason}; the next Claude unit does the necessary work` };
}
