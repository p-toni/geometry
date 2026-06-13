export interface GeneratedImage {
  url: string;
  id: string;
  bytes: number;
  mimeType: string;
  model?: string;
}

function waitForImage(url: string) {
  if (typeof Image === 'undefined') return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`generated image failed to load: ${url}`));
    image.src = url;
  });
}

export async function generateImage(prompt: string): Promise<GeneratedImage> {
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

  const payload = (await response.json()) as Partial<GeneratedImage>;
  if (
    typeof payload.url !== 'string' ||
    typeof payload.id !== 'string' ||
    typeof payload.bytes !== 'number' ||
    typeof payload.mimeType !== 'string'
  ) {
    throw new Error('no image in response');
  }

  const generated = payload as GeneratedImage;
  await waitForImage(generated.url);

  return generated;
}
