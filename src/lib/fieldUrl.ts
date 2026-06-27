export type FieldViewState = {
  read: string | null;
  /** Expanded essay body in the read panel */
  full: boolean;
  query: string;
  now: boolean;
  x: number | null;
  y: number | null;
  z: number | null;
};

export function parseFieldState(params: URLSearchParams): FieldViewState {
  return {
    read: params.get('read') || null,
    full: params.get('full') === '1',
    query: params.get('q') ?? '',
    now: params.get('now') === '1',
    x: num(params.get('x')),
    y: num(params.get('y')),
    z: num(params.get('z')),
  };
}

function num(v: string | null): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function viewportMatchesUrl(
  transform: { x: number; y: number; z: number },
  url: Pick<FieldViewState, 'x' | 'y' | 'z'>,
): boolean {
  if (url.x == null || url.y == null || url.z == null) return true;
  const rx = Math.round(transform.x);
  const ry = Math.round(transform.y);
  const rz = Number(transform.z.toFixed(2));
  return url.x === rx && url.y === ry && Math.abs(url.z - rz) < 0.01;
}

export function shouldSyncViewportToUrl(url: Pick<FieldViewState, 'x' | 'y' | 'z'>): boolean {
  return url.x != null && url.y != null && url.z != null;
}

export function writeFieldState(base: FieldViewState, patch: Partial<FieldViewState>): URLSearchParams {
  const next = { ...base, ...patch };
  const p = new URLSearchParams();
  if (next.read) p.set('read', next.read);
  if (next.full) p.set('full', '1');
  if (next.query) p.set('q', next.query);
  if (next.now) p.set('now', '1');
  if (next.x != null) p.set('x', String(Math.round(next.x)));
  if (next.y != null) p.set('y', String(Math.round(next.y)));
  if (next.z != null) p.set('z', next.z.toFixed(2));
  return p;
}