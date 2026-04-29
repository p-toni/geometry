export interface PlyToSpltOptions {
  count?: number | string;
  /** Deprecated. v2 SPLT preserves SHARP's metric camera-space coordinates. */
  radius?: number | string;
}

export interface PlyToSpltResult {
  buffer: Buffer;
  vertexCount: number;
  count: number;
}

export function plyToSplt(input: Buffer, options?: PlyToSpltOptions): PlyToSpltResult;
