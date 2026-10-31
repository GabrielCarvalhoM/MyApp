const REPORTED_FIELDS = ['input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens', 'total_cost_usd'];

// Counts only what the event log objectively records. Token and cost figures are the Claude CLI's
// own report, summed over the runs that reported them, and stay null when none did: never estimated.
export function metrics(events) {
  const counts = {
    sessions_started: 0,
    corrections: 0,
    checkpoints_accepted: 0,
    checkpoints_rejected: 0,
    runs_failed: 0,
    codex_jobs: 0,
    codex_jobs_failed: 0,
    local_jobs: 0,
    local_jobs_failed: 0,
    fallbacks: 0,
    founder_resolutions: 0,
    bootstrap_bytes: 0,
    bootstrap_listed_paths: 0,
  };
  const reported = Object.fromEntries(REPORTED_FIELDS.map((field) => [field, null]));
  let reporting = 0;
  for (const event of events) {
    if (event.type === 'session_start') {
      counts.sessions_started += 1;
      counts.bootstrap_bytes += event.bootstrap_bytes ?? 0;
      counts.bootstrap_listed_paths += event.bootstrap_paths ?? 0;
    } else if (event.type === 'correction_start') counts.corrections += 1;
    else if (event.type === 'checkpoint_accepted') counts.checkpoints_accepted += 1;
    else if (event.type === 'checkpoint_rejected') counts.checkpoints_rejected += 1;
    else if (event.type === 'run_failed') counts.runs_failed += 1;
    else if (event.type === 'fallback') counts.fallbacks += 1;
    else if (event.type === 'founder_resolution') counts.founder_resolutions += 1;
    else if (event.type === 'job_end') {
      const kind = event.executor === 'codex' ? 'codex_jobs' : 'local_jobs';
      counts[kind] += 1;
      if (event.status !== 'DONE') counts[`${kind}_failed`] += 1;
    }
    if ((event.type === 'session_end' || event.type === 'correction_end') && event.metrics) {
      const fields = REPORTED_FIELDS.filter((field) => typeof event.metrics[field] === 'number');
      for (const field of fields) reported[field] = (reported[field] ?? 0) + event.metrics[field];
      if (fields.length) reporting += 1;
    }
  }
  return { ...counts, claude_reported: { runs_reporting: reporting, ...reported } };
}
