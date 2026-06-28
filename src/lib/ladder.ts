export type LadderMode = 'level' | 'step' | 'gate';

export type LadderRung = {
  marker: string;
  term: string;
  body: string;
  tag?: string;
  role?: 'core' | 'addon';
};

export type LadderData = {
  mode: LadderMode;
  rungs: LadderRung[];
};

const BOLD_ONLY = /^\*\*(.+)\*\*\s*$/;
const LEVEL_LINE = /^\*\*(L\d+)\s*[—–-]\s*(.+?)\*\*\s*$/;
const BULLET_ADDON = /^-\s+\*\*(\+\d+)\s+([^:*]+):?\*\*:?\s*(.*)$/;
const ORDERED_RUNG = /^(\d+)\.\s+\*\*([^:*]+):?\*\*:?\s*(.*)$/;

function stripParensTag(term: string): { term: string; tag?: string } {
  const m = term.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { term: term.trim() };
  return { term: m[1]!.trim(), tag: m[2]!.trim() };
}

function tryRungLine(line: string): Omit<LadderRung, 'marker'> & { marker?: string } | null {
  const trimmed = line.trim();
  const level = trimmed.match(LEVEL_LINE);
  if (level) {
    const { term, tag } = stripParensTag(level[2]!);
    return { marker: level[1]!, term, body: '', tag };
  }
  const ordered = trimmed.match(ORDERED_RUNG);
  if (ordered) {
    return {
      marker: ordered[1]!.padStart(2, '0'),
      term: ordered[2]!.trim(),
      body: ordered[3]!.trim(),
    };
  }
  const addon = trimmed.match(BULLET_ADDON);
  if (addon) {
    return {
      marker: addon[1]!,
      term: addon[2]!.trim(),
      body: addon[3]!.trim(),
      role: 'addon',
    };
  }
  const boldOnly = trimmed.match(BOLD_ONLY);
  if (boldOnly) {
    const inner = boldOnly[1]!.trim();
    const dash = inner.match(/^(L\d+)\s*[—–-]\s*(.+)$/);
    if (dash) {
      const { term, tag } = stripParensTag(dash[2]!);
      return { marker: dash[1]!, term, body: '', tag };
    }
  }
  return null;
}

function inferMode(rungs: LadderRung[]): LadderMode {
  if (rungs.some((r) => r.role === 'addon' || /^\+/.test(r.marker))) return 'gate';
  if (rungs.some((r) => /^L\d+$/i.test(r.marker))) return 'level';
  return 'step';
}

function finalizeGate(rungs: LadderRung[]): LadderRung[] {
  let core = 0;
  return rungs.map((r) => {
    if (r.role === 'addon') return r;
    core += 1;
    return { ...r, marker: `R${core}`, role: 'core' as const };
  });
}

/** Collect ≥2 ladder rungs starting at `start`, or null. */
export function collectLadder(lines: string[], start: number): { data: LadderData; end: number } | null {
  const rungs: LadderRung[] = [];
  let i = start;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith('##') || trimmed.startsWith('###')) break;
    if (trimmed.startsWith('>') || trimmed.startsWith('|')) break;

    const head = tryRungLine(trimmed);
    if (!head) {
      if (rungs.length && rungs[rungs.length - 1]!.body === '') {
        const body: string[] = [];
        while (i < lines.length) {
          const t = lines[i]!.trim();
          if (!t) {
            i++;
            continue;
          }
          if (tryRungLine(t) || t.startsWith('##') || t.startsWith('###') || t.startsWith('>')) break;
          body.push(t);
          i++;
        }
        const last = rungs[rungs.length - 1]!;
        last.body = body.join(' ').trim();
        continue;
      }
      break;
    }

    const rung: LadderRung = {
      marker: head.marker ?? '',
      term: head.term,
      body: head.body,
      tag: head.tag,
      role: head.role,
    };
    rungs.push(rung);
    i++;

    if (!rung.body) {
      const body: string[] = [];
      while (i < lines.length) {
        const t = lines[i]!.trim();
        if (!t) {
          i++;
          continue;
        }
        if (tryRungLine(t) || t.startsWith('##') || t.startsWith('###') || t.startsWith('>')) break;
        body.push(t);
        i++;
      }
      rung.body = body.join(' ').trim();
    }
  }

  if (rungs.length < 2) return null;
  let mode = inferMode(rungs);
  let finalized = mode === 'gate' ? finalizeGate(rungs) : rungs;
  if (mode === 'step' && finalized.every((r) => /^\d{2}$/.test(r.marker))) {
    // keep step markers
  } else if (mode === 'level') {
    finalized = finalized.map((r) => ({ ...r, role: undefined }));
  }
  return { data: { mode, rungs: finalized }, end: i };
}