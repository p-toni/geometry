// Pure converter: binary little-endian PLY (Apple SHARP Gaussian splat or
// generic point cloud) → compact `.splt` Buffer.
//
// SPLT v2 layout (little-endian):
//   bytes 0..3   : magic 'SPLT'
//   byte  4      : version (2)
//   byte  5      : flags    (bit 0 = sRGB colors)
//   bytes 6..7   : reserved
//   bytes 8..11  : point count (uint32)
//   bytes 12..15 : scale (float32) — max absolute offset from center
//   bytes 16..27 : center x/y/z (float32 each)
//   bytes 28..31 : reserved
//   then count × 9 bytes:
//     int16 x, int16 y, int16 z, uint8 r, uint8 g, uint8 b
//
// No process I/O; intended to be reused by both the CLI script and the
// dev-mode Vite plugin.

const SH_C0 = 0.28209479177387814;

function findHeaderEnd(bytes) {
  const marker = Buffer.from('end_header');
  const end = bytes.indexOf(marker);
  if (end < 0) throw new Error('PLY: end_header not found');
  let k = end + marker.length;
  while (k < bytes.length && (bytes[k] === 0x0a || bytes[k] === 0x0d)) k += 1;
  return k;
}

function typeSize(t) {
  if (
    t === 'float' ||
    t === 'float32' ||
    t === 'int' ||
    t === 'int32' ||
    t === 'uint' ||
    t === 'uint32'
  )
    return 4;
  if (t === 'short' || t === 'int16' || t === 'ushort' || t === 'uint16') return 2;
  if (t === 'char' || t === 'int8' || t === 'uchar' || t === 'uint8') return 1;
  if (t === 'double' || t === 'float64') return 8;
  return 4;
}

function readValue(view, offset, type) {
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

export function plyToSplt(input, options = {}) {
  const targetCount = Math.max(1024, Math.min(2_000_000, Number(options.count ?? 2_000_000)));
  const dataStart = findHeaderEnd(input);
  const headerText = input.slice(0, dataStart).toString('utf8');
  const lines = headerText.split(/\r?\n/);

  const formatLine = lines.find((l) => l.startsWith('format ')) ?? '';
  if (!formatLine.includes('binary_little_endian')) {
    throw new Error('only binary_little_endian PLY supported');
  }

  let vertexCount = 0;
  let inVertex = false;
  let stride = 0;
  const props = new Map();
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
  if (!xP || !yP || !zP) throw new Error('PLY missing x/y/z');

  const dc0 = props.get('f_dc_0');
  const dc1 = props.get('f_dc_1');
  const dc2 = props.get('f_dc_2');
  const r8 = props.get('red');
  const g8 = props.get('green');
  const b8 = props.get('blue');

  const view = new DataView(
    input.buffer,
    input.byteOffset + dataStart,
    input.byteLength - dataStart,
  );
  const count = Math.min(vertexCount, targetCount);
  const step = Math.max(1, Math.floor(vertexCount / count));

  const positions = new Float32Array(count * 3);
  const colors = new Uint8Array(count * 3);
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (let i = 0; i < count; i += 1) {
    const src = Math.min(vertexCount - 1, i * step);
    const base = src * stride;
    const i3 = i * 3;
    const x = readValue(view, base + xP.offset, xP.type);
    const y = readValue(view, base + yP.offset, yP.type);
    const z = readValue(view, base + zP.offset, zP.type);
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;

    if (dc0 && dc1 && dc2) {
      const r = readValue(view, base + dc0.offset, dc0.type);
      const g = readValue(view, base + dc1.offset, dc1.type);
      const b = readValue(view, base + dc2.offset, dc2.type);
      colors[i3] = Math.round(Math.max(0, Math.min(1, 0.5 + SH_C0 * r)) * 255);
      colors[i3 + 1] = Math.round(Math.max(0, Math.min(1, 0.5 + SH_C0 * g)) * 255);
      colors[i3 + 2] = Math.round(Math.max(0, Math.min(1, 0.5 + SH_C0 * b)) * 255);
    } else if (r8 && g8 && b8) {
      colors[i3] = readValue(view, base + r8.offset, r8.type) & 0xff;
      colors[i3 + 1] = readValue(view, base + g8.offset, g8.type) & 0xff;
      colors[i3 + 2] = readValue(view, base + b8.offset, b8.type) & 0xff;
    } else {
      colors[i3] = 230;
      colors[i3 + 1] = 211;
      colors[i3 + 2] = 184;
    }
  }

  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const cz = (minZ + maxZ) * 0.5;
  let scale = 0;
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    scale = Math.max(
      scale,
      Math.abs(positions[i3] - cx),
      Math.abs(positions[i3 + 1] - cy),
      Math.abs(positions[i3 + 2] - cz),
    );
  }
  if (scale <= 1e-6) scale = 1;

  const headerBytes = 32;
  const out = Buffer.alloc(headerBytes + count * 9);
  out.write('SPLT', 0, 'ascii');
  out.writeUInt8(2, 4); // version
  out.writeUInt8(1, 5); // flags: sRGB colors
  out.writeUInt32LE(count, 8);
  out.writeFloatLE(scale, 12);
  out.writeFloatLE(cx, 16);
  out.writeFloatLE(cy, 20);
  out.writeFloatLE(cz, 24);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const offset = headerBytes + i * 9;
    const sx = Math.max(-1, Math.min(1, (positions[i3] - cx) / scale));
    const sy = Math.max(-1, Math.min(1, (positions[i3 + 1] - cy) / scale));
    const sz = Math.max(-1, Math.min(1, (positions[i3 + 2] - cz) / scale));
    out.writeInt16LE(Math.round(sx * 32767), offset);
    out.writeInt16LE(Math.round(sy * 32767), offset + 2);
    out.writeInt16LE(Math.round(sz * 32767), offset + 4);
    out.writeUInt8(colors[i3], offset + 6);
    out.writeUInt8(colors[i3 + 1], offset + 7);
    out.writeUInt8(colors[i3 + 2], offset + 8);
  }

  return { buffer: out, vertexCount, count };
}
