export type ContrastMode = 'line' | 'pair' | 'table';

export type ContrastRow = {
  label?: string;
  a: string;
  b: string;
};

export type ContrastData = {
  mode: ContrastMode;
  poles: [string, string];
  ownedPole: 0 | 1;
  axisLabel?: string;
  rows: ContrastRow[];
};

const FENCE_OPEN = /^:::contrast\s+(.+)$/i;
const FENCE_CLOSE = /^:::\s*$/;
const ROW_BULLET = /^-\s*(.+?)\s*\|\s*(.+)$/;
const ROW_PLAIN = /^(.+?)\s*\|\s*(.+)$/;

function stripRowLabel(cell: string): string {
  const noBold = cell.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
  const dash = noBold.split(/\s*[—–-]\s+/)[0]?.trim();
  return dash || noBold;
}

function parseFenceHeader(
  inner: string,
): { poles: [string, string]; ownedPole?: 0 | 1; modeHint?: ContrastMode } | null {
  const parts = inner.split('|').map((s) => s.trim());
  if (parts.length < 2) return null;

  let modeHint: ContrastMode | undefined;
  const last = parts[parts.length - 1]!.toLowerCase();
  if (parts.length >= 3 && (last === 'line' || last === 'pair' || last === 'table')) {
    modeHint = last;
    parts.pop();
  }

  if (parts.length !== 2) return null;

  let ownedPole: 0 | 1 | undefined;
  const poleBMatch = parts[1]!.match(/^(.+?)\s+@([01])$/);
  if (poleBMatch) {
    parts[1] = poleBMatch[1]!.trim();
    ownedPole = Number(poleBMatch[2]) as 0 | 1;
  }

  const poleAMatch = parts[0]!.match(/^(.+?)\s+@([01])$/);
  if (poleAMatch) {
    parts[0] = poleAMatch[1]!.trim();
    ownedPole = Number(poleAMatch[2]) as 0 | 1;
  }

  return { poles: [parts[0]!, parts[1]!], ownedPole, modeHint };
}

function parseFenceRow(line: string): ContrastRow | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const m = trimmed.match(ROW_BULLET) ?? trimmed.match(ROW_PLAIN);
  if (!m) return null;
  return { a: m[1]!.trim(), b: m[2]!.trim() };
}

function inferFenceMode(rows: ContrastRow[], hint?: ContrastMode): ContrastMode {
  if (hint && hint !== 'table') return hint;
  return rows.length === 1 ? 'line' : 'pair';
}

function defaultOwnedPole(mode: ContrastMode, explicit?: 0 | 1): 0 | 1 {
  if (explicit !== undefined) return explicit;
  return mode === 'table' ? 0 : 1;
}

/** Author-marked contrast block: `:::contrast poleA | poleB` … `:::`. */
export function collectContrastFence(
  lines: string[],
  start: number,
): { data: ContrastData; end: number } | null {
  const open = lines[start]?.trim().match(FENCE_OPEN);
  if (!open) return null;

  const header = parseFenceHeader(open[1]!.trim());
  if (!header) return null;

  const rows: ContrastRow[] = [];
  let i = start + 1;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (FENCE_CLOSE.test(trimmed)) {
      if (!rows.length) return null;
      const mode = inferFenceMode(rows, header.modeHint);
      return {
        data: {
          mode,
          poles: header.poles,
          ownedPole: defaultOwnedPole(mode, header.ownedPole),
          rows,
        },
        end: i + 1,
      };
    }
    const row = parseFenceRow(trimmed);
    if (!row) break;
    rows.push(row);
    i++;
  }

  return null;
}

/** GFM table with axis + two stance columns → contrast table (FIG.07 absorbed). */
export function contrastFromTable(headers: string[], body: string[][]): ContrastData | null {
  if (headers.length !== 3) return null;
  const dataRows = body.filter((r) => r.length >= 3 && !r.every((c) => /^:?-+:?$/.test(c.trim())));
  if (!dataRows.length) return null;

  return {
    mode: 'table',
    poles: [headers[1]!.trim(), headers[2]!.trim()],
    ownedPole: 0,
    axisLabel: headers[0]!.trim().toLowerCase(),
    rows: dataRows.map((r) => ({
      label: stripRowLabel(r[0]!),
      a: r[1]!.trim(),
      b: r[2]!.trim(),
    })),
  };
}