// Parser for backlog/V1_INITIAL_BACKLOG.md: `## KEY · Title`, then `fields: k=v; k=v` and `deps: KEY, KEY`, then the body.
export function parseBacklog(text) {
  const items = [];
  const parts = text.split(/^## /m).slice(1);
  for (const part of parts) {
    const [head, ...lines] = part.split('\n');
    const m = head.match(/^([A-Z][\w-]*)\s+·\s+(.+)$/);
    if (!m) throw new Error(`cabeçalho inválido: "## ${head}"`);
    const item = { key: m[1], title: m[2].trim(), fields: {}, deps: [], body: '' };
    const body = [];
    for (const line of lines) {
      if (/^fields:/.test(line)) {
        for (const kv of line.slice(7).split(';').map((s) => s.trim()).filter(Boolean)) {
          const [k, ...v] = kv.split('=');
          item.fields[k.trim()] = v.join('=').trim();
        }
      } else if (/^deps:/.test(line)) item.deps = line.slice(5).split(',').map((s) => s.trim()).filter(Boolean);
      else body.push(line);
    }
    item.body = body.join('\n').trim();
    if (items.some((x) => x.key === item.key)) throw new Error(`chave duplicada: ${item.key}`);
    for (const d of item.deps) if (!items.some((x) => x.key === d)) throw new Error(`${item.key}: dependência ${d} precisa vir antes no arquivo`);
    items.push(item);
  }
  return items;
}

export function renderBody(item, ref) {
  const sub = (s) => s.replace(/\{\{([\w-]+)\}\}/g, (_, k) => ref(k));
  const deps = item.deps.length ? item.deps.map(ref).join(', ') : 'nenhuma';
  const approval = item.fields.approval === 'founder'
    ? '\n\n> **Aguarda aprovação do fundador** (`needs:founder-approval`): escopo novo ou decisão de produto. Fica em Backlog até a decisão.' : '';
  return `${sub(item.body)}${approval}\n\n### Dependências\n\n${deps}\n\n### Evidências\n\n—\n\n<!-- backlog-key: ${item.key} -->\n`;
}
