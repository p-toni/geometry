export async function generateImage(prompt: string): Promise<string> {
  if (!import.meta.env.DEV) {
    throw new Error('AI gen is dev-only');
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType ?? 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('no image in response');
}
