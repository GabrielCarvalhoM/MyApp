// Probable-duplicate detection for new tasks: token overlap of normalised titles (front prefix and punctuation ignored).
const STOP = new Set(['a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'para', 'por', 'com', 'sem', 'um', 'uma', 'the', 'of', 'and', 'to', 'in']);

export function tokens(title) {
  return new Set(title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^\s*\[[^\]]*\]\s*/, '')
    .split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t)));
}

export function similarity(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / Math.min(A.size, B.size);
}

export function similarTitles(title, issues, threshold = 0.6) {
  return issues.map((i) => ({ ...i, score: similarity(title, i.title) })).filter((i) => i.score >= threshold).sort((a, b) => b.score - a.score).slice(0, 5);
}
