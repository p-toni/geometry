export interface PointSet {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  center: [number, number, number];
  radius: number;
}

const SH_C0 = 0.28209479177387814;
const SPLT_MAGIC = 0x544c5053; // 'SPLT' little-endian

function findHeaderEnd(bytes: Uint8Array): number {
  const endHeader = new TextEncoder().encode('end_header');
  const limit = Math.min(bytes.length - endHeader.length, 1024 * 64);
  for (let i = 0; i < limit; i += 1) {
    let match = true;
    for (let j = 0; j < endHeader.length; j += 1) {
      if (bytes[i + j] !== endHeader[j]) {
        match = false;
        break;
      }
    }
    if (!match) continue;
    let k = i + endHeader.length;
    while (k < bytes.length && (bytes[k] === 10 || bytes[k] === 13)) k += 1;
    return k;
  }
  throw new Error('Could not locate PLY header terminator.');
}

function typeSize(type: string): number {
  if (
    type === 'float' ||
    type === 'float32' ||
    type === 'int' ||
    type === 'int32' ||
    type === 'uint' ||
    type === 'uint32'
  )
    return 4;
  if (type === 'short' || type === 'int16' || type === 'ushort' || type === 'uint16') return 2;
  if (type === 'char' || type === 'int8' || type === 'uchar' || type === 'uint8') return 1;
  if (type === 'double' || type === 'float64') return 8;
  return 4;
}

function readValue(view: DataView, offset: number, type: string): number {
  if (type === 'float' || type === 'float32') return view.getFloat32(offset, true);
  if (type === 'double' || type === 'float64') return view.getFloat64(offset, true);
  if (type === 'int' || type === 'int32') return view.getInt32(offset, true);
  if (type === 'uint' || type === 'uint32') return view.getUint32(offset, true);
  if (type === 'short' || type === 'int16') return view.getInt16(offset, true);
  if (type === 'ushort' || type === 'uint16') return view.getUint16(offset, true);
  if (type === 'char' || type === 'int8') return view.getInt8(offset);
  if (type === 'uchar' || type === 'uint8') return view.getUint8(offset);
  return view.getFloat32(offset, true);
}

function centerAndScale(
  positions: Float32Array,
  colors: Float32Array,
  targetRadius?: number,
): {
  center: [number, number, number];
  radius: number;
} {
  const count = Math.floor(positions.length / 3);
  if (count < 1) return { center: [0, 0, 0], radius: 1 };
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const x = positions[i3];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const boundsCenterX = (minX + maxX) * 0.5;
  const boundsCenterY = (minY + maxY) * 0.5;
  const boundsCenterZ = (minZ + maxZ) * 0.5;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;
  let totalWeight = 0;
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const luminance =
      colors.length >= i3 + 3
        ? 0.2126 * colors[i3] + 0.7152 * colors[i3 + 1] + 0.0722 * colors[i3 + 2]
        : 1;
    const weight = Math.max(0, luminance - 0.02) ** 2;
    weightedX += positions[i3] * weight;
    weightedY += positions[i3 + 1] * weight;
    weightedZ += positions[i3 + 2] * weight;
    totalWeight += weight;
  }
  const hasVisualCenter = totalWeight > 1e-5;
  const cx = hasVisualCenter ? weightedX / totalWeight : boundsCenterX;
  const cy = hasVisualCenter ? weightedY / totalWeight : boundsCenterY;
  const cz = hasVisualCenter ? weightedZ / totalWeight : boundsCenterZ;
  let maxDist = 0;
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] -= cx;
    positions[i3 + 1] -= cy;
    positions[i3 + 2] -= cz;
    const d = Math.hypot(positions[i3], positions[i3 + 1], positions[i3 + 2]);
    if (d > maxDist) maxDist = d;
  }
  const scale =
    typeof targetRadius === 'number' && Number.isFinite(targetRadius) && targetRadius > 0
      ? targetRadius / Math.max(maxDist, 1e-5)
      : 1;
  for (let i = 0; i < positions.length; i += 1) positions[i] *= scale;
  return { center: [0, 0, 0], radius: maxDist * scale };
}

function decodeSplt(buffer: ArrayBuffer, preferredCount: number): PointSet {
  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);
  if (magic !== SPLT_MAGIC) throw new Error('Not a SPLT file.');
  const version = view.getUint8(4);
  if (version !== 1 && version !== 2) throw new Error(`Unsupported SPLT version ${version}.`);
  const total = view.getUint32(8, true);
  const scale = view.getFloat32(12, true);
  const headerBytes = version === 2 ? 32 : 16;
  const cx = version === 2 ? view.getFloat32(16, true) : 0;
  const cy = version === 2 ? view.getFloat32(20, true) : 0;
  const cz = version === 2 ? view.getFloat32(24, true) : 0;
  const count = Math.max(1, Math.min(total, preferredCount));
  const step = Math.max(1, Math.floor(total / count));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const inv = scale / 32767;
  for (let i = 0; i < count; i += 1) {
    const src = Math.min(total - 1, i * step);
    const offset = headerBytes + src * 9;
    const i3 = i * 3;
    positions[i3] = cx + view.getInt16(offset, true) * inv;
    positions[i3 + 1] = cy + view.getInt16(offset + 2, true) * inv;
    positions[i3 + 2] = cz + view.getInt16(offset + 4, true) * inv;
    colors[i3] = view.getUint8(offset + 6) / 255;
    colors[i3 + 1] = view.getUint8(offset + 7) / 255;
    colors[i3 + 2] = view.getUint8(offset + 8) / 255;
  }
  return { positions, colors, count, center: [0, 0, 0], radius: 1 };
}

function decodePly(buffer: ArrayBuffer, preferredCount: number): PointSet {
  const bytes = new Uint8Array(buffer);
  const dataStart = findHeaderEnd(bytes);
  const headerText = new TextDecoder().decode(bytes.slice(0, dataStart));
  const lines = headerText.split(/\r?\n/);
  const formatLine = lines.find((l) => l.startsWith('format ')) ?? '';
  if (!formatLine.includes('binary_little_endian')) {
    throw new Error('Only binary_little_endian PLY is supported.');
  }
  let vertexCount = 0;
  let inVertex = false;
  let stride = 0;
  const props = new Map<string, { offset: number; type: string }>();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts[0] === 'element') {
      inVertex = parts[1] === 'vertex';
      if (inVertex) vertexCount = Number(parts[2] ?? 0);
      continue;
    }
    if (!inVertex) continue;
    if (parts[0] === 'property' && parts[1] !== 'list') {
      props.set(parts[2], { offset: stride, type: parts[1] });
      stride += typeSize(parts[1]);
    }
  }
  const xP = props.get('x');
  const yP = props.get('y');
  const zP = props.get('z');
  if (!xP || !yP || !zP) throw new Error('PLY missing x/y/z vertex properties.');

  const count = Math.max(1, Math.min(vertexCount, preferredCount));
  const step = Math.max(1, Math.floor(vertexCount / count));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const view = new DataView(buffer, dataStart);
  const dc0 = props.get('f_dc_0');
  const dc1 = props.get('f_dc_1');
  const dc2 = props.get('f_dc_2');
  const r8 = props.get('red');
  const g8 = props.get('green');
  const b8 = props.get('blue');

  for (let i = 0; i < count; i += 1) {
    const src = Math.min(vertexCount - 1, i * step);
    const base = src * stride;
    const i3 = i * 3;
    positions[i3] = readValue(view, base + xP.offset, xP.type);
    positions[i3 + 1] = readValue(view, base + yP.offset, yP.type);
    positions[i3 + 2] = readValue(view, base + zP.offset, zP.type);
    if (dc0 && dc1 && dc2) {
      const r = readValue(view, base + dc0.offset, dc0.type);
      const g = readValue(view, base + dc1.offset, dc1.type);
      const b = readValue(view, base + dc2.offset, dc2.type);
      colors[i3] = Math.max(0, Math.min(1, 0.5 + SH_C0 * r));
      colors[i3 + 1] = Math.max(0, Math.min(1, 0.5 + SH_C0 * g));
      colors[i3 + 2] = Math.max(0, Math.min(1, 0.5 + SH_C0 * b));
    } else if (r8 && g8 && b8) {
      colors[i3] = Math.max(0, Math.min(1, readValue(view, base + r8.offset, r8.type) / 255));
      colors[i3 + 1] = Math.max(
        0,
        Math.min(1, readValue(view, base + g8.offset, g8.type) / 255),
      );
      colors[i3 + 2] = Math.max(
        0,
        Math.min(1, readValue(view, base + b8.offset, b8.type) / 255),
      );
    } else {
      colors[i3] = 0.9;
      colors[i3 + 1] = 0.83;
      colors[i3 + 2] = 0.72;
    }
  }
  return { positions, colors, count, center: [0, 0, 0], radius: 1 };
}

export async function loadPointSet(
  url: string,
  preferredCount: number,
  fitRadius?: number,
): Promise<PointSet> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const isSplt = url.toLowerCase().endsWith('.splt') || isSpltMagic(buffer);
  const set = isSplt ? decodeSplt(buffer, preferredCount) : decodePly(buffer, preferredCount);
  const metrics = centerAndScale(set.positions, set.colors, fitRadius);
  set.center = metrics.center;
  set.radius = metrics.radius;
  return set;
}

function isSpltMagic(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  return new DataView(buffer).getUint32(0, true) === SPLT_MAGIC;
}
