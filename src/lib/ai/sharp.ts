export interface PredictPointCloudResult {
  url: string;
  id: string;
  count: number;
  fitRadius: number;
  bytes: number;
}

function assertPayload(value: unknown): PredictPointCloudResult {
  if (typeof value !== 'object' || value === null) throw new Error('invalid sharp response');
  const payload = value as Record<string, unknown>;
  if (
    typeof payload.url !== 'string' ||
    typeof payload.id !== 'string' ||
    typeof payload.count !== 'number' ||
    typeof payload.fitRadius !== 'number' ||
    typeof payload.bytes !== 'number'
  ) {
    throw new Error('invalid sharp response');
  }
  return {
    url: payload.url,
    id: payload.id,
    count: payload.count,
    fitRadius: payload.fitRadius,
    bytes: payload.bytes,
  };
}

export async function predictPointCloud(
  file: File,
  options: { count?: number; radius?: number } = {},
): Promise<PredictPointCloudResult> {
  if (!import.meta.env.DEV) {
    throw new Error('SHARP prediction is dev-only');
  }

  const form = new FormData();
  form.set('image', file);
  if (options.count !== undefined) form.set('count', String(options.count));
  if (options.radius !== undefined) form.set('radius', String(options.radius));

  const response = await fetch('/__sharp/predict', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `request failed with ${response.status}`);
  }

  return assertPayload(await response.json());
}
