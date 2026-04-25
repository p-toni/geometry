export async function generateImage(prompt: string): Promise<string> {
  if (!import.meta.env.DEV) {
    throw new Error('AI gen is dev-only');
  }

  const response = await fetch('/__ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { dataUrl?: unknown };
  if (typeof payload.dataUrl !== 'string') {
    throw new Error('no image in response');
  }
  return payload.dataUrl;
}
