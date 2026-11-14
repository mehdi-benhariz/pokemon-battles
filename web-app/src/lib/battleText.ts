export type Inline =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] };

export type BattleBlock =
  | { type: 'heading'; children: Inline[] }
  | { type: 'turn'; children: Inline[] }
  | { type: 'hp'; children: Inline[] }
  | { type: 'winner'; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] };

function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let buf = '';

  const flush = () => {
    if (!buf) return;
    out.push({ type: 'text', value: buf });
    buf = '';
  };

  for (let i = 0; i < text.length; ) {
    const marker = text.startsWith('**', i) || text.startsWith('__', i)
      ? text.slice(i, i + 2)
      : text[i] === '*' || text[i] === '_'
        ? text[i]
        : '';

    if (!marker) {
      buf += text[i];
      i += 1;
      continue;
    }

    const end = text.indexOf(marker, i + marker.length);
    if (end === i + marker.length) {
      buf += marker;
      i += marker.length;
      continue;
    }

    flush();
    const inner = end === -1 ? text.slice(i + marker.length) : text.slice(i + marker.length, end);
    out.push({
      type: marker.length === 2 ? 'strong' : 'em',
      children: parseInline(inner),
    });
    if (end === -1) return out;
    i = end + marker.length;
  }

  flush();
  return out;
}

export function inlinePlain(nodes: Inline[]): string {
  return nodes
    .map(node => (node.type === 'text' ? node.value : inlinePlain(node.children)))
    .join('');
}

export function parseBattleText(source: string): BattleBlock[] {
  return source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const heading = /^(#{1,6})\s+(.*)$/.exec(line);
      const body = heading ? heading[2] : line;
      const children = parseInline(body);
      const plain = inlinePlain(children).trim();

      if (heading) return { type: 'heading', children };
      if (/^winner\b/i.test(plain)) return { type: 'winner', children };
      if (/^turn\s+\d+\b/i.test(plain)) return { type: 'turn', children };
      if (/HP\s*:/i.test(plain) && /→|->/.test(plain) && plain.length < 80) {
        return { type: 'hp', children };
      }
      return { type: 'paragraph', children };
    });
}
